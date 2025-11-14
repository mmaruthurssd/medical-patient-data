
const PROJECT_ID = 'pdf-ocr-extraction-461917';

const DATASET_ID_EMAILS = "emails_dataset";
const TABLE_ID_EMAILS = "all_emails";

const DATASET_ID_CHATS = "chats_database";
const TABLE_ID_CHATS = "all_googlechats";

/**
 * Executes a BigQuery SQL query and returns flattened results
 *
 * @param {string} query - SQL query string
 * @param {number} [maxResults=1000] - Max rows per page
 * @return {Array<Object>} - Array of result objects
 */
function runBigQueryQuery_({ query, projectId }) {
  var maxResults = 10000;

  var queryRequest = {
    query: query,
    useLegacySql: false,
    maxResults: maxResults
  };

  var queryResults = BigQuery.Jobs.query(queryRequest, projectId);
  var jobId = queryResults.jobReference.jobId;

  // Wait until done
  while (!queryResults.jobComplete) {
    Utilities.sleep(1000);
    queryResults = BigQuery.Jobs.getQueryResults(projectId, jobId);
  }

  // Handle pagination (if no LIMIT was given, this could be big)
  var rows = queryResults.rows || [];
  while (queryResults.pageToken) {
    queryResults = BigQuery.Jobs.getQueryResults(projectId, jobId, {
      pageToken: queryResults.pageToken
    });
    rows = rows.concat(queryResults.rows || []);
  }

  queryResults.rows = rows;

  return flattenBigQueryResults_(queryResults);
}

/**
 * Recursively converts BigQuery field values into JS types
 */
function convertValue_(val, field) {
  if (val === null) return null;

  // Handle REPEATED (arrays)
  if (field.mode === "REPEATED") {
    return (val || []).map(v => convertValue_(v.v, { ...field, mode: "NULLABLE" }));
  }

  switch (field.type) {
    case "INTEGER":
    case "INT64":
      return parseInt(val, 10);

    case "FLOAT":
    case "FLOAT64":
    case "NUMERIC":
    case "BIGNUMERIC":
      return parseFloat(val);

    case "BOOL":
    case "BOOLEAN":
      return (val === "true");

    case "TIMESTAMP":
      return new Date(parseFloat(val) * 1000);

    case "DATE":
    case "DATETIME":
      return val;

    case "BYTES":
      return Utilities.base64Decode(val);

    case "RECORD":
      var obj = {};
      field.fields.forEach((subField, i) => {
        obj[subField.name] = convertValue_(val.f[i].v, subField);
      });
      return obj;

    default: // STRING and others
      return val;
  }
}

/**
 * Flattens BigQuery query results into JS objects
 */
function flattenBigQueryResults_(queryResults) {
  if (!queryResults.schema || !queryResults.schema.fields) return [];

  var schema = queryResults.schema.fields;
  var rows = queryResults.rows || [];

  return rows.map(row => {
    var obj = {};
    row.f.forEach((field, i) => {
      obj[schema[i].name] = convertValue_(field.v, schema[i]);
    });
    return obj;
  });
}


/**
 * Builds a BigQuery SQL query dynamically (supports nested/repeated fields)
 *
 * @param {string} datasetTable - Fully qualified table (e.g. `project.dataset.table`)
 * @param {Array<string>} fields - List of fields to SELECT (can include nested like "attachments.file_name")
 * @param {Array<Object>} filters - List of filter objects:
 *        [{ field: "attachments.ocr_text", operator: "CONTAINS", value: "invoice" }]
 * @param {number} [limit] - Optional row limit
 * @return {string} The generated SQL query
 */
function buildBigQueryQuery_({ fields, filters, limit, projectId, datasetId, tableId, sortField }) {

  // if (!limit) limit = 100;

  // If no fields provided, use *
  var selectClause = (fields && fields.length > 0)
    ? fields.join(", ")
    : "*";

  // helper to format a single value for SQL (quote & escape strings)
  function formatVal(v) {
    if (v === null || v === undefined) return "NULL";
    if (typeof v === "string") return "'" + v.replace(/'/g, "''") + "'";
    if (v instanceof Date) return "TIMESTAMP('" + v.toISOString().replace(/'/g, "''") + "')";
    return String(v);
  }

  // helper to extract start/end from various possible shapes
  function extractRange(value) {
    if (Array.isArray(value)) {
      return { start: value[0], end: value[1] };
    } else if (value && typeof value === "object" && ("from" in value || "to" in value)) {
      return { start: value.from, end: value.to };
    } else {
      throw new Error("BETWEEN filter requires value as [start,end] or {from:...,to:...}");
    }
  }

  var whereParts = [];

  if (filters && filters.length > 0) {
    filters.forEach(f => {

      // For single-value operators we use this (but BETWEEN handles its own shape)
      var val = (typeof f.value === "string")
        ? "'" + f.value.replace(/'/g, "''") + "'" // escape quotes
        : f.value;

      // Handle nested/repeated fields (attachments.*)
      if (f.field.startsWith("attachments.")) {
        var subField = f.field.split(".")[1];
        switch (f.operator) {
          case "EQUALS":
            whereParts.push(`EXISTS (SELECT 1 FROM UNNEST(attachments) a WHERE a.${subField} = ${val})`);
            break;
          case "CONTAINS":
            whereParts.push(`EXISTS (SELECT 1 FROM UNNEST(attachments) a WHERE LOWER(a.${subField}) LIKE LOWER('%${String(f.value).replace(/'/g, "''")}%'))`);
            break;

          case "DOES_NOT_CONTAIN":
            whereParts.push(`NOT EXISTS (SELECT 1 FROM UNNEST(attachments) a WHERE LOWER(a.${subField}) LIKE LOWER('%${String(f.value).replace(/'/g, "''")}%'))`);
            break;
          case "STARTS_WITH":
            whereParts.push(`EXISTS (SELECT 1 FROM UNNEST(attachments) a WHERE LOWER(a.${subField}) LIKE LOWER('${String(f.value).replace(/'/g, "''")}%'))`);
            break;
          case "ENDS_WITH":
            whereParts.push(`EXISTS (SELECT 1 FROM UNNEST(attachments) a WHERE LOWER(a.${subField}) LIKE LOWER('%${String(f.value).replace(/'/g, "''")}'))`);
            break;

          case "BETWEEN":
          case "NOT_BETWEEN": {
            var range = extractRange(f.value);
            var startVal = formatVal(range.start);
            var endVal = formatVal(range.end);
            var betweenExp = `a.${subField} BETWEEN ${startVal} AND ${endVal}`;
            if (f.operator === "BETWEEN") {
              whereParts.push(`EXISTS (SELECT 1 FROM UNNEST(attachments) a WHERE ${betweenExp})`);
            } else {
              whereParts.push(`NOT EXISTS (SELECT 1 FROM UNNEST(attachments) a WHERE ${betweenExp})`);
            }
            break;
          }

          default:
            throw new Error("Unsupported operator for nested field: " + f.operator);
        }
      } else {
        // Top-level fields
        switch (f.operator) {
          case "EQUALS":
            whereParts.push(`${f.field} = ${val}`);
            break;

          case "NOT_EQUALS":
            whereParts.push(`${f.field} != ${val}`);
            break;

          case "IS_NULL":
            whereParts.push(`${f.field} IS NULL`);
            break;

          case "IS_EMPTY":
            whereParts.push(`(${f.field} IS NULL OR ${f.field} = '')`);
            break;

          case "NOT_EQUALS_OR_NULL":
            whereParts.push(`(${f.field} IS NULL OR ${f.field} = '' OR ${f.field} != ${val})`);
            break;

          case "CONTAINS":
            whereParts.push(`LOWER(${f.field}) LIKE LOWER('%${String(f.value).replace(/'/g, "''")}%')`);
            break;

          case "DOES_NOT_CONTAIN":
            whereParts.push(`LOWER(${f.field}) NOT LIKE LOWER('%${String(f.value).replace(/'/g, "''")}%')`);
            break;

          case "STARTS_WITH":
            whereParts.push(`LOWER(${f.field}) LIKE LOWER('${String(f.value).replace(/'/g, "''")}%')`);
            break;

          case "ENDS_WITH":
            whereParts.push(`LOWER(${f.field}) LIKE LOWER('%${String(f.value).replace(/'/g, "''")}')`);
            break;

          case "IN":
            if (Array.isArray(f.value)) {
              var inList = f.value.map(v => `'${String(v).replace(/'/g, "''")}'`).join(", ");
              whereParts.push(`${f.field} IN (${inList})`);
            }
            break;

          case "BETWEEN":
          case "NOT_BETWEEN": {
            var range = extractRange(f.value);
            var startVal = formatVal(range.start);
            var endVal = formatVal(range.end);
            var betweenExp = `${f.field} BETWEEN ${startVal} AND ${endVal}`;
            if (f.operator === "BETWEEN") {
              whereParts.push(betweenExp);
            } else {
              whereParts.push(`NOT (${betweenExp})`);
            }
            break;
          }

          default:
            throw new Error("Unsupported operator: " + f.operator);
        }
      }
    });
  }

  var query = `SELECT ${selectClause} FROM \`${projectId}.${datasetId}.${tableId}\``;
  if (whereParts.length > 0) {
    query += " WHERE " + whereParts.join(" AND ");
  }

  if (sortField) {
    query += ` ORDER BY ${sortField} ASC`;
  }

  if (limit) {
    query += " LIMIT " + limit;
  }

  return query;
}


/**
 * Updates status in BigQuery for specific message_ids
 *
 * @param {string} projectId - GCP Project ID
 * @param {string} datasetTable - Fully qualified table name (project.dataset.table)
 * @param {Array<string>} messageIds - List of message_ids to update
 * @param {string} newStatus - Status value to set
 */
// function updateBigQueryStatus_({messageIds, newStatus, projectId, datasetId, tableId }) {
//   if (!messageIds || messageIds.length === 0) {
//     console.log("No messageIds provided for update");
//     return;
//   }

//   // Escape messageIds properly for SQL
//   var idList = messageIds.map(id => `'${String(id).replace(/' / g, "''")
  // } '`).join(", ");

//   var sql = `
//     UPDATE \`${projectId}.${datasetId}.${tableId}\`
//     SET status = '${newStatus.replace(/'/g, "''")}'
//     WHERE message_id IN (${idList})
//   `;

//   var queryRequest = {
//     query: sql,
//     useLegacySql: false
//   };

//   // Run the query
//   var queryResults = BigQuery.Jobs.query(queryRequest, projectId);

//   // Wait for job completion
//   var jobId = queryResults.jobReference.jobId;
//   while (!queryResults.jobComplete) {
//     Utilities.sleep(1000);
//     queryResults = BigQuery.Jobs.getQueryResults(projectId, jobId);
//   }

//   return queryResults;
// }

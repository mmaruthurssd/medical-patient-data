
const PROJECT_ID = 'pdf-ocr-extraction-461917';
const DATASET_ID = "cms_dataset";
const TABLE_ID = "cmsdata_locations";
const TABLE_ID_GEO = "cmsdata_geocodes";

/**
 * Insert rows into BigQuery table
 */
function insertRowsToBigQuery_(projectId, datasetId, tableId, rows) {
  var bigquery = BigQuery;
  var response = bigquery.Tabledata.insertAll(
    {
      rows: rows
    },
    projectId,
    datasetId,
    tableId
  );

  if (response.insertErrors) {
    Logger.log(JSON.stringify(response.insertErrors, null, 2));
  } else {
    Logger.log(`${rows.length} Rows inserted successfully`);
    return true;
  }
}

/**
 * Get existing message_ids from BigQuery safely (handles paging & batching)
 */
function getExistingIds_(ids) {
  const existing = new Set();
  const CHUNK_SIZE = 10000; // keep comfortably under request size limits
  const MAX_RESULTS = 10000; // rows per page to retrieve

  for (let i = 0; i < ids.length; i += CHUNK_SIZE) {
    const batch = ids.slice(i, i + CHUNK_SIZE);

    const sql = `
      SELECT DISTINCT search
      FROM \`${PROJECT_ID}.${DATASET_ID}.${TABLE_ID}\`
      WHERE search IN UNNEST(@ids)
    `;

    const request = {
      query: sql,
      useLegacySql: false,
      parameterMode: "NAMED",
      queryParameters: [{
        name: "ids",
        parameterType: { type: "ARRAY", arrayType: { type: "STRING" } },
        parameterValue: { arrayValues: batch.map(id => ({ value: id })) }
      }],
      // Not required, but keeps pages large to reduce calls
      maxResults: MAX_RESULTS
    };

    // Kick off / run the query
    let res = BigQuery.Jobs.query(request, PROJECT_ID);
    const jobId = res.jobReference.jobId;

    // Wait for completion if needed
    while (!res.jobComplete) {
      Utilities.sleep(500); // half a second
      res = BigQuery.Jobs.getQueryResults(PROJECT_ID, jobId, { maxResults: MAX_RESULTS });
    }

    // First page
    if (res.rows) {
      for (const r of res.rows) existing.add(r.f[0].v);
    }

    // Remaining pages
    let pageToken = res.pageToken;
    while (pageToken) {
      const next = BigQuery.Jobs.getQueryResults(PROJECT_ID, jobId, {
        pageToken,
        maxResults: MAX_RESULTS
      });
      if (next.rows) {
        for (const r of next.rows) existing.add(r.f[0].v);
      }
      pageToken = next.pageToken;
    }
  }

  return Array.from(existing);
}

function getExisting_geo_(ids) {
  const results = [];

  const CHUNK_SIZE = 10000;
  const MAX_RESULTS = 10000;

  for (let i = 0; i < ids.length; i += CHUNK_SIZE) {
    const batch = ids.slice(i, i + CHUNK_SIZE);

    const sql = `
      SELECT * FROM \`${PROJECT_ID}.${DATASET_ID}.${TABLE_ID_GEO}\`
      WHERE Address IN UNNEST(@ids)
    `;

    const request = {
      query: sql,
      useLegacySql: false,
      parameterMode: "NAMED",
      queryParameters: [{
        name: "ids",
        parameterType: { type: "ARRAY", arrayType: { type: "STRING" } },
        parameterValue: { arrayValues: batch.map(id => ({ value: id })) }
      }],
      maxResults: MAX_RESULTS
    };

    let res = BigQuery.Jobs.query(request, PROJECT_ID);
    const jobId = res.jobReference.jobId;

    while (!res.jobComplete) {
      Utilities.sleep(500);
      res = BigQuery.Jobs.getQueryResults(PROJECT_ID, jobId, { maxResults: MAX_RESULTS });
    }

    const schemaFields = res.schema.fields.map(f => f.name); // Get column names

    // first page
    if (res.rows) {
      for (const r of res.rows) {

        const rowObj = {};
        r.f.forEach((field, idx) => {
          rowObj[schemaFields[idx]] = field.v; // Use actual names
        });
        results.push(rowObj);
      }
    }

    // remaining pages
    let pageToken = res.pageToken;
    while (pageToken) {
      const next = BigQuery.Jobs.getQueryResults(PROJECT_ID, jobId, {
        pageToken,
        maxResults: MAX_RESULTS
      });
      if (next.rows) {
        for (const r of next.rows) {
          const rowObj = {};
          r.f.forEach((field, idx) => {
            rowObj[schemaFields[idx]] = field.v; // Use actual names
          });
          results.push(rowObj);
        }
      }
      pageToken = next.pageToken;
    }
  }

  return results;
}

function getExisting_locations_(ids) {
  const results = [];

  const CHUNK_SIZE = 10000;
  const MAX_RESULTS = 10000;

  for (let i = 0; i < ids.length; i += CHUNK_SIZE) {
    const batch = ids.slice(i, i + CHUNK_SIZE);

    const sql = `
      SELECT * FROM \`${PROJECT_ID}.${DATASET_ID}.${TABLE_ID}\`
      WHERE search IN UNNEST(@ids)
    `;

    const request = {
      query: sql,
      useLegacySql: false,
      parameterMode: "NAMED",
      queryParameters: [{
        name: "ids",
        parameterType: { type: "ARRAY", arrayType: { type: "STRING" } },
        parameterValue: { arrayValues: batch.map(id => ({ value: id })) }
      }],
      maxResults: MAX_RESULTS
    };

    let res = BigQuery.Jobs.query(request, PROJECT_ID);
    const jobId = res.jobReference.jobId;

    while (!res.jobComplete) {
      Utilities.sleep(500);
      res = BigQuery.Jobs.getQueryResults(PROJECT_ID, jobId, { maxResults: MAX_RESULTS });
    }

    const schemaFields = res.schema.fields.map(f => f.name); // Get column names

    // first page
    if (res.rows) {
      for (const r of res.rows) {

        const rowObj = {};
        r.f.forEach((field, idx) => {
          rowObj[schemaFields[idx]] = field.v; // Use actual names
        });
        results.push(rowObj);
      }
    }

    // remaining pages
    let pageToken = res.pageToken;
    while (pageToken) {
      const next = BigQuery.Jobs.getQueryResults(PROJECT_ID, jobId, {
        pageToken,
        maxResults: MAX_RESULTS
      });
      if (next.rows) {
        for (const r of next.rows) {
          const rowObj = {};
          r.f.forEach((field, idx) => {
            rowObj[schemaFields[idx]] = field.v; // Use actual names
          });
          results.push(rowObj);
        }
      }
      pageToken = next.pageToken;
    }
  }

  return results;
}

function buildBigQueryQuery_({ fields, filters, limit }) {

  // If no fields provided, use *
  var selectClause = (fields && fields.length > 0)
    ? fields.join(", ")
    : "*";

  // helper to format a single value for SQL (quote & escape strings)
  function formatVal(v) {
    if (v === null || v === undefined) return "NULL";
    if (typeof v === "number") return String(v);                      // numeric -> no quotes
    if (typeof v === "string") return "'" + v.replace(/'/g, "''") + "'"; // string -> quoted/escaped
    if (v instanceof Date) return "TIMESTAMP('" + v.toISOString().replace(/'/g, "''") + "')";
    return "'" + String(v).replace(/'/g, "''") + "'";
  }

  // helper to format a list for IN (...)
  function formatValList(arr) {
    return arr.map(formatVal).join(", ");
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

      // Top-level fields
      switch (f.operator) {
        case "EQUALS":
          if (Array.isArray(f.value)) {
            if (f.value.length === 0) break; // ignore empty list
            whereParts.push(`${f.field} IN (${formatValList(f.value)})`);
          } else {
            whereParts.push(`${f.field} = ${val}`);
          }
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

        case "STARTS_WITH":
          whereParts.push(`LOWER(${f.field}) LIKE LOWER('${String(f.value).replace(/'/g, "''")}%')`);
          break;

        case "ENDS_WITH":
          whereParts.push(`LOWER(${f.field}) LIKE LOWER('%${String(f.value).replace(/'/g, "''")}')`);
          break;

        case "IN":
          if (Array.isArray(f.value)) {
            if (f.value.length === 0) break; // ignore empty list
            var inList = formatValList(f.value);
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
    });
  }

  var query = `SELECT ${selectClause} FROM \`${PROJECT_ID}.${DATASET_ID}.${TABLE_ID}\``;
  if (whereParts.length > 0) {
    query += " WHERE " + whereParts.join(" AND ");
  }
  if (limit) {
    query += " LIMIT " + limit;
  }

  return query;
}

/**
 * Executes a BigQuery SQL query and returns flattened results
 *
 * @param {string} query - SQL query string
 * @param {number} [maxResults=1000] - Max rows per page
 * @return {Array<Object>} - Array of result objects
 */
function runBigQueryQuery_(query) {
  var maxResults = 1000;

  var queryRequest = {
    query: query,
    useLegacySql: false,
    maxResults: maxResults
  };

  var queryResults = BigQuery.Jobs.query(queryRequest, PROJECT_ID);
  var jobId = queryResults.jobReference.jobId;

  // Wait until done
  while (!queryResults.jobComplete) {
    Utilities.sleep(1000);
    queryResults = BigQuery.Jobs.getQueryResults(PROJECT_ID, jobId);
  }

  // Handle pagination (if no LIMIT was given, this could be big)
  var rows = queryResults.rows || [];
  while (queryResults.pageToken) {
    queryResults = BigQuery.Jobs.getQueryResults(PROJECT_ID, jobId, {
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

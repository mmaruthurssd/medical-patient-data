
const vScriptStartTime = new Date().getTime();

const PROJECT_ID = 'pdf-ocr-extraction-461917';
const DATASET_ID = "chats_database";
const TABLE_ID = "all_googlechats";

/**
 * Get already existing record_ids from BigQuery
 */
function getExistingIds_(ids) {

  var sql = `
    SELECT message_name
    FROM \`${PROJECT_ID}.${DATASET_ID}.${TABLE_ID}\`
    WHERE message_name IN UNNEST(@ids)
  `;

  var request = {
    query: sql,
    useLegacySql: false,
    parameterMode: "NAMED",
    queryParameters: [
      {
        name: "ids",
        parameterType: { type: "ARRAY", arrayType: { type: "STRING" } },
        parameterValue: { arrayValues: ids.map(id => ({ value: id })) }
      }
    ]
  };

  var queryResults = BigQuery.Jobs.query(request, PROJECT_ID);
  var rows = queryResults.rows || [];
  var existing = rows.map(r => r.f[0].v);
  return existing;
}

/**
 * Insert rows into BigQuery table
 */
function insertRowsToBigQuery_(rows) {
  var bigquery = BigQuery;
  var response = bigquery.Tabledata.insertAll(
    {
      rows: rows
    },
    PROJECT_ID,
    DATASET_ID,
    TABLE_ID
  );
  if (response.insertErrors) {
    Logger.log(JSON.stringify(response.insertErrors, null, 2));
    return false;
  } else {
    Logger.log(`${rows.length} Rows inserted successfully`);
    return true;
  }
}

function clearBigQueryTable() {
  return;
  // var projectId = PROJECT_ID;
  // var datasetId = DATASET_ID;
  // var tableId = TABLE_ID;

  // var query = `
  //   TRUNCATE TABLE \`${projectId}.${datasetId}.${tableId}\`
  // `;

  // var request = {
  //   query: query,
  //   useLegacySql: false
  // };

  // var queryResults = BigQuery.Jobs.query(request, projectId);
  // var jobId = queryResults.jobReference.jobId;

  // // Wait for job to finish
  // var sleepTime = 500;
  // while (!queryResults.jobComplete) {
  //   Utilities.sleep(sleepTime);
  //   sleepTime *= 2;
  //   queryResults = BigQuery.Jobs.getQueryResults(projectId, jobId);
  // }

  // Logger.log("Cleared all rows from table: " + tableId);
}

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



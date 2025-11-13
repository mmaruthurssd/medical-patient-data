// Email Categorization v1.2.7

const vMiliPerDay = 1000 * 60 * 60 * 24;
const vMiliPerMin = 1000 * 60;

const vScriptStartTime = new Date().getTime();

const PROJECT_ID = 'pdf-ocr-extraction-461917';
const DATASET_ID = "emails_dataset";
const TABLE_ID = "all_emails";

const prop_ScriptRunning = "scriptRunningStatus";

function fmt_(d) {
  return d.getFullYear() + "/" + ("0" + (d.getMonth() + 1)).slice(-2) + "/" + ("0" + d.getDate()).slice(-2);
}

function getNewDay_(dateStr, diff) {
  var date = new Date(dateStr);

  var newDay = new Date(date);
  newDay.setDate(date.getDate() + diff);

  return newDay;
}

function updateBigQuery_15mins() {
  // return;
  try {
    exportEmailsToBigQuery("newer_than:1d in:inbox", true);
  } catch (err) {
    console.log(err);
  }
}

function updateBigQuery_hourly() {
  return;
  try {
    exportEmailsToBigQuery("newer_than:1d in:inbox", false);
  } catch (err) {
    console.log(err);
  }
}

function updateBigQuery_oldData() {
  return;
  if (!scriptHandler_(false)) return;
  extractOldDays();
  scriptHandler_release_();
}

function extractOldDays() {
  try {
    var dateStr = getProperty_("extractionDate");
    var dateStrFrom = fmt_(getNewDay_(dateStr, 0));
    var dateStrT0 = fmt_(getNewDay_(dateStr, 1));

    var query = `after: ${dateStrFrom} before: ${dateStrT0}`;

    var status = exportEmailsToBigQuery(query);

    if (status) {
      setProperty_("extractionDate", fmt_(getNewDay_(dateStr, -1)));
      console.log(`${dateStrFrom} - complete`);

      if (!isOverTime_(vMiliPerMin * 14)) {
        extractOldDays();
      }
    }

  } catch (err) {
    console.log(err);
  }
}

function exportEmailsToBigQuery(query, bReturn = false) {
  console.log(query);

  SpreadsheetApp.flush();

  var maxThreads = 80;
  var vStartIndex = 0;

  while (true) {
    if (isOverTime_(vMiliPerMin * 14)) break;

    var threads = GmailApp.search(query, vStartIndex, maxThreads);

    if (threads.length == 0) return true;

    allMessages = [];
    var allMessageIds = [];

    threads.forEach(function (thread) {
      var messages = thread.getMessages();
      messages.forEach(function (msg, idx) {

        if (msg.getFrom().toString().indexOf("noreply-apps-scripts-notifications@google.com") != -1 && msg.getSubject().toString().indexOf("Summary of failures for Google Apps Script:") != -1) return;

        if (msg.getSubject().indexOf("<ENCRYPTED> Google sheets") != -1) return;

        allMessages.push(msg);
        allMessageIds.push(msg.getId());
      });
    });

    // setProperty_("messagesCount", Number(getProperty_("messagesCount")) + allMessages.length);

    // Get already stored ones
    var existing = getExistingMessageIds_(allMessageIds);

    console.log(`threads: ${threads.length} | messages: ${allMessages.length} | duplicate: ${existing.length}`);

    if (bReturn && allMessages.length == existing.length) break;

    var rows = [];
    var allEmails = [];

    allMessages.forEach(function (msg, idx) {
      if (isOverTime_(vMiliPerMin * 14)) return;

      if (existing.includes(msg.getId())) return;

      var attachmentsArr = [];
      var attachments = msg.getAttachments();

      attachments.forEach(function (atch) {
        if (atch.getName().toString() != "" && right_(atch.getName().toString(), 5) != ".html") {
          var text = getAttachmentText_(atch);

          var hashBase64 = "";

          try {
            var hash = Utilities.computeDigest(
              Utilities.DigestAlgorithm.SHA_256,
              atch.getBytes()
            );
            hashBase64 = Utilities.base64Encode(hash);
          } catch (err) { }

          attachmentsArr.push({
            file_name: atch.getName(),
            file_hash: hashBase64,
            ocr_text: text,
            file_type: atch.getContentType()
          });
        }
      });

      var row = {
        json: {
          record_id: createNewId_(),
          record_time: new Date().toISOString(),
          thread_id: msg.getThread().getId(),
          message_id: msg.getId(),
          email_address_from: getProperEmails_(msg.getFrom()),
          email_address_to: getProperEmails_(msg.getTo()),
          email_address_cc: getProperEmails_(msg.getCc()),
          email_address_bcc: getProperEmails_(msg.getBcc()),
          email_subject: msg.getSubject(),
          email_body: msg.getPlainBody(),
          email_body_html: msg.getBody(),
          attachments: attachmentsArr,
          email_received_date: msg.getDate().toISOString()
        }
      };

      if (row.json.email_address_from != "") {
        var splitEmails = row.json.email_address_from.toString().split(",");
        splitEmails.forEach(ee => {
          if (!allEmails.includes(ee)) {
            allEmails.push(ee);
          }
        });
      }

      if (row.json.email_address_to != "") {
        var splitEmails = row.json.email_address_to.toString().split(",");
        splitEmails.forEach(ee => {
          if (!allEmails.includes(ee)) {
            allEmails.push(ee);
          }
        });
      }

      if (row.json.email_address_cc != "") {
        var splitEmails = row.json.email_address_cc.toString().split(",");
        splitEmails.forEach(ee => {
          if (!allEmails.includes(ee)) {
            allEmails.push(ee);
          }
        });
      }

      if (row.json.email_address_bcc != "") {
        var splitEmails = row.json.email_address_bcc.toString().split(",");
        splitEmails.forEach(ee => {
          if (!allEmails.includes(ee)) {
            allEmails.push(ee);
          }
        });
      }

      rows.push(row);
    });

    console.log(`Unique emails: ${allEmails.length}`);

    recordNewEmailAddresses_(allEmails);

    console.log(`New rows: ${rows.length}`);

    if (rows.length > 0) {
      insertRowsToBigQuery_(PROJECT_ID, DATASET_ID, TABLE_ID, rows);
    }

    vStartIndex += threads.length;
  }

}

function recreatePartitionedTable() {
  return;
  var newTable = "all_emails";

  var query = `
    CREATE TABLE \`${PROJECT_ID}.${DATASET_ID}.${newTable}\`
    PARTITION BY DATE(email_received_date)
    CLUSTER BY email_address_from, status
    AS
    SELECT * FROM \`${PROJECT_ID}.${DATASET_ID}.${TABLE_ID}\`
  `;

  var request = {
    query: query,
    useLegacySql: false
  };

  var queryResults = BigQuery.Jobs.query(request, PROJECT_ID);
  Logger.log("New partitioned table created: " + newTable);
}


function getProperEmails_(emails) {
  if (!emails) return "";

  // Split by comma or semicolon
  var parts = emails.split(/[;,]/);

  var cleaned = parts.map(function (piece) {
    piece = piece.trim();

    // case 1: Name <email>
    var match = piece.match(/<([^>]+)>/);
    if (match) return match[1];

    // case 2: contains @ (looks like email already)
    if (/@/.test(piece)) return piece;

    // case 3: just a name → skip (no email)
    return "";
  }).filter(function (e) { return e.length > 0; });

  return cleaned.join(",");
}

function recordNewEmailAddresses_(allEmails) {
  SpreadsheetApp.flush();
  var sheetEmailList = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Email List");
  var allExistingEmails = sheetEmailList.getRange(1, 1, sheetEmailList.getLastRow() + 1, 1).getValues().map(r => r[0].toString());

  var allNewEmails = [];

  allEmails.forEach(email => {
    if (!allExistingEmails.includes(email)) {
      allNewEmails.push([email]);
      allExistingEmails.push(email);
    }
  });

  if (allNewEmails.length > 0) {
    var vRow = sheetEmailList.getLastRow() + 1;
    sheetEmailList.getRange(vRow, 1, allNewEmails.length, allNewEmails[0].length).setValues(allNewEmails);
  }

}

/**
 * Get already existing message_ids from BigQuery
 */
function getExistingMessageIds_(messageIds) {
  // messageIds is an array of strings
  var sql = `
    SELECT message_id
    FROM \`${PROJECT_ID}.${DATASET_ID}.${TABLE_ID}\`
    WHERE message_id IN UNNEST(@ids)
  `;

  var request = {
    query: sql,
    useLegacySql: false,
    parameterMode: "NAMED",
    queryParameters: [
      {
        name: "ids",
        parameterType: { type: "ARRAY", arrayType: { type: "STRING" } },
        parameterValue: { arrayValues: messageIds.map(id => ({ value: id })) }
      }
    ]
  };

  var queryResults = BigQuery.Jobs.query(request, PROJECT_ID);
  var rows = queryResults.rows || [];
  var existing = rows.map(r => r.f[0].v);
  return existing;
}

function updateMultipleEmails_(projectId, datasetId, tableId, messageIds, newSubject) {
  // Build IN clause dynamically
  var inClause = messageIds.map(id => `'${id}'`).join(", ");

  var query = `
    UPDATE \`${projectId}.${datasetId}.${tableId}\`
    SET email_subject = @newSubject
    WHERE message_id IN (${inClause})
  `;

  var request = {
    query: query,
    useLegacySql: false,
    parameterMode: "NAMED",
    queryParameters: [
      {
        name: "newSubject",
        parameterType: { type: "STRING" },
        parameterValue: { value: newSubject }
      }
    ]
  };

  var job = BigQuery.Jobs.query(request, projectId);
  Logger.log(JSON.stringify(job, null, 2));
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

function buildBigQueryQuery_({ fields, filters, limit }) {

  if (!limit) limit = 10;

  // If no fields provided, use *
  var selectClause = (fields && fields.length > 0)
    ? fields.join(", ")
    : "*";

  var whereParts = [];

  if (filters && filters.length > 0) {
    filters.forEach(f => {
      var val = typeof f.value === "string"
        ? "'" + f.value.replace(/'/g, "''") + "'"
        : f.value;

      // Handle nested/repeated fields (attachments.*)
      if (f.field.startsWith("attachments.")) {
        var subField = f.field.split(".")[1];
        switch (f.operator) {
          case "EQUALS":
            whereParts.push(`EXISTS (SELECT 1 FROM UNNEST(attachments) a WHERE a.${subField} = ${val})`);
            break;
          case "CONTAINS":
            whereParts.push(`EXISTS (SELECT 1 FROM UNNEST(attachments) a WHERE LOWER(a.${subField}) LIKE LOWER('%${f.value}%'))`);
            break;
          case "STARTS_WITH":
            whereParts.push(`EXISTS (SELECT 1 FROM UNNEST(attachments) a WHERE LOWER(a.${subField}) LIKE LOWER('${f.value}%'))`);
            break;
          case "ENDS_WITH":
            whereParts.push(`EXISTS (SELECT 1 FROM UNNEST(attachments) a WHERE LOWER(a.${subField}) LIKE LOWER('%${f.value}'))`);
            break;
          default:
            throw new Error("Unsupported operator for nested field: " + f.operator);
        }
      } else {
        // Top-level fields
        switch (f.operator) {
          case "EQUALS":
            whereParts.push(`${f.field} = ${val}`);
            break;
          case "CONTAINS":
            whereParts.push(`LOWER(${f.field}) LIKE LOWER('%${f.value}%')`);
            break;
          case "STARTS_WITH":
            whereParts.push(`LOWER(${f.field}) LIKE LOWER('${f.value}%')`);
            break;
          case "ENDS_WITH":
            whereParts.push(`LOWER(${f.field}) LIKE LOWER('%${f.value}'))`);
            break;
          case "IN":
            if (Array.isArray(f.value)) {
              var inList = f.value.map(v => `'${String(v).replace(/'/g, "''")}'`).join(", ");
              whereParts.push(`${f.field} IN (${inList})`);
            }
            break;
          default:
            throw new Error("Unsupported operator: " + f.operator);
        }
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
  }
}

/**
 * Extract text from attachments (simplified)
 */
function getAttachmentText_(blob) {
  var mimeType = blob.getContentType();
  var text = "";

  if (mimeType.startsWith("text/") || mimeType === "application/json") {
    text = blob.getDataAsString();

  } else if (mimeType === "application/pdf") {
    try {
      var file = DriveApp.createFile(blob);
      var docFile = Drive.Files.insert(
        { title: file.getName(), mimeType: mimeType },
        blob,
        { convert: true }
      );
      var doc = DocumentApp.openById(docFile.id);
      text = doc.getBody().getText();
      DriveApp.getFileById(docFile.id).setTrashed(true);
    } catch (e) {
      text = "[PDF OCR required]";
    }
  } else if (mimeType.startsWith("image/")) {
    text = "[Image OCR required]";
  } else {
    text = "[NA]";
  }

  return text;
}

function createNewId_() {
  const props = PropertiesService.getScriptProperties();
  const record_ids = props.getProperty('record_ids');

  var lastID = 0;
  if (record_ids) {
    lastID = Number(record_ids);
  }

  var newID = lastID + 1;

  props.setProperty('record_ids', newID.toString());

  return newID;
}

// function clearBigQueryTable() {
//   return;

//   var projectId = PROJECT_ID;
//   var datasetId = DATASET_ID;
//   var tableId = TABLE_ID;

//   var query = `
//     TRUNCATE TABLE \`${projectId}.${datasetId}.${tableId}\`
//   `;

//   return;

//   var request = {
//     query: query,
//     useLegacySql: false
//   };

//   return;


//   var queryResults = BigQuery.Jobs.query(request, projectId);
//   var jobId = queryResults.jobReference.jobId;

//   // Wait for job to finish
//   var sleepTime = 500;
//   while (!queryResults.jobComplete) {
//     Utilities.sleep(sleepTime);
//     sleepTime *= 2;
//     queryResults = BigQuery.Jobs.getQueryResults(projectId, jobId);
//   }

//   Logger.log("Cleared all rows from table: " + tableId);
// }

function getProperty_(prop) {
  return PropertiesService.getScriptProperties().getProperty(prop)
}

function setProperty_(prop, value) {
  PropertiesService.getScriptProperties().setProperty(prop, value);
}

function isOverTime_(vTimeOutMili = 240000) {
  const vCurTime = new Date().getTime();
  const vRunTime = vCurTime - vScriptStartTime;
  return vRunTime > vTimeOutMili;
}


function scriptHandler_(instantReject) {
  var sMiliSecs = new Date().getTime().toFixed(0).toString();

  var prop = getProperty_(prop_ScriptRunning);

  var bLoop = true;

  if (prop != null) {
    while (bLoop) {
      if (prop != "") {
        prop = getProperty_(prop_ScriptRunning);
        if ((Number(sMiliSecs) - Number(prop)) > (1000 * 60 * 18)) {
          setProperty_(prop_ScriptRunning, sMiliSecs);
          bLoop = false;
        } else if (instantReject == true) {
          ss.toast("System is already busy running some script, Please try again after few mins");
          return false;
        }
      } else {
        setProperty_(prop_ScriptRunning, sMiliSecs);
        bLoop = false;
      }

      if (isOverTime_(vMiliPerMin * 14)) return;

      Utilities.sleep(1000);
    }
  } else {
    setProperty_(prop_ScriptRunning, sMiliSecs);
  }

  Utilities.sleep(1000);

  var prop = getProperty_(prop_ScriptRunning);

  if (prop != sMiliSecs) {
    return;
  }

  return true;
}

function scriptHandler_release_() {
  setProperty_(prop_ScriptRunning, "");
}

function right_(sData, vLen) {
  return sData.substring(sData.length - vLen, sData.length);
}

function left_(sData, vLen) {
  return sData.toString().substring(0, vLen);
}

function makeObjHeaderDetails_({ allHeaders, bLowerCase }) {
  if (bLowerCase) {
    allHeaders = allHeaders.map(function (r) { return r.toString().trim().toLowerCase(); });
  }

  var obj = {};
  allHeaders.map(function (h, x) {
    if (h.toString().trim() != -1) {
      obj[h.toString().trim()] = {};
      obj[h.toString().trim()].columnIndex = x;
      obj[h.toString().trim()].columnNumber = x + 1;
      obj[h.toString().trim()].columnName = getColumnName_(x + 1);
      obj[h.toString().trim()].header = h;
    }
  });

  return obj;
}

function getColumnName_(columnNumber) {
  if (columnNumber < 1) return "";

  let columnName = "";
  while (columnNumber > 0) {
    let remainder = (columnNumber - 1) % 26;
    columnName = String.fromCharCode(65 + remainder) + columnName;
    columnNumber = Math.floor((columnNumber - 1) / 26);
  }
  return columnName;
}
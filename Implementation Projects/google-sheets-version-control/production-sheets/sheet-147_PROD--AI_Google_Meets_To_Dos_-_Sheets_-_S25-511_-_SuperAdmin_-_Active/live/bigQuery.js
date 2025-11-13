
const PROJECT_ID = 'pdf-ocr-extraction-461917';
const DATASET_ID = "emails_dataset";
const TABLE_ID = "all_emails";

function scheduleForMeetings() {
  if (!scriptHandler_(false)) return;

  try {
    getMeetingsFromBigQuery();
  } catch (err) {
    console.log(err);
  }

  try {
    extractMeetingDetailsFromAI();
  } catch (err) {
    console.log(err);
  }

  scriptHandler_release_();
}

// function scheduleForBigQuery() {
//   if (!scriptHandler_(false)) return;

//   try {
//     getMeetingsFromBigQuery();
//   } catch (err) {
//     console.log(err);
//   }

//   scriptHandler_release_();
// }

function getMeetingsFromBigQuery() {
  var allNewMeetings = [];

  var fields = [
    "message_id"
    , "email_subject"
    , "email_address_to"
    , "email_body_html"
  ];

  var sDateTo = Utilities.formatDate(new Date(new Date().setDate(new Date().getDate() + 1)), Session.getScriptTimeZone(), "yyyy-MM-dd");
  var sDateFrom = Utilities.formatDate(new Date(new Date().setDate(new Date().getDate() - 1)), Session.getScriptTimeZone(), "yyyy-MM-dd");

  // sDateTo = "2025-05-01";
  // sDateFrom = "2025-04-01";

  var limit = 100;

  var allResults = [];

  //>>
  var filters = [
    { field: "email_address_from", operator: "CONTAINS", value: "gemini-notes@google.com" }
    , { field: "email_subject", operator: "STARTS_WITH", value: "Notes: Meeting" }
    , { field: "status", operator: "NOT_EQUALS_OR_NULL", value: "processed" }
    , { field: "timestamp_trunc(email_received_date,DAY)", operator: "BETWEEN", value: [sDateFrom, sDateTo] }
  ];

  var query = buildBigQueryQuery_({ filters: filters, fields, limit });
  console.log(query);
  var results = runBigQueryQuery_(query);

  if (results.length > 0) {
    allResults = allResults.concat(results);
  }
  //<<

  //>>
  var filters2 = [
    { field: "email_address_from", operator: "CONTAINS", value: "meetings-noreply@google.com" }
    , { field: "email_subject", operator: "STARTS_WITH", value: "Meeting records" }
    , { field: "status", operator: "NOT_EQUALS_OR_NULL", value: "processed" }
    , { field: "timestamp_trunc(email_received_date,DAY)", operator: "BETWEEN", value: [sDateFrom, sDateTo] }
  ];

  var query = buildBigQueryQuery_({ filters: filters2, fields, limit });
  console.log(query);
  var results = runBigQueryQuery_(query);

  if (results.length > 0) {
    allResults = allResults.concat(results);
  }
  //<<

  if (allResults.length == 0) return;

  var allProcessedMessageIds = [];
  var allErrorLog = [];

  allResults.forEach(r => {
    try {
      var message_id = r.message_id;
      var email_subject = r.email_subject;
      var email_address_to = r.email_address_to;
      var email_body_html = r.email_body_html;

      var links = getUniques_(extractLinks_(email_body_html));
      var ids = getUniques_(getFileIds_(links));

      console.log(email_address_to);

      var accessEmailAddress = email_address_to.toString().split(",")[0];
      moveMultipleFilesIntoSharedDrive_({ ids, accessEmailAddress });

      var fileDetails = getFilesDetails_(ids);

      if (!fileDetails) {
        allErrorLog.push([message_id, email_subject, email_address_to, JSON.stringify(links)]);
        return;
      }

      var meetingId = fileDetails.meetingId;
      var meetingNotesFile = fileDetails.meetingNotesFile;
      var meetingRecordingFile = fileDetails.meetingRecordingFile;

      if (!meetingNotesFile && !meetingRecordingFile) {
        allErrorLog.push([message_id, email_subject, email_address_to, JSON.stringify(links)]);
        return;
      }

      //>>
      var dateAndTime = extractDateTime_(email_subject);

      var sDate = "";
      var sTime = "";
      var sRecordID = "";

      if (dateAndTime) {
        sDate = dateAndTime.dateString;
        sTime = dateAndTime.timeString;
      } else {
        if (meetingNotesFile) {
          var dateAndTime = extractDateTime_(meetingNotesFile.getName());
          if (dateAndTime) {
            sDate = dateAndTime.dateString;
            sTime = dateAndTime.timeString;
          }
        }
      }

      if (sDate && sTime) {
        sRecordID = Utilities.formatDate(new Date(`${sDate} ${sTime}`), Session.getScriptTimeZone(), "yyyyMMddHHmm");
      }

      //<<

      allNewMeetings.push({ meetingId, meetingNotesFile, meetingRecordingFile, sDate, sTime, sRecordID });
      allProcessedMessageIds.push(message_id);
    } catch (err) {
      console.log(err);
    }
  });

  if (allErrorLog.length > 0) {
    recordToErrorLog_(allErrorLog);
  }

  if (allNewMeetings.length > 0) {
    recordMeetingsIntoSheet_(allNewMeetings);
    try {
      updateBigQueryStatus_(allProcessedMessageIds, "processed");
    } catch (err) {
      console.log(err);
    }
  }
}

function recordToErrorLog_(allErrorLog) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Error Email Log");

    if (allErrorLog.length > 0) {
      var vRow = sheet.getLastRow() + 1;
      sheet.getRange(vRow, 1, allErrorLog.length, allErrorLog[0].length).setValues(allErrorLog);
      sheet.getDataRange().removeDuplicates();
    }
  } catch (err) {
    console.log(err);
  }
}

function recordMeetingsIntoSheet_(allNewMeetings) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Google Meet List");

  var allHeaderObj = makeObjHeaderDetails_FromSheet({ sheet, bRich: true });

  var allData = sheet.getDataRange().getRichTextValues();
  var allDataObj = makeObjectData_(allData, true);

  var vColumns = allData[0].length;

  var allDocIdMap = [];
  var allVideoIdMap = [];

  allDataObj.forEach(r => {
    //>>
    var url = r["AI Meeting Note Doc"].getLinkUrl();
    if (url) {
      var id = getGoogleDriveId_(url);
      if (id) {
        allDocIdMap.push(id);
      }
    }
    //<<
    //>>
    var url = r["Google Meet Recording Link"].getLinkUrl();
    if (url) {
      var id = getGoogleDriveId_(url);
      if (id) {
        allVideoIdMap.push(id);
      }
    }
    //<<

  });

  var allDataRichOutput = [];

  allNewMeetings.forEach(r => {
    var meetingId = r.meetingId;
    var meetingNotesFile = r.meetingNotesFile;
    var meetingRecordingFile = r.meetingRecordingFile;
    var sDate = r.sDate;
    var sTime = r.sTime;
    var sRecordID = r.sRecordID;

    var bFound = false;

    if (meetingNotesFile) {
      if (allDocIdMap.includes(meetingNotesFile.getId())) {
        bFound = true;
      }
      allDocIdMap.push(meetingNotesFile.getId());
    }

    if (meetingRecordingFile) {
      if (allVideoIdMap.includes(meetingRecordingFile.getId())) {
        bFound = true;
      }
      allVideoIdMap.push(meetingRecordingFile.getId());
    }

    if (!meetingNotesFile && !meetingRecordingFile) return;

    if (bFound) return;


    var richText = SpreadsheetApp.newRichTextValue().setText("").build();
    var outputRow = new Array(vColumns).fill(richText);

    if (allHeaderObj["Meeting ID"]) {
      var richText = SpreadsheetApp.newRichTextValue().setText(meetingId).build();
      outputRow[allHeaderObj["Meeting ID"].columnIndex] = richText;
    }

    if (allHeaderObj["Date"]) {
      var richText = SpreadsheetApp.newRichTextValue().setText(sDate).build();
      outputRow[allHeaderObj["Date"].columnIndex] = richText;
    }

    if (allHeaderObj["Time"]) {
      var richText = SpreadsheetApp.newRichTextValue().setText(sTime).build();
      outputRow[allHeaderObj["Time"].columnIndex] = richText;
    }

    if (allHeaderObj["Google Meet Recording Link"] && meetingRecordingFile) {
      var richText = SpreadsheetApp.newRichTextValue().setText(meetingRecordingFile.getName()).setLinkUrl(meetingRecordingFile.getUrl()).build();
      outputRow[allHeaderObj["Google Meet Recording Link"].columnIndex] = richText;
    }

    if (allHeaderObj["AI Meeting Note Doc"] && meetingNotesFile) {
      var richText = SpreadsheetApp.newRichTextValue().setText(meetingNotesFile.getName()).setLinkUrl(meetingNotesFile.getUrl()).build();
      outputRow[allHeaderObj["AI Meeting Note Doc"].columnIndex] = richText;
    }

    if (allHeaderObj["Record ID"] && sRecordID) {
      var richText = SpreadsheetApp.newRichTextValue().setText(sRecordID).build();
      outputRow[allHeaderObj["Record ID"].columnIndex] = richText;
    }

    allDataRichOutput.push(outputRow);
  });

  if (allDataRichOutput.length > 0) {
    var vRow = sheet.getLastRow() + 1;
    sheet.getRange(vRow, 1, allDataRichOutput.length, allDataRichOutput[0].length).setRichTextValues(allDataRichOutput);

    if (allHeaderObj["Date"] && allHeaderObj["Time"]) {
      sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).sort([{ column: allHeaderObj["Date"].columnNumber, ascending: false }, { column: allHeaderObj["Time"].columnNumber, ascending: false }]);
    }
  }
}

function testARG4t5() {
  var subject = "Notes: Meeting Aug 28, 2025 at 12:45 PM CST";
  var datetime = extractDateTime_(subject);
  console.log(datetime);
}

function extractDateTime_(subject) {
  // Pattern 1: "Notes: Meeting Aug 20, 2025 at 11:20 AM CDT"
  var regex1 = /([A-Za-z]+ \d{1,2}, \d{4}) at (\d{1,2}:\d{2} (?:AM|PM))(?: (\w+))?/;

  // Pattern 2: "Meeting started 2025/05/22 17:44 CDT - Notes by Gemini"
  var regex2 = /(\d{4}\/\d{2}\/\d{2}) (\d{1,2}:\d{2})(?: (\w+))?/;

  // Pattern 3: "kvg-eaqv-tgw (2024-11-30 15:37 GMT-6) - Transcript"
  var regex3 = /\((\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}) ([A-Z]+[+-]?\d*)\)/;

  var match1 = subject.match(regex1);
  var match2 = subject.match(regex2);
  var match3 = subject.match(regex3);

  if (match1) {
    // Format 1
    var dateStr = match1[1]; // "Aug 20, 2025"
    var timeStr = match1[2]; // "11:20 AM"
    var tzStr = match1[3] || ""; // "CDT" (if present)

    var fullStr = dateStr + " " + timeStr + " " + tzStr;
    var parsedDate = new Date(fullStr);

    return {
      format: "style1",
      dateString: dateStr,
      timeString: timeStr,
      timezone: tzStr,
      full: fullStr,
      dateObj: parsedDate
    };

  } else if (match2) {
    // Format 2
    var dateStr2 = match2[1]; // "2025/05/22"
    var timeStr2 = match2[2]; // "17:44"
    var tzStr2 = match2[3] || ""; // "CDT"

    var fullStr2 = dateStr2 + " " + timeStr2 + " " + tzStr2;
    var parsedDate2 = new Date(fullStr2);

    return {
      format: "style2",
      dateString: dateStr2,
      timeString: timeStr2,
      timezone: tzStr2,
      full: fullStr2,
      dateObj: parsedDate2
    };

  } else if (match3) {
    // Format 3
    var dateStr3 = match3[1]; // "2024-11-30"
    var timeStr3 = match3[2]; // "15:37"
    var tzStr3 = match3[3];   // "GMT-6"

    var fullStr3 = dateStr3 + " " + timeStr3 + " " + tzStr3;
    var parsedDate3 = new Date(fullStr3);

    return {
      format: "style3",
      dateString: dateStr3,
      timeString: timeStr3,
      timezone: tzStr3,
      full: fullStr3,
      dateObj: parsedDate3
    };

  } else {
    return null;
  }
}

function extractLinks_(body) {
  // Regex for Drive/Docs links
  var linkRegex = /https:\/\/(?:docs|drive)\.google\.com\/[^\s"]+/g;
  var links = body.match(linkRegex);

  return links;
}

function getFilesDetails_(ids) {
  Utilities.sleep(1000);

  var meetingId = "";
  var meetingNotesFile = null;
  var meetingRecordingFile = null;

  ids.forEach(fileId => {
    try {
      var file = DriveApp.getFileById(fileId);
      var fileName = file.getName();
      var fileType = file.getMimeType();

      // if (fileType == "application/vnd.google-apps.document" && (fileName.indexOf("- Notes by Gemini") != -1 || fileName.indexOf("- Transcript") != -1)) {
      if (fileType == "application/vnd.google-apps.document") {
        meetingNotesFile = file;
      }

      if (fileType == "video/mp4") {
        meetingRecordingFile = file;
      }

      if (meetingId == "") {
        // Extract Meeting ID from filename (format: abc-defg-hij)
        var meetingIdRegex = /([a-z]{3}-[a-z]{4}-[a-z]{3})/i;
        var meetingIdMatch = fileName.match(meetingIdRegex);

        if (meetingIdMatch) {
          meetingId = meetingIdMatch[1];
        }
      }
    } catch (err) {
      console.log(err);
    }
  });


  return { meetingId, meetingNotesFile, meetingRecordingFile };
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
 * Updates status in BigQuery for specific message_ids
 *
 * @param {string} projectId - GCP Project ID
 * @param {string} datasetTable - Fully qualified table name (project.dataset.table)
 * @param {Array<string>} messageIds - List of message_ids to update
 * @param {string} newStatus - Status value to set
 */
function updateBigQueryStatus_(messageIds, newStatus) {
  if (!messageIds || messageIds.length === 0) {
    console.log("No messageIds provided for update");
    return;
  }

  // Escape messageIds properly for SQL
  var idList = messageIds.map(id => `'${String(id).replace(/'/g, "''")}'`).join(", ");

  var sql = `
    UPDATE \`${PROJECT_ID}.${DATASET_ID}.${TABLE_ID}\`
    SET status = '${newStatus.replace(/'/g, "''")}'
    WHERE message_id IN (${idList})
  `;

  var queryRequest = {
    query: sql,
    useLegacySql: false
  };

  // Run the query
  var queryResults = BigQuery.Jobs.query(queryRequest, PROJECT_ID);

  // Wait for job completion
  var jobId = queryResults.jobReference.jobId;
  while (!queryResults.jobComplete) {
    Utilities.sleep(1000);
    queryResults = BigQuery.Jobs.getQueryResults(PROJECT_ID, jobId);
  }

  return queryResults;
}

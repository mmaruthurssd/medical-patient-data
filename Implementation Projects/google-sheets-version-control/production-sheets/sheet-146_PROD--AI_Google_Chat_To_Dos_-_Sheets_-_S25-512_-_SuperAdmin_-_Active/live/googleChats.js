
const promptStructure = `
You are given a series of Google Chat messages in the format:

"YYYY-MM-DD HH:MM Sender: message"

Your task is to extract unique action items from the conversation.

For each action item, capture:
- "description": A clear summary of the task.
- "assigned_by": The person who requested or suggested the task (if identifiable).
- "assigned_to": The person responsible for completing the task (if identifiable).
- "assigned_at": The exact date and time from the message where the task was assigned (in the format YYYY-MM-DD HH:MM).

Return the result strictly in the following JSON format:

{
  "action_items": [
    {
      "description": "",
      "assigned_by": "",
      "assigned_to": "",
      "assigned_at": ""
    }
  ]
}

Rules:
- Deduplicate action items (if the same task is mentioned multiple times, include it only once).
- Use empty strings "" if any field is not explicitly mentioned.
- Only extract genuine tasks or requests; ignore casual conversation.
- Do not include any commentary, explanation, or text outside of the JSON.
- Ensure the JSON is valid and parsable.

Messages:
{{messages}}
`;

// function extractActionItemsFromChats() {

//   var sheetChatActionItems = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Chat Action Items");
//   var allHeaderObj_ActionItems = makeObjHeaderDetails_FromSheet_({ sheet: sheetChatActionItems });
//   var vColumns_ActionItems = sheetChatActionItems.getLastColumn();

//   var objParas = {};
//   objParas.pageSize = "10";
//   objParas.orderBy = "createTime DESC";

//   // var afterDate = new Date(vNow - vMiliPerHour);
//   // objParas.filter = `createTime>"${formatRFC3339WithOffset_(afterDate)}"`;

//   var messages = listMessages_(objParas);

//   if (messages.length == 0) return;

//   var allStructuredMessages = [];

//   messages.forEach(message => {
//     var text = message.text;
//     var messageTime = Utilities.formatDate(new Date(message.createTime), "GMT-5", "yyyy-MM-dd HH:mm");

//     //>>
//     var userResourceName = message.sender.name;
//     const userId = userResourceName.split("/")[1];
//     var sender = getUserDetails_(userId).displayName;
//     //<<

//     allStructuredMessages.push(`${messageTime} ${sender}: ${text}`);
//     console.log(`${messageTime} ${sender}: ${text}`);
//   });

//   return;

//   const prompt = promptStructure.replace("{{messages}}", JSON.stringify(allStructuredMessages));

//   const aiResult = vertexAIconfigLib.callVertexAIWithPrompt({ prompt });

//   // console.log(aiResult);

//   var allOutputRows = [];

//   var action_items = aiResult.action_items;
//   action_items.forEach(item => {
//     var outputRow = new Array(vColumns_ActionItems).fill("");

//     outputRow[allHeaderObj_ActionItems["Action Items"].columnIndex] = item.description;
//     outputRow[allHeaderObj_ActionItems["Assigned By"].columnIndex] = item.assigned_by;
//     outputRow[allHeaderObj_ActionItems["Assigned To"].columnIndex] = item.assigned_to;
//     outputRow[allHeaderObj_ActionItems["Date & Time"].columnIndex] = item.assigned_at;

//     allOutputRows.push(outputRow);
//   });

//   if (allOutputRows.length > 0) {
//     sheetChatActionItems.getRange(sheetChatActionItems.getLastRow() + 1, 1, allOutputRows.length, allOutputRows[0].length).setValues(allOutputRows);
//     sheetChatActionItems.getRange(2, 1, sheetChatActionItems.getLastRow() - 1, sheetChatActionItems.getLastColumn()).sort([{ column: allHeaderObj_ActionItems["Date & Time"].columnNumber, ascending: false }]);
//   }
// }

function formatRFC3339WithOffset_(date) {
  const tzOffset = -date.getTimezoneOffset(); // in minutes
  const sign = tzOffset >= 0 ? "+" : "-";
  const pad = n => String(Math.floor(Math.abs(n))).padStart(2, "0");
  const hours = pad(tzOffset / 60);
  const minutes = pad(tzOffset % 60);

  return (
    date.getFullYear() +
    "-" + pad(date.getMonth() + 1) +
    "-" + pad(date.getDate()) +
    "T" + pad(date.getHours()) +
    ":" + pad(date.getMinutes()) +
    ":" + pad(date.getSeconds()) +
    sign + hours + ":" + minutes
  );
}

function getURL_({ objParas, basicURL }) {
  var sURL = basicURL;

  Object.entries(objParas).forEach(([key, value]) => {
    value = encodeURIComponent(value);
    if (sURL == "" || sURL == basicURL) {
      sURL = basicURL + "?" + key + "=" + value;
    } else {
      sURL += "&" + key + "=" + value;
    }
  });

  return sURL;
}

function listMessages_({ userEmail, space_name, objParas }) {

  var scope = 'https://www.googleapis.com/auth/chat.messages';
  const token = getAccessTokenFromKey_({ scope, sub: userEmail });

  var basicURL = "https://chat.googleapis.com/v1/" + space_name + "/messages";

  var options = {
    method: "get",
    headers: {
      Authorization: "Bearer " + token
    },
    muteHttpExceptions: true
  };

  var pageToken;
  var allMessages = [];

  do {
    if (pageToken) {
      objParas.pageToken = pageToken;
    }

    var sURL = getURL_({ basicURL, objParas });

    var response = UrlFetchApp.fetch(sURL, options);
    var json = JSON.parse(response.getContentText());

    if (json.messages) {
      allMessages = allMessages.concat(json.messages);
    }

    if (allMessages.length >= 5000) break;

    pageToken = json.nextPageToken;
  } while (pageToken);

  return allMessages;
}

function listSpacesForUser_({ userEmail }) {
  var scope = 'https://www.googleapis.com/auth/chat.spaces';

  const token = getAccessTokenFromKey_({ scope, sub: userEmail });
  var pageToken;

  var basicURL = 'https://chat.googleapis.com/v1/spaces';

  var spaces = [];

  do {
    var objParas = {};
    objParas.pageSize = "100";

    if (pageToken) {
      objParas.pageToken = pageToken;
    }

    var sURL = getURL_({ basicURL, objParas });

    const resp = UrlFetchApp.fetch(sURL, { headers: { Authorization: `Bearer ${token}` }, muteHttpExceptions: true });
    var res = JSON.parse(resp.getContentText());

    if (res && res.spaces && res.spaces.length) {
      spaces = spaces.concat(res.spaces);
    }

    pageToken = res.nextPageToken;
  } while (pageToken);

  return spaces;
}

function exportChatsToBigQuery() {
  // return;
  exportChatsToBigQuery_();
}

function testATHEFHTH() {
  exportChatsToBigQuery_();
}

function resetFullScanIndex() {
  listAllUsers();
  return;
  setProperty_("userExportIndex", "0");
}

function exportChatsToBigQuery_() {
  var users = getExistingUsers_();

  var userExportIndex = getProperty_("userExportIndex");
  if (userExportIndex) {
    userExportIndex = Number(userExportIndex);
  }

  users.forEach((user, x) => {

    if (userExportIndex) {
      if (x < userExportIndex) {
        return;
      }
    }

    if (isOverTime_(vMiliPerMin * 14)) return;

    console.log(`processing for user: ${user.primaryEmail}`);

    var exportStatus = exportMessagesForOneUser_({ userEmail: user.primaryEmail, userName: user.fullName });

    if (exportStatus == true) {
      // if (x == users.length - 1) {
      //   setProperty_("userExportIndex", "0");
      // } else {
      // setProperty_("userExportIndex", (x + 1).toString());
      // }
      setProperty_("userExportIndex", (x + 1).toString());
    }
  });
}

function exportMessagesForOneUser_({ userEmail, userName }) {
  if (isOverTime_(vMiliPerMin * 14)) return false;

  const chat_user_email = userEmail;
  const chat_user_name = userName;

  const spaces = listSpacesForUser_({ userEmail });

  var objProcessedMeta = {};
  var processedMeta = getProperty_("processedMeta");
  if (processedMeta) {
    objProcessedMeta = JSON.parse(processedMeta);
  }

  if (!objProcessedMeta[userEmail]) {
    objProcessedMeta[userEmail] = {};
  }

  console.log(`no. of spaces: ${spaces.length}`);

  var bUpdated = false;

  for (var sp = 0; sp < spaces.length; sp++) {
    if (isOverTime_(vMiliPerMin * 14)) return false;

    var space = spaces[sp];

    var space_name = space.name;
    var space_type = space.spaceType;
    var space_display_name = "";

    if (space.displayName) {
      space_display_name = space.displayName;
    }

    var objParas = {};
    objParas.pageSize = "500";
    objParas.orderBy = "createTime ASC";

    if (objProcessedMeta[userEmail][space_name]) {
      var afterTime = new Date(objProcessedMeta[userEmail][space_name]);
      objParas.filter = `createTime>"${formatRFC3339WithOffset_(afterTime)}"`;
    }

    var messages = listMessages_({ userEmail, space_name, objParas });

    var rows = [];

    messages.forEach(message => {
      var message_name = message.name;

      var text = message.text;
      var formatted_text = message.formattedText;

      var thread_name = null;
      if (message.thread && message.thread.name) {
        thread_name = message.thread.name;
      }

      var attachments = [];

      if (message.attachment) {
        message.attachment.forEach(atch => {

          var drive_file_id;
          if (atch.driveDataRef) {
            drive_file_id = atch.driveDataRef.driveFileId;
          }

          var resourceName;
          if (atch.attachmentDataRef) {
            resourceName = atch.attachmentDataRef.resourceName;
          }

          attachments.push({
            attachment_name: atch.name,
            content_type: atch.contentType,
            content_name: atch.contentName,
            drive_file_id,
            resourceName,
            attachment_downloadUri: atch.downloadUri,
            attachment_source: atch.source
          });

        });
      }

      var attachment_count = attachments.length;

      var create_time = message.createTime;
      var ingestion_time = new Date().toISOString();

      var deleteTime = null;
      if (message.deleteTime) {
        deleteTime = message.deleteTime;
      }

      var sender_name = message.sender.name;
      var sender_type = message.sender.type;

      var sender_user_name;
      var sender_email;

      if (sender_type.toString().toUpperCase() == "HUMAN") {
        var userDetails = getUserDetails_(sender_name.toString().split("/")[1]);
        sender_user_name = userDetails.displayName;
        sender_email = userDetails.email;
      }

      var row = {
        json: {
          message_name,
          space_name,
          space_type,
          space_display_name,
          create_time,
          ingestion_time,
          sender_user_name,
          sender_type,
          text,
          formatted_text,
          attachment_count,
          thread_name,
          sender_name,
          sender_email,
          attachments,
          chat_user_email,
          chat_user_name,
          deleteTime
        }
      };

      rows.push(row);
    });

    var finalRows = [];

    if (rows.length > 0) {
      var allMessageNames = rows.map(row => row.json.message_name);

      var existing = getExistingIds_(allMessageNames);

      rows.forEach(row => {
        if (!existing.includes(row.json.message_name)) {
          finalRows.push(row);
        }
      });

      if (finalRows.length > 0) {
        bUpdated = true;
        console.log(`(space: ${space_name}) (space_display_name: ${space_display_name}) (rows: ${rows.length}) (duplicate: ${existing.length}) (newRows: ${finalRows.length})`);

        var insertStatus = insertRowsToBigQuery_(finalRows);

        if (insertStatus == true) {
          objProcessedMeta[userEmail][space_name] = finalRows[finalRows.length - 1].json.create_time.toString();
          setProperty_("processedMeta", JSON.stringify(objProcessedMeta));
        }
      } else {
        objProcessedMeta[userEmail][space_name] = rows[rows.length - 1].json.create_time.toString();
        setProperty_("processedMeta", JSON.stringify(objProcessedMeta));
      }
    }
  }

  // if (bUpdated) {
  //   return false;
  // } else {
  //   return true;
  // }
  return true;
}

function testARGR() {
  var objProcessedMeta = {};
  var processedMeta = getProperty_("processedMeta");
  if (processedMeta) {
    objProcessedMeta = JSON.parse(processedMeta);
  }

  var objSpaces = [];

  Object.entries(objProcessedMeta).forEach(([email, meta]) => {
    Object.entries(meta).forEach(([space_name, createTime]) => {

      if (!objSpaces[space_name]) {
        objSpaces[space_name] = { users: [], createTime };
      }

      if (!objSpaces[space_name].includes(space_name)) {
        objSpaces[space_name].push(space_name);
      }
    });
  });

  console.log(objSpaces);
}


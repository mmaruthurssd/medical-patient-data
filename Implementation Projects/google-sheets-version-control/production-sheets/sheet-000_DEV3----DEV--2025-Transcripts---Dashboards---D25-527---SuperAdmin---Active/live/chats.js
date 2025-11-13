
const transcriptDestnFolderID_chats = '1UOQIU0m4Xy2jydlNZoo29vFrmDQtwhFC';

function schedulePerDay_Chats() {
  var sDate = Utilities.formatDate(new Date(new Date().setDate(new Date().getDate() - 1)), Session.getScriptTimeZone(), "yyyy-MM-dd");
  generateTranscriptForChats_(sDate);
}

function generateAllChatTrnascripts() {
  var bLoop = true;

  while (bLoop) {
    var sDate = getProperty_("chatExtractionDate");

    if ((new Date(sDate)).getFullYear() != 2025) {
      bLoop = false;
      break;
    }

    console.log(sDate);

    generateTranscriptForChats_(sDate);

    setProperty_("chatExtractionDate", fmt_(getNewDay_(sDate, -1)));

    if (isOverTime_(1000 * 60 * 13)) bLoop = false;
  }
}

function generateTranscriptForChats_(sDate) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Chats");

  var allHeaderObj = makeObjHeaderDetails_FromSheet_({ sheet, bRich: true });

  var allDataObj_rich = makeObjectData_(sheet.getDataRange().getRichTextValues(), true);
  var allDataObj_dv = makeObjectData_(sheet.getDataRange().getDisplayValues(), false);

  var allData_RowsToDel = [];

  allDataObj_rich.forEach((r, x) => {
    var vRow = x + 2;

    var rowObj_rich = allDataObj_rich[x];
    var rowObj_dv = allDataObj_dv[x];

    if (rowObj_dv["Date"] == sDate) {
      var fileUrl = rowObj_rich["Doc Link"].getLinkUrl();
      if (!fileUrl) return;

      var fileId = getGoogleDriveId_(fileUrl);
      if (!fileId) return;

      // try {
      //   Drive.Files.remove(fileId, { supportsAllDrives: true });
      // } catch (err) {
      //   console.log(err);
      try {
        DriveApp.getFileById(fileId).setTrashed(true);
      } catch (err) {
        console.log(err);
      }
      // }

      allData_RowsToDel.push(vRow);
    }
  });

  allData_RowsToDel.reverse();

  var allData_RowsToDel_range = [];

  allData_RowsToDel.map(function (r, x) {
    if (x == 0) {
      allData_RowsToDel_range.push([r, 1]);
    } else {
      var vLastRow = allData_RowsToDel_range[allData_RowsToDel_range.length - 1][0];
      var vLastNoOfRows = allData_RowsToDel_range[allData_RowsToDel_range.length - 1][1];
      if (vLastRow - r == 1) {
        allData_RowsToDel_range[allData_RowsToDel_range.length - 1][0] = r;
        allData_RowsToDel_range[allData_RowsToDel_range.length - 1][1] = vLastNoOfRows + 1;
      } else if (r != "") {
        allData_RowsToDel_range.push([r, 1]);
      }
    }
  });

  allData_RowsToDel_range.map(function (xx) {
    sheet.deleteRows(xx[0], xx[1]);
  });

  getChatsFromBQ_(sDate);

  if (sheet.getLastRow() > 2) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).sort([{ column: allHeaderObj["Date"].columnNumber, ascending: false }]);
  }
}

function getChatsFromBQ_(sDate) {

  var fields = [
    "message_name"
    , "space_name"
    , "space_type"
    , "space_display_name"
    , "create_time"
    , "sender_user_name"
    , "sender_type"
    , "text"
    , "sender_name"
    , "sender_email"
    , "deleteTime"
  ];

  //>>
  var filters = [
    { field: `DATE(create_time, "Etc/GMT+6")`, operator: "BETWEEN", value: [sDate, sDate] }
    , { field: `deleteTime`, operator: "IS_NULL", value: '' }
  ];

  var limit = 10;

  var query = buildBigQueryQuery_({ filters: filters, fields, projectId: PROJECT_ID, datasetId: DATASET_ID_CHATS, tableId: TABLE_ID_CHATS, sortField: 'create_time' });
  // var query = buildBigQueryQuery_({ limit, filters: filters, fields, projectId: PROJECT_ID, datasetId: DATASET_ID_CHATS, tableId: TABLE_ID_CHATS, sortField: 'create_time' });

  // console.log(query);
  // return;

  var results = runBigQueryQuery_({ query, projectId: PROJECT_ID });
  //<<

  if (results.length == 0) return;

  var combinedText = "";

  var vTotalMessages = 0;

  var allFiles = [];

  var objSpaces = {};

  results.forEach(r => {
    if (!objSpaces[r["space_name"]]) objSpaces[r["space_name"]] = [];
    objSpaces[r["space_name"]].push(r);
  });

  var vSpaceCount = 0;

  Object.keys(objSpaces).forEach(space_name => {
    vSpaceCount++;
    var sNewChatText = `${lineBreakChar}${lineBreakChar}--- NEW CHAT ---${lineBreakChar}`;

    // switch (objSpaces[space_name][0]["space_type"]) {
    //   case "DIRECT_MESSAGE":
    //     sNewChatText += `Space: DIRECT_MESSAGE`;
    //     break;
    //   case "SPACE":
    //     sNewChatText += `Space: ${objSpaces[space_name][0]["space_display_name"]}`;
    //     break;
    // }

    if (objSpaces[space_name][0]["space_display_name"]) {
      sNewChatText += `Space: ${objSpaces[space_name][0]["space_display_name"]}`;
    } else {
      sNewChatText += `Space: ${objSpaces[space_name][0]["space_type"]}`;
    }

    objSpaces[space_name].forEach(r => {

      var ddate = new Date(r["create_time"]);
      // var sDate = Utilities.formatDate(ddate, "GMT-06:00", "yyyy-MM-dd");
      var sTime = Utilities.formatDate(ddate, "GMT-06:00", "HH:mm:ss");

      sNewChatText += `${lineBreakChar}${sTime} ${r["sender_user_name"]}: ${r["text"]}`;
      vTotalMessages++;
    });

    if (combinedText == "") {
      combinedText = `Date: ${sDate}`;
    }

    combinedText += sNewChatText;

    if (combinedText.length >= 2000000) {
      allFiles.push({ combinedText, vTotalMessages, vSpaceCount });
      vTotalMessages = 0;
      vSpaceCount = 0;
      combinedText = "";
    }
  });

  if (vTotalMessages > 0) {
    allFiles.push({ combinedText, vTotalMessages, vSpaceCount });
  }

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Chats");

  var folder = DriveApp.getFolderById(transcriptDestnFolderID_chats);

  allFiles.forEach((obj, x) => {
    var docName = `Chats Transcript - ${sDate} (${x + 1})`;
    console.log(docName);

    var blob = Utilities.newBlob(obj.combinedText, 'text/plain', docName);
    var doc = folder.createFile(blob);

    var vRow = sheet.getLastRow() + 1;

    var richText = SpreadsheetApp.newRichTextValue().setText(docName).setLinkUrl(doc.getUrl()).build();
    sheet.getRange(vRow, 2).setRichTextValue(richText);

    sheet.getRange(vRow, 1).setValue(sDate);
    sheet.getRange(vRow, 3).setValue(obj.vTotalMessages);
    sheet.getRange(vRow, 4).setValue(obj.vSpaceCount);
    sheet.getRange(vRow, 5).setValue(obj.combinedText.length);
  });

}
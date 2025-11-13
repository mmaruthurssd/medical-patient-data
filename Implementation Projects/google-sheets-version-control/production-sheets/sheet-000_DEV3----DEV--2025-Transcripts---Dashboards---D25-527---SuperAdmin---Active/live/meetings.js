
const ssID_googleMeets = '165_Aiw2EaawUtBJFYG9roUF_3waUOwU1LOBU2Wjw-Ic';

const transcriptDestnFolderID_meetings = '1fjp4-FC20CDzFyINpI72clSF_h-HC3uT';

function getMeetingTranscripts() {
  var sheetMeetings = SpreadsheetApp.openById(ssID_googleMeets).getSheetByName("Google Meet List");

  var allData = sheetMeetings.getDataRange().getValues();
  var allData_rich = sheetMeetings.getDataRange().getRichTextValues();

  var allDataObj = makeObjectData_(allData, false);
  var allDataObj_rich = makeObjectData_(allData_rich, true);

  var objMeetings = {};

  allDataObj_rich.forEach((r, x) => {
    var sRecordID = allDataObj[x]["Record ID"].toString();
    var sDate = allDataObj[x]["Date"];
    var sTime = allDataObj[x]["Time"];

    if (!sRecordID) return;

    if (left_(sRecordID, 4) != "2025") return;

    if (!objMeetings[sRecordID]) objMeetings[sRecordID] = {};

    if (sDate) {
      objMeetings[sRecordID]["Date"] = sDate;
    }
    if (sTime) {
      objMeetings[sRecordID]["Time"] = sTime;
    }

    var url = r["AI Meeting Note Doc"].getLinkUrl();
    if (url) {
      var id = getGoogleDriveId_(url);

      if (id) {
        objMeetings[sRecordID]["docId"] = id;
      }
    }

  });

  var sheetMeetingTranscripts = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Meeting Transcripts");
  var allData = sheetMeetingTranscripts.getDataRange().getValues();
  var allDataObj = makeObjectData_(allData, false);
  var allHeaders = allData[0];
  var allHeaderObj = makeObjHeaderDetails_FromSheet_({ sheet: sheetMeetingTranscripts });

  var allDocIdMap = allDataObj.map(r => r["Record ID"].toString());

  var folder = DriveApp.getFolderById(transcriptDestnFolderID_meetings);

  Object.keys(objMeetings).forEach(sRecordID => {
    if (isOverTime_(1000 * 60 * 4.5)) return;

    if (allDocIdMap.includes(sRecordID) || !objMeetings[sRecordID]["docId"]) return;

    var newRow = new Array(allHeaders.length).fill("");

    if (allHeaderObj["Record ID"]) {
      newRow[allHeaderObj["Record ID"].columnIndex] = sRecordID;
    }

    if (allHeaderObj["Date"] && objMeetings[sRecordID]["Date"]) {
      newRow[allHeaderObj["Date"].columnIndex] = objMeetings[sRecordID]["Date"];
    }

    if (allHeaderObj["Time"] && objMeetings[sRecordID]["Time"]) {
      newRow[allHeaderObj["Time"].columnIndex] = objMeetings[sRecordID]["Time"];
    }

    //>>
    var docName = `Meeting Transcript - ${sRecordID}`;

    var transcriptDocUrl = getTranscriptUrl_(objMeetings[sRecordID]["docId"]);
    if (transcriptDocUrl) {
      var transcript = fetchDocTab_(transcriptDocUrl);
      console.log(docName);

      var blob = Utilities.newBlob(transcript, 'text/plain', docName);
      var doc = folder.createFile(blob);

      objMeetings[sRecordID]["Doc Link"] = doc.getUrl();
      objMeetings[sRecordID]["Total Characters count"] = transcript.length;
    }
    //<<

    if (!objMeetings[sRecordID]["Doc Link"]) return;

    if (allHeaderObj["Total Characters count"] && objMeetings[sRecordID]["Total Characters count"]) {
      newRow[allHeaderObj["Total Characters count"].columnIndex] = objMeetings[sRecordID]["Total Characters count"];
    }

    var vRow = sheetMeetingTranscripts.getLastRow() + 1;

    sheetMeetingTranscripts.getRange(vRow, 1, 1, newRow.length).setValues([newRow]);

    var richText = SpreadsheetApp.newRichTextValue().setText(docName).setLinkUrl(objMeetings[sRecordID]["Doc Link"]).build();
    sheetMeetingTranscripts.getRange(vRow, allHeaderObj["Doc Link"].columnNumber).setRichTextValue(richText);

    allDocIdMap.push(sRecordID);
  });

  sheetMeetingTranscripts.getRange(2, 1, sheetMeetingTranscripts.getLastRow() - 1, sheetMeetingTranscripts.getLastColumn()).sort([{ column: allHeaderObj["Date"].columnNumber, ascending: false }, { column: allHeaderObj["Time"].columnNumber, ascending: false }]);
}

function getTranscriptUrl_(docId) {
  var doc = Docs.Documents.get(docId); // Uses Advanced Docs API
  var docUrl = `https://docs.google.com/document/d/${docId}/edit`

  if (right_(doc.title.toString().toLowerCase(), "- transcript".length) == "- transcript") {
    return docUrl;
  }

  var transcriptDocUrl = "";

  var content = doc.body.content;

  content.forEach(function (element) {
    if (element.paragraph && element.paragraph.elements) {
      element.paragraph.elements.forEach(function (e) {
        if (e.richLink && e.richLink.richLinkProperties && e.richLink.richLinkProperties.uri) {
          if (e.richLink.richLinkProperties.title.toString().toLowerCase().trim().indexOf("transcript") != -1 || e.richLink.richLinkProperties.title.toString().toLowerCase().trim().indexOf("notes by gemini") != -1) {
            var uri = e.richLink.richLinkProperties.uri;
            if (left_(uri, 4) == "?tab") {
              transcriptDocUrl = docUrl + uri;
            } else {
              transcriptDocUrl = uri;
            }
          }
        }
      });

    }
  });

  return transcriptDocUrl;
}

/**
 * Fetches the text from a specific Google Docs tab (e.g., "Transcript")
 * @param {string} tabUrl - The "Copy link to tab" URL for the tab you want.
 * @param {'txt'|'html'} format - 'txt' for plain text, 'html' for HTML.
 * @return {string} The tab's content as text/HTML.
 */
function fetchDocTab_(tabUrl) {

  const docIdMatch = tabUrl.match(/document\/d\/([a-zA-Z0-9_-]+)/);
  const tabIdMatch = tabUrl.match(/[?&]tab=([^&#]+)/);

  if (!docIdMatch) {
    console.log('Could not find documentId in the provided URL.');
    return;
  }

  const docId = docIdMatch[1];

  // Choose export mime type
  const format = 'txt';

  var exportUrl =
    `https://docs.google.com/document/d/${docId}/export?format=${encodeURIComponent(format)}`

  if (tabIdMatch) {
    exportUrl += `&tab=${decodeURIComponent(tabIdMatch[1])}`;
  }

  // Use OAuth token so it works on private docs too
  const options = {
    method: 'get',
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
    muteHttpExceptions: false
  };

  const res = UrlFetchApp.fetch(exportUrl, options);
  if (res.getResponseCode() !== 200) {
    throw new Error(`Export failed: HTTP ${res.getResponseCode()} – ${res.getContentText()}`);
  }
  return res.getContentText();
}

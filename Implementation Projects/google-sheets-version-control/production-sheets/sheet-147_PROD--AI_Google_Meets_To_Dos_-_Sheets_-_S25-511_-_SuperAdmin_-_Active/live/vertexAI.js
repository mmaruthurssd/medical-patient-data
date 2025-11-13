
const promptStructure = `
You are given a meeting transcript.
{{MEETING_TRANSCRIPT_TEXT}}

Your task is to carefully read the transcript and extract:

1. Participants: If "Attendees" list is given use that. otherwise list of all people who spoke. If No participants return ["NA"]
2. Action Items: Tasks that need to be completed. For each action item, extract:
   - description
   - assigned_by
   - assigned_to

Return strictly in this JSON format:

{
  "participants": [],
  "action_items": [
    {
      "description": "",
      "assigned_by": "",
      "assigned_to": ""
    }
  ]
}
`;

// function scheduleForAI() {
//   if (!scriptHandler_(false)) return;
//   // return;
//   try {
//     extractMeetingDetailsFromAI();
//   } catch (err) {
//     console.log(err);
//   }
//   scriptHandler_release_();
// }

function extractMeetingDetailsFromAI() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Google Meet List");
  var allHeaderObj = makeObjHeaderDetails_FromSheet({ sheet, bRich: true });

  var sheetMeetingActionItems = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Meeting Action Items");
  var allHeaderObj_ActionItems = makeObjHeaderDetails_FromSheet({ sheet: sheetMeetingActionItems });
  var vColumns_ActionItems = sheetMeetingActionItems.getLastColumn();

  var allData = sheet.getDataRange().getValues();
  var allData_rich = sheet.getDataRange().getRichTextValues();

  var allDataObj = makeObjectData_(allData, false);
  var allDataObj_rich = makeObjectData_(allData_rich, true);

  // var allDocIdMap = [];

  var vLimit = 5;
  var vCount = 0;

  allDataObj_rich.forEach((r, x) => {
    if (vCount >= vLimit) return;

    if (r["Participants"].getText() != "") return;

    var sMeetingID = r["Meeting ID"].getText();
    var sRecordID = allDataObj[x]["Record ID"];

    var vRow = x + 2;

    var url = r["AI Meeting Note Doc"].getLinkUrl();
    if (url) {
      var id = getGoogleDriveId_(url);

      if (id) {
        var transcript = "";

        var transcriptDocUrl = getTranscriptUrl_(id);
        if (transcriptDocUrl) {
          transcript = fetchDocTab_(transcriptDocUrl);
        }

        if (transcript) {
          vCount++;

          //>>
          const prompt = promptStructure.replace("{{MEETING_TRANSCRIPT_TEXT}}", transcript);
          const aiResult = vertexAIconfigLib.callVertexAIWithPrompt({ prompt });

          // console.log(aiResult);

          if (aiResult) {
            var participants = aiResult.participants.sort().join(", ");
            sheet.getRange(vRow, allHeaderObj["Participants"].columnNumber).setValue(participants);

            var allOutputRows = [];

            var action_items = aiResult.action_items;
            action_items.forEach(item => {
              var outputRow = new Array(vColumns_ActionItems).fill("");

              outputRow[allHeaderObj_ActionItems["Meeting ID"].columnIndex] = sMeetingID;
              outputRow[allHeaderObj_ActionItems["Record ID"].columnIndex] = sRecordID;

              outputRow[allHeaderObj_ActionItems["Action Items"].columnIndex] = item.description;
              outputRow[allHeaderObj_ActionItems["Assigned By"].columnIndex] = item.assigned_by;
              outputRow[allHeaderObj_ActionItems["Assigned To"].columnIndex] = item.assigned_to;

              allOutputRows.push(outputRow);
            });

            if (allOutputRows.length > 0) {
              sheetMeetingActionItems.getRange(sheetMeetingActionItems.getLastRow() + 1, 1, allOutputRows.length, allOutputRows[0].length).setValues(allOutputRows);
              sheetMeetingActionItems.getRange(2, 1, sheetMeetingActionItems.getLastRow() - 1, sheetMeetingActionItems.getLastColumn()).sort([{ column: allHeaderObj_ActionItems["Record ID"].columnNumber, ascending: false }]);
            }
          } else {
            sheet.getRange(vRow, allHeaderObj["Participants"].columnNumber).setValue("No response from AI");
          }
          //<<

        }
      }
    } else {
      sheet.getRange(vRow, allHeaderObj["Participants"].columnNumber).setValue("NA");
    }

  });

}

function testExtractTranscript() {
  // var docId = "1i41gL0q8R5-7oL1tAAV7a6I2B-Ts78DGcR6dAnG7_ck";
  var docId = "1mfrUOl21Lr5xcHQlrSbhxFj3CW0Tnz9mmJ6WLtg6QCg";

  var transcriptDocUrl = getTranscriptUrl_(docId);

  if (transcriptDocUrl) {
    var transcript = fetchDocTab_(transcriptDocUrl);
    console.log(transcript);
  }

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

// // Example: get the Transcript tab as text and log it
// function getTranscriptTab() {
//   var tabUrl = 'https://docs.google.com/document/d/1AiLyXMu-r1Bq9V1t9kCzkYTixErgyP5rIHhKk5Qmcv0/edit?tab=t.6rej7mxgs425'; // the Transcript tab URL
//   // var tabUrl = 'https://docs.google.com/document/d/10wa2nsvTODeOM4DJCS9T6CtxY3Z0Sbqe8fdImrO-Hkw/edit?usp=drive_web';
//   const text = fetchDocTab(tabUrl, 'txt'); // or 'html'
//   Logger.log(text);
// }

function getDocText_(docId) {
  var doc = Docs.Documents.get(docId); // Uses Advanced Docs API

  var content = doc.body.content;
  var text = "";

  content.forEach(function (element) {
    if (element.paragraph && element.paragraph.elements) {
      element.paragraph.elements.forEach(function (e) {
        if (e.textRun && e.textRun.content) {
          text += e.textRun.content;
        }
      });
      text += "\n"; // add newline at end of each paragraph
    }
  });

  return text;
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

// vertexAIconfigLib.callVertexAIWithPrompt
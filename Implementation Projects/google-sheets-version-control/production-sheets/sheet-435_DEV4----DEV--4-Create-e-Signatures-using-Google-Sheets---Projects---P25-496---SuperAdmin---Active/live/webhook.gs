
function doPost(e) {
  try {
    Logger.log("Raw POST data: " + e.postData.contents);

    var json = JSON.parse(e.postData.contents);

    var event = json.event;
    var data = json.data;

    if (!data) return;

    var documentId = data.documentId;

    if (event) {
      var eventType = event.eventType;

      switch (eventType) {
        case "Signed":
          var signerDetails = data.signerDetails;
          if (signerDetails && signerDetails.length > 0) {
            var signedEmails = signerDetails.filter(sd => sd["status"] == "Completed").map(sd => sd["signerEmail"]).join(", ");
            updateSignedStatus({ documentId, signedEmails });
          }
          break;
        case "Completed":
          saveSignedDocument({ documentId });
          break;
      }

    }

  } catch (err) {
    Logger.log("Error: " + err);
    return null;
  }
}

function updateSignedStatus({ documentId, signedEmails }) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SheetName);

  if (sheet.getLastRow() < 2 || sheet.getLastColumn() < 2) return;

  const data = sheet.getDataRange().getRichTextValues();
  const allHeaders = data[0].map(c => c.getText());

  const objHeaders = makeObjHeaderDetails_({ allHeaders });

  var map_documentId = data.map(r => r[[objHeaders["documentId"].columnIndex]].getText().toString().trim());

  if (map_documentId.includes(documentId)) {
    var vIndex = map_documentId.indexOf(documentId);
    var vRow = vIndex + 1;

    sheet.getRange(vRow, objHeaders["Signed Emails"].columnNumber).setValue(signedEmails);
  }
}

function saveSignedDocument({ documentId }) {
  var file = downloadAndSavePdf_({ documentId });

  if (file) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SheetName);

    if (sheet.getLastRow() < 2 || sheet.getLastColumn() < 2) return;

    const data = sheet.getDataRange().getRichTextValues();
    const allHeaders = data[0].map(c => c.getText());

    const objHeaders = makeObjHeaderDetails_({ allHeaders });

    var map_documentId = data.map(r => r[[objHeaders["documentId"].columnIndex]].getText().toString().trim());

    if (map_documentId.includes(documentId)) {
      var vIndex = map_documentId.indexOf(documentId);
      var vRow = vIndex + 1;

      try {
        var oldfilename = DriveApp.getFileById(getGoogleDriveId_(data[vIndex][objHeaders["PDF file"].columnIndex].getLinkUrl())).getName();
        file.setName(`Signed-${oldfilename}`);
      } catch (err) { console.log(err); }

      let fileRichText = SpreadsheetApp.newRichTextValue().setText(file.getName()).setLinkUrl(file.getUrl()).build();
      sheet.getRange(vRow, objHeaders["Signed file"].columnNumber).setRichTextValue(fileRichText);
    }

  }
}

function downloadAndSavePdf_({ documentId }) {
  var url = "https://api.boldsign.com/v1/document/download?documentId=" + encodeURIComponent(documentId);

  var options = {
    method: "get",
    headers: { "X-API-KEY": apiKey },
    muteHttpExceptions: true
  };

  var response = UrlFetchApp.fetch(url, options);

  if (response.getResponseCode() !== 200) {
    console.log("Failed to download PDF. HTTP " + response.getResponseCode() + " - " + response.getContentText());
  }

  var blob = response.getBlob();

  const filename = `Signed-${documentId}.pdf`;
  const file = DriveApp.getFolderById(FOLDER_ID).createFile(blob.setName(filename));
  return file;
}


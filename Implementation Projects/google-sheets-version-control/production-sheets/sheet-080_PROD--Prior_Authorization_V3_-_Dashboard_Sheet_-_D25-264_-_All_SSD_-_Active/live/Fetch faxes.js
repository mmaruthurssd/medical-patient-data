function fetchFaxes() {
  SpreadsheetApp.flush();
  Utilities.sleep(1000);

  var sourceSS = SpreadsheetApp.openById("1A7y3cwOAjwzZgtzTcr1q41fOtCpVedQTDHGUZKozBMc");
  var sourceSheet = sourceSS.getSheetByName("Incoming_Fax_Log (Main)");

  var allSourceData = sourceSheet.getRange(1, 1, sourceSheet.getLastRow(), sourceSheet.getLastColumn()).getDisplayValues();
  var sourceHeaders = allSourceData.splice(0, 1)[0];

  var sourceHeadingsObj = {};
  for (var i = 0; i < sourceHeaders.length; i++) {
    sourceHeadingsObj[sourceHeaders[i]] = i;
  }

  var destSS = SpreadsheetApp.getActiveSpreadsheet();
  var destSheet = destSS.getSheetByName("PA Faxes");
  var destHeaders = destSheet.getRange(1, 1, 1, destSheet.getLastColumn()).getDisplayValues()[0];

  var destHeadingsObj = {};
  for (var j = 0; j < destHeaders.length; j++) {
    destHeadingsObj[destHeaders[j]] = j;
  }

  var destLinks = destSheet
    .getRange(1, destHeadingsObj["LINK"] + 1, destSheet.getLastRow(), 1)
    .getDisplayValues()
    .map(function (r) { return r[0]; });

  SpreadsheetApp.flush();
  Utilities.sleep(1000);

  var PatientSS = SpreadsheetApp.openById("1nYzpVskLjQfaSBYbt-y_CZzAJfqLmh37Wqw9FHmvd1c");
  var PatientSheet = PatientSS.getSheetByName("Patients");
  var patientMrns = PatientSheet.getRange("A2:A").getDisplayValues().map(function (r) {
    return String(r[0]).trim();
  });
  var patientLinks = PatientSheet.getRange("H2:H").getValues();

  var newData = [];
  var newRichIDsData = [];

  for (var r = 0; r < allSourceData.length; r++) {
    var row = allSourceData[r];

    var linkIdx = destLinks.indexOf(row[sourceHeadingsObj["LINK"]]);
    if (linkIdx === -1 && row[sourceHeadingsObj["Document Type"]] === "Prior Auth Documents") {
      // Build mapped row in destination order
      var rowData = new Array(destHeaders.length);
      for (var key in destHeadingsObj) {
        if (Object.prototype.hasOwnProperty.call(destHeadingsObj, key)) {
          var sIdx = sourceHeadingsObj[key];
          rowData[destHeadingsObj[key]] = (sIdx !== undefined) ? row[sIdx] : "";
        }
      }
      newData.push(rowData);

      // MRN rich text link
      var mrnLink = null;
      var mrnIndex = patientMrns.indexOf(String(row[sourceHeadingsObj["Patient Id"]]));
      if (mrnIndex > -1) {
        mrnLink = patientLinks[mrnIndex][0];
      }
      var newRichMrn = SpreadsheetApp.newRichTextValue()
        .setText(String(row[sourceHeadingsObj["Patient Id"]]))
        .setLinkUrl(mrnLink)
        .build();
      newRichIDsData.push([newRichMrn]);
    }
  }

  if (newData.length > 0) {
    SpreadsheetApp.flush();
    Utilities.sleep(1000);

    var lastRow = destSheet.getLastRow() + 1;
    destSheet.getRange(lastRow, 1, newData.length, newData[0].length).setValues(newData);
    destSheet.getRange(lastRow, destHeadingsObj["Patient Id"] + 1, newRichIDsData.length, 1).setRichTextValues(newRichIDsData);

    var dataRows = destSheet.getLastRow() - 1;
    if (dataRows > 0) {
      destSheet.getRange(2, 1, dataRows, destSheet.getLastColumn())
        .sort([{ column: 1, ascending: false }, { column: 2, ascending: false }]);
    }
  }

  sendFaxtoPatients();
}

function sendFaxtoPatients() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("PA Faxes");

  var allData = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getValues();
  var headers = allData.splice(0, 1)[0];

  var Col = {
    link: headers.indexOf("LINK"),
    patientFolder: headers.indexOf("Patient Folder"),
    patientFolder_: headers.indexOf("Patient Folder_"),
    processed: headers.indexOf("Processed")
  };

  var rowCount = sheet.getLastRow() - 1;
  var richData = rowCount > 0
    ? sheet.getRange(2, Col.patientFolder_ + 1, rowCount, 2).getRichTextValues()
    : [];

  for (var i = 0; i < allData.length; i++) {
    var row = allData[i];
    if (row[Col.patientFolder] !== "" && row[Col.processed] === "") {
      try {
        var faxId = extractIdFromUrl_(row[Col.link]);
        var destFolderId = extractIdFromUrl_(richData[i][0].getLinkUrl());
        var destSsId = extractIdFromUrl_(richData[i][1].getLinkUrl());

        if (faxId && destFolderId && destSsId) {
          var faxFile = DriveApp.getFileById(faxId);
          var destFolder = DriveApp.getFolderById(destFolderId);

          faxFile.moveTo(destFolder);

          var destSS = SpreadsheetApp.openById(destSsId);
          var destSheet = destSS.getSheetByName("Documents");
          destSheet.getRange(destSheet.getLastRow() + 1, 1).setValue(row[Col.link]);

          sheet.getRange(i + 2, Col.processed + 1).setValue("Done");
        }
      } catch (err) {
        // swallow and continue to next row
      }
    }
  }
}

function extractIdFromUrl_(url) {
  var match = url && url.match(/[-\w]{25,}/);
  return match ? match[0] : null;
}

/** Optional helpers below (kept from your original) **/

function processFileMoving_(sheet, index, destCol, row, headersObj, folderMap, sheetMap) {
  try {
    var destSS = SpreadsheetApp.openById(sheetMap[row[headersObj[destCol]]]);
    var destSheet = destSS.getSheetByName("Documents");
    var richText = SpreadsheetApp.newRichTextValue()
      .setText(row[headersObj["File Name"]])
      .setLinkUrl(row[headersObj["File Url"]])
      .build();
    destSheet.getRange(destSheet.getLastRow() + 1, 1).setRichTextValue(richText);

    moveNow_(sheet, index, destCol, row, headersObj, folderMap);
  } catch (err) {}
}

function moveNow_(sheet, index, destCol, row, headersObj, folderMap) {
  try {
    var fileId = extractIdFromUrl_(row[headersObj["File Url"]]); // fixed: use _ helper
    var file = DriveApp.getFileById(fileId);
    var targetFolder = DriveApp.getFolderById(folderMap[row[headersObj[destCol]]]);

    file.moveTo(targetFolder);
    sheet.getRange(index + 1, headersObj["Processed"] + 1).setValue("Moved");
  } catch (err) {
    Logger.log("Error on row " + (index + 2) + ": " + err.message);
  }
}

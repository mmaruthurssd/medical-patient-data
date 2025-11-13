function findMrnsTemp() {
  var PatientSS = SpreadsheetApp.openById("1nYzpVskLjQfaSBYbt-y_CZzAJfqLmh37Wqw9FHmvd1c");
  var PatientSheet = PatientSS.getSheetByName("Patients");

  var patientIds = PatientSheet.getRange("A2:A").getDisplayValues();
  var patientNames = PatientSheet.getRange("B2:B").getValues();
  var patientDOB = PatientSheet.getRange("G2:G").getDisplayValues();
  var patientLinks = PatientSheet.getRange("H2:H").getValues();

  var patientIdObj = {};
  for (var i = 0; i < patientIds.length; i++) {
    var fullName = String(patientNames[i][0] || "").toLowerCase().trim();
    var dob = String(patientDOB[i][0] || "");
    var key = fullName + dob;
    patientIdObj[key] = { id: patientIds[i][0], link: patientLinks[i][0] };
  }

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return;

  // D:F (3 cols) from row 1
  var allData = sheet.getRange(1, 4, lastRow, 3).getDisplayValues();

  for (var r = 2; r <= lastRow; r++) {
    var row = allData[r - 1]; // zero-based offset
    // Col D (index 0) blank? then try to look up by E(name)/F(dob)
    if (!row[0]) {
      var name = String(row[1] || "").trim();
      var dob2 = String(row[2] || "");
      var newKey = (name + dob2).toLowerCase().trim();

      if (patientIdObj[newKey]) {
        var patientId = patientIdObj[newKey].id || "";
        var patientUrl = patientIdObj[newKey].link || null;

        var richText = SpreadsheetApp.newRichTextValue()
          .setText(String(patientId))
          .setLinkUrl(patientUrl)
          .build();

        sheet.getRange(r, 4).setRichTextValue(richText); // write to col D
      }
    }
  }
}

function hyperlinkMrns() {
  var PatientSS = SpreadsheetApp.openById("1nYzpVskLjQfaSBYbt-y_CZzAJfqLmh37Wqw9FHmvd1c");
  var PatientSheet = PatientSS.getSheetByName("Patients");
  var patientMrns = PatientSheet.getRange("A2:A").getDisplayValues().map(function (r) { return String(r[0] || "").trim(); });
  var patientLinks = PatientSheet.getRange("H2:H").getValues();

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return;

  var allMrns = sheet.getRange(2, 4, lastRow - 1, 1).getDisplayValues(); // column D
  var mrnRichText = [];

  for (var i = 0; i < allMrns.length; i++) {
    var mrn = String(allMrns[i][0] || "").trim();
    var link = null;
    var idx = patientMrns.indexOf(mrn);
    if (idx > -1) link = patientLinks[idx][0];

    var newRichText = SpreadsheetApp.newRichTextValue()
      .setText(mrn)
      .setLinkUrl(link)
      .build();

    mrnRichText.push([newRichText]);
  }

  sheet.getRange(2, 4, mrnRichText.length, 1).setRichTextValues(mrnRichText);
}

function testFunc() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();

  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
  var range = sheet.getRange(6, 1, 1, sheet.getLastColumn());
  var values = range.getDisplayValues()[0];

  var namedValues = {};
  for (var i = 0; i < headers.length; i++) {
    var h = headers[i];
    if (!namedValues[h]) namedValues[h] = [];
    namedValues[h].push(values[i]);
  }

  var e = {
    source: ss,
    range: range,
    values: values,
    namedValues: namedValues
  };

  onFormSubmitInstall(e);
}

function onFormSubmitInstall(e) {
  var ss = e.source;
  var sourceSheet = e.range.getSheet();
  var row = e.range.getRow();

  var sourceHeaders = sourceSheet.getRange(1, 1, 1, sourceSheet.getLastColumn()).getDisplayValues()[0];
  var sourceHeadersObj = {};
  for (var i = 0; i < sourceHeaders.length; i++) {
    sourceHeadersObj[sourceHeaders[i]] = i;
  }

  var sourceData = sourceSheet.getRange(row, 1, 1, sourceSheet.getLastColumn()).getDisplayValues()[0];

  var idTrackerSheet = ss.getSheetByName(THIS_SHEET.ID_TRACKER);
  var lastId = Number(idTrackerSheet.getRange("A2").getValue()) || 0;
  lastId += 1;
  idTrackerSheet.getRange("A2").setValue(lastId);

  sourceData[sourceHeadersObj["SSD PA ID#"]] = "PAR-" + lastId;

  var masterPASheet = ss.getSheetByName(THIS_SHEET.MASTER_PA);
  var masterHeaders = masterPASheet.getRange(2, 1, 1, masterPASheet.getLastColumn()).getDisplayValues()[0];

  var masterHeadersObj = {};
  for (var j = 0; j < masterHeaders.length; j++) {
    masterHeadersObj[masterHeaders[j]] = j;
  }

  var destRowData = new Array(masterHeaders.length);
  for (var k = 0; k < destRowData.length; k++) destRowData[k] = "";

  for (var key in masterHeadersObj) {
    if (Object.prototype.hasOwnProperty.call(masterHeadersObj, key)) {
      var sIdx = sourceHeadersObj[key];
      if (sIdx !== undefined) destRowData[masterHeadersObj[key]] = sourceData[sIdx];
    }
  }

  var todayDateStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "M/d/yyyy");
  if (masterHeadersObj["Date Added"] !== undefined) {
    destRowData[masterHeadersObj["Date Added"]] = todayDateStr;
  }

  masterPASheet.appendRow(destRowData);
  var masterPaLastRow = masterPASheet.getLastRow();
  sourceSheet.getRange(row, sourceHeadersObj["SSD PA ID#"] + 1).setValue(sourceData[sourceHeadersObj["SSD PA ID#"]]);

  // Create folder & file if MRN + Medication present
  if (sourceData[sourceHeadersObj["Patient MRN"]] && sourceData[sourceHeadersObj["Medication Name"]]) {
    var outputFolder = DriveApp.getFolderById(DEST_FOLDER_ID);
    var ssTemplateFile = DriveApp.getFileById(SS_TEMPLATE_ID);

    var folderName = sourceData[sourceHeadersObj["SSD PA ID#"]] + " - " +
                     sourceData[sourceHeadersObj["Patient MRN"]] + " - " +
                     sourceData[sourceHeadersObj["Medication Name"]] + " - " +
                     todayDateStr;

    var newFolder = outputFolder.createFolder(folderName);

    var folderRichText = SpreadsheetApp.newRichTextValue()
      .setText(folderName)
      .setLinkUrl(newFolder.getUrl())
      .build();

    var newFile = ssTemplateFile.makeCopy(folderName, newFolder);
    var fileRichText = SpreadsheetApp.newRichTextValue()
      .setText(folderName)
      .setLinkUrl(newFile.getUrl())
      .build();

    if (masterHeadersObj["Unique Patient Folder"] !== undefined &&
        masterHeadersObj["Unique Patient Google Sheet"] !== undefined) {
      masterPASheet.getRange(masterPaLastRow, masterHeadersObj["Unique Patient Folder"] + 1, 1, 2)
        .setRichTextValues([[folderRichText, fileRichText]]);
    }
  }
}

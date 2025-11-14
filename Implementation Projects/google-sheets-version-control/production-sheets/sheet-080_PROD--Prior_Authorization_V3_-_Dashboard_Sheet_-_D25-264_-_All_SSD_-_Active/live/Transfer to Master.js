// ==== CONFIG ====
const DEST_FOLDER_ID = "1rqivyWjkue6DcI6u5kyfBGM33gawSFQB";
const SS_TEMPLATE_ID = "1U958vaSOFsKx2kGLN18CcBmjC5NrnROTeuK_9k1HlDU";

const HIST_SS_ID = "1Zx1dLXFRB_pp8J5vs44k7ErujBBQEIutoQZxAFXOp9A";
const HIST_SHEET = "Final Historical PA List";

const MASTER_PA = "Master PA List";

const THIS_SHEET = {
  MASTER_PA: "Master PA List",
  ID_TRACKER: "ID_Tracker",
  NEW: "NEW",
  INITIAL_SUB: "Initial Submission",
  APPROVED: "Approved",
  In_Progress: "In-Progress",
  IN_Bbridge: "In Bridge Program",
  IN_Patient: "In Patient Assistance",
  Closed: "Closed",
  MASTER_ALL_DATA: "Master PA List - All Data",
  FORM_RESP: "Form Responses",
  MANUAL_RESP: "Manual List"
};

const BIO_COORDINATOR = [
  "1rmGaWR9e3y5PdNvGe2D5SDgKjJip4uyG34EQOxnIEGw",
  "1FZu7DIVr3IOnk6jSN_1L5hw2-lKbjkLlnsZIMbFOu-4",
  "14nWgK3Bcv4C6PRqb3ekwzrt5t-DMeTkrMRr8xqbVsxo",
  "1rzmQU1h6YoZh9wOozGMYOdiIvSY-6pV8LjVk5XMxA_Y",
  "19pzvDbL1aApa0dYPLmSQBsiY4LSLc39IF7z-MGGaxPU",
  "1NFiI4uiK8ByncbQyAbWS-Cq7PL56CanNWXq9x6IEpDk"
];

const BIO_COORDINATOR_NAMES = [
  "Kaitlyn Parker",
  "Emma Stephens",
  "Malia Downing",
  "Dena Yearwood",
  "Grace McMahan",
  "Dr. Maruthur"
];

const BIO_COORDINATOR_OBJ = {
  "Kaitlyn Parker": "1rmGaWR9e3y5PdNvGe2D5SDgKjJip4uyG34EQOxnIEGw",
  "Emma Stephens": "1FZu7DIVr3IOnk6jSN_1L5hw2-lKbjkLlnsZIMbFOu-4",
  "Dr. Downing": "14nWgK3Bcv4C6PRqb3ekwzrt5t-DMeTkrMRr8xqbVsxo",
  "Dena Yearwood": "1rzmQU1h6YoZh9wOozGMYOdiIvSY-6pV8LjVk5XMxA_Y",
  "Grace McMahan": "19pzvDbL1aApa0dYPLmSQBsiY4LSLc39IF7z-MGGaxPU",
  "Dr. Maruthur": "1NFiI4uiK8ByncbQyAbWS-Cq7PL56CanNWXq9x6IEpDk"
};

// ==== TRIGGERS ====
function createDailyTrigger() {
  deleteDailyTrigger();
  ScriptApp.newTrigger("sendDataToMasterPAMain")
    .timeBased()
    .everyDays(1)
    .atHour(5)
    .nearMinute(0)
    .inTimezone(Session.getScriptTimeZone())
    .create();
}

function deleteDailyTrigger() {
  const allTriggers = ScriptApp.getProjectTriggers();
  for (var index = 0; index < allTriggers.length; index++) {
    if (allTriggers[index].getHandlerFunction() === "sendDataToMasterPAMain") {
      ScriptApp.deleteTrigger(allTriggers[index]);
    }
  }
}

// ==== MENU ====
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("Custom")
    .addItem("Fetch New Data", "sendDataToMasterPAMain")
    .addItem("Process Status", "processStatusMain")
    .addToUi();
}

// ==== UTILS ====
function clearFilterOnActiveSheet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const filter = sheet.getFilter();
  if (filter) filter.remove();
}

// ==== MAIN ====
function sendDataToMasterPAMain() {
  SpreadsheetApp.flush();
  Utilities.sleep(1000);

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const masterPASheet = ss.getSheetByName(THIS_SHEET.MASTER_PA);
  if (!masterPASheet) throw new Error('Sheet "' + THIS_SHEET.MASTER_PA + '" not found.');

  const masterFilter = masterPASheet.getFilter();
  if (masterFilter) masterFilter.remove();

  const masterHeaders = masterPASheet
    .getRange(2, 1, 1, masterPASheet.getLastColumn())
    .getDisplayValues()[0];

  var masterHeadersObj = {};
  for (var i = 0; i < masterHeaders.length; i++) {
    masterHeadersObj[masterHeaders[i]] = i;
  }

  var PatientSS = SpreadsheetApp.openById("1nYzpVskLjQfaSBYbt-y_CZzAJfqLmh37Wqw9FHmvd1c");
  var PatientSheet = PatientSS.getSheetByName("Patients");
  var patientMrns = PatientSheet.getRange("A2:A").getDisplayValues().map(function (r) { return r[0]; });
  var patientLinks = PatientSheet.getRange("H2:H").getValues();

  const idTrackerSheet = ss.getSheetByName(THIS_SHEET.ID_TRACKER);

  // Build coordinator sheets map (fixed for-in loop)
  const bioCordSheetsObj = {};
  Object.keys(BIO_COORDINATOR_OBJ).forEach(function (key) {
    bioCordSheetsObj[key] = SpreadsheetApp
      .openById(BIO_COORDINATOR_OBJ[key])
      .getSheetByName("PA List");
  });

  const formSheet = ss.getSheetByName(THIS_SHEET.FORM_RESP);
  if (formSheet) {
    sendDataToDest_(ss, formSheet, masterPASheet, masterHeaders, masterHeadersObj,
      idTrackerSheet, "", patientMrns, patientLinks, bioCordSheetsObj);
  }

  SpreadsheetApp.flush();

  const manualSheet = ss.getSheetByName(THIS_SHEET.MANUAL_RESP);
  if (manualSheet) {
    sendDataToDest_(ss, manualSheet, masterPASheet, masterHeaders, masterHeadersObj,
      idTrackerSheet, "", patientMrns, patientLinks, bioCordSheetsObj);
  }

  // Pull from each coordinator sheet by ID list
  for (var j = 0; j < BIO_COORDINATOR.length; j++) {
    try {
      var cooSS = SpreadsheetApp.openById(BIO_COORDINATOR[j]);
      var cooSheet = cooSS.getSheetByName("PA List");
      if (cooSheet) {
        sendDataToDest_(ss, cooSheet, masterPASheet, masterHeaders, masterHeadersObj,
          idTrackerSheet, BIO_COORDINATOR_NAMES[j], patientMrns, patientLinks);
      }
    } catch (err) { /* ignore bad/missing sheets */ }
  }

  // Sort by Date (col 2) desc
  if (masterPASheet.getLastRow() > 2) {
    masterPASheet.getRange(3, 1, masterPASheet.getLastRow() - 2, masterPASheet.getLastColumn())
      .sort([{ column: 2, ascending: false }]);
  }

  Utilities.sleep(1000);
  SpreadsheetApp.flush();

  createFolderAndSheet_(masterPASheet, masterHeadersObj);

  SpreadsheetApp.flush();
  if (typeof processStatusMain === 'function') {
    processStatusMain();
  }
}

// ==== FOLDER + SHEET CREATION ====
function createFolderAndSheet_(sheet, headersObj) {
  if (sheet.getLastRow() <= 2) return; // nothing to do

  var outputFolder = DriveApp.getFolderById(DEST_FOLDER_ID);
  var ssFile = DriveApp.getFileById(SS_TEMPLATE_ID);

  var allData = sheet.getRange(3, 1, sheet.getLastRow() - 2, sheet.getLastColumn()).getDisplayValues();
  var allRichData = sheet
    .getRange(3, headersObj["Unique Patient Folder"] + 1, sheet.getLastRow() - 2, 2)
    .getRichTextValues();

  for (var i = 0; i < allData.length; i++) {
    if (allData[i][headersObj["Patient MRN"]] !== "" &&
        allData[i][headersObj["Medication Name"]] !== "" &&
        allData[i][headersObj["Unique Patient Folder"]] === "") {

      var folderName = allData[i][headersObj["Patient Name"]] + " - " +
                       allData[i][headersObj["Patient MRN"]] + " - " +
                       allData[i][headersObj["Medication Name"]] + " - " +
                       allData[i][headersObj["SSD PA ID#"]];

      var newFolder = outputFolder.createFolder(folderName);
      var folderRichText = SpreadsheetApp.newRichTextValue()
        .setText(folderName).setLinkUrl(newFolder.getUrl()).build();
      allRichData[i][0] = folderRichText;

      var newFile = ssFile.makeCopy(folderName, newFolder);
      try {
        SpreadsheetApp.openById(newFile.getId())
          .getSheetByName("Documents")
          .getRange("A1").setRichTextValue(folderRichText);
      } catch (foldErr) { /* ignore */ }

      var fileRichText = SpreadsheetApp.newRichTextValue()
        .setText(folderName).setLinkUrl(newFile.getUrl()).build();
      allRichData[i][1] = fileRichText;
    }
  }

  sheet.getRange(3, headersObj["Unique Patient Folder"] + 1, allRichData.length, 2)
    .setRichTextValues(allRichData);
}

// ==== COPY TO MASTER ====
function sendDataToDest_(
  ss, sourceSheet, destSheet, destHeaders, destHeadersObj,
  idTrackerSheet, bioCoordinator, patientMrns, patientLinks, bioCordSheetsObj
) {
  var todayDateStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "M/d/yyyy");

  var sourceData = sourceSheet.getRange(1, 1, sourceSheet.getLastRow(), sourceSheet.getLastColumn()).getDisplayValues();
  if (!sourceData.length) return;

  var sourceHeaders = sourceSheet.getRange(1, 1, 1, sourceSheet.getLastColumn()).getDisplayValues()[0];
  var sourceHeadersObj = {};
  for (var i = 0; i < sourceHeaders.length; i++) {
    sourceHeadersObj[sourceHeaders[i]] = i;
  }

  var sourceIds = sourceSheet.getRange(1, sourceHeadersObj["SSD PA ID#"] + 1, sourceSheet.getLastRow(), 1).getDisplayValues();
  var lastId = Number(idTrackerSheet.getRange("A2").getValue()) || 0;

  var sourceSheetName = sourceSheet.getName();
  var newData = [];
  var newRichIDsData = [];

  for (var r = sourceData.length - 1; r >= 0; r--) {
    if (sourceHeadersObj["Ready for FINAL Move to Master PA List"]) {
      if (sourceData[r][sourceHeadersObj["Ready for FINAL Move to Master PA List"]] !== "Moved") continue;
    }

    if (sourceData[r][sourceHeadersObj["SSD PA ID#"]] === "" &&
        sourceData[r][sourceHeadersObj["Patient MRN"]] !== "" &&
        sourceData[r][sourceHeadersObj["Patient Name"]] !== "" &&
        sourceData[r][sourceHeadersObj["Medication Name"]] !== "") {

      lastId += 1;
      sourceData[r][sourceHeadersObj["SSD PA ID#"]] = "PAR-" + lastId;
      sourceIds[r][0] = "PAR-" + lastId;

      var destRowData = new Array(destHeaders.length).fill("");
      for (var key in destHeadersObj) {
        if (sourceHeadersObj[key] || sourceHeadersObj[key] === 0) {
          destRowData[destHeadersObj[key]] = sourceData[r][sourceHeadersObj[key]];
        }
      }

      if (destRowData[destHeadersObj["Date Prescribed"]] === "") {
        destRowData[destHeadersObj["Date Prescribed"]] = todayDateStr;
      }

      if (bioCoordinator) {
        destRowData[destHeadersObj["Prescriber"]] = bioCoordinator;
      }

      if (sourceSheetName === THIS_SHEET.MANUAL_RESP) {
        destRowData[destHeadersObj["Current Status"]] = "Manual New";
      } else {
        destRowData[destHeadersObj["Current Status"]] = "New";
      }

      destRowData[destHeadersObj["Medication Source"]] = "";
      destRowData[destHeadersObj["Loading Dose Given"]] = "";
      destRowData[destHeadersObj["Initial Pharmacy"]] = "";
      destRowData[destHeadersObj["Team Notes"]] = "";
      destRowData[destHeadersObj["Unreveiwed / Total Faxes"]] = "";

      newData.push(destRowData);

      var mrnLink = null;
      var mrnIndex = patientMrns.indexOf(String(sourceData[r][sourceHeadersObj["Patient MRN"]]));
      if (mrnIndex > -1) mrnLink = patientLinks[mrnIndex][0];

      var newRichMrn = SpreadsheetApp.newRichTextValue()
        .setText(sourceData[r][sourceHeadersObj["Patient MRN"]])
        .setLinkUrl(mrnLink)
        .build();
      newRichIDsData.push([newRichMrn]);

      if (sourceSheetName === THIS_SHEET.FORM_RESP || sourceSheetName === THIS_SHEET.MANUAL_RESP) {
        try {
          var presc = sourceData[r][sourceHeadersObj["Prescriber"]];
          if (bioCordSheetsObj && bioCordSheetsObj[presc]) {
            bioCordSheetsObj[presc].insertRowAfter(3);
            bioCordSheetsObj[presc]
              .getRange(4, 1, 1, 9)
              .setValues([[
                sourceData[r][sourceHeadersObj["SSD PA ID#"]],
                sourceData[r][sourceHeadersObj["Date Prescribed"]],
                sourceData[r][sourceHeadersObj["Patient MRN"]],
                sourceData[r][sourceHeadersObj["Patient Name"]],
                sourceData[r][sourceHeadersObj["Medication Name"]],
                "", "",
                sourceData[r][sourceHeadersObj["Initial Pharmacy"]],
                sourceData[r][sourceHeadersObj["Additional Notes"]]
              ]]);
          }
        } catch (formErr) { Logger.log("formErr: " + formErr); }
      }

      if (sourceSheetName === THIS_SHEET.MANUAL_RESP) {
        sourceSheet.deleteRows(r + 1, 1);
      }
    }
  }

  if (newData.length > 0) {
    idTrackerSheet.getRange("A2").setValue(lastId);
    if (sourceSheetName !== THIS_SHEET.MANUAL_RESP) {
      sourceSheet.getRange(1, sourceHeadersObj["SSD PA ID#"] + 1, sourceIds.length, 1).setValues(sourceIds);
    }
    var destLastRow = destSheet.getLastRow() + 1;
    destSheet.getRange(destLastRow, 1, newData.length, newData[0].length).setValues(newData);
    destSheet.getRange(destLastRow, destHeadersObj["Patient MRN"] + 1, newRichIDsData.length, 1).setRichTextValues(newRichIDsData);
  }
}

// ==== ID HELPER ====
function createIds_(sheet, idTrackerSheet) {
  var lastId = Number(idTrackerSheet.getRange("A2").getValue()) || 0;

  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
  var idCol = headers.indexOf("SSD PA ID#") + 1;

  var allIds = sheet.getRange(1, idCol, sheet.getLastRow(), 1).getDisplayValues();
  for (var i = 0; i < allIds.length; i++) {
    if (allIds[i][0] === "") {
      lastId += 1;
      allIds[i][0] = "PAR-" + lastId;
    }
  }

  idTrackerSheet.getRange("A2").setValue(lastId);
  sheet.getRange(1, idCol, allIds.length, 1).setValues(allIds);
}

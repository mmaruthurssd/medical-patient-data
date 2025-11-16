/***** Status Process (compat-safe) *****/

function processStatusMain() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var masterPASheet = ss.getSheetByName(THIS_SHEET.MASTER_PA);
  transferDataBasedOnStatus_(ss, masterPASheet, masterPASheet);

  function clearAndSortDescByCol3(sheet) {
    if (!sheet) return;
    var f = sheet.getFilter();
    if (f) f.remove();
    var rows = sheet.getLastRow() - 2;
    if (rows > 0) {
      sheet.getRange(3, 1, rows, sheet.getLastColumn())
        .sort([{ column: 3, ascending: false }]);
    }
  }



  var approvedSheet = ss.getSheetByName(THIS_SHEET.APPROVED);
  transferDataBasedOnStatus_(ss, approvedSheet, masterPASheet);
  clearAndSortDescByCol3(approvedSheet);

  var inPatientSheet = ss.getSheetByName(THIS_SHEET.IN_Patient);
  transferDataBasedOnStatus_(ss, inPatientSheet, masterPASheet);
  clearAndSortDescByCol3(inPatientSheet);

  var inBridgeSheet = ss.getSheetByName(THIS_SHEET.IN_Bbridge);
  transferDataBasedOnStatus_(ss, inBridgeSheet, masterPASheet);
  clearAndSortDescByCol3(inBridgeSheet);

  var inProgressSheet = ss.getSheetByName(THIS_SHEET.In_Progress);
  transferDataBasedOnStatus_(ss, inProgressSheet, masterPASheet);
  clearAndSortDescByCol3(inProgressSheet);

  // If you also want Closed:
  var closedSheet = ss.getSheetByName(THIS_SHEET.Closed);
  transferDataBasedOnStatus_(ss, closedSheet, masterPASheet);
  clearAndSortDescByCol3(closedSheet);

  var newSheet = ss.getSheetByName(THIS_SHEET.NEW);
  transferDataBasedOnStatus_(ss, newSheet, masterPASheet);
  clearAndSortDescByCol3(newSheet);
}


function transferDataBasedOnStatus_(ss, sourceSheet, masterAllSheet) {
  if (!sourceSheet || !masterAllSheet) return;

  SpreadsheetApp.flush()
  var masterHObj = getHeadersObj_(masterAllSheet);
  var masterData = masterAllSheet
    .getRange(1, 1, masterAllSheet.getLastRow(), masterAllSheet.getLastColumn())
    .getDisplayValues();
  var masterAllIds = masterData.map(function (r) {
    return r[masterHObj.headersObj["SSD PA ID#"]];
  });

  var newSheet = ss.getSheetByName(THIS_SHEET.NEW);
  var newHObj = getHeadersObj_(newSheet);
  var newIds = newSheet
    .getRange(1, newHObj.headersObj["SSD PA ID#"] + 1, newSheet.getLastRow(), 1)
    .getDisplayValues()
    .map(function (r) { return r[0]; });

  var initialSubSheet = ss.getSheetByName(THIS_SHEET.INITIAL_SUB);
  var initialSubHObj = getHeadersObj_(initialSubSheet);
  var initialSubIds = initialSubSheet
    .getRange(1, initialSubHObj.headersObj["SSD PA ID#"] + 1, initialSubSheet.getLastRow(), 1)
    .getDisplayValues()
    .map(function (r) { return r[0]; });

  var approvedSheet = ss.getSheetByName(THIS_SHEET.APPROVED);
  var approvedHObj = getHeadersObj_(approvedSheet);
  var approvedIds = approvedSheet
    .getRange(1, approvedHObj.headersObj["SSD PA ID#"] + 1, approvedSheet.getLastRow(), 1)
    .getDisplayValues()
    .map(function (r) { return r[0]; });

  var inProgressSheet = ss.getSheetByName(THIS_SHEET.In_Progress);
  var inProgressHObj = getHeadersObj_(inProgressSheet);
  var inProgressIds = inProgressSheet
    .getRange(1, inProgressHObj.headersObj["SSD PA ID#"] + 1, inProgressSheet.getLastRow(), 1)
    .getDisplayValues()
    .map(function (r) { return r[0]; });

  var inBridgeSheet = ss.getSheetByName(THIS_SHEET.IN_Bbridge);
  var inBridgeHObj = getHeadersObj_(inBridgeSheet);
  var inBridgeIds = inBridgeSheet
    .getRange(1, inBridgeHObj.headersObj["SSD PA ID#"] + 1, inBridgeSheet.getLastRow(), 1)
    .getDisplayValues()
    .map(function (r) { return r[0]; });

  var inPatientSheet = ss.getSheetByName(THIS_SHEET.IN_Patient);
  var inPatientHObj = getHeadersObj_(inPatientSheet);
  var inPatientIds = inPatientSheet
    .getRange(1, inPatientHObj.headersObj["SSD PA ID#"] + 1, inPatientSheet.getLastRow(), 1)
    .getDisplayValues()
    .map(function (r) { return r[0]; });

  var closedSheet = ss.getSheetByName(THIS_SHEET.Closed);
  var closedHObj = getHeadersObj_(closedSheet);
  var closedIds = closedSheet
    .getRange(1, closedHObj.headersObj["SSD PA ID#"] + 1, closedSheet.getLastRow(), 1)
    .getDisplayValues()
    .map(function (r) { return r[0]; });

  var srcRows = Math.max(0, sourceSheet.getLastRow() - 1);
  if (srcRows === 0) return;

  var sourceData = sourceSheet
    .getRange(2, 1, srcRows, sourceSheet.getLastColumn())
    .getDisplayValues();
  var sourceHeaders = sourceData.splice(0, 1)[0];

  var sourceHeadersObj = {};
  for (var i = 0; i < sourceHeaders.length; i++) {
    sourceHeadersObj[sourceHeaders[i]] = i;
  }
  if (sourceData.length === 0) return;

  var sourceRichData = sourceSheet
    .getRange(3, 1, Math.max(0, sourceSheet.getLastRow() - 1), sourceSheet.getLastColumn())
    .getRichTextValues();

  var sourceSheetName = sourceSheet.getName();
  for (var r = sourceData.length - 1; r >= 0; r--) {
    if (sourceData[r][sourceHeadersObj["SSD PA ID#"]] === "" ||
      sourceData[r][sourceHeadersObj["Current Status"]] === "" ||
      sourceData[r][sourceHeadersObj["Patient MRN"]] === "") {
      continue;
    }

    if (String(sourceData[r][sourceHeadersObj["Current Status"]]).indexOf("New") > -1 &&
      sourceSheetName !== THIS_SHEET.NEW) {
      masterAllIds = processCurrentStatusRow_(
        sourceSheet, sourceHeadersObj, sourceData[r], sourceRichData,
        newSheet, newHObj, r, masterAllSheet, masterData, masterAllIds,
        masterHObj, sourceSheetName, newIds, "New"
      );
    }

    if (sourceSheetName === THIS_SHEET.MASTER_PA) continue;

    if (String(sourceData[r][sourceHeadersObj["Current Status"]]).indexOf("Approved") > -1 &&
      sourceSheetName !== THIS_SHEET.APPROVED) {
      masterAllIds = processCurrentStatusRow_(
        sourceSheet, sourceHeadersObj, sourceData[r], sourceRichData,
        approvedSheet, approvedHObj, r, masterAllSheet, masterData, masterAllIds,
        masterHObj, sourceSheetName, approvedIds, "Approved"
      );
    }

    if (String(sourceData[r][sourceHeadersObj["Current Status"]]).indexOf("In-Progress") > -1 &&
      sourceSheetName !== THIS_SHEET.In_Progress) {
      masterAllIds = processCurrentStatusRow_(
        sourceSheet, sourceHeadersObj, sourceData[r], sourceRichData,
        inProgressSheet, inProgressHObj, r, masterAllSheet, masterData, masterAllIds,
        masterHObj, sourceSheetName, inProgressIds, "In-Progress"
      );
    }

    if (String(sourceData[r][sourceHeadersObj["Current Status"]]).indexOf("Initial Submission") > -1 &&
      sourceSheetName !== THIS_SHEET.In_Progress) {
      masterAllIds = processCurrentStatusRow_(
        sourceSheet, sourceHeadersObj, sourceData[r], sourceRichData,
        inProgressSheet, inProgressHObj, r, masterAllSheet, masterData, masterAllIds,
        masterHObj, sourceSheetName, inProgressIds, "Initial Submission"
      );
    }

    if (String(sourceData[r][sourceHeadersObj["Current Status"]]).indexOf("Closed") > -1 &&
      sourceSheetName !== THIS_SHEET.Closed) {
      masterAllIds = processCurrentStatusRow_(
        sourceSheet, sourceHeadersObj, sourceData[r], sourceRichData,
        closedSheet, closedHObj, r, masterAllSheet, masterData, masterAllIds,
        masterHObj, sourceSheetName, closedIds, "Closed"
      );
    }

    var medSrc = String(sourceData[r][sourceHeadersObj["Medication Source"]]);
    var curStat = String(sourceData[r][sourceHeadersObj["Current Status"]]);

    // if ((medSrc.indexOf("Bridge") > -1 || curStat.indexOf("In Bridge") > -1) && sourceSheetName !== THIS_SHEET.IN_Bbridge) {
    if (curStat.indexOf("In Bridge") > -1 && sourceSheetName !== THIS_SHEET.IN_Bbridge) {
      sourceData[r][sourceHeadersObj["Current Status"]] = "In Bridge";
      masterAllIds = processCurrentStatusRow_(
        sourceSheet, sourceHeadersObj, sourceData[r], sourceRichData,
        inBridgeSheet, inBridgeHObj, r, masterAllSheet, masterData, masterAllIds,
        masterHObj, sourceSheetName, inBridgeIds, "In Bridge"
      );
    }

    if (curStat.indexOf("In Patient Assistance") > -1 &&
      sourceSheetName !== THIS_SHEET.IN_Patient) {
      masterAllIds = processCurrentStatusRow_(
        sourceSheet, sourceHeadersObj, sourceData[r], sourceRichData,
        inPatientSheet, inPatientHObj, r, masterAllSheet, masterData, masterAllIds,
        masterHObj, sourceSheetName, inPatientIds, "In Patient Assistance"
      );
    }
  }
}


function processCurrentStatusRow_(
  sourceSheet, sourceHeadersObj, sourceDataRow, sourceRichData,
  destSheet, HObj, i, masterAllSheet, masterData, masterAllIds,
  masterHObj, sourceSheetName, destIds, status
) {

  if (sourceDataRow[sourceHeadersObj["SSD PA ID#"]] == "PAR-124") {
    Logger.log(sourceDataRow[sourceHeadersObj["SSD PA ID#"]])
    Logger.log(sourceSheet.getName());
    Logger.log(destSheet.getName())

  }
  var mrnRich = sourceRichData[i][sourceHeadersObj["Patient MRN"]];
  var folderRich = sourceRichData[i][sourceHeadersObj["Unique Patient Folder"]];
  var sheetRich = sourceRichData[i][sourceHeadersObj["Unique Patient Google Sheet"]];

  var indexInMaster = masterAllIds.indexOf(sourceDataRow[sourceHeadersObj["SSD PA ID#"]]);
  var destMasterRow = new Array(masterHObj.headers.length).fill("");
  if (indexInMaster > -1) destMasterRow = masterData[indexInMaster];

  for (var key in masterHObj.headersObj) {
    if (!Object.prototype.hasOwnProperty.call(masterHObj.headersObj, key)) continue;
    if ((sourceHeadersObj[key] || sourceHeadersObj[key] === 0) &&
      key !== "Unique Patient Folder" &&
      key !== "Unique Patient Google Sheet" &&
      key !== "Patient MRN" &&
      key !== "Lydia's PA Notes") {

      destMasterRow[masterHObj.headersObj[key]] = sourceDataRow[sourceHeadersObj[key]];
      if (sourceDataRow[sourceHeadersObj["SSD PA ID#"]] == "PAR-124") {
        Logger.log(key + ": " + destMasterRow[masterHObj.headersObj[key]])
      }
    }
  }

  try {
    if (sourceDataRow[sourceHeadersObj["Lydia's PA Notes"]]) {
      var prev = String(destMasterRow[masterHObj.headersObj["Lydia's PA Notes"]] || "");
      var add = String(sourceDataRow[sourceHeadersObj["Lydia's PA Notes"]]);
      destMasterRow[masterHObj.headersObj["Lydia's PA Notes"]] =
        prev.replace(add, "").trim() + "\n" + add;
    }
  } catch (e) { }

  try { destMasterRow[masterHObj.headersObj["Unreveiwed / Total Faxes"]] = ""; } catch (e) { }
  try { destMasterRow[masterHObj.headersObj["Medication Source"]] = ""; } catch (e) { }
  try { destMasterRow[masterHObj.headersObj["Loading Dose Given"]] = ""; } catch (e) { }
  try { destMasterRow[masterHObj.headersObj["Initial Pharmacy"]] = ""; } catch (e) { }
  try { destMasterRow[masterHObj.headersObj["Team Notes"]] = ""; } catch (e) { }

  if (sourceSheetName !== THIS_SHEET.MASTER_PA) {
    if (indexInMaster > -1) {
      masterAllSheet.getRange(indexInMaster + 1, 1, 1, destMasterRow.length).setValues([destMasterRow]);
      masterAllSheet.getRange(indexInMaster + 1, masterHObj.headersObj["Unique Patient Folder"] + 1, 1, 2)
        .setRichTextValues([[folderRich, sheetRich]]);
      masterAllSheet.getRange(indexInMaster + 1, masterHObj.headersObj["Patient MRN"] + 1, 1, 1)
        .setRichTextValue(mrnRich);
    } else {
      masterAllSheet.getRange(masterAllSheet.getLastRow() + 1, 1, 1, destMasterRow.length).setValues([destMasterRow]);
      masterAllSheet.getRange(masterAllSheet.getLastRow(), masterHObj.headersObj["Unique Patient Folder"] + 1, 1, 2)
        .setRichTextValues([[folderRich, sheetRich]]);
      masterAllSheet.getRange(masterAllSheet.getLastRow(), masterHObj.headersObj["Patient MRN"] + 1, 1, 1)
        .setRichTextValue(mrnRich);
      masterAllIds.push(sourceDataRow[sourceHeadersObj["SSD PA ID#"]]);
    }
  }

  var indexInDestSheet = destIds.indexOf(sourceDataRow[sourceHeadersObj["SSD PA ID#"]]);
  if (indexInDestSheet === -1) {
    if (status === "New") {
      destSheet.appendRow([
        destMasterRow[masterHObj.headersObj["SSD PA ID#"]],
        destMasterRow[masterHObj.headersObj["Current Status"]],
        destMasterRow[masterHObj.headersObj["Date Prescribed"]]
      ]);
    } else {
      destSheet.appendRow([
        destMasterRow[masterHObj.headersObj["SSD PA ID#"]],
        destMasterRow[masterHObj.headersObj["Current Status"]]
      ]);
    }
    try {
      if (HObj.headersObj["Allison's PA Notes"] && masterHObj.headersObj["Allison's PA Notes"]) {
        destSheet.getRange(destSheet.getLastRow(), HObj.headersObj["Allison's PA Notes"] + 1)
          .setValue(destMasterRow[masterHObj.headersObj["Allison's PA Notes"]]);
      }
    } catch (e) { }
  }

  if (sourceSheetName !== THIS_SHEET.MASTER_PA && status !== "New") {
    sourceSheet.deleteRows(i + 3, 1);
  }

  return masterAllIds;
}

function getHeadersObj_(sheet) {
  if (!sheet) return { headersObj: {}, headers: [] };
  var headers = sheet.getRange(2, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
  var headersObj = {};
  for (var i = 0; i < headers.length; i++) {
    headersObj[headers[i]] = i;
  }
  return { headersObj: headersObj, headers: headers };
}

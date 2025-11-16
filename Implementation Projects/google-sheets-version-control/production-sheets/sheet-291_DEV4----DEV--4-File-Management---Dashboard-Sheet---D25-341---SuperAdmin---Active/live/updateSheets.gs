function updateSheets_documentsTab() {
  return;

  SpreadsheetApp.flush();
  var objListOfSS = getListsOfSpreadsheets_().objSheetRef;

  var allHeader = ["File Name (Hyperlinked)", "Relevant Date", "Notes", "Rename"];

  Object.entries(objListOfSS).forEach(([id, obj]) => {
    var sid = obj.sheetID;
    var sLink = obj.sheetLink;

    var tempSS = SpreadsheetApp.openById(sid);
    var tempSheet = tempSS.getSheetByName("Documents");
    if (!tempSheet) return;

    console.log({ sLink, sid });

    tempSheet.getRange(2, 1, 1, allHeader.length).setValues([allHeader]);
  });
}

function getListsOfSpreadsheets_() {
  const vHeaderRow = 2;

  const ssID_FileManagement = '1KMsidrbBLL_cc1vmiSozSopW4AMIGTDHMgSNDs0kGYw';
  const ssFileManagement = SpreadsheetApp.openById(ssID_FileManagement);
  const sheetNames = ["Projects", "Dashboards", "Google Sheets", "Processing Sheets", "Uncategorized"];

  const objType = {
    "Projects": "Projects",
    "Dashboards": "Dashboards",
    "Google Sheets": "Sheet",
    "Processing Sheets": "Processing Sheets",
    "Uncategorized": "Uncategorized"
  }

  var objSheetRef = {};
  var objFolderRef = {};

  sheetNames.map(function (sheetName) {
    var sheet = ssFileManagement.getSheetByName(sheetName);
    if (sheet) {
      if (sheet.getLastRow() > vHeaderRow) {
        var allDataRichText = sheet.getDataRange().getRichTextValues();

        const headers = allDataRichText[vHeaderRow - 1].map(r => r.getText());

        allDataRichText.splice(0, 2);

        var tempDataObj = makeObjectData_(allDataRichText, headers);

        tempDataObj.map(function (r) {
          var status = r["Status"].getText();
          var sheetLink = r["Sheet"].getLinkUrl();
          var folderLink = r["Folder"].getLinkUrl();

          var sheetID = getGoogleDriveId_(sheetLink);
          var foldrID = getGoogleDriveId_(folderLink);

          var idNo = r["ID #"].getText();
          var shared_Drive = r["Shared Drive"].getText();
          var type = objType[sheetName];

          if (![sheetLink, folderLink, sheetID, foldrID].includes(null) && status == "Active") {
            objSheetRef[sheetID] = { sheetLink, folderLink, sheetID, foldrID, idNo, shared_Drive, type, status };
            objFolderRef[foldrID] = { sheetLink, folderLink, sheetID, foldrID, idNo, shared_Drive, type, status };
          }

        });

      }
    } else {
      console.log(`[${sheetName}] sheet is missing.`);
    }
  });

  return { objSheetRef, objFolderRef };
}

function makeObjectData_(data, headers) {
  var dataOutput = [];

  if (!headers) { headers = data[0]; }

  for (var rr = 0; rr < data.length; rr++) {
    var obj = {};

    for (var cc = 0; cc < headers.length; cc++) {
      if (headers[cc] != "") {
        obj[headers[cc]] = data[rr][cc];
      }
    }

    dataOutput.push(obj)
  }

  return dataOutput;
}

function getGoogleDriveId_(url) {
  if (!url) { return null; }

  const regex = /[-\w]{25,}/;
  const match = url.match(regex);

  if (match && match[0]) {
    return match[0];
  } else {
    console.log("Could not extract a valid Google Drive ID from the URL.");
    return null;
  }
}








const IDS = {

  "Google Forms": {
    "All SSD": "1DbeXWdY8qyTVB0j-mXGSm0sF78a2_2Vi",
    "SuperAdmin": "17PepP4WeEP4rTa1kndELXlmsryOygxeq",
    "Billing": "1VPfdkIpKkPGeEqcUg4w-Udln4MkF4aj9",
    "MegaAdmin": "12GasiVkb73acF_nzTSauV9jczssL3D1h",
    "Archived": "1010b4EcgVJ6NVB3rFD14SI0NJ8EbaxYm",
    "Temp Sheet": ""
  },

  "Dashboards": {
    "All SSD": "1XqwCyInwaoZwa7vMCCr8f0S8Qu5vBMpi",
    "SuperAdmin": "1G-qHp7pSben38n5j-4DTdGRTjJzTQkqv",
    "Billing": "1IG16XaA1EwB-C92GQ2Cdujzh8vLLQfMw",
    "MegaAdmin": "1bHOEe5VGVDyEevME3EMNhYe4inriI-jy",
    "Archived": "1bUcnGz-V2ICnByPyk5DHFjzeG1vMiALn",
    "Temp Sheet": "1lQhHBun3EN3hXcd6DKgQYfUgZDt42Ws5ArGF4VmfLLc"
  },

  "Projects": {
    "All SSD": "1AqS2RSG0eIl70tmTSApM-uRFSluCJLhI",
    "SuperAdmin": "1KBdaqi0jI96QIgDE3wiJFObOkOF7VU5N",
    "Billing": "1-aXSDYEsTJQMqj06eZzDdJ724O9BhAZi",
    "MegaAdmin": "11YV0SXIRtChIqRduBo5EsW0V5_lE_8Qn",
    "Archived": "1H_1uRo9Y3PU1dNBfWYcHeNOQaVug_DIK",
    "AI No PHI": "1QRj7MVRFU-IzAeCkvYPwKSP3oNhbv8n2",
    "Temp Sheet": "1Cs5iyGRJCPfI4tRpztimK8ktwhDvVFK8xSl0YTPjteI",
  },

  "Google Sheets": {
    "All SSD": "1xmQsH1vfPirVUsJtRqUg6oJ3c5dKJZ27",
    "SuperAdmin": "1weUF-UFnFjyB7GhuUVoPCuzeWRNCqngV",
    "Billing": "1Am08Vv8sn1oVlBBRPnbJNA4fnRu0WL9q",
    "MegaAdmin": "1NZyu6CrCYKd4PMRAn3TGKReBNKna-cb6",
    "Archived": "1pHJD36Cx86NKLeU5FKHBRkbsYYFKnSHI",
    "Temp Sheet": "14nh5AsOPW2o4iVMlNtBuQHnydT9Jfe9bVv3Dvkczoz4",
  },

  "Uncategorized": {
    "All SSD": "1BDCQw99j9y_Psm_inNIeT46JI8Ee45k2",
    "SuperAdmin": "1dFf87iR4kx4poVGZDvm_4Wans8WYJyTd",
    "Billing": "18I1sABI7bSKb9WzRMwe-0YKvUA8DoV4j",
    "MegaAdmin": "12TyqOnRGGOx8aO8en1Rd8uMynS-p8kCz",
    "Archived": "1lBwbc6YU9bgIGvyVktZT4gyQbPvt7QvU",
    "Temp Sheet": "14nh5AsOPW2o4iVMlNtBuQHnydT9Jfe9bVv3Dvkczoz4",
  },

  "Processing Sheets": {
    "All SSD": "1poj7FyLhyH7BJsZBBpNPFnHHFazvT2DP",
    "SuperAdmin": "1EpLtnUXebGgUwqj57JGU9RLstLuKjOxX",
    "Billing": "1hIYAr_N6HcUOFEtA9upg2Q1JLYd-nY0A",
    "MegaAdmin": "1AiAYX200inyEwBYnYDRZy6OxIzb7LdTY",
    "Archived": "1v5o8JxlC7mjAIRrUKjSiHavZQ_I99ZBp",
    "Temp Sheet": "14nh5AsOPW2o4iVMlNtBuQHnydT9Jfe9bVv3Dvkczoz4",
  }
}





function setInitialProperty() {
  return;
  const scriptProperties = PropertiesService.getScriptProperties();

  scriptProperties.setProperties({ "lastID": 416 })

  Logger.log(scriptProperties)
  const data = scriptProperties.getProperties();
  Logger.log(data)
}


const COL_GF = {
  PROCESS: 3,
  ID: 4,
  STATUS: 5,
  DRIVE: 7,
  PROJECT_NAME: 8,
  RENAME: 9,
  PHI: 10,
  FORM: 13,
  SHEET: 14,
  FOLDER: 15,
}



function getParentID_(folder) {
  var parents = folder.getParents();

  if (parents.hasNext()) {
    var parent = parents.next();
    return parent.getId();
  }
}

function processBulkFiles_GoogleForms() {


  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const activeSheet = ss.getActiveSheet();

  const activeSheetName = activeSheet.getName();

  if (activeSheetName != "Google Forms") return;

  let allData = activeSheet.getRange(1, 1, activeSheet.getLastRow(), activeSheet.getLastColumn()).getValues();
  let allDataR = activeSheet.getRange(1, 1, activeSheet.getLastRow(), activeSheet.getLastColumn()).getRichTextValues();

  let nameWord = activeSheetName.replace("Google", "").trim();

  let idIndicator = {
    "Google Forms": "F"
  }

  for (var index = allData.length - 1; index >= 2; index--) {

    let rowData = allData[index];

    if (rowData[COL_GF.ID - 1] == "" && rowData[COL_GF.FORM - 1] != "" && rowData[COL_GF.SHEET - 1] != "" && rowData[COL_GF.FOLDER - 1] == "" && rowData[COL_GF.STATUS - 1] != "" && rowData[COL_GF.DRIVE - 1] != "" && index > 1) {

      rowData[COL_GF.ID - 1] = createNewIdNEW_(activeSheet, idIndicator[activeSheetName], index + 1);

      let fileRich = allDataR[index][COL_GF.SHEET - 1];
      let fileUrl = fileRich.getLinkUrl();

      let formRich = allDataR[index][COL_GF.FORM - 1];
      let formUrl = formRich.getLinkUrl();

      if (fileUrl != null && formUrl != null) {
        const fileMatch = String(fileUrl).match(/[-\w]{25,}/);
        let fileId = fileMatch ? fileMatch[0] : null;

        let phiKeyWord = "";
        if (rowData[COL_GF.PHI - 1] == true || rowData[COL_GF.PHI - 1] == "TRUE") {
          phiKeyWord = "PHI ";
        }

        const fileName = rowData[COL_GF.PROJECT_NAME - 1] + " " + phiKeyWord + "- " + nameWord + " (Responses) - " + rowData[COL_GF.ID - 1] + " - " + rowData[COL_GF.DRIVE - 1] + " - " + rowData[COL_GF.STATUS - 1];

        // let destSS = SpreadsheetApp.openById(fileId);
        var sheetFile = DriveApp.getFileById(fileId);
        sheetFile.setName(fileName);

        //>>
        const formMatch = String(formUrl).match(/[-\w]{25,}/);
        let formId = formMatch ? formMatch[0] : null;

        const formName = rowData[COL_GF.PROJECT_NAME - 1] + " " + phiKeyWord + "- " + nameWord + " - " + rowData[COL_GF.ID - 1] + " - " + rowData[COL_GF.DRIVE - 1] + " - " + rowData[COL_GF.STATUS - 1];
        var formFile = DriveApp.getFileById(formId);
        formFile.setName(formName);
        //<<

        // let destSheet = destSS.getSheetByName("Documents")

        // try {
        //   if (!destSheet) {
        //     destSheet = destSS.insertSheet("Documents");
        //   } else {
        //     try {
        //       destSheet.setName("Documents Old")
        //       destSheet = destSS.insertSheet("Documents");
        //     } catch (errDoc) { }
        //   }
        // } catch (docErr) { }

        SpreadsheetApp.flush();
        Utilities.sleep(1000);

        const folderName = rowData[COL_GF.PROJECT_NAME - 1] + " " + phiKeyWord + "- " + nameWord + " Folder - " + rowData[COL_GF.ID - 1] + " - " + rowData[COL_GF.DRIVE - 1] + " - " + rowData[COL_GF.STATUS - 1];
        let outputFolder = DriveApp.getFolderById(IDS[activeSheetName][rowData[COL_GF.DRIVE - 1]]);
        let newFolder = outputFolder.createFolder(folderName);

        let formRichText = SpreadsheetApp.newRichTextValue().setText(formName).setLinkUrl(formUrl).build();
        let fileRichText = SpreadsheetApp.newRichTextValue().setText(fileName).setLinkUrl(fileUrl).build();
        let folderRichText = SpreadsheetApp.newRichTextValue().setText(folderName).setLinkUrl(newFolder.getUrl()).build();

        activeSheet.getRange(index + 1, COL_GF.FORM).setRichTextValue(formRichText);
        activeSheet.getRange(index + 1, COL_GF.SHEET).setRichTextValue(fileRichText);
        activeSheet.getRange(index + 1, COL_GF.FOLDER).setRichTextValue(folderRichText);

        // try {
        //   destSheet.getRange("A1").setRichTextValue(folderRichText)
        //   let headers = ["File Name (Hyperlinked)", "Relevant Date", "Notes"]
        //   destSheet.getRange(2, 1, 1, headers.length).setValues([headers])
        // } catch (a1err) { Logger.log("a1err: " + a1err) }

        try {
          DriveApp.getFileById(fileId).moveTo(newFolder);
          DriveApp.getFileById(formId).moveTo(newFolder);
        } catch (moveErr) { Logger.log(moveErr) }
      }


    } else if (rowData[COL_GF.PROCESS - 1] == "Yes" && index > 1) {

      if (rowData[COL_GF.STATUS - 1] != "" && rowData[COL_GF.DRIVE - 1] != "" && rowData[COL_GF.PROJECT_NAME - 1] != "") {
        if (rowData[COL_GF.SHEET - 1] != "" && rowData[COL_GF.FORM - 1] != "" && rowData[COL_GF.FOLDER - 1] != "") {

          let folderRich = allDataR[index][COL_GF.FOLDER - 1];
          let folderUrl = folderRich.getLinkUrl();
          const folderMatch = String(folderUrl).match(/[-\w]{25,}/);
          let folderId = folderMatch ? folderMatch[0] : null;

          const folderToMove = DriveApp.getFolderById(folderId);
          if (getParentID_(folderToMove) != IDS[activeSheetName][rowData[COL_GF.DRIVE - 1]]) {
            let outputFolder = DriveApp.getFolderById(IDS[activeSheetName][rowData[COL_GF.DRIVE - 1]]);
            folderToMove.moveTo(outputFolder);
          }

          if (rowData[COL_GF.ID - 1] == "") {
            rowData[COL_GF.ID - 1] = createNewIdNEW_(activeSheet, idIndicator[activeSheetName], index + 1);
          }

          //>>
          if (rowData[COL_GF.RENAME - 1] != "") {
            rowData[COL_GF.PROJECT_NAME - 1] = rowData[COL_GF.RENAME - 1];
          }

          let phiKeyWord = "";
          if (rowData[COL_GF.PHI - 1] == true || rowData[COL_GF.PHI - 1] == "TRUE") {
            phiKeyWord = "PHI ";
          }

          try {
            const fileName = rowData[COL_GF.PROJECT_NAME - 1] + " " + phiKeyWord + "- " + nameWord + " (Responses) - " + rowData[COL_GF.ID - 1] + " - " + rowData[COL_GF.DRIVE - 1] + " - " + rowData[COL_GF.STATUS - 1];

            let fileRich = allDataR[index][COL_GF.SHEET - 1];
            let fileUrl = fileRich.getLinkUrl();
            const fileMatch = String(fileUrl).match(/[-\w]{25,}/);
            let fileId = fileMatch ? fileMatch[0] : null;
            DriveApp.getFileById(fileId).setName(fileName);
            let fileRichText = SpreadsheetApp.newRichTextValue().setText(fileName).setLinkUrl(fileUrl).build();
            activeSheet.getRange(index + 1, COL_GF.SHEET).setRichTextValue(fileRichText);
          } catch (renameErr) { console.log(renameErr); }

          try {
            const formName = rowData[COL_GF.PROJECT_NAME - 1] + " " + phiKeyWord + "- " + nameWord + " - " + rowData[COL_GF.ID - 1] + " - " + rowData[COL_GF.DRIVE - 1] + " - " + rowData[COL_GF.STATUS - 1];

            let formRich = allDataR[index][COL_GF.FORM - 1];
            let formUrl = formRich.getLinkUrl();
            const formMatch = String(formUrl).match(/[-\w]{25,}/);
            let formId = formMatch ? formMatch[0] : null;
            DriveApp.getFileById(formId).setName(formName);
            let formRichText = SpreadsheetApp.newRichTextValue().setText(formName).setLinkUrl(formUrl).build();
            activeSheet.getRange(index + 1, COL_GF.FORM).setRichTextValue(formRichText);
          } catch (renameErr) { console.log(renameErr); }

          try {
            const folderName = rowData[COL_GF.PROJECT_NAME - 1] + " " + phiKeyWord + "- " + nameWord + " Folder - " + rowData[COL_GF.ID - 1] + " - " + rowData[COL_GF.DRIVE - 1] + " - " + rowData[COL_GF.STATUS - 1]
            let folderRich = allDataR[index][COL_GF.FOLDER - 1];
            let folderUrl = folderRich.getLinkUrl()
            const folderMatch = String(folderUrl).match(/[-\w]{25,}/);
            let folderId = folderMatch ? folderMatch[0] : null;
            DriveApp.getFolderById(folderId).setName(folderName);
            let folderRichText = SpreadsheetApp.newRichTextValue().setText(folderName).setLinkUrl(folderUrl).build();
            activeSheet.getRange(index + 1, COL_GF.FOLDER).setRichTextValue(folderRichText);
          } catch (renameErr) { console.log(renameErr); }

          activeSheet.getRange(index + 1, COL_GF.PROJECT_NAME).setValue(rowData[COL_GF.PROJECT_NAME - 1]);
          activeSheet.getRange(index + 1, COL_GF.PROCESS).clearContent();
          activeSheet.getRange(index + 1, COL_GF.RENAME).clearContent();

          SpreadsheetApp.flush();
          //<<
        }
      }

    }
  }

  sortMicrotasksList_(activeSheet);
}




function processBulkFiles() {
  Utilities.sleep(3000)

  processBulkFiles_GoogleForms();


  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const activeSheet = ss.getActiveSheet();

  const activeSheetName = activeSheet.getName();

  if (activeSheetName != "Projects" && activeSheetName != "Dashboards" && activeSheetName != "Google Sheets" && activeSheetName != "Uncategorized" && activeSheetName != "Processing Sheets") return


  let allData = activeSheet.getRange(1, 1, activeSheet.getLastRow(), activeSheet.getLastColumn()).getValues();
  let allDataR = activeSheet.getRange(1, 1, activeSheet.getLastRow(), activeSheet.getLastColumn()).getRichTextValues();

  //for (var i = 0; i < allData.length; i++) {

  let nameWord = activeSheetName.replace("Google", "").trim()

  let idIndicator = {
    "Projects": "P",
    "Dashboards": "D",
    "Google Sheets": "S",
    "Uncategorized": "U",
    "Processing Sheets": "PRS",
  }

  //allData.forEach((rowData, index) => {
  //allData.forEach((rowData, index) => {
  for (var index = allData.length - 1; index >= 2; index--) {

    let rowData = allData[index];

    if (rowData[COL.ID - 1] == "" && rowData[COL.SHEET - 1] != "" && rowData[COL.FOLDER - 1] == "" && rowData[COL.STATUS - 1] != "" && rowData[COL.DRIVE - 1] != "" && index > 1) {

      rowData[COL.ID - 1] = createNewIdNEW_(activeSheet, idIndicator[activeSheetName], index + 1)

      let fileRich = allDataR[index][COL.SHEET - 1]
      let fileUrl = fileRich.getLinkUrl()
      if (fileUrl != null) {
        const fileMatch = String(fileRich.getLinkUrl()).match(/[-\w]{25,}/);
        let fileId = fileMatch ? fileMatch[0] : null;
        let destSS = SpreadsheetApp.openById(fileId);

        let phiKeyWord = "";
        if (rowData[COL.PHI - 1] == true || rowData[COL.PHI - 1] == "TRUE") {
          phiKeyWord = "PHI "
        }

        const fileName = rowData[COL.PROJECT_NAME - 1] + " " + phiKeyWord + "- " + nameWord + " - " + rowData[COL.ID - 1] + " - " + rowData[COL.DRIVE - 1] + " - " + rowData[COL.STATUS - 1]
        destSS.rename(fileName)
        let destSheet = destSS.getSheetByName("Documents")

        try {
          if (!destSheet) {
            destSheet = destSS.insertSheet("Documents");
          } else {
            try {
              destSheet.setName("Documents Old")
              destSheet = destSS.insertSheet("Documents");
            } catch (errDoc) { }
          }
        } catch (docErr) { }

        SpreadsheetApp.flush()
        Utilities.sleep(1000)

        const folderName = rowData[COL.PROJECT_NAME - 1] + " " + phiKeyWord + "- " + nameWord + " Folder - " + rowData[COL.ID - 1] + " - " + rowData[COL.DRIVE - 1] + " - " + rowData[COL.STATUS - 1]
        let outputFolder = DriveApp.getFolderById(IDS[activeSheetName][rowData[COL.DRIVE - 1]])
        let newFolder = outputFolder.createFolder(folderName);

        let fileRichText = SpreadsheetApp.newRichTextValue().setText(fileName).setLinkUrl(fileRich.getLinkUrl()).build()
        let folderRichText = SpreadsheetApp.newRichTextValue().setText(folderName).setLinkUrl(newFolder.getUrl()).build()
        activeSheet.getRange(index + 1, COL.SHEET, 1, 2).setRichTextValues([[fileRichText, folderRichText]])

        try {
          destSheet.getRange("A1").setRichTextValue(folderRichText)
          let headers = ["File Name (Hyperlinked)", "Relevant Date", "Notes"]
          destSheet.getRange(2, 1, 1, headers.length).setValues([headers])
        } catch (a1err) { Logger.log("a1err: " + a1err) }
        try {
          DriveApp.getFileById(fileId).moveTo(newFolder)
        } catch (moveErr) { Logger.log(moveErr) }
      }

    } else if (rowData[COL.PROCESS - 1] == "Yes" && index > 1) {

      //Logger.log("Processing Row: " + (index + 1))

      if (rowData[COL.STATUS - 1] != "" && rowData[COL.DRIVE - 1] != "" && rowData[COL.PROJECT_NAME - 1] != "") {
        if (rowData[COL.SHEET - 1] == "" && rowData[COL.FOLDER - 1] == "") {

          if (rowData[COL.ID - 1] == "") {
            rowData[COL.ID - 1] = createNewIdNEW_(activeSheet, idIndicator[activeSheetName], index + 1)
          } else {
            rowData[COL.ID - 1] = rowData[COL.ID - 1].replace("PRS", "P")
            rowData[COL.ID - 1] = rowData[COL.ID - 1].replace(/[PDSU]/g, idIndicator[activeSheetName]);
            activeSheet.getRange(index + 1, COL.ID).setValue(rowData[COL.ID - 1])
          }

          let phiKeyWord = "";
          if (rowData[COL.PHI - 1] == true || rowData[COL.PHI - 1] == "TRUE") {
            phiKeyWord = "PHI "
          }

          const folderName = rowData[COL.PROJECT_NAME - 1] + " " + phiKeyWord + "- " + nameWord + " Folder - " + rowData[COL.ID - 1] + " - " + rowData[COL.DRIVE - 1] + " - " + rowData[COL.STATUS - 1]
          let outputFolder = DriveApp.getFolderById(IDS[activeSheetName][rowData[COL.DRIVE - 1]])
          let newFolder = outputFolder.createFolder(folderName);

          const fileName = rowData[COL.PROJECT_NAME - 1] + " " + phiKeyWord + "- " + nameWord + " - " + rowData[COL.ID - 1] + " - " + rowData[COL.DRIVE - 1] + " - " + rowData[COL.STATUS - 1]
          let newFile = DriveApp.getFileById(IDS[activeSheetName]["Temp Sheet"]).makeCopy(fileName, newFolder);
          let newSS = SpreadsheetApp.openById(newFile.getId());
          newSS.getSheetByName("Documents").getRange("A1").setValue(newFolder.getUrl())

          let fileRichText = SpreadsheetApp.newRichTextValue().setText(fileName).setLinkUrl(newFile.getUrl()).build()
          let folderRichText = SpreadsheetApp.newRichTextValue().setText(folderName).setLinkUrl(newFolder.getUrl()).build()
          activeSheet.getRange(index + 1, COL.SHEET, 1, 2).setRichTextValues([[fileRichText, folderRichText]])

        } else if (rowData[COL.SHEET - 1] != "" && rowData[COL.FOLDER - 1] != "") {

          let folderRich = activeSheet.getRange(index + 1, COL.FOLDER, 1, 1).getRichTextValue();
          const folderMatch = String(folderRich.getLinkUrl()).match(/[-\w]{25,}/);
          let folderId = folderMatch ? folderMatch[0] : null;
          const folderToMove = DriveApp.getFolderById(folderId);
          let outputFolder = DriveApp.getFolderById(IDS[activeSheetName][rowData[COL.DRIVE - 1]])
          folderToMove.moveTo(outputFolder)

          if (rowData[COL.ID - 1] == "") {
            rowData[COL.ID - 1] = createNewIdNEW_(activeSheet, idIndicator[activeSheetName], index + 1)
          } else {
            rowData[COL.ID - 1] = rowData[COL.ID - 1].replace("PRS", "P")
            rowData[COL.ID - 1] = rowData[COL.ID - 1].replace(/[PDSU]/g, idIndicator[activeSheetName]);
            activeSheet.getRange(index + 1, COL.ID).setValue(rowData[COL.ID - 1])
          }
          renameSheetAndFolderNew_(activeSheet, index + 1, rowData, nameWord)
          SpreadsheetApp.flush()



        }

      }

      activeSheet.getRange(index + 1, COL.PROCESS).clearContent()

    }

    if (rowData[COL.MOVE - 1] != "" && index > 1) {
      if (rowData[COL.MOVE - 1] != activeSheetName) {
        //let richTexts = [allDataR[index][COL.SHEET - 1], allData[index][COL.FOLDER - 1]]
        let destSheet = ss.getSheetByName(rowData[COL.MOVE - 1]);
        //destSheet.insertRowAfter(3);

        let lastRow = destSheet.getLastRow() + 1
        destSheet.getRange(lastRow, COL.ID).setValue(rowData[COL.ID - 1])
        destSheet.getRange(lastRow, COL.PROJECT_NAME).setValue(rowData[COL.PROJECT_NAME - 1])
        destSheet.getRange(lastRow, COL.SHEET).setRichTextValue(allDataR[index][COL.SHEET - 1])
        destSheet.getRange(lastRow, COL.FOLDER).setRichTextValue(allDataR[index][COL.FOLDER - 1])

        activeSheet.deleteRows(index + 1, 1)
      }

    }


    if (rowData[COL.USERS - 1] != "") {
      let folderUrl = allDataR[index][COL.FOLDER - 1].getLinkUrl()
      const folderMatch = String(folderUrl).match(/[-\w]{25,}/);
      let folderId = folderMatch ? folderMatch[0] : null;

      if (folderId) {
        let emailsList = rowData[COL.USERS - 1].toString().split(",").map(r => r.toString().trim())
        grantEditorsToFolder(folderId, emailsList)
        //grantContentManagersToSharedFolder(folderId, emailsList, [], false)
      }

    }


  }
  //})



  addIdsToTheSheet(activeSheet)
  sortMicrotasksList_(activeSheet);

}





function renameSheetAndFolderNew_(sheet, row, rowData, type) {

  let allRichData = sheet.getRange(row, COL.SHEET, 1, 2).getRichTextValues()[0];

  if (rowData[COL.RENAME - 1] != "") {
    rowData[COL.PROJECT_NAME - 1] = rowData[COL.RENAME - 1]
  }

  let phiKeyWord = "";
  if (rowData[COL.PHI - 1] == true || rowData[COL.PHI - 1] == "TRUE") {
    phiKeyWord = "PHI "
  }
  try {
    const fileName = rowData[COL.PROJECT_NAME - 1] + " " + phiKeyWord + "- " + type + " - " + rowData[COL.ID - 1] + " - " + rowData[COL.DRIVE - 1] + " - " + rowData[COL.STATUS - 1]
    let fileUrl = allRichData[0].getLinkUrl()
    const fileMatch = String(fileUrl).match(/[-\w]{25,}/);
    let fileId = fileMatch ? fileMatch[0] : null;
    DriveApp.getFileById(fileId).setName(fileName)
    let fileRichText = SpreadsheetApp.newRichTextValue().setText(fileName).setLinkUrl(fileUrl).build()
    sheet.getRange(row, COL.SHEET).setRichTextValue(fileRichText)
  } catch (renameErr) { }


  try {
    const folderName = rowData[COL.PROJECT_NAME - 1] + " " + phiKeyWord + "- " + type + " Folder - " + rowData[COL.ID - 1] + " - " + rowData[COL.DRIVE - 1] + " - " + rowData[COL.STATUS - 1]
    let folderUrl = allRichData[1].getLinkUrl()
    const folderMatch = String(folderUrl).match(/[-\w]{25,}/);
    let folderId = folderMatch ? folderMatch[0] : null;
    DriveApp.getFolderById(folderId).setName(folderName)
    let folderRichText = SpreadsheetApp.newRichTextValue().setText(folderName).setLinkUrl(folderUrl).build()
    sheet.getRange(row, COL.FOLDER).setRichTextValue(folderRichText)

  } catch (renameErr) { }

  sheet.getRange(row, COL.PROJECT_NAME).setValue(rowData[COL.PROJECT_NAME - 1])
  sheet.getRange(row, COL.RENAME).clearContent()

}






function createNewIdNEW_(sheet, idLetter, row) {

  const scriptProperties = PropertiesService.getScriptProperties();
  const scriptObj = scriptProperties.getProperties();
  const newIDNumber = Number(scriptObj.lastID) + 1
  scriptProperties.setProperties({ "lastID": newIDNumber })

  //let newFullID = "PROT-" + newID

  let year = new Date().getFullYear() - 2000
  let newID = idLetter + year + "-" + newIDNumber
  sheet.getRange(row, COL.ID).setValue(newID);

  return newID
}











const DASHBOARD_DEST_FOLDERS = {
  "All SSD": "1XqwCyInwaoZwa7vMCCr8f0S8Qu5vBMpi",
  "SuperAdmin": "1G-qHp7pSben38n5j-4DTdGRTjJzTQkqv",
  "Billing": "1IG16XaA1EwB-C92GQ2Cdujzh8vLLQfMw",
  "MegaAdmin": "1bHOEe5VGVDyEevME3EMNhYe4inriI-jy",
  "Archived": "1bUcnGz-V2ICnByPyk5DHFjzeG1vMiALn",
}
const DASHBOARD_SS_TEMPLATE_ID = "1lQhHBun3EN3hXcd6DKgQYfUgZDt42Ws5ArGF4VmfLLc"




const PROJECT_DEST_FOLDERS = {
  "All SSD": "1AqS2RSG0eIl70tmTSApM-uRFSluCJLhI",
  "SuperAdmin": "1KBdaqi0jI96QIgDE3wiJFObOkOF7VU5N",
  "Billing": "1-aXSDYEsTJQMqj06eZzDdJ724O9BhAZi",
  "MegaAdmin": "11YV0SXIRtChIqRduBo5EsW0V5_lE_8Qn",
  "Archived": "1H_1uRo9Y3PU1dNBfWYcHeNOQaVug_DIK",
}
const PROJECT_SS_TEMPLATE_ID = "1Cs5iyGRJCPfI4tRpztimK8ktwhDvVFK8xSl0YTPjteI"




const SHEET_DEST_FOLDERS = {
  "All SSD": "1xmQsH1vfPirVUsJtRqUg6oJ3c5dKJZ27",
  "SuperAdmin": "1weUF-UFnFjyB7GhuUVoPCuzeWRNCqngV",
  "Billing": "1Am08Vv8sn1oVlBBRPnbJNA4fnRu0WL9q",
  "MegaAdmin": "1NZyu6CrCYKd4PMRAn3TGKReBNKna-cb6",
  "Archived": "1pHJD36Cx86NKLeU5FKHBRkbsYYFKnSHI",
}
const SHEET_SS_TEMPLATE_ID = "14nh5AsOPW2o4iVMlNtBuQHnydT9Jfe9bVv3Dvkczoz4"

//Uncategorized
const UNCATEGORIZED_DEST_FOLDERS = {
  "All SSD": "1BDCQw99j9y_Psm_inNIeT46JI8Ee45k2",
  "SuperAdmin": "1dFf87iR4kx4poVGZDvm_4Wans8WYJyTd",
  "Billing": "18I1sABI7bSKb9WzRMwe-0YKvUA8DoV4j",
  "MegaAdmin": "12TyqOnRGGOx8aO8en1Rd8uMynS-p8kCz",
  "Archived": "1lBwbc6YU9bgIGvyVktZT4gyQbPvt7QvU",
}
const UNCATEGORIZED_SS_TEMPLATE_ID = "14nh5AsOPW2o4iVMlNtBuQHnydT9Jfe9bVv3Dvkczoz4"



const PROCESSING_DEST_FOLDERS = {
  "All SSD": "1poj7FyLhyH7BJsZBBpNPFnHHFazvT2DP",
  "SuperAdmin": "1EpLtnUXebGgUwqj57JGU9RLstLuKjOxX",
  "Billing": "1hIYAr_N6HcUOFEtA9upg2Q1JLYd-nY0A",
  "MegaAdmin": "1AiAYX200inyEwBYnYDRZy6OxIzb7LdTY",
  "Archived": "1v5o8JxlC7mjAIRrUKjSiHavZQ_I99ZBp",
}
const PROCESSING_SS_TEMPLATE_ID = "14nh5AsOPW2o4iVMlNtBuQHnydT9Jfe9bVv3Dvkczoz4"






const FOLDERS = {
  'Dashboards': {
    "All SSD": "1XqwCyInwaoZwa7vMCCr8f0S8Qu5vBMpi",
    "SuperAdmin": "1G-qHp7pSben38n5j-4DTdGRTjJzTQkqv",
    "Billing": "1IG16XaA1EwB-C92GQ2Cdujzh8vLLQfMw",
    "MegaAdmin": "1bHOEe5VGVDyEevME3EMNhYe4inriI-jy",
    "Archived": "1bUcnGz-V2ICnByPyk5DHFjzeG1vMiALn",
  },
  'Project List': {
    "All SSD": "1AqS2RSG0eIl70tmTSApM-uRFSluCJLhI",
    "SuperAdmin": "1KBdaqi0jI96QIgDE3wiJFObOkOF7VU5N",
    "Billing": "1-aXSDYEsTJQMqj06eZzDdJ724O9BhAZi",
    "MegaAdmin": "11YV0SXIRtChIqRduBo5EsW0V5_lE_8Qn",
    "Archived": "1H_1uRo9Y3PU1dNBfWYcHeNOQaVug_DIK",
  },
  'Google Sheets': {
    "All SSD": "1xmQsH1vfPirVUsJtRqUg6oJ3c5dKJZ27",
    "SuperAdmin": "1weUF-UFnFjyB7GhuUVoPCuzeWRNCqngV",
    "Billing": "1Am08Vv8sn1oVlBBRPnbJNA4fnRu0WL9q",
    "MegaAdmin": "1NZyu6CrCYKd4PMRAn3TGKReBNKna-cb6",
    "Archived": "1pHJD36Cx86NKLeU5FKHBRkbsYYFKnSHI",
  }
}




const COL = {
  PROCESS: 3,
  ID: 4,
  STATUS: 5,
  DRIVE: 7,
  PROJECT_NAME: 8,
  RENAME: 9,
  PHI: 10,
  SHEET: 13,
  FOLDER: 14,
  MOVE: 15,
  USERS: 17,
}





function onEditInstall(e) {

  //return


  let ss = e.source;
  let sheet = ss.getActiveSheet();

  let range = e.range;
  let row = range.getRow();
  let colum = range.getColumn();

  let value = e.value;


  let sheetID = sheet.getSheetId();
  //const activeSheetName = sheet.getSheetName()






  if ((sheetID == 0 || sheetID == 1970431304 || sheetID == 1613788308 || sheetID == 1613788308 || sheetID == 1934811915 || sheetID == 2109108511) && value != "" && row > 2) {
    if (colum == COL.STATUS || colum == COL.DRIVE || colum == COL.PROJECT_NAME || colum == COL.RENAME || colum == COL.PHI || colum == COL.MOVE) {
      sheet.getRange(row, COL.PROCESS).setValue("Yes")

    }

  } else if ((sheetID == 509629444) && value != "" && row > 2) {
    if (colum == COL_GF.STATUS || colum == COL_GF.DRIVE || colum == COL_GF.PROJECT_NAME || colum == COL_GF.RENAME || colum == COL_GF.PHI) {
      sheet.getRange(row, COL_GF.PROCESS).setValue("Yes");
    }
  }

  // //here is the process of project creation
  // if (sheet.getSheetId() == 0 && row > 1 && value != "") {
  //   processRow_(ss, sheet, row, colum, value, "P", activeSheetName, "Project", PROJECT_DEST_FOLDERS, PROJECT_SS_TEMPLATE_ID)

  //   //here is the process of dashboard creation
  // } else if (sheet.getSheetId() == 1970431304 && row > 1 && value != "") {
  //   processRow_(ss, sheet, row, colum, value, "D", activeSheetName, "Dashboard", DASHBOARD_DEST_FOLDERS, DASHBOARD_SS_TEMPLATE_ID)

  //   //here is the process of Google sheet creation
  // } else if (sheet.getSheetId() == 1613788308 && row > 1 && value != "") {
  //   processRow_(ss, sheet, row, colum, value, "S", activeSheetName, "Sheet", SHEET_DEST_FOLDERS, SHEET_SS_TEMPLATE_ID)

  //   //Here Archive Sheet
  // } else if (sheet.getSheetId() == 1934811915 && row > 1 && value != "") {
  //   processRow_(ss, sheet, row, colum, value, "U", activeSheetName, "", UNCATEGORIZED_DEST_FOLDERS, UNCATEGORIZED_SS_TEMPLATE_ID)

  //   //here is the processing sheet
  // } else if (sheet.getSheetId() == 2109108511 && row > 1 && value != "") {
  //   processRow_(ss, sheet, row, colum, value, "PRS", activeSheetName, "Processing", PROCESSING_DEST_FOLDERS, PROCESSING_SS_TEMPLATE_ID)
  // }





  //const SheetsList = ['Microtasks List', 'Project List', 'Dashboards']

  if (sheet.getName() == "Microtasks List") {
    const HeaderRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const StatusColIndex = HeaderRow.indexOf('Status');

    if (e.range.getColumn() === StatusColIndex + 1)
      sortMicrotasksList_(sheet);

  }

}






function processRow_(ss, sheet, row, colum, value, idLetter, activeSheetName, nameWord, foldersIDs, ssTemplateID) {

  if (colum == COL.STATUS || colum == COL.DRIVE || colum == COL.PROJECT_NAME) {


    let rowData = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getDisplayValues()[0]

    if (rowData[COL.STATUS - 1] != "" && rowData[COL.DRIVE - 1] != "" && rowData[COL.PROJECT_NAME - 1] != "") {

      //return
      ss.toast('Please Wait...', 'Processing.', 5);

      if (rowData[COL.SHEET - 1] == "" && rowData[COL.FOLDER - 1] == "") {

        if (rowData[COL.ID - 1] == "") {
          rowData[COL.ID - 1] = createNewId_(ss, sheet, idLetter, row, "A2")
        }

        const folderName = rowData[COL.PROJECT_NAME - 1] + " - " + nameWord + " Folder - " + rowData[COL.ID - 1] + " - " + rowData[COL.STATUS - 1]
        let outputFolder = DriveApp.getFolderById(foldersIDs[rowData[COL.DRIVE - 1]])
        let newFolder = outputFolder.createFolder(folderName);

        const fileName = rowData[COL.PROJECT_NAME - 1] + " - " + nameWord + " - " + rowData[COL.ID - 1] + " - " + rowData[COL.STATUS - 1]
        let newFile = DriveApp.getFileById(ssTemplateID).makeCopy(fileName, newFolder);
        let newSS = SpreadsheetApp.openById(newFile.getId());
        newSS.getSheetByName("Documents").getRange("A1").setValue(newFolder.getUrl())

        let fileRichText = SpreadsheetApp.newRichTextValue().setText(fileName).setLinkUrl(newFile.getUrl()).build()
        let folderRichText = SpreadsheetApp.newRichTextValue().setText(folderName).setLinkUrl(newFolder.getUrl()).build()
        sheet.getRange(row, COL.SHEET, 1, 2).setRichTextValues([[fileRichText, folderRichText]])



      } else if (rowData[COL.SHEET - 1] != "" && rowData[COL.FOLDER - 1] == "") {
        return
        if (rowData[COL.ID - 1] == "") {
          rowData[COL.ID - 1] = createNewId_(ss, sheet, idLetter, row, "A2")
        }

        let fileRich = sheet.getRange(row, COL.SHEET, 1, 1).getRichTextValue();
        const fileMatch = String(fileRich.getLinkUrl()).match(/[-\w]{25,}/);
        let fileId = fileMatch ? fileMatch[0] : null;
        let destSS = SpreadsheetApp.openById(fileId);
        const fileName = rowData[COL.PROJECT_NAME - 1] + " - " + nameWord + " - " + rowData[COL.ID - 1] + " - " + rowData[COL.DRIVE - 1] + " - " + rowData[COL.STATUS - 1]
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


        const folderName = rowData[COL.PROJECT_NAME - 1] + " - " + nameWord + " Folder - " + rowData[COL.ID - 1] + " - " + rowData[COL.DRIVE - 1] + " - " + rowData[COL.STATUS - 1]
        let outputFolder = DriveApp.getFolderById(foldersIDs[rowData[COL.DRIVE - 1]])
        let newFolder = outputFolder.createFolder(folderName);

        let fileRichText = SpreadsheetApp.newRichTextValue().setText(fileName).setLinkUrl(fileRich.getLinkUrl()).build()
        let folderRichText = SpreadsheetApp.newRichTextValue().setText(folderName).setLinkUrl(newFolder.getUrl()).build()
        sheet.getRange(row, COL.SHEET, 1, 2).setRichTextValues([[fileRichText, folderRichText]])

        destSheet.getRange("A1").setRichTextValue(folderRichText) // here
        let headers = ["File Name (Hyperlinked)", "Relevant Date", "Notes"]
        destSheet.getRange(2, 1, 1, headers.length).setValues([headers])

        try {
          DriveApp.getFileById(fileId).moveTo(newFolder)
        } catch (moveErr) { Logger.log(moveErr) }


      } else if (rowData[COL.STATUS - 1] != "" && rowData[COL.DRIVE - 1] != "" && rowData[COL.PROJECT_NAME - 1] != "") {

        //return
        if (rowData[COL.SHEET - 1] != "" && rowData[COL.FOLDER - 1] != "") {

          if (colum == COL.DRIVE) {
            //archiving Process and moving between drives
            //if (rowData[COL.STATUS - 1] == "Archived / Cancelled") {
            try {
              let folderRich = sheet.getRange(row, COL.FOLDER, 1, 1).getRichTextValue();
              const folderMatch = String(folderRich.getLinkUrl()).match(/[-\w]{25,}/);
              let folderId = folderMatch ? folderMatch[0] : null;
              const folderToMove = DriveApp.getFolderById(folderId);
              let outputFolder = DriveApp.getFolderById(foldersIDs[rowData[COL.DRIVE - 1]])
              folderToMove.moveTo(outputFolder)

              renameSheetAndFolder_(sheet, row, rowData, nameWord, "Status")

            } catch (movingErr) { }

          } else if (colum == COL.STATUS) {

            ss.toast('Please Wait...', 'Processing.', 5);
            let rowData = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getDisplayValues()[0]
            if (rowData[COL.SHEET - 1] != "" && rowData[COL.FOLDER - 1] != "") {

              if (rowData[COL.ID - 1] == "") {
                rowData[COL.ID - 1] = createNewId_(ss, sheet, idLetter, row, "A2")
              }
              renameSheetAndFolder_(sheet, row, rowData, nameWord, "Status")
              SpreadsheetApp.flush()
            }
          }
        }
      }

      // Utilities.sleep(1000)
      // SpreadsheetApp.flush()
      // sortMicrotasksList_(sheet);

      return
    }


  } else if (colum == COL.MOVE) {
    if (value != activeSheetName) {
      let rowData = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getDisplayValues()[0]
      let richTexts = sheet.getRange(row, COL.SHEET, 1, 2).getRichTextValues()[0];

      if (value == "Project List") {
        rowData[COL.ID - 1] = replaceIdPrefix(rowData[COL.ID - 1], "P")
      } else if (value == "Dashboards") {
        rowData[COL.ID - 1] = replaceIdPrefix(rowData[COL.ID - 1], "D")
      } else if (value == "Google Sheets") {
        rowData[COL.ID - 1] = replaceIdPrefix(rowData[COL.ID - 1], "S")
      } else if (value == "Uncategorized") {
        rowData[COL.ID - 1] = rowData[COL.ID - 1].replace(/P/g, "U")
        rowData[COL.ID - 1] = rowData[COL.ID - 1].replace(/D/g, "U")
        rowData[COL.ID - 1] = rowData[COL.ID - 1].replace(/S/g, "U")
      }
      let destSheet = ss.getSheetByName(value);
      destSheet.insertRowAfter(3);
      destSheet.getRange(4, COL.ID).setValue(rowData[COL.ID - 1])
      destSheet.getRange(4, COL.PROJECT_NAME).setValue(rowData[COL.PROJECT_NAME - 1])
      destSheet.getRange(4, COL.SHEET, 1, 2).setRichTextValues([richTexts])
      sheet.deleteRows(row, 1)
    }

  } else if (colum == COL.RENAME) {
    //return
    ss.toast('Please Wait...', 'Processing.', 5);
    let rowData = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getDisplayValues()[0]
    if (rowData[COL.SHEET - 1] != "" && rowData[COL.FOLDER - 1] != "") {

      if (rowData[COL.ID - 1] == "") {
        rowData[COL.ID - 1] = createNewId_(ss, sheet, idLetter, row, "A2")
      }
      renameSheetAndFolder_(sheet, row, rowData, nameWord, "Not Status")
    }
  }


}






function replaceIdPrefix(currentId, toLetter) {
  return currentId.replace(/[PDSU]/g, toLetter);
}










function renameSheetAndFolder_(sheet, row, rowData, type, flage) {

  let allRichData = sheet.getRange(row, COL.SHEET, 1, 2).getRichTextValues()[0];

  if (flage == "Status") {

  } else {
    rowData[COL.PROJECT_NAME - 1] = rowData[COL.RENAME - 1]
  }
  try {
    const fileName = rowData[COL.PROJECT_NAME - 1] + " - " + type + " - " + rowData[COL.ID - 1] + " - " + rowData[COL.DRIVE - 1] + " - " + rowData[COL.STATUS - 1]
    let fileUrl = allRichData[0].getLinkUrl()
    const fileMatch = String(fileUrl).match(/[-\w]{25,}/);
    let fileId = fileMatch ? fileMatch[0] : null;
    DriveApp.getFileById(fileId).setName(fileName)
    let fileRichText = SpreadsheetApp.newRichTextValue().setText(fileName).setLinkUrl(fileUrl).build()
    sheet.getRange(row, COL.SHEET).setRichTextValue(fileRichText)
  } catch (renameErr) { }


  try {
    const folderName = rowData[COL.PROJECT_NAME - 1] + " - " + type + " Folder - " + rowData[COL.ID - 1] + " - " + rowData[COL.DRIVE - 1] + " - " + rowData[COL.STATUS - 1]
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



function createNewId_(ss, sheet, idLetter, row, idRange) {
  let idTrackerSheet = ss.getSheetByName("Task_ID_Tracker_");
  let idCount = idTrackerSheet.getRange(idRange).getValue() + 1;
  idTrackerSheet.getRange(idRange).setValue(idCount)
  let year = new Date().getFullYear() - 2000
  let newID = idLetter + year + "-" + idCount
  sheet.getRange(row, COL.ID).setValue(newID);

  return newID
}

function testAA_1() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var idRange = "A2";
  let idTrackerSheet = ss.getSheetByName("Task_ID_Tracker_");
  let idCount = idTrackerSheet.getRange(idRange).getValue() + 1;

  console.log(idCount);
}









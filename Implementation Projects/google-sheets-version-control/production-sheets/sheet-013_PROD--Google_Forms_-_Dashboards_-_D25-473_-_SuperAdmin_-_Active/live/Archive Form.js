

const ARCHIVE_COL = 13


const FOLDER_URLS_FOLDER = "Folder URLs"


function closeGoogleForm() {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(EXISTING_FORMS_SHEET);

  let allData = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getValues();

  const folderUrlsSheet = ss.getSheetByName(FOLDER_URLS_FOLDER);

  let formFolderID = getFolderIdFromUrl(folderUrlsSheet.getRange("B2").getValue())
  let sheetFolderID = getFolderIdFromUrl(folderUrlsSheet.getRange("B3").getValue())

  let formFolder = DriveApp.getFolderById(formFolderID)
  let sheetFolder = DriveApp.getFolderById(sheetFolderID)



  for (var i = allData.length - 1; i > 0; i--) {
    if (allData[i][ARCHIVE_COL - 1] == true || allData[i][ARCHIVE_COL - 1] == "TRUE") {
      try {
        let respSheetID = getSpreadsheetIdFromUrl(allData[i][4])
        let respSheet = DriveApp.getFileById(respSheetID);
        respSheet.moveTo(sheetFolder)
      } catch (err) { }


      try {
        let formID = getFormIdFromUrl(allData[i][5])
        let form = DriveApp.getFileById(formID);
        form.moveTo(formFolder)

        FormApp.openById(formID).setAcceptingResponses(false);
      } catch (err) { }

      sheet.getRange(i + 1, ARCHIVE_COL).setValue(false)
      sheet.getRange(i + 1, 12).setValue("Closed")
      //sheet.deleteRow(i + 1)


    }
  }



  sheet.getRange(3, 1, sheet.getLastRow() - 2, sheet.getLastColumn()).sort([{ column: 14, ascending: true }, { column: 1, ascending: false }])

}






function archiveGoogleForm() {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(EXISTING_FORMS_SHEET);

  let allData = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getValues();

  const folderUrlsSheet = ss.getSheetByName(FOLDER_URLS_FOLDER);

  let formFolderID = getFolderIdFromUrl(folderUrlsSheet.getRange("B4").getValue())
  let sheetFolderID = getFolderIdFromUrl(folderUrlsSheet.getRange("B5").getValue())

  let formFolder = DriveApp.getFolderById(formFolderID)
  let sheetFolder = DriveApp.getFolderById(sheetFolderID)



  for (var i = allData.length - 1; i > 0; i--) {
    if (allData[i][ARCHIVE_COL - 1] == true || allData[i][ARCHIVE_COL - 1] == "TRUE") {
      try {
        let respSheetID = getSpreadsheetIdFromUrl(allData[i][4])
        let respSheet = DriveApp.getFileById(respSheetID);
        respSheet.moveTo(sheetFolder)
      } catch (err) { }


      try {
        let formID = getFormIdFromUrl(allData[i][5])
        let form = DriveApp.getFileById(formID);
        form.moveTo(formFolder)

        FormApp.openById(formID).setAcceptingResponses(false);
      } catch (err) { }

      //sheet.getRange(i + 1, ARCHIVE_COL).setValue(false)
      //sheet.getRange(i + 1, 12).setValue("Closed")
      sheet.deleteRow(i + 1)


    }
  }

  sheet.getRange(3, 1, sheet.getLastRow() - 2, sheet.getLastColumn()).sort([{ column: 14, ascending: true }, { column: 1, ascending: false }])

}





function getFolderIdFromUrl(url) {
  const regex = /\/folders\/([a-zA-Z0-9-_]+)/;
  const match = url.match(regex);
  if (match && match[1]) {
    const folderId = match[1];
    return folderId;
  } else {
    return null
  }
}




function getSpreadsheetIdFromUrl(url) {
  const regex = /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)\//;
  const match = url.match(regex);
  if (match && match[1]) {
    const spreadsheetId = match[1];
    return spreadsheetId;
  } else {
    return null;
  }
}



// function getTemplateFormIdFromUrl(url) {
//   const regex = /\/forms\/d\/([a-zA-Z0-9-_]+)\//;
//   const match = url.match(regex);
//   if (match && match[1]) {
//     const spreadsheetId = match[1];
//     return spreadsheetId;
//   } else {
//     return null;
//   }
// }












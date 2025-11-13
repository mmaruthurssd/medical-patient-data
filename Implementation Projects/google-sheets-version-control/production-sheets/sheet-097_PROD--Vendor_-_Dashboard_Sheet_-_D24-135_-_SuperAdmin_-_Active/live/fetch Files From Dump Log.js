


const DUMP_LOG_FOLDER_ID = "1do4BQWBUd3GG1HYuhhjrMfU4brdTl_JO"

const DUMP_LOG_FOLDER_URL = "https://drive.google.com/drive/folders/1do4BQWBUd3GG1HYuhhjrMfU4brdTl_JO"



const VENDOR_DOC_DUMP_SHEET_ID = '961600894'





function onOpen() {
  let ui = SpreadsheetApp.getUi();
  let menu = ui.createMenu("Custom");

  menu.addItem("Fetch Files From Dump Log", "fetchFilesFormDumpLog").addToUi();
  menu.addItem("Move Files to Vendor Folder", "moveFilesMain").addToUi();
}





function fetchFilesFormDumpLog() {

  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = getSheetByID_(ss, VENDOR_DOC_DUMP_SHEET_ID)
  let headers = sheet.getRange(2, 1, 1, sheet.getLastColumn()).getValues()[0];

  let COL = {
    fileLink: headers.indexOf('File URL')
  }


  let allFilesLink = sheet.getRange(2, COL.fileLink + 1, sheet.getLastRow(), 1).getValues().map(r => r[0])


  let folder = DriveApp.getFolderById(DUMP_LOG_FOLDER_ID);
  let files = folder.getFiles();


  let newData = [];
  while (files.hasNext()) {

    let file = files.next();
    let fileUrl = file.getUrl();

    let indexOfUrl = allFilesLink.indexOf(fileUrl);

    if (indexOfUrl == -1) {
      let fileName = file.getName()
      let fileDate = file.getDateCreated();

      let newRow = [fileDate, "Manual", fileName, "", "", "", "", fileUrl, folder.getName(), DUMP_LOG_FOLDER_URL]
      newData.push(newRow)
    }

  }


  if (newData.length > 0) {
    sheet.insertRows(3, newData.length);
    sheet.getRange(3, 3, newData.length, newData[0].length).setValues(newData)
  }




}



























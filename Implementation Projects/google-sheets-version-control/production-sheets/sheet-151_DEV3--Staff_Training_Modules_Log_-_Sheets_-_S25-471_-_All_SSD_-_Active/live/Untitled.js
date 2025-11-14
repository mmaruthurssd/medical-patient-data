function moveFilesToFolder() {
  const CONFIG = {
    DESTINATION_FOLDER_ID: "1V-OZOPXwSTyZ5yU2roi_epPae7DLGCmy",
    SHEET_NAME: "Sheet6",
    URL_COLUMN_INDEX: 11,
    START_ROW: 2
  };



  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAME);


  const lastRow = sheet.getLastRow();
  const dataRange = sheet.getRange(CONFIG.START_ROW, CONFIG.URL_COLUMN_INDEX, lastRow - CONFIG.START_ROW + 1, 1);
  const data = dataRange.getDisplayValues().filter(r=> r[0]!="");



  let destinationFolder = DriveApp.getFolderById(CONFIG.DESTINATION_FOLDER_ID);


  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const fileUrl = row[0];


    if (fileUrl) {
      try {
        const fileId = extractFileIdFromUrl(fileUrl);
        if (fileId) {
          const file = DriveApp.getFileById(fileId);
          //Logger.log(fileId)
          file.moveTo(destinationFolder);

        } else {
          Logger.log(i + " File ID : " + fileUrl)
        }
      } catch (e) {

        Logger.log(i + ` Error moving file from URL ${fileUrl}: ${e.message}`);
      }
    } else {
      Logger.log(i + " : " + fileUrl)
    }

  }

}

function extractFileIdFromUrl(url) {
  let fileId = null;
  let match1 = url.match(/[-\w]{25,}/);
  if (match1) {
    fileId = match1[0];
  }
  return fileId;
}



function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Drive Tools')
    .addItem('List Files in Folder from A1', 'listFilesInFolderFromA1Url')
    .addToUi();

  const menu = ui.createMenu("AI Agent");
  menu.addItem("Create AI Agent Sheet", "createAISheetAndFolder").addToUi()
}


function listFilesInFolderFromA1Url() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const folderUrl = sheet.getRange("A1").getValue();


  if (!folderUrl || typeof folderUrl !== "string") {
    SpreadsheetApp.getUi().alert("Cell A1 must contain a valid Google Drive folder URL.");
    return;
  }


  const folderIdMatch = folderUrl.match(/[-\w]{25,}/);
  if (!folderIdMatch) {
    SpreadsheetApp.getUi().alert("Unable to extract folder ID from the URL in A1.");
    return;
  }


  const folderId = folderIdMatch[0];
  const folder = DriveApp.getFolderById(folderId);
  const files = folder.getFiles();


  // Clear previous results in columns A and B, except A1
  sheet.getRange("A2:B").clearContent();


  // Set headers
  sheet.getRange("A2").setValue("File Name");
  sheet.getRange("B2").setValue("File URL");


  let row = 3;
  while (files.hasNext()) {
    const file = files.next();
    sheet.getRange(row, 1).setValue(file.getName());
    sheet.getRange(row, 2).setValue(file.getUrl());
    row++;
  }


  SpreadsheetApp.getUi().alert(`Listed ${row - 3} file(s) from the folder.`);
}





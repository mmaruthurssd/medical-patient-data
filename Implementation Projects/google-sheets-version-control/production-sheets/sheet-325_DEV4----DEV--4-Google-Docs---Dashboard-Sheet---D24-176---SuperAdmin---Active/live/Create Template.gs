
const EXAMPLE_TEMPLATE_ID = "1b8RcNsN5qtAQ5JOrE3yZ_OoFdkGuHu0HB2xh5miNg9c"

const EXAMPLE_TEMPLATE_OUTPUT_FOLDER = "1cgXldrzk2SlkhIxeY4Rw9cRCy1XXw9Kz"





function onOpen() {
  let ui = SpreadsheetApp.getUi();
  let menu = ui.createMenu("Custom")
  menu.addItem("Create Template", "createTemplate").addToUi()
}





function createTemplate() {

  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const sheet = getSheetByID_(ss, TEMP_SHEET_ID);


  const outputFolder = DriveApp.getFolderById(EXAMPLE_TEMPLATE_OUTPUT_FOLDER);

  const newDoc = DriveApp.getFileById(EXAMPLE_TEMPLATE_ID).makeCopy("Created By " + Session.getActiveUser() + " _" + new Date().toLocaleDateString(), outputFolder);

  sheet.getRange(sheet.getLastRow() + 1, 2, 1, 3).setValues([[newDoc.getName(), newDoc.getUrl(), "Name, Address"]])


}








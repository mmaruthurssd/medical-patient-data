

/**
 * Creates a custom menu in the spreadsheet UI to run the script.
 * This function runs automatically when the spreadsheet is opened.
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Custom')
    .addItem('Create Protocol Document', 'createProtocolDocument')
    .addToUi();
}


function createProtocolDocument() {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  PDC.createProtocolDoc(ss)
}



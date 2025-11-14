function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Custom Scripts') // Creates a new menu called "Custom Scripts"
    //.addItem('Pull Data Based on Criteria', 'pullDataBasedOnCriteria') // Adds an option to run the function
    .addItem('Update All Patients with PAs', "updateAllPatientsWithPAs")
    .addToUi(); // Adds the menu to the UI
}




function pullDataBasedOnCriteria() {

  return
  // Source and Recipient Google Sheets IDs
  const sourceSpreadsheetId = "1A7y3cwOAjwzZgtzTcr1q41fOtCpVedQTDHGUZKozBMc"; // Replace with the source Google Sheet ID
  const recipientSpreadsheetId = "18VG76oHH2mpv3Dm3N-3PhGa9Yu8UHnTwWljiqCdV1YA"; // Replace with the recipient Google Sheet ID

  // Sheet names
  const sourceSheetName = "Incoming_Fax_Log";
  const recipientSheetName = "PA From Fax Log";

  // Open the source spreadsheet and access the source sheet
  const sourceSpreadsheet = SpreadsheetApp.openById(sourceSpreadsheetId);
  const sourceSheet = sourceSpreadsheet.getSheetByName(sourceSheetName);

  // Get all data from the source sheet
  const sourceData = sourceSheet.getDataRange().getValues();

  // Filter rows where column K (index 10) has the value "Prior Auth Documents"
  const filteredData = sourceData.filter((row, index) => {
    return index === 0 || row[12] === "Prior Auth Documents"; // Include header (row 1) and matching rows
  });



  // Open the recipient spreadsheet and access the recipient sheet
  const recipientSpreadsheet = SpreadsheetApp.openById(recipientSpreadsheetId);
  const recipientSheet = recipientSpreadsheet.getSheetByName(recipientSheetName);

  // Get existing data from the recipient sheet
  const existingData = recipientSheet.getDataRange().getValues().map(row => row.join("||")); // Convert each row to a string for comparison

  // Remove the header row from filteredData before checking for duplicates
  const newRecords = filteredData.filter((row, index) => {
    if (index === 0) return false; // Skip header
    return !existingData.includes(row.join("||")); // Check if row already exists
  });

  // Append only new records
  if (newRecords.length > 0) {
    recipientSheet.getRange(recipientSheet.getLastRow() + 1, 1, newRecords.length, newRecords[0].length).setValues(newRecords);
  }

  // Show the custom success dialog
  showCustomPopup();
}

function showCustomPopup() {
  const htmlOutput = HtmlService.createHtmlOutputFromFile('SuccessDialog')
    .setWidth(400)
    .setHeight(300);
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Process Completed');
}

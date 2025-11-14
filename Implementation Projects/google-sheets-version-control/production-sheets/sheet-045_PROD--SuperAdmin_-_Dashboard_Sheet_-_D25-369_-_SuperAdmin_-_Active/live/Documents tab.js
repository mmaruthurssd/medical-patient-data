function createDocumentsTab() {
  // Open the active spreadsheet
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  
  // Create a new tab named "Documents"
  var sheet = spreadsheet.getSheetByName("Documents");
  if (!sheet) {
    sheet = spreadsheet.insertSheet("Documents");
  } else {
    sheet.clear(); // Clear the sheet if it already exists
  }

  // Set the header values in row 2
  sheet.getRange("A2").setValue("Document");
  sheet.getRange("B2").setValue("Relevant Date");
  sheet.getRange("C2").setValue("Link to doc");
  sheet.getRange("D2").setValue("Notes");
  sheet.getRange("E2").setValue("Amount");
  sheet.getRange("F2").setValue("Web link");

  // Apply the color to the header row (A2:F2)
  sheet.getRange("A2:F2").setBackground("#cfe2f3");

  // Set text alignment (centered), font weight (bold), and font size (10) for the cells
  sheet.getRange('A2:F2')
    .setHorizontalAlignment('center')  // Center align the text
    .setFontWeight('bold')             // Make the text bold
    .setFontSize(10);                  // Set font size to 10


  // Remove columns H to Z
  sheet.deleteColumns(8, 19); // H is the 8th column, and Z is the 26th column

  // Remove rows from 31 to 1000
  sheet.deleteRows(31, 970); // 1000 - 31 + 1 = 970 rows to delete

  // Freeze the header row (row 2)
  sheet.setFrozenRows(2);
}


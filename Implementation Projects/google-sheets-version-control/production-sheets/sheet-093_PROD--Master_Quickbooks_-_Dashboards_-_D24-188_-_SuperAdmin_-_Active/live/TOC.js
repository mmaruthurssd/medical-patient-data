function modifySheetAndCreateTOC() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();

  // Step 1: Create or update "TOC" sheet
  var newSheetName = 'TOC';
  var newSheet = ss.getSheetByName(newSheetName);
  if (newSheet) {
    newSheet.clear(); // Clear the existing content if the sheet exists
  } else {
    newSheet = ss.insertSheet(newSheetName); // Create a new "TOC" sheet if it doesn't exist
  }

  // Get all sheet names in the spreadsheet
  var sheets = ss.getSheets();
  var sheetNames = sheets.map(function(sheet) {
    return sheet.getName();
  });

  // Write headers to the TOC sheet
  newSheet.getRange(1, 1).setValue("Tab");
  newSheet.getRange(1, 2).setValue("Tab Link");
  newSheet.getRange(1, 3).setValue("Purpose");
  newSheet.getRange(1, 4).setValue("Notes");

  // Loop through sheet names and create links in the TOC sheet
  for (var i = 0; i < sheetNames.length; i++) {
    var sheetName = sheetNames[i];
    var sheetLink = '=HYPERLINK("#gid=' + sheets[i].getSheetId() + '","' + sheetName + '")';
    newSheet.getRange(i + 2, 1).setValue(sheetName);
    newSheet.getRange(i + 2, 2).setFormula(sheetLink);
  }

  // Step 2: Set the color, alignment, font weight, and font size for cells A1, B1, C1, D1
  var color = '#cfe2f3';  // RGB(207, 226, 243) in hexadecimal
  sheet.getRange('A1').setBackground(color);
  sheet.getRange('B1').setBackground(color);
  sheet.getRange('C1').setBackground(color);
  sheet.getRange('D1').setBackground(color);

  // Set text alignment (centered), font weight (bold), and font size (11) for cells A1, B1, C1, D1
  sheet.getRange('A1:D1')
    .setHorizontalAlignment('center')  // Center align the text
    .setFontWeight('bold')             // Make the text bold
    .setFontSize(10);                  // Set font size to 10

  // Set font weight Bold to Column A "Tab"
  sheet.getRange('A2:A')
    .setFontWeight('bold')             // Make the text bold

  // Step 3: Remove columns F to Z
  sheet.deleteColumns(6, 20); // Column F is 6th, Z is 26th, so we delete 20 columns starting from F
  
  // Step 4: Remove rows 50 to 1000
  sheet.deleteRows(50, 951); // Starting from row 50, delete 951 rows (from row 50 to row 1000)

// Step 5: Freeze the first row
  sheet.setFrozenRows(1);  // Freeze the first row

}
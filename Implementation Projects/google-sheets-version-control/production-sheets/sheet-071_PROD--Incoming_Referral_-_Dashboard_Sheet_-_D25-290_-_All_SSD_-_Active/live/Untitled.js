






function createDropdown() {
  // Get the active spreadsheet
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  // Get the sheet where you want to create the dropdown
  var sheet = spreadsheet.getSheetByName('Dro'); // Change 'Sheet1' to your sheet name

  // Define the cell where you want the dropdown
  var cell = sheet.getRange('B4'); // Change 'A1' to your target cell

  // Define the list of items for the dropdown
  var itemList = ['Option 111', 'Option 112', 'Option 113', 'Option 114']; // Customize this list

  // Create a data validation rule with the list of items
  var rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(itemList)
    .setAllowInvalid(true)
    .build();

  // Apply the data validation rule to the cell
  cell.setDataValidation(rule);
}






function createDataAndUserFlowsTab() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // Step 1: Create the "Data & User Flows" sheet
  var sheetName = "Data & User Flows";
  var sheet = ss.getSheetByName(sheetName);

  // If the sheet already exists, clear it
  if (sheet) {
    sheet.clear(); // Clear the sheet if it already exists
  } else {
    sheet = ss.insertSheet(sheetName); // Create the sheet if it doesn't exist
  }

  // Step 2: Set the header labels in row 1
  sheet.getRange("B1").setValue("Description");
  sheet.getRange("C1").setValue("Who should do this?");
  sheet.getRange("D1").setValue("What is it used for?");
  sheet.getRange("E1").setValue("Steps to do it");
  sheet.getRange("F1").setValue("Result of completing the flow");
  sheet.getRange("G1").setValue("Relevant Sheets / Folders");

  // Step 3: Set the text in cells A2, A7, and A22
  sheet.getRange("A2").setValue("Things you can do in this Dashboard");
  sheet.getRange("A7").setValue("Data feed flows (how does the data move into and out of the sheet?)");
  sheet.getRange("A22").setValue("User flows");

  // Step 4: Group rows
  sheet.getRange("3:6").shiftRowGroupDepth(1);  // Group rows 3 to 6
  sheet.getRange("8:21").shiftRowGroupDepth(1);  // Group rows 8 to 21
  sheet.getRange("23:30").shiftRowGroupDepth(1);  // Group rows 23 to 30

  // Optional: Set the column widths for better readability (adjust as needed)
  sheet.setColumnWidth(1, 200); // Column A for the flow titles
  sheet.setColumnWidth(2, 150); // Column B for "Description"
  sheet.setColumnWidth(3, 150); // Column C for "Who should do this?"
  sheet.setColumnWidth(4, 150); // Column D for "What is it used for?"
  sheet.setColumnWidth(5, 150); // Column E for "Steps to do it"
  sheet.setColumnWidth(6, 200); // Column F for "Result of completing the flow"
  sheet.setColumnWidth(7, 200); // Column G for "Relevant Sheets / Folders"

  // Step 5: Freeze the first row
  sheet.setFrozenRows(1);  // Freeze the first row with the headers

  // Step 6: Set the color for cells A1, B1, C1, D1, E1, F1, G1
  var color = '#cfe2f3';  // RGB(207, 226, 243) in hexadecimal
  sheet.getRange('A1').setBackground(color);
  sheet.getRange('B1').setBackground(color);
  sheet.getRange('C1').setBackground(color);
  sheet.getRange('D1').setBackground(color);
  sheet.getRange('E1').setBackground(color);
  sheet.getRange('F1').setBackground(color);
  sheet.getRange('G1').setBackground(color);

  // Set text alignment (centered), font weight (bold), and font size (10) for the cells
  sheet.getRange('A1:G1')
    .setHorizontalAlignment('center')  // Center align the text
    .setFontWeight('bold')             // Make the text bold
    .setFontSize(10);                  // Set font size to 10

  // Set font weight Bold to Column A "Tab"
  sheet.getRange('A2:A')
    .setFontWeight('bold')             // Make the text bold

  // Step 7: Remove columns I to Z
  sheet.deleteColumns(9, 18); // Column I is 9th, Z is 26th, so we delete 18 columns starting from I

  // Step 8: Remove rows 50 to 1000
  sheet.deleteRows(51, 950); // Starting from row 51, delete 950 rows (from row 51 to row 1000)

}
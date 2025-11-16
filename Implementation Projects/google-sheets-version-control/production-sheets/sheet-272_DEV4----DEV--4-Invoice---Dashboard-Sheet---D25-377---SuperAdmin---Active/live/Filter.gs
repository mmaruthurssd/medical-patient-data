function sendActiveCellToFiltered() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const activeCell = ss.getActiveCell();
  const value = activeCell.getValue();

  const filteredSheet = ss.getSheetByName("Filtered Data");
  if (!filteredSheet) {
    throw new Error("Sheet 'Filtered Data' not found!");
  }

  // Put value in A1
  filteredSheet.getRange("A1").setValue(value);

  // Make 'Filtered Data' sheet active
  ss.setActiveSheet(filteredSheet);
}
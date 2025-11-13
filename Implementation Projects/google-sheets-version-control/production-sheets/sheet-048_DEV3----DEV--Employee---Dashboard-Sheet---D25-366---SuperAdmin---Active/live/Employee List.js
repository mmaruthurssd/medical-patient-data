
function sortEmployeeList() {
  const ActiveSheet = SpreadsheetApp.getActive().getSheetByName('Employee List');
  const LastRow = ActiveSheet.getLastRow()
  const LastColumn = ActiveSheet.getLastColumn()
  ActiveSheet.getRange(2, 1, LastRow - 1, LastColumn).sort({column: 1, ascending: true});
}

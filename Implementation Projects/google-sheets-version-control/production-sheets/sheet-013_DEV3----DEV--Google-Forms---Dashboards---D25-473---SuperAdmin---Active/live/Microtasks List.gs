
function onEdit(e) {

  const ActiveSheet = e.source.getActiveSheet();

  if (ActiveSheet.getName() !== 'Microtasks List')
    return;

  const HeaderRow = ActiveSheet.getRange(1, 1, 1, ActiveSheet.getLastColumn()).getValues()[0];
  const StatusColIndex = HeaderRow.indexOf('Status');

  if (e.range.getColumn() === StatusColIndex + 1)
    sortMicrotasksList();

}


function sortMicrotasksList() {
  const ActiveSheet = SpreadsheetApp.getActive().getSheetByName('Microtasks List');
  const LastRow = ActiveSheet.getLastRow()
  const LastColumn = ActiveSheet.getLastColumn()
  ActiveSheet.getRange(2, 1, LastRow - 1, LastColumn).sort({ column: 1, ascending: true });
};




function tempSort() {

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet()
  sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).sort([{ column: 1, ascending: false }])

}

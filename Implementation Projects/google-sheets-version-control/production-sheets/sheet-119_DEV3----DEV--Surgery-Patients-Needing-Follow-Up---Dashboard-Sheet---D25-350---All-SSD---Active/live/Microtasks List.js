


function onEdit(e) {

  //return

  const ActiveSheet = e.source.getActiveSheet();

  if (ActiveSheet.getName() !== 'Microtasks List' && ActiveSheet.getName() !== 'Dr. M (Main)')
    return;

  const HeaderRow = ActiveSheet.getRange(1, 1, 1, ActiveSheet.getLastColumn()).getValues()[0];
  const StatusColIndex = HeaderRow.indexOf('Status');

  if (e.range.getColumn() === StatusColIndex + 1)
    sortMicrotasksList(ActiveSheet);

}


function sortMicrotasksList(ActiveSheet) {
  //const ActiveSheet = SpreadsheetApp.getActive().getSheetByName('Microtasks List');
  const LastRow = ActiveSheet.getLastRow()
  const LastColumn = ActiveSheet.getLastColumn()
  if (ActiveSheet.getName() == "Dr. M (Main)") {
    ActiveSheet.getRange(3, 1, LastRow - 2, LastColumn).sort([{ column: 1, ascending: true }, { column: 3, ascending: false }]);
  } else {
    ActiveSheet.getRange(2, 1, LastRow - 1, LastColumn).sort([{ column: 1, ascending: true }, { column: 3, ascending: false }]);
  }
};
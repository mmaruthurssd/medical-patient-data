
function onEditSort(e) {

  const ActiveSheet = e.source.getActiveSheet();


  if (ActiveSheet.getSheetId().toString() == '496835781') {
    let range = e.range;
    let col = range.getColumn();
    let row = range.getRow();

    if (col == 9 && row > 2) {
      ActiveSheet.getRange(3, 1, ActiveSheet.getLastRow() - 2, ActiveSheet.getLastColumn()).sort({ column: 1, ascending: true });
    }
  }


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





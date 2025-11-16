
function onEditINSTALL(e) {

  const ActiveSheet = e.source.getActiveSheet();

  if (ActiveSheet.getName() == 'Bookkeeper Task List') {
    let range = e.range;
    let row = range.getRow();
    let col = range.getColumn();

    if (row > 1 && col == 2) {
      //let value = e.value;
      //Logger.log(value)
      let date = ActiveSheet.getRange(row, col).getValue()
      ActiveSheet.getRange(row, col + 1).setValue(date)
      ActiveSheet.getRange(row, col).clearContent()
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


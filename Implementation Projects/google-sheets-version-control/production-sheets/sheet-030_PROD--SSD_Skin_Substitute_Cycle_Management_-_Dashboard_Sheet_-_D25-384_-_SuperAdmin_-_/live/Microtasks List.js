
function onEdit(e) {

  const ActiveSheet = e.source.getActiveSheet();

  if (ActiveSheet.getName() == 'Microtasks List') {


    const HeaderRow = ActiveSheet.getRange(1, 1, 1, ActiveSheet.getLastColumn()).getValues()[0];
    const StatusColIndex = HeaderRow.indexOf('Status');

    if (e.range.getColumn() === StatusColIndex + 1)
      sortMicrotasksList(ActiveSheet);

  } else if (ActiveSheet.getName() == 'Follow Up') {
    const HeaderRow = ActiveSheet.getRange(1, 1, 1, ActiveSheet.getLastColumn()).getValues()[0];
    const StatusColIndex = HeaderRow.indexOf('Status');

    if (e.range.getColumn() === StatusColIndex + 1) {
      let row = e.range.getRow();
      ActiveSheet.getRange(row, 4).setValue(new Date())

      sortAppFu(ActiveSheet);
    }
  }

}


function sortMicrotasksList(ActiveSheet) {
  //const ActiveSheet = SpreadsheetApp.getActive().getSheetByName('Microtasks List');
  const LastRow = ActiveSheet.getLastRow()
  const LastColumn = ActiveSheet.getLastColumn()
  ActiveSheet.getRange(2, 1, LastRow - 1, LastColumn).sort({ column: 1, ascending: true });
};


function sortAppFu(ActiveSheet) {
  //const ActiveSheet = SpreadsheetApp.getActive().getSheetByName('Microtasks List');
  const LastRow = ActiveSheet.getLastRow()
  const LastColumn = ActiveSheet.getLastColumn()
  ActiveSheet.getRange(2, 1, LastRow - 1, LastColumn).sort([{ column: 1, ascending: true }, { column: 7, ascending: true }, { column: 8, ascending: true }]);
};



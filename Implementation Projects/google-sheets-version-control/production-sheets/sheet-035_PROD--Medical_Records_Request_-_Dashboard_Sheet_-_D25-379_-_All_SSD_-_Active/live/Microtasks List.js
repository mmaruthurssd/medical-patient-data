


function onEdit(e) {

  const ActiveSheet = e.source.getActiveSheet();

  if (ActiveSheet.getName() !== 'Microtasks List' && ActiveSheet.getName() !== 'Medical Records Log (Main)')
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
  ActiveSheet.getRange(2, 1, LastRow - 1, LastColumn).sort([{ column: 1, ascending: true }]);
};
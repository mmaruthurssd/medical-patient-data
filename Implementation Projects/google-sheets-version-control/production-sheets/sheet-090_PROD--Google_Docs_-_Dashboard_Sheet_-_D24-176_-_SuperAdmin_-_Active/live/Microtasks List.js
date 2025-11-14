
function onEditSort(e) {

  const ActiveSheet = e.source.getActiveSheet();

  if (ActiveSheet.getSheetId().toString() == '2138678692') {
    let range = e.range;
    let row = range.getRow();
    let col = range.getColumn();

    if (row == 3 && col == 2) {
      ActiveSheet.getRange("B7:B").clearContent()
      ActiveSheet.getRange("E7:E").clearContent()
    }

  } 
  
  // else if (ActiveSheet.getSheetId().toString() == CREATED_DOC_LOG_SHEET_ID) {
  //   let range = e.range;
  //   let col = range.getColumn();
  //   if (col == 8) {
  //     ActiveSheet.getRange(2, 1, ActiveSheet.getLastRow() - 1, ActiveSheet.getLastColumn()).sort([{ column: 1, ascending: true }, { column: 3, ascending: false }]);
  //   }
  // }



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



function onEdit(e) {

  let range = e.range;
  let col = range.getColumn()
  let row = range.getRow()

  const ActiveSheet = e.source.getActiveSheet();

  const HeaderRow = ActiveSheet.getRange(1, 1, 1, ActiveSheet.getLastColumn()).getValues()[0];

  const ActiveSheetName = ActiveSheet.getSheetName()

  if (ActiveSheetName == 'Trussville' || ActiveSheetName == 'Gadsden' || ActiveSheetName == 'Oxford' || ActiveSheetName == 'Pell City') {

    const CurrentInvenColIndex = HeaderRow.indexOf('# Current Inventory');
    const StockItemIndex = HeaderRow.indexOf('Stock Item');

    if (col === CurrentInvenColIndex + 1 || col === StockItemIndex + 1)
      sortLocationOrdersLog_(ActiveSheet)
  }



  if (ActiveSheetName == 'Order Request') {
    const orderStatusColIndex = HeaderRow.indexOf('Order Status');
    if (col === orderStatusColIndex + 1) {
      ActiveSheet.getRange(row, HeaderRow.indexOf('Status Date') + 1).setValue(new Date().toLocaleDateString())
      SpreadsheetApp.flush()
      sortMicrotasksList(ActiveSheet);
    }
  }

  if (ActiveSheetName !== 'Microtasks List' && ActiveSheetName !== 'Order Tracking Log (all orders go here - Main)')
    return;


  const StatusColIndex = HeaderRow.indexOf('Status');

  if (e.range.getColumn() === StatusColIndex + 1)
    sortMicrotasksList(ActiveSheet);

}


function sortMicrotasksList(ActiveSheet) {
  const LastRow = ActiveSheet.getLastRow()
  const LastColumn = ActiveSheet.getLastColumn()
  ActiveSheet.getRange(2, 1, LastRow - 1, LastColumn).sort({ column: 1, ascending: true });
};



function sortLocationOrdersLog_(ActiveSheet) {
  const LastRow = ActiveSheet.getLastRow()
  const LastColumn = ActiveSheet.getLastColumn()
  ActiveSheet.getRange(2, 1, LastRow - 1, LastColumn).sort([{ column: 1, ascending: true }, { column: 5, ascending: true }, { column: 16, ascending: true }, { column: 17, ascending: true }]);
}







function testOnEdit() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  const range = sheet.getActiveRange()


  let e = {
    source: ss,
    range: range
  }

  onEditSort(e)

}



function onEditSort(e) {



  const ActiveSheet = e.source.getActiveSheet();

  let HeaderRow = ActiveSheet.getRange(2, 1, 1, ActiveSheet.getLastColumn()).getValues()[0];

  const ActiveSheetName = ActiveSheet.getSheetName()

  if (ActiveSheetName == SHELF_STOCK_COUNT_LOCATION_SHEET || ActiveSheetName == BULK_STOCK_COUNT_LOCATION_SHEET) {

    // const trussvilIndex = HeaderRow.indexOf('Trussville Stock #');
    // const gadsenIndex = HeaderRow.indexOf('Gadsden Stock #');
    // const oxfordIndex = HeaderRow.indexOf('Oxford Stock #');
    // const pellCityIndex = HeaderRow.indexOf('Pell City Stock #');
    const summIndex = HeaderRow.indexOf('Summary Description');

    let col = e.range.getColumn()

    if (col > 9 && col < 22 && (ActiveSheetName == BULK_STOCK_COUNT_LOCATION_SHEET || ActiveSheetName == SHELF_STOCK_COUNT_LOCATION_SHEET)) {
      sortLocationOrdersLog_(ActiveSheet)

    }
    // else if (col == summIndex && ActiveSheetName == SHELF_STOCK_COUNT_LOCATION_SHEET) {
    //   sortLocationOrdersLog_(ActiveSheet)
    // }


    return
  }

  if (ActiveSheetName !== 'Microtasks List' && ActiveSheetName !== 'Order Log (all orders go here)')
    return;



  HeaderRow = ActiveSheet.getRange(1, 1, 1, ActiveSheet.getLastColumn()).getValues()[0];
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
  //ActiveSheet.getRange(2, 1, LastRow - 1, LastColumn).sort([{ column: 1, ascending: true }, { column: 5, ascending: true }, { column: 16, ascending: true }, { column: 17, ascending: true }]);


  ActiveSheet.getRange(3, 1, LastRow - 2, LastColumn).sort([{ column: 1, ascending: true }, { column: 14, ascending: true }, { column: 15, ascending: true }, { column: 28, ascending: true }]);

}














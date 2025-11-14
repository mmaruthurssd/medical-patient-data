

//this is running from the invoice log script function "updateDataInInvoiceLogSheet()"
function updateDataInConsolidatedLogSheet() {

  //return

  console.log('checking for new data to be updated ...');

  const ActiveSpreadsheet = SpreadsheetApp.getActive();
  const QuerySheet = ActiveSpreadsheet.getSheetByName('query');
  let DataValues = QuerySheet.getRange('A2:L').getDisplayValues().filter(row => row[0] === '0');

  if (DataValues.length === 0) {
    console.log('no new data found to be updated ...');
    return;
  }

  console.log('mapping the new data to be updated ...');

  DataValues.forEach(row => {
    row.shift();
    row.splice(9, 1)
    row.splice(8, 1)

    row.splice(7, 0, "");
  });





  const ConsolidatedSheet = ActiveSpreadsheet.getSheetByName('Consolidated Log');

  SpreadsheetApp.flush()

  ConsolidatedSheet.getRange(ConsolidatedSheet.getLastRow() + 1, 2, DataValues.length, DataValues[0].length)
    .setValues(DataValues);

  ConsolidatedSheet.getRange(3, 2, ConsolidatedSheet.getLastRow() - 2, ConsolidatedSheet.getLastColumn() - 1).sort({ column: 3, ascending: false });

  console.log(DataValues.length + ' new records were found and updated ...');



  processFilesAIMain(ConsolidatedSheet)

}





function testFunc() {

  let arr = [1, 2, 3, 4, 5]
  arr.splice(1, 1)
  Logger.log(arr)
}


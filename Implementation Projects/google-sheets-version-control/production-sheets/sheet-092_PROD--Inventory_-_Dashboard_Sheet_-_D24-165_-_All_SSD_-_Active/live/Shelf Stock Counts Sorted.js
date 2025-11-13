function shelfStockCountsSortedProcess() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sourceSheet = ss.getSheetByName("Shelf Stock Counts");

  const sourceData = sourceSheet.getRange("E3:AC").getDisplayValues();


  const destSheet = ss.getSheetByName("Shelf Stock Counts Sorted");

  destSheet.getRange(3, 5, sourceData.length, sourceData[0].length).setValues(sourceData)

  destSheet.getRange(3, 1, destSheet.getLastRow() - 2, destSheet.getLastColumn()).sort([{ column: 14, ascending: true }, { column: 15, ascending: true }, { column: 16, ascending: true }]);

}

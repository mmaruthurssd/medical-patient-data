

const ALL_PRE_EMA_BIOPSIES_SS_ID = "1o_29L0d7mjg_AmUzHhWUZ9hk3Lf63v-V7k4v0Q7MiXk"
const ALL_PRE_EMA_PIVOT_SHEET = "DataforNewPSD"


function getPivotTables() {

  return

  let PreEmaSS = SpreadsheetApp.openById(ALL_PRE_EMA_BIOPSIES_SS_ID);
  let pivotSheet = PreEmaSS.getSheetByName(ALL_PRE_EMA_PIVOT_SHEET);

  let pivotData = pivotSheet.getRange(1, 1, pivotSheet.getLastRow(), pivotSheet.getLastColumn()).getValues();

  //Logger.log(pivotData)


  let ss = SpreadsheetApp.getActiveSpreadsheet();

  let sheet = ss.getSheetByName("Pre-EMA Biopsies");


  if (sheet.getLastRow() > 0) {
    sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).clearContent();
  }

  if (pivotData.length > 0) {
    sheet.getRange(1, 1, pivotData.length, pivotData[0].length).setValues(pivotData)
  }

}

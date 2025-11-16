

const PATHOLOGY_SS_ID = "1SJM5-Gk1QdIcDxN1NMZB0d9yr-mULBKUI_DWdzz3Ebo";
const PatientCollections = "1WUD8jr4Dgs2gTgZ-avalJogK9QTn0w-jDwNlpvSpYSI"
const PAST_SHEET = "PastAppts";
const FUTURE_SHEET = "FutureAppts";



/**
 * runs every 6 hours from scripts@ssdspc.com account 
 */


function sendDataToPathology() {
  sendPastDataToPathology()
  sendFutureDataToPathology()
}



function sendPastDataToPathology() {

  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("ApptsPast");


  let allData = []

  if (sheet.getLastRow() > 1) {
    allData = sheet.getRange(2, 1, sheet.getLastRow() - 1, 10).getDisplayValues().filter(r => r[0] != "" && r[1] != "");
  } else {
    return
  }

  if (allData.length == 0) return




  if (allData.length > 0) {

    Sheets.Spreadsheets.Values.batchUpdate({ valueInputOption: "USER_ENTERED", data: [{ range: "'" + PAST_SHEET + "'!A2:J" + (allData.length + 1), values: allData }] }, PATHOLOGY_SS_ID);
    Sheets.Spreadsheets.Values.batchUpdate({ valueInputOption: "USER_ENTERED", data: [{ range: "'" + PAST_SHEET + "'!A2:J" + (allData.length + 1), values: allData }] }, PatientCollections);
  }


}






function sendFutureDataToPathology() {

  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("ApptsFuture");


  let allData = []

  if (sheet.getLastRow() > 1) {
    allData = sheet.getRange(2, 1, sheet.getLastRow() - 1, 13).getDisplayValues().filter(r => r[0] != "" && r[1] != "");
  } else {
    return
  }

  if (allData.length == 0) return




  if (allData.length > 0) {

    Sheets.Spreadsheets.Values.batchUpdate({ valueInputOption: "USER_ENTERED", data: [{ range: "'" + FUTURE_SHEET + "'!A2:M" + (allData.length + 1), values: allData }] }, PATHOLOGY_SS_ID);
    Sheets.Spreadsheets.Values.batchUpdate({ valueInputOption: "USER_ENTERED", data: [{ range: "'" + FUTURE_SHEET + "'!A2:M" + (allData.length + 1), values: allData }] }, PatientCollections);
  }


}









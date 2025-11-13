

const IBD_SS_ID = "1MfMs9UglAHt55zhL5lTHa_ytFcCi3u1cbdn4f4G4ARo";
const IBD_SHEET = "AppointmentsRD";



/**
 * runs every 6 hours from scripts@ssdspc.com account 
 */
function sendDataToIBD() {

  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("ApptsIBD2025");


  let allData = []

  if (sheet.getLastRow() > 1) {
    allData = sheet.getRange(2, 1, sheet.getLastRow() - 1, 10).getDisplayValues().filter(r => r[0] != "" && r[1] != "");
  } else {
    return
  }

  if (allData.length == 0) return









  // let destSS = SpreadsheetApp.openById(IBD_SS_ID);
  // let destSheet = destSS.getSheetByName(IBD_SHEET);

  if (allData.length > 0) {
    //destSheet.getRange(2, 2, allData.length, allData[0].length).setValues(allData)

    Sheets.Spreadsheets.Values.batchUpdate({ valueInputOption: "USER_ENTERED", data: [{ range: "'" + IBD_SHEET + "'!B2:K" + (allData.length + 1), values: allData }] }, IBD_SS_ID);
  }



}







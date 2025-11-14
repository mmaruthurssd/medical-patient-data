

const PATIENT_NOTI_SS_ID = "1KmLcMRKJxESaRx2v-jCq7eDr8LdS1uiwuRRyTP8oenc";
const PATIENT_NOTI_SHEET = "Future Appointments RD";



/**
 * runs every Day Trigger from scripts@ssdspc.com account 
 */
function sendDataToPatientNotification() {

  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Pell City Patients Data");


  let allData = []

  if (sheet.getLastRow() > 1) {
    allData = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getDisplayValues()
  }


  if (allData.length == 0) return



  if (allData.length > 0) {
    let destSS = SpreadsheetApp.openById(PATIENT_NOTI_SS_ID);
    let destSheet = destSS.getSheetByName(PATIENT_NOTI_SHEET);

    destSheet.getRange(1, 1, allData.length, allData[0].length).setValues(allData)
  }



}







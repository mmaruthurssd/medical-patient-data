const Prior_Auth_SS_ID = "18VG76oHH2mpv3Dm3N-3PhGa9Yu8UHnTwWljiqCdV1YA";
const Prior_Auth_SHEET = "MRN DB";



const INCOMMING_FAX_LOG_SS = "1A7y3cwOAjwzZgtzTcr1q41fOtCpVedQTDHGUZKozBMc";
const INCOMMING_FAX_LOG_SHEET = "Appointments DB"



/**
 * runs every Day Trigger from scripts@ssdspc.com account 
 */
function sendDataToPriorAuthorization() {

  let ss = SpreadsheetApp.getActiveSpreadsheet();

  let pastSheet = ss.getSheetByName("ApptsPast");
  let futureSheet = ss.getSheetByName("ApptsFuture");

  let allPastData = []
  if (pastSheet.getLastRow() > 1) {
    allPastData = pastSheet.getRange(1, 1, pastSheet.getLastRow(), 5).getDisplayValues().map(r => [r[0], r[1], r[4]])
  }


  let allFutureData = []
  if (futureSheet.getLastRow() > 1) {
    allFutureData = futureSheet.getRange(1, 1, futureSheet.getLastRow(), 5).getDisplayValues().map(r => [r[0], r[1], r[4]])
  }




  const preEmaSheet = ss.getSheetByName("Pre-EMA");
  const preEmaData = preEmaSheet.getRange(2, 1, preEmaSheet.getLastRow() - 1, 3).getDisplayValues();


  const combinePast = allPastData.concat([...preEmaData])


  let destSS = SpreadsheetApp.openById(Prior_Auth_SS_ID);
  let destSheet = destSS.getSheetByName(Prior_Auth_SHEET);
  destSheet.getRange("I2:P").clearContent()


  let faxDestSS = SpreadsheetApp.openById(INCOMMING_FAX_LOG_SS);
  let faxDestSheet = faxDestSS.getSheetByName(INCOMMING_FAX_LOG_SHEET);
  faxDestSheet.getRange("B2:H").clearContent()

  if (combinePast.length > 0) {
    destSheet.getRange(1, 8, combinePast.length, combinePast[0].length).setValues(combinePast)
    destSheet.getRange(2, 8, combinePast.length - 1, combinePast[0].length).sort([{ column: 9, ascending: false }])

    faxDestSheet.getRange(1, 2, combinePast.length, combinePast[0].length).setValues(combinePast)
    faxDestSheet.getRange(2, 2, combinePast.length - 1, combinePast[0].length).sort([{ column: 3, ascending: false }])
  }


  if (allFutureData.length > 0) {
    destSheet.getRange(1, 12, allFutureData.length, allFutureData[0].length).setValues(allFutureData)

    faxDestSheet.getRange(1, 6, allFutureData.length, allFutureData[0].length).setValues(allFutureData)
  }


}






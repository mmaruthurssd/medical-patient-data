const SSD_Paycor_Dashboard_ID = "15wowygej1OdZ7IYKTr-bucPLg2-MAU_NfdQxJWf9nUI"

const PAYSTUBS_RANGE = "Paystubs_Financial!A1:E"


function getPayStubs() {
  return

  // let payStubsValues = Sheets.Spreadsheets.Values.get(SSD_Paycor_Dashboard_ID, PAYSTUBS_RANGE)
  // let allData = payStubsValues.values;

  // Logger.log(payStubsValues[0])
  // Logger.log(payStubsValues[1])


  // let response = Sheets.Spreadsheets.Values.get(spreadsheetId, range);
  //     var values = response.values;

  let paycorSS = SpreadsheetApp.openById(SSD_Paycor_Dashboard_ID);
  let paystubsSheet = paycorSS.getSheetByName("Paystubs_Financial");

  let allData = paystubsSheet.getRange(2, 1, paystubsSheet.getLastRow() - 1, paystubsSheet.getLastColumn()).getDisplayValues()



  let newData = allData.filter(row => row[0]!="Jean Gannett");

  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Paystubs");

  sheet.getRange(2, 1, newData.length, newData[0].length).setValues(newData)

  // Sheets.Spreadsheets.Values.batchUpdate({ valueInputOption: "USER_ENTERED", data: [{ range: "'" + IBD_SHEET + "'!B2:K" + (allData.length + 1), values: allData }] }, IBD_SS_ID);

}

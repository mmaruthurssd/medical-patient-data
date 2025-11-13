

const MASTER_DAILY_LIST_SHEET = "Daily Tasks"










function createRowAdjustingTrigger() {

  let timeZone = Session.getScriptTimeZone();
  //Logger.log(timeZone)

  ScriptApp.newTrigger("processRowsWithTrigger")
    .timeBased()
    .everyDays(1)
    .inTimezone(timeZone)
    .atHour(3)
    .nearMinute(30)
    .create()


}





function processRowsWithTrigger() {


  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(MASTER_DAILY_LIST_SHEET);

  let allData = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getDisplayValues();
  for (var i = 2; i < allData.length; i++) {
    if (allData[i][0] != "" && allData[i][2] != "") {

      if (allData[0][5] == "Open") {
        sheet.getRange(i + 1, 5).setValue("Incomplete")
      } else {
        sheet.getRange(i + 1, 5).setValue("")
      }

      if (allData[0][8] == "Open") {
        sheet.getRange(i + 1, 8).setValue("Incomplete")
      } else {
        sheet.getRange(i + 1, 8).setValue("")
      }

      if (allData[0][11] == "Open") {
        sheet.getRange(i + 1, 11).setValue("Incomplete")
      } else {
        sheet.getRange(i + 1, 11).setValue("")
      }

      if (allData[0][14] == "Open") {
        sheet.getRange(i + 1, 14).setValue("Incomplete")
      } else {
        sheet.getRange(i + 1, 14).setValue("")
      }
    }
  }


}



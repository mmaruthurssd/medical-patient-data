
function createTrigger_() {
  let timeZone = Session.getScriptTimeZone();
  //Logger.log(timeZone)
  ScriptApp.newTrigger("processArchive")
    .timeBased()
    .everyDays(1)
    .inTimezone(timeZone)
    .atHour(2)
    .nearMinute(0)
    .create()
}


function processArchive() {
  return
  let SS = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = SS.getSheetByName("Job post & applicant log");

  let allData = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getValues()

  let archiveSheet = SS.getSheetByName("Archived")

  let status_col = sheet.getRange("JOB_POST_APP_STATUS_COL").getColumn();

  for (var i = allData.length - 1; i > 0; i--) {

    if (allData[i][status_col - 1] == "Archive") {
      archiveSheet.appendRow(allData[i])
      sheet.deleteRows(i + 1, 1)
    }
  }

}


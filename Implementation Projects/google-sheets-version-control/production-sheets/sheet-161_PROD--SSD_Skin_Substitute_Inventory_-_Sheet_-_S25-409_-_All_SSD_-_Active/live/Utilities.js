




function createConsolidatedTriggerNew() {
  ScriptApp.newTrigger("consolidatedEmailProcessMain")
    .timeBased()
    .everyWeeks(1)
    .onWeekDay(ScriptApp.WeekDay.FRIDAY)
    .atHour(18)
    .nearMinute(0)
    .inTimezone(Session.getScriptTimeZone())
    .create()
}




function createTriggerNew() {
  ScriptApp.newTrigger("dailyAppliedEmailProcessTrigger")
    .timeBased()
    .everyDays(1)
    .atHour(21)
    .nearMinute(0)
    .inTimezone(Session.getScriptTimeZone())
    .create()
}






function isValidDate_(d) {
  return d instanceof Date && !isNaN(d);
}








function updateScriptStatus_(ss, scriptId, statusRow, status) {
  let script = ss.getSheetByName("Script");

  let thisScripIds = script.getRange(1, 1, script.getLastRow(), 1).getValues().map(r => r[0]);
  let indexOfThisScriptId = thisScripIds.indexOf(scriptId);
  if (indexOfThisScriptId > -1) {
    script.getRange(indexOfThisScriptId + 1, 9, 1, 3).setValues(statusRow)
  }



  let AllScriptSS = SpreadsheetApp.openById("1nbu0Z3JS1ZH_QKjcOoQJ7ohDPOVqlQMQ597XLBqiOd8");
  let scriptLogSheet = AllScriptSS.getSheetByName("Scripts Log");

  let scriptLogs = scriptLogSheet.getRange(1, 1, scriptLogSheet.getLastRow(), scriptLogSheet.getLastColumn()).getValues()
  let scriptLogIds = scriptLogs.map(r => r[0]);

  let indexOfScriptId = scriptLogIds.indexOf(scriptId);
  if (indexOfScriptId > -1) {
    scriptLogSheet.getRange(indexOfScriptId + 1, 9, 1, 3).setValues(statusRow)

    let scriptCount = scriptLogs[indexOfScriptId][11] + 1
    scriptLogSheet.getRange(indexOfScriptId + 1, 12).setValue(scriptCount)

    if (status == false) {
      let errorCount = scriptLogs[indexOfScriptId][12] + 1
      scriptLogSheet.getRange(indexOfScriptId + 1, 13).setValue(errorCount)
    }

  }

}



















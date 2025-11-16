

const RECURRING_SS = {
  SUPER_ADMIN: { SS: "16vMlMxm80INrzjHnYNiIL-X-hzYJfe1je6Mc_0TYIW0", TASKS: "Daily Tasks", TEMPLATE: "Daily Task Template" },
  REMOTE: { SS: "1xUzY7FKVqh-m8lcEz7ut1veVa4feBGXxM6lwkF_ACbk", TASKS: "Daily Tasks", TEMPLATE: "Daily Task Template" },
  SURGERY_SCHE: { SS: "1o2RepD8AokxYj3wxC4z0Fem-WDzoV2pZDr_CX7DoE8Y", TASKS: "Daily Tasks", TEMPLATE: "Daily Task Template" },
  ADMIN: { SS: "1teQKiQy3Vgux_pbrFSP_R6dNT6ME4Rq3NH4AEy_JKj0", TASKS: "Daily Tasks", TEMPLATE: "Daily Task Template" },
  CLINICAL_MA: { SS: "1PNsLegMO2FownB2tSX-ZUc0q-o9pD8XIMatnmfTPEkA", TASKS: "Daily Tasks", TEMPLATE: "Daily Task Template" },
  SURGICAL_MA: { SS: "1DE5JwiBoT23ygp-ufQCdQ3JYkBR9pl3Whod4__zLpPA", TASKS: "Daily Tasks", TEMPLATE: "Daily Task Template" },
  MAINTENANCE: { SS: "1pW5rb38mUQOiYVaRsZSn6m4AIQ8yDikmMDfZhdMnApA", TASKS: "Daily Tasks", TEMPLATE: "Daily Task Template" },
  BILING: { SS: "1LynnFttrkSjGxaNhR5iyGoDYKaWoBKWePLg49jgdlWo", TASKS: "Daily Tasks", TEMPLATE: "Daily Task Template" },
  APP: { SS: "1MigD0BBHHYhYK18ZlbkAK1k8IzWK2fwxOeYnkYORzg4", TASKS: "Daily Tasks", TEMPLATE: "Daily Task Template" },
  MOHS: { SS: "15iCDpgVSD7imHkmfn1Hfvre3qdmooTgD88X-jVzHzpU", TASKS: "Daily Tasks", TEMPLATE: "Daily Task Template" },
  PRIOR_AUTH: { SS: "1hOVAmQo3M2kIBoMQZ5fYqMflZh8_iAxL66-nA1ZGTR8", TASKS: "Daily Tasks", TEMPLATE: "Daily Task Template" },

  FRONT_DESK: { SS: "11MKo1xLdUGreNniy5QxKFIJ-zk7dhgYkLKW_bqqVV1g", TASKS: "Daily Tasks", TEMPLATE: "Daily Task Template" },
}






function createDailyReccTrigger() {

  let timeZone = Session.getScriptTimeZone();
  //Logger.log(timeZone)

  ScriptApp.newTrigger("dailyRecurringMain")
    .timeBased()
    .everyDays(1)
    .inTimezone(timeZone)
    .atHour(21)
    .nearMinute(0)
    .create()

}




function dailyRecurringMain() {

  try {
    addDailyDataTasksMetricsLog_();
  } catch (err) { Logger.log(err) }

  try {
    storeLastCompletedDateAndBy_();
  } catch (err) { Logger.log(err) }

}



function addDailyDataTasksMetricsLog_() {

  const ss = SpreadsheetApp.getActiveSpreadsheet()

  const QuerySheet = ss.getSheetByName('Metrics_Query');
  const LogSheet = ss.getSheetByName('Daily Task History');


  const DailyLogData = QuerySheet.getRange('A3:J').getDisplayValues().filter(row => (row[0] !== '' && row[2] !== '')).map(r => [r[2], r[9], r[0], r[3], r[4], r[8], r[6], r[7]])

  if (DailyLogData.length > 0) {
    LogSheet.getRange(LogSheet.getLastRow() + 1, 1, DailyLogData.length, DailyLogData[0].length).setValues(DailyLogData);

    LogSheet.getRange(2, 1, LogSheet.getLastRow() - 1, LogSheet.getLastColumn()).sort([{ column: 3, ascending: false }]);
  }
}







function storeLastCompletedDateAndBy_() {
  addCompletionDateToTemplate_(RECURRING_SS.SUPER_ADMIN.SS, RECURRING_SS.SUPER_ADMIN.TASKS, RECURRING_SS.SUPER_ADMIN.TEMPLATE)
  addCompletionDateToTemplate_(RECURRING_SS.REMOTE.SS, RECURRING_SS.REMOTE.TASKS, RECURRING_SS.REMOTE.TEMPLATE)
  addCompletionDateToTemplate_(RECURRING_SS.SURGERY_SCHE.SS, RECURRING_SS.SURGERY_SCHE.TASKS, RECURRING_SS.SURGERY_SCHE.TEMPLATE)
  addCompletionDateToTemplate_(RECURRING_SS.ADMIN.SS, RECURRING_SS.ADMIN.TASKS, RECURRING_SS.ADMIN.TEMPLATE)
  addCompletionDateToTemplate_(RECURRING_SS.CLINICAL_MA.SS, RECURRING_SS.CLINICAL_MA.TASKS, RECURRING_SS.CLINICAL_MA.TEMPLATE)
  addCompletionDateToTemplate_(RECURRING_SS.SURGICAL_MA.SS, RECURRING_SS.SURGICAL_MA.TASKS, RECURRING_SS.SURGICAL_MA.TEMPLATE)
  addCompletionDateToTemplate_(RECURRING_SS.MAINTENANCE.SS, RECURRING_SS.MAINTENANCE.TASKS, RECURRING_SS.MAINTENANCE.TEMPLATE)
  addCompletionDateToTemplate_(RECURRING_SS.BILING.SS, RECURRING_SS.BILING.TASKS, RECURRING_SS.BILING.TEMPLATE)
  addCompletionDateToTemplate_(RECURRING_SS.APP.SS, RECURRING_SS.APP.TASKS, RECURRING_SS.APP.TEMPLATE)
  addCompletionDateToTemplate_(RECURRING_SS.MOHS.SS, RECURRING_SS.MOHS.TASKS, RECURRING_SS.MOHS.TEMPLATE)
  addCompletionDateToTemplate_(RECURRING_SS.PRIOR_AUTH.SS, RECURRING_SS.PRIOR_AUTH.TASKS, RECURRING_SS.PRIOR_AUTH.TEMPLATE)


  processFD_(RECURRING_SS.FRONT_DESK.SS, RECURRING_SS.FRONT_DESK.TASKS, RECURRING_SS.FRONT_DESK.TEMPLATE)

}


function processFD_(ssID, sheetName, templateSheetName) {
  let ss = SpreadsheetApp.openById(ssID);
  let sheet = ss.getSheetByName(sheetName);
  sheet.getRange("E3:P").clearContent()
}



function addCompletionDateToTemplate_(ssID, sheetName, templateSheetName) {

  try {
    let ss = SpreadsheetApp.openById(ssID);
    let sheet = ss.getSheetByName(sheetName);

    const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 8).getDisplayValues().filter(r => r[2] != "")


    const templateSheet = ss.getSheetByName(templateSheetName);
    const templateData = templateSheet.getRange(3, 2, templateSheet.getLastRow() - 2, templateSheet.getLastColumn() - 1).getValues();

    let templateIds = templateData.map(r => r[0])

    const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "M/d/yyyy")


    for (var i = 0; i < data.length; i++) {
      if (data[i][5] == "Complete" && data[i][6] != "") {
        let indexInTemp = templateIds.indexOf(data[i][1]);
        if (indexInTemp > -1) {
          templateData[indexInTemp][8] = today
          templateData[indexInTemp][9] = data[i][6]
        }
      }
    }

    templateSheet.getRange(3, 2, templateData.length, templateData[0].length).setValues(templateData)

    sheet.getRange(3, 6, sheet.getLastRow() - 2, 3).clearContent()

    SpreadsheetApp.flush()

  } catch (err) { Logger.log(err) }

}








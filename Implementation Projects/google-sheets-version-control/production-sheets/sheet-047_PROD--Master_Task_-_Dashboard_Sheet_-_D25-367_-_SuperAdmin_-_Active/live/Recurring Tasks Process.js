


//DAILY_SUPER
//DAILY_ADMIN
//DAILY_REMOTE



//WEEKLY_SUPER
//WEEKLY_ADMIN
//WEEKLY_REMOTE




//MONTHLY_SUPER
//MONTHLY_ADMIN
//MONTHLY_REMOTE



//QUARTERLY_SUPER
//QUARTERLY_ADMIN
//QUARTERLY_REMOTE



//YEARLY_SUPER
//YEARLY_ADMIN
//YEARLY_REMOTE








const SUPER_ADMIN_SS_ID = "1L2pj3bj4HItDws0sD69C01hy1efGoX00dwDP6pswN2k"
const SUPER_ADMIN_SHEET_NAME = "Today's Tasks"
const SUPER_ADMIN_TEMPLATE_SHEET = "Day Templates"

const REMOTE_TEAM_SS_ID = "1xUzY7FKVqh-m8lcEz7ut1veVa4feBGXxM6lwkF_ACbk"
const REMOTE_TEAM_SHEET_NAME = "Remote Team Tasks"
const REMOTE_TEAM_TEMPLATE_SHEET = "Day Templates"




function createTrigger() {

  let timeZone = Session.getScriptTimeZone();
  //Logger.log(timeZone)

  ScriptApp.newTrigger("allRecurringTasksProcessMain")
    .timeBased()
    .everyDays(1)
    .inTimezone(timeZone)
    .atHour(21)
    .nearMinute(0)
    .create()

  // ScriptApp.newTrigger("addDataToRecurringTasksMetricsLog")
  //   .timeBased()
  //   .everyDays(1)
  //   .inTimezone(timeZone)
  //   .atHour(17)
  //   .nearMinute(0)
  //   .create()

}















function allRecurringTasksProcessMain() {


  return



  try {

    processNewCompletionMain()

    let todayDate = new Date()

    if (todayDate.getDay() != 6 && todayDate.getDay() != 0) {
      processTasksEmailing(DAILY_SHEET_NAME, "DAILY_SUPER", "DAILY_ADMIN", "DAILY_REMOTE", "Daily")
    }

  } catch (err) { }



  //this is the function which stores the data in the Daily Tasks history sheet
  addDailyDataTasksMetricsLog()
  //logDailyCompletion() this one was first attempt


  return

  if (todayDate.getDay() == 5) {
    processTasksEmailing("SSD Weekly Tasks", "WEEKLY_SUPER", "WEEKLY_ADMIN", "WEEKLY_REMOTE", "Weekly")
  }


  if (todayDate.getDate() == 1) {
    processTasksEmailing("SSD Monthly Tasks", "MONTHLY_SUPER", "MONTHLY_ADMIN", "MONTHLY_REMOTE", "Monthly")
  }

  if (todayDate.getDate() == 1 && (todayDate.getMonth() == 0 || todayDate.getMonth() == 3 || todayDate.getMonth() == 6 || todayDate.getMonth() == 9)) {
    processTasksEmailing("SSD Quarterly Tasks", "QUARTERLY_SUPER", "QUARTERLY_ADMIN", "QUARTERLY_REMOTE", "Quarterly")
  }


  if (todayDate.getDate() == 1 && todayDate.getMonth() == 0) {
    processTasksEmailing("SSD Yearly Tasks", "YEARLY_SUPER", "YEARLY_ADMIN", "YEARLY_REMOTE", "Yearly")
  }



}








function processNewCompletionMain() {
  processNewCompletion_(DAILY_SHEET_NAME, "DAILY_SUPER", "DAILY_ADMIN", "DAILY_REMOTE")

  addCompletionToTemplate_(SUPER_ADMIN_SS_ID, SUPER_ADMIN_SHEET_NAME, SUPER_ADMIN_TEMPLATE_SHEET)

  addCompletionToTemplate_(REMOTE_TEAM_SS_ID, REMOTE_TEAM_SHEET_NAME, REMOTE_TEAM_TEMPLATE_SHEET)

  return

  processNewCompletion_("SSD Weekly Tasks", "WEEKLY_SUPER", "WEEKLY_ADMIN", "WEEKLY_REMOTE")
  processNewCompletion_("SSD Monthly Tasks", "MONTHLY_SUPER", "MONTHLY_ADMIN", "MONTHLY_REMOTE")
  processNewCompletion_("SSD Quarterly Tasks", "QUARTERLY_SUPER", "QUARTERLY_ADMIN", "QUARTERLY_REMOTE")
  processNewCompletion_("SSD Yearly Tasks", "YEARLY_SUPER", "YEARLY_ADMIN", "YEARLY_REMOTE")
}





function addCompletionToTemplate_(ssID, sheetName, templateSheetName) {
  let ss = SpreadsheetApp.openById(ssID);
  let sheet = ss.getSheetByName(sheetName);

  const data = sheet.getRange(3, 1, sheet.getLastRow() - 2, 7).getDisplayValues().filter(r => r[2] != "")


  const templateSheet = ss.getSheetByName(templateSheetName);
  const templateData = templateSheet.getRange(1, 1, templateSheet.getLastRow(), templateSheet.getLastColumn()).getValues();

  let templateIds = templateData.map(r => r[2] + r[3] + r[4])

  const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "M/d/yyyy")
  const day = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "EEEE")

  for (var i = 0; i < data.length; i++) {
    if (data[i][5] == true || data[i][5] == "TRUE" || data[i][6] != "") {
      let indexInTemp = templateIds.indexOf(day + data[i][4] + data[i][2]);
      if (indexInTemp > -1) {
        templateData[indexInTemp][5] = today
        templateData[indexInTemp][6] = data[i][6]
      }

    }
  }

  templateSheet.getRange(1, 1, templateData.length, templateData[0].length).setValues(templateData)


}



function processSuperAdminNewCompletion_(ssID, sheetName, superNameRange) {
  let ss = SpreadsheetApp.openById(ssID);
  let sheet = ss.getSheetByName(sheetName);

  let superAdminRange = sheet.getRange(2, 1, sheet.getLastRow() - 1, 10)
  let superStartRow = superAdminRange.getRow();
  let superData = assingCompletedDate_(superAdminRange)
  sheet.getRange(superStartRow + 1, 1, superData.length, superData[0].length).setValues(superData)
}


function processNewCompletion_(sheetName, superNameRange, adminNameRange, remoteNameRange) {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);


  let superAdminRange = sheet.getRange(superNameRange)
  let superStartRow = superAdminRange.getRow();
  let superData = assingCompletedDate_(superAdminRange)
  sheet.getRange(superStartRow + 1, 1, superData.length, superData[0].length).setValues(superData)


  let adminRange = sheet.getRange(adminNameRange)
  let adminStartRow = adminRange.getRow();
  let adminData = assingCompletedDate_(adminRange)
  sheet.getRange(adminStartRow + 1, 1, adminData.length, adminData[0].length).setValues(adminData)




  let remoteRange = sheet.getRange(remoteNameRange)
  let remoteStartRow = remoteRange.getRow();
  let remoteData = assingCompletedDate_(remoteRange)
  sheet.getRange(remoteStartRow + 1, 1, remoteData.length, remoteData[0].length).setValues(remoteData)



}


function assingCompletedDate_(range) {

  let todayDate = Utilities.formatDate(new Date, Session.getScriptTimeZone(), "M/d/yyyy")
  let data = range.getValues()
  data.shift()

  data.forEach(row => {
    if ((row[5] == true || row[5] == "TRUE") && row[6] != "" && row[6] != null) {
      row[7] = todayDate
      row[8] = row[6]
      row[5] = ""
      row[6] = ""
    }

    row.pop()
  })

  return data
}

























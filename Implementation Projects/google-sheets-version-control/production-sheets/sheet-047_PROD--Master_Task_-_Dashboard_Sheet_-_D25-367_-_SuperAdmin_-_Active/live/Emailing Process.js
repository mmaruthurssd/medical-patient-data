

const DAILY_SHEET_NAME = "Daily"



const EMAIL_RECIPIENTS_SHEET = "Email Recipients"


const UTILITIES_SHEET = "Utilities_"






function processTasksEmailing(sheetName, superNameRange, adminNameRange, remoteNameRange, flag) {

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const Sheet = ss.getSheetByName(sheetName);

  let superAdminSS = SpreadsheetApp.openById(SUPER_ADMIN_SS_ID);
  let SuperSheet = superAdminSS.getSheetByName(SUPER_ADMIN_SHEET_NAME);
  let superTasks = SuperSheet.getRange(2, 1, sheet.getLastRow() - 1, 10).getValues().filter(row => row[2] != "" && row[2] != null);


  let adminTasks = Sheet.getRange(adminNameRange).getValues().filter(row => row[2] != "" && row[2] != null);


  let remoteSS = SpreadsheetApp.openById(REMOTE_TEAM_SS_ID);
  let RemoteSheet = remoteSS.getSheetByName(REMOTE_TEAM_SHEET_NAME);
  let remoteTasks = RemoteSheet.getRange(2, 1, sheet.getLastRow() - 1, 10).getValues().filter(row => row[2] != "" && row[2] != null);


  const emailRespSheet = ss.getSheetByName(EMAIL_RECIPIENTS_SHEET);
  let emailsRecp = emailRespSheet.getRange(2, 2, emailRespSheet.getLastRow() - 1, 1).getValues().filter(row => row[0] != "" && row[0] != null).map(r => r[0].toString().trim())



  let Obj = {
    superT: { incomplete: [], completed: [] },
    adminT: { incomplete: [], completed: [] },
    remoteT: { incomplete: [], completed: [] },
  }

  if (flag == "Daily") {
    Obj = processDailyData_(superTasks, adminTasks, remoteTasks)

    sendEmailNow_(emailsRecp, "Daily Completed and Incomplete Tasks Overview", "Daily Recurring Task Overview", Obj)



  } else if (flag == "Weekly") {
    Obj = processWeeklyData_(superTasks, adminTasks, remoteTasks)

    sendEmailNow_(emailsRecp, "Weekly Completed and Incomplete Tasks Overview", "Weekly Recurring Task Overview", Obj)


  } else if (flag == "Monthly") {
    Obj = processMonthlyData_(superTasks, adminTasks, remoteTasks)

    sendEmailNow_(emailsRecp, "Monthly Completed and Incomplete Tasks Overview", "Monthly Recurring Task Overview", Obj)


  } else if (flag == "Quarterly") {
    Obj = processQuartelyData_(superTasks, adminTasks, remoteTasks)

    sendEmailNow_(emailsRecp, "Quarterly Completed and Incomplete Tasks Overview", "Quarterly Recurring Task Overview", Obj)


  } else if (flag == "Yearly") {
    Obj = processYearlyData_(superTasks, adminTasks, remoteTasks)

    sendEmailNow_(emailsRecp, "Yearly Completed and Incomplete Tasks Overview", "Yearly Recurring Task Overview", Obj)


  }


}





function sendEmailNow_(allRecipients, heading, subject, Obj) {

  return

  const htmlTemplate = HtmlService.createTemplateFromFile('Tasks Email Template');
  htmlTemplate.heading = heading;

  // htmlTemplate.superCompletedHeadings = ["Task #", "Task", "Frequency", "Assigned to", "Last Completed Date", "Last Completed By", "Notes"];
  // htmlTemplate.superCompletedData = Obj.superT.completed;

  htmlTemplate.superIncompletedHeadings = ["Task #", "Task", "Frequency", "Assigned to", "Uncompleted Date", "Last Completed Date", "Last Completed By", "Notes"];
  htmlTemplate.superIncompletedData = Obj.superT.incomplete;


  htmlTemplate.adminIncompletedHeadings = ["Task #", "Task", "Frequency", "Assigned to", "Uncompleted Date", "Last Completed Date", "Last Completed By", "Notes"];
  htmlTemplate.adminIncompletedData = Obj.adminT.incomplete;


  htmlTemplate.remoteIncompletedHeadings = ["Task #", "Task", "Frequency", "Assigned to", "Uncompleted Date", "Last Completed Date", "Last Completed By", "Notes"];
  htmlTemplate.remoteIncompletedData = Obj.remoteT.incomplete;

  const htmlBody = htmlTemplate.evaluate().getContent();

  try {
    GmailApp.sendEmail(allRecipients, subject, "", {
      htmlBody: htmlBody
    })

    appendInEmailLog_([new Date(), new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds(), subject, allRecipients.length, allRecipients.join(",")])



  } catch (emailError) {
    appendInEmailLog_([new Date(), new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds(), subject, allRecipients.length, allRecipients.join(","), emailError])
  }


  let utilitiesSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(UTILITIES_SHEET)
  let employee = utilitiesSheet.getRange(2, 1, utilitiesSheet.getLastRow() - 1, 2).getValues().filter(row => row[0] != "" && row[0] != null && row[1] != "" && row[1] != null)

  //Logger.log(employee)

  employee.forEach(row => {

    let allIncompleteTasks = []
    for (let task in Obj) {

      Obj[task]["incomplete"].forEach(t => {
        if (t[3] == row[0]) {
          allIncompleteTasks.push(t)
        }
      })
    }

    //Logger.log(allIncompleteTasks)

    if (allIncompleteTasks.length > 0) {
      const htmlReminderTemplate = HtmlService.createTemplateFromFile('Reminder Email Template');
      htmlReminderTemplate.heading = heading.toString().replace("Completed and ", "");

      htmlReminderTemplate.incompletedHeadings = ["Task #", "Task", "Frequency", "Assigned to", "Uncompleted Date", "Last Completed Date", "Last Completed By", "Notes"];
      htmlReminderTemplate.incompletedData = allIncompleteTasks;

      const htmlReminderBody = htmlReminderTemplate.evaluate().getContent();

      try {
        GmailApp.sendEmail(row[1].toString().trim(), subject.toString().replace("Overview", "Reminder"), "", {
          htmlBody: htmlReminderBody
        })

        appendInEmailLog_([new Date(), new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds(), subject.toString().replace("Overview", "Reminder"), 1, row[1].toString().trim()])



      } catch (emailError) {
        appendInEmailLog_([new Date(), new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds(), subject.toString().replace("Overview", "Reminder"), 1, row[1].toString().trim(), emailError])
      }


    }
  })




}








function appendInEmailLog_(row) {

  let ELSS = SpreadsheetApp.openById("1ERfXs1YB-huftv_rIQJfy2OhaziiQU3rEtM5vmHr0nE");
  let ELSheet = ELSS.getSheetByName("Sent Email Log");
  ELSheet.appendRow(row)

}



//below function will return true if the arg is valid date and false if not.
function isValidDate_(d) {
  if (Object.prototype.toString.call(d) !== "[object Date]")
    return false;
  return !isNaN(d.getTime());
}





function processYearlyData_(superTasks, adminTasks, remoteTasks) {

  let Obj = {
    superT: { incomplete: [], completed: [] },
    adminT: { incomplete: [], completed: [] },
    remoteT: { incomplete: [], completed: [] },
  }


  let year = new Date(new Date().setDate(new Date().getDate() - 65)).getFullYear()




  superTasks.forEach(row => {
    if (isValidDate_(row[7])) {

      let yearStr = row[7].getFullYear()

      if (yearStr == year) {
        Obj.superT.completed.push([row[1], row[2], row[3], row[4], Utilities.formatDate(row[7], 'GMT-6', 'yyyy/M/d'), row[8], row[10]])
      } else {
        Obj.superT.incomplete.push([row[1], row[2], row[3], row[4], year, Utilities.formatDate(row[7], 'GMT-6', 'yyyy/M/d'), row[8], row[10]])
      }

    } else {
      Obj.superT.incomplete.push([row[1], row[2], row[3], row[4], year, row[7], row[8], row[10]])
    }
  })


  adminTasks.forEach(row => {
    if (isValidDate_(row[7])) {

      let yearStr = row[7].getFullYear()

      if (yearStr == year) {
        Obj.adminT.completed.push([row[1], row[2], row[3], row[4], Utilities.formatDate(row[7], 'GMT-6', 'yyyy/M/d'), row[8], row[10]])
      } else {
        Obj.adminT.incomplete.push([row[1], row[2], row[3], row[4], year, Utilities.formatDate(row[7], 'GMT-6', 'yyyy/M/d'), row[8], row[10]])
      }

    } else {
      Obj.adminT.incomplete.push([row[1], row[2], row[3], row[4], year, row[7], row[8], row[10]])
    }
  })



  remoteTasks.forEach(row => {
    if (isValidDate_(row[7])) {

      let yearStr = row[7].getFullYear()

      if (yearStr == year) {
        Obj.remoteT.completed.push([row[1], row[2], row[3], row[4], Utilities.formatDate(row[7], 'GMT-6', 'yyyy/M/d'), row[8], row[10]])
      } else {
        Obj.remoteT.incomplete.push([row[1], row[2], row[3], row[4], year, Utilities.formatDate(row[7], 'GMT-6', 'yyyy/M/d'), row[8], row[10]])
      }

    } else {
      Obj.remoteT.incomplete.push([row[1], row[2], row[3], row[4], year, row[7], row[8], row[10]])
    }
  })



  return Obj

}









function processQuartelyData_(superTasks, adminTasks, remoteTasks) {

  let Obj = {
    superT: { incomplete: [], completed: [] },
    adminT: { incomplete: [], completed: [] },
    remoteT: { incomplete: [], completed: [] },
  }


  let month1Year = Utilities.formatDate(new Date(new Date().setDate(new Date().getDate() - 65)), 'GMT-6', 'yyyy/M')
  let month2Year = Utilities.formatDate(new Date(new Date().setDate(new Date().getDate() - 35)), 'GMT-6', 'yyyy/M')
  let month3Year = Utilities.formatDate(new Date(new Date().setDate(new Date().getDate() - 5)), 'GMT-6', 'yyyy/M')

  // let weekStartDate = new Date(new Date().setDate(new Date().getDate() - 5))
  // let weekEndDate = new Date(new Date().setDate(new Date().getDate() + 1))

  // let weekRange = Utilities.formatDate(weekStartDate, 'GMT-6', 'yyyy/M/d') + " - " + Utilities.formatDate(weekEndDate, 'GMT-6', 'yyyy/M/d');


  superTasks.forEach(row => {
    if (isValidDate_(row[7])) {

      let monthYearStr = Utilities.formatDate(row[7], 'GMT-6', 'yyyy/M')

      if (monthYearStr == month1Year || monthYearStr == month2Year || monthYearStr == month3Year) {
        Obj.superT.completed.push([row[1], row[2], row[3], row[4], Utilities.formatDate(row[7], 'GMT-6', 'yyyy/M/d'), row[8], row[10]])
      } else {
        Obj.superT.incomplete.push([row[1], row[2], row[3], row[4], month1Year + " - " + month3Year, Utilities.formatDate(row[7], 'GMT-6', 'yyyy/M/d'), row[8], row[10]])
      }

    } else {
      Obj.superT.incomplete.push([row[1], row[2], row[3], row[4], month1Year + " - " + month3Year, row[7], row[8], row[10]])
    }
  })


  adminTasks.forEach(row => {
    if (isValidDate_(row[7])) {

      let monthYearStr = Utilities.formatDate(row[7], 'GMT-6', 'yyyy/M')

      if (monthYearStr == month1Year || monthYearStr == month2Year || monthYearStr == month3Year) {
        Obj.adminT.completed.push([row[1], row[2], row[3], row[4], Utilities.formatDate(row[7], 'GMT-6', 'yyyy/M/d'), row[8], row[10]])
      } else {
        Obj.adminT.incomplete.push([row[1], row[2], row[3], row[4], month1Year + " - " + month3Year, Utilities.formatDate(row[7], 'GMT-6', 'yyyy/M/d'), row[8], row[10]])
      }

    } else {
      Obj.adminT.incomplete.push([row[1], row[2], row[3], row[4], month1Year + " - " + month3Year, row[7], row[8], row[10]])
    }
  })



  remoteTasks.forEach(row => {
    if (isValidDate_(row[7])) {

      let monthYearStr = Utilities.formatDate(row[7], 'GMT-6', 'yyyy/M')

      if (monthYearStr == month1Year || monthYearStr == month2Year || monthYearStr == month3Year) {
        Obj.remoteT.completed.push([row[1], row[2], row[3], row[4], Utilities.formatDate(row[7], 'GMT-6', 'yyyy/M/d'), row[8], row[10]])
      } else {
        Obj.remoteT.incomplete.push([row[1], row[2], row[3], row[4], month1Year + " - " + month3Year, Utilities.formatDate(row[7], 'GMT-6', 'yyyy/M/d'), row[8], row[10]])
      }

    } else {
      Obj.remoteT.incomplete.push([row[1], row[2], row[3], row[4], month1Year + " - " + month3Year, row[7], row[8], row[10]])
    }
  })



  return Obj

}







function processMonthlyData_(superTasks, adminTasks, remoteTasks) {

  let Obj = {
    superT: { incomplete: [], completed: [] },
    adminT: { incomplete: [], completed: [] },
    remoteT: { incomplete: [], completed: [] },
  }


  let monthYear = Utilities.formatDate(new Date(new Date().setDate(new Date().getDate() - 5)), 'GMT-6', 'yyyy/M')

  // let weekStartDate = new Date(new Date().setDate(new Date().getDate() - 5))
  // let weekEndDate = new Date(new Date().setDate(new Date().getDate() + 1))

  // let weekRange = Utilities.formatDate(weekStartDate, 'GMT-6', 'yyyy/M/d') + " - " + Utilities.formatDate(weekEndDate, 'GMT-6', 'yyyy/M/d');


  superTasks.forEach(row => {
    if (isValidDate_(row[7])) {

      let monthYearStr = Utilities.formatDate(row[7], 'GMT-6', 'yyyy/M')

      if (monthYearStr == monthYear) {
        Obj.superT.completed.push([row[1], row[2], row[3], row[4], Utilities.formatDate(row[7], 'GMT-6', 'yyyy/M/d'), row[8], row[10]])
      } else {
        Obj.superT.incomplete.push([row[1], row[2], row[3], row[4], monthYear, Utilities.formatDate(row[7], 'GMT-6', 'yyyy/M/d'), row[8], row[10]])
      }

    } else {
      Obj.superT.incomplete.push([row[1], row[2], row[3], row[4], monthYear, row[7], row[8], row[10]])
    }
  })


  adminTasks.forEach(row => {
    if (isValidDate_(row[7])) {

      let monthYearStr = Utilities.formatDate(row[7], 'GMT-6', 'yyyy/M')

      if (monthYearStr == monthYear) {
        Obj.adminT.completed.push([row[1], row[2], row[3], row[4], Utilities.formatDate(row[7], 'GMT-6', 'yyyy/M/d'), row[8], row[10]])
      } else {
        Obj.adminT.incomplete.push([row[1], row[2], row[3], row[4], monthYear, Utilities.formatDate(row[7], 'GMT-6', 'yyyy/M/d'), row[8], row[10]])
      }

    } else {
      Obj.adminT.incomplete.push([row[1], row[2], row[3], row[4], monthYear, row[7], row[8], row[10]])
    }
  })



  remoteTasks.forEach(row => {
    if (isValidDate_(row[7])) {

      let monthYearStr = Utilities.formatDate(row[7], 'GMT-6', 'yyyy/M')

      if (monthYearStr == monthYear) {
        Obj.remoteT.completed.push([row[1], row[2], row[3], row[4], Utilities.formatDate(row[7], 'GMT-6', 'yyyy/M/d'), row[8], row[10]])
      } else {
        Obj.remoteT.incomplete.push([row[1], row[2], row[3], row[4], monthYear, Utilities.formatDate(row[7], 'GMT-6', 'yyyy/M/d'), row[8], row[10]])
      }

    } else {
      Obj.remoteT.incomplete.push([row[1], row[2], row[3], row[4], monthYear, row[7], row[8], row[10]])
    }
  })



  return Obj

}








function processWeeklyData_(superTasks, adminTasks, remoteTasks) {

  let Obj = {
    superT: { incomplete: [], completed: [] },
    adminT: { incomplete: [], completed: [] },
    remoteT: { incomplete: [], completed: [] },
  }


  let weekStartDate = new Date(new Date().setDate(new Date().getDate() - 5))
  let weekEndDate = new Date(new Date().setDate(new Date().getDate() + 1))

  let weekRange = Utilities.formatDate(weekStartDate, 'GMT-6', 'yyyy/M/d') + " - " + Utilities.formatDate(weekEndDate, 'GMT-6', 'yyyy/M/d');


  superTasks.forEach(row => {
    if (isValidDate_(row[7])) {

      if (row[7].getTime() >= weekStartDate.getTime() && row[7].getTime() <= weekEndDate.getTime()) {
        Obj.superT.completed.push([row[1], row[2], row[3], row[4], Utilities.formatDate(row[7], 'GMT-6', 'yyyy/M/d'), row[8], row[10]])
      } else {
        Obj.superT.incomplete.push([row[1], row[2], row[3], row[4], weekRange, Utilities.formatDate(row[7], 'GMT-6', 'yyyy/M/d'), row[8], row[10]])
      }

    } else {
      Obj.superT.incomplete.push([row[1], row[2], row[3], row[4], weekRange, row[7], row[8], row[10]])
    }
  })


  adminTasks.forEach(row => {
    if (isValidDate_(row[7])) {

      if (row[7].getTime() < weekStartDate.getTime()) {
        Obj.adminT.completed.push([row[1], row[2], row[3], row[4], Utilities.formatDate(row[7], 'GMT-6', 'yyyy/M/d'), row[8], row[10]])
      } else {
        Obj.adminT.incomplete.push([row[1], row[2], row[3], row[4], weekRange, Utilities.formatDate(row[7], 'GMT-6', 'yyyy/M/d'), row[8], row[10]])
      }

    } else {
      Obj.adminT.incomplete.push([row[1], row[2], row[3], row[4], weekRange, row[7], row[8], row[10]])
    }
  })



  remoteTasks.forEach(row => {
    if (isValidDate_(row[7])) {

      if (row[7].getTime() < weekStartDate.getTime()) {
        Obj.remoteT.completed.push([row[1], row[2], row[3], row[4], Utilities.formatDate(row[7], 'GMT-6', 'yyyy/M/d'), row[8], row[10]])
      } else {
        Obj.remoteT.incomplete.push([row[1], row[2], row[3], row[4], weekRange, Utilities.formatDate(row[7], 'GMT-6', 'yyyy/M/d'), row[8], row[10]])
      }

    } else {
      Obj.remoteT.incomplete.push([row[1], row[2], row[3], row[4], weekRange, row[7], row[8], row[10]])
    }
  })



  return Obj

}






function processDailyData_(superTasks, adminTasks, remoteTasks) {

  let Obj = {
    superT: { incomplete: [], completed: [] },
    adminT: { incomplete: [], completed: [] },
    remoteT: { incomplete: [], completed: [] },
  }


  const todayDateStr = Utilities.formatDate(new Date(), 'GMT-6', 'yyyy/M/d');

  superTasks.forEach(row => {
    if (isValidDate_(row[7])) {
      let dateStr = Utilities.formatDate(row[7], 'GMT-6', 'yyyy/M/d');
      if (dateStr == todayDateStr) {
        Obj.superT.completed.push([row[1], row[2], row[3], row[4], Utilities.formatDate(row[7], 'GMT-6', 'yyyy/M/d'), row[8], row[10]])
      } else {
        Obj.superT.incomplete.push([row[1], row[2], row[3], row[4], todayDateStr, Utilities.formatDate(row[7], 'GMT-6', 'yyyy/M/d'), row[8], row[10]])
      }

    } else {
      Obj.superT.incomplete.push([row[1], row[2], row[3], row[4], todayDateStr, row[7], row[8], row[10]])
    }
  })


  adminTasks.forEach(row => {
    if (isValidDate_(row[7])) {
      let dateStr = Utilities.formatDate(row[7], 'GMT-6', 'yyyy/M/d');
      if (dateStr == todayDateStr) {
        Obj.adminT.completed.push([row[1], row[2], row[3], row[4], Utilities.formatDate(row[7], 'GMT-6', 'yyyy/M/d'), row[8], row[10]])
      } else {
        Obj.adminT.incomplete.push([row[1], row[2], row[3], row[4], todayDateStr, Utilities.formatDate(row[7], 'GMT-6', 'yyyy/M/d'), row[8], row[10]])
      }

    } else {
      Obj.adminT.incomplete.push([row[1], row[2], row[3], row[4], todayDateStr, row[7], row[8], row[10]])
    }
  })



  remoteTasks.forEach(row => {
    if (isValidDate_(row[7])) {
      let dateStr = Utilities.formatDate(row[7], 'GMT-6', 'yyyy/M/d');
      if (dateStr == todayDateStr) {
        Obj.remoteT.completed.push([row[1], row[2], row[3], row[4], Utilities.formatDate(row[7], 'GMT-6', 'yyyy/M/d'), row[8], row[10]])
      } else {
        Obj.remoteT.incomplete.push([row[1], row[2], row[3], row[4], todayDateStr, Utilities.formatDate(row[7], 'GMT-6', 'yyyy/M/d'), row[8], row[10]])
      }

    } else {
      Obj.remoteT.incomplete.push([row[1], row[2], row[3], row[4], todayDateStr, row[7], row[8], row[10]])
    }
  })



  return Obj
}









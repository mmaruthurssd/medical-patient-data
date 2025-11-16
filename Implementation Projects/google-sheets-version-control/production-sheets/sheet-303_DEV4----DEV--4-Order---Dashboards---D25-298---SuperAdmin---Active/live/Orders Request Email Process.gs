

const EMAIL_CONFIG_SHEET_NAME = "Config Email"


function createDailyTrigger() {

  deleteDailyTrigger()

  ScriptApp.newTrigger("ordersReqEmailProcess")
    .timeBased()
    .everyDays(1)
    .atHour(17)
    .nearMinute(0)
    .inTimezone(Session.getScriptTimeZone())
    .create();
}




function deleteDailyTrigger() {
  // Loop over all triggers.
  const allTriggers = ScriptApp.getProjectTriggers();
  for (let index = 0; index < allTriggers.length; index++) {
    // If the current trigger is the correct one, delete it.
    if (allTriggers[index].getHandlerFunction() === "ordersReqEmailProcess") {
      ScriptApp.deleteTrigger(allTriggers[index]);
    }
  }
}





function processDynamicEmployeeTrigger() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let configSheet = ss.getSheetByName(EMAIL_CONFIG_SHEET_NAME)
  let allConfigData = configSheet.getRange(1, 1, configSheet.getLastRow(), configSheet.getLastColumn()).getValues()

  let configHeaders = allConfigData.splice(0, 1)[0]

  let COL = {
    emailFreq: configHeaders.indexOf('Automatic Email Frequency'),
    dayOfWeek: configHeaders.indexOf('Day of Week (for Weekly emails)'),
    specificMonthDate: configHeaders.indexOf('Specific Monthly Dates'),
    scheduledTime: configHeaders.indexOf('Automatic Email Schedule Time of Day (Default = 6pm CST)'),

    employee: configHeaders.indexOf('Employee'),
    emailAddress: configHeaders.indexOf('Email Address'),
    sendEmail: configHeaders.indexOf('Email Status'),
  }


  const todayDetails = getTodayDetails_()


  for (var i = 0; i < allConfigData.length; i++) {
    if (allConfigData[i][COL.sendEmail] != "Yes") continue

    allConfigData[i][COL.sendEmail] = ""

    if (allConfigData[i][COL.emailFreq] == "Daily") {
      if (allConfigData[i][COL.scheduledTime] > 0) {
        if (allConfigData[i][COL.scheduledTime] == todayDetails.hour) {
          allConfigData[i][COL.sendEmail] = "Active"
        }
      } else if (allConfigData[i][COL.scheduledTime] == 18) {
        allConfigData[i][COL.sendEmail] = "Active"
      }

    } else if (allConfigData[i][COL.emailFreq] == "Weekly") {
      if (allConfigData[i][COL.dayOfWeek] == todayDetails.day) {
        if (allConfigData[i][COL.scheduledTime] > 0) {
          if (allConfigData[i][COL.scheduledTime] == todayDetails.hour) {
            allConfigData[i][COL.sendEmail] = "Active"
          }
        } else if (allConfigData[i][COL.scheduledTime] == 18) {
          allConfigData[i][COL.sendEmail] = "Active"
        }
      }

    } else if (allConfigData[i][COL.emailFreq] == "Specific Monthly Dates") {
      if (allConfigData[i][COL.specificMonthDate] == todayDetails.date) {
        if (allConfigData[i][COL.scheduledTime] > 0) {
          if (allConfigData[i][COL.scheduledTime] == todayDetails.hour) {
            allConfigData[i][COL.sendEmail] = "Active"
          }
        } else if (allConfigData[i][COL.scheduledTime] == 18) {
          allConfigData[i][COL.sendEmail] = "Active"
        }
      }
    }
  }

  sendEmailToStaff(false, allConfigData)

}





function manualTestOderUpdateEmails() {
  sendEmailToStaff(true)
}




function sendEmailToStaff(test, allConfigData) {




  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const configSheet = ss.getSheetByName(EMAIL_CONFIG_SHEET_NAME)



  let configHeaders = configSheet.getRange(1, 1, 1, configSheet.getLastColumn()).getDisplayValues()[0]

  let COL = {
    emailFreq: configHeaders.indexOf('Automatic Email Frequency'),
    dayOfWeek: configHeaders.indexOf('Day of Week (for Weekly emails)'),
    specificMonthDate: configHeaders.indexOf('Specific Monthly Dates'),
    scheduledTime: configHeaders.indexOf('Automatic Email Schedule Time of Day (Default = 6pm CST)'),

    employee: configHeaders.indexOf('Employee'),
    emailAddress: configHeaders.indexOf('Email Address'),
    sendEmail: configHeaders.indexOf('Email Status'),
    lastSent: configHeaders.indexOf('Last Sent'),

    sendTestEmail: configHeaders.indexOf('Send Test Email (to admin)'),

    message: configHeaders.indexOf('Message'),
    requestBy: configHeaders.indexOf('Request By'),
    orderStatus: configHeaders.indexOf('Order Status')
  }

  if (!allConfigData) {
    allConfigData = configSheet.getRange(1, 1, configSheet.getLastRow(), configSheet.getLastColumn()).getValues()
    allConfigData.splice(0, 1)
  }

  const sheet = ss.getSheetByName("Order Email Data")

  const allData = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getDisplayValues()

  const headers = allData.splice(0, 1).map(r => [r[0], r[1], r[3], r[4], r[5], r[7], r[9], r[11]])[0];

  if (allData.length == 0) return


  // const recipentSheet = ss.getSheetByName("Employee");
  // const allRecipent = recipentSheet.getRange(2, 2, recipentSheet.getLastRow() - 1, 1).getDisplayValues().filter(r => r[0] != "")
  // const employeeNames = allRecipent.map(r => r[0]);

  allConfigData.forEach((rowData, i) => {

    if ((!test && rowData[COL.sendEmail] == "Active") || (test && rowData[COL.sendTestEmail] == "Yes")) {

      let dataForEmail = allData.filter(r => r[0] != "" && r[9] != "" && rowData[COL.requestBy].includes(r[1]) && rowData[COL.orderStatus].includes(r[9])).map(r => [r[0], r[1], r[3], r[4], r[5], r[7], r[9], r[11]]);


      if (dataForEmail.length > 0) {
        try {
          const htmlTemplate = HtmlService.createTemplateFromFile('orders');
          htmlTemplate.ordersData = dataForEmail
          htmlTemplate.ordersHeaders = headers
          const htmlBody = htmlTemplate.evaluate().getContent();

          if (test) {
            GmailApp.sendEmail("adminhelp@ssdspc.com", "Test Orders Requests Update", "", {
              bcc: "admin@ssdspc.com",
              htmlBody: htmlBody + (rowData[COL.message] ? ("<p>" + rowData[COL.message] + "</p>") : "") + "<p>This email is autogenerated.</p>"
            })
            configSheet.getRange(i + 2, COL.sendTestEmail + 1).clearContent();
          } else {

            GmailApp.sendEmail(key, "Orders Requests Update", "", {
              bcc: "admin@ssdspc.com",
              htmlBody: htmlBody + (rowData[COL.message] ? ("<p>" + rowData[COL.message] + "</p>") : "") + "<p>This email is autogenerated.</p>"
            })

            configSheet.getRange(i + 2, COL.lastSent + 1).setValue(new Date());

            appendInEmailLog_([new Date(), new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds(), "Orders Requests Update", 1, key])
          }

        } catch (emailError) {
          appendInEmailLog_([new Date(), new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds(), "Orders Requests Update", 1, key, emailError])
        }
      }

    }

  })



}







function ordersReqEmailProcess() {

  return

  try {
    sendEmailToStaff(false)
  } catch (err) { }


  try {
    sendEmailToAdmin(false)
  } catch (err) { }


}


function manualTestEmailToAdmin() {
  sendEmailToAdmin(true)
}


function sendEmailToAdmin(test) {

  return

  try {


    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("Order Request")

    const allData = sheet.getRange(1, 3, sheet.getLastRow(), sheet.getLastColumn() - 2).getDisplayValues().filter(r => r[0] != "" && r[9] != "" && r[9] != "Pause" && r[9] != "Cancelled" && r[9] != "Complete - Delivered to Final Clinic").map(r => [r[0], r[1], r[3], r[4], r[5], r[7], r[9], r[11]]);

    const headers = allData.splice(0, 1)[0];

    if (allData.length == 0) return


    const recipentSheet = ss.getSheetByName("Orders Request Recipents");
    const allRecipent = recipentSheet.getRange(2, 2, recipentSheet.getLastRow() - 1, 1).getDisplayValues().filter(r => r[0] != "")
    //const employeeNames = allEmployee.map(r => r[0]);



    const htmlTemplate = HtmlService.createTemplateFromFile('orders');
    htmlTemplate.ordersData = allData;
    htmlTemplate.ordersHeaders = headers
    const htmlBody = htmlTemplate.evaluate().getContent();



    // Logger.log("Sending Email to: " + allRecipent)
    // return

    if (test) {
      GmailApp.sendEmail("adminhelp@ssdspc.com", "Test Orders Request", "", {
        bcc: "admin@ssdspc.com",
        htmlBody: htmlBody + "<p>This email is autogenerated.</p>"
      })
    } else {
      GmailApp.sendEmail(allRecipent.join(","), "Orders Request", "", {
        bcc: "admin@ssdspc.com",
        htmlBody: htmlBody + "<p>This email is autogenerated.</p>"
      })

      appendInEmailLog_([new Date(), new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds(), "Orders Request", allRecipent.length, allRecipent.join(",")])

    }

  } catch (emailError) {

    appendInEmailLog_([new Date(), new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds(), "Orders Request", allRecipent.length, allRecipent.join(","), emailError])
  }

}





function appendInEmailLog_(row) {

  let ELSS = SpreadsheetApp.openById("1ERfXs1YB-huftv_rIQJfy2OhaziiQU3rEtM5vmHr0nE");
  let ELSheet = ELSS.getSheetByName("Sent Email Log");
  ELSheet.appendRow(row)

}






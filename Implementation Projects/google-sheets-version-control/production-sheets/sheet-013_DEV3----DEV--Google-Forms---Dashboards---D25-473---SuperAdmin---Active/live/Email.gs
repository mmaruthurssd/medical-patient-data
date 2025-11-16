
//email should send from admin help

const VIEW_RESPONSES_SHEET = "View Form Responses"

const EMAIL_TEXT_SHEET = "Email Text"



function sendInitialEmailsAll() {

  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(VIEW_RESPONSES_SHEET)

  let formName = sheet.getRange("B3").getValue()
  let formURL = sheet.getRange("B4").getValue()


  let allData = sheet.getRange(10, 1, sheet.getLastRow() - 9, sheet.getLastColumn()).getValues();

  sendInitialEmail(ss, allData, formName, formURL)

}



function sendInitialEmailsSelected() {

  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(VIEW_RESPONSES_SHEET)

  let formName = sheet.getRange("B3").getValue()
  let formURL = sheet.getRange("B4").getValue()


  let allData = sheet.getRange(10, 1, sheet.getLastRow() - 9, sheet.getLastColumn()).getValues().filter(row => row[3] == true || row[3] == "TRUE");

  sendInitialEmail(ss, allData, formName, formURL)


  let newFalseArray = new Array(sheet.getLastRow() - 9).fill([false]);
  sheet.getRange(10, 4, newFalseArray.length, 1).setValues(newFalseArray)

}



function sendInitialEmail(ss, allData, formName, formURL) {
  //Named Ranges
  //INITIAL_EMAIL_SUBJECT
  //INITIAL_EMAIL_BODY

  let emailTextSheet = ss.getSheetByName(EMAIL_TEXT_SHEET)
  let subject = emailTextSheet.getRange("INITIAL_EMAIL_SUBJECT").getValue()

  allData.forEach(row => {

    if (row[1] != "" && row[1] != null) {
      let body = emailTextSheet.getRange("INITIAL_EMAIL_BODY").getDisplayValue().replace("{{Name}}", row[0]).replace("{{Form Name}}", formName).replace("{{Form Link}}", formURL)
      GmailApp.sendEmail(row[1], subject, body)
      //GmailApp.sendEmail("rashid_khan143@yahoo.com", "Form Submission Request", body)
    }
  })

}




function sendReminderEmailAll() {


  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(VIEW_RESPONSES_SHEET);

  let formName = sheet.getRange("B3").getValue()
  let formURL = sheet.getRange("B4").getValue()


  let allData = sheet.getRange(10, 1, sheet.getLastRow() - 9, sheet.getLastColumn()).getValues().filter(row => row[2] == "Not Responded");

  //Logger.log(allData)

  sendReminderEmail(ss, allData, formName, formURL)

}



function sendReminderEmailSelected() {


  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(VIEW_RESPONSES_SHEET);

  let formName = sheet.getRange("B3").getValue()
  let formURL = sheet.getRange("B4").getValue()


  let allData = sheet.getRange(10, 1, sheet.getLastRow() - 9, sheet.getLastColumn()).getValues().filter(row => row[3] == true || row[3] == "TRUE");

  //Logger.log(allData)

  sendReminderEmail(ss, allData, formName, formURL)

  let newFalseArray = new Array(sheet.getLastRow() - 9).fill([false]);
  sheet.getRange(10, 4, newFalseArray.length, 1).setValues(newFalseArray)

}




function sendReminderEmail(ss, allData, formName, formURL) {


  let emailTextSheet = ss.getSheetByName(EMAIL_TEXT_SHEET)
  let subject = emailTextSheet.getRange("REMINDER_EMAIL_SUBJECT").getValue()


  allData.forEach(row => {

    if (row[1] != "" && row[1] != null) {
      let body = emailTextSheet.getRange("REMINDER_EMAIL_BODY").getDisplayValue().replace("{{Name}}", row[0]).replace("{{Form Name}}", formName).replace("{{Form Link}}", formURL)
      GmailApp.sendEmail(row[1], subject, body)
      //GmailApp.sendEmail("rashid_khan143@yahoo.com", "Form Submission Reminder", body)

      //sheet.getRange(10 + index, 4).setValue(false)
    }
  })


}






















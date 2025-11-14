






/**
 * Web App to send paychecks email
 */
function doPost(e) {
  var result = "Success";
  try {
    let parameters = e.parameter

    let subject = parameters.subject;
    let body = parameters.body;
    let emails = parameters.emails;

    GmailApp.sendEmail(emails, subject, body)


  }
  catch (err) {
    result = err.message;
    //Logger.log("FAILED: " + result);
  }
  return ContentService.createTextOutput(result);
}












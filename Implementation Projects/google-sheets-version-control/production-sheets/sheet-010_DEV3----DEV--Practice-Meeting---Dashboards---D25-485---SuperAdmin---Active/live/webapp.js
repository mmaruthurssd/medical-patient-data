




/**
 * Web App to send Google Form email
 */
function doPost(e) {
  var result = "Success";
  try {
    let parameters = e.parameter
    if (parameters.process == "sendEmailToSelected") {
      sendEmailToSelected();

    } else if (parameters.process == "sendEmailToAll") {
      sendEmailToAll();

    }
  }
  catch (err) {
    result = "Error";
    //Logger.log("FAILED: " + result);
  }
  return ContentService.createTextOutput(result);
}

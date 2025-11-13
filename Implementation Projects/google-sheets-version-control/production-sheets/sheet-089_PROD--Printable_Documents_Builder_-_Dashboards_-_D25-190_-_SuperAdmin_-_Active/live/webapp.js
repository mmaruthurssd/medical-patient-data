

const WEBAPP_URL = "https://script.google.com/a/macros/ssdspc.com/s/AKfycbzlipMUv8aVnqvrD-wlpX3K2seb3tvqJMb_vO_nJYDWS7Yc-JT-MBMd0qLm0-Q8UT8D4A/exec"



//this is deployed from admin help

/**
 * Web App to send paychecks email
 */
function doPost(e) {
  var result = "Success";
  try {
    let parameters = e.parameter

    sendEmailProcess(parameters.user)
  }
  catch (err) {
    result = err.message;
    Logger.log("FAILED: " + result);
  }
  return ContentService.createTextOutput(result);
}

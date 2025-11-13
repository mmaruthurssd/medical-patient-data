
//https://script.google.com/a/macros/ssdspc.com/s/AKfycbxPp2QY-J-lYetMm4ZmR9ryw6b4pDcI71-FCzoud5syXtGocIyDzO-2lNl_SAO_RJsh8w/exec



/**
 * Web App to send paychecks email
 */
function doPost(e) {
  var result = "Success";
  try {
    let parameters = e.parameter
    if (parameters.process == "sendAllPaychecks") {
      sendAllPaychecks();

    } else if (parameters.process == "sendSelectedPaychecks") {
      sendSelectedPaychecks();

    } else if (parameters.process == "sendSelectedPaychecksToAdmin") {
      sendSelectedPaychecksToAdmin();

    }
  }
  catch (err) {
    result = err.message;
    Logger.log("FAILED: " + result);
  }
  return ContentService.createTextOutput(result);
}



/**
 * this is the main function of sending all paychecks via api call
 */
function sendSelectedPaychecksToAdminApiCall() {
  let ui = SpreadsheetApp.getUi()

  let result = ui.alert("Please confirm sending selected paychecks to admin.", SpreadsheetApp.getUi().ButtonSet.OK_CANCEL);

  if (result === SpreadsheetApp.getUi().Button.OK) {
    SpreadsheetApp.getActive().toast("Processing …");

  } else {
    SpreadsheetApp.getActive().toast("Cancelled");
    return
  }

  //try {

  let data = {
    "process": "sendSelectedPaychecksToAdmin",
  };
  // Web app url to process and send paychecks email
  let request = {
    "method": "post",
    "muteHttpExceptions": true,
    "headers": {
      "Authorization": "Bearer " + ScriptApp.getOAuthToken()
    },
    "payload": data
  };

  //try {
  let response = UrlFetchApp.fetch(WEBAPP_URL, request);
  Logger.log(response);
  Logger.log("SUCCESSFULL");
  // }
  // catch (e) {
  //   Logger.log(e.message);
  // }

  ui.alert("Sending paychecks email process was successful.");

  // } catch (err) {
  //   Logger.log(JSON.stringify(err));
  //   ui.alert("Sending paychecks email failed. \nError:\n" + err.message);
  // }

}






/**
 * this is the main function of sending all paychecks via api call
 */
function sendSelectedPaychecksApiCall() {
  let ui = SpreadsheetApp.getUi()

  let result = ui.alert("Please confirm sending selected paychecks.", SpreadsheetApp.getUi().ButtonSet.OK_CANCEL);

  if (result === SpreadsheetApp.getUi().Button.OK) {
    SpreadsheetApp.getActive().toast("Processing …");

  } else {
    SpreadsheetApp.getActive().toast("Cancelled");
    return
  }

  //try {

  let data = {
    "process": "sendSelectedPaychecks",
  };
  // Web app url to process and send paychecks email
  let request = {
    "method": "post",
    "muteHttpExceptions": true,
    "headers": {
      "Authorization": "Bearer " + ScriptApp.getOAuthToken()
    },
    "payload": data
  };

  //try {
  let response = UrlFetchApp.fetch(WEBAPP_URL, request);
  Logger.log(response);
  Logger.log("SUCCESSFULL");
  // }
  // catch (e) {
  //   Logger.log(e.message);
  // }

  ui.alert("Sending paychecks email process was successful.");

  // } catch (err) {
  //   Logger.log(JSON.stringify(err));
  //   ui.alert("Sending paychecks email failed. \nError:\n" + err.message);
  // }

}








/**
 * this is the main function of sending all paychecks via api call
 */
function sendAllPaychecksApiCall() {
  let ui = SpreadsheetApp.getUi()

  let result = ui.alert("Please confirm sending all paychecks.", SpreadsheetApp.getUi().ButtonSet.OK_CANCEL);

  if (result === SpreadsheetApp.getUi().Button.OK) {
    SpreadsheetApp.getActive().toast("Processing …");

  } else {
    SpreadsheetApp.getActive().toast("Cancelled");
    return
  }

  //try {

  let data = {
    "process": "sendAllPaychecks",
  };
  // Web app url to process and send paychecks email
  let request = {
    "method": "post",
    "muteHttpExceptions": true,
    "headers": {
      "Authorization": "Bearer " + ScriptApp.getOAuthToken()
    },
    "payload": data
  };

  //try {
  let response = UrlFetchApp.fetch(WEBAPP_URL, request);
  Logger.log(response);
  Logger.log("SUCCESSFULL");
  // }
  // catch (e) {
  //   Logger.log(e.message);
  // }

  ui.alert("Sending paychecks email process was successful.");

  // } catch (err) {
  //   Logger.log(JSON.stringify(err));
  //   ui.alert("Sending paychecks email failed. \nError:\n" + err.message);
  // }

}

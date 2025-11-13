

//https://script.google.com/a/macros/ssdspc.com/s/AKfycbywLROwQxzV7KMK34rENID0qkAy3DU_YURFJX9FTqFgG43ZM6B3geDt6UzGrj_LVG80/exec
const WEBAPP_URL = "https://script.google.com/a/macros/ssdspc.com/s/AKfycbywLROwQxzV7KMK34rENID0qkAy3DU_YURFJX9FTqFgG43ZM6B3geDt6UzGrj_LVG80/exec"


//this is deployed from admin help

/**
 * Web App to send paychecks email
 */
function doPost(e) {
  var result = "Success";
  try {
    let parameters = e.parameter
    if (parameters.process == "sendAllDefaultSchedule") {
      sendAllDefaultSchedule();

    } else if (parameters.process == "sendAdminSchedule") {
      sendAdminSchedule();

    } else if (parameters.process == "sendMASchedule") {
      sendMASchedule();

    } else if (parameters.process == "sendFDSchedule") {
      sendFDSchedule();

    } else if (parameters.process == "sendSelectedSchedule") {
      sendSelectedSchedule();

    } else if (parameters.process == "sendSelectedScheduleToAdmin") {
      sendSelectedScheduleToAdmin();

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
function sendSelectedScheduleToAdminApiCall() {
  let ui = SpreadsheetApp.getUi()

  let result = ui.alert("Please confirm sending Selected Schedule to Admin.", SpreadsheetApp.getUi().ButtonSet.OK_CANCEL);

  if (result === SpreadsheetApp.getUi().Button.OK) {
    SpreadsheetApp.getActive().toast("Processing …");

  } else {
    SpreadsheetApp.getActive().toast("Cancelled");
    return
  }

  //try {

  let data = {
    "process": "sendSelectedScheduleToAdmin",
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

  ui.alert("Sending Selected Schedule emails to admin process was successful.");

  // } catch (err) {
  //   Logger.log(JSON.stringify(err));
  //   ui.alert("Sending Selected Schedule emails to admin failed. \nError:\n" + err.message);
  // }

}












/**
 * this is the main function of sending all paychecks via api call
 */
function sendSelectedScheduleApiCall() {
  let ui = SpreadsheetApp.getUi()

  let result = ui.alert("Please confirm sending Selected Schedule emails.", SpreadsheetApp.getUi().ButtonSet.OK_CANCEL);

  if (result === SpreadsheetApp.getUi().Button.OK) {
    SpreadsheetApp.getActive().toast("Processing …");

  } else {
    SpreadsheetApp.getActive().toast("Cancelled");
    return
  }

  //try {

  let data = {
    "process": "sendSelectedSchedule",
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

  ui.alert("Sending Selected Schedule email process was successful.");

  // } catch (err) {
  //   Logger.log(JSON.stringify(err));
  //   ui.alert("Sending Selected Schedule email failed. \nError:\n" + err.message);
  // }

}





/**
 * this is the main function of sending all paychecks via api call
 */
function sendFDScheduleApiCall() {
  let ui = SpreadsheetApp.getUi()

  let result = ui.alert("Please confirm sending FD Schedule emails.", SpreadsheetApp.getUi().ButtonSet.OK_CANCEL);

  if (result === SpreadsheetApp.getUi().Button.OK) {
    SpreadsheetApp.getActive().toast("Processing …");

  } else {
    SpreadsheetApp.getActive().toast("Cancelled");
    return
  }

  //try {

  let data = {
    "process": "sendFDSchedule",
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

  ui.alert("Sending FD Schedule email process was successful.");

  // } catch (err) {
  //   Logger.log(JSON.stringify(err));
  //   ui.alert("Sending FD Schedule email failed. \nError:\n" + err.message);
  // }

}



/**
 * this is the main function of sending all paychecks via api call
 */
function sendMAScheduleApiCall() {
  let ui = SpreadsheetApp.getUi()

  let result = ui.alert("Please confirm sending MA Schedule emails.", SpreadsheetApp.getUi().ButtonSet.OK_CANCEL);

  if (result === SpreadsheetApp.getUi().Button.OK) {
    SpreadsheetApp.getActive().toast("Processing …");

  } else {
    SpreadsheetApp.getActive().toast("Cancelled");
    return
  }

  //try {

  let data = {
    "process": "sendMASchedule",
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

  ui.alert("Sending MA Schedule email process was successful.");

  // } catch (err) {
  //   Logger.log(JSON.stringify(err));
  //   ui.alert("Sending MA Schedule email failed. \nError:\n" + err.message);
  // }

}






/**
 * this is the main function of sending all paychecks via api call
 */
function sendAdminScheduleApiCall() {
  let ui = SpreadsheetApp.getUi()

  let result = ui.alert("Please confirm sending Admin Schedule emails.", SpreadsheetApp.getUi().ButtonSet.OK_CANCEL);

  if (result === SpreadsheetApp.getUi().Button.OK) {
    SpreadsheetApp.getActive().toast("Processing …");

  } else {
    SpreadsheetApp.getActive().toast("Cancelled");
    return
  }

  //try {

  let data = {
    "process": "sendAdminSchedule",
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

  ui.alert("Sending Admin Schedule email process was successful.");

  // } catch (err) {
  //   Logger.log(JSON.stringify(err));
  //   ui.alert("Sending Admin Schedule email failed. \nError:\n" + err.message);
  // }

}








/**
 * this is the main function of sending all schedule via api call
 */
function sendAllDefaultScheduleApiCall() {
  let ui = SpreadsheetApp.getUi()

  let result = ui.alert("Please confirm sending default schedule to all.", SpreadsheetApp.getUi().ButtonSet.OK_CANCEL);

  if (result === SpreadsheetApp.getUi().Button.OK) {
    SpreadsheetApp.getActive().toast("Processing …");

  } else {
    SpreadsheetApp.getActive().toast("Cancelled");
    return
  }

  //try {

  let data = {
    "process": "sendAllDefaultSchedule",
  };
  // Web app url to process and send schedule email
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

  ui.alert("Sending schedule email process was successful.");

  // } catch (err) {
  //   Logger.log(JSON.stringify(err));
  //   ui.alert("Sending schedule email failed. \nError:\n" + err.message);
  // }

}










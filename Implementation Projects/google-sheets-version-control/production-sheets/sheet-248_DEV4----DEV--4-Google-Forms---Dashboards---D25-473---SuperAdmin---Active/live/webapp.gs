


const WEBAPP_URL = "https://script.google.com/a/macros/ssdspc.com/s/AKfycbyd1sddegu7RrlpHLR-HI_x7btN4ZP4sRW1bzWdEAREjJMVY12hTrMgoV0XqD_qrJSUXw/exec"

//https://script.google.com/a/macros/ssdspc.com/s/AKfycbyd1sddegu7RrlpHLR-HI_x7btN4ZP4sRW1bzWdEAREjJMVY12hTrMgoV0XqD_qrJSUXw/exec
//https://script.google.com/a/macros/ssdspc.com/s/AKfycbyd1sddegu7RrlpHLR-HI_x7btN4ZP4sRW1bzWdEAREjJMVY12hTrMgoV0XqD_qrJSUXw/exec



/**
 * Web App to send Google Form email
 */
function doPost(e) {
  var result = "Success";
  try {
    let parameters = e.parameter
    if (parameters.process == "sendInitialEmailsAll") {
      sendInitialEmailsAll();

    } else if (parameters.process == "sendInitialEmailsSelected") {
      sendInitialEmailsSelected();

    } else if (parameters.process == "sendReminderEmailAll") {
      sendReminderEmailAll();

    } else if (parameters.process == "sendReminderEmailSelected") {
      sendReminderEmailSelected();

    }
  }
  catch (err) {
    result = "Error";
    //Logger.log("FAILED: " + result);
  }
  return ContentService.createTextOutput(result);
}














/**
 * this is the main function of sending intial email of the google form to all the respondents
 */
function sendInitialEmailsAllApiCall() {
  let ui = SpreadsheetApp.getUi()

  let result = ui.alert("Please confirm sending Intial email to all the respondents.", SpreadsheetApp.getUi().ButtonSet.OK_CANCEL);

  if (result === SpreadsheetApp.getUi().Button.OK) {
    SpreadsheetApp.getActive().toast("Processing …");

  } else {
    SpreadsheetApp.getActive().toast("Cancelled");
    return
  }

  //try {

  let data = {
    "process": "sendInitialEmailsAll",
  };
  // Web app url to process and send form initial emails
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
  //Logger.log("SUCCESSFULL");

  if (response == "Error") {
    ui.alert("Sending Initial emails to respondents failed.")
    return
  } else {
    ui.alert("Sending Initial emails to respondents was successful.");
  }
  // }
  // catch (e) {
  //   Logger.log(e.message);
  // }



  // } catch (err) {
  //   Logger.log(JSON.stringify(err));
  //   ui.alert("Sending Initial emails to respondents failed. \nError:\n" + err.message);
  // }

}





/**
 * this is the main function of sending intial email of the google form to all the selected respondents
 */
function sendInitialEmailsSelectedApiCall() {
  let ui = SpreadsheetApp.getUi()

  let result = ui.alert("Please confirm sending Intial email to the selected respondents.", SpreadsheetApp.getUi().ButtonSet.OK_CANCEL);

  if (result === SpreadsheetApp.getUi().Button.OK) {
    SpreadsheetApp.getActive().toast("Processing …");

  } else {
    SpreadsheetApp.getActive().toast("Cancelled");
    return
  }

  //try {

  let data = {
    "process": "sendInitialEmailsSelected",
  };
  // Web app url to process and send form initial emails
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
  //Logger.log("SUCCESSFULL");


  if (response == "Error") {
    ui.alert("Sending Initial email to respondents failed.")
    return
  } else {
    ui.alert("Sending Initial email to respondents was successful.");
  }

  // }
  // catch (e) {
  //   Logger.log(e.message);
  // }


  // } catch (err) {
  //   Logger.log(JSON.stringify(err));
  //   ui.alert("Sending Initial email to respondents failed. \nError:\n" + err.message);
  // }

}










/**
 * this is the main function of sending reminder email of the google form to all respondents who did not submit any response yet.
 */
function sendReminderEmailAllApiCall() {
  let ui = SpreadsheetApp.getUi()

  let result = ui.alert("Please confirm sending Reminder email to all respondents.", SpreadsheetApp.getUi().ButtonSet.OK_CANCEL);

  if (result === SpreadsheetApp.getUi().Button.OK) {
    SpreadsheetApp.getActive().toast("Processing …");

  } else {
    SpreadsheetApp.getActive().toast("Cancelled");
    return
  }

  //try {

  let data = {
    "process": "sendReminderEmailAll",
  };
  // Web app url to process and send form Reminder emails
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
  //Logger.log("SUCCESSFULL");

  if (response == "Error") {
    ui.alert("Sending Reminder email to respondents failed.")
    return
  } else {
    ui.alert("Sending Reminder email to respondents was successful.");
  }


  //   }
  //   catch (e) {
  //     Logger.log(e.message);
  //   }



  // } catch (err) {
  //   Logger.log(JSON.stringify(err));
  //   ui.alert("Sending Reminder email to respondents failed. \nError:\n" + err.message);
  // }

}










/**
 * this is the main function of sending reminder email of the google form to the selected respondents
 */
function sendReminderEmailSelectedApiCall() {
  let ui = SpreadsheetApp.getUi()

  let result = ui.alert("Please confirm sending Reminder email to the selected respondents.", SpreadsheetApp.getUi().ButtonSet.OK_CANCEL);

  if (result === SpreadsheetApp.getUi().Button.OK) {
    SpreadsheetApp.getActive().toast("Processing …");

  } else {
    SpreadsheetApp.getActive().toast("Cancelled");
    return
  }

  //try {

  let data = {
    "process": "sendReminderEmailSelected",
  };
  // Web app url to process and send form Reminder emails
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
  //Logger.log("SUCCESSFULL");
  if (response == "Error") {
    ui.alert("Sending Reminder email to respondents failed.")
    return
  } else {
    ui.alert("Sending Reminder email to respondents was successful.");
  }
  //   }
  //   catch (e) {
  //     Logger.log(e.message);
  //   }


  // } catch (err) {
  //   Logger.log(JSON.stringify(err));
  //   ui.alert("Sending Reminder email to respondents failed. \nError:\n" + err.message);
  // }

}













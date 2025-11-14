






//below function will return true if the arg is valid date and false if not.
function isValidDate_(d) {
  if (Object.prototype.toString.call(d) !== "[object Date]")
    return false;
  return !isNaN(d.getTime());
}


function onOpen() {
  let ui = SpreadsheetApp.getUi();

  let menu = ui.createMenu("Custom");

  menu.addItem("Filter Calls and Voicemails", "callLogVocemailDashboardMain").addToUi()
  menu.addItem("Fetch Call Logs", "fetchCDRSmainTest").addToUi()
}







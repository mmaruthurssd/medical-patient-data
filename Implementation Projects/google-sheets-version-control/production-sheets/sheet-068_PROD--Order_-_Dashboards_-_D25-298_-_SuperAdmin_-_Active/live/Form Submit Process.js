

function formSubmitInstall(e) {
  const ss = e.source;
  const values = e.values;

  // const ss=SpreadsheetApp.getActiveSpreadsheet();
  // const sheet=ss.getActiveSheet();
  // const values=sheet.getRange(2,1,1,sheet.getLastColumn()).getDisplayValues()[0];


  let finalResults = [];
  let date = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "M/d/yyyy")
  for (let i = 4; i < values.length; i += 4) {
    if (values[i] != "") {
      finalResults.push([date, values[1], values[2], values[3], values[i], values[i + 1], values[i + 2], "", "", "New Request"])
    }
  }


  const requestSheet = ss.getSheetByName("Order Request");
  requestSheet.getRange(requestSheet.getLastRow() + 1, 3, finalResults.length, finalResults[0].length).setValues(finalResults)

  requestSheet.getRange(2, 1, requestSheet.getLastRow() - 1, requestSheet.getLastColumn()).sort([{ column: 1, ascending: false }])

}

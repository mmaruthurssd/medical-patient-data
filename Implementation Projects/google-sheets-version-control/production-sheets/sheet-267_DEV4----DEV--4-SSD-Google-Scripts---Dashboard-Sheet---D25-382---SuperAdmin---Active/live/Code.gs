


function createTrigger() {
  // Create a trigger to run the function clearAndSetZeros at midnight every day
  ScriptApp.newTrigger('clearAndSetZeros')
    .timeBased()
    .everyDays(1)
    .atHour(0)
    .inTimezone(Session.getScriptTimeZone())
    .create();
}


function clearAndSetZeros() {
  // Replace 'Sheet1' with the name of your sheet
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Scripts Log');


  // Get the range for columns L and M, and set their values to 0
  let lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    let allValues = sheet.getRange(2, 12, lastRow - 1, 2).getValues();
    allValues.forEach(row => {
      row[0] = 0;
      row[1] = 0
    })
    sheet.getRange(2, 12, allValues.length, 2).setValues(allValues); // Columns L (12) and M (13)
  }
}





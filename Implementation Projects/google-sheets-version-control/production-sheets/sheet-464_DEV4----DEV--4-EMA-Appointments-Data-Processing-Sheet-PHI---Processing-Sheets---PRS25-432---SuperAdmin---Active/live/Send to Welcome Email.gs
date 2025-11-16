

const WELCOME_EMAIL_SS = "1wwYJUNxqlWXmlxWFAzoH9fy_VGr035XQ5EnY6xroI7o"


function sendToWelcomeEmailProcess() {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("New Visits");

  let allData = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getDisplayValues().filter(r => r[0] != "");

  //let allDataIds = allData.map(r => r[0] + "-" + r[1])


  let destSS = SpreadsheetApp.openById(WELCOME_EMAIL_SS);
  let destSheet = destSS.getSheetByName('New Patients RD');

  let destData = destSheet.getRange(1, 1, destSheet.getLastRow(), 2).getDisplayValues();
  let destDataIds = destData.map(r => r[0] + "-" + r[1])

  let newData = [];

  allData.forEach(row => {
    let id = row[0] + "-" + row[1];
    let indexOfId = destDataIds.indexOf(id);
    if (indexOfId == -1) {
      newData.push(row)
    }
  })


  if (newData.length > 0) {
    destSheet.getRange(destSheet.getLastRow() + 1, 1, newData.length, newData[0].length).setValues(newData)
  }
}

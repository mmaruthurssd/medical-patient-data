


const MASTER_SS_ID = "16dDvJfnXnx-2lieXkPX2iRNi0Z6vqWSOrwivcvNzzBA"
const MASTER_SHEET_NAME = "SSD Biopsies Daily Count"



function onEditInstall(e) {

  return

  let ss = e.source;
  let sheet = ss.getActiveSheet();


  if (sheet.getName() == "Daily log (Main)" || sheet.getName() == "Sheet7") {

    let value = e.value;
    let range = e.range;
    let a1Notation = range.getA1Notation();
    let userEmail = Session.getActiveUser();

    let masterSS = SpreadsheetApp.openById(MASTER_SS_ID)

    let countSheet = masterSS.getSheetByName(MASTER_SHEET_NAME);

    let allSheets = countSheet.getRange("B1:B").getDisplayValues().map(r => r[0]);

    let indexOfSheet = allSheets.indexOf(sheet.getName())

    countSheet.getRange(indexOfSheet + 1, 3).setValue(userEmail)
    countSheet.getRange(indexOfSheet + 1, 4).setValue(new Date())
    countSheet.getRange(indexOfSheet + 1, 5).setValue(a1Notation)
    countSheet.getRange(indexOfSheet + 1, 6).setValue(value)




  }
}

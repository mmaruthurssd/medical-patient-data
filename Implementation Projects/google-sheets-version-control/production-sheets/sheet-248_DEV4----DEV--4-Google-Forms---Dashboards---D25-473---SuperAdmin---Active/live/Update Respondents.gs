function updateRespondents() {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getActiveSheet();

  let formName = sheet.getRange("B3").getValue();

  let startRow = 7;
  let allEmployees = sheet.getRange(startRow, 1, sheet.getLastRow() - (startRow - 1), sheet.getLastColumn()).getValues();

  let newRespondents = []
  let newEmails = []
  allEmployees.forEach((row, i) => {

    if ((row[3] == "TRUE" || row[3] == true) && row[4] == "Yes") {
      sheet.getRange(startRow + i, 4).setValue(false)

    } else if (row[2] == "TRUE" || row[2] == true || row[4] == "Yes") {
      newRespondents.push(row[0])
      newEmails.push(row[1])

      sheet.getRange(startRow + i, 3).setValue(false)
    }
  })


  let existingFormSheet = ss.getSheetByName(EXISTING_FORMS_SHEET);
  let formNames = existingFormSheet.getRange(1, 2, existingFormSheet.getLastRow(), 1).getValues().map(r => r[0])

  let indexOfForm = formNames.indexOf(formName);

  if (indexOfForm > -1) {
    existingFormSheet.getRange(indexOfForm + 1, 7).setValue(newRespondents.join(", "))
    existingFormSheet.getRange(indexOfForm + 1, 8).setValue(newEmails.join(", "))
    existingFormSheet.getRange(indexOfForm + 1, 9).setValue(newEmails.length)
  }


  // let liveFormSheet = ss.getSheetByName(LIVE_FORM_SHEET);
  // let liveFormNames = liveFormSheet.getRange(1, 2, liveFormSheet.getLastRow(), 1).getValues().map(r => r[0])
  // let indexOfLiveForm = liveFormNames.indexOf(formName);
  // if (indexOfLiveForm > -1) {
  //   liveFormSheet.getRange(indexOfLiveForm + 1, 6).setValue(newRespondents.join(", "))
  //   liveFormSheet.getRange(indexOfLiveForm + 1, 7).setValue(newRespondents.length)
  // }


}

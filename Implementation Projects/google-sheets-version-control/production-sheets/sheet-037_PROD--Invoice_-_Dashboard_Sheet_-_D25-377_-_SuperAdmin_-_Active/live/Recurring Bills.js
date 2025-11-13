

//UNIQUE_PAYEE_TYPE
const VENDOR_EXPENSES_SS_ID = "1W-SOL_z6tHSj3DVqrzq8DQSd1ECOrlwSCIIY0Ov-ucM";
const VENDOR_UNIQUE_PAYEE_SHEET = "Unique Payees"



const Recurring_Bills_SHEET = "Recurring Bills"





function addRemoveRecurringPayee() {

  let ss = SpreadsheetApp.getActiveSpreadsheet();

  let sheet = ss.getSheetByName(Recurring_Bills_SHEET);


  let recurringMonthlyEndRow = sheet.getLastRow() + 1

  let recurringPayee = sheet.getRange(5, 1, recurringMonthlyEndRow - 5, 1).getValues().map(r => r[0])



  let vendorSS = SpreadsheetApp.openById(VENDOR_EXPENSES_SS_ID);
  let uniquePayeeSheet = vendorSS.getSheetByName(VENDOR_UNIQUE_PAYEE_SHEET);
  let typeCol = uniquePayeeSheet.getRange("UNIQUE_PAYEE_TYPE").getColumn()

  let allPayees = uniquePayeeSheet.getRange(1, 1, uniquePayeeSheet.getLastRow(), uniquePayeeSheet.getLastColumn()).getValues().filter(row => row[typeCol - 1] == "Vendor - Monthly").map(r => r[0])



  //adding Recurring payee
  allPayees.forEach(payee => {
    let indexOfPayee = recurringPayee.indexOf(payee);
    if (indexOfPayee == -1) {
      recurringMonthlyEndRow = sheet.getRange("RECURRING_MONTHLY_END_ROW").getRow();

      //sheet.insertRows(recurringMonthlyEndRow)
      sheet.insertRowAfter(recurringMonthlyEndRow - 1)
      sheet.getRange(recurringMonthlyEndRow, 1).setValue(payee)
      recurringPayee.push(payee)

      sheet.getRange(recurringMonthlyEndRow - 1, 11, 1, sheet.getLastColumn() - 10).copyTo(sheet.getRange(recurringMonthlyEndRow, 11, 1, sheet.getLastColumn() - 10), SpreadsheetApp.CopyPasteType.PASTE_FORMULA)
    }
  })



  //removing Recurring Payee

  recurringPayee = sheet.getRange(5, 1, recurringMonthlyEndRow - 5, 1).getValues().map(r => r[0])

  for (var i = recurringPayee.length - 1; i >= 0; i--) {

    let indexOfPayee = allPayees.indexOf(recurringPayee[i])
    if (indexOfPayee == -1) {
      sheet.deleteRow(i + 5)

    }
  }


}















function updateUniquePayee() {

  return


  let ss = SpreadsheetApp.getActiveSpreadsheet()

  let payeeCalSheet = ss.getSheetByName("Unique_Payees_Calculation");
  let payeeCalData = payeeCalSheet.getRange(2, 1, payeeCalSheet.getLastRow() - 1, 13).getValues();
  let filterPayeeCal = payeeCalData.filter(r => r[0] != "" || r[1] != "" || r[2] != "" || r[3] != "")



  let payeeSheet = ss.getSheetByName("Unique Payees");
  let payeeHeaders = payeeSheet.getRange(3, 1, 1, payeeSheet.getLastColumn()).getValues()[0].map(h => h.toString().toLowerCase().trim());
  let payeeData = payeeSheet.getRange(4, 1, payeeSheet.getLastRow() - 3, 12).getValues();
  let filterPayeeData = payeeData.filter(r => r[0] != "" || r[1] != "" || r[2] != "" || r[3] != "")

  let payeeIdIndex = payeeHeaders.indexOf("payee id")
  let payeeIndex = payeeHeaders.indexOf("payee")
  let noPaymentIndex = payeeHeaders.indexOf("# of debits")
  let toalPaidIndex = payeeHeaders.indexOf("total $ debits")

  let noCreditIndex = payeeHeaders.indexOf("# of credits")
  let toalCreditIndex = payeeHeaders.indexOf("credit $")

  let noTransferIndex = payeeHeaders.indexOf("# of transfers")
  let toalTransferIndex = payeeHeaders.indexOf("transfer $")


  let firstPaymentDateIndex = payeeHeaders.indexOf("1st payment date")
  let lastPaymentAmountIndex = payeeHeaders.indexOf("last payment amnt $")
  let lastPaymentDateIndex = payeeHeaders.indexOf("last payment date")
  let frequencyDaysIndex = payeeHeaders.indexOf("frequency (days)")



  for (var i = 0; i < filterPayeeCal.length; i++) {
    let foundFlage = false;

    if (filterPayeeCal[i][1] == "#N/A") {
      continue
    }
    for (var j = 0; j < filterPayeeData.length; j++) {

      if (filterPayeeData[j][payeeIdIndex] == filterPayeeCal[i][0]) {

        filterPayeeData[j][noPaymentIndex] = filterPayeeCal[i][2]
        filterPayeeData[j][toalPaidIndex] = filterPayeeCal[i][3]
        filterPayeeData[j][noCreditIndex] = filterPayeeCal[i][4]
        filterPayeeData[j][toalCreditIndex] = filterPayeeCal[i][5]
        filterPayeeData[j][noTransferIndex] = filterPayeeCal[i][6]
        filterPayeeData[j][toalTransferIndex] = filterPayeeCal[i][7]

        filterPayeeData[j][firstPaymentDateIndex] = filterPayeeCal[i][8]
        filterPayeeData[j][lastPaymentAmountIndex] = filterPayeeCal[i][9]
        filterPayeeData[j][lastPaymentDateIndex] = filterPayeeCal[i][10]
        filterPayeeData[j][frequencyDaysIndex] = filterPayeeCal[i][11]

        foundFlage = true
        break;
      }
    }

    if (foundFlage == false) {
      let newRow = [filterPayeeCal[i][0], filterPayeeCal[i][1], filterPayeeCal[i][2], filterPayeeCal[i][3], filterPayeeCal[i][4], filterPayeeCal[i][5], filterPayeeCal[i][6], filterPayeeCal[i][7], filterPayeeCal[i][8], filterPayeeCal[i][9], filterPayeeCal[i][10], filterPayeeCal[i][11]]
      filterPayeeData.push(newRow)
    }
  }


  if (payeeSheet.getLastRow() > 3) {
    payeeSheet.getRange(4, 1, payeeSheet.getLastRow() - 3, 12).clearContent();
  }


  payeeSheet.getRange(4, 1, filterPayeeData.length, filterPayeeData[0].length).setValues(filterPayeeData);



}






/**
 * this function sort the unique payee
 */
function sortUniquePayee() {

  let ss = SpreadsheetApp.getActiveSpreadsheet()

  let sheet = ss.getActiveSheet();

  let sortingCondition = sheet.getRange("A2:B2").getValues()[0];

  let headings = sheet.getRange(3, 1, 1, sheet.getLastColumn()).getValues()[0];

  let columnIndex = headings.indexOf(sortingCondition[1]);

  if (columnIndex > -1) {
    if (sortingCondition[0] == "Ascending") {
      sheet.getRange(4, 1, sheet.getLastRow() - 3, sheet.getLastColumn()).sort([{ column: columnIndex + 1, ascending: true }])
    } else {
      sheet.getRange(4, 1, sheet.getLastRow() - 3, sheet.getLastColumn()).sort([{ column: columnIndex + 1, ascending: false }])
    }

  }
}



const Expenses_Dashboard_SS_ID = "1W-SOL_z6tHSj3DVqrzq8DQSd1ECOrlwSCIIY0Ov-ucM"
const Expenses_Dashboard_SHEET_NAME = "All Bank & CC Transactions_ (Editable)"







function getSupplierChargesFromExpense() {

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let supBankChargesSheet = ss.getSheetByName("Supplier Bank Charges (Expense Dashboard)");
  //let existingTrxIds = supBankChargesSheet.getRange(1, 3, supBankChargesSheet.getLastRow(), 1).getDisplayValues().map(r => r[0])


  let expenseSS = SpreadsheetApp.openById(Expenses_Dashboard_SS_ID);
  let expenseSheet = expenseSS.getSheetByName(Expenses_Dashboard_SHEET_NAME);
  let allExpenseData = expenseSheet.getRange(1, 1, expenseSheet.getLastRow(), expenseSheet.getLastColumn()).getDisplayValues();

  let allExpHeaders = allExpenseData.splice(0, 1)[0];
  let expPayeeIndex = allExpHeaders.indexOf("Payee");
  let expCatIndex = allExpHeaders.indexOf("Category");
  let allExpCat = allExpenseData.map(r => [r[expCatIndex]])



  let uniqueSheet = expenseSS.getSheetByName("Unique Payees");

  let uniqueData = uniqueSheet.getRange(3, 1, uniqueSheet.getLastRow() - 2, uniqueSheet.getLastColumn()).getDisplayValues()
  let uniqueHeaders = uniqueData.splice(0, 1)[0]


  let uniquePayeeIDIndex = uniqueHeaders.indexOf("Payee Id");
  let uniquePayeeIndex = uniqueHeaders.indexOf("Payee");
  let uniqueCatIndex = uniqueHeaders.indexOf("Category");


  let allUniquePayee = uniqueData.map(r => r[uniquePayeeIndex])

  let filteredUniqueData = uniqueData.filter(r => r[uniqueCatIndex] == "Supplier")
  let allSupPayees = filteredUniqueData.map(r => r[uniquePayeeIndex])

  let supplierData = []
  for (var i = 0; i < allExpenseData.length; i++) {

    let indexInUniquePayee = allSupPayees.indexOf(allExpenseData[i][expPayeeIndex])
    let indexInAllUniquePayee = allUniquePayee.indexOf(allExpenseData[i][expPayeeIndex])

    if (indexInUniquePayee > -1 || allExpCat[i][0] == "Order") {
      supplierData.push(["", uniqueData[indexInAllUniquePayee][uniquePayeeIDIndex], allExpenseData[i][0], allExpenseData[i][1], allExpenseData[i][2], allExpenseData[i][4], allExpenseData[i][5]])
      allExpCat[i][0] = "Order"
    }
  }



  if (supplierData.length > 0) {
    supBankChargesSheet.getRange(2, 1, supplierData.length, supplierData[0].length).setValues(supplierData)
    expenseSheet.getRange(2, expCatIndex + 1, allExpCat.length, 1).setValues(allExpCat)
  }





}






































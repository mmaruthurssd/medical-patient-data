

const Expenses_Dashboard_SS_ID = "1W-SOL_z6tHSj3DVqrzq8DQSd1ECOrlwSCIIY0Ov-ucM"
const Expenses_Dashboard_SHEET_NAME = "All Bank & CC Transactions_ (Editable)"





function onOpen() {
  let ui = SpreadsheetApp.getUi();
  let menu = ui.createMenu("Custom");
  menu.addItem("Fetch Miscellaneous Supplier Bank Charges", "getMiscSupplierChargesFromExpense").addToUi()

  let menu2 = ui.createMenu("Gmail Orders");
  menu2.addItem("Get Emails from Gmail", "extractEmails").addSeparator().addItem("Download/Create PDFs","download_or_createPDFs").addToUi()
}




function getMiscSupplierChargesFromExpense() {

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let miscOrderLogSheet = ss.getSheetByName("Miscellaneous Order Log");

  let existingTrxIds = miscOrderLogSheet.getRange(1, 1, miscOrderLogSheet.getLastRow(), 1).getValues().map(r => r[0])



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

  let filteredUniqueData = uniqueData.filter(r => r[uniqueCatIndex] == "Supplier - Misc")
  let allSupPayees = filteredUniqueData.map(r => r[uniquePayeeIndex])

  let supplierData = []
  let expTrxIds = [];
  for (var i = 0; i < allExpenseData.length; i++) {

    let indexInUniquePayee = allSupPayees.indexOf(allExpenseData[i][expPayeeIndex])
    let indexInAllUniquePayee = allUniquePayee.indexOf(allExpenseData[i][expPayeeIndex])
    //Logger.log(indexInAllUniquePayee)

    try {
      if (indexInUniquePayee > -1 || allExpCat[i][0] == "Order - Misc") {

        if (existingTrxIds.indexOf(allExpenseData[i][8]) == -1 && uniqueData[indexInAllUniquePayee][uniquePayeeIDIndex] != '436 - Advanced Healthcare Solutions LLC' && uniqueData[indexInAllUniquePayee][uniquePayeeIDIndex] != '75 - StimLabs' && uniqueData[indexInAllUniquePayee][uniquePayeeIDIndex] != '455 - Skye Biologics') {

          supplierData.push([allExpenseData[i][8], uniqueData[indexInAllUniquePayee][uniquePayeeIDIndex], allExpenseData[i][0], allExpenseData[i][1], allExpenseData[i][2], allExpenseData[i][4], allExpenseData[i][5]])
          allExpCat[i][0] = "Order - Misc"
          //existingTrxIds
        }

        expTrxIds.push(allExpenseData[i][8])

      }
    } catch (err) { }
  }



  for (var i = existingTrxIds.length - 1; i > 1; i--) {
    if (expTrxIds.indexOf(existingTrxIds[i]) == -1) {
      miscOrderLogSheet.deleteRows(i + 1, 1)
    }
  }





  if (supplierData.length > 0) {
    miscOrderLogSheet.getRange(miscOrderLogSheet.getLastRow() + 1, 1, supplierData.length, supplierData[0].length).setValues(supplierData)
    expenseSheet.getRange(2, expCatIndex + 1, allExpCat.length, 1).setValues(allExpCat)

    miscOrderLogSheet.getRange(3, 1, miscOrderLogSheet.getLastRow() - 2, miscOrderLogSheet.getLastColumn()).sort([{ column: 3, ascending: false }])
  }





}






































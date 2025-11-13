

const QB_SHEET_NAME = "All QB Transactions"

const UNCLEARED_TRANSACTION_SHEET = "QB Uncleared Transactions"


//const BANK_CC_TRANSACTION_SHEET = "All Bank & CC Transactions_"

const BANK_CC_TRANSACTION_SHEET = "All Bank & CC Transactions_ (Editable)"



function deleteAPIProcessTriggerTrigger() {
  const allTriggers = ScriptApp.getProjectTriggers();
  for (let index = 0; index < allTriggers.length; index++) {
    if (allTriggers[index].getHandlerFunction() === "apiProcessTrigger") {
      ScriptApp.deleteTrigger(allTriggers[index]);
    }
  }
}



function apiProcessTrigger() {
  //deleteAPIProcessTriggerTrigger()
  //getNewTokenMain_()
  fetchQuickbookTrasactionsMain()
}


function fetchQuickbookTrasactionsMain() {

  return
  //getNewTokenMain_()

  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let apiDetailSheet = ss.getSheetByName(API_DETAILS_SHEET);
  let token = apiDetailSheet.getRange("B2").getValue();


  let myHeaders = {
    "Accept": "application/json",
    "Authorization": "Bearer " + token
  };

  let date = new Date();


  let endDate = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate()

  let url = "https://quickbooks.api.intuit.com/v3/company/9130351010041306/reports/TransactionList?start_date=2021-6-1&end_date=" + endDate;


  let requestOptions = {
    method: 'Get',
    headers: myHeaders,
    muteHttpExceptions: true
  };

  let response = UrlFetchApp.fetch(url, requestOptions);
  let result = response.getContentText();
  let resultObj = JSON.parse(result);


  let allData = processAllTransactions_(resultObj)




  let unclearedSheet = ss.getSheetByName(UNCLEARED_TRANSACTION_SHEET);
  let unclearedExistingData = [];
  if (unclearedSheet.getLastRow() > 1) {
    unclearedExistingData = unclearedSheet.getRange(2, 2, unclearedSheet.getLastRow() - 1, unclearedSheet.getLastColumn() - 1).getDisplayValues().filter(d => d[8] != "" && d[8] != null)

    unclearedSheet.getRange(2, 2, unclearedSheet.getLastRow() - 1, unclearedSheet.getLastColumn() - 1).clearContent()
  }




  if (allData.length > 0) {


    assignIDsTONewPayee(ss, allData)







    let bankCCSheet = ss.getSheetByName(BANK_CC_TRANSACTION_SHEET);
    let existingClearedData = []
    if (bankCCSheet.getLastRow() > 1) {
      existingClearedData = bankCCSheet.getRange(2, 1, bankCCSheet.getLastRow() - 1, bankCCSheet.getLastColumn()).getDisplayValues();
    }
    let uniqueObj = {};


    existingClearedData.forEach(row => {
      let key = row[0] + roundNumber(Number(row[1])) + row[2] + row[3] + row[4]
      uniqueObj[key] = true
    })

    unclearedExistingData.forEach(row => {
      let key = row[0] + roundNumber(Number(row[1])) + row[2] + row[3] + row[4]
      uniqueObj[key] = true
    })

    let idSheet = ss.getSheetByName("TRX_ID_TRACKER_")
    let trxId = idSheet.getRange("A2").getValue();
    let filterCleared = [];
    allData.forEach(row => {
      if (row[1] != "" && row[1] != null) {
        let key = row[0] + roundNumber(Number(row[1])) + row[2] + row[3] + row[4]
        if (uniqueObj[key]) {
        } else {
          // Logger.log(key)
          // Logger.log(row)

          filterCleared.push([row[0], row[1], row[2], row[3], row[4], row[5], row[6], row[7], "TRX-" + (trxId++)])
        }
      }
    })

    idSheet.getRange("A2").setValue(trxId++)


    //let unclearedChecks = [];
    let clearedChecksCC = [];

    filterCleared.forEach(trx => {
      if (trx[2] == "Check") {
        unclearedExistingData.push(trx)
      } else {
        clearedChecksCC.push(trx)
      }
    })

    if (unclearedExistingData.length > 0) {
      unclearedSheet.getRange(2, 2, unclearedExistingData.length, unclearedExistingData[0].length).setValues(unclearedExistingData)
    }

    SpreadsheetApp.flush()
    Utilities.sleep(5000)

    if (clearedChecksCC.length > 0) {
      bankCCSheet.getRange(bankCCSheet.getLastRow() + 1, 1, clearedChecksCC.length, clearedChecksCC[0].length).setValues(clearedChecksCC)
    }
  }



  const dataUpdateLog = ss.getSheetByName("Data Update Log")
  dataUpdateLog.getRange("D4").setValue(new Date())


}


function roundNumber(number) {
  // Check if the number is an integer
  if (Number.isInteger(number)) {
    // Add two zeros to the integer
    return (number + '.00');
  } else {
    // Round the number to two decimal places
    return number.toFixed(2);
  }
}







function getUnclearedTransactions(myHeaders) {

  let date = new Date();

  let endDate = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate()

  let url = "https://quickbooks.api.intuit.com/v3/company/9130351010041306/reports/TransactionList?start_date=2021-6-1&end_date=" + endDate + "&cleared=Uncleared";


  let requestOptions = {
    method: 'Get',
    headers: myHeaders,
    muteHttpExceptions: true
  };

  let response = UrlFetchApp.fetch(url, requestOptions);
  let result = response.getContentText();
  let resultObj = JSON.parse(result);


  let unclearedTransactions = []

  try {
    resultObj.Rows.Row.forEach(row => {
      try {
        let amount = row.ColData[9].value;
        if (amount < 0) {
          amount = amount * (-1)
        }


        let rowData = [row.ColData[0].value, amount, row.ColData[1].value, row.ColData[2].value, row.ColData[6].value, row.ColData[8].value, row.ColData[4].value, row.ColData[7].value]

        unclearedTransactions.push(rowData)
      } catch (err) { }
    })
  } catch (err) { }

  return unclearedTransactions

}



function processAllTransactions_(resultObj) {

  let allData = []

  try {
    resultObj.Rows.Row.forEach(row => {
      try {
        let amount = row.ColData[9].value;
        if (amount < 0) {
          amount = amount * (-1)
        }
        // let rowData = [row.ColData[0].value, row.ColData[1].value, row.ColData[2].value, row.ColData[4].value, "", row.ColData[5].value, row.ColData[6].value, amount, "", row.ColData[8].value]
        //let rowData = [row.ColData[0].value, row.ColData[4].value, amount, row.ColData[1].value, row.ColData[2].value, row.ColData[7].value, row.ColData[6].value, row.ColData[8].value]

        let rowData = [row.ColData[0].value, amount, row.ColData[1].value, row.ColData[2].value, row.ColData[6].value, row.ColData[8].value, row.ColData[4].value, row.ColData[7].value]

        allData.push(rowData)
      } catch (err) { }
    })
  } catch (err) { }

  return allData
}




function fetchQuickbookTrasactions() {

  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let apiDetailSheet = ss.getSheetByName(API_DETAILS_SHEET);
  let token = apiDetailSheet.getRange("B2").getValue();





  let myHeaders = {
    "Accept": "application/json",
    "Authorization": "Bearer " + token
  };

  let date = new Date();


  let startEndDate = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate()



  let url = "https://quickbooks.api.intuit.com/v3/company/9130351010041306/reports/TransactionList?start_date=" + startEndDate + "&end_date=" + startEndDate;
  //let url = "https://quickbooks.api.intuit.com/v3/company/9130351010041306/reports/TransactionList?start_date=2021-6-1&end_date=2024-3-13";


  let requestOptions = {
    method: 'Get',
    headers: myHeaders,
    muteHttpExceptions: true
  };

  let response = UrlFetchApp.fetch(url, requestOptions);
  let result = response.getContentText();
  let resultObj = JSON.parse(result);


  // { type = Data, ColData = [{ value=2023 - 12 - 01 }, { value=Check, id=14781 }, { value=2573 }, { value=Yes }, { value=Advanced Heathcare Solutions LLC, id=1002 }, { id=5, value=Shared }, { value=Voided - INVOICE JW100323 }, { id=28, value=1001 Bank Accounts: 1000 Checking }, { value=500 Expenses: 5030 Medical Supplies: 5030.3 Skin Substitutes, id=454 }, { value=.00 }] }


  let allData = []

  try {
    resultObj.Rows.Row.forEach(row => {
      try {
        let amount = row.ColData[9].value;
        if (amount < 0) {
          amount = amount * (-1)
        }
        // let rowData = [row.ColData[0].value, row.ColData[1].value, row.ColData[2].value, row.ColData[4].value, "", row.ColData[5].value, row.ColData[6].value, amount, "", row.ColData[8].value]
        //let rowData = [row.ColData[0].value, row.ColData[4].value, amount, row.ColData[1].value, row.ColData[2].value, row.ColData[7].value, row.ColData[6].value, row.ColData[8].value]

        let rowData = [row.ColData[0].value, amount, row.ColData[1].value, row.ColData[2].value, row.ColData[6].value, row.ColData[8].value, row.ColData[4].value, row.ColData[7].value]

        allData.push(rowData)
      } catch (err) { }
    })
  } catch (err) { }



  if (allData.length == 0) return


  //here I am assigining ids to the new payee
  try {
    assignIDsTONewPayee(ss, allData)
  } catch (err) { Logger.log("New Payee: " + err) }





  let sheet = ss.getSheetByName("All Expenses (from Quickbooks)");
  let sheetData = []
  if (sheet.getLastRow() > 1) {
    sheetData = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getDisplayValues();
  }
  let Date_ = Utilities.formatDate(date, "GMT-6", "M/d/yyyy")

  for (var i = sheetData.length - 1; i >= 0; i--) {
    try {
      //let transactionDate = Utilities.formatDate(sheetData[i][0], "GMT-6", "yyyy-MM-dd")
      let transactionDate = sheetData[i][0]
      if (transactionDate == Date_) {
        sheetData.splice(i, 1)
      }
    } catch (err) { }
  }









  // if (sheet.getLastRow() > 1) {
  //   sheet.getRange(2, 5, sheet.getLastRow() - 1, sheet.getLastColumn() - 4).clearContent()
  // }

  if (sheetData.length > 0) {
    sheet.getRange(2, 1, sheetData.length, sheetData[0].length).setValues(sheetData);
    sheet.getRange(sheetData.length + 2, 1, allData.length, allData[0].length).setValues(allData);
    //sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).sort([{ column: 1, ascending: false }])

  } else {
    sheet.getRange(2, 1, allData.length, allData[0].length).setValues(allData);
    //sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn() ).sort([{ column: 1, ascending: false }])
  }




  let newExpenseData = [];
  let newDepositData = [];

  allData.forEach(row => {
    if (row[2] == "Deposit" || row[2] == "Transfer") {
      newDepositData.push(row)
    } else {
      newExpenseData.push(row)
    }
  })





  let expenseSheet = ss.getSheetByName("Expenses Only")
  let expenseData = []
  if (expenseSheet.getLastRow() > 1) {
    expenseData = expenseSheet.getRange(2, 6, expenseSheet.getLastRow() - 1, expenseSheet.getLastColumn() - 6).getDisplayValues();
  }

  for (var i = expenseData.length - 1; i >= 0; i--) {
    try {
      // let transactionDate = Utilities.formatDate(expenseData[i][0], "GMT-6", "yyyy-MM-dd")
      let transactionDate = expenseData[i][0]
      if (transactionDate == Date_) {
        expenseData.splice(i, 1)
      }
    } catch (err) { }
  }


  let depositsSheet = ss.getSheetByName("Deposits & Transfers Only")
  let depositsData = []
  if (depositsSheet.getLastRow() > 1) {
    depositsData = depositsSheet.getRange(2, 1, depositsSheet.getLastRow() - 1, depositsSheet.getLastColumn()).getDisplayValues();
  }

  for (var i = depositsData.length - 1; i >= 0; i--) {
    try {
      // let transactionDate = Utilities.formatDate(depositsData[i][0], "GMT-6", "yyyy-MM-dd")
      let transactionDate = depositsData[i][0]
      if (transactionDate == Date_) {
        depositsData.splice(i, 1)
      }
    } catch (err) { }
  }







  try {
    if (expenseData.length > 0) {
      expenseSheet.getRange(2, 6, expenseData.length, expenseData[0].length).setValues(expenseData);
      expenseSheet.getRange(expenseData.length + 2, 6, newExpenseData.length, newExpenseData[0].length).setValues(newExpenseData);
      expenseSheet.getRange(2, 6, expenseSheet.getLastRow() - 1, expenseSheet.getLastColumn() - 5).sort([{ column: 6, ascending: false }])

    } else {
      expenseSheet.getRange(2, 6, newExpenseData.length, newExpenseData[0].length).setValues(newExpenseData);
      expenseSheet.getRange(2, 6, expenseSheet.getLastRow() - 1, expenseSheet.getLastColumn() - 5).sort([{ column: 6, ascending: false }])
    }
  } catch (err) { Logger.log(err) }



  try {
    if (depositsData.length > 0) {
      depositsSheet.getRange(2, 1, depositsData.length, depositsData[0].length).setValues(depositsData);
      depositsSheet.getRange(depositsData.length + 2, 1, newDepositData.length, newDepositData[0].length).setValues(newDepositData);
      //depositsSheet.getRange(2, 1, depositsSheet.getLastRow() - 1, depositsSheet.getLastColumn()).sort([{ column: 1, ascending: false }])

    } else {
      depositsSheet.getRange(2, 1, newDepositData.length, newDepositData[0].length).setValues(newDepositData);
      //depositsSheet.getRange(2, 1, depositsSheet.getLastRow() - 1, depositsSheet.getLastColumn()).sort([{ column: 1, ascending: false }])
    }
  } catch (err) { Logger.log(err) }




}







function assignIDsTONewPayee(ss, allData) {

  let payeeIdsSheet = ss.getSheetByName("Payee_IDs")
  let allPayees = payeeIdsSheet.getRange("B1:B").getDisplayValues().map(r => r[0]);
  let allNumbers = payeeIdsSheet.getRange("A2:A").getValues().filter(r => r[0] != "").map(r => r[0]);
  let max = Math.max(...allNumbers)

  let newPayees = [];
  allData.forEach(row => {
    if (row[6] != "" && row[6] != null) {
      let payeeIndex = allPayees.indexOf(row[6])
      if (payeeIndex == -1) {
        max++
        newPayees.push([max, row[6]])
        allPayees.push(row[6])
      }
    }
  })

  if (newPayees.length == 0) return

  let lastRow = allPayees.indexOf("")
  if (lastRow == -1) {
    lastRow = payeeIdsSheet.getLastRow()
  }

  payeeIdsSheet.getRange(lastRow + 1, 1, newPayees.length, newPayees[0].length).setValues(newPayees)

}







function testSheetData() {

  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("All Expenses");


  let sheetData = []
  if (sheet.getLastRow() > 1) {
    sheetData = sheet.getRange(2, 1, 2, sheet.getLastColumn()).getValues();
  }
  Logger.log(sheetData)

  let date = new Date(2023, 11, 31);

  let Date_ = Utilities.formatDate(date, "GMT-6", "yyyy-MM-dd")

  for (var i = sheetData.length - 1; i >= 0; i--) {
    try {
      let transactionDate = Utilities.formatDate(sheetData[i][0], "GMT-6", "yyyy-MM-dd")
      if (transactionDate == Date_) {
        sheetData.splice(i, 1)
      }
    } catch (err) { }
  }

  Logger.log(sheetData)
}



function testPayeeId() {
  let ss = SpreadsheetApp.getActiveSpreadsheet()
  let payeeIdsSheet = ss.getSheetByName("Payee_IDs")
  let allPayees = payeeIdsSheet.getRange("B1:B").getValues().map(r => r[0]);

  let lastRow = allPayees.indexOf("")
  Logger.log(emptyIndex)

}









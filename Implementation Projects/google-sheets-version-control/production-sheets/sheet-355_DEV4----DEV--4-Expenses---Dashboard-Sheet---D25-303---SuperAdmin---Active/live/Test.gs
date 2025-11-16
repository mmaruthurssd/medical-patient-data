




function fetchQuickbookTrasactionsTest() {

  getNewTokenMain_()

  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let apiDetailSheet = ss.getSheetByName(API_DETAILS_SHEET);
  let token = apiDetailSheet.getRange("B2").getValue();





  let myHeaders = {
    "Accept": "application/json",
    "Authorization": "Bearer " + token
  };

  let date = new Date();

  // Logger.log(date)
  // return

  //date.setDate(date.getDate() )

  let startEndDate = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate()



  //let url = "https://quickbooks.api.intuit.com/v3/company/9130351010041306/reports/TransactionList?start_date=" + startEndDate + "&end_date=" + startEndDate;
  //let url = "https://quickbooks.api.intuit.com/v3/company/9130351010041306/reports/TransactionList?start_date=2024-1-1&end_date=2024-3-19";
  //let url = "https://quickbooks.api.intuit.com/v3/company/9130351010041306/reports/TransactionList?start_date=2024-1-1&end_date=2024-3-19&cleared=Cleared";
  //let url = "https://quickbooks.api.intuit.com/v3/company/9130351010041306/reports/TransactionList?start_date=2023-6-11&end_date=2023-12-30&cleared=Uncleared";

  //let url = "https://quickbooks.api.intuit.com/v3/company/9130351010041306/reports/TransactionList?start_date=2024-3-18&end_date=2024-3-19&columns=is_cleared"
  //let url = "https://quickbooks.api.intuit.com/v3/company/9130351010041306/reports/TransactionList?start_date=2024-3-18&end_date=2024-3-19"
  //let url = "https://quickbooks.api.intuit.com/v3/company/9130351010041306/reports/VendorExpenses?start_date=2024-1-1&end_date=2024-3-19"

  //let url = "https://quickbooks.api.intuit.com/v3/company/9130351010041306/reports/TransactionList?start_date=2024-2-1&end_date=2024-2-29&cleared=Cleared"

  //let url = "https://quickbooks.api.intuit.com/v3/company/9130351010041306/reports/TransactionList?start_date=2024-5-1&end_date=2024-5-29"

  let url = "https://quickbooks.api.intuit.com/v3/company/9130351010041306/reports/TransactionList?start_date=2024-5-14&end_date=2024-5-30&cleared=Cleared"

  //let url = "https://quickbooks.api.intuit.com/v3/company/9130351010041306/reports/TransactionList?start_date=2024-4-14&end_date=2024-5-30&appaid=Paid"


  let requestOptions = {
    method: 'Get',
    headers: myHeaders,
    muteHttpExceptions: true
  };

  let response = UrlFetchApp.fetch(url, requestOptions);
  let result = response.getContentText();
  let resultObj = JSON.parse(result);

  Logger.log(resultObj)


  // { type = Data, ColData = [{ value=2023 - 12 - 01 }, { value=Check, id=14781 }, { value=2573 }, { value=Yes }, { value=Advanced Heathcare Solutions LLC, id=1002 }, { id=5, value=Shared }, { value=Voided - INVOICE JW100323 }, { id=28, value=1001 Bank Accounts: 1000 Checking }, { value=500 Expenses: 5030 Medical Supplies: 5030.3 Skin Substitutes, id=454 }, { value=.00 }] }


  //Logger.log(resultObj.Rows.Row.length)
  //Logger.log(resultObj)
  //return

  let allData = []

  try {
    resultObj.Rows.Row.forEach(row => {

      Logger.log(row)
      //return
      try {
        let amount = row.ColData[9].value;
        if (amount < 0) {
          amount = amount * (-1)
        }
        // let rowData = [row.ColData[0].value, row.ColData[1].value, row.ColData[2].value, row.ColData[4].value, "", row.ColData[5].value, row.ColData[6].value, amount, "", row.ColData[8].value]
        //let rowData = [row.ColData[0].value, row.ColData[4].value, amount, row.ColData[1].value, row.ColData[2].value, row.ColData[7].value, row.ColData[6].value, row.ColData[8].value]

        let rowData = [row.ColData[0].value, amount, row.ColData[1].value, row.ColData[2].value, row.ColData[6].value, row.ColData[8].value, row.ColData[4].value, row.ColData[7].value]

        allData.push(rowData)

        if (rowData[6] == "Llivina & Harrigill MD PC") {
          //Logger.log(rowData)
        }
      } catch (err) { }
    })
  } catch (err) { }


  //return


  //Logger.log(allData)

  if (allData.length == 0) return


  //here I am assigining ids to the new payee
  // try {
  //   assignIDsTONewPayee(ss, allData)
  // } catch (err) { Logger.log("New Payee: " + err) }





  //let sheet = ss.getSheetByName("All Feb");
  //sheet.getRange(2, 1, allData.length, allData[0].length).setValues(allData);





  // if (depositsData.length > 0) {
  //   depositsSheet.getRange(2, 1, depositsData.length, depositsData[0].length).setValues(depositsData);
  //   depositsSheet.getRange(depositsData.length + 2, 1, newDepositData.length, newDepositData[0].length).setValues(newDepositData);
  //   depositsSheet.getRange(2, 1, depositsSheet.getLastRow() - 1, depositsSheet.getLastColumn()).sort([{ column: 1, ascending: false }])

  // } else {
  //   depositsSheet.getRange(2, 1, newDepositData.length, newDepositData[0].length).setValues(newDepositData);
  //   depositsSheet.getRange(2, 1, depositsSheet.getLastRow() - 1, depositsSheet.getLastColumn()).sort([{ column: 1, ascending: false }])
  // }




}










function testDatesceFunc() {
  Logger.log(new Date())

  let Date_ = Utilities.formatDate(new Date(2024, 2, 4), "GMT-6", "M/d/yyyy")

  Logger.log(Date_)

}








function testClearedTransactions(){

  //let url = "https://quickbooks.api.intuit.com/v3/company/9130351010041306/reports/TransactionList?start_date=2024-3-1&end_date=2024-3-31"

  let companyID="9130351010041306"


  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let apiDetailSheet = ss.getSheetByName(API_DETAILS_SHEET);
  let token = apiDetailSheet.getRange("B2").getValue();


  var url = 'https://quickbooks.api.intuit.com/v3/company/'+companyID+'/query';
    var query = "SELECT * FROM Transaction WHERE TxnStatus = 'cleared'";
    var headers = {
      'Authorization': 'Bearer ' + token,
      'Accept': 'application/json',
      'Content-Type': 'application/text'
    };
    var options = {
      'method': 'post',
      'headers': headers,
      'payload': query,
      'muteHttpExceptions': true
    };






    





  // let myHeaders = {
  //   "Accept": "application/json",
  //   "Authorization": "Bearer " + token
  // };



  // let requestOptions = {
  //   method: 'Get',
  //   headers: myHeaders,
  //   muteHttpExceptions: true
  // };

  let response = UrlFetchApp.fetch(url, options);
  let result = response.getContentText();
  let resultObj = JSON.parse(result);

  Logger.log(resultObj)

}





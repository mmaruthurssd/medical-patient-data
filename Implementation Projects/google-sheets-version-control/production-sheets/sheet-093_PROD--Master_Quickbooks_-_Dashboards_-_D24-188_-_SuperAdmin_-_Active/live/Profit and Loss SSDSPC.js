

const QB_PROFIT_LOSS_SHEET_NAME = "Profit & Loss"

//9130357785751186




function onOpen() {
  let ui = SpreadsheetApp.getUi();
  let menu = ui.createMenu("Custom");

  menu.addItem("Fetch Expenses", "showInputBoxQbProcess").addToUi()

  menu.addItem("Create QB Sheet", "createBankSheetAndFolder").addToUi()
}





function showInputBoxQbProcess() {
  let ui = SpreadsheetApp.getUi();

  let result = ui.prompt(
    'Input Year',
    'Input:',
    ui.ButtonSet.OK_CANCEL);

  let button = result.getSelectedButton();
  let year = result.getResponseText();
  if (button == ui.Button.OK) {

    if (year > 0) {
      try {
        fetchQbExpensesSsdspc(year)
      } catch (err) { }

      try {
        fetchQbExpensesAVAMain(year)
      } catch (err) { }


      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const dataUpdateLog = ss.getSheetByName("Data Update Log")
      dataUpdateLog.getRange("D2").setValue(new Date())

    } else { ui.alert("Error:\nInvalid Input!") }
  }
}







//currently running this manually and changing the year manually

function fetchQbExpensesSsdspc(year) {

  //year = 2024

  getNewTokenMain_()



  let apiSS = SpreadsheetApp.openById(VENDOR_SS_ID)
  let apiDetailSheet = apiSS.getSheetByName(API_DETAILS_SHEET);
  let token = apiDetailSheet.getRange("B2").getValue();








  let myHeaders = {
    "Accept": "application/json",
    "Authorization": "Bearer " + token
  };

  //let date = new Date();


  //let endDate = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate()
  let endDate = year + "-12-31"

  let url = "https://quickbooks.api.intuit.com/v3/company/9130351010041306/reports/ProfitAndLossDetail?start_date=" + year + "-1-1&end_date=" + endDate;



  let requestOptions = {
    method: 'Get',
    headers: myHeaders,
    muteHttpExceptions: true
  };

  let response = UrlFetchApp.fetch(url, requestOptions);
  //Logger.log(response)
  let result = response.getContentText();
  //Logger.log(result)
  let resultObj = JSON.parse(result);

  //Logger.log(resultObj)






  let ss = SpreadsheetApp.getActiveSpreadsheet()
  let sheet = ss.getSheetByName(QB_PROFIT_LOSS_SHEET_NAME);



  //let allData = sheet.getRange(2, 1, sheet.getLastRow() - 1, 7).getValues().filter(r => (r[0] != "" && r[0] != null && r[0].getFullYear() != year) || r[1] == "SSDSPC")

  //Logger.log(allData)
  let allData = [];

  if (sheet.getLastRow() > 1) {
    allData = sheet.getRange(2, 1, sheet.getLastRow() - 1, 7).getValues().filter(r => (r[0] != "" && r[0] != null && r[0].getFullYear() != year) || r[1] != "SSDSPC")
  }

  resultObj.Rows.Row.forEach(row => {
    try {

      //Logger.log(row)
      try {
        //Logger.log("0) " + row.Header.ColData[0].value)
      } catch (logErr) { Logger.log(logErr) }



      if (row.Header && row.Header.ColData[0].value == "Ordinary Income/Expenses") {
        row.Rows.Row.forEach(innerRow => {


          innerRow.Rows.Row.forEach(inner2ndRow => {

            inner2ndRow.Rows.Row.forEach(inner3rdRow => {

              if (inner3rdRow.Header.ColData[0].value == "4001 Sales") {
                allData = processRawSSDSPCData_(inner3rdRow, allData)

              }

            })

          })

        })
      }




      if (row.Header && row.Header.ColData[0].value == "5030.3 Skin Substitutes" || row.Header && row.Header.ColData[0].value == "5030.2 Instruments" || row.Header && row.Header.ColData[0].value == "5030 Medical Supplies") {


        row.Rows.Row.forEach(lastRow => {

          let bankName = lastRow.ColData[7].value;
          if (lastRow.ColData[7].value.includes(":")) {
            bankName = lastRow.ColData[7].value.split(":")[1].trim()
          }
          let newRow = [lastRow.ColData[0].value, "SSDSPC", row.Header.ColData[0].value, lastRow.ColData[1].value, lastRow.ColData[3].value, bankName, lastRow.ColData[8].value]

          allData.push(newRow)

        })
      }



      if (row.Header && row.Header.ColData[0].value == "Expenses") {

        row.Rows.Row.forEach(innerRow => {

          //Logger.log("2) " + innerRow.Header.ColData[0].value)

          if (innerRow.Header && (innerRow.Header.ColData[0].value == "5001 5001 Cost of Labor" || innerRow.Header.ColData[0].value == "5001.1 5001.1 Employee Wages" || innerRow.Header.ColData[0].value == "5001.1.1 Clinical Employee Wages" || innerRow.Header.ColData[0].value == "5001.1.2 Non-Clinical Employee Wage" || innerRow.Header.ColData[0].value == "500 500 Expenses")) {
            allData = processRawSSDSPCData_(innerRow, allData)
          }
        })
      }


      if (row.Header && (row.Header.ColData[0].value == "5001.3 5001.3 Employee Withholding Taxes")) {
        //allData = processRawSSDSPCData_(row, allData)

        row.Rows.Row.forEach(innerRow => {
          //allData = processRawSSDSPCData_(innerRow, allData)
          if (innerRow.Header && (innerRow.Header.ColData[0].value == "5001.3.1 Clinical Employee Withholding Taxes" || innerRow.Header.ColData[0].value == "5001.3.2 Non-Clinical Employee Withholding Taxes")) {
            allData = processRawSSDSPCData_(innerRow, allData)
          }
        })
      }



      if (row.Header && (row.Header.ColData[0].value == "5001.16 5001.16 Payroll Processing Fees" || row.Header.ColData[0].value == "5001.2 5001.2 Employer Taxes" || row.Header.ColData[0].value == "5001.3 5001.3 Employee Withholding Taxes" || row.Header.ColData[0].value == "5001.4 5001.4 Employee Benefits" || row.Header.ColData[0].value == "5001.4.2 5001.4.2. Employee Medical Insurance" || row.Header.ColData[0].value == "5001.4.3 5001.4.3. Employee Other Insurance" || row.Header.ColData[0].value == "5001.5 5001.5 Child Support Garnishment" || row.Header.ColData[0].value == "5001.6 Profit Sharing" || row.Header.ColData[0].value == "6010 5001.20 Retirement Plan Administrative Fees")) {
        allData = processRawSSDSPCData_(row, allData)
      }



      if (row.Header && (row.Header.ColData[0].value == "5002 1099 Contractor Employees" || row.Header.ColData[0].value == "5002.2 SSD Non-IT")) {
        allData = processRawSSDSPCData_(row, allData)
      }




      if (row.Header && (row.Header.ColData[0].value == "5003 Advertising and Marketing" || row.Header.ColData[0].value == "5003.2 Client Gifts" || row.Header.ColData[0].value == "5003.4 Websites and Domains")) {
        allData = processRawSSDSPCData_(row, allData)
      }



      if (row.Header && (row.Header.ColData[0].value == "5004 Local Travel (Stipend, Mileage)")) {
        allData = processRawSSDSPCData_(row, allData)
      }



      if (row.Header && (row.Header.ColData[0].value == "5005 Working Lunches for Staff")) {
        allData = processRawSSDSPCData_(row, allData)
      }




      if (row.Header && (row.Header.ColData[0].value == "5007 Insurance" || row.Header.ColData[0].value == "5007.1 Liability Insurance" || row.Header.ColData[0].value == "5007.3 Malpractice Insurance")) {
        allData = processRawSSDSPCData_(row, allData)
      }




      if (row.Header && (row.Header.ColData[0].value == "5009 Travel" || row.Header.ColData[0].value == "5009.2 Lodging")) {
        allData = processRawSSDSPCData_(row, allData)
      }



      if (row.Header && row.Header.ColData[0].value == "5031 Building Rent") {
        allData = processRawSSDSPCData_(row, allData)
      }



      if (row.Header && row.Header.ColData[0].value == "6070 5006 Software and Software Subscriptions") {
        allData = processRawSSDSPCData_(row, allData)
      }


      if (row.Header && row.Header.ColData[0].value == "5012 Non-Capitalized Furniture and Equipment") {
        allData = processRawSSDSPCData_(row, allData)
      }


      if (row.Header && row.Header.ColData[0].value == "5014 Bank Fees") {
        allData = processRawSSDSPCData_(row, allData)
      }


      if (row.Header && row.Header.ColData[0].value == "5013 Office Supplies") {
        allData = processRawSSDSPCData_(row, allData)
      }



      if (row.Header && row.Header.ColData[0].value == "5016 Miscellaneous Expense") {
        allData = processRawSSDSPCData_(row, allData)
      }


      if (row.Header && row.Header.ColData[0].value == "5017 Taxes Paid") {
        allData = processRawSSDSPCData_(row, allData)
      }



      if (row.Header && row.Header.ColData[0].value == "5019 Professional Fees") {
        allData = processRawSSDSPCData_(row, allData)
      }


      if (row.Header && row.Header.ColData[0].value == "5020 Interest Expense") {
        allData = processRawSSDSPCData_(row, allData)
      }


      if (row.Header && row.Header.ColData[0].value == "5021 Medical Billing Service") {
        allData = processRawSSDSPCData_(row, allData)
      }



      if (row.Header && row.Header.ColData[0].value == "5023 Repair and Maintenance") {
        allData = processRawSSDSPCData_(row, allData)
      }


      if (row.Header && row.Header.ColData[0].value == "5025 Charitable Donations") {
        allData = processRawSSDSPCData_(row, allData)
      }


      if (row.Header && row.Header.ColData[0].value == "5026 Utilities") {
        allData = processRawSSDSPCData_(row, allData)
      }


      if (row.Header && row.Header.ColData[0].value == "5028 Amortization Expense") {
        allData = processRawSSDSPCData_(row, allData)
      }


      if (row.Header && row.Header.ColData[0].value == "5032 Equipment Rental") {
        allData = processRawSSDSPCData_(row, allData)
      }


      if (row.Header && row.Header.ColData[0].value == "7000 5038 Dues & Subscriptions") {
        allData = processRawSSDSPCData_(row, allData)
      }



      if (row.Header && row.Header.ColData[0].value == "7100 5033 Licenses & Permits") {
        allData = processRawSSDSPCData_(row, allData)
      }


      if (row.Header && row.Header.ColData[0].value == "7150 5034 Postage & Delivery") {
        allData = processRawSSDSPCData_(row, allData)
      }


      if (row.Header && row.Header.ColData[0].value == "7280 5039 Uniforms") {
        allData = processRawSSDSPCData_(row, allData)
      }





    } catch (err) { }

  })





  if (allData.length > 0) {
    sheet.getRange(2, 1, allData.length, allData[0].length).setValues(allData)
  }




}






function processRawSSDSPCData_(row, allData) {
  row.Rows.Row.forEach(lastRow => {

    let bankName = lastRow.ColData[7].value;
    if (lastRow.ColData[7].value.includes(":")) {
      bankName = lastRow.ColData[7].value.split(":")[1].trim()
    }
    let newRow = [lastRow.ColData[0].value, "SSDSPC", row.Header.ColData[0].value, lastRow.ColData[1].value, lastRow.ColData[3].value, bankName, lastRow.ColData[8].value]

    allData.push(newRow)

  })


  return allData
}











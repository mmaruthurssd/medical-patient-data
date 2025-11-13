function fetchPLMonthlyAVAMain(year) {

  //year = 2025

  getNewTokenMainAVA_()


  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("QB P&L");

  let vendorSS = SpreadsheetApp.openById(VENDOR_SS_ID);
  let apiDetailSheet = vendorSS.getSheetByName("AVA API Details");
  //let apiDetailSheet = ss.getSheetByName(API_DETAILS_SHEET);
  let token = apiDetailSheet.getRange("B2").getValue();


  let myHeaders = {
    "Accept": "application/json",
    "Authorization": "Bearer " + token
  };

  //let date = new Date();


  //let endDate = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate()
  let endDate = year + "-12-31"

  let url = "https://quickbooks.api.intuit.com/v3/company/9130357785751186/reports/ProfitAndLossDetail?start_date=" + year + "-1-1&end_date=" + endDate;



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





  let allData = sheet.getRange(2, 1, sheet.getLastRow() - 1, 7).getValues().filter(r => (r[0] != "" && r[0] != null && r[0].getFullYear() != year) || r[1] == "SSDSPC")



  resultObj.Rows.Row.forEach(row => {
    //try {

    if (row.hasOwnProperty("Rows") && row.Rows.hasOwnProperty("Row")) {
      allData = processRows_(row, allData)
    } else {

      try {
        let bankName = row.ColData[7].value;
        if (row.ColData[7].value.includes(":")) {
          bankName = row.ColData[7].value.split(":")[1].trim()
        }
        let newRow = [row.ColData[0].value, "AVA Lee", resultObj.Header.ColData[0].value, row.ColData[1].value, row.ColData[3].value, bankName, row.ColData[8].value]

        allData.push(newRow)
      } catch (err) { }
    }

    //} catch (err) { Logger.log(err) }

  })



  //Logger.log(allData)

  if (allData.length > 0) {
    sheet.getRange(2, 1, allData.length, allData[0].length).setValues(allData)
  }




}





function processRows_(row, allData) {

  row.Rows.Row.forEach(innerRow => {
    if (innerRow.hasOwnProperty("Rows") && innerRow.Rows.hasOwnProperty("Row")) {
      processRows_(innerRow, allData)

    } else {
      let bankName = innerRow.ColData[7].value;
      if (innerRow.ColData[7].value.includes(":")) {
        bankName = innerRow.ColData[7].value.split(":")[1].trim()
      }
      //Logger.log(innerRow)
      let newRow = [innerRow.ColData[0].value, "AVA Lee", row.Header.ColData[0].value, innerRow.ColData[1].value, innerRow.ColData[3].value, bankName, innerRow.ColData[8].value]

      allData.push(newRow)
    }


  })


  //Logger.log(allData)
  return allData
}





function process5000Expenses_New(innerRow, allData) {



  innerRow.Rows.Row.forEach(inner4thLastRow => {
    //Logger.log("44) " + inner4thLastRow.Header.ColData[0].value)

    //Logger.log(inner4thLastRow)

    try {


      if (inner4thLastRow.Header.ColData[0].value == "5001.1 Employee Wages" || inner4thLastRow.Header.ColData[0].value == "5001.3 Employee Withholding Taxes") {

        inner4thLastRow.Rows.Row.forEach(inner2ndRow => {

          inner2ndRow.Rows.Row.forEach(lastRow => {
            let bankName = lastRow.ColData[7].value;
            if (lastRow.ColData[7].value.includes(":")) {
              bankName = lastRow.ColData[7].value.split(":")[1].trim()
            }
            let newRow = [lastRow.ColData[0].value, "AVA Lee", inner2ndRow.Header.ColData[0].value, lastRow.ColData[1].value, lastRow.ColData[3].value, bankName, lastRow.ColData[8].value]

            allData.push(newRow)

          })
        })
      } else {


        inner4thLastRow.Rows.Row.forEach(lastRow => {
          let bankName = lastRow.ColData[7].value;
          if (lastRow.ColData[7].value.includes(":")) {
            bankName = lastRow.ColData[7].value.split(":")[1].trim()
          }
          let newRow = [lastRow.ColData[0].value, "AVA Lee", inner4thLastRow.Header.ColData[0].value, lastRow.ColData[1].value, lastRow.ColData[3].value, bankName, lastRow.ColData[8].value]

          allData.push(newRow)
        })
      }
    } catch (err) { }
  })


  return allData
}






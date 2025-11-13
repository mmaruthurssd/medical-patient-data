function fetchPLMonthlySSDMain(year) {

  //year=2025

  getNewTokenMain_()


  let vendorSS = SpreadsheetApp.openById(VENDOR_SS_ID);
  let apiDetailSheet = vendorSS.getSheetByName("SSD API Details");
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
  let result = response.getContentText();
  let resultObj = JSON.parse(result);

  //Logger.log(resultObj)



  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("QB P&L");


  let allData = sheet.getRange(2, 1, sheet.getLastRow() - 1, 7).getValues().filter(r => (r[0] != "" && r[0] != null && r[0].getFullYear() != year) || r[1] == "AVA Lee")



  resultObj.Rows.Row.forEach(row => {
    try {
      if (row.hasOwnProperty("Rows") && row.Rows.hasOwnProperty("Row")) {
        allData = processSSDRows_(row, allData)
      } else {

        try {
          let bankName = row.ColData[7].value;
          if (row.ColData[7].value.includes(":")) {
            bankName = row.ColData[7].value.split(":")[1].trim()
          }
          let newRow = [row.ColData[0].value, "SSDSPC", resultObj.Header.ColData[0].value, row.ColData[1].value, row.ColData[3].value, bankName, row.ColData[8].value]

          allData.push(newRow)
        } catch (err) { }
      }
    } catch (err) { }
  })





  if (allData.length > 0) {
    sheet.getRange(2, 1, allData.length, allData[0].length).setValues(allData)
  }




}





function processSSDRows_(row, allData) {

  row.Rows.Row.forEach(innerRow => {
    if (innerRow.hasOwnProperty("Rows") && innerRow.Rows.hasOwnProperty("Row")) {
      processSSDRows_(innerRow, allData)

    } else {
      let bankName = innerRow.ColData[7].value;
      if (innerRow.ColData[7].value.includes(":")) {
        bankName = innerRow.ColData[7].value.split(":")[1].trim()
      }
      //Logger.log(innerRow)
      let newRow = [innerRow.ColData[0].value, "SSDSPC", row.Header.ColData[0].value, innerRow.ColData[1].value, innerRow.ColData[3].value, bankName, innerRow.ColData[8].value]

      allData.push(newRow)
    }


  })


  //Logger.log(allData)
  return allData
}






//currently running this manually and changing the year manually
function fetchQbExpensesAVAMain(year) {

  year = 2025


  let newDate = new Date(year, 0, 9)

  getNewTokenMainAVA_()
  //return



  let apiSS = SpreadsheetApp.openById(FINANCIAL_SS_ID)
  let apiDetailSheet = apiSS.getSheetByName(API_DETAILS_SHEET);
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

  //Logger.log(JSON.stringify(resultObj))


  // let doc = DocumentApp.openById("1bTjWm4G_AoyIRbePyFkFJsZoh8GxknxpLCDUcZubY_Y");

  // let body = doc.getBody()
  // body.replaceText("{{Here}}", result)
  // doc.saveAndClose()




  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(QB_PROFIT_LOSS_SHEET_NAME);


  let allData = sheet.getRange(2, 1, sheet.getLastRow() - 1, 7).getValues().filter(r => (r[0] != "" && r[0] != null && r[0].getFullYear() != year) || r[1] != "AVA Lee")

  //Logger.log(allData)
  //let allData = [];

  //Logger.log(resultObj)

  resultObj.Rows.Row.forEach(row => {
    try {


      Logger.log(row)
      Logger.log("1) " + row.Header.ColData[0].value)

      if (row.Header.ColData[0].value == "Ordinary Income/Expenses") {

        //Logger.log("1) " + row.Header.ColData[0].value)
        row.Rows.Row.forEach(inRow => {

          Logger.log("2) " + inRow.Header.ColData[0].value)
          //Logger.log(inRow)

          if (inRow.Header.ColData[0].value == "Expenses") {
            inRow.Rows.Row.forEach(innerRow => {
              Logger.log("3) " + innerRow.Header.ColData[0].value)

              if (innerRow.Header.ColData[0].value == "5000 Expenses") {

                allData = process5001Expenses_(innerRow, allData, newDate)

              }


            })
          }


        })

      }

    } catch (err) { Logger.log(err) }

  })



  //Logger.log(allData)

  if (allData.length > 0) {
    sheet.getRange(2, 1, allData.length, allData[0].length).setValues(allData)
  }




}
















function process5001Expenses_(innerRow, allData, newDate) {





  innerRow.Rows.Row.forEach(inner4thLastRow => {
    //Logger.log("44) " + inner4thLastRow.Header.ColData[0].value)


    if (inner4thLastRow.Header.ColData[0].value == "5001 Cost of Labor") {



      inner4thLastRow.Rows.Row.forEach(inner3rdRow => {


        try {

          if (inner3rdRow.Header.ColData[0].value == "5001.1 Employee Wages" || inner3rdRow.Header.ColData[0].value == "5001.3 Employee Withholding Taxes") {

            inner3rdRow.Rows.Row.forEach(inner2ndRow => {
              let newRow = [newDate, "AVA Lee", inner2ndRow.Summary.ColData[0].value, "", "", "", inner2ndRow.Summary.ColData[8].value]
              allData.push(newRow)

            })


          } else if (inner3rdRow.Header.ColData[0].value == "5001.2 Employer Taxes" || inner3rdRow.Header.ColData[0].value == "5001.5 Child Support Garnishment" || inner3rdRow.Header.ColData[0].value == "5001.16 Payroll Processing Fees" || inner3rdRow.Header.ColData[0].value == "5001.4 Employee Benefits" || inner3rdRow.Header.ColData[0].value == "5001.4.1. Employee 401k Plan") {

            let newRow = [newDate, "AVA Lee", inner3rdRow.Summary.ColData[0].value, "", "", "", inner3rdRow.Summary.ColData[8].value]
            allData.push(newRow)


          } else {

            inner3rdRow.Rows.Row.forEach(inner1stRow => {
              let newRow = [newDate, "AVA Lee", inner1stRow.Summary.ColData[0].value, "", "", "", inner1stRow.Summary.ColData[8].value]
              allData.push(newRow)

            })



          }


        } catch (err) { }

      })
    } else if (inner4thLastRow.Header.ColData[0].value == "5001.5 Child Support Garnishment") {

      //Logger.log(inner4thLastRow.Summary)
      let newRow = [newDate, "AVA Lee", inner4thLastRow.Summary.ColData[0].value, "", "", "", inner4thLastRow.Summary.ColData[8].value]
      allData.push(newRow)


    }


  })


  return allData
}














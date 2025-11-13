

const QB_PAYROLL_SHEET_NAME = "Quickbooks Payroll Raw Data"

//9130357785751186




function fetchQbPayrollAVAMain(year) {

  //year = 2025

  getNewTokenMainAVA_()


  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(QB_PAYROLL_SHEET_NAME);



  let ssAPI = SpreadsheetApp.openById(VENDOR_SS_ID);
  let apiDetailSheet = ssAPI.getSheetByName("AVA API Details");
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






  let allData = sheet.getRange(2, 1, sheet.getLastRow() - 1, 7).getValues().filter(r => (r[0] != "" && r[0] != null && r[0].getFullYear() != year) || r[1] == "SSDSPC")

  //Logger.log(allData)
  //let allData = [];

  //Logger.log(resultObj)

  resultObj.Rows.Row.forEach(row => {
    try {


      //Logger.log(row)
      //Logger.log("1) " + row.Header.ColData[0].value)

      if (row.Header.ColData[0].value == "Ordinary Income/Expenses") {

        //Logger.log("1) " + row.Header.ColData[0].value)
        row.Rows.Row.forEach(inRow => {

          //Logger.log("2) " + inRow.Header.ColData[0].value)
          //Logger.log(inRow)

          if (inRow.Header.ColData[0].value == "Expenses") {
            inRow.Rows.Row.forEach(innerRow => {
              //Logger.log("3) " + innerRow.Header.ColData[0].value)

              if (innerRow.Header.ColData[0].value == "5000 Expenses") {



                allData = process5000Expenses_(innerRow, allData)

              } else if (innerRow.Header.ColData[0].value == "5100 Provider Expenses") {

                //Logger.log("Yes")

                allData = process5100Expenses_(innerRow, allData)

              } else if (innerRow.Header.ColData[0].value == "5200 Officer Expenses") {

                allData = process5200Expenses_(innerRow, allData)

              }



            })
          }


        })

      } else if (row.Header.ColData[0].value == "5100 Provider Expenses") {
        //Logger.log("Yes:  5100 Provider Expenses")
        allData = process5100Expenses_(row, allData)
      }

    } catch (err) { Logger.log(err) }

  })



  //Logger.log(allData)

  if (allData.length > 0) {
    sheet.getRange(2, 1, allData.length, allData[0].length).setValues(allData)
  }




}




function process5200Expenses_(innerRow, allData) {
  innerRow.Rows.Row.forEach(inner4thLastRow => {
    //Logger.log("4) " + inner4thLastRow.Header.ColData[0].value)

    if (inner4thLastRow.Header.ColData[0].value == "5200.3 Officer Benefits") {

      inner4thLastRow.Rows.Row.forEach(inner3rdLastRow => {
        inner3rdLastRow.Rows.Row.forEach(lastRow => {

          let bankName = lastRow.ColData[7].value;
          if (lastRow.ColData[7].value.includes(":")) {
            bankName = lastRow.ColData[7].value.split(":")[1].trim()
          }

          let newRow = [lastRow.ColData[0].value, "AVA Lee", inner3rdLastRow.Header.ColData[0].value, lastRow.ColData[1].value, lastRow.ColData[3].value, bankName, lastRow.ColData[8].value]

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
  })

  return allData
}




function process5100Expenses_(innerRow, allData) {
  innerRow.Rows.Row.forEach(inner4thLastRow => {
    //Logger.log("44) " + inner4thLastRow.Header.ColData[0].value)
    inner4thLastRow.Rows.Row.forEach(lastRow => {


      let bankName = lastRow.ColData[7].value;
      if (lastRow.ColData[7].value.includes(":")) {
        bankName = lastRow.ColData[7].value.split(":")[1].trim()
      }

      let newRow = [lastRow.ColData[0].value, "AVA Lee", inner4thLastRow.Header.ColData[0].value, lastRow.ColData[1].value, lastRow.ColData[3].value, bankName, lastRow.ColData[8].value]

      allData.push(newRow)

    })
  })

  return allData
}




function process5000Expenses_(innerRow, allData) {



  innerRow.Rows.Row.forEach(inner4thLastRow => {
    //Logger.log("44) " + inner4thLastRow.Header.ColData[0].value)

    //Logger.log(inner4thLastRow)

    try {


      if (inner4thLastRow.Header.ColData[0].value == "5001.1 Employee Wages" || inner4thLastRow.Header.ColData[0].value == "5001.3 Employee Withholding Taxes") {


        //Logger.log("Yes this is: " + inner4thLastRow.Header.ColData[0].value)

        inner4thLastRow.Rows.Row.forEach(inner2ndRow => {
          //Logger.log(inner2ndRow)
          //Logger.log("66) " + inner2ndRow.Header.ColData[0].value)

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
          //Logger.log("77) " + lastRow.Header.ColData[0].value)

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




function process5000Expenses___Test(innerRow, allData) {

  //Logger.log(innerRow)
  //Logger.log(innerRow.Rows.Row)

  // innerRow.Rows.Row.forEach(testRow => {
  //   Logger.log(testRow)
  // })

  innerRow.Rows.Row.forEach(inner4thLastRow => {
    Logger.log("4) " + inner4thLastRow.Header.ColData[0].value)

    //Logger.log(inner4thLastRow)

    try {

      if (inner4thLastRow.Header.ColData[0].value == "5001 Cost of Labor") {
        Logger.log("Yes this is: 5001 Cost of Labor")


        inner4thLastRow.Rows.Row.forEach(inner3rdLastRow => {
          Logger.log("5) " + inner3rdLastRow.Header.ColData[0].value)

          if (inner3rdLastRow.Header.ColData[0].value == "5001.1 Employee Wages" || inner3rdLastRow.Header.ColData[0].value == "5001.3 Employee Withholding Taxes") {


            Logger.log("Yes this is: " + inner3rdLastRow.Header.ColData[0].value)

            inner3rdLastRow.Rows.Row.forEach(inner2ndRow => {
              //Logger.log(inner2ndRow)
              //Logger.log("6) " + inner2ndRow.Header.ColData[0].value)

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


            inner3rdLastRow.Rows.Row.forEach(lastRow => {


              let bankName = lastRow.ColData[7].value;
              if (lastRow.ColData[7].value.includes(":")) {
                bankName = lastRow.ColData[7].value.split(":")[1].trim()
              }

              let newRow = [lastRow.ColData[0].value, "AVA Lee", inner3rdLastRow.Header.ColData[0].value, lastRow.ColData[1].value, lastRow.ColData[3].value, bankName, lastRow.ColData[8].value]

              allData.push(newRow)

            })

          }
        })
      }

    } catch (err) { }
  })


  return allData
}





function fetchQbPayrollMain(year) {

  //year = 2024

  //getNewTokenMain_()


  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(QB_PAYROLL_SHEET_NAME);


  let apiDetailSheet = ss.getSheetByName(API_DETAILS_SHEET);
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

  //Logger.log(resultObj)






  let allData = sheet.getRange(2, 1, sheet.getLastRow() - 1, 7).getValues().filter(r => (r[0] != "" && r[0] != null && r[0].getFullYear() != year) || r[1] == "SSDSPC")

  //Logger.log(allData)
  //let allData = [];

  resultObj.Rows.Row.forEach(row => {
    try {


      Logger.log(row)

      Logger.log("1) " + row.Header.ColData[0].value)
      if (row.Header.ColData[0].value == "Expenses") {

        Logger.log("1) " + row.Header.ColData[0].value)
        row.Rows.Row.forEach(inRow => {

          Logger.log("2) " + inRow.Header.ColData[0].value)
          //Logger.log(inRow)

          if (inRow.Header.ColData[0].value == "500 Expenses" || inRow.Header.ColData[0].value == "5001.3 Employee Withholding Taxes") {

            //Logger.log(inRow.Header.ColData[0].value)

            inRow.Rows.Row.forEach(innerRow => {

              //Logger.log("Test " + innerRow.Header.ColData[0].value)

              innerRow.Rows.Row.forEach(lastRow => {



                let bankName = lastRow.ColData[7].value;
                if (lastRow.ColData[7].value.includes(":")) {
                  bankName = lastRow.ColData[7].value.split(":")[1].trim()
                }

                let newRow = [lastRow.ColData[0].value, "AVA Lee", innerRow.Header.ColData[0].value, lastRow.ColData[1].value, lastRow.ColData[3].value, bankName, lastRow.ColData[8].value]

                allData.push(newRow)


              })

            })
          } else {
            inRow.Rows.Row.forEach(lastRow => {



              let bankName = lastRow.ColData[7].value;
              if (lastRow.ColData[7].value.includes(":")) {
                bankName = lastRow.ColData[7].value.split(":")[1].trim()
              }

              let newRow = [lastRow.ColData[0].value, "AVA Lee", inRow.Header.ColData[0].value, lastRow.ColData[1].value, lastRow.ColData[3].value, bankName, lastRow.ColData[8].value]

              allData.push(newRow)


            })
          }
        })
      } else if (row.Header.ColData[0].value == "5001.5 Child Support Garnishment") {

        row.Rows.Row.forEach(lastRow => {



          let bankName = lastRow.ColData[7].value;
          if (lastRow.ColData[7].value.includes(":")) {
            bankName = lastRow.ColData[7].value.split(":")[1].trim()
          }

          let newRow = [lastRow.ColData[0].value, "AVA Lee", row.Header.ColData[0].value, lastRow.ColData[1].value, lastRow.ColData[3].value, bankName, lastRow.ColData[8].value]

          allData.push(newRow)


        })

      } else if (row.Header.ColData[0].value == "5100 Provider Expenses") {
        row.Rows.Row.forEach(inRow => {
          //Logger.log("Pro Test: " + inRow.Header.ColData[0].value)
          if (inRow.Header.ColData[0].value == "5100.3 Provider Benefits") {

            inRow.Rows.Row.forEach(innerRow => {
              innerRow.Rows.Row.forEach(lastRow => {
                let bankName = lastRow.ColData[7].value;
                if (lastRow.ColData[7].value.includes(":")) {
                  bankName = lastRow.ColData[7].value.split(":")[1].trim()
                }

                let newRow = [lastRow.ColData[0].value, "AVA Lee", innerRow.Header.ColData[0].value, lastRow.ColData[1].value, lastRow.ColData[3].value, bankName, lastRow.ColData[8].value]

                allData.push(newRow)
              })
            })

          } else {

            inRow.Rows.Row.forEach(lastRow => {



              let bankName = lastRow.ColData[7].value;
              if (lastRow.ColData[7].value.includes(":")) {
                bankName = lastRow.ColData[7].value.split(":")[1].trim()
              }

              let newRow = [lastRow.ColData[0].value, "AVA Lee", inRow.Header.ColData[0].value, lastRow.ColData[1].value, lastRow.ColData[3].value, bankName, lastRow.ColData[8].value]

              allData.push(newRow)


            })

          }
        })

      } else if (row.Header.ColData[0].value == "5200 Officer Expenses" || row.Header.ColData[0].value == "5200.1 Officer Wages" || row.Header.ColData[0].value == "5200.2 Officer Tax Withholding" || row.Header.ColData[0].value == "5200.4 Other Officer Expenses") {
        row.Rows.Row.forEach(lastRow => {



          let bankName = lastRow.ColData[7].value;
          if (lastRow.ColData[7].value.includes(":")) {
            bankName = lastRow.ColData[7].value.split(":")[1].trim()
          }

          let newRow = [lastRow.ColData[0].value, "AVA Lee", row.Header.ColData[0].value, lastRow.ColData[1].value, lastRow.ColData[3].value, bankName, lastRow.ColData[8].value]

          allData.push(newRow)


        })

      } else if (row.Header.ColData[0].value == "5200.3 Officer Benefits") {
        row.Rows.Row.forEach(inRow => {

          inRow.Rows.Row.forEach(lastRow => {

            let bankName = lastRow.ColData[7].value;
            if (lastRow.ColData[7].value.includes(":")) {
              bankName = lastRow.ColData[7].value.split(":")[1].trim()
            }

            let newRow = [lastRow.ColData[0].value, "AVA Lee", inRow.Header.ColData[0].value, lastRow.ColData[1].value, lastRow.ColData[3].value, bankName, lastRow.ColData[8].value]

            allData.push(newRow)

          })
        })
      }

    } catch (err) { }

  })





  if (allData.length > 0) {
    sheet.getRange(2, 1, allData.length, allData[0].length).setValues(allData)
  }




}











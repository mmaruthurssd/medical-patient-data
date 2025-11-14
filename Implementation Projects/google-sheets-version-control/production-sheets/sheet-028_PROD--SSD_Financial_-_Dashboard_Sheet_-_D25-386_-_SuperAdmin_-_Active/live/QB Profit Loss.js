
const QB_DATA_SHEET_NAME = "Quickbooks Revenue Raw Data"



function onOpen() {
  let ui = SpreadsheetApp.getUi();
  let menu = ui.createMenu("Custom");

  menu.addItem("Fetch Profit Loss Details", "showInputBox").addToUi()
}


function showInputBox() {
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
        fetchQuickbookProfitLossMain(year)
      } catch (err) { }

      try {
        fetchQuickbookProfitLossMainSkin(year)
      } catch (err) { }

      try {
        fetchQbPayrollAVAMain(year)
      } catch (err) { }

      try {
        fetchPLMonthlyAVAMain(year)
      } catch (err) { }


      try {
        fetchPLMonthlySSDMain(year)
      } catch (err) { }
      
    } else { ui.alert("Error:\nInvalid Input!") }
  }
}






function fetchQuickbookProfitLossMain(year) {

  year=2025

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



  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(QB_DATA_SHEET_NAME);


  let allData = sheet.getRange(2, 1, sheet.getLastRow() - 1, 5).getValues().filter(r => r[0] != "" && r[0] != null && r[0].getFullYear() != year)

  resultObj.Rows.Row.forEach(row => {
    try {
      if (row.Header.ColData[0].value == "Ordinary Income/Expenses") {


        row.Rows.Row.forEach(inRow => {

          if (inRow.Header.ColData[0].value == "Income") {

            inRow.Rows.Row.forEach(innerRow => {
              if (innerRow.Header.ColData[0].value == "4000 Revenue") {
                innerRow.Rows.Row.forEach(row2ndlast => {


                  row2ndlast.Rows.Row.forEach(lastRow => {


                    let bankName = lastRow.ColData[7].value;
                    if (lastRow.ColData[7].value.includes(":")) {
                      bankName = lastRow.ColData[7].value.split(":")[1].trim()
                    }
                    let newRow = [lastRow.ColData[0].value, lastRow.ColData[1].value, lastRow.ColData[3].value, bankName, lastRow.ColData[8].value]

                    allData.push(newRow)
                  })
                })
              }
            })
          }
        })
      }
    } catch (err) { Logger.log(err) }
  })





  if (allData.length > 0) {
    sheet.getRange(2, 1, allData.length, allData[0].length).setValues(allData)
  }




}










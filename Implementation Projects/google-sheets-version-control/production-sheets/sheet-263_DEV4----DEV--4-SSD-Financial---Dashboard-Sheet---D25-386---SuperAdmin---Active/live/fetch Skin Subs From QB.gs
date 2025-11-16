

const QB_SKINSUBS_DATA_SHEET_NAME = "Quickbooks Skin Subs Raw Data"




function fetchQuickbookProfitLossMainSkin(year) {

  year = 2025

  //getNewTokenMain_()

  let vendorSS = SpreadsheetApp.openById(VENDOR_SS_ID);
  let apiDetailSheet = vendorSS.getSheetByName("SSD API Details");
  let token = apiDetailSheet.getRange("B2").getValue();


  let myHeaders = {
    "Accept": "application/json",
    "Authorization": "Bearer " + token
  };


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
  let sheet = ss.getSheetByName(QB_SKINSUBS_DATA_SHEET_NAME);


  let allData = sheet.getRange(2, 1, sheet.getLastRow() - 1, 5).getValues().filter(r => r[0] != "" && r[0] != null && r[0].getFullYear() != year)

  resultObj.Rows.Row.forEach(row => {
    try {

      //Logger.log(row.Header)
      if (row.Header.ColData[0].value == "5030.3 Skin Substitutes") {


        row.Rows.Row.forEach(inRow => {


          let bankName = inRow.ColData[7].value;
          if (inRow.ColData[7].value.includes(":")) {
            bankName = inRow.ColData[7].value.split(":")[1].trim()
          }
          let newRow = [inRow.ColData[0].value, inRow.ColData[1].value, inRow.ColData[3].value, bankName, inRow.ColData[8].value]

          allData.push(newRow)
          //Logger.log(newRow)

        })

      }
    } catch (err) { Logger.log(err) }
  })





  if (allData.length > 0) {
    sheet.getRange(2, 1, allData.length, allData[0].length).setValues(allData)
  }




}




function modifyTaxes() {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Paystubs Temp_");
  let allData = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();

  Logger.log(allData[0])
  let formatedDate = Utilities.formatDate(allData[0][1], "GMT+5", "yyyyMMdd")

  let objName = allData[0][0] + formatedDate
  Logger.log(formatedDate)
  Logger.log(objName)

  let finalObj = {}
  allData.forEach(row => {
    if (row[2] == 'taxes' && (row[3] == 'MED' || row[3] == 'SOC')) {
      let dateStr = Utilities.formatDate(row[1], "GMT+5", "yyyyMMdd")
      let key = row[0] + dateStr
      if (finalObj[key]) {
        finalObj[key][4] = finalObj[key][4] + row[4]
      } else {
        finalObj[key] = [row[0], row[1], row[2], "MEDplusSOC", row[4]]
      }
    }
  })

  //Logger.log(finalObj)

  //let processedData=[]
  for (let key in finalObj) {
    allData.push(finalObj[key])
  }

  if (allData.length > 0) {
    //let outputSheet = ss.getSheetByName("Modified Paystubs Temp_");
    sheet.getRange(2, 1, allData.length, allData[0].length).setValues(allData)
  }


}





























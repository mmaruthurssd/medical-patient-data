





function storePaycheck() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Pay Period Summary (Main)");
  const allData = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getValues();
  let payPeriod = sheet.getRange("F2").getValue();
  if (!payPeriod) return


  const destSS = SpreadsheetApp.openById("1h1RKULINiIqL6U-tWxYRXch3A_sPE8xZfQDUBpsAklQ");
  const destSheet = destSS.getSheetByName("Data");
  let existingData = destSheet.getRange(1, 1, destSheet.getLastRow(), 4).getValues().filter(r => r[0] != payPeriod);


  for (var i = 4; i < allData.length; i++) {
    if (allData[i][4] > 0) {
      for (var j = 4; j < allData[i].length; j++) {

        if (allData[i][j] > 0) {
          existingData.push([payPeriod, allData[i][1], allData[2][j], allData[i][j]])
        }
      }
    }
  }



  destSheet.getRange(1, 1, existingData.length, existingData[0].length).setValues(existingData)

}





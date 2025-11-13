
function archiveOldRows() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Appts X Date X Provider (Main)");

  const destSheet = ss.getSheetByName("Old Rescheduling Sheets")

  let allData = sheet.getRange(1, 3, sheet.getLastRow(), sheet.getLastColumn() - 5).getValues();
  let richCol = sheet.getRange(1, 8, sheet.getLastRow(), 1).getRichTextValues();


  let todayTime = new Date().getTime() - (24 * 60 * 60 * 1000)

  for (var i = allData.length - 1; i > 1; i--) {

    try {
      if (allData[i][0].getTime() < todayTime) {
        destSheet.appendRow(allData[i]);
        destSheet.getRange(destSheet.getLastRow(), 6).setRichTextValue(richCol[i][0]);
        sheet.deleteRows(i + 1, 1)
        //break
      }
    } catch (err) {

    }

  }
}

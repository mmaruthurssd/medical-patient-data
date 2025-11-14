


function onOpen() {
  const ui = SpreadsheetApp.getUi();
  const menu = ui.createMenu("Custom");
  menu.addItem("Send to File Management", "sendToFileManagement").addToUi();
}


function sendToFileManagement() {

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();

  const allData = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getValues();

  const destSS = SpreadsheetApp.openById(DEST_SS_ID);
  //const destSheet = destSS.getSheetByName(value);

  const allDest = {
    Dashboards: destSS.getSheetByName("Dashboards"),
    Projects: destSS.getSheetByName("Projects"),
    'Google Sheets': destSS.getSheetByName("Google Sheets"),
    Uncategorized: destSS.getSheetByName("Uncategorized"),
    'Processing Sheets': destSS.getSheetByName("Processing Sheets"),
  }


  for (var i = 2; i < allData.length; i++) {

    if (allData[i][7] != "" && allData[i][6] == "" && allData[i][8] == "") {


      //const richValue = activeSheet.getRange(row, 3).getValue();

      let name = cleanMyText(allData[i][1])

      //allDest[allData[i][7]].insertRowAfter(3);
      //allDest[allData[i][7]].getRange(4, 8).setValue(name)
      //allDest[allData[i][7]].getRange(4, 12).setValue(allData[i][2])

      let lastRow = allDest[allData[i][7]].getLastRow() + 1
      allDest[allData[i][7]].getRange(lastRow, 8).setValue(name)
      allDest[allData[i][7]].getRange(lastRow, 12).setValue(allData[i][2])

      sheet.getRange(i + 1, 9).setValue("Processing Name")

    }

  }

}




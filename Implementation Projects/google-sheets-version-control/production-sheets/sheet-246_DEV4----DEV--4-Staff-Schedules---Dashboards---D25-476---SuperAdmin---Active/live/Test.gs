

const START_ROW = 54;
const END_ROW = 594;

function addRowsSickOff() {
  let ss = SpreadsheetApp.getActiveSpreadsheet();

  let sheet = ss.getSheetByName("Schedule_Data_Admin");


  let data = sheet.getRange(START_ROW, 5, END_ROW - START_ROW + 1, 1).getValues()
  let dataDisp = sheet.getRange(START_ROW, 5, END_ROW - START_ROW + 1, 1).getDisplayValues()
  //let data = sheet.getRange(START_ROW, 5, END_ROW - START_ROW + 1, 1).getValues()


  for (var i = data.length - 2; i >= 0; i--) {
    if (dataDisp[i][0].toString().includes(" 2024")) continue
    if (isValidDate_(data[i][0])) {

      if (dataDisp[i][0] != dataDisp[i + 1][0]) {
        //sheet.insertRows(START_ROW + i, 2)
        sheet.insertRowsAfter(START_ROW + i, 2)
        sheet.getRange(START_ROW + i + 1, 5).setValue(dataDisp[i][0])
        sheet.getRange(START_ROW + i + 1, 9).setValue("Off / Sick")

      }

      sheet.getRange(START_ROW + i, 5).setValue(dataDisp[i][0])


    }
  }

}

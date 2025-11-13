
const MASTER_DAILY_LIST_SHEET = "Daily Tasks"



function onOpen() {
  const ui = SpreadsheetApp.getUi();
  const menu = ui.createMenu("Custom");

  menu.addItem("Adjust Rows", "adjustRowsMain").addToUi()
}




function createRowAdjustingTrigger() {

  let timeZone = Session.getScriptTimeZone();
  //Logger.log(timeZone)

  ScriptApp.newTrigger("processRowsWithTrigger")
    .timeBased()
    .everyDays(1)
    .inTimezone(timeZone)
    .atHour(3)
    .nearMinute(30)
    .create()


}





function processRowsWithTrigger() {

  adjustRowsMain()
  SpreadsheetApp.flush()

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(MASTER_DAILY_LIST_SHEET);

  let allData = sheet.getRange(1, 1, sheet.getLastRow(), 2).getDisplayValues();
  for (var i = 2; i < allData.length; i++) {
    if (allData[i][0] != "" && allData[i][1] != "") {
      sheet.getRange(i + 1, 6).setValue("Incomplete")
    }
  }

}


function adjustRowsMain() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(MASTER_DAILY_LIST_SHEET);

  sheet.getRange("L1").setValue(true)
  //return


  //Logger.log(sheet.getLastRow())
  let allData = sheet.getRange(1, 1, sheet.getLastRow(), 2).getDisplayValues();

  const doneObj = {}
  let count = 1
  while (count < allData.length) {
    if (allData[count][0] == "#REF!" && doneObj[count] != 3) {
      sheet.insertRowsAfter(count + 1, 10)
      allData = sheet.getRange(1, 1, sheet.getLastRow(), 2).getDisplayValues();
      if (doneObj[count]) {
        doneObj[count]++
      } else {
        doneObj[count] = 1
      }
      count = 1
    } else {
      count++
    }

  }


  SpreadsheetApp.flush();

  //return



  allData = sheet.getRange(1, 1, sheet.getLastRow(), 2).getDisplayValues();
  let emptyCount = 0;
  for (var i = allData.length - 1; i > 0; i--) {

    if (allData[i][0] == "" && allData[i][1] == "") {
      emptyCount++

      //sheet.insertRowsAfter(i + 1, 5)
    } else if (emptyCount > 3) {
      sheet.deleteRows(i + 3, emptyCount - 2)
      emptyCount = 0
    } else {
      emptyCount = 0
    }


    //Logger.log(emptyCount)

  }


  sheet.getRange("L1").setValue(false)



}






















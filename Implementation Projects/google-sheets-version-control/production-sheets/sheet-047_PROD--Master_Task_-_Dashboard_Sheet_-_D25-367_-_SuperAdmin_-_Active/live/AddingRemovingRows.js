
const MASTER_DAILY_LIST_SHEET = "Master Daily Task List"
const MASTER_DAILY_TEMP_SHEET = "Master Daily Task Templates"

const METRIC_BY_TASK_SHEET = "Metrics by Task"



function onOpen() {
  const ui = SpreadsheetApp.getUi();
  const menu = ui.createMenu("Custom");
  menu.addItem("Adjust Rows", "mainAdjustingRows").addToUi()
}




function createRowAdjustingTrigger() {

  let timeZone = Session.getScriptTimeZone();
  //Logger.log(timeZone)

  ScriptApp.newTrigger("adjustRowsInListing")
    .timeBased()
    .everyDays(1)
    .inTimezone(timeZone)
    .atHour(2)
    .nearMinute(0)
    .create()


  ScriptApp.newTrigger("adjustRowsInTemplate")
    .timeBased()
    .everyDays(1)
    .inTimezone(timeZone)
    .atHour(2)
    .nearMinute(0)
    .create()


}



function mainAdjustingRows() {

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();

  if (sheet.getName() == MASTER_DAILY_LIST_SHEET) {
    adjustRowsInListing()
  } else if (sheet.getName() == MASTER_DAILY_TEMP_SHEET) {
    adjustRowsInTemplateNow_(MASTER_DAILY_TEMP_SHEET)

  } else if (sheet.getName() == METRIC_BY_TASK_SHEET) {
    adjustRowsInTemplateNow_(METRIC_BY_TASK_SHEET)
  }

}



function adjustRowsInListing() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(MASTER_DAILY_LIST_SHEET);


  //Logger.log(sheet.getLastRow())
  let allData = sheet.getRange(1, 1, sheet.getLastRow(), 1).getDisplayValues();

  const doneObj = {}
  let count = 2
  while (count < allData.length) {
    if (allData[count][0] == "#REF!" && doneObj[count] != 3) {
      sheet.insertRowsAfter(count + 1, 15)
      allData = sheet.getRange(1, 1, sheet.getLastRow(), 1).getDisplayValues();
      if (doneObj[count]) {
        doneObj[count]++
      } else {
        doneObj[count] = 1
      }
      count = 2
    } else {
      count++
    }

  }


  SpreadsheetApp.flush()

  allData = sheet.getRange(1, 1, sheet.getLastRow(), 1).getDisplayValues();
  let emptyCount = 0;
  for (var i = allData.length - 1; i > 1; i--) {

    if (allData[i][0] == "") {
      emptyCount++

      //sheet.insertRowsAfter(i + 1, 5)
    } else if (emptyCount > 3) {
      sheet.deleteRows(i + 3, emptyCount - 2)
      emptyCount = 0
    } else {
      emptyCount = 0
    }

  }


}




function adjustRowsInTemplate() {
  adjustRowsInTemplateNow_(MASTER_DAILY_TEMP_SHEET)
  adjustRowsInTemplateNow_(METRIC_BY_TASK_SHEET)
}



function adjustRowsInTemplateNow_(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);

  //sheet.getRange("L1").setValue(true)
  //return


  //Logger.log(sheet.getLastRow())
  let allData = sheet.getRange(1, 1, sheet.getLastRow(), 2).getDisplayValues();

  const doneObj = {}
  let count = 1
  while (count < allData.length) {
    if (allData[count][0] == "#REF!" && doneObj[count] != 4) {
      sheet.insertRowsAfter(count + 1, 30)
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



  }



}


















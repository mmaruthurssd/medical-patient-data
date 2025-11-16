

const RAW_HENRY_SCHEIN_SS_ID = "13HohuyQ4eOt4GtMXlv34Bu5qkH93E6rS_1EodN8Z-0A"

const MCKESSON_ORDER_SS_ID = "1Uitdi4ZwWO-RHWThWpnjAT0luzNozpwfyae-2tVMtNI"

const NEW_MCKESSON_ORDER_SS_ID = "1pE_SNiu5HCP0iPuInydBjRy7-h5JKbmTN-N75SKWkYk"

const AMAZON_ORDER_SS_ID = "15VtJCJsqjx1i6Q3yPAmXkoHw5-MO348aDlZZOdPKoKU"

const MISC_ORDER_SS_ID = "1V2sE6NQ6Z69Mc-SiMhk3OI4ErtX9BDNnRKdwZyjQKMI"

const SAMS_CLUB_ORDER_SS_ID = "1ycfBw6dQ-9aQxL0tHnhy-r5SRqWaFYPLfMrAhleJ0sw"


const AD_SURGICAL_ORDER_SS_ID = "1SxgCTnD6LPH8YCGqYa4j4OrXLX7EmTdGptnu_4Lmf18"




//HENRY_SCHEIN_ORDER_HISTORY
//MCKESSON_ORDER_HISTORY




function onOpen() {
  let ui = SpreadsheetApp.getUi();
  let menu = ui.createMenu("Custom");
  menu.addItem("Update 'Item Order History'", "updateItemOrderHisoty").addToUi()
  menu.addItem("Fetch Supplier Bank Charges", "getSupplierChargesFromExpense").addToUi()
  //menu.addItem("Update Unique Item and Locations", "updateUniqueItems").addToUi()

  ui.createMenu('PDF Processing')
    .addItem('Run OCR & Extract Data', 'getInfoFromInvoices_MultipleInvoices')
    .addToUi();

  ui.createMenu('Test Email')
    .addItem('Send Test "Email To Staff"', 'manualTestOderUpdateEmails')
    //.addItem('Send Test "Email To Admin"', 'manualTestEmailToAdmin')
    .addToUi();
}



function updateOrderHistory() {

  try {
    getHenryScheinItemsPurchased()
  } catch (err) { }
  try {
    getMckessonOrderHistory()
  } catch (err) { }
  try {
    getAmazonHistory()
  } catch (err) { }
}


function getHenryScheinItemsPurchased() {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Non-Durable Order History");


  let range = sheet.getRange("HENRY_SCHEIN_ORDER_HISTORY")
  let existingData = range.getDisplayValues()

  let existingIds = existingData.map(r => r[0])



  let sourceSS = SpreadsheetApp.openById(RAW_HENRY_SCHEIN_SS_ID);
  let sourceSheet = sourceSS.getSheetByName("Data");

  let sourceData = sourceSheet.getRange(2, 1, sourceSheet.getLastRow() - 1, 7).getDisplayValues()


  let newData = []

  sourceData.forEach(row => {
    let indexOfId = existingIds.indexOf(row[0]);

    if (indexOfId == -1) {
      newData.push([row[0], "Henry Schein", row[2], row[1], row[3], row[4], row[6], row[5]])
    }
  })


  if (newData.length > 0) {
    let lastRow = range.getLastRow();
    sheet.insertRowsAfter(lastRow - 4, newData.length)
    sheet.getRange(lastRow - 3, 1, newData.length, newData[0].length).setValues(newData);
  }

}




function getMckessonOrderHistory() {
  //MCKESSON_ORDER_HISTORY

  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Non-Durable Order History");


  let range = sheet.getRange("MCKESSON_ORDER_HISTORY")
  let existingData = range.getDisplayValues()

  let existingIds = existingData.map(r => r[0])



  let sourceSS = SpreadsheetApp.openById(MCKESSON_ORDER_SS_ID);
  let sourceSheet = sourceSS.getSheetByName("Data");

  let sourceData = sourceSheet.getRange(2, 1, sourceSheet.getLastRow() - 1, 7).getDisplayValues()


  let newData = []

  sourceData.forEach(row => {
    let indexOfId = existingIds.indexOf(row[0]);

    if (indexOfId == -1) {
      newData.push([row[0], "Mckesson", row[1], row[2], row[4], row[3], "", row[5]])
    }
  })


  if (newData.length > 0) {
    let lastRow = range.getLastRow();
    sheet.insertRowsAfter(lastRow - 4, newData.length)
    sheet.getRange(lastRow - 3, 1, newData.length, newData[0].length).setValues(newData);
  }

}




//AMAZON_ORDER_HISTORY

function getAmazonHistory() {
  //MCKESSON_ORDER_HISTORY

  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Non-Durable Order History");


  let range = sheet.getRange("AMAZON_ORDER_HISTORY")
  let existingData = range.getDisplayValues()

  let existingIds = existingData.map(r => r[0])



  let sourceSS = SpreadsheetApp.openById(AMAZON_ORDER_SS_ID);
  let sourceSheet = sourceSS.getSheetByName("Data");

  let sourceData = sourceSheet.getRange(2, 1, sourceSheet.getLastRow() - 1, 7).getDisplayValues()


  let newData = []

  sourceData.forEach(row => {
    let indexOfId = existingIds.indexOf(row[0]);

    if (indexOfId == -1) {
      newData.push([row[0], "Amazon", row[5], row[4], row[2], row[3], row[6], row[1]])
    }
  })


  if (newData.length > 0) {
    let lastRow = range.getLastRow();
    sheet.insertRowsAfter(lastRow - 4, newData.length)
    sheet.getRange(lastRow - 3, 1, newData.length, newData[0].length).setValues(newData);
  }

}





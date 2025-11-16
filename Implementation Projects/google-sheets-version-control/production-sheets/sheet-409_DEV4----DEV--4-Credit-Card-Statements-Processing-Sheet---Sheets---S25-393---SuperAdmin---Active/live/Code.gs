

const VENDOR_SS_ID = "1W-SOL_z6tHSj3DVqrzq8DQSd1ECOrlwSCIIY0Ov-ucM";
const VENDOR_SHEET = "Credit Card Statements"



function sendDataToVendorCCDash() {

  findPayeeIds()

  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Data");


  let headings = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
  let headingsObj = {}
  headings.forEach((h, i) => {
    headingsObj[h.toString().trim()] = i
  })


  let destSS = SpreadsheetApp.openById(VENDOR_SS_ID);
  let destSheet = destSS.getSheetByName(VENDOR_SHEET);


  let allData = []

  if (sheet.getLastRow() > 1) {
    allData = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getDisplayValues();
  } else {

    destSheet.getRange(2, 1, destSheet.getLastRow() - 1, headings.length).clearContent()
    return
  }



  if (allData.length > 0) {


    let destHeadings = destSheet.getRange(1, 1, 1, headings.length).getValues()[0]
    let destHeadingsObj = {}
    destHeadings.forEach((h, i) => {
      destHeadingsObj[h.toString().trim()] = i
    })


    let newData = []

    allData.forEach(row => {
      let rowData = new Array(destHeadings.length).fill("")
      for (const key in destHeadingsObj) {
        if (headingsObj[key] || headingsObj[key] === 0) {

          rowData[destHeadingsObj[key]] = row[headingsObj[key]]

        }
      }

      newData.push(rowData)
    })


    if (newData.length > 0) {
      destSheet.getRange(2, 1, newData.length, newData[0].length).setValues(newData)
    }

    if (destSheet.getLastRow() > 2 + newData.length) {
      destSheet.getRange(2 + newData.length, 1, destSheet.getLastRow() - (1 + newData.length), destSheet.getLastColumn()).clearContent();
    }
  }
}














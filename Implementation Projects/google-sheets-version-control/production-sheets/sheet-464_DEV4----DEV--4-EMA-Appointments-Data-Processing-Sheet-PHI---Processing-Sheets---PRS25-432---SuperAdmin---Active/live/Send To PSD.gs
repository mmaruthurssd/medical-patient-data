

const PSD_SS_ID = "1vbiEkFi7gYpCQM8x6zz4BDvaK9d5j2YJz-4zy8jWSMs";
const PSD_SHEET = "Appointments";




const PPD_SS_ID = "1CB0XC0nUov2m89vSoMdDIXx8Rp5VwJP0EpTgYGk5xaE";
const PPD_SHEET = "Appointments"



/**
 * runs every hour from scripts@ssdspc.com account 
 */
function sendDataToPSD() {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("ApptsToPSD");



  let allData = []

  let headings = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
  let headingsObj = {}
  headings.forEach((h, i) => {
    headingsObj[h.toString().trim()] = i
  })

  if (sheet.getLastRow() > 1) {
    allData = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getDisplayValues().filter(r => r[0] != "" && r[1] != "");
  } else {
    return
  }

  if (allData.length == 0) return







  let newData = [];

  SpreadsheetApp.flush()

  let destSS = SpreadsheetApp.openById(PSD_SS_ID);
  let destSheet = destSS.getSheetByName(PSD_SHEET);




  let destHeadings = destSheet.getRange(1, 1, 1, destSheet.getLastColumn()).getValues()[0]
  let destHeadingsObj = {}
  destHeadings.forEach((h, i) => {
    destHeadingsObj[h.toString().trim()] = i
  })




  allData.forEach(row => {


    //let idIndex = destIds.indexOf(row[headingsObj["Appointment ID"]])

    //if (idIndex == -1) {
    let rowData = new Array(destHeadings.length).fill("")
    for (const key in destHeadingsObj) {
      if (headingsObj[key] || headingsObj[key] === 0) {
        rowData[destHeadingsObj[key]] = row[headingsObj[key]]
      }
    }

    newData.push(rowData)
    //destIds.push(row[headingsObj["Appointment ID"]])
    //}

  })



/*

  if (newData.length > 0) {

    destSheet.getRange(2, 1, newData.length, newData[0].length).setValues(newData)

    const ppdSS = SpreadsheetApp.openById(PPD_SS_ID);
    const ppdDestSheet = ppdSS.getSheetByName(PPD_SHEET);

    ppdDestSheet.getRange(2, 1, newData.length, newData[0].length).setValues(newData)


  }*/



}







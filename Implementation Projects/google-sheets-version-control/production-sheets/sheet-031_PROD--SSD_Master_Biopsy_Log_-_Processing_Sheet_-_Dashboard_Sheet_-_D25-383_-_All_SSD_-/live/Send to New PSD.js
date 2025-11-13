

const PSD_SS_ID = "1BGbjaoom9jBr3Z9LhAa8UQlzvH5XePVOfkpFPqkYhug";
const PSD_SHEET = "PathologyLog";


const PPD_SS_ID = "1CB0XC0nUov2m89vSoMdDIXx8Rp5VwJP0EpTgYGk5xaE";
const PPD_SHEET = "PathologyLog"



/**
 * runs every hour from scripts@ssdspc.com account 
 */
function sendDataToPSD() {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Export");



  let allData = []

  let headings = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
  let headingsObj = {}
  headings.forEach((h, i) => {
    headingsObj[h.toString().trim()] = i
  })

  if (sheet.getLastRow() > 1) {
    allData = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getDisplayValues().filter(row => (row[0] != "" && row[0] != null) || (row[1] != "" && row[1] != null));
  } else {
    return
  }

  //Logger.log(allData)



  if (allData.length > 0) {
    let destSS = SpreadsheetApp.openById(PSD_SS_ID);
    let destSheet = destSS.getSheetByName(PSD_SHEET);




    let destHeadings = destSheet.getRange(1, 1, 1, destSheet.getLastColumn()).getValues()[0]
    let destHeadingsObj = {}
    destHeadings.forEach((h, i) => {
      destHeadingsObj[h.toString().trim()] = i
    })





    let newData = [];

    allData.forEach(row => {



      let rowData = new Array(destHeadings.length).fill("")
      for (const key in destHeadingsObj) {
        if (headingsObj[key] || headingsObj[key] === 0) {
          rowData[destHeadingsObj[key]] = row[headingsObj[key]]
        }
      }

      newData.push(rowData)




    })



    // const ppdSS = SpreadsheetApp.openById(PPD_SS_ID);
    // const ppdDestSheet = ppdSS.getSheetByName(PPD_SHEET);

    if (destSheet.getLastRow() > 1) {
      destSheet.getRange(2, 1, destSheet.getLastRow() - 1, destSheet.getLastColumn()).clearContent();
      //ppdDestSheet.getRange(2, 1, ppdDestSheet.getLastRow() - 1, ppdDestSheet.getLastColumn()).clearContent();
    }

    if (newData.length > 0) {
      destSheet.getRange(2, 1, newData.length, newData[0].length).setValues(newData)
      //ppdDestSheet.getRange(2, 1, newData.length, newData[0].length).setValues(newData)
    }


  }


}







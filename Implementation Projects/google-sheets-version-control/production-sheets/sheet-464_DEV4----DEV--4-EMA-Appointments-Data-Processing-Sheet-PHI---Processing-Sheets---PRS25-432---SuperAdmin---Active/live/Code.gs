

const APPOINTMENTS_SS_ID = "1CBhyVOTbfeduqyBilvWBnbX1S9I1Sj9PW3BfcPO4MuI";
const PAST_APPOINTMENTS_SHEET = "CurrentAppts";
const FUTURE_APPOINTMENTS_SHEET = "FutureAppts";



function onOpen() {
  let ui = SpreadsheetApp.getUi();

  let menu = ui.createMenu("Custom");

  menu.addItem("Send Data to Appointments (Post-EMA)", "sendDataToAppointmentDash").addToUi()
  menu.addItem("Send Data to New Practice Summary Dashboard", "sendDataToPSD").addToUi()
}


/**
 * runs every hour from scripts@ssdspc.com account 
 */
function sendDataToAppointmentDash() {

  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Appointments");



  let allData = []

  let headings = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
  let headingsObj = {}
  headings.forEach((h, i) => {
    headingsObj[h.toString().trim()] = i
  })

  if (sheet.getLastRow() > 1) {
    allData = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getDisplayValues();
  } else {
    return
  }


  if (allData.length == 0) return


  let destSS = SpreadsheetApp.openById(APPOINTMENTS_SS_ID);
  let destSheetPast = destSS.getSheetByName(PAST_APPOINTMENTS_SHEET);
  let destSheetFuture = destSS.getSheetByName(FUTURE_APPOINTMENTS_SHEET);



  let destHeadingsPast = destSheetPast.getRange(1, 1, 1, destSheetPast.getLastColumn()).getValues()[0]
  let destHeadingsPastObj = {}
  destHeadingsPast.forEach((h, i) => {
    destHeadingsPastObj[h.toString().trim()] = i
  })


  let pastIds = [];
  let allPastData = []
  if (destSheetPast.getLastRow() > 1) {
    allPastData = destSheetPast.getRange(2, 1, destSheetPast.getLastRow() - 1, destSheetPast.getLastColumn()).getDisplayValues();
    pastIds = allPastData.map(r => r[destHeadingsPastObj["Appointment ID"]])
    //pastIds = destSheetPast.getRange(2, destHeadingsPastObj["Appointment ID"] + 1, destSheetPast.getLastRow() - 1, 1).getDisplayValues().map(r => r[0])
  }


  let destHeadingsFuture = destSheetFuture.getRange(1, 1, 1, destSheetFuture.getLastColumn()).getValues()[0]
  let destHeadingsFutureObj = {}
  destHeadingsFuture.forEach((h, i) => {
    destHeadingsFutureObj[h.toString().trim()] = i
  })


  let todayDateTime = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1).getTime()



  let pastData = [];
  let futureData = [];

  allData.forEach(row => {

    if (new Date(row[headingsObj["Appointment Date"]]).getTime() < todayDateTime) {
      let idIndex = pastIds.indexOf(row[headingsObj["Appointment ID"]])

      if (idIndex == -1) {
        let rowData = new Array(destHeadingsPast.length).fill("")
        for (const key in destHeadingsPastObj) {
          if (headingsObj[key] || headingsObj[key] === 0) {
            rowData[destHeadingsPastObj[key]] = row[headingsObj[key]]
          }
        }

        allPastData.push(rowData)
      } else {

        let rowData = new Array(destHeadingsPast.length).fill("")
        for (const key in destHeadingsPastObj) {
          if (headingsObj[key] || headingsObj[key] === 0) {
            rowData[destHeadingsPastObj[key]] = row[headingsObj[key]]
          }
        }
        allPastData[idIndex] = rowData
      }
    } else {


      let rowData = new Array(destHeadingsFuture.length).fill("")
      for (const key in destHeadingsFutureObj) {
        if (headingsObj[key] || headingsObj[key] === 0) {
          rowData[destHeadingsFutureObj[key]] = row[headingsObj[key]]
        }
      }

      futureData.push(rowData)

    }


  })

  if (allPastData.length > 0) {
    destSheetPast.getRange(2, 1, allPastData.length, allPastData[0].length).setValues(allPastData)
  }

  if (futureData.length > 0) {
    destSheetFuture.getRange(2, 1, futureData.length, futureData[0].length).setValues(futureData)

  }

  if (destSheetFuture.getLastRow() > 2 + futureData.length) {
    destSheetFuture.getRange(2 + futureData.length, 1, destSheetFuture.getLastRow() - (1 + futureData.length), destSheetFuture.getLastColumn()).clearContent();
  }


  if (futureData.length > 0) {
    destSheetFuture.getRange(2, 1, destSheetFuture.getLastRow() - 1, destSheetFuture.getLastColumn()).sort([{ column: 2, ascending: true }, { column: 3, ascending: true }])
  }

}







function processAgingDataApptMain() {

  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let wbSheet = ss.getActiveSheet();


  let nextAppt = wbSheet.getRange("H1").getDisplayValue()







  let dataSheet = ss.getSheetByName(AGING_DATA_SHEET);


  let allData = dataSheet.getRange(1, 1, dataSheet.getLastRow(), dataSheet.getLastColumn()).getValues();

  let headings = allData.splice(0, 1)[0]

  let headingsObj = {}
  headings.forEach((h, i) => {
    headingsObj[h.toString().trim()] = i
  })







  let apptSS = SpreadsheetApp.openById(APPT_SS_ID);
  let apptSheet = apptSS.getSheetByName(APPT_SHEET_NAME);

  let apptData = apptSheet.getRange(1, 6, apptSheet.getLastRow(), 7).getDisplayValues()
  let mrnIds = apptData.map(r => r[0])



  let postEmaApptSS = SpreadsheetApp.openById(APPT_POST_EMA_SS_ID);
  let futureApptSheet = postEmaApptSS.getSheetByName(FUTURE_APPT_SHEET);

  let allFutureAppts = futureApptSheet.getRange(1, 1, futureApptSheet.getLastRow(), 6).getValues();
  let futureApptMrns = allFutureAppts.map(r => r[5].toString())





  let filteredData = []

  allData.forEach(r => {


    let rowData = ["", "", r[headingsObj["Total A/R ($) (DOS)"]], r[headingsObj["Patient MRN"]], r[headingsObj["Patient Name"]], r[headingsObj["Phone"]], "", "", ""]

    let mrnIndex = mrnIds.indexOf(r[headingsObj["Patient MRN"]])
    if (mrnIndex > -1) {
      rowData[7] = apptData[mrnIndex][6];
      if (apptData[mrnIndex][5] != "" && apptData[mrnIndex][5] != "-") {
        rowData[6] = apptData[mrnIndex][5];
      } else {
        rowData[6] = apptData[mrnIndex][4];
      }
    }


    if (r[10] >= r[9] && r[10] >= r[8] && r[10] >= r[7] && r[10] >= r[6]) {
      rowData[0] = "121+ Days"
      rowData[1] = r[headingsObj["121+ Days A/R ($) (DOS)"]]

    } else if (r[9] >= r[10] && r[9] >= r[8] && r[9] >= r[7] && r[9] >= r[6]) {
      rowData[0] = "91-120 Days"
      rowData[1] = r[headingsObj["91 Days A/R ($) (DOS)"]]

    } else if (r[8] >= r[10] && r[8] >= r[9] && r[8] >= r[7] && r[8] >= r[6]) {
      rowData[0] = "61-90 Days"
      rowData[1] = r[headingsObj["61 Days A/R ($) (DOS)"]]

    } else if (r[7] >= r[10] && r[7] >= r[9] && r[7] >= r[8] && r[7] >= r[6]) {
      rowData[0] = "31-60 Days"
      rowData[1] = r[headingsObj["31 Days A/R ($) (DOS)"]]

    } else if (r[6] >= r[10] && r[6] >= r[9] && r[6] >= r[8] && r[6] >= r[7]) {
      rowData[0] = "Under 30 days"
      rowData[1] = r[headingsObj["Current A/R ($) (DOS)"]]

    }




    let mrnIndexFuture = futureApptMrns.indexOf(r[headingsObj["Patient MRN"].toString()])
    if (mrnIndexFuture > -1) {
      rowData[8] = allFutureAppts[mrnIndexFuture][1]
      filteredData.push(rowData)
    }



  })




  if (nextAppt == "Within 15 Days") {
    let dateDaysBefore = new Date()
    dateDaysBefore = new Date(dateDaysBefore.setDate(dateDaysBefore.getDate() + 15)).getTime()
    filteredData = filteredData.filter(r => isValidDate_(r[8]) && r[8].getTime() <= dateDaysBefore)


  } else if (nextAppt == "15 To 30") {
    let dateDaysBefore = new Date()
    dateDaysBefore = new Date(dateDaysBefore.setDate(dateDaysBefore.getDate() + 30)).getTime()

    let dateDaysAfter = new Date()
    dateDaysAfter = new Date(dateDaysAfter.setDate(dateDaysAfter.getDate() + 15)).getTime()

    filteredData = filteredData.filter(r => isValidDate_(r[8]) && r[8].getTime() > dateDaysAfter && r[8].getTime() <= dateDaysBefore)


  } else if (nextAppt == "30 To 60") {
    let dateDaysBefore = new Date()
    dateDaysBefore = new Date(dateDaysBefore.setDate(dateDaysBefore.getDate() + 60)).getTime()

    let dateDaysAfter = new Date()
    dateDaysAfter = new Date(dateDaysAfter.setDate(dateDaysAfter.getDate() + 30)).getTime()

    filteredData = filteredData.filter(r => isValidDate_(r[8]) && r[8].getTime() > dateDaysAfter && r[8].getTime() <= dateDaysBefore)


  } else if (nextAppt == "60 To 90") {
    let dateDaysBefore = new Date()
    dateDaysBefore = new Date(dateDaysBefore.setDate(dateDaysBefore.getDate() + 90)).getTime()

    let dateDaysAfter = new Date()
    dateDaysAfter = new Date(dateDaysAfter.setDate(dateDaysAfter.getDate() + 60)).getTime()

    filteredData = filteredData.filter(r => isValidDate_(r[8]) && r[8].getTime() > dateDaysAfter && r[8].getTime() <= dateDaysBefore)


  }






  if (wbSheet.getLastRow() > 3) {
    wbSheet.getRange(4, 2, wbSheet.getLastRow() - 1, 9).clearContent()
    wbSheet.getRange(4, 14, wbSheet.getLastRow() - 1, 7).clearContent()
  }


  if (filteredData.length > 0) {
    wbSheet.getRange(4, 2, filteredData.length, filteredData[0].length).setValues(filteredData)
    wbSheet.getRange(4, 1, filteredData.length, wbSheet.getLastColumn()).sort([{ column: 10, ascending: true }, { column: 4, ascending: false }])
  }



}


const APPT_POST_EMA_SS_ID = "1CBhyVOTbfeduqyBilvWBnbX1S9I1Sj9PW3BfcPO4MuI";
const FUTURE_APPT_SHEET = "FutureAppts"

const APPT_SS_ID = "10itZumv5xj-LkjfiajY97HMcq-63cXvd4zgZfiQyCxU";
const APPT_SHEET_NAME = "Appointments"

const AGING_DATA_SHEET = "Aging Data"
const WORKBOOK_SHEET_NAME = "Workbook"


// function onOpen() {
//   let ui = SpreadsheetApp.getUi();

//   let menu = ui.createMenu("Custom");

//   menu.addItem("Update Data in Workbook", "processAgingDataMain").addToUi()
// }


//within 1 to 15 days, 15 to 30, 30 to 60 and 60 to 90 and All


function processAgingDataFilterMain() {

  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let wbSheet = ss.getActiveSheet();

  let selectedAging = wbSheet.getRange("C1").getDisplayValue()
  let selectedBalance = wbSheet.getRange("E1").getDisplayValue()
  // let nextAppt = wbSheet.getRange("H1").getDisplayValue()


  let dataSheet = ss.getSheetByName(AGING_DATA_SHEET);
  let allData = dataSheet.getRange(1, 1, dataSheet.getLastRow(), dataSheet.getLastColumn()).getValues();

  let headings = allData.splice(0, 1)[0]

  let headingsObj = {}
  headings.forEach((h, i) => {
    headingsObj[h.toString().trim()] = i
  })


  // *** New Filter Criteria Created *** //

  const MrnColIndex = headingsObj["Patient MRN"];

  const SelectedNotSpokenAging = wbSheet.getRange("G1").getDisplayValue()
  const SelectedPaymentPlan = wbSheet.getRange("I1").getDisplayValue()

  const NotSpokenPatientsSheet = ss.getSheetByName(FOLLOWUP_LOG_SHEET)

  let patientMrnsToExclude = [];

  const NotSpokenAgingObj = {
    "WITHIN 30 DAYS": 30,
    "WITHIN 60 DAYS": 60,
    "WITHIN 90 DAYS": 90,
    "WITHIN 120 DAYS": 120,
    "ABOVE 120 DAYS": 100000
  }

  let filterDate = new Date()



  if (SelectedNotSpokenAging in NotSpokenAgingObj) {
    //const NotSpokenAgingDays = NotSpokenAgingObj[SelectedNotSpokenAging]
    const NotSpokenAgingDaysTime = new Date(filterDate.setDate(filterDate.getDate() - NotSpokenAgingObj[SelectedNotSpokenAging])).getTime()
    patientMrnsToExclude = NotSpokenPatientsSheet.getRange("A2:D").getValues()
      .filter(row => row[0] !== '' && isValidDate_(row[3]) && row[3].getTime() >= NotSpokenAgingDaysTime);
  }





  let patientMrnsToInclude = [];

  //let patientMrnsToExclude=[]

  if (SelectedPaymentPlan === "Yes") {
    patientMrnsToInclude = NotSpokenPatientsSheet.getRange("A2:H").getValues()
      .filter(row => row[0] !== '' && row[7] === SelectedPaymentPlan);
  }
  else if (SelectedPaymentPlan === "No") {
    const PatientMrnsWithPaymentPlan = NotSpokenPatientsSheet.getRange("A2:H").getValues()
      .filter(row => row[0] !== '' && row[7] === "Yes");
    patientMrnsToExclude = [...patientMrnsToExclude, ...PatientMrnsWithPaymentPlan]
  }
  else {
    patientMrnsToInclude = allData.map(row => [row[MrnColIndex].toString()]);
  }


  patientMrnsToExclude = patientMrnsToExclude.map(row => row[0].toString());
  patientMrnsToInclude = patientMrnsToInclude.map(row => row[0].toString());


  //Logger.log(patientMrnsToExclude.length)

  if (patientMrnsToExclude.length > 0) {
    allData = allData.filter(row => !patientMrnsToExclude.includes(row[MrnColIndex]));
  }

  if (patientMrnsToInclude.length > 0) {
    allData = allData.filter(row => patientMrnsToInclude.includes(row[MrnColIndex].toString()));
  }




  // *** -------------------------- *** //


  let apptSS = SpreadsheetApp.openById(APPT_SS_ID);
  let apptSheet = apptSS.getSheetByName(APPT_SHEET_NAME);

  let apptData = apptSheet.getRange(1, 6, apptSheet.getLastRow(), 7).getDisplayValues()
  let apptMrns = apptData.map(r => r[0])

  let postEmaApptSS = SpreadsheetApp.openById(APPT_POST_EMA_SS_ID);
  let futureApptSheet = postEmaApptSS.getSheetByName(FUTURE_APPT_SHEET);

  let allFutureAppts = futureApptSheet.getRange(1, 1, futureApptSheet.getLastRow(), 6).getValues();
  let futureApptMrns = allFutureAppts.map(r => r[5].toString())


  // *** Updated the Following Code Block *** //

  const AgingGroupObj = {
    "OVER 120 DAYS": "121+ Days A/R ($) (DOS)",
    "91 - 120 DAYS": "91 Days A/R ($) (DOS)",
    "61 - 90 DAYS": "61 Days A/R ($) (DOS)",
    "31 - 60 DAYS": "31 Days A/R ($) (DOS)",
    "UNDER 30 DAYS": "Current A/R ($) (DOS)"
  }


  if (selectedAging in AgingGroupObj) {
    const AgingColHeader = AgingGroupObj[selectedAging];
    allData = allData.filter(row => row[headingsObj[AgingColHeader]] > 0);
  }

  // *** ------------------------------ *** //


  /*

  if (selectedAging == "OVER 120 DAYS") {
    allData = allData.filter(r => r[headingsObj["121+ Days A/R ($) (Aging)"]] > 0)

  } else if (selectedAging == "91 - 120 DAYS") {
    allData = allData.filter(r => r[headingsObj["91 Days A/R ($) (Aging)"]] > 0)

  } else if (selectedAging == "61 - 90 DAYS") {
    allData = allData.filter(r => r[headingsObj["61 Days A/R ($) (Aging)"]] > 0)

  } else if (selectedAging == "31 - 60 DAYS") {
    allData = allData.filter(r => r[headingsObj["31 Days A/R ($) (Aging)"]] > 0)

  } else if (selectedAging == "UNDER 30 DAYS") {
    allData = allData.filter(r => r[headingsObj["Current A/R ($) (Aging)"]] > 0)

  }

  */


  // *** Updated the Following Code Block *** //

  const BalanceGroupObj = {
    "UNDER $50": { "min": 1, "max": 50 },
    "$51 - $100": { "min": 51, "max": 100 },
    "$101 - $200": { "min": 101, "max": 200 },
    "$201 - $500": { "min": 201, "max": 500 },
    "$501 - $1000": { "min": 501, "max": 1000 },
    "OVER $1000": { "min": 1001, "max": 1000000000 },
  }

  if (selectedBalance in BalanceGroupObj) {
    const BalanceColHeader = "Total A/R ($) (DOS)";
    const MinBalance = BalanceGroupObj[selectedBalance]["min"];
    const MaxBalance = BalanceGroupObj[selectedBalance]["max"];
    allData = allData.filter(row => row[headingsObj[BalanceColHeader]] >= MinBalance &&
      row[headingsObj[BalanceColHeader]] <= MaxBalance);
  }

  // *** ------------------------------ *** //


  /*

  if (selectedBalance == "UNDER $50") {
    allData = allData.filter(r => r[headingsObj["Total A/R ($) (Aging)"]] > 0 && r[headingsObj["Total A/R ($) (Aging)"]] <= 50)

  } else if (selectedBalance == "$51 - $100") {
    allData = allData.filter(r => r[headingsObj["Total A/R ($) (Aging)"]] >= 51 && r[headingsObj["Total A/R ($) (Aging)"]] <= 100)

  } else if (selectedBalance == "$101 - $200") {
    allData = allData.filter(r => r[headingsObj["Total A/R ($) (Aging)"]] >= 101 && r[headingsObj["Total A/R ($) (Aging)"]] <= 200)

  } else if (selectedBalance == "$201 - $500") {
    allData = allData.filter(r => r[headingsObj["Total A/R ($) (Aging)"]] >= 201 && r[headingsObj["Total A/R ($) (Aging)"]] <= 500)

  } else if (selectedBalance == "$501 - $1000") {
    allData = allData.filter(r => r[headingsObj["Total A/R ($) (Aging)"]] >= 501 && r[headingsObj["Total A/R ($) (Aging)"]] <= 1000)

  } else if (selectedBalance == "OVER $1000") {
    allData = allData.filter(r => r[headingsObj["Total A/R ($) (Aging)"]] > 1000)

  }

  */


  let filteredData = []

  allData.forEach(r => {

    let rowData = ["", "", r[headingsObj["Total A/R ($) (DOS)"]], r[headingsObj["Patient MRN"]],
      r[headingsObj["Patient Name"]], r[headingsObj["Phone"]], "", "", ""]

    let mrnIndex = apptMrns.indexOf(r[headingsObj["Patient MRN"]])

    if (mrnIndex > -1) {
      rowData[7] = apptData[mrnIndex][6];
      if (apptData[mrnIndex][5] != "" && apptData[mrnIndex][5] != "-") {
        rowData[6] = apptData[mrnIndex][5];
      } else {
        rowData[6] = apptData[mrnIndex][4];
      }
    }

    if (selectedAging == "ALL") {
      if (r[10] > 0) {
        rowData[0] = "121+ Days"

      } else if (r[9] > 0) {
        rowData[0] = "91-120 Days"

      } else if (r[8] > 0) {
        rowData[0] = "61-90 Days"

      } else if (r[7] > 0) {
        rowData[0] = "31-60 Days"

      } else if (r[6] > 0) {
        rowData[0] = "Under 30 days"

      }
    }
    else {
      if (selectedAging == "OVER 120 DAYS") {
        rowData[0] = "121+ Days"

      } else if (selectedAging == "91 - 120 DAYS") {
        rowData[0] = "91-120 Days"

      } else if (selectedAging == "61 - 90 DAYS") {
        rowData[0] = "61-90 Days"

      } else if (selectedAging == "31 - 60 DAYS") {
        rowData[0] = "31-60 Days"

      } else if (selectedAging == "UNDER 30 DAYS") {
        rowData[0] = "Under 30 days"

      }
    }


    if (selectedAging == "OVER 120 DAYS") {
      rowData[1] = r[headingsObj["121+ Days A/R ($) (DOS)"]]

    } else if (selectedAging == "91 - 120 DAYS") {
      rowData[1] = r[headingsObj["91 Days A/R ($) (DOS)"]]

    } else if (selectedAging == "61 - 90 DAYS") {
      rowData[1] = r[headingsObj["61 Days A/R ($) (DOS)"]]

    } else if (selectedAging == "31 - 60 DAYS") {
      rowData[1] = r[headingsObj["31 Days A/R ($) (DOS)"]]

    } else if (selectedAging == "UNDER 30 DAYS") {
      rowData[1] = r[headingsObj["Current A/R ($) (DOS)"]]

    } else {
      rowData[1] = r[headingsObj["Total A/R ($) (DOS)"]]
    }


    let mrnIndexFuture = futureApptMrns.indexOf(r[headingsObj["Patient MRN"].toString()])
    if (mrnIndexFuture > -1) {
      rowData[8] = allFutureAppts[mrnIndexFuture][1]
    }

    filteredData.push(rowData)

  })


  if (wbSheet.getLastRow() > 3) {
    wbSheet.getRange(4, 2, wbSheet.getLastRow() - 1, 9).clearContent()
    wbSheet.getRange(4, 16, wbSheet.getLastRow() - 1, 7).clearContent()
  }


  if (filteredData.length > 0) {
    wbSheet.getRange(4, 2, filteredData.length, filteredData[0].length).setValues(filteredData)
    wbSheet.getRange(4, 1, filteredData.length, wbSheet.getLastColumn()).sort([{ column: 3, ascending: false }, { column: 1, ascending: true }])
  }

}



//below function will return true if the arg is valid date and false if not.
function isValidDate_(d) {
  if (Object.prototype.toString.call(d) !== "[object Date]")
    return false;
  return !isNaN(d.getTime());
}



function processAgingDataMain() {
  let ss = SpreadsheetApp.getActiveSpreadsheet();

  let dataSheet = ss.getSheetByName(AGING_DATA_SHEET);


  let allData = dataSheet.getRange(1, 1, dataSheet.getLastRow(), dataSheet.getLastColumn()).getDisplayValues();

  let headings = allData.splice(0, 1)[0]

  let headingsObj = {}
  headings.forEach((h, i) => {
    headingsObj[h.toString().trim()] = i
  })

  //Logger.log(headingsObj)


  let apptSS = SpreadsheetApp.openById(APPT_SS_ID);
  let apptSheet = apptSS.getSheetByName(APPT_SHEET_NAME);

  let apptData = apptSheet.getRange(1, 6, apptSheet.getLastRow(), 7).getDisplayValues()
  let mrnIds = apptData.map(r => r[0])



  let postEmaApptSS = SpreadsheetApp.openById(APPT_POST_EMA_SS_ID);
  let futureApptSheet = postEmaApptSS.getSheetByName(FUTURE_APPT_SHEET);

  let allFutureAppts = futureApptSheet.getRange(1, 1, futureApptSheet.getLastRow(), 6).getDisplayValues();
  let futureApptMrns = allFutureAppts.map(r => r[5])


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
    }

    filteredData.push(rowData)

  })


  let newIds = filteredData.map(r => r[3])




  let wbSheet = ss.getSheetByName(WORKBOOK_SHEET_NAME)
  //let existingData = wbSheet.getRange(3, 2, wbSheet.getLastRow() - 2, 8).getDisplayValues().filter(r => r[0] == "" && r[1] == "" && r[2] == "" && r[3] == "");
  let existingData = [];
  if (wbSheet.getLastRow() > 3) {
    existingData = wbSheet.getRange(4, 2, wbSheet.getLastRow() - 3, 9).getDisplayValues().filter(r => r[0] == "" && r[1] == "" && r[2] == "" && r[3] == "");
  }
  let existingIds = existingData.map(r => r[3])



  for (var i = existingIds.length - 1; i >= 0; i--) {

    if (existingIds[i] != "" && existingIds[i] != null) {
      let idIndex = newIds.indexOf(existingIds[i])
      if (idIndex == -1) {
        wbSheet.deleteRow(i + 3)
      }
    } else {
      wbSheet.deleteRow(i + 3)
    }
  }

  existingData = []
  if (wbSheet.getLastRow() > 2) {
    existingData = wbSheet.getRange(3, 2, wbSheet.getLastRow() - 2, 9).getDisplayValues().filter(r => r[3] != "" && r[3] != null);
  }
  existingIds = existingData.map(r => r[3])

  filteredData.forEach(row => {
    let idIndex = existingIds.indexOf(row[3])
    if (idIndex > -1) {
      existingData[idIndex] = row
    } else {
      existingData.push(row)
    }
  })


  wbSheet.getRange(4, 2, existingData.length, existingData[0].length).setValues(existingData)
  wbSheet.getRange(4, 1, existingData.length, wbSheet.getLastColumn()).sort([{ column: 1, ascending: true }, { column: 3, ascending: false }])




}











const ALL_PATIENTS_PAS_SHEET = "All Patients with PAs"


const FAX_LOG_PA_SHEET = "PA From Fax Log"


const PA_LIST_EMA_SHEET = "PA List From EMA"


const LAUREN_MILLER_PA_CMM_SHEET = "Lauren Miller PA from CMM"



function updateAllPatientsWithPAs() {
  sendLmPaCmmToAPWPAS()
  sendPaListEmaToAPWPAS()
  sendFaxLogToAPWPAS()
}



function sendLmPaCmmToAPWPAS() {


  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const destinationSheet = ss.getSheetByName(ALL_PATIENTS_PAS_SHEET); // Replace with the name of your destination sheet

  const sourceSheet = ss.getSheetByName(LAUREN_MILLER_PA_CMM_SHEET); // Replace with the name of your source sheet


  // Get data from source sheet
  const sourceData = sourceSheet.getDataRange().getDisplayValues();
  const sourceHeaders = sourceData.shift(); // Remove and store headers

  const sourceDataR = sourceSheet.getDataRange().getRichTextValues();
  sourceDataR.shift(); // Remove and store headers


  // Get data from destination sheet
  const destinationData = destinationSheet.getRange(1, 1, destinationSheet.getLastRow(), 5).getDisplayValues();
  const destinationHeaders = destinationData.shift(); // Remove and store headers

  const destinationDataRight = destinationSheet.getRange(1, 20, destinationSheet.getLastRow(), 4).getDisplayValues();
  destinationDataRight.shift(); // Remove and store headers

  //const destinationDataR = destinationSheet.getRange(1, 1, destinationSheet.getLastRow(), 5).getRichTextValues();
  //destinationDataR.shift(); // Remove and store headers


  const existingDataSet = new Map()
  destinationData.forEach((row, index) => {
    existingDataSet.set([row[1], row[2], row[4]].join("|"), index)
  })
  //MRN,	DOB	and	Link



  let timeNow = new Date()
  let timeNowRich = SpreadsheetApp.newRichTextValue().setText(timeNow).setLinkUrl(null).build()

  sourceData.forEach((row, index) => {
    if (row[1] != "" && row[22] != "") {
      const key = row[22] + "|" + row[2] + "|" + row[23]
      if (existingDataSet.has(key)) {
        // destinationData[existingDataSet.get(key)][4] = row[3]
      } else {
        //let bdateRich = SpreadsheetApp.newRichTextValue().setText(row[2]).setLinkUrl(null).build()
        destinationData.push([timeNow, row[22], row[2], row[1], row[23]])
        destinationDataRight.push([row[24], row[25], row[26], row[27]])
      }
    }
  })


  if (destinationData.length > 0) {
    //Logger.log(destinationData)
    destinationSheet.getRange(2, 1, destinationData.length, destinationData[0].length).setValues(destinationData)
    //destinationSheet.getRange(2, 20, destinationDataRight.length, destinationDataRight[0].length).setValues(destinationDataRight)
    destinationSheet.getRange(2, 1, destinationSheet.getLastRow() - 1, destinationSheet.getLastColumn()).sort([{ column: 1, ascending: false }])
  }



}





function sendPaListEmaToAPWPAS() {


  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const destinationSheet = ss.getSheetByName(ALL_PATIENTS_PAS_SHEET); // Replace with the name of your destination sheet

  const sourceSheet = ss.getSheetByName(PA_LIST_EMA_SHEET); // Replace with the name of your source sheet


  // Get data from source sheet
  const sourceData = sourceSheet.getDataRange().getDisplayValues()
  const sourceHeaders = sourceData.shift(); // Remove and store headers

  const sourceDataR = sourceSheet.getDataRange().getRichTextValues()
  sourceDataR.shift(); // Remove and store headers


  // Get data from destination sheet
  const destinationData = destinationSheet.getRange(1, 1, destinationSheet.getLastRow(), 5).getDisplayValues();
  const destinationHeaders = destinationData.shift(); // Remove and store headers

  const destinationDataRight = destinationSheet.getRange(1, 20, destinationSheet.getLastRow(), 4).getDisplayValues();
  destinationDataRight.shift(); // Remove and store headers

  // const destinationDataR = destinationSheet.getRange(1, 1, destinationSheet.getLastRow(), 5).getRichTextValues();
  // destinationDataR.shift()


  const existingDataSet = new Map()
  destinationData.forEach((row, index) => {
    existingDataSet.set([row[1], row[2], row[4]].join("|"), index)
  })
  //MRN,	DOB	and	Link



  let timeNow = new Date()
  let timeNowRich = SpreadsheetApp.newRichTextValue().setText(timeNow).setLinkUrl(null).build()

sourceData.forEach((row, index) => {
    if (row[13] != "" && row[14] != "") {
      const key = row[14] + "|" + row[12] + "|" + row[7]
      if (existingDataSet.has(key)) {
        // destinationData[existingDataSet.get(key)][4] = row[3]
      } else {
        //Logger.log(sourceDataR[index])
        //let bdateRich = SpreadsheetApp.newRichTextValue().setText(row[12]).setLinkUrl(null).build()
        destinationData.push([timeNow, row[14], row[12], row[13], row[7]])
        //destinationDataRight.push([row[16], row[17], row[18], row[19]])
      }
    }
  })


  if (destinationData.length > 0) {
    //Logger.log(destinationData)
    destinationSheet.getRange(2, 1, destinationData.length, destinationData[0].length).setValues(destinationData)
    //destinationSheet.getRange(2, 20, destinationDataRight.length, destinationDataRight[0].length).setValues(destinationDataRight)
    destinationSheet.getRange(2, 1, destinationSheet.getLastRow() - 1, destinationSheet.getLastColumn()).sort([{ column: 1, ascending: false }])
  }



}







function sendFaxLogToAPWPAS() {


  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const destinationSheet = ss.getSheetByName(ALL_PATIENTS_PAS_SHEET); // Replace with the name of your destination sheet

  const sourceSheet = ss.getSheetByName(FAX_LOG_PA_SHEET); // Replace with the name of your source sheet


  // Get data from source sheet
  const sourceData = sourceSheet.getDataRange().getDisplayValues()
  const sourceHeaders = sourceData.shift(); // Remove and store headers

  const sourceDataR = sourceSheet.getDataRange().getRichTextValues()
  sourceDataR.shift(); // Remove and store headers


  // Get data from destination sheet
  const destinationData = destinationSheet.getRange(1, 1, destinationSheet.getLastRow(), 5).getDisplayValues();
  const destinationHeaders = destinationData.shift(); // Remove and store headers

  const destinationDataRight = destinationSheet.getRange(1, 20, destinationSheet.getLastRow(), 4).getDisplayValues();
  destinationDataRight.shift(); // Remove and store headers


  // const destinationDataR = destinationSheet.getRange(1, 1, destinationSheet.getLastRow(), 5).getRichTextValues();
  // destinationDataR.shift(); // Remove and store headers


  const existingDataSet = new Map()
  destinationData.forEach((row, index) => {
    existingDataSet.set([row[1], row[2], row[4]].join("|"), index)
  })
  //MRN,	DOB	and	Link


  let timeNow = new Date()
  let timeNowRich = SpreadsheetApp.newRichTextValue().setText(timeNow).setLinkUrl(null).build()

  sourceData.forEach((row, index) => {
    if (row[7] != "" && row[8] != "") {
      const key = row[7] + "|" + row[9] + "|" + row[6]
      if (existingDataSet.has(key)) {
        // destinationData[existingDataSet.get(key)][4] = row[3]
      } else {
        //let bdateRich = SpreadsheetApp.newRichTextValue().setText(row[9]).setLinkUrl(null).build()
        destinationData.push([timeNow, row[7], row[9], row[8], row[6]])
        //destinationDataRight.push([row[18], row[19], row[20], row[21]])

      }
    }

  })


  //return


  if (destinationData.length > 0) {
    //Logger.log(destinationData)
    destinationSheet.getRange(2, 1, destinationData.length, destinationData[0].length).setValues(destinationData)
    //destinationSheet.getRange(2, 20, destinationDataRight.length, destinationDataRight[0].length).setValues(destinationDataRight)
    destinationSheet.getRange(2, 1, destinationSheet.getLastRow() - 1, destinationSheet.getLastColumn()).sort([{ column: 1, ascending: false }])
  }



  const dataUpdateLog = ss.getSheetByName("Data Update Log")
  dataUpdateLog.getRange("D2").setValue(new Date())

}















function viewPatientDetails() {

  const ActiveSheet = SpreadsheetApp.getActive().getActiveSheet();
  const ColHeaderText = ActiveSheet.getRange('B1').getValue();
  const ActiveRow = ActiveSheet.getActiveCell().getRow();

  if (ColHeaderText !== 'MRN' || ActiveRow < 2) {
    return;
  }

  const PatientId = ActiveSheet.getRange('B' + ActiveRow).getValue();

  const DetailsSheet = SpreadsheetApp.getActive().getSheetByName('Patients with PAs');
  DetailsSheet.activate();
  DetailsSheet.getRange('B1').setValue(PatientId);

}



















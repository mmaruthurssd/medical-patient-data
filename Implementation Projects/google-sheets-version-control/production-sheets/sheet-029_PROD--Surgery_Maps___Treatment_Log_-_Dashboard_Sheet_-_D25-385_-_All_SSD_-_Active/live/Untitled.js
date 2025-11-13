



const SKIN_DX_SS_ID = "12sqJDZdemF7xuiFtj5KPcNGvwFaWkfju01faI3xhVTM"


const ALL_EXTRNAL_CANCER_SS_ID = "1KVO0_p9IvBnKzo6HL5IDy3rq43NKtaeYnMTK4frEj-k"



function updateMohsExcisionMapsSheet() {

  //return
  // }
  // function updateMohsExcisionMapsSheetTest() {

  //const scriptProperties = PropertiesService.getScriptProperties();
  //const data = scriptProperties.getProperties();
  //Logger.log(data.executeScript)
  //if (data.executeScript != "Yes") return
  //scriptProperties.setProperties({ "executeScript": "No" })


  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Mohs & Excision Maps")

  try {
    updateMohsExcisionMapsSheetOne()
    sheet.getRange("B1").setValue(new Date())
  } catch (err) { console.log(err); }

  SpreadsheetApp.flush()

  try {
    updateMohsExcisionMapsSheetTwo()
    sheet.getRange("D1").setValue(new Date())
  } catch (err) { console.log(err); }


  //scriptProperties.setProperties({ "executeScript": "Yes" })

  //return
  createDocAndPdfHourly()


}



function updateMohsExcisionMapsSheetOne() {

  const sourceSS = SpreadsheetApp.openById(SKIN_DX_SS_ID)
  const sourceSheet = sourceSS.getSheetByName("Data"); // Replace with the name of your source sheet


  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const destinationSheet = ss.getSheetByName("Mohs & Excision Maps"); // Replace with the name of your destination sheet

  // Get data from source sheet
  const sourceData = sourceSheet.getDataRange().getDisplayValues().filter(r => r[0] != "" || r[1] != "");
  const sourceHeaders = sourceData.shift(); // Remove and store headers

  // Get data from destination sheet
  const destinationData = destinationSheet.getRange(2, 1, destinationSheet.getLastRow() - 1, 9).getDisplayValues();
  const destinationHeaders = destinationData.shift(); // Remove and store headers


  const existingDataSet = new Map()
  destinationData.forEach((row, index) => {
    existingDataSet.set([row[0].toString().toLowerCase().trim(), row[3].toString().toLowerCase().trim(), row[4].toString().toLowerCase().trim(), row[5].toString().toLowerCase().trim()].join("|"), index)
  })

  let newDestData = []
  sourceData.forEach(row => {
    //const key = row[7] + "|" + row[6] + "|" + row[10] + "|" + row[9]
    const key = row[0].toString().toLowerCase().trim() + "|" + row[3].toString().toLowerCase().trim() + "|" + row[10].toString().toLowerCase().trim() + "|" + row[9].toString().toLowerCase().trim()
    if (existingDataSet.has(key)) {
      // destinationData[existingDataSet.get(key)][4] = row[3]
    } else {
      newDestData.push([row[0], row[1], row[2], row[3], row[10].toString().trim(), row[9], row[5], row[4], row[14]])
    }
  })


  if (newDestData.length > 0) {
    destinationSheet.getRange(destinationSheet.getLastRow() + 1, 1, newDestData.length, newDestData[0].length).setValues(newDestData)
    destinationSheet.getRange(3, 1, destinationSheet.getLastRow() - 2, destinationSheet.getLastColumn()).sort([{ column: 7, ascending: false }])
  }




  const dataUpdateLog = ss.getSheetByName("Data Update Log")
  dataUpdateLog.getRange("D2").setValue(new Date())

}










function updateMohsExcisionMapsSheetTwo() {

  const sourceSS = SpreadsheetApp.openById(ALL_EXTRNAL_CANCER_SS_ID)
  const sourceSheet = sourceSS.getSheetByName("ExportMaps"); // Replace with the name of your source sheet


  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const destinationSheet = ss.getSheetByName("Mohs & Excision Maps"); // Replace with the name of your destination sheet

  // Get data from source sheet
  const sourceData = sourceSheet.getDataRange().getDisplayValues().filter(r => r[0] != "" || r[1] != "");
  const sourceHeaders = sourceData.shift(); // Remove and store headers

  // Get data from destination sheet
  const destinationData = destinationSheet.getRange(2, 1, destinationSheet.getLastRow() - 1, 9).getDisplayValues();
  const destinationHeaders = destinationData.shift(); // Remove and store headers


  const existingDataSet = new Map()
  destinationData.forEach((row, index) => {
    existingDataSet.set([row[0].toString().toLowerCase().trim(), row[3].toString().toLowerCase().trim(), row[4].toString().toLowerCase().trim(), row[5].toString().toLowerCase().trim()].join("|"), index)
  })

  let newData = []
  sourceData.forEach(row => {
    //const key = row[7] + "|" + row[6] + "|" + row[10] + "|" + row[9]
    const key = row[0].toString().toLowerCase().trim() + "|" + row[3].toString().toLowerCase().trim() + "|" + row[4].toString().toLowerCase().trim() + "|" + row[5].toString().toLowerCase().trim()
    if (existingDataSet.has(key)) {
      // destinationData[existingDataSet.get(key)][4] = row[3]
    } else {
      //destinationData.push([row[0], row[1], row[2], row[3], row[4], row[5], row[6], row[7], row[8]])
      newData.push([row[0], row[1], row[2], row[3], row[4], row[5], row[6], row[7], row[8]])
    }
  })


  if (newData.length > 0) {
    //Logger.log(destinationData)
    destinationSheet.getRange(destinationSheet.getLastRow() + 1, 1, newData.length, newData[0].length).setValues(newData)
    //destinationSheet.getRange(3, 1, destinationData.length, destinationData[0].length).setValues(destinationData)
    //.getRange(3, 4, destinationSheet.getLastRow() - 2, 1).clearContent();

    destinationSheet.getRange(3, 1, destinationSheet.getLastRow() - 2, destinationSheet.getLastColumn()).sort([{ column: 7, ascending: false }])
  }




  const dataUpdateLog = ss.getSheetByName("Data Update Log")
  dataUpdateLog.getRange("D3").setValue(new Date())

}











const External_Biopsy_List_SS_ID = "1KVO0_p9IvBnKzo6HL5IDy3rq43NKtaeYnMTK4frEj-k"




function updateMohsExcisionMapsSheetThree() {

  const sourceSS = SpreadsheetApp.openById(External_Biopsy_List_SS_ID)
  const sourceSheet = sourceSS.getSheetByName("Biopsies_DB"); // Replace with the name of your source sheet


  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const destinationSheet = ss.getSheetByName("Mohs & Excision Maps"); // Replace with the name of your destination sheet

  // Get data from source sheet
  const sourceData = sourceSheet.getDataRange().getDisplayValues().filter(r => r[0] != "" || r[1] != "" || r[3] != "");
  const sourceHeaders = sourceData.shift(); // Remove and store headers

  // Get data from destination sheet
  const destinationData = destinationSheet.getRange(2, 1, destinationSheet.getLastRow() - 1, 9).getDisplayValues();
  const destinationHeaders = destinationData.shift(); // Remove and store headers


  const existingDataSet = new Map()
  destinationData.forEach((row, index) => {
    existingDataSet.set([row[3], row[4], row[5]].join("|"), index)
  })


  let count = 0
  sourceData.forEach(row => {
    //const key = row[7] + "|" + row[6] + "|" + row[10] + "|" + row[9]
    const key = row[3] + "|" + row[9] + "|" + row[8]
    if (existingDataSet.has(key)) {
      // destinationData[existingDataSet.get(key)][4] = row[3]
    } else {
      count++
      Logger.log(count)
      destinationData.push(["", "", "", row[3], row[9], row[8], row[5], row[6], ""])
    }
  })

  Logger.log(destinationData.length)


  return

  if (destinationData.length > 0) {
    //Logger.log(destinationData)
    destinationSheet.getRange(3, 1, destinationData.length, destinationData[0].length).setValues(destinationData)
    //.getRange(3, 4, destinationSheet.getLastRow() - 2, 1).clearContent();

    destinationSheet.getRange(3, 1, destinationSheet.getLastRow() - 2, destinationSheet.getLastColumn()).sort([{ column: 7, ascending: false }])
  }




  const dataUpdateLog = ss.getSheetByName("Data Update Log")
  dataUpdateLog.getRange("D4").setValue(new Date())

}











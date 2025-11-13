




function biopsiesDailyCountProcess() {



  //return


  let ss = SpreadsheetApp.getActiveSpreadsheet();


  let dailyApptSheet = ss.getSheetByName("Appt_Daily_Count");
  let dailyApptData = dailyApptSheet.getRange(2, 1, dailyApptSheet.getLastRow() - 1, 5).getDisplayValues();
  let dailyApptIDs = dailyApptData.map(r => (r[0] + r[1] + r[2]).toString().trim())

  let dailyLogSheet = ss.getSheetByName("Daily log (Main)")
  let dailyLogData = []
  if (dailyLogSheet.getLastRow() > 1) {
    dailyLogData = dailyLogSheet.getRange(2, 1, dailyLogSheet.getLastRow() - 1, 5).getDisplayValues();
  }
  let dailyLogIDs = dailyLogData.map(r => (r[0] + r[1] + r[2]).toString().trim())
  let oldDataLength = dailyLogData.length;


  dailyApptIDs.forEach((id, i) => {
    let idIndex = dailyLogIDs.indexOf(id)
    if (idIndex > -1) {
      dailyLogData[idIndex][0] = dailyApptData[i][0]
      dailyLogData[idIndex][1] = dailyApptData[i][1]
      dailyLogData[idIndex][2] = dailyApptData[i][2]
      dailyLogData[idIndex][3] = dailyApptData[i][3]
      dailyLogData[idIndex][4] = dailyApptData[i][4]
    } else {
      dailyLogData.push([dailyApptData[i][0], dailyApptData[i][1], dailyApptData[i][2], dailyApptData[i][3], dailyApptData[i][4]])
    }

  })

  //dailyLogSheet.getRange(2, 1, dailyLogSheet.getLastRow() - 1, dailyLogSheet.getLastColumn()).sort([{ column: 1, ascending: false }])

  if (dailyLogData.length > 0) {
    dailyLogSheet.getRange(2, 1, dailyLogData.length, 5).setValues(dailyLogData)

    let newDataLength = dailyLogData.length
    if (oldDataLength < newDataLength) {
      dailyLogSheet.getRange(2, 1, dailyLogSheet.getLastRow() - 1, dailyLogSheet.getLastColumn()).sort([{ column: 1, ascending: false }])

      let dataUpdateLog = ss.getSheetByName("Data Update Log")

      let columnA = dataUpdateLog.getRange("A1:A").getValues().map(r => r[0]);
      let indexOfDataSource = columnA.indexOf("EMA Appointments Data Processing Sheet");
      if (indexOfDataSource > -1) {
        dataUpdateLog.getRange(indexOfDataSource + 1, 4).setValue(new Date())
      }


    }
  }





}



















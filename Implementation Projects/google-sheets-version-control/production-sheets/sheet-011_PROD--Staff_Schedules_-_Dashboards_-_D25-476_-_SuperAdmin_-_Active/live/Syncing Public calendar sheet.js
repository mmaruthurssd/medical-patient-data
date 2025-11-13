

function syncBtnProcess() {



  syncMACalendar()

  syncFDCalendar()

  syncADMINCalendar()


  syncAllCalendars()

}



function clearBtnProcess() {

  clearAllCalendars()

  clearMACalendar()

  clearFDCalendar()

  clearADMINCalendar()

}






function syncAllCalendars() {

  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getActiveSheet();

  let allRange = "A6:H17"
  let allSettingData = sheet.getRange(allRange).getValues()




  let maRange = "A21:H32"
  let maSettingData = sheet.getRange(maRange).getValues()

  let fdRange = "A36:H47"
  let fdSettingData = sheet.getRange(fdRange).getValues()

  let adminRange = "A51:H62"
  let adminSettingData = sheet.getRange(adminRange).getValues()


  allSettingData.forEach((row, index) => {



    if (row[2] == true || row[2] == "TRUE") {
      maSettingData[index][2] = true
      fdSettingData[index][2] = true
      adminSettingData[index][2] = true

      let newDate = new Date()
      let time = newDate.getHours() + ":" + newDate.getMinutes() + ":" + newDate.getSeconds()

      row[3] = newDate
      row[4] = time
      row[7] = "Synced"
      row[2] = false
    }

  })


  let PublicSS = SpreadsheetApp.openById('1W0mtiqFm6Gwmvr2gz34pqh4lCP_jJtXuV4XvL7-5hm4')

  let PublicMADataSheet = PublicSS.getSheetByName("Schedule_Data_MA")

  syncDataInPublic(ss, sheet, maSettingData, maRange, "Schedule_Data_MA", PublicMADataSheet)


  let PublicFDDataSheet = PublicSS.getSheetByName("Schedule_Data_FD")
  syncDataInPublic(ss, sheet, fdSettingData, fdRange, "Schedule_Data_FD", PublicFDDataSheet)


  let PublicAdimDataSheet = PublicSS.getSheetByName("Schedule_Data_Admin")
  syncDataInPublic(ss, sheet, adminSettingData, adminRange, "Schedule_Data_Admin", PublicAdimDataSheet)


  sheet.getRange(allRange).setValues(allSettingData)

}





function clearAllCalendars() {

  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getActiveSheet();

  let allRange = "A6:H17"
  let allSettingData = sheet.getRange(allRange).getValues()




  let maRange = "A21:H32"
  let maSettingData = sheet.getRange(maRange).getValues()

  let fdRange = "A36:H47"
  let fdSettingData = sheet.getRange(fdRange).getValues()

  let adminRange = "A51:H62"
  let adminSettingData = sheet.getRange(adminRange).getValues()


  allSettingData.forEach((row, index) => {

    maSettingData[index][2] = row[2]
    fdSettingData[index][2] = row[2]
    adminSettingData[index][2] = row[2]

    if (row[2] == true || row[2] == "TRUE") {
      let newDate = new Date()
      let time = newDate.getHours() + ":" + newDate.getMinutes() + ":" + newDate.getSeconds()

      row[5] = newDate
      row[6] = time
      row[7] = "Cleared"
      row[2] = false
    }

  })


  let PublicSS = SpreadsheetApp.openById('1W0mtiqFm6Gwmvr2gz34pqh4lCP_jJtXuV4XvL7-5hm4')

  let PublicMADataSheet = PublicSS.getSheetByName("Schedule_Data_MA")
  clearDataInPublic(sheet, maSettingData, maRange, PublicMADataSheet)

  let PublicFDDataSheet = PublicSS.getSheetByName("Schedule_Data_FD")
  clearDataInPublic(sheet, fdSettingData, fdRange, PublicFDDataSheet)


  let PublicAdimDataSheet = PublicSS.getSheetByName("Schedule_Data_Admin")
  clearDataInPublic(sheet, adminSettingData, adminRange, PublicAdimDataSheet)


  sheet.getRange(allRange).setValues(allSettingData)

}









function syncMACalendar() {

  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getActiveSheet();

  let maRange = "A21:H32"
  let maSettingData = sheet.getRange(maRange).getValues()





  let PublicSS = SpreadsheetApp.openById('1W0mtiqFm6Gwmvr2gz34pqh4lCP_jJtXuV4XvL7-5hm4')
  let PublicMADataSheet = PublicSS.getSheetByName("Schedule_Data_MA")

  Logger.log("Yes")

  syncDataInPublic(ss, sheet, maSettingData, maRange, "Schedule_Data_MA", PublicMADataSheet)

}



function clearMACalendar() {

  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getActiveSheet();

  let maRange = "A21:H32"
  let maSettingData = sheet.getRange(maRange).getValues()

  let PublicSS = SpreadsheetApp.openById('1W0mtiqFm6Gwmvr2gz34pqh4lCP_jJtXuV4XvL7-5hm4')
  let PublicMADataSheet = PublicSS.getSheetByName("Schedule_Data_MA")

  clearDataInPublic(sheet, maSettingData, maRange, PublicMADataSheet)

}















function syncFDCalendar() {

  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getActiveSheet();

  let fdRange = "A36:H47"
  let fdSettingData = sheet.getRange(fdRange).getValues()

  let PublicSS = SpreadsheetApp.openById('1W0mtiqFm6Gwmvr2gz34pqh4lCP_jJtXuV4XvL7-5hm4')
  let PublicFDDataSheet = PublicSS.getSheetByName("Schedule_Data_FD")

  syncDataInPublic(ss, sheet, fdSettingData, fdRange, "Schedule_Data_FD", PublicFDDataSheet)

}


function clearFDCalendar() {

  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getActiveSheet();

  let fdRange = "A36:H47"
  let fdSettingData = sheet.getRange(fdRange).getValues()

  let PublicSS = SpreadsheetApp.openById('1W0mtiqFm6Gwmvr2gz34pqh4lCP_jJtXuV4XvL7-5hm4')
  let PublicFDDataSheet = PublicSS.getSheetByName("Schedule_Data_FD")

  clearDataInPublic(sheet, fdSettingData, fdRange, PublicFDDataSheet)

}

















function syncADMINCalendar() {

  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getActiveSheet();

  let adminRange = "A51:H62"
  let adminSettingData = sheet.getRange(adminRange).getValues()

  let PublicSS = SpreadsheetApp.openById('1W0mtiqFm6Gwmvr2gz34pqh4lCP_jJtXuV4XvL7-5hm4')
  let PublicAdimDataSheet = PublicSS.getSheetByName("Schedule_Data_Admin")

  syncDataInPublic(ss, sheet, adminSettingData, adminRange, "Schedule_Data_Admin", PublicAdimDataSheet)

}


function clearADMINCalendar() {

  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getActiveSheet();

  let adminRange = "A51:H62"
  let adminSettingData = sheet.getRange(adminRange).getValues()

  let PublicSS = SpreadsheetApp.openById('1W0mtiqFm6Gwmvr2gz34pqh4lCP_jJtXuV4XvL7-5hm4')
  let PublicAdimDataSheet = PublicSS.getSheetByName("Schedule_Data_Admin")

  clearDataInPublic(sheet, adminSettingData, adminRange, PublicAdimDataSheet)

}
















function syncDataInPublic(ss, sheet, settingData, range, sourceSheetName, PublicDataSheet) {

  // let rowData = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];


  //Logger.log(settingData)


  let publicData = PublicDataSheet.getRange(1, 1, PublicDataSheet.getLastRow(), PublicDataSheet.getLastColumn()).getValues();


  let SourceDataSheet = ss.getSheetByName(sourceSheetName)
  let sourceAllData = []
  if (sourceSheetName == "Schedule_Data_MA") {
    sourceAllData = SourceDataSheet.getRange(1, 1, SourceDataSheet.getLastRow(), SourceDataSheet.getLastColumn() - 4).getValues();
  } else {
    sourceAllData = SourceDataSheet.getRange(1, 1, SourceDataSheet.getLastRow(), SourceDataSheet.getLastColumn() - 4).getValues();
  }

  settingData.forEach(row => {
    if (row[2] == true || row[2] == "TRUE") {
      let yearSelected = row[0]
      let monthStr = row[1]
      let monthSelected = new Date(monthStr + '-1-01').getMonth()

      //Logger.log(monthSelected)

      let selectedMonthData = [];
      sourceAllData.forEach(row => {
        if (isValidDate_(row[4])) {

          if (row[4].getFullYear() == yearSelected && row[4].getMonth() == monthSelected) {
            selectedMonthData.push(row)
          }

        }
      })


      for (let i = publicData.length - 1; i >= 0; i--) {
        if (!isValidDate_(publicData[i][4])) continue

        if (publicData[i][4].getFullYear() == yearSelected && publicData[i][4].getMonth() == monthSelected) {
          publicData.splice(i, 1)
        }
      }


      publicData = publicData.concat([...selectedMonthData])


      let newDate = new Date()
      let time = newDate.getHours() + ":" + newDate.getMinutes() + ":" + newDate.getSeconds()

      row[3] = newDate
      row[4] = time
      row[7] = "Synced"
      row[2] = false

    }
  })




  PublicDataSheet.getRange(1, 1, PublicDataSheet.getLastRow(), PublicDataSheet.getLastColumn()).clearContent()

  PublicDataSheet.getRange(1, 1, publicData.length, publicData[0].length).setValues(publicData);

  sheet.getRange(range).setValues(settingData)

}

//The number of columns in the data does not match the number of columns in the range. The data has 24 but the range has 23.








function clearDataInPublic(sheet, settingData, range, PublicDataSheet) {


  let publicData = PublicDataSheet.getRange(1, 1, PublicDataSheet.getLastRow(), PublicDataSheet.getLastColumn()).getValues();

  //let settingData = sheet.getRange(range).getValues()

  //let rowData = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];

  settingData.forEach(row => {

    if (row[2] == true || row[2] == "TRUE") {

      let yearSelected = row[0]
      let monthStr = row[1]
      let monthSelected = new Date(monthStr + '-1-01').getMonth()


      for (let i = publicData.length - 1; i >= 0; i--) {
        if (!isValidDate_(publicData[i][4])) continue

        if (publicData[i][4].getFullYear() == yearSelected && publicData[i][4].getMonth() == monthSelected) {
          publicData.splice(i, 1)
        }
      }


      let newDate = new Date()
      let time = newDate.getHours() + ":" + newDate.getMinutes() + ":" + newDate.getSeconds()

      row[5] = newDate
      row[6] = time
      row[7] = "Cleared"
      row[2] = false


    }
  })




  PublicDataSheet.getRange(1, 1, PublicDataSheet.getLastRow(), PublicDataSheet.getLastColumn()).clearContent()

  PublicDataSheet.getRange(1, 1, publicData.length, publicData[0].length).setValues(publicData);

  sheet.getRange(range).setValues(settingData)



}








//below function will return true if the arg is valid date and false if not.
function isValidDate_(d) {
  if (Object.prototype.toString.call(d) !== "[object Date]")
    return false;
  return !isNaN(d.getTime());
}

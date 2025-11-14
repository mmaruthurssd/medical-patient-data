/**
 * this function is for Today_Calls_and_Voicemails_Script
 */
function todayCallLogVocemailDashboardMain() {


  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Today_Calls_and_Voicemails_Script");

  let startDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())
  let endDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())

  allCallLogVocemailDashboard(sheet, startDate, endDate)
}




/**
 * this function is for Weekly_Calls_and_Voicemails_Script
 */
function weeklyCallLogVocemailDashboardMain() {


  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Weekly_Calls_and_Voicemails_Script");

  let startDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())
  startDate.setDate(startDate.getDate() - 6)
  let endDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())

  allCallLogVocemailDashboard(sheet, startDate, endDate)

}






/**
 * this function is for Monthly_Calls_and_Voicemails_Script
 */
function monthlyCallLogVocemailDashboardMain() {


  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Monthly_Calls_and_Voicemails_Script");

  let startDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())
  startDate.setDate(startDate.getDate() - 30)
  let endDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())

  allCallLogVocemailDashboard(sheet, startDate, endDate)

}



function allCallLogVocemailDashboard(sheet, startDate, endDate) {


  let ss = SpreadsheetApp.getActiveSpreadsheet();


  let startTime = startDate.getTime();
  let endTime = new Date(endDate.setDate(endDate.getDate() + 1)).getTime()


  let allCallSheet = ss.getSheetByName("All_Call_Logs");
  let allCalls = allCallSheet.getRange(2, 1, allCallSheet.getLastRow() - 1, allCallSheet.getLastColumn()).getValues();

  let filteredCallLogs = allCalls.filter(r => r[0].getTime() >= startTime && r[0] < endTime)


  filteredCallLogs.sort(function (x, y) {
    var xp = x[0].getTime();
    var yp = y[0].getTime();

    return xp == yp ? 0 : xp < yp ? -1 : 1;
  });




  let voiceMailsSheet = ss.getSheetByName("Voicemails");
  let voiceMails = voiceMailsSheet.getRange(2, 1, voiceMailsSheet.getLastRow() - 1, voiceMailsSheet.getLastColumn()).getValues();


  let filteredVoiceMails = []
  for (var i = 0; i < voiceMails.length; i++) {
    if (!isValidDate_(voiceMails[i][1])) {
      continue
    }

    if (voiceMails[i][1].getTime() >= startTime && voiceMails[i][1] < endTime) {
      filteredVoiceMails.push(voiceMails[i])
    }
  }




  let arrayObj = {}

  for (var i = 0; i < filteredCallLogs.length; i++) {
    let key = filteredCallLogs[i][1].toString();
    if (key.length == 11) {
      key = key.substring('1')
    } else if (key.length < 5) {
      continue
    }

    if (!arrayObj[key]) {
      arrayObj[key] = [[Utilities.formatDate(filteredCallLogs[i][0], 'GMT-6', 'yyyy/M/d'), filteredCallLogs[i][1], filteredCallLogs[i][2], filteredCallLogs[i][0], 1, "", "", ""]]

    } else {
      arrayObj[key].push(["", filteredCallLogs[i][1], filteredCallLogs[i][2], filteredCallLogs[i][0], "", "", "", ""])
      arrayObj[key][0][4] = arrayObj[key].length
    }
  }



  for (const key in arrayObj) {

    for (var i = 0; i < filteredVoiceMails.length; i++) {
      if (key == filteredVoiceMails[i][0]) {
        let foundFlage = false
        for (var j = 0; j < arrayObj[key].length; j++) {
          if (arrayObj[key][j][5] == "" && arrayObj[key][j][6] == "") {
            arrayObj[key][j][5] = filteredVoiceMails[i][7]
            arrayObj[key][j][6] = filteredVoiceMails[i][1]
            arrayObj[key][j][7] = filteredVoiceMails[i][2]
            foundFlage = true
            break;
          }
        }

        if (foundFlage == false) {
          arrayObj[key].push(["", "", "", "", "", filteredVoiceMails[i][7], filteredVoiceMails[i][1], filteredVoiceMails[i][2]])
        }
      }
    }

  }

  let finalData = [];
  let unique = {}

  for (var i = 0; i < filteredCallLogs.length; i++) {
    let key = filteredCallLogs[i][1].toString();
    if (key.length == 11) {
      key = key.substring('1')
    } else if (key.length < 5) {
      continue
    }

    if (!unique[key]) {
      finalData = finalData.concat(arrayObj[key])
      finalData.push(["", "", "", "", "", "", "", ""])
      unique[key] = true
    }
  }


  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent()
  }


  if (finalData.length > 0) {
    sheet.getRange(2, 1, finalData.length, finalData[0].length).setValues(finalData)
  }



}












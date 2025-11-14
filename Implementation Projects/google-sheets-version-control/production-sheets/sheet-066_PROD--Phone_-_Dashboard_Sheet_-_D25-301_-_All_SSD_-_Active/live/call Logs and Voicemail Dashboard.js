

function callLogVocemailDashboardMain() {

  let ui = SpreadsheetApp.getUi();


  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Calls_and_Voicemails_Script");

  let startDate = sheet.getRange("C1").getValue()
  let endDate = sheet.getRange("E1").getValue()

  if (!isValidDate_(startDate)) {
    ui.alert("Invalid!\nStart Date is not Valid.")
    return
  } else if (!isValidDate_(endDate)) {
    ui.alert("Invalid!\nEnd Date is not Valid.")
    return
  }

  let startTime = startDate.getTime();
  let endTime = new Date(endDate.setDate(endDate.getDate() + 1)).getTime()
  // Logger.log(startTime);
  // Logger.log(endTime)

  let allCallSheet = ss.getSheetByName("All_Call_Logs");
  let allCalls = allCallSheet.getRange(2, 1, allCallSheet.getLastRow() - 1, allCallSheet.getLastColumn()).getValues();

  let filteredCallLogs = allCalls.filter(r => r[0].getTime() >= startTime && r[0] < endTime)

  // Logger.log(allCalls.length)
  // Logger.log(filteredCallLogs.length)

  filteredCallLogs.sort(function (x, y) {
    var xp = x[0].getTime();
    var yp = y[0].getTime();

    return xp == yp ? 0 : xp > yp ? -1 : 1;
  });

  //Logger.log(filteredCallLogs);
  // for (var i = 0; i < filteredCallLogs.length; i++) {
  //   Logger.log(filteredCallLogs[i][0])
  // }



  let voiceMailsSheet = ss.getSheetByName("Voicemails");
  let voiceMails = voiceMailsSheet.getRange(2, 1, voiceMailsSheet.getLastRow() - 1, voiceMailsSheet.getLastColumn()).getValues();
  //Logger.log(voiceMails)
  //let filteredVoiceMails = voiceMails.filter(r => r[1].getTime() >= startTime && r[1] < endTime)

  let filteredVoiceMails =[]
  for(var i=0; i<voiceMails.length; i++){
    if(!isValidDate_(voiceMails[i][1])){
      continue
    }

    if(voiceMails[i][1].getTime() >= startTime && voiceMails[i][1] < endTime){
      filteredVoiceMails.push(voiceMails[i])
    }
  }

  

  //let finalData = []
  //let unique = {}
  let arrayObj = {}
  //while (filteredCallLogs.length > 0) {
  for (var i = 0; i < filteredCallLogs.length; i++) {
    let key = filteredCallLogs[i][1].toString();
    if (key.length == 11) {
      key = key.substring('1')
    } else if (key.length < 5) {
      continue
    }

    if (!arrayObj[key]) {
      arrayObj[key] = [[Utilities.formatDate(filteredCallLogs[i][0], 'GMT-6', 'yyyy/M/d'), filteredCallLogs[i][1], filteredCallLogs[i][2], filteredCallLogs[i][0], 1, "", "", ""]]
      //arrayObj[key] = [[filteredCallLogs[i][0], filteredCallLogs[i][1], filteredCallLogs[i][2], filteredCallLogs[i][0], 1, "", "", ""]]
    } else {
      arrayObj[key].push(["", filteredCallLogs[i][1], filteredCallLogs[i][2], filteredCallLogs[i][0], "", "", "", ""])
      arrayObj[key][0][4] = arrayObj[key].length
    }
  }
  //}


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
  // for (const key in arrayObj) {
  //   Logger.log(key)
  // finalData.push(["", "", "", "", "", "", ""])
  // finalData = finalData.concat(arrayObj[key])
  // }

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


  if (sheet.getLastRow() > 4) {
    sheet.getRange(5, 1, sheet.getLastRow() - 4, sheet.getLastColumn()).clearContent()
  }

  // Logger.log(finalData.length)
  // Logger.log(finalData[0].length)

  sheet.getRange(4, 1, finalData.length, finalData[0].length).setValues(finalData)




}







function testFuncNumber() {
  let obj = {
    "234": [1, 2],
    "567": [3, 2],
    "8": [4, 5],
    "9": [4, 5]
  }

  for (const key in obj) {
    Logger.log(key)
  }
}





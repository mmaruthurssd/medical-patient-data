



function todayCallsSSDVocemailDashboard() {

  //return

  let ss = SpreadsheetApp.getActiveSpreadsheet();

  let ssdVoiceMailSS = SpreadsheetApp.openById("1Ej8wzt6U6C-x5Ex9bv0ZRBZs5RFff0Xpi3Zak4r8u4E")
  let sheet = ssdVoiceMailSS.getSheetByName("Repeat Calls / VM Today")






  let existingData = []
  if (sheet.getLastRow() > 1) {
    existingData = sheet.getRange(2, 1, sheet.getLastRow() - 1, 6).getValues().filter(r => r[0] != "" || r[3] != "" || r[4] != "")
  }




  let allCallSheet = ss.getSheetByName("Today_Pivot_Data");
  let allCalls = []

  if (allCallSheet.getLastRow() > 0) {
    allCalls = allCallSheet.getRange(2, 1, allCallSheet.getLastRow() - 1, allCallSheet.getLastColumn()).getValues();
  }

  if (allCalls.length == 0) return

  if (!isValidDate_(allCalls[0][0])) return


  let startDate = new Date(allCalls[0][0].getFullYear(), allCalls[0][0].getMonth(), allCalls[0][0].getDate())
  let endDate = new Date(allCalls[0][0].getFullYear(), allCalls[0][0].getMonth(), allCalls[0][0].getDate())
  let startTime = startDate.getTime();
  let endTime = new Date(endDate.setDate(endDate.getDate() + 1)).getTime()

  //let filteredCallLogs = allCalls.filter(r => r[0].getTime() >= startTime && r[0] < endTime)

  let filteredCallLogs = []
  for (var i = 0; i < allCalls.length; i++) {

    if (!isValidDate_(allCalls[i][0])) continue

    if (allCalls[i][0].getTime() >= startTime && allCalls[i][0] < endTime) {
      filteredCallLogs.push(allCalls[i])
    }
  }


  filteredCallLogs.sort(function (x, y) {
    var xp = x[0].getTime();
    var yp = y[0].getTime();

    return xp == yp ? 0 : xp < yp ? -1 : 1;
  });






  let arrayObj = {};
  let finalData = [];
  let filteredNumbers = [];
  for (var i = 0; i < filteredCallLogs.length; i++) {
    let key = filteredCallLogs[i][1].toString();
    if (key.length == 11) {
      key = key.substring('1')
    } else if (key.length < 5) {
      continue
    }

    if (!arrayObj[key]) {
      finalData.push([filteredCallLogs[i][0], filteredCallLogs[i][4], filteredCallLogs[i][5], filteredCallLogs[i][2], key, 1])
      filteredNumbers.push(key.toString())
      arrayObj[key] = true
    } else {
      let numberIndex = filteredNumbers.indexOf(key.toString())
      finalData[numberIndex][5] = finalData[numberIndex][5] + 1
    }
  }




  let filteredFinalData = finalData.filter(r => r[5] > 1)



  let todayTime = new Date().getTime() - (26 * 60 * 60 * 1000)
  for (var i = 0; i < filteredFinalData.length; i++) {
    let foundFlage = false
    for (var j = 0; j < existingData.length; j++) {
      if (!isValidDate_(existingData[j][0])) {
        continue
      }

      if (existingData[j][0].getTime() > todayTime) {

        //let existingDate = Utilities.formatDate(existingData[j][0], 'GMT-6', 'yyyy/M/d');
        if (existingData[j][0].getDate() == filteredFinalData[i][0].getDate() && existingData[j][0].getMonth() == filteredFinalData[i][0].getMonth() && existingData[j][0].getFullYear() == filteredFinalData[i][0].getFullYear() && existingData[j][1] == filteredFinalData[i][1] && existingData[j][2] == filteredFinalData[i][2] && existingData[j][3] == filteredFinalData[i][3] && existingData[j][4].toString() == filteredFinalData[i][4].toString()) {

          existingData[j][5] = filteredFinalData[i][5]
          foundFlage = true
          break
        }
      }

    }

    if (foundFlage == false) {
      existingData.push([filteredFinalData[i][0], filteredFinalData[i][1], filteredFinalData[i][2], filteredFinalData[i][3], filteredFinalData[i][4], filteredFinalData[i][5]])
    }
  }



  // return

  sheet.getRange(2, 1, existingData.length, existingData[0].length).setValues(existingData)


  sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).sort([{ column: 1, ascending: false }])





}









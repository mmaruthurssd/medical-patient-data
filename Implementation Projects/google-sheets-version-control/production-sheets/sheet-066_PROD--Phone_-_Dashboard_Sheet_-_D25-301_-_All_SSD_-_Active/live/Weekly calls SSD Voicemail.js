











function weeklyCallsSSDVocemailDashboard() {

  return


  let ss = SpreadsheetApp.getActiveSpreadsheet();

  let ssdVoiceMailSS = SpreadsheetApp.openById("1Ej8wzt6U6C-x5Ex9bv0ZRBZs5RFff0Xpi3Zak4r8u4E")
  let sheet = ssdVoiceMailSS.getSheetByName("Repeat Calls / VM Last 7 days")

  let existingData = []
  if (sheet.getLastRow() > 1) {
    existingData = sheet.getRange(2, 1, sheet.getLastRow() - 1, 8).getValues().filter(r => r[0] != "" || r[1] != "")
  }








  let allCallSheet = ss.getSheetByName("Weekly_Pivot_Data");
  let allCalls = allCallSheet.getRange(2, 1, allCallSheet.getLastRow() - 1, allCallSheet.getLastColumn()).getValues();


  let [startDate, endDate] = getCurrentWeekDates_(allCalls[0][0])
  let startEndDateStr = Utilities.formatDate(startDate, "GMT-6", "MM/dd/yyyy") + "-" + Utilities.formatDate(endDate, "GMT-6", "MM/dd/yyyy")
  let startTime = startDate.getTime();
  let endTime = endDate.getTime() + (24 * 60 * 60 * 1000)

  let weekNum = parseInt(Utilities.formatDate(endDate, "GMT", "w"));
  let weekStr = "Week " + weekNum
  let year = endDate.getFullYear()



  let filteredCallLogs = []
  for (var i = 0; i < allCalls.length; i++) {
    if (!isValidDate_(allCalls[i][0])) {
      continue
    }

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
      finalData.push([year, weekStr, startEndDateStr, filteredCallLogs[i][4], filteredCallLogs[i][5], filteredCallLogs[i][2], key, 1])
      //finalData.push([startDate, "", filteredCallLogs[i][4], filteredCallLogs[i][5], filteredCallLogs[i][2], key, 1])
      filteredNumbers.push(key.toString())
      arrayObj[key] = true
    } else {
      let numberIndex = filteredNumbers.indexOf(key.toString())
      finalData[numberIndex][7] = finalData[numberIndex][7] + 1
    }
  }


  let filteredFinalData = finalData.filter(r => r[7] > 2)


  for (var i = 0; i < filteredFinalData.length; i++) {
    let foundFlage = false
    for (var j = 0; j < existingData.length; j++) {

  

      if (existingData[j][0] == year && existingData[j][1] == weekStr && existingData[j][6].toString() == filteredFinalData[i][6].toString()) {

        existingData[j][7] = filteredFinalData[i][7]

        foundFlage = true
        break
      }
    }

    if (foundFlage == false) {
      existingData.push([filteredFinalData[i][0], filteredFinalData[i][1], filteredFinalData[i][2], filteredFinalData[i][3], filteredFinalData[i][4], filteredFinalData[i][5], filteredFinalData[i][6], filteredFinalData[i][7]])
    }
  }





  sheet.getRange(2, 1, existingData.length, existingData[0].length).setValues(existingData)

  sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).sort([{ column: 1, ascending: false }, { column: 2, ascending: false }])


}






function getCurrentWeekDates_(date) {
  var currentDate = new Date(date);
  var dayOfWeek = currentDate.getDay(); // 0 for Sunday, 1 for Monday, etc.
  var startOfWeek = new Date(currentDate); // Copy date
  startOfWeek.setDate(currentDate.getDate() - dayOfWeek); // Set to Monday of the week
  var endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Add 6 days to get Sunday of the week

  return [startOfWeek, endOfWeek];

  //return { start: startOfWeek, end: endOfWeek };
}




// function getCurrentWeekDates_() {

//   let today = new Date();
//   let currentDay = today.getDay(); // 0 (Sunday) to 6 (Saturday)
//   let diff = today.getDate() - currentDay; // Get the difference of the current day with Sunday
//   let startOfWeek = new Date(today.setDate(diff));

//   // To get the end of the week (Saturday), add 6 days to the start of the week
//   let endOfWeek = new Date(startOfWeek);
//   endOfWeek.setDate(startOfWeek.getDate() + 6);

//   let startDate = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate());
//   let endDate = new Date(endOfWeek.getFullYear(), endOfWeek.getMonth(), endOfWeek.getDate())

//   // Logger.log(new Date(startDate.setDate(startDate.getDate() + 1)))
//   // Logger.log(new Date(endDate.setDate(endDate.getDate() + 2)))

//   return [new Date(startDate.setDate(startDate.getDate() + 1)), new Date(endDate.setDate(endDate.getDate() + 2))]


// }












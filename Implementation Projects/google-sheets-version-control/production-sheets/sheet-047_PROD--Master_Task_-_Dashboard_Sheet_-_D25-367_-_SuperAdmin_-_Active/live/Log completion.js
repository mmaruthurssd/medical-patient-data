

//DAILY_SUPER
//DAILY_ADMIN
//DAILY_REMOTE



// function addDailyDataTasksMetricsLog() {

//   const ss = SpreadsheetApp.getActiveSpreadsheet()

//   const QuerySheet = ss.getSheetByName('Metrics_Query');
//   const LogSheet = ss.getSheetByName('Daily Task History');


//   const DailyLogData = QuerySheet.getRange('A3:J').getDisplayValues().filter(row => row[0] !== '').map(r => [r[0], r[2], r[5], r[9], r[4], r[8]]);

//   if (DailyLogData.length > 0) {
//     LogSheet.getRange(LogSheet.getLastRow() + 1, 1, DailyLogData.length, DailyLogData[0].length).setValues(DailyLogData);
//   }
// }






function logDailyCompletion() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(DAILY_SHEET_NAME);


  let resultObj = {}

  const dailySuper = sheet.getRange("DAILY_SUPER").getDisplayValues()
  resultObj = processCountCompeltion_(resultObj, dailySuper, "Super Admin")

  const dailyAdmin = sheet.getRange("DAILY_ADMIN").getDisplayValues()
  resultObj = processCountCompeltion_(resultObj, dailyAdmin, "Admin")

  const dailyRemote = sheet.getRange("DAILY_REMOTE").getDisplayValues()
  resultObj = processCountCompeltion_(resultObj, dailyRemote, "Remote")


  //Logger.log(resultObj)

  let todayDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())

  let finalResults = [];

  for (const name in resultObj) {

    for (const type in resultObj[name]) {
      let rowData = [todayDate, name, type, resultObj[name][type]["completed"], resultObj[name][type]["total"], resultObj[name][type]["completed"] + "/" + resultObj[name][type]["total"]]

      finalResults.push(rowData)
    }
  }


  const destSheet = ss.getSheetByName("Daily Task History");
  destSheet.getRange(destSheet.getLastRow() + 1, 1, finalResults.length, finalResults[0].length).setValues(finalResults)







  // for (var i = 1; i < dailySuper.length; i++) {

  //   if (resultObj[dailySuper[i][4]]) {

  //     if (resultObj[dailySuper[i][4]]["Super"]) {
  //       resultObj[dailySuper[i][4]]["Super"]['total'] += 1
  //       if (dailySuper[i][5] != "") {
  //         resultObj[dailySuper[i][4]]["Super"]['completed'] += 1
  //       }
  //     } else {
  //       if (dailySuper[i][5] != "") {
  //         resultObj[dailySuper[i][4]]["Super"] = { total: 1, completed: 1 }
  //       } else {
  //         resultObj[dailySuper[i][4]]["Super"] = { total: 1, completed: 0 }
  //       }
  //     }

  //   } else {
  //     if (dailySuper[i][5] != "") {
  //       resultObj[dailySuper[i][4]] = { Super: { total: 1, completed: 1 } }
  //     } else {
  //       resultObj[dailySuper[i][4]] = { Super: { total: 1, completed: 0 } }
  //     }
  //   }

  // }




}





function processCountCompeltion_(resultObj, allData, type) {

  for (var i = 1; i < allData.length; i++) {

    if (allData[i][4] == "") continue

    if (resultObj[allData[i][4]]) {

      if (resultObj[allData[i][4]][type]) {
        resultObj[allData[i][4]][type]['total'] += 1
        if (allData[i][5] != "") {
          resultObj[allData[i][4]][type]['completed'] += 1
        }
      } else {
        if (allData[i][5] != "") {
          resultObj[allData[i][4]][type] = { total: 1, completed: 1 }
        } else {
          resultObj[allData[i][4]][type] = { total: 1, completed: 0 }
        }
      }

    } else {
      resultObj[allData[i][4]] = {}
      if (allData[i][5] != "") {
        //resultObj[allData[i][4]] = {}
        resultObj[allData[i][4]][type] = { total: 1, completed: 1 }
      } else {
        resultObj[allData[i][4]][type] = { total: 1, completed: 0 }
      }
    }
  }

  return resultObj
}



















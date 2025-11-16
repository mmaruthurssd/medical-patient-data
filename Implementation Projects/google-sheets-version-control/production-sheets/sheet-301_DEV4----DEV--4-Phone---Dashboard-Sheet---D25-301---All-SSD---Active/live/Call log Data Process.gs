

function callLogDataProcess() {
  let ss = SpreadsheetApp.getActiveSpreadsheet();

  let todaySheet = ss.getSheetByName("Today_Calls");
  let todayLogs = [];
  if (todaySheet.getLastRow() > 1) {
    todayLogs = todaySheet.getRange(2, 1, todaySheet.getLastRow() - 1, todaySheet.getLastColumn()).getValues();
  }


  const Date_ = Utilities.formatDate(new Date(), 'GMT-6', 'yyyy/M/d');
  let processedCalls = [];
  for (var i = 0; i < todayLogs.length; i++) {
    try {

      let createdAt = todayLogs[i][2]
      if (!isValidDate_(createdAt)) {
        continue
      }

      let createdDateStr = Utilities.formatDate(createdAt, 'GMT-6', 'yyyy/M/d');

      if (createdDateStr != Date_) {
        continue
      }

      let createdTime = createdAt.getTime()
      let createdStartTime = createdTime - (29 * 60 * 1000)
      let createdEndTime = createdTime + (29 * 60 * 1000)

      let clid = todayLogs[i][1];
      let nameMatch = /"([^"]+)"/.exec(clid);
      let numberMatch = /<(\d+)>/.exec(clid);

      let duration = todayLogs[i][15]


      let foundFlage = false
      for (var j = 0; j < processedCalls.length; j++) {
        if (processedCalls[j][2] == nameMatch[1] && processedCalls[j][1] == numberMatch[1]) {
          let processedTime = processedCalls[j][0].getTime();

          if (processedTime >= createdStartTime && processedTime <= createdEndTime) {

            processedCalls[j][3] = Number(processedCalls[j][3]) + duration
            foundFlage = true
            break;
          }
        }
      }

      if (foundFlage == false) {
        processedCalls.push([createdAt, numberMatch[1], nameMatch[1], duration])
      }
    } catch (err) {

    }
  }



  let callLogsSheet = ss.getSheetByName("All_Call_Logs");
  let callLogsData = [];
  if (callLogsSheet.getLastRow() > 1) {
    callLogsData = callLogsSheet.getRange(2, 1, callLogsSheet.getLastRow() - 1, 4).getValues();
  }



  for (var i = callLogsData.length - 1; i >= 0; i--) {
    let callDateStr = Utilities.formatDate(callLogsData[i][0], 'GMT-6', 'yyyy/M/d');

    if (callDateStr == Date_) {
      callLogsData.splice(i, 1)
    }

  }


  callLogsData = callLogsData.concat(processedCalls)

  SpreadsheetApp.flush()
  Utilities.sleep(5000)

  if (callLogsData.length > 0) {
    callLogsSheet.getRange(2, 1, callLogsData.length, 4).setValues(callLogsData);
  }



}














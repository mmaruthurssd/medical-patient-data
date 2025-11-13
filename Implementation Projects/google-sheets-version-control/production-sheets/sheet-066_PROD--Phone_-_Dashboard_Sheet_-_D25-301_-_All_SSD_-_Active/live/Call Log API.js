



function fetchCDRSmain() {

  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let apiDetailSheet = ss.getSheetByName(API_DETAILS_SHEET);
  let token = apiDetailSheet.getRange("B2").getValue();

  Logger.log(token)

  let url = "https://w.clearlyip.cloud/api/v1/cdrs?limit=999&start=0";


  //Set the HTTP headers
  let options = {
    "method": "GET",
    "headers": { "Authorization": "Bearer " + token },
  };

  let response = UrlFetchApp.fetch(url, options);
  let resultText = response.getContentText();
  let resultObj = JSON.parse(resultText);

  const Date_ = Utilities.formatDate(new Date(), 'GMT-6', 'yyyy/M/d');



  let newCallLogs = [];
  for (var i = 0; i < resultObj.cdrs.length; i++) {


    //Logger.log(resultObj.cdrs[i])

    //continue

    let createdAtDate = Utilities.formatDate(new Date(resultObj.cdrs[i].created_at), 'GMT-6', 'yyyy/M/d');

    if (createdAtDate != Date_) {
      continue
    }

    let newCallLogRow = [new Date(resultObj.cdrs[i].answer), resultObj.cdrs[i].clid, new Date(resultObj.cdrs[i].created_at), resultObj.cdrs[i].acallee == null ? "" : resultObj.cdrs[i].acallee, resultObj.cdrs[i].did, new Date(resultObj.cdrs[i].end), resultObj.cdrs[i].acaller, resultObj.cdrs[i].src, resultObj.cdrs[i].queuename, resultObj.cdrs[i].dst, resultObj.cdrs[i].disposition, new Date(resultObj.cdrs[i].calldate), resultObj.cdrs[i].lastapp, resultObj.cdrs[i].uniqueid, resultObj.cdrs[i].calltype, resultObj.cdrs[i].duration]


    newCallLogs.push(newCallLogRow)


  }

  //return




  let todaysSheet = ss.getSheetByName("Today_Calls");
  let todaysSheetData = []
  if (todaysSheet.getLastRow() > 1) {
    todaysSheetData = todaysSheet.getRange(2, 1, todaysSheet.getLastRow() - 1, 16).getValues();
  }

  let todaysData = []
  for (var i = 0; i < todaysSheetData.length; i++) {
    if (!isValidDate_(todaysSheetData[i][2])) {
      continue
    }
    let createdAtDate = Utilities.formatDate(todaysSheetData[i][2], 'GMT-6', 'yyyy/M/d');
    if (createdAtDate != Date_) {
      continue
    }
    todaysData.push(todaysSheetData[i])
  }




  for (var i = 0; i < newCallLogs.length; i++) {
    let foundFlage = false
    for (var j = 0; j < todaysData.length; j++) {
      if (todaysData[j][1] == newCallLogs[i][1] && todaysData[j][2].getTime() == newCallLogs[i][2].getTime() && todaysData[j][3] == newCallLogs[i][3] && todaysData[j][4] == newCallLogs[i][4] && todaysData[j][5].getTime() == newCallLogs[i][5].getTime() && todaysData[j][6] == newCallLogs[i][6] && todaysData[j][7] == newCallLogs[i][7] && todaysData[j][9] == newCallLogs[i][9] && todaysData[j][10] == newCallLogs[i][10] && todaysData[j][11].getTime() == newCallLogs[i][11].getTime() && todaysData[j][12] == newCallLogs[i][12] && todaysData[j][14] == newCallLogs[i][14] && todaysData[j][15] == newCallLogs[i][15]) {
        foundFlage = true
        break
      }
    }

    if (foundFlage == false) {
      todaysData.push(newCallLogs[i])
    }
  }


  if (todaysSheet.getLastRow() > 1) {
    todaysSheet.getRange(2, 1, todaysSheet.getLastRow() - 1, todaysSheet.getLastColumn()).clearContent()
  }

  if (todaysData.length > 0) {
    todaysSheet.getRange(2, 1, todaysData.length, todaysData[0].length).setValues(todaysData);
  }





}




















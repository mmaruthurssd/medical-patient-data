
//const API_TEST_TOKEN = "5dH97096zW74frF949h5453kXeDvCz0N8DMboDIRvrc"

const API_TEST_TOKEN = "lSeRBJX9fzBzC6dlkosfQ0R_PqiylSvn9RSHqefdut4"






function fetchCDRSmainTest() {

  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let apiDetailSheet = ss.getSheetByName(API_DETAILS_SHEET);
  let token = apiDetailSheet.getRange("B2").getValue();



  //let url = "https://w.clearlyip.cloud/api/v1/cdrs?limit=500&start=0&date_from=2023-09-24&date_to=2023-09-25"
  let url = "https://w.clearlyip.cloud/api/v1/cdrs?limit=999&start=0"

  //Set the HTTP headers
  let options = {
    "method": "GET",
    "headers": { "Authorization": "Bearer " + token },
  };

  let response = UrlFetchApp.fetch(url, options);
  let resultText = response.getContentText();
  let resultObj = JSON.parse(resultText);


  Logger.log(resultObj.cdrs.length)
  Logger.log(resultObj.cdrs[0])


  //let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Call_Logs_Raw");


  // let callLogsData = sheet.getRange(1, 1, sheet.getLastRow(), 15).getValues();

  // let uniqueObj = {};

  // for (var i = 0; i < callLogsData.length; i++) {
  //   let key = callLogsData[i].join(",");
  //   if (!uniqueObj[key]) {
  //     uniqueObj[key] = true
  //   }
  // }




  let newCallLogs = [];
  for (var i = 0; i < resultObj.cdrs.length; i++) {

    //Logger.log(resultObj.cdrs[i].queuename)
    // if(new Date(resultObj.cdrs[i].answer).getFullYear()==1969){
    //   continue
    // }
    let newCallLogRow = [new Date(resultObj.cdrs[i].answer), resultObj.cdrs[i].clid, new Date(resultObj.cdrs[i].created_at), resultObj.cdrs[i].acallee, resultObj.cdrs[i].did, new Date(resultObj.cdrs[i].end), resultObj.cdrs[i].acaller, resultObj.cdrs[i].src, resultObj.cdrs[i].queuename, resultObj.cdrs[i].dst, resultObj.cdrs[i].disposition, resultObj.cdrs[i].calldate, resultObj.cdrs[i].lastapp, resultObj.cdrs[i].uniqueid, resultObj.cdrs[i].calltype, resultObj.cdrs[i].duration, resultObj.cdrs[i].billsec, resultObj.cdrs[i].callid, resultObj.cdrs[i].id, resultObj.cdrs[i].channel, resultObj.cdrs[i].lastdata]

    let key = newCallLogRow.join(",")

    //if (!uniqueObj[key]) {
    newCallLogs.push(newCallLogRow)
    //uniqueObj[key] = true
    //}

  }




  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, 21).clearContent()
  }
  sheet.getRange(2, 1, newCallLogs.length, newCallLogs[0].length).setValues(newCallLogs)




}

//https://w.clearlyip.cloud/api/v1/cdrs/friendly_calls_by_date



function testJoin() {
  let arr = ["A", null, "B"]

  Logger.log(arr.join(","))
}























/**
 * this fucntion fetch the voicemails of the users
 * 
 * @param1 {token} is the string of api access token
 * @param2 {username} is a string of user for fetching his voicemails
 */
function getVoiceMail_(token, username) {

  let url = "https://w.clearlyip.cloud/api/v1/voicemails/" + username + "?limit=999&start=0&sort_column=origtime&sort_direction=DESC"

  //Set the HTTP headers
  let options = {
    "method": "GET",
    "headers": { "Authorization": "Bearer " + token },
  };

  let response = UrlFetchApp.fetch(url, options);
  let resultText = response.getContentText();
  let resultObj = JSON.parse(resultText);

  return resultObj
}

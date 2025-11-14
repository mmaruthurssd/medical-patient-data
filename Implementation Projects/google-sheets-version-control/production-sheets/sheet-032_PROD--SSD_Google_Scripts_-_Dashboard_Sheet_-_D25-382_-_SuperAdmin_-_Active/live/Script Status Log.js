




function getScriptExecutionStatusMain() {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Scripts Log");

  let sheetData = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();

  let todayDate = new Date(new Date().setHours(0, 0, 0, 0));

  let isoDate = todayDate.toISOString()


  const Token = ScriptApp.getOAuthToken();
  const Headers = {
    'Accept': 'application/json',
    'Authorization': 'Bearer ' + Token
  };





  const Options = {
    'method': 'GET',
    'headers': Headers,
    'muteHttpExceptions': true
  }




  let errorLogSheet = ss.getSheetByName("Error Log");
  let allErrorData = [];

  if (errorLogSheet.getLastRow() > 1) {
    allErrorData = errorLogSheet.getRange(2, 1, errorLogSheet.getLastRow() - 1, errorLogSheet.getLastColumn()).getValues().filter(row => row[6].getTime() < todayDate.getTime())
  }







  let newData = []
  sheetData.forEach(row => {

    const ScriptID = row[0]
    const FuncName = row[5]
    const EndPoint = 'https://script.googleapis.com/v1/processes:listScriptProcesses';
    const Url = EndPoint + '?pageSize=200&scriptId=' + ScriptID + '&scriptProcessFilter.functionName=' + FuncName + '&scriptProcessFilter.startTime=' + isoDate;

    let results = fetchMetrics_(Url, Options, row)
    row = results.rowData
    let errorsArr = results.errorDetails
    newData.push([row[4], row[5], row[6], row[7], row[8], row[9], row[10], row[11]])

    if (errorsArr.length > 0) {
      errorsArr.forEach(el => {
        allErrorData.push([ScriptID, todayDate, row[3], el[0], row[5], el[1], el[2], el[3], el[4]])
      })
    }

  })

  if (newData.length > 0) {
    sheet.getRange(2, 5, newData.length, newData[0].length).setValues(newData)
  }

  if (allErrorData.length > 0) {
    errorLogSheet.getRange(2, 1, allErrorData.length, allErrorData[0].length).setValues(allErrorData)
  }



}








function fetchMetrics_(Url, Options, rowData) {

  let errorDetails = [];

  const Response = getScriptsData_(Url, Options);

  if (Response == null) {

    rowData[10] = 0
    rowData[11] = 0
    return { rowData: rowData, errorDetails: errorDetails }
  }

  //Logger.log(Response)
  let turnPage = Response.turnPage;

  //Logger.log(Response)

  //Logger.log(turnPage)
  if (turnPage == true) {
    if (Response.data.processes.length > 0) {
      rowData[4] = Response.data.processes[0]["projectName"]
      rowData[6] = Response.data.processes[0]["processType"]
      rowData[7] = new Date(Response.data.processes[0]["startTime"])
      rowData[8] = Response.data.processes[0]["duration"]
      rowData[9] = Response.data.processes[0]["processStatus"]

      rowData[10] = 0
      rowData[11] = 0

      if (Response.data.processes[0]["processStatus"] == "FAILED") {
        rowData[11] = 1;
        errorDetails.push([Response.data.processes[0]["projectName"], Response.data.processes[0]["processType"], new Date(Response.data.processes[0]["startTime"]), Response.data.processes[0]["duration"], Response.data.processes[0]["processStatus"]])
      } else {
        rowData[10] = 1;
      }

      Response.data.processes.splice(0, 1)
      Response.data.processes.forEach(r => {
        if (r["processStatus"] == "FAILED") {
          rowData[11]++;
          errorDetails.push([r["projectName"], r["processType"], new Date(r["startTime"]), r["duration"], r["processStatus"]])
        } else {
          rowData[10]++;
        }
      })
    }
  } else {
    rowData[10] = 0
    rowData[11] = 0
  }

  if (turnPage) {

    let nextPageToken = Response.data.nextPageToken;

    do {
      const NewURL = Url + '&pageToken=' + encodeURIComponent(nextPageToken);
      const NewResponse = getScriptsData_(NewURL, Options);

      if (NewResponse != null) {
        turnPage = NewResponse.turnPage;
        nextPageToken = NewResponse.data.nextPageToken;

        //Logger.log(NewResponse)
        if (turnPage == true) {
          NewResponse.data.processes.forEach(r => {
            if (r["processStatus"] == "FAILED") {
              rowData[11]++;
              errorDetails.push([r["projectName"], r["processType"], new Date(r["startTime"]), r["duration"], r["processStatus"]])
            } else {
              rowData[10]++;
            }
          })
        }
      }

    }

    while (turnPage);

  }


  return { rowData: rowData, errorDetails: errorDetails }

}


function getScriptsData_(Url, Options) {

  const Response = UrlFetchApp.fetch(Url, Options);

  if (Response.getResponseCode() !== 200) {
    //console.log(Response.getContentText());
    return null;
  }
  else {

    const Data = JSON.parse(Response);
    const Processes = Data.processes;

    let turnPage = true;

    if (Processes !== undefined) {
      //console.log(Processes);
      turnPage = true;
    }
    else {
      turnPage = false;
    }

    return {
      'data': Data,
      'turnPage': turnPage
    }

  }

}








function fetchEmployeesTest() {
  //getNewTokenMain_()
  //let url = "https://apis.paycor.com/v1/employees/166969885673122/person"
  //https://apis.paycor.com/v1/employees/{employeeId}
  //let url="https://apis.paycor.com/v1/tenants/194759";
  let url = "https://apis.paycor.com/v1/tenants/194759/employees"

  //var url = "https://apis.paycor.com/v1/companies/" + companyId + "/employees/" + employeeId;

  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let apiDetailSheet = ss.getSheetByName(API_DETAILS_SHEET);
  let token = apiDetailSheet.getRange("B2").getValue();

  var headers = {
    //"accept": "application/json",
    //"Content-Type": "application/json",

    "Authorization": "Bearer " + token,
    //"Authorization": token,
    "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY
    //"subscription-key": "b9080358834840e8a1d8f37aaf277781"
  };
  var options = {
    "method": "GET",
    "headers": headers,
    //"contentType": "application/x-www-form-urlencoded",
    //"muteHttpExceptions": true // Optional: set to true to catch HTTP exceptions
  };

  var response = UrlFetchApp.fetch(url, options);
  //Logger.log(response)
  let result = response.getContentText();

  let resultObj = JSON.parse(result);

  //Logger.log(resultObj)

  // Logger.log(resultObj.hasMoreResults)
  // Logger.log(resultObj.continuationToken)
  // Logger.log(resultObj.additionalResultsUrl)

  // Logger.log(resultObj.records[0]); // Outputs the result to the Logs (View > Logs)

  // return

  let allEmployee = []
  resultObj.records.forEach(record => {
    allEmployee.push([record.employee.id, record.firstName, record.middleName, record.lastName, record.employeeNumber, record.firstName + " " + record.lastName])
  })


  let employeeSheet = ss.getSheetByName("Employees");

  let allEmployeesIDs = employeeSheet.getRange(1, 1, employeeSheet.getLastRow(), 1).getValues().map(r => r[0].toString().trim())

  let filterEmployee = [];
  allEmployee.forEach(emp => {
    let empIndex = allEmployeesIDs.indexOf(emp[0].toString().trim())

    if(empIndex==-1){
      employeeSheet.appendRow(emp)
    }
  })

  
}









function getOneEmployeeHours() {

  let url = "https://apis.paycor.com/v1/employees/bbd84b8a-60ec-0000-0000-000009460200/hours?startDate=11-19-2023&endDate=11-23-2023"

  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let apiDetailSheet = ss.getSheetByName(API_DETAILS_SHEET);
  let token = apiDetailSheet.getRange("B2").getValue();

  var headers = {
    //"accept": "application/json",
    //"Content-Type": "application/json",

    "Authorization": "Bearer " + token,
    //"Authorization": token,
    "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY
    //"subscription-key": "b9080358834840e8a1d8f37aaf277781"
  };
  var options = {
    "method": "GET",
    "headers": headers,
    //"contentType": "application/x-www-form-urlencoded",
    //"muteHttpExceptions": true // Optional: set to true to catch HTTP exceptions
  };

  var response = UrlFetchApp.fetch(url, options);
  //Logger.log(response)
  var result = response.getContentText();

  let resultObj = JSON.parse(result);

  Logger.log(resultObj.details)

  Logger.log(resultObj.details[0]);
  Logger.log(resultObj.details[1]);
  Logger.log(resultObj.details[2]);
  Logger.log(resultObj.details[3]);
  Logger.log(resultObj.details[4]);
  Logger.log(resultObj.details[5]);
}



function fetchPayRates() {
  //let url = "https://apis.paycor.com/v1/employees/5a7a8cfe-7c9f-0000-0000-000009460200"
  //https://apis.paycor.com/v1/employees/{employeeId}
  //let url="https://apis.paycor.com/v1/tenants/194759";
  //let url="https://apis.paycor.com/v1/tenants/194759/employees"

  //var url = "https://apis.paycor.com/v1/companies/" + companyId + "/employees/" + employeeId;

  let url = "https://apis.paycor.com/v1/employees/bbd84b8a-60ec-0000-0000-000009460200/hours?startDate=11-19-2023&endDate=11-23-2023"
  //let url="https://apis.paycor.com/v1/employees/5a7a8cfe-7c9f-0000-0000-000009460200/payrates"
  //let url="https://apis.paycor.com/v1/employees/8306c327-9f85-0000-0000-000009460200/timeoffrequests?startDate=11-19-2023&endDate=11-23-2023"
  //https://apis.paycor.com/v1/employees/{employeeId}/timeoffrequests
  //let url="https://apis.paycor.com/v1/employees/e4381fd6-e8ab-0000-0000-000009460200/timeoffrequests?startDate=11-19-2023&endDate=11-23-2023"

  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let apiDetailSheet = ss.getSheetByName(API_DETAILS_SHEET);
  let token = apiDetailSheet.getRange("B2").getValue();

  var headers = {
    //"accept": "application/json",
    //"Content-Type": "application/json",

    "Authorization": "Bearer " + token,
    //"Authorization": token,
    "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY
    //"subscription-key": "b9080358834840e8a1d8f37aaf277781"
  };
  var options = {
    "method": "GET",
    "headers": headers,
    //"contentType": "application/x-www-form-urlencoded",
    "muteHttpExceptions": true // Optional: set to true to catch HTTP exceptions
  };

  var response = UrlFetchApp.fetch(url, options);
  //Logger.log(response)
  var result = response.getContentText();

  let resultObj = JSON.parse(result);
  Logger.log(resultObj)
  // Logger.log(resultObj.records[0])
  // Logger.log(resultObj.records[0].days)
  // Logger.log(resultObj.records[0].timeOffRequestId)
  // Logger.log(resultObj.records[0].days[0].timeOffRequestDayId)

  // let timeOffRequestId=resultObj.records[0].timeOffRequestId
  // let status=resultObj.records[0].status
  // let createdDate=resultObj.records[0].createdDate
  // let benefitCode=resultObj.records[0].benefitCode



  // let timeOffRequestDayId=resultObj.records[0].days[0].timeOffRequestDayId
  // let startTime=resultObj.records[0].days[0].startTime
  // let endTime=resultObj.records[0].days[0].endTime
  // let hours=resultObj.records[0].days[0].hours


}





function findObjectWithMaxStartDate(data) {
  // var data = [
  //   { payRate: 16.0, effectiveEndDate: null, effectiveStartDate: '2023-10-23T00:00:00' },
  //   { effectiveEndDate: '2023-10-24T00:00:00', payRate: 15.0, effectiveStartDate: '2023-09-25T00:00:00' },
  //   { effectiveEndDate: '2023-10-05T00:00:00', effectiveStartDate: '2023-09-21T00:00:00', payRate: 0.0 },
  //   { effectiveEndDate: '2023-10-05T00:00:00', payRate: 15.0, effectiveStartDate: '2023-09-20T00:00:00' }
  // ];

  let filteredData = data.filter(function (obj) {
    return obj.effectiveEndDate === null;
  });

  if (filteredData.length > 0) {
    // Find the object with the maximum effectiveStartDate
    let maxStartDateObject = filteredData.reduce(function (prev, current) {
      return new Date(current.effectiveStartDate) > new Date(prev.effectiveStartDate) ? current : prev;
    });

    Logger.log(maxStartDateObject); // Print the object with the biggest effectiveStartDate
    return maxStartDateObject
  } else {
    Logger.log('No object found with effectiveEndDate as null.');

    return { effectiveStartDate: null, effectiveEndDate: null, payRate: 0 }
  }
}






function findObjectWithCriteria() {
  var data = [
    { payRate: 16.0, effectiveEndDate: null, effectiveStartDate: '2023-10-23T00:00:00' },
    { effectiveEndDate: '2023-10-24T00:00:00', payRate: 15.0, effectiveStartDate: '2023-09-25T00:00:00' },
    { effectiveEndDate: '2023-10-05T00:00:00', effectiveStartDate: '2023-09-21T00:00:00', payRate: 0.0 },
    { effectiveEndDate: '2023-10-05T00:00:00', payRate: 15.0, effectiveStartDate: '2023-09-20T00:00:00' }
  ];

  var filteredData = data.filter(function (obj) {
    return obj.effectiveEndDate === null && new Date(obj.effectiveStartDate) > new Date();
  });

  if (filteredData.length > 0) {
    Logger.log(filteredData[0]); // Print the object that meets the criteria
  } else {
    Logger.log('No object found that meets the criteria.');
  }
}







//please write google apps script code to give me the the object from the array which has the bigger effectiveStartDate in the other objects of the array and effectiveEndDate is null from the array of object below: [{payRate=16.0, effectiveEndDate=null, effectiveStartDate=2023-10-23T00:00:00}, {effectiveEndDate=2023-10-24T00:00:00, payRate=15.0, effectiveStartDate=2023-09-25T00:00:00}, {effectiveEndDate=2023-10-05T00:00:00, effectiveStartDate=2023-09-21T00:00:00, payRate=0.0}, {effectiveEndDate=2023-10-05T00:00:00, payRate=15.0, effectiveStartDate=2023-09-20T00:00:00}]


//{sequenceNumber=1.0, id=06d86902-6987-0000-0000-000009460200, type=Hourly, notes=null, reason=null, effectiveStartDate=2023-06-19T00:00:00, employees={url=/v1/employees/8306c327-9f85-0000-0000-000009460200, id=8306c327-9f85-0000-0000-000009460200}, description=Rate 1, effectiveEndDate=null, payRate=22.25, annualPayRate=46280.0, annualHours=2080.0}

//{effectiveEndDate=2022-12-29T00:00:00, annualPayRate=42640.0, reason=null, sequenceNumber=1.0, annualHours=2080.0, effectiveStartDate=2010-05-03T00:00:00, id=f2a88062-fb89-0000-0000-000009460200, type=Hourly, description=Rate 1, employees={id=8306c327-9f85-0000-0000-000009460200, url=/v1/employees/8306c327-9f85-0000-0000-000009460200}, payRate=20.5, notes=null}








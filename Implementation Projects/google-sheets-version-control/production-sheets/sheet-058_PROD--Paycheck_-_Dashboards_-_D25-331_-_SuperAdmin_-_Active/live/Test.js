//{hourRefId=a4b8c74c-2ef6-45a9-a8a0-875dbed7a7d6, departmentId=cb78e0a5-45ed-0000-0000-0000f7a10200, workLocationId=fd39a75e-c67e-0000-0000-0000f7a10200, activityTypeId=5aaa8d43-2ae8-4af0-9913-86438aeaaa44, hourId=25c38db5-eafa-ef11-93b8-d4f5ef34c73f, laborCodes=[], note=null, legalEntityEarningId=2bedce82-52fd-0000-0000-0000f7a10200, startDateTime=2025-03-06T07:01:00, total=5.98333}




const HourRefId = "a4b8c74c-2ef6-45a9-a8a0-875dbed7a7d6"
const DepartmentId = "cb78e0a5-45ed-0000-0000-0000f7a10200"
const WorkLocationId = "fd39a75e-c67e-0000-0000-0000f7a10200"
const ActivityTypeId = "5aaa8d43-2ae8-4af0-9913-86438aeaaa44"
const HourId = "25c38db5-eafa-ef11-93b8-d4f5ef34c73f"
const LegalEntityEarningId = "2bedce82-52fd-0000-0000-0000f7a10200"


const EmployeeId = "953ec1e6-9945-0000-0000-0000f7a10200"

const AvaClientId = "172535"

//https://apis.paycor.com/v1/employees/953ec1e6-9945-0000-0000-0000f7a10200/employeeHours?startDate=3-6-2025&endDate=4-3-2025


function testNewFunc11() {

  let ss = SpreadsheetApp.getActiveSpreadsheet();
  //getNewTokenMain_()
  let apiDetailSheet = ss.getSheetByName(API_DETAILS_SHEET);
  let token = apiDetailSheet.getRange("B2").getValue();


  let headers = {
    "Authorization": "Bearer " + token,
    "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY
  };

  let options = {
    "method": "GET",
    "headers": headers,
    //"muteHttpExceptions": true
  };


  //let url = `https://apis.paycor.com/v1/legalEntities/${AvaClientId}/punches`
  //let url = `https://apis.paycor.com/v1/employees/${EmployeeId}/earnings/${LegalEntityEarningId}`

  //https://apis.paycor.com/v1/employees/{employeeId}/punches
  let url = `https://apis.paycor.com/v1/employees/${EmployeeId}/punches?startDate=3-6-2025&endDate=4-3-2025`

  //let url = `https://apis.paycor.com/v1/legalentities/${AvaClientId}/departments/${DepartmentId}`
  //let url=`https://apis.paycor.com/v1/legalentities/${AvaClientId}/departments`

  let resp = UrlFetchApp.fetch(url, options);
  Logger.log(resp)

  



}


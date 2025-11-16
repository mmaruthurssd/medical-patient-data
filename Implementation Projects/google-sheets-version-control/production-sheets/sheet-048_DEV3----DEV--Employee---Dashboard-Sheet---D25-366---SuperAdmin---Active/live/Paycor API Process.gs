



//e97101e97db236ba73ba
//uUub60S54NQRcODCrjqdBkh6rof53Wt57JXxM0/dOxA




const PAYCHECK_SS_ID = "13-NKu0D13pzul-dTyfrD2az0CzPqp1Y_7E-yJPWg2Yk"
const API_DETAILS_SHEET = "API_Details"


const TENANT_ID = "213029"


const CLIENT_ID = "7549ecde9093df7f9970"
const CLIENT_SECRET = "Xj1XCy5cnwy4/7CdNO1Z3zU9q4YWwU2vTyol48Rf0"
const SUBSCRIPTION_KEY = "596a91795cf3460dacb36519e7bc1759"
const SCOPE = "bd9b2d308e06f011aaa7002248909106"







function createTimeTrigger_() {
  ScriptApp.newTrigger("fetchEmployeesMain")
    .timeBased()
    .everyDays(1)
    .atHour(2)
    .inTimezone(Session.getScriptTimeZone())
    .create()
}



function fetchEmployeesMain() {

  return


  let ss = SpreadsheetApp.getActiveSpreadsheet();




  getNewTokenMain_()


  let paycheckSS = SpreadsheetApp.openById(PAYCHECK_SS_ID);
  let apiDetailSheet = paycheckSS.getSheetByName(API_DETAILS_SHEET);
  let token = apiDetailSheet.getRange("B2").getValue();


  let tenantUrl = "https://apis.paycor.com/v1/tenants/" + TENANT_ID + "/employees"

  let headers = {
    "Authorization": "Bearer " + token,
    "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY
  };

  let options = {
    "method": "GET",
    "headers": headers,
  };

  let employeeResponse = UrlFetchApp.fetch(tenantUrl, options);
  let empResult = employeeResponse.getContentText();
  let empResultObj = JSON.parse(empResult);



  let allEmployees = []

  empResultObj.records.forEach(record => {

    //Logger.log(record)

    let firstName = record.firstName
    let lastName = record.lastName
    let employeeId = record.employee.id

    let employeeNumber = record.employeeNumber


    allEmployees.push([(firstName.toString().trim() + " " + lastName.toString().trim()).toString().trim(), employeeNumber, employeeId])



  })



  let employeeSheet = ss.getSheetByName("Employee List");
  const HeaderRow = employeeSheet.getRange(1, 1, 1, employeeSheet.getLastColumn()).getValues()[0];
  const paycorIdIndex = HeaderRow.indexOf('Paycore ID')
  let existingEmployeeIds = employeeSheet.getRange(1, paycorIdIndex + 1, employeeSheet.getLastRow(), 1).getValues().map(r => r[0])


  let newEmployeesNames = []
  let newEmployeeIds = []
  allEmployees.forEach(emp => {

    let empIdIndex = existingEmployeeIds.indexOf(emp[2])
    if (empIdIndex == -1) {
      newEmployeesNames.push([emp[1], emp[0], emp[0]])

      newEmployeeIds.push([emp[2]])
    }
  })


  if (newEmployeesNames.length > 0) {

    let startRow = employeeSheet.getLastRow() + 1
    employeeSheet.getRange(startRow, 3, newEmployeesNames.length, newEmployeesNames[0].length).setValues(newEmployeesNames)
    employeeSheet.getRange(startRow, paycorIdIndex + 1, newEmployeeIds.length, newEmployeeIds[0].length).setValues(newEmployeeIds)

    let foldersFile = createFolderFileEmployee_(newEmployeesNames)

    employeeSheet.getRange(startRow, HeaderRow.indexOf('Documents') + 1, foldersFile.length, foldersFile[0].length).setValues(foldersFile)

  }
}

function createFolderFileEmployee_(newEmployeesNames) {

  let ouptutFolder = DriveApp.getFolderById(OUTPUT_FOLDER_ID)

  let folderFilesDetails = []
  newEmployeesNames.forEach(emp => {
    let newFolder = ouptutFolder.createFolder(emp[1]);
    let docFile = DriveApp.getFileById(DOC_TEMP_ID).makeCopy(emp[1], newFolder)
    folderFilesDetails.push([newFolder.getUrl(), docFile.getUrl()])
  })


  return folderFilesDetails


}



// function tempCreatingFiles() {
//   let ss = SpreadsheetApp.getActiveSpreadsheet();
//   let employeeSheet = ss.getSheetByName("Employee List");
//   const HeaderRow = employeeSheet.getRange(1, 1, 1, employeeSheet.getLastColumn()).getValues()[0];

//   let existingEmployee = employeeSheet.getRange(2, 4, employeeSheet.getLastRow() - 1, 2).getValues()

//   let foldersFiles = [];

//   let ouptutFolder = DriveApp.getFolderById(OUTPUT_FOLDER_ID)


//   existingEmployee.forEach((emp, index) => {
//     if (emp[1] != "") {
//       let newFolder = ouptutFolder.createFolder(emp[1]);
//       let docFile = DriveApp.getFileById(DOC_TEMP_ID).makeCopy(emp[1], newFolder)
//       foldersFiles.push([newFolder.getUrl(), docFile.getUrl()])

//       employeeSheet.getRange(index + 2, HeaderRow.indexOf('Documents') + 1, 1, 2).setValues([[newFolder.getUrl(), docFile.getUrl()]])

//     } else {
//       //foldersFiles.push(["", ""])
//     }
//   })


//   //employeeSheet.getRange(2, HeaderRow.indexOf('Documents') + 1, foldersFiles.length, foldersFiles[0].length).setValues(foldersFiles)

// }





/**
 * this function is used to get the new access token and refresh token
 */
function getNewTokenMain_() {

  let ss = SpreadsheetApp.openById(PAYCHECK_SS_ID);
  let sheet = ss.getSheetByName(API_DETAILS_SHEET);

  let oldTokenDetails = sheet.getRange(2, 1, 1, 3).getValues()[0];

  let tokenObj = getNewToken_(oldTokenDetails[2]);


  let newAccessToken = tokenObj['access_token'];
  let newRefreshToken = tokenObj['refresh_token'];

  saveIntoSheet_(newAccessToken, newRefreshToken);

}





// Function to copy values into the Google Sheet.
function saveIntoSheet_(accessToken, refreshToken) {
  let ss = SpreadsheetApp.openById(PAYCHECK_SS_ID);
  let sheet = ss.getSheetByName(API_DETAILS_SHEET);
  sheet.getRange(2, 1, 1, 3).setValues([[new Date(), accessToken, refreshToken]])
}






function getNewToken_(refresh_token) {
  let url = "https://apis.paycor.com/sts/v1/common/token?subscription-key=" + SUBSCRIPTION_KEY;
  let payload = {
    "grant_type": "refresh_token",
    "refresh_token": refresh_token,
    "client_id": CLIENT_ID,
    "client_secret": CLIENT_SECRET
  };
  let options = {
    "method": "post",
    "contentType": "application/x-www-form-urlencoded",
    "payload": payload,
    "muteHttpExceptions": true // Optional: set to true to catch HTTP exceptions
  };

  let response = UrlFetchApp.fetch(url, options);
  let result = response.getContentText();

  let resultObj = JSON.parse(result);

  return resultObj
}







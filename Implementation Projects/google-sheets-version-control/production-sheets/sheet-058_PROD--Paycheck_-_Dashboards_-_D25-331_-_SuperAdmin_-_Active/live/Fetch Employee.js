function fetchEmployees() {
  getNewTokenMain_()


  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let apiDetailSheet = ss.getSheetByName(API_DETAILS_SHEET);
  let token = apiDetailSheet.getRange("B2").getValue();

  let headers = {
    "Authorization": "Bearer " + token,
    "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY
  };
  let options = {
    "method": "GET",
    "headers": headers,
  };

  let url = "https://apis.paycor.com/v1/tenants/" + TENANT_ID + "/employees"

  let response = UrlFetchApp.fetch(url, options);
  let result = response.getContentText();
  let resultObj = JSON.parse(result);



  let allEmployee = []
  resultObj.records.forEach(record => {
    allEmployee.push([record.employee.id, record.firstName, record.middleName, record.lastName, record.employeeNumber, record.firstName + " " + record.lastName])
  })


  let employeeSheet = ss.getSheetByName("Employees");

  let allEmployeesIDs = employeeSheet.getRange(1, 1, employeeSheet.getLastRow(), 1).getValues().map(r => r[0].toString().trim())


  allEmployee.forEach(emp => {
    let empIndex = allEmployeesIDs.indexOf(emp[0].toString().trim())

    if (empIndex == -1) {
      employeeSheet.appendRow(emp)
    }
  })


}
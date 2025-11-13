


const Ave_Lee_TENANT_ID = "213029"




function getNannyHours() {

  let ss = SpreadsheetApp.getActiveSpreadsheet();

  //try {

  //return
  getNewTokenMain_()


  let apiDetailSheet = ss.getSheetByName(API_DETAILS_SHEET);
  let token = apiDetailSheet.getRange("B2").getValue();


  let tenantUrl = "https://apis.paycor.com/v1/tenants/" + TENANT_ID + "/employees"

  let headers = {
    "Authorization": "Bearer " + token,
    "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY
  };

  let options = {
    "method": "GET",
    "headers": headers,
    "muteHttpExceptions": true
  };

  let employeeResponse = UrlFetchApp.fetch(tenantUrl, options);
  let empResult = employeeResponse.getContentText();
  let empResultObj = JSON.parse(empResult);



  let todayDate = new Date()



  let oneMonthBeforeDate = new Date(new Date().setDate(new Date().getDate() - 30))
  oneMonthBeforeDate = new Date(oneMonthBeforeDate.getFullYear(), oneMonthBeforeDate.getMonth(), oneMonthBeforeDate.getDate())


  let todayDatePaycor = (todayDate.getMonth() + 1) + "-" + (todayDate.getDate()) + "-" + (todayDate.getFullYear())
  let startDatePaycor = (oneMonthBeforeDate.getMonth() + 1) + "-" + (oneMonthBeforeDate.getDate()) + "-" + (oneMonthBeforeDate.getFullYear())



  let dailyHours = []
  empResultObj.records.forEach(record => {

    try {

      //if (record.firstName == "Jean" && record.lastName == "Gannette") {
      if (record.firstName == "Jean" && record.lastName == "Gannett") {

        let hourlyRateObject = getPayRates_(options, record.employee.id)

        let hoursUrl = "https://apis.paycor.com/v1/employees/" + record.employee.id + "/punches?startDate=" + startDatePaycor + "&endDate=" + todayDatePaycor

        let hoursResponse = UrlFetchApp.fetch(hoursUrl, options);
        let hoursResult = hoursResponse.getContentText();
        let hoursResultObj = JSON.parse(hoursResult);




        // hoursResultObj.details.forEach(detail => {

        //Logger.log(hoursResultObj)
        hoursResultObj.records.forEach(detail => {
          //Logger.log(detail)


          // {employeeNumber=71.0, employeeId=953ec1e6-9945-0000-0000-0000f7a10200, earningCode=Reg, departmentCode=400.0, displayDate=2025-03-06T00:00:00, punchOut=2025-03-06T13:00:00, departmentName=Admin*, hourAmount=5.98333, punchIn=2025-03-06T07:01:00, estimatedGrossPay=155.5658, badgeNumber=null, laborCodes=[]}

          let location = "";
          if (detail.departmentName.toString().includes("BHM")) {
            location = "Trussville";
          } else if (detail.departmentName.toString().includes("GAD")) {
            location = "Gadsden";
          } else if (detail.departmentName.toString().includes("OXF")) {
            location = "Oxford";
          }


          //new Date(dateString).toLocaleString('en-us', {weekday:'long'})
          if (detail.earningCode.toString().includes("UTO")) {
            dailyHours.push([new Date(detail.displayDate).toLocaleString('en-us', { weekday: 'long' }), record.firstName, record.middleName, record.lastName, detail.departmentName, location, new Date(new Date(detail.displayDate).getTime() + (1 * 60 * 60 * 1000)), detail.earningCode, new Date(detail.punchIn), new Date(detail.punchOut), detail.hourAmount, 0, 0])
          } else {
            dailyHours.push([new Date(detail.displayDate).toLocaleString('en-us', { weekday: 'long' }), record.firstName, record.middleName, record.lastName, detail.departmentName, location, new Date(new Date(detail.displayDate).getTime() + (1 * 60 * 60 * 1000)), detail.earningCode, new Date(detail.punchIn), new Date(detail.punchOut), detail.hourAmount, hourlyRateObject.payRate, detail.hourAmount * hourlyRateObject.payRate])
          }




        })
      }
    } catch (err) {
      Logger.log(err)
    }


  })




  if (dailyHours.length == 0) return

  let naniSS = SpreadsheetApp.openById("1z0O0u6e0otsePH89PEEPSzHWvECeQzlop0bHi8ehmTM")
  let hoursSheet = naniSS.getSheetByName("Paycor Timecard Jean");
  let allLoggedHours = []
  if (hoursSheet.getLastRow() > 1) {
    allLoggedHours = hoursSheet.getRange(2, 2, hoursSheet.getLastRow() - 1, hoursSheet.getLastColumn() - 1).getValues()
  }


  let filterAllLoggedHours = allLoggedHours.filter(r => r[6].getTime() < oneMonthBeforeDate.getTime() || r[6].getTime() > todayDate.getTime()).concat([...dailyHours])

  hoursSheet.getRange(2, 2, filterAllLoggedHours.length, filterAllLoggedHours[0].length).setValues(filterAllLoggedHours)

  hoursSheet.getRange(2, 1, hoursSheet.getLastRow() - 1, hoursSheet.getLastColumn()).sort([{ column: 8, ascending: false }])




}













function getNannyHoursJaden() {

  let ss = SpreadsheetApp.getActiveSpreadsheet();

  //try {

  //return
  //getNewTokenMain_()


  let apiDetailSheet = ss.getSheetByName(API_DETAILS_SHEET);
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



  let todayDate = new Date()



  let oneMonthBeforeDate = new Date(new Date().setDate(new Date().getDate() - 30))
  oneMonthBeforeDate = new Date(oneMonthBeforeDate.getFullYear(), oneMonthBeforeDate.getMonth(), oneMonthBeforeDate.getDate())


  let todayDatePaycor = (todayDate.getMonth() + 1) + "-" + (todayDate.getDate()) + "-" + (todayDate.getFullYear())
  let startDatePaycor = (oneMonthBeforeDate.getMonth() + 1) + "-" + (oneMonthBeforeDate.getDate()) + "-" + (oneMonthBeforeDate.getFullYear())



  let dailyHours = []
  empResultObj.records.forEach(record => {

    try {

      //if (record.firstName == "Jean" && record.lastName == "Gannette") {
      if (record.firstName == "Jaden" || record.lastName == "Dingler") {


        let hourlyRateObject = getPayRates_(options, record.employee.id)


        let hoursUrl = "https://apis.paycor.com/v1/employees/" + record.employee.id + "/punches?startDate=" + startDatePaycor + "&endDate=" + todayDatePaycor
        let hoursResponse = UrlFetchApp.fetch(hoursUrl, options);
        let hoursResult = hoursResponse.getContentText();

        let hoursResultObj = JSON.parse(hoursResult);



        //Logger.log(hoursResultObj)

        hoursResultObj.records.forEach(detail => {


          let location = "";
          if (detail.departmentName.toString().includes("BHM")) {
            location = "Trussville";
          } else if (detail.departmentName.toString().includes("GAD")) {
            location = "Gadsden";
          } else if (detail.departmentName.toString().includes("OXF")) {
            location = "Oxford";
          }


          //new Date(dateString).toLocaleString('en-us', {weekday:'long'})
          if (detail.earningCode.toString().includes("UTO")) {
            dailyHours.push([new Date(detail.displayDate).toLocaleString('en-us', { weekday: 'long' }), record.firstName, record.middleName, record.lastName, detail.departmentName, location, new Date(new Date(detail.displayDate).getTime() + (1 * 60 * 60 * 1000)), detail.earningCode, new Date(detail.punchIn), new Date(detail.punchOut), detail.hourAmount, 0, 0])
          } else {
            dailyHours.push([new Date(detail.displayDate).toLocaleString('en-us', { weekday: 'long' }), record.firstName, record.middleName, record.lastName, detail.departmentName, location, new Date(new Date(detail.displayDate).getTime() + (1 * 60 * 60 * 1000)), detail.earningCode, new Date(detail.punchIn), new Date(detail.punchOut), detail.hourAmount, hourlyRateObject.payRate, detail.hourAmount * hourlyRateObject.payRate])
          }
        })
      }
    } catch (err) {
      Logger.log(err)
    }


  })

  //return


  //Logger.log(dailyHours)

  if (dailyHours.length == 0) return

  let naniSS = SpreadsheetApp.openById("1z0O0u6e0otsePH89PEEPSzHWvECeQzlop0bHi8ehmTM")
  let hoursSheet = naniSS.getSheetByName("Paycor Timecard Jaden");
  let allLoggedHours = []
  if (hoursSheet.getLastRow() > 1) {
    allLoggedHours = hoursSheet.getRange(2, 2, hoursSheet.getLastRow() - 1, hoursSheet.getLastColumn() - 1).getValues()
  }


  let filterAllLoggedHours = allLoggedHours.filter(r => r[6].getTime() < oneMonthBeforeDate.getTime() || r[6].getTime() > todayDate.getTime()).concat([...dailyHours])

  hoursSheet.getRange(2, 2, filterAllLoggedHours.length, filterAllLoggedHours[0].length).setValues(filterAllLoggedHours)

  hoursSheet.getRange(2, 1, hoursSheet.getLastRow() - 1, hoursSheet.getLastColumn()).sort([{ column: 8, ascending: false }])




}




















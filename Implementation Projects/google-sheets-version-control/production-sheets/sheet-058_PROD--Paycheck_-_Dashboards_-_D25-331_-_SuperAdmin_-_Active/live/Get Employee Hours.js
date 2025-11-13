
//AVA LEE Tennant ID
const TENANT_ID = "213029"



// function onOpen() {
//   let ui = SpreadsheetApp.getUi();
//   let menu = ui.createMenu("Custom");
//   menu.addItem("Fetch Paycor Data", "getEmployeeHours").addToUi()
// }


function getEmployeeHours() {

// }
// function getEmployeeHoursManual() {
  //return

  let ss = SpreadsheetApp.getActiveSpreadsheet();

  //try {
  getNewTokenMain_()


  try {
    getNannyHours()
  } catch (err) { Logger.log("Nanny Process: " + err) }

  try {
    getNannyHoursJaden()
  } catch (err) { Logger.log("Jaden Nanny Process: " + err) }

  //return


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

  const endOfToday = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate(), 23, 59, 59);

  let twoWeeksBeforeDate = new Date(new Date().setDate(new Date().getDate() - 16))
  twoWeeksBeforeDate = new Date(twoWeeksBeforeDate.getFullYear(), twoWeeksBeforeDate.getMonth(), twoWeeksBeforeDate.getDate())

  //Logger.log(todayDate)

  //return
  //todayDate.setDate(todayDate.getDate() - 1)

  let weekEndDate = (todayDate.getMonth() + 1) + "-" + (todayDate.getDate()) + "-" + (todayDate.getFullYear())
  let weekStartDate = (twoWeeksBeforeDate.getMonth() + 1) + "-" + (twoWeeksBeforeDate.getDate()) + "-" + (twoWeeksBeforeDate.getFullYear())

  // let weekEndDate = "12-30-2023"
  // let weekStartDate="1-1-2024"


  let dailyHours = []
  empResultObj.records.forEach(record => {
    //allEmployee.push( [record.employee.id, record.firstName, record.middleName, record.lastName, record.employeeNumber ] )
    try {

      if (record.firstName != "Jean" && record.lastName != "Gannette") {

        //let hourlyRateObject = getPayRates_(options, record.employee.id)
        let hourlyRateArr = getPayRates_(options, record.employee.id)

        // if (record.firstName == "Shundra") {
        //   Logger.log(record.employee.id)
        // }

        //let hoursUrl = "https://apis.paycor.com/v1/employees/" + record.employee.id + "/hours?startDate=" + weekStartDate + "&endDate=" + weekEndDate
        let hoursUrl = "https://apis.paycor.com/v1/employees/" + record.employee.id + "/punches?startDate=" + weekStartDate + "&endDate=" + weekEndDate
        let hoursResponse = UrlFetchApp.fetch(hoursUrl, options);
        let hoursResult = hoursResponse.getContentText();

        let hoursResultObj = JSON.parse(hoursResult);

        hoursResultObj.records.forEach(detail => {

          //also from the DepartmentName column we need to extract the location, so for Example GHM means Bermingham, GAD is Gadsden, OXF is Oxford and there's another one that means PEll City
          let location = "";
          if (detail.departmentName.toString().includes("BHM")) {
            location = "Trussville";
          } else if (detail.departmentName.toString().includes("GAD")) {
            location = "Gadsden";
          } else if (detail.departmentName.toString().includes("OXF")) {
            location = "Oxford";
          }

          // if (record.firstName == "Olivia") {
          //   Logger.log(record)
          //   Logger.log(detail.displayDate)
          //   Logger.log(detail.punchIn)
          // }

          let payRate = hourlyRateArr[0][0]
          if (hourlyRateArr.length > 1) {
            let tmpPIN = new Date(detail.punchIn).getTime();
            for (var t = 0; t < hourlyRateArr.length; t++) {
              if (tmpPIN > hourlyRateArr[t][1].getTime()) {
                payRate = hourlyRateArr[t][0]
                break
              }
            }
          }


          if (detail.earningCode.toString().includes("UTO")) {
            dailyHours.push([record.firstName, record.middleName, record.lastName, detail.departmentName, location, Utilities.formatDate(new Date(detail.displayDate), Session.getScriptTimeZone(), "M/d/yyyy"), detail.earningCode, new Date(detail.punchIn), new Date(detail.punchOut), detail.hourAmount, 0, 0])
          } else {
            dailyHours.push([record.firstName, record.middleName, record.lastName, detail.departmentName, location, Utilities.formatDate(new Date(detail.displayDate), Session.getScriptTimeZone(), "M/d/yyyy"), detail.earningCode, new Date(detail.punchIn), new Date(detail.punchOut), detail.hourAmount, payRate, detail.hourAmount * payRate])
          }
        })

      }

    } catch (err) {
      Logger.log(err)
    }

  })

  if (dailyHours.length == 0) return


  let hoursSheet = ss.getSheetByName(EMPLOYEE_HOURS_SHEET);
  let allLoggedHours = hoursSheet.getRange(2, 1, hoursSheet.getLastRow() - 1, hoursSheet.getLastColumn()).getValues()

  let todayDateStr = Utilities.formatDate(todayDate, "GMT-6", "yyyy-MM-dd")
  //let filterAllLoggedHours = allLoggedHours.filter(r => Utilities.formatDate(r[5], "GMT-6", "yyyy-MM-dd") != todayDateStr).concat([...dailyHours])
  let filterAllLoggedHours = allLoggedHours.filter(r => r[5].getTime() < twoWeeksBeforeDate.getTime() || r[5].getTime() > endOfToday.getTime()).concat([...dailyHours])

  hoursSheet.getRange(2, 1, filterAllLoggedHours.length, filterAllLoggedHours[0].length).setValues(filterAllLoggedHours)

  hoursSheet.getRange(2, 1, hoursSheet.getLastRow() - 1, hoursSheet.getLastColumn()).sort([{ column: 6, ascending: false }])


  const dataUpdateLog = ss.getSheetByName("Data Update Log")
  dataUpdateLog.getRange("D2").setValue(new Date())
  dataUpdateLog.getRange("E2").setValue(twoWeeksBeforeDate.toLocaleDateString() + " - " + todayDate.toLocaleDateString())


}









function getPayRates_(options, employeeId) {
  //function getPayRates(options, employeeId) {

  // let ss = SpreadsheetApp.getActiveSpreadsheet();
  // let apiDetailSheet = ss.getSheetByName(API_DETAILS_SHEET);
  // let token = apiDetailSheet.getRange("B2").getValue();
  // let headers = {
  //   "Authorization": "Bearer " + token,
  //   "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY
  // };
  // options = {
  //   "method": "GET",
  //   "headers": headers,
  // };

  // employeeId = "95cde5ff-cf53-0000-0000-0000f7a10200"

  //Logger.log(employeeId)


  let payRatesUrl = "https://apis.paycor.com/v1/employees/" + employeeId + "/payrates";
  let payRatesResponse = UrlFetchApp.fetch(payRatesUrl, options);
  let payRatesResult = payRatesResponse.getContentText();
  let payRatesResultObj = JSON.parse(payRatesResult);


  let payRatesObj = []
  payRatesResultObj.records.forEach(record => {
    //Logger.log(record)
    payRatesObj.push({ payRate: record.payRate, effectiveStartDate: record.effectiveStartDate, effectiveEndDate: record.effectiveEndDate })
  })

  //Logger.log(payRatesObj)

  // let filteredData = payRatesObj.filter(function (obj) {
  //   return obj.effectiveEndDate === null;
  // });

  if (payRatesObj.length > 0) {

    var result = payRatesObj
      .map(function (item) {
        //Logger.log(item)
        var date = item.effectiveStartDate ? new Date(item.effectiveStartDate.split("T")[0]) : null; // strip T00:00:00
        return [item.payRate, date];
      })
      .sort(function (a, b) {
        return b[1] - a[1]; // sort by date descending
      });

    // var result = filteredData
    //   .map(function (item) {
    //     return [item.payRate, new Date(item.effectiveStartDate)];
    //   })
    //   .sort(function (a, b) {
    //     return b[1] - a[1]; // newest first
    //   });

    //Logger.log(result);
    return result;

    // let maxStartDateObject = filteredData.reduce(function (prev, current) {
    //   return new Date(current.effectiveStartDate) > new Date(prev.effectiveStartDate) ? current : prev;
    // });

    // return maxStartDateObject
  } else {

    //return { effectiveStartDate: null, effectiveEndDate: null, payRate: 0 }
    return [[0, null]]
  }
}




function testgetTTOKNEN() {
  getNewTokenMain_()
}



/**
 * this function is used to get the new access token and refresh token
 */
function getNewTokenMain_() {

  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(API_DETAILS_SHEET);

  let oldTokenDetails = sheet.getRange(2, 1, 1, 3).getValues()[0];

  let tokenObj = getNewToken_(oldTokenDetails[2]);


  let newAccessToken = tokenObj['access_token'];
  let newRefreshToken = tokenObj['refresh_token'];

  saveIntoSheet_(newAccessToken, newRefreshToken);

}





// Function to copy values into the Google Sheet.
function saveIntoSheet_(accessToken, refreshToken) {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
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

  //Logger.log(resultObj)

  return resultObj
}








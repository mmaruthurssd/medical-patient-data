


function testDatesCount() {
  let today = new Date(2023, 11, 3);
  let tomorrow = new Date(2023, 11, 5)
  Logger.log((tomorrow - today) / (1000 * 60 * 60 * 24))
}


function getTimeOffRequestHours() {

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
  };

  let employeeResponse = UrlFetchApp.fetch(tenantUrl, options);
  let empResult = employeeResponse.getContentText();
  let empResultObj = JSON.parse(empResult);






  let timeOffSheet = ss.getSheetByName(TIME_OFF_REQUEST_SHEET);
  //let timeOffSheet = ss.getSheetByName("Copy of Time_Off_Requests");
  let allData = timeOffSheet.getRange(1, 1, timeOffSheet.getLastRow(), 14).getValues();

  let unique = {}
  allData.forEach((row, index) => {
    let key = row[11] + row[12]
    unique[key] = index
  })



  let Date_ = new Date(new Date().setDate(new Date().getDate() - 150))

  //let thisYear = Date_.getFullYear()
  let timeNow = new Date().getTime();


  while ((new Date().getTime() - timeNow) / 1000 < 250) {

    Date_.setDate(Date_.getDate() - 1)
    let startDate = (Date_.getMonth() + 1) + "-" + (Date_.getDate()) + "-" + (Date_.getFullYear())

    Date_.setDate(Date_.getDate() + 88);
    let endDate = (Date_.getMonth() + 1) + "-" + (Date_.getDate()) + "-" + (Date_.getFullYear())
    // if (Date_.getFullYear() != thisYear) {
    //   endDate = 12 + "-" + 31 + "-" + thisYear
    // }
    //thisYear = Date_.getFullYear()

    //empResultObj.records=[]

    empResultObj.records.forEach(record => {


      try {

        let timeOffUrl = "https://apis.paycor.com/v1/employees/" + record.employee.id + "/timeoffrequests?startDate=" + startDate + "&endDate=" + endDate;

        let timeOffResponse = UrlFetchApp.fetch(timeOffUrl, options);
        let timeOffResult = timeOffResponse.getContentText();
        let timeOffResultObj = JSON.parse(timeOffResult);

        timeOffResultObj.records.forEach(timeOffRec => {

          let timeOffRequestId = timeOffRec.timeOffRequestId
          let status = timeOffRec.status
          let createdDate = new Date(timeOffRec.createdDate)
          let benefitCode = timeOffRec.benefitCode

          timeOffRec.days.forEach(day => {

            let timeOffRequestDayId = day.timeOffRequestDayId
            let startDateTime = day.startTime
            let endDateTime = day.endTime
            let hours = day.hours

            let startDate = Utilities.formatDate(new Date(startDateTime), "GMT-6", "MM/dd/yyyy")
            let startTime = Utilities.formatDate(new Date(startDateTime), "GMT-6", "HH:mm")
            let startDay = Utilities.formatDate(new Date(startDateTime), "GMT-6", 'EEE');

            let endDate = Utilities.formatDate(new Date(endDateTime), "GMT-6", "MM/dd/yyyy")
            let endTime = Utilities.formatDate(new Date(endDateTime), "GMT-6", "HH:mm")


            let newKey = timeOffRequestId + timeOffRequestDayId
            if (!unique[newKey]) {
              // allData.push([timeOffRequestId, timeOffRequestDayId, record.firstName, record.middleName, record.lastName, createdDate, benefitCode, startDateTime, endTime, hours, status])

              allData.push([status, benefitCode, hours, startDate, startTime, startDay, record.firstName, record.lastName, createdDate, endDate, endTime, timeOffRequestId, timeOffRequestDayId, record.middleName])
              unique[newKey] = allData.length - 1
            } else {
              // allData[unique[newKey]] = [timeOffRequestId, timeOffRequestDayId, record.firstName, record.middleName, record.lastName, createdDate, benefitCode, startDateTime, endTime, hours, status]

              allData[unique[newKey]] = [status, benefitCode, hours, startDate, startTime, startDay, record.firstName, record.lastName, createdDate, endDate, endTime, timeOffRequestId, timeOffRequestDayId, record.middleName]
            }

          })

        })
      } catch (err) {
        //Logger.log(err)
      }

    })
  }


  timeOffSheet.getRange(1, 1, allData.length, allData[0].length).setValues(allData)

  timeOffSheet.getRange(2, 1, timeOffSheet.getLastRow() - 1, timeOffSheet.getLastColumn()).sort([{ column: 4, ascending: false }])


  //   let statusRow = [[Session.getActiveUser(), new Date(), "Successful"]]
  //   updateScriptStatus_(ss, "SCR-015", statusRow, true)


  // } catch (err) {
  //   let statusRow = [[Session.getActiveUser(), new Date(), err]]
  //   updateScriptStatus_(ss, "SCR-015", statusRow, false)
  // }


}












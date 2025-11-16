function balanceHoursProcess() {

  let ss = SpreadsheetApp.getActiveSpreadsheet();

  //try {


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



  let balanceHourSheet = ss.getSheetByName(BALANCE_HOURS_SHEET);
  let allData = balanceHourSheet.getRange(1, 1, balanceHourSheet.getLastRow(), 6).getValues();

  let unique = {}
  allData.forEach((row, index) => {
    let key = row[0] + row[1]
    unique[key] = index
  })


  empResultObj.records.forEach(empRecord => {
    try {

      let balanceHourUrl = "https://apis.paycor.com/v1/employees/" + empRecord.employee.id + "/timeoffaccruals"

      let balanceResponse = UrlFetchApp.fetch(balanceHourUrl, options);
      let balanceResult = balanceResponse.getContentText();
      let balanceResultObj = JSON.parse(balanceResult);


      balanceResultObj.records.forEach(balanceRec => {

        try {
          //employeeName

          balanceRec.typeBalances.forEach(typeBalance => {
            //timeOffTypeName
            //timeOffTypeId
            //usedBalance
            //currentBalance

            try {
              if (typeBalance.timeOffTypeName == "Paid Time Off") {
                let newKey = empRecord.employee.id + typeBalance.timeOffTypeId
                if (!unique[newKey]) {
                  allData.push([empRecord.employee.id, typeBalance.timeOffTypeId, balanceRec.employeeName, typeBalance.usedBalance, typeBalance.scheduledBalance, typeBalance.currentBalance])
                  unique[newKey] = allData.length - 1
                } else {
                  allData[unique[newKey]] = [empRecord.employee.id, typeBalance.timeOffTypeId, balanceRec.employeeName, typeBalance.usedBalance, typeBalance.scheduledBalance, typeBalance.currentBalance]
                }
              }

            } catch (err) { Logger.log(err) }
          })

        } catch (err) { Logger.log(err) }
      })

    } catch (err) { Logger.log(err) }
  })

  balanceHourSheet.getRange(1, 1, allData.length, allData[0].length).setValues(allData)
  balanceHourSheet.getRange(2, 1, balanceHourSheet.getLastRow() - 1, balanceHourSheet.getLastColumn()).sort([{ column: 3, ascending: true }])


  //   let statusRow = [[Session.getActiveUser(), new Date(), "Successful"]]
  //   updateScriptStatus_(ss, "SCR-016", statusRow, true)


  // } catch (err) {
  //   let statusRow = [[Session.getActiveUser(), new Date(), err]]
  //   updateScriptStatus_(ss, "SCR-016", statusRow, false)
  // }


}








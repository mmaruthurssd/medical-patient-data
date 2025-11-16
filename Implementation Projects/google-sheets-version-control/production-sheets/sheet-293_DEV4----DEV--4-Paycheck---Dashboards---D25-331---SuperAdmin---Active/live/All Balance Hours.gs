



function getAllBalanceHoursProcess() {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let balanceHourSheet = ss.getSheetByName(ALL_BALANCE_HOURS_SHEET);

  // let runStatus = balanceHourSheet.getRange("H1").getValue()
  // if (runStatus === "Yes") {
  //   balanceHourSheet.getRange("H1").setValue("No")
  // } else {
  //   balanceHourSheet.getRange("H1").setValue("Yes")
  //   return
  // }


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





  let Date_ = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())

  let allData = []
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

                allData.push([empRecord.employee.id, typeBalance.timeOffTypeId, Date_, balanceRec.employeeName, typeBalance.usedBalance, typeBalance.scheduledBalance, typeBalance.currentBalance])

              }

            } catch (err) { Logger.log(err) }
          })

        } catch (err) { Logger.log(err) }
      })

    } catch (err) { Logger.log(err) }
  })

  if (allData.length > 0) {
    balanceHourSheet.getRange(balanceHourSheet.getLastRow() + 1, 1, allData.length, allData[0].length).setValues(allData)
    balanceHourSheet.getRange(2, 1, balanceHourSheet.getLastRow() - 1, balanceHourSheet.getLastColumn()).sort([{ column: 3, ascending: true }])
  }
}








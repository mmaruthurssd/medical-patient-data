



//e97101e97db236ba73ba
//uUub60S54NQRcODCrjqdBkh6rof53Wt57JXxM0/dOxA




// const PAYCHECK_SS_ID = "13-NKu0D13pzul-dTyfrD2az0CzPqp1Y_7E-yJPWg2Yk"
// const API_DETAILS_SHEET = "API_Details"


// const TENANT_ID = "194759"


// const CLIENT_ID = "e97101e97db236ba73ba"
// const CLIENT_SECRET = "uUub60S54NQRcODCrjqdBkh6rof53Wt57JXxM0/dOxA"
// const SUBSCRIPTION_KEY = "919f69c376f4470f8ef641cc9f7b098d"
// const SCOPE = "fd264f0bd7eaee11aaf0000d3ad327c9"



// const SHEET_NAME = "Paystubs"



function fetchPayStubsTest() {
  return


  //getNewTokenMain_()



  let paycheckSS = SpreadsheetApp.getActiveSpreadsheet();
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


  // let todayDate = new Date(2024, 0, 31)
  // let todayFormatedDate = (todayDate.getMonth() + 1) + "-" + (todayDate.getDate()) + "-" + (todayDate.getFullYear())
  // let today = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate())

  let allAmount = []

  for (var i = 16; i < 30; i++) {

    empResultObj.records.forEach(record => {

      let firstName = record.firstName
      let lastName = record.lastName

      try {


        let payStubsUrl = "https://apis.paycor.com/v1/employees/" + record.employee.id + "/paystubs?checkDate=3-" + i + "-2024&include=All"

        let payStubsResponse = UrlFetchApp.fetch(payStubsUrl, options);
        let payStubsResult = payStubsResponse.getContentText();
        let payStubsObj = JSON.parse(payStubsResult);


        let today = new Date(2024, 2, i)


        if (payStubsObj.records.length > 0) {
          payStubsObj.records.forEach(payStubs => {


            //Logger.log(payStubs)
            allAmount.push([firstName + " " + lastName, today, "grossAmount", "", payStubs.grossAmount])
            allAmount.push([firstName + " " + lastName, today, "netAmount", "", payStubs.netAmount])

            allAmount.push([firstName + " " + lastName, today, "earnings", "totalEarningsAmount", payStubs.earnings.totalEarningsAmount])
            payStubs.earnings.earnings.forEach(earning => {
              allAmount.push([firstName + " " + lastName, today, "earnings", earning.earningCode, earning.earningAmount])
            })

            let medPlusSoc = [firstName + " " + lastName, today, "taxes", "MEDplusSOC", 0]
            allAmount.push([firstName + " " + lastName, today, "taxes", "totalTaxesAmount", payStubs.taxes.totalTaxesAmount])
            payStubs.taxes.taxes.forEach(tax => {
              allAmount.push([firstName + " " + lastName, today, "taxes", tax.taxCode, tax.taxAmount])

              if (tax.taxCode == "MED" || tax.taxCode == "SOC") {
                medPlusSoc[4] = medPlusSoc[4] + Number(tax.taxAmount)
              }
            })

            allAmount.push(medPlusSoc)


            if (payStubs.deductions.totalDeductionsAmount > 0) {
              allAmount.push([firstName + " " + lastName, today, "deductions", "totalDeductionsAmount", payStubs.deductions.totalDeductionsAmount])
              payStubs.deductions.deductions.forEach(deduction => {
                allAmount.push([firstName + " " + lastName, today, "deductions", deduction.deductionCode, deduction.deductionAmount])
              })
            }


          })
        }

      } catch (err) { Logger.log(err) }

    })

  }


  //Logger.log(allAmount)


  if (allAmount.length > 0) {
    let ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME)
    sheet.getRange(sheet.getLastRow() + 1, 1, allAmount.length, allAmount[0].length).setValues(allAmount)
  }


}





//// EARNINGS ////
//Overtime Hours
//Regular
//Travel




//// TAXES ////
//Alabama Withholding
//Birmingham  Alabama
//Gadsden, Alabama
//Alabama Overtime Exempt Wages
//Federal Income Tax
//Federal Unemployment
//































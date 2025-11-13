








//e97101e97db236ba73ba
//uUub60S54NQRcODCrjqdBkh6rof53Wt57JXxM0/dOxA



const OPERATION_CAL_SS_ID = "1d5rNjk32DH5K1VGSYn3HnFLF3JNMkrh-kg1QHvdHjuk"
const OPERATION_CAL_SHEET_NAME = "Tax_Paystubs"




const PAYCHECK_SS_ID = "13-NKu0D13pzul-dTyfrD2az0CzPqp1Y_7E-yJPWg2Yk"
const API_DETAILS_SHEET = "API_Details"


const TENANT_ID = "213029"


// const CLIENT_ID = "7549ecde9093df7f9970"
// const CLIENT_SECRET = "Fcqj5SAc56PUzOS0M6ylbRIvS1gPv7cPjM01/jXj/k"
// const SUBSCRIPTION_KEY = "596a91795cf3460dacb36519e7bc1759"
// const SCOPE = "5545453a89e8ee11aaf0000d3ad327c9"


const CLIENT_ID = "7549ecde9093df7f9970"
const CLIENT_SECRET = "Xj1XCy5cnwy4/7CdNO1Z3zU9q4YWwU2vTyol48Rf0"
const SUBSCRIPTION_KEY = "596a91795cf3460dacb36519e7bc1759"
const SCOPE = "bd9b2d308e06f011aaa7002248909106"



const SHEET_NAME = "Data"





function tempFetchPayStubs() {
  for (var i = 1; i <= 15; i++) {
    fetchPayStubsMainTest(i)
  }
}


// function fetchPayStubsMain() {

// }
function fetchPayStubsMainTest(d) {
  // Logger.log(d)

  let ss = SpreadsheetApp.getActiveSpreadsheet();

  // getNewTokenMain_()
  // return


  let paycheckSS = SpreadsheetApp.openById(PAYCHECK_SS_ID);
  let apiDetailSheet = paycheckSS.getSheetByName(API_DETAILS_SHEET);
  let token = apiDetailSheet.getRange("B2").getValue();

  //Logger.log(token)


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


  let todayDate = new Date(2025, 0, d)
  //let todayDate = new Date()
  let todayFormatedDate = (todayDate.getMonth() + 1) + "-" + (todayDate.getDate()) + "-" + (todayDate.getFullYear())
  let today = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate())

  let allAmount = []

  Logger.log(todayFormatedDate)



  empResultObj.records.forEach(record => {

    let firstName = record.firstName
    let lastName = record.lastName

    try {


      let payStubsUrl = "https://apis.paycor.com/v1/employees/" + record.employee.id + "/paystubs?checkDate=" + todayFormatedDate + "&include=All"

      let payStubsResponse = UrlFetchApp.fetch(payStubsUrl, options);
      let payStubsResult = payStubsResponse.getContentText();
      let payStubsObj = JSON.parse(payStubsResult);



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

  //Logger.log(allAmount.length)



  if (allAmount.length > 0) {
    //Logger.log(allAmount[0])
    let sheet = ss.getSheetByName(SHEET_NAME)
    sheet.getRange(sheet.getLastRow() + 1, 1, allAmount.length, allAmount[0].length).setValues(allAmount)

    return

    let allTaxes = allAmount.filter(row => row[3] == "FUI" || row[3] == "UNEAL" || (row[2] == "taxes" && row[3] == "MED") || (row[2] == "taxes" && row[3] == "SOC"))

    let soc = 0;
    let med = 0;
    let fui = 0;
    let uneal = 0;

    allTaxes.forEach(row => {
      if (row[3] == 'SOC') {
        soc += row[4]

      } else if (row[3] == 'MED') {
        med += row[4]

      } else if (row[3] == 'FUI') {
        fui += row[4]

      } else if (row[3] == 'UNEAL') {
        uneal += row[4]
      }

    })

    let combinedTaxes = [];
    if (soc > 0) {
      combinedTaxes.push([allTaxes[0][1], "SOC", soc])
    }

    if (med > 0) {
      combinedTaxes.push([allTaxes[0][1], "MED", med])
    }

    if (fui > 0) {
      combinedTaxes.push([allTaxes[0][1], "FUI", fui])
    }

    if (uneal > 0) {
      combinedTaxes.push([allTaxes[0][1], "UNEAL", uneal])
    }

    if (combinedTaxes.length > 0) {
      let operationSS = SpreadsheetApp.openById(OPERATION_CAL_SS_ID);
      let operationPayStubs = operationSS.getSheetByName(OPERATION_CAL_SHEET_NAME);
      operationPayStubs.getRange(operationPayStubs.getLastRow() + 1, 1, combinedTaxes.length, combinedTaxes[0].length).setValues(combinedTaxes)
    }

  }



}







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

  //Logger.log(resultObj)

  return resultObj
}














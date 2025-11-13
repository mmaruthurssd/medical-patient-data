


//const PAYCHECK_SS_ID = "13-NKu0D13pzul-dTyfrD2az0CzPqp1Y_7E-yJPWg2Yk"
const PAYCHECK_SUMM_SHEET = "Pay Period Summary (Main)"



function processPayCheckData() {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getActiveSheet();


  let thisPaycheckDataSheet = ss.getSheetByName("Paycheck Data");
  let existingData = thisPaycheckDataSheet.getRange(1, 1, thisPaycheckDataSheet.getLastRow(), thisPaycheckDataSheet.getLastColumn()).getValues();




  let paycheckSS = SpreadsheetApp.openById(PAYCHECK_SS_ID);
  let paycheckSummSheet = paycheckSS.getSheetByName(PAYCHECK_SUMM_SHEET);

  let payPeriod = "24-26: 12/15/2024-12/28/2024";
  paycheckSummSheet.getRange("F2").setValue(payPeriod);

  SpreadsheetApp.flush();
  Utilities.sleep(10000);
  SpreadsheetApp.flush();






  let paycheckSummData = paycheckSummSheet.getRange(5, 2, paycheckSummSheet.getLastRow() - 4, paycheckSummSheet.getLastColumn() - 1).getValues();

  let newPaycheckData = []
  existingData = existingData.filter(row => row[0] != payPeriod);

  paycheckSummData.forEach(row => {
    if (row[0] != "" && row[0] != null) {

      for (var i = 2; i < row.length; i++) {


        if (i == 5 && row[i] > 0) {
          existingData.push([payPeriod, row[0], "Reg Pay", row[i]])

        } else if (i == 6 && row[i] > 0) {
          existingData.push([payPeriod, row[0], "OT Pay", row[i]])

        } else if (i == 8 && row[i] > 0) {
          existingData.push([payPeriod, row[0], "Salary", row[i]])

        } else if (i == 15 && row[i] > 0) {
          existingData.push([payPeriod, row[0], "TravelS", row[i]])

        } else if (i == 16 && row[i] > 0) {
          existingData.push([payPeriod, row[0], "ARP", row[i]])

        } else if (i == 17 && row[i] > 0) {
          existingData.push([payPeriod, row[0], "Bonuses", row[i]])

        } else if (i == 18 && row[i] > 0) {
          existingData.push([payPeriod, row[0], "Other Bonuses", row[i]])

        } else if (i == 19 && row[i] > 0) {
          existingData.push([payPeriod, row[0], "SProd", row[i]])

        } else if (i == 20 && row[i] > 0) {
          existingData.push([payPeriod, row[0], "ApptProd", row[i]])

        } else if (i == 21 && row[i] > 0) {
          existingData.push([payPeriod, row[0], "CProd", row[i]])

        } else if (i == 22 && row[i] > 0) {
          existingData.push([payPeriod, row[0], "Cosmetic", row[i]])

        } else if (i == 23 && row[i] > 0) {
          existingData.push([payPeriod, row[0], "SkinS", row[i]])

        } else if (i == 24 && row[i] > 0) {
          existingData.push([payPeriod, row[0], "APP Super Comp", row[i]])

        } else if (i == 25 && row[i] > 0) {
          existingData.push([payPeriod, row[0], "Other Comp", row[i]])

        }

      }

      let pto = 0;
      let hol = 0;
      if (row[12] > 0) {
        pto = row[12] * row[7]
      }
      if (row[13] > 0) {
        hol = row[13] * row[7]
      }

      if (pto > 0 || hol > 0) {
        existingData.push([payPeriod, row[0], "PTO/HOL", pto + hol])
      }


    }
  })



  // Logger.log(existingData);


  // if (newPaycheckData.length > 0) {
  //   //existingData = existingData.concat([newPaycheckData])
  //   existingData = [...existingData, ...newPaycheckData]
  // }

  // Logger.log(newPaycheckData)

  // Logger.log(existingData)
  thisPaycheckDataSheet.getRange(1, 1, existingData.length, existingData[0].length).setValues(existingData)

  if (thisPaycheckDataSheet.getLastRow() > existingData.length) {
    thisPaycheckDataSheet.getRange(existingData.length + 1, 1, thisPaycheckDataSheet.getLastRow() - existingData.length, thisPaycheckDataSheet.getLastColumn()).clearContent()
  }
}











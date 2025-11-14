const INVOICE_SS_ID = "1litcuGtcoQcsiVGA56_Lc_oDhCOBT7sIEyqt0Gerigw"

function findInvociePayeeId() {

  const destSS = SpreadsheetApp.openById(INVOICE_SS_ID);
  const destSheet = destSS.getSheetByName("Consolidated Log");

  const headers = destSheet.getRange(2, 1, 1, destSheet.getLastColumn()).getValues()[0]
  const companyIndex = headers.indexOf("AI - Company")
  const payeeIdIndex = headers.indexOf("Payee ID")

  const allCompanies = destSheet.getRange(2, companyIndex + 1, destSheet.getLastRow() - 1, 1).getValues();
  const allPayeeIds = destSheet.getRange(2, payeeIdIndex + 1, destSheet.getLastRow() - 1, 1).getValues();


  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Payee Ids");

  const payeeDetails = sheet.getRange(1, 2, sheet.getLastRow(), 2).getValues();


  for (var i = 1; i < allCompanies.length; i++) {

    if (allCompanies[i][0] != "" && allPayeeIds[i][0] == "") {

      for (var j = 1; j < payeeDetails.length; j++) {

        let result = MATCH_COMPANY_ID(payeeDetails[j][0], allCompanies[i][0], threshold = 0.7)
        if (result) {
          allPayeeIds[i][0] = payeeDetails[j][1]
          break
        }
      }
    }
  }


  destSheet.getRange(2, payeeIdIndex + 1, allPayeeIds.length, 1).setValues(allPayeeIds)

}








const MASTER_PAYEE_IDS_SS_ID = "1c3PfO2dnF2smtpagSVEKGJEXBgc7M5SFe9XTf0lDCAs"

function findOrdersPayeeId() {

  const destSS = SpreadsheetApp.getActiveSpreadsheet();
  const destSheet = destSS.getSheetByName("Documents");

  const headers = destSheet.getRange(2, 1, 1, destSheet.getLastColumn()).getValues()[0]
  const companyIndex = headers.indexOf("Supplier")
  const payeeIdIndex = headers.indexOf("Payee Id")

  const allCompanies = destSheet.getRange(1, companyIndex + 1, destSheet.getLastRow(), 1).getValues();
  const allPayeeIds = destSheet.getRange(1, payeeIdIndex + 1, destSheet.getLastRow(), 1).getValues();


  const sourceSS = SpreadsheetApp.openById(MASTER_PAYEE_IDS_SS_ID);
  const sourceSheet = sourceSS.getSheetByName("Payee Ids");

  const payeeDetails = sourceSheet.getRange(1, 2, sourceSheet.getLastRow(), 2).getValues();


  for (var i = 1; i < allCompanies.length; i++) {

    if (allCompanies[i][0] != "" && allPayeeIds[i][0] == "") {

      for (var j = 1; j < payeeDetails.length; j++) {

        let result = MatchingText.MATCH_COMPANY_ID(payeeDetails[j][0], allCompanies[i][0], 0.7)
        if (result) {
          allPayeeIds[i][0] = payeeDetails[j][1]
          break
        }
      }
    }
  }


  destSheet.getRange(1, payeeIdIndex + 1, allPayeeIds.length, 1).setValues(allPayeeIds)

}
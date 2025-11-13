




function processPaidPendingToCompleteFromQB() {
  //return

}



function processPaidPendingToCompleteFromBank() {

  const scriptProperties = PropertiesService.getScriptProperties();
  const data = scriptProperties.getProperties();

  let ss = SpreadsheetApp.getActiveSpreadsheet()

  //Logger.log(data.executeScript)

  try {

    if (data.executeScript === "Yes") {

      scriptProperties.setProperties({ "executeScript": "No" })


      let bankSS = SpreadsheetApp.openById("1v8EDTszT520Rixmwxw-wGiPTLfr9JZE2Ahl9hSmjzQ8");
      let bankSheet = bankSS.getSheetByName("Data");

      let bankData = bankSheet.getRange(2, 1, bankSheet.getLastRow() - 1, 9).getValues()
      let expensesChecks = bankData.filter(r => r[5] != "" && r[5] != null).map(r => r[5].toString())


      let paidPendingSheet = ss.getSheetByName("Paid - Pending")
      let checkNos = paidPendingSheet.getRange(1, 8, paidPendingSheet.getLastRow(), 1).getDisplayValues();


      let complete_col = paidPendingSheet.getRange("PAID_PENDING_COMPLETED_STATUS").getColumn();

      checkNos.forEach((row, index) => {

        //if (row[complete_col - 1] != "Yes") {
        let checkIndex = expensesChecks.indexOf(row[0])

        if (checkIndex > -1) {
          paidPendingSheet.getRange(index + 1, complete_col).setValue("Yes")
        }
        //}
      })


      let paidPendingData = paidPendingSheet.getRange(1, 1, paidPendingSheet.getLastRow(), 12).getValues();


      paidPendingData.forEach((row, index) => {

        if (isValidDate_(row[1]) && row[complete_col - 1] != "Yes") {

          //Logger.log(row)
          for (var i = 0; i < bankData.length; i++) {

            if (isValidDate_(bankData[i][1])) {
              let debitCredit = 0
              if (bankData[i][7] > 0) {
                debitCredit = bankData[i][7]
              } else if (bankData[i][8] > 0) {
                debitCredit = bankData[i][8]
              }


              if (bankData[i][9] == row[2] && debitCredit == row[4] && bankData[i][1].getTime() <= row[1].getTime() + (24 * 60 * 60 * 1000 * 10) && bankData[i][1].getTime() >= row[1].getTime() - (24 * 60 * 60 * 1000 * 2)) {
                //Logger.log(row)
                paidPendingSheet.getRange(index + 1, complete_col).setValue("Yes")
                break
              }

            }

          }
        }

      })



      processPaidPendingToCompleteFromCC()

      scriptProperties.setProperties({ "executeScript": "Yes" })

    }

  } catch (err) {
    Logger.log(err)
    scriptProperties.setProperties({ "executeScript": "Yes" })

  }



  //updateDataInInvoiceLogSheet()


}






function processPaidPendingToCompleteFromCC() {



  let ss = SpreadsheetApp.getActiveSpreadsheet()

  try {


    let ccSS = SpreadsheetApp.openById("1ABS6vkYmACTT-Rx_xiEWVjbI1zEP3SFfxt5UC6H-eUg");
    let ccSheet = ccSS.getSheetByName("Data");

    let ccData = ccSheet.getRange(2, 1, ccSheet.getLastRow() - 1, ccSheet.getLastColumn()).getValues();



    let paidPendingSheet = ss.getSheetByName("Paid - Pending")
    let paidPendingData = paidPendingSheet.getRange(1, 1, paidPendingSheet.getLastRow(), 5).getValues();


    let complete_col = paidPendingSheet.getRange("PAID_PENDING_COMPLETED_STATUS").getColumn();



    paidPendingData.forEach((row, index) => {

      if (isValidDate_(row[1]) && row[complete_col - 1] != "Yes") {

        //Logger.log(row)
        for (var i = 0; i < ccData.length; i++) {
          if (isValidDate_(ccData[i][1])) {


            if (ccData[i][8] == row[2] && ccData[i][6] == row[4] && ccData[i][1].getTime() <= row[1].getTime() + (24 * 60 * 60 * 1000 * 3) && ccData[i][1].getTime() >= row[1].getTime() - (24 * 60 * 60 * 1000 * 2)) {
              //Logger.log(row)
              paidPendingSheet.getRange(index + 1, complete_col).setValue("Yes")
              break
            }

          }
        }
      }

    })





  } catch (err) {
    Logger.log(err)


  }


}










//below function will return true if the arg is valid date and false if not.
function isValidDate_(d) {
  if (Object.prototype.toString.call(d) !== "[object Date]")
    return false;
  return !isNaN(d.getTime());
}














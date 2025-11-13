

function ssdInvoicesToSsdCosmetics() {

  //return
  const SS = SpreadsheetApp.getActiveSpreadsheet();

  try {

    let SsdInvoicesSS = SpreadsheetApp.openById('1litcuGtcoQcsiVGA56_Lc_oDhCOBT7sIEyqt0Gerigw')

    let InvoicesLogSheet = SsdInvoicesSS.getSheetByName('Unpaid Invoices')
    let unpaidInvoices = InvoicesLogSheet.getRange(2, 1, InvoicesLogSheet.getLastRow() - 1, InvoicesLogSheet.getLastColumn()).getValues().filter(r => r[18] != '' && r[18] != null);

    //Logger.log(unpaidInvoices)


    let PaidInvoicesLogSheet = SsdInvoicesSS.getSheetByName('Paid Invoices')
    let paidInvoices = PaidInvoicesLogSheet.getRange(2, 1, PaidInvoicesLogSheet.getLastRow() - 1, PaidInvoicesLogSheet.getLastColumn()).getValues().filter(r => r[19] != '' && r[19] != null);


    let PaidPendingInvoicesLogSheet = SsdInvoicesSS.getSheetByName('Paid - Pending')
    let paidPendingInvoices = PaidPendingInvoicesLogSheet.getRange(2, 1, PaidPendingInvoicesLogSheet.getLastRow() - 1, PaidPendingInvoicesLogSheet.getLastColumn()).getValues().filter(r => r[19] != '' && r[19] != null);



    const Sheet = SS.getSheetByName('SSD Invoices / Bills Dash RD')
    //const SheetInvoiceIds = Sheet.getRange(1, 18, Sheet.getLastRow(), 1).getDisplayValues().map(r => r[0].toString().trim())


    let newInvoices = [];
    unpaidInvoices.forEach(row => {
      if (row[0] == 'StimLabs' || row[0] == 'Advanced Healthcare Solutions') {
        // let invoiceIndex = SheetInvoiceIds.indexOf(row[17].toString().trim());
        // if (invoiceIndex == -1) {
        row.splice(14, -1, "")
        newInvoices.push(row)
        // }
      }
    })


    paidInvoices.forEach(row => {
      if (row[0] == 'StimLabs' || row[0] == 'Advanced Healthcare Solutions') {
        // let invoiceIndex = SheetInvoiceIds.indexOf(row[17].toString().trim());
        // if (invoiceIndex == -1) {
        newInvoices.push(row)
        //}
      }
    })



    paidPendingInvoices.forEach(row => {
      if (row[0] == 'StimLabs' || row[0] == 'Advanced Healthcare Solutions') {
        // let invoiceIndex = SheetInvoiceIds.indexOf(row[17].toString().trim());
        // if (invoiceIndex == -1) {
        newInvoices.push(row)
        //}
      }
    })


    if (newInvoices.length === 0) {
      console.log('no new data found to be updated ...');

      // let statusRow = [[Session.getActiveUser(), new Date(), "Successful"]]
      // updateScriptStatus_(SS, "SCR-005", statusRow, true)
      return;
    }


    Sheet.getRange(2, 1, newInvoices.length, newInvoices[0].length).setValues(newInvoices);


    // let statusRow = [[Session.getActiveUser(), new Date(), "Successful"]]
    // updateScriptStatus_(SS, "SCR-005", statusRow, true)


  } catch (err) {

    Logger.log(err)
    // let statusRow = [[Session.getActiveUser(), new Date(), err]]
    // updateScriptStatus_(SS, "SCR-005", statusRow, false)
  }



}



function updateScriptStatus_(ss, scriptId, statusRow, status) {
  let script = ss.getSheetByName("Script");

  let thisScripIds = script.getRange(1, 1, script.getLastRow(), 1).getValues().map(r => r[0]);
  let indexOfThisScriptId = thisScripIds.indexOf(scriptId);
  if (indexOfThisScriptId > -1) {
    script.getRange(indexOfThisScriptId + 1, 9, 1, 3).setValues(statusRow)
  }



  let AllScriptSS = SpreadsheetApp.openById("1nbu0Z3JS1ZH_QKjcOoQJ7ohDPOVqlQMQ597XLBqiOd8");
  let scriptLogSheet = AllScriptSS.getSheetByName("Scripts Log");

  let scriptLogs = scriptLogSheet.getRange(1, 1, scriptLogSheet.getLastRow(), scriptLogSheet.getLastColumn()).getValues()
  let scriptLogIds = scriptLogs.map(r => r[0]);

  let indexOfScriptId = scriptLogIds.indexOf(scriptId);
  if (indexOfScriptId > -1) {
    scriptLogSheet.getRange(indexOfScriptId + 1, 9, 1, 3).setValues(statusRow)

    let scriptCount = scriptLogs[indexOfScriptId][11] + 1
    scriptLogSheet.getRange(indexOfScriptId + 1, 12).setValue(scriptCount)

    if (status == false) {
      let errorCount = scriptLogs[indexOfScriptId][12] + 1
      scriptLogSheet.getRange(indexOfScriptId + 1, 13).setValue(errorCount)
    }

  }


}





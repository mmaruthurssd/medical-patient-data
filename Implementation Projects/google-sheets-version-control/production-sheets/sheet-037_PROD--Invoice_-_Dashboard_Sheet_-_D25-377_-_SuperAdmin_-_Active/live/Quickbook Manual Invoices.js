




function quickbookManualInvoicesTriggerNew() {
  ScriptApp.newTrigger("createRecurringManualInvoices")
    .timeBased()
    .everyDays(1)
    .atHour(4)
    .nearMinute(0)
    .inTimezone(Session.getScriptTimeZone())
    .create()
}




function createRecurringManualInvoices() {


  let ss = SpreadsheetApp.getActiveSpreadsheet();


  let recurringSheet = getSheetByID_(ss, '1483896010')
  let recurringData = recurringSheet.getRange("A4:D").getDisplayValues().filter(r => r[3] != "");
  let manualInvoices = [];


  let todayDate = new Date().getDate().toString()

  recurringData.forEach(r => {
    try {
      let date = r[3].split("-")[0];


      if (todayDate == date) {
        let inv = [r[0], new Date().toLocaleDateString(), "", "Manual Invoice", "", "", "", "Auto Generated"]
        manualInvoices.push(inv)
      }

    } catch (errrr) { Logger.log(errrr) }
  })




  if (manualInvoices.length == 0) {
    Logger.log("No Manual invoice to autogenerate.")
    return
  }



  let ManualSheet = getSheetByID_(ss, '1295388366')
  ManualSheet.insertRows(2, manualInvoices.length)
  ManualSheet.getRange(2, 3, manualInvoices.length, manualInvoices[0].length).setValues(manualInvoices)



}







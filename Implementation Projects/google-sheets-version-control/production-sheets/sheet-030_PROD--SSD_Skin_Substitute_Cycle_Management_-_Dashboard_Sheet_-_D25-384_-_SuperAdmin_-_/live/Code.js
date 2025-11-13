



function onOpen() {

  SpreadsheetApp.getUi()
    .createMenu('⌛️Custom')
    .addItem('📝Update SSD Invoices', 'ssdInvoicesToSsdSkin').addToUi()

}


function ssdInvoicesToSsdSkin() {

  //return

  const SS = SpreadsheetApp.getActiveSpreadsheet();


  //try {

  let SsdInvoicesSS = SpreadsheetApp.openById('1litcuGtcoQcsiVGA56_Lc_oDhCOBT7sIEyqt0Gerigw')

  let InvoicesLogSheet = SsdInvoicesSS.getSheetByName('Unpaid Invoices (Main)')
  let invoiceLogHeaders = InvoicesLogSheet.getRange(2, 1, 1, InvoicesLogSheet.getLastColumn()).getDisplayValues()[0];
  let InvoiceLogHeaderObj = {};
  invoiceLogHeaders.forEach((h, i) => {
    InvoiceLogHeaderObj[h] = i
  })

  let unpaidInvoices = InvoicesLogSheet.getRange(2, 1, InvoicesLogSheet.getLastRow() - 1, InvoicesLogSheet.getLastColumn()).getValues().filter(r => r[InvoiceLogHeaderObj['SSD Invoice #']] != '' && r[InvoiceLogHeaderObj['SSD Invoice #']] != null && r[InvoiceLogHeaderObj['Skin Substitute']] == "Yes");



  let PaidInvoicesLogSheet = SsdInvoicesSS.getSheetByName('Paid Invoices')
  let paidInvoicesHeaders = PaidInvoicesLogSheet.getRange(2, 1, 1, PaidInvoicesLogSheet.getLastColumn()).getDisplayValues()[0];
  let PaidInvoicesHeadersObj = {};
  paidInvoicesHeaders.forEach((h, i) => {
    PaidInvoicesHeadersObj[h] = i
  })
  let paidInvoices = PaidInvoicesLogSheet.getRange(2, 1, PaidInvoicesLogSheet.getLastRow() - 1, PaidInvoicesLogSheet.getLastColumn()).getValues().filter(r => r[PaidInvoicesHeadersObj['SSD Invoice #']] != '' && r[PaidInvoicesHeadersObj['SSD Invoice #']] != null && r[PaidInvoicesHeadersObj['Skin Substitute']] == "Yes");



  let PaidPendingInvoicesLogSheet = SsdInvoicesSS.getSheetByName('Paid - Pending')
  let paidPendingInvoicesHeaders = PaidPendingInvoicesLogSheet.getRange(2, 1, 1, PaidPendingInvoicesLogSheet.getLastColumn()).getDisplayValues()[0];
  let PaidPendingInvoicesHeadersObj = {};
  paidPendingInvoicesHeaders.forEach((h, i) => {
    PaidPendingInvoicesHeadersObj[h] = i
  })
  let paidPendingInvoices = PaidPendingInvoicesLogSheet.getRange(2, 1, PaidPendingInvoicesLogSheet.getLastRow() - 1, PaidPendingInvoicesLogSheet.getLastColumn()).getValues().filter(r => r[PaidPendingInvoicesHeadersObj['SSD Invoice #']] != '' && r[PaidPendingInvoicesHeadersObj['SSD Invoice #']] != null && r[PaidPendingInvoicesHeadersObj['Skin Substitute']] == "Yes");




  const Sheet = SS.getSheetByName('SSD Invoices Dash')
  let sheetHeaders = Sheet.getRange("E1:R1").getDisplayValues()[0]
  let SheetHeadersObj = {};
  sheetHeaders.forEach((h, i) => {
    SheetHeadersObj[h] = i
  })

  let sheetData = [];
  let sheetSSDIds = [];
  // if (Sheet.getLastRow() > 1) {
  //   sheetData = Sheet.getRange(2, 4, Sheet.getLastRow() - 1, 14).getValues().filter(row => row[SheetHeadersObj['SSD Invoice #']] != "" && row[SheetHeadersObj['SSD Invoice #']] != null)
  //   sheetSSDIds = sheetData.map(r => r[SheetHeadersObj['SSD Invoice #']])
  // }


  // Logger.log(sheetData)
  // return




  unpaidInvoices.forEach(row => {

    let rowData = new Array(sheetHeaders.length).fill("")
    for (const key in SheetHeadersObj) {
      var sKey = key;
      if (key == "Due Date") sKey = "AI - Due Date";
      if (key == "Bill Amount") sKey = "AI - Bill Amount";
      if (key == "Payee Inv #") sKey = "AI - Payee Inv #";
      rowData[SheetHeadersObj[key]] = row[InvoiceLogHeaderObj[sKey]]
    }

    let idIndex = sheetSSDIds.indexOf(rowData[SheetHeadersObj['SSD Invoice #']])
    if (idIndex > -1) {
      sheetData[idIndex] = rowData
    } else {
      sheetData.push(rowData);
      sheetSSDIds.push(rowData[SheetHeadersObj['SSD Invoice #']])
    }

  })


  paidInvoices.forEach(row => {

    let rowData = new Array(sheetHeaders.length).fill("")
    for (const key in SheetHeadersObj) {
      var sKey = key;
      if (key == "Payee Inv #") sKey = "AI - Payee Inv #";
      if (key == "Due Date") sKey = "AI - Due Date";
      if (key == "Bill Amount") sKey = "AI - Bill Amount";
      rowData[SheetHeadersObj[key]] = row[PaidInvoicesHeadersObj[sKey]]
    }

    let idIndex = sheetSSDIds.indexOf(rowData[SheetHeadersObj['SSD Invoice #']])
    if (idIndex > -1) {
      sheetData[idIndex] = rowData
    } else {
      sheetData.push(rowData);
      sheetSSDIds.push(rowData[SheetHeadersObj['SSD Invoice #']])
    }

  })



  paidPendingInvoices.forEach(row => {
    let rowData = new Array(sheetHeaders.length).fill("")
    for (const key in SheetHeadersObj) {
      var sKey = key;
      if (key == "Payee Inv #") sKey = "AI - Payee Inv #";
      if (key == "Due Date") sKey = "AI - Due Date";
      if (key == "Bill Amount") sKey = "AI - Bill Amount";
      rowData[SheetHeadersObj[key]] = row[PaidPendingInvoicesHeadersObj[sKey]]
    }

    let idIndex = sheetSSDIds.indexOf(rowData[SheetHeadersObj['SSD Invoice #']])
    if (idIndex > -1) {
      sheetData[idIndex] = rowData
    } else {
      sheetData.push(rowData);
      sheetSSDIds.push(rowData[SheetHeadersObj['SSD Invoice #']])
    }
  })


  if (sheetData.length === 0) {
    console.log('no new data found to be updated ...');

    return;
  }







  if (Sheet.getLastRow() > 1) {
    Sheet.getRange(2, 5, Sheet.getLastRow() - 1, 14).clearContent()
  }

  if (sheetData.length > 0) {
    Sheet.getRange(2, 5, sheetData.length, sheetData[0].length).setValues(sheetData);
    Sheet.getRange(2, 1, Sheet.getLastRow() - 1, Sheet.getLastColumn()).sort([{ column: 7, ascending: false }]);
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





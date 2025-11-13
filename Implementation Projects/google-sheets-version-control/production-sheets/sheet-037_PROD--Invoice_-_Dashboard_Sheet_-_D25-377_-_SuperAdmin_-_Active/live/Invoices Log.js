

const PAYEE_IDS_SS_ID = "1c3PfO2dnF2smtpagSVEKGJEXBgc7M5SFe9XTf0lDCAs";
const PAYEE_IDS_SHEET = "Payee Ids"


function setInitialProperty() {
  const scriptProperties = PropertiesService.getScriptProperties();

  scriptProperties.setProperties({ "executeScript": "Yes" })

  Logger.log(scriptProperties)
  const data = scriptProperties.getProperties();
  Logger.log(data)
}






function onOpen() {
  const ui = SpreadsheetApp.getUi();

  const menu = ui.createMenu("⌛️Custom")
  //menu.addItem("📑Consolidated Log", "updateDataInConsolidatedLogSheet").addToUi()
  menu.addItem("📑Update Invoices", "updateDataInInvoiceLogSheet").addToUi()
  menu.addItem("Update Recurring Bills Payee", "addRemoveRecurringPayee").addToUi()

  menu.addItem("Filter Current Payee", "sendActiveCellToFiltered").addToUi()
}





function testSorting() {

  let ActiveSpreadsheet = SpreadsheetApp.getActiveSpreadsheet()


  const InvoiceLogSheet = ActiveSpreadsheet.getSheetByName('Unpaid Invoices (Main)');

  let InvoicesLogHeaders = InvoiceLogSheet.getRange(2, 1, 1, InvoiceLogSheet.getLastColumn()).getDisplayValues()[0];
  let invoicesLogHeadersObj = {};
  InvoicesLogHeaders.forEach((h, i) => {
    invoicesLogHeadersObj[h.toString().trim()] = i
  })


  InvoiceLogSheet.getRange(3, 1, InvoiceLogSheet.getLastRow() - 2, InvoiceLogSheet.getLastColumn()).sort({ column: invoicesLogHeadersObj['Sorting Process'] + 1, ascending: true });

}



function updateDataInInvoiceLogSheet() {

  //return

  try {
    processPaidPendingToCompleteFromBank()
  } catch (err) { Logger.log(err) }

  const scriptProperties = PropertiesService.getScriptProperties();

  const data = scriptProperties.getProperties();

  //Logger.log(data)


  const ActiveSpreadsheet = SpreadsheetApp.getActive();


  try {

    if (data.executeScript === "Yes") {

      scriptProperties.setProperties({ "executeScript": "No" })

      try {
        vendorDashboardProcess()
      } catch (err) { Logger.log(err) }

      try {
        fetchSkinSubstituteReimbursementsStatus_()
      } catch (err) { Logger.log(err) }

      try {
        processAlreadyPaidManual()
      } catch (err) { Logger.log(err) }

      try {
        completedStatusInvoiceProcess_('Unpaid Invoices (Main)', 'INVOICE_LOG_COMPLETED_STATUS')
      } catch (err) { Logger.log(err) }


      try {
        invoiceLogPaidPendingProcess_()
      } catch (err) { Logger.log(err) }



      try {
        completedStatusInvoiceProcess_('Paid - Pending', 'PAID_PENDING_COMPLETED_STATUS')
      } catch (err) { Logger.log(err) }

      //return

      try {
        unpaidInvoicesToConsolidatedLog_()
      } catch (err) { Logger.log(err) }


      try {
        updateDataInInvoiceLogSheetFromManual_()
      } catch (err) { Logger.log(err) }


      try {
        noNeedPayProcess_('Unpaid Invoices (Main)', 'INVOICE_LOG_COMPLETED_STATUS')
      } catch (err) { Logger.log(err) }

      SpreadsheetApp.flush()





      //from consolidated log to unpaid invoices

      console.log('checking for new data to be updated ...');


      const ConsolidatedSheet = ActiveSpreadsheet.getSheetByName('Consolidated Log');
      const ConsolidatedLogData = ConsolidatedSheet.getRange(2, 1, ConsolidatedSheet.getLastRow() - 1, ConsolidatedSheet.getLastColumn()).getDisplayValues()
      const ConsolidatedHeaders = ConsolidatedLogData.splice(0, 1)[0];
      const ConsCatIndex = ConsolidatedHeaders.indexOf('Category')
      let DataValues = ConsolidatedLogData.filter(row => row[0] === '0' && row[ConsCatIndex] === 'Invoice');


      let ConsolidatedLogHeaders = ConsolidatedSheet.getRange(2, 1, 1, ConsolidatedSheet.getLastColumn()).getDisplayValues()[0];
      let consolidatedLogHeadersObj = {};
      ConsolidatedLogHeaders.forEach((h, i) => {
        consolidatedLogHeadersObj[h.toString().trim()] = i
      })



      const InvoiceLogSheet = ActiveSpreadsheet.getSheetByName('Unpaid Invoices (Main)');

      //let HeadersRow = InvoiceLogSheet.getRange(2, 1, 1, InvoiceLogSheet.getLastColumn()).getValues()[0].map(h => h.toString().toLowerCase().trim())

      let InvoicesLogHeaders = InvoiceLogSheet.getRange(2, 1, 1, InvoiceLogSheet.getLastColumn()).getDisplayValues()[0];
      let invoicesLogHeadersObj = {};
      InvoicesLogHeaders.forEach((h, i) => {
        invoicesLogHeadersObj[h.toString().trim()] = i
      })


      InvoiceLogSheet.getRange(3, 1, InvoiceLogSheet.getLastRow() - 2, InvoiceLogSheet.getLastColumn()).sort({ column: invoicesLogHeadersObj['Sorting Process'] + 1, ascending: true });




      if (DataValues.length === 0) {
        console.log('no new data found to be updated ...');
        updateDataInConsolidatedLogSheet()
        scriptProperties.setProperties({ "executeScript": "Yes" })
        return;
      }

      console.log('mapping the new data to be updated ...');


      const InvoiceIdTrackerSheet = ActiveSpreadsheet.getSheetByName("Invoice_ID_Tracker_")
      let InvoiceID = InvoiceIdTrackerSheet.getRange("A2").getValue()
      let AllInvoiceIds = []


      DataValues.forEach(row => {
        //row.shift();
        //row.splice(4, 1)
        InvoiceID++
        AllInvoiceIds.push(["SSD-" + InvoiceID])
      });







      const payeeIdsSS = SpreadsheetApp.openById(PAYEE_IDS_SS_ID);
      const payeeIdsSheet = payeeIdsSS.getSheetByName(PAYEE_IDS_SHEET);
      const allUniquePayee = payeeIdsSheet.getRange(1, 1, payeeIdsSheet.getLastRow(), payeeIdsSheet.getLastColumn()).getValues();
      const allUniquePayeeHeaders = allUniquePayee.splice(0, 1)[0]
      const allUniquePayeeIdsIndex = allUniquePayeeHeaders.indexOf("Payee Ids");
      const allUniqueBPPIndex = allUniquePayeeHeaders.indexOf("Bill Pay Plan");

      const allUniquePayeeIds = allUniquePayee.map(r => r[allUniquePayeeIdsIndex]);



      //Category	Source	Date	Time	From
      let FinalDataValues = []
      DataValues.forEach(row => {
        let rowData = new Array(InvoicesLogHeaders.length).fill("")

        for (const key in invoicesLogHeadersObj) {
          if (consolidatedLogHeadersObj[key] || consolidatedLogHeadersObj[key] === 0) {
            rowData[invoicesLogHeadersObj[key]] = row[consolidatedLogHeadersObj[key]]
          }
        }
        //rowData[invoicesLogHeadersObj["Payee ID"]] = row[consolidatedLogHeadersObj["Mail Sender"]]

        if (rowData[invoicesLogHeadersObj["Payee ID"]] != "") {
          let uniquePayeeRowIndex = allUniquePayeeIds.indexOf(rowData[invoicesLogHeadersObj["Payee ID"]])
          if (uniquePayeeRowIndex > -1) {
            if (allUniquePayee[uniquePayeeRowIndex][allUniqueBPPIndex] != "") {
              rowData[invoicesLogHeadersObj["Bill Pay Plan"]] = allUniquePayee[uniquePayeeRowIndex][allUniqueBPPIndex]
            }
          }
        }

        FinalDataValues.push(rowData)
      })








      InvoiceIdTrackerSheet.getRange("A2").setValue(InvoiceID)



      const InvoiceIdCol = InvoiceLogSheet.getRange("INVOICE_LOG_SSD_INVOICE_ID").getColumn()
      const InoiceLogLastRow = InvoiceLogSheet.getLastRow() + 1

      InvoiceLogSheet.getRange(InoiceLogLastRow, 1, FinalDataValues.length, FinalDataValues[0].length)
        .setValues(FinalDataValues);

      InvoiceLogSheet.getRange(InoiceLogLastRow, InvoiceIdCol, AllInvoiceIds.length, 1).setValues(AllInvoiceIds);

      InvoiceLogSheet.getRange(3, 1, InvoiceLogSheet.getLastRow() - 2, InvoiceLogSheet.getLastColumn()).sort({ column: invoicesLogHeadersObj['Sorting Process'] + 1, ascending: false });

      console.log(FinalDataValues.length + ' new records were found and updated ...');

      SpreadsheetApp.flush()

      updateDataInConsolidatedLogSheet()

      SpreadsheetApp.flush()
      Utilities.sleep(1000)

      findInvociePayeeId()

      scriptProperties.setProperties({ "executeScript": "Yes" })

    }
  } catch (err) {
    scriptProperties.setProperties({ "executeScript": "Yes" })
  }



}


const MASTER_PAYEE_IDS_SS_ID = "1c3PfO2dnF2smtpagSVEKGJEXBgc7M5SFe9XTf0lDCAs"

function findInvociePayeeId() {

  const destSS = SpreadsheetApp.getActiveSpreadsheet();
  const destSheet = destSS.getSheetByName("Consolidated Log");

  const headers = destSheet.getRange(2, 1, 1, destSheet.getLastColumn()).getValues()[0]
  const companyIndex = headers.indexOf("AI - Company")
  const payeeIdIndex = headers.indexOf("Payee ID")

  const allCompanies = destSheet.getRange(2, companyIndex + 1, destSheet.getLastRow() - 1, 1).getValues();
  const allPayeeIds = destSheet.getRange(2, payeeIdIndex + 1, destSheet.getLastRow() - 1, 1).getValues();


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


  destSheet.getRange(2, payeeIdIndex + 1, allPayeeIds.length, 1).setValues(allPayeeIds)

}








function invoiceLogPaidPendingProcess_() {

  //return
  //console.log('checking for new completed status Data...');

  const ActiveSpreadsheet = SpreadsheetApp.getActive();

  const Sheet = ActiveSpreadsheet.getSheetByName('Unpaid Invoices (Main)');
  const AllInvoices = Sheet.getRange(2, 1, Sheet.getLastRow() - 1, Sheet.getLastColumn()).getValues();

  let AllInvoicesHeaders = Sheet.getRange(2, 1, 1, Sheet.getLastColumn()).getDisplayValues()[0];
  let invoicesHeadersObj = {};
  AllInvoicesHeaders.forEach((h, i) => {
    invoicesHeadersObj[h.toString().trim()] = i
  })

  let bill_Pay_Status_col = Sheet.getRange('INVOICE_LOG_BILL_PAY_STATUS').getColumn();


  const PaidPendingInvoiceSheet = ActiveSpreadsheet.getSheetByName('Paid - Pending');
  let PendingInvoicesHeaders = PaidPendingInvoiceSheet.getRange(2, 1, 1, PaidPendingInvoiceSheet.getLastColumn()).getDisplayValues()[0];
  let pendingInvoicesHeadersObj = {};
  PendingInvoicesHeaders.forEach((h, i) => {
    pendingInvoicesHeadersObj[h.toString().trim()] = i
  })

  let PaidInvoices = []
  for (var i = AllInvoices.length - 1; i >= 0; i--) {

    //if (AllInvoices[i][bill_Pay_Status_col - 1] != null && AllInvoices[i][bill_Pay_Status_col - 1].toString().includes('Paid')) {
    //if (AllInvoices[i][bill_Pay_Status_col - 1] != null && AllInvoices[i][bill_Pay_Status_col - 1] != "") {
    //if (AllInvoices[i][bill_Pay_Status_col - 1][0] == 'P' && AllInvoices[i][bill_Pay_Status_col - 1][1] == 'a' && AllInvoices[i][bill_Pay_Status_col - 1][2] == 'i' && AllInvoices[i][bill_Pay_Status_col - 1][3] == 'd') {

    if (AllInvoices[i][invoicesHeadersObj["Bill Pay Plan"]].includes("Autopay")) {

      let rowData = new Array(PendingInvoicesHeaders.length).fill("")

      for (const key in pendingInvoicesHeadersObj) {
        if (invoicesHeadersObj[key] || invoicesHeadersObj[key] === 0) {
          rowData[pendingInvoicesHeadersObj[key]] = AllInvoices[i][invoicesHeadersObj[key]]
        }
      }
      if (rowData[pendingInvoicesHeadersObj["Payee ID"]] != "" && rowData[pendingInvoicesHeadersObj["Payee ID"]] != null) {
        PaidInvoices.push(rowData)
        Sheet.deleteRows(i + 2, 1)
      }
    }
    //}
  }



  if (PaidInvoices.length === 0) {
    console.log('no new data found to be updated ...');
    return;
  }



  PaidInvoices.forEach(row => {
    //row[14] = ""
    row.pop()
  })




  PaidPendingInvoiceSheet.getRange(PaidPendingInvoiceSheet.getLastRow() + 1, 1, PaidInvoices.length, PaidInvoices[0].length).setValues(PaidInvoices)


  PaidPendingInvoiceSheet.getRange(3, 1, PaidPendingInvoiceSheet.getLastRow() - 2, PaidPendingInvoiceSheet.getLastColumn()).sort({ column: pendingInvoicesHeadersObj['Date'] + 1, ascending: false });


  console.log(PaidInvoices.length + ' new records were found and updated ...');

}






function noNeedPayProcess_(sheetName, completedStatusRange) {

  //return
  console.log('checking for new completed status Data...');

  const ActiveSpreadsheet = SpreadsheetApp.getActive();

  const Sheet = ActiveSpreadsheet.getSheetByName(sheetName);
  const AllInvoices = Sheet.getRange(2, 1, Sheet.getLastRow() - 1, Sheet.getLastColumn()).getValues();

  let AllInvoicesHeaders = Sheet.getRange(2, 1, 1, Sheet.getLastColumn()).getDisplayValues()[0];


  let invoicesHeadersObj = {};
  AllInvoicesHeaders.forEach((h, i) => {
    invoicesHeadersObj[h.toString().trim()] = i
  })


  let status_col = Sheet.getRange(completedStatusRange).getColumn();

  const PaidInvoiceSheet = ActiveSpreadsheet.getSheetByName('NNP');
  let PaidInvoicesHeaders = PaidInvoiceSheet.getRange(2, 1, 1, PaidInvoiceSheet.getLastColumn()).getDisplayValues()[0];
  let paidInvoicesHeadersObj = {};
  PaidInvoicesHeaders.forEach((h, i) => {
    paidInvoicesHeadersObj[h.toString().trim()] = i
  })


  let PaidInvoices = []
  for (var i = AllInvoices.length - 1; i >= 0; i--) {

    if (AllInvoices[i][invoicesHeadersObj["Bill Pay Status"]] == "No need to be Paid") {

      let rowData = new Array(PaidInvoicesHeaders.length).fill("")

      for (const key in paidInvoicesHeadersObj) {
        if (invoicesHeadersObj[key] || invoicesHeadersObj[key] === 0) {
          rowData[paidInvoicesHeadersObj[key]] = AllInvoices[i][invoicesHeadersObj[key]]
        }
      }

      if (rowData[paidInvoicesHeadersObj["Payee ID"]] != "" && rowData[paidInvoicesHeadersObj["Payee ID"]] != null) {
        PaidInvoices.push(rowData)
        Sheet.deleteRows(i + 2, 1)
      }
    }
  }


  if (PaidInvoices.length === 0) {
    console.log('no new data found to be updated ...');
    return;
  }


  let paidInvoice_check_Col = PaidInvoicesHeaders.indexOf("Check Processed")
  PaidInvoices.forEach(row => {
    row[paidInvoice_check_Col] = ""
    row.pop()
  })


  PaidInvoiceSheet.getRange(PaidInvoiceSheet.getLastRow() + 1, 1, PaidInvoices.length, PaidInvoices[0].length).setValues(PaidInvoices)
  //PaidInvoiceSheet.getRange(3, 1, PaidInvoiceSheet.getLastRow() - 2, PaidInvoiceSheet.getLastColumn()).sort({ column: 1, ascending: false });

}







function completedStatusInvoiceProcess_(sheetName, completedStatusRange) {


  //return
  console.log('checking for new completed status Data...');

  const ActiveSpreadsheet = SpreadsheetApp.getActive();

  const Sheet = ActiveSpreadsheet.getSheetByName(sheetName);
  const AllInvoices = Sheet.getRange(2, 1, Sheet.getLastRow() - 1, Sheet.getLastColumn()).getValues();

  let AllInvoicesHeaders = Sheet.getRange(2, 1, 1, Sheet.getLastColumn()).getDisplayValues()[0];


  let invoicesHeadersObj = {};
  AllInvoicesHeaders.forEach((h, i) => {
    invoicesHeadersObj[h.toString().trim()] = i
  })



  let status_col = Sheet.getRange(completedStatusRange).getColumn();

  const PaidInvoiceSheet = ActiveSpreadsheet.getSheetByName('Paid Invoices');
  let PaidInvoicesHeaders = PaidInvoiceSheet.getRange(2, 1, 1, PaidInvoiceSheet.getLastColumn()).getDisplayValues()[0];
  let paidInvoicesHeadersObj = {};
  PaidInvoicesHeaders.forEach((h, i) => {
    paidInvoicesHeadersObj[h.toString().trim()] = i
  })


  let PaidInvoices = []
  for (var i = AllInvoices.length - 1; i >= 0; i--) {

    if (AllInvoices[i][status_col - 1] == 'Yes' || (AllInvoices[i][invoicesHeadersObj["Bill Pay Status"]].includes("Paid -") && !AllInvoices[i][invoicesHeadersObj["Bill Pay Plan"]].includes("Autopay") && sheetName == "Unpaid Invoices (Main)")) {

      let rowData = new Array(PaidInvoicesHeaders.length).fill("")

      for (const key in paidInvoicesHeadersObj) {
        if (invoicesHeadersObj[key] || invoicesHeadersObj[key] === 0) {
          rowData[paidInvoicesHeadersObj[key]] = AllInvoices[i][invoicesHeadersObj[key]]
        }
      }

      if (rowData[paidInvoicesHeadersObj["Payee ID"]] != "" && rowData[paidInvoicesHeadersObj["Payee ID"]] != null) {
        PaidInvoices.push(rowData)
        Sheet.deleteRows(i + 2, 1)
      }
    }
  }



  if (PaidInvoices.length === 0) {
    console.log('no new data found to be updated ...');
    return;
  }




  let paidInvoice_check_Col = PaidInvoicesHeaders.indexOf("Check Processed")
  PaidInvoices.forEach(row => {
    row[paidInvoice_check_Col] = ""
    row.pop()
  })



  PaidInvoiceSheet.getRange(PaidInvoiceSheet.getLastRow() + 1, 1, PaidInvoices.length, PaidInvoices[0].length).setValues(PaidInvoices)


  PaidInvoiceSheet.getRange(3, 1, PaidInvoiceSheet.getLastRow() - 2, PaidInvoiceSheet.getLastColumn()).sort({ column: 1, ascending: false });


  console.log(PaidInvoices.length + ' new records were found and updated ...');

}



function testSortPaid() {

  const ActiveSpreadsheet = SpreadsheetApp.getActiveSpreadsheet()

  const PaidInvoiceSheet = ActiveSpreadsheet.getSheetByName('Paid Invoices');
  PaidInvoiceSheet.getRange(2, 1, PaidInvoiceSheet.getLastRow() - 1, PaidInvoiceSheet.getLastColumn()).sort({ column: 1, ascending: false });
}













/**
 * this funciton will remove the row from unpaid invocies if the category is changed from invoice to something else
 * this will also update the category in the consolidated log sheet for the respective row
 */
function unpaidInvoicesToConsolidatedLog_() {
  //UNPAID_LINK_COL
  //UNPAID_CATEGORY_COL
  const ActiveSpreadsheet = SpreadsheetApp.getActive();
  const ConsolidatedSheet = ActiveSpreadsheet.getSheetByName('Consolidated Log');
  const ConsolidatedLogLinks = ConsolidatedSheet.getRange('G1:G').getDisplayValues().map(r => r[0])

  const UnpaidInvoicesSheet = ActiveSpreadsheet.getSheetByName('Unpaid Invoices (Main)');
  let link_col = UnpaidInvoicesSheet.getRange('UNPAID_LINK_COL').getColumn();
  let category_col = UnpaidInvoicesSheet.getRange('UNPAID_CATEGORY_COL').getColumn();
  const UnpaidInvoicesLinks = UnpaidInvoicesSheet.getRange(3, link_col, UnpaidInvoicesSheet.getLastRow() - 2, 1).getDisplayValues().map(r => r[0])
  const UnpaidInvoicesCat = UnpaidInvoicesSheet.getRange(3, category_col, UnpaidInvoicesSheet.getLastRow() - 2, 1).getDisplayValues().map(r => r[0])


  for (var i = UnpaidInvoicesCat.length - 1; i >= 0; i--) {
    if (UnpaidInvoicesCat[i] != 'Invoice' && UnpaidInvoicesCat[i] != 'Manual Invoice') {
      let consolidatedIndex = ConsolidatedLogLinks.indexOf(UnpaidInvoicesLinks[i])
      if (consolidatedIndex > -1) {
        ConsolidatedSheet.getRange(consolidatedIndex + 1, 10).setValue(UnpaidInvoicesCat[i])
        UnpaidInvoicesSheet.deleteRow(i + 3)
      }
    }
  }

}






/**
 * this function brings data from manual invoices log sheet to unpaid invoices
 */
function updateDataInInvoiceLogSheetFromManual_() {

  try {
    manualPaidProcess_()
  } catch (err) { Logger.log(err) }



  console.log('checking for new data to be updated from Manual Sheet...');

  const ActiveSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const ManualSheet = ActiveSpreadsheet.getSheetByName('Manual_Invoices');
  let DataValues = ManualSheet.getRange("MANUAL_UNPAID").getDisplayValues()

  let ManualInvoiceIdCol = ManualSheet.getRange("MANUAL_SS_INVOICE_ID").getColumn();
  let ManualInvoiceIds = ManualSheet.getRange(1, ManualInvoiceIdCol, DataValues.length, 1).getDisplayValues()

  let ManualHeaders = ManualSheet.getRange(1, 1, 1, ManualSheet.getLastColumn()).getDisplayValues()[0];

  let manualHeadersObj = {};
  ManualHeaders.forEach((h, i) => {
    manualHeadersObj[h] = i
  })





  const UnpaidInvoicesSheet = ActiveSpreadsheet.getSheetByName('Unpaid Invoices (Main)');
  const UnpaidInvociesHeader = UnpaidInvoicesSheet.getRange(2, 1, 1, UnpaidInvoicesSheet.getLastColumn()).getDisplayValues()[0];

  let unpaidHeadersObj = {};
  UnpaidInvociesHeader.forEach((h, i) => {
    unpaidHeadersObj[h] = i
  })


  const InvoiceIdTrackerSheet = ActiveSpreadsheet.getSheetByName("Invoice_ID_Tracker_")
  let InvoiceID = InvoiceIdTrackerSheet.getRange("A2").getValue()

  let FilteredValues = []
  DataValues.forEach((row, index) => {

    if (row[0] === '0' && row[manualHeadersObj['Category']] === 'Manual Invoice' && (row[manualHeadersObj['SSD Invoice #']] == '' || row[manualHeadersObj['SSD Invoice #']] == null)) {

      InvoiceID++
      ManualInvoiceIds[index][0] = "SSD-" + InvoiceID
      row[manualHeadersObj['SSD Invoice #']] = "SSD-" + InvoiceID

      let rowData = new Array(UnpaidInvoicesSheet.getLastColumn()).fill("")

      for (let i = 0; i < UnpaidInvociesHeader.length; i++) {
        if (manualHeadersObj[UnpaidInvociesHeader[i]]) {
          rowData[unpaidHeadersObj[UnpaidInvociesHeader[i]]] = row[manualHeadersObj[UnpaidInvociesHeader[i]]]
        }
      }


      FilteredValues.push(rowData)

    }
  })


  if (FilteredValues.length === 0) {
    console.log('no new data found to be updated on Manual Sheet ...');
    return;
  }

  InvoiceIdTrackerSheet.getRange("A2").setValue(InvoiceID)


  let PayeeIdsSheet = ActiveSpreadsheet.getSheetByName("Payee_IDs");
  let PayeeIdsData = PayeeIdsSheet.getRange(1, 1, PayeeIdsSheet.getLastRow(), 3).getValues();

  //Bill Pay Plan
  //unpaidHeadersObj
  FilteredValues.forEach(row => {
    for (var i = 0; i < PayeeIdsData.length; i++) {
      if (row[unpaidHeadersObj["Payee Id"]] == PayeeIdsData[i][0]) {
        row[unpaidHeadersObj["Bill Pay Plan"]] = PayeeIdsData[i][2]
        break
      }
    }
  })



  ManualSheet.getRange(1, ManualInvoiceIdCol, ManualInvoiceIds.length, 1).setValues(ManualInvoiceIds)
  UnpaidInvoicesSheet.getRange(UnpaidInvoicesSheet.getLastRow() + 1, 1, FilteredValues.length, FilteredValues[0].length).setValues(FilteredValues);
  UnpaidInvoicesSheet.getRange(3, 1, UnpaidInvoicesSheet.getLastRow() - 2, UnpaidInvoicesSheet.getLastColumn()).sort({ column: unpaidHeadersObj['Date'] + 1, ascending: false });

  console.log(FilteredValues.length + ' new records were found and updated from Manual Sheet ...');

}











//MANUAL_PAID
function manualPaidProcess_() {
  const ActiveSpreadsheet = SpreadsheetApp.getActive();
  const ManualSheet = ActiveSpreadsheet.getSheetByName('Manual_Invoices');
  let DataValues = ManualSheet.getRange("MANUAL_UNPAID").getDisplayValues()

  let ManualPaid = []
  for (let i = DataValues.length - 1; i >= 1; i--) {
    if (DataValues[i][1] === '1') {
      ManualPaid.push(DataValues[i])
      ManualSheet.deleteRow(i + 1)
    }
  }

  if (ManualPaid.length === 0) {
    console.log('no new PAID data found to be updated on Manual Sheet ...');
    return;
  }


  ManualPaid.forEach(row => {
    row.shift();
    row.shift();
  })

  let paidRange = ManualSheet.getRange("MANUAL_PAID");
  let paidRow = paidRange.getRow()
  ManualSheet.insertRows(paidRow + 1, ManualPaid.length)
  ManualSheet.getRange(paidRow + 1, 3, ManualPaid.length, ManualPaid[0].length).setValues(ManualPaid)



}







function processAlreadyPaidManual() {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let manualSheet = ss.getSheetByName("Manual_Invoices");

  let manualSSID_COL = manualSheet.getRange("MANUAL_SS_INVOICE_ID").getColumn();
  let manualIds = manualSheet.getRange(2, manualSSID_COL, manualSheet.getLastRow() - 1, 1).getValues().map(row => row[0]);

  let unpaidInvoiceSheet = ss.getSheetByName("Unpaid Invoices (Main)");
  let unpaidData = unpaidInvoiceSheet.getRange(3, 1, unpaidInvoiceSheet.getLastRow() - 2, unpaidInvoiceSheet.getLastColumn()).getValues();
  let unpaidInvoicesHeaders = unpaidInvoiceSheet.getRange(2, 1, 1, unpaidInvoiceSheet.getLastColumn()).getDisplayValues()[0];

  let unpaidHeadersObj = {};
  unpaidInvoicesHeaders.forEach((h, i) => {
    unpaidHeadersObj[h.toString().trim()] = i
  })


  // let unpaidSSDID_Index = unpaidInvoicesHeaders.indexOf("SSD Invoice #");
  // let unpaidCat_Index = unpaidInvoicesHeaders.indexOf("Category");
  let unpaidSSDIDs = unpaidData.map(row => row[unpaidHeadersObj["SSD Invoice #"]]);
  let unpaidCat = unpaidData.map(row => row[unpaidHeadersObj["Category"]]);

  // Logger.log(unpaidSSDID_Index)
  // Logger.log(unpaidHeadersObj["SSD Invoice #"])


  let paidPendingSheet = ss.getSheetByName("Paid - Pending")
  let paidPendingData = paidPendingSheet.getRange(3, 1, paidPendingSheet.getLastRow() - 2, paidPendingSheet.getLastColumn()).getValues()
  let paidPendingHeaders = paidPendingSheet.getRange(2, 1, 1, paidPendingSheet.getLastColumn()).getDisplayValues()[0]

  let pendingHeadersObj = {};
  paidPendingHeaders.forEach((h, i) => {
    pendingHeadersObj[h.toString().trim()] = i
  })

  let pendingSSDIDs = paidPendingData.map(row => row[pendingHeadersObj["SSD Invoice #"]]);
  let pendingCat = paidPendingData.map(row => row[pendingHeadersObj["Category"]]);




  let paidSheet = ss.getSheetByName("Paid Invoices")
  let paidData = paidSheet.getRange(3, 1, paidSheet.getLastRow() - 2, paidSheet.getLastColumn()).getValues()
  let paidHeaders = paidSheet.getRange(2, 1, 1, paidSheet.getLastColumn()).getDisplayValues()[0]

  let paidHeadersObj = {};
  paidHeaders.forEach((h, i) => {
    paidHeadersObj[h.toString().trim()] = i
  })

  let paidSSDIDs = paidData.map(row => row[paidHeadersObj["SSD Invoice #"]]);
  let paidCat = paidData.map(row => row[paidHeadersObj["Category"]]);






  unpaidSSDIDs.forEach((id, index) => {
    let indexInManual = manualIds.indexOf(id)
    if (indexInManual > -1 && unpaidCat[index] == "Invoice") {
      //search here in all the sheet for the manual invoice


      //here searching in paid pending
      let indexInPending = pendingSSDIDs.indexOf(id)
      if (indexInPending > -1) {
        if (pendingCat[indexInPending] == "Manual Invoice") {

          let unpaidRow = unpaidData[index]

          for (var key in unpaidHeadersObj) {
            if (pendingHeadersObj.hasOwnProperty(key)) {
              if (unpaidRow[unpaidHeadersObj[key]] == "" || unpaidRow[unpaidHeadersObj[key]] == null) {
                unpaidRow[unpaidHeadersObj[key]] = paidPendingData[indexInPending][pendingHeadersObj[key]]
              }

              if (key == "Link") {
                paidPendingData[indexInPending][pendingHeadersObj[key]] = unpaidRow[unpaidHeadersObj[key]]
                paidPendingSheet.getRange(indexInPending + 3, pendingHeadersObj[key] + 1).setValue(unpaidRow[unpaidHeadersObj[key]])
              }
            }

          }

          unpaidInvoiceSheet.getRange(index + 3, 1, 1, unpaidRow.length).setValues([unpaidRow])

        }
      }


      //here searching in paid sheet
      let indexInPaid = paidSSDIDs.indexOf(id)
      if (indexInPaid > -1) {
        if (paidCat[indexInPaid] == "Manual Invoice") {

          let unpaidRow = unpaidData[index]

          for (var key in unpaidHeadersObj) {
            if (pendingHeadersObj.hasOwnProperty(key)) {
              if (unpaidRow[unpaidHeadersObj[key]] == "" || unpaidRow[unpaidHeadersObj[key]] == null) {
                unpaidRow[unpaidHeadersObj[key]] = paidData[indexInPaid][paidHeadersObj[key]]
              }

              if (key == "Link") {
                paidData[indexInPaid][paidHeadersObj[key]] = unpaidRow[unpaidHeadersObj[key]]
                paidSheet.getRange(indexInPaid + 3, paidHeadersObj[key] + 1).setValue(unpaidRow[unpaidHeadersObj[key]])
              }
            }

          }

          unpaidInvoiceSheet.getRange(index + 3, 1, 1, unpaidRow.length).setValues([unpaidRow])

        }
      }


    }
  })




}




function fetchSkinSubstituteReimbursementsStatus_() {
  let ss = SpreadsheetApp.getActiveSpreadsheet();


  let skinSS = SpreadsheetApp.openById("1xVJWRqdgRRLMSjXptMt97LuTC_dluWj1yfsN8ynCrf4");
  let skinInvoiceSheet = skinSS.getSheetByName("SSD Invoices Dash");

  let skinInvoicesAll = skinInvoiceSheet.getRange(1, 1, skinInvoiceSheet.getLastRow(), skinInvoiceSheet.getLastColumn()).getValues();
  let skinHeaders = skinInvoicesAll.splice(0, 1)[0];

  let skinInvoiceIdIndex = skinHeaders.indexOf("SSD Invoice #")
  let skinInvoiceIds = [];
  if (skinInvoiceIdIndex > -1) {
    skinInvoiceIds = skinInvoicesAll.map(row => row[skinInvoiceIdIndex])
  }



  fetchRemiStatus_(ss, skinInvoicesAll, skinInvoiceIds, "Unpaid Invoices (Main)")

  fetchRemiStatus_(ss, skinInvoicesAll, skinInvoiceIds, "Paid - Pending")


}





function fetchRemiStatus_(ss, skinInvoicesAll, skinInvoiceIds, invoiceSheetName) {
  let sheet = ss.getSheetByName(invoiceSheetName);
  let allData = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues()
  let unpaidHeaders = allData.splice(0, 1)[0];

  let ssdIdsIndex = unpaidHeaders.indexOf("SSD Invoice #");
  let allIds = [];
  if (ssdIdsIndex > -1) {
    allIds = allData.map(row => row[ssdIdsIndex])
  }

  let unpaidReimIndex = unpaidHeaders.indexOf("Reimbursed?");
  let Reimbursed = [];
  if (unpaidReimIndex > -1) {
    Reimbursed = allData.map(row => [row[unpaidReimIndex]])
  }


  allIds.forEach((id, index) => {
    let idIndexInSkin = skinInvoiceIds.indexOf(id)

    if (idIndexInSkin > -1) {
      Reimbursed[index][0] = skinInvoicesAll[idIndexInSkin][3]
    }
  })

  sheet.getRange(3, unpaidReimIndex + 1, Reimbursed.length, 1).setValues(Reimbursed)
}














//NEEDS_REVIEW_COMPLETE
//NEEDS_REVIEW_STATUS


const INVOICES_SS_ID = "1litcuGtcoQcsiVGA56_Lc_oDhCOBT7sIEyqt0Gerigw"



function fetchAndProcessNeedsReview() {



  console.log('checking for new data to be updated in Needs Review...');

  const InvoicesSS = SpreadsheetApp.openById(INVOICES_SS_ID);

  const SS = SpreadsheetApp.getActiveSpreadsheet()

  const FollowUpSheet = getSheetByID_(SS, '0');


  //let review_status_col = FollowUpSheet.getRange("NEEDS_REVIEW_STATUS").getColumn();
  ///let followUpCompleteRange = FollowUpSheet.getRange("NEEDS_REVIEW_COMPLETE");
  //let followUpCompleteRow = followUpCompleteRange.getRow()

  //Logger.log(followUpCompleteRow)

  //let followUpData = FollowUpSheet.getRange(1, 1, followUpCompleteRow, FollowUpSheet.getLastColumn()).getValues()

  // let completedFollowUpData = [];
  // for (i = followUpData.length - 1; i > 0; i--) {
  //   if (followUpData[i][review_status_col - 1] == "Complete") {
  //     completedFollowUpData.push(followUpData[i])
  //     FollowUpSheet.deleteRows(i + 1, 1)
  //   }
  // }

  // if (completedFollowUpData.length > 0) {
  //   followUpCompleteRange = FollowUpSheet.getRange("NEEDS_REVIEW_COMPLETE");
  //   followUpCompleteRow = followUpCompleteRange.getRow()

  //   FollowUpSheet.insertRows(followUpCompleteRow + 1, completedFollowUpData.length)
  //   FollowUpSheet.getRange(followUpCompleteRow + 1, 1, completedFollowUpData.length, completedFollowUpData[0].length).setValues(completedFollowUpData)
  // }





  let FollowUpHeaders = FollowUpSheet.getRange(2, 1, 1, FollowUpSheet.getLastColumn()).getDisplayValues()[0]
  let followUpHeadersObj = {};
  FollowUpHeaders.forEach((h, i) => {
    followUpHeadersObj[h] = i
  })


  let FollowUpSheetData = FollowUpSheet.getRange(2, followUpHeadersObj['Link'] + 1, FollowUpSheet.getLastRow() - 1, 1).getDisplayValues().filter(row => row[0] != '' && row[0] != null).map(r => r[0])



  const ConsolidatedSheet = InvoicesSS.getSheetByName('Consolidated Log');
  let DataHeaders = ConsolidatedSheet.getRange(2, 1, 1, ConsolidatedSheet.getLastColumn()).getDisplayValues()[0]
  let dataHeadersObj = {};
  DataHeaders.forEach((h, i) => {
    dataHeadersObj[h] = i
  })

  let DataValues = ConsolidatedSheet.getRange(3, 1, ConsolidatedSheet.getLastRow() - 2, ConsolidatedSheet.getLastColumn()).getDisplayValues()
    .filter(row => (FollowUpSheetData.indexOf(row[dataHeadersObj['Link']]) == -1 && row[dataHeadersObj['Needs Review']] != '' && row[dataHeadersObj['Needs Review']] != null));


  if (DataValues.length === 0) {
    FollowUpSheet.getRange(3, 1, FollowUpSheet.getLastRow() - 2, FollowUpSheet.getLastColumn()).sort([{ column: 1, ascending: true }, { column: 4, ascending: false }]);
    console.log('no new data found to be updated ...');
    return;
  }
  console.log('mapping the new data to be updated ...');


  let FormatedData = []
  DataValues.forEach(row => {
    let rowData = new Array(FollowUpHeaders.length).fill("")

    for (let i = 0; i < FollowUpHeaders.length; i++) {
      if (dataHeadersObj[FollowUpHeaders[i]]) {
        rowData[followUpHeadersObj[FollowUpHeaders[i]]] = row[dataHeadersObj[FollowUpHeaders[i]]]
      }
    }

    FormatedData.push(rowData)
  })


  //FollowUpSheet.insertRows(2, FormatedData.length)

  //FollowUpSheet.getRange(2, 1, FormatedData.length, FormatedData[0].length).setValues(FormatedData)

  FollowUpSheet.getRange(FollowUpSheet.getLastRow() + 1, 1, FormatedData.length, FormatedData[0].length).setValues(FormatedData)

  //let completeFirstRow = FollowUpSheet.getRange("NEEDS_REVIEW_COMPLETE").getRow()


  FollowUpSheet.getRange(3, 1, FollowUpSheet.getLastRow() - 2, FollowUpSheet.getLastColumn()).sort([{ column: 1, ascending: true }, { column: 4, ascending: false }]);



  console.log(FormatedData.length + ' new records were found and updated ...');


}












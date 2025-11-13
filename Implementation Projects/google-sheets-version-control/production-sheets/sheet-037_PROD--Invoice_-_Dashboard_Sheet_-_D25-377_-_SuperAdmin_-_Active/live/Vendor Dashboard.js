
const VENDOR_DASHBOARD_SS_ID = "15ny6U3jPH-OhNjpjx0-gUNG2IRi_hoJj4RribicabpM"


function vendorDashboardProcess() {
  return
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const unpaidInvoicesSheet = getSheetByID_(ss, '776743796');

  const allUnpaid = unpaidInvoicesSheet.getRange(2, 1, unpaidInvoicesSheet.getLastRow() - 1, unpaidInvoicesSheet.getLastColumn()).getDisplayValues();
  const unpaidHeaders = allUnpaid.splice(0, 1)[0];


  const COL = {
    payeeID: unpaidHeaders.indexOf('Payee ID'),
    link: unpaidHeaders.indexOf('Link'),
  }



  const filterUnpaid = allUnpaid.filter(r => r[COL.payeeID] != "" && r[COL.link] != "")



  const vendorSS = SpreadsheetApp.openById(VENDOR_DASHBOARD_SS_ID);
  const vDocDumpSheet = getSheetByID_(vendorSS, '961600894')

  const vDocDumpData = vDocDumpSheet.getRange(2, 1, vDocDumpSheet.getLastRow() - 1, vDocDumpSheet.getLastColumn()).getDisplayValues();
  const vDocHeaders = vDocDumpData.splice(0, 1)[0];
  const VCOL = {
    payeeID: vDocHeaders.indexOf('Payee ID'),
    link: vDocHeaders.indexOf('File URL'),
  }


  let allExFiles = vDocDumpData.map(r => r[VCOL.link]);

  let newData = []

  filterUnpaid.forEach(row => {
    let indexOfUrl = allExFiles.indexOf(row[COL.link])

    if (indexOfUrl == -1) {
      try {
        let id = row[COL.link].split("/d/")[1].split("/")[0];
        let file = DriveApp.getFileById(id);
        let fileName = file.getName();
        let fileParentFolder = file.getParents().next();
        let fileDate = file.getDateCreated();

        let newRow = [fileDate, "Consolidated Log", fileName, row[COL.payeeID], "", "", "", "", row[COL.link], fileParentFolder.getName(), fileParentFolder.getUrl()]

        newData.push(newRow)
      } catch (err) { }
    }
  })


  if (newData.length > 0) {
    vDocDumpSheet.insertRows(3, newData.length);
    vDocDumpSheet.getRange(3, 3, newData.length, newData[0].length).setValues(newData)
  }





}










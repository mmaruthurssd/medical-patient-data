//2134800050



const TREATMENT_LOG_SHEET = "Treatment Log"

function onEdit(e) {


  onEditSortMicro(e)

  const ss = e.source;
  const activeSheet = ss.getActiveSheet();


  const range = e.range;
  const row = range.getRow();
  const col = range.getColumn();

  const value = e.value;

  let sheetID = activeSheet.getSheetId()

  let allowedSheets = ["2134800050", "1394237384", "1028240898", "1234779610", "423461385", "1332163701", "1348380550", "490458499"]

  if (allowedSheets.indexOf(sheetID.toString()) > -1 && row > 4 && col == 15 && (value == true || value == "TRUE")) {

    const rowData = activeSheet.getRange(row, 1, 1, activeSheet.getLastColumn()).getDisplayValues()[0]

    activeSheet.getRange(row, col).clearContent()

    if (rowData[0] != "") return

    const destSheet = ss.getSheetByName(TREATMENT_LOG_SHEET);

    destSheet.insertRowBefore(2)

    destSheet.getRange(2, 1, 1, 6).setValues([[rowData[1].trim() + rowData[6].trim() + rowData[5].trim(), rowData[2], rowData[3], rowData[4], rowData[5].trim(), rowData[6]]])

  }


}



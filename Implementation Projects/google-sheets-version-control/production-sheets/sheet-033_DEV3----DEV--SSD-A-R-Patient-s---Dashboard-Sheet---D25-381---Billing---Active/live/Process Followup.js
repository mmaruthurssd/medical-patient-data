
const FOLLOWUP_LOG_SHEET = "Follow up Log"


function processFollowup() {

  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getActiveSheet();

  let logNewData = []
  let user = Session.getActiveUser();
  let allData = sheet.getRange(4, 1, sheet.getLastRow() - 3, sheet.getLastColumn()).getValues();
  let allMrns = allData.map(r => r[4].toString());



  const SelectedNotSpokenAging = sheet.getRange("G1").getDisplayValue()

  allData.forEach((row, index) => {
    if (row[15] != "" && (row[16] != "" || (row[16] == "" && row[19] != "Spoke to patient"))) {

      //Logger.log(row)

      const DataRow = [row[4], user, new Date(), row[13], row[15], row[16], row[17], row[18],
      row[19], row[20], row[21], row[3], row[1], row[2], row[9]]

      // update the last spoke on field with today's date
      if (row[19] === "Spoke to patient") {
        DataRow[3] = new Date().toLocaleDateString();
      }

      logNewData.push(DataRow)
      sheet.getRange(index + 4, 16, 1, 7).clearContent()


      if (SelectedNotSpokenAging != "ALL" && SelectedNotSpokenAging != "") {
        let indexOfMrn = allMrns.indexOf(row[4].toString());
        if (indexOfMrn > -1) {
          sheet.deleteRows(indexOfMrn + 4, 1)
          allMrns.splice(indexOfMrn, 0)
        }
      }

    }
  })

  if (logNewData.length > 0) {

    let logSheet = ss.getSheetByName(FOLLOWUP_LOG_SHEET)
    logSheet.insertRows(3, logNewData.length);
    logSheet.getRange(3, 1, logNewData.length, logNewData[0].length).setValues(logNewData)

  }

}


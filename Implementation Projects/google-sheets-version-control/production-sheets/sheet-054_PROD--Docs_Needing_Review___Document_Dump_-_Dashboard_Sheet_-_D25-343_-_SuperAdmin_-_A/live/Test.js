







function testNaming() {

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const allIdsSheet = ss.getSheetByName(ALL_IDS_SHEET);
  const allIds = allIdsSheet.getRange(2, 1, allIdsSheet.getLastRow() - 1, allIdsSheet.getLastColumn()).getDisplayValues();
  let formatedAllIds = []
  ///let formatedAllIdsN = {}
  for (var i = 0; i < allIds[0].length; i = i + 2) {
    //Logger.log(i)
    formatedAllIds.push(allIds.map(id => [id[i].toString().toUpperCase().trim(), id[i + 1]]).filter(v => v[0] != ""))
  }

  const Subject="ds"
  const Body="D25-297#"

  let found = false
  for (var i = 0; i < formatedAllIds.length; i++) {
    for (var j = 0; j < formatedAllIds[i].length; j++) {
      //Logger.log(formatedAllIds[i][j][0])
      if (Subject.includes(formatedAllIds[i][j][0] + "#") || Body.includes(formatedAllIds[i][j][0] + "#")) {
        //DocsLogSheet.getRange(DocsLogSheet.getLastRow(), i + 8).setValue(formatedAllIds[i][j][1])
        Logger.log(formatedAllIds[i][j][1])
        found = true
        break
      }
    }
    if (found) {
      break
    }
  }

}




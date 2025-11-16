function updateUnitPriceList() {

  let SS = SpreadsheetApp.getActiveSpreadsheet();
  let UPQSheet = SS.getSheetByName("UP_Q");

  let upqData = UPQSheet.getRange(1, 1, UPQSheet.getLastRow(), 4).getValues()


  let unitPirceSheet = SS.getSheetByName("UNIT PRICES");
  let unitPirceData = unitPirceSheet.getRange(1, 1, unitPirceSheet.getLastRow(), unitPirceSheet.getLastColumn()).getValues()
  let unitPriceIDs = unitPirceData.map(r => r[0] + r[1] + r[2] + r[5])

  let newUnitPrice = []

  for (var i = 0; i < upqData.length; i++) {
    if (upqData[i][3] != "") {
      let tempId = upqData[i][0] + upqData[i][1] + upqData[i][2] + upqData[i][3];

      let indexofId = unitPriceIDs.indexOf(tempId);

      if (indexofId == -1) {
        newUnitPrice.push([upqData[i][0], upqData[i][1], upqData[i][2], "", "", upqData[i][3]])
      }

    }
  }



  if (newUnitPrice.length > 0) {
    unitPirceSheet.getRange(unitPirceSheet.getLastRow() + 1, 1, newUnitPrice.length, newUnitPrice[0].length).setValues(newUnitPrice)
  }
}

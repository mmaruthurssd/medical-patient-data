




function updateUniqueItems() {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let orderHistorySheet = ss.getSheetByName("Item Order History");

  let allOrders = orderHistorySheet.getRange(1, 4, orderHistorySheet.getLastRow(), 1).getDisplayValues();

  let uniqueItemsSheet = ss.getSheetByName('Unique Items');
  let uniqueItemsIds = uniqueItemsSheet.getRange(1, 4, uniqueItemsSheet.getLastRow(), 1).getDisplayValues().map(r => r[0].toString())
  //let uniqueIds = uniqueItems.map(r => r[1].toString())


  let newIds = [];

  allOrders.forEach(row => {

    let indexOfId = uniqueItemsIds.indexOf(row[0].toString())
    if (indexOfId == -1) {
      newIds.push([row[0]])

      uniqueItemsIds.push(row[0].toString())
    }

  })

  if (newIds.length > 0) {
    let lastRowRow = uniqueItemsSheet.getLastRow()
    uniqueItemsSheet.getRange(lastRowRow + 1, 4, newIds.length, 1).setValues(newIds);

    const sourceRange = uniqueItemsSheet.getRange(lastRowRow, 7, 1, 3);
    const destinationRange = uniqueItemsSheet.getRange(lastRowRow + 1, 7, newIds.length, 3);
    sourceRange.copyTo(destinationRange, SpreadsheetApp.CopyPasteType.PASTE_FORMULA, false);


    uniqueItemsSheet.getRange(2, 1, uniqueItemsSheet.getLastRow() - 1, uniqueItemsSheet.getLastColumn()).sort({ column: 3, ascending: true })

  }


  sendUniqueDataToLocations(ss, uniqueItemsSheet)
}





function sendUniqueDataToLocations(ss, uniqueItemsSheet) {

  let uniqueData = uniqueItemsSheet.getRange(1, 3, uniqueItemsSheet.getLastRow(), 16).getDisplayValues();
  //let uniqueIds = uniqueData.map(r => r[1].toString());

  let trussvilleSheet = ss.getSheetByName("Trussville")
  let trussvilleData = trussvilleSheet.getRange(1, 5, trussvilleSheet.getLastRow(), 16).getDisplayValues()
  let trussvilleIds = trussvilleData.map(r => r[1].toString());

  let gadsenSheet = ss.getSheetByName("Gadsden")
  let gadsenData = gadsenSheet.getRange(1, 5, gadsenSheet.getLastRow(), 16).getDisplayValues()
  let gadsenIds = gadsenData.map(r => r[1].toString());

  let oxfordSheet = ss.getSheetByName("Oxford")
  let oxfordData = oxfordSheet.getRange(1, 5, oxfordSheet.getLastRow(), 16).getDisplayValues()
  let oxfordIds = oxfordData.map(r => r[1].toString());


  let pellSheet = ss.getSheetByName("Pell City")
  let pellData = pellSheet.getRange(1, 5, pellSheet.getLastRow(), 16).getDisplayValues()
  let pellIds = pellData.map(r => r[1].toString());

  uniqueData.forEach(row => {
    let indexOfTrusvilleId = trussvilleIds.indexOf(row[1]);
    let indexOfgadsenId = gadsenIds.indexOf(row[1]);
    let indexOfOxfordId = oxfordIds.indexOf(row[1]);
    let indexOfPellId = pellIds.indexOf(row[1]);


    if (indexOfTrusvilleId == -1) {
      trussvilleData.push(row)
    } else {
      trussvilleData[indexOfTrusvilleId] = row
    }


    if (indexOfgadsenId == -1) {
      gadsenData.push(row)
    } else {
      gadsenData[indexOfgadsenId] = row
    }


    if (indexOfOxfordId == -1) {
      oxfordData.push(row)
    } else {
      oxfordData[indexOfOxfordId] = row
    }


    if (indexOfPellId == -1) {
      pellData.push(row)
    } else {
      pellData[indexOfPellId] = row
    }


  })



  if (trussvilleData.length > 1) {
    trussvilleSheet.getRange(1, 5, trussvilleData.length, trussvilleData[0].length).setValues(trussvilleData)
    trussvilleSheet.getRange(2, 1, trussvilleSheet.getLastRow() - 1, trussvilleSheet.getLastColumn()).sort([{ column: 1, ascending: true }, { column: 5, ascending: true }])
  }

  if (gadsenData.length > 0) {
    gadsenSheet.getRange(1, 5, gadsenData.length, gadsenData[0].length).setValues(gadsenData)
    gadsenSheet.getRange(2, 1, gadsenSheet.getLastRow() - 1, gadsenSheet.getLastColumn()).sort([{ column: 1, ascending: true }, { column: 5, ascending: true }])
  }

  if (oxfordData.length > 0) {
    oxfordSheet.getRange(1, 5, oxfordData.length, oxfordData[0].length).setValues(oxfordData)
    oxfordSheet.getRange(2, 1, oxfordSheet.getLastRow() - 1, oxfordSheet.getLastColumn()).sort([{ column: 1, ascending: true }, { column: 5, ascending: true }])
  }

  if (pellData.length > 0) {
    pellSheet.getRange(1, 5, pellData.length, pellData[0].length).setValues(pellData)
    pellSheet.getRange(2, 1, pellSheet.getLastRow() - 1, pellSheet.getLastColumn()).sort([{ column: 1, ascending: true }, { column: 5, ascending: true }])
  }

}














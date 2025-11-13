



const ORDER_DASH_SS_ID = "1HMeabGRigVSXEV7uJdnG28a5McerH2ulEds_7Bk1NOE"




const SHELF_STOCK_COUNT_LOCATION_SHEET = "Shelf Stock Counts"
const BULK_STOCK_COUNT_LOCATION_SHEET = "Bulk Stock Counts"




function onOpen() {
  let ui = SpreadsheetApp.getUi();
  let menu = ui.createMenu("Custom");
  menu.addItem("Process Shelf Stock Counts Sorted", "shelfStockCountsSortedProcess").addToUi()
  menu.addItem("Update Unique Item", "updateUniqueItems").addToUi()
  menu.addItem("Update Stock Counts x Location", "sendUniqueDataToAllLocations").addToUi()
}








function updateUniqueItems() {

  //return


  let orderDashboardSS = SpreadsheetApp.openById(ORDER_DASH_SS_ID)
  let orderHistorySheet = orderDashboardSS.getSheetByName("Item Order History");
  let allOrders = orderHistorySheet.getRange(1, 4, orderHistorySheet.getLastRow(), 1).getDisplayValues();
  let allCategory = orderHistorySheet.getRange(1, 9, orderHistorySheet.getLastRow(), 1).getDisplayValues();



  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let uniqueItemsSheet = ss.getSheetByName('Unique Items');
  let uniqueItemsIds = uniqueItemsSheet.getRange(1, 4, uniqueItemsSheet.getLastRow(), 1).getDisplayValues().map(r => r[0].toString())
  //let uniqueIds = uniqueItems.map(r => r[1].toString())




  let IdTrackerSheet = ss.getSheetByName('ID_Tracker')
  let lastID = IdTrackerSheet.getRange("A2").getValue()



  let newIds = [];
  let newItems=[]
  let newCat = [];

  allOrders.forEach((row, i) => {

    let indexOfId = uniqueItemsIds.indexOf(row[0].toString())
    if (indexOfId == -1) {
      lastID = Number(lastID) + 1

      newIds.push(["ITM-" + (String(lastID).padStart(6, '0'))])
      newItems.push([row[0]])
      newCat.push([allCategory[i][0]])

      uniqueItemsIds.push(row[0].toString())
    }

  })

  if (newIds.length > 0) {

    IdTrackerSheet.getRange("A2").setValue(lastID)

    let lastRowRow = uniqueItemsSheet.getLastRow()
    uniqueItemsSheet.getRange(lastRowRow + 1, 4, newIds.length, 1).setValues(newItems);
    uniqueItemsSheet.getRange(lastRowRow + 1, 19, newIds.length, 1).setValues(newIds);
    uniqueItemsSheet.getRange(lastRowRow + 1, 14, newCat.length, 1).setValues(newCat);

    const sourceRange = uniqueItemsSheet.getRange(lastRowRow, 11, 1, 3);
    const destinationRange = uniqueItemsSheet.getRange(lastRowRow + 1, 11, newIds.length, 3);
    sourceRange.copyTo(destinationRange, SpreadsheetApp.CopyPasteType.PASTE_FORMULA, false);

    uniqueItemsSheet.getRange(3, 1, uniqueItemsSheet.getLastRow() - 2, uniqueItemsSheet.getLastColumn()).sort({ column: 3, ascending: true })

  }


}




function sendUniqueDataToAllLocations() {
  sendUniqueDataSpecificLocationsNew(SHELF_STOCK_COUNT_LOCATION_SHEET)
  //sendUniqueDataSpecificLocationsNew(BULK_STOCK_COUNT_LOCATION_SHEET)
}









function sendUniqueDataSpecificLocationsNew(SheetName) {

  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let uniqueItemsSheet = ss.getSheetByName("Unique Items")
  let uniqueData = uniqueItemsSheet.getRange(2, 3, uniqueItemsSheet.getLastRow() - 1, 17).getDisplayValues();

  let uniqueHeaders = uniqueData.splice(0, 1)[0];
  let uniqueHeadersObj = {};
  uniqueHeaders.forEach((h, i) => {
    uniqueHeadersObj[h] = i
  })



  let allLocationSheet = ss.getSheetByName(SheetName);
  let allLocationData = allLocationSheet.getRange(2, 5, allLocationSheet.getLastRow() - 1, 4).getDisplayValues();
  let allLocationHeaders = allLocationData.splice(0, 1)[0];
  let allLocationHeadersObj = {};
  allLocationHeaders.forEach((h, i) => {
    allLocationHeadersObj[h] = i
  })
  let existingIds = allLocationData.map(r => r[allLocationHeadersObj['Item #']])






  for (i = 0; i < uniqueData.length; i++) {

    if (uniqueData[uniqueHeadersObj['Item #']].toString().trim() == "") continue

    let idIndex = existingIds.indexOf(uniqueData[i][uniqueHeadersObj['Item #']])

    if (idIndex == -1) {

      let newRow = new Array(allLocationHeaders.length).fill("");
      for (var key in allLocationHeadersObj) {
        if (uniqueHeadersObj[key] || uniqueHeadersObj[key] == 0) {
          newRow[allLocationHeadersObj[key]] = uniqueData[i][uniqueHeadersObj[key]]
        }
      }

      existingIds.push(uniqueData[uniqueHeadersObj['Item #']])
      allLocationData.push(newRow)



    } else {

      for (var key in allLocationHeadersObj) {
        if (uniqueHeadersObj[key] || uniqueHeadersObj[key] == 0) {
          allLocationData[idIndex][allLocationHeadersObj[key]] = uniqueData[i][uniqueHeadersObj[key]]
        }
      }

    }



  }

  SpreadsheetApp.flush()

  //Logger.log(allLocationData[allLocationData.length - 2])
  //return
  allLocationSheet.getRange(3, 5, allLocationData.length, allLocationData[0].length).setValues(allLocationData)

}






function sendUniqueDataSpecificLocations(SheetName) {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let uniqueItemsSheet = ss.getSheetByName("Unique Items")
  let uniqueData = uniqueItemsSheet.getRange(2, 3, uniqueItemsSheet.getLastRow() - 1, 17).getDisplayValues();

  let uniqueHeaders = uniqueData.splice(0, 1)[0];
  let uniqueHeadersObj = {};
  uniqueHeaders.forEach((h, i) => {
    uniqueHeadersObj[h] = i
  })



  let allLocationSheet = ss.getSheetByName(SheetName);
  let allLocationData = allLocationSheet.getRange(2, 5, allLocationSheet.getLastRow() - 1, 4).getDisplayValues();
  let allLocationHeaders = allLocationData.splice(0, 1)[0];
  let allLocationHeadersObj = {};
  allLocationHeaders.forEach((h, i) => {
    allLocationHeadersObj[h] = i
  })
  let existingIds = allLocationData.map(r => r[allLocationHeadersObj['Item #']])




  // let bulkLocationSheet = ss.getSheetByName(BULK_STOCK_COUNT_LOCATION_SHEET);
  // let bulkLocationData = bulkLocationSheet.getRange(1, 5, bulkLocationSheet.getLastRow(), 4).getDisplayValues();
  // let bulkLocationHeaders = bulkLocationData.splice(0, 1)[0];
  // let bulkLocationHeadersObj = {};
  // bulkLocationHeaders.forEach((h, i) => {
  //   bulkLocationHeadersObj[h] = i
  // })
  // let existingBulkIds = bulkLocationData.map(r => r[bulkLocationHeadersObj['Item #']])




  for (i = 0; i < uniqueData.length; i++) {

    if (uniqueData[uniqueHeadersObj['Item #']].toString().trim() == "") continue

    let idIndex = existingIds.indexOf(uniqueData[i][uniqueHeadersObj['Item #']])

    if (idIndex == -1) {

      let newRow = new Array(allLocationHeaders.length).fill("");
      for (var key in allLocationHeadersObj) {
        if (uniqueHeadersObj[key] || uniqueHeadersObj[key] == 0) {
          newRow[allLocationHeadersObj[key]] = uniqueData[i][uniqueHeadersObj[key]]
        }
      }

      existingIds.push(uniqueData[uniqueHeadersObj['Item #']])
      allLocationData.push(newRow)

      //Logger.log(newRow)

    } else {

      for (var key in allLocationHeadersObj) {
        if (uniqueHeadersObj[key] || uniqueHeadersObj[key] == 0) {
          allLocationData[idIndex][allLocationHeadersObj[key]] = uniqueData[i][uniqueHeadersObj[key]]
        }
      }

    }



  }

  SpreadsheetApp.flush()


  //Logger.log(allLocationData[allLocationData.length - 2])
  //return
  allLocationSheet.getRange(3, 5, allLocationData.length, allLocationData[0].length).setValues(allLocationData)




}





//Not using this.
function sendUniqueDataToLocations(ss, uniqueItemsSheet) {

  let uniqueData = uniqueItemsSheet.getRange(1, 3, uniqueItemsSheet.getLastRow(), 17).getDisplayValues();
  //let uniqueIds = uniqueData.map(r => r[1].toString());

  let trussvilleSheet = ss.getSheetByName("Trussville")
  let trussvilleData = trussvilleSheet.getRange(1, 5, trussvilleSheet.getLastRow(), 19).getDisplayValues()
  let trussvilleIds = trussvilleData.map(r => r[2].toString());

  let gadsenSheet = ss.getSheetByName("Gadsden")
  let gadsenData = gadsenSheet.getRange(1, 5, gadsenSheet.getLastRow(), 19).getDisplayValues()
  let gadsenIds = gadsenData.map(r => r[2].toString());

  let oxfordSheet = ss.getSheetByName("Oxford")
  let oxfordData = oxfordSheet.getRange(1, 5, oxfordSheet.getLastRow(), 19).getDisplayValues()
  let oxfordIds = oxfordData.map(r => r[2].toString());


  let pellSheet = ss.getSheetByName("Pell City")
  let pellData = pellSheet.getRange(1, 5, pellSheet.getLastRow(), 19).getDisplayValues()
  let pellIds = pellData.map(r => r[2].toString());

  uniqueData.forEach(row => {
    let indexOfTrusvilleId = trussvilleIds.indexOf(row[2]);
    let indexOfgadsenId = gadsenIds.indexOf(row[2]);
    let indexOfOxfordId = oxfordIds.indexOf(row[2]);
    let indexOfPellId = pellIds.indexOf(row[2]);


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



























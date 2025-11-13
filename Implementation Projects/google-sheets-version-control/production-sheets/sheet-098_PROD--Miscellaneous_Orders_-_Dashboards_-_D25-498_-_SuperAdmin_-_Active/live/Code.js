


const NEW_ITEM_ORDERED_SHEET = "New Items Ordered"



const MISC_ITEM_ORDER_HIST_SHEET = "Miscellaneous Item Order History"



const ID_TRACKER_SHEET = "Id_Tracker"





function processDailyNewItemsOrdered() {

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const newOrderSheet = ss.getSheetByName(NEW_ITEM_ORDERED_SHEET);

  let allNewOrders = newOrderSheet.getRange(1, 1, newOrderSheet.getLastRow(), newOrderSheet.getLastColumn()).getValues()
  let newOrderHeaders = allNewOrders.splice(0, 1)[0];
  let newOrderHeadersObj = {};
  newOrderHeaders.forEach((h, i) => {
    newOrderHeadersObj[h] = i
  })


  if (allNewOrders.length == 0) return


  const miscItemSheet = ss.getSheetByName(MISC_ITEM_ORDER_HIST_SHEET);
  let miscItemHeaders = miscItemSheet.getRange(1, 1, 1, miscItemSheet.getLastColumn()).getValues()[0];
  let miscItemHeadersObj = {};
  miscItemHeaders.forEach((h, i) => {
    miscItemHeadersObj[h] = i
  })


  const idTrackerSheet = ss.getSheetByName(ID_TRACKER_SHEET);
  let lastId = idTrackerSheet.getRange("A2").getValue();



  let newMiscData = [];
  allNewOrders.forEach(row => {
    lastId++
    let newRowData = new Array(miscItemHeaders.length).fill("");
    for (let key in miscItemHeadersObj) {
      if (newOrderHeadersObj[key] || newOrderHeadersObj[key] == 0) {
        newRowData[miscItemHeadersObj[key]] = row[newOrderHeadersObj[key]]
      }
    }


    newRowData[miscItemHeadersObj['Processing ID#']] = "MISC-" + lastId

    newMiscData.push(newRowData)


  })


  if (newMiscData.length > 0) {
    idTrackerSheet.getRange("A2").setValue(lastId)
    miscItemSheet.getRange(miscItemSheet.getLastRow() + 1, 1, newMiscData.length, newMiscData[0].length).setValues(newMiscData)
    newOrderSheet.getRange("A2:L").clearContent()
  }






}





















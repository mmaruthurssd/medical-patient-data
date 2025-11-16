

function updateItemOrderHisoty() {

  try {
    getHenryScheinItemsPurchasedWithInvoices_();
  }
  catch (err) {
    console.error(err);
  }

  try {
    getAmazonItemsOrderData_();
  }
  catch (err) {
    console.error(err);
  }

  try {
    getMckessonItemsOrderData_();
  }
  catch (err) {
    console.error(err);
  }


  try {
    getNewMckessonItemsOrderData_();
  }
  catch (err) {
    console.error(err);
  }


  try {
    getMiscItemsOrderData_()
  }
  catch (err) {
    console.error(err);
  }



  //RNG_SAMS_CLUB_ITEM_ORDERS
  try {
    getSamsClubItemsOrderData_()
  }
  catch (err) {
    console.error(err);
  }


  try {
    getAdSurgicalOrderData_()
  }
  catch (err) {
    console.error(err);
  }



  try {
    updateUnitPriceList()
  }
  catch (err) {
    console.error(err);
  }






}





function getAdSurgicalOrderData_() {

  const ItemOrdersSheet = SpreadsheetApp.getActive().getSheetByName('Item Order History');
  const ExistingDataRange = ItemOrdersSheet.getRange('RNG_AD_SURGICAL_ITEM_ORDERS');

  const ExistingIds = ExistingDataRange.getValues().map(DataRow => DataRow[0]).filter(Item => Item !== '');

  const SourceSpreadsheet = SpreadsheetApp.openById(AD_SURGICAL_ORDER_SS_ID);
  const SourceSheet = SourceSpreadsheet.getSheetByName("Raw Data for Order Dashboard");

  const SourceData = SourceSheet.getRange(2, 1, SourceSheet.getLastRow() - 1, SourceSheet.getLastColumn()).getDisplayValues();

  const NewData = SourceData.filter(DataRow => !ExistingIds.includes(DataRow[0]));

  if (NewData.length > 0) {

    // const MappedData = NewData.map(DataRow => [
    //   DataRow[0], "Sams Club", DataRow[6], DataRow[1], DataRow[2],
    //   DataRow[3], DataRow[4], "", "", DataRow[5], ""
    // ]);

    const LastRow = ExistingDataRange.getLastRow();
    ItemOrdersSheet.insertRowsAfter(LastRow - 1, NewData.length);
    ItemOrdersSheet.getRange(LastRow - 1, 1, NewData.length, NewData[0].length).setValues(NewData);

  }

}






function getSamsClubItemsOrderData_() {

  const ItemOrdersSheet = SpreadsheetApp.getActive().getSheetByName('Item Order History');
  const ExistingDataRange = ItemOrdersSheet.getRange('RNG_SAMS_CLUB_ITEM_ORDERS');

  const ExistingIds = ExistingDataRange.getValues().map(DataRow => DataRow[0]).filter(Item => Item !== '');

  const SourceSpreadsheet = SpreadsheetApp.openById(SAMS_CLUB_ORDER_SS_ID);
  const SourceSheet = SourceSpreadsheet.getSheetByName("Data");

  const SourceData = SourceSheet.getRange(2, 1, SourceSheet.getLastRow() - 1, SourceSheet.getLastColumn()).getDisplayValues();

  const NewData = SourceData.filter(DataRow => !ExistingIds.includes(DataRow[0]));

  if (NewData.length > 0) {

    const MappedData = NewData.map(DataRow => [
      DataRow[0], "Sams Club", DataRow[6], DataRow[1], DataRow[2],
      DataRow[3], DataRow[4], "", "", DataRow[5], ""
    ]);

    const LastRow = ExistingDataRange.getLastRow();
    ItemOrdersSheet.insertRowsAfter(LastRow - 1, MappedData.length);
    ItemOrdersSheet.getRange(LastRow - 1, 1, MappedData.length, MappedData[0].length).setValues(MappedData);

  }

}




function getHenryScheinItemsPurchasedWithInvoices_() {

  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Item Order History");
  let range = sheet.getRange("RNG_HENRY_SCHEIN_ITEM_ORDERS")


  // let existingIds = sheet.getRange(1, 1, sheet.getLastRow(), 1).getValues().map(r => r[0])
  let existingIds = range.getValues().map(r => r[0]);



  let sourceSS = SpreadsheetApp.openById(RAW_HENRY_SCHEIN_SS_ID);
  let sourceSheet = sourceSS.getSheetByName("Data");
  let sourceSheetWithInvoices = sourceSS.getSheetByName("Data with Invoices");

  // let sourceData = sourceSheet.getRange(2, 1, sourceSheet.getLastRow() - 1, 7).getDisplayValues()
  let sourceData = sourceSheet.getRange(2, 1, sourceSheet.getLastRow() - 1, 8).getDisplayValues()

  let dataWithInvoices = sourceSheetWithInvoices.getRange(2, 2, sourceSheetWithInvoices.getLastRow() - 1, 5).getDisplayValues()
  let invoicesIDs = dataWithInvoices.map(r => r[0])

  let newData = []

  sourceData.forEach(row => {
    let indexOfId = existingIds.indexOf(row[0]);

    let indexInInvoices = invoicesIDs.indexOf(row[0])

    if (indexOfId == -1) {
      if (indexInInvoices == -1) {
        //newData.push([row[0], "Henry Schein", "", row[2], row[1], row[4], row[3], "", row[6], row[5], row[7]])
      } else {
        if (dataWithInvoices[indexInInvoices][4] != "") {
          newData.push([row[0], "Henry Schein", dataWithInvoices[indexInInvoices][4], row[2],
          row[1], row[4], row[3], "", row[6], row[5], row[7]])
        }
      }
    }
  })


  if (newData.length > 0) {

    // sheet.getRange(sheet.getLastRow() + 1, 1, newData.length, newData[0].length).setValues(newData);

    let lastRow = range.getLastRow();
    sheet.insertRowsAfter(lastRow - 1, newData.length)
    sheet.getRange(lastRow - 1, 1, newData.length, newData[0].length).setValues(newData);

  }

}


function getAmazonItemsOrderData_() {


  const ItemOrdersSheet = SpreadsheetApp.getActive().getSheetByName('Item Order History');
  const ExistingDataRange = ItemOrdersSheet.getRange('RNG_AMAZON_ITEM_ORDERS');

  const ExistingIds = ExistingDataRange.getValues().map(DataRow => DataRow[0]).filter(Item => Item !== '');

  const SourceSpreadsheet = SpreadsheetApp.openById(AMAZON_ORDER_SS_ID);
  const SourceSheet = SourceSpreadsheet.getSheetByName("Data");

  const SourceData = SourceSheet.getRange(2, 1, SourceSheet.getLastRow() - 1, 10).getDisplayValues();

  const NewData = SourceData.filter(DataRow => !ExistingIds.includes(DataRow[0]));


  Logger.log(NewData)

  //return

  if (NewData.length > 0) {

    const MappedData = NewData.map(DataRow => [
      DataRow[0], "Amazon", DataRow[8], DataRow[5], DataRow[4],
      DataRow[3], DataRow[2], "", DataRow[6], DataRow[1], "", DataRow[9]
    ]);

    const LastRow = ExistingDataRange.getLastRow();
    ItemOrdersSheet.insertRowsAfter(LastRow - 1, MappedData.length);
    ItemOrdersSheet.getRange(LastRow - 1, 1, MappedData.length, MappedData[0].length).setValues(MappedData);

  }

}


function getNewMckessonItemsOrderData_() {

  const ItemOrdersSheet = SpreadsheetApp.getActive().getSheetByName('Item Order History');
  const ExistingDataRange = ItemOrdersSheet.getRange('RNG_MCKESSON_ITEM_ORDERS');

  const ExistingIds = ExistingDataRange.getValues().map(DataRow => DataRow[0]).filter(Item => Item !== '');

  const SourceSpreadsheet = SpreadsheetApp.openById(NEW_MCKESSON_ORDER_SS_ID);
  const SourceSheet = SourceSpreadsheet.getSheetByName("Data");

  const SourceData = SourceSheet.getRange(2, 1, SourceSheet.getLastRow() - 1, SourceSheet.getLastColumn()).getDisplayValues();

  const NewData = SourceData.filter(DataRow => !ExistingIds.includes(DataRow[0]));

  if (NewData.length > 0) {

    const MappedData = NewData.map(DataRow => [
      DataRow[0], "Mckesson", DataRow[6], DataRow[1], DataRow[2],
      DataRow[3], DataRow[4], "", "", DataRow[5], DataRow[8]
    ]);

    const LastRow = ExistingDataRange.getLastRow();
    ItemOrdersSheet.insertRowsAfter(LastRow - 1, MappedData.length);
    ItemOrdersSheet.getRange(LastRow - 1, 1, MappedData.length, MappedData[0].length).setValues(MappedData);

  }

}



function getMckessonItemsOrderData_() {

  const ItemOrdersSheet = SpreadsheetApp.getActive().getSheetByName('Item Order History');
  const ExistingDataRange = ItemOrdersSheet.getRange('RNG_MCKESSON_ITEM_ORDERS');

  const ExistingIds = ExistingDataRange.getValues().map(DataRow => DataRow[0]).filter(Item => Item !== '');

  const SourceSpreadsheet = SpreadsheetApp.openById(MCKESSON_ORDER_SS_ID);
  const SourceSheet = SourceSpreadsheet.getSheetByName("Data");

  const SourceData = SourceSheet.getRange(2, 1, SourceSheet.getLastRow() - 1, 7).getDisplayValues();

  const NewData = SourceData.filter(DataRow => !ExistingIds.includes(DataRow[0]));

  if (NewData.length > 0) {

    const MappedData = NewData.map(DataRow => [
      DataRow[0], "Mckesson", DataRow[6], DataRow[1], DataRow[2],
      DataRow[3], DataRow[4], "", "", DataRow[5], ""
    ]);

    const LastRow = ExistingDataRange.getLastRow();
    ItemOrdersSheet.insertRowsAfter(LastRow - 1, MappedData.length);
    ItemOrdersSheet.getRange(LastRow - 1, 1, MappedData.length, MappedData[0].length).setValues(MappedData);

  }

}








function getMiscItemsOrderData_() {

  const ItemOrdersSheet = SpreadsheetApp.getActive().getSheetByName('Item Order History');
  const ExistingDataRange = ItemOrdersSheet.getRange('RNG_MISC_ITEM_ORDERS');

  const ExistingIds = ExistingDataRange.getValues().map(DataRow => DataRow[0]).filter(Item => Item !== '');

  const SourceSpreadsheet = SpreadsheetApp.openById(MISC_ORDER_SS_ID);
  const SourceSheet = SourceSpreadsheet.getSheetByName("Miscellaneous Item Order History");

  const SourceData = SourceSheet.getRange(2, 1, SourceSheet.getLastRow() - 1, 13).getDisplayValues();

  const NewData = SourceData.filter(DataRow => !ExistingIds.includes(DataRow[0]));

  //let emptyRichText = SpreadsheetApp.newRichTextValue().setText("").setLinkUrl(null).build()
  if (NewData.length > 0) {

    const MappedData = NewData.map(DataRow => [
      DataRow[0], DataRow[1], DataRow[2], DataRow[3], DataRow[4], DataRow[7], DataRow[5],
      DataRow[6], DataRow[9], DataRow[8], DataRow[10], DataRow[11], DataRow[12]
    ]);

    const LastRow = ExistingDataRange.getLastRow();
    ItemOrdersSheet.insertRowsAfter(LastRow - 1, MappedData.length);
    ItemOrdersSheet.getRange(LastRow - 1, 1, MappedData.length, MappedData[0].length).setValues(MappedData);

    const micsRange = ItemOrdersSheet.getRange('RNG_MISC_ITEM_ORDERS')
    const startRow = micsRange.getRow() + 1
    const endRow = micsRange.getLastRow() - 1
    ItemOrdersSheet.getRange(startRow, 1, endRow - (startRow - 1), ItemOrdersSheet.getLastColumn()).sort([{ column: 2, ascending: true }])

  }

}





function testMiscSorting() {
  const ItemOrdersSheet = SpreadsheetApp.getActive().getSheetByName('Item Order History');
  const micsRange = ItemOrdersSheet.getRange('RNG_MISC_ITEM_ORDERS')
  const startRow = micsRange.getRow() + 1
  const endRow = micsRange.getLastRow() - 1
  ItemOrdersSheet.getRange(startRow, 1, endRow - (startRow - 1), ItemOrdersSheet.getLastColumn()).sort([{ column: 2, ascending: true }])
}




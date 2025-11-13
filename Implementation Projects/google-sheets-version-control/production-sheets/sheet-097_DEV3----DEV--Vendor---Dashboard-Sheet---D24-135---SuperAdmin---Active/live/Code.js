


const OUTPUT_FOLDER_ID = "1ourKfBI4ByeZ2O2G23Zlwisz6lTnpnJq"


const SS_TEMP_ID = "1teNWTdDAXZeUsglRJkAxIJznn4J_nE4GDuvSyrBW0lM"





function testFunc() {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getActiveSheet();

  for (var i = 2; i <= 2; i++) {
    let range = sheet.getRange(i, 2)
    let value = range.getValue()

    let e = {
      source: ss,
      range: range,
      value: value,
    }

    onEditInstall(e)
  }
}








function setInitialProperty() {
  const scriptProperties = PropertiesService.getScriptProperties();

  scriptProperties.setProperties({ "VendorID": 37 })

  Logger.log(scriptProperties)
  const data = scriptProperties.getProperties();
  Logger.log(data)
}





function onEditInstall(e) {

  //return

  let ss = e.source;
  let sheet = ss.getActiveSheet()

  if (sheet.getName() == 'Microtasks List') {
    onEditForMicro(e)
  }




  if (sheet.getSheetName() == "Vendor List (Main)") {
    try {

      const range = e.range;
      const row = range.getRow()
      const col = range.getColumn();
      const HeaderRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

      const COL = {
        idColIndex: HeaderRow.indexOf('ID'),
        vendorNameColIndex: HeaderRow.indexOf('Vendor'),
        vendorTypeColIndex: HeaderRow.indexOf('Vendor Type'),
        vendorSheetColIndex: HeaderRow.indexOf('Vendor Sheets'),
        vendorFoldColIndex: HeaderRow.indexOf('Vendor Folders'),
        vendorPayeeIDColIndex: HeaderRow.indexOf('Payee ID'),
      }


      const rowData = sheet.getRange(row, 1, 1, sheet.getLastRow()).getDisplayValues()[0]

      if ((col == COL.vendorNameColIndex + 1 || col == COL.vendorTypeColIndex + 1) && row > 1 && rowData[COL.vendorNameColIndex] != "" && rowData[COL.vendorTypeColIndex] != "" && (rowData[COL.vendorFoldColIndex] == "")) {

        createFolderFile_(sheet, row, COL, rowData, OUTPUT_FOLDER_ID)

      }

    } catch (err) { Logger.log(err) }
  }

}








function createFolderFile_(sheet, row, COL, rowData, folderID) {

  const scriptProperties = PropertiesService.getScriptProperties();
  const scriptObj = scriptProperties.getProperties();
  const newID = Number(scriptObj.VendorID) + 1
  scriptProperties.setProperties({ "VendorID": newID })

  sheet.getRange(row, COL.idColIndex + 1).setValue("VEN-" + newID)


  let ouptutFolder = DriveApp.getFolderById(folderID)

  let newFolder = null
  try {
    newFolder = ouptutFolder.getFoldersByName(rowData[COL.vendorNameColIndex] + " - " + rowData[COL.vendorTypeColIndex] + " - Folder - VEN-" + newID).next();
  } catch (err) {
    newFolder = ouptutFolder.createFolder(rowData[COL.vendorNameColIndex] + " - " + rowData[COL.vendorTypeColIndex] + " - Folder - VEN-" + newID);
  }


  let vendorFolderRich = SpreadsheetApp.newRichTextValue().setText(newFolder.getName()).setLinkUrl(newFolder.getUrl()).build()
  sheet.getRange(row, COL.vendorFoldColIndex + 1).setRichTextValue(vendorFolderRich)




  let mangFile = null
  try {
    mangFile = newFolder.getFilesByName(rowData[COL.vendorNameColIndex] + " - " + rowData[COL.vendorTypeColIndex] + " - Sheet - VEN-" + newID).next()

  } catch (err) {
    mangFile = DriveApp.getFileById(SS_TEMP_ID).makeCopy(rowData[COL.vendorNameColIndex] + " - " + rowData[COL.vendorTypeColIndex] + " - Sheet - VEN-" + newID, newFolder)
  }


  let vendorNameRich = SpreadsheetApp.newRichTextValue().setText(mangFile.getName()).setLinkUrl(mangFile.getUrl()).build()
  sheet.getRange(row, COL.vendorSheetColIndex + 1).setRichTextValue(vendorNameRich)


  let managSS = SpreadsheetApp.openById(mangFile.getId())
  let docSheet = getSheetByID_(managSS, '1356342820');

  docSheet.getRange("A1").setRichTextValue(vendorFolderRich)


}




function getSheetByID_(ss, sheetID) {
  let allSheets = ss.getSheets();

  return allSheets.filter(s => s.getSheetId().toString() == sheetID)[0]
}






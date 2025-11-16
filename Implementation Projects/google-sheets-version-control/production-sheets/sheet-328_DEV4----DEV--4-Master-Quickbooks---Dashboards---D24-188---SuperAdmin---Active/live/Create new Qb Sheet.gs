const SHEET_TEMLATE_ID = "14nh5AsOPW2o4iVMlNtBuQHnydT9Jfe9bVv3Dvkczoz4"

const OUTPUT_FOLDER_ID = "1l_M74lfnBeFHqHiOcAkGBglaOuhhv07e"







const COL = {
  ID: 2,
}




// function onOpen() {
//   const ui = SpreadsheetApp.getUi();
//   const menu = ui.createMenu("Custom");
//   menu.addItem("Create QB Sheet", "createBankSheetAndFolder").addToUi()
// }



function createBankSheetAndFolder() {

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("QB Accounts");

  const allData = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getValues();

  let outputFolder = DriveApp.getFolderById(OUTPUT_FOLDER_ID)
  let mainName = ""
  for (var i = 0; i < allData.length; i++) {
    // if (allData[i][0] != "") {
    //   mainName = allData[i][0]
    // }

    if ((allData[i][5] == true || allData[i][5] == "TRUE") && allData[i][3] == "" && allData[i][4] == "") {

      let id = allData[i][COL.ID - 1]
      if (id == "") {
        id = createNewIdNEW_(sheet, "QB", i + 1)
      }

      let newOutputFolder = outputFolder.createFolder(allData[i][0] + " Quickbook - Folder - " + id)
      let newSS = DriveApp.getFileById(SHEET_TEMLATE_ID).makeCopy(allData[i][0] + " - Sheet - " + id, newOutputFolder)

      let folderRich = SpreadsheetApp.newRichTextValue().setText(allData[i][0] + " Quickbook - Folder - " + id).setLinkUrl(newOutputFolder.getUrl()).build()
      let ssRich = SpreadsheetApp.newRichTextValue().setText(allData[i][0] + " Quickbook - Sheet - " + id).setLinkUrl(newSS.getUrl()).build()

      SpreadsheetApp.flush()
      try {
        let docSheet = SpreadsheetApp.openById(newSS.getId()).getSheetByName("Documents")
        docSheet.getRange("A1").setRichTextValue(folderRich)
      } catch (err) { }
      sheet.getRange(i + 1, 4).setRichTextValue(ssRich)
      sheet.getRange(i + 1, 5).setRichTextValue(folderRich)
      sheet.getRange(i + 1, 6).setValue(false)


    }
  }

}



function setInitialProperty() {
  //return;
  const scriptProperties = PropertiesService.getScriptProperties();

  scriptProperties.setProperties({ "lastID": 0 })

  Logger.log(scriptProperties)
  const data = scriptProperties.getProperties();
  Logger.log(data)
}


function createNewIdNEW_(sheet, idLetter, row) {

  const scriptProperties = PropertiesService.getScriptProperties();
  const scriptObj = scriptProperties.getProperties();
  const newIDNumber = Number(scriptObj.lastID) + 1
  scriptProperties.setProperties({ "lastID": newIDNumber })

  let newID = idLetter + "-" + newIDNumber
  sheet.getRange(row, COL.ID).setValue(newID);

  return newID
}
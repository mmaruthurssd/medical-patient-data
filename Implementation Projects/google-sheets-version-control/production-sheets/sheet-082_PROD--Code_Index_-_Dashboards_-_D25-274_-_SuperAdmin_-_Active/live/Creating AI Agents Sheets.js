const SHEET_TEMLATE_ID = "14nh5AsOPW2o4iVMlNtBuQHnydT9Jfe9bVv3Dvkczoz4"

const OUTPUT_FOLDER_ID = "16ucYDFEubOSDp-XjdNNtjrAx5yrvDTuT"







const COL = {
  ID: 1,
  AI_NAME: 3,
  AI_CREATE: 4,
  AI_SHEET: 5,
  AI_FOLDER: 6,
}




// function onOpen() {
//   const ui = SpreadsheetApp.getUi();
//   const menu = ui.createMenu("Custom");
//   menu.addItem("Create QB Sheet", "createBankSheetAndFolder").addToUi()
// }



function createAISheetAndFolder() {

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("AI Agent Dev");

  const allData = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getValues();

  let outputFolder = DriveApp.getFolderById(OUTPUT_FOLDER_ID)
  let mainName = ""
  for (var i = 0; i < allData.length; i++) {
    // if (allData[i][0] != "") {
    //   mainName = allData[i][0]
    // }

    if ((allData[i][COL.AI_CREATE - 1] == true || allData[i][COL.AI_CREATE - 1] == "TRUE") && allData[i][COL.AI_SHEET - 1] == "" && allData[i][COL.AI_FOLDER-1] == "") {

      let id = allData[i][COL.ID - 1]
      if (id == "") {
        id = createNewIdNEW_(sheet, "AI", i + 1)
      }

      let newOutputFolder = outputFolder.createFolder(allData[i][COL.AI_NAME - 1] + " - Folder - " + id)
      let newSS = DriveApp.getFileById(SHEET_TEMLATE_ID).makeCopy(allData[i][COL.AI_NAME - 1] + " - Sheet - " + id, newOutputFolder)

      let folderRich = SpreadsheetApp.newRichTextValue().setText(allData[i][COL.AI_NAME - 1] + " - Folder - " + id).setLinkUrl(newOutputFolder.getUrl()).build()
      let ssRich = SpreadsheetApp.newRichTextValue().setText(allData[i][COL.AI_NAME - 1] + " - Sheet - " + id).setLinkUrl(newSS.getUrl()).build()

      SpreadsheetApp.flush()
      try {
        let docSheet = SpreadsheetApp.openById(newSS.getId()).getSheetByName("Documents")
        docSheet.getRange("A1").setRichTextValue(folderRich)
      } catch (err) { }
      sheet.getRange(i + 1, COL.AI_SHEET).setRichTextValue(ssRich)
      sheet.getRange(i + 1, COL.AI_FOLDER).setRichTextValue(folderRich)
      sheet.getRange(i + 1, COL.AI_CREATE).setValue(false)


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
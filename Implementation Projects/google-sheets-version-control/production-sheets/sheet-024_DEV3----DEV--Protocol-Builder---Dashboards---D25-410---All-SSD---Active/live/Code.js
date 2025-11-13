


const TEMPLATE_ID = '1ZspUnvACz7ODf_tK62HFLdgP2flNjUXq3W30oakuNoI';
const DESTINATION_FOLDER_ID = '1JKsB_qAugWBxGp9fWXQOmFw2qYq97Wcw';


const PROTOCOL_LIST_SS = "1lTPkiIzK-8zMoe-ZqW3W1RYyzWXRxm4QIH3YxBQQyK0"

// function onOpen() {
//   SpreadsheetApp.getUi()
//     .createMenu('Custom')
//     .addItem('Create Protocol Sheet', 'createProtocolSheet')
//     .addToUi();
// }



function setInitialProperty() {
  const scriptProperties = PropertiesService.getScriptProperties();

  scriptProperties.setProperties({ "ProtocolID": 0 })

  Logger.log(scriptProperties)
  const data = scriptProperties.getProperties();
  Logger.log(data)
}








function onEditInstall(e) {


  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const activeSheet = ss.getActiveSheet();


  if (activeSheet.getSheetName() != "Protocols") return;

  let range = activeSheet.getActiveRange();
  let col = range.getColumn();
  let row = range.getRow();
  let value = e.value;

  const HeaderRow = activeSheet.getRange(1, 1, 1, activeSheet.getLastColumn()).getValues()[0];
  const COL = {
    idIndex: HeaderRow.indexOf('ID'),
    nameIndex: HeaderRow.indexOf('Name'),
    createIndex: HeaderRow.indexOf('Create/Update'),
    sheet: HeaderRow.indexOf('Sheet for Inputing Workflow'),
    push: HeaderRow.indexOf('Push PDF to Protocol List (All SSD)')
  }

  if (col == COL.createIndex + 1) {

    if (value != true && value != "TRUE") return


    //let name = activeSheet.getRange(row, COL.nameIndex + 1).getDisplayValue()

    let rowData = activeSheet.getRange(row, 1, 1, activeSheet.getLastColumn()).getDisplayValues()[0]

    if (rowData[COL.nameIndex] == "") return




    if (rowData[COL.sheet] == "") {

      let newFullID = rowData[COL.idIndex]
      if (newFullID == "") {
        const scriptProperties = PropertiesService.getScriptProperties();
        const scriptObj = scriptProperties.getProperties();
        const newID = Number(scriptObj.ProtocolID) + 1
        scriptProperties.setProperties({ "ProtocolID": newID })

        newFullID = "PROT-" + newID
        activeSheet.getRange(row, COL.idIndex + 1).setValue(newFullID)
      }


      const sheetName = "Protocol - " + rowData[COL.nameIndex] + " - " + newFullID
      const destFolder = DriveApp.getFolderById(DESTINATION_FOLDER_ID);
      const newFolder = destFolder.createFolder("Protocol - " + rowData[COL.nameIndex] + " - Folder - " + newFullID)
      const newSheetFile = DriveApp.getFileById(TEMPLATE_ID).makeCopy(sheetName, newFolder);
      SpreadsheetApp.flush();

      const newSS = SpreadsheetApp.openById(newSheetFile.getId());
      newSS.getSheetByName("Protocol").getRange("B1:B4").setValues([[newFullID], [""], [""], [rowData[COL.nameIndex]]])
      SpreadsheetApp.flush();
      try {
        newSS.getSheetByName("Documents").getRange("A1").setValue(newFolder.getUrl())
      } catch (err) { }

      const richText = SpreadsheetApp.newRichTextValue().setText(sheetName).setLinkUrl(newSheetFile.getUrl()).build();
      activeSheet.getRange(row, COL.sheet + 1).setRichTextValue(richText);
      activeSheet.getRange(row, COL.createIndex + 1).setValue(false);

    } else {
      let sheetRich = activeSheet.getRange(row, COL.sheet + 1).getRichTextValue()
      let sheetUrl = sheetRich.getLinkUrl();
      const sheetID = String(sheetUrl).match(/[-\w]{25,}/);

      const exSS = SpreadsheetApp.openById(sheetID)
      exSS.rename("Protocol - " + rowData[COL.nameIndex] + " - " + rowData[COL.idIndex])
      let exSheet = exSS.getSheetByName("Protocol")
      exSheet.getRange("B1").setValue(rowData[COL.idIndex])
      exSheet.getRange("B4").setValue(rowData[COL.nameIndex])


      DriveApp.getFileById(sheetID).setName("Protocol - " + rowData[COL.nameIndex] + " - " + rowData[COL.idIndex])
      const richText = SpreadsheetApp.newRichTextValue().setText("Protocol - " + rowData[COL.nameIndex] + " - " + rowData[COL.idIndex]).setLinkUrl(sheetUrl).build();
      activeSheet.getRange(row, COL.sheet + 1).setRichTextValue(richText);
      activeSheet.getRange(row, COL.createIndex + 1).setValue(false);

    }




  } else if (col == COL.push + 1) {

    if (value != true && value != "TRUE") return

    let rowData = activeSheet.getRange(row, 1, 1, activeSheet.getLastColumn()).getValues()[0]
    let rowDataR = activeSheet.getRange(row, 1, 1, activeSheet.getLastColumn()).getRichTextValues()[0]

    const pListSS = SpreadsheetApp.openById(PROTOCOL_LIST_SS)
    const pListSheet = pListSS.getSheetByName("Protocol List")
    const plIds = pListSheet.getRange(1, 1, pListSheet.getLastRow(), 1).getDisplayValues().map(r => r[0])

    let idIndex = plIds.indexOf(rowData[0])


    if (idIndex > -1) {
      pListSheet.getRange(idIndex + 1, 1, 1, 4).setValues([[rowData[0], rowData[7], rowData[4], new Date()]])
      pListSheet.getRange(idIndex + 1, 2, 1, 2).setRichTextValues([[rowDataR[7], rowDataR[4]]])
    } else {
      const sheetLastRow = pListSheet.getLastRow() + 1
      pListSheet.getRange(sheetLastRow, 1, 1, 4).setValues([[rowData[0], rowData[7], rowData[4], new Date()]])
      pListSheet.getRange(sheetLastRow, 2, 1, 2).setRichTextValues([[rowDataR[7], rowDataR[4]]])
    }

    activeSheet.getRange(row, COL.push + 1, 1, 2).setValues([[false, new Date()]])
  }


  //onEditSort(e)
}


























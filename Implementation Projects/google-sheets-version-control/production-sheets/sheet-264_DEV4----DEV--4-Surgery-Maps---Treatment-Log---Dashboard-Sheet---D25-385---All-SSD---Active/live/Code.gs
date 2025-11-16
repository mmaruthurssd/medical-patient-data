
const EXC_DOC_ID = "19lQEZ4P_534lEc7HjQ1Yhuoh6BI0Qxf8AS2V_OaMbzI";
const MOHS_DOC_ID = "1DF9mkMpzn7Fbl_d3xeHvf9PRb3J_YLepnRpJ7nCa0g0";


const EXC_OUTPUT_FOLDER_ID = "1Aua7tbHSLIq2JWpGvj6HRS44rzQgC10i"
const EXC_PDF_OUTPUT_FOLDER_ID = "1Z6Fp_4yf7dnmZrEfi60OpXKGgSEdQ3Wc"


const MOHS_OUTPUT_FOLDER_ID = "1bQ-WO2tRqIJpcvV9Tys57sF0vO_TSCOg"
const MOHS_PDF_OUTPUT_FOLDER_ID = "19FseisWFUpyTvqJOOTGaG6AX5UVtSfcM"




const UNTREATED_MALIGNANCIES_SHEET = "Mohs & Excision Maps"



function setInitialProperty() {
  const scriptProperties = PropertiesService.getScriptProperties();

  scriptProperties.setProperties({ "executeScript": "Yes" })

  Logger.log(scriptProperties)
  const data = scriptProperties.getProperties();
  Logger.log(data)
}





// function onOpen() {
//   const ui = SpreadsheetApp.getUi();
//   const menu = ui.createMenu("Custom");

//   //menu.addItem("Create Maps", "createDocAndPdf").addToUi()
//   menu.addItem("Update Untreated Malignancies Maps", "updateMohsExcisionMapsSheet").addToUi()
// }




function createDocAndPdf() {

}



function createDocAndPdfHourly() {

  //   return
  // }
  // function createDocAndPdfEditor() {


  // const scriptProperties = PropertiesService.getScriptProperties();
  // const data = scriptProperties.getProperties();
  // if (data.executeScript != "Yes") return
  //scriptProperties.setProperties({ "executeScript": "No" })

  try {

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(UNTREATED_MALIGNANCIES_SHEET);


    const allData = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getDisplayValues();

    const excOutputFolder = DriveApp.getFolderById(EXC_OUTPUT_FOLDER_ID)
    const excPdfOutputFolder = DriveApp.getFolderById(EXC_PDF_OUTPUT_FOLDER_ID)

    const mohsOutputFolder = DriveApp.getFolderById(MOHS_OUTPUT_FOLDER_ID)
    const mohsPdfOutputFolder = DriveApp.getFolderById(MOHS_PDF_OUTPUT_FOLDER_ID)


    let count = 0
    for (var i = 2; i < allData.length; i++) {
      if (allData[i][9] == "" || allData[i][9] == null) {
        createMohsDocAndPdf_(sheet, allData[i], i, mohsOutputFolder, mohsPdfOutputFolder)
        count++
      }


      if (allData[i][11] == "" || allData[i][11] == null) {
        createExcDocAndPdf_(sheet, allData[i], i, excOutputFolder, excPdfOutputFolder)
        count++

      }


      if (count == 100) {
        break
      }
    }

  } catch (err) {

  }

  //scriptProperties.setProperties({ "executeScript": "Yes" })

}






function createMohsDocAndPdf_(sheet, row, index, outputFolder, pdfOutputFolder) {


  const docName = "Mohs Map - " + row[0] + " " + row[2]

  let docCopy = DriveApp.getFileById(MOHS_DOC_ID).makeCopy(docName, outputFolder)
  let doc = DocumentApp.openById(docCopy.getId());
  let docBody = doc.getBody();

  docBody.replaceText("{{Case No}}", row[0])
  docBody.replaceText("{{Name}}", row[1])
  docBody.replaceText("{{BD}}", row[2])
  docBody.replaceText("{{MRN}}", row[3])
  docBody.replaceText("{{B Date}}", row[6])
  docBody.replaceText("{{Location}}", row[5].toString().trim())
  docBody.replaceText("{{Diagnosis}}", row[4].toString().trim())
  docBody.replaceText("{{Provider}}", row[7])
  docBody.replaceText("{{Clinic}}", row[8])

  doc.saveAndClose()

  const docRich = SpreadsheetApp.newRichTextValue().setText(docName).setLinkUrl(doc.getUrl()).build()
  sheet.getRange(index + 1, 10).setRichTextValue(docRich)


  doc = DriveApp.getFileById(docCopy.getId());
  const pdf = doc.getAs("application/pdf");
  let pdfFile = pdfOutputFolder.createFile(pdf);
  const pdfRich = SpreadsheetApp.newRichTextValue().setText(docName).setLinkUrl(pdfFile.getUrl()).build()
  sheet.getRange(index + 1, 11).setRichTextValue(pdfRich)



}





function createExcDocAndPdf_(sheet, row, index, outputFolder, pdfOutputFolder) {


  const docName = "Exc w Froz Map - " + row[0] + " " + row[2]

  let docCopy = DriveApp.getFileById(EXC_DOC_ID).makeCopy(docName, outputFolder)
  let doc = DocumentApp.openById(docCopy.getId());
  let docBody = doc.getBody();

  docBody.replaceText("{{Case No}}", row[0])
  docBody.replaceText("{{Name}}", row[1])
  docBody.replaceText("{{BD}}", row[2])
  docBody.replaceText("{{MRN}}", row[3])
  docBody.replaceText("{{B Date}}", row[6])
  docBody.replaceText("{{Location}}", row[5].toString().trim())
  docBody.replaceText("{{Diagnosis}}", row[4].toString().trim())
  docBody.replaceText("{{Provider}}", row[7])
  docBody.replaceText("{{Clinic}}", row[8])

  doc.saveAndClose()

  const docRich = SpreadsheetApp.newRichTextValue().setText(docName).setLinkUrl(doc.getUrl()).build()
  sheet.getRange(index + 1, 12).setRichTextValue(docRich)


  doc = DriveApp.getFileById(docCopy.getId());
  const pdf = doc.getAs("application/pdf");
  let pdfFile = pdfOutputFolder.createFile(pdf);
  const pdfRich = SpreadsheetApp.newRichTextValue().setText(docName).setLinkUrl(pdfFile.getUrl()).build()
  sheet.getRange(index + 1, 13).setRichTextValue(pdfRich)





}










function onEditInstall(e) {

  return

  let ss = e.source;
  let activeSheet = ss.getActiveSheet();

  if (activeSheet.getSheetId() != 0) return


  let range = e.range;

  let col = range.getColumn();
  let row = range.getRow();

  if (col != 6) return

  if (e.value != true && e.value != "TRUE") return

  let rowData = activeSheet.getRange(row, 1, 1, activeSheet.getLastColumn()).getDisplayValues()[0]

  const excDocName = "Exc w Froz Map - " + rowData[0] + " " + rowData[1]
  const mohsDocName = "Mohs Map - " + rowData[0] + " " + rowData[1]

  const outputFolder = DriveApp.getFolderById(OUTPUT_FOLDER_ID)

  let excDocCopy = DriveApp.getFileById(EXC_DOC_ID).makeCopy(excDocName, outputFolder)
  let excDoc = DocumentApp.openById(excDocCopy.getId());
  let excDocBody = excDoc.getBody();

  excDocBody.replaceText("{{Date}}", rowData[4])
  excDocBody.replaceText("{{Location}}", rowData[3])
  excDocBody.replaceText("{{Diagnosis}}", rowData[2])

  excDoc.saveAndClose()

  const excRich = SpreadsheetApp.newRichTextValue().setText(excDocName).setLinkUrl(excDoc.getUrl()).build()
  activeSheet.getRange(row, 7).setRichTextValue(excRich)


  let mohsDocCopy = DriveApp.getFileById(MOHS_DOC_ID).makeCopy(mohsDocName, outputFolder)
  let mohsDoc = DocumentApp.openById(mohsDocCopy.getId());
  let mohsDocBody = mohsDoc.getBody();

  mohsDocBody.replaceText("{{Date}}", rowData[4])
  mohsDocBody.replaceText("{{Location}}", rowData[3])
  mohsDocBody.replaceText("{{Diagnosis}}", rowData[2])

  mohsDoc.saveAndClose();



  const mohsRich = SpreadsheetApp.newRichTextValue().setText(mohsDocName).setLinkUrl(mohsDoc.getUrl()).build()
  activeSheet.getRange(row, 8).setRichTextValue(mohsRich)


  activeSheet.getRange(row, 6).setValue(false)
}



























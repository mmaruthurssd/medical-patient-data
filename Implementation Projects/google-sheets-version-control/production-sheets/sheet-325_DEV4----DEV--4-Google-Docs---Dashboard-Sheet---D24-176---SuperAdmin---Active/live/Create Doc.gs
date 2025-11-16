



const TEMP_SHEET_ID = '770531592'

const CREATED_DOC_LOG_SHEET_ID = '1222883861'



const OUTPUT_FOLDER_ID = "1QlKLsLrtOXbHkcb6_KuGouiLHaMbekOL"


const ARCHIVE_FOLDER_ID = "13Ozn7VR2B2TI1dmHtgtLxz4xBZN5IOaQ"




function createDoc() {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getActiveSheet();

  let docTempID = getDocIdFromUrl(sheet.getRange("B1").getValue())
  let outputFolderUrl = sheet.getRange("E1").getValue()


  let folderID = OUTPUT_FOLDER_ID
  try {
    folderID = outputFolderUrl.split("/folders/")[1].split("/")[0]
  } catch (err) {
    folderID = OUTPUT_FOLDER_ID
  }

  let templateName = sheet.getRange("B3").getValue()
  let docName = sheet.getRange("B4").getValue()
  docname = docName + " - " + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "M-dd-yyyy")


  let allData = sheet.getRange(7, 1, sheet.getLastRow() - 6, 5).getDisplayValues()



  let outputFolder = DriveApp.getFolderById(folderID)




  let copyDoc = DriveApp.getFileById(docTempID).makeCopy(docname, outputFolder);
  let doc = DocumentApp.openById(copyDoc.getId());
  let body = doc.getBody();


  allData.forEach(row => {
    if (row[0] != "") {
      body.replaceText("{{" + row[0].toString().toUpperCase().trim() + "}}", row[1])
    }

    if (row[3] != "") {
      body.replaceText("{{" + row[3].toString().toUpperCase().trim() + "}}", row[4])
    }


  })



  doc.saveAndClose();

  sheet.getRange("B4").clearContent()
  sheet.getRange("B7:B").clearContent()
  sheet.getRange("E7:E").clearContent()



  let logRow = [new Date(), Session.getActiveUser(), templateName, docname, doc.getUrl()]
  let docLog = getSheetByID_(ss, CREATED_DOC_LOG_SHEET_ID);
  docLog.getRange(docLog.getLastRow() + 1, 3, 1, logRow.length).setValues([logRow])

  docLog.getRange(3, 1, docLog.getLastRow() - 2, docLog.getLastColumn()).sort([{ column: 1, ascending: true }, { column: 3, ascending: false }]);


}







function onEditInstall(e) {
  const ss = e.source;

  const sheet = ss.getActiveSheet();


  if (sheet.getSheetId() == CREATED_DOC_LOG_SHEET_ID) {

    let range = e.range;
    let col = range.getColumn();
    let row = range.getRow();


    if (col == 8) {


      let rowData = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getDisplayValues()[0]

      if (rowData[6] != "" && e.value == "Yes") {

        const archiveFolder = DriveApp.getFolderById(ARCHIVE_FOLDER_ID)
        try {

          if (rowData[6].includes("id=")) {

            let docID = rowData[6].split("id=")[1].split("/")[0]
            DriveApp.getFileById(docID).moveTo(archiveFolder)

          } else {
            let docID = rowData[6].split("/d/")[1].split("/")[0]
            DriveApp.getFileById(docID).moveTo(archiveFolder)
          }
        } catch (errDeleting) { Logger.log(errDeleting) }
      }

      sheet.getRange(3, 1, sheet.getLastRow() - 2, sheet.getLastColumn()).sort([{ column: 1, ascending: true }, { column: 3, ascending: false }]);
    }

  } else {
    onEditSort(e)
  }

}














function getDocIdFromUrl(url) {
  const regex = /\/document\/d\/([a-zA-Z0-9-_]+)\//;
  const match = url.match(regex);
  if (match && match[1]) {
    const formId = match[1];
    return formId;
  } else {
    return null;
  }
}








function getSheetByID_(ss, sheetID) {
  let allSheets = ss.getSheets();
  return allSheets.filter(s => s.getSheetId().toString() == sheetID)[0]
}




















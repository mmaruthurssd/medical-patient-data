
const PM_DOC_FODLER_ID = "1SImjsDhzmjCx_e6TOqp4DPeCYS6Mwsod";

const PM_DOC_TEMPLATE_ID = "1IVriyYWkZzHlen7Z8tIknUZzVZVJDknT-v51jvifDgc"

const PM_SCHEDULE_SHEET = "Practice Meeting Schedule & Agendas"


const PM_SCH_CHECKBOX_COL = 3

const PM_SCH_DATE_COL = 4
const PM_SCH_DOC_COL = 5


// function onOpen() {
//   let ui = SpreadsheetApp.getUi();
//   let menu = ui.createMenu("Custom")
//   menu.addItem("Create Practice Meeting Doc", "createPMDoc").addToUi()
//   menu.addItem("Update Practice Meeting Doc", "updatePMDoc").addToUi()
// }




function onEditInstall(e) {

  //return
  const ActiveSheet = e.source.getActiveSheet();
  const activeSheetName = ActiveSheet.getSheetName()
  if (activeSheetName == 'Microtasks List') {
    onEditSorting(e)
    return
  }


  if (activeSheetName == 'Practice Meeting Schedule & Agendas') {

    let range = e.range;

    let row = range.getRow();
    let col = range.getColumn();

    const HeaderRow = ActiveSheet.getRange(2, 1, 1, ActiveSheet.getLastColumn()).getValues()[0];
    const MeetingDateIndex = HeaderRow.indexOf('Practice Meeting Date');
    const StatusColIndex = HeaderRow.indexOf('Status');
    const TopicColIndex = HeaderRow.indexOf('Topic');
    const DocColIndex = HeaderRow.indexOf('Meeting Doc');


    if (row > 2 && (col == MeetingDateIndex + 1 || col == TopicColIndex + 1)) {
      let rowData = ActiveSheet.getRange(row, 1, 1, ActiveSheet.getLastColumn()).getDisplayValues()[0]
      let rowDataV = ActiveSheet.getRange(row, 1, 1, ActiveSheet.getLastColumn()).getValues()[0]

      if (rowData[MeetingDateIndex] != "" && rowData[TopicColIndex] != "" && rowData[DocColIndex] == "") {

        let outputFolder = DriveApp.getFolderById(PM_DOC_FODLER_ID)

        let docName = rowData[MeetingDateIndex] + " " + rowData[TopicColIndex] + " - Practice Meeting Notes"
        let docFile = DriveApp.getFileById(PM_DOC_TEMPLATE_ID).makeCopy(docName, outputFolder)
        let doc = DocumentApp.openById(docFile.getId());
        doc.getHeader().replaceText("{{Date}}", + (rowDataV[MeetingDateIndex].getMonth() + 1) + "-" + rowDataV[MeetingDateIndex].getDate() + "-" + rowDataV[MeetingDateIndex].getFullYear())
        doc.saveAndClose()




        let richTextDoc = SpreadsheetApp.newRichTextValue()
          .setText(doc.getName())
          .setLinkUrl(doc.getUrl())
          .build();


        ActiveSheet.getRange(row, DocColIndex + 1).setRichTextValue(richTextDoc)


      }

    } else if (row > 1 && col == StatusColIndex + 1) {
      sortDataList(ActiveSheet)
    }

  }


}



function createPMDoc() {

  let ss = SpreadsheetApp.getActiveSpreadsheet();

  let sheet = ss.getSheetByName(PM_SCHEDULE_SHEET);

  let allData = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getValues();

  let outputFolder = DriveApp.getFolderById(PM_DOC_FODLER_ID)
  allData.forEach((row, index) => {
    if (row[PM_SCH_CHECKBOX_COL - 1] == true || row[PM_SCH_CHECKBOX_COL - 1] == "TRUE") {
      let docName = row[PM_SCH_DATE_COL - 1].getFullYear() + "-" + (row[PM_SCH_DATE_COL - 1].getMonth() + 1) + "-" + row[PM_SCH_DATE_COL - 1].getDate() + " Practice Meeting Notes"
      let docFile = DriveApp.getFileById(PM_DOC_TEMPLATE_ID).makeCopy(docName, outputFolder)
      let doc = DocumentApp.openById(docFile.getId());
      doc.getHeader().replaceText("{{Date}}", + (row[PM_SCH_DATE_COL - 1].getMonth() + 1) + "-" + row[PM_SCH_DATE_COL - 1].getDate() + "-" + row[PM_SCH_DATE_COL - 1].getFullYear())
      doc.saveAndClose()
      sheet.getRange(index + 1, PM_SCH_DOC_COL).setValue(docFile.getUrl())
      sheet.getRange(index + 1, PM_SCH_CHECKBOX_COL).setValue(false)
    }
  })


}




function updatePMDoc() {

  let ss = SpreadsheetApp.getActiveSpreadsheet();

  let sheet = ss.getSheetByName(PM_SCHEDULE_SHEET);

  let allData = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getValues();



  let outputFolder = DriveApp.getFolderById(PM_DOC_FODLER_ID)


  allData.forEach((row, index) => {
    if (row[PM_SCH_CHECKBOX_COL - 1] == true || row[PM_SCH_CHECKBOX_COL - 1] == "TRUE") {
      let docName = row[PM_SCH_DATE_COL - 1].getFullYear() + "-" + (row[PM_SCH_DATE_COL - 1].getMonth() + 1) + "-" + row[PM_SCH_DATE_COL - 1].getDate() + " Practice Meeting Notes"

      let richText = sheet.getRange(index + 1, PM_SCH_DOC_COL).getRichTextValue();

      let url = row[0];
      if (richText.getLinkUrl() != null) {
        url = richText.getLinkUrl()
      }

      let docID = getDocIdFromUrl(url)
      if (docID != null) {

        let docFile = DriveApp.getFileById(docID)
        docFile.setName(docName)

        let doc = DocumentApp.openById(docID);
        doc.getHeader().setText("Practice Meeting Notes for " + (row[PM_SCH_DATE_COL - 1].getMonth() + 1) + "-" + row[PM_SCH_DATE_COL - 1].getDate() + "-" + row[PM_SCH_DATE_COL - 1].getFullYear())
        doc.saveAndClose()

        sheet.getRange(index + 1, PM_SCH_DOC_COL).setValue(docFile.getUrl())
        sheet.getRange(index + 1, PM_SCH_CHECKBOX_COL).setValue(false)

      } else {
        let docFile = DriveApp.getFileById(PM_DOC_TEMPLATE_ID).makeCopy(docName, outputFolder)

        let doc = DocumentApp.openById(docFile.getId());
        doc.getHeader().replaceText("{{Date}}", + (row[PM_SCH_DATE_COL - 1].getMonth() + 1) + "-" + row[PM_SCH_DATE_COL - 1].getDate() + "-" + row[PM_SCH_DATE_COL - 1].getFullYear())
        doc.saveAndClose()


        sheet.getRange(index + 1, PM_SCH_DOC_COL).setValue(docFile.getUrl())
        sheet.getRange(index + 1, PM_SCH_CHECKBOX_COL).setValue(false)
      }
    }
  })

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



















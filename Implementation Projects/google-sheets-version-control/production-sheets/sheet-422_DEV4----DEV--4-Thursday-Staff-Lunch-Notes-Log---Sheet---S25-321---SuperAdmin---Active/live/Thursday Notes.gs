

const OUTPUT_FOLDER_ID = "1ErHN7FVefFL71NQXp2Hci5Jn0b-AuOzs"
const TEMPLATE_ID = '1vLqlzRjPjhQARKpEEHt7WB9pmuY6rFs8vASWNtXQgjc';


const ARCHIVE_FOLDER_ID = "1GYTqIvzEPltCe4nCsYG2DgLaGJkVi3HR"



function onEditInstall(e) {
  const ss = e.source;
  const sheet = ss.getActiveSheet();

  if (sheet.getSheetId() == 0) {

    let range = e.range;

    let col = range.getColumn();
    let row = range.getRow();


    if (col == 5 && (e.value == true || e.value == "TRUE")) {

      let rowData = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getDisplayValues()[0]
      let rowDataV = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0]

      if (rowData[5] != "") {
        try {
          let exisitngDocR = sheet.getRange(row, 6).getRichTextValue()
          let richUrlD = exisitngDocR.getLinkUrl();
          if (richUrlD.includes("id=")) {

            let docID = richUrlD.split("id=")[1].split("/")[0]
            DriveApp.getFileById(docID).setTrashed(true)

          } else {
            let docID = richUrlD.split("/d/")[1].split("/")[0]
            DriveApp.getFileById(docID).setTrashed(true)
          }
        } catch (errDeleting) { Logger.log(errDeleting) }
      }

      const outputFolder = DriveApp.getFolderById(OUTPUT_FOLDER_ID)
      // Get the template document
      const templateDoc = DriveApp.getFileById(TEMPLATE_ID);

      let date = rowData[2];
      try {
        date = Utilities.formatDate(rowDataV[2], Session.getScriptTimeZone(), "M-dd-yyyy")
      } catch (dateErr) { }


      // Make a copy of the template and rename it
      const newDoc = templateDoc.makeCopy('SSD Thursday Lunch ' + date, outputFolder);

      const doc = DocumentApp.openById(newDoc.getId());
      const body = doc.getBody();

      body.replaceText("{{Date}}", rowData[2])

      const bulletPoints = rowData[3].split(",")

      // Append bullet points to the document
      bulletPoints.forEach(point => {
        body.appendListItem(point).setGlyphType(DocumentApp.GlyphType.BULLET);
      });

      // Save and close the document
      doc.saveAndClose();

      sheet.getRange(row, 5).setValue(false)


      let newRichText = SpreadsheetApp.newRichTextValue().setText(doc.getName()).setLinkUrl(doc.getUrl()).build()
      sheet.getRange(row, 6).setRichTextValue(newRichText)



      sheet.getRange(3, 1, sheet.getLastRow() - 2, sheet.getLastColumn()).sort([{ column: 1, ascending: true }, { column: 3, ascending: false }])

    } else if (col == 10) {

      let rowData = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getDisplayValues()[0]
      if (rowData[5] != "" && e.value == "Yes") {

        const archiveFolder = DriveApp.getFolderById(ARCHIVE_FOLDER_ID)
        try {
          let exisitngDocR = sheet.getRange(row, 6).getRichTextValue()
          let richUrlD = exisitngDocR.getLinkUrl();
          if (richUrlD.includes("id=")) {

            let docID = richUrlD.split("id=")[1].split("/")[0]
            DriveApp.getFileById(docID).moveTo(archiveFolder)

          } else {
            let docID = richUrlD.split("/d/")[1].split("/")[0]
            DriveApp.getFileById(docID).moveTo(archiveFolder)
          }
        } catch (errDeleting) { Logger.log(errDeleting) }
      }

      sheet.getRange(3, 1, sheet.getLastRow() - 2, sheet.getLastColumn()).sort([{ column: 1, ascending: true }, { column: 3, ascending: false }])
    }

  } else {
    onEditSort(e)
  }

}






function createDocFromTemplate() {
  // Replace with your template document ID



  const outputFolder = DriveApp.getFolderById(OUTPUT_FOLDER_ID)

  // Get the template document
  const templateDoc = DriveApp.getFileById(TEMPLATE_ID);

  // Make a copy of the template and rename it
  const newDoc = templateDoc.makeCopy('Test Thursday Notes', outputFolder);

  // Open the new document
  const doc = DocumentApp.openById(newDoc.getId());
  const body = doc.getBody();

  // Add bullet points
  const bulletPoints = [
    "Point one is book",
    "Point two is pen"
  ];

  // Append bullet points to the document
  bulletPoints.forEach(point => {
    body.appendListItem(point).setGlyphType(DocumentApp.GlyphType.BULLET);
  });

  // Save and close the document
  doc.saveAndClose();

  Logger.log(`Document created: ${newDoc.getUrl()}`);
}





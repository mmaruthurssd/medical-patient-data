




// function onOpen() {
//   let ui = SpreadsheetApp.getUi();
//   let menu = ui.createMenu("Custom");

//   menu.addItem("Update and Sync doc", "createAndSyncPdf").addToUi()
// }

function createAndSyncPdf() {

  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(OLD_GOOGLE_DOCS_SHEET);

  let allData = sheet.getRange("A1:H").getValues();


  const destSS = SpreadsheetApp.openById(DEST_SS_ID);
  const destSheet = destSS.getSheetByName(DEST_SHEET_NAME);

  let destIds = destSheet.getRange(1, 1, destSheet.getLastRow(), 1).getDisplayValues().map(r => r[0].toString())



  let newDate = new Date()

  allData.forEach((r, i) => {

    if (r[7] == true || r[7] == "TRUE") {
      let richText = sheet.getRange(i + 1, 3).getRichTextValue();

      let richUrl = richText.getLinkUrl();

      let docID = richUrl.split("/d/")[1].split("/")[0]


      const docFile = DriveApp.getFileById(docID);


      // Convert the Google Doc to a PDF blob
      const pdfBlob = docFile.getAs('application/pdf');
      // Save the PDF to Google Drive
      const folder = DriveApp.getFolderById(OUTPUT_FOLDER_ID); // Optional: Specify a folder ID
      const pdfFile = folder.createFile(pdfBlob);

      pdfFile.setName(docFile.getName())



      sheet.getRange(i + 1, 4).setValue(newDate);

      let indexOfId = destIds.indexOf(r[0].toString());

      let newRichText = SpreadsheetApp.newRichTextValue().setText(pdfFile.getName()).setLinkUrl(pdfFile.getUrl()).build()

      if (indexOfId > -1) {
        destSheet.getRange(indexOfId + 1, 3).setRichTextValue(newRichText)
        destSheet.getRange(indexOfId + 1, 4).setValue(newDate)

      } else {
        let lastRow = destSheet.getLastRow() + 1

        destSheet.getRange(lastRow, 1).setValue(r[0])
        destSheet.getRange(lastRow, 3).setRichTextValue(newRichText)
        destSheet.getRange(lastRow, 4).setValue(newDate)
      }



      sheet.getRange(i + 1, 8).setValue(false)


    }

  })

}





const SUPERADMIN_OUTPUT_PDF_FOLDER_ID = "1NBHVAHCKN-ei98B5Yh0GZOec0xzjnNkM"


const SUPERADMIN_OUTPUT_DOC_FOLDER_ID = "1l7nXMkguax1aNnBHek3VaQZhVx6Ix0n0"




const SUPERADMIN_ARCHIVE_DOC_FOLDER_ID = "17oSgdJxoE9fUkzwvEOR1EjAR16NB01r8"
const SUPERADMIN_ARCHIVE_PDF_FOLDER_ID = "1t9u1_UG_FqsETMq41s_8DmyAMSRc4MXu"



function superAdminDocsProcess(ss, activeSheet, e, col, row) {


  let headers = activeSheet.getRange(2, 1, 1, activeSheet.getLastColumn()).getValues()[0];

  const COL = {
    id: headers.indexOf("Unique Document Id"),
    createDoc: headers.indexOf("Create Doc"),
    documentName: headers.indexOf("Document Name (can change any time)"),
    headerTemplate: headers.indexOf("Select Header Template (Cannot change once Doc is created)"),
    tempUrl: 2,
    newDoc: headers.indexOf("New Doc"),
    updatePdf: headers.indexOf("Generate PDF"),
    pdf: headers.indexOf("PDF Link"),
    pdfUpdated: headers.indexOf("PDF Last Updated"),
    archive: headers.indexOf("Archive")
  }


  let rowData = activeSheet.getRange(row, 1, 1, activeSheet.getLastColumn()).getDisplayValues()[0];


  if (col == COL.createDoc + 1 && rowData[COL.createDoc] == "TRUE" && rowData[COL.headerTemplate] != "" && rowData[COL.id] == "" && rowData[COL.newDoc] == "") {


    let templateId = rowData[COL.tempUrl].split("/d/")[1].split("/")[0]

    let uniqueIdSheet = ss.getSheetByName(UNIQUE_ID_SHEET);
    let lastUniqueId = uniqueIdSheet.getRange("B2").getValue();
    let newUniqueId = lastUniqueId + 1

    uniqueIdSheet.getRange("B2").setValue(newUniqueId);

    let newDocName = newUniqueId + ". " + rowData[COL.documentName]
    let outputFolder = DriveApp.getFolderById(SUPERADMIN_OUTPUT_DOC_FOLDER_ID);

    let newDocFile = DriveApp.getFileById(templateId).makeCopy(newDocName, outputFolder);
    let newRichText = SpreadsheetApp.newRichTextValue().setText(newDocName).setLinkUrl(newDocFile.getUrl()).build()

    activeSheet.getRange(row, COL.newDoc + 1).setRichTextValue(newRichText)
    activeSheet.getRange(row, COL.id + 1).setValue(newUniqueId)
    //activeSheet.getRange(row, COL.headerTemplate + 1).setValue("")
    activeSheet.getRange(row, COL.createDoc + 1).setValue(false)


  } else if (col == COL.documentName + 1 && rowData[COL.documentName] != "" && rowData[COL.headerTemplate] != "" && rowData[COL.id] != "" && rowData[COL.newDoc] != "") {

    let existDocID = activeSheet.getRange(row, COL.newDoc + 1).getRichTextValue().getLinkUrl().split("/d/")[1].split("/")[0]

    let newDocName = rowData[COL.id] + ". " + rowData[COL.documentName]
    let existingFile = DriveApp.getFileById(existDocID);
    existingFile.setName(newDocName)
    let newRichText = SpreadsheetApp.newRichTextValue().setText(newDocName).setLinkUrl(existingFile.getUrl()).build()

    activeSheet.getRange(row, COL.newDoc + 1).setRichTextValue(newRichText)



  } else if (col == COL.updatePdf + 1 && rowData[COL.updatePdf] == "TRUE" && rowData[COL.headerTemplate] != "" && rowData[COL.id] != "" && rowData[COL.newDoc] != "") {


    if (rowData[COL.pdf] != "") {
      let richTextP = activeSheet.getRange(row, COL.pdf + 1).getRichTextValue();
      let richUrlP = richTextP.getLinkUrl();
      let pdfID = richUrlP.split("/d/")[1].split("/")[0]
      const archivePdfFolder = DriveApp.getFolderById(SUPERADMIN_ARCHIVE_PDF_FOLDER_ID);

      DriveApp.getFileById(pdfID).moveTo(archivePdfFolder)
    }


    let richText = activeSheet.getRange(row, COL.newDoc + 1).getRichTextValue();
    let richUrl = richText.getLinkUrl();

    let docID = richUrl.split("/d/")[1].split("/")[0]


    const docFile = DriveApp.getFileById(docID);


    // Convert the Google Doc to a PDF blob
    const pdfBlob = docFile.getAs('application/pdf');
    // Save the PDF to Google Drive
    const folder = DriveApp.getFolderById(SUPERADMIN_OUTPUT_PDF_FOLDER_ID); // Optional: Specify a folder ID
    const pdfFile = folder.createFile(pdfBlob);

    pdfFile.setName(docFile.getName())



    let newRichText = SpreadsheetApp.newRichTextValue().setText(pdfFile.getName()).setLinkUrl(pdfFile.getUrl()).build()




    activeSheet.getRange(row, COL.pdf + 1).setRichTextValue(newRichText)
    activeSheet.getRange(row, COL.updatePdf + 1).setValue(false)
    activeSheet.getRange(row, COL.pdfUpdated + 1).setValue(new Date())



  } else if (col == COL.archive + 1) {


    if (rowData[COL.archive] == "Yes") {


      if (rowData[COL.newDoc] != "") {
        let richTextP = activeSheet.getRange(row, COL.newDoc + 1).getRichTextValue();
        let richUrlP = richTextP.getLinkUrl();
        let pdfID = richUrlP.split("/d/")[1].split("/")[0]
        const archivePdfFolder = DriveApp.getFolderById(SUPERADMIN_ARCHIVE_DOC_FOLDER_ID);

        DriveApp.getFileById(pdfID).moveTo(archivePdfFolder)
      }


      if (rowData[COL.pdf] != "") {
        let richTextP = activeSheet.getRange(row, COL.pdf + 1).getRichTextValue();
        let richUrlP = richTextP.getLinkUrl();
        let pdfID = richUrlP.split("/d/")[1].split("/")[0]
        const archivePdfFolder = DriveApp.getFolderById(SUPERADMIN_ARCHIVE_PDF_FOLDER_ID);

        DriveApp.getFileById(pdfID).moveTo(archivePdfFolder)
      }

    }

    sortGoogleDocSheet(activeSheet)
  }


}






const OUTPUT_PDF_FOLDER_ID = "1sFl7RuOtb_BtJN1M0UEHEP6g9g_5KdoS"


const OUTPUT_DOC_FOLDER_ID = "1HO8ISBfoUy-p2y2Hdhp8luhHkNoL_ByL"




const ARCHIVE_DOC_FOLDER_ID = "1x0_7OPi3lwOL7y373fEy7ObvW1hutr6r"
const ARCHIVE_PDF_FOLDER_ID = "1fITM9DiVoSXtTM6tTfnao7m-9FyaoLvF"




const UNIQUE_ID_SHEET = "Unique Google Doc ID Index"



const OLD_GOOGLE_DOCS_SHEET = "Old Google Docs"




const DEST_SS_ID = "1Ce4mPQPA3pvfquRW4mpHkKYo_A5UIAzfNULWbWSba5E"
const DEST_SHEET_NAME = "Print Documents"





function onEditInstall(e) {

  //return

  let ss = e.source;
  let activeSheet = ss.getActiveSheet();

  let range = e.range

  let col = range.getColumn();
  let row = range.getRow();

  if (activeSheet.getSheetId().toString() == '256021252' && row > 2) {

    SpreadsheetApp.getActiveSpreadsheet().toast('Processing...', 'Please wait', 10);


    let headers = activeSheet.getRange(2, 1, 1, activeSheet.getLastColumn()).getValues()[0];

    const COL = {
      id: headers.indexOf("Unique Document Id"),
      createDoc: headers.indexOf("Create Doc"),
      documentName: headers.indexOf("Document Name (can change any time)"),
      group: headers.indexOf("Group"),
      headerTemplate: headers.indexOf("Select Header Template (Cannot change once Doc is created)"),
      tempUrl: 2,
      newDoc: headers.indexOf("New Google Doc"),
      updatePdf: headers.indexOf("Generate PDF & Push to Printable Document List"),
      syncDoc: headers.indexOf("Display Google Doc Link"),
      pdf: headers.indexOf("PDF Link"),
      pdfUpdated: headers.indexOf("PDF Last Updated"),
      archive: headers.indexOf("Archive")
    }

    let rowData = activeSheet.getRange(row, 1, 1, activeSheet.getLastColumn()).getDisplayValues()[0];
    // Logger.log(COL.createDoc + 1)
    // Logger.log(rowData[COL.createDoc])
    // Logger.log(rowData[COL.headerTemplate])
    // Logger.log(rowData[COL.id])
    // Logger.log(rowData[COL.newDoc])
    //Logger.log(rowData)


    //This is to create the doc file
    if (col == COL.createDoc + 1 && (rowData[COL.createDoc] == "TRUE" || rowData[COL.createDoc] == true) && rowData[COL.headerTemplate] != "" && rowData[COL.id] == "" && rowData[COL.newDoc] == "") {


      let templateId = rowData[COL.tempUrl].split("/d/")[1].split("/")[0]

      let uniqueIdSheet = ss.getSheetByName(UNIQUE_ID_SHEET);
      let lastUniqueId = uniqueIdSheet.getRange("A2").getValue();
      let newUniqueId = lastUniqueId + 1

      uniqueIdSheet.getRange("A2").setValue(newUniqueId);

      let newDocName = newUniqueId + ". " + rowData[COL.documentName]
      let outputFolder = DriveApp.getFolderById(OUTPUT_DOC_FOLDER_ID);

      let newDocFile = DriveApp.getFileById(templateId).makeCopy(newDocName, outputFolder);
      let newRichText = SpreadsheetApp.newRichTextValue().setText(newDocName).setLinkUrl(newDocFile.getUrl()).build()

      activeSheet.getRange(row, COL.newDoc + 1).setRichTextValue(newRichText)
      activeSheet.getRange(row, COL.id + 1).setValue(newUniqueId)
      //activeSheet.getRange(row, COL.headerTemplate + 1).setValue("")
      activeSheet.getRange(row, COL.createDoc + 1).setValue(false)


      //will change the name of the doc if already exisitng doc.
    } else if (col == COL.documentName + 1 && rowData[COL.documentName] != "" && rowData[COL.headerTemplate] != "" && rowData[COL.id] != "" && rowData[COL.newDoc] != "") {

      let existDocID = activeSheet.getRange(row, COL.newDoc + 1).getRichTextValue().getLinkUrl().split("/d/")[1].split("/")[0]

      let newDocName = rowData[COL.id] + ". " + rowData[COL.documentName]
      let existingFile = DriveApp.getFileById(existDocID);
      existingFile.setName(newDocName)
      let newRichText = SpreadsheetApp.newRichTextValue().setText(newDocName).setLinkUrl(existingFile.getUrl()).build()

      activeSheet.getRange(row, COL.newDoc + 1).setRichTextValue(newRichText)



    } else if (col == COL.updatePdf + 1 && rowData[COL.updatePdf] == "TRUE" && rowData[COL.headerTemplate] != "" && rowData[COL.id] != "" && rowData[COL.newDoc] != "") {


      const destSS = SpreadsheetApp.openById(DEST_SS_ID);
      const destSheet = destSS.getSheetByName(DEST_SHEET_NAME);
      let destIds = destSheet.getRange(1, 1, destSheet.getLastRow(), 1).getDisplayValues().map(r => r[0].toString())


      if (rowData[COL.pdf] != "") {
        let richTextP = activeSheet.getRange(row, COL.pdf + 1).getRichTextValue();
        let richUrlP = richTextP.getLinkUrl();
        let pdfID = richUrlP.split("/d/")[1].split("/")[0]
        const archivePdfFolder = DriveApp.getFolderById(ARCHIVE_PDF_FOLDER_ID);

        DriveApp.getFileById(pdfID).moveTo(archivePdfFolder)
      }


      let richText = activeSheet.getRange(row, COL.newDoc + 1).getRichTextValue();
      let richUrl = richText.getLinkUrl();

      let docID = richUrl.split("/d/")[1].split("/")[0]


      const docFile = DriveApp.getFileById(docID);


      // Convert the Google Doc to a PDF blob
      const pdfBlob = docFile.getAs('application/pdf');
      // Save the PDF to Google Drive
      const folder = DriveApp.getFolderById(OUTPUT_PDF_FOLDER_ID); // Optional: Specify a folder ID
      const pdfFile = folder.createFile(pdfBlob);

      pdfFile.setName(docFile.getName())



      //activeSheet.getRange(i + 1, 4).setValue(newDate);

      let indexOfId = destIds.indexOf(rowData[COL.id].toString());

      let newRichText = SpreadsheetApp.newRichTextValue().setText(pdfFile.getName()).setLinkUrl(pdfFile.getUrl()).build()

      if (indexOfId > -1) {
        destSheet.getRange(indexOfId + 1, 2).setValue(rowData[COL.group])
        destSheet.getRange(indexOfId + 1, 4).setRichTextValue(newRichText)
        destSheet.getRange(indexOfId + 1, 5).setValue(new Date())

      } else {
        let lastRow = destSheet.getLastRow() + 1

        destSheet.getRange(lastRow, 1).setValue(rowData[COL.id])
        destSheet.getRange(lastRow, 2).setValue(rowData[COL.group])
        destSheet.getRange(lastRow, 4).setRichTextValue(newRichText)
        destSheet.getRange(lastRow, 5).setValue(new Date())
      }


      activeSheet.getRange(row, COL.pdf + 1).setRichTextValue(newRichText)
      activeSheet.getRange(row, COL.updatePdf + 1).setValue(false)
      activeSheet.getRange(row, COL.pdfUpdated + 1).setValue(new Date())

      destSheet.getRange(2, 1, destSheet.getLastRow() - 1, destSheet.getLastColumn()).sort([{ column: 2, ascending: false }])



    } else if (col == COL.syncDoc + 1 && rowData[COL.syncDoc] == "TRUE" && rowData[COL.headerTemplate] != "" && rowData[COL.id] != "" && rowData[COL.newDoc] != "") {

      const destSS = SpreadsheetApp.openById(DEST_SS_ID);
      const destSheet = destSS.getSheetByName(DEST_SHEET_NAME);
      let destIds = destSheet.getRange(1, 1, destSheet.getLastRow(), 1).getDisplayValues().map(r => r[0].toString())

      let richText = activeSheet.getRange(row, COL.newDoc + 1).getRichTextValue();

      //activeSheet.getRange(i + 1, 4).setValue(newDate);

      let indexOfId = destIds.indexOf(rowData[COL.id].toString());


      if (indexOfId > -1) {
        destSheet.getRange(indexOfId + 1, 2).setValue(rowData[COL.group])
        destSheet.getRange(indexOfId + 1, 3).setRichTextValue(richText)
        destSheet.getRange(indexOfId + 1, 5).setValue(new Date())

      } else {
        let lastRow = destSheet.getLastRow() + 1
        destSheet.getRange(lastRow, 2).setValue(rowData[COL.group])
        destSheet.getRange(lastRow, 1).setValue(rowData[COL.id])
        destSheet.getRange(lastRow, 3).setRichTextValue(richText)
        destSheet.getRange(lastRow, 5).setValue(new Date())
      }



      activeSheet.getRange(row, COL.syncDoc + 1).setValue(false)
      activeSheet.getRange(row, COL.pdfUpdated + 1).setValue(new Date())


      destSheet.getRange(2, 1, destSheet.getLastRow() - 1, destSheet.getLastColumn()).sort([{ column: 2, ascending: false }])




    } else if (col == COL.archive + 1) {


      if (rowData[COL.archive] == "Yes") {
        const destSS = SpreadsheetApp.openById(DEST_SS_ID);
        const destSheet = destSS.getSheetByName(DEST_SHEET_NAME);
        let destIds = destSheet.getRange(1, 1, destSheet.getLastRow(), 1).getDisplayValues().map(r => r[0].toString())

        let indexOfId = destIds.indexOf(rowData[COL.id].toString());
        if (indexOfId > -1) {
          destSheet.deleteRows(indexOfId + 1, 1)
        }


        if (rowData[COL.newDoc] != "") {
          let richTextP = activeSheet.getRange(row, COL.newDoc + 1).getRichTextValue();
          let richUrlP = richTextP.getLinkUrl();
          let pdfID = richUrlP.split("/d/")[1].split("/")[0]
          const archivePdfFolder = DriveApp.getFolderById(ARCHIVE_DOC_FOLDER_ID);

          DriveApp.getFileById(pdfID).moveTo(archivePdfFolder)
        }


        if (rowData[COL.pdf] != "") {
          let richTextP = activeSheet.getRange(row, COL.pdf + 1).getRichTextValue();
          let richUrlP = richTextP.getLinkUrl();
          let pdfID = richUrlP.split("/d/")[1].split("/")[0]
          const archivePdfFolder = DriveApp.getFolderById(ARCHIVE_PDF_FOLDER_ID);

          DriveApp.getFileById(pdfID).moveTo(archivePdfFolder)
        }

      }

      sortGoogleDocSheet(activeSheet)
    }



    SpreadsheetApp.getActiveSpreadsheet().toast('Processing complete', 'Done', 3);


  } else if (activeSheet.getSheetId().toString() == '1317738747' && row > 2) {
    superAdminDocsProcess(ss, activeSheet, e, col, row)

  } else if (activeSheet.getSheetId().toString() == '1325958836' && row > 1) {
    allFilesTempProcess(ss, activeSheet, e, col, row)

  } else if (activeSheet.getSheetId().toString() == '194880938' && row > 1) {
    tempSheetArchiveProcess(ss, activeSheet, e, col, row)

  } else if (activeSheet.getSheetId().toString() == '1356342820' && row > 2 && col == 5 && e.value == "External") {
    sendDocToExternal(ss, activeSheet, e, col, row)
  }


  onEditSort(e)

}



function sendDocToExternal(ss, activeSheet, e, col, row) {
  let externalSheet = ss.getSheetByName("External Documents")
  let fileR = activeSheet.getRange(row, 1).getRichTextValue();

  externalSheet.getRange(externalSheet.getLastRow() + 1, 4, 1, 2).setValues([[fileR.getText(), fileR.getLinkUrl()]])

  externalSheet.getRange(3, 1, externalSheet.getLastRow() - 2, externalSheet.getLastColumn()).sort({ column: 1, ascending: true });
}





function sortGoogleDocSheet(ActiveSheet) {

  const LastRow = ActiveSheet.getLastRow()
  const LastColumn = ActiveSheet.getLastColumn()
  ActiveSheet.getRange(3, 1, LastRow - 2, LastColumn).sort({ column: 1, ascending: true });
};










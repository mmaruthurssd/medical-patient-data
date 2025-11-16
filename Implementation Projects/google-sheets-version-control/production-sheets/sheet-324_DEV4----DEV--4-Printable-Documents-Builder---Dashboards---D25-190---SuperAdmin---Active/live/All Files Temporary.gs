

const TEMPORARY_FOLDER_ID = "1UAy3FYXZ2jgifNvzLpNzpf4spMOIL5aB"

const TEMP_ARCHIVE_FOLDER_ID = "1EWU1f6zASFei1i2jT5z8qWIvZDmhFUXc"


const TEMPORARY_FILES_SHEET = "Temp File List"



function allFilesTempProcess(ss, activeSheet, e, col, row) {


  if ((col == 7 || col == 8) && (e.value == true || e.value == "TRUE")) {
    let rowDataR = activeSheet.getRange(row, 1, 1, 5).getRichTextValues()[0];
    let rowData = activeSheet.getRange(row, 1, 1, 6).getDisplayValues()[0];


    let fileUrl = rowDataR[0].getLinkUrl()
    let fileId = null

    if (fileUrl != null) {
      if (fileUrl.includes("?id=")) {
        fileId = fileUrl.split("?id=")[1].split("/")[0]

      } else if (fileUrl.includes("/d/")) {
        fileId = fileUrl.split("/d/")[1].split("/")[0]
      }

    } else {
      fileUrl = rowDataR[0]

      if (fileUrl.includes("?id=")) {
        fileId = fileUrl.split("?id=")[1].split("/")[0]

      } else if (fileUrl.includes("/d/")) {
        fileId = fileUrl.split("/d/")[1].split("/")[0]
      }


    }


    const tempFolder = DriveApp.getFolderById(TEMPORARY_FOLDER_ID)

    let newTempFile = null

    let fileName = rowData[4]
    if (rowData[5] != "") {
      fileName = rowData[5]
    }

    if (col == 7) {
      newTempFile = DriveApp.getFileById(fileId).makeCopy(fileName, tempFolder)

    } else if (col == 8) {

      const copiedDoc = DriveApp.getFileById(fileId).makeCopy(fileName, tempFolder)
      const pdfBlob = copiedDoc.getBlob().getAs("application/pdf");

      newTempFile = DriveApp.createFile(pdfBlob);

      copiedDoc.setTrashed(true);
    }



    rowDataR[5] = SpreadsheetApp.newRichTextValue().setText(newTempFile.getName()).setLinkUrl(newTempFile.getUrl()).build();

    //rowDataR[2] = SpreadsheetApp.newRichTextValue().setText(null).setLinkUrl(null).build();
    //rowDataR[3] = SpreadsheetApp.newRichTextValue().setText(null).setLinkUrl(null).build();

    const tempSheet = ss.getSheetByName(TEMPORARY_FILES_SHEET);

    tempSheet.getRange(tempSheet.getLastRow() + 1, 3, 1, rowDataR.length).setRichTextValues([rowDataR])

    tempSheet.getRange("E3:F").clearContent()


    activeSheet.getRange(row, col).setValue(false)

    activeSheet.getRange(row, 6).setValue("")


    tempSheet.getRange(3, 1, tempSheet.getLastRow() - 2, tempSheet.getLastColumn()).sort({ column: 1, ascending: true });

  }
}







function tempSheetArchiveProcess(ss, activeSheet, e, col, row) {
  if (col == 9 && row > 2) {

    let rowData = activeSheet.getRange(row, 1, 1, activeSheet.getLastColumn()).getDisplayValues()[0];

    if (rowData[8] == "Yes") {

      if (rowData[7] != "") {
        let richTextP = activeSheet.getRange(row, 8).getRichTextValue();
        let richUrlP = richTextP.getLinkUrl();
        let fileID = ""

        if (richUrlP.includes("?id=")) {
          fileID = richUrlP.split("?id=")[1].split("/")[0]

        } else if (richUrlP.includes("/d/")) {
          fileID = richUrlP.split("/d/")[1].split("/")[0]
        }


        const archivePdfFolder = DriveApp.getFolderById(TEMP_ARCHIVE_FOLDER_ID);

        DriveApp.getFileById(fileID).moveTo(archivePdfFolder)
      }




    }


    activeSheet.getRange(3, 1, activeSheet.getLastRow() - 2, activeSheet.getLastColumn()).sort({ column: 1, ascending: true });


  }
}







function sendTempEmailProcess() {

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const sheet = ss.getActiveSheet();


  const recipents = sheet.getRange("F4").getValue()
  const subject = sheet.getRange("F6").getValue()
  const body = sheet.getRange("E9").getValue()


  const allFiles = sheet.getRange(23, 3, sheet.getLastRow() - 22, 7).getValues();
  const richFiles = sheet.getRange(23, 3, sheet.getLastRow() - 22, 1).getRichTextValues();


  const attachments = [];
  let filesList = []
  for (var i = 0; i < allFiles.length; i++) {

    if (allFiles[i][6] == true || allFiles[i][6] == "TRUE") {

      let fileUrl = richFiles[i][0].getLinkUrl()
      let fileId = null

      if (fileUrl != null) {
        if (fileUrl.includes("?id=")) {
          fileId = fileUrl.split("?id=")[1].split("/")[0]

        } else if (fileUrl.includes("/d/")) {
          fileId = fileUrl.split("/d/")[1].split("/")[0]
        }

      } else {
        fileUrl = allFiles[i][0]

        if (fileUrl.includes("?id=")) {
          fileId = fileUrl.split("?id=")[1].split("/")[0]

        } else if (fileUrl.includes("/d/")) {
          fileId = fileUrl.split("/d/")[1].split("/")[0]
        }


      }


      if (fileId) {

        filesList.push(allFiles[i][5])
        const file = DriveApp.getFileById(fileId);
        attachments.push(file.getBlob());
      }

      sheet.getRange(23 + i, 9).setValue(false)



    }

  }


  GmailApp.sendEmail(recipents.replace(/\s+/g, ""), subject, body, {
    attachments: attachments
  });


  sheet.getRange("F4").clearContent()
  sheet.getRange("F6").clearContent()
  sheet.getRange("E9").clearContent()


  const docLogSheet = ss.getSheetByName(DOCUMENTS_LOG_SHEET_NAME);

  let logRow = [new Date(), Session.getActiveUser(), recipents, subject, body, filesList.join(", ")]
  docLogSheet.getRange(docLogSheet.getLastRow() + 1, 1, 1, logRow.length).setValues([logRow])

  docLogSheet.getRange(2, 1, docLogSheet.getLastRow() - 1, docLogSheet.getLastColumn()).sort([{ column: 1, ascending: false }])


}



















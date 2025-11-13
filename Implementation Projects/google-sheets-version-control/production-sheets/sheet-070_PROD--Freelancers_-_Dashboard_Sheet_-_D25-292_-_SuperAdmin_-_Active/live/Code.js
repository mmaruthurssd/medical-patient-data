

const FRE_OUTPUT_FOLDER_ID = "1F0CKUHfz6IooE_EiLY0zAUzfOWRLQOWj"

const FRE_SS_TEMPLATE = "1KZggMSp813L-Rx9F00Ed0cvWq3zYfduYF2d-4MCZEbg"

const FRE_DOC_TEMP_ID = "1JY50Lo1-p7sY95vtWJovCCvrCxF67skyOAPzwqT7c7g"





function testFunc() {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getActiveSheet();

  //for (var i = 42; i <= 42; i++) {
  let range = sheet.getRange(2, 6)
  let value = range.getValue()

  let e = {
    source: ss,
    range: range,
    value: value,
  }

  onEditInstall(e)
  //}
}









function onEditInstall(e) {

  //return

  let ss = e.source;
  let sheet = ss.getActiveSheet()




  //return


  if (sheet.getSheetName() == "Freelancers") {
    try {

      const range = e.range;
      const row = range.getRow()
      const col = range.getColumn();
      const HeaderRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const empColIndex = HeaderRow.indexOf('Freelancer Name')
      const foldColIndex = HeaderRow.indexOf('Freelancer Folder URL')
      const empStatusColIndex = HeaderRow.indexOf('Status')
      const fileColIndex = HeaderRow.indexOf('Google Doc')
      const idIndex = HeaderRow.indexOf('ID')




      const rowData = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getDisplayValues()[0]

      if ((col == empColIndex + 1 || col == empStatusColIndex + 1) && row > 1 && rowData[empColIndex] != "" && rowData[empColIndex] != null && rowData[empStatusColIndex] != "" && rowData[empStatusColIndex] != null) {

        Logger.log("Yes")

        SpreadsheetApp.getActiveSpreadsheet().toast('Processing...', 'Please wait', 10);
        createFolderFile(ss, sheet, row, rowData[empColIndex], foldColIndex, fileColIndex, empColIndex, idIndex, empStatusColIndex, rowData, FRE_OUTPUT_FOLDER_ID)
        SpreadsheetApp.getActiveSpreadsheet().toast('Processing complete', 'Done', 3);
      }

    } catch (err) { Logger.log(err) }

  }

  onEditSort(e)

}









function createFolderFile(ss, sheet, row, empName, foldColIndex, fileColIndex, empManagSheetColIndex, idIndex, empStatusColIndex, rowData, folderID) {

  let lastID = 1
  let rowId = rowData[idIndex]
  if (rowData[idIndex] == "") {
    const lastIdSheet = ss.getSheetByName("Id_Tracker");
    lastID = lastIdSheet.getRange("A2").getValue();
    lastID++;
    lastIdSheet.getRange("A2").setValue(lastID);
    rowId = "FRL-" + lastID
  }

  sheet.getRange(row, idIndex + 1).setValue(rowId)

  let ouptutFolder = DriveApp.getFolderById(folderID)

  let newFolder = null
  try {
    newFolder = ouptutFolder.getFoldersByName(empName + " - Folder " + rowId + " - " + rowData[empStatusColIndex]).next();
  } catch (err) {
    newFolder = ouptutFolder.createFolder(empName + " - Folder " + rowId + " - " + rowData[empStatusColIndex]);
  }


  let docFolderRich = SpreadsheetApp.newRichTextValue().setText(empName + " - Folder " + rowId + " - " + rowData[empStatusColIndex]).setLinkUrl(newFolder.getUrl()).build()
  sheet.getRange(row, foldColIndex + 1).setRichTextValue(docFolderRich)



  if (rowData[fileColIndex] == "") {
    let docFile = DriveApp.getFileById(FRE_DOC_TEMP_ID).makeCopy(empName + " - Document " + rowId + " - " + rowData[empStatusColIndex], newFolder)
    let docFileRich = SpreadsheetApp.newRichTextValue().setText(empName + " - Document " + rowId + " - " + rowData[empStatusColIndex]).setLinkUrl(docFile.getUrl()).build()
    sheet.getRange(row, fileColIndex + 1).setRichTextValue(docFileRich)
  }


  let mangFile = null
  try {
    mangFile = newFolder.getFilesByName(empName + " - Sheet " + rowId + " - " + rowData[empStatusColIndex]).next()

  } catch (err) {
    mangFile = DriveApp.getFileById(FRE_SS_TEMPLATE).makeCopy(empName + " - Sheet " + rowId + " - " + rowData[empStatusColIndex], newFolder)
  }

  if (mangFile) {
    try {
      const mangSS = SpreadsheetApp.openById(mangFile.getId());
      const docSheet = mangSS.getSheetByName("Documents");

      // Set the hyperlink in Documents sheet cell A1
      const richTextParentUrl = SpreadsheetApp.newRichTextValue()
        .setText(newFolder.getName())
        .setLinkUrl(newFolder.getUrl())
        .build();

      docSheet.getRange('A1').setRichTextValue(richTextParentUrl);
    } catch (foldErr) { }
  }

  let mangFileRich = SpreadsheetApp.newRichTextValue().setText(empName).setLinkUrl(mangFile.getUrl()).build()
  sheet.getRange(row, empManagSheetColIndex + 1).setRichTextValue(mangFileRich)




  //return newFolder.getId()

}













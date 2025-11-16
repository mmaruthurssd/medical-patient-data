

//const OUTPUT_FOLDER_ID = "160VNU99erlYajpAqJ6I6tkbZ8nPVh6DT"


//const PROVIDERS_OUTPUT_FOLDER_ID = "1X4rDB7NxO_yeXg_Y26eGl5mRGSdDSu_V"
const OTHER_OUTPUT_FOLDER_ID = "1mugvqCmkvMwS_2E5TcJooaKEBKneDG6h"



const DOC_TEMP_ID = "1iI8lIC0N2j0MysSeaM3JRaNiwQc1gItHXNqT3qf-CTI"


const CREDENTIALING_TEMP_ID = "1_IG9NoYDb7iNcO-amn4NYg0MsUaUbtrTwU7RqTjLCVA"


const MANAGEMENT_TEMP_ID = "1U3eeapRC5_lWN_-HZlMokLQJ8ftGaU33CPTFKka4GzY"



function testFunc() {
  return;
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getActiveSheet();

  for (var i = 15; i <= 15; i++) {
    let range = sheet.getRange(i, 4)
    let value = range.getValue()

    let e = {
      source: ss,
      range: range,
      value: value,
    }

    onEditInstall(e)
  }
}





function deleteAllDocFile() {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getActiveSheet();

  let allFiles = sheet.getRange("G1:G").getRichTextValues();


  for (var i = 1; i < allFiles.length; i++) {

    let text = allFiles[i][0].getText()
    if (text != "" && text != null) {
      let fileUrl = allFiles[i][0].getLinkUrl()

      let fileId = fileUrl.split("/edit?")[0].split("/d/")[1];
      DriveApp.getFileById(fileId).setTrashed(true)

      sheet.getRange(i + 1, 7).setValue("")
    }
  }
}




function listAllFoldersFile() {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getActiveSheet();

  let allFiles = sheet.getRange("C1:C").getRichTextValues();


  for (var i = 1; i < allFiles.length; i++) {

    let text = allFiles[i][0].getText()
    if (text != "" && text != null) {
      let folderUrl = allFiles[i][0].getLinkUrl()

      let folderId = "";

      if (folderUrl.includes("/folders/")) {
        folderId = folderUrl.split("/folders/")[1].split("?")[0];
      } else {
        folderId = folderUrl.split("id=")[1].split("?")[0];
      }


      let folder = DriveApp.getFolderById(folderId);
      let newRichFolder = SpreadsheetApp.newRichTextValue().setText(folder.getName()).setLinkUrl(folder.getUrl()).build();


      sheet.getRange(i + 1, 6).setRichTextValue(newRichFolder)
    }
  }
}








function onEditInstall(e) {

  //return

  let ss = e.source;
  let sheet = ss.getActiveSheet()

  //if (sheet.getName() == 'Microtasks List') {
  onEditForMicro(e)
  //}


  //return


  if (sheet.getSheetName() == "Employee List") {
    try {

      const range = e.range;
      const row = range.getRow()
      const col = range.getColumn();
      const HeaderRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const empColIndex = HeaderRow.indexOf('Employee Name')
      const foldColIndex = HeaderRow.indexOf('Employee Folder URL')
      const empTypeColIndex = HeaderRow.indexOf('Employee Type')
      const fileColIndex = HeaderRow.indexOf('Google Doc')
      const idColIndex = HeaderRow.indexOf('ID')
      const empSheetColIndex = HeaderRow.indexOf('Employee Sheet')
      // const credSheetColIndex = HeaderRow.indexOf('Credentialing Worksheet for each provider')


      const rowData = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getDisplayValues()[0]

      if (col == empTypeColIndex + 1 && row > 3 && rowData[empColIndex] != "" && rowData[empColIndex] != null && rowData[empTypeColIndex] == "Provider") {
        console.log("provider");
        createFolderFile(ss, sheet, row, rowData[empColIndex], idColIndex, foldColIndex, fileColIndex, empColIndex, empSheetColIndex, rowData, OTHER_OUTPUT_FOLDER_ID, "Provider - ")

      } else if (col == empTypeColIndex + 1 && row > 3 && rowData[empColIndex] != "" && rowData[empColIndex] != null && rowData[empTypeColIndex] != "") {
        console.log("other");
        createFolderFile(ss, sheet, row, rowData[empColIndex], idColIndex, foldColIndex, fileColIndex, empColIndex, empSheetColIndex, rowData, OTHER_OUTPUT_FOLDER_ID, "")

      }

    } catch (err) { Logger.log(err) }

  }

  onEditProcess(e)

}






function createCredentialSheet(folderID, sheet, row, empName, credSheetColIndex) {
  let empFolder = DriveApp.getFolderById(folderID)

  let credFile = DriveApp.getFileById(CREDENTIALING_TEMP_ID).makeCopy("Credentialing Worksheet - " + empName, empFolder)
  let credFileRich = SpreadsheetApp.newRichTextValue().setText("Credentialing Worksheet - " + empName).setLinkUrl(credFile.getUrl()).build()
  sheet.getRange(row, credSheetColIndex + 1).setRichTextValue(credFileRich)
}







function createFolderFile(ss, sheet, row, empName, idColIndex, foldColIndex, fileColIndex, empManagSheetColIndex, empSheetColIndex, rowData, folderID, flage) {

  let ouptutFolder = DriveApp.getFolderById(folderID)

  let newID = rowData[idColIndex]
  if (rowData[idColIndex] == "") {
    let idTrackerSheet = ss.getSheetByName("ID_Tracker");
    let lastID = idTrackerSheet.getRange("A2").getValue();
    lastID++;
    idTrackerSheet.getRange("A2").setValue(lastID);

    newID = "EMP-" + lastID

    sheet.getRange(row, idColIndex + 1).setValue(newID)

  }

  let employeeFolderName = empName + " - Folder - " + newID
  let employeeSheetName = empName + " - Sheet - " + newID
  let employeeDocName = empName + " - Employee Document - " + newID

  let newFolder = null
  try {
    newFolder = ouptutFolder.getFoldersByName(employeeFolderName).next();
  } catch (err) {
    newFolder = ouptutFolder.createFolder(employeeFolderName);
  }




  let docFolderRich = SpreadsheetApp.newRichTextValue().setText(employeeFolderName).setLinkUrl(newFolder.getUrl()).build()
  sheet.getRange(row, foldColIndex + 1).setRichTextValue(docFolderRich)



  if (rowData[fileColIndex] == "") {
    let docFile = DriveApp.getFileById(DOC_TEMP_ID).makeCopy(employeeDocName, newFolder)
    let docFileRich = SpreadsheetApp.newRichTextValue().setText(employeeDocName).setLinkUrl(docFile.getUrl()).build()
    sheet.getRange(row, fileColIndex + 1).setRichTextValue(docFileRich)
  }


  let mangFile = null
  try {
    mangFile = newFolder.getFilesByName(employeeSheetName).next()

  } catch (err) {
    mangFile = DriveApp.getFileById(MANAGEMENT_TEMP_ID).makeCopy(employeeSheetName, newFolder)
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

      docSheet.getRange('B1').setRichTextValue(richTextParentUrl);
    } catch (foldErr) { }
  }

  let mangFileRich = SpreadsheetApp.newRichTextValue().setText(empName).setLinkUrl(mangFile.getUrl()).build()
  sheet.getRange(row, empManagSheetColIndex + 1).setRichTextValue(mangFileRich)

  let empSheetRich = SpreadsheetApp.newRichTextValue().setText(employeeSheetName).setLinkUrl(mangFile.getUrl()).build()
  sheet.getRange(row, empSheetColIndex + 1).setRichTextValue(empSheetRich)




  //return newFolder.getId()

}





function onEditProcess(e) {

  const ActiveSheet = e.source.getActiveSheet();

  if (ActiveSheet.getName() === 'Microtasks List') {

    const HeaderRow = ActiveSheet.getRange(1, 1, 1, ActiveSheet.getLastColumn()).getValues()[0];
    const StatusColIndex = HeaderRow.indexOf('Status');

    if (e.range.getColumn() === StatusColIndex + 1)
      sortMicrotasksList();

  }

  if (ActiveSheet.getName() === 'Employee List') {
    if (e.range.getColumn() === 2 && e.range.getValue() === 'Terminated')
      sortEmployeeList();
  }

}


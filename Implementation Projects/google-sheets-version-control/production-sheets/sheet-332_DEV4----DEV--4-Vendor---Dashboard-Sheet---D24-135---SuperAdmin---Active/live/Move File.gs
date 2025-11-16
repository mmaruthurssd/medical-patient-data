



function moveFilesMain() {

  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = getSheetByID_(ss, VENDOR_DOC_DUMP_SHEET_ID);

  let allData = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues()
  let headers = allData.splice(0, 1)[0]

  let COL = {
    fileUrl: headers.indexOf("File URL"),
    currentFolder: headers.indexOf("Current Folder"),
    moved: headers.indexOf("Moved"),
    folderLink: headers.indexOf("Folder Link"),
    vname: headers.indexOf("Vendor Name"),
    dType: headers.indexOf("Document Type"),
    description: headers.indexOf("Description & Date"),


  }



  let richText = sheet.getRange(2, COL.folderLink + 1, sheet.getLastRow() - 1, 1).getRichTextValues()
  richText.splice(0, 1)


  allData.forEach((row, i) => {

    try {
      if ((row[COL.moved] == "" || row[COL.moved] == null) && row[COL.folderLink] != "") {
        let folder = DriveApp.getFolderById(richText[i][0].getLinkUrl().split("folders/")[1].split("/")[0].trim());
        let file = DriveApp.getFileById(row[COL.fileUrl].split("/d/")[1].split("/")[0]);
        file.moveTo(folder);

        file.setName(row[COL.vname] + " " + row[COL.dType] + " " + row[COL.description])
        sheet.getRange(3 + i, COL.moved + 1).setValue("Yes")
        sheet.getRange(3 + i, COL.currentFolder + 1, 1, 2).setValues([[folder.getName(), folder.getUrl()]])
      }
    } catch (err) { }

  })



  sheet.getRange(3, 1, sheet.getLastRow() - 2, sheet.getLastColumn()).sort({ column: 1, ascending: true });


}

















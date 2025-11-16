function listTaxFilesInFolderFromA1Url() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Master Tax Documents Folder");

  const folder = DriveApp.getFolderById(TAX_FOLDER_ID);
  const files = folder.getFiles();


  // let row = 3;
  let fileRichText = []

  while (files.hasNext()) {
    const file = files.next();

    let richTextTemp = SpreadsheetApp.newRichTextValue().setText(file.getName()).setLinkUrl(file.getUrl()).build();
    fileRichText.push([richTextTemp])
  }

  sheet.getRange(4, 2, fileRichText.length, 1).setRichTextValues(fileRichText)
}



function listLicenseFilesInFolderFromA1Url() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("License Documents Folder");

  const folder = DriveApp.getFolderById(LICENSE_FOLDER_ID);
  const files = folder.getFiles();


  // let row = 3;
  let fileRichText = []

  while (files.hasNext()) {
    const file = files.next();

    let richTextTemp = SpreadsheetApp.newRichTextValue().setText(file.getName()).setLinkUrl(file.getUrl()).build();
    fileRichText.push([richTextTemp])
  }

  sheet.getRange(4, 2, fileRichText.length, 1).setRichTextValues(fileRichText)
}


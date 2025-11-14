



const MASTER_TAX_DOC_SHEET = "Master Tax Documents Folder"
const LICENSE_DOC_SHEET = "License Documents Folder"



function onEidtInstall(e) {
  const ss = e.source;
  const sheet = ss.getActiveSheet();


  const range = e.range;

  const row = range.getRow();
  const col = range.getColumn();

  const value = e.value;

  const sheetName = sheet.getSheetName()
  if ((sheetName == MASTER_TAX_DOC_SHEET || sheetName == LICENSE_DOC_SHEET) && row > 2 && col == 4 && value != "") {
    let richTextValue = sheet.getRange(row, 2).getRichTextValue();
    let fileUrl = richTextValue.getLinkUrl();
    const folderIdMatch = fileUrl.match(/[-\w]{25,}/);
    let file = DriveApp.getFileById(folderIdMatch);
    file.setName(value)

    let newRich = SpreadsheetApp.newRichTextValue().setText(value).setLinkUrl(fileUrl).build()
    sheet.getRange(row, 2).setRichTextValue(newRich);

  }


  onEditSort(e)

}

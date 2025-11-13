function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Drive Tools')
    .addItem('Add New File Links from Folder in A1', 'appendNewFileLinksToBottom')
    .addToUi();
}

function appendNewFileLinksToBottom() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const folderUrl = sheet.getRange("A1").getValue();

  if (!folderUrl || typeof folderUrl !== "string") {
    SpreadsheetApp.getUi().alert("Cell A1 must contain a valid Google Drive folder URL.");
    return;
  }

  const folderIdMatch = folderUrl.match(/[-\w]{25,}/);
  if (!folderIdMatch) {
    SpreadsheetApp.getUi().alert("Unable to extract folder ID from the URL in A1.");
    return;
  }

  const folderId = folderIdMatch[0];
  const folder = DriveApp.getFolderById(folderId);
  const files = folder.getFiles();

  // Get all existing rich text URLs starting from row 2
  let existingUrls = [];
  const lastRow = sheet.getLastRow();
  if (lastRow >= 2) {
    const existingRange = sheet.getRange(2, 1, lastRow - 1, 1);
    const existingRichTextValues = existingRange.getRichTextValues();
    existingUrls = existingRichTextValues
      .map(row => row[0] && row[0].getLinkUrl())
      .filter(url => url);
  }

  const newRichTextRows = [];

  while (files.hasNext()) {
    const file = files.next();
    const fileUrl = file.getUrl();
    const fileName = file.getName();

    if (!existingUrls.includes(fileUrl)) {
      const richText = SpreadsheetApp.newRichTextValue()
        .setText(fileName)
        .setLinkUrl(fileUrl)
        .build();

      newRichTextRows.push([richText]);
    }
  }

  if (newRichTextRows.length > 0) {
    const startRow = sheet.getLastRow() + 1;
    const insertRange = sheet.getRange(startRow, 1, newRichTextRows.length, 1);
    insertRange.setRichTextValues(newRichTextRows);
    insertRange.setFontColor("black");
    insertRange.setFontLine("none");
  }

  SpreadsheetApp.getUi().alert(`Added ${newRichTextRows.length} new file link(s) from the folder.`);
}

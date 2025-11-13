function appendTextToDriveFileNames() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const lastRow = sheet.getLastRow();
  const colARange = sheet.getRange(1, 1, lastRow).getValues(); // Column A
  const colERange = sheet.getRange(1, 5, lastRow).getValues(); // Column E

  for (let i = 0; i < lastRow; i++) {
    const appendText = colARange[i][0];
    const fileUrl = colERange[i][0];

    if (fileUrl && appendText) {
      const fileId = extractFileId(fileUrl);
      if (fileId) {
        try {
          const file = DriveApp.getFileById(fileId);
          const originalName = file.getName();
          const newName = `${originalName} ${appendText}`;
          file.setName(newName);
        } catch (e) {
          Logger.log(`Failed to rename file at row ${i + 1}: ${e.message}`);
        }
      }
    }
  }
}

// Helper function to extract file ID from Google Drive URL
function extractFileId(url) {
  const match = url.match(/[-\w]{25,}/);
  return match ? match[0] : null;
}

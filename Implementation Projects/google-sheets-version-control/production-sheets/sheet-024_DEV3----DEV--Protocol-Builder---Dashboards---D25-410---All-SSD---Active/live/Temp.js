





function updateAddDocumentTab() {

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();

  const allRichData = sheet.getRange(1, 4, sheet.getLastRow(), 1).getRichTextValues();

  //const allHeader = ["File Name (Hyperlinked)", "Relevant Date", "Notes", "Rename"];


  // for (var i = 2; i < allRichData.length; i++) {

  for (var i = 1; i < allRichData.length; i++) {
    Logger.log(i)
    if (allRichData[i][0].getLinkUrl() != null) {
      const fileMatch = String(allRichData[i][0].getLinkUrl()).match(/[-\w]{25,}/);
      let fileId = fileMatch ? fileMatch[0] : null;

      DriveApp.getFileById(fileId).setTrashed(true)
      sheet.getRange(i + 1, 4).clearContent()

    }

  }
}





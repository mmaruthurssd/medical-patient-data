//Project Name - Project Sheet - ID # - Status



function updateAddDocumentTab() {


  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();

  const allRichData = sheet.getRange(1, 3, sheet.getLastRow(), 2).getRichTextValues();



  const allHeader = ["File Name (Hyperlinked)", "Relevant Date", "Notes", "Rename"];


  for (var i = 1; i < allRichData.length; i++) {

    if (allRichData[i][0].getLinkUrl() != null && allRichData[i][1].getLinkUrl() != null) {
      const fileMatch = String(allRichData[i][0].getLinkUrl()).match(/[-\w]{25,}/);
      let fileId = fileMatch ? fileMatch[0] : null;
      let tempSS = SpreadsheetApp.openById(fileId);
      let tempSheet = tempSS.getSheetByName("Documents");
      Utilities.sleep(1000)
      SpreadsheetApp.flush()
      if (!tempSheet) {
        tempSheet = tempSS.insertSheet("Documents");
      }

      tempSheet.getRange("A1").setRichTextValue(allRichData[i][1])
      tempSheet.getRange(2, 1, 1, allHeader.length).setValues([allHeader]);

    }

  }
}



function renameHyperlinksInColumns() {

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
  let headersObj = {};
  for (var i = 0; i < headers.length; i++) {
    headersObj[headers[i]] = i
  }


  const allData = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getDisplayValues();
  let allRichData = sheet.getRange(2, headersObj["Vendor Sheets"] + 1, sheet.getLastRow() - 1, 2).getRichTextValues();



  //for (var i = 0; i < allData.length; i++) {
  for (var i = 3; i < 4; i++) {

    try {
      let fileUrl = allRichData[i][0].getLinkUrl()
      const fileMatch = String(fileUrl).match(/[-\w]{25,}/);
      let fileId = fileMatch ? fileMatch[0] : null;


      let fileRichText = SpreadsheetApp.newRichTextValue().setText("").setLinkUrl(null).build()
      if (fileId != null) {
        const fileName = allData[i][headersObj["Vendor"]] + " - " + allData[i][headersObj["Vendor Type"]] + " -  Sheet - " + allData[i][headersObj["ID"]]
        DriveApp.getFolderById(fileId).setName(fileName)
        fileRichText = SpreadsheetApp.newRichTextValue().setText(fileName).setLinkUrl(fileUrl).build()
      }



      let folderUrl = allRichData[i][1].getLinkUrl()
      const folderMatch = String(folderUrl).match(/[-\w]{25,}/);
      let folderId = folderMatch ? folderMatch[0] : null;

      let folderRichText = SpreadsheetApp.newRichTextValue().setText("").setLinkUrl(null).build()
      if (folderId != null) {
        const folderName = allData[i][headersObj["Vendor"]] + " - " + allData[i][headersObj["Vendor Type"]] + " -  Folder - " + allData[i][headersObj["ID"]]
        //Logger.log(folderName)
        DriveApp.getFileById(folderId).setName(folderName)
        folderRichText = SpreadsheetApp.newRichTextValue().setText(folderName).setLinkUrl(folderUrl).build()
      }

      sheet.getRange(i + 2, headersObj["Vendor Sheets"] + 1, 1, 2).setRichTextValues([[fileRichText, folderRichText]])
    } catch (err) {
      Logger.log("Error in : " + i + " ---- " + err)
    }

  }

}





function updateTermiatedSheet() {

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();

  const allRichData = sheet.getRange(1, 30, sheet.getLastRow(), 1).getRichTextValues();

  const formula = `=COUNTIF(C2:C,"Yes")+COUNTIF(C2:C,"NA")`


  for (var i = 1; i < allRichData.length; i++) {

    if (allRichData[i][0].getLinkUrl() != null) {
      const fileMatch = String(allRichData[i][0].getLinkUrl()).match(/[-\w]{25,}/);
      let fileId = fileMatch ? fileMatch[0] : null;
      let tempSS = SpreadsheetApp.openById(fileId);
      let tempSheet = tempSS.getSheetByName("Termination Checklist");
      Utilities.sleep(1000)
      SpreadsheetApp.flush()
      if (tempSheet) {
        tempSheet.getRange("D1").setValue(formula)
      }

      //return

    }
  }
}






function updateAddDocumentTab() {


  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();

  const allRichData = sheet.getRange(1, 6, sheet.getLastRow(), 2).getRichTextValues();



  const allHeader = ["File Name (Hyperlinked)", "Relevant Date", "Notes", "Rename"];


  for (var i = 1; i < allRichData.length; i++) {

    if (allRichData[i][0].getLinkUrl() != null && allRichData[i][1].getLinkUrl() != null) {
      const fileMatch = String(allRichData[i][1].getLinkUrl()).match(/[-\w]{25,}/);
      let fileId = fileMatch ? fileMatch[0] : null;
      let tempSS = SpreadsheetApp.openById(fileId);
      let tempSheet = tempSS.getSheetByName("Documents");
      Utilities.sleep(1000)
      SpreadsheetApp.flush()
      if (!tempSheet) {
        tempSheet = tempSS.insertSheet("Documents");
      }

      tempSheet.getRange("A1").setRichTextValue(allRichData[i][0])
      tempSheet.getRange(2, 1, 1, allHeader.length).setValues([allHeader]);

    }

  }
}




//Project Name - Project Sheet - ID # - Status

function renameHyperlinksInColumns() {

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
  let headersObj = {};
  for (var i = 0; i < headers.length; i++) {
    headersObj[headers[i]] = i
  }


  const allData = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getDisplayValues();
  let allRichData = sheet.getRange(2, headersObj["Employee Name"] + 1, sheet.getLastRow() - 1, 4).getRichTextValues();



  //for (var i = 3; i < allData.length; i++) {
  for (var i = 2; i < 3; i++) {

    try {
      let fileUrl = allRichData[i][0].getLinkUrl()
      const fileMatch = String(fileUrl).match(/[-\w]{25,}/);
      let fileId = fileMatch ? fileMatch[0] : null;


      let fileRichText = SpreadsheetApp.newRichTextValue().setText("").setLinkUrl(null).build()
      if (fileId != null) {
        const fileName = allData[i][headersObj["Employee Name"]] + " -  Sheet - " + allData[i][headersObj["ID"]]
        DriveApp.getFolderById(fileId).setName(fileName)
        fileRichText = SpreadsheetApp.newRichTextValue().setText(fileName).setLinkUrl(fileUrl).build()
      }


      // let docUrl = allRichData[i][2].getLinkUrl()
      // const docMatch = String(docUrl).match(/[-\w]{25,}/);
      // let docId = docMatch ? docMatch[0] : null;

      // let docRichText = SpreadsheetApp.newRichTextValue().setText("").setLinkUrl(null).build()
      // if (docId != null) {
      //   const docName = allData[i][headersObj["Employee Name"]] + " -  Employee Document - " + allData[i][headersObj["ID"]]
      //   //Logger.log(folderName)
      //   DriveApp.getFileById(docId).setName(docName)
      //   docRichText = SpreadsheetApp.newRichTextValue().setText(docName).setLinkUrl(docUrl).build()
      // }



      // let folderUrl = allRichData[i][3].getLinkUrl()
      // const folderMatch = String(folderUrl).match(/[-\w]{25,}/);
      // let folderId = folderMatch ? folderMatch[0] : null;

      // let folderRichText = SpreadsheetApp.newRichTextValue().setText("").setLinkUrl(null).build()
      // if (folderId != null) {
      //   const folderName = allData[i][headersObj["Employee Name"]] + " -  Folder - " + allData[i][headersObj["ID"]]
      //   //Logger.log(folderName)
      //   DriveApp.getFileById(folderId).setName(folderName)
      //   folderRichText = SpreadsheetApp.newRichTextValue().setText(folderName).setLinkUrl(folderUrl).build()
      // }

      //sheet.getRange(i + 2, headersObj["Google Doc"] + 1, 1, 3).setRichTextValues([[docRichText, folderRichText, fileRichText]])

      sheet.getRange(i + 2, headersObj["Employee Sheet"] + 1).setRichTextValue(fileRichText)
    } catch (err) {
      Logger.log("Error in : " + i + " ---- " + err)
    }

  }

}









function processParentFolderUrls() {
  // Open the active spreadsheet
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sourceSheet = ss.getSheetByName('Employee List'); // Change 'Sheet1' to the name of your source sheet


  // Get all values and rich text in column C
  const range = sourceSheet.getRange('C4:C' + sourceSheet.getLastRow());
  const richTextValues = range.getRichTextValues();

  // Loop through the hyperlinks and process each one
  for (let i = 13; i < richTextValues.length; i++) {
    //for (let i = 1; i < 13; i++) {
    const richText = richTextValues[i][0];
    if (!richText) continue;

    const hyperlink = richText.getLinkUrl();
    if (!hyperlink) continue;

    try {

      Logger.log("Yes")

      const destSSId = getFileIdFromUrl(hyperlink);

      const file = DriveApp.getFileById(destSSId);
      const parentFolder = file.getParents().next();
      const parentFolderUrl = parentFolder.getUrl();

      // Set the hyperlink in Documents sheet cell A1
      const richTextParentUrl = SpreadsheetApp.newRichTextValue()
        .setText(parentFolder.getName())
        .setLinkUrl(parentFolderUrl)
        .build();


      const destSS = SpreadsheetApp.openById(destSSId)
      const documentSheet = destSS.getSheetByName('Documents');
      documentSheet.getRange('A1').setRichTextValue(richTextParentUrl);

      // Stop after first URL as A1 is a single cell
      //break;
    } catch (error) {
      Logger.log(`Failed to process hyperlink at row ${i + 2}: ${error.message}`);
    }
  }
}

function getFileIdFromUrl(url) {
  // Extract the file ID from the URL
  const regex = /\/d\/([a-zA-Z0-9-_]+)/;
  const match = url.match(regex);
  if (match && match[1]) {
    return match[1];
  } else {
    throw new Error('Invalid Google Drive file URL');
  }
}






































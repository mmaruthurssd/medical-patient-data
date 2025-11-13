







function createFolderAndSheet() {

  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const sheet = ss.getSheetByName("Master Outgoing Referral List (Main)");

  const headers = sheet.getRange(2, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
  let headersObj = {};
  for (var i = 0; i < headers.length; i++) {
    headersObj[headers[i]] = i
  }


  const allData = sheet.getRange(3, 1, sheet.getLastRow() - 2, sheet.getLastColumn()).getDisplayValues();
  //let allRichData = sheet.getRange(2, headersObj["Sheet"] + 1, sheet.getLastRow() - 1, 2).getRichTextValues();


  const outputFolder = DriveApp.getFolderById(ALL_FOLDERS_ID)



  let count = 0
  const folderSheet = ss.getSheetByName("Patient Sheets")

  for (var i = 0; i < allData.length; i++) {
    //for (var i = 1; i < 2; i++) {

    try {

      if (allData[i][headersObj["Sheet"]] == "" && allData[i][headersObj["Patient MRN"]] != "" && allData[i][headersObj["Patient Name"]] != "") {
        count++
        const folderName = allData[i][headersObj["Patient Name"]] + " - Folder - OUT-" + allData[i][headersObj["Patient MRN"]]
        let newFolder = outputFolder.createFolder(folderName)
        let folderRichText = SpreadsheetApp.newRichTextValue().setText(folderName).setLinkUrl(newFolder.getUrl()).build()



        const fileName = allData[i][headersObj["Patient Name"]] + " - Sheet - OUT-" + allData[i][headersObj["Patient MRN"]]
        let fileOutputFolder = DriveApp.getFolderById(newFolder.getId())
        let newFile = DriveApp.getFileById(SS_TEMPPLATE_ID).makeCopy(fileName, fileOutputFolder)
        SpreadsheetApp.openById(newFile.getId()).getSheetByName("Documents").getRange("A1").setRichTextValue(folderRichText)
        let fileRichText = SpreadsheetApp.newRichTextValue().setText(fileName).setLinkUrl(newFile.getUrl()).build()


        //sheet.getRange(i + 1, headersObj["Sheet"] + 1).setRichTextValue(fileRichText)
        //sheet.getRange(i + 1, headersObj["Folder"] + 1).setRichTextValue(folderRichText)



        let lastRow = folderSheet.getLastRow() + 1
        folderSheet.getRange(lastRow, 4, 1, 2).setRichTextValues([[fileRichText, folderRichText]])
        folderSheet.getRange(lastRow, 1, 1, 3).setValues([[allData[i][headersObj["Patient MRN"]], allData[i][headersObj["Patient Name"]], "OUT-" + allData[i][headersObj["Patient MRN"]]]])



        // if (count > 100) {
        //   break
        // }

      }


    } catch (err) {
      Logger.log("Error in : " + i + " ---- " + err)
    }

  }

}





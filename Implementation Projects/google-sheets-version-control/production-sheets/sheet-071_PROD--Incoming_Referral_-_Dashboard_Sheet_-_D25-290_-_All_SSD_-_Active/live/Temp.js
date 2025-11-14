


//Project Name - Project Sheet - ID # - Status

function renameHyperlinksInColumns() {

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
  let headersObj = {};
  for (var i = 0; i < headers.length; i++) {
    headersObj[headers[i]] = i
  }


  const allData = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getDisplayValues();
  let allRichData = sheet.getRange(2, headersObj["Sheet"] + 1, sheet.getLastRow() - 1, 2).getRichTextValues();



  for (var i = 4; i < allData.length; i++) {
    //for (var i = 1; i < 4; i++) {

    try {
      let fileUrl = allRichData[i][0].getLinkUrl()
      const fileMatch = String(fileUrl).match(/[-\w]{25,}/);
      let fileId = fileMatch ? fileMatch[0] : null;


      let fileRichText = SpreadsheetApp.newRichTextValue().setText("").setLinkUrl(null).build()
      if (fileId != null) {
        const fileName = allData[i][headersObj["Patient Name"]] + " - Sheet - INC-" + allData[i][headersObj["Patient ID"]]
        DriveApp.getFolderById(fileId).setName(fileName)
        fileRichText = SpreadsheetApp.newRichTextValue().setText(fileName).setLinkUrl(fileUrl).build()
      }



      let folderUrl = allRichData[i][1].getLinkUrl()
      const folderMatch = String(folderUrl).match(/[-\w]{25,}/);
      let folderId = folderMatch ? folderMatch[0] : null;

      let folderRichText = SpreadsheetApp.newRichTextValue().setText("").setLinkUrl(null).build()
      if (folderId != null) {
        const folderName = allData[i][headersObj["Patient Name"]] + " - Folder - INC-" + allData[i][headersObj["Patient ID"]]
        //Logger.log(folderName)
        DriveApp.getFileById(folderId).setName(folderName)
        folderRichText = SpreadsheetApp.newRichTextValue().setText(folderName).setLinkUrl(folderUrl).build()
      }

      sheet.getRange(i + 2, headersObj["Sheet"] + 1, 1, 2).setRichTextValues([[fileRichText, folderRichText]])
    } catch (err) {
      Logger.log("Error in : " + i + " ---- " + err)
    }

  }

}














































// function createFolderAndSheet() {

//   const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Master Incoming Referral List");

//   const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
//   let headersObj = {};
//   for (var i = 0; i < headers.length; i++) {
//     headersObj[headers[i]] = i
//   }


//   const allData = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getDisplayValues();
//   //let allRichData = sheet.getRange(2, headersObj["Sheet"] + 1, sheet.getLastRow() - 1, 2).getRichTextValues();


//   const outputFolder = DriveApp.getFolderById("1LX5UgBmXF7ONns2qpzWDzlqDbhqsbfHa")



//   let count = 0

//   for (var i = 0; i < allData.length; i++) {
//     //for (var i = 1; i < 20; i++) {

//     try {

//       if (allData[i][headersObj["Sheet"]] == "" && allData[i][headersObj["Patient ID"]] != "" && allData[i][headersObj["Patient Name"]] != "" && (allData[i][headersObj["Referral  Status"]] == "Scheduled" || allData[i][headersObj["Referral  Status"]].includes("Attempt"))) {
//         count++
//         const folderName = allData[i][headersObj["Patient Name"]] + " - Folder - INC-" + allData[i][headersObj["Patient ID"]]
//         let newFolder = outputFolder.createFolder(folderName)
//         let folderRichText = SpreadsheetApp.newRichTextValue().setText(folderName).setLinkUrl(newFolder.getUrl()).build()
//         sheet.getRange(i + 1, headersObj["Folder"] + 1).setRichTextValue(folderRichText)


//         const fileName = allData[i][headersObj["Patient Name"]] + " - Sheet - INC-" + allData[i][headersObj["Patient ID"]]
//         let fileOutputFolder = DriveApp.getFolderById(newFolder.getId())
//         let newFile = DriveApp.getFileById("1lQhHBun3EN3hXcd6DKgQYfUgZDt42Ws5ArGF4VmfLLc").makeCopy(fileName, fileOutputFolder)
//         SpreadsheetApp.openById(newFile.getId()).getSheetByName("Documents").getRange("A1").setRichTextValue(folderRichText)
//         let fileRichText = SpreadsheetApp.newRichTextValue().setText(fileName).setLinkUrl(newFile.getUrl()).build()
//         sheet.getRange(i + 1, headersObj["Sheet"] + 1).setRichTextValue(fileRichText)

//         if (count > 100) {
//           break
//         }

//       }


//     } catch (err) {
//       Logger.log("Error in : " + i + " ---- " + err)
//     }

//   }

// }
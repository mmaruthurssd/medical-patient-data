function addingDocTabToSS() {

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  let allRichData = sheet.getRange(1, 2, sheet.getLastRow(), 2).getRichTextValues();


  for (var i = 1; i < allRichData.length; i++) {
    //for (var i = 79; i < 80; i++) {

    let url = allRichData[i][0].getLinkUrl();
    if (url != null) {
      try {
        const fileMatch = String(url).match(/[-\w]{25,}/);
        let fileId = fileMatch ? fileMatch[0] : null;

        const destSS = SpreadsheetApp.openById(fileId);
        let destSheet = destSS.getSheetByName("Documents")
        if (destSheet == null) {
          destSheet = destSS.insertSheet("Documents");
        }

        destSheet.getRange("A1").setRichTextValue(allRichData[i][1])

        try {
          destSheet.getRange(2, 1, 1, destSheet.getLastColumn()).clearContent();
        } catch (tempErr) { }
        let headers = ["File Name (Hyperlinked)", "Relevant Date", "Notes"]
        destSheet.getRange(2, 1, 1, headers.length).setValues([headers])
        //Logger.log(headers)
        //Logger.log(i)
      } catch (err) { Logger.log(i + " Error: " + err) }

    }
  }
}

function getDocUrls() {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const sheet = ss.getSheetByName("Documents")

  let allData = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getRichTextValues();
  let headers = sheet.getRange(2, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];

  let fileNameHyperCol = headers.indexOf("File Name (Hyperlinked)")
  let fileUrlCol = headers.indexOf("File Urls")


  for (var i = 2; i < allData.length; i++) {
    let nameText = allData[i][fileNameHyperCol].getText();
    if (nameText) {
      let urlText = allData[i][fileUrlCol].getText();

      // Logger.log(urlText)
      // continue

      if (urlText == null || urlText=="") {
        let url = allData[i][fileNameHyperCol].getLinkUrl();

        sheet.getRange(i + 1, fileUrlCol + 1).setValue(url)
      }
    }
  }
}

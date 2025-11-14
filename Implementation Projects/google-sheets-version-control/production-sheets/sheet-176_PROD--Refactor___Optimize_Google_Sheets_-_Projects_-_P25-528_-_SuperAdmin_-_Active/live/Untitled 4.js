








function myRichFunction() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();

  const richText = sheet.getRange("A2:A237").getRichTextValues();

  //richText[][]

  let urls = [];
  richText.forEach(r => {
    urls.push([r[0].getLinkUrl()])


  })

  Logger.log(urls)

  sheet.getRange(2, 4, urls.length, 1).setValues(urls)
}




function extractSheetId_(sheetIdOrUrl) {
  if (!sheetIdOrUrl) return null;
  // If it looks like a raw Drive file ID, just return it.
  if (/^[a-zA-Z0-9_-]{20,}$/.test(sheetIdOrUrl)) return sheetIdOrUrl.trim();

  // Try to parse from a URL.
  const m = String(sheetIdOrUrl).match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  return m ? m[1] : null;
}




function deleteAllSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();

  const richText = sheet.getRange("F2:F239").getRichTextValues();

  //richText[][]

  let urls = [];
  richText.forEach(r => {
    //urls.push([r[0].getLinkUrl()])

    let ssId = extractSheetId_(r[0].getLinkUrl())
    Logger.log(ssId)

    if (ssId) {
      DriveApp.getFolderById(ssId).setTrashed(true)
    }

  })

  //Logger.log(urls)

  //sheet.getRange(2, 12, urls.length, 1).setValues(urls)
}









function addIdsToTheSheet(sheet) {
  // const ss = SpreadsheetApp.getActiveSpreadsheet();
  // const sheet = ss.getSheetByName("Google Sheets");

  const allRichData = sheet.getRange("L1:L").getRichTextValues();
  let ids = sheet.getRange("P1:P").getValues();

  allRichData.forEach((rich, index) => {

    let url = rich[0].getLinkUrl();
    if (url) {
      const fileMatch = String(url).match(/[-\w]{25,}/);
      let fileId = fileMatch ? fileMatch[0] : "";
      ids[index][0] = fileId
    }
  })


  sheet.getRange(1, 17, ids.length, 1).setValues(ids)

}




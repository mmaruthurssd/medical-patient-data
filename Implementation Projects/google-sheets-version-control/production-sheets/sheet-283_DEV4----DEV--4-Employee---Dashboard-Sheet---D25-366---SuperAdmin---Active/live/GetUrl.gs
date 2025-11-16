


function getRichTextUrlsEmployee() {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const sheet = ss.getSheetByName("Employee List");

  let richText = sheet.getRange("C1:C").getRichTextValues();

  for (var i = 3; i < richText.length; i++) {

    let url = richText[i][0].getLinkUrl();
    if (url && url.includes("https://docs.google.com/spreadsheets")) {

      try {
        let ss = SpreadsheetApp.openByUrl(url);

        const onbSheetId = ss.getSheetByName("Onboarding Checklist").getSheetId()
        const terSheetId = ss.getSheetByName("Termination Checklist").getSheetId();


        let onbTempUrl = url.split("usp=")[0] + "gid=" + onbSheetId + "#gid=" + onbSheetId
        let terTempUrl = url.split("usp=")[0] + "gid=" + terSheetId + "#gid=" + terSheetId

        sheet.getRange(i + 1, 29).setValue(onbTempUrl)
        sheet.getRange(i + 1, 30).setValue(terTempUrl)
      } catch (err) {
        Logger.log(err)
      }

    }
  }

}







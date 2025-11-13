


const DOCUMENTS_LOG_SHEET_NAME = "Documents Email Log"



/**
 * this is the main function of sending all paychecks via api call
 */
function sendEmailApiCall() {

  let data = {
    "user": Session.getActiveUser(),
  };

  // Web app url to process and send paychecks email
  let request = {
    "method": "post",
    "muteHttpExceptions": true,
    "headers": {
      "Authorization": "Bearer " + ScriptApp.getOAuthToken()
    },
    "payload": data
  };

  try {
    let response = UrlFetchApp.fetch(WEBAPP_URL, request);
    Logger.log(response);
    Logger.log("SUCCESSFULL");
  }
  catch (e) {
    Logger.log(e.message);
  }




}


function sendEmailProcess() {

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const sheet = ss.getActiveSheet();


  const recipents = sheet.getRange("D4").getValue()
  const subject = sheet.getRange("D6").getValue()
  const body = sheet.getRange("C9").getValue()


  const allFiles = sheet.getRange(23, 1, sheet.getLastRow() - 22, 6).getValues();
  const richFiles = sheet.getRange(23, 1, sheet.getLastRow() - 22, 1).getRichTextValues();


  const attachments = [];
  let filesList = []
  for (var i = 0; i < allFiles.length; i++) {

    if (allFiles[i][5] == true || allFiles[i][5] == "TRUE") {

      let fileUrl = richFiles[i][0].getLinkUrl()
      let fileId = null

      if (fileUrl != null) {
        if (fileUrl.includes("?id=")) {
          fileId = fileUrl.split("?id=")[1].split("/")[0]

        } else if (fileUrl.includes("/d/")) {
          fileId = fileUrl.split("/d/")[1].split("/")[0]
        }

      } else {
        fileUrl = allFiles[i][0]

        if (fileUrl.includes("?id=")) {
          fileId = fileUrl.split("?id=")[1].split("/")[0]

        } else if (fileUrl.includes("/d/")) {
          fileId = fileUrl.split("/d/")[1].split("/")[0]
        }


      }


      if (fileId) {

        filesList.push(allFiles[i][4])
        const file = DriveApp.getFileById(fileId);
        attachments.push(file.getBlob());
      }

      sheet.getRange(23 + i, 6).setValue(false)



    }

  }


  GmailApp.sendEmail(recipents.replace(/\s+/g, ""), subject, body, {
    attachments: attachments
  });


  sheet.getRange("D4").clearContent()
  sheet.getRange("D6").clearContent()
  sheet.getRange("C9").clearContent()


  const docLogSheet = ss.getSheetByName(DOCUMENTS_LOG_SHEET_NAME);

  let logRow = [new Date(), Session.getActiveUser(), recipents, subject, body, filesList.join(", ")]
  docLogSheet.getRange(docLogSheet.getLastRow() + 1, 1, 1, logRow.length).setValues([logRow])

  docLogSheet.getRange(2, 1, docLogSheet.getLastRow() - 1, docLogSheet.getLastColumn()).sort([{ column: 1, ascending: false }])


}





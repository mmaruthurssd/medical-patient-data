
const EMAIL_STAFF_SHEET = "Email to Staff"

const WEBAPP_URL = "https://script.google.com/a/macros/ssdspc.com/s/AKfycby_rttuTdBhCTkutxMPStrPnLo-bYuXN0f6ZN6o-kIV4AmsLIx-iN6Sag71nsTySnWP/exec"


function sendEmailsToSelectedApiCall() {
  let ui = SpreadsheetApp.getUi()
  let result = ui.alert("Please confirm sending email to selected employee.", SpreadsheetApp.getUi().ButtonSet.OK_CANCEL);

  if (result === SpreadsheetApp.getUi().Button.OK) {
    SpreadsheetApp.getActive().toast("Processing …");

  } else {
    SpreadsheetApp.getActive().toast("Cancelled");
    return
  }

  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(EMAIL_STAFF_SHEET);


  let richText = sheet.getRange("A1").getRichTextValue();
  let docID = getDocIdFromUrl(richText.getLinkUrl())

  if (docID == null) {
    ui.alert("Invalid\nNo Document Found!")
    return
  }



  try {

    let data = {
      "process": "sendEmailToSelected",
    };
    // Web app url to process and send form initial emails
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
      //Logger.log(response);
      //Logger.log("SUCCESSFULL");

      if (response == "Error") {
        ui.alert("Sending emails to selected employee failed.")
        return
      } else {
        ui.alert("Sending emails to selected employee was successful.");
      }
    }
    catch (e) {
      Logger.log(e.message);
    }



  } catch (err) {
    Logger.log(JSON.stringify(err));
    ui.alert("Sending emails failed. \nError:\n" + err.message);
  }

}




function sendEmailToSelected() {



  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(EMAIL_STAFF_SHEET);


  let richText = sheet.getRange("A1").getRichTextValue();
  let docID = getDocIdFromUrl(richText.getLinkUrl())

  let emailContent = getDocContent(docID)


  let allData = sheet.getRange(6, 1, sheet.getLastRow() - 5, sheet.getLastColumn()).getValues()

  allData.forEach((row, index) => {
    try {
      if (row[4] == true || row[4] == "TRUE") {
        GmailApp.sendEmail(row[1], emailContent.subject, "", {
          htmlBody: emailContent.htmlBody
        })
        sheet.getRange(index + 6, 5).setValue(false)
      }
    } catch (err) { Logger.log(err) }
  })


}







function sendEmailsToAllApiCall() {
  let ui = SpreadsheetApp.getUi()
  let result = ui.alert("Please confirm sending email to all employee.", SpreadsheetApp.getUi().ButtonSet.OK_CANCEL);

  if (result === SpreadsheetApp.getUi().Button.OK) {
    SpreadsheetApp.getActive().toast("Processing …");

  } else {
    SpreadsheetApp.getActive().toast("Cancelled");
    return
  }

  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(EMAIL_STAFF_SHEET);


  let richText = sheet.getRange("A1").getRichTextValue();
  let docID = getDocIdFromUrl(richText.getLinkUrl())

  if (docID == null) {
    ui.alert("Invalid\nNo Document Found!")
    return
  }



  try {

    let data = {
      "process": "sendEmailToAll",
    };
    // Web app url to process and send form initial emails
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

      if (response == "Error") {
        ui.alert("Sending emails to all employee failed.")
        return
      } else {
        ui.alert("Sending emails to all employee was successful.");
      }
    }
    catch (e) {
      Logger.log(e.message);
    }



  } catch (err) {
    Logger.log(JSON.stringify(err));
    ui.alert("Sending emails failed. \nError:\n" + err.message);
  }

}



function sendEmailToAll() {





  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(EMAIL_STAFF_SHEET);


  let richText = sheet.getRange("A1").getRichTextValue();
  let docID = getDocIdFromUrl(richText.getLinkUrl())


  let emailContent = getDocContent(docID)


  let allData = sheet.getRange(6, 1, sheet.getLastRow() - 5, sheet.getLastColumn()).getValues()

  allData.forEach((row, index) => {
    try {
      if (row[1] != "" || row[1] != null) {
        GmailApp.sendEmail(row[1], emailContent.subject, "", {
          htmlBody: emailContent.htmlBody
        })
        // GmailApp.sendEmail("Rashid_khan143@yahoo.com", emailContent.subject, "", {
        //   htmlBody: emailContent.htmlBody
        // })
        sheet.getRange(index + 6, 5).setValue(false)
      }
    } catch (err) { Logger.log(err) }
  })

}




function getDocContent(docID) {


  let doc = DocumentApp.openById(docID);
  let body = doc.getBody();

  let paragraphs = body.getParagraphs();



  let subjectArr = [];
  let introArr = [];
  let keyPointsArr = [];
  let followupArr = [];

  for (var i = 0; i < paragraphs.length; i++) {

    let att = paragraphs[i].getAttributes();


    if (att["HEADING"] === DocumentApp.ParagraphHeading.HEADING2 && paragraphs[i].getText() == "Email Subject Line") {

      //Logger.log("Yes")
      for (var j = i + 1; j < paragraphs.length; j++) {
        att = paragraphs[j].getAttributes();
        if (att["HEADING"] === DocumentApp.ParagraphHeading.HEADING2) break

        let text = paragraphs[j].getText()
        if (text != "" && text != null) {
          subjectArr.push([text])
        }

      }

    } else if (att["HEADING"] === DocumentApp.ParagraphHeading.HEADING2 && paragraphs[i].getText() == "Email Introduction") {
      for (var j = i + 1; j < paragraphs.length; j++) {
        att = paragraphs[j].getAttributes();
        if (att["HEADING"] === DocumentApp.ParagraphHeading.HEADING2) break

        let text = paragraphs[j].getText()
        if (text != "" && text != null) {
          introArr.push([text])
        }

      }

    } else if (att["HEADING"] === DocumentApp.ParagraphHeading.HEADING2 && paragraphs[i].getText() == "Key Points / Take-Aways") {
      for (var j = i + 1; j < paragraphs.length; j++) {
        att = paragraphs[j].getAttributes();
        if (att["HEADING"] === DocumentApp.ParagraphHeading.HEADING2) break

        let text = paragraphs[j].getText()
        if (text != "" && text != null) {
          keyPointsArr.push([text])
        }

      }

    } else if (att["HEADING"] === DocumentApp.ParagraphHeading.HEADING2 && paragraphs[i].getText() == "Things admin will follow up on") {
      for (var j = i + 1; j < paragraphs.length; j++) {
        att = paragraphs[j].getAttributes();
        if (att["HEADING"] === DocumentApp.ParagraphHeading.HEADING2) break

        let text = paragraphs[j].getText()
        if (text != "" && text != null) {
          followupArr.push([text])
        }

      }

    }


  }



  let htmlBody = ""

  for (var i = 0; i < introArr.length; i++) {
    htmlBody += "<p>" + introArr[i][0] + "</p>"
  }

  if (keyPointsArr.length > 0) {
    htmlBody += "<h3>Key Points / Take-Aways</h3>"
    for (var i = 0; i < keyPointsArr.length; i++) {
      htmlBody += "<p>" + (i + 1) + "- " + keyPointsArr[i][0] + "</p>"
    }
  }


  if (followupArr.length > 0) {
    htmlBody += "<h3>Things admin will follow up on</h3>"
    for (var i = 0; i < followupArr.length; i++) {
      htmlBody += "<p>" + (i + 1) + "- " + followupArr[i][0] + "</p>"
    }
  }


  htmlBody += "<p><br><br>We value your feedback! If you have any anonymous suggestions or ideas you'd like to share, please feel free to use the Google Form linked below. Your input helps us improve, and your responses will remain completely anonymous.<br><br>https://docs.google.com/forms/d/e/1FAIpQLSfZIB7QbqCQ6fSTPEFw8waHS0QYvzlKQyOLsm7I6Wh8VqjZ9g/viewform<br><br>Thank you for your contribution!</p>"

  let emailContent = {
    subject: subjectArr[0][0],
    htmlBody: htmlBody,
  }


  return emailContent
}


















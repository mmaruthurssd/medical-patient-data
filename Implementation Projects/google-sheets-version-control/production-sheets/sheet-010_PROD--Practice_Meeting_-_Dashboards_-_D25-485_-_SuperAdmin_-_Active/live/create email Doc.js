
const PM_SUMM_EMAIL_FOLDER = "1pmPJyqHu4kTmsvD5yi8_isqZ5fVfAJxt"



const PM_SUMM_EMAIL_STAFF_SHEET = "Post-Meeting Summary Email to Staff (Main)"




//PM_SUBJECT
//PM_EMAIL_INTRO
//PM_KEY_POINTS
//PM_FOLLOWUP


function createEmailDoc() {


  let ui = SpreadsheetApp.getUi()
  // let result = ui.alert("Please confirm Creating the document.", SpreadsheetApp.getUi().ButtonSet.OK_CANCEL);

  // if (result === SpreadsheetApp.getUi().Button.OK) {
  //   SpreadsheetApp.getActive().toast("Processing …");

  // } else {
  //   SpreadsheetApp.getActive().toast("Cancelled");
  //   return
  // }


  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(PM_SUMM_EMAIL_STAFF_SHEET);

  let date = sheet.getRange("B3").getDisplayValue()

  let subject = sheet.getRange("PM_SUBJECT").getValues()
  let intro = sheet.getRange("PM_EMAIL_INTRO").getValues()
  let keyPoints = sheet.getRange("PM_KEY_POINTS").getValues()
  let followup = sheet.getRange("PM_FOLLOWUP").getValues()

  let folder = DriveApp.getFolderById(PM_SUMM_EMAIL_FOLDER)
  let doc = DocumentApp.create(date + " Post-Meeting Summary")



  let body = doc.getBody();


  let subjectTitle = body.appendParagraph(subject[0][0])
  subjectTitle.setHeading(DocumentApp.ParagraphHeading.HEADING2);
  for (var i = 1; i < subject.length; i++) {

    if (subject[i][0] != "" && subject[i][0] != null) {
      body.appendParagraph(subject[i][0])
    }
  }


  let introTitle = body.appendParagraph(intro[0][0])
  introTitle.setHeading(DocumentApp.ParagraphHeading.HEADING2);
  for (var i = 1; i < intro.length; i++) {

    if (intro[i][0] != "" && intro[i][0] != null) {
      body.appendParagraph(intro[i][0])
    }
  }


  let keyPointsTitle = body.appendParagraph(keyPoints[0][0])
  keyPointsTitle.setHeading(DocumentApp.ParagraphHeading.HEADING2);
  for (var i = 1; i < keyPoints.length; i++) {
    if (keyPoints[i][0] != "" && keyPoints[i][0] != null) {
      body.appendParagraph(keyPoints[i][0])
    }
  }


  let followupTitle = body.appendParagraph(followup[0][0])
  followupTitle.setHeading(DocumentApp.ParagraphHeading.HEADING2);
  for (var i = 1; i < followup.length; i++) {
    if (followup[i][0] != "" && followup[i][0] != null) {
      body.appendParagraph(followup[i][0])
    }
  }

  doc.saveAndClose()

  let docFile = DriveApp.getFileById(doc.getId());
  docFile.moveTo(folder)



  sheet.appendRow([new Date(), "", docFile.getUrl()])

  let richTextValue = SpreadsheetApp.newRichTextValue()
    .setText(docFile.getName())
    .setLinkUrl(docFile.getUrl())
    .build();
  sheet.getRange(sheet.getLastRow(), 3).setRichTextValue(richTextValue)



  sheet.getRange(42, 1, sheet.getLastRow() - 41, sheet.getLastColumn()).sort([{ column: 1, ascending: false }])

}







function readDoc() {


  let ui = SpreadsheetApp.getUi()
  // let result = ui.alert("Please confirm reading the selected Document.", SpreadsheetApp.getUi().ButtonSet.OK_CANCEL);

  // if (result === SpreadsheetApp.getUi().Button.OK) {
  //   SpreadsheetApp.getActive().toast("Processing …");

  // } else {
  //   SpreadsheetApp.getActive().toast("Cancelled");
  //   return
  // }



  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(PM_SUMM_EMAIL_STAFF_SHEET);

  let subject = sheet.getRange("PM_SUBJECT").getValues()
  let intro = sheet.getRange("PM_EMAIL_INTRO").getValues()
  let keyPoints = sheet.getRange("PM_KEY_POINTS").getValues()
  let followup = sheet.getRange("PM_FOLLOWUP").getValues()



  let docUrl = sheet.getRange("C1").getValue();


  let docID = getDocIdFromUrl(docUrl)

  if (docID == null) {
    let richText = sheet.getRange("C1").getRichTextValue();

    docID = getDocIdFromUrl(richText.getLinkUrl())
    if (docID == null) {
      ui.alert("Invalid\nNo Document Found!")
      return
    }
  }

  let doc = DocumentApp.openById(docID);
  let body = doc.getBody();

  let paragraphs = body.getParagraphs();



  let subjectArr = [];
  let introArr = [];
  let keyPointsArr = [];
  let followupArr = [];

  for (var i = 0; i < paragraphs.length; i++) {

    let att = paragraphs[i].getAttributes();


    if (att["HEADING"] === DocumentApp.ParagraphHeading.HEADING2 && paragraphs[i].getText() == subject[0][0]) {

      //Logger.log("Yes")
      for (var j = i + 1; j < paragraphs.length; j++) {
        att = paragraphs[j].getAttributes();
        if (att["HEADING"] === DocumentApp.ParagraphHeading.HEADING2) break

        let text = paragraphs[j].getText()
        if (text != "" && text != null) {
          subjectArr.push([text])
        }

      }

    } else if (att["HEADING"] === DocumentApp.ParagraphHeading.HEADING2 && paragraphs[i].getText() == intro[0][0]) {
      for (var j = i + 1; j < paragraphs.length; j++) {
        att = paragraphs[j].getAttributes();
        if (att["HEADING"] === DocumentApp.ParagraphHeading.HEADING2) break

        let text = paragraphs[j].getText()
        if (text != "" && text != null) {
          introArr.push([text])
        }

      }

    } else if (att["HEADING"] === DocumentApp.ParagraphHeading.HEADING2 && paragraphs[i].getText() == keyPoints[0][0]) {
      for (var j = i + 1; j < paragraphs.length; j++) {
        att = paragraphs[j].getAttributes();
        if (att["HEADING"] === DocumentApp.ParagraphHeading.HEADING2) break

        let text = paragraphs[j].getText()
        if (text != "" && text != null) {
          keyPointsArr.push([text])
        }

      }

    } else if (att["HEADING"] === DocumentApp.ParagraphHeading.HEADING2 && paragraphs[i].getText() == followup[0][0]) {
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




  let subjectRow = sheet.getRange("PM_SUBJECT").getRow()
  let introRow = sheet.getRange("PM_EMAIL_INTRO").getRow()
  let keyPointsRow = sheet.getRange("PM_KEY_POINTS").getRow()
  let followupRow = sheet.getRange("PM_FOLLOWUP").getRow()

  sheet.getRange(subjectRow + 1, 1, subject.length - 1, 1).clearContent()
  sheet.getRange(introRow + 1, 1, intro.length - 1, 1).clearContent()
  sheet.getRange(keyPointsRow + 1, 1, keyPoints.length - 1, 1).clearContent()
  sheet.getRange(followupRow + 1, 1, followup.length - 1, 1).clearContent()


  if (subjectArr.length > 0) {
    sheet.getRange(subjectRow + 1, 1, subjectArr.length, 1).setValues(subjectArr)
  }

  if (introArr.length > 0) {
    sheet.getRange(introRow + 1, 1, introArr.length, 1).setValues(introArr)
  }

  if (keyPointsArr.length > 0) {
    sheet.getRange(keyPointsRow + 1, 1, keyPointsArr.length, 1).setValues(keyPointsArr)
  }

  if (followupArr.length > 0) {
    sheet.getRange(followupRow + 1, 1, followupArr.length, 1).setValues(followupArr)
  }



  let docName = doc.getName();

  let docDate = docName.split(" ")[0]

  sheet.getRange("B3").setValue(docDate)

}







function updateDoc() {

  let ui = SpreadsheetApp.getUi()
  // let result = ui.alert("Please confirm updating the selected Document.", SpreadsheetApp.getUi().ButtonSet.OK_CANCEL);

  // if (result === SpreadsheetApp.getUi().Button.OK) {
  //   SpreadsheetApp.getActive().toast("Processing …");

  // } else {
  //   SpreadsheetApp.getActive().toast("Cancelled");
  //   return
  // }


  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(PM_SUMM_EMAIL_STAFF_SHEET);

  let date = sheet.getRange("B3").getDisplayValue()
  let previousName = sheet.getRange("B1").getValue()

  let subject = sheet.getRange("PM_SUBJECT").getValues()
  let intro = sheet.getRange("PM_EMAIL_INTRO").getValues()
  let keyPoints = sheet.getRange("PM_KEY_POINTS").getValues()
  let followup = sheet.getRange("PM_FOLLOWUP").getValues()



  let richText = sheet.getRange("C1").getRichTextValue();

  let docID = getDocIdFromUrl(richText.getLinkUrl())
  if (docID == null) {
    ui.alert("Invalid\nNo Document Found!")
    return
  }




  let doc = DocumentApp.openById(docID);
  doc.setName(date + " Post-Meeting Summary")
  let body = doc.getBody();
  body.clear()


  let subjectTitle = body.appendParagraph(subject[0][0])
  subjectTitle.setHeading(DocumentApp.ParagraphHeading.HEADING2);
  for (var i = 1; i < subject.length; i++) {

    if (subject[i][0] != "" && subject[i][0] != null) {
      body.appendParagraph(subject[i][0])
    }
  }


  let introTitle = body.appendParagraph(intro[0][0])
  introTitle.setHeading(DocumentApp.ParagraphHeading.HEADING2);
  for (var i = 1; i < intro.length; i++) {

    if (intro[i][0] != "" && intro[i][0] != null) {
      body.appendParagraph(intro[i][0])
    }
  }


  let keyPointsTitle = body.appendParagraph(keyPoints[0][0])
  keyPointsTitle.setHeading(DocumentApp.ParagraphHeading.HEADING2);
  for (var i = 1; i < keyPoints.length; i++) {
    if (keyPoints[i][0] != "" && keyPoints[i][0] != null) {
      body.appendParagraph(keyPoints[i][0])
    }
  }


  let followupTitle = body.appendParagraph(followup[0][0])
  followupTitle.setHeading(DocumentApp.ParagraphHeading.HEADING2);
  for (var i = 1; i < followup.length; i++) {
    if (followup[i][0] != "" && followup[i][0] != null) {
      body.appendParagraph(followup[i][0])
    }
  }

  doc.saveAndClose()

  let existingDocs = sheet.getRange("PM_DOC_LOG").getValues().map(row => row[2])
  let logRow = sheet.getRange("PM_DOC_LOG").getRow()

  let indexOfExistingDoc = existingDocs.indexOf(previousName)


  let docFile = DriveApp.getFileById(doc.getId())

  let richTextValue = SpreadsheetApp.newRichTextValue()
    .setText(docFile.getName())
    .setLinkUrl(docFile.getUrl())
    .build();
  sheet.getRange(indexOfExistingDoc + logRow, 3).setRichTextValue(richTextValue)



}



























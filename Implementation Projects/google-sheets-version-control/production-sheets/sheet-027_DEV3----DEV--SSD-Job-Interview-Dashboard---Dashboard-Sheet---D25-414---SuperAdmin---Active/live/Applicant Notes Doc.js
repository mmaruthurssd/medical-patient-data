





//https://drive.google.com/drive/folders/1aJXQ8M8NjP91V4iGO8uFy6vcohAW6_k7


function createApplicantNotesDoc_(ActiveSheet, RowIndex, ApplicantName) {

  //const ApplicantName = ActiveSheet.getRange('A' + RowIndex).getValue();
  const ApplicantDocLink = ActiveSheet.getRange('H' + RowIndex).getValue();

  if (ApplicantName !== '' && ApplicantDocLink === '') {

    console.log('generating google doc for ' + ApplicantName);

    const FolderId = '1aJXQ8M8NjP91V4iGO8uFy6vcohAW6_k7';
    const DestFolder = DriveApp.getFolderById(FolderId);

    const TemplateId = '1srHb0e68fzSiMz7huNSRTVsYDbIRGDaMq5DtER1r7nQ';
    const TemplateDoc = DriveApp.getFileById(TemplateId);

    const NewDocName = ApplicantName + ' Recruitment Log';
    const NewDoc = TemplateDoc.makeCopy(NewDocName, DestFolder);
    const NewDocUrl = NewDoc.getUrl();


    let richTextDoc = SpreadsheetApp.newRichTextValue()
      .setText(NewDocName)
      .setLinkUrl(NewDocUrl)
      .build();


    ActiveSheet.getRange('H' + RowIndex).setRichTextValue(richTextDoc)

  } else {

    let richTextDoc = ActiveSheet.getRange('H' + RowIndex).getRichTextValue()

    let docUrl = richTextDoc.getLinkUrl()
    if (docUrl != null) {
      try {

        DriveApp.getFileById(docUrl.split("/d/")[1].split("/edit")[0]).setName(ApplicantName + ' Recruitment Log')
        let richTextDocNew = SpreadsheetApp.newRichTextValue()
          .setText(ApplicantName + ' Recruitment Log')
          .setLinkUrl(docUrl)
          .build();
        ActiveSheet.getRange('H' + RowIndex).setRichTextValue(richTextDocNew)


      } catch (err) { }
    }
  }

}








function storeEmailAsPdf() {

  const threads = GmailApp.getInboxThreads(0, 5);

  const folder = DriveApp.getFolderById("1SbR8_b9Lpf1Ys7mpzjlhhq2xLoHzjJvX");

  threads.forEach(thread => {
    const msgs = thread.getMessages();

    msgs.forEach(msg => {
      let subject = msg.getSubject();
      if (subject == "Summary of failures for Google Apps Script: Expenses Dashboard") {

        const htmlBody = msg.getBody();

        // Sanitize the subject to create a valid filename.
        const sanitizedSubject = subject.replace(/[/\\?%*:|"<>]/g, '-');
        const fileName = `${sanitizedSubject}.pdf`;

        // Create a PDF blob from the email's HTML body.
        const pdfBlob = Utilities.newBlob(htmlBody, 'text/html', fileName)
          .getAs('application/pdf');

        // Create the file in the specified Drive folder.
        folder.createFile(pdfBlob);

      }
    })
  })

}







function saveEmailAsPdf(e) {
  const selectedFolderId = e.formInput.folder_selection;
  const messageId = e.parameters.messageId;

  if (!selectedFolderId || !messageId) {
    return CardService.newActionResponseBuilder()
      .setNotification(CardService.newNotification().setText("Error: Missing folder or message ID."))
      .build();
  }
  try {
    const accessToken = e.messageMetadata.accessToken;
    GmailApp.setCurrentMessageAccessToken(accessToken);

    const message = GmailApp.getMessageById(messageId);
    const folder = DriveApp.getFolderById(selectedFolderId);

    const subject = message.getSubject();
    const htmlBody = message.getBody();

    // Sanitize the subject to create a valid filename.
    const sanitizedSubject = subject.replace(/[/\\?%*:|"<>]/g, '-');
    const fileName = `${sanitizedSubject}.pdf`;

    // Create a PDF blob from the email's HTML body.
    const pdfBlob = Utilities.newBlob(htmlBody, 'text/html', fileName)
      .getAs('application/pdf');

    // Create the file in the specified Drive folder.
    folder.createFile(pdfBlob);

    const notificationText = `Successfully saved email as "${fileName}".`;
    return CardService.newActionResponseBuilder()
      .setNotification(CardService.newNotification().setText(notificationText))
      .build();

  } catch (err) {
    const errorText = `Failed to save PDF. Error: ${err.toString()}`;
    return CardService.newActionResponseBuilder()
      .setNotification(CardService.newNotification().setText(errorText))
      .build();
  }
}







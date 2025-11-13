
const FOLDER_ID = "1JJfmr_Xrzy4TQeZ9W1Q5U9ufrSyWmDgl"



// function onOpen() {
//   const ui = SpreadsheetApp.getUi();
//   const menu = ui.createMenu("Custom")
//   menu.addItem("Fetch Attachments", "downloadAliasMailAttachments").addToUi()
// }




//Trigger is from admin@ssdspc.com
function downloadDocumentAliasMailAttachments() {


  const TimeLimit = 750; //12.5 minutes = 750 seconds
  const StartTime = new Date().getTime() / 1000;
  let isTimeLimitReached = false;

  const Days = 3;
  let date = new Date(new Date().getTime() - (24 * 60 * 60 * 1000 * Days));
  date = Utilities.formatDate(date, 'GMT-06:00', 'yyyy/M/d');

  const SearchQuery = 'to:"outgoingreferrals@ssdspc.com" has:attachment is:unread after:' + date;
  const Threads = GmailApp.search(SearchQuery, 0, 15);

  //Logger.log(Threads.length)
  if (Threads.length === 0) return;

  //Logger.log(Threads.length)

  const ss = SpreadsheetApp.getActiveSpreadsheet();


  const DocsLogSheet = getSheetByID_(ss, '1264464463') //Outgoing Referral Packets

  const MsgIdLogSheet = getSheetByID_(ss, '1725830820') //MsgId_Log

  const DestFolder = DriveApp.getFolderById(FOLDER_ID);

  const MsgIdLog = MsgIdLogSheet.getRange('A:A').getValues().filter(row => row[0] !== '').map(row => row[0]);

  let index = 0;

  while (index < Threads.length && isTimeLimitReached === false) {

    const Messages = Threads[index].getMessages();

    Messages.forEach(Message => {
      const MsgId = Message.getId();

      if (MsgIdLog.indexOf(MsgId) === -1) {

        const MsgDateTime = Utilities.formatDate(Message.getDate(), 'GMT-06:00', 'M/d/yyyy H:mm');
        const Sender = Message.getFrom();

        const Attachments = Message.getAttachments({ includeInlineImages: false, includeAttachments: true });

        if (Attachments.length > 0) {

          const MsgDate = MsgDateTime.split(' ')[0];
          const MsgTime = MsgDateTime.split(' ')[1];

          const Data = downloadAttachments_(MsgDate, MsgTime, Sender, Message.getSubject(), Attachments, DestFolder);

          if (Data.length > 0)
            DocsLogSheet.getRange(DocsLogSheet.getLastRow() + 1, 1, Data.length, Data[0].length).setValues(Data);

          MsgIdLogSheet.appendRow([MsgId]);

        }
      }
      Message.markRead();

    });

    index++;

    const CurrentTime = new Date().getTime() / 1000;

    if (CurrentTime - StartTime >= TimeLimit)
      isTimeLimitReached = true;

  }

  DocsLogSheet.getRange(3, 1, DocsLogSheet.getLastRow() - 2, DocsLogSheet.getLastColumn()).sort([{ column: 1, ascending: false }, { column: 2, ascending: false }])
}




function downloadAttachments_(Date, Time, Sender, Subject, Attachments, DestFolder) {

  const Data = [];

  Attachments.forEach(attachment => {

    const AttachmentBlob = attachment.copyBlob();
    const File = DestFolder.createFile(AttachmentBlob);
    const FileName = File.getName();
    const FileUrl = File.getUrl();

    Data.push([Date, Time, Sender, Subject, FileName, FileUrl]);

  });

  return Data;

}




















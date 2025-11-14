


// function onOpen() {
//   const ui = SpreadsheetApp.getUi();
//   const menu = ui.createMenu("Custom")
//   menu.addItem("Fetch Attachments", "downloadAliasMailAttachments").addToUi()
// }




function downloadAliasMailAttachments() {



  const TimeLimit = 1500; //25 minutes = 1500 seconds
  const StartTime = new Date().getTime() / 1000;
  let isTimeLimitReached = false;

  const Days = 3;
  let date = new Date(new Date().getTime() - (24 * 60 * 60 * 1000 * Days));
  date = Utilities.formatDate(date, 'GMT-06:00', 'yyyy/M/d');

  const SearchQuery = 'to:"mail@ssdspc.com" has:attachment after:' + date;
  const Threads = GmailApp.search(SearchQuery, 0, 200);

  Logger.log(Threads.length)
  if (Threads.length === 0) return;

  Logger.log(Threads.length)

  const DocsLogSheet = SpreadsheetApp.getActive().getSheetByName('Attachments_Log');
  const MsgIdLogSheet = SpreadsheetApp.getActive().getSheetByName('MsgId_Log');
  const FolderId = '1jtn71-KNnwL1DZNNxcai64srAPDEhjFc';
  const DestFolder = DriveApp.getFolderById(FolderId);

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

          const Data = downloadAttachments_(MsgDate, MsgTime, Sender, Attachments, DestFolder);

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

  DocsLogSheet.getRange(2, 1, DocsLogSheet.getLastRow() - 1, DocsLogSheet.getLastColumn()).sort([{ column: 1, ascending: false }, { column: 2, ascending: false }])

}


function downloadAttachments_(Date, Time, Sender, Attachments, DestFolder) {

  const Data = [];

  Attachments.forEach(attachment => {

    try {
      const AttachmentBlob = attachment.copyBlob();
      const File = DestFolder.createFile(AttachmentBlob);
      const FileName = File.getName();
      const FileUrl = File.getUrl();

      Data.push([Date, Time, Sender, FileName, FileUrl]);

    } catch (err) { }
  });

  return Data;

}



function downloadMFlowerMailAttachments() {

  const TimeLimit = 1500; //25 minutes = 1500 seconds
  const StartTime = new Date().getTime() / 1000;
  let isTimeLimitReached = false;

  const Days = 2;
  let date = new Date(new Date().getTime() - (24 * 60 * 60 * 1000 * Days));
  date = Utilities.formatDate(date, 'GMT-06:00', 'yyyy/M/d');

  const SearchQuery = 'in:inbox has:attachment after:' + date;
  const Threads = GmailApp.search(SearchQuery, 0, 100);

  // const SearchQuery = 'in:inbox has:attachment after:2022/11/30 before:2023/1/1';
  // const Threads = GmailApp.search(SearchQuery, 0, 500);

  if (Threads.length === 0) return;



  const FolderId = '1iZl6NRjqUSdZcKsDMgz6vUKojmFcOWtd';
  const DestFolder = DriveApp.getFolderById(FolderId);

  const DocsLogSheet = SpreadsheetApp.getActive().getSheetByName('MFlower_Attachments');
  const MsgIdLogSheet = SpreadsheetApp.getActive().getSheetByName('MFlower_MsgId_Log');

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

          console.log('processing ' + MsgId + ' ...');

          const MsgDate = MsgDateTime.split(' ')[0];
          const MsgTime = MsgDateTime.split(' ')[1];

          const Data = downloadAttachments_(MsgDate, MsgTime, Sender, Attachments, DestFolder);

          if (Data.length > 0) {
            DocsLogSheet.getRange(DocsLogSheet.getLastRow() + 1, 1, Data.length, Data[0].length).setValues(Data);
            MsgIdLogSheet.appendRow([MsgId]);
          }
        }

      }

      //Message.markRead();

    });

    index++;

    const CurrentTime = new Date().getTime() / 1000;

    if (CurrentTime - StartTime >= TimeLimit)
      isTimeLimitReached = true;

  }

  // DocsLogSheet.getRange(2, 1, DocsLogSheet.getLastRow() - 1, DocsLogSheet.getLastColumn())
  //.sort([{ column: 1, ascending: false }, { column: 2, ascending: false }])

}


// ================================================================================= //


// function downloadAttachments_(Date, Time, Sender, Attachments, DestFolder) {

//   const Data = [];

//   Attachments.forEach(attachment => {

//     const AttachmentBlob = attachment.copyBlob();
//     const File = DestFolder.createFile(AttachmentBlob);
//     const FileName = File.getName();
//     const FileUrl = File.getUrl();

//     Data.push([Date, Time, Sender, FileName, FileUrl]);

//   });

//   return Data;

// }


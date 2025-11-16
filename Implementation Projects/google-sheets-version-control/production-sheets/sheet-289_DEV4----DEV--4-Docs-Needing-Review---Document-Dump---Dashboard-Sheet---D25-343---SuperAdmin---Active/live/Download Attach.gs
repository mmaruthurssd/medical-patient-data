
const FOLDER_ID = "1Nrs1jF_zwR-8jkglAe4v-txZV0iwZOqM"

const ALL_IDS_SHEET = "All Ids List"


// function onOpen() {
//   const ui = SpreadsheetApp.getUi();
//   const menu = ui.createMenu("Custom")
//   menu.addItem("Fetch Attachments", "downloadAliasMailAttachments").addToUi()
// }




//trigger from scan@ssdspc.com
function downloadDocumentAliasMailAttachments() {
  // }
  // function downloadDocumentAliasMailAttachmentsTest() {

  //return

  const TimeLimit = 750; //12.5 minutes = 750 seconds
  const StartTime = new Date().getTime() / 1000;
  let isTimeLimitReached = false;

  const Days = 3;
  let date = new Date(new Date().getTime() - (24 * 60 * 60 * 1000 * Days));
  date = Utilities.formatDate(date, 'GMT-06:00', 'yyyy/M/d');

  //const SearchQuery = 'to:"documents@ssdspc.com" has:attachment is:unread after:' + date;
  const SearchQuery = 'to:"documents@ssdspc.com" is:unread after:' + date;
  const Threads = GmailApp.search(SearchQuery, 0, 15);

  //Logger.log(Threads.length)
  //if (Threads.length === 0) return;

  //Logger.log(Threads.length)

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const allIdsSheet = ss.getSheetByName(ALL_IDS_SHEET);
  const allIds = allIdsSheet.getRange(2, 1, allIdsSheet.getLastRow() - 1, allIdsSheet.getLastColumn()).getDisplayValues();
  let formatedAllIds = []
  ///let formatedAllIdsN = {}
  for (var i = 0; i < allIds[0].length; i = i + 2) {
    //Logger.log(i)
    formatedAllIds.push(allIds.map(id => [id[i].toString().toUpperCase().trim(), id[i + 1]]).filter(v => v[0] != ""))
  }

  // Logger.log(formatedAllIds.length)
  // Logger.log(formatedAllIds[0].length)
  // Logger.log(formatedAllIds[0])
  // Logger.log(formatedAllIds[1])

  // for (var i = 0; i < formatedAllIds.length; i++) {
  //   for (var j = 0; j < formatedAllIds[i].length; j++) {
  //     Logger.log(formatedAllIds[i][j])
  //     //Logger.log(formatedAllIds[i][j][0])
  //   }

  // }

  // Logger.log(formatedAllIds);
  // return


  const DocsLogSheet = getSheetByID_(ss, '839054197')
  const MsgIdLogSheet = getSheetByID_(ss, '861550863')

  const DestFolder = DriveApp.getFolderById(FOLDER_ID);

  const MsgIdLog = MsgIdLogSheet.getRange('A:A').getValues().filter(row => row[0] !== '').map(row => row[0]);

  let index = 0;

  while (index < Threads.length && isTimeLimitReached === false) {

    const Messages = Threads[index].getMessages();

    Messages.forEach(Message => {
      const MsgId = Message.getId();

      if (MsgIdLog.indexOf(MsgId) === -1) {

        let Subject = Message.getSubject().toString().toUpperCase()
        let Body = Message.getBody().toString().toUpperCase()

        const MsgDateTime = Utilities.formatDate(Message.getDate(), 'GMT-06:00', 'M/d/yyyy H:mm');
        const Sender = Message.getFrom();

        const Attachments = Message.getAttachments({ includeInlineImages: false, includeAttachments: true });

        if (Attachments.length > 0) {

          const MsgDate = MsgDateTime.split(' ')[0];
          const MsgTime = MsgDateTime.split(' ')[1];

          //const Data = downloadAttachments_(MsgDate, MsgTime, Sender, Message.getSubject(), Attachments, DestFolder);

          Attachments.forEach(attachment => {

            const AttachmentBlob = attachment.copyBlob();
            const File = DestFolder.createFile(AttachmentBlob);
            const FileName = File.getName();
            const FileUrl = File.getUrl();

            //Data.push([Date, Time, Sender, Subject, FileName, FileUrl]);
            let DataRow = [MsgDate, MsgTime, Sender, Message.getSubject(), FileName, FileUrl];
            DocsLogSheet.appendRow(DataRow);

            let found = false
            for (var i = 0; i < formatedAllIds.length; i++) {
              for (var j = 0; j < formatedAllIds[i].length; j++) {
                if (Subject.includes(formatedAllIds[i][j][0] + "#") || Body.includes(formatedAllIds[i][j][0] + "#")) {
                  DocsLogSheet.getRange(DocsLogSheet.getLastRow(), i + 8).setValue(formatedAllIds[i][j][1])
                  found = true
                  break
                }
              }
              if (found) {
                break
              }
            }
          });


          //if (Data.length > 0)
          //DocsLogSheet.getRange(DocsLogSheet.getLastRow() + 1, 1, Data.length, Data[0].length).setValues(Data);

          MsgIdLogSheet.appendRow([MsgId]);
          Message.markRead();



          //this stores the email body as pdf
        } else {
          //let sub =
          let found = false
          for (var i = 0; i < formatedAllIds.length; i++) {
            for (var j = 0; j < formatedAllIds[i].length; j++) {
              if (Subject.includes(formatedAllIds[i][j][0] + "#") || Body.includes(formatedAllIds[i][j][0] + "#")) {
                const MsgDate = MsgDateTime.split(' ')[0];
                const MsgTime = MsgDateTime.split(' ')[1];
                let sub = Message.getSubject()
                const htmlBody = Message.getBody();
                const sanitizedSubject = sub.replace(/[/\\?%*:|"<>]/g, '-');
                const fileName = `${sanitizedSubject}.pdf`;
                const pdfBlob = Utilities.newBlob(htmlBody, 'text/html', fileName)
                  .getAs('application/pdf');
                let newFile = DestFolder.createFile(pdfBlob);

                let DataRow = [MsgDate, MsgTime, Sender, sub, fileName, newFile.getUrl()];
                DocsLogSheet.appendRow(DataRow);
                SpreadsheetApp.flush()
                DocsLogSheet.getRange(DocsLogSheet.getLastRow(), i + 8).setValue(formatedAllIds[i][j][1])

                MsgIdLogSheet.appendRow([MsgId]);
                Message.markRead();

                found = true
                break

              }
            }
            if (found) {
              break
            }
          }
        }

      }

    });

    index++;

    const CurrentTime = new Date().getTime() / 1000;

    if (CurrentTime - StartTime >= TimeLimit)
      isTimeLimitReached = true;

  }

  DocsLogSheet.getRange(3, 1, DocsLogSheet.getLastRow() - 2, DocsLogSheet.getLastColumn()).sort([{ column: 1, ascending: false }, { column: 2, ascending: false }])

  try {
    moveFilesToDestFolders()
  } catch (err) { Logger.log(err) }
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







function downloadRashidAliasMailAttachments() {



  const TimeLimit = 750; //12.5 minutes = 750 seconds
  const StartTime = new Date().getTime() / 1000;
  let isTimeLimitReached = false;

  const Days = 60;
  let date = new Date(new Date().getTime() - (24 * 60 * 60 * 1000 * Days));
  date = Utilities.formatDate(date, 'GMT-06:00', 'yyyy/M/d');

  const SearchQuery = 'to:"mm@ssdspc.com" has:attachment is:unread after:' + date;
  const Threads = GmailApp.search(SearchQuery, 0, 15);

  Logger.log(Threads.length)

}











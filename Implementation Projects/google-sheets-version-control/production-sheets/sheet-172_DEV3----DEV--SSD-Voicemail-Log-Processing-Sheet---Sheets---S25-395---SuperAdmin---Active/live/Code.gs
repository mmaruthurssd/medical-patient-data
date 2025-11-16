



const VOICEMAIL_SS_ID = "1Ej8wzt6U6C-x5Ex9bv0ZRBZs5RFff0Xpi3Zak4r8u4E"
const VOICEMAIL_SHEET = "VoiceMail"



function downloadVoicemailAttachments() {

  console.log('process started ...');


  const TimeLimit = 540; // 9 minutes = 540 seconds (60 * 9)
  const StartTime = new Date().getTime() / 1000;



  const FolderId = '1358dI6OhYOIKvUM--GAOsYL45UrjwHMt';
  const Date_ = Utilities.formatDate(new Date(new Date().getTime() - (24 * 60 * 60 * 1000 * 3)), 'GMT-6', 'yyyy/M/d');

  // const SearchQuery = 'in:inbox has:attachment label:unread from:pbx-notifications@clearlyip.com after:' + Date_;
  //const SearchQuery = 'in:inbox has:attachment label:unread from:no-reply@clearlyip.com after:' + Date_;

  const SearchQueries = [
    'in:inbox has:attachment label:unread from:pbx-notifications@clearlyip.com after:' + Date_,
    'in:inbox has:attachment label:unread from:no-reply@clearlyip.com after:' + Date_
  ]


  const MsgLogSheet = SpreadsheetApp.getActive().getSheetByName('Msg_Id_Log');
  const MsgIdLog = MsgLogSheet.getRange(2, 1, MsgLogSheet.getLastRow() - 1, 1).getValues().map(row => row[0]);

  //const MsgIdLog = getMsgIdLog_();


  const ThisVoicemailSheet = SpreadsheetApp.getActive().getSheetByName('VoiceMail');
  const VoicemailSheet = SpreadsheetApp.openById(VOICEMAIL_SS_ID).getSheetByName(VOICEMAIL_SHEET);

  SearchQueries.forEach(SearchQuery => {

    const Threads = GmailApp.search(SearchQuery, 0, 100);

    if (Threads.length === 0) {
      console.log('no new messages found ...');
      return;
    }
    else {

      // const FilterCriteria = ['*From:*', '*To:*', '*Date:*'];
      const FilterCriteria = ['New voicemail from', '*To:*', '*Received:*'];

      Threads.forEach(Thread => {
        const Messages = Thread.getMessages();

        Messages.forEach(Message => {

          const MsgId = Message.getId();

          if (MsgIdLog.indexOf(MsgId) === -1 && Message.isUnread) {
            // if (Message.isUnread) {

            console.log('processing message with id ' + MsgId + ' ...');

            const MsgBody = Message.getPlainBody().split('\n')
              .filter(LineItem => LineItem.includes(FilterCriteria[0]) ||
                LineItem.includes(FilterCriteria[1]) ||
                LineItem.includes(FilterCriteria[2]));


            const Attachments = Message.getAttachments({
              includeInlineImages: false,
              includeAttachments: true
            });

            // download attachments and get the file URL
            if (Attachments.length >= 0) {
              console.log('downloading attachment(s) ...');

              Attachments.forEach(attachment => {

                const AttachmentBlob = attachment.copyBlob();
                const DestFolder = DriveApp.getFolderById(FolderId);
                const CurrentFile = DriveApp.createFile(AttachmentBlob);
                const FileUrl = CurrentFile.getUrl();

                CurrentFile.moveTo(DestFolder);

                //updateMsgLog_(MsgId);
                MsgLogSheet.appendRow([MsgId]);
                MsgIdLog.push(MsgId)
                updateVoicemail_(MsgBody, FileUrl, ThisVoicemailSheet, VoicemailSheet);

              });

            }

            Message.markRead();


          }


          const currentTime = new Date().getTime() / 1000;

          if (currentTime - StartTime >= TimeLimit)
            return;


        });

      });



    }

  });


  sortData_(ThisVoicemailSheet, VoicemailSheet);



  let dataUpdateLog = SpreadsheetApp.openById(VOICEMAIL_SS_ID).getSheetByName("Data Update Log")

  let columnA = dataUpdateLog.getRange("A1:A").getValues().map(r => r[0]);

  let indexOfDataShource = columnA.indexOf("Incomming Voicemail From Gmail");
  if (indexOfDataShource > -1) {
    dataUpdateLog.getRange(indexOfDataShource + 1, 4).setValue(new Date())
  }

}





function updateVoicemail_(MsgBody, FileUrl, ThisVoicemailSheet, VoicemailSheet) {

  try {

    //const VoicemailSheet = SpreadsheetApp.getActive().getSheetByName('VoiceMail');

    // const StrFrom = MsgBody[0].trim().replace('*From:* ','').replace(' <','|').replace('>','').split('|');
    // const StrSender = StrFrom[0].trim();
    // const PhoneNumber = StrFrom[1].trim();
    // const StrPhone = PhoneNumber.length === 11 ? PhoneNumber.substring(1,PhoneNumber.length) : PhoneNumber;
    // const StrTo = MsgBody[1].trim().replace('*To:* ', '');
    // const StrDateTime = MsgBody[2].trim().replace('*Date:* ','').split(' ');
    // const StrDate = StrDateTime[0].trim();
    // const StrTime = StrDateTime[1].trim();

    const StrFrom = MsgBody[0].trim().replace('New voicemail from ', '')
      .replace(' <', '|').replace('>', '').split('|');
    const StrSender = StrFrom[0].trim();
    const PhoneNumber = StrFrom[1].trim();
    const StrPhone = PhoneNumber.length === 11 ? PhoneNumber.substring(1, PhoneNumber.length) : PhoneNumber;
    const StrTo = MsgBody[1].replace('*To:* ', '').trim();
    const StrDateTime = MsgBody[2].replace('*Received:* ', '').trim().split(' ');
    const StrDate = StrDateTime[0].trim();
    const StrTime = StrDateTime[1].trim();

    ThisVoicemailSheet.appendRow([StrDate, StrTime, StrTo, StrSender, StrPhone, FileUrl]);
    VoicemailSheet.appendRow([StrDate, StrTime, StrTo, '', StrSender, StrPhone, FileUrl]);

  }
  catch (err) {
    console.log(err);
  }

}


function sortData_(ThisVoicemailSheet, VoicemailSheet) {
  //const VoicemailSheet = SpreadsheetApp.getActive().getSheetByName('VoiceMail');
  ThisVoicemailSheet.getDataRange().sort([{ column: 1, ascending: false }, { column: 2, ascending: false }]);
  VoicemailSheet.getDataRange().sort([{ column: 1, ascending: false }, { column: 2, ascending: false }]);
}









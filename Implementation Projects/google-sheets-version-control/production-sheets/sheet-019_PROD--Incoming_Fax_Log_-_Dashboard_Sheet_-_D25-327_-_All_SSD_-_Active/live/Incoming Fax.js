
// function temp() {
//   const date = new Date(new Date('2024-11-21 15:05:20') - (7 * 60 * 60 * 1000));
//   console.log(Utilities.formatDate(date, 'GMT-6', 'M/d/yyyy hh:mm'));
// }







function onOpen(e) {
  SpreadsheetApp.getUi()
    .createMenu('Utilities')
    .addItem('Edit Record', 'showEditRecordDialog')
    .addToUi();
}


//the code has been moved to the below spreadsheet and it is running from ht fax@ssdspc email address
//https://docs.google.com/spreadsheets/d/1zaPDKY9rj08HqOsmGHlz52JSf5IJQZtGmK_UusdE8yM/edit?gid=0#gid=0
function downloadIncomingFaxMailAttachments() {

  return


  console.log('process started ...');

  const TimeLimit = 540; // 9 minutes = 540 seconds (60 * 9)
  const StartTime = new Date().getTime() / 1000;

  const FaxLogSheet = SpreadsheetApp.getActive().getSheetByName('Incoming_Fax_Log');
  const RecordIds = FaxLogSheet.getRange('A2:A').getValues().filter(row => row[0] !== '').map(row => row[0]);

  let MaxRecordId = Math.max(...RecordIds);

  const FolderId = '1Elq4k9w9HnbHoes8ilQupT9XKx-mmHB2';
  const Date_ = Utilities.formatDate(new Date(new Date().getTime() - (24 * 60 * 60 * 1000 * 3)), 'GMT-6', 'yyyy/M/d');
  const SearchQuery = 'in:inbox has:attachment label:unread from:sendfax received after:' + Date_;
  const Threads = GmailApp.search(SearchQuery, 0, 100);

  if (Threads.length === 0) {
    console.log('no new messages found ...');
    return;
  }
  else {


    let PatientSS = SpreadsheetApp.openById("10VrrYyiGmOx4cuAMQfJd0A9pDTQ_QVgGdxgjElkasxU");
    let PatientSheet = PatientSS.getSheetByName("Patients_Data")
    let patientIds = PatientSheet.getRange("A2:A").getValues()
    let patientPhones = PatientSheet.getRange("O2:P").getValues()
    let patientNames = PatientSheet.getRange("AB2:AB").getValues()


    let patientPhoneObj = {}
    patientPhones.forEach((row, index) => {
      let phone1 = extractNumbers_(row[0])
      let phone2 = extractNumbers_(row[1])
      if (phone1 != "" && phone1 != null) {
        patientPhoneObj[phone1] = { name: patientNames[index][0], id: patientIds[index][0] }
      }
      if (phone2 != "" && phone2 != null) {
        patientPhoneObj[phone2] = { name: patientNames[index][0], id: patientIds[index][0] }
      }
    })



    const FilterCriteria = ['* Fax From:', '* Fax To:', '* Received at:', '* Page Count:'];

    for (let i = 0; i < Threads.length; i++) {

      const Thread = Threads[i];
      const Messages = Thread.getMessages();

      Messages.forEach(Message => {

        const MsgId = Message.getId();
        const MsgIdLog = getMsgIdLog_();

        if (MsgIdLog.indexOf(MsgId) === -1 && Message.isUnread) {
          console.log('processing message with id ' + MsgId + ' ...');

          const MsgBody = Message.getPlainBody().split('\n')
            .filter(LineItem => LineItem.includes(FilterCriteria[0]) ||
              LineItem.includes(FilterCriteria[1]) ||
              LineItem.includes(FilterCriteria[2]) ||
              LineItem.includes(FilterCriteria[3]));

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
              const CurrentFile = DestFolder.createFile(AttachmentBlob);
              const FileUrl = CurrentFile.getUrl();

              updateMsgLog_(MsgId);
              MaxRecordId += 1;
              updateFaxLog_(FaxLogSheet, MaxRecordId, MsgBody, FileUrl, patientPhoneObj);

            });

          }

          Message.markRead();

        }

      });

      const currentTime = new Date().getTime() / 1000;

      if (currentTime - StartTime >= TimeLimit)
        break;

    }

    sortData_();


    let dataUpdateLog = SpreadsheetApp.getActive().getSheetByName("Data Update Log")

    let columnA = dataUpdateLog.getRange("A1:A").getValues().map(r => r[0]);

    let indexOfDataShource = columnA.indexOf("Incomming Fax From Gmail");
    if (indexOfDataShource > -1) {
      dataUpdateLog.getRange(indexOfDataShource + 1, 4).setValue(new Date())
    }

  }

}


function getMsgIdLog_() {
  const MsgLogSheet = SpreadsheetApp.getActive().getSheetByName('Msg_Id_Log');
  const MsgIds = MsgLogSheet.getRange(2, 1, MsgLogSheet.getLastRow() - 1, 1).getValues().map(row => row[0]);
  return MsgIds;
}


function updateMsgLog_(MsgId) {
  const MsgLogSheet = SpreadsheetApp.getActive().getSheetByName('Msg_Id_Log');
  MsgLogSheet.appendRow([MsgId]);
}





function updateFaxLog_(FaxLogSheet, MaxRecordId, MsgBody, FileUrl, patientPhoneObj) {

  try {
    // const FaxLogSheet = SpreadsheetApp.getActive().getSheetByName('Incoming_Fax_Log');

    const StrFrom = MsgBody[0].trim().replace('* Fax From: ', '').split(' ').slice(0, 2).join('')
      .replace('(', '').replace(')', '').replace('-', '');

    const StrTo = MsgBody[1].trim().replace('* Fax To: ', '')
      .replace(' ', '').replace('(', '').replace(')', '').replace('-', '');

    // const StrDateTime = MsgBody[2].trim().replace('* Received at: ', '').split(' ');
    // const StrDate = StrDateTime[0].trim();
    // const StrTime = StrDateTime[1].trim();

    const StrDateTime = MsgBody[2].trim().replace('* Received at: ', '');
    const TimeZoneDate = new Date(new Date(StrDateTime) - (7 * 60 * 60 * 1000));
    const FormattedDate = Utilities.formatDate(TimeZoneDate, 'GMT-6', 'M/d/yyyy hh:mm').split(' ');
    const StrDate = FormattedDate[0].trim();
    const StrTime = FormattedDate[1].trim() + (TimeZoneDate.getHours() >= 12 ? ' PM' : ' AM');

    const StrPage = MsgBody[3].trim().replace('* Page Count: ', '');

    let fromNumber = extractNumbers_(StrFrom)

    let DataRow = [MaxRecordId, StrDate, StrTime, StrTo, StrFrom, StrPage, FileUrl];

    if (patientPhoneObj[fromNumber]) {
      DataRow.push(patientPhoneObj[fromNumber]["id"])
      DataRow.push(patientPhoneObj[fromNumber]["name"])
    }

    //const DataRow = [MaxRecordId, StrDate, StrTime, StrTo, StrFrom, StrPage, FileUrl];
    FaxLogSheet.getRange(FaxLogSheet.getLastRow() + 1, 1, 1, DataRow.length).setValues([DataRow]);
  }
  catch (err) {
    console.log(err);
  }

}


function sortData_() {
  const FaxLogSheet = SpreadsheetApp.getActive().getSheetByName('Incoming_Fax_Log');
  FaxLogSheet.getDataRange().sort([{ column: 2, ascending: false }, { column: 3, ascending: false }]);
}


function extractNumbers_(number) {
  try {
    let text = number.toString()
    let regex = /\D/g; // \D matches any non-digit character
    return text.replace(regex, ''); // Replace non-digit characters with an empty string

  } catch (err) { return "" }
}


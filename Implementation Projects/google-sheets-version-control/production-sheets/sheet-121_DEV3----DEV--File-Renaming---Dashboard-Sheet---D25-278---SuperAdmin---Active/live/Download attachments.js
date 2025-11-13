

const INCOMMING_FAX_SS_ID = "1A7y3cwOAjwzZgtzTcr1q41fOtCpVedQTDHGUZKozBMc"
const INCOMMING_FAX_SHEET = "Incoming_Fax_Log (Main)"



const TAX_FOLDER_ID = "1vT0AugsZ_ESR-lMXXDVOHMZUD0XFpUZn";
const LICENSE_FOLDER_ID = "1WVMFs9udDmNTMZ6fDU50KSQecWzqDR1f";




function downloadIncomingTaxAndLicenseMailAttachments() {
  return
  console.log('process started ...');

  const TimeLimit = 540; // 9 minutes = 540 seconds (60 * 9)
  const StartTime = new Date().getTime() / 1000;



  const Date_ = Utilities.formatDate(new Date(new Date().getTime() - (24 * 60 * 60 * 1000 * 3)), 'GMT-6', 'yyyy/M/d');
  const SearchQuery = 'to:"documents@ssdspc.com" has:attachment after:' + Date_;
  const Threads = GmailApp.search(SearchQuery, 0, 100);

  if (Threads.length === 0) {
    console.log('no new messages found ...');
    return;
  }


  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const thisTaxSheet = ss.getSheetByName("Master Tax Documents Folder");
  const thisLicenseSheet = ss.getSheetByName("License Documents Folder");




  const MsgLogSheet = SpreadsheetApp.getActive().getSheetByName('Msg_Id_Log');
  let MsgIds = MsgLogSheet.getRange(1, 1, MsgLogSheet.getLastRow(), 1).getValues().map(row => row[0]);




  const taxSS = SpreadsheetApp.openById("164gwkre0qSUiReQETCgHhygu4nDRUrSOUhEyiIQ8OF0")
  const taxDocSheet = taxSS.getSheetByName("Tax Documents")

  const licenseSS = SpreadsheetApp.openById("1nqn8RoqQun2RpcQBgZZkpKdNJktq3-HQUIZGhw1BacU")
  const licenseDocSheet = licenseSS.getSheetByName("License Documents")


  const taxFolder = DriveApp.getFolderById(TAX_FOLDER_ID)
  const licenseFolder = DriveApp.getFolderById(LICENSE_FOLDER_ID)


  let today_ = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "M/d/yyyy")

  for (let i = 0; i < Threads.length; i++) {

    const Thread = Threads[i];
    const Messages = Thread.getMessages();

    Messages.forEach(Message => {


      const MsgId = Message.getId();
      let subject = Message.getSubject().toString().toLowerCase().trim();



      if (MsgIds.indexOf(MsgId) === -1 && Message.isUnread && subject.toString().toLowerCase().includes("tax")) {
        console.log('processing message with id ' + MsgId + ' ...');

        const Attachments = Message.getAttachments({
          includeInlineImages: false,
          includeAttachments: true
        });

        // download attachments and get the file URL
        if (Attachments.length >= 0) {
          console.log('downloading attachment(s) ...');

          Attachments.forEach(attachment => {

            const AttachmentBlob = attachment.copyBlob();
            const CurrentFile = taxFolder.createFile(AttachmentBlob);
            const FileUrl = CurrentFile.getUrl();
            const FileName = CurrentFile.getName();
            let richTextTemp = SpreadsheetApp.newRichTextValue().setText(FileName).setLinkUrl(FileUrl).build();

            taxDocSheet.appendRow(["", today_])
            taxDocSheet.getRange(taxDocSheet.getLastRow(), 1).setRichTextValue(richTextTemp)

            thisTaxSheet.appendRow([today_])
            thisTaxSheet.getRange(thisTaxSheet.getLastRow(), 2).setRichTextValue(richTextTemp)

          });

          MsgLogSheet.appendRow([MsgId]);

        }

        Message.markRead();

      } else if (MsgIds.indexOf(MsgId) === -1 && Message.isUnread && subject.toString().toLowerCase().includes("license")) {
        console.log('processing message with id ' + MsgId + ' ...');

        const Attachments = Message.getAttachments({
          includeInlineImages: false,
          includeAttachments: true
        });

        // download attachments and get the file URL
        if (Attachments.length >= 0) {
          console.log('downloading attachment(s) ...');

          Attachments.forEach(attachment => {

            const AttachmentBlob = attachment.copyBlob();
            const CurrentFile = licenseFolder.createFile(AttachmentBlob);
            const FileUrl = CurrentFile.getUrl();
            const FileName = CurrentFile.getName();
            let richTextTemp = SpreadsheetApp.newRichTextValue().setText(FileName).setLinkUrl(FileUrl).build();

            licenseDocSheet.appendRow(["", today_])
            licenseDocSheet.getRange(licenseDocSheet.getLastRow(), 1).setRichTextValue(richTextTemp)

            thisLicenseSheet.appendRow([today_])
            thisLicenseSheet.getRange(thisLicenseSheet.getLastRow(), 2).setRichTextValue(richTextTemp)
          });

          MsgLogSheet.appendRow([MsgId]);

        }

        Message.markRead();
      }

    });

    const currentTime = new Date().getTime() / 1000;

    if (currentTime - StartTime >= TimeLimit)
      break;
  }

  // let dataUpdateLog = FaxLogSS.getSheetByName("Data Update Log")

  // let columnA = dataUpdateLog.getRange("A1:A").getValues().map(r => r[0]);
  // let indexOfDataSource = columnA.indexOf("Incomming Fax From Gmail");
  // if (indexOfDataSource > -1) {
  //   dataUpdateLog.getRange(indexOfDataSource + 1, 4).setValue(new Date())
  // }

}






function extractNumbers_(number) {
  try {
    let text = number.toString()
    let regex = /\D/g; // \D matches any non-digit character
    return text.replace(regex, ''); // Replace non-digit characters with an empty string

  } catch (err) { return "" }
}


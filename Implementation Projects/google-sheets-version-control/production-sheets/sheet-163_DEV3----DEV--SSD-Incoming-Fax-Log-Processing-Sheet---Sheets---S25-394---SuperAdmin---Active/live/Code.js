

const INCOMMING_FAX_SS_ID = "1A7y3cwOAjwzZgtzTcr1q41fOtCpVedQTDHGUZKozBMc"
const INCOMMING_FAX_SHEET = "Incoming_Fax_Log (Main)"



function downloadIncomingFaxMailAttachments() {

// }
// function downloadIncomingFaxMailAttachmentsTest() {

  console.log('process started ...');

  const TimeLimit = 540; // 9 minutes = 540 seconds (60 * 9)
  const StartTime = new Date().getTime() / 1000;

  const DataSheet = SpreadsheetApp.getActive().getSheetByName('Incoming_Fax_Log');
  const RecordIds = DataSheet.getRange('A2:A').getValues().filter(row => row[0] !== '').map(row => row[0]);



  let MaxRecordId = Math.max(...RecordIds);

  const FolderId = '1Elq4k9w9HnbHoes8ilQupT9XKx-mmHB2';
  const Date_ = Utilities.formatDate(new Date(new Date().getTime() - (24 * 60 * 60 * 1000 * 3)), 'GMT-6', 'yyyy/M/d');
  const SearchQuery = 'in:inbox has:attachment label:unread from:sendfax received after:' + Date_;
  const Threads = GmailApp.search(SearchQuery, 0, 100);

  Logger.log(Threads.length)

  if (Threads.length === 0) {
    console.log('no new messages found ...');
    return;
  }



  let PatientSS = SpreadsheetApp.openById("1nYzpVskLjQfaSBYbt-y_CZzAJfqLmh37Wqw9FHmvd1c");
  let PatientSheet = PatientSS.getSheetByName("Patients")
  let patientIds = PatientSheet.getRange("A2:A").getDisplayValues()
  let patientNames = PatientSheet.getRange("B2:B").getValues()
  let patientDOBD = PatientSheet.getRange("G2:G").getDisplayValues()
  let patientDOB = PatientSheet.getRange("G2:G").getValues()
  let patientLinks = PatientSheet.getRange("H2:H").getValues()






  let patientIdObj = {}
  let patientIdObjV = {}
  patientIds.forEach((id, index) => {
    let firstName = patientNames[index][0].toString().toLowerCase().trim().split(" ")[0]
    patientIdObj[firstName + patientDOBD[index][0]] = { id: id[0], link: patientLinks[index][0] }

    if (isValidDate_(patientDOB[index][0])) {
      let tempDate = Utilities.formatDate(patientDOB[index][0], Session.getScriptTimeZone(), "M/d/yyyy")
      patientIdObjV[firstName + tempDate] = { id: id[0], link: patientLinks[index][0] }
    }
  })


  const FaxLogSS = SpreadsheetApp.openById(INCOMMING_FAX_SS_ID)
  const FaxLogSheet = FaxLogSS.getSheetByName(INCOMMING_FAX_SHEET)


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
            updateFaxLog_(DataSheet, FaxLogSheet, MaxRecordId, MsgBody, FileUrl, patientIdObj, patientIdObjV);

          });

        }

        Message.markRead();

      }

    });

    const currentTime = new Date().getTime() / 1000;

    if (currentTime - StartTime >= TimeLimit)
      break;

  }

  FaxLogSheet.getRange(2, 1, FaxLogSheet.getLastRow() - 1, FaxLogSheet.getLastColumn()).sort([{ column: 2, ascending: false }, { column: 3, ascending: false }]);

  //sortData_();


  let dataUpdateLog = FaxLogSS.getSheetByName("Data Update Log")

  let columnA = dataUpdateLog.getRange("A1:A").getValues().map(r => r[0]);
  let indexOfDataSource = columnA.indexOf("Incomming Fax From Gmail");
  if (indexOfDataSource > -1) {
    dataUpdateLog.getRange(indexOfDataSource + 1, 4).setValue(new Date())
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





function updateFaxLog_(DataSheet, FaxLogSheet, MaxRecordId, MsgBody, FileUrl, patientIdObj, patientIdObjV) {

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
    const TimeZoneDate = new Date(new Date(StrDateTime) - (5 * 60 * 60 * 1000));
    const FormattedDate = Utilities.formatDate(TimeZoneDate, 'GMT-6', 'M/d/yyyy hh:mm').split(' ');
    const StrDate = FormattedDate[0].trim();
    const StrTime = FormattedDate[1].trim() + (TimeZoneDate.getHours() >= 12 ? ' PM' : ' AM');

    const StrPage = MsgBody[3].trim().replace('* Page Count: ', '');

    //let fromNumber = extractNumbers_(StrFrom)

    let aiResult = processFaxUsingAI(FileUrl)
    let DataRow = []

    // const output = [
    //   aiResult?.patient || "",
    //   aiResult?.dob || "",
    //   aiResult?.sender || "",
    //   aiResult?.category || "",
    //   aiResult?.faxSummary || "",
    // ];
    let patientID = "";
    let newRichText = SpreadsheetApp.newRichTextValue().setText(patientID).setLinkUrl(null).build()
    try {
      let key1 = ((aiResult?.patient || "").split(" ")[0] + (aiResult?.dob || "")).toString().toLowerCase().trim()
      let key2 = key1
      if (isValidDate_(new Date(aiResult?.dob || ""))) {
        key2 = ((aiResult?.patient || "").split(" ")[0] + Utilities.formatDate(new Date(aiResult?.dob || ""), Session.getScriptTimeZone(), "M/d/yyyy")).toString().toLowerCase().trim()
      }
      let link = null
      if (patientIdObj.hasOwnProperty(key1)) {
        patientID = patientIdObj[key1]['id']
        link = patientIdObj[key1]['link']
      } else if (patientIdObjV.hasOwnProperty(key2)) {
        patientID = patientIdObjV[key2]['id']
        link = patientIdObjV[key2]['link']
      }
      newRichText = SpreadsheetApp.newRichTextValue().setText(patientID).setLinkUrl(link).build()

    } catch (idErr) { Logger.log("ID Error: " + idErr) }

    if (aiResult) {
      DataRow = [MaxRecordId, StrDate, StrTime, StrTo, StrFrom, StrPage, FileUrl, patientID, aiResult?.patient || "", aiResult?.dob || "", aiResult?.sender || "", aiResult?.faxSummary || "", aiResult?.medicineName || ""]
    } else {
      DataRow = [MaxRecordId, StrDate, StrTime, StrTo, StrFrom, StrPage, FileUrl];
    }

    // if (patientPhoneObj[fromNumber]) {
    //   DataRow.push(patientPhoneObj[fromNumber]["id"])
    //   DataRow.push(patientPhoneObj[fromNumber]["name"])
    // }



    //const DataRow = [MaxRecordId, StrDate, StrTime, StrTo, StrFrom, StrPage, FileUrl];
    DataSheet.getRange(DataSheet.getLastRow() + 1, 1, 1, DataRow.length).setValues([DataRow]);
    FaxLogSheet.getRange(FaxLogSheet.getLastRow() + 1, 1, 1, DataRow.length).setValues([DataRow]);
    FaxLogSheet.getRange(FaxLogSheet.getLastRow(), 8).setRichTextValue(newRichText)
  }
  catch (err) {
    console.log(err);
  }

}


// function sortData_() {
//   const FaxLogSheet = SpreadsheetApp.openById.getSheetByName('Incoming_Fax_Log');
//   FaxLogSheet.getDataRange().sort([{ column: 2, ascending: false }, { column: 3, ascending: false }]);
// }


function extractNumbers_(number) {
  try {
    let text = number.toString()
    let regex = /\D/g; // \D matches any non-digit character
    return text.replace(regex, ''); // Replace non-digit characters with an empty string

  } catch (err) { return "" }
}




//below function will return true if the arg is valid date and false if not.
function isValidDate_(d) {
  if (Object.prototype.toString.call(d) !== "[object Date]")
    return false;
  return !isNaN(d.getTime());
}



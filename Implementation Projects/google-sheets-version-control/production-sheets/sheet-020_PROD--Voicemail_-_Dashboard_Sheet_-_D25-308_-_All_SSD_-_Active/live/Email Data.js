
function emailVoicemailData() {

  return

  const DataSheet = SpreadsheetApp.getActive().getSheetByName('Email_Data');
  const DataRangeSummary = DataSheet.getRange('A2:C').getDisplayValues().filter(row => row[0] !== '');
  const DataRangeDetail = DataSheet.getRange('E2:I').getDisplayValues().filter(row => row[0] !== '');

  // if (dataRangeDetail.length === 0) return;

  const HtmlTemplate = HtmlService.createTemplateFromFile('Email Template');
  HtmlTemplate.dataRangeSummary = DataRangeSummary;
  HtmlTemplate.dataRangeDetail = DataRangeDetail;

  const HtmlBody = HtmlTemplate.evaluate().getContent();
  // console.log(htmlBody);

  GmailApp.sendEmail(
    //'imsadaankhan@gmail.com'
    'agonzalez@ssdspc.com,mflowers@ssdspc.com,admin@ssdspc.com,mm@ssdspc.com,bcurren@ssdspc.com',
    'VoiceMail Daily Report',
    'Please open this email with an HTML supported client!',
    { htmlBody: HtmlBody }
  )

}

function emailFormsData() {

  return

  const DataSheet = SpreadsheetApp.getActive().getSheetByName('Email_Data');
  const DataRangeSummary = DataSheet.getRange('A2:D').getDisplayValues().filter(row => row[0] !== '');
  const DataRangeDetail = DataSheet.getRange('F2:L').getDisplayValues().filter(row => row[0] !== '');

  // if (dataRangeDetail.length === 0) return;

  const HtmlTemplate = HtmlService.createTemplateFromFile('Email Template');
  HtmlTemplate.dataRangeSummary = DataRangeSummary;
  HtmlTemplate.dataRangeDetail = DataRangeDetail;

  const HtmlBody = HtmlTemplate.evaluate().getContent();
  // console.log(htmlBody);

  GmailApp.sendEmail(
    //'imsadaankhan@gmail.com'
    'agonzalez@ssdspc.com,mflowers@ssdspc.com,admin@ssdspc.com,mm@ssdspc.com,bcurren@ssdspc.com',
    'Contact Forms Daily Report',
    'Please open this email with an HTML supported client!',
    { htmlBody: HtmlBody }
  )

}






function sendOverdueReviewEmail() {

  console.log('process started ...');

  const ActiveSheet = SpreadsheetApp.getActive().getSheetByName('Employee Review Schedule');
  const AllData = ActiveSheet.getRange('A3:Z').getDisplayValues().filter(DataRow => DataRow[0] !== '');

  console.log('mapping data ...');

  const ThreeMonthData = AllData.map(DataRow => [DataRow[0], DataRow[2], DataRow[3], 'Three Months']);
  const SixMonthData = AllData.map(DataRow => [DataRow[0], DataRow[4], DataRow[5], 'Six Months']);
  const OneYearData = AllData.map(DataRow => [DataRow[0], DataRow[6], DataRow[7], 'One Year']);
  const TwoYearData = AllData.map(DataRow => [DataRow[0], DataRow[8], DataRow[9], 'Two Years']);
  const ThreeYearData = AllData.map(DataRow => [DataRow[0], DataRow[10], DataRow[11], 'Three Years']);
  const FourYearData = AllData.map(DataRow => [DataRow[0], DataRow[12], DataRow[13], 'Four Years']);
  const FiveYearData = AllData.map(DataRow => [DataRow[0], DataRow[14], DataRow[15], 'Five Years']);
  const SixYearData = AllData.map(DataRow => [DataRow[0], DataRow[16], DataRow[17], 'Six Years']);
  const SevenYearData = AllData.map(DataRow => [DataRow[0], DataRow[18], DataRow[19], 'Seven Years']);
  const EightYearData = AllData.map(DataRow => [DataRow[0], DataRow[20], DataRow[21], 'Eight Years']);
  const NineYearData = AllData.map(DataRow => [DataRow[0], DataRow[22], DataRow[23], 'Nine Years']);
  const TenYearData = AllData.map(DataRow => [DataRow[0], DataRow[24], DataRow[25], 'Ten Years']);

  console.log('merging data ...');

  const MappedData = [
    ...ThreeMonthData, ...SixMonthData, ...OneYearData, ...TwoYearData, ...ThreeYearData, ...FourYearData,
    ...FiveYearData, ...SixYearData, ...SevenYearData, ...EightYearData, ...NineYearData, ...TenYearData
  ]

  const OverdueData = MappedData.filter(DataRow => DataRow[2] === 'Overdue');

  if (OverdueData.length === 0) {
    console.log('no overdue data found ...');
    return
  };

  // console.log(OverdueData);

  console.log('creating html table ...');

  const HTMLTable = createHTMLTable_(OverdueData);

  // console.log(HTMLTable);

  console.log('sending email ...');

  // const Recipient = 'imsadaankhan@gmail.com';
  const Recipient = 'mm@ssdspc.com,kmatthews@ssdspc.com,agonzalez@ssdspc.com';
  const Subject = 'Overdue Reviews';
  const Body = 'Here are the details of the overdue reviews:';

  GmailApp.sendEmail(Recipient, Subject, Body, { htmlBody: HTMLTable });

  console.log('process completed ...');

}


function createHTMLTable_(DataValues) {

  let html_table =
    `<table>
    <tr style="border-bottom:1px solid #ddd;">
      <th style="padding:5px 10px;">Employee Name</th>
      <th>Review Date</th>
      <th>Review Period</th>
    </tr>`;

  DataValues.forEach((DataRow, Index) => {

    html_table += (Index % 2 === 0) ?
      '<tr style="border-bottom:1px solid #ddd;">' :
      '<tr style="border-bottom:1px solid #ddd;background-color:#F7F7F7;">';

    html_table +=
      ` <td style=padding:5px 10px;>${DataRow[0]}</td>
        <td style=padding:5px 10px;>${DataRow[1]}</td>
        <td style=padding:5px 10px;>${DataRow[3]}</td>
      </tr>`;

  });

  html_table += '</table>'

  return html_table;

}



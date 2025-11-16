

function microTasksEmailProcess() {

  const SS = SpreadsheetApp.getActiveSpreadsheet();
  const MMSheet = SS.getSheetByName("Master Microtasks");

  const HeadersRow = MMSheet.getRange(1, 1, 1, MMSheet.getLastColumn()).getValues()[0];

  const assignedToIndex = HeadersRow.indexOf("Assigned to")
  const statusIndex = HeadersRow.indexOf("Status")
  const microtaskIndex = HeadersRow.indexOf("Microtask")
  const notesIndex = HeadersRow.indexOf("Notes")
  const referenceFileIndex = HeadersRow.indexOf("Reference Google Sheet / Doc / File")
  const urlIndex = HeadersRow.indexOf("Temp_URLs")

  let allData = MMSheet.getRange(2, 1, MMSheet.getLastRow() - 1, MMSheet.getLastColumn()).getDisplayValues()


  let assignedTo = {};

  allData.forEach(row => {

    if (row[assignedToIndex] != "" && row[statusIndex] != "Cancelled" && row[statusIndex] != "Completed") {

      let microtask = row[microtaskIndex]
      let notes = row[notesIndex]
      let file = row[referenceFileIndex]
      if (row[urlIndex] != "") {
        file = row[urlIndex]
      }


      let assignedListSplit = row[assignedToIndex].split("/").map(r => r.toString().trim())

      assignedListSplit.forEach(name => {
        if (assignedTo[name]) {
          assignedTo[name].push([microtask, notes, file])
        } else {
          assignedTo[name] = [[microtask, notes, file]]
        }
      })
    }
  })




  const EmailSheet = SS.getSheetByName("Assing_To_List");
  const allList = EmailSheet.getRange(2, 2, EmailSheet.getLastRow() - 1, 2).getValues()
  const allListObj = {};
  allList.forEach(r => {
    allListObj[r[1]] = r[0]
  })




  for (let key in assignedTo) {
    if (allListObj[key]) {
      try {
        let htmlTable = createHTMLTable_(assignedTo[key])
        const Body = 'Here are the details list of the Microtasks:';
        GmailApp.sendEmail(allListObj[key], "Microtasks", Body, { htmlBody: htmlTable });
      } catch (err) { }
    }


  }

}






function createHTMLTable_(DataValues) {

  //border: 1px solid #96D4D4;
  //border-collapse: collapse;

  let html_table =
    `<table style="border: 1px solid #96D4D4; border-collapse: collapse;">
    <tr style="border: 1px solid #96D4D4; border-collapse: collapse;">
      <th style="padding:5px 10px;">Microtasks</th>
      <th>Notes</th>
      <th>Reference Google Sheet / Doc / File</th>
    </tr>`;

  DataValues.forEach((DataRow, Index) => {

    html_table += (Index % 2 === 0) ?
      '<tr style="border:1px solid #96D4D4; border-collapse: collapse;">' :
      '<tr style="border:1px solid #96D4D4; border-collapse: collapse; background-color:#F7F7F7;">';

    html_table +=
      ` <td style=padding:5px 10px;>${DataRow[0]}</td>
        <td style=padding:5px 10px;>${DataRow[1]}</td>
        <td style=padding:5px 10px;>${DataRow[2]}</td>
      </tr>`;

  });

  html_table += '</table>';

  return html_table;

}













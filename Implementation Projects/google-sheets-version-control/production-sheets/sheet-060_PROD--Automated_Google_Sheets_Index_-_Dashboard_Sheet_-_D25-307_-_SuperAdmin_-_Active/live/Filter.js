

function filterMain() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();

  let filterValues = sheet.getRange("B1").getValue().split(",").map(r => r.toString().toLowerCase().trim());
  //Logger.log(filterValues)

  let db = ss.getSheetByName("DB_" + sheet.getSheetName());
  let allData = db.getRange(2, 1, db.getLastRow() - 1, db.getLastColumn()).getDisplayValues();


  const filteredNewData = allData.filter(row => {
    const cellValue = row[1].toLowerCase();
    return !filterValues.some(keyword => cellValue.includes(keyword));
  });

  //Logger.log(filteredNewData.length)

  if (sheet.getLastRow() > 2) {
    sheet.getRange(3, 1, sheet.getLastRow() - 2, sheet.getLastColumn()).clearContent()
  }

  try {
    sheet.getRange(3, 1, filteredNewData.length, filteredNewData[0].length).setValues(filteredNewData)
  } catch (err) { }

}




function filterArrayByKeywords(data) {
  const exclusionList = [
    'INC-',
    'PAR-',
    'OUT-',
    '_Patients',
    '_Mohs',
    '_Other',
    '_Melanoma',
    '_Benign'
  ];

  // Use the .filter() method to create a new array with only the desired rows.
  const filteredData = data.filter(row => {
    // Get the value from the second column (index 1).
    const cellValue = row[1];

    // Ensure the cell value is a string before checking it.
    if (typeof cellValue !== 'string') {
      return true; // Keep rows where the column isn't a string, or change to false to discard.
    }

    // Use .some() to check if the cellValue contains ANY of the words from the exclusionList.
    // We want to KEEP the row if it does NOT contain any, so we use the NOT operator (!).
    return !exclusionList.some(keyword => cellValue.includes(keyword));
  });

  return filteredData;
}
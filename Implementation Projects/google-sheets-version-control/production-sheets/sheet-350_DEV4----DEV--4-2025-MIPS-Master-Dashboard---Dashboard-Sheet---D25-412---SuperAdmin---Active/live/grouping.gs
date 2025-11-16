



const SOURCE_SHEET_NAME = "All MIPS Visits (Main)"

const SHEET_NAME = "MIPS Visits x Week"





function processVisitsGroupingData() {


  //return

  try {
    removeAllGroups_(SHEET_NAME)
  } catch (err) { Logger.log(err) }



  let ss = SpreadsheetApp.getActiveSpreadsheet()
  let sourceSheet = ss.getSheetByName(SOURCE_SHEET_NAME)

  sourceSheet.getRange("A2:M").sort([{ column: 4, ascending: false }])

  sourceSheet.getRange("A2:M").setNumberFormat("@STRING@");

  SpreadsheetApp.flush()
  Utilities.sleep(1000)

  let sourceData = sourceSheet.getRange("A2:M").getRichTextValues()


  sourceSheet.getRange("D2:D").setNumberFormat("MM/dd/yyyy");

  const sheet = ss.getSheetByName(SHEET_NAME);

  sheet.getRange("A2:M").clearContent()

  sheet.deleteRows(3, sheet.getMaxRows() - 2)

  sheet.showRows(1, sheet.getMaxRows())

  sourceSheet.getRange(2, 1, sheet.getMaxRows() - 1, sheet.getLastColumn()).copyTo(sheet.getRange(2, 1, sheet.getMaxRows() - 1, sheet.getLastColumn()), SpreadsheetApp.CopyPasteType.PASTE_FORMAT);


  sheet.getRange("A2:M").clearContent();
  sheet.getRange("C2:C").setFontWeight('normal')

  SpreadsheetApp.flush()

  sheet.getRange(2, 1, sourceData.length, sourceData[0].length).setRichTextValues(sourceData);

  SpreadsheetApp.flush();

  sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).sort([{ column: 4, ascending: false }])

  const dataRange = sheet.getDataRange();
  const data = dataRange.getValues();

  const dateColumnIndex = 3;
  let firstFlage = true
  let lastWeek = ""
  let startAndEndDate = ""

  let groupLastRow = data.length

  let totalVisits = 0;
  for (var i = data.length - 1; i >= 0; i--) {
    const date = data[i][dateColumnIndex];
    let yearWeekKey = ""
    let tempStartEndDate = ""
    try {
      let year = date.getFullYear();
      let weekNumber = getWeekNumber(date);
      tempStartEndDate = getStartAndEndFromWeek(weekNumber, date.getFullYear())
      yearWeekKey = `${year}, Week ${weekNumber}`;
    } catch (err) {
      yearWeekKey = lastWeek
      tempStartEndDate = startAndEndDate
    }

    if (firstFlage) {
      lastWeek = yearWeekKey
      startAndEndDate = tempStartEndDate
      firstFlage = false
    }

    totalVisits++

    if (yearWeekKey != lastWeek || i == 0) {

      sheet.insertRows(i + 2)
      sheet.getRange(i + 2, 1, 1, sheet.getLastColumn()).clearDataValidations()
      sheet.getRange(i + 2, 1, 1, sheet.getLastColumn()).clearContent()
      sheet.getRange(i + 2, 3).setValue(lastWeek + " ---- " + startAndEndDate+" ---- Total: "+totalVisits)
      //sheet.getRange(i + 2, 3).setValue(totalVisits)
      sheet.getRange(i + 2, 3).setFontWeight('bold')
      sheet.getRange(i + 3, 1, groupLastRow - (i + 1), sheet.getMaxColumns()).activate()
        .shiftRowGroupDepth(1);


      sheet.getRowGroup(i + 3, 1).collapse()

      lastWeek = yearWeekKey
      startAndEndDate = tempStartEndDate

      totalVisits = 0

      groupLastRow = i + 1

    }

  }


  try {
    storeScriptTimestamp_("Group MIPS Visits X Week")
  } catch (err) { }
}




function removeAllGroups_(SheetName) {
  const ss = SpreadsheetApp.getActive();
  const ssId = ss.getId();
  const sheetId = ss.getSheetByName(SheetName).getSheetId();
  const n = Sheets.Spreadsheets.get(ssId, { ranges: [SheetName] }).sheets[0].rowGroups.reduce((n, { depth }) => n < depth ? depth : n, 0);
  const requests = Array(n).fill("").map(_ => ({ deleteDimensionGroup: { range: { sheetId, dimension: "ROWS" } } }));
  Sheets.Spreadsheets.batchUpdate({ requests }, ssId);
}








// Helper function to get the ISO week number
function getWeekNumber(date) {
  const firstJan = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date - firstJan) / (24 * 60 * 60 * 1000));
  return Math.ceil((days + firstJan.getDay() + 1) / 7);
}








function testWeeDates() {
  Logger.log(getStartAndEndFromWeek(43, 2024))
}



function getStartAndEndFromWeek(weekNumber, year) {
  // Create a date for January 1st of the given year
  let date = new Date(year, 0, 1);

  // Get the day of the week for January 1st (0 = Sunday, 1 = Monday, etc.)
  let dayOfWeek = date.getDay();

  // Calculate the number of days to add to reach the first Monday of the year
  let daysToAdd = dayOfWeek <= 1 ? 1 - dayOfWeek : 8 - dayOfWeek;
  date.setDate(date.getDate() + daysToAdd);

  // Add the weeks to reach the specified week
  date.setDate(date.getDate() + (weekNumber - 1) * 7);

  let endDate = new Date(date)

  endDate = new Date(endDate.setDate(endDate.getDate() + 6));

  let weekStartEnd = "(" + date.toLocaleDateString() + " - " + endDate.toLocaleDateString() + ")"

  return weekStartEnd;
}








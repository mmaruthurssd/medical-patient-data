

const MM_SHEET = "MM Visits to Fix"

const AK_SHEET = "AK Visits to Fix"

const LM_SHEET = "LM Visits to Fix"

const KP_SHEET = "KP Visits to Fix"



function providersGroupingProcessMM() {
  processVisitsToFixGroupingData(MM_SHEET, "Maruthur, Mario")

  try {
    storeScriptTimestamp_("Group MM")
  } catch (err) { }
}

function providersGroupingProcessAK() {
  processVisitsToFixGroupingData(AK_SHEET, "Keely, Adrienne")

  try {
    storeScriptTimestamp_("Group AK")
  } catch (err) { }
}

function providersGroupingProcessLM() {
  processVisitsToFixGroupingData(LM_SHEET, "Miller, Lauren")

  try {
    storeScriptTimestamp_("Group LM")
  } catch (err) { }
}

function providersGroupingProcessKP() {
  processVisitsToFixGroupingData(KP_SHEET, "Parker, Kaitlyn")

  try {
    storeScriptTimestamp_("Group KP")
  } catch (err) { }
}




function processVisitsToFixGroupingData(SheetName, Provider) {

  //return

  try {
    removeAllGroups_(SheetName)
  } catch (err) { Logger.log(err) }



  let ss = SpreadsheetApp.getActiveSpreadsheet()
  let sourceSheet = ss.getSheetByName(SOURCE_SHEET_NAME)

  sourceSheet.getRange("A2:M").sort([{ column: 3, ascending: false }])

  sourceSheet.getRange("A2:M").setNumberFormat("@STRING@");

  SpreadsheetApp.flush()
  Utilities.sleep(1000)

  let sourceData = sourceSheet.getRange("A2:M").getRichTextValues()


  sourceSheet.getRange("C2:C").setNumberFormat("MM/dd/yyyy");

  const sheet = ss.getSheetByName(SheetName);

  sheet.getRange("A2:M").clearContent()

  sheet.deleteRows(3, sheet.getMaxRows() - 2)

  sheet.showRows(1, sheet.getMaxRows())

  sourceSheet.getRange(2, 1, sheet.getMaxRows() - 1, sheet.getLastColumn()).copyTo(sheet.getRange(2, 1, sheet.getMaxRows() - 1, sheet.getLastColumn()), SpreadsheetApp.CopyPasteType.PASTE_FORMAT);


  sheet.getRange("A2:M").clearContent();
  sheet.getRange("B2:B").setFontWeight('normal')

  SpreadsheetApp.flush()

  if (Provider == "Parker, Kaitlyn") {
    sourceData = sourceData.filter(r => (r[3].getText() == Provider || r[3].getText() == "Kennedy, Kelsey") && (r[10].getText().includes("Unfavorable") || r[10].getText().includes("Exception")))
  } else {
    sourceData = sourceData.filter(r => r[3].getText() == Provider && (r[10].getText().includes("Unfavorable") || r[10].getText().includes("Exception")))
  }
  sheet.getRange(2, 1, sourceData.length, sourceData[0].length).setRichTextValues(sourceData);

  SpreadsheetApp.flush();

  sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).sort([{ column: 3, ascending: false }])

  const dataRange = sheet.getDataRange();
  const data = dataRange.getValues();

  const dateColumnIndex = 2;
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
      //totalVisits--

      sheet.insertRows(i + 2)
      sheet.getRange(i + 2, 1, 1, sheet.getLastColumn()).clearDataValidations()
      sheet.getRange(i + 2, 1, 1, sheet.getLastColumn()).clearContent()
      sheet.getRange(i + 2, 2).setValue(lastWeek + " ---- " + startAndEndDate + " ---- Total: " + totalVisits)
      sheet.getRange(i + 2, 2).setFontWeight('bold')
      sheet.getRange(i + 3, 1, groupLastRow - (i + 1), sheet.getMaxColumns()).activate()
        .shiftRowGroupDepth(1);


      sheet.getRowGroup(i + 3, 1).collapse()

      lastWeek = yearWeekKey

      startAndEndDate = tempStartEndDate

      totalVisits = 0

      groupLastRow = i + 1

    }

  }

}

















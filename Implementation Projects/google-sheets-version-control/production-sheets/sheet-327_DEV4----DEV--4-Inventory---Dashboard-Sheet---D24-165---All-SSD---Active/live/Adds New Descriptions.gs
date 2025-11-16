function onEdit(e) {
  const sheet = e.range.getSheet();
  const editedRange = e.range;

  // Check if the edited range is within AN2:AP20
  const triggerRange = sheet.getRange("AN2:AP20");
  if (!rangesIntersect(editedRange, triggerRange)) return;

  const inputRange = sheet.getRange("AN2:AP20");
  const inputData = inputRange.getValues();

  const auxSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Aux");
  if (!auxSheet) {
    Logger.log("Sheet 'Aux' not found.");
    return;
  }

  // Get existing data in AI to determine the next available row
  const existingData = auxSheet.getRange("AI:AI").getValues();
  let nextRow = existingData.findIndex(row => row[0] === "");
  if (nextRow === -1) nextRow = existingData.length;

  const transferData = [];
  const rowsToClear = [];

  for (let i = 0; i < inputData.length; i++) {
    const row = inputData[i];
    const [valAN, valAO, valAP] = row;

    // ✅ Only transfer if ALL 3 values are filled (not empty)
    const allFilled = valAN !== "" && valAO !== "" && valAP !== "";

    if (allFilled) {
      transferData.push([valAN, valAO, valAP]);
      rowsToClear.push(i); // Record index for clearing later
    }
  }

  if (transferData.length === 0) return;

  // Write to Aux sheet
  auxSheet.getRange(nextRow + 1, 35, transferData.length, 3).setValues(transferData);

  // Clear transferred rows in AN:AP
  for (let i = 0; i < rowsToClear.length; i++) {
    const rowIndex = rowsToClear[i] + 2; // Because range starts at row 2
    sheet.getRange(`AN${rowIndex}:AP${rowIndex}`).clearContent();
  }
}

// Helper function to check if two ranges intersect
function rangesIntersect(range1, range2) {
  const r1RowStart = range1.getRow();
  const r1RowEnd = r1RowStart + range1.getNumRows() - 1;
  const r1ColStart = range1.getColumn();
  const r1ColEnd = r1ColStart + range1.getNumColumns() - 1;

  const r2RowStart = range2.getRow();
  const r2RowEnd = r2RowStart + range2.getNumRows() - 1;
  const r2ColStart = range2.getColumn();
  const r2ColEnd = r2ColStart + range2.getNumColumns() - 1;

  const rowsOverlap = r1RowStart <= r2RowEnd && r2RowStart <= r1RowEnd;
  const colsOverlap = r1ColStart <= r2ColEnd && r2ColStart <= r1ColEnd;

  return rowsOverlap && colsOverlap;
}



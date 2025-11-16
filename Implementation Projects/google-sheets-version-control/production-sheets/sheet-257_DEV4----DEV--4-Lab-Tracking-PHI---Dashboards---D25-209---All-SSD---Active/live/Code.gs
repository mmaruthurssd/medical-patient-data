function onEdit(e) {
  const sheetName = "Lab Test Tracking";
  const colA = 1;
  const colB = 2;
  const colC = 3;
  const colK = 11;

  const sheet = e.range.getSheet();
  if (sheet.getName() !== sheetName) return;
  if (e.range.getColumn() !== colK) return;
  if (e.value !== "Complete") return;

  const dataRange = sheet.getDataRange();
  let data = dataRange.getValues();
  const numCols = data[0].length;

  // Find the first row with Column A = 4
  let indexOf4 = -1;
  // Collect rows with Column A = 5
  let rowsWith5 = [];

  for (let i = 0; i < data.length; i++) {
    if (data[i][colA - 1] === 4 && indexOf4 === -1) {
      indexOf4 = i;
    }
    if (data[i][colA - 1] === 5) {
      rowsWith5.push({ index: i, row: data[i] });
    }
  }

  if (indexOf4 === -1 || rowsWith5.length === 0) return; // nothing to do

  // Delete rows with 5 bottom-up (to avoid shifting issues)
  for (let i = rowsWith5.length - 1; i >= 0; i--) {
    sheet.deleteRow(rowsWith5[i].index + 1);
  }

  // Insert rows with 5 below the row with 4
  let insertAt = indexOf4 + 2; // +2 because rows are 1-indexed and insertRowBefore inserts before
  for (const item of rowsWith5) {
    sheet.insertRowBefore(insertAt);
    sheet.getRange(insertAt, 1, 1, numCols).setValues([item.row]);
    insertAt++;
  }

  // Clear all contents in Column A except header (row 1)
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, colA, lastRow - 1).clearContent();
  }

  // Place the formula in A1
  const formula = '=ARRAYFORMULA(IF(B1:B="End", 6,IF(K1:K="Complete",5,IF(K1:K="Team Notified",3,IF(B1:B="Y",4,IF(C1:C="",1,2))))))';
  sheet.getRange("A1").setFormula(formula);
  SpreadsheetApp.flush();
  Utilities.sleep(300); // Wait for formula recalculation

  // === SORT rows below the "Y" in Column B by Column C (timestamp) newest to oldest ===

  // Refresh data after formula recalculation
  data = sheet.getDataRange().getValues();

  // Find the first row with "Y" in Column B
  let indexOfY = -1;
  for (let i = 0; i < data.length; i++) {
    if (data[i][colB - 1] === "Y") {
      indexOfY = i;
      break;
    }
  }
  if (indexOfY === -1) return; // No "Y" found in column B

  // Define the range of rows below the "Y"
  const startRow = indexOfY + 2; // +2 because data is zero-indexed, sheet rows 1-indexed, and we want rows below "Y"
  const numRowsToSort = sheet.getLastRow() - (startRow - 1);

  if (numRowsToSort <= 1) return; // Nothing to sort or only 1 row

  // Sort the range below "Y" by Column C descending (newest first)
  sheet.getRange(startRow, 1, numRowsToSort, numCols)
    .sort([{ column: colC, ascending: false }]);
}




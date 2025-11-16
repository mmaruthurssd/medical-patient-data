// ------- CONFIG -------
var HOME_SHEET = "Patient list"; // source/default tab
var STATUS_TO_SHEET = {
  "transferred to collection agency": "Patients Transferred",
  "patient paid in full": "Patients Paid in Full",
  "adjusted balance": "Patients w/Bad Debt adjusted",
  "paid through collection agency": "Paid thru Collection Agency"
};
// Columns/rows
var STATUS_COL = 1;  // A
var MOVE_END_COL = 4; // A..D
var HEADER_ROW = 1;  // headers on row 1

/**
 * Optional menu for convenience (doesn't auto-run)
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("AR Router")
    .addItem("Run Status Routing", "runStatusRouting")
    .addToUi();
}



/**
 * Click your button to run this.
 * Moves rows among HOME + destination tabs based on Status (col A).
 * Unmapped/blank statuses go back to HOME_SHEET.
 */
function runStatusRouting() {
  var ss = SpreadsheetApp.getActive();
  var tabs = [HOME_SHEET].concat(Object.values(STATUS_TO_SHEET));

  // Process each tab bottom-up (avoid index shifts)
  for (var t = 0; t < tabs.length; t++) {
    var sh = ss.getSheetByName(tabs[t]);
    if (!sh) throw new Error('Missing sheet: ' + tabs[t]);

    var lastRow = sh.getLastRow();
    if (lastRow <= HEADER_ROW) continue;

    const allData = sh.getRange(1, 1, sh.getLastRow(), MOVE_END_COL).getValues()

    for (var r = allData.length - 1; r > 0; r--) {

      let status = allData[r][0]
      if (!status) continue

      let key = status.toString().toLowerCase().trim();

      let destName = STATUS_TO_SHEET[key] || HOME_SHEET; // default back to HOME
      if (destName === sh.getName()) continue;

      let dest = ss.getSheetByName(destName);
      if (!dest) throw new Error('Missing destination sheet: ' + destName);

      //var values = sh.getRange(r, 1, 1, MOVE_END_COL).getValues();
      let destRow = dest.getLastRow() + 1;
      dest.getRange(destRow, 1, 1, MOVE_END_COL).setValues([allData[r]]);

      sh.deleteRow(r + 1);
    }
  }
}

function normalizeStatus_(v) {
  if (v == null) return "";
  return String(v).trim().toLowerCase();
}

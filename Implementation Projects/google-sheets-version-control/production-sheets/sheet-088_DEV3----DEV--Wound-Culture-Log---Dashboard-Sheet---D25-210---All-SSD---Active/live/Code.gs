


const WOUND_CULTURES_SHEET = "Wound Cultures Tracking"


// shifted this function to https://docs.google.com/spreadsheets/d/1xcSEuVy9r6zvF_HL1sMxMwT50JdbcRtHLJ7EEgCgvGg/
function onFormSubmitInstalled(e) {
  return;
  const ss = e.source;
  const wcSheet = ss.getSheetByName(WOUND_CULTURES_SHEET);

  const values = e.values;

  wcSheet.getRange(wcSheet.getLastRow() + 1, 3, 1, values.length).setValues([values])

  wcSheet.getRange(2, 1, wcSheet.getLastRow() - 1, wcSheet.getLastColumn()).sort([{ column: 1, ascending: true }]);

}






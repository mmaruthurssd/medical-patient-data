

const DAILY_TASK_TEMPLATE = "Daily Task Template"
const ID_TRACKER_SHEET = "Task_ID_Tracker"


function onEdit(e) {

  const ActiveSheet = e.source.getActiveSheet();

  if (ActiveSheet.getName() == DAILY_TASK_TEMPLATE) {
    let range = e.range;
    let row = range.getRow();
    let col = range.getColumn();


    if (row > 2 && col == 6 && e.value != "" && e.value != null) {
      let existingId = ActiveSheet.getRange(row, 2).getValue();
      if (existingId == "") {
        const idTracker = e.source.getSheetByName(ID_TRACKER_SHEET);
        let lastId = idTracker.getRange("A2").getValue();
        let newID = lastId + 1
        idTracker.getRange("A2").setValue(newID);
        ActiveSheet.getRange(row, 2, 1, 2).setValues([["SMA-" + newID, "Surgery MA"]])

      }
    }
  }

  if (ActiveSheet.getName() !== 'Microtasks List')
    return;

  const HeaderRow = ActiveSheet.getRange(1, 1, 1, ActiveSheet.getLastColumn()).getValues()[0];
  const StatusColIndex = HeaderRow.indexOf('Status');

  if (e.range.getColumn() === StatusColIndex + 1)
    sortMicrotasksList();

}


function sortMicrotasksList() {
  const ActiveSheet = SpreadsheetApp.getActive().getSheetByName('Microtasks List');
  const LastRow = ActiveSheet.getLastRow()
  const LastColumn = ActiveSheet.getLastColumn()
  ActiveSheet.getRange(2, 1, LastRow - 1, LastColumn).sort({ column: 1, ascending: true });
};


function onEditSort(e) {

  const ActiveSheet = e.source.getActiveSheet();

  // Check if the active sheet is one of the specified tabs
  if (ActiveSheet.getName() !== 'LM Reschedule Tracker' &&
      ActiveSheet.getName() !== 'AK Reschedule Tracker' &&
      ActiveSheet.getName() !== 'KP Reschedule Tracker' &&
      ActiveSheet.getName() !== 'MM Reschedule Tracker') {
    return;
  }

  const HeaderRow = ActiveSheet.getRange(1, 1, 1, ActiveSheet.getLastColumn()).getValues()[0];
  const RescheduleColIndex = HeaderRow.indexOf('Reschedule Date');

  if (e.range.getColumn() === RescheduleColIndex + 1) {
    const CompletedColIndex = HeaderRow.indexOf('Completed?');
    let row = e.range.getRow();
    let completed = ActiveSheet.getRange(row, CompletedColIndex + 1).getValue();
    if (completed == "Yes") {
      sortMicrotasksList(ActiveSheet);
    }
  }
}


function sortMicrotasksList(ActiveSheet) {
  const LastRow = ActiveSheet.getLastRow();
  const LastColumn = ActiveSheet.getLastColumn();
  ActiveSheet.getRange(2, 1, LastRow - 1, LastColumn).sort({ column: 1, ascending: true });
};






function onEditMicro(e) {

  const ActiveSheet = e.source.getActiveSheet();
  
  if (ActiveSheet.getName() !== 'Microtasks List')
    return;
  
  const HeaderRow = ActiveSheet.getRange(1, 1, 1, ActiveSheet.getLastColumn()).getValues()[0];
  const StatusColIndex = HeaderRow.indexOf('Status');
  
  if (e.range.getColumn() === StatusColIndex + 1)
    sortMicrotasksList(ActiveSheet);

}


// function sortMicrotasksList() {
//   const ActiveSheet = SpreadsheetApp.getActive().getSheetByName('Microtasks List');
//   const LastRow = ActiveSheet.getLastRow()
//   const LastColumn = ActiveSheet.getLastColumn()
//   ActiveSheet.getRange(2, 1, LastRow - 1, LastColumn).sort({column: 1, ascending: true});
// };

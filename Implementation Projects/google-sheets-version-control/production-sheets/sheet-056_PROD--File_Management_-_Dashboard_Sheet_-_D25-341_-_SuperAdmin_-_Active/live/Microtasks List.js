
function sortMicrotasksList_(ActiveSheet) {

  const LastRow = ActiveSheet.getLastRow()
  const LastColumn = ActiveSheet.getLastColumn()
  ActiveSheet.getRange(2, 1, LastRow - 1, LastColumn).sort([{ column: 1, ascending: true }, { column: 3, ascending: false }]);
}


// function sortMasterMicrotasksList_(ActiveSheet) {
//   const LastRow = ActiveSheet.getLastRow()
//   const LastColumn = ActiveSheet.getLastColumn()
//   ActiveSheet.getRange(2, 1, LastRow - 1, LastColumn).sort([{ column: 1, ascending: true }]);
// };


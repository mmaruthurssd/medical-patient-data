
function getMsgIds_() {
  const MsgLogSheet = SpreadsheetApp.getActive().getSheetByName('Log');
  const MsgIds = MsgLogSheet.getRange(1, 1, MsgLogSheet.getLastRow(), 1).getValues().map(row => row[0]);
  return MsgIds;
}


function addMsgId_(MsgId) {
  const MsgLogSheet = SpreadsheetApp.getActive().getSheetByName('Log');
  MsgLogSheet.appendRow([MsgId]);
}


function sortData_(SheetName) {
  const ActiveSheet = SpreadsheetApp.getActive().getSheetByName(SheetName);

  try {
    ActiveSheet.getRange(2, 1, ActiveSheet.getLastRow() - 1, ActiveSheet.getLastColumn()).sort([{ column: 1, ascending: false }, { column: 2, ascending: false }]);
  } catch (err) { }
  //ActiveSheet.getDataRange().sort([{column: 1, ascending: false}, {column: 2, ascending: false}]);
}


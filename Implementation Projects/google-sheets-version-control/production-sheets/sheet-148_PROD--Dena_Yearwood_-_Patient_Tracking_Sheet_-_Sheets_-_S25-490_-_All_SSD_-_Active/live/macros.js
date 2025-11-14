/** @OnlyCurrentDoc */

function AddNewPARequest() {
  var spreadsheet = SpreadsheetApp.getActive();
  spreadsheet.getRange('3:3').activate();
  spreadsheet.setCurrentCell(spreadsheet.getRange('B3'));
  spreadsheet.getActiveSheet().insertRowsBefore(spreadsheet.getActiveRange().getRow(), 1);
  spreadsheet.getActiveRange().offset(0, 0, 1, spreadsheet.getActiveRange().getNumColumns()).activate();
};
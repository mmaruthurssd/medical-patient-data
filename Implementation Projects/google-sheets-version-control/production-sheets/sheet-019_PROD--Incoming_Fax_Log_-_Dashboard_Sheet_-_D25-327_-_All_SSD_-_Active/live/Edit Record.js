
function includeFile(fileName) {
  const htmlFile = HtmlService.createHtmlOutputFromFile(fileName).getContent();
  return htmlFile;
}


function showEditRecordDialog() {

  const ActiveSheet = SpreadsheetApp.getActive().getActiveSheet();
  const ActiveSheetName = ActiveSheet.getName();
  const RowNumber = ActiveSheet.getActiveCell().getRow();

  const SheetsList = ['Admin', 'PAs', 'Billing', 'Tabatha', 'Lauren_Millers_Team'];

  if (!SheetsList.includes(ActiveSheetName) || RowNumber < 2) return;

  const Html = HtmlService.createTemplateFromFile('Edit Form').evaluate().setWidth(400).setHeight(450);
  SpreadsheetApp.getUi().showModalDialog(Html, 'Edit Record');

}


function getData() {
  
  const DropdownSheet = SpreadsheetApp.getActive().getSheetByName('Dropdowns');
  const FaxStatusValues = DropdownSheet.getRange('D2:D').getValues().filter(row => row[0] !== '').map(row => row[0]);

  const FaxStatus = '<option></option>' + FaxStatusValues
                                            .map(item => `<option value="${item}">${item}</option>`).join('');

  const ActiveSheet = SpreadsheetApp.getActive().getActiveSheet();
  const RowNumber = ActiveSheet.getActiveCell().getRow();
  const RecordId = ActiveSheet.getRange('A' + RowNumber).getValue();
  const DataValues = ActiveSheet.getRange('K' + RowNumber + ':P' + RowNumber).getValues()[0];
  
  DataValues.unshift(RecordId);

  if (DataValues[DataValues.length - 1] !== '')
    DataValues[DataValues.length - 1] = new Date(DataValues[DataValues.length - 1]).toISOString().split('T')[0];
  
  console.log(FaxStatusValues);
  
  DataValues.unshift(FaxStatus)

  return DataValues.join('|');

}


function updateData(FormData) {
  
  try {
    
    const RecordId = FormData['recordId'];
    
    const FaxLogSheet = SpreadsheetApp.getActive().getSheetByName('Incoming_Fax_Log');
    const RecordIds = FaxLogSheet.getRange('A:A').getValues().map(row => row[0].toString());
    const RowNumber = RecordIds.indexOf(RecordId.toString());

    console.log(RecordId);
    console.log(RowNumber);

    if (RowNumber !== -1) {
      FaxLogSheet.getRange('K' + (RowNumber + 1)).setValue(FormData['faxStatus']);
      FaxLogSheet.getRange('M' + (RowNumber + 1)).setValue(FormData['faxAssignmentNotes']);
      FaxLogSheet.getRange('N' + (RowNumber + 1)).setValue(FormData['otherFaxNotes']);
      FaxLogSheet.getRange('O' + (RowNumber + 1)).setValue(FormData['patientId']);
      FaxLogSheet.getRange('P' + (RowNumber + 1)).setValue(FormData['patientDob']);
    }
    
    return true;
  }
  catch {
    console.log(error.toString());
    return false;
  }

}



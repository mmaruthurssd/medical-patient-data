
function viewPatientDetails() {

  const ActiveSheet = SpreadsheetApp.getActive().getActiveSheet();
  const ColHeaderText = ActiveSheet.getRange('E3').getValue();
  const ActiveRow = ActiveSheet.getActiveCell().getRow();

  if (ColHeaderText !== 'Patient MRN' || ActiveRow < 4) {
    return;
  }

  const PatientId = ActiveSheet.getRange('E' + ActiveRow).getValue();

  const DetailsSheet = SpreadsheetApp.getActive().getSheetByName('All Previous Interactions');
  DetailsSheet.activate();
  DetailsSheet.getRange('B1').setValue(PatientId);

}

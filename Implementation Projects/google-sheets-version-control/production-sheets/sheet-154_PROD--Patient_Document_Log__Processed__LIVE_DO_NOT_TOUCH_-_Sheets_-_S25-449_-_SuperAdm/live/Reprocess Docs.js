
function reprocessPatientDocuments() {

  const PatientDocsSpreadsheetId = '14YH1iw1rGDlULfzhXEcbjc2TnKYmxQI55C2VW3iZTuc'
  const PatientsDocSpreadsheet = SpreadsheetApp.openById(PatientDocsSpreadsheetId);
  
  console.log('process started ...');

  const DocsLogSheet = PatientsDocSpreadsheet.getSheetByName('Testing_Documents_Log');
  const InOutLogSheet = PatientsDocSpreadsheet.getSheetByName('Input_Output_Log');
 
  const PatientsDocuments = DocsLogSheet.getRange('L:R').getValues();
  const SelectedDocs = PatientsDocuments.filter(row => row[5] === true);

  if (SelectedDocs.length === 0) {
    console.log('no documents selected ...');
    return;
  }

  const SelectedFileNames = SelectedDocs.map(row => row[0]);
  const InOutLogData = InOutLogSheet.getRange('A:F').getDisplayValues();
  
  console.log('getting parent files ...');
  const ParentFilesData = [];

  SelectedFileNames.forEach(SelectedFileName => {
    const ParentFileData = InOutLogData.filter(row => row[2] === SelectedFileName);
    if (ParentFileData.length !== 0) {
      ParentFilesData.push(ParentFileData[0]);
    }
  });

  if (ParentFilesData.length === 0) {
    console.log('parent files were not found ...');
    return;
  }

  const ParentFilesName = ParentFilesData.map(row => row[1]);
  console.log(ParentFilesName);

  console.log('getting child files ...');
  const ChildFilesName = [];

  ParentFilesName.forEach(ParentFileName => {
    const ChileFileData = InOutLogData.filter(row => row[1] === ParentFileName).map(row => row[2]);
    ChildFilesName.push(...ChileFileData);
  });
  
  console.log(ChildFilesName);
  console.log('marking child files as inactive ...');

  const AllFileNames = PatientsDocuments.map(row => row[0]);

  ChildFilesName.forEach(ChileFileName => {
    const index = AllFileNames.indexOf(ChileFileName);
    DocsLogSheet.getRange('Q' + (index + 1)).setValue(false);
    DocsLogSheet.getRange('R' + (index + 1)).setValue(true);
  });

  console.log('updating list of parent files for reprocessing ...');

  const OutputFilesData = ParentFilesData.map(row => [row[1], row[3], row[4], row[5]]);

  const TestOutputSheet = PatientsDocSpreadsheet.getSheetByName('Test_Ouput');
  TestOutputSheet.getRange(TestOutputSheet.getLastRow() + 1, 1, OutputFilesData.length, OutputFilesData[0].length)
                    .setValues(OutputFilesData);

}


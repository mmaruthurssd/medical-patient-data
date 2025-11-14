
function consolidateMicrotasksFromAllCoreFiles() {

  // const TimeLimit = 120; // 2 minutes = 120 seconds
  const TimeLimit = 1500; //25 minutes = 1500 seconds
  const StartTime = new Date().getTime() / 1000;
  let isTimeLimitReached = false;

  const TaskSheetName = 'Microtasks List';
  const TaskSheetRange = 'C2:L';
  const ConsolidatedRange = 'C2:L';
  const CoreFilesRange = 'A2:G';

  const MicroTasksAuxSheet = SpreadsheetApp.getActive().getSheetByName('Microtasks_Aux');
  const ProjectsAuxSheet = SpreadsheetApp.getActive().getSheetByName('Projects_Aux');

  let coreFiles = MicroTasksAuxSheet.getRange(CoreFilesRange).getValues();

  // check for file id and consolidated columns
  if (coreFiles.filter(row => row[2] !== '' && row[6] === '').length === 0) {
    console.log('no files to consolidate ...');
    return;
  };

  // consolidated sheet
  let dataValues = [];
  const FirstColumn = 3;
  const ConsolidatedSheet = SpreadsheetApp.getActive().getSheetByName('Microtasks_Consolidated');
  
  // check for file id and consolidated columns
  if (coreFiles.filter(row => row[2] !== '' && row[6] !== '').length === 0) {
    
    ConsolidatedSheet.getRange(ConsolidatedRange).clearContent();

    // merge data from projects aux sheet
    const MicroTasksAux = MicroTasksAuxSheet.getRange('A2:B').getValues()
                                              .filter(row => row[0] !== '' && row[1] !== '');

    const ProjectsAux = ProjectsAuxSheet.getRange('A2:B').getValues()
                                            .filter(row => row[0] !== '' && row[1] !== '');
  
    const ConsolidatedAux = [...MicroTasksAux, ...ProjectsAux];

    MicroTasksAuxSheet.getRange('A2:B').clearContent();
    MicroTasksAuxSheet.getRange(2, 1, ConsolidatedAux.length, 2).setValues(ConsolidatedAux).removeDuplicates();

    SpreadsheetApp.flush();

  }
  else {
    const ExistingData = ConsolidatedSheet.getRange(ConsolidatedRange).getValues().filter(row => row[0] !== '');
    dataValues = [...dataValues, ...ExistingData];
    // console.log(dataValues);
  }

  let i = 0;
  console.log('getting data from core files ...');

  while (i < coreFiles.length && isTimeLimitReached === false) {

    const [FileName, FileId, Consolidated] = [coreFiles[i][0], coreFiles[i][2], coreFiles[i][6]];

    if (FileId !== '' && Consolidated === '') {

      try {

        console.log('getting data from ' + FileName);

        const CoreFile = SpreadsheetApp.openById(FileId);
        const TaskSheet = CoreFile.getSheetByName(TaskSheetName);
        const TasksData = TaskSheet.getRange(TaskSheetRange).getDisplayValues()
                                      .filter(row => row[1] !== '' && row[2] !== '');

        dataValues = [...dataValues, ...TasksData];

        // update status in aux sheet
        MicroTasksAuxSheet.getRange('G' + (i + 2)).setValue('Success');

        console.log('data pulled successfully ...');

      }

      catch(e) {
        console.log('error getting data ...');
        console.log(e);
        // update status in aux sheet
        MicroTasksAuxSheet.getRange('G' + (i + 2)).setValue('Failed');
      }

    }

    i++;

    const currentTime = new Date().getTime() / 1000;
      
    if (currentTime - StartTime >= TimeLimit)
      isTimeLimitReached = true;

  }

  if (dataValues.length > 0) {
    ConsolidatedSheet.getRange(ConsolidatedRange).clearContent();
    ConsolidatedSheet.getRange(2, FirstColumn, dataValues.length, dataValues[0].length).setValues(dataValues);
  }

  SpreadsheetApp.flush();
  coreFiles = MicroTasksAuxSheet.getRange(CoreFilesRange).getValues();

  // check for file id and consolidated columns
  if (coreFiles.filter(row => row[2] !== '' && row[6] === '').length > 0) {
    console.log('creating trigger for next execution ...');
    removeTriggerForNextExecution_('consolidateMicrotasksFromAllCoreFiles');
    createTriggerForNextExecution_('consolidateMicrotasksFromAllCoreFiles', 10);
  }
  else {
    MicroTasksAuxSheet.getRange('G2:G').clearContent();
    console.log('removing trigger ...');
    removeTriggerForNextExecution_('consolidateMicrotasksFromAllCoreFiles');
    createTriggerForNextExecution_('consolidateMicrotasksFromAllCoreFiles', 10);
  }

}














function updateMicrotasksListTemplateInCoreFiles() {

  // const TimeLimit = 120; // 2 minutes = 120 seconds
  const TimeLimit = 1500; //25 minutes = 1500 seconds
  const StartTime = new Date().getTime() / 1000;
  let isTimeLimitReached = false;

  const UI = SpreadsheetApp.getUi();
  let Response = UI.alert('Are you sure you want to update the template in core files?', UI.ButtonSet.YES_NO);

  if (Response === UI.Button.NO)
    return;


  let sheetExists = false;
  const TopSectionRowMaxRows = 5;
  const FirstColumn = 3;
  // const CoreFilesRange = 'A2:F4'
  const CoreFilesRange = 'A2:G'

  const AuxSheet = SpreadsheetApp.getActive().getSheetByName('Microtasks_Aux');
  let coreFiles = AuxSheet.getRange(CoreFilesRange).getValues();

  // check for file id and template updated columns
  if (coreFiles.filter(row => row[2] !== '' && row[5] === '').length === 0) {
    console.log('no files to update ...');
    return;
  };

  const TemplateSheet = SpreadsheetApp.getActive().getSheetByName('Microtasks List - Template');
  const TemplateLastColumn = TemplateSheet.getLastColumn();
  const TemplateSheetHeader = TemplateSheet.getRange(1, FirstColumn, 1, TemplateLastColumn).getValues()[0];


  let i = 0;

  while (i < coreFiles.length && isTimeLimitReached === false) {

    const [FileName, FileId, TemplateStatus] = [coreFiles[i][0], coreFiles[i][2], coreFiles[i][5]];

    if (FileId !== '' && TemplateStatus === '') {

      try {

        console.log('updating template in ' + FileName);

        const TargetSpreadsheet = SpreadsheetApp.openById(FileId);
        const AllSheets = TargetSpreadsheet.getSheets();

        // loop through sheets in the target spreadsheet
        for (const CurrentSheet of AllSheets) {

          if (CurrentSheet.getName() === 'Microtasks List _ archived') {
            TargetSpreadsheet.deleteSheet(CurrentSheet);
            console.log('previous archived sheet deleted ...');
          }

          else if (CurrentSheet.getName() === 'Microtasks List') {
            sheetExists = true;
            console.log('microtasks sheet exists ...');
          }

        }

        // update the microtasks list sheet if it exists
        if (sheetExists === true) {

          console.log('updating microtask list sheet ...');

          const OldTaskSheet = TargetSpreadsheet.getSheetByName('Microtasks List')
          const NewTaskSheet = TemplateSheet.copyTo(TargetSpreadsheet).activate();
          TargetSpreadsheet.moveActiveSheet(0);

          const LastRow = OldTaskSheet.getLastRow();
          const LastColumn = OldTaskSheet.getLastColumn();

          const InactiveStatus = ['Complete', 'Cancelled'];

          const OldTaskHeader = OldTaskSheet.getRange(1, 3, LastRow - 1, LastColumn).getValues()[0];
          const OldTaskData = OldTaskSheet.getRange(2, 3, LastRow - 1, LastColumn).getValues();

          const TaskColIndex = OldTaskHeader.indexOf('Microtask');
          const StatusColIndex = OldTaskHeader.indexOf('Status');

          // status is that of inactive tasks
          const InactiveTasks = OldTaskData.filter(row => InactiveStatus.includes(row[StatusColIndex]));

          // task column is not balnk and status is not that of inactive tasks or is blank
          const ActiveTasks = OldTaskData.filter(row => row[TaskColIndex] !== '' &&
            (row[StatusColIndex] === '' ||
              !InactiveStatus.includes(row[StatusColIndex])));

          // add inactive tasks at the bottom
          if (InactiveTasks.length > 0) {

            console.log('mapping inactive tasks ...');

            const DataValues = [];

            InactiveTasks.forEach(DataRow => {

              const TaskRow = Array.from(TemplateSheetHeader).fill('');

              // map the columns to fill data values
              TemplateSheetHeader.forEach((ColHeader, HeaderIndex) => {
                if (ColHeader !== '') {
                  const ColIndexToCopy = OldTaskHeader.indexOf(ColHeader);
                  if (ColIndexToCopy !== -1) {
                    TaskRow[HeaderIndex] = DataRow[ColIndexToCopy];
                  }
                }
              });

              DataValues.push(TaskRow);

            });

            NewTaskSheet.getRange(TopSectionRowMaxRows + 3, 3, DataValues.length, DataValues[0].length)
              .setValues(DataValues);

          }

          // add active tasks at the top
          if (ActiveTasks.length > 0) {

            console.log('mapping active tasks ...');

            const DataValues = [];

            ActiveTasks.forEach(DataRow => {

              const TaskRow = Array.from(TemplateSheetHeader).fill('');

              // map the columns to fill data values
              TemplateSheetHeader.forEach((ColHeader, HeaderIndex) => {
                if (ColHeader !== '') {
                  const ColIndexToCopy = OldTaskHeader.indexOf(ColHeader);
                  if (ColIndexToCopy !== -1) {
                    TaskRow[HeaderIndex] = DataRow[ColIndexToCopy];
                  }
                }
              });

              DataValues.push(TaskRow);

            });

            // add extra rows to the top section to match the number of tasks in existing sheet
            const RowsToInsert = ActiveTasks.length - TopSectionRowMaxRows
            NewTaskSheet.insertRows(6, RowsToInsert);

            console.log('adding tasks to the new sheet ...');
            NewTaskSheet.getRange(2, 3, DataValues.length, DataValues[0].length).setValues(DataValues);

          }

          console.log('renaming sheets ...');

          OldTaskSheet.setName('Microtasks List _ archived');
          NewTaskSheet.setName('Microtasks List');

          // update status in aux sheet
          AuxSheet.getRange('F' + (i + 2)).setValue('Success');

        }

      }

      catch (e) {
        console.log(e);
        // update status in aux sheet
        AuxSheet.getRange('F' + (i + 2)).setValue('Failed');
      }

    }

    Utilities.sleep(10000) // 10 seconds

    i++;

    const currentTime = new Date().getTime() / 1000;

    if (currentTime - StartTime >= TimeLimit)
      isTimeLimitReached = true;

  }



  SpreadsheetApp.flush();
  coreFiles = AuxSheet.getRange(CoreFilesRange).getValues();

  // check for file id and template updated columns
  if (coreFiles.filter(row => row[2] !== '' && row[5] === '').length > 0) {
    console.log('creating trigger for next execution ...');
    removeTriggerForNextExecution_('updateMicrotasksListTemplateInCoreFiles');
    createTriggerForNextExecution_('updateMicrotasksListTemplateInCoreFiles');
  }
  else {
    AuxSheet.getRange('F2:F').clearContent();
    console.log('removing trigger ...');
    removeTriggerForNextExecution_('updateMicrotasksListTemplateInCoreFiles');
  }

}














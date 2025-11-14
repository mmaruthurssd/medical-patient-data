
// function onOpen(e) {
//   SpreadsheetApp.getUi()
//     .createMenu('Utilities')
//       .addItem('Update Template in Core Files', 'updateMicrotasksListTemplateInCoreFiles')
//         .addToUi();
// }


function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Utilities')
    .addItem('Process All Files', 'processBulkFiles')//syncCheckedLinks
    .addSeparator()
    .addItem('Sync Intranet Index', 'syncCheckedLinks')
    .addSeparator()
    .addItem('Update Intranet Tab List', 'listSheetNamesFromLinkedUrls')
    .addToUi();
}


function createTriggerForNextExecution_(functionName, AfterXMinutes) {

  // const AfterXMinutes = 10;
  const NextDateTime = new Date().getTime() + (1000 * 60 * AfterXMinutes);
  const NextHour = new Date(NextDateTime).getHours();
  const NextMinutes = new Date(NextDateTime).getMinutes();

  ScriptApp.newTrigger(functionName)
    .timeBased()
    .everyDays(1)
    .atHour(NextHour)
    .nearMinute(NextMinutes)
    .create()

  console.log('trigger created ...');

}


function removeTriggerForNextExecution_(functionName) {

  const Triggers = ScriptApp.getProjectTriggers();

  for (let i in Triggers) {

    const FuncName = Triggers[i].getHandlerFunction()

    if (FuncName === functionName) {
      ScriptApp.deleteTrigger(Triggers[i]);
      console.log('trigger removed ...');
    }

  }

}


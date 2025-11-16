
function newRecord() {
  
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert('This will clear all the data. Are you sure you want to continue?',ui.ButtonSet.YES_NO);
  
  if (response === ui.Button.YES) {

    const activeSheet = SpreadsheetApp.getActive().getActiveSheet();
    clearFields(activeSheet);
    fillFormulas(activeSheet);

  }

}

//==============================================================================================//

function findRecord(){

  const activeSheet = SpreadsheetApp.getActive().getActiveSheet();
  const strCode = activeSheet.getRange('F2').getValue();

  if(strCode === '')
    Browser.msgBox('Please select a valid Record # to find the record.');
  else {
    clearFields(activeSheet);
    activeSheet.getRange('F2').setValue(strCode);
    fillData(activeSheet);
    fillFormulas(activeSheet);
    Browser.msgBox('Record with the selected id was found successfully.');
  }

}

//==============================================================================================//

function addRecord() {

  const ui = SpreadsheetApp.getUi();
  const response = ui.alert('Are you sure you want to Add this record?',ui.ButtonSet.YES_NO);
  
  if (response === ui.Button.NO)
    return;
  
  const activeSheet = SpreadsheetApp.getActive().getActiveSheet();
  const dbNoteSheet = SpreadsheetApp.getActive().getSheetByName('High_Risk_Patients_DB');

  fillFormulas(activeSheet);
  addDataToDbSheets('add', activeSheet, dbNoteSheet, NaN);

  fillData(activeSheet);
  fillFormulas(activeSheet);

  Browser.msgBox('The record has been added successfully.');

}

//==============================================================================================//

function updateRecord() {

  const activeSheet = SpreadsheetApp.getActive().getActiveSheet();  
  const strCode = activeSheet.getRange('F2').getValue();

  if (strCode === '') {
    Browser.msgBox('Please select a valid Record # to update the record.');
    return;
  }

  const ui = SpreadsheetApp.getUi();
  const response = ui.alert('Are you sure you want to Update this record?',ui.ButtonSet.YES_NO);
  
  if (response === ui.Button.NO)
    return;

  const dbNoteSheet = SpreadsheetApp.getActive().getSheetByName('High_Risk_Patients_DB');
  const noteCodeRange = dbNoteSheet.getRange('A:A').getValues().map(row => row[0]);
  const noteRowNumber = noteCodeRange.indexOf(strCode);

  if (noteRowNumber === -1) {
    Browser.msgBox('No record was found with this Id to update the record.');
    return;
  }
  
  fillFormulas(activeSheet);
  addDataToDbSheets('update', activeSheet, dbNoteSheet, noteRowNumber);

  fillData(activeSheet);
  fillFormulas(activeSheet);

  Browser.msgBox('The record has been updated successfully.');

}

//==============================================================================================//

function deleteRecord(){
  
  const activeSheet = SpreadsheetApp.getActive().getActiveSheet();  
  const strCode = activeSheet.getRange('F2').getValue();

  if (strCode === '')
    Browser.msgBox('Please select a valid Record ID to delete the record.');
  
  else {  
    const ui = SpreadsheetApp.getUi();
    let response = ui.alert('Are you sure you want to Delete this record?',ui.ButtonSet.YES_NO);
    
    if (response === ui.Button.NO)
      return;

    response = ui.alert('Deleting the record will result in it being permanently removed from the database.'
                  +'\n'+'Please confirm you wish to proceed?',ui.ButtonSet.YES_NO);
      
    if (response === ui.Button.NO)
      return;
      
    // get the codes list from the notes db sheet and delete the relevant row
    const dbNoteSheet = SpreadsheetApp.getActive().getSheetByName('High_Risk_Patients_DB');
    const noteCodeRange = dbNoteSheet.getRange('A:A').getValues().map(row => row[0]);
    const noteRowNumber = noteCodeRange.indexOf(strCode);

    if (noteRowNumber === -1){
      Browser.msgBox('No record was found with this Id to be deleted.');
      return;
    }
 
    dbNoteSheet.deleteRow(noteRowNumber + 1);
    clearFields(activeSheet);
    fillFormulas(activeSheet);

    Browser.msgBox('The record has been deleted successfully.');

  }

}

//==============================================================================================//


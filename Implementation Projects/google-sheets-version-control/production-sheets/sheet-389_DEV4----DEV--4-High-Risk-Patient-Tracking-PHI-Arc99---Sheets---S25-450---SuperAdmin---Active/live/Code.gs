
function clearFields(activeSheet) {
  
  activeSheet.getRange('F2').clearContent();
  activeSheet.getRange('F4:F14').clearContent();

}

//==============================================================================================//

function fillFormulas(activeSheet) {

  let formulaRange = activeSheet.getRange('C5:C7').getFormulas();
  activeSheet.getRange('F5:F7').setFormulas(formulaRange);

  formulaRange = activeSheet.getRange('C9').getFormulas();
  activeSheet.getRange('F9').setFormulas(formulaRange);

}

//==============================================================================================//

function fillData(activeSheet) {
  
  let dataValues = activeSheet.getRange('B4:B14').getValues();
  activeSheet.getRange('F4:F14').setValues(dataValues);

}

//==============================================================================================//

function addDataToDbSheets(mode, activeSheet, dbNoteSheet, noteRowNumber) {
  
  // if new record then generate the new record #
  if (mode === 'add')
    generateNewRecordId(activeSheet, dbNoteSheet);

  const noteDataValues = getDbNoteDataValues(activeSheet);

  if (mode === 'add')
    dbNoteSheet.getRange(dbNoteSheet.getLastRow()+1,1,1,noteDataValues.length).setValues([noteDataValues]);

  else if (mode === 'update')
    dbNoteSheet.getRange(noteRowNumber + 1,1,1,noteDataValues.length).setValues([noteDataValues]);

}

//==============================================================================================//

function generateNewRecordId(activeSheet, dbNoteSheet) {

  // get the codes list from the notes db sheet
  const codeRange = dbNoteSheet.getRange('A2:A').getValues().map(row => row[0]).filter(row => row !== '');

  // generate new code and insert in code cell of the active sheet
  if (codeRange.length === 0)
    activeSheet.getRange('F2').setValue(1001);
  else
    activeSheet.getRange('F2').setValue(Math.max(...codeRange) + 1);

}

//==============================================================================================//

function getDbNoteDataValues(activeSheet) {

  const activeSheetName = activeSheet.getName();
  const dbFieldsSheet = SpreadsheetApp.getActive().getSheetByName('DB_Fields');
  const dbFieldsRange = dbFieldsSheet.getDataRange().getDisplayValues().filter(row => row[0] !== '');
  const headerRow = dbFieldsRange[0];
  const valuesColumn = headerRow.indexOf(activeSheetName);
  const dataValues = dbFieldsRange.map(row => row[valuesColumn]);
  dataValues.shift() // remove the header row from dataset
  // console.log(dataValues);
  return dataValues;

}

//==============================================================================================//


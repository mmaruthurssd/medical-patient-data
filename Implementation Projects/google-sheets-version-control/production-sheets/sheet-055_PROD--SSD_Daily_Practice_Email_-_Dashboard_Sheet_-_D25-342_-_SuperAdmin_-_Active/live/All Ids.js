


function GetIds_() {

  const ScriptIdsSpreadsheet = SpreadsheetApp.openById('1nbu0Z3JS1ZH_QKjcOoQJ7ohDPOVqlQMQ597XLBqiOd8');
  const ScriptIdsSheet = ScriptIdsSpreadsheet.getSheetByName('All_Ids_For_Scripts');
  const ScriptIdsData = ScriptIdsSheet.getRange('A2:C').getValues().filter(row => row[0] !== '');

  if (ScriptIdsData.length === 0) return;

  const ScriptIdsObject = {};

  ScriptIdsData.forEach(row => {
    const [Category, Name, Id] = [row[0], row[1], row[2]];

    if (!(Category in ScriptIdsObject))
      ScriptIdsObject[Category] = {};

    ScriptIdsObject[Category][Name] = Id;
  });

  // console.log(ScriptIdsObject);
  return ScriptIdsObject;

}


const SpreadsheetIds = GetIds_()['SpreadsheetIds'];





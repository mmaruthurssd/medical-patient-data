




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













//below function will return true if the arg is valid date and false if not.
function isValidDate_(d) {
  if (Object.prototype.toString.call(d) !== "[object Date]")
    return false;
  return !isNaN(d.getTime());
}










function getSheetByID_(ss, sheetID) {
  let allSheets = ss.getSheets();

  return allSheets.filter(s => s.getSheetId().toString() == sheetID)[0]
}









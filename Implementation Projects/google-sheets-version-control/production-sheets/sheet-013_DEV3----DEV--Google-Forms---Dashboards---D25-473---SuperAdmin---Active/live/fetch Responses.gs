



function onOpen() {
  let ui = SpreadsheetApp.getUi();

  let menu = ui.createMenu("Custom");

  menu.addItem("Fetch Responses", "fetchResponses").addToUi()
  //menu.addItem("Close Form", "closeGoogleForm").addToUi()
}




function fetchResponses() {
  let ss = SpreadsheetApp.getActiveSpreadsheet();

  let sheet = ss.getSheetByName(EXISTING_FORMS_SHEET);

  let allLiveForms = sheet.getRange(3, 6, sheet.getLastRow() - 2, 1).getValues();


  allLiveForms.forEach((row, index) => {

    try {

      let formId = getFormIdFromUrl(row[0]);

      //Logger.log(formId)
      if (formId != null) {
        let responses = getReponsesNow(formId)
        sheet.getRange(index + 3, 10).setValue(responses.length)
      }
    } catch (err) { Logger.log(err) }

  })


}





function getReponsesNow(formId) {


  let form = FormApp.openById(formId);
  let allResponses = form.getResponses();
  let responses = []

  allResponses.forEach(resp => {
    responses.push([formId, resp.getRespondentEmail(), resp.getTimestamp()])
  })


  return responses

}



function getFormIdFromUrl(url) {
  const regex = /\/forms\/d\/([a-zA-Z0-9-_]+)\//;
  const match = url.match(regex);
  if (match && match[1]) {
    const formId = match[1];
    return formId;
  } else {
    return null;
  }
}
















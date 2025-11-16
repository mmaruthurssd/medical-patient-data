


const RESPONSES_SHEET = "Responses_"


function onEditInstall(e) {
  let ss = e.source;
  let sheet = ss.getActiveSheet();

  //View Form Responses
  if (sheet.getSheetId() == 1327027446) {

    let range = e.range;
    let a1Notation = range.getA1Notation()

    if (a1Notation == "B3") {

      let respSheet = ss.getSheetByName(RESPONSES_SHEET);
      try {
        respSheet.getRange(2, 1, respSheet.getLastRow() - 1, respSheet.getLastColumn()).clearContent()
      } catch (err) { }


      let value = e.value;
      if (value != "" && value != null) {
        let formUrl = sheet.getRange("VIEW_FORM_FORM_URL").getValue();
        let formId = getFormIdFromUrl(formUrl)

        let form = FormApp.openById(formId);
        let allResponses = form.getResponses();
        let responses = []

        allResponses.forEach(resp => {
          responses.push([formId, resp.getRespondentEmail(), resp.getTimestamp()])
        })

        if (responses.length > 0) {
          respSheet.getRange(2, 1, responses.length, responses[0].length).setValues(responses)
        }

      }

    }

    //Update Google Form
  } else if (sheet.getSheetId() == 909701561) {

    // if(){

    // }

  }



}

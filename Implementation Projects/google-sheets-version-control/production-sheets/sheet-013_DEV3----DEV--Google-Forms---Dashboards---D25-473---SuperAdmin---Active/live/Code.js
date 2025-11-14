


const FORM_FOLDER_ID = "1gFU8Qo0ggJ8OVLig3bmI1YNGT-fSKTdn"

const SPREADSHEET_FOLDER_ID = "1gn7sA2ly3Cd9SAFiyMMt79DQ84tE7vX5"

const RESPONSES_TEMP_SHEET_ID = "1E7pvvc4Jv8OvNXGIv7s8UNV5QMDTxPGm0b8e5U3Y0pc"




const FORM_BUILDER_SHEET_NAME = "New Google Form Builder";

const FORM_TEMPLATES_SHEET = "Google Form Templates (Main)";


const EXISTING_FORMS_SHEET = "All Sent Google Forms"

const PERMANENT_FORMS_SHEET = "Permanent Forms"


const LIVE_FORM_SHEET = "Live Forms"






function createNewGoogleForms() {

  let ui = SpreadsheetApp.getUi();

  try {
    SpreadsheetApp.getActive().toast("Form Creation", "⚙️ Processing", 5);

    let ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getActiveSheet();

    let formName = sheet.getRange("B3").getValue();
    let templateName = sheet.getRange("B4").getValue();
    let permanent = sheet.getRange("B5").getDisplayValue();




    let templateID = getTemplateId(ss, templateName)
    let newForm = duplicateFormAndLinkToSheet_(templateID, formName)




    let allEmployees = sheet.getRange(8, 1, sheet.getLastRow() - 7, sheet.getLastColumn()).getValues();
    let selectedEmployees = allEmployees.filter(row => row[2] == true || row[2] == "TRUE")

    let employeeNames = selectedEmployees.map(row => row[0])
    let employeeEmails = selectedEmployees.map(row => row[1])


    let falseArray = new Array(allEmployees.length).fill([false])


    if (permanent == "Yes") {
      let permanentFormSheet = ss.getSheetByName(PERMANENT_FORMS_SHEET)
      permanentFormSheet.appendRow([new Date(), formName, templateName, newForm.publishUrl, newForm.ssUrl, newForm.formEditUrl, employeeNames.join(", "), employeeEmails.join(", "), ""])
      permanentFormSheet.getRange(2, 1, permanentFormSheet.getLastRow() - 1, permanentFormSheet.getLastColumn()).sort([{ column: 1, ascending: false }])
      sheet.getRange("B3").setValue("")
      sheet.getRange("B5").setValue("")
      sheet.getRange(8, 3, falseArray.length, 1).setValues(falseArray)
      return
    }

    //Logger.log(newForm)




    let existingFormSheet = ss.getSheetByName(EXISTING_FORMS_SHEET)
    existingFormSheet.appendRow([new Date(), formName, templateName, newForm.publishUrl, newForm.ssUrl, newForm.formEditUrl, employeeNames.join(", "), employeeEmails.join(", "), employeeEmails.length, "", "", "Open"])

    existingFormSheet.getRange(3, 1, existingFormSheet.getLastRow() - 2, existingFormSheet.getLastColumn()).sort([{ column: 14, ascending: true }, { column: 1, ascending: false }])


    sheet.getRange(8, 3, falseArray.length, 1).setValues(falseArray)


    // let liveFormSheet = ss.getSheetByName(LIVE_FORM_SHEET);
    // liveFormSheet.appendRow([new Date(), formName, newForm.formUrl, newForm.publishUrl, newForm.ssUrl, employeeNames.join(", "), employeeNames.length])


    sheet.getRange("B3").setValue("")

  } catch (err) {
    ui.alert("⚠️Error:\n" + err)
    return
  }


  ui.alert("🎉Successful\nForm Created!")





}






// function testSort() {

//   let ss = SpreadsheetApp.getActiveSpreadsheet();

//   let existingFormSheet = ss.getSheetByName(EXISTING_FORMS_SHEET)
//   existingFormSheet.getRange(3, 1, existingFormSheet.getLastRow() - 2, existingFormSheet.getLastColumn()).sort({ column: 1, ascending: false })
// }









function duplicateFormAndLinkToSheet_(templateID, formName) {


  let formFolder = DriveApp.getFolderById(FORM_FOLDER_ID);
  let copiedFormFile = DriveApp.getFileById(templateID).makeCopy(formName, formFolder);
  copiedFormFile.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.VIEW);

  let copiedForm = FormApp.openById(copiedFormFile.getId());

  copiedForm.setTitle(formName)
  copiedForm.setAcceptingResponses(true);


  let spreadsheetFolder = DriveApp.getFolderById(SPREADSHEET_FOLDER_ID);
  let responseSSFile = DriveApp.getFileById(RESPONSES_TEMP_SHEET_ID).makeCopy(formName + " (Responses)", spreadsheetFolder);
  copiedForm.setDestination(FormApp.DestinationType.SPREADSHEET, responseSSFile.getId());

  let newForm = {
    publishUrl: copiedForm.getPublishedUrl(),
    id: copiedFormFile.getId(),
    ssUrl: responseSSFile.getUrl(),
    formEditUrl: copiedFormFile.getUrl(),
  }
  // Log the URL of the new form
  //Logger.log('New Form URL: ' + copiedForm.getPublishedUrl());


  return newForm
}








function getTemplateId(ss, templateName) {
  let formTemplateSheets = ss.getSheetByName(FORM_TEMPLATES_SHEET);

  let allTemplates = formTemplateSheets.getRange(1, 1, formTemplateSheets.getLastRow(), 4).getValues()
  let formTempNames = allTemplates.map(row => row[2])

  let indexOfTemp = formTempNames.indexOf(templateName);

  if (indexOfTemp > -1) {
    //Logger.log(allTemplates[indexOfTemp][3])
    //Logger.log(getFormIdFromUrl(allTemplates[indexOfTemp][3]))
    return getFormIdFromUrl(allTemplates[indexOfTemp][3])
  }

  return null
}












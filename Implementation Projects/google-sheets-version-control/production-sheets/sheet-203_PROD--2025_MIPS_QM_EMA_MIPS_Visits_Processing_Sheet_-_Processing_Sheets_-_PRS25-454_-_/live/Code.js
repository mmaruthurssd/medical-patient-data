


const EMA_MIPS_VISITS_RAW_DATA_SS_ID = "1ff3FS6TC-2R5CHJXidKg8IdqW_u5G6xvYM6uGCUIs6Q";


//const EMA_MIPS_VISITS_RAW_DATA_SHEETS = ["Tobacco", "Melanoma", "Psoriasis: Systemic Medications", "Adolescents", "Dermatitis: Itch Severity", "Psoriasis: Itch Severity"]



function onOpen() {
  let ui = SpreadsheetApp.getUi();

  let menu = ui.createMenu("Custom");

  menu.addItem("Fetch Raw Visits", "fetchNewEMAMIPSRawVisits").addToUi()
}


function fetchNewEMAMIPSVisits() {

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const visitSheet = ss.getSheetByName("Visits");

  archiveVisits_(visitSheet)


  const mipsRawSS = SpreadsheetApp.openById(EMA_MIPS_VISITS_RAW_DATA_SS_ID);




  //EMA_MIPS_VISITS_RAW_DATA_SHEETS.forEach(SheetName => {

  let rawSheet = mipsRawSS.getSheetByName("New MIPS Visit Data");
  rawSheet.getRange("A2:L").setNumberFormat("@STRING@");

  SpreadsheetApp.flush()
  Utilities.sleep(1000)

  let allVisitsRich = rawSheet.getRange(1, 1, rawSheet.getLastRow(), 12).getRichTextValues();
  allVisitsRich.splice(0, 1)

  if (allVisitsRich.length != 0) {
    visitSheet.getRange(2, 1, allVisitsRich.length, allVisitsRich[0].length).setRichTextValues(allVisitsRich)

  }

  rawSheet.getRange("C2:C").setNumberFormat("MM/dd/yyyy");
  rawSheet.getRange("A2:M").clearContent()

  //})



  let facility = visitSheet.getRange("G2:G").getValues();
  facility.forEach(f => {
    if (f[0] == "Southern Skies Dermatology") {
      f[0] = "Trussville"
    }
  })


  visitSheet.getRange(1, 7, facility.length, 1).setValues(facility)

}














function archiveVisits_(visitSheet) {
  let range = visitSheet.getRange("A2:L"); // Change to the desired column
  range.setNumberFormat("@STRING@");
  SpreadsheetApp.flush()
  Utilities.sleep(1000)

  let allVisitsRich = visitSheet.getRange(1, 1, visitSheet.getLastRow(), 12).getRichTextValues();
  allVisitsRich.splice(0, 1)

  allVisitsRich = allVisitsRich.filter(r => r[1].getText() != "" || r[3].getText() != "")

  visitSheet.getRange("C2:C").setNumberFormat("MM/dd/yyyy");

  if (allVisitsRich.length == 0) return

  const mipsRawSS = SpreadsheetApp.openById(EMA_MIPS_VISITS_RAW_DATA_SS_ID);
  const archiveSheet = mipsRawSS.getSheetByName("Archived MIPS Visits");
  let archiveLastRow = archiveSheet.getLastRow();
  archiveSheet.getRange(archiveLastRow + 1, 2, allVisitsRich.length, allVisitsRich[0].length).setRichTextValues(allVisitsRich)

  let todayDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
  let datesArray = new Array(allVisitsRich.length).fill([todayDate])
  archiveSheet.getRange(archiveLastRow + 1, 1, datesArray.length, 1).setValues(datesArray)

  visitSheet.getRange("A2:N").clearContent()
}




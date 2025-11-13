


const CL_TEMP_DOC_ID = "1PE2SXuJ-eZ8R6qALiCdSN9En_nMSkvHvEDZllyrr7Ug"

const OUTPUT_FOLDER_ID = "1N62Cp_ysCOPbAG03-72-XhdhhmstKhWn"


const THIS_SS_ID = "1Mg0nZSt9PsoW7W7D2dXqHgU1KsO_gz78D1CGdtwizX0"
const CLP_SHEET = "Certified Letter Pending"
const CLP_DOC_SHEET = "CLP_"
const CLP_SELECTED_DOC_SHEET = "CPL_Selected"


const DB_CPL = "[DB] CLP"



function onOpen() {
  const ui = SpreadsheetApp.getUi();
  const menu = ui.createMenu("Certified Letters");
  menu.addItem("Fetch New Pending Letters", "updateCPLData").addToUi()
  menu.addItem("Create Bulk Pending Letters", "createPendingDocMain").addToUi()
  menu.addItem("Create Selected Pending Letters", "createSelectedDocMain").addToUi()
  menu.addItem("Mark Sent", "markSent").addToUi()
}




function updateCPLData() {

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const destSheet = ss.getSheetByName(CLP_SHEET);
  const destHeaders = destSheet.getRange(1, 1, 1, destSheet.getLastColumn()).getDisplayValues()[0];
  const destHeadersObj = {};
  for (var i = 0; i < destHeaders.length; i++) {
    destHeadersObj[destHeaders[i]] = i
  }
  const destIds = destSheet.getRange(1, destHeadersObj["ID"] + 1, destSheet.getLastRow(), 1).getValues().map(r => r[0])

  const sourceSheet = ss.getSheetByName(DB_CPL);
  const sourceData = sourceSheet.getRange(1, 1, sourceSheet.getLastRow(), sourceSheet.getLastColumn()).getDisplayValues()
  const sourceHeaders = sourceData.splice(0, 1)[0];
  const sourceHeadersObj = {};
  for (var i = 0; i < sourceHeaders.length; i++) {
    sourceHeadersObj[sourceHeaders[i]] = i
  }


  let newDestData = [];
  for (var i = 0; i < sourceData.length; i++) {
    if (sourceData[i][sourceHeadersObj["ID"]] == "") continue

    let idIndex = destIds.indexOf(sourceData[i][sourceHeadersObj["ID"]])
    if (idIndex > -1) continue

    let rowData = new Array(destHeaders.length).fill("")
    for (const key in destHeadersObj) {
      if (sourceHeadersObj[key] || sourceHeadersObj[key] === 0) {
        rowData[destHeadersObj[key]] = sourceData[i][sourceHeadersObj[key]]
      }
    }
    rowData[destHeadersObj["Certified Letter Status"]] = "Pending Letter"

    newDestData.push(rowData)
    destIds.push(sourceData[i][sourceHeadersObj["ID"]])
  }


  if (newDestData.length > 0) {
    destSheet.getRange(destSheet.getLastRow() + 1, 1, newDestData.length, newDestData[0].length).setValues(newDestData)
    SpreadsheetApp.flush()
    destSheet.getRange(2, 1, destSheet.getLastRow() - 1, destSheet.getLastColumn()).sort({ column: 1, ascending: true });
  }

}



function markSent() {

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CLP_SHEET);

  //const allData = sheet.getRange(1, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getDisplayValues();
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0]

  const Col = {
    letterStatus: headers.indexOf(`Certified Letter Status`),
  }

  let allStatus = sheet.getRange(1, Col.letterStatus + 1, sheet.getLastRow(), 1).getValues();

  allStatus.forEach(r => {
    if (r[0] == "Printed") {
      r[0] = "Sent"
    }
  })


  sheet.getRange(1, Col.letterStatus + 1, allStatus.length, 1).setValues(allStatus);

}



function createPendingDocMain() {

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CLP_SHEET);

  const allData = sheet.getRange(1, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getDisplayValues();
  const headers = allData.splice(0, 1)[0];

  const Col = {
    id: headers.indexOf("ID"),
    mrn: headers.indexOf("PATIENT MRN"),
    pName: headers.indexOf("PATIENT NAME"),
    bcDate: headers.indexOf("BIOPSY COLLECTED DATE"),
    bbLocation: headers.indexOf("BIOPSY BODY LOCATION"),
    prDiagnosis: headers.indexOf("PATH RESULT DIAGNOSIS"),
    prPlan: headers.indexOf("PATH RESULT PLAN"),
    resolved: headers.indexOf(`Bx status updated to "Unresolved" and workflow to "Letter Sent" in EMA`),
    genLetter: headers.indexOf(`Generate Selected Letter`),
    letterStatus: headers.indexOf(`Certified Letter Status`),
  }

  let statusColData = sheet.getRange(2, Col.letterStatus + 1, sheet.getLastRow() - 1, 1).getValues()

  let dataForDoc = {};
  allData.forEach((row, index) => {
    if (row[Col.letterStatus] == "Pending Letter" && row[Col.mrn] != "") {
      if (dataForDoc[row[Col.mrn]]) {
        dataForDoc[row[Col.mrn]].push(row)
      } else {
        dataForDoc[row[Col.mrn]] = [];
        dataForDoc[row[Col.mrn]].push(row)
      }

      statusColData[index][0] = "Printed"
    }
  })

  const outputSheet = ss.getSheetByName(CLP_DOC_SHEET)
  createAndMergeDocs_(ss, Col, headers, dataForDoc, outputSheet, "Certified Letters Bulk")

  sheet.getRange(2, Col.letterStatus + 1, statusColData.length, 1).setValues(statusColData)

  SpreadsheetApp.flush()
  sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).sort({ column: 1, ascending: true });

}



function createSelectedDocMain() {

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CLP_SHEET);

  const allData = sheet.getRange(1, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getDisplayValues();
  const headers = allData.splice(0, 1)[0];

  const Col = {
    id: headers.indexOf("ID"),
    mrn: headers.indexOf("PATIENT MRN"),
    pName: headers.indexOf("PATIENT NAME"),
    bcDate: headers.indexOf("BIOPSY COLLECTED DATE"),
    bbLocation: headers.indexOf("BIOPSY BODY LOCATION"),
    prDiagnosis: headers.indexOf("PATH RESULT DIAGNOSIS"),
    prPlan: headers.indexOf("PATH RESULT PLAN"),
    resolved: headers.indexOf(`Bx status updated to "Unresolved" and workflow to "Letter Sent" in EMA`),
    genLetter: headers.indexOf(`Generate Selected Letter`),
    letterStatus: headers.indexOf(`Certified Letter Status`),
  }

  let genLetterColData = sheet.getRange(2, Col.genLetter + 1, sheet.getLastRow() - 1, 1).getValues()
  let statusColData = sheet.getRange(2, Col.letterStatus + 1, sheet.getLastRow() - 1, 1).getValues()

  let dataForDoc = {};
  allData.forEach((row, index) => {
    if ((row[Col.genLetter] == true || row[Col.genLetter] == "TRUE") && row[Col.mrn] != "") {
      if (dataForDoc[row[Col.mrn]]) {
        dataForDoc[row[Col.mrn]].push(row)
      } else {
        dataForDoc[row[Col.mrn]] = [];
        dataForDoc[row[Col.mrn]].push(row)
      }

      statusColData[index][0] = "Printed"
      genLetterColData[index][0] = false
    }
  })

  const outputSheet = ss.getSheetByName(CLP_SELECTED_DOC_SHEET)

  createAndMergeDocs_(ss, Col, headers, dataForDoc, outputSheet, "Certified Letters Selected")

  sheet.getRange(2, Col.genLetter + 1, genLetterColData.length, 1).setValues(genLetterColData)
  sheet.getRange(2, Col.letterStatus + 1, statusColData.length, 1).setValues(statusColData)

  SpreadsheetApp.flush()
  sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).sort({ column: 1, ascending: true });

}









function createAndMergeDocs_(ss, Col, headers, dataForDoc, outputSheet, fileName) {

  //Patients Demographics Processing Sheet
  const patients = Sheets.Spreadsheets.Values.get(THIS_SS_ID, "Patients!A1:P").values;
  //Logger.log(patients)
  const patientsHeaders = patients.splice(0, 1)[0]

  const patientMrnColIndex = patientsHeaders.indexOf("Patient MRN")
  //const pal2ColIndex = patientsHeaders.indexOf("Patient Address Line 2")
  const allMrns = patients.map(r => r[patientMrnColIndex].toString().trim())




  //const outputFolder = DriveApp.getFolderById(OUTPUT_FOLDER_ID)
  let todayDate = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "M/dd/yyyy")

  let docName = fileName + " - " + todayDate
  // Create master doc as a *copy* of template so header/footer & styles carry over.
  const masterDoc = createMasterFromTemplate_(CL_TEMP_DOC_ID, docName, OUTPUT_FOLDER_ID);
  const masterDocUrl = masterDoc.getUrl()
  let masterBody = masterDoc.getBody();
  //Logger.log(masterDocUrl)

  // Open template once; we’ll clone its body for each row.
  const templateDoc = DocumentApp.openById(CL_TEMP_DOC_ID);
  const templateBody = templateDoc.getBody();

  let outputUrlsDetails = []
  let count = 0;
  for (const key in dataForDoc) {

    // Optionally insert a page break between records (not before the first).
    if (count > 0 && CFG.INSERT_PAGE_BREAK_BETWEEN) {
      masterBody.appendPageBreak();
      // 1) Append a fresh copy of the template's body content
      masterBody = appendTemplateSection_(templateBody, masterBody);

    }


    const tables = masterBody.getTables();
    const table = tables[count * 2]; // Assumes the first table is for the steps
    let templateRowToCopy = table.getChild(1).copy()

    masterBody.replaceText("{{Date}}", todayDate)
    dataForDoc[key].forEach((row, index) => {
      if (index == 0) {
        let indexOfPatient = allMrns.indexOf(row[Col.mrn]);
        if (indexOfPatient > -1) {
          for (var h = 0; h < patientsHeaders.length; h++) {
            if (patients[indexOfPatient][h] == "-") {
              patients[indexOfPatient][h] = ""
            }
            masterBody.replaceText("{{" + patientsHeaders[h] + "}}", patients[indexOfPatient][h])
          }
        }
        for (var h = 0; h < headers.length; h++) {
          if (row[h] == "-") {
            row[h] = ""
          }
          masterBody.replaceText("{{" + headers[h] + "}}", row[h])
        }
      } else {
        const newRow = table.appendTableRow(templateRowToCopy.copy());
        newRow.getCell(0).setText(row[Col.bcDate]);
        newRow.getCell(1).setText(row[Col.bbLocation]);
        newRow.getCell(2).setText(row[Col.prDiagnosis]);
        newRow.getCell(3).setText(row[Col.prPlan]);
      }

      outputUrlsDetails.push([row[Col.id], masterDocUrl, new Date()])
    })

    count++
  }

  masterDoc.saveAndClose();

  if (outputUrlsDetails.length == 0) return



  outputSheet.getRange(outputSheet.getLastRow() + 1, 1, outputUrlsDetails.length, outputUrlsDetails[0].length).setValues(outputUrlsDetails)
  outputSheet.getRange(2, 1, outputSheet.getLastRow() - 1, 3).sort([{ column: 3, ascending: false }]);



}










// Append a copy of all template body children to dst body.
// Returns the child index range [start, end) in the destination body
// so we can target replacements to just this section.
function appendTemplateSection_(srcBody, dstBody) {
  const startIndex = dstBody.getNumChildren();
  const n = srcBody.getNumChildren();
  for (let i = 0; i < n; i++) {
    const childCopy = srcBody.getChild(i).copy();
    switch (childCopy.getType()) {
      case DocumentApp.ElementType.PARAGRAPH:
        dstBody.appendParagraph(childCopy);
        break;
      case DocumentApp.ElementType.LIST_ITEM:
        dstBody.appendListItem(childCopy);
        break;
      case DocumentApp.ElementType.TABLE:
        dstBody.appendTable(childCopy);
        break;
      case DocumentApp.ElementType.HORIZONTAL_RULE:
        dstBody.appendHorizontalRule();
        break;
      default:
        // Fallback for any other types; try to append as paragraph if possible
        try { dstBody.appendParagraph(childCopy.asParagraph()); } catch (e) { }
        break;
    }
  }

  return dstBody
  //const endIndex = dstBody.getNumChildren();
  //return { startChildIndex: startIndex, endChildIndex: endIndex };
}





function createMasterFromTemplate_(templateId, name, folderId) {
  const folder = DriveApp.getFolderById(folderId);
  const tplFile = DriveApp.getFileById(templateId);
  const copy = tplFile.makeCopy(name, folder);
  return DocumentApp.openById(copy.getId());
}








const OUTPUT_FOLDER_ID = "1rbYovRL8C7ES1JRzpecnMzctY_d30zEs"

function creatingPdf() {

  let ss = SpreadsheetApp.getActiveSpreadsheet();

  let sheet = ss.getActiveSheet()

  let range = sheet.getActiveRange();

  let value = range.getValue()


  let e = {
    source: ss,
    range: range,
    value: value,
  }

  onEditInstall(e)

}




function onEditInstall(e) {

  //return

  let ss = e.source;

  let sheet = ss.getActiveSheet()


  if (sheet.getSheetName() != "Inventory Sheets") {
    onEditSort(e)
    return
  }


  let range = e.range;

  let row = range.getRow();
  let col = range.getColumn();


  if (row < 2) return


  if (col != 3 && col != 6) return



  let value = e.value;


  if (value == true || value == "TRUE") {

    let rowData = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];

    //Logger.log(rowData)

    let locationSheet = null;

    if (col == 3) {
      locationSheet = ss.getSheetByName(SHELF_STOCK_COUNT_LOCATION_SHEET);
      SpreadsheetApp.flush()
      let tempRackShelfPostion = locationSheet.getRange("AD3:AF").getValues();
      if (tempRackShelfPostion > 0) {
        locationSheet.getRange(3, 14, tempRackShelfPostion.length, tempRackShelfPostion[0].length).setValues(tempRackShelfPostion);
      }
    } else if (col == 6) {
      locationSheet = ss.getSheetByName(BULK_STOCK_COUNT_LOCATION_SHEET);
    }

    let locationData = locationSheet.getRange(2, 1, locationSheet.getLastRow() - 1, locationSheet.getLastColumn()).getDisplayValues();

    let LocHeaders = locationData.splice(0, 1)[0]

    let vendorIndex = LocHeaders.indexOf("Vendor")
    let itemNoIndex = LocHeaders.indexOf("Item #")
    let summDescIndex = LocHeaders.indexOf("Summary Description")
    //let stocNoIndex = LocHeaders.indexOf("# to keep in Stock")
    let itemTypeIndex = LocHeaders.indexOf("Item Type")
    //let unitTypeIndex = LocHeaders.indexOf("Unit Type")
    let usageFreq = LocHeaders.indexOf("Usage Frequency")



    let filteredLocationData = []

    if (rowData[0] == 'Trussville') {
      let stocNoIndex = LocHeaders.indexOf("Trussville Stock #")
      if (rowData[1] == "Surgery" || rowData[1] == "Clinic") {
        filteredLocationData = locationData.filter(r => ((r[itemTypeIndex] == rowData[1] || r[itemTypeIndex] == "Clinic & Surgery") && r[stocNoIndex] != "")).map(r => [r[summDescIndex], r[stocNoIndex], "", r[usageFreq], r[vendorIndex], r[itemNoIndex], r[usageFreq] == "High" ? 1 : r[usageFreq] == "Medium" ? 2 : r[usageFreq] == "Low" ? 3 : 4])

      } else {
        filteredLocationData = locationData.filter(r => (r[itemTypeIndex] == rowData[1] && r[stocNoIndex] != "")).map(r => [r[summDescIndex], r[stocNoIndex], "", r[usageFreq], r[vendorIndex], r[itemNoIndex], r[usageFreq] == "High" ? 1 : r[usageFreq] == "Medium" ? 2 : r[usageFreq] == "Low" ? 3 : 4])
      }


    } else if (rowData[0] == 'Gadsden') {
      let stocNoIndex = LocHeaders.indexOf("Gadsden Stock #")

      if (rowData[1] == "Surgery" || rowData[1] == "Clinic") {
        filteredLocationData = locationData.filter(r => ((r[itemTypeIndex] == rowData[1] || r[itemTypeIndex] == "Clinic & Surgery") && r[stocNoIndex] != "")).map(r => [r[summDescIndex], r[stocNoIndex], "", r[usageFreq], r[vendorIndex], r[itemNoIndex], r[usageFreq] == "High" ? 1 : r[usageFreq] == "Medium" ? 2 : r[usageFreq] == "Low" ? 3 : 4])

      } else {
        filteredLocationData = locationData.filter(r => (r[itemTypeIndex] == rowData[1] && r[stocNoIndex] != "")).map(r => [r[summDescIndex], r[stocNoIndex], "", r[usageFreq], r[vendorIndex], r[itemNoIndex], r[usageFreq] == "High" ? 1 : r[usageFreq] == "Medium" ? 2 : r[usageFreq] == "Low" ? 3 : 4])
      }



    } else if (rowData[0] == 'Oxford') {
      let stocNoIndex = LocHeaders.indexOf("Oxford Stock #")

      if (rowData[1] == "Surgery" || rowData[1] == "Clinic") {
        filteredLocationData = locationData.filter(r => ((r[itemTypeIndex] == rowData[1] || r[itemTypeIndex] == "Clinic & Surgery") && r[stocNoIndex] != "")).map(r => [r[summDescIndex], r[stocNoIndex], "", r[usageFreq], r[vendorIndex], r[itemNoIndex], r[usageFreq] == "High" ? 1 : r[usageFreq] == "Medium" ? 2 : r[usageFreq] == "Low" ? 3 : 4])

      } else {
        filteredLocationData = locationData.filter(r => (r[itemTypeIndex] == rowData[1] && r[stocNoIndex] != "")).map(r => [r[summDescIndex], r[stocNoIndex], "", r[usageFreq], r[vendorIndex], r[itemNoIndex], r[usageFreq] == "High" ? 1 : r[usageFreq] == "Medium" ? 2 : r[usageFreq] == "Low" ? 3 : 4])
      }



    } else if (rowData[0] == 'Pell City') {
      let stocNoIndex = LocHeaders.indexOf("Pell City Stock #")

      if (rowData[1] == "Surgery" || rowData[1] == "Clinic") {
        filteredLocationData = locationData.filter(r => ((r[itemTypeIndex] == rowData[1] || r[itemTypeIndex] == "Clinic & Surgery") && r[stocNoIndex] != "")).map(r => [r[summDescIndex], r[stocNoIndex], "", r[usageFreq], r[vendorIndex], r[itemNoIndex], r[usageFreq] == "High" ? 1 : r[usageFreq] == "Medium" ? 2 : r[usageFreq] == "Low" ? 3 : 4])

      } else {
        filteredLocationData = locationData.filter(r => (r[itemTypeIndex] == rowData[1] && r[stocNoIndex] != "")).map(r => [r[summDescIndex], r[stocNoIndex], "", r[usageFreq], r[vendorIndex], r[itemNoIndex], r[usageFreq] == "High" ? 1 : r[usageFreq] == "Medium" ? 2 : r[usageFreq] == "Low" ? 3 : 4])
      }
    }

    sheet.getRange("A55:H").clearContent();


    sheet.getRange(row, 3).setValue(false);

    if (filteredLocationData.length > 0) {
      sheet.getRange("B52").setValue(rowData[0])
      sheet.getRange("E52").setValue(rowData[1])
      sheet.getRange(55, 1, filteredLocationData.length, filteredLocationData[0].length).setValues(filteredLocationData)

      sheet.getRange(55, 1, filteredLocationData.length, sheet.getLastColumn()).sort([{ column: 7, ascending: true }])

      let pdfName = rowData[0] + " " + rowData[1] + " _" + new Date().toLocaleDateString()
      let outputFolder = DriveApp.getFolderById(OUTPUT_FOLDER_ID)

      let pdf = createPDF(ss.getId(), sheet, pdfName, outputFolder)

      let richPdf = SpreadsheetApp.newRichTextValue().setText(pdfName).setLinkUrl(pdf.getUrl()).build()

      if (col == 3) {
        sheet.getRange(row, 4).setRichTextValue(richPdf);
      } else if (col == 6) {
        sheet.getRange(row, 7).setRichTextValue(richPdf);
      }
    } else {

      if (col == 3) {
        sheet.getRange(row, 4).setValue("No Data Found.");
      } else if (col == 6) {
        sheet.getRange(row, 7).setValue("No Data Found.");
      }
    }


  }



}





/**
 * Creates a PDF for the customer given sheet.
 * @param1 {string} ssId - Id of the Google Spreadsheet
 * @param2 {object} sheet - Sheet to be converted as PDF
 * @param3 {string} pdfName - File name of the PDF being created
 * @param4 {object} outputFolder - output folder where the pdf are stored
 * @return {file object} PDF file as a blob
 */
function createPDF(ssId, sheet, pdfName, outputFolder) {
  //DEBUG && Logger.log("START PDF REPORT PROCESS STARTS");
  const fr = 49, fc = 0, lc = 6, lr = sheet.getLastRow();
  const url = "https://docs.google.com/spreadsheets/d/" + ssId + "/export" +
    "?format=pdf&" +
    "size=A4&" +
    "fzr=false&" +
    "portrait=true&" +
    "fitw=true&" +
    "gridlines=false&" +
    "printtitle=false&" +
    "top_margin=0.2&" +
    "bottom_margin=0.2&" +
    "left_margin=0.2&" +
    "right_margin=0.2&" +
    "sheetnames=false&" +
    "pagenum=undefined&" +
    "attachment=true&" +
    "gid=" + sheet.getSheetId() + '&' +
    "r1=" + fr + "&c1=" + fc + "&r2=" + lr + "&c2=" + lc;

  const params = { method: "GET", headers: { "authorization": "Bearer " + ScriptApp.getOAuthToken() } };
  const blob = UrlFetchApp.fetch(url, params).getBlob().setName(pdfName + '.pdf');
  const pdfFile = outputFolder.createFile(blob);
  //DEBUG && Logger.log("PDF REPORT CREATED");
  return pdfFile;
}










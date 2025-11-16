
function openLink() {
  const fileLink = 'https://drive.google.com/file/d/13mWVoBOn_Aq8rkEADx9SXFU0VLSDEJp4/view';
  const html = "<script>window.open('" + fileLink + "');google.script.host.close();</script>";
  const userInterface = HtmlService.createHtmlOutput(html);
  SpreadsheetApp.getUi().showModalDialog(userInterface, 'How to add a new record');
}


function createPDFReport() {
  
  const pdfSheet = SpreadsheetApp.getActive().getSheetByName('PDF_Report');
  const logSheet = SpreadsheetApp.getActive().getSheetByName('PDF_Log');

  if (pdfSheet.isSheetHidden()) pdfSheet.showSheet();
  
  const spreadsheetId = SpreadsheetApp.getActive().getId();
  const pdfSheetId = pdfSheet.getSheetId();
  const pdfFolderId = '1ALPBRRCl0NNuxUDZMOSjd8vBbhP7HN2D';

  const employeeName = pdfSheet.getRange('B3').getValue();
  const expensePeriod = pdfSheet.getRange('B4').getValue();
  const month = expensePeriod.split(' ')[0];
  const year = expensePeriod.split(' ')[1];
  
  const pdfFileName = employeeName + '_' + year + ' ' + month;
  const pdfFileUrl = generatePDF_(spreadsheetId, pdfSheetId, pdfFolderId, pdfFileName);

  const logData = logSheet.getRange('A:D').getValues().filter(row => row[3] !== '');
  logData.push([employeeName, year, month, pdfFileUrl]);
  logSheet.getRange('A:D').clearContent();
  logSheet.getRange(1, 1, logData.length, logData[0].length).setValues(logData);

  pdfSheet.hideSheet();

  Browser.msgBox('The pdf report was created successfully!');

}


function create6PagePDFReport() {
  
  const pdfSheet = SpreadsheetApp.getActive().getSheetByName('PDF_Report_6Page');
  const logSheet = SpreadsheetApp.getActive().getSheetByName('PDF_Log');

  if (pdfSheet.isSheetHidden()) pdfSheet.showSheet();

  const spreadsheetId = SpreadsheetApp.getActive().getId();
  const pdfSheetId = pdfSheet.getSheetId();
  const pdfFolderId = '1b3TMg32n-d2bA-Xm95jxdVLtIQLjAa6o';
  
  const expensePeriod = pdfSheet.getRange('B4').getValue();
  
  const pdfFileName = expensePeriod;
  const pdfFileUrl = generatePDF_(spreadsheetId, pdfSheetId, pdfFolderId, pdfFileName);
  
  const logData = logSheet.getRange('G:H').getValues().filter(row => row[1] !== '');
  logData.push([expensePeriod, pdfFileUrl]);
  logSheet.getRange('G:H').clearContent();
  logSheet.getRange(1, 7, logData.length, logData[0].length).setValues(logData);

  pdfSheet.hideSheet();

  Browser.msgBox('The pdf report was created successfully!');

}


function generatePDF_(spreadsheetId, pdfSheetId, pdfFolderId, pdfFileName) {

  // creates the URL for PDF Export
  const url = "https://docs.google.com/spreadsheets/d/" + spreadsheetId + "/export" +
    "?format=pdf&" +
    "size=7&" +
    "fzr=true&" +
    "portrait=true&" +
    "fitw=true&" +
    "gridlines=false&" +
    "printtitle=false&" +
    "top_margin=0.75&" +
    "bottom_margin=0.25&" +
    "left_margin=0.5&" +
    "right_margin=0.5&" +
    "sheetnames=false&" +
    "pagenum=UNDEFINED&" +
    "attachment=true&" +
    // "vertical_alignment=CENTER&" +
    "gid=" + pdfSheetId

  const params = {method:"GET",
                  headers:{"authorization":"Bearer " + ScriptApp.getOAuthToken()},
                  muteHttpExceptions: true};

  const blob = UrlFetchApp.fetch(url, params).getBlob().setName(pdfFileName + '.pdf');

  // gets the folder in Drive where the PDFs are stored
  const pdfFolder = DriveApp.getFolderById(pdfFolderId);

  // creates the PDF Report
  const pdfFile = pdfFolder.createFile(blob);

  return pdfFile.getUrl();
  
}
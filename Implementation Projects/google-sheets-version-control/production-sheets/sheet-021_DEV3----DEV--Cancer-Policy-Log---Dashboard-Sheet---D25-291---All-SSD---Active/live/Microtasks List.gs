

const CPL_OUTPUT_FOLDER_ID = "1Mnj25P_7nRk9gWnldlIUn1htXMRKBXBs"
const CPL_SS_TEMPLATE = "1_CgExB90jupcfNRfBU9mTmLPAKMPlpe0eiRMqHiGYhM"


function onEditInstall(e) {

  // return

  const ss = e.source;

  const ActiveSheet = e.source.getActiveSheet();

  let activeSheetName = ActiveSheet.getSheetName()

  if (activeSheetName !== 'Microtasks List' && activeSheetName !== 'Cancer Policy Request Log')
    return;



  let col = e.range.getColumn();
  let row = e.range.getRow();
  let value = e.value;





  const HeaderRow = ActiveSheet.getRange(1, 1, 1, ActiveSheet.getLastColumn()).getValues()[0];
  const StatusColIndex = HeaderRow.indexOf('Status');

  if (col === StatusColIndex + 1) {
    sortMicrotasksList(ActiveSheet);
  } else if (activeSheetName == "Cancer Policy Request Log" && value != "") {



    let mrnCol = HeaderRow.indexOf('MRN') + 1
    let patientNameCol = HeaderRow.indexOf('PATIENT NAME') + 1

    if (col == mrnCol || col == patientNameCol) {
      let rowData = ActiveSheet.getRange(row, 1, 1, ActiveSheet.getLastColumn()).getValues()[0];
      let sheetCol = HeaderRow.indexOf('Sheet') + 1
      //let folderCol = HeaderRow.indexOf('Folder') + 1
      if (rowData[sheetCol - 1] == "" && rowData[mrnCol - 1] != "" && rowData[patientNameCol - 1] != "") {

        const folderName = rowData[patientNameCol - 1] + " - Folder - CPL-" + rowData[mrnCol - 1]
        let outputFolder = DriveApp.getFolderById(CPL_OUTPUT_FOLDER_ID);
        let newFolder = outputFolder.createFolder(folderName);
        let folderRichText = SpreadsheetApp.newRichTextValue().setText(folderName).setLinkUrl(newFolder.getUrl()).build();

        const fileName = rowData[patientNameCol - 1] + " - Sheet - CPL-" + rowData[mrnCol - 1]
        let newFile = DriveApp.getFileById(CPL_SS_TEMPLATE).makeCopy(fileName, newFolder);
        SpreadsheetApp.openById(newFile.getId()).getSheetByName("Documents").getRange("A1").setRichTextValue(folderRichText);

        let fileRichText = SpreadsheetApp.newRichTextValue().setText(fileName).setLinkUrl(newFile.getUrl()).build();

        const uniquePatientSheet = ss.getSheetByName("Cancer Policy Patient Folders")
        let lastRow = uniquePatientSheet.getLastRow() + 1;
        uniquePatientSheet.getRange(lastRow, 4, 1, 2).setRichTextValues([[fileRichText, folderRichText]]);
        uniquePatientSheet.getRange(lastRow, 1, 1, 3).setValues([[rowData[mrnCol - 1], rowData[patientNameCol - 1], "CPL-" + rowData[mrnCol - 1]]]);


      }
    }
  }

}


function sortMicrotasksList(ActiveSheet) {
  const LastRow = ActiveSheet.getLastRow()
  const LastColumn = ActiveSheet.getLastColumn()
  ActiveSheet.getRange(2, 1, LastRow - 1, LastColumn).sort([{ column: 1, ascending: true }, { column: 4, ascending: false }]);
};
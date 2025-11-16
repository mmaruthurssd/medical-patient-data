

const OUTPUT_FOLDER_ID = "153dPCOW3yJtMCh4hsr7vuhfmlG8yPXEB"

const SCH_SS_TEMP_ID = "167qIEM-G9QY8j078HX0a8LKtLsabdpIbWUk3bgBPiqc"


const ARCHIVE_FODLER_ID = "1mHw5U8-llRR5nflPsQkTqUrCO7KfZkig"




function onOpen() {
  const ui = SpreadsheetApp.getUi();
  const menu = ui.createMenu("Custom");

  menu.addItem("Update Future Appts", "updateDestinationSheet").addToUi()
}








function updateDestinationSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sourceSheet = ss.getSheetByName("Appts X Date X Provider BE"); // Replace with the name of your source sheet
  const destinationSheet = ss.getSheetByName("Appts X Date X Provider (Main)"); // Replace with the name of your destination sheet

  // Get data from source sheet
  const sourceData = sourceSheet.getDataRange().getDisplayValues().filter(r => r[0] != "" || r[1] != "");
  const sourceHeaders = sourceData.shift(); // Remove and store headers

  // Get data from destination sheet
  const destinationData = destinationSheet.getRange(2, 3, destinationSheet.getLastRow() - 1, 4).getDisplayValues();
  const destinationHeaders = destinationData.shift(); // Remove and store headers


  const existingDataSet = new Map()
  destinationData.forEach((row, index) => {
    //row[4] = ""
    existingDataSet.set([row[0], row[2], row[3]].join("|"), index)
  })


  sourceData.forEach(row => {
    const key = row[0] + "|" + row[1] + "|" + row[2]
    if (existingDataSet.has(key)) {
      //destinationData[existingDataSet.get(key)][4] = row[3]
    } else {
      destinationData.push([row[0], "", row[1], row[2]])
    }
  })


  if (destinationData.length > 0) {
    //Logger.log(destinationData)
    destinationSheet.getRange(3, 3, destinationData.length, destinationData[0].length).setValues(destinationData)
    destinationSheet.getRange(3, 4, destinationSheet.getLastRow() - 2, 1).clearContent();

    destinationSheet.getRange(3, 1, destinationSheet.getLastRow() - 2, destinationSheet.getLastColumn()).sort([{ column: 3, ascending: true }, { column: 5, ascending: true }])
  }




  const dataUpdateLog = ss.getSheetByName("Data Update Log")
  dataUpdateLog.getRange("D2").setValue(new Date())

}







function onEditInstall(e) {
  const ss = e.source;

  const activeSheet = ss.getActiveSheet();

  if (activeSheet.getName() == "Appts X Date X Provider (Main)") {
    const range = e.range;

    const col = range.getColumn();
    const row = range.getRow();

    if (col == 7 && row > 2 && (e.value == true || e.value == "TRUE")) {

      SpreadsheetApp.getActiveSpreadsheet().toast('Processing...', 'Please wait', 15);

      const rowData = activeSheet.getRange(row, 1, 1, activeSheet.getLastColumn()).getDisplayValues()[0];

      if (rowData[7] != "") {
        const docRich = activeSheet.getRange(row, 9).getRichTextValue()
        let fileUrl = docRich.getLinkUrl();
        if (fileUrl != null) {
          let fileId
          if (fileUrl.includes("?id=")) {
            fileId = fileUrl.split("?id=")[1].split("/")[0]

          } else if (fileUrl.includes("/d/")) {
            fileId = fileUrl.split("/d/")[1].split("/")[0]
          }

          if (fileId != null) {

            const archiveFolder = DriveApp.getFolderById(ARCHIVE_FODLER_ID)
            DriveApp.getFileById(fileId).moveTo(archiveFolder)

            activeSheet.getRange(row, 8).clearContent()
          }

        }
      }

      const allApptSheet = ss.getSheetByName("All Future Appts")
      const allAppts = allApptSheet.getRange(1, 1, allApptSheet.getLastRow(), allApptSheet.getLastColumn()).getDisplayValues();

      let filteredData = allAppts.filter(r => r[0] == rowData[2] && r[7] == rowData[4] && r[8] == rowData[5] && r[15] != "1").map(r => ["S", r[0], r[1], r[3], r[8], r[4], r[5], r[6], r[9], r[10], r[11], r[12], r[13]]);

      SpreadsheetApp.flush()

      const outputFolder = DriveApp.getFolderById(OUTPUT_FOLDER_ID);

      const capitalizeName = name =>
        name.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());

      const ssName = rowData[2] + " - " + capitalizeName(rowData[4]) + " - Rescheduling"
      const newSSFile = DriveApp.getFileById(SCH_SS_TEMP_ID).makeCopy(ssName, outputFolder);

      const newSS = SpreadsheetApp.openById(newSSFile.getId());
      const newSheet = newSS.getSheetByName("Rescheduling Tracker");
      if (filteredData.length > 0) {
        newSheet.getRange(newSheet.getLastRow() + 1, 2, filteredData.length, filteredData[0].length).setValues(filteredData);
        newSheet.getRange(2, 1, newSheet.getLastRow() - 1, newSheet.getLastColumn()).sort({ column: 1, ascending: true });
      }

      const newRichText = SpreadsheetApp.newRichTextValue().setText(newSSFile.getName()).setLinkUrl(newSSFile.getUrl()).build();
      activeSheet.getRange(row, 8).setRichTextValue(newRichText)
      activeSheet.getRange(row, 9).setValue(newSSFile.getUrl())
      activeSheet.getRange(row, col).setValue(false)

      activeSheet.getRange(3, 1, activeSheet.getLastRow() - 2, activeSheet.getLastColumn()).sort([{ column: 3, ascending: true }, { column: 5, ascending: true }])

      SpreadsheetApp.getActiveSpreadsheet().toast('Processing complete', 'Done', 3);

      try {
        addImportrangePermission(newSS.getId())
      } catch (err) { }

      const empSheet = ss.getSheetByName("Active Employee");
      const activeEmployee = empSheet.getRange("A1:F").getDisplayValues().filter(r => r[0] != "");

      const allEmp = activeEmployee.map(r => [r[0]]);
      const allProviders = activeEmployee.filter(r => r[5] != "").map(r => [r[5]]);

      const dropDownSheet = newSS.getSheetByName("Dropdowns")
      dropDownSheet.getRange(1, 1, allEmp.length, 1).setValues(allEmp)
      dropDownSheet.getRange(1, 3, allProviders.length, 1).setValues(allProviders)



    } else if (col == 22 && row > 2 && e.value == "Yes") {


      const rowData = activeSheet.getRange(row, 1, 1, activeSheet.getLastColumn()).getDisplayValues()[0];

      //activeSheet.getRange(3, 1, activeSheet.getLastRow() - 2, activeSheet.getLastColumn()).sort([{ column: 1, ascending: true }, { column: 3, ascending: true }, { column: 5, ascending: true }])

      if (rowData[7] != "") {
        const docRich = activeSheet.getRange(row, 8).getRichTextValue()
        let fileUrl = docRich.getLinkUrl();
        if (fileUrl != null) {
          let fileId
          if (fileUrl.includes("?id=")) {
            fileId = fileUrl.split("?id=")[1].split("/")[0]

          } else if (fileUrl.includes("/d/")) {
            fileId = fileUrl.split("/d/")[1].split("/")[0]
          }

          if (fileId != null) {

            const archiveFolder = DriveApp.getFolderById(ARCHIVE_FODLER_ID)
            DriveApp.getFileById(fileId).moveTo(archiveFolder)
            activeSheet.getRange(row, 8).clearContent()
            activeSheet.getRange(row, 9).clearContent()
          }

        }
      }


      activeSheet.getRange(row, col).clearContent()


    }
  }



  onEditMicro(e)

  onEditSort(e)
}









function addImportrangePermission(donorId) {
  // id of the spreadsheet to add permission to import
  const ssId = SpreadsheetApp.getActiveSpreadsheet().getId();

  // donor or source spreadsheet id, you should get it somewhere
  //const donorId = '1WeP4A2SFrahD3UhKdY-OlEZmtMWK8nWfD1Op-9cI1Ew';

  // adding permission by fetching this url
  const url = `https://docs.google.com/spreadsheets/d/${ssId}/externaldata/addimportrangepermissions?donorDocId=${donorId}`;

  const token = ScriptApp.getOAuthToken();

  const params = {
    method: 'post',
    headers: {
      Authorization: 'Bearer ' + token,
    },
    muteHttpExceptions: true
  };

  UrlFetchApp.fetch(url, params);
}










function test() {

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const activeSheet = ss.getActiveSheet();
  const row = 3

  const rowData = activeSheet.getRange(row, 1, 1, activeSheet.getLastColumn()).getDisplayValues()[0];


  const allApptSheet = ss.getSheetByName("All Future Appts")
  const allAppts = allApptSheet.getRange(1, 1, allApptSheet.getLastRow(), allApptSheet.getLastColumn()).getDisplayValues();

  let filteredData = allAppts.filter(r => r[0] == rowData[0] && r[7] == rowData[2] && r[8] == rowData[3] && r[15] != "1").map(r => [r[0], r[1], r[3], r[8], r[4], r[5], r[6], r[9], r[10], r[11], r[12], r[13]]);

  Logger.log(filteredData)


}














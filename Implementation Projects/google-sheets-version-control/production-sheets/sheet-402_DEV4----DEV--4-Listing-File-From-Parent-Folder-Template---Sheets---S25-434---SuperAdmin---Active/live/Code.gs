
/**
 * Runs when the document is opened and adds a custom menu.
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('📁 Folder Tools')
    .addItem('1. List Files from This Folder', 'listFiles')
    .addSeparator()
    .addItem('2. Rename Files from Column C', 'renameFiles')
    .addSeparator()
    .addItem('Add SNO | Update File Names', 'processFileNames')
    .addToUi();
}


/**
 * Gets all files from the parent folder of the spreadsheet
 * and lists them in the active sheet.
 */
function listFiles() {
  try {
    // Get the active spreadsheet and the sheet to write to.
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("All Files");

    let allData = sheet.getRange(1, 1, sheet.getLastRow(), 4).getValues();
    const urls = allData.map(r => r[2]);


    // Find the folder this spreadsheet is in.
    const spreadsheetFile = DriveApp.getFileById(ss.getId());
    const folders = spreadsheetFile.getParents();

    if (!folders.hasNext()) {
      SpreadsheetApp.getUi().alert('This file is not located within a folder.');
      return;
    }
    const folder = folders.next();
    const files = folder.getFiles();



    let fileList = [];
    let newUrls = [];
    while (files.hasNext()) {
      const file = files.next();
      // fileList.push([
      //   file.getName(),
      //   file.getUrl(),
      // ]);
      let fUrlTemp = file.getUrl()
      let indexOfUrl = urls.indexOf(fUrlTemp)
      if (indexOfUrl == -1) {
        allData.push(["", file.getName(), fUrlTemp, ""])
      }
      newUrls.push(fUrlTemp)
    }

    //let newUrls = fileList.map(r => r[1]);


    for (let i = allData.length - 1; i > 0; i--) {

      if (allData[i][2] != "") {
        let indexOfUrl = newUrls.indexOf(allData[i][2]);
        if (indexOfUrl == -1) {
          allData.splice(i, 1);
        }
      }
    }




    if (sheet.getLastRow() > 1) {
      sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent();
    }
    sheet.getRange(1, 1, allData.length, allData[0].length).setValues(allData);



  } catch (e) {
    // Log the error and show an alert to the user.
    Logger.log(e.toString());
    SpreadsheetApp.getUi().alert('An error occurred: ' + e.message);
  }
}




/**
 * Renames files based on the values provided in Column C of the active sheet.
 */
function renameFiles() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("All Files");
  const data = sheet.getDataRange().getValues(); // Get all data from the sheet


  try {
    // Loop through rows, skipping the header (row 1, index 0)
    for (let i = 1; i < data.length; i++) {

      try {
        const row = data[i];
        const fileUrl = row[2]; // File URL is in Column B (index 1)
        const newName = row[3]; // New file name is in Column C (index 2)

        // Proceed only if a new name has been provided
        if (newName && newName.toString().trim() !== '') {
          const idMatch = fileUrl.match(/[-\w]{25,}/);

          if (idMatch) {
            const fileId = idMatch[0];

            //const fileId = DriveApp.getFileByUrl(fileUrl).getId(); // Get file ID directly from URL
            const file = DriveApp.getFileById(fileId);

            file.setName(newName.toString().trim()); // Rename the file in Google Drive

            // Update sheet to reflect the change
            sheet.getRange(i + 1, 2).setValue(newName); // Update name in Column A
            sheet.getRange(i + 1, 4).clearContent();   // Clear the new name from Column C

          }
        }
      } catch (err) {
        Logger.log(err)
      }
    }



  } catch (e) {
    Logger.log(e.toString());
    ui.alert('An error occurred: ' + e.message);
  }
}






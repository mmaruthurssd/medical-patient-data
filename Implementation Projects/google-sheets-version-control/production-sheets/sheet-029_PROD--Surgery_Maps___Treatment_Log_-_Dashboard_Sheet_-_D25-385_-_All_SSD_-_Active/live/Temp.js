



function deleteFilesTest() {


  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Copy of Searchable Maps")

  const richText = sheet.getRange("J5:M21").getRichTextValues();


  for (var i = 0; i < richText.length; i++) {
    let url1 = richText[i][0].getLinkUrl();
    let url2 = richText[i][1].getLinkUrl();
    let url3 = richText[i][2].getLinkUrl();
    let url4 = richText[i][3].getLinkUrl();


    let fileId1 = getFileIdFromUrl(url1);
    let fileId2 = getFileIdFromUrl(url2);
    let fileId3 = getFileIdFromUrl(url3);
    let fileId4 = getFileIdFromUrl(url4);


    DriveApp.getFileById(fileId1).setTrashed(true);
    DriveApp.getFileById(fileId2).setTrashed(true);
    DriveApp.getFileById(fileId3).setTrashed(true);
    DriveApp.getFileById(fileId4).setTrashed(true);





  }



  const spreadsheetUrl = "https://docs.google.com/document/d/1MCqRcYGkkt1XpPkMO2T97N5_F30wdTEE8Wodv1o4LjY/edit?tab=t.0";
  const fileId = getFileIdFromUrl(spreadsheetUrl);

  Logger.log(fileId)
}




function getFileIdFromUrl(url) {
  if (!url || typeof url !== 'string') {
    Logger.log("Invalid input: URL must be a non-empty string.");
    return null; // Return null for invalid input
  }

  let fileId = null;

  // Regular expression to find the ID in common Drive/Docs/Sheets/Slides URLs
  // It looks for '/d/' followed by a sequence of letters, numbers, '-', '_'
  // and captures that sequence. It stops at the next '/' or '?'.
  const regex = /\/d\/([a-zA-Z0-9_-]+)/;

  const match = url.match(regex);

  if (match && match[1]) {
    // The first capturing group (index 1) contains the ID
    fileId = match[1];
    Logger.log(`Extracted File ID: ${fileId} from URL: ${url}`);
  } else {
    Logger.log(`Could not extract File ID from URL: ${url}`);
  }

  return fileId;
}










/**
 * Reads rich text from a specific cell in a Google Sheet
 * and moves a specific file in Google Drive to the Trash.
 */
function readRichTextAndDeleteFile() {

  // --- Configuration ---
  const sheetName = "Sheet1"; // <<< CHANGE this to the name of your sheet
  const cellReference = "A1"; // <<< CHANGE this to the cell containing the rich text (e.g., "B2")
  const fileIdToDelete = "YOUR_FILE_ID_HERE"; // <<< !!! IMPORTANT: Replace with the actual File ID of the file to delete

  // --- Safety Check ---
  if (fileIdToDelete === "YOUR_FILE_ID_HERE" || fileIdToDelete.trim() === "") {
    Logger.log("ERROR: Please edit the script and replace 'YOUR_FILE_ID_HERE' with the actual ID of the file you want to delete.");
    SpreadsheetApp.getUi().alert("Script Error: File ID not set. Please edit the script (Tools > Script editor) and provide the File ID in the 'fileIdToDelete' variable.");
    return; // Stop execution
  }

  // Get the UI environment to show messages
  const ui = SpreadsheetApp.getUi();

  try {
    // --- Part 1: Access Spreadsheet and Read Rich Text ---
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      throw new Error(`Sheet named "${sheetName}" could not be found.`);
    }

    const range = sheet.getRange(cellReference);
    if (range.getNumRows() !== 1 || range.getNumColumns() !== 1) {
      Logger.log(`Warning: Cell reference "${cellReference}" refers to multiple cells. Reading from the top-left cell only.`);
    }

    const richTextValue = range.getRichTextValue();

    if (richTextValue) {
      const text = richTextValue.getText();
      const runs = richTextValue.getRuns(); // Array of RichTextRun objects detailing formatting
      Logger.log(`Successfully read rich text from ${sheetName}!${cellReference}.`);
      Logger.log(`Plain Text Content: "${text}"`);
      Logger.log(`Number of formatting runs: ${runs.length}`);
      // You can iterate through 'runs' if you need specific formatting details
      // runs.forEach((run, index) => {
      //   Logger.log(`Run ${index + 1}: Text: "${run.getText()}", Style: ${JSON.stringify(run.getTextStyle())}`);
      // });
    } else {
      Logger.log(`No rich text value found in cell ${cellReference} on sheet "${sheetName}". Cell might be empty or contain only plain text.`);
      // Decide if you want to stop here or continue to delete the file even if the cell was empty
      // To stop if empty, uncomment the next line:
      // throw new Error(`Cell ${cellReference} did not contain a rich text value.`);
    }

    // --- Part 2: Access Drive and Delete File ---
    Logger.log(`Attempting to move file with ID: ${fileIdToDelete} to Trash.`);
    const file = DriveApp.getFileById(fileIdToDelete);

    // getFileById throws an error if the file doesn't exist or permissions are missing,
    // so the 'file' variable should be valid if we reach here.

    const fileName = file.getName(); // Get the name for logging purposes before deleting

    file.setTrashed(true); // Move the file to Google Drive's Trash

    Logger.log(`Successfully moved file "${fileName}" (ID: ${fileIdToDelete}) to Trash.`);

    // --- Success Message ---
    ui.alert(`Operation Successful!\n\n- Read rich text from ${sheetName}!${cellReference}.\n- Moved file "${fileName}" to Trash.`);

  } catch (error) {
    // --- Error Handling ---
    Logger.log(`Error: ${error.message}\nStack: ${error.stack}`);
    ui.alert(`An error occurred: ${error.message}. Please check the logs (View > Logs) for more details.`);
  }
}



























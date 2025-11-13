/**
 * Creates a custom menu in the spreadsheet UI.
 */
// function onOpen() {
//   SpreadsheetApp.getUi()
//     .createMenu('File Renamer')
//     .addItem('Update File Names', 'processFileNames')
//     .addToUi();
// }

/**
 * Extracts the Google Drive file ID from a file URL.
 * @param {string} url The URL of the Google Drive file.
 * @returns {string|null} The file ID or null if not found.
 */
function getFileIdFromUrl(url) {
  if (!url || typeof url !== 'string') {
    return null;
  }
  // Regular expression to find the ID in common Google Drive URL formats.
  const match = url.match(/\/d\/([a-zA-Z0-9_-]{25,})/);
  return match ? match[1] : null;
}

/**
 * Main function to process the sheet, rename files, and update the sheet.
 */
function processFileNames() {
  const ui = SpreadsheetApp.getUi();
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    // Assumes headers are in row 1 and data starts from row 2.
    const startRow = 2;
    const dataRange = sheet.getRange(startRow, 1, sheet.getLastRow() - startRow + 1, 4);
    const values = dataRange.getValues();

    let filesUpdated = 0;

    // Regular expression to find a number prefix like "1 # ", "1#", "10 # ", etc., at the START of a string.
    // ^     - matches the beginning of the string
    // \d+   - matches one or more digits
    // \s* - matches zero or more whitespace characters (spaces, tabs)
    // #     - matches the literal hash/pound symbol
    // \s* - matches zero or more whitespace characters
    const prefixRegex = /^\d+\s*#\s*/;
    let startingNumber = 0;

    for (let i = 0; i < values.length; i++) {
      const row = values[i];
      const fileUrl = row[2]; // Column B: URL
      const newName = row[3];
      const newNumber = row[0]; // Column C: New number

      // Skip row if there is no URL or no number in Column C
      if (!fileUrl) {
        continue;
      }


      if (newNumber == 1 && startingNumber == 0) {
        startingNumber++
      } else if (startingNumber == 0) {
        continue
      } else {
        startingNumber++
      }

      values[i][0] = startingNumber

      const fileId = getFileIdFromUrl(fileUrl);
      if (!fileId) {
        //Logger.log(`Row ${i + startRow}: Could not extract a valid File ID from URL: ${fileUrl}`);
        continue;
      }

      try {
        const file = DriveApp.getFileById(fileId);
        const currentDriveName = file.getName();

        // Find the base name by removing any existing number prefix.
        let baseName = currentDriveName.replace(prefixRegex, '');
        if (newName) {
          baseName = newName
        }

        // Construct the new, desired file name using the "#" separator.
        const newFileName = `${startingNumber} # ${baseName}`;

        // Only rename the file and update the sheet if the name has actually changed.
        // This avoids unnecessary API calls and keeps the script efficient.
        if (newFileName !== currentDriveName) {
          file.setName(newFileName);
          values[i][1] = newFileName; // Update the name in Column A of our data array.
          //filesUpdated++;
          //Logger.log(`Renamed "${currentDriveName}" to "${newFileName}"`);
        }
      } catch (e) {
        // Log an error if the file ID is invalid or permissions are missing.
        Logger.log(`Row ${i + startRow}: Error processing file. Check URL or permissions. Details: ${e.message}`);
      }
    }

    // Write the updated names back to the sheet in one operation for efficiency.
    dataRange.setValues(values);

    //ui.alert('Process Complete!', `Successfully updated ${filesUpdated} file names.`, ui.ButtonSet.OK);

  } catch (e) {
    Logger.log(`An unexpected error occurred: ${e.message}`);
    ui.alert('Error', `An unexpected error occurred. Check the script logs for details: ${e.message}`, ui.ButtonSet.OK);
  }
}




function testFuncName() {
  const currentDriveName = "1 # - 1#1-03-2024 54731 EAR CANCER.jpg"
  const prefixRegex = /^\d+\s*#\s*/;
  const baseName = currentDriveName.replace(prefixRegex, '');
  Logger.log(baseName)
}











/**
 * Gets all spreadsheet files from a single, specified Shared Drive and updates an index sheet.
 */
function getAllSpreadsheetFromOneSharedDrive() {
  // !!! IMPORTANT: Replace with your specific Shared Drive ID.
  const SHARED_DRIVE_ID = '0ABNQfXzYIlzJUk9PVA';
  const MIME_TYPE = 'application/vnd.google-apps.spreadsheet';

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("DB_Superadmin - Sheets");




  // 1. Get the name of the specified Shared Drive
  const driveDetails = Drive.Drives.get(SHARED_DRIVE_ID);
  const rootFolderName = driveDetails.name;

  // 2. Fetch ALL files from the single drive, handling multiple pages of results
  let allFiles = [];
  let pageToken = null;
  do {
    const fileList = Drive.Files.list({
      q: `mimeType='${MIME_TYPE}'`,
      corpora: 'drive',
      driveId: SHARED_DRIVE_ID,
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
      maxResults: 1000, // Max allowed per page
      pageToken: pageToken
    });

    if (fileList.items) {
      allFiles = allFiles.concat(fileList.items);
    }
    pageToken = fileList.nextPageToken;
  } while (pageToken);


  // 3. Process the collected files
  const newFilesData = [];
  allFiles.forEach(file => {
 
    newFilesData.push([
      rootFolderName,
      file.title,
      file.alternateLink,
      file.id,
      file.lastModifyingUserName,
      new Date(file.modifiedDate)
    ]);

    //Logger.log(file.id)
  });

  //return

  // --- Write data back to the sheet ---

  // Update the existing data range
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent();
  }

  // Append any new files to the end of the sheet
  if (newFilesData.length > 0) {
    sheet.getRange(2, 1, newFilesData.length, newFilesData[0].length).setValues(newFilesData);
  }

  // Sort the entire sheet by the modified date (column 5), descending
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).sort([{ column: 6, ascending: false }]);
  }

  Logger.log(`Process complete. Found ${allFiles.length} files in "${rootFolderName}". Added ${newFilesData.length} new files.`);
}








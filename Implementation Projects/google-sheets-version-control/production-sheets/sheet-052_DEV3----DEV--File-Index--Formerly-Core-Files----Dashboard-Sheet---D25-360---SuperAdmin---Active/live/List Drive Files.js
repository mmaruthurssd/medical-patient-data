





function getAllSpreadsheetSharedDriveTest() {

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Automated File Index");

  const allRecentData = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getValues();

  let allUrls = allRecentData.map(r => r[2])

  //return
  let mimeType = 'application/vnd.google-apps.spreadsheet';
  let allDrives = Drive.Drives.list({ maxResults: 50 })

  let newFilesData = [];
  let spreadsheetUrlsHyperlink = []
  allDrives.items.forEach(item => {

    let rootFolderName = item.name;

    let files = Drive.Files.list({
      q: "mimeType='" + mimeType + "'",
      corpora: 'drive',
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
      driveId: item.id,
      maxResults: 500
    });

    let items = files.items;

    for (var i = 0; i < items.length; i++) {
      let file = items[i];

      let richText = SpreadsheetApp.newRichTextValue().setText(file.title).setLinkUrl(file.alternateLink).build()
      spreadsheetUrlsHyperlink.push([richText])

      let index = allUrls.indexOf(file.alternateLink);
      if (index > -1) {
        allRecentData[index][0] = rootFolderName
        allRecentData[index][1] = file.title
        allRecentData[index][3] = file.lastModifyingUserName
        allRecentData[index][4] = new Date(file.modifiedDate)
      } else { }

      newFilesData.push([rootFolderName, file.title, file.alternateLink, file.lastModifyingUserName, new Date(file.modifiedDate)])
    }
  })


  sheet.getRange(1, 1, allRecentData.length, allRecentData[0].length).setValues(allRecentData)
  if (newFilesData.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, newFilesData.length, newFilesData[0].length).setValues(newFilesData)
  }

  sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).sort([{ column: 5, ascending: false }])
}






/**
 * Gets all spreadsheet files from a single, specified Shared Drive and updates an index sheet.
 */
function getAllSpreadsheetFromOneSharedDrive() {
  // !!! IMPORTANT: Replace with your specific Shared Drive ID.
  const SHARED_DRIVE_ID = '0AKE25H3a_gU6Uk9PVA';
  const MIME_TYPE = 'application/vnd.google-apps.spreadsheet';

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Automated File Index");

  // Get existing data from the sheet to check against
  const allRecentData = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getValues();
  const allUrls = allRecentData.map(row => row[2]); // Extract all existing URLs into an array for quick lookup

  // --- Main changes are here ---

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
    // Check if the file URL already exists in our sheet data
    const index = allUrls.indexOf(file.alternateLink);

    if (index > -1) {
      // If it exists, update the information in the existing data array
      allRecentData[index][0] = rootFolderName;
      allRecentData[index][1] = file.title;
      allRecentData[index][3] = file.lastModifyingUserName;
      allRecentData[index][4] = new Date(file.modifiedDate);
    } else {
      // If it's a new file, add it to our new data array
      newFilesData.push([
        rootFolderName,
        file.title,
        file.alternateLink,
        file.lastModifyingUserName,
        new Date(file.modifiedDate)
      ]);
    }
  });

  // --- Write data back to the sheet ---

  // Update the existing data range
  if (allRecentData.length > 0) {
    sheet.getRange(1, 1, allRecentData.length, allRecentData[0].length).setValues(allRecentData);
  }

  // Append any new files to the end of the sheet
  if (newFilesData.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, newFilesData.length, newFilesData[0].length).setValues(newFilesData);
  }

  // Sort the entire sheet by the modified date (column 5), descending
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).sort([{ column: 5, ascending: false }]);
  }
  
  Logger.log(`Process complete. Found ${allFiles.length} files in "${rootFolderName}". Added ${newFilesData.length} new files.`);
}








/**
 * Gets ALL files of any type from a single, specified Shared Drive and updates an index sheet.
 */
function getAllFilesFromOneSharedDrive() {
  // !!! IMPORTANT: Replace with your specific Shared Drive ID.
  const SHARED_DRIVE_ID = '0AKE25H3a_gU6Uk9PVA';

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Automated File Index");

  // Get existing data from the sheet to check against
  const allRecentData = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getValues();
  const allUrls = allRecentData.map(row => row[2]); // Extract all existing URLs for quick lookup

  // --- Main changes are here ---

  // 1. Get the name of the specified Shared Drive
  const driveDetails = Drive.Drives.get(SHARED_DRIVE_ID);
  const rootFolderName = driveDetails.name;

  // 2. Fetch ALL files from the single drive, handling multiple pages of results
  let allFiles = [];
  let pageToken = null;
  do {
    const fileList = Drive.Files.list({
      // The 'q' parameter has been removed to get all file types, not just spreadsheets.
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
    // Check if the file URL already exists in our sheet data
    const index = allUrls.indexOf(file.alternateLink);

    if (index > -1) {
      // If it exists, update the information in the existing data array
      allRecentData[index][0] = rootFolderName;
      allRecentData[index][1] = file.title;
      allRecentData[index][3] = file.lastModifyingUserName;
      allRecentData[index][4] = new Date(file.modifiedDate);
    } else {
      // If it's a new file, add it to our new data array
      newFilesData.push([
        rootFolderName,
        file.title,
        file.alternateLink,
        file.lastModifyingUserName,
        new Date(file.modifiedDate)
      ]);
    }
  });

  // --- Write data back to the sheet ---

  // Update the existing data range
  if (allRecentData.length > 0) {
    sheet.getRange(1, 1, allRecentData.length, allRecentData[0].length).setValues(allRecentData);
  }

  // Append any new files to the end of the sheet
  if (newFilesData.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, newFilesData.length, newFilesData[0].length).setValues(newFilesData);
  }

  // Sort the entire sheet by the modified date (column 5), descending
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).sort([{ column: 5, ascending: false }]);
  }
  
  Logger.log(`Process complete. Found ${allFiles.length} files in "${rootFolderName}". Added ${newFilesData.length} new files.`);
}







/**
 * Gets ALL files of any type from a single Shared Drive by processing them in batches.
 * This prevents memory errors on drives with a large number of files.
 */
function getAllFilesFromOneSharedDrive_Batch() {
  // !!! IMPORTANT: Replace with your specific Shared Drive ID.
  const SHARED_DRIVE_ID = '0AKE25H3a_gU6Uk9PVA';

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Automated File Index");

  const allRecentData = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getValues();
  const allUrls = allRecentData.map(row => row[2]);

  const driveDetails = Drive.Drives.get(SHARED_DRIVE_ID);
  const rootFolderName = driveDetails.name;

  const newFilesData = [];
  let pageToken = null;
  let totalFilesFound = 0;

  // KEY CHANGE: The processing logic is now INSIDE the loop.
  do {
    const fileList = Drive.Files.list({
      corpora: 'drive',
      driveId: SHARED_DRIVE_ID,
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
      maxResults: 1000,
      pageToken: pageToken,
      // Requesting fewer fields can also slightly reduce memory usage
      fields: "items(alternateLink,lastModifyingUserName,modifiedDate,title),nextPageToken" 
    });

    if (fileList.items) {
      totalFilesFound += fileList.items.length;

      // Process this batch of files immediately
      fileList.items.forEach(file => {
        const index = allUrls.indexOf(file.alternateLink);

        if (index > -1) {
          allRecentData[index][0] = rootFolderName;
          allRecentData[index][1] = file.title;
          allRecentData[index][3] = file.lastModifyingUserName;
          allRecentData[index][4] = new Date(file.modifiedDate);
        } else {
          newFilesData.push([
            rootFolderName,
            file.title,
            file.alternateLink,
            file.lastModifyingUserName,
            new Date(file.modifiedDate)
          ]);
        }
      });
    }
    pageToken = fileList.nextPageToken;
  } while (pageToken); // Loop continues until all pages are fetched and processed

  // --- Write data back to the sheet (same as before) ---

  if (allRecentData.length > 0) {
    sheet.getRange(1, 1, allRecentData.length, allRecentData[0].length).setValues(allRecentData);
  }

  if (newFilesData.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, newFilesData.length, newFilesData[0].length).setValues(newFilesData);
  }

  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).sort([{ column: 5, ascending: false }]);
  }
  
  Logger.log(`Process complete. Found and processed ${totalFilesFound} files in "${rootFolderName}". Added ${newFilesData.length} new files.`);
}






/**
 * Lists all files in a specified Google Drive folder, including their names and URLs.
 * It logs the information and adds it to the active Google Sheet, separating the data by columns.
 */
function listFilesInFolder() {
  // IMPORTANT: Replace 'YOUR_FOLDER_ID_HERE' with the actual ID of your Google Drive folder.
  // You can find the folder ID in the URL when you open the folder in Google Drive.
  // For example, if the URL is https://drive.google.com/drive/folders/1vT0AugsZ_ESR-lMXXDVOHMZUD0XFpUZn,
  // the folder ID is 1vT0AugsZ_ESR-lMXXDVOHMZUD0XFpUZn
  const folderId = '1vT0AugsZ_ESR-lMXXDVOHMZUD0XFpUZn'; // <-- **UPDATE THIS LINE**

  try {
    const folder = DriveApp.getFolderById(folderId);
    const files = folder.getFiles();

    // Prepare data for the Google Sheet, with headers for columns
    const fileData = [['File Name', 'File URL']];

    Logger.log('Listing files in folder: ' + folder.getName());

    // Iterate through each file in the folder
    while (files.hasNext()) {
      const file = files.next();
      const fileName = file.getName();
      const fileUrl = file.getUrl(); // Gets the direct link to the file

      // Log the file name and URL to the Apps Script console
      Logger.log('File: ' + fileName + ' | URL: ' + fileUrl);

      // Add file data to the array for the spreadsheet
      fileData.push([fileName, fileUrl]);
    }

    // Get the active Google Spreadsheet and the active sheet within it
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getActiveSheet();

    // Clear existing content in the sheet (optional, uncomment if you want to clear)
    // sheet.clearContents();

    // Write the data to the active sheet, starting from cell A1
    // The range is determined by the number of rows (fileData.length)
    // and the number of columns (fileData[0].length, which is 2 for 'File Name' and 'File URL')
    sheet.getRange(1, 1, fileData.length, fileData[0].length).setValues(fileData);

    Logger.log('File list successfully added to the active sheet.');

  } catch (e) {
    Logger.log('Error: Could not find or access the folder or active spreadsheet. Please check the folder ID, permissions, and ensure a Google Sheet is open when running the script.');
    Logger.log('Error details: ' + e.toString());
  }
}

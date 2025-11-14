/**
 * Trigger WebApp - Remote Execution Trigger
 *
 * This webapp receives HTTP requests to trigger the V7 metadata extraction.
 * Deploy this as a webapp alongside MetadataExtractorV7_Local.gs in each sheet.
 *
 * Deployment:
 * 1. Push both MetadataExtractorV7_Local.gs and this file to each sheet
 * 2. Deploy as webapp: Execute as "Me", Access "Anyone"
 * 3. Call the webapp URL to trigger extraction
 *
 * Usage:
 * GET <webapp-url>?action=extract
 *
 * Response:
 * {
 *   "success": true,
 *   "message": "Metadata extracted and saved successfully",
 *   "timestamp": "2025-10-06T...",
 *   "sheetsProcessed": 15
 * }
 */

function doGet(e) {
  try {
    const action = e.parameter.action || 'status';

    if (action === 'extract') {
      // Trigger the extraction
      const result = triggerExtraction();
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'status') {
      // Check if metadata file exists
      const status = checkMetadataStatus();
      return ContentService.createTextOutput(JSON.stringify(status))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Unknown action
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: 'Unknown action. Use action=extract or action=status'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Check if metadata file exists and when it was created
 */
function checkMetadataStatus() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const spreadsheetId = ss.getId();
    const fileName = 'metadata_v7.json';

    const spreadsheetFile = DriveApp.getFileById(spreadsheetId);
    const parentFolder = spreadsheetFile.getParents().next();

    const existingFiles = parentFolder.getFilesByName(fileName);

    if (existingFiles.hasNext()) {
      const file = existingFiles.next();
      return {
        success: true,
        metadataExists: true,
        lastModified: file.getLastUpdated().toISOString(),
        fileSize: file.getSize() + ' bytes',
        fileId: file.getId()
      };
    } else {
      return {
        success: true,
        metadataExists: false,
        message: 'No metadata file found'
      };
    }

  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Workstation Backup Monitoring Webhook
 * Receives status reports from developer workstations and logs to Google Sheets
 *
 * Deploy as: Google Apps Script Web App
 * Access: Anyone (no authentication required for webhook)
 * Execute as: User accessing the web app
 *
 * Installation:
 * 1. Open Apps Script editor in your Google Sheets
 * 2. Create new script file and paste this code
 * 3. Deploy > New deployment > Web app
 * 4. Execute as: Me
 * 5. Who has access: Anyone
 * 6. Copy deployment URL and distribute to team
 */

const SPREADSHEET_ID = '1KpUhrEtW7-uHHS6GIngiXws0v2aM2wBC5ppyDBnRKxc';
const SHEET_NAME = 'Layer 6 - Workstation Backups';

/**
 * Web App entry point - handles POST requests from workstation agents
 * Also handles GET requests for testing
 */
function doPost(e) {
  try {
    // Parse incoming JSON payload
    const payload = JSON.parse(e.postData.contents);

    // Validate required fields
    if (!payload.device_id || !payload.status || !payload.timestamp) {
      return ContentService.createTextOutput(JSON.stringify({
        'status': 'error',
        'message': 'Missing required fields: device_id, status, timestamp'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Log to Google Sheets
    logWorkstationStatus(payload);

    // Return success
    return ContentService.createTextOutput(JSON.stringify({
      'status': 'success',
      'message': 'Status logged successfully',
      'device': payload.device_id
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('Error processing webhook: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      'status': 'error',
      'message': error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle GET requests (for testing)
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    'status': 'ready',
    'message': 'Workstation Backup Monitoring Webhook',
    'endpoint': 'POST JSON payload with device_id, status, timestamp',
    'spreadsheet': SPREADSHEET_ID,
    'sheet': SHEET_NAME
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Log workstation status to Google Sheets
 */
function logWorkstationStatus(payload) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);

  // Create sheet if it doesn't exist
  if (!sheet) {
    sheet = createWorkstationBackupSheet(ss);
  }

  // Check if device already has a row
  const data = sheet.getDataRange().getValues();
  let deviceRow = -1;

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === payload.device_id) {
      deviceRow = i + 1; // +1 for 1-indexed rows
      break;
    }
  }

  // Prepare row data
  const rowData = [
    payload.device_id,                    // A: Device ID
    payload.user || 'Unknown',            // B: User
    payload.platform || 'Unknown',        // C: Platform
    payload.backup_type || 'Unknown',     // D: Backup Type
    payload.status,                       // E: Status
    payload.last_backup || 'N/A',         // F: Last Backup
    payload.destination || 'N/A',         // G: Destination
    payload.message || '',                // H: Message
    payload.timestamp,                    // I: Last Check
    new Date().toISOString()              // J: Last Updated
  ];

  if (deviceRow > 0) {
    // Update existing row
    sheet.getRange(deviceRow, 1, 1, rowData.length).setValues([rowData]);

    // Update row color based on status
    updateRowColor(sheet, deviceRow, payload.status);
  } else {
    // Append new row
    sheet.appendRow(rowData);
    const newRow = sheet.getLastRow();

    // Update row color based on status
    updateRowColor(sheet, newRow, payload.status);
  }

  // Update overview tab
  updateOverviewForWorkstations(ss);

  Logger.log('Logged status for device: ' + payload.device_id + ' - ' + payload.status);
}

/**
 * Update row background color based on status
 */
function updateRowColor(sheet, row, status) {
  const range = sheet.getRange(row, 1, 1, 10);

  if (status.includes('ACTIVE') || status.includes('✅')) {
    range.setBackground('#d9ead3'); // Light green
  } else if (status.includes('WARNING') || status.includes('STALE') || status.includes('⚠️')) {
    range.setBackground('#fff2cc'); // Light yellow
  } else if (status.includes('ERROR') || status.includes('❌')) {
    range.setBackground('#f4cccc'); // Light red
  } else {
    range.setBackground('#ffffff'); // White (default)
  }
}

/**
 * Create the workstation backup monitoring sheet
 */
function createWorkstationBackupSheet(ss) {
  const sheet = ss.insertSheet(SHEET_NAME);

  // Header row
  const headers = [
    'Device ID',
    'User',
    'Platform',
    'Backup Type',
    'Status',
    'Last Backup',
    'Destination',
    'Message',
    'Last Check',
    'Last Updated'
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // Format header
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#1a73e8');
  headerRange.setFontColor('#ffffff');
  headerRange.setFontWeight('bold');
  headerRange.setHorizontalAlignment('center');

  // Set column widths
  sheet.setColumnWidth(1, 150); // Device ID
  sheet.setColumnWidth(2, 100); // User
  sheet.setColumnWidth(3, 80);  // Platform
  sheet.setColumnWidth(4, 120); // Backup Type
  sheet.setColumnWidth(5, 100); // Status
  sheet.setColumnWidth(6, 180); // Last Backup
  sheet.setColumnWidth(7, 200); // Destination
  sheet.setColumnWidth(8, 200); // Message
  sheet.setColumnWidth(9, 180); // Last Check
  sheet.setColumnWidth(10, 180); // Last Updated

  // Freeze header row
  sheet.setFrozenRows(1);

  // Set alternating row colors (optional)
  const dataRange = sheet.getRange(2, 1, 100, headers.length);
  dataRange.applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY, false, false);

  Logger.log('Created new sheet: ' + SHEET_NAME);

  return sheet;
}

/**
 * Update the overview tab with workstation summary
 */
function updateOverviewForWorkstations(ss) {
  const workstationSheet = ss.getSheetByName(SHEET_NAME);
  const overviewSheet = ss.getSheetByName('📊 Backup Overview');

  if (!workstationSheet || !overviewSheet) {
    Logger.log('Warning: Required sheets not found for overview update');
    return;
  }

  // Get all workstation data
  const data = workstationSheet.getDataRange().getValues();

  if (data.length <= 1) {
    Logger.log('No workstation data to summarize');
    return; // Only header row
  }

  // Count statuses
  let activeCount = 0;
  let warningCount = 0;
  let errorCount = 0;
  let totalWorkstations = data.length - 1; // Exclude header

  let mostRecentCheck = null;

  for (let i = 1; i < data.length; i++) {
    const status = data[i][4]; // Column E: Status
    const lastCheck = new Date(data[i][8]); // Column I: Last Check

    // Count statuses
    if (status.includes('ACTIVE') || status.includes('✅')) {
      activeCount++;
    } else if (status.includes('WARNING') || status.includes('STALE') || status.includes('⚠️')) {
      warningCount++;
    } else if (status.includes('ERROR') || status.includes('❌')) {
      errorCount++;
    }

    // Track most recent check
    if (!mostRecentCheck || lastCheck > mostRecentCheck) {
      mostRecentCheck = lastCheck;
    }
  }

  // Calculate success rate (7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  let recentChecks = 0;
  let recentActive = 0;

  for (let i = 1; i < data.length; i++) {
    const lastCheck = new Date(data[i][8]);
    if (lastCheck >= sevenDaysAgo) {
      recentChecks++;
      const status = data[i][4];
      if (status.includes('ACTIVE') || status.includes('✅')) {
        recentActive++;
      }
    }
  }

  const successRate = recentChecks > 0 ? Math.round((recentActive / recentChecks) * 100) : 0;

  // Determine overall status
  let overallStatus = '✅ ACTIVE';
  if (errorCount > 0) {
    overallStatus = '❌ ERROR';
  } else if (warningCount > 0) {
    overallStatus = '⚠️ WARNING';
  }

  // Find Layer 6 row in overview
  // Search for "Layer 6" or "Workstation" in column A
  const overviewData = overviewSheet.getDataRange().getValues();
  let layer6Row = -1;

  for (let i = 0; i < overviewData.length; i++) {
    const cellValue = String(overviewData[i][0]);
    if (cellValue.includes('Layer 6') || cellValue.includes('Workstation')) {
      layer6Row = i + 1; // +1 for 1-indexed
      break;
    }
  }

  // If Layer 6 row not found, log warning
  if (layer6Row === -1) {
    Logger.log('Warning: Layer 6 row not found in overview sheet');
    return;
  }

  // Update overview (adjust column indices based on your overview layout)
  // Assuming: Col A = Layer, Col B = Component, Col C = Status, Col D = Last Success, Col E = Success Rate, Col F = Notes
  try {
    overviewSheet.getRange(layer6Row, 3).setValue(overallStatus);                      // Status
    overviewSheet.getRange(layer6Row, 4).setValue(mostRecentCheck);                    // Last Success
    overviewSheet.getRange(layer6Row, 5).setValue(successRate + '%');                  // Success Rate (7d)
    overviewSheet.getRange(layer6Row, 6).setValue(`${activeCount}/${totalWorkstations} workstations healthy`); // Notes

    Logger.log('Updated overview: ' + overallStatus + ' - ' + activeCount + '/' + totalWorkstations + ' healthy');
  } catch (error) {
    Logger.log('Error updating overview: ' + error.toString());
  }
}

/**
 * Test function - run manually to test webhook
 */
function testWorkstationWebhook() {
  const testPayload = {
    device_id: "Test-Mac-" + new Date().getTime(),
    user: "testuser",
    platform: "Mac",
    backup_type: "Time Machine",
    status: "✅ ACTIVE",
    last_backup: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    destination: "Time Machine Backup Drive",
    message: "Backup 2 hours old",
    timestamp: new Date().toISOString()
  };

  logWorkstationStatus(testPayload);
  Logger.log("Test payload logged successfully");

  return {
    success: true,
    device: testPayload.device_id,
    message: "Test completed - check " + SHEET_NAME + " tab"
  };
}

/**
 * Setup function - creates sheet and shows deployment instructions
 */
function setupWorkstationMonitoring() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = createWorkstationBackupSheet(ss);
    Logger.log("Created new sheet: " + SHEET_NAME);
  } else {
    Logger.log("Sheet already exists: " + SHEET_NAME);
  }

  // Show deployment instructions
  const ui = SpreadsheetApp.getUi();
  ui.alert(
    'Workstation Monitoring Setup',
    'Sheet created successfully!\n\n' +
    'Next steps:\n' +
    '1. Deploy this script as Web App (Deploy > New deployment)\n' +
    '2. Execute as: Me\n' +
    '3. Who has access: Anyone\n' +
    '4. Copy the deployment URL\n' +
    '5. Distribute URL to team members for installation\n\n' +
    'Sheet: ' + SHEET_NAME,
    ui.ButtonSet.OK
  );

  return {
    success: true,
    sheet: SHEET_NAME,
    message: "Setup complete - ready for deployment"
  };
}

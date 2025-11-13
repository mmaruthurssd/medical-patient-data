/**
 * Backup Monitoring System for 6-Layer Protection Strategy
 * Logs activity and status for all backup layers to Daily Snapshot Log spreadsheet
 */

const SPREADSHEET_ID = '1KpUhrEtW7-uHHS6GIngiXws0v2aM2wBC5ppyDBnRKxc';

/**
 * One-time setup: Create all monitoring tabs
 */
function setupBackupMonitoringTabs() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  const tabs = [
    { name: '📊 Backup Overview', color: '#4285f4' },
    { name: 'Layer 1 - Google Drive', color: '#0f9d58' },
    { name: 'Layer 2 - Local Git', color: '#f4b400' },
    { name: 'Layer 3 - GitHub', color: '#ab47bc' },
    { name: 'Layer 4 - Branch Protection', color: '#00acc1' },
    { name: 'Layer 5 - GCS Backup', color: '#ff6f00' },
    { name: 'Layer 6 - Time Machine', color: '#5f6368' }
  ];

  console.log('Creating backup monitoring tabs...');

  tabs.forEach(tab => {
    let sheet = ss.getSheetByName(tab.name);
    if (!sheet) {
      sheet = ss.insertSheet(tab.name);
      sheet.setTabColor(tab.color);
      console.log(`Created: ${tab.name}`);
    } else {
      console.log(`Already exists: ${tab.name}`);
    }
  });

  // Initialize each tab with headers
  initializeOverviewTab(ss);
  initializeLayer1Tab(ss);
  initializeLayer2Tab(ss);
  initializeLayer3Tab(ss);
  initializeLayer4Tab(ss);
  initializeLayer5Tab(ss);
  initializeLayer6Tab(ss);

  console.log('Setup complete!');
  return 'Backup monitoring tabs created successfully';
}

/**
 * Initialize Overview Tab
 */
function initializeOverviewTab(ss) {
  const sheet = ss.getSheetByName('📊 Backup Overview');
  if (!sheet) return;

  // Clear and set up headers
  sheet.clear();
  sheet.setFrozenRows(2);

  const headers = [
    ['6-Layer Backup Protection System - Status Dashboard'],
    ['Layer', 'Status', 'Last Success', 'Last Check', 'Success Rate (7d)', 'Total Events', 'Issues', 'Next Scheduled']
  ];

  sheet.getRange(1, 1, 2, 8).setValues(headers);

  // Format header row
  sheet.getRange(1, 1, 1, 8)
    .merge()
    .setBackground('#4285f4')
    .setFontColor('#ffffff')
    .setFontSize(14)
    .setFontWeight('bold')
    .setHorizontalAlignment('center');

  sheet.getRange(2, 1, 1, 8)
    .setBackground('#e8f0fe')
    .setFontWeight('bold')
    .setHorizontalAlignment('center');

  // Add layer rows
  const layers = [
    ['Layer 1: Google Drive', 'Initializing...', '', '', '0%', '0', '0', 'Continuous'],
    ['Layer 2: Local Git', 'Initializing...', '', '', '0%', '0', '0', 'On commit'],
    ['Layer 3: GitHub', 'Initializing...', '', '', '0%', '0', '0', 'On push'],
    ['Layer 4: Branch Protection', 'Initializing...', '', '', '0%', '0', '0', 'Always active'],
    ['Layer 5: GCS Backup', 'Initializing...', '', '', '0%', '0', '0', '9 AM & 5 PM CST'],
    ['Layer 6: Time Machine', 'Initializing...', '', '', '0%', '0', '0', 'Hourly (macOS)']
  ];

  sheet.getRange(3, 1, 6, 8).setValues(layers);

  // Auto-resize columns
  for (let i = 1; i <= 8; i++) {
    sheet.autoResizeColumn(i);
  }

  // Add last updated timestamp
  sheet.getRange(10, 1, 1, 2).setValues([['Last Updated:', new Date()]]);
  sheet.getRange(10, 1).setFontWeight('bold');
}

/**
 * Initialize Layer 1: Google Drive Tab
 */
function initializeLayer1Tab(ss) {
  const sheet = ss.getSheetByName('Layer 1 - Google Drive');
  if (!sheet) return;

  sheet.clear();
  sheet.setFrozenRows(1);

  const headers = [['Timestamp', 'Event Type', 'Sheets Count', 'Status', 'Details', 'Duration (s)']];
  sheet.getRange(1, 1, 1, 6).setValues(headers);
  sheet.getRange(1, 1, 1, 6)
    .setBackground('#0f9d58')
    .setFontColor('#ffffff')
    .setFontWeight('bold');

  for (let i = 1; i <= 6; i++) {
    sheet.autoResizeColumn(i);
  }
}

/**
 * Initialize Layer 2: Local Git Tab
 */
function initializeLayer2Tab(ss) {
  const sheet = ss.getSheetByName('Layer 2 - Local Git');
  if (!sheet) return;

  sheet.clear();
  sheet.setFrozenRows(1);

  const headers = [['Timestamp', 'Event Type', 'Commit SHA', 'Files Changed', 'Status', 'Message']];
  sheet.getRange(1, 1, 1, 6).setValues(headers);
  sheet.getRange(1, 1, 1, 6)
    .setBackground('#f4b400')
    .setFontColor('#ffffff')
    .setFontWeight('bold');

  for (let i = 1; i <= 6; i++) {
    sheet.autoResizeColumn(i);
  }
}

/**
 * Initialize Layer 3: GitHub Tab
 */
function initializeLayer3Tab(ss) {
  const sheet = ss.getSheetByName('Layer 3 - GitHub');
  if (!sheet) return;

  sheet.clear();
  sheet.setFrozenRows(1);

  const headers = [['Timestamp', 'Event Type', 'Commit SHA', 'Branch', 'Status', 'Pre-push Check', 'Details']];
  sheet.getRange(1, 1, 1, 7).setValues(headers);
  sheet.getRange(1, 1, 1, 7)
    .setBackground('#ab47bc')
    .setFontColor('#ffffff')
    .setFontWeight('bold');

  for (let i = 1; i <= 7; i++) {
    sheet.autoResizeColumn(i);
  }
}

/**
 * Initialize Layer 4: Branch Protection Tab
 */
function initializeLayer4Tab(ss) {
  const sheet = ss.getSheetByName('Layer 4 - Branch Protection');
  if (!sheet) return;

  sheet.clear();
  sheet.setFrozenRows(1);

  const headers = [['Timestamp', 'Check Type', 'Branch', 'Protection Active', 'Blocked Actions', 'Details']];
  sheet.getRange(1, 1, 1, 6).setValues(headers);
  sheet.getRange(1, 1, 1, 6)
    .setBackground('#00acc1')
    .setFontColor('#ffffff')
    .setFontWeight('bold');

  for (let i = 1; i <= 6; i++) {
    sheet.autoResizeColumn(i);
  }
}

/**
 * Initialize Layer 5: GCS Backup Tab
 */
function initializeLayer5Tab(ss) {
  const sheet = ss.getSheetByName('Layer 5 - GCS Backup');
  if (!sheet) return;

  sheet.clear();
  sheet.setFrozenRows(1);

  const headers = [['Timestamp', 'Event Type', 'Backup File', 'Size (MB)', 'Status', 'Duration (s)', 'Checksum Verified', 'Workflow Run']];
  sheet.getRange(1, 1, 1, 8).setValues(headers);
  sheet.getRange(1, 1, 1, 8)
    .setBackground('#ff6f00')
    .setFontColor('#ffffff')
    .setFontWeight('bold');

  for (let i = 1; i <= 8; i++) {
    sheet.autoResizeColumn(i);
  }
}

/**
 * Initialize Layer 6: Time Machine Tab
 */
function initializeLayer6Tab(ss) {
  const sheet = ss.getSheetByName('Layer 6 - Time Machine');
  if (!sheet) return;

  sheet.clear();
  sheet.setFrozenRows(1);

  const headers = [['Timestamp', 'Check Type', 'Backup Destination', 'Status', 'Last Backup', 'Details']];
  sheet.getRange(1, 1, 1, 6).setValues(headers);
  sheet.getRange(1, 1, 1, 6)
    .setBackground('#5f6368')
    .setFontColor('#ffffff')
    .setFontWeight('bold');

  for (let i = 1; i <= 6; i++) {
    sheet.autoResizeColumn(i);
  }
}

/**
 * Log event to specific layer tab
 */
function logBackupEvent(layerNumber, eventData) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheetNames = [
    null, // index 0 unused
    'Layer 1 - Google Drive',
    'Layer 2 - Local Git',
    'Layer 3 - GitHub',
    'Layer 4 - Branch Protection',
    'Layer 5 - GCS Backup',
    'Layer 6 - Time Machine'
  ];

  const sheet = ss.getSheetByName(sheetNames[layerNumber]);
  if (!sheet) {
    console.error(`Sheet not found for layer ${layerNumber}`);
    return;
  }

  // Add timestamp
  const row = [new Date(), ...eventData];
  sheet.appendRow(row);

  // Update overview
  updateOverview(ss);

  return 'Event logged successfully';
}

/**
 * Update overview tab with latest stats
 */
function updateOverview(ss) {
  const overviewSheet = ss.getSheetByName('📊 Backup Overview');
  if (!overviewSheet) return;

  const layers = [
    'Layer 1 - Google Drive',
    'Layer 2 - Local Git',
    'Layer 3 - GitHub',
    'Layer 4 - Branch Protection',
    'Layer 5 - GCS Backup',
    'Layer 6 - Time Machine'
  ];

  layers.forEach((layerName, index) => {
    const layerSheet = ss.getSheetByName(layerName);
    if (!layerSheet) return;

    const lastRow = layerSheet.getLastRow();
    if (lastRow < 2) return; // No data yet

    // Get last event
    const lastEvent = layerSheet.getRange(lastRow, 1, 1, layerSheet.getLastColumn()).getValues()[0];
    const timestamp = lastEvent[0];
    const status = lastEvent[lastEvent.length - 2] || lastEvent[lastEvent.length - 3]; // Status column varies by layer

    // Calculate 7-day success rate
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    let totalEvents = 0;
    let successEvents = 0;

    for (let i = 2; i <= lastRow; i++) {
      const eventTimestamp = layerSheet.getRange(i, 1).getValue();
      if (eventTimestamp >= sevenDaysAgo) {
        totalEvents++;
        const eventStatus = layerSheet.getRange(i, 5).getValue(); // Status typically in column 5
        if (eventStatus && (eventStatus.toString().includes('SUCCESS') || eventStatus.toString().includes('✅'))) {
          successEvents++;
        }
      }
    }

    const successRate = totalEvents > 0 ? Math.round((successEvents / totalEvents) * 100) + '%' : 'N/A';

    // Update overview row
    const overviewRow = 3 + index;
    overviewSheet.getRange(overviewRow, 2).setValue(status.toString().includes('SUCCESS') || status.toString().includes('✅') ? '✅ Active' : '⚠️ Check Needed');
    overviewSheet.getRange(overviewRow, 3).setValue(timestamp);
    overviewSheet.getRange(overviewRow, 4).setValue(new Date());
    overviewSheet.getRange(overviewRow, 5).setValue(successRate);
    overviewSheet.getRange(overviewRow, 6).setValue(lastRow - 1); // Total events
  });

  // Update last updated timestamp
  overviewSheet.getRange(10, 2).setValue(new Date());
}

// Example logging functions for each layer

function logLayer1Event(sheetsCount, status, details, duration) {
  return logBackupEvent(1, ['Snapshot', sheetsCount, status, details, duration]);
}

function logLayer2Event(commitSha, filesChanged, status, message) {
  return logBackupEvent(2, ['Commit', commitSha, filesChanged, status, message]);
}

function logLayer3Event(commitSha, branch, status, preCheckResult, details) {
  return logBackupEvent(3, ['Push', commitSha, branch, status, preCheckResult, details]);
}

function logLayer4Event(checkType, branch, isActive, blockedActions, details) {
  return logBackupEvent(4, [checkType, branch, isActive, blockedActions, details]);
}

function logLayer5Event(backupFile, sizeMB, status, duration, checksumVerified, workflowRun) {
  return logBackupEvent(5, ['Backup', backupFile, sizeMB, status, duration, checksumVerified, workflowRun]);
}

function logLayer6Event(checkType, destination, status, lastBackup, details) {
  return logBackupEvent(6, [checkType, destination, status, lastBackup, details]);
}

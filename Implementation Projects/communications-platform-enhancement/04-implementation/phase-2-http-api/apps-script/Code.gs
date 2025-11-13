/**
 * Communications Approval Dashboard - Apps Script Backend
 *
 * This script provides the backend for the web-based approval interface.
 * Deploy as Web App for remote access.
 *
 * Setup:
 * 1. Copy this code to: Extensions → Apps Script in your Google Sheet
 * 2. Deploy → New Deployment → Web app
 * 3. Execute as: Me
 * 4. Who has access: Anyone with Google Workspace domain
 * 5. Copy Web App URL
 */

// ============================================================================
// Configuration
// ============================================================================

const CONFIG = {
  // Communication Platform API (for sending approved messages)
  API_URL: 'http://localhost:3002/api/v1',  // Update when deployed

  // Sheet names
  SHEETS: {
    STAGED: 'Staged-Communications',
    MAIN_LOG: 'Communications-Log',
    CONTACTS: 'Contacts-Log',
    OPERATIONS: 'Operations-Log'
  },

  // Column indices (0-based)
  COLUMNS: {
    TIMESTAMP: 0,        // A
    OPERATION_ID: 1,     // B
    TYPE: 2,            // C
    DIRECTION: 3,       // D
    STATUS: 4,          // E
    AI_SYSTEM: 5,       // F
    FROM: 6,            // G
    TO: 7,              // H
    SUBJECT: 8,         // I
    BODY_PREVIEW: 9,    // J
    BODY_LOCATION: 10,  // K
    CHANNEL: 11,        // L
    PRIORITY: 12,       // M
    STAGED_BY: 13,      // N
    STAGED_AT: 14,      // O
    APPROVED_BY: 15,    // P
    APPROVED_AT: 16,    // Q
    SENT_AT: 17,        // R
    DELIVERED_AT: 18,   // S
    ERROR_MESSAGE: 19,  // T
    COST: 20,           // U
    PHI_FLAG: 21,       // V
    METADATA: 22,       // W
    EXPIRES_AT: 23,     // X
    REVIEW_NOTES: 24,   // Y
    REVIEW_URL: 25      // Z
  }
};

// ============================================================================
// Web App Entry Point
// ============================================================================

/**
 * Serve the approval dashboard HTML
 */
function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('ApprovalDashboard')
    .setTitle('Communications Approval Dashboard')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Get all staged communications pending approval
 */
function getStagedCommunications() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEETS.STAGED);
  const data = sheet.getDataRange().getValues();

  // Skip header row, filter for status='staged'
  const staged = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[CONFIG.COLUMNS.STATUS] === 'staged') {
      staged.push({
        operationId: row[CONFIG.COLUMNS.OPERATION_ID],
        type: row[CONFIG.COLUMNS.TYPE],
        direction: row[CONFIG.COLUMNS.DIRECTION],
        aiSystem: row[CONFIG.COLUMNS.AI_SYSTEM],
        from: row[CONFIG.COLUMNS.FROM],
        to: row[CONFIG.COLUMNS.TO],
        subject: row[CONFIG.COLUMNS.SUBJECT],
        bodyPreview: row[CONFIG.COLUMNS.BODY_PREVIEW],
        channel: row[CONFIG.COLUMNS.CHANNEL],
        priority: row[CONFIG.COLUMNS.PRIORITY],
        stagedBy: row[CONFIG.COLUMNS.STAGED_BY],
        stagedAt: row[CONFIG.COLUMNS.STAGED_AT],
        phiFlag: row[CONFIG.COLUMNS.PHI_FLAG],
        rowIndex: i + 1  // +1 for 1-indexed rows
      });
    }
  }

  return staged;
}

/**
 * Approve a staged communication
 */
function approveCommunication(operationId, approvedBy) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEETS.STAGED);
    const rowIndex = findRowByOperationId(sheet, operationId);

    if (rowIndex === -1) {
      return { success: false, error: 'Operation not found' };
    }

    // Update status to 'approved' and set approval metadata
    const now = new Date();
    sheet.getRange(rowIndex, CONFIG.COLUMNS.STATUS + 1).setValue('approved');
    sheet.getRange(rowIndex, CONFIG.COLUMNS.APPROVED_BY + 1).setValue(approvedBy);
    sheet.getRange(rowIndex, CONFIG.COLUMNS.APPROVED_AT + 1).setValue(now);

    // Move to main log
    moveToMainLog(operationId);

    // Trigger send via Communication Platform API
    const sendResult = triggerSend(operationId);

    // Log the approval operation
    logOperation({
      operationType: 'communication-approval',
      operation: 'approve',
      aiSystem: 'manual',
      status: sendResult.success ? 'success' : 'failed',
      details: { operationId, approvedBy },
      error: sendResult.error,
      user: approvedBy
    });

    return { success: true, operationId };
  } catch (error) {
    Logger.log('Error approving communication: ' + error.toString());
    return { success: false, error: error.toString() };
  }
}

/**
 * Reject a staged communication
 */
function rejectCommunication(operationId, rejectedBy, reviewNotes) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEETS.STAGED);
    const rowIndex = findRowByOperationId(sheet, operationId);

    if (rowIndex === -1) {
      return { success: false, error: 'Operation not found' };
    }

    // Update status to 'failed' with rejection reason
    sheet.getRange(rowIndex, CONFIG.COLUMNS.STATUS + 1).setValue('failed');
    sheet.getRange(rowIndex, CONFIG.COLUMNS.ERROR_MESSAGE + 1).setValue('Rejected: ' + reviewNotes);
    sheet.getRange(rowIndex, CONFIG.COLUMNS.REVIEW_NOTES + 1).setValue(reviewNotes);

    // Log the rejection
    logOperation({
      operationType: 'communication-approval',
      operation: 'reject',
      aiSystem: 'manual',
      status: 'success',
      details: { operationId, rejectedBy, reviewNotes },
      user: rejectedBy
    });

    return { success: true, operationId };
  } catch (error) {
    Logger.log('Error rejecting communication: ' + error.toString());
    return { success: false, error: error.toString() };
  }
}

/**
 * Batch approve multiple communications
 */
function batchApproveCommunications(operationIds, approvedBy) {
  const results = [];

  for (const operationId of operationIds) {
    const result = approveCommunication(operationId, approvedBy);
    results.push({ operationId, ...result });
  }

  return results;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Find row index by operation ID
 */
function findRowByOperationId(sheet, operationId) {
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][CONFIG.COLUMNS.OPERATION_ID] === operationId) {
      return i + 1;  // +1 for 1-indexed rows
    }
  }

  return -1;
}

/**
 * Move approved communication from Staged to Main Log
 */
function moveToMainLog(operationId) {
  const stagedSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEETS.STAGED);
  const mainSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEETS.MAIN_LOG);

  const rowIndex = findRowByOperationId(stagedSheet, operationId);
  if (rowIndex === -1) return;

  // Copy row to main log (columns A through W only, not X-Z)
  const rowData = stagedSheet.getRange(rowIndex, 1, 1, 23).getValues()[0];
  mainSheet.appendRow(rowData);

  // Delete from staged sheet
  stagedSheet.deleteRow(rowIndex);
}

/**
 * Trigger actual send via Communication Platform API
 */
function triggerSend(operationId) {
  try {
    // Get API key from script properties
    const apiKey = PropertiesService.getScriptProperties().getProperty('COMMUNICATIONS_API_KEY');

    if (!apiKey) {
      Logger.log('Warning: COMMUNICATIONS_API_KEY not set. Cannot trigger send.');
      return { success: false, error: 'API key not configured' };
    }

    const url = CONFIG.API_URL + '/send-approved';
    const options = {
      method: 'post',
      contentType: 'application/json',
      headers: {
        'Authorization': 'Bearer ' + apiKey
      },
      payload: JSON.stringify({ operationId }),
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(url, options);
    const statusCode = response.getResponseCode();

    if (statusCode === 200 || statusCode === 201) {
      return { success: true };
    } else {
      return { success: false, error: 'API returned status ' + statusCode };
    }
  } catch (error) {
    Logger.log('Error triggering send: ' + error.toString());
    return { success: false, error: error.toString() };
  }
}

/**
 * Log an operation to Operations-Log sheet
 */
function logOperation(entry) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEETS.OPERATIONS);
    const operationId = 'op-' + Date.now() + '-' + Math.random().toString(36).substring(7);

    sheet.appendRow([
      new Date(),
      operationId,
      entry.operationType,
      entry.operation,
      entry.aiSystem,
      entry.status,
      JSON.stringify(entry.details || {}),
      entry.error || '',
      entry.user
    ]);
  } catch (error) {
    Logger.log('Error logging operation: ' + error.toString());
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get dashboard statistics
 */
function getDashboardStats() {
  const stagedSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEETS.STAGED);
  const data = stagedSheet.getDataRange().getValues();

  let totalStaged = 0;
  let urgent = 0;
  let high = 0;
  let normal = 0;
  let low = 0;
  let phiCount = 0;

  for (let i = 1; i < data.length; i++) {
    if (data[i][CONFIG.COLUMNS.STATUS] === 'staged') {
      totalStaged++;

      const priority = data[i][CONFIG.COLUMNS.PRIORITY];
      if (priority === 'urgent') urgent++;
      else if (priority === 'high') high++;
      else if (priority === 'normal') normal++;
      else if (priority === 'low') low++;

      if (data[i][CONFIG.COLUMNS.PHI_FLAG] === 'TRUE') phiCount++;
    }
  }

  return {
    totalStaged,
    byPriority: { urgent, high, normal, low },
    phiCount
  };
}

/**
 * Get current user email
 */
function getCurrentUserEmail() {
  return Session.getActiveUser().getEmail();
}

// ============================================================================
// Custom Menu (Optional)
// ============================================================================

/**
 * Add custom menu to spreadsheet
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Communications')
    .addItem('Open Approval Dashboard', 'openDashboard')
    .addSeparator()
    .addItem('Approve Selected Row', 'approveSelectedRow')
    .addItem('Reject Selected Row', 'rejectSelectedRow')
    .addSeparator()
    .addItem('Refresh Status', 'refreshStatus')
    .addItem('View Statistics', 'showStatistics')
    .addToUi();
}

/**
 * Open approval dashboard (launches web app)
 */
function openDashboard() {
  const webAppUrl = PropertiesService.getScriptProperties().getProperty('WEB_APP_URL');

  if (!webAppUrl) {
    SpreadsheetApp.getUi().alert('Web App URL not configured. Please deploy as Web App first.');
    return;
  }

  const html = '<script>window.open("' + webAppUrl + '"); google.script.host.close();</script>';
  SpreadsheetApp.getUi().showModalDialog(
    HtmlService.createHtmlOutput(html),
    'Opening Dashboard...'
  );
}

/**
 * Approve currently selected row
 */
function approveSelectedRow() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const row = sheet.getActiveRange().getRow();
  const operationId = sheet.getRange(row, CONFIG.COLUMNS.OPERATION_ID + 1).getValue();

  if (!operationId) {
    SpreadsheetApp.getUi().alert('No operation ID found in selected row.');
    return;
  }

  const userEmail = Session.getActiveUser().getEmail();
  const result = approveCommunication(operationId, userEmail);

  if (result.success) {
    SpreadsheetApp.getUi().alert('✅ Communication approved and sent!');
  } else {
    SpreadsheetApp.getUi().alert('❌ Error: ' + result.error);
  }
}

/**
 * Reject currently selected row
 */
function rejectSelectedRow() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const row = sheet.getActiveRange().getRow();
  const operationId = sheet.getRange(row, CONFIG.COLUMNS.OPERATION_ID + 1).getValue();

  if (!operationId) {
    SpreadsheetApp.getUi().alert('No operation ID found in selected row.');
    return;
  }

  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt('Reject Communication', 'Enter rejection reason:', ui.ButtonSet.OK_CANCEL);

  if (response.getSelectedButton() === ui.Button.OK) {
    const notes = response.getResponseText();
    const userEmail = Session.getActiveUser().getEmail();
    const result = rejectCommunication(operationId, userEmail, notes);

    if (result.success) {
      ui.alert('✅ Communication rejected.');
    } else {
      ui.alert('❌ Error: ' + result.error);
    }
  }
}

/**
 * Show statistics dialog
 */
function showStatistics() {
  const stats = getDashboardStats();
  const message =
    'Total Staged: ' + stats.totalStaged + '\n\n' +
    'By Priority:\n' +
    '  Urgent: ' + stats.byPriority.urgent + '\n' +
    '  High: ' + stats.byPriority.high + '\n' +
    '  Normal: ' + stats.byPriority.normal + '\n' +
    '  Low: ' + stats.byPriority.low + '\n\n' +
    'Contains PHI: ' + stats.phiCount;

  SpreadsheetApp.getUi().alert('Dashboard Statistics', message, SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Refresh status (placeholder for future functionality)
 */
function refreshStatus() {
  SpreadsheetApp.getUi().alert('Status refreshed.');
}

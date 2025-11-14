/**
 * MASTER LOGGER DASHBOARD - Google Apps Script
 *
 * Deploy this code in the Master Logger Dashboard spreadsheet to add:
 * - Automated error alerting
 * - Data cleanup and maintenance
 * - Advanced analytics functions
 * - Dashboard refresh capabilities
 */

// ──────────────────────────────────────────────────────────
// Configuration Constants
// ──────────────────────────────────────────────────────────

const MASTER_CONFIG = {
  // Email settings for alerts
  ALERT_EMAIL: 'your-admin@company.com',
  ERROR_THRESHOLD: 5,        // Alert if more than 5 errors in 1 hour
  RETENTION_DAYS: 90,        // Keep logs for 90 days

  // Sheet names
  SHEETS: {
    PIPELINE_LOG: 'Pipeline_Log',
    REGISTRY: 'Registry',
    DASHBOARD: 'Dashboard',
    ERROR_SUMMARY: 'Error_Summary',
    PERFORMANCE_METRICS: 'Performance_Metrics'
  }
};

// ──────────────────────────────────────────────────────────
// Dashboard Management Functions
// ──────────────────────────────────────────────────────────

/**
 * Creates custom menu for Master Logger Dashboard
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('📊 Master Logger')
    .addItem('🔄 Refresh Dashboard', 'refreshDashboard')
    .addItem('🧹 Cleanup Old Data', 'cleanupOldData')
    .addItem('📧 Test Error Alerts', 'testErrorAlerts')
    .addItem('📈 Generate Report', 'generateWeeklyReport')
    .addSeparator()
    .addItem('⚙️ Setup Dashboard', 'setupDashboard')
    .addItem('📊 Create Pipeline_Log Tab', 'createPipelineLogTab')
    .addItem('🔄 Update Pipeline_Log Headers', 'updatePipelineLogHeaders')
    .addItem('✅ Validate Setup', 'validateSetup')
    .addToUi();
}

/**
 * Sets up initial dashboard structure with proper formulas
 */
function setupDashboard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  try {
    // Setup Pipeline_Log tab FIRST (required for all other tabs)
    setupPipelineLogTab(ss);

    // Setup Dashboard tab
    setupDashboardTab(ss);

    // Setup Error Summary tab
    setupErrorSummaryTab(ss);

    // Setup Performance Metrics tab
    setupPerformanceMetricsTab(ss);

    // Create initial Registry entries
    setupRegistryTab(ss);

    SpreadsheetApp.getUi().alert('✅ Dashboard setup complete! All tabs created with proper schemas.');

  } catch (error) {
    SpreadsheetApp.getUi().alert('❌ Setup failed: ' + error.toString());
  }
}

/**
 * Creates Pipeline_Log tab only (standalone function)
 * Use this if you only need to add the Pipeline_Log tab
 */
function createPipelineLogTab() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  try {
    setupPipelineLogTab(ss);
    SpreadsheetApp.getUi().alert('✅ Pipeline_Log tab created successfully!');
  } catch (error) {
    SpreadsheetApp.getUi().alert('❌ Failed to create Pipeline_Log tab: ' + error.toString());
  }
}

/**
 * Updates existing Pipeline_Log headers to include new data flow columns
 * Use this to upgrade existing Pipeline_Log tabs from 14 to 18 columns
 */
function updatePipelineLogHeaders() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  try {
    let sheet = ss.getSheetByName(MASTER_CONFIG.SHEETS.PIPELINE_LOG);
    if (!sheet) {
      SpreadsheetApp.getUi().alert('❌ Pipeline_Log tab not found! Run createPipelineLogTab() first.');
      return;
    }

    // Check current header count
    const currentHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const currentColumnCount = currentHeaders.filter(h => h !== '').length;

    if (currentColumnCount >= 18) {
      SpreadsheetApp.getUi().alert('✅ Headers already up to date! Pipeline_Log has ' + currentColumnCount + ' columns.');
      return;
    }

    // Add the new data flow headers
    const newHeaders = ['DataFlowType', 'InputRowCount', 'OutputRowCount', 'DataQuality'];
    const startColumn = currentColumnCount + 1;

    // Set new headers
    sheet.getRange(1, startColumn, 1, newHeaders.length).setValues([newHeaders]);
    sheet.getRange(1, startColumn, 1, newHeaders.length).setBackground('#34a853').setFontColor('white').setFontWeight('bold');

    // Add column notes
    sheet.getRange(1, startColumn).setNote('Data flow types: INPUT, OUTPUT, TRANSFORM');
    sheet.getRange(1, startColumn + 1).setNote('Number of rows read from source');
    sheet.getRange(1, startColumn + 2).setNote('Number of rows written to target');
    sheet.getRange(1, startColumn + 3).setNote('Data quality: CLEAN, DIRTY, VALIDATED, UNKNOWN, ERROR');

    // Auto-resize new columns
    sheet.autoResizeColumns(startColumn, newHeaders.length);

    SpreadsheetApp.getUi().alert('✅ Pipeline_Log headers updated successfully! Added ' + newHeaders.length + ' new data flow columns.');
  } catch (error) {
    SpreadsheetApp.getUi().alert('❌ Failed to update headers: ' + error.toString());
  }
}

/**
 * Sets up Pipeline_Log tab with proper schema
 * This is the main data collection tab that receives telemetry from all projects
 */
function setupPipelineLogTab(ss) {
  let sheet = ss.getSheetByName(MASTER_CONFIG.SHEETS.PIPELINE_LOG);
  if (!sheet) {
    sheet = ss.insertSheet(MASTER_CONFIG.SHEETS.PIPELINE_LOG);
  }

  // Only add headers if sheet is empty
  if (sheet.getLastRow() === 0) {
    const headers = [[
      'TimestampISO',
      'CorrelationId',
      'ProjectId',
      'SpreadsheetId',
      'SpreadsheetName',
      'FunctionName',
      'OpType',
      'SourceRef',
      'TargetRef',
      'RowsAffected',
      'Status',
      'ErrorType',
      'ErrorMessage',
      'DurationMs',
      // NEW DATA FLOW COLUMNS:
      'DataFlowType',
      'InputRowCount',
      'OutputRowCount',
      'DataQuality'
    ]];

    sheet.getRange('A1:R1').setValues(headers);
    sheet.getRange('A1:R1').setBackground('#34a853').setFontColor('white').setFontWeight('bold');

    // Add sample row to show expected data format
    const sampleRow = [[
      new Date().toISOString(),
      'sample-correlation-id',
      'sample-project-id',
      'sample-spreadsheet-id',
      'Sample Project Name',
      'sampleFunction',
      'SETUP',
      'Master Logger Setup',
      'Pipeline_Log Tab',
      1,
      'OK',
      '',
      'Sample setup entry - will be replaced by real telemetry data',
      150,
      // NEW DATA FLOW SAMPLE VALUES:
      'TRANSFORM',
      10,
      8,
      'CLEAN'
    ]];

    sheet.getRange('A2:R2').setValues(sampleRow);
    sheet.getRange('A2:R2').setBackground('#f8f9fa');

    // Auto-resize columns for better readability
    sheet.autoResizeColumns(1, 18);

    // Add data validation notes
    sheet.getRange('A1').setNote('ISO timestamp format: 2024-01-15T10:30:45.123Z');
    sheet.getRange('K1').setNote('Status values: OK or ERROR');
    sheet.getRange('L1').setNote('Error types: TIMEOUT, NETWORK, PERMISSION, DATA_VALIDATION, EXECUTION');
    // NEW DATA FLOW COLUMN NOTES:
    sheet.getRange('O1').setNote('Data flow types: INPUT, OUTPUT, TRANSFORM');
    sheet.getRange('P1').setNote('Number of rows read from source');
    sheet.getRange('Q1').setNote('Number of rows written to target');
    sheet.getRange('R1').setNote('Data quality: CLEAN, DIRTY, VALIDATED, UNKNOWN, ERROR');
  }
}

/**
 * Sets up Dashboard tab with live formulas
 */
function setupDashboardTab(ss) {
  let sheet = ss.getSheetByName(MASTER_CONFIG.SHEETS.DASHBOARD);
  if (!sheet) {
    sheet = ss.insertSheet(MASTER_CONFIG.SHEETS.DASHBOARD);
  }

  // Clear existing content
  sheet.clear();

  // Header
  sheet.getRange('A1:D1').merge().setValue('📊 PIPELINE MONITORING DASHBOARD');
  sheet.getRange('A1:D1').setBackground('#4285f4').setFontColor('white').setFontSize(16).setFontWeight('bold');

  // Summary metrics
  const summaryData = [
    ['📈 SUMMARY METRICS', '', '', ''],
    ['Total Operations Today:', `=COUNTIF(${MASTER_CONFIG.SHEETS.PIPELINE_LOG}!A:A,">="&TODAY())`, '', ''],
    ['Success Rate:', `=IF(B3>0,COUNTIFS(${MASTER_CONFIG.SHEETS.PIPELINE_LOG}!K:K,"OK",${MASTER_CONFIG.SHEETS.PIPELINE_LOG}!A:A,">="&TODAY())/B3*100,0)&"%"`, '', ''],
    ['Average Duration:', `=IF(B3>0,AVERAGE(IF(${MASTER_CONFIG.SHEETS.PIPELINE_LOG}!A:A>=TODAY(),${MASTER_CONFIG.SHEETS.PIPELINE_LOG}!N:N))&" ms","N/A")`, '', ''],
    ['Active Projects:', `=COUNTA(UNIQUE(FILTER(${MASTER_CONFIG.SHEETS.PIPELINE_LOG}!C:C,${MASTER_CONFIG.SHEETS.PIPELINE_LOG}!A:A>=TODAY())))`, '', ''],
    ['Total Rows Processed:', `=SUMIF(${MASTER_CONFIG.SHEETS.PIPELINE_LOG}!A:A,">="&TODAY(),${MASTER_CONFIG.SHEETS.PIPELINE_LOG}!J:J)`, '', ''],
    ['Error Count:', `=COUNTIFS(${MASTER_CONFIG.SHEETS.PIPELINE_LOG}!K:K,"ERROR",${MASTER_CONFIG.SHEETS.PIPELINE_LOG}!A:A,">="&TODAY())`, '', '']
  ];

  sheet.getRange(2, 1, summaryData.length, 4).setValues(summaryData);
  sheet.getRange('A2:D2').setBackground('#f1f3f4').setFontWeight('bold');
  sheet.getRange('A3:A8').setFontWeight('bold');

  // Recent Activity
  sheet.getRange('F1:M1').merge().setValue('🕐 RECENT OPERATIONS');
  sheet.getRange('F1:M1').setBackground('#34a853').setFontColor('white').setFontWeight('bold');

  const recentActivityFormula = `=QUERY(${MASTER_CONFIG.SHEETS.PIPELINE_LOG}!A:R,"SELECT A,E,F,G,J,K,N,O,P,Q,R WHERE A >= date '"&TEXT(TODAY(),"yyyy-mm-dd")&"' ORDER BY A DESC LIMIT 15",1)`;
  sheet.getRange('F2').setFormula(recentActivityFormula);

  // Error Breakdown
  sheet.getRange('A10:D10').merge().setValue('❌ ERROR BREAKDOWN (Today)');
  sheet.getRange('A10:D10').setBackground('#ea4335').setFontColor('white').setFontWeight('bold');

  const errorBreakdownFormula = `=QUERY(${MASTER_CONFIG.SHEETS.PIPELINE_LOG}!A:R,"SELECT L, COUNT(L) WHERE K='ERROR' AND A >= date '"&TEXT(TODAY(),"yyyy-mm-dd")&"' GROUP BY L ORDER BY COUNT(L) DESC",1)`;
  sheet.getRange('A11').setFormula(errorBreakdownFormula);

  // NEW: Data Flow Analytics
  sheet.getRange('F15:M15').merge().setValue('🔄 DATA FLOW ANALYTICS (Today)');
  sheet.getRange('F15:M15').setBackground('#9c27b0').setFontColor('white').setFontWeight('bold');

  const dataFlowSummaryFormula = `=QUERY(${MASTER_CONFIG.SHEETS.PIPELINE_LOG}!A:R,"SELECT O, COUNT(O) WHERE O <> '' AND A >= date '"&TEXT(TODAY(),"yyyy-mm-dd")&"' GROUP BY O ORDER BY COUNT(O) DESC",1)`;
  sheet.getRange('F16').setFormula(dataFlowSummaryFormula);

  // Pipeline Efficiency Analysis
  sheet.getRange('A15:D15').merge().setValue('⚡ PIPELINE EFFICIENCY (Today)');
  sheet.getRange('A15:D15').setBackground('#ff6f00').setFontColor('white').setFontWeight('bold');

  const efficiencyFormula = `=QUERY(${MASTER_CONFIG.SHEETS.PIPELINE_LOG}!A:R,"SELECT F, COUNT(F) WHERE O='TRANSFORM' AND P>0 AND Q>0 AND A >= date '"&TEXT(TODAY(),"yyyy-mm-dd")&"' GROUP BY F ORDER BY COUNT(F) DESC",1)`;
  sheet.getRange('A16').setFormula(efficiencyFormula);

  // Data Quality Overview
  sheet.getRange('F20:M20').merge().setValue('✅ DATA QUALITY OVERVIEW (Today)');
  sheet.getRange('F20:M20').setBackground('#0d7377').setFontColor('white').setFontWeight('bold');

  const dataQualityFormula = `=QUERY(${MASTER_CONFIG.SHEETS.PIPELINE_LOG}!A:R,"SELECT R, COUNT(R) WHERE R <> '' AND A >= date '"&TEXT(TODAY(),"yyyy-mm-dd")&"' GROUP BY R ORDER BY COUNT(R) DESC",1)`;
  sheet.getRange('F21').setFormula(dataQualityFormula);

  // Auto-resize columns
  sheet.autoResizeColumns(1, 13);
}

/**
 * Sets up Error Summary tab
 */
function setupErrorSummaryTab(ss) {
  let sheet = ss.getSheetByName(MASTER_CONFIG.SHEETS.ERROR_SUMMARY);
  if (!sheet) {
    sheet = ss.insertSheet(MASTER_CONFIG.SHEETS.ERROR_SUMMARY);
  }

  sheet.clear();

  // Error trends
  sheet.getRange('A1:E1').setValues([['Date', 'ErrorType', 'Count', 'FunctionName', 'ProjectName']]);
  sheet.getRange('A1:E1').setBackground('#ff9900').setFontColor('white').setFontWeight('bold');

  const errorTrendsFormula = `=QUERY(${MASTER_CONFIG.SHEETS.PIPELINE_LOG}!A:R,"SELECT DATE(A),L,COUNT(L),F,E WHERE K='ERROR' GROUP BY DATE(A),L,F,E ORDER BY DATE(A) DESC",0)`;
  sheet.getRange('A2').setFormula(errorTrendsFormula);

  // Top error functions
  sheet.getRange('G1:I1').setValues([['Function', 'Error Count', 'Total Operations']]);
  sheet.getRange('G1:I1').setBackground('#ff9900').setFontColor('white').setFontWeight('bold');

  const topErrorsFormula = `=QUERY(${MASTER_CONFIG.SHEETS.PIPELINE_LOG}!A:R,"SELECT F,COUNTIF(K,'ERROR'),COUNT(F) WHERE TRUE GROUP BY F ORDER BY COUNTIF(K,'ERROR') DESC",0)`;
  sheet.getRange('G2').setFormula(topErrorsFormula);

  sheet.autoResizeColumns(1, 9);
}

/**
 * Sets up Performance Metrics tab
 */
function setupPerformanceMetricsTab(ss) {
  let sheet = ss.getSheetByName(MASTER_CONFIG.SHEETS.PERFORMANCE_METRICS);
  if (!sheet) {
    sheet = ss.insertSheet(MASTER_CONFIG.SHEETS.PERFORMANCE_METRICS);
  }

  sheet.clear();

  // Performance analysis
  sheet.getRange('A1:D1').setValues([['Function', 'Avg Duration (ms)', 'Max Duration (ms)', 'Operations']]);
  sheet.getRange('A1:D1').setBackground('#9c27b0').setFontColor('white').setFontWeight('bold');

  const performanceFormula = `=QUERY(${MASTER_CONFIG.SHEETS.PIPELINE_LOG}!A:R,"SELECT F,COUNT(F) WHERE N>0 GROUP BY F ORDER BY COUNT(F) DESC",0)`;
  sheet.getRange('A2').setFormula(performanceFormula);

  // Daily volume trends with data flow
  sheet.getRange('F1:I1').setValues([['Date', 'Operations', 'Rows Processed', 'Avg Data Quality']]);
  sheet.getRange('F1:I1').setBackground('#9c27b0').setFontColor('white').setFontWeight('bold');

  const volumeFormula = `=QUERY(${MASTER_CONFIG.SHEETS.PIPELINE_LOG}!A:R,"SELECT DATE(A),COUNT(A) GROUP BY DATE(A) ORDER BY DATE(A) DESC LIMIT 30",0)`;
  sheet.getRange('F2').setFormula(volumeFormula);

  // NEW: Data Flow Performance Metrics
  sheet.getRange('A12:F12').merge().setValue('🔄 DATA FLOW PERFORMANCE METRICS');
  sheet.getRange('A12:F12').setBackground('#4caf50').setFontColor('white').setFontWeight('bold');

  // Input/Output Efficiency by Function
  sheet.getRange('A13:E13').setValues([['Function', 'Avg Input Rows', 'Avg Output Rows', 'Efficiency %', 'Operations']]);
  sheet.getRange('A13:E13').setBackground('#4caf50').setFontColor('white').setFontWeight('bold');

  const flowEfficiencyFormula = `=QUERY(${MASTER_CONFIG.SHEETS.PIPELINE_LOG}!A:R,"SELECT F,COUNT(F) WHERE O='TRANSFORM' AND P>0 AND Q>0 GROUP BY F ORDER BY COUNT(F) DESC",0)`;
  sheet.getRange('A14').setFormula(flowEfficiencyFormula);

  // Data Quality Trends
  sheet.getRange('G13:I13').setValues([['Data Quality', 'Count', 'Percentage']]);
  sheet.getRange('G13:I13').setBackground('#4caf50').setFontColor('white').setFontWeight('bold');

  const qualityTrendsFormula = `=QUERY(${MASTER_CONFIG.SHEETS.PIPELINE_LOG}!A:R,"SELECT R,COUNT(R) WHERE R <> '' GROUP BY R ORDER BY COUNT(R) DESC",0)`;
  sheet.getRange('G14').setFormula(qualityTrendsFormula);

  sheet.autoResizeColumns(1, 12);
}

/**
 * Sets up Registry tab with example entries
 */
function setupRegistryTab(ss) {
  let sheet = ss.getSheetByName(MASTER_CONFIG.SHEETS.REGISTRY);
  if (!sheet) {
    sheet = ss.insertSheet(MASTER_CONFIG.SHEETS.REGISTRY);
  }

  // Only add headers if sheet is empty
  if (sheet.getLastRow() === 0) {
    const headers = [['SpreadsheetId', 'FunctionName', 'OpType', 'SourceRef', 'TargetRef', 'Enabled']];
    sheet.getRange('A1:F1').setValues(headers);
    sheet.getRange('A1:F1').setBackground('#607d8b').setFontColor('white').setFontWeight('bold');

    // Add example entry
    const example = [['[Your-Spreadsheet-ID]', 'processPhasesMain', 'PHASE_MANAGEMENT', 'Master referral processing', 'All phase sheets', 'TRUE']];
    sheet.getRange('A2:F2').setValues(example);

    sheet.autoResizeColumns(1, 6);
  }
}

// ──────────────────────────────────────────────────────────
// Monitoring and Alerting Functions
// ──────────────────────────────────────────────────────────

/**
 * Checks for error alerts and sends notifications
 * Set this to run every 15 minutes via time-based trigger
 */
function checkErrorAlerts() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(MASTER_CONFIG.SHEETS.PIPELINE_LOG);

  if (!sheet) return;

  try {
    const oneHourAgo = new Date(Date.now() - 3600000);
    const data = sheet.getDataRange().getValues();

    // Skip header row and filter for recent errors
    const recentErrors = data.slice(1).filter(row =>
      row[0] && new Date(row[0]) > oneHourAgo && row[10] === 'ERROR'
    );

    if (recentErrors.length >= MASTER_CONFIG.ERROR_THRESHOLD) {
      sendErrorAlert(recentErrors);
    }

  } catch (error) {
    console.error('Error alert check failed:', error);
  }
}

/**
 * Sends error alert email
 */
function sendErrorAlert(errors) {
  const subject = `🚨 Pipeline Alert: ${errors.length} errors in the last hour`;

  let body = `High error rate detected in your data pipelines:\n\n`;
  body += `Total errors: ${errors.length}\n`;
  body += `Threshold: ${MASTER_CONFIG.ERROR_THRESHOLD}\n\n`;

  body += `Recent errors:\n`;
  errors.slice(0, 10).forEach(error => {
    body += `• ${error[1]} - ${error[5]} (${error[6]}): ${error[11]}\n`;
  });

  body += `\nView full details: ${SpreadsheetApp.getActiveSpreadsheet().getUrl()}`;

  try {
    GmailApp.sendEmail(MASTER_CONFIG.ALERT_EMAIL, subject, body);
    console.log(`Alert sent: ${errors.length} errors`);
  } catch (error) {
    console.error('Failed to send alert email:', error);
  }
}

/**
 * Test error alert functionality
 */
function testErrorAlerts() {
  const testErrors = [
    [new Date(), 'test-correlation-id', 'test-project', 'test-spreadsheet', 'Test Spreadsheet', 'testFunction', 'TEST', 'test-source', 'test-target', 1, 'ERROR', 'TIMEOUT', 'Test error message', 5000]
  ];

  sendErrorAlert(testErrors);
  SpreadsheetApp.getUi().alert('✅ Test alert sent to ' + MASTER_CONFIG.ALERT_EMAIL);
}

// ──────────────────────────────────────────────────────────
// Maintenance Functions
// ──────────────────────────────────────────────────────────

/**
 * Cleans up old log data beyond retention period
 * Run this weekly via time-based trigger
 */
function cleanupOldData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(MASTER_CONFIG.SHEETS.PIPELINE_LOG);

  if (!sheet) return;

  try {
    const cutoffDate = new Date(Date.now() - (MASTER_CONFIG.RETENTION_DAYS * 24 * 60 * 60 * 1000));
    const data = sheet.getDataRange().getValues();

    let deletedRows = 0;
    // Start from bottom to avoid index shifting
    for (let i = data.length - 1; i >= 1; i--) {
      if (data[i][0] && new Date(data[i][0]) < cutoffDate) {
        sheet.deleteRow(i + 1);
        deletedRows++;
      }
    }

    console.log(`Cleanup complete: ${deletedRows} old rows deleted`);

  } catch (error) {
    console.error('Data cleanup failed:', error);
  }
}

/**
 * Refreshes all dashboard formulas and data
 */
function refreshDashboard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  try {
    // Force recalculation by touching cells with formulas
    const dashboardSheet = ss.getSheetByName(MASTER_CONFIG.SHEETS.DASHBOARD);
    if (dashboardSheet) {
      SpreadsheetApp.flush();
      dashboardSheet.getRange('B3').setValue(dashboardSheet.getRange('B3').getFormula());
    }

    SpreadsheetApp.getUi().alert('✅ Dashboard refreshed!');

  } catch (error) {
    SpreadsheetApp.getUi().alert('❌ Refresh failed: ' + error.toString());
  }
}

/**
 * Generates weekly summary report
 */
function generateWeeklyReport() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(MASTER_CONFIG.SHEETS.PIPELINE_LOG);

  if (!sheet) return;

  try {
    const weekAgo = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000));
    const data = sheet.getDataRange().getValues();

    const weeklyData = data.slice(1).filter(row =>
      row[0] && new Date(row[0]) >= weekAgo
    );

    const totalOps = weeklyData.length;
    const errorCount = weeklyData.filter(row => row[10] === 'ERROR').length;
    const avgDuration = weeklyData.reduce((sum, row) => sum + (row[13] || 0), 0) / totalOps;
    const totalRowsProcessed = weeklyData.reduce((sum, row) => sum + (row[9] || 0), 0);

    const report = `📊 WEEKLY PIPELINE REPORT\n` +
      `Period: ${weekAgo.toDateString()} - ${new Date().toDateString()}\n\n` +
      `📈 Operations: ${totalOps}\n` +
      `✅ Success Rate: ${((totalOps - errorCount) / totalOps * 100).toFixed(1)}%\n` +
      `⏱️ Avg Duration: ${avgDuration.toFixed(0)}ms\n` +
      `📊 Rows Processed: ${totalRowsProcessed.toLocaleString()}\n` +
      `❌ Errors: ${errorCount}\n\n` +
      `View details: ${ss.getUrl()}`;

    // You can email this report or just log it
    console.log(report);
    SpreadsheetApp.getUi().alert('Weekly Report Generated - Check Apps Script logs for details');

  } catch (error) {
    console.error('Report generation failed:', error);
  }
}

/**
 * Validates dashboard setup
 */
function validateSetup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const requiredSheets = Object.values(MASTER_CONFIG.SHEETS);

  let isValid = true;
  let message = '🔍 VALIDATION RESULTS:\n\n';

  requiredSheets.forEach(sheetName => {
    const sheet = ss.getSheetByName(sheetName);
    const status = sheet ? '✅' : '❌';
    message += `${status} ${sheetName}\n`;
    if (!sheet) isValid = false;
  });

  // Check if Pipeline_Log has data
  const pipelineLog = ss.getSheetByName(MASTER_CONFIG.SHEETS.PIPELINE_LOG);
  if (pipelineLog && pipelineLog.getLastRow() > 1) {
    message += `✅ Pipeline_Log has data\n`;
  } else {
    message += `⚠️ Pipeline_Log is empty (run TELEMETRY_TEST in your projects)\n`;
  }

  message += `\n${isValid ? '🎉 Setup is valid!' : '⚠️ Setup incomplete - run setupDashboard()'}`;

  SpreadsheetApp.getUi().alert(message);
}

// ──────────────────────────────────────────────────────────
// Utility Functions
// ──────────────────────────────────────────────────────────

/**
 * Gets pipeline statistics for a specific date range
 */
function getPipelineStats(startDate, endDate) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(MASTER_CONFIG.SHEETS.PIPELINE_LOG);

  if (!sheet) return null;

  const data = sheet.getDataRange().getValues().slice(1);
  const filteredData = data.filter(row =>
    row[0] && new Date(row[0]) >= startDate && new Date(row[0]) <= endDate
  );

  return {
    totalOperations: filteredData.length,
    successCount: filteredData.filter(row => row[10] === 'OK').length,
    errorCount: filteredData.filter(row => row[10] === 'ERROR').length,
    avgDuration: filteredData.reduce((sum, row) => sum + (row[13] || 0), 0) / filteredData.length,
    totalRowsProcessed: filteredData.reduce((sum, row) => sum + (row[9] || 0), 0)
  };
}

/**
 * Updates Pipeline_Log headers to include new data flow columns
 * Run this if your Pipeline_Log has data but missing headers for columns O, P, Q, R
 */
function updatePipelineLogHeaders() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(MASTER_CONFIG.SHEETS.PIPELINE_LOG);

  if (!sheet) {
    SpreadsheetApp.getUi().alert('❌ Pipeline_Log sheet not found!');
    return;
  }

  try {
    // Get current headers
    const headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
    const currentHeaders = headerRange.getValues()[0];

    // Check if we already have all 18 columns
    if (currentHeaders.length >= 18 && currentHeaders[14] && currentHeaders[17]) {
      SpreadsheetApp.getUi().alert('✅ Headers are already up to date!');
      return;
    }

    // The complete header set (18 columns)
    const fullHeaders = [
      'TimestampISO', 'CorrelationId', 'ProjectId', 'SpreadsheetId', 'SpreadsheetName',
      'FunctionName', 'OpType', 'SourceRef', 'TargetRef', 'RowsAffected',
      'Status', 'ErrorType', 'ErrorMessage', 'DurationMs',
      'DataFlowType', 'InputRowCount', 'OutputRowCount', 'DataQuality'
    ];

    // Update the header row
    const headerRow = sheet.getRange(1, 1, 1, 18);
    headerRow.setValues([fullHeaders]);

    // Apply formatting to new columns
    headerRow.setBackground('#4285f4')
         .setFontColor('white')
         .setFontWeight('bold')
         .setHorizontalAlignment('center');

    // Add notes to new columns
    sheet.getRange(1, 15).setNote('Data flow stage: INPUT, TRANSFORM, or OUTPUT');
    sheet.getRange(1, 16).setNote('Number of rows read from source');
    sheet.getRange(1, 17).setNote('Number of rows written to target');
    sheet.getRange(1, 18).setNote('Data quality: CLEAN, DIRTY, VALIDATED, UNKNOWN, ERROR');

    SpreadsheetApp.getUi().alert('✅ Pipeline_Log headers updated successfully!\n\nNew columns added:\n• DataFlowType (O)\n• InputRowCount (P)\n• OutputRowCount (Q)\n• DataQuality (R)');

  } catch (error) {
    SpreadsheetApp.getUi().alert('❌ Failed to update headers: ' + error.toString());
  }
}
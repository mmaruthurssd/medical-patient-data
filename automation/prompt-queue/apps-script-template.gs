/**
 * Google Sheets Apps Script Template
 * Purpose: Send automated prompts to local Claude Code instance
 *
 * SETUP INSTRUCTIONS:
 * 1. Create a Google Drive folder for prompt queue
 * 2. Get folder ID and set PROMPT_QUEUE_FOLDER_ID below
 * 3. Set up Google Drive Desktop sync on your computer
 * 4. Point sync to: ~/Desktop/medical-patient-data/automation/prompt-queue/pending/
 * 5. Create time-based triggers for scheduled prompts
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  // Google Drive folder ID where prompts will be written
  // This folder should sync to your local: automation/prompt-queue/pending/
  PROMPT_QUEUE_FOLDER_ID: 'YOUR_FOLDER_ID_HERE',

  // Google Drive folder ID where responses are read from
  // This folder should sync from your local: automation/prompt-queue/responses/
  RESPONSE_QUEUE_FOLDER_ID: 'YOUR_RESPONSE_FOLDER_ID_HERE',

  // Workspace identifier
  WORKSPACE: 'medical-patient-data',

  // Default priority
  DEFAULT_PRIORITY: 'normal'
};

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Send a prompt to Claude Code (writes to prompt queue)
 *
 * @param {string} promptText - The prompt to send to Claude
 * @param {Object} options - Configuration options
 * @returns {string} Prompt ID
 */
function sendPromptToClaude(promptText, options = {}) {
  const prompt = {
    id: Utilities.getUuid(),
    created: new Date().toISOString(),
    priority: options.priority || CONFIG.DEFAULT_PRIORITY,
    type: options.type || 'general',
    prompt: promptText,
    context: options.context || {},
    status: 'pending',
    schedule: options.schedule || {}
  };

  // Optional: PHI detection safeguard
  if (containsPHI(promptText)) {
    Logger.log('WARNING: PHI detected in prompt. Blocking transmission.');
    throw new Error('PHI detected in prompt. Cannot send to external system.');
  }

  // Write to Google Drive folder (syncs locally)
  const folder = DriveApp.getFolderById(CONFIG.PROMPT_QUEUE_FOLDER_ID);
  const fileName = `prompt-${prompt.id}.json`;
  const fileContent = JSON.stringify(prompt, null, 2);

  folder.createFile(fileName, fileContent, MimeType.PLAIN_TEXT);

  Logger.log(`Prompt queued: ${fileName}`);
  return prompt.id;
}

/**
 * Check for responses from Claude Code
 *
 * @returns {Array} Array of response objects
 */
function checkClaudeResponses() {
  const responseFolder = DriveApp.getFolderById(CONFIG.RESPONSE_QUEUE_FOLDER_ID);
  const files = responseFolder.getFiles();
  const responses = [];

  while (files.hasNext()) {
    const file = files.next();

    // Only process JSON files
    if (file.getName().endsWith('.json')) {
      const content = file.getBlob().getDataAsString();
      const response = JSON.parse(content);
      responses.push(response);

      // Move to processed folder (or delete)
      file.setTrashed(true);
    }
  }

  return responses;
}

/**
 * Basic PHI detection (customize based on your needs)
 *
 * @param {string} text - Text to check for PHI
 * @returns {boolean} True if PHI detected
 */
function containsPHI(text) {
  // Basic patterns - customize based on your PHI types
  const phiPatterns = [
    /\b\d{3}-\d{2}-\d{4}\b/,  // SSN pattern
    /\bMRN[\s:]*\d+/i,         // MRN pattern
    /\bDOB[\s:]*\d{1,2}\/\d{1,2}\/\d{4}/i  // DOB pattern
  ];

  return phiPatterns.some(pattern => pattern.test(text));
}

// ============================================================================
// SCHEDULED AUTOMATION EXAMPLES
// ============================================================================

/**
 * Example: Daily Biopsy Summary (schedule at 9:00 AM daily)
 */
function dailyBiopsySummary() {
  const promptText = `
Generate a summary of yesterday's biopsy cases:
1. Total number of cases
2. Urgent/priority cases requiring immediate attention
3. Any unusual patterns or anomalies
4. Recommendations for follow-up

Create a markdown report at: reports/daily-biopsy-summary-${getYesterdayDate()}.md
  `.trim();

  sendPromptToClaude(promptText, {
    type: 'daily-summary',
    priority: 'normal',
    context: {
      dataSource: 'biopsy-log-sheet',
      dateRange: 'yesterday',
      outputFormat: 'markdown'
    },
    schedule: {
      type: 'daily',
      time: '09:00'
    }
  });
}

/**
 * Example: Weekly Patient Volume Analysis (schedule weekly on Monday at 8:00 AM)
 */
function weeklyPatientVolume() {
  const promptText = `
Analyze patient volume trends for the past week:
1. Total patients seen by day
2. Comparison to previous weeks
3. Staffing recommendations based on volume
4. Forecast for upcoming week

Generate report at: reports/weekly-volume-${getThisWeek()}.md
  `.trim();

  sendPromptToClaude(promptText, {
    type: 'weekly-analysis',
    priority: 'normal',
    context: {
      dateRange: 'last-7-days'
    }
  });
}

/**
 * Example: Billing Error Analysis (schedule daily at 10:00 AM)
 */
function dailyBillingErrorCheck() {
  const promptText = `
Review billing errors from the past 24 hours:
1. Categorize errors by type
2. Identify patterns or recurring issues
3. Suggest preventive measures
4. Flag any critical errors requiring immediate attention

Update the billing dashboard with summary metrics.
  `.trim();

  sendPromptToClaude(promptText, {
    type: 'analysis',
    priority: 'high',
    context: {
      dataSource: 'billing-errors-sheet',
      dateRange: 'last-24-hours'
    }
  });
}

/**
 * Example: Event-driven prompt (triggered on sheet edit)
 */
function onEdit(e) {
  // Example: Detect when a critical value is entered
  const sheet = e.source.getActiveSheet();
  const range = e.range;
  const value = e.value;

  // Example: If someone marks a case as "URGENT" in column E
  if (range.getColumn() === 5 && value === 'URGENT') {
    const row = range.getRow();
    const caseId = sheet.getRange(row, 1).getValue();

    const promptText = `
URGENT: Case #${caseId} has been marked as urgent.

Please review this case and:
1. Verify if it requires immediate attention
2. Suggest next steps
3. Identify any related cases
4. Update the priority dashboard

Respond within 5 minutes.
    `.trim();

    sendPromptToClaude(promptText, {
      type: 'alert',
      priority: 'urgent',
      context: {
        caseId: caseId,
        triggeredBy: 'onEdit',
        timestamp: new Date().toISOString()
      }
    });
  }
}

/**
 * Example: Process responses and update sheet
 */
function processClaudeResponses() {
  const responses = checkClaudeResponses();
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Automation Log');

  responses.forEach(response => {
    // Log to sheet
    sheet.appendRow([
      response.executed,
      response.promptId,
      response.status,
      response.result.summary || 'No summary',
      response.duration
    ]);

    // Optional: Send email notification
    if (response.status === 'completed') {
      Logger.log(`Response received for prompt ${response.promptId}`);
    }
  });
}

// ============================================================================
// SETUP HELPERS
// ============================================================================

/**
 * Create time-based triggers for scheduled prompts
 */
function createScheduledTriggers() {
  // Delete existing triggers to avoid duplicates
  deleteAllTriggers();

  // Daily biopsy summary at 9:00 AM
  ScriptApp.newTrigger('dailyBiopsySummary')
    .timeBased()
    .atHour(9)
    .everyDays(1)
    .create();

  // Weekly volume analysis on Monday at 8:00 AM
  ScriptApp.newTrigger('weeklyPatientVolume')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.MONDAY)
    .atHour(8)
    .create();

  // Daily billing check at 10:00 AM
  ScriptApp.newTrigger('dailyBillingErrorCheck')
    .timeBased()
    .atHour(10)
    .everyDays(1)
    .create();

  // Check for responses every 15 minutes
  ScriptApp.newTrigger('processClaudeResponses')
    .timeBased()
    .everyMinutes(15)
    .create();

  Logger.log('Triggers created successfully');
}

/**
 * Delete all project triggers
 */
function deleteAllTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => ScriptApp.deleteTrigger(trigger));
  Logger.log('All triggers deleted');
}

/**
 * List all active triggers
 */
function listTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    Logger.log(`Function: ${trigger.getHandlerFunction()}`);
    Logger.log(`Event Type: ${trigger.getEventType()}`);
  });
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getYesterdayDate() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return Utilities.formatDate(yesterday, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

function getThisWeek() {
  const now = new Date();
  return Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-ww');
}

// ============================================================================
// TESTING FUNCTIONS
// ============================================================================

/**
 * Test function - send a simple prompt
 */
function testSendPrompt() {
  const promptId = sendPromptToClaude(
    'Hello Claude! This is a test prompt from Google Sheets. Please respond with: "Test successful"',
    {
      type: 'test',
      priority: 'low'
    }
  );

  Logger.log(`Test prompt sent. ID: ${promptId}`);
  Logger.log('Check your local automation/prompt-queue/pending/ directory');
}

/**
 * Test function - check for responses
 */
function testCheckResponses() {
  const responses = checkClaudeResponses();
  Logger.log(`Found ${responses.length} responses`);
  responses.forEach(response => {
    Logger.log(JSON.stringify(response, null, 2));
  });
}

---
type: guide
tags: [automation, google-sheets, scheduled-prompts, control-panel]
---

# Claude Automation Control Sheet

**The control panel for managing all scheduled Claude Code prompts**

**Status**: 🟢 Production Ready

**Location**: `AI Development - No PHI` Shared Drive (must be created)

---

## Overview

This Google Sheet serves as the **control panel** for the Automated Claude Code Prompting System. Add rows to schedule new prompts, and Apps Script automatically triggers them at the specified times.

**Key Innovation**: Simple spreadsheet interface for managing complex automation workflows.

---

## Sheet Structure

### Sheet 1: Scheduled Prompts

**Columns**:

| Column | Name | Type | Description | Example |
|--------|------|------|-------------|---------|
| A | ID | Auto | Auto-generated UUID | `abc-123-def` |
| B | Status | Dropdown | `Active`, `Paused`, `Completed`, `Error` | `Active` |
| C | Name | Text | Human-readable prompt name | `Daily Biopsy Summary` |
| D | Prompt Text | Text | The actual prompt to send to Claude | `Generate summary of yesterday's biopsy cases` |
| E | Schedule Type | Dropdown | `Daily`, `Weekly`, `Monthly`, `One-Time`, `Manual` | `Daily` |
| F | Time | Time | When to run (24-hour format) | `09:00` |
| G | Days of Week | Text | For weekly (comma-separated) | `Mon,Wed,Fri` |
| H | Day of Month | Number | For monthly (1-31) | `1` |
| I | Priority | Dropdown | `Urgent`, `High`, `Normal`, `Low` | `Normal` |
| J | Data Source | Text | Optional: which sheet/data to reference | `Biopsy Log` |
| K | Last Run | Timestamp | Auto-updated by script | `2025-11-13 09:00:00` |
| L | Next Run | Timestamp | Auto-calculated | `2025-11-14 09:00:00` |
| M | Run Count | Number | How many times executed | `42` |
| N | Last Status | Text | Success/Error from last run | `Success` |
| O | Notes | Text | Optional notes | `Sends to billing team` |

### Sheet 2: Execution Log

**Auto-populated by Apps Script**

| Column | Name | Description |
|--------|------|-------------|
| A | Timestamp | When prompt was triggered |
| B | Prompt ID | Links to Scheduled Prompts sheet |
| C | Prompt Name | For quick reference |
| D | Status | Pending/Completed/Error |
| E | Response ID | UUID of response file |
| F | Duration | How long Claude took (from response) |
| G | Error Message | If failed |

### Sheet 3: Response Viewer

**Shows recent Claude responses**

| Column | Name | Description |
|--------|------|-------------|
| A | Response ID | UUID |
| B | Prompt Name | What triggered it |
| C | Executed At | When Claude processed |
| D | Response Text | Claude's full response |
| E | Summary | One-line summary |
| F | Actions Taken | What the sheet did with response |

---

## Apps Script Code

### File: `Code.gs`

**Complete Apps Script implementation** (paste this into Apps Script editor):

```javascript
// ============================================================================
// CLAUDE AUTOMATION CONTROL SHEET - Apps Script
// ============================================================================

// Configuration
const CONFIG = {
  // Get these from Google Drive folder URLs after creating folders
  PROMPT_QUEUE_FOLDER_ID: 'YOUR_PROMPTS_FOLDER_ID',      // claude-automation/prompts/
  RESPONSE_QUEUE_FOLDER_ID: 'YOUR_RESPONSES_FOLDER_ID',  // claude-automation/responses/

  // Sheet names
  SCHEDULED_PROMPTS_SHEET: 'Scheduled Prompts',
  EXECUTION_LOG_SHEET: 'Execution Log',
  RESPONSE_VIEWER_SHEET: 'Response Viewer',

  // Settings
  CHECK_INTERVAL_MINUTES: 5,  // How often to check for prompts to run
  RESPONSE_CHECK_MINUTES: 2,  // How often to check for responses
  MAX_LOG_ROWS: 1000,         // Archive older logs
};

// ============================================================================
// SETUP FUNCTIONS (Run once)
// ============================================================================

/**
 * Create time-based triggers for automatic execution
 * RUN THIS ONCE after pasting the script
 */
function setupTriggers() {
  // Remove existing triggers to avoid duplicates
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => ScriptApp.deleteTrigger(trigger));

  // Check for prompts to execute every 5 minutes
  ScriptApp.newTrigger('checkScheduledPrompts')
    .timeBased()
    .everyMinutes(CONFIG.CHECK_INTERVAL_MINUTES)
    .create();

  // Check for responses every 2 minutes
  ScriptApp.newTrigger('checkForResponses')
    .timeBased()
    .everyMinutes(CONFIG.RESPONSE_CHECK_MINUTES)
    .create();

  Logger.log('✅ Triggers created successfully');
  Logger.log('- Checking for scheduled prompts every ' + CONFIG.CHECK_INTERVAL_MINUTES + ' minutes');
  Logger.log('- Checking for responses every ' + CONFIG.RESPONSE_CHECK_MINUTES + ' minutes');
}

/**
 * Initialize sheet structure
 * RUN THIS ONCE to set up the sheets
 */
function initializeSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Create Scheduled Prompts sheet
  let scheduledSheet = ss.getSheetByName(CONFIG.SCHEDULED_PROMPTS_SHEET);
  if (!scheduledSheet) {
    scheduledSheet = ss.insertSheet(CONFIG.SCHEDULED_PROMPTS_SHEET);
    scheduledSheet.getRange('A1:O1').setValues([[
      'ID', 'Status', 'Name', 'Prompt Text', 'Schedule Type',
      'Time', 'Days of Week', 'Day of Month', 'Priority',
      'Data Source', 'Last Run', 'Next Run', 'Run Count',
      'Last Status', 'Notes'
    ]]);
    scheduledSheet.getRange('A1:O1').setFontWeight('bold');
    scheduledSheet.setFrozenRows(1);

    // Set up data validation
    const statusRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['Active', 'Paused', 'Completed', 'Error'])
      .build();
    scheduledSheet.getRange('B2:B1000').setDataValidation(statusRule);

    const scheduleRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['Daily', 'Weekly', 'Monthly', 'One-Time', 'Manual'])
      .build();
    scheduledSheet.getRange('E2:E1000').setDataValidation(scheduleRule);

    const priorityRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['Urgent', 'High', 'Normal', 'Low'])
      .build();
    scheduledSheet.getRange('I2:I1000').setDataValidation(priorityRule);
  }

  // Create Execution Log sheet
  let logSheet = ss.getSheetByName(CONFIG.EXECUTION_LOG_SHEET);
  if (!logSheet) {
    logSheet = ss.insertSheet(CONFIG.EXECUTION_LOG_SHEET);
    logSheet.getRange('A1:G1').setValues([[
      'Timestamp', 'Prompt ID', 'Prompt Name', 'Status',
      'Response ID', 'Duration', 'Error Message'
    ]]);
    logSheet.getRange('A1:G1').setFontWeight('bold');
    logSheet.setFrozenRows(1);
  }

  // Create Response Viewer sheet
  let responseSheet = ss.getSheetByName(CONFIG.RESPONSE_VIEWER_SHEET);
  if (!responseSheet) {
    responseSheet = ss.insertSheet(CONFIG.RESPONSE_VIEWER_SHEET);
    responseSheet.getRange('A1:F1').setValues([[
      'Response ID', 'Prompt Name', 'Executed At',
      'Response Text', 'Summary', 'Actions Taken'
    ]]);
    responseSheet.getRange('A1:F1').setFontWeight('bold');
    responseSheet.setFrozenRows(1);
  }

  Logger.log('✅ Sheets initialized successfully');
}

// ============================================================================
// SCHEDULED PROMPT EXECUTION
// ============================================================================

/**
 * Check for scheduled prompts that need to run
 * Triggered every 5 minutes by time-based trigger
 */
function checkScheduledPrompts() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SCHEDULED_PROMPTS_SHEET);
  const data = sheet.getDataRange().getValues();

  const now = new Date();

  // Skip header row
  for (let i = 1; i < data.length; i++) {
    const row = data[i];

    // Column indices (0-based)
    const id = row[0];
    const status = row[1];
    const name = row[2];
    const promptText = row[3];
    const scheduleType = row[4];
    const time = row[5];
    const daysOfWeek = row[6];
    const dayOfMonth = row[7];
    const priority = row[8];
    const dataSource = row[9];
    const lastRun = row[10];

    // Skip if not active or no prompt text
    if (status !== 'Active' || !promptText) continue;

    // Check if this prompt should run now
    if (shouldRunPrompt(scheduleType, time, daysOfWeek, dayOfMonth, lastRun, now)) {
      executePrompt(id, name, promptText, priority, dataSource, i + 1);
    }
  }
}

/**
 * Determine if a prompt should run now
 */
function shouldRunPrompt(scheduleType, scheduledTime, daysOfWeek, dayOfMonth, lastRun, now) {
  // Manual prompts don't auto-run
  if (scheduleType === 'Manual') return false;

  // Check if already ran in last 4 minutes (avoid duplicates)
  if (lastRun && (now - new Date(lastRun)) < 4 * 60 * 1000) {
    return false;
  }

  // Parse scheduled time
  const scheduledHour = scheduledTime ? new Date(scheduledTime).getHours() : 9;
  const scheduledMinute = scheduledTime ? new Date(scheduledTime).getMinutes() : 0;

  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // Check if we're within 5 minutes of scheduled time
  const timeDiff = Math.abs((currentHour * 60 + currentMinute) - (scheduledHour * 60 + scheduledMinute));
  if (timeDiff > 5) return false;

  // Check schedule type
  switch (scheduleType) {
    case 'Daily':
      return true;

    case 'Weekly':
      if (!daysOfWeek) return false;
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const todayName = dayNames[now.getDay()];
      return daysOfWeek.includes(todayName);

    case 'Monthly':
      return now.getDate() === dayOfMonth;

    case 'One-Time':
      return !lastRun;  // Only run if never run before

    default:
      return false;
  }
}

/**
 * Execute a scheduled prompt by writing to Google Drive
 */
function executePrompt(id, name, promptText, priority, dataSource, rowIndex) {
  try {
    // Generate unique prompt ID if not exists
    if (!id) {
      id = Utilities.getUuid();
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = ss.getSheetByName(CONFIG.SCHEDULED_PROMPTS_SHEET);
      sheet.getRange(rowIndex, 1).setValue(id);
    }

    // Create prompt JSON
    const prompt = {
      id: id,
      created: new Date().toISOString(),
      priority: priority || 'normal',
      type: 'scheduled',
      prompt: promptText,
      context: {
        name: name,
        dataSource: dataSource,
        triggeredBy: 'scheduled-prompts-sheet'
      },
      status: 'pending'
    };

    // Write to Google Drive prompts folder
    const folder = DriveApp.getFolderById(CONFIG.PROMPT_QUEUE_FOLDER_ID);
    const fileName = `prompt-${id}.json`;
    folder.createFile(fileName, JSON.stringify(prompt, null, 2), MimeType.PLAIN_TEXT);

    // Update sheet
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.SCHEDULED_PROMPTS_SHEET);
    const now = new Date();

    sheet.getRange(rowIndex, 11).setValue(now); // Last Run
    sheet.getRange(rowIndex, 13).setValue((sheet.getRange(rowIndex, 13).getValue() || 0) + 1); // Run Count
    sheet.getRange(rowIndex, 14).setValue('Pending'); // Last Status

    // Log execution
    logExecution(id, name, 'Pending', null, null);

    Logger.log(`✅ Prompt executed: ${name} (${id})`);

  } catch (error) {
    Logger.log(`❌ Error executing prompt: ${error}`);
    logExecution(id, name, 'Error', null, error.toString());
  }
}

// ============================================================================
// RESPONSE CHECKING
// ============================================================================

/**
 * Check for responses from Claude
 * Triggered every 2 minutes by time-based trigger
 */
function checkForResponses() {
  const folder = DriveApp.getFolderById(CONFIG.RESPONSE_QUEUE_FOLDER_ID);
  const files = folder.getFiles();

  while (files.hasNext()) {
    const file = files.next();
    if (file.getName().endsWith('.json')) {
      processResponse(file);
    }
  }
}

/**
 * Process a response file from Claude
 */
function processResponse(file) {
  try {
    const content = file.getBlob().getDataAsString();
    const response = JSON.parse(content);

    // Update execution log
    updateExecutionLog(response.promptId, 'Completed', response.duration, null);

    // Add to response viewer
    addToResponseViewer(response);

    // Update scheduled prompts status
    updateScheduledPromptStatus(response.promptId, 'Success');

    // Move to trash (already synced locally in completed folder)
    file.setTrashed(true);

    Logger.log(`✅ Response processed: ${response.promptId}`);

  } catch (error) {
    Logger.log(`❌ Error processing response: ${error}`);
  }
}

// ============================================================================
// LOGGING FUNCTIONS
// ============================================================================

function logExecution(promptId, name, status, responseId, error) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.EXECUTION_LOG_SHEET);

  sheet.appendRow([
    new Date(),
    promptId,
    name,
    status,
    responseId || '',
    '',
    error || ''
  ]);
}

function updateExecutionLog(promptId, status, duration, error) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.EXECUTION_LOG_SHEET);
  const data = sheet.getDataRange().getValues();

  // Find row with this promptId
  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][1] === promptId) {
      sheet.getRange(i + 1, 4).setValue(status);
      if (duration) sheet.getRange(i + 1, 6).setValue(duration);
      if (error) sheet.getRange(i + 1, 7).setValue(error);
      break;
    }
  }
}

function addToResponseViewer(response) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.RESPONSE_VIEWER_SHEET);

  const responseText = response.result?.response || response.error?.details || 'No response';
  const summary = response.result?.summary || response.error?.message || 'Error';

  sheet.appendRow([
    response.promptId,
    response.context?.name || 'Unknown',
    response.executed,
    responseText,
    summary,
    'Logged'  // Update this based on actions you take
  ]);
}

function updateScheduledPromptStatus(promptId, status) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SCHEDULED_PROMPTS_SHEET);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === promptId) {
      sheet.getRange(i + 1, 14).setValue(status);  // Last Status column
      break;
    }
  }
}

// ============================================================================
// MANUAL EXECUTION
// ============================================================================

/**
 * Manually trigger a prompt (for testing or manual runs)
 * Select a row and run this function
 */
function runSelectedPrompt() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SCHEDULED_PROMPTS_SHEET);
  const row = sheet.getActiveRange().getRow();

  if (row < 2) {
    SpreadsheetApp.getUi().alert('Please select a prompt row (not the header)');
    return;
  }

  const data = sheet.getRange(row, 1, 1, 10).getValues()[0];
  const [id, status, name, promptText, , , , , priority, dataSource] = data;

  if (!promptText) {
    SpreadsheetApp.getUi().alert('No prompt text found');
    return;
  }

  executePrompt(id, name, promptText, priority, dataSource, row);
  SpreadsheetApp.getUi().alert(`Prompt "${name}" triggered successfully!`);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create custom menu
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Claude Automation')
    .addItem('Run Selected Prompt', 'runSelectedPrompt')
    .addItem('Check for Responses Now', 'checkForResponses')
    .addSeparator()
    .addItem('Setup Triggers', 'setupTriggers')
    .addItem('Initialize Sheets', 'initializeSheets')
    .addToUi();
}

/**
 * PHI detection safeguard
 */
function containsPHI(text) {
  const phiPatterns = [
    /\b\d{3}-\d{2}-\d{4}\b/,  // SSN
    /\bMRN[\s:]*\d+/i,         // MRN
    /\bDOB[\s:]*\d{1,2}\/\d{1,2}\/\d{4}/i  // DOB
  ];
  return phiPatterns.some(pattern => pattern.test(text));
}
```

---

## Setup Instructions

### 1. Create the Google Sheet

1. Open Google Drive
2. Navigate to: `AI Development - No PHI` Shared Drive
3. Create new Google Sheet
4. Name it: **"Claude Automation Control"**

### 2. Create Drive Folders

1. In same Shared Drive, navigate to: `workspace-management/03-automation/`
2. Create folder: `claude-automation/`
3. Inside `claude-automation/`, create two folders:
   - `prompts/`
   - `responses/`
4. Copy the folder IDs from URLs (see GOOGLE-DRIVE-INTEGRATION.md)

### 3. Configure Apps Script

1. In the sheet, go to: **Extensions > Apps Script**
2. Delete default `Code.gs` content
3. Paste the complete script above
4. Update `CONFIG` section with your folder IDs:
   ```javascript
   PROMPT_QUEUE_FOLDER_ID: 'YOUR_FOLDER_ID_HERE',
   RESPONSE_QUEUE_FOLDER_ID: 'YOUR_FOLDER_ID_HERE',
   ```
5. Save (Ctrl+S / Cmd+S)

### 4. Initialize the System

1. In Apps Script editor, select function: `initializeSheets`
2. Click **Run** (▶️)
3. Authorize the script (first time only)
4. Check that 3 sheets were created

5. Select function: `setupTriggers`
6. Click **Run** (▶️)
7. Check that triggers were created

### 5. Configure Google Drive Desktop Sync

**Map Drive folders to local automation queue:**

1. Open Google Drive Desktop preferences
2. Add sync for: `AI Development - No PHI/workspace-management/03-automation/claude-automation/prompts/`
   - Local: `~/Desktop/medical-patient-data/automation/prompt-queue/pending/`
3. Add sync for: `AI Development - No PHI/workspace-management/03-automation/claude-automation/responses/`
   - Local: `~/Desktop/medical-patient-data/automation/prompt-queue/responses/`

### 6. Start Automation Server

```bash
cd ~/Desktop/medical-patient-data/automation
./claude-automation-server.sh start
```

---

## Usage

### Adding a Scheduled Prompt

1. Open the **Scheduled Prompts** sheet
2. Add a new row with:
   - **Status**: `Active`
   - **Name**: `Daily Biopsy Summary`
   - **Prompt Text**: `Generate summary of yesterday's biopsy cases with urgent flags`
   - **Schedule Type**: `Daily`
   - **Time**: `09:00`
   - **Priority**: `Normal`
3. Save

The prompt will automatically trigger at 9:00 AM every day!

### Manual Execution (Testing)

1. Click on a row in **Scheduled Prompts**
2. Go to: **Claude Automation > Run Selected Prompt**
3. Prompt executes immediately

### Viewing Responses

- **Execution Log** sheet: See when prompts ran
- **Response Viewer** sheet: See Claude's responses

---

## Example Prompts

### Daily Biopsy Summary
- **Schedule**: Daily at 9:00 AM
- **Prompt**: `Generate summary of yesterday's biopsy cases. Include total count, urgent cases, and follow-up recommendations.`

### Weekly Billing Report
- **Schedule**: Weekly (Mon) at 8:00 AM
- **Prompt**: `Analyze last week's billing data. Identify outstanding invoices and generate collection priority list.`

### Monthly Performance Metrics
- **Schedule**: Monthly (1st) at 7:00 AM
- **Prompt**: `Generate monthly performance report: case volume, turnaround time trends, quality metrics.`

### Ad-Hoc Analysis (Manual)
- **Schedule**: Manual
- **Prompt**: `Analyze current quarter's data and identify optimization opportunities.`

---

## PHI Compliance

⚠️ **CRITICAL REQUIREMENTS**:

1. **Sheet Location**: MUST be in "AI Development - No PHI" Shared Drive
2. **No PHI in Prompts**: Prompt text must NEVER contain:
   - Patient names
   - MRNs (Medical Record Numbers)
   - SSNs
   - Dates of birth
   - Any identifiable patient information
3. **Data Source Reference**: Use generic references like "yesterday's cases" not specific patient IDs
4. **Response Processing**: If Claude's response references PHI, handle appropriately in medical-patient-data workspace

**Apps Script includes PHI detection** - prompts with PHI patterns will be blocked.

---

## Monitoring

### Check Execution Log
- See all prompt executions (pending, completed, errors)
- Monitor success rate
- Identify failing prompts

### Check Response Viewer
- View Claude's responses
- Verify prompt results
- Use responses to update other sheets

### Automation Server Status
```bash
./claude-automation-server.sh status
```

Shows:
- Server running status
- Pending prompts
- Completed prompts
- Recent activity

---

## Troubleshooting

### Prompts Not Executing

**Check:**
1. Status is `Active` in sheet
2. Time-based triggers exist (Extensions > Apps Script > Triggers)
3. Prompt files appearing in Drive folder
4. Automation server is running

**Debug:**
```bash
# Check server logs
tail -f ~/Desktop/medical-patient-data/automation/prompt-queue/automation-server.log

# Check Drive sync
ls -la ~/Desktop/medical-patient-data/automation/prompt-queue/pending/
```

### Responses Not Showing

**Check:**
1. Response files in Drive `responses/` folder
2. Response checking trigger is active
3. Apps Script execution log (View > Executions)

---

## Advanced Usage

### Context-Aware Prompts

Use the **Data Source** column to reference other sheets:

```javascript
// In prompt text, reference data source
"Analyze data from {dataSource} and generate summary"

// Apps Script can read data source and inject into prompt
const dataSourceSheet = ss.getSheetByName(dataSource);
const data = dataSourceSheet.getDataRange().getValues();
// Add to prompt context
```

### Response Processing

Extend Apps Script to take actions based on responses:

```javascript
function addToResponseViewer(response) {
  // Parse response
  const result = JSON.parse(response.result.response);

  // Take actions
  if (result.urgentCases && result.urgentCases.length > 0) {
    sendEmailAlert(result.urgentCases);
  }

  if (result.recommendations) {
    createFollowUpTasks(result.recommendations);
  }

  // Update other sheets
  updateDashboard(result);
}
```

---

## Related Documentation

- **Automation Server**: `/automation/AUTOMATED-CLAUDE-SETUP.md`
- **Apps Script Template**: `/automation/prompt-queue/apps-script-template.gs`
- **Google Drive Integration**: `workspace-management/GOOGLE-DRIVE-INTEGRATION.md`
- **Technical Architecture**: `WORKSPACE_ARCHITECTURE.md` > Automated Claude Code Prompting System

---

**Created**: 2025-11-13
**Status**: Production Ready
**Location**: Must create in "AI Development - No PHI" Shared Drive

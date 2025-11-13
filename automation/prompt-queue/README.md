---
type: guide
tags: [automation, google-sheets, claude-code, prompt-queue]
---

# Automated Google Sheets → Claude Code Prompt Queue

**Purpose:** Enable Google Sheets to send automated prompts to local Claude Code instance

---

## 🎯 Quick Start: How to Schedule Prompts

**Use the Google Sheet control panel:**

1. Open: **"Claude Automation Control"** Google Sheet (in "AI Development - No PHI" Shared Drive)
2. Add a new row:
   - Name: "Daily Biopsy Summary"
   - Schedule: "Daily"
   - Time: "09:00"
   - Prompt: "Generate summary of yesterday's biopsy cases"
3. Save - it will run automatically!

**Complete setup guide**: See `/automation/CLAUDE-AUTOMATION-CONTROL-SHEET.md`

**Already running?** Check server status: `./claude-automation-server.sh status`

---

## How It Works

1. **Google Sheets** (Apps Script) writes structured prompt files to this directory
2. **Google Drive sync** or **Git sync** ensures prompts appear locally
3. **Claude Code** (when you manually open it) checks queue and executes prompts
4. **Responses** written back to queue for Apps Script to retrieve

## Directory Structure

```
automation/prompt-queue/
├── pending/          # New prompts from Google Sheets (ready to execute)
├── processing/       # Prompts currently being executed by Claude
├── completed/        # Executed prompts (results available)
├── responses/        # Response files for Apps Script to read
├── archive/          # Old prompts (auto-archived after 30 days)
└── README.md         # This file
```

## Workflow

### From Google Sheets → Claude Code

**Step 1: Apps Script creates prompt file**
```javascript
// In Google Sheets Apps Script
function scheduleClaudeTask(promptText, context) {
  const prompt = {
    id: Utilities.getUuid(),
    created: new Date().toISOString(),
    priority: 'normal',
    prompt: promptText,
    context: context || {},
    status: 'pending'
  };

  // Write to Google Drive folder that syncs locally
  // OR commit to GitHub (for git-based sync)
  DriveApp.getFolderById(PROMPT_QUEUE_FOLDER_ID)
    .createFile(`prompt-${prompt.id}.json`, JSON.stringify(prompt, null, 2));
}
```

**Step 2: File syncs to local directory**
- Via Google Drive sync, OR
- Via git pull (if using GitHub)

**Step 3: User manually opens Claude Code**
```
User: "Check automation queue"

Claude: "I found 3 new automation prompts:
1. Daily biopsy summary (scheduled 9:00 AM)
2. Billing error analysis (scheduled 10:00 AM)
3. Patient volume forecast (scheduled 11:00 AM)

Would you like me to execute them?"
```

**Step 4: Claude Code executes prompts**
- Moves prompt to `processing/`
- Executes the task
- Writes response to `responses/`
- Moves prompt to `completed/`

**Step 5: Apps Script retrieves responses**
```javascript
function checkClaudeResponses() {
  // Read response files from Google Drive sync
  // OR pull from GitHub
  // Update Google Sheets with results
}
```

## Prompt File Format

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "created": "2025-11-13T14:30:00.000Z",
  "priority": "normal",
  "type": "analysis",
  "prompt": "Generate summary of yesterday's biopsy cases with priority flags",
  "context": {
    "workspace": "medical-patient-data",
    "dataSource": "sheet-id-here",
    "dateRange": "yesterday",
    "outputFormat": "markdown"
  },
  "status": "pending",
  "schedule": {
    "type": "daily",
    "time": "09:00"
  }
}
```

## Response File Format

```json
{
  "promptId": "550e8400-e29b-41d4-a716-446655440000",
  "executed": "2025-11-13T14:35:22.000Z",
  "status": "completed",
  "result": {
    "summary": "Yesterday's biopsy summary...",
    "urgentCases": 2,
    "totalCases": 15,
    "outputLocation": "reports/daily-biopsy-2025-11-12.md"
  },
  "duration": "45 seconds",
  "tokensUsed": 1234
}
```

## Integration with Existing Systems

### Google Sheets Apps Script
- **Location:** Google Sheets with automation triggers
- **Writes to:** Google Drive folder (auto-syncs locally)
- **Reads from:** `responses/` directory

### Claude Code
- **Checks:** `pending/` directory on request
- **Processes:** Moves to `processing/` during execution
- **Completes:** Moves to `completed/`, writes to `responses/`

### Sync Options

**Option A: Google Drive Sync**
- Use Google Drive Desktop app
- Sync `automation/prompt-queue/` folder
- Apps Script writes/reads from Drive
- Automatic bidirectional sync

**Option B: Git-Based Sync**
- Apps Script commits prompts via GitHub API
- Local daemon pulls every 5 minutes (like team activity)
- Claude responses committed back
- Full audit trail

## Usage Examples

### Example 1: Daily Biopsy Summary

**Google Sheets (scheduled trigger at 9 AM):**
```javascript
function dailyBiopsySummary() {
  scheduleClaudeTask(
    'Generate summary of yesterday\'s biopsy cases. Identify urgent cases and create markdown report.',
    {
      type: 'daily-summary',
      dataSource: 'biopsy-log-sheet-id',
      outputLocation: 'reports/daily-biopsy-summary.md'
    }
  );
}
```

**Claude Code response:**
Creates `reports/daily-biopsy-summary.md` with content, writes response JSON.

### Example 2: Weekly Report Generation

**Google Sheets (weekly trigger):**
```javascript
function weeklyPatientVolume() {
  scheduleClaudeTask(
    'Analyze patient volume trends for the past week. Create forecast and staffing recommendations.',
    {
      type: 'weekly-analysis',
      dateRange: 'last-7-days'
    }
  );
}
```

### Example 3: Event-Driven Alerts

**Google Sheets (onEdit trigger):**
```javascript
function onEdit(e) {
  if (criticalValueDetected(e)) {
    scheduleClaudeTask(
      'URGENT: Review critical value entry and suggest next steps',
      {
        type: 'alert',
        priority: 'high',
        data: e.value
      }
    );
  }
}
```

## Security & Compliance

### PHI Handling
- ✅ **Apps Script:** Use PHI detection before writing prompts
- ✅ **Claude Code:** Executes locally (HIPAA compliant)
- ✅ **Responses:** Stay local unless explicitly synced

### Access Control
- Prompt queue directory: Local only (not synced to cloud by default)
- Google Drive sync: Use separate non-PHI folder
- Git sync: Only commit de-identified summaries

## Maintenance

### Auto-Archival
Prompts older than 30 days automatically moved to `archive/`:
```bash
find pending/ -type f -mtime +30 -exec mv {} archive/ \;
find completed/ -type f -mtime +30 -exec mv {} archive/ \;
```

### Queue Monitoring
Check queue status:
```bash
echo "Pending: $(ls -1 pending/ | wc -l)"
echo "Processing: $(ls -1 processing/ | wc -l)"
echo "Completed: $(ls -1 completed/ | wc -l)"
```

## Next Steps

1. Set up Google Drive sync or Git sync mechanism
2. Create Apps Script functions in Google Sheets
3. Create Claude Code workflow for checking queue
4. Test with simple non-PHI prompts
5. Implement response reading in Apps Script
6. Add automated triggers for scheduled prompts

---

**Created:** 2025-11-13
**Status:** Active
**Integration:** Google Sheets ↔ Claude Code

---
type: guide
tags: [setup, automation, google-sheets, claude-code]
---

# Complete Setup Guide: Google Sheets → Claude Code Automation

**Goal:** Enable Google Sheets to automatically send prompts to your local Claude Code instance

**Time Required:** 30-45 minutes

---

## Overview

This system allows Google Sheets Apps Script to write prompts that Claude Code processes locally. You manually open Claude Code, but the prompts come from automated Google Sheets triggers.

**Architecture:**
```
Google Sheets (automated triggers)
    ↓
Apps Script writes prompt.json
    ↓
Google Drive or Git sync
    ↓
Local directory: automation/prompt-queue/pending/
    ↓
You manually open Claude Code
    ↓
Claude: "Check automation queue" (you run this command)
    ↓
Claude processes prompts
    ↓
Writes responses to automation/prompt-queue/responses/
    ↓
Apps Script reads responses and updates sheets
```

---

## Prerequisites

✅ Google Workspace account with Apps Script access
✅ Local Claude Code installation (VS Code)
✅ This workspace cloned locally
✅ **Either:**
   - Google Drive Desktop app (for file sync), OR
   - Git access (for git-based sync)

---

## Setup Steps

### Step 1: Create Google Drive Folders (Option A - Recommended)

**If using Google Drive sync:**

1. **Go to Google Drive** (drive.google.com)

2. **Create folder structure:**
   ```
   Claude Automation/
   ├── prompts/        (Apps Script writes here)
   └── responses/      (Apps Script reads here)
   ```

3. **Get Folder IDs:**
   - Open `prompts/` folder in browser
   - Copy ID from URL: `https://drive.google.com/drive/folders/[FOLDER_ID_HERE]`
   - Do same for `responses/` folder
   - **Save these IDs** - you'll need them in Step 3

4. **Set up Google Drive Desktop sync:**
   - Install Google Drive Desktop app (if not installed)
   - Configure sync for "Claude Automation" folder
   - **Sync to this location:**
     ```
     ~/Desktop/medical-patient-data/automation/prompt-queue/
     ```
   - Map folders:
     - `prompts/` → `pending/`
     - `responses/` → `responses/`

### Step 1 Alternative: Git-Based Sync (Option B)

**If using Git instead of Google Drive:**

1. **Configure Apps Script to use GitHub API** (see apps-script-template.gs)
2. **Apps Script commits prompts** to `operations-workspace/automation/prompt-queue/`
3. **Local daemon pulls** every 5 minutes (similar to team activity sync)
4. **Claude responses committed back** to GitHub
5. **Apps Script pulls responses** via GitHub API

---

### Step 2: Verify Local Directory Structure

Check that the directory structure exists:

```bash
ls -la ~/Desktop/medical-patient-data/automation/prompt-queue/
```

Should show:
```
pending/          # New prompts from Google Sheets
processing/       # Currently being executed
completed/        # Finished prompts
responses/        # Response files for Sheets to read
archive/          # Old prompts (auto-archived)
README.md
apps-script-template.gs
CLAUDE-CODE-WORKFLOW.md
SETUP-GUIDE.md (this file)
```

**If missing, run:**
```bash
mkdir -p ~/Desktop/medical-patient-data/automation/prompt-queue/{pending,processing,completed,responses,archive}
```

---

### Step 3: Set Up Apps Script in Google Sheets

1. **Open your Google Sheet** (or create new one)

2. **Open Apps Script Editor:**
   - Extensions → Apps Script

3. **Copy template code:**
   - Open `automation/prompt-queue/apps-script-template.gs`
   - Copy entire contents
   - Paste into Apps Script editor

4. **Configure folder IDs:**
   ```javascript
   const CONFIG = {
     PROMPT_QUEUE_FOLDER_ID: 'YOUR_PROMPTS_FOLDER_ID_HERE',  // From Step 1
     RESPONSE_QUEUE_FOLDER_ID: 'YOUR_RESPONSES_FOLDER_ID_HERE',
     WORKSPACE: 'medical-patient-data',
     DEFAULT_PRIORITY: 'normal'
   };
   ```

5. **Save the script:**
   - File → Save
   - Name it: "Claude Automation"

6. **Grant permissions:**
   - Run any function (e.g., `testSendPrompt`)
   - Click "Review Permissions"
   - Allow access to Google Drive

---

### Step 4: Test the Connection

**Test 1: Send a prompt from Google Sheets**

1. In Apps Script editor, select `testSendPrompt` function
2. Click "Run"
3. Check execution log - should see: "Test prompt sent. ID: [uuid]"

**Test 2: Verify prompt appeared locally**

```bash
ls -la ~/Desktop/medical-patient-data/automation/prompt-queue/pending/
```

Should see a new file: `prompt-[uuid].json`

**Test 3: Check file contents**

```bash
cat automation/prompt-queue/pending/prompt-*.json
```

Should see JSON with your test prompt.

✅ **If you see the file, Google Sheets → Local sync is working!**

---

### Step 5: Test Claude Code Processing

1. **Open Claude Code** in VS Code

2. **Say this command:**
   ```
   Check the automation/prompt-queue/pending/ directory.
   Show me any prompt files found.
   ```

3. **Claude should respond:**
   ```
   Found 1 prompt file:

   File: prompt-[uuid].json
   Priority: low
   Type: test
   Prompt: "Hello Claude! This is a test prompt..."

   Would you like me to execute it?
   ```

4. **Say:** "Yes, execute it"

5. **Claude should:**
   - Move file to `processing/`
   - Execute the prompt
   - Write response to `responses/`
   - Move original to `completed/`

**Test 4: Verify response file created**

```bash
ls -la automation/prompt-queue/responses/
```

Should see: `response-[uuid].json`

✅ **If you see the response file, Claude Code → Google Sheets sync is working!**

---

### Step 6: Test Response Retrieval in Google Sheets

1. **In Apps Script, run:** `testCheckResponses`

2. **Check execution log** - should show:
   ```
   Found 1 responses
   {
     "promptId": "[uuid]",
     "status": "completed",
     "result": { ... }
   }
   ```

✅ **If you see the response in the log, the complete loop is working!**

---

### Step 7: Set Up Automated Triggers

Now that testing works, create scheduled triggers:

1. **In Apps Script editor, run:** `createScheduledTriggers`

2. **This creates:**
   - Daily biopsy summary (9:00 AM)
   - Weekly patient volume (Monday 8:00 AM)
   - Daily billing check (10:00 AM)
   - Response checker (every 15 minutes)

3. **Verify triggers created:**
   - In Apps Script: Triggers icon (clock) in left sidebar
   - Should see 4 triggers listed

4. **Customize triggers:**
   - Edit `createScheduledTriggers()` function
   - Add/remove/modify triggers based on your needs
   - Run function again to update

---

## Usage Workflow

### Daily Routine

**Morning (when you start work):**

1. Open Claude Code in VS Code
2. Say: "Check automation queue"
3. Claude shows pending prompts (from overnight or morning triggers)
4. Say: "Execute all pending prompts"
5. Claude processes them and writes responses

**Throughout the day:**

- Apps Script triggers fire automatically (at scheduled times)
- Prompts queue up in `pending/`
- When you check Claude Code, you'll see new prompts
- Process them when convenient

**End of day:**

1. Say: "Check automation queue one more time"
2. Process any remaining prompts
3. Say: "Archive completed prompts older than 7 days"

---

## Customizing Prompts

### Add Your Own Scheduled Prompt

**In Apps Script, create a new function:**

```javascript
function myCustomPrompt() {
  const promptText = `
Your prompt here.
Be specific about what you want Claude to do.
  `.trim();

  sendPromptToClaude(promptText, {
    type: 'custom',
    priority: 'normal',
    context: {
      // Add any context data here
      dataSource: 'sheet-name',
      outputLocation: 'reports/my-report.md'
    }
  });
}
```

**Then create a trigger:**

```javascript
// Add to createScheduledTriggers() function
ScriptApp.newTrigger('myCustomPrompt')
  .timeBased()
  .atHour(14)  // 2 PM
  .everyDays(1)
  .create();
```

### Event-Driven Prompts

**Example: Trigger on sheet edit**

```javascript
function onEdit(e) {
  const sheet = e.source.getActiveSheet();
  const range = e.range;

  // Example: Detect when column C is marked "REVIEW"
  if (range.getColumn() === 3 && e.value === 'REVIEW') {
    const rowData = sheet.getRange(range.getRow(), 1, 1, 10).getValues()[0];

    sendPromptToClaude(
      `Review this entry: ${JSON.stringify(rowData)}`,
      {
        type: 'review',
        priority: 'high',
        context: {
          triggeredBy: 'onEdit',
          row: range.getRow()
        }
      }
    );
  }
}
```

---

## Advanced Configuration

### Option 1: Direct Google Drive API (No Sync)

Instead of Google Drive Desktop sync, you can:

1. Use Apps Script to write files via Drive API
2. Use Apps Script to create files with specific names
3. Set up a local script to poll Drive API for new files
4. Download new prompts locally
5. Upload responses back to Drive

**Pros:** No Google Drive Desktop app needed
**Cons:** More complex setup, API quotas

### Option 2: Git-Based Queue

Use GitHub as intermediary:

1. Apps Script commits prompts via GitHub API
2. Local daemon pulls from GitHub (like team activity sync)
3. Claude processes prompts
4. Local daemon pushes responses to GitHub
5. Apps Script polls GitHub for responses

**Pros:** Full audit trail, works anywhere
**Cons:** GitHub API rate limits, more moving parts

### Option 3: Hybrid Approach

- **Prompts:** Apps Script → Google Drive → Local
- **Responses:** Local → Git → Apps Script reads from repo

Combines best of both: easy prompt sending + version-controlled responses.

---

## Monitoring & Maintenance

### Check Queue Health

**In Claude Code:**
```
Show me queue statistics:
- Pending count
- Completed today
- Average processing time
- Error rate
```

### Auto-Archival

**Set up cron job (optional):**

```bash
# Add to crontab (crontab -e)
0 0 * * * find ~/Desktop/medical-patient-data/automation/prompt-queue/completed/ -type f -mtime +30 -exec mv {} ~/Desktop/medical-patient-data/automation/prompt-queue/archive/ \;
```

This moves completed prompts older than 30 days to archive.

### Error Handling

**If prompt fails:**

1. Claude writes error response to `responses/`
2. Apps Script logs error
3. Optional: Send email alert
4. Move failed prompt to `archive/` with error status

---

## Security Considerations

### PHI Protection

**Apps Script automatically blocks PHI:**
```javascript
function containsPHI(text) {
  // Checks for SSN, MRN, DOB patterns
  // Returns true if detected
  // Prevents prompt from being sent
}
```

**Add custom PHI patterns** based on your data types.

### Access Control

- Google Drive folder: Share only with authorized users
- Apps Script: Restrict editing to admins
- Local directory: Workspace already secured (not synced to cloud)

### Audit Trail

- All prompts saved in `completed/` and `archive/`
- All responses saved
- Git history (if using git sync)
- Apps Script execution logs
- Workspace-brain logging (optional)

---

## Troubleshooting

### Prompt not appearing locally

**Check:**
1. Google Drive Desktop sync status (cloud icon in menu bar)
2. Folder mapping correct?
3. Apps Script execution log - did it run without errors?
4. File permissions on local directory

**Fix:**
```bash
# Check sync status
ls -la ~/Google\ Drive/

# Manually verify file in Drive
# Go to drive.google.com → Claude Automation/prompts/

# Check folder ID matches config
cat automation/prompt-queue/apps-script-template.gs | grep FOLDER_ID
```

### Response not appearing in Google Sheets

**Check:**
1. Did Claude write to `responses/` directory?
2. Is Google Drive syncing responses folder?
3. Is Apps Script trigger for checking responses running?
4. Check Apps Script execution log

**Fix:**
```bash
# Verify response file exists
ls -la automation/prompt-queue/responses/

# Check Google Drive sync
# Response should appear in drive.google.com/Claude Automation/responses/

# Manually run checkClaudeResponses() in Apps Script
```

### Claude Code not finding prompts

**Check:**
1. Correct directory path?
2. Files have `.json` extension?
3. JSON format valid?

**Fix:**
```
# In Claude Code, say:
"List all files in automation/prompt-queue/pending/ directory"

# Should show .json files
# If empty, sync issue
# If shows files but Claude didn't find them, ask Claude to:
"Read automation/prompt-queue/pending/prompt-[filename].json"
```

---

## Next Steps

Now that the system is set up:

1. ✅ **Create your first real prompt** (modify example in Apps Script)
2. ✅ **Test with non-PHI data** first
3. ✅ **Set up daily triggers** for routine tasks
4. ✅ **Monitor for 1 week** to ensure stability
5. ✅ **Add more automation** as needs arise
6. ✅ **Integrate with workspace-brain** for learning (optional)
7. ✅ **Document your custom prompts** for team reference

---

## Support & Documentation

- **System README:** `automation/prompt-queue/README.md`
- **Apps Script Template:** `automation/prompt-queue/apps-script-template.gs`
- **Claude Workflow:** `automation/prompt-queue/CLAUDE-CODE-WORKFLOW.md`
- **This Setup Guide:** `automation/prompt-queue/SETUP-GUIDE.md`

---

**Setup Complete!** 🎉

Your Google Sheets can now send automated prompts to Claude Code locally.

**Quick Test:**
1. In Google Sheets Apps Script: Run `testSendPrompt`
2. In Claude Code: Say "Check automation queue"
3. Execute the test prompt
4. In Apps Script: Run `testCheckResponses`

If all steps work, you're ready to automate!

---

**Created:** 2025-11-13
**Status:** Production Ready
**Version:** 1.0

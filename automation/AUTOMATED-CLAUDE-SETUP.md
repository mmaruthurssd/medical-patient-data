---
type: guide
tags: [automation, claude-cli, automated-prompting]
---

# Fully Automated Claude Code Prompting System

**🎉 BREAKTHROUGH: You have `claude` CLI with `--print` mode!**

This system enables **100% automated prompting** - no manual intervention required!

---

## 🎯 AI-First Workflow (How You Use This)

**YOU NEVER MANUALLY EDIT THE GOOGLE SHEET**

Instead, this is the workflow:

1. **You tell Claude**: "Add a daily prompt that generates a biopsy summary at 9 AM"
2. **Claude adds it** to the Google Sheet programmatically
3. **System executes** automatically on schedule
4. **You view results** in the sheet (read-only)

**See**: `AI-FIRST-WORKFLOW.md` for complete instructions on requesting scheduled prompts

---

## How It Works

### The Complete System

**You tell Claude** → **Claude adds to sheet** → **Apps Script triggers prompts** → **Automation server executes** → **Responses sync back**

```
1. YOU: Tell Claude what you want
   "Add a daily prompt that generates a biopsy summary at 9 AM"
        ↓
2. CLAUDE: Adds row to "Claude Automation Control" Google Sheet
   ├─ Name: "Daily Biopsy Summary"
   ├─ Schedule: "Daily at 9:00 AM"
   └─ Prompt: "Generate summary of yesterday's cases"
        ↓
3. Apps Script (time-based trigger every 5 min)
   - Checks for prompts that should run now
   - Writes prompt-[uuid].json to Google Drive
        ↓
4. Google Drive Desktop syncs to local
   - Syncs to: automation/prompt-queue/pending/
        ↓
5. Background automation server (checks every 30s)
   - Detects new prompt file
   - Executes: claude --print "[prompt]"
   - Writes response-[uuid].json
        ↓
6. Google Drive syncs response back
   - Response appears in Drive responses/ folder
        ↓
7. Apps Script reads response
   - Updates "Execution Log" sheet
   - Shows response in "Response Viewer" sheet
   - Updates "Last Run" timestamp
        ↓
8. YOU: View results in Google Sheet (read-only)
```

**The Control Panel**: All scheduling happens in the **"Claude Automation Control"** Google Sheet (see CLAUDE-AUTOMATION-CONTROL-SHEET.md for complete setup)

## Key Difference from Previous System

**OLD (manual):** You had to open Claude Code and say "check automation queue"
**NEW (automatic):** Background server automatically processes prompts 24/7

## Quick Start (5 Minutes)

### Step 1: Start the Automation Server

```bash
cd ~/Desktop/medical-patient-data/automation
./claude-automation-server.sh start
```

You'll see:
```
Starting Claude automation server...
Automation server started (PID: 12345)
Log file: automation/prompt-queue/automation-server.log

To view logs in real-time:
  tail -f automation/prompt-queue/automation-server.log
```

### Step 2: Test It

```bash
./claude-automation-server.sh test
```

This creates a test prompt. Wait 30 seconds, then check:

```bash
./claude-automation-server.sh status
```

You should see:
```
✅ Automation server is RUNNING (PID: 12345)

Queue status:
  Pending:    0
  Processing: 0
  Completed:  1
  Responses:  1
```

### Step 3: View the Response

```bash
cat automation/prompt-queue/responses/response-*.json
```

✅ **If you see a response, it's working!**

## Commands

### Start Server
```bash
./claude-automation-server.sh start
```

### Stop Server
```bash
./claude-automation-server.sh stop
```

### Check Status
```bash
./claude-automation-server.sh status
```

### Restart Server
```bash
./claude-automation-server.sh restart
```

### Send Test Prompt
```bash
./claude-automation-server.sh test
```

### View Logs in Real-Time
```bash
tail -f automation/prompt-queue/automation-server.log
```

## How the Automation Server Works

### Background Process
- Runs continuously in the background (daemon)
- Checks `automation/prompt-queue/pending/` every 30 seconds
- Processes prompts automatically when detected
- No manual intervention required

### Processing Flow

1. **Detection:**
   - Server checks `pending/` directory every 30 seconds
   - Finds all `prompt-*.json` files

2. **Prioritization:**
   - Processes in priority order: urgent → high → normal → low
   - High-priority prompts processed first

3. **Execution:**
   - Moves prompt to `processing/`
   - Reads prompt text from JSON
   - Executes: `claude --print --model sonnet "[prompt text]"`
   - Captures response

4. **Response Creation:**
   - Writes response to `responses/response-[id].json`
   - Moves original prompt to `completed/`
   - Logs execution time and status

5. **Error Handling:**
   - If execution fails, creates error response
   - Logs detailed error information
   - Continues processing other prompts

### Example Execution

**Prompt file created (by Google Sheets):**
```json
{
  "id": "abc-123",
  "created": "2025-11-13T09:00:00.000Z",
  "priority": "normal",
  "type": "daily-summary",
  "prompt": "Generate summary of yesterday's biopsy cases",
  "context": {
    "dataSource": "biopsy-log"
  }
}
```

**Server automatically:**
1. Detects file in `pending/`
2. Moves to `processing/`
3. Executes: `claude --print "Generate summary of yesterday's biopsy cases"`
4. Captures Claude's response
5. Writes `response-abc-123.json`
6. Moves prompt to `completed/`

**Response file (for Google Sheets to read):**
```json
{
  "promptId": "abc-123",
  "executed": "2025-11-13T09:00:45.000Z",
  "status": "completed",
  "result": {
    "response": "Here's the summary of yesterday's biopsy cases:\n\nTotal cases: 15\nUrgent: 2\nNormal: 13\n\nUrgent cases:\n1. Case #789 - Melanoma concern\n2. Case #801 - Atypical cells\n\nRecommendations:\n- Follow up on Case #789 within 24 hours\n- Schedule biopsy review for Case #801",
    "summary": "Executed successfully"
  },
  "duration": "3 seconds",
  "exitCode": 0
}
```

## Integration with Google Sheets

**Use the SAME Apps Script from before:**

The `apps-script-template.gs` file works perfectly with this system:
- Apps Script writes prompts to Google Drive folder
- Google Drive Desktop syncs to `automation/prompt-queue/pending/`
- Automation server processes automatically
- Responses sync back to Google Drive
- Apps Script reads responses

**No changes needed to Apps Script code!**

## Server Configuration

Edit the script to customize:

```bash
# Configuration section
CHECK_INTERVAL=30  # Check for prompts every 30 seconds (adjust as needed)
CLAUDE_BIN="/usr/local/bin/claude"  # Path to claude CLI
```

## Monitoring

### Real-Time Log Monitoring
```bash
tail -f automation/prompt-queue/automation-server.log
```

You'll see:
```
[2025-11-13 09:00:15] Automation server started (PID: 12345)
[2025-11-13 09:00:15] Checking for prompts every 30s
[2025-11-13 09:00:45] Found 1 pending prompt(s)
[2025-11-13 09:00:45] Processing prompt: abc-123
[2025-11-13 09:00:45] Type: daily-summary | Priority: normal
[2025-11-13 09:00:45] Executing with claude --print...
[2025-11-13 09:00:48] Success! Duration: 3s
[2025-11-13 09:00:48] Response written to: responses/response-abc-123.json
```

### Queue Statistics
```bash
./claude-automation-server.sh status
```

Shows pending, processing, completed counts, and recent activity.

## Auto-Start on Boot (Optional)

### macOS (LaunchAgent)

Create: `~/Library/LaunchAgents/com.claude.automation.plist`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.claude.automation</string>
    <key>ProgramArguments</key>
    <array>
        <string>/Users/mmaruthurnew/Desktop/medical-patient-data/automation/claude-automation-server.sh</string>
        <string>start</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/Users/mmaruthurnew/Desktop/medical-patient-data/automation/prompt-queue/launchd.log</string>
    <key>StandardErrorPath</key>
    <string>/Users/mmaruthurnew/Desktop/medical-patient-data/automation/prompt-queue/launchd-error.log</string>
</dict>
</plist>
```

Load it:
```bash
launchctl load ~/Library/LaunchAgents/com.claude.automation.plist
```

Now the server starts automatically on boot!

## Advanced Usage

### Custom Claude Options

Edit the script to add Claude CLI flags:

```bash
response_text=$("$CLAUDE_BIN" --print \
    --model sonnet \
    --append-system-prompt "Workspace: $WORKSPACE_DIR. Context: $context" \
    --tools "Bash,Edit,Read,Write" \
    --mcp-config "$WORKSPACE_DIR/.mcp.json" \
    "$prompt_text" 2>&1) || exit_code=$?
```

Available options:
- `--model opus` - Use more powerful model
- `--tools "Bash,Read,Write"` - Limit available tools
- `--mcp-config` - Load MCP servers
- `--system-prompt` - Add custom system instructions
- `--allow-dangerously-skip-permissions` - For automation (use with caution)

### Process Results Back in Apps Script

Apps Script can read responses and take action:

```javascript
function processClaudeResponses() {
  const responses = checkClaudeResponses();

  responses.forEach(response => {
    if (response.status === 'completed') {
      const result = JSON.parse(response.result.response);

      // Update sheet with results
      updateDashboard(result);

      // Send email notification if urgent
      if (response.priority === 'urgent') {
        sendEmailAlert(result);
      }

      // Create follow-up tasks
      if (result.recommendations) {
        createTasksFromRecommendations(result.recommendations);
      }
    }
  });
}
```

## Troubleshooting

### Server Won't Start

**Check if already running:**
```bash
./claude-automation-server.sh status
```

**Check for errors:**
```bash
cat automation/prompt-queue/automation-server.log
```

**Manually test claude CLI:**
```bash
/usr/local/bin/claude --print "Hello, test prompt"
```

### Prompts Not Being Processed

**Check server is running:**
```bash
./claude-automation-server.sh status
```

**Check pending directory:**
```bash
ls -la automation/prompt-queue/pending/
```

**Check logs:**
```bash
tail -f automation/prompt-queue/automation-server.log
```

### Responses Not Appearing

**Check responses directory:**
```bash
ls -la automation/prompt-queue/responses/
```

**Check completed directory:**
```bash
ls -la automation/prompt-queue/completed/
```

**Verify Google Drive sync status**

## Security Considerations

### Permissions

The automation server runs with your user permissions:
- Has access to your workspace files
- Can execute claude CLI with all your MCPs
- Can modify files in the workspace

**Use caution with:**
- `--dangerously-skip-permissions` flag (bypasses all safety checks)
- Prompts from untrusted sources
- PHI in prompts (ensure Apps Script filters it)

### PHI Protection

Apps Script should **already filter PHI** before writing prompts.

Add additional check in automation server if needed:
```bash
# Before processing prompt
if grep -qE 'SSN|MRN|DOB' "$prompt_file"; then
    log_error "PHI detected in prompt, skipping"
    mv "$prompt_file" "$QUEUE_DIR/rejected/"
    return 1
fi
```

## Performance

### Resource Usage
- **CPU:** Minimal when idle (~0%)
- **CPU:** Moderate during prompt execution (depends on Claude CLI)
- **Memory:** ~50MB for bash script
- **Disk I/O:** Minimal (only when processing prompts)

### Throughput
- Check interval: 30 seconds (configurable)
- Can process multiple prompts per check
- Processes in priority order
- No limit on queue size

## Success Metrics

Monitor these to ensure system is working:

```bash
# Total prompts processed today
find automation/prompt-queue/completed/ -name "*.json" -mtime -1 | wc -l

# Average processing time
grep "Duration:" automation/prompt-queue/automation-server.log | tail -10

# Error rate
grep "ERROR" automation/prompt-queue/automation-server.log | wc -l
```

## Next Steps

### Backend Setup (5 minutes)
1. ✅ **Start the automation server:** `./claude-automation-server.sh start`
2. ✅ **Test it:** `./claude-automation-server.sh test`
3. ✅ **Verify it's working:** `./claude-automation-server.sh status`

### Control Panel Setup (30-45 minutes) - **CRITICAL**
4. ✅ **Create the Google Sheet control panel** - See `CLAUDE-AUTOMATION-CONTROL-SHEET.md`
   - Create "Claude Automation Control" sheet in "AI Development - No PHI" Shared Drive
   - Create Drive folders: `claude-automation/prompts/` and `responses/`
   - Configure Apps Script with folder IDs
   - Run `initializeSheets()` and `setupTriggers()` functions
   - Set up Google Drive Desktop sync

5. ✅ **Add your first scheduled prompt**
   - Open the Google Sheet
   - Add a row with schedule (Daily/Weekly/Monthly)
   - Watch it execute automatically!

### Monitoring & Scaling
6. ✅ **Monitor for 24 hours** - Verify prompts execute on schedule
7. ✅ **Set up auto-start on boot** (optional - see below)
8. ✅ **Scale up** - Add more automated prompts as needed

---

**This is TRUE automation - no manual intervention required!**

The automation server runs 24/7 in the background, automatically processing prompts from Google Sheets using the `claude --print` CLI.

---

**Created:** 2025-11-13
**Status:** Production Ready
**Technology:** claude CLI (--print mode)

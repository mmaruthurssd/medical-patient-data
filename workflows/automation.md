# Automation Workflows

**Source:** WORKFLOW_PLAYBOOK.md
**Last Updated:** 2025-11-15
**Purpose:** Automated Claude Code prompting workflows and automation server control

---

## 🤖 Automated Claude Code Prompting Workflows

### Schedule Daily Workspace Health Checks

**Pattern Established:** 2025-11-15 ✅

**Trigger Phrases:**
- "schedule daily health checks"
- "add health check to automation queue"
- "automate workspace verification"
- "queue daily maintenance tasks"

**System Overview:**
The Claude Automation Control Spreadsheet in Google Drive provides a queue-based system for scheduling recurring prompts to Claude Code. The automation server monitors this spreadsheet and executes prompts at scheduled times using `claude --print` (non-interactive mode).

**Tools Available:**
- Claude Automation Control Spreadsheet (Google Drive: AI Development - No PHI)
- Claude Automation Server (`automation/claude-automation-server.sh`)
- Prompt queue system in Google Drive (`automation/prompt-queue/`)
- Service account for Google Sheets access

**Standard Process:**

**Option 1: AI-First Approach (Recommended)**
Tell Claude to add the prompt to the automation queue:

```text
Claude, please add a daily health check to the Claude Automation Control Spreadsheet:
- Prompt: [health check prompt from template below]
- Schedule: Daily at 9:00 AM
- Category: Maintenance
```

Claude will:
1. Read the Claude Automation Control Spreadsheet
2. Add the new row with proper formatting
3. Verify the server is monitoring the queue
4. Confirm the scheduled task

**Option 2: Manual Addition**
If you prefer to add directly to the spreadsheet:

1. Open Claude Automation Control Spreadsheet in Google Drive
2. Add new row with:
   - **Prompt Column:** Full health check prompt (see template below)
   - **Schedule Column:** `Daily 09:00`
   - **Category Column:** `Maintenance`
   - **Status Column:** `Active`
   - **Last Run Column:** (Leave blank, will auto-populate)
   - **Notes Column:** "Daily workspace health verification"

**Health Check Prompt Template:**

```text
Please run the daily workspace health check:

1. **Documentation Sync:** Verify all shared-docs symlinks are intact
   ls -la ~/Desktop/*/workspace-management | grep "^l"
   ls -la ~/Desktop/*/WORKFLOW_PLAYBOOK.md | grep "^l"

2. **MCP Status:** Check all MCPs are loaded and built
   cat ~/.claude.json | jq '.mcpServers | keys'

3. **Git Repository Health:** Check for uncommitted changes across all workspaces
   for workspace in operations-workspace medical-patient-data mcp-infrastructure; do
     cd ~/Desktop/$workspace && git status --short
   done

4. **Backup Verification:** Confirm recent GCS backups exist
   gsutil ls -lh gs://ssd-sheets-backup-immutable/daily-backups/ | tail -3

5. **Security Systems:** Verify pre-commit hooks are installed
   ls -la ~/Desktop/*/.git/hooks/pre-commit

Report status and fix any issues found. Log results to EVENT_LOG.md if any issues detected.
```

**Automation Server Control:**

```bash
# Start automation server (if not running)
cd ~/Desktop/medical-patient-data/automation
./claude-automation-server.sh start

# Check server status
./claude-automation-server.sh status

# View server logs
tail -f automation/prompt-queue/automation-server.log

# Stop server (if needed)
./claude-automation-server.sh stop

# Restart server (after changes)
./claude-automation-server.sh restart
```

**Monitoring the Daily Health Checks:**

```bash
# View automation log for executed prompts
tail -20 ~/Desktop/medical-patient-data/automation/prompt-queue/automation-server.log

# Check Claude Code responses
ls -lt ~/Desktop/medical-patient-data/automation/prompt-queue/responses/

# Review latest health check output
cat ~/Desktop/medical-patient-data/automation/prompt-queue/responses/[latest-response].txt
```

**Common Variations:**
- [x] Daily health checks (9:00 AM recommended)
- [ ] Weekly comprehensive health checks (with full diagnostics)
- [ ] Hourly MCP monitoring (for critical systems)
- [ ] Pre-deployment verification checks
- [ ] Post-update validation checks

**Real Example (Daily Health Check Schedule):**

Automation queue entry in Claude Automation Control Spreadsheet:

| Prompt | Schedule | Category | Status | Last Run | Notes |
|--------|----------|----------|--------|----------|-------|
| [Full health check prompt from template] | Daily 09:00 | Maintenance | Active | 2025-11-15 09:00 | Daily workspace health verification |

**Workflow Steps:**
1. **Initial Setup** - Ensure automation server is running
2. **Add to Queue** - Use AI-First approach or manual addition
3. **Verify Scheduling** - Check server logs for queue detection
4. **Monitor Execution** - Review responses folder daily
5. **Address Issues** - Fix any problems reported by health checks
6. **Update as Needed** - Refine prompt based on effectiveness

**Integration with Health Check Documentation:**

This automated workflow executes the commands documented in:
- `workspace-management/SYSTEM-HEALTH-CHECKS.md` - Full command reference
- `workspace-management/SYSTEM-MAINTENANCE-GUIDE.md` - Maintenance patterns
- `workspace-management/AI-QUICK-REFERENCE.md` - Quick command lookup

**Troubleshooting:**

**Problem:** Health check not executing
**Fix:**
```bash
# Check server status
cd ~/Desktop/medical-patient-data/automation
./claude-automation-server.sh status

# Verify queue file exists
ls -la ~/Desktop/medical-patient-data/automation/prompt-queue/queue.json

# Check server logs for errors
tail -50 automation/prompt-queue/automation-server.log
```

**Problem:** Health check fails with errors
**Fix:**
1. Check the response file for error details
2. Verify all paths in health check commands are correct
3. Ensure service account credentials are valid
4. Run commands manually to isolate the issue
5. Update prompt template if needed

**Problem:** Automation server stopped
**Fix:**
```bash
cd ~/Desktop/medical-patient-data/automation
./claude-automation-server.sh start
# Verify it's running
ps aux | grep claude-automation-server
```

**Notes:**
- Automation server uses non-interactive mode (`claude --print`) for scheduled execution
- All responses are saved to `prompt-queue/responses/` with timestamps
- Failed health checks should trigger manual investigation
- Update EVENT_LOG.md for significant health check findings
- The automation queue is in Google Drive for team visibility
- Service account provides read access to the control spreadsheet
- Prompts execute in the medical-patient-data workspace by default
- Daily execution at 9:00 AM catches overnight issues early
- Keep prompt template updated as health checks evolve

**AI Responsibilities:**
- Add prompts to queue when requested
- Monitor health check results
- Fix issues reported by automated checks
- Update prompt template when health checks change
- Log significant findings to EVENT_LOG.md
- Suggest workflow improvements based on patterns

**Security Considerations:**
- Automation runs in medical-patient-data workspace (PHI allowed)
- Health checks scan for credential exposure
- Pre-commit hooks verified as part of security checks
- Service account has minimal required permissions
- Logs may contain sensitive information - keep local only

**Cost Tracking:**
- Claude API usage for automated prompts tracked in workspace-brain
- Daily health check ≈ 1000 tokens per execution
- Monthly cost: ~$0.30 for daily execution (30 days × 1000 tokens)
- Monitor via workspace-brain ROI reports

---

## 📚 Claude Automation Control Spreadsheet

**Location:** AI Development - No PHI Shared Drive
**Purpose:** Queue-based system for scheduling recurring Claude Code prompts

**Structure:**
- **Prompt Column:** Full prompt text to execute
- **Schedule Column:** Execution schedule (e.g., "Daily 09:00", "Weekly Monday 10:00")
- **Category Column:** Categorization (Maintenance, Monitoring, Reporting, etc.)
- **Status Column:** Active/Inactive/Paused
- **Last Run Column:** Auto-populated timestamp of last execution
- **Notes Column:** Description or context

**Finding the Spreadsheet:**
```javascript
// Use FILE-INDEX or local cache to find Claude Automation Control
const cache = require('./cache/important-sheets-registry.json');
const sheetId = cache['Claude Automation Control'].id;
```

**Integration:**
- Monitored by automation server (`automation/claude-automation-server.sh`)
- Automatically executes prompts at scheduled times
- Saves all responses to `automation/prompt-queue/responses/`
- Updates "Last Run" timestamp after execution

---

## 🖥️ Automation Server Control

**Server Script:** `automation/claude-automation-server.sh`

**Available Commands:**

```bash
# Start the automation server
./claude-automation-server.sh start

# Check server status
./claude-automation-server.sh status

# Stop the server
./claude-automation-server.sh stop

# Restart the server
./claude-automation-server.sh restart
```

**Server Behavior:**
- Monitors Claude Automation Control Spreadsheet for scheduled prompts
- Executes prompts using `claude --print` (non-interactive mode)
- Runs in background as daemon process
- Saves all output to `automation/prompt-queue/automation-server.log`
- Stores prompt responses in `automation/prompt-queue/responses/`

**Log Files:**
- **Server Log:** `automation/prompt-queue/automation-server.log`
- **Response Files:** `automation/prompt-queue/responses/response-[timestamp].txt`

**Monitoring:**

```bash
# View real-time server logs
tail -f ~/Desktop/medical-patient-data/automation/prompt-queue/automation-server.log

# List recent responses
ls -lt ~/Desktop/medical-patient-data/automation/prompt-queue/responses/ | head -10

# Check if server is running
ps aux | grep claude-automation-server
```

---

## 🔍 Troubleshooting Guide

### Common Issues

**Issue: Automation server won't start**
```bash
# Check if already running
ps aux | grep claude-automation-server

# Kill existing process if stuck
pkill -f claude-automation-server

# Start fresh
cd ~/Desktop/medical-patient-data/automation
./claude-automation-server.sh start
```

**Issue: Prompts not executing**
1. Verify server is running: `./claude-automation-server.sh status`
2. Check spreadsheet status column is "Active"
3. Verify schedule format is correct
4. Review server logs for errors

**Issue: Can't access Claude Automation Control Spreadsheet**
```bash
# Refresh local cache
cd ~/Desktop/medical-patient-data/google-workspace-oauth-setup
node find-important-sheets.js

# Verify service account credentials
ls -la ~/Desktop/medical-patient-data/google-workspace-oauth-setup/service-account.json
```

**Issue: Health check reports errors**
1. Review response file for specific error
2. Run health check commands manually to isolate issue
3. Fix underlying problem
4. Update health check template if needed

---

## 📝 Best Practices

### Adding New Scheduled Prompts

1. **Use the AI-First approach** - Let Claude add prompts to the queue
2. **Be specific** - Include all necessary context in prompt text
3. **Test first** - Run prompt manually before scheduling
4. **Monitor initially** - Check first few executions for issues
5. **Document** - Add notes column explaining purpose

### Schedule Format Examples

```text
Daily 09:00              # Every day at 9:00 AM
Weekly Monday 10:00      # Every Monday at 10:00 AM
Hourly                   # Every hour on the hour
Daily 14:30              # Every day at 2:30 PM
Weekly Friday 17:00      # Every Friday at 5:00 PM
```

### Health Check Maintenance

- Review health check results daily
- Update prompt template as systems evolve
- Add new checks when new systems are deployed
- Remove checks for deprecated systems
- Log significant findings to EVENT_LOG.md

### Security

- Never include credentials in scheduled prompts
- Keep automation logs local only
- Verify health checks don't expose sensitive data
- Monitor automation server access
- Use service account with minimal permissions

---

## 🔄 Integration with Other Systems

**FILE-INDEX:**
- Claude Automation Control tracked in FILE-INDEX
- Auto-discovery via find-important-sheets.js
- Local cache for quick access

**workspace-brain MCP:**
- Log automation execution telemetry
- Track workflow patterns
- Monitor ROI and costs

**SYSTEM-HEALTH-CHECKS.md:**
- Source of health check commands
- Reference for manual verification
- Keep synchronized with automated checks

**EVENT_LOG.md:**
- Log significant health check findings
- Track automation server changes
- Document prompt template updates

---

## 📊 Monitoring and Metrics

### Daily Monitoring

```bash
# Check automation server health
./claude-automation-server.sh status

# Review today's executions
tail -50 automation/prompt-queue/automation-server.log | grep "$(date +%Y-%m-%d)"

# Check for errors
grep -i error automation/prompt-queue/automation-server.log | tail -10
```

### Weekly Review

- Verify all scheduled prompts executed successfully
- Review health check findings
- Update prompt templates as needed
- Check automation server uptime
- Monitor response file growth

### Monthly Audit

- Review automation queue for outdated prompts
- Update health check templates
- Verify server logs are rotating properly
- Check Claude API usage costs
- Document lessons learned

---

## 🚀 Future Enhancements

**Planned:**
- [ ] Email notifications for failed health checks
- [ ] Automated response parsing and alerting
- [ ] Multiple schedule frequencies (hourly, weekly, monthly)
- [ ] Conditional prompt execution (if X then Y)
- [ ] Prompt result validation and retry logic

**Under Consideration:**
- [ ] Integration with Google Chat for real-time alerts
- [ ] Dashboard for automation metrics
- [ ] Automated prompt template generation
- [ ] Multi-workspace support
- [ ] Response trend analysis

---

## 📚 Related Documentation

- `WORKFLOW_PLAYBOOK.md` - Complete workflow reference
- `workspace-management/SYSTEM-HEALTH-CHECKS.md` - Health check commands
- `workspace-management/SYSTEM-MAINTENANCE-GUIDE.md` - Maintenance patterns
- `workspace-management/AI-QUICK-REFERENCE.md` - Quick command lookup
- `EVENT_LOG.md` - System event logging
- `SYSTEM-COMPONENTS.md` - System component documentation

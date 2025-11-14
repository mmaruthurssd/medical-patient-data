# Drift Detection System - User Guide
**Last Updated:** November 13, 2025
**Status:** Operational

## Overview

The Drift Detection System monitors all 204 production Apps Script sheets for unauthorized code changes. It automatically detects when someone modifies code directly in Google Sheets (bypassing the version control workflow) and alerts you to take action.

---

## How It Works

### 1. Automated Monitoring
- **Frequency:** The system runs drift detection checks manually (cron automation pending)
- **Method:** Pulls latest code from Google Drive and compares against local git repository
- **Scope:** All 204 PROD sheets in `production-sheets/`

### 2. Detection Logic
```
For each PROD sheet:
  1. Save current local code as baseline
  2. Pull fresh code from Google Drive (clasp pull)
  3. Compare fresh code vs baseline
  4. If differences found → DRIFT DETECTED
  5. If no differences → No drift
```

### 3. Results
- **Log File:** `logs/snapshot-drift-YYYYMMDD-HHMMSS.log`
- **Drift Report:** `logs/drift-report-YYYYMMDD-HHMMSS.txt` (only if drift detected)
- **Exit Codes:**
  - 0 = Success, no drift
  - 1 = Errors during execution
  - 2 = Drift detected

---

## Running Drift Detection

### Manual Run (All 204 Sheets)
```bash
cd "/Users/mmaruthurnew/Desktop/medical-patient-data/Implementation Projects/google-sheets-version-control"
./scripts/snapshot-production-drift.sh
```

**Expected Duration:** ~5-10 minutes (2-3 seconds per sheet)

### Test Run (5 Sample Sheets)
```bash
cd "/Users/mmaruthurnew/Desktop/medical-patient-data/Implementation Projects/google-sheets-version-control"
./scripts/test-snapshot-5sheets.sh
```

**Expected Duration:** ~10 seconds

---

## When Drift Is Detected

### Step 1: Review Drift Report
Open the drift report file:
```bash
cat "logs/drift-report-YYYYMMDD-HHMMSS.txt"
```

The report shows:
- Which sheets have drift
- What files were modified
- Exact line-by-line differences

### Step 2: Investigate
For each drifted sheet, determine:
1. **Who made the change?**
   - Check Google Apps Script version history
   - Review Google Drive activity log

2. **Why was it changed?**
   - Emergency bug fix?
   - Unauthorized modification?
   - Intentional update bypassing workflow?

3. **Is the change valid?**
   - Should we keep it (commit to git)?
   - Should we reject it (redeploy from git)?

### Step 3: Decide Action

**Option A: Accept Changes (Commit to Git)**
```bash
cd "production-sheets/sheet-XXX_PROD--..."
git add live/
git commit -m "Accept drift: [description of change]

Change made directly in Google by [person] on [date].
Reason: [emergency fix / approved update / etc.]

Drift detected: [date]"

git push
```

**Option B: Reject Changes (Redeploy from Git)**
```bash
# Restore clean code from git
cd "production-sheets/sheet-XXX_PROD--..."
git checkout HEAD -- live/

# Push to Google to overwrite unauthorized changes
cd live/
clasp push --force

echo "Unauthorized changes reverted. Notify team about proper workflow."
```

### Step 4: Follow Up
- Update team on proper deployment workflow
- Document incident in team meeting notes
- Consider additional access controls if needed

---

## Integration with Git Safeguards

### Pre-Push Hook
**File:** `.git/hooks/pre-push`

Validates that exactly 408 directories exist (204 PROD + 204 DEV3) before allowing push.

**If Hook Blocks Push:**
```bash
# Check what was deleted
git status

# Restore deleted sheets
git checkout HEAD -- "Implementation Projects/google-sheets-version-control/production-sheets/sheet-XXX_*"

# Try push again
git push
```

### GitHub Branch Protection
**Status:** Enabled on `main` branch
- Force pushes: Disabled
- Branch deletion: Disabled

---

## Automation (Coming Soon)

### Planned: 2x Daily Cron Jobs
**Schedule:**
- 8:00 AM daily
- 8:00 PM daily

**Note:** Cron job installation currently blocked by macOS system permissions. Manual setup required:

```bash
# Open crontab editor
crontab -e

# Add these lines:
0 8 * * * cd "/Users/mmaruthurnew/Desktop/medical-patient-data/Implementation Projects/google-sheets-version-control" && ./scripts/snapshot-production-drift.sh >> logs/cron-snapshot.log 2>&1
0 20 * * * cd "/Users/mmaruthurnew/Desktop/medical-patient-data/Implementation Projects/google-sheets-version-control" && ./scripts/snapshot-production-drift.sh >> logs/cron-snapshot.log 2>&1
```

**Alert Setup (Future):**
- Email notification if drift detected
- Slack/Teams notification
- Integration with monitoring dashboard

---

## Troubleshooting

### Error: "Failed to pull from Google"
**Cause:** Clasp authentication expired or .clasp.json missing

**Fix:**
```bash
# Re-authenticate clasp
clasp login

# Verify .clasp.json exists
cd "production-sheets/sheet-XXX_PROD--..."/live
ls -la .clasp.json

# If missing, regenerate all .clasp.json files
cd "/Users/mmaruthurnew/Desktop/medical-patient-data/Implementation Projects/google-sheets-version-control"
./scripts/create-clasp-configs.sh
```

### No Drift Detected But Changes Were Made
**Possible Causes:**
1. Changes already committed to git (baseline updated)
2. Only .clasp.json was modified (excluded from drift detection)
3. Changes made in non-PROD sheet (DEV3/Staging)

**Verification:**
```bash
cd "production-sheets/sheet-XXX_PROD--..."/live
git status  # Check if changes are already staged/committed
git log --oneline -5  # Review recent commits
```

### Script Takes Too Long
**Expected Times:**
- Single sheet: 2-3 seconds
- 5 sheets: ~10 seconds
- 204 sheets: 5-10 minutes

**If slower:**
1. Check network connection to Google Drive
2. Verify clasp authentication is active
3. Check for background processes using clasp

---

## Best Practices

### 1. Run Before Major Deployments
Always run drift detection before deploying new code to verify production is clean:
```bash
./scripts/snapshot-production-drift.sh
# Wait for "No drift detected" confirmation
# Then proceed with deployment
```

### 2. Weekly Reviews
Even with automation, manually review drift detection logs weekly:
```bash
ls -lt logs/snapshot-drift-*.log | head -7  # Last 7 runs
```

### 3. Document All Drift
When drift is detected and accepted:
- Document in commit message
- Note in team meeting
- Update change log

### 4. Training
Ensure all team members understand:
- Proper deployment workflow: DEV3 (Staging) → PROD
- Why direct edits in Google are problematic
- How to use drift detection reports

---

## Files and Directories

### Scripts
- `scripts/snapshot-production-drift.sh` - Main drift detection script (all 204 sheets)
- `scripts/test-snapshot-5sheets.sh` - Test script (5 sample sheets)
- `scripts/create-clasp-configs.sh` - Generate .clasp.json files

### Logs
- `logs/snapshot-drift-*.log` - Drift detection execution logs
- `logs/drift-report-*.txt` - Detailed drift reports (only when drift detected)
- `logs/cron-snapshot.log` - Cron job execution log (future)

### Configuration
- `production-sheets/*/live/.clasp.json` - Clasp configuration (204 files)
- `production-sheets/*/metadata/script-id.txt` - Google Apps Script IDs
- `.git/hooks/pre-push` - Git hook for directory count validation

---

## Statistics

### Current Status
- **PROD Sheets Monitored:** 204
- **DEV3 Sheets (Staging):** 204
- **Total Directories:** 408
- **.clasp.json Files:** 204 (all configured)
- **Average Check Time:** 2-3 seconds per sheet
- **Full Scan Time:** 5-10 minutes

### Test Results (November 13, 2025)
- **Sheets Tested:** 5
- **Successful Checks:** 5
- **Failed Checks:** 0
- **Drift Detected:** 0
- **Average Time:** 1 second per sheet

---

## Support

### Questions?
1. Review this guide
2. Check recent logs in `logs/`
3. Test with 5-sheet sample first
4. Contact system administrator

### Reporting Issues
Include:
1. Log file from failed run
2. Sheet serial number(s) affected
3. Error messages (if any)
4. Steps to reproduce

---

## Next Steps

### Immediate
1. Set up automated 2x daily cron jobs (manual macOS configuration needed)
2. Configure email alerts for drift detection
3. Document first drift incident (when it occurs)

### Short-term
4. Integrate with monitoring dashboard
5. Add Slack/Teams notifications
6. Create rollback procedures documentation

### Medium-term
7. Implement automated testing of drifted code
8. Set up change management ticketing integration
9. Create training materials for team

---

## Workflow Summary

```
┌─────────────────────────────────────────┐
│  DEV3 (Staging) Sheets                  │
│  - Test changes here                    │
│  - Verify functionality                 │
└──────────────┬──────────────────────────┘
               │
               │ Deploy using clasp push
               ▼
┌─────────────────────────────────────────┐
│  PROD Sheets                            │
│  - Live production code                 │
│  - Version controlled in git            │
└──────────────┬──────────────────────────┘
               │
               │ Drift Detection (2x daily)
               ▼
┌─────────────────────────────────────────┐
│  Drift Detected?                        │
├─────────────────────────────────────────┤
│  YES → Review, Accept or Reject         │
│  NO  → Continue normal operations       │
└─────────────────────────────────────────┘
```

---

**End of Guide**

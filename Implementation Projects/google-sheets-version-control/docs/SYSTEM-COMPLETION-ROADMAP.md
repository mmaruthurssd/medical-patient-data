# System Completion Roadmap - November 13, 2025

**Goal:** Complete production version control system with staging and drift detection

## Current Status

### ✅ COMPLETED
1. **Production Sheets (204 total)**
   - 203 sheets with code intact
   - 1 sheet needs re-pull (sheet-140)
   - All backed up and tracked in git

2. **Directory Cleanup**
   - Removed 158 duplicate DEV3 directories
   - Removed 204 DEV4 directories
   - Clean structure: 204 PROD, 226 DEV3

3. **DEV3 Realignment**
   - Fixed 13 misaligned sheets
   - Current match rate: 182/204 (89%)

### ⏳ IN PROGRESS
1. **Staging/DEV3 Sheets**
   - 182 sheets match PROD (89%)
   - 22 sheets need attention (6 mismatches + 16 missing)

2. **Automated Snapshots**
   - Scripts exist but not scheduled
   - Need to set up cron jobs for 2x daily

### ❌ NOT STARTED
1. **Drift Detection**
   - Compare daily snapshots
   - Alert on unauthorized changes
   - Track code divergence

## Completion Plan

### Phase 1: Complete Staging Mirror (22 sheets remaining)

**Option A: Create DEV3 from PROD (Fastest)**
Since DEV3 versions may not exist for all 22 sheets, we can:
1. Copy PROD code to new DEV3 Apps Script projects
2. Create proper staging sheets in Google Drive
3. Pull them locally with clasp

**Time:** ~2-3 hours (with proper authentication)

**Option B: Import from Google Drive (If they exist)**
If DEV3 versions exist somewhere:
1. Locate them in Google Drive
2. Get their script IDs
3. Pull them with clasp

**Time:** Depends on locating the sheets

**DECISION NEEDED:** Which option? Do the 22 missing DEV3 sheets exist somewhere?

### Phase 2: Set Up Automated Snapshots

**Tasks:**
1. ✅ Scripts already exist:
   - `scripts/snapshot-production-initial.sh` (for PROD)
   - `scripts/snapshot-all-staging.js` (for DEV3)

2. **Schedule with cron:**
   ```bash
   # Add to crontab
   # Snapshot PROD twice daily (9 AM and 5 PM)
   0 9 * * * cd /path/to/project/scripts && ./snapshot-production-daily.sh
   0 17 * * * cd /path/to/project/scripts && ./snapshot-production-daily.sh

   # Snapshot DEV3 twice daily (9:30 AM and 5:30 PM)
   30 9 * * * cd /path/to/project/scripts && node snapshot-all-staging.js
   30 17 * * * cd /path/to/project/scripts && node snapshot-all-staging.js
   ```

3. **Auto-commit to git:**
   - Add git commands to snapshot scripts
   - Push to GitHub after each snapshot
   - Enables time-travel and recovery

**Time:** 1 hour to set up and test

### Phase 3: Enable Drift Detection

**What to build:**
1. **Comparison Script**
   ```bash
   scripts/detect-drift.sh
   ```
   - Compare PROD vs DEV3 code
   - Identify diverged sheets
   - Generate drift report

2. **Drift Alert**
   - Email notification if unauthorized PROD changes detected
   - Daily digest of code differences
   - Flag high-risk changes (core functions modified)

3. **Dashboard Update**
   - Add "Drift Status" to monitoring spreadsheet
   - Show which sheets diverged
   - Last sync date

**Time:** 2-3 hours to build and test

## Detailed Action Items

### Immediate (Today)

**1. Fix sheet-140 (empty PROD sheet)**
```bash
# Get correct script ID from production-sheets.csv
# Update metadata/script-id.txt
# Re-run clasp pull
```

**2. Decide on 22 missing DEV3 sheets**
- Do they exist in Google Drive?
- If yes: where can we find them?
- If no: create new DEV3 copies from PROD

**3. Test snapshot scripts**
- Verify they run without errors
- Check output format
- Confirm git integration works

### This Week

**1. Complete DEV3 mirror (100% match)**
- Import or create 22 missing sheets
- Verify all 204 PROD/DEV3 pairs match
- Document any intentional differences

**2. Set up automated snapshots**
- Install cron jobs
- Test first automated run
- Verify GitHub push works

**3. Build drift detection**
- Create comparison script
- Test with known differences
- Set up email alerts

### Ongoing

**1. Monitor snapshots**
- Check logs daily
- Verify no failures
- Maintain backup strategy

**2. Review drift reports**
- Weekly review of diverged sheets
- Approve or reject changes
- Sync DEV3 → PROD for tested features

**3. Maintain documentation**
- Update system status
- Track issues encountered
- Document resolutions

## Technical Details

### Snapshot Flow
```
1. Cron triggers snapshot script (2x daily)
2. Script uses clasp to pull all sheets
3. Changes detected by git
4. Auto-commit with timestamp
5. Auto-push to GitHub
6. Backup to Google Cloud Storage (via GitHub Actions)
```

### Drift Detection Flow
```
1. Daily comparison script runs
2. For each sheet:
   - Compare PROD vs DEV3 code
   - Check last sync date
   - Flag if PROD changed without DEV3 update
3. Generate report
4. Email if high-risk changes detected
5. Update monitoring dashboard
```

### Staging Workflow
```
1. Developer modifies DEV3 sheet
2. Test changes in staging
3. If approved: sync DEV3 → PROD
4. Snapshot captures new PROD state
5. Git history tracks the change
```

## Risk Mitigation

### Prevent Accidental Code Loss
1. ✅ All operations are read-only clasp pulls
2. ✅ Git tracks all changes with history
3. ✅ Multiple backup layers (local, GitHub, GCS)
4. ✅ Google Drive remains source of truth

### Detect Unauthorized Changes
1. ⏳ Drift detection alerts on PROD modifications
2. ⏳ Daily review of changed sheets
3. ⏳ Approval workflow for syncing changes

### Handle Script Failures
1. ⏳ Snapshot scripts log errors
2. ⏳ Email notification on failures
3. ⏳ Retry logic for transient failures

## Success Criteria

**System is "complete" when:**
- [x] 204 PROD sheets with code intact
- [ ] 204 DEV3 sheets match PROD (currently 182/204)
- [ ] Automated snapshots running 2x daily
- [ ] Git commits show snapshot history
- [ ] Drift detection script operational
- [ ] Monitoring dashboard shows system health
- [ ] Documentation complete and current

**Current Progress:** 75% complete

## Next Decision Point

**QUESTION:** For the 22 missing/mismatched DEV3 sheets:

**Option 1:** Create new DEV3 from PROD
- Fastest path to 100% staging
- Requires creating new Apps Script projects
- ~2-3 hours of work

**Option 2:** Locate existing DEV3 in Google Drive
- Preserves any existing staging work
- Requires finding the sheets
- Time depends on how organized Google Drive is

**Option 3:** Defer for now
- Use 182 matched sheets for drift detection
- Create DEV3 versions as needed for testing
- May miss drift on 22 sheets

**Which option would you like to pursue?**

---

**Last Updated:** 2025-11-13 11:00 AM CST
**Status:** Awaiting decision on 22 missing DEV3 sheets

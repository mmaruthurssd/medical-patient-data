# DEV3 Creation Quick Start Guide
**Goal:** Create 22 missing DEV3 sheets to achieve 100% staging mirror of production
**Status:** Phase 1 Complete - Ready for Phase 2
**Date:** 2025-11-13

## What We're Doing

Creating 22 new DEV3 (staging) sheets by copying from PROD sheets so that:
- Every PROD sheet has a matching DEV3 sheet (100% mirror)
- All changes happen in staging first
- Production is read-only and protected
- Automated snapshots can begin

## Three Simple Phases

### ✅ Phase 1: Safety Backup (COMPLETED)
- Created backup directory with full inventory
- Documented all 22 sheets to create
- Updated git pre-commit hook
- Git committed current state

**Location:** `backups/pre-dev3-creation-20251113/`

### 🔄 Phase 2: Create DEV3 in Google Drive (MANUAL WORK REQUIRED)
- Copy 22 PROD spreadsheets to create DEV3 versions
- Copy Apps Script projects
- Record new script IDs in tracking CSV

**Time:** 2-3 hours
**Guide:** `docs/PHASE-2-GOOGLE-DRIVE-INSTRUCTIONS.md`
**Tracking:** `backups/pre-dev3-creation-20251113/dev3-creation-tracker.csv`

### ⏭️ Phase 3: Pull Code Locally (AUTOMATED)
- Run automation script to create local directories
- Pull all 22 DEV3 sheets using clasp
- Verify code integrity
- Git commit

**Time:** 15-30 minutes
**Script:** `scripts/create-22-dev3-sheets.sh`

## Quick Start

### Step 1: Open the Tracking CSV
```bash
open backups/pre-dev3-creation-20251113/dev3-creation-tracker.csv
```
Or open it in your preferred spreadsheet app (Excel, Numbers, Google Sheets)

### Step 2: Follow Phase 2 Instructions
```bash
open docs/PHASE-2-GOOGLE-DRIVE-INSTRUCTIONS.md
```

For each of the 22 sheets:
1. Find PROD sheet by registry ID
2. Make a copy → Rename "[DEV] <name>"
3. Copy Apps Script → Get new script ID
4. Fill in tracking CSV with new spreadsheet ID and script ID

### Step 3: Run Phase 3 Automation
After all 22 sheets are created and tracking CSV is complete:
```bash
cd scripts
./create-22-dev3-sheets.sh
```

### Step 4: Verify and Commit
```bash
# Verify 100% match
./verify-prod-dev3-matches.sh

# Expected: 204 perfect matches (100%)

# Commit to git
cd ../production-sheets
git add -A
git commit -m "Create 22 DEV3 sheets from PROD - staging now 100% complete"
git push origin main
```

## The 22 Sheets to Create

**6 Mismatches** (wrong DEV3 - delete and recreate):
- Serial 016: D25-266
- Serial 059: D25-309
- Serial 118: D25-355
- Serial 160: S25-415
- Serial 162: S25-395
- Serial 201: S25-462

**16 Missing** (no DEV3 - create new):
- Serial 015: D25-452 - Dena Yearwood - Patient Tracking Sheet
- Serial 149: S25-489 - Printable Documents List
- Serial 150: S25-486 - Shared Documents
- Serial 151: S25-471 - Staff Training Modules Log
- Serial 153: S25-450 - ARCHIVE - Patient Document Log
- Serial 154: S25-449 - Patient Document Log (Processed) LIVE
- Serial 156: S25-447 - Incoming Fax Scanner Log
- Serial 157: S25-442 - Dashboard Template
- Serial 158: S25-434 - Patient Phone Tracker PHI
- Serial 159: S25-422 - Paycheck Historic Data
- Serial 161: S25-409 - SSD Skin Substitute Inventory
- Serial 165: S25-391 - Credentialing Checklist - Template
- Serial 166: S25-390 - Employee Sheet Template
- Serial 171: S25-321 - Thursday Staff Lunch Notes Log
- Serial 172: S25-320 - Prior Auth - Dermatology Letters
- Serial 174: S25-423 - Credentialing Checklist - Grace McMahan

## Files Reference

**Documentation:**
- `docs/STAGING-CREATION-PLAN.md` - Complete detailed plan
- `docs/PHASE-2-GOOGLE-DRIVE-INSTRUCTIONS.md` - Step-by-step manual work
- `docs/DEV3-CREATION-QUICK-START.md` - This file

**Tracking:**
- `backups/pre-dev3-creation-20251113/dev3-creation-tracker.csv` - Fill this in during Phase 2
- `backups/pre-dev3-creation-20251113/22-sheets-to-create.txt` - Reference list
- `backups/pre-dev3-creation-20251113/prod-list.txt` - All 204 PROD directories
- `backups/pre-dev3-creation-20251113/dev3-list.txt` - All 226 DEV3 directories (pre-creation)

**Scripts:**
- `scripts/create-22-dev3-sheets.sh` - Phase 3 automation
- `scripts/verify-prod-dev3-matches.sh` - Verification script

## Safety Features

✅ **Multiple backups:**
- Local git history
- GitHub remote
- Google Drive (source of truth)
- Phase 1 backup directory

✅ **Pre-commit hook:**
- Blocks accidental deletions
- Verifies sheet count
- Requires confirmation for large changes

✅ **Read-only operations:**
- clasp pull never modifies Google Drive
- Local repository is snapshots only
- PROD sheets remain untouched

✅ **Reversible at every step:**
- Git reset for local changes
- Delete/retry for Google Drive copies
- Full recovery procedures documented

## After Completion

Once all 22 DEV3 sheets are created:

### 1. Enable Automated Snapshots
Set up cron jobs for twice-daily snapshots:
```bash
crontab -e

# Snapshot PROD twice daily
0 9 * * * cd /full/path/to/scripts && ./snapshot-daily.sh prod
0 17 * * * cd /full/path/to/scripts && ./snapshot-daily.sh prod

# Snapshot DEV3 twice daily
30 9 * * * cd /full/path/to/scripts && ./snapshot-daily.sh dev3
30 17 * * * cd /full/path/to/scripts && ./snapshot-daily.sh dev3
```

### 2. Create Deployment Script
Build protected script for deploying staging → production:
- Compare DEV3 vs PROD code
- Show diff of changes
- Require approval
- Create snapshot before deployment
- Copy DEV3 code to PROD
- Log all deployments

### 3. Document Workflow
Update documentation with:
- Standard development workflow (always use DEV3)
- Deployment procedures
- Emergency rollback procedures
- Recovery playbook

## Estimated Timeline

- Phase 1: ✅ Complete
- Phase 2: 2-3 hours (manual Google Drive work)
- Phase 3: 15-30 minutes (automated)
- Verification: 10 minutes
- **Total: 3-4 hours**

## Support

If you need help during any phase:
1. Review the detailed plan: `docs/STAGING-CREATION-PLAN.md`
2. Check Phase 2 instructions for Google Drive steps
3. Review common issues in Phase 2 guide
4. Remember: You can always delete and retry - nothing is permanent

---

**Ready to begin?**

Open the tracking CSV and Phase 2 instructions to start creating the 22 DEV3 sheets!

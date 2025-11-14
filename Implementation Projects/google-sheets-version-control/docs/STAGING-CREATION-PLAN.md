# Staging Creation Plan - Option A
**Date:** 2025-11-13
**Goal:** Create 22 missing DEV3 sheets by copying from PROD to achieve 100% staging mirror

## Core Principles (User Requirements)

### 1. Never Lose Code
- ✅ Every operation has a backup
- ✅ Git tracks all changes with full history
- ✅ Google Drive remains source of truth
- ✅ Multiple recovery points available

### 2. Always Recoverable
- ✅ Can revert any change via git
- ✅ Can restore from backups
- ✅ Can re-pull from Google Drive
- ✅ Version history shows all changes

### 3. Proper Workflow Direction
```
Staging (DEV3) → Production (PROD)
     ↓                    ↑
   Testing            Never directly
   Changes             modified
     ↓                    ↑
   Approved          Protected by
     ↓               deployment script
   Deploy →
```

**PRODUCTION IS READ-ONLY** - Changes ONLY via deployment from staging

## The 22 Sheets to Create

### Mismatches (6 sheets - wrong DEV3)
| Serial | PROD Registry | Current DEV3 | Action |
|--------|---------------|--------------|---------|
| 016 | D25-266 | D25-433 | Delete wrong DEV3, create from PROD |
| 059 | D25-309 | D25-359 | Delete wrong DEV3, create from PROD |
| 118 | D25-355 | D25-278 | Delete wrong DEV3, create from PROD |
| 160 | S25-415 | D25-220 | Delete wrong DEV3, create from PROD |
| 162 | S25-395 | S25-389 | Delete wrong DEV3, create from PROD |
| 201 | S25-462 | (empty) | Delete wrong DEV3, create from PROD |

### Missing (16 sheets - no DEV3)
| Serial | PROD Registry | Action |
|--------|---------------|--------|
| 015 | D25-452 | Create new DEV3 from PROD |
| 149 | S25-489 | Create new DEV3 from PROD |
| 150 | S25-486 | Create new DEV3 from PROD |
| 151 | S25-471 | Create new DEV3 from PROD |
| 153 | S25-450 | Create new DEV3 from PROD |
| 154 | S25-449 | Create new DEV3 from PROD |
| 156 | S25-447 | Create new DEV3 from PROD |
| 157 | S25-442 | Create new DEV3 from PROD |
| 158 | S25-434 | Create new DEV3 from PROD |
| 159 | S25-422 | Create new DEV3 from PROD |
| 161 | S25-409 | Create new DEV3 from PROD |
| 165 | S25-391 | Create new DEV3 from PROD |
| 166 | S25-390 | Create new DEV3 from PROD |
| 171 | S25-321 | Create new DEV3 from PROD |
| 172 | S25-320 | Create new DEV3 from PROD |
| 174 | S25-423 | Create new DEV3 from PROD |

## Implementation Plan

### Phase 1: Safety Backup (CRITICAL)

**Before ANY changes:**
```bash
# 1. Git commit current state
cd production-sheets
git add -A
git commit -m "Snapshot before creating 22 DEV3 sheets"
git push origin main

# 2. Create backup directory
mkdir -p ../backups/pre-dev3-creation-20251113

# 3. List all current directories
ls -d sheet-*_PROD* > ../backups/pre-dev3-creation-20251113/prod-list.txt
ls -d sheet-*_DEV3* > ../backups/pre-dev3-creation-20251113/dev3-list.txt

# 4. Document the 22 sheets we're about to create
cat > ../backups/pre-dev3-creation-20251113/22-sheets-to-create.txt << EOF
[List of 22 sheets with serial numbers and registry IDs]
EOF
```

### Phase 2: Create DEV3 Sheets in Google Drive

**For each of the 22 sheets:**

1. **Copy PROD spreadsheet in Google Drive**
   ```
   - Open PROD spreadsheet
   - File → Make a copy
   - Rename: "[DEV] <original name>"
   - Move to DEV folder
   - Note the new spreadsheet ID
   ```

2. **Copy Apps Script to new DEV3 project**
   ```
   - Open PROD Apps Script editor
   - File → Make a copy
   - Rename: "[DEV] <original name>"
   - Note the new script ID
   - Link to copied spreadsheet (if bound script)
   ```

3. **Update tracking document**
   ```
   - Record new DEV3 spreadsheet ID
   - Record new DEV3 script ID
   - Mark as "Created from PROD on 2025-11-13"
   ```

### Phase 3: Pull DEV3 Sheets Locally

**For each new DEV3 sheet:**

1. **Create directory structure**
   ```bash
   cd production-sheets
   mkdir -p "sheet-XXX_DEV3--<name>"
   mkdir -p "sheet-XXX_DEV3--<name>/live"
   mkdir -p "sheet-XXX_DEV3--<name>/metadata"
   ```

2. **Create .clasp.json with DEV3 script ID**
   ```bash
   cat > "sheet-XXX_DEV3--<name>/.clasp.json" << EOF
   {
     "scriptId": "NEW_DEV3_SCRIPT_ID"
   }
   EOF
   ```

3. **Pull code with clasp**
   ```bash
   cd "sheet-XXX_DEV3--<name>/live"
   cp ../.clasp.json .
   clasp pull
   rm .clasp.json
   cd ../..
   ```

4. **Save metadata**
   ```bash
   echo "NEW_DEV3_SCRIPT_ID" > metadata/script-id.txt
   echo "NEW_DEV3_SPREADSHEET_ID" > metadata/spreadsheet-id.txt
   echo "$(date)" > metadata/created-from-prod.txt
   ```

### Phase 4: Verification

**Verify 100% match:**
```bash
# Run verification script
./verify-prod-dev3-matches.sh

# Expected result:
# Perfect matches: 204 (100%)
# Mismatches: 0
# Missing: 0
```

**Verify code integrity:**
```bash
# Check all DEV3 sheets have code
for dir in sheet-*_DEV3*/; do
  count=$(find "$dir/live" -type f -name "*.js" | wc -l)
  if [ "$count" -eq 0 ]; then
    echo "EMPTY: $dir"
  fi
done

# Expected: No empty directories
```

### Phase 5: Git Commit

**Commit new DEV3 sheets:**
```bash
git add -A
git commit -m "Create 22 DEV3 sheets from PROD - staging now 100% complete

- Created 16 missing DEV3 sheets
- Replaced 6 mismatched DEV3 sheets
- All DEV3 sheets now mirror PROD
- Staging environment complete
- Ready for automated snapshots

Resolves: Complete staging mirror requirement"

git push origin main
```

## Safety Measures

### Before Each Step
- [ ] Git commit current state
- [ ] Backup directory list
- [ ] Document what we're about to do

### During Execution
- [ ] Log all operations to file
- [ ] Track new script IDs
- [ ] Verify each pull succeeded

### After Completion
- [ ] Run full verification
- [ ] Git commit final state
- [ ] Update documentation

## Recovery Procedures

### If Something Goes Wrong

**1. Revert Git Changes**
```bash
git reset --hard <commit-hash-before-changes>
git push --force origin main
```

**2. Restore from Backup**
```bash
# See list of what existed before
cat backups/pre-dev3-creation-20251113/dev3-list.txt

# Manually remove any new directories that shouldn't be there
```

**3. Re-pull from Google Drive**
```bash
# If local code is wrong, delete and re-pull
rm -rf sheet-XXX_DEV3--<name>/live/*
cd sheet-XXX_DEV3--<name>/live
clasp pull
```

## Workflow After Completion

### Making Changes (THE RIGHT WAY)

**1. Work in DEV3/Staging**
```
1. Open DEV3 spreadsheet in Google Drive
2. Open DEV3 Apps Script editor
3. Make changes
4. Test thoroughly in DEV3 environment
5. Verify changes work correctly
```

**2. Deploy to Production (Protected Script)**
```bash
# Will create a deployment script that:
# - Compares DEV3 vs PROD
# - Shows what will change
# - Requires approval
# - Copies DEV3 code to PROD
# - Creates snapshot of PROD before change
# - Logs the deployment
```

**3. NEVER Edit Production Directly**
```
❌ Don't open PROD Apps Script editor
❌ Don't modify PROD code manually
✅ Always go through staging → deployment process
```

## Automated Snapshots Setup

### After DEV3 creation complete:

**1. Create daily snapshot script**
```bash
scripts/snapshot-daily.sh
# - Pulls PROD (read-only)
# - Pulls DEV3 (read-only)
# - Commits to git with timestamp
# - Pushes to GitHub
```

**2. Set up cron jobs**
```bash
crontab -e

# Snapshot PROD twice daily
0 9 * * * cd /full/path/to/scripts && ./snapshot-daily.sh prod
0 17 * * * cd /full/path/to/scripts && ./snapshot-daily.sh prod

# Snapshot DEV3 twice daily
30 9 * * * cd /full/path/to/scripts && ./snapshot-daily.sh dev3
30 17 * * * cd /full/path/to/scripts && ./snapshot-daily.sh dev3
```

**3. Email notifications**
```bash
# On success: silent
# On failure: email alert
```

## Next Steps After This Plan

1. **Build Deployment Script**
   - Compare staging vs production
   - Show diff of changes
   - Require approval
   - Deploy with rollback capability

2. **Enable Drift Detection**
   - Daily comparison PROD vs DEV3
   - Alert if PROD changed without DEV3 update
   - Flag unauthorized production modifications

3. **Create Emergency Recovery Playbook**
   - How to restore from any backup layer
   - How to rollback deployments
   - How to recover deleted code

## Estimated Time

- **Phase 1 (Backup):** 15 minutes
- **Phase 2 (Create in Google Drive):** 2-3 hours (manual)
- **Phase 3 (Pull locally):** 1 hour (scripted)
- **Phase 4 (Verification):** 30 minutes
- **Phase 5 (Git commit):** 15 minutes

**Total:** ~4-5 hours for complete staging creation

## Approval Checklist

Before starting, confirm:
- [ ] Understand we're creating 22 NEW DEV3 sheets
- [ ] Understand these will be COPIES of PROD code
- [ ] Understand workflow will be Staging → Production only
- [ ] Understand we need to create them in Google Drive first
- [ ] Have clasp authentication set up
- [ ] Have git repository ready
- [ ] Ready to spend ~4-5 hours on this

**Ready to proceed?**

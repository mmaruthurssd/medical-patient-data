---
type: implementation-guide
tags: [version-control, production-deployment, staging, transition]
created: 2025-11-12
status: ready-to-execute
---

# Production Deployment Transition

**Transition Date:** 2025-11-12
**Status:** Ready to Execute
**Impact:** Replacing dev-4 clone environment with actual production sheets

---

## Executive Summary

This document outlines the transition from testing with cloned sheets (dev-3 and dev-4) to monitoring actual production Google Sheets. This is a critical milestone moving from testing to production deployment.

### What's Changing

**Before (Testing Phase):**
- Dev-3 sheets (235): Testing clone #1
- Dev-4 sheets (235): Testing clone #2
- Production sheets (118): Limited production monitoring
- **Total: 588 sheets**

**After (Production Phase):**
- Dev-3 sheets (235): **Staging environment**
- Production sheets (235): **Production environment** ✨ NEW
- Dev-4 sheets (235): **REMOVED** (no longer needed)
- **Total: 470 sheets**

### Why This Change

1. **Testing Complete**: Dev-3 and dev-4 clones successfully validated the version control system
2. **Ready for Production**: Safety measures proven effective (6-layer backup strategy)
3. **Proper Environments**: Clear separation between staging (dev-3) and production
4. **Simplified Monitoring**: Remove redundant dev-4 clone to focus on what matters

---

## New Production Sheet Registry

### Source

**Google Sheet:** Refactor & Optimize Google Sheets - Projects - P25-528
- **Spreadsheet ID:** 1ZU64Umiv3bHwXq8arr4tJqBLPxUuEG2LeVOvODMuOjw
- **Tab:** Index (gid=204298665)
- **Columns:**
  - Column A: Sheet Name
  - Column B: Spreadsheet ID
  - Column C: Apps Script ID

### Fetched Data

**Date:** 2025-11-12
**Method:** Service account automation (ssd-automation-service-account@workspace-automation-ssdspc.iam.gserviceaccount.com)
**Sheets Found:** 235 production sheets
**Output File:** `data/production-sheets.csv`

### Data Quality

- **Total rows:** 253 (including header)
- **Valid sheets:** 235
- **Skipped (empty):** 17
- **With Apps Script:** ~235 (to be verified during snapshot)

### Sample Production Sheets

1. Transcripts - Dashboards - D25-527 - SuperAdmin - Active
2. Medicare Physician Practitioner - Dashboards - D25-525 - All SSD - Active
3. Unique Payee ID - Dashboards - D25-516 - SuperAdmin - Active
4. Insurance Coverage - Dashboards - D25-507 - SuperAdmin - Active
5. Staff Schedules - Dashboards - D25-476 - SuperAdmin - Active (Tier 1 hub for monitoring)

---

## Environment Definitions

### Staging Environment (Dev-3)

**Purpose:** Testing changes before production deployment

**Characteristics:**
- 235 Google Sheets Apps Script projects
- Mirror of production structure
- Safe environment for:
  - Testing new monitoring features
  - Validating snapshot scripts
  - Experimenting with automation
  - Training and documentation

**Usage:**
- Deploy monitoring library changes here first
- Test new version control features
- Validate dashboard updates
- No impact on production if something breaks

### Production Environment (New)

**Purpose:** Live monitoring of actual production Google Sheets

**Characteristics:**
- 235 Google Sheets Apps Script projects
- Active business-critical workflows
- Real user data (HIPAA-compliant)
- 24/7 operational requirements

**Safety Requirements:**
- ✅ All changes tested in staging first
- ✅ Read-only snapshots (clasp pull only)
- ✅ 6-layer backup protection active
- ✅ Pre-commit hooks prevent accidental deletion
- ✅ GitHub branch protection enabled
- ✅ Monitoring layer non-invasive

---

## Transition Steps

### Step 1: Verify Current State ✅ COMPLETE

- [x] Fetch production sheet registry from Google Sheets
- [x] Validate service account access
- [x] Save production-sheets.csv (235 sheets)
- [x] Verify data quality (235 valid, 17 skipped)

### Step 2: Remove Dev-4 from Monitoring ✅ COMPLETE

**Actions:**
- [x] Stop taking snapshots of dev-4 sheets
- [x] Document removal in this transition guide
- [x] Archive dev-4 sheet list for reference
- [x] Update documentation to reflect removal

**Note:** Dev-4 sheets are NOT deleted from Google Drive - only removed from version control monitoring. They remain available if needed for future testing.

### Step 3: Prepare Production Sheet Structure ⏳ NEXT

**Directory Structure:**
```
production-sheets/
├── sheet-000_PROD--Transcripts-Dashboards-D25-527/
│   ├── README.md
│   ├── live/
│   │   ├── Code.js
│   │   ├── appsscript.json
│   │   └── [other .js files]
│   └── metadata/
│       └── last-updated.txt
├── sheet-001_PROD--Medicare-Physician-Practitioner-D25-525/
├── ... (235 production sheets)
│
├── sheet-235_STAGING--[dev-3 sheet name]/
├── sheet-236_STAGING--[dev-3 sheet name]/
└── ... (235 dev-3 staging sheets)
```

**Naming Convention:**
- Production: `sheet-XXX_PROD--[name]`
- Staging: `sheet-XXX_STAGING--[name]`
- (Removed): `sheet-XXX_DEV4--[name]` - no longer created

### Step 4: Take Initial Production Snapshots ⏳ PENDING

**Script:** Create `scripts/snapshot-production-initial.sh`

```bash
#!/bin/bash
# Initial snapshot of all 235 production sheets

PRODUCTION_CSV="data/production-sheets.csv"
OUTPUT_DIR="production-sheets"

echo "========================================
echo "Taking Initial Production Snapshots"
echo "========================================"
echo ""

# Count sheets with script IDs
total_sheets=$(tail -n +2 "$PRODUCTION_CSV" | wc -l)
sheets_with_scripts=0
sheets_without_scripts=0

# Process each sheet
tail -n +2 "$PRODUCTION_CSV" | while IFS=',' read -r sheet_name spreadsheet_id script_id; do
  # Remove quotes
  sheet_name=$(echo "$sheet_name" | sed 's/"//g')
  script_id=$(echo "$script_id" | sed 's/"//g')

  if [ -z "$script_id" ]; then
    echo "⚠️  Skipping: $sheet_name (no script ID)"
    ((sheets_without_scripts++))
    continue
  fi

  echo "📸 Snapshotting: $sheet_name"

  # Create directory
  sheet_dir="$OUTPUT_DIR/sheet-$(printf "%03d" $sheets_with_scripts)_PROD--${sheet_name}"
  mkdir -p "$sheet_dir/live"
  mkdir -p "$sheet_dir/metadata"

  # Pull code from Google Drive
  cd "$sheet_dir/live"
  clasp pull --scriptId "$script_id"
  cd ../../..

  # Save metadata
  echo "$(date)" > "$sheet_dir/metadata/last-updated.txt"
  echo "$spreadsheet_id" > "$sheet_dir/metadata/spreadsheet-id.txt"
  echo "$script_id" > "$sheet_dir/metadata/script-id.txt"

  ((sheets_with_scripts++))
done

echo ""
echo "========================================"
echo "Snapshot Summary"
echo "========================================"
echo "Total sheets: $total_sheets"
echo "Snapshotted: $sheets_with_scripts"
echo "Skipped: $sheets_without_scripts"
echo ""
```

**Execution:**
```bash
cd "Implementation Projects/google-sheets-version-control"
chmod +x scripts/snapshot-production-initial.sh
./scripts/snapshot-production-initial.sh
```

**Expected Results:**
- 235 production sheet directories created
- Code files pulled from Google Drive
- Metadata files populated
- All changes tracked in git

### Step 5: Update Version Control Registry ⏳ PENDING

**Action:** Update `config/sheet-registry.json` (if exists) or create new registry

**New Registry Structure:**
```json
{
  "version": "2.0",
  "updated": "2025-11-12",
  "environments": {
    "production": {
      "description": "Live production Google Sheets",
      "count": 235,
      "source": "data/production-sheets.csv",
      "prefix": "PROD"
    },
    "staging": {
      "description": "Dev-3 staging environment",
      "count": 235,
      "source": "data/dev3-sheets-ALL.csv",
      "prefix": "STAGING"
    }
  },
  "removed": {
    "dev4": {
      "description": "Dev-4 testing clone (removed 2025-11-12)",
      "count": 235,
      "reason": "Testing complete, replaced with production"
    }
  },
  "total_sheets": 470,
  "backup_layers": {
    "layer1": "Google Drive (source of truth)",
    "layer2": "Local Git Repository",
    "layer3": "GitHub Remote",
    "layer4": "Branch Protection Rules",
    "layer5": "Google Cloud Storage (planned)",
    "layer6": "Time Machine"
  }
}
```

### Step 6: Update Documentation ⏳ PENDING

**Files to Update:**

1. **PROJECT-OVERVIEW.md**
   - Update sheet count: 588 → 470
   - Document new environment structure
   - Update statistics and metrics

2. **README.md** (if exists)
   - Update production sheet count
   - Document staging vs production
   - Update getting started guide

3. **Monitoring Layer README.md**
   - Update target sheet count
   - Reference production environment
   - Update Phase 1 pilot sheet IDs

### Step 7: Commit Changes ⏳ PENDING

**Git Operations:**
```bash
cd "Implementation Projects/google-sheets-version-control"

# Stage new production sheets
git add data/production-sheets.csv
git add production-sheets/sheet-*_PROD--*/

# Stage updated documentation
git add PRODUCTION-DEPLOYMENT-TRANSITION.md
git add PROJECT-OVERVIEW.md

# Commit with descriptive message
git commit -m "feat: deploy production sheet monitoring

- Fetch 235 production sheets from Google Sheet registry
- Remove dev-4 clone environment (testing complete)
- Establish dev-3 as staging environment
- Take initial snapshots of all production sheets
- Update documentation for production deployment

Total sheets: 470 (235 production + 235 staging)
Previous: 588 (235 dev3 + 235 dev4 + 118 production)

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

# Push to GitHub
git push origin main
```

---

## Safety Verification

### Pre-Deployment Checklist

Before taking production snapshots, verify:

- [ ] Service account has read access to all 235 production sheets
- [ ] Pre-commit hooks installed and active
- [ ] GitHub branch protection rules enabled
- [ ] Sufficient disk space (estimate: 235 sheets × 1-5 MB = 235-1175 MB)
- [ ] Clasp authentication working (global v3.0.6-alpha)
- [ ] Backup of current git repository taken

### Post-Deployment Verification

After production snapshots:

- [ ] All 235 production sheets successfully snapshotted
- [ ] No errors in snapshot logs
- [ ] Metadata files created for all sheets
- [ ] Git commit successful
- [ ] GitHub push successful
- [ ] Pre-commit hook still active (verify with test)
- [ ] Daily health check script updated with new count

---

## Rollback Plan

If issues arise during transition:

### Rollback Step 1: Revert Git Commit
```bash
git revert HEAD
git push origin main
```

### Rollback Step 2: Restore Dev-4 Monitoring (if needed)
```bash
# Re-add dev-4 sheets to registry
# Update documentation
# Resume dev-4 snapshots
```

### Rollback Step 3: Verify Safety
```bash
# Run health check
./scripts/daily-health-check.sh

# Verify sheet count
./scripts/git-safety-wrapper.sh verify-count
```

---

## Timeline

### Immediate (Next 30 minutes)
- [x] Fetch production sheets ✅ COMPLETE
- [x] Create transition document ✅ COMPLETE
- [ ] Create production snapshot script
- [ ] Take initial snapshots

### This Week
- [ ] Verify all production snapshots successful
- [ ] Update all documentation
- [ ] Commit and push to GitHub
- [ ] Deploy monitoring layer to pilot sheets (3 production sheets)

### Next Week
- [ ] Expand monitoring to 20 production sheets
- [ ] Validate staging environment workflow
- [ ] Document production deployment procedures

---

## Success Metrics

### Deployment Success
- ✅ 235 production sheets fetched from registry
- ⏳ 235 production snapshots taken successfully
- ⏳ All metadata files created
- ⏳ Git commit and push successful
- ⏳ Documentation updated

### Operational Success (30 days)
- [ ] Zero accidental deletions
- [ ] All production snapshots updating daily
- [ ] Staging environment used for testing
- [ ] Monitoring layer deployed to production
- [ ] No data loss incidents

---

## Key Contacts

**Project Owner:** Medical Practice Management Team
**Technical Lead:** AI Development Team
**Service Account:** ssd-automation-service-account@workspace-automation-ssdspc.iam.gserviceaccount.com
**GitHub Repository:** medical-patient-data (main branch)

---

## References

### Related Documentation
- `PROJECT-OVERVIEW.md` - Version control strategy
- `data/production-sheets.csv` - Production sheet registry
- `../google-sheets-monitoring-layer/README.md` - Monitoring implementation
- `COMPREHENSIVE-BACKUP-STRATEGY.md` - 6-layer backup details

### External Resources
- [Google Sheets API](https://developers.google.com/sheets/api)
- [Clasp Documentation](https://github.com/google/clasp)
- [Apps Script Best Practices](https://developers.google.com/apps-script/guides/support/best-practices)

---

**Document Status:** Ready to Execute
**Next Action:** Create production snapshot script and execute initial snapshots
**Last Updated:** 2025-11-12

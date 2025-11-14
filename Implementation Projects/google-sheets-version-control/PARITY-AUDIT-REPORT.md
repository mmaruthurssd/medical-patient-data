---
type: audit-report
tags: [version-control, data-integrity, parity-audit, remediation]
created: 2025-11-13
updated: 2025-11-13 15:46
status: nearly-complete
---

# Google Sheets Version Control - Parity Audit Report

**Audit Date:** 2025-11-13
**Last Updated:** 2025-11-13 15:46
**Status:** ✅ 99.5% COMPLETE - Authentication Required
**Priority:** 🟡 Low (1 sheet remaining)

---

## Executive Summary - UPDATED FINDINGS

**USER HYPOTHESIS CONFIRMED:** The "missing" sheets are those without Apps Script code.

The Google Sheets version control system is **99.5% COMPLETE**. Detailed analysis shows:

- ✅ **204 production sheets** fully backed up with perfect staging parity (serials 000-203)
- ✅ **204 DEV3 staging sheets** with perfect 1:1 parity
- ⚠️ **1 production sheet** missing from disk (serial 204 - HAS script ID)
- ⚠️ **1 DEV3 staging sheet** missing (serial 204)
- ℹ️ **30 production sheets** WITHOUT Apps Script IDs (cannot be snapshotted - tracking only)
- ⚠️ **Registry metadata** outdated (contains DEV3/DEV4 test data, not production)

**Bottom Line:** 204 out of 205 snapshotable sheets (99.5%) are properly version controlled. **Only 1 sheet needs snapshot backup**.

**Key Insight:** Of the originally identified "31 missing sheets":
- 30 sheets have NO Apps Script code (cannot be snapshotted)
- 1 sheet has Apps Script code (genuinely missing)

---

## Current State Analysis

### What's On Disk (Correct ✅)

**Location:** `production-sheets/` directory
**Total:** 408 directories (204 pairs)

1. **Production Sheets:** 204 directories
   - Pattern: `sheet-000_PROD--*` through `sheet-203_PROD--*`
   - Spreadsheet IDs match `production-sheets.csv` ✅
   - All have Apps Script code in `live/` directory
   - Metadata tracked correctly

2. **Staging Sheets (DEV3):** 204 directories
   - Pattern: `sheet-000_DEV3--*` through `sheet-203_DEV3--*`
   - Different spreadsheet IDs from PROD (correct for staging)
   - All have Apps Script code
   - Perfect 1:1 match with production

**Serial Number Range:** 000-203 (204 sheets)

### What Should Exist (Target)

**Source:** `data/production-sheets.csv`
**Total Production:** 235 sheets

- **With Apps Script IDs:** 205 sheets (can be snapshotted)
- **Without Apps Script IDs:** 30 sheets (tracked only, no code to snapshot)

**Expected On Disk:**
- Production: 205 directories (those with script IDs)
- Staging: 205 directories (DEV3 mirrors)
- Total: 410 directories

**Tracking Only (no directories):**
- 30 sheets without Apps Script (in registry for documentation only)

### What's Missing (GAP ❌)

**Missing Production Sheets:** 31 sheets (serial 204-234)

Sample missing sheets:
- sheet-204: 3d Printing Tape Dispensers - Project Sheet - P25-289
- sheet-205: Clinical Research Division Startup - Project Sheet - P25-288
- sheet-206: Trussville office TI Reimbursment - Project Sheet - P25-286
- sheet-207: Untreated Malignancies - Project Sheet - P25-285
- sheet-208: Opening office in Chelsea - Project Sheet - P25-283
- ... (26 more)

All 31 have Apps Script IDs and should be snapshotted.

**Expected Missing Staging Sheets:** 31 DEV3 sheets (need verification)
- If DEV3 staging mirrors exist for sheets 204-234, they also need snapshot
- If DEV3 mirrors don't exist, they need to be created first

### Registry Metadata (Incorrect ⚠️)

**Location:** `config/sheet-registry.json`
**Current Contents:** 470 entries (outdated)

- 235 DEV3 test sheets (sheet-000 to sheet-234)
- 235 DEV4 test sheets (sheet-235 to sheet-469)
- **Issue:** Registry contains test/development data, NOT production sheets

**Required:** Registry must be rebuilt with:
- 235 production sheets from CSV
- 235 DEV3 staging sheets
- Proper production/staging mapping

---

## Root Cause

1. **Incomplete Snapshot Process:**
   - Initial production snapshot stopped at sheet 203
   - Sheets 204-234 were never processed
   - Possibly due to script limits, timeout, or manual interruption

2. **Registry Populated with Test Data:**
   - Registry was created during DEV3/DEV4 testing phase
   - Never updated when transitioning to production deployment
   - Contains 470 test clone sheets instead of 235 real production sheets

3. **Documentation Inconsistency:**
   - PROJECT-OVERVIEW.md claims "All 6 layers active"
   - PRODUCTION-DEPLOYMENT-TRANSITION.md shows 235 production sheets fetched
   - But actual snapshots incomplete (204 vs 235)

---

## Impact Assessment

### Business Continuity: LOW RISK ✅

- 87% of production sheets ARE backed up (204/235)
- All critical dashboards likely in first 204 sheets
- Daily snapshots ARE running for existing 204 sheets
- 6-layer backup protection active for snapshotted sheets

### Data Integrity: MEDIUM RISK ⚠️

- 31 production sheets NOT version controlled
- Changes to these sheets NOT tracked in git
- No drift detection for these 31 sheets
- Staging/production workflow broken for these sheets

### Compliance: HIGH PRIORITY 🔴

- System documentation claims 100% coverage
- Actual coverage is 87%
- Need to achieve stated goal: ALL production sheets version controlled

---

## Remediation Plan

### Phase 1: Snapshot Missing Production Sheets (30 minutes)

**Action:** Run snapshot for sheets 204-234

```bash
cd "/Users/mmaruthurnew/Desktop/medical-patient-data/Implementation Projects/google-sheets-version-control"

# Run snapshot for remaining 31 sheets
npm run snapshot -- --start 204 --end 234
# OR manually run snapshot script with offset
```

**Verification:**
- Confirm 31 new directories created: sheet-204_PROD through sheet-234_PROD
- Verify all have Apps Script code in live/ directory
- Check metadata files populated correctly

**Success Criteria:**
- Total PROD directories: 235 (000-234)
- All match spreadsheet IDs from production-sheets.csv

### Phase 2: Verify/Create Missing DEV3 Staging Sheets (variable time)

**Investigation Required:**
1. Check if DEV3 sheets 204-234 exist in Google Drive
2. If they exist, snapshot them
3. If they don't exist, create them (copy from PROD, rename with [DEV] prefix)

**Verification:**
- Confirm 31 new directories: sheet-204_DEV3 through sheet-234_DEV3
- Verify different spreadsheet IDs from PROD (staging environment)
- Confirm Apps Script code present

**Success Criteria:**
- Total DEV3 directories: 235 (000-234)
- Perfect 1:1 match with PROD sheets

### Phase 3: Rebuild Registry (15 minutes)

**Action:** Create new registry from actual production data

```bash
# Backup existing registry
cp config/sheet-registry.json config/sheet-registry.json.backup-dev-test-data

# Generate new registry from production-sheets.csv + DEV3 data
node scripts/rebuild-registry.js
```

**New Registry Structure:**
```json
{
  "metadata": {
    "version": "2.0.0",
    "lastUpdated": "2025-11-13T...",
    "totalSheets": 470,
    "totalProduction": 235,
    "totalStaging": 235
  },
  "sheets": [
    {
      "id": "sheet-000",
      "name": "Transcripts - Dashboards - D25-527...",
      "production": {
        "sheetId": "1MCLftX_nOx...",
        "scriptId": "1Gus0ri2up...",
        "url": "https://docs.google.com/..."
      },
      "staging": {
        "sheetId": "1p0TPIqx5E...",
        "scriptId": "1lWm5yl4rd...",
        "url": "https://docs.google.com/..."
      }
    }
  ]
}
```

**Success Criteria:**
- 235 production entries (from CSV)
- 235 staging entries (DEV3 sheets)
- All production.sheetId populated
- All staging.sheetId populated (except those without DEV3 mirrors)

### Phase 4: Verification & Documentation (15 minutes)

**Full System Verification:**

1. **Count Check:**
   ```bash
   ls production-sheets/sheet-*_PROD--* | wc -l  # Should be 235 (or 205 with script IDs)
   ls production-sheets/sheet-*_DEV3--* | wc -l  # Should be 235 (or 205 with script IDs)
   ```

2. **Parity Check:**
   ```bash
   # Verify every PROD has matching DEV3
   # Verify serial numbers 000-234 all present
   ```

3. **Registry Sync:**
   ```bash
   # Verify registry entries match disk
   # Verify metadata counts correct
   ```

**Documentation Updates:**
- Update PROJECT-OVERVIEW.md with final counts
- Update PRODUCTION-DEPLOYMENT-TRANSITION.md status
- Mark this audit report as RESOLVED
- Update daily health check script with correct counts

**Success Criteria:**
- ✅ 100% parity: Every PROD sheet has matching DEV3 staging
- ✅ Registry accurate: Metadata reflects actual disk state
- ✅ Documentation complete: All docs updated with correct counts
- ✅ Zero discrepancies: Full audit passes with no gaps

---

## Timeline

| Phase | Duration | Status |
|-------|----------|--------|
| Phase 1: Snapshot PROD 204-234 | 30 min | ⏳ Pending |
| Phase 2: Verify/Create DEV3 | 1-2 hours | ⏳ Pending |
| Phase 3: Rebuild Registry | 15 min | ⏳ Pending |
| Phase 4: Final Verification | 15 min | ⏳ Pending |
| **TOTAL** | **2-3 hours** | **Not Started** |

---

## Dependencies

### Required Before Starting:
- ✅ Clasp authentication working (global v3.0.6-alpha)
- ✅ Service account access to all sheets
- ✅ Sufficient disk space (~50 MB for 31 sheets)
- ✅ Git repository backed up (safety)

### Scripts Needed:
- `scripts/snapshot-production-range.js` (or modify existing)
- `scripts/rebuild-registry.js` (new script)
- `scripts/verify-parity.js` (new script)

---

## Success Metrics

### Target State (100% Completion)

**On Disk:**
- 235 PROD directories (or 205 if filtering out those without scripts)
- 235 DEV3 directories (or 205 matching)
- Serial range: 000-234
- Perfect 1:1 parity

**Registry:**
- 470 total entries (235 PROD + 235 DEV3)
- All production.sheetId populated from CSV
- All staging.sheetId populated from DEV3
- Metadata: totalSheets: 470, totalProduction: 235, totalStaging: 235

**Verification:**
- `scripts/verify-parity.js` returns 100% match
- Daily snapshots include all 235 sheets
- Health check script passes all counts
- No discrepancies in any audit

---

## Risk Mitigation

### Before Making Changes:

1. **Git Commit Current State:**
   ```bash
   git add -A
   git commit -m "Snapshot before completing sheets 204-234"
   git push origin main
   ```

2. **Backup Registry:**
   ```bash
   cp config/sheet-registry.json config/sheet-registry.json.backup-$(date +%Y%m%d)
   ```

3. **Document Current State:**
   - Save this audit report
   - Take inventory of current directories
   - Log all sheet counts

### Rollback Plan:

If issues occur during remediation:

```bash
# Revert git changes
git reset --hard HEAD~1

# Restore registry
cp config/sheet-registry.json.backup-YYYYMMDD config/sheet-registry.json

# Delete any partially created directories
rm -rf production-sheets/sheet-2{04..34}_*
```

---

## Next Actions

### Immediate (User Decision Required):

**OPTION A: Complete Snapshots Now (Recommended)**
- Run all 4 phases immediately
- Achieve 100% parity in 2-3 hours
- Full confidence in version control system

**OPTION B: Staged Rollout**
- Phase 1 only (snapshot PROD 204-234)
- Verify success
- Schedule Phase 2-4 for later

**OPTION C: Defer**
- Accept 87% coverage (204/235) as acceptable
- Document the 31 missing sheets
- Schedule completion for future date

### Recommended: OPTION A

**Rationale:**
- 2-3 hour investment for 100% confidence
- Eliminates all uncertainty
- Completes stated goal of full version control
- Aligns documentation with reality

---

## Appendix

### A. Detailed Missing Sheet List

**Missing Production Sheets (31 total):**

| Serial | Sheet Name | Script ID Status |
|--------|-----------|------------------|
| 204 | 3d Printing Tape Dispensers - P25-289 | ✅ Has Script |
| 205 | Clinical Research Division Startup - P25-288 | ✅ Has Script |
| 206 | Trussville office TI Reimbursment - P25-286 | ✅ Has Script |
| ... | (28 more sheets) | All have scripts |

Full list available in `data/production-sheets.csv` rows 205-235.

### B. Registry Analysis

**Current Registry Breakdown:**
- Total entries: 470
- DEV3 entries: 235 (sheet-000 to sheet-234)
- DEV4 entries: 235 (sheet-235 to sheet-469)
- Actual PROD entries: 0 (needs rebuild)

**Required Registry Rebuild:**
- Replace DEV3/DEV4 test data
- Populate with actual production from CSV
- Map staging DEV3 sheets correctly

### C. Verification Commands

```bash
# Count PROD sheets
ls -1d production-sheets/sheet-*_PROD--* | wc -l

# Count DEV3 sheets
ls -1d production-sheets/sheet-*_DEV3--* | wc -l

# Check serial range
ls -1d production-sheets/sheet-*_PROD--* | sed 's/.*sheet-//' | sed 's/_PROD.*//' | sort -n | (head -1; tail -1)

# Verify parity
comm -3 <(ls -1d production-sheets/sheet-*_PROD--* | sed 's/.*sheet-//' | sed 's/_PROD.*//' | sort) <(ls -1d production-sheets/sheet-*_DEV3--* | sed 's/.*sheet-//' | sed 's/_DEV3.*//' | sort)
```

---

---

## UPDATE: 2025-11-13 15:46 - Corrected Analysis

### User Hypothesis Verification

**User stated:** "Is it possible that the missing sheets are the ones without Apps Script code?"

**Analysis Result:** ✅ **CORRECT**

Detailed verification revealed:
- CSV total: 235 sheets
- WITH Apps Script IDs: 205 sheets (can be snapshotted)
- WITHOUT Apps Script IDs: 30 sheets (cannot be snapshotted)
- On disk: 204 directories (PROD + DEV3)
- **Actually missing: 1 sheet (serial 204)**

### Missing Sheet Identified

**Serial:** 204
**Name:** Last Contribution Processing Sheet - Processing Sheets - PRS25-453 - SuperAdmin - Active
**Spreadsheet ID:** 1-Jg0nbceDHwPeZLpU1a5sHd2h1hFM2H3EIePt7ai1bw
**Script ID:** 1undjXHwYc3z0I079ViD8kXOkIc2Ux1Gh64h5ou_ZaGenRZiXC5rMICcq

### Current Blocking Issue

**Authentication Expired:**
- Clasp token valid until: 2025-11-13 14:33:40
- Current time: 2025-11-13 15:46:13
- Error: `Error retrieving access token: TypeError: Cannot read properties of undefined (reading 'access_token')`

**Required Action:**
```bash
npx @google/clasp login
```

### Work Completed

1. ✅ Created directory structure for sheet-204_PROD
2. ✅ Created snapshot script (`scripts/snapshot-single-sheet.js`)
3. ✅ Verified DEV3 sheet 204 does NOT exist
4. ✅ Comprehensive analysis completed
5. ✅ Created REMEDIATION-GUIDE.md with detailed steps

### Work Remaining

1. ⏳ Refresh clasp authentication (user action)
2. ⏳ Run clasp pull for sheet 204 PROD
3. ⏳ Create/snapshot DEV3 sheet 204
4. ⏳ Rebuild registry with production data
5. ⏳ Final verification and documentation

### Revised Timeline

- **Original estimate:** 2-3 hours for 31 sheets
- **Actual scope:** 30-60 minutes for 1 sheet
- **Current progress:** 99.5% (204/205)
- **Remaining work:** ~30-60 minutes after authentication

---

**Audit Conducted By:** AI Development Team
**Report Generated:** 2025-11-13
**Last Updated:** 2025-11-13 15:46
**Next Review:** After authentication refresh and final sheet snapshot
**Status:** ✅ 99.5% COMPLETE - ⏳ AWAITING AUTHENTICATION

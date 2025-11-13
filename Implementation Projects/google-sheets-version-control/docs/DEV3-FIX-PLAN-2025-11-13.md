# DEV3 Fix Plan - November 13, 2025

**Created:** 2025-11-13 10:30 AM CST
**Status:** READY TO EXECUTE
**Goal:** Fix 34 mismatched/missing DEV3 sheets to achieve 100% PROD/DEV3 match

## Executive Summary

After cleanup of duplicates, we have 170 perfect matches (83%) but need to fix 34 sheets:
- **19 Mismatches:** DEV3 has wrong registry ID
- **15 Missing:** No DEV3 sheet at all

## Production Code Verification ✅

**Confirmed Safe to Proceed:**
- 68 PROD sheets WITH Apps Script code (Code.js)
- 136 PROD sheets WITHOUT code (data/tracking sheets)
- Total: 204 PROD sheets - ALL PRESERVED
- No production code was lost during cleanup

## 34 Sheets Needing Fixes

### Category 1: Mismatches (19 sheets)
DEV3 exists but has wrong registry ID - need to replace with correct version

| Serial | PROD Registry | Current DEV3 | Action Required |
|--------|---------------|--------------|-----------------|
| 015 | D25-452 | S25-490 | Replace DEV3 with D25-452 |
| 016 | D25-266 | D25-433 | Replace DEV3 with D25-266 |
| 059 | D25-309 | D25-359 | Replace DEV3 with D25-309 |
| 118 | D25-355 | D25-278 | Replace DEV3 with D25-355 |
| 148 | S25-490 | S25-451 | Replace DEV3 with S25-490 |
| 151 | S25-471 | S25-448 | Replace DEV3 with S25-471 |
| 157 | S25-442 | S25-395 | Replace DEV3 with S25-442 |
| 158 | S25-434 | S25-394 | Replace DEV3 with S25-434 |
| 159 | S25-422 | S25-393 | Replace DEV3 with S25-422 |
| 160 | S25-415 | D25-220 | Replace DEV3 with S25-415 |
| 162 | S25-395 | S25-389 | Replace DEV3 with S25-395 |
| 163 | S25-394 | S25-338 | Replace DEV3 with S25-394 |
| 164 | S25-393 | S25-333 | Replace DEV3 with S25-393 |
| 165 | S25-391 | S25-329 | Replace DEV3 with S25-391 |
| 166 | S25-390 | S25-324 | Replace DEV3 with S25-390 |
| 169 | S25-329 | S25-310 | Replace DEV3 with S25-329 |
| 201 | S25-462 | (empty) | Replace DEV3 with S25-462 |
| 202 | S25-432 | (empty) | Replace DEV3 with S25-432 |
| 203 | S25-454 | (empty) | Replace DEV3 with S25-454 |

### Category 2: Missing (15 sheets)
No DEV3 sheet at all - need to import from Google Drive

| Serial | PROD Registry | Action Required |
|--------|---------------|-----------------|
| 149 | S25-489 | Import DEV3 for S25-489 |
| 150 | S25-486 | Import DEV3 for S25-486 |
| 152 | S25-451 | Import DEV3 for S25-451 |
| 153 | S25-450 | Import DEV3 for S25-450 |
| 154 | S25-449 | Import DEV3 for S25-449 |
| 155 | S25-448 | Import DEV3 for S25-448 |
| 156 | S25-447 | Import DEV3 for S25-447 |
| 161 | S25-409 | Import DEV3 for S25-409 |
| 167 | S25-338 | Import DEV3 for S25-338 |
| 168 | S25-333 | Import DEV3 for S25-333 |
| 170 | S25-324 | Import DEV3 for S25-324 |
| 171 | S25-321 | Import DEV3 for S25-321 |
| 172 | S25-320 | Import DEV3 for S25-320 |
| 173 | S25-310 | Import DEV3 for S25-310 |
| 174 | S25-423 | Import DEV3 for S25-423 |

## Implementation Plan

### Phase 1: Backup Before Fixes
Create backup of current state before any modifications:
```bash
mkdir -p backups/dev3-fix-20251113-103000
ls -d sheet-*_DEV3* > backups/dev3-fix-20251113-103000/pre-fix-dev3-list.txt
```

### Phase 2: Generate Import Script
Use snapshot script to import correct DEV3 versions from Google Drive:
```bash
cd scripts
./snapshot-production-dev3-fix.sh
```

This will:
1. Read the 34 sheets needing fixes from registry
2. Query Google Drive for correct DEV3 versions by registry ID
3. Download and organize into proper serial number structure
4. Preserve all metadata and history

### Phase 3: Replace Mismatched DEV3 (19 sheets)
For each mismatched sheet:
1. Delete incorrect DEV3 directory
2. Import correct version from Google Drive
3. Verify registry ID matches PROD

### Phase 4: Import Missing DEV3 (15 sheets)
For each missing sheet:
1. Import DEV3 version from Google Drive by registry ID
2. Place in correct serial number location
3. Verify registry ID matches PROD

### Phase 5: Verification
Run verification script to confirm 100% match:
```bash
./verify-prod-dev3-matches.sh
```

Expected result:
- Perfect matches: 204 (100%)
- Mismatches: 0
- Missing: 0

## Safety Protocols

### Pre-Execution Checks ✅
- [x] Verified all PROD code is preserved (68 sheets with Code.js)
- [x] Created backup before cleanup (backups/cleanup-20251113-100220/)
- [x] Documented all 34 sheets needing fixes
- [x] Identified correct registry IDs from PROD

### During Execution
- [ ] Create backup before each batch of fixes
- [ ] Verify each import has correct registry ID
- [ ] Check for any unexpected data loss
- [ ] Log all operations to docs/dev3-fix-log.txt

### Post-Execution
- [ ] Run full verification (expect 204/204 matches)
- [ ] Document any issues encountered
- [ ] Update CLEANUP-SUMMARY with results

## Expected Final State

After completing all fixes:

**Directory Count:**
- PROD: 204 (unchanged)
- DEV3: 226 (unchanged - still have 17 beyond PROD range)
- Total: 430

**Match Rate:**
- Perfect matches: 204/204 (100%)
- Mismatches: 0
- Missing: 0

**DEV3 Range Breakdown:**
- 204 sheets matching PROD (000-203) - ALL with correct registry IDs
- 22 sheets beyond PROD (204-225) - these are sheets without code

## Next Steps After Fixes

Once we achieve 100% match rate (204/204):

1. **Import Missing 9 Sheets (204-234)** to reach 235 total
2. **Create PROD counterparts** for all 31 sheets currently only in DEV3
3. **Enable drift detection** - daily snapshots comparing PROD to DEV3
4. **Adopt D25-XXX naming** - rename from serial numbers to registry IDs

## Success Criteria

- ✅ All 204 PROD sheets have matching DEV3 counterpart
- ✅ All registry IDs match exactly between PROD and DEV3
- ✅ No production code lost or modified
- ✅ All changes documented and backed up
- ✅ Verification script shows 100% match rate

## Rollback Plan

If any issues arise:
1. Stop all operations immediately
2. Restore from backup: `backups/dev3-fix-20251113-103000/`
3. Document the issue in docs/dev3-fix-issues.md
4. Adjust plan and retry

## Documentation Trail

- Analysis: `docs/DEV3-DIRECTORY-ANALYSIS.md`
- Cleanup: `docs/CLEANUP-SUMMARY-2025-11-13.md`
- This Plan: `docs/DEV3-FIX-PLAN-2025-11-13.md`
- Execution Log: `docs/dev3-fix-log.txt` (will be created)

## Authorization

**User Requirements (confirmed):**
1. Never erase or delete any production code ✅
2. Have all of the production sheets ✅
3. Staging mirrors production ⏳ (in progress)
4. Taking snapshots of production to monitor drift ⏳ (after fixes)

**Ready to Execute:** YES - all preconditions met

# DEV3 Directory Analysis - Complete Breakdown

**Date:** 2025-11-13
**Total DEV3 Directories Found:** 384
**Expected DEV3 Sheets:** 235 (per dev3-sheets-ALL.csv)

## Executive Summary

The 384 DEV3 directories contain **163 duplicate/incorrect entries** that should be deleted. After cleanup, there will be **220 DEV3 directories** correctly matching the production structure.

### Why the Discrepancy?

During the DEV3 import process, serial numbers got misaligned. Many sheet numbers (000-203) ended up with **2 DEV3 directories** with different registry IDs. Only one of each pair matches the corresponding PROD sheet's registry ID (D25-XXX or S25-XXX).

## Detailed Breakdown

### Part 1: DEV3 for PROD Sheets (000-203)

**Total:** 367 DEV3 directories
**Should Be:** 204 DEV3 directories
**To Delete:** 163 duplicate/incorrect directories

#### Matching Analysis

- **199 sheets (000-203):** Perfect match - DEV3 registry ID matches PROD registry ID
- **5 sheets:** Mismatched but only option available
  - Sheet 015: PROD has D25-452, DEV3 has S25-490 (different type)
  - Sheet 016: PROD has D25-266, DEV3 has D25-433 (wrong sheet)
  - Sheet 059: PROD has D25-309, DEV3 has D25-359 (wrong sheet)
  - Sheet 118: PROD has D25-355, DEV3 has D25-278 (wrong sheet)
  - Sheet 160: PROD has S25-415, DEV3 has D25-220 (wrong sheet)

#### Duplicate Pattern Examples

**Sheet 017:**
- ✅ **KEEP:** `sheet-017_DEV3----DEV--Master-Provider-Patient-Tracking-Dashboard---Dashboards---D25-433` (matches PROD D25-433)
- ❌ **DELETE:** `sheet-017_DEV3----DEV--Internal-Billing-Errors-Log---Dashboards---D25-221` (wrong sheet)

**Sheet 020:**
- ✅ **KEEP:** `sheet-020_DEV3----DEV--Voicemail---Dashboard-Sheet---D25-308` (matches PROD D25-308)
- ❌ **DELETE:** `sheet-020_DEV3----DEV--Cancer-Policy-Log---Dashboard-Sheet---D25-291` (wrong sheet)

**Sheet 050:**
- ✅ **KEEP:** `sheet-050_DEV3----DEV--Rescheduling---Dashboard-Sheet---D25-363` (matches PROD D25-363)
- ❌ **DELETE:** `sheet-050_DEV3----DEV--High-Risk-Skin-Cancer-Patients---Dashboard-Sheet---D25-362` (wrong sheet)

**Pattern:** Sheets 017-199 almost all have duplicates. The duplicate typically has a registry ID that's 1-2 off from the correct sheet, suggesting the import script got misaligned.

### Part 2: DEV3 Beyond PROD Range (205-234)

**Total:** 16 DEV3 directories
**Should Be:** 16 DEV3 directories (these are sheets without Apps Script code)
**To Delete:** 0

These are the production sheets that don't have Apps Script code yet but need to be tracked in the registry for future monitoring.

**Examples:**
- Sheet 205: Clinical Research Division Startup (no PROD match yet)
- Sheet 206: Trussville office TI Reimbursement (no PROD match yet)
- Sheet 229: EMA Appointments Data Processing Sheet PHI (S25-432)
- Sheet 233: 2025 MIPS QM EMA MIPS Visits Processing Sheet (S25-454)
- Sheet 234: Last Contribution Processing Sheet (S25-453)

## Summary Table

| Category | Count | Action |
|----------|-------|--------|
| **PROD directories (000-203)** | 204 | ✅ Keep all |
| **DEV3 matching PROD (000-203)** | 204 | ✅ Keep (1 per PROD) |
| **DEV3 duplicates/incorrect (000-203)** | 163 | ❌ Delete |
| **DEV3 beyond PROD range (205-234)** | 16 | ✅ Keep (sheets without code) |
| **DEV4 directories (000-203)** | 204 | ❌ Delete all |
| | | |
| **Current total directories** | 792 | |
| **After cleanup total** | 424 | |

## After Cleanup Structure

```
production-sheets/
├── sheet-000_PROD--2025-Transcripts... (204 total)
├── sheet-000_DEV3----DEV--2025-Transcripts... (204 matching PROD)
├── sheet-205_DEV3--Clinical-Research... (16 without PROD counterpart)
└── (367 DEV3 duplicates removed)
     (204 DEV4 directories removed)
```

**Final count:** 424 directories (204 PROD + 204 matching DEV3 + 16 DEV3 without code)

## Next Steps

1. **Create backup** before any deletions
2. **Delete 163 duplicate/incorrect DEV3 directories** (those that don't match PROD registry IDs)
3. **Delete all 204 DEV4 directories** (temporary testing environment)
4. **Verify cleanup:** Should have exactly 424 directories remaining
5. **Create PROD counterparts** for the 16 DEV3 sheets without code (205-234)
6. **Adopt D25-XXX naming convention** across all directories
7. **Sync DEV3 code** to match PROD for the 204 sheets with Apps Script
8. **Set up drift detection** after staging mirrors production

## Registry Requirements

Per user requirements, the registry should track **all 235 production sheets**:
- 204 sheets WITH Apps Script code (currently have PROD directories)
- 31 sheets WITHOUT Apps Script code (will have monitoring scripts added in future)

Currently we have:
- 204 PROD directories (with code)
- 16 DEV3 directories beyond PROD range (subset of the 31 without code)
- Missing: 15 additional sheets without code (need to be imported)

## Notes on Mismatched Sheets

The 5 mismatched sheets (015, 016, 059, 118, 160) need attention:
- Their DEV3 counterparts have different registry IDs than PROD
- These should ideally have matching DEV3 sheets imported
- For now, keep the existing DEV3 as placeholders
- Future: Find and import the correct DEV3 versions from Google Drive

## Full Duplicate List

All duplicate DEV3 directories to delete are identified by the analysis script at:
`/tmp/full-dev3-analysis.sh`

Run this script to see exactly which directories are marked for deletion (those with ❌ DELETE prefix).

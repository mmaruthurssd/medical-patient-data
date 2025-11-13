# DEV3 vs DEV4 - Which Should Be Staging?

**Date:** 2025-11-13
**Question:** Should we use DEV3 or DEV4 as the staging environment that mirrors production?

## Current State

| Environment | Sheet Range | Total Directories | Registry ID Match Rate |
|-------------|-------------|-------------------|------------------------|
| **PROD** | 000-203 | 204 | Baseline (100%) |
| **DEV3** | 000-234 | 384 | 170/204 = 83% |
| **DEV4** | 235-438 | 204 | 154/204 = 75% |

## Detailed Analysis

### DEV3 Analysis

**Correct Matches:** 170 out of 204 (83%)
- 22 perfect matches (single directory, correct registry ID)
- 148 matches but with duplicate directories

**Problem:** 148 sheets have 2 DEV3 directories each
- One directory matches PROD registry ID (keep this one)
- One directory has wrong registry ID (delete this one)
- Example: sheet-017 has both D25-433 (correct) and D25-221 (wrong)

**Advantage:** Has sheets 204-234 (21 additional sheets)
- These are likely the production sheets without Apps Script code
- Already in the correct numbering range (0-234)

**Missing:** 34 sheets don't match PROD correctly (31 completely wrong, 3 no DEV4 match either)

### DEV4 Analysis

**Correct Matches:** 154 out of 204 (75%)
- All are perfect 1:1 matches
- NO duplicates to clean up

**Numbering Issue:** Offset by 235
- PROD-000 → DEV4-235
- PROD-001 → DEV4-236
- PROD-203 → DEV4-438

**Missing:**
- No sheets beyond 204 (doesn't include sheets without code)
- Would need renumbering to align with expected 0-234 range

**Missing:** 50 sheets don't match PROD correctly

### Sheets Where BOTH Are Wrong (31 total)

These sheets don't have correct staging versions in either DEV3 or DEV4:

**Examples:**
- PROD-015: D25-452 (DEV3: S25-490, DEV4: S25-490) - both wrong
- PROD-148-174: Various S25-xxx sheets with mismatched IDs
- PROD-201-203: S25-462, S25-432, S25-454 (DEV4 has no match)

These will need to be located and imported separately regardless of which dev environment we choose.

## Recommendation

### ✅ **Use DEV3 as Staging**

**Reasons:**

1. **Better Match Rate:** 170 correct vs 154 (16 more matches)

2. **Correct Numbering Range:** Sheets 000-234 align with expected production structure

3. **Includes Sheets Without Code:** Has sheets 204-234 which are likely the 31 production sheets without Apps Script

4. **Easier Cleanup:** Deleting 158 duplicate directories is tedious but straightforward

5. **Registry Alignment:** The dev3-sheets-ALL.csv file lists 235 DEV3 sheets, matching the expected 235 production total

### ❌ **Don't Use DEV4**

**Reasons:**

1. **Fewer Matches:** Only 154 correct matches (16 fewer than DEV3)

2. **Wrong Numbering:** Offset by 235 (sheet-235 to sheet-438)
   - Would require renumbering 204 directories
   - Numbering wouldn't extend to 235 as expected

3. **Missing Sheets Without Code:** Doesn't include the sheets beyond 204

4. **Inconsistent with CSVs:** dev4-sheets-ALL.csv shows 235 sheets, but directories are numbered 235-438 (confusing)

## Implementation Plan (Using DEV3)

### Phase 1: Clean Up DEV3 Duplicates

1. **Delete 158 duplicate DEV3 directories** (those that don't match PROD registry IDs)
   - Use the list generated in /tmp/dev3-delete-list.txt
   - Verify before deletion: Each should be a duplicate with wrong registry ID

2. **Verify cleanup:** Should have 220 DEV3 directories remaining
   - 170 matching PROD (000-203)
   - 34 with no PROD match yet (000-203)
   - 16 beyond PROD range (204-234)

### Phase 2: Delete All DEV4

3. **Delete all 204 DEV4 directories** (numbered 235-438)
   - These were for temporary testing
   - No longer needed once DEV3 is cleaned up

### Phase 3: Fix Missing Matches

4. **Locate and import correct DEV3 versions** for the 34 mismatched sheets
   - Find them in Google Drive using registry IDs
   - Import using snapshot script with correct serial numbers

5. **Import remaining sheets without code**
   - Currently have 16 DEV3 sheets beyond 204
   - Need 31 total (based on 235 - 204 = 31)
   - Missing 15 additional sheets

### Phase 4: Verify Final State

After all cleanup and imports:
- **PROD:** 204 directories (000-203) - sheets with Apps Script code
- **DEV3:** 235 directories (000-234) - exact mirror including sheets without code
- **Registry:** All 235 production sheets tracked
- **Total:** 439 directories (down from 792)

## Alternative: If We Must Use DEV4

If there's a compelling reason to use DEV4 instead:

1. **Renumber DEV4:** sheet-235 to sheet-438 → sheet-000 to sheet-203
2. **Delete all DEV3:** Remove all 384 DEV3 directories
3. **Import missing 81 sheets:**
   - 50 that don't match PROD correctly
   - 31 sheets without Apps Script code (beyond 203)

**This is much more work** than cleaning up DEV3 duplicates.

## Final Recommendation

**Use DEV3 as staging, delete DEV4, and clean up the 158 duplicates.**

This gives us:
- Better registry ID alignment with PROD (170 vs 154)
- Correct numbering range (0-234 instead of 235-438)
- Already includes some sheets without code (204-234)
- Less overall work than renumbering and re-importing with DEV4

# Known Issues - DEV3 Creation
**Date:** 2025-11-13
**Status:** 21/22 DEV3 Sheets Created Successfully

## Summary

Automated DEV3 creation completed with 21 out of 22 sheets successfully created. One sheet (Serial 160) requires manual intervention due to library access restrictions.

## Successfully Created: 21 Sheets

### Mismatches (5/6)
- ✅ Serial 016: D25-266 (Biologics Coordinator)
- ✅ Serial 059: D25-309 (Emma Stephens Patient Tracking)
- ✅ Serial 118: D25-355 (InClinic Med Dispensing Log)
- ❌ **Serial 160: S25-415 (Protocol Sheet - FAILED - see below)**
- ✅ Serial 162: S25-395 (SSD Voicemail Log)
- ✅ Serial 201: S25-462 (Collections Processing Sheet)

### Missing (16/16)
- ✅ Serial 015: D25-452 (Dena Yearwood - Patient Tracking)
- ✅ Serial 149: S25-489 (Printable Documents List)
- ✅ Serial 150: S25-486 (Shared Documents)
- ✅ Serial 151: S25-471 (Staff Training Modules Log)
- ✅ Serial 153: S25-450 (ARCHIVE - Patient Document Log)
- ✅ Serial 154: S25-449 (Patient Document Log LIVE)
- ✅ Serial 156: S25-447 (Incoming Fax Scanner Log)
- ✅ Serial 157: S25-442 (Dashboard Template)
- ✅ Serial 158: S25-434 (Patient Phone Tracker PHI)
- ✅ Serial 159: S25-422 (Paycheck Historic Data)
- ✅ Serial 161: S25-409 (SSD Skin Substitute Inventory)
- ✅ Serial 165: S25-391 (Credentialing Checklist - Template)
- ✅ Serial 166: S25-390 (Employee Sheet Template)
- ✅ Serial 171: S25-321 (Thursday Staff Lunch Notes Log)
- ✅ Serial 172: S25-320 (Prior Auth - Dermatology Letters)
- ✅ Serial 174: S25-423 (Credentialing Checklist - Grace McMahan)

## Failed Sheet: Serial 160

### Details
- **Serial:** 160
- **PROD Registry:** S25-415
- **Sheet Name:** Protocol Sheet - Template
- **PROD Script ID:** 1UgVV8PVrSmV4bbpQOpBqiZq7e2T6JRM98kGmlncbZm5m-qPlK2CHQOQh

### Error
```
You do not have access to library 1wipMhbgjsokmkePSOyxG7vMrEP6squ6FPKV69FTTBaOJb3aMeHkj7LOE,
used by your script, or it has been deleted.
```

### Root Cause
The PROD script depends on an Apps Script library that the OAuth account doesn't have access to:
- **Library ID:** `1wipMhbgjsokmkePSOyxG7vMrEP6squ6FPKV69FTTBaOJb3aMeHkj7LOE`
- **User Symbol:** `PDC`
- **Development Mode:** true
- **Version:** 0

### What Was Created
- ✅ Blank spreadsheet created: `1_ip2eBOFU32bljoG09BEhDP5qdrU-TPY_4Uc8FYcUok`
- ✅ Bound script project created: `15e25_Ia6-G18UwSt5yOZ9-r9nIsbkntC4tKkjQ6RRNVQC2vDG5gFuFZ6`
- ❌ Script content NOT copied (library access error)
- ❌ Local directory NOT created

### What Exists
- **Old mismatched DEV3:** `sheet-160_DEV3----DEV--Initial-Credentialing-Dashboard---Dashboard-Sheet---D25-220---SuperAdmin---Active`
  - This is the wrong DEV3 (D25-220 instead of S25-415)
  - Should be deleted once correct DEV3 is created

### Required Manual Steps

#### Option 1: Grant Library Access (Recommended)
1. Find the owner of library `1wipMhbgjsokmkePSOyxG7vMrEP6squ6FPKV69FTTBaOJb3aMeHkj7LOE`
2. Grant read access to: `mmaruthur@ssdspc.com` (OAuth account)
3. Re-run the automation script for Serial 160 only

#### Option 2: Manual Creation
1. Open PROD spreadsheet for S25-415 in Google Drive
2. File → Make a copy → Rename to "[DEV] Protocol_Sheet_-_Template"
3. Open Apps Script editor
4. File → Make a copy (Apps Script will handle library dependencies)
5. Note the new script ID and spreadsheet ID
6. Run local setup:
   ```bash
   cd production-sheets
   mkdir sheet-160_DEV3--Protocol_Sheet_-_Template_-_Sheet_-_S25-415_-_Active
   cd sheet-160_DEV3--Protocol_Sheet_-_Template_-_Sheet_-_S25-415_-_Active
   mkdir live metadata
   echo '{"scriptId": "NEW_SCRIPT_ID"}' > .clasp.json
   cp .clasp.json live/.clasp.json
   cd live && clasp pull
   rm .clasp.json
   cd ..
   echo "NEW_SCRIPT_ID" > metadata/script-id.txt
   echo "NEW_SPREADSHEET_ID" > metadata/spreadsheet-id.txt
   echo "S25-415" > metadata/registry-id.txt
   date -u +"%Y-%m-%dT%H:%M:%SZ" > metadata/created-from-prod.txt
   ```

#### Option 3: Remove Library Dependency (Not Recommended)
- Create DEV3 without the library
- Script will not function properly
- Only use if library is obsolete

### Cleanup Needed
After successful creation of correct DEV3 for Serial 160:
1. Delete old mismatched DEV3 directory:
   ```bash
   cd production-sheets
   rm -rf sheet-160_DEV3----DEV--Initial-Credentialing-Dashboard---Dashboard-Sheet---D25-220---SuperAdmin---Active
   ```
2. Delete or archive the partial spreadsheet/script if Option 2 or 3 is used:
   - Spreadsheet: `1_ip2eBOFU32bljoG09BEhDP5qdrU-TPY_4Uc8FYcUok`
   - Script: `15e25_Ia6-G18UwSt5yOZ9-r9nIsbkntC4tKkjQ6RRNVQC2vDG5gFuFZ6`

## Impact

### Current State
- **Total PROD sheets:** 204
- **Total DEV3 sheets:** 247
  - 226 existing (before this run)
  - 21 newly created
- **Perfect PROD/DEV3 pairs:** 203 (99.5%)
- **Mismatches remaining:** 1 (Serial 160)

### Expected After Fix
- **Total DEV3 sheets:** 248 (after creating correct 160, before deleting old 160)
- **Total DEV3 sheets:** 247 (after cleanup)
- **Perfect PROD/DEV3 pairs:** 204 (100%)

## Logs

- **Automation run:** `logs/create-dev3-from-scripts-2025-11-13T17-30-54-524Z.log`
- **Continuation log:** `logs/create-dev3-continuation.log`
- **Tracking CSV:** `backups/pre-dev3-creation-20251113/dev3-creation-tracker.csv`

## Next Steps

1. ✅ Document this issue (this file)
2. ⏳ Verify the 21 successful DEV3 sheets
3. ⏳ Commit the 21 new DEV3 directories to git
4. ⏳ Notify library owner to grant access OR proceed with Option 2
5. ⏳ Create correct DEV3 for Serial 160
6. ⏳ Clean up old mismatched DEV3
7. ⏳ Achieve 100% PROD/DEV3 match

## Verification Commands

Check current state:
```bash
# Count DEV3 directories
ls -d production-sheets/sheet-*_DEV3* | wc -l  # Should be 247

# Count PROD directories
ls -d production-sheets/sheet-*_PROD* | wc -l  # Should be 204

# View tracking CSV
cat backups/pre-dev3-creation-20251113/dev3-creation-tracker.csv
```

## Safety Notes

✅ **No data lost:**
- All PROD sheets remain untouched
- 21 new DEV3 sheets successfully created
- All changes tracked in git

✅ **Reversible:**
- Can delete the 21 new DEV3 directories and try again
- PROD sheets are source of truth
- Git history preserves all states

✅ **Protected:**
- Pre-creation backup exists
- Git pre-push hook validates sheet count
- Full recovery procedures documented

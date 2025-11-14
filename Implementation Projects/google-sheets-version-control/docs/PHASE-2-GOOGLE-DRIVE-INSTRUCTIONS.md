# Phase 2: Create 22 DEV3 Sheets in Google Drive
**Date:** 2025-11-13
**Status:** Ready to Begin
**Estimated Time:** 2-3 hours

## Overview

This phase requires manual work in Google Drive to create 22 new DEV3 (staging) sheets by copying from PROD sheets. You'll copy both the spreadsheet and the Apps Script project for each sheet.

## Before You Start

**Prerequisites:**
- ✅ Phase 1 complete (safety backup created)
- ✅ Tracking CSV ready: `backups/pre-dev3-creation-20251113/dev3-creation-tracker.csv`
- ✅ Automation script ready: `scripts/create-22-dev3-sheets.sh`
- ✅ Google Drive access with permissions to create spreadsheets

**Important Reminders:**
- Google Drive remains the source of truth - all changes start here
- Local repository is read-only snapshots via clasp pull
- Production code is being COPIED to staging (no production changes)
- All operations are safe - can delete and retry if needed

## Step-by-Step Instructions

### For Each of the 22 Sheets:

#### Step 1: Find the PROD Spreadsheet

1. Open the tracking CSV: `backups/pre-dev3-creation-20251113/dev3-creation-tracker.csv`
2. Look at the first row (Serial 016)
3. Note the **PROD_Registry** value (e.g., D25-266)
4. In Google Drive, search for that registry ID to find the PROD spreadsheet

#### Step 2: Copy the PROD Spreadsheet

1. Open the PROD spreadsheet in Google Drive
2. **File → Make a copy**
3. Rename the copy:
   - Original: "Patient Tracking Sheet"
   - New name: "[DEV] Patient Tracking Sheet"
4. Move the copy to your DEV folder (if you have one organized)
5. **Get the Spreadsheet ID:**
   - Look at the URL: `https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit`
   - Copy the **SPREADSHEET_ID** part
   - Paste it into the CSV under `New_DEV3_Spreadsheet_ID`

#### Step 3: Copy the Apps Script Project

1. From the DEV spreadsheet, go to **Extensions → Apps Script**
2. Note the current script ID in the URL: `https://script.google.com/...?scriptId={OLD_SCRIPT_ID}`
3. Close the Apps Script editor
4. Open the PROD spreadsheet
5. Go to **Extensions → Apps Script** (opens PROD's script)
6. **File → Make a copy**
7. Rename: "[DEV] <original name>"
8. **Get the Script ID:**
   - Look at the URL of the new script
   - Copy the **scriptId** parameter value
   - Paste it into the CSV under `New_DEV3_Script_ID`

#### Step 4: Link the New Script to the New Spreadsheet (If Bound Script)

**If this is a container-bound script:**
1. In the new DEV script editor, go to **Project Settings** (gear icon)
2. Under "Container bound to:", check if it shows the old PROD spreadsheet
3. If yes, you need to:
   - Copy all the code from the new DEV script
   - Delete the new DEV script
   - Open the new DEV spreadsheet → Extensions → Apps Script
   - Paste the code into the default Code.gs
   - Save and deploy

**If this is a standalone script:**
- No additional linking needed

#### Step 5: Update the Tracking CSV

Open `backups/pre-dev3-creation-20251113/dev3-creation-tracker.csv` and fill in:
- `New_DEV3_Spreadsheet_ID`: The ID from Step 2
- `New_DEV3_Script_ID`: The ID from Step 3
- `Status`: Change from "Not Started" to "Completed"
- `Notes`: Add any notes (optional)

**Example:**
```csv
Serial,Category,PROD_Registry,Current_DEV3,Action,Sheet_Name,New_DEV3_Spreadsheet_ID,New_DEV3_Script_ID,Status,Notes
016,MISMATCH,D25-266,D25-433,Delete DEV3 then copy from PROD,,1abc...xyz,abc123def456,Completed,Copied successfully
```

#### Step 6: Repeat for All 22 Sheets

Continue with each row in the tracking CSV until all 22 sheets are complete.

## Quick Reference: The 22 Sheets

### Mismatches (6 sheets - Delete wrong DEV3, create from PROD)
1. Serial 016: D25-266
2. Serial 059: D25-309
3. Serial 118: D25-355
4. Serial 160: S25-415
5. Serial 162: S25-395
6. Serial 201: S25-462

### Missing (16 sheets - Create new from PROD)
7. Serial 015: D25-452 - Dena Yearwood - Patient Tracking Sheet
8. Serial 149: S25-489 - Printable Documents List
9. Serial 150: S25-486 - Shared Documents
10. Serial 151: S25-471 - Staff Training Modules Log
11. Serial 153: S25-450 - ARCHIVE - Patient Document Log
12. Serial 154: S25-449 - Patient Document Log (Processed) LIVE
13. Serial 156: S25-447 - Incoming Fax Scanner Log
14. Serial 157: S25-442 - Dashboard Template
15. Serial 158: S25-434 - Patient Phone Tracker PHI
16. Serial 159: S25-422 - Paycheck Historic Data
17. Serial 161: S25-409 - SSD Skin Substitute Inventory
18. Serial 165: S25-391 - Credentialing Checklist - Template
19. Serial 166: S25-390 - Employee Sheet Template
20. Serial 171: S25-321 - Thursday Staff Lunch Notes Log
21. Serial 172: S25-320 - Prior Auth - Dermatology Letters
22. Serial 174: S25-423 - Credentialing Checklist - Grace McMahan

## How to Get Script ID and Spreadsheet ID

### Spreadsheet ID (from URL):
```
https://docs.google.com/spreadsheets/d/1abc-xyz_123/edit
                                         ^^^^^^^^^^^
                                         This is the spreadsheet ID
```

### Script ID (from Apps Script editor URL):
```
https://script.google.com/home/projects/abc123def456/edit
                                         ^^^^^^^^^^^
                                         This is the script ID
```

Or in newer URLs:
```
https://script.google.com/u/0/home/projects/abc123def456...
                                             ^^^^^^^^^^^
```

## Verification Checklist

After completing all 22 sheets, verify:
- [ ] All 22 rows in CSV have `New_DEV3_Spreadsheet_ID` filled in
- [ ] All 22 rows in CSV have `New_DEV3_Script_ID` filled in
- [ ] All 22 rows have `Status` changed to "Completed"
- [ ] Each DEV spreadsheet name starts with "[DEV]"
- [ ] Each DEV script name starts with "[DEV]"
- [ ] CSV file is saved

## Common Issues and Solutions

### Issue: "Make a copy" is grayed out
**Solution:** Check your Google Drive permissions. You may need owner access to the PROD sheet.

### Issue: Apps Script editor won't open
**Solution:** Check if the script is disabled or if you need additional permissions.

### Issue: Can't find the PROD sheet by registry ID
**Solution:** Check the local metadata:
```bash
cat production-sheets/sheet-016_PROD*/metadata/registry-id.txt
```

### Issue: Copied wrong sheet
**Solution:** Delete the DEV copy and start over - no harm done!

## After Completing All 22 Sheets

**Next step: Run Phase 3 automation**

Once all 22 sheets are created in Google Drive and the tracking CSV is complete:

```bash
cd scripts
./create-22-dev3-sheets.sh
```

This will:
1. Read your tracking CSV
2. Create local directory structure for all 22 DEV3 sheets
3. Pull code from Google Drive using clasp
4. Save metadata
5. Verify all pulls succeeded

**Estimated time for Phase 3:** ~15-30 minutes

## Tips for Efficiency

1. **Work in batches**: Do 5-6 sheets at a time before updating the CSV
2. **Keep multiple tabs open**: PROD sheet, DEV sheet, Apps Script editor, CSV
3. **Use keyboard shortcuts**: Ctrl+D for duplicate, Ctrl+T for new tab
4. **Take breaks**: 2-3 hours of repetitive work - stretch every 30 minutes

## Safety Reminders

- ✅ All PROD sheets remain untouched
- ✅ You're only CREATING new DEV copies
- ✅ If you make a mistake, just delete the DEV copy and try again
- ✅ Google Drive tracks all versions - nothing is permanently lost
- ✅ Phase 1 backup protects the local repository

## Need Help?

If you run into issues during this phase:
1. Check the Common Issues section above
2. Review the STAGING-CREATION-PLAN.md for additional context
3. Remember: You can always delete a DEV copy and start over

---

**Ready to begin?** Start with Serial 016 (first row in the CSV) and work your way down!

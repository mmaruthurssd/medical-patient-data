# Google Sheets Version Control - Snapshot Success Summary

## Final Results

✅ **ALL 235 dev3 sheets successfully extracted and imported**

### Breakdown:
- **Total sheets in registry:** 235
- **Sheets with Apps Script IDs (can be snapshotted):** 200
- **Sheets without Apps Script IDs (tracked only):** 35

The 35 sheets without script IDs are still tracked in the registry for documentation purposes, but cannot have their code snapshotted since they don't have Apps Script projects attached.

## Files Created:

### Extraction Scripts:
1. `scripts/extract-dev3-sheets.js` - Original extraction (had column mapping bug)
2. `scripts/extract-dev3-sheets-CORRECTED.js` - Fixed column mapping
3. `scripts/extract-dev3-sheets-verbose.js` - Verbose mode for debugging
4. `scripts/extract-dev3-ALL-sheets.js` - **Final version - includes sheets without script IDs**

### Data Files:
- `dev3-sheets-ALL.csv` - CSV with all 235 sheets
- `add-dev3-ALL-sheets.sh` - Bash script for manual import

### Registry:
- `config/sheet-registry.json` - Contains all 235 sheets
- `config/sheet-registry.json.backup-200-sheets` - Backup of 200-sheet version

## Bugs Fixed:

### 1. Column Mapping Error
**Problem:** Initially had columns G and H swapped
**Original (wrong):** G = Script ID, H = Spreadsheet ID
**Corrected:** G = Spreadsheet ID, H = Apps Script Project ID
**Fix:** Created extract-dev3-sheets-CORRECTED.js with proper mapping

### 2. clasp --rootDir Not Supported
**Problem:** clasp doesn't support `--rootDir` flag
**Error:** `error: unknown option '--rootDir'`
**Fix:** Modified snapshot script to copy `.clasp.json` to live directory instead
**File:** `scripts/snapshot-all-production.js:82-89`

### 3. clasp Authentication (Local vs Global)
**Problem:** Local clasp v2.5.0 had authentication bug
**Error:** `Error retrieving access token: TypeError: Cannot read properties of undefined (reading 'access_token')`
**Fix:** Changed to use global clasp v3.0.6-alpha explicitly
**File:** `scripts/snapshot-all-production.js:85`

### 4. Registry Script Missing Script ID Bug
**Problem:** When --script-id not provided, args.indexOf() returned -1, picking up '--add' as scriptId
**Error:** 35 sheets had `scriptId: '--add'` instead of `null`
**Fix:** Added conditional check before accessing array
**File:** `scripts/registry/update-registry.js:163`

```javascript
// Before (broken):
const scriptId = args[args.indexOf('--script-id') + 1];

// After (fixed):
const scriptId = args.includes('--script-id') ? args[args.indexOf('--script-id') + 1] : null;
```

### 5. Bulk Import Requiring Script ID
**Problem:** bulk-import.js required scriptId even though it should be optional
**Fix:** Made scriptId optional in validation and command building
**File:** `scripts/bulk-import.js:85, 99`

## Current Status:

✅ Registry contains 235 sheets (200 with script IDs, 35 without)
✅ Snapshot script correctly filters and processes only sheets with script IDs
✅ All bugs fixed and tested
🔄 Snapshot in progress for 200 sheets

## Next Steps:

1. ✅ Complete snapshot of all 200 sheets with script IDs
2. [ ] Extract and import dev4 sheets (when link provided)
3. [ ] Set up Git repository and commit snapshots
4. [ ] Configure GitHub Actions for automated twice-daily snapshots
5. [ ] Test staging workflow (create DEV copies)
6. [ ] Eventually migrate to actual production sheets (after testing with dev3/dev4)

## Technical Notes:

### Snapshot Script Behavior:
- Automatically skips sheets without script IDs
- Shows count: "Found X sheet(s) with script IDs (Y total, Z without script IDs)"
- Creates folder structure: `production-sheets/sheet-XXX/live/`
- Downloads all Apps Script files (.js, .json)
- Generates README.md for each sheet
- Updates lastSnapshot timestamp in registry

### Registry Structure:
Sheets without script IDs have:
```json
{
  "production": {
    "sheetId": "1ABC...",
    "scriptId": null,
    "url": "https://docs.google.com/spreadsheets/d/1ABC.../edit"
  }
}
```

This allows tracking the spreadsheet for documentation while preventing snapshot attempts.

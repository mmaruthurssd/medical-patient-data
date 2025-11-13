# How to Add Your 237 Google Sheets to the Registry

**Time Required:** 30-60 minutes (depending on method)
**Current Status:** 0/237 sheets added

---

## Understanding What You Need

For **each of your 237 sheets**, you need two IDs:

### 1. Google Sheet ID
**Where:** In the sheet's URL
**Example:** `https://docs.google.com/spreadsheets/d/1abc123xyz/edit`
**The ID:** `1abc123xyz`

### 2. Apps Script Project ID
**Where:** Extensions → Apps Script → Project Settings → Script ID
**Example:** `AKfycbz...`

---

## Method 1: Bulk Import via CSV (Fastest - Recommended)

### Step 1: Create the CSV File (30-45 minutes)

Open `sheets-to-import-TEMPLATE.csv` and replace with your data:

```csv
name,productionId,scriptId,category,criticality,description
"Prior Authorization V3","1abc123xyz","AKfycbz123",clinical,high,"Prior authorization tracking"
"Patient Billing","1def456xyz","AKfycbz456",financial,high,"Billing operations"
"Staff Schedule","1ghi789xyz","AKfycbz789",staff,medium,"Employee scheduling"
```

**Tips for creating the CSV:**
- Use Google Sheets to organize the data first
- Export as CSV when done
- Keep descriptions brief (one line)
- Use quotes around fields with commas

**Categories:** clinical, financial, staff, operational, reporting, administrative, integration

**Criticality:** high (critical operations), medium (important), low (nice-to-have)

### Step 2: Run the Bulk Import (4-5 minutes)

```bash
cd "/Users/mmaruthurnew/Desktop/medical-patient-data/Implementation Projects/google-sheets-version-control"

node scripts/bulk-import.js sheets-to-import.csv
```

**What happens:**
- Processes ~237 sheets at 1 per second
- Shows progress: `[25/237] Adding: Sheet Name`
- Reports success/failures at end
- Takes ~4 minutes total

### Step 3: Verify the Import

```bash
npm run registry:update -- --list
npm run registry:update -- --stats
```

---

## Method 2: Manual Entry (Slower but More Control)

For each sheet, run:

```bash
npm run registry:update -- --add \
  --name "Sheet Name" \
  --production-id "SHEET_ID" \
  --script-id "SCRIPT_ID" \
  --category "clinical" \
  --criticality "high" \
  --description "What this sheet does"
```

**Time:** ~30-60 seconds per sheet = 2-4 hours for 237 sheets

---

## Method 3: Scripted Extraction (Advanced)

If you have a master spreadsheet listing all your sheets, you can write a script to extract the IDs programmatically.

### Option A: Google Sheets Script

In a Google Sheet with your sheet list, run:

```javascript
function extractSheetData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const files = DriveApp.getFilesByType(MimeType.GOOGLE_SHEETS);

  const data = [];
  while (files.hasNext()) {
    const file = files.next();
    const sheetId = file.getId();

    // Get bound Apps Script project
    try {
      // You'll need to get script IDs manually or via Apps Script API
      data.push([file.getName(), sheetId, 'SCRIPT_ID_HERE']);
    } catch (e) {
      // Skip if no script
    }
  }

  return data;
}
```

### Option B: Use Google Sheets API

We can build a script using the Google Sheets API you already have set up:

```javascript
// Use the google-workspace-automation-infrastructure
// to list all sheets in your Drive and extract IDs
```

---

## Getting Script IDs Efficiently

### Challenge:
Script IDs are harder to get than Sheet IDs (no direct API access without opening each sheet).

### Solutions:

**1. Manual Collection (Most Reliable)**
- Open each sheet → Extensions → Apps Script → Project Settings → Copy Script ID
- Paste into CSV
- Tedious but accurate

**2. Apps Script API (Advanced)**
Use the Apps Script API to list all projects:

```bash
# Requires Apps Script API enabled
# Would need separate implementation
```

**3. Extract from .clasp.json (If already using clasp)**
If you've previously used clasp, check for existing `.clasp.json` files in your system.

---

## Recommended Workflow for 237 Sheets

### Phase 1: Pilot (1 hour)
1. **Select 5 low-risk sheets** for pilot
2. **Manually add to CSV** (10 minutes)
3. **Import via bulk script** (< 1 minute)
4. **Run first snapshot** (< 1 minute)
5. **Verify everything works** (5 minutes)

### Phase 2: Batch Collection (2-3 hours)
1. **Create spreadsheet** with columns: Name, Sheet ID, Script ID, Category, Criticality
2. **Open each sheet** and collect IDs
   - Tip: Use multiple browser tabs
   - Tip: Work in batches of 10-20
3. **Categorize as you go**
4. **Export to CSV**

### Phase 3: Bulk Import (5 minutes)
1. **Run bulk import** script
2. **Verify** with `npm run registry:update -- --stats`
3. **Run snapshot** for all sheets

### Phase 4: First Snapshot (10-15 minutes)
```bash
npm run snapshot
```
- Takes ~4 minutes for 237 sheets (1 second delay each)
- Creates folder for each sheet
- Downloads all Apps Script code

---

## Tools to Help

### CSV Template
Use `sheets-to-import-TEMPLATE.csv` as starting point.

### Bulk Import Script
`scripts/bulk-import.js` handles CSV import automatically.

### Registry Commands
```bash
# View all sheets
npm run registry:update -- --list

# View statistics
npm run registry:update -- --stats

# Add single sheet
npm run registry:update -- --add --name "Sheet" --production-id "ID" --script-id "ID"
```

---

## After Adding All Sheets

### 1. Run First Complete Snapshot
```bash
npm run snapshot
```

### 2. Commit to Git
```bash
git add .
git commit -m "feat: add all 237 sheets to registry and initial snapshot"
git push
```

### 3. Enable GitHub Actions
- Push to GitHub
- Add clasp credentials as secret
- Actions run automatically 2x/day

### 4. Create DEV Sheets (Future)
- We can build automation to create all 237 DEV copies
- For now, focus on production snapshots

---

## Estimating Time

| Task | Time | Method |
|------|------|--------|
| Collect 237 Sheet IDs | 1-2 hours | Copy from URLs |
| Collect 237 Script IDs | 2-3 hours | Manual from Apps Script |
| Create CSV | 30 min | Organize in spreadsheet |
| Bulk Import | 5 min | Run script |
| First Snapshot | 4 min | Run npm script |
| **Total** | **4-6 hours** | Mostly data collection |

---

## Need Help Collecting IDs?

If you want to automate ID collection, we can:

1. **Use Google Drive API** to list all sheets (you have this set up)
2. **Extract Sheet IDs** automatically
3. **Script IDs are harder** - may need manual collection
4. **Build a helper tool** to streamline the process

Would you like me to build an automated ID collector?

---

## Quick Reference

**Registry Location:**
```
config/sheet-registry.json
```

**Add Sheet:**
```bash
npm run registry:update -- --add --name "Name" --production-id "ID" --script-id "ID"
```

**Bulk Import:**
```bash
node scripts/bulk-import.js your-sheets.csv
```

**View Registry:**
```bash
npm run registry:update -- --list
```

**Take Snapshot:**
```bash
npm run snapshot
```

---

**Ready to start?** Begin with Phase 1 (pilot with 5 sheets) to test the workflow!

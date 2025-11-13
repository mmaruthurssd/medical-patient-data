# Quick Start Guide - Google Sheets Version Control

**Status:** ✅ Ready to use
**Last Updated:** 2025-11-09

---

## 🎯 What You Have Now

A fully functional Google Sheets version control system with:
- ✅ Sheet registry for tracking all 237 sheets
- ✅ Production snapshot automation
- ✅ Staging snapshot automation
- ✅ GitHub Actions for twice-daily snapshots (9 AM & 5 PM)
- ✅ clasp authenticated and ready

---

## 🚀 Getting Started (3 Steps)

### Step 1: Install Dependencies (1 minute)

```bash
cd "/Users/mmaruthurnew/Desktop/medical-patient-data/Implementation Projects/google-sheets-version-control"
npm install
```

### Step 2: Add Your First Sheet to Registry (2 minutes)

You need the Google Sheet ID and Apps Script Project ID for each sheet.

**To find these IDs:**
1. Open your Google Sheet
2. **Sheet ID:** Copy from URL: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`
3. **Script ID:** Extensions → Apps Script → Project Settings → Script ID

**Add to registry:**
```bash
npm run registry:update -- --add \
  --name "Prior Authorization V3" \
  --production-id "1abc...xyz" \
  --script-id "AKf...xyz" \
  --category "clinical" \
  --criticality "high" \
  --description "Prior auth tracking and management"
```

**Verify it was added:**
```bash
npm run registry:update -- --list
```

### Step 3: Test Snapshot (1 minute)

```bash
# Snapshot the production sheet you just added
npm run snapshot

# Check the output
ls -la production-sheets/
```

You should see a folder created with your sheet's code!

---

## 📊 Adding All 237 Sheets

You have two approaches:

### Option A: Manual Entry (Recommended for First Time)

Create a spreadsheet with columns:
- Sheet Name
- Sheet ID
- Script ID
- Category (clinical/financial/staff/operational/reporting/administrative/integration)
- Criticality (high/medium/low)
- Description

Then run the add command for each sheet.

### Option B: Bulk Import Script

Create a CSV file (`sheets-to-import.csv`):
```csv
name,productionId,scriptId,category,criticality,description
Prior Auth V3,SHEET_ID_1,SCRIPT_ID_1,clinical,high,Prior authorization tracking
Billing Dashboard,SHEET_ID_2,SCRIPT_ID_2,financial,high,Patient billing operations
...
```

Then create and run this helper script (`scripts/bulk-import.js`):

```javascript
#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

const csv = fs.readFileSync('sheets-to-import.csv', 'utf8');
const lines = csv.split('\n').slice(1); // Skip header

lines.forEach(line => {
  if (!line.trim()) return;

  const [name, productionId, scriptId, category, criticality, description] =
    line.split(',').map(s => s.trim());

  const cmd = `npm run registry:update -- --add --name "${name}" --production-id "${productionId}" --script-id "${scriptId}" --category "${category}" --criticality "${criticality}" --description "${description}"`;

  console.log(`Adding: ${name}`);
  execSync(cmd, { stdio: 'inherit' });
});

console.log('\n✅ Bulk import complete!');
```

Run it:
```bash
node scripts/bulk-import.js
```

---

## ⏰ Setting Up Automated Snapshots

### GitHub Actions (Recommended)

**Prerequisites:**
1. Push this repository to GitHub
2. Add clasp credentials as GitHub secret

**Get your clasp credentials:**
```bash
cat ~/.clasprc.json
```

**Add to GitHub:**
1. Go to your repo → Settings → Secrets and variables → Actions
2. New repository secret
3. Name: `CLASP_CREDENTIALS`
4. Value: Paste contents of ~/.clasprc.json
5. Save

**GitHub Actions will now run automatically at 9 AM and 5 PM PST!**

### Local Cron (Alternative)

Add to your crontab (`crontab -e`):

```cron
# Production snapshots at 9 AM and 5 PM PST
0 9 * * * cd /Users/mmaruthurnew/Desktop/medical-patient-data/Implementation\ Projects/google-sheets-version-control && npm run snapshot
0 17 * * * cd /Users/mmaruthurnew/Desktop/medical-patient-data/Implementation\ Projects/google-sheets-version-control && npm run snapshot

# Staging snapshots at 9:15 AM and 5:15 PM PST
15 9 * * * cd /Users/mmaruthurnew/Desktop/medical-patient-data/Implementation\ Projects/google-sheets-version-control && npm run snapshot:staging
15 17 * * * cd /Users/mmaruthurnew/Desktop/medical-patient-data/Implementation\ Projects/google-sheets-version-control && npm run snapshot:staging
```

---

## 📝 Common Commands

### Registry Management
```bash
# Add a sheet
npm run registry:update -- --add --name "Sheet Name" --production-id "ID" --script-id "ID"

# List all sheets
npm run registry:update -- --list

# View statistics
npm run registry:update -- --stats
```

### Snapshots
```bash
# Snapshot all production sheets
npm run snapshot

# Snapshot all staging sheets
npm run snapshot:staging
```

### Deployment (when ready)
```bash
# Deploy a sheet to production
npm run deploy

# Rollback a deployment
npm run rollback
```

---

## 🎯 Next Steps

1. **Populate Registry:** Add all 237 sheets (or start with a pilot of 5-10)
2. **Run First Snapshot:** `npm run snapshot`
3. **Commit to Git:**
   ```bash
   git add .
   git commit -m "feat: add sheet registry and initial snapshots"
   git push
   ```
4. **Set up GitHub Actions:** Follow instructions above
5. **Create DEV Sheets:** (We can build this script next)

---

## 🆘 Troubleshooting

### "No production sheets found in registry"
- You need to add sheets first: `npm run registry:update -- --add ...`

### "clasp: command not found"
- clasp is installed at `/usr/local/bin/clasp` - check your PATH

### "Script ID not found" when snapshotting
- Verify the Script ID in Google Apps Script → Project Settings
- Make sure the Apps Script API is enabled

### Snapshots fail with permission errors
- Run `clasp login` to re-authenticate
- Check that service account has access to sheets

---

## 📚 Additional Resources

- **Planning Docs:** See `docs/` folder
- **Pilot Checklist:** See `docs/PILOT_SHEET_CHECKLIST.md`
- **Security:** See `SECURITY.md`
- **Repository README:** See `README.md`

---

**Questions?** Check the planning documentation in:
- `/Users/mmaruthurnew/Desktop/operations-workspace/projects-in-development/google-sheets-projects/google-sheets-framework-building-project/google-sheets-version-control-planning/`

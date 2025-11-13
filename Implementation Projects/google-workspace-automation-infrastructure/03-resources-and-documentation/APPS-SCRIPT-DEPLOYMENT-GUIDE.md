# Apps Script Deployment Guide

**Document:** Apps Script Deployment Guide
**Project:** Google Workspace Automation Infrastructure
**Version:** 1.0
**Last Updated:** 2025-11-08
**Status:** Active

---

## Overview

This guide provides comprehensive instructions for deploying Apps Script code to 240+ Google Sheets using the `clasp` CLI (Command Line Apps Script Projects).

### What You'll Accomplish

- **clasp CLI Setup**: Install and authenticate command-line tool
- **Single Sheet Deployment**: Test pull/push workflow
- **Sheet Registry**: Build comprehensive mapping of all 240+ sheets
- **Bulk Deployment**: Automated deployment to all sheets in parallel
- **Rollback Capability**: Restore previous versions if needed

---

## Prerequisites

### Completed Steps
- [x] Automation account created
- [x] OAuth 2.0 configured
- [x] Apps Script API enabled
- [x] `automation@ssdsbc.com` has Manager access to all Shared Drives

### Required Software
- Node.js v16+ installed
- npm (comes with Node.js)
- Git (for version control)
- Terminal/command-line access

---

## Architecture Overview

```
┌──────────────────────┐
│   Local Machine      │
│  (clasp CLI, your    │
│   Apps Script code)  │
└──────────┬───────────┘
           │
           │ clasp pull/push
           │ (Apps Script API)
           │
           ▼
┌──────────────────────┐
│  Google Cloud        │
│  - Apps Script API   │
│  - OAuth 2.0         │
└──────────┬───────────┘
           │
           │ Manages
           │
           ▼
┌──────────────────────┐
│  Google Sheets (240+)│
│  - Container-bound   │
│    Apps Script       │
│    projects          │
└──────────────────────┘
```

---

## Step 1: Install clasp CLI

### 1.1 Install Globally via npm

```bash
npm install -g @google/clasp
```

**Verify installation:**

```bash
clasp --version
```

**Expected output:**
```
1.x.x
```

### 1.2 Enable Apps Script API (if not done)

1. Go to [Apps Script Settings](https://script.google.com/home/usersettings)
2. Sign in as `automation@ssdsbc.com`
3. Toggle **Google Apps Script API** to ON

---

## Step 2: Authenticate clasp

### 2.1 Login with Automation Account

```bash
clasp login
```

**This will:**
1. Open browser for OAuth consent
2. Prompt you to sign in
3. Request Apps Script API permissions

**Sign in as:** `automation@ssdsbc.com`

**Permissions required:**
- View and manage your Google Apps Script projects
- View and manage Google Drive files

Click **Allow**

### 2.2 Verify Authentication

```bash
clasp list
```

**Expected output:**
```
Listing your projects:
[Shows any existing Apps Script projects]
```

If you see a list (even empty), authentication succeeded.

---

## Step 3: Test Single Sheet Deployment

### 3.1 Find a Pilot Sheet

Use Drive API or manually identify a test spreadsheet:

**Example Pilot Sheet:**
- Name: "Test Spreadsheet for Apps Script"
- URL: `https://docs.google.com/spreadsheets/d/SHEET_ID/edit`
- Extract `SHEET_ID` from URL

### 3.2 Open Script Editor

1. Open the spreadsheet
2. Click **Extensions** > **Apps Script**
3. Note the Script ID:
   - Click **Project Settings** (gear icon)
   - Copy **Script ID**

**Save this information:**
```
Sheet Name: Test Spreadsheet
Sheet ID: 1AbC...
Script ID: AKfyc...
```

### 3.3 Clone the Script Project

```bash
# Create directory for this sheet's script
mkdir -p ./scripts/test-spreadsheet
cd ./scripts/test-spreadsheet

# Clone the script project
clasp clone SCRIPT_ID
```

**Replace `SCRIPT_ID` with the actual Script ID from step 3.2**

**Expected output:**
```
Cloned 2 files.
└─ appsscript.json
└─ Code.gs
```

### 3.4 Review Downloaded Files

```bash
ls -la
```

You should see:
- `.clasp.json` - Project configuration
- `appsscript.json` - Apps Script manifest
- `Code.gs` - Your Apps Script code
- Any other `.gs` files

**View the code:**
```bash
cat Code.gs
```

### 3.5 Make a Test Change

Edit `Code.gs`:

```javascript
// Add a test function at the end
function testCLASPDeployment() {
  Logger.log('Successfully deployed via clasp on ' + new Date());
  return 'Deployment successful!';
}
```

### 3.6 Push Changes

```bash
clasp push
```

**You'll see:**
```
? Manifest file has been updated. Do you want to push and overwrite? Yes
└─ appsscript.json
└─ Code.gs
Pushed 2 files.
```

### 3.7 Verify Deployment

1. Go back to the spreadsheet
2. Open **Extensions** > **Apps Script**
3. Verify `testCLASPDeployment()` function exists
4. Run it: Click **Run** button
5. Check logs: **View** > **Logs**

**Expected log:**
```
Successfully deployed via clasp on [timestamp]
```

✅ **Success!** You've deployed to a single sheet.

---

## Step 4: Build Sheet Registry

### 4.1 Create Registry Scanner

Create `build-sheet-registry.js`:

```javascript
require('dotenv').config();
const { google } = require('googleapis');
const fs = require('fs');

async function buildSheetRegistry() {
  console.log('🔍 Building Sheet Registry...\n');

  // Load OAuth credentials
  const credentials = JSON.parse(fs.readFileSync('credentials.json', 'utf8'));
  const token = JSON.parse(fs.readFileSync('token.json', 'utf8'));

  const { client_id, client_secret, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );
  oAuth2Client.setCredentials(token);

  const drive = google.drive({ version: 'v3', auth: oAuth2Client });
  const script = google.script({ version: 'v1', auth: oAuth2Client });

  // Get all Shared Drives
  const drivesRes = await drive.drives.list({ pageSize: 100 });
  const sharedDrives = drivesRes.data.drives || [];

  console.log(`Found ${sharedDrives.length} Shared Drives\n`);

  const registry = [];
  let totalSheets = 0;
  let sheetsWithScripts = 0;

  for (const sharedDrive of sharedDrives) {
    console.log(`📁 Scanning: ${sharedDrive.name}`);

    // Find all spreadsheets in this drive
    const filesRes = await drive.files.list({
      driveId: sharedDrive.id,
      corpora: 'drive',
      q: "mimeType='application/vnd.google-apps.spreadsheet'",
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      pageSize: 1000,
      fields: 'files(id, name, modifiedTime, webViewLink)',
    });

    const sheets = filesRes.data.files || [];
    totalSheets += sheets.length;

    console.log(`   Found ${sheets.length} spreadsheets`);

    for (const sheet of sheets) {
      try {
        // Get container-bound script ID
        // Container-bound scripts have a special relationship with the spreadsheet
        // We need to use the Apps Script API to find the script

        const scriptId = await getContainerBoundScriptId(drive, sheet.id);

        if (scriptId) {
          registry.push({
            sheetId: sheet.id,
            sheetName: sheet.name,
            sheetUrl: sheet.webViewLink,
            scriptId: scriptId,
            sharedDrive: sharedDrive.name,
            sharedDriveId: sharedDrive.id,
            lastModified: sheet.modifiedTime,
            hasScript: true,
          });
          sheetsWithScripts++;
        } else {
          registry.push({
            sheetId: sheet.id,
            sheetName: sheet.name,
            sheetUrl: sheet.webViewLink,
            scriptId: null,
            sharedDrive: sharedDrive.name,
            sharedDriveId: sharedDrive.id,
            lastModified: sheet.modifiedTime,
            hasScript: false,
          });
        }
      } catch (error) {
        console.log(`   ⚠️  Skipped ${sheet.name}: ${error.message}`);
      }
    }

    console.log('');
  }

  // Save registry
  const registryFile = 'sheet-registry.json';
  fs.writeFileSync(registryFile, JSON.stringify(registry, null, 2));

  console.log('═'.repeat(60));
  console.log('✅ Registry Build Complete\n');
  console.log(`Total Spreadsheets: ${totalSheets}`);
  console.log(`With Apps Script: ${sheetsWithScripts}`);
  console.log(`Without Scripts: ${totalSheets - sheetsWithScripts}`);
  console.log(`\nRegistry saved to: ${registryFile}`);
  console.log('═'.repeat(60));

  return registry;
}

/**
 * Get container-bound script ID for a spreadsheet
 * Container-bound scripts are embedded in the spreadsheet
 */
async function getContainerBoundScriptId(drive, spreadsheetId) {
  // For container-bound scripts, the script ID is not directly accessible
  // via API. There are two approaches:
  //
  // 1. Manual mapping: Open each sheet, go to Extensions > Apps Script,
  //    and note the Script ID from Project Settings
  //
  // 2. Export/Import approach: Use Drive API to export the spreadsheet
  //    and look for the script in the export
  //
  // For this guide, we'll return null and require manual mapping
  // or use a pre-built registry

  // Placeholder - in production, implement one of the approaches above
  return null;
}

module.exports = buildSheetRegistry;

// Run if called directly
if (require.main === module) {
  buildSheetRegistry().catch(console.error);
}
```

### 4.2 Manual Registry Building

Since container-bound scripts don't expose their IDs via API easily, you'll need to build the registry manually or semi-automatically.

**Approach 1: Manual (for < 50 sheets)**

Create `sheet-registry.json`:

```json
[
  {
    "sheetId": "1AbC...",
    "sheetName": "Prior Auth Tracker 2025",
    "sheetUrl": "https://docs.google.com/spreadsheets/d/1AbC.../edit",
    "scriptId": "AKfyc...",
    "sharedDrive": "Prior Authorization Drive",
    "sharedDriveId": "0APX...",
    "lastModified": "2025-11-01T10:00:00Z",
    "hasScript": true
  },
  {
    "sheetId": "1DeF...",
    "sheetName": "Patient Intake Forms",
    "sheetUrl": "https://docs.google.com/spreadsheets/d/1DeF.../edit",
    "scriptId": "AKfyc...",
    "sharedDrive": "Patient Data Drive",
    "sharedDriveId": "0AQY...",
    "lastModified": "2025-10-28T14:30:00Z",
    "hasScript": true
  }
]
```

**For each sheet:**
1. Open in browser
2. Go to **Extensions** > **Apps Script**
3. Click **Project Settings**
4. Copy **Script ID**
5. Add to registry

**Approach 2: Automated Discovery (recommended for 240+ sheets)**

This requires a one-time setup where you create a custom function in each sheet to report its own script ID, then read it programmatically.

---

## Step 5: Validate Registry

### 5.1 Create Registry Validator

Create `validate-registry.js`:

```javascript
const fs = require('fs');

function validateRegistry(registryFile = 'sheet-registry.json') {
  console.log('🔍 Validating Sheet Registry...\n');

  const registry = JSON.parse(fs.readFileSync(registryFile, 'utf8'));

  const stats = {
    total: registry.length,
    withScripts: 0,
    withoutScripts: 0,
    duplicateIds: [],
    invalidEntries: [],
  };

  const seenScriptIds = new Set();
  const seenSheetIds = new Set();

  registry.forEach((entry, index) => {
    // Check required fields
    if (!entry.sheetId || !entry.sheetName || !entry.sharedDrive) {
      stats.invalidEntries.push({
        index,
        name: entry.sheetName || 'Unknown',
        issue: 'Missing required fields',
      });
      return;
    }

    // Count scripts
    if (entry.scriptId && entry.hasScript) {
      stats.withScripts++;

      // Check for duplicate script IDs
      if (seenScriptIds.has(entry.scriptId)) {
        stats.duplicateIds.push({
          scriptId: entry.scriptId,
          sheets: [entry.sheetName],
        });
      }
      seenScriptIds.add(entry.scriptId);
    } else {
      stats.withoutScripts++;
    }

    // Check for duplicate sheet IDs
    if (seenSheetIds.has(entry.sheetId)) {
      stats.invalidEntries.push({
        index,
        name: entry.sheetName,
        issue: 'Duplicate sheet ID',
      });
    }
    seenSheetIds.add(entry.sheetId);
  });

  console.log('Registry Statistics:');
  console.log(`  Total entries: ${stats.total}`);
  console.log(`  With scripts: ${stats.withScripts}`);
  console.log(`  Without scripts: ${stats.withoutScripts}`);
  console.log('');

  if (stats.duplicateIds.length > 0) {
    console.log('⚠️  Duplicate Script IDs:');
    stats.duplicateIds.forEach(dup => {
      console.log(`  ${dup.scriptId}: ${dup.sheets.join(', ')}`);
    });
    console.log('');
  }

  if (stats.invalidEntries.length > 0) {
    console.log('❌ Invalid Entries:');
    stats.invalidEntries.forEach(inv => {
      console.log(`  [${inv.index}] ${inv.name}: ${inv.issue}`);
    });
    console.log('');
  }

  if (stats.invalidEntries.length === 0 && stats.duplicateIds.length === 0) {
    console.log('✅ Registry is valid!');
    console.log(`✅ Ready to deploy to ${stats.withScripts} sheets`);
  } else {
    console.log('❌ Registry has errors. Fix before bulk deployment.');
  }

  return stats;
}

module.exports = validateRegistry;

if (require.main === module) {
  validateRegistry();
}
```

### 5.2 Run Validation

```bash
node validate-registry.js
```

**Expected output:**

```
🔍 Validating Sheet Registry...

Registry Statistics:
  Total entries: 240
  With scripts: 238
  Without scripts: 2

✅ Registry is valid!
✅ Ready to deploy to 238 sheets
```

---

## Step 6: Implement Bulk Deployment

### 6.1 Create Bulk Deployment Script

Create `bulk-deploy.js`:

```javascript
const { exec } = require('child_process');
const util = require('util');
const fs = require('fs');
const path = require('path');

const execPromise = util.promisify(exec);

class BulkDeploymentManager {
  constructor(registryFile, options = {}) {
    this.registry = JSON.parse(fs.readFileSync(registryFile, 'utf8'));
    this.concurrency = options.concurrency || 5;
    this.dryRun = options.dryRun || false;
    this.sourceCodeDir = options.sourceCodeDir || './src';
    this.results = [];
  }

  /**
   * Deploy to a single sheet
   */
  async deploySingle(entry) {
    const { sheetName, scriptId } = entry;

    if (!scriptId) {
      return {
        success: false,
        sheet: sheetName,
        error: 'No script ID in registry',
      };
    }

    console.log(`\n📤 Deploying to: ${sheetName}`);

    if (this.dryRun) {
      console.log('   [DRY RUN] Would deploy here');
      return {
        success: true,
        sheet: sheetName,
        dryRun: true,
      };
    }

    try {
      // Create temporary directory for this deployment
      const tempDir = `./temp-deploy/${scriptId}`;
      fs.mkdirSync(tempDir, { recursive: true });

      // Clone current script
      console.log('   ⬇️  Pulling current version...');
      await execPromise(`cd ${tempDir} && clasp clone ${scriptId}`);

      // Backup current version
      const backupDir = `./backups/${scriptId}`;
      fs.mkdirSync(backupDir, { recursive: true });
      fs.cpSync(tempDir, backupDir, { recursive: true });

      // Copy new code
      console.log('   📝 Applying new code...');
      const sourceFiles = fs.readdirSync(this.sourceCodeDir);
      sourceFiles.forEach(file => {
        if (file.endsWith('.gs') || file === 'appsscript.json') {
          fs.copyFileSync(
            path.join(this.sourceCodeDir, file),
            path.join(tempDir, file)
          );
        }
      });

      // Push to sheet
      console.log('   ⬆️  Pushing changes...');
      await execPromise(`cd ${tempDir} && clasp push --force`);

      console.log('   ✅ Deployment successful');

      // Cleanup temp directory
      fs.rmSync(tempDir, { recursive: true });

      return {
        success: true,
        sheet: sheetName,
        scriptId,
      };

    } catch (error) {
      console.log(`   ❌ Deployment failed: ${error.message}`);

      return {
        success: false,
        sheet: sheetName,
        scriptId,
        error: error.message,
      };
    }
  }

  /**
   * Deploy to all sheets in parallel batches
   */
  async deployAll() {
    console.log('🚀 Starting Bulk Deployment');
    console.log(`   Sheets: ${this.registry.length}`);
    console.log(`   Concurrency: ${this.concurrency}`);
    console.log(`   Dry Run: ${this.dryRun}`);
    console.log('═'.repeat(60));

    const sheetsWithScripts = this.registry.filter(e => e.scriptId);

    console.log(`\nDeploying to ${sheetsWithScripts.length} sheets...\n`);

    const startTime = Date.now();

    // Process in batches
    for (let i = 0; i < sheetsWithScripts.length; i += this.concurrency) {
      const batch = sheetsWithScripts.slice(i, i + this.concurrency);

      console.log(`\n🔄 Batch ${Math.floor(i / this.concurrency) + 1}/${Math.ceil(sheetsWithScripts.length / this.concurrency)}`);

      const batchPromises = batch.map(entry => this.deploySingle(entry));
      const batchResults = await Promise.all(batchPromises);

      this.results.push(...batchResults);

      // Progress update
      const completed = this.results.length;
      const successful = this.results.filter(r => r.success).length;
      const failed = this.results.filter(r => !r.success).length;

      console.log(`\n   Progress: ${completed}/${sheetsWithScripts.length}`);
      console.log(`   ✅ Successful: ${successful}`);
      console.log(`   ❌ Failed: ${failed}`);
    }

    const endTime = Date.now();
    const durationMinutes = ((endTime - startTime) / 1000 / 60).toFixed(2);

    this.printSummary(durationMinutes);

    return this.results;
  }

  /**
   * Retry failed deployments
   */
  async retryFailed() {
    const failed = this.results.filter(r => !r.success);

    if (failed.length === 0) {
      console.log('✅ No failed deployments to retry');
      return;
    }

    console.log(`\n🔄 Retrying ${failed.length} failed deployments...\n`);

    const retryResults = [];

    for (const failedResult of failed) {
      const entry = this.registry.find(e => e.sheetName === failedResult.sheet);
      if (entry) {
        const result = await this.deploySingle(entry);
        retryResults.push(result);
      }
    }

    // Update main results
    retryResults.forEach(retry => {
      const index = this.results.findIndex(r => r.sheet === retry.sheet);
      if (index !== -1) {
        this.results[index] = retry;
      }
    });

    console.log(`\n✅ Retry complete`);
    this.printSummary();
  }

  /**
   * Print deployment summary
   */
  printSummary(duration = null) {
    console.log('\n' + '═'.repeat(60));
    console.log('📊 Deployment Summary');
    console.log('═'.repeat(60));

    const total = this.results.length;
    const successful = this.results.filter(r => r.success).length;
    const failed = this.results.filter(r => !r.success).length;
    const successRate = ((successful / total) * 100).toFixed(1);

    console.log(`Total: ${total}`);
    console.log(`✅ Successful: ${successful} (${successRate}%)`);
    console.log(`❌ Failed: ${failed}`);

    if (duration) {
      console.log(`⏱️  Duration: ${duration} minutes`);
    }

    if (failed > 0) {
      console.log('\n❌ Failed Sheets:');
      this.results
        .filter(r => !r.success)
        .forEach(r => {
          console.log(`   - ${r.sheet}: ${r.error}`);
        });
    }

    console.log('═'.repeat(60));

    // Save results
    fs.writeFileSync(
      'deployment-results.json',
      JSON.stringify(this.results, null, 2)
    );
    console.log('\n📁 Results saved to: deployment-results.json');
  }

  /**
   * Rollback deployment
   */
  async rollback(sheetName) {
    const entry = this.registry.find(e => e.sheetName === sheetName);

    if (!entry || !entry.scriptId) {
      console.log('❌ Sheet not found in registry');
      return;
    }

    const backupDir = `./backups/${entry.scriptId}`;

    if (!fs.existsSync(backupDir)) {
      console.log('❌ No backup found for this sheet');
      return;
    }

    console.log(`🔄 Rolling back: ${sheetName}`);

    try {
      // Push backup to sheet
      await execPromise(`cd ${backupDir} && clasp push --force`);

      console.log('✅ Rollback successful');

    } catch (error) {
      console.log(`❌ Rollback failed: ${error.message}`);
    }
  }
}

module.exports = BulkDeploymentManager;
```

### 6.2 Create Deployment CLI

Create `deploy-cli.js`:

```javascript
const BulkDeploymentManager = require('./bulk-deploy');

const args = process.argv.slice(2);
const command = args[0];

async function main() {
  const manager = new BulkDeploymentManager('sheet-registry.json', {
    concurrency: 5,
    dryRun: args.includes('--dry-run'),
    sourceCodeDir: './src',
  });

  switch (command) {
    case 'deploy':
      await manager.deployAll();
      break;

    case 'retry':
      // Load previous results
      const fs = require('fs');
      manager.results = JSON.parse(fs.readFileSync('deployment-results.json'));
      await manager.retryFailed();
      break;

    case 'rollback':
      const sheetName = args[1];
      if (!sheetName) {
        console.log('Usage: node deploy-cli.js rollback "Sheet Name"');
        process.exit(1);
      }
      await manager.rollback(sheetName);
      break;

    default:
      console.log('Usage:');
      console.log('  node deploy-cli.js deploy [--dry-run]');
      console.log('  node deploy-cli.js retry');
      console.log('  node deploy-cli.js rollback "Sheet Name"');
      process.exit(1);
  }
}

main().catch(console.error);
```

### 6.3 Run Bulk Deployment

**Dry run first:**

```bash
node deploy-cli.js deploy --dry-run
```

**Production deployment:**

```bash
node deploy-cli.js deploy
```

**Retry failed:**

```bash
node deploy-cli.js retry
```

**Rollback single sheet:**

```bash
node deploy-cli.js rollback "Sheet Name"
```

---

## Step 7: Testing and Validation

### 7.1 Pilot Test (20 sheets)

Before full deployment:

1. Filter registry to 20 test sheets
2. Run deployment
3. Manually verify 5 random sheets
4. Check success rate > 95%

### 7.2 Full Deployment

Once pilot successful:

1. Run full deployment
2. Monitor progress
3. Check deployment-results.json
4. Retry any failures
5. Spot-check 10% of sheets

---

## Troubleshooting

### Issue: "User has not enabled the Apps Script API"

**Solution:**
1. Visit [Apps Script Settings](https://script.google.com/home/usersettings)
2. Sign in as `automation@ssdsbc.com`
3. Enable **Google Apps Script API**

### Issue: clasp push fails with "Script not found"

**Solution:**
1. Verify script ID is correct
2. Ensure automation account has edit access to the sheet
3. Check that OAuth includes Apps Script scopes

### Issue: "Concurrent modification" errors

**Solution:**
1. Reduce concurrency (use 3 instead of 5)
2. Add delays between batches
3. Implement exponential backoff

---

## Next Steps

After completing Apps Script deployment:

1. ✅ Mark Phase 4 goals as complete in GOALS.md
2. ➡️ Proceed to Phase 5: Combined Workflows
3. ➡️ Integrate Gemini + Drive + Apps Script

---

## Checklist: Apps Script Deployment Complete

- [ ] clasp CLI installed
- [ ] Authentication successful
- [ ] Single sheet deployment tested
- [ ] Sheet registry built (240+ entries)
- [ ] Registry validated
- [ ] Pilot deployment successful (20 sheets)
- [ ] Full deployment successful (240+ sheets)
- [ ] Success rate > 95%
- [ ] Backups created for all sheets
- [ ] Rollback tested
- [ ] deployment-results.json saved

**Estimated Time:** 10-12 hours
**Priority:** Critical
**Dependencies:**
- OAuth setup complete
- Apps Script API enabled
- Manager access to all sheets

---

**Document Owner:** Marvin Maruthur
**Next Review:** After Phase 4 completion
**Related Documents:**
- [OAUTH-SETUP-GUIDE.md](OAUTH-SETUP-GUIDE.md)
- [GOOGLE-DRIVE-API-GUIDE.md](GOOGLE-DRIVE-API-GUIDE.md)

#!/usr/bin/env node

/**
 * Snapshot All Production Sheets
 *
 * Pulls code from all production Google Sheets and updates the production-sheets/ folder.
 * This script runs twice daily (9 AM and 5 PM) to track production state.
 *
 * Purpose:
 * - Track production state
 * - Detect unauthorized changes (drift)
 * - Maintain backup history
 *
 * Usage:
 *   node scripts/snapshot-all-production.js
 *   npm run snapshot
 *
 * Authentication:
 *   Uses service account credentials via Apps Script API (no OAuth tokens needed)
 *   Set GOOGLE_APPLICATION_CREDENTIALS environment variable to service account key path
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const os = require('os');

const REGISTRY_PATH = path.join(__dirname, '../config/sheet-registry.json');
const PRODUCTION_DIR = path.join(__dirname, '../production-sheets');

/**
 * Initialize Apps Script API client with service account
 */
async function initializeAppsScriptAPI() {
  // Load service account credentials
  let credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  // Fallback to default location if not set
  if (!credentialsPath) {
    credentialsPath = path.join(os.homedir(), 'service-account-keys/google-sheets-vc.json');
  }

  if (!fs.existsSync(credentialsPath)) {
    throw new Error(`Service account credentials not found at: ${credentialsPath}`);
  }

  const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: [
      'https://www.googleapis.com/auth/script.projects.readonly',
      'https://www.googleapis.com/auth/drive.readonly'
    ],
  });

  const authClient = await auth.getClient();
  const script = google.script({ version: 'v1', auth: authClient });

  return script;
}

/**
 * Load sheet registry
 */
function loadRegistry() {
  try {
    return JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
  } catch (error) {
    console.error('❌ Error loading registry:', error.message);
    process.exit(1);
  }
}

/**
 * Save sheet registry
 */
function saveRegistry(registry) {
  try {
    registry.metadata.lastUpdated = new Date().toISOString();
    fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2));
  } catch (error) {
    console.error('❌ Error saving registry:', error.message);
  }
}

/**
 * Snapshot a single production sheet using Apps Script API
 */
async function snapshotSheet(sheet, scriptAPI) {
  const folderName = `${sheet.id}_${sheet.name.replace(/[^a-zA-Z0-9]/g, '-')}`;
  const sheetPath = path.join(PRODUCTION_DIR, folderName);
  const livePath = path.join(sheetPath, 'live');
  const metadataPath = path.join(sheetPath, 'metadata');

  // Create directories
  if (!fs.existsSync(livePath)) {
    fs.mkdirSync(livePath, { recursive: true });
  }
  if (!fs.existsSync(metadataPath)) {
    fs.mkdirSync(metadataPath, { recursive: true });
  }

  console.log(`📸 Snapshotting: ${sheet.name} (${sheet.id})`);

  try {
    // Pull code from production Apps Script using Apps Script API
    const response = await scriptAPI.projects.getContent({
      scriptId: sheet.production.scriptId
    });

    if (!response.data.files || response.data.files.length === 0) {
      throw new Error('No files found in script project');
    }

    // Save each file to the live directory
    for (const file of response.data.files) {
      const fileName = file.name;
      const fileContent = file.source || '';

      // Determine file extension based on type
      let extension = '';
      if (file.type === 'SERVER_JS') {
        extension = '.gs';
      } else if (file.type === 'HTML') {
        extension = '.html';
      } else if (file.type === 'JSON') {
        extension = '.json';
      }

      const filePath = path.join(livePath, fileName + extension);
      fs.writeFileSync(filePath, fileContent, 'utf8');
    }

    console.log(`  ✅ Retrieved ${response.data.files.length} file(s)`);

    // Update last snapshot timestamp
    sheet.production.lastSnapshot = new Date().toISOString();

    // Save metadata
    const timestamp = new Date().toISOString();
    fs.writeFileSync(
      path.join(metadataPath, 'last-updated.txt'),
      timestamp
    );

    // Create README if it doesn't exist
    const readmePath = path.join(sheetPath, 'README.md');
    if (!fs.existsSync(readmePath)) {
      const readme = `# ${sheet.name}

**Sheet ID:** ${sheet.production.sheetId}
**Script ID:** ${sheet.production.scriptId}
**Category:** ${sheet.category}
**Criticality:** ${sheet.criticality}

## Description
${sheet.description || 'No description provided'}

## Production Info
- **URL:** ${sheet.production.url}
- **Owner:** ${sheet.production.owner}
- **Last Snapshot:** ${timestamp}

## Status
${sheet.status}
`;
      fs.writeFileSync(readmePath, readme);
    }

    console.log(`✅ ${sheet.name} - snapshot complete`);
    return { success: true, sheet: sheet.id };

  } catch (error) {
    console.error(`❌ Error snapshotting ${sheet.name}:`, error.message);
    return { success: false, sheet: sheet.id, reason: error.message };
  }
}

/**
 * Main function to snapshot all production sheets
 */
async function snapshotAllProduction() {
  console.log('🚀 Starting production snapshot process...\n');
  console.log(`⏰ ${new Date().toISOString()}\n`);

  // Initialize Apps Script API client
  console.log('🔑 Initializing Apps Script API with service account...');
  const scriptAPI = await initializeAppsScriptAPI();
  console.log('✅ Apps Script API initialized\n');

  const registry = loadRegistry();

  // Filter sheets that have production script IDs
  let productionSheets = registry.sheets.filter(s => s.production.scriptId);
  const totalSheets = registry.sheets.length;
  const skippedSheets = totalSheets - productionSheets.length;

  if (productionSheets.length === 0) {
    console.log('ℹ️  No production sheets found in registry');
    console.log('ℹ️  Use: npm run registry:update --add to add sheets\n');
    return;
  }

  // Support batch processing (for CI/CD to avoid OAuth timeout)
  const batchSize = parseInt(process.env.BATCH_SIZE || productionSheets.length);
  const batchOffset = parseInt(process.env.BATCH_OFFSET || 0);

  if (batchSize < productionSheets.length) {
    console.log(`📦 Batch mode: Processing ${batchSize} sheets starting at offset ${batchOffset}`);
    productionSheets = productionSheets.slice(batchOffset, batchOffset + batchSize);
  }

  console.log(`Found ${productionSheets.length} sheet(s) with script IDs (${totalSheets} total, ${skippedSheets} without script IDs)\n`);

  // Ensure production directory exists
  if (!fs.existsSync(PRODUCTION_DIR)) {
    fs.mkdirSync(PRODUCTION_DIR, { recursive: true });
  }

  // Track results
  const results = {
    success: [],
    failed: []
  };

  // Process each sheet
  for (const sheet of productionSheets) {
    const result = await snapshotSheet(sheet, scriptAPI);

    if (result.success) {
      results.success.push(result.sheet);
    } else {
      results.failed.push({ sheet: result.sheet, reason: result.reason });
    }

    // Small delay between sheets to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Save updated registry
  saveRegistry(registry);

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Snapshot Summary');
  console.log('='.repeat(60));
  console.log(`✅ Successful: ${results.success.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);

  if (results.failed.length > 0) {
    console.log('\n❌ Failed sheets:');
    results.failed.forEach(({ sheet, reason }) => {
      console.log(`  - ${sheet}: ${reason}`);
    });
  }

  console.log('='.repeat(60) + '\n');

  // Exit with error code if any sheets failed
  if (results.failed.length > 0) {
    process.exit(1);
  }
}

// Run the snapshot process
snapshotAllProduction().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

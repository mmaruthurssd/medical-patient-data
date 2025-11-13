#!/usr/bin/env node

/**
 * Snapshot All Staging Sheets
 *
 * Pulls code from all staging/DEV Google Sheets and updates the staging-sheets/ folder.
 * This script runs twice daily (9 AM and 5 PM) to track staging state.
 *
 * Usage:
 *   node scripts/snapshot-all-staging.js
 *   npm run snapshot:staging
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');

const execAsync = util.promisify(exec);

const REGISTRY_PATH = path.join(__dirname, '../config/sheet-registry.json');
const STAGING_DIR = path.join(__dirname, '../staging-sheets');

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
 * Snapshot a single staging sheet
 */
async function snapshotSheet(sheet) {
  const folderName = `${sheet.id}_${sheet.name.replace(/[^a-zA-Z0-9]/g, '-')}-DEV`;
  const sheetPath = path.join(STAGING_DIR, folderName);
  const devPath = path.join(sheetPath, 'dev');
  const claspConfigPath = path.join(sheetPath, '.clasp.json');

  // Create directories
  if (!fs.existsSync(devPath)) {
    fs.mkdirSync(devPath, { recursive: true });
  }

  // Create .clasp.json with staging script ID
  const claspConfig = {
    scriptId: sheet.staging.scriptId,
    rootDir: devPath
  };
  fs.writeFileSync(claspConfigPath, JSON.stringify(claspConfig, null, 2));

  console.log(`📸 Snapshotting: [DEV] ${sheet.name} (${sheet.id})`);

  try {
    // Pull code from staging Apps Script
    const { stdout, stderr } = await execAsync(
      `cd "${devPath}" && clasp pull --rootDir .`
    );

    if (stderr && !stderr.includes('Cloned') && !stderr.includes('Warning')) {
      console.error(`  ⚠️  Warning: ${stderr}`);
    }

    console.log(`✅ [DEV] ${sheet.name} - snapshot complete`);
    return { success: true, sheet: sheet.id };

  } catch (error) {
    console.error(`❌ Error snapshotting [DEV] ${sheet.name}:`, error.message);
    return { success: false, sheet: sheet.id, reason: error.message };
  }
}

/**
 * Main function to snapshot all staging sheets
 */
async function snapshotAllStaging() {
  console.log('🚀 Starting staging snapshot process...\n');
  console.log(`⏰ ${new Date().toISOString()}\n`);

  const registry = loadRegistry();

  // Filter sheets that have staging IDs
  const stagingSheets = registry.sheets.filter(s => s.staging.scriptId);

  if (stagingSheets.length === 0) {
    console.log('ℹ️  No staging sheets found in registry');
    console.log('ℹ️  Create DEV sheets first using: npm run create-dev\n');
    return;
  }

  console.log(`Found ${stagingSheets.length} staging sheet(s) in registry\n`);

  // Ensure staging directory exists
  if (!fs.existsSync(STAGING_DIR)) {
    fs.mkdirSync(STAGING_DIR, { recursive: true });
  }

  // Track results
  const results = {
    success: [],
    failed: []
  };

  // Process each sheet
  for (const sheet of stagingSheets) {
    const result = await snapshotSheet(sheet);

    if (result.success) {
      results.success.push(result.sheet);
    } else {
      results.failed.push({ sheet: result.sheet, reason: result.reason });
    }

    // Small delay between sheets to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Staging Snapshot Summary');
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
snapshotAllStaging().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

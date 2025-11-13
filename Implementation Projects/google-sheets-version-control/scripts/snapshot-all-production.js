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
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');

const execAsync = util.promisify(exec);

const REGISTRY_PATH = path.join(__dirname, '../config/sheet-registry.json');
const PRODUCTION_DIR = path.join(__dirname, '../production-sheets');

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
 * Snapshot a single production sheet
 */
async function snapshotSheet(sheet) {
  const folderName = `${sheet.id}_${sheet.name.replace(/[^a-zA-Z0-9]/g, '-')}`;
  const sheetPath = path.join(PRODUCTION_DIR, folderName);
  const livePath = path.join(sheetPath, 'live');
  const metadataPath = path.join(sheetPath, 'metadata');
  const claspConfigPath = path.join(sheetPath, '.clasp.json');

  // Create directories
  if (!fs.existsSync(livePath)) {
    fs.mkdirSync(livePath, { recursive: true });
  }
  if (!fs.existsSync(metadataPath)) {
    fs.mkdirSync(metadataPath, { recursive: true });
  }

  // Create .clasp.json with production script ID
  const claspConfig = {
    scriptId: sheet.production.scriptId
  };
  fs.writeFileSync(claspConfigPath, JSON.stringify(claspConfig, null, 2));

  console.log(`📸 Snapshotting: ${sheet.name} (${sheet.id})`);

  try {
    // Pull code from production Apps Script
    // Copy .clasp.json to live directory for clasp
    fs.copyFileSync(claspConfigPath, path.join(livePath, '.clasp.json'));

    const { stdout, stderr } = await execAsync(
      `cd "${livePath}" && npx clasp pull`
    );

    // Remove temporary .clasp.json from live directory
    fs.unlinkSync(path.join(livePath, '.clasp.json'));

    if (stderr && !stderr.includes('Cloned') && !stderr.includes('Warning')) {
      console.error(`  ⚠️  Warning: ${stderr}`);
    }

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
    const result = await snapshotSheet(sheet);

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

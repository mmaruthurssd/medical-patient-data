#!/usr/bin/env node

/**
 * Populate Registry IDs Script
 *
 * Purpose: Create metadata/registry-id.txt files for all PROD sheets
 *          by extracting registry IDs from directory names
 *
 * Registry ID Format: D25-XXX, S25-XXX, P25-XXX, PRS25-XXX
 *
 * Directory naming format examples:
 * - sheet-016_PROD--Biologics_Coordinator_-_Dashboards_-_D25-266_-_All_SSD_-_Active
 * - sheet-160_PROD--Protocol_Sheet_-_Template_-_Shared_-_S25-415_-_All_SSD_-_Active
 * - sheet-201_PROD--AK_W_MM_Collections_Processing_Sheet_PHI_-_Processing_Sheets_-_PRS25-462_-...
 *
 * This script:
 * 1. Scans all PROD sheet directories
 * 2. Extracts registry ID from directory name
 * 3. Creates metadata/ directory if it doesn't exist
 * 4. Writes registry ID to metadata/registry-id.txt
 * 5. Logs all actions
 */

const fs = require('fs');
const path = require('path');

const PRODUCTION_DIR = '/Users/mmaruthurnew/Desktop/medical-patient-data/Implementation Projects/google-sheets-version-control/production-sheets';
const LOG_FILE = '/Users/mmaruthurnew/Desktop/medical-patient-data/Implementation Projects/google-sheets-version-control/logs/populate-registry-ids.log';

// Set to true for dry-run
const DRY_RUN = false;

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  fs.appendFileSync(LOG_FILE, logMessage + '\n');
}

function extractRegistryId(dirName) {
  // Match registry ID patterns: D25-XXX, S25-XXX, P25-XXX, PRS25-XXX
  const match = dirName.match(/([DPS](?:RS)?25-\d{3,4})/);

  if (!match) {
    return null;
  }

  return match[1];
}

function getProductionSheets() {
  const dirs = fs.readdirSync(PRODUCTION_DIR)
    .filter(dir => dir.startsWith('sheet-') && dir.includes('_PROD--'))
    .filter(dir => {
      const fullPath = path.join(PRODUCTION_DIR, dir);
      return fs.statSync(fullPath).isDirectory();
    });

  return dirs.map(dir => {
    const match = dir.match(/^sheet-(\d+)_PROD--(.+)$/);
    if (!match) return null;

    const serial = parseInt(match[1]);
    const registryId = extractRegistryId(dir);

    return {
      serial,
      dirName: dir,
      registryId,
      fullPath: path.join(PRODUCTION_DIR, dir)
    };
  }).filter(Boolean);
}

function populateRegistryId(sheet) {
  if (!sheet.registryId) {
    log(`  ⚠️  No registry ID found in directory name`);
    return false;
  }

  const metadataDir = path.join(sheet.fullPath, 'metadata');
  const registryIdFile = path.join(metadataDir, 'registry-id.txt');

  // Check if file already exists and has correct content
  if (fs.existsSync(registryIdFile)) {
    const existingContent = fs.readFileSync(registryIdFile, 'utf8').trim();
    if (existingContent === sheet.registryId) {
      log(`  ✓ Already correct: ${sheet.registryId}`);
      return true;
    } else {
      log(`  ⚠️  Updating: ${existingContent} → ${sheet.registryId}`);
    }
  }

  if (DRY_RUN) {
    log(`  [DRY-RUN] Would write: ${sheet.registryId}`);
    return true;
  }

  try {
    // Create metadata directory if it doesn't exist
    if (!fs.existsSync(metadataDir)) {
      fs.mkdirSync(metadataDir, { recursive: true });
      log(`  ✓ Created metadata directory`);
    }

    // Write registry ID
    fs.writeFileSync(registryIdFile, sheet.registryId);
    log(`  ✓ Wrote registry ID: ${sheet.registryId}`);
    return true;
  } catch (error) {
    log(`  ✗ Failed: ${error.message}`);
    return false;
  }
}

function main() {
  log('='.repeat(80));
  log('POPULATE REGISTRY IDS SCRIPT STARTED');
  log('='.repeat(80));
  log(`Mode: ${DRY_RUN ? 'DRY-RUN (no changes will be made)' : 'LIVE (will create files)'}`);
  log('');

  // Get all PROD sheets
  const prodSheets = getProductionSheets();
  log(`Found ${prodSheets.length} PROD sheets`);
  log('');

  // Statistics
  let successful = 0;
  let alreadyCorrect = 0;
  let noRegistryId = 0;
  let failed = 0;

  // Process each sheet
  log('-'.repeat(80));
  log('PROCESSING SHEETS');
  log('-'.repeat(80));

  prodSheets.forEach(sheet => {
    log(`Serial ${String(sheet.serial).padStart(3, '0')}: ${sheet.dirName.substring(0, 60)}...`);

    if (!sheet.registryId) {
      noRegistryId++;
      populateRegistryId(sheet);
      return;
    }

    const metadataFile = path.join(sheet.fullPath, 'metadata', 'registry-id.txt');
    const existsAndCorrect = fs.existsSync(metadataFile) &&
                             fs.readFileSync(metadataFile, 'utf8').trim() === sheet.registryId;

    if (existsAndCorrect) {
      alreadyCorrect++;
      log(`  ✓ Already correct: ${sheet.registryId}`);
    } else if (populateRegistryId(sheet)) {
      successful++;
    } else {
      failed++;
    }

    log('');
  });

  // Summary
  log('='.repeat(80));
  log('SUMMARY');
  log('='.repeat(80));
  log(`Total PROD sheets:        ${prodSheets.length}`);
  log(`Already correct:          ${alreadyCorrect}`);
  log(`Successfully populated:   ${successful}`);
  log(`No registry ID found:     ${noRegistryId}`);
  log(`Failed:                   ${failed}`);
  log('');

  const totalProcessed = alreadyCorrect + successful + noRegistryId;
  log(`Total with registry ID:   ${totalProcessed}`);
  log(`Coverage:                 ${((totalProcessed / prodSheets.length) * 100).toFixed(1)}%`);
  log('');

  if (noRegistryId === 0 && failed === 0) {
    log('✅ SUCCESS: All PROD sheets have registry IDs!');
  } else if (noRegistryId > 0) {
    log(`⚠️  WARNING: ${noRegistryId} sheets have no registry ID in directory name`);
  } else {
    log(`⚠️  WARNING: ${failed} sheets failed to process`);
  }

  log('='.repeat(80));
  log('SCRIPT COMPLETED');
  log('='.repeat(80));

  return {
    total: prodSheets.length,
    alreadyCorrect,
    successful,
    noRegistryId,
    failed
  };
}

// Run the script
try {
  const results = main();
  process.exit(results.failed > 0 || results.noRegistryId > 0 ? 1 : 0);
} catch (error) {
  log(`FATAL ERROR: ${error.message}`);
  log(error.stack);
  process.exit(1);
}

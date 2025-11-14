#!/usr/bin/env node

/**
 * DEV3 Cleanup Script
 *
 * Purpose: Clean up duplicate and orphaned DEV3 directories to achieve
 *          perfect 204 PROD = 204 DEV3 match.
 *
 * Actions:
 * 1. Identify 27 serials with multiple DEV3 directories
 * 2. Keep the newest/correct DEV3, delete old duplicates
 * 3. Identify 15 orphaned DEV3 directories (no PROD exists)
 * 4. Delete orphaned DEV3 directories
 * 5. Backup all deleted directories before removal
 * 6. Log all actions
 *
 * Safety:
 * - Creates backup before deletion
 * - Dry-run mode available
 * - Comprehensive logging
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PRODUCTION_DIR = '/Users/mmaruthurnew/Desktop/medical-patient-data/Implementation Projects/google-sheets-version-control/production-sheets';
const BACKUP_DIR = '/Users/mmaruthurnew/Desktop/medical-patient-data/Implementation Projects/google-sheets-version-control/backups/dev3-cleanup-20251113';
const LOG_FILE = '/Users/mmaruthurnew/Desktop/medical-patient-data/Implementation Projects/google-sheets-version-control/logs/cleanup-dev3-duplicates.log';

// Set to true for dry-run (no actual deletion)
const DRY_RUN = false;

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  fs.appendFileSync(LOG_FILE, logMessage + '\n');
}

function getDirectories() {
  const allDirs = fs.readdirSync(PRODUCTION_DIR)
    .filter(dir => dir.startsWith('sheet-'))
    .filter(dir => {
      const fullPath = path.join(PRODUCTION_DIR, dir);
      return fs.statSync(fullPath).isDirectory();
    });

  return allDirs;
}

function parseDirectoryName(dirName) {
  // Format: sheet-XXX_PROD-- or sheet-XXX_DEV3--
  const match = dirName.match(/^sheet-(\d+)_(PROD|DEV3)--/);
  if (!match) return null;

  return {
    serial: parseInt(match[1]),
    type: match[2],
    fullName: dirName
  };
}

function groupBySerial(directories) {
  const grouped = {};

  directories.forEach(dir => {
    const parsed = parseDirectoryName(dir);
    if (!parsed) return;

    if (!grouped[parsed.serial]) {
      grouped[parsed.serial] = { PROD: [], DEV3: [] };
    }

    grouped[parsed.serial][parsed.type].push(dir);
  });

  return grouped;
}

function getDirectoryCreationTime(dirPath) {
  try {
    // Check metadata/created-from-prod.txt first (for newly created DEV3)
    const createdFile = path.join(dirPath, 'metadata', 'created-from-prod.txt');
    if (fs.existsSync(createdFile)) {
      const content = fs.readFileSync(createdFile, 'utf8').trim();
      return new Date(content);
    }

    // Fall back to directory creation time
    const stats = fs.statSync(dirPath);
    return stats.birthtime;
  } catch (error) {
    log(`  Warning: Could not get creation time for ${dirPath}: ${error.message}`);
    return new Date(0); // Return epoch if we can't determine
  }
}

function backupDirectory(dirName) {
  if (DRY_RUN) {
    log(`  [DRY-RUN] Would backup: ${dirName}`);
    return true;
  }

  try {
    // Create backup directory if it doesn't exist
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    const sourcePath = path.join(PRODUCTION_DIR, dirName);
    const backupPath = path.join(BACKUP_DIR, dirName);

    // Copy directory to backup
    execSync(`cp -R "${sourcePath}" "${backupPath}"`);
    log(`  ✓ Backed up: ${dirName}`);
    return true;
  } catch (error) {
    log(`  ✗ Backup failed for ${dirName}: ${error.message}`);
    return false;
  }
}

function deleteDirectory(dirName) {
  if (DRY_RUN) {
    log(`  [DRY-RUN] Would delete: ${dirName}`);
    return true;
  }

  try {
    const dirPath = path.join(PRODUCTION_DIR, dirName);
    execSync(`rm -rf "${dirPath}"`);
    log(`  ✓ Deleted: ${dirName}`);
    return true;
  } catch (error) {
    log(`  ✗ Deletion failed for ${dirName}: ${error.message}`);
    return false;
  }
}

function main() {
  log('='.repeat(80));
  log('DEV3 CLEANUP SCRIPT STARTED');
  log('='.repeat(80));
  log(`Mode: ${DRY_RUN ? 'DRY-RUN (no changes will be made)' : 'LIVE (will delete directories)'}`);
  log('');

  // Get all directories
  const allDirs = getDirectories();
  const grouped = groupBySerial(allDirs);

  log(`Total directories found: ${allDirs.length}`);
  log(`Total serials found: ${Object.keys(grouped).length}`);
  log('');

  // Track statistics
  let duplicatesFound = 0;
  let duplicatesDeleted = 0;
  let orphansFound = 0;
  let orphansDeleted = 0;

  // Phase 1: Handle duplicates (multiple DEV3 for same serial)
  log('PHASE 1: HANDLING DUPLICATE DEV3 DIRECTORIES');
  log('-'.repeat(80));

  for (const [serial, dirs] of Object.entries(grouped)) {
    if (dirs.DEV3.length > 1) {
      duplicatesFound += dirs.DEV3.length - 1;

      log(`Serial ${serial}: Found ${dirs.DEV3.length} DEV3 directories (keeping newest)`);

      // Get creation times for all DEV3 directories
      const dev3WithTimes = dirs.DEV3.map(dirName => {
        const dirPath = path.join(PRODUCTION_DIR, dirName);
        return {
          name: dirName,
          time: getDirectoryCreationTime(dirPath)
        };
      });

      // Sort by creation time (newest first)
      dev3WithTimes.sort((a, b) => b.time - a.time);

      // Keep the newest, delete the rest
      const toKeep = dev3WithTimes[0];
      const toDelete = dev3WithTimes.slice(1);

      log(`  Keeping: ${toKeep.name} (${toKeep.time.toISOString()})`);

      for (const dir of toDelete) {
        log(`  Deleting old duplicate: ${dir.name} (${dir.time.toISOString()})`);

        if (backupDirectory(dir.name)) {
          if (deleteDirectory(dir.name)) {
            duplicatesDeleted++;
          }
        }
      }

      log('');
    }
  }

  log(`Duplicate summary: Found ${duplicatesFound}, deleted ${duplicatesDeleted}`);
  log('');

  // Phase 2: Handle orphans (DEV3 exists but no PROD)
  log('PHASE 2: HANDLING ORPHANED DEV3 DIRECTORIES');
  log('-'.repeat(80));

  for (const [serial, dirs] of Object.entries(grouped)) {
    if (dirs.PROD.length === 0 && dirs.DEV3.length > 0) {
      orphansFound += dirs.DEV3.length;

      log(`Serial ${serial}: Orphaned DEV3 (no PROD exists)`);

      for (const dirName of dirs.DEV3) {
        log(`  Deleting orphan: ${dirName}`);

        if (backupDirectory(dirName)) {
          if (deleteDirectory(dirName)) {
            orphansDeleted++;
          }
        }
      }

      log('');
    }
  }

  log(`Orphan summary: Found ${orphansFound}, deleted ${orphansDeleted}`);
  log('');

  // Final summary
  log('='.repeat(80));
  log('CLEANUP SUMMARY');
  log('='.repeat(80));
  log(`Total duplicates found: ${duplicatesFound}`);
  log(`Total duplicates deleted: ${duplicatesDeleted}`);
  log(`Total orphans found: ${orphansFound}`);
  log(`Total orphans deleted: ${orphansDeleted}`);
  log(`Total directories deleted: ${duplicatesDeleted + orphansDeleted}`);
  log('');

  if (!DRY_RUN) {
    log(`Backup location: ${BACKUP_DIR}`);
    log('');
  }

  // Verify final counts
  const finalDirs = getDirectories();
  const finalGrouped = groupBySerial(finalDirs);

  const prodCount = Object.values(finalGrouped).filter(d => d.PROD.length > 0).length;
  const dev3Count = Object.values(finalGrouped).filter(d => d.DEV3.length > 0).length;
  const perfectPairs = Object.values(finalGrouped).filter(d =>
    d.PROD.length === 1 && d.DEV3.length === 1
  ).length;

  log('FINAL STATE:');
  log(`  PROD sheets: ${prodCount}`);
  log(`  DEV3 sheets: ${dev3Count}`);
  log(`  Perfect pairs: ${perfectPairs}`);
  log('');

  if (prodCount === dev3Count && perfectPairs === prodCount) {
    log('✅ SUCCESS: Perfect 204/204 match achieved!');
  } else {
    log('⚠️  WARNING: Not yet at perfect match. Review results.');
  }

  log('='.repeat(80));
  log('CLEANUP SCRIPT COMPLETED');
  log('='.repeat(80));
}

// Run the script
try {
  main();
} catch (error) {
  log(`FATAL ERROR: ${error.message}`);
  log(error.stack);
  process.exit(1);
}

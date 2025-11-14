#!/usr/bin/env node

/**
 * Snapshot Single Production Sheet
 *
 * Pulls code from a specific production Google Sheet.
 *
 * Usage:
 *   node scripts/snapshot-single-sheet.js <serial> <name> <spreadsheetId> <scriptId>
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');

const execAsync = util.promisify(exec);

const PRODUCTION_DIR = path.join(__dirname, '../production-sheets');

/**
 * Snapshot a single production sheet
 */
async function snapshotSheet(serial, name, spreadsheetId, scriptId) {
  const serialPadded = String(serial).padStart(3, '0');
  const folderName = `sheet-${serialPadded}_PROD--${name.replace(/[^a-zA-Z0-9]/g, '-')}`;
  const sheetPath = path.join(PRODUCTION_DIR, folderName);
  const livePath = path.join(sheetPath, 'live');
  const metadataPath = path.join(sheetPath, 'metadata');
  const claspConfigPath = path.join(sheetPath, '.clasp.json');

  console.log(`📸 Snapshotting: ${name} (serial ${serial})`);
  console.log(`   Spreadsheet ID: ${spreadsheetId}`);
  console.log(`   Script ID: ${scriptId}`);
  console.log(`   Folder: ${folderName}\n`);

  // Create directories
  if (!fs.existsSync(livePath)) {
    fs.mkdirSync(livePath, { recursive: true });
    console.log(`✅ Created directory: ${livePath}`);
  }
  if (!fs.existsSync(metadataPath)) {
    fs.mkdirSync(metadataPath, { recursive: true });
    console.log(`✅ Created directory: ${metadataPath}`);
  }

  // Create .clasp.json with production script ID
  const claspConfig = {
    scriptId: scriptId
  };
  fs.writeFileSync(claspConfigPath, JSON.stringify(claspConfig, null, 2));
  console.log(`✅ Created .clasp.json`);

  try {
    // Copy .clasp.json to live directory for clasp
    fs.copyFileSync(claspConfigPath, path.join(livePath, '.clasp.json'));

    console.log(`\n🔄 Running clasp pull...`);
    const { stdout, stderr } = await execAsync(
      `cd "${livePath}" && npx clasp pull`
    );

    if (stdout) {
      console.log(stdout);
    }

    // Remove temporary .clasp.json from live directory
    fs.unlinkSync(path.join(livePath, '.clasp.json'));

    if (stderr && !stderr.includes('Cloned') && !stderr.includes('Warning')) {
      console.error(`⚠️  Warning: ${stderr}`);
    }

    // Save metadata
    const timestamp = new Date().toISOString();
    fs.writeFileSync(
      path.join(metadataPath, 'last-updated.txt'),
      timestamp
    );
    fs.writeFileSync(
      path.join(metadataPath, 'spreadsheet-id.txt'),
      spreadsheetId
    );
    fs.writeFileSync(
      path.join(metadataPath, 'script-id.txt'),
      scriptId
    );
    fs.writeFileSync(
      path.join(metadataPath, 'sheet-name.txt'),
      name
    );

    console.log(`✅ Saved metadata files`);

    // Create README
    const readmePath = path.join(sheetPath, 'README.md');
    const readme = `# ${name}

**Serial:** ${serialPadded}
**Spreadsheet ID:** ${spreadsheetId}
**Script ID:** ${scriptId}

## Production Info
- **URL:** https://docs.google.com/spreadsheets/d/${spreadsheetId}
- **Script URL:** https://script.google.com/d/${scriptId}/edit
- **Last Snapshot:** ${timestamp}

## Status
Active - Production Sheet

This sheet is part of the Google Sheets version control system. Changes should be made in the DEV3 staging environment first, then deployed to production.
`;
    fs.writeFileSync(readmePath, readme);
    console.log(`✅ Created README.md`);

    console.log(`\n✅ SUCCESS: ${name} - snapshot complete`);
    return { success: true, folder: folderName };

  } catch (error) {
    console.error(`\n❌ ERROR snapshotting ${name}:`, error.message);
    return { success: false, reason: error.message };
  }
}

// Main execution
async function main() {
  if (process.argv.length < 6) {
    console.error('Usage: node snapshot-single-sheet.js <serial> <name> <spreadsheetId> <scriptId>');
    process.exit(1);
  }

  const serial = parseInt(process.argv[2]);
  const name = process.argv[3];
  const spreadsheetId = process.argv[4];
  const scriptId = process.argv[5];

  console.log('🚀 Starting single sheet snapshot...\n');
  console.log(`⏰ ${new Date().toISOString()}\n`);

  // Ensure production directory exists
  if (!fs.existsSync(PRODUCTION_DIR)) {
    fs.mkdirSync(PRODUCTION_DIR, { recursive: true });
  }

  const result = await snapshotSheet(serial, name, spreadsheetId, scriptId);

  console.log('\n' + '='.repeat(60));
  if (result.success) {
    console.log('✅ Snapshot completed successfully');
    console.log(`   Folder: ${result.folder}`);
  } else {
    console.log('❌ Snapshot failed');
    console.log(`   Reason: ${result.reason}`);
  }
  console.log('='.repeat(60) + '\n');

  process.exit(result.success ? 0 : 1);
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

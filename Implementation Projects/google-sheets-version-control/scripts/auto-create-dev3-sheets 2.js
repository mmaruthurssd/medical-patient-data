#!/usr/bin/env node
/**
 * Automated DEV3 Sheet Creation
 * Uses Google Drive API and Apps Script API to automatically create all 22 DEV3 sheets
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Load service account credentials
const SERVICE_ACCOUNT_PATH = '/Users/mmaruthurnew/Desktop/medical-patient-data/google-workspace-oauth-setup/service-account.json';
const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));

// Initialize JWT client with domain-wide delegation
// Impersonate the user who owns the spreadsheets
const IMPERSONATE_USER = process.env.GOOGLE_IMPERSONATE_USER || 'mmaruthur@ssdspc.com';

const jwtClient = new google.auth.JWT(
  serviceAccount.client_email,
  null,
  serviceAccount.private_key,
  [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/script.projects',
    'https://www.googleapis.com/auth/spreadsheets'
  ],
  IMPERSONATE_USER
);

// Initialize APIs
const drive = google.drive({ version: 'v3', auth: jwtClient });
const script = google.script({ version: 'v1', auth: jwtClient });

// Paths
const TRACKING_CSV = path.join(__dirname, '../backups/pre-dev3-creation-20251113/dev3-creation-tracker.csv');
const PRODUCTION_DIR = path.join(__dirname, '../production-sheets');
const LOG_FILE = path.join(__dirname, '../logs/auto-dev3-creation-' + new Date().toISOString().replace(/[:.]/g, '-') + '.log');

// Ensure log directory exists
const LOG_DIR = path.dirname(LOG_FILE);
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Logging function
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  fs.appendFileSync(LOG_FILE, logMessage + '\n');
}

// Parse CSV
function parseCSV(csvPath) {
  const content = fs.readFileSync(csvPath, 'utf8');
  const lines = content.split('\n');
  const headers = lines[0].split(',');

  return lines.slice(1)
    .filter(line => line.trim())
    .map(line => {
      const values = line.split(',');
      const obj = {};
      headers.forEach((header, i) => {
        obj[header.trim()] = values[i] ? values[i].trim() : '';
      });
      return obj;
    });
}

// Update CSV
function updateCSV(csvPath, sheets) {
  const headers = ['Serial', 'Category', 'PROD_Registry', 'Current_DEV3', 'Action', 'Sheet_Name',
                   'New_DEV3_Spreadsheet_ID', 'New_DEV3_Script_ID', 'Status', 'Notes'];

  const lines = [headers.join(',')];
  sheets.forEach(sheet => {
    const values = headers.map(h => sheet[h] || '');
    lines.push(values.join(','));
  });

  fs.writeFileSync(csvPath, lines.join('\n'));
  log(`Updated tracking CSV: ${csvPath}`);
}

// Get PROD spreadsheet ID from metadata
function getProdSpreadsheetId(serial) {
  const serialPadded = serial.toString().padStart(3, '0');
  const prodDirs = fs.readdirSync(PRODUCTION_DIR)
    .filter(name => name.startsWith(`sheet-${serialPadded}_PROD`));

  if (prodDirs.length === 0) {
    throw new Error(`No PROD directory found for serial ${serial}`);
  }

  const prodDir = prodDirs[0];
  const spreadsheetIdPath = path.join(PRODUCTION_DIR, prodDir, 'metadata', 'spreadsheet-id.txt');

  if (!fs.existsSync(spreadsheetIdPath)) {
    throw new Error(`No spreadsheet ID found for ${prodDir}`);
  }

  return fs.readFileSync(spreadsheetIdPath, 'utf8').trim();
}

// Get PROD script ID from metadata
function getProdScriptId(serial) {
  const serialPadded = serial.toString().padStart(3, '0');
  const prodDirs = fs.readdirSync(PRODUCTION_DIR)
    .filter(name => name.startsWith(`sheet-${serialPadded}_PROD`));

  if (prodDirs.length === 0) {
    throw new Error(`No PROD directory found for serial ${serial}`);
  }

  const prodDir = prodDirs[0];
  const scriptIdPath = path.join(PRODUCTION_DIR, prodDir, 'metadata', 'script-id.txt');

  if (!fs.existsSync(scriptIdPath)) {
    throw new Error(`No script ID found for ${prodDir}`);
  }

  return fs.readFileSync(scriptIdPath, 'utf8').trim();
}

// Copy spreadsheet in Google Drive
async function copySpreadsheet(sourceSpreadsheetId, newName) {
  log(`  Copying spreadsheet: ${newName}`);

  try {
    const response = await drive.files.copy({
      fileId: sourceSpreadsheetId,
      requestBody: {
        name: `[DEV] ${newName}`
      }
    });

    const newSpreadsheetId = response.data.id;
    log(`  ✓ Created new spreadsheet: ${newSpreadsheetId}`);
    return newSpreadsheetId;
  } catch (error) {
    log(`  ✗ Failed to copy spreadsheet: ${error.message}`);
    throw error;
  }
}

// Copy Apps Script project
async function copyScript(sourceScriptId, newName) {
  log(`  Copying Apps Script project: ${newName}`);

  try {
    // Get the source script content
    const sourceContent = await script.projects.getContent({
      scriptId: sourceScriptId
    });

    // Create a new standalone script project
    const createResponse = await script.projects.create({
      requestBody: {
        title: `[DEV] ${newName}`,
        parentId: null  // Standalone script
      }
    });

    const newScriptId = createResponse.data.scriptId;
    log(`  ✓ Created new script project: ${newScriptId}`);

    // Update the content with source files
    await script.projects.updateContent({
      scriptId: newScriptId,
      requestBody: sourceContent.data
    });

    log(`  ✓ Copied script content to new project`);
    return newScriptId;
  } catch (error) {
    log(`  ✗ Failed to copy script: ${error.message}`);
    throw error;
  }
}

// Create local directory structure and pull code
async function createLocalDirectory(serial, sheetName, spreadsheetId, scriptId, registryId) {
  const serialPadded = serial.toString().padStart(3, '0');
  const dirName = `sheet-${serialPadded}_DEV3--${sheetName}`;
  const dirPath = path.join(PRODUCTION_DIR, dirName);

  log(`  Creating local directory: ${dirName}`);

  // Create directory structure
  fs.mkdirSync(path.join(dirPath, 'live'), { recursive: true });
  fs.mkdirSync(path.join(dirPath, 'metadata'), { recursive: true });

  // Create .clasp.json
  const claspJson = {
    scriptId: scriptId
  };
  fs.writeFileSync(
    path.join(dirPath, '.clasp.json'),
    JSON.stringify(claspJson, null, 2)
  );

  // Copy .clasp.json to live directory for pulling
  fs.writeFileSync(
    path.join(dirPath, 'live', '.clasp.json'),
    JSON.stringify(claspJson, null, 2)
  );

  // Pull code with clasp
  log(`  Pulling code from Google Drive...`);
  try {
    const { stdout, stderr } = await execPromise('clasp pull', {
      cwd: path.join(dirPath, 'live')
    });

    log(`  ✓ Code pulled successfully`);

    // Remove .clasp.json from live directory
    fs.unlinkSync(path.join(dirPath, 'live', '.clasp.json'));

    // Save metadata
    fs.writeFileSync(path.join(dirPath, 'metadata', 'script-id.txt'), scriptId);
    fs.writeFileSync(path.join(dirPath, 'metadata', 'spreadsheet-id.txt'), spreadsheetId);
    fs.writeFileSync(path.join(dirPath, 'metadata', 'created-from-prod.txt'), new Date().toISOString());
    fs.writeFileSync(path.join(dirPath, 'metadata', 'registry-id.txt'), registryId);

    // Count files
    const files = fs.readdirSync(path.join(dirPath, 'live'))
      .filter(f => !f.startsWith('.'));
    log(`  ✓ ${files.length} files created`);

    return true;
  } catch (error) {
    log(`  ✗ Failed to pull code: ${error.message}`);
    throw error;
  }
}

// Process a single sheet
async function processSheet(sheet) {
  const serial = parseInt(sheet.Serial);
  log(`\n[${sheet.Serial}/${22}] Processing: ${sheet.Sheet_Name || sheet.PROD_Registry}`);
  log(`  Category: ${sheet.Category}`);
  log(`  PROD Registry: ${sheet.PROD_Registry}`);

  try {
    // Get PROD IDs
    const prodSpreadsheetId = getProdSpreadsheetId(serial);
    const prodScriptId = getProdScriptId(serial);

    log(`  PROD Spreadsheet: ${prodSpreadsheetId}`);
    log(`  PROD Script: ${prodScriptId}`);

    // Get sheet name from PROD directory
    const serialPadded = serial.toString().padStart(3, '0');
    const prodDirs = fs.readdirSync(PRODUCTION_DIR)
      .filter(name => name.startsWith(`sheet-${serialPadded}_PROD`));
    const prodDirName = prodDirs[0];
    const sheetName = prodDirName.replace(/^sheet-\d+_PROD--/, '');

    // Copy spreadsheet
    const newSpreadsheetId = await copySpreadsheet(prodSpreadsheetId, sheetName);

    // Wait a bit for Google Drive to process
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Copy script
    const newScriptId = await copyScript(prodScriptId, sheetName);

    // Wait a bit for Apps Script to process
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Create local directory and pull code
    await createLocalDirectory(serial, sheetName, newSpreadsheetId, newScriptId, sheet.PROD_Registry);

    // Update sheet object
    sheet.New_DEV3_Spreadsheet_ID = newSpreadsheetId;
    sheet.New_DEV3_Script_ID = newScriptId;
    sheet.Status = 'Completed';
    sheet.Notes = `Auto-created on ${new Date().toISOString()}`;

    log(`✓ Successfully created DEV3 for serial ${serial}`);
    return { success: true, sheet };

  } catch (error) {
    log(`✗ Failed to process serial ${serial}: ${error.message}`);
    sheet.Status = 'Failed';
    sheet.Notes = `Error: ${error.message}`;
    return { success: false, sheet, error };
  }
}

// Main execution
async function main() {
  log('========================================');
  log('Automated DEV3 Sheet Creation');
  log('========================================');
  log(`Started: ${new Date().toISOString()}`);
  log(`Log file: ${LOG_FILE}`);
  log('');

  // Parse tracking CSV
  log('Reading tracking CSV...');
  const sheets = parseCSV(TRACKING_CSV);
  log(`Found ${sheets.length} sheets to process`);
  log('');

  // Process each sheet
  const results = {
    success: 0,
    failed: 0,
    sheets: []
  };

  for (const sheet of sheets) {
    const result = await processSheet(sheet);
    results.sheets.push(result.sheet);

    if (result.success) {
      results.success++;
      // Update CSV after each success
      updateCSV(TRACKING_CSV, results.sheets);
    } else {
      results.failed++;
    }

    // Small delay between sheets to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Final update
  updateCSV(TRACKING_CSV, results.sheets);

  // Summary
  log('');
  log('========================================');
  log('Summary');
  log('========================================');
  log(`Total sheets: ${sheets.length}`);
  log(`Successful: ${results.success}`);
  log(`Failed: ${results.failed}`);
  log('');
  log(`Completed: ${new Date().toISOString()}`);
  log('========================================');

  if (results.failed > 0) {
    log('');
    log('Failed sheets:');
    results.sheets
      .filter(s => s.Status === 'Failed')
      .forEach(s => log(`  - Serial ${s.Serial}: ${s.Notes}`));

    process.exit(1);
  }

  log('');
  log('✓ All DEV3 sheets created successfully!');
  log('');
  log('Next steps:');
  log('1. Run verification: cd scripts && ./verify-prod-dev3-matches.sh');
  log('2. Git commit: cd ../production-sheets && git add -A && git commit');
}

// Run
main().catch(error => {
  log(`FATAL ERROR: ${error.message}`);
  log(error.stack);
  process.exit(1);
});

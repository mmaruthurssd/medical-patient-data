#!/usr/bin/env node

/**
 * Extract Dev3 Sheet Information - VERBOSE VERSION
 * Shows which rows are being skipped and why
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const SHEET_ID = '1ZU64Umiv3bHwXq8arr4tJqBLPxUuEG2LeVOvODMuOjw';
const RANGE = 'F3:H500';

async function extractDev3Sheets() {
  try {
    console.log('🔍 Extracting dev3 sheet information (VERBOSE MODE)...\n');

    const credentialsPath = path.join(__dirname, '../../../google-workspace-oauth-setup/credentials.json');
    const tokenPath = path.join(__dirname, '../../../google-workspace-oauth-setup/token.json');

    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
    const token = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));

    const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    oAuth2Client.setCredentials(token);

    const sheets = google.sheets({ version: 'v4', auth: oAuth2Client });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: RANGE,
    });

    const rows = response.data.values;

    console.log(`✅ Found ${rows.length} total rows\n`);
    console.log('Analyzing each row...\n');

    let validCount = 0;
    let skippedCount = 0;
    const skippedRows = [];

    rows.forEach((row, index) => {
      const rowNumber = index + 3; // Starting at F3
      const [sheetName, scriptId, spreadsheetId] = row;

      // Check each field
      const hasName = sheetName && sheetName.trim();
      const hasScriptId = scriptId && scriptId.trim();
      const hasSpreadsheetId = spreadsheetId && spreadsheetId.trim();

      if (!hasName || !hasScriptId || !hasSpreadsheetId) {
        skippedCount++;
        skippedRows.push({
          rowNumber,
          name: sheetName || '(empty)',
          scriptId: scriptId || '(empty)',
          spreadsheetId: spreadsheetId || '(empty)',
          reason: !hasName ? 'missing name' : !hasScriptId ? 'missing script ID' : 'missing spreadsheet ID'
        });
      } else {
        validCount++;
        if (validCount <= 5 || validCount > rows.length - 5) {
          console.log(`✅ Row ${rowNumber}: ${sheetName.substring(0, 60)}...`);
        } else if (validCount === 6) {
          console.log(`   ... (${rows.length - 10} more valid rows) ...`);
        }
      }
    });

    console.log('\n' + '═'.repeat(70));
    console.log('📊 ANALYSIS COMPLETE');
    console.log('═'.repeat(70));
    console.log(`Total rows read: ${rows.length}`);
    console.log(`Valid sheets: ${validCount}`);
    console.log(`Skipped rows: ${skippedCount}`);
    console.log('');

    if (skippedRows.length > 0) {
      console.log('⚠️  SKIPPED ROWS:');
      console.log('');
      skippedRows.forEach(row => {
        console.log(`Row ${row.rowNumber}: ${row.reason}`);
        console.log(`  Name: ${row.name}`);
        console.log(`  Script ID: ${row.scriptId}`);
        console.log(`  Spreadsheet ID: ${row.spreadsheetId}`);
        console.log('');
      });
    }

    console.log('═'.repeat(70));

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

extractDev3Sheets();

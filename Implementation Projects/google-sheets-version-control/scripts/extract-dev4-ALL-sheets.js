#!/usr/bin/env node

/**
 * Extract ALL Dev4 Sheets - Including those without Script IDs
 *
 * Column F: Sheet Name
 * Column G: Spreadsheet ID (REQUIRED)
 * Column H: Apps Script Project ID (OPTIONAL)
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const SHEET_ID = '1ZU64Umiv3bHwXq8arr4tJqBLPxUuEG2LeVOvODMuOjw';
const RANGE = "'New Index DEV 4'!F3:H500";  // Dev 4 tab

async function extractDev4Sheets() {
  try {
    console.log('🔍 Extracting ALL dev4 sheets (script ID optional)...\n');

    const credentialsPath = path.join(__dirname, '../../../google-workspace-oauth-setup/credentials.json');
    const tokenPath = path.join(__dirname, '../../../google-workspace-oauth-setup/token.json');

    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
    const token = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));

    const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    oAuth2Client.setCredentials(token);

    const sheets = google.sheets({ version: 'v4', auth: oAuth2Client });

    console.log(`📊 Reading from sheet: ${SHEET_ID}`);
    console.log(`📍 Range: ${RANGE}`);
    console.log(`📋 Column F: Sheet Name (REQUIRED)`);
    console.log(`📋 Column G: Apps Script Project ID (OPTIONAL)`);
    console.log(`📋 Column H: Spreadsheet ID (REQUIRED)\n`);

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: RANGE,
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      console.log('⚠️  No data found in the specified range');
      return;
    }

    console.log(`✅ Found ${rows.length} rows of data\n`);

    // Process rows
    const csvData = [];
    const registryCommands = [];
    let validCount = 0;
    let skippedCount = 0;
    let noScriptIdCount = 0;
    const skippedRows = [];

    rows.forEach((row, index) => {
      const rowNumber = index + 3;

      // DEV4: F=Name, G=Script ID, H=Spreadsheet ID (swapped vs dev3!)
      const sheetName = row[0];
      const scriptId = row[1];        // Column G (OPTIONAL)
      const spreadsheetId = row[2];  // Column H (REQUIRED)

      // Only require name and spreadsheet ID
      if (!sheetName || !sheetName.trim() || !spreadsheetId || !spreadsheetId.trim()) {
        skippedCount++;
        skippedRows.push({
          rowNumber,
          reason: !sheetName || !sheetName.trim() ? 'missing name' : 'missing spreadsheet ID',
          name: sheetName || '(empty)',
          spreadsheetId: spreadsheetId || '(empty)',
          scriptId: scriptId || '(empty)'
        });
        return;
      }

      // Clean up the data
      const cleanName = sheetName.trim();
      const cleanSpreadsheetId = spreadsheetId.trim();
      const cleanScriptId = scriptId && scriptId.trim() ? scriptId.trim() : null;

      if (!cleanScriptId) {
        noScriptIdCount++;
      }

      // Add to CSV data
      csvData.push({
        name: cleanName,
        productionId: cleanSpreadsheetId,
        scriptId: cleanScriptId || '',
        category: 'operational',
        criticality: 'low',
        description: `Dev4 test sheet - ${cleanName}`
      });

      // Create registry command
      const scriptIdArg = cleanScriptId ? `--script-id "${cleanScriptId}" ` : '';
      registryCommands.push(
        `npm run registry:update -- --add ` +
        `--name "DEV4 - ${cleanName}" ` +
        `--production-id "${cleanSpreadsheetId}" ` +
        scriptIdArg +
        `--category "operational" ` +
        `--criticality "low" ` +
        `--description "Dev4 test sheet - ${cleanName}"`
      );

      validCount++;
    });

    console.log(`✅ Processed ${validCount} valid sheets`);
    console.log(`   - ${validCount - noScriptIdCount} sheets WITH script IDs`);
    console.log(`   - ${noScriptIdCount} sheets WITHOUT script IDs`);
    console.log(`⚠️  Skipped ${skippedCount} rows (missing required data)\n`);

    if (skippedRows.length > 0 && skippedRows.length < 20) {
      console.log('Skipped rows:');
      skippedRows.forEach(r => {
        console.log(`  Row ${r.rowNumber}: ${r.reason} - "${r.name}"`);
      });
      console.log('');
    }

    // Generate CSV file
    const csvPath = path.join(__dirname, '../dev4-sheets-ALL.csv');
    const csvLines = ['name,productionId,scriptId,category,criticality,description'];

    csvData.forEach(sheet => {
      csvLines.push(
        `"DEV4 - ${sheet.name}","${sheet.productionId}","${sheet.scriptId}","${sheet.category}","${sheet.criticality}","${sheet.description}"`
      );
    });

    fs.writeFileSync(csvPath, csvLines.join('\n'));
    console.log(`✅ CSV file created: ${csvPath}\n`);

    // Generate bash script
    const bashScriptPath = path.join(__dirname, '../add-dev4-ALL-sheets.sh');
    const bashScript = [
      '#!/bin/bash',
      '',
      '# Auto-generated script to add ALL dev4 sheets to registry',
      '# Includes sheets without script IDs',
      '# Generated: ' + new Date().toISOString(),
      '',
      'cd "$(dirname "$0")"',
      '',
      'echo "Adding ALL dev4 sheets to registry..."',
      'echo ""',
      '',
      ...registryCommands,
      '',
      'echo ""',
      'echo "✅ All dev4 sheets added!"',
      'echo ""',
      'npm run registry:update -- --list',
      ''
    ];

    fs.writeFileSync(bashScriptPath, bashScript.join('\n'));
    fs.chmodSync(bashScriptPath, '755');
    console.log(`✅ Bash script created: ${bashScriptPath}\n`);

    // Print summary
    console.log('═══════════════════════════════════════════════════════');
    console.log('📊 EXTRACTION COMPLETE (ALL DEV4 SHEETS)');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`Total sheets extracted: ${validCount}`);
    console.log(`  - With script IDs: ${validCount - noScriptIdCount}`);
    console.log(`  - Without script IDs: ${noScriptIdCount}`);
    console.log(`Skipped (missing required data): ${skippedCount}`);
    console.log(`CSV file: dev4-sheets-ALL.csv`);
    console.log(`Bash script: add-dev4-ALL-sheets.sh`);
    console.log('');
    console.log('⚠️  NOTE: Sheets without script IDs cannot be snapshotted');
    console.log('   but are tracked in the registry for documentation.');
    console.log('');
    console.log('Next steps:');
    console.log('  1. node scripts/bulk-import.js dev4-sheets-ALL.csv');
    console.log('  2. npm run snapshot (will process both dev3 and dev4)');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('API Response:', error.response.data);
    }
    process.exit(1);
  }
}

extractDev4Sheets();

#!/usr/bin/env node

/**
 * Extract Dev3 Sheet Information - CORRECTED VERSION
 *
 * Column F: Sheet Name
 * Column G: Spreadsheet ID
 * Column H: Apps Script Project ID
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const SHEET_ID = '1ZU64Umiv3bHwXq8arr4tJqBLPxUuEG2LeVOvODMuOjw';
const RANGE = 'F3:H500';

async function extractDev3Sheets() {
  try {
    console.log('🔍 Extracting dev3 sheet information (CORRECTED COLUMN MAPPING)...\n');

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
    console.log(`📋 Column F: Sheet Name`);
    console.log(`📋 Column G: Spreadsheet ID`);
    console.log(`📋 Column H: Apps Script Project ID\n`);

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

    // Process rows with CORRECTED column mapping
    const csvData = [];
    const registryCommands = [];
    let validCount = 0;
    let skippedCount = 0;

    rows.forEach((row, index) => {
      const rowNumber = index + 3;

      // CORRECTED: G = Spreadsheet ID, H = Apps Script Project ID
      const sheetName = row[0];
      const spreadsheetId = row[1];  // Column G
      const scriptId = row[2];        // Column H

      // Skip if any required field is missing
      if (!sheetName || !sheetName.trim() ||
          !spreadsheetId || !spreadsheetId.trim() ||
          !scriptId || !scriptId.trim()) {
        skippedCount++;
        return;
      }

      // Clean up the data
      const cleanName = sheetName.trim();
      const cleanSpreadsheetId = spreadsheetId.trim();
      const cleanScriptId = scriptId.trim();

      // Add to CSV data
      csvData.push({
        name: cleanName,
        productionId: cleanSpreadsheetId,
        scriptId: cleanScriptId,
        category: 'operational',
        criticality: 'low',
        description: `Dev3 test sheet - ${cleanName}`
      });

      // Create registry command
      registryCommands.push(
        `npm run registry:update -- --add ` +
        `--name "DEV3 - ${cleanName}" ` +
        `--production-id "${cleanSpreadsheetId}" ` +
        `--script-id "${cleanScriptId}" ` +
        `--category "operational" ` +
        `--criticality "low" ` +
        `--description "Dev3 test sheet - ${cleanName}"`
      );

      validCount++;
    });

    console.log(`✅ Processed ${validCount} valid sheets`);
    console.log(`⚠️  Skipped ${skippedCount} rows (missing data)\n`);

    // Generate CSV file
    const csvPath = path.join(__dirname, '../dev3-sheets-import-CORRECTED.csv');
    const csvLines = ['name,productionId,scriptId,category,criticality,description'];

    csvData.forEach(sheet => {
      csvLines.push(
        `"DEV3 - ${sheet.name}","${sheet.productionId}","${sheet.scriptId}","${sheet.category}","${sheet.criticality}","${sheet.description}"`
      );
    });

    fs.writeFileSync(csvPath, csvLines.join('\n'));
    console.log(`✅ CSV file created: ${csvPath}\n`);

    // Generate bash script
    const bashScriptPath = path.join(__dirname, '../add-dev3-sheets-CORRECTED.sh');
    const bashScript = [
      '#!/bin/bash',
      '',
      '# CORRECTED: Auto-generated script to add all dev3 sheets to registry',
      '# Column G = Spreadsheet ID, Column H = Apps Script Project ID',
      '# Generated: ' + new Date().toISOString(),
      '',
      'cd "$(dirname "$0")"',
      '',
      'echo "Adding dev3 sheets to registry (CORRECTED column mapping)..."',
      'echo ""',
      '',
      ...registryCommands,
      '',
      'echo ""',
      'echo "✅ All dev3 sheets added!"',
      'echo ""',
      'npm run registry:update -- --list',
      ''
    ];

    fs.writeFileSync(bashScriptPath, bashScript.join('\n'));
    fs.chmodSync(bashScriptPath, '755');
    console.log(`✅ Bash script created: ${bashScriptPath}\n`);

    // Print summary
    console.log('═══════════════════════════════════════════════════════');
    console.log('📊 EXTRACTION COMPLETE (CORRECTED)');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`Total sheets extracted: ${validCount}`);
    console.log(`CSV file: dev3-sheets-import-CORRECTED.csv`);
    console.log(`Bash script: add-dev3-sheets-CORRECTED.sh`);
    console.log('');
    console.log('⚠️  IMPORTANT: The previous import had columns swapped!');
    console.log('   You need to clear the registry and re-import.');
    console.log('');
    console.log('Next steps:');
    console.log('  1. Clear old entries (see below)');
    console.log('  2. node scripts/bulk-import.js dev3-sheets-import-CORRECTED.csv');
    console.log('  3. npm run snapshot');
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

extractDev3Sheets();

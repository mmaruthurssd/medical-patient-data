#!/usr/bin/env node

/**
 * Extract Dev3 Sheet Information from Google Sheet
 *
 * Reads the dev3 sheet list and extracts:
 * - Column F: Sheet Name (starting at F3)
 * - Column G: Apps Script ID
 * - Column H: Spreadsheet ID
 *
 * Then generates CSV for bulk import
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Sheet ID from the URL: 1ZU64Umiv3bHwXq8arr4tJqBLPxUuEG2LeVOvODMuOjw
const SHEET_ID = '1ZU64Umiv3bHwXq8arr4tJqBLPxUuEG2LeVOvODMuOjw';
const RANGE = 'F3:H500'; // Start at F3, read columns F, G, H

async function extractDev3Sheets() {
  try {
    console.log('🔍 Extracting dev3 sheet information...\n');

    // Load credentials from google-workspace-oauth-setup
    const credentialsPath = path.join(__dirname, '../../../google-workspace-oauth-setup/credentials.json');
    const tokenPath = path.join(__dirname, '../../../google-workspace-oauth-setup/token.json');

    if (!fs.existsSync(credentialsPath) || !fs.existsSync(tokenPath)) {
      console.error('❌ OAuth credentials not found');
      console.error('Please ensure google-workspace-oauth-setup is configured');
      process.exit(1);
    }

    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
    const token = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));

    // Create OAuth2 client
    const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    oAuth2Client.setCredentials(token);

    // Create Sheets API client
    const sheets = google.sheets({ version: 'v4', auth: oAuth2Client });

    // Read the data
    console.log(`📊 Reading from sheet: ${SHEET_ID}`);
    console.log(`📍 Range: ${RANGE}\n`);

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

    // Process rows and create CSV data
    const csvData = [];
    const registryCommands = [];
    let validCount = 0;

    rows.forEach((row, index) => {
      const [sheetName, scriptId, spreadsheetId] = row;

      // Skip if any required field is missing
      if (!sheetName || !scriptId || !spreadsheetId) {
        return;
      }

      // Clean up the data
      const cleanName = sheetName.trim();
      const cleanScriptId = scriptId.trim();
      const cleanSpreadsheetId = spreadsheetId.trim();

      // Add to CSV data
      csvData.push({
        name: cleanName,
        productionId: cleanSpreadsheetId,
        scriptId: cleanScriptId,
        category: 'operational', // Default category for dev sheets
        criticality: 'low', // Dev sheets are low criticality
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

    console.log(`✅ Processed ${validCount} valid sheets\n`);

    // Generate CSV file
    const csvPath = path.join(__dirname, '../dev3-sheets-import.csv');
    const csvLines = ['name,productionId,scriptId,category,criticality,description'];

    csvData.forEach(sheet => {
      csvLines.push(
        `"DEV3 - ${sheet.name}","${sheet.productionId}","${sheet.scriptId}","${sheet.category}","${sheet.criticality}","${sheet.description}"`
      );
    });

    fs.writeFileSync(csvPath, csvLines.join('\n'));
    console.log(`✅ CSV file created: ${csvPath}\n`);

    // Generate bash script for registry commands
    const bashScriptPath = path.join(__dirname, '../add-dev3-sheets.sh');
    const bashScript = [
      '#!/bin/bash',
      '',
      '# Auto-generated script to add all dev3 sheets to registry',
      '# Generated: ' + new Date().toISOString(),
      '',
      'cd "$(dirname "$0")"',
      '',
      'echo "Adding dev3 sheets to registry..."',
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
    console.log('📊 EXTRACTION COMPLETE');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`Total sheets extracted: ${validCount}`);
    console.log(`CSV file: dev3-sheets-import.csv`);
    console.log(`Bash script: add-dev3-sheets.sh`);
    console.log('');
    console.log('Next steps:');
    console.log('');
    console.log('Option A - Use bulk import:');
    console.log('  node scripts/bulk-import.js dev3-sheets-import.csv');
    console.log('');
    console.log('Option B - Use bash script:');
    console.log('  ./add-dev3-sheets.sh');
    console.log('');
    console.log('Then run snapshot:');
    console.log('  npm run snapshot');
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

// Run extraction
extractDev3Sheets();

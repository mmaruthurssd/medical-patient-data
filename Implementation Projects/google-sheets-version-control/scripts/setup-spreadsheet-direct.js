#!/usr/bin/env node

/**
 * Direct Spreadsheet Setup - Creates tabs and renames spreadsheet
 * Uses Google Sheets API v4
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const SPREADSHEET_ID = '1KpUhrEtW7-uHHS6GIngiXws0v2aM2wBC5ppyDBnRKxc';
const NEW_NAME = '6-Layer Backup Monitor - SSD Sheets';

// Tab configurations
const TABS = [
  { name: '📊 Backup Overview', color: { red: 0.26, green: 0.52, blue: 0.96 } }, // Blue
  { name: 'Layer 1 - Google Drive', color: { red: 0.06, green: 0.62, blue: 0.35 } }, // Green
  { name: 'Layer 2 - Local Git', color: { red: 0.96, green: 0.71, blue: 0 } }, // Yellow
  { name: 'Layer 3 - GitHub', color: { red: 0.67, green: 0.28, blue: 0.74 } }, // Purple
  { name: 'Layer 4 - Branch Protection', color: { red: 0, green: 0.67, blue: 0.76 } }, // Cyan
  { name: 'Layer 5 - GCS Backup', color: { red: 1, green: 0.44, blue: 0 } }, // Orange
  { name: 'Layer 6 - Time Machine', color: { red: 0.37, green: 0.39, blue: 0.41 } } // Gray
];

async function setupSpreadsheet() {
  try {
    console.log('========================================');
    console.log('Direct Spreadsheet Setup');
    console.log('========================================\n');

    // Use existing gcloud authentication
    const { execSync } = require('child_process');
    const accessToken = execSync('gcloud auth print-access-token', { encoding: 'utf8' }).trim();

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const sheets = google.sheets({ version: 'v4', auth });

    // Step 1: Get current spreadsheet state
    console.log('Step 1: Getting current spreadsheet state...');
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID
    });

    console.log(`Current name: ${spreadsheet.data.properties.title}`);
    console.log(`Current sheets: ${spreadsheet.data.sheets.length}`);

    const existingSheetNames = spreadsheet.data.sheets.map(s => s.properties.title);
    console.log('Existing tabs:', existingSheetNames.join(', '));
    console.log('');

    // Step 2: Build batch update requests
    console.log('Step 2: Building batch update requests...');
    const requests = [];

    // Rename spreadsheet if needed
    if (spreadsheet.data.properties.title !== NEW_NAME) {
      requests.push({
        updateSpreadsheetProperties: {
          properties: {
            title: NEW_NAME
          },
          fields: 'title'
        }
      });
      console.log(`✅ Will rename to: ${NEW_NAME}`);
    }

    // Create tabs that don't exist (in correct order)
    for (let i = 0; i < TABS.length; i++) {
      const tab = TABS[i];
      if (!existingSheetNames.includes(tab.name)) {
        requests.push({
          addSheet: {
            properties: {
              title: tab.name,
              tabColor: tab.color,
              index: i, // Ensure correct order
              gridProperties: {
                frozenRowCount: 1
              }
            }
          }
        });
        console.log(`✅ Will create: ${tab.name}`);
      } else {
        console.log(`⏭️  Already exists: ${tab.name}`);
      }
    }

    if (requests.length === 0) {
      console.log('\n✅ Spreadsheet already set up! No changes needed.');
      return;
    }

    // Step 3: Execute batch update
    console.log(`\nStep 3: Executing ${requests.length} updates...`);
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests
      }
    });

    console.log('✅ Batch update complete!');
    console.log('');

    // Step 4: Get sheet IDs for newly created sheets
    console.log('Step 4: Setting up tab contents...');
    const updatedSpreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID
    });

    const sheetMap = {};
    updatedSpreadsheet.data.sheets.forEach(sheet => {
      sheetMap[sheet.properties.title] = sheet.properties.sheetId;
    });

    // Step 5: Add headers and initial data
    const dataRequests = [];

    // Overview tab
    if (sheetMap['📊 Backup Overview']) {
      dataRequests.push({
        updateCells: {
          range: {
            sheetId: sheetMap['📊 Backup Overview'],
            startRowIndex: 0,
            endRowIndex: 2,
            startColumnIndex: 0,
            endColumnIndex: 8
          },
          rows: [
            {
              values: [
                {
                  userEnteredValue: { stringValue: '6-Layer Backup Protection System - Status Dashboard' },
                  userEnteredFormat: {
                    backgroundColor: { red: 0.26, green: 0.52, blue: 0.96 },
                    textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, bold: true, fontSize: 14 },
                    horizontalAlignment: 'CENTER'
                  }
                }
              ].concat(Array(7).fill({ userEnteredValue: { stringValue: '' } }))
            },
            {
              values: [
                'Layer', 'Status', 'Last Success', 'Last Check', 'Success Rate (7d)', 'Total Events', 'Issues', 'Next Scheduled'
              ].map(text => ({
                userEnteredValue: { stringValue: text },
                userEnteredFormat: {
                  backgroundColor: { red: 0.91, green: 0.94, blue: 0.99 },
                  textFormat: { bold: true },
                  horizontalAlignment: 'CENTER'
                }
              }))
            }
          ],
          fields: 'userEnteredValue,userEnteredFormat'
        }
      });

      // Merge first row
      dataRequests.push({
        mergeCells: {
          range: {
            sheetId: sheetMap['📊 Backup Overview'],
            startRowIndex: 0,
            endRowIndex: 1,
            startColumnIndex: 0,
            endColumnIndex: 8
          },
          mergeType: 'MERGE_ALL'
        }
      });

      // Add layer data rows
      const layers = [
        ['Layer 1: Google Drive', 'Initializing...', '', '', '0%', '0', '0', 'Continuous'],
        ['Layer 2: Local Git', 'Initializing...', '', '', '0%', '0', '0', 'On commit'],
        ['Layer 3: GitHub', 'Initializing...', '', '', '0%', '0', '0', 'On push'],
        ['Layer 4: Branch Protection', 'Initializing...', '', '', '0%', '0', '0', 'Always active'],
        ['Layer 5: GCS Backup', 'Initializing...', '', '', '0%', '0', '0', '9 AM & 5 PM CST'],
        ['Layer 6: Time Machine', 'Initializing...', '', '', '0%', '0', '0', 'Hourly (macOS)']
      ];

      dataRequests.push({
        updateCells: {
          range: {
            sheetId: sheetMap['📊 Backup Overview'],
            startRowIndex: 2,
            endRowIndex: 8,
            startColumnIndex: 0,
            endColumnIndex: 8
          },
          rows: layers.map(row => ({
            values: row.map(cell => ({
              userEnteredValue: { stringValue: cell }
            }))
          })),
          fields: 'userEnteredValue'
        }
      });
    }

    // Layer tabs - just add headers for now
    const layerHeaders = {
      'Layer 1 - Google Drive': ['Timestamp', 'Event Type', 'Sheets Count', 'Status', 'Details', 'Duration (s)'],
      'Layer 2 - Local Git': ['Timestamp', 'Event Type', 'Commit SHA', 'Files Changed', 'Status', 'Message'],
      'Layer 3 - GitHub': ['Timestamp', 'Event Type', 'Commit SHA', 'Branch', 'Status', 'Pre-push Check', 'Details'],
      'Layer 4 - Branch Protection': ['Timestamp', 'Check Type', 'Branch', 'Protection Active', 'Blocked Actions', 'Details'],
      'Layer 5 - GCS Backup': ['Timestamp', 'Event Type', 'Backup File', 'Size (MB)', 'Status', 'Duration (s)', 'Checksum Verified', 'Workflow Run'],
      'Layer 6 - Time Machine': ['Timestamp', 'Check Type', 'Backup Destination', 'Status', 'Last Backup', 'Details']
    };

    const layerColors = {
      'Layer 1 - Google Drive': { red: 0.06, green: 0.62, blue: 0.35 },
      'Layer 2 - Local Git': { red: 0.96, green: 0.71, blue: 0 },
      'Layer 3 - GitHub': { red: 0.67, green: 0.28, blue: 0.74 },
      'Layer 4 - Branch Protection': { red: 0, green: 0.67, blue: 0.76 },
      'Layer 5 - GCS Backup': { red: 1, green: 0.44, blue: 0 },
      'Layer 6 - Time Machine': { red: 0.37, green: 0.39, blue: 0.41 }
    };

    Object.entries(layerHeaders).forEach(([sheetName, headers]) => {
      if (sheetMap[sheetName]) {
        dataRequests.push({
          updateCells: {
            range: {
              sheetId: sheetMap[sheetName],
              startRowIndex: 0,
              endRowIndex: 1,
              startColumnIndex: 0,
              endColumnIndex: headers.length
            },
            rows: [{
              values: headers.map(text => ({
                userEnteredValue: { stringValue: text },
                userEnteredFormat: {
                  backgroundColor: layerColors[sheetName],
                  textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, bold: true },
                  horizontalAlignment: 'CENTER'
                }
              }))
            }],
            fields: 'userEnteredValue,userEnteredFormat'
          }
        });
      }
    });

    // Execute data updates
    if (dataRequests.length > 0) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: dataRequests
        }
      });
      console.log('✅ Headers and initial data added!');
    }

    console.log('');
    console.log('========================================');
    console.log('✅ SPREADSHEET SETUP COMPLETE!');
    console.log('========================================');
    console.log('');
    console.log('Spreadsheet name:', NEW_NAME);
    console.log('Spreadsheet URL:', `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}`);
    console.log('');
    console.log('Tabs created:');
    TABS.forEach((tab, i) => console.log(`  ${i + 1}. ${tab.name}`));
    console.log('');
    console.log('Ready for monitoring! 🎉');

  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('API Response:', error.response.data);
    }
    process.exit(1);
  }
}

setupSpreadsheet();

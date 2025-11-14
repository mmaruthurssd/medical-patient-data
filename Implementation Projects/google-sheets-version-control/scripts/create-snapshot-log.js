#!/usr/bin/env node

/**
 * Create Daily Snapshot Log Google Sheet
 *
 * This script creates a Google Sheet in the "AI Development - no PHI" shared drive
 * to track daily snapshot runs with links to GitHub Actions.
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const SHEET_NAME = 'Daily Snapshot Log - SSD Google Sheets';
const SHARED_DRIVE_NAME = 'AI Development - No PHI';

// Column headers for the log sheet
const HEADERS = [
  'Run Date',
  'Run Time (UTC)',
  'Status',
  'Total Sheets',
  'Batch 1 Success',
  'Batch 2 Success',
  'Batch 3 Success',
  'Total Failures',
  'Duration (min)',
  'GitHub Run Link',
  'Commit SHA',
  'Notes'
];

async function getAuthClient() {
  const clasprcPath = path.join(process.env.HOME, '.clasprc.json');

  if (!fs.existsSync(clasprcPath)) {
    throw new Error('No .clasprc.json found. Please run: clasp login');
  }

  const credentials = JSON.parse(fs.readFileSync(clasprcPath, 'utf8'));

  // Handle clasp's nested token structure: {tokens: {default: {...}}}
  const token = credentials.tokens?.default || credentials.token;

  if (!token || !token.access_token) {
    throw new Error('Invalid credentials format in .clasprc.json');
  }

  const oauth2Client = new google.auth.OAuth2(
    token.client_id,
    token.client_secret
  );

  oauth2Client.setCredentials({
    access_token: token.access_token,
    refresh_token: token.refresh_token
  });

  return oauth2Client;
}

async function findSharedDrive(drive, driveName) {
  console.log(`🔍 Searching for shared drive: "${driveName}"...`);

  const response = await drive.drives.list({
    pageSize: 100
  });

  const targetDrive = response.data.drives?.find(d => d.name === driveName);

  if (!targetDrive) {
    console.log('\n📁 Available shared drives:');
    response.data.drives?.forEach(d => console.log(`  - ${d.name} (${d.id})`));
    throw new Error(`Shared drive "${driveName}" not found`);
  }

  console.log(`✅ Found shared drive: ${targetDrive.name} (${targetDrive.id})`);
  return targetDrive.id;
}

async function createLogSheet() {
  try {
    console.log('🚀 Creating Daily Snapshot Log Sheet...\n');

    const auth = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth });
    const drive = google.drive({ version: 'v3', auth });

    // Find the shared drive
    const driveId = await findSharedDrive(drive, SHARED_DRIVE_NAME);

    // Create the spreadsheet
    console.log('\n📝 Creating new Google Sheet...');
    const spreadsheet = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: SHEET_NAME
        },
        sheets: [{
          properties: {
            title: 'Snapshot Runs',
            gridProperties: {
              rowCount: 1000,
              columnCount: HEADERS.length,
              frozenRowCount: 1
            }
          }
        }]
      }
    });

    const spreadsheetId = spreadsheet.data.spreadsheetId;
    const spreadsheetUrl = spreadsheet.data.spreadsheetUrl;
    const sheetId = spreadsheet.data.sheets[0].properties.sheetId;

    console.log(`✅ Created spreadsheet: ${spreadsheetId}`);
    console.log(`   URL: ${spreadsheetUrl}`);

    // Add headers
    console.log('\n📊 Adding column headers...');
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Snapshot Runs!A1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [HEADERS]
      }
    });

    // Format the header row
    console.log('🎨 Formatting headers...');

    // Number columns to center (indices 3-8: Total Sheets, Batches, Failures, Duration)
    const numberColumnIndices = [3, 4, 5, 6, 7, 8];

    const requests = [
      // Header row: light yellow background, black text (not bold), centered, wrap text
      {
        repeatCell: {
          range: {
            sheetId: sheetId,
            startRowIndex: 0,
            endRowIndex: 1
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: {
                red: 1.0,      // Light yellow 3: RGB(255, 242, 204)
                green: 0.949,
                blue: 0.8
              },
              textFormat: {
                foregroundColor: { red: 0, green: 0, blue: 0 }, // Black
                fontSize: 11,
                bold: false
              },
              horizontalAlignment: 'CENTER',
              wrapStrategy: 'WRAP'
            }
          },
          fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,wrapStrategy)'
        }
      },
      // Auto-resize columns
      {
        autoResizeDimensions: {
          dimensions: {
            sheetId: sheetId,
            dimension: 'COLUMNS',
            startIndex: 0,
            endIndex: HEADERS.length
          }
        }
      }
    ];

    // Add formatting for number columns (center alignment)
    numberColumnIndices.forEach(colIndex => {
      requests.push({
        repeatCell: {
          range: {
            sheetId: sheetId,
            startColumnIndex: colIndex,
            endColumnIndex: colIndex + 1,
            startRowIndex: 1 // Start from row 2 (after headers)
          },
          cell: {
            userEnteredFormat: {
              horizontalAlignment: 'CENTER'
            }
          },
          fields: 'userEnteredFormat.horizontalAlignment'
        }
      });
    });

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: requests
      }
    });

    // Add sample row with today's successful run (insert at top - row 2)
    console.log('\n📝 Adding initial entry for today\'s successful run...');
    const today = new Date();
    const sampleData = [
      [
        today.toISOString().split('T')[0], // Run Date
        '22:17:24', // Run Time UTC
        'SUCCESS', // Status
        '404', // Total Sheets
        '135', // Batch 1
        '135', // Batch 2
        '134', // Batch 3
        '0', // Failures
        '22', // Duration
        'https://github.com/mmaruthurssd/ssd-google-sheets-staging-production/actions/runs/19247366667', // GitHub Link
        'fc0e3a7', // Commit SHA
        'First successful run after authentication fix' // Notes
      ]
    ];

    // Insert at row 2 (right after headers) so newest entries are always at the top
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{
          insertDimension: {
            range: {
              sheetId: sheetId,
              dimension: 'ROWS',
              startIndex: 1,
              endIndex: 2
            }
          }
        }]
      }
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Snapshot Runs!A2',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: sampleData
      }
    });

    // Add instructional note below the data
    console.log('📋 Adding usage note...');
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Snapshot Runs!A4',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          '📌 Note: New snapshot runs are automatically inserted at the top (row 2) so the most recent run is always first.'
        ]]
      }
    });

    // Move to shared drive
    console.log(`\n📂 Moving to shared drive "${SHARED_DRIVE_NAME}"...`);
    await drive.files.update({
      fileId: spreadsheetId,
      addParents: driveId,
      removeParents: 'root',
      supportsAllDrives: true,
      fields: 'id, parents'
    });

    console.log('\n✅ SUCCESS! Snapshot log created and moved to shared drive');
    console.log('\n📊 Sheet Details:');
    console.log(`   Name: ${SHEET_NAME}`);
    console.log(`   Location: ${SHARED_DRIVE_NAME}`);
    console.log(`   URL: ${spreadsheetUrl}`);
    console.log('\n💡 You can now access this sheet to view daily snapshot history');

    return {
      spreadsheetId,
      spreadsheetUrl
    };

  } catch (error) {
    console.error('\n❌ Error creating snapshot log:', error.message);

    if (error.message.includes('insufficient authentication scopes')) {
      console.error('\n⚠️  Authentication Issue:');
      console.error('   The current credentials may not have Google Sheets API access.');
      console.error('   You may need to re-run: clasp login');
    }

    throw error;
  }
}

// Run the script
if (require.main === module) {
  createLogSheet()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { createLogSheet };

#!/usr/bin/env node

/**
 * Update Daily Snapshot Log Formatting
 *
 * Updates the existing sheet with new formatting requirements:
 * - Header: light yellow background, black text (not bold), centered, text wrap
 * - Number columns (Total Sheets, Batch results, Failures, Duration): centered
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const SPREADSHEET_ID = '1KpUhrEtW7-uHHS6GIngiXws0v2aM2wBC5ppyDBnRKxc';

// Number columns to center (indices 3-8)
const NUMBER_COLUMN_INDICES = [3, 4, 5, 6, 7, 8]; // Total Sheets, Batch 1-3, Failures, Duration

async function getAuthClient() {
  const clasprcPath = path.join(process.env.HOME, '.clasprc.json');

  if (!fs.existsSync(clasprcPath)) {
    throw new Error('No .clasprc.json found. Please run authentication first');
  }

  const credentials = JSON.parse(fs.readFileSync(clasprcPath, 'utf8'));
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

async function updateFormatting() {
  try {
    console.log('🎨 Updating sheet formatting...\n');

    const auth = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth });

    // Get sheet info to find the sheet ID
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID
    });

    const sheetId = spreadsheet.data.sheets[0].properties.sheetId;
    console.log(`✅ Found sheet ID: ${sheetId}`);

    // Prepare batch update requests
    const requests = [
      // Format header row: light yellow background, black text (not bold), centered, wrap text
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
      }
    ];

    // Add formatting for each number column (center alignment)
    NUMBER_COLUMN_INDICES.forEach(colIndex => {
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

    // Apply all formatting updates
    console.log('📝 Applying formatting changes...');
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: requests
      }
    });

    console.log('\n✅ SUCCESS! Formatting updated');
    console.log('\n📊 Changes applied:');
    console.log('   ✓ Header row: light yellow background');
    console.log('   ✓ Header text: black, not bold, centered, wrap enabled');
    console.log('   ✓ Number columns (Total Sheets, Batches, Failures, Duration): centered');
    console.log(`\n🔗 View sheet: https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`);

  } catch (error) {
    console.error('\n❌ Error updating formatting:', error.message);
    throw error;
  }
}

// Run the update
if (require.main === module) {
  updateFormatting()
    .then(() => {
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Update failed:', error.message);
      process.exit(1);
    });
}

module.exports = { updateFormatting };

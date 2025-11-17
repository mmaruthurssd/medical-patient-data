/**
 * Create "AI Task Tracker - Testing" sheet using OAuth
 * (Service account doesn't have permission to create in shared drive)
 */

const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const CREDENTIALS_FILE = path.join(__dirname, 'credentials.json');
const TOKEN_FILE = path.join(__dirname, 'token.json');
const PROJECT_FOLDER_ID = '1gjZadVQfOlVLOV8ctAAVDjXXjW6T31g_';
const DASHBOARD_ID = '1MCLftX_nOx9jg9xi_nvMzyGhZSUCsMrAM-Vk_iWGJic';

async function createTestingSheet() {
  try {
    console.log('🔐 Authenticating with OAuth (automation@ssdspc.com)...\n');

    // Load credentials
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_FILE, 'utf8'));
    const token = JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf8'));

    const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    oAuth2Client.setCredentials(token);

    const sheets = google.sheets({ version: 'v4', auth: oAuth2Client });
    const drive = google.drive({ version: 'v3', auth: oAuth2Client });

    // Create spreadsheet
    console.log('📊 Creating "AI Task Tracker - Testing" sheet...\n');

    const spreadsheet = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: 'AI Task Tracker - Testing',
        },
        sheets: [
          { properties: { title: 'Test Transcripts', gridProperties: { frozenRowCount: 1 } } },
          { properties: { title: 'Manual Extraction', gridProperties: { frozenRowCount: 1 } } },
          { properties: { title: 'AI Extraction', gridProperties: { frozenRowCount: 1 } } },
          { properties: { title: 'Comparison', gridProperties: { frozenRowCount: 1 } } },
          { properties: { title: 'Metrics', gridProperties: { frozenRowCount: 1 } } },
        ],
      },
    });

    const spreadsheetId = spreadsheet.data.spreadsheetId;
    console.log(`✅ Sheet created: ${spreadsheetId}\n`);

    // Move to AI Task Tracker folder
    console.log('📁 Moving to AI Task Tracker folder...\n');
    await drive.files.update({
      fileId: spreadsheetId,
      addParents: PROJECT_FOLDER_ID,
      supportsAllDrives: true,
      fields: 'id, parents',
    });

    // Set up headers
    console.log('📝 Setting up column headers...\n');

    // Tab 1: Test Transcripts
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Test Transcripts!A1:L1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          'Transcript ID',
          'Source Tab',
          'Dashboard Link',
          'Selected for Testing',
          'Date',
          'Participants/Subject',
          'Source Pulled?',
          'Full Text',
          'Source Type',
          'Complexity Tag',
          'Action Item Density',
          'Notes'
        ]],
      },
    });

    // Tab 2: Manual Extraction
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Manual Extraction!A1:F1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          'Transcript ID',
          'Task Description',
          'Owner',
          'Priority',
          'Due Date',
          'Notes (Reasoning)'
        ]],
      },
    });

    // Tab 3: AI Extraction
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'AI Extraction!A1:G1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          'Transcript ID',
          'Task Description',
          'Owner',
          'Priority',
          'Due Date',
          'Confidence Score',
          'Raw AI Response'
        ]],
      },
    });

    // Tab 4: Comparison
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Comparison!A1:G1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          'Transcript ID',
          'Metric',
          'AI Result',
          'Human Result',
          'Match?',
          'Error Type',
          'Notes'
        ]],
      },
    });

    // Tab 5: Metrics
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Metrics!A1:D1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          'Metric Name',
          'Value',
          'Target',
          'Status'
        ]],
      },
    });

    // Format headers
    const requests = [];
    for (let sheetId = 0; sheetId < 5; sheetId++) {
      requests.push({
        repeatCell: {
          range: {
            sheetId: sheetId,
            startRowIndex: 0,
            endRowIndex: 1,
          },
          cell: {
            userEnteredFormat: {
              textFormat: { bold: true },
              backgroundColor: { red: 0.9, green: 0.9, blue: 0.9 },
            },
          },
          fields: 'userEnteredFormat(textFormat,backgroundColor)',
        },
      });
    }

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests },
    });

    const webViewLink = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

    console.log('='.repeat(80));
    console.log('✅ Testing Sheet Created Successfully!');
    console.log('='.repeat(80));
    console.log();
    console.log(`📊 URL: ${webViewLink}`);
    console.log(`📝 Sheet ID: ${spreadsheetId}`);
    console.log(`📋 Dashboard ID: ${DASHBOARD_ID}`);
    console.log();

    return { spreadsheetId, webViewLink };

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Details:', error.response.data);
    }
    throw error;
  }
}

createTestingSheet();

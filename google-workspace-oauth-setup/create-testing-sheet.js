/**
 * Create "AI Task Tracker - Testing" sheet with 5 tabs
 * Configured to pull from 2025 Transcripts Dashboard
 */

const { google } = require('googleapis');
const path = require('path');

const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'service-account.json');
const OAUTH_CREDENTIALS_FILE = path.join(__dirname, 'credentials.json');
const OAUTH_TOKEN_FILE = path.join(__dirname, 'token.json');
const SHARED_DRIVE_ID = '0AFSsMrTVhqWuUk9PVA';
const PROJECT_FOLDER_ID = '1gjZadVQfOlVLOV8ctAAVDjXXjW6T31g_';
const DASHBOARD_ID = '1MCLftX_nOx9jg9xi_nvMzyGhZSUCsMrAM-Vk_iWGJic';

async function createTestingSheet() {
  try {
    console.log('🔐 Authenticating with service account...\n');

    // Use service account for sheet creation
    const auth = new google.auth.GoogleAuth({
      keyFile: SERVICE_ACCOUNT_FILE,
      scopes: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/spreadsheets'
      ],
    });

    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });
    const drive = google.drive({ version: 'v3', auth: authClient });

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

    // Move to AI Task Tracker folder in shared drive
    console.log('📁 Moving to AI Task Tracker folder...\n');
    await drive.files.update({
      fileId: spreadsheetId,
      addParents: PROJECT_FOLDER_ID,
      supportsAllDrives: true,
      fields: 'id, parents',
    });

    // Set up headers for each tab
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

    console.log('✅ Headers configured\n');

    // Format headers (bold)
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

    console.log('✅ Formatting applied\n');

    const webViewLink = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

    console.log('=' .repeat(80));
    console.log('✅ AI Task Tracker - Testing Sheet Created Successfully!');
    console.log('='.repeat(80));
    console.log();
    console.log('📊 Sheet Details:');
    console.log(`   ID: ${spreadsheetId}`);
    console.log(`   URL: ${webViewLink}`);
    console.log(`   Location: AI Task Tracker folder (Shared Drive)`);
    console.log();
    console.log('📋 Tabs Created:');
    console.log('   1. Test Transcripts - Select and pull transcripts here');
    console.log('   2. Manual Extraction - Your ground truth extractions');
    console.log('   3. AI Extraction - AI-generated results');
    console.log('   4. Comparison - Side-by-side analysis');
    console.log('   5. Metrics - Accuracy tracking');
    console.log();
    console.log('🔧 Next Step:');
    console.log('   Install Apps Script code to enable dashboard integration');
    console.log();

    return { spreadsheetId, webViewLink };

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

createTestingSheet()
  .then((result) => {
    console.log('✅ Script completed successfully');
    console.log();
    console.log('📝 Save these details:');
    console.log(`   Spreadsheet ID: ${result.spreadsheetId}`);
    console.log(`   Dashboard ID: ${DASHBOARD_ID}`);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
  });

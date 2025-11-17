/**
 * Create "AI Task Tracker - Testing" sheet (simple approach)
 * Creates in My Drive, user can move to shared drive manually
 */

const { google } = require('googleapis');
const path = require('path');

// Use service account (it's a symlink to the actual file)
const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'service-account.json');
const DASHBOARD_ID = '1MCLftX_nOx9jg9xi_nvMzyGhZSUCsMrAM-Vk_iWGJic';

async function createTestingSheet() {
  try {
    console.log('🔐 Authenticating...\n');

    const auth = new google.auth.GoogleAuth({
      keyFile: SERVICE_ACCOUNT_FILE,
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
      ],
    });

    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });

    // Create spreadsheet (in service account's drive initially)
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

    // Set up headers
    console.log('📝 Setting up column headers...\n');

    const updates = [
      {
        range: 'Test Transcripts!A1:L1',
        values: [[
          'Transcript ID', 'Source Tab', 'Dashboard Link', 'Selected for Testing',
          'Date', 'Participants/Subject', 'Source Pulled?', 'Full Text',
          'Source Type', 'Complexity Tag', 'Action Item Density', 'Notes'
        ]],
      },
      {
        range: 'Manual Extraction!A1:F1',
        values: [['Transcript ID', 'Task Description', 'Owner', 'Priority', 'Due Date', 'Notes (Reasoning)']],
      },
      {
        range: 'AI Extraction!A1:G1',
        values: [['Transcript ID', 'Task Description', 'Owner', 'Priority', 'Due Date', 'Confidence Score', 'Raw AI Response']],
      },
      {
        range: 'Comparison!A1:G1',
        values: [['Transcript ID', 'Metric', 'AI Result', 'Human Result', 'Match?', 'Error Type', 'Notes']],
      },
      {
        range: 'Metrics!A1:D1',
        values: [['Metric Name', 'Value', 'Target', 'Status']],
      },
    ];

    for (const update of updates) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: update.range,
        valueInputOption: 'RAW',
        requestBody: { values: update.values },
      });
    }

    // Format headers
    const requests = [];
    for (let sheetId = 0; sheetId < 5; sheetId++) {
      requests.push({
        repeatCell: {
          range: { sheetId, startRowIndex: 0, endRowIndex: 1 },
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
    console.log('✅ Testing Sheet Created!');
    console.log('='.repeat(80));
    console.log();
    console.log(`📊 URL: ${webViewLink}`);
    console.log(`📝 Sheet ID: ${spreadsheetId}`);
    console.log(`📋 Dashboard ID: ${DASHBOARD_ID}`);
    console.log();
    console.log('⚠️  IMPORTANT: You need to manually move this sheet to the');
    console.log('    "AI Task Tracker" folder in the shared drive');
    console.log();
    console.log('📁 Shared Drive Folder: AI Task Tracker');
    console.log('   https://drive.google.com/drive/folders/1gjZadVQfOlVLOV8ctAAVDjXXjW6T31g_');
    console.log();

    return { spreadsheetId, webViewLink };

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

createTestingSheet();

/**
 * Create "AI Task Tracker - Testing" sheet
 * Following EXACT pattern from workflows/google-sheets.md
 *
 * Key requirements:
 * - Use drive.files.create() NOT sheets.spreadsheets.create()
 * - Must include supportsAllDrives: true
 * - Service account has editor access to all 9 Shared Drives
 */

const { google } = require('googleapis');
const path = require('path');

const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'service-account.json');
const SHARED_DRIVE_ID = '0AFSsMrTVhqWuUk9PVA';  // AI Development - No PHI
const PROJECT_FOLDER_ID = '1gjZadVQfOlVLOV8ctAAVDjXXjW6T31g_';  // AI Task Tracker folder
const DASHBOARD_ID = '1MCLftX_nOx9jg9xi_nvMzyGhZSUCsMrAM-Vk_iWGJic';

async function createTestingSheet() {
  try {
    console.log('🔐 Authenticating with service account...\n');

    const auth = new google.auth.GoogleAuth({
      keyFile: SERVICE_ACCOUNT_FILE,
      scopes: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/spreadsheets'
      ],
    });

    const authClient = await auth.getClient();
    const drive = google.drive({ version: 'v3', auth: authClient });
    const sheets = google.sheets({ version: 'v4', auth: authClient });

    console.log('✅ Authentication successful\n');

    // Step 1: Create spreadsheet using drive.files.create() with supportsAllDrives
    console.log('📊 Creating "AI Task Tracker - Testing" sheet...\n');

    const fileMetadata = {
      name: 'AI Task Tracker - Testing',
      mimeType: 'application/vnd.google-apps.spreadsheet',
      parents: [PROJECT_FOLDER_ID],
    };

    const file = await drive.files.create({
      requestBody: fileMetadata,
      supportsAllDrives: true,  // CRITICAL for Shared Drives
      fields: 'id, name, webViewLink',
    });

    const spreadsheetId = file.data.id;
    const webViewLink = file.data.webViewLink;

    console.log(`✅ Sheet created: ${spreadsheetId}\n`);

    // Step 2: Add tabs (sheets) to the spreadsheet
    console.log('📝 Creating tabs...\n');

    const requests = [
      {
        addSheet: {
          properties: {
            title: 'Test Transcripts',
            gridProperties: { rowCount: 100, columnCount: 12, frozenRowCount: 1 }
          }
        }
      },
      {
        addSheet: {
          properties: {
            title: 'Manual Extraction',
            gridProperties: { rowCount: 100, columnCount: 6, frozenRowCount: 1 }
          }
        }
      },
      {
        addSheet: {
          properties: {
            title: 'AI Extraction',
            gridProperties: { rowCount: 100, columnCount: 7, frozenRowCount: 1 }
          }
        }
      },
      {
        addSheet: {
          properties: {
            title: 'Comparison',
            gridProperties: { rowCount: 100, columnCount: 7, frozenRowCount: 1 }
          }
        }
      },
      {
        addSheet: {
          properties: {
            title: 'Metrics',
            gridProperties: { rowCount: 50, columnCount: 4, frozenRowCount: 1 }
          }
        }
      }
    ];

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests }
    });

    // Delete the default "Sheet1"
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const defaultSheet = spreadsheet.data.sheets.find(s => s.properties.title === 'Sheet1');

    if (defaultSheet) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [{
            deleteSheet: {
              sheetId: defaultSheet.properties.sheetId
            }
          }]
        }
      });
    }

    console.log('✅ Tabs created\n');

    // Step 3: Add column headers
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

    // Step 4: Format headers (bold, gray background)
    const formatRequests = [];
    const sheetIds = (await sheets.spreadsheets.get({ spreadsheetId })).data.sheets.map(s => s.properties.sheetId);

    for (const sheetId of sheetIds) {
      formatRequests.push({
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
      requestBody: { requests: formatRequests },
    });

    console.log('✅ Headers formatted\n');

    console.log('='.repeat(80));
    console.log('✅ AI Task Tracker - Testing Sheet Created Successfully!');
    console.log('='.repeat(80));
    console.log();
    console.log(`📊 URL: ${webViewLink}`);
    console.log(`📝 Sheet ID: ${spreadsheetId}`);
    console.log(`📋 Dashboard ID: ${DASHBOARD_ID}`);
    console.log();
    console.log('📋 Tabs Created:');
    console.log('   1. Test Transcripts');
    console.log('   2. Manual Extraction');
    console.log('   3. AI Extraction');
    console.log('   4. Comparison');
    console.log('   5. Metrics');
    console.log();
    console.log('🔧 Next: Install Apps Script code for dashboard integration');
    console.log();

    return { spreadsheetId, webViewLink };

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
}

createTestingSheet();

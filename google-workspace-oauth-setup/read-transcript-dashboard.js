/**
 * Read structure of 2025 Transcripts Dashboard
 * Sheet ID: 1MCLftX_nOx9jg9xi_nvMzyGhZSUCsMrAM-Vk_iWGJic
 */

const { google } = require('googleapis');
const path = require('path');

const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'service-account.json');
const DASHBOARD_ID = '1MCLftX_nOx9jg9xi_nvMzyGhZSUCsMrAM-Vk_iWGJic';

async function readDashboard() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: SERVICE_ACCOUNT_FILE,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });

    // Get sheet metadata to see all tabs
    console.log('📊 Reading Transcript Dashboard structure...\n');
    const metadata = await sheets.spreadsheets.get({
      spreadsheetId: DASHBOARD_ID,
    });

    console.log('📋 Available Tabs:');
    console.log('='.repeat(80));
    metadata.data.sheets.forEach((sheet, index) => {
      console.log(`${index + 1}. ${sheet.properties.title} (${sheet.properties.gridProperties.rowCount} rows × ${sheet.properties.gridProperties.columnCount} cols)`);
    });

    console.log('\n📖 Reading first 5 rows from each tab...\n');

    for (const sheet of metadata.data.sheets) {
      const sheetName = sheet.properties.title;
      console.log('='.repeat(80));
      console.log(`Tab: ${sheetName}`);
      console.log('='.repeat(80));

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: DASHBOARD_ID,
        range: `${sheetName}!A1:Z5`,
      });

      const rows = response.data.values || [];
      if (rows.length === 0) {
        console.log('(Empty tab)\n');
        continue;
      }

      // Print headers
      if (rows[0]) {
        console.log('Headers:', rows[0].join(' | '));
      }

      // Print first few data rows
      for (let i = 1; i < Math.min(rows.length, 5); i++) {
        console.log(`Row ${i}:`, rows[i].join(' | '));
      }
      console.log();
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

readDashboard();

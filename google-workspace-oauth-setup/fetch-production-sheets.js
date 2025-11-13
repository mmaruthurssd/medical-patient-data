const { google } = require('googleapis');
const fs = require('fs').promises;
const path = require('path');

/**
 * Fetch production sheet registry from Google Sheets
 * Uses service account for authentication
 */

const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');
const SPREADSHEET_ID = '1ZU64Umiv3bHwXq8arr4tJqBLPxUuEG2LeVOvODMuOjw';
const SHEET_NAME = 'gid=204298665'; // Will use range notation instead

async function fetchProductionSheets() {
  console.log('\n========================================');
  console.log('Fetching Production Sheet Registry');
  console.log('========================================\n');

  try {
    // Load service account credentials
    console.log('Loading service account credentials...');
    const serviceAccount = JSON.parse(
      await fs.readFile(SERVICE_ACCOUNT_PATH, 'utf8')
    );
    console.log(`✓ Service account: ${serviceAccount.client_email}\n`);

    // Create auth client
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccount,
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets.readonly',
        'https://www.googleapis.com/auth/drive.readonly'
      ]
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Fetch data from the sheet
    console.log('Fetching production sheet data...');
    console.log(`Spreadsheet ID: ${SPREADSHEET_ID}\n`);

    // Get sheet metadata to find the correct sheet name
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID
    });

    console.log(`✓ Connected to spreadsheet: ${spreadsheet.data.properties.title}\n`);
    console.log('Available sheets:');
    spreadsheet.data.sheets.forEach(sheet => {
      console.log(`  - ${sheet.properties.title} (ID: ${sheet.properties.sheetId})`);
    });
    console.log('');

    // Find sheet by gid (sheetId)
    const targetSheet = spreadsheet.data.sheets.find(
      sheet => sheet.properties.sheetId === 204298665
    );

    if (!targetSheet) {
      throw new Error('Sheet with gid=204298665 not found');
    }

    const sheetName = targetSheet.properties.title;
    console.log(`✓ Target sheet: ${sheetName}\n`);

    // Fetch all data from columns A, B, C
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A:C`
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      console.log('⚠️  No data found in sheet');
      return [];
    }

    console.log(`✓ Fetched ${rows.length} rows (including header)\n`);

    // Parse data (skip header row)
    const productionSheets = [];
    let skippedRows = 0;

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];

      // Skip empty rows
      if (!row[0] || !row[1]) {
        skippedRows++;
        continue;
      }

      productionSheets.push({
        sheetName: row[0]?.trim() || '',
        spreadsheetId: row[1]?.trim() || '',
        scriptId: row[2]?.trim() || ''
      });
    }

    console.log('Data Summary:');
    console.log(`  Total rows: ${rows.length}`);
    console.log(`  Header rows: 1`);
    console.log(`  Valid sheets: ${productionSheets.length}`);
    console.log(`  Skipped (empty): ${skippedRows}\n`);

    // Show sample data
    console.log('Sample data (first 5):');
    productionSheets.slice(0, 5).forEach((sheet, idx) => {
      console.log(`  ${idx + 1}. ${sheet.sheetName}`);
      console.log(`     Spreadsheet ID: ${sheet.spreadsheetId}`);
      console.log(`     Script ID: ${sheet.scriptId || '(none)'}\n`);
    });

    // Save to CSV
    const outputPath = path.join(
      __dirname,
      '../Implementation Projects/google-sheets-version-control/data/production-sheets.csv'
    );

    console.log('Saving to CSV...');
    console.log(`Output: ${outputPath}\n`);

    // Create CSV content
    const csvLines = [
      'Sheet Name,Spreadsheet ID,Script ID',
      ...productionSheets.map(sheet =>
        `"${sheet.sheetName}","${sheet.spreadsheetId}","${sheet.scriptId}"`
      )
    ];

    await fs.writeFile(outputPath, csvLines.join('\n'), 'utf8');
    console.log(`✓ Saved ${productionSheets.length} sheets to CSV\n`);

    console.log('========================================');
    console.log('✓ Production Sheet Registry Fetched');
    console.log('========================================\n');

    return productionSheets;

  } catch (error) {
    console.error('\n❌ Error fetching production sheets:');
    console.error(error.message);

    if (error.code === 403) {
      console.error('\n⚠️  Permission denied.');
      console.error('The service account needs access to the spreadsheet.');
      console.error('\nTo fix:');
      console.error('1. Open the spreadsheet');
      console.error('2. Click "Share"');
      console.error('3. Add: ssd-automation-service-account@workspace-automation-ssdspc.iam.gserviceaccount.com');
      console.error('4. Set permission to "Viewer"\n');
    } else if (error.code === 404) {
      console.error('\n⚠️  Spreadsheet not found.');
      console.error('Check that the spreadsheet ID is correct.\n');
    }

    throw error;
  }
}

// Run the script
fetchProductionSheets()
  .then(sheets => {
    console.log(`Success! Fetched ${sheets.length} production sheets.`);
    process.exit(0);
  })
  .catch(error => {
    console.error('Failed to fetch production sheets.');
    process.exit(1);
  });

/**
 * Apply standard formatting to AI Task Tracker - Testing sheet
 * Demonstrates use of new formatting standards
 */

const { google } = require('googleapis');
const path = require('path');
const { applyStandardFormatting } = require('./apply-standard-formatting');

const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'service-account.json');
const SPREADSHEET_ID = '1slreBMgMoBy16KvvpCaEQPe3HccugWJxv8a7BrjDV7A';

async function formatTestingSheet() {
  try {
    console.log('🎨 Applying formatting standards to AI Task Tracker - Testing sheet...\n');

    // Authenticate
    const auth = new google.auth.GoogleAuth({
      keyFile: SERVICE_ACCOUNT_FILE,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });

    // Get sheet metadata to find sheet IDs
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    const sheetIds = {};
    spreadsheet.data.sheets.forEach(sheet => {
      sheetIds[sheet.properties.title] = sheet.properties.sheetId;
    });

    console.log('📋 Found tabs:', Object.keys(sheetIds).join(', '));
    console.log();

    // Tab 1: Test Transcripts
    console.log('🎨 Formatting "Test Transcripts" tab...');
    await applyStandardFormatting(sheets, SPREADSHEET_ID, sheetIds['Test Transcripts'], {
      userEditable: [3, 9, 10, 11],      // Selected for Testing, Complexity Tag, Action Item Density, Notes
      autoPopulated: [0, 1, 2, 4, 5, 6, 7, 8],  // Everything else (pulled from dashboard)
      centerText: [0, 1, 3, 6, 8, 9, 10],  // Short text columns
      centerNumbers: []
    });
    console.log('✅ Test Transcripts formatted\n');

    // Tab 2: Manual Extraction
    console.log('🎨 Formatting "Manual Extraction" tab...');
    await applyStandardFormatting(sheets, SPREADSHEET_ID, sheetIds['Manual Extraction'], {
      userEditable: [0, 1, 2, 3, 4, 5],  // All columns (user manually extracts)
      autoPopulated: [],
      centerText: [0, 2, 3, 4],  // Transcript ID, Owner, Priority, Due Date
      centerNumbers: []
    });
    console.log('✅ Manual Extraction formatted\n');

    // Tab 3: AI Extraction
    console.log('🎨 Formatting "AI Extraction" tab...');
    await applyStandardFormatting(sheets, SPREADSHEET_ID, sheetIds['AI Extraction'], {
      userEditable: [],
      autoPopulated: [0, 1, 2, 3, 4, 5, 6],  // All columns (AI generated)
      centerText: [0, 2, 3, 4],  // Transcript ID, Owner, Priority, Due Date
      centerNumbers: [5]  // Confidence Score
    });
    console.log('✅ AI Extraction formatted\n');

    // Tab 4: Comparison
    console.log('🎨 Formatting "Comparison" tab...');
    await applyStandardFormatting(sheets, SPREADSHEET_ID, sheetIds['Comparison'], {
      userEditable: [],
      autoPopulated: [0, 1, 2, 3, 4, 5, 6],  // All computed
      centerText: [0, 1, 4, 5],  // Transcript ID, Metric, Match?, Error Type
      centerNumbers: []
    });
    console.log('✅ Comparison formatted\n');

    // Tab 5: Metrics
    console.log('🎨 Formatting "Metrics" tab...');
    await applyStandardFormatting(sheets, SPREADSHEET_ID, sheetIds['Metrics'], {
      userEditable: [2],  // Target (user sets targets)
      autoPopulated: [0, 1, 3],  // Metric Name, Value, Status
      centerText: [0, 3],  // Metric Name, Status
      centerNumbers: [1, 2]  // Value, Target
    });
    console.log('✅ Metrics formatted\n');

    console.log('='.repeat(80));
    console.log('✅ All formatting applied successfully!');
    console.log('='.repeat(80));
    console.log();
    console.log('📊 Sheet URL: https://docs.google.com/spreadsheets/d/' + SPREADSHEET_ID + '/edit');
    console.log();
    console.log('🎨 Applied formatting:');
    console.log('   ✅ All headers frozen and bold');
    console.log('   ✅ All headers set to wrap text');
    console.log('   🔵 User-editable columns: Light blue headers');
    console.log('   🟡 Auto-populated columns: Light yellow headers');
    console.log('   ↔️  Short text and numbers: Centered');
    console.log();

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    throw error;
  }
}

formatTestingSheet();

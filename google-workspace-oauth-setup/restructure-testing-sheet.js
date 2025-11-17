/**
 * Restructure AI Task Tracker - Testing sheet
 * From 5 tabs to 3 tabs with updated columns
 */

const { google } = require('googleapis');
const path = require('path');
const { applyStandardFormatting } = require('./apply-standard-formatting');

const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'service-account.json');
const SPREADSHEET_ID = '1slreBMgMoBy16KvvpCaEQPe3HccugWJxv8a7BrjDV7A';

async function restructureSheet() {
  try {
    console.log('🔄 Restructuring AI Task Tracker - Testing sheet...\n');

    const auth = new google.auth.GoogleAuth({
      keyFile: SERVICE_ACCOUNT_FILE,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });

    // Get current sheet structure
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    const currentSheets = {};
    spreadsheet.data.sheets.forEach(sheet => {
      currentSheets[sheet.properties.title] = sheet.properties.sheetId;
    });

    console.log('📋 Current tabs:', Object.keys(currentSheets).join(', '));

    // Delete tabs we don't need: Manual Extraction, Comparison, Metrics
    console.log('\n🗑️  Deleting unused tabs...');
    const deleteRequests = [];

    if (currentSheets['Manual Extraction']) {
      deleteRequests.push({ deleteSheet: { sheetId: currentSheets['Manual Extraction'] } });
    }
    if (currentSheets['Comparison']) {
      deleteRequests.push({ deleteSheet: { sheetId: currentSheets['Comparison'] } });
    }
    if (currentSheets['Metrics']) {
      deleteRequests.push({ deleteSheet: { sheetId: currentSheets['Metrics'] } });
    }

    if (deleteRequests.length > 0) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: { requests: deleteRequests }
      });
      console.log('✅ Deleted 3 tabs');
    }

    // Rename "AI Extraction" to "AI Extraction Results"
    console.log('\n✏️  Renaming tab...');
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [{
          updateSheetProperties: {
            properties: {
              sheetId: currentSheets['AI Extraction'],
              title: 'AI Extraction Results'
            },
            fields: 'title'
          }
        }]
      }
    });
    console.log('✅ Renamed "AI Extraction" → "AI Extraction Results"');

    // Add new "Iteration Log" tab
    console.log('\n➕ Adding Iteration Log tab...');
    const addSheetResponse = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [{
          addSheet: {
            properties: {
              title: 'Iteration Log',
              gridProperties: {
                rowCount: 100,
                columnCount: 10,
                frozenRowCount: 1
              }
            }
          }
        }]
      }
    });
    const iterationLogSheetId = addSheetResponse.data.replies[0].addSheet.properties.sheetId;
    console.log('✅ Created Iteration Log tab');

    // Update AI Extraction Results columns
    console.log('\n📝 Updating AI Extraction Results headers...');
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: 'AI Extraction Results!A1:N1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          'Transcript ID',
          'Creation Date',
          'Task Summary',
          'Task Description',
          'Category',
          'Project/Recurring List',
          'Status',
          'Next Steps',
          'Owner/Assigned To',
          'Due Date',
          'Priority',
          'User Feedback',
          'Confidence Score',
          'Raw AI Response'
        ]]
      }
    });
    console.log('✅ AI Extraction Results headers updated');

    // Set up Iteration Log headers
    console.log('\n📝 Setting up Iteration Log headers...');
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Iteration Log!A1:H1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          'Version',
          'Date Tested',
          'Transcripts Used',
          'Accuracy/Quality Notes',
          'User Feedback Summary',
          'Changes Made',
          'Next Actions',
          'Link to Results'
        ]]
      }
    });
    console.log('✅ Iteration Log headers set');

    // Apply formatting to AI Extraction Results
    console.log('\n🎨 Applying formatting to AI Extraction Results...');
    await applyStandardFormatting(sheets, SPREADSHEET_ID, currentSheets['AI Extraction'], {
      userEditable: [11],  // User Feedback column only
      autoPopulated: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13],  // Everything else
      centerText: [0, 1, 4, 6, 8, 9, 10],  // Short text columns
      centerNumbers: [12]  // Confidence Score
    });
    console.log('✅ AI Extraction Results formatted');

    // Apply formatting to Iteration Log
    console.log('\n🎨 Applying formatting to Iteration Log...');
    await applyStandardFormatting(sheets, SPREADSHEET_ID, iterationLogSheetId, {
      userEditable: [6],  // Next Actions
      autoPopulated: [0, 1, 2, 3, 4, 5, 7],  // Everything else
      centerText: [0, 1],
      centerNumbers: []
    });
    console.log('✅ Iteration Log formatted');

    // Test Transcripts already formatted, just verify
    console.log('\n✅ Test Transcripts tab already formatted');

    console.log('\n' + '='.repeat(80));
    console.log('✅ Sheet Restructuring Complete!');
    console.log('='.repeat(80));
    console.log();
    console.log('📊 Final structure:');
    console.log('   1. Test Transcripts - Pull transcripts from dashboard');
    console.log('   2. AI Extraction Results - AI-extracted tasks with feedback');
    console.log('   3. Iteration Log - Track prompt versions and improvements');
    console.log();
    console.log('🔵 Light blue headers: User Feedback, Next Actions (user editable)');
    console.log('🟡 Light yellow headers: All other columns (auto-populated)');
    console.log();
    console.log('📊 Sheet URL: https://docs.google.com/spreadsheets/d/' + SPREADSHEET_ID + '/edit');
    console.log();

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

restructureSheet();

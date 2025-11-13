#!/usr/bin/env node

/**
 * Create Claude Automation Control Google Sheet
 *
 * This script creates the actual Google Sheet in "AI Development - No PHI" Shared Drive
 * with all three sheets (Scheduled Prompts, Execution Log, Response Viewer) pre-configured.
 */

const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

// Configuration
const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'service-account.json');
const SHARED_DRIVE_ID = '0AFSsMrTVhqWuUk9PVA'; // AI Development - No PHI
const SHEET_NAME = 'Claude Automation Control';

async function createAutomationControlSheet() {
  console.log('🚀 Creating Claude Automation Control Google Sheet...\n');

  // Authenticate with service account
  console.log('📝 Authenticating with service account...');
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/spreadsheets',
    ],
  });

  const authClient = await auth.getClient();
  const drive = google.drive({ version: 'v3', auth: authClient });
  const sheets = google.sheets({ version: 'v4', auth: authClient });

  // Step 1: Create the spreadsheet
  console.log('📊 Creating spreadsheet...');
  const createResponse = await drive.files.create({
    supportsAllDrives: true,
    requestBody: {
      name: SHEET_NAME,
      mimeType: 'application/vnd.google-apps.spreadsheet',
      parents: [SHARED_DRIVE_ID],
    },
    fields: 'id, webViewLink',
  });

  const spreadsheetId = createResponse.data.id;
  const webViewLink = createResponse.data.webViewLink;

  console.log(`✅ Spreadsheet created!`);
  console.log(`   ID: ${spreadsheetId}`);
  console.log(`   URL: ${webViewLink}\n`);

  // Step 2: Set up the sheets structure
  console.log('📋 Setting up sheet structure...');

  // Rename default sheet to "Scheduled Prompts" and add other sheets
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        // Rename Sheet1 to "Scheduled Prompts"
        {
          updateSheetProperties: {
            properties: {
              sheetId: 0,
              title: 'Scheduled Prompts',
            },
            fields: 'title',
          },
        },
        // Add "Execution Log" sheet
        {
          addSheet: {
            properties: {
              title: 'Execution Log',
            },
          },
        },
        // Add "Response Viewer" sheet
        {
          addSheet: {
            properties: {
              title: 'Response Viewer',
            },
          },
        },
      ],
    },
  });

  // Step 3: Add headers and formatting for each sheet
  console.log('📝 Adding headers and formatting...');

  // Scheduled Prompts headers
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: 'Scheduled Prompts!A1:O1',
    valueInputOption: 'RAW',
    requestBody: {
      values: [
        [
          'ID',
          'Status',
          'Name',
          'Prompt Text',
          'Schedule Type',
          'Time',
          'Days of Week',
          'Day of Month',
          'Priority',
          'Data Source',
          'Last Run',
          'Next Run',
          'Run Count',
          'Last Status',
          'Notes',
        ],
      ],
    },
  });

  // Execution Log headers
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: 'Execution Log!A1:G1',
    valueInputOption: 'RAW',
    requestBody: {
      values: [
        [
          'Timestamp',
          'Prompt ID',
          'Prompt Name',
          'Status',
          'Response ID',
          'Duration',
          'Error Message',
        ],
      ],
    },
  });

  // Response Viewer headers
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: 'Response Viewer!A1:F1',
    valueInputOption: 'RAW',
    requestBody: {
      values: [
        [
          'Response ID',
          'Prompt Name',
          'Executed At',
          'Response Text',
          'Summary',
          'Actions Taken',
        ],
      ],
    },
  });

  // Step 4: Format headers (bold, freeze)
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        // Bold headers on all sheets
        {
          repeatCell: {
            range: {
              sheetId: 0,
              startRowIndex: 0,
              endRowIndex: 1,
            },
            cell: {
              userEnteredFormat: {
                textFormat: { bold: true },
              },
            },
            fields: 'userEnteredFormat.textFormat.bold',
          },
        },
        // Freeze header row on all sheets
        {
          updateSheetProperties: {
            properties: {
              sheetId: 0,
              gridProperties: {
                frozenRowCount: 1,
              },
            },
            fields: 'gridProperties.frozenRowCount',
          },
        },
      ],
    },
  });

  console.log('✅ Sheet structure complete!\n');

  // Step 5: Add data validation (dropdowns)
  console.log('🔧 Adding data validation...');

  const getSheetId = async (title) => {
    const response = await sheets.spreadsheets.get({ spreadsheetId });
    const sheet = response.data.sheets.find((s) => s.properties.title === title);
    return sheet.properties.sheetId;
  };

  const scheduledPromptsSheetId = await getSheetId('Scheduled Prompts');

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        // Status dropdown (column B)
        {
          setDataValidation: {
            range: {
              sheetId: scheduledPromptsSheetId,
              startRowIndex: 1,
              endRowIndex: 1000,
              startColumnIndex: 1,
              endColumnIndex: 2,
            },
            rule: {
              condition: {
                type: 'ONE_OF_LIST',
                values: [
                  { userEnteredValue: 'Active' },
                  { userEnteredValue: 'Paused' },
                  { userEnteredValue: 'Completed' },
                  { userEnteredValue: 'Error' },
                ],
              },
              showCustomUi: true,
            },
          },
        },
        // Schedule Type dropdown (column E)
        {
          setDataValidation: {
            range: {
              sheetId: scheduledPromptsSheetId,
              startRowIndex: 1,
              endRowIndex: 1000,
              startColumnIndex: 4,
              endColumnIndex: 5,
            },
            rule: {
              condition: {
                type: 'ONE_OF_LIST',
                values: [
                  { userEnteredValue: 'Daily' },
                  { userEnteredValue: 'Weekly' },
                  { userEnteredValue: 'Monthly' },
                  { userEnteredValue: 'One-Time' },
                  { userEnteredValue: 'Manual' },
                ],
              },
              showCustomUi: true,
            },
          },
        },
        // Priority dropdown (column I)
        {
          setDataValidation: {
            range: {
              sheetId: scheduledPromptsSheetId,
              startRowIndex: 1,
              endRowIndex: 1000,
              startColumnIndex: 8,
              endColumnIndex: 9,
            },
            rule: {
              condition: {
                type: 'ONE_OF_LIST',
                values: [
                  { userEnteredValue: 'Urgent' },
                  { userEnteredValue: 'High' },
                  { userEnteredValue: 'Normal' },
                  { userEnteredValue: 'Low' },
                ],
              },
              showCustomUi: true,
            },
          },
        },
      ],
    },
  });

  console.log('✅ Data validation complete!\n');

  // Step 6: Add example row
  console.log('📝 Adding example row...');

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: 'Scheduled Prompts!A2:O2',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [
        [
          '', // ID (auto-generated by script)
          'Paused', // Status (paused so it doesn't run)
          'Example: Daily Summary',
          'Generate summary of yesterday\'s activity. Include key metrics and any urgent items.',
          'Daily',
          '09:00',
          '', // Days of Week (not needed for Daily)
          '', // Day of Month (not needed for Daily)
          'Normal',
          '', // Data Source (optional)
          '', // Last Run (auto-updated)
          '', // Next Run (auto-calculated)
          0, // Run Count
          '', // Last Status
          'Example prompt - change Status to Active to enable',
        ],
      ],
    },
  });

  console.log('✅ Example row added!\n');

  // Final summary
  console.log('═══════════════════════════════════════════════════════════');
  console.log('✅ SUCCESS! Claude Automation Control Sheet created!');
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log(`📊 Spreadsheet URL:`);
  console.log(`   ${webViewLink}\n`);
  console.log(`📝 Next Steps:`);
  console.log(`   1. Open the spreadsheet in your browser`);
  console.log(`   2. Go to Extensions > Apps Script`);
  console.log(`   3. Delete default Code.gs content`);
  console.log(`   4. Paste the Apps Script code from:`);
  console.log(`      automation/CLAUDE-AUTOMATION-CONTROL-SHEET.md`);
  console.log(`   5. Update CONFIG with folder IDs (see instructions in doc)`);
  console.log(`   6. Run initializeSheets() and setupTriggers()\n`);
  console.log(`📁 Create these Drive folders next:`);
  console.log(`   AI Development - No PHI/workspace-management/03-automation/claude-automation/`);
  console.log(`   ├── prompts/`);
  console.log(`   └── responses/\n`);
  console.log('═══════════════════════════════════════════════════════════\n');

  // Save spreadsheet info to file for reference
  const infoFile = path.join(__dirname, '../automation/SHEET-INFO.json');
  fs.writeFileSync(
    infoFile,
    JSON.stringify(
      {
        spreadsheetId,
        webViewLink,
        createdAt: new Date().toISOString(),
        sharedDriveId: SHARED_DRIVE_ID,
        sheetName: SHEET_NAME,
      },
      null,
      2
    )
  );

  console.log(`💾 Spreadsheet info saved to: ${infoFile}\n`);
}

// Run the script
createAutomationControlSheet().catch((error) => {
  console.error('❌ Error creating sheet:', error);
  process.exit(1);
});

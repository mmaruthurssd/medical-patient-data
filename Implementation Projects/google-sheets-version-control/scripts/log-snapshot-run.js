#!/usr/bin/env node

/**
 * Log Snapshot Run to Google Sheet
 *
 * Adds a new entry to the Daily Snapshot Log with details from the GitHub Actions run.
 * Always inserts at row 2 (right after headers) so newest entries appear at top.
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const SPREADSHEET_ID = '1KpUhrEtW7-uHHS6GIngiXws0v2aM2wBC5ppyDBnRKxc';
const SHEET_NAME = 'Snapshot Runs';

// Parse command line arguments
const args = process.argv.slice(2);
const status = args[0] || 'Unknown';
const totalSheets = args[1] || '0';
const batch1Success = args[2] || '0';
const batch2Success = args[3] || '0';
const batch3Success = args[4] || '0';
const totalFailures = args[5] || '0';
const durationMinutes = args[6] || '0';
const githubRunId = args[7] || '';
const commitSha = args[8] || '';
const notes = args[9] || '';

async function getAuthClient() {
  // Try service account first (for GitHub Actions)
  if (process.env.GCP_SERVICE_ACCOUNT) {
    try {
      const serviceAccountKey = JSON.parse(process.env.GCP_SERVICE_ACCOUNT);
      const auth = new google.auth.GoogleAuth({
        credentials: serviceAccountKey,
        scopes: [
          'https://www.googleapis.com/auth/spreadsheets',
          'https://www.googleapis.com/auth/drive.file'
        ]
      });
      return auth.getClient();
    } catch (error) {
      throw new Error(`Service account authentication failed: ${error.message}`);
    }
  }

  // Fall back to OAuth (for local development)
  const clasprcPath = path.join(process.env.HOME, '.clasprc.json');

  if (!fs.existsSync(clasprcPath)) {
    throw new Error('No .clasprc.json found and GCP_SERVICE_ACCOUNT not set. Please run authentication first');
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

async function logSnapshotRun() {
  try {
    console.log('📝 Logging snapshot run to Google Sheet...\n');

    const auth = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth });

    // Get current date and time in Central Time
    const now = new Date();
    const centralTime = now.toLocaleString('en-US', {
      timeZone: 'America/Chicago',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    // Parse the formatted string to get date and time parts
    const [datePart, timePart] = centralTime.split(', ');
    const [month, day, year] = datePart.split('/');
    const runDate = `${year}-${month}-${day}`;
    const runTime = timePart;

    // Build GitHub Actions run link
    const githubRunLink = githubRunId
      ? `https://github.com/mmaruthurssd/ssd-google-sheets-staging-production/actions/runs/${githubRunId}`
      : '';

    // Prepare the row data
    const rowData = [
      runDate,
      runTime,
      status,
      totalSheets,
      batch1Success,
      batch2Success,
      batch3Success,
      totalFailures,
      durationMinutes,
      githubRunLink,
      commitSha.substring(0, 7), // Short SHA
      notes
    ];

    console.log('📊 Run Details:');
    console.log(`   Date: ${runDate}`);
    console.log(`   Time: ${runTime} UTC`);
    console.log(`   Status: ${status}`);
    console.log(`   Total Sheets: ${totalSheets}`);
    console.log(`   Batch Results: ${batch1Success}/${batch2Success}/${batch3Success}`);
    console.log(`   Failures: ${totalFailures}`);
    console.log(`   Duration: ${durationMinutes} min`);
    console.log(`   GitHub Run: ${githubRunId}`);
    console.log(`   Commit: ${commitSha.substring(0, 7)}\n`);

    // Get the sheet ID
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID
    });
    const sheetId = spreadsheet.data.sheets[0].properties.sheetId;

    // Insert a new row at position 2 (right after headers)
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [{
          insertDimension: {
            range: {
              sheetId: sheetId,
              dimension: 'ROWS',
              startIndex: 1,
              endIndex: 2
            }
          }
        }]
      }
    });

    // Add the data to row 2
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A2`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [rowData]
      }
    });

    console.log('✅ SUCCESS! Snapshot run logged to sheet');
    console.log(`🔗 View log: https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit\n`);

  } catch (error) {
    console.error('\n❌ Error logging snapshot run:', error.message);
    // Don't fail the workflow if logging fails - just warn
    console.warn('⚠️  Continuing despite logging error...');
    process.exit(0);
  }
}

// Run the logging
if (require.main === module) {
  logSnapshotRun()
    .then(() => {
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Logging failed:', error.message);
      process.exit(0); // Exit success to not fail the workflow
    });
}

module.exports = { logSnapshotRun };

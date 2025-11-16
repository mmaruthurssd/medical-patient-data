/**
 * Query FILE-INDEX to find Transcript Dashboard
 */

const { google } = require('googleapis');
const path = require('path');

const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'service-account.json');
const FILE_INDEX_ID = '1dZHfeJJsH4MV2-7L-lNZrfNcj9M2NOraqkOWstbCFCY';

async function queryFileIndex() {
  try {
    // Authenticate with service account
    const auth = new google.auth.GoogleAuth({
      keyFile: SERVICE_ACCOUNT_FILE,
      scopes: [
        'https://www.googleapis.com/auth/drive.readonly',
        'https://www.googleapis.com/auth/spreadsheets.readonly'
      ],
    });

    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });

    // Read FILE-INDEX
    console.log('📖 Reading FILE-INDEX spreadsheet...\n');
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: FILE_INDEX_ID,
      range: 'File Index!A:F',
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.log('No data found in FILE-INDEX');
      return;
    }

    // Print header
    console.log('='.repeat(120));
    console.log('FILE-INDEX Contents');
    console.log('='.repeat(120));
    console.log();

    // Print all rows
    const [headers, ...data] = rows;
    console.log('Headers:', headers.join(' | '));
    console.log('-'.repeat(120));

    data.forEach((row, index) => {
      console.log(`${index + 1}. ${row.join(' | ')}`);
    });

    console.log();
    console.log('='.repeat(120));
    console.log();

    // Search for transcript-related sheets
    console.log('🔍 Searching for Transcript Dashboard...\n');
    const transcriptSheets = data.filter(row => {
      const filename = row[1] || '';
      return filename.toLowerCase().includes('transcript') ||
             filename.toLowerCase().includes('meeting');
    });

    if (transcriptSheets.length > 0) {
      console.log('✅ Found transcript-related sheets:');
      transcriptSheets.forEach(row => {
        const filename = row[1];
        const url = row[2] || 'No URL';
        const id = extractIdFromUrl(url);
        console.log();
        console.log(`  📊 ${filename}`);
        console.log(`     URL: ${url}`);
        console.log(`     ID:  ${id}`);
      });
    } else {
      console.log('❌ No transcript-related sheets found in FILE-INDEX');
      console.log();
      console.log('💡 The Transcript Dashboard might not be indexed yet.');
      console.log('   You may need to add it manually or search the Shared Drive.');
    }

  } catch (error) {
    console.error('❌ Error querying FILE-INDEX:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

function extractIdFromUrl(url) {
  if (!url || !url.includes('spreadsheets')) {
    return 'N/A';
  }
  const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : 'Could not extract ID';
}

// Run the query
queryFileIndex();

#!/usr/bin/env node
/**
 * Pull Transcripts from Dashboard to Testing Sheet
 *
 * Reads transcripts from 2025 Transcripts Dashboard and populates
 * the AI Task Tracker Testing sheet with sample data.
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Configuration
const CREDENTIALS_FILE = path.join(__dirname, 'credentials.json');
const TOKEN_FILE = path.join(__dirname, 'token.json');
const DASHBOARD_ID = '1MCLftX_nOx9jg9xi_nvMzyGhZSUCsMrAM-Vk_iWGJic'; // 2025 Transcripts Dashboard
const TESTING_SHEET_ID = '1slreBMgMoBy16KvvpCaEQPe3HccugWJxv8a7BrjDV7A'; // AI Task Tracker - Testing

// Tab names
const DASHBOARD_TABS = {
  EMAILS: 'Emails',
  CHATS: 'Chats',
  MEETINGS: 'Meeting Transcripts'
};

const TESTING_TAB = 'Test Transcripts';

// How many of each type to pull (default: 2 each = 6 total)
const COUNT_PER_TYPE = 2;

async function authenticateOAuth() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_FILE, 'utf8'));
  const token = JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf8'));

  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );
  oAuth2Client.setCredentials(token);

  return oAuth2Client;
}

async function readDashboardTab(sheets, tabName) {
  console.log(`📖 Reading ${tabName} tab from dashboard...`);

  try {
    // Get cell values
    const valueResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: DASHBOARD_ID,
      range: `${tabName}!A:Z`
    });

    // Get cell metadata including hyperlinks
    const dataResponse = await sheets.spreadsheets.get({
      spreadsheetId: DASHBOARD_ID,
      ranges: [`${tabName}!A:Z`],
      includeGridData: true
    });

    const rows = valueResponse.data.values;
    if (!rows || rows.length === 0) {
      console.log(`   ⚠️  No data found in ${tabName}`);
      return { headers: [], data: [], hyperlinks: [] };
    }

    // Extract hyperlinks from grid data
    const gridData = dataResponse.data.sheets[0].data[0].rowData;
    const hyperlinks = gridData?.map(row =>
      row.values?.map(cell => cell.hyperlink || null) || []
    ) || [];

    const headers = rows[0];
    const data = rows.slice(1);
    console.log(`   ✅ Found ${data.length} rows`);

    return { headers, data, hyperlinks: hyperlinks.slice(1) }; // Skip header row

  } catch (error) {
    console.error(`   ❌ Error reading ${tabName}:`, error.message);
    return { headers: [], data: [], hyperlinks: [] };
  }
}

async function readTranscriptFile(drive, docs, fileUrl) {
  // Extract file ID from URL
  const fileIdMatch = fileUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (!fileIdMatch) {
    return '[Unable to extract file ID from URL]';
  }

  const fileId = fileIdMatch[1];

  try {
    // First check file type
    const fileInfo = await drive.files.get({
      fileId: fileId,
      fields: 'mimeType',
      supportsAllDrives: true
    });

    const mimeType = fileInfo.data.mimeType;

    // Handle different file types
    if (mimeType === 'text/plain') {
      // Plain text file - download content
      const response = await drive.files.get({
        fileId: fileId,
        alt: 'media',
        supportsAllDrives: true
      }, { responseType: 'text' });

      return response.data;

    } else if (mimeType === 'application/vnd.google-apps.document') {
      // Google Doc - use Docs API
      const doc = await docs.documents.get({
        documentId: fileId
      });

      let text = '';
      const content = doc.data.body.content;

      for (const element of content) {
        if (element.paragraph) {
          const paragraph = element.paragraph;
          for (const elem of paragraph.elements) {
            if (elem.textRun) {
              text += elem.textRun.content;
            }
          }
        }
      }

      return text.trim();

    } else {
      return `[Unsupported file type: ${mimeType}]`;
    }

  } catch (error) {
    console.error(`     ⚠️  Could not read file ${fileId}:`, error.message);
    return `[Error reading file: ${error.message}]`;
  }
}

function formatDate(dateValue) {
  if (!dateValue) return '';
  const date = new Date(dateValue);
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

async function convertRowToTranscript(row, headers, type, drive, docs, rowHyperlinks) {
  // Find column indices
  const dateCol = headers.findIndex(h => h.toLowerCase().includes('date'));
  const titleCol = headers.findIndex(h => h.toLowerCase().includes('subject') || h.toLowerCase().includes('title'));
  const fromCol = headers.findIndex(h => h.toLowerCase().includes('from') || h.toLowerCase().includes('participants'));
  const bodyCol = headers.findIndex(h => h.toLowerCase().includes('body') || h.toLowerCase().includes('text'));
  const docCol = headers.findIndex(h => h.toLowerCase().includes('doc') || h.toLowerCase().includes('transcript link'));

  const date = formatDate(row[dateCol]);
  const title = row[titleCol] || '';
  const from = row[fromCol] || '';
  let fullText = '';

  // All transcript types store text in external files
  // Use hyperlink URL instead of cell text value
  if (docCol >= 0 && rowHyperlinks && rowHyperlinks[docCol]) {
    console.log(`     📄 Reading transcript file...`);
    fullText = await readTranscriptFile(drive, docs, rowHyperlinks[docCol]);
  } else if (bodyCol >= 0) {
    fullText = row[bodyCol] || '';
  }

  // Google Sheets has a 50,000 character limit per cell
  // Truncate if needed (for testing, partial transcripts are sufficient)
  const MAX_CELL_LENGTH = 45000; // Leave buffer
  if (fullText.length > MAX_CELL_LENGTH) {
    console.log(`     ⚠️  Truncating transcript from ${fullText.length} to ${MAX_CELL_LENGTH} chars`);
    fullText = fullText.substring(0, MAX_CELL_LENGTH) + '\n\n[... Truncated for testing ...]';
  }

  return {
    transcriptId: '', // Will be auto-generated by sheet
    date,
    type,
    title,
    sourceDocLink: rowHyperlinks && rowHyperlinks[docCol] ? rowHyperlinks[docCol] : '',
    characterCount: fullText.length,
    fullText, // Keep for AI extraction, but won't write to sheet
    processingStatus: 'Pending'
  };
}

async function pullTranscripts() {
  try {
    console.log('🚀 Starting transcript pull...\n');

    // Authenticate
    console.log('🔑 Authenticating...');
    const auth = await authenticateOAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const drive = google.drive({ version: 'v3', auth });
    const docs = google.docs({ version: 'v1', auth });
    console.log('✅ Authenticated\n');

    // Read dashboard tabs (MEETINGS ONLY for now)
    // const emailsData = await readDashboardTab(sheets, DASHBOARD_TABS.EMAILS);
    // const chatsData = await readDashboardTab(sheets, DASHBOARD_TABS.CHATS);
    const meetingsData = await readDashboardTab(sheets, DASHBOARD_TABS.MEETINGS);

    console.log();

    // Convert to transcript format
    console.log('🔄 Converting transcripts...\n');

    const allTranscripts = [];

    // FOCUS ON MEETINGS ONLY (skip emails and chats for now)

    // Process emails - SKIPPED
    // console.log(`📧 Processing ${COUNT_PER_TYPE} emails...`);
    // for (let i = 0; i < Math.min(COUNT_PER_TYPE, emailsData.data.length); i++) {
    //   const transcript = await convertRowToTranscript(
    //     emailsData.data[i],
    //     emailsData.headers,
    //     'Email',
    //     drive,
    //     docs,
    //     emailsData.hyperlinks[i]
    //   );
    //   allTranscripts.push(transcript);
    // }
    // console.log(`   ✅ ${Math.min(COUNT_PER_TYPE, emailsData.data.length)} emails converted`);

    // Process chats - SKIPPED
    // console.log(`💬 Processing ${COUNT_PER_TYPE} chats...`);
    // for (let i = 0; i < Math.min(COUNT_PER_TYPE, chatsData.data.length); i++) {
    //   const transcript = await convertRowToTranscript(
    //     chatsData.data[i],
    //     chatsData.headers,
    //     'Chat',
    //     drive,
    //     docs,
    //     chatsData.hyperlinks[i]
    //   );
    //   allTranscripts.push(transcript);
    // }
    // console.log(`   ✅ ${Math.min(COUNT_PER_TYPE, chatsData.data.length)} chats converted`);

    // Process meetings - ONLY PROCESSING MEETINGS
    console.log(`🎤 Processing ${COUNT_PER_TYPE} meetings (MEETINGS ONLY)...`);
    for (let i = 0; i < Math.min(COUNT_PER_TYPE, meetingsData.data.length); i++) {
      const transcript = await convertRowToTranscript(
        meetingsData.data[i],
        meetingsData.headers,
        'Meeting',
        drive,
        docs,
        meetingsData.hyperlinks[i]
      );
      allTranscripts.push(transcript);
    }
    console.log(`   ✅ ${Math.min(COUNT_PER_TYPE, meetingsData.data.length)} meetings converted\n`);

    // Write to testing sheet
    console.log('⬆️  Writing to testing sheet...');

    // Clear existing test data (keep headers)
    await sheets.spreadsheets.values.clear({
      spreadsheetId: TESTING_SHEET_ID,
      range: `${TESTING_TAB}!A2:H`
    });
    console.log('   🗑️  Cleared existing data');

    // Format rows for writing - lightweight log only (no full text!)
    const rows = allTranscripts.map((t, index) => [
      `T-${String(index + 1).padStart(3, '0')}`, // Auto-generated ID
      t.date,
      t.type,
      t.title,
      t.sourceDocLink,
      t.characterCount,
      0, // Tasks extracted count (will be updated after AI extraction)
      t.processingStatus
    ]);

    // Write data
    await sheets.spreadsheets.values.update({
      spreadsheetId: TESTING_SHEET_ID,
      range: `${TESTING_TAB}!A2`,
      valueInputOption: 'RAW',
      requestBody: {
        values: rows
      }
    });

    console.log(`   ✅ Wrote ${rows.length} transcripts\n`);

    // Save full transcript texts to local cache for AI extraction
    console.log('💾 Saving transcript cache for AI extraction...');
    const transcriptCache = {};
    allTranscripts.forEach((t, index) => {
      const transcriptId = `T-${String(index + 1).padStart(3, '0')}`;
      transcriptCache[transcriptId] = t.fullText;
    });

    fs.writeFileSync(
      path.join(__dirname, 'transcript-cache.json'),
      JSON.stringify(transcriptCache, null, 2)
    );
    console.log(`   ✅ Cached ${Object.keys(transcriptCache).length} transcripts\n`);

    // Summary
    console.log('='.repeat(80));
    console.log('✅ TRANSCRIPT PULL COMPLETE!');
    console.log('='.repeat(80));
    console.log();
    console.log('📊 Summary:');
    console.log(`   Total transcripts: ${allTranscripts.length}`);
    console.log(`   • Emails: ${allTranscripts.filter(t => t.type === 'Email').length}`);
    console.log(`   • Chats: ${allTranscripts.filter(t => t.type === 'Chat').length}`);
    console.log(`   • Meetings: ${allTranscripts.filter(t => t.type === 'Meeting').length}`);
    console.log();
    console.log('🔗 Testing Sheet:');
    console.log(`   https://docs.google.com/spreadsheets/d/${TESTING_SHEET_ID}/edit`);
    console.log();
    console.log('💡 Next Steps:');
    console.log('   1. Review the transcripts in the testing sheet');
    console.log('   2. Proceed with AI extraction testing');
    console.log();

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nFull error:', error);
    throw error;
  }
}

// Run
pullTranscripts();

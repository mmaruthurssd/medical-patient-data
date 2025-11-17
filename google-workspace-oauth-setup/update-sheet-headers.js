#!/usr/bin/env node
/**
 * Update Testing Sheet headers to match new structure
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const CREDENTIALS_FILE = path.join(__dirname, 'credentials.json');
const TOKEN_FILE = path.join(__dirname, 'token.json');
const TESTING_SHEET_ID = '1slreBMgMoBy16KvvpCaEQPe3HccugWJxv8a7BrjDV7A';

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

async function updateHeaders() {
  try {
    console.log('🔄 Updating Testing Sheet headers...\n');

    const auth = await authenticateOAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    // Update Test Transcripts headers
    console.log('📝 Updating Test Transcripts headers...');
    const transcriptHeaders = [
      'Transcript ID',
      'Date',
      'Type',
      'Title',
      'Source Doc Link',
      'Character Count',
      'Tasks Extracted',
      'Processing Status'
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId: TESTING_SHEET_ID,
      range: 'Test Transcripts!A1:H1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [transcriptHeaders]
      }
    });

    // Clear old data from Test Transcripts
    await sheets.spreadsheets.values.clear({
      spreadsheetId: TESTING_SHEET_ID,
      range: 'Test Transcripts!A2:Z'
    });

    console.log('   ✅ Test Transcripts headers updated');
    console.log('   ✅ Old data cleared\n');

    // Update AI Extraction Results headers
    console.log('📝 Updating AI Extraction Results headers...');
    const resultsHeaders = [
      'Transcript ID',
      'Source Type',
      'Participants',
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
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId: TESTING_SHEET_ID,
      range: 'AI Extraction Results!A1:P1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [resultsHeaders]
      }
    });

    // Clear old data from AI Extraction Results
    await sheets.spreadsheets.values.clear({
      spreadsheetId: TESTING_SHEET_ID,
      range: 'AI Extraction Results!A2:Z'
    });

    console.log('   ✅ AI Extraction Results headers updated');
    console.log('   ✅ Old data cleared\n');

    console.log('='.repeat(80));
    console.log('✅ HEADERS UPDATED SUCCESSFULLY!');
    console.log('='.repeat(80));
    console.log();
    console.log('📊 Test Transcripts now has:');
    transcriptHeaders.forEach((header, i) => {
      const col = String.fromCharCode(65 + i);
      console.log(`   Column ${col}: ${header}`);
    });
    console.log();
    console.log('📊 AI Extraction Results now has:');
    resultsHeaders.forEach((header, i) => {
      const col = String.fromCharCode(65 + i);
      console.log(`   Column ${col}: ${header}`);
    });
    console.log();
    console.log('💡 Next Steps:');
    console.log('   1. Run: node pull-transcripts.js');
    console.log('   2. Run: node extract-tasks-with-ai.js');
    console.log();

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

updateHeaders();

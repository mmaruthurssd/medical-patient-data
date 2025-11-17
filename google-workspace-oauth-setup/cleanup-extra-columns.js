#!/usr/bin/env node
/**
 * Remove extra columns from old structure in Test Transcripts tab
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

async function cleanupColumns() {
  try {
    console.log('🧹 Cleaning up extra columns from Test Transcripts...\n');

    const auth = await authenticateOAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    // Clear columns I onwards (everything after column H)
    await sheets.spreadsheets.values.clear({
      spreadsheetId: TESTING_SHEET_ID,
      range: 'Test Transcripts!I:Z'
    });

    console.log('   ✅ Extra columns removed\n');

    console.log('='.repeat(80));
    console.log('✅ CLEANUP COMPLETE!');
    console.log('='.repeat(80));
    console.log();
    console.log('📊 Test Transcripts now has only these columns:');
    console.log('   Column A: Transcript ID');
    console.log('   Column B: Date');
    console.log('   Column C: Type');
    console.log('   Column D: Title');
    console.log('   Column E: Source Doc Link');
    console.log('   Column F: Character Count');
    console.log('   Column G: Tasks Extracted');
    console.log('   Column H: Processing Status');
    console.log();

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

cleanupColumns();

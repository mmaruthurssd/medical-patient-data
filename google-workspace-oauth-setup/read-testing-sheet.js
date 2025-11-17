#!/usr/bin/env node
/**
 * Read current structure of Testing sheet to see what's actually there
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

async function readTestingSheet() {
  try {
    console.log('📊 Reading Testing Sheet structure...\n');

    const auth = await authenticateOAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    // Get sheet metadata
    const metadata = await sheets.spreadsheets.get({
      spreadsheetId: TESTING_SHEET_ID,
    });

    console.log('📋 Available Tabs:');
    console.log('='.repeat(80));
    metadata.data.sheets.forEach((sheet, index) => {
      console.log(`${index + 1}. ${sheet.properties.title}`);
    });

    console.log('\n📖 Reading headers and first row from each tab...\n');

    // Test Transcripts tab
    console.log('='.repeat(80));
    console.log('Tab: Test Transcripts');
    console.log('='.repeat(80));

    const transcriptsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: TESTING_SHEET_ID,
      range: 'Test Transcripts!A1:Z2'
    });

    if (transcriptsResponse.data.values) {
      console.log('\nHeaders:');
      const headers = transcriptsResponse.data.values[0] || [];
      headers.forEach((header, index) => {
        const colLetter = String.fromCharCode(65 + index); // A, B, C, etc.
        console.log(`   Column ${colLetter}: ${header}`);
      });

      if (transcriptsResponse.data.values[1]) {
        console.log('\nFirst data row:', transcriptsResponse.data.values[1].join(' | '));
      }
    }

    console.log('\n');

    // AI Extraction Results tab
    console.log('='.repeat(80));
    console.log('Tab: AI Extraction Results');
    console.log('='.repeat(80));

    const resultsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: TESTING_SHEET_ID,
      range: 'AI Extraction Results!A1:Z2'
    });

    if (resultsResponse.data.values) {
      console.log('\nHeaders:');
      const headers = resultsResponse.data.values[0] || [];
      headers.forEach((header, index) => {
        const colLetter = String.fromCharCode(65 + index);
        console.log(`   Column ${colLetter}: ${header}`);
      });

      if (resultsResponse.data.values[1]) {
        console.log('\nFirst data row:', resultsResponse.data.values[1].join(' | '));
      }
    }

    console.log('\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

readTestingSheet();

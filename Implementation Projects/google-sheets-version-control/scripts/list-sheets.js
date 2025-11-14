#!/usr/bin/env node

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const SHEET_ID = '1ZU64Umiv3bHwXq8arr4tJqBLPxUuEG2LeVOvODMuOjw';

async function listSheets() {
  try {
    const credentialsPath = path.join(__dirname, '../../../google-workspace-oauth-setup/credentials.json');
    const tokenPath = path.join(__dirname, '../../../google-workspace-oauth-setup/token.json');

    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
    const token = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));

    const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    oAuth2Client.setCredentials(token);

    const sheets = google.sheets({ version: 'v4', auth: oAuth2Client });

    const response = await sheets.spreadsheets.get({
      spreadsheetId: SHEET_ID,
    });

    console.log('Available sheets in spreadsheet:\n');
    response.data.sheets.forEach(sheet => {
      console.log(`  - "${sheet.properties.title}" (gid: ${sheet.properties.sheetId})`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  }
}

listSheets();

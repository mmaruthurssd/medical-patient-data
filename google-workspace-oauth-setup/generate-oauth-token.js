#!/usr/bin/env node
/**
 * OAuth Token Generator with Apps Script Write Access
 * Generates token.json with script.projects scope (not readonly)
 */

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const readline = require('readline');

const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');
const TOKEN_PATH = path.join(__dirname, 'token.json');

// OAuth2 scopes - FULL Apps Script access (not readonly!)
const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/spreadsheets.readonly',
  'https://www.googleapis.com/auth/script.projects',  // FULL ACCESS (not readonly!)
  'https://www.googleapis.com/auth/script.deployments',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/documents'
];

function createOAuth2Client() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
  return new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
}

async function authenticate() {
  const oAuth2Client = createOAuth2Client();
  
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  console.log('\n🔐 OAuth Authentication with Apps Script Write Access\n');
  console.log('Open this URL in your browser:\n');
  console.log(authUrl);
  console.log('\nAfter authorization, paste the code here:');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Enter code: ', async (code) => {
    rl.close();
    
    try {
      const { tokens } = await oAuth2Client.getToken(code);
      oAuth2Client.setCredentials(tokens);
      
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
      
      console.log('\n✅ Success! token.json created with scopes:');
      console.log('   ✓ script.projects (FULL ACCESS)');
      console.log('   ✓ spreadsheets');
      console.log('   ✓ drive.file');
      console.log('   ✓ documents\n');
      
    } catch (error) {
      console.error('\n❌ Error:', error.message);
      process.exit(1);
    }
  });
}

authenticate();

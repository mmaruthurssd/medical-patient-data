#!/usr/bin/env node

/**
 * Setup Google Workspace OAuth Authentication
 *
 * This script sets up OAuth authentication with full Google Workspace permissions
 * including Drive, Sheets, and Apps Script access.
 */

const { google } = require('googleapis');
const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// OAuth scopes - full Google Workspace access
const SCOPES = [
  'https://www.googleapis.com/auth/drive',                    // Full Drive access
  'https://www.googleapis.com/auth/spreadsheets',             // Full Sheets access
  'https://www.googleapis.com/auth/script.projects',          // Apps Script
  'https://www.googleapis.com/auth/script.deployments',       // Apps Script deployments
  'https://www.googleapis.com/auth/drive.file',               // Files created/opened by app
  'https://www.googleapis.com/auth/drive.metadata.readonly'   // Drive metadata
];

// Custom OAuth client with full Google Workspace permissions
// Client ID from Google Cloud Console (Google Workspace Automation Desktop Client)
const CLIENT_ID = '1009524936829-ueg6f6cnr537v0n560emcrrasj5urfcn.apps.googleusercontent.com';
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || ''; // Set via environment variable for security

const CREDENTIALS_PATH = path.join(process.env.HOME, '.clasprc.json');
const PORT = 3000;

async function authenticate() {
  console.log('🔐 Setting up Google Workspace Authentication\n');

  if (!CLIENT_SECRET) {
    console.error('❌ Error: GOOGLE_CLIENT_SECRET environment variable not set.\n');
    console.log('Please set it with your OAuth client secret from Google Cloud Console:\n');
    console.log('  export GOOGLE_CLIENT_SECRET="your-client-secret-here"\n');
    console.log('Then run this script again.\n');
    process.exit(1);
  }

  const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    `http://localhost:${PORT}/oauth2callback`
  );

  // Generate auth URL
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent' // Force consent to get refresh token
  });

  console.log('📋 Required Permissions:');
  console.log('  ✓ Full Google Drive access (read, write, move, delete)');
  console.log('  ✓ Full Google Sheets access (create, edit, format)');
  console.log('  ✓ Google Apps Script access (deploy, manage)');
  console.log('  ✓ Shared Drive access\n');

  console.log('🌐 Opening browser for authentication...');
  console.log(`   If browser doesn't open, visit: ${authUrl}\n`);

  // Open browser
  const platform = process.platform;
  const openCmd = platform === 'darwin' ? 'open' : platform === 'win32' ? 'start' : 'xdg-open';

  try {
    await execAsync(`${openCmd} "${authUrl}"`);
  } catch (error) {
    console.log('⚠️  Could not open browser automatically. Please visit the URL above.\n');
  }

  // Start local server to receive OAuth callback
  const code = await new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      try {
        const qs = new url.URL(req.url, `http://localhost:${PORT}`).searchParams;
        const code = qs.get('code');

        if (code) {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>Authentication Successful</title>
                <style>
                  body {
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    margin: 0;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  }
                  .container {
                    background: white;
                    padding: 40px;
                    border-radius: 10px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                    text-align: center;
                  }
                  .success {
                    color: #10b981;
                    font-size: 48px;
                    margin-bottom: 20px;
                  }
                  h1 {
                    color: #1f2937;
                    margin-bottom: 10px;
                  }
                  p {
                    color: #6b7280;
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="success">✓</div>
                  <h1>Authentication Successful!</h1>
                  <p>You can close this window and return to the terminal.</p>
                </div>
              </body>
            </html>
          `);

          server.close();
          resolve(code);
        }
      } catch (error) {
        reject(error);
      }
    }).listen(PORT, () => {
      console.log(`🔄 Waiting for authentication... (listening on port ${PORT})`);
    });
  });

  console.log('\n✅ Authorization code received!');
  console.log('🔄 Exchanging code for tokens...\n');

  // Exchange code for tokens
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  // Save credentials in clasp format
  const credentials = {
    tokens: {
      default: {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        type: 'authorized_user',
        refresh_token: tokens.refresh_token,
        access_token: tokens.access_token,
        expiry_date: tokens.expiry_date
      }
    }
  };

  // Backup existing credentials if they exist
  if (fs.existsSync(CREDENTIALS_PATH)) {
    const backupPath = `${CREDENTIALS_PATH}.backup-${Date.now()}`;
    fs.copyFileSync(CREDENTIALS_PATH, backupPath);
    console.log(`📦 Backed up existing credentials to: ${backupPath}`);
  }

  // Save new credentials
  fs.writeFileSync(CREDENTIALS_PATH, JSON.stringify(credentials, null, 2));
  console.log(`💾 Saved credentials to: ${CREDENTIALS_PATH}`);

  // Also save to project directory for local use
  const projectCredsPath = path.join(__dirname, '..', '.clasprc.json');
  fs.writeFileSync(projectCredsPath, JSON.stringify(credentials, null, 2));
  console.log(`💾 Saved credentials to: ${projectCredsPath}\n`);

  console.log('✅ Authentication Complete!\n');
  console.log('📋 Granted Permissions:');
  console.log('  ✓ Google Drive: Full access');
  console.log('  ✓ Google Sheets: Full access');
  console.log('  ✓ Apps Script: Full access');
  console.log('  ✓ Shared Drives: Full access\n');

  console.log('🎉 You can now run scripts that need full Google Workspace access!\n');

  // Test the credentials
  console.log('🧪 Testing credentials...');
  try {
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    const response = await drive.about.get({ fields: 'user' });
    console.log(`✅ Authenticated as: ${response.data.user.emailAddress}\n`);
  } catch (error) {
    console.error('⚠️  Warning: Could not verify credentials:', error.message);
  }

  return oauth2Client;
}

// Run authentication
if (require.main === module) {
  authenticate()
    .then(() => {
      console.log('👍 All set! You can now create the snapshot log sheet.');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Authentication failed:', error.message);
      process.exit(1);
    });
}

module.exports = { authenticate };

#!/usr/bin/env node

/**
 * Refresh Clasp OAuth Token
 *
 * Uses the refresh_token from ~/.clasprc.json to get a new access_token
 * and updates the credentials file.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const os = require('os');

const CLASP_RC_PATH = path.join(os.homedir(), '.clasprc.json');

/**
 * Refresh OAuth token using refresh_token
 */
function refreshToken(clientId, clientSecret, refreshToken) {
  return new Promise((resolve, reject) => {
    const postData = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    }).toString();

    const options = {
      hostname: 'oauth2.googleapis.com',
      port: 443,
      path: '/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Token refresh failed: ${res.statusCode} - ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function main() {
  console.log('🔄 Refreshing clasp OAuth token...\n');

  // Read current .clasprc.json
  if (!fs.existsSync(CLASP_RC_PATH)) {
    console.error('❌ Error: ~/.clasprc.json not found');
    console.error('   Run: npx @google/clasp login');
    process.exit(1);
  }

  const clasprc = JSON.parse(fs.readFileSync(CLASP_RC_PATH, 'utf8'));

  // Handle both old and new .clasprc.json formats
  const tokenData = clasprc.tokens?.default || clasprc.token;

  if (!tokenData || !tokenData.refresh_token) {
    console.error('❌ Error: No refresh_token found in ~/.clasprc.json');
    process.exit(1);
  }

  const { refresh_token, client_id, client_secret } = tokenData;

  console.log('📋 Current token info:');
  console.log(`   Refresh token: ${refresh_token.substring(0, 20)}...`);
  console.log(`   Client ID: ${client_id}\n`);

  try {
    // Use the client credentials from the token data itself
    const CLIENT_ID = client_id;
    const CLIENT_SECRET = client_secret;

    if (!CLIENT_ID || !CLIENT_SECRET) {
      console.error('❌ Error: Missing client_id or client_secret in ~/.clasprc.json');
      process.exit(1);
    }

    console.log('🔄 Requesting new access token...');
    const newTokens = await refreshToken(CLIENT_ID, CLIENT_SECRET, refresh_token);

    // Update .clasprc.json with new access token
    tokenData.access_token = newTokens.access_token;
    tokenData.expiry_date = Date.now() + (newTokens.expires_in * 1000);

    // Backup old file
    const backupPath = `${CLASP_RC_PATH}.backup-${Date.now()}`;
    fs.copyFileSync(CLASP_RC_PATH, backupPath);
    console.log(`📦 Backed up old credentials to: ${backupPath}`);

    // Write updated credentials (preserve original structure)
    if (clasprc.tokens?.default) {
      clasprc.tokens.default = tokenData;
    } else {
      clasprc.token = tokenData;
    }

    fs.writeFileSync(CLASP_RC_PATH, JSON.stringify(clasprc, null, 2));
    console.log('✅ Updated ~/.clasprc.json with new access token\n');

    // Show expiry time
    const expiryDate = new Date(tokenData.expiry_date);
    console.log('📋 New token info:');
    console.log(`   Access token: ${tokenData.access_token.substring(0, 30)}...`);
    console.log(`   Expires: ${expiryDate.toISOString()}`);
    console.log(`   Valid for: ${Math.floor(newTokens.expires_in / 60)} minutes\n`);

    console.log('✅ Token refresh complete!');
    console.log('\n🧪 Test with: npx @google/clasp list');

  } catch (error) {
    console.error('❌ Error refreshing token:', error.message);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const CREDENTIALS_PATH = path.join(__dirname, '../google-workspace-oauth-setup/credentials.json');
const TOKEN_PATH = path.join(__dirname, '../google-workspace-oauth-setup/token.json');

function getAuthenticatedClient() {
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    throw new Error(`Credentials file not found at: ${CREDENTIALS_PATH}`);
  }
  if (!fs.existsSync(TOKEN_PATH)) {
    throw new Error(`Token file not found at: ${TOKEN_PATH}`);
  }

  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
  const token = JSON.parse(fs.readFileSync(TOKEN_PATH));

  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  oAuth2Client.setCredentials(token);
  return oAuth2Client;
}

module.exports = { getAuthenticatedClient };

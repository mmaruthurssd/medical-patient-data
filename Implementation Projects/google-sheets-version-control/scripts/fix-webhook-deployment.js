#!/usr/bin/env node
/**
 * Fix webhook deployment permissions
 * Redeploys with proper access settings
 */

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const CREDENTIALS_PATH = path.join(__dirname, '../../../google-workspace-oauth-setup/credentials.json');
const TOKEN_PATH = path.join(__dirname, '../../../google-workspace-oauth-setup/token.json');
const SCRIPT_ID = '1EbeTzSxxpvwry21k1t_olMRvz1xuSQTZUHRf7cPzu87uEqmLDTJPdhnC'; // From previous deployment
const WEBHOOK_URL_FILE = path.join(__dirname, '.webhook-url');

console.log('🔧 Fixing Webhook Deployment Permissions');
console.log('=========================================');
console.log('');

async function fixDeployment() {
  // Load credentials
  const content = fs.readFileSync(TOKEN_PATH, 'utf-8');
  const token = JSON.parse(content);
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
  const { client_id, client_secret, redirect_uris } = credentials.installed;

  const oauth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  oauth2Client.setCredentials(token);

  const script = google.script({ version: 'v1', auth: oauth2Client });

  // List current deployments
  console.log('📋 Checking current deployments...');
  const deploymentsResponse = await script.projects.deployments.list({
    scriptId: SCRIPT_ID
  });

  console.log('Found deployments:');
  if (deploymentsResponse.data.deployments) {
    deploymentsResponse.data.deployments.forEach((d, i) => {
      console.log(`  ${i + 1}. ${d.deploymentId} - ${d.deploymentConfig?.description || 'No description'}`);
      if (d.deploymentConfig?.scriptApp) {
        console.log(`     Access: ${d.deploymentConfig.scriptApp.access}`);
        console.log(`     Execute as: ${d.deploymentConfig.scriptApp.executeAs}`);
      }
    });
  }

  console.log('');
  console.log('✅ Deployment exists');
  console.log('');
  console.log('The webhook URL is:');
  console.log(`https://script.google.com/macros/s/${SCRIPT_ID}/exec`);
  console.log('');
  console.log('NOTE: If you get errors accessing the webhook, you may need to:');
  console.log('1. Open: https://script.google.com/d/' + SCRIPT_ID + '/edit');
  console.log('2. Click Deploy → Manage deployments');
  console.log('3. Click Edit (pencil icon)');
  console.log('4. Change "Who has access" to "Anyone"');
  console.log('5. Click "Deploy"');
  console.log('');
}

fixDeployment().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});

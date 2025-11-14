#!/usr/bin/env node
/**
 * Automated Apps Script Webhook Deployment
 * Uses Google Apps Script API to programmatically deploy webhook code
 *
 * This solves the automation problem for deploying Apps Script to hundreds of sheets
 */

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

// Configuration
const SPREADSHEET_ID = '1KpUhrEtW7-uHHS6GIngiXws0v2aM2wBC5ppyDBnRKxc';
const CREDENTIALS_PATH = path.join(__dirname, '../../../google-workspace-oauth-setup/credentials.json');
const TOKEN_PATH = path.join(__dirname, '../../../google-workspace-oauth-setup/token.json');
const WEBHOOK_CODE_PATH = path.join(__dirname, 'workstation-backup-webhook.js');
const WEBHOOK_URL_FILE = path.join(__dirname, '.webhook-url');

// Required scopes for Apps Script API
const SCOPES = [
  'https://www.googleapis.com/auth/script.projects',
  'https://www.googleapis.com/auth/script.deployments',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive'
];

console.log('🚀 Automated Webhook Deployment via Apps Script API');
console.log('====================================================');
console.log('');

/**
 * Load saved credentials if they exist
 */
function loadSavedCredentials() {
  try {
    const content = fs.readFileSync(TOKEN_PATH, 'utf-8');
    const token = JSON.parse(content);

    // Load client credentials
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
    const { client_id, client_secret, redirect_uris } = credentials.installed;

    const oauth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    );

    oauth2Client.setCredentials(token);
    return oauth2Client;
  } catch (err) {
    return null;
  }
}

/**
 * Main deployment function
 */
async function deployWebhook() {
  // Step 1: Authenticate
  console.log('🔐 Step 1: Authenticating...');
  const auth = loadSavedCredentials();

  if (!auth) {
    console.error('❌ Error: No saved credentials found');
    console.error('Please run the OAuth setup first');
    process.exit(1);
  }

  console.log('✅ Authenticated');
  console.log('');

  // Step 2: Initialize Apps Script API
  console.log('📡 Step 2: Initializing Apps Script API...');
  const script = google.script({ version: 'v1', auth });
  const drive = google.drive({ version: 'v3', auth });

  console.log('✅ API initialized');
  console.log('');

  // Step 3: Check if Apps Script project exists for this spreadsheet
  console.log('🔍 Step 3: Checking for existing Apps Script project...');

  let scriptId = null;

  // Search for bound scripts in the spreadsheet
  try {
    const driveResponse = await drive.files.list({
      q: `'${SPREADSHEET_ID}' in parents and mimeType='application/vnd.google-apps.script'`,
      fields: 'files(id, name)',
      spaces: 'drive'
    });

    if (driveResponse.data.files && driveResponse.data.files.length > 0) {
      scriptId = driveResponse.data.files[0].id;
      console.log(`✅ Found existing script: ${scriptId}`);
    } else {
      console.log('ℹ️  No existing script found');
    }
  } catch (err) {
    console.log('⚠️  Could not search for existing script:', err.message);
  }

  console.log('');

  // Step 4: Create Apps Script project if it doesn't exist
  if (!scriptId) {
    console.log('📝 Step 4: Creating new Apps Script project...');

    try {
      const createResponse = await script.projects.create({
        requestBody: {
          title: 'Workstation Monitoring Webhook',
          parentId: SPREADSHEET_ID
        }
      });

      scriptId = createResponse.data.scriptId;
      console.log(`✅ Created new project: ${scriptId}`);
    } catch (err) {
      console.error('❌ Error creating project:', err.message);
      process.exit(1);
    }
  } else {
    console.log('⏩ Step 4: Skipped (using existing project)');
  }

  console.log('');

  // Step 5: Read webhook code
  console.log('📋 Step 5: Reading webhook code...');

  let webhookCode;
  try {
    webhookCode = fs.readFileSync(WEBHOOK_CODE_PATH, 'utf-8');
    console.log(`✅ Read ${webhookCode.length} bytes of code`);
  } catch (err) {
    console.error('❌ Error reading webhook code:', err.message);
    process.exit(1);
  }

  console.log('');

  // Step 6: Update project content
  console.log('☁️  Step 6: Pushing code to Apps Script project...');

  try {
    const updateResponse = await script.projects.updateContent({
      scriptId: scriptId,
      requestBody: {
        files: [
          {
            name: 'Code',
            type: 'SERVER_JS',
            source: webhookCode
          },
          {
            name: 'appsscript',
            type: 'JSON',
            source: JSON.stringify({
              timeZone: 'America/New_York',
              dependencies: {},
              exceptionLogging: 'STACKDRIVER',
              runtimeVersion: 'V8',
              webapp: {
                access: 'ANYONE',
                executeAs: 'USER_DEPLOYING'
              }
            }, null, 2)
          }
        ]
      }
    });

    console.log('✅ Code pushed successfully');
  } catch (err) {
    console.error('❌ Error updating content:', err.message);
    if (err.response && err.response.data) {
      console.error('Details:', JSON.stringify(err.response.data, null, 2));
    }
    process.exit(1);
  }

  console.log('');

  // Step 7: Create deployment
  console.log('🌐 Step 7: Deploying as web app...');

  let deploymentId;

  try {
    // First, get the latest version
    const versionsResponse = await script.projects.versions.create({
      scriptId: scriptId,
      requestBody: {
        description: `Automated deployment ${new Date().toISOString()}`
      }
    });

    const versionNumber = versionsResponse.data.versionNumber;
    console.log(`✅ Created version: ${versionNumber}`);

    // Create deployment
    const deployResponse = await script.projects.deployments.create({
      scriptId: scriptId,
      requestBody: {
        versionNumber: versionNumber,
        description: `Automated deployment ${new Date().toISOString()}`,
        manifestFileName: 'appsscript'
      }
    });

    deploymentId = deployResponse.data.deploymentId;
    console.log(`✅ Created deployment: ${deploymentId}`);

  } catch (err) {
    console.error('❌ Error creating deployment:', err.message);
    if (err.response && err.response.data) {
      console.error('Details:', JSON.stringify(err.response.data, null, 2));
    }

    // Check if we can use an existing deployment
    console.log('');
    console.log('🔍 Checking for existing deployments...');

    try {
      const deploymentsResponse = await script.projects.deployments.list({
        scriptId: scriptId
      });

      if (deploymentsResponse.data.deployments && deploymentsResponse.data.deployments.length > 0) {
        const latestDeployment = deploymentsResponse.data.deployments[0];
        deploymentId = latestDeployment.deploymentId;
        console.log(`✅ Using existing deployment: ${deploymentId}`);
      } else {
        console.error('❌ No existing deployments found');
        process.exit(1);
      }
    } catch (listErr) {
      console.error('❌ Error listing deployments:', listErr.message);
      process.exit(1);
    }
  }

  console.log('');

  // Step 8: Get deployment URL
  console.log('🔗 Step 8: Getting webhook URL...');

  const webhookUrl = `https://script.google.com/macros/s/${scriptId}/exec`;

  console.log('✅ Webhook URL generated');
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Webhook URL:');
  console.log(webhookUrl);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  // Step 9: Save webhook URL
  console.log('💾 Step 9: Saving webhook URL...');

  try {
    fs.writeFileSync(WEBHOOK_URL_FILE, webhookUrl, { mode: 0o600 });
    console.log(`✅ Saved to: ${WEBHOOK_URL_FILE}`);
  } catch (err) {
    console.error('❌ Error saving webhook URL:', err.message);
  }

  console.log('');
  console.log('✅ Deployment complete!');
  console.log('');
  console.log('Next steps:');
  console.log('1. Test webhook: curl ' + webhookUrl);
  console.log('2. Run autonomous deployment: ./deploy-team-member.sh Alvaro');
  console.log('');

  return webhookUrl;
}

// Run deployment
deployWebhook().catch(err => {
  console.error('❌ Fatal error:', err.message);
  if (err.stack) {
    console.error(err.stack);
  }
  process.exit(1);
});

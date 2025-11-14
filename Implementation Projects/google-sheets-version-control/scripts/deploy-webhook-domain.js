#!/usr/bin/env node
/**
 * Deploy webhook with domain-restricted access
 * Works with Google Workspace domain security policies
 */

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const SPREADSHEET_ID = '1KpUhrEtW7-uHHS6GIngiXws0v2aM2wBC5ppyDBnRKxc';
const CREDENTIALS_PATH = path.join(__dirname, '../../../google-workspace-oauth-setup/credentials.json');
const TOKEN_PATH = path.join(__dirname, '../../../google-workspace-oauth-setup/token.json');
const WEBHOOK_CODE_PATH = path.join(__dirname, 'workstation-backup-webhook.js');
const WEBHOOK_URL_FILE = path.join(__dirname, '.webhook-url');
const SCRIPT_ID_FILE = path.join(__dirname, '.webhook-script-id');

console.log('🚀 Deploying Webhook with Domain Access');
console.log('=========================================');
console.log('');

async function deployWithDomainAccess() {
  // Load existing script ID if available
  let scriptId = null;
  if (fs.existsSync(SCRIPT_ID_FILE)) {
    scriptId = fs.readFileSync(SCRIPT_ID_FILE, 'utf-8').trim();
    console.log(`📋 Using existing script: ${scriptId}`);
  } else {
    scriptId = '1EbeTzSxxpvwry21k1t_olMRvz1xuSQTZUHRf7cPzu87uEqmLDTJPdhnC';
    fs.writeFileSync(SCRIPT_ID_FILE, scriptId);
    console.log(`📋 Script ID: ${scriptId}`);
  }

  // Load credentials
  const content = fs.readFileSync(TOKEN_PATH, 'utf-8');
  const token = JSON.parse(content);
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
  const { client_id, client_secret, redirect_uris } = credentials.installed;

  const oauth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  oauth2Client.setCredentials(token);

  const script = google.script({ version: 'v1', auth: oauth2Client });

  console.log('');
  console.log('📝 Updating manifest for domain access...');

  // Read webhook code
  const webhookCode = fs.readFileSync(WEBHOOK_CODE_PATH, 'utf-8');

  // Update content with domain access settings
  await script.projects.updateContent({
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
              access: 'ANYONE_ANONYMOUS',  // Changed from ANYONE
              executeAs: 'USER_DEPLOYING'
            }
          }, null, 2)
        }
      ]
    }
  });

  console.log('✅ Manifest updated');
  console.log('');

  // Create new version
  console.log('📦 Creating new version...');
  const versionResponse = await script.projects.versions.create({
    scriptId: scriptId,
    requestBody: {
      description: `Domain-accessible deployment ${new Date().toISOString()}`
    }
  });

  const versionNumber = versionResponse.data.versionNumber;
  console.log(`✅ Version ${versionNumber} created`);
  console.log('');

  // Try to create deployment with ANYONE_ANONYMOUS access
  console.log('🌐 Creating deployment...');

  try {
    const deployResponse = await script.projects.deployments.create({
      scriptId: scriptId,
      requestBody: {
        versionNumber: versionNumber,
        description: `Domain deployment ${new Date().toISOString()}`,
        manifestFileName: 'appsscript'
      }
    });

    console.log('✅ Deployment created!');
    console.log('');
  } catch (err) {
    console.log('⚠️  Automated deployment not allowed by domain policy');
    console.log('');
    console.log('🔧 Manual Step Required:');
    console.log('');
    console.log('1. Open: https://script.google.com/d/' + scriptId + '/edit');
    console.log('2. Click "Deploy" → "New deployment"');
    console.log('3. Click gear icon, select "Web app"');
    console.log('4. Configuration:');
    console.log('   - Execute as: Me');
    console.log('   - Who has access: Anyone (or Anyone with link if ANYONE is blocked)');
    console.log('5. Click "Deploy"');
    console.log('6. Copy the web app URL');
    console.log('');
    console.log('Then run:');
    console.log('  echo "YOUR_WEBHOOK_URL" > scripts/.webhook-url');
    console.log('');
    return null;
  }

  // Generate webhook URL
  const webhookUrl = `https://script.google.com/macros/s/${scriptId}/exec`;

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Webhook URL:');
  console.log(webhookUrl);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  // Save URL
  fs.writeFileSync(WEBHOOK_URL_FILE, webhookUrl);
  console.log('✅ Saved webhook URL');
  console.log('');

  // Test webhook
  console.log('🧪 Testing webhook...');
  const https = require('https');

  return new Promise((resolve) => {
    https.get(webhookUrl, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (data.includes('Workstation Backup Monitoring Webhook') || data.includes('status')) {
          console.log('✅ Webhook responding!');
          resolve(webhookUrl);
        } else {
          console.log('⚠️  Webhook may need manual activation');
          console.log('Response:', data.substring(0, 200));
          resolve(webhookUrl);
        }
      });
    }).on('error', (err) => {
      console.log('⚠️  Could not test webhook:', err.message);
      resolve(webhookUrl);
    });
  });
}

deployWithDomainAccess().then((url) => {
  console.log('');
  if (url) {
    console.log('✅ Deployment complete!');
    console.log('');
    console.log('Next: ./deploy-team-member.sh Alvaro');
  } else {
    console.log('⚠️  Manual deployment step required (see instructions above)');
  }
}).catch(err => {
  console.error('❌ Error:', err.message);
  if (err.response && err.response.data) {
    console.error('Details:', JSON.stringify(err.response.data, null, 2));
  }
  process.exit(1);
});

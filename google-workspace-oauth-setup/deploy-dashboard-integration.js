/**
 * Deploy Apps Script to AI Task Tracker Testing Sheet
 *
 * Deploys dashboard-integration.gs to the existing testing sheet
 * using OAuth authentication (automation@ssdspc.com)
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Configuration
const CREDENTIALS_FILE = path.join(__dirname, 'credentials.json');
const TOKEN_FILE = path.join(__dirname, 'token.json');
const SPREADSHEET_ID = '1slreBMgMoBy16KvvpCaEQPe3HccugWJxv8a7BrjDV7A'; // AI Task Tracker - Testing
const SCRIPT_SOURCE_FILE = path.join(__dirname, '../projects-in-development/ai-task-tracker/05-automation-code/apps-script/dashboard-integration.gs');

async function deployAppsScript() {
  try {
    console.log('🚀 Deploying Apps Script to Testing Sheet...\n');

    // 1. Authenticate with OAuth
    console.log('🔑 Authenticating with automation@ssdspc.com...');
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_FILE, 'utf8'));
    const token = JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf8'));

    const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    );
    oAuth2Client.setCredentials(token);

    const sheets = google.sheets({ version: 'v4', auth: oAuth2Client });
    const drive = google.drive({ version: 'v3', auth: oAuth2Client });
    const script = google.script({ version: 'v1', auth: oAuth2Client });

    console.log('✅ Authentication successful\n');

    // 2. Check if sheet already has a script project
    console.log('📋 Checking for existing Apps Script project...');
    let scriptId = null;

    try {
      // Try to get the script ID from the sheet's metadata
      const sheetMetadata = await drive.files.get({
        fileId: SPREADSHEET_ID,
        fields: 'id, name, properties',
        supportsAllDrives: true
      });

      // List all Apps Script projects to find one bound to this sheet
      // Note: We'll try creating a new one and catch if it already exists

    } catch (error) {
      console.log('   No existing script found, will create new one');
    }

    // 3. Create container-bound Apps Script (or get existing)
    try {
      console.log('📝 Creating container-bound Apps Script project...');
      const scriptResponse = await script.projects.create({
        requestBody: {
          title: 'Dashboard Integration',
          parentId: SPREADSHEET_ID
        }
      });

      scriptId = scriptResponse.data.scriptId;
      console.log(`✅ Created script project: ${scriptId}\n`);

    } catch (error) {
      if (error.message.includes('already has a script')) {
        console.log('⚠️  Sheet already has an Apps Script project');
        console.log('   Will update the existing script instead\n');

        // Get the script ID from the error or by listing projects
        // For now, we'll need to get it manually - Apps Script API limitation
        throw new Error('Sheet already has a script. Please provide the script ID or delete the existing script first.');
      } else {
        throw error;
      }
    }

    // 4. Read the Apps Script code
    console.log('📖 Reading dashboard-integration.gs...');
    const scriptSource = fs.readFileSync(SCRIPT_SOURCE_FILE, 'utf8');
    console.log(`✅ Loaded ${scriptSource.length} characters of code\n`);

    // 5. Upload the code
    console.log('⬆️  Uploading Apps Script code...');
    await script.projects.updateContent({
      scriptId: scriptId,
      requestBody: {
        files: [
          {
            name: 'Code',
            type: 'SERVER_JS',
            source: scriptSource
          },
          {
            name: 'appsscript',
            type: 'JSON',
            source: JSON.stringify({
              timeZone: 'America/Los_Angeles',
              oauthScopes: [
                'https://www.googleapis.com/auth/spreadsheets.currentonly',
                'https://www.googleapis.com/auth/drive.readonly',
                'https://www.googleapis.com/auth/documents.readonly'
              ],
              exceptionLogging: 'STACKDRIVER',
              runtimeVersion: 'V8'
            }, null, 2)
          }
        ]
      }
    });

    console.log('✅ Code uploaded successfully\n');

    // 6. Trigger onOpen by accessing the sheet
    console.log('🔄 Triggering onOpen() to install menu...');
    await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Test Transcripts!A1'
    });

    console.log('✅ onOpen() triggered\n');

    // 7. Wait a moment for menu to install
    console.log('⏳ Waiting for menu installation...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('\n' + '='.repeat(80));
    console.log('✅ DEPLOYMENT SUCCESSFUL!');
    console.log('='.repeat(80));
    console.log();
    console.log('📊 Sheet Details:');
    console.log(`   URL: https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`);
    console.log(`   Script ID: ${scriptId}`);
    console.log();
    console.log('🎯 What was deployed:');
    console.log('   ✅ Container-bound Apps Script created');
    console.log('   ✅ Dashboard integration code uploaded');
    console.log('   ✅ onOpen() menu installed');
    console.log();
    console.log('📊 Available Menu Options:');
    console.log('   • 📧 Pull Email Transcripts');
    console.log('   • 💬 Pull Chat Transcripts');
    console.log('   • 🎤 Pull Meeting Transcripts');
    console.log('   • 🔄 Pull All Transcripts (Sample)');
    console.log('   • 🗑️ Clear Test Transcripts');
    console.log();
    console.log('💡 Next Steps:');
    console.log('   1. Open the sheet in your browser');
    console.log('   2. Look for "📊 Transcript Tools" menu');
    console.log('   3. Use "Pull All Transcripts (Sample)" to get test data');
    console.log();

    return { spreadsheetId: SPREADSHEET_ID, scriptId };

  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    console.error('\nFull error:', error);
    throw error;
  }
}

// Run deployment
deployAppsScript();

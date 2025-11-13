require('dotenv').config();
const { google } = require('googleapis');
const fs = require('fs');

async function debugAppsScriptAPI() {
  console.log('🔍 Debugging Apps Script API Access\n');
  console.log('═'.repeat(70) + '\n');

  try {
    // Load credentials
    const credentials = JSON.parse(fs.readFileSync('credentials.json'));
    const token = JSON.parse(fs.readFileSync('token.json'));

    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    );

    oAuth2Client.setCredentials(token);

    console.log('✅ OAuth credentials loaded');
    console.log(`Token scopes: ${token.scope}`);
    console.log('');

    // Check if Apps Script scopes are present
    const hasScriptScopes = token.scope.includes('script.projects');
    console.log(`Apps Script scopes present: ${hasScriptScopes ? '✅ Yes' : '❌ No'}`);
    console.log('');

    // Try to create the script API client
    console.log('Attempting to create Apps Script API client...');
    const script = google.script({ version: 'v1', auth: oAuth2Client });
    console.log('✅ Apps Script API client created');
    console.log('');

    // Try to create a test project
    console.log('Attempting to create a test Apps Script project...');
    try {
      const response = await script.projects.create({
        requestBody: {
          title: `API-Debug-Test-${Date.now()}`,
        },
      });

      console.log('✅ SUCCESS! Apps Script API is working!');
      console.log(`Created project: ${response.data.scriptId}`);
      console.log('');

      // Clean up - delete the test project
      const drive = google.drive({ version: 'v3', auth: oAuth2Client });
      await drive.files.delete({
        fileId: response.data.scriptId,
        supportsAllDrives: true,
      });
      console.log('✅ Test project deleted');

    } catch (error) {
      console.log('❌ FAILED to create project');
      console.log('');
      console.log('Error details:');
      console.log(`   Status: ${error.code || 'N/A'}`);
      console.log(`   Message: ${error.message}`);
      console.log('');

      if (error.errors && error.errors.length > 0) {
        console.log('Detailed errors:');
        error.errors.forEach((err, i) => {
          console.log(`   ${i + 1}. ${err.message}`);
          console.log(`      Reason: ${err.reason}`);
        });
        console.log('');
      }

      // Check if it's a quota or permission issue
      if (error.message.includes('quota')) {
        console.log('⚠️  This appears to be a quota issue');
      } else if (error.message.includes('permission') || error.message.includes('403')) {
        console.log('⚠️  This appears to be a permission issue');
        console.log('');
        console.log('Possible causes:');
        console.log('   1. Apps Script API not enabled in Google Cloud Console');
        console.log('   2. Need to enable at: https://console.cloud.google.com/apis/library/script.googleapis.com');
        console.log('');
      } else if (error.message.includes('disabled')) {
        console.log('⚠️  API is disabled');
        console.log('');
        console.log('Steps to enable:');
        console.log('   1. Visit: https://console.cloud.google.com/apis/library/script.googleapis.com');
        console.log('   2. Click "Enable"');
        console.log('   3. Wait 2-3 minutes');
        console.log('   4. Re-run this test');
      }
    }

  } catch (error) {
    console.log(`\n❌ Fatal Error: ${error.message}`);
    console.log(error.stack);
  }
}

debugAppsScriptAPI();

#!/usr/bin/env node

/**
 * Test Apps Script API access with service account
 * Verifies:
 * 1. Apps Script API is enabled
 * 2. Service account has proper permissions
 * 3. Can retrieve script content
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

async function testAppsScriptAPI() {
  console.log('🔍 Testing Apps Script API access with service account...\n');

  // Load service account credentials
  const keyPath = path.join(process.env.HOME, 'service-account-keys/google-sheets-vc.json');

  if (!fs.existsSync(keyPath)) {
    console.error('❌ Service account key not found at:', keyPath);
    process.exit(1);
  }

  const credentials = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
  console.log('✅ Service account credentials loaded');
  console.log('   Email:', credentials.client_email);
  console.log('   Project:', credentials.project_id, '\n');

  // Create auth client with required scopes
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: [
      'https://www.googleapis.com/auth/script.projects.readonly',
      'https://www.googleapis.com/auth/drive.readonly'
    ],
  });

  const authClient = await auth.getClient();
  const script = google.script({ version: 'v1', auth: authClient });

  console.log('✅ Apps Script API client created\n');

  // Load sheet registry to get a test script ID
  const registryPath = path.join(__dirname, '../config/sheet-registry.json');
  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

  // Find first sheet with a script ID
  const testSheet = registry.sheets.find(s => s.production && s.production.scriptId);

  if (!testSheet) {
    console.error('❌ No sheets with script IDs found in registry');
    process.exit(1);
  }

  console.log('📋 Testing with sheet:', testSheet.name);
  console.log('   Script ID:', testSheet.production.scriptId, '\n');

  try {
    // Attempt to get script content
    const response = await script.projects.getContent({
      scriptId: testSheet.production.scriptId
    });

    console.log('✅ Successfully retrieved script content!');
    console.log('   Files found:', response.data.files?.length || 0);

    if (response.data.files && response.data.files.length > 0) {
      console.log('   File names:');
      response.data.files.forEach(file => {
        console.log(`     - ${file.name} (${file.type})`);
      });
    }

    console.log('\n✅ Apps Script API is enabled and working!');
    console.log('✅ Service account has proper access!\n');

    return true;

  } catch (error) {
    console.error('❌ Error accessing Apps Script API:', error.message);

    if (error.code === 403) {
      console.error('\n⚠️  Permission denied. Possible causes:');
      console.error('   1. Apps Script API not enabled in GCP project');
      console.error('   2. Service account lacks access to this script');
      console.error('   3. Script sharing settings need to be updated\n');
    } else if (error.code === 404) {
      console.error('\n⚠️  Script not found. The script ID may be incorrect.\n');
    } else {
      console.error('\nFull error:', error);
    }

    process.exit(1);
  }
}

// Run the test
testAppsScriptAPI().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

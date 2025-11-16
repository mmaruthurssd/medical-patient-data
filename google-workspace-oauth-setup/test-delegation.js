#!/usr/bin/env node

/**
 * Test Domain-Wide Delegation
 *
 * Tests if the service account can successfully access Google Sheets
 * using domain-wide delegation to impersonate a user.
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Load service account credentials
const SERVICE_ACCOUNT_PATH = path.join(
  __dirname,
  '../configuration/service-accounts/service-account.json'
);

if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  console.error('❌ Service account file not found:', SERVICE_ACCOUNT_PATH);
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));

// User email to impersonate (should be a real user in your domain)
const USER_EMAIL = 'mm@ssdspc.com'; // Update this if needed

console.log('🔍 Testing Domain-Wide Delegation...\n');
console.log('Service Account:', serviceAccount.client_email);
console.log('Impersonating:', USER_EMAIL);
console.log('Scopes: spreadsheets.readonly, drive.readonly\n');

async function testDelegation() {
  try {
    // Create JWT client with domain-wide delegation
    const auth = new google.auth.JWT({
      email: serviceAccount.client_email,
      key: serviceAccount.private_key,
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/script.projects'
      ],
      subject: USER_EMAIL // Impersonate this user
    });

    // Try to get an access token
    console.log('⏳ Requesting access token...');
    await auth.authorize();
    console.log('✅ Access token obtained successfully!\n');

    // Try to list some files from Drive (just to verify it works)
    const drive = google.drive({ version: 'v3', auth });
    console.log('⏳ Testing Drive API access...');

    const response = await drive.files.list({
      pageSize: 5,
      fields: 'files(id, name, mimeType)',
      q: "mimeType='application/vnd.google-apps.spreadsheet'"
    });

    console.log('✅ Drive API access successful!\n');
    console.log('📋 Sample sheets found:');

    if (response.data.files.length === 0) {
      console.log('   (No sheets found - this is OK, delegation is working!)');
    } else {
      response.data.files.forEach((file, index) => {
        console.log(`   ${index + 1}. ${file.name} (${file.id})`);
      });
    }

    console.log('\n✅ DELEGATION TEST PASSED!');
    console.log('✅ Your service account can successfully access Google Workspace data.');
    console.log('\nNext steps:');
    console.log('  1. The OAuth setup is working correctly');
    console.log('  2. You can now use this service account for automation');
    console.log('  3. Mark the OAuth issue as resolved\n');

    return true;

  } catch (error) {
    console.error('\n❌ DELEGATION TEST FAILED!\n');

    if (error.message.includes('unauthorized_client')) {
      console.error('Error: Domain-wide delegation not properly configured\n');
      console.error('Possible causes:');
      console.error('  1. Client ID not added to domain-wide delegation');
      console.error('  2. Required scopes not granted');
      console.error('  3. Changes still propagating (wait 15-30 minutes)\n');
      console.error('To fix:');
      console.error('  1. Go to: https://admin.google.com/ac/owl/domainwidedelegation');
      console.error('  2. Verify Client ID:', serviceAccount.client_id);
      console.error('  3. Verify scopes include:');
      console.error('     - https://www.googleapis.com/auth/spreadsheets');
      console.error('     - https://www.googleapis.com/auth/drive');
    } else if (error.message.includes('invalid_grant')) {
      console.error('Error: Invalid user email or service account\n');
      console.error('Check:');
      console.error('  1. User email exists:', USER_EMAIL);
      console.error('  2. User is in the same domain as service account');
      console.error('  3. Service account has domain-wide delegation enabled');
    } else {
      console.error('Error:', error.message);
      console.error('\nFull error:', error);
    }

    return false;
  }
}

// Run the test
testDelegation()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });

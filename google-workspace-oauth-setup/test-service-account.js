const { google } = require('googleapis');
const fs = require('fs');

async function testServiceAccountAccess() {
  console.log('\n========================================');
  console.log('Testing Service Account Access');
  console.log('========================================\n');

  try {
    // Load service account credentials
    console.log('Loading service account credentials...');
    const serviceAccount = JSON.parse(
      fs.readFileSync('/Users/mmaruthurnew/Desktop/medical-patient-data/google-workspace-oauth-setup/service-account.json')
    );
    console.log(`✓ Service account: ${serviceAccount.client_email}\n`);

    // Create auth client
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccount,
      scopes: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/spreadsheets'
      ]
    });

    const drive = google.drive({ version: 'v3', auth });

    // List all Shared Drives
    console.log('Listing Shared Drives...');
    const drivesResponse = await drive.drives.list({
      pageSize: 100,
      fields: 'drives(id, name)'
    });

    const drives = drivesResponse.data.drives || [];
    console.log(`✓ Found ${drives.length} Shared Drives:\n`);

    drives.forEach((drive, index) => {
      console.log(`  ${index + 1}. ${drive.name}`);
      console.log(`     ID: ${drive.id}\n`);
    });

    // Try to access "AI Development - No PHI" drive
    console.log('Testing access to "AI Development - No PHI"...');
    const targetDrive = drives.find(d => d.name === 'AI Development - No PHI');

    if (!targetDrive) {
      console.log('❌ "AI Development - No PHI" drive not found');
      return false;
    }

    console.log(`✓ Found drive ID: ${targetDrive.id}\n`);

    // Try to list files in the drive
    console.log('Testing file listing in drive...');
    const filesResponse = await drive.files.list({
      q: `'${targetDrive.id}' in parents and trashed=false`,
      pageSize: 10,
      fields: 'files(id, name, mimeType)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      corpora: 'drive',
      driveId: targetDrive.id
    });

    const files = filesResponse.data.files || [];
    console.log(`✓ Can read files (found ${files.length} items)\n`);

    if (files.length > 0) {
      console.log('Sample files:');
      files.slice(0, 5).forEach(file => {
        console.log(`  - ${file.name} (${file.mimeType})`);
      });
      console.log('');
    }

    // Try to create a test file
    console.log('Testing write access...');
    const testFile = await drive.files.create({
      requestBody: {
        name: 'SERVICE_ACCOUNT_TEST.txt',
        mimeType: 'text/plain',
        parents: [targetDrive.id]
      },
      media: {
        mimeType: 'text/plain',
        body: 'This is a test file created by the service account to verify write access.'
      },
      fields: 'id, name',
      supportsAllDrives: true
    });

    console.log(`✓ Created test file: ${testFile.data.name} (${testFile.data.id})\n`);

    // Delete the test file
    console.log('Cleaning up test file...');
    await drive.files.delete({
      fileId: testFile.data.id,
      supportsAllDrives: true
    });
    console.log('✓ Test file deleted\n');

    console.log('========================================');
    console.log('✓ Service Account Access: VERIFIED');
    console.log('========================================\n');
    console.log('Service account has full access to Shared Drives');
    console.log('- Can list drives');
    console.log('- Can read files');
    console.log('- Can create files');
    console.log('- Can delete files\n');

    return true;

  } catch (error) {
    console.error('\n❌ Error testing service account access:');
    console.error(error.message);

    if (error.code === 403) {
      console.error('\n⚠️  Permission denied. Service account may not have access to Shared Drives.');
      console.error('Grant access: Share drive with ssd-automation-service-account@workspace-automation-ssdspc.iam.gserviceaccount.com');
    }

    return false;
  }
}

testServiceAccountAccess()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });

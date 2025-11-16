/**
 * Create "AI Task Tracker" folder in AI Development - No PHI shared drive
 *
 * Uses: Service Account (ssd-automation-service-account@workspace-automation-ssdspc.iam.gserviceaccount.com)
 * Shared Drive: AI Development - No PHI (ID: 0AFSsMrTVhqWuUk9PVA)
 */

const { google } = require('googleapis');
const path = require('path');

const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'service-account.json');
const SHARED_DRIVE_ID = '0AFSsMrTVhqWuUk9PVA';
const FOLDER_NAME = 'AI Task Tracker';

async function createFolder() {
  try {
    console.log('🔐 Authenticating with service account...');

    // Authenticate with service account
    const auth = new google.auth.GoogleAuth({
      keyFile: SERVICE_ACCOUNT_FILE,
      scopes: ['https://www.googleapis.com/auth/drive'],
    });

    const authClient = await auth.getClient();
    const drive = google.drive({ version: 'v3', auth: authClient });

    console.log('✅ Authentication successful\n');

    // Check if folder already exists
    console.log('🔍 Checking if folder already exists...');
    const searchResponse = await drive.files.list({
      q: `name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      driveId: SHARED_DRIVE_ID,
      corpora: 'drive',
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
      fields: 'files(id, name, webViewLink)',
    });

    if (searchResponse.data.files && searchResponse.data.files.length > 0) {
      const existingFolder = searchResponse.data.files[0];
      console.log('⚠️  Folder already exists!\n');
      console.log('📁 Folder Details:');
      console.log(`   Name: ${existingFolder.name}`);
      console.log(`   ID: ${existingFolder.id}`);
      console.log(`   URL: ${existingFolder.webViewLink}`);
      console.log();
      console.log('✅ You can use this existing folder for the AI Task Tracker project.');
      return existingFolder;
    }

    // Create folder
    console.log(`📁 Creating folder "${FOLDER_NAME}" in AI Development - No PHI drive...\n`);

    const fileMetadata = {
      name: FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [SHARED_DRIVE_ID],
    };

    const folder = await drive.files.create({
      requestBody: fileMetadata,
      supportsAllDrives: true,
      fields: 'id, name, webViewLink',
    });

    console.log('✅ Folder created successfully!\n');
    console.log('📁 Folder Details:');
    console.log(`   Name: ${folder.data.name}`);
    console.log(`   ID: ${folder.data.id}`);
    console.log(`   URL: ${folder.data.webViewLink}`);
    console.log();
    console.log('💡 Next Steps:');
    console.log('   1. Save the Folder ID for use in project configuration');
    console.log('   2. Create test sheets and materials in this folder');
    console.log('   3. Update project documentation with folder details');

    return folder.data;

  } catch (error) {
    console.error('❌ Error creating folder:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

// Run the script
createFolder()
  .then(() => {
    console.log('\n✅ Script completed successfully');
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error.message);
    process.exit(1);
  });

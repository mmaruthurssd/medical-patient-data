#!/usr/bin/env node

/**
 * Test Google Drive Service Account Access
 *
 * Verifies that the service account has access to shared drives
 * and can list/access folders.
 */

const { google } = require('googleapis');

async function testDriveAccess() {
  console.log('🔍 Testing service account access to Google Drive...\n');

  try {
    // Authenticate
    console.log('1. Authenticating with service account...');

    if (!process.env.GCP_SERVICE_ACCOUNT) {
      console.error('❌ GCP_SERVICE_ACCOUNT environment variable not found');
      console.error('   Set it with: export GCP_SERVICE_ACCOUNT=\'$(cat path/to/service-account.json)\'');
      process.exit(1);
    }

    let credentials;
    try {
      credentials = JSON.parse(process.env.GCP_SERVICE_ACCOUNT);
    } catch (error) {
      console.error('❌ Failed to parse GCP_SERVICE_ACCOUNT:', error.message);
      process.exit(1);
    }

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive']
    });

    const drive = google.drive({ version: 'v3', auth });
    console.log('   ✅ Authenticated\n');

    // List shared drives
    console.log('2. Listing accessible shared drives...');
    const drivesResponse = await drive.drives.list({
      pageSize: 100,
      fields: 'drives(id, name)'
    });

    if (!drivesResponse.data.drives || drivesResponse.data.drives.length === 0) {
      console.log('   ⚠️  No shared drives accessible to service account');
      console.log('   This might mean:');
      console.log('   - Service account not added to any shared drives');
      console.log('   - Or only has access to "My Drive" folders\n');
    } else {
      console.log(`   ✅ Found ${drivesResponse.data.drives.length} accessible shared drive(s):\n`);
      for (const drive of drivesResponse.data.drives) {
        console.log(`   📁 ${drive.name}`);
        console.log(`      Drive ID: ${drive.id}\n`);
      }
    }

    // List ALL folders in "AI Development - No PHI" shared drive
    console.log('3. Listing all folders in "AI Development - No PHI" shared drive...');
    const aiDevDriveId = '0AFSsMrTVhqWuUk9PVA'; // From previous test results

    try {
      const allFoldersResponse = await drive.files.list({
        q: `'${aiDevDriveId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id, name, capabilities)',
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
        corpora: 'drive',
        driveId: aiDevDriveId
      });

      if (allFoldersResponse.data.files && allFoldersResponse.data.files.length > 0) {
        console.log(`   ✅ Found ${allFoldersResponse.data.files.length} folders in "AI Development - No PHI":\n`);
        for (const folder of allFoldersResponse.data.files) {
          const canEdit = folder.capabilities?.canEdit || false;
          const canAddChildren = folder.capabilities?.canAddChildren || false;
          console.log(`   📁 ${folder.name}`);
          console.log(`      ID: ${folder.id}`);
          console.log(`      Edit: ${canEdit}, Add Children: ${canAddChildren}`);
          console.log();
        }
      } else {
        console.log('   ⚠️  No folders found in "AI Development - No PHI" shared drive\n');
      }
    } catch (error) {
      console.log(`   ❌ Error listing folders: ${error.message}\n`);
    }

    // Check for specific folders (broader search)
    console.log('4. Searching for "workspace-management" folder (all drives)...');
    const folderQuery = "name='workspace-management' and mimeType='application/vnd.google-apps.folder' and trashed=false";
    const foldersResponse = await drive.files.list({
      q: folderQuery,
      fields: 'files(id, name, parents, driveId, capabilities)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true
    });

    if (foldersResponse.data.files && foldersResponse.data.files.length > 0) {
      console.log(`   ✅ Found ${foldersResponse.data.files.length} "workspace-management" folder(s):\n`);
      for (const folder of foldersResponse.data.files) {
        console.log(`   📁 ${folder.name}`);
        console.log(`      Folder ID: ${folder.id}`);
        console.log(`      Drive ID: ${folder.driveId || 'Not in shared drive (My Drive)'}`);

        if (folder.capabilities) {
          console.log(`      Can Edit: ${folder.capabilities.canEdit || false}`);
          console.log(`      Can Add Children: ${folder.capabilities.canAddChildren || false}`);
        }
        console.log();
      }
    } else {
      console.log('   ⚠️  "workspace-management" folder not found in any accessible location\n');
      console.log('   💡 This folder likely needs to be CREATED in "AI Development - No PHI" drive\n');
    }

    // Check for Daily Snapshot Log sheet
    console.log('5. Checking access to Daily Snapshot Log sheet...');
    const sheetId = '1KpUhrEtW7-uHHS6GIngiXws0v2aM2wBC5ppyDBnRKxc';

    try {
      const sheetResponse = await drive.files.get({
        fileId: sheetId,
        fields: 'id, name, capabilities',
        supportsAllDrives: true
      });

      console.log(`   ✅ Daily Snapshot Log accessible:`);
      console.log(`      Name: ${sheetResponse.data.name}`);
      console.log(`      ID: ${sheetResponse.data.id}`);

      if (sheetResponse.data.capabilities) {
        console.log(`      Can Edit: ${sheetResponse.data.capabilities.canEdit || false}`);
      }
      console.log();
    } catch (error) {
      console.log(`   ❌ Cannot access Daily Snapshot Log: ${error.message}\n`);
    }

    // Summary
    console.log('6. Summary:\n');
    const hasSharedDrives = drivesResponse.data.drives && drivesResponse.data.drives.length > 0;
    const hasWorkspaceFolder = foldersResponse.data.files && foldersResponse.data.files.length > 0;

    if (hasSharedDrives) {
      console.log(`   ✅ Service account has access to ${drivesResponse.data.drives.length} shared drive(s)`);
    } else {
      console.log('   ⚠️  Service account does not have access to any shared drives');
    }

    if (hasWorkspaceFolder) {
      console.log('   ✅ "workspace-management" folder is accessible');
    } else {
      console.log('   ⚠️  "workspace-management" folder not found');
      console.log('   💡 Since service account has Editor access to "AI Development - No PHI" shared drive,');
      console.log('      it will automatically have access to any folder created in that drive.');
      console.log('   Action needed: Create "workspace-management" folder in "AI Development - No PHI" drive');
    }

    console.log('\n✅ Access test complete!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run test
testDriveAccess();

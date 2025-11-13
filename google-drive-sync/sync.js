const fs = require('fs').promises;
const path = require('path');
const { getAuthenticatedClient } = require('./auth');
const DriveSync = require('../google-workspace-oauth-setup/drive-sync');
const config = require('./config');

async function main() {
  const command = process.argv[2]; // e.g., 'list', 'upload', 'download'
  const arg1 = process.argv[3];    // e.g., file_path for upload, file_name for download
  const arg2 = process.argv[4];    // e.g., folder_id for list

  if (!command) {
    console.log('Usage: node sync.js <command> [arguments]');
    console.log('Commands:');
    console.log('  list [folder_id]                     - List files in local and remote directories');
    console.log('  upload <local_file_path>           - Upload a local file to Google Drive');
    console.log('  download <remote_file_name>        - Download a file from Google Drive to local');
    return;
  }

  try {
    const auth = getAuthenticatedClient();
    const driveSync = new DriveSync(auth);
    console.log('✅ Authenticated successfully.');

    // Ensure local sync directory exists
    await fs.mkdir(config.localSyncDirectory, { recursive: true });

    switch (command) {
      case 'list':
        await listFiles(driveSync, arg1);
        break;
      case 'upload':
        if (!arg1) {
          console.error('Error: Missing local file path for upload command.');
          return;
        }
        await uploadFile(driveSync, arg1);
        break;
      case 'download':
        if (!arg1) {
          console.error('Error: Missing remote file name for download command.');
          return;
        }
        await downloadFile(driveSync, arg1);
        break;
      default:
        console.error(`Error: Unknown command '${command}'`);
        break;
    }

  } catch (error) {
    console.error('❌ An error occurred:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
  }
}

async function listFiles(driveSync, folderId) {
  console.log('\n--- Listing Files ---');

  // Local Files
  console.log(`\nLocal Directory: ${config.localSyncDirectory}`);
  try {
    const localFileNames = await fs.readdir(config.localSyncDirectory);
    if (localFileNames.length === 0) {
      console.log('  (empty)');
    } else {
      localFileNames.forEach(name => console.log(`  - ${name}`));
    }
  } catch (error) {
    console.error(`  ❌ Error listing local files: ${error.message}`);
  }


  // Remote Files
  const remoteFolderId = folderId || config.googleDriveFolderId;
  console.log(`\nGoogle Drive Folder ID: ${remoteFolderId}`);
  if (remoteFolderId === 'YOUR_GOOGLE_DRIVE_FOLDER_ID_HERE') {
    console.warn('  ⚠️  Google Drive folder ID is not configured. Cannot list remote files.');
    return;
  }
  try {
    const { files } = await driveSync.listFiles(remoteFolderId);
    if (files.length === 0) {
      console.log('  (empty)');
    } else {
      files.forEach(file => console.log(`  - ${file.name} (ID: ${file.id})`));
    }
  } catch (error) {
    console.error(`  ❌ Error listing remote files: ${error.message}`);
  }
  console.log('\n--- List Complete ---');
}

async function uploadFile(driveSync, localFilePath) {
  console.log(`\n--- Uploading File: ${localFilePath} ---`);
  const fullLocalPath = path.resolve(config.localSyncDirectory, localFilePath); // Resolve relative to sync dir

  try {
    await fs.access(fullLocalPath); // Check if file exists
  } catch (error) {
    console.error(`  ❌ Error: Local file not found at ${fullLocalPath}`);
    return;
  }

  if (config.googleDriveFolderId === 'YOUR_GOOGLE_DRIVE_FOLDER_ID_HERE') {
    console.warn('  ⚠️  Google Drive folder ID is not configured. Cannot upload file.');
    return;
  }

  try {
    const uploadResult = await driveSync.uploadFile(
      fullLocalPath,
      config.googleDriveFolderId,
      { fileName: path.basename(fullLocalPath) } // Use original file name
    );
    console.log(`  ✅ Uploaded '${uploadResult.fileName}' to Google Drive.`);
    console.log(`     File ID: ${uploadResult.fileId}`);
    console.log(`     View Link: ${uploadResult.webViewLink}`);
  } catch (error) {
    console.error(`  ❌ Error uploading file: ${error.message}`);
  }
  console.log('\n--- Upload Complete ---');
}

async function downloadFile(driveSync, remoteFileName) {
  console.log(`\n--- Downloading File: ${remoteFileName} ---`);

  if (config.googleDriveFolderId === 'YOUR_GOOGLE_DRIVE_FOLDER_ID_HERE') {
    console.warn('  ⚠️  Google Drive folder ID is not configured. Cannot download file.');
    return;
  }

  try {
    const { files } = await driveSync.listFiles(config.googleDriveFolderId);
    const targetFile = files.find(f => f.name === remoteFileName);

    if (!targetFile) {
      console.error(`  ❌ Error: File '${remoteFileName}' not found in Google Drive folder.`);
      return;
    }

    const localDownloadPath = path.join(config.localSyncDirectory, remoteFileName);
    await driveSync.downloadFile(targetFile.id, localDownloadPath);
    console.log(`  ✅ Downloaded '${remoteFileName}' to ${localDownloadPath}`);
  } catch (error) {
    console.error(`  ❌ Error downloading file: ${error.message}`);
  }
  console.log('\n--- Download Complete ---');
}


if (require.main === module) {
  main();
}
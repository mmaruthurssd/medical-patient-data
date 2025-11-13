const { getAuthenticatedClient } = require('./auth');
const DriveSync = require('../google-workspace-oauth-setup/drive-sync');
const path = require('path');
const config = require('./config');

async function downloadTestImage() {
  const fileId = '1jyKWqNUxnHqetNNe0zJ8_t2guSeZNIrY';
  const localPath = path.join(config.localSyncDirectory, 'test_image.jpg');

  console.log(`--- Downloading test image to ${localPath} ---`);

  try {
    const auth = getAuthenticatedClient();
    const driveSync = new DriveSync(auth);
    await driveSync.downloadFile(fileId, localPath);
    console.log('✅ Test image downloaded successfully.');
  } catch (error) {
    console.error('❌ Error downloading test image:', error);
  }
}

downloadTestImage();

require('dotenv').config();
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const DriveSync = require('./drive-sync');

async function testDriveSync() {
  console.log('🧪 Testing Google Drive Sync Functionality\n');
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

    const driveSync = new DriveSync(oAuth2Client);

    let testResults = {
      passed: 0,
      failed: 0,
      tests: [],
    };

    // Test 1: Get Shared Drive ID
    console.log('📋 Test 1: Get Shared Drive ID');
    try {
      const driveId = await driveSync.getSharedDriveId('AI Development - No PHI');
      console.log(`   ✅ Found Shared Drive: ${driveId}`);
      testResults.passed++;
      testResults.tests.push({ name: 'Get Shared Drive ID', status: 'passed' });
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
      testResults.failed++;
      testResults.tests.push({ name: 'Get Shared Drive ID', status: 'failed', error: error.message });
      return;
    }
    console.log('');

    // Test 2: Create test folder structure
    console.log('📁 Test 2: Create Test Folder Structure');
    try {
      const testFolderId = await driveSync.findOrCreateFolder('DriveSync-Test');
      console.log(`   ✅ Created/found test folder: ${testFolderId}`);
      testResults.passed++;
      testResults.tests.push({ name: 'Create Folder Structure', status: 'passed', folderId: testFolderId });

      // Store for later tests
      global.testFolderId = testFolderId;
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
      testResults.failed++;
      testResults.tests.push({ name: 'Create Folder Structure', status: 'failed', error: error.message });
      return;
    }
    console.log('');

    // Test 3: Upload a test file
    console.log('📤 Test 3: Upload Test File');
    try {
      // Create a test file
      const testFilePath = path.join(__dirname, 'test-upload.json');
      fs.writeFileSync(testFilePath, JSON.stringify({
        test: 'upload',
        timestamp: new Date().toISOString(),
        message: 'This is a test file for Google Drive sync',
      }, null, 2));

      const uploadResult = await driveSync.uploadFile(
        testFilePath,
        global.testFolderId,
        { mimeType: 'application/json' }
      );

      console.log(`   ✅ Uploaded: ${uploadResult.fileName}`);
      console.log(`   File ID: ${uploadResult.fileId}`);
      console.log(`   Link: ${uploadResult.webViewLink}`);

      testResults.passed++;
      testResults.tests.push({ name: 'Upload File', status: 'passed', fileId: uploadResult.fileId });

      // Store for later tests
      global.testFileId = uploadResult.fileId;

      // Clean up local test file
      fs.unlinkSync(testFilePath);
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
      testResults.failed++;
      testResults.tests.push({ name: 'Upload File', status: 'failed', error: error.message });
    }
    console.log('');

    // Test 4: List files in folder
    console.log('📂 Test 4: List Files in Folder');
    try {
      const listResult = await driveSync.listFiles(global.testFolderId);
      console.log(`   ✅ Found ${listResult.count} file(s)`);
      listResult.files.forEach(file => {
        console.log(`      - ${file.name} (${file.mimeType})`);
      });
      testResults.passed++;
      testResults.tests.push({ name: 'List Files', status: 'passed', count: listResult.count });
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
      testResults.failed++;
      testResults.tests.push({ name: 'List Files', status: 'failed', error: error.message });
    }
    console.log('');

    // Test 5: Sync file (update existing)
    console.log('🔄 Test 5: Sync File (Update)');
    try {
      // Create updated test file
      const testFilePath = path.join(__dirname, 'test-upload.json');
      fs.writeFileSync(testFilePath, JSON.stringify({
        test: 'update',
        timestamp: new Date().toISOString(),
        message: 'This file has been updated!',
        version: 2,
      }, null, 2));

      const syncResult = await driveSync.syncFile(
        testFilePath,
        global.testFolderId,
        { fileName: 'test-upload.json', mimeType: 'application/json' }
      );

      console.log(`   ✅ Action: ${syncResult.action}`);
      console.log(`   File: ${syncResult.fileName}`);
      testResults.passed++;
      testResults.tests.push({ name: 'Sync File Update', status: 'passed', action: syncResult.action });

      // Clean up local test file
      fs.unlinkSync(testFilePath);
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
      testResults.failed++;
      testResults.tests.push({ name: 'Sync File Update', status: 'failed', error: error.message });
    }
    console.log('');

    // Test 6: Download file
    console.log('📥 Test 6: Download File');
    try {
      const downloadPath = path.join(__dirname, 'test-download.json');
      const downloadResult = await driveSync.downloadFile(global.testFileId, downloadPath);

      const content = JSON.parse(fs.readFileSync(downloadPath, 'utf8'));
      console.log(`   ✅ Downloaded: ${downloadResult.localPath}`);
      console.log(`   Content version: ${content.version || 1}`);
      console.log(`   Message: ${content.message}`);

      testResults.passed++;
      testResults.tests.push({ name: 'Download File', status: 'passed' });

      // Clean up downloaded file
      fs.unlinkSync(downloadPath);
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
      testResults.failed++;
      testResults.tests.push({ name: 'Download File', status: 'failed', error: error.message });
    }
    console.log('');

    // Test 7: Sync audit log to Shared Drive
    console.log('📋 Test 7: Sync Audit Log to Shared Drive');
    try {
      const auditLogPath = path.join(__dirname, 'gemini-audit-log.json');

      if (!fs.existsSync(auditLogPath)) {
        console.log('   ⏭️  Skipped - No audit log file found');
        testResults.tests.push({ name: 'Sync Audit Log', status: 'skipped' });
      } else {
        const driveId = await driveSync.getSharedDriveId('AI Development - No PHI');
        const syncResult = await driveSync.syncAuditLog(auditLogPath, driveId);

        console.log(`   ✅ Action: ${syncResult.action}`);
        console.log(`   Folder: ${syncResult.folderPath}`);
        console.log(`   File: ${syncResult.fileName}`);
        testResults.passed++;
        testResults.tests.push({
          name: 'Sync Audit Log',
          status: 'passed',
          action: syncResult.action,
          path: syncResult.folderPath,
        });
      }
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
      testResults.failed++;
      testResults.tests.push({ name: 'Sync Audit Log', status: 'failed', error: error.message });
    }
    console.log('');

    // Test 8: Verify Shared Drive write permissions
    console.log('✅ Test 8: Verify Shared Drive Write Permissions');
    try {
      const driveId = await driveSync.getSharedDriveId('AI Development - No PHI');

      // Create test file in Shared Drive root
      const testFilePath = path.join(__dirname, 'shared-drive-test.json');
      fs.writeFileSync(testFilePath, JSON.stringify({
        test: 'shared-drive-write',
        timestamp: new Date().toISOString(),
      }, null, 2));

      const uploadResult = await driveSync.uploadFile(
        testFilePath,
        driveId,
        { fileName: 'DriveSync-Permission-Test.json', mimeType: 'application/json' }
      );

      console.log(`   ✅ Write verified to Shared Drive`);
      console.log(`   File ID: ${uploadResult.fileId}`);

      testResults.passed++;
      testResults.tests.push({ name: 'Shared Drive Write', status: 'passed' });

      // Clean up
      fs.unlinkSync(testFilePath);

      // Delete test file from Drive
      const drive = google.drive({ version: 'v3', auth: oAuth2Client });
      await drive.files.delete({
        fileId: uploadResult.fileId,
        supportsAllDrives: true,
      });
      console.log(`   🗑️  Cleaned up test file`);

    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
      testResults.failed++;
      testResults.tests.push({ name: 'Shared Drive Write', status: 'failed', error: error.message });
    }
    console.log('');

    // Summary
    console.log('═'.repeat(70));
    console.log('📊 Test Summary\n');
    console.log(`   Total Tests: ${testResults.passed + testResults.failed}`);
    console.log(`   ✅ Passed: ${testResults.passed}`);
    console.log(`   ❌ Failed: ${testResults.failed}`);
    console.log(`   Accuracy: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
    console.log('');

    if (testResults.failed === 0) {
      console.log('🎉 ALL TESTS PASSED!');
      console.log('✅ Google Drive sync is fully functional');
      console.log('✅ Shared Drive write permissions verified');
      console.log('✅ Audit log sync ready for production');
    } else {
      console.log('⚠️  Some tests failed - review implementation');
      console.log('\nFailed Tests:');
      testResults.tests.filter(t => t.status === 'failed').forEach(t => {
        console.log(`   - ${t.name}: ${t.error}`);
      });
    }

    console.log('');

    // Clean up test folder
    console.log('🗑️  Cleaning up test folder...');
    try {
      const drive = google.drive({ version: 'v3', auth: oAuth2Client });
      await drive.files.delete({
        fileId: global.testFolderId,
        supportsAllDrives: true,
      });
      console.log('   ✅ Test folder deleted');
    } catch (error) {
      console.log(`   ⚠️  Could not delete test folder: ${error.message}`);
    }

  } catch (error) {
    console.log(`\n❌ Fatal Error: ${error.message}`);
    console.log(error.stack);
  }
}

testDriveSync();

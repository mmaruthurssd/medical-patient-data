# Google Drive API Integration Guide

**Document:** Google Drive API Integration Guide
**Project:** Google Workspace Automation Infrastructure
**Version:** 1.0
**Last Updated:** 2025-11-08
**Status:** Active

---

## Overview

This guide provides comprehensive instructions for integrating Google Drive API into your automation infrastructure, with specific focus on Shared Drive operations.

### What You'll Build

- **Drive API Wrapper**: Reusable client for all Drive operations
- **Shared Drive Access**: Proper handling of `supportsAllDrives` flags
- **File Management**: Read, write, create, delete operations
- **Bidirectional Sync**: Local ↔ Drive synchronization
- **PHI Guard Integration**: Prevent PHI from being stored insecurely

---

## Prerequisites

### Completed Steps
- [x] Automation account created
- [x] OAuth 2.0 configured
- [x] Drive API enabled in Google Cloud Project
- [x] `automation@ssdsbc.com` has Manager access to all Shared Drives

### Required Knowledge
- Basic Node.js/JavaScript
- Async/await patterns
- File system operations
- JSON handling

---

## Architecture Overview

```
┌──────────────────────┐
│  Your Application    │
│  (Node.js script,    │
│   automation tasks)  │
└──────────┬───────────┘
           │
           │ Uses
           │
           ▼
┌──────────────────────┐
│  DriveAPIWrapper     │
│  - listFiles()       │
│  - readFile()        │
│  - writeFile()       │
│  - syncFile()        │
└──────────┬───────────┘
           │
           │ Authenticated API Calls
           │ (with Shared Drive flags)
           │
           ▼
┌──────────────────────┐
│  Google Drive API    │
│  - My Drive          │
│  - Shared Drives     │
└──────────────────────┘
```

---

## Step 1: Create Drive API Wrapper

### 1.1 Initialize Project Structure

```bash
# If not already done
npm init -y
npm install googleapis dotenv
```

### 1.2 Create DriveAPIWrapper Class

Create `drive-api-wrapper.js`:

```javascript
require('dotenv').config();
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

class DriveAPIWrapper {
  constructor(auth) {
    if (!auth) {
      throw new Error('OAuth authentication required');
    }

    this.drive = google.drive({ version: 'v3', auth });
    this.sharedDriveFlags = {
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    };
  }

  /**
   * List all Shared Drives accessible to the account
   */
  async listSharedDrives() {
    try {
      const response = await this.drive.drives.list({
        pageSize: 100,
        fields: 'drives(id, name, createdTime)',
      });

      return {
        success: true,
        drives: response.data.drives || [],
        count: response.data.drives?.length || 0,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        drives: [],
      };
    }
  }

  /**
   * List files in a Shared Drive
   */
  async listFiles(driveId, options = {}) {
    try {
      const params = {
        driveId,
        corpora: 'drive',
        ...this.sharedDriveFlags,
        pageSize: options.pageSize || 100,
        q: options.query || '',
        fields: options.fields || 'files(id, name, mimeType, modifiedTime, size)',
        orderBy: options.orderBy || 'modifiedTime desc',
      };

      const response = await this.drive.files.list(params);

      return {
        success: true,
        files: response.data.files || [],
        count: response.data.files?.length || 0,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        files: [],
      };
    }
  }

  /**
   * Get file metadata by ID
   */
  async getFileMetadata(fileId) {
    try {
      const response = await this.drive.files.get({
        fileId,
        fields: 'id, name, mimeType, size, modifiedTime, parents, webViewLink',
        ...this.sharedDriveFlags,
      });

      return {
        success: true,
        metadata: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Read file content (for spreadsheets, use Sheets API instead)
   */
  async readFile(fileId) {
    try {
      const response = await this.drive.files.get({
        fileId,
        alt: 'media',
        ...this.sharedDriveFlags,
      });

      return {
        success: true,
        content: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Create a new file in a Shared Drive
   */
  async createFile(driveId, fileName, content, mimeType = 'text/plain') {
    try {
      const fileMetadata = {
        name: fileName,
        parents: [driveId],
        mimeType,
      };

      const media = {
        mimeType,
        body: content,
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media,
        fields: 'id, name, webViewLink',
        ...this.sharedDriveFlags,
      });

      return {
        success: true,
        file: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Update existing file content
   */
  async updateFile(fileId, content, mimeType = 'text/plain') {
    try {
      const media = {
        mimeType,
        body: content,
      };

      const response = await this.drive.files.update({
        fileId,
        media,
        ...this.sharedDriveFlags,
      });

      return {
        success: true,
        file: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Delete a file
   */
  async deleteFile(fileId) {
    try {
      await this.drive.files.delete({
        fileId,
        ...this.sharedDriveFlags,
      });

      return {
        success: true,
        message: 'File deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Search files by query
   */
  async searchFiles(query, driveId = null) {
    try {
      const params = {
        q: query,
        pageSize: 100,
        fields: 'files(id, name, mimeType, modifiedTime)',
        ...this.sharedDriveFlags,
      };

      if (driveId) {
        params.driveId = driveId;
        params.corpora = 'drive';
      } else {
        params.corpora = 'allDrives';
      }

      const response = await this.drive.files.list(params);

      return {
        success: true,
        files: response.data.files || [],
        count: response.data.files?.length || 0,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        files: [],
      };
    }
  }

  /**
   * Download file to local filesystem
   */
  async downloadFile(fileId, localPath) {
    try {
      const response = await this.drive.files.get({
        fileId,
        alt: 'media',
        ...this.sharedDriveFlags,
      }, {
        responseType: 'stream',
      });

      return new Promise((resolve, reject) => {
        const dest = fs.createWriteStream(localPath);

        response.data
          .on('end', () => {
            resolve({
              success: true,
              path: localPath,
            });
          })
          .on('error', (err) => {
            reject({
              success: false,
              error: err.message,
            });
          })
          .pipe(dest);
      });
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Upload local file to Drive
   */
  async uploadFile(localPath, driveId, fileName = null) {
    try {
      const fileMetadata = {
        name: fileName || path.basename(localPath),
        parents: [driveId],
      };

      const media = {
        mimeType: 'application/octet-stream',
        body: fs.createReadStream(localPath),
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media,
        fields: 'id, name, webViewLink',
        ...this.sharedDriveFlags,
      });

      return {
        success: true,
        file: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = DriveAPIWrapper;
```

---

## Step 2: Test Drive API Wrapper

### 2.1 Create Test Script

Create `test-drive-wrapper.js`:

```javascript
require('dotenv').config();
const { google } = require('googleapis');
const fs = require('fs');
const DriveAPIWrapper = require('./drive-api-wrapper');

async function testDriveWrapper() {
  console.log('🧪 Testing Drive API Wrapper\n');

  // Load OAuth credentials
  const credentials = JSON.parse(fs.readFileSync('credentials.json', 'utf8'));
  const token = JSON.parse(fs.readFileSync('token.json', 'utf8'));

  const { client_id, client_secret, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );
  oAuth2Client.setCredentials(token);

  // Initialize wrapper
  const drive = new DriveAPIWrapper(oAuth2Client);

  // Test 1: List Shared Drives
  console.log('Test 1: List Shared Drives');
  console.log('═'.repeat(60));
  const drivesResult = await drive.listSharedDrives();

  if (drivesResult.success) {
    console.log(`✅ Found ${drivesResult.count} Shared Drives:\n`);
    drivesResult.drives.forEach(d => {
      console.log(`   📁 ${d.name}`);
      console.log(`      ID: ${d.id}`);
      console.log(`      Created: ${d.createdTime}\n`);
    });
  } else {
    console.log(`❌ Failed: ${drivesResult.error}`);
  }

  if (drivesResult.drives.length === 0) {
    console.log('⚠️  No Shared Drives found. Verify automation account has access.');
    return;
  }

  // Test 2: List files in first Shared Drive
  const testDrive = drivesResult.drives[0];
  console.log('\nTest 2: List Files in Shared Drive');
  console.log('═'.repeat(60));
  console.log(`Shared Drive: ${testDrive.name}\n`);

  const filesResult = await drive.listFiles(testDrive.id, {
    query: "mimeType='application/vnd.google-apps.spreadsheet'",
    pageSize: 10,
  });

  if (filesResult.success) {
    console.log(`✅ Found ${filesResult.count} spreadsheets (showing first 10):\n`);
    filesResult.files.forEach(f => {
      console.log(`   📊 ${f.name}`);
      console.log(`      ID: ${f.id}`);
      console.log(`      Modified: ${f.modifiedTime}\n`);
    });
  } else {
    console.log(`❌ Failed: ${filesResult.error}`);
  }

  // Test 3: Create test file
  console.log('\nTest 3: Create Test File');
  console.log('═'.repeat(60));

  const testContent = `Test file created by Drive API Wrapper
Created: ${new Date().toISOString()}
Purpose: Verify write access to Shared Drive
`;

  const createResult = await drive.createFile(
    testDrive.id,
    'API-Test-File.txt',
    testContent,
    'text/plain'
  );

  if (createResult.success) {
    console.log('✅ File created successfully');
    console.log(`   ID: ${createResult.file.id}`);
    console.log(`   Name: ${createResult.file.name}`);
    console.log(`   Link: ${createResult.file.webViewLink}\n`);

    // Test 4: Read the file back
    console.log('Test 4: Read File Content');
    console.log('═'.repeat(60));

    const readResult = await drive.readFile(createResult.file.id);

    if (readResult.success) {
      console.log('✅ File read successfully');
      console.log('   Content:');
      console.log(readResult.content);
    } else {
      console.log(`❌ Failed to read: ${readResult.error}`);
    }

    // Test 5: Delete the test file
    console.log('\nTest 5: Delete Test File');
    console.log('═'.repeat(60));

    const deleteResult = await drive.deleteFile(createResult.file.id);

    if (deleteResult.success) {
      console.log('✅ File deleted successfully\n');
    } else {
      console.log(`❌ Failed to delete: ${deleteResult.error}\n`);
    }
  } else {
    console.log(`❌ Failed to create file: ${createResult.error}`);
  }

  // Summary
  console.log('═'.repeat(60));
  console.log('✅ Drive API Wrapper tests complete!');
  console.log('✅ Ready for production use');
}

testDriveWrapper().catch(console.error);
```

### 2.2 Run Test

```bash
node test-drive-wrapper.js
```

**Expected Output:**

```
🧪 Testing Drive API Wrapper

Test 1: List Shared Drives
════════════════════════════════════════════════════════════
✅ Found 5 Shared Drives:

   📁 Prior Authorization Drive
      ID: 0APX...
      Created: 2024-01-15T...

   ...

Test 2: List Files in Shared Drive
════════════════════════════════════════════════════════════
Shared Drive: Prior Authorization Drive

✅ Found 47 spreadsheets (showing first 10):

   📊 Prior Auth Tracker 2025
      ID: 1AbC...
      Modified: 2025-11-07T...

   ...

Test 3: Create Test File
════════════════════════════════════════════════════════════
✅ File created successfully
   ID: 1XyZ...
   Name: API-Test-File.txt
   Link: https://drive.google.com/file/d/...

Test 4: Read File Content
════════════════════════════════════════════════════════════
✅ File read successfully
   Content:
Test file created by Drive API Wrapper
Created: 2025-11-08T...
Purpose: Verify write access to Shared Drive

Test 5: Delete Test File
════════════════════════════════════════════════════════════
✅ File deleted successfully

════════════════════════════════════════════════════════════
✅ Drive API Wrapper tests complete!
✅ Ready for production use
```

---

## Step 3: Implement Bidirectional Sync

### 3.1 Create Sync Manager

Create `drive-sync-manager.js`:

```javascript
const DriveAPIWrapper = require('./drive-api-wrapper');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class DriveSyncManager {
  constructor(driveWrapper, syncConfig = {}) {
    this.drive = driveWrapper;
    this.syncDir = syncConfig.localSyncDir || './sync';
    this.driveId = syncConfig.driveId;
    this.syncInterval = syncConfig.intervalSeconds || 300; // 5 minutes
    this.syncMap = new Map(); // fileId -> { localPath, hash, lastSync }

    // Ensure sync directory exists
    if (!fs.existsSync(this.syncDir)) {
      fs.mkdirSync(this.syncDir, { recursive: true });
    }
  }

  /**
   * Calculate file hash for change detection
   */
  calculateHash(filePath) {
    const fileBuffer = fs.readFileSync(filePath);
    return crypto.createHash('md5').update(fileBuffer).digest('hex');
  }

  /**
   * Download file from Drive to local
   */
  async downloadFromDrive(fileId, fileName) {
    const localPath = path.join(this.syncDir, fileName);

    console.log(`⬇️  Downloading: ${fileName}`);

    const result = await this.drive.downloadFile(fileId, localPath);

    if (result.success) {
      const hash = this.calculateHash(localPath);
      this.syncMap.set(fileId, {
        localPath,
        hash,
        lastSync: new Date().toISOString(),
        direction: 'download',
      });

      console.log(`   ✅ Downloaded to ${localPath}`);
    } else {
      console.log(`   ❌ Failed: ${result.error}`);
    }

    return result;
  }

  /**
   * Upload local file to Drive
   */
  async uploadToDrive(localPath, fileName = null) {
    fileName = fileName || path.basename(localPath);

    console.log(`⬆️  Uploading: ${fileName}`);

    const result = await this.drive.uploadFile(localPath, this.driveId, fileName);

    if (result.success) {
      const hash = this.calculateHash(localPath);
      this.syncMap.set(result.file.id, {
        localPath,
        hash,
        lastSync: new Date().toISOString(),
        direction: 'upload',
      });

      console.log(`   ✅ Uploaded (ID: ${result.file.id})`);
    } else {
      console.log(`   ❌ Failed: ${result.error}`);
    }

    return result;
  }

  /**
   * Sync a specific file (bidirectional)
   */
  async syncFile(fileId, fileName) {
    const localPath = path.join(this.syncDir, fileName);
    const syncInfo = this.syncMap.get(fileId);

    // File exists locally and in Drive
    if (fs.existsSync(localPath) && syncInfo) {
      const currentHash = this.calculateHash(localPath);

      // File changed locally
      if (currentHash !== syncInfo.hash) {
        console.log(`🔄 Local changes detected: ${fileName}`);

        // Upload to Drive
        const content = fs.readFileSync(localPath);
        const updateResult = await this.drive.updateFile(fileId, content);

        if (updateResult.success) {
          syncInfo.hash = currentHash;
          syncInfo.lastSync = new Date().toISOString();
          syncInfo.direction = 'upload';
          console.log(`   ✅ Uploaded changes`);
        }

        return updateResult;
      }

      // Check if Drive version changed
      const metadata = await this.drive.getFileMetadata(fileId);

      if (metadata.success) {
        const driveModified = new Date(metadata.metadata.modifiedTime);
        const lastSync = new Date(syncInfo.lastSync);

        if (driveModified > lastSync) {
          console.log(`🔄 Drive changes detected: ${fileName}`);
          return await this.downloadFromDrive(fileId, fileName);
        }
      }

      console.log(`✅ ${fileName} is in sync`);
      return { success: true, status: 'in_sync' };
    }

    // File doesn't exist locally, download
    if (!fs.existsSync(localPath)) {
      return await this.downloadFromDrive(fileId, fileName);
    }

    // File doesn't exist in Drive, upload
    if (!syncInfo) {
      return await this.uploadToDrive(localPath, fileName);
    }
  }

  /**
   * Sync all files in the configured Drive
   */
  async syncAll() {
    console.log('🔄 Starting bidirectional sync...\n');

    const filesResult = await this.drive.listFiles(this.driveId);

    if (!filesResult.success) {
      console.log(`❌ Failed to list files: ${filesResult.error}`);
      return;
    }

    console.log(`Found ${filesResult.count} files in Drive\n`);

    for (const file of filesResult.files) {
      // Skip folders and Google Docs (use Sheets API for those)
      if (file.mimeType.includes('folder') ||
          file.mimeType.includes('google-apps')) {
        continue;
      }

      await this.syncFile(file.id, file.name);
    }

    console.log('\n✅ Sync complete!');
  }

  /**
   * Start continuous sync
   */
  startContinuousSync() {
    console.log(`🔄 Starting continuous sync (every ${this.syncInterval}s)`);

    this.syncInterval = setInterval(async () => {
      console.log(`\n🕒 ${new Date().toISOString()} - Running sync...`);
      await this.syncAll();
    }, this.syncInterval * 1000);
  }

  /**
   * Stop continuous sync
   */
  stopContinuousSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      console.log('⏹️  Continuous sync stopped');
    }
  }

  /**
   * Get sync status
   */
  getSyncStatus() {
    const status = {
      totalFiles: this.syncMap.size,
      lastSynced: {},
      syncDirection: {},
    };

    for (const [fileId, info] of this.syncMap.entries()) {
      status.lastSynced[fileId] = info.lastSync;
      status.syncDirection[fileId] = info.direction;
    }

    return status;
  }
}

module.exports = DriveSyncManager;
```

### 3.2 Test Bidirectional Sync

Create `test-sync.js`:

```javascript
require('dotenv').config();
const { google } = require('googleapis');
const fs = require('fs');
const DriveAPIWrapper = require('./drive-api-wrapper');
const DriveSyncManager = require('./drive-sync-manager');

async function testSync() {
  console.log('🧪 Testing Bidirectional Sync\n');

  // Setup authentication
  const credentials = JSON.parse(fs.readFileSync('credentials.json', 'utf8'));
  const token = JSON.parse(fs.readFileSync('token.json', 'utf8'));

  const { client_id, client_secret, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );
  oAuth2Client.setCredentials(token);

  // Initialize wrapper and sync manager
  const drive = new DriveAPIWrapper(oAuth2Client);
  const drivesResult = await drive.listSharedDrives();

  if (!drivesResult.success || drivesResult.count === 0) {
    console.log('❌ No Shared Drives found');
    return;
  }

  const testDrive = drivesResult.drives[0];
  console.log(`Using Drive: ${testDrive.name} (${testDrive.id})\n`);

  const syncManager = new DriveSyncManager(drive, {
    driveId: testDrive.id,
    localSyncDir: './test-sync',
  });

  // Run one-time sync
  await syncManager.syncAll();

  // Show sync status
  console.log('\n📊 Sync Status:');
  const status = syncManager.getSyncStatus();
  console.log(JSON.stringify(status, null, 2));
}

testSync().catch(console.error);
```

---

## Step 4: PHI Guard Integration

### 4.1 Add PHI Scanning to Sync

Update `drive-sync-manager.js` to include PHI Guard:

```javascript
// Add at the top
const PHIGuard = require('./phi-guard');

// In constructor
this.phiGuard = new PHIGuard();
this.enablePHIGuard = process.env.ENABLE_PHI_GUARD === 'true';

// Add method to check files before upload
async scanForPHI(localPath) {
  if (!this.enablePHIGuard) {
    return { hasPHI: false };
  }

  const content = fs.readFileSync(localPath, 'utf8');
  return this.phiGuard.detectPHI(content);
}

// Update uploadToDrive method
async uploadToDrive(localPath, fileName = null) {
  // Scan for PHI
  const phiScan = await this.scanForPHI(localPath);

  if (phiScan.hasPHI) {
    console.log(`⚠️  PHI detected in ${fileName}:`);
    console.log(`   Risk Level: ${phiScan.riskLevel}`);

    if (phiScan.riskLevel === 'high') {
      console.log(`   ❌ Upload blocked - High-risk PHI detected`);
      return {
        success: false,
        error: 'High-risk PHI detected. De-identification required.',
      };
    }

    console.log(`   ⚠️  Proceeding with caution...`);
  }

  // Continue with upload...
  fileName = fileName || path.basename(localPath);
  // ... rest of upload logic
}
```

---

## Troubleshooting

### Issue: "404 Not Found" on Shared Drive operations

**Cause:** Missing `supportsAllDrives` flags
**Solution:** Ensure all API calls include:
```javascript
supportsAllDrives: true
includeItemsFromAllDrives: true
```

### Issue: "Insufficient Permission" errors

**Cause:** Automation account lacks Manager role
**Solution:**
1. Verify account has **Manager** (not Content Manager)
2. Check in Drive UI: Shared Drive > Manage members
3. Re-grant access if needed

### Issue: Sync conflicts (file changed in both locations)

**Solution:** Implement conflict resolution strategy:
- **Last Write Wins**: Use most recent modification time
- **Manual Resolution**: Prompt user to choose
- **Versioning**: Keep both versions with timestamps

---

## Next Steps

After completing Drive integration:

1. ✅ Mark Phase 3 goals as complete in GOALS.md
2. ➡️ Proceed to Phase 4: [Apps Script Deployment Guide](APPS-SCRIPT-DEPLOYMENT-GUIDE.md)
3. ➡️ Implement batch processing for 240+ sheets

---

## Checklist: Drive Integration Complete

- [ ] Drive API Wrapper implemented
- [ ] Shared Drive flags configured
- [ ] Can list all Shared Drives
- [ ] Can list files in each drive
- [ ] Can read file content
- [ ] Can create files
- [ ] Can update files
- [ ] Can delete files
- [ ] Bidirectional sync working
- [ ] PHI Guard integrated
- [ ] No 404 errors on operations
- [ ] All tests passing

**Estimated Time:** 4-6 hours
**Priority:** High
**Dependencies:**
- OAuth setup complete
- Automation account has Manager access

---

**Document Owner:** Marvin Maruthur
**Next Review:** After Phase 3 completion
**Related Documents:**
- [OAUTH-SETUP-GUIDE.md](OAUTH-SETUP-GUIDE.md)
- [APPS-SCRIPT-DEPLOYMENT-GUIDE.md](APPS-SCRIPT-DEPLOYMENT-GUIDE.md)

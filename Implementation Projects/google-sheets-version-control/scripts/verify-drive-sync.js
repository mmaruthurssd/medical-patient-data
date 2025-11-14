#!/usr/bin/env node

/**
 * Verify Google Drive Synchronization
 *
 * Verifies that Google Drive documentation is synchronized with local workspace.
 * Compares file modification dates and identifies out-of-sync files.
 *
 * Usage:
 *   node scripts/verify-drive-sync.js
 *
 * Requires:
 *   - Service account access to "Workspace Management" folder
 *   - GCP_SERVICE_ACCOUNT environment variable or GitHub secret
 */

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

// Configuration (matches sync-docs-to-drive.js)
const CONFIG = {
  CORE_DOCS: [
    'docs/WORKSPACE-MANAGEMENT.md',
    'docs/AI-AGENT-ONBOARDING.md',
    'docs/SYSTEM-ARCHITECTURE.md',
    'docs/SERVICE-ACCOUNT.md',
    'docs/DATA-PROTECTION.md',
    'docs/DOCUMENTATION-PROCESS.md',
    'docs/DOCUMENTATION-SYNC-GUIDE.md',
    'WORKSPACE_GUIDE.md',
    'README.md'
  ],
  DRIVE_FOLDER_NAME: 'workspace-management',
  DRIVE_SUBFOLDER: 'Core Documentation',
  SHARED_DRIVE_NAME: 'AI Development - No PHI'
};

/**
 * Get authenticated Google Drive client
 */
async function getDriveClient() {
  let credentials;

  if (process.env.GCP_SERVICE_ACCOUNT) {
    try {
      credentials = JSON.parse(process.env.GCP_SERVICE_ACCOUNT);
    } catch (error) {
      console.error('❌ Failed to parse GCP_SERVICE_ACCOUNT:', error.message);
      process.exit(1);
    }
  } else {
    console.error('❌ GCP_SERVICE_ACCOUNT environment variable not found');
    process.exit(1);
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive.readonly']
  });

  return google.drive({ version: 'v3', auth });
}

/**
 * Find shared drive by name
 */
async function findSharedDrive(drive, driveName) {
  const response = await drive.drives.list({
    pageSize: 100,
    fields: 'drives(id, name)'
  });

  if (!response.data.drives) {
    return null;
  }

  const sharedDrive = response.data.drives.find(d => d.name === driveName);
  return sharedDrive ? sharedDrive.id : null;
}

/**
 * Find folder in Google Drive shared drive
 */
async function findFolder(drive, folderName, parentFolderId = null, driveId = null) {
  let query = `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
  if (parentFolderId) {
    query += ` and '${parentFolderId}' in parents`;
  }

  const listParams = {
    q: query,
    fields: 'files(id, name)',
    supportsAllDrives: true,
    includeItemsFromAllDrives: true
  };

  // If searching within a specific drive, add drive-specific parameters
  if (driveId) {
    listParams.corpora = 'drive';
    listParams.driveId = driveId;
  }

  const response = await drive.files.list(listParams);

  return response.data.files && response.data.files.length > 0
    ? response.data.files[0].id
    : null;
}

/**
 * Get file info from Google Drive
 */
async function getDriveFileInfo(drive, fileName, folderId) {
  const query = `name='${fileName}' and '${folderId}' in parents and trashed=false`;
  const response = await drive.files.list({
    q: query,
    fields: 'files(id, name, modifiedTime, size)',
    supportsAllDrives: true,
    includeItemsFromAllDrives: true
  });

  return response.data.files && response.data.files.length > 0
    ? response.data.files[0]
    : null;
}

/**
 * Format file size
 */
function formatSize(bytes) {
  if (!bytes) return 'Unknown';
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

/**
 * Format date
 */
function formatDate(date) {
  return date ? new Date(date).toISOString().split('T')[0] : 'Unknown';
}

/**
 * Compare file dates and determine sync status
 */
function getSyncStatus(localDate, driveDate) {
  if (!driveDate) return 'missing';

  const localTime = localDate.getTime();
  const driveTime = new Date(driveDate).getTime();
  const diff = Math.abs(localTime - driveTime);

  // Files are considered synced if within 1 minute of each other
  if (diff < 60000) return 'synced';

  if (localTime > driveTime) return 'outdated';
  if (driveTime > localTime) return 'newer';

  return 'synced';
}

/**
 * Main verification function
 */
async function verifySync() {
  console.log('🔍 Verifying Google Drive documentation sync...\n');

  try {
    // Authenticate
    console.log('1. Authenticating with service account...');
    const drive = await getDriveClient();
    console.log('   ✅ Authenticated\n');

    // Find shared drive
    console.log('2. Locating shared drive...');
    const sharedDriveId = await findSharedDrive(drive, CONFIG.SHARED_DRIVE_NAME);
    if (!sharedDriveId) {
      console.error(`   ❌ Shared drive "${CONFIG.SHARED_DRIVE_NAME}" not found`);
      console.error('   Service account must have access to this shared drive');
      process.exit(1);
    }
    console.log(`   ✅ Found shared drive: ${CONFIG.SHARED_DRIVE_NAME}\n`);

    // Find Drive folders in shared drive
    console.log('3. Locating Drive folders...');
    const workspaceFolderId = await findFolder(drive, CONFIG.DRIVE_FOLDER_NAME, null, sharedDriveId);
    if (!workspaceFolderId) {
      console.error(`   ❌ "${CONFIG.DRIVE_FOLDER_NAME}" folder not found`);
      process.exit(1);
    }
    console.log(`   ✅ Found "${CONFIG.DRIVE_FOLDER_NAME}"`);

    const coreDocsFolderId = await findFolder(drive, CONFIG.DRIVE_SUBFOLDER, workspaceFolderId, sharedDriveId);
    if (!coreDocsFolderId) {
      console.error(`   ❌ "${CONFIG.DRIVE_SUBFOLDER}" folder not found`);
      process.exit(1);
    }
    console.log(`   ✅ Found "${CONFIG.DRIVE_SUBFOLDER}"\n`);

    // Verify each file
    console.log('4. Verifying file synchronization:\n');

    const results = {
      synced: [],
      outdated: [],
      newer: [],
      missing: [],
      error: []
    };

    for (const filePath of CONFIG.CORE_DOCS) {
      const fullPath = path.join(process.cwd(), filePath);
      const fileName = path.basename(filePath);

      if (!fs.existsSync(fullPath)) {
        console.log(`   ⚠️  ${fileName} - Local file not found`);
        results.error.push(fileName);
        continue;
      }

      try {
        const localStat = fs.statSync(fullPath);
        const driveFile = await getDriveFileInfo(drive, fileName, coreDocsFolderId);

        const status = getSyncStatus(localStat.mtime, driveFile?.modifiedTime);

        const statusIcons = {
          synced: '✅',
          outdated: '❌',
          newer: '⚠️',
          missing: '⚠️'
        };

        const localDate = formatDate(localStat.mtime);
        const driveDate = formatDate(driveFile?.modifiedTime);

        console.log(`   ${statusIcons[status]} ${fileName}`);
        console.log(`      Local:  ${localDate} (${formatSize(localStat.size)})`);
        console.log(`      Drive:  ${driveDate}${driveFile ? ` (${formatSize(driveFile.size)})` : ' (Not found)'}`);

        if (status !== 'synced') {
          console.log(`      Status: ${status === 'outdated' ? 'Drive needs update' :
                                       status === 'newer' ? 'Drive newer than local' :
                                       'Not found in Drive'}`);
        }

        console.log();
        results[status].push(fileName);

      } catch (error) {
        console.log(`   ❌ ${fileName} - Error: ${error.message}\n`);
        results.error.push(fileName);
      }
    }

    // Print summary
    console.log('5. Verification Summary:\n');
    console.log(`   ✅ Synced:   ${results.synced.length}`);
    console.log(`   ❌ Outdated: ${results.outdated.length}${results.outdated.length > 0 ? ' (Drive needs update)' : ''}`);
    console.log(`   ⚠️  Newer:    ${results.newer.length}${results.newer.length > 0 ? ' (Drive newer than local!)' : ''}`);
    console.log(`   ⚠️  Missing:  ${results.missing.length}${results.missing.length > 0 ? ' (Not in Drive)' : ''}`);
    console.log(`   ❌ Errors:   ${results.error.length}`);

    // Recommendations
    console.log();
    if (results.outdated.length > 0 || results.missing.length > 0) {
      console.log('💡 Recommendation: Run `node scripts/sync-docs-to-drive.js` to update Drive');
    }

    if (results.newer.length > 0) {
      console.log('⚠️  Warning: Some Drive files are newer than local files!');
      console.log('   Review changes before syncing to avoid data loss.');
    }

    if (results.synced.length === CONFIG.CORE_DOCS.length) {
      console.log('✅ All documentation is synchronized!');
    }

    // Exit code based on results
    const needsSync = results.outdated.length + results.missing.length + results.error.length;
    process.exit(needsSync > 0 ? 1 : 0);

  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run verification
verifySync();

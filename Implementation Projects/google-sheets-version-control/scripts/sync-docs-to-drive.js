#!/usr/bin/env node

/**
 * Sync Documentation to Google Drive
 *
 * Syncs core documentation from local workspace to Google Drive
 * "Workspace Management" folder in "AI Development - No PHI" shared drive.
 *
 * Usage:
 *   node scripts/sync-docs-to-drive.js                    # Sync all core docs
 *   node scripts/sync-docs-to-drive.js --force            # Force overwrite
 *   node scripts/sync-docs-to-drive.js --file docs/X.md   # Sync specific file
 *
 * Requires:
 *   - Service account access to "Workspace Management" folder
 *   - GCP_SERVICE_ACCOUNT environment variable or GitHub secret
 */

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

// Configuration
const CONFIG = {
  // Core documentation files to sync (from DOCUMENTATION-SYNC-GUIDE.md matrix)
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

  // Google Drive folder structure
  DRIVE_FOLDER_NAME: 'workspace-management',
  DRIVE_SUBFOLDER: 'Core Documentation',
  SHARED_DRIVE_NAME: 'AI Development - No PHI',

  // Sync timestamp file
  TIMESTAMP_FILE: 'docs/.last-drive-sync'
};

/**
 * Get authenticated Google Drive client
 */
async function getDriveClient() {
  let credentials;

  // Try environment variable first (GitHub Actions)
  if (process.env.GCP_SERVICE_ACCOUNT) {
    try {
      credentials = JSON.parse(process.env.GCP_SERVICE_ACCOUNT);
    } catch (error) {
      console.error('❌ Failed to parse GCP_SERVICE_ACCOUNT:', error.message);
      process.exit(1);
    }
  } else {
    console.error('❌ GCP_SERVICE_ACCOUNT environment variable not found');
    console.error('   Set it with: export GCP_SERVICE_ACCOUNT=\'$(cat path/to/service-account.json)\'');
    process.exit(1);
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive']
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
 * Find or create folder in Google Drive shared drive
 */
async function findOrCreateFolder(drive, folderName, parentFolderId = null, driveId = null) {
  // Search for existing folder
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

  if (response.data.files && response.data.files.length > 0) {
    console.log(`   Found existing folder: ${folderName} (${response.data.files[0].id})`);
    return response.data.files[0].id;
  }

  // Create folder if it doesn't exist
  const fileMetadata = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder'
  };

  if (parentFolderId) {
    fileMetadata.parents = [parentFolderId];
  }

  const folder = await drive.files.create({
    resource: fileMetadata,
    fields: 'id',
    supportsAllDrives: true
  });

  console.log(`   Created folder: ${folderName} (${folder.data.id})`);
  return folder.data.id;
}

/**
 * Upload or update file in Google Drive
 */
async function uploadFile(drive, localPath, folderId, force = false) {
  const fileName = path.basename(localPath);
  const fileContent = fs.readFileSync(localPath, 'utf8');

  // Check if file already exists
  const query = `name='${fileName}' and '${folderId}' in parents and trashed=false`;
  const response = await drive.files.list({
    q: query,
    fields: 'files(id, name, modifiedTime)',
    supportsAllDrives: true,
    includeItemsFromAllDrives: true
  });

  const media = {
    mimeType: 'text/markdown',
    body: fileContent
  };

  if (response.data.files && response.data.files.length > 0) {
    // File exists - update it
    const fileId = response.data.files[0].id;

    if (!force) {
      const driveModified = new Date(response.data.files[0].modifiedTime);
      const localModified = fs.statSync(localPath).mtime;

      if (driveModified > localModified) {
        console.log(`   ⚠️  ${fileName} - Drive version newer, skipping (use --force to overwrite)`);
        return { status: 'skipped', fileId };
      }
    }

    await drive.files.update({
      fileId,
      media,
      supportsAllDrives: true
    });

    console.log(`   ✅ ${fileName} - Updated`);
    return { status: 'updated', fileId };
  } else {
    // File doesn't exist - create it
    const fileMetadata = {
      name: fileName,
      parents: [folderId]
    };

    const file = await drive.files.create({
      resource: fileMetadata,
      media,
      fields: 'id',
      supportsAllDrives: true
    });

    console.log(`   ✅ ${fileName} - Created`);
    return { status: 'created', fileId: file.data.id };
  }
}

/**
 * Main sync function
 */
async function syncDocs(options = {}) {
  console.log('🔄 Starting documentation sync to Google Drive...\n');

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
    console.log(`   ✅ Found shared drive: ${CONFIG.SHARED_DRIVE_NAME} (${sharedDriveId})\n`);

    // Find or create folder structure in shared drive
    console.log('3. Setting up folder structure in shared drive...');
    const workspaceFolderId = await findOrCreateFolder(drive, CONFIG.DRIVE_FOLDER_NAME, null, sharedDriveId);
    const coreDocsFolderId = await findOrCreateFolder(drive, CONFIG.DRIVE_SUBFOLDER, workspaceFolderId, sharedDriveId);
    console.log();

    // Determine which files to sync
    let filesToSync = CONFIG.CORE_DOCS;
    if (options.file) {
      if (!CONFIG.CORE_DOCS.includes(options.file)) {
        console.log(`⚠️  Warning: ${options.file} is not in the core docs list`);
        console.log('   Syncing anyway...\n');
      }
      filesToSync = [options.file];
    }

    // Sync files
    console.log('4. Syncing documentation files...');
    const results = {
      created: 0,
      updated: 0,
      skipped: 0,
      failed: 0
    };

    for (const filePath of filesToSync) {
      const fullPath = path.join(process.cwd(), filePath);

      if (!fs.existsSync(fullPath)) {
        console.log(`   ❌ ${filePath} - File not found`);
        results.failed++;
        continue;
      }

      try {
        const result = await uploadFile(drive, fullPath, coreDocsFolderId, options.force);
        results[result.status]++;
      } catch (error) {
        console.log(`   ❌ ${filePath} - Error: ${error.message}`);
        results.failed++;
      }
    }

    console.log();
    console.log('5. Sync Summary:');
    console.log(`   Created: ${results.created}`);
    console.log(`   Updated: ${results.updated}`);
    console.log(`   Skipped: ${results.skipped}`);
    console.log(`   Failed: ${results.failed}`);

    // Update timestamp
    const timestamp = new Date().toISOString();
    fs.writeFileSync(CONFIG.TIMESTAMP_FILE, timestamp);
    console.log(`\n   Last sync: ${timestamp}`);

    console.log('\n✅ Documentation sync complete!');

    if (results.failed > 0) {
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Sync failed:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  force: args.includes('--force'),
  file: null
};

const fileIndex = args.indexOf('--file');
if (fileIndex !== -1 && args[fileIndex + 1]) {
  options.file = args[fileIndex + 1];
}

// Run sync
syncDocs(options);

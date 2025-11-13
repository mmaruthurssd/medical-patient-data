#!/usr/bin/env node

/**
 * sync-docs-to-shared-drive.js
 *
 * Assess "AI Development - No PHI" shared drive structure
 * and sync missing documentation files
 */

const { google } = require('googleapis');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

// Configuration
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');
const DOCS_BASE_PATH = path.join(__dirname, '../shared-resources/documentation');

const SHARED_DRIVE_NAME = 'AI Development - No PHI';

// Documentation files to sync
const DOCS_TO_SYNC = [
  {
    local: 'GOOGLE-WORKSPACE-INTEGRATION-ARCHITECTURE.md',
    remote: 'Documentation/Integrations/GOOGLE-WORKSPACE-INTEGRATION-ARCHITECTURE.md',
    priority: 'high'
  },
  {
    local: 'GOOGLE-SHEETS-TRACKING-SYSTEM.md',
    remote: 'Documentation/Integrations/GOOGLE-SHEETS-TRACKING-SYSTEM.md',
    priority: 'high'
  },
  {
    local: 'WORKSPACE_ARCHITECTURE.md',
    remote: 'Documentation/Workspace/WORKSPACE_ARCHITECTURE.md',
    priority: 'high'
  },
  {
    local: 'WORKSPACE_GUIDE.md',
    remote: 'Documentation/Workspace/WORKSPACE_GUIDE.md',
    priority: 'high'
  },
  {
    local: 'HIPAA-COMPLIANCE-DATA-BOUNDARY.md',
    remote: 'Documentation/Compliance/HIPAA-COMPLIANCE-DATA-BOUNDARY.md',
    priority: 'high'
  },
  {
    local: 'MCP_ECOSYSTEM.md',
    remote: 'Documentation/MCP/MCP_ECOSYSTEM.md',
    priority: 'high'
  },
  {
    local: 'API-CREDENTIALS-REGISTRY.md',
    remote: 'Documentation/Credentials/API-CREDENTIALS-REGISTRY.md',
    priority: 'high'
  },
  {
    local: 'SECURITY_BEST_PRACTICES.md',
    remote: 'Documentation/Security/SECURITY_BEST_PRACTICES.md',
    priority: 'medium'
  },
  {
    local: 'MCP-DEVELOPMENT-STANDARD.md',
    remote: 'Documentation/MCP/MCP-DEVELOPMENT-STANDARD.md',
    priority: 'medium'
  },
  {
    local: 'TEMPLATE_MANAGEMENT.md',
    remote: 'Documentation/Templates/TEMPLATE_MANAGEMENT.md',
    priority: 'medium'
  },
  {
    local: 'SHARED-DRIVE-SYNC-STRATEGY.md',
    remote: 'Documentation/Processes/SHARED-DRIVE-SYNC-STRATEGY.md',
    priority: 'high'
  }
];

let drive = null;
let sharedDriveId = null;

/**
 * Authenticate with Google Drive API
 */
async function authenticate() {
  console.log(chalk.blue('🔐 Authenticating with Google Drive API...'));

  const serviceAccount = await fs.readJson(SERVICE_ACCOUNT_PATH);

  const auth = new google.auth.GoogleAuth({
    credentials: serviceAccount,
    scopes: ['https://www.googleapis.com/auth/drive']
  });

  drive = google.drive({ version: 'v3', auth });
  console.log(chalk.green('✓ Authenticated'));
}

/**
 * Find shared drive by name
 */
async function findSharedDrive() {
  console.log(chalk.blue(`🔍 Finding shared drive: "${SHARED_DRIVE_NAME}"...`));

  const response = await drive.drives.list({
    pageSize: 100
  });

  const drives = response.data.drives || [];
  const targetDrive = drives.find(d => d.name === SHARED_DRIVE_NAME);

  if (!targetDrive) {
    throw new Error(`Shared drive "${SHARED_DRIVE_NAME}" not found. Available drives: ${drives.map(d => d.name).join(', ')}`);
  }

  sharedDriveId = targetDrive.id;
  console.log(chalk.green(`✓ Found shared drive: ${targetDrive.name} (${sharedDriveId})`));
  return targetDrive;
}

/**
 * List files/folders in shared drive
 */
async function listDriveContents(folderId, indent = 0) {
  const response = await drive.files.list({
    q: `'${folderId}' in parents and trashed=false`,
    corpora: 'drive',
    driveId: sharedDriveId,
    includeItemsFromAllDrives: true,
    supportsAllDrives: true,
    fields: 'files(id, name, mimeType)',
    pageSize: 100
  });

  const files = response.data.files || [];
  const prefix = '  '.repeat(indent);

  const structure = {};

  for (const file of files) {
    const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
    const icon = isFolder ? '📁' : '📄';
    console.log(chalk.gray(`${prefix}${icon} ${file.name}`));

    if (isFolder) {
      structure[file.name] = {
        id: file.id,
        type: 'folder',
        children: await listDriveContents(file.id, indent + 1)
      };
    } else {
      structure[file.name] = {
        id: file.id,
        type: 'file'
      };
    }
  }

  return structure;
}

/**
 * Get or create folder in shared drive
 */
async function getOrCreateFolder(folderPath, parentId = sharedDriveId) {
  const parts = folderPath.split('/').filter(p => p);

  let currentParentId = parentId;

  for (const folderName of parts) {
    // Check if folder exists
    const response = await drive.files.list({
      q: `name='${folderName}' and '${currentParentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      corpora: 'drive',
      driveId: sharedDriveId,
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
      fields: 'files(id, name)'
    });

    if (response.data.files && response.data.files.length > 0) {
      // Folder exists
      currentParentId = response.data.files[0].id;
      console.log(chalk.gray(`  ✓ Found folder: ${folderName}`));
    } else {
      // Create folder
      console.log(chalk.yellow(`  ➕ Creating folder: ${folderName}`));

      const fileMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [currentParentId]
      };

      const folder = await drive.files.create({
        resource: fileMetadata,
        supportsAllDrives: true,
        fields: 'id, name'
      });

      currentParentId = folder.data.id;
      console.log(chalk.green(`  ✓ Created folder: ${folderName} (${currentParentId})`));
    }
  }

  return currentParentId;
}

/**
 * Upload file to shared drive
 */
async function uploadFile(localPath, remotePath) {
  const fileName = path.basename(remotePath);
  const folderPath = path.dirname(remotePath);

  // Get or create parent folder
  const folderId = await getOrCreateFolder(folderPath);

  // Check if file already exists
  const existingFiles = await drive.files.list({
    q: `name='${fileName}' and '${folderId}' in parents and trashed=false`,
    corpora: 'drive',
    driveId: sharedDriveId,
    includeItemsFromAllDrives: true,
    supportsAllDrives: true,
    fields: 'files(id, name, modifiedTime)'
  });

  const localFilePath = path.join(DOCS_BASE_PATH, localPath);

  if (!await fs.pathExists(localFilePath)) {
    console.log(chalk.red(`  ✗ Local file not found: ${localPath}`));
    return null;
  }

  const fileContent = await fs.readFile(localFilePath);

  if (existingFiles.data.files && existingFiles.data.files.length > 0) {
    // File exists - update it
    const existingFile = existingFiles.data.files[0];
    console.log(chalk.yellow(`  📝 Updating: ${fileName}`));

    const media = {
      mimeType: 'text/markdown',
      body: require('stream').Readable.from([fileContent])
    };

    const response = await drive.files.update({
      fileId: existingFile.id,
      media: media,
      supportsAllDrives: true,
      fields: 'id, name, webViewLink, modifiedTime'
    });

    console.log(chalk.green(`  ✓ Updated: ${fileName}`));
    return response.data;

  } else {
    // File doesn't exist - create it
    console.log(chalk.blue(`  📤 Uploading: ${fileName}`));

    const fileMetadata = {
      name: fileName,
      parents: [folderId]
    };

    const media = {
      mimeType: 'text/markdown',
      body: require('stream').Readable.from([fileContent])
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      supportsAllDrives: true,
      fields: 'id, name, webViewLink, modifiedTime'
    });

    console.log(chalk.green(`  ✓ Uploaded: ${fileName}`));
    return response.data;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log(chalk.bold.blue('\n📊 Shared Drive Documentation Sync\n'));

  try {
    // Authenticate
    await authenticate();

    // Find shared drive
    const sharedDrive = await findSharedDrive();

    // Skip full structure listing (too time-consuming for large drives)
    // Can be enabled if needed by uncommenting below:
    // console.log(chalk.bold.blue('\n📁 Current Shared Drive Structure:\n'));
    // const structure = await listDriveContents(sharedDriveId);

    // Sync documentation
    console.log(chalk.bold.blue('\n📤 Syncing Documentation Files:\n'));

    const results = {
      uploaded: [],
      updated: [],
      skipped: [],
      failed: []
    };

    for (const doc of DOCS_TO_SYNC) {
      console.log(chalk.bold(`\n${doc.priority === 'high' ? '🔴' : '🟡'} ${doc.remote}`));

      try {
        const result = await uploadFile(doc.local, doc.remote);

        if (result) {
          if (result.modifiedTime) {
            results.updated.push({ ...doc, fileId: result.id, url: result.webViewLink });
          } else {
            results.uploaded.push({ ...doc, fileId: result.id, url: result.webViewLink });
          }
        } else {
          results.skipped.push(doc);
        }
      } catch (error) {
        console.log(chalk.red(`  ✗ Error: ${error.message}`));
        results.failed.push({ ...doc, error: error.message });
      }
    }

    // Summary
    console.log(chalk.bold.green('\n✨ Sync Complete!\n'));
    console.log(chalk.green(`✓ Uploaded: ${results.uploaded.length}`));
    console.log(chalk.yellow(`📝 Updated: ${results.updated.length}`));
    console.log(chalk.gray(`⊘ Skipped: ${results.skipped.length}`));
    console.log(chalk.red(`✗ Failed: ${results.failed.length}`));

    if (results.failed.length > 0) {
      console.log(chalk.bold.red('\nFailed Files:'));
      results.failed.forEach(f => {
        console.log(chalk.red(`  • ${f.local}: ${f.error}`));
      });
    }

    console.log(chalk.bold.blue('\n📋 Synced Files:\n'));
    [...results.uploaded, ...results.updated].forEach(f => {
      console.log(chalk.blue(`  📄 ${f.remote}`));
      if (f.url) {
        console.log(chalk.gray(`     ${f.url}`));
      }
    });

    console.log(chalk.bold.yellow('\n📝 Next Steps:\n'));
    console.log(chalk.gray('  1. Open shared drive and verify files'));
    console.log(chalk.gray('  2. Update RESOURCE-INDEX.md "Last Synced" column'));
    console.log(chalk.gray('  3. Notify team of new documentation'));
    console.log('');

  } catch (error) {
    console.error(chalk.bold.red('\n❌ Sync Failed\n'));
    console.error(chalk.red('Error:'), error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { authenticate, findSharedDrive, listDriveContents, uploadFile };

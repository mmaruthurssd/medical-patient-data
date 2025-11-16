#!/usr/bin/env node

/**
 * Create Google Drive folder structure for Google Workspace Materials MCP
 * Uses existing service account credentials
 */

import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Service account key path - can be overridden with environment variable or command line arg
const SERVICE_ACCOUNT_KEY_PATH = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH ||
  process.argv[2] ||
  '/Users/mmaruthurnew/Desktop/medical-patient-data/configuration/service-accounts/service-account.json';

// Shared drive name to search for (can be overridden)
const TARGET_DRIVE_NAME = process.env.TARGET_DRIVE_NAME || 'AI development - no-PHI';

async function main() {
  console.log('🚀 Creating Google Drive folder structure...\n');

  // 1. Authenticate with service account
  console.log('📝 Authenticating with service account...');
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_KEY_PATH,
    scopes: ['https://www.googleapis.com/auth/drive']
  });

  const drive = google.drive({ version: 'v3', auth });

  // 2. Search for target shared drive
  console.log(`🔍 Searching for "${TARGET_DRIVE_NAME}" shared drive...`);

  const driveList = await drive.drives.list({
    pageSize: 100
  });

  const targetDrive = driveList.data.drives?.find(d =>
    d.name.toLowerCase().includes('ai development') ||
    d.name.toLowerCase().includes('no-phi')
  );

  if (!targetDrive) {
    console.log('\n❌ Could not find "AI development - no-PHI" shared drive');
    console.log('\n📋 Available shared drives:');
    if (driveList.data.drives) {
      driveList.data.drives.forEach(d => {
        console.log(`   - ${d.name} (ID: ${d.id})`);
      });
    } else {
      console.log('   (No shared drives found)');
    }
    console.log('\n💡 Please share a drive with the service account or specify the correct drive name.');
    process.exit(1);
  }

  console.log(`✅ Found drive: "${targetDrive.name}" (ID: ${targetDrive.id})\n`);

  // 3. Create root folder "AI Print Materials"
  console.log('📁 Creating "AI Print Materials" folder...');

  const rootFolder = await drive.files.create({
    requestBody: {
      name: 'AI Print Materials',
      mimeType: 'application/vnd.google-apps.folder',
      parents: [targetDrive.id]
    },
    supportsAllDrives: true,
    fields: 'id, name, webViewLink'
  });

  console.log(`✅ Created: ${rootFolder.data.name}`);
  console.log(`   ID: ${rootFolder.data.id}`);
  console.log(`   Link: ${rootFolder.data.webViewLink}\n`);

  // 4. Create subfolders
  const subfolders = ['Templates', 'Generated', 'Archive', 'config'];
  const folderIds = {
    root: rootFolder.data.id,
    rootLink: rootFolder.data.webViewLink
  };

  for (const folderName of subfolders) {
    console.log(`📁 Creating "${folderName}/" subfolder...`);

    const subfolder = await drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [rootFolder.data.id]
      },
      supportsAllDrives: true,
      fields: 'id, name, webViewLink'
    });

    console.log(`✅ Created: ${subfolder.data.name}`);
    console.log(`   ID: ${subfolder.data.id}\n`);

    folderIds[folderName.toLowerCase()] = subfolder.data.id;
  }

  // 5. Output configuration
  console.log('✅ All folders created successfully!\n');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📋 FOLDER IDS FOR .env CONFIGURATION');
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log('Copy these values to your .env file:\n');
  console.log(`DRIVE_ROOT_FOLDER_ID=${folderIds.root}`);
  console.log(`DRIVE_TEMPLATES_FOLDER_ID=${folderIds.templates}`);
  console.log(`DRIVE_GENERATED_FOLDER_ID=${folderIds.generated}`);
  console.log(`DRIVE_ARCHIVE_FOLDER_ID=${folderIds.archive}`);
  console.log(`DRIVE_CONFIG_FOLDER_ID=${folderIds.config}`);
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🔗 ACCESS THE FOLDERS');
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log(`Root folder: ${folderIds.rootLink}\n`);

  // 6. Save configuration to file
  const configPath = path.join(__dirname, '../drive-folder-config.json');
  fs.writeFileSync(configPath, JSON.stringify(folderIds, null, 2));
  console.log(`💾 Configuration saved to: ${configPath}\n`);

  console.log('✅ Setup complete! Next steps:');
  console.log('   1. Copy the folder IDs above to your .env file');
  console.log('   2. Run: npm run build');
  console.log('   3. Update ~/.claude.json with folder IDs');
  console.log('   4. Restart Claude Code\n');
}

main().catch(error => {
  console.error('\n❌ Error:', error.message);
  if (error.code === 'ENOENT') {
    console.error('\n💡 Could not find service account key file.');
    console.error(`   Expected location: ${SERVICE_ACCOUNT_KEY_PATH}`);
  } else if (error.code === 403) {
    console.error('\n💡 Permission denied. Make sure:');
    console.error('   - Google Drive API is enabled in your Google Cloud project');
    console.error('   - Service account has access to the shared drive');
  } else if (error.code === 404) {
    console.error('\n💡 API not found. Make sure Google Drive API is enabled.');
  }
  process.exit(1);
});

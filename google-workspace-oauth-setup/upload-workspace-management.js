const fs = require('fs').promises;
const path = require('path');
const { google } = require('googleapis');

/**
 * Upload workspace-management to Google Drive
 * Creates folder structure and uploads all documentation
 *
 * Uses SERVICE ACCOUNT for authentication (no user interaction required)
 */

const SCOPES = ['https://www.googleapis.com/auth/drive'];
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');

async function authorize() {
  // Load service account credentials
  const serviceAccount = JSON.parse(await fs.readFile(SERVICE_ACCOUNT_PATH));

  // Create auth client with service account
  const auth = new google.auth.GoogleAuth({
    credentials: serviceAccount,
    scopes: SCOPES
  });

  return auth;
}

async function findSharedDrive(auth, name) {
  const drive = google.drive({ version: 'v3', auth });

  const res = await drive.drives.list({
    pageSize: 100,
  });

  const sharedDrive = res.data.drives.find(d => d.name === name);
  if (!sharedDrive) {
    throw new Error(`Shared Drive "${name}" not found`);
  }

  return sharedDrive.id;
}

async function createFolder(auth, name, parentId, driveId) {
  const drive = google.drive({ version: 'v3', auth });

  // Check if folder already exists
  const existing = await drive.files.list({
    q: `name='${name}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id, name)',
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
    corpora: 'drive',
    driveId: driveId,
  });

  if (existing.data.files.length > 0) {
    console.log(`  Folder "${name}" already exists`);
    return existing.data.files[0].id;
  }

  // Create new folder
  const fileMetadata = {
    name: name,
    mimeType: 'application/vnd.google-apps.folder',
    parents: [parentId],
  };

  const file = await drive.files.create({
    resource: fileMetadata,
    fields: 'id',
    supportsAllDrives: true,
  });

  console.log(`  Created folder: ${name}`);
  return file.data.id;
}

async function uploadFile(auth, localPath, name, parentId, driveId) {
  const drive = google.drive({ version: 'v3', auth });
  const fsSync = require('fs');

  // Check if file already exists
  const existing = await drive.files.list({
    q: `name='${name}' and '${parentId}' in parents and trashed=false`,
    fields: 'files(id, name)',
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
    corpora: 'drive',
    driveId: driveId,
  });

  if (existing.data.files.length > 0) {
    // Update existing file
    await drive.files.update({
      fileId: existing.data.files[0].id,
      media: {
        mimeType: 'text/markdown',
        body: fsSync.createReadStream(localPath),
      },
      supportsAllDrives: true,
    });
    console.log(`  Updated file: ${name}`);
    return existing.data.files[0].id;
  }

  // Upload new file
  const fileMetadata = {
    name: name,
    parents: [parentId],
  };

  const media = {
    mimeType: 'text/markdown',
    body: fsSync.createReadStream(localPath),
  };

  const file = await drive.files.create({
    resource: fileMetadata,
    media: media,
    fields: 'id',
    supportsAllDrives: true,
  });

  console.log(`  Uploaded file: ${name}`);
  return file.data.id;
}

async function main() {
  console.log('========================================');
  console.log('Uploading workspace-management to Google Drive');
  console.log('Using SERVICE ACCOUNT Authentication');
  console.log('========================================\n');

  const auth = await authorize();
  console.log('✓ Authenticated with service account\n');

  // Find AI Development - No PHI shared drive
  console.log('Finding "AI Development - No PHI" shared drive...');
  const driveId = await findSharedDrive(auth, 'AI Development - No PHI');
  console.log(`✓ Found drive ID: ${driveId}\n`);

  // Create workspace-management folder structure
  console.log('Creating folder structure...');
  const workspaceMgmtId = await createFolder(auth, 'workspace-management', driveId, driveId);

  const systemDocsId = await createFolder(auth, '00-system-documentation', workspaceMgmtId, driveId);
  const eventLogsId = await createFolder(auth, '01-event-logs', workspaceMgmtId, driveId);
  const backupsId = await createFolder(auth, '02-backups', workspaceMgmtId, driveId);
  const automationId = await createFolder(auth, '03-automation', workspaceMgmtId, driveId);
  const templatesId = await createFolder(auth, '04-setup-templates', workspaceMgmtId, driveId);

  // Create backup subfolders
  await createFolder(auth, 'operations-workspace', backupsId, driveId);
  await createFolder(auth, 'mcp-infrastructure', backupsId, driveId);
  await createFolder(auth, 'medical-patient-data-code-only', backupsId, driveId);

  console.log('✓ Folder structure created\n');

  // Upload documentation files
  console.log('Uploading documentation files...');
  const localWorkspaceMgmt = '/Users/mmaruthurnew/Desktop/operations-workspace/workspace-management';
  const files = await fs.readdir(localWorkspaceMgmt);

  let mdCount = 0;
  for (const file of files) {
    if (file.endsWith('.md')) {
      await uploadFile(
        auth,
        path.join(localWorkspaceMgmt, file),
        file,
        systemDocsId,
        driveId
      );
      mdCount++;
    }
  }
  console.log(`✓ Uploaded ${mdCount} documentation files\n`);

  // Upload Apps Script file
  console.log('Uploading automation files...');
  const gsFile = path.join(localWorkspaceMgmt, 'Event-Logging-Automation.gs');
  if (await fs.access(gsFile).then(() => true).catch(() => false)) {
    await uploadFile(
      auth,
      gsFile,
      'Event-Logging-Automation.gs',
      automationId,
      driveId
    );
    console.log('✓ Uploaded Apps Script file\n');
  }

  // Upload START_HERE.md to drive root
  console.log('Uploading START_HERE.md to drive root...');
  await uploadFile(
    auth,
    path.join(localWorkspaceMgmt, 'START_HERE-GOOGLE-DRIVE.md'),
    'START_HERE.md',
    driveId,
    driveId
  );
  console.log('✓ Uploaded START_HERE.md\n');

  // Upload FILE-INDEX.md to drive root
  console.log('Uploading FILE-INDEX.md to drive root...');
  await uploadFile(
    auth,
    path.join(localWorkspaceMgmt, 'FILE-INDEX.md'),
    'FILE-INDEX.md',
    driveId,
    driveId
  );
  console.log('✓ Uploaded FILE-INDEX.md\n');

  console.log('========================================');
  console.log('✓ Upload complete!');
  console.log('========================================\n');
  console.log('All files uploaded to:');
  console.log('Google Drive > Shared drives > AI Development - No PHI > workspace-management/\n');
  console.log('Visit: https://drive.google.com/drive/folders/' + workspaceMgmtId);
}

main().catch(console.error);

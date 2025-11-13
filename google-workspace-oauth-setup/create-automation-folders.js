#!/usr/bin/env node

/**
 * Create Drive folders for Claude automation system
 */

const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

// Configuration
const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'service-account.json');
const SHARED_DRIVE_ID = '0AFSsMrTVhqWuUk9PVA'; // AI Development - No PHI

async function createAutomationFolders() {
  console.log('🚀 Creating Claude automation folders in Google Drive...\n');

  // Authenticate
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });

  const authClient = await auth.getClient();
  const drive = google.drive({ version: 'v3', auth: authClient });

  // Helper function to find folder by name
  async function findFolder(name, parentId) {
    const response = await drive.files.list({
      q: `name='${name}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      fields: 'files(id, name)',
    });
    return response.data.files[0];
  }

  // Helper function to create folder
  async function createFolder(name, parentId) {
    console.log(`📁 Creating folder: ${name}...`);
    const response = await drive.files.create({
      supportsAllDrives: true,
      requestBody: {
        name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentId],
      },
      fields: 'id, name, webViewLink',
    });
    console.log(`   ✅ Created: ${response.data.webViewLink}`);
    return response.data;
  }

  try {
    // Step 1: Find or create workspace-management folder
    let workspaceMgmt = await findFolder('workspace-management', SHARED_DRIVE_ID);
    if (!workspaceMgmt) {
      workspaceMgmt = await createFolder('workspace-management', SHARED_DRIVE_ID);
    } else {
      console.log(`✅ Found workspace-management folder: ${workspaceMgmt.id}`);
    }

    // Step 2: Find or create 03-automation folder
    let automationFolder = await findFolder('03-automation', workspaceMgmt.id);
    if (!automationFolder) {
      automationFolder = await createFolder('03-automation', workspaceMgmt.id);
    } else {
      console.log(`✅ Found 03-automation folder: ${automationFolder.id}`);
    }

    // Step 3: Create claude-automation folder
    let claudeAutomation = await findFolder('claude-automation', automationFolder.id);
    if (!claudeAutomation) {
      claudeAutomation = await createFolder('claude-automation', automationFolder.id);
    } else {
      console.log(`✅ Found claude-automation folder: ${claudeAutomation.id}`);
    }

    // Step 4: Create prompts and responses folders
    let promptsFolder = await findFolder('prompts', claudeAutomation.id);
    if (!promptsFolder) {
      promptsFolder = await createFolder('prompts', claudeAutomation.id);
    } else {
      console.log(`✅ Found prompts folder: ${promptsFolder.id}`);
    }

    let responsesFolder = await findFolder('responses', claudeAutomation.id);
    if (!responsesFolder) {
      responsesFolder = await createFolder('responses', claudeAutomation.id);
    } else {
      console.log(`✅ Found responses folder: ${responsesFolder.id}`);
    }

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('✅ SUCCESS! Automation folders created!');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('📁 Folder Structure:');
    console.log('   AI Development - No PHI/');
    console.log('   └── workspace-management/');
    console.log('       └── 03-automation/');
    console.log('           └── claude-automation/');
    console.log('               ├── prompts/');
    console.log('               └── responses/\n');

    console.log('📋 Folder IDs (for Apps Script CONFIG):');
    console.log(`   PROMPT_QUEUE_FOLDER_ID: '${promptsFolder.id}'`);
    console.log(`   RESPONSE_QUEUE_FOLDER_ID: '${responsesFolder.id}'\n`);

    console.log('📝 Next Steps:');
    console.log('   1. Open the Claude Automation Control sheet');
    console.log('   2. Go to Extensions > Apps Script');
    console.log('   3. Update CONFIG section with these folder IDs');
    console.log('   4. Configure Google Drive Desktop to sync these folders\n');

    // Save folder IDs to file
    const folderInfo = {
      workspaceMgmt: { id: workspaceMgmt.id, name: 'workspace-management' },
      automation: { id: automationFolder.id, name: '03-automation' },
      claudeAutomation: { id: claudeAutomation.id, name: 'claude-automation' },
      prompts: { id: promptsFolder.id, name: 'prompts' },
      responses: { id: responsesFolder.id, name: 'responses' },
      createdAt: new Date().toISOString(),
    };

    const infoFile = path.join(__dirname, '../automation/FOLDER-IDS.json');
    fs.writeFileSync(infoFile, JSON.stringify(folderInfo, null, 2));
    console.log(`💾 Folder IDs saved to: ${infoFile}\n`);

    console.log('═══════════════════════════════════════════════════════════\n');
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

createAutomationFolders().catch((error) => {
  console.error('Failed to create folders:', error);
  process.exit(1);
});

#!/usr/bin/env node

/**
 * Pull Apps Script Code Using Service Account
 *
 * Uses Google Apps Script API directly with service account authentication
 * to download Apps Script files, bypassing clasp OAuth issues.
 *
 * Usage:
 *   node pull-apps-script-with-service-account.js <scriptId> <outputDir>
 */

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

/**
 * Initialize Google Apps Script API with service account
 */
async function initializeScriptAPI() {
  const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (!keyPath) {
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS environment variable not set');
  }

  if (!fs.existsSync(keyPath)) {
    throw new Error(`Service account key file not found: ${keyPath}`);
  }

  const credentials = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

  const auth = new google.auth.GoogleAuth({
    credentials: credentials,
    scopes: [
      'https://www.googleapis.com/auth/script.projects.readonly',
      'https://www.googleapis.com/auth/script.projects'
    ]
  });

  const authClient = await auth.getClient();
  return google.script({ version: 'v1', auth: authClient });
}

/**
 * Pull Apps Script project files
 */
async function pullScriptFiles(scriptId, outputDir) {
  console.log(`📥 Pulling Apps Script files...`);
  console.log(`   Script ID: ${scriptId}`);
  console.log(`   Output: ${outputDir}\n`);

  const script = await initializeScriptAPI();

  try {
    // Get project content
    const response = await script.projects.getContent({
      scriptId: scriptId
    });

    const files = response.data.files || [];
    console.log(`   Found ${files.length} files\n`);

    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Save each file
    let savedCount = 0;
    for (const file of files) {
      const fileName = file.name;
      const extension = file.type === 'SERVER_JS' ? 'js' :
                       file.type === 'HTML' ? 'html' :
                       file.type === 'JSON' ? 'json' : 'gs';

      const fullFileName = fileName.includes('.') ? fileName : `${fileName}.${extension}`;
      const filePath = path.join(outputDir, fullFileName);

      console.log(`   ✅ ${fullFileName}`);
      fs.writeFileSync(filePath, file.source || '');
      savedCount++;
    }

    console.log(`\n✅ Successfully pulled ${savedCount} files`);
    return { success: true, fileCount: savedCount };

  } catch (error) {
    if (error.code === 404) {
      throw new Error(`Script not found: ${scriptId}`);
    } else if (error.code === 403) {
      throw new Error(`Permission denied. Service account may not have access to this script.`);
    } else {
      throw error;
    }
  }
}

async function main() {
  if (process.argv.length < 4) {
    console.error('Usage: node pull-apps-script-with-service-account.js <scriptId> <outputDir>');
    process.exit(1);
  }

  const scriptId = process.argv[2];
  const outputDir = process.argv[3];

  try {
    console.log('🔐 Using service account authentication\n');
    await pullScriptFiles(scriptId, outputDir);
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    process.exit(1);
  }
}

main();

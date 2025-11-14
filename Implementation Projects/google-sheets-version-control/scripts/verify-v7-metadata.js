#!/usr/bin/env node

/**
 * V7 Metadata Verification Script
 *
 * Purpose: Verify that V7 metadata extraction is working for all 204 PROD sheets
 *
 * Checks:
 * 1. How many metadata JSON files exist in shared folder
 * 2. Which PROD sheets have metadata files
 * 3. Which PROD sheets are missing metadata files
 * 4. Metadata file timestamps (freshness check)
 *
 * Shared Folder ID: 1QYoR0ubEzTl-Y9RMhj0Ly2YU9vMSpRMO
 */

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const SHARED_FOLDER_ID = '1QYoR0ubEzTl-Y9RMhj0Ly2YU9vMSpRMO';
const TOKEN_PATH = '/Users/mmaruthurnew/Desktop/medical-patient-data/google-workspace-oauth-setup/token.json';
const CREDENTIALS_PATH = '/Users/mmaruthurnew/Desktop/medical-patient-data/google-workspace-oauth-setup/credentials.json';
const REGISTRY_PATH = path.join(__dirname, '..', 'config', 'sheet-registry.json');
const PRODUCTION_DIR = path.join(__dirname, '..', 'production-sheets');

async function loadGoogleAuth() {
  try {
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));

    const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    oAuth2Client.setCredentials(token);

    return oAuth2Client;
  } catch (error) {
    console.error('Error loading authentication:', error.message);
    throw error;
  }
}

function loadRegistry() {
  try {
    const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
    return registry.sheets || [];
  } catch (error) {
    console.error('Error loading registry:', error.message);
    return [];
  }
}

function getProductionSheets() {
  const dirs = fs.readdirSync(PRODUCTION_DIR)
    .filter(dir => dir.startsWith('sheet-') && dir.includes('_PROD--'))
    .filter(dir => {
      const fullPath = path.join(PRODUCTION_DIR, dir);
      return fs.statSync(fullPath).isDirectory();
    });

  return dirs.map(dir => {
    const match = dir.match(/^sheet-(\d+)_PROD--(.+)$/);
    if (!match) return null;

    const serial = parseInt(match[1]);
    const name = match[2];

    // Try to get registry ID from metadata
    const metadataFile = path.join(PRODUCTION_DIR, dir, 'metadata', 'registry-id.txt');
    let registryId = null;
    if (fs.existsSync(metadataFile)) {
      registryId = fs.readFileSync(metadataFile, 'utf8').trim();
    }

    return {
      serial,
      name,
      dirName: dir,
      registryId
    };
  }).filter(Boolean);
}

async function listMetadataFiles(auth) {
  const drive = google.drive({ version: 'v3', auth });

  try {
    console.log(`Listing files in shared folder: ${SHARED_FOLDER_ID}`);

    const response = await drive.files.list({
      q: `'${SHARED_FOLDER_ID}' in parents and name contains 'metadata_v7.json' and trashed = false`,
      fields: 'files(id, name, modifiedTime, size)',
      pageSize: 1000
    });

    return response.data.files || [];
  } catch (error) {
    console.error('Error listing metadata files:', error.message);
    throw error;
  }
}

function parseMetadataFileName(fileName) {
  // Expected format: {projectId}_metadata_v7.json
  // Examples: D25-266_metadata_v7.json, S25-415_metadata_v7.json
  const match = fileName.match(/^([DPS](?:RS)?25-\d{3,4})_metadata_v7\.json$/);
  if (!match) return null;

  return match[1]; // Return project ID
}

async function main() {
  console.log('='.repeat(80));
  console.log('V7 METADATA VERIFICATION');
  console.log('='.repeat(80));
  console.log('');

  // Load authentication
  console.log('Loading Google Drive authentication...');
  const auth = await loadGoogleAuth();
  console.log('✓ Authentication loaded');
  console.log('');

  // Get production sheets
  console.log('Scanning production sheets...');
  const prodSheets = getProductionSheets();
  console.log(`✓ Found ${prodSheets.length} PROD sheets`);
  console.log('');

  // List metadata files
  console.log('Querying shared folder for metadata files...');
  const metadataFiles = await listMetadataFiles(auth);
  console.log(`✓ Found ${metadataFiles.length} metadata files`);
  console.log('');

  // Parse metadata file names to extract project IDs
  const metadataProjectIds = new Set();
  const metadataFileMap = {};

  metadataFiles.forEach(file => {
    const projectId = parseMetadataFileName(file.name);
    if (projectId) {
      metadataProjectIds.add(projectId);
      metadataFileMap[projectId] = file;
    }
  });

  console.log(`✓ Parsed ${metadataProjectIds.size} valid project IDs from metadata files`);
  console.log('');

  // Match PROD sheets with metadata files
  console.log('-'.repeat(80));
  console.log('MATCHING PROD SHEETS WITH METADATA FILES');
  console.log('-'.repeat(80));

  const sheetsWithMetadata = [];
  const sheetsMissingMetadata = [];

  prodSheets.forEach(sheet => {
    if (!sheet.registryId) {
      sheetsMissingMetadata.push({
        ...sheet,
        reason: 'No registry ID found in metadata/registry-id.txt'
      });
      return;
    }

    if (metadataProjectIds.has(sheet.registryId)) {
      const file = metadataFileMap[sheet.registryId];
      sheetsWithMetadata.push({
        ...sheet,
        metadataFile: file.name,
        lastModified: file.modifiedTime,
        fileSize: file.size
      });
    } else {
      sheetsMissingMetadata.push({
        ...sheet,
        reason: 'Metadata file not found in shared folder'
      });
    }
  });

  console.log(`✓ Sheets with metadata: ${sheetsWithMetadata.length}`);
  console.log(`✗ Sheets missing metadata: ${sheetsMissingMetadata.length}`);
  console.log('');

  // Show freshness statistics
  if (sheetsWithMetadata.length > 0) {
    console.log('-'.repeat(80));
    console.log('METADATA FRESHNESS');
    console.log('-'.repeat(80));

    const now = new Date();
    const ageCategories = {
      recent: 0,      // < 7 days
      moderate: 0,    // 7-30 days
      old: 0,         // 30-90 days
      stale: 0        // > 90 days
    };

    sheetsWithMetadata.forEach(sheet => {
      const lastModified = new Date(sheet.lastModified);
      const ageInDays = (now - lastModified) / (1000 * 60 * 60 * 24);

      if (ageInDays < 7) ageCategories.recent++;
      else if (ageInDays < 30) ageCategories.moderate++;
      else if (ageInDays < 90) ageCategories.old++;
      else ageCategories.stale++;
    });

    console.log(`Recent (< 7 days):     ${ageCategories.recent}`);
    console.log(`Moderate (7-30 days):  ${ageCategories.moderate}`);
    console.log(`Old (30-90 days):      ${ageCategories.old}`);
    console.log(`Stale (> 90 days):     ${ageCategories.stale}`);
    console.log('');
  }

  // List sheets missing metadata
  if (sheetsMissingMetadata.length > 0) {
    console.log('-'.repeat(80));
    console.log('SHEETS MISSING METADATA');
    console.log('-'.repeat(80));

    sheetsMissingMetadata.forEach(sheet => {
      console.log(`Serial ${String(sheet.serial).padStart(3, '0')}: ${sheet.registryId || '(no registry ID)'}`);
      console.log(`  Name: ${sheet.name}`);
      console.log(`  Reason: ${sheet.reason}`);
      console.log('');
    });
  }

  // Summary
  console.log('='.repeat(80));
  console.log('SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total PROD sheets:           ${prodSheets.length}`);
  console.log(`Sheets with metadata:        ${sheetsWithMetadata.length}`);
  console.log(`Sheets missing metadata:     ${sheetsMissingMetadata.length}`);
  console.log(`Metadata files in folder:    ${metadataFiles.length}`);
  console.log(`Coverage:                    ${((sheetsWithMetadata.length / prodSheets.length) * 100).toFixed(1)}%`);
  console.log('');

  if (sheetsMissingMetadata.length === 0) {
    console.log('✅ SUCCESS: All PROD sheets have V7 metadata!');
  } else {
    console.log(`⚠️  WARNING: ${sheetsMissingMetadata.length} sheets are missing metadata`);
  }

  console.log('='.repeat(80));

  // Return results for potential scripting
  return {
    total: prodSheets.length,
    withMetadata: sheetsWithMetadata.length,
    missingMetadata: sheetsMissingMetadata.length,
    sheetsWithMetadata,
    sheetsMissingMetadata
  };
}

// Run the script
main()
  .then(results => {
    process.exit(results.missingMetadata === 0 ? 0 : 1);
  })
  .catch(error => {
    console.error('FATAL ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  });

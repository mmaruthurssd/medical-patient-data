#!/usr/bin/env node

/**
 * Sheet Registry Unification Script
 *
 * Purpose: Merge existing GitHub registry (237 sheets) with newly discovered sheets
 *          into single unified registry.
 *
 * Usage:
 *   node scripts/unify-registries.js [--dry-run] [--interactive]
 *
 * Inputs:
 *   - GitHub registry: ~/Desktop/ssd-google-sheets-staging-production/config/sheet-registry.json
 *   - New sheets scan: Will scan all Shared Drives for additional sheets
 *
 * Output:
 *   - Unified registry: config/sheet-registry-unified.json
 *   - Conflict report: config/unification-report.json
 *   - Backup of original: config/sheet-registry-github-backup.json
 *
 * Project: Google Workspace Automation Infrastructure
 * Created: 2025-11-08
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { google } from 'googleapis';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// Configuration
// ============================================================================

const CONFIG = {
  // GitHub registry location (existing)
  githubRegistryPath: path.join(
    process.env.HOME,
    'Desktop/ssd-google-sheets-staging-production/config/sheet-registry.json'
  ),

  // Output paths
  unifiedRegistryPath: path.join(__dirname, '../config/sheet-registry-unified.json'),
  backupPath: path.join(__dirname, '../config/sheet-registry-github-backup.json'),
  reportPath: path.join(__dirname, '../config/unification-report.json'),

  // OAuth credentials
  credentialsPath: process.env.GOOGLE_CREDENTIALS_PATH || path.join(__dirname, '../credentials.json'),
  tokenPath: process.env.GOOGLE_TOKEN_PATH || path.join(__dirname, '../token.json'),

  // Shared Drive flags
  sharedDriveFlags: {
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
    corpora: 'allDrives'
  }
};

// ============================================================================
// CLI Arguments
// ============================================================================

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const INTERACTIVE = args.includes('--interactive');

// ============================================================================
// Registry Schema
// ============================================================================

/**
 * Expected registry entry structure:
 * {
 *   "name": "D25-264_Prior_Auth_V3",
 *   "spreadsheetId": "1abc...",
 *   "scriptId": "xyz...",
 *   "driveId": "0abc...",
 *   "driveName": "Prior Authorization Shared Drive",
 *   "lastModified": "2025-11-08T10:30:00Z",
 *   "tags": ["prior-auth", "v3"],
 *   "notes": "Version 3 of Prior Auth workflow",
 *   "owner": "automation@ssdsbc.com",
 *   "source": "github|scan|manual"
 * }
 */

// ============================================================================
// Authentication
// ============================================================================

/**
 * Authenticate with Google Workspace APIs
 */
async function authenticate() {
  console.log('🔐 Authenticating with Google Workspace...');

  const credentials = JSON.parse(fs.readFileSync(CONFIG.credentialsPath, 'utf8'));
  const token = JSON.parse(fs.readFileSync(CONFIG.tokenPath, 'utf8'));

  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  oAuth2Client.setCredentials(token);

  console.log('✅ Authentication successful');
  return oAuth2Client;
}

// ============================================================================
// Registry Loading
// ============================================================================

/**
 * Load GitHub registry (existing)
 */
function loadGitHubRegistry() {
  console.log('📂 Loading GitHub registry...');

  if (!fs.existsSync(CONFIG.githubRegistryPath)) {
    console.error(`❌ GitHub registry not found: ${CONFIG.githubRegistryPath}`);
    console.error('   Please ensure GitHub version control system is set up.');
    process.exit(1);
  }

  const data = fs.readFileSync(CONFIG.githubRegistryPath, 'utf8');
  const registry = JSON.parse(data);

  console.log(`✅ Loaded ${registry.length} sheets from GitHub registry`);

  // Add source field
  registry.forEach(entry => {
    entry.source = 'github';
  });

  return registry;
}

/**
 * Create backup of GitHub registry
 */
function backupGitHubRegistry(registry) {
  console.log('💾 Creating backup of GitHub registry...');

  const backupDir = path.dirname(CONFIG.backupPath);
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  fs.writeFileSync(CONFIG.backupPath, JSON.stringify(registry, null, 2));

  console.log(`✅ Backup saved: ${CONFIG.backupPath}`);
}

// ============================================================================
// Drive Scanning
// ============================================================================

/**
 * Scan all Shared Drives for spreadsheets
 */
async function scanSharedDrives(auth) {
  console.log('🔍 Scanning all Shared Drives for spreadsheets...');

  const drive = google.drive({ version: 'v3', auth });

  // Step 1: List all Shared Drives
  const drivesResponse = await drive.drives.list({
    pageSize: 100,
    fields: 'drives(id, name)'
  });

  const drives = drivesResponse.data.drives || [];
  console.log(`   Found ${drives.length} Shared Drives`);

  // Step 2: Scan each drive for spreadsheets
  const allSheets = [];

  for (const driveInfo of drives) {
    console.log(`   Scanning: ${driveInfo.name}...`);

    try {
      const filesResponse = await drive.files.list({
        q: "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false",
        driveId: driveInfo.id,
        corpora: 'drive',
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
        fields: 'files(id, name, modifiedTime, owners)',
        pageSize: 100
      });

      const files = filesResponse.data.files || [];

      for (const file of files) {
        // Get script ID if container-bound script exists
        let scriptId = null;
        try {
          const script = await getContainerBoundScript(auth, file.id);
          scriptId = script?.scriptId || null;
        } catch (error) {
          // No script attached to this spreadsheet
          scriptId = null;
        }

        allSheets.push({
          name: file.name,
          spreadsheetId: file.id,
          scriptId: scriptId,
          driveId: driveInfo.id,
          driveName: driveInfo.name,
          lastModified: file.modifiedTime,
          tags: [],
          notes: '',
          owner: file.owners?.[0]?.emailAddress || 'unknown',
          source: 'scan'
        });
      }

      console.log(`      Found ${files.length} spreadsheets`);

    } catch (error) {
      console.error(`      ⚠️  Error scanning ${driveInfo.name}: ${error.message}`);
    }
  }

  console.log(`✅ Scan complete: ${allSheets.length} total spreadsheets found`);
  return allSheets;
}

/**
 * Get container-bound script ID for a spreadsheet
 */
async function getContainerBoundScript(auth, spreadsheetId) {
  const script = google.script({ version: 'v1', auth });

  try {
    // List all projects to find one bound to this spreadsheet
    const response = await script.projects.list({
      pageSize: 100
    });

    const projects = response.data.projects || [];

    // Find project that matches this spreadsheet
    for (const project of projects) {
      if (project.parentId === spreadsheetId) {
        return {
          scriptId: project.scriptId,
          title: project.title
        };
      }
    }

    return null;

  } catch (error) {
    // Apps Script API may not be enabled or no script exists
    return null;
  }
}

// ============================================================================
// Duplicate Detection
// ============================================================================

/**
 * Find duplicates between GitHub registry and scanned sheets
 */
function findDuplicates(githubRegistry, scannedSheets) {
  console.log('🔍 Detecting duplicates...');

  const duplicates = [];
  const githubMap = new Map();

  // Create lookup map from GitHub registry
  githubRegistry.forEach(entry => {
    githubMap.set(entry.spreadsheetId, entry);
  });

  // Check each scanned sheet against GitHub registry
  for (const scanned of scannedSheets) {
    const existing = githubMap.get(scanned.spreadsheetId);

    if (existing) {
      duplicates.push({
        spreadsheetId: scanned.spreadsheetId,
        name: scanned.name,
        github: existing,
        scanned: scanned,
        conflict: detectConflict(existing, scanned)
      });
    }
  }

  console.log(`   Found ${duplicates.length} duplicates`);
  return duplicates;
}

/**
 * Detect conflicts between two registry entries
 */
function detectConflict(github, scanned) {
  const conflicts = [];

  if (github.name !== scanned.name) {
    conflicts.push({
      field: 'name',
      github: github.name,
      scanned: scanned.name
    });
  }

  if (github.scriptId !== scanned.scriptId) {
    conflicts.push({
      field: 'scriptId',
      github: github.scriptId,
      scanned: scanned.scriptId
    });
  }

  if (github.driveId !== scanned.driveId) {
    conflicts.push({
      field: 'driveId',
      github: github.driveId,
      scanned: scanned.driveId
    });
  }

  return conflicts;
}

// ============================================================================
// Conflict Resolution
// ============================================================================

/**
 * Resolve conflicts interactively or automatically
 */
async function resolveConflicts(duplicates) {
  console.log('🔧 Resolving conflicts...');

  const resolutions = [];

  if (INTERACTIVE) {
    // Interactive conflict resolution
    for (const dup of duplicates) {
      if (dup.conflict.length > 0) {
        const resolution = await interactiveResolve(dup);
        resolutions.push(resolution);
      } else {
        // No conflict - prefer GitHub entry (has more metadata)
        resolutions.push({
          spreadsheetId: dup.spreadsheetId,
          action: 'keep-github',
          entry: dup.github
        });
      }
    }

  } else {
    // Automatic conflict resolution (prefer GitHub registry)
    for (const dup of duplicates) {
      resolutions.push({
        spreadsheetId: dup.spreadsheetId,
        action: 'keep-github',
        entry: dup.github,
        conflicts: dup.conflict.length,
        reason: 'Auto-resolved: Prefer GitHub registry (has proven data)'
      });
    }
  }

  console.log(`✅ Resolved ${resolutions.length} conflicts`);
  return resolutions;
}

/**
 * Interactive conflict resolution (CLI prompts)
 */
async function interactiveResolve(duplicate) {
  console.log(`\n📋 Conflict detected for: ${duplicate.name}`);
  console.log(`   Spreadsheet ID: ${duplicate.spreadsheetId}`);
  console.log(`\n   Conflicts:`);

  duplicate.conflict.forEach(c => {
    console.log(`      ${c.field}:`);
    console.log(`         GitHub:  ${c.github}`);
    console.log(`         Scanned: ${c.scanned}`);
  });

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const answer = await new Promise(resolve => {
    rl.question('\n   Choose: (g)ithub, (s)canned, (m)erge, (skip): ', resolve);
  });

  rl.close();

  if (answer === 'g' || answer === 'github') {
    return {
      spreadsheetId: duplicate.spreadsheetId,
      action: 'keep-github',
      entry: duplicate.github
    };
  } else if (answer === 's' || answer === 'scanned') {
    return {
      spreadsheetId: duplicate.spreadsheetId,
      action: 'keep-scanned',
      entry: duplicate.scanned
    };
  } else if (answer === 'm' || answer === 'merge') {
    return {
      spreadsheetId: duplicate.spreadsheetId,
      action: 'merge',
      entry: mergeEntries(duplicate.github, duplicate.scanned)
    };
  } else {
    return {
      spreadsheetId: duplicate.spreadsheetId,
      action: 'skip',
      entry: null
    };
  }
}

/**
 * Merge two registry entries intelligently
 */
function mergeEntries(github, scanned) {
  return {
    name: github.name || scanned.name,
    spreadsheetId: github.spreadsheetId,
    scriptId: github.scriptId || scanned.scriptId,
    driveId: github.driveId || scanned.driveId,
    driveName: github.driveName || scanned.driveName,
    lastModified: scanned.lastModified, // Use latest timestamp
    tags: [...new Set([...(github.tags || []), ...(scanned.tags || [])])],
    notes: github.notes || scanned.notes,
    owner: github.owner || scanned.owner,
    source: 'merged'
  };
}

// ============================================================================
// Registry Unification
// ============================================================================

/**
 * Merge all registries into unified registry
 */
function unifyRegistries(githubRegistry, scannedSheets, resolutions) {
  console.log('🔀 Unifying registries...');

  const unified = [];
  const includedIds = new Set();

  // Step 1: Add resolved entries
  for (const resolution of resolutions) {
    if (resolution.action !== 'skip' && resolution.entry) {
      unified.push(resolution.entry);
      includedIds.add(resolution.spreadsheetId);
    }
  }

  // Step 2: Add GitHub entries that weren't duplicates
  for (const entry of githubRegistry) {
    if (!includedIds.has(entry.spreadsheetId)) {
      unified.push(entry);
      includedIds.add(entry.spreadsheetId);
    }
  }

  // Step 3: Add scanned entries that weren't duplicates
  for (const entry of scannedSheets) {
    if (!includedIds.has(entry.spreadsheetId)) {
      unified.push(entry);
      includedIds.add(entry.spreadsheetId);
    }
  }

  // Sort by name
  unified.sort((a, b) => a.name.localeCompare(b.name));

  console.log(`✅ Unified registry: ${unified.length} total sheets`);
  console.log(`   GitHub only: ${githubRegistry.length - resolutions.length}`);
  console.log(`   Scanned only: ${scannedSheets.length - resolutions.length}`);
  console.log(`   Duplicates resolved: ${resolutions.length}`);

  return unified;
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Validate unified registry
 */
function validateRegistry(registry) {
  console.log('✅ Validating unified registry...');

  const errors = [];
  const warnings = [];

  // Check for required fields
  for (let i = 0; i < registry.length; i++) {
    const entry = registry[i];

    if (!entry.name) {
      errors.push(`Entry ${i}: Missing 'name'`);
    }

    if (!entry.spreadsheetId) {
      errors.push(`Entry ${i}: Missing 'spreadsheetId'`);
    }

    if (!entry.driveId) {
      warnings.push(`Entry ${i} (${entry.name}): Missing 'driveId'`);
    }

    if (!entry.scriptId) {
      warnings.push(`Entry ${i} (${entry.name}): Missing 'scriptId' - no Apps Script attached?`);
    }
  }

  // Check for duplicate spreadsheet IDs
  const idCounts = new Map();
  registry.forEach(entry => {
    const count = idCounts.get(entry.spreadsheetId) || 0;
    idCounts.set(entry.spreadsheetId, count + 1);
  });

  for (const [id, count] of idCounts) {
    if (count > 1) {
      errors.push(`Duplicate spreadsheetId found ${count} times: ${id}`);
    }
  }

  // Report results
  if (errors.length > 0) {
    console.error(`\n❌ Validation failed with ${errors.length} errors:`);
    errors.forEach(e => console.error(`   - ${e}`));
    return false;
  }

  if (warnings.length > 0) {
    console.warn(`\n⚠️  ${warnings.length} warnings:`);
    warnings.forEach(w => console.warn(`   - ${w}`));
  }

  console.log(`✅ Validation passed`);
  return true;
}

// ============================================================================
// Reporting
// ============================================================================

/**
 * Generate unification report
 */
function generateReport(githubRegistry, scannedSheets, duplicates, resolutions, unifiedRegistry) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      githubCount: githubRegistry.length,
      scannedCount: scannedSheets.length,
      duplicatesFound: duplicates.length,
      conflictsResolved: resolutions.length,
      unifiedCount: unifiedRegistry.length,
      newSheetsAdded: unifiedRegistry.length - githubRegistry.length,
      discrepancy: {
        expected: 240,
        actual: unifiedRegistry.length,
        missing: Math.max(0, 240 - unifiedRegistry.length)
      }
    },
    duplicates: duplicates.map(dup => ({
      spreadsheetId: dup.spreadsheetId,
      name: dup.name,
      conflictCount: dup.conflict.length,
      conflicts: dup.conflict
    })),
    resolutions: resolutions.map(res => ({
      spreadsheetId: res.spreadsheetId,
      action: res.action,
      reason: res.reason || 'N/A'
    })),
    newSheets: unifiedRegistry
      .filter(entry => entry.source === 'scan')
      .map(entry => ({
        name: entry.name,
        spreadsheetId: entry.spreadsheetId,
        driveName: entry.driveName
      })),
    validation: {
      passed: validateRegistry(unifiedRegistry),
      totalEntries: unifiedRegistry.length,
      missingScriptIds: unifiedRegistry.filter(e => !e.scriptId).length
    }
  };

  return report;
}

// ============================================================================
// Output
// ============================================================================

/**
 * Save unified registry to file
 */
function saveUnifiedRegistry(registry) {
  console.log('💾 Saving unified registry...');

  const outputDir = path.dirname(CONFIG.unifiedRegistryPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  if (DRY_RUN) {
    console.log('   [DRY RUN] Would save to:', CONFIG.unifiedRegistryPath);
    console.log('   [DRY RUN] Preview (first 5 entries):');
    console.log(JSON.stringify(registry.slice(0, 5), null, 2));
  } else {
    fs.writeFileSync(CONFIG.unifiedRegistryPath, JSON.stringify(registry, null, 2));
    console.log(`✅ Saved: ${CONFIG.unifiedRegistryPath}`);
  }
}

/**
 * Save unification report
 */
function saveReport(report) {
  console.log('📊 Saving unification report...');

  if (DRY_RUN) {
    console.log('   [DRY RUN] Would save to:', CONFIG.reportPath);
    console.log('   [DRY RUN] Report summary:');
    console.log(JSON.stringify(report.summary, null, 2));
  } else {
    fs.writeFileSync(CONFIG.reportPath, JSON.stringify(report, null, 2));
    console.log(`✅ Saved: ${CONFIG.reportPath}`);
  }
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  console.log('==========================================');
  console.log('  Sheet Registry Unification Script');
  console.log('==========================================\n');

  if (DRY_RUN) {
    console.log('🔍 DRY RUN MODE - No files will be modified\n');
  }

  if (INTERACTIVE) {
    console.log('🤝 INTERACTIVE MODE - You will be prompted for conflict resolution\n');
  }

  try {
    // Step 1: Load GitHub registry
    const githubRegistry = loadGitHubRegistry();
    backupGitHubRegistry(githubRegistry);

    // Step 2: Authenticate with Google Workspace
    const auth = await authenticate();

    // Step 3: Scan Shared Drives
    const scannedSheets = await scanSharedDrives(auth);

    // Step 4: Find duplicates
    const duplicates = findDuplicates(githubRegistry, scannedSheets);

    // Step 5: Resolve conflicts
    const resolutions = await resolveConflicts(duplicates);

    // Step 6: Unify registries
    const unifiedRegistry = unifyRegistries(githubRegistry, scannedSheets, resolutions);

    // Step 7: Validate
    const isValid = validateRegistry(unifiedRegistry);

    if (!isValid) {
      console.error('\n❌ Validation failed. Please review errors above.');
      process.exit(1);
    }

    // Step 8: Generate report
    const report = generateReport(githubRegistry, scannedSheets, duplicates, resolutions, unifiedRegistry);

    // Step 9: Save outputs
    saveUnifiedRegistry(unifiedRegistry);
    saveReport(report);

    // Summary
    console.log('\n==========================================');
    console.log('  Unification Complete');
    console.log('==========================================\n');

    console.log('📊 Summary:');
    console.log(`   GitHub registry:    ${report.summary.githubCount} sheets`);
    console.log(`   Scanned drives:     ${report.summary.scannedCount} sheets`);
    console.log(`   Duplicates found:   ${report.summary.duplicatesFound} sheets`);
    console.log(`   Unified registry:   ${report.summary.unifiedCount} sheets`);
    console.log(`   New sheets added:   ${report.summary.newSheetsAdded} sheets`);
    console.log();
    console.log('🎯 Discrepancy Analysis:');
    console.log(`   Expected total:     ${report.summary.discrepancy.expected} sheets`);
    console.log(`   Actual total:       ${report.summary.discrepancy.actual} sheets`);
    console.log(`   Missing:            ${report.summary.discrepancy.missing} sheets`);
    console.log();
    console.log('📁 Output Files:');
    console.log(`   Unified registry:   ${CONFIG.unifiedRegistryPath}`);
    console.log(`   Report:             ${CONFIG.reportPath}`);
    console.log(`   GitHub backup:      ${CONFIG.backupPath}`);
    console.log();

    if (report.summary.discrepancy.missing > 0) {
      console.log('⚠️  Note: Registry has fewer sheets than expected (240).');
      console.log('   Review report to identify missing sheets.');
    } else if (report.summary.discrepancy.missing < 0) {
      console.log('✅ Success: Registry has MORE sheets than expected!');
      console.log(`   Found ${Math.abs(report.summary.discrepancy.missing)} additional sheets.`);
    } else {
      console.log('✅ Success: Registry matches expected count (240 sheets).');
    }

    console.log('\n✅ Unification complete!\n');

  } catch (error) {
    console.error('\n❌ Error during unification:');
    console.error(error);
    process.exit(1);
  }
}

// Run main function
main();

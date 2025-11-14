#!/usr/bin/env node

/**
 * Grant Service Account Access to All Production Sheets
 *
 * Automatically shares all production Google Sheets with the service account,
 * eliminating the need for manual sharing of 235 sheets.
 *
 * Prerequisites:
 *   1. Service account key file exists
 *   2. GOOGLE_APPLICATION_CREDENTIALS environment variable set
 *   3. Service account has domain-wide delegation (if using workspace)
 *
 * Usage:
 *   node scripts/grant-service-account-access.js
 *   node scripts/grant-service-account-access.js --dry-run  # Test without making changes
 */

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const CSV_PATH = path.join(__dirname, '../data/production-sheets.csv');
const DRY_RUN = process.argv.includes('--dry-run');

/**
 * Load service account credentials
 */
function loadServiceAccount() {
  const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (!keyPath) {
    console.error('❌ GOOGLE_APPLICATION_CREDENTIALS environment variable not set');
    console.error('');
    console.error('Setup:');
    console.error('  export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"');
    console.error('');
    console.error('Or run:');
    console.error('  ./scripts/setup-service-account-auth.sh /path/to/key.json');
    process.exit(1);
  }

  if (!fs.existsSync(keyPath)) {
    console.error(`❌ Service account key file not found: ${keyPath}`);
    process.exit(1);
  }

  const credentials = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
  return credentials;
}

/**
 * Load production sheets from CSV
 */
function loadProductionSheets() {
  if (!fs.existsSync(CSV_PATH)) {
    console.error(`❌ CSV file not found: ${CSV_PATH}`);
    process.exit(1);
  }

  const csvContent = fs.readFileSync(CSV_PATH, 'utf8');
  const lines = csvContent.split('\n').slice(1).filter(l => l.trim());

  const sheets = lines.map((line, idx) => {
    const match = line.match(/"([^"]+)","([^"]+)","([^"]*)"/);
    if (!match) return null;

    return {
      index: idx + 2, // +2 for header row and 1-indexing
      name: match[1],
      spreadsheetId: match[2],
      scriptId: match[3] || null
    };
  }).filter(Boolean);

  return sheets;
}

/**
 * Initialize Google Drive API
 */
async function initializeDriveAPI(credentials) {
  const auth = new google.auth.GoogleAuth({
    credentials: credentials,
    scopes: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/drive.file'
    ]
  });

  const authClient = await auth.getClient();
  return google.drive({ version: 'v3', auth: authClient });
}

/**
 * Share a sheet with the service account
 */
async function shareSheet(drive, spreadsheetId, serviceAccountEmail, sheetName) {
  try {
    const permission = {
      type: 'user',
      role: 'writer', // Editor permissions
      emailAddress: serviceAccountEmail
    };

    if (DRY_RUN) {
      console.log(`  [DRY RUN] Would share with ${serviceAccountEmail} (writer)`);
      return { success: true, dryRun: true };
    }

    await drive.permissions.create({
      fileId: spreadsheetId,
      requestBody: permission,
      sendNotificationEmail: false, // Don't send email to service account
      supportsAllDrives: true
    });

    return { success: true };

  } catch (error) {
    // If already shared, that's fine
    if (error.code === 409 || error.message?.includes('already has access')) {
      return { success: true, alreadyShared: true };
    }

    return {
      success: false,
      error: error.message,
      code: error.code
    };
  }
}

/**
 * Check if service account already has access
 */
async function checkExistingAccess(drive, spreadsheetId, serviceAccountEmail) {
  try {
    const response = await drive.permissions.list({
      fileId: spreadsheetId,
      fields: 'permissions(id,emailAddress,role)',
      supportsAllDrives: true
    });

    const hasAccess = response.data.permissions?.some(
      p => p.emailAddress === serviceAccountEmail
    );

    return hasAccess;

  } catch (error) {
    // If we can't check permissions, assume no access
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🔐 Service Account Access Grant Tool\n');

  if (DRY_RUN) {
    console.log('🧪 DRY RUN MODE - No changes will be made\n');
  }

  // Load credentials
  console.log('📋 Loading service account credentials...');
  const credentials = loadServiceAccount();
  const serviceAccountEmail = credentials.client_email;
  console.log(`   Service Account: ${serviceAccountEmail}\n`);

  // Load sheets
  console.log('📊 Loading production sheets from CSV...');
  const sheets = loadProductionSheets();
  console.log(`   Found ${sheets.length} sheets\n`);

  // Initialize Drive API
  console.log('🔌 Initializing Google Drive API...');
  const drive = await initializeDriveAPI(credentials);
  console.log('   Connected ✅\n');

  // Process sheets
  console.log('🔄 Granting access to sheets...\n');

  const results = {
    success: 0,
    alreadyShared: 0,
    failed: 0,
    errors: []
  };

  for (let i = 0; i < sheets.length; i++) {
    const sheet = sheets[i];
    const progress = `[${i + 1}/${sheets.length}]`;

    console.log(`${progress} ${sheet.name.substring(0, 60)}...`);

    // Check if already has access
    const hasAccess = await checkExistingAccess(drive, sheet.spreadsheetId, serviceAccountEmail);

    if (hasAccess) {
      console.log(`  ✅ Already has access (skipping)`);
      results.alreadyShared++;
    } else {
      // Grant access
      const result = await shareSheet(drive, sheet.spreadsheetId, serviceAccountEmail, sheet.name);

      if (result.success) {
        if (result.dryRun) {
          console.log(`  ✅ Would grant access`);
        } else if (result.alreadyShared) {
          console.log(`  ✅ Already has access`);
          results.alreadyShared++;
        } else {
          console.log(`  ✅ Access granted`);
          results.success++;
        }
      } else {
        console.log(`  ❌ Failed: ${result.error}`);
        results.failed++;
        results.errors.push({
          sheet: sheet.name,
          error: result.error,
          code: result.code
        });
      }
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  // Print summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 Summary');
  console.log('='.repeat(70));

  if (DRY_RUN) {
    console.log('🧪 DRY RUN - No changes were made');
  }

  console.log(`✅ Successfully granted access: ${results.success}`);
  console.log(`ℹ️  Already had access: ${results.alreadyShared}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📊 Total processed: ${sheets.length}`);

  if (results.errors.length > 0) {
    console.log('\n❌ Failed sheets:');
    results.errors.forEach(({ sheet, error, code }) => {
      console.log(`  - ${sheet.substring(0, 60)}`);
      console.log(`    Error: ${error} (${code})`);
    });
  }

  console.log('='.repeat(70) + '\n');

  if (DRY_RUN) {
    console.log('💡 To execute for real, run without --dry-run flag');
  } else if (results.failed === 0) {
    console.log('✅ All sheets successfully shared with service account!');
    console.log('');
    console.log('🎯 Next Steps:');
    console.log('  1. Test authentication: npx @google/clasp list');
    console.log('  2. Run snapshot for sheet 204');
    console.log('  3. Complete remediation (see REMEDIATION-GUIDE.md)');
  } else {
    console.log('⚠️  Some sheets failed. Review errors above.');
    console.log('');
    console.log('Common issues:');
    console.log('  - Sheet deleted or moved');
    console.log('  - Service account lacks domain-wide delegation');
    console.log('  - Network timeout (try again)');
  }

  process.exit(results.failed > 0 ? 1 : 0);
}

// Run
main().catch(error => {
  console.error('\n❌ Fatal error:', error.message);
  console.error(error.stack);
  process.exit(1);
});

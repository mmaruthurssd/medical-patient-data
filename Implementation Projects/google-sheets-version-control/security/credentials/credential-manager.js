#!/usr/bin/env node

/**
 * Credential Rotation Manager
 * HIPAA-compliant credential tracking and rotation system
 *
 * Usage:
 *   node credential-manager.js status              - Show all credential status
 *   node credential-manager.js check-rotations     - Check for upcoming rotations
 *   node credential-manager.js rotate <id>         - Record credential rotation
 *   node credential-manager.js add-credential      - Add new credential
 *   node credential-manager.js audit-report        - Generate compliance audit report
 */

const fs = require('fs');
const path = require('path');

const INVENTORY_FILE = path.join(__dirname, 'credential-inventory.json');
const LOG_FILE = path.join(__dirname, 'rotation-audit-log.json');

// Load credential inventory
function loadInventory() {
  try {
    const data = fs.readFileSync(INVENTORY_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading credential inventory:', error.message);
    process.exit(1);
  }
}

// Save credential inventory
function saveInventory(inventory) {
  try {
    fs.writeFileSync(INVENTORY_FILE, JSON.stringify(inventory, null, 2), 'utf8');
    console.log('✅ Credential inventory updated');
  } catch (error) {
    console.error('Error saving credential inventory:', error.message);
    process.exit(1);
  }
}

// Load audit log
function loadAuditLog() {
  try {
    if (!fs.existsSync(LOG_FILE)) {
      return { version: '1.0.0', entries: [] };
    }
    const data = fs.readFileSync(LOG_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading audit log:', error.message);
    return { version: '1.0.0', entries: [] };
  }
}

// Save audit log
function saveAuditLog(log) {
  try {
    fs.writeFileSync(LOG_FILE, JSON.stringify(log, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving audit log:', error.message);
  }
}

// Calculate days until rotation
function daysUntilRotation(nextRotationDate) {
  const now = new Date();
  const rotationDate = new Date(nextRotationDate);
  const diffTime = rotationDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// Get status color and symbol
function getStatusIndicator(daysUntil, warningDays, criticalDays) {
  if (daysUntil < 0) {
    return { symbol: '🔴', status: 'OVERDUE', color: 'red' };
  } else if (daysUntil <= criticalDays) {
    return { symbol: '🟠', status: 'CRITICAL', color: 'orange' };
  } else if (daysUntil <= warningDays) {
    return { symbol: '🟡', status: 'WARNING', color: 'yellow' };
  } else {
    return { symbol: '🟢', status: 'OK', color: 'green' };
  }
}

// Show credential status
function showStatus() {
  const inventory = loadInventory();

  console.log('\n═════════════════════════════════════════════════════════════════');
  console.log('  CREDENTIAL ROTATION STATUS - SSD Google Sheets Version Control');
  console.log('═════════════════════════════════════════════════════════════════\n');
  console.log(`Total Credentials: ${inventory.credentials.length}`);
  console.log(`HIPAA Compliance: ${inventory.hipaaCompliance ? '✅ Enabled' : '❌ Disabled'}`);
  console.log(`Last Updated: ${new Date(inventory.lastUpdated).toLocaleString()}\n`);

  let overdue = 0;
  let critical = 0;
  let warning = 0;
  let ok = 0;

  inventory.credentials.forEach((cred) => {
    const daysUntil = daysUntilRotation(cred.rotation.nextRotationDue);
    const indicator = getStatusIndicator(daysUntil, cred.alerting.warningDays, cred.alerting.criticalDays);

    console.log('─────────────────────────────────────────────────────────────────');
    console.log(`${indicator.symbol} ${cred.name} (${cred.id})`);
    console.log(`   Type: ${cred.type}`);
    console.log(`   Status: ${indicator.status} (${daysUntil} days)`);
    console.log(`   Criticality: ${cred.criticality.toUpperCase()}`);
    console.log(`   Last Rotated: ${cred.rotation.lastRotated}`);
    console.log(`   Next Due: ${cred.rotation.nextRotationDue}`);
    console.log(`   Schedule: ${cred.rotation.schedule}`);
    console.log(`   HIPAA Required: ${cred.compliance.hipaaRequired ? 'Yes' : 'No'}`);

    if (indicator.status === 'OVERDUE') overdue++;
    else if (indicator.status === 'CRITICAL') critical++;
    else if (indicator.status === 'WARNING') warning++;
    else ok++;
  });

  console.log('═════════════════════════════════════════════════════════════════');
  console.log('\n📊 SUMMARY:');
  console.log(`   🔴 Overdue:  ${overdue}`);
  console.log(`   🟠 Critical: ${critical} (rotation needed within 7 days)`);
  console.log(`   🟡 Warning:  ${warning} (rotation needed within 30 days)`);
  console.log(`   🟢 OK:       ${ok}\n`);

  if (overdue > 0 || critical > 0) {
    console.log('⚠️  ACTION REQUIRED: Immediate rotation needed for overdue/critical credentials\n');
  }
}

// Check for upcoming rotations
function checkRotations() {
  const inventory = loadInventory();
  const now = new Date();

  console.log('\n═════════════════════════════════════════════════════════════════');
  console.log('  UPCOMING CREDENTIAL ROTATIONS');
  console.log('═════════════════════════════════════════════════════════════════\n');

  const needsRotation = [];

  inventory.credentials.forEach((cred) => {
    const daysUntil = daysUntilRotation(cred.rotation.nextRotationDue);
    const indicator = getStatusIndicator(daysUntil, cred.alerting.warningDays, cred.alerting.criticalDays);

    if (indicator.status !== 'OK') {
      needsRotation.push({
        credential: cred,
        daysUntil,
        indicator
      });
    }
  });

  if (needsRotation.length === 0) {
    console.log('✅ No credentials require rotation at this time.\n');
    return;
  }

  // Sort by urgency (most urgent first)
  needsRotation.sort((a, b) => a.daysUntil - b.daysUntil);

  needsRotation.forEach(({ credential, daysUntil, indicator }) => {
    console.log(`${indicator.symbol} ${credential.name}`);
    console.log(`   ID: ${credential.id}`);
    console.log(`   Status: ${indicator.status}`);
    console.log(`   Days Until Due: ${daysUntil}`);
    console.log(`   Next Due: ${credential.rotation.nextRotationDue}`);
    console.log(`   Criticality: ${credential.criticality.toUpperCase()}`);
    console.log(`   Notify: ${credential.alerting.notificationEmails.join(', ')}`);
    console.log('');
  });

  console.log('═════════════════════════════════════════════════════════════════\n');
}

// Record credential rotation
function recordRotation(credentialId) {
  const inventory = loadInventory();
  const auditLog = loadAuditLog();

  const credential = inventory.credentials.find(c => c.id === credentialId);

  if (!credential) {
    console.error(`❌ Credential not found: ${credentialId}`);
    process.exit(1);
  }

  console.log(`\n🔄 Recording rotation for: ${credential.name}\n`);

  // Calculate next rotation date based on schedule
  const schedule = inventory.rotationSchedules[credential.rotation.schedule];
  const now = new Date();
  const nextRotation = new Date(now);
  nextRotation.setDate(nextRotation.getDate() + schedule.frequencyDays);

  // Update credential rotation info
  const rotationEntry = {
    date: now.toISOString().split('T')[0],
    performedBy: process.env.USER || 'unknown',
    reason: 'Scheduled rotation',
    status: 'success',
    previousDueDate: credential.rotation.nextRotationDue
  };

  credential.rotation.rotationHistory.push(rotationEntry);
  credential.rotation.lastRotated = rotationEntry.date;
  credential.rotation.nextRotationDue = nextRotation.toISOString().split('T')[0];

  // Update inventory timestamp
  inventory.lastUpdated = now.toISOString();

  // Save updated inventory
  saveInventory(inventory);

  // Add to audit log
  auditLog.entries.push({
    timestamp: now.toISOString(),
    credentialId: credentialId,
    credentialName: credential.name,
    action: 'rotation_completed',
    performedBy: rotationEntry.performedBy,
    details: {
      previousDueDate: rotationEntry.previousDueDate,
      newDueDate: credential.rotation.nextRotationDue,
      schedule: credential.rotation.schedule
    }
  });

  saveAuditLog(auditLog);

  console.log('✅ Rotation recorded successfully!');
  console.log(`   Last Rotated: ${credential.rotation.lastRotated}`);
  console.log(`   Next Due: ${credential.rotation.nextRotationDue}`);
  console.log(`   Audit log updated\n`);
}

// Generate audit report
function generateAuditReport() {
  const inventory = loadInventory();
  const auditLog = loadAuditLog();

  console.log('\n═════════════════════════════════════════════════════════════════');
  console.log('  CREDENTIAL ROTATION AUDIT REPORT');
  console.log('═════════════════════════════════════════════════════════════════\n');
  console.log(`Report Date: ${new Date().toLocaleString()}`);
  console.log(`HIPAA Compliance Required: ${inventory.hipaaCompliance ? 'Yes' : 'No'}\n`);

  console.log('📋 CREDENTIAL SUMMARY:\n');
  inventory.credentials.forEach((cred) => {
    const daysUntil = daysUntilRotation(cred.rotation.nextRotationDue);
    const indicator = getStatusIndicator(daysUntil, cred.alerting.warningDays, cred.alerting.criticalDays);

    console.log(`${indicator.symbol} ${cred.name}`);
    console.log(`   ID: ${cred.id}`);
    console.log(`   Type: ${cred.type}`);
    console.log(`   Criticality: ${cred.criticality}`);
    console.log(`   Last Rotated: ${cred.rotation.lastRotated}`);
    console.log(`   Next Due: ${cred.rotation.nextRotationDue}`);
    console.log(`   Rotation History: ${cred.rotation.rotationHistory.length} entries`);
    console.log(`   HIPAA Required: ${cred.compliance.hipaaRequired ? 'Yes' : 'No'}`);
    console.log(`   Audit Trail Enabled: ${cred.compliance.auditTrail ? 'Yes' : 'No'}`);
    console.log('');
  });

  console.log('\n📝 RECENT ROTATION ACTIVITY:\n');
  const recentEntries = auditLog.entries.slice(-10).reverse();

  if (recentEntries.length === 0) {
    console.log('   No rotation activity recorded yet.\n');
  } else {
    recentEntries.forEach((entry) => {
      console.log(`   ${new Date(entry.timestamp).toLocaleString()}`);
      console.log(`   Action: ${entry.action}`);
      console.log(`   Credential: ${entry.credentialName} (${entry.credentialId})`);
      console.log(`   Performed By: ${entry.performedBy}`);
      console.log('');
    });
  }

  console.log('═════════════════════════════════════════════════════════════════\n');
}

// Send alert notifications
function sendAlerts() {
  const inventory = loadInventory();
  const needsAttention = [];

  inventory.credentials.forEach((cred) => {
    const daysUntil = daysUntilRotation(cred.rotation.nextRotationDue);
    const indicator = getStatusIndicator(daysUntil, cred.alerting.warningDays, cred.alerting.criticalDays);

    if (indicator.status !== 'OK') {
      needsAttention.push({
        credential: cred,
        daysUntil,
        indicator
      });
    }
  });

  if (needsAttention.length === 0) {
    console.log('✅ No alerts to send - all credentials are current.\n');
    return;
  }

  console.log('\n⚠️  CREDENTIAL ROTATION ALERTS\n');
  console.log(`${needsAttention.length} credential(s) require attention:\n`);

  needsAttention.forEach(({ credential, daysUntil, indicator }) => {
    console.log(`${indicator.symbol} ${indicator.status}: ${credential.name}`);
    console.log(`   Days until due: ${daysUntil}`);
    console.log(`   Notify: ${credential.alerting.notificationEmails.join(', ')}`);
    console.log('');
  });

  console.log('NOTE: Actual email notifications require SMTP configuration.');
  console.log('      See docs/CREDENTIAL-ROTATION-GUIDE.md for setup instructions.\n');
}

// Main CLI handler
function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'status':
      showStatus();
      break;

    case 'check-rotations':
      checkRotations();
      break;

    case 'rotate':
      if (!args[1]) {
        console.error('❌ Usage: node credential-manager.js rotate <credential-id>');
        process.exit(1);
      }
      recordRotation(args[1]);
      break;

    case 'audit-report':
      generateAuditReport();
      break;

    case 'alerts':
      sendAlerts();
      break;

    case 'help':
    case '--help':
    case '-h':
      console.log('\nCredential Rotation Manager - HIPAA Compliant\n');
      console.log('Usage:');
      console.log('  node credential-manager.js status           - Show all credential status');
      console.log('  node credential-manager.js check-rotations  - Check for upcoming rotations');
      console.log('  node credential-manager.js rotate <id>      - Record credential rotation');
      console.log('  node credential-manager.js audit-report     - Generate compliance audit report');
      console.log('  node credential-manager.js alerts           - Check and display alerts');
      console.log('  node credential-manager.js help             - Show this help message\n');
      break;

    default:
      console.error(`❌ Unknown command: ${command}`);
      console.log('Run "node credential-manager.js help" for usage information.');
      process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  loadInventory,
  saveInventory,
  daysUntilRotation,
  getStatusIndicator,
  checkRotations,
  recordRotation
};

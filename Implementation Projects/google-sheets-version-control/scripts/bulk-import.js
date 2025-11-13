#!/usr/bin/env node

/**
 * Bulk Import Sheets from CSV
 *
 * Imports multiple sheets into the registry from a CSV file.
 *
 * CSV Format (first row is header):
 * name,productionId,scriptId,category,criticality,description
 *
 * Categories: clinical, financial, staff, operational, reporting, administrative, integration
 * Criticality: high, medium, low
 *
 * Usage:
 *   node scripts/bulk-import.js sheets-to-import.csv
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Check command line argument
const csvFile = process.argv[2];

if (!csvFile) {
  console.error(`
❌ Missing CSV file argument

Usage:
  node scripts/bulk-import.js sheets-to-import.csv

CSV Format (example):
  name,productionId,scriptId,category,criticality,description
  Prior Auth V3,1abc123,AKf456,clinical,high,Prior authorization tracking
  Billing Dashboard,1def789,AKf012,financial,high,Patient billing operations
  `);
  process.exit(1);
}

// Check if file exists
if (!fs.existsSync(csvFile)) {
  console.error(`❌ CSV file not found: ${csvFile}`);
  process.exit(1);
}

console.log('🚀 Starting bulk import...\n');

// Read and parse CSV
const csvContent = fs.readFileSync(csvFile, 'utf8');
const lines = csvContent.split('\n');

// Validate header
const header = lines[0].trim().toLowerCase();
const expectedHeader = 'name,productionid,scriptid,category,criticality,description';

if (!header.includes('name') || !header.includes('productionid') || !header.includes('scriptid')) {
  console.error('❌ Invalid CSV header. Expected columns: name,productionId,scriptId,category,criticality,description');
  process.exit(1);
}

console.log(`📊 Found ${lines.length - 1} sheets to import\n`);

// Track results
const results = {
  success: 0,
  failed: 0,
  errors: []
};

// Process each line (skip header)
lines.slice(1).forEach((line, index) => {
  const trimmedLine = line.trim();

  if (!trimmedLine) {
    return; // Skip empty lines
  }

  // Parse CSV line (handle quoted fields with commas)
  const fields = trimmedLine.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
  const cleanFields = fields.map(f => f.replace(/^"(.*)"$/, '$1').trim());

  const [name, productionId, scriptId, category, criticality, description] = cleanFields;

  // Validate required fields (scriptId is optional)
  if (!name || !productionId) {
    console.error(`⚠️  Line ${index + 2}: Missing required fields (name or productionId) - skipping`);
    results.failed++;
    results.errors.push({ line: index + 2, error: 'Missing required fields' });
    return;
  }

  // Build command
  const cmd = [
    'npm', 'run', 'registry:update', '--', '--add',
    '--name', `"${name}"`,
    '--production-id', `"${productionId}"`
  ];

  if (scriptId) cmd.push('--script-id', `"${scriptId}"`);
  if (category) cmd.push('--category', `"${category}"`);
  if (criticality) cmd.push('--criticality', `"${criticality}"`);
  if (description) cmd.push('--description', `"${description}"`);

  try {
    console.log(`[${index + 1}/${lines.length - 1}] Adding: ${name}`);
    execSync(cmd.join(' '), { stdio: 'ignore' });
    results.success++;
  } catch (error) {
    console.error(`❌ Failed to add: ${name}`);
    results.failed++;
    results.errors.push({ line: index + 2, sheet: name, error: error.message });
  }
});

// Print summary
console.log('\n' + '='.repeat(60));
console.log('📊 Bulk Import Summary');
console.log('='.repeat(60));
console.log(`✅ Successfully imported: ${results.success}`);
console.log(`❌ Failed: ${results.failed}`);

if (results.errors.length > 0) {
  console.log('\n❌ Errors:');
  results.errors.forEach(({ line, sheet, error }) => {
    console.log(`  Line ${line}${sheet ? ` (${sheet})` : ''}: ${error}`);
  });
}

console.log('='.repeat(60) + '\n');

// Show next steps
if (results.success > 0) {
  console.log('✅ Next steps:');
  console.log('  1. Verify import: npm run registry:update -- --list');
  console.log('  2. View statistics: npm run registry:update -- --stats');
  console.log('  3. Run snapshot: npm run snapshot');
  console.log('');
}

process.exit(results.failed > 0 ? 1 : 0);

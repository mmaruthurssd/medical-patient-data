#!/usr/bin/env node

/**
 * Generate Synthetic Test Data for Staging Environment
 *
 * Purpose: Create realistic but completely fake test data for DEV3 staging sheets
 * Security: NEVER uses real PHI - all data is generated from scratch
 *
 * Usage:
 *   node generate-test-data.js --preset small
 *   node generate-test-data.js --schema patient --count 100
 *   node generate-test-data.js --all-schemas --preset medium
 */

const fs = require('fs');
const path = require('path');
const { faker } = require('@faker-js/faker');

// Configuration
const CONFIG_DIR = path.join(__dirname, '../config');
const TEST_DATA_DIR = path.join(__dirname, '../test-data');
const SCHEMAS_FILE = path.join(CONFIG_DIR, 'test-data-schemas.json');

// Ensure test-data directory exists
if (!fs.existsSync(TEST_DATA_DIR)) {
  fs.mkdirSync(TEST_DATA_DIR, { recursive: true });
}

// Load schemas
let schemas;
try {
  schemas = JSON.parse(fs.readFileSync(SCHEMAS_FILE, 'utf8'));
  console.log(`✓ Loaded test data schemas v${schemas.version}`);
} catch (error) {
  console.error('✗ Failed to load schemas:', error.message);
  process.exit(1);
}

// Set faker seed for reproducibility
faker.seed(schemas.globalSettings.seed);

/**
 * Generate value based on field definition
 */
function generateFieldValue(field, context = {}) {
  switch (field.type) {
    case 'sequential':
      return field.format.replace(/\{0+\}/g, (match) => {
        const width = match.length - 2; // Remove {}
        return String(context.index + field.start).padStart(width, '0');
      });

    case 'faker':
      const method = field.method.split('.');
      let value = faker;
      for (const part of method) {
        value = value[part];
      }
      value = typeof value === 'function' ? value(field.args) : value;

      if (field.format === 'MM/DD/YYYY' && value instanceof Date) {
        return `${String(value.getMonth() + 1).padStart(2, '0')}/${String(value.getDate()).padStart(2, '0')}/${value.getFullYear()}`;
      }
      return value;

    case 'random':
      if (field.min !== undefined && field.max !== undefined) {
        const value = faker.number.float({ min: field.min, max: field.max, precision: Math.pow(10, -field.decimals || 0) });
        return field.decimals !== undefined ? value.toFixed(field.decimals) : value;
      }
      const weights = field.weights || field.options.map(() => 1 / field.options.length);
      const random = Math.random();
      let cumulative = 0;
      for (let i = 0; i < field.options.length; i++) {
        cumulative += weights[i];
        if (random <= cumulative) {
          return field.options[i];
        }
      }
      return field.options[field.options.length - 1];

    case 'pattern':
      return field.format.replace(/\{0+\}/g, (match) => {
        const width = match.length - 2;
        return String(faker.number.int({ min: 0, max: Math.pow(10, width) - 1 })).padStart(width, '0');
      });

    case 'template':
      let template = field.format;
      for (const [key, value] of Object.entries(context.record || {})) {
        template = template.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
      }
      return field.lowercase ? template.toLowerCase() : template;

    case 'computed':
      let formula = field.formula;
      for (const [key, value] of Object.entries(context.record || {})) {
        formula = formula.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
      }

      // Handle special functions
      if (formula.includes('CALCULATE_AGE')) {
        const dobMatch = formula.match(/CALCULATE_AGE\(([^)]+)\)/);
        if (dobMatch) {
          const dob = new Date(dobMatch[1]);
          const today = new Date();
          let age = today.getFullYear() - dob.getFullYear();
          const monthDiff = today.getMonth() - dob.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
            age--;
          }
          return age;
        }
      }

      if (formula.includes('RANDOM')) {
        formula = formula.replace(/RANDOM\(([^,]+),\s*([^)]+)\)/, (match, min, max) => {
          return faker.number.float({ min: parseFloat(min), max: parseFloat(max), precision: 0.01 });
        });
      }

      try {
        return eval(formula);
      } catch (error) {
        console.warn(`Warning: Could not compute formula "${formula}":`, error.message);
        return null;
      }

    case 'array':
      const count = faker.number.int({ min: field.minItems || 0, max: field.maxItems || 3 });
      const items = [];
      for (let i = 0; i < count; i++) {
        if (field.itemType === 'random') {
          items.push(field.options[faker.number.int({ min: 0, max: field.options.length - 1 })]);
        } else if (field.itemType === 'pattern') {
          items.push(generateFieldValue({ type: 'pattern', format: field.format }, context));
        }
      }
      return items;

    case 'reference':
      // For references, we'll store the reference type and resolve later
      return { _ref: field.schema, _field: field.field };

    case 'static':
      return field.value;

    default:
      console.warn(`Unknown field type: ${field.type}`);
      return null;
  }
}

/**
 * Generate records for a schema
 */
function generateRecords(schemaName, count) {
  const schema = schemas.schemas[schemaName];
  if (!schema) {
    throw new Error(`Schema "${schemaName}" not found`);
  }

  console.log(`\nGenerating ${count} ${schemaName} records...`);
  const records = [];

  for (let i = 0; i < count; i++) {
    const record = {};
    const context = { index: i, record };

    // Generate each field
    for (const [fieldName, fieldDef] of Object.entries(schema.fields)) {
      record[fieldName] = generateFieldValue(fieldDef, context);
    }

    records.push(record);
  }

  console.log(`✓ Generated ${records.length} ${schemaName} records`);
  return records;
}

/**
 * Resolve references between schemas
 */
function resolveReferences(allData) {
  console.log('\nResolving references...');

  for (const [schemaName, records] of Object.entries(allData)) {
    for (const record of records) {
      for (const [fieldName, value] of Object.entries(record)) {
        if (value && typeof value === 'object' && value._ref) {
          // Find a random record from the referenced schema
          const refRecords = allData[value._ref];
          if (refRecords && refRecords.length > 0) {
            const refRecord = refRecords[faker.number.int({ min: 0, max: refRecords.length - 1 })];
            record[fieldName] = refRecord[value._field];
          } else {
            console.warn(`Warning: No records found for reference ${value._ref}`);
            record[fieldName] = null;
          }
        }
      }
    }
  }

  console.log('✓ References resolved');
}

/**
 * Save data to files
 */
function saveData(data, format = 'json') {
  console.log(`\nSaving data in ${format} format...`);

  for (const [schemaName, records] of Object.entries(data)) {
    const filename = path.join(TEST_DATA_DIR, `synthetic-${schemaName}.${format}`);

    if (format === 'json') {
      fs.writeFileSync(filename, JSON.stringify(records, null, 2), 'utf8');
    } else if (format === 'csv') {
      if (records.length === 0) continue;

      // Get headers
      const headers = Object.keys(records[0]);
      let csv = headers.join(',') + '\n';

      // Add rows
      for (const record of records) {
        const row = headers.map(header => {
          const value = record[header];
          if (Array.isArray(value)) {
            return `"${value.join('; ')}"`;
          }
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value}"`;
          }
          return value;
        });
        csv += row.join(',') + '\n';
      }

      fs.writeFileSync(filename, csv, 'utf8');
    }

    console.log(`✓ Saved ${records.length} records to ${filename}`);
  }
}

/**
 * Generate manifest file
 */
function saveManifest(data, preset) {
  const manifest = {
    generated: new Date().toISOString(),
    preset: preset || 'custom',
    version: schemas.version,
    seed: schemas.globalSettings.seed,
    schemas: {}
  };

  for (const [schemaName, records] of Object.entries(data)) {
    manifest.schemas[schemaName] = {
      count: records.length,
      fields: Object.keys(records[0] || {}),
      description: schemas.schemas[schemaName].description
    };
  }

  const filename = path.join(TEST_DATA_DIR, 'manifest.json');
  fs.writeFileSync(filename, JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`✓ Saved manifest to ${filename}`);
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  let preset = null;
  let schemaName = null;
  let count = null;
  let allSchemas = false;
  let format = 'json';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--preset' && i + 1 < args.length) {
      preset = args[++i];
    } else if (args[i] === '--schema' && i + 1 < args.length) {
      schemaName = args[++i];
    } else if (args[i] === '--count' && i + 1 < args.length) {
      count = parseInt(args[++i]);
    } else if (args[i] === '--all-schemas') {
      allSchemas = true;
    } else if (args[i] === '--format' && i + 1 < args.length) {
      format = args[++i];
    } else if (args[i] === '--help') {
      console.log(`
Synthetic Test Data Generator

Usage:
  node generate-test-data.js [options]

Options:
  --preset <name>      Use preset configuration (small, medium, large, realistic)
  --schema <name>      Generate data for specific schema
  --count <number>     Number of records to generate (with --schema)
  --all-schemas        Generate all schemas with preset counts
  --format <type>      Output format: json (default) or csv
  --help               Show this help message

Examples:
  node generate-test-data.js --preset small
  node generate-test-data.js --schema patient --count 100
  node generate-test-data.js --all-schemas --preset medium --format csv

Available Schemas:
  ${Object.keys(schemas.schemas).join(', ')}

Available Presets:
  ${Object.keys(schemas.presets).join(', ')}
      `);
      return;
    }
  }

  // Validate input
  if (!preset && !schemaName && !allSchemas) {
    console.error('Error: Must specify --preset, --schema, or --all-schemas');
    console.log('Use --help for usage information');
    process.exit(1);
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log('  Synthetic Test Data Generator');
  console.log('  NO PHI - ALL DATA IS FAKE');
  console.log('═══════════════════════════════════════════════════════════');

  const allData = {};

  // Generate data
  if (preset) {
    const presetConfig = schemas.presets[preset];
    if (!presetConfig) {
      console.error(`Error: Preset "${preset}" not found`);
      process.exit(1);
    }

    console.log(`Using preset: ${preset} - ${presetConfig.description}`);

    for (const [schema, recordCount] of Object.entries(presetConfig)) {
      if (schema !== 'description' && schemas.schemas[schema]) {
        allData[schema] = generateRecords(schema, recordCount);
      }
    }
  } else if (schemaName) {
    if (!count) {
      console.error('Error: --count required when using --schema');
      process.exit(1);
    }
    allData[schemaName] = generateRecords(schemaName, count);
  } else if (allSchemas) {
    for (const schema of Object.keys(schemas.schemas)) {
      allData[schema] = generateRecords(schema, 10); // Default 10 records each
    }
  }

  // Resolve references
  resolveReferences(allData);

  // Save data
  saveData(allData, format);
  saveManifest(allData, preset);

  // Summary
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  Summary');
  console.log('═══════════════════════════════════════════════════════════');
  let totalRecords = 0;
  for (const [schema, records] of Object.entries(allData)) {
    console.log(`  ${schema}: ${records.length} records`);
    totalRecords += records.length;
  }
  console.log(`\n  Total: ${totalRecords} records generated`);
  console.log(`  Location: ${TEST_DATA_DIR}`);
  console.log('═══════════════════════════════════════════════════════════\n');
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { generateRecords, resolveReferences };

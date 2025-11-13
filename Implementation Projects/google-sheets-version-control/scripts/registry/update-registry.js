#!/usr/bin/env node

/**
 * Update Sheet Registry
 *
 * Adds or updates sheet entries in the sheet registry
 *
 * Usage:
 *   node scripts/registry/update-registry.js --add --name "Sheet Name" --production-id "SHEET_ID" --script-id "SCRIPT_ID"
 *   node scripts/registry/update-registry.js --list
 *   node scripts/registry/update-registry.js --stats
 */

const fs = require('fs');
const path = require('path');

const REGISTRY_PATH = path.join(__dirname, '../../config/sheet-registry.json');

class SheetRegistry {
  constructor() {
    this.registry = this.load();
  }

  load() {
    try {
      return JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
    } catch (error) {
      console.error('❌ Error loading registry:', error.message);
      process.exit(1);
    }
  }

  save() {
    try {
      this.registry.metadata.lastUpdated = new Date().toISOString();
      fs.writeFileSync(REGISTRY_PATH, JSON.stringify(this.registry, null, 2));
      console.log('✅ Registry saved successfully');
    } catch (error) {
      console.error('❌ Error saving registry:', error.message);
      process.exit(1);
    }
  }

  addSheet(options) {
    const { name, productionId, scriptId, category, criticality, description } = options;

    // Generate unique ID
    const id = `sheet-${String(this.registry.sheets.length).padStart(3, '0')}`;

    const newSheet = {
      id,
      name,
      description: description || '',
      criticality: criticality || 'medium',
      category: category || 'operational',
      production: {
        sheetId: productionId,
        scriptId: scriptId,
        url: `https://docs.google.com/spreadsheets/d/${productionId}/edit`,
        owner: 'automation@ssdspc.com',
        lastSnapshot: null
      },
      staging: {
        sheetId: null,
        scriptId: null,
        url: null,
        created: null
      },
      metadata: {
        dependencies: [],
        triggers: [],
        integrations: [],
        lastDeployed: null,
        lastTested: null
      },
      status: 'pending'
    };

    // Remove template entry if it exists
    this.registry.sheets = this.registry.sheets.filter(s => s.id !== 'sheet-001' || s.name !== 'Example Sheet Name');

    this.registry.sheets.push(newSheet);
    this.updateMetadata();
    this.save();

    console.log(`✅ Added sheet: ${name} (${id})`);
    return newSheet;
  }

  updateMetadata() {
    const productionCount = this.registry.sheets.filter(s => s.production.sheetId).length;
    const stagingCount = this.registry.sheets.filter(s => s.staging.sheetId).length;

    this.registry.metadata.totalSheets = this.registry.sheets.length;
    this.registry.metadata.totalProduction = productionCount;
    this.registry.metadata.totalStaging = stagingCount;
  }

  list() {
    console.log('\n📊 Sheet Registry\n');
    console.log(`Total Sheets: ${this.registry.metadata.totalSheets}`);
    console.log(`Production: ${this.registry.metadata.totalProduction}`);
    console.log(`Staging: ${this.registry.metadata.totalStaging}`);
    console.log(`Last Updated: ${this.registry.metadata.lastUpdated}\n`);

    if (this.registry.sheets.length === 0) {
      console.log('No sheets registered yet.\n');
      return;
    }

    console.log('Sheets:');
    this.registry.sheets.forEach(sheet => {
      const prodStatus = sheet.production.sheetId ? '✅' : '❌';
      const stagStatus = sheet.staging.sheetId ? '✅' : '❌';
      console.log(`  ${sheet.id}: ${sheet.name}`);
      console.log(`    Production: ${prodStatus} | Staging: ${stagStatus} | Criticality: ${sheet.criticality} | Category: ${sheet.category}`);
    });
    console.log('');
  }

  stats() {
    const byCriticality = {};
    const byCategory = {};
    const byStatus = {};

    this.registry.sheets.forEach(sheet => {
      byCriticality[sheet.criticality] = (byCriticality[sheet.criticality] || 0) + 1;
      byCategory[sheet.category] = (byCategory[sheet.category] || 0) + 1;
      byStatus[sheet.status] = (byStatus[sheet.status] || 0) + 1;
    });

    console.log('\n📈 Registry Statistics\n');
    console.log('By Criticality:');
    Object.entries(byCriticality).forEach(([key, count]) => {
      console.log(`  ${key}: ${count}`);
    });

    console.log('\nBy Category:');
    Object.entries(byCategory).forEach(([key, count]) => {
      console.log(`  ${key}: ${count}`);
    });

    console.log('\nBy Status:');
    Object.entries(byStatus).forEach(([key, count]) => {
      console.log(`  ${key}: ${count}`);
    });
    console.log('');
  }
}

// CLI handling
const args = process.argv.slice(2);

if (args.includes('--list')) {
  const registry = new SheetRegistry();
  registry.list();
} else if (args.includes('--stats')) {
  const registry = new SheetRegistry();
  registry.stats();
} else if (args.includes('--add')) {
  const name = args[args.indexOf('--name') + 1];
  const productionId = args[args.indexOf('--production-id') + 1];
  const scriptId = args.includes('--script-id') ? args[args.indexOf('--script-id') + 1] : null;
  const category = args.includes('--category') ? args[args.indexOf('--category') + 1] : 'operational';
  const criticality = args.includes('--criticality') ? args[args.indexOf('--criticality') + 1] : 'medium';
  const description = args.includes('--description') ? args[args.indexOf('--description') + 1] : '';

  if (!name || !productionId) {
    console.error('❌ Missing required arguments: --name, --production-id');
    process.exit(1);
  }

  const registry = new SheetRegistry();
  registry.addSheet({ name, productionId, scriptId, category, criticality, description });
} else {
  console.log(`
Usage:
  node scripts/registry/update-registry.js --add --name "Sheet Name" --production-id "SHEET_ID" --script-id "SCRIPT_ID"
  node scripts/registry/update-registry.js --list
  node scripts/registry/update-registry.js --stats

Optional flags for --add:
  --category (clinical|financial|staff|operational|reporting|administrative|integration)
  --criticality (high|medium|low)
  --description "Brief description"
  `);
}

#!/usr/bin/env node

/**
 * Add a scheduled prompt to Claude Automation Control Sheet
 *
 * Usage: node add-scheduled-prompt.js [options]
 *
 * This script allows Claude to programmatically add scheduled prompts
 * to the Google Sheet on behalf of the user.
 */

const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

// Configuration
const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'service-account.json');
const SHEET_INFO_FILE = path.join(__dirname, '../automation/SHEET-INFO.json');

// Load spreadsheet info
const sheetInfo = JSON.parse(fs.readFileSync(SHEET_INFO_FILE, 'utf8'));
const SPREADSHEET_ID = sheetInfo.spreadsheetId;

/**
 * Add a scheduled prompt to the sheet
 */
async function addScheduledPrompt(promptConfig) {
  const {
    name,
    promptText,
    scheduleType = 'Daily',
    time = '09:00',
    daysOfWeek = '',
    dayOfMonth = '',
    priority = 'Normal',
    dataSource = '',
    status = 'Active',
    notes = '',
  } = promptConfig;

  console.log('🚀 Adding scheduled prompt to Google Sheet...\n');
  console.log(`📝 Prompt: ${name}`);
  console.log(`📅 Schedule: ${scheduleType} at ${time}`);
  console.log(`⚡ Priority: ${priority}\n`);

  // Authenticate
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const authClient = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: authClient });

  // Prepare row data
  const rowData = [
    '', // ID (empty - Apps Script will generate)
    status,
    name,
    promptText,
    scheduleType,
    time,
    daysOfWeek,
    dayOfMonth,
    priority,
    dataSource,
    '', // Last Run (empty - will be filled by Apps Script)
    '', // Next Run (empty - will be calculated by Apps Script)
    0, // Run Count
    '', // Last Status (empty initially)
    notes,
  ];

  // Append to sheet
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Scheduled Prompts!A:O',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [rowData],
    },
  });

  console.log('✅ Prompt added successfully!\n');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📊 View in sheet:');
  console.log(`   ${sheetInfo.webViewLink}`);
  console.log('═══════════════════════════════════════════════════════════\n');

  // Return the configuration for logging
  return {
    added: new Date().toISOString(),
    name,
    scheduleType,
    time,
    priority,
    status,
  };
}

/**
 * Interactive mode - get prompt details from command line args
 */
async function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  let config = {};

  if (args.includes('--interactive')) {
    // Interactive mode would go here (for future enhancement)
    console.log('Interactive mode not yet implemented');
    process.exit(1);
  } else if (args.includes('--config')) {
    // Load from JSON file
    const configFile = args[args.indexOf('--config') + 1];
    config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
  } else {
    // Simple command-line args
    config = {
      name: args[args.indexOf('--name') + 1],
      promptText: args[args.indexOf('--prompt') + 1],
      scheduleType: args[args.indexOf('--schedule') + 1] || 'Daily',
      time: args[args.indexOf('--time') + 1] || '09:00',
      priority: args[args.indexOf('--priority') + 1] || 'Normal',
      status: args[args.indexOf('--status') + 1] || 'Active',
      notes: args[args.indexOf('--notes') + 1] || '',
    };

    // Handle optional args
    if (args.includes('--days')) {
      config.daysOfWeek = args[args.indexOf('--days') + 1];
    }
    if (args.includes('--day-of-month')) {
      config.dayOfMonth = args[args.indexOf('--day-of-month') + 1];
    }
    if (args.includes('--data-source')) {
      config.dataSource = args[args.indexOf('--data-source') + 1];
    }
  }

  // Validate required fields
  if (!config.name || !config.promptText) {
    console.error('❌ Error: --name and --prompt are required\n');
    console.log('Usage:');
    console.log('  node add-scheduled-prompt.js \\');
    console.log('    --name "Daily Biopsy Summary" \\');
    console.log('    --prompt "Generate summary of yesterday\'s biopsy cases" \\');
    console.log('    --schedule "Daily" \\');
    console.log('    --time "09:00" \\');
    console.log('    --priority "Normal" \\');
    console.log('    --status "Active"\n');
    console.log('Or use config file:');
    console.log('  node add-scheduled-prompt.js --config prompt-config.json\n');
    process.exit(1);
  }

  const result = await addScheduledPrompt(config);

  // Log to automation log
  const logEntry = {
    timestamp: new Date().toISOString(),
    action: 'add-scheduled-prompt',
    user: 'claude-ai',
    prompt: result,
  };

  const logFile = path.join(__dirname, '../automation/automation-actions.log');
  fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');

  console.log('📝 Action logged to: automation/automation-actions.log\n');
}

// Export for use as module
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
}

module.exports = { addScheduledPrompt };

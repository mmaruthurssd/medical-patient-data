#!/usr/bin/env node

/**
 * Create FILE-INDEX Google Sheet
 *
 * Converts FILE-INDEX.md from AI Development - No PHI drive into a searchable/filterable Google Sheet
 */

const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

// Configuration
const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'service-account.json');
const SHARED_DRIVE_ID = '0AFSsMrTVhqWuUk9PVA'; // AI Development - No PHI
const SHEET_NAME = 'FILE-INDEX';

// File data parsed from FILE-INDEX.md
const files = [
  // Root Level Files
  {
    folder: 'Root',
    filename: 'START_HERE.md',
    type: 'Guide',
    purpose: 'Entry point for AI assistants to understand the system',
    audience: 'AI Assistants',
    tags: 'ai, orientation, architecture',
    status: '✅ Created',
    description: 'Complete orientation guide for AI dropped into this drive. Explains four-part architecture (local, external brain, GitHub, Google Drive), reading order, system overview, and quick commands.',
    lastUpdated: '2025-11-11'
  },
  {
    folder: 'Root',
    filename: 'FILE-INDEX.md',
    type: 'Reference',
    purpose: 'Complete searchable catalog of all files',
    audience: 'Everyone',
    tags: 'index, navigation, file-catalog',
    status: '✅ Created',
    description: 'Index of all files in this drive with descriptions, metadata, and navigation links.',
    lastUpdated: '2025-11-11'
  },

  // 00-system-documentation/
  {
    folder: '00-system-documentation',
    filename: 'THREE-WORKSPACE-ARCHITECTURE.md',
    type: 'Guide',
    purpose: 'Complete overview of three-workspace system',
    audience: 'Everyone',
    tags: 'architecture, overview, setup',
    status: '✅ Created',
    description: 'Master architecture document explaining operations-workspace (NO PHI), mcp-infrastructure (NO PHI), and medical-patient-data (PHI allowed). Covers workspace purposes, HIPAA boundaries, folder structures, sync strategies.',
    lastUpdated: '2025-11-11'
  },
  {
    folder: '00-system-documentation',
    filename: 'CURRENT-SYSTEM-STATE.md',
    type: 'Reference',
    purpose: 'Master system state document (updated regularly)',
    audience: 'Everyone',
    tags: 'state, status, inventory',
    status: '🚧 To be created',
    description: 'Source of truth for current system configuration. Lists active computers, recent changes, system evolution, known issues, planned fixes. Check before making system-level changes.',
    lastUpdated: '2025-11-11'
  },
  {
    folder: '00-system-documentation',
    filename: 'AI-WORKSPACE-INITIALIZATION.md',
    type: 'Guide',
    purpose: 'What AI should do when dropped into any workspace',
    audience: 'AI Assistants',
    tags: 'ai, initialization, procedures',
    status: '✅ Created',
    description: 'Quick verification commands, orientation procedures, context gathering, what to read first. Helps AI understand which workspace it\'s in and what it can do.',
    lastUpdated: '2025-11-11'
  },
  {
    folder: '00-system-documentation',
    filename: 'AI-GUIDELINES-BY-WORKSPACE.md',
    type: 'Guide',
    purpose: 'What AI can/cannot do in each workspace',
    audience: 'AI Assistants',
    tags: 'ai, permissions, compliance, phi',
    status: '✅ Created',
    description: 'Detailed permissions per workspace. operations-workspace: templates, docs, planning. mcp-infrastructure: MCP development, testing. medical-patient-data: PHI allowed, Gemini only, strict audit logging.',
    lastUpdated: '2025-11-11'
  },
  {
    folder: '00-system-documentation',
    filename: 'AI-COLLABORATION-PROTOCOLS.md',
    type: 'Guide',
    purpose: 'How AI assistants should collaborate with team',
    audience: 'AI Assistants',
    tags: 'ai, collaboration, communication',
    status: '✅ Created',
    description: 'Communication standards, event logging requirements, commit message formats, when to ask questions, how to document decisions.',
    lastUpdated: '2025-11-11'
  },
  {
    folder: '00-system-documentation',
    filename: 'SYSTEM-SETUP-CHECKLIST.md',
    type: 'Guide',
    purpose: 'Verify system setup on ANY computer (Mac, Linux, VPS, server)',
    audience: 'Everyone',
    tags: 'setup, verification, checklist',
    status: '✅ Created',
    description: '10-step verification checklist. Automated verify-setup.sh script. Initial EVENT_LOG.md entry. Ensures identical setup across all team computers.',
    lastUpdated: '2025-11-11'
  },
  {
    folder: '00-system-documentation',
    filename: 'SYNC-VERIFICATION-AND-REPAIR.md',
    type: 'Guide',
    purpose: 'Detect and fix out-of-sync systems across all computers',
    audience: 'Everyone',
    tags: 'sync, repair, troubleshooting',
    status: '✅ Created',
    description: 'Automated check-sync.sh script. Cross-computer sync strategies. Troubleshooting common sync issues (git conflicts, broken symlinks, daemon not running, MCP config mismatch).',
    lastUpdated: '2025-11-11'
  },
  {
    folder: '00-system-documentation',
    filename: 'DAILY-WORKFLOW.md',
    type: 'Guide',
    purpose: 'Standard daily work procedures',
    audience: 'Developers',
    tags: 'workflow, procedures, daily',
    status: '✅ Created',
    description: 'Morning routine (pull, daemon, team check). During work (choose workspace, commit frequently). End of day checklist. Weekly review procedures.',
    lastUpdated: '2025-11-11'
  },
  {
    folder: '00-system-documentation',
    filename: 'EVENT-LOGGING-PROCEDURES.md',
    type: 'Guide',
    purpose: 'How to log significant events',
    audience: 'Everyone',
    tags: 'events, logging, telemetry',
    status: '✅ Created',
    description: '4-layer event logging system. Layer 1: Shared EVENT_LOG.md (GitHub). Layer 2: workspace-brain MCP (per-computer). Layer 3: Google Sheets dashboard. Layer 4: gemini-audit-log.json (PHI compliance).',
    lastUpdated: '2025-11-11'
  },
  {
    folder: '00-system-documentation',
    filename: 'GITHUB-COLLABORATION-GUIDE.md',
    type: 'Guide',
    purpose: 'Git procedures, commit standards, collaboration',
    audience: 'Everyone',
    tags: 'git, github, collaboration',
    status: '✅ Created',
    description: 'Commit message standards, push/pull procedures, conflict resolution, PR workflow, sync across computers.',
    lastUpdated: '2025-11-11'
  },
  {
    folder: '00-system-documentation',
    filename: 'GOOGLE-DRIVE-STRUCTURE-AND-AUTOMATION.md',
    type: 'Guide',
    purpose: 'Complete Google Drive architecture and automated event logging',
    audience: 'Everyone',
    tags: 'google-drive, automation, architecture',
    status: '✅ Created',
    description: 'Google Drive folder structure. Fully automated event logging via Apps Script. Apps Script code that commits directly to GitHub via API. Multi-computer automation. No human review loop.',
    lastUpdated: '2025-11-11'
  },
  {
    folder: '00-system-documentation',
    filename: 'GOOGLE-DRIVE-SETUP-IMPLEMENTATION.md',
    type: 'Guide',
    purpose: 'Step-by-step implementation for setting up this drive',
    audience: 'Setup administrators',
    tags: 'setup, implementation, google-drive',
    status: '✅ Created',
    description: 'Phase 1: Create folder structure. Phase 2: Set up Event-Logging-Automation. Phase 3: Backup automation. Phase 4: Workspace-Activity-Dashboard. File metadata standards. Indexing strategy.',
    lastUpdated: '2025-11-11'
  },
  {
    folder: '00-system-documentation',
    filename: 'HIPAA-COMPLIANCE-BOUNDARIES.md',
    type: 'Guide',
    purpose: 'PHI handling rules and HIPAA compliance boundaries',
    audience: 'Everyone',
    tags: 'hipaa, compliance, phi, security',
    status: '✅ Created',
    description: 'What data goes in which workspace. PHI allowed only in medical-patient-data. Separate Google Drives. Audit logging requirements. Data boundary enforcement.',
    lastUpdated: '2025-11-11'
  },
  {
    folder: '00-system-documentation',
    filename: 'MCP-CONFIGURATION-GUIDE.md',
    type: 'Guide',
    purpose: 'Setting up ~/.claude.json and .gemini-mcp.json',
    audience: 'Developers',
    tags: 'mcp, configuration, setup',
    status: '✅ Created',
    description: 'User-level vs workspace-level MCP configuration. Claude Code config (~/.claude.json). Gemini config (.gemini-mcp.json in medical-patient-data). Template locations.',
    lastUpdated: '2025-11-11'
  },
  {
    folder: '00-system-documentation',
    filename: 'WORKSPACE-SYNC-PROCEDURES.md',
    type: 'Guide',
    purpose: 'How to sync between workspaces, GitHub, and Google Drive',
    audience: 'Everyone',
    tags: 'sync, procedures, coordination',
    status: '✅ Created',
    description: 'Local ↔ GitHub sync. Local ↔ Google Drive sync. workspace-sync daemon. Cross-computer sync strategies. Manual vs automated sync.',
    lastUpdated: '2025-11-11'
  },
  {
    folder: '00-system-documentation',
    filename: 'NEW-DEVELOPER-ONBOARDING.md',
    type: 'Guide',
    purpose: 'Complete setup instructions for new team members',
    audience: 'New developers',
    tags: 'onboarding, setup, new-team',
    status: '✅ Created',
    description: 'Complete from-scratch setup. Install tools, clone repositories, configure git, set up MCP servers, configure daemon, verify setup.',
    lastUpdated: '2025-11-11'
  },
  {
    folder: '00-system-documentation',
    filename: 'TROUBLESHOOTING.md',
    type: 'Reference',
    purpose: 'Common issues and solutions',
    audience: 'Everyone',
    tags: 'troubleshooting, issues, solutions',
    status: '✅ Created',
    description: 'Common problems and fixes. Git issues, symlink problems, MCP server errors, daemon issues, sync conflicts.',
    lastUpdated: '2025-11-11'
  },
  {
    folder: '00-system-documentation',
    filename: 'README.md',
    type: 'Guide',
    purpose: 'Index of all workspace-management documentation',
    audience: 'Everyone',
    tags: 'index, overview',
    status: '✅ Created',
    description: 'Documentation index organized by category. Quick start guides. How workspace-management folder is accessed (local symlinks + Google Drive). Keeping documentation updated.',
    lastUpdated: '2025-11-11'
  },
  {
    folder: '00-system-documentation',
    filename: 'CHANGELOG.md',
    type: 'Log',
    purpose: 'Track system evolution over time',
    audience: 'Everyone',
    tags: 'changelog, history, evolution',
    status: '🚧 To be created',
    description: 'System changes, major updates, new features, deprecations. Chronological log of workspace system evolution.',
    lastUpdated: '2025-11-11'
  },

  // 01-event-logs/
  {
    folder: '01-event-logs',
    filename: 'EVENT_LOG-consolidated.md',
    type: 'Log',
    purpose: 'Merged event log from all computers',
    audience: 'Everyone',
    tags: 'events, log, team',
    status: '🚧 To be created',
    description: 'Consolidated EVENT_LOG.md entries from all team computers. Weekly sync from local EVENT_LOG.md files. Team-wide visibility of significant events.',
    lastUpdated: '2025-11-11'
  },
  {
    folder: '01-event-logs',
    filename: 'Workspace-Activity-Dashboard.gsheet',
    type: 'Dashboard',
    purpose: 'Team metrics and visibility dashboard',
    audience: 'Everyone',
    tags: 'dashboard, metrics, analytics',
    status: '🚧 To be created',
    description: 'Google Sheet with tabs: Summary (overview metrics), Weekly Stats (automated summaries), Tool Usage (MCP tracking), ROI Metrics (time saved, costs). Data exported from workspace-brain MCP.',
    lastUpdated: '2025-11-11'
  },

  // 03-automation/
  {
    folder: '03-automation',
    filename: 'Event-Logging-Automation.gsheet',
    type: 'Automation',
    purpose: 'Automated event logging execution and status tracking',
    audience: 'System (automated), developers (monitoring)',
    tags: 'automation, event-logging, apps-script',
    status: '🚧 To be created',
    description: 'Google Sheet that executes automated event logging via Apps Script. Columns: Prompt, Schedule, Last Run, Response, Status, Token Usage. Shows automation execution history.',
    lastUpdated: '2025-11-11'
  },
  {
    folder: '03-automation',
    filename: 'Event-Logging-Automation.gs',
    type: 'Automation',
    purpose: 'Apps Script code for automated event logging',
    audience: 'Developers',
    tags: 'automation, apps-script, code',
    status: '🚧 To be created',
    description: 'Complete Apps Script implementation. Fetches git commits, calls Claude API, analyzes events, commits to GitHub via API, sends notifications. Runs in cloud, works for all computers. Triggers: daily 5 PM (events), daily 6 PM (workflows), weekly Monday 9 AM (summary).',
    lastUpdated: '2025-11-11'
  },

  // 04-setup-templates/
  {
    folder: '04-setup-templates',
    filename: 'claude-config-template.json',
    type: 'Template',
    purpose: 'Template for ~/.claude.json (Claude Code MCP configuration)',
    audience: 'Developers',
    tags: 'template, mcp, claude-code',
    status: '🚧 To be created',
    description: 'User-level MCP configuration for Claude Code. Lists all 26+ MCP servers with paths, environment variables, capabilities. Copy to ~/.claude.json and customize paths.',
    lastUpdated: '2025-11-11'
  },
  {
    folder: '04-setup-templates',
    filename: 'gemini-mcp-config-template.json',
    type: 'Template',
    purpose: 'Template for .gemini-mcp.json (Gemini MCP configuration)',
    audience: 'Developers',
    tags: 'template, mcp, gemini',
    status: '🚧 To be created',
    description: 'Workspace-level MCP configuration for Gemini in medical-patient-data. Lists allowed MCP servers, PHI handling configuration, audit logging setup.',
    lastUpdated: '2025-11-11'
  },
  {
    folder: '04-setup-templates',
    filename: 'verify-setup.sh',
    type: 'Template',
    purpose: 'Automated setup verification script',
    audience: 'Everyone',
    tags: 'script, verification, setup',
    status: '✅ Created',
    description: 'Bash script that verifies all system components. Checks: workspaces cloned, symlinks working, daemon running, MCP servers built, git configured, backups configured. Returns pass/fail with fix suggestions.',
    lastUpdated: '2025-11-11'
  },
  {
    folder: '04-setup-templates',
    filename: 'check-sync.sh',
    type: 'Template',
    purpose: 'Automated sync verification and repair script',
    audience: 'Everyone',
    tags: 'script, sync, repair',
    status: '✅ Created',
    description: 'Bash script that detects out-of-sync systems and repairs them. Checks: git sync, symlinks, daemon status, MCP builds. Flag --fix to auto-repair issues.',
    lastUpdated: '2025-11-11'
  }
];

async function createFileIndexSheet() {
  console.log('🚀 Creating FILE-INDEX Google Sheet...\n');

  // Authenticate with service account
  console.log('📝 Authenticating with service account...');
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/spreadsheets',
    ],
  });

  const authClient = await auth.getClient();
  const drive = google.drive({ version: 'v3', auth: authClient });
  const sheets = google.sheets({ version: 'v4', auth: authClient });

  // Step 1: Create the spreadsheet
  console.log('📊 Creating spreadsheet...');
  const createResponse = await drive.files.create({
    supportsAllDrives: true,
    requestBody: {
      name: SHEET_NAME,
      mimeType: 'application/vnd.google-apps.spreadsheet',
      parents: [SHARED_DRIVE_ID],
    },
    fields: 'id, webViewLink',
  });

  const spreadsheetId = createResponse.data.id;
  const webViewLink = createResponse.data.webViewLink;

  console.log(`✅ Spreadsheet created!`);
  console.log(`   ID: ${spreadsheetId}`);
  console.log(`   URL: ${webViewLink}\n`);

  // Step 2: Add headers
  console.log('📝 Adding headers...');
  const headers = [
    'Folder',
    'Filename',
    'Type',
    'Purpose',
    'Audience',
    'Tags',
    'Status',
    'Description',
    'Last Updated'
  ];

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: 'Sheet1!A1:I1',
    valueInputOption: 'RAW',
    requestBody: {
      values: [headers],
    },
  });

  // Step 3: Add data rows
  console.log('📋 Adding file data...');
  const rows = files.map(file => [
    file.folder,
    file.filename,
    file.type,
    file.purpose,
    file.audience,
    file.tags,
    file.status,
    file.description,
    file.lastUpdated
  ]);

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `Sheet1!A2:I${rows.length + 1}`,
    valueInputOption: 'RAW',
    requestBody: {
      values: rows,
    },
  });

  // Step 4: Format the sheet
  console.log('🎨 Formatting sheet...');
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        // Rename Sheet1 to "File Index"
        {
          updateSheetProperties: {
            properties: {
              sheetId: 0,
              title: 'File Index',
            },
            fields: 'title',
          },
        },
        // Freeze header row
        {
          updateSheetProperties: {
            properties: {
              sheetId: 0,
              gridProperties: {
                frozenRowCount: 1,
              },
            },
            fields: 'gridProperties.frozenRowCount',
          },
        },
        // Bold header row
        {
          repeatCell: {
            range: {
              sheetId: 0,
              startRowIndex: 0,
              endRowIndex: 1,
            },
            cell: {
              userEnteredFormat: {
                textFormat: {
                  bold: true,
                },
                backgroundColor: {
                  red: 0.9,
                  green: 0.9,
                  blue: 0.9,
                },
              },
            },
            fields: 'userEnteredFormat(textFormat,backgroundColor)',
          },
        },
        // Auto-resize columns
        {
          autoResizeDimensions: {
            dimensions: {
              sheetId: 0,
              dimension: 'COLUMNS',
              startIndex: 0,
              endIndex: 9,
            },
          },
        },
        // Enable filter
        {
          setBasicFilter: {
            filter: {
              range: {
                sheetId: 0,
                startRowIndex: 0,
                endRowIndex: rows.length + 1,
                startColumnIndex: 0,
                endColumnIndex: 9,
              },
            },
          },
        },
      ],
    },
  });

  console.log('\n✅ FILE-INDEX Google Sheet created successfully!');
  console.log(`\n📊 Sheet URL: ${webViewLink}`);
  console.log(`\n📈 Statistics:`);
  console.log(`   Total files: ${files.length}`);
  console.log(`   Created: ${files.filter(f => f.status.includes('✅')).length}`);
  console.log(`   To be created: ${files.filter(f => f.status.includes('🚧')).length}`);
  console.log(`\n🔍 Features:`);
  console.log(`   ✓ Sortable by any column`);
  console.log(`   ✓ Filterable by type, status, audience, folder`);
  console.log(`   ✓ Searchable across all columns`);
  console.log(`   ✓ Frozen header row`);

  // Save sheet info
  const sheetInfo = {
    spreadsheetId,
    webViewLink,
    createdAt: new Date().toISOString(),
    totalFiles: files.length,
  };

  fs.writeFileSync(
    path.join(__dirname, 'FILE-INDEX-SHEET-INFO.json'),
    JSON.stringify(sheetInfo, null, 2)
  );

  console.log(`\n💾 Sheet info saved to FILE-INDEX-SHEET-INFO.json`);
}

// Run the script
createFileIndexSheet().catch(console.error);

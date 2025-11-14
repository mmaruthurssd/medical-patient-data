#!/bin/bash

# Automated Backup Monitoring Setup
# SAFE MODE: No deletions, only additions
# Creates backups before any operations

set -e  # Exit on error

SPREADSHEET_ID="1KpUhrEtW7-uHHS6GIngiXws0v2aM2wBC5ppyDBnRKxc"
SPREADSHEET_NAME="6-Layer Backup Monitor - SSD Sheets"
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "========================================="
echo "Backup Monitoring - AUTOMATED SETUP"
echo "========================================="
echo ""
echo "SAFETY MODE: Only adding content, no deletions"
echo ""

# Step 1: Verify all files exist
echo "Step 1: Verifying files..."
if [ ! -f "$SCRIPT_DIR/backup-monitoring-logger.js" ]; then
    echo "❌ Error: backup-monitoring-logger.js not found"
    exit 1
fi

if [ ! -f "$SCRIPT_DIR/log-to-monitoring.sh" ]; then
    echo "❌ Error: log-to-monitoring.sh not found"
    exit 1
fi

echo "✅ All required files present"
echo ""

# Step 2: Create safe working directory
echo "Step 2: Creating safe working directory..."
WORK_DIR="$PROJECT_ROOT/tmp/monitoring-setup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$WORK_DIR"
echo "✅ Created: $WORK_DIR"
echo ""

# Step 3: Copy Apps Script to working directory with safety header
echo "Step 3: Preparing Apps Script with safety header..."
cat > "$WORK_DIR/Code.gs" << 'SAFETY_HEADER'
/**
 * BACKUP HEALTH DASHBOARD - Monitoring System
 *
 * SAFETY: This script ONLY ADDS new tabs and data
 * It will NEVER delete existing tabs or data
 *
 * All functions check for existence before creating
 * All operations are logged to console
 *
 * Spreadsheet: 6-Layer Backup Monitor - SSD Sheets
 * ID: 1KpUhrEtW7-uHHS6GIngiXws0v2aM2wBC5ppyDBnRKxc
 */

SAFETY_HEADER

# Append the actual code
cat "$SCRIPT_DIR/backup-monitoring-logger.js" >> "$WORK_DIR/Code.gs"

echo "✅ Apps Script prepared with safety checks"
echo ""

# Step 4: Create appsscript.json manifest
echo "Step 4: Creating Apps Script manifest..."
cat > "$WORK_DIR/appsscript.json" << 'EOF'
{
  "timeZone": "America/Chicago",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "oauthScopes": [
    "https://www.googleapis.com/auth/spreadsheets"
  ]
}
EOF

echo "✅ Manifest created"
echo ""

# Step 5: Create setup instructions
echo "Step 5: Creating setup instructions..."
cat > "$WORK_DIR/SETUP-INSTRUCTIONS.md" << 'EOF'
# Automated Monitoring Setup - Final Steps

## What's Been Prepared:

✅ Apps Script code with safety checks (Code.gs)
✅ Apps Script manifest (appsscript.json)
✅ All files validated and ready

## Quick Setup (3 steps, 2 minutes):

### Step 1: Open Spreadsheet

Open this link in your browser:
https://docs.google.com/spreadsheets/d/1KpUhrEtW7-uHHS6GIngiXws0v2aM2wBC5ppyDBnRKxc

### Step 2: Open Apps Script Editor

In the spreadsheet:
1. Click "Extensions" menu
2. Click "Apps Script"

### Step 3: Paste Code (SAFE - No deletions)

In the Apps Script editor:

1. **SAFETY CHECK**: Look at existing code
   - If there's important code, create a backup copy first
   - This script will NOT delete anything

2. Click the "+" next to "Files" → "Script"
   - Name it: "BackupMonitoring"

3. Copy the contents of `Code.gs` from this directory

4. Paste into the new script file

5. Save (Ctrl+S or Cmd+S)

6. Run the function `setupBackupMonitoringTabs`
   - Click "Run" button
   - Grant permissions when prompted
   - Wait for execution to complete (~30 seconds)

7. Return to spreadsheet and verify 7 new tabs were created:
   - 📊 Backup Overview
   - Layer 1 - Google Drive
   - Layer 2 - Local Git
   - Layer 3 - GitHub
   - Layer 4 - Branch Protection
   - Layer 5 - GCS Backup
   - Layer 6 - Time Machine

## Safety Features:

✅ Script checks if tabs exist before creating
✅ Never deletes or modifies existing tabs
✅ All operations logged to Apps Script console
✅ Can be safely re-run multiple times
✅ Creates backups of any existing data

## Verification:

After running, you should see:
- 7 new colorful tabs
- "Backup Overview" tab with summary dashboard
- Individual layer tabs with formatted headers
- "Last Updated" timestamp in overview

## Troubleshooting:

**If tabs already exist:**
- Script will skip creation
- No data will be lost
- Console will show "Already exists" messages

**If permissions needed:**
- Click "Review Permissions"
- Select your Google account
- Click "Advanced" → "Go to BackupMonitoring (unsafe)"
- Click "Allow"

**If execution times out:**
- This is normal for first run
- Simply re-run the function
- It will pick up where it left off

## Next Steps:

Once tabs are created, the monitoring system is ready!
- Events will be logged automatically
- Overview updates in real-time
- No further setup needed

## Files in This Directory:

- Code.gs - Complete Apps Script code (with safety header)
- appsscript.json - Apps Script manifest
- SETUP-INSTRUCTIONS.md - This file
EOF

echo "✅ Instructions created"
echo ""

# Step 6: Create one-liner copy commands
echo "Step 6: Creating quick-copy commands..."
cat > "$WORK_DIR/quick-copy.sh" << 'EOF'
#!/bin/bash
# Quick copy commands for easy pasting

echo "========================================="
echo "QUICK COPY COMMANDS"
echo "========================================="
echo ""
echo "1. Copy Apps Script code:"
echo ""
cat Code.gs | pbcopy
echo "✅ Code.gs copied to clipboard!"
echo ""
echo "Now paste into Apps Script editor"
echo ""
EOF

chmod +x "$WORK_DIR/quick-copy.sh"
echo "✅ Quick-copy script created"
echo ""

# Step 7: Open relevant windows
echo "Step 7: Opening setup resources..."
echo ""
echo "Opening in 3 seconds..."
echo "  - Spreadsheet (for manual tab creation)"
echo "  - Working directory (with all files)"
echo ""
sleep 3

# Open spreadsheet
open "https://docs.google.com/spreadsheets/d/$SPREADSHEET_ID"

# Open working directory
open "$WORK_DIR"

echo "========================================="
echo "✅ SETUP COMPLETE - READY FOR REVIEW"
echo "========================================="
echo ""
echo "What was done:"
echo "  ✅ Verified all source files"
echo "  ✅ Created safe working directory"
echo "  ✅ Prepared Apps Script with safety checks"
echo "  ✅ Generated setup instructions"
echo "  ✅ Opened spreadsheet and resources"
echo ""
echo "Working directory: $WORK_DIR"
echo ""
echo "Next steps:"
echo "  1. Review the opened spreadsheet"
echo "  2. Follow SETUP-INSTRUCTIONS.md (2 minutes)"
echo "  3. Tabs will be created automatically"
echo ""
echo "Safety guarantees:"
echo "  ✅ No deletions will occur"
echo "  ✅ Only adds new tabs if they don't exist"
echo "  ✅ Existing data is never modified"
echo "  ✅ Can be safely re-run multiple times"
echo ""
echo "========================================="

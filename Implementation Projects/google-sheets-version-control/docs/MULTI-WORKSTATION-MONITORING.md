---
type: guide
tags: [backup-monitoring, multi-workstation, time-machine, cross-platform]
---

# Multi-Workstation Backup Monitoring

**Purpose:** Monitor local backup status (Layer 6) across multiple developer workstations
**Status:** 🔄 Design Complete - Ready for Implementation
**Created:** 2025-11-13
**Priority:** High

---

## Problem Statement

**Current Limitation:**
- Layer 6 (Time Machine) only monitors the main developer's Mac workstation
- Other team members (Alvaro, etc.) have independent workstations with their own backups
- No visibility into whether team members' local backups are working
- Need cross-platform support (Mac/Windows/Linux)

**Requirements:**
- ✅ Automated monitoring (no manual reporting)
- ✅ Cross-platform support (Mac, Windows, Linux)
- ✅ Integration with existing Google Sheets monitoring dashboard
- ✅ Privacy-respecting (each workstation reports own status only)
- ✅ Simple installation and maintenance

---

## Solution Architecture

### Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Developer Workstations                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Mac (Time Machine)          Windows (File History)              │
│  ├── monitor-agent.sh        ├── monitor-agent.ps1               │
│  └── Cron: hourly            └── Task Scheduler: hourly          │
│                                                                   │
│  Linux (rsync/Timeshift)                                         │
│  ├── monitor-agent.sh                                            │
│  └── Cron: hourly                                                │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓ HTTPS POST (status report)
                              │
┌─────────────────────────────────────────────────────────────────┐
│                 Apps Script Web App (Webhook)                    │
│  URL: https://script.google.com/macros/s/.../exec               │
│  - Receives status reports from workstations                     │
│  - Validates payload (device ID, timestamp, status)              │
│  - Writes to "Layer 6 - Workstation Backups" tab                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              Google Sheets: "Daily Snapshot Log"                 │
├─────────────────────────────────────────────────────────────────┤
│  📊 Backup Overview (updated with workstation data)              │
│  Layer 6 - Workstation Backups (one row per computer)           │
│     - Device: "Mark's Mac", "Alvaro's Windows", etc.            │
│     - Last Backup: timestamp                                     │
│     - Status: ✅ Active / ⚠️ Stale / ❌ Error                    │
│     - Destination: backup drive name/path                        │
│     - Last Check: when script last ran                           │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Hourly Monitoring**
   - Monitoring agent runs on each workstation (cron/Task Scheduler)
   - Checks local backup status (platform-specific commands)
   - Generates JSON payload with status

2. **Status Reporting**
   - Agent sends HTTPS POST to Apps Script webhook
   - Payload includes: device ID, user, timestamp, backup status, destination
   - Webhook validates and logs to Google Sheets

3. **Dashboard Display**
   - Each workstation gets dedicated row in Layer 6 tab
   - Overview tab shows aggregated status (all workstations green/yellow/red)
   - Alert if any workstation backup >24 hours old

---

## Implementation Components

### 1. Workstation Monitoring Agents

#### Mac (Time Machine) - `monitor-agent-mac.sh`

```bash
#!/bin/bash
# Monitor Time Machine backup status and report to central dashboard

WEBHOOK_URL="YOUR_APPS_SCRIPT_WEBHOOK_URL"
DEVICE_ID="$(scutil --get ComputerName)"
USER="$(whoami)"

# Get Time Machine status
LATEST_BACKUP=$(tmutil latestbackup)
BACKUP_DATE=$(tmutil latestbackupdate 2>/dev/null | head -1)
DESTINATION=$(tmutil destinationinfo | grep "Name" | head -1 | cut -d: -f2 | xargs)

# Determine status
if [ -z "$LATEST_BACKUP" ]; then
    STATUS="❌ ERROR"
    MESSAGE="No backups found"
elif [ -z "$BACKUP_DATE" ]; then
    STATUS="⚠️ WARNING"
    MESSAGE="Backup found but no date"
else
    # Check if backup is recent (within 24 hours)
    BACKUP_TIMESTAMP=$(date -j -f "%a %b %d %H:%M:%S %Z %Y" "$BACKUP_DATE" "+%s" 2>/dev/null)
    NOW=$(date +%s)
    AGE_HOURS=$(( ($NOW - $BACKUP_TIMESTAMP) / 3600 ))

    if [ $AGE_HOURS -lt 24 ]; then
        STATUS="✅ ACTIVE"
        MESSAGE="Backup $AGE_HOURS hours old"
    else
        STATUS="⚠️ STALE"
        MESSAGE="Backup $AGE_HOURS hours old"
    fi
fi

# Create JSON payload
PAYLOAD=$(cat <<EOF
{
  "device_id": "$DEVICE_ID",
  "user": "$USER",
  "platform": "Mac",
  "backup_type": "Time Machine",
  "status": "$STATUS",
  "last_backup": "$BACKUP_DATE",
  "destination": "$DESTINATION",
  "message": "$MESSAGE",
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF
)

# Send to webhook
curl -s -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" \
  > /dev/null 2>&1

exit 0
```

#### Windows (File History) - `monitor-agent-windows.ps1`

```powershell
# Monitor Windows Backup status and report to central dashboard

$WebhookUrl = "YOUR_APPS_SCRIPT_WEBHOOK_URL"
$DeviceId = $env:COMPUTERNAME
$User = $env:USERNAME

# Check File History status
try {
    $fhStatus = Get-WmiObject -Namespace "root\Microsoft\Windows\FileHistory" -Class MSFT_FhConfigInfo -ErrorAction Stop
    $lastBackup = $fhStatus.LastBackupTime
    $destination = $fhStatus.TargetUrl

    if ($lastBackup) {
        $lastBackupDate = [DateTime]::ParseExact($lastBackup, "yyyyMMddHHmmss.ffffff-000", $null)
        $ageHours = ([DateTime]::UtcNow - $lastBackupDate).TotalHours

        if ($ageHours -lt 24) {
            $status = "✅ ACTIVE"
            $message = "Backup $([Math]::Floor($ageHours)) hours old"
        } else {
            $status = "⚠️ STALE"
            $message = "Backup $([Math]::Floor($ageHours)) hours old"
        }
    } else {
        $status = "⚠️ WARNING"
        $message = "No backup timestamp found"
        $lastBackupDate = Get-Date
    }
} catch {
    $status = "❌ ERROR"
    $message = "File History not configured or error checking status"
    $destination = "N/A"
    $lastBackupDate = Get-Date
}

# Create JSON payload
$payload = @{
    device_id = $DeviceId
    user = $User
    platform = "Windows"
    backup_type = "File History"
    status = $status
    last_backup = $lastBackupDate.ToString("yyyy-MM-ddTHH:mm:ssZ")
    destination = $destination
    message = $message
    timestamp = [DateTime]::UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ")
} | ConvertTo-Json

# Send to webhook
try {
    Invoke-RestMethod -Uri $WebhookUrl -Method Post -Body $payload -ContentType "application/json"
} catch {
    # Silent fail - will retry next hour
}

exit 0
```

#### Linux (rsync/Timeshift) - `monitor-agent-linux.sh`

```bash
#!/bin/bash
# Monitor Linux backup status and report to central dashboard

WEBHOOK_URL="YOUR_APPS_SCRIPT_WEBHOOK_URL"
DEVICE_ID="$(hostname)"
USER="$(whoami)"

# Try Timeshift first (popular backup tool)
if command -v timeshift &> /dev/null; then
    BACKUP_TYPE="Timeshift"
    LATEST_BACKUP=$(sudo timeshift --list 2>/dev/null | grep -oP '\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}' | head -1)

    if [ ! -z "$LATEST_BACKUP" ]; then
        BACKUP_DATE=$(date -d "${LATEST_BACKUP:0:10} ${LATEST_BACKUP:11:2}:${LATEST_BACKUP:14:2}:${LATEST_BACKUP:17:2}" +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null)
        DESTINATION=$(sudo timeshift --list | grep "Device" | head -1 | cut -d: -f2 | xargs)
    fi
# Fallback to checking for common rsync backup locations
elif [ -d "/backup" ] || [ -d "$HOME/backup" ]; then
    BACKUP_TYPE="rsync"
    BACKUP_DIR="/backup"
    [ -d "$HOME/backup" ] && BACKUP_DIR="$HOME/backup"

    LATEST_BACKUP=$(find "$BACKUP_DIR" -type f -name "*.tar.gz" -o -name "backup-*" 2>/dev/null | sort | tail -1)
    if [ ! -z "$LATEST_BACKUP" ]; then
        BACKUP_DATE=$(stat -c %y "$LATEST_BACKUP" | cut -d. -f1 | xargs date -d "$1" +"%Y-%m-%dT%H:%M:%SZ")
        DESTINATION="$BACKUP_DIR"
    fi
else
    BACKUP_TYPE="Unknown"
    STATUS="⚠️ NO BACKUP"
    MESSAGE="No backup system detected"
    BACKUP_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    DESTINATION="N/A"
fi

# Determine status if we found a backup
if [ "$BACKUP_TYPE" != "Unknown" ]; then
    if [ -z "$BACKUP_DATE" ]; then
        STATUS="❌ ERROR"
        MESSAGE="No backups found"
    else
        BACKUP_TIMESTAMP=$(date -d "$BACKUP_DATE" +%s 2>/dev/null || echo 0)
        NOW=$(date +%s)
        AGE_HOURS=$(( ($NOW - $BACKUP_TIMESTAMP) / 3600 ))

        if [ $AGE_HOURS -lt 24 ]; then
            STATUS="✅ ACTIVE"
            MESSAGE="Backup $AGE_HOURS hours old"
        else
            STATUS="⚠️ STALE"
            MESSAGE="Backup $AGE_HOURS hours old"
        fi
    fi
fi

# Create JSON payload
PAYLOAD=$(cat <<EOF
{
  "device_id": "$DEVICE_ID",
  "user": "$USER",
  "platform": "Linux",
  "backup_type": "$BACKUP_TYPE",
  "status": "$STATUS",
  "last_backup": "$BACKUP_DATE",
  "destination": "$DESTINATION",
  "message": "$MESSAGE",
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF
)

# Send to webhook
curl -s -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" \
  > /dev/null 2>&1

exit 0
```

### 2. Apps Script Webhook

File: `scripts/workstation-backup-webhook.js`

```javascript
/**
 * Workstation Backup Monitoring Webhook
 * Receives status reports from developer workstations and logs to Google Sheets
 */

const SPREADSHEET_ID = '1KpUhrEtW7-uHHS6GIngiXws0v2aM2wBC5ppyDBnRKxc';
const SHEET_NAME = 'Layer 6 - Workstation Backups';

/**
 * Web App entry point - handles POST requests from workstation agents
 */
function doPost(e) {
  try {
    // Parse incoming JSON payload
    const payload = JSON.parse(e.postData.contents);

    // Validate required fields
    if (!payload.device_id || !payload.status || !payload.timestamp) {
      return ContentService.createTextOutput(JSON.stringify({
        'status': 'error',
        'message': 'Missing required fields'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Log to Google Sheets
    logWorkstationStatus(payload);

    // Return success
    return ContentService.createTextOutput(JSON.stringify({
      'status': 'success',
      'message': 'Status logged successfully'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error('Error processing webhook:', error);
    return ContentService.createTextOutput(JSON.stringify({
      'status': 'error',
      'message': error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Log workstation status to Google Sheets
 */
function logWorkstationStatus(payload) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);

  // Create sheet if it doesn't exist
  if (!sheet) {
    sheet = createWorkstationBackupSheet(ss);
  }

  // Check if device already has a row
  const data = sheet.getDataRange().getValues();
  let deviceRow = -1;

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === payload.device_id) {
      deviceRow = i + 1; // +1 for 1-indexed
      break;
    }
  }

  // Prepare row data
  const rowData = [
    payload.device_id,                    // A: Device ID
    payload.user,                         // B: User
    payload.platform,                     // C: Platform
    payload.backup_type,                  // D: Backup Type
    payload.status,                       // E: Status
    payload.last_backup,                  // F: Last Backup
    payload.destination,                  // G: Destination
    payload.message,                      // H: Message
    payload.timestamp,                    // I: Last Check
    new Date().toISOString()              // J: Last Updated
  ];

  if (deviceRow > 0) {
    // Update existing row
    sheet.getRange(deviceRow, 1, 1, rowData.length).setValues([rowData]);
  } else {
    // Append new row
    sheet.appendRow(rowData);
  }

  // Update overview tab
  updateOverviewForWorkstations(ss);
}

/**
 * Create the workstation backup monitoring sheet
 */
function createWorkstationBackupSheet(ss) {
  const sheet = ss.insertSheet(SHEET_NAME);

  // Header row
  const headers = [
    'Device ID',
    'User',
    'Platform',
    'Backup Type',
    'Status',
    'Last Backup',
    'Destination',
    'Message',
    'Last Check',
    'Last Updated'
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // Format header
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#1a73e8');
  headerRange.setFontColor('#ffffff');
  headerRange.setFontWeight('bold');

  // Set column widths
  sheet.setColumnWidth(1, 150); // Device ID
  sheet.setColumnWidth(2, 100); // User
  sheet.setColumnWidth(3, 80);  // Platform
  sheet.setColumnWidth(4, 120); // Backup Type
  sheet.setColumnWidth(5, 100); // Status
  sheet.setColumnWidth(6, 180); // Last Backup
  sheet.setColumnWidth(7, 200); // Destination
  sheet.setColumnWidth(8, 200); // Message
  sheet.setColumnWidth(9, 180); // Last Check
  sheet.setColumnWidth(10, 180); // Last Updated

  // Freeze header row
  sheet.setFrozenRows(1);

  return sheet;
}

/**
 * Update the overview tab with workstation summary
 */
function updateOverviewForWorkstations(ss) {
  const workstationSheet = ss.getSheetByName(SHEET_NAME);
  const overviewSheet = ss.getSheetByName('📊 Backup Overview');

  if (!workstationSheet || !overviewSheet) return;

  // Get all workstation data
  const data = workstationSheet.getDataRange().getValues();

  if (data.length <= 1) return; // Only header row

  // Count statuses
  let activeCount = 0;
  let warningCount = 0;
  let errorCount = 0;
  let totalWorkstations = data.length - 1; // Exclude header

  for (let i = 1; i < data.length; i++) {
    const status = data[i][4]; // Column E: Status
    if (status.includes('ACTIVE')) activeCount++;
    else if (status.includes('WARNING') || status.includes('STALE')) warningCount++;
    else if (status.includes('ERROR')) errorCount++;
  }

  // Find Layer 6 row in overview (assuming it's row 7)
  const layer6Row = 7; // Adjust based on your overview layout

  // Update overview with aggregated status
  let overallStatus = '✅ ACTIVE';
  if (errorCount > 0) overallStatus = '❌ ERROR';
  else if (warningCount > 0) overallStatus = '⚠️ WARNING';

  overviewSheet.getRange(layer6Row, 3).setValue(overallStatus); // Status column
  overviewSheet.getRange(layer6Row, 7).setValue(`${activeCount}/${totalWorkstations} workstations healthy`); // Notes
}

/**
 * Test function - run manually to test webhook
 */
function testWorkstationWebhook() {
  const testPayload = {
    device_id: "Test-Mac",
    user: "testuser",
    platform: "Mac",
    backup_type: "Time Machine",
    status: "✅ ACTIVE",
    last_backup: "2025-11-13 10:00:00",
    destination: "Time Machine Backup Drive",
    message: "Backup 2 hours old",
    timestamp: new Date().toISOString()
  };

  logWorkstationStatus(testPayload);
  console.log("Test payload logged successfully");
}
```

### 3. Installation Scripts

#### Mac/Linux Installation - `install-workstation-monitor.sh`

```bash
#!/bin/bash
# Install workstation backup monitoring agent

echo "Installing Workstation Backup Monitor..."

# Detect platform
if [[ "$OSTYPE" == "darwin"* ]]; then
    PLATFORM="mac"
    SCRIPT_NAME="monitor-agent-mac.sh"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    PLATFORM="linux"
    SCRIPT_NAME="monitor-agent-linux.sh"
else
    echo "Unsupported platform: $OSTYPE"
    exit 1
fi

# Prompt for webhook URL
read -p "Enter Apps Script webhook URL: " WEBHOOK_URL

if [ -z "$WEBHOOK_URL" ]; then
    echo "Error: Webhook URL required"
    exit 1
fi

# Download monitoring script
INSTALL_DIR="$HOME/.workstation-monitor"
mkdir -p "$INSTALL_DIR"

# Copy script (assuming it's in same directory as installer)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cp "$SCRIPT_DIR/$SCRIPT_NAME" "$INSTALL_DIR/monitor-agent.sh"

# Update webhook URL in script
sed -i.bak "s|YOUR_APPS_SCRIPT_WEBHOOK_URL|$WEBHOOK_URL|g" "$INSTALL_DIR/monitor-agent.sh"
rm "$INSTALL_DIR/monitor-agent.sh.bak"

# Make executable
chmod +x "$INSTALL_DIR/monitor-agent.sh"

# Install cron job
CRON_JOB="0 * * * * $INSTALL_DIR/monitor-agent.sh"

# Check if cron job already exists
if ! crontab -l 2>/dev/null | grep -q "monitor-agent.sh"; then
    (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
    echo "✅ Cron job installed (runs hourly)"
else
    echo "ℹ️  Cron job already exists"
fi

# Test the script
echo ""
echo "Testing monitoring agent..."
$INSTALL_DIR/monitor-agent.sh

echo ""
echo "✅ Installation complete!"
echo ""
echo "The monitoring agent will run every hour and report backup status."
echo "To manually run: $INSTALL_DIR/monitor-agent.sh"
echo "To uninstall: crontab -e (remove the monitor-agent.sh line)"
```

#### Windows Installation - `install-workstation-monitor.ps1`

```powershell
# Install workstation backup monitoring agent for Windows

Write-Host "Installing Workstation Backup Monitor for Windows..." -ForegroundColor Cyan

# Prompt for webhook URL
$WebhookUrl = Read-Host "Enter Apps Script webhook URL"

if ([string]::IsNullOrWhiteSpace($WebhookUrl)) {
    Write-Host "Error: Webhook URL required" -ForegroundColor Red
    exit 1
}

# Install directory
$InstallDir = "$env:USERPROFILE\.workstation-monitor"
New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null

# Copy monitoring script
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Copy-Item "$ScriptDir\monitor-agent-windows.ps1" "$InstallDir\monitor-agent.ps1"

# Update webhook URL
(Get-Content "$InstallDir\monitor-agent.ps1") -replace 'YOUR_APPS_SCRIPT_WEBHOOK_URL', $WebhookUrl | Set-Content "$InstallDir\monitor-agent.ps1"

# Create scheduled task
$Action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-WindowStyle Hidden -File `"$InstallDir\monitor-agent.ps1`""
$Trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Hours 1)
$Principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive
$Settings = New-ScheduledTaskSettingsSet -Hidden -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries

# Register task
Register-ScheduledTask -TaskName "WorkstationBackupMonitor" -Action $Action -Trigger $Trigger -Principal $Principal -Settings $Settings -Force | Out-Null

Write-Host ""
Write-Host "✅ Installation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "The monitoring agent will run every hour and report backup status."
Write-Host "To manually run: PowerShell -File $InstallDir\monitor-agent.ps1"
Write-Host "To uninstall: Task Scheduler > Delete 'WorkstationBackupMonitor' task"
```

---

## Google Sheets Tab Structure

### Updated "Layer 6 - Workstation Backups"

| Device ID | User | Platform | Backup Type | Status | Last Backup | Destination | Message | Last Check | Last Updated |
|-----------|------|----------|-------------|--------|-------------|-------------|---------|------------|--------------|
| Marks-MacBook-Pro | mark | Mac | Time Machine | ✅ ACTIVE | 2025-11-13 10:00:00 | My Passport | Backup 2 hours old | 2025-11-13 12:00:00 | 2025-11-13 12:00:15 |
| Alvaro-PC | alvaro | Windows | File History | ✅ ACTIVE | 2025-11-13 09:30:00 | External HDD | Backup 2.5 hours old | 2025-11-13 12:00:00 | 2025-11-13 12:00:20 |
| Dev-Server-Ubuntu | jenkins | Linux | rsync | ⚠️ STALE | 2025-11-12 08:00:00 | /backup | Backup 28 hours old | 2025-11-13 12:00:00 | 2025-11-13 12:00:25 |

### Updated "📊 Backup Overview"

Add workstation summary to Layer 6 row:

| Layer | Component | Status | Last Success | Success Rate (7d) | Notes |
|-------|-----------|--------|--------------|-------------------|-------|
| 6 | Workstation Backups | ✅ ACTIVE | 2025-11-13 12:00:00 | 95% | 2/3 workstations healthy |

---

## Installation Guide for Team Members

### Quick Start (5 minutes per workstation)

#### For Mac Users

1. **Get the webhook URL** from team lead (starts with `https://script.google.com/macros/s/...`)

2. **Download installation script:**
   ```bash
   cd ~/Downloads
   # Download or copy install-workstation-monitor.sh and monitor-agent-mac.sh
   ```

3. **Run installer:**
   ```bash
   chmod +x install-workstation-monitor.sh
   ./install-workstation-monitor.sh
   ```

4. **Enter webhook URL when prompted**

5. **Verify installation:**
   - Check cron job: `crontab -l | grep monitor-agent`
   - Wait 1 hour, then check Google Sheets for your device

#### For Windows Users

1. **Get the webhook URL** from team lead

2. **Download installation script:**
   - Download `install-workstation-monitor.ps1` and `monitor-agent-windows.ps1`

3. **Run installer (as Administrator):**
   ```powershell
   PowerShell -ExecutionPolicy Bypass -File install-workstation-monitor.ps1
   ```

4. **Enter webhook URL when prompted**

5. **Verify installation:**
   - Check Task Scheduler for "WorkstationBackupMonitor" task
   - Wait 1 hour, then check Google Sheets for your device

#### For Linux Users

Same as Mac installation (uses bash script).

---

## Maintenance

### Daily (Automated)
- Monitoring agents run hourly on each workstation
- Status automatically logged to Google Sheets
- Overview dashboard updates automatically

### Weekly
- Review Layer 6 tab for any stale or error statuses
- Verify all team members' workstations are reporting
- Check for devices that haven't reported in 24+ hours

### Monthly
- Audit which workstations are active
- Remove decommissioned devices from sheet
- Update webhook URL if Apps Script redeployed

---

## Alerts and Notifications

### Alert Conditions

The system should flag:

1. **Stale Backup** - Workstation backup >24 hours old
2. **Missing Reports** - Workstation hasn't checked in for 6+ hours
3. **Error Status** - Backup system error on any workstation
4. **Low Coverage** - Less than 80% of expected workstations reporting

### Notification Options (Optional Enhancement)

Add to Apps Script:

```javascript
function checkAndAlert() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();

  const alerts = [];
  const now = new Date();

  for (let i = 1; i < data.length; i++) {
    const deviceId = data[i][0];
    const status = data[i][4];
    const lastCheck = new Date(data[i][8]);

    // Check if stale
    const hoursSinceCheck = (now - lastCheck) / (1000 * 60 * 60);

    if (hoursSinceCheck > 6) {
      alerts.push(`⚠️ ${deviceId} hasn't reported in ${Math.floor(hoursSinceCheck)} hours`);
    }

    if (status.includes('ERROR') || status.includes('STALE')) {
      alerts.push(`⚠️ ${deviceId}: ${status}`);
    }
  }

  if (alerts.length > 0) {
    // Send email alert
    MailApp.sendEmail({
      to: 'team@example.com',
      subject: '⚠️ Workstation Backup Alerts',
      body: alerts.join('\n')
    });
  }
}

// Set up daily trigger
function createAlertTrigger() {
  ScriptApp.newTrigger('checkAndAlert')
    .timeBased()
    .everyDays(1)
    .atHour(9)
    .create();
}
```

---

## Security Considerations

1. **Webhook URL Protection**
   - URL is obscure and hard to guess
   - Apps Script can validate device IDs (whitelist)
   - No sensitive data transmitted (only backup metadata)

2. **Privacy**
   - Each workstation only reports own status
   - No file contents or personal data transmitted
   - Minimal metadata: device name, user, backup timestamps

3. **Access Control**
   - Google Sheets permissions control who can view status
   - Webhook is write-only (cannot read data)

---

## Cost

- **Apps Script**: Free (within quota limits)
- **Google Sheets**: Free (existing spreadsheet)
- **Bandwidth**: Negligible (~1 KB per report, 24 reports/day/device)
- **Total**: $0/month

---

## Troubleshooting

### Device Not Appearing in Sheet

1. Check webhook URL is correct in monitoring script
2. Manually run script and check for errors
3. Check Apps Script execution logs
4. Verify cron job/scheduled task is running

### Status Shows as Error

1. Check if backup system is configured on that workstation
2. Review error message in "Message" column
3. Manually run monitoring script to see detailed error
4. Verify backup permissions (may need sudo on Linux)

### Script Not Running Hourly

**Mac/Linux:**
```bash
crontab -l  # List cron jobs
```

**Windows:**
- Open Task Scheduler
- Look for "WorkstationBackupMonitor" task
- Check "Last Run Time" and "Next Run Time"

---

## Future Enhancements

1. **Mobile App Integration** - iOS/Android apps for remote monitoring
2. **Backup Size Tracking** - Track backup size trends over time
3. **Performance Metrics** - Backup speed, compression ratio
4. **Recovery Testing** - Automated recovery drills
5. **Cloud Backup Integration** - Monitor cloud backup services (Backblaze, CrashPlan)
6. **Slack/Teams Integration** - Real-time alerts in team chat

---

## References

- Main project: `PROJECT-OVERVIEW.md`
- Backup strategy: `COMPREHENSIVE-BACKUP-STRATEGY.md`
- Current monitoring: `BACKUP-MONITORING-SYSTEM.md`
- Google Sheets: [Daily Snapshot Log](https://docs.google.com/spreadsheets/d/1KpUhrEtW7-uHHS6GIngiXws0v2aM2wBC5ppyDBnRKxc)

---

## Changelog

### 2025-11-13 - Initial Design
- Created multi-workstation monitoring architecture
- Designed monitoring agents for Mac/Windows/Linux
- Built Apps Script webhook endpoint
- Updated Google Sheets tab structure
- Created installation guides

**Next Steps:**
1. Deploy Apps Script webhook and get URL
2. Test with one workstation (Mac)
3. Roll out to all team members
4. Monitor for 1 week
5. Add alert notifications

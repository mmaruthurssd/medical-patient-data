# Backup Monitoring System

## Overview

Comprehensive monitoring and logging system for all 6 backup protection layers, integrated with the Daily Snapshot Log spreadsheet.

**Spreadsheet:** [Daily Snapshot Log - SSD Google Sheets](https://docs.google.com/spreadsheets/d/1KpUhrEtW7-uHHS6GIngiXws0v2aM2wBC5ppyDBnRKxc)

## Architecture

### Tabs Structure

1. **📊 Backup Overview** - Master dashboard with summary metrics
2. **Layer 1 - Google Drive** - Source of truth snapshot logs
3. **Layer 2 - Local Git** - Commit and version control logs
4. **Layer 3 - GitHub** - Push and sync logs
5. **Layer 4 - Branch Protection** - Protection rule checks
6. **Layer 5 - GCS Backup** - Cloud backup logs
7. **Layer 6 - Time Machine** - Local backup verification logs

### Data Flow

```
Layer Events → Local CSV Logs → Apps Script → Google Sheets Tabs → Overview Dashboard
```

## Implementation (5 Steps)

### Step 1: Create Monitoring Tabs (5 minutes)

1. Open the Apps Script editor:
   ```bash
   open "https://script.google.com/home"
   ```

2. Create a new script in the Daily Snapshot Log spreadsheet

3. Copy the contents of `scripts/backup-monitoring-logger.js`

4. Run the function `setupBackupMonitoringTabs()`

5. Verify all 7 tabs are created with proper formatting

### Step 2: Set Up Local Logging (2 minutes)

Make scripts executable:

```bash
cd "Implementation Projects/google-sheets-version-control"
chmod +x scripts/setup-backup-monitoring.sh
chmod +x scripts/log-to-monitoring.sh
```

Create logs directory:

```bash
mkdir -p logs
touch logs/.gitkeep
```

### Step 3: Integrate Logging into Existing Scripts (10 minutes)

#### Layer 1: Google Drive Snapshots

Add to `scripts/snapshot-production-initial.sh` (or similar):

```bash
# Source logging functions
source "$(dirname "$0")/log-to-monitoring.sh"

# At the end of snapshot process
log_layer1 "$SHEETS_COUNT" "✅ SUCCESS" "Production snapshot completed" "$DURATION"
```

#### Layer 2: Local Git Commits

Add to `.git/hooks/post-commit`:

```bash
#!/bin/bash
source "scripts/log-to-monitoring.sh"

COMMIT_SHA=$(git rev-parse --short HEAD)
FILES_CHANGED=$(git diff --name-only HEAD~1 | wc -l)
MESSAGE=$(git log -1 --pretty=%B)

log_layer2 "$COMMIT_SHA" "$FILES_CHANGED" "✅ Committed" "$MESSAGE"
```

#### Layer 3: GitHub Pushes

Add to `scripts/pre-push-hook.sh`:

```bash
# After successful push
source "$(dirname "$0")/log-to-monitoring.sh"

COMMIT_SHA=$(git rev-parse --short HEAD)
BRANCH=$(git rev-parse --abbrev-ref HEAD)

log_layer3 "$COMMIT_SHA" "$BRANCH" "✅ Pushed" "Pre-push checks passed" "Push successful"
```

#### Layer 4: Branch Protection

Add to daily health check:

```bash
source "scripts/log-to-monitoring.sh"

# Check GitHub branch protection
if gh api repos/owner/repo/branches/main/protection >/dev/null 2>&1; then
    log_layer4 "Health Check" "main" "✅ Active" "0" "Protection rules verified"
else
    log_layer4 "Health Check" "main" "⚠️ Inactive" "0" "Protection rules not found"
fi
```

#### Layer 5: GCS Backup

Add to `.github/workflows/backup-to-gcs.yml`:

```yaml
- name: Log to monitoring
  if: success()
  run: |
    # Parse backup details
    BACKUP_FILE="${BACKUP_FILE}"
    SIZE_MB=$(echo "$BACKUP_SIZE" | sed 's/M//')

    # Write to CSV (will be uploaded later)
    echo "$(date -u +%Y-%m-%dT%H:%M:%SZ),Backup,$BACKUP_FILE,$SIZE_MB,✅ SUCCESS,$((SECONDS)),$CHECKSUM_OK,${GITHUB_RUN_ID}" >> logs/layer5-events.csv

    # Commit and push log
    git add logs/layer5-events.csv
    git commit -m "chore: log Layer 5 backup event" || true
    git push || true
```

#### Layer 6: Time Machine

Add to daily health check:

```bash
source "scripts/log-to-monitoring.sh"

LATEST_BACKUP=$(tmutil latestbackup)
DESTINATION=$(tmutil destinationinfo | grep "Name" | head -1 | cut -d: -f2)

if [ ! -z "$LATEST_BACKUP" ]; then
    log_layer6 "Health Check" "$DESTINATION" "✅ Active" "$LATEST_BACKUP" "Time Machine working"
else
    log_layer6 "Health Check" "$DESTINATION" "⚠️ No recent backup" "N/A" "Check Time Machine"
fi
```

### Step 4: Upload Events to Google Sheets (3 minutes)

Create an Apps Script trigger to periodically upload CSV logs:

```javascript
/**
 * Upload CSV logs from GitHub to Google Sheets
 * Run this via time-based trigger every hour
 */
function uploadPendingLogs() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  // Fetch CSV files from GitHub raw content
  const baseUrl = 'https://raw.githubusercontent.com/mmaruthurssd/ssd-google-sheets-staging-production/main/logs/';

  for (let layer = 1; layer <= 6; layer++) {
    const url = baseUrl + `layer${layer}-events.csv`;

    try {
      const response = UrlFetchApp.fetch(url);
      const csv = response.getContentText();
      const lines = csv.split('\n').filter(line => line.trim());

      if (lines.length === 0) continue;

      const sheetNames = [null, 'Layer 1 - Google Drive', 'Layer 2 - Local Git',
                          'Layer 3 - GitHub', 'Layer 4 - Branch Protection',
                          'Layer 5 - GCS Backup', 'Layer 6 - Time Machine'];
      const sheet = ss.getSheetByName(sheetNames[layer]);

      lines.forEach(line => {
        const values = line.split(',');
        sheet.appendRow(values);
      });

      console.log(`Uploaded ${lines.length} events for Layer ${layer}`);
    } catch (e) {
      console.log(`No new events for Layer ${layer}`);
    }
  }

  // Update overview after upload
  updateOverview(ss);
}

/**
 * Set up hourly trigger
 */
function createUploadTrigger() {
  ScriptApp.newTrigger('uploadPendingLogs')
    .timeBased()
    .everyHours(1)
    .create();
}
```

### Step 5: Configure Overview Dashboard (2 minutes)

The overview tab automatically updates when events are logged. It displays:

- **Status**: Latest status for each layer (✅/⚠️)
- **Last Success**: Timestamp of last successful event
- **Last Check**: When the layer was last checked
- **Success Rate (7d)**: Percentage of successful events in last 7 days
- **Total Events**: Count of all logged events
- **Issues**: Count of failures/warnings
- **Next Scheduled**: When next event is expected

## Monitoring Features

### Real-Time Status

- Each layer shows live status (Active/Warning/Error)
- Color-coded tabs for quick identification
- Automatic overview updates

### Historical Data

- All events are logged with timestamps
- Track patterns and trends over time
- Calculate success rates and reliability metrics

### Alerts

The system will flag:

- Layers with <80% success rate (7 days)
- Layers with no events in expected timeframe
- Layers showing consecutive failures
- Abnormal patterns (e.g., sudden spike in failures)

## Sample Log Entries

### Layer 1 (Google Drive)

| Timestamp | Event Type | Sheets Count | Status | Details | Duration (s) |
|-----------|------------|--------------|--------|---------|--------------|
| 2025-11-13 04:30:00 | Snapshot | 792 | ✅ SUCCESS | Production snapshot completed | 180 |

### Layer 5 (GCS Backup)

| Timestamp | Event Type | Backup File | Size (MB) | Status | Duration (s) | Checksum Verified | Workflow Run |
|-----------|------------|-------------|-----------|--------|--------------|-------------------|--------------|
| 2025-11-13 04:41:18 | Backup | ssd-sheets-backup-20251113-044151.tar.gz | 6.5 | ✅ SUCCESS | 45 | ✅ Yes | 19320758248 |

## Maintenance

### Daily

- Events are automatically logged as they occur
- Overview dashboard updates automatically
- No manual intervention required

### Weekly

- Review overview tab for any warnings
- Check success rates across all layers
- Verify all layers are logging events

### Monthly

- Review historical trends
- Archive old events if needed (keep last 90 days)
- Update retention policies if necessary

## Troubleshooting

### No Events Showing

1. Check that tabs were created properly
2. Verify Apps Script has permissions
3. Check CSV log files exist in `logs/` directory
4. Ensure upload trigger is configured

### Events Not Uploading

1. Check GitHub raw content URLs are accessible
2. Verify Apps Script trigger is running
3. Check Apps Script execution logs
4. Manually run `uploadPendingLogs()`

### Overview Not Updating

1. Manually run `updateOverview(ss)`
2. Check for formula errors in overview tab
3. Verify data exists in layer tabs

## Cost

- **Google Sheets**: Free (within quota limits)
- **Apps Script**: Free (within quota limits)
- **Additional Storage**: None required

## Security

- CSV logs are stored in private GitHub repository
- Apps Script only has access to specific spreadsheet
- No sensitive data logged (only metadata and status)
- Service account credentials not exposed

## Next Steps

After implementation:

1. Monitor for 1 week to validate logging
2. Adjust logging frequency if needed
3. Add custom alerts based on patterns
4. Create monthly summary reports
5. Integrate with notification system (email/Slack)

## References

- Apps Script file: `scripts/backup-monitoring-logger.js`
- Logging wrapper: `scripts/log-to-monitoring.sh`
- Setup script: `scripts/setup-backup-monitoring.sh`
- Spreadsheet: [Daily Snapshot Log](https://docs.google.com/spreadsheets/d/1KpUhrEtW7-uHHS6GIngiXws0v2aM2wBC5ppyDBnRKxc)

## Support

For issues or questions:
1. Check Apps Script execution logs
2. Review this documentation
3. Check PROJECT-OVERVIEW.md for backup strategy details

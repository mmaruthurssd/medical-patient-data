#!/bin/bash
# Monitor Time Machine backup status and report to central dashboard
# Platform: macOS
# Installation: Run install-workstation-monitor.sh

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
    BACKUP_DATE="N/A"
elif [ -z "$BACKUP_DATE" ]; then
    STATUS="⚠️ WARNING"
    MESSAGE="Backup found but no date"
    BACKUP_DATE="N/A"
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

# Default destination if not found
[ -z "$DESTINATION" ] && DESTINATION="N/A"

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

# Log result (optional - for debugging)
# echo "$(date): Reported status: $STATUS" >> ~/.workstation-monitor/monitor.log

exit 0

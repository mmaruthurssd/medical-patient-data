#!/bin/bash
# Monitor Linux backup status and report to central dashboard
# Platform: Linux (Ubuntu, Debian, RHEL, etc.)
# Installation: Run install-workstation-monitor.sh

WEBHOOK_URL="YOUR_APPS_SCRIPT_WEBHOOK_URL"
DEVICE_ID="$(hostname)"
USER="$(whoami)"

# Initialize variables
BACKUP_TYPE="Unknown"
STATUS="⚠️ NO BACKUP"
MESSAGE="No backup system detected"
BACKUP_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
DESTINATION="N/A"

# Try Timeshift first (popular backup tool)
if command -v timeshift &> /dev/null; then
    BACKUP_TYPE="Timeshift"
    LATEST_BACKUP=$(sudo timeshift --list 2>/dev/null | grep -oP '\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}' | head -1)

    if [ ! -z "$LATEST_BACKUP" ]; then
        # Parse timeshift format: YYYY-MM-DD_HH-MM-SS
        BACKUP_DATE=$(date -d "${LATEST_BACKUP:0:10} ${LATEST_BACKUP:11:2}:${LATEST_BACKUP:14:2}:${LATEST_BACKUP:17:2}" +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null)
        DESTINATION=$(sudo timeshift --list 2>/dev/null | grep "Device" | head -1 | cut -d: -f2 | xargs)

        # Calculate age
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
    else
        STATUS="❌ ERROR"
        MESSAGE="Timeshift installed but no backups found"
    fi

# Check for rsync backups in common locations
elif [ -d "/backup" ] || [ -d "$HOME/backup" ] || [ -d "/var/backups" ]; then
    BACKUP_TYPE="rsync"

    # Try multiple common backup locations
    for BACKUP_DIR in "/backup" "$HOME/backup" "/var/backups"; do
        if [ -d "$BACKUP_DIR" ]; then
            # Find most recent backup file or directory
            LATEST_BACKUP=$(find "$BACKUP_DIR" -type f \( -name "*.tar.gz" -o -name "*.tar" -o -name "backup-*" \) 2>/dev/null | sort | tail -1)

            if [ -z "$LATEST_BACKUP" ]; then
                # Try finding most recent directory
                LATEST_BACKUP=$(find "$BACKUP_DIR" -maxdepth 1 -type d -name "*backup*" 2>/dev/null | sort | tail -1)
            fi

            if [ ! -z "$LATEST_BACKUP" ]; then
                # Get file modification time
                if [[ "$OSTYPE" == "darwin"* ]]; then
                    BACKUP_DATE=$(stat -f "%Sm" -t "%Y-%m-%dT%H:%M:%SZ" "$LATEST_BACKUP" 2>/dev/null)
                else
                    BACKUP_DATE=$(stat -c %y "$LATEST_BACKUP" 2>/dev/null | cut -d. -f1 | sed 's/ /T/' | sed 's/$/Z/')
                fi

                DESTINATION="$BACKUP_DIR"

                # Calculate age
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

                break
            fi
        fi
    done

    # If no backups found
    if [ "$DESTINATION" == "N/A" ]; then
        STATUS="❌ ERROR"
        MESSAGE="Backup directory exists but no backups found"
    fi

# Check for Duplicity backups
elif command -v duplicity &> /dev/null; then
    BACKUP_TYPE="Duplicity"
    # Duplicity status check would go here
    STATUS="⚠️ WARNING"
    MESSAGE="Duplicity detected but status check not implemented"

# Check for Borg backups
elif command -v borg &> /dev/null; then
    BACKUP_TYPE="BorgBackup"
    # Borg status check would go here
    STATUS="⚠️ WARNING"
    MESSAGE="BorgBackup detected but status check not implemented"
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

# Log result (optional - for debugging)
# echo "$(date): Reported status: $STATUS" >> ~/.workstation-monitor/monitor.log

exit 0

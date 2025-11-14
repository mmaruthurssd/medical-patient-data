#!/bin/bash

# Shell wrapper to log backup events to Google Sheets monitoring system
# Uses clasp to call Apps Script functions

SPREADSHEET_ID="1KpUhrEtW7-uHHS6GIngiXws0v2aM2wBC5ppyDBnRKxc"
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Function to log Layer 1 event (Google Drive snapshot)
log_layer1() {
    local sheets_count=$1
    local status=$2
    local details=$3
    local duration=$4

    echo "[Layer 1] Logging: $sheets_count sheets, $status, $duration seconds"

    # Call Apps Script function via clasp (if available) or direct API
    # For now, write to local log that can be batch uploaded
    echo "$(date -u +"%Y-%m-%dT%H:%M:%SZ"),Snapshot,$sheets_count,$status,$details,$duration" >> "$SCRIPT_DIR/../logs/layer1-events.csv"
}

# Function to log Layer 2 event (Local Git)
log_layer2() {
    local commit_sha=$1
    local files_changed=$2
    local status=$3
    local message=$4

    echo "[Layer 2] Logging: $commit_sha, $files_changed files, $status"

    echo "$(date -u +"%Y-%m-%dT%H:%M:%SZ"),Commit,$commit_sha,$files_changed,$status,$message" >> "$SCRIPT_DIR/../logs/layer2-events.csv"
}

# Function to log Layer 3 event (GitHub)
log_layer3() {
    local commit_sha=$1
    local branch=$2
    local status=$3
    local precheck=$4
    local details=$5

    echo "[Layer 3] Logging: Push to $branch, $status"

    echo "$(date -u +"%Y-%m-%dT%H:%M:%SZ"),Push,$commit_sha,$branch,$status,$precheck,$details" >> "$SCRIPT_DIR/../logs/layer3-events.csv"
}

# Function to log Layer 4 event (Branch Protection)
log_layer4() {
    local check_type=$1
    local branch=$2
    local is_active=$3
    local blocked=$4
    local details=$5

    echo "[Layer 4] Logging: $check_type check, active=$is_active"

    echo "$(date -u +"%Y-%m-%dT%H:%M:%SZ"),$check_type,$branch,$is_active,$blocked,$details" >> "$SCRIPT_DIR/../logs/layer4-events.csv"
}

# Function to log Layer 5 event (GCS Backup)
log_layer5() {
    local backup_file=$1
    local size_mb=$2
    local status=$3
    local duration=$4
    local checksum=$5
    local workflow_run=$6

    echo "[Layer 5] Logging: $backup_file, ${size_mb}MB, $status"

    echo "$(date -u +"%Y-%m-%dT%H:%M:%SZ"),Backup,$backup_file,$size_mb,$status,$duration,$checksum,$workflow_run" >> "$SCRIPT_DIR/../logs/layer5-events.csv"
}

# Function to log Layer 6 event (Time Machine)
log_layer6() {
    local check_type=$1
    local destination=$2
    local status=$3
    local last_backup=$4
    local details=$5

    echo "[Layer 6] Logging: $check_type, $status"

    echo "$(date -u +"%Y-%m-%dT%H:%M:%SZ"),$check_type,$destination,$status,$last_backup,$details" >> "$SCRIPT_DIR/../logs/layer6-events.csv"
}

# Function to upload all pending events to Google Sheets
upload_pending_events() {
    echo "Uploading pending events to Google Sheets..."

    # Create logs directory if it doesn't exist
    mkdir -p "$SCRIPT_DIR/../logs"

    # TODO: Implement batch upload using Apps Script API or clasp
    # For now, events are logged to CSV files for later upload

    local total_events=0
    for layer in {1..6}; do
        local logfile="$SCRIPT_DIR/../logs/layer${layer}-events.csv"
        if [ -f "$logfile" ]; then
            local count=$(wc -l < "$logfile")
            total_events=$((total_events + count))
        fi
    done

    echo "Total pending events: $total_events"
}

# Export functions for use in other scripts
export -f log_layer1
export -f log_layer2
export -f log_layer3
export -f log_layer4
export -f log_layer5
export -f log_layer6
export -f upload_pending_events

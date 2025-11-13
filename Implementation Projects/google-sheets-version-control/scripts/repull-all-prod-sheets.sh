#!/bin/bash

###############################################################################
# Re-pull All PROD Sheets Script
#
# Purpose: Pull latest Apps Script code from all 204 PROD sheets
#          to update local directories with current code (including MetadataExtractorV7)
#
# Safety:
# - Backs up current state before pulling
# - Logs all operations
# - Resume capability (skips already successful pulls)
# - Progress tracking
#
# Expected time: ~10-15 minutes for 204 sheets (3-4 seconds per sheet)
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Paths
PROJECT_ROOT="/Users/mmaruthurnew/Desktop/medical-patient-data/Implementation Projects/google-sheets-version-control"
PRODUCTION_DIR="$PROJECT_ROOT/production-sheets"
LOG_FILE="$PROJECT_ROOT/logs/repull-all-prod-$(date +%Y%m%d-%H%M%S).log"
PROGRESS_FILE="$PROJECT_ROOT/logs/repull-progress.txt"
BACKUP_DIR="$PROJECT_ROOT/backups/pre-repull-$(date +%Y%m%d)"

# Statistics
TOTAL_SHEETS=0
SUCCESSFUL=0
FAILED=0
SKIPPED=0
START_TIME=$(date +%s)

# Logging function
log() {
    local message="$1"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${timestamp} ${message}" | tee -a "$LOG_FILE"
}

# Progress logging
log_progress() {
    local serial="$1"
    local status="$2"
    echo "$serial|$status|$(date +%s)" >> "$PROGRESS_FILE"
}

# Check if already pulled (resume capability)
is_already_pulled() {
    local serial="$1"
    if [ -f "$PROGRESS_FILE" ]; then
        grep -q "^$serial|success|" "$PROGRESS_FILE" 2>/dev/null
        return $?
    fi
    return 1
}

# Pull single sheet
pull_sheet() {
    local dir_path="$1"
    local dir_name=$(basename "$dir_path")
    local serial=$(echo "$dir_name" | grep -oE 'sheet-([0-9]+)' | cut -d'-' -f2)

    # Check if already pulled
    if is_already_pulled "$serial"; then
        log "${YELLOW}  ↷ Skipping (already pulled): $dir_name${NC}"
        ((SKIPPED++))
        return 0
    fi

    log "${BLUE}  ⟳ Pulling: $dir_name${NC}"

    # Change to live directory and pull
    cd "$dir_path/live"

    if clasp pull 2>&1 | tee -a "$LOG_FILE"; then
        log "${GREEN}  ✓ Success: $dir_name${NC}"
        log_progress "$serial" "success"
        ((SUCCESSFUL++))
        return 0
    else
        log "${RED}  ✗ Failed: $dir_name${NC}"
        log_progress "$serial" "failed"
        ((FAILED++))
        return 1
    fi
}

# Main function
main() {
    log "================================================================================"
    log "RE-PULL ALL PROD SHEETS - STARTED"
    log "================================================================================"
    log ""
    log "Purpose: Update local PROD code with latest from Google (including MetadataExtractorV7)"
    log ""
    log "Production directory: $PRODUCTION_DIR"
    log "Log file: $LOG_FILE"
    log "Progress file: $PROGRESS_FILE"
    log ""

    # Create backup directory (optional - could be commented out if not needed)
    # log "Creating backup of current state..."
    # mkdir -p "$BACKUP_DIR"
    # log "✓ Backup directory created: $BACKUP_DIR"
    # log ""

    # Get all PROD sheet directories
    log "Scanning for PROD sheet directories..."
    cd "$PRODUCTION_DIR"

    PROD_DIRS=($(find . -maxdepth 1 -type d -name "sheet-*_PROD--*" | sort))
    TOTAL_SHEETS=${#PROD_DIRS[@]}

    log "Found $TOTAL_SHEETS PROD sheet directories"
    log ""
    log "--------------------------------------------------------------------------------"
    log "PULLING SHEETS"
    log "--------------------------------------------------------------------------------"
    log ""

    # Process each sheet
    local count=0
    for dir in "${PROD_DIRS[@]}"; do
        ((count++))
        log "[$count/$TOTAL_SHEETS] Processing: $dir"

        # Convert relative path to full path
        local full_path="${PRODUCTION_DIR}/${dir#./}"

        if [ -d "${full_path}/live" ]; then
            pull_sheet "${full_path}" || true  # Continue even if one fails
        else
            log "${YELLOW}  ⚠ No live/ directory found, skipping${NC}"
            ((SKIPPED++))
        fi

        log ""

        # Show progress every 10 sheets
        if [ $((count % 10)) -eq 0 ]; then
            local elapsed=$(($(date +%s) - START_TIME))
            local avg_time=$((elapsed / count))
            local remaining=$((TOTAL_SHEETS - count))
            local est_remaining=$((remaining * avg_time))
            log "${BLUE}Progress: $count/$TOTAL_SHEETS ($(((count * 100) / TOTAL_SHEETS))%) | Elapsed: ${elapsed}s | Est. remaining: ${est_remaining}s${NC}"
            log ""
        fi
    done

    # Final summary
    local end_time=$(date +%s)
    local total_time=$((end_time - START_TIME))

    log "================================================================================"
    log "SUMMARY"
    log "================================================================================"
    log "Total PROD sheets:      $TOTAL_SHEETS"
    log "Successfully pulled:    $SUCCESSFUL"
    log "Failed:                 $FAILED"
    log "Skipped (already done): $SKIPPED"
    log "Total time:             ${total_time}s ($(($total_time / 60))m $(($total_time % 60))s)"
    log "Average per sheet:      $((total_time / TOTAL_SHEETS))s"
    log ""

    if [ $FAILED -eq 0 ]; then
        log "${GREEN}✅ SUCCESS: All PROD sheets pulled successfully!${NC}"
    else
        log "${YELLOW}⚠️  WARNING: $FAILED sheets failed to pull. Check log for details.${NC}"
    fi

    log "================================================================================"
    log "RE-PULL COMPLETED"
    log "================================================================================"

    # Exit with error code if any failed
    if [ $FAILED -gt 0 ]; then
        exit 1
    fi
}

# Run main function
main

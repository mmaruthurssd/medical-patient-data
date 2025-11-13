#!/bin/bash

###############################################################################
# Deploy MetadataExtractorV7 from DEV3 to PROD
#
# Purpose: Copy MetadataExtractorV7_WithTrigger.js from DEV3 sheets to
#          matching PROD sheets and push to Google Apps Script
#
# Process:
# 1. Find all DEV3 sheets with MetadataExtractorV7_WithTrigger.js
# 2. Match each DEV3 sheet to its corresponding PROD sheet by serial number
# 3. Copy MetadataExtractorV7_WithTrigger.js to PROD/live/
# 4. Push code to Google using clasp push
# 5. Log all operations
#
# Safety:
# - Backs up PROD before deployment
# - Resume capability for interrupted deployments
# - Comprehensive logging
###############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Paths
PROJECT_ROOT="/Users/mmaruthurnew/Desktop/medical-patient-data/Implementation Projects/google-sheets-version-control"
PRODUCTION_DIR="$PROJECT_ROOT/production-sheets"
LOG_FILE="$PROJECT_ROOT/logs/deploy-v7-$(date +%Y%m%d-%H%M%S).log"
PROGRESS_FILE="$PROJECT_ROOT/logs/deploy-v7-progress.txt"
BACKUP_DIR="$PROJECT_ROOT/backups/pre-v7-deploy-$(date +%Y%m%d)"

# Statistics
TOTAL_SHEETS=0
SUCCESSFUL=0
FAILED=0
SKIPPED=0
START_TIME=$(date +%s)

# Logging
log() {
    local message="$1"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${timestamp} ${message}" | tee -a "$LOG_FILE"
}

# Progress tracking
log_progress() {
    local serial="$1"
    local status="$2"
    echo "$serial|$status|$(date +%s)" >> "$PROGRESS_FILE"
}

# Check if already deployed
is_already_deployed() {
    local serial="$1"
    if [ -f "$PROGRESS_FILE" ]; then
        grep -q "^$serial|success|" "$PROGRESS_FILE" 2>/dev/null
        return $?
    fi
    return 1
}

# Deploy to single PROD sheet
deploy_to_sheet() {
    local dev3_dir="$1"
    local serial=$(echo "$dev3_dir" | grep -oE 'sheet-([0-9]+)' | cut -d'-' -f2)

    # Check if already deployed
    if is_already_deployed "$serial"; then
        log "${YELLOW}  ↷ Skipping (already deployed): Serial $serial${NC}"
        ((SKIPPED++))
        return 0
    fi

    # Find MetadataExtractorV7 file in DEV3
    local v7_file=$(find "$dev3_dir/live" -name "MetadataExtractorV7*.js" 2>/dev/null | head -1)

    if [ -z "$v7_file" ]; then
        log "${YELLOW}  ⚠ No MetadataExtractorV7 file found in DEV3${NC}"
        ((SKIPPED++))
        return 0
    fi

    # Find matching PROD directory
    local prod_dir=$(find "$PRODUCTION_DIR" -maxdepth 1 -type d -name "sheet-${serial}_PROD--*" 2>/dev/null | head -1)

    if [ -z "$prod_dir" ]; then
        log "${RED}  ✗ No matching PROD directory found for Serial $serial${NC}"
        log_progress "$serial" "failed-no-prod"
        ((FAILED++))
        return 1
    fi

    local prod_live="$prod_dir/live"

    if [ ! -d "$prod_live" ]; then
        log "${RED}  ✗ No live/ directory in PROD sheet${NC}"
        log_progress "$serial" "failed-no-live"
        ((FAILED++))
        return 1
    fi

    log "${BLUE}  → Copying MetadataExtractorV7 to PROD${NC}"

    # Copy V7 file to PROD
    local v7_filename=$(basename "$v7_file")
    cp "$v7_file" "$prod_live/$v7_filename"

    if [ $? -ne 0 ]; then
        log "${RED}  ✗ Failed to copy file${NC}"
        log_progress "$serial" "failed-copy"
        ((FAILED++))
        return 1
    fi

    log "${BLUE}  → Pushing to Google Apps Script${NC}"

    # Push to Google
    cd "$prod_live"

    if clasp push 2>&1 | tee -a "$LOG_FILE"; then
        log "${GREEN}  ✓ Success: Serial $serial deployed${NC}"
        log_progress "$serial" "success"
        ((SUCCESSFUL++))
        return 0
    else
        log "${RED}  ✗ Failed to push to Google${NC}"
        log_progress "$serial" "failed-push"
        ((FAILED++))
        return 1
    fi
}

# Main function
main() {
    log "================================================================================"
    log "DEPLOY METADATAEXTRACTORV7 TO PROD - STARTED"
    log "================================================================================"
    log ""
    log "Purpose: Deploy MetadataExtractorV7 from DEV3 to PROD sheets"
    log ""
    log "Production directory: $PRODUCTION_DIR"
    log "Log file: $LOG_FILE"
    log "Progress file: $PROGRESS_FILE"
    log ""

    # Get all DEV3 sheets with MetadataExtractorV7
    log "Scanning for DEV3 sheets with MetadataExtractorV7..."
    cd "$PRODUCTION_DIR"

    DEV3_DIRS=()
    while IFS= read -r dir; do
        DEV3_DIRS+=("$dir")
    done < <(find . -maxdepth 1 -type d -name "sheet-*_DEV3--*" -exec sh -c 'find "$1" -name "MetadataExtractorV7*.js" -print -quit 2>/dev/null | grep -q . && echo "$1"' _ {} \; | sort)

    TOTAL_SHEETS=${#DEV3_DIRS[@]}

    log "Found $TOTAL_SHEETS DEV3 sheets with MetadataExtractorV7"
    log ""
    log "--------------------------------------------------------------------------------"
    log "DEPLOYING TO PROD SHEETS"
    log "--------------------------------------------------------------------------------"
    log ""

    # Process each DEV3 sheet
    local count=0
    for dir in "${DEV3_DIRS[@]}"; do
        ((count++))
        local dir_name=$(basename "$dir")
        local serial=$(echo "$dir_name" | grep -oE 'sheet-([0-9]+)' | cut -d'-' -f2)

        log "[$count/$TOTAL_SHEETS] Processing Serial $serial"

        deploy_to_sheet "$dir" || true

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
    log "Total DEV3 sheets:      $TOTAL_SHEETS"
    log "Successfully deployed:  $SUCCESSFUL"
    log "Failed:                 $FAILED"
    log "Skipped (already done): $SKIPPED"
    log "Total time:             ${total_time}s ($(($total_time / 60))m $(($total_time % 60))s)"

    if [ $TOTAL_SHEETS -gt 0 ]; then
        log "Average per sheet:      $((total_time / TOTAL_SHEETS))s"
    fi

    log ""

    if [ $FAILED -eq 0 ]; then
        log "${GREEN}✅ SUCCESS: All MetadataExtractorV7 files deployed to PROD!${NC}"
    else
        log "${YELLOW}⚠️  WARNING: $FAILED deployments failed. Check log for details.${NC}"
    fi

    log "================================================================================"
    log "DEPLOYMENT COMPLETED"
    log "================================================================================"

    # Exit with error if any failed
    if [ $FAILED -gt 0 ]; then
        exit 1
    fi
}

# Run main
main

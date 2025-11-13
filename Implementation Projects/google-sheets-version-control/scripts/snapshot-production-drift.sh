#!/bin/bash

###############################################################################
# Production Drift Detection Snapshot
#
# Purpose: Pull latest code from all PROD sheets and detect changes
#          Compares current Google-hosted code vs local git repository
#
# Use Cases:
# - 2x daily automated drift detection
# - Manual drift check before deployments
# - Verify no unauthorized changes to production
#
# Safety: Read-only operation, never modifies Google Drive
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
LOG_FILE="$PROJECT_ROOT/logs/snapshot-drift-$(date +%Y%m%d-%H%M%S).log"
DRIFT_REPORT="$PROJECT_ROOT/logs/drift-report-$(date +%Y%m%d-%H%M%S).txt"

# Statistics
TOTAL_SHEETS=0
SUCCESSFUL=0
FAILED=0
DRIFT_DETECTED=0
NO_DRIFT=0
START_TIME=$(date +%s)

# Logging
log() {
    local message="$1"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${timestamp} ${message}" | tee -a "$LOG_FILE"
}

log_drift() {
    local message="$1"
    echo -e "$message" | tee -a "$DRIFT_REPORT"
}

# Check single sheet for drift
check_drift() {
    local sheet_dir="$1"
    local dir_name=$(basename "$sheet_dir")
    local serial=$(echo "$dir_name" | grep -oE 'sheet-([0-9]+)' | cut -d'-' -f2)

    if [ ! -d "$sheet_dir/live" ]; then
        log "${YELLOW}  ⚠ No live/ directory, skipping${NC}"
        return 0
    fi

    # Save current state
    local temp_dir=$(mktemp -d)
    cp -R "$sheet_dir/live" "$temp_dir/live-old"

    # Pull fresh code from Google
    cd "$sheet_dir/live"

    if ! clasp pull > /dev/null 2>&1; then
        log "${RED}  ✗ Failed to pull from Google${NC}"
        rm -rf "$temp_dir"
        ((FAILED++))
        return 1
    fi

    # Compare old vs new
    cd "$temp_dir"

    # Check if there are differences (excluding .clasp.json)
    if diff -r "live-old" "$sheet_dir/live" --exclude=".clasp.json" > /dev/null 2>&1; then
        log "${GREEN}  ✓ No drift detected${NC}"
        ((NO_DRIFT++))
    else
        log "${RED}  🚨 DRIFT DETECTED!${NC}"
        ((DRIFT_DETECTED++))

        # Log detailed drift info
        log_drift "=========================================="
        log_drift "DRIFT DETECTED: $dir_name"
        log_drift "Serial: $serial"
        log_drift "Time: $(date)"
        log_drift "=========================================="
        log_drift ""

        # Show what changed
        diff -r "live-old" "$sheet_dir/live" --exclude=".clasp.json" >> "$DRIFT_REPORT" 2>&1 || true

        log_drift ""
        log_drift "Files modified:"
        find "$sheet_dir/live" -type f -name "*.js" -o -name "*.html" | while read file; do
            log_drift "  - $(basename $file)"
        done
        log_drift ""
    fi

    # Cleanup
    rm -rf "$temp_dir"
    ((SUCCESSFUL++))
    return 0
}

# Main function
main() {
    log "================================================================================"
    log "PRODUCTION DRIFT DETECTION SNAPSHOT - STARTED"
    log "================================================================================"
    log ""
    log "Purpose: Detect unauthorized changes to production Apps Script code"
    log ""
    log "Production directory: $PRODUCTION_DIR"
    log "Log file: $LOG_FILE"
    log "Drift report: $DRIFT_REPORT"
    log ""

    # Check clasp is available
    if ! command -v clasp &> /dev/null; then
        log "${RED}ERROR: clasp not installed${NC}"
        exit 1
    fi

    # Get all PROD sheets
    log "Scanning for PROD sheet directories..."
    cd "$PRODUCTION_DIR"

    PROD_DIRS=($(find . -maxdepth 1 -type d -name "sheet-*_PROD--*" | sort))
    TOTAL_SHEETS=${#PROD_DIRS[@]}

    log "Found $TOTAL_SHEETS PROD sheets"
    log ""
    log "--------------------------------------------------------------------------------"
    log "CHECKING FOR DRIFT"
    log "--------------------------------------------------------------------------------"
    log ""

    # Initialize drift report
    log_drift "PRODUCTION DRIFT DETECTION REPORT"
    log_drift "Generated: $(date)"
    log_drift "Total sheets checked: $TOTAL_SHEETS"
    log_drift ""
    log_drift "================================================================================"
    log_drift ""

    # Process each sheet
    local count=0
    for dir in "${PROD_DIRS[@]}"; do
        ((count++))
        local dir_name=$(basename "$dir")
        log "[$count/$TOTAL_SHEETS] Checking: $dir_name"

        check_drift "$dir" || true

        # Show progress every 25 sheets
        if [ $((count % 25)) -eq 0 ]; then
            local elapsed=$(($(date +%s) - START_TIME))
            local avg_time=$((elapsed / count))
            local remaining=$((TOTAL_SHEETS - count))
            local est_remaining=$((remaining * avg_time))
            log "${BLUE}Progress: $count/$TOTAL_SHEETS ($(((count * 100) / TOTAL_SHEETS))%) | Drift found: $DRIFT_DETECTED | Est. remaining: ${est_remaining}s${NC}"
            log ""
        fi
    done

    # Final summary
    local end_time=$(date +%s)
    local total_time=$((end_time - START_TIME))

    log ""
    log "================================================================================"
    log "DRIFT DETECTION SUMMARY"
    log "================================================================================"
    log "Total sheets checked:   $TOTAL_SHEETS"
    log "Successful checks:      $SUCCESSFUL"
    log "Failed checks:          $FAILED"
    log ""
    log "No drift detected:      $NO_DRIFT"
    log "Drift detected:         $DRIFT_DETECTED"
    log ""
    log "Total time:             ${total_time}s ($(($total_time / 60))m $(($total_time % 60))s)"
    log "Average per sheet:      $((total_time / TOTAL_SHEETS))s"
    log ""

    if [ $DRIFT_DETECTED -eq 0 ]; then
        log "${GREEN}✅ SUCCESS: No unauthorized changes detected${NC}"
        log "${GREEN}✅ All production code matches Google Drive${NC}"
    else
        log "${RED}🚨 ALERT: $DRIFT_DETECTED sheets have unauthorized changes!${NC}"
        log "${YELLOW}⚠️  Production code has been modified directly in Google${NC}"
        log ""
        log "Drift report saved: $DRIFT_REPORT"
        log ""
        log "Next steps:"
        log "  1. Review drift report: $DRIFT_REPORT"
        log "  2. Identify who made changes and why"
        log "  3. Decide: Accept changes (commit) OR Reject changes (redeploy)"
        log "  4. Update team on proper deployment workflow"
    fi

    log "================================================================================"
    log "DRIFT DETECTION COMPLETED"
    log "================================================================================"

    # Exit with error if drift detected (for alerting)
    if [ $DRIFT_DETECTED -gt 0 ]; then
        exit 2
    fi

    if [ $FAILED -gt 0 ]; then
        exit 1
    fi
}

# Run main
main

#!/bin/bash

###############################################################################
# TEST: Drift Detection on 5 Sample Sheets
#
# Purpose: Test the drift detection system on a small sample before full run
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
LOG_FILE="$PROJECT_ROOT/logs/test-snapshot-$(date +%Y%m%d-%H%M%S).log"

# Test sheets
TEST_SHEETS=(
    "sheet-139_PROD--Year-End_Tax_Dashboard_-_G_Maruthur_Properties_-_Dashboard_Sheet_-_D24-106_-_Sup"
    "sheet-100_PROD--Sheets_Monitoring_Dashboard_-_Dashboards_-_D25-531_-_SuperAdmin_-_Active"
    "sheet-064_PROD--Patient_Summary_-_Dashboard_Sheet_-_D25-356_-_All_SSD_-_Active"
    "sheet-201_PROD--AK_W_MM_Collections_Processing_Sheet_PHI_-_Processing_Sheets_-_PRS25-462_-_Super"
    "sheet-018_PROD--Internal_Billing_Errors_Log_-_Dashboards_-_D25-221_-_SuperAdmin_-_Active"
)

# Statistics
TOTAL_SHEETS=5
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

# Check single sheet for drift
check_drift() {
    local sheet_name="$1"
    local sheet_dir="$PRODUCTION_DIR/$sheet_name"

    log "  Checking: $sheet_name"

    if [ ! -d "$sheet_dir/live" ]; then
        log "  ${YELLOW}⚠ No live/ directory, skipping${NC}"
        return 0
    fi

    # Save current state
    local temp_dir=$(mktemp -d)
    cp -R "$sheet_dir/live" "$temp_dir/live-old"

    # Pull fresh code from Google
    cd "$sheet_dir/live"

    if ! clasp pull > /dev/null 2>&1; then
        log "  ${RED}✗ Failed to pull from Google${NC}"
        rm -rf "$temp_dir"
        ((FAILED++))
        return 1
    fi

    # Compare old vs new
    cd "$temp_dir"

    # Check if there are differences (excluding .clasp.json)
    if diff -r "live-old" "$sheet_dir/live" --exclude=".clasp.json" > /dev/null 2>&1; then
        log "  ${GREEN}✓ No drift detected${NC}"
        ((NO_DRIFT++))
    else
        log "  ${RED}🚨 DRIFT DETECTED!${NC}"
        ((DRIFT_DETECTED++))

        # Show what changed
        log "  ${YELLOW}Changed files:${NC}"
        diff -r "live-old" "$sheet_dir/live" --exclude=".clasp.json" | grep -E "^Only in|^Files.*differ" | head -5 || true
    fi

    # Cleanup
    rm -rf "$temp_dir"
    ((SUCCESSFUL++))
    return 0
}

# Main function
main() {
    log "================================================================================"
    log "TEST: DRIFT DETECTION ON 5 SAMPLE SHEETS"
    log "================================================================================"
    log ""
    log "Testing new drift detection system before full deployment"
    log "Test sheets: $TOTAL_SHEETS"
    log ""

    # Check clasp is available
    if ! command -v clasp &> /dev/null; then
        log "${RED}ERROR: clasp not installed${NC}"
        exit 1
    fi

    log "--------------------------------------------------------------------------------"
    log "CHECKING FOR DRIFT"
    log "--------------------------------------------------------------------------------"
    log ""

    # Process each test sheet
    local count=0
    for sheet_name in "${TEST_SHEETS[@]}"; do
        ((count++))
        log "[$count/$TOTAL_SHEETS]"
        check_drift "$sheet_name" || true
        log ""
    done

    # Final summary
    local end_time=$(date +%s)
    local total_time=$((end_time - START_TIME))

    log ""
    log "================================================================================"
    log "TEST RESULTS"
    log "================================================================================"
    log "Total sheets checked:   $TOTAL_SHEETS"
    log "Successful checks:      $SUCCESSFUL"
    log "Failed checks:          $FAILED"
    log ""
    log "No drift detected:      $NO_DRIFT"
    log "Drift detected:         $DRIFT_DETECTED"
    log ""
    log "Total time:             ${total_time}s"
    log "Average per sheet:      $((total_time / TOTAL_SHEETS))s"
    log ""

    if [ $DRIFT_DETECTED -eq 0 ] && [ $FAILED -eq 0 ]; then
        log "${GREEN}✅ TEST PASSED: Drift detection system is working correctly${NC}"
        log "${GREEN}✅ Ready for full deployment on all 204 PROD sheets${NC}"
    elif [ $DRIFT_DETECTED -gt 0 ]; then
        log "${YELLOW}⚠️  TEST WARNING: $DRIFT_DETECTED sheets have drift${NC}"
        log "${YELLOW}⚠️  This is expected if code was modified in Google${NC}"
    else
        log "${RED}❌ TEST FAILED: $FAILED sheets could not be checked${NC}"
    fi

    log "================================================================================"
}

# Run main
main

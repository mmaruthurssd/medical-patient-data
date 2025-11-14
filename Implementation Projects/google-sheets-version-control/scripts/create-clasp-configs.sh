#!/bin/bash

###############################################################################
# Create .clasp.json Configuration Files
#
# Purpose: Generate .clasp.json files in all PROD sheet live/ directories
#          using script IDs from metadata/script-id.txt
###############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Paths
PROJECT_ROOT="/Users/mmaruthurnew/Desktop/medical-patient-data/Implementation Projects/google-sheets-version-control"
PRODUCTION_DIR="$PROJECT_ROOT/production-sheets"
LOG_FILE="$PROJECT_ROOT/logs/create-clasp-configs-$(date +%Y%m%d-%H%M%S).log"

# Statistics
TOTAL_SHEETS=0
SUCCESSFUL=0
FAILED=0
MISSING_SCRIPT_ID=0

# Logging
log() {
    local message="$1"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${timestamp} ${message}" | tee -a "$LOG_FILE"
}

# Create .clasp.json for a single sheet
create_clasp_config() {
    local sheet_dir="$1"
    local dir_name=$(basename "$sheet_dir")

    log "  Processing: $dir_name"

    # Check if script ID exists
    if [ ! -f "$sheet_dir/metadata/script-id.txt" ]; then
        log "  ${YELLOW}⚠ No script-id.txt found, skipping${NC}"
        ((MISSING_SCRIPT_ID++))
        return 0
    fi

    # Read script ID
    local script_id=$(cat "$sheet_dir/metadata/script-id.txt" | tr -d '[:space:]')

    if [ -z "$script_id" ]; then
        log "  ${RED}✗ Empty script ID${NC}"
        ((FAILED++))
        return 1
    fi

    # Check if live directory exists
    if [ ! -d "$sheet_dir/live" ]; then
        log "  ${YELLOW}⚠ No live/ directory, skipping${NC}"
        return 0
    fi

    # Create .clasp.json
    echo "{\"scriptId\":\"$script_id\"}" > "$sheet_dir/live/.clasp.json"

    if [ $? -eq 0 ]; then
        log "  ${GREEN}✓ Created .clasp.json${NC}"
        ((SUCCESSFUL++))
    else
        log "  ${RED}✗ Failed to create .clasp.json${NC}"
        ((FAILED++))
        return 1
    fi

    return 0
}

# Main function
main() {
    log "================================================================================"
    log "CREATE .CLASP.JSON CONFIGURATION FILES"
    log "================================================================================"
    log ""
    log "Purpose: Generate .clasp.json files for all PROD sheets"
    log "Source: metadata/script-id.txt in each sheet directory"
    log "Target: live/.clasp.json in each sheet directory"
    log ""

    # Get all PROD sheets
    log "Scanning for PROD sheet directories..."
    cd "$PRODUCTION_DIR"

    PROD_DIRS=($(find . -maxdepth 1 -type d -name "sheet-*_PROD--*" | sort))
    TOTAL_SHEETS=${#PROD_DIRS[@]}

    log "Found $TOTAL_SHEETS PROD sheets"
    log ""
    log "--------------------------------------------------------------------------------"
    log "CREATING .CLASP.JSON FILES"
    log "--------------------------------------------------------------------------------"
    log ""

    # Process each sheet
    local count=0
    for dir in "${PROD_DIRS[@]}"; do
        ((count++))
        log "[$count/$TOTAL_SHEETS]"
        create_clasp_config "$dir" || true
    done

    # Final summary
    log ""
    log "================================================================================"
    log "SUMMARY"
    log "================================================================================"
    log "Total sheets:           $TOTAL_SHEETS"
    log "Successful:             $SUCCESSFUL"
    log "Failed:                 $FAILED"
    log "Missing script IDs:     $MISSING_SCRIPT_ID"
    log ""

    if [ $FAILED -eq 0 ] && [ $MISSING_SCRIPT_ID -eq 0 ]; then
        log "${GREEN}✅ SUCCESS: All .clasp.json files created${NC}"
        log "${GREEN}✅ Drift detection system is now ready to use${NC}"
    elif [ $MISSING_SCRIPT_ID -gt 0 ]; then
        log "${YELLOW}⚠️  WARNING: $MISSING_SCRIPT_ID sheets missing script IDs${NC}"
        log "${YELLOW}⚠️  These sheets cannot be monitored for drift${NC}"
    else
        log "${RED}❌ FAILED: $FAILED sheets had errors${NC}"
    fi

    log "================================================================================"
}

# Run main
main

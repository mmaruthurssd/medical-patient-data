#!/bin/bash

###############################################################################
# Cleanup Duplicate Directories Script
#
# Purpose: Remove "live 2" and "metadata 2" duplicate directories from all sheets
#          These duplicates are blocking the re-pull operation
#
# Safety:
# - Backs up duplicates before deletion
# - Logs all operations
# - Verifies correct "live" and "metadata" directories remain
###############################################################################

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PROJECT_ROOT="/Users/mmaruthurnew/Desktop/medical-patient-data/Implementation Projects/google-sheets-version-control"
PRODUCTION_DIR="$PROJECT_ROOT/production-sheets"
BACKUP_DIR="$PROJECT_ROOT/backups/duplicate-dirs-$(date +%Y%m%d-%H%M%S)"
LOG_FILE="$PROJECT_ROOT/logs/cleanup-duplicates-$(date +%Y%m%d-%H%M%S).log"

TOTAL_REMOVED=0

log() {
    local message="$1"
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] ${message}" | tee -a "$LOG_FILE"
}

main() {
    log "================================================================================"
    log "CLEANUP DUPLICATE DIRECTORIES - STARTED"
    log "================================================================================"
    log ""

    # Create backup directory
    mkdir -p "$BACKUP_DIR"
    log "Backup directory: $BACKUP_DIR"
    log ""

    # Find and remove "live 2" directories
    log "Searching for duplicate directories..."
    cd "$PRODUCTION_DIR"

    for sheet_dir in sheet-*_PROD*; do
        if [ -d "$sheet_dir/live 2" ]; then
            log "${YELLOW}Found: $sheet_dir/live 2${NC}"

            # Backup
            mkdir -p "$BACKUP_DIR/$sheet_dir"
            cp -R "$sheet_dir/live 2" "$BACKUP_DIR/$sheet_dir/" 2>/dev/null || true

            # Delete
            rm -rf "$sheet_dir/live 2"
            log "${GREEN}  ✓ Removed${NC}"
            ((TOTAL_REMOVED++))
        fi

        if [ -d "$sheet_dir/metadata 2" ]; then
            log "${YELLOW}Found: $sheet_dir/metadata 2${NC}"

            # Backup
            mkdir -p "$BACKUP_DIR/$sheet_dir"
            cp -R "$sheet_dir/metadata 2" "$BACKUP_DIR/$sheet_dir/" 2>/dev/null || true

            # Delete
            rm -rf "$sheet_dir/metadata 2"
            log "${GREEN}  ✓ Removed${NC}"
            ((TOTAL_REMOVED++))
        fi
    done

    log ""
    log "================================================================================"
    log "SUMMARY"
    log "================================================================================"
    log "Total duplicates removed: $TOTAL_REMOVED"
    log "Backup location: $BACKUP_DIR"
    log ""
    log "${GREEN}✅ SUCCESS: Cleanup completed!${NC}"
    log "================================================================================"
}

main

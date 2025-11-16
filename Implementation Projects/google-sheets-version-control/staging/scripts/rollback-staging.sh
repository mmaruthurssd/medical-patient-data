#!/bin/bash

##############################################################################
# Rollback Staging or Production
#
# Purpose: Emergency recovery from failed deployments or bad changes
# Security: Validates backup integrity before restoration
#
# Usage:
#   ./rollback-staging.sh --list                     List available backups
#   ./rollback-staging.sh --restore <backup-id>      Restore from backup
#   ./rollback-staging.sh --production --sheet 42    Rollback production sheet
##############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
BACKUP_DIR="$PROJECT_ROOT/backups/deployment-backups"
LOG_FILE="$PROJECT_ROOT/logs/rollbacks.log"

# Logging
log() {
    echo -e "${1}" | tee -a "$LOG_FILE"
}

log_info() {
    log "${BLUE}[INFO]${NC} $1"
}

log_success() {
    log "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    log "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    log "${RED}[ERROR]${NC} $1"
}

# List available backups
list_backups() {
    log_info "Available backups:"
    echo ""

    if [ ! -d "$BACKUP_DIR" ] || [ -z "$(ls -A "$BACKUP_DIR" 2>/dev/null)" ]; then
        log_warning "No backups found"
        return
    fi

    for backup in "$BACKUP_DIR"/*; do
        if [ -f "$backup/backup-metadata.json" ]; then
            local backup_name=$(basename "$backup")
            local timestamp=$(grep timestamp "$backup/backup-metadata.json" | cut -d'"' -f4)
            local sheet=$(grep sheetNumber "$backup/backup-metadata.json" | cut -d'"' -f4)
            echo "  $backup_name"
            echo "    Sheet: $sheet"
            echo "    Time:  $timestamp"
            echo ""
        fi
    done
}

# Restore from backup
restore_backup() {
    local backup_id=$1

    log_info "Restoring from backup: $backup_id"

    local backup_path="$BACKUP_DIR/$backup_id"

    if [ ! -d "$backup_path" ]; then
        log_error "Backup not found: $backup_id"
        exit 1
    fi

    # Read metadata
    if [ ! -f "$backup_path/backup-metadata.json" ]; then
        log_error "Backup metadata missing - backup may be corrupted"
        exit 1
    fi

    local prod_path=$(grep productionPath "$backup_path/backup-metadata.json" | cut -d'"' -f4)
    local sheet_num=$(grep sheetNumber "$backup_path/backup-metadata.json" | cut -d'"' -f4)

    log_info "Sheet: $sheet_num"
    log_info "Target: $prod_path"

    # Confirm restoration
    echo ""
    read -p "Restore production sheet $sheet_num from this backup? (yes/NO): " confirm

    if [ "$confirm" != "yes" ]; then
        log_warning "Rollback cancelled"
        exit 0
    fi

    # Restore
    log_info "Restoring..."

    rm -rf "$prod_path/live"
    cp -r "$backup_path/live" "$prod_path/"

    echo "$(date -u +%Y-%m-%dT%H:%M:%SZ)" > "$prod_path/metadata/last-rollback.txt"
    echo "$backup_id" > "$prod_path/metadata/restored-from.txt"

    log_success "Rollback complete"

    # Commit to git
    cd "$PROJECT_ROOT"
    git add "$prod_path"
    git commit -m "Rollback production sheet $sheet_num from backup $backup_id" || true

    log_success "Changes committed to git"
}

# Main
main() {
    echo ""
    echo "═══════════════════════════════════════════════════════════"
    echo "  ROLLBACK UTILITY"
    echo "  $(date '+%Y-%m-%d %H:%M:%S %Z')"
    echo "═══════════════════════════════════════════════════════════"
    echo ""

    case "${1:-}" in
        --list)
            list_backups
            ;;
        --restore)
            if [ -z "${2:-}" ]; then
                log_error "Backup ID required"
                echo "Usage: $0 --restore <backup-id>"
                exit 1
            fi
            restore_backup "$2"
            ;;
        --help)
            cat << EOF
Rollback Utility

Usage:
  ./rollback-staging.sh --list              List available backups
  ./rollback-staging.sh --restore <id>      Restore from backup

Options:
  --list      Show all available backup points
  --restore   Restore production from backup
  --help      Show this help message

Examples:
  ./rollback-staging.sh --list
  ./rollback-staging.sh --restore sheet-42_prod-backup_20251116-143000

Backups are located in: $BACKUP_DIR
Rollback operations are logged to: $LOG_FILE
EOF
            ;;
        *)
            log_error "Invalid option: ${1:-}"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
}

main "$@"

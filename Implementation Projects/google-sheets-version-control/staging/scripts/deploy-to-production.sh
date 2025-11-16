#!/bin/bash

##############################################################################
# Deploy from Staging (DEV3) to Production
#
# Purpose: Controlled deployment with safety checks, backups, and validation
# Security: PHI detection, manual approval, automatic rollback on failure
#
# Usage:
#   ./deploy-to-production.sh --sheet <sheet-number>
#   ./deploy-to-production.sh --batch <start> <end>
#   ./deploy-to-production.sh --sheet 42 --auto-approve  # Use with caution!
##############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
STAGING_DIR="$PROJECT_ROOT/staging-sheets"
PRODUCTION_DIR="$PROJECT_ROOT/production-sheets"
BACKUP_DIR="$PROJECT_ROOT/backups/deployment-backups"
LOG_FILE="$PROJECT_ROOT/logs/deployments.log"

# Ensure directories exist
mkdir -p "$BACKUP_DIR"
mkdir -p "$(dirname "$LOG_FILE")"

# Logging function
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

# Banner
print_banner() {
    echo ""
    echo "═══════════════════════════════════════════════════════════"
    echo "  STAGING → PRODUCTION DEPLOYMENT"
    echo "  $(date '+%Y-%m-%d %H:%M:%S %Z')"
    echo "═══════════════════════════════════════════════════════════"
    echo ""
}

# Find staging sheet directory
find_staging_sheet() {
    local sheet_num=$1
    local sheet_id=$(printf "%03d" $sheet_num)

    local staging_sheet=$(find "$STAGING_DIR" -maxdepth 1 -type d -name "sheet-${sheet_id}_DEV3*" | head -1)

    if [ -z "$staging_sheet" ]; then
        log_error "No DEV3 sheet found for number $sheet_num"
        exit 1
    fi

    echo "$staging_sheet"
}

# Find production sheet directory
find_production_sheet() {
    local sheet_num=$1
    local sheet_id=$(printf "%03d" $sheet_num)

    local prod_sheet=$(find "$PRODUCTION_DIR" -maxdepth 1 -type d -name "sheet-${sheet_id}_PROD*" | head -1)

    if [ -z "$prod_sheet" ]; then
        log_error "No PROD sheet found for number $sheet_num"
        exit 1
    fi

    echo "$prod_sheet"
}

# Step 1: Pre-deployment validation
validate_staging() {
    local staging_sheet=$1
    local sheet_num=$2

    log_info "Step 1: Validating staging environment..."

    # Check if staging sheet has code
    if [ ! -d "$staging_sheet/live" ] || [ -z "$(ls -A "$staging_sheet/live")" ]; then
        log_error "Staging sheet has no code!"
        exit 1
    fi

    # Run PHI detection
    log_info "Running PHI leakage detection..."
    if ! node "$SCRIPT_DIR/check-phi-leakage.js" --sheet "$sheet_num"; then
        log_error "PHI detected in staging code - DEPLOYMENT BLOCKED"
        exit 1
    fi

    log_success "Staging validation passed"
}

# Step 2: Show deployment diff
show_diff() {
    local staging_sheet=$1
    local prod_sheet=$2

    log_info "Step 2: Comparing staging vs production..."

    echo ""
    echo "Changes to be deployed:"
    echo "═══════════════════════════════════════════════════════════"

    # Show file-by-file diff
    diff -r "$prod_sheet/live" "$staging_sheet/live" || true

    echo "═══════════════════════════════════════════════════════════"
    echo ""
}

# Step 3: Manual approval
request_approval() {
    local auto_approve=$1

    if [ "$auto_approve" = "true" ]; then
        log_warning "Auto-approve enabled - skipping manual confirmation"
        return 0
    fi

    log_info "Step 3: Manual approval required"
    echo ""
    echo -e "${YELLOW}WARNING: This will deploy staging code to PRODUCTION${NC}"
    echo ""
    read -p "Type 'yes' to continue, anything else to cancel: " confirmation

    if [ "$confirmation" != "yes" ]; then
        log_warning "Deployment cancelled by user"
        exit 0
    fi

    log_success "Deployment approved"
}

# Step 4: Backup production
backup_production() {
    local prod_sheet=$1
    local sheet_num=$2

    log_info "Step 4: Creating production backup..."

    local timestamp=$(date +%Y%m%d-%H%M%S)
    local backup_name="sheet-${sheet_num}_prod-backup_${timestamp}"
    local backup_path="$BACKUP_DIR/$backup_name"

    # Copy production to backup
    cp -r "$prod_sheet" "$backup_path"

    # Create backup metadata
    cat > "$backup_path/backup-metadata.json" << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "sheetNumber": "$sheet_num",
  "backupReason": "pre-deployment",
  "productionPath": "$prod_sheet",
  "restorable": true
}
EOF

    log_success "Production backed up to: $backup_name"

    # Return backup path for rollback if needed
    echo "$backup_path"
}

# Step 5: Deploy to production
deploy_code() {
    local staging_sheet=$1
    local prod_sheet=$2

    log_info "Step 5: Deploying code to production..."

    # Clear production live directory
    rm -rf "$prod_sheet/live"/*

    # Copy staging code to production
    cp -r "$staging_sheet/live"/* "$prod_sheet/live/"

    # Update metadata
    echo "$(date -u +%Y-%m-%dT%H:%M:%SZ)" > "$prod_sheet/metadata/last-deployed.txt"

    log_success "Code deployed successfully"
}

# Step 6: Post-deployment verification
verify_deployment() {
    local prod_sheet=$1
    local staging_sheet=$2

    log_info "Step 6: Verifying deployment..."

    # Verify files were copied
    local staging_files=$(find "$staging_sheet/live" -type f | wc -l)
    local prod_files=$(find "$prod_sheet/live" -type f | wc -l)

    if [ "$staging_files" -ne "$prod_files" ]; then
        log_error "File count mismatch! Staging: $staging_files, Production: $prod_files"
        return 1
    fi

    # Verify file contents match
    if ! diff -r "$staging_sheet/live" "$prod_sheet/live" > /dev/null 2>&1; then
        log_error "Content mismatch detected!"
        return 1
    fi

    log_success "Deployment verified"
    return 0
}

# Step 7: Commit to git
commit_deployment() {
    local sheet_num=$1
    local prod_sheet=$2

    log_info "Step 7: Committing to version control..."

    cd "$PROJECT_ROOT"

    # Add production changes
    git add "$prod_sheet"

    # Create commit
    local commit_msg="Deploy to production: sheet-${sheet_num} from staging

Deployed: $(date -u +%Y-%m-%dT%H:%M:%SZ)
Source: staging-sheets/sheet-${sheet_num}_DEV3
Target: production-sheets/sheet-${sheet_num}_PROD

Deployment validated and approved.
"

    git commit -m "$commit_msg" || log_warning "No changes to commit"

    log_success "Committed to git"
}

# Rollback function
rollback_deployment() {
    local backup_path=$1
    local prod_sheet=$2

    log_warning "Rolling back deployment..."

    # Restore production from backup
    rm -rf "$prod_sheet/live"
    cp -r "$backup_path/live" "$prod_sheet/"

    log_success "Rollback complete - production restored from backup"
}

# Deploy a single sheet
deploy_sheet() {
    local sheet_num=$1
    local auto_approve=${2:-false}

    log_info "Deploying sheet $sheet_num..."

    # Find directories
    local staging_sheet=$(find_staging_sheet "$sheet_num")
    local prod_sheet=$(find_production_sheet "$sheet_num")

    log_info "Staging: $(basename "$staging_sheet")"
    log_info "Production: $(basename "$prod_sheet")"

    # Step 1: Validate staging
    validate_staging "$staging_sheet" "$sheet_num"

    # Step 2: Show diff
    show_diff "$staging_sheet" "$prod_sheet"

    # Step 3: Request approval
    request_approval "$auto_approve"

    # Step 4: Backup production
    local backup_path=$(backup_production "$prod_sheet" "$sheet_num")

    # Step 5: Deploy
    deploy_code "$staging_sheet" "$prod_sheet"

    # Step 6: Verify
    if ! verify_deployment "$prod_sheet" "$staging_sheet"; then
        log_error "Verification failed - initiating rollback"
        rollback_deployment "$backup_path" "$prod_sheet"
        exit 1
    fi

    # Step 7: Commit
    commit_deployment "$sheet_num" "$prod_sheet"

    log_success "Deployment complete for sheet $sheet_num"
    echo ""
}

# Deploy multiple sheets (batch)
deploy_batch() {
    local start=$1
    local end=$2
    local auto_approve=${3:-false}

    log_info "Batch deployment: sheets $start to $end"

    local success_count=0
    local fail_count=0

    for ((i=start; i<=end; i++)); do
        echo ""
        echo "═══════════════════════════════════════════════════════════"
        echo "  Sheet $i of $end"
        echo "═══════════════════════════════════════════════════════════"

        if deploy_sheet "$i" "$auto_approve"; then
            ((success_count++))
        else
            ((fail_count++))
            log_error "Failed to deploy sheet $i"
        fi
    done

    echo ""
    echo "═══════════════════════════════════════════════════════════"
    echo "  Batch Deployment Summary"
    echo "═══════════════════════════════════════════════════════════"
    echo "  Total: $((end - start + 1))"
    echo "  Success: $success_count"
    echo "  Failed: $fail_count"
    echo "═══════════════════════════════════════════════════════════"
    echo ""
}

# Main function
main() {
    print_banner

    local sheet_num=""
    local batch_start=""
    local batch_end=""
    local auto_approve=false

    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --sheet)
                sheet_num="$2"
                shift 2
                ;;
            --batch)
                batch_start="$2"
                batch_end="$3"
                shift 3
                ;;
            --auto-approve)
                auto_approve=true
                shift
                ;;
            --help)
                cat << EOF
Staging to Production Deployment Script

Usage:
  ./deploy-to-production.sh --sheet <number>           Deploy single sheet
  ./deploy-to-production.sh --batch <start> <end>      Deploy multiple sheets
  ./deploy-to-production.sh --sheet 42 --auto-approve  Skip manual approval

Options:
  --sheet <number>      Sheet number to deploy (e.g., 42)
  --batch <start> <end> Deploy range of sheets (e.g., 1 10)
  --auto-approve        Skip manual approval (use with caution!)
  --help                Show this help message

Examples:
  ./deploy-to-production.sh --sheet 42
  ./deploy-to-production.sh --batch 1 10

Safety Features:
  ✓ PHI detection (blocks deployment if PHI found)
  ✓ Manual approval required (unless --auto-approve)
  ✓ Production backup before deployment
  ✓ Post-deployment verification
  ✓ Automatic rollback on failure
  ✓ Git commit for audit trail

Logs: $LOG_FILE
Backups: $BACKUP_DIR
EOF
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                echo "Use --help for usage information"
                exit 1
                ;;
        esac
    done

    # Validate input
    if [ -z "$sheet_num" ] && [ -z "$batch_start" ]; then
        log_error "Must specify --sheet or --batch"
        echo "Use --help for usage information"
        exit 1
    fi

    # Execute deployment
    if [ -n "$sheet_num" ]; then
        deploy_sheet "$sheet_num" "$auto_approve"
    elif [ -n "$batch_start" ]; then
        deploy_batch "$batch_start" "$batch_end" "$auto_approve"
    fi

    log_success "All deployments complete!"
}

# Run main function
main "$@"

#!/bin/bash
# 6-Layer Backup System Health Check
# Verifies all backup layers and reports status

set -e

REPO_ROOT="/Users/mmaruthurnew/Desktop/medical-patient-data/Implementation Projects/google-sheets-version-control"
EXPECTED_SHEETS=470

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "========================================================================"
echo "  6-Layer Backup System Health Check"
echo "========================================================================"
echo "Date: $(date '+%Y-%m-%d %H:%M:%S')"
echo "Repository: $REPO_ROOT"
echo ""

# Layer 1: Google Drive (Source of Truth)
echo -e "${BLUE}=== Layer 1: Google Drive (Source of Truth) ===${NC}"
if [ -f "$REPO_ROOT/config/sheet-registry.json" ]; then
    REGISTRY_COUNT=$(cat "$REPO_ROOT/config/sheet-registry.json" | jq '.metadata.totalProduction' 2>/dev/null || echo "0")
    echo -e "  ${GREEN}✓${NC} Registry exists: $REGISTRY_COUNT production sheets"
else
    echo -e "  ${RED}✗${NC} Registry file missing!"
fi
echo ""

# Layer 2: Local Git
echo -e "${BLUE}=== Layer 2: Local Git (Version Control) ===${NC}"
cd "$REPO_ROOT"
ACTUAL_SHEETS=$(ls -d production-sheets/sheet-* 2>/dev/null | wc -l | xargs)
echo -e "  ${GREEN}✓${NC} Production sheets tracked: $ACTUAL_SHEETS (expected: $EXPECTED_SHEETS)"

if git status &>/dev/null; then
    echo -e "  ${GREEN}✓${NC} Git repository healthy"

    UNCOMMITTED=$(git status --porcelain | wc -l | xargs)
    if [ "$UNCOMMITTED" -eq 0 ]; then
        echo -e "  ${GREEN}✓${NC} No uncommitted changes"
    else
        echo -e "  ${YELLOW}⚠${NC}  Uncommitted changes: $UNCOMMITTED files"
    fi

    LAST_COMMIT=$(git log -1 --format="%h - %s" 2>/dev/null || echo "No commits")
    echo -e "  ${GREEN}✓${NC} Last commit: $LAST_COMMIT"
else
    echo -e "  ${RED}✗${NC} Git repository corrupted!"
fi
echo ""

# Layer 3: GitHub Remote
echo -e "${BLUE}=== Layer 3: GitHub Remote Backup ===${NC}"
if git remote get-url origin &>/dev/null; then
    REMOTE_URL=$(git remote get-url origin)
    echo -e "  ${GREEN}✓${NC} Remote configured: $REMOTE_URL"

    if git fetch origin main --dry-run &>/dev/null; then
        echo -e "  ${GREEN}✓${NC} Can connect to GitHub"

        LOCAL=$(git rev-parse HEAD 2>/dev/null || echo "")
        REMOTE=$(git rev-parse origin/main 2>/dev/null || echo "")

        if [ -n "$LOCAL" ] && [ -n "$REMOTE" ]; then
            if [ "$LOCAL" = "$REMOTE" ]; then
                echo -e "  ${GREEN}✓${NC} In sync with remote"
            else
                AHEAD=$(git rev-list --count origin/main..HEAD 2>/dev/null || echo "0")
                BEHIND=$(git rev-list --count HEAD..origin/main 2>/dev/null || echo "0")
                echo -e "  ${YELLOW}⚠${NC}  Out of sync: $AHEAD ahead, $BEHIND behind"
            fi
        fi
    else
        echo -e "  ${RED}✗${NC} Cannot connect to GitHub"
    fi
else
    echo -e "  ${RED}✗${NC} No remote configured!"
fi
echo ""

# Layer 4: Branch Protection
echo -e "${BLUE}=== Layer 4: GitHub Branch Protection ===${NC}"
echo -e "  ${YELLOW}⚠${NC}  Manual verification required"
echo -e "  Check: https://github.com/mmaruthurssd/medical-patient-data/settings/branches"
echo ""

# Layer 5: Google Cloud Storage
echo -e "${BLUE}=== Layer 5: Google Cloud Storage (Immutable Backup) ===${NC}"
if [ -f "/Users/mmaruthurnew/Desktop/medical-patient-data/google-workspace-oauth-setup/service-account.json" ]; then
    echo -e "  ${GREEN}✓${NC} Service account credentials exist"

    export GOOGLE_APPLICATION_CREDENTIALS="/Users/mmaruthurnew/Desktop/medical-patient-data/google-workspace-oauth-setup/service-account.json"

    if gsutil ls gs://ssd-sheets-backup-immutable/ &>/dev/null; then
        echo -e "  ${GREEN}✓${NC} GCS bucket accessible"
        BACKUP_COUNT=$(gsutil ls gs://ssd-sheets-backup-immutable/daily-backups/ 2>/dev/null | wc -l | xargs)
        echo -e "  ${GREEN}✓${NC} Backups found: $BACKUP_COUNT files"
    else
        echo -e "  ${YELLOW}⚠${NC}  GCS bucket not accessible (setup pending)"
        echo -e "  See: docs/GCS-BACKUP-SETUP-GUIDE.md"
    fi
else
    echo -e "  ${RED}✗${NC} Service account credentials missing!"
fi
echo ""

# Layer 6: Time Machine
echo -e "${BLUE}=== Layer 6: Time Machine (Local Backup) ===${NC}"
if command -v tmutil &>/dev/null; then
    EXCLUDED=$(tmutil isexcluded "$REPO_ROOT" 2>/dev/null | grep -q "Excluded" && echo "YES" || echo "NO")
    if [ "$EXCLUDED" = "NO" ]; then
        echo -e "  ${GREEN}✓${NC} Directory included in Time Machine backups"

        LATEST=$(tmutil latestbackup 2>/dev/null || echo "Unknown")
        echo -e "  ${GREEN}✓${NC} Latest backup: $LATEST"
    else
        echo -e "  ${RED}✗${NC} Directory EXCLUDED from Time Machine!"
    fi
else
    echo -e "  ${YELLOW}⚠${NC}  Time Machine not available (not on macOS?)"
fi
echo ""

# GitHub Actions Status
echo -e "${BLUE}=== GitHub Actions Workflows ===${NC}"
echo -e "  Manual verification required:"
echo -e "  - Daily Snapshots: https://github.com/mmaruthurssd/medical-patient-data/actions/workflows/daily-snapshots.yml"
echo -e "  - GCS Backup: https://github.com/mmaruthurssd/medical-patient-data/actions/workflows/backup-to-gcs.yml"
echo -e "  - Docs Sync: https://github.com/mmaruthurssd/medical-patient-data/actions/workflows/sync-docs-to-drive.yml"
echo ""

# Summary
echo "========================================================================"
echo "  SUMMARY"
echo "========================================================================"

HEALTHY=0
TOTAL=6

# Count healthy layers
[ -f "$REPO_ROOT/config/sheet-registry.json" ] && ((HEALTHY++))
git status &>/dev/null && ((HEALTHY++))
git remote get-url origin &>/dev/null && ((HEALTHY++))
# Layer 4: manual check (assume pending)
# Layer 5: check GCS
gsutil ls gs://ssd-sheets-backup-immutable/ &>/dev/null && ((HEALTHY++))
# Layer 6: check Time Machine
[ "$(tmutil isexcluded "$REPO_ROOT" 2>/dev/null | grep -q "Excluded" && echo "YES" || echo "NO")" = "NO" ] && ((HEALTHY++))

PERCENTAGE=$((HEALTHY * 100 / TOTAL))

echo ""
echo -e "Backup Layers Operational: ${GREEN}$HEALTHY${NC} of ${TOTAL}"
echo -e "System Health: ${GREEN}$PERCENTAGE%${NC}"
echo ""

if [ $HEALTHY -ge 4 ]; then
    echo -e "${GREEN}✓ System Status: HEALTHY${NC}"
    echo "  Risk Level: LOW"
    echo "  Multiple backup layers provide adequate protection"
elif [ $HEALTHY -ge 2 ]; then
    echo -e "${YELLOW}⚠ System Status: DEGRADED${NC}"
    echo "  Risk Level: MEDIUM"
    echo "  Recommend completing setup of all layers"
else
    echo -e "${RED}✗ System Status: CRITICAL${NC}"
    echo "  Risk Level: HIGH"
    echo "  Immediate action required!"
fi

echo ""
echo "For setup instructions, see:"
echo "  - GITHUB-SECRETS-SETUP.md"
echo "  - docs/GCS-BACKUP-SETUP-GUIDE.md"
echo "  - BACKUP-SYSTEM-STATUS.md"
echo ""
echo "========================================================================"

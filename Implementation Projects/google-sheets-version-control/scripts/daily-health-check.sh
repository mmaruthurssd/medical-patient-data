#!/bin/bash
# Daily health check for backup system
# Run manually or set up in cron: 0 8 * * * /path/to/daily-health-check.sh

REPO_ROOT="/Users/mmaruthurnew/Desktop/medical-patient-data/Implementation Projects/google-sheets-version-control"
cd "$REPO_ROOT" || exit 1

echo "=== Google Sheets Version Control - Daily Health Check ==="
echo "Date: $(date)"
echo ""

# Check 1: File count
# Updated 2025-11-12: New count reflects production deployment
# 235 dev-3 (staging) + 235 dev-4 + 118 old prod + 204 new prod = 792
PROD_COUNT=$(ls -d production-sheets/sheet-* 2>/dev/null | wc -l | xargs)
EXPECTED_COUNT=792
echo "✓ Production sheets: $PROD_COUNT (expected: $EXPECTED_COUNT)"
if [ "$PROD_COUNT" -ne "$EXPECTED_COUNT" ]; then
    echo "  ⚠️  WARNING: Count mismatch!"
fi

# Check 2: Git status
if git status 2>/dev/null | grep -q "nothing to commit"; then
    echo "✓ Git status: Clean"
else
    echo "⚠️  Git status: Uncommitted changes"
    git status --short | head -10
fi

# Check 3: Remote sync
git fetch 2>/dev/null
LOCAL=$(git rev-parse @ 2>/dev/null)
REMOTE=$(git rev-parse @{u} 2>/dev/null)
if [ "$LOCAL" = "$REMOTE" ]; then
    echo "✓ GitHub sync: Up to date"
else
    echo "⚠️  GitHub sync: Out of sync (may need to push/pull)"
fi

# Check 4: Recent backup
LAST_BACKUP=$(git log --oneline --grep="automated snapshot" -1 2>/dev/null)
echo "✓ Last automated backup: $LAST_BACKUP"

# Check 5: Critical files exist
if [ -f "config/sheet-registry.json" ]; then
    SIZE=$(du -h config/sheet-registry.json | cut -f1)
    echo "✓ Sheet registry: Exists ($SIZE)"
else
    echo "❌ Sheet registry: MISSING!"
fi

# Check 6: Hooks installed
if [ -x ".git/hooks/pre-commit" ]; then
    echo "✓ Pre-commit hook: Installed"
else
    echo "❌ Pre-commit hook: Missing or not executable!"
fi

if [ -x ".git/hooks/pre-push" ]; then
    echo "✓ Pre-push hook: Installed"
else
    echo "⚠️  Pre-push hook: Not installed (recommended)"
fi

# Check 7: Time Machine backup (macOS only)
if command -v tmutil &> /dev/null; then
    if tmutil isexcluded "$REPO_ROOT" 2>/dev/null | grep -q "\[Excluded\]"; then
        echo "⚠️  Time Machine: This directory is EXCLUDED"
    else
        echo "✓ Time Machine: Backing up this directory"
        LAST_TM_BACKUP=$(tmutil latestbackup 2>/dev/null | head -1)
        if [ -n "$LAST_TM_BACKUP" ]; then
            echo "  Last backup: $(basename "$LAST_TM_BACKUP")"
        fi
    fi
else
    echo "ℹ️  Time Machine: Not available (not macOS)"
fi

# Check 8: .gitattributes exists
if [ -f ".gitattributes" ]; then
    echo "✓ .gitattributes: Configured"
else
    echo "⚠️  .gitattributes: Not found (recommended)"
fi

echo ""
echo "=== Health Check Complete ==="

# Exit with error code if critical issues found
if [ "$PROD_COUNT" -ne "$EXPECTED_COUNT" ] || [ ! -f "config/sheet-registry.json" ] || [ ! -x ".git/hooks/pre-commit" ]; then
    echo ""
    echo "❌ CRITICAL ISSUES DETECTED - Review above warnings"
    exit 1
fi

exit 0

#!/bin/bash
# Workspace Health Check
# Comprehensive health monitoring for SSD Google Sheets Version Control

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CREDENTIAL_CHECKER="$PROJECT_ROOT/security/credentials/check-rotation-status.sh"

echo "════════════════════════════════════════════════════════════════"
echo "  SSD GOOGLE SHEETS VERSION CONTROL - WORKSPACE HEALTH CHECK"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Project: $PROJECT_ROOT"
echo "Date: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# Track overall health status
HEALTH_ISSUES=0
HEALTH_WARNINGS=0

# 1. Check Git Repository Status
echo "─────────────────────────────────────────────────────────────────"
echo "1. GIT REPOSITORY STATUS"
echo "─────────────────────────────────────────────────────────────────"

if [ -d "$PROJECT_ROOT/.git" ]; then
    echo "✅ Git repository initialized"

    # Check for uncommitted changes
    cd "$PROJECT_ROOT"
    if [ -n "$(git status --porcelain)" ]; then
        echo "⚠️  Uncommitted changes detected"
        HEALTH_WARNINGS=$((HEALTH_WARNINGS + 1))
    else
        echo "✅ Working directory clean"
    fi

    # Check branch
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    echo "   Current branch: $CURRENT_BRANCH"

    # Check last commit
    LAST_COMMIT=$(git log -1 --format="%h - %s (%ar)")
    echo "   Last commit: $LAST_COMMIT"
else
    echo "❌ Git repository not found"
    HEALTH_ISSUES=$((HEALTH_ISSUES + 1))
fi

echo ""

# 2. Check Node.js Dependencies
echo "─────────────────────────────────────────────────────────────────"
echo "2. NODE.JS DEPENDENCIES"
echo "─────────────────────────────────────────────────────────────────"

if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js installed: $NODE_VERSION"

    if [ -f "$PROJECT_ROOT/package.json" ]; then
        echo "✅ package.json found"

        if [ -d "$PROJECT_ROOT/node_modules" ]; then
            echo "✅ node_modules directory exists"
        else
            echo "⚠️  node_modules not found - run 'npm install'"
            HEALTH_WARNINGS=$((HEALTH_WARNINGS + 1))
        fi
    else
        echo "⚠️  package.json not found"
        HEALTH_WARNINGS=$((HEALTH_WARNINGS + 1))
    fi
else
    echo "❌ Node.js not installed"
    HEALTH_ISSUES=$((HEALTH_ISSUES + 1))
fi

echo ""

# 3. Check Credential Rotation Status
echo "─────────────────────────────────────────────────────────────────"
echo "3. CREDENTIAL ROTATION STATUS"
echo "─────────────────────────────────────────────────────────────────"

if [ -f "$CREDENTIAL_CHECKER" ]; then
    if "$CREDENTIAL_CHECKER"; then
        echo "✅ All credentials current - no rotations needed"
    else
        EXIT_CODE=$?
        if [ $EXIT_CODE -eq 1 ]; then
            echo "⚠️  Warning: Credential rotations needed soon"
            HEALTH_WARNINGS=$((HEALTH_WARNINGS + 1))
        elif [ $EXIT_CODE -eq 2 ]; then
            echo "❌ Critical: Overdue credential rotations"
            HEALTH_ISSUES=$((HEALTH_ISSUES + 1))
        fi
    fi
else
    echo "⚠️  Credential rotation checker not found"
    echo "   Expected: $CREDENTIAL_CHECKER"
    HEALTH_WARNINGS=$((HEALTH_WARNINGS + 1))
fi

echo ""

# 4. Check GitHub Secrets (if running in GitHub Actions)
echo "─────────────────────────────────────────────────────────────────"
echo "4. GITHUB ACTIONS CONFIGURATION"
echo "─────────────────────────────────────────────────────────────────"

WORKFLOW_DIR="$PROJECT_ROOT/.github/workflows"
if [ -d "$WORKFLOW_DIR" ]; then
    WORKFLOW_COUNT=$(ls -1 "$WORKFLOW_DIR"/*.yml 2>/dev/null | wc -l | tr -d ' ')
    echo "✅ GitHub workflows directory exists"
    echo "   Active workflows: $WORKFLOW_COUNT"

    # List workflows
    if [ "$WORKFLOW_COUNT" -gt 0 ]; then
        for workflow in "$WORKFLOW_DIR"/*.yml; do
            echo "   - $(basename "$workflow")"
        done
    fi
else
    echo "⚠️  No GitHub workflows configured"
    HEALTH_WARNINGS=$((HEALTH_WARNINGS + 1))
fi

echo ""

# 5. Check Directory Structure
echo "─────────────────────────────────────────────────────────────────"
echo "5. PROJECT DIRECTORY STRUCTURE"
echo "─────────────────────────────────────────────────────────────────"

REQUIRED_DIRS=(
    "production-sheets"
    "config"
    "scripts"
    "docs"
    "security/credentials"
)

for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$PROJECT_ROOT/$dir" ]; then
        echo "✅ $dir/"
    else
        echo "❌ Missing: $dir/"
        HEALTH_ISSUES=$((HEALTH_ISSUES + 1))
    fi
done

echo ""

# 6. Check Critical Files
echo "─────────────────────────────────────────────────────────────────"
echo "6. CRITICAL FILES"
echo "─────────────────────────────────────────────────────────────────"

CRITICAL_FILES=(
    "README.md"
    "SECURITY.md"
    "package.json"
    "config/sheet-registry.json"
    "security/credentials/credential-inventory.json"
    "security/credentials/credential-manager.js"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$PROJECT_ROOT/$file" ]; then
        echo "✅ $file"
    else
        echo "❌ Missing: $file"
        HEALTH_ISSUES=$((HEALTH_ISSUES + 1))
    fi
done

echo ""

# 7. Check Production Sheets
echo "─────────────────────────────────────────────────────────────────"
echo "7. PRODUCTION SHEETS"
echo "─────────────────────────────────────────────────────────────────"

if [ -d "$PROJECT_ROOT/production-sheets" ]; then
    SHEET_COUNT=$(ls -1d "$PROJECT_ROOT/production-sheets"/sheet-* 2>/dev/null | wc -l | tr -d ' ')
    echo "✅ Production sheets directory exists"
    echo "   Total sheets tracked: $SHEET_COUNT"

    # Check for recent updates
    if [ "$SHEET_COUNT" -gt 0 ]; then
        LATEST_UPDATE=$(find "$PROJECT_ROOT/production-sheets" -type f -name "*.gs" -exec stat -f "%m %N" {} \; 2>/dev/null | sort -rn | head -1 | cut -d' ' -f1)
        if [ -n "$LATEST_UPDATE" ]; then
            DAYS_AGO=$(( ($(date +%s) - $LATEST_UPDATE) / 86400 ))
            echo "   Last update: $DAYS_AGO days ago"

            if [ "$DAYS_AGO" -gt 7 ]; then
                echo "   ⚠️  No updates in over 7 days"
                HEALTH_WARNINGS=$((HEALTH_WARNINGS + 1))
            fi
        fi
    fi
else
    echo "❌ Production sheets directory not found"
    HEALTH_ISSUES=$((HEALTH_ISSUES + 1))
fi

echo ""

# 8. Check Documentation
echo "─────────────────────────────────────────────────────────────────"
echo "8. DOCUMENTATION STATUS"
echo "─────────────────────────────────────────────────────────────────"

REQUIRED_DOCS=(
    "docs/CREDENTIAL-ROTATION-GUIDE.md"
    "docs/SERVICE-ACCOUNT.md"
    "docs/AUTHENTICATION-GUIDE.md"
)

for doc in "${REQUIRED_DOCS[@]}"; do
    if [ -f "$PROJECT_ROOT/$doc" ]; then
        echo "✅ $doc"
    else
        echo "⚠️  Missing: $doc"
        HEALTH_WARNINGS=$((HEALTH_WARNINGS + 1))
    fi
done

echo ""

# 9. Security Configuration Check
echo "─────────────────────────────────────────────────────────────────"
echo "9. SECURITY CONFIGURATION"
echo "─────────────────────────────────────────────────────────────────"

# Check .gitignore
if [ -f "$PROJECT_ROOT/.gitignore" ]; then
    echo "✅ .gitignore configured"

    # Check for critical exclusions
    CRITICAL_IGNORES=(
        "credentials.json"
        "token.json"
        "service-account*.json"
        ".env"
        "node_modules"
    )

    for pattern in "${CRITICAL_IGNORES[@]}"; do
        if grep -q "$pattern" "$PROJECT_ROOT/.gitignore"; then
            echo "   ✅ Ignoring: $pattern"
        else
            echo "   ⚠️  Not ignored: $pattern"
            HEALTH_WARNINGS=$((HEALTH_WARNINGS + 1))
        fi
    done
else
    echo "❌ .gitignore not found"
    HEALTH_ISSUES=$((HEALTH_ISSUES + 1))
fi

# Check for accidentally committed credentials
echo ""
echo "   Checking for exposed credentials..."
EXPOSED_FILES=$(git ls-files "$PROJECT_ROOT" 2>/dev/null | grep -E "\\.env$|credentials\\.json$|token\\.json$|service-account.*\\.json$" || true)

if [ -n "$EXPOSED_FILES" ]; then
    echo "   ❌ CRITICAL: Credentials found in git:"
    echo "$EXPOSED_FILES" | while read -r file; do
        echo "      - $file"
    done
    HEALTH_ISSUES=$((HEALTH_ISSUES + 10))  # Critical security issue
else
    echo "   ✅ No exposed credentials found"
fi

echo ""

# Summary
echo "════════════════════════════════════════════════════════════════"
echo "  HEALTH CHECK SUMMARY"
echo "════════════════════════════════════════════════════════════════"
echo ""

if [ $HEALTH_ISSUES -eq 0 ] && [ $HEALTH_WARNINGS -eq 0 ]; then
    echo "✅ SYSTEM HEALTHY"
    echo "   No issues or warnings detected"
    EXIT_STATUS=0
elif [ $HEALTH_ISSUES -eq 0 ]; then
    echo "⚠️  WARNINGS DETECTED"
    echo "   Warnings: $HEALTH_WARNINGS"
    echo "   Issues: 0"
    echo ""
    echo "   Action: Review warnings and address when convenient"
    EXIT_STATUS=1
else
    echo "❌ ISSUES DETECTED"
    echo "   Issues: $HEALTH_ISSUES"
    echo "   Warnings: $HEALTH_WARNINGS"
    echo ""
    echo "   Action: Address critical issues immediately"
    EXIT_STATUS=2
fi

echo ""
echo "════════════════════════════════════════════════════════════════"
echo ""

exit $EXIT_STATUS

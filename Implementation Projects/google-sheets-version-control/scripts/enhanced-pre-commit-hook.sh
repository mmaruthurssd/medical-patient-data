#!/bin/bash
# Enhanced pre-commit hook with multiple safety checks
# Install: cp scripts/enhanced-pre-commit-hook.sh .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit

# Color codes for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${GREEN}Running pre-commit safety checks...${NC}"

# Check 1: Verify sheet count hasn't decreased
CURRENT_COUNT=$(ls -d production-sheets/sheet-* 2>/dev/null | wc -l)
EXPECTED_COUNT=588

if [ $CURRENT_COUNT -lt $EXPECTED_COUNT ]; then
  echo -e "${RED}❌ COMMIT BLOCKED: Production sheet count decreased!${NC}"
  echo "  Current: $CURRENT_COUNT"
  echo "  Expected: $EXPECTED_COUNT"
  echo "  Missing: $((EXPECTED_COUNT - CURRENT_COUNT)) sheets"
  echo ""
  echo "This suggests sheets were deleted. Verify with: git status"
  exit 1
fi

# Check 2: Detect large deletions
DELETED_PRODUCTION=$(git diff --cached --name-status | grep "^D" | grep "production-sheets/" | wc -l)
DELETED_STAGING=$(git diff --cached --name-status | grep "^D" | grep "staging-sheets/" | wc -l)
DELETED_CONFIG=$(git diff --cached --name-status | grep "^D" | grep "config/sheet-registry.json" | wc -l)

if [ "$DELETED_PRODUCTION" -gt 10 ]; then
  echo -e "${RED}❌ COMMIT BLOCKED: Attempting to delete $DELETED_PRODUCTION production sheets!${NC}"
  echo ""
  echo "Files being deleted:"
  git diff --cached --name-status | grep "^D" | grep "production-sheets/" | head -10
  echo ""
  echo "To bypass (DANGEROUS): git commit --no-verify"
  exit 1
fi

if [ "$DELETED_STAGING" -gt 10 ]; then
  echo -e "${RED}❌ COMMIT BLOCKED: Attempting to delete $DELETED_STAGING staging sheets!${NC}"
  exit 1
fi

if [ "$DELETED_CONFIG" -gt 0 ]; then
  echo -e "${RED}❌ COMMIT BLOCKED: Attempting to delete sheet-registry.json!${NC}"
  exit 1
fi

# Check 3: Verify critical files still exist
if [ ! -f "config/sheet-registry.json" ]; then
  echo -e "${RED}❌ COMMIT BLOCKED: sheet-registry.json is missing!${NC}"
  exit 1
fi

# Check 4: Warn about large file additions (possible mistake)
ADDED_FILES=$(git diff --cached --name-status | grep "^A" | wc -l)
if [ "$ADDED_FILES" -gt 100 ]; then
  echo -e "${YELLOW}⚠️  WARNING: Adding $ADDED_FILES new files${NC}"
  echo "This seems like a lot. Continue? (y/n)"
  read -r response
  if [[ ! "$response" =~ ^[Yy]$ ]]; then
    echo "Commit cancelled"
    exit 1
  fi
fi

# Check 5: Verify no unintentional .gitignore changes
if git diff --cached --name-only | grep -q "^\.gitignore$"; then
  echo -e "${YELLOW}⚠️  WARNING: .gitignore is being modified${NC}"
  echo "Changes:"
  git diff --cached .gitignore
  echo ""
  echo "Continue? (y/n)"
  read -r response
  if [[ ! "$response" =~ ^[Yy]$ ]]; then
    echo "Commit cancelled"
    exit 1
  fi
fi

echo -e "${GREEN}✅ All pre-commit checks passed${NC}"
echo "  Production sheets: $CURRENT_COUNT"
echo "  Deletions: $DELETED_PRODUCTION production, $DELETED_STAGING staging"
echo ""
exit 0

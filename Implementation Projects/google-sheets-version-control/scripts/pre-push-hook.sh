#!/bin/bash
# Pre-push hook - final verification before pushing to GitHub
# Install: cp scripts/pre-push-hook.sh .git/hooks/pre-push && chmod +x .git/hooks/pre-push

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${GREEN}Running pre-push verification...${NC}"

# Check 1: Verify sheet count
SHEET_COUNT=$(ls -d production-sheets/sheet-* 2>/dev/null | wc -l)
if [ $SHEET_COUNT -ne 588 ]; then
  echo -e "${RED}❌ PUSH BLOCKED: Production sheet count is $SHEET_COUNT (expected 588)${NC}"
  exit 1
fi

# Check 2: Verify sheet-registry.json exists
if [ ! -f "config/sheet-registry.json" ]; then
  echo -e "${RED}❌ PUSH BLOCKED: sheet-registry.json is missing!${NC}"
  exit 1
fi

# Check 3: Verify we're not force pushing
while read local_ref local_sha remote_ref remote_sha
do
  if [ "$local_sha" != "$remote_sha" ]; then
    # Check if this is a force push by seeing if remote_sha is ancestor of local_sha
    if [ "$remote_sha" != "0000000000000000000000000000000000000000" ]; then
      if ! git merge-base --is-ancestor "$remote_sha" "$local_sha" 2>/dev/null; then
        echo -e "${RED}❌ PUSH BLOCKED: This appears to be a force push!${NC}"
        echo "Force pushing is not allowed on this repository"
        exit 1
      fi
    fi
  fi
done

# Check 4: Show what's being pushed
echo ""
echo -e "${YELLOW}Commits being pushed:${NC}"
git log --oneline origin/main..HEAD 2>/dev/null || git log --oneline HEAD~5..HEAD

echo ""
echo -e "${YELLOW}Files changed in these commits:${NC}"
git diff --stat origin/main..HEAD 2>/dev/null || echo "(Unable to compare with remote - first push?)"

echo ""
echo -e "${GREEN}✅ Pre-push verification passed${NC}"
echo "  Production sheets: $SHEET_COUNT"
echo ""
exit 0

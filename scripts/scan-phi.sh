#!/bin/bash
#
# PHI Scanner - Manual Scan Script
# Scans directories for Protected Health Information
#
# Usage:
#   ./scripts/scan-phi.sh                    # Scan entire workspace
#   ./scripts/scan-phi.sh projects-in-development  # Scan specific directory
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

TARGET="${1:-.}"  # Default to current directory if no argument

echo "🔍 PHI Scanner - HIPAA Compliance Tool"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Target: $TARGET"
echo ""

# Check if target exists
if [ ! -e "$TARGET" ]; then
    echo -e "${RED}❌ Error: Target not found: $TARGET${NC}"
    exit 1
fi

# Check if it's a symlink (important for projects-in-development)
if [ -L "$TARGET" ]; then
    REAL_PATH=$(readlink "$TARGET")
    echo -e "${YELLOW}⚠️  Warning: Scanning symlink${NC}"
    echo "   Symlink: $TARGET"
    echo "   Points to: $REAL_PATH"
    echo ""
fi

echo "Scanning for PHI patterns..."
echo ""

PHI_FOUND=0
TOTAL_FILES=0
SCANNED_FILES=0

# PHI Patterns (pattern_name:regex)
PHI_PATTERNS=(
    "SSN:[0-9]{3}-[0-9]{2}-[0-9]{4}"
    "Phone:(\([0-9]{3}\)\s*|[0-9]{3}[-.])[0-9]{3}[-. ][0-9]{4}"
    "Email:[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
    "MRN:(MRN|medical record number|patient id)[\s:]+[A-Z0-9-]{5,}"
    "DOB:(DOB|date of birth|birth date)[\s:]+[0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{2,4}"
    "ZIP:[0-9]{5}(-[0-9]{4})?"
)

# Exclusion patterns (to reduce false positives)
EXCLUDE_DIRS="node_modules|dist|build|.git|.next|coverage|audit-logs"

# Find all text files
if [ -d "$TARGET" ]; then
    FILES=$(find "$TARGET" -type f \( -name "*.ts" -o -name "*.js" -o -name "*.json" -o -name "*.md" -o -name "*.txt" -o -name "*.py" \) | grep -vE "$EXCLUDE_DIRS" || true)
else
    FILES="$TARGET"
fi

TOTAL_FILES=$(echo "$FILES" | grep -c ^ || echo 0)

if [ "$TOTAL_FILES" -eq 0 ]; then
    echo -e "${YELLOW}⚠️  No files to scan${NC}"
    exit 0
fi

echo "Found $TOTAL_FILES files to scan"
echo ""

# Scan each file
for FILE in $FILES; do
    if [ -f "$FILE" ]; then
        SCANNED_FILES=$((SCANNED_FILES + 1))
        FILE_HAS_PHI=0

        for PATTERN_ENTRY in "${PHI_PATTERNS[@]}"; do
            PATTERN_NAME="${PATTERN_ENTRY%%:*}"
            PATTERN="${PATTERN_ENTRY#*:}"

            if grep -qE "$PATTERN" "$FILE" 2>/dev/null; then
                if [ $FILE_HAS_PHI -eq 0 ]; then
                    echo -e "${RED}❌ PHI DETECTED: $FILE${NC}"
                    FILE_HAS_PHI=1
                    PHI_FOUND=$((PHI_FOUND + 1))
                fi

                # Show matching lines (with line numbers)
                MATCHES=$(grep -nE "$PATTERN" "$FILE" 2>/dev/null | head -3)
                echo -e "   ${YELLOW}[$PATTERN_NAME]${NC}"
                echo "$MATCHES" | while read -r line; do
                    echo "      $line"
                done
                echo ""
            fi
        done
    fi
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Scan Results:"
echo "  Total files scanned: $SCANNED_FILES"
echo "  Files with PHI: $PHI_FOUND"
echo ""

if [ $PHI_FOUND -gt 0 ]; then
    echo -e "${RED}⚠️  HIPAA COMPLIANCE WARNING${NC}"
    echo ""
    echo "PHI detected in $PHI_FOUND file(s)."
    echo ""
    echo "Next Steps:"
    echo "  1. Remove PHI from flagged files"
    echo "  2. Use de-identification: npm run deidentify"
    echo "  3. Replace with synthetic data for testing"
    echo "  4. Never commit real patient data to git"
    echo ""
    exit 1
else
    echo -e "${GREEN}✅ No PHI detected${NC}"
    echo ""
    echo "All files are HIPAA-compliant"
    exit 0
fi

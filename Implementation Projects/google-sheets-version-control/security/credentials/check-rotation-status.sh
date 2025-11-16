#!/bin/bash
# Credential Rotation Status Check
# Integrates with workspace health monitoring
# Returns exit code 0 if all OK, 1 if warnings, 2 if critical/overdue

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CREDENTIAL_MANAGER="$SCRIPT_DIR/credential-manager.js"

echo "════════════════════════════════════════════════════════════════"
echo "  CREDENTIAL ROTATION HEALTH CHECK"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed or not in PATH"
    exit 2
fi

# Check if credential manager exists
if [ ! -f "$CREDENTIAL_MANAGER" ]; then
    echo "❌ Credential manager not found: $CREDENTIAL_MANAGER"
    exit 2
fi

# Run status check
node "$CREDENTIAL_MANAGER" check-rotations

# Parse inventory to determine exit code
INVENTORY_FILE="$SCRIPT_DIR/credential-inventory.json"

if [ ! -f "$INVENTORY_FILE" ]; then
    echo "❌ Credential inventory not found"
    exit 2
fi

# Count credentials needing attention
OVERDUE_COUNT=0
CRITICAL_COUNT=0
WARNING_COUNT=0

# Use simple grep/wc approach for counting
# This is a basic implementation - could be enhanced with jq for more accuracy

# For now, run the check-rotations command and analyze its output
ROTATION_OUTPUT=$(node "$CREDENTIAL_MANAGER" check-rotations 2>&1)

if echo "$ROTATION_OUTPUT" | grep -q "No credentials require rotation"; then
    echo ""
    echo "✅ All credentials are current - no rotations needed"
    exit 0
fi

# Check for overdue or critical status
if echo "$ROTATION_OUTPUT" | grep -q "OVERDUE\|🔴"; then
    echo ""
    echo "🔴 CRITICAL: One or more credentials are OVERDUE for rotation"
    echo "   Action required immediately for HIPAA compliance"
    exit 2
fi

if echo "$ROTATION_OUTPUT" | grep -q "CRITICAL\|🟠"; then
    echo ""
    echo "🟠 WARNING: One or more credentials need rotation within 7 days"
    echo "   Schedule rotation soon to maintain compliance"
    exit 1
fi

if echo "$ROTATION_OUTPUT" | grep -q "WARNING\|🟡"; then
    echo ""
    echo "🟡 INFO: One or more credentials need rotation within 30 days"
    echo "   Plan rotation at your convenience"
    exit 1
fi

echo ""
echo "✅ All credentials are current"
exit 0

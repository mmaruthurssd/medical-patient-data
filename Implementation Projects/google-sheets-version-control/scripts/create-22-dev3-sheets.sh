#!/bin/bash
# Phase 3: Create local directories and pull code for 22 new DEV3 sheets
# This script reads from dev3-creation-tracker.csv and automates the directory creation and clasp pull

set -e  # Exit on any error

# Color codes
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

TRACKER_CSV="../backups/pre-dev3-creation-20251113/dev3-creation-tracker.csv"
PRODUCTION_DIR="../production-sheets"
LOG_FILE="../logs/dev3-creation-$(date +%Y%m%d-%H%M%S).log"

# Create log directory if it doesn't exist
mkdir -p ../logs

echo -e "${GREEN}=== Phase 3: Create 22 DEV3 Sheets Locally ===${NC}" | tee -a "$LOG_FILE"
echo "Started: $(date)" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Check if tracker CSV exists
if [ ! -f "$TRACKER_CSV" ]; then
  echo -e "${RED}ERROR: Tracker CSV not found at $TRACKER_CSV${NC}" | tee -a "$LOG_FILE"
  exit 1
fi

# Check if CSV has been filled in
FILLED_COUNT=$(tail -n +2 "$TRACKER_CSV" | awk -F',' '$8 != ""' | wc -l | tr -d ' ')
TOTAL_COUNT=22

echo -e "${BLUE}Checking tracker CSV...${NC}" | tee -a "$LOG_FILE"
echo "  Total sheets to create: $TOTAL_COUNT" | tee -a "$LOG_FILE"
echo "  Filled in tracker: $FILLED_COUNT" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

if [ "$FILLED_COUNT" -lt "$TOTAL_COUNT" ]; then
  echo -e "${YELLOW}WARNING: Only $FILLED_COUNT/$TOTAL_COUNT sheets have script IDs filled in${NC}" | tee -a "$LOG_FILE"
  echo "Please complete the tracker CSV before running this script." | tee -a "$LOG_FILE"
  echo "" | tee -a "$LOG_FILE"
  echo "Missing script IDs for:" | tee -a "$LOG_FILE"
  tail -n +2 "$TRACKER_CSV" | awk -F',' '$8 == "" {print "  - Serial " $1 ": " $2}' | tee -a "$LOG_FILE"
  echo "" | tee -a "$LOG_FILE"
  exit 1
fi

echo -e "${GREEN}✓ All 22 sheets have script IDs - proceeding with creation${NC}" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Counter for progress
SUCCESS_COUNT=0
FAILED_COUNT=0
SKIPPED_COUNT=0

# Read CSV and process each sheet
echo -e "${BLUE}Processing sheets...${NC}" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

tail -n +2 "$TRACKER_CSV" | while IFS=',' read -r serial category prod_registry current_dev3 action sheet_name new_spreadsheet_id new_script_id status notes; do

  # Skip if no script ID (shouldn't happen after our check, but just in case)
  if [ -z "$new_script_id" ]; then
    echo -e "${YELLOW}⚠ Skipping serial $serial - no script ID${NC}" | tee -a "$LOG_FILE"
    ((SKIPPED_COUNT++)) || true
    continue
  fi

  # Determine directory name based on serial and registry
  SERIAL_PADDED=$(printf "%03d" "$serial")

  # Get sheet name from metadata if available, otherwise use sheet_name from CSV
  PROD_DIR=$(find "$PRODUCTION_DIR" -maxdepth 1 -type d -name "sheet-${SERIAL_PADDED}_PROD*" | head -1)

  if [ -z "$PROD_DIR" ]; then
    echo -e "${RED}✗ Serial $serial: Cannot find PROD directory${NC}" | tee -a "$LOG_FILE"
    ((FAILED_COUNT++)) || true
    continue
  fi

  # Extract sheet name from PROD directory
  PROD_BASENAME=$(basename "$PROD_DIR")
  SHEET_NAME_PART=$(echo "$PROD_BASENAME" | sed 's/sheet-[0-9]*_PROD--//')

  DEV3_DIR="${PRODUCTION_DIR}/sheet-${SERIAL_PADDED}_DEV3--${SHEET_NAME_PART}"

  echo -e "${BLUE}Processing serial $serial...${NC}" | tee -a "$LOG_FILE"
  echo "  PROD Registry: $prod_registry" | tee -a "$LOG_FILE"
  echo "  Category: $category" | tee -a "$LOG_FILE"
  echo "  DEV3 Directory: $(basename "$DEV3_DIR")" | tee -a "$LOG_FILE"
  echo "  Script ID: $new_script_id" | tee -a "$LOG_FILE"

  # Create directory structure
  mkdir -p "$DEV3_DIR/live"
  mkdir -p "$DEV3_DIR/metadata"

  # Create .clasp.json with script ID
  cat > "$DEV3_DIR/.clasp.json" <<EOF
{
  "scriptId": "$new_script_id"
}
EOF

  # Copy .clasp.json to live directory
  cp "$DEV3_DIR/.clasp.json" "$DEV3_DIR/live/.clasp.json"

  # Pull code with clasp
  echo "  Pulling code from Google Drive..." | tee -a "$LOG_FILE"
  cd "$DEV3_DIR/live"

  if clasp pull 2>&1 | tee -a "$LOG_FILE"; then
    # Count files pulled
    FILE_COUNT=$(find . -maxdepth 1 -type f -name "*.js" -o -name "*.json" | grep -v ".clasp.json" | wc -l | tr -d ' ')
    echo -e "${GREEN}  ✓ Successfully pulled $FILE_COUNT files${NC}" | tee -a "$LOG_FILE"

    # Remove .clasp.json from live directory
    rm -f .clasp.json

    # Save metadata
    cd ../..
    echo "$new_script_id" > "$DEV3_DIR/metadata/script-id.txt"
    echo "$new_spreadsheet_id" > "$DEV3_DIR/metadata/spreadsheet-id.txt"
    echo "$(date)" > "$DEV3_DIR/metadata/created-from-prod.txt"
    echo "$prod_registry" > "$DEV3_DIR/metadata/registry-id.txt"

    ((SUCCESS_COUNT++)) || true
    echo "" | tee -a "$LOG_FILE"
  else
    echo -e "${RED}  ✗ Failed to pull code from Google Drive${NC}" | tee -a "$LOG_FILE"
    ((FAILED_COUNT++)) || true
    echo "" | tee -a "$LOG_FILE"
  fi

done

# Summary
echo "" | tee -a "$LOG_FILE"
echo -e "${GREEN}=== Summary ===${NC}" | tee -a "$LOG_FILE"
echo "  Successful: $SUCCESS_COUNT" | tee -a "$LOG_FILE"
echo "  Failed: $FAILED_COUNT" | tee -a "$LOG_FILE"
echo "  Skipped: $SKIPPED_COUNT" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"
echo "Completed: $(date)" | tee -a "$LOG_FILE"

if [ "$FAILED_COUNT" -gt 0 ]; then
  echo -e "${YELLOW}⚠ Some sheets failed - review log for details${NC}" | tee -a "$LOG_FILE"
  exit 1
fi

echo -e "${GREEN}✓ All 22 DEV3 sheets created successfully!${NC}" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"
echo "Next steps:" | tee -a "$LOG_FILE"
echo "1. Run verification: ./verify-prod-dev3-matches.sh" | tee -a "$LOG_FILE"
echo "2. Git commit: cd ../production-sheets && git add -A && git commit" | tee -a "$LOG_FILE"

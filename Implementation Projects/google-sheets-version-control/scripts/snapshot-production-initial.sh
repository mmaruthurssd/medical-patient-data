#!/bin/bash

# Initial snapshot of all 235 production sheets
# Uses clasp to pull code from Google Drive (read-only operation)
# Creates directory structure for production sheets

set -e  # Exit on error

PRODUCTION_CSV="../data/production-sheets.csv"
OUTPUT_DIR="../production-sheets"
LOG_FILE="../logs/snapshot-production-$(date +%Y%m%d-%H%M%S).log"

# Create logs directory if it doesn't exist
mkdir -p ../logs

# Create logs directory first
mkdir -p "$(dirname "$LOG_FILE")"

# Redirect all output to log file and terminal
exec > >(tee -a "$LOG_FILE") 2>&1

echo "========================================"
echo "Taking Initial Production Snapshots"
echo "========================================"
echo ""
echo "Start time: $(date)"
echo "Log file: $LOG_FILE"
echo ""

# Check if clasp is installed
if ! command -v clasp &> /dev/null; then
    echo "❌ ERROR: clasp is not installed"
    echo "Install with: npm install -g @google/clasp"
    exit 1
fi

# Check if clasp is logged in
if ! clasp login --status &> /dev/null; then
    echo "❌ ERROR: clasp not authenticated"
    echo "Run: clasp login"
    exit 1
fi

echo "✓ clasp is installed and authenticated"
echo ""

# Check if CSV file exists
if [ ! -f "$PRODUCTION_CSV" ]; then
    echo "❌ ERROR: Production CSV not found at $PRODUCTION_CSV"
    exit 1
fi

echo "✓ Production CSV found: $PRODUCTION_CSV"
echo ""

# Create output directory
mkdir -p "$OUTPUT_DIR"
echo "✓ Output directory: $OUTPUT_DIR"
echo ""

# Initialize counters
total_sheets=0
sheets_with_scripts=0
sheets_without_scripts=0
successful_snapshots=0
failed_snapshots=0

# Read CSV and count sheets
echo "Analyzing production sheets..."
while IFS=',' read -r sheet_name spreadsheet_id script_id; do
    # Skip header row
    if [[ "$sheet_name" == "Sheet Name" ]]; then
        continue
    fi

    ((total_sheets++))

    # Remove quotes
    script_id=$(echo "$script_id" | sed 's/"//g' | tr -d ' ')

    if [ -z "$script_id" ]; then
        ((sheets_without_scripts++))
    else
        ((sheets_with_scripts++))
    fi
done < "$PRODUCTION_CSV"

echo ""
echo "Sheet Analysis:"
echo "  Total sheets: $total_sheets"
echo "  With script IDs: $sheets_with_scripts"
echo "  Without script IDs: $sheets_without_scripts"
echo ""
echo "========================================"
echo "Starting Snapshot Process"
echo "========================================"
echo ""

# Process each sheet
sheet_index=0
while IFS=',' read -r sheet_name spreadsheet_id script_id; do
    # Skip header row
    if [[ "$sheet_name" == "Sheet Name" ]]; then
        continue
    fi

    # Remove quotes and whitespace
    sheet_name=$(echo "$sheet_name" | sed 's/"//g')
    spreadsheet_id=$(echo "$spreadsheet_id" | sed 's/"//g' | tr -d ' ')
    script_id=$(echo "$script_id" | sed 's/"//g' | tr -d ' ')

    # Check if sheet has script ID
    if [ -z "$script_id" ]; then
        echo "⚠️  Skipping [$sheet_index]: $sheet_name (no script ID)"
        continue
    fi

    # Create sanitized directory name (remove special characters)
    safe_name=$(echo "$sheet_name" | sed 's/[^a-zA-Z0-9-]/_/g' | cut -c1-80)
    sheet_dir="$OUTPUT_DIR/sheet-$(printf "%03d" $sheet_index)_PROD--${safe_name}"

    echo "[$sheet_index/$sheets_with_scripts] Snapshotting: $sheet_name"

    # Create directory structure
    mkdir -p "$sheet_dir/live"
    mkdir -p "$sheet_dir/metadata"

    # Create README for the sheet
    cat > "$sheet_dir/README.md" << EOF
# $sheet_name

**Type:** Production Google Sheet
**Environment:** Production
**Snapshot Date:** $(date)

## Identifiers

- **Spreadsheet ID:** $spreadsheet_id
- **Apps Script ID:** $script_id
- **Sheet Index:** $sheet_index

## Links

- [Open Spreadsheet](https://docs.google.com/spreadsheets/d/$spreadsheet_id)
- [Apps Script Editor](https://script.google.com/d/$script_id/edit)

## Snapshot Information

This directory contains a read-only snapshot of the Apps Script code attached to this Google Sheet. The snapshot is created using \`clasp pull\` which downloads code from Google Drive without modifying the source.

### Directory Structure

- \`live/\` - Current Apps Script code from Google Drive
- \`metadata/\` - Snapshot metadata (dates, IDs)
- \`README.md\` - This file

### Safety

All snapshots are READ-ONLY operations. The source code in Google Drive is never modified by the snapshot process. This provides:
- Version history
- Backup protection
- Change tracking
- Recovery capability

## Version Control

This sheet is part of the 6-layer backup protection strategy:
1. Google Drive (source of truth)
2. Local Git Repository (this snapshot)
3. GitHub Remote
4. Branch Protection Rules
5. Google Cloud Storage (planned)
6. Time Machine

---

**Last Updated:** $(date)
**Snapshot Script:** scripts/snapshot-production-initial.sh
EOF

    # Save metadata
    echo "$(date)" > "$sheet_dir/metadata/last-updated.txt"
    echo "$spreadsheet_id" > "$sheet_dir/metadata/spreadsheet-id.txt"
    echo "$script_id" > "$sheet_dir/metadata/script-id.txt"
    echo "$sheet_name" > "$sheet_dir/metadata/sheet-name.txt"

    # Pull code from Google Drive using .clasp.json
    echo "  Pulling code from Google Drive..."

    # Create .clasp.json with script ID
    cat > "$sheet_dir/.clasp.json" << EOF
{
  "scriptId": "$script_id"
}
EOF

    # Copy .clasp.json to live directory for clasp
    cp "$sheet_dir/.clasp.json" "$sheet_dir/live/.clasp.json"

    cd "$sheet_dir/live"

    if clasp pull 2>&1 | grep -q "Cloned\|file"; then
        echo "  ✓ Successfully pulled code"
        ((successful_snapshots++))

        # Count files pulled (exclude .clasp.json)
        file_count=$(($(ls -1 | wc -l) - 1))
        echo "  ✓ Files pulled: $file_count"

        # Remove temporary .clasp.json from live directory
        rm -f .clasp.json
    else
        echo "  ❌ Failed to pull code (may not have access or invalid script ID)"
        ((failed_snapshots++))

        # Create error marker
        echo "Failed to pull code on $(date)" > "../metadata/error.txt"
        echo "$script_id may be invalid or inaccessible" >> "../metadata/error.txt"

        # Remove temporary .clasp.json from live directory
        rm -f .clasp.json
    fi

    cd - > /dev/null
    echo ""

    ((sheet_index++))

    # Add small delay to avoid rate limiting
    sleep 0.5

done < "$PRODUCTION_CSV"

echo "========================================"
echo "Snapshot Summary"
echo "========================================"
echo ""
echo "Execution completed: $(date)"
echo ""
echo "Total sheets processed: $sheet_index"
echo "Successful snapshots: $successful_snapshots"
echo "Failed snapshots: $failed_snapshots"
echo "Skipped (no script ID): $sheets_without_scripts"
echo ""

if [ $failed_snapshots -gt 0 ]; then
    echo "⚠️  WARNING: Some snapshots failed"
    echo "Check the log file for details: $LOG_FILE"
    echo ""
    echo "Failed snapshots may be due to:"
    echo "  - Invalid script IDs"
    echo "  - Insufficient permissions"
    echo "  - Deleted Apps Script projects"
    echo ""
else
    echo "✓ All snapshots completed successfully!"
    echo ""
fi

echo "Next steps:"
echo "  1. Review failed snapshots (if any)"
echo "  2. Verify snapshot directories created"
echo "  3. Commit to GitHub"
echo ""
echo "Log file saved: $LOG_FILE"
echo ""
echo "========================================"

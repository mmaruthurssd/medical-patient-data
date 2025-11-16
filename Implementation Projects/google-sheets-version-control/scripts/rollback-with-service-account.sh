#!/bin/bash
set -e

# Rollback Script (Service Account Version)
#
# Emergency recovery - restores production to previous Git commit
# Uses service account authentication (never expires!)
#
# Usage:
#   ./scripts/rollback-with-service-account.sh <SHEET_DIRECTORY>
#
# Example:
#   ./scripts/rollback-with-service-account.sh sheet-042_PROD--Prior-Authorization-V3
#
# Note: This rolls back to the previous Git commit (not backup folder)

SHEET_DIR=$1

if [ -z "$SHEET_DIR" ]; then
  echo "❌ Usage: ./scripts/rollback-with-service-account.sh <SHEET_DIRECTORY>"
  echo ""
  echo "Example:"
  echo "  ./scripts/rollback-with-service-account.sh sheet-042_PROD--Prior-Authorization-V3"
  echo ""
  echo "To find your sheet directory:"
  echo "  ls production-sheets/ | grep PROD"
  exit 1
fi

PROD_DIR="production-sheets/$SHEET_DIR"

if [ ! -d "$PROD_DIR" ]; then
  echo "❌ Production sheet not found: $PROD_DIR"
  echo ""
  echo "Available sheets:"
  ls -1 production-sheets/ | grep PROD | head -10
  exit 1
fi

echo "⏪ Rolling back $SHEET_DIR to previous version"
echo ""

# Check if service account is configured
if [ -z "$GOOGLE_APPLICATION_CREDENTIALS" ]; then
  echo "⚠️  GOOGLE_APPLICATION_CREDENTIALS not set"
  echo ""
  echo "Setting it now from default location..."
  export GOOGLE_APPLICATION_CREDENTIALS="/Users/mmaruthurnew/Desktop/medical-patient-data/configuration/service-accounts/service-account.json"

  if [ ! -f "$GOOGLE_APPLICATION_CREDENTIALS" ]; then
    echo "❌ Service account file not found!"
    echo "   Expected: $GOOGLE_APPLICATION_CREDENTIALS"
    exit 1
  fi

  echo "✅ Service account configured"
fi

# Show current version
echo "📋 Current version (about to be replaced):"
git log --oneline "$PROD_DIR/live/" -n 1
echo ""

# Show previous version (rollback target)
echo "📦 Will rollback to:"
git log --oneline "$PROD_DIR/live/" -n 1 --skip=1
echo ""

# Show what changed
echo "Changes that will be reverted:"
git diff HEAD~1 HEAD -- "$PROD_DIR/live/" | head -30
echo ""
echo "(Showing first 30 lines of changes...)"
echo ""

read -p "Continue with rollback? [y/N] " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ Rollback cancelled"
  exit 1
fi

# Restore files from previous commit
echo "📋 Restoring files from previous commit..."
git checkout HEAD~1 -- "$PROD_DIR/live/"

echo "✅ Files restored in Git"
echo ""

# Get script ID
SCRIPT_ID=$(cat "$PROD_DIR/metadata/script-id.txt")

if [ -z "$SCRIPT_ID" ]; then
  echo "❌ Script ID not found in metadata!"
  echo "   Expected: $PROD_DIR/metadata/script-id.txt"
  exit 1
fi

echo "📤 Pushing restored code to production Apps Script..."
echo "   Script ID: $SCRIPT_ID"
echo "   Using: Service Account"
echo ""

# Push to production using service account
node scripts/pull-apps-script-with-service-account.js "$SCRIPT_ID" "$PROD_DIR/live/"

if [ $? -ne 0 ]; then
  echo ""
  echo "❌ Failed to push code to production!"
  echo ""
  echo "Restoring Git to previous state..."
  git checkout HEAD -- "$PROD_DIR/live/"
  echo "Git restored. Production unchanged."
  exit 1
fi

# Commit the rollback
echo ""
echo "💾 Committing rollback to Git..."
git add "$PROD_DIR/live/"
git commit -m "rollback($SHEET_DIR): emergency rollback to previous version

Rolled back at: $(date)
Rolled back by: $(git config user.name)
Reason: Emergency recovery
Method: Service account

🔐 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

echo "📤 Pushing to GitHub..."
git push

echo ""
echo "✅ Rollback complete!"
echo ""
echo "Next steps:"
echo "  1. 🔍 Verify sheet functionality in production"
echo "  2. 📋 Check Apps Script execution logs for errors"
echo "  3. 🧪 Test with real user scenario"
echo "  4. 📝 Document what caused the rollback"
echo ""
echo "Sheet URL: https://docs.google.com/spreadsheets/d/$(cat $PROD_DIR/metadata/spreadsheet-id.txt)"
echo "Script URL: https://script.google.com/d/$SCRIPT_ID/edit"
echo ""

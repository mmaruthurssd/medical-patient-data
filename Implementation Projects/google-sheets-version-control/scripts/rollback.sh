#!/bin/bash
set -e

# Rollback Script
#
# Emergency recovery - restores production to previous version
#
# Usage:
#   ./scripts/rollback.sh <SHEET_NAME>
#
# Example:
#   ./scripts/rollback.sh D25-264_Prior_Auth_V3

SHEET_NAME=$1

if [ -z "$SHEET_NAME" ]; then
  echo "❌ Usage: ./scripts/rollback.sh <SHEET_NAME>"
  exit 1
fi

PROD_DIR="production-sheets/$SHEET_NAME"

if [ ! -d "$PROD_DIR" ]; then
  echo "❌ Production sheet not found: $PROD_DIR"
  exit 1
fi

echo "⏪ Rolling back $SHEET_NAME to previous version"
echo ""

# Find latest backup
LATEST_BACKUP=$(ls -t "$PROD_DIR/backups/" 2>/dev/null | head -1)

if [ -z "$LATEST_BACKUP" ]; then
  echo "❌ No backups found!"
  exit 1
fi

echo "📦 Will restore from backup: $LATEST_BACKUP"
echo ""

# Show backup contents
echo "Backup contents:"
ls -lh "$PROD_DIR/backups/$LATEST_BACKUP/"
echo ""

read -p "Continue with rollback? [y/N] " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ Rollback cancelled"
  exit 1
fi

# Copy backup to live
echo "📋 Restoring backup to live folder..."
cp -r "$PROD_DIR/backups/$LATEST_BACKUP/"* "$PROD_DIR/live/"

# Push to production Apps Script
echo "📤 Pushing restored code to production Apps Script..."
cd "$PROD_DIR/live/"
clasp push --force

# Commit the rollback
cd - > /dev/null
git add "$PROD_DIR/live/"
git commit -m "rollback($SHEET_NAME): emergency rollback to backup $LATEST_BACKUP

Rolled back at: $(date)
Rolled back by: $(git config user.name)
Reason: Emergency recovery"

git push

echo ""
echo "✅ Rollback complete!"
echo "🔍 Verify sheet functionality"
echo "📋 Check execution logs for any errors"
echo ""

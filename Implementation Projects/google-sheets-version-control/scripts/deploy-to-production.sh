#!/bin/bash
set -e  # Exit on error

# Deploy to Production Script
#
# Safely deploys code from staging to production with backups and confirmation.
#
# Usage:
#   ./scripts/deploy-to-production.sh <SHEET_NAME>
#
# Example:
#   ./scripts/deploy-to-production.sh D25-264_Prior_Auth_V3

SHEET_NAME=$1

if [ -z "$SHEET_NAME" ]; then
  echo "❌ Usage: ./scripts/deploy-to-production.sh <SHEET_NAME>"
  echo "Example: ./scripts/deploy-to-production.sh D25-264_Prior_Auth_V3"
  exit 1
fi

PROD_DIR="production-sheets/$SHEET_NAME"
STAGING_DIR="staging-sheets/${SHEET_NAME}-DEV"

if [ ! -d "$PROD_DIR" ] || [ ! -d "$STAGING_DIR" ]; then
  echo "❌ Sheet not found. Check spelling and try again."
  echo "Production: $PROD_DIR $([ -d "$PROD_DIR" ] && echo '✓' || echo '✗')"
  echo "Staging: $STAGING_DIR $([ -d "$STAGING_DIR" ] && echo '✓' || echo '✗')"
  exit 1
fi

echo "🚀 Deploying $SHEET_NAME to production"
echo ""

# Step 1: Create backup
echo "📸 Creating pre-deployment backup..."
TIMESTAMP=$(date +%Y-%m-%d-%H-%M)
BACKUP_DIR="$PROD_DIR/backups/$TIMESTAMP"
mkdir -p "$BACKUP_DIR"
cp -r "$PROD_DIR/live/"* "$BACKUP_DIR/" 2>/dev/null || echo "No existing files to backup"

# Step 2: Show what will change
echo ""
echo "📋 Changes that will be deployed:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
git diff --no-index "$PROD_DIR/live/" "$STAGING_DIR/dev/" || true
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 3: Confirm deployment
echo "⚠️  This will deploy to PRODUCTION"
echo "📦 Backup created at: $BACKUP_DIR"
echo ""
read -p "Continue with deployment? [y/N] " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ Deployment cancelled"
  exit 1
fi

# Step 4: Deploy to production Apps Script
echo ""
echo "📤 Pushing code to production Apps Script..."
cd "$STAGING_DIR/dev/"

# Get production script ID from production .clasp.json
PROD_SCRIPT_ID=$(grep "scriptId" "../../../$PROD_DIR/.clasp.json" | cut -d'"' -f4)

if [ -z "$PROD_SCRIPT_ID" ]; then
  echo "❌ Could not find production script ID in $PROD_DIR/.clasp.json"
  exit 1
fi

echo "Production Script ID: $PROD_SCRIPT_ID"

# Temporarily point to production
mv .clasp.json .clasp.json.dev
echo "{\"scriptId\":\"$PROD_SCRIPT_ID\"}" > .clasp.json

# Push to production
clasp push --force

# Restore dev .clasp.json
mv .clasp.json.dev .clasp.json

# Step 5: Snapshot new production state
echo "📸 Snapshotting new production state..."
cd - > /dev/null
cd "$PROD_DIR/live/"
clasp pull

# Step 6: Update Git
cd - > /dev/null
git add "$PROD_DIR/"
git add "$STAGING_DIR/"
git commit -m "deploy($SHEET_NAME): deployed from staging to production

Backup: $BACKUP_DIR
Deployed at: $(date)
Deployed by: $(git config user.name)"

git push

echo ""
echo "✅ Deployment complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 Backup: $BACKUP_DIR"
echo "🔍 Monitor sheet for errors"
echo "⏪ Rollback: ./scripts/rollback.sh $SHEET_NAME"
echo ""

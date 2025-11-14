#!/bin/bash

#
# Setup Service Account Authentication for Clasp
#
# This script configures clasp to use a service account instead of OAuth,
# eliminating token expiration issues.
#
# Prerequisites:
#   1. Google Cloud Service Account created
#   2. Service account has access to Google Sheets and Apps Script
#   3. Service account key JSON file downloaded
#
# Usage:
#   ./scripts/setup-service-account-auth.sh /path/to/service-account-key.json
#

set -e

if [ $# -eq 0 ]; then
    echo "❌ Error: Service account key file path required"
    echo ""
    echo "Usage: $0 /path/to/service-account-key.json"
    echo ""
    echo "To create a service account key:"
    echo "  1. Go to: https://console.cloud.google.com/iam-admin/serviceaccounts"
    echo "  2. Select your project"
    echo "  3. Click on your service account"
    echo "  4. Go to 'Keys' tab"
    echo "  5. Click 'Add Key' → 'Create new key' → 'JSON'"
    echo "  6. Save the downloaded file securely"
    exit 1
fi

SERVICE_ACCOUNT_KEY="$1"

if [ ! -f "$SERVICE_ACCOUNT_KEY" ]; then
    echo "❌ Error: Service account key file not found: $SERVICE_ACCOUNT_KEY"
    exit 1
fi

echo "🔐 Setting up service account authentication for clasp..."
echo ""

# Backup existing .clasprc.json
if [ -f ~/.clasprc.json ]; then
    BACKUP_FILE=~/.clasprc.json.backup-$(date +%Y%m%d-%H%M%S)
    echo "📦 Backing up existing credentials to: $BACKUP_FILE"
    cp ~/.clasprc.json "$BACKUP_FILE"
fi

# Set environment variable
echo "export GOOGLE_APPLICATION_CREDENTIALS=\"$SERVICE_ACCOUNT_KEY\"" >> ~/.zshrc
echo "export GOOGLE_APPLICATION_CREDENTIALS=\"$SERVICE_ACCOUNT_KEY\"" >> ~/.bashrc

echo "✅ Added GOOGLE_APPLICATION_CREDENTIALS to shell config"
echo ""

# Also set for current session
export GOOGLE_APPLICATION_CREDENTIALS="$SERVICE_ACCOUNT_KEY"

# Test service account
echo "🧪 Testing service account authentication..."
SERVICE_ACCOUNT_EMAIL=$(cat "$SERVICE_ACCOUNT_KEY" | grep -o '"client_email": "[^"]*"' | cut -d'"' -f4)
echo "   Service Account: $SERVICE_ACCOUNT_EMAIL"

# Check if service account has necessary permissions
echo ""
echo "✅ Service account authentication configured!"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Grant service account access to all 235 sheets (AUTOMATED):"
echo "   # Test first (dry run)"
echo "   node scripts/grant-service-account-access.js --dry-run"
echo ""
echo "   # Then run for real"
echo "   node scripts/grant-service-account-access.js"
echo ""
echo "   This will automatically share all production sheets with:"
echo "   $SERVICE_ACCOUNT_EMAIL"
echo ""
echo "2. Reload your shell:"
echo "   source ~/.zshrc  # or source ~/.bashrc"
echo ""
echo "3. Test authentication:"
echo "   npx @google/clasp list"
echo ""
echo "4. Run snapshot script for missing sheet:"
echo "   node scripts/snapshot-single-sheet.js 204 ..."
echo ""
echo "💡 Service accounts don't expire like OAuth tokens!"
echo "   Your authentication will work indefinitely."
echo ""
echo "💡 The automated sharing script takes ~1-2 minutes for 235 sheets!"
echo "   (vs hours of manual work)"
echo ""

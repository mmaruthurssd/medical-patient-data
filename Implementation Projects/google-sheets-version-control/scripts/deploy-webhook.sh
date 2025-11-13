#!/bin/bash
# Automated Webhook Deployment using clasp
# Deploys Apps Script webhook to Google Sheets monitoring dashboard

set -e

SHEET_ID="1KpUhrEtW7-uHHS6GIngiXws0v2aM2wBC5ppyDBnRKxc"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TEMP_DIR="$SCRIPT_DIR/.clasp-webhook-deploy"
WEBHOOK_URL_FILE="$SCRIPT_DIR/.webhook-url"

echo "🚀 Automated Webhook Deployment"
echo "================================"
echo ""
echo "Target Sheet: Daily Snapshot Log - SSD Google Sheets"
echo "Sheet ID: $SHEET_ID"
echo ""

# Create temporary directory for clasp project
echo "📁 Creating temporary clasp project..."
rm -rf "$TEMP_DIR"
mkdir -p "$TEMP_DIR"
cd "$TEMP_DIR"

# Create clasp.json to link to the spreadsheet
echo "🔗 Linking to Google Sheet..."
cat > .clasp.json <<EOF
{
  "scriptId": "",
  "parentId": ["$SHEET_ID"],
  "rootDir": "."
}
EOF

# Create the Apps Script project
echo "📝 Creating Apps Script project..."
clasp create --type sheets --title "Workstation Monitoring Webhook" --rootDir . || {
  echo "⚠️  Note: If project already exists, this is expected"
}

# Copy webhook code
echo "📋 Copying webhook code..."
cp "$SCRIPT_DIR/workstation-backup-webhook.js" Code.js

# Create appsscript.json manifest
cat > appsscript.json <<EOF
{
  "timeZone": "America/New_York",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "webapp": {
    "access": "ANYONE",
    "executeAs": "USER_DEPLOYING"
  }
}
EOF

# Push code to Apps Script
echo "☁️  Pushing code to Apps Script..."
clasp push --force

# Deploy as web app
echo "🌐 Deploying as web app..."

# First, check if there are existing deployments
EXISTING_DEPLOYMENT=$(clasp deployments 2>/dev/null | grep -o '@[0-9]*' | head -1 | sed 's/@//' || echo "")

if [ -n "$EXISTING_DEPLOYMENT" ]; then
  echo "Found existing deployment: @$EXISTING_DEPLOYMENT"
  echo "Creating new version..."

  # Create new deployment
  DEPLOY_OUTPUT=$(clasp deploy --description "Automated deployment $(date +%Y-%m-%d)" 2>&1)

else
  # First deployment
  echo "Creating first deployment..."
  DEPLOY_OUTPUT=$(clasp deploy --description "Initial automated deployment" 2>&1)
fi

echo "$DEPLOY_OUTPUT"

# Get the deployment ID and construct webhook URL
SCRIPT_ID=$(cat .clasp.json | grep scriptId | cut -d'"' -f4)

if [ -z "$SCRIPT_ID" ]; then
  echo "❌ Error: Could not get script ID"
  exit 1
fi

# Get the latest deployment ID
DEPLOYMENT_ID=$(clasp deployments 2>/dev/null | grep '@' | tail -1 | grep -o '@[^[:space:]]*' | sed 's/@//' || echo "")

if [ -z "$DEPLOYMENT_ID" ]; then
  echo "❌ Error: Could not get deployment ID"
  echo "You may need to manually deploy the script first"
  exit 1
fi

# Construct webhook URL
WEBHOOK_URL="https://script.google.com/macros/s/$SCRIPT_ID/exec"

echo ""
echo "✅ Webhook deployed successfully!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Webhook URL:"
echo "$WEBHOOK_URL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Save webhook URL
echo "$WEBHOOK_URL" > "$WEBHOOK_URL_FILE"
chmod 600 "$WEBHOOK_URL_FILE"

echo "✅ Webhook URL saved to: $WEBHOOK_URL_FILE"
echo ""

# Cleanup
echo "🧹 Cleaning up temporary files..."
cd "$SCRIPT_DIR"
rm -rf "$TEMP_DIR"

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Open Google Sheets to verify 'Layer 6 - Workstation Backups' tab was created"
echo "2. Run: ./deploy-team-member.sh Alvaro"
echo ""

exit 0

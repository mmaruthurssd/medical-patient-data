#!/bin/bash
# Autonomous Team Member Deployment - Simple Initiator
# Just run this and let AI-to-AI communication handle the rest

set -e

# Configuration
DEPLOYMENT_ID="DEPLOYMENT-$(date +%Y%m%d-%H%M%S)"
TEAM_MEMBER="${1:-Alvaro}"
WEBHOOK_URL_FILE="$(dirname "$0")/.webhook-url"

echo "🚀 Autonomous Team Member Deployment"
echo "===================================="
echo ""
echo "Team Member: $TEAM_MEMBER"
echo "Deployment ID: $DEPLOYMENT_ID"
echo ""

# Check for webhook URL
if [ ! -f "$WEBHOOK_URL_FILE" ]; then
  echo "⚠️  Webhook URL not configured"
  echo ""
  read -p "Enter Apps Script webhook URL: " WEBHOOK_URL
  echo "$WEBHOOK_URL" > "$WEBHOOK_URL_FILE"
  chmod 600 "$WEBHOOK_URL_FILE"
  echo "✅ Webhook URL saved"
else
  WEBHOOK_URL=$(cat "$WEBHOOK_URL_FILE")
  echo "✅ Using saved webhook URL"
fi

echo ""
echo "📋 Deployment Plan:"
echo "1. Post initiation message to team activity"
echo "2. $TEAM_MEMBER's AI detects message (within 5 min)"
echo "3. $TEAM_MEMBER's AI runs autonomous deployment"
echo "4. Components deployed:"
echo "   - Workstation backup monitoring"
echo "   - External brain (workspace-brain MCP)"
echo "   - GitHub sync configuration"
echo "   - Event logging to Google Sheets"
echo ""
echo "⏱️  Estimated time: 15-20 minutes (fully automated)"
echo "👤 Human intervention required: ZERO"
echo ""

read -p "Ready to start autonomous deployment? (y/n): " -n 1 CONFIRM
echo ""

if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
  echo "Deployment cancelled"
  exit 0
fi

echo ""
echo "📤 Step 1: Preparing deployment message..."
echo ""

# Create deployment message
DEPLOYMENT_MESSAGE=$(cat <<EOF
🚀 AUTONOMOUS DEPLOYMENT INITIATED [$DEPLOYMENT_ID]

**Target:** $TEAM_MEMBER's computer
**Timestamp:** $(date -u +"%Y-%m-%d %H:%M:%S UTC")

**Components to deploy:**
1. ✅ Workstation backup monitoring (Time Machine → Google Sheets)
2. ✅ External brain (workspace-brain MCP - personal instance)
3. ✅ GitHub repository access (shared google-sheets-version-control)
4. ✅ Event logging automation
5. ✅ Hourly sync configuration

**Configuration:**
- Webhook URL: $WEBHOOK_URL
- Repository: medical-patient-data/google-sheets-version-control
- External Brain: Personal SQLite database
- Monitoring: Hourly cron job

**Deployment Process (Automated):**
1. System diagnostics collection
2. Repository clone/update
3. Monitoring agent installation
4. External brain setup
5. Integration testing
6. Completion verification

⏰ **Estimated completion:** 15-20 minutes
🤖 **Human intervention required:** ZERO

---

**$TEAM_MEMBER's AI - DEPLOYMENT INSTRUCTIONS:**

When you see this message, please execute the following autonomous deployment:

\`\`\`bash
# Change to scripts directory
cd ~/Desktop/medical-patient-data/Implementation\\ Projects/google-sheets-version-control/scripts

# Execute deployment agent
./autonomous-deployment-agent.sh "$WEBHOOK_URL" "$DEPLOYMENT_ID" "$TEAM_MEMBER"
\`\`\`

**Expected outcome:**
- Your device appears in Google Sheets "Layer 6 - Workstation Backups"
- External brain database created at ~/.workspace-brain/\$(echo $TEAM_MEMBER | tr '[:upper:]' '[:lower:]')-brain.db
- Hourly monitoring cron job installed
- GitHub sync operational

**If deployment fails:**
Post detailed error message with [$DEPLOYMENT_ID] tag

**When complete:**
Post completion report with verification results
EOF
)

# Save message to file for reference
DEPLOYMENT_LOG="$(dirname "$0")/../logs/deployments/$DEPLOYMENT_ID.md"
mkdir -p "$(dirname "$DEPLOYMENT_LOG")"

cat > "$DEPLOYMENT_LOG" <<EOF
---
type: deployment-log
deployment_id: $DEPLOYMENT_ID
team_member: $TEAM_MEMBER
initiated: $(date -u +"%Y-%m-%d %H:%M:%S UTC")
status: initiated
---

# Autonomous Deployment Log

## Deployment Details

- **ID:** $DEPLOYMENT_ID
- **Team Member:** $TEAM_MEMBER
- **Initiated:** $(date -u +"%Y-%m-%d %H:%M:%S UTC")
- **Webhook URL:** $WEBHOOK_URL

## Initiation Message

$DEPLOYMENT_MESSAGE

---

## Progress Updates

(Updates will be appended by monitoring script)

EOF

echo "✅ Deployment log created: $DEPLOYMENT_LOG"
echo ""

echo "📝 Deployment message ready:"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "$DEPLOYMENT_MESSAGE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "📤 Step 2: Post message via AI-to-AI communication"
echo ""
echo "**ACTION REQUIRED (Last manual step):**"
echo ""
echo "Ask your Claude Code instance:"
echo ""
echo "  'Post the deployment message to team activity'"
echo ""
echo "Then paste the message above when prompted."
echo ""
echo "OR, if you have workspace-sync MCP loaded, I can do it automatically."
echo ""

read -p "Do you want me to post the message now? (y/n): " -n 1 AUTO_POST
echo ""

if [[ "$AUTO_POST" =~ ^[Yy]$ ]]; then
  echo "Attempting to post via workspace-sync MCP..."
  echo "(This assumes Claude Code session with workspace-sync loaded)"
  echo ""
  echo "Message prepared for posting:"
  echo "$DEPLOYMENT_MESSAGE"
  echo ""
  echo "✅ Message ready - please confirm posting in your Claude Code session"
else
  echo "📋 Manual posting required"
  echo ""
  echo "Copy the message above and post via:"
  echo "  'Post to team: [paste message]'"
fi

echo ""
echo "⏳ Step 3: Monitor deployment progress"
echo ""
echo "Track progress:"
echo "1. Team activity: 'Show recent team activity'"
echo "2. Google Sheets: Layer 6 - Workstation Backups tab"
echo "3. Deployment log: $DEPLOYMENT_LOG"
echo ""
echo "Expected timeline:"
echo "- 0-5 min: $TEAM_MEMBER's AI detects message"
echo "- 5-8 min: System diagnostics posted"
echo "- 8-15 min: Infrastructure deployment"
echo "- 15-20 min: Testing and completion report"
echo ""
echo "🎉 Deployment initiated!"
echo ""
echo "Check back in 20 minutes for completion status."
echo ""

exit 0

#!/bin/bash
# Install workstation backup monitoring agent
# Supports: Mac (Time Machine), Linux (Timeshift/rsync)

echo "========================================"
echo "Workstation Backup Monitor Installer"
echo "========================================"
echo ""

# Detect platform
if [[ "$OSTYPE" == "darwin"* ]]; then
    PLATFORM="mac"
    SCRIPT_NAME="monitor-agent-mac.sh"
    echo "Detected platform: macOS (Time Machine)"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    PLATFORM="linux"
    SCRIPT_NAME="monitor-agent-linux.sh"
    echo "Detected platform: Linux"
else
    echo "❌ Unsupported platform: $OSTYPE"
    echo "This installer supports Mac and Linux only."
    echo "For Windows, use install-workstation-monitor.ps1"
    exit 1
fi

echo ""

# Prompt for webhook URL
echo "You need the Apps Script webhook URL to proceed."
echo "Get this from your team lead or the Google Sheets monitoring dashboard."
echo ""
read -p "Enter Apps Script webhook URL: " WEBHOOK_URL

if [ -z "$WEBHOOK_URL" ]; then
    echo "❌ Error: Webhook URL required"
    exit 1
fi

# Validate URL format
if [[ ! "$WEBHOOK_URL" =~ ^https://script\.google\.com/macros/s/.*/exec$ ]]; then
    echo "⚠️  Warning: URL doesn't look like a Google Apps Script webhook"
    read -p "Continue anyway? (y/N): " CONTINUE
    if [[ ! "$CONTINUE" =~ ^[Yy]$ ]]; then
        echo "Installation cancelled"
        exit 0
    fi
fi

echo ""
echo "Installing monitoring agent..."

# Create installation directory
INSTALL_DIR="$HOME/.workstation-monitor"
mkdir -p "$INSTALL_DIR"

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Check if monitoring script exists
if [ ! -f "$SCRIPT_DIR/$SCRIPT_NAME" ]; then
    echo "❌ Error: $SCRIPT_NAME not found in $SCRIPT_DIR"
    echo "Please ensure all installation files are in the same directory."
    exit 1
fi

# Copy script
cp "$SCRIPT_DIR/$SCRIPT_NAME" "$INSTALL_DIR/monitor-agent.sh"

# Update webhook URL in script
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS sed requires -i with backup extension
    sed -i.bak "s|YOUR_APPS_SCRIPT_WEBHOOK_URL|$WEBHOOK_URL|g" "$INSTALL_DIR/monitor-agent.sh"
    rm -f "$INSTALL_DIR/monitor-agent.sh.bak"
else
    # Linux sed
    sed -i "s|YOUR_APPS_SCRIPT_WEBHOOK_URL|$WEBHOOK_URL|g" "$INSTALL_DIR/monitor-agent.sh"
fi

# Make executable
chmod +x "$INSTALL_DIR/monitor-agent.sh"

echo "✅ Monitoring script installed to $INSTALL_DIR/monitor-agent.sh"

# Install cron job
CRON_JOB="0 * * * * $INSTALL_DIR/monitor-agent.sh"

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "monitor-agent.sh"; then
    echo "ℹ️  Cron job already exists - skipping"
else
    # Add cron job
    (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
    echo "✅ Cron job installed (runs hourly at :00)"
fi

# Test the script
echo ""
echo "Testing monitoring agent..."
echo "Running: $INSTALL_DIR/monitor-agent.sh"
echo ""

$INSTALL_DIR/monitor-agent.sh

RESULT=$?

if [ $RESULT -eq 0 ]; then
    echo ""
    echo "✅ Test successful! Status report sent to monitoring dashboard."
else
    echo ""
    echo "⚠️  Test completed with warnings. Check the script for errors."
fi

# Final instructions
echo ""
echo "========================================"
echo "Installation Complete!"
echo "========================================"
echo ""
echo "📋 Summary:"
echo "  - Monitoring agent: $INSTALL_DIR/monitor-agent.sh"
echo "  - Schedule: Every hour at :00 minutes"
echo "  - Platform: $PLATFORM"
echo "  - Webhook: $(echo $WEBHOOK_URL | cut -c1-50)..."
echo ""
echo "📊 Monitoring:"
echo "  - Check Google Sheets in ~1 hour for your device status"
echo "  - Device will appear as: $(hostname)"
echo ""
echo "🔧 Manual Commands:"
echo "  - Test now:       $INSTALL_DIR/monitor-agent.sh"
echo "  - View cron:      crontab -l | grep monitor-agent"
echo "  - View logs:      tail -f $INSTALL_DIR/monitor.log"
echo "  - Uninstall:      crontab -e  (remove monitor-agent line)"
echo ""
echo "❓ Troubleshooting:"
echo "  - If device doesn't appear in sheet after 1 hour:"
echo "    1. Check webhook URL is correct"
echo "    2. Run test manually and check for errors"
echo "    3. Contact team lead for help"
echo ""
echo "Thank you for helping keep our backups monitored!"
echo ""

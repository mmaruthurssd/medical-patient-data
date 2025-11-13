---
type: guide
tags: [backup-monitoring, quick-start, implementation, workstation-monitoring]
---

# Multi-Workstation Monitoring - Quick Start Guide

**Time to Complete:** 20-30 minutes
**Prerequisites:** Access to Google Sheets monitoring dashboard
**Difficulty:** Easy

---

## Overview

This guide will help you deploy multi-workstation backup monitoring across your team in 3 simple phases:

1. **Deploy Apps Script Webhook** (5 min) - Set up central endpoint
2. **Install on Your Computer** (5 min) - Test with your workstation
3. **Roll Out to Team** (10 min) - Distribute to team members

---

## Phase 1: Deploy Apps Script Webhook (5 minutes)

### Step 1.1: Open Apps Script Editor

1. Open your monitoring Google Sheet:
   [Daily Snapshot Log - SSD Google Sheets](https://docs.google.com/spreadsheets/d/1KpUhrEtW7-uHHS6GIngiXws0v2aM2wBC5ppyDBnRKxc)

2. Click **Extensions** → **Apps Script**

### Step 1.2: Add Webhook Code

1. In Apps Script editor, click **+ (Create new file)**
2. Name it: `workstation-webhook`
3. Copy contents from: `scripts/workstation-backup-webhook.js`
4. Paste into the new file
5. Click **Save** (💾 icon)

### Step 1.3: Run Setup Function

1. In the dropdown at top (says "function"), select `setupWorkstationMonitoring`
2. Click **Run** (▶️ icon)
3. **First time:** You'll need to authorize the script
   - Click "Review permissions"
   - Choose your Google account
   - Click "Advanced" → "Go to ... (unsafe)"
   - Click "Allow"
4. Wait for execution to complete
5. Check your Google Sheet - new tab "Layer 6 - Workstation Backups" should appear

### Step 1.4: Deploy as Web App

1. Click **Deploy** → **New deployment**
2. Click gear icon (⚙️) → Select **Web app**
3. Configure:
   - **Description:** Workstation Backup Monitoring Webhook
   - **Execute as:** Me (your email)
   - **Who has access:** Anyone
4. Click **Deploy**
5. **IMPORTANT:** Copy the **Web app URL** (starts with `https://script.google.com/macros/s/...`)
6. Save this URL - you'll need it for installation

**✅ Phase 1 Complete:** You now have a webhook endpoint

---

## Phase 2: Install on Your Computer (5 minutes)

### For Mac Users

1. **Download installation files:**
   ```bash
   cd ~/Downloads
   # Copy these files from the project:
   # - install-workstation-monitor.sh
   # - monitor-agent-mac.sh
   ```

2. **Run installer:**
   ```bash
   chmod +x install-workstation-monitor.sh
   ./install-workstation-monitor.sh
   ```

3. **Enter webhook URL when prompted:**
   - Paste the URL you copied in Phase 1.4

4. **Verify installation:**
   - Script will run a test immediately
   - Check Google Sheets → "Layer 6 - Workstation Backups" tab
   - Your device should appear within a few seconds

### For Windows Users

1. **Download installation files:**
   - `install-workstation-monitor.ps1`
   - `monitor-agent-windows.ps1`

2. **Run installer (as Administrator):**
   - Right-click PowerShell → "Run as Administrator"
   ```powershell
   cd Downloads
   PowerShell -ExecutionPolicy Bypass -File install-workstation-monitor.ps1
   ```

3. **Enter webhook URL when prompted**

4. **Verify installation:**
   - Check Task Scheduler for "WorkstationBackupMonitor" task
   - Check Google Sheets for your device

### For Linux Users

Same as Mac installation (uses bash script).

**✅ Phase 2 Complete:** Your workstation is now monitored

---

## Phase 3: Roll Out to Team (10 minutes)

### Step 3.1: Create Installation Package

Create a shared folder (Google Drive, Dropbox, or network share) with:

```
workstation-monitoring/
├── README.txt
├── WEBHOOK_URL.txt (contains the webhook URL)
├── Mac-Linux/
│   ├── install-workstation-monitor.sh
│   └── monitor-agent-mac.sh (or monitor-agent-linux.sh)
└── Windows/
    ├── install-workstation-monitor.ps1
    └── monitor-agent-windows.ps1
```

### Step 3.2: Create README for Team

**File: `README.txt`**

```
WORKSTATION BACKUP MONITORING - INSTALLATION GUIDE
===================================================

This will install a monitoring agent that reports your local backup status
to our central monitoring dashboard every hour.

BEFORE YOU START:
- Ensure your backup system is configured (Time Machine on Mac, File History on Windows)
- You'll need the webhook URL (see WEBHOOK_URL.txt)
- Installation takes 5 minutes

FOR MAC/LINUX USERS:
1. Copy both files from Mac-Linux/ folder to your Downloads
2. Open Terminal
3. Run: cd ~/Downloads
4. Run: chmod +x install-workstation-monitor.sh
5. Run: ./install-workstation-monitor.sh
6. Enter webhook URL when prompted
7. Done! Check Google Sheets in 1 hour

FOR WINDOWS USERS:
1. Copy both files from Windows/ folder to your Downloads
2. Right-click PowerShell → "Run as Administrator"
3. Run: cd Downloads
4. Run: PowerShell -ExecutionPolicy Bypass -File install-workstation-monitor.ps1
5. Enter webhook URL when prompted
6. Done! Check Google Sheets in 1 hour

VERIFICATION:
- Your device should appear in the "Layer 6 - Workstation Backups" tab
- Status should show ✅ ACTIVE if backup is recent (<24 hours)

TROUBLESHOOTING:
- Mac: Check cron with: crontab -l | grep monitor-agent
- Windows: Check Task Scheduler for "WorkstationBackupMonitor"
- Contact [YOUR NAME] if you need help

MONITORING DASHBOARD:
https://docs.google.com/spreadsheets/d/1KpUhrEtW7-uHHS6GIngiXws0v2aM2wBC5ppyDBnRKxc
```

### Step 3.3: Distribute to Team

**Option A: Email**
```
Subject: Action Required: Install Workstation Backup Monitoring (5 min)

Team,

We're implementing automated monitoring for local backups across all developer
workstations. This ensures everyone's Time Machine/File History is working properly.

WHAT YOU NEED TO DO:
1. Download installation package: [LINK TO SHARED FOLDER]
2. Follow README.txt instructions (5 minutes)
3. Your device will appear in the monitoring dashboard within 1 hour

WHY THIS MATTERS:
- Early detection of backup failures
- Better team-wide data protection
- Automated monitoring (no manual reports needed)

MONITORING DASHBOARD:
[LINK TO GOOGLE SHEET]

Questions? Reply to this email or ping me on Slack.

Thanks!
[YOUR NAME]
```

**Option B: Slack/Teams**
```
📊 New: Workstation Backup Monitoring

We're rolling out automated backup monitoring for all developer workstations.

✅ What it does:
- Checks your local backup (Time Machine/File History) every hour
- Reports status to central dashboard
- Alerts if backup is stale or failing

⏱️ Time required: 5 minutes

📦 Installation package: [LINK]

📊 Dashboard: [GOOGLE SHEET LINK]

Need help? DM me!
```

### Step 3.4: Track Rollout

Create a checklist in your Google Sheet or project management tool:

| Team Member | Computer | Platform | Installed? | Status | Notes |
|-------------|----------|----------|------------|--------|-------|
| Mark | Mark's Mac | Mac | ✅ | Active | - |
| Alvaro | Alvaro-PC | Windows | ⏳ Pending | - | Sent install link |
| ... | ... | ... | ... | ... | ... |

**✅ Phase 3 Complete:** Team monitoring deployed

---

## Verification Checklist

After 1 hour, verify:

- [ ] Your device appears in "Layer 6 - Workstation Backups" tab
- [ ] Status shows ✅ ACTIVE (if backup is recent)
- [ ] Last Check timestamp is recent (<2 hours)
- [ ] "📊 Backup Overview" tab shows updated Layer 6 status
- [ ] All team members' devices appearing (within 24 hours of installation)

---

## Monitoring Dashboard

### What You'll See

**Layer 6 - Workstation Backups Tab:**

| Device ID | User | Platform | Backup Type | Status | Last Backup | Destination | Message | Last Check |
|-----------|------|----------|-------------|--------|-------------|-------------|---------|------------|
| Marks-Mac | mark | Mac | Time Machine | ✅ ACTIVE | 2025-11-13 10:00 | My Passport | Backup 2 hours old | 2025-11-13 12:00 |
| Alvaro-PC | alvaro | Windows | File History | ✅ ACTIVE | 2025-11-13 09:30 | External HDD | Backup 2.5 hours old | 2025-11-13 12:00 |

**Backup Overview Tab:**

Layer 6 row will show:
- **Status:** ✅ ACTIVE (if all devices healthy)
- **Notes:** "2/2 workstations healthy" (or "1/2 workstations healthy" if one has issues)

### Status Indicators

- **✅ ACTIVE** - Backup <24 hours old, everything working
- **⚠️ STALE** - Backup >24 hours old, needs attention
- **⚠️ WARNING** - Backup system detected but issues found
- **❌ ERROR** - No backup system configured or errors

### Row Colors

- **Green** (✅ ACTIVE) - Healthy backup
- **Yellow** (⚠️ WARNING/STALE) - Needs attention
- **Red** (❌ ERROR) - Critical issue

---

## Troubleshooting

### Device Not Appearing in Sheet

**Check 1: Webhook URL**
```bash
# Mac/Linux
cat ~/.workstation-monitor/monitor-agent.sh | grep WEBHOOK_URL

# Windows (PowerShell)
Get-Content "$env:USERPROFILE\.workstation-monitor\monitor-agent.ps1" | Select-String "WebhookUrl"
```

**Check 2: Run manually**
```bash
# Mac/Linux
~/.workstation-monitor/monitor-agent.sh

# Windows (PowerShell)
& "$env:USERPROFILE\.workstation-monitor\monitor-agent.ps1"
```

**Check 3: Verify cron/scheduled task**
```bash
# Mac/Linux
crontab -l | grep monitor-agent

# Windows
Get-ScheduledTask -TaskName "WorkstationBackupMonitor"
```

### Status Shows Error

1. **Check if backup system is configured:**
   - Mac: System Settings → Time Machine
   - Windows: Settings → Update & Security → Backup

2. **Check backup permissions:**
   - Linux may require sudo for Timeshift
   - Mac: Ensure Terminal has Full Disk Access

3. **Review error message in "Message" column**

### Updates Not Coming Through

1. **Verify script is running hourly:**
   - Check "Last Check" timestamp in sheet
   - Should update every hour

2. **Check Apps Script quotas:**
   - Apps Script editor → Executions
   - Look for errors in execution log

3. **Test webhook manually:**
   - Run `testWorkstationWebhook()` in Apps Script editor

---

## Maintenance

### Daily (Automated)
- Scripts run hourly on each workstation
- No action required

### Weekly
- Review Layer 6 tab for warnings/errors
- Follow up with team members showing stale backups

### Monthly
- Audit active devices
- Remove decommissioned devices
- Update documentation if needed

---

## Cost

**Total Cost:** $0/month

- Google Sheets: Free
- Apps Script: Free (within quotas)
- Bandwidth: Negligible (~1 KB/hour/device)

---

## Security & Privacy

- ✅ No sensitive data transmitted (only backup metadata)
- ✅ No file contents accessed
- ✅ Webhook URL is obscure and hard to guess
- ✅ Google Sheets access controlled by permissions
- ✅ Each workstation only reports own status

---

## Next Steps

After successful deployment:

1. **Week 1:** Monitor daily, ensure all devices reporting
2. **Week 2:** Set up alerts for stale backups
3. **Month 1:** Review patterns, adjust monitoring frequency if needed
4. **Quarter 1:** Evaluate effectiveness, gather team feedback

---

## Support

**Questions or issues?**
1. Check this guide
2. Review [MULTI-WORKSTATION-MONITORING.md](./MULTI-WORKSTATION-MONITORING.md) (detailed documentation)
3. Check Apps Script execution logs
4. Contact team lead

---

## Files Reference

**Documentation:**
- This file: `docs/MULTI-WORKSTATION-QUICK-START.md`
- Detailed guide: `docs/MULTI-WORKSTATION-MONITORING.md`
- Main project: `PROJECT-OVERVIEW.md`

**Scripts:**
- Mac agent: `scripts/monitor-agent-mac.sh`
- Windows agent: `scripts/monitor-agent-windows.ps1`
- Linux agent: `scripts/monitor-agent-linux.sh`
- Mac/Linux installer: `scripts/install-workstation-monitor.sh`
- Windows installer: `scripts/install-workstation-monitor.ps1`
- Apps Script webhook: `scripts/workstation-backup-webhook.js`

**Google Sheets:**
- [Daily Snapshot Log - SSD Google Sheets](https://docs.google.com/spreadsheets/d/1KpUhrEtW7-uHHS6GIngiXws0v2aM2wBC5ppyDBnRKxc)

---

**Last Updated:** 2025-11-13
**Status:** Ready for Deployment
**Estimated Total Time:** 20-30 minutes for full team rollout

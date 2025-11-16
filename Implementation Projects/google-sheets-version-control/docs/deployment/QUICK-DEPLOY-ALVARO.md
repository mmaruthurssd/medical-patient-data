---
type: quick-reference
tags: [quick-start, autonomous-deployment, one-command]
---

# Deploy to Alvaro's Computer - Quick Reference

**🎯 Goal:** Get Alvaro's Mac fully monitored with zero manual work

**⏱️ Time:** 1 command + 20 minutes wait

**👤 Human effort:** < 5 minutes total

---

## Step 1: Run This Command (2 min)

```bash
cd ~/Desktop/medical-patient-data/Implementation\ Projects/google-sheets-version-control/scripts
./deploy-team-member.sh Alvaro
```

**What it does:**
- Asks for webhook URL (first time only)
- Posts deployment message via AI-to-AI communication
- Starts autonomous deployment on Alvaro's computer

---

## Step 2: Wait (20 min)

**What's happening (all automatic):**

```
T+0:  You run deploy script
T+5:  Alvaro's AI sees deployment message
T+5:  Alvaro's AI collects diagnostics
T+10: Alvaro's AI installs monitoring agent
T+15: Alvaro's AI sets up external brain
T+18: Alvaro's AI runs tests
T+20: Completion report posted ✅
```

**You do:** Nothing. Go get coffee. ☕

**Alvaro does:** Nothing. His AI handles everything.

---

## Step 3: Verify (1 min)

**Check Google Sheets:**

Open: [Daily Snapshot Log - SSD Google Sheets](https://docs.google.com/spreadsheets/d/1KpUhrEtW7-uHHS6GIngiXws0v2aM2wBC5ppyDBnRKxc)

Go to: **"Layer 6 - Workstation Backups"** tab

**Expected:**
```
┌──────────────┬────────┬──────────┬────────────┬───────────────┐
│ Device       │ User   │ Platform │ Status     │ Last Backup   │
├──────────────┼────────┼──────────┼────────────┼───────────────┤
│ Marks-Mac    │ mark   │ Mac      │ ✅ ACTIVE  │ 2h ago        │
│ Alvaros-Mac  │ alvaro │ Mac      │ ✅ ACTIVE  │ 3h ago        │
└──────────────┴────────┴──────────┴────────────┴───────────────┘
```

**Overview tab should show:** "2/2 workstations healthy" ✅

---

## That's It! 🎉

**What got deployed automatically:**
- ✅ Workstation monitoring (Time Machine → Google Sheets)
- ✅ External brain (workspace-brain MCP - personal database)
- ✅ GitHub sync (shared repository)
- ✅ Event logging automation
- ✅ Hourly cron job

**What Alvaro had to do:** NOTHING ✨

**What you had to do:** Run 1 command

---

## Troubleshooting

### "Deployment timeout - no response from Alvaro's AI"

**Check:**
```bash
# On Alvaro's Mac
cd ~/Desktop/operations-workspace
./scripts/sync/daemon-control.sh status
```

**Should say:** "Daemon is running (PID: xxxxx)"

**If not running:**
```bash
./scripts/sync/daemon-control.sh start
```

Then retry deployment.

---

### "Device not appearing in Google Sheets"

**Wait:** Up to 1 hour for first report (cron runs hourly at :00)

**Force test now:**
```bash
# On Alvaro's Mac
~/.workstation-monitor/monitor-agent.sh
```

**Check Google Sheets again** (should appear within seconds)

---

## Advanced: Manual Verification

If you want to verify on Alvaro's computer:

```bash
# Check monitoring agent installed
ls -la ~/.workstation-monitor/monitor-agent.sh

# Check cron job
crontab -l | grep monitor-agent

# Check external brain
ls -la ~/.workspace-brain/alvaro-brain.db

# Check git deployment marker
cd ~/Desktop/medical-patient-data/Implementation\ Projects/google-sheets-version-control
ls -la .deployment-markers/
```

---

## Repository Strategy

**Both you and Alvaro commit to the SAME repository:**

```
Repository: medical-patient-data
Path: Implementation Projects/google-sheets-version-control/

Shared:
  ✅ Google Sheets snapshots
  ✅ Monitoring dashboard
  ✅ Apps Script webhook
  ✅ Event logs
  ✅ GitHub sync

Personal:
  ❌ External brain database (~/.workspace-brain/alvaro-brain.db)
  ❌ workspace-brain MCP (independent instance)
  ❌ Cron jobs (local to each machine)
```

**Why shared repo?**
- Same 204 production Google Sheets
- Unified monitoring dashboard
- Aggregated event logs
- Simpler coordination

---

## Next Team Member?

**To add another team member (e.g., "Maria"):**

```bash
./deploy-team-member.sh Maria
```

**That's it.** Same 20-minute autonomous deployment.

**Scales to unlimited team members with same effort.**

---

## Questions?

**Read full guides:**
- `AUTONOMOUS-DEPLOYMENT-SUMMARY.md` - Complete explanation
- `docs/AUTONOMOUS-TEAM-DEPLOYMENT.md` - Technical details (11,000 words)
- `docs/MULTI-WORKSTATION-MONITORING.md` - Architecture guide

**Or just ask your Claude Code:**
```
Explain the autonomous deployment system
```

---

**Last Updated:** 2025-11-13

**One command. Zero manual work. Full team monitoring. ✨**

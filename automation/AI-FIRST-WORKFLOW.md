---
type: guide
tags: [automation, ai-first, workflow, scheduled-prompts]
---

# AI-First Automated Prompting Workflow

**The correct way to use the Claude Automation System**

---

## 🎯 Core Principle: AI-First, No Manual Work

**YOU NEVER TOUCH THE GOOGLE SHEET MANUALLY**

Instead:
1. **You tell Claude** what prompt you want scheduled
2. **Claude adds it** to the Google Sheet programmatically
3. **System executes** automatically on schedule
4. **You view results** in the sheet (read-only for you)

---

## ✅ The Workflow

### Step 1: Tell Claude What You Want

**Example conversation:**

> **You**: "I need a daily prompt that generates a summary of yesterday's biopsy cases. Run it every morning at 9 AM."

> **Claude**: "I'll add that scheduled prompt for you now."

### Step 2: Claude Adds It to the Sheet

Claude runs:
```bash
node add-scheduled-prompt.js \
  --name "Daily Biopsy Summary" \
  --prompt "Generate summary of yesterday's biopsy cases with urgent flags and follow-up recommendations" \
  --schedule "Daily" \
  --time "09:00" \
  --priority "Normal" \
  --status "Active"
```

### Step 3: System Executes Automatically

- Apps Script checks schedule every 5 minutes
- When 9:00 AM arrives, writes prompt JSON to Drive
- Drive syncs to local
- Automation server executes: `claude --print "[prompt]"`
- Response syncs back
- Sheet updates with results

### Step 4: View Results

Open the Google Sheet to see:
- **Execution Log**: When it ran, status, duration
- **Response Viewer**: Claude's response

---

## 📝 How to Request Scheduled Prompts

### Daily Prompts

**Format:**
> "Add a daily prompt that [does X], run it at [time]"

**Examples:**
- "Add a daily prompt that generates a biopsy summary, run it at 9 AM"
- "Schedule a daily check of pending invoices at 8:30 AM"
- "Create a daily morning briefing at 7 AM with key metrics"

### Weekly Prompts

**Format:**
> "Add a weekly prompt that [does X], run it every [days] at [time]"

**Examples:**
- "Add a weekly prompt that analyzes billing data, run it every Monday at 8 AM"
- "Schedule a weekly report on Fridays at 4 PM summarizing the week"

### Monthly Prompts

**Format:**
> "Add a monthly prompt that [does X], run it on the [day] at [time]"

**Examples:**
- "Add a monthly prompt that generates performance metrics, run it on the 1st at 7 AM"
- "Schedule a monthly review on the last day at 5 PM"

### One-Time Prompts

**Format:**
> "Add a one-time prompt that [does X], set it to run [when]"

**Examples:**
- "Add a one-time prompt to analyze Q4 data, run it tomorrow at 10 AM"

### Manual Prompts (On-Demand)

**Format:**
> "Add a manual prompt for [task]" (then you can ask me to trigger it when needed)

**Examples:**
- "Add a manual prompt for generating ad-hoc analysis reports"
- "Create a manual prompt for emergency data reviews"

---

## 🔧 What Claude Does For You

When you request a scheduled prompt, Claude:

1. ✅ **Validates** the prompt doesn't contain PHI
2. ✅ **Adds it** to the Google Sheet programmatically
3. ✅ **Logs the action** to `automation/automation-actions.log`
4. ✅ **Confirms** it was added successfully
5. ✅ **Provides the sheet link** so you can verify

---

## 📊 Viewing Results (Read-Only)

**You can open the Google Sheet to view:**

- **Scheduled Prompts** tab: See all scheduled prompts (status, schedule, last run)
- **Execution Log** tab: See execution history (when ran, duration, status)
- **Response Viewer** tab: Read Claude's responses

**Direct link:**
https://docs.google.com/spreadsheets/d/1HBhxSHs4nRpPir7P6YZ4p4yW_AEDGDIt-qAYVl_Mz-E/edit

---

## 🚫 What You NEVER Do

- ❌ Manually add rows to the Google Sheet
- ❌ Manually edit scheduled prompts
- ❌ Manually configure Apps Script
- ❌ Manually create Drive folders
- ❌ Manually run prompts

**Everything is AI-first and automated.**

---

## 🎛️ Managing Existing Prompts

### Pause a Prompt

> "Pause the daily biopsy summary prompt"

Claude will update the Status to "Paused" programmatically.

### Resume a Prompt

> "Resume the weekly billing report"

Claude will update the Status to "Active" programmatically.

### Modify a Prompt

> "Change the daily biopsy summary to run at 10 AM instead of 9 AM"

Claude will update the time programmatically.

### Delete a Prompt

> "Remove the monthly performance metrics prompt"

Claude will delete the row programmatically.

---

## 📋 Example Requests

### Healthcare/Clinical

> "Add a daily prompt at 9 AM that summarizes yesterday's urgent biopsy cases"

> "Schedule a weekly Monday 8 AM prompt to review pending pathology reports"

> "Create a monthly prompt on the 1st at 7 AM for case volume analysis"

### Billing/Financial

> "Add a daily prompt at 8:30 AM to identify outstanding invoices over 30 days"

> "Schedule a weekly Friday 3 PM prompt for revenue cycle summary"

### Operations

> "Add a daily prompt at 7 AM for system health check and alerts"

> "Create a manual prompt for emergency data exports when needed"

---

## 🔍 Behind the Scenes

When you make a request, Claude:

1. Parses your natural language request
2. Extracts: name, schedule type, time, prompt text, priority
3. Validates: no PHI, valid schedule format
4. Executes: `node add-scheduled-prompt.js` with parameters
5. Confirms: Shows you it was added successfully

**You never see the technical details - just make the request in plain English.**

---

## 📁 File Locations

**For Claude's reference (you don't need to know this):**

- Google Sheet: `1HBhxSHs4nRpPir7P6YZ4p4yW_AEDGDIt-qAYVl_Mz-E`
- Add script: `google-workspace-oauth-setup/add-scheduled-prompt.js`
- Update script: `google-workspace-oauth-setup/update-scheduled-prompt.js` (to be created)
- Delete script: `google-workspace-oauth-setup/delete-scheduled-prompt.js` (to be created)
- Action log: `automation/automation-actions.log`

---

## ✅ System Status

**Current Status**: 🟢 Fully Operational

- ✅ Google Sheet created
- ✅ Drive folders created
- ✅ Automation server running
- ✅ Apps Script configured (pending)
- ✅ Add prompt script working
- ⏳ Update/delete scripts (to be created as needed)

---

## 🎯 Summary

**The entire system is AI-first:**

1. **You speak naturally** to Claude about what you need
2. **Claude handles everything** programmatically
3. **System runs automatically** 24/7
4. **You view results** in the Google Sheet (read-only)

**No manual work. No technical knowledge required. Just tell Claude what you want.**

---

**Created**: 2025-11-13
**Status**: Production Ready
**Principle**: AI-First Automation - User Never Touches Infrastructure

# GitHub Version Control System Integration Guide

**Document:** GitHub Integration Guide
**Project:** Google Workspace Automation Infrastructure
**Version:** 1.0
**Last Updated:** 2025-11-08
**Status:** Active

---

## Overview

This guide explains how to integrate the Google Workspace Automation Infrastructure with the existing GitHub version control system for 237+ production Google Sheets.

### Two Systems Becoming One

**Existing System:** GitHub Version Control (`ssd-google-sheets-staging-production`)
- 237 production sheets already version controlled
- DEV/PROD staging environment operational
- Daily snapshots at 9 AM
- Deployment and rollback scripts proven

**New System:** Implementation Project (this project)
- Creating `automation@ssdsbc.com` account
- Setting up OAuth for all APIs
- Adding Gemini AI capabilities
- Building HIPAA-compliant workflows

**Integrated System:** One unified automation infrastructure
- Authentication layer powers version control
- AI features enhance snapshot system
- Bulk deployment capability added
- Single sheet registry for all 240 sheets

---

## Table of Contents

1. [Integration Architecture](#integration-architecture)
2. [Migration Path](#migration-path)
3. [Authentication Integration](#authentication-integration)
4. [Sheet Registry Unification](#sheet-registry-unification)
5. [Deployment Integration](#deployment-integration)
6. [Snapshot Enhancement](#snapshot-enhancement)
7. [Daily Workflow](#daily-workflow)
8. [Troubleshooting](#troubleshooting)

---

## Integration Architecture

### Before Integration

```
┌─────────────────────────┐      ┌─────────────────────────┐
│ GitHub Version Control  │      │ Implementation Project  │
│                         │      │                         │
│ - Personal account auth │      │ - automation@ account   │
│ - 237 sheets tracked    │      │ - 240 sheets planned    │
│ - Manual deployment     │      │ - Bulk deployment       │
│ - Daily snapshots       │      │ - Gemini AI integration │
│ - No AI features        │      │ - PHI Guard             │
└─────────────────────────┘      └─────────────────────────┘
        ↓                                  ↓
   Separate repositories            Duplicate effort
   Different credentials            Conflicting registries
```

### After Integration

```
┌───────────────────────────────────────────────────────────┐
│        UNIFIED AUTOMATION INFRASTRUCTURE                  │
│                                                           │
│  ┌─────────────────────────────────────────────┐        │
│  │ Authentication Layer (Phase 1)              │        │
│  │ - automation@ssdsbc.com                     │        │
│  │ - OAuth 2.0 for all APIs                    │        │
│  │ - Powers both version control and AI        │        │
│  └─────────────────────────────────────────────┘        │
│                        │                                  │
│                        ├──────────────┬─────────────────┐│
│                        ▼              ▼                 ││
│  ┌─────────────────────────┐  ┌──────────────────────┐ ││
│  │ Version Control (Git)   │  │ AI Layer (Gemini)    │ ││
│  │ - Enhanced deployments  │  │ - Drift analysis     │ ││
│  │ - Bulk operations       │  │ - PHI detection      │ ││
│  │ - Twice-daily snapshots │  │ - Smart alerts       │ ││
│  └─────────────────────────┘  └──────────────────────┘ ││
│                        │              │                 ││
│                        └──────┬───────┘                 ││
│                               ▼                         ││
│  ┌─────────────────────────────────────────────┐        │
│  │ Production Sheets (240)                     │        │
│  │ - Single unified registry                   │        │
│  │ - Consistent access control                 │        │
│  │ - Integrated monitoring                     │        │
│  └─────────────────────────────────────────────┘        │
└───────────────────────────────────────────────────────────┘
```

---

## Migration Path

### Timeline Overview

**Week 1-2: Authentication Migration**
- Create automation@ssdsbc.com account
- Migrate GitHub system to use automation@ credentials
- Test all existing workflows still work

**Week 3: Registry Unification**
- Audit both registries
- Merge into single source of truth
- Update all scripts to use unified registry

**Week 4-6: Deployment Enhancement**
- Add bulk deployment capability
- Integrate PHI Guard into deployment
- Test pilot deployment (20 sheets)

**Week 7: Snapshot Enhancement**
- Add Gemini classification to drift detection
- Enable twice-daily snapshots
- Configure smart notifications

**Week 8: Final Integration**
- Full system testing
- Documentation updates
- Team training

### Success Criteria

- ✅ All 240 sheets accessible via automation@ account
- ✅ Single sheet registry maintained in one location
- ✅ Existing deployment workflow unchanged (single sheets)
- ✅ New bulk deployment capability added
- ✅ Twice-daily snapshots operational
- ✅ AI-powered drift analysis working
- ✅ Zero downtime during migration
- ✅ All safety mechanisms (backup, rollback) preserved

---

## Authentication Integration

### Current State

**GitHub Version Control:**
- Uses personal account for clasp authentication
- Personal credentials in GitHub Actions secrets
- Works but tied to individual user

**Implementation Project:**
- Creating automation@ssdsbc.com account
- Setting up OAuth 2.0 credentials
- Separate authentication layer

### Integrated State

**One Account for Everything:**
- automation@ssdsbc.com handles all automated operations
- Same credentials power version control AND AI features
- Consistent permissions across all 240 sheets

### Migration Steps

#### Step 1: Create Automation Account

Follow [Automation Account Guide](AUTOMATION-ACCOUNT-GUIDE.md):

1. Create automation@ssdsbc.com in Google Workspace
2. Enable 2FA with backup codes
3. Grant Manager access to all Shared Drives (verify all 5+ drives)
4. Store credentials in password manager

#### Step 2: Configure OAuth for Automation Account

Follow [OAuth Setup Guide](OAUTH-SETUP-GUIDE.md):

1. Create Google Cloud Project (or use existing)
2. Enable APIs: Drive, Sheets, Apps Script
3. Configure OAuth consent screen
4. Download credentials.json
5. Test authentication

**Verification:**
```bash
# Test Drive API access
node test-drive-wrapper.js

# Test Sheets API access
node test-sheets-api.js

# Test Apps Script API access
clasp login --status
```

#### Step 3: Migrate GitHub Version Control to automation@

Navigate to GitHub repository:

```bash
cd ~/Desktop/ssd-google-sheets-staging-production
```

**Re-authenticate clasp:**
```bash
# Logout current user
clasp logout

# Login with automation account
clasp login
# Sign in as automation@ssdsbc.com
# Complete OAuth flow
# Confirm: "Logged in as automation@ssdsbc.com"
```

**Update GitHub Actions secrets:**

1. Go to repository on GitHub
2. Navigate to **Settings** > **Secrets and variables** > **Actions**
3. Update or create secrets:

```
CLASP_CREDENTIALS
Value: [Contents of ~/.clasprc.json after clasp login]

AUTOMATION_ACCOUNT_EMAIL
Value: automation@ssdsbc.com

GEMINI_API_KEY
Value: [From implementation project .env file]
```

**Test snapshot system:**
```bash
# Manual trigger via GitHub Actions
# Go to Actions tab > "Daily Production Snapshot" > Run workflow

# Or test locally
node scripts/snapshot-all-production.js
```

#### Step 4: Verify Migration

**Checklist:**
- [ ] clasp authenticated as automation@ssdsbc.com
- [ ] Can pull code from production sheet: `cd production-sheets/[SHEET]/live && clasp pull`
- [ ] Can push code to production sheet: `clasp push`
- [ ] Can pull code from DEV sheet: `cd staging-sheets/[SHEET]-DEV/dev && clasp pull`
- [ ] GitHub Actions snapshot runs successfully
- [ ] Deployment script works: `./scripts/deploy-to-production.sh [SHEET]`
- [ ] Rollback script works: `./scripts/rollback.sh [SHEET]`

**If any test fails:**
- Verify automation@ has Manager role (not just Content Manager)
- Check OAuth scopes include all required permissions
- Ensure Apps Script API is enabled
- Confirm automation@ can access all Shared Drives

---

## Sheet Registry Unification

### Current State

**GitHub System Registry:**
- Location: `~/Desktop/ssd-google-sheets-staging-production/config/sheet-registry.json`
- Contains: 237 sheets
- Format: JSON with metadata
- Management tools: `update-registry.js`, `list-sheets.js`

**Implementation Project Registry:**
- Location: `sheet-registry.json` (planned)
- Contains: 240 sheets (planned)
- Format: TBD
- Management tools: To be built

**Problem:** Two registries = confusion and drift

### Unified Registry Design

**Single Source of Truth:**
- Location: GitHub repository (`config/sheet-registry.json`)
- Contains: All 240 sheets (merge both sources)
- Format: Enhanced JSON with additional metadata
- Management: Existing tools + new bulk operations

**Registry Schema:**
```json
[
  {
    "sheetId": "1AbCdEfG...",
    "sheetName": "Prior Auth Tracker V3",
    "scriptId": "AKfycbx...",
    "sharedDrive": "Prior Authorization Drive",
    "sharedDriveId": "0APX...",
    "tags": ["prior-auth", "production", "critical"],
    "criticality": "high",
    "owner": "Medical Practice Staff",
    "lastModified": "2025-11-01T10:00:00Z",
    "lastDeployed": "2025-10-28T15:30:00Z",
    "hasScript": true,
    "hasDev": true,
    "devSheetId": "1XyZ...",
    "devScriptId": "AKfycby...",
    "automationFeatures": {
      "phiGuardEnabled": true,
      "geminClassification": false,
      "snapshotFrequency": "twice-daily"
    }
  }
]
```

### Migration Steps

#### Step 1: Audit Existing Registries

**GitHub system registry:**
```bash
cd ~/Desktop/ssd-google-sheets-staging-production
node scripts/registry/list-sheets.js --format json > /tmp/github-registry.json
```

**Implementation project (scan actual sheets):**
```bash
cd ~/Desktop/medical-patient-data/Implementation\ Projects/google-workspace-automation-infrastructure
node build-sheet-registry.js > /tmp/implementation-registry.json
```

**Compare:**
```bash
node scripts/compare-registries.js \
  /tmp/github-registry.json \
  /tmp/implementation-registry.json
```

Output shows:
- Sheets in GitHub but not in scan (removed/renamed)
- Sheets in scan but not in GitHub (new/missing)
- Differences in metadata

#### Step 2: Merge Registries

**Use provided unification script:**
```bash
node scripts/unify-registries.js \
  --source1 /tmp/github-registry.json \
  --source2 /tmp/implementation-registry.json \
  --output config/sheet-registry-unified.json \
  --resolve conflicts-prompt
```

**Script actions:**
1. Loads both registries
2. Identifies duplicates by sheetId
3. For conflicts, prompts user to choose
4. Adds missing sheets from both sources
5. Validates schema
6. Saves unified registry

#### Step 3: Replace Old Registry

```bash
# Backup existing registry
cp config/sheet-registry.json config/sheet-registry-backup-$(date +%Y%m%d).json

# Replace with unified version
mv config/sheet-registry-unified.json config/sheet-registry.json

# Commit change
git add config/sheet-registry.json
git commit -m "feat(registry): unify implementation project + GitHub system registries"
git push
```

#### Step 4: Update Implementation Project

Point implementation project scripts to unified registry:

**Update configuration:**
```javascript
// In implementation project scripts
const REGISTRY_PATH = '~/Desktop/ssd-google-sheets-staging-production/config/sheet-registry.json';
// Or create symlink:
// ln -s ~/Desktop/ssd-google-sheets-staging-production/config/sheet-registry.json ./sheet-registry.json
```

#### Step 5: Verify Unification

```bash
# List all sheets from unified registry
node scripts/registry/list-sheets.js

# Expected: 240 sheets total
# Verify count matches reality
```

---

## Deployment Integration

### Current State

**GitHub System:**
- Single-sheet deployment: `deploy-to-production.sh [SHEET_NAME]`
- Works well, proven, reliable
- Manual process for each sheet

**Implementation Project:**
- Planning bulk deployment from scratch
- Would duplicate existing functionality
- Risk of conflicting with GitHub system

### Integrated Approach

**Enhance, Don't Replace:**
- Keep existing single-sheet deployment (works great)
- Add bulk mode to same script
- Use same safety mechanisms (backup, diff, rollback)
- Integrate PHI Guard into deployment flow

### Enhanced Deployment Script

**New capabilities:**

```bash
# Single sheet (unchanged)
./scripts/deploy-to-production.sh "D25-264_Prior_Auth_V3"

# Bulk deployment (new)
./scripts/deploy-to-production.sh --bulk --all
./scripts/deploy-to-production.sh --bulk --tag "prior-auth"
./scripts/deploy-to-production.sh --bulk --list deployment-list.txt
./scripts/deploy-to-production.sh --bulk --range "1-50"

# With PHI Guard (new)
./scripts/deploy-to-production.sh "SheetName" --scan-phi
./scripts/deploy-to-production.sh --bulk --all --scan-phi

# Dry run (new)
./scripts/deploy-to-production.sh --bulk --all --dry-run
```

### Implementation

Create `scripts/bulk-deploy.sh`:

```bash
#!/bin/bash
# Wrapper around deploy-to-production.sh for bulk operations
# Handles:
# - Parallel processing (5 concurrent)
# - Progress tracking
# - Failure retry
# - Summary report

CONCURRENCY=5
REGISTRY="config/sheet-registry.json"

# Read sheets from registry based on filter
# Process in batches of $CONCURRENCY
# Call deploy-to-production.sh for each
# Track results
# Generate deployment report
```

**Features:**
- Reuses existing deployment logic (proven)
- Adds parallelization (faster)
- Maintains all safety checks (backup, diff, confirm)
- Generates deployment report
- Supports retry for failed deployments

### PHI Guard Integration

Add to deployment script (before `clasp push`):

```bash
# In deploy-to-production.sh, before deployment
if [ "$SCAN_PHI" = "true" ]; then
  echo "🔍 Scanning for PHI..."

  node scripts/phi-guard/scan-code.js "$SHEET_NAME" "$PROD_PATH/live"
  PHI_RESULT=$?

  if [ $PHI_RESULT -eq 2 ]; then
    echo "❌ HIGH-RISK PHI DETECTED - Deployment blocked"
    echo "   Review and fix PHI issues before deploying"
    exit 1
  elif [ $PHI_RESULT -eq 1 ]; then
    echo "⚠️  Low-risk PHI detected - Proceeding with caution"
  else
    echo "✅ No PHI detected"
  fi
fi
```

### Testing Integration

**Pilot test (20 sheets):**
```bash
# Create test list
node scripts/registry/list-sheets.js --tag "pilot" --output pilot-sheets.txt

# Test bulk deployment
./scripts/bulk-deploy.sh --list pilot-sheets.txt --dry-run

# If dry-run looks good, deploy for real
./scripts/bulk-deploy.sh --list pilot-sheets.txt
```

**Success criteria:**
- All 20 sheets deploy successfully
- Backups created for each
- Deployment completes in < 30 minutes
- Rollback tested on one sheet
- No production incidents

**Full deployment (240 sheets):**
```bash
# After pilot success
./scripts/bulk-deploy.sh --all

# Monitor progress
# Expected duration: ~2 hours (5 sheets every ~2.5 minutes)
```

---

## Snapshot Enhancement

### Current State

**GitHub System Snapshots:**
- Frequency: Once daily (9 AM ET)
- Detection: Text-based diff (basic)
- Notification: GitHub issue created
- Action: Manual review required

**Limitations:**
- No context on change severity
- Generic "drift detected" alerts
- High false-positive noise
- 24-hour detection window

### Enhanced Snapshot System

**New capabilities:**
- Twice-daily snapshots (9 AM + 5 PM)
- Gemini-powered change classification
- Smart severity assessment
- Multi-channel notifications
- HIPAA audit logging

### Architecture

```
┌─────────────────────────────────────────────────┐
│  GitHub Actions Trigger (9 AM / 5 PM)          │
└─────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│  snapshot-all-production.js                     │
│  - Pull code from all 240 production sheets    │
│  - Compare to last known Git state             │
│  - Detect changes (drift)                      │
└─────────────────────────────────────────────────┘
                    │
                    │ If drift detected
                    ▼
┌─────────────────────────────────────────────────┐
│  classify-drift-with-gemini.js (NEW)           │
│  - Analyze code changes                        │
│  - Classify severity (low/medium/high)         │
│  - Identify change type (docs/logic/formula)   │
│  - Generate human-readable summary             │
└─────────────────────────────────────────────────┘
                    │
                    ├──────────────┬──────────────┐
                    ▼              ▼              ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ GitHub      │  │ Slack       │  │ HIPAA Audit │
│ Issue       │  │ Webhook     │  │ Log         │
│ (detailed)  │  │ (alert)     │  │ (compliance)│
└─────────────┘  └─────────────┘  └─────────────┘
```

### Implementation

**Update GitHub Actions workflow:**

`.github/workflows/daily-production-snapshot.yml`:

```yaml
name: Daily Production Snapshot

on:
  schedule:
    - cron: '0 14 *  * *'  # 9 AM ET (14:00 UTC)
    - cron: '0 22 * * *'   # 5 PM ET (22:00 UTC)
  workflow_dispatch:       # Manual trigger

jobs:
  snapshot:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Run snapshot with Gemini classification
        env:
          CLASP_CREDENTIALS: ${{ secrets.CLASP_CREDENTIALS }}
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
        run: |
          node scripts/snapshot-all-production.js \
            --classify-drift \
            --notify slack \
            --audit-log

      - name: Commit changes
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add .
          git commit -m "chore(snapshot): automated production snapshot $(date +%Y-%m-%d-%H%M)" || true
          git push
```

**Create Gemini classification script:**

`scripts/classify-drift-with-gemini.js`:

```javascript
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

async function classifyDrift(sheetName, changes) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

  const prompt = `
You are a code change analyzer for a medical practice automation system.

Analyze the following code changes and classify them:

Sheet: ${sheetName}
Changes:
${changes}

Provide classification in JSON format:
{
  "severity": "low|medium|high|critical",
  "changeType": "documentation|formula|logic|trigger|permission|other",
  "summary": "Brief human-readable summary",
  "recommendation": "accept|review|rollback",
  "reasoning": "Why this classification was chosen",
  "phiRisk": "none|low|medium|high"
}

Classification criteria:
- LOW: Comments, formatting, documentation
- MEDIUM: Formula changes, non-critical logic
- HIGH: Workflow logic, trigger modifications
- CRITICAL: Permission changes, PHI handling

PHI Risk:
- NONE: No patient data handling
- LOW: Minor changes to PHI-adjacent code
- MEDIUM: Changes to PHI processing logic
- HIGH: New PHI exposure or security issue
`;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();

  // Extract JSON from response
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to extract JSON from Gemini response');
  }

  return JSON.parse(jsonMatch[0]);
}

module.exports = { classifyDrift };
```

**Integrate into snapshot script:**

```javascript
// In scripts/snapshot-all-production.js

const { classifyDrift } = require('./classify-drift-with-gemini');
const { logToAudit } = require('./hipaa-audit-logger');
const { sendNotification } = require('./monitoring/send-drift-notification');

async function snapshotSheet(sheet) {
  // ... existing snapshot logic ...

  if (driftDetected) {
    // NEW: Classify drift with Gemini
    const classification = await classifyDrift(sheet.name, changes);

    // Log to HIPAA audit trail
    await logToAudit({
      operation: 'drift_detected',
      sheet: sheet.name,
      severity: classification.severity,
      changeType: classification.changeType,
      phiRisk: classification.phiRisk,
      timestamp: new Date().toISOString()
    });

    // Send smart notification
    await sendNotification({
      type: 'drift',
      severity: classification.severity,
      sheet: sheet.name,
      summary: classification.summary,
      recommendation: classification.recommendation,
      viewUrl: `https://github.com/.../issues/...`
    });

    // Create GitHub issue with rich context
    await createGitHubIssue({
      title: `[${classification.severity.toUpperCase()}] Drift: ${sheet.name}`,
      body: `
## Drift Detection Summary

**Sheet:** ${sheet.name}
**Severity:** ${classification.severity}
**Change Type:** ${classification.changeType}
**PHI Risk:** ${classification.phiRisk}

### Summary
${classification.summary}

### Recommendation
${classification.recommendation}

### Reasoning
${classification.reasoning}

### Changes Detected
\`\`\`diff
${changes}
\`\`\`

### Next Steps
${classification.recommendation === 'rollback' ?
  '❌ Immediate rollback recommended' :
  classification.recommendation === 'review' ?
  '⚠️ Review changes and accept or rollback' :
  '✅ Changes appear safe, update Git to accept'
}
      `,
      labels: ['drift-detection', classification.severity, classification.changeType]
    });
  }
}
```

### Notification Examples

**Low severity (informational):**
```
💬 Drift Detected - LOW severity
Sheet: Prior Auth V3
Change: Comment added to line 45
Action: Review when convenient
Link: https://github.com/.../issues/123
```

**High severity (urgent):**
```
🚨 DRIFT DETECTED - HIGH SEVERITY
Sheet: Billing Calculator
Change: Payment calculation logic modified
PHI Risk: Medium
Recommendation: REVIEW IMMEDIATELY
Someone may have edited production directly!
Link: https://github.com/.../issues/124
Action Required: Review and rollback/accept within 1 hour
```

---

## Daily Workflow

### Unchanged (Single Sheet)

If you're working on one sheet, workflow stays the same:

```bash
1. cd ~/Desktop/ssd-google-sheets-staging-production
2. git pull
3. cd staging-sheets/[SHEET]-DEV/dev
4. # Edit in Google Sheets Apps Script editor
5. clasp pull
6. git add .
7. git commit -m "feat: your change"
8. git push
9. ../../../scripts/deploy-to-production.sh [SHEET_NAME]
```

**No changes required - if it works, we don't change it.**

### Enhanced (Bulk Operations)

New capabilities for deploying to many sheets:

**Scenario: Update all Prior Auth sheets**
```bash
1. Make change in ONE Prior Auth DEV sheet
2. Test thoroughly
3. Pull, commit, push (once)
4. ./scripts/bulk-deploy.sh --tag "prior-auth"
5. Review deployment report
```

**Scenario: Deploy to specific list**
```bash
# Create list
echo "D25-264_Prior_Auth_V3" > deploy-list.txt
echo "D25-298_Order_Dashboard" >> deploy-list.txt
echo "D25-100_Patient_Billing" >> deploy-list.txt

# Deploy
./scripts/bulk-deploy.sh --list deploy-list.txt
```

### Monitoring Workflow

**Morning check (10 minutes):**
```bash
1. Check email/Slack for drift notifications
2. If alerts:
   - LOW: Note for weekly review
   - MEDIUM: Review same day
   - HIGH: Investigate immediately
3. If no alerts: continue normal work
```

**No manual snapshot checking required** - system alerts you automatically.

---

## Troubleshooting

### Authentication Issues

**Problem:** clasp not working after migration

**Solution:**
```bash
# Check who is logged in
clasp login --status

# Should show: automation@ssdsbc.com
# If not, re-login:
clasp logout
clasp login
```

**Problem:** GitHub Actions snapshot failing

**Solution:**
1. Check secrets are configured correctly
2. Verify CLASP_CREDENTIALS format:
   ```json
   {
     "token": {
       "access_token": "...",
       "refresh_token": "...",
       "scope": "...",
       "token_type": "Bearer",
       "expiry_date": ...
     },
     "oauth2ClientSettings": {
       "clientId": "...",
       "clientSecret": "...",
       "redirectUri": "..."
     },
     "isLocalCreds": false
   }
   ```

### Registry Issues

**Problem:** Sheet not found in registry

**Solution:**
```bash
# Add to registry
node scripts/registry/update-registry.js --add \
  --sheet-id "1AbC..." \
  --sheet-name "Missing Sheet" \
  --script-id "AKfyc..."

# Or rebuild registry
node scripts/build-sheet-registry.js
```

**Problem:** Duplicate sheets in registry

**Solution:**
```bash
# List duplicates
node scripts/registry/list-sheets.js --duplicates

# Remove duplicate (keeps newest)
node scripts/registry/update-registry.js --remove-duplicate "SHEET_ID"
```

### Deployment Issues

**Problem:** Bulk deployment failing

**Solution:**
```bash
# Check which sheets failed
cat deployment-results.json | jq '.[] | select(.success == false)'

# Retry failed only
./scripts/bulk-deploy.sh --retry-failed
```

**Problem:** PHI Guard blocking deployment

**Solution:**
```bash
# Review PHI detection
node scripts/phi-guard/scan-code.js "SHEET_NAME" "path/to/code"

# If false positive, update PHI Guard patterns
# If real PHI, fix code before deploying
```

### Snapshot Issues

**Problem:** Gemini classification failing

**Solution:**
```bash
# Test Gemini API connectivity
node test-gemini.js

# Check API key
echo $GEMINI_API_KEY

# Run snapshot without classification
node scripts/snapshot-all-production.js --no-classify
```

**Problem:** Too many drift alerts

**Solution:**
```bash
# Review alert thresholds
# Edit scripts/classify-drift-with-gemini.js
# Adjust severity classification criteria

# Or filter notifications by severity
# Only alert on HIGH and CRITICAL
```

---

## Next Steps

After completing this integration:

1. ✅ Authentication migrated to automation@
2. ✅ Registries unified into single source
3. ✅ Bulk deployment capability added
4. ✅ Snapshots enhanced with AI classification
5. ✅ PHI Guard integrated into deployment

**You now have:**
- One unified system (not two separate systems)
- Enhanced capabilities (bulk ops, AI classification)
- Same reliability (existing safety mechanisms preserved)
- Better monitoring (twice daily, smart alerts)
- HIPAA compliance (PHI Guard, audit logging)

**Continue with:**
- [Migration Checklist](GITHUB-MIGRATION-CHECKLIST.md) - Step-by-step migration plan
- [Enhanced Snapshot Design](ENHANCED-SNAPSHOT-SYSTEM.md) - Detailed technical design
- [Registry Unification Script](../scripts/unify-registries.js) - Automated registry merge

---

**Document Owner:** Marvin Maruthur
**Last Updated:** 2025-11-08
**Status:** Ready for implementation
**Related Documents:**
- [AUTOMATION-ACCOUNT-GUIDE.md](AUTOMATION-ACCOUNT-GUIDE.md)
- [OAUTH-SETUP-GUIDE.md](OAUTH-SETUP-GUIDE.md)
- [GEMINI-INTEGRATION-GUIDE.md](GEMINI-INTEGRATION-GUIDE.md)
- [GOALS.md](../02-goals-and-milestones/GOALS.md)

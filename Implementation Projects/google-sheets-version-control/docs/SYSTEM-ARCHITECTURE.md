# System Architecture - SSD Google Sheets Automation

## Overview

This document describes the complete architecture for SSD's Google Sheets version control and automation system. This serves as a reference for new AI agents, team members, and future maintenance.

**Part of Workspace Management Documentation:**
- For complete workspace documentation index, see [WORKSPACE-MANAGEMENT.md](WORKSPACE-MANAGEMENT.md)
- For service account details, see [SERVICE-ACCOUNT.md](SERVICE-ACCOUNT.md)
- For quick start and onboarding, see [AI-AGENT-ONBOARDING.md](AI-AGENT-ONBOARDING.md)
- For root-level overview, see [../WORKSPACE_GUIDE.md](../WORKSPACE_GUIDE.md)

## System Components

### 1. Google Cloud Infrastructure

**Account:** Automation at SSD SPC
- **Purpose:** Central cloud services account for all SSD automation
- **Services Used:**
  - Google Sheets API
  - Google Drive API
  - Service Account authentication

**Service Account:** SSD Automation Service Account
- **Name:** `SSD Automation Service Account`
- **Email:** `ssd-automation-service-account@workspace-automation-ssdspc.iam.gserviceaccount.com`
- **Purpose:** Standardized identity for all automated workflows across workspaces
- **Credentials:** Stored as `GCP_SERVICE_ACCOUNT` in GitHub Secrets
- **Permissions:** Editor access to shared sheets (by explicit sharing)
- **Documentation:** See [SERVICE-ACCOUNT.md](SERVICE-ACCOUNT.md) for complete details

### 2. GitHub Repository

**Repository:** https://github.com/mmaruthurssd/ssd-google-sheets-staging-production

**Purpose:**
- Version control for Apps Script code from 588 production sheets
- Automated daily snapshots (9 AM & 5 PM Central Time)
- Code backup and recovery system

**Branch Structure:**
- `main` - Production branch (protected)
- Daily automated commits from GitHub Actions

**Secrets:**
- `GCP_SERVICE_ACCOUNT` - Service account JSON key for automation
- `CLASP_CREDENTIALS` - (Deprecated, replaced by service account)

**GitHub Actions Workflows:**
- `.github/workflows/daily-snapshots.yml` - Automated snapshot workflow

### 3. Local Development Environment

**Location:** `/Users/mmaruthurnew/Desktop/medical-patient-data/Implementation Projects/google-sheets-version-control`

**Key Directories:**
- `production-sheets/` - 588 production sheet backups
- `staging-sheets/` - Staging environment sheets
- `config/` - Configuration files (sheet-registry.json)
- `scripts/` - Automation scripts
- `docs/` - System documentation
- `.github/workflows/` - GitHub Actions workflows

**Local Authentication:**
- `.clasprc.json` - OAuth credentials for local development (in ~/.clasprc.json)
- Personal Google account authentication via clasp

### 4. Google Sheets & Drive

**Production Environment:**
- **Location:** SSD's Google Workspace
- **Count:** 588 Apps Script projects
- **Naming:** DEV3/DEV4 prefixed sheets
- **Backup:** Tracked in `config/sheet-registry.json`

**Automation Logging:**
- **Sheet:** Daily Snapshot Log - SSD Google Sheets
- **ID:** `1KpUhrEtW7-uHHS6GIngiXws0v2aM2wBC5ppyDBnRKxc`
- **Location:** "AI Development - No PHI" shared drive
- **Purpose:** Tracks all automated snapshot runs with timestamps, success/failure, and GitHub links

## Authentication Flow

### For GitHub Actions (Automated)

```
GitHub Actions Workflow
    ↓
Environment Variable: GCP_SERVICE_ACCOUNT
    ↓
scripts/log-snapshot-run.js
    ↓
google.auth.GoogleAuth (service account)
    ↓
Google Sheets API
    ↓
Daily Snapshot Log Sheet
```

### For Local Development (Manual)

```
Developer
    ↓
clasp login (OAuth)
    ↓
~/.clasprc.json (OAuth tokens)
    ↓
scripts/log-snapshot-run.js
    ↓
google.auth.OAuth2 (OAuth fallback)
    ↓
Google Sheets API
```

## Data Flow

### Daily Snapshot Process

1. **Trigger:** GitHub Actions cron schedule (9 AM & 5 PM Central)
2. **Execution:**
   - Batch 1: Sheets 0-134 (135 sheets)
   - Batch 2: Sheets 135-269 (135 sheets)
   - Batch 3: Sheets 270-403 (134 sheets)
   - Staging: All staging sheets
3. **Code Backup:** Apps Script code pulled via clasp
4. **Git Commit:** Changes committed to GitHub
5. **Logging:** Run details logged to Google Sheet
6. **Notification:** GitHub issue created on failure

### Logging Details Captured

- Run Date & Time (Central Time)
- Status (SUCCESS/FAILURE/CANCELLED)
- Total Sheets Processed
- Batch Success Counts (135/135/134)
- Total Failures
- Duration (minutes)
- GitHub Run Link
- Commit SHA
- Notes

## Access Credentials Map

### What AI Agents Need to Know

**To Access GitHub:**
- Repository URL
- Branch: main
- Secrets location: Settings > Secrets and variables > Actions

**To Access Google Sheets API:**
- Service account email: `ssd-automation-service-account@[project-id].iam.gserviceaccount.com`
- Credentials: GitHub Secret `GCP_SERVICE_ACCOUNT`
- Shared sheets only (explicit permission required)

**To Access Local Repository:**
- Path: `/Users/mmaruthurnew/Desktop/medical-patient-data/Implementation Projects/google-sheets-version-control`
- Git remote: origin (GitHub)
- Authentication: SSH or HTTPS with personal tokens

**To Run clasp Commands:**
- Requires: `~/.clasprc.json` (OAuth)
- Auth method: `clasp login`
- Scope: Personal Google account access

## Integration Points

### Current Integrations

1. **GitHub ↔ Google Sheets**
   - Via: GitHub Actions + Service Account
   - Purpose: Automated logging of snapshot runs
   - Frequency: Every snapshot run (2x daily)

2. **Local ↔ Google Sheets**
   - Via: clasp + OAuth
   - Purpose: Development and manual snapshots
   - Frequency: On-demand

3. **GitHub Actions ↔ Google Drive**
   - Via: Service Account
   - Purpose: Code backup and version control
   - Frequency: Daily snapshots (9 AM & 5 PM Central)

### Future Integration Opportunities

- VPS server automation
- Cross-workspace synchronization
- Real-time backup monitoring
- Automated testing workflows

## Security Model

### Credential Storage

**Never Commit to Git:**
- ✅ Protected by .gitignore:
  - `.clasprc.json`
  - `credentials.json`
  - `token.json`
  - `.env` files

**Secure Storage Locations:**
- Service Account JSON: GitHub Secrets (encrypted)
- OAuth Tokens: `~/.clasprc.json` (local only)
- API Keys: GitHub Secrets (if needed)

### Access Control

**Service Account:**
- Principle: Least privilege
- Access: Only to explicitly shared sheets
- Audit: All actions logged with service account identity

**GitHub Repository:**
- Protection: Pre-commit hooks prevent mass deletions
- Backups: Multiple snapshot commits in history
- Recovery: Git revert and checkout available

## Backup Strategy

### Multi-Layer Backup

**Layer 1: Google Drive (Source of Truth)**
- All Google Sheets exist in Google Drive
- Apps Script code lives within sheets
- Google Workspace native backup/recovery

**Layer 2: GitHub Repository (Code Backup)**
- Daily automated commits
- Full git history
- Recovery via git checkout or revert

**Layer 3: Local Repository (Development Backup)**
- Local copy of all Apps Script code
- Config files and metadata
- Protected by pre-commit hooks

**Layer 4: Google Sheets Logging (Audit Trail)**
- All snapshot runs logged
- Links to GitHub runs and commits
- Duration and success metrics

### Recovery Procedures

See `docs/DATA-PROTECTION.md` for detailed recovery procedures.

## Directory Structure

```
google-sheets-version-control/
├── .git/                          # Git repository
│   └── hooks/
│       └── pre-commit             # Protection against mass deletions
├── .github/
│   └── workflows/
│       └── daily-snapshots.yml    # Automated snapshot workflow
├── production-sheets/             # 588 production sheet backups
│   └── sheet-XXX_NAME/
│       ├── live/                  # Current Apps Script code
│       │   ├── Code.js
│       │   └── appsscript.json
│       ├── metadata/
│       │   └── last-updated.txt
│       └── .clasp.json            # Sheet ID and script ID
├── staging-sheets/                # Staging environment (if exists)
├── config/
│   └── sheet-registry.json        # Master registry of all sheets
├── scripts/
│   ├── log-snapshot-run.js        # Logs to Google Sheets
│   ├── create-snapshot-log.js     # Creates logging sheet
│   └── update-log-formatting.js   # Formats logging sheet
├── docs/
│   ├── SYSTEM-ARCHITECTURE.md     # This file
│   ├── SERVICE-ACCOUNT-SETUP.md   # Service account setup guide
│   ├── DATA-PROTECTION.md         # Backup and recovery guide
│   └── AI-AGENT-ONBOARDING.md     # (Next: Guide for new AI agents)
├── .gitignore                     # Excludes credentials
├── package.json                   # Node.js dependencies
└── README.md                      # Project overview
```

## Key Scripts

### log-snapshot-run.js
**Purpose:** Log snapshot run details to Google Sheet
**Authentication:** Service account (GitHub Actions) or OAuth (local)
**Usage:** Called automatically at end of each snapshot workflow
**Args:** status, totalSheets, batch counts, failures, duration, runId, commitSha, notes

### create-snapshot-log.js
**Purpose:** Create the Daily Snapshot Log sheet (one-time setup)
**Authentication:** OAuth (local only)
**Usage:** Manual - creates initial logging sheet

### update-log-formatting.js
**Purpose:** Update logging sheet formatting
**Authentication:** OAuth (local only)
**Usage:** Manual - applies formatting changes to existing sheet

## Environment Variables

### GitHub Actions

```yaml
GCP_SERVICE_ACCOUNT: ${{ secrets.GCP_SERVICE_ACCOUNT }}
```

### Local Development

```bash
# No environment variables needed
# Authentication via ~/.clasprc.json
```

## Troubleshooting Guide

### Common Issues

**Issue:** Logging fails with "invalid_request"
- **Cause:** OAuth token expired
- **Solution:** Switch to service account authentication

**Issue:** Production sheets show as "untracked" in git
- **Cause:** Git tracking lost
- **Solution:** See DATA-PROTECTION.md recovery procedures

**Issue:** Snapshot workflow times out
- **Cause:** Too many sheets in one batch
- **Solution:** Adjust BATCH_SIZE in workflow (currently 135)

### Support Resources

1. Documentation: `docs/` directory
2. GitHub Issues: Repository issue tracker
3. Google Sheets Log: Historical run data
4. Git History: `git log --oneline`

## Maintenance Tasks

### Daily (Automated)
- Snapshot runs at 9 AM and 5 PM Central
- Logging to Google Sheets
- Git commits to GitHub

### Weekly (Manual)
- Review snapshot logs for failures
- Check GitHub Actions status
- Verify git repository health

### Monthly (Manual)
- Review service account permissions
- Update documentation if architecture changes
- Clean up old backup data (if needed)

## Version History

- **v1.0** (2025-11-11): Initial architecture documentation
  - Service account authentication implemented
  - Data protection system in place
  - Daily snapshot logging active

## Next Steps

1. Complete service account setup (in progress)
2. Create AI Agent Onboarding Guide
3. Set up issue tracking system
4. Document VPS integration (when implemented)

---

**Last Updated:** 2025-11-11
**Maintained By:** AI Assistant (Claude Code)
**Review Frequency:** Monthly or when architecture changes

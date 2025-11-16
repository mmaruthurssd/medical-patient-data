# SSD Workspace Guide

## Welcome

This repository is part of the **SSD Workspace Ecosystem** - a comprehensive automation and version control system for Google Sheets Apps Script projects.

**For New Users/AI Agents:** Start with [docs/AI-AGENT-ONBOARDING.md](docs/AI-AGENT-ONBOARDING.md) for a complete onboarding guide.

## Quick Start

### For AI Agents (New Sessions)

```bash
# 1. Navigate to project
cd "/Users/mmaruthurnew/Desktop/medical-patient-data/Implementation Projects/google-sheets-version-control"

# 2. Read onboarding guide
cat docs/AI-AGENT-ONBOARDING.md

# 3. Read workspace management hub
cat docs/WORKSPACE-MANAGEMENT.md

# 4. Check system health
ls -d production-sheets/sheet-* | wc -l  # Should be 588
git status                                # Should be clean or expected changes
gh run list --limit 5                     # Check recent workflow runs
```

### For Developers

```bash
# Clone repository
git clone https://github.com/mmaruthurssd/ssd-google-sheets-staging-production.git

# Install dependencies
npm install

# Authenticate with Google (local development)
clasp login

# Run snapshot manually
./scripts/run-snapshot.sh
```

## What This Repository Does

### Primary Purpose
**Automated version control and backup** for 588 production Google Sheets Apps Script projects.

### Key Features
- ✅ **Daily Automated Snapshots** - 9 AM & 5 PM Central Time
- ✅ **GitHub Version Control** - Full git history of all Apps Script code
- ✅ **Automated Logging** - Run details logged to Google Sheet
- ✅ **Data Protection** - Pre-commit hooks prevent accidental deletions
- ✅ **Service Account Authentication** - Reliable, never-expiring automation
- ✅ **Comprehensive Documentation** - AI-ready documentation system

## Documentation Structure

### Essential Reading (In Order)

1. **[AI Agent Onboarding](docs/AI-AGENT-ONBOARDING.md)**
   - Quick start checklist
   - Health check commands
   - Common tasks and scenarios
   - Safety protocols
   - **Read this FIRST in every new AI session**

2. **[Workspace Management Hub](docs/WORKSPACE-MANAGEMENT.md)**
   - Central documentation index
   - Service account overview
   - Authentication systems
   - Automation workflows
   - **The navigation center for all documentation**

3. **[System Architecture](docs/SYSTEM-ARCHITECTURE.md)**
   - Complete technical architecture
   - Data flow diagrams
   - Integration points
   - Component details
   - **Deep dive into how everything works**

### Specialized Documentation

- **[Service Account](docs/SERVICE-ACCOUNT.md)** - Complete service account documentation
- **[Service Account Setup](docs/SERVICE-ACCOUNT-SETUP.md)** - How to create service accounts
- **[Data Protection](docs/DATA-PROTECTION.md)** - Backup and recovery procedures
- **[Documentation Process](docs/DOCUMENTATION-PROCESS.md)** - How to document new processes
- **[Issues](docs/ISSUES.md)** - Known issues and resolutions

## Key Credentials and Access

### Service Account (Primary for Automation)

**Name:** SSD Automation Service Account
**Email:** `ssd-automation-service-account@workspace-automation-ssdspc.iam.gserviceaccount.com`
**Project:** workspace-automation-ssdspc (Google Cloud)
**Storage:** GitHub Secret `GCP_SERVICE_ACCOUNT`

**Use for:**
- GitHub Actions workflows
- Cross-workspace automation
- VPS server operations
- Any automated, unattended processes

See [docs/SERVICE-ACCOUNT.md](docs/SERVICE-ACCOUNT.md) for complete details.

### OAuth (Local Development Only)

**File:** `~/.clasprc.json`
**Command:** `clasp login`

**Use for:**
- Local development and testing
- Manual operations
- Personal Google account access

**Limitations:** Tokens expire after 1 hour - not suitable for automation.

## Project Structure

```
google-sheets-version-control/
│
├── WORKSPACE_GUIDE.md              # This file - entry point
├── README.md                        # Project README
│
├── docs/                            # Complete documentation hub
│   ├── WORKSPACE-MANAGEMENT.md      # Central documentation index ⭐
│   ├── AI-AGENT-ONBOARDING.md       # AI onboarding guide ⭐
│   ├── SYSTEM-ARCHITECTURE.md       # Technical architecture
│   ├── SERVICE-ACCOUNT.md           # Service account details
│   ├── SERVICE-ACCOUNT-SETUP.md     # Service account setup guide
│   ├── DATA-PROTECTION.md           # Backup and recovery
│   ├── DOCUMENTATION-PROCESS.md     # How to document
│   └── ISSUES.md                    # Issue tracking
│
├── production-sheets/               # 588 production sheet backups
│   └── sheet-XXX_NAME/
│       ├── live/                    # Current Apps Script code
│       ├── metadata/                # Metadata and timestamps
│       └── .clasp.json             # Sheet and script IDs
│
├── staging-sheets/                  # Staging environment backups
│
├── config/
│   └── sheet-registry.json          # Master registry (465KB, 588 sheets)
│
├── scripts/                         # Automation scripts
│   ├── log-snapshot-run.js          # Logs to Google Sheets
│   ├── create-snapshot-log.js       # Creates logging sheet
│   └── update-log-formatting.js     # Formats logging sheet
│
├── .github/workflows/
│   └── daily-snapshots.yml          # Automated snapshot workflow
│
└── .git/hooks/
    └── pre-commit                   # Data protection hook
```

## Common Tasks

### View Recent Workflow Runs

```bash
gh run list --limit 10
```

### Trigger Manual Snapshot

```bash
gh workflow run "Daily Sheet Snapshots"
```

### Check System Health

```bash
# Production sheets count (should be 588)
ls -d production-sheets/sheet-* | wc -l

# Config file size (should be 465KB)
ls -lh config/sheet-registry.json

# Git status
git status

# Recent commits
git log --oneline -10
```

### View Snapshot Log

Open in browser:
https://docs.google.com/spreadsheets/d/1KpUhrEtW7-uHHS6GIngiXws0v2aM2wBC5ppyDBnRKxc

### Restore Deleted Files

```bash
# Restore from last commit
git checkout HEAD -- production-sheets/

# Or from specific commit
git checkout <commit-hash> -- production-sheets/
```

## Safety Protocols

### NEVER Do

- ❌ `git add .` - Always specify exact files
- ❌ `git commit --no-verify` - Bypasses protection hooks
- ❌ `git push --force` - Can destroy history
- ❌ Delete production-sheets/ or staging-sheets/ directories
- ❌ Delete config/sheet-registry.json
- ❌ Commit credentials (.clasprc.json, *.json keys)

### ALWAYS Do

- ✅ Read `git status` before committing
- ✅ Stage specific files: `git add path/to/file`
- ✅ Review diffs: `git diff --cached`
- ✅ Pull before pushing: `git pull --rebase origin main`
- ✅ Verify file counts after major operations
- ✅ Document changes in commits and ISSUES.md

## Integration Points

### Current Integrations

- **GitHub → Google Sheets** (Automated logging via service account)
- **Local Development → Google Sheets** (Manual via OAuth/clasp)
- **GitHub Actions → Google Drive** (Code backup via service account)

### Future Integrations (Planned)

- VPS server automation
- Cross-workspace synchronization
- Real-time monitoring
- Automated testing workflows

## Getting Help

### Documentation

1. Check [docs/AI-AGENT-ONBOARDING.md](docs/AI-AGENT-ONBOARDING.md) for quick reference
2. Search [docs/WORKSPACE-MANAGEMENT.md](docs/WORKSPACE-MANAGEMENT.md) for topic
3. Review [docs/ISSUES.md](docs/ISSUES.md) for known problems
4. Read detailed docs in `docs/` directory

### Troubleshooting

1. Run health checks (commands above)
2. Check recent commits: `git log -10`
3. Review workflow logs: `gh run view [run-id] --log`
4. Check [docs/ISSUES.md](docs/ISSUES.md) for similar problems
5. Document new issues you discover

## Contributing

### Documentation Updates

When you:
- Add new automation
- Modify authentication
- Grant service account access
- Change architecture
- Resolve issues

**Follow the [Documentation Process](docs/DOCUMENTATION-PROCESS.md):**

1. Create or update relevant documentation
2. Update `docs/WORKSPACE-MANAGEMENT.md` (central hub)
3. Update related docs
4. Commit with clear message
5. Verify documentation is discoverable

### Code Changes

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Document changes
5. Create pull request
6. Merge to main after review

## Links

### Documentation
- [AI Onboarding](docs/AI-AGENT-ONBOARDING.md)
- [Workspace Management](docs/WORKSPACE-MANAGEMENT.md)
- [System Architecture](docs/SYSTEM-ARCHITECTURE.md)
- [Service Account](docs/SERVICE-ACCOUNT.md)
- [Data Protection](docs/DATA-PROTECTION.md)
- [Documentation Process](docs/DOCUMENTATION-PROCESS.md)

### External Resources
- [GitHub Repository](https://github.com/mmaruthurssd/ssd-google-sheets-staging-production)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Daily Snapshot Log](https://docs.google.com/spreadsheets/d/1KpUhrEtW7-uHHS6GIngiXws0v2aM2wBC5ppyDBnRKxc)

---

**Last Updated:** 2025-11-11
**Maintained By:** AI Assistant (Claude Code)
**Questions?** Check [docs/WORKSPACE-MANAGEMENT.md](docs/WORKSPACE-MANAGEMENT.md) for more information.

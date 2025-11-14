# AI Agent Onboarding Guide

## Purpose

This guide helps new AI agents (like Claude Code) quickly understand the SSD Google Sheets automation system and become productive. Read this FIRST when starting a new session or workspace.

**Part of Workspace Management Documentation:**
- This guide is part of a comprehensive workspace management system
- For complete documentation index, see [WORKSPACE-MANAGEMENT.md](WORKSPACE-MANAGEMENT.md)
- For three-location documentation system, see [DOCUMENTATION-SYNC-GUIDE.md](DOCUMENTATION-SYNC-GUIDE.md)
- For root-level overview, see [../WORKSPACE_GUIDE.md](../WORKSPACE_GUIDE.md)

**Three-Location Documentation System:**
- **Local Workspace** - Primary documentation (this location)
- **GitHub Repository** - Version control backup
- **Google Drive** - Team sharing ("AI Development - No PHI/Workspace Management")

## Quick Start Checklist

When you first access this workspace, complete these steps:

- [ ] Read this file (AI-AGENT-ONBOARDING.md) - Quick start guide
- [ ] Read [WORKSPACE-MANAGEMENT.md](WORKSPACE-MANAGEMENT.md) - Central documentation hub
- [ ] Read [SYSTEM-ARCHITECTURE.md](SYSTEM-ARCHITECTURE.md) - Technical architecture
- [ ] Read [SERVICE-ACCOUNT.md](SERVICE-ACCOUNT.md) - Service account details
- [ ] Read [DATA-PROTECTION.md](DATA-PROTECTION.md) - Backup and safety protocols
- [ ] Read [ISSUES.md](ISSUES.md) - Check known issues and ongoing work
- [ ] Run health check commands (see below)
- [ ] Review recent git commits: `git log --oneline -10`
- [ ] Check GitHub Actions status

## Essential Information

### Project Location
```bash
cd "/Users/mmaruthurnew/Desktop/medical-patient-data/Implementation Projects/google-sheets-version-control"
```

### GitHub Repository
```
https://github.com/mmaruthurssd/ssd-google-sheets-staging-production
Branch: main
```

### Key Numbers
- **Production Sheets:** 588
- **Staging Sheets:** Variable
- **Daily Snapshots:** 9 AM & 5 PM Central Time
- **Batch Sizes:** 135, 135, 134 sheets

### Critical Files
- `config/sheet-registry.json` - Master registry (465KB, 588 sheets)
- `.github/workflows/daily-snapshots.yml` - Automated snapshots
- `scripts/log-snapshot-run.js` - Logging to Google Sheets
- `.git/hooks/pre-commit` - Protection against deletions

## Health Check Commands

Run these to verify system health:

```bash
# Check production sheets count
ls -d production-sheets/sheet-* | wc -l
# Expected: 588

# Check config file exists
ls -lh config/sheet-registry.json
# Expected: 465KB

# Check git status
git status
# Should be clean or show only expected changes

# View recent commits
git log --oneline -10

# Check GitHub Actions
gh run list --limit 5

# Check for untracked important files
git status | grep -E "production-sheets|staging-sheets|config"
```

## Authentication System

### Service Account (Production/GitHub Actions)
- **Name:** SSD Automation Service Account
- **Email:** `ssd-automation-service-account@[project-id].iam.gserviceaccount.com`
- **Storage:** GitHub Secret `GCP_SERVICE_ACCOUNT`
- **Purpose:** Automated logging to Google Sheets
- **Scope:** Only sheets explicitly shared with it

### OAuth (Local Development)
- **File:** `~/.clasprc.json`
- **Command:** `clasp login`
- **Scope:** Personal Google account access
- **Purpose:** Local development and manual operations

### When to Use Which
- **Use Service Account:** GitHub Actions workflows, automated logging
- **Use OAuth:** Local development, manual scripts, testing

## Common Tasks

### View Snapshot Log
```bash
# Open the Daily Snapshot Log sheet
# Sheet ID: 1KpUhrEtW7-uHHS6GIngiXws0v2aM2wBC5ppyDBnRKxc
# Location: AI Development - No PHI shared drive
```

### Trigger Manual Snapshot
```bash
gh workflow run "Daily Sheet Snapshots"
```

### Check Recent Workflow Runs
```bash
gh run list --limit 10
```

### Restore Deleted Files (if needed)
```bash
# See docs/DATA-PROTECTION.md for detailed procedures
git checkout HEAD -- production-sheets/
```

### Commit Changes Safely
```bash
# ALWAYS check what you're committing
git status
git diff

# Stage specific files only
git add docs/SYSTEM-ARCHITECTURE.md

# Commit (pre-commit hook will check for mass deletions)
git commit -m "docs: update architecture documentation"

# Push
git push
```

## Safety Protocols

### NEVER Do These Things
1. ❌ `git add .` - Always specify exact files
2. ❌ `git commit --no-verify` - Bypasses protection hooks
3. ❌ `git push --force` - Can destroy history
4. ❌ `git clean -fd` - Deletes untracked files
5. ❌ Delete `production-sheets/` or `staging-sheets/` directories
6. ❌ Delete `config/sheet-registry.json`
7. ❌ Commit credentials (.clasprc.json, *.json keys)

### ALWAYS Do These Things
1. ✅ Read `git status` before committing
2. ✅ Stage specific files: `git add path/to/file`
3. ✅ Review diffs: `git diff --cached`
4. ✅ Check the pre-commit hook output
5. ✅ Pull before pushing: `git pull --rebase origin main`
6. ✅ Verify file counts after major operations
7. ✅ Document changes in commits and ISSUES.md

## Pre-Commit Hook Protection

The repository has an automatic protection system:

**Blocks commits that would:**
- Delete >10 production sheets
- Delete >10 staging sheets
- Delete `config/sheet-registry.json`

**Example output when blocked:**
```
❌ COMMIT BLOCKED: Attempting to delete 588 production sheets!

This commit would delete production sheet data.
```

**To bypass (DANGEROUS - only if intentional):**
```bash
git commit --no-verify -m "message"
```

## Understanding the Data Flow

```
Google Sheets (Source of Truth)
    ↓ clasp pull
Apps Script Code
    ↓ git commit
GitHub Repository (Code Backup)
    ↓ GitHub Actions
Automated Snapshot + Logging
    ↓
Daily Snapshot Log Sheet
```

**Important:** The GitHub repo backs up CODE, not sheet data. If Google Sheets are deleted from Drive, GitHub helps recreate code structure but not data.

## Issue Tracking

### Check Current Issues
```bash
cat docs/ISSUES.md
```

### Report New Issue
Add to `docs/ISSUES.md` with format:
```markdown
## Issue #XXX: Brief Description

**Date Discovered:** YYYY-MM-DD
**Severity:** Critical/High/Medium/Low
**Status:** Open/In Progress/Resolved
**Discovered By:** AI Agent/User Name

**Description:**
[Detailed description]

**Steps to Reproduce:**
1. Step 1
2. Step 2

**Current Workaround:**
[If any]

**Proposed Solution:**
[If known]

**Resolution:**
[When resolved]
```

## Quick Reference: File Locations

```
Repository Root: /Users/mmaruthurnew/Desktop/medical-patient-data/Implementation Projects/google-sheets-version-control

Key Directories:
├── production-sheets/        # 588 production backups
├── staging-sheets/           # Staging backups
├── config/                   # sheet-registry.json
├── scripts/                  # Automation scripts
├── docs/                     # All documentation
├── .github/workflows/        # GitHub Actions
└── .git/hooks/              # Pre-commit protection

Key Files:
├── docs/SYSTEM-ARCHITECTURE.md      # System overview
├── docs/AI-AGENT-ONBOARDING.md      # This file
├── docs/DATA-PROTECTION.md          # Backup/recovery
├── docs/SERVICE-ACCOUNT-SETUP.md    # Authentication setup
├── docs/ISSUES.md                   # Known issues
├── .gitignore                       # Credential protection
└── README.md                        # Project README
```

## Common Scenarios

### Scenario 1: User Asks to Run a Snapshot

```bash
# Check current status
git status

# Trigger workflow
gh workflow run "Daily Sheet Snapshots"

# Monitor progress
gh run list --limit 1
gh run watch [run-id]
```

### Scenario 2: User Reports Logging Failure

1. Check `docs/ISSUES.md` for known authentication issues
2. Verify service account setup in `docs/SERVICE-ACCOUNT-SETUP.md`
3. Check GitHub Secret `GCP_SERVICE_ACCOUNT` exists
4. Review workflow logs: `gh run view [run-id] --log`
5. Document new findings in `ISSUES.md`

### Scenario 3: User Wants to Add New Sheets

1. Update `config/sheet-registry.json`
2. Run snapshot to back up new sheets
3. Commit changes: `git add config/sheet-registry.json production-sheets/`
4. Push to GitHub

### Scenario 4: Recovery Needed

See `docs/DATA-PROTECTION.md` for detailed procedures:
- Local file recovery
- GitHub repository recovery
- Google Sheets code recovery

## Version Control Best Practices

### Good Commit Messages

```bash
# Good examples
git commit -m "docs: add AI agent onboarding guide"
git commit -m "feat: add service account authentication"
git commit -m "fix: correct timezone to Central Time"
git commit -m "chore: automated snapshot 2025-11-11 14:15:59"

# Bad examples
git commit -m "update"
git commit -m "fix stuff"
git commit -m "changes"
```

### Commit Message Prefixes

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation only
- `chore:` - Automated/maintenance
- `refactor:` - Code restructuring
- `test:` - Testing related
- `style:` - Formatting changes

## Escalation

If you encounter an issue you can't resolve:

1. **Document it** in `docs/ISSUES.md`
2. **Preserve state** - Don't make changes that could worsen it
3. **Gather information:**
   - Git status
   - Recent commits
   - Error messages
   - Workflow logs
4. **Notify user** with full context

## Integration with Other Systems

### Future Integrations (Planned)
- VPS server automation
- Cross-workspace synchronization
- Real-time monitoring
- Automated testing

### Current Integration Points
- GitHub Actions → Google Sheets (logging)
- Local development → Google Sheets (clasp)
- GitHub → Git repository (version control)

## Helpful Commands Reference

```bash
# Git operations
git status                              # Check repository state
git log --oneline -10                   # Recent commits
git diff                                # Unstaged changes
git diff --cached                       # Staged changes
git checkout HEAD -- [file]             # Restore file from last commit

# GitHub CLI
gh run list --limit 10                  # Recent workflow runs
gh run view [run-id]                    # View run details
gh run watch [run-id]                   # Watch run in real-time
gh workflow run "Daily Sheet Snapshots" # Trigger manual run

# File system
ls -d production-sheets/sheet-* | wc -l # Count production sheets
ls -lh config/sheet-registry.json       # Check config file
find production-sheets -name "Code.js" | wc -l # Count code files

# clasp (requires OAuth)
clasp login                             # Authenticate
clasp pull                              # Pull code from Google
clasp push                              # Push code to Google
```

## Learning Resources

- [Google Sheets API Documentation](https://developers.google.com/sheets/api)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [clasp Documentation](https://github.com/google/clasp)
- [Git Documentation](https://git-scm.com/doc)

## Session Continuity

At the end of your session, if there are ongoing tasks:

1. Update `docs/ISSUES.md` with current status
2. Commit documentation changes
3. Leave clear notes for next AI agent
4. Ensure repository is in clean state (no uncommitted critical changes)

## Questions to Ask

If you're unsure about something:

- "What's the current status of [system/feature/issue]?"
- "Can you show me the Daily Snapshot Log sheet?"
- "Are there any pending tasks I should know about?"
- "When was the last successful snapshot?"

---

**Welcome to the SSD Google Sheets Automation System!**

You now have the knowledge to work effectively in this environment. When in doubt, consult the documentation and err on the side of safety.

**Last Updated:** 2025-11-11
**Maintained By:** AI Assistant (Claude Code)

# GitHub Actions Troubleshooting Log

**Project:** medical-patient-data
**Created:** November 13, 2025
**Purpose:** Track and document GitHub Actions setup issues to prevent recurrence

---

## Issue #1: Workflows Must Be at Repository Root

**Date:** November 13, 2025
**Status:** RESOLVED
**Severity:** High
**Category:** Workflow Discovery

### Problem Description

GitHub Actions workflows existed locally and were committed to git, but GitHub returned "404: workflow not found on the default branch" errors and scheduled workflows did not run automatically.

### Symptom

```
HTTP 404: workflow daily-snapshots.yml not found on the default branch
```

Workflows appeared in local directory structure but were not visible or executable on GitHub.

### Root Cause

**GitHub Actions only discovers workflows in `.github/workflows/` at the repository root.**

Workflows were incorrectly placed in:
```
Implementation Projects/google-sheets-version-control/.github/workflows/
```

GitHub does NOT scan subdirectories for workflow files, even if they are committed to git. This is a platform limitation, not configurable.

### Solution

1. **Verify workflow location:**
   ```bash
   ls -la .github/workflows/
   ```

2. **Move workflows from subdirectory to root:**
   ```bash
   mkdir -p .github/workflows
   cp "Implementation Projects/google-sheets-version-control/.github/workflows/"*.yml .github/workflows/
   ```

3. **Commit and push:**
   ```bash
   git add .github/workflows/
   git commit -m "fix: move GitHub Actions workflows to repository root

GitHub Actions only discovers workflows in .github/workflows/ at the
repository root, not in subdirectories."
   git push
   ```

4. **Verify workflows are active:**
   ```bash
   gh workflow list
   ```

   All workflows should show status "active"

### Affected Workflows

- `daily-snapshots.yml` - 2x daily sheet snapshots (9am and 5pm PST)
- `backup-to-gcs.yml` - Google Cloud Storage backups
- `sync-docs-to-drive.yml` - Documentation sync to Google Drive
- `test-drive-access.yml` - Service account access testing

### Prevention Checklist

Before deploying GitHub Actions workflows:

- [ ] Verify workflows are at `.github/workflows/` (repository root)
- [ ] Confirm NOT in subdirectories or nested project folders
- [ ] After commit/push, run `gh workflow list` to verify "active" status
- [ ] Check for 404 errors in GitHub web interface
- [ ] For scheduled workflows, add `workflow_dispatch` for manual testing
- [ ] Account for timezone (GitHub Actions uses UTC, not local time)

### Related Commits

- **Fix commit:** `16746df` - "fix: move GitHub Actions workflows to repository root"

### Additional Notes

In monorepo setups like this project, use a single `.github/workflows/` directory at the repository root. Use path filters in workflow configurations to target specific subdirectories if needed:

```yaml
on:
  push:
    paths:
      - 'Implementation Projects/google-sheets-version-control/**'
```

---

## Notes on Learning Optimizer MCP Integration

**Status:** NOT WORKING

Attempted to log this issue to the Learning Optimizer MCP server as requested by user, but encountered errors:

1. **Domain Not Recognized:** "Unknown domain: github-actions-setup"
2. **No Domains Loaded:** `list_domains` returns empty array
3. **Config Files Created:** Domain configuration and knowledge base files were created at:
   - `/Users/mmaruthurnew/Desktop/operations-workspace/configuration/learning-optimizer-configs/github-actions-setup.json`
   - `/Users/mmaruthurnew/Desktop/operations-workspace/configuration/learning-optimizer/github-actions-TROUBLESHOOTING.md`
   - `/Users/mmaruthurnew/Desktop/operations-workspace/configuration/learning-optimizer/github-actions-PRE_FLIGHT_CHECKLIST.md`

**Action Required:** The Learning Optimizer MCP server needs investigation to determine:
- How it loads domain configurations
- Why it's not recognizing the new domain config file
- Whether the server needs to be restarted to pick up new configurations

**Fallback:** This local troubleshooting document serves as interim solution until MCP integration is fixed.

---

_This document will be updated as new GitHub Actions issues are encountered and resolved._

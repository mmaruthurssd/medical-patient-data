# Known Issues - SSD Google Sheets Automation

This document tracks all known issues, their status, and resolutions for the SSD Google Sheets version control and automation system.

---

## Issue #001: OAuth Token Expiration in GitHub Actions

**Date Discovered:** 2025-11-11
**Severity:** High
**Status:** In Progress
**Discovered By:** AI Agent (Claude Code)

**Description:**
GitHub Actions workflow logging fails with "invalid_request" error because OAuth tokens stored in `CLASP_CREDENTIALS` secret expire after 1 hour. Even though the secret was added recently, the access token expires by the time the workflow runs.

**Steps to Reproduce:**
1. Run GitHub Actions workflow with `CLASP_CREDENTIALS` secret
2. Wait for logging step at end of workflow
3. Observe authentication failure with "invalid_request" error

**Impact:**
- Daily snapshot runs complete successfully
- Apps Script code is backed up to GitHub
- BUT logging to Google Sheets fails, leaving no audit trail of run details

**Current Workaround:**
None - logging is currently non-functional in GitHub Actions.

**Proposed Solution:**
Implement service account authentication:
1. Create "SSD Automation Service Account" in Google Cloud Console
2. Download JSON key file
3. Share Daily Snapshot Log sheet with service account email
4. Add JSON key as `GCP_SERVICE_ACCOUNT` GitHub secret
5. Code already updated to support service account authentication

**Resolution:**
Service account setup in progress. Code changes committed in bf3a6d3.

---

## Issue #002: Production Sheets Showing as Untracked in Git

**Date Discovered:** 2025-11-11
**Severity:** Medium
**Status:** Open (Deferred)
**Discovered By:** AI Agent (Claude Code)

**Description:**
Production sheet files exist locally in `production-sheets/` directory but git sometimes shows them as "untracked" instead of "tracked". This creates risk that git may interpret operations as deletions.

**Steps to Reproduce:**
1. Check git status: `git status`
2. Observe production-sheets files listed as untracked (intermittent)

**Impact:**
- Files are physically present and intact
- Near-miss incident where git commit attempted to delete all 3,816 files
- Pre-commit hook successfully blocked the deletion
- Risk remains if underlying tracking issue not resolved

**Current Workaround:**
- Pre-commit hook blocks any commit deleting >10 production/staging sheets
- Always use selective staging: `git add [specific-file]` instead of `git add .`
- Verify git status before every commit

**Proposed Solution:**
Investigation needed to determine why git tracking state is inconsistent. Possible causes:
- .gitignore configuration
- File permissions
- Git index corruption
- Submodule configuration

**Next Steps:**
Deferred to separate discussion about backup strategy and git tracking.

---

## Issue #003: Timezone Inconsistency (RESOLVED)

**Date Discovered:** 2025-11-11
**Severity:** Low
**Status:** Resolved
**Discovered By:** User (mmaruthur)

**Description:**
All timestamp logging was using UTC timezone instead of Central Time (America/Chicago). User is located in Alabama (Central Time zone).

**Impact:**
- Logged timestamps were confusing
- 5-6 hour offset from local time depending on DST

**Solution:**
Updated `scripts/log-snapshot-run.js` to use Central Time with proper DST handling.

**Code Changes:**
```javascript
const centralTime = now.toLocaleString('en-US', {
  timeZone: 'America/Chicago',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false
});
```

**Resolution:**
Fixed in commit 5c55056. All future logs will show Central Time.

---

## Severity Definitions

- **Critical:** System down, data loss risk, blocking all operations
- **High:** Major functionality broken, workaround exists
- **Medium:** Functionality impaired, minimal impact
- **Low:** Cosmetic, minor inconvenience

## Status Definitions

- **Open:** Issue identified, no work started
- **In Progress:** Actively being worked on
- **Blocked:** Waiting on external dependency
- **Resolved:** Issue fixed and verified
- **Closed:** Issue fixed, documented, and archived

---

**Last Updated:** 2025-11-11
**Maintained By:** AI Assistant (Claude Code)

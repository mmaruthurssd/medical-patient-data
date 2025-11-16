# Quick Reference: Alvaro's Sync Checklist

**For comprehensive instructions, see:** [SYNC-INSTRUCTIONS-FOR-ALVARO.md](SYNC-INSTRUCTIONS-FOR-ALVARO.md)

---

## Quick Sync Commands

```bash
# 1. Pull all three repositories
cd ~/Desktop/medical-patient-data && git pull origin main
cd ~/Desktop/operations-workspace && git pull origin main
cd ~/Desktop/mcp-infrastructure && git pull origin main

# 2. Install dependencies
cd ~/Desktop/medical-patient-data/google-workspace-oauth-setup
npm install

# 3. Test OAuth delegation
node test-delegation.js
# Expected: ✅ DELEGATION TEST PASSED!
```

---

## What's New (Must Know)

### 1. OAuth Delegation (CRITICAL)
- **Location:** `google-workspace-oauth-setup/`
- **Test:** Run `node test-delegation.js`
- **Expected:** ✅ DELEGATION TEST PASSED!
- **Service Account:** `configuration/service-accounts/service-account.json`

### 2. Documentation Reorganized
- **Old:** Root-level clutter
- **New:** Organized in `docs/` subdirectories
  - `docs/guides/` - How-to guides
  - `docs/reference/` - Reference documentation
  - `docs/troubleshooting/` - Troubleshooting guides

### 3. Staging Environment (DEV3)
- **Location:** `Implementation Projects/google-sheets-version-control/staging/`
- **Purpose:** Test version control changes before production
- **Rule:** Production is now READ-ONLY, test in DEV3 first

### 4. Audit Logging
- **Location:** `Implementation Projects/google-sheets-version-control/lib/`
- **Files:** `phi-audit-logger.js`, `audit-monitor.js`, `audit-hooks.js`
- **Purpose:** HIPAA-compliant PHI access tracking

### 5. Credential Rotation
- **Location:** `Implementation Projects/google-sheets-version-control/security/credentials/`
- **Check Status:** `bash check-rotation-status.sh`
- **Schedule:** 90-day rotation

---

## Verification Checklist

Quick checklist (full version in comprehensive guide):

- [ ] All three repos pulled successfully
- [ ] OAuth delegation test passes
- [ ] Can read `docs/guides/testing-guide.md`
- [ ] Service account file exists at `configuration/service-accounts/service-account.json`
- [ ] Staging environment docs accessible
- [ ] Audit logging files present
- [ ] npm dependencies installed

---

## Critical Files to Read

1. **SYNC-INSTRUCTIONS-FOR-ALVARO.md** - Comprehensive sync guide
2. **START_HERE.md** - Workspace orientation
3. **DOCUMENTATION-INDEX.md** - Master navigation
4. **docs/guides/testing-guide.md** - Testing procedures
5. **EVENT_LOG.md** - Recent changes

---

## Quick Test Commands

```bash
# Test documentation access
cat ~/Desktop/medical-patient-data/START_HERE.md
cat ~/Desktop/medical-patient-data/docs/guides/testing-guide.md

# Test OAuth
cd ~/Desktop/medical-patient-data/google-workspace-oauth-setup
node test-delegation.js

# Check credential rotation
cd ~/Desktop/medical-patient-data/Implementation\ Projects/google-sheets-version-control/security/credentials
bash check-rotation-status.sh

# Verify staging environment
ls -la ~/Desktop/medical-patient-data/Implementation\ Projects/google-sheets-version-control/staging/
```

---

## Troubleshooting Quick Fixes

**OAuth test fails?**
```bash
# Wait 15-30 minutes for delegation to propagate
# Verify at: https://admin.google.com/ac/owl/domainwidedelegation
```

**Symlinks broken?**
```bash
# Ensure operations-workspace exists at same level
ls -la ~/Desktop/operations-workspace
```

**Documentation not found?**
```bash
# Check new locations
# CONFIGURATION-GUIDE.md moved to: docs/reference/configuration-guide.md
# TESTING-GUIDE.md moved to: docs/guides/testing-guide.md
```

---

## Need Help?

1. Read comprehensive guide: [SYNC-INSTRUCTIONS-FOR-ALVARO.md](SYNC-INSTRUCTIONS-FOR-ALVARO.md)
2. Check troubleshooting section in comprehensive guide
3. Review EVENT_LOG.md for recent changes
4. Create issue document: `SYNC-ISSUES-ALVARO-[DATE].md`

---

**Last Updated:** 2025-11-16
**Full Guide:** SYNC-INSTRUCTIONS-FOR-ALVARO.md (850+ lines)

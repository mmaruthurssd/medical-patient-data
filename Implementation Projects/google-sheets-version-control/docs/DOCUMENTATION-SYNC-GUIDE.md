# Documentation Synchronization Guide

## Purpose

This guide defines how to maintain **coherent documentation** across three locations:
1. **Local Workspace** - `/Users/mmaruthurnew/Desktop/medical-patient-data/Implementation Projects/google-sheets-version-control`
2. **GitHub Repository** - https://github.com/mmaruthurssd/ssd-google-sheets-staging-production
3. **Google Drive** - "Workspace Management" folder in "AI Development - No PHI" shared drive

Following this guide ensures new AI agents can access current documentation regardless of which location they access first, and that all documentation stays synchronized across locations.

## The Three-Location Documentation System

### Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Documentation Ecosystem                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────┐      ┌────────────────┐      ┌───────────┐ │
│  │ Local Workspace│◄────►│     GitHub     │◄────►│Google Drive│ │
│  │   (Primary)    │      │   (Backup)     │      │  (Shared)  │ │
│  └────────────────┘      └────────────────┘      └───────────┘ │
│         │                        │                      │        │
│         │                        │                      │        │
│    Development            Version Control          Team Access  │
│    Quick Access           History                  External Ref │
│    Git Tracked            CI/CD                    Cross-Workspace│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Location Purposes

| Location | Purpose | Update Frequency | Access Method |
|----------|---------|-----------------|---------------|
| **Local Workspace** | Primary development, quick AI access | Real-time during work | Direct file system |
| **GitHub** | Version control, backup, CI/CD reference | Every commit | Git push |
| **Google Drive** | Team sharing, cross-workspace reference | Periodic sync | Service account API |

## Documentation Storage Matrix

### What Goes Where

| Documentation Type | Local | GitHub | Google Drive | Notes |
|-------------------|-------|--------|--------------|-------|
| **Technical Docs** (SYSTEM-ARCHITECTURE.md) | ✅ Primary | ✅ Versioned | ✅ Exported | Full sync |
| **Process Docs** (SERVICE-ACCOUNT.md) | ✅ Primary | ✅ Versioned | ✅ Exported | Full sync |
| **AI Onboarding** (AI-AGENT-ONBOARDING.md) | ✅ Primary | ✅ Versioned | ✅ Exported | Full sync |
| **Workspace Management Hub** (WORKSPACE-MANAGEMENT.md) | ✅ Primary | ✅ Versioned | ✅ Exported | Full sync |
| **Documentation Process** (DOCUMENTATION-PROCESS.md) | ✅ Primary | ✅ Versioned | ✅ Exported | Full sync |
| **Issues Tracking** (ISSUES.md) | ✅ Primary | ✅ Versioned | ❌ No | Too dynamic |
| **Scripts** (.js, .sh) | ✅ Primary | ✅ Versioned | ❌ No | Code only |
| **Config Files** (sheet-registry.json) | ✅ Primary | ✅ Versioned | ❌ No | Code only |
| **Project Status** (README.md) | ✅ Primary | ✅ Versioned | ✅ Summary | Summary only in Drive |
| **Implementation Projects Tracking** | ✅ Primary | ✅ Versioned | ✅ Index | Project index in Drive |
| **External Brain References** | ✅ Primary | ✅ Versioned | ✅ Exported | Links and integration docs |

### Google Drive Folder Structure

```
AI Development - No PHI (Shared Drive)
├── Workspace Management/
│   ├── Core Documentation/
│   │   ├── WORKSPACE-MANAGEMENT.md (exported from GitHub)
│   │   ├── AI-AGENT-ONBOARDING.md (exported from GitHub)
│   │   ├── SYSTEM-ARCHITECTURE.md (exported from GitHub)
│   │   ├── SERVICE-ACCOUNT.md (exported from GitHub)
│   │   ├── DATA-PROTECTION.md (exported from GitHub)
│   │   └── DOCUMENTATION-PROCESS.md (exported from GitHub)
│   ├── Implementation Projects/
│   │   ├── PROJECT-INDEX.md (generated from Implementation Projects folder)
│   │   └── [Project summaries]
│   ├── External Brain Integration/
│   │   ├── EXTERNAL-BRAIN-SETUP.md
│   │   └── EXTERNAL-BRAIN-USAGE.md
│   └── Quick Reference/
│       ├── QUICK-START.md (condensed version)
│       └── COMMON-COMMANDS.md (quick reference)
├── Daily Snapshot Log - SSD Google Sheets
└── [Other automation sheets]
```

## Synchronization Workflow

### Standard Workflow (For Most Changes)

**When you update documentation locally:**

```bash
# 1. Update local documentation
# Edit docs/*.md files

# 2. Commit to GitHub (automatic sync)
git add docs/
git commit -m "docs: [description of changes]"
git push

# 3. Sync to Google Drive (periodic - see below)
# Happens automatically via scheduled job or manual trigger
```

### Periodic Google Drive Sync

**Two sync methods:**

#### Method 1: Automated Sync (Future - Recommended)
- **Frequency:** Daily (after successful snapshots)
- **Trigger:** GitHub Actions workflow
- **Authentication:** Service account
- **Files:** Core documentation only (see matrix above)

#### Method 2: Manual Sync (Current)
- **When:** After significant documentation updates
- **How:** Use service account script (see below)
- **Files:** Core documentation

### Manual Google Drive Sync Process

```bash
# Navigate to project
cd "/Users/mmaruthurnew/Desktop/medical-patient-data/Implementation Projects/google-sheets-version-control"

# Run sync script (to be created)
node scripts/sync-docs-to-drive.js

# Or use clasp to push specific docs (temporary method)
# This requires manual upload to Drive folder
```

## Documentation Update Checklist

### For Any Documentation Update

When you update documentation, follow this checklist:

- [ ] **1. Update Local Files**
  - Edit relevant documentation in `docs/` folder
  - Update "Last Updated" date
  - Update WORKSPACE-MANAGEMENT.md if adding new doc

- [ ] **2. Commit to GitHub**
  ```bash
  git add docs/[files]
  git commit -m "docs: [clear description]"
  git push
  ```

- [ ] **3. Verify GitHub Update**
  ```bash
  # Check that files are visible on GitHub
  gh repo view --web
  ```

- [ ] **4. Sync to Google Drive** (if applicable)
  - For major updates: Run manual sync
  - For minor updates: Will sync on next automated run
  - See "What Goes Where" matrix above

- [ ] **5. Update Related Documentation**
  - Cross-check references in other docs
  - Update implementation projects tracking if needed

- [ ] **6. Verify Coherence**
  - Local files up to date ✅
  - GitHub shows latest commit ✅
  - Google Drive will sync ✅

## Implementation Projects Tracking

### Purpose

The "Implementation Projects" folder in the local workspace tracks active projects being implemented. Documentation should reference these projects and vice versa.

### Structure

```
Implementation Projects/
├── google-sheets-version-control/    # This project
├── [other-project-1]/
├── [other-project-2]/
└── PROJECT-INDEX.md                  # Index of all projects
```

### Documentation Integration

**In Workspace Management:**
- Link to Implementation Projects folder
- Reference active projects
- Track project status in WORKSPACE-MANAGEMENT.md

**In Google Drive:**
- Export PROJECT-INDEX.md to Drive
- Keep summary of active projects
- Link Drive docs back to GitHub projects

### Tracking Active Projects

When adding a new implementation project:

1. Create project folder in `Implementation Projects/`
2. Add entry to `PROJECT-INDEX.md`
3. Update `docs/WORKSPACE-MANAGEMENT.md` if significant
4. Sync PROJECT-INDEX.md to Google Drive
5. Document in External Brain if needed

## External Brain Integration

### Purpose

The External Brain system tracks knowledge, patterns, and learnings across all projects. Documentation should be indexed in the External Brain for cross-project reference.

### Integration Points

**From Documentation to External Brain:**
- Service account details → Searchable knowledge
- Process documentation → Reusable patterns
- Issue resolutions → Learning database

**From External Brain to Documentation:**
- Reference External Brain patterns in docs
- Link to External Brain knowledge base
- Use External Brain for cross-project queries

### Documentation References

Key documentation that should be indexed in External Brain:
- SERVICE-ACCOUNT.md - Authentication patterns
- DOCUMENTATION-PROCESS.md - Documentation standards
- ISSUES.md - Problem/solution patterns
- SYSTEM-ARCHITECTURE.md - Architecture patterns

## Coherence Verification

### Quick Coherence Check

Run these checks to verify all three locations are synchronized:

```bash
# 1. Check local documentation exists
ls -lh docs/*.md

# 2. Check GitHub is up to date
git status
git log --oneline -5

# 3. Check Google Drive (manual or via API)
# Use service account to list files in Workspace Management folder
node scripts/verify-drive-sync.js

# 4. Check last sync timestamp
cat docs/.last-drive-sync  # Timestamp of last Drive sync
```

### Comprehensive Coherence Audit

Perform monthly (or after major updates):

1. **Local ↔ GitHub Check:**
   ```bash
   git status  # Should be clean
   git diff origin/main  # Should show no differences
   ```

2. **GitHub ↔ Google Drive Check:**
   - Compare file modification dates
   - Verify core docs are present in Drive
   - Check for outdated files

3. **Documentation Links Check:**
   - Verify all internal links work
   - Check cross-references are accurate
   - Ensure WORKSPACE-MANAGEMENT.md indexes all docs

4. **Update Timestamps:**
   - Update "Last Updated" dates
   - Update sync timestamps
   - Document any discrepancies

## Troubleshooting Sync Issues

### Issue: Google Drive Out of Sync

**Symptoms:**
- Drive docs are outdated
- Missing recent documentation updates

**Solution:**
```bash
# Manual sync
node scripts/sync-docs-to-drive.js --force

# Or re-upload specific files
# Upload to "AI Development - No PHI/Workspace Management/Core Documentation/"
```

### Issue: GitHub Ahead of Local

**Symptoms:**
- GitHub has commits not in local workspace
- `git status` shows "behind origin/main"

**Solution:**
```bash
# Pull latest changes
git pull --rebase origin main
```

### Issue: Local Changes Not in GitHub

**Symptoms:**
- Local files modified but not on GitHub
- `git status` shows unstaged changes

**Solution:**
```bash
# Commit and push
git add docs/
git commit -m "docs: [description]"
git push
```

### Issue: Conflicting Documentation

**Symptoms:**
- Different information in different locations
- Unclear which version is authoritative

**Resolution:**
1. **Local workspace is ALWAYS authoritative** (source of truth)
2. Update local documentation to be correct
3. Commit to GitHub
4. Sync to Google Drive
5. Document resolution in ISSUES.md

## Service Account Access for Google Drive

### Current Setup

**Service Account:** ssd-automation-service-account@workspace-automation-ssdspc.iam.gserviceaccount.com

**Google Drive Access:**
- ✅ "AI Development - No PHI" shared drive (Editor access needed)
- ✅ "Workspace Management" folder (Editor access needed)
- ✅ Daily Snapshot Log sheet (Editor access - already granted)

### Granting Drive Access

To grant service account access to Workspace Management folder:

1. Open Google Drive: https://drive.google.com
2. Navigate to: AI Development - No PHI / Workspace Management
3. Right-click folder → Share
4. Add: `ssd-automation-service-account@workspace-automation-ssdspc.iam.gserviceaccount.com`
5. Permission: Editor
6. Uncheck "Notify people"
7. Click "Share"

### Verification

```bash
# Test service account can access Drive folder
node scripts/test-drive-access.js
```

## Automation Scripts (To Be Created)

### sync-docs-to-drive.js

**Purpose:** Sync core documentation from local/GitHub to Google Drive

**Usage:**
```bash
# Sync all core docs
node scripts/sync-docs-to-drive.js

# Force full sync (overwrite Drive versions)
node scripts/sync-docs-to-drive.js --force

# Sync specific file
node scripts/sync-docs-to-drive.js --file docs/SERVICE-ACCOUNT.md
```

**What it does:**
1. Reads core documentation files (see matrix above)
2. Converts markdown to Google Docs format (or uploads as .md)
3. Uploads/updates files in Drive Workspace Management folder
4. Updates .last-drive-sync timestamp
5. Logs sync activity

### verify-drive-sync.js

**Purpose:** Verify Google Drive is synchronized with local/GitHub

**Usage:**
```bash
node scripts/verify-drive-sync.js
```

**Output:**
```
✅ WORKSPACE-MANAGEMENT.md - Synced (2025-11-11)
✅ AI-AGENT-ONBOARDING.md - Synced (2025-11-11)
❌ SERVICE-ACCOUNT.md - Out of date (Drive: 2025-11-10, Local: 2025-11-11)
⚠️  SYSTEM-ARCHITECTURE.md - Not found in Drive
```

### generate-project-index.js

**Purpose:** Generate PROJECT-INDEX.md from Implementation Projects folder

**Usage:**
```bash
node scripts/generate-project-index.js
```

**What it does:**
1. Scans Implementation Projects folder
2. Reads README.md or metadata from each project
3. Generates PROJECT-INDEX.md with:
   - Project name
   - Status
   - Last updated
   - Brief description
   - Links to documentation

## Best Practices

### For AI Agents

**When starting a new session:**

1. **Read local documentation first:**
   - Start with `docs/AI-AGENT-ONBOARDING.md`
   - Read `docs/WORKSPACE-MANAGEMENT.md`

2. **Verify GitHub is current:**
   ```bash
   git status
   git pull
   ```

3. **Check for updates:**
   - Review recent commits
   - Check ISSUES.md for ongoing work

4. **When making changes:**
   - Update local documentation
   - Commit to GitHub immediately
   - Note if Drive sync needed in commit message

**Example commit messages:**
```bash
# Indicates Drive sync needed
git commit -m "docs: add new automation process (sync-to-drive)"

# No Drive sync needed (minor update)
git commit -m "docs: fix typo in SERVICE-ACCOUNT.md"
```

### For Documentation Writers

1. **Always update local first** - Local is source of truth
2. **Commit frequently** - Don't let docs get stale
3. **Use clear commit messages** - Help others understand changes
4. **Update WORKSPACE-MANAGEMENT.md** - Keep the hub current
5. **Verify links** - Broken links reduce discoverability
6. **Include timestamps** - "Last Updated" dates are critical
7. **Cross-reference** - Link related documentation
8. **Test commands** - Ensure code examples work

### Documentation Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                    Documentation Lifecycle                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Create/Update Local ──► 2. Test/Verify                 │
│         ▲                            │                       │
│         │                            ▼                       │
│  7. Monitor Usage      3. Commit to GitHub                  │
│         ▲                            │                       │
│         │                            ▼                       │
│  6. Sync to Drive  ◄──── 4. Push to Remote                 │
│         ▲                            │                       │
│         │                            ▼                       │
│  └──────────────── 5. Verify in GitHub ─────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Future Enhancements

### Planned Improvements

1. **Automated Drive Sync**
   - GitHub Actions workflow
   - Runs after successful documentation updates
   - Uses service account
   - Reports sync status

2. **Documentation Dashboard**
   - Google Sheet tracking doc status across locations
   - Shows sync dates, versions, discrepancies
   - Automated health checks

3. **Bidirectional Sync**
   - Support updates from Google Drive
   - Conflict resolution
   - Merge documentation edited in multiple locations

4. **Documentation Search**
   - Cross-location search
   - Indexed in External Brain
   - Quick reference lookup

5. **Version Tracking**
   - Track documentation versions across locations
   - Show diff between locations
   - Roll back to previous versions

## Related Documentation

- [Workspace Management Hub](WORKSPACE-MANAGEMENT.md) - Central documentation index
- [Documentation Process](DOCUMENTATION-PROCESS.md) - How to document processes
- [AI Agent Onboarding](AI-AGENT-ONBOARDING.md) - Quick start for new AI sessions
- [Service Account](SERVICE-ACCOUNT.md) - Service account details for automation
- [System Architecture](SYSTEM-ARCHITECTURE.md) - Complete system architecture

## Quick Reference

### Daily Workflow

```bash
# 1. Morning: Check for updates
cd "/Users/mmaruthurnew/Desktop/medical-patient-data/Implementation Projects/google-sheets-version-control"
git pull
cat docs/ISSUES.md  # Check ongoing work

# 2. During work: Update docs as you go
# Edit docs/*.md files

# 3. End of work: Commit changes
git add docs/
git commit -m "docs: [what you changed]"
git push

# 4. Weekly: Verify sync
node scripts/verify-drive-sync.js
```

### Emergency Recovery

If documentation is lost or corrupted:

1. **Recover from GitHub:**
   ```bash
   git checkout HEAD -- docs/
   ```

2. **Recover from specific commit:**
   ```bash
   git log --oneline docs/
   git checkout <commit-hash> -- docs/
   ```

3. **Recover from Google Drive:**
   - Download files from "Workspace Management" folder
   - Compare with local/GitHub versions
   - Restore missing content

---

**Last Updated:** 2025-11-11
**Maintained By:** AI Assistant (Claude Code)
**Review Frequency:** Monthly or when sync process changes
**Next Review:** 2025-12-11

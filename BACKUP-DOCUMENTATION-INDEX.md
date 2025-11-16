# Backup System Documentation Index

**Last Updated**: 2025-11-16
**Purpose**: Master index for all backup system documentation across all 6 layers

---

## Quick Links

### Most Important Documents (Start Here)

1. **[Master Troubleshooting Guide](docs/troubleshooting/BACKUP-SYSTEM-TROUBLESHOOTING.md)** ⭐
   - Comprehensive troubleshooting for all 6 backup layers
   - Historical issues with solutions and prevention strategies
   - Best practices and checklists
   - Quick reference commands
   - **READ THIS FIRST** when encountering backup issues

2. **[Git Commit Safety Checklist](docs/GIT-COMMIT-SAFETY-CHECKLIST.md)**
   - Pre-commit checklist to prevent PHI/secrets exposure
   - Post-commit verification steps
   - Recovery procedures

3. **[Google Sheets Backup Troubleshooting](live-practice-management-system/live-practice-management-system/2-Application%20Layer%20(Google%20Sheets)/Google-Sheets-Backup-System/TROUBLESHOOTING.md)**
   - Detailed troubleshooting for Google Sheets snapshot system
   - OAuth token expiration issue (November 2025) - RESOLVED
   - Batch processing and snapshot failure resolution

---

## Documentation by Layer

### Layer 1: Local Git Version Control

**Status**: ✅ Active

**Documentation**:
- Best practices: See "Layer 1" section in [Master Troubleshooting Guide](docs/troubleshooting/BACKUP-SYSTEM-TROUBLESHOOTING.md#layer-1-local-git-version-control)
- Safety checklist: [docs/GIT-COMMIT-SAFETY-CHECKLIST.md](docs/GIT-COMMIT-SAFETY-CHECKLIST.md)

**Key Commands**:
```bash
git status                    # Check repository status
git log --oneline -10         # View recent commits
git diff                      # Review uncommitted changes
```

**Common Issues**: See Master Troubleshooting Guide

---

### Layer 2: GitHub Remote Repository

**Status**: ✅ Active

**Documentation**:
- Best practices: See "Layer 2" section in [Master Troubleshooting Guide](docs/troubleshooting/BACKUP-SYSTEM-TROUBLESHOOTING.md#layer-2-github-remote-repository)
- Workspace setup: [docs/troubleshooting/WORKSPACE-SETUP-ISSUES.md](docs/troubleshooting/WORKSPACE-SETUP-ISSUES.md)
- Workspace sync: [docs/troubleshooting/WORKSPACE-SYNC-ISSUES.md](docs/troubleshooting/WORKSPACE-SYNC-ISSUES.md)

**Key Commands**:
```bash
git push origin main          # Push commits to remote
git fetch origin              # Fetch latest changes
gh run list --limit 5         # View recent workflow runs
```

**Workflow Files**:
- Workspace backups: `.github/workflows/workspace-backup-gcs.yml`
- Google Sheets snapshots: `.github/workflows/daily-snapshots.yml`

**Common Issues**: See Master Troubleshooting Guide

---

### Layer 3: Time Machine (macOS)

**Status**: ⏸️ Configured (drive not connected)

**Documentation**:
- Setup and usage: See "Layer 3" section in [Master Troubleshooting Guide](docs/troubleshooting/BACKUP-SYSTEM-TROUBLESHOOTING.md#layer-3-time-machine-macos)

**Key Commands**:
```bash
tmutil latestbackup           # Show latest backup
tmutil listbackups | tail -5  # List recent backups
```

**Current Status**:
- Time Machine is configured but external drive is not mounted
- This layer is optional - other 5 layers provide comprehensive protection
- Connect external drive to activate hourly backups

**Common Issues**: See Master Troubleshooting Guide

---

### Layer 4: Branch Protection

**Status**: ✅ Active

**Documentation**:
- Configuration: See "Layer 4" section in [Master Troubleshooting Guide](docs/troubleshooting/BACKUP-SYSTEM-TROUBLESHOOTING.md#layer-4-branch-protection)

**Key Commands**:
```bash
# Test branch protection (should be rejected)
git push --force origin main

# Check protection settings
gh api repos/:owner/:repo/branches/main/protection | jq .
```

**Protected Branches**: `main` on all 3 repositories

**Common Issues**: None - passive protection, working as designed

---

### Layer 5: GCS Daily Backups

**Status**: ✅ Active

**Documentation**:
- Comprehensive guide: See "Layer 5" section in [Master Troubleshooting Guide](docs/troubleshooting/BACKUP-SYSTEM-TROUBLESHOOTING.md#layer-5-gcs-daily-backups)
- Historical issues: [Master Troubleshooting Guide - Issue #1](docs/troubleshooting/BACKUP-SYSTEM-TROUBLESHOOTING.md#issue-1-gcs-permission-error---storageobjectsdelete-november-2025)

**Key Commands**:
```bash
# Check recent workflow runs
gh run list --workflow=workspace-backup-gcs.yml --limit 5

# List recent backups
gsutil ls gs://ssd-workspace-backups-immutable/medical-patient-data/daily-backups/ | tail -5

# Manually trigger backup
gh workflow run workspace-backup-gcs.yml
```

**Configuration**:
- Workflow: `.github/workflows/workspace-backup-gcs.yml` (in all 3 repos)
- Schedule: 9:00 AM and 5:00 PM PST daily
- Retention: 90 days
- Storage: `gs://ssd-workspace-backups-immutable/`

**Historical Issues**:
- **Issue #1 (2025-11-16)**: GCS permission error - storage.objects.delete
  - **Status**: ✅ RESOLVED
  - **Solution**: Removed redundant metadata update step
  - **Details**: See Master Troubleshooting Guide

**Common Issues**: See Master Troubleshooting Guide

---

### Layer 6: GCS Monthly Archives

**Status**: ✅ Active

**Documentation**:
- Comprehensive guide: See "Layer 6" section in [Master Troubleshooting Guide](docs/troubleshooting/BACKUP-SYSTEM-TROUBLESHOOTING.md#layer-6-gcs-monthly-archives)

**Key Commands**:
```bash
# List all monthly archives
gsutil ls gs://ssd-workspace-backups-immutable/medical-patient-data/monthly-archives/

# Check if this month's archive exists
gsutil ls gs://ssd-workspace-backups-immutable/medical-patient-data/monthly-archives/$(date +%Y-%m)/
```

**Configuration**:
- Same workflow as Layer 5 (automatically creates monthly archive on 1st of month)
- Schedule: 1st of each month
- Retention: **Permanent** (never deleted)
- Storage: `gs://ssd-workspace-backups-immutable/{repo}/monthly-archives/{YYYY-MM}/`

**Common Issues**: See Master Troubleshooting Guide

---

## Related System Documentation

### Google Sheets Backup System

**Status**: ✅ Active (404 production sheets)

**Documentation**:
- **Troubleshooting**: [live-practice-management-system/.../TROUBLESHOOTING.md](live-practice-management-system/live-practice-management-system/2-Application%20Layer%20(Google%20Sheets)/Google-Sheets-Backup-System/TROUBLESHOOTING.md) ⭐
- Implementation: `live-practice-management-system/.../IMPLEMENTATION-SUMMARY.md`
- Authentication: `live-practice-management-system/.../AUTH-SETUP-STEPS.md`

**Workflow**: `.github/workflows/daily-snapshots.yml`

**Historical Issues**:
- **Issue #1 (2025-11-15)**: OAuth token expiration
  - **Status**: ✅ RESOLVED
  - **Solution**: Migrated from clasp (OAuth) to Apps Script API (service account)
  - **Details**: See Google Sheets TROUBLESHOOTING.md

**Key Commands**:
```bash
# Check recent snapshot runs
gh run list --workflow=daily-snapshots.yml --limit 5

# Test API access locally
cd "live-practice-management-system/live-practice-management-system/2-Application Layer (Google Sheets)/Google-Sheets-Backup-System"
node scripts/test-apps-script-api.js

# Manually trigger snapshots
gh workflow run daily-snapshots.yml
```

---

## System Architecture

### Overview Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                    6-Layer Backup Architecture                │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Layer 1: Local Git (continuous)                             │
│            ↓                                                  │
│  Layer 2: GitHub Remote (on push)                            │
│            ↓                                                  │
│  Layer 3: Time Machine (hourly, when connected)              │
│            ↓                                                  │
│  Layer 4: Branch Protection (passive, always on)             │
│            ↓                                                  │
│  Layer 5: GCS Daily Backups (9 AM & 5 PM PST)               │
│            ↓                                                  │
│  Layer 6: GCS Monthly Archives (1st of month, permanent)    │
│                                                               │
└──────────────────────────────────────────────────────────────┘

Additional System:
┌──────────────────────────────────────────────────────────────┐
│  Google Sheets Backup: 404 production sheets (9 AM & 5 PM)  │
│  - Uses Apps Script API with service account auth           │
│  - 3 batches (135 + 135 + 134 sheets)                       │
│  - Commits to GitHub (part of Layer 2)                      │
└──────────────────────────────────────────────────────────────┘
```

### Protected Repositories

1. **medical-patient-data**
   - Live practice management system
   - Google Sheets backup system (404 sheets)
   - PHI-sensitive data (protected by .gitignore)
   - Latest commit: See `git log -1`

2. **operations-workspace**
   - Shared documentation (symlinked to other repos)
   - MCP development templates
   - Planning and future ideas
   - Latest commit: See `git log -1`

3. **mcp-infrastructure**
   - 28+ MCP server projects
   - Development and local instances
   - Automation tools
   - Latest commit: See `git log -1`

---

## Emergency Procedures

### Complete Backup System Failure (All Layers Down)

**Likelihood**: Extremely low (would require simultaneous failure of 6 independent systems)

**Recovery Order**:
1. Check if at least one layer is accessible
2. Restore from most recent available layer (see emergency restore procedures below)
3. Verify integrity of restored data
4. Re-establish broken layers starting from Layer 1 (Local Git)
5. Document incident and update troubleshooting guide

### Emergency Restore Procedures

**From Local Git** (fastest, most recent):
```bash
# Restore specific file
git checkout HEAD -- path/to/file

# Undo last commit
git reset HEAD~1
```

**From GitHub Remote** (recent, requires internet):
```bash
# Reset to remote state
git fetch origin main
git reset --hard origin/main
```

**From GCS Backup** (complete workspace, any point in time):
```bash
# List available backups
gsutil ls gs://ssd-workspace-backups-immutable/medical-patient-data/daily-backups/

# Download and verify
gsutil cp gs://ssd-workspace-backups-immutable/medical-patient-data/daily-backups/workspace-medical-patient-data-backup-YYYYMMDD-HHMMSS.tar.gz .
gsutil cp gs://ssd-workspace-backups-immutable/medical-patient-data/daily-backups/workspace-medical-patient-data-backup-YYYYMMDD-HHMMSS.tar.gz.sha256 .

# Verify checksum
sha256sum -c workspace-medical-patient-data-backup-YYYYMMDD-HHMMSS.tar.gz.sha256

# Extract to new directory
mkdir restore-temp
tar -xzf workspace-medical-patient-data-backup-YYYYMMDD-HHMMSS.tar.gz -C restore-temp/
```

**From Time Machine** (if drive connected):
```bash
# Enter Time Machine interface
# Click Time Machine icon → Enter Time Machine
# Navigate to date/time → Select files → Restore
```

---

## Maintenance and Updates

### Regular Maintenance

**Daily** (automated):
- Layer 5 & 6 run twice daily via GitHub Actions
- Google Sheets snapshots run twice daily via GitHub Actions
- Monitor for failure notifications

**Weekly** (manual):
- Review GitHub Actions logs for any failures
- Verify all layers are operational
- Check backup sizes for anomalies

**Monthly** (manual):
- Verify monthly archive created on 1st of month
- Review storage costs
- Test restore procedure from at least one layer

**Quarterly** (manual):
- Full restore test from each layer
- Review and update troubleshooting documentation
- Audit service account permissions

### Updating Documentation

**When to Update**:
- Immediately after resolving any new issue
- After making changes to backup infrastructure
- When discovering new best practices
- During quarterly reviews

**What to Update**:
1. [Master Troubleshooting Guide](docs/troubleshooting/BACKUP-SYSTEM-TROUBLESHOOTING.md) - Add new historical issues
2. This index - Update status, links, or structure changes
3. Layer-specific docs - Update best practices or common issues
4. System documentation - Update SYSTEM-COMPONENTS.md with changes

**Update Process**:
1. Document issue symptom, root cause, solution, prevention
2. Add to appropriate troubleshooting guide
3. Update prevention checklists if needed
4. Update "Last Updated" date
5. Commit with descriptive message: `docs: add troubleshooting for [issue]`

---

## Contact and Support

### Self-Service Resources

1. **Start here**: [Master Troubleshooting Guide](docs/troubleshooting/BACKUP-SYSTEM-TROUBLESHOOTING.md)
2. **Search**: Use `grep -r "symptom" docs/` to search all documentation
3. **Check logs**: Use `gh run view <RUN_ID> --log` for workflow failures
4. **Test restore**: Verify backup integrity by attempting restore

### Escalation Path

**For Critical Issues** (complete backup failure):
1. Review Master Troubleshooting Guide
2. Check GitHub Actions logs
3. Contact system administrator
4. Document issue and update troubleshooting guide after resolution

**For Non-Critical Issues** (single layer failure):
1. Verify other layers are operational
2. Review layer-specific troubleshooting
3. Attempt resolution using documented procedures
4. Document findings if new issue discovered

---

## Appendix

### Service Accounts and Credentials

**GCS Workspace Backups**:
- Service Account: `ssd-automation-service-account@workspace-automation-ssdspc.iam.gserviceaccount.com`
- GitHub Secret: `GCS_SERVICE_ACCOUNT_KEY`
- Permissions: `storage.objects.create`, `storage.objects.read`

**Google Sheets Backup**:
- Service Account: `ssd-automation-service-account@workspace-automation-ssdspc.iam.gserviceaccount.com`
- GitHub Secret: `GCP_SERVICE_ACCOUNT`
- Permissions: Apps Script API read-only, Drive read-only

### Storage Locations

**GCS Bucket**: `gs://ssd-workspace-backups-immutable/`

**Structure**:
```
ssd-workspace-backups-immutable/
├── medical-patient-data/
│   ├── daily-backups/
│   │   ├── workspace-medical-patient-data-backup-YYYYMMDD-HHMMSS.tar.gz
│   │   └── workspace-medical-patient-data-backup-YYYYMMDD-HHMMSS.tar.gz.sha256
│   └── monthly-archives/
│       └── YYYY-MM/
│           ├── workspace-medical-patient-data-backup-YYYYMMDD-HHMMSS.tar.gz
│           └── workspace-medical-patient-data-backup-YYYYMMDD-HHMMSS.tar.gz.sha256
├── operations-workspace/
│   └── [same structure]
└── mcp-infrastructure/
    └── [same structure]
```

**Google Sheets Snapshots**:
- Local: `live-practice-management-system/.../Google-Sheets-Backup-System/production-sheets/`
- GitHub: Committed to repository (part of Layer 2)

### Key Scripts and Tools

**Backup Scripts**:
- GCS backup workflow: `.github/workflows/workspace-backup-gcs.yml`
- Google Sheets snapshots: `scripts/snapshot-all-production.js`
- Test Apps Script API: `scripts/test-apps-script-api.js`

**Utility Commands**:
```bash
# Health check all layers
bash scripts/check-backup-health.sh  # TODO: Create this script

# Verify GCS backups
gsutil ls -l gs://ssd-workspace-backups-immutable/medical-patient-data/daily-backups/ | tail -10

# Check all workflow runs
gh run list --limit 10

# Test service account access
gcloud auth activate-service-account --key-file=/path/to/key.json
gsutil ls gs://ssd-workspace-backups-immutable/
```

---

**End of Backup Documentation Index**

**For questions or issues**: Start with the [Master Troubleshooting Guide](docs/troubleshooting/BACKUP-SYSTEM-TROUBLESHOOTING.md)

**Last Updated**: 2025-11-16

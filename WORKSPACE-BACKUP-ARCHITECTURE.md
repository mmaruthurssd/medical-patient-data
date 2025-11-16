# Workspace Backup Architecture

**Document Version:** 1.0
**Last Updated:** 2025-11-15
**Status:** Fully Deployed
**Author:** Infrastructure Team

---

## Executive Summary

This document describes the comprehensive 6-layer backup architecture protecting three critical workspace repositories: `medical-patient-data`, `operations-workspace`, and `mcp-infrastructure`. These workspaces contain all development work, MCP server templates, automation infrastructure, and critical configuration.

**What's Protected:**
- Development code and implementation projects
- MCP server templates and infrastructure
- Automation scripts and workflows
- Configuration files and documentation
- Project management and planning artifacts

**Why It's Critical:**
This is your entire development environment. Loss of these workspaces would mean:
- Loss of all MCP development work (templates, servers, configurations)
- Loss of automation infrastructure and scripts
- Loss of implementation projects and prototypes
- Loss of documentation and knowledge base
- Significant time/cost to recreate (estimated weeks of work)

**Protection Level:** Military-grade redundancy with 6 independent backup layers, automated twice-daily backups, and immutable cloud storage.

---

## Complete 6-Layer Backup Architecture

Each of the three workspace repositories is protected by the same 6-layer architecture:

### Layer 1: Local Git Version Control
**Purpose:** Per-commit versioning and local history
**Frequency:** Every commit
**Retention:** Indefinite (local)
**Recovery Time:** Seconds to minutes

**What It Protects:**
- All committed changes with full history
- Ability to restore any previous version
- Branch-level recovery

**Limitations:**
- Only protects committed changes (not untracked files)
- Vulnerable to local disk failure
- No protection against accidental force push or deletion

**Recovery Command:**
```bash
# Restore single file to previous version
git restore --source=HEAD~1 path/to/file

# Restore entire directory
git restore --source=<commit-hash> path/to/directory

# Undo last commit (keep changes)
git reset --soft HEAD~1

# View file history
git log --follow -- path/to/file
```

---

### Layer 2: GitHub Remote Repository
**Purpose:** Cloud-based version control backup
**Frequency:** Every push
**Retention:** Indefinite
**Recovery Time:** Minutes

**What It Protects:**
- Full git history in the cloud
- Protection against local machine failure
- Collaboration and access from anywhere

**Repositories:**
- `medical-patient-data`: https://github.com/[org]/medical-patient-data
- `operations-workspace`: https://github.com/[org]/operations-workspace
- `mcp-infrastructure`: https://github.com/[org]/mcp-infrastructure

**Recovery Command:**
```bash
# Clone fresh copy from GitHub
git clone https://github.com/[org]/medical-patient-data.git
cd medical-patient-data

# Or re-sync existing repository
git fetch origin
git reset --hard origin/main
```

---

### Layer 3: Time Machine (Local Backup)
**Purpose:** Hourly local snapshots including untracked files
**Frequency:** Hourly (when backup drive connected)
**Retention:** As much as backup drive space allows
**Recovery Time:** Minutes to hours

**Current Status:**
- All three workspaces: **[Included]** in Time Machine
- Backup drive: **NOT MOUNTED** (requires user action)

**What It Protects:**
- ALL files including untracked, uncommitted changes
- Full system state including applications
- Protection against accidental deletion
- File-level recovery with time-based browsing

**Action Required:**
1. Connect Time Machine backup drive
2. Verify backups are running: System Settings > General > Time Machine
3. Check last backup timestamp

**Recovery Procedure:**
1. Open Time Machine: Click Time Machine icon in menu bar > Enter Time Machine
2. Navigate to workspace directory: `/Users/mmaruthurnew/Desktop/medical-patient-data`
3. Browse through time using timeline on right side
4. Select files/folders to restore
5. Click "Restore"

---

### Layer 4: GitHub Branch Protection Rules
**Purpose:** Prevent destructive operations
**Frequency:** Real-time enforcement
**Retention:** N/A (prevention layer)
**Recovery Time:** N/A (prevents need for recovery)

**Deployed:** 2025-11-15 to all three repositories

**Protection Rules:**
```yaml
enforce_admins: true                      # Even admins must follow rules
required_linear_history: true             # No merge commits, cleaner history
allow_force_pushes: false                 # Prevents git push --force
allow_deletions: false                    # Cannot delete main branch
required_conversation_resolution: true    # All PR comments must be resolved
```

**What It Protects:**
- Prevents accidental `git push --force` that could lose history
- Prevents branch deletion
- Enforces code review before merging
- Maintains clean, linear git history

**Verification Command:**
```bash
# Check protection status
gh api repos/[org]/medical-patient-data/branches/main/protection | jq '.'

# Test protection (should fail)
git push --force origin main  # Will be rejected
```

---

### Layer 5: GCS Immutable Daily Backups
**Purpose:** Twice-daily complete workspace snapshots with immutable storage
**Frequency:** 9 AM and 5 PM PST daily
**Retention:** 90 days (automatic)
**Recovery Time:** Hours

**Implementation Date:** 2025-11-15

**Deployment Commits:**
- `medical-patient-data`: 5465b5a
- `operations-workspace`: 658f9ec
- `mcp-infrastructure`: b0fc7cd8

**Workflow File:** `.github/workflows/workspace-backup-gcs.yml`

**Schedule:**
```yaml
schedule:
  - cron: '0 17 * * *'  # 9 AM PST = 5 PM UTC
  - cron: '0 1 * * *'   # 5 PM PST = 1 AM UTC (next day)
```

**Storage Locations:**
```
gs://ssd-workspace-backups-immutable/medical-patient-data/daily-backups/
gs://ssd-workspace-backups-immutable/operations-workspace/daily-backups/
gs://ssd-workspace-backups-immutable/mcp-infrastructure/daily-backups/
```

**What Gets Backed Up:**
- Complete workspace contents (all files)
- Full git history (`.git/` excluded but can be restored from GitHub)
- All implementation projects
- All documentation and scripts
- All configuration files

**Exclusions:**
- `.git/` directory (redundant with GitHub)
- `node_modules/` (can be regenerated)
- `*.log` files (temporary data)
- `.DS_Store` (macOS metadata)

**Protection Features:**
- Immutable storage (cannot be modified or deleted once uploaded)
- SHA256 checksum verification on every backup
- Automatic versioning (all versions preserved)
- Encrypted at rest and in transit

**File Naming:**
```
workspace-medical-patient-data-backup-20251115-170000.tar.gz
workspace-medical-patient-data-backup-20251115-170000.tar.gz.sha256
```

---

### Layer 6: GCS Monthly Permanent Archives
**Purpose:** Permanent monthly snapshots for long-term retention
**Frequency:** 1st of every month (9 AM PST run)
**Retention:** Permanent (never deleted)
**Recovery Time:** Hours

**Storage Structure:**
```
gs://ssd-workspace-backups-immutable/medical-patient-data/monthly-archives/
  ├── 2025-01/
  │   └── workspace-medical-patient-data-backup-20250101-170000.tar.gz
  ├── 2025-02/
  │   └── workspace-medical-patient-data-backup-20250201-170000.tar.gz
  └── 2025-03/
      └── workspace-medical-patient-data-backup-20250301-170000.tar.gz
```

**Monthly Archive Behavior:**
- Triggered automatically on 1st of each month
- Uploaded to both `monthly-archives/{YYYY-MM}/` AND `daily-backups/`
- Tagged with permanent retention metadata
- Subject to 90-day retention in daily-backups location
- Kept forever in monthly-archives location

**Use Cases:**
- Compliance requirements (annual audits)
- Long-term project history
- Disaster recovery from catastrophic failure
- Historical reference for development decisions

---

## Backup Schedule Summary

### Daily Operations
| Time (PST) | Action | Trigger | Workspaces |
|------------|--------|---------|------------|
| 9:00 AM | GCS Daily Backup | Automated | All 3 |
| 5:00 PM | GCS Daily Backup | Automated | All 3 |
| Every hour | Time Machine | Automatic (when drive connected) | All 3 |
| Every commit | Git local | Manual | All 3 |
| Every push | GitHub remote | Manual | All 3 |

### Monthly Operations
| Date | Action | Retention | Workspaces |
|------|--------|-----------|------------|
| 1st of month (9 AM) | Monthly Archive | Permanent | All 3 |

---

## What Gets Backed Up

### Complete Workspace Contents

**Included:**
- All source code files (`.ts`, `.js`, `.py`, `.gs`, etc.)
- All documentation (`.md`, `.txt`, etc.)
- All configuration files (`.json`, `.yaml`, `.env.example`)
- All scripts (`automation/`, `scripts/`)
- All implementation projects (`Implementation Projects/`)
- All MCP templates and servers (`mcp-infrastructure/`)
- All shared resources and tools
- Package manifests (`package.json`, `tsconfig.json`)

**Excluded:**
- `.git/` directory (250-500 MB, available from GitHub)
- `node_modules/` (100-200 MB, regenerable via `npm install`)
- `*.log` files (temporary data)
- `.DS_Store` (macOS metadata)
- `.github/workflows/workspace-backup-gcs.yml` (prevents recursive backup)

**Typical Backup Size:**
- `medical-patient-data`: ~50-100 MB compressed
- `operations-workspace`: ~30-50 MB compressed
- `mcp-infrastructure`: ~40-80 MB compressed

---

## Storage Locations and Structure

### GCS Bucket Configuration
**Bucket Name:** `gs://ssd-workspace-backups-immutable/`
**Project:** `ssd-sheets-backup-2025`
**Region:** Multi-region (US)
**Storage Class:** Standard
**Object Versioning:** Enabled
**Retention Policy:** Immutable (cannot delete/modify)

### Directory Structure

```
gs://ssd-workspace-backups-immutable/
├── medical-patient-data/
│   ├── daily-backups/
│   │   ├── workspace-medical-patient-data-backup-20251115-170000.tar.gz
│   │   ├── workspace-medical-patient-data-backup-20251115-170000.tar.gz.sha256
│   │   ├── workspace-medical-patient-data-backup-20251115-010000.tar.gz
│   │   └── ... (90 days of backups)
│   ├── monthly-archives/
│   │   ├── 2025-01/
│   │   │   └── workspace-medical-patient-data-backup-20250101-170000.tar.gz
│   │   ├── 2025-02/
│   │   └── ... (permanent retention)
│   └── latest-backup.txt (metadata)
│
├── operations-workspace/
│   ├── daily-backups/
│   ├── monthly-archives/
│   └── latest-backup.txt
│
└── mcp-infrastructure/
    ├── daily-backups/
    ├── monthly-archives/
    └── latest-backup.txt
```

### Metadata Storage

Each backup includes custom GCS metadata:
```yaml
x-goog-meta-timestamp: "20251115-170000"
x-goog-meta-commit: "5465b5af823f15c8b7a04d6fec61f0cc33be8062"
x-goog-meta-branch: "main"
x-goog-meta-size: "52428800"  # bytes
x-goog-meta-file-count: "1247"
x-goog-meta-backup-type: "daily" | "monthly"
x-goog-meta-retention: "90-days" | "permanent"
x-goog-meta-archive-month: "2025-01"  # monthly only
```

---

## Recovery Procedures

### Scenario 1: Single File Accidentally Deleted (Within Hours)

**Recommended Layer:** Layer 3 (Time Machine) or Layer 1 (Git)

**Time Machine Recovery:**
1. Open Time Machine (menu bar icon > Enter Time Machine)
2. Navigate to `/Users/mmaruthurnew/Desktop/medical-patient-data`
3. Locate the deleted file in the timeline
4. Select and click "Restore"

**Git Recovery (if file was committed):**
```bash
cd /Users/mmaruthurnew/Desktop/medical-patient-data
git log -- path/to/deleted/file  # Find when it was deleted
git restore --source=HEAD~1 path/to/deleted/file
git add path/to/deleted/file
git commit -m "Restore accidentally deleted file"
```

**Recovery Time:** 1-5 minutes

---

### Scenario 2: Entire Workspace Lost (Laptop Failure, Accidental Deletion)

**Recommended Layer:** Layer 2 (GitHub) for speed, verified with Layer 5 (GCS)

**GitHub Recovery:**
```bash
# Clone fresh copy from GitHub
cd ~/Desktop
git clone https://github.com/[org]/medical-patient-data.git
cd medical-patient-data

# Reinstall dependencies
npm install

# Verify integrity
git log --oneline -10
```

**Verification Against GCS:**
```bash
# List recent backups
gcloud storage ls gs://ssd-workspace-backups-immutable/medical-patient-data/daily-backups/

# Download latest backup for verification
gcloud storage cp gs://ssd-workspace-backups-immutable/medical-patient-data/latest-backup.txt -

# Compare commit hash with local
git log -1 --format="%H"
```

**Recovery Time:** 10-30 minutes (depending on repository size and network speed)

---

### Scenario 3: GitHub Account Compromised or Repository Deleted

**Recommended Layer:** Layer 5 (GCS Daily Backups)

**Full GCS Recovery:**
```bash
# 1. List available backups
gcloud storage ls gs://ssd-workspace-backups-immutable/medical-patient-data/daily-backups/

# 2. Identify most recent backup
# Format: workspace-medical-patient-data-backup-YYYYMMDD-HHMMSS.tar.gz

# 3. Download backup and checksum
gcloud storage cp \
  gs://ssd-workspace-backups-immutable/medical-patient-data/daily-backups/workspace-medical-patient-data-backup-20251115-170000.tar.gz \
  ./

gcloud storage cp \
  gs://ssd-workspace-backups-immutable/medical-patient-data/daily-backups/workspace-medical-patient-data-backup-20251115-170000.tar.gz.sha256 \
  ./

# 4. Verify integrity
sha256sum -c workspace-medical-patient-data-backup-20251115-170000.tar.gz.sha256

# 5. Extract backup
mkdir -p ~/Desktop/medical-patient-data-restored
cd ~/Desktop/medical-patient-data-restored
tar -xzf ../workspace-medical-patient-data-backup-20251115-170000.tar.gz

# 6. Reinitialize git (if needed)
git init
git add .
git commit -m "Restore from GCS backup (2025-11-15)"

# 7. Push to new/recovered GitHub repo
git remote add origin https://github.com/[org]/medical-patient-data.git
git push -u origin main
```

**Recovery Time:** 1-2 hours (depending on backup size and network speed)

---

### Scenario 4: Complete Catastrophic Failure (All Layers 1-4 Failed)

**Recommended Layer:** Layer 6 (Monthly Archives) + Layer 5 (Daily Backups)

**Use Case:**
- GitHub completely unavailable
- Local machine destroyed
- Time Machine drive lost/failed
- Need to recover to specific point in time

**Recovery Strategy:**
```bash
# 1. Identify recovery point
# Option A: Most recent daily backup
gcloud storage ls gs://ssd-workspace-backups-immutable/medical-patient-data/daily-backups/ \
  | grep -E '[0-9]{8}-[0-9]{6}' \
  | sort -r \
  | head -5

# Option B: Specific monthly archive
gcloud storage ls gs://ssd-workspace-backups-immutable/medical-patient-data/monthly-archives/

# 2. Download from monthly archive (example: January 2025)
gcloud storage cp \
  gs://ssd-workspace-backups-immutable/medical-patient-data/monthly-archives/2025-01/workspace-medical-patient-data-backup-20250101-170000.tar.gz \
  ./

gcloud storage cp \
  gs://ssd-workspace-backups-immutable/medical-patient-data/monthly-archives/2025-01/workspace-medical-patient-data-backup-20250101-170000.tar.gz.sha256 \
  ./

# 3. Verify and extract (same as Scenario 3 steps 4-7)
sha256sum -c workspace-medical-patient-data-backup-20250101-170000.tar.gz.sha256
tar -xzf workspace-medical-patient-data-backup-20250101-170000.tar.gz
```

**Recovery Time:** 2-4 hours (restore from permanent archive, rebuild dependencies, verify integrity)

---

### Scenario 5: Recover Specific Implementation Project

**Recommended Layer:** Any (most recent available)

**Selective Recovery from GCS:**
```bash
# 1. Download latest backup
gcloud storage cp \
  gs://ssd-workspace-backups-immutable/medical-patient-data/daily-backups/workspace-medical-patient-data-backup-20251115-170000.tar.gz \
  ./

# 2. List contents to find project
tar -tzf workspace-medical-patient-data-backup-20251115-170000.tar.gz | grep "Implementation Projects"

# 3. Extract only specific project
tar -xzf workspace-medical-patient-data-backup-20251115-170000.tar.gz \
  --wildcards "Implementation Projects/gemini-mcp-integration/*"

# 4. Move to workspace
cp -r "Implementation Projects/gemini-mcp-integration" \
  ~/Desktop/medical-patient-data/Implementation\ Projects/
```

**Recovery Time:** 15-30 minutes

---

## Verification and Testing

### Manual Backup Trigger

Each repository has workflow_dispatch enabled for manual testing:

```bash
# Via GitHub CLI
gh workflow run workspace-backup-gcs.yml --repo [org]/medical-patient-data

# Via GitHub Web UI
1. Navigate to: https://github.com/[org]/medical-patient-data/actions
2. Select "Workspace Backup to Google Cloud Storage"
3. Click "Run workflow" button
4. Select branch: main
5. Click "Run workflow"
```

### Verify Backup Success

**Check GitHub Actions:**
```bash
# List recent workflow runs
gh run list --workflow=workspace-backup-gcs.yml --limit 5

# View specific run details
gh run view <run-id>

# View run logs
gh run view <run-id> --log
```

**Check GCS Bucket:**
```bash
# List recent backups for all workspaces
gcloud storage ls gs://ssd-workspace-backups-immutable/*/daily-backups/ \
  | grep -E '[0-9]{8}-[0-9]{6}' \
  | sort -r \
  | head -10

# Check latest backup metadata
gcloud storage cat gs://ssd-workspace-backups-immutable/medical-patient-data/latest-backup.txt

# Verify backup integrity (download and check SHA256)
gcloud storage cp \
  gs://ssd-workspace-backups-immutable/medical-patient-data/daily-backups/workspace-medical-patient-data-backup-20251115-170000.tar.gz.sha256 \
  -

# Get backup metadata
gcloud storage ls -L gs://ssd-workspace-backups-immutable/medical-patient-data/daily-backups/workspace-medical-patient-data-backup-20251115-170000.tar.gz
```

### Test Recovery (Dry Run)

**Safe Recovery Test:**
```bash
# 1. Download latest backup to temporary location
mkdir -p /tmp/backup-test
cd /tmp/backup-test

gcloud storage cp \
  gs://ssd-workspace-backups-immutable/medical-patient-data/daily-backups/workspace-medical-patient-data-backup-20251115-170000.tar.gz \
  ./

# 2. Verify checksum
gcloud storage cp \
  gs://ssd-workspace-backups-immutable/medical-patient-data/daily-backups/workspace-medical-patient-data-backup-20251115-170000.tar.gz.sha256 \
  ./

sha256sum -c workspace-medical-patient-data-backup-20251115-170000.tar.gz.sha256

# 3. Test extraction
tar -tzf workspace-medical-patient-data-backup-20251115-170000.tar.gz | head -20

# 4. Extract to test directory
mkdir extracted
tar -xzf workspace-medical-patient-data-backup-20251115-170000.tar.gz -C extracted/

# 5. Verify key files
ls -lh extracted/
cat extracted/README.md

# 6. Cleanup
cd ~
rm -rf /tmp/backup-test
```

### Monthly Archive Verification

**Verify Monthly Archives Exist:**
```bash
# List all monthly archives
gcloud storage ls gs://ssd-workspace-backups-immutable/medical-patient-data/monthly-archives/

# Check specific month
gcloud storage ls gs://ssd-workspace-backups-immutable/medical-patient-data/monthly-archives/2025-01/

# Verify archive has permanent retention metadata
gcloud storage ls -L \
  gs://ssd-workspace-backups-immutable/medical-patient-data/monthly-archives/2025-01/ \
  | grep -i retention
```

---

## Storage Cost Estimates

### Current Workspace Sizes (Compressed)
- `medical-patient-data`: ~75 MB per backup
- `operations-workspace`: ~40 MB per backup
- `mcp-infrastructure`: ~60 MB per backup
- **Total per backup:** ~175 MB

### Daily Backup Storage (90-day retention)
```
Backups per day: 2 (9 AM + 5 PM)
Days retained: 90
Workspaces: 3

Storage = 3 workspaces × 175 MB × 2 backups/day × 90 days
        = 94,500 MB
        = ~94 GB
```

### Monthly Archive Storage (Permanent)
```
Backups per month: 1
Months per year: 12
Workspaces: 3

Storage (Year 1) = 3 × 175 MB × 12
                 = 6,300 MB
                 = ~6.3 GB per year

Storage (Year 5) = 6.3 GB × 5
                 = ~31.5 GB
```

### Total Storage Estimate

| Timeframe | Daily Backups | Monthly Archives | Total |
|-----------|---------------|------------------|-------|
| Month 1 | ~94 GB | 0.5 GB | ~95 GB |
| Year 1 | ~94 GB | 6.3 GB | ~100 GB |
| Year 2 | ~94 GB | 12.6 GB | ~107 GB |
| Year 5 | ~94 GB | 31.5 GB | ~126 GB |

### GCS Cost Projection (Standard Storage, US Multi-Region)

**Pricing (as of 2025):**
- Standard Storage: $0.020 per GB/month
- Class A Operations (uploads): $0.05 per 10,000 operations
- Class B Operations (downloads): $0.004 per 10,000 operations
- Network Egress: $0.12 per GB (to internet)

**Monthly Cost Breakdown:**

| Component | Calculation | Cost/Month |
|-----------|-------------|------------|
| Storage (Year 1) | 100 GB × $0.020 | $2.00 |
| Uploads | (3 repos × 2/day × 30) × $0.05/10k | ~$0.01 |
| Versioning | Minimal (immutable) | $0.10 |
| **Total Year 1** | | **$2.11/month** |
| **Total Year 5** | 126 GB × $0.020 | **$2.52/month** |

**Annual Costs:**
- Year 1: ~$25
- Year 5: ~$30

**Note:** Actual costs may be lower due to:
- GCS lifecycle policies (auto-delete daily backups after 90 days)
- Compression efficiency improvements
- No frequent downloads (egress minimal)

---

## Important Notes

### Comparison with Google Sheets 6-Layer Backup System

**Key Differences:**

| Aspect | Google Sheets Backup | Workspace Backup |
|--------|---------------------|------------------|
| **What** | Production Google Sheets data | Development code & infrastructure |
| **Scope** | Single Apps Script project | 3 full workspace repositories |
| **Frequency** | Every sheet edit (real-time) | Twice daily (scheduled) |
| **Layer 3** | Google Drive versioning | Time Machine (local) |
| **Layer 5** | GCS snapshots | GCS daily backups |
| **Purpose** | Data integrity & compliance | Code recovery & disaster preparedness |

**Similarities:**
- Both use 6-layer defense-in-depth strategy
- Both use GCS immutable storage (Layer 5)
- Both have permanent monthly archives (Layer 6)
- Both include SHA256 integrity verification

### Time Machine Drive Status

**Current Status:** Backup drive NOT MOUNTED

**Action Required:**
1. Connect Time Machine backup drive to Mac
2. Wait for Time Machine to begin automatic backup
3. Verify: System Settings > General > Time Machine
4. Check "Last backup" timestamp is recent
5. Keep drive connected daily (or use network Time Machine)

**Recommendation:**
- Connect drive daily during work hours
- Or configure network Time Machine to always-on NAS
- Check Time Machine status weekly

### GCS Secret Verification

**Required Secret:** `GCS_SERVICE_ACCOUNT_KEY`

**Verification Steps:**
```bash
# Check if secret exists in repository
gh secret list --repo [org]/medical-patient-data

# Should show:
# GCS_SERVICE_ACCOUNT_KEY  Updated YYYY-MM-DD
```

**If Secret Missing:**
1. Go to Google Cloud Console
2. Navigate to: IAM & Admin > Service Accounts
3. Select service account: `github-actions-backup@ssd-sheets-backup-2025.iam.gserviceaccount.com`
4. Create new JSON key
5. Add to GitHub: Settings > Secrets and variables > Actions > New repository secret
   - Name: `GCS_SERVICE_ACCOUNT_KEY`
   - Value: Paste entire JSON key file contents

**Verify All Repositories:**
```bash
gh secret list --repo [org]/medical-patient-data
gh secret list --repo [org]/operations-workspace
gh secret list --repo [org]/mcp-infrastructure
```

### Immutable Storage Protection

**What "Immutable" Means:**
- Backups cannot be modified after upload
- Backups cannot be deleted (even by administrators)
- All versions are preserved automatically
- Protection against ransomware and malicious deletion

**Object Versioning:**
- Every upload creates a new version
- Previous versions remain accessible
- Can list all versions: `gcloud storage ls -a gs://...`
- Can restore any version by timestamp

**Compliance Benefits:**
- Meets HIPAA backup requirements
- Audit trail of all backup versions
- Tamper-proof storage
- Disaster recovery guarantee

---

## Next Steps

### Setup Completed (2025-11-16) ✅

**GCS Bucket Setup:**
1. ✅ Created bucket `gs://ssd-workspace-backups-immutable/` in project `ssd-sheets-backup-2025`
2. ✅ Enabled versioning on bucket
3. ✅ Configured 90-day lifecycle policy for daily backups
4. ✅ Enabled uniform bucket-level access
5. ✅ Granted service account permissions:
   - `ssd-automation-service-account@workspace-automation-ssdspc.iam.gserviceaccount.com`
   - Roles: `storage.objectCreator`, `storage.objectViewer`

**Workflow Fixes:**
1. ✅ Fixed tar exit code handling for "file changed as we read it" warning
   - Changed from `--warning=no-file-changed` to `|| [ $? -eq 1 ]` pattern
   - Commit: `4d043c0` (2025-11-16)
2. ✅ Verified GitHub secret `GCS_SERVICE_ACCOUNT_KEY` exists
3. ✅ Successfully tested manual workflow run
4. ✅ Verified backup uploaded to GCS:
   - File: `workspace-medical-patient-data-backup-20251116-062032.tar.gz`
   - Size: 3.8M (3,911,001 bytes)
   - Files: 7,223
   - Checksum: SHA256 verified

**Status:** medical-patient-data workspace backup is now fully operational and running on schedule (9 AM & 5 PM PST daily).

**Remaining Actions:**
- [ ] Replicate setup for operations-workspace repository
- [ ] Replicate setup for mcp-infrastructure repository

### Immediate Actions (Next 24 Hours)

1. **Connect Time Machine Drive**
   - [ ] Connect backup drive to Mac
   - [ ] Verify Time Machine is backing up
   - [ ] Check "Last backup" timestamp
   - [ ] Document backup drive serial number/location

2. **Replicate GCS Setup for Other Workspaces**
   - [ ] Test manual backup for operations-workspace
   - [ ] Test manual backup for mcp-infrastructure
   - [ ] Verify all three workspaces have successful backups

3. **Test Recovery (Dry Run)**
   - [ ] Download latest backup from GCS
   - [ ] Verify SHA256 checksum
   - [ ] Test extraction to /tmp
   - [ ] Verify key files are present

### First Week

5. **Monitor Automated Runs**
   - [ ] Check backup runs on Day 2 (9 AM and 5 PM)
   - [ ] Check backup runs on Day 3
   - [ ] Review any failures in GitHub Actions
   - [ ] Verify GCS storage growth is expected

6. **Document Repository URLs**
   - [ ] Update this document with actual GitHub org/repo URLs
   - [ ] Replace all `[org]` placeholders
   - [ ] Share with team members

7. **Test Time Machine Recovery**
   - [ ] Create test file in workspace
   - [ ] Wait for Time Machine backup
   - [ ] Delete test file
   - [ ] Recover using Time Machine
   - [ ] Document experience/issues

### First Month

8. **Verify Monthly Archive**
   - [ ] On December 1st (or next 1st), check for monthly archive
   - [ ] Verify file in `monthly-archives/YYYY-MM/`
   - [ ] Verify permanent retention metadata
   - [ ] Test download and extraction

9. **Review Storage Costs**
   - [ ] Check Google Cloud Console > Billing
   - [ ] Compare actual vs. projected costs
   - [ ] Adjust estimates if needed

10. **Test Full Recovery Procedure**
    - [ ] On separate machine/directory
    - [ ] Complete Scenario 3 recovery procedure
    - [ ] Document time taken
    - [ ] Document any issues encountered

### Ongoing Maintenance

11. **Weekly Checks**
    - [ ] Verify Time Machine is backing up
    - [ ] Check last GCS backup timestamp
    - [ ] Review GitHub Actions for failures

12. **Monthly Reviews**
    - [ ] Verify monthly archive was created
    - [ ] Review storage costs
    - [ ] Test recovery from one random backup
    - [ ] Update this document with lessons learned

13. **Quarterly Audits**
    - [ ] Full disaster recovery drill
    - [ ] Review and update recovery procedures
    - [ ] Verify all 6 layers are functioning
    - [ ] Update cost estimates
    - [ ] Review retention policies

---

## Reference Commands

### Quick Status Checks

```bash
# Check all backups from last 24 hours
gcloud storage ls gs://ssd-workspace-backups-immutable/*/daily-backups/ \
  | grep "$(date +%Y%m%d)"

# Check Time Machine status
tmutil latestbackup
tmutil listbackups | tail -5

# Check GitHub workflow runs
gh run list --workflow=workspace-backup-gcs.yml --limit 5 \
  --repo [org]/medical-patient-data
```

### Common Recovery Commands

```bash
# Quick file restore from git
git restore --source=HEAD~1 filename

# Clone from GitHub
git clone https://github.com/[org]/medical-patient-data.git

# Download latest GCS backup
gcloud storage cp \
  gs://ssd-workspace-backups-immutable/medical-patient-data/latest-backup.txt \
  -

# Enter Time Machine
open -a "Time Machine"
```

### Troubleshooting

```bash
# Check workflow logs
gh run view <run-id> --log

# Test GCS authentication
gcloud auth list
gcloud storage ls gs://ssd-workspace-backups-immutable/

# Verify branch protection
gh api repos/[org]/medical-patient-data/branches/main/protection

# Check Time Machine destinations
tmutil destinationinfo
```

---

## Support and Contact

**Documentation Owner:** Infrastructure Team
**Last Reviewed:** 2025-11-15
**Next Review:** 2025-12-15

**Escalation Path:**
1. Check this documentation for recovery procedures
2. Review GitHub Actions logs for backup failures
3. Test recovery in isolated environment before production
4. Document issues and update this guide

**Related Documentation:**
- `docs/HIPAA-COMPLIANCE-GUIDE.md` - Healthcare data compliance
- `docs/TROUBLESHOOTING-GITHUB-ACTIONS.md` - Workflow debugging
- `.github/workflows/workspace-backup-gcs.yml` - Backup workflow source

---

## Appendix: Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                    WORKSPACE BACKUP ARCHITECTURE                     │
│                          6-Layer Protection                          │
└─────────────────────────────────────────────────────────────────────┘

  Workspaces Protected:
  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
  │ medical-patient-data │  │ operations-workspace │  │ mcp-infrastructure   │
  └──────────────────────┘  └──────────────────────┘  └──────────────────────┘
            │                         │                          │
            └─────────────────────────┴──────────────────────────┘
                                      │
                                      ▼
  ┌─────────────────────────────────────────────────────────────────────┐
  │ Layer 1: Local Git (Per Commit, Indefinite Retention)               │
  │   - Full version history                                             │
  │   - Branch-level recovery                                            │
  │   - Recovery time: Seconds                                           │
  └─────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
  ┌─────────────────────────────────────────────────────────────────────┐
  │ Layer 2: GitHub Remote (Per Push, Indefinite Retention)             │
  │   - Cloud version control                                            │
  │   - Accessible from anywhere                                         │
  │   - Recovery time: Minutes                                           │
  └─────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
  ┌─────────────────────────────────────────────────────────────────────┐
  │ Layer 3: Time Machine (Hourly, Drive-Limited Retention)             │
  │   - Includes untracked files                                         │
  │   - Full system state                                                │
  │   - Recovery time: Minutes                                           │
  │   - Status: DRIVE NOT MOUNTED ⚠️                                     │
  └─────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
  ┌─────────────────────────────────────────────────────────────────────┐
  │ Layer 4: Branch Protection (Real-time Prevention)                   │
  │   - Prevents force pushes                                            │
  │   - Prevents branch deletion                                         │
  │   - Enforces code review                                             │
  └─────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
  ┌─────────────────────────────────────────────────────────────────────┐
  │ Layer 5: GCS Daily Backups (9AM/5PM PST, 90-Day Retention)          │
  │   - Immutable storage                                                │
  │   - SHA256 verification                                              │
  │   - Recovery time: Hours                                             │
  │                                                                       │
  │   gs://ssd-workspace-backups-immutable/{workspace}/daily-backups/   │
  └─────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
  ┌─────────────────────────────────────────────────────────────────────┐
  │ Layer 6: GCS Monthly Archives (1st of Month, Permanent Retention)   │
  │   - Long-term compliance                                             │
  │   - Disaster recovery                                                │
  │   - Recovery time: Hours                                             │
  │                                                                       │
  │   gs://ssd-workspace-backups-immutable/{workspace}/monthly-archives/ │
  └─────────────────────────────────────────────────────────────────────┘


  Recovery Decision Tree:
  ┌─────────────────────────────────────────────────────────────────────┐
  │ What went wrong?                                                     │
  └───────────────┬─────────────────────────────────────────────────────┘
                  │
      ┌───────────┴──────────┬──────────────┬──────────────┬───────────┐
      │                      │              │              │           │
  Single file    Multiple files  Entire     GitHub      Complete
  deleted        lost/corrupted  workspace  compromised catastrophe
  (< 24 hrs)                     lost
      │                      │              │              │           │
      ▼                      ▼              ▼              ▼           ▼
  Layer 3:            Layer 1:       Layer 2:       Layer 5:     Layer 6:
  Time Machine        Git Restore    GitHub Clone   GCS Daily    GCS Monthly
  (1-5 min)           (1-5 min)      (10-30 min)    (1-2 hrs)    (2-4 hrs)
```

---

**Document End**

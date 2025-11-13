# GCS Backup Quick Start

**The final layer for 100% protection - 20 minutes to implement**

## What You're Building

An **immutable, off-site backup** that protects against catastrophic failures:

```
GitHub Compromised? ✅ Restore from GCS
Local Disk Failed?   ✅ Restore from GCS
Accidental Deletion? ✅ Cannot delete (30-day lock)
Need Old Version?    ✅ Every version saved
```

**Cost**: ~$2/month | **Time**: 20 minutes | **Result**: 100% protection

---

## 3-Step Implementation

### Step 1: Create GCS Bucket (5 min)

```bash
# Install gcloud if needed
brew install google-cloud-sdk

# Login and create project
gcloud auth login
gcloud projects create ssd-sheets-backup --name="SSD Sheets Backup"
gcloud config set project ssd-sheets-backup

# Create bucket with versioning
gsutil mb -c STANDARD -l us-central1 gs://ssd-sheets-backup-immutable/
gsutil versioning set on gs://ssd-sheets-backup-immutable/

# Set 30-day retention (cannot delete backups for 30 days)
gsutil retention set 30d gs://ssd-sheets-backup-immutable/

# Create service account for GitHub
gcloud iam service-accounts create github-backup-uploader \
    --display-name="GitHub Actions Backup Uploader"

gcloud projects add-iam-policy-binding ssd-sheets-backup \
    --member="serviceAccount:github-backup-uploader@ssd-sheets-backup.iam.gserviceaccount.com" \
    --role="roles/storage.objectAdmin"

# Generate key
gcloud iam service-accounts keys create ~/gcs-backup-key.json \
    --iam-account=github-backup-uploader@ssd-sheets-backup.iam.gserviceaccount.com

# Encode for GitHub (copy the output)
cat ~/gcs-backup-key.json | base64
```

### Step 2: Add GitHub Secret (2 min)

1. Go to: https://github.com/mmaruthurssd/ssd-google-sheets-staging-production/settings/secrets/actions
2. Click "New repository secret"
3. Name: `GCS_SERVICE_ACCOUNT_KEY`
4. Paste the base64 key from Step 1
5. Click "Add secret"
6. Delete local key: `rm ~/gcs-backup-key.json`

### Step 3: Create Workflow (3 min)

```bash
cd "/Users/mmaruthurnew/Desktop/medical-patient-data/Implementation Projects/google-sheets-version-control"

# Create workflows directory
mkdir -p .github/workflows

# Copy the workflow file from docs/GCS-BACKUP-IMPLEMENTATION.md
# Or use this one-liner to create it:
```

Then see the full workflow in `docs/GCS-BACKUP-IMPLEMENTATION.md`, Part 2, Step 2.

Commit and push:

```bash
git add .github/workflows/backup-to-gcs.yml
git commit -m "feat: add automated GCS backup (Layer 5)"
git push
```

### Step 4: Test (2 min)

1. Go to GitHub Actions: https://github.com/mmaruthurssd/ssd-google-sheets-staging-production/actions
2. Click "Backup to Google Cloud Storage" → "Run workflow"
3. Wait 2-3 minutes
4. Verify success: `gsutil ls gs://ssd-sheets-backup-immutable/daily-backups/`

---

## What Happens Next

**Automated backups run**:
- Every day at 9 AM CST (2 PM UTC)
- Every day at 5 PM CST (10 PM UTC)
- After every production snapshot push

**Each backup includes**:
- All 792 production sheets
- All scripts and documentation
- Full git history
- Configuration files
- SHA256 checksum for verification

**Retention**:
- Cannot delete backups for 30 days (immutable)
- Automatically keeps last 90 versions
- ~1 GB per backup = ~90 GB total
- Cost: ~$2/month

---

## Recovery Examples

### Restore Single File

```bash
# List backups
gsutil ls gs://ssd-sheets-backup-immutable/daily-backups/

# Download and extract
gsutil cp gs://ssd-sheets-backup-immutable/daily-backups/ssd-sheets-backup-20251112-140000.tar.gz /tmp/
tar -xzf /tmp/ssd-sheets-backup-20251112-140000.tar.gz production-sheets/sheet-001_PROD*/live/Code.js
```

### Restore Entire Repository

```bash
# Download latest backup
gsutil cp gs://ssd-sheets-backup-immutable/daily-backups/$(gsutil cat gs://ssd-sheets-backup-immutable/latest-backup.txt | head -1).tar.gz /tmp/

# Extract
mkdir -p ~/restored-repository
tar -xzf /tmp/ssd-sheets-backup-*.tar.gz -C ~/restored-repository
```

---

## Before You Lock Retention

**Test for 1 week**:
- [ ] 3+ successful automated backups
- [ ] Manual test: Download and extract backup
- [ ] Verify checksum passes
- [ ] Test file restoration
- [ ] Confirm GitHub Actions workflow stable

**Then lock** (PERMANENT - cannot undo):
```bash
gsutil retention lock gs://ssd-sheets-backup-immutable/
```

---

## Completion Status

After implementation:

| Layer | Status | What It Does |
|-------|--------|--------------|
| 1. Google Drive | ✅ | Source of truth |
| 2. Local Git | ✅ | Version control |
| 3. GitHub | ✅ | Cloud backup |
| 4. Branch Protection | ✅ | Prevent force push |
| 5. **GCS Backup** | **🎯 YOU ARE HERE** | Immutable off-site |
| 6. Time Machine | ✅ | Local machine backup |

**Result**: 6/6 layers = 100% Complete 🎉

---

## Support

- Full guide: `docs/GCS-BACKUP-IMPLEMENTATION.md`
- Troubleshooting: Check GitHub Actions logs
- Cost monitoring: `gsutil du -sh gs://ssd-sheets-backup-immutable/`
- Manual backup: `./scripts/backup-to-gcs.sh`

---

**Ready to implement?** Follow the 3 steps above or see the full guide for detailed explanations.

# Google Cloud Storage Backup Implementation Guide

**Layer 5 of 6-Layer Protection Strategy**

## Overview

This guide implements automated, immutable backups to Google Cloud Storage with:
- 30-day retention lock (cannot delete backups for 30 days)
- Automatic object versioning (restore from any point in time)
- Daily automated backups via GitHub Actions
- Geographic redundancy (survives local/GitHub failures)
- Cost: ~$2/month for 90 days of history

---

## Prerequisites

- Google Cloud Platform account (free tier available)
- `gcloud` CLI installed locally
- Repository access (already configured)
- Estimated time: 20 minutes

---

## Part 1: Google Cloud Setup (10 minutes)

### Step 1: Create GCP Project

```bash
# Install gcloud CLI if not already installed
# macOS: brew install google-cloud-sdk

# Initialize and login
gcloud init
gcloud auth login

# Create new project for backups
gcloud projects create ssd-sheets-backup --name="SSD Sheets Backup"

# Set as active project
gcloud config set project ssd-sheets-backup

# Enable billing (required for Cloud Storage)
# Visit: https://console.cloud.google.com/billing/projects
```

### Step 2: Create Storage Bucket with Versioning

```bash
# Create bucket in us-central1 (same region as Google Sheets for best performance)
gsutil mb -p ssd-sheets-backup -c STANDARD -l us-central1 gs://ssd-sheets-backup-immutable/

# Enable versioning (keeps all historical versions)
gsutil versioning set on gs://ssd-sheets-backup-immutable/

# Set lifecycle rule to delete versions older than 90 days (optional cost control)
cat > lifecycle.json <<'EOF'
{
  "lifecycle": {
    "rule": [
      {
        "action": {"type": "Delete"},
        "condition": {
          "numNewerVersions": 90,
          "isLive": false
        }
      }
    ]
  }
}
EOF

gsutil lifecycle set lifecycle.json gs://ssd-sheets-backup-immutable/
```

### Step 3: Configure Retention Policy (Immutable Backup)

```bash
# Set 30-day retention lock (backups cannot be deleted for 30 days)
gsutil retention set 30d gs://ssd-sheets-backup-immutable/

# Lock the retention policy (PERMANENT - cannot be reduced or removed!)
# WARNING: Only run this after testing backups work correctly
# gsutil retention lock gs://ssd-sheets-backup-immutable/
```

**Important**: Start with unlocked retention policy. After testing backups for 1 week, lock it permanently.

### Step 4: Create Service Account for GitHub Actions

```bash
# Create service account
gcloud iam service-accounts create github-backup-uploader \
    --display-name="GitHub Actions Backup Uploader" \
    --project=ssd-sheets-backup

# Grant storage admin role
gcloud projects add-iam-policy-binding ssd-sheets-backup \
    --member="serviceAccount:github-backup-uploader@ssd-sheets-backup.iam.gserviceaccount.com" \
    --role="roles/storage.objectAdmin"

# Create and download key (keep this secure!)
gcloud iam service-accounts keys create ~/gcs-backup-key.json \
    --iam-account=github-backup-uploader@ssd-sheets-backup.iam.gserviceaccount.com

# Display key for GitHub secrets (we'll use this in Part 2)
cat ~/gcs-backup-key.json | base64
```

**SECURITY**: The service account key is sensitive. We'll store it as a GitHub secret, then delete the local copy.

---

## Part 2: GitHub Actions Workflow (5 minutes)

### Step 1: Add GCS Credentials to GitHub Secrets

1. Navigate to: https://github.com/mmaruthurssd/ssd-google-sheets-staging-production/settings/secrets/actions
2. Click "New repository secret"
3. Name: `GCS_SERVICE_ACCOUNT_KEY`
4. Value: Paste the base64-encoded key from Step 4 above
5. Click "Add secret"

### Step 2: Create GitHub Actions Workflow

Create file: `.github/workflows/backup-to-gcs.yml`

```yaml
name: Backup to Google Cloud Storage

on:
  # Run daily at 9 AM and 5 PM Central Time (2 PM and 10 PM UTC)
  schedule:
    - cron: '0 14 * * *'  # 9 AM CST
    - cron: '0 22 * * *'  # 5 PM CST

  # Allow manual trigger
  workflow_dispatch:

  # Run after automated snapshots
  push:
    branches:
      - main
    paths:
      - 'production-sheets/**'

jobs:
  backup:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Full history for comprehensive backup

      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v2
        with:
          service_account_key: ${{ secrets.GCS_SERVICE_ACCOUNT_KEY }}
          project_id: ssd-sheets-backup
          export_default_credentials: true

      - name: Create backup archive
        run: |
          TIMESTAMP=$(date +%Y%m%d-%H%M%S)
          BACKUP_FILE="ssd-sheets-backup-${TIMESTAMP}.tar.gz"

          # Create compressed backup
          tar -czf "$BACKUP_FILE" \
            production-sheets/ \
            config/ \
            scripts/ \
            docs/ \
            .git/ \
            PROJECT-OVERVIEW.md

          # Calculate checksum
          sha256sum "$BACKUP_FILE" > "${BACKUP_FILE}.sha256"

          echo "BACKUP_FILE=$BACKUP_FILE" >> $GITHUB_ENV
          echo "TIMESTAMP=$TIMESTAMP" >> $GITHUB_ENV

      - name: Upload to GCS
        run: |
          # Upload backup with metadata
          gsutil -h "x-goog-meta-timestamp:${TIMESTAMP}" \
                 -h "x-goog-meta-commit:${GITHUB_SHA}" \
                 -h "x-goog-meta-branch:${GITHUB_REF_NAME}" \
                 cp "${BACKUP_FILE}" \
                 gs://ssd-sheets-backup-immutable/daily-backups/

          # Upload checksum
          gsutil cp "${BACKUP_FILE}.sha256" \
                 gs://ssd-sheets-backup-immutable/daily-backups/

          # Upload latest metadata
          echo "${TIMESTAMP}" > latest-backup.txt
          echo "${GITHUB_SHA}" >> latest-backup.txt
          gsutil cp latest-backup.txt \
                 gs://ssd-sheets-backup-immutable/

      - name: Verify upload
        run: |
          # Verify file exists in GCS
          gsutil ls -l "gs://ssd-sheets-backup-immutable/daily-backups/${BACKUP_FILE}"

          # Verify checksum matches
          gsutil cp "gs://ssd-sheets-backup-immutable/daily-backups/${BACKUP_FILE}.sha256" - | \
            sha256sum -c

      - name: Report backup status
        if: always()
        run: |
          if [ $? -eq 0 ]; then
            echo "✅ Backup successful: ${BACKUP_FILE}"
            echo "📊 Size: $(du -h ${BACKUP_FILE} | cut -f1)"
            echo "🔗 Location: gs://ssd-sheets-backup-immutable/daily-backups/${BACKUP_FILE}"
          else
            echo "❌ Backup failed"
            exit 1
          fi
```

### Step 3: Commit and Test

```bash
cd "/Users/mmaruthurnew/Desktop/medical-patient-data/Implementation Projects/google-sheets-version-control"

# Create workflows directory
mkdir -p .github/workflows

# Create the workflow file (copy content above)
# Then commit
git add .github/workflows/backup-to-gcs.yml
git commit -m "feat: add automated GCS backup workflow

Implements Layer 5 (Google Cloud Storage backup) with:
- Daily backups at 9 AM and 5 PM CST
- 30-day retention lock for immutability
- Automatic versioning for point-in-time recovery
- Backup triggered after production snapshots
- SHA256 verification for integrity"

git push
```

### Step 4: Manual Test

1. Navigate to: https://github.com/mmaruthurssd/ssd-google-sheets-staging-production/actions
2. Click "Backup to Google Cloud Storage"
3. Click "Run workflow" → "Run workflow"
4. Wait 2-3 minutes for completion
5. Verify success: Check Actions tab for green checkmark

---

## Part 3: Local Backup Script (5 minutes)

For manual backups and testing:

```bash
# Create local backup script
cat > scripts/backup-to-gcs.sh <<'EOF'
#!/bin/bash
# Manual backup to Google Cloud Storage
# Usage: ./scripts/backup-to-gcs.sh

REPO_ROOT="/Users/mmaruthurnew/Desktop/medical-patient-data/Implementation Projects/google-sheets-version-control"
cd "$REPO_ROOT" || exit 1

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="ssd-sheets-backup-${TIMESTAMP}.tar.gz"

echo "Creating backup archive..."
tar -czf "/tmp/${BACKUP_FILE}" \
  production-sheets/ \
  config/ \
  scripts/ \
  docs/ \
  .git/ \
  PROJECT-OVERVIEW.md

echo "Calculating checksum..."
sha256sum "/tmp/${BACKUP_FILE}" > "/tmp/${BACKUP_FILE}.sha256"

echo "Uploading to GCS..."
gsutil cp "/tmp/${BACKUP_FILE}" \
  gs://ssd-sheets-backup-immutable/manual-backups/

gsutil cp "/tmp/${BACKUP_FILE}.sha256" \
  gs://ssd-sheets-backup-immutable/manual-backups/

echo "Verifying upload..."
gsutil ls -l "gs://ssd-sheets-backup-immutable/manual-backups/${BACKUP_FILE}"

echo "✅ Backup complete: ${BACKUP_FILE}"
echo "📊 Size: $(du -h /tmp/${BACKUP_FILE} | cut -f1)"

# Clean up local temp files
rm "/tmp/${BACKUP_FILE}" "/tmp/${BACKUP_FILE}.sha256"
EOF

chmod +x scripts/backup-to-gcs.sh
```

---

## Recovery Procedures

### Scenario 1: Restore Specific File from GCS

```bash
# List available backups
gsutil ls gs://ssd-sheets-backup-immutable/daily-backups/

# Download specific backup
gsutil cp gs://ssd-sheets-backup-immutable/daily-backups/ssd-sheets-backup-20251112-140000.tar.gz /tmp/

# Verify checksum
gsutil cp gs://ssd-sheets-backup-immutable/daily-backups/ssd-sheets-backup-20251112-140000.tar.gz.sha256 /tmp/
cd /tmp && sha256sum -c ssd-sheets-backup-20251112-140000.tar.gz.sha256

# Extract specific file
tar -xzf ssd-sheets-backup-20251112-140000.tar.gz production-sheets/sheet-001_PROD*/live/Code.js
```

### Scenario 2: Full Repository Restore

```bash
# Download latest backup
gsutil cp gs://ssd-sheets-backup-immutable/daily-backups/ssd-sheets-backup-LATEST.tar.gz /tmp/

# Verify checksum
cd /tmp && sha256sum -c ssd-sheets-backup-LATEST.tar.gz.sha256

# Extract to new location
mkdir -p ~/restored-repository
tar -xzf /tmp/ssd-sheets-backup-LATEST.tar.gz -C ~/restored-repository

# Verify git integrity
cd ~/restored-repository
git fsck --full
```

### Scenario 3: Restore from Specific Date

```bash
# List backups by date
gsutil ls -l gs://ssd-sheets-backup-immutable/daily-backups/ | grep "2025-11-10"

# Download that date's backup
gsutil cp gs://ssd-sheets-backup-immutable/daily-backups/ssd-sheets-backup-20251110-140000.tar.gz /tmp/

# Follow extraction steps from Scenario 2
```

### Scenario 4: Restore Deleted File Version

```bash
# List all versions of a specific backup
gsutil ls -a gs://ssd-sheets-backup-immutable/daily-backups/ssd-sheets-backup-20251112-140000.tar.gz

# Download specific version
gsutil cp gs://ssd-sheets-backup-immutable/daily-backups/ssd-sheets-backup-20251112-140000.tar.gz#1234567890 /tmp/
```

---

## Monitoring and Maintenance

### Check Backup Status

```bash
# List recent backups
gsutil ls -l gs://ssd-sheets-backup-immutable/daily-backups/ | tail -10

# Check total storage used
gsutil du -sh gs://ssd-sheets-backup-immutable/

# View latest backup metadata
gsutil cat gs://ssd-sheets-backup-immutable/latest-backup.txt
```

### Monthly Cost Estimate

```bash
# Calculate storage cost
gsutil du -s gs://ssd-sheets-backup-immutable/

# Pricing (as of 2024):
# Standard Storage (us-central1): $0.020/GB/month
# Estimated: 90 backups × 1 GB = 90 GB
# Cost: 90 GB × $0.020 = $1.80/month
```

### Alerts Configuration

Add to `.github/workflows/backup-to-gcs.yml`:

```yaml
      - name: Notify on failure
        if: failure()
        run: |
          # Send notification (configure with your preferred service)
          echo "❌ BACKUP FAILED - Check GitHub Actions logs"
          # Example: curl to Slack webhook, email service, etc.
```

---

## Testing Checklist

Before locking retention policy, verify:

- [ ] Manual backup completes successfully
- [ ] GitHub Actions workflow runs on schedule
- [ ] Can download and extract backup archive
- [ ] Checksum verification passes
- [ ] Can restore specific file from backup
- [ ] Storage costs are within budget (~$2/month)
- [ ] Retention policy preventing deletions

---

## Security Considerations

1. **Service Account Key**:
   - Stored only in GitHub Secrets (encrypted)
   - Delete local copy after adding to secrets
   - Rotate annually

2. **Bucket Access**:
   - Private by default
   - Only service account has write access
   - Enable uniform bucket-level access

3. **Retention Lock**:
   - Start with 30-day unlocked policy
   - Test for 1 week before locking
   - Once locked, CANNOT be undone

---

## Cost Optimization

- **Lifecycle rules**: Auto-delete backups older than 90 days
- **Nearline storage**: Move to cheaper storage after 30 days
- **Compression**: tar.gz reduces size by ~70%
- **Incremental backups**: Consider rsync for large datasets (future enhancement)

---

## Integration with Health Check

Update `scripts/daily-health-check.sh`:

```bash
# Check 9: GCS backup recent
if command -v gsutil &> /dev/null; then
    LATEST=$(gsutil cat gs://ssd-sheets-backup-immutable/latest-backup.txt 2>/dev/null | head -1)
    if [ -n "$LATEST" ]; then
        echo "✓ GCS backup: Latest backup $LATEST"
        # Check if backup is recent (within 24 hours)
        BACKUP_AGE=$(( ($(date +%s) - $(date -j -f "%Y%m%d-%H%M%S" "$LATEST" +%s 2>/dev/null || echo 0)) / 3600 ))
        if [ "$BACKUP_AGE" -gt 24 ]; then
            echo "  ⚠️  WARNING: Last backup is ${BACKUP_AGE} hours old"
        fi
    else
        echo "⚠️  GCS backup: No recent backup found"
    fi
else
    echo "ℹ️  GCS backup: gsutil not installed"
fi
```

---

## Completion Criteria

Layer 5 is complete when:

✅ GCS bucket created with versioning enabled
✅ 30-day retention policy configured
✅ GitHub Actions workflow running successfully
✅ At least 3 successful automated backups
✅ Recovery procedure tested and verified
✅ Health check monitoring GCS backup recency
✅ Documentation updated to reflect 100% completion

---

## Next Steps After Implementation

1. Monitor first week of automated backups
2. Test recovery procedure with real data
3. Lock retention policy after verification
4. Update PROJECT-OVERVIEW.md to 100% complete
5. Schedule quarterly disaster recovery drill
6. Consider cross-region replication (optional)

---

**Estimated Total Time**: 20 minutes
**Monthly Cost**: $1.80 - $2.50
**Recovery Time Objective (RTO)**: 10-30 minutes
**Recovery Point Objective (RPO)**: 12 hours (2 daily backups)

**Status After Implementation**: 6/6 layers active = 100% Complete

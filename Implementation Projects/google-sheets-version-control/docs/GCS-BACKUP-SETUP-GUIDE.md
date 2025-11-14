---
type: guide
tags: [backup, gcs, setup, layer-5]
---

# GCS Backup Setup Guide (Layer 5)

**Purpose:** Complete setup instructions for Google Cloud Storage immutable backup layer
**Status:** 🟡 Requires Setup
**Last Updated:** 2025-11-14

---

## Current Status

### Service Account Status: ✅ WORKING
- **Email:** `ssd-automation-service-account@workspace-automation-ssdspc.iam.gserviceaccount.com`
- **Project:** `workspace-automation-ssdspc` (ID: 1009524936829)
- **Drive Access:** ✅ Has Manager permissions on 9 Shared Drives
- **GCS Access:** ❌ Needs configuration

### GCS Bucket Status: ⚠️ NEEDS SETUP
- **Bucket Name:** `ssd-sheets-backup-immutable`
- **Project:** `ssd-sheets-backup-2025`
- **Issue:** Cloud Resource Manager API disabled + bucket may not exist

---

## Setup Steps

### Step 1: Enable Required APIs

Visit these URLs and enable the APIs:

1. **Cloud Resource Manager API:**
   ```
   https://console.developers.google.com/apis/api/cloudresourcemanager.googleapis.com/overview?project=1009524936829
   ```
   - Click "Enable API"
   - Wait 2-3 minutes for propagation

2. **Cloud Storage API:**
   ```
   https://console.cloud.google.com/apis/library/storage-api.googleapis.com?project=ssd-sheets-backup-2025
   ```
   - Click "Enable API"

### Step 2: Create GCS Bucket (If Doesn't Exist)

```bash
# Set project
gcloud config set project ssd-sheets-backup-2025

# Create bucket with versioning and retention
gsutil mb -p ssd-sheets-backup-2025 -l us-central1 gs://ssd-sheets-backup-immutable

# Enable versioning (keeps all versions of files)
gsutil versioning set on gs://ssd-sheets-backup-immutable

# Set 30-day retention policy (prevents deletion for 30 days)
gsutil retention set 30d gs://ssd-sheets-backup-immutable

# Create directory structure
gsutil -m mkdir gs://ssd-sheets-backup-immutable/daily-backups/
gsutil -m mkdir gs://ssd-sheets-backup-immutable/monthly-archives/
```

### Step 3: Grant Service Account Permissions

```bash
# Grant Storage Admin role to service account
gsutil iam ch serviceAccount:ssd-automation-service-account@workspace-automation-ssdspc.iam.gserviceaccount.com:roles/storage.admin gs://ssd-sheets-backup-immutable

# Verify permissions
gsutil iam get gs://ssd-sheets-backup-immutable
```

### Step 4: Test Bucket Access

```bash
# Set credentials
export GOOGLE_APPLICATION_CREDENTIALS="/Users/mmaruthurnew/Desktop/medical-patient-data/google-workspace-oauth-setup/service-account.json"

# Test listing
gsutil ls gs://ssd-sheets-backup-immutable/

# Test write
echo "Test file" > /tmp/test.txt
gsutil cp /tmp/test.txt gs://ssd-sheets-backup-immutable/test.txt

# Test read
gsutil cat gs://ssd-sheets-backup-immutable/test.txt

# Cleanup
gsutil rm gs://ssd-sheets-backup-immutable/test.txt
rm /tmp/test.txt
```

---

## GitHub Secrets Configuration

### Required Secrets

Add these to: https://github.com/mmaruthurssd/medical-patient-data/settings/secrets/actions

#### 1. GCS_SERVICE_ACCOUNT_KEY

**Name:** `GCS_SERVICE_ACCOUNT_KEY`
**Value:** Contents of `/Users/mmaruthurnew/Desktop/medical-patient-data/google-workspace-oauth-setup/service-account.json`

To get the value:
```bash
cat /Users/mmaruthurnew/Desktop/medical-patient-data/google-workspace-oauth-setup/service-account.json
```

Copy the entire JSON output (including the braces `{}`).

#### 2. GCP_SERVICE_ACCOUNT

**Name:** `GCP_SERVICE_ACCOUNT`
**Value:** Same as `GCS_SERVICE_ACCOUNT_KEY` above

Copy the same JSON content.

#### 3. CLASP_CREDENTIALS

**Name:** `CLASP_CREDENTIALS`
**Value:** Contents of `.clasprc.json` for Apps Script authentication

```bash
cd "/Users/mmaruthurnew/Desktop/medical-patient-data/Implementation Projects/google-sheets-version-control"
cat .clasprc.json
```

---

## Verification Steps

### Local Verification

```bash
cd "/Users/mmaruthurnew/Desktop/medical-patient-data/Implementation Projects/google-sheets-version-control"

# Run manual backup test
./scripts/backup-to-gcs-manual.sh
```

### GitHub Actions Verification

1. Go to: https://github.com/mmaruthurnew/medical-patient-data/actions
2. Click "Backup to Google Cloud Storage" workflow
3. Click "Run workflow" → "Run workflow"
4. Wait for completion (~2-3 minutes)
5. Check for ✅ success

---

## Expected Results After Setup

### GitHub Actions Status
- ✅ "Backup to Google Cloud Storage" workflow succeeds
- ✅ "Sync Documentation to Google Drive" workflow succeeds
- ✅ Daily snapshots at 9 AM and 5 PM Central Time

### GCS Bucket Contents
```
gs://ssd-sheets-backup-immutable/
├── daily-backups/
│   ├── ssd-sheets-backup-20251114-140000.tar.gz
│   ├── ssd-sheets-backup-20251114-140000.tar.gz.sha256
│   └── [90 days of backups]
├── monthly-archives/
│   └── [Monthly archives kept forever]
└── latest-backup.txt
```

### Backup Protection Features
- ✅ 30-day retention lock (cannot delete for 30 days)
- ✅ Automatic versioning (all file versions preserved)
- ✅ SHA256 checksum verification
- ✅ Compressed archives with git history

---

## Troubleshooting

### Error: "Permission denied"

**Cause:** Service account lacks Storage Admin role
**Fix:**
```bash
gsutil iam ch serviceAccount:ssd-automation-service-account@workspace-automation-ssdspc.iam.gserviceaccount.com:roles/storage.admin gs://ssd-sheets-backup-immutable
```

### Error: "Bucket does not exist"

**Cause:** Bucket not created yet
**Fix:** Follow Step 2 above

### Error: "API not enabled"

**Cause:** Cloud Storage API or Resource Manager API disabled
**Fix:** Follow Step 1 above

### GitHub Actions Fails with "Invalid credentials"

**Cause:** GitHub secret not set or wrong format
**Fix:**
1. Verify secret exists at: https://github.com/mmaruthurssd/medical-patient-data/settings/secrets/actions
2. Ensure it's valid JSON (starts with `{` and ends with `}`)
3. No extra quotes or escaping

---

## Cost Estimate

- **Storage:** ~90 GB (90 days × ~1 GB/day) = $1.80/month
- **Operations:** Minimal (~$0.01/month)
- **Network:** Free (same region)
- **Total:** ~$2/month

---

## Maintenance

### Daily
- Automated via GitHub Actions (no action needed)

### Weekly
- Review workflow run status
- Check for failures in email notifications

### Monthly
- Verify backup integrity
- Review storage costs
- Test recovery procedure (quarterly recommended)

---

## Related Documentation

- [COMPREHENSIVE-BACKUP-STRATEGY.md](./COMPREHENSIVE-BACKUP-STRATEGY.md) - Complete 6-layer strategy
- [BACKUP-AND-DR-STRATEGY.md](../../workspace-management/BACKUP-AND-DR-STRATEGY.md) - Cross-workspace backup
- [RECOVERY-GUIDE-QUICK-REFERENCE.md](../../live-practice-management-system/live-practice-management-system/2-Application Layer (Google Sheets)/GitHub-Version-Control-System/RECOVERY-GUIDE-QUICK-REFERENCE.md) - Emergency recovery procedures

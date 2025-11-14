---
type: guide
tags: [github, secrets, setup, ci-cd]
---

# GitHub Secrets Setup Guide

**Purpose:** Add required secrets to GitHub repository for automated workflows
**Repository:** https://github.com/mmaruthurssd/medical-patient-data
**Last Updated:** 2025-11-14

---

## Required Secrets

Navigate to: https://github.com/mmaruthurssd/medical-patient-data/settings/secrets/actions

### 1. GCS_SERVICE_ACCOUNT_KEY

**Purpose:** Authenticate GitHub Actions to Google Cloud Storage for backups

**How to get the value:**
```bash
cat /Users/mmaruthurnew/Desktop/medical-patient-data/google-workspace-oauth-setup/service-account.json
```

**Steps:**
1. Click "New repository secret"
2. Name: `GCS_SERVICE_ACCOUNT_KEY`
3. Value: Paste the entire JSON output (including `{}`)
4. Click "Add secret"

**Expected format:**
```json
{
  "type": "service_account",
  "project_id": "workspace-automation-ssdspc",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "ssd-automation-service-account@workspace-automation-ssdspc.iam.gserviceaccount.com",
  ...
}
```

---

### 2. GCP_SERVICE_ACCOUNT

**Purpose:** Authenticate GitHub Actions to Google Drive for documentation sync

**How to get the value:**
```bash
cat /Users/mmaruthurnew/Desktop/medical-patient-data/google-workspace-oauth-setup/service-account.json
```

**Steps:**
1. Click "New repository secret"
2. Name: `GCP_SERVICE_ACCOUNT`
3. Value: Paste the same JSON as `GCS_SERVICE_ACCOUNT_KEY`
4. Click "Add secret"

---

### 3. CLASP_CREDENTIALS

**Purpose:** Authenticate GitHub Actions to Apps Script for automated snapshots

**How to get the value:**
```bash
cd "/Users/mmaruthurnew/Desktop/medical-patient-data/Implementation Projects/google-sheets-version-control"
cat .clasprc.json
```

**Steps:**
1. Click "New repository secret"
2. Name: `CLASP_CREDENTIALS`
3. Value: Paste the entire JSON output
4. Click "Add secret"

**Expected format:**
```json
{
  "token": {
    "access_token": "...",
    "refresh_token": "...",
    "scope": "...",
    "token_type": "Bearer",
    "expiry_date": ...
  },
  "oauth2ClientSettings": {
    "clientId": "...",
    "clientSecret": "...",
    "redirectUri": "..."
  },
  "isLocalCreds": false
}
```

---

## Verification

### Check Secrets Are Set

1. Go to: https://github.com/mmaruthurssd/medical-patient-data/settings/secrets/actions
2. Verify all three secrets appear in the list:
   - ✅ `CLASP_CREDENTIALS`
   - ✅ `GCP_SERVICE_ACCOUNT`
   - ✅ `GCS_SERVICE_ACCOUNT_KEY`

### Test Workflows

#### Test 1: Backup to GCS
1. Go to: https://github.com/mmaruthurssd/medical-patient-data/actions/workflows/backup-to-gcs.yml
2. Click "Run workflow" → "Run workflow"
3. Wait 2-3 minutes
4. Verify ✅ success (not ❌ failure)

#### Test 2: Sync Documentation
1. Go to: https://github.com/mmaruthurssd/medical-patient-data/actions/workflows/sync-docs-to-drive.yml
2. Click "Run workflow" → "Run workflow"
3. Wait ~30 seconds
4. Verify ✅ success

#### Test 3: Daily Snapshots
1. Go to: https://github.com/mmaruthurssd/medical-patient-data/actions/workflows/daily-snapshots.yml
2. Check last run status
3. Should show ✅ (runs at 9 AM and 5 PM Central)

---

## Security Best Practices

### ✅ DO:
- Use repository secrets (not environment secrets)
- Verify secrets have correct JSON format
- Test workflows after adding secrets
- Rotate service account keys annually

### ❌ DON'T:
- Share secrets in chat/email
- Commit secrets to git
- Use personal credentials for automation
- Give secrets more permissions than needed

---

## Troubleshooting

### Workflow fails with "Secret not found"

**Solution:** Re-add the secret following steps above

### Workflow fails with "Invalid credentials"

**Possible causes:**
1. JSON formatting issue (missing quotes, extra escaping)
2. Wrong service account file
3. Expired token (CLASP_CREDENTIALS only)

**Solution:**
- Delete and re-add the secret
- Ensure entire JSON is copied (including `{}`)
- For CLASP: regenerate credentials with `clasp login`

### Workflow fails with "Permission denied"

**Solution:** See [GCS-BACKUP-SETUP-GUIDE.md](./docs/GCS-BACKUP-SETUP-GUIDE.md) for permission setup

---

## Quick Copy Commands

**For easy access, run these to get credential values:**

```bash
# GCS_SERVICE_ACCOUNT_KEY and GCP_SERVICE_ACCOUNT
cat /Users/mmaruthurnew/Desktop/medical-patient-data/google-workspace-oauth-setup/service-account.json

# CLASP_CREDENTIALS
cd "/Users/mmaruthurnew/Desktop/medical-patient-data/Implementation Projects/google-sheets-version-control"
cat .clasprc.json
```

**After copying, add secrets here:**
https://github.com/mmaruthurssd/medical-patient-data/settings/secrets/actions

---

## What Each Workflow Uses

| Workflow | Secret Used |
|----------|-------------|
| Backup to Google Cloud Storage | `GCS_SERVICE_ACCOUNT_KEY` |
| Sync Documentation to Google Drive | `GCP_SERVICE_ACCOUNT` |
| Daily Sheet Snapshots | `CLASP_CREDENTIALS` |

---

## Next Steps After Setup

1. ✅ Add all three secrets to GitHub
2. ✅ Set up GCS bucket (see [GCS-BACKUP-SETUP-GUIDE.md](./docs/GCS-BACKUP-SETUP-GUIDE.md))
3. ✅ Test each workflow manually
4. ✅ Monitor for 24 hours to ensure automated runs succeed
5. ✅ Update [BACKUP-AND-DR-STRATEGY.md](../../workspace-management/BACKUP-AND-DR-STRATEGY.md) to mark Layer 5 as ✅ Active

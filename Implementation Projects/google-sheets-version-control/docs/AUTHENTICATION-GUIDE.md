# Google Sheets Version Control - Authentication Guide

**Last Updated:** 2025-11-13
**Status:** Service Account Recommended

---

## The Authentication Expiration Problem

You experienced this issue:
- Created clasp authentication
- It expired in ~1 hour
- Had to re-authenticate

**Why This Happens:**

Google OAuth **access tokens** expire after **1 hour**. This is by design for security.

Your `.clasprc.json` contains:
- `access_token`: Expires after 1 hour ⏱️
- `refresh_token`: Should auto-renew, but clasp may not always refresh it properly

---

## Solution: Use a Service Account (RECOMMENDED)

Service accounts are designed for automation and **never expire**.

### Why Service Accounts Are Better

| Feature | OAuth (Current) | Service Account |
|---------|----------------|-----------------|
| **Expiration** | 1 hour | Never expires ✅ |
| **Auto-renewal** | Sometimes fails | N/A - doesn't expire |
| **For automation** | ⚠️ Problematic | ✅ Perfect |
| **GitHub Actions** | Requires secrets refresh | ✅ Already using this |
| **Security** | User-based | Service-based (better for servers) |

### How to Switch to Service Account

#### Step 1: Get Your Service Account Key

You likely already have this from your GitHub Actions setup.

**Option A: Extract from GitHub Secret**

```bash
# If you have GitHub CLI
gh secret view GCP_SERVICE_ACCOUNT > service-account-key.json

# Or manually copy from GitHub:
# 1. Go to: https://github.com/mmaruthurssd/medical-patient-data/settings/secrets/actions
# 2. Find GCP_SERVICE_ACCOUNT
# 3. Copy the JSON value
```

**Option B: Create New Service Account Key**

1. Go to [Google Cloud Console - Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts)
2. Select your project
3. Click on your service account (or create one)
4. Go to **Keys** tab
5. Click **Add Key** → **Create new key** → **JSON**
6. Save the downloaded file securely

#### Step 2: Run the Setup Script

```bash
cd "Implementation Projects/google-sheets-version-control"

# Make script executable
chmod +x scripts/setup-service-account-auth.sh

# Run setup with your service account key
./scripts/setup-service-account-auth.sh /path/to/service-account-key.json
```

This will:
- Backup your current OAuth credentials
- Set `GOOGLE_APPLICATION_CREDENTIALS` environment variable
- Configure your shell for future sessions

#### Step 3: Grant Service Account Access (AUTOMATED)

The service account needs access to your Google Sheets. **We can automate this for all 235 sheets!**

**Run the automated sharing script:**

```bash
# First, test without making changes (dry run)
node scripts/grant-service-account-access.js --dry-run

# If everything looks good, run for real
node scripts/grant-service-account-access.js
```

This script will:
- Read all 235 sheets from `production-sheets.csv`
- Check which sheets the service account already has access to
- Grant Editor permissions to sheets that need it
- Skip sheets that already have access
- Show progress as it works through all sheets
- Complete in ~1-2 minutes (vs hours manually!)

**Example Output:**

```
🔐 Service Account Access Grant Tool

📋 Loading service account credentials...
   Service Account: sheets-automation@project.iam.gserviceaccount.com

📊 Loading production sheets from CSV...
   Found 235 sheets

🔌 Initializing Google Drive API...
   Connected ✅

🔄 Granting access to sheets...

[1/235] Transcripts - Dashboards - D25-527...
  ✅ Access granted
[2/235] Medicare Physician Practitioner - D25-525...
  ✅ Already has access (skipping)
...

📊 Summary
✅ Successfully granted access: 198
ℹ️  Already had access: 37
❌ Failed: 0
📊 Total processed: 235

✅ All sheets successfully shared with service account!
```

**Manual Method (if needed):**

If the automated script doesn't work for some reason:

1. Open each Google Sheet
2. Click **Share**
3. Add the service account email: `your-service-account@project.iam.gserviceaccount.com`
4. Grant **Editor** permissions
5. Uncheck "Notify people"
6. Click **Share**

(But the automated script is **much** faster!)

#### Step 4: Test Authentication

```bash
# Reload shell config
source ~/.zshrc  # or source ~/.bashrc

# Test clasp
npx @google/clasp list

# Should show your sheets without authentication errors
```

#### Step 5: Run the Missing Sheet Snapshot

```bash
node scripts/snapshot-single-sheet.js 204 \
  "Last Contribution Processing Sheet - Processing Sheets - PRS25-453 - SuperAdmin - Active" \
  "1-Jg0nbceDHwPeZLpU1a5sHd2h1hFM2H3EIePt7ai1bw" \
  "1undjXHwYc3z0I079ViD8kXOkIc2Ux1Gh64h5ou_ZaGenRZiXC5rMICcq"
```

### Service Account Permissions Required

Your service account needs these API scopes:

```json
{
  "scopes": [
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/script.projects",
    "https://www.googleapis.com/auth/spreadsheets"
  ]
}
```

These are typically enabled when creating the service account for Apps Script access.

---

## Alternative: Fix OAuth Auto-Refresh (NOT RECOMMENDED)

If you prefer to stick with OAuth despite the expiration issues:

### Option 1: Use GitHub Actions Credentials Locally

Your GitHub Actions has working credentials in `CLASP_CREDENTIALS` secret.

```bash
# Extract the credentials
gh secret view CLASP_CREDENTIALS > ~/.clasprc.json
chmod 600 ~/.clasprc.json

# Test
npx @google/clasp list
```

**Note:** These will also expire after 1 hour, requiring re-extraction.

### Option 2: Re-authenticate with Proper Scopes

```bash
# Logout
npx @google/clasp logout

# Login with all scopes
npx @google/clasp login

# This opens a browser - grant all requested permissions
# Especially "See, edit, create, and delete all your Google Drive files"
```

**Note:** Even with proper scopes, you'll need to re-authenticate periodically.

---

## Comparison Table

| Method | Expiration | Setup Complexity | Automation-Ready | Security |
|--------|-----------|------------------|------------------|----------|
| **Service Account** | Never ✅ | Medium (one-time) | ✅ Yes | ✅ High |
| **OAuth (manual login)** | 1 hour ❌ | Easy | ❌ No | ⚠️ Medium |
| **GitHub Secret OAuth** | 1 hour ❌ | Easy | ⚠️ Partial | ⚠️ Medium |

---

## Recommended Setup for Your Environment

Based on your use case (automated twice-daily snapshots + occasional manual snapshots):

### Production (GitHub Actions)
✅ **Already using service account** via `GCP_SERVICE_ACCOUNT` secret - Perfect!

### Local Development
🔄 **Switch to same service account**
- Consistent with GitHub Actions
- No expiration issues
- One-time setup

### Implementation

```bash
# 1. Extract service account from GitHub
gh secret view GCP_SERVICE_ACCOUNT > ~/service-account-keys/google-sheets-vc.json

# 2. Set up local authentication
./scripts/setup-service-account-auth.sh ~/service-account-keys/google-sheets-vc.json

# 3. Test
npx @google/clasp list

# 4. Done! No more authentication issues
```

---

## Troubleshooting

### "Service account doesn't have access to sheet"

**Solution:** Share the sheet with the service account email

```bash
# Find service account email
cat ~/service-account-keys/google-sheets-vc.json | grep client_email

# Share each sheet with this email (Editor permissions)
```

### "GOOGLE_APPLICATION_CREDENTIALS not found"

**Solution:** Reload your shell or set manually

```bash
# Reload
source ~/.zshrc

# Or set manually for current session
export GOOGLE_APPLICATION_CREDENTIALS="/full/path/to/service-account-key.json"
```

### "clasp still using OAuth"

**Solution:** Remove OAuth credentials

```bash
# Backup first
cp ~/.clasprc.json ~/.clasprc.json.backup

# Remove OAuth file
rm ~/.clasprc.json

# clasp will now use GOOGLE_APPLICATION_CREDENTIALS
```

---

## Security Best Practices

### Service Account Key Storage

**✅ DO:**
- Store in `~/service-account-keys/` with restricted permissions
- Set permissions to `600` (owner read/write only)
- Keep separate from git repositories
- Use different service accounts for dev/prod if needed

**❌ DON'T:**
- Commit service account keys to git
- Share keys via email or messaging
- Store in public locations
- Use personal Gmail OAuth for automation

### Example Secure Setup

```bash
# Create secure directory
mkdir -p ~/service-account-keys
chmod 700 ~/service-account-keys

# Move key file
mv ~/Downloads/service-account-key.json ~/service-account-keys/google-sheets-vc.json
chmod 600 ~/service-account-keys/google-sheets-vc.json

# Verify permissions
ls -la ~/service-account-keys/
# Should show: -rw------- (600)
```

---

## Migration Checklist

- [ ] Extract or create service account key
- [ ] Run `setup-service-account-auth.sh`
- [ ] Share all production sheets with service account
- [ ] Test with `npx @google/clasp list`
- [ ] Run snapshot for sheet 204
- [ ] Verify twice-daily GitHub Actions still work
- [ ] Document service account email for team
- [ ] Remove old OAuth `.clasprc.json` if no longer needed

---

## Summary

**Problem:** OAuth tokens expire after 1 hour
**Solution:** Use service account (never expires)
**Implementation:** Run `setup-service-account-auth.sh`
**Benefit:** No more authentication failures!

Your GitHub Actions already uses this method successfully - now your local development will too.

---

**Questions?** Check the troubleshooting section or see REMEDIATION-GUIDE.md

---
type: guide
tags: [gcs, setup, browser-steps]
---

# Create GCS Bucket - Browser Steps (5 minutes)

Since the service account needs permissions that require Console access, here's the easiest way to set this up in your browser.

---

## Step 1: Create the Bucket (2 minutes)

**URL:** https://console.cloud.google.com/storage/browser?project=ssd-sheets-backup-2025

### Instructions:
1. Click the link above
2. Sign in with your Google admin account
3. Click **"CREATE BUCKET"** (blue button at top)
4. Fill in the form:

   **Name your bucket:**
   ```
   ssd-sheets-backup-immutable
   ```

   **Choose where to store your data:**
   - Select "Region"
   - Choose: `us-central1 (Iowa)`

   **Choose a default storage class:**
   - Select: `Standard`

   **Choose how to control access:**
   - Select: ✅ **"Uniform"** (recommended)
   - Uncheck: ❌ "Enforce public access prevention"

   **Protect object data:**
   - ✅ Check: "Object versioning" → Keep all versions
   - ✅ Check: "Retention policy"
     - Set to: `30` days
     - (Do NOT lock the policy yet)

5. Click **"CREATE"** at the bottom

6. ✅ Bucket created!

---

## Step 2: Grant Service Account Permissions (2 minutes)

**Still on the bucket page:**

1. Click on your bucket name: **`ssd-sheets-backup-immutable`**

2. Click the **"PERMISSIONS"** tab at the top

3. Click **"+ GRANT ACCESS"** button

4. In the "Add principals" popup:

   **New principals:**
   ```
   ssd-automation-service-account@workspace-automation-ssdspc.iam.gserviceaccount.com
   ```

   **Select a role:**
   - Start typing: "Storage Admin"
   - Select: **"Storage Admin"**

5. Click **"SAVE"**

6. ✅ Permissions granted!

---

## Step 3: Create Folder Structure (1 minute)

**Still on the bucket page:**

1. Click the **"OBJECTS"** tab

2. Click **"CREATE FOLDER"** button

3. Create first folder:
   - Name: `daily-backups`
   - Click "CREATE"

4. Click **"CREATE FOLDER"** again

5. Create second folder:
   - Name: `monthly-archives`
   - Click "CREATE"

6. ✅ Folders created!

---

## Verification

You should now see:
- ✅ Bucket: `ssd-sheets-backup-immutable`
- ✅ Location: `us-central1`
- ✅ Storage class: `Standard`
- ✅ Versioning: `Enabled`
- ✅ Retention: `30 days`
- ✅ Service account has `Storage Admin` role
- ✅ Two folders: `daily-backups/` and `monthly-archives/`

---

## What to Do Next

Come back to Claude and say:

**"Bucket created"**

Claude will then:
- Test bucket access
- Verify all settings
- Run a test backup
- Configure GitHub secrets for you
- Test the backup workflow

---

## Quick Reference

**Bucket Name:** `ssd-sheets-backup-immutable`
**Project:** `ssd-sheets-backup-2025`
**Location:** `us-central1`
**Service Account:** `ssd-automation-service-account@workspace-automation-ssdspc.iam.gserviceaccount.com`
**Role:** `Storage Admin`

---

## Troubleshooting

### "Project not found: ssd-sheets-backup-2025"

**Option A:** Use a different project
- Click the project dropdown at the top
- Select any project you have access to
- Use that project name instead

**Option B:** Create the project
- Go to: https://console.cloud.google.com/projectcreate
- Name: `ssd-sheets-backup-2025`
- Click "CREATE"
- Then follow the bucket creation steps

### "You don't have permission"

You need to be an Owner or Editor on the Google Cloud project. Contact your IT admin or use a different project where you have permissions.

### "Service account email not found"

Double-check you copied the email exactly:
```
ssd-automation-service-account@workspace-automation-ssdspc.iam.gserviceaccount.com
```

---

## Summary

**You just:**
1. ✅ Created a secure cloud storage bucket
2. ✅ Enabled automatic versioning (all file versions saved)
3. ✅ Set 30-day deletion protection
4. ✅ Granted your service account full access
5. ✅ Created organized folder structure

**Total time:** ~5 minutes

**Result:** Enterprise-grade immutable backup storage for your 470 production sheets!

**Next:** Tell Claude "Bucket created" and I'll test everything and finish the setup!

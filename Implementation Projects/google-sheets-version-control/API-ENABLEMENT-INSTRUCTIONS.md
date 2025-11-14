---
type: guide
tags: [setup, gcp, apis]
---

# API Enablement Instructions - Step by Step

**Time Required:** 2-3 minutes (just 4 clicks)

---

## Which Google Account to Use

**Use your Google Workspace admin account:** The account that has access to your Google Cloud projects

**Likely:** `automation@ssdspc.com` or your main admin account

---

## Step 1: Enable Cloud Resource Manager API

**URL:** https://console.developers.google.com/apis/api/cloudresourcemanager.googleapis.com/overview?project=1009524936829

### Instructions:
1. Click the link above
2. **Sign in** with your Google admin account if prompted
3. You'll see a page titled "Cloud Resource Manager API"
4. Click the blue **"ENABLE"** button
5. Wait ~10 seconds for "API enabled" confirmation
6. **✅ Done!** Close the tab

**What this does:** Allows the service account to manage Google Cloud resources

---

## Step 2: Enable Cloud Storage API

**URL:** https://console.cloud.google.com/apis/library/storage-component.googleapis.com?project=ssd-sheets-backup-2025

### Instructions:
1. Click the link above
2. If prompted to select a project, choose **"ssd-sheets-backup-2025"**
3. You'll see a page titled "Cloud Storage API"
4. Click the blue **"ENABLE"** button
5. Wait ~10 seconds for "API enabled" confirmation
6. **✅ Done!** Close the tab

**What this does:** Allows the service account to create and access cloud storage buckets

---

## Verification

After enabling both APIs, wait **2-3 minutes** for the changes to propagate through Google's systems.

Then tell Claude: **"APIs enabled"**

Claude will then:
- Create the GCS bucket
- Configure all settings
- Test the setup
- Verify everything works

---

## Troubleshooting

### "You don't have permission to enable APIs"

**Solution:** You need to be signed in as a project owner or editor. Try:
- Your Google Workspace admin account
- The account that created the Google Cloud projects
- Contact your IT admin if you're not the owner

### "Project not found"

**Solution:** The project may not exist yet. That's okay - we'll create the bucket in a different project. Just enable the Cloud Resource Manager API (Step 1).

### "API is already enabled"

**Great!** That means it was enabled previously. Just move to the next step or tell Claude "APIs enabled".

---

## What Happens Next

Once you tell Claude "APIs enabled", Claude will automatically:

1. ✅ Create GCS bucket: `gs://ssd-sheets-backup-immutable`
2. ✅ Enable versioning (keeps all file versions)
3. ✅ Set 30-day retention policy (can't delete for 30 days)
4. ✅ Grant service account Storage Admin permissions
5. ✅ Create backup directory structure
6. ✅ Test access and verify everything works
7. ✅ Run a test backup

**Total automation time:** 2-3 minutes

---

## Summary

**You do:** Click 2 links, click 2 "Enable" buttons (2 minutes)
**Claude does:** Everything else automatically (2-3 minutes)

**Ready?** Click the links above, enable both APIs, then come back and say "APIs enabled"!

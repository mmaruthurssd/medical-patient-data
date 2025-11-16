# Using Your Existing Google Cloud Account

**Good News:** You already have Google Cloud set up! This guide shows how to use your existing automation account for the Google Workspace Materials MCP.

---

## Your Current Setup

### ✅ Already Configured

**Google Cloud Project:**
```
workspace-automation-ssdspc
```

**Service Account:**
```
ssd-automation-service-account@workspace-automation-ssdspc.iam.gserviceaccount.com
```

**Currently Used For:**
- Google Sheets version control (GitHub Actions)
- GCS bucket backups
- Apps Script automation
- Drive file operations

**Service Account Key File:**
```
/Users/mmaruthurnew/Desktop/medical-patient-data/google-workspace-oauth-setup/service-account.json
```

**References:**
- `Implementation Projects/google-sheets-version-control/GITHUB-SECRETS-SETUP.md`
- `Implementation Projects/google-sheets-version-control/GCS-BUCKET-CREATION-STEPS.md`

---

## What You Need to Do (25 minutes)

Since you already have the service account, you only need to:

### 1. Enable Additional APIs (5 minutes)

Your automation account needs access to Drive, Docs, and Slides APIs.

**Steps:**
1. Go to: https://console.cloud.google.com/
2. Select project: `workspace-automation-ssdspc`
3. Go to **APIs & Services** → **Library**
4. Enable these APIs:
   - [ ] **Google Drive API** (if not already enabled)
   - [ ] **Google Docs API** (new)
   - [ ] **Google Slides API** (new)

**Note:** Drive API might already be enabled from your Google Sheets work.

---

### 2. Create Drive Folder Structure (5 minutes)

Create folders for the MCP to use:

1. Go to: https://drive.google.com/
2. Create main folder: `AI Print Materials`
3. Inside that folder, create:
   - `Templates/`
   - `Generated/`
   - `Archive/`
   - `config/`

**Folder structure should look like:**
```
AI Print Materials/
├── Templates/
├── Generated/
├── Archive/
└── config/
```

---

### 3. Share Folders with Service Account (2 minutes)

Give your automation account access to the folders:

1. Right-click the **root folder** (`AI Print Materials`)
2. Click **Share**
3. Paste this email:
   ```
   ssd-automation-service-account@workspace-automation-ssdspc.iam.gserviceaccount.com
   ```
4. Set permission: **Editor**
5. **Uncheck** "Notify people" (no need to email the bot)
6. Click **Share**

**Important:** Only share the root folder - subfolders inherit permissions automatically.

---

### 4. Record Folder IDs (3 minutes)

For each folder, get its ID from the URL:

1. Open the folder in Drive
2. Look at URL: `https://drive.google.com/drive/folders/FOLDER_ID_HERE`
3. Copy the folder ID (everything after `/folders/`)

**Record these:**
```
Root (AI Print Materials):  _______________________________
Templates:                  _______________________________
Generated:                  _______________________________
Archive:                    _______________________________
Config:                     _______________________________
```

---

### 5. Configure MCP (10 minutes)

#### Step 5.1: Copy Service Account Key

```bash
# Navigate to project
cd /Users/mmaruthurnew/Desktop/medical-patient-data/development/mcp-servers/google-workspace-materials-project

# Create config directory
mkdir -p config

# Copy your existing service account key
cp /Users/mmaruthurnew/Desktop/medical-patient-data/google-workspace-oauth-setup/service-account.json \
   config/google-service-account.json

# Verify
ls -la config/google-service-account.json
```

#### Step 5.2: Create .env File

```bash
# Copy template
cp .env.example .env

# Edit with your folder IDs
nano .env
```

Fill in `.env` with your folder IDs from Step 4:

```bash
# Google Service Account (using your existing account)
GOOGLE_SERVICE_ACCOUNT_KEY_PATH=./config/google-service-account.json

# Google Drive Folder IDs (from Step 4)
DRIVE_ROOT_FOLDER_ID=your_root_folder_id_here
DRIVE_TEMPLATES_FOLDER_ID=your_templates_folder_id_here
DRIVE_GENERATED_FOLDER_ID=your_generated_folder_id_here
DRIVE_ARCHIVE_FOLDER_ID=your_archive_folder_id_here
DRIVE_CONFIG_FOLDER_ID=your_config_folder_id_here

# Local Storage
LOCAL_MATERIALS_PATH=./materials
LOCAL_INDEX_PATH=./materials/print-materials-index.json

# MCP Server Settings
MCP_SERVER_NAME=google-workspace-materials
MCP_SERVER_VERSION=1.0.0
LOG_LEVEL=info
```

#### Step 5.3: Build and Register

```bash
# Build the project
npm run build

# Should see: "Compiled successfully (0 errors)"
```

Edit `~/.claude.json` and add:

```json
{
  "mcpServers": {
    "google-workspace-materials": {
      "command": "node",
      "args": [
        "/Users/mmaruthurnew/Desktop/medical-patient-data/development/mcp-servers/google-workspace-materials-project/dist/index.js"
      ],
      "env": {
        "GOOGLE_SERVICE_ACCOUNT_KEY_PATH": "/Users/mmaruthurnew/Desktop/medical-patient-data/development/mcp-servers/google-workspace-materials-project/config/google-service-account.json",
        "DRIVE_ROOT_FOLDER_ID": "your_root_folder_id",
        "DRIVE_TEMPLATES_FOLDER_ID": "your_templates_folder_id",
        "DRIVE_GENERATED_FOLDER_ID": "your_generated_folder_id",
        "DRIVE_ARCHIVE_FOLDER_ID": "your_archive_folder_id",
        "DRIVE_CONFIG_FOLDER_ID": "your_config_folder_id"
      }
    }
  }
}
```

**Remember:** Replace `your_root_folder_id` etc. with actual IDs from Step 4.

---

## Testing (5 minutes)

### Test 1: Verify MCP Loads

Restart Claude Code (close and reopen completely).

Ask Claude:
```
What Google Workspace Materials tools do you have?
```

**Expected:** List of 10 tools

---

### Test 2: Initialize Drive

Ask Claude:
```
Initialize the Google Drive structure for print materials.
```

**Expected:**
- ✅ Index file created in Drive config/ folder
- ✅ No errors

---

### Test 3: Create Material

Ask Claude:
```
Create a simple patient handout about staying hydrated.
Use 6th grade reading level.
Save as Google Doc to Drive.
```

**Expected:**
- ✅ Document created and visible in Drive Templates/ folder
- ✅ Can open and read the document

---

### Test 4: Export PDF

Ask Claude:
```
Export that hydration handout to PDF.
```

**Expected:**
- ✅ PDF created in Drive Generated/[today's date]/ folder
- ✅ PDF opens correctly

---

## Advantages of Using Existing Account

✅ **No new billing:** Uses existing Google Cloud project
✅ **Centralized credentials:** One service account for all automation
✅ **Consistent permissions:** Same security model as existing workflows
✅ **No additional setup:** APIs, billing, and IAM already configured

---

## Security Notes

Your service account already has:
- ✅ Access to Google Sheets (Apps Script)
- ✅ Access to GCS buckets (backups)
- ✅ Access to GitHub Actions (CI/CD)

Adding this MCP gives it:
- ✅ Access to "AI Print Materials" Drive folder ONLY
- ✅ Editor permission (can read/write files)
- ❌ NO access to other Drive folders
- ❌ NO access to patient data sheets

**This is secure and follows your existing security model.**

---

## Troubleshooting

### "Service account authentication failed"

**Check:**
```bash
# Verify key file exists
ls -la /Users/mmaruthurnew/Desktop/medical-patient-data/google-workspace-oauth-setup/service-account.json

# Verify it's valid JSON
head -n 5 /Users/mmaruthurnew/Desktop/medical-patient-data/google-workspace-oauth-setup/service-account.json
```

Should see:
```json
{
  "type": "service_account",
  "project_id": "workspace-automation-ssdspc",
  "client_email": "ssd-automation-service-account@workspace-automation-ssdspc.iam.gserviceaccount.com",
```

---

### "Drive folder not found"

**Check:**
1. Folder IDs in `.env` match Drive URLs exactly
2. Service account has Editor access to root folder
3. Folders are not in Trash

**Fix:**
- Re-share AI Print Materials folder with service account
- Verify folder IDs (copy from URL again)

---

### "API not enabled"

**Check:**
```
Go to: https://console.cloud.google.com/apis/dashboard?project=workspace-automation-ssdspc
```

Should see:
- ✅ Google Drive API
- ✅ Google Docs API
- ✅ Google Slides API

All showing as "Enabled"

---

## Comparison: Full Setup vs Using Existing Account

| Step | New Account | Existing Account |
|------|-------------|------------------|
| Create GCP project | 5 min | ✅ Skip (already done) |
| Enable billing | 2 min | ✅ Skip (already done) |
| Create service account | 5 min | ✅ Skip (already done) |
| Generate key | 2 min | ✅ Skip (already done) |
| Enable APIs | 5 min | 5 min (just add 2 APIs) |
| Create Drive folders | 5 min | 5 min |
| Share with service account | 2 min | 2 min |
| Configure MCP | 10 min | 10 min |
| **Total** | **~35 min** | **~25 min** ✨ |

**Time saved:** 10 minutes

---

## What Happens After Setup

Once configured, you can immediately:

**Create materials:**
```
Claude, create a discharge handout for knee surgery patients.
```

**Edit materials:**
```
Claude, simplify our diabetes handout to 6th grade reading level.
```

**Export to PDF:**
```
Claude, export all consent forms to PDF.
```

**Search materials:**
```
Claude, find all patient education materials about diabetes.
```

---

## Need Help?

**Configuration issues:** See `DEPLOYMENT-GUIDE.md` troubleshooting section
**Usage questions:** See `SIMPLIFIED-EXPLANATION.md` for examples
**Technical details:** See `README.md` for API documentation

---

**Summary:**

You already have 80% of the setup done! Just need to:
1. Enable 2 new APIs (5 min)
2. Create Drive folders (5 min)
3. Share with existing service account (2 min)
4. Configure MCP (10 min)
5. Test (3 min)

**Total: ~25 minutes to full deployment** 🚀

---

**Last Updated:** 2025-11-15
**Your Service Account:** `ssd-automation-service-account@workspace-automation-ssdspc.iam.gserviceaccount.com`
**Project:** `workspace-automation-ssdspc`

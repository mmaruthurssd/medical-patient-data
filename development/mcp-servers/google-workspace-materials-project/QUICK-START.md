# Quick Start Guide - Google Workspace Materials MCP

Get up and running in 60 minutes.

---

## Prerequisites (5 minutes)

- [ ] Google Cloud account with billing enabled
- [ ] Google Workspace admin access
- [ ] Node.js 18+ installed
- [ ] Claude Code installed

---

## Step 1: Google Cloud Setup (20 minutes)

### Create Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project: `medical-workspace-materials`

### Enable APIs
3. Enable **Google Drive API**
4. Enable **Google Docs API**
5. Enable **Google Slides API**

### Create Service Account
6. Go to **IAM & Admin** → **Service Accounts**
7. Create service account: `workspace-materials-mcp`
8. Generate JSON key and download
9. Save as `google-service-account.json`
10. **Copy the service account email** (you'll need this)

---

## Step 2: Google Drive Setup (10 minutes)

### Create Folders
1. In Google Drive, create folder: `AI Print Materials`
2. Inside, create subfolders:
   - `Templates/`
   - `Generated/`
   - `Archive/`
   - `config/`

### Share with Service Account
3. Right-click `AI Print Materials` folder
4. Click **Share**
5. Paste service account email from Step 1
6. Set permission: **Editor**
7. Uncheck "Notify people"
8. Click **Share**

### Get Folder IDs
9. Open each folder and copy ID from URL:
   ```
   https://drive.google.com/drive/folders/FOLDER_ID_HERE
                                         ↑ Copy this part
   ```

Record these IDs:
```
Root:      ___________________
Templates: ___________________
Generated: ___________________
Archive:   ___________________
Config:    ___________________
```

---

## Step 3: Configure MCP (15 minutes)

### Install Service Account Key
```bash
# Navigate to project
cd development/mcp-servers/google-workspace-materials-project

# Create config directory
mkdir -p config

# Copy your downloaded key file
cp ~/Downloads/google-service-account.json config/

# Verify
ls -la config/google-service-account.json
```

### Create Environment File
```bash
# Copy template
cp .env.example .env

# Edit with your values
# Use the folder IDs from Step 2
nano .env
```

Fill in `.env`:
```bash
GOOGLE_SERVICE_ACCOUNT_KEY_PATH=./config/google-service-account.json
DRIVE_ROOT_FOLDER_ID=your_root_folder_id_here
DRIVE_TEMPLATES_FOLDER_ID=your_templates_folder_id_here
DRIVE_GENERATED_FOLDER_ID=your_generated_folder_id_here
DRIVE_ARCHIVE_FOLDER_ID=your_archive_folder_id_here
DRIVE_CONFIG_FOLDER_ID=your_config_folder_id_here
LOCAL_MATERIALS_PATH=./materials
LOCAL_INDEX_PATH=./materials/print-materials-index.json
MCP_SERVER_NAME=google-workspace-materials
MCP_SERVER_VERSION=1.0.0
LOG_LEVEL=info
```

### Register with Claude Code
Edit `~/.claude.json`:
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

**Important:** Replace `your_root_folder_id` etc. with actual IDs from Step 2.

---

## Step 4: Test Installation (10 minutes)

### Build Project
```bash
npm run build
```

Expected: ✅ `Compiled successfully (0 errors)`

### Test Server
```bash
npm run dev
```

Expected output:
```
🚀 Google Workspace Materials MCP Server starting...
✓ Service account authenticated
✓ Drive client initialized
✓ 10 tools registered
✓ Server ready on stdio
```

Press Ctrl+C to stop.

### Restart Claude Code
Close and reopen Claude Code completely.

### Verify Tools Available
In Claude Code:
```
Claude, what Google Workspace Materials tools do you have?
```

Expected: List of 10 tools.

---

## Step 5: Create Your First Material (5 minutes)

### Initialize Drive
```
Claude, initialize the Google Drive structure for print materials.
```

### Generate Material
```
Claude, create a patient handout about managing high blood pressure.

Requirements:
- 6th grade reading level
- Include lifestyle changes and medication reminders
- Save as Google Doc to Drive
```

### Export to PDF
```
Claude, export that handout to PDF.
```

### View in Drive
Check your `AI Print Materials/Generated/` folder in Google Drive. You should see:
- Google Doc version
- PDF version (in date-based subfolder)

---

## Common Issues

### "Service account authentication failed"
- Check `GOOGLE_SERVICE_ACCOUNT_KEY_PATH` points to valid file
- Verify JSON key file format
- Ensure file has correct permissions

### "Drive folder not found"
- Verify folder IDs match Drive URLs
- Ensure service account has Editor access
- Check folders not in Trash

### "MCP server failed to start"
- Run `npm run build` first
- Check `~/.claude.json` syntax
- Verify all paths are absolute, not relative
- Check Node.js version (need 18+)

### Tools not showing in Claude Code
- Restart Claude Code completely
- Check MCP registered in `~/.claude.json`
- Verify `dist/index.js` exists
- Check error logs in Claude Code

---

## What's Next?

### Create More Templates
```
Claude, create templates for:
- Diabetes self-management
- Post-surgery wound care
- Medication instructions
```

### Organize Your Library
```
Claude, query the materials index and show me everything sorted by usage.
```

### Batch Operations
```
Claude, export all patient education materials to PDF.
```

---

## Getting Help

**Full Documentation:**
- Deployment guide: `DEPLOYMENT-GUIDE.md`
- Usage examples: `EXAMPLES.md`
- API reference: `README.md`
- Implementation details: `IMPLEMENTATION-PLAN.md`

**Troubleshooting:**
- Check `DEPLOYMENT-GUIDE.md` troubleshooting section
- Review error logs
- Verify Google Cloud API quotas

---

## Success Checklist

Before considering setup complete:

- [ ] Google Cloud project created with billing
- [ ] 3 APIs enabled (Drive, Docs, Slides)
- [ ] Service account created with JSON key
- [ ] Drive folders created and shared
- [ ] Folder IDs recorded
- [ ] `.env` file configured
- [ ] `~/.claude.json` updated
- [ ] Build succeeds without errors
- [ ] Claude Code shows 10 tools
- [ ] Can create material from prompt
- [ ] Can export to PDF
- [ ] Can query index
- [ ] Materials visible in Drive

---

**Estimated Setup Time:** 60 minutes
**Skills Required:** Basic command line, Google Cloud navigation
**Support:** See full documentation in project folder

Once complete, you can create medical print materials in 2-3 minutes instead of 20-30 minutes!

# Deployment Checklist - Google Workspace Materials MCP

Print this checklist and check off each step as you complete it.

---

## Pre-Deployment Checklist

### Prerequisites Verification
- [ ] Have Google Cloud account with billing enabled
- [ ] Have Google Workspace admin access
- [ ] Node.js 18+ installed locally
- [ ] Claude Code installed and working
- [ ] Have 60 minutes available for setup

---

## Google Cloud Setup (20 minutes)

### Create Project
- [ ] Go to https://console.cloud.google.com/
- [ ] Click "New Project"
- [ ] Name: `medical-workspace-materials`
- [ ] Click "Create"
- [ ] Project created successfully

### Enable APIs
- [ ] Navigate to APIs & Services → Library
- [ ] Enable "Google Drive API"
- [ ] Enable "Google Docs API"
- [ ] Enable "Google Slides API"
- [ ] All 3 APIs showing as "Enabled"

### Create Service Account
- [ ] Go to IAM & Admin → Service Accounts
- [ ] Click "Create Service Account"
- [ ] Name: `workspace-materials-mcp`
- [ ] Click "Create and Continue"
- [ ] Skip role assignment (click Continue)
- [ ] Click "Done"

### Generate Key
- [ ] Click on the new service account
- [ ] Go to "Keys" tab
- [ ] Click "Add Key" → "Create new key"
- [ ] Select "JSON"
- [ ] Click "Create"
- [ ] Key file downloaded

### Record Information
- [ ] Service account email: _________________________________
- [ ] Key file saved to: _________________________________
- [ ] Key file renamed to: `google-service-account.json`

---

## Google Drive Setup (10 minutes)

### Create Folders
- [ ] Go to https://drive.google.com/
- [ ] Create folder: `AI Print Materials`
- [ ] Inside, create: `Templates/`
- [ ] Inside, create: `Generated/`
- [ ] Inside, create: `Archive/`
- [ ] Inside, create: `config/`

### Share with Service Account
- [ ] Right-click `AI Print Materials` folder
- [ ] Click "Share"
- [ ] Paste service account email
- [ ] Set permission to "Editor"
- [ ] Uncheck "Notify people"
- [ ] Click "Share"
- [ ] Service account has access

### Record Folder IDs
Open each folder and copy ID from URL:

- [ ] Root folder ID: _________________________________
- [ ] Templates ID: _________________________________
- [ ] Generated ID: _________________________________
- [ ] Archive ID: _________________________________
- [ ] Config ID: _________________________________

---

## Local Configuration (15 minutes)

### Copy Service Account Key
```bash
cd /Users/mmaruthurnew/Desktop/medical-patient-data/development/mcp-servers/google-workspace-materials-project
mkdir -p config
cp ~/Downloads/google-service-account.json config/
ls -la config/google-service-account.json
```

- [ ] Key file copied to `config/`
- [ ] File permissions look correct

### Configure Environment
```bash
cp .env.example .env
nano .env
```

Edit `.env` with your folder IDs:
- [ ] GOOGLE_SERVICE_ACCOUNT_KEY_PATH configured
- [ ] DRIVE_ROOT_FOLDER_ID configured
- [ ] DRIVE_TEMPLATES_FOLDER_ID configured
- [ ] DRIVE_GENERATED_FOLDER_ID configured
- [ ] DRIVE_ARCHIVE_FOLDER_ID configured
- [ ] DRIVE_CONFIG_FOLDER_ID configured
- [ ] All other variables set

### Build Project
```bash
npm run build
```

- [ ] Build completed successfully
- [ ] No errors reported
- [ ] `dist/` directory created

### Register with Claude Code
Edit `~/.claude.json`:

- [ ] Added `google-workspace-materials` entry
- [ ] `command` points to `node`
- [ ] `args` points to correct `dist/index.js` path
- [ ] All folder IDs in `env` match `.env` file
- [ ] Service account key path is absolute
- [ ] JSON syntax is valid (no trailing commas)

### Restart Claude Code
- [ ] Closed Claude Code completely
- [ ] Reopened Claude Code
- [ ] Claude Code started successfully

---

## Testing & Validation (10 minutes)

### Verify MCP Loaded
Ask Claude: "What Google Workspace Materials tools do you have?"

- [ ] Claude responds with list of 10 tools
- [ ] All tool names look correct
- [ ] No error messages

### Initialize Drive Structure
Ask Claude: "Initialize the Google Drive structure for print materials."

- [ ] Command executed successfully
- [ ] No errors reported
- [ ] Index file created in Drive config/ folder

### Create Test Material
Ask Claude:
```
Create a simple patient handout about staying hydrated.
Use 6th grade reading level.
Save as Google Doc to Drive.
```

- [ ] Material generated successfully
- [ ] Content looks appropriate
- [ ] Saved to Drive Templates/ folder
- [ ] Can open file in Google Drive

### Export to PDF
Ask Claude: "Export that hydration handout to PDF."

- [ ] PDF export succeeded
- [ ] PDF created in Generated/ folder
- [ ] PDF opens and looks correct
- [ ] Date-based subfolder created

### Query Index
Ask Claude: "Show me all materials in the index."

- [ ] Index query succeeded
- [ ] Test material appears in results
- [ ] Metadata looks correct

---

## Production Deployment (Optional)

### Move to Production
```bash
cp -r /Users/mmaruthurnew/Desktop/medical-patient-data/development/mcp-servers/google-workspace-materials-project \
      /Users/mmaruthurnew/Desktop/medical-patient-data/production/mcp-servers/google-workspace-materials
```

- [ ] Files copied to production/
- [ ] Updated `~/.claude.json` with production path
- [ ] Removed development entry from config
- [ ] Restarted Claude Code
- [ ] Production instance working

---

## Post-Deployment Tasks

### Create Initial Templates
- [ ] Discharge instructions template
- [ ] Patient education template
- [ ] Consent form template
- [ ] Medication guide template
- [ ] Pre-op instructions template
- [ ] 5+ additional templates as needed

### Documentation
- [ ] Document folder IDs in secure location
- [ ] Create user guide for staff
- [ ] Document common prompts
- [ ] Set up template library guide

### Training
- [ ] Train clinical staff on usage
- [ ] Share example prompts
- [ ] Demonstrate PDF export
- [ ] Show Drive organization

### Monitoring
- [ ] Monitor first week of usage
- [ ] Collect feedback
- [ ] Fix any issues
- [ ] Optimize frequently used templates

---

## Troubleshooting Quick Reference

### Service account auth failed
- [ ] Check key file path in `.env`
- [ ] Verify key file is valid JSON
- [ ] Ensure file has correct permissions

### Drive folder not found
- [ ] Verify folder IDs match Drive URLs
- [ ] Check service account has Editor access
- [ ] Ensure folders not in Trash

### MCP server failed to start
- [ ] Run `npm run build` first
- [ ] Check `~/.claude.json` syntax
- [ ] Verify all paths are absolute
- [ ] Check Node.js version (need 18+)

### Tools not showing
- [ ] Restart Claude Code completely
- [ ] Check MCP registered in config
- [ ] Verify `dist/index.js` exists
- [ ] Review Claude Code error logs

---

## Success Verification

All checkboxes below should be checked before considering deployment complete:

- [ ] Google Cloud project created
- [ ] 3 APIs enabled
- [ ] Service account created with key
- [ ] Drive folders created and shared
- [ ] Folder IDs recorded
- [ ] `.env` configured
- [ ] `~/.claude.json` updated
- [ ] Build succeeds
- [ ] Claude Code shows 10 tools
- [ ] Can create material from prompt
- [ ] Can export to PDF
- [ ] Can query index
- [ ] Materials visible in Drive
- [ ] No critical errors in testing

---

## Final Checklist

- [ ] All setup steps completed
- [ ] All tests passed
- [ ] Documentation reviewed
- [ ] Staff trained (if applicable)
- [ ] Backup of configuration saved
- [ ] Production deployment complete (if doing production)

---

## Time Tracking

Start time: _________
End time: _________
Total time: _________ (Target: 60 minutes)

---

## Notes

Use this space for any issues encountered or notes for future reference:

_____________________________________________________________

_____________________________________________________________

_____________________________________________________________

_____________________________________________________________

---

**Deployment Date:** ___________
**Deployed By:** ___________
**Status:** [ ] Complete  [ ] In Progress  [ ] Issues

---

**For detailed instructions, see:**
- Quick start: `QUICK-START.md`
- Full guide: `DEPLOYMENT-GUIDE.md`
- Troubleshooting: `DEPLOYMENT-GUIDE.md` (troubleshooting section)

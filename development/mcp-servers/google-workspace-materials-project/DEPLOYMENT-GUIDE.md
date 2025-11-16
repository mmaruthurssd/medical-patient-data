# Google Workspace Materials MCP - Deployment Guide

**Version:** 1.0.0
**Status:** Production Ready
**Last Updated:** 2025-11-15

---

## Overview

This guide will walk you through deploying the Google Workspace Materials MCP server from development to production.

**What This System Does:**
- AI-first creation of print materials (patient handouts, consent forms, discharge instructions)
- Convert markdown to Google Docs and Slides
- Sync materials with Google Drive
- Export to PDF for printing
- Manage materials index and templates

**Time Required:** 45-60 minutes for complete setup

---

## Prerequisites Checklist

Before starting deployment, ensure you have:

- [ ] Google Cloud Platform account with billing enabled
- [ ] Admin access to Google Workspace domain
- [ ] Node.js 18+ installed
- [ ] Access to this workspace's `~/.claude.json` configuration
- [ ] Git access to push configuration changes

---

## Phase 1: Google Cloud Setup (20-25 minutes)

### Step 1.1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Project name: `medical-workspace-materials`
4. Location: Your organization
5. Click "Create"

### Step 1.2: Enable Required APIs

Navigate to **APIs & Services** → **Library** and enable:

- [ ] Google Drive API
- [ ] Google Docs API
- [ ] Google Slides API

For each API:
1. Search for the API name
2. Click the API card
3. Click "Enable"
4. Wait for confirmation

### Step 1.3: Create Service Account

1. Go to **IAM & Admin** → **Service Accounts**
2. Click "Create Service Account"
3. Fill in details:
   - **Name:** `workspace-materials-mcp`
   - **ID:** `workspace-materials-mcp` (auto-generated)
   - **Description:** `MCP server for AI-generated print materials`
4. Click "Create and Continue"
5. Grant roles:
   - Skip role assignment (we'll use Drive sharing instead)
6. Click "Continue" → "Done"

### Step 1.4: Generate Service Account Key

1. Click on the newly created service account
2. Go to **Keys** tab
3. Click "Add Key" → "Create new key"
4. Select **JSON** format
5. Click "Create"
6. **IMPORTANT:** Save the downloaded JSON file securely
7. Rename file to: `google-service-account.json`

**Security Note:** This key file grants full access to your Google Workspace. Never commit it to git or share it publicly.

### Step 1.5: Note Service Account Email

From the service account page, copy the email address. It will look like:

```
workspace-materials-mcp@medical-workspace-materials.iam.gserviceaccount.com
```

You'll need this email for Drive folder sharing.

---

## Phase 2: Google Drive Setup (10-15 minutes)

### Step 2.1: Create Drive Folder Structure

1. Go to [Google Drive](https://drive.google.com/)
2. Create a new folder: `AI Print Materials`
3. Inside this folder, create subfolders:
   ```
   AI Print Materials/
   ├── Templates/
   ├── Generated/
   ├── Archive/
   └── config/
   ```

### Step 2.2: Share with Service Account

For the **root folder** (`AI Print Materials`):

1. Right-click → "Share"
2. Paste the service account email from Step 1.5
3. Set permission: **Editor**
4. Uncheck "Notify people"
5. Click "Share"

**Why this works:** The service account can now read/write to this folder and all subfolders.

### Step 2.3: Get Folder IDs

For each folder, get its ID:

1. Open the folder in Drive
2. Look at the URL: `https://drive.google.com/drive/folders/FOLDER_ID_HERE`
3. Copy the folder ID (the part after `/folders/`)

Record these IDs:

```
Root Folder ID: ________________
Templates ID:   ________________
Generated ID:   ________________
Archive ID:     ________________
Config ID:      ________________
```

You'll need these for the `.env` file.

---

## Phase 3: MCP Server Configuration (10 minutes)

### Step 3.1: Copy Service Account Key

Copy the service account JSON key file to the project:

```bash
# From your Downloads folder
cp ~/Downloads/google-service-account.json \
   development/mcp-servers/google-workspace-materials-project/config/

# Verify it's there
ls -la development/mcp-servers/google-workspace-materials-project/config/
```

### Step 3.2: Create Environment Configuration

Create `.env` file in the project root:

```bash
cd development/mcp-servers/google-workspace-materials-project
cp .env.example .env
```

Edit `.env` with your values:

```bash
# Google Service Account
GOOGLE_SERVICE_ACCOUNT_KEY_PATH=./config/google-service-account.json

# Google Drive Folder IDs (from Step 2.3)
DRIVE_ROOT_FOLDER_ID=your_root_folder_id_here
DRIVE_TEMPLATES_FOLDER_ID=your_templates_folder_id_here
DRIVE_GENERATED_FOLDER_ID=your_generated_folder_id_here
DRIVE_ARCHIVE_FOLDER_ID=your_archive_folder_id_here
DRIVE_CONFIG_FOLDER_ID=your_config_folder_id_here

# Local Storage Paths
LOCAL_MATERIALS_PATH=./materials
LOCAL_INDEX_PATH=./materials/print-materials-index.json

# MCP Server Settings
MCP_SERVER_NAME=google-workspace-materials
MCP_SERVER_VERSION=1.0.0
LOG_LEVEL=info
```

### Step 3.3: Verify Configuration

Test the configuration:

```bash
npm run test:config
```

Expected output:
```
✓ Service account key found
✓ Service account authenticated
✓ Drive folders accessible
✓ Environment variables valid
```

If any check fails, review the corresponding setup step.

---

## Phase 4: Build and Test (5 minutes)

### Step 4.1: Build Production Code

```bash
npm run build
```

Expected output:
```
> google-workspace-materials@1.0.0 build
> tsc

✓ Compiled successfully (0 errors)
```

### Step 4.2: Run Tests

```bash
npm test
```

Expected: 90%+ tests passing (some integration tests may skip without credentials configured).

### Step 4.3: Test MCP Server Startup

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

---

## Phase 5: Register with Claude Code (5 minutes)

### Step 5.1: Add to Claude Configuration

Edit `~/.claude.json` (or workspace-specific config):

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
        "DRIVE_ROOT_FOLDER_ID": "your_root_folder_id_here",
        "DRIVE_TEMPLATES_FOLDER_ID": "your_templates_folder_id_here",
        "DRIVE_GENERATED_FOLDER_ID": "your_generated_folder_id_here",
        "DRIVE_ARCHIVE_FOLDER_ID": "your_archive_folder_id_here",
        "DRIVE_CONFIG_FOLDER_ID": "your_config_folder_id_here"
      }
    }
  }
}
```

**Important:** Replace folder IDs with your actual values from Step 2.3.

### Step 5.2: Restart Claude Code

Close and reopen Claude Code to load the new MCP server.

### Step 5.3: Verify Registration

In Claude Code, the MCP should now appear in available tools. You can test with:

```
Claude, what Google Workspace Materials tools do you have available?
```

Expected response should list 10 tools:
- init_drive_structure
- sync_from_drive
- sync_to_drive
- markdown_to_slides
- markdown_to_doc
- update_index
- query_index
- export_to_pdf
- create_from_prompt
- ai_enhance

---

## Phase 6: Initialize and Test (10 minutes)

### Step 6.1: Initialize Drive Structure

In Claude Code:

```
Claude, initialize the Google Drive structure for print materials.
```

This creates the index file and validates folder permissions.

### Step 6.2: Create Sample Template

Test content generation:

```
Claude, create a patient handout about managing high blood pressure.
Requirements:
- 6th grade reading level
- Include lifestyle changes and medication tips
- Save as Google Doc to Drive
```

Claude will:
1. Generate markdown content with medical sections
2. Convert to Google Doc
3. Upload to Drive Templates folder
4. Update the index

### Step 6.3: Generate PDF

Test PDF export:

```
Claude, export the high blood pressure handout to PDF.
```

This should create a PDF in the Generated folder with date-based organization.

### Step 6.4: Query Index

Test index querying:

```
Claude, show me all patient education materials in the index.
```

Should return the materials you've created.

---

## Production Deployment Checklist

Before moving to production MCP instance:

- [ ] All 10 tools tested successfully
- [ ] Service account has correct Drive permissions
- [ ] Index file created and syncing
- [ ] Sample materials generated and exported
- [ ] PDF export working
- [ ] Reading level calculations accurate
- [ ] Token replacement preserving {{PLACEHOLDERS}}
- [ ] Drive sync bidirectional (local ⟷ Drive)
- [ ] Error handling tested (no crashes)
- [ ] Logs configured appropriately

---

## Moving to Production

### Option 1: Deploy as Production MCP (Recommended)

1. Copy entire project to production location:
   ```bash
   cp -r development/mcp-servers/google-workspace-materials-project \
         production/mcp-servers/google-workspace-materials
   ```

2. Update `~/.claude.json` to point to production path
3. Remove development instance from config
4. Restart Claude Code

### Option 2: Keep as Development (Testing)

Continue using from `development/` for ongoing testing and iteration.

---

## Usage Examples

### Example 1: Create Discharge Instructions

```
Claude, create discharge instructions for a patient who had knee surgery.

Requirements:
- Include wound care, pain management, physical therapy
- 8th grade reading level
- Add tokens for: PATIENT_NAME, SURGERY_DATE, DOCTOR_NAME, FOLLOWUP_DATE
- Format as Google Doc
- Save to Drive
```

### Example 2: Update Existing Material

```
Claude, enhance the diabetes handout to be more friendly and conversational.
```

### Example 3: Batch Export

```
Claude, export all consent forms to PDF for printing.
```

### Example 4: Query Materials

```
Claude, find all materials tagged "diabetes" created in the last month.
```

---

## Troubleshooting

### Error: "Service account authentication failed"

**Cause:** Invalid or missing service account key file.

**Fix:**
1. Verify `GOOGLE_SERVICE_ACCOUNT_KEY_PATH` in `.env`
2. Check file exists and is valid JSON
3. Ensure no extra spaces in path

### Error: "Drive folder not found"

**Cause:** Folder IDs incorrect or service account not shared.

**Fix:**
1. Verify folder IDs in `.env` match Drive URLs
2. Check service account email has Editor access
3. Ensure folders not in Trash

### Error: "Rate limit exceeded"

**Cause:** Too many API calls in short time.

**Fix:**
1. Reduce batch size
2. Add delays between operations
3. Check quota limits in Google Cloud Console

### Error: "Token replacement failed"

**Cause:** Invalid token format or regex escaping issue.

**Fix:**
1. Ensure tokens use `{{TOKEN_NAME}}` format
2. Check for special characters in token names
3. Review TokenReplacer logs

---

## Monitoring and Maintenance

### Daily Checks

- [ ] Index file syncing correctly
- [ ] No failed PDF exports
- [ ] Drive quota not exceeded
- [ ] Error logs clear

### Weekly Maintenance

- [ ] Review usage metrics (query_index with usage_count)
- [ ] Archive old materials (status: archived)
- [ ] Update templates based on feedback
- [ ] Clean up duplicate materials

### Monthly Review

- [ ] Audit Drive folder organization
- [ ] Review reading level accuracy
- [ ] Update token library
- [ ] Optimize frequently used templates

---

## Security Best Practices

1. **Never commit credentials:**
   - `google-service-account.json` is in `.gitignore`
   - `.env` is in `.gitignore`
   - Verify before each commit

2. **Limit service account access:**
   - Only share Drive folders needed
   - Use Editor access (not Owner)
   - Regularly audit permissions

3. **Protect API keys:**
   - Store keys in secure location
   - Rotate keys annually
   - Disable unused service accounts

4. **Monitor usage:**
   - Review Cloud Console audit logs
   - Set up quota alerts
   - Track API call patterns

---

## Support and Documentation

**Implementation Plan:**
`development/mcp-servers/google-workspace-materials-project/IMPLEMENTATION-PLAN.md`

**API Documentation:**
`development/mcp-servers/google-workspace-materials-project/README.md`

**Code Examples:**
`development/mcp-servers/google-workspace-materials-project/EXAMPLES.md`

**Test Coverage:**
Run `npm run test:coverage` for detailed report

---

## Next Steps After Deployment

1. **Create Initial Templates** (5-10 templates):
   - Discharge instructions (surgery, ER, procedures)
   - Patient education (diabetes, hypertension, asthma)
   - Consent forms (surgery, procedures, imaging)
   - Medication guides (common medications)
   - Pre-op instructions

2. **Train Staff:**
   - Share usage examples
   - Document common prompts
   - Create template library guide

3. **Integrate with Workflow:**
   - Connect to existing Printable Documents Builder (Phase 4)
   - Set up automation triggers
   - Configure approval workflows if needed

4. **Optimize Performance:**
   - Cache frequently used templates
   - Batch operations where possible
   - Monitor API quota usage

---

## Rollback Plan

If issues arise after deployment:

1. **Immediate Rollback:**
   ```bash
   # Remove from Claude config
   # Edit ~/.claude.json and remove google-workspace-materials entry
   # Restart Claude Code
   ```

2. **Restore Previous State:**
   - Materials remain in Drive (no data loss)
   - Can re-deploy after fixing issues
   - Index file has backup (`.bak` file created on changes)

3. **Debug in Development:**
   - Use development instance for testing
   - Review logs for errors
   - Fix and re-deploy when ready

---

**Deployment Status:** Ready for Phase 1 ✅
**Estimated Total Time:** 60 minutes
**Prerequisites:** Google Cloud account, Drive access
**Support:** See IMPLEMENTATION-PLAN.md for detailed technical documentation

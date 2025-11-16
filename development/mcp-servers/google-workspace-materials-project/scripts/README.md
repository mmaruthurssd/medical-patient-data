# Drive Folder Creation Script

This script creates the required Google Drive folder structure for the Google Workspace Materials MCP using your existing service account.

## Prerequisites

### 1. Download Service Account Key (if not already done)

**If you already have the key file**, skip to step 2.

**If you need to download it:**

1. Go to: https://console.cloud.google.com/iam-admin/serviceaccounts?project=workspace-automation-ssdspc
2. Find: `ssd-automation-service-account@workspace-automation-ssdspc.iam.gserviceaccount.com`
3. Click the three dots (⋮) → **Manage keys**
4. Click **Add Key** → **Create new key**
5. Select **JSON**
6. Click **Create** (downloads the key)
7. Save to: `/Users/mmaruthurnew/Desktop/medical-patient-data/google-workspace-oauth-setup/service-account.json`

**OR** if you already have the key elsewhere, note its path.

### 2. Verify APIs are Enabled

Make sure these APIs are enabled in your Google Cloud project:
- ✅ Google Drive API
- ✅ Google Docs API (just enabled)
- ✅ Google Slides API (just enabled)

## Usage

### Option 1: Use Default Location

If your service account key is at the default location:
```bash
node scripts/create-drive-folders.js
```

### Option 2: Specify Key Path

If your key is elsewhere:
```bash
node scripts/create-drive-folders.js /path/to/your/service-account.json
```

### Option 3: Use Environment Variable

```bash
export GOOGLE_SERVICE_ACCOUNT_KEY_PATH=/path/to/your/service-account.json
node scripts/create-drive-folders.js
```

### Option 4: Custom Drive Name

If your shared drive has a different name:
```bash
export TARGET_DRIVE_NAME="Your Drive Name"
node scripts/create-drive-folders.js
```

## What This Script Does

1. **Authenticates** with your service account
2. **Searches** for "AI development - no-PHI" shared drive
3. **Creates** the following folder structure:
   ```
   AI Print Materials/
   ├── Templates/
   ├── Generated/
   ├── Archive/
   └── config/
   ```
4. **Outputs** all folder IDs for your `.env` configuration
5. **Saves** configuration to `drive-folder-config.json`

## Expected Output

```
✅ All folders created successfully!

═══════════════════════════════════════════════════════════
📋 FOLDER IDS FOR .env CONFIGURATION
═══════════════════════════════════════════════════════════

Copy these values to your .env file:

DRIVE_ROOT_FOLDER_ID=1abc...xyz
DRIVE_TEMPLATES_FOLDER_ID=1def...xyz
DRIVE_GENERATED_FOLDER_ID=1ghi...xyz
DRIVE_ARCHIVE_FOLDER_ID=1jkl...xyz
DRIVE_CONFIG_FOLDER_ID=1mno...xyz
```

## Next Steps After Running

1. Copy the folder IDs to your `.env` file
2. Run: `npm run build`
3. Update `~/.claude.json` with the folder IDs
4. Restart Claude Code
5. Test the MCP

## Troubleshooting

### "Could not find service account key file"
- Download the key from Google Cloud Console (see Prerequisites)
- Or specify the correct path as a command-line argument

### "API not enabled"
- Make sure Google Drive API is enabled
- Go to: https://console.cloud.google.com/apis/dashboard?project=workspace-automation-ssdspc

### "Permission denied" (403 error)
- Make sure the service account has access to the shared drive
- Share "AI development - no-PHI" drive with: `ssd-automation-service-account@workspace-automation-ssdspc.iam.gserviceaccount.com`
- Give it **Editor** permission

### "Could not find shared drive"
- Make sure the drive is shared with the service account
- Or specify the correct drive name with `TARGET_DRIVE_NAME` environment variable
- The script will list all available drives if it can't find the target

## Security Notes

⚠️ **Never commit the service account key to git!**

The `.gitignore` already excludes:
- `*.json` files in `config/`
- Service account keys

Keep your key file secure and rotate it annually.

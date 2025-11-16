# MCP Server Registration Configuration

## Claude Code Configuration

Add this to your `~/.claude.json` file:

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
        "DRIVE_ROOT_FOLDER_ID": "REPLACE_WITH_YOUR_ROOT_FOLDER_ID",
        "DRIVE_TEMPLATES_FOLDER_ID": "REPLACE_WITH_YOUR_TEMPLATES_FOLDER_ID",
        "DRIVE_GENERATED_FOLDER_ID": "REPLACE_WITH_YOUR_GENERATED_FOLDER_ID",
        "DRIVE_ARCHIVE_FOLDER_ID": "REPLACE_WITH_YOUR_ARCHIVE_FOLDER_ID",
        "DRIVE_CONFIG_FOLDER_ID": "REPLACE_WITH_YOUR_CONFIG_FOLDER_ID",
        "LOCAL_MATERIALS_PATH": "/Users/mmaruthurnew/Desktop/medical-patient-data/development/mcp-servers/google-workspace-materials-project/materials",
        "LOCAL_INDEX_PATH": "/Users/mmaruthurnew/Desktop/medical-patient-data/development/mcp-servers/google-workspace-materials-project/materials/print-materials-index.json",
        "MCP_SERVER_NAME": "google-workspace-materials",
        "MCP_SERVER_VERSION": "1.0.0",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

## Production Configuration (After Testing)

For production deployment in `production/mcp-servers/`:

```json
{
  "mcpServers": {
    "google-workspace-materials": {
      "command": "node",
      "args": [
        "/Users/mmaruthurnew/Desktop/medical-patient-data/production/mcp-servers/google-workspace-materials/dist/index.js"
      ],
      "env": {
        "GOOGLE_SERVICE_ACCOUNT_KEY_PATH": "/Users/mmaruthurnew/Desktop/medical-patient-data/production/mcp-servers/google-workspace-materials/config/google-service-account.json",
        "DRIVE_ROOT_FOLDER_ID": "REPLACE_WITH_YOUR_ROOT_FOLDER_ID",
        "DRIVE_TEMPLATES_FOLDER_ID": "REPLACE_WITH_YOUR_TEMPLATES_FOLDER_ID",
        "DRIVE_GENERATED_FOLDER_ID": "REPLACE_WITH_YOUR_GENERATED_FOLDER_ID",
        "DRIVE_ARCHIVE_FOLDER_ID": "REPLACE_WITH_YOUR_ARCHIVE_FOLDER_ID",
        "DRIVE_CONFIG_FOLDER_ID": "REPLACE_WITH_YOUR_CONFIG_FOLDER_ID",
        "LOCAL_MATERIALS_PATH": "/Users/mmaruthurnew/Desktop/medical-patient-data/production/mcp-servers/google-workspace-materials/materials",
        "LOCAL_INDEX_PATH": "/Users/mmaruthurnew/Desktop/medical-patient-data/production/mcp-servers/google-workspace-materials/materials/print-materials-index.json",
        "MCP_SERVER_NAME": "google-workspace-materials",
        "MCP_SERVER_VERSION": "1.0.0",
        "LOG_LEVEL": "warn"
      }
    }
  }
}
```

## Environment Variables Explained

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `GOOGLE_SERVICE_ACCOUNT_KEY_PATH` | Path to service account JSON key | `./config/google-service-account.json` |
| `DRIVE_ROOT_FOLDER_ID` | Root "AI Print Materials" folder ID | Get from Drive URL |
| `DRIVE_TEMPLATES_FOLDER_ID` | Templates subfolder ID | Get from Drive URL |
| `DRIVE_GENERATED_FOLDER_ID` | Generated documents folder ID | Get from Drive URL |
| `DRIVE_ARCHIVE_FOLDER_ID` | Archive folder ID | Get from Drive URL |
| `DRIVE_CONFIG_FOLDER_ID` | Config folder ID (for index JSON) | Get from Drive URL |
| `LOCAL_MATERIALS_PATH` | Local storage directory | `./materials` |
| `LOCAL_INDEX_PATH` | Local index file path | `./materials/print-materials-index.json` |
| `MCP_SERVER_NAME` | Server identifier | `google-workspace-materials` |
| `MCP_SERVER_VERSION` | Version number | `1.0.0` |
| `LOG_LEVEL` | Logging verbosity | `info` (dev) or `warn` (prod) |

## Getting Folder IDs from Google Drive

1. Open Google Drive: https://drive.google.com/
2. Navigate to the folder
3. Look at the URL: `https://drive.google.com/drive/folders/FOLDER_ID_HERE`
4. Copy the folder ID (the part after `/folders/`)

Example URL:
```
https://drive.google.com/drive/folders/1abc123XYZ456-defGHI789
```

Folder ID: `1abc123XYZ456-defGHI789`

## Verification Steps

After adding configuration:

1. **Restart Claude Code** (close and reopen)

2. **Check MCP loaded:**
   ```
   Claude, what MCP servers are available?
   ```

3. **Test a tool:**
   ```
   Claude, what Google Workspace Materials tools do you have?
   ```

Expected output:
```
I have access to 10 tools:

Drive Management:
- init_drive_structure: Initialize Google Drive folder structure
- sync_from_drive: Download materials from Drive to local
- sync_to_drive: Upload materials from local to Drive

Content Conversion:
- markdown_to_slides: Convert markdown to Google Slides
- markdown_to_doc: Convert markdown to Google Docs

Index Management:
- update_index: Add, update, or remove materials from index
- query_index: Search and filter materials

Export:
- export_to_pdf: Export materials to PDF format

AI Content:
- create_from_prompt: Generate new materials from description
- ai_enhance: Enhance existing content (reading level, tone, clarity)
```

## Troubleshooting

### Error: "MCP server failed to start"

**Check:**
1. Path to `dist/index.js` is correct
2. `dist/` folder exists (run `npm run build`)
3. No syntax errors in JSON configuration
4. All required environment variables are set

**Debug:**
```bash
# Test server manually
cd development/mcp-servers/google-workspace-materials-project
node dist/index.js
```

### Error: "Service account authentication failed"

**Check:**
1. `GOOGLE_SERVICE_ACCOUNT_KEY_PATH` points to valid JSON file
2. Service account key file has correct format
3. File permissions allow reading

**Test:**
```bash
# Verify file exists
ls -la config/google-service-account.json

# Check file format
head -n 5 config/google-service-account.json
```

### Error: "Drive folder not found"

**Check:**
1. Folder IDs are correct (from Drive URLs)
2. Service account has access (folder shared with service account email)
3. No typos in folder IDs

**Fix:**
1. Re-share Drive folder with service account email
2. Verify folder IDs match Drive URLs exactly
3. Check folders are not in Trash

### MCP Shows in List But Tools Don't Work

**Check:**
1. `.env` file configured (or environment variables in `~/.claude.json`)
2. Google Cloud APIs enabled (Drive, Docs, Slides)
3. Service account has necessary permissions

**Test each tool:**
```
Claude, test the init_drive_structure tool.
```

## Alternative: Using .env File

Instead of environment variables in `~/.claude.json`, you can use a `.env` file:

1. Copy `.env.example` to `.env`
2. Fill in your values
3. Simplify `~/.claude.json`:

```json
{
  "mcpServers": {
    "google-workspace-materials": {
      "command": "node",
      "args": [
        "/Users/mmaruthurnew/Desktop/medical-patient-data/development/mcp-servers/google-workspace-materials-project/dist/index.js"
      ]
    }
  }
}
```

The server will automatically load variables from `.env` in the project directory.

## Security Notes

1. **Never commit `.claude.json` with real folder IDs** to git
2. **Keep service account key secure** - it's like a password
3. **Use different service accounts** for development vs production
4. **Regularly audit Drive folder access** in Google Cloud Console
5. **Rotate service account keys annually**

## Next Steps

After registration:

1. **Test basic functionality:**
   ```
   Claude, initialize the Drive structure.
   ```

2. **Create a test material:**
   ```
   Claude, create a simple patient handout about staying hydrated.
   ```

3. **Export to PDF:**
   ```
   Claude, export that handout to PDF.
   ```

4. **Query the index:**
   ```
   Claude, show me all materials in the index.
   ```

If all tests pass, you're ready to use the MCP server!

---

**For detailed deployment instructions, see:** `DEPLOYMENT-GUIDE.md`
**For usage examples, see:** `EXAMPLES.md`
**For technical documentation, see:** `README.md`

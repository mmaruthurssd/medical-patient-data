---
type: guide
tags: [configuration, environment, setup]
---

# Communications MCP Server Configuration Guide

**Purpose:** Complete environment configuration for the Communications MCP Server with Google Sheets logging
**Location:** ~/.communications-config.json or .env file

---

## Configuration Methods

You can configure the communications MCP server using either:
1. **Environment variables in ~/.claude.json** (recommended for MCP)
2. **Standalone .env file** (for HTTP API server)
3. **~/.communications-config.json** (for advanced config)

---

## Required Configuration (~/.claude.json)

Add these environment variables to your communications-mcp-server configuration:

```json
{
  "mcpServers": {
    "communications": {
      "command": "node",
      "args": [
        "/Users/mmaruthurnew/Desktop/mcp-infrastructure/local-instances/mcp-servers/communications-mcp-server/dist/server.js"
      ],
      "env": {
        "GOOGLE_CLIENT_ID": "your-client-id.apps.googleusercontent.com",
        "GOOGLE_CLIENT_SECRET": "your-client-secret",
        "GOOGLE_REFRESH_TOKEN": "your-refresh-token",
        "GOOGLE_SHEETS_LOGGING_ENABLED": "true",
        "GOOGLE_SHEETS_SPREADSHEET_ID": "YOUR_SPREADSHEET_ID_HERE",
        "GOOGLE_SHEETS_COMMUNICATIONS_LOG_SHEET": "Communications-Log",
        "GOOGLE_SHEETS_STAGED_SHEET": "Staged-Communications",
        "GOOGLE_SHEETS_CONTACTS_LOG_SHEET": "Contacts-Log",
        "GOOGLE_SHEETS_OPERATIONS_LOG_SHEET": "Operations-Log",
        "SMTP_HOST": "smtp.gmail.com",
        "SMTP_PORT": "587",
        "SMTP_SECURE": "false",
        "SMTP_USER": "your-email@yourdomain.com",
        "SMTP_PASSWORD": "your-app-password",
        "SMTP_FROM": "Medical Practice <noreply@yourdomain.com>",
        "STAGING_ENABLED": "true",
        "STAGING_DB_PATH": "/Users/mmaruthurnew/.communications-staging.db"
      }
    }
  }
}
```

---

## Environment Variables Reference

### Google OAuth Credentials (Required)

These credentials are used for:
- Gmail API (sending emails)
- Google Chat API (sending chat messages)
- Google Sheets API (logging communications)

```bash
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REFRESH_TOKEN=your-refresh-token
```

**How to get these:**
1. Follow the OAuth setup guide in `/google-workspace-oauth-setup/`
2. Ensure the token has these scopes:
   - `https://www.googleapis.com/auth/gmail.send`
   - `https://www.googleapis.com/auth/chat.messages`
   - `https://www.googleapis.com/auth/spreadsheets`

---

### Google Sheets Logging Configuration

```bash
# Enable Google Sheets logging (true/false)
GOOGLE_SHEETS_LOGGING_ENABLED=true

# Spreadsheet ID from the Google Sheets URL
# Example URL: https://docs.google.com/spreadsheets/d/1ABC123xyz/edit
# Extract ID: 1ABC123xyz
GOOGLE_SHEETS_SPREADSHEET_ID=YOUR_SPREADSHEET_ID_HERE

# Sheet names (must match exactly)
GOOGLE_SHEETS_COMMUNICATIONS_LOG_SHEET=Communications-Log
GOOGLE_SHEETS_STAGED_SHEET=Staged-Communications
GOOGLE_SHEETS_CONTACTS_LOG_SHEET=Contacts-Log
GOOGLE_SHEETS_OPERATIONS_LOG_SHEET=Operations-Log
```

**Setup Instructions:**
1. Follow `GOOGLE-SHEETS-SETUP-INSTRUCTIONS.md` to create the spreadsheet
2. Copy the spreadsheet ID from the URL
3. Update `GOOGLE_SHEETS_SPREADSHEET_ID` with your ID

---

### SMTP Configuration (Email Sending)

```bash
# SMTP server settings (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false  # Use TLS (true for SSL on port 465)

# SMTP authentication
SMTP_USER=your-email@yourdomain.com
SMTP_PASSWORD=your-app-password

# Default sender address
SMTP_FROM=Medical Practice <noreply@yourdomain.com>
```

**Gmail App Password Setup:**
1. Go to Google Account → Security
2. Enable 2-Step Verification
3. Generate App Password for "Mail"
4. Use that password as `SMTP_PASSWORD`

---

### Staging Configuration

```bash
# Enable staging workflow (true/false)
STAGING_ENABLED=true

# SQLite database path for staging
STAGING_DB_PATH=/Users/mmaruthurnew/.communications-staging.db
```

**What is staging?**
- Emails and messages are saved for review before sending
- Requires manual approval via approval dashboard or MCP tools
- Logs to Google Sheets with status="staged"

---

## Configuration for HTTP API (Phase 2)

If running the HTTP API server (for Gemini CLI access), add these:

```bash
# HTTP API settings
PORT=3002
API_KEY=your-secure-api-key-here

# CORS settings (for web dashboard)
CORS_ORIGIN=http://localhost:3001,https://yourdomain.com

# Enable API logging
API_LOGGING_ENABLED=true
```

---

## Apps Script Configuration (Approval Dashboard)

The Apps Script backend needs the following configuration:

### Script Properties

In Apps Script editor:
1. Go to: Project Settings → Script Properties
2. Add these properties:

```
COMMUNICATIONS_API_KEY=your-secure-api-key-here
WEB_APP_URL=https://script.google.com/macros/s/YOUR_WEB_APP_ID/exec
```

**How to get WEB_APP_URL:**
1. In Apps Script: Deploy → New Deployment → Web app
2. Copy the Web App URL
3. Add to Script Properties

---

## Environment Variable Priority

The system checks for configuration in this order:
1. Environment variables (highest priority)
2. ~/.communications-config.json
3. .env file in project directory
4. Default values (lowest priority)

---

## Validation Checklist

Before starting the server, verify:

- [ ] Google OAuth credentials configured
- [ ] Google Sheets spreadsheet created and ID configured
- [ ] SMTP credentials configured (for email sending)
- [ ] Staging database path exists and is writable
- [ ] All sheet names match exactly (case-sensitive)
- [ ] Google Sheets API enabled in Cloud Console
- [ ] OAuth token has required scopes

---

## Testing Configuration

Test your configuration with this checklist:

### 1. Test Google Sheets Access

```bash
# In communications-mcp-server directory
node -e "
const { google } = require('googleapis');
const auth = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'urn:ietf:wg:oauth:2.0:oob'
);
auth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
const sheets = google.sheets({ version: 'v4', auth });
sheets.spreadsheets.values.get({
  spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
  range: 'Communications-Log!A1:W1',
}).then(() => console.log('✓ Google Sheets access working!'))
  .catch(err => console.error('✗ Error:', err.message));
"
```

### 2. Test SMTP Connection

```bash
# Send test email
node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});
transporter.verify()
  .then(() => console.log('✓ SMTP connection working!'))
  .catch(err => console.error('✗ Error:', err.message));
"
```

### 3. Test MCP Server

```bash
# Rebuild server
cd /Users/mmaruthurnew/Desktop/mcp-infrastructure/local-instances/mcp-servers/communications-mcp-server
npm run build

# Start server (will show initialization messages)
node dist/server.js
```

Expected output:
```
✓ Google Sheets logging enabled
Communications MCP Server running on stdio
```

---

## Troubleshooting

### "Google Sheets logging enabled but credentials missing"

**Problem:** GOOGLE_SHEETS_LOGGING_ENABLED is true, but OAuth credentials are missing.

**Solution:**
- Verify GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN are set
- Check for typos in environment variable names
- Ensure credentials are in the correct format (no extra quotes)

### "Failed to initialize Google Sheets logger"

**Problem:** Credentials are present but authentication fails.

**Solution:**
- Verify OAuth token is valid (not expired)
- Check that Sheets API is enabled in Cloud Console
- Ensure token has spreadsheets scope: `https://www.googleapis.com/auth/spreadsheets`
- Try regenerating the refresh token

### "Failed to log to Google Sheets"

**Problem:** Logger initialized but writes fail.

**Solution:**
- Verify spreadsheet ID is correct
- Check sheet names match exactly (case-sensitive)
- Verify `automation@ssdspc.com` has Editor permissions on the spreadsheet
- Ensure spreadsheet hasn't been deleted or moved

### "SMTP connection failed"

**Problem:** Email sending fails.

**Solution:**
- Verify SMTP credentials are correct
- For Gmail: Ensure App Password is used (not regular password)
- Check 2-Step Verification is enabled for Gmail
- Verify SMTP_PORT (587 for TLS, 465 for SSL)
- Try connecting from terminal to verify network access

---

## Security Best Practices

1. **Never commit credentials to git**
   - Add .env to .gitignore
   - Use environment variables in ~/.claude.json
   - Keep credentials in secure password manager

2. **Rotate credentials regularly**
   - Regenerate OAuth tokens every 6 months
   - Update SMTP passwords periodically
   - Rotate API keys for HTTP API

3. **Limit token scopes**
   - Only request necessary Google API scopes
   - Use read-only scopes where possible
   - Avoid using super admin accounts

4. **Protect PHI**
   - Never log full email bodies containing PHI
   - Use bodyPreview (max 200 chars) for logging
   - Store full bodies in Google Drive with proper encryption
   - Ensure HIPAA BAA is in place for all services

---

## Next Steps

After configuration:
1. ✅ Complete this configuration guide
2. ⏳ Create Google Sheet (GOOGLE-SHEETS-SETUP-INSTRUCTIONS.md)
3. ⏳ Rebuild communications-mcp-server (`npm run build`)
4. ⏳ Test MCP tools in Claude Code
5. ⏳ Set up Apps Script approval dashboard
6. ⏳ Deploy Apps Script as Web App
7. ⏳ Test end-to-end staging workflow

---

**Created:** 2025-11-09
**Status:** Ready for use
**Dependencies:** Google OAuth setup, Google Sheets setup


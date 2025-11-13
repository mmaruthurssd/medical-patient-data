---
type: guide
tags: [communications, mcp, google-workspace, oauth, setup]
---

# Communications MCP Setup Guide for Google Workspace

**Status:** Ready for configuration
**Location:** `/Users/mmaruthurnew/Desktop/mcp-infrastructure/local-instances/mcp-servers/communications-mcp-server/`
**Current State:** Built and registered in `~/.claude.json`, but not configured

## Overview

The Communications MCP enables Claude to send emails and Google Chat messages directly. It supports multiple authentication methods with varying complexity levels.

## Setup Options (Choose One)

### Option 1: Google Chat Webhook Only (EASIEST - 5 minutes)

**Best for:** Quick start, simple notifications
**No credentials needed!**

**Steps:**
1. Open Google Chat in browser
2. Go to a Chat space (or create one)
3. Click space name → "Apps & integrations"
4. Click "Add webhooks"
5. Name: "Claude Code Bot"
6. Save and copy webhook URL

**Usage:**
```
Claude, send "Deployment complete!" to Google Chat webhook https://chat.googleapis.com/v1/spaces/YOUR_WEBHOOK_URL
```

**No configuration needed in ~/.claude.json!** Just use the webhook URL directly.

---

### Option 2: SMTP Email via Gmail (SIMPLE - 10 minutes)

**Best for:** Sending emails without complex OAuth
**Requires:** Gmail account with App Password

**Steps:**

1. **Enable 2FA on Google Account**
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Create App Password**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it "Claude Code Communications"
   - Copy the 16-character password

3. **Update ~/.claude.json**
   Edit the communications entry:
   ```json
   "communications": {
     "type": "stdio",
     "command": "node",
     "args": [
       "/Users/mmaruthurnew/Desktop/mcp-infrastructure/local-instances/mcp-servers/communications-mcp-server/dist/server.js"
     ],
     "env": {
       "SMTP_HOST": "smtp.gmail.com",
       "SMTP_PORT": "587",
       "SMTP_USER": "your-email@gmail.com",
       "SMTP_PASSWORD": "your-app-password-here",
       "SMTP_FROM": "your-email@gmail.com"
     }
   }
   ```

4. **Restart Claude Code** (VS Code reload window)

**Usage:**
```
Claude, send an email to jim@example.com with subject "Meeting Notes" saying "Here are the notes from today's meeting..."
```

---

### Option 3: Full OAuth (Gmail API + Google Chat API) (ADVANCED - 30 minutes)

**Best for:** Full Gmail integration, Google Chat API access, multiple users
**Requires:** Google Cloud Project with OAuth setup

**Why use OAuth?**
- More secure than app passwords
- Access to full Gmail API features
- Google Chat API (richer than webhooks)
- Can delegate to multiple users

**Steps:**

#### 3.1 Google Cloud Console Setup

1. **Create/Select Project**
   - Go to https://console.cloud.google.com/
   - Create new project: "Medical Practice Communications"
   - Or select existing project

2. **Enable APIs**
   - Go to "APIs & Services" → "Library"
   - Search and enable:
     - Gmail API
     - Google Chat API

3. **Configure OAuth Consent Screen**
   - Go to "APIs & Services" → "OAuth consent screen"
   - User Type: Internal (if using Google Workspace) or External
   - App name: "Claude Code Communications"
   - User support email: Your email
   - Authorized domains: (leave blank for internal)
   - Developer contact: Your email
   - Scopes: Will be requested by CLI tool
   - Test users: Add your email (if external)

4. **Create OAuth Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Application type: "Desktop app"
   - Name: "Claude Code Desktop"
   - Click "Create"
   - **Download the JSON file** (save as `credentials.json`)

#### 3.2 Generate Refresh Token

**Option A: Using google-oauth-cli (Recommended)**

```bash
# Install the tool
npm install -g google-oauth-cli

# Run OAuth flow
google-oauth-cli \
  --client-id YOUR_CLIENT_ID_HERE \
  --client-secret YOUR_CLIENT_SECRET_HERE \
  --scope "https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/chat.messages"
```

This will:
1. Open browser for Google login
2. Ask you to authorize the app
3. Return a refresh token
4. Copy the refresh token

**Option B: Manual OAuth Flow**

See `/Users/mmaruthurnew/Desktop/medical-patient-data/google-workspace-oauth-setup/` for existing OAuth tools.

#### 3.3 Configure ~/.claude.json

```json
"communications": {
  "type": "stdio",
  "command": "node",
  "args": [
    "/Users/mmaruthurnew/Desktop/mcp-infrastructure/local-instances/mcp-servers/communications-mcp-server/dist/server.js"
  ],
  "env": {
    "GOOGLE_CLIENT_ID": "your-client-id.apps.googleusercontent.com",
    "GOOGLE_CLIENT_SECRET": "your-client-secret",
    "GOOGLE_REFRESH_TOKEN": "your-refresh-token"
  }
}
```

#### 3.4 Restart and Test

1. Restart Claude Code (VS Code reload window)
2. Test email: `Claude, send an email to test@example.com saying "OAuth test"`
3. Test Chat: `Claude, send a message to Google Chat space saying "OAuth test"`

---

## Recommended Setup Path

**For Jim and your medical practice:**

1. **Start with Option 1 (Webhook)** - Get Google Chat working in 5 minutes
2. **Add Option 2 (SMTP)** - Get email working without OAuth complexity
3. **Later: Upgrade to Option 3** - When you need full API features

## Security Considerations

### Critical for Medical Practice

1. **HIPAA Compliance:**
   - Never send PHI via these channels unless:
     - Using encrypted email (OAuth with S/MIME)
     - Google Workspace has BAA in place
     - Chat space is restricted to authorized users

2. **Credential Storage:**
   - `~/.claude.json` contains credentials
   - Ensure file permissions: `chmod 600 ~/.claude.json`
   - Never commit to git
   - Use separate credentials per environment (dev/prod)

3. **Webhook Security:**
   - Webhooks are publicly accessible URLs
   - Anyone with URL can post messages
   - Use only for non-sensitive notifications
   - Rotate webhooks if compromised

4. **App Passwords:**
   - Can be revoked individually at https://myaccount.google.com/apppasswords
   - Limited scope (mail only)
   - Separate from main account password

5. **OAuth Tokens:**
   - Refresh tokens have full API access
   - Store securely
   - Can be revoked at https://myaccount.google.com/permissions
   - Set expiration policies in Google Workspace Admin

## Testing Checklist

After configuration, test these scenarios:

- [ ] Send test email to your own address
- [ ] Send test message to Google Chat
- [ ] Verify email appears correctly formatted
- [ ] Check Chat message in proper space
- [ ] Test with longer content (500+ words)
- [ ] Verify sender email appears correctly
- [ ] Test error handling (invalid recipient)

## Staging/Approval Workflow (Optional)

For reviewing emails before sending:

1. **Start review server:**
   ```bash
   cd /Users/mmaruthurnew/Desktop/mcp-infrastructure/local-instances/mcp-servers/communications-mcp-server
   npm run review-server
   ```

2. **Open dashboard:** http://localhost:3001/review

3. **Stage emails for review:** Tell Claude to "stage" instead of "send"

4. **Review in dashboard** before approving

See `STAGING_WORKFLOW.md` in the MCP directory for details.

## Troubleshooting

### Email Not Sending

1. **Check credentials in ~/.claude.json**
   - Verify email/password are correct
   - Ensure no extra spaces

2. **Gmail specific:**
   - 2FA must be enabled
   - Must use App Password (not regular password)
   - Check "Less secure app access" is OFF (we use App Password)

3. **Check MCP logs:**
   - VS Code → Output panel → Claude Code
   - Look for authentication errors

### Google Chat Not Working

1. **Webhook:**
   - Verify full URL copied correctly
   - Check space still exists
   - Try creating new webhook

2. **OAuth:**
   - Verify refresh token hasn't expired
   - Check API enabled in Cloud Console
   - Verify scopes include `chat.messages`

### MCP Not Loading

1. **Check build:**
   ```bash
   cd /Users/mmaruthurnew/Desktop/mcp-infrastructure/local-instances/mcp-servers/communications-mcp-server
   ls -la dist/server.js
   ```

2. **Rebuild if needed:**
   ```bash
   npm install
   npm run build
   ```

3. **Verify ~/.claude.json syntax:**
   ```bash
   cat ~/.claude.json | jq .
   ```

## Next Steps After Setup

1. **Document credentials location** (password manager)
2. **Set up credential rotation schedule** (90 days)
3. **Create runbook for common scenarios**
4. **Test failover procedures**
5. **Train team on usage patterns**

## Support

- **MCP Documentation:** `/Users/mmaruthurnew/Desktop/mcp-infrastructure/local-instances/mcp-servers/communications-mcp-server/README.md`
- **Staging Workflow:** `STAGING_WORKFLOW.md`
- **Quick Start:** `QUICK_START_STAGING.md`

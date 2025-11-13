---
type: guide
tags: [quick-start, webhook, google-chat, testing]
---

# Quick Start: Google Chat Webhook with Communications MCP

## Setup (5 minutes)

### Step 1: Create a Webhook in Google Chat

1. **Open Google Chat** in your browser: https://chat.google.com
2. **Select or create a space** for Claude notifications (e.g., "Claude Bot Notifications")
3. **Click the space name** at the top
4. **Select "Apps & integrations"**
5. **Click "Add webhooks"**
6. **Configure webhook:**
   - Name: `Claude Code Bot`
   - Avatar URL: (optional - leave blank or use https://anthropic.com/images/icons/app-icon.png)
7. **Click "Save"**
8. **Copy the webhook URL** - it will look like:
   ```
   https://chat.googleapis.com/v1/spaces/AAAAxxxxxxx/messages?key=xxxxx&token=xxxxx
   ```

### Step 2: Test It!

The communications MCP is already installed and ready to use. Just tell Claude:

```
Send "Hello from Claude Code!" to Google Chat webhook https://chat.googleapis.com/v1/spaces/YOUR_WEBHOOK_URL
```

**That's it!** No configuration files to edit, no credentials to manage.

## Usage Examples

Once your webhook is created, you can use it naturally:

**Simple notification:**
```
Claude, send "Deployment completed successfully!" to the webhook
```

**Status updates:**
```
Claude, post to Google Chat webhook [URL] saying "Database backup finished at 3:45 PM"
```

**Formatted messages:**
```
Claude, send this message to the webhook:
- Build: ✅ Passed
- Tests: ✅ All passed
- Deploy: 🚀 Ready
```

**With context (Claude remembers the webhook URL):**
```
Claude, remember this webhook URL: https://chat.googleapis.com/v1/spaces/...

// Later in conversation:
Claude, send "Task complete" to that webhook
```

## Multiple Webhooks

You can create multiple webhooks for different purposes:

- **Development alerts:** One webhook for dev team space
- **Production notifications:** Another for ops team
- **Patient system alerts:** Separate space for clinical team

Just create webhooks in different spaces and use them as needed.

## Security Notes for Medical Practice

### ✅ Safe to send via webhook:
- System status notifications ("Backup complete")
- Build/deployment alerts
- Non-sensitive reminders
- General team coordination

### ❌ DO NOT send via webhook:
- Patient names or identifiers
- PHI (Protected Health Information)
- Passwords or API keys
- Financial information

**Why?** Webhooks are publicly accessible URLs. Anyone with the URL can post messages to your Chat space.

### Best Practices:
1. **Create separate spaces** for different security levels
2. **Restrict space membership** to authorized personnel only
3. **Rotate webhooks** if you suspect compromise (just create a new one)
4. **Use for notifications only** - not for data transmission
5. **For PHI-related communications**, use the SMTP or OAuth options instead

## Testing Checklist

Test these scenarios to verify everything works:

- [ ] Send a simple text message
- [ ] Send a multi-line message
- [ ] Send a message with emojis
- [ ] Verify message appears in correct Chat space
- [ ] Confirm sender shows as "Claude Code Bot" (or your webhook name)
- [ ] Test from both you and Jim's accounts
- [ ] Verify space members can see the messages

## Troubleshooting

**Message not appearing?**
1. Verify webhook URL is complete (includes `?key=` and `&token=` parameters)
2. Check you're looking at the correct Chat space
3. Try creating a new webhook
4. Ensure no extra spaces in the URL

**"Invalid webhook" error?**
1. Webhook may have been deleted
2. Create a new webhook
3. Update the URL in your commands

**Want to disable?**
1. Go to Chat space → Apps & integrations
2. Find "Claude Code Bot"
3. Click "Remove"

## Next Steps

### Add Email Capability (Optional)

When you're ready to add email sending:
1. See `COMMUNICATIONS-MCP-SETUP-GUIDE.md`
2. Follow "Option 2: SMTP Email"
3. Takes about 10 minutes
4. Requires Gmail App Password

### Upgrade to Full OAuth (Optional)

For full API access and multiple users:
1. See `COMMUNICATIONS-MCP-SETUP-GUIDE.md`
2. Follow "Option 3: Full OAuth"
3. Requires Google Cloud Console setup
4. More secure, better for team workflows

## Example: Real-World Medical Practice Usage

```
# Morning system checks
Claude, send to the webhook: "🏥 Daily backup completed - all systems healthy"

# Deployment notification
Claude, notify the team via webhook: "📦 New patient portal version deployed - v2.3.4"

# Task reminders
Claude, remind the team: "🗓️ Monthly compliance review due Friday"

# Integration notifications
Claude, post to webhook: "✅ Google Sheets sync completed - 127 records updated"
```

## Support

- Full setup guide: `COMMUNICATIONS-MCP-SETUP-GUIDE.md`
- MCP documentation: `/Users/mmaruthurnew/Desktop/mcp-infrastructure/local-instances/mcp-servers/communications-mcp-server/README.md`
- Create webhook: https://chat.google.com → Space → Apps & integrations

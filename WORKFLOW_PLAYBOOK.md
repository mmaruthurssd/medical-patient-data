---
type: guide
tags: [workflows, playbook, automation, procedures, credentials]
---

# Workflow Playbook

**Purpose:** Living knowledge base of established workflows, available tools, credentials, and "how we do things here"

**When to read this:** Before starting ANY task involving:
- Google Sheets/Docs/Forms creation or modification
- Email/communications
- Data processing or automation
- Any recurring task pattern

**How to update:** After establishing a new workflow pattern, add it to the relevant section below

---

## 🔑 Available Credentials & Access

### Service Account (Primary for Automation)
- **Email:** `ssd-automation-service-account@workspace-automation-ssdspc.iam.gserviceaccount.com`
- **Access Level:** Editor permissions on all 9 Shared Drives
- **Use For:**
  - Creating/editing Google Sheets programmatically
  - Reading from Google Sheets
  - File operations in Google Drive
  - Automated documentation sync
- **Credentials Location:** `/Users/mmaruthurnew/Desktop/medical-patient-data/google-workspace-oauth-setup/workspace-automation-credentials.json`
- **Key Benefits:** No browser interaction, works in automation, consistent authentication

### Automation Account (Global Access)
- **Email:** `automation@ssdspc.com`
- **Access Level:** Global access to workspace
- **Use For:**
  - Apps Script deployments
  - OAuth 2.0 operations
  - Web app publishing
  - Manual browser-based operations (when service account can't be used)
- **Credentials Location:** OAuth 2.0 tokens in `/Users/mmaruthurnew/Desktop/medical-patient-data/google-workspace-oauth-setup/`

### When to Use Which Account
- **Default:** Use service account (programmatic, reliable)
- **Apps Script only:** Use automation account (service accounts can't deploy Apps Script)
- **Browser needed:** Use automation account

---

## 📊 Google Sheets Workflows

### Create a New Google Sheet

**Pattern Established:** 2025-01-13 ✅

**Tools Available:**
- Google Sheets API via service account
- Node.js script in `/google-workspace-oauth-setup/`
- Apps Script (if complex logic needed)

**Standard Process:**
1. Create Node.js script using Google Sheets API
2. Authenticate with service account (`service-account.json`)
3. Determine Shared Drive ID (AI Development - No PHI: `0AFSsMrTVhqWuUk9PVA`)
4. Create spreadsheet via `drive.files.create()` with `supportsAllDrives: true`
5. Format sheet: headers, frozen rows, filters, auto-resize
6. Return spreadsheet ID and webViewLink

**Real Example (FILE-INDEX Sheet):**
```bash
# Location: /google-workspace-oauth-setup/create-file-index-sheet.js
cd /Users/mmaruthurnew/Desktop/medical-patient-data/google-workspace-oauth-setup

# Run script to create sheet
node create-file-index-sheet.js

# Output includes:
# - Spreadsheet ID
# - Web URL
# - Stats (rows, columns, etc.)
```

**Code Pattern:**
```javascript
const { google } = require('googleapis');
const SERVICE_ACCOUNT_FILE = 'service-account.json';
const SHARED_DRIVE_ID = '0AFSsMrTVhqWuUk9PVA'; // AI Development - No PHI

const auth = new google.auth.GoogleAuth({
  keyFile: SERVICE_ACCOUNT_FILE,
  scopes: ['https://www.googleapis.com/auth/drive',
           'https://www.googleapis.com/auth/spreadsheets'],
});

const drive = google.drive({ version: 'v3', auth: authClient });
const sheets = google.sheets({ version: 'v4', auth: authClient });

// Create spreadsheet
const response = await drive.files.create({
  supportsAllDrives: true,
  requestBody: {
    name: 'SHEET_NAME',
    mimeType: 'application/vnd.google-apps.spreadsheet',
    parents: [SHARED_DRIVE_ID],
  },
  fields: 'id, webViewLink',
});
```

**Common Variations:**
- [x] Create with headers and data rows (see FILE-INDEX example)
- [x] Format with frozen header, filters, bold headers (see FILE-INDEX example)
- [ ] Create sheet from template
- [ ] Add to specific folder in Shared Drive
- [ ] Set up Apps Script bound to sheet

**Shared Drive IDs:**
- AI Development - No PHI: `0AFSsMrTVhqWuUk9PVA`
- (Add other drive IDs as needed)

**Notes:**
- Service account has editor access to all 9 Shared Drives
- Can create in any drive without permission issues
- Prefer API over Apps Script for creation (more reliable)
- Use `supportsAllDrives: true` for Shared Drives (critical!)
- Save spreadsheet info to JSON for reference (ID, URL, creation date)

---

### Update/Edit Existing Google Sheet

**Pattern Established:** [Date will be added when first used]

**Tools Available:**
- Google Sheets API via service account
- Apps Script for complex logic/triggers
- Bulk update scripts in `/google-workspace-oauth-setup/`

**Standard Process:**
1. Get sheet ID (from URL or registry)
2. Use service account to authenticate
3. Read current state if needed
4. Apply updates via API
5. Verify changes

**Common Operations:**
- [ ] Add new tab/sheet
- [ ] Update cell values
- [ ] Apply formatting
- [ ] Insert rows/columns
- [ ] Update formulas
- [ ] Modify Apps Script code

**Notes:**
- Always verify sheet exists before updating
- Use batch operations for multiple updates (more efficient)
- Apps Script changes require automation@ssdspc.com account

---

### Google Sheets Apps Script Deployment

**Pattern Established:** [Date will be added when first used]

**Tools Available:**
- `clasp` CLI (already authenticated for automation@ssdspc.com)
- Apps Script Editor (manual backup)
- Version control in `/Implementation Projects/google-sheets-version-control/`

**Standard Process:**
1. Write/test script locally
2. Use `clasp push` to deploy
3. Test in sheet
4. Document in version control
5. Add to sheet registry if production

**Notes:**
- Must use automation@ssdspc.com (service account can't deploy Apps Script)
- Keep version control updated
- Test in staging sheet when possible

---

## 📧 Email & Communications Workflows

### Send Email (Individual or Bulk)

**Pattern Established:** [To be established]

**Tools Available:**
- Gmail API via service account
- communications MCP server (with staging/approval workflow)
- Apps Script (for sheet-triggered emails)

**Standard Process:**
[Will be documented when first established]

**Notes:**
- communications MCP has approval workflow for sensitive emails
- Can send from automation@ssdspc.com or service account

---

### Send Google Chat Message

**Pattern Established:** [To be established]

**Tools Available:**
- Google Chat API
- communications MCP server
- Webhook integration

**Standard Process:**
[Will be documented when first established]

---

## 📝 Google Forms Workflows

### Create New Google Form

**Pattern Established:** [To be established]

**Tools Available:**
- Google Forms API via service account
- Template forms (if we create them)

**Standard Process:**
[Will be documented when first established]

---

### Copy Form Template and Customize

**Pattern Established:** [To be established]

**Tools Available:**
- Google Drive API (for copying)
- Google Forms API (for customization)
- Service account access

**Standard Process:**
[Will be documented when first established]

---

## 🔄 Common Automation Patterns

### Pattern: Create → Configure → Share → Notify

**Use Cases:**
- New sheet for a project
- Form for data collection
- Document for review

**Standard Steps:**
1. Create resource (sheet/form/doc)
2. Configure (structure, permissions)
3. Share with appropriate people
4. Send notification (email/chat)

**Tools:**
- Service account for creation
- Gmail API for notifications
- Google Drive API for sharing

---

### Pattern: Template → Customize → Deploy

**Use Cases:**
- Recurring reports
- Standard forms
- Templated documents

**Standard Steps:**
1. Copy template file
2. Customize with specific data
3. Deploy to appropriate location
4. Update registry/index

**Tools:**
- Google Drive API for copying
- Service account for modifications

---

## 🛠 Helper Scripts & Tools

### Available Scripts

**Location:** `/Users/mmaruthurnew/Desktop/medical-patient-data/google-workspace-oauth-setup/`

Scripts:
- `upload-workspace-management.js` - Upload docs to Google Drive
- [Others to be documented as we create them]

### MCP Servers for Workflows

**Available for workflow automation:**
- `task-executor` - Multi-step workflow management (use for complex workflows)
- `communications` - Email/chat with approval workflow
- `project-management` - Workflow orchestration
- `workspace-brain` - Pattern learning and telemetry

**When to use each:**
- **task-executor:** Complex multi-step workflows (5+ steps, needs persistence)
- **communications:** Sending emails/chats with staging/approval
- **project-management:** Planning and organizing larger initiatives
- **workspace-brain:** Logging workflow patterns for future learning

---

## 📚 Workflow Library

### Template for New Workflows

When we establish a new workflow pattern, add it using this template:

```markdown
### [Workflow Name]

**Pattern Established:** [Date]

**Trigger Phrases:**
- "create a [thing]"
- "send [something] to [someone]"

**Tools Available:**
- Tool 1
- Tool 2

**Standard Process:**
1. Step 1
2. Step 2
3. Step 3

**Common Variations:**
- [ ] Variation 1
- [ ] Variation 2

**Code Snippets:**
```bash
# Example code
```

**Notes:**
- Important considerations
- Edge cases
- Gotchas to watch for
```

---

## 🧠 Learning & Improvement

### Workflow Telemetry

When executing workflows, log to workspace-brain MCP:
- Tool: `mcp__workspace-brain-mcp__log_event`
- Event type: `workflow`
- Capture: workflow name, duration, tools used, outcome

### Pattern Detection

Periodically review:
- Which workflows are used most frequently?
- Are there emerging patterns we should document?
- Can workflows be consolidated or simplified?

### Update Cadence

- **Add new workflows:** Immediately after establishing pattern
- **Review effectiveness:** Monthly
- **Consolidate/refactor:** Quarterly

---

## 🔍 Quick Reference Checklist

Before starting a task, ask yourself:

- [ ] Does this match an existing workflow in this playbook?
- [ ] Which credentials/account should I use?
- [ ] Should I use task-executor MCP for multi-step coordination?
- [ ] Will I need to update this playbook after completing this task?
- [ ] Should I log telemetry to workspace-brain for future learning?

---

## 📝 Maintenance Log

**Last Updated:** 2025-01-13
**Next Review:** 2025-02-13

**Recent Additions:**
- 2025-01-13: ✅ **First workflow established!** - "Create a New Google Sheet"
  - Created FILE-INDEX Google Sheet in AI Development - No PHI drive
  - Documented complete pattern with code example
  - Script: `/google-workspace-oauth-setup/create-file-index-sheet.js`
- 2025-01-13: Initial playbook structure created
- 2025-01-13: Service account and automation account documented

**Pending Documentation:**
- Email workflows (when first established)
- Forms workflows (when first established)
- Chat/messaging workflows (when first established)
- Update existing Google Sheet workflow (when first used)
- Apps Script deployment workflow (when first used)

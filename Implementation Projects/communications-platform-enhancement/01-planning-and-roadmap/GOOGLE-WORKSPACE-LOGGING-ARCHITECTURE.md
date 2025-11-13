---
type: architecture
tags: [logging, google-sheets, approval, audit, workspace-integration]
---

# Google Workspace Logging & Approval Architecture

**Purpose:** Centralized logging and approval system for all communications and workspace operations
**Status:** Design Phase
**Integration:** communications-platform-enhancement + future workspace operations

---

## Overview

This architecture establishes **Google Sheets as the central audit log** for all communications (emails, chats, SMS) and workspace operations, with an integrated approval interface that can be accessed from both web dashboards and Google Workspace directly.

### Key Principles

1. **Single Source of Truth:** All operations logged to Google Sheets
2. **HIPAA Compliant:** Google Workspace BAA covers audit logs
3. **Unified Approval:** Same interface for staging all communication types
4. **Scalable Pattern:** Template for future workspace operations
5. **Dual Access:** Both AIs (Claude + Gemini) can read/write logs

---

## Architecture Design

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│           Communications Platform                        │
│  (Claude Code MCP + Gemini CLI HTTP)                    │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ Logs all operations
                 ▼
┌─────────────────────────────────────────────────────────┐
│         Google Sheets - Central Audit Log               │
│                                                          │
│  • Communications-Log (Main audit trail)                │
│  • Staged-Communications (Pending approval)             │
│  • Contacts-Log (Contact operations)                    │
│  • Operations-Log (All workspace operations)            │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ Powers dashboards
                 ▼
┌─────────────────────────────────────────────────────────┐
│              Approval Interfaces                         │
│                                                          │
│  Option 1: Apps Script Web App (in Google Workspace)    │
│  Option 2: Express Dashboard (localhost with Sheets)    │
│  Option 3: Google Sheets UI (custom menus)             │
└─────────────────────────────────────────────────────────┘
```

---

## Google Sheets Structure

### Sheet 1: Communications-Log (Main Audit Trail)

**Purpose:** Complete record of all communications sent/received
**Location:** `AI Development - No PHI/HIPAA-Audit-Logs/Communications-Log`

**Schema:**

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `timestamp` | Datetime | When operation occurred | `2025-11-09 13:45:22` |
| `operation_id` | String | Unique ID (UUID) | `comm-2025-abc123` |
| `type` | Enum | `email`, `chat`, `sms` | `email` |
| `direction` | Enum | `sent`, `received` | `sent` |
| `status` | Enum | `staged`, `approved`, `sent`, `delivered`, `failed` | `delivered` |
| `ai_system` | Enum | `claude`, `gemini` | `claude` |
| `from` | String | Sender | `automation@ssdspc.com` |
| `to` | String | Recipient(s) | `john@example.com` |
| `subject` | String | Email subject or message preview | `Appointment Reminder` |
| `body_preview` | String | First 100 chars of body | `Your appointment is...` |
| `body_location` | String | Full body storage (Drive file ID or inline) | `drive://file-id-xyz` |
| `channel` | String | `gmail`, `smtp`, `chat-webhook`, `chat-api`, `twilio` | `gmail` |
| `priority` | Enum | `urgent`, `high`, `normal`, `low` | `normal` |
| `staged_by` | String | Who staged (if staged) | `claude` |
| `staged_at` | Datetime | When staged | `2025-11-09 13:40:00` |
| `approved_by` | String | Who approved | `marvin@ssdspc.com` |
| `approved_at` | Datetime | When approved | `2025-11-09 13:44:00` |
| `sent_at` | Datetime | When actually sent | `2025-11-09 13:45:22` |
| `delivered_at` | Datetime | When delivered (if available) | `2025-11-09 13:45:25` |
| `error_message` | String | Error if failed | `Invalid email address` |
| `cost` | Number | Cost in USD (for SMS) | `0.0075` |
| `phi_flag` | Boolean | Contains PHI? | `FALSE` |
| `metadata` | JSON String | Additional metadata | `{"campaign": "reminders"}` |

**Row Example:**
```
2025-11-09 13:45:22 | comm-2025-abc123 | email | sent | delivered | claude | automation@ssdspc.com | patient@example.com | Appointment Reminder | Your appointment is... | drive://file-id-xyz | gmail | normal | claude | 2025-11-09 13:40:00 | marvin@ssdspc.com | 2025-11-09 13:44:00 | 2025-11-09 13:45:22 | 2025-11-09 13:45:25 | | 0 | FALSE | {}
```

---

### Sheet 2: Staged-Communications (Pending Approval)

**Purpose:** Messages waiting for human approval
**Location:** Same workbook, separate sheet

**Schema:** Same as Communications-Log, but filtered to `status = 'staged'`

**Additional Columns:**
| Column | Type | Description |
|--------|------|-------------|
| `expires_at` | Datetime | Auto-reject after this time |
| `review_notes` | String | Human reviewer notes |
| `review_url` | String | Direct link to approval UI |

**Workflow:**
1. Message staged → Row added to Staged-Communications
2. Human reviews → Updates `review_notes`
3. Human approves → Status changes to `approved`, moves to Communications-Log
4. Human rejects → Status changes to `rejected`, archived

---

### Sheet 3: Contacts-Log (Contact Operations)

**Purpose:** Audit trail for contact management operations
**Location:** Same workbook

**Schema:**

| Column | Type | Description |
|--------|------|-------------|
| `timestamp` | Datetime | When operation occurred |
| `operation_id` | String | Unique ID |
| `operation` | Enum | `create`, `read`, `update`, `delete`, `search` |
| `ai_system` | Enum | `claude`, `gemini` |
| `contact_id` | String | Google People API ID |
| `contact_name` | String | Contact name |
| `contact_email` | String | Contact email |
| `contact_phone` | String | Contact phone |
| `changes` | JSON String | What changed |
| `user` | String | Who performed operation |

---

### Sheet 4: Operations-Log (All Workspace Operations)

**Purpose:** General audit log for all workspace operations
**Location:** Same workbook

**Schema:**

| Column | Type | Description |
|--------|------|-------------|
| `timestamp` | Datetime | When operation occurred |
| `operation_id` | String | Unique ID |
| `operation_type` | String | `communication`, `file_sync`, `sheet_update`, etc. |
| `operation` | String | Specific operation |
| `ai_system` | Enum | `claude`, `gemini`, `manual` |
| `status` | Enum | `success`, `failed`, `pending` |
| `details` | JSON String | Operation details |
| `error` | String | Error message if failed |
| `user` | String | Who initiated |

**This becomes the pattern for ALL workspace operations.**

---

## Integration Points

### Communications Platform → Google Sheets

**When to Log:**
- ✅ Message staged (pending approval)
- ✅ Message approved (ready to send)
- ✅ Message sent (actually delivered)
- ✅ Message delivered (confirmation received)
- ✅ Message failed (error occurred)
- ✅ Message received (incoming)

**Implementation:**

```typescript
// In communications-mcp-server/src/google-sheets-logger.ts

import { google } from 'googleapis';

interface CommunicationLogEntry {
  timestamp: Date;
  operationId: string;
  type: 'email' | 'chat' | 'sms';
  direction: 'sent' | 'received';
  status: 'staged' | 'approved' | 'sent' | 'delivered' | 'failed';
  aiSystem: 'claude' | 'gemini';
  from: string;
  to: string;
  subject?: string;
  bodyPreview: string;
  bodyLocation?: string;
  channel: string;
  priority: 'urgent' | 'high' | 'normal' | 'low';
  stagedBy?: string;
  stagedAt?: Date;
  approvedBy?: string;
  approvedAt?: Date;
  sentAt?: Date;
  deliveredAt?: Date;
  errorMessage?: string;
  cost?: number;
  phiFlag: boolean;
  metadata?: object;
}

class GoogleSheetsLogger {
  private sheets: any;
  private spreadsheetId: string;

  constructor(auth: any, spreadsheetId: string) {
    this.sheets = google.sheets({ version: 'v4', auth });
    this.spreadsheetId = spreadsheetId;
  }

  async logCommunication(entry: CommunicationLogEntry): Promise<void> {
    const values = [
      [
        entry.timestamp.toISOString(),
        entry.operationId,
        entry.type,
        entry.direction,
        entry.status,
        entry.aiSystem,
        entry.from,
        entry.to,
        entry.subject || '',
        entry.bodyPreview,
        entry.bodyLocation || '',
        entry.channel,
        entry.priority,
        entry.stagedBy || '',
        entry.stagedAt?.toISOString() || '',
        entry.approvedBy || '',
        entry.approvedAt?.toISOString() || '',
        entry.sentAt?.toISOString() || '',
        entry.deliveredAt?.toISOString() || '',
        entry.errorMessage || '',
        entry.cost || 0,
        entry.phiFlag,
        JSON.stringify(entry.metadata || {})
      ]
    ];

    await this.sheets.spreadsheets.values.append({
      spreadsheetId: this.spreadsheetId,
      range: 'Communications-Log!A:W',
      valueInputOption: 'USER_ENTERED',
      resource: { values }
    });
  }

  async getStagedCommunications(): Promise<CommunicationLogEntry[]> {
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: 'Staged-Communications!A2:W'
    });

    // Parse and return staged communications
    return this.parseRows(response.data.values);
  }

  async updateCommunicationStatus(
    operationId: string,
    status: string,
    additionalData?: Partial<CommunicationLogEntry>
  ): Promise<void> {
    // Find row by operationId and update status
    // Implementation details...
  }
}

export { GoogleSheetsLogger, CommunicationLogEntry };
```

---

## Approval Interface Options

### Option 1: Apps Script Web App (Recommended)

**Advantages:**
- ✅ Native Google Workspace integration
- ✅ Access from anywhere (web-based)
- ✅ Uses Google authentication
- ✅ Can read/write Sheets directly
- ✅ Mobile-friendly
- ✅ No localhost required

**Implementation:**

```javascript
// In Google Sheets: Extensions → Apps Script
// File: Code.gs

function doGet() {
  return HtmlService.createHtmlOutputFromFile('ApprovalDashboard')
    .setTitle('Communications Approval')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getStagedCommunications() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName('Staged-Communications');
  const data = sheet.getDataRange().getValues();

  // Return as JSON (skip header row)
  return data.slice(1).map(row => ({
    operationId: row[1],
    type: row[2],
    from: row[6],
    to: row[7],
    subject: row[8],
    bodyPreview: row[9],
    priority: row[12],
    stagedAt: row[14]
  }));
}

function approveCommunication(operationId, approvedBy) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName('Staged-Communications');

  // Find row by operationId
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === operationId) {
      // Update status to 'approved'
      sheet.getRange(i + 1, 5).setValue('approved');
      sheet.getRange(i + 1, 16).setValue(approvedBy);
      sheet.getRange(i + 1, 17).setValue(new Date());

      // Trigger actual send via webhook to Communications Platform
      triggerSend(operationId);
      return { success: true };
    }
  }

  return { success: false, error: 'Operation not found' };
}

function rejectCommunication(operationId, reviewNotes) {
  // Similar to approve, but set status to 'rejected'
  // Implementation...
}

function triggerSend(operationId) {
  // Call Communications Platform HTTP API to actually send
  const url = 'http://localhost:3002/api/v1/send-approved';
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ operationId }),
    headers: {
      'Authorization': 'Bearer ' + PropertiesService.getScriptProperties().getProperty('API_KEY')
    }
  };

  UrlFetchApp.fetch(url, options);
}
```

**HTML Dashboard (ApprovalDashboard.html):**

```html
<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    .message { border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px; }
    .urgent { border-color: red; background: #fff5f5; }
    .high { border-color: orange; background: #fffaf0; }
    .approve-btn { background: #4CAF50; color: white; padding: 10px 20px; border: none; cursor: pointer; }
    .reject-btn { background: #f44336; color: white; padding: 10px 20px; border: none; cursor: pointer; }
  </style>
</head>
<body>
  <h1>📨 Communications Approval Dashboard</h1>
  <div id="messages"></div>

  <script>
    google.script.run.withSuccessHandler(displayMessages).getStagedCommunications();

    function displayMessages(messages) {
      const container = document.getElementById('messages');
      container.innerHTML = '';

      if (messages.length === 0) {
        container.innerHTML = '<p>No messages pending approval.</p>';
        return;
      }

      messages.forEach(msg => {
        const div = document.createElement('div');
        div.className = 'message ' + msg.priority;
        div.innerHTML = `
          <h3>${msg.type.toUpperCase()}: ${msg.subject || 'No Subject'}</h3>
          <p><strong>From:</strong> ${msg.from}</p>
          <p><strong>To:</strong> ${msg.to}</p>
          <p><strong>Preview:</strong> ${msg.bodyPreview}</p>
          <p><strong>Priority:</strong> ${msg.priority}</p>
          <p><strong>Staged:</strong> ${msg.stagedAt}</p>
          <button class="approve-btn" onclick="approve('${msg.operationId}')">✅ Approve</button>
          <button class="reject-btn" onclick="reject('${msg.operationId}')">❌ Reject</button>
        `;
        container.appendChild(div);
      });
    }

    function approve(operationId) {
      const user = Session.getActiveUser().getEmail();
      google.script.run.withSuccessHandler(() => {
        alert('Message approved and sent!');
        location.reload();
      }).approveCommunication(operationId, user);
    }

    function reject(operationId) {
      const notes = prompt('Rejection reason:');
      if (notes) {
        google.script.run.withSuccessHandler(() => {
          alert('Message rejected.');
          location.reload();
        }).rejectCommunication(operationId, notes);
      }
    }
  </script>
</body>
</html>
```

**Deploy as Web App:**
1. Apps Script → Deploy → New Deployment
2. Type: Web app
3. Execute as: Me
4. Who has access: Anyone with Google Workspace
5. Copy Web App URL: `https://script.google.com/macros/s/YOUR_ID/exec`

---

### Option 2: Express Dashboard with Sheets Backend

**Keep current localhost:3001/review but connect to Google Sheets instead of staging-db.json**

**Advantages:**
- ✅ Reuse existing dashboard code
- ✅ Local development easier
- ✅ More control over UI/UX

**Disadvantages:**
- ❌ Requires localhost running
- ❌ Not accessible remotely
- ❌ Additional authentication layer needed

**Implementation:**

```typescript
// In communications-mcp-server/src/review-server.ts
// Replace staging-db.json with Google Sheets

import { GoogleSheetsLogger } from './google-sheets-logger';

const logger = new GoogleSheetsLogger(auth, SPREADSHEET_ID);

app.get('/api/staged', async (req, res) => {
  const staged = await logger.getStagedCommunications();
  res.json(staged);
});

app.post('/api/approve/:id', async (req, res) => {
  const { id } = req.params;
  const { approvedBy } = req.body;

  await logger.updateCommunicationStatus(id, 'approved', {
    approvedBy,
    approvedAt: new Date()
  });

  // Trigger actual send
  await sendApprovedMessage(id);

  res.json({ success: true });
});
```

---

### Option 3: Google Sheets Native UI (Custom Menus)

**Simplest option - approve directly in the sheet**

**Implementation:**

```javascript
// In Apps Script (Code.gs)

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Communications')
    .addItem('Approve Selected', 'approveSelected')
    .addItem('Reject Selected', 'rejectSelected')
    .addItem('Refresh Status', 'refreshStatus')
    .addToUi();
}

function approveSelected() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const range = sheet.getActiveRange();
  const row = range.getRow();

  // Get operation ID from column B
  const operationId = sheet.getRange(row, 2).getValue();

  // Update status
  sheet.getRange(row, 5).setValue('approved');
  sheet.getRange(row, 16).setValue(Session.getActiveUser().getEmail());
  sheet.getRange(row, 17).setValue(new Date());

  // Trigger send
  triggerSend(operationId);

  SpreadsheetApp.getUi().alert('Message approved and sent!');
}
```

---

## Implementation Phases

### Phase 2A: Basic Sheets Logging (Week 1)

**Deliverables:**
- [ ] Create Communications-Log sheet
- [ ] Implement GoogleSheetsLogger class
- [ ] Log all sent communications
- [ ] Test with Claude Code

**Effort:** 1-2 days

### Phase 2B: Staging Integration (Week 2)

**Deliverables:**
- [ ] Create Staged-Communications sheet
- [ ] Update staging workflow to use Sheets
- [ ] Migrate from staging-db.json

**Effort:** 1 day

### Phase 2C: Approval Dashboard (Week 2)

**Deliverables:**
- [ ] Choose dashboard option (recommend Apps Script)
- [ ] Implement approval interface
- [ ] Test approval workflow
- [ ] Deploy web app

**Effort:** 1-2 days

### Phase 3+: Extended Logging

**Deliverables:**
- [ ] Add SMS logging (Phase 3)
- [ ] Add reading/receiving logs (Phase 4)
- [ ] Add Contacts-Log (Phase 5)
- [ ] Add Operations-Log (general pattern)

---

## HIPAA Compliance

### Audit Requirements ✅

**Google Sheets meets HIPAA requirements:**
- ✅ BAA in place (Google Workspace Business Plus)
- ✅ Access controls (Google Workspace permissions)
- ✅ Audit trail (Sheet edit history)
- ✅ Encryption at rest and in transit
- ✅ Backup and recovery (Google Drive)

**PHI Handling:**
- ⚠️ `body_location` stores full message bodies in Drive (separate files)
- ⚠️ `body_preview` limited to 100 chars (minimize PHI exposure)
- ⚠️ `phi_flag` marks rows containing PHI
- ✅ Access restricted to authorized users only

### Best Practices

1. **Separate Sheet for PHI** - Consider separate sheet for PHI-containing communications
2. **Drive Storage** - Store full message bodies in separate Drive files (not inline)
3. **Access Control** - Restrict sheet access to minimal users
4. **Regular Audits** - Review access logs monthly
5. **Retention Policy** - Archive old logs after 7 years (HIPAA requirement)

---

## Scalability Pattern

### Template for Future Operations

**This pattern can be replicated for:**

1. **File Operations** (Drive sync, uploads, downloads)
   - Sheet: `File-Operations-Log`
   - Columns: timestamp, operation, file_id, file_name, source, destination, status

2. **Sheet Operations** (Gemini updating sheets)
   - Sheet: `Sheet-Operations-Log`
   - Columns: timestamp, sheet_id, sheet_name, operation, cells_affected, values_before, values_after

3. **Apps Script Deployments**
   - Sheet: `Deployment-Log`
   - Columns: timestamp, script_id, sheet_id, deployment_type, version, status

4. **AI Operations** (Gemini/Claude queries)
   - Sheet: `AI-Operations-Log`
   - Columns: timestamp, ai_system, operation, prompt_preview, response_preview, tokens_used, cost

**Unified Pattern:**
```
All workspace operations → Google Sheets → Approval/Audit Dashboard
```

---

## Configuration

### Environment Variables

```bash
# In .env or ~/.communications-api-keys.json

# Google Sheets Configuration
GOOGLE_SHEETS_LOGGING_ENABLED=true
GOOGLE_SHEETS_SPREADSHEET_ID=1234567890abcdef
GOOGLE_SHEETS_COMMUNICATIONS_LOG_SHEET=Communications-Log
GOOGLE_SHEETS_STAGED_SHEET=Staged-Communications
GOOGLE_SHEETS_CONTACTS_LOG_SHEET=Contacts-Log
GOOGLE_SHEETS_OPERATIONS_LOG_SHEET=Operations-Log

# Approval Dashboard
APPROVAL_DASHBOARD_TYPE=apps-script  # or 'express' or 'sheets-native'
APPROVAL_DASHBOARD_URL=https://script.google.com/macros/s/YOUR_ID/exec

# Body Storage
MESSAGE_BODY_STORAGE=drive  # or 'inline' for short messages
MESSAGE_BODY_DRIVE_FOLDER_ID=folder-id-xyz
```

---

## Cost Analysis

### Storage Costs

**Google Sheets:**
- Free (included in Google Workspace)
- Limits: 10 million cells per sheet
- Estimate: 23 columns × 100,000 rows = 2.3M cells ✅

**Google Drive (message bodies):**
- Free (included in Google Workspace)
- 30GB storage per user (Business Plus)
- Estimate: 1000 messages/month × 5KB average = 5MB/month ✅

**Total Additional Cost:** $0

---

## Next Steps

### Immediate Actions

1. **Create Google Sheet**
   - [ ] Create new sheet in "AI Development - No PHI/HIPAA-Audit-Logs/"
   - [ ] Name: "Communications-Log"
   - [ ] Set up schema (23 columns)
   - [ ] Create Staged-Communications sheet
   - [ ] Set permissions (automation@ssdspc.com + team)

2. **Choose Approval Dashboard**
   - [ ] Decide: Apps Script Web App (recommended) vs Express vs Native
   - [ ] Implement chosen option
   - [ ] Test approval workflow

3. **Integrate with Phase 2**
   - [ ] Add GoogleSheetsLogger to communications platform
   - [ ] Log all operations
   - [ ] Test end-to-end

### Timeline

**Week 1 (Nov 11-15):**
- Days 1-2: HTTP API (Phase 2 original plan)
- Days 3-4: Google Sheets logging integration
- Day 5: Approval dashboard implementation

**Impact:** Adds 2 days to Phase 2 (now 6-7 days total)

---

## Recommendations

### Recommended Approach

**Use Apps Script Web App for approval dashboard:**

**Advantages:**
- ✅ Best integration with Google Workspace
- ✅ Accessible from anywhere (no localhost)
- ✅ Mobile-friendly
- ✅ Native Google authentication
- ✅ Direct Sheets access (no API latency)
- ✅ Can be opened from Claude Code via browser
- ✅ Gemini CLI can also open same URL

**Implementation:**
1. Create Google Sheet with 4 tabs (Communications-Log, Staged-Communications, Contacts-Log, Operations-Log)
2. Add Apps Script with approval functions
3. Deploy as Web App
4. Communications Platform logs to Sheets (all operations)
5. Users review at Web App URL
6. Approved messages trigger send via webhook back to Communications Platform

---

**Document Version:** 1.0
**Created:** 2025-11-09
**Status:** Design Phase
**Next:** Implementation in Phase 2

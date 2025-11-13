---
type: plan
tags: [communications, roadmap, gemini, multi-ai, sms, contacts]
---

# Communications Platform Roadmap
**Vision:** Unified communications server for multi-AI access (Claude + Gemini) with email, chat, SMS, and contacts integration

## Executive Summary

**Goal:** General-purpose communications server that allows Claude Code and Gemini CLI to:
- Send/receive emails
- Send/receive Google Chat messages
- Send/receive SMS texts
- Access Google Workspace contacts
- Stage communications for human approval (optional)

**Current Status:** Phase 1 complete (send-only email + chat with staging)
**Next Phase:** Add Gemini CLI access + SMS + reading capabilities

---

## Current Capabilities (Phase 1 ✅)

### What Works Today

**Communications MCP v1.0.0** currently supports:

1. **Email Sending**
   - ✅ SMTP (Gmail App Password)
   - ✅ Gmail API (OAuth)
   - ✅ Staging workflow with web dashboard
   - ✅ Batch approval
   - ✅ Priority levels

2. **Google Chat Sending**
   - ✅ Webhook (no auth needed)
   - ✅ Google Chat API (OAuth)
   - ✅ Works with staging workflow

3. **Staging/Approval System**
   - ✅ Web dashboard (http://localhost:3001/review)
   - ✅ Review before sending
   - ✅ Batch operations
   - ✅ Approval logging

4. **Access**
   - ✅ Claude Code (via MCP protocol)
   - ❌ Gemini CLI (not yet implemented)

### Current Architecture

```
┌─────────────────┐
│  Claude Code    │
│   (VS Code)     │
└────────┬────────┘
         │ MCP Protocol (stdio)
         ▼
┌─────────────────────────────┐
│  Communications MCP Server  │
│  (Node.js + TypeScript)     │
├─────────────────────────────┤
│  • send_email_smtp          │
│  • send_email_gmail         │
│  • send_google_chat_message │
│  • send_google_chat_webhook │
│  • stage_email              │
│  • send_approved_emails     │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│   Staging Dashboard         │
│   (Express + HTML/JS)       │
│   localhost:3001/review     │
└─────────────────────────────┘
```

---

## Gaps Analysis

### Missing Features

| Feature | Priority | Complexity | Effort |
|---------|----------|------------|--------|
| SMS sending (Twilio) | High | Medium | 2-3 days |
| Reading emails (IMAP/Gmail API) | High | Medium | 3-4 days |
| Reading Google Chat | Medium | Medium | 2-3 days |
| Reading SMS (Twilio) | Medium | Low | 1-2 days |
| Google Contacts integration | High | Medium | 2-3 days |
| Contact list management | Medium | Low | 1-2 days |
| Gemini CLI access (HTTP API) | High | High | 4-5 days |
| WebSocket for real-time | Low | High | 5-7 days |

### Missing Integrations

**For Gemini CLI access**, need one of:
1. **HTTP API wrapper** (recommended)
2. **gRPC service**
3. **REST API**
4. **MCP protocol adapter** (if Gemini adds MCP support)

---

## Phase 2: Multi-AI Access via HTTP API

### Architecture (Recommended)

```
┌─────────────┐                    ┌─────────────┐
│ Claude Code │                    │ Gemini CLI  │
│   (MCP)     │                    │  (HTTP)     │
└──────┬──────┘                    └──────┬──────┘
       │                                  │
       │ MCP stdio                        │ HTTP REST
       ▼                                  ▼
┌────────────────────────────────────────────────┐
│      Communications Platform Server            │
├────────────────────────────────────────────────┤
│  ┌──────────────┐         ┌─────────────────┐ │
│  │  MCP Bridge  │         │   HTTP API      │ │
│  │  (stdio)     │         │   (Express)     │ │
│  └──────┬───────┘         └────────┬────────┘ │
│         │                          │          │
│         └──────────┬───────────────┘          │
│                    ▼                           │
│         ┌────────────────────┐                │
│         │  Core Services     │                │
│         ├────────────────────┤                │
│         │  • Email (send/receive)            │
│         │  • Chat (send/receive)             │
│         │  • SMS (send/receive)              │
│         │  • Contacts (CRUD)                 │
│         │  • Staging/Approval                │
│         └────────┬───────────┘                │
│                  │                            │
└──────────────────┼────────────────────────────┘
                   │
    ┌──────────────┴────────────────┐
    │                               │
    ▼                               ▼
┌────────────────┐         ┌──────────────────┐
│ Gmail/SMTP API │         │  Twilio SMS API  │
└────────────────┘         └──────────────────┘
```

### HTTP API Design

**Base URL:** `http://localhost:3002/api/v1`

**Authentication:** API keys stored in `~/.communications-api-keys.json`

**Endpoints:**

```
POST   /api/v1/email/send
POST   /api/v1/email/stage
GET    /api/v1/email/inbox
GET    /api/v1/email/read/:id

POST   /api/v1/chat/send
GET    /api/v1/chat/messages
GET    /api/v1/chat/spaces

POST   /api/v1/sms/send
GET    /api/v1/sms/inbox

GET    /api/v1/contacts
POST   /api/v1/contacts
PUT    /api/v1/contacts/:id
DELETE /api/v1/contacts/:id

GET    /api/v1/staged
POST   /api/v1/staged/:id/approve
POST   /api/v1/staged/:id/reject
```

### Example Usage

**Claude Code (MCP):**
```typescript
// Native MCP call
await mcp.sendEmail({
  to: "patient@example.com",
  subject: "Appointment Reminder",
  body: "Your appointment is tomorrow at 2 PM"
});
```

**Gemini CLI (HTTP):**
```bash
# Using curl or HTTP client
curl -X POST http://localhost:3002/api/v1/email/send \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "patient@example.com",
    "subject": "Appointment Reminder",
    "body": "Your appointment is tomorrow at 2 PM"
  }'
```

---

## Phase 3: SMS Integration

### Provider: Twilio (Recommended)

**Why Twilio:**
- ✅ Reliable for healthcare
- ✅ HIPAA-compliant (with BAA)
- ✅ Simple API
- ✅ Two-way messaging
- ✅ Phone number provisioning

**Setup:**
1. Twilio account signup
2. Purchase phone number ($1-2/month)
3. Configure webhook for incoming SMS
4. Store credentials in environment

**Implementation:**

```typescript
// New tools to add
mcp.sendSMS({
  to: "+15555551234",
  message: "Your appointment is confirmed"
});

mcp.readSMS({
  limit: 10,
  since: "2025-01-01"
});
```

**Cost:**
- Phone number: ~$1/month
- Outgoing SMS: $0.0075/message
- Incoming SMS: $0.0075/message
- For 1000 messages/month: ~$16/month

---

## Phase 4: Reading/Receiving Messages

### Email (IMAP + Gmail API)

**Capabilities:**
- Read inbox, sent, folders
- Search emails
- Mark read/unread
- Archive/delete
- Download attachments

**Implementation:**

```typescript
// New tools
mcp.readEmails({
  folder: "INBOX",
  limit: 50,
  unreadOnly: true
});

mcp.searchEmails({
  query: "from:patient@example.com",
  since: "2025-01-01"
});
```

### Google Chat (Spaces API)

**Capabilities:**
- Read messages from spaces
- Monitor specific spaces
- Thread-based conversations
- Reactions

**Implementation:**

```typescript
// New tools
mcp.readChatMessages({
  space: "spaces/AAAAAAAA",
  limit: 100
});

mcp.monitorSpace({
  space: "spaces/AAAAAAAA",
  onMessage: (msg) => console.log(msg)
});
```

### SMS (Twilio Webhooks)

**Capabilities:**
- Receive SMS via webhook
- Store in local database
- Real-time notifications

**Implementation:**

```typescript
// Webhook endpoint receives incoming SMS
// Store in staging database for review
mcp.readSMS({
  from: "+15555551234",
  limit: 50
});
```

---

## Phase 5: Google Workspace Contacts

### Contacts Integration

**Google People API:**
- Read contacts from Google Workspace
- Create/update contacts
- Organize into groups
- Sync bidirectionally

**Features:**

```typescript
// Contact management
mcp.getContacts({
  group: "Patients",
  limit: 100
});

mcp.createContact({
  name: "John Doe",
  email: "john@example.com",
  phone: "+15555551234",
  group: "Patients"
});

mcp.searchContacts({
  query: "john"
});
```

**Smart Addressing:**

```
Claude, email John Doe about his appointment
// Looks up John Doe in contacts
// Finds email: john@example.com
// Sends email
```

---

## Implementation Plan

### Phase 2.1: HTTP API Foundation (Week 1)

**Deliverables:**
- [ ] Express HTTP server setup
- [ ] API authentication (API keys)
- [ ] Email send endpoint
- [ ] Chat send endpoint
- [ ] API documentation
- [ ] Postman/Thunder Client collection

**Effort:** 4-5 days

### Phase 2.2: Gemini CLI Integration (Week 1-2)

**Deliverables:**
- [ ] Gemini CLI HTTP client
- [ ] Test sending email from Gemini
- [ ] Test sending chat from Gemini
- [ ] Error handling
- [ ] Usage examples

**Effort:** 2-3 days

### Phase 3: SMS via Twilio (Week 2)

**Deliverables:**
- [ ] Twilio account setup
- [ ] Phone number provisioning
- [ ] Send SMS endpoint
- [ ] Webhook for incoming SMS
- [ ] SMS staging workflow
- [ ] Testing with both Claude and Gemini

**Effort:** 2-3 days

### Phase 4: Reading Messages (Week 3-4)

**Deliverables:**
- [ ] Email reading (IMAP + Gmail API)
- [ ] Google Chat reading (Spaces API)
- [ ] SMS reading (Twilio)
- [ ] Unified inbox view
- [ ] Search functionality
- [ ] Dashboard updates

**Effort:** 7-10 days

### Phase 5: Contacts Integration (Week 4)

**Deliverables:**
- [ ] Google People API integration
- [ ] Contact CRUD operations
- [ ] Contact groups
- [ ] Smart addressing
- [ ] Contact sync

**Effort:** 3-4 days

**Total Timeline:** 4-5 weeks

---

## Security Considerations

### HIPAA Compliance

**Requirements for medical practice:**

1. **Email:**
   - ✅ Use encrypted connections (TLS)
   - ✅ OAuth instead of passwords
   - ⚠️ Consider S/MIME for PHI
   - ⚠️ Google Workspace BAA required

2. **SMS:**
   - ✅ Twilio BAA required
   - ⚠️ SMS not secure by default
   - ⚠️ Patient consent needed
   - ✅ Use for appointment reminders only (no PHI)

3. **Google Chat:**
   - ✅ Google Workspace BAA
   - ✅ Restricted spaces only
   - ⚠️ Internal team only (not patients)

4. **Contacts:**
   - ✅ Google Workspace with BAA
   - ✅ Access control per user
   - ✅ Audit logging

### Authentication

**API Keys:**
- Stored in: `~/.communications-api-keys.json`
- Permissions: `chmod 600`
- Rotation: Every 90 days
- Per-AI-system keys:
  - `claude-code-key`: For Claude
  - `gemini-cli-key`: For Gemini

**Audit Logging:**
- Who sent what, when
- Who approved staged messages
- API access logs
- Failed authentication attempts

---

## Quick Start (Current State)

### 1. Test Current Webhook (5 minutes)

**Create webhook:**
1. Go to https://chat.google.com
2. Select/create space
3. Apps & integrations → Add webhooks
4. Name: "Claude Bot", copy URL

**Test:**
```
Claude, send "Hello from Claude!" to webhook https://chat.googleapis.com/v1/spaces/...
```

### 2. Add SMTP Email (10 minutes)

See `COMMUNICATIONS-MCP-SETUP-GUIDE.md` → Option 2

### 3. Test Staging Workflow (5 minutes)

```bash
# Start dashboard
cd /Users/mmaruthurnew/Desktop/mcp-infrastructure/local-instances/mcp-servers/communications-mcp-server
npm run review-server
```

Open: http://localhost:3001/review

```
Claude, stage an email to test@example.com saying "Test message"
```

Review in dashboard, approve, then:
```
Claude, send approved emails
```

---

## Next Actions

**Immediate (This Week):**
1. ✅ Test webhook with Google Chat
2. ✅ Configure SMTP for email
3. ✅ Test staging workflow
4. ⬜ Decide on Phase 2 timeline

**Short-term (Next 2 Weeks):**
1. ⬜ Implement HTTP API wrapper
2. ⬜ Set up Gemini CLI access
3. ⬜ Add SMS via Twilio

**Medium-term (1 Month):**
1. ⬜ Implement reading/receiving
2. ⬜ Integrate Google Contacts
3. ⬜ Build unified inbox dashboard

---

## Resources

**Documentation:**
- Setup guide: `COMMUNICATIONS-MCP-SETUP-GUIDE.md`
- Quick start: `QUICK-START-WEBHOOK.md`
- MCP code: `/Users/mmaruthurnew/Desktop/mcp-infrastructure/local-instances/mcp-servers/communications-mcp-server/`

**APIs:**
- Gmail API: https://developers.google.com/gmail/api
- Google Chat API: https://developers.google.com/chat
- Google People API: https://developers.google.com/people
- Twilio API: https://www.twilio.com/docs/sms

**Costs:**
- Twilio: ~$16/month for 1000 messages
- Google Workspace: Existing (BAA available)
- Additional APIs: Free (within quotas)

---

## Questions for Decision

1. **Timeline:** Start Phase 2 (HTTP API) now or test current features first?
2. **SMS Provider:** Twilio or alternative? (Twilio recommended for healthcare)
3. **Hosting:** Keep localhost or deploy to VPS for 24/7 availability?
4. **Gemini CLI:** Do you have a Gemini CLI tool already, or need to build it?
5. **Contact Sync:** One-way (read-only) or bidirectional with Google Workspace?

Let me know your priorities and we can create a detailed implementation plan!

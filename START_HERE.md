# Medical Patient Data - START HERE

**Workspace Type**: Clinical Operations & Patient Data
**PHI Status**: ✅ ALLOWED - Protected Health Information permitted under Google BAA
**AI Client**: **Gemini ONLY** (Google - Has BAA with medical practice)
**Location**: `~/Desktop/medical-patient-data`

---

## ⚠️ CRITICAL NOTICE

**This workspace contains Protected Health Information (PHI)**

- **Gemini**: ✅ Authorized to process PHI (under Google BAA)
- **Claude Code**: ❌ NOT authorized for PHI tasks (no BAA with Anthropic)

**If you are Claude Code**, you may ONLY work on:
- Non-PHI code in this workspace
- Configuration files
- Documentation (without PHI)
- Build scripts

**For PHI processing, Gemini must be used exclusively.**

---

## What Is This Workspace?

The **medical-patient-data** workspace is your **clinical operations hub** where patient data processing happens under Google's Business Associate Agreement (BAA). This is the ONLY workspace where PHI is allowed.

---

## Quick Orientation

### Three-Workspace Architecture

You are in **Workspace 3 of 3**:

| # | Workspace | Purpose | PHI | AI Client |
|---|-----------|---------|-----|-----------|
| **1** | operations-workspace | Development, planning, templates | ❌ NO | Claude Code |
| **2** | mcp-infrastructure | 26 MCP servers (production) | ❌ NO | Claude Code + Gemini |
| **3** | **medical-patient-data** (YOU ARE HERE) | Patient data, clinical workflows | ✅ YES | **Gemini ONLY** |

**See**: `workspace-management/THREE-WORKSPACE-ARCHITECTURE.md` for complete overview

---

## What Gemini CAN Do Here

✅ **PHI Processing**:
- Process patient names, dates of birth, medical record numbers
- Work with clinical data
- Generate patient reports
- Analyze health data
- Classify patient inquiries

✅ **Google Workspace Integration**:
- Access Google Sheets with PHI
- Deploy Apps Script with patient data
- Use Google Drive for PHI storage
- Create Google Docs with clinical information

✅ **Clinical Workflows**:
- Automate patient data entry
- Process medical records
- Generate clinical summaries
- Classify patient messages

✅ **Audit Logging**:
- Log all PHI operations to `gemini-audit-log.json`
- Track data access
- Record transformations
- Maintain HIPAA compliance trail

✅ **Git Operations** (for code only, NO PHI):
- Commit code changes
- Push to GitHub (PHI detector prevents PHI commits)
- Update configuration
- Document workflows

---

## What AI CANNOT Do Here

❌ **Cross-Workspace PHI Leaks**:
- Copy PHI to operations-workspace
- Copy PHI to mcp-infrastructure
- Include PHI in git commits (pre-commit hook blocks this)
- Reference PHI in shared documentation

❌ **Unauthorized PHI Access**:
- Process PHI without audit logging
- Share PHI outside Google BAA coverage
- Send PHI to non-BAA services (e.g., Anthropic Claude)
- Store PHI in non-encrypted locations

❌ **Claude Code PHI Access**:
- Claude Code MUST NOT process PHI
- Only Gemini has BAA coverage for PHI
- Claude Code can work on non-PHI code in this workspace

---

## Directory Structure

```
medical-patient-data/
├── START_HERE.md (YOU ARE HERE)
├── HIPAA-COMPLIANCE-DATA-BOUNDARY.md (MUST READ for PHI work)
├── workspace-management/ → operations-workspace/workspace-management (SYMLINK)
├── .gemini-mcp.json (Gemini MCP configuration)
├── gemini-audit-log.json (PHI operation audit trail)
├── 04-product-under-development/
│   └── gemini-examples/ (PHI-aware code examples)
│       ├── patient-inquiry-classifier.ts
│       ├── utils/
│       │   ├── audit-logger.ts
│       │   └── de-identify.ts
│       └── test-gemini.ts
├── google-drive-sync/ (sync with Google Drive under BAA)
├── Implementation Projects/ (active clinical projects)
├── templates-and-patterns/ → operations-workspace/templates-and-patterns (SYMLINK)
└── scripts/
    ├── scan-phi.sh (detect PHI before git commit)
    └── ... (other scripts)
```

---

## HIPAA Compliance - MUST READ

### Every PHI Operation MUST:

1. **Be logged to audit log**: `gemini-audit-log.json`
2. **Include timestamp and operation type**
3. **Track data summary (de-identified)**
4. **Maintain compliance trail**

### Google BAA Coverage

✅ **Covered (safe for PHI)**:
- Gemini API
- Google Drive
- Google Sheets
- Google Apps Script
- Google Docs

❌ **NOT Covered (NO PHI allowed)**:
- Anthropic Claude (no BAA)
- GitHub (no BAA - don't commit PHI)
- npm packages (varies - verify before use)

### Pre-commit Hooks

**Automatically scan every commit for**:
- PHI (patient names, DOB, MRN, etc.)
- Credentials (API keys, tokens)
- Sensitive data

**Commit will be BLOCKED if PHI detected.**

---

## PHI Processing Workflow

### ALWAYS Follow This Pattern

```typescript
// 1. Initialize audit logging
import { AuditLogger } from './utils/audit-logger';
const logger = new AuditLogger();

// 2. Log operation start
logger.log_operation({
    operation_type: "patient_classification",
    data_summary: "Classifying 10 patient messages"
});

// 3. Process PHI (under Google BAA with Gemini)
const results = await gemini.processPatientData(data);

// 4. Log operation completion
logger.log_operation_complete({
    operation_type: "patient_classification",
    results_summary: "10 classified, 0 errors"
});

// 5. Store results in Google Drive (under BAA)
await saveToGoogleDrive(results);
```

### NEVER:
- Process PHI without audit logging
- Copy PHI to non-BAA storage
- Include PHI in git commits
- Share PHI outside Google BAA

---

## For AI Assistants

### On First Run

**Follow the 6-step initialization path**:

1. **START_HERE.md** (this file) - Identify workspace and PHI permissions
2. **HIPAA-COMPLIANCE-DATA-BOUNDARY.md** - CRITICAL for understanding PHI rules
3. **workspace-management/AI-WORKSPACE-INITIALIZATION.md** - Detailed initialization steps
4. **workspace-management/DOCUMENTATION-INDEX.md** - Complete documentation map with reading order
5. **workspace-management/AI-GUIDELINES-BY-WORKSPACE.md** - Detailed permissions for each workspace
6. **EVENT_LOG.md** - Recent changes and decisions (check last 50 lines)

**For task-specific guidance**: See DOCUMENTATION-INDEX.md > "Before Working With..." section

### Quick Checklist for Gemini

- [ ] Confirmed I'm Gemini (NOT Claude Code)
- [ ] Understand PHI is ALLOWED in this workspace
- [ ] Read HIPAA-COMPLIANCE-DATA-BOUNDARY.md
- [ ] Checked DOCUMENTATION-INDEX.md for reading order
- [ ] Know to log ALL PHI operations to gemini-audit-log.json
- [ ] Verified Google BAA coverage before processing PHI
- [ ] Understand pre-commit hooks will block PHI in git commits

### Quick Checklist for Claude Code

- [ ] Confirmed I'm Claude Code
- [ ] Understand I CANNOT process PHI
- [ ] Can only work on non-PHI code, configs, docs
- [ ] Read DOCUMENTATION-INDEX.md for documentation navigation
- [ ] Will defer all PHI tasks to Gemini
- [ ] Know to check files for PHI before editing

---

## Available Tools (via Gemini MCP Client)

**Gemini MCP Client** (Python bridge):
- Connects Gemini to 26 MCP servers
- PHI-aware data processing
- Audit logging integration
- Google Workspace APIs

**All 26 MCP Servers** (same as Claude Code):
- task-executor
- project-management
- workspace-sync
- security-compliance
- And 22 more...

**See**: `.gemini-mcp.json` for configuration

---

## Common Workflows

### 1. Process Patient Data (Gemini Only)

```bash
# MUST be Gemini for PHI processing

# 1. Initialize audit logging
# 2. Process patient data with Gemini API
# 3. Log operation to gemini-audit-log.json
# 4. Store results in Google Drive (under BAA)
# 5. Verify audit trail is complete
```

### 2. Deploy Apps Script with PHI (Gemini Only)

```bash
# 1. Write Apps Script code
# 2. Test with sample data
# 3. Log deployment operation
# 4. Deploy to Google Apps Script (under BAA)
# 5. Verify audit log entry
```

### 3. Work on Non-PHI Code (Claude Code or Gemini)

```bash
# Safe for both AI clients

# 1. Edit configuration files
# 2. Update build scripts
# 3. Write documentation (no PHI)
# 4. Run pre-commit hooks to verify no PHI
# 5. Commit and push to GitHub
```

---

## Google Drive Sync

**Patient data files sync to Google Drive** (under BAA):

```yaml
# Configured in workspace-manifest.yml
patient_data:
  sync:
    patient_files:
      method: google-drive
      google_drive:
        folder_id: "YOUR_GOOGLE_DRIVE_FOLDER_ID"
        sync_direction: bidirectional
```

**Setup**: See `workspace-management/GOOGLE-DRIVE-SYNC-SETUP.md`

---

## Audit Log Example

**gemini-audit-log.json**:
```json
{
  "timestamp": "2025-11-10T14:30:00Z",
  "operation_type": "patient_classification",
  "ai_client": "gemini",
  "data_summary": "Classified 10 patient inquiries",
  "records_processed": 10,
  "phi_fields_accessed": ["patient_name", "message_content"],
  "result": "success",
  "duration_ms": 2500
}
```

**Every PHI operation must have an audit log entry.**

---

## Troubleshooting

**PHI detected in git commit?**
→ Pre-commit hook will block the commit
→ Remove PHI from files
→ Use de-identification utilities
→ Store PHI only in Google Drive (under BAA)

**Need to process PHI but using Claude Code?**
→ Switch to Gemini
→ Only Gemini has BAA coverage

**Gemini MCP not working?**
→ Check `.gemini-mcp.json` configuration
→ Verify MCP servers are built in mcp-infrastructure
→ Restart Gemini client

**See**: `workspace-management/TROUBLESHOOTING.md` for more

---

## Next Steps

**New to this workspace?**
→ Read `HIPAA-COMPLIANCE-DATA-BOUNDARY.md`

**AI assistant starting fresh?**
→ Read `workspace-management/AI-WORKSPACE-INITIALIZATION.md`

**Processing PHI?**
→ Verify you are Gemini
→ Initialize audit logging
→ Follow PHI processing workflow

**Need to sync to Google Drive?**
→ Read `workspace-management/GOOGLE-DRIVE-SYNC-SETUP.md`

**Questions?**
→ Check `workspace-management/TROUBLESHOOTING.md`

---

## Remember

- **PHI ALLOWED here** (under Google BAA with Gemini)
- **Gemini ONLY for PHI processing**
- **Claude Code can work on non-PHI code**
- **ALL PHI operations must be logged to gemini-audit-log.json**
- **Pre-commit hooks prevent PHI in git commits**
- **Google Drive for PHI storage** (under BAA)
- **Never copy PHI to operations-workspace or mcp-infrastructure**

---

**Need help?** Read the comprehensive guides in `workspace-management/`

**HIPAA Compliance Questions?** Read `HIPAA-COMPLIANCE-DATA-BOUNDARY.md`

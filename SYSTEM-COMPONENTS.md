---
type: reference
tags: [system-index, components, architecture, documentation-maintenance]
last_updated: 2025-11-14
---

# System Components Index

**Purpose:** Quick reference map for all major system components in this workspace.

**For AI Initialization:** Read this file early to understand what systems exist and where to find their documentation.

---

## 🚨 IMPORTANT: Documentation Maintenance Rule

**MANDATORY: When you develop a new system component, you MUST update this index immediately.**

**What qualifies as a "system component"?**
- Permanent infrastructure (backup systems, authentication, monitoring)
- Automation workflows (GitHub Actions, scheduled jobs, event-driven systems)
- Integration systems (Google Workspace, external APIs, MCPs)
- Data protection systems (backup, security, compliance)
- Cross-workspace shared systems

**Update process:**
1. Implement the new component
2. Add entry to this file (SYSTEM-COMPONENTS.md) in the appropriate section
3. If architectural, add detailed section to WORKSPACE_ARCHITECTURE.md
4. If critical for AI to know immediately, reference in START_HERE.md
5. Commit all documentation updates in the same session as implementation

**Do NOT:**
- Skip documentation "to do later" (it won't happen)
- Document only in README files (AI won't find them)
- Create orphan documentation that isn't indexed here

---

## Core Infrastructure

### 6-Layer Backup System
**Location:** `workspace-management/BACKUP-AND-DR-STRATEGY.md`
**Status:** ✅ Production (All 6 layers active)
**Architecture:** WORKSPACE_ARCHITECTURE.md → "Data Protection Architecture"
**Purpose:** Defense-in-depth backup protecting 588 production Google Sheets Apps Script projects
**Key Stats:** RPO 24h, RTO 10-30 min, $2/month
**Quick Test:** `gsutil ls -lh gs://ssd-sheets-backup-immutable/daily-backups/ | tail -3`

### GitHub Actions Workflows
**Location:** `.github/workflows/`
**Active Workflows:**
- `backup-to-gcs.yml` - Daily GCS backups (9 AM & 5 PM CST)
- `daily-snapshots.yml` - (if exists)
- `sync-docs-to-drive.yml` - (if exists)
- `test-drive-access.yml` - (if exists)

**Documentation:** Each workflow file contains inline comments
**Secrets:** Managed via `gh secret list`

### Service Account Authentication
**Location:** `google-workspace-oauth-setup/`
**Primary Account:** `ssd-automation-service-account@workspace-automation-ssdspc.iam.gserviceaccount.com`
**Purpose:** Automated Google Drive operations, workspace-management sync
**Documentation:** `workspace-management/GOOGLE-DRIVE-API-SETUP.md`
**Credentials:** `service-account.json` (gitignored, local only)

### GCS Backup Service Account
**Account:** `github-backup-uploader@ssd-sheets-backup-2025.iam.gserviceaccount.com`
**Purpose:** GitHub Actions automated backups to GCS
**Credentials:** GitHub secret `GCS_SERVICE_ACCOUNT_KEY`
**Bucket:** `gs://ssd-sheets-backup-immutable/daily-backups/`

---

## Automation Systems

### Automated Claude Code Prompting System
**Location:** `automation/AUTOMATED-CLAUDE-SETUP.md`
**Status:** 🟢 Production (Active since 2025-11-13)
**Architecture:** WORKSPACE_GUIDE.md → "Automated Claude Code Prompting System"
**Purpose:** Google Sheets → Apps Script → Prompt Queue → Claude Code execution
**Key Innovation:** Uses `claude --print` for non-interactive automation
**Server Control:** `automation/claude-automation-server.sh start|stop|status`

### Google Sheets Version Control
**Location:** `Implementation Projects/google-sheets-version-control/`
**Status:** ✅ Production
**Coverage:** 588 production Apps Script projects (294 prod + 294 staging)
**Components:**
- Enhanced pre-commit hooks (blocks >10 deletions)
- Pre-push verification
- GCS automated backups
- Daily health checks

**Quick Start:** `Implementation Projects/google-sheets-version-control/PROJECT-OVERVIEW.md`

---

## Integration Systems

### Google Workspace Integration
**Primary:** OAuth 2.0 via `automation@ssdspc.com` (Apps Script only)
**Secondary:** Service account (Drive API, automation)
**Shared Drives:** 9 total (AI Development - No PHI is primary)
**Documentation:** `workspace-management/CREDENTIALS-AND-AUTHENTICATION.md`

### Workspace-Brain MCP (External Learning)
**Purpose:** Persistent telemetry, analytics, pattern learning across sessions
**Tools:** 15 total (event logging, ROI tracking, automation opportunities)
**Storage:** External brain (survives workspace resets)
**See:** WORKSPACE_ARCHITECTURE.md → "Complete MCP Server Listings"

---

## Data Protection & Security

### Pre-Commit Hooks (security-compliance-mcp)
**Purpose:** PHI and credential scanning before commits
**Coverage:** All three workspaces
**Detection:** 18 HIPAA identifiers, API keys, tokens
**Status:** ✅ Active (installed via security-compliance-mcp)
**See:** `workspace-management/SECURITY-GIT-INTEGRATION-GUIDE.md`

### HIPAA Compliance Boundaries
**PHI Allowed:** Only in `medical-patient-data` workspace (this workspace)
**AI Authorization:** Gemini only (Google BAA), Claude Code prohibited from PHI
**Enforcement:** Pre-commit hooks, .gitignore, MCP tool awareness
**See:** WORKSPACE_ARCHITECTURE.md → "Data Boundaries (HIPAA Critical)"

---

## Documentation & Knowledge Base

### Workspace Management System
**Location:** `workspace-management/` (synced across all 3 workspaces)
**Index:** `workspace-management/README.md`
**Key Files:**
- `THREE-WORKSPACE-ARCHITECTURE.md` - System overview
- `WORKSPACE-RULES.md` - Operational standards
- `AI-GUIDELINES-BY-WORKSPACE.md` - AI permissions
- `DAILY-WORKFLOW.md` - Daily procedures
- `EVENT-LOGGING-PROCEDURES.md` - Event logging system

**Sync:** `upload-workspace-management.js` uploads to Google Drive

### Workflow Playbook
**Location:** `WORKFLOW_PLAYBOOK.md` (workspace root)
**Purpose:** Living knowledge base of established procedures
**Contents:**
- Available credentials and service accounts
- Standard workflows (create Sheet, send email/chat, generate images)
- Code examples and patterns
- Grows with each new task

**Update Rule:** Add new patterns immediately after establishing them

### Architecture Documentation
**Location:** `WORKSPACE_ARCHITECTURE.md` (workspace root)
**Purpose:** Technical architecture, MCP integration, team mental model
**When to Read:** Understanding MCP workflows, parallelization, feedback loops
**Sections:** 5 strategic functions, feedback loops, integration patterns, MCP listings

---

## Development Systems

### MCP Servers (22 Active)
**Production Location:** Via mcp-infrastructure workspace (symlinked to ~/.claude.json)
**Categories:**
- Core Workflow (4): git-assistant, smart-file-organizer, spec-driven, task-executor
- Foundation (3): mcp-config-manager, security-compliance-mcp, testing-validation-mcp
- Operations (5): project-management, parallelization, configuration-manager, deployment-release, code-review
- Intelligence (3): workspace-brain, performance-monitor, documentation-generator
- Supporting (7): arc-decision, communications, learning-optimizer, workspace-index, checklist-manager, test-generator, backup-dr

**See:** WORKSPACE_ARCHITECTURE.md → "Complete MCP Server Listings"

**Proactive Documentation Enforcement (NEW 2025-11-14):**
The **workspace-index MCP Phase 5** now automatically detects undocumented system components and validates documentation coverage. When you create new infrastructure, automation, or integration systems, workspace-index will:
- Auto-detect the component after 7 days if not documented
- Validate it appears in required locations (this file, WORKSPACE_ARCHITECTURE.md, START_HERE.md if critical)
- Generate suggested documentation entries with AI-powered metadata extraction
- Alert during workspace initialization if components are missing from documentation

**Run manual check:** `validate_workspace_documentation({ checks: ['system_components'] })`

### Template System
**Location:** `operations-workspace/templates-and-patterns/`
**Standard:** Template-first development (MANDATORY for MCPs)
**Templates:** 24 MCP server templates (drop-in ready)
**See:** WORKSPACE_GUIDE.md → "MCP Development Standard"

---

## Cross-Workspace Systems

### Workspace Sync Automation
**Location:** `workspace-management/sync-automation/`
**Status:** ✅ Active
**Purpose:** Automated synchronization of workspaces between Mariel and Alvaro
**Components:**
- `WORKSPACE-SYNC-PLAN.md` - Strategy and implementation plan
- `workspace-sync-exclude.txt` - Exclusion patterns for sync
- `create-sync-package.sh` - Package creation script
- `check-sync-status.sh` - Status verification script
**Integration:** Google Sheets automation with daily/weekly/monthly sync checks
**Architecture:** Bidirectional workspace sync with conflict detection and rollback
**See:** `workspace-management/sync-automation/WORKSPACE-SYNC-PLAN.md`

### Four-Part Sync
**Architecture:** Local → GitHub → Google Drive → workspace-brain
**Sync Script:** `workspace-management/scripts/sync/sync-all-workspaces.sh`
**Auto-Sync Daemon:** Pulls from GitHub every 5 minutes
**Purpose:** Changes propagate across all 3 workspaces and external storage
**See:** WORKSPACE_ARCHITECTURE.md → "Four-Part Sync"

### AI-to-AI Communication
**Location:** `team/activity.log` (real-time messaging)
**Conversation Logs:** `team/ai-conversations/` (structured session logs)
**Purpose:** Cross-computer AI collaboration and troubleshooting
**MCP:** workspace-sync (team messaging, daemon control)
**See:** `workspace-management/AI-TO-AI-COMMUNICATION-GUIDE.md`

---

## Monitoring & Health

### Backup Monitoring
**Daily Checks:** `Implementation Projects/google-sheets-version-control/scripts/daily-health-check.sh`
**GitHub Actions:** Email notifications on backup failures
**MCP Tool:** `backup-dr-mcp → get_backup_status()`

### Performance Monitoring
**MCP:** performance-monitor-mcp
**Capabilities:** Anomaly detection, alerting, response time tracking
**Dashboard:** Available via `create_performance_dashboard()`

### Workspace Health Dashboard
**MCP:** workspace-health-dashboard
**Metrics:** MCP status, autonomous resolution rates, bottlenecks, automation ROI
**Tool:** `get_workspace_health()` for overall health score

---

## Quick Reference: Where to Document What

| Type of Component | Primary Documentation | Secondary Reference | Critical Path? |
|-------------------|----------------------|---------------------|----------------|
| **Backup/DR System** | WORKSPACE_ARCHITECTURE.md | BACKUP-AND-DR-STRATEGY.md | Yes (START_HERE) |
| **Automation Workflow** | This file + dedicated README | WORKSPACE_ARCHITECTURE.md | If permanent |
| **Integration System** | This file + implementation docs | WORKSPACE_ARCHITECTURE.md | If cross-workspace |
| **MCP Server** | WORKSPACE_ARCHITECTURE.md (listings) | Template docs | No |
| **Security Feature** | WORKSPACE_ARCHITECTURE.md | workspace-management/ | Yes (START_HERE) |
| **Daily Workflow** | WORKFLOW_PLAYBOOK.md | This file | No |
| **Implementation Project** | Project README.md | This file (index entry only) | If promoted to permanent |

---

## Adding a New Component (Step-by-Step)

**Example: You just built a new email automation system**

1. **Implement the system** in appropriate location (`automation/email-system/`)

2. **Add to this file** (SYSTEM-COMPONENTS.md):
   ```markdown
   ### Email Automation System
   **Location:** `automation/email-system/`
   **Status:** 🟢 Production
   **Purpose:** Scheduled email reports from Google Sheets data
   **Quick Start:** `automation/email-system/README.md`
   ```

3. **If architectural, add to WORKSPACE_ARCHITECTURE.md:**
   - New section or subsection with technical details
   - Integration points with other systems
   - Architecture diagram if complex

4. **If critical, add to START_HERE.md:**
   ```markdown
   ## System Components
   - Email Automation (scheduled reports from Sheets)
   ```

5. **Update WORKFLOW_PLAYBOOK.md** with usage examples

6. **Commit all documentation** in same session as implementation:
   ```bash
   git add automation/email-system/ SYSTEM-COMPONENTS.md WORKSPACE_ARCHITECTURE.md
   git commit -m "feat: add email automation system with complete documentation"
   ```

---

## Maintenance Notes

**Last Updated:** 2025-11-14
**Next Review:** 2025-12-14 (monthly)
**Maintained By:** AI assistants updating during development

**Review Checklist:**
- [ ] All active systems documented
- [ ] Deprecated systems moved to archive section
- [ ] Cross-references are accurate
- [ ] New components since last review added
- [ ] Status indicators current

---

**Remember:** This index is only useful if kept up to date. Update it NOW, not "later."

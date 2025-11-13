# Workspace Management Hub

## Purpose

This document serves as the **central hub** for all workspace management documentation. It provides a comprehensive index of processes, credentials, automation systems, and guidelines that govern how the SSD workspace ecosystem operates.

**For AI Agents:** Read this document FIRST in any new session to understand the workspace structure and find relevant documentation quickly.

## Quick Navigation

### Core Documentation
- [Documentation Sync Guide](DOCUMENTATION-SYNC-GUIDE.md) - **Three-location synchronization** (Local/GitHub/Drive)
- [Service Account](SERVICE-ACCOUNT.md) - SSD Automation Service Account details and usage
- [System Architecture](SYSTEM-ARCHITECTURE.md) - Complete system architecture
- [AI Agent Onboarding](AI-AGENT-ONBOARDING.md) - Onboarding guide for new AI sessions
- [Data Protection](DATA-PROTECTION.md) - Backup strategy and recovery procedures
- [Documentation Process](DOCUMENTATION-PROCESS.md) - How to document new processes

### Process Documentation
- [Service Account Setup](SERVICE-ACCOUNT-SETUP.md) - Creating service accounts
- [Issues Tracking](ISSUES.md) - Known issues and resolutions

## Three-Location Documentation System

**IMPORTANT:** Documentation exists in THREE synchronized locations:

| Location | Purpose | Access Method | Update Frequency |
|----------|---------|---------------|------------------|
| **Local Workspace** | Primary development & quick AI access | Direct file system | Real-time during work |
| **GitHub Repository** | Version control, backup, CI/CD | Git push | Every commit |
| **Google Drive** | Team sharing & cross-workspace reference | Service account API | Periodic sync |

**See [DOCUMENTATION-SYNC-GUIDE.md](DOCUMENTATION-SYNC-GUIDE.md) for complete synchronization details.**

**Key Principle:** Local workspace is the **source of truth**. Changes flow: Local → GitHub → Google Drive.

## Workspace Overview

### Google Workspace Structure

**Main Account:** Automation at SSD SPC
- **Purpose:** Central cloud services for SSD automation
- **Google Cloud Project ID:** `workspace-automation-ssdspc`
- **Services:** Google Sheets API, Google Drive API, Service Accounts

**Google Drive Organization:**
```
SSD Google Drive
├── AI Development - No PHI (Shared Drive)
│   ├── Daily Snapshot Log - SSD Google Sheets (Logging)
│   └── Workspace Management (Documentation)
├── Production Data (Shared Drive)
│   └── [PHI-containing sheets - not accessed by automation]
└── Staging/Development Folders
```

### Local Workspace Structure

**Primary Location:** `/Users/mmaruthurnew/Desktop/medical-patient-data/Implementation Projects/google-sheets-version-control`

```
google-sheets-version-control/
├── docs/                              # All documentation
│   ├── WORKSPACE-MANAGEMENT.md        # This file - central hub
│   ├── SERVICE-ACCOUNT.md             # Service account documentation
│   ├── SYSTEM-ARCHITECTURE.md         # System architecture
│   ├── AI-AGENT-ONBOARDING.md         # AI onboarding guide
│   ├── DATA-PROTECTION.md             # Backup and recovery
│   ├── DOCUMENTATION-PROCESS.md       # How to document
│   ├── SERVICE-ACCOUNT-SETUP.md       # Service account setup
│   └── ISSUES.md                      # Issue tracking
├── production-sheets/                 # 588 production backups
├── staging-sheets/                    # Staging backups
├── config/                            # sheet-registry.json
├── scripts/                           # Automation scripts
├── .github/workflows/                 # GitHub Actions
└── .git/hooks/                       # Data protection hooks
```

### GitHub Repository

**Repository:** https://github.com/mmaruthurssd/ssd-google-sheets-staging-production
**Branch:** main
**Purpose:** Version control for Apps Script code

**GitHub Secrets:**
- `GCP_SERVICE_ACCOUNT` - Service account JSON key (added 2025-11-11)
- ~~`CLASP_CREDENTIALS`~~ - Deprecated OAuth tokens

## Authentication Systems

### 1. Service Account (Primary for Automation)

**Name:** SSD Automation Service Account
**Email:** `ssd-automation-service-account@workspace-automation-ssdspc.iam.gserviceaccount.com`
**Documentation:** [SERVICE-ACCOUNT.md](SERVICE-ACCOUNT.md)

**Use Cases:**
- GitHub Actions automated workflows
- Cross-workspace automation
- VPS server operations
- Scheduled tasks

**Advantages:**
- Never expires
- Consistent authentication
- No user intervention required
- Multi-project support

### 2. OAuth (Local Development Only)

**File:** `~/.clasprc.json`
**Command:** `clasp login`
**Documentation:** [SYSTEM-ARCHITECTURE.md](SYSTEM-ARCHITECTURE.md#authentication-flow)

**Use Cases:**
- Local development and testing
- Manual operations
- Personal Google account access

**Limitations:**
- Tokens expire after 1 hour
- User-specific
- Not suitable for automation

## Automation Systems

### Daily Snapshot Workflow

**Schedule:** 9 AM & 5 PM Central Time
**Workflow:** `.github/workflows/daily-snapshots.yml`
**Logging:** Daily Snapshot Log - SSD Google Sheets (ID: 1KpUhrEtW7-uHHS6GIngiXws0v2aM2wBC5ppyDBnRKxc)

**Process:**
1. Pull Apps Script code from 588 production sheets
2. Commit changes to GitHub
3. Log run details to Google Sheet (using service account)

**Monitoring:**
```bash
gh run list --limit 10
gh run view [run-id]
```

### Data Protection System

**Pre-Commit Hook:** `.git/hooks/pre-commit`
**Protection:** Blocks deletion of >10 production/staging sheets
**Documentation:** [DATA-PROTECTION.md](DATA-PROTECTION.md)

**Verification:**
```bash
ls -d production-sheets/sheet-* | wc -l  # Should be 588
```

## Google Drive Integration

### Workspace Management Folder

**Purpose:** Centralized documentation storage in Google Drive
**Location:** AI Development - No PHI / Workspace Management
**Status:** Created (folder exists, sync process being implemented)

**Contents:**
- Core Documentation/ - Exported from GitHub
  - WORKSPACE-MANAGEMENT.md
  - AI-AGENT-ONBOARDING.md
  - SYSTEM-ARCHITECTURE.md
  - SERVICE-ACCOUNT.md
  - DATA-PROTECTION.md
  - DOCUMENTATION-PROCESS.md
- Implementation Projects/ - Project tracking and summaries
- External Brain Integration/ - External brain setup and usage
- Quick Reference/ - Condensed quick-start guides

**Access:** Service account will have Editor access for automated sync

**Synchronization:** See [DOCUMENTATION-SYNC-GUIDE.md](DOCUMENTATION-SYNC-GUIDE.md)

### Current Google Sheets Used by Automation

| Sheet Name | Sheet ID | Purpose | Service Account Access |
|------------|----------|---------|----------------------|
| Daily Snapshot Log - SSD Google Sheets | 1KpUhrEtW7-uHHS6GIngiXws0v2aM2wBC5ppyDBnRKxc | Automated logging | Editor (granted 2025-11-11) |

## Key Processes

### Adding New Automated Process

When implementing a new automation:

1. **Document the process** - Create or update documentation in `docs/`
2. **Update this hub** - Add to relevant section in WORKSPACE-MANAGEMENT.md
3. **Grant service account access** - Share Google resources if needed
4. **Update SYSTEM-ARCHITECTURE.md** - Add integration points
5. **Update AI-AGENT-ONBOARDING.md** - Add to checklist/commands
6. **Create issue entry** - Document in ISSUES.md if there are known issues
7. **Commit documentation** - Push changes to GitHub

See [DOCUMENTATION-PROCESS.md](DOCUMENTATION-PROCESS.md) for detailed steps.

### Sharing Google Resources with Service Account

```bash
# 1. Get service account email
echo "ssd-automation-service-account@workspace-automation-ssdspc.iam.gserviceaccount.com"

# 2. Open Google Sheet/Drive folder
# 3. Click "Share"
# 4. Paste service account email
# 5. Set permission (Editor/Viewer)
# 6. Uncheck "Notify people"
# 7. Click "Share"
```

### Rotating Service Account Key

**Frequency:** Every 90 days
**Next Due:** 2026-02-11

```bash
# 1. Create new key in Google Cloud Console
# 2. Download JSON
# 3. Update GitHub secret:
echo '{...}' | gh secret set GCP_SERVICE_ACCOUNT

# 4. Test with workflow run
gh workflow run "Daily Sheet Snapshots"

# 5. Delete old key from Google Cloud Console
```

## Implementation Projects Tracking

### Purpose

The "Implementation Projects" folder in the parent workspace tracks active projects being implemented across the SSD ecosystem.

**Location:** `/Users/mmaruthurnew/Desktop/medical-patient-data/Implementation Projects/`

### Projects Structure

```
Implementation Projects/
├── google-sheets-version-control/    # This project (active)
├── [other-project-1]/
├── [other-project-2]/
└── PROJECT-INDEX.md                  # Master index of all projects
```

### Integration with Workspace Management

**Documentation Flow:**
1. New project added to Implementation Projects folder
2. Project documented in local PROJECT-INDEX.md
3. PROJECT-INDEX.md committed to GitHub
4. PROJECT-INDEX.md synced to Google Drive Workspace Management folder
5. Key project documentation exported to Drive if needed

**When to Update:**
- New project started
- Project status changes
- Project completed or archived
- Significant milestones reached

### Current Active Projects

| Project | Status | Last Updated | Documentation |
|---------|--------|--------------|---------------|
| google-sheets-version-control | Active | 2025-11-11 | This workspace |
| [Other projects to be added] | - | - | - |

## External Brain Integration

### Purpose

The **External Brain** system provides cross-project knowledge management, pattern recognition, and AI continuity across all SSD workspaces.

### Integration Points

**From This Workspace to External Brain:**
- Service account authentication patterns → Reusable knowledge
- Documentation processes → Standard templates
- Issue resolutions → Problem-solving patterns
- Automation workflows → Workflow templates

**From External Brain to This Workspace:**
- Cross-project authentication → Reference existing patterns
- Documentation standards → Apply proven templates
- Issue patterns → Recognize similar problems
- Automation patterns → Reuse workflows

### How to Use External Brain

**Query External Brain for:**
- "How do I authenticate with service accounts?"
- "What are best practices for workspace documentation?"
- "Have we solved similar authentication issues before?"
- "What automation patterns exist for Google Sheets?"

**Add to External Brain:**
- New service account setup processes
- Documentation synchronization patterns
- Issue resolutions with broad applicability
- Automation workflows that can be reused

**External Brain Documentation:**
- Setup guide → To be created in External Brain Integration/ folder
- Usage guide → To be created in External Brain Integration/ folder
- API reference → To be linked from external brain docs

### Knowledge Indexing

**Key documentation indexed in External Brain:**
- SERVICE-ACCOUNT.md → Authentication patterns
- DOCUMENTATION-PROCESS.md → Documentation standards
- DOCUMENTATION-SYNC-GUIDE.md → Multi-location sync patterns
- SYSTEM-ARCHITECTURE.md → Architecture patterns
- ISSUES.md → Problem-solution patterns

## AI Agent Guidelines

### New Session Checklist

When starting a new AI session:

1. ✅ Read [AI-AGENT-ONBOARDING.md](AI-AGENT-ONBOARDING.md)
2. ✅ Read this hub (WORKSPACE-MANAGEMENT.md)
3. ✅ Check [ISSUES.md](ISSUES.md) for known problems
4. ✅ Check [DOCUMENTATION-SYNC-GUIDE.md](DOCUMENTATION-SYNC-GUIDE.md) for three-location system
5. ✅ Run health checks
6. ✅ Review recent commits
7. ✅ Query External Brain for relevant patterns (if integrated)

### Workspace Access Information

**What AI agents can access through service account:**
- Daily Snapshot Log sheet (read/write)
- Future Google Sheets explicitly shared with service account
- Google Drive folders shared with service account

**What AI agents should document:**
- New processes and automations
- Issues encountered and resolutions
- Architecture changes
- Service account permission grants
- Workflow modifications

### Documentation Updates

Always update when:
- Adding new automation
- Modifying authentication
- Granting new service account permissions
- Discovering/resolving issues
- Changing system architecture
- Creating new GitHub Actions workflows

See [DOCUMENTATION-PROCESS.md](DOCUMENTATION-PROCESS.md) for standards.

## Cross-Workspace Coordination (Future)

### VPS Server Integration (Planned)
- Service account will authenticate VPS operations
- Automated synchronization between local and cloud
- Real-time monitoring and alerting

### Multi-Project Support (Planned)
- Service account can be used across multiple repositories
- Centralized authentication for all SSD automation
- Consistent logging and monitoring

## Emergency Procedures

### If Service Account Compromised

1. **Immediately revoke access:**
   - Google Cloud Console > IAM & Admin > Service Accounts
   - Delete compromised key

2. **Create new key:**
   - Generate new JSON key
   - Update GitHub secrets
   - Re-share Google resources if needed

3. **Audit access:**
   - Review Google Cloud audit logs
   - Check GitHub Actions logs
   - Verify no unauthorized access occurred

4. **Update documentation:**
   - Document incident in ISSUES.md
   - Update SERVICE-ACCOUNT.md with new key date

### If GitHub Secret Exposed

1. **Delete exposed secret immediately**
2. **Create new service account key**
3. **Update GitHub secret**
4. **Test workflows**
5. **Document incident**

## Version History

- **v1.0** (2025-11-11): Initial workspace management hub created
  - Service account documented
  - Documentation process established
  - AI agent guidelines defined
  - Google Drive integration planned

## Quick Reference Links

### Documentation
- 🔄 [Documentation Sync Guide](DOCUMENTATION-SYNC-GUIDE.md) - **Three-location system**
- 📚 [AI Onboarding](AI-AGENT-ONBOARDING.md)
- 🔧 [System Architecture](SYSTEM-ARCHITECTURE.md)
- 🔐 [Service Account](SERVICE-ACCOUNT.md)
- 💾 [Data Protection](DATA-PROTECTION.md)
- 📝 [Documentation Process](DOCUMENTATION-PROCESS.md)
- 🐛 [Issues](ISSUES.md)

### External Resources
- [Google Cloud Console](https://console.cloud.google.com/)
- [GitHub Repository](https://github.com/mmaruthurssd/ssd-google-sheets-staging-production)
- [Daily Snapshot Log](https://docs.google.com/spreadsheets/d/1KpUhrEtW7-uHHS6GIngiXws0v2aM2wBC5ppyDBnRKxc)

---

**Last Updated:** 2025-11-11
**Maintained By:** AI Assistant (Claude Code)
**Review Frequency:** Monthly or when workspace changes occur

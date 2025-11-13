# Implementation Projects Index

## Purpose

This index tracks all active implementation projects in the SSD ecosystem. Projects are organized by status and include links to their documentation.

**Last Updated:** 2025-11-11
**Total Projects:** 1

## Active Projects

### google-sheets-version-control

**Status:** Active
**Started:** 2025-11-10
**Last Updated:** 2025-11-11
**Progress:** In Production

**Description:**
Automated version control and backup system for 588 production Google Sheets Apps Script projects. Provides daily automated snapshots (9 AM & 5 PM Central Time), GitHub version control, automated logging, and data protection with pre-commit hooks.

**Key Features:**
- Daily automated snapshots via GitHub Actions
- Service account authentication (never-expiring)
- Automated logging to Google Sheets
- Pre-commit hooks preventing accidental deletions
- Comprehensive documentation system
- Three-location documentation synchronization (Local/GitHub/Google Drive)

**Documentation:**
- [Workspace Guide](google-sheets-version-control/WORKSPACE_GUIDE.md)
- [AI Agent Onboarding](google-sheets-version-control/docs/AI-AGENT-ONBOARDING.md)
- [Workspace Management Hub](google-sheets-version-control/docs/WORKSPACE-MANAGEMENT.md)
- [Documentation Sync Guide](google-sheets-version-control/docs/DOCUMENTATION-SYNC-GUIDE.md)
- [System Architecture](google-sheets-version-control/docs/SYSTEM-ARCHITECTURE.md)
- [Service Account](google-sheets-version-control/docs/SERVICE-ACCOUNT.md)

**GitHub Repository:**
https://github.com/mmaruthurssd/ssd-google-sheets-staging-production

**Service Account Used:**
- SSD Automation Service Account
- `ssd-automation-service-account@workspace-automation-ssdspc.iam.gserviceaccount.com`

**Google Drive Integration:**
- Daily Snapshot Log: `1KpUhrEtW7-uHHS6GIngiXws0v2aM2wBC5ppyDBnRKxc`
- Workspace Management folder in "AI Development - No PHI" shared drive

**Next Steps:**
- Implement Google Drive documentation sync
- Create External Brain integration documentation
- Set up VPS server automation

---

## Project Status Definitions

- **Planning:** Requirements gathering and design phase
- **Active:** Currently being implemented
- **Testing:** Implementation complete, under testing
- **In Production:** Deployed and operational
- **On Hold:** Temporarily paused
- **Completed:** Fully implemented and archived
- **Archived:** No longer active

## Adding New Projects

When adding a new project to this folder:

1. Create project folder in `Implementation Projects/`
2. Add entry to this index (PROJECT-INDEX.md)
3. Update `google-sheets-version-control/docs/WORKSPACE-MANAGEMENT.md`
4. Sync PROJECT-INDEX.md to Google Drive (when sync is implemented)
5. Document in External Brain (when integrated)

## Project Template

```markdown
### project-name

**Status:** [Status]
**Started:** YYYY-MM-DD
**Last Updated:** YYYY-MM-DD
**Progress:** [Phase]

**Description:**
[Brief description of what the project does]

**Key Features:**
- Feature 1
- Feature 2

**Documentation:**
- [Link to docs]

**GitHub Repository:**
[URL if applicable]

**Next Steps:**
- Task 1
- Task 2
```

---

**Maintained By:** AI Assistant (Claude Code)
**Sync Schedule:** Updated when projects are added/modified
**Google Drive Location:** Workspace Management/Implementation Projects/PROJECT-INDEX.md

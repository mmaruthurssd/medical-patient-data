---
type: guide
workspace: medical-patient-data
tags: [initialization, workspace-orientation, PHI-allowed]
---

# START HERE - medical-patient-data Workspace

**You are in**: `medical-patient-data` workspace
**Location**: `~/Desktop/medical-patient-data`
**PHI Status**: ✅ **PHI ALLOWED** (under Google Business Associate Agreement)

---

## Critical Information

**⚠️ PHI HANDLING RULES**:
- **PHI IS ALLOWED** in this workspace under Google BAA
- **Gemini** can process PHI (has BAA coverage)
- **Claude Code** should NOT process PHI (no BAA)
- All PHI operations must be logged to audit log
- PHI must stay in this workspace or Google Drive (under BAA)

---

## Quick Orientation

**Purpose of this workspace**:
- Patient data processing and clinical workflows
- Google Sheets with PHI
- Apps Script deployment for medical practice
- Future: Patient classification, clinical automation

**What's stored here**:
- Implementation projects (Google Sheets version control, etc.)
- Patient workflow automation
- Clinical data processing scripts
- Google Drive sync configuration

**What's NOT stored here**:
- MCP server development → use `mcp-infrastructure`
- General planning/templates → use `operations-workspace`

---

## For AI Assistants

**If you are Claude Code**:
- ✅ You can work on non-PHI code (infrastructure, automation framework)
- ❌ You cannot process PHI (patient names, medical data, etc.)
- ✅ You can build PHI-agnostic tools for Gemini to use
- 🔄 Defer PHI tasks to Gemini

**If you are Gemini**:
- ✅ You have Google BAA coverage for PHI
- ✅ You can process patient data
- ✅ Initialize audit logging before PHI operations
- ✅ Log all PHI operations to gemini-audit-log.json
- ✅ Store results in Google Drive (under BAA)

**Next steps for initialization**:
1. Read `workspace-management/AI-WORKSPACE-INITIALIZATION.md`
2. Read `workspace-management/HIPAA-COMPLIANCE-BOUNDARIES.md`
3. Read `workspace-management/AI-GUIDELINES-BY-WORKSPACE.md`
4. Check `EVENT_LOG.md` for recent changes

---

## For Human Developers

**Setting up this workspace**:
1. Clone from GitHub: `git clone https://github.com/mmaruthurssd/medical-patient-data.git`
2. Install dependencies (if any): `npm install` or `pip install -r requirements.txt`
3. Set up Google Drive sync (see `workspace-management/GOOGLE-DRIVE-INTEGRATION.md`)
4. Configure credentials (service accounts, OAuth tokens)
5. Read `workspace-management/HIPAA-COMPLIANCE-BOUNDARIES.md`

**Daily workflow**:
- Work in Implementation Projects/ subdirectories
- Use git for code (never commit PHI!)
- Use Google Drive for patient data files
- Log significant events to EVENT_LOG.md
- Push code changes to GitHub regularly

---

## Key Resources

**Documentation** (via symlink to operations-workspace):
- `workspace-management/` - All shared documentation
- `WORKSPACE_GUIDE.md` - Workspace standards
- `WORKSPACE_ARCHITECTURE.md` - Technical architecture
- `EVENT_LOG.md` - Recent changes and decisions

**Project Tracking**:
- `Implementation Projects/` - Active development projects
- `.ai-planning/` - Project orchestration state (if using project-management MCP)

**Compliance**:
- `.gitignore` - Configured to block PHI from git commits
- `workspace-management/HIPAA-COMPLIANCE-BOUNDARIES.md` - PHI handling rules
- Pre-commit hooks scan for accidental PHI commits

---

## Current Active Projects

Check `Implementation Projects/` for:
- google-sheets-version-control/ - Automated snapshot system for 400+ Apps Script projects
- google-workspace-automation-infrastructure/ - OAuth setup and automation
- (Other projects as they develop)

---

## Questions?

**New team member?** → Read `workspace-management/README.md`

**AI initialization?** → Read `workspace-management/AI-WORKSPACE-INITIALIZATION.md`

**Need help?** → Check `workspace-management/TROUBLESHOOTING.md` or ask team

---

**Remember**: PHI is ALLOWED here, but must be handled carefully with audit logging and BAA-covered services only.

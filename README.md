# medical-patient-data Workspace

**Quick Navigation**: [START_HERE.md](START_HERE.md) | [WORKSPACE_GUIDE.md](WORKSPACE_GUIDE.md) | [EVENT_LOG.md](EVENT_LOG.md)

---

## ⚕️ Medical Practice Patient Data & Workflows

**Workspace Type**: Workspace 3 of 3 (PHI-Allowed, Gemini Integration)
**Location**: `~/Desktop/medical-patient-data`
**Repository**: https://github.com/mmaruthurssd/medical-patient-data
**PHI Status**: ✅ **PHI ALLOWED** (under Google Business Associate Agreement)

---

## 🚨 Critical Rules

### PHI Handling
- ✅ **PHI IS ALLOWED** in this workspace (Google BAA coverage)
- ✅ **Gemini** can process PHI (has BAA)
- ❌ **Claude Code** should NOT process PHI (no BAA)
- 📋 All PHI operations MUST be logged to audit log
- 🔒 PHI must stay in this workspace or Google Drive (under BAA)

### AI Usage
- **Claude Code**: Infrastructure, automation framework, PHI-agnostic tools
- **Gemini**: Patient data processing, clinical workflows, PHI operations

---

## 📂 Workspace Structure

```
medical-patient-data/
├── Implementation Projects/           # Active development projects
│   ├── google-sheets-version-control/
│   ├── google-workspace-automation-infrastructure/
│   └── patient-workflow-automation/
│
├── workspace-management/              # Cross-workspace documentation
│   ├── HIPAA-COMPLIANCE-BOUNDARIES.md
│   ├── AI-GUIDELINES-BY-WORKSPACE.md
│   ├── THREE-WORKSPACE-ARCHITECTURE.md
│   └── (other shared docs)
│
├── .ai-planning/                      # Project orchestration state
├── temp/                              # Temporary workflows
├── archive/                           # Completed work
└── configuration/                     # Service accounts, OAuth configs
```

---

## 🚀 Quick Start

### For New Team Members

1. **Clone the repository**:
   ```bash
   git clone https://github.com/mmaruthurssd/medical-patient-data.git
   cd medical-patient-data
   ```

2. **Read critical documentation**:
   - [START_HERE.md](START_HERE.md) - Workspace orientation
   - [workspace-management/HIPAA-COMPLIANCE-BOUNDARIES.md](workspace-management/HIPAA-COMPLIANCE-BOUNDARIES.md)
   - [workspace-management/AI-GUIDELINES-BY-WORKSPACE.md](workspace-management/AI-GUIDELINES-BY-WORKSPACE.md)

3. **Set up credentials** (if needed):
   - Google service account: `automation@ssdspc.com`
   - OAuth tokens for Drive/Sheets access
   - See [configuration/](configuration/) directory

4. **Install dependencies** (project-specific):
   ```bash
   # Node.js projects
   cd "Implementation Projects/[project-name]"
   npm install

   # Python projects
   pip install -r requirements.txt
   ```

### For AI Assistants

Run `/fullstart` command to load all workspace documentation, then check:
- Your AI type and PHI permissions in START_HERE.md
- Available MCPs in WORKSPACE_ARCHITECTURE.md
- Current active projects in EVENT_LOG.md

---

## 🔧 Common Workflows

### Daily Development

```bash
# 1. Check for updates
git pull

# 2. See what's happening
cat EVENT_LOG.md | tail -50

# 3. Work on implementation projects
cd "Implementation Projects/[project-name]"

# 4. Commit code (never PHI!)
git add .
git commit -m "Description of changes"
git push
```

### Google Workspace Operations

**All operations use service account**: `automation@ssdspc.com`

- **Google Sheets**: Apps Script deployment, version control
- **Google Drive**: PHI-safe file operations (under BAA)
- **OAuth Setup**: See `google-workspace-oauth-setup/`

### Project Management

```bash
# Initialize new project
mcp__project-management__start_project_setup

# Create workflow for tasks
mcp__task-executor__create_workflow

# Track progress
cat .ai-planning/project-state.json
```

---

## 📊 Active Projects

### 1. Google Sheets Version Control
**Status**: Active
**Location**: `Implementation Projects/google-sheets-version-control/`
**Purpose**: Automated snapshot system for 400+ Apps Script projects

### 2. Google Workspace Automation Infrastructure
**Status**: Setup in progress
**Location**: `google-workspace-oauth-setup/`
**Purpose**: OAuth authentication and domain-wide delegation

### 3. Patient Workflow Automation
**Status**: Planning
**Location**: `Implementation Projects/patient-workflow-automation/`
**Purpose**: Clinical automation workflows (future Gemini integration)

---

## 🔐 Security & Compliance

### HIPAA Compliance
- ✅ Pre-commit hooks scan for accidental PHI commits
- ✅ `.gitignore` configured to block PHI files
- ✅ Google BAA covers Gemini API and Drive
- ✅ Audit logging for all PHI operations
- 📖 Full guide: [SECURITY_BEST_PRACTICES.md](SECURITY_BEST_PRACTICES.md)

### Git Safety
- ⚠️ **ALWAYS** read [GIT-SAFETY-CHECKLIST.md](GIT-SAFETY-CHECKLIST.md) before git operations
- 🔒 Pre-commit hooks prevent large files, secrets, PHI
- 🔄 Automated backups via GitHub workflows
- 📖 Full guide: [GIT-SAFETY-ENFORCEMENT.md](GIT-SAFETY-ENFORCEMENT.md)

### Credentials Management
- Service account key: `configuration/service-accounts/`
- OAuth tokens: `configuration/oauth-tokens/`
- Never commit credentials to git
- Use environment variables or secure storage

---

## 🏥 Three-Workspace Architecture

This workspace is part of a three-workspace system:

| Workspace | PHI Status | AI Client | Purpose |
|-----------|------------|-----------|---------|
| **operations-workspace** | ❌ No PHI | Claude Code | Development, planning, templates |
| **mcp-infrastructure** | ❌ No PHI | Shared | 26 MCP servers (platform-agnostic) |
| **medical-patient-data** (THIS) | ✅ PHI Allowed | Gemini (future) | Patient data, clinical workflows |

**Cross-workspace access**: All workspaces share the same 26 MCP servers via `mcp-infrastructure`

**Documentation**: [workspace-management/THREE-WORKSPACE-ARCHITECTURE.md](workspace-management/THREE-WORKSPACE-ARCHITECTURE.md)

---

## 🛠️ Available MCPs (26 Total)

All MCPs registered via `~/.claude.json` from `mcp-infrastructure/`:

**Most Used**:
- `task-executor` - Task workflows and progress tracking
- `project-management` - Project orchestration and goals
- `security-compliance-mcp` - Credential/PHI scanning
- `workspace-brain` - Telemetry and learning
- `google-workspace-mcp` - Google Sheets/Docs/Drive operations

**Full catalog**: [MCP_ECOSYSTEM.md](MCP_ECOSYSTEM.md)

---

## 📝 Documentation Index

### Workspace-Specific
- [START_HERE.md](START_HERE.md) - First-time orientation
- [EVENT_LOG.md](EVENT_LOG.md) - Recent changes
- [SECURITY_BEST_PRACTICES.md](SECURITY_BEST_PRACTICES.md) - HIPAA compliance
- [GIT-SAFETY-CHECKLIST.md](GIT-SAFETY-CHECKLIST.md) - Git operation safety

### Cross-Workspace (via workspace-management/)
- [WORKSPACE_GUIDE.md](WORKSPACE_GUIDE.md) - Standards and constitution
- [WORKSPACE_ARCHITECTURE.md](WORKSPACE_ARCHITECTURE.md) - Technical architecture
- [MCP_ECOSYSTEM.md](MCP_ECOSYSTEM.md) - Complete MCP catalog
- [STANDARDS_ENFORCEMENT_SYSTEM.md](STANDARDS_ENFORCEMENT_SYSTEM.md) - Quality enforcement

### Workflows & Reference
- [WORKFLOW_PLAYBOOK.md](WORKFLOW_PLAYBOOK.md) - How we do things
- [SYSTEM-COMPONENTS.md](SYSTEM-COMPONENTS.md) - Component index
- [workspace-management/AI-QUICK-REFERENCE.md](workspace-management/AI-QUICK-REFERENCE.md)

---

## 🆘 Troubleshooting

### OAuth/Domain-Wide Delegation Issues
- Check service account: `automation@ssdspc.com`
- Verify Client ID: Check Admin Console
- Required scopes: Drive, Sheets, Apps Script
- See: `google-workspace-oauth-setup/TROUBLESHOOTING.md`

### MCP Not Loading
- Check `~/.claude.json` configuration
- Verify MCP built: `cd ~/Desktop/mcp-infrastructure/local-instances/mcp-servers/[name] && npm run build`
- Restart Claude Code

### PHI Accidentally Committed
1. **STOP** - Don't push to GitHub
2. Follow [GIT-SAFETY-CHECKLIST.md](GIT-SAFETY-CHECKLIST.md) recovery steps
3. Use `git reset` to undo commit
4. Scan with `mcp__security-compliance-mcp__scan_for_phi`

---

## 🔄 Regular Maintenance

### Daily
- Check `EVENT_LOG.md` for recent changes
- Pull latest changes: `git pull`
- Review active workflows: `cat temp/workflows/*/workflow.json`

### Weekly
- Audit PHI operations: Review `gemini-audit-log.json`
- Clean up temp files: `rm -rf temp/old-workflows/`
- Update EVENT_LOG.md with significant changes

### Monthly
- Review HIPAA compliance: Run security scans
- Backup critical data: Verify Google Drive backups
- Update dependencies: `npm update` or `pip install --upgrade`

---

## 📞 Support

**Questions?**
- Documentation: See [workspace-management/README.md](workspace-management/README.md)
- AI Guidelines: See [workspace-management/AI-GUIDELINES-BY-WORKSPACE.md](workspace-management/AI-GUIDELINES-BY-WORKSPACE.md)
- System Health: See [workspace-management/SYSTEM-HEALTH-CHECKS.md](workspace-management/SYSTEM-HEALTH-CHECKS.md)

**Team Communication**:
- GitHub Issues: https://github.com/mmaruthurssd/medical-patient-data/issues
- Event Log: [EVENT_LOG.md](EVENT_LOG.md)

---

**Last Updated**: 2025-11-15
**Workspace Version**: 3.0 (Three-Workspace Architecture)
**HIPAA Compliance**: Active (Google BAA in place)

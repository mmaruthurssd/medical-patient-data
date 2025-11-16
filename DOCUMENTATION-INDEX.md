# Documentation Index - Master Navigation Guide

**Last Updated**: 2025-11-16
**Purpose**: Central navigation hub for ALL workspace documentation
**For AI Assistants**: Read this file early in initialization to understand the complete documentation structure

---

## 📋 Documentation Navigation Strategy

This workspace uses a **three-index navigation architecture** to ensure all documentation is discoverable:

### The Three Index Files

1. **[DOCUMENTATION-INDEX.md](DOCUMENTATION-INDEX.md)** (THIS FILE)
   - **Purpose**: Master navigation hub for ALL workspace documentation
   - **When to use**: Looking for any documentation, guides, or troubleshooting resources
   - **Coverage**: Complete catalog organized by topic with scenario-based finding guides
   - **For AI**: Read early in initialization to understand complete documentation structure

2. **[BACKUP-DOCUMENTATION-INDEX.md](BACKUP-DOCUMENTATION-INDEX.md)**
   - **Purpose**: Specialized index for all backup system documentation (6 layers)
   - **When to use**: Working with backups, troubleshooting backup issues, disaster recovery
   - **Coverage**: All backup layers, Google Sheets snapshots, emergency procedures, historical issues
   - **For AI**: Essential reference when dealing with any backup-related tasks

3. **[SYSTEM-COMPONENTS.md](SYSTEM-COMPONENTS.md)**
   - **Purpose**: Complete inventory of all system components with quick reference
   - **When to use**: Understanding system architecture, finding component documentation
   - **Coverage**: Infrastructure, automation, development systems, integrations with status and quick commands
   - **For AI**: Read to understand what systems exist and where to find implementation details

### How They Work Together

- **DOCUMENTATION-INDEX.md** = "How do I find information about X?"
- **BACKUP-DOCUMENTATION-INDEX.md** = "Everything about backups in one place"
- **SYSTEM-COMPONENTS.md** = "What systems exist and how do they work?"

All three indexes cross-reference each other and are kept in sync through the [DOCUMENTATION-MAINTENANCE-CHECKLIST.md](DOCUMENTATION-MAINTENANCE-CHECKLIST.md).

### New Documentation Structure

As of 2025-11-16, documentation is organized in two locations:

**Root Directory** (frequently accessed operational guides):
- README.md, START_HERE.md, DOCUMENTATION-INDEX.md
- BACKUP-DOCUMENTATION-INDEX.md, SYSTEM-COMPONENTS.md
- GIT-SAFETY-CHECKLIST.md, docs/guides/security-best-practices.md
- Other frequently used operational guides

**docs/ Directory** (organized by topic):
- `docs/troubleshooting/` - All troubleshooting guides
- `docs/` - Specialized documentation (HIPAA, templates, workflows, etc.)
- Future topic-based subdirectories as needed

This structure balances **quick access** (root) with **logical organization** (docs/).

---

## 🚀 Quick Start Navigation

### For Brand New Users (Human or AI)
1. **[START_HERE.md](START_HERE.md)** - Workspace orientation and critical rules
2. **[README.md](README.md)** - Overview, quick start, common workflows
3. **[SYSTEM-COMPONENTS.md](SYSTEM-COMPONENTS.md)** - Complete system inventory
4. **[EVENT_LOG.md](EVENT_LOG.md)** - Recent changes and current state

### For AI Assistants Starting a New Chat
1. **[START_HERE.md](START_HERE.md)** - Know your role (Claude Code vs Gemini) and PHI rules
2. **[DOCUMENTATION-INDEX.md](DOCUMENTATION-INDEX.md)** - THIS FILE (complete doc navigation)
3. **[SYSTEM-COMPONENTS.md](SYSTEM-COMPONENTS.md)** - All systems and where to find them
4. **Task-specific docs** - Jump directly to what you need (see sections below)

### For Troubleshooting
1. **[BACKUP-DOCUMENTATION-INDEX.md](BACKUP-DOCUMENTATION-INDEX.md)** ⭐ - All backup system documentation
2. **[docs/troubleshooting/BACKUP-SYSTEM-TROUBLESHOOTING.md](docs/troubleshooting/BACKUP-SYSTEM-TROUBLESHOOTING.md)** ⭐ - Master troubleshooting guide (all 6 layers)
3. **[docs/troubleshooting/](docs/troubleshooting/)** - All troubleshooting guides by topic
4. **Layer-specific troubleshooting** - See "Backup & Recovery" section below

---

## 📚 Documentation Structure

### Root-Level Documentation (Start Here)

| Document | Purpose | When to Read |
|----------|---------|--------------|
| **[README.md](README.md)** | Workspace overview, quick start | First time setup |
| **[START_HERE.md](START_HERE.md)** | Orientation, PHI rules, AI guidelines | Every new session |
| **[DOCUMENTATION-INDEX.md](DOCUMENTATION-INDEX.md)** | THIS FILE - Master navigation | When looking for any doc |
| **[SYSTEM-COMPONENTS.md](SYSTEM-COMPONENTS.md)** | Complete system inventory | When working on systems |
| **[EVENT_LOG.md](EVENT_LOG.md)** | Recent changes, current state | Daily, before starting work |

### Critical Operational Guides

| Document | Purpose | When to Read |
|----------|---------|--------------|
| **[BACKUP-DOCUMENTATION-INDEX.md](BACKUP-DOCUMENTATION-INDEX.md)** | All backup documentation | When dealing with backups |
| **[docs/guides/git-safety-checklist.md](docs/guides/git-safety-checklist.md)** | Git operation safety | Before EVERY commit |
| **[docs/guides/security-best-practices.md](docs/guides/security-best-practices.md)** | HIPAA compliance, PHI handling | When handling PHI |
| **[docs/architecture/workspace-backup-architecture.md](docs/architecture/workspace-backup-architecture.md)** | 6-layer backup system design | Understanding backup strategy |

### Team Collaboration & Sync

| Document | Purpose | When to Read |
|----------|---------|--------------|
| **[SYNC-INSTRUCTIONS-FOR-ALVARO.md](SYNC-INSTRUCTIONS-FOR-ALVARO.md)** | Comprehensive sync guide for Alvaro (Yoshi) | When syncing Yoshi workspace |
| **[SYNC-QUICK-REFERENCE-ALVARO.md](SYNC-QUICK-REFERENCE-ALVARO.md)** | Quick reference checklist for Alvaro | Quick sync verification |
| **[SYNC-INSTRUCTIONS-FOR-YOSHI.md](SYNC-INSTRUCTIONS-FOR-YOSHI.md)** | Original sync instructions (historical) | Reference only |

### Architecture & Standards

| Document | Purpose | When to Read |
|----------|---------|--------------|
| **[WORKSPACE_ARCHITECTURE.md](WORKSPACE_ARCHITECTURE.md)** | Technical architecture | Understanding system design |
| **[WORKSPACE_GUIDE.md](WORKSPACE_GUIDE.md)** | Workspace standards, constitution | Following best practices |
| **[MCP_ECOSYSTEM.md](MCP_ECOSYSTEM.md)** | Complete MCP catalog | Using MCPs |
| **[WORKFLOW_PLAYBOOK.md](WORKFLOW_PLAYBOOK.md)** | How we do things | Standard procedures |
| **[docs/reference/configuration-guide.md](docs/reference/configuration-guide.md)** | Complete configuration reference | Setting up systems |
| **[docs/reference/health-check-quick-reference.md](docs/reference/health-check-quick-reference.md)** | System health monitoring | Checking system status |

---

## 🗂️ Documentation by Topic

### Backup & Recovery Systems ⭐

**Master Index**: [BACKUP-DOCUMENTATION-INDEX.md](BACKUP-DOCUMENTATION-INDEX.md)

**Primary Troubleshooting**:
- **[docs/troubleshooting/BACKUP-SYSTEM-TROUBLESHOOTING.md](docs/troubleshooting/BACKUP-SYSTEM-TROUBLESHOOTING.md)** - Master guide for all 6 layers
  - Layer 1: Local Git
  - Layer 2: GitHub Remote
  - Layer 3: Time Machine
  - Layer 4: Branch Protection
  - Layer 5: GCS Daily Backups
  - Layer 6: GCS Monthly Archives
  - Historical issues with complete solutions
  - Prevention checklists
  - Emergency restore procedures

**Layer-Specific Documentation**:
- **Google Sheets Backup**: [live-practice-management-system/.../Google-Sheets-Backup-System/TROUBLESHOOTING.md](live-practice-management-system/live-practice-management-system/2-Application%20Layer%20(Google%20Sheets)/Google-Sheets-Backup-System/TROUBLESHOOTING.md)
  - OAuth token expiration (RESOLVED)
  - Batch processing issues
  - Snapshot failures

**Workflow Files**:
- **GCS Workspace Backups**: `.github/workflows/workspace-backup-gcs.yml` (all 3 repos)
- **Google Sheets Snapshots**: `.github/workflows/daily-snapshots.yml`

**Quick Commands**:
```bash
# Check all backup layers
gh run list --workflow=workspace-backup-gcs.yml --limit 5
gsutil ls gs://ssd-workspace-backups-immutable/medical-patient-data/daily-backups/ | tail -5
git status && git log --oneline -5
```

---

### Security & Compliance

**Primary Guides**:
- **[docs/guides/security-best-practices.md](docs/guides/security-best-practices.md)** - HIPAA compliance, credential management
- **[docs/guides/git-safety-checklist.md](docs/guides/git-safety-checklist.md)** - Pre-commit safety checklist
- **[docs/guides/git-safety-enforcement.md](docs/guides/git-safety-enforcement.md)** - Automated safety enforcement
- **[docs/guides/safe-production-testing-guide.md](docs/guides/safe-production-testing-guide.md)** - Testing without breaking production
- **[docs/guides/testing-guide.md](docs/guides/testing-guide.md)** - Comprehensive testing guide

**PHI Handling**:
- **[START_HERE.md](START_HERE.md)** - PHI rules and AI responsibilities

**Tools**:
```bash
# Scan for credentials/PHI before commit
mcp__security-compliance-mcp__scan_for_credentials
mcp__security-compliance-mcp__scan_for_phi
```

---

### Development & Coding

**MCP Development**:
- **[MCP_ECOSYSTEM.md](MCP_ECOSYSTEM.md)** - Complete catalog of 28+ MCPs
- **[docs/MCP-DEPLOYMENT-GUIDE.md](docs/MCP-DEPLOYMENT-GUIDE.md)** - MCP deployment procedures
- **[templates-and-patterns/MCP-DEVELOPMENT-STANDARD.md](templates-and-patterns/MCP-DEVELOPMENT-STANDARD.md)** - MANDATORY development standard
- **[templates-and-patterns/mcp-server-templates/](templates-and-patterns/mcp-server-templates/)** - 24 drop-in templates

**Standards**:
- **[WORKSPACE_GUIDE.md](WORKSPACE_GUIDE.md)** - Workspace constitution and standards
- **[STANDARDS_ENFORCEMENT_SYSTEM.md](STANDARDS_ENFORCEMENT_SYSTEM.md)** - Quality enforcement
- **[docs/TEMPLATE_MANAGEMENT.md](docs/TEMPLATE_MANAGEMENT.md)** - Template versioning
- **[docs/PLATFORM_CONTENT_GUIDE.md](docs/PLATFORM_CONTENT_GUIDE.md)** - Platform content standards

---

### Configuration & Setup

**Primary Guides**:
- **[docs/reference/configuration-guide.md](docs/reference/configuration-guide.md)** - Complete configuration reference
- **[docs/reference/health-check-quick-reference.md](docs/reference/health-check-quick-reference.md)** - System health monitoring

**Workspace Setup**:
- **[docs/troubleshooting/WORKSPACE-SETUP-ISSUES.md](docs/troubleshooting/WORKSPACE-SETUP-ISSUES.md)** - Setup troubleshooting
- **[docs/troubleshooting/WORKSPACE-SYNC-ISSUES.md](docs/troubleshooting/WORKSPACE-SYNC-ISSUES.md)** - Sync troubleshooting

**Google Workspace**:
- **[google-workspace-oauth-setup/](google-workspace-oauth-setup/)** - OAuth and service account setup

---

### Troubleshooting Guides

**Master Troubleshooting Directory**: [docs/troubleshooting/](docs/troubleshooting/)

| Guide | Purpose |
|-------|---------|
| **[BACKUP-SYSTEM-TROUBLESHOOTING.md](docs/troubleshooting/BACKUP-SYSTEM-TROUBLESHOOTING.md)** ⭐ | All 6 backup layers |
| **[WORKSPACE-SETUP-ISSUES.md](docs/troubleshooting/WORKSPACE-SETUP-ISSUES.md)** | Workspace initialization |
| **[WORKSPACE-SYNC-ISSUES.md](docs/troubleshooting/WORKSPACE-SYNC-ISSUES.md)** | Cross-workspace sync |

**System-Specific Troubleshooting**:
- **Google Sheets**: [live-practice-management-system/.../TROUBLESHOOTING.md](live-practice-management-system/live-practice-management-system/2-Application%20Layer%20(Google%20Sheets)/Google-Sheets-Backup-System/TROUBLESHOOTING.md)
- **GitHub Actions**: [docs/TROUBLESHOOTING-GITHUB-ACTIONS.md](docs/TROUBLESHOOTING-GITHUB-ACTIONS.md)

---

### Implementation Projects

**Overview**: **[Implementation Projects/README.md](Implementation%20Projects/README.md)** - All active and completed projects

**Google Sheets Version Control** (Production Ready):
- **[README.md](Implementation%20Projects/google-sheets-version-control/README.md)** - Project overview
- **Reports**: `Implementation Projects/google-sheets-version-control/docs/reports/`
  - Implementation summaries, audit reports, completion summaries
- **Guides**: `Implementation Projects/google-sheets-version-control/docs/guides/`
  - Setup instructions, how-to guides, troubleshooting
- **Deployment**: `Implementation Projects/google-sheets-version-control/docs/deployment/`
  - Deployment procedures, transition guides, quick deploy references

**Workspace Management Consolidation** (Ready to Start):
- **[README.md](Implementation%20Projects/workspace-management-consolidation/README.md)** - Project plan
- **[PROJECT-PLAN.md](Implementation%20Projects/workspace-management-consolidation/PROJECT-PLAN.md)** - Detailed implementation plan

---

### Specialized Documentation

**Team Onboarding**:
- **[SYNC-INSTRUCTIONS-FOR-YOSHI.md](SYNC-INSTRUCTIONS-FOR-YOSHI.md)** - AI-to-AI workspace sync

**System Architecture**:
- **[docs/architecture/workspace-backup-architecture.md](docs/architecture/workspace-backup-architecture.md)** - Backup system diagrams and architecture
- **[WORKSPACE_ARCHITECTURE.md](WORKSPACE_ARCHITECTURE.md)** - Complete technical architecture

**Workflows & Maintenance**:
- **[docs/WORKFLOW-MAINTENANCE-CHECKLIST.md](docs/WORKFLOW-MAINTENANCE-CHECKLIST.md)** - Workflow maintenance procedures
- **[docs/WORKSPACE-HEALTH-CHECK.md](docs/WORKSPACE-HEALTH-CHECK.md)** - System health check procedures

---

## 🔍 How to Find What You Need

### "I need to troubleshoot a backup issue"
1. Go to **[BACKUP-DOCUMENTATION-INDEX.md](BACKUP-DOCUMENTATION-INDEX.md)**
2. Find your layer (1-6) or system (Google Sheets)
3. Jump to the specific troubleshooting guide
4. Search for your symptom in "Historical Issues" section

### "I need to understand how the system works"
1. Go to **[SYSTEM-COMPONENTS.md](SYSTEM-COMPONENTS.md)** for complete inventory
2. Go to **[WORKSPACE_ARCHITECTURE.md](WORKSPACE_ARCHITECTURE.md)** for technical details
3. Check project-specific documentation in `Implementation Projects/[project-name]/`

### "I need to follow a standard procedure"
1. Go to **[WORKFLOW_PLAYBOOK.md](WORKFLOW_PLAYBOOK.md)** for workflows
2. Check **[WORKSPACE_GUIDE.md](WORKSPACE_GUIDE.md)** for standards
3. Review checklists in relevant troubleshooting guides

### "I need to work on an implementation project"
1. Go to **[Implementation Projects/README.md](Implementation%20Projects/README.md)** for project overview
2. Read project-specific README: `Implementation Projects/[project-name]/README.md`
3. Check project documentation: `Implementation Projects/[project-name]/docs/`
4. Review reports, guides, or deployment procedures as needed

### "I encountered an error"
1. Search **[docs/troubleshooting/](docs/troubleshooting/)** for similar symptoms
2. Check **[EVENT_LOG.md](EVENT_LOG.md)** for recent related changes
3. Review system-specific TROUBLESHOOTING.md files
4. If new issue: document it following the pattern in existing guides

### "I'm working with PHI"
1. **STOP** - Verify you're Gemini (not Claude Code)
2. Read **[docs/guides/security-best-practices.md](docs/guides/security-best-practices.md)**
3. Initialize audit logging
4. Follow PHI handling rules in **[START_HERE.md](START_HERE.md)**

### "I need to use an MCP"
1. Check **[MCP_ECOSYSTEM.md](MCP_ECOSYSTEM.md)** for complete catalog
2. Verify MCP is installed: `ls ~/.claude.json`
3. Review MCP-specific documentation in `mcp-infrastructure/`

---

## 📍 Documentation Locations

### Root Directory (Easy Access)
```
medical-patient-data/
├── README.md                           # Overview, quick start
├── START_HERE.md                       # Orientation, PHI rules
├── DOCUMENTATION-INDEX.md              # THIS FILE
├── BACKUP-DOCUMENTATION-INDEX.md       # All backup docs
├── SYSTEM-COMPONENTS.md                # System inventory
├── EVENT_LOG.md                        # Recent changes
```

### docs/ Directory (Organized by Topic)
```
docs/
├── troubleshooting/                       # All troubleshooting guides
│   ├── BACKUP-SYSTEM-TROUBLESHOOTING.md   ⭐ Master backup guide (all 6 layers)
│   ├── WORKSPACE-SETUP-ISSUES.md          # Initial setup problems
│   └── WORKSPACE-SYNC-ISSUES.md           # Cross-workspace sync issues
├── guides/                                # Operational guides
│   ├── git-safety-checklist.md            # Pre-commit safety
│   ├── git-safety-enforcement.md          # Automated safety
│   ├── safe-production-testing-guide.md   # Testing procedures
│   ├── security-best-practices.md         # HIPAA & security
│   └── testing-guide.md                   # Comprehensive testing
├── reference/                             # Reference documentation
│   ├── configuration-guide.md             # System configuration
│   └── health-check-quick-reference.md    # Health monitoring
├── architecture/                          # Architecture documents
│   └── workspace-backup-architecture.md   # Backup system design
├── GIT-COMMIT-SAFETY-CHECKLIST.md        # Legacy location (to be moved)
├── MCP-DEPLOYMENT-GUIDE.md               # MCP deployment
├── PLATFORM_CONTENT_GUIDE.md             # Content standards
├── TEMPLATE_MANAGEMENT.md                # Template versioning
├── WORKFLOW-MAINTENANCE-CHECKLIST.md     # Workflow maintenance
└── WORKSPACE-HEALTH-CHECK.md             # Health check procedures
```

### Symlinked Documentation (Shared Across Workspaces)
```
Symlinks to operations-workspace:
├── WORKSPACE_GUIDE.md
├── WORKSPACE_ARCHITECTURE.md
├── MCP_ECOSYSTEM.md
├── WORKFLOW_PLAYBOOK.md
└── STANDARDS_ENFORCEMENT_SYSTEM.md
```

### Implementation Projects Documentation
```
Implementation Projects/
├── README.md                           # Projects overview & standards
├── google-sheets-version-control/
│   ├── README.md                       # Project overview
│   └── docs/
│       ├── reports/                    # Implementation summaries & audits
│       │   ├── IMPLEMENTATION-SUMMARY.md
│       │   ├── DEV3-DEV4-COMPLETE-SUMMARY.md
│       │   ├── PARITY-AUDIT-REPORT.md
│       │   ├── AUTONOMOUS-DEPLOYMENT-SUMMARY.md
│       │   └── [other summaries]
│       ├── guides/                     # Setup & configuration
│       │   ├── HOW-TO-ADD-237-SHEETS.md
│       │   ├── API-ENABLEMENT-INSTRUCTIONS.md
│       │   └── [other guides]
│       └── deployment/                 # Deployment procedures
│           ├── PRODUCTION-DEPLOYMENT-TRANSITION.md
│           ├── QUICK-DEPLOY-ALVARO.md
│           └── WEBHOOK-DEPLOYMENT-GUIDE.md
├── workspace-management-consolidation/
│   ├── README.md
│   └── PROJECT-PLAN.md
└── ai-task-tracker/
    └── [project files]
```

---

## 🆕 Adding New Documentation

### When Creating New Documentation

**MANDATORY**: Update this index immediately when creating new documentation

**Critical Requirement - Three-Pathway Navigation**:

Every new system component, troubleshooting guide, resource, or important documentation **MUST** be discoverable through all three primary navigation pathways to ensure future AIs can find it:

**✅ MANDATORY CHECKLIST - Update ALL Three Pathways:**

1. **Pathway 1: README.md** (Quick Start / Critical Guides)
   - Add to "Quick Navigation" if it's a major index
   - Add to "Critical Operational Guides" if it's essential for operations
   - Add to "Documentation Index" section for topic-specific docs
   - Add to "Troubleshooting" section if it's a troubleshooting guide

2. **Pathway 2: DOCUMENTATION-INDEX.md** (Master Navigation Hub)
   - Add to appropriate "Documentation by Topic" section
   - Add to "Quick Start Navigation" if critical for initialization
   - Add to "How to Find What You Need" scenario-based guide if applicable
   - Add to table of contents for the relevant section

3. **Pathway 3: SYSTEM-COMPONENTS.md** (System Inventory)
   - Add new system component entry with full details
   - Include documentation references (link to all related docs)
   - Add to appropriate category (Infrastructure, Automation, etc.)
   - Include status, purpose, quick commands, and troubleshooting links

**WHY This Matters**:
- AIs in new chats have no conversation history
- They must be able to discover documentation logically
- Multiple entry points ensure discoverability
- Consistent navigation patterns reduce "starting from scratch"

**Standard Process**:
1. Create the new document in appropriate location:
   - Root: Operational guides used frequently
   - docs/: Organized by topic (troubleshooting/, compliance/, etc.)
   - Project directories: System-specific documentation
2. **Update all three pathways above** ⭐
3. Add topic-specific index if creating new category (e.g., BACKUP-DOCUMENTATION-INDEX.md)
4. Update **[START_HERE.md](START_HERE.md)** if critical for initialization
5. Commit all documentation updates together with descriptive message

**Documentation Standards**:
- Use clear, descriptive filenames (e.g., `BACKUP-SYSTEM-TROUBLESHOOTING.md`, not `backup.md`)
- Include frontmatter with metadata (type, tags, last_updated)
- Follow existing patterns in similar documents
- Add "Last Updated" date
- Include table of contents for long documents
- Cross-reference related documentation
- Link back to navigation files (README, DOCUMENTATION-INDEX, SYSTEM-COMPONENTS)

---

## 🔗 Cross-Workspace Documentation

This workspace is part of a **three-workspace architecture**:

| Workspace | Documentation Focus |
|-----------|---------------------|
| **medical-patient-data** (THIS) | PHI-specific, Google Sheets, clinical workflows |
| **operations-workspace** | Shared standards, templates, MCP development |
| **mcp-infrastructure** | MCP server projects, technical implementation |

**Shared Documentation** (via symlinks):
- WORKSPACE_GUIDE.md
- WORKSPACE_ARCHITECTURE.md
- MCP_ECOSYSTEM.md
- WORKFLOW_PLAYBOOK.md
- STANDARDS_ENFORCEMENT_SYSTEM.md

**Accessing Documentation Across Workspaces**:
```bash
# This workspace (medical-patient-data)
cat WORKSPACE_GUIDE.md  # Symlink to operations-workspace

# Navigate to other workspaces
cd ../operations-workspace  # Shared standards and templates
cd ../mcp-infrastructure    # MCP server projects
```

---

## 📖 Documentation Maintenance

**Three-Pathway Update Checklist**: [DOCUMENTATION-MAINTENANCE-CHECKLIST.md](DOCUMENTATION-MAINTENANCE-CHECKLIST.md) ⭐

When adding any new documentation, system component, or resource, you **MUST** update all three navigation pathways (README.md, DOCUMENTATION-INDEX.md, SYSTEM-COMPONENTS.md). See the checklist above for detailed requirements.

### Regular Updates

**Daily**:
- Update **[EVENT_LOG.md](EVENT_LOG.md)** with significant changes
- Update "Last Updated" dates in modified documents

**After Resolving Issues**:
- Document in appropriate troubleshooting guide
- Update prevention checklists
- Cross-reference related documentation

**Monthly**:
- Review all troubleshooting guides for accuracy
- Update system component inventory
- Archive outdated documentation

### Quality Standards

**All Documentation Must**:
- Be discoverable via this index
- Have clear purpose and audience
- Include "Last Updated" date
- Use consistent formatting
- Cross-reference related docs
- Be version controlled in git

---

## 🆘 Getting Help

### For AI Assistants

**If you can't find what you need**:
1. Search this index for keywords
2. Check **[SYSTEM-COMPONENTS.md](SYSTEM-COMPONENTS.md)** for system inventory
3. Grep for keywords: `grep -r "search term" docs/`
4. Check **[EVENT_LOG.md](EVENT_LOG.md)** for recent context

**If documentation is missing**:
1. Create it following standards above
2. Update this index
3. Document the gap in **[EVENT_LOG.md](EVENT_LOG.md)**

### For Human Users

**Questions about**:
- **Workspace setup**: [docs/troubleshooting/WORKSPACE-SETUP-ISSUES.md](docs/troubleshooting/WORKSPACE-SETUP-ISSUES.md)
- **Backups**: [BACKUP-DOCUMENTATION-INDEX.md](BACKUP-DOCUMENTATION-INDEX.md)
- **Security**: [docs/guides/security-best-practices.md](docs/guides/security-best-practices.md)
- **MCPs**: [MCP_ECOSYSTEM.md](MCP_ECOSYSTEM.md)
- **Standards**: [WORKSPACE_GUIDE.md](WORKSPACE_GUIDE.md)

---

## 📊 Documentation Statistics

**Root-level guides**: 18+ markdown files
**docs/ directory**: 10+ organized guides
**Troubleshooting guides**: 3+ comprehensive guides
**System-specific docs**: 5+ project documentation sets
**Symlinked docs**: 5 shared across workspaces

**Last Full Audit**: 2025-11-16

---

**Remember**: This index is your map to all workspace documentation. If you can't find something here, it either doesn't exist yet (create it!) or the index needs updating (update it!).

**For AI Assistants**: Bookmark this file mentally. You'll reference it frequently throughout your session.

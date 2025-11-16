# Documentation Index - Master Navigation Guide

**Last Updated**: 2025-11-16
**Purpose**: Central navigation hub for ALL workspace documentation
**For AI Assistants**: Read this file early in initialization to understand the complete documentation structure

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
| **[GIT-SAFETY-CHECKLIST.md](GIT-SAFETY-CHECKLIST.md)** | Git operation safety | Before EVERY commit |
| **[SECURITY_BEST_PRACTICES.md](SECURITY_BEST_PRACTICES.md)** | HIPAA compliance, PHI handling | When handling PHI |
| **[WORKSPACE-BACKUP-ARCHITECTURE.md](WORKSPACE-BACKUP-ARCHITECTURE.md)** | 6-layer backup system design | Understanding backup strategy |

### Architecture & Standards

| Document | Purpose | When to Read |
|----------|---------|--------------|
| **[WORKSPACE_ARCHITECTURE.md](WORKSPACE_ARCHITECTURE.md)** | Technical architecture | Understanding system design |
| **[WORKSPACE_GUIDE.md](WORKSPACE_GUIDE.md)** | Workspace standards, constitution | Following best practices |
| **[MCP_ECOSYSTEM.md](MCP_ECOSYSTEM.md)** | Complete MCP catalog | Using MCPs |
| **[WORKFLOW_PLAYBOOK.md](WORKFLOW_PLAYBOOK.md)** | How we do things | Standard procedures |

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
- **[SECURITY_BEST_PRACTICES.md](SECURITY_BEST_PRACTICES.md)** - HIPAA compliance, credential management
- **[GIT-SAFETY-CHECKLIST.md](GIT-SAFETY-CHECKLIST.md)** - Pre-commit safety checklist
- **[GIT-SAFETY-ENFORCEMENT.md](GIT-SAFETY-ENFORCEMENT.md)** - Automated safety enforcement
- **[SAFE-PRODUCTION-TESTING-GUIDE.md](SAFE-PRODUCTION-TESTING-GUIDE.md)** - Testing without breaking production

**PHI Handling**:
- **[START_HERE.md](START_HERE.md)** - PHI rules and AI responsibilities
- **[docs/HIPAA-COMPLIANCE-GUIDE.md](docs/HIPAA-COMPLIANCE-GUIDE.md)** - Full HIPAA guide
- **[docs/PHI-GUARD-README.md](docs/PHI-GUARD-README.md)** - Automated PHI detection

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
- **[templates-and-patterns/MCP-DEVELOPMENT-STANDARD.md](templates-and-patterns/MCP-DEVELOPMENT-STANDARD.md)** - MANDATORY development standard
- **[templates-and-patterns/mcp-server-templates/](templates-and-patterns/mcp-server-templates/)** - 24 drop-in templates

**Standards**:
- **[WORKSPACE_GUIDE.md](WORKSPACE_GUIDE.md)** - Workspace constitution and standards
- **[STANDARDS_ENFORCEMENT_SYSTEM.md](STANDARDS_ENFORCEMENT_SYSTEM.md)** - Quality enforcement
- **[docs/TEMPLATE_MANAGEMENT.md](docs/TEMPLATE_MANAGEMENT.md)** - Template versioning

---

### Configuration & Setup

**Primary Guides**:
- **[CONFIGURATION-GUIDE.md](CONFIGURATION-GUIDE.md)** - Complete configuration reference
- **[HEALTH-CHECK-QUICK-REFERENCE.md](HEALTH-CHECK-QUICK-REFERENCE.md)** - System health monitoring

**Workspace Setup**:
- **[docs/troubleshooting/WORKSPACE-SETUP-ISSUES.md](docs/troubleshooting/WORKSPACE-SETUP-ISSUES.md)** - Setup troubleshooting
- **[docs/troubleshooting/WORKSPACE-SYNC-ISSUES.md](docs/troubleshooting/WORKSPACE-SYNC-ISSUES.md)** - Sync troubleshooting

**Google Workspace**:
- **[google-workspace-oauth-setup/](google-workspace-oauth-setup/)** - OAuth and service account setup
- **[docs/LEARNING-OPTIMIZER-SETUP.md](docs/LEARNING-OPTIMIZER-SETUP.md)** - Learning optimizer configuration

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

### Specialized Documentation

**Team Onboarding**:
- **[docs/TEAM-ONBOARDING.md](docs/TEAM-ONBOARDING.md)** - New team member guide
- **[SYNC-INSTRUCTIONS-FOR-YOSHI.md](SYNC-INSTRUCTIONS-FOR-YOSHI.md)** - AI-to-AI workspace sync

**System Visualization**:
- **[docs/SYSTEM-VISUALIZATION.md](docs/SYSTEM-VISUALIZATION.md)** - Architecture diagrams
- **[WORKSPACE-BACKUP-ARCHITECTURE.md](WORKSPACE-BACKUP-ARCHITECTURE.md)** - Backup system diagrams

**Compliance**:
- **[docs/HIPAA-COMPLIANCE-GUIDE.md](docs/HIPAA-COMPLIANCE-GUIDE.md)** - Full HIPAA compliance guide
- **[docs/HIPAA-COMPLIANCE-DATA-BOUNDARY.md](docs/HIPAA-COMPLIANCE-DATA-BOUNDARY.md)** - Data boundary definitions

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
3. Check component-specific README files in project directories

### "I need to follow a standard procedure"
1. Go to **[WORKFLOW_PLAYBOOK.md](WORKFLOW_PLAYBOOK.md)** for workflows
2. Check **[WORKSPACE_GUIDE.md](WORKSPACE_GUIDE.md)** for standards
3. Review checklists in relevant troubleshooting guides

### "I encountered an error"
1. Search **[docs/troubleshooting/](docs/troubleshooting/)** for similar symptoms
2. Check **[EVENT_LOG.md](EVENT_LOG.md)** for recent related changes
3. Review system-specific TROUBLESHOOTING.md files
4. If new issue: document it following the pattern in existing guides

### "I'm working with PHI"
1. **STOP** - Verify you're Gemini (not Claude Code)
2. Read **[SECURITY_BEST_PRACTICES.md](SECURITY_BEST_PRACTICES.md)**
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
├── WORKSPACE-BACKUP-ARCHITECTURE.md    # Backup system design
├── CONFIGURATION-GUIDE.md              # Configuration reference
├── SECURITY_BEST_PRACTICES.md          # Security & HIPAA
├── GIT-SAFETY-CHECKLIST.md             # Git safety
└── [other operational guides]
```

### docs/ Directory (Organized by Topic)
```
docs/
├── troubleshooting/
│   ├── BACKUP-SYSTEM-TROUBLESHOOTING.md   ⭐ Master backup guide
│   ├── WORKSPACE-SETUP-ISSUES.md
│   └── WORKSPACE-SYNC-ISSUES.md
├── HIPAA-COMPLIANCE-GUIDE.md
├── PHI-GUARD-README.md
├── TEAM-ONBOARDING.md
├── SYSTEM-VISUALIZATION.md
└── [other specialized docs]
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

### System-Specific Documentation
```
Project directories contain:
├── Implementation Projects/
│   └── google-sheets-version-control/
│       ├── TROUBLESHOOTING.md          # Google Sheets specific
│       ├── IMPLEMENTATION-SUMMARY.md
│       └── docs/
└── [other project directories with README.md files]
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
- **Security**: [SECURITY_BEST_PRACTICES.md](SECURITY_BEST_PRACTICES.md)
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

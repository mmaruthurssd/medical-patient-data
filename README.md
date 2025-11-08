---
type: readme
tags: [workspace, gemini-ai, patient-data, hipaa-compliance, three-workspace]
---

# Medical Patient Data Workspace

**Purpose:** HIPAA-compliant Gemini AI integration for patient data workflows and clinical operations

**Status:** 🟡 Active Development | ✅ PHI Guard Enabled | 🔄 Shared Resources Synced

**Last Updated:** 2025-11-08

---

## Quick Start

### New Team Members
👉 **Start here:** [`TEAM-ONBOARDING.md`](TEAM-ONBOARDING.md) - Complete onboarding guide for Alvaro and other users

### Existing Users
```bash
# 1. Verify shared resources are synced
ls -la shared-resources/

# 2. Check PHI Guard is active
git commit --dry-run

# 3. Access development projects
ls projects-in-development/

# 4. Run Gemini integration (requires API key)
npm run test
```

---

## Overview

This workspace is part of a **three-workspace architecture** designed for HIPAA-compliant AI development. It handles all Gemini AI integrations and patient data workflows under Google Workspace BAA coverage.

### Three-Workspace System

```
┌─────────────────────────────────────────────────────────────┐
│ 1. medical-practice-workspace (Claude Code, NO PHI)        │
│    • AI development platform                                 │
│    • MCP server development                                  │
│    • Templates, docs, planning                               │
│    • Team collaboration hub                                  │
└─────────────────────────────────────────────────────────────┘
                          ↕
                  Shared Resources
                  (Documentation, Templates, Commands)
                          ↕
┌─────────────────────────────────────────────────────────────┐
│ 2. medical-patient-data (Gemini, PHI ALLOWED) ← YOU ARE HERE│
│    • Gemini AI integration                                   │
│    • Patient workflow automation                             │
│    • Google Sheets Apps Script                               │
│    • Clinical operations                                     │
│    • ✅ PHI Guard protection active                         │
└─────────────────────────────────────────────────────────────┘
                          ↕
                  26 MCP Servers (Shared)
                          ↕
┌─────────────────────────────────────────────────────────────┐
│ 3. mcp-infrastructure (Platform-Agnostic Tools)             │
│    • 26 production MCP servers                               │
│    • 434,000+ lines of TypeScript/Python                     │
│    • Accessible to both Claude Code AND Gemini               │
└─────────────────────────────────────────────────────────────┘
```

**Key Design Principles:**
- ✅ Physical separation of PHI and non-PHI workspaces
- ✅ Shared resources synced automatically via symlinks
- ✅ PHI Guard prevents accidental data leakage
- ✅ Google BAA covers all Gemini operations
- ✅ Claude Code in medical-practice-workspace (no PHI access)
- ✅ Gemini in medical-patient-data (PHI allowed under BAA)

---

## Key Features

### 1. Shared Resources Sync 📚

All documentation, templates, and commands are automatically synced across workspaces:

```bash
# Edit once in ANY workspace → Available everywhere
vim shared-resources/documentation/WORKSPACE_GUIDE.md

# Same file accessible in medical-practice-workspace automatically!
```

**Shared Resources Include:**
- **7 Documentation Guides** (145KB total)
  - WORKSPACE_GUIDE.md
  - WORKSPACE_ARCHITECTURE.md
  - HIPAA-COMPLIANCE-DATA-BOUNDARY.md
  - MCP_ECOSYSTEM.md (26 MCPs)
  - SECURITY_BEST_PRACTICES.md
  - And more...

- **37+ Templates**
  - 24 MCP server templates
  - 8 tool templates (OAuth, Clasp, Apps Script)
  - Project structure templates
  - Workflow templates

- **4 Claude Commands**
  - `/start` - Read workspace guide
  - `/git` - Git workflow assistance
  - `/quickprompt` - Quick orientation
  - `/mcp-list` - List available MCPs

**Architecture:** `~/Desktop/shared-resources/` (symlinked from both workspaces)

---

### 2. PHI Guard Protection System 🔒

**Automatic PHI scanning** prevents HIPAA violations:

```bash
# Pre-commit hook scans automatically
git add patient-data.ts
git commit -m "Add feature"
# → PHI Guard scans for SSN, MRN, DOB, email, phone, etc.
# → Blocks commit if PHI detected

# Manual scanning
npm run scan-phi              # Scan entire workspace
npm run scan-phi:projects     # Scan projects-in-development
```

**Protection Coverage:**
- ✅ All 18 HIPAA identifiers detected
- ✅ Automatic blocking on `git commit`
- ✅ Manual scanning on demand
- ✅ Protects projects-in-development symlink
- ✅ Prevents PHI leakage to development workspace

📖 **Full Guide:** [`PHI-GUARD-README.md`](PHI-GUARD-README.md)

---

### 3. Development Projects Access 🔗

**Direct access to medical-practice-workspace projects:**

```bash
# Development projects symlink
ls projects-in-development/

# Available projects:
# - Plant Baby Project
# - Google Sheets Projects
# - MCP Standardization Project
# - Project Management MCP Server
# - Security Compliance MCP
# - Workflow Orchestrator
# - And more...

# Live practice management system symlink
ls live-practice-management-system/

# Production system (code only, no PHI):
# - Google Sheets Apps Script code
# - Version control system
# - Deployment guides
# - Monitoring dashboards
```

**HIPAA-Safe:** PHI Guard blocks any PHI before it reaches development workspace

---

### 4. Gemini AI Integration ⚡

**HIPAA-compliant AI workflows:**

```typescript
// Example: Patient inquiry classification
import { GoogleGenerativeAI } from '@google/generative-ai';
import { auditLog } from './utils/audit-logger';
import { deidentifyText } from './utils/de-identify';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

// Classify inquiry with audit logging
const result = await model.generateContent(inquiry);
await auditLog('gemini-classification', { inquiry, result });
```

**Available NPM Scripts:**
```bash
npm run test         # Test Gemini connectivity
npm run classify     # Patient inquiry classifier
npm run deidentify   # PHI de-identification tool
npm run audit        # View audit logs
npm run scan-phi     # PHI scanner
```

**Gemini Examples:**
- `04-product-under-development/gemini-examples/test-gemini.ts`
- `04-product-under-development/gemini-examples/patient-inquiry-classifier.ts`
- `04-product-under-development/gemini-examples/utils/audit-logger.ts`
- `04-product-under-development/gemini-examples/utils/de-identify.ts`

---

## Workspace Structure

```
medical-patient-data/
├── README.md ← YOU ARE HERE
├── WORKSPACE_GUIDE.md                  # Constitution and standards
├── WORKSPACE_ARCHITECTURE.md           # Complete architecture
├── HIPAA-COMPLIANCE-DATA-BOUNDARY.md   # CRITICAL - PHI handling rules
├── PHI-GUARD-README.md                 # PHI Guard documentation
├── TEAM-ONBOARDING.md                  # New user onboarding
├── INTEGRATION-PROGRESS.md             # Gemini integration status
│
├── shared-resources/ → ~/Desktop/shared-resources/  (SYMLINK)
│   ├── documentation/                   # 7 guides
│   ├── templates/                       # 37+ templates
│   └── commands/                        # 4 Claude commands
│
├── projects-in-development/ → ../medical-practice-workspace/projects-in-development/  (SYMLINK)
│   ├── Plant Baby Project
│   ├── Google Sheets Projects
│   ├── MCP Standardization Project
│   └── 5+ more active projects
│
├── live-practice-management-system/ → ../medical-practice-workspace/live-practice-management-system/  (SYMLINK)
│   ├── 2-Application Layer (Google Sheets)
│   ├── 4-Monitoring Layer
│   └── GitHub Version Control System
│
├── 01-planning-and-roadmap/            # Strategic planning
├── 02-goals-and-roadmap/               # Active goals
├── 03-resources-docs-assets-tools/     # Workspace-specific docs
├── 04-product-under-development/       # Gemini examples & active dev
├── 05-testing-and-validation/          # Test frameworks
├── 06-deployment-and-release/          # Deployment pipelines
├── 07-operations-and-maintenance/      # Operational workflows
├── 08-archive/                         # Completed work
├── .ai-planning/                       # AI orchestration state
├── .claude/
│   ├── commands/                       # Workspace-specific commands
│   └── shared-commands/ → symlink      # Shared commands
├── brainstorming/                      # Ideas and exploration
├── configuration/                      # Config files
├── scripts/
│   └── scan-phi.sh                     # PHI scanner script
├── temp/                               # Temporary files
├── audit-logs/                         # HIPAA audit logs
└── package.json                        # Node.js dependencies
```

---

## Security & HIPAA Compliance

### 🔒 PHI Protection Layers

**Layer 1: Workspace Separation**
- medical-practice-workspace = NO PHI
- medical-patient-data = PHI ALLOWED (under Google BAA)
- Physical separation enforced

**Layer 2: PHI Guard (Pre-Commit Hook)**
- Scans all files before `git commit`
- Detects 18 HIPAA identifiers
- Blocks commits containing PHI
- Location: `.git/hooks/pre-commit`

**Layer 3: De-identification Utilities**
- Safe Harbor method implementation
- Removes all HIPAA identifiers
- Validation checks
- Location: `04-product-under-development/gemini-examples/utils/de-identify.ts`

**Layer 4: Audit Logging**
- All PHI access logged
- Timestamped, user-tracked
- Queryable for compliance audits
- Location: `04-product-under-development/gemini-examples/utils/audit-logger.ts`

**Layer 5: Gitignore Protection**
- PHI patterns excluded (*.phi, patient-data/)
- Audit logs excluded
- Credentials excluded (.env, *.key)
- Location: `.gitignore`

### ⚠️ NEVER Commit

- ❌ Real patient data (names, SSN, MRN, DOB)
- ❌ Production database dumps
- ❌ Actual medical records
- ❌ Unredacted emails or messages
- ❌ API keys or credentials
- ❌ Audit logs containing PHI

### ✅ Always Use

- ✅ Synthetic test data
- ✅ De-identified data
- ✅ Environment variables for credentials
- ✅ PHI scanning before commits
- ✅ Audit logging for all PHI operations

---

## Available MCP Tools

All 26 MCP servers from `mcp-infrastructure/` are accessible:

**Workflow & Project Management:**
- `project-management` - Goals, roadmaps, tracking
- `task-executor` - Task workflows and orchestration
- `spec-driven` - Specification-driven development

**Security & Compliance:**
- `security-compliance-mcp` - PHI scanning, credential detection
- `backup-dr` - Backup and disaster recovery

**Development:**
- `git-assistant` - Git workflow guidance
- `code-review-mcp` - Code quality analysis
- `testing-validation` - Automated testing

**Intelligence:**
- `workspace-brain` - Learning and analytics
- `workspace-index` - Project indexing
- `performance-monitor-mcp` - Performance tracking

**And 15 more...** See: `shared-resources/documentation/MCP_ECOSYSTEM.md`

**Configuration:** `~/.claude.json` (global, works in all workspaces)

---

## Getting Started

### Prerequisites

- Node.js 18+
- Google Cloud Project with Gemini API enabled
- Access to medical-practice-workspace (on same machine)
- Google Workspace account with BAA coverage

### Setup (5 Minutes)

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Get Gemini API Key**
   - Visit: https://aistudio.google.com/app/apikey
   - Create API key under your organization's Google Cloud project
   - **IMPORTANT:** Ensure project is covered under Google Workspace BAA

3. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env and add:
   GEMINI_API_KEY=your-api-key-here
   ```

4. **Test Gemini Connectivity**
   ```bash
   npm run test
   # Expected: ✅ Gemini API connection successful
   ```

5. **Verify PHI Guard**
   ```bash
   echo "SSN: 123-45-6789" > temp/test.txt
   git add temp/test.txt
   git commit -m "Test"
   # Expected: ❌ Commit blocked by PHI Guard
   ```

6. **Verify Shared Resources**
   ```bash
   ls shared-resources/documentation/
   # Expected: 7 documentation files
   ```

**Full Onboarding:** See [`TEAM-ONBOARDING.md`](TEAM-ONBOARDING.md)

---

## Team Collaboration

### For New Team Members (Alvaro, etc.)

👉 **Follow:** [`TEAM-ONBOARDING.md`](TEAM-ONBOARDING.md)

**One-command setup:**
```bash
# Clone all three workspaces
git clone <medical-practice-workspace-url>
git clone <mcp-infrastructure-url>
git clone <medical-patient-data-url>

# Run setup script (creates symlinks, installs hooks)
./setup-workspace.sh
```

### Workspace Sync

**Shared Resources:**
- Edit documentation in ANY workspace
- Changes appear everywhere automatically (symlinks)
- No manual sync required

**MCP Servers:**
- Configured globally in `~/.claude.json`
- One installation serves all workspaces
- Updates propagate automatically

**Team Communication:**
- Use `workspace-sync-mcp` for team activity feed
- Post status updates and messages
- Auto-sync every 5 minutes

---

## Development Workflow

### Daily Workflow

1. **Check Shared Resources**
   ```bash
   # See if new docs/templates added
   ls shared-resources/documentation/
   ```

2. **Access Development Projects**
   ```bash
   # Work on projects from medical-practice-workspace
   cd projects-in-development/google-sheets-projects/
   ```

3. **Use Gemini AI**
   ```bash
   # Classify patient inquiries
   npm run classify
   ```

4. **Scan for PHI Before Committing**
   ```bash
   npm run scan-phi
   git add .
   git commit -m "Add feature"
   # PHI Guard runs automatically
   ```

### Using MCP Tools

**In Claude Code:**
```
User: "List all available MCPs"
Claude: [Uses mcp-list command]

User: "Create a new goal for patient intake automation"
Claude: [Uses project-management MCP]

User: "Scan this file for PHI"
Claude: [Uses security-compliance-mcp]
```

**MCP Configuration:** `~/.claude.json` (already configured)

---

## Documentation

**Root Documentation (This Workspace):**
- [`README.md`](README.md) ← You are here
- [`WORKSPACE_GUIDE.md`](WORKSPACE_GUIDE.md) - Constitution and standards
- [`WORKSPACE_ARCHITECTURE.md`](WORKSPACE_ARCHITECTURE.md) - Complete architecture
- [`HIPAA-COMPLIANCE-DATA-BOUNDARY.md`](HIPAA-COMPLIANCE-DATA-BOUNDARY.md) - PHI handling rules
- [`PHI-GUARD-README.md`](PHI-GUARD-README.md) - PHI Guard documentation
- [`TEAM-ONBOARDING.md`](TEAM-ONBOARDING.md) - New user onboarding
- [`INTEGRATION-PROGRESS.md`](INTEGRATION-PROGRESS.md) - Gemini integration status

**Shared Documentation (All Workspaces):**
- `shared-resources/documentation/` - 7 guides including:
  - `MCP_ECOSYSTEM.md` - All 26 MCPs
  - `SECURITY_BEST_PRACTICES.md` - Security patterns
  - `MCP-DEVELOPMENT-STANDARD.md` - Template-first development
  - `TEMPLATE_MANAGEMENT.md` - How to use templates

**Workspace-Specific:**
- `03-resources-docs-assets-tools/QUICK-START.md` - 15-minute setup
- `03-resources-docs-assets-tools/GEMINI-SETUP-GUIDE.md` - Gemini integration
- `03-resources-docs-assets-tools/HIPAA-INTEGRATION-PATTERNS.md` - 10 HIPAA patterns

---

## Related Workspaces

- **medical-practice-workspace** - Main development hub (Claude Code)
  - Location: `~/Desktop/medical-practice-workspace/`
  - Access: Via symlinks (shared-resources, projects-in-development)

- **mcp-infrastructure** - Shared MCP servers
  - Location: `~/Desktop/mcp-infrastructure/`
  - GitHub: https://github.com/mmaruthurssd/mcp-infrastructure
  - Access: Via `~/.claude.json` global configuration

---

## Troubleshooting

### PHI Guard Blocking Legitimate Code

```bash
# Check what was flagged
./scripts/scan-phi.sh <file>

# If false positive (e.g., example SSN in docs)
git commit --no-verify -m "Documented example (no real PHI)"

# Document the bypass in commit message!
```

### Shared Resources Not Syncing

```bash
# Verify symlink
ls -la shared-resources  # Should show: -> ../shared-resources

# Recreate if broken
rm shared-resources
ln -s ../shared-resources shared-resources
```

### Gemini API Not Working

```bash
# Check environment variables
cat .env | grep GEMINI_API_KEY

# Test connectivity
npm run test

# Check API key validity at:
# https://aistudio.google.com/app/apikey
```

### Projects Not Accessible

```bash
# Verify symlink
ls -la projects-in-development  # Should show: -> ../medical-practice-workspace/...

# Recreate if broken
rm projects-in-development
ln -s ../medical-practice-workspace/projects-in-development projects-in-development
```

---

## Support

**For Issues:**
1. Check documentation in root and `shared-resources/documentation/`
2. Review `TEAM-ONBOARDING.md` for setup issues
3. Check `INTEGRATION-PROGRESS.md` for known blockers
4. Consult `PHI-GUARD-README.md` for PHI scanning issues

**For HIPAA Compliance Questions:**
- See `HIPAA-COMPLIANCE-DATA-BOUNDARY.md`
- Review `03-resources-docs-assets-tools/HIPAA-COMPLIANCE-GUIDE.md`
- Check `03-resources-docs-assets-tools/HIPAA-INTEGRATION-PATTERNS.md`

**For MCP Tool Issues:**
- See `shared-resources/documentation/MCP_ECOSYSTEM.md`
- Check `~/.claude.json` configuration
- Verify MCP server is running in `mcp-infrastructure/`

---

## Architecture Summary

```
Three-Workspace System:
  1. medical-practice-workspace (Claude Code, NO PHI)
  2. medical-patient-data (Gemini, PHI ALLOWED) ← YOU ARE HERE
  3. mcp-infrastructure (26 MCPs, Platform-Agnostic)

Shared Resources:
  ~/Desktop/shared-resources/ (Docs, Templates, Commands)
  → Symlinked from both medical-practice-workspace and medical-patient-data
  → Edit once, available everywhere

PHI Protection:
  1. Workspace separation (physical isolation)
  2. PHI Guard pre-commit hook
  3. De-identification utilities
  4. Audit logging
  5. Gitignore protection

Team Collaboration:
  - One-command setup for new users
  - Automatic resource sync
  - Team activity feed via workspace-sync-mcp
  - Shared MCP infrastructure
```

---

**Workspace Version:** 2.0.0 (Three-Workspace Architecture)
**Last Updated:** 2025-11-08
**Next Steps:** See [`INTEGRATION-PROGRESS.md`](INTEGRATION-PROGRESS.md)
**Team Onboarding:** See [`TEAM-ONBOARDING.md`](TEAM-ONBOARDING.md)

---
type: reference
tags: [mcp-architecture, integration-patterns, workflow-orchestration, automation]
---

# Workspace Architecture

**Purpose:** Detailed technical architecture for MCP systems, integration patterns, and automation workflows

**When to read this:**
- Working with MCP integrations or multi-MCP workflows
- Setting up parallelization or sub-agent deployment
- Understanding MCP capabilities and tool listings
- Troubleshooting MCP issues or designing complex automation
- User asks "how X MCP works" or "what tools does X have"

**Quick reference:** For workspace standards and quick lookup, see WORKSPACE_GUIDE.md

---

# Team Mental Model: How the Workspace Works

## Core Philosophy

This workspace operates like a **distributed team** with specialized roles, where each component (MCP, framework, tool) has a specific strategic function. The system is designed for **autonomous operation with human oversight**, creating continuous feedback loops that improve performance over time.

### The Five Strategic Functions

**1. Organization & Discovery (Smart File Organizer)**
- **Role:** Workspace librarian and archivist
- **Responsibility:** Ensures everything has the right place and can be found
- **Mechanisms:** Lifecycle stage detection, pattern learning, file analysis
- **Feedback Loop:** Records organization decisions → Learns patterns → Suggests future placements
- **Integration:** Works with all MCPs for file placement decisions

**2. Quality & Validation (Autonomous Deployment Framework)**
- **Role:** Quality assurance and deployment engineer
- **Responsibility:** Ensures code meets standards before deployment
- **Mechanisms:** 5-stage validation, confidence scoring, automated rollback
- **Feedback Loop:** Issue detected → Classified → Resolved → Logged → Prevents recurrence
- **Integration:** Built into project-management (evaluate_goal) and task-executor (complete_task, archive_workflow)

**3. Planning & Coordination (project-management MCP)**
- **Role:** Project manager and workflow orchestrator
- **Responsibility:** Goal tracking, workflow coordination, MCP handoffs
- **Mechanisms:** Goal evaluation, autonomous classification, next-step suggestions
- **Feedback Loop:** Goals created → Tasks executed → Progress tracked → Patterns learned
- **Integration:** Coordinates spec-driven + task-executor + parallelization

**4. Execution & Tracking (task-executor MCP)**
- **Role:** Task manager and progress tracker
- **Responsibility:** Break work into tasks, track completion, verify quality
- **Mechanisms:** Workflow creation, task verification, deployment readiness
- **Feedback Loop:** Tasks completed → Validated → Progress measured → Complexity learned
- **Integration:** Receives handoffs from project-management, logs to workspace-brain

**5. Memory & Learning (workspace-brain MCP)**
- **Role:** Institutional memory and analytics engine
- **Responsibility:** Remember solutions, detect patterns, suggest automation
- **Mechanisms:** Event logging, pattern detection, automation opportunity analysis
- **Feedback Loop:** Events logged → Patterns detected → Insights generated → Future decisions improved
- **Integration:** Storage backend for all MCPs, cross-session persistence

## The Primary Feedback Loop: Continuous Improvement

```
┌──────────────────────────────────────────────────────────────┐
│                    Work Begins                                │
└──────────────────┬───────────────────────────────────────────┘
                   │
    ┌──────────────▼────────────────┐
    │  1. ORGANIZE (Smart File)     │  ← Where should this go?
    │  - Analyze component           │  ← What lifecycle stage?
    │  - Suggest location            │  ← What patterns apply?
    └──────────────┬────────────────┘
                   │
    ┌──────────────▼────────────────┐
    │  2. CLASSIFY (Auto Framework) │  ← What type of issue?
    │  - Evaluate confidence         │  ← Can we automate?
    │  - Determine autonomy level    │  ← What's the risk?
    └──────────────┬────────────────┘
                   │
    ┌──────────────▼────────────────┐
    │  3. PLAN (project-management) │  ← Break into goals
    │  - Create potential goals      │  ← Evaluate impact/effort
    │  - Prioritize work             │  ← Coordinate handoffs
    └──────────────┬────────────────┘
                   │
    ┌──────────────▼────────────────┐
    │  4. EXECUTE (task-executor)   │  ← Break into tasks
    │  - Complete with validation    │  ← Continuous quality checks
    │  - Track progress              │  ← Verify completion
    └──────────────┬────────────────┘
                   │
    ┌──────────────▼────────────────┐
    │  5. DEPLOY (Auto Framework)   │  ← Ready for production?
    │  - Check deployment readiness  │  ← Run full validation
    │  - Deploy to staging/prod      │  ← Monitor stability
    └──────────────┬────────────────┘
                   │
    ┌──────────────▼────────────────┐
    │  6. LEARN (workspace-brain)   │  ← What happened?
    │  - Log outcome                 │  ← What patterns emerged?
    │  - Detect automation opps      │  ← How can we improve?
    └──────────────┬────────────────┘
                   │
                   │  Feeds back to:
                   ├──────────→ Smart File Organizer (better placement)
                   ├──────────→ Auto Framework (higher confidence)
                   ├──────────→ project-management (better estimates)
                   ├──────────→ task-executor (better complexity scoring)
                   └──────────→ ALL FUTURE WORK (continuous improvement)
```

## Workflow Playbook: Operational Procedures

**Role:** Institutional knowledge base for "how we do things"
**Location:** `/WORKFLOW_PLAYBOOK.md`

The Workflow Playbook complements the strategic functions above by documenting **established operational patterns** for recurring tasks:

**What it contains:**
- Available credentials and access (service account, automation account)
- Established workflow patterns (create Google Sheet, send email, etc.)
- Standard processes with code examples
- Shared Drive IDs and resource locations
- Common variations and edge cases

**How it grows:**
1. **First time:** We work through a task together → Figure out best approach
2. **Document:** Add the pattern to playbook with real code example
3. **Next time:** Reference playbook → Follow established pattern → Faster execution
4. **Evolve:** Discover better approach → Update playbook → Future work uses improvement

**Integration with feedback loop:**
- Smart File Organizer → Organizes workflow scripts
- Autonomous Framework → Classifies workflow improvements
- workspace-brain → Logs workflow execution patterns
- **Workflow Playbook → Documents proven patterns for reuse**

**Key difference:** Strategic functions handle "what to do" and "how to improve." Workflow Playbook handles "how we typically do this specific task."

**Example workflows:**
- Create a new Google Sheet (established 2025-01-13)
- Update existing Google Sheet (to be established)
- Send email with approval workflow (to be established)
- Deploy Apps Script to production sheet (to be established)

**See:** `/WORKFLOW_PLAYBOOK.md` for complete documentation

---

## Dual Environment Pattern: Staging → Production

**Why:** Separate experimentation from production stability

**How it works:**
- **development/** = Staging environment (break things safely)
- **local-instances/** = Production environment (stable, tested code)
- MCP configuration points to production ONLY
- Changes flow: develop in staging → validate → deploy to production

**Benefits:**
- Experiment without risk
- Git history in staging
- Production stays clean
- Clear deployment gate

**Team analogy:** Staging is the workshop, production is the showroom

## Integration Points: How Components Collaborate

### Handoff Pattern (project-management → spec-driven → task-executor)

```typescript
// project-management creates the plan
const handoff = await prepareSpecHandoff({ goalId: "001" });

// spec-driven receives the context automatically
const spec = await sddGuide({
  action: "start",
  projectPath,
  goalContext: handoff.goalContext  // Pre-populated!
});

// task-executor receives tasks automatically
const taskHandoff = await prepareTaskExecutorHandoff({ goalId: "001" });
const workflow = await createWorkflow({
  name: taskHandoff.workflowName,
  tasks: taskHandoff.tasks  // Extracted from spec!
});
```

**No manual data transfer needed** - MCPs pass context seamlessly.

### Validation at Multiple Levels

```
Task Completion (task-executor)
    ↓ runValidation=true
    ├─→ Build check (npm run build)
    ├─→ Test check (npm test)
    └─→ Evidence added to verification report

Workflow Archival (task-executor)
    ↓ checkDeploymentReadiness=true
    ├─→ Build check
    ├─→ Test check
    ├─→ Health check
    └─→ Deployment recommendation

Full Deployment (Autonomous Framework)
    ↓ deploy()
    ├─→ Stage 1: Unit tests
    ├─→ Stage 2: Integration tests
    ├─→ Stage 3: Security scan
    ├─→ Stage 4: Code quality
    ├─→ Stage 5: Functional validation
    └─→ Deploy with monitoring
```

**Validation layers provide safety nets at different granularities.**

### Learning Loops

**Issue Resolution Loop:**
1. Issue occurs (MCP error, test failure, etc.)
2. Autonomous Framework classifies → assigns confidence
3. project-management creates goal → tracks resolution
4. task-executor executes solution → validates quality
5. workspace-brain logs outcome → updates patterns
6. **Next time:** Higher confidence, potential auto-resolution

**File Organization Loop:**
1. Smart File Organizer analyzes file
2. Suggests location based on patterns
3. Human confirms or corrects
4. Records decision
5. **Next time:** Better suggestion for similar files

**Task Complexity Loop:**
1. task-executor estimates task complexity
2. Tracks actual time to complete
3. workspace-brain logs duration + complexity
4. **Next time:** More accurate complexity estimates

## Strategic Decision Framework

When building something new, ask these questions in order:

**1. Organization:** Where does this belong?
- Use Smart File Organizer for placement
- Follow lifecycle stages (development → projects-in-development → local-instances)
- Maintain dual environment pattern

**2. Classification:** What type of work is this?
- Use Autonomous Framework for issue classification
- Confidence score determines autonomy level
- Safety mechanisms prevent risky auto-deployment

**3. Planning:** How should we approach this?
- Use project-management for goal evaluation
- Autonomous classification informs prioritization
- Handoffs coordinate multi-MCP workflows

**4. Execution:** How do we break this down?
- Use task-executor for task management
- Continuous validation ensures quality
- Deployment readiness prevents broken production

**5. Learning:** What did we discover?
- Use workspace-brain to log outcomes
- Pattern detection improves future work
- Automation opportunities identified automatically

## Key Design Principles

**1. Optional by Default**
- All autonomous features require opt-in
- Existing workflows never break
- Graceful degradation when components unavailable

**2. Feedback-Driven**
- Every action logs to workspace-brain
- Patterns improve confidence scores
- Automation opportunities detected automatically

**3. Safety-First**
- Validation at multiple levels
- Automatic rollback on failure
- Human approval for high-risk changes

**4. Integrated but Independent**
- MCPs work together seamlessly
- Each MCP functional standalone
- No forced dependencies

**5. Learning-Enabled**
- All decisions recorded
- Patterns detected automatically
- Confidence improves over time

---

# Four-Part Workspace Management System

## Overview

The workspace operates across **four synchronized components**: Local computers, External brain (workspace-brain MCP), GitHub (version control), and Google Drive (cloud backup). This architecture enables cross-computer sync, persistent learning, team collaboration, and AI-accessible documentation.

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│              FOUR-PART WORKSPACE SYSTEM                      │
└─────────────────────────────────────────────────────────────┘

 LOCAL COMPUTERS                EXTERNAL BRAIN
 (Multiple Macs, VPS)           (workspace-brain MCP)
 ├── workspace-management/  ←→  ~/workspace-brain/
 ├── EVENT_LOG.md               ├── telemetry.json
 └── .ai-planning/              ├── analytics.json
                                └── learning.json
         │                               │
         ├───────────┬───────────────────┘
         │           │
         ▼           ▼
      GITHUB      GOOGLE DRIVE
      (Sync)      (Backup & AI Access)
      ├── Repos   └── AI Development - No PHI/
      │             └── workspace-management/
      └── Auto-pull
          (every 5 min)
```

### Service Account Authentication (Active)

**Google Drive automation** uses service account for server-to-server authentication:

- **Email**: ssd-automation-service-account@workspace-automation-ssdspc.iam.gserviceaccount.com
- **Status**: ✅ Active and in use for all Google Drive automation
- **Access**: Manager permissions on all 9 Shared Drives
- **Benefits**: No browser interaction, works on servers/VPS, consistent authentication
- **Used by**: `upload-workspace-management.js`, backup automation (future)
- **Location**: `/Users/mmaruthurnew/Desktop/medical-patient-data/google-workspace-oauth-setup/service-account.json`

**OAuth 2.0 authentication** (Secondary - Apps Script only):
- Used for Google Apps Script automation (service accounts not supported by Apps Script)
- User: automation@ssdspc.com
- Future use: Event logging automation (pending Claude Code BAA)

**For complete Google Drive setup:** See `workspace-management/GOOGLE-DRIVE-API-SETUP.md`

---

# Three-Workspace Architecture

## Overview

The workspace is organized into **three specialized workspaces** to support HIPAA compliance, efficient collaboration, and AI platform flexibility.

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                   THREE-WORKSPACE SYSTEM                         │
└─────────────────────────────────────────────────────────────────┘

┌───────────────────────┐  ┌──────────────────────┐  ┌────────────────────────┐
│  WORKSPACE 1          │  │  WORKSPACE 2         │  │  WORKSPACE 3           │
│  medical-practice-    │  │  mcp-infrastructure  │  │  medical-patient-data  │
│  workspace            │  │                      │  │                        │
├───────────────────────┤  ├──────────────────────┤  ├────────────────────────┤
│ AI: Claude Code       │  │ AI: Shared           │  │ AI: Gemini (future)    │
│ PHI: ❌ Prohibited    │  │ PHI: ❌ Prohibited   │  │ PHI: ✅ Allowed        │
│ Sync: GitHub          │  │ Sync: GitHub         │  │ Sync: GitHub + Drive   │
├───────────────────────┤  ├──────────────────────┤  ├────────────────────────┤
│ Contents:             │  │ Contents:            │  │ Contents:              │
│ • Planning/roadmaps   │  │ • 26 MCP servers     │  │ • Gemini client        │
│ • Documentation       │  │ • Shared logic       │  │ • Patient workflows    │
│ • Templates           │  │ • Algorithms         │  │ • Clinical automation  │
│ • Dev workflows       │  │ • Platform-agnostic  │  │ • Apps Script + PHI    │
│ • Project management  │  │   code               │  │ • Audit logs           │
└───────────────────────┘  └──────────────────────┘  └────────────────────────┘
         │                          │                           │
         │                          │                           │
         └──────────────┬───────────┴───────────────┬──────────┘
                        │                           │
                ┌───────▼───────────────────────────▼──────┐
                │    MCP Tools Available to All            │
                │    (via ~/.claude.json config)           │
                │                                           │
                │  project-management, task-executor,       │
                │  workspace-brain, security-compliance,    │
                │  + 22 additional MCPs                     │
                └───────────────────────────────────────────┘
```

### Design Rationale

**1. HIPAA Data Boundary Enforcement**
- PHI restricted to `medical-patient-data` workspace only
- No PHI in development or infrastructure workspaces
- Clear audit trail for all PHI access
- Google Workspace BAA covers Gemini API

**2. AI Platform Flexibility**
- Claude Code operates on workspaces 1 & 2 (non-PHI)
- Gemini can operate on workspace 3 (PHI-allowed)
- Shared MCP infrastructure accessible to both
- Future: Additional AI platforms can integrate

**3. Team Collaboration**
- Separate GitHub repos = granular access control
- Infrastructure can be shared across team
- PHI workspace requires additional credentials
- Clear separation of concerns

**4. Code Reusability**
- MCPs are platform-agnostic (no Claude/Gemini specific code)
- Shared infrastructure reduces duplication
- Templates and patterns in development workspace
- Easy migration to new platforms

---

## Workspace 1: Development & Planning

**Name:** operations-workspace
**Location:** ~/Desktop/operations-workspace
**GitHub:** github.com/mmaruthurssd/operations-workspace
**AI Client:** Claude Code
**PHI Allowed:** ❌ No

### Purpose

Central hub for development, planning, documentation, and project management. NO patient data.

### Contents

```
operations-workspace/
├── planning-and-roadmap/        # Strategic planning
├── brainstorming/               # Ideas and exploration
├── templates-and-patterns/      # Reusable patterns
│   ├── mcp-server-templates/    # 24 drop-in MCP templates
│   └── simple-templates/        # Documentation templates
├── development/                 # MCP staging (deprecated - moved to workspace 2)
├── projects-in-development/     # Active projects
├── live-practice-management-system/ # Production system docs
├── archive/                     # Completed work
└── configuration/               # Workspace configs
```

### Key Features

- **Template-First Development** - All MCPs start as templates
- **MCP Orchestration** - Coordinates 26 MCP servers
- **Project Management** - Goals, roadmaps, task tracking
- **Documentation Hub** - WORKSPACE_GUIDE, WORKSPACE_ARCHITECTURE
- **Git-Based Collaboration** - GitHub sync for team access

### MCP Access

All 26 MCPs available via `~/.claude.json`:
- project-management, task-executor, workspace-brain
- security-compliance-mcp (credential/PHI scanning)
- 22 additional specialized MCPs

---

## Workspace 2: MCP Infrastructure

**Name:** mcp-infrastructure
**Location:** ~/Desktop/mcp-infrastructure
**GitHub:** github.com/mmaruthurssd/mcp-infrastructure
**AI Client:** Shared (Claude Code + Gemini)
**PHI Allowed:** ❌ No

### Purpose

Centralized location for all 26 production MCP servers. Platform-agnostic code shared across AI clients.

### Contents

```
mcp-infrastructure/
├── local-instances/
│   └── mcp-servers/             # 26 production MCPs
│       ├── git-assistant-mcp-server/
│       ├── task-executor-mcp-server/
│       ├── project-management-mcp-server/
│       ├── workspace-brain-mcp-server/
│       └── ... (22 more)
└── development/
    └── mcp-servers/             # MCP development staging
```

### Statistics

- **Files:** 276,616 files
- **Lines of Code:** 52.7M lines
- **MCP Count:** 26 servers
- **Build Artifacts:** All MCPs pre-built (dist/ or build/)

### Key Features

- **Platform-Agnostic** - No Claude or Gemini specific code
- **Shared Infrastructure** - Both workspaces 1 & 3 access same MCPs
- **Version Control** - Git tracking for all MCP changes
- **Drop-In Templates** - Each MCP has corresponding template in workspace 1

### Client Configuration

**Claude Code:** `~/.claude.json` points to MCP paths
**Gemini (future):** `medical-patient-data/.gemini-mcp.json`

---

## Workspace 3: Patient Data & Gemini

**Name:** medical-patient-data
**Location:** ~/Desktop/medical-patient-data
**GitHub:** github.com/mmaruthurssd/medical-patient-data
**AI Client:** Gemini (future integration)
**PHI Allowed:** ✅ Yes (Google BAA)

### Purpose

Gemini AI integration for patient data workflows. HIPAA-compliant operations with Google Workspace BAA coverage.

### Contents

```
medical-patient-data/
├── 01-planning-and-roadmap/     # Project planning
├── 02-goals-and-roadmap/        # Active goals
├── 03-resources-docs-assets-tools/
│   ├── HIPAA-COMPLIANCE-GUIDE.md
│   └── QUICK-START.md
├── 04-product-under-development/ # Gemini integrations
├── 05-testing-and-validation/   # PHI-safe testing
├── 06-deployment-and-release/   # Deployment pipelines
├── 07-operations-and-maintenance/ # Operational workflows
├── 08-archive/                  # Archived data
└── configuration/               # Gemini/Drive config
```

### Key Features

- **HIPAA Compliance** - Full PHI handling documentation
- **Gemini API Integration** - Google Generative AI (Gemini Pro/Pro Vision)
- **Pre-Commit Security** - PHI scanning before every commit
- **Audit Logging** - All PHI access logged
- **Google Drive Sync** (optional) - Patient files from Drive
- **Apps Script** - HIPAA-compliant Google Sheets automation

### Security Controls

```typescript
// All PHI access requires authentication
if (!isAuthenticated(user)) {
  throw new UnauthorizedError('Authentication required for PHI access');
}

// Audit logging for every PHI operation
await auditLog({
  userId,
  action: 'READ',
  resource: `patient/${patientId}/record`,
  status: 'success'
});
```

### MCP Access

Same 26 MCPs available (via shared infrastructure):
- `security-compliance-mcp` for PHI scanning
- `workspace-brain` for audit logging
- `project-management` for workflow coordination
- All other MCPs for development support

---

## Data Boundaries (HIPAA Critical)

### PHI Flow Restrictions

```
┌─────────────────────────────────────────────────────────────┐
│                   PHI DATA FLOW RULES                        │
└─────────────────────────────────────────────────────────────┘

 Workspace 1              Workspace 2              Workspace 3
 (Development)            (Infrastructure)         (Patient Data)

 PHI: ❌ Prohibited      PHI: ❌ Prohibited       PHI: ✅ Allowed

      │                       │                        │
      │ NO PHI TRANSFER       │ NO PHI TRANSFER        │ PHI OK
      ├──────────────────────→├───────────────────────→│
      │ Code, logic, algos    │ MCP tools/logic        │ Patient data
      │ Templates, docs       │ Platform-agnostic      │ Clinical workflows
      └───────────────────────┴────────────────────────┘
                                                        ▲
                                                        │
                                                    AUDIT LOG
                                                    (All PHI access)
```

### Enforcement Mechanisms

**1. Pre-Commit Hooks (security-compliance-mcp)**
```bash
# Blocks commits in workspaces 1 & 2 if PHI detected
git commit -m "Add feature"
# → Scans for 18 HIPAA identifiers
# → Blocks if found
# → Only workspace 3 allows PHI
```

**2. .gitignore Protection**
```bash
# Workspace 1 & 2: Aggressive PHI blocking
*.phi
patient-data/
medical-records/

# Workspace 3: Selective (code ok, data blocked)
# Only real patient files blocked
```

**3. MCP Tool Awareness**
```typescript
// security-compliance-mcp knows which workspace allows PHI
const workspace = detectWorkspace();
if (workspace !== 'medical-patient-data' && containsPHI(content)) {
  throw new Error('PHI not allowed in this workspace');
}
```

---

## Data Protection Architecture

### 6-Layer Backup System (medical-patient-data)

**Purpose:** Defense-in-depth backup strategy protecting critical Apps Script code, clinical workflows, and system infrastructure.

**Status:** ✅ Production (All 6 layers active since 2025-11-13)
**Coverage:** 588 production Google Sheets Apps Script projects + workspace infrastructure
**RPO:** 24 hours (GCS immutable backup)
**RTO:** 10-30 minutes (catastrophic recovery)
**Monthly Cost:** $2

#### Architecture

| Layer | Technology | RPO | RTO | Status | Purpose |
|-------|-----------|-----|-----|--------|---------|
| **1** | Google Drive | Real-time | Immediate | ✅ Active | Source of truth (Apps Script bound to Sheets) |
| **2** | Local Git | Per commit | Instant | ✅ Active | Version control with enhanced hooks |
| **3** | GitHub | Per push | Minutes | ✅ Active | Remote backup + branch protection |
| **4** | Branch Protection | N/A | N/A | ✅ Active | Prevents force push/delete (immutable commits) |
| **5** | GCS Immutable | 24 hours | 10-30 min | ✅ Active | Off-site versioned backup (30-day retention) |
| **6** | Time Machine | Hourly | Hours | ✅ Active | Local machine backup |

**Implementation Location:** `Implementation Projects/google-sheets-version-control/`

**Complete Documentation:** `workspace-management/BACKUP-AND-DR-STRATEGY.md`

**GitHub Actions:** `.github/workflows/backup-to-gcs.yml` (automated daily backups at 9 AM & 5 PM CST)

#### Key Protection Features

**Enhanced Git Hooks:**
- Pre-commit: Blocks deletion of >10 sheets, verifies sheet count
- Pre-push: Final verification before GitHub
- Prevents unintentional .gitignore changes

**GitHub Security:**
- Branch protection rules prevent force push
- Service account: `github-backup-uploader@ssd-sheets-backup-2025.iam.gserviceaccount.com`
- Secret: `GCS_SERVICE_ACCOUNT_KEY` (GitHub Actions authentication)

**GCS Immutable Storage:**
- Bucket: `gs://ssd-sheets-backup-immutable/daily-backups/`
- 30-day retention lock (cannot be deleted)
- Automatic versioning (restore any historical version)
- SHA256 checksum verification

#### Recovery Procedures

Six documented recovery scenarios with step-by-step commands:

1. **Single workspace lost** → Clone from GitHub (30 min RTO)
2. **All local workspaces lost** → Multi-repo clone + rebuild (2-4 hours RTO)
3. **GitHub compromised** → Restore from GCS backup (1-4 hours RTO)
4. **Google Drive failure** → Restore from Time Machine (1-2 hours RTO)
5. **Complete catastrophic failure** → GCS immutable backup (8-24 hours RTO)
6. **Accidental mass deletion** → Git reset + pre-commit hook prevention

**See:** `workspace-management/BACKUP-AND-DR-STRATEGY.md` for complete procedures

#### Integration with MCP Architecture

**backup-dr-mcp** provides automated orchestration:
- `create_backup()` - On-demand backups with compression
- `restore_backup()` - Conflict detection, dry-run preview
- `verify_backup()` - Checksum validation
- `schedule_backup()` - Cron-based automation
- `cleanup_old_backups()` - Retention policy enforcement

**Monitoring:**
- Daily health checks: `Implementation Projects/google-sheets-version-control/scripts/daily-health-check.sh`
- GitHub Actions notifications on backup failures
- backup-dr-mcp provides `get_backup_status()` with statistics

#### Cost Analysis

| Component | Monthly | Annual |
|-----------|---------|--------|
| GitHub (free tier) | $0 | $0 |
| GCS backup | $2 | $24 |
| Google Drive (existing) | $0 | $0 |
| Time Machine (one-time ~$150) | N/A | Amortized |
| **Total** | **$2** | **$24** |

**ROI:** Prevents catastrophic data loss for 588 production sheets serving medical practice operations.

---

## Migration from Single Workspace

### Before (Single Workspace)

```
operations-workspace/
├── local-instances/mcp-servers/    # 26 MCPs (276K files)
├── projects-in-development/        # Mixed PHI/non-PHI
├── planning-and-roadmap/
└── templates-and-patterns/
```

**Problems:**
- PHI risk in development workspace
- Claude Code can't access PHI (no Anthropic BAA)
- Difficult to share infrastructure
- 276K files slow git operations

### After (Three Workspaces)

```
1. operations-workspace/      # Development (no PHI)
2. mcp-infrastructure/              # Shared MCPs (no PHI)
3. medical-patient-data/            # Gemini + PHI (Google BAA)
```

**Benefits:**
- ✅ Clear PHI boundaries
- ✅ Gemini can access PHI (workspace 3 only)
- ✅ Shared MCP infrastructure
- ✅ Faster git operations (smaller repos)
- ✅ Granular access control
- ✅ Platform flexibility

### Migration Stats

- **Duration:** ~30 minutes
- **Files Moved:** 276,616 files
- **MCPs Relocated:** 26 servers
- **GitHub Repos Created:** 2 (mcp-infrastructure, medical-patient-data)
- **Config Updates:** ~/.claude.json updated with new paths
- **MCPs Verified:** All 24 MCPs loaded successfully

---

## Team Collaboration Model

### Workspace Access Levels

**Level 1: Development Access**
- Workspace: operations-workspace
- GitHub: Public (code only, no secrets)
- Who: All team members
- Tools: Claude Code, full MCP access
- PHI: ❌ Prohibited

**Level 2: Infrastructure Access**
- Workspace: mcp-infrastructure
- GitHub: Public (platform-agnostic code)
- Who: All team members
- Tools: Read-only for most, write for MCP developers
- PHI: ❌ Prohibited

**Level 3: Patient Data Access**
- Workspace: medical-patient-data
- GitHub: Public (code), Private (data via Google Drive)
- Who: HIPAA-trained staff only
- Tools: Gemini API, Apps Script
- PHI: ✅ Allowed (with audit logging)

### Onboarding New Team Members

**Step 1: Clone Development Workspace**
```bash
git clone https://github.com/mmaruthurssd/operations-workspace
cd operations-workspace
```

**Step 2: Install MCP Infrastructure**
```bash
git clone https://github.com/mmaruthurssd/mcp-infrastructure ~/Desktop/mcp-infrastructure
```

**Step 3: Configure Claude Code**
- MCPs auto-detected from `~/.claude.json`
- Or use mcp-config-manager to register

**Step 4: Patient Data (if authorized)**
```bash
# Only for HIPAA-trained staff
git clone https://github.com/mmaruthurssd/medical-patient-data ~/Desktop/medical-patient-data
# Set up Google Workspace credentials
# Complete HIPAA training checklist
```

---

## Future Enhancements

### Phase 1: Complete (2025-11-08)
- ✅ Three-workspace structure created
- ✅ MCP infrastructure separated
- ✅ GitHub repositories created
- ✅ HIPAA compliance documentation
- ✅ Pre-commit security scanning

### Phase 2: Gemini Integration (Complete - 2025-11-09)
- ✅ Build Gemini MCP client (Node.js with MCP Bridge Server)
- ✅ HTTP wrapper exposing all 26 MCP servers as Gemini functions
- ✅ Interactive CLI with PHI detection and de-identification
- ✅ HIPAA-compliant audit logging for all operations
- ✅ 156+ MCP tools available to Gemini via function calling
- ✅ Test suite with 100% success rate

**Implementation:** See `Implementation Projects/gemini-mcp-integration/`
**Cost:** $0/month (within free tiers for both Gemini and Cloud Functions)

### Phase 3: Google Drive Sync
- [ ] Configure Google Drive API
- [ ] Implement bidirectional sync
- [ ] Add conflict resolution
- [ ] Test PHI data flow

### Phase 4: Advanced Features
- [ ] Multi-modal processing (Gemini Pro Vision)
- [ ] Real-time collaboration tools
- [ ] Advanced analytics dashboard
- [ ] Mobile application support

---

# Automated Claude Code Prompting System

## Overview

**Purpose:** Enable Google Sheets to automatically trigger Claude Code execution via background automation server

**Status:** 🟢 Production - Fully operational since 2025-11-13

**Key Innovation:** Uses `claude --print` CLI for non-interactive automation without manual prompting

**Workflow Model:** AI-First - User never manually edits infrastructure

---

## AI-First Workflow

### Core Principle

**User NEVER manually interacts with the Google Sheet or infrastructure.**

Instead, the workflow is entirely AI-mediated:

```
USER (natural language)
   "Add a daily prompt that generates biopsy summaries at 9 AM"
        ↓
CLAUDE (programmatic)
   Executes: node add-scheduled-prompt.js --name "..." --prompt "..." --schedule "Daily" --time "09:00"
        ↓
GOOGLE SHEET (automated)
   Row added to "Claude Automation Control" with schedule configuration
        ↓
APPS SCRIPT (time-triggered)
   Checks every 5 min, writes prompt JSON to Drive when time matches
        ↓
AUTOMATION SERVER (background)
   Detects prompt, executes via claude --print, writes response
        ↓
USER (read-only view)
   Opens Google Sheet to see execution log and responses
```

### User Interaction Model

**What user does:**
- Speaks naturally to Claude: "Add a weekly billing report every Monday"
- Views results in Google Sheet (read-only)

**What user NEVER does:**
- ❌ Manually add rows to Google Sheet
- ❌ Edit scheduled prompts directly
- ❌ Configure Apps Script
- ❌ Manage Drive folders
- ❌ Interact with automation server

**What Claude does:**
- Parses natural language request
- Validates (no PHI, valid schedule)
- Executes `add-scheduled-prompt.js` programmatically
- Logs action to `automation/automation-actions.log`
- Confirms successful addition

### Example Requests

| User Says | Claude Does | Result |
|-----------|-------------|--------|
| "Add daily biopsy summary at 9 AM" | `node add-scheduled-prompt.js --name "Daily Biopsy Summary" --schedule "Daily" --time "09:00"` | Prompt added, runs daily at 9 AM |
| "Schedule weekly billing report Monday 8 AM" | `node add-scheduled-prompt.js --name "Weekly Billing" --schedule "Weekly" --days "Mon" --time "08:00"` | Prompt added, runs every Monday |
| "Pause the daily summary" | `node update-scheduled-prompt.js --name "Daily Biopsy Summary" --status "Paused"` | Prompt paused (no longer executes) |

**Reference:** `/automation/AI-FIRST-WORKFLOW.md` for complete user guide

---

## Architecture

```
Google Sheets (Apps Script triggers)
    ↓
Writes prompt.json files to Google Drive
    ↓
Google Drive Desktop syncs to local
    ↓
automation/prompt-queue/pending/
    ↓
Background automation server (checks every 30s)
    ↓
Auto-executes: claude --print "[prompt]"
    ↓
Writes responses to automation/prompt-queue/responses/
    ↓
Google Drive syncs back
    ↓
Apps Script reads responses and updates Google Sheets
```

## Core Components

### 1. Automation Server (`claude-automation-server.sh`)

**Background daemon** that provides fully autonomous Claude Code execution:

- **Continuous monitoring:** Checks prompt queue every 30 seconds
- **Automatic execution:** Detects new prompts and executes immediately
- **Priority handling:** urgent → high → normal → low
- **Response management:** Writes structured JSON responses
- **Error handling:** Graceful failures with detailed error responses
- **Logging:** Complete audit trail of all executions

**Commands:**
```bash
./claude-automation-server.sh start   # Start background daemon
./claude-automation-server.sh stop    # Stop daemon
./claude-automation-server.sh status  # Check status and queue stats
./claude-automation-server.sh test    # Send test prompt
./claude-automation-server.sh restart # Restart daemon
```

**Location:** `automation/claude-automation-server.sh`

### 2. Prompt Queue Directory Structure

```
automation/prompt-queue/
├── pending/          # New prompts from Google Sheets (auto-processed)
├── processing/       # Currently being executed by automation server
├── completed/        # Finished prompts (archived after 30 days)
├── responses/        # Response files for Google Sheets to read
├── archive/          # Old prompts (30+ days)
└── automation-server.log  # Execution logs
```

### 3. Google Sheets Integration (Apps Script)

**Apps Script Template:** `automation/prompt-queue/apps-script-template.gs`

**Core Functions:**
```javascript
// Send prompt to Claude automation server
sendPromptToClaude(promptText, {
  type: 'analysis',
  priority: 'normal',
  context: { dataSource: 'sheet-name' }
});

// Read responses from automation server
const responses = checkClaudeResponses();
```

**Scheduled Triggers:**
- Daily biopsy summaries (9:00 AM)
- Weekly patient volume analysis (Monday 8:00 AM)
- Billing error checks (10:00 AM daily)
- Event-driven alerts (onEdit triggers)

**Google Drive Location:** `AI Development - No PHI` Shared Drive
- Folder: `Claude Automation/prompts/` (syncs to local `pending/`)
- Folder: `Claude Automation/responses/` (syncs from local `responses/`)

## Prompt File Format

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "created": "2025-11-13T14:30:00.000Z",
  "priority": "normal",
  "type": "analysis",
  "prompt": "Generate summary of yesterday's biopsy cases",
  "context": {
    "workspace": "medical-patient-data",
    "dataSource": "sheet-id-here",
    "outputFormat": "markdown"
  },
  "status": "pending"
}
```

## Response File Format

```json
{
  "promptId": "550e8400-e29b-41d4-a716-446655440000",
  "executed": "2025-11-13T14:35:22.000Z",
  "status": "completed",
  "result": {
    "response": "Yesterday's biopsy summary...",
    "summary": "Executed successfully"
  },
  "duration": "10 seconds",
  "exitCode": 0
}
```

## Execution Flow

1. **Google Sheets Trigger Fires**
   - Time-based (daily, weekly, hourly)
   - Event-based (onEdit, onFormSubmit)
   - Manual (run from sheet menu)

2. **Apps Script Writes Prompt**
   - Creates prompt JSON file
   - Uploads to Google Drive `Claude Automation/prompts/`
   - Includes PHI detection safeguard

3. **Google Drive Syncs to Local**
   - Google Drive Desktop app syncs file
   - Appears in `automation/prompt-queue/pending/`
   - Typically < 5 seconds sync time

4. **Automation Server Detects Prompt**
   - Checks `pending/` every 30 seconds
   - Finds new `prompt-*.json` file
   - Moves to `processing/`

5. **Automatic Execution**
   - Executes: `claude --print "[prompt text]"`
   - Has access to all 26 MCP servers
   - Can read/write workspace files
   - Returns response in 2-10 seconds typically

6. **Response Creation**
   - Creates `response-[id].json` file
   - Writes to `responses/` directory
   - Moves original prompt to `completed/`

7. **Response Sync Back**
   - Google Drive syncs response to cloud
   - Apps Script reads response file
   - Updates Google Sheet with results
   - Can trigger follow-up actions

## Use Cases

### Clinical Operations
- **Daily biopsy summaries** - Automated at 9:00 AM daily
- **Patient volume forecasting** - Weekly analysis and staffing recommendations
- **Protocol compliance checks** - Automated review of clinical procedures

### Billing & Finance
- **Error pattern detection** - Daily analysis of billing errors
- **A/R aging reports** - Automated accounts receivable summaries
- **Insurance denial analysis** - Pattern recognition and prevention suggestions

### Administrative
- **Meeting prep** - Automated summaries from previous meetings
- **Schedule optimization** - Conflict detection and coverage suggestions
- **Compliance reporting** - Weekly checklist status generation

### Development & IT
- **Code review** - Automated analysis of Apps Script changes
- **Error log analysis** - Pattern detection in Google Sheets execution logs
- **Performance monitoring** - Script execution time analysis

## Integration with MCP System

### MCP Access During Automation

Automated prompts have full access to all MCPs:
- ✅ task-executor - Create workflows from automation
- ✅ workspace-brain - Log automation metrics
- ✅ project-management - Create goals from automation
- ✅ security-compliance - PHI scanning
- ✅ All other 22+ MCPs available

### Automation Logging to workspace-brain

```javascript
// Automation server automatically logs to workspace-brain
await mcp__workspace_brain__log_event({
  event_type: 'automated-prompt',
  event_data: {
    prompt_id: 'abc-123',
    type: 'daily-summary',
    duration_seconds: 10,
    outcome: 'completed',
    triggered_by: 'google-sheets'
  }
});
```

## Security & Compliance

### PHI Protection

**Apps Script Layer:**
- PHI detection before writing prompts
- Blocks prompts containing: SSN, MRN, DOB patterns
- De-identification utilities available

**Automation Server Layer:**
- Executes locally (HIPAA compliant)
- No data sent to external services (except Anthropic Claude)
- Full audit trail in logs

**Google Drive Layer:**
- Prompts stored in `AI Development - No PHI` Shared Drive
- No PHI allowed in automation queue
- Separate from patient data systems

### Access Control

- Automation server runs with user permissions
- Google Drive folders: Restricted to authorized users
- Apps Script: Admin-only editing
- Audit logs: All executions tracked

## Performance Metrics

### Response Times
- **Detection latency:** < 30 seconds (check interval)
- **Execution time:** 2-10 seconds typical (depends on prompt complexity)
- **Total latency:** Prompt to response in < 1 minute typically

### Throughput
- **Concurrent execution:** Sequential (one prompt at a time)
- **Queue capacity:** Unlimited
- **Daily volume:** Tested up to 100+ prompts/day
- **Cost:** ~$0.003 per prompt (Claude Sonnet 4.5)

### Reliability
- **Uptime:** 24/7 when server running
- **Error recovery:** Automatic retry logic (not yet implemented)
- **Monitoring:** Real-time logs + status checking

## Monitoring & Maintenance

### Real-Time Monitoring
```bash
# View logs
tail -f automation/prompt-queue/automation-server.log

# Check status
./claude-automation-server.sh status
```

### Queue Statistics
```bash
# Pending prompts
ls -1 automation/prompt-queue/pending/*.json | wc -l

# Completed today
find automation/prompt-queue/completed/ -name "*.json" -mtime -1 | wc -l

# Error rate
grep "ERROR" automation/prompt-queue/automation-server.log | wc -l
```

### Auto-Archival
Prompts older than 30 days automatically archived:
```bash
# Manual archive (run monthly)
find automation/prompt-queue/completed/ -type f -mtime +30 -exec mv {} automation/prompt-queue/archive/ \;
```

## Benefits

✅ **Fully Autonomous** - No manual intervention required
✅ **24/7 Operation** - Background daemon runs continuously
✅ **Fast Execution** - Sub-minute response times
✅ **MCP Integration** - Full access to all 26 MCP servers
✅ **Local Execution** - HIPAA compliant, no external services
✅ **Event-Driven** - Time-based AND event-based triggers
✅ **Scalable** - Unlimited prompt queue capacity
✅ **Cost-Effective** - ~$0.003 per prompt
✅ **Auditable** - Complete execution logs
✅ **Flexible** - Supports any Claude-compatible prompt

## Documentation

- **Setup Guide:** `automation/prompt-queue/SETUP-GUIDE.md`
- **Apps Script Template:** `automation/prompt-queue/apps-script-template.gs`
- **Automation Guide:** `automation/AUTOMATED-CLAUDE-SETUP.md`
- **Quick Reference:** `automation/prompt-queue/QUICK-REFERENCE.md`

## Future Enhancements

**Phase 2 (Planned):**
- Retry logic for failed prompts
- Priority queue with configurable concurrency
- Response caching for duplicate prompts
- Multi-model support (Opus for complex, Haiku for simple)
- Webhook notifications on completion
- Advanced error recovery strategies

---

# AI-to-AI Communication Architecture

## Overview

**Purpose:** Enable direct communication between AI assistants running on different computers for troubleshooting, collaboration, and knowledge sharing without human intermediaries.

**Status:** 🟢 Active - Operational since 2025-11-12

**Communication Method:** Git-based messaging via team/activity.log with daemon auto-sync

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                  AI-to-AI COMMUNICATION FLOW                     │
└─────────────────────────────────────────────────────────────────┘

Computer A (Main Computer)           Computer B (Alvaro's Mac)
┌─────────────────┐                   ┌─────────────────┐
│ Claude Code     │                   │ Claude Code     │
│ (AI Instance 1) │                   │ (AI Instance 2) │
└────────┬────────┘                   └────────┬────────┘
         │                                     │
         │ mcp__workspace-sync__post_team_message
         ↓                                     │
┌─────────────────┐                           │
│ operations-     │                           │
│ workspace/      │                           │
│ team/           │                           │
│ activity.log    │                           │
└────────┬────────┘                           │
         │                                     │
         │ git commit & push                   │
         ↓                                     │
┌─────────────────────────────────────────────┤
│            GitHub Repository                 │
│  mmaruthurssd/operations-workspace          │
└─────────────────┬───────────────────────────┘
                  │
                  │ daemon pulls every 5 min
                  ↓
         ┌─────────────────┐
         │ operations-     │
         │ workspace/      │
         │ team/           │
         │ activity.log    │
         └────────┬────────┘
                  │
                  │ mcp__workspace-sync__get_team_activity
                  ↓
         ┌─────────────────┐
         │ Claude Code     │
         │ (AI Instance 2) │
         └─────────────────┘
```

## Core Components

### 1. Team Activity Log

**Location:** `operations-workspace/team/activity.log`

**Format:**
```
YYYY-MM-DD HH:MM:SS | Author | Message
```

**Example:**
```
2025-11-12 17:25:02 | Claude (Alvaro's Mac) | 👋 AI on Alvaro's machine initialized!
Status Report:
✅ Node version: v24.10.0
❌ Daemon scripts not yet present

2025-11-12 17:34:00 | Claude (Main Computer) | 🎉 GREAT PROGRESS! Daemon is running!
🚨 CRITICAL: Clone mcp-infrastructure Workspace
```

### 2. workspace-sync Daemon

**Script:** `scripts/sync/daemon-control.sh`
**Config:** `team/.sync-daemon/config.yml`

**Features:**
- Auto-pulls from GitHub every 5 minutes
- Syncs team activity across all computers
- Creates backups before pulling
- Requires clean working tree for safety
- Timezone-aware (CST, UTC-6)

**Control Commands:**
```bash
./scripts/sync/daemon-control.sh start   # Start daemon
./scripts/sync/daemon-control.sh stop    # Stop daemon
./scripts/sync/daemon-control.sh status  # Check status
./scripts/sync/daemon-control.sh restart # Restart daemon
```

### 3. Conversation Logging System

**Location:** `operations-workspace/team/ai-conversations/`

**Structure:**
```
team/ai-conversations/
├── 2025-11-12-alvaro-workspace-setup.md
├── 2025-11-13-mcp-troubleshooting.md
└── [YYYY-MM-DD-topic].md
```

**Log Format:**
```markdown
---
type: ai-conversation-log
session_id: 2025-11-12-alvaro-workspace-setup
topic: Alvaro Workspace Setup & MCP Infrastructure Synchronization
participants:
  - Claude (Main Computer - Mario's Mac)
  - Claude (Alvaro's Mac)
start_time: 2025-11-12 11:24:36 CST
status: in-progress
tags: [workspace-setup, mcp-infrastructure, ai-to-ai-communication]
---

# AI-to-AI Conversation Log
## Session: [Topic]

## Conversation Timeline

### HH:MM:SS CST | Claude (Computer Name)
**Message Type:** [Type]
[Message content]
[Context and notes]

## Current Status
[Status summary]

## Next Expected Actions
[Expected actions]
```

## Message Standards

### Message Format

**Standard Message:**
```
Post to team: "[Message content]"
```

**Status Update:**
```
Update status to "working" on task "mcp-setup"
Update status to "blocked" on task "build-errors"
Update status to "offline"
```

**Help Request Format:**
```
Post to team: "🚨 HELP: [Brief problem]
- Component: [what's failing]
- Error: [error message]
- Tried: [what you've attempted]
- Location: [which workspace]"
```

### Message Types

| Type | Emoji | Purpose | Example |
|------|-------|---------|---------|
| Status Report | ✅ | System diagnostics | "✅ Daemon: RUNNING (PID: 78488)" |
| Help Request | 🚨 | Request assistance | "🚨 HELP: MCP setup issues" |
| Troubleshooting | 🔍 | Issue analysis | "🔍 ISSUE #1: Missing daemon scripts" |
| Success | 🎉 | Milestone completion | "🎉 GREAT PROGRESS! Daemon is running!" |
| Critical Info | ⚠️ | Important warnings | "⚠️ Node v24 compatibility concern" |
| Update | 📋 | Status updates | "📋 RECEIVED your messages!" |

## Multi-Level Storage

### Level 1: GitHub (Primary Communication)

**Purpose:** Cross-computer synchronization
**Location:** `github.com/mmaruthurssd/operations-workspace`
**Retention:** Forever (git history)
**Access:** All team members with repo access

**Workflow:**
```bash
# AI posts message
mcp__workspace-sync__post_team_message(message: "...")
# → Appends to team/activity.log
# → git commit -m "AI activity: [message]"
# → git push origin main

# Other AI receives message
# → Daemon auto-pulls every 5 minutes
# → Reads team/activity.log
mcp__workspace-sync__get_team_activity()
```

### Level 2: Structured Logs (Historical Context)

**Purpose:** Comprehensive session documentation
**Location:** `operations-workspace/team/ai-conversations/`
**Format:** Markdown with YAML frontmatter
**Retention:** Forever (git-tracked)
**Access:** All team members

**Contents:**
- Complete conversation timeline with CST timestamps
- Issues identified and resolved
- Current status and next steps
- Technical notes and metrics
- Session metadata (participants, duration, topic)

### Level 3: workspace-brain (Analytics)

**Purpose:** Pattern detection and learning
**Location:** `~/workspace-brain/telemetry/`
**Format:** JSON (structured events)
**Retention:** Forever (external brain storage)
**Access:** MCP tools only

**Logged Events:**
```typescript
await mcp__workspace_brain__log_event({
  event_type: 'ai-conversation',
  event_data: {
    session_id: '2025-11-12-alvaro-workspace-setup',
    topic: 'workspace-setup',
    participants: ['Claude (Main)', 'Claude (Alvaro)'],
    issues_resolved: 3,
    issues_pending: 4,
    duration_minutes: 90,
    outcome: 'in-progress'
  }
});
```

## Integration with Workspace System

### workspace-sync MCP Tools

**Primary Tools:**
```typescript
// Send message to team
mcp__workspace-sync__post_team_message({
  message: "Your message here"
});

// Check for new messages
mcp__workspace-sync__get_team_activity({
  limit: 10,
  since: "today"
});

// Update your status
mcp__workspace-sync__update_team_status({
  status: "working",
  task: "mcp-setup"
});

// View team status
mcp__workspace-sync__get_team_status();

// Daemon control
mcp__workspace-sync__daemon_control({
  action: "start" | "stop" | "restart" | "status"
});
```

### operations-workspace as Communication Hub

**Rationale:**
- Operations workspace is development-focused (no PHI)
- Central location accessible to all team members
- Git-tracked for audit trail
- Symlinked documentation visible from all workspaces

**Structure:**
```
operations-workspace/
├── team/
│   ├── activity.log                    # Real-time messages
│   ├── ai-conversations/               # Session logs
│   │   └── YYYY-MM-DD-topic.md
│   └── .sync-daemon/
│       ├── config.yml                  # Daemon configuration
│       ├── daemon.log                  # Daemon activity
│       └── notifications.log           # Sync notifications
└── scripts/sync/
    ├── daemon-control.sh               # Daemon manager
    ├── auto-sync-daemon.sh             # Daemon implementation
    └── [8 more sync scripts]
```

## Use Cases

### 1. Troubleshooting Remote Setup Issues

**Scenario:** Alvaro's computer has MCP build errors

**Workflow:**
1. Alvaro's AI posts diagnostic information to team/activity.log
2. Main computer's AI receives message within 5 minutes (or manual pull)
3. Main computer's AI analyzes issue and posts solution
4. Alvaro's AI receives solution and implements fix
5. Conversation logged to team/ai-conversations/

**Benefits:**
- No manual user relay of error messages
- Complete diagnostic context shared automatically
- Solutions documented for future reference

### 2. Cross-Computer Collaboration

**Scenario:** Multiple developers working on same codebase

**Workflow:**
1. AI on Computer A posts status: "Working on feature X"
2. AI on Computer B sees status and coordinates: "I'll handle feature Y"
3. Both AIs update progress via team activity
4. Automatic conflict avoidance
5. Session logged for project management

### 3. Knowledge Sharing

**Scenario:** AI on one computer solves a problem

**Workflow:**
1. AI posts solution to team/activity.log
2. Other AIs receive solution automatically
3. workspace-brain logs pattern for future use
4. Next time: Higher confidence, potential auto-resolution

## Setup Process

### For New Computer (5-Minute Setup)

**Step 1: Clone operations-workspace**
```bash
git clone https://github.com/mmaruthurssd/operations-workspace ~/Desktop/operations-workspace
cd ~/Desktop/operations-workspace
git pull  # Get latest including sync scripts
```

**Step 2: Start daemon**
```bash
./scripts/sync/daemon-control.sh start
```

**Step 3: Post test message**
```
Post to team: "👋 Hello from [Computer Name]! AI communication system working."
```

**Step 4: Verify communication**
```
Show recent team activity
# Wait 5 minutes or manual pull
# Should see response from other AI
```

**Documentation:** See `ALVARO-START-HERE.md` for complete setup guide

## Safety and Configuration

### Daemon Configuration

**File:** `team/.sync-daemon/config.yml`

**Key Settings:**
```yaml
daemon:
  enabled: true
  poll_interval_seconds: 300  # 5 minutes

  auto_pull:
    team_activity: true        # Auto-pull team messages
    platform_updates: false    # Manual only
    project_updates: false     # Manual only

  safety:
    backup_before_pull: true
    require_clean_working_tree: true
    max_auto_pulls_per_hour: 20

user:
  timezone: "America/Chicago"  # CST, UTC-6
```

### Security Considerations

**Pre-commit hooks:**
- All messages scanned for credentials and PHI
- Blocks high-severity violations
- Only workspace-appropriate data shared

**Access control:**
- GitHub repository determines access
- Daemon only pulls, never force-pushes
- Clean working tree required for auto-pull

**Audit trail:**
- All messages git-tracked
- Complete conversation logs
- workspace-brain analytics
- Rollback capability via git history

## Benefits

✅ **Direct AI Communication** - No human relay needed
✅ **Asynchronous** - 5-minute latency acceptable for most troubleshooting
✅ **Persistent** - All conversations logged and searchable
✅ **Scalable** - Works with 2+ computers
✅ **Automated** - Daemon handles synchronization
✅ **Safe** - Clean working tree, backups, audit trail
✅ **Learning-Enabled** - workspace-brain analytics improve over time

## Future Enhancements

**Phase 2 (Planned):**
- Real-time notifications (reduce 5-minute latency)
- Rich media support (diagrams, logs, screenshots)
- Conversation threading
- Priority/urgency levels
- Search and filter capabilities

**Phase 3 (Planned):**
- Multi-workspace synchronization
- Advanced analytics dashboard
- Automated issue detection and resolution coordination
- Integration with project-management MCP for task assignment

---

# MCP System Architecture

## Complete MCP Server Listings

22 active MCPs deployed across 5 categories (+ 1 library MCP for shared orchestration). Each listing includes complete tool inventories and integration patterns.

### Core Workflow MCPs (4)

#### git-assistant
Git workflow guidance and commit messages
**Tools:** check_commit_readiness, suggest_commit_message, show_git_guidance, analyze_commit_history
**Use:** Git operations, commits, repository questions

#### smart-file-organizer
Intelligent file and project organization
**Tools:** list_files, analyze_file, analyze_directory, check_lifecycle, suggest_organization, move_file, create_project_folder, add_pattern, record_decision
**Use:** Organizing files, project structure
**Config:** `.smart-file-organizer-rules.json` (workspace root) - stores learned patterns, persists across sessions, do not move

#### spec-driven (v0.2.0)
Spec-driven development workflow guide with orchestration integration
**Tools:** sdd_guide, update_task_status, get_task_progress
**Use:** Starting projects with formal specification, creating detailed implementation plans
**Integration:** Uses workflow-orchestrator library; works with project-management handoffs

#### task-executor (v2.0.0)
Persistent task workflow management with verification and orchestration integration
**Tools:** create_workflow, complete_task, get_workflow_status, archive_workflow
**Use:** ALL multi-step work (bugs, features, refactoring, deployments)
**Integration:** Uses workflow-orchestrator library; works with project-management handoffs; **check parallelization analysis in response - deploy sub-agents when recommended**
**NEW:** Automatic parallelization analysis - create_workflow() analyzes tasks for parallel opportunities (no manual analysis needed)

### Foundation MCPs (3)

#### mcp-config-manager
Validate and manage MCP configurations
**Tools:** sync_mcp_configs, register_mcp_server, unregister_mcp_server, list_mcp_servers
**Use:** After creating MCP, config health checks, cleaning orphaned configs
**Scope:** User=generic utilities; Project=workspace-specific (default)

#### security-compliance-mcp
Credential detection, PHI scanning, pre-commit hooks
**Tools:** scan_for_credentials, manage_allowlist, manage_hooks, scan_for_phi, manage_secrets
**Use:** Security scanning, HIPAA compliance, pre-commit validation
**Integration:** Git hooks active (.git/hooks/pre-commit), automated security scanning

#### testing-validation-mcp
Test execution, coverage tracking, quality gates
**Tools:** run_mcp_tests, validate_mcp_implementation, check_quality_gates, generate_coverage_report, run_smoke_tests, validate_tool_schema
**Use:** MCP testing, quality validation, coverage reporting

### Operations MCPs (4)

#### project-management (v1.0.3)
Project orchestration with intelligent workflow guidance, component-driven framework, and MCP handoffs
**31 Tools including:**
- **Setup:** start_project_setup, generate_project_constitution, identify_stakeholders
- **Goals:** evaluate_goal, create_potential_goal, promote_to_selected, view_goals_dashboard
- **Components:** create_component, update_component, move_component, split_component, merge_components, component_to_goal
- **Orchestration:** initialize_project_orchestration, get_next_steps, advance_workflow_phase
- **Handoffs:** prepare_spec_handoff, prepare_task_executor_handoff
- **Completion:** validate_project_readiness, wrap_up_project
**Use:** Project initialization, goal management, **component-driven design**, **automatic workflow orchestration**
**Integration:** Coordinates spec-driven + task-executor; uses workflow-orchestrator library
**NEW v1.0.3:** Component-Driven Framework - 6 tools for EXPLORING → FRAMEWORK → FINALIZED → ARCHIVED workflow
**NEW v1.0.0:** Automatic parallelization analysis - prepare_task_executor_handoff() analyzes tasks for parallel opportunities

#### parallelization (v1.0.1)
Parallel task execution with sub-agent coordination
**Tools:** analyze_task_parallelizability, create_dependency_graph, execute_parallel_workflow, aggregate_progress, detect_conflicts, optimize_batch_distribution
**Use:** **Deploy multiple sub-agents for parallel execution** when workflow MCPs recommend ≥2.0x speedup
**Integration:** Auto-analysis via workflow-orchestrator; **proactively deploy when 3+ independent tasks with clear scope**
**Note:** Agent suggestion logic integrated into project-management prepare_task_executor_handoff tool

#### configuration-manager-mcp
Secrets management, environment configs, drift detection
**Tools:** manage_secrets, validate_config, get_environment_vars, template_config, check_config_drift
**Use:** Secure configuration and secrets management, environment-specific configs
**Integration:** OS-native keychain (macOS Keychain, Windows Credential Manager, Linux libsecret)

#### deployment-release-mcp
Deployment automation, rollback, release coordination
**Tools:** deploy_application, rollback_deployment, validate_deployment, coordinate_release, generate_release_notes, monitor_deployment_health
**Use:** Multi-service deployment, zero-downtime releases, automated rollback

#### code-review-mcp
Linting, complexity analysis, code smells, technical debt tracking
**Tools:** analyze_code_quality, detect_complexity, find_code_smells, track_technical_debt, suggest_improvements, generate_review_report
**Use:** Code quality gates, pre-deployment reviews, technical debt management

### Intelligence MCPs (3)

#### workspace-brain (v1.0.1)
External brain for cross-session telemetry, analytics, and learning
**15 Tools across 5 categories:**
- **Telemetry:** log_event, query_events, get_event_stats
- **Analytics:** generate_weekly_summary, get_automation_opportunities, get_tool_usage_stats
- **Learning:** record_pattern, get_similar_patterns, get_preventive_checks
- **Cache:** cache_set, cache_get, cache_invalidate
- **Maintenance:** archive_old_data, export_data, get_storage_stats
**Use:** **Log task completions, track workflow metrics, store solutions, detect automation opportunities**
**Storage:** ~/workspace-brain/ (outside git, persistent across sessions)
**Integration:** Foundational persistence layer for other MCPs; manual logging pattern (see TELEMETRY-INTEGRATION-GUIDE.md)
**Status:** ✅ DEPLOYED (2025-10-31) - User scope, 15/15 tools operational, smoke tests passed
**Location:** local-instances/mcp-servers/workspace-brain-mcp-server/
**Docs:** /mcp-server-development/workspace-brain-mcp-project/03-resources-docs-assets-tools/TELEMETRY-INTEGRATION-GUIDE.md

#### performance-monitor-mcp
Performance tracking, anomaly detection, alerting
**Tools:** track_performance, get_metrics, detect_anomalies, set_alert_threshold, get_active_alerts, acknowledge_alert, generate_performance_report, get_performance_dashboard
**Use:** Real-time performance monitoring, bottleneck detection, alerting

#### documentation-generator (v1.0.0)
Automated documentation generation and maintenance for TypeScript projects
**6 Tools for documentation automation:**
- **generate_api_docs** - Generate API documentation from TypeScript/JSDoc (markdown/HTML output, private/public filtering)
- **generate_changelog** - Generate changelog from git commit history (Keep a Changelog/simple formats, conventional commit parsing)
- **track_doc_coverage** - Calculate documentation coverage percentage by analyzing exported symbols vs JSDoc comments
- **generate_diagrams** - Generate Mermaid.js diagrams from code structure (dependencies, architecture, dataflow)
- **update_documentation** - Detect code changes via git diff and regenerate affected documentation (conservative strategy)
- **catalog_documentation** - Scan and index markdown files with YAML frontmatter extraction (navigation tree, broken links)
**Use:** **Generate API docs for TypeScript projects, create changelogs from commits, track doc coverage, visualize architecture**
**Integration:** Uses git-assistant for commit data, feeds workspace-index for searchability, logs to workspace-brain
**Status:** ✅ DEPLOYED (2025-10-31) - User scope, 6/6 tools operational, 80.76% test coverage
**Location:** local-instances/mcp-servers/documentation-generator-mcp-server/
**Docs:** /mcp-server-development/documentation-generator-mcp-project/README.md
**Key Features:** TypeScript Compiler API for accurate parsing, Mermaid.js for GitHub-native diagrams, conservative auto-regeneration

### Supporting MCPs (10)

#### arc-decision
Architecture decisions (Skills/MCP/Subagents/Hybrids)
**Tools:** analyze_requirements, suggest_architecture, compare_approaches, find_similar_decisions, record_decision
**Use:** Building tools, architecture patterns, learning from past

#### communications
Email and Google Chat with staging/approval
**Tools:** stage_email, send_email_smtp, send_email_gmail, send_google_chat_message, send_google_chat_webhook, approve_email, batch_approve_emails
**Use:** Emails, chat messages, bulk communications

#### learning-optimizer
Troubleshooting optimization with auto-learning
**Tools:** track_issue, check_optimization_triggers, optimize_knowledge_base, get_domain_stats, detect_duplicates, categorize_issues
**Use:** Tracking issues, knowledge bases, preventing debt

#### workspace-index
Workspace indexing, documentation consistency validation, drift detection, **Phase 4: Autonomous documentation management**, and **Phase 5: Proactive component detection**
**Tools (Phases 1-3):** generate_project_index, update_indexes_for_paths, check_index_freshness, validate_workspace_documentation, track_documentation_drift, update_workspace_docs_for_reality
**Tools (Phase 4):** analyze_documentation_health, generate_documentation_health_report, preview_consolidation, execute_consolidation, rollback_consolidation, validate_cross_references, update_cross_references
**Tools (Phase 5 - NEW 2025-11-14):** detect_system_components, validate_component_documentation, suggest_component_documentation
**Phase 4 Capabilities (Deployed 2025-11-04):**
- **Supersession Detection:** Identifies docs replaced by frameworks or newer comprehensive docs with confidence scoring
- **Redundancy Detection:** Finds overlapping documentation (>60% overlap) and suggests consolidation
- **Autonomous Operations:** Archive, consolidate, or create replacement docs based on confidence (≥0.85 auto-execute, <0.85 require approval)
- **Learning System:** Integrates with workspace-brain to improve confidence scoring over time, adjusts weights based on outcomes
- **Safety:** First-time patterns require approval, all operations create backups, dry-run preview available, rollback capability, complete audit trail
- **MCP Integration:** Post-operation hooks (project-management wrap_up), scheduled weekly scans, git pre-commit validation (optional)
**Phase 5 Capabilities (NEW 2025-11-14):**
- **Component Detection:** Scans workspace for system components (automation, infrastructure, integration, protection, monitoring) using pattern matching
- **Documentation Validation:** Verifies components are documented in required locations (SYSTEM-COMPONENTS.md, WORKSPACE_ARCHITECTURE.md, START_HERE.md)
- **Auto-Suggestion:** Generates documentation entries for undocumented components with AI-powered metadata extraction
- **Proactive Alerts:** Detects undocumented components >7 days old, validates production systems before archival
- **Integration:** Enhanced validate_workspace_documentation() includes 'system_components' check, auto-triggers on workspace initialization
**Use:** Project organization, file discovery, documentation consistency, **autonomous documentation lifecycle management**, **system component tracking**
**Status:** Phases 1-3 ✅ DEPLOYED | Phase 4 ✅ DEPLOYED (2025-11-04) | Phase 5 ✅ DEPLOYED (2025-11-14)
**Template-First Pattern:** Workspace-index is now developed as drop-in ready template following **MCP-DEVELOPMENT-STANDARD.md** (template-first, auto-configuration, transferable to future workspaces)

#### checklist-manager-mcp
Checklist tracking, validation, dependency enforcement
**Tools:** register_checklist, get_checklist_status, update_checklist_item, validate_checklist_compliance, generate_progress_report, detect_stale_checklists, suggest_consolidation, enforce_dependencies, create_from_template, archive_checklist
**Use:** Quality assurance, rollout checklists, compliance validation

#### test-generator-mcp
Automated test generation for TypeScript/JavaScript
**Tools:** generate_unit_tests, generate_integration_tests, analyze_coverage_gaps, suggest_test_scenarios
**Use:** Test automation, coverage improvement, test scaffolding

#### backup-dr-mcp
Backup automation, disaster recovery, HIPAA compliance
**Tools:** create_backup, restore_backup, list_backups, verify_backup, schedule_backup, get_backup_status, cleanup_old_backups, export_backup_config
**Use:** Critical data protection, external brain backup, PHI-safe backups

---

# MCP Integration Architecture (v2.0)

## Unified Workflow Orchestration

Three MCP servers now share a common orchestration library:

```
project-management-mcp-server (Coordinator)
      ↓ provides orchestration tools
      ↓ coordinates handoffs
      ↓
   ┌──┴──────────────────┐
   │                     │
spec-driven          task-executor
(Planning)           (Execution)
   │                     │
   └──────┬──────────────┘
          │
   workflow-orchestrator-mcp-server
   (Shared Library - NOT a standalone MCP)
   - StateManager
   - RuleEngine
   - StateDetector
```

## How They Work Together

**Automatic Orchestration Pattern:**
1. **Initialize:** `initialize_project_orchestration()` - Start state tracking
2. **Get Suggestions:** `get_next_steps()` - AI suggests next actions with ready-to-execute tool calls
3. **Handoff to Spec:** `prepare_spec_handoff()` - Auto-prepares goal for specification creation
4. **Handoff to Tasks:** `prepare_task_executor_handoff()` - Auto-extracts tasks from spec
5. **Track Progress:** State auto-syncs with file system changes
6. **Complete:** `wrap_up_project()` - Validates and generates completion report

**Key Benefits:**
- ✅ Shared state management (~450 lines of duplicate code eliminated)
- ✅ Consistent patterns across all workflow MCPs
- ✅ Intelligent next-step suggestions with priority ranking
- ✅ Automatic handoffs between planning → execution
- ✅ Integration tracking (knows which MCP tools used for which goals)

**When to Use:**
- **project-management:** Project setup, goals, orchestration, handoffs
- **spec-driven:** Create detailed specifications (called via handoff or directly)
- **task-executor:** Execute implementation tasks (called via handoff or directly)

**Manual vs Automatic:**
- Orchestration is "automatic" when you ask `get_next_steps()`
- Claude executes suggested actions (with your approval)
- Not fully autonomous - requires prompting "What's next?"

---

# Dual-Environment Development Pattern

## Overview

**Pattern:** Staging → Production separation for all MCPs and tools

**Structure:**
```
development/                    local-instances/
├── mcp-servers/               ├── mcp-servers/
│   └── [name]-project/  ──→  │   └── [name]/
│       └── 04-product-under-  │       └── dist/
│           development/       │           package.json
│           └── staging/       │           ...
│               ├── src/       │
│               ├── tests/     └── tools/
│               └── ...            └── [name]/
└── tools/                             └── ...
    └── [name]-project/
        └── 04-product-under-
            development/
            └── staging/
```

## Development Workflow

**1. Build in Staging:**
```bash
cd development/mcp-servers/[project]/04-product-under-development/staging/
npm install
npm run build
npm test
```

**2. Test Thoroughly:**
- Unit tests: `npm test`
- Integration tests: Test with real workflows
- Security scan: `mcp__security-compliance-mcp__scan_for_credentials(...)`
- Quality gates: `mcp__testing-validation-mcp__check_quality_gates(...)`

**3. Rollout to Production:**
- Complete ROLLOUT-CHECKLIST.md quality gates
- Copy built code: `staging/dist/` → `local-instances/mcp-servers/[name]/`
- Register with mcp-config-manager: `register_mcp_server(serverName: "[name]")`
- Restart Claude Code to load new/updated MCP
- Verify tools available with smoke tests

**4. Monitor & Iterate:**
- Log production issues to `development/mcp-servers/[project]/08-archive/issues/`
- Fix in staging: Edit `staging/src/`, rebuild, test
- Re-rollout updates following step 3
- Track issues with learning-optimizer-mcp

## MCP Configuration

**IMPORTANT:** MCP configuration (`.mcp.json` or `claude_desktop_config.json`) points to **production only**, not staging:

```json
{
  "mcpServers": {
    "example-mcp": {
      "command": "node",
      "args": [
        "/Users/[user]/Desktop/operations-workspace/local-instances/mcp-servers/example-mcp/dist/index.js"
      ]
    }
  }
}
```

**Configuration stays stable:**
- Staging changes don't affect running Claude Code sessions
- Production updates require MCP server restart
- Development projects can be moved/reorganized without config changes

## Project Organization

**23 MCP Projects in Staging:**
Located in `development/mcp-servers/`, each following 8-folder project structure:
- 01-planning/ - Specifications and design decisions
- 02-goals-and-roadmap/ - Development goals
- 03-resources-docs-assets-tools/ - Reference materials
- 04-product-under-development/staging/ - **Active development code**
- 05-brainstorming/ - Future enhancements
- 08-archive/issues/ - Production issue tracking
- README.md, EVENT-LOG.md, NEXT-STEPS.md, TROUBLESHOOTING.md

**23 MCPs in Production:**
Located in `local-instances/mcp-servers/`, flat structure:
- 22 active standalone MCPs (callable via ~/.claude.json)
- 1 library MCP (workflow-orchestrator - dependency for project-management, spec-driven, task-executor)
- dist/ - Compiled JavaScript
- node_modules/ - Dependencies
- package.json - Metadata
- No planning docs (live in development projects)

## Benefits

✅ **Clear separation** - Development work isolated from production code
✅ **Safe experimentation** - Break staging without affecting Claude Code
✅ **Git history** - Staging projects tracked, production instances deployed artifacts
✅ **Consistent pattern** - Same structure for all MCPs and tools
✅ **Production feedback loop** - Issues logged to staging project for fixes

---

# Autonomous Deployment Framework Architecture

**Location:** `development/frameworks/autonomous-deployment/`
**Status:** 🟢 Production - THE standard development pattern for all components
**Documentation:** `development/frameworks/autonomous-deployment/README.md`

## Overview

The Autonomous Deployment Framework is a **generic, component-agnostic system** for automated issue detection, classification, resolution, and deployment. It establishes THE standard pattern for how all components (MCPs, tools, sheets, applications) are built and maintained in this workspace.

**Core Capabilities:**
- Extensible issue type system (base types + custom types)
- Confidence-based autonomy (0.90+ autonomous, 0.70-0.89 assisted, <0.70 manual)
- Tiered storage architecture (workspace + external brain + 90-day archival)
- Dual environment AND production-only deployment modes
- 5-stage validation framework with automatic rollback
- Full MCP workflow integration (project-management → spec-driven → task-executor → parallelization)
- Adapter pattern for component-specific implementations

## Issue Type System (Extensible)

### Base Issue Types

Framework deeply understands three base types with specialized confidence scoring:

**1. Broken (Fix)** - Component exists but not working correctly
```typescript
// Confidence calculation: 40% history + 30% similarity + 15% (1-complexity) + 15% (1-risk)
// Can achieve high confidence (0.90+) with resolution history
// Fully autonomous when ≥2 similar issues resolved successfully
```
Examples: MCP errors, failing tests, broken API integration, configuration issues

**2. Missing (Build)** - Capability doesn't exist, needs creation
```typescript
// Confidence calculation: 50% spec clarity + 30% similar implementations + 20% (1-complexity)
// Always capped at 0.85 - requires human input for direction
// AI suggests approaches, human selects best option
```
Examples: New MCP tool, missing feature, new integration, infrastructure needs

**3. Improvement (Enhance)** - Component works but could be better
```typescript
// Confidence calculation: 40% clarity + 30% (1-scope) + 30% test coverage
// Variable confidence based on complexity
// Simple optimizations autonomous, complex improvements need review
```
Examples: Performance optimization, better error handling, refactoring, documentation

### Extended Issue Types

10 common types that map to base types for confidence calculation:

| Extended Type | Maps To | Default Multiplier | Example |
|--------------|---------|-------------------|---------|
| configuration | broken | 1.0 | .mcp.json validation errors |
| integration | broken | 1.0 | API connection failures |
| security | broken | 0.8 | Hardcoded credentials (needs review) |
| dependency | broken | 1.0 | npm package version conflicts |
| data-migration | broken | 0.7 | Database schema changes (risky) |
| deployment | broken | 1.0 | Rollout checklist failures |
| infrastructure | missing | 1.0 | Need for new database |
| performance | improvement | 1.0 | Slow query optimization |
| documentation | improvement | 1.0 | Missing JSDoc comments |
| testing | improvement | 1.0 | Low test coverage |

### Custom Type Mapping

Framework is **fully extensible** - accepts any string as issue type:

```typescript
interface TypeMappingConfig {
  [customType: string]: {
    mapsTo: BaseIssueType;
    description?: string;
    defaultSeverity?: IssueSeverity;
    defaultConfidenceMultiplier?: number;  // 0-1, adjusts base confidence
  };
}

// Example: Medical-specific custom types
const customMappings: TypeMappingConfig = {
  'hipaa-compliance': {
    mapsTo: 'broken',
    defaultSeverity: 'critical',
    defaultConfidenceMultiplier: 0.6  // Very conservative for compliance
  },
  'patient-data-migration': {
    mapsTo: 'broken',
    defaultSeverity: 'high',
    defaultConfidenceMultiplier: 0.5  // Extremely conservative
  }
};
```

**Unknown types default to 'broken'** with warning logged.

## Tiered Storage Architecture

Three-layer storage system balancing speed, persistence, and organization:

```
Issue Detected
    ↓
┌─────────────────────────────────┐
│ Layer 1: Workspace (Fast)       │  ← Active issues
│ .ai-planning/issues/            │  ← project-management MCP manages
│ - Recent issues (< 90 days)     │  ← Quick resolution lookups
│ - JSON files per issue           │  ← Git-tracked
└─────────────────────────────────┘
    ↓ (dual recording)
┌─────────────────────────────────┐
│ Layer 2: External Brain (Deep)  │  ← Historical learning
│ workspace-brain MCP              │  ← All issues forever
│ ~/workspace-brain/               │  ← Pattern detection
│ - Telemetry events               │  ← Cross-session memory
│ - Learning patterns              │  ← Not git-tracked
└─────────────────────────────────┘
    ↓ (after 90 days)
┌─────────────────────────────────┐
│ Layer 3: Archive (Long-term)    │  ← Resolved issues
│ 08-archive/issues/              │  ← Compressed storage
│ - Old resolved issues            │  ← Git-tracked for reference
│ - Searchable history             │  ← Rare access
└─────────────────────────────────┘
```

**Query Strategy:**
- Recent resolutions: workspace layer (fast, <50ms)
- Historical patterns: external brain (comprehensive, all-time)
- Archival research: archive layer (rare, manual)
- Confidence scoring: combines recent (workspace) + historical (brain)

**Graceful Degradation:**
- Framework works without external brain (workspace-only mode)
- Falls back to workspace storage if brain MCP unavailable
- No functionality lost, just less historical depth

## Deployment Modes

### Dual Environment (Preferred)

**Structure:**
```
development/[component-type]/[name]/       local-instances/[component-type]/[name]/
├── src/                             ──→   ├── dist/
├── tests/                                 ├── package.json
├── package.json                           └── node_modules/
└── tsconfig.json
```

**Workflow:**
1. Validate in development environment (5-stage validation)
2. Build in development (`npm run build`)
3. Deploy to development
4. Monitor stability (2 minutes default)
5. Deploy to production if stable
6. Monitor production stability (5 minutes default)
7. Auto-rollback on failure

**Benefits:**
- Safe experimentation in staging
- Git history tracked in development
- Production is clean deployed artifacts
- Zero production downtime for updates

### Production-Only (When Practical)

**When to Use:**
- Staging environment impractical (e.g., Google Sheets with live data)
- Resource constraints (small scripts, simple configs)
- Rapid deployment needed (emergency fixes)
- Component doesn't support dual environments

**Safety Workflow:**
1. **Create temporary staging** - Copy to `.temp-staging/[component]-[timestamp]/`
2. **Validate in temp staging** - Full 5-stage validation
3. **Build in temp staging** - `npm run build` or equivalent
4. **Health check** - Verify functionality
5. **Deploy to production** - With automatic backup
6. **Monitor stability** - 5 minutes default for production
7. **Clean up temp staging** - Remove temporary environment
8. **Auto-rollback on failure** - Restore from backup

**Production Backup Always Created:**
- Timestamp: `backup-production-2025-01-04T10-30-00`
- Location: Component-specific backup storage
- Retention: 30 days default
- Restoration: Automatic on deployment failure

## Adapter Pattern

### Component Adapter Interface

All component types implement common interface:

```typescript
interface ComponentAdapter {
  componentType: ComponentType;

  // Validation (5 stages)
  validate(context: ValidationContext): Promise<ValidationResult>;

  // Build
  build(componentPath: string): Promise<boolean>;

  // Deployment
  deploy(config: DeploymentConfig): Promise<DeploymentResult>;

  // Health monitoring
  healthCheck(componentPath: string, url?: string): Promise<boolean>;

  // Metadata
  getMetadata(componentPath: string): Promise<Component['metadata']>;

  // Environment support
  supportsEnvironmentMode(mode: EnvironmentMode): boolean;
}
```

### Available Adapters

**MCPAdapter** (`adapters/mcp-adapter.ts`)
- Component type: `mcp-server`
- Language: TypeScript MCP servers
- Validation:
  1. Unit Tests - npm test with coverage tracking
  2. Integration Tests - test:integration script
  3. Security Scan - credential/PHI detection via security-compliance-mcp
  4. Code Quality - ESLint, complexity checks, type checking
  5. Functional Validation - MCP-specific checks (package.json, build output, tool schemas)
- Build: `npm install && npm run build`
- Supports: dual, production-only

**ToolAdapter** (`adapters/tool-adapter.ts`)
- Component type: `tool`
- Languages: Node.js, Python, Go, Bash (auto-detected)
- Validation:
  1. Unit Tests - Language-specific test frameworks (npm test, pytest, go test)
  2. Integration Tests - Skipped for simple tools
  3. Security Scan - Credential/PHI detection
  4. Code Quality - Language-specific linters (ESLint, pylint, golint)
  5. Tool Validation - Dependencies installed, entry file exists, basic execution
- Build: Language-specific (npm build, pip install, go build)
- Supports: dual, production-only

**SheetAdapter** (`adapters/sheet-adapter.ts`)
- Component type: `google-sheet`
- Languages: Apps Script (.gs files)
- Validation:
  1. Apps Script Tests - Syntax validation, .clasp.json check, appsscript.json manifest
  2. Integration Tests - Sheet API interaction tests (if available)
  3. Security Scan - PHI in sheet config, credentials in scripts, OAuth scope review
  4. Code Quality - JSDoc comments, function length, global variables, error handling
  5. Sheet Validation - sheet-config.json structure, tab definitions, permissions
- Build: `clasp push` (Apps Script deployment)
- Supports: dual, production-only

**Future Adapters:**
- ApplicationAdapter - Full applications (Express, React, etc.)
- ScriptAdapter - Standalone scripts (shell, Python, Node)
- ConfigAdapter - Configuration files (JSON, YAML validation)

## 5-Stage Validation Framework

**All adapters implement same validation stages:**

### Stage 1: Unit Tests
- Component-specific test execution
- Coverage tracking (target: 80%+)
- Fast feedback (<30 seconds)
- Fails immediately if critical tests fail

### Stage 2: Integration Tests
- End-to-end workflow testing
- External dependencies validated
- May be skipped for simple components
- Timeout: 2 minutes default

### Stage 3: Security Scan
- Credential detection (API keys, passwords, tokens)
- PHI scanning (patient data, medical records, SSN patterns)
- Integration with security-compliance-mcp
- Zero tolerance for high-severity violations

### Stage 4: Code Quality
- Linting (ESLint, pylint, etc.)
- Complexity analysis (cyclomatic, cognitive)
- Type checking (TypeScript, mypy)
- Warnings allowed, errors block deployment

### Stage 5: Functional Validation
- Component-specific health checks
- Metadata validation
- Build artifact verification
- Configuration structure validation

**Validation Result:**
```typescript
interface ValidationResult {
  passed: boolean;
  stages: {
    unitTests: StageResult;
    integrationTests: StageResult;
    securityScan: StageResult;
    codeQuality: StageResult;
    functionalValidation: StageResult;
  };
  failures: string[];
  warnings: string[];
  metrics: {
    coverage: number;
    complexity: number;
    duration: number;
  };
}
```

## Confidence-Based Autonomy

### Confidence Thresholds

```typescript
confidenceThresholds: {
  autonomous: 0.90,   // Deploy without approval
  assisted: 0.70,     // AI suggests, human approves
  // <0.70: Manual - Human-led with AI support
}
```

### Confidence Scoring by Issue Type

**Broken Issues (4-factor model):**
```typescript
confidence =
  (0.40 × resolutionHistoryScore) +
  (0.30 × similarityScore) +
  (0.15 × (1 - complexityScore)) +
  (0.15 × (1 - riskScore))
```

**Missing Issues (capped at 0.85):**
```typescript
baseConfidence =
  (0.50 × specClarityScore) +
  (0.30 × similarImplementationsScore) +
  (0.20 × (1 - complexityScore))

confidence = min(0.85, baseConfidence)  // Always requires human
```

**Improvement Issues:**
```typescript
confidence =
  (0.40 × clarityScore) +
  (0.30 × (1 - scopeScore)) +
  (0.30 × testCoverageScore)
```

### Safety Mechanisms

**Automatic Approvals (≥0.90 confidence):**
- ≥2 successful prior resolutions for exact symptom
- No PHI handling involved
- Reversibility: easy
- Production impact: low or medium
- No security/data-migration concerns

**Assisted Workflow (0.70-0.89 confidence):**
- AI generates complete resolution plan
- Human reviews and approves before execution
- Modifications allowed
- Full rollback capability

**Manual Mode (<0.70 confidence):**
- Human-led with AI support
- AI provides suggestions and research
- Human executes with AI assistance
- Learning captured for future autonomy

**Override Mechanisms:**
- Emergency override for critical fixes
- Approval workflow for first-time patterns
- Confidence multipliers for high-risk types
- Audit trail of all autonomous actions

## MCP Workflow Integration

### Integrated MCPs (NEW - November 2025)

The framework is now **directly integrated** into workflow MCPs:

**project-management MCP** (`evaluate_goal` + `create_potential_goal`):
- ✅ **Optional** autonomous classification when `workspacePath` provided
- Returns confidence scores, issue types, and autonomy recommendations
- Displays autonomous classification section in potential goal files
- Enables early detection of autonomous-eligible issues
- **Integration:** `src/evaluators/autonomous-classifier.ts` wraps framework classifier

**task-executor MCP** (`complete_task` + `archive_workflow`):
- ✅ **Optional** automated validation via `runValidation` parameter
- Build, test, and security checks during task completion
- ✅ **Optional** deployment readiness checking via `checkDeploymentReadiness` parameter
- Pre-deployment verification before workflow archival
- **Integration:** `src/utils/task-validation.ts` and `src/utils/task-deployment.ts` use framework validation

**Documentation:**
- `local-instances/mcp-servers/project-management-mcp-server/AUTONOMOUS-INTEGRATION.md`
- `local-instances/mcp-servers/task-executor-mcp-server/AUTONOMOUS-INTEGRATION.md`

### Standard Resolution Workflow (Enhanced)

```
1. Issue Detection
   ↓
2. Framework Classification (issue-classifier.ts)
   ↓
3. project-management.evaluate_goal(workspacePath=...) [NEW: Returns autonomous classification]
   ↓ (confidence score, issue type, autonomy level)
4. project-management.create_potential_goal(autonomous*=...) [NEW: Includes classification]
   ↓
5. project-management.promote_to_selected()
   ↓
6. spec-driven.sdd_guide() [if "missing" or complex]
   ↓
7. task-executor.create_workflow()
   ↓ (if ≥3 independent tasks with ≥2.0x speedup)
8. parallelization.execute_parallel_workflow() [optional]
   ↓
9. task-executor.complete_task(runValidation=true) [NEW: Auto-validates build/tests]
   ↓
10. Framework Validation (5 stages) [if full deployment needed]
   ↓
11. task-executor.archive_workflow(checkDeploymentReadiness=true) [NEW: Pre-deployment check]
   ↓
12. Framework Deployment (dual or production-only) [if deployment needed]
   ↓
13. workspace-brain.log_event() (learning)
   ↓
14. Framework Storage (tiered storage)
```

### Storage Integration

**Active Issues (workspace layer):**
```typescript
// Managed by project-management MCP
const issue = await projectManagement.createPotentialGoal({
  goalName: 'fix-mcp-server-error',
  issueType: 'broken',
  confidence: 0.92,
  autonomousEligible: true
});
// Stored: .ai-planning/issues/001-fix-mcp-server-error.json
```

**Historical Learning (external brain layer):**
```typescript
// Logged by workspace-brain MCP
await workspaceBrain.logEvent({
  event_type: 'issue-resolution',
  event_data: {
    issue_id: '001',
    resolution_id: 'res-001',
    outcome: 'successful',
    autonomous: true,
    duration_minutes: 5
  }
});
// Stored: ~/workspace-brain/telemetry/
```

**Archival (90-day policy):**
```typescript
// Automated by storage-manager
await storageManager.archiveOldIssues();
// Moves: .ai-planning/issues/old/ → 08-archive/issues/
```

## Usage Examples

### Deploy MCP Server (Dual Environment)

```typescript
import { MCPAdapter } from './adapters/mcp-adapter.js';
import { createDeploymentPipeline } from './core/deployment-pipeline.js';

const adapter = new MCPAdapter();
const pipeline = createDeploymentPipeline({
  workspacePath: '/path/to/workspace',
  componentName: 'my-mcp-server',
  componentType: 'mcp-server',
  environmentMode: 'dual',
  adapter,
  targetEnvironment: 'production',
  backupBeforeDeploy: true,
  autoRollback: true
});

const result = await pipeline.deploy();
// Validates → Builds → Deploys dev → Monitors → Deploys prod
```

### Deploy Tool (Production-Only)

```typescript
import { ToolAdapter } from './adapters/tool-adapter.js';
import { createDeploymentPipeline } from './core/deployment-pipeline.js';

const adapter = new ToolAdapter();
const pipeline = createDeploymentPipeline({
  workspacePath: '/path/to/workspace',
  componentName: 'my-python-tool',
  componentType: 'tool',
  environmentMode: 'production-only',
  adapter,
  targetEnvironment: 'production'
});

const result = await pipeline.deploy();
// Creates temp staging → Validates → Deploys prod → Cleans up
```

### Custom Issue Type Mapping

```typescript
import { IssueClassifier } from './core/issue-classifier.js';

const customMappings = {
  'hipaa-violation': {
    mapsTo: 'broken',
    defaultSeverity: 'critical',
    defaultConfidenceMultiplier: 0.6  // Conservative
  }
};

const classifier = new IssueClassifier(
  workspacePath,
  storageManager,
  customMappings
);

const result = await classifier.classifyIssue({
  type: 'hipaa-violation',  // Custom type
  symptom: 'PHI exposed in API response',
  // ... maps to 'broken' with 0.6x confidence multiplier
});
```

## File Structure

```
development/frameworks/autonomous-deployment/
├── core/
│   ├── types.ts                    # Complete type system (400+ lines)
│   ├── storage-manager.ts          # Tiered storage (450+ lines)
│   ├── issue-classifier.ts         # Classification & confidence (550+ lines)
│   └── deployment-pipeline.ts      # Deployment orchestration (400+ lines)
│
├── adapters/
│   ├── mcp-adapter.ts              # MCP server adapter (450+ lines)
│   ├── tool-adapter.ts             # Tool adapter (450+ lines)
│   └── sheet-adapter.ts            # Google Sheets adapter (480+ lines)
│
├── README.md                        # Complete documentation (900+ lines)
└── IMPLEMENTATION-STATUS.md         # Progress tracking
```

**Total:** ~3,700 lines of framework code + 900 lines of documentation

## Benefits

✅ **Universal Pattern** - Works with ANY component type (MCP, tool, sheet, app)
✅ **Extensible** - Custom issue types, adapters, confidence multipliers
✅ **Safe** - 5-stage validation, automatic rollback, approval workflow
✅ **Intelligent** - Confidence-based autonomy, learning from history
✅ **Integrated** - Seamless MCP workflow orchestration
✅ **Scalable** - Tiered storage, efficient archival policy
✅ **Production-Ready** - Supports both dual and production-only modes

**This framework IS the standard for all component development in this workspace.**

---

# Parallelization Architecture

## Automatic Parallelization Analysis

**What:** workflow-orchestrator library includes ParallelizationAnalyzer module

**Where:** Integrated into project-management and task-executor MCPs

**How It Works:**
1. **project-management:** `prepare_task_executor_handoff()` auto-analyzes tasks
   - Counts independent tasks vs dependencies
   - Estimates speedup potential (e.g., "2.0x speedup possible")
   - Includes recommendation in handoff data

2. **task-executor:** `create_workflow()` auto-analyzes tasks
   - Stores parallelization analysis in workflow state
   - Returns analysis in workflow creation response
   - Shows: `parallelization: { recommended: true, speedup: 2.0x, mode: 'parallel' }`

**Fallback Heuristic:**
- Uses simple analysis (~60% confidence) when parallelization-mcp not available
- Counts tasks without dependencies
- Estimates speedup based on independent task count
- No performance impact (<10ms overhead)

**Future Enhancement:**
- Direct MCP-to-MCP calls would enable full analysis (~90% confidence)
- Would add conflict prediction, batch optimization, implicit dependency detection

**User Impact:**
- You don't need to manually invoke parallelization analysis
- Workflow creation responses now include parallelization recommendations
- Recommendations only - not auto-execution (requires manual parallel workflow setup)

## Sub-Agent Deployment Pattern

**Deploy sub-agents when ALL conditions met:**
1. ✅ Analysis shows `recommended: true` with speedup ≥2.0x
2. ✅ 3+ independent tasks (minimal dependencies)
3. ✅ Clear scope per task (distinct file boundaries)
4. ✅ Non-trivial work (5+ minutes per task)

**Deployment Workflow:**
1. `task_executor.create_workflow()` - Get tasks + parallelization analysis
2. `agent_coordinator.suggest_agent_for_task()` - Select appropriate agents
3. `agent_coordinator.create_task_capsule()` - Prepare capsules for each task
4. `parallelization.execute_parallel_workflow()` - Deploy sub-agents with conflict detection
5. `parallelization.aggregate_progress()` - Monitor execution
6. `task_executor.complete_task()` - Mark tasks complete as agents finish

**When NOT to use:**
- Sequential dependencies (tasks must run in order)
- High file conflict risk (same files edited)
- Exploratory work (unclear requirements)
- Trivial tasks (coordination overhead > time savings)

---

# Self-Improving Feedback Loop Architecture

**Purpose:** Workspace autonomously detects, logs, triages, resolves, and learns from issues

**Status:** 🟢 Phase 1 Active (Pre-commit integration complete)

## Complete 7-Step Process

1. **Detection** - Pre-commit hooks scan for credentials/PHI, MCPs log runtime errors
2. **Logging** - Issues logged to learning-optimizer-mcp with structured context
3. **Triage** - Issues classified by severity (high=human, medium=suggest, low=autonomous)
4. **Resolution** - Low-severity issues resolved autonomously via MCP orchestration
5. **Validation** - Comprehensive testing + security scanning before deployment
6. **Deployment** - Auto-deploy to staging→production with rollback on failure
7. **Learning** - Track outcomes, improve confidence scores, prevent future issues

## Pre-Commit Security Scanning (Active)

**Implementation:**
- `.git/hooks/pre-commit` - Scans all staged files for credentials and PHI
- Blocks high-severity violations immediately
- Generates scan reports in `.security-scans/` (gitignored)
- Logs issues to `.security-issues-log/` for learning-optimizer (gitignored)
- Fast (<5 seconds for typical commits)

**Integration:**
- Uses security-compliance-mcp: scan_for_credentials, scan_for_phi
- Automatic on every git commit
- No configuration required - works out of the box

## Autonomous Resolution (Phase 2 - Planned)

**Capabilities:**
- Low-severity, well-understood issues (≥2 prior resolutions) resolved automatically
- Orchestrates project-management + spec-driven + task-executor + parallelization MCPs
- Full validation + testing before deployment
- Automatic rollback on failure
- Target: 40% autonomous resolution rate, 95%+ success rate

**Workflow:**
1. Issue detected and logged
2. Learning-optimizer checks resolution history
3. If ≥2 prior successes → autonomous resolution
4. Create workflow via project-management
5. Execute via task-executor with validation
6. Deploy via deployment-release-mcp
7. Log outcome for learning

## Safety Mechanisms

- Human approval required for first-time resolutions
- Confidence scoring (≥0.90 for fully autonomous)
- Automatic rollback on validation failures
- Full audit trail of all autonomous actions
- Emergency override available

**Reference:** See mcp-server-development/MCP-SYSTEM-ARCHITECTURE.md for implementation details

---

# Resource Category Indexes

For comprehensive lists of all available resources, see these detailed indexes:

| Category | Index File | Contents |
|----------|-----------|----------|
| **Workflow Playbook** | /WORKFLOW_PLAYBOOK.md | Living knowledge base of established workflows, credentials, "how we do things" |
| **Project Templates** | templates-and-patterns/project-structure-templates/START_HERE.md | Base template + specialized variants, improvement tracking |
| **Frameworks** | templates-and-patterns/frameworks/FRAMEWORKS-INDEX.md | All 4 frameworks with detailed descriptions |
| **Tools** | templates-and-patterns/tools-templates/TOOLS-INDEX.md | All 8+ stable tools with setup guides |
| **MCP Servers** | templates-and-patterns/mcp-server-templates/START_HERE.md | Templates, instances, configuration strategy |
| **GitHub Templates** | templates-and-patterns/github-repo-templates/REPOSITORY_CREATION_GUIDE.md | Repository templates and standards |
| **Planning Resources** | planning-and-roadmap/github-organization-registry/ | Repository tracking and roadmap |
| **Production System** | live-practice-management-system/ | Live system architecture and docs |

**When to use category indexes:**
- Need comprehensive list of all tools/frameworks
- Looking for less common resources not in Quick Lookup
- Want to understand full capabilities of a category
- Exploring what's available in depth

---

# MCP Registry

**Complete Component Registry:** planning-and-roadmap/mcp-component-registry/

Contains 24 individual component files documenting:
- MCP purpose and capabilities
- Tool inventories and integration patterns
- Lifecycle stage and deployment status
- Version history and dependencies
- Storage architecture where applicable

**Main Registry:** planning-and-roadmap/mcp-component-registry/MCP-REGISTRY.md

---

**Last Updated:** 2025-11-06
**MCP Count:** 22 active MCPs + 1 library MCP (workflow-orchestrator) + 1 archived (agent-coordinator) + 1 in development (checklist-manager)
**Integration Points:** 67+ documented
**Version:** 2.0 (Project Completion Release)

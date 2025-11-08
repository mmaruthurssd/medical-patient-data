---
type: onboarding
tags: [team-collaboration, setup, three-workspace, Alvaro]
created: 2025-11-08
---

# Team Onboarding Guide

**Welcome to the Medical Practice AI Workspace!** 🎉

This guide will help you (Alvaro and other team members) set up the complete three-workspace architecture on your machine in ~30 minutes.

**Target Audience:** New team members joining the medical practice AI development project

---

## Overview

You'll be setting up **three interconnected workspaces:**

```
┌─────────────────────────────────────────┐
│ 1. medical-practice-workspace           │
│    • Claude Code (AI development)        │
│    • NO PHI allowed                      │
│    • Templates, docs, planning           │
└─────────────────────────────────────────┘
             ↕ (shared-resources)
┌─────────────────────────────────────────┐
│ 2. medical-patient-data                  │
│    • Gemini AI (patient workflows)       │
│    • PHI ALLOWED (Google BAA)            │
│    • Clinical operations                 │
└─────────────────────────────────────────┘
             ↕ (MCP servers)
┌─────────────────────────────────────────┐
│ 3. mcp-infrastructure                    │
│    • 26 MCP servers (434K+ lines)        │
│    • Platform-agnostic tools             │
│    • Shared by both workspaces           │
└─────────────────────────────────────────┘
```

---

## Prerequisites

### Required Software
- [ ] **macOS** (currently Mac-only setup)
- [ ] **Node.js 18+** - [Download](https://nodejs.org/)
- [ ] **Git** - [Download](https://git-scm.com/)
- [ ] **Claude Code** - [Download](https://claude.com/claude-code)
- [ ] **VS Code** (optional but recommended)
- [ ] **Google Cloud Account** with Gemini API access

### Access Requirements
- [ ] GitHub access to repositories
- [ ] Google Workspace account (for Gemini API under BAA)
- [ ] HIPAA compliance training completed ✅

### Estimated Time
- **Quick Setup:** 10 minutes (minimal, just clone and symlink)
- **Full Setup:** 30 minutes (includes MCP config, Gemini API, testing)
- **With Training:** 60 minutes (includes HIPAA orientation)

---

## Quick Setup (10 Minutes)

### Step 1: Clone All Three Workspaces

```bash
# Navigate to Desktop
cd ~/Desktop

# Clone workspace 1 (development)
git clone <medical-practice-workspace-url> medical-practice-workspace

# Clone workspace 2 (patient data)
git clone <medical-patient-data-url> medical-patient-data

# Clone workspace 3 (MCP infrastructure)
git clone https://github.com/mmaruthurssd/mcp-infrastructure mcp-infrastructure
```

### Step 2: Run Setup Script

```bash
# Navigate to patient-data workspace
cd ~/Desktop/medical-patient-data

# Make setup script executable (if not already)
chmod +x setup-workspace.sh

# Run setup
./setup-workspace.sh
```

**The setup script will:**
1. Create `~/Desktop/shared-resources/` directory
2. Copy documentation, templates, and commands
3. Create symlinks in both workspaces
4. Install PHI Guard pre-commit hook
5. Configure MCP access via `~/.claude.json`
6. Verify all connections

### Step 3: Verify Setup

```bash
# Check shared resources
ls -la ~/Desktop/shared-resources/
# Expected: documentation/, templates/, commands/

# Check symlinks in medical-patient-data
ls -la shared-resources
# Expected: symlink → ../shared-resources

# Check symlinks in medical-practice-workspace
cd ~/Desktop/medical-practice-workspace
ls -la shared-resources
# Expected: symlink → ../shared-resources

# Check PHI Guard is active
cd ~/Desktop/medical-patient-data
echo "SSN: 123-45-6789" > temp/test.txt
git add temp/test.txt
git commit -m "Test"
# Expected: ❌ Commit blocked by PHI Guard
rm temp/test.txt
```

**✅ Quick Setup Complete!** You now have all three workspaces configured.

---

## Full Setup (30 Minutes)

If the automated setup script doesn't exist yet, follow these manual steps:

### Step 1: Create Shared Resources Directory

```bash
cd ~/Desktop

# Create shared-resources structure
mkdir -p shared-resources/{documentation,templates/{mcp-servers,simple,project-structure,tools},commands}
```

### Step 2: Copy Documentation from medical-practice-workspace

```bash
cd ~/Desktop/medical-practice-workspace

# Copy core documentation
cp WORKSPACE_GUIDE.md ../shared-resources/documentation/
cp WORKSPACE_ARCHITECTURE.md ../shared-resources/documentation/
cp HIPAA-COMPLIANCE-DATA-BOUNDARY.md ../shared-resources/documentation/
cp MCP_ECOSYSTEM.md ../shared-resources/documentation/
cp SECURITY_BEST_PRACTICES.md ../shared-resources/documentation/

# Copy template documentation
cp templates-and-patterns/MCP-DEVELOPMENT-STANDARD.md ../shared-resources/documentation/
cp docs/TEMPLATE_MANAGEMENT.md ../shared-resources/documentation/
```

### Step 3: Copy Templates

```bash
cd ~/Desktop/medical-practice-workspace/templates-and-patterns

# Copy all template directories
cp -r mcp-server-templates ../shared-resources/templates/mcp-servers/
cp -r simple-templates ../shared-resources/templates/simple/
cp -r project-structure-templates ../shared-resources/templates/project-structure/
cp -r tools-templates ../shared-resources/templates/tools/
```

### Step 4: Copy Claude Commands

```bash
cd ~/Desktop/medical-practice-workspace/.claude/commands

# Copy shared commands
cp start.md ../../../shared-resources/commands/
cp git.md ../../../shared-resources/commands/
cp quickprompt.md ../../../shared-resources/commands/
cp mcp-list.md ../../../shared-resources/commands/
```

### Step 5: Create Symlinks in medical-practice-workspace

```bash
cd ~/Desktop/medical-practice-workspace

# Create symlink to shared-resources
ln -s ../shared-resources shared-resources

# Verify
ls -la shared-resources
# Expected: symlink → ../shared-resources
```

### Step 6: Create Symlinks in medical-patient-data

```bash
cd ~/Desktop/medical-patient-data

# Create symlink to shared-resources
ln -s ../shared-resources shared-resources

# Create symlink to projects-in-development
ln -s ../medical-practice-workspace/projects-in-development projects-in-development

# Create symlink to shared commands
mkdir -p .claude
ln -s ../../shared-resources/commands .claude/shared-commands

# Verify
ls -la shared-resources
ls -la projects-in-development
ls -la .claude/shared-commands
```

### Step 7: Install PHI Guard Pre-Commit Hook

```bash
cd ~/Desktop/medical-patient-data

# PHI Guard hook should already exist in .git/hooks/pre-commit
# If not, copy from medical-practice-workspace:
cp ../medical-practice-workspace/.git/hooks/pre-commit .git/hooks/

# Make executable
chmod +x .git/hooks/pre-commit

# Test PHI Guard
echo "SSN: 123-45-6789" > temp/phi-test.txt
git add temp/phi-test.txt
git commit -m "PHI test"
# Expected: ❌ Commit blocked

# Clean up
rm temp/phi-test.txt
git reset HEAD temp/phi-test.txt
```

### Step 8: Install Node Dependencies (medical-patient-data)

```bash
cd ~/Desktop/medical-patient-data

# Install dependencies
npm install

# Verify installation
npm list --depth=0
# Expected: @google/generative-ai, dotenv, typescript, etc.
```

### Step 9: Configure MCP Servers (Global)

MCPs are configured globally in `~/.claude.json`. Verify the configuration points to the correct paths:

```bash
# Check MCP configuration
cat ~/.claude.json | grep mcp-infrastructure

# Expected output should show paths like:
# /Users/mmaruthurnew/Desktop/mcp-infrastructure/local-instances/mcp-servers/...
```

**If paths are incorrect (e.g., pointing to old workspace location):**

```bash
# Backup current config
cp ~/.claude.json ~/.claude.json.backup

# Edit config to point to mcp-infrastructure
vim ~/.claude.json

# Update all MCP server paths:
# From: /Users/mmaruthurnew/Desktop/medical-practice-workspace/local-instances/mcp-servers/...
# To:   /Users/mmaruthurnew/Desktop/mcp-infrastructure/local-instances/mcp-servers/...
```

### Step 10: Configure Gemini API

```bash
cd ~/Desktop/medical-patient-data

# Copy environment template
cp .env.example .env

# Edit .env and add your Gemini API key
vim .env
```

Add to `.env`:
```bash
GEMINI_API_KEY=your-gemini-api-key-here
GOOGLE_CLOUD_PROJECT=your-project-id
NODE_ENV=development
```

**To get Gemini API key:**
1. Visit https://aistudio.google.com/app/apikey
2. Sign in with Google Workspace account
3. Create API key under your organization's project
4. **IMPORTANT:** Ensure project is covered under Google Workspace BAA
5. Copy key to `.env` file

### Step 11: Test Gemini Integration

```bash
cd ~/Desktop/medical-patient-data

# Test basic connectivity
npm run test
# Expected: ✅ Gemini API connection successful

# Test patient inquiry classifier
npm run classify
# Expected: Classification examples with audit logging

# Test PHI de-identification
npm run deidentify
# Expected: De-identification examples
```

### Step 12: Verify Complete Setup

Run all verification checks:

```bash
cd ~/Desktop/medical-patient-data

# 1. Check shared resources
ls shared-resources/documentation/
# Expected: 7 files (WORKSPACE_GUIDE.md, etc.)

# 2. Check templates
ls shared-resources/templates/mcp-servers/
# Expected: 24+ MCP templates

# 3. Check projects access
ls projects-in-development/
# Expected: Plant Baby Project, Google Sheets Projects, etc.

# 4. Check PHI Guard
git commit --dry-run
# Expected: No errors (hook exists)

# 5. Check MCP access (in Claude Code)
# Open Claude Code and ask: "List all available MCPs"
# Expected: 26 MCPs listed

# 6. Check Gemini API
npm run test
# Expected: ✅ Success

# 7. Manual PHI scan
npm run scan-phi:workspace
# Expected: ✅ No PHI detected (assuming clean workspace)
```

**✅ Full Setup Complete!** All three workspaces are configured and tested.

---

## Understanding the Architecture

### Workspace Roles

**1. medical-practice-workspace** (Claude Code)
- **Purpose:** AI development, MCP creation, templates, planning
- **AI Client:** Claude Code ONLY
- **PHI Policy:** ❌ NEVER allowed (no BAA with Anthropic)
- **What you do here:**
  - Create MCP servers
  - Write documentation
  - Plan projects
  - Collaborate on templates
  - NO patient data work

**2. medical-patient-data** (Gemini)
- **Purpose:** Patient workflows, clinical operations, Gemini AI
- **AI Client:** Gemini ONLY (via API)
- **PHI Policy:** ✅ ALLOWED (Google Workspace BAA covers Gemini)
- **What you do here:**
  - Build patient intake automation
  - Create clinical workflow scripts
  - Use Gemini for data classification
  - Work with patient data (under BAA)

**3. mcp-infrastructure** (Shared Tools)
- **Purpose:** Platform-agnostic MCP servers
- **AI Client:** Both Claude Code AND Gemini can use these
- **PHI Policy:** ❌ NO PHI in code (pure logic only)
- **What you do here:**
  - Build/maintain MCP servers
  - Update shared tools
  - NOT workspace-specific work

### Shared Resources Sync

**What's Shared:**
- Documentation (7 guides, 145KB)
- Templates (37+ templates)
- Commands (4 Claude commands)

**How Sync Works:**
```bash
# Edit in medical-practice-workspace
cd ~/Desktop/medical-practice-workspace
vim shared-resources/documentation/WORKSPACE_GUIDE.md

# Changes immediately visible in medical-patient-data!
cd ~/Desktop/medical-patient-data
cat shared-resources/documentation/WORKSPACE_GUIDE.md
# Same content!
```

**Architecture:** Symlinks point to `~/Desktop/shared-resources/` (single source of truth)

### PHI Protection

**5 Layers of Protection:**

1. **Workspace Separation**
   - medical-practice-workspace = NO PHI
   - medical-patient-data = PHI ALLOWED
   - Physical isolation

2. **PHI Guard (Pre-Commit Hook)**
   - Scans before `git commit`
   - Detects 18 HIPAA identifiers
   - Blocks commits with PHI

3. **De-identification Utilities**
   - Safe Harbor method
   - Removes all HIPAA identifiers
   - Run with: `npm run deidentify`

4. **Audit Logging**
   - All PHI access logged
   - Timestamped, user-tracked
   - Query with: `npm run audit`

5. **Gitignore Protection**
   - PHI patterns excluded
   - Credentials excluded
   - Audit logs excluded

---

## Daily Workflow

### Morning Startup

```bash
# 1. Check for new shared resources
cd ~/Desktop/medical-patient-data
ls shared-resources/documentation/
# Any new guides added?

# 2. Pull latest changes (all three workspaces)
cd ~/Desktop/medical-practice-workspace && git pull
cd ~/Desktop/medical-patient-data && git pull
cd ~/Desktop/mcp-infrastructure && git pull

# 3. Check team activity (if workspace-sync-mcp is configured)
# In Claude Code: "Show team activity"
```

### Working on Projects

**Development Work (NO PHI):**
```bash
cd ~/Desktop/medical-practice-workspace
# Work on templates, MCP servers, documentation
```

**Patient Data Work (PHI ALLOWED):**
```bash
cd ~/Desktop/medical-patient-data
# Work on Gemini workflows, patient automation
# PHI Guard protects you from accidentally committing PHI
```

**Accessing Development Projects from Patient Workspace:**
```bash
cd ~/Desktop/medical-patient-data
cd projects-in-development/google-sheets-projects/
# Edit files here (changes go to medical-practice-workspace)
```

### Committing Changes

**Standard Commit (PHI-Free):**
```bash
git add .
git commit -m "Add feature"
# PHI Guard scans automatically
```

**If PHI is Detected:**
```bash
# PHI Guard blocks commit
# Fix: Remove PHI or de-identify

npm run deidentify  # Use de-identification tool
# OR
vim flagged-file.txt  # Manually remove PHI

git add .
git commit -m "Add feature (PHI removed)"
```

**Manual PHI Scan (Before Committing):**
```bash
npm run scan-phi:workspace  # Scan entire workspace
npm run scan-phi:projects   # Scan projects-in-development only
```

### Using MCP Tools

**In Claude Code (medical-practice-workspace):**
```
You: "List all available MCPs"
Claude: [Shows 26 MCPs]

You: "Create a new goal for patient intake"
Claude: [Uses project-management MCP]

You: "Help me commit these changes"
Claude: [Uses git-assistant MCP]
```

**Available MCPs:**
- project-management (goals, roadmaps)
- task-executor (workflows)
- security-compliance-mcp (PHI scanning)
- workspace-brain (analytics)
- git-assistant (Git workflows)
- And 21 more...

---

## HIPAA Compliance Training

**CRITICAL:** Read these documents before working with patient data:

1. **HIPAA-COMPLIANCE-DATA-BOUNDARY.md** ← Start here
   - Data boundary rules
   - What PHI is (18 identifiers)
   - Workspace separation policy

2. **03-resources-docs-assets-tools/HIPAA-COMPLIANCE-GUIDE.md**
   - Complete HIPAA guide
   - Security controls
   - Audit logging requirements

3. **03-resources-docs-assets-tools/HIPAA-INTEGRATION-PATTERNS.md**
   - 10 HIPAA patterns
   - How to build compliant workflows
   - Example implementations

4. **PHI-GUARD-README.md**
   - How PHI Guard works
   - What to do if PHI is detected
   - Bypassing (only when safe)

**Key Rules:**
- ❌ NEVER commit real patient data to git
- ❌ NEVER use patient data in medical-practice-workspace
- ✅ ALWAYS use synthetic data for testing
- ✅ ALWAYS scan for PHI before committing
- ✅ ALWAYS log PHI access (audit logs)
- ✅ ALWAYS de-identify when possible

---

## Troubleshooting

### Symlinks Broken

```bash
# Check symlink
ls -la shared-resources
# If shows "broken link" or error:

# Recreate symlink
rm shared-resources
ln -s ../shared-resources shared-resources
```

### MCP Not Found

```bash
# Check MCP config
cat ~/.claude.json | grep <mcp-name>

# Verify MCP server exists
ls ~/Desktop/mcp-infrastructure/local-instances/mcp-servers/<mcp-name>/

# Restart Claude Code
# macOS: Cmd+Q, then reopen
```

### PHI Guard Not Running

```bash
# Check hook exists
ls -la .git/hooks/pre-commit

# Make executable
chmod +x .git/hooks/pre-commit

# Test manually
.git/hooks/pre-commit
```

### Gemini API Not Working

```bash
# Check .env file
cat .env | grep GEMINI_API_KEY

# Test API key validity
npm run test

# If invalid, get new key:
# https://aistudio.google.com/app/apikey
```

### Shared Resources Not Syncing

```bash
# Verify shared-resources directory exists
ls ~/Desktop/shared-resources/

# Verify symlinks in both workspaces
ls -la ~/Desktop/medical-practice-workspace/shared-resources
ls -la ~/Desktop/medical-patient-data/shared-resources

# Both should point to: ../shared-resources
```

---

## Getting Help

**Documentation:**
- [`README.md`](README.md) - Workspace overview
- [`WORKSPACE_GUIDE.md`](WORKSPACE_GUIDE.md) - Constitution and standards
- [`WORKSPACE_ARCHITECTURE.md`](WORKSPACE_ARCHITECTURE.md) - Complete architecture
- [`PHI-GUARD-README.md`](PHI-GUARD-README.md) - PHI Guard guide
- `shared-resources/documentation/` - All shared guides

**Team Communication:**
- Workspace-sync MCP (if configured)
- GitHub Issues
- Slack/Discord (if team has channel)

**For HIPAA Questions:**
- HIPAA Compliance Officer (to be designated)
- `HIPAA-COMPLIANCE-DATA-BOUNDARY.md`
- `03-resources-docs-assets-tools/HIPAA-COMPLIANCE-GUIDE.md`

---

## Next Steps After Onboarding

1. **Read WORKSPACE_GUIDE.md**
   ```bash
   cat shared-resources/documentation/WORKSPACE_GUIDE.md
   ```

2. **Explore Projects**
   ```bash
   ls projects-in-development/
   cd projects-in-development/google-sheets-projects/
   ```

3. **Try Gemini Examples**
   ```bash
   npm run classify  # Patient inquiry classification
   ```

4. **Review Templates**
   ```bash
   ls shared-resources/templates/mcp-servers/
   ```

5. **Join Team Sync** (if configured)
   - Post your first message
   - Check team status

---

## Checklist: Onboarding Complete

- [ ] All three workspaces cloned
- [ ] `~/Desktop/shared-resources/` created
- [ ] Symlinks created in both workspaces
- [ ] PHI Guard pre-commit hook installed and tested
- [ ] Node dependencies installed
- [ ] Gemini API key configured
- [ ] Gemini connectivity tested (npm run test)
- [ ] MCP servers accessible (26 MCPs)
- [ ] PHI scanning tested (npm run scan-phi)
- [ ] Read HIPAA-COMPLIANCE-DATA-BOUNDARY.md
- [ ] Read WORKSPACE_GUIDE.md
- [ ] Understand workspace separation (NO PHI in medical-practice-workspace)

**✅ Onboarding Complete!** Welcome to the team, Alvaro! 🎉

---

**Last Updated:** 2025-11-08
**Team Members:** You + Alvaro + [Others]
**Support:** See "Getting Help" section above

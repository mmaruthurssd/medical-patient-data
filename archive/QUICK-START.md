---
type: guide
tags: [quickstart, setup, onboarding]
---

# Quick Start Guide

**Purpose:** Get up and running with medical-patient-data workspace in 15 minutes

---

## Prerequisites

- Node.js 18+ installed
- Git configured
- Access to operations-workspace
- Google Cloud account (for Gemini API)

---

## Step 1: Verify Workspace Structure

```bash
cd ~/Desktop/medical-patient-data
ls -la
```

You should see:
```
01-planning-and-roadmap/
02-goals-and-roadmap/
03-resources-docs-assets-tools/
04-product-under-development/
05-testing-and-validation/
06-deployment-and-release/
07-operations-and-maintenance/
08-archive/
.ai-planning/
brainstorming/
configuration/
temp/
README.md
EVENT_LOG.md
NEXT_STEPS.md
.gitignore
```

---

## Step 2: Set Up Gemini API

### Get API Key

1. Go to https://makersuite.google.com/app/apikey
2. Create new API key
3. Copy the key

### Configure Environment

```bash
cd ~/Desktop/medical-patient-data
cp .env.example .env  # (will create after this guide)
```

Add to `.env`:
```bash
GEMINI_API_KEY=your-api-key-here
```

**Important:** Never commit `.env` to git!

---

## Step 3: Verify MCP Access

All MCPs are hosted in `~/Desktop/mcp-infrastructure` and configured globally.

Test access:
```bash
# From operations-workspace
cd ~/Desktop/operations-workspace

# Verify MCPs loaded (should show 24+ servers)
# This happens automatically when you use Claude Code
```

---

## Step 4: Read Key Documentation

**Must Read:**
1. `README.md` - Workspace overview
2. `03-resources-docs-assets-tools/HIPAA-COMPLIANCE-GUIDE.md` - CRITICAL for PHI handling
3. `NEXT_STEPS.md` - Current priorities

**Reference:**
- `~/Desktop/operations-workspace/WORKSPACE_ARCHITECTURE.md` - Full system architecture
- `~/Desktop/operations-workspace/planning-and-roadmap/three-workspace-architecture.md` - Workspace design

---

## Step 5: Enable Security Scanning (CRITICAL)

### Install Pre-Commit Hooks

```bash
cd ~/Desktop/medical-patient-data

# Install hooks using security-compliance-mcp
# (From operations-workspace with Claude Code)
```

Hooks will:
- Scan for credentials before each commit
- Scan for PHI before each commit
- Block commits with violations

---

## Step 6: Your First Gemini Integration

Create a test script:

```bash
mkdir -p 04-product-under-development/gemini-examples
cd 04-product-under-development/gemini-examples
```

Create `test-gemini.ts`:

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';

dotenv.config();

async function testGemini() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = 'What are the key considerations for HIPAA-compliant AI applications?';
  const result = await model.generateContent(prompt);
  const response = result.response;

  console.log('Response:', response.text());
}

testGemini().catch(console.error);
```

Install dependencies:
```bash
npm init -y
npm install @google/generative-ai dotenv
npm install --save-dev typescript @types/node
npx tsc --init
```

Run:
```bash
npx ts-node test-gemini.ts
```

---

## Step 7: Create Your First Goal

Use project-management MCP:

```typescript
// From operations-workspace with Claude Code:
// "Create a potential goal for patient intake automation"
```

This creates a goal in `02-goals-and-roadmap/potential-goals/`

---

## Common Commands

### MCP Tools (from operations-workspace)

```bash
# Create task workflow
task-executor.create_workflow(...)

# Track progress
task-executor.get_workflow_status(...)

# Scan for PHI
security-compliance-mcp.scan_for_phi(...)

# Check HIPAA compliance
security-compliance-mcp.manage_hooks('status')
```

### Git Workflow

```bash
# Check status
git status

# Add files (hooks will scan automatically)
git add .

# Commit (if no PHI/credentials detected)
git commit -m "Add patient workflow"

# Push to GitHub (after repo created)
git push origin main
```

---

## Next Steps

1. **Set up Gemini API** - Get your API key
2. **Review HIPAA guide** - Understand PHI requirements
3. **Install pre-commit hooks** - Enable automatic scanning
4. **Create first goal** - Use project-management MCP
5. **Build first integration** - Test Gemini API

See `NEXT_STEPS.md` for detailed roadmap.

---

## Troubleshooting

### MCP Not Loading

MCPs are in `~/Desktop/mcp-infrastructure` and configured in `~/.claude.json`.
They should load automatically in Claude Code.

### Gemini API Errors

- Verify API key in `.env`
- Check quota: https://console.cloud.google.com/
- Review error message for rate limits

### PHI Detected in Commit

Pre-commit hook blocked the commit. Review the file and:
1. Remove any real patient data
2. Use synthetic/de-identified data instead
3. Add file to `.gitignore` if it must contain PHI

### Need Help?

1. Check `03-resources-docs-assets-tools/` documentation
2. Review `~/Desktop/operations-workspace/WORKSPACE_GUIDE.md`
3. Use workspace-brain MCP for pattern matching

---

**Last Updated:** 2025-11-08

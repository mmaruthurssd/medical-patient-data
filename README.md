---
type: readme
tags: [workspace, gemini-ai, patient-data, hipaa-compliance]
---

# Medical Patient Data Workspace

**Purpose:** Gemini AI-powered patient data management and workflow automation for medical practice

**Status:** 🚧 Under Development

---

## Overview

This workspace houses Gemini AI integrations, patient data workflows, and HIPAA-compliant automation systems for medical practice management.

### Key Focus Areas
- **Gemini AI Integration** - Google's Gemini API for intelligent data processing
- **Patient Data Workflows** - Automated patient intake, scheduling, and record management
- **HIPAA Compliance** - PHI protection, audit logging, and secure data handling
- **Google Sheets Automation** - Apps Script-based practice management systems

### Three-Workspace Architecture

This is one of three specialized workspaces:

1. **medical-practice-workspace** - AI development platform, MCP orchestration, project management
2. **mcp-infrastructure** - 26 production MCP servers (shared infrastructure)
3. **medical-patient-data** (this workspace) - Gemini AI + patient data workflows

---

## Workspace Structure

```
medical-patient-data/
├── 01-planning-and-roadmap/     # Strategic planning and project roadmaps
├── 02-goals-and-roadmap/         # Active goals and milestones
├── 03-resources-docs-assets-tools/ # Documentation, guides, and tools
├── 04-product-under-development/ # Active development work
├── 05-testing-and-validation/   # Testing frameworks and validation
├── 06-deployment-and-release/   # Deployment pipelines and releases
├── 07-operations-and-maintenance/ # Operational workflows and monitoring
├── 08-archive/                   # Completed projects and historical data
├── .ai-planning/                 # AI workflow orchestration state
├── brainstorming/               # Ideas and exploration
├── configuration/               # Configuration files
└── temp/                        # Temporary working files
```

---

## Getting Started

### Prerequisites
- Node.js 18+ (for Apps Script development)
- Google Cloud Project with Gemini API enabled
- Clasp CLI for Apps Script deployment
- Access to medical-practice-workspace for MCP tools

### Initial Setup

1. **Configure Gemini API**
   ```bash
   # Set up Google Cloud credentials
   export GEMINI_API_KEY="your-api-key"
   ```

2. **Link to MCP Infrastructure**
   - MCPs are hosted in `~/Desktop/mcp-infrastructure`
   - Configuration managed in `~/.claude.json`
   - No local MCP installation needed

3. **Review HIPAA Compliance**
   - See `03-resources-docs-assets-tools/HIPAA-COMPLIANCE-GUIDE.md`
   - PHI handling requirements
   - Data retention policies

---

## Security & Compliance

⚠️ **HIPAA-Protected Workspace** ⚠️

This workspace handles Protected Health Information (PHI):
- Never commit PHI to git
- Use environment variables for credentials
- Enable pre-commit security scanning
- Follow data minimization principles
- Maintain audit logs for all PHI access

---

## Development Workflow

### Using MCP Tools

All MCP tools are available from medical-practice-workspace:
- `project-management` - Goal and roadmap management
- `task-executor` - Task workflow tracking
- `security-compliance-mcp` - PHI scanning and credential detection
- `workspace-brain` - Learning and analytics
- 22 additional MCPs for development support

### Gemini AI Integration Pattern

```typescript
// Example: Using Gemini for patient data classification
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

// Classify patient inquiry
const result = await model.generateContent(inquiry);
```

---

## Related Repositories

- **medical-practice-workspace** - Main development workspace
- **mcp-infrastructure** - https://github.com/mmaruthurssd/mcp-infrastructure

---

## Documentation

- `01-planning-and-roadmap/` - Project plans and strategic documents
- `03-resources-docs-assets-tools/` - Technical guides and references
- `WORKSPACE_ARCHITECTURE.md` (in medical-practice-workspace) - Complete system architecture

---

## Support

For issues or questions:
1. Check documentation in `03-resources-docs-assets-tools/`
2. Review workspace-brain learning patterns
3. Consult HIPAA compliance guide for PHI-related questions

---

**Last Updated:** 2025-11-08
**Workspace Version:** 1.0.0
**Architecture:** Three-Workspace System

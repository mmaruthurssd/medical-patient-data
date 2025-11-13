---
type: guide
tags: [HIPAA, compliance, data-boundary, PHI, Gemini, Claude]
---

# HIPAA Compliance Data Boundary

**Status:** 🔴 CRITICAL COMPLIANCE REQUIREMENT
**Last Updated:** 2025-11-08
**Compliance Officer:** [Your Name]

## Executive Summary

Due to lack of Business Associate Agreement (BAA) with Anthropic, **Claude Code cannot access any Protected Health Information (PHI)**. All PHI operations must use Gemini (covered by Google BAA).

## BAA Status

| Provider | Service | BAA Status | PHI Allowed? |
|----------|---------|------------|--------------|
| Google | Google Workspace (Drive, Sheets, Apps Script, Gemini) | ✅ Active | ✅ YES |
| Anthropic | Claude Code | ❌ No BAA (inquiry rejected/ignored) | ❌ NO |

## Data Boundary Rules

### ✅ ALLOWED: Claude Code Operations (This Workspace)

**This workspace is a PHI-FREE ZONE.**

Claude Code can work with:
- ✅ MCP server development (platform-agnostic TypeScript/Python code)
- ✅ Documentation, planning documents, roadmaps
- ✅ Non-PHI automation logic (workflow templates, system design)
- ✅ Testing with **synthetic or anonymized data ONLY**
- ✅ Infrastructure code (deployment scripts, configuration)
- ✅ Template creation (Apps Script templates without real patient data)

**Current PHI Status:** Scanned 2025-11-08 - **CLEAN** ✅

### ❌ PROHIBITED: Claude Code Operations

Claude Code must NEVER:
- ❌ Read Google Drive files containing patient information
- ❌ Access Google Sheets with PHI (patient lists, clinical data, billing)
- ❌ Execute Apps Script that touches real patient data
- ❌ Generate code that directly references specific patient cases
- ❌ Analyze clinical workflows with real patient examples
- ❌ Test automations against production data

**Violation = HIPAA breach + potential fines + patient harm**

### ✅ REQUIRED: Gemini Operations (Google Workspace)

All PHI operations must use Gemini:
- ✅ Reading/writing Google Drive clinical documents
- ✅ Apps Script execution in Sheets with patient data
- ✅ Patient data analysis, reporting, automation
- ✅ Clinical workflow automation with real cases
- ✅ Any operation touching actual patient information

**Why:** Google BAA covers Gemini when used within Google Workspace.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ NON-PHI ZONE: operations-workspace/                  │
│                                                             │
│ Client: Claude Code ONLY                                   │
│ PHI Status: ZERO PHI (audited monthly)                     │
│                                                             │
│ Operations:                                                 │
│ • Develop MCP servers (git-assistant, smart-file-org, etc) │
│ • Plan workflows, document systems                          │
│ • Create reusable templates                                 │
│ • Test with synthetic data                                  │
│                                                             │
│ MCP Servers:                                                │
│ • 17 production servers in local-instances/mcp-servers/     │
│ • Platform-agnostic (work with Claude OR Gemini)           │
│ • No PHI in server code (pure logic)                        │
└─────────────────────────────────────────────────────────────┘
                           ↕
                   MCP Protocol (stdio)
                   (No PHI transmitted)
                           ↕
┌─────────────────────────────────────────────────────────────┐
│ PHI ZONE: Google Workspace                                 │
│                                                             │
│ Client: Gemini ONLY                                         │
│ PHI Status: ALL patient data lives here                     │
│ BAA: Active with Google                                     │
│                                                             │
│ Operations:                                                 │
│ • Read/write Drive files with patient data                  │
│ • Execute Apps Script accessing Sheets with PHI             │
│ • Generate clinical reports                                 │
│ • Automate patient workflows                                │
│                                                             │
│ Same MCP Servers:                                           │
│ • Gemini client connects to same 17 MCP servers             │
│ • MCPs execute operations under Google BAA                  │
│ • Audit logging for all PHI access                          │
└─────────────────────────────────────────────────────────────┘
```

## How It Works

### Example: Apps Script Automation

**Scenario:** Generate Apps Script to automate patient appointment reminders

**❌ WRONG (HIPAA Violation):**
```
User: "Claude, read my patient list in Google Sheets
       and generate reminders for appointments this week"

Claude Code: [reads Google Sheets with PHI] ← VIOLATION!
```

**✅ CORRECT (HIPAA Compliant):**
```
User in Claude Code: "Design template for appointment reminder system"
Claude Code: [creates generic Apps Script template, no PHI]
              [stores template in templates-and-patterns/]

User in Gemini: "Use this template with my patient appointment sheet"
Gemini: [connects to same MCP servers]
        [reads actual patient data under Google BAA]
        [generates and deploys script with real data]
```

### Example: MCP Development

**✅ CORRECT (Development in Claude Code):**
```
User: "Create MCP server for Google Sheets automation"
Claude Code: [builds MCP in development/mcp-servers/]
             [uses synthetic test data]
             [deploys to local-instances/ when ready]
             [NO PHI involved - pure code]
```

**✅ CORRECT (Production Use in Gemini):**
```
User in Gemini: "Use google-sheets-mcp to analyze patient census"
Gemini: [connects to google-sheets-mcp server]
        [MCP reads real patient data under Google BAA]
        [returns analysis to Gemini]
```

## Compliance Monitoring

### Monthly PHI Audit
```bash
# Run on 1st of each month
npm run scan:phi
```

Scans entire workspace for PHI exposure. Must return CLEAN status.

### Quarterly Review
- Review this document for accuracy
- Verify BAA status hasn't changed
- Update team on any policy changes
- Audit Gemini client audit logs

### Annual Certification
- Full HIPAA compliance review
- Update security risk assessment
- Renew Google BAA (if needed)

## Team Guidelines

### For Developers
1. **Never commit PHI** to this workspace (git pre-commit hooks scan)
2. **Use synthetic data** for testing (see templates-and-patterns/test-data/)
3. **Ask before connecting** new data sources
4. **Document PHI boundaries** in README for each project

### For Clinical Staff
1. **Use Gemini** for anything involving patient data
2. **Use Claude Code** for planning/templates only
3. **When in doubt, ask** before sharing data
4. **Report incidents** immediately if PHI exposed to Claude

## Incident Response

If PHI accidentally exposed to Claude Code:

1. **STOP immediately** - don't continue the conversation
2. **Document the incident** - what data, when, how
3. **Notify compliance officer** within 24 hours
4. **Assess breach severity** - identifiable patient info?
5. **Report if required** - OCR notification if ≥500 patients or significant harm
6. **Remediate** - fix process to prevent recurrence

## Questions?

**Q: Can I use Claude Code to design workflows that will eventually use PHI?**
A: Yes! Design templates, logic, and code structure with Claude Code using synthetic data. Then deploy with Gemini using real data.

**Q: Can MCP servers contain PHI?**
A: No. MCPs are pure logic. They can *process* PHI when called by Gemini client, but the server code itself must be PHI-free.

**Q: What if Anthropic offers BAA in the future?**
A: Update this document, test compliance controls, then cautiously expand Claude Code's data access.

**Q: Can I copy-paste patient info into Claude Code for quick analysis?**
A: **ABSOLUTELY NOT.** This is a HIPAA violation. Use Gemini for all PHI operations.

## References

- [HIPAA Security Rule](https://www.hhs.gov/hipaa/for-professionals/security/index.html)
- [Google Workspace BAA](https://cloud.google.com/terms/hipaa)
- [Anthropic Claude Enterprise (BAA-eligible)](https://www.anthropic.com/enterprise)
- Workspace PHI Scanner: `security-compliance-mcp/scan_for_phi`

---

**Remember:** When in doubt, assume it's PHI and use Gemini. Better safe than a $50,000 HIPAA fine.

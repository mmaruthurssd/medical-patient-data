# Learning Optimizer MCP Configuration Analysis - Documentation Index

This directory contains a comprehensive analysis of the Learning Optimizer MCP server implementation, focusing on how it loads and manages domain configurations.

## Documentation Files

### 1. ANALYSIS-SUMMARY.md (This is your starting point)
**Quick overview of the entire analysis**
- What was analyzed and why
- Key findings summarized
- Configuration loading flow diagram
- Environment variables at a glance
- Domain structure overview
- Critical configuration details
- Common mistakes and how to avoid them
- Where to find actual server files

**Start here:** Read this first for a 5-minute overview.

### 2. LEARNING-OPTIMIZER-CONFIG-ANALYSIS.md (Detailed technical reference)
**Deep dive into implementation and architecture**
- Complete server architecture and file structure
- Two-level configuration system explained
- Environment variables and defaults
- Complete configuration loading mechanism
- Full DomainConfig interface documentation
- Current configurations in operations workspace
- Actual configuration loading code (copy-pasted)
- Server initialization flow (with line numbers)
- How domains are used by all 13 MCP tools
- Key configuration features and validation
- Step-by-step setup guide
- Critical configuration details
- Common mistakes with examples
- Configuration validation chain
- Key takeaways and best practices

**Use this for:** In-depth understanding and troubleshooting

### 3. LEARNING-OPTIMIZER-QUICK-REFERENCE.md (Lookup guide)
**Quick reference for implementation details**
- Files overview table
- Configuration chain diagram
- Environment variables quick reference
- Minimal vs. full domain configuration examples
- How configuration is used (code examples)
- Validation rules at a glance
- Current configurations inventory
- Key implementation details
- Common gotchas and their fixes (quick lookup)
- Step-by-step: how to add a new domain
- Testing and validation commands
- Performance notes
- Source code line references

**Use this for:** Quick lookups while coding or configuring

## Quick Navigation Guide

### I want to understand...

**How configuration files are loaded:**
- Start: ANALYSIS-SUMMARY.md, section "Configuration Loading Flow"
- Deep dive: LEARNING-OPTIMIZER-CONFIG-ANALYSIS.md, sections 2-6
- Code: LEARNING-OPTIMIZER-QUICK-REFERENCE.md, line references

**Environment variables:**
- Quick: LEARNING-OPTIMIZER-QUICK-REFERENCE.md, "Environment Variables"
- Full: LEARNING-OPTIMIZER-CONFIG-ANALYSIS.md, section 3
- Summary: ANALYSIS-SUMMARY.md, section 3

**Domain configuration structure:**
- Minimal example: LEARNING-OPTIMIZER-QUICK-REFERENCE.md, "Minimal Valid Config"
- Full structure: LEARNING-OPTIMIZER-QUICK-REFERENCE.md, "Full Config"
- Detailed explanation: LEARNING-OPTIMIZER-CONFIG-ANALYSIS.md, section 4

**How to set up a new domain:**
- Quick steps: LEARNING-OPTIMIZER-QUICK-REFERENCE.md, "How to Add a New Domain"
- Detailed guide: LEARNING-OPTIMIZER-CONFIG-ANALYSIS.md, section 10
- Verification: LEARNING-OPTIMIZER-QUICK-REFERENCE.md, "Testing Configuration"

**What went wrong (troubleshooting):**
- Common issues: LEARNING-OPTIMIZER-QUICK-REFERENCE.md, "Common Gotchas"
- Detailed mistakes: LEARNING-OPTIMIZER-CONFIG-ANALYSIS.md, section 12

**Code locations and line numbers:**
- File structure: LEARNING-OPTIMIZER-CONFIG-ANALYSIS.md, section 1
- Source references: LEARNING-OPTIMIZER-QUICK-REFERENCE.md, "Source Code References"

## Key Concepts Summary

### Configuration Chain
```
mcp.json (VS Code)
  ↓ (sets env vars)
server.ts (reads env vars)
  ↓ (creates DomainConfigLoader)
domain-config.ts (scans directory)
  ↓ (finds .json files)
*.json (domain configs)
  ↓ (parsed & validated)
In-Memory Map (O(1) lookup)
  ↓ (used by tools)
MCP Tools (track_issue, optimize_knowledge_base, etc.)
```

### Environment Variables
- `LEARNING_OPTIMIZER_PROJECT_ROOT` - Workspace root (default: cwd)
- `LEARNING_OPTIMIZER_CONFIG_DIR` - Directory of domain configs (default: PROJECT_ROOT/learning-optimizer-configs)

### Required Domain Config Fields
1. `domain` - Unique identifier
2. `displayName` - Human-readable name
3. `description` - What it tracks
4. `knowledgeBaseFile` - Path to .md file
5. `optimizationTriggers` - Object with highImpactThreshold, technicalDebtThreshold, enableDuplicateDetection
6. `categories` - Array of {name, description, keywords}

### Validation
- Happens during `loadAllConfigs()` at server startup
- Checks for required fields
- Continues on error (logs, skips that config)
- Does NOT check if knowledge base files exist

### Domain Lookup
- All MCP tools call `configLoader.getConfig(domain)`
- Returns DomainConfig object or undefined
- O(1) performance (Map lookup)

## Absolute File Paths

### Server Implementation
- Server: `/Users/mmaruthurnew/Desktop/operations-workspace/templates-and-patterns/mcp-server-templates/templates/learning-optimizer-mcp-server-template/src/server.ts`
- Loader: `/Users/mmaruthurnew/Desktop/operations-workspace/templates-and-patterns/mcp-server-templates/templates/learning-optimizer-mcp-server-template/src/domain-config.ts`
- Types: `/Users/mmaruthurnew/Desktop/operations-workspace/templates-and-patterns/mcp-server-templates/templates/learning-optimizer-mcp-server-template/src/types.ts`
- Template: `/Users/mmaruthurnew/Desktop/operations-workspace/templates-and-patterns/mcp-server-templates/templates/learning-optimizer-mcp-server-template/`

### Current Domain Configurations
- Location: `/Users/mmaruthurnew/Desktop/operations-workspace/configuration/learning-optimizer-configs/`
- mcp-installation.json
- google-sheets.json
- github-actions-setup.json
- template.json

### Analysis Documents (Generated)
- `/Users/mmaruthurnew/Desktop/medical-patient-data/ANALYSIS-SUMMARY.md`
- `/Users/mmaruthurnew/Desktop/medical-patient-data/LEARNING-OPTIMIZER-CONFIG-ANALYSIS.md`
- `/Users/mmaruthurnew/Desktop/medical-patient-data/LEARNING-OPTIMIZER-QUICK-REFERENCE.md`
- `/Users/mmaruthurnew/Desktop/medical-patient-data/README-LEARNING-OPTIMIZER-ANALYSIS.md` (this file)

## How to Use This Documentation

### For Quick Answers
Use LEARNING-OPTIMIZER-QUICK-REFERENCE.md - it's organized by topic with examples.

### For Complete Understanding
Read LEARNING-OPTIMIZER-CONFIG-ANALYSIS.md - it has everything with code samples and line references.

### For Getting Started
1. Read ANALYSIS-SUMMARY.md overview
2. Check LEARNING-OPTIMIZER-QUICK-REFERENCE.md for your specific need
3. Drill into LEARNING-OPTIMIZER-CONFIG-ANALYSIS.md for details

### For Troubleshooting
1. Check "Common Gotchas" in LEARNING-OPTIMIZER-QUICK-REFERENCE.md
2. See "Common Configuration Mistakes" in LEARNING-OPTIMIZER-CONFIG-ANALYSIS.md
3. Use "Testing Configuration" section in QUICK-REFERENCE.md

## Server Overview

**Name:** Learning Optimizer MCP Server
**Version:** 1.0.1 (with Mitigation Strategy)
**Purpose:** Domain-agnostic troubleshooting optimization system that learns from issues and prevents technical debt

**Provides:**
- Auto-learning from issues with frequency tracking
- Duplicate detection and merging
- Smart categorization by keywords
- Human review workflow for promotions
- Quality & confidence scoring
- Temporal distribution tracking
- Multi-domain support
- 13 MCP tools for issue tracking and optimization

**Configuration Method:**
- All behavior driven by JSON configuration files
- No code changes needed to add domains
- Each domain defines its own rules, categories, and thresholds

## Additional Resources

For more information:
- Server README: See learning-optimizer-mcp-server-template/README.md
- Installation Guide: See learning-optimizer-mcp-server-template/INSTALL-INSTRUCTIONS.md
- Source Code: See learning-optimizer-mcp-server-template/src/

---

**Analysis Date:** November 13, 2025
**Analyzed By:** Claude Code File Search & Analysis
**Status:** Complete

These documents are comprehensive and self-contained. They reference specific line numbers and absolute file paths for easy cross-reference with the actual implementation.

# Custom Specialized Agents

This directory contains specifications for custom specialized agents that can be used with Claude Code's Task tool for specific workspace operations.

## What Are Custom Agents?

Custom agents are specialized task configurations that:
- Have pre-defined purposes and contexts
- Know what tools they have access to
- Include example usage patterns
- Provide consistent, efficient execution for common tasks

## Available Custom Agents

| Agent | Purpose | Priority | Version | Status |
|-------|---------|----------|---------|--------|
| `google-workspace-automation` | Execute Google Drive/Docs/Slides operations | 🥇 Highest | v1.0.0 | Active |
| `documentation-health` | Validate documentation consistency and health | 🥈 High | v1.0.0 | Active |
| `medical-compliance` | Scan for PHI leaks, ensure HIPAA compliance | 🥈 High (Critical for PHI) | v1.0.0 | Active |
| `project-setup` | Create standardized project structures | 🥉 Medium | v1.0.0 | Active |

## How to Use Custom Agents

When you need to perform specialized tasks, use the Task tool with prompts that reference these agent specifications:

```
User: "Create a folder structure for patient handouts"
AI: [Uses google-workspace-automation agent specification]

User: "Check our documentation for broken links"
AI: [Uses documentation-health agent specification]

User: "Scan the No PHI drive for any patient data"
AI: [Uses medical-compliance agent specification]

User: "Set up a new MCP project for email automation"
AI: [Uses project-setup agent specification]
```

## Dependency Tracking & Maintenance

Custom agents reference workflows and documentation files that may change over time. To keep agents in sync:

### Automatic Detection System

**How it works**:
1. When workflows are updated, I automatically check `agent-workflow-dependencies.json`
2. I identify which agents depend on the changed workflow
3. I suggest specific updates to affected agents
4. You review and approve the updates
5. Agents are updated and version numbers incremented

**Example**:
```
Workflow Updated: "Workflow 7: Copy Files" with new error handling

Affected Agents:
- google-workspace-automation (references Copy Files in operations list)

Suggested Updates:
- Update error handling section (lines 715-730)
- Add new example prompt for copy with error recovery
- Increment version to 1.1.0

Approve updates? (yes/no)
```

### Dependency Mapping

All agent dependencies are tracked in `agent-workflow-dependencies.json`:

**Dependencies tracked**:
- **Workflows**: Which workflow documents agents reference
- **Documentation**: Core docs like service account setup, Quick Reference
- **Configuration**: .env files with folder IDs and paths
- **Templates**: Project structure templates
- **External References**: HIPAA guidelines, API documentation

**Version tracking**:
- Each agent has a version number (semantic versioning)
- lastUpdated dates track when agents were last modified
- Dependency file shows which workflow versions agents use

### Maintenance Schedule

**After workflow updates**: Check for affected agents immediately
**Monthly**: Review all agents even without changes
**Quarterly**: Comprehensive health check of all dependencies

**See**: `AGENT-MAINTENANCE-GUIDE.md` for complete update procedures

### Dependency Map Overview

| Agent | Depends On | Key Dependencies |
|-------|-----------|------------------|
| **google-workspace-automation** | Workflows, Docs, Config | 12 Drive workflows, service account, folder IDs |
| **documentation-health** | Docs | WORKSPACE_GUIDE.md, WORKSPACE_ARCHITECTURE.md |
| **medical-compliance** | Docs, Config, External | Service account, HIPAA Safe Harbor identifiers |
| **project-setup** | Workflows, Docs, Templates | Folder creation workflow, project templates |

### Update Procedure

When you update a workflow or documentation file:

1. **I detect the change** by checking `agent-workflow-dependencies.json`
2. **I identify affected agents** from the dependency map
3. **I suggest specific updates** with old vs new content
4. **You approve** (or request modifications)
5. **I update agents** with new content
6. **I increment versions** and update lastUpdated dates
7. **I document changes** in maintenance logs

This ensures agents stay current with minimal manual tracking.

---

## Agent Specification Format

Each agent specification includes:
- **Purpose**: What the agent does
- **When to Use**: Trigger scenarios
- **Tools Available**: What tools the agent can use
- **Pre-configured Context**: Service accounts, paths, folder IDs
- **Example Prompts**: How to invoke the agent
- **Expected Outputs**: What the agent returns
- **Best Practices**: Usage guidelines

## Directory Structure

```
.claude/custom-agents/
├── README.md (this file)
├── google-workspace-automation.md
├── documentation-health.md
├── medical-compliance.md
└── project-setup.md
```

## Adding New Agents

To add a new custom agent:
1. Create a specification file following the template format
2. Add entry to the table above
3. Update WORKSPACE_GUIDE.md Quick Lookup Table
4. Test with example prompts

---

**Last Updated**: 2025-11-15
**Maintained By**: Workspace automation team

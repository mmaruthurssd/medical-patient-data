# Documentation Process

## Purpose

This document defines the **standard process** for documenting new workflows, automation systems, and workspace changes. Following this process ensures AI agents in new sessions can quickly understand the workspace and access accurate, up-to-date information.

## Why Documentation Matters

**For AI Continuity:**
- New AI sessions have no memory of previous work
- Documentation is the **only** persistent knowledge base
- Well-documented processes enable autonomous AI operations
- Reduces user repetition and clarification requests

**For Team Collaboration:**
- Team members can understand automation systems
- Onboarding new developers is faster
- Troubleshooting is more efficient
- Knowledge isn't locked in one person's head

## When to Document

Document whenever you:
- ✅ Create a new automation or workflow
- ✅ Modify authentication or credentials
- ✅ Grant service account new permissions
- ✅ Change system architecture
- ✅ Discover and resolve an issue
- ✅ Add new integration points
- ✅ Implement new safety mechanisms
- ✅ Create or modify GitHub Actions workflows
- ✅ Add new Google Sheets/Drive resources
- ✅ Establish new processes or guidelines

## Documentation Standards

### File Naming

Use clear, descriptive names with hyphens:
- ✅ `SERVICE-ACCOUNT.md`
- ✅ `DATA-PROTECTION.md`
- ✅ `WORKSPACE-MANAGEMENT.md`
- ❌ `serviceaccount.md`
- ❌ `docs.md`
- ❌ `temp_notes.txt`

### File Location

```
docs/
├── WORKSPACE-MANAGEMENT.md     # Central hub - always update
├── [SPECIFIC-TOPIC].md          # Topic-specific documentation
└── ISSUES.md                    # Issue tracking
```

### Document Structure

Every documentation file should include:

```markdown
# Title

## Purpose
[Why this document exists, what it covers]

## Overview
[High-level summary]

## Detailed Sections
[Main content organized logically]

## Related Documentation
[Links to other relevant docs]

---

**Last Updated:** YYYY-MM-DD
**Maintained By:** AI Assistant (Claude Code)
**Review Frequency:** [Monthly/Quarterly/When changes occur]
```

### Writing Style

- **Clear and concise** - Avoid jargon where possible
- **Actionable** - Include commands, code examples, step-by-step instructions
- **Searchable** - Use descriptive headers and keywords
- **Up-to-date** - Include timestamps and version information
- **Accessible** - Write for both AI agents and human readers

## Step-by-Step Process

### 1. Identify What Needs Documentation

Ask yourself:
- What did I just implement?
- What would a new AI agent need to know to work with this?
- What questions might someone ask about this?
- What could go wrong, and how do I fix it?

### 2. Choose the Right Documentation Type

| Type | When to Use | Location | Example |
|------|-------------|----------|---------|
| **Process Doc** | New workflow or automation | `docs/[NAME].md` | SERVICE-ACCOUNT.md |
| **Update Existing** | Modify existing system | Update relevant doc | Add to SYSTEM-ARCHITECTURE.md |
| **Issue Entry** | Bug or problem discovered | `docs/ISSUES.md` | Add new issue |
| **Quick Reference** | Common commands/tasks | Add to relevant doc | Add to AI-AGENT-ONBOARDING.md |
| **Architecture Change** | System design modification | `docs/SYSTEM-ARCHITECTURE.md` | Add integration point |

### 3. Create or Update Documentation

**For New Process Documentation:**

1. Create new file in `docs/` with descriptive name
2. Use standard structure (see above)
3. Include:
   - Purpose and overview
   - Step-by-step instructions
   - Code examples
   - Troubleshooting section
   - Links to related docs

**Example Template:**

```markdown
# [Process Name]

## Purpose
[Brief description of what this process does and why it exists]

## Prerequisites
- Requirement 1
- Requirement 2

## Step-by-Step Instructions

### Step 1: [Action]
```bash
# Commands
```
[Explanation]

### Step 2: [Action]
[Details]

## Troubleshooting

### Issue: [Problem]
**Solution:** [Fix]

## Related Documentation
- [Link to related doc]

---

**Last Updated:** YYYY-MM-DD
**Maintained By:** AI Assistant (Claude Code)
```

### 4. Update Central Documentation Hub

**ALWAYS update `docs/WORKSPACE-MANAGEMENT.md`:**

1. Add link to new documentation
2. Update relevant sections (if applicable)
3. Add to Quick Navigation if commonly referenced

```markdown
### Core Documentation
- [Service Account](SERVICE-ACCOUNT.md) - SSD Automation Service Account
- [Your New Doc](YOUR-NEW-DOC.md) - Brief description  ← ADD THIS
```

### 5. Update Related Documentation

Check if these need updates:
- `docs/SYSTEM-ARCHITECTURE.md` - If architecture changed
- `docs/AI-AGENT-ONBOARDING.md` - If new commands/processes AI needs to know
- `docs/ISSUES.md` - If documenting a problem/solution
- `README.md` - If user-facing changes
- `docs/SERVICE-ACCOUNT.md` - If service account permissions changed

### 6. Commit with Clear Message

```bash
git add docs/YOUR-NEW-DOC.md docs/WORKSPACE-MANAGEMENT.md
git commit -m "docs: add [process name] documentation and update workspace hub"
git push
```

Use commit prefixes:
- `docs:` - Documentation changes
- `feat:` - New feature
- `fix:` - Bug fix
- `chore:` - Maintenance

### 7. Verify Documentation is Discoverable

Test discoverability:
- ✅ Is it linked from WORKSPACE-MANAGEMENT.md?
- ✅ Is it referenced in related docs?
- ✅ Does it have clear headers for searching?
- ✅ Are code examples working?

### 8. Sync to Google Drive (If Applicable)

For core documentation that should be accessible in Google Drive:

**See [DOCUMENTATION-SYNC-GUIDE.md](DOCUMENTATION-SYNC-GUIDE.md) for complete three-location synchronization details.**

**Quick Reference:**
- **Core docs** (WORKSPACE-MANAGEMENT.md, SERVICE-ACCOUNT.md, etc.) → Sync to Drive
- **Issue tracking** (ISSUES.md) → Local/GitHub only
- **Scripts/Config** → Local/GitHub only

**Sync Methods:**
1. **Automated** (future): GitHub Actions after doc updates
2. **Manual** (current): `node scripts/sync-docs-to-drive.js`

**When to sync:**
- Major documentation updates
- New process documentation
- Architecture changes
- Weekly sync for consistency

## Issue Tracking

For bugs, problems, or known issues, add to `docs/ISSUES.md`:

```markdown
## Issue #XXX: [Brief Title]

**Date Discovered:** YYYY-MM-DD
**Severity:** Critical/High/Medium/Low
**Status:** Open/In Progress/Resolved
**Discovered By:** AI Agent/User Name

**Description:**
[What happened]

**Steps to Reproduce:**
1. Step 1
2. Step 2

**Current Workaround:**
[If any]

**Proposed Solution:**
[If known]

**Resolution:**
[When resolved, document the fix]
```

## Special Cases

### Documenting Service Account Changes

When granting new service account permissions:

1. Update `docs/SERVICE-ACCOUNT.md`:
   - Add to "Google Sheets Access" or relevant section
   - Include sheet ID, purpose, permission level
   - Add grant date

2. Update `docs/WORKSPACE-MANAGEMENT.md`:
   - Add to "Current Google Sheets Used by Automation" table

3. Update `docs/SYSTEM-ARCHITECTURE.md`:
   - Add integration point if new system

### Documenting GitHub Actions Changes

When modifying workflows:

1. Update workflow YAML with comments
2. Document in `docs/SYSTEM-ARCHITECTURE.md` under "GitHub Actions Workflows"
3. Add to `docs/AI-AGENT-ONBOARDING.md` if AI needs to trigger/monitor it
4. Update `docs/WORKSPACE-MANAGEMENT.md` under "Automation Systems"

### Documenting Architecture Changes

Significant changes require updates to:
1. `docs/SYSTEM-ARCHITECTURE.md` - Detailed technical changes
2. `docs/WORKSPACE-MANAGEMENT.md` - High-level impact
3. `docs/AI-AGENT-ONBOARDING.md` - If affects AI operations
4. Relevant process docs

## Documentation Review Process

### Monthly Review

On the 1st of each month, review and update:
- ✅ Check all "Last Updated" dates
- ✅ Verify commands still work
- ✅ Update statistics (sheet counts, etc.)
- ✅ Review open issues in ISSUES.md
- ✅ Check for outdated information

### When to Archive Documentation

Move to `docs/archive/` when:
- Process is deprecated
- System is decommissioned
- Replaced by new documentation

Mark with:
```markdown
> **ARCHIVED:** YYYY-MM-DD
> **Reason:** [Why archived]
> **See:** [Link to replacement doc]
```

## AI Agent Guidelines

### For AI Agents Creating Documentation

When documenting a new process:

1. Read existing related documentation first
2. Follow the structure and style of existing docs
3. Be thorough - new AI agents will rely on this
4. Include troubleshooting based on issues encountered
5. Update multiple docs if the change affects multiple areas
6. Always update WORKSPACE-MANAGEMENT.md
7. Test commands before documenting them
8. Use absolute paths, not relative paths
9. Include timestamps and version information
10. Commit documentation immediately after completing work

### For AI Agents Reading Documentation

When starting a new session:

1. Start with `docs/AI-AGENT-ONBOARDING.md`
2. Read `docs/WORKSPACE-MANAGEMENT.md` for overview
3. Read specific docs as needed for your task
4. Check `docs/ISSUES.md` for known problems
5. Verify information is current (check "Last Updated")
6. If documentation is unclear or outdated, update it

## Examples

### Example 1: Documenting New Automation

**Scenario:** Created new automation that syncs files to Google Drive daily

**Steps:**
1. Create `docs/DRIVE-SYNC-AUTOMATION.md` with full details
2. Update `docs/WORKSPACE-MANAGEMENT.md`:
   - Add to "Automation Systems" section
   - Add to "Quick Navigation"
3. Update `docs/SYSTEM-ARCHITECTURE.md`:
   - Add to "Integration Points"
4. Update `docs/AI-AGENT-ONBOARDING.md`:
   - Add monitoring commands to "Common Tasks"
5. Grant service account Drive access
6. Update `docs/SERVICE-ACCOUNT.md`:
   - Add to "Google Drive Access" section
7. Commit all changes:
   ```bash
   git add docs/
   git commit -m "docs: add Drive sync automation documentation"
   git push
   ```

### Example 2: Documenting Issue Resolution

**Scenario:** Fixed authentication failure in logging script

**Steps:**
1. Add to `docs/ISSUES.md`:
   - Create new issue entry
   - Document problem, solution, and resolution date
2. Update relevant section in `docs/SERVICE-ACCOUNT.md` if related to service account
3. Commit:
   ```bash
   git add docs/ISSUES.md docs/SERVICE-ACCOUNT.md
   git commit -m "docs: document authentication fix for logging script"
   git push
   ```

## Quick Reference Checklist

Before committing any code changes, ask:

- [ ] Have I documented what changed?
- [ ] Have I updated WORKSPACE-MANAGEMENT.md?
- [ ] Have I updated related documentation?
- [ ] Are code examples accurate and tested?
- [ ] Is troubleshooting information included?
- [ ] Are there links to related docs?
- [ ] Is the "Last Updated" timestamp current?
- [ ] Have I added issue tracking if needed?
- [ ] Can a new AI agent understand this?

## Tools and Commands

### Finding Documentation

```bash
# Find all documentation files
find docs/ -name "*.md"

# Search documentation for keyword
grep -r "service account" docs/

# View recently updated docs
ls -lt docs/*.md | head -10
```

### Verifying Links

```bash
# Check for broken internal links (manual review)
grep -r "\[.*\](.*\.md)" docs/
```

### Documentation Statistics

```bash
# Count documentation files
ls docs/*.md | wc -l

# Count total lines of documentation
wc -l docs/*.md
```

## Related Documentation

- [Documentation Sync Guide](DOCUMENTATION-SYNC-GUIDE.md) - Three-location synchronization (Local/GitHub/Drive)
- [Workspace Management Hub](WORKSPACE-MANAGEMENT.md) - Central hub (always update)
- [AI Agent Onboarding](AI-AGENT-ONBOARDING.md) - What AI agents need to know
- [System Architecture](SYSTEM-ARCHITECTURE.md) - Technical architecture
- [Issues](ISSUES.md) - Issue tracking

---

**Last Updated:** 2025-11-11
**Maintained By:** AI Assistant (Claude Code)
**Review Frequency:** Monthly or when documentation processes change

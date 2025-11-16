# Documentation Checklist for New System Components

**Purpose**: Ensure all new system components are properly documented across the workspace

**When to Use**: After creating any new:
- Safety system
- MCP server
- Automation workflow
- Development tool
- Process/procedure
- Configuration system

---

## Mandatory Documentation Locations

When adding a new system component, it MUST be documented in ALL of these locations:

### 1. Component-Specific Documentation
**Location**: Same directory as the component
**Required Files**:
- [ ] `README.md` - Quick start and overview
- [ ] `[COMPONENT-NAME]-GUIDE.md` - Detailed usage guide
- [ ] `[COMPONENT-NAME]-CHECKLIST.md` - Operational checklist (if applicable)

**Example**:
```
GIT-SAFETY-CHECKLIST.md
GIT-SAFETY-ENFORCEMENT.md
```

---

### 2. SYSTEM-COMPONENTS.md
**Location**: `workspace-management/shared-docs/SYSTEM-COMPONENTS.md`
**Symlink**: `medical-patient-data/SYSTEM-COMPONENTS.md`

**What to Add**:
- [ ] Component name and purpose
- [ ] Category (Safety, Automation, MCP, etc.)
- [ ] Status (Active, Testing, Planned)
- [ ] Links to detailed documentation
- [ ] Dependencies
- [ ] Owner/maintainer

**Example Entry**:
```markdown
### Git Safety Enforcement System
**Status**: Active
**Category**: Safety & Compliance
**Purpose**: Prevents git corruption from interrupted operations
**Documentation**:
- GIT-SAFETY-CHECKLIST.md
- GIT-SAFETY-ENFORCEMENT.md
**Owner**: Claude Code
**Dependencies**: Git, pre-commit hooks
```

---

### 3. WORKSPACE_GUIDE.md
**Location**: `operations-workspace/WORKSPACE_GUIDE.md`
**Symlink**: `medical-patient-data/WORKSPACE_GUIDE.md`

**What to Add**:
- [ ] How to use the component in daily workflow
- [ ] When to use it
- [ ] Quick reference commands
- [ ] Troubleshooting tips

**Example Entry**:
```markdown
## Git Safety

Before any git operation that modifies state:
1. Read GIT-SAFETY-CHECKLIST.md
2. Ask for user approval
3. Create safety checkpoint
4. Execute operation
5. Verify success

See: GIT-SAFETY-CHECKLIST.md
```

---

### 4. WORKSPACE_ARCHITECTURE.md
**Location**: `operations-workspace/WORKSPACE_ARCHITECTURE.md`
**Symlink**: `medical-patient-data/WORKSPACE_ARCHITECTURE.md`

**What to Add**:
- [ ] How component fits into overall architecture
- [ ] Integration points with other systems
- [ ] Data flow diagrams (if applicable)
- [ ] System dependencies

**Example Entry**:
```markdown
### Safety Layer
- Git Safety Enforcement System
  - Pre-commit hooks
  - Safe git wrappers
  - Mandatory checklists
  - Integrates with: GitHub workflows, backup systems
```

---

### 5. WORKFLOW_PLAYBOOK.md
**Location**: `workspace-management/shared-docs/WORKFLOW_PLAYBOOK.md`
**Symlink**: `medical-patient-data/WORKFLOW_PLAYBOOK.md`

**What to Add**:
- [ ] Step-by-step procedures for using the component
- [ ] Common workflows involving the component
- [ ] Best practices
- [ ] Examples

**Example Entry**:
```markdown
### Git Operations Workflow

1. Check GIT-SAFETY-CHECKLIST.md
2. Run git status
3. Ask user for approval
4. Create backup: git branch backup-$(date +%Y%m%d-%H%M%S)
5. Execute operation
6. Verify success

See: GIT-SAFETY-ENFORCEMENT.md for enforcement details
```

---

### 6. START_HERE.md (if applicable)
**Location**: `medical-patient-data/START_HERE.md`

**What to Add** (if component affects onboarding):
- [ ] Mention in "Safety Systems" section
- [ ] Link to detailed documentation
- [ ] Note any required setup

---

### 7. MCP_ECOSYSTEM.md (if MCP-related)
**Location**: `workspace-management/shared-docs/MCP_ECOSYSTEM.md`
**Symlink**: `medical-patient-data/MCP_ECOSYSTEM.md`

**What to Add** (if component is an MCP or integrates with MCPs):
- [ ] MCP name and purpose
- [ ] Installation instructions
- [ ] Configuration requirements
- [ ] Tool list
- [ ] Integration with other MCPs

---

### 8. Project-Specific README (if applicable)
**Location**: `Implementation Projects/[project-name]/README.md`

**What to Add** (if component is project-specific):
- [ ] How component relates to project
- [ ] Project-specific configuration
- [ ] Usage examples for this project

---

### 9. GitHub Workflows (if applicable)
**Location**: `.github/workflows/`

**What to Document**:
- [ ] Workflow purpose
- [ ] Trigger conditions
- [ ] Required secrets/variables
- [ ] Failure handling

---

### 10. STANDARDS_ENFORCEMENT_SYSTEM.md (if applicable)
**Location**: `workspace-management/shared-docs/STANDARDS_ENFORCEMENT_SYSTEM.md`
**Symlink**: `medical-patient-data/STANDARDS_ENFORCEMENT_SYSTEM.md`

**What to Add** (if component enforces standards):
- [ ] What standards it enforces
- [ ] How enforcement works
- [ ] How to comply
- [ ] Exemption procedures

---

## Documentation Update Workflow

### Step 1: Create Component Documentation
```bash
# Create the component files first
touch [COMPONENT-NAME]-README.md
touch [COMPONENT-NAME]-CHECKLIST.md
```

### Step 2: Update Core Documentation
Use this checklist to ensure all core docs are updated:

```markdown
- [ ] SYSTEM-COMPONENTS.md - Add component entry
- [ ] WORKSPACE_GUIDE.md - Add usage instructions
- [ ] WORKSPACE_ARCHITECTURE.md - Add architectural context
- [ ] WORKFLOW_PLAYBOOK.md - Add workflows
- [ ] START_HERE.md - Add to onboarding (if needed)
- [ ] MCP_ECOSYSTEM.md - Add MCP details (if applicable)
- [ ] STANDARDS_ENFORCEMENT_SYSTEM.md - Add standards (if applicable)
```

### Step 3: Create Cross-References
```markdown
- [ ] Link from component docs to core docs
- [ ] Link from core docs to component docs
- [ ] Update table of contents
- [ ] Update index files
```

### Step 4: Verify Documentation
```markdown
- [ ] All links work
- [ ] All code examples are correct
- [ ] All commands have been tested
- [ ] Screenshots/diagrams are up to date
- [ ] Version numbers are correct
```

### Step 5: Commit Documentation
Follow GIT-SAFETY-CHECKLIST.md:
```bash
# Read checklist first
cat GIT-SAFETY-CHECKLIST.md

# Create safety checkpoint
git tag "pre-docs-update-$(date +%Y%m%d-%H%M%S)"

# Commit documentation
git add [documentation files]
git commit -m "docs: update core documentation for [component name]"
```

---

## Common Documentation Mistakes

### ❌ Mistake 1: Only Documenting in Component README
**Problem**: Users can't find the component in core documentation

**Fix**: Update SYSTEM-COMPONENTS.md and WORKSPACE_GUIDE.md

### ❌ Mistake 2: Not Updating WORKFLOW_PLAYBOOK.md
**Problem**: Users don't know how to use the component in their workflow

**Fix**: Add step-by-step procedures to WORKFLOW_PLAYBOOK.md

### ❌ Mistake 3: Missing Cross-References
**Problem**: Users can't navigate between related documentation

**Fix**: Add "See also:" sections with links

### ❌ Mistake 4: Outdated Examples
**Problem**: Users get errors following documentation

**Fix**: Test all examples before committing

### ❌ Mistake 5: No Troubleshooting Section
**Problem**: Users get stuck when things go wrong

**Fix**: Add "Common Issues" and "Troubleshooting" sections

---

## Documentation Templates

### Component README Template
```markdown
# [Component Name]

**Status**: [Active | Testing | Planned]
**Version**: [1.0.0]
**Last Updated**: [YYYY-MM-DD]

## Purpose
[One-sentence description]

## Quick Start
[3-5 steps to get started]

## Documentation
- [Component-Name]-GUIDE.md - Detailed guide
- [Component-Name]-CHECKLIST.md - Operational checklist

## See Also
- SYSTEM-COMPONENTS.md
- WORKSPACE_GUIDE.md
```

### SYSTEM-COMPONENTS.md Entry Template
```markdown
### [Component Name]
**Status**: [Active | Testing | Planned]
**Category**: [Safety | Automation | MCP | etc.]
**Purpose**: [One-sentence description]
**Documentation**:
- [Component-Name]-README.md
- [Component-Name]-GUIDE.md
**Owner**: [Name]
**Dependencies**: [List]
**Last Updated**: [YYYY-MM-DD]
```

---

## Review Schedule

### After Creating New Component
- [ ] Immediate: Create component documentation
- [ ] Same day: Update SYSTEM-COMPONENTS.md
- [ ] Same week: Update WORKSPACE_GUIDE.md and WORKFLOW_PLAYBOOK.md
- [ ] Within 2 weeks: Update WORKSPACE_ARCHITECTURE.md

### Quarterly Documentation Review
- [ ] Verify all components are documented
- [ ] Update outdated information
- [ ] Fix broken links
- [ ] Test all code examples
- [ ] Update version numbers

---

## Enforcement

### For Claude Code
Before marking any component as "complete":
- [ ] Run through this checklist
- [ ] Verify all required documentation exists
- [ ] Test all examples
- [ ] Create cross-references

### For Users
When requesting a new component:
- [ ] Ask: "Is this documented in SYSTEM-COMPONENTS.md?"
- [ ] Ask: "Is this in the WORKFLOW_PLAYBOOK.md?"
- [ ] Ask: "Are there examples in WORKSPACE_GUIDE.md?"

---

## Quick Reference

**Minimum Required Documentation**:
1. Component README
2. SYSTEM-COMPONENTS.md entry
3. WORKSPACE_GUIDE.md usage instructions

**Full Documentation** (for production systems):
1. Component README
2. Component GUIDE
3. Component CHECKLIST (if applicable)
4. SYSTEM-COMPONENTS.md entry
5. WORKSPACE_GUIDE.md usage
6. WORKSPACE_ARCHITECTURE.md integration
7. WORKFLOW_PLAYBOOK.md procedures

---

**Last Updated**: 2025-11-15
**Version**: 1.0.0
**Owner**: System Documentation
**Status**: Active

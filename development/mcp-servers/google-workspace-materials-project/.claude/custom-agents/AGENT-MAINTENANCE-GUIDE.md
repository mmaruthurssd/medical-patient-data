# Agent Maintenance Guide

## 1. Overview

### What is agent maintenance?

Agent maintenance is the process of keeping custom agent specifications synchronized with the workflows, documentation, and configurations they reference. As workflows evolve, agents must be updated to reflect new patterns, error handling strategies, folder structures, and best practices.

### Why it matters

Agents that fall out of sync with workflows become ineffective or produce incorrect results. When workflows change but agents aren't updated:
- Example prompts in agent specs may fail
- Agents may reference non-existent folders or outdated folder IDs
- Error handling patterns become stale
- Security best practices may not reflect current standards
- Users receive outdated guidance

### Frequency: Check after any workflow updates

Agent maintenance should occur:
- **Immediately** after updating any workflow document
- **Quarterly** for general health checks (even without workflow changes)
- **Before deploying new features** that affect workflows
- **When folder structures change** (new folders, renamed folders, moved folders)
- **When API scopes or permissions change**

## 2. Dependency Tracking System

### The agent-workflow-dependencies.json file

This file maps each agent to the workflows, documentation files, and configuration files it depends on. It serves as the single source of truth for maintenance tracking.

**File Location**: `/.claude/custom-agents/agent-workflow-dependencies.json`

### Structure

```json
{
  "agents": {
    "agent-name": {
      "version": "1.0.0",
      "lastUpdated": "2025-11-15",
      "dependencies": {
        "workflows": ["workflow-file-1.md", "workflow-file-2.md"],
        "docs": ["doc-file-1.md", "doc-file-2.md"],
        "configs": ["config-file-1.json"]
      },
      "maintenanceLog": [
        {
          "date": "2025-11-15",
          "version": "1.0.0",
          "changes": "Initial version",
          "updatedBy": "System"
        }
      ]
    }
  }
}
```

### How it maps agents to workflows/docs/configs

Each agent entry contains:
- **workflows**: Workflow documents that define operations the agent performs
- **docs**: Supporting documentation (setup guides, architecture docs)
- **configs**: Configuration files (folder structures, service account settings)

### Version tracking for each agent

Agents use semantic versioning (MAJOR.MINOR.PATCH):
- **MAJOR**: Breaking changes (restructured operations, new dependencies)
- **MINOR**: Backward-compatible additions (new examples, new sections)
- **PATCH**: Small fixes (typos, clarifications, minor updates)

### How to read the dependency map

To find which agents need updating after changing a workflow:

1. Open `agent-workflow-dependencies.json`
2. Search for the workflow filename in the `dependencies` section
3. Note all agents that list that workflow
4. Review each agent's specification for outdated references

**Example**:
```json
// If you updated "google-drive-automation-workflows.md"
// Search for this filename in dependencies
{
  "google-workspace-automation": {
    "dependencies": {
      "workflows": ["google-drive-automation-workflows.md"]  // Found!
    }
  }
}
// Result: Update "google-workspace-automation" agent
```

## 3. Detecting Outdated Agents

### Automatic Detection Process

When updating a workflow document:

1. **Check agent-workflow-dependencies.json**
   - Open the dependency tracking file
   - Search for the workflow filename you just updated
   - Identify all agents that list this workflow in their dependencies

2. **Find agents that depend on that workflow**
   - Make a list of affected agent specification files
   - Note the current version of each agent
   - Check the lastUpdated date to see how long since last maintenance

3. **Review agent specification for outdated references**
   - Open each affected agent spec file
   - Search for sections that reference the changed workflow
   - Look for:
     - Workflow names or numbers in examples
     - Code snippets that match old workflow patterns
     - Error handling patterns that changed
     - Folder IDs or paths that were updated
     - Operation lists that need new entries

4. **Alert user with specific update suggestions**
   - List specific sections that need updating
   - Provide old vs new content comparison
   - Explain why each update is necessary
   - Request user approval before making changes

### Manual Detection

#### How to check if agent specs match current workflows

1. **Compare operation lists**:
   - Open the workflow document
   - Count the total workflows
   - Check if agent spec lists the same count
   - Verify all workflow names match

2. **Verify code examples**:
   - Copy example code from agent spec
   - Compare with current workflow code
   - Check for pattern mismatches

3. **Cross-reference error handling**:
   - Review error patterns in workflow doc
   - Check if agent spec has same patterns
   - Look for outdated error handling approaches

#### Compare agent examples with actual workflow code

Open side-by-side:
- Left: Agent specification file
- Right: Workflow document

Look for:
- **Function names** that changed
- **Parameter structures** that evolved
- **Return value formats** that differ
- **Error codes** that were added or changed

#### Verify folder IDs and paths are current

1. **Check pre-configured context sections**:
   - Look for hardcoded folder IDs
   - Verify against current folder structure
   - Test folder IDs with actual Drive API calls

2. **Validate paths**:
   - Ensure file paths match current repo structure
   - Check for renamed or moved files
   - Verify symlink targets are correct

#### Check API scopes match service account documentation

1. **Review service account setup guide**:
   - Open the service account documentation
   - List all required API scopes
   - Note any recently added scopes

2. **Compare with agent dependencies**:
   - Check agent spec's dependency section
   - Verify all scopes are listed
   - Add any missing scopes

## 4. Update Procedure

### Step-by-step process

#### 1. Identify What Changed

**Questions to answer**:
- Which workflow document was updated?
- What sections changed? (introduction, code examples, error handling, best practices)
- Are there new operations added?
- Were any operations removed or deprecated?
- Did error handling patterns change?
- Were folder IDs or paths updated?

**Documentation**:
- Note the specific line numbers that changed
- Document the reason for the workflow change
- Identify the scope of impact (minor clarification vs major restructure)

#### 2. Find Affected Agents

**Process**:
1. Open `agent-workflow-dependencies.json`
2. Search for the workflow filename
3. Create a list of affected agents:
   ```
   Affected Agents:
   - google-workspace-automation (v1.0.0)
   - project-setup (v1.0.0)
   - medical-compliance (v1.0.0)
   ```
4. Note the current version of each agent
5. Check lastUpdated date for staleness indication

#### 3. Review Agent Specifications

**For each affected agent**:

1. **Open the agent spec file**:
   ```
   /.claude/custom-agents/[agent-name].md
   ```

2. **Find sections that reference the changed workflow**:
   - Search for workflow name (e.g., "Workflow 5: Create Folder Hierarchy")
   - Look for code examples from that workflow
   - Check operation lists for workflow references
   - Review error handling sections

3. **Identify specific lines that need updating**:
   - Mark each line with OLD/NEW annotation
   - Note the section heading
   - Document why the change is needed

**Example**:
```
Agent: google-workspace-automation
Section: "Core Operations > Available Workflows"
Line 45: "Total workflows: 12"
NEEDS UPDATE TO: "Total workflows: 13"
Reason: Workflow 13 added to google-drive-automation-workflows.md
```

#### 4. Propose Updates to User

**Format**:
```
AGENT UPDATE PROPOSAL

Agent: [agent-name]
Current Version: [X.Y.Z]
Proposed Version: [X.Y.Z+1]

Changes Required:

1. Section: [section-name]
   OLD: [old content]
   NEW: [new content]
   REASON: [why this change is needed]

2. Section: [section-name]
   OLD: [old content]
   NEW: [new content]
   REASON: [why this change is needed]

Approval Required: YES/NO
```

**Get user approval**:
- Present all proposed changes clearly
- Explain impact of NOT updating
- Wait for explicit approval before proceeding

#### 5. Execute Updates

**After receiving approval**:

1. **Update agent specification files**:
   - Make the approved changes to each agent spec
   - Ensure formatting remains consistent
   - Verify all references are updated (not just one instance)

2. **Update version numbers**:
   - Determine version increment (patch, minor, or major)
   - Update version in agent spec header
   - Update version in agent-workflow-dependencies.json

3. **Update lastUpdated dates**:
   - Set to current date in agent-workflow-dependencies.json
   - Add date to agent spec's version history

4. **Update agent-workflow-dependencies.json**:
   ```json
   {
     "agents": {
       "agent-name": {
         "version": "1.1.0",  // Incremented
         "lastUpdated": "2025-11-15",  // Current date
         "dependencies": { ... },
         "maintenanceLog": [
           {
             "date": "2025-11-15",
             "version": "1.1.0",
             "changes": "Added Workflow 13 example, updated operation count",
             "updatedBy": "Claude"
           },
           // ... previous entries
         ]
       }
     }
   }
   ```

#### 6. Document Changes

**Add entry to agent's maintenance log**:
- Date of update
- Version number
- Summary of changes
- Who performed the update

**Update WORKSPACE_GUIDE.md if significant**:
- For major version changes (2.0.0)
- For new agent features
- For breaking changes that affect usage

**Note in the agent spec file's version history**:
```markdown
## Version History

### v1.1.0 (2025-11-15)
- Added Workflow 13: Batch Copy Files
- Updated total workflow count from 12 to 13
- Added example prompt for batch copy operations
- Updated error handling for quota exceeded scenarios
```

## 5. Common Update Scenarios

### Scenario 1: New Workflow Added

**Example**: "Workflow 13: Batch Copy Files" added to google-drive-automation-workflows.md

**Affected agents**:
- google-workspace-automation

**Update needed**:

1. **Update operation count**:
   ```markdown
   OLD: Total workflows: 12
   NEW: Total workflows: 13
   ```

2. **Add to operations list**:
   ```markdown
   ## Core Operations
   ...
   - Workflow 12: Update File Metadata in Bulk
   - Workflow 13: Batch Copy Files  // NEW
   ```

3. **Add example prompt**:
   ```markdown
   ### Example: Batch Copy Files
   "Copy all PDF files from 'Reports 2024' folder to 'Archive 2024' folder,
   preserving folder structure"
   ```

4. **Update workflow summary**:
   - Add brief description of new workflow
   - Note any special requirements or limitations

**Version increment**: MINOR (1.0.0 → 1.1.0)

### Scenario 2: Error Handling Pattern Changed

**Example**: Rate limiting now uses exponential backoff instead of linear backoff

**Affected agents**:
- google-workspace-automation

**Update needed**:

1. **Update error handling section**:
   ```markdown
   OLD:
   Rate limit errors: Retry with 1-second incremental delays

   NEW:
   Rate limit errors: Retry with exponential backoff (1s, 2s, 4s, 8s)
   ```

2. **Update code examples**:
   ```javascript
   OLD:
   let delay = attempt * 1000;  // Linear: 1s, 2s, 3s

   NEW:
   let delay = Math.pow(2, attempt) * 1000;  // Exponential: 1s, 2s, 4s, 8s
   ```

3. **Update best practices**:
   - Explain why exponential backoff is better
   - Note maximum retry attempts
   - Document fallback behavior

**Version increment**: MINOR (1.0.0 → 1.1.0)

### Scenario 3: Folder ID Changed

**Example**: New Archive folder created with different ID

**Affected agents**:
- google-workspace-automation
- project-setup

**Update needed**:

1. **Update pre-configured context**:
   ```markdown
   OLD:
   - Archive: 1ABC_oldFolderID_xyz

   NEW:
   - Archive: 1XYZ_newFolderID_abc
   ```

2. **Update example prompts that reference Archive**:
   ```markdown
   OLD:
   "Move completed projects to Archive (1ABC_oldFolderID_xyz)"

   NEW:
   "Move completed projects to Archive (1XYZ_newFolderID_abc)"
   ```

3. **Test folder access**:
   - Verify new folder ID is accessible
   - Confirm service account has permissions
   - Test example operations

**Version increment**: PATCH (1.0.0 → 1.0.1)

### Scenario 4: API Scope Added

**Example**: New API scope required for Gmail operations (future feature)

**Affected agents**:
- None currently (would affect future Gmail agent)

**Update needed** (if Gmail agent existed):

1. **Add to service account dependencies**:
   ```markdown
   ## Dependencies

   ### Service Account Requirements
   ...
   - `https://www.googleapis.com/auth/gmail.send`  // NEW
   ```

2. **Update setup instructions**:
   - Add scope to service account configuration steps
   - Note in troubleshooting section
   - Update permission checklist

3. **Add to troubleshooting**:
   ```markdown
   **Error**: "Insufficient permissions for Gmail API"
   **Cause**: Missing gmail.send scope
   **Fix**: Add scope to service account configuration
   ```

**Version increment**: MINOR (1.0.0 → 1.1.0)

### Scenario 5: Security Best Practice Changed

**Example**: New PHI detection pattern added

**Affected agents**:
- medical-compliance

**Update needed**:

1. **Add new pattern to PHI Detection Patterns section**:
   ```markdown
   ## PHI Detection Patterns

   ### Patient Identifiers
   ...
   - Insurance Policy Numbers: /\b[A-Z]{3}\d{9}\b/  // NEW
   ```

2. **Update example prompts**:
   ```markdown
   ### Example: Detect PHI in Document
   "Scan this document for PHI including MRNs, SSNs, and insurance policy numbers"
   ```

3. **Update validation checklist**:
   ```markdown
   - [ ] MRN format validated
   - [ ] SSN format validated
   - [ ] Insurance policy number format validated  // NEW
   ```

**Version increment**: MINOR (1.0.0 → 1.1.0)

## 6. Version Control

### Agent Versioning

Agents use **semantic versioning** in the format: `MAJOR.MINOR.PATCH`

#### Increment PATCH (1.0.0 → 1.0.1)

**When**:
- Small fixes that don't change functionality
- Typo corrections
- Clarifications to existing content
- Folder ID updates
- Minor wording improvements

**Examples**:
- "Fixed typo in Workflow 5 description"
- "Updated Archive folder ID from 1ABC to 1XYZ"
- "Clarified error message format in troubleshooting"

#### Increment MINOR (1.0.0 → 1.1.0)

**When**:
- New examples added
- New sections added
- Backward-compatible changes
- New workflows added to operation list
- Enhanced error handling patterns
- Additional best practices

**Examples**:
- "Added Workflow 13: Batch Copy Files"
- "Added new error handling pattern for quota exceeded"
- "Added section on PHI detection in shared drives"

#### Increment MAJOR (1.0.0 → 2.0.0)

**When**:
- Breaking changes that affect usage
- Restructured operations (workflows reordered or renumbered)
- New dependencies required (new service account scopes)
- Changed API or function signatures
- Removed deprecated workflows

**Examples**:
- "Restructured all workflows into new categories"
- "Changed from Drive API v2 to v3 (breaking change)"
- "Removed deprecated folder copy operation"
- "Added requirement for Gmail API scope"

### Tracking Changes

#### Maintain version history in each agent spec file

Every agent specification should include a version history section:

```markdown
## Version History

### v1.1.0 (2025-11-15)
- Added Workflow 13: Batch Copy Files
- Updated total workflow count from 12 to 13
- Enhanced error handling for rate limits
- Added example prompts for batch operations

### v1.0.1 (2025-11-10)
- Updated Archive folder ID
- Fixed typo in Workflow 5 description
- Clarified service account setup steps

### v1.0.0 (2025-11-01)
- Initial release
- 12 core workflows
- PHI compliance features
- Service account integration
```

#### Update lastUpdated date in agent-workflow-dependencies.json

```json
{
  "agents": {
    "google-workspace-automation": {
      "version": "1.1.0",
      "lastUpdated": "2025-11-15",  // Always update this
      "dependencies": { ... }
    }
  }
}
```

#### Document in WORKSPACE_GUIDE.md maintenance log for major changes

For MAJOR version changes (2.0.0), add entry to workspace guide:

```markdown
## Maintenance Log

### 2025-11-15
- **Agent Update**: google-workspace-automation v2.0.0
  - Breaking change: Restructured all workflow categories
  - Migration required for existing users
  - See agent spec for migration guide
```

## 7. Quality Checks

### Before Finalizing Updates

Use this checklist before completing any agent update:

- [ ] **All references to changed workflow are updated**
  - Searched entire agent spec for workflow name
  - Updated all occurrences (not just first one)
  - Verified in code examples, operation lists, and troubleshooting

- [ ] **Example prompts still work with new workflow code**
  - Tested each example prompt manually or mentally walked through
  - Verified code examples match current workflow patterns
  - Confirmed function signatures are correct

- [ ] **Error handling patterns match current best practices**
  - Reviewed error handling section against workflow doc
  - Updated retry strategies if changed
  - Added any new error codes or messages

- [ ] **Folder IDs and paths are current**
  - Verified all folder IDs against actual Drive folders
  - Checked file paths match current repo structure
  - Tested folder access with service account

- [ ] **API scopes match service account configuration**
  - Cross-referenced with service account setup guide
  - Verified all required scopes are listed
  - Removed any deprecated scopes

- [ ] **Version numbers incremented appropriately**
  - Used correct semantic versioning (patch/minor/major)
  - Updated version in agent spec header
  - Updated version in agent-workflow-dependencies.json

- [ ] **lastUpdated dates updated**
  - Set current date in agent-workflow-dependencies.json
  - Added date to version history in agent spec

- [ ] **Maintenance log entry added**
  - Created entry in agent-workflow-dependencies.json
  - Documented what changed and why
  - Noted who performed the update

### Additional Quality Checks

- **Formatting consistency**: Verify markdown formatting matches existing style
- **Link validity**: Check all internal links point to existing files
- **Code syntax**: Ensure code examples have proper syntax highlighting
- **Completeness**: No "TODO" or "FIXME" comments left behind

## 8. Automation Opportunities

### Future Enhancements

While manual maintenance works for now, consider these automation opportunities:

#### File hash checksums to auto-detect workflow changes

**Concept**:
```json
{
  "workflows": {
    "google-drive-automation-workflows.md": {
      "hash": "a3f2b1c9...",
      "lastChecked": "2025-11-15",
      "affectedAgents": ["google-workspace-automation"]
    }
  }
}
```

**Benefits**:
- Automatically detect when workflow files change
- Alert immediately when agents become outdated
- No manual checking required

**Implementation**:
- Pre-commit hook calculates file hashes
- Compares against stored hashes
- Triggers alert if workflow changed

#### Automated testing of agent example prompts

**Concept**:
- Extract all example prompts from agent specs
- Run them against actual workflow code
- Verify outputs match expected results

**Benefits**:
- Catch breaking changes immediately
- Ensure examples always work
- Prevent outdated documentation

**Implementation**:
- Parse agent specs for example prompts
- Create test suite for each agent
- Run in CI/CD pipeline

#### CI/CD integration to check agent-workflow sync

**Concept**:
- GitHub Actions workflow runs on every commit
- Checks if changed files affect any agents
- Creates issue if agents need updating

**Benefits**:
- Automatic detection of drift
- No manual checking required
- Prevents forgotten updates

**Implementation**:
```yaml
name: Agent Sync Check
on: [push]
jobs:
  check-agent-sync:
    runs-on: ubuntu-latest
    steps:
      - name: Check for workflow changes
      - name: Identify affected agents
      - name: Create issue if updates needed
```

#### Quarterly automated health checks

**Concept**:
- Scheduled job runs every 3 months
- Validates all agents against current workflows
- Generates health report

**Benefits**:
- Catch drift that slips through
- Regular maintenance reminder
- Comprehensive validation

**Implementation**:
- Cron job triggers quarterly
- Runs all quality checks
- Emails health report to team

## 9. Troubleshooting

### Issue: Agent references non-existent workflow

**Symptoms**:
- Agent spec mentions "Workflow 14" but workflow doc only has 13
- Example prompts reference operations that don't exist
- Error: "Workflow not found"

**Cause**:
- Workflow was removed or deprecated
- Workflow was renumbered
- Agent spec wasn't updated when workflow doc changed

**Fix**:
1. Open the workflow document
2. Search for the workflow name or number
3. If removed: Delete references from agent spec
4. If renumbered: Update to new workflow number
5. If renamed: Update workflow name in agent spec
6. Update version number (PATCH if minor, MINOR if affects examples)

**Example**:
```markdown
OLD (in agent spec):
- Workflow 14: Advanced Search Operations

INVESTIGATION:
- Checked google-drive-automation-workflows.md
- Only 13 workflows exist
- Workflow 14 never existed or was removed

FIX:
- Remove "Workflow 14" reference from agent spec
- Update total workflow count if needed
- Version: 1.0.0 → 1.0.1 (patch)
```

### Issue: Agent uses old folder ID

**Symptoms**:
- Operations fail with "Folder not found"
- Agent spec shows folder ID that doesn't exist
- Error: "404: File not found"

**Cause**:
- Folder was recreated with new ID
- Folder was deleted and replaced
- Agent spec wasn't updated with new ID

**Fix**:
1. Identify the correct folder in Google Drive
2. Get the new folder ID from Drive URL or API
3. Update pre-configured context section
4. Update all example prompts that reference the folder
5. Test folder access with service account
6. Version: PATCH increment (1.0.0 → 1.0.1)

**Example**:
```markdown
OLD:
- Project Archive: 1ABC_oldFolderID_xyz

INVESTIGATION:
- Checked Google Drive
- Old folder deleted, new folder created
- New ID: 1XYZ_newFolderID_abc

FIX:
- Update pre-configured context
- Update example prompts
- Test service account access
- Version: 1.0.0 → 1.0.1
```

### Issue: Agent example prompts fail

**Symptoms**:
- Following agent examples produces errors
- Code examples don't match workflow code
- Functions called don't exist in workflow

**Cause**:
- Workflow code changed (function renamed, parameters changed)
- Error handling patterns evolved
- Examples no longer match current workflow patterns

**Fix**:
1. Open workflow document side-by-side with agent spec
2. Compare code examples in both files
3. Update agent examples to match current workflow code
4. Update function names if they changed
5. Update parameter structures if they evolved
6. Test each example manually
7. Version: MINOR increment (1.0.0 → 1.1.0)

**Example**:
```markdown
OLD (in agent spec):
```javascript
createFolder(parentId, folderName)
```

INVESTIGATION:
- Checked workflow code
- Function signature changed to include options
- New signature: createFolder(parentId, folderName, options = {})

FIX:
```javascript
createFolder(parentId, folderName, { color: 'blue' })
```
- Updated all examples
- Version: 1.0.0 → 1.1.0
```

### Issue: Agent references outdated error handling

**Symptoms**:
- Agent suggests linear backoff for rate limits
- Workflow uses exponential backoff
- Error handling doesn't match current best practices

**Cause**:
- Workflow error handling evolved
- Agent spec not updated when patterns changed

**Fix**:
1. Review current error handling in workflow doc
2. Update agent's error handling section
3. Update code examples with new patterns
4. Update troubleshooting section if needed
5. Version: MINOR increment (1.0.0 → 1.1.0)

### Issue: Agent missing new API scope requirement

**Symptoms**:
- Operations fail with "Insufficient permissions"
- Agent spec doesn't list required scope
- Service account setup incomplete

**Cause**:
- New API scope added to workflow
- Agent dependencies not updated

**Fix**:
1. Review workflow's API requirements
2. Add missing scope to agent's dependencies section
3. Update service account setup instructions
4. Add troubleshooting entry for permission error
5. Version: MINOR increment (1.0.0 → 1.1.0)

## 10. Best Practices

### 1. Update agents immediately after workflow changes (don't let them drift)

**Why**:
- Drift compounds over time
- Harder to update multiple changes at once
- Users may encounter broken examples

**How**:
- Set reminder: "Update agents" immediately after workflow changes
- Add to workflow update checklist
- Include in code review process

**Example workflow**:
```
Updating a workflow:
1. Make changes to workflow document
2. Save and commit
3. IMMEDIATELY: Check agent-workflow-dependencies.json
4. Update affected agents
5. Commit agent updates in same PR
```

### 2. Test example prompts after updates to ensure they still work

**Why**:
- Examples are the primary way users learn agents
- Broken examples erode trust
- Easy to accidentally break examples during updates

**How**:
- Manually walk through each example
- Test code snippets in actual environment
- Verify outputs match expected results

**Testing checklist**:
- [ ] Read example prompt aloud - does it make sense?
- [ ] Copy code example - does it run without errors?
- [ ] Verify folder IDs exist and are accessible
- [ ] Check function names match workflow code
- [ ] Confirm parameter structures are correct

### 3. Document why changes were made in maintenance logs

**Why**:
- Future maintainers need context
- Helps identify patterns in updates
- Useful for troubleshooting recurring issues

**How**:
```json
"maintenanceLog": [
  {
    "date": "2025-11-15",
    "version": "1.1.0",
    "changes": "Added Workflow 13: Batch Copy Files",
    "reason": "New bulk operations workflow added to improve efficiency for large-scale file management",
    "updatedBy": "Claude"
  }
]
```

**Good vs Bad**:
```
BAD:  "Updated agent"
GOOD: "Updated agent to reflect new exponential backoff pattern in rate limit handling"

BAD:  "Fixed examples"
GOOD: "Fixed examples to match new function signature in Workflow 5"
```

### 4. Keep dependency map current - update agent-workflow-dependencies.json

**Why**:
- Single source of truth for maintenance
- Enables automatic detection of outdated agents
- Essential for future automation

**How**:
- Update immediately after agent changes
- Include in agent update checklist
- Verify during code review

**Update process**:
```
After updating agent:
1. Open agent-workflow-dependencies.json
2. Update version number
3. Update lastUpdated date
4. Add maintenance log entry
5. Save and commit
```

### 5. Review quarterly even without changes (ensure agents still optimal)

**Why**:
- Workflows may have subtle improvements
- Best practices evolve
- Catch accumulated drift

**How**:
- Set quarterly calendar reminder
- Review each agent against current workflows
- Update even if no breaking changes
- Look for opportunities to improve clarity

**Quarterly review checklist**:
- [ ] Read through entire agent spec
- [ ] Compare with current workflow docs
- [ ] Test all example prompts
- [ ] Verify folder IDs still valid
- [ ] Check for new best practices to incorporate
- [ ] Update version history with "Quarterly review - no changes" or list improvements

### 6. Batch related updates - if updating multiple workflows, update all affected agents together

**Why**:
- More efficient than multiple separate updates
- Easier to track related changes
- Single version bump for multiple improvements

**How**:
- When updating multiple related workflows, list all affected agents
- Update all agents in single session
- Create single maintenance log entry covering all changes
- Test all agents together

**Example**:
```
Updated workflows:
- google-drive-automation-workflows.md (added Workflow 13)
- google-sheets-automation-workflows.md (updated error handling)

Affected agents:
- google-workspace-automation (uses both workflows)

Batched update:
- Added Workflow 13 references
- Updated error handling patterns
- Single version bump: 1.0.0 → 1.1.0
- Single maintenance log entry documenting both changes
```

**Batching benefits**:
- Fewer version increments to track
- More coherent version history
- Easier for users to understand what changed

### Additional Best Practices

#### Use clear, descriptive version history entries
```markdown
GOOD:
### v1.1.0 (2025-11-15)
- Added Workflow 13: Batch Copy Files to operations list
- Updated rate limit error handling to use exponential backoff
- Added example prompts for bulk operations

BAD:
### v1.1.0 (2025-11-15)
- Updates
```

#### Maintain consistent formatting across agents
- Use same section headings
- Use same markdown style
- Use same code block formatting
- Makes maintenance easier

#### Keep agent specs focused and concise
- Don't duplicate workflow documentation
- Reference workflows by number/name
- Provide examples, not full implementations
- Focus on how to use, not how it works internally

#### Plan for deprecation
- Mark deprecated workflows clearly
- Provide migration path in agent spec
- Keep deprecated content for one version
- Remove in next major version

---

**Last Updated**: 2025-11-15
**Next Review**: 2025-12-15 (Monthly)
**Maintained By**: Claude Agent System
**Version**: 1.0.0

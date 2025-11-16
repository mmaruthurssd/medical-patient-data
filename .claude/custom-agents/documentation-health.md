# Documentation Health Agent

## Overview

### What This Agent Does
The Documentation Health Agent is a specialized validation system designed to maintain the integrity and quality of documentation across the entire workspace. It performs comprehensive checks to ensure:
- All internal links and cross-references are valid and functional
- Documentation remains current and relevant
- Information is consistent across multiple files
- Critical documentation is properly indexed and discoverable
- API references and technical details are up-to-date

### Why It Exists
Documentation decay is a silent productivity killer. Broken links, outdated information, and inconsistent references erode trust in documentation and waste developer time. This agent prevents:
- **Broken Links**: Dead references that lead to 404s or missing files
- **Stale Information**: Outdated dates, deprecated APIs, obsolete procedures
- **Inconsistencies**: Conflicting information across multiple sources
- **Orphaned Content**: Valuable documentation that's not discoverable
- **Reference Rot**: Cross-references that no longer point to valid targets

### Frequency
- **Monthly**: Scheduled health checks as part of workspace maintenance
- **On-Demand**: After major refactoring, before releases, or quarterly reviews
- **Triggered**: Automatically when significant structural changes are detected

---

## When to Use This Agent

### Trigger Phrases
Activate this agent with any of these phrases:
- "check documentation"
- "validate links"
- "find broken references"
- "documentation health check"
- "verify documentation"
- "scan docs for issues"
- "documentation audit"
- "check for stale docs"

### Scenarios
Use this agent in the following situations:

1. **After Major Refactoring**
   - Files have been moved or renamed
   - Directory structures have changed
   - Documentation needs to reflect new architecture

2. **Quarterly Reviews**
   - Regular maintenance cycle
   - Ensuring documentation keeps pace with development
   - Identifying content that needs updates

3. **Before Important Updates**
   - Pre-release validation
   - Ensuring all references are accurate
   - Verifying deployment documentation is current

4. **Onboarding Preparation**
   - New team members joining
   - Documentation must be accurate and complete
   - Links must work for first-time users

5. **Post-Migration**
   - After moving to new systems
   - Folder IDs or paths have changed
   - References need validation

### Example Questions
- "Are all our internal links working?"
- "Is our documentation up to date?"
- "Which documentation files haven't been updated in 90 days?"
- "Do all Quick Lookup Table entries point to valid files?"
- "Are there any broken cross-references between MCP docs?"
- "Show me all orphaned documentation files"
- "What's the overall health score of our documentation?"
- "Find duplicate content across infrastructure docs"

---

## Tools Available

### Read
**Purpose**: Read markdown files, configuration files, and documentation
**Use Cases**:
- Examine individual documentation files
- Extract dates, links, and cross-references
- Verify content structure and formatting
- Parse Quick Lookup Tables

### Grep
**Purpose**: Search for patterns across multiple files
**Use Cases**:
- Find all links matching specific patterns
- Search for "Last Updated" dates
- Locate folder ID references
- Identify TODO comments
- Find API version references

### Glob
**Purpose**: Find all markdown and documentation files
**Use Cases**:
- Discover all `.md` files in workspace
- List documentation in specific directories
- Build comprehensive file inventories
- Identify files for scanning

### Bash
**Purpose**: Execute system commands for validation
**Use Cases**:
- Check file existence with `test -f`
- Run git commands to check file history
- Validate symbolic links
- Check file modification dates
- Count lines or words in files

---

## Pre-configured Context

### Workspace Root
```
/Users/mmaruthurnew/Desktop/medical-patient-data/
```

### Key Documentation Directories
```
/Users/mmaruthurnew/Desktop/medical-patient-data/infrastructure/
/Users/mmaruthurnew/Desktop/medical-patient-data/workflows/
/Users/mmaruthurnew/Desktop/medical-patient-data/development/mcp-servers/
/Users/mmaruthurnew/Desktop/medical-patient-data/.claude/custom-agents/
/Users/mmaruthurnew/Desktop/medical-patient-data/operations-workspace/
/Users/mmaruthurnew/Desktop/medical-patient-data/planning-and-roadmap/
```

### Critical Documentation Files
- **Workspace Guide**: `/Users/mmaruthurnew/Desktop/medical-patient-data/WORKSPACE_GUIDE.md`
- **Architecture**: `/Users/mmaruthurnew/Desktop/medical-patient-data/WORKSPACE_ARCHITECTURE.md`
- **MCP Docs**: `/Users/mmaruthurnew/Desktop/medical-patient-data/development/mcp-servers/*/README.md`
- **Quick Lookup Table**: Located in `WORKSPACE_GUIDE.md` starting around line 500

### Common File Patterns
- Documentation: `**/*.md`
- Configuration: `**/*.json`, `**/.clasprc.json`
- Scripts: `**/scripts/**/*.sh`, `**/scripts/**/*.js`
- Agent Specs: `.claude/custom-agents/*.md`

---

## Validation Checks

### 1. Broken Internal Links
**Description**: Detects links to files that don't exist in the workspace

**Pattern to Match**:
```regex
\[([^\]]+)\]\((?!http|#)([^)]+)\)
```

**Validation Logic**:
- Extract all markdown-style links
- Filter out external URLs (starting with `http`)
- Filter out anchor links (starting with `#`)
- Resolve relative paths from document location
- Check if target file exists using `test -f`

**Example Issues**:
```
❌ BROKEN: [See Setup Guide](../setup/INSTALL.md) - File not found
❌ BROKEN: [MCP Config](../../mcp-config.json) - File not found
```

**Fix Suggestions**:
- Update path to correct location
- Remove link if file was intentionally deleted
- Create missing file if needed

### 2. Outdated Dates
**Description**: Identifies documentation with "Last Updated" dates older than 90 days

**Pattern to Match**:
```regex
Last Updated:?\s*(\d{4}-\d{2}-\d{2})
Updated:?\s*(\d{4}-\d{2}-\d{2})
Date:?\s*(\d{4}-\d{2}-\d{2})
```

**Validation Logic**:
- Extract date from documentation header or footer
- Parse date using ISO 8601 format
- Calculate days since last update
- Flag if > 90 days old

**Example Issues**:
```
⚠️  STALE: infrastructure/BACKUP_POLICY.md - Last Updated: 2024-08-15 (120 days ago)
⚠️  STALE: workflows/DEPLOYMENT.md - Last Updated: 2024-07-20 (145 days ago)
```

**Fix Suggestions**:
- Review and update content
- Update date if content is still accurate
- Archive if no longer relevant

### 3. Invalid Folder IDs
**Description**: References to Google Drive folder IDs that may have changed or become invalid

**Pattern to Match**:
```regex
folder[/_-]?id[:\s]*([A-Za-z0-9_-]{28,})
drive\.google\.com/drive/folders/([A-Za-z0-9_-]{28,})
```

**Validation Logic**:
- Extract folder IDs from documentation
- Check against known valid folder IDs in workspace config
- Flag IDs not found in current configuration
- Suggest manual verification via Drive API

**Example Issues**:
```
🔗 INVALID: Folder ID "1A2B3C4D5E6F7G8H9I0J1K2L3M4N" not found in workspace config
🔗 INVALID: Referenced in infrastructure/SYNC_CONFIG.md line 45
```

**Fix Suggestions**:
- Verify folder still exists in Drive
- Update to current folder ID
- Remove reference if folder was deleted

### 4. Broken Cross-References
**Description**: References between documents that no longer exist or point to wrong sections

**Pattern to Match**:
```regex
See\s+\[([^\]]+)\]\(([^)]+)\)
Refer to\s+\[([^\]]+)\]\(([^)]+)\)
As described in\s+\[([^\]]+)\]\(([^)]+)\)
```

**Validation Logic**:
- Extract cross-reference links
- Verify target document exists
- Check if referenced section/anchor exists
- Validate bidirectional references

**Example Issues**:
```
❌ BROKEN REF: "See [Authentication](../auth/README.md#oauth)"
   - File exists but section #oauth not found
❌ BROKEN REF: "Refer to [Deployment Guide](DEPLOY.md)"
   - File moved to workflows/DEPLOYMENT.md
```

**Fix Suggestions**:
- Update link to correct section
- Update path if file moved
- Add missing section header

### 5. Duplicate Information
**Description**: Same content appearing in multiple files, leading to maintenance burden

**Detection Method**:
- Hash paragraphs of 3+ sentences
- Compare hashes across all documentation
- Flag exact or near-exact matches (>90% similarity)

**Example Issues**:
```
📋 DUPLICATE: "OAuth setup instructions" found in:
   - infrastructure/GOOGLE_OAUTH.md (lines 45-78)
   - development/mcp-servers/google-sheets-mcp/README.md (lines 120-153)
   Similarity: 98%
```

**Fix Suggestions**:
- Keep primary copy in one location
- Add cross-reference links from secondary locations
- Extract to shared documentation if needed frequently

### 6. Missing Quick Lookup Entries
**Description**: Important documentation not indexed in Quick Lookup Table

**Validation Logic**:
- Parse Quick Lookup Table from WORKSPACE_GUIDE.md
- Find all critical documentation files
- Compare lists to identify missing entries
- Prioritize based on file importance (README, GUIDE, ARCHITECTURE)

**Example Issues**:
```
📍 MISSING: development/mcp-servers/backup-dr/README.md
   - Not found in Quick Lookup Table
   - Should be added under "MCP Servers" section
📍 MISSING: infrastructure/SECURITY_POLICY.md
   - Critical file but not indexed
```

**Fix Suggestions**:
- Add entry to appropriate Quick Lookup section
- Include brief description
- Verify categorization

### 7. Inconsistent Formatting
**Description**: Different header styles, bullet formats, or structural patterns

**Checks**:
- Header level consistency (`#`, `##`, `###`)
- Bullet point style (`-` vs `*`)
- Code fence style (` ``` ` with language tags)
- Date format consistency

**Example Issues**:
```
📝 FORMAT: infrastructure/BACKUP.md uses `*` for bullets, others use `-`
📝 FORMAT: Inconsistent header hierarchy - jumps from # to ###
📝 FORMAT: Date format varies: "2024-11-15" vs "11/15/2024"
```

**Fix Suggestions**:
- Standardize on `-` for unordered lists
- Use `1.` for ordered lists
- Follow header hierarchy without skipping levels
- Use ISO 8601 date format: `YYYY-MM-DD`

### 8. Orphaned Files
**Description**: Documentation files not referenced anywhere in the workspace

**Detection Method**:
- Build graph of all documentation files
- Parse all markdown links across workspace
- Identify files with zero incoming references
- Exclude intentionally standalone files (README, INDEX)

**Example Issues**:
```
🔍 ORPHANED: old-docs/legacy-setup.md
   - No incoming references found
   - Last modified: 2023-05-10
   - Consider archiving or deleting
🔍 ORPHANED: temp/scratch-notes.md
   - Temporary file, likely forgotten
```

**Fix Suggestions**:
- Add references from relevant documentation
- Move to archive if still valuable
- Delete if no longer needed

### 9. API Version Mismatches
**Description**: References to deprecated API versions or outdated endpoints

**Pattern to Match**:
```regex
api[/\s]v(\d+)
version[:\s]*(\d+\.\d+\.\d+)
@googleapis/[a-z-]+@v(\d+)
```

**Validation Logic**:
- Extract API versions from documentation
- Compare against known current versions
- Flag deprecated versions
- Check package.json for version mismatches

**Example Issues**:
```
🔄 DEPRECATED: Google Sheets API v3 referenced in workflows/SYNC.md
   - Current version: v4
   - Line 67: "Using sheets.spreadsheets.v3.get()"
🔄 DEPRECATED: @googleapis/drive@v2 in development/mcp-servers/google-drive-mcp/README.md
   - Current version: v3
```

**Fix Suggestions**:
- Update to current API version
- Review breaking changes in migration guide
- Update code examples

### 10. Stale TODOs
**Description**: TODO comments more than 30 days old, indicating forgotten tasks

**Pattern to Match**:
```regex
TODO:?\s*(.+)
FIXME:?\s*(.+)
HACK:?\s*(.+)
XXX:?\s*(.+)
```

**Validation Logic**:
- Find all TODO-style comments
- Check git blame for comment age
- Flag TODOs older than 30 days
- Categorize by urgency

**Example Issues**:
```
⏰ STALE TODO: infrastructure/MONITORING.md line 34
   "TODO: Set up automated alerting"
   Age: 145 days
⏰ STALE FIXME: workflows/DEPLOYMENT.md line 89
   "FIXME: This process is manual, needs automation"
   Age: 67 days
```

**Fix Suggestions**:
- Complete the task
- Create ticket if complex
- Remove if no longer relevant
- Update if work is in progress

---

## Example Prompts

### 1. Comprehensive Link Check
```
Check all documentation for broken internal links. Scan every .md file in the workspace,
extract all internal links, and verify each target file exists. Generate a report with:
- Total links checked
- Number of broken links
- Files with most broken links
- Suggested fixes for each broken link
```

**Expected Output**:
```
Documentation Link Health Report
================================
Total Files Scanned: 45
Total Links Checked: 234
Broken Links Found: 12

Critical Issues:
❌ infrastructure/SETUP.md:23 - [Install Guide](../docs/INSTALL.md) - File not found
❌ workflows/DEPLOYMENT.md:45 - [Config](../../config.json) - File not found

Files with Most Issues:
1. infrastructure/SETUP.md - 4 broken links
2. development/mcp-servers/legacy/README.md - 3 broken links
3. workflows/SYNC.md - 2 broken links

Recommendations:
- Fix critical infrastructure documentation first
- Consider archiving legacy MCP documentation
- Update workflow references to new file structure
```

### 2. Staleness Audit
```
Find files with 'Last Updated' dates older than 90 days. For each file:
- Show the last update date
- Calculate days since update
- Show file modification date from git
- Flag discrepancy if git date differs significantly
```

**Expected Output**:
```
Stale Documentation Report
==========================
Files Needing Review: 8

⚠️  infrastructure/BACKUP_POLICY.md
    Last Updated: 2024-08-15 (120 days ago)
    Git Last Modified: 2024-08-14
    Priority: HIGH - Critical infrastructure doc

⚠️  workflows/DEPLOYMENT.md
    Last Updated: 2024-07-01 (165 days ago)
    Git Last Modified: 2024-10-12
    Priority: CRITICAL - Date discrepancy, file modified but not updated

⚠️  development/mcp-servers/old-mcp/README.md
    Last Updated: 2024-06-15 (181 days ago)
    Git Last Modified: 2024-06-15
    Priority: LOW - Legacy MCP, consider archiving
```

### 3. Folder ID Validation
```
Verify all Drive folder IDs in documentation still exist. Extract folder IDs from:
- Direct references (folder_id: ...)
- Drive URLs (drive.google.com/drive/folders/...)
- Configuration snippets

Cross-reference against workspace-manifest.yml and report any mismatches.
```

**Expected Output**:
```
Google Drive Folder ID Validation
=================================
Total Folder IDs Found: 15
Validated Against Config: 15
Invalid/Unknown: 2

🔗 UNKNOWN: 1A2B3C4D5E6F7G8H9I0J1K2L3M4N
   Referenced in: infrastructure/SYNC_CONFIG.md:45
   Status: Not found in workspace-manifest.yml
   Action: Verify folder exists or update reference

🔗 UNKNOWN: 9Z8Y7X6W5V4U3T2S1R0Q9P8O7N6M
   Referenced in: workflows/BACKUP.md:67
   Status: Not found in workspace-manifest.yml
   Action: May be legacy folder ID, check Drive
```

### 4. Quick Lookup Table Validation
```
Check if Quick Lookup Table entries point to valid files. For each entry:
1. Extract the file path
2. Verify file exists
3. Check if description matches file content
4. Identify important files missing from the table
```

**Expected Output**:
```
Quick Lookup Table Health Check
================================
Location: WORKSPACE_GUIDE.md lines 500-650
Total Entries: 32
Valid Entries: 28
Broken Entries: 4

❌ MCP Development Guide -> development/mcp-servers/GUIDE.md (NOT FOUND)
   Fix: Update to development/mcp-servers/MCP_DEVELOPMENT_GUIDE.md

✓ Workspace Architecture -> WORKSPACE_ARCHITECTURE.md (VALID)
✓ Backup Policy -> infrastructure/BACKUP_POLICY.md (VALID)

Missing Important Files:
📍 infrastructure/SECURITY_POLICY.md - Should be in "Infrastructure" section
📍 development/mcp-servers/backup-dr/README.md - Should be in "MCP Servers" section
📍 .claude/custom-agents/README.md - Should be in "Agent Specs" section
```

### 5. Duplicate Content Detection
```
Find duplicate information across infrastructure docs. Use paragraph-level hashing
to identify sections that appear in multiple files. Report:
- Exact matches
- Near-matches (>90% similarity)
- Recommendation for consolidation
```

**Expected Output**:
```
Duplicate Content Analysis
==========================
Infrastructure Documents Scanned: 12
Duplicate Sections Found: 5

📋 HIGH SIMILARITY (98%): "OAuth 2.0 Setup Instructions"
   Primary: infrastructure/GOOGLE_OAUTH.md (lines 45-78, 456 chars)
   Duplicates:
   - development/mcp-servers/google-sheets-mcp/README.md (lines 120-153)
   - development/mcp-servers/google-drive-mcp/README.md (lines 89-122)
   Recommendation: Keep detailed version in infrastructure/, add cross-references in MCP docs

📋 EXACT MATCH: "Backup Retention Policy"
   Locations:
   - infrastructure/BACKUP_POLICY.md (lines 34-42)
   - workflows/BACKUP.md (lines 67-75)
   Recommendation: Delete from workflows/, add link to infrastructure/BACKUP_POLICY.md
```

### 6. Orphaned Files Report
```
List all markdown files not referenced in WORKSPACE_GUIDE.md or by any other documentation.
Exclude README.md files. For each orphaned file:
- Show last modification date
- Suggest whether to archive, reference, or delete
```

**Expected Output**:
```
Orphaned Documentation Files
============================
Files with No Incoming References: 6

🔍 old-docs/legacy-setup.md
   Last Modified: 2023-05-10 (946 days ago)
   Size: 3.4 KB
   Recommendation: ARCHIVE - Very old, likely obsolete

🔍 temp/scratch-notes.md
   Last Modified: 2024-10-15 (61 days ago)
   Size: 1.2 KB
   Recommendation: DELETE - Temporary file

🔍 infrastructure/MONITORING_DRAFT.md
   Last Modified: 2024-11-01 (14 days ago)
   Size: 8.7 KB
   Recommendation: REFERENCE - Recent work, add to Quick Lookup Table
```

### 7. Cross-Reference Validation
```
Validate cross-references between MCP documentation files. Check:
- Links between MCP READMEs
- References to shared infrastructure
- Links to agent specifications
Report broken references and suggest fixes.
```

**Expected Output**:
```
MCP Cross-Reference Validation
==============================
MCP Documentation Files: 8
Cross-References Checked: 47
Broken References: 5

❌ google-sheets-mcp/README.md:45
   Reference: "See [OAuth Setup](../../infrastructure/OAUTH.md)"
   Issue: File moved to infrastructure/GOOGLE_OAUTH.md
   Fix: Update link to ../../infrastructure/GOOGLE_OAUTH.md

❌ task-executor-mcp/README.md:89
   Reference: "Agent spec at [Task Executor](../.claude/custom-agents/task-executor.md)"
   Issue: Wrong relative path from current location
   Fix: Update to ../../../.claude/custom-agents/task-executor.md

✓ backup-dr/README.md:34 - Valid reference to infrastructure/BACKUP_POLICY.md
✓ workspace-sync/README.md:67 - Valid reference to workflows/SYNC.md
```

### 8. Comprehensive Health Report
```
Generate a health report for all documentation including:
- Overall health score (0-100%)
- Issues by category and severity
- Files scanned
- Top issues requiring immediate attention
- Trends compared to last report (if available)
- Recommended next actions
```

**Expected Output**:
```
DOCUMENTATION HEALTH REPORT
===========================
Generated: 2025-11-15 14:30:00
Workspace: /Users/mmaruthurnew/Desktop/medical-patient-data/

OVERALL HEALTH SCORE: 78/100 ⚠️

Files Scanned: 45 markdown files
Total Issues Found: 23

ISSUES BY CATEGORY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Broken Links:          12 issues (CRITICAL)
Outdated Dates:         8 issues (HIGH)
Invalid Folder IDs:     2 issues (MEDIUM)
Orphaned Files:         6 issues (MEDIUM)
Duplicate Content:      5 instances (LOW)
Stale TODOs:           11 items (LOW)
Missing QLT Entries:    3 items (MEDIUM)

ISSUES BY SEVERITY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔴 CRITICAL (12): Broken links blocking navigation
🟡 HIGH (8):      Outdated documentation causing confusion
🟠 MEDIUM (11):   Quality issues needing attention
🟢 LOW (16):      Minor cleanup items

TOP PRIORITY ISSUES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Fix 12 broken internal links (affects 6 files)
2. Update 8 stale documentation files (>90 days old)
3. Add 3 missing Quick Lookup Table entries
4. Validate 2 Google Drive folder IDs
5. Archive 6 orphaned documentation files

FILES NEEDING IMMEDIATE ATTENTION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. infrastructure/SETUP.md - 4 broken links
2. workflows/DEPLOYMENT.md - 3 issues (links + stale date)
3. infrastructure/BACKUP_POLICY.md - Outdated (120 days)

RECOMMENDATIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Fix all broken links this week (estimated 2 hours)
✓ Review and update stale infrastructure docs (estimated 4 hours)
✓ Archive orphaned files to clean up workspace (estimated 1 hour)
✓ Schedule monthly documentation health checks

NEXT REVIEW DATE: 2025-12-15
```

---

## Expected Outputs

### Health Score Calculation
```
Health Score = 100 - (Weight × Count of Issues)

Weights:
- Broken Links: 3 points each
- Outdated Dates: 2 points each
- Invalid Folder IDs: 2 points each
- Broken Cross-References: 3 points each
- Duplicate Content: 1 point each
- Missing QLT Entries: 1 point each
- Inconsistent Formatting: 0.5 points each
- Orphaned Files: 1 point each
- API Version Mismatches: 2 points each
- Stale TODOs: 0.5 points each

Score Interpretation:
90-100: Excellent - Minimal issues
75-89:  Good - Some maintenance needed
60-74:  Fair - Multiple issues requiring attention
40-59:  Poor - Significant problems
0-39:   Critical - Major overhaul needed
```

### Issue Report Format
```markdown
## [Category Name]

**Total Found**: [count]
**Severity**: [CRITICAL|HIGH|MEDIUM|LOW]

### Issue #1
**File**: [path/to/file.md]
**Line**: [line number]
**Issue**: [description of problem]
**Current**: [what exists now]
**Expected**: [what should exist]
**Fix**: [suggested fix]
**Priority**: [CRITICAL|HIGH|MEDIUM|LOW]

---
```

### Summary Statistics
```
Total Files Scanned:        [count]
Total Links Checked:        [count]
Total Issues Found:         [count]
Critical Issues:            [count]
High Priority Issues:       [count]
Medium Priority Issues:     [count]
Low Priority Issues:        [count]

Estimated Fix Time:         [hours]
Recommended Action:         [immediate|schedule|batch]
```

---

## Validation Rules (Configurable)

### Link Format
```yaml
valid_link_formats:
  - pattern: '\[([^\]]+)\]\(([^)]+)\)'
    type: markdown
    description: Standard markdown links

  - pattern: '<([^>]+)>'
    type: autolink
    description: Automatic links

  - pattern: '\bhttps?://[^\s]+'
    type: bare_url
    description: Bare URLs (should be wrapped in markdown)

internal_link_rules:
  - Must not start with http:// or https://
  - Relative paths resolved from current file location
  - Absolute paths resolved from workspace root
  - Must point to existing file or valid anchor

external_link_rules:
  - Must start with http:// or https://
  - Optional: Check accessibility (may be slow)
  - Warning for http:// (prefer https://)
```

### Date Format
```yaml
valid_date_formats:
  primary: 'YYYY-MM-DD'
  secondary: 'YYYY-MM-DD HH:MM:SS'

date_field_patterns:
  - 'Last Updated:?\s*'
  - 'Updated:?\s*'
  - 'Modified:?\s*'
  - 'Date:?\s*'

staleness_thresholds:
  critical_docs: 60   # days for infrastructure, security
  regular_docs: 90    # days for standard documentation
  reference_docs: 180 # days for stable reference material
```

### Folder ID Format
```yaml
google_drive_folder_id:
  pattern: '[A-Za-z0-9_-]{28,}'
  locations:
    - 'folder[/_-]?id[:\s]*([A-Za-z0-9_-]{28,})'
    - 'drive\.google\.com/drive/folders/([A-Za-z0-9_-]{28,})'

validation:
  - Check against workspace-manifest.yml
  - Verify format is correct
  - Flag unknown IDs for manual verification
```

### Valid File Extensions
```yaml
documentation_files:
  - .md
  - .markdown

configuration_files:
  - .json
  - .yaml
  - .yml

script_files:
  - .js
  - .ts
  - .sh
  - .bash

ignore_patterns:
  - node_modules/**
  - .git/**
  - dist/**
  - build/**
  - '*.min.js'
```

---

## Health Report Format

### Executive Summary Template
```markdown
# Documentation Health Report

**Generated**: [ISO timestamp]
**Workspace**: [workspace path]
**Scan Coverage**: [percentage]
**Overall Health Score**: [score]/100

## Summary

This report covers [N] documentation files across [M] directories. The overall
health score of [score]/100 indicates [excellent/good/fair/poor/critical]
documentation quality.

### Key Findings
- [Finding 1]
- [Finding 2]
- [Finding 3]

### Recommended Actions
1. [Action 1] - Priority: [level]
2. [Action 2] - Priority: [level]
3. [Action 3] - Priority: [level]
```

### Issues by Category Template
```markdown
## Issues by Category

### Critical Issues (Immediate Action Required)
Total: [count]

#### Broken Links ([count])
[List of broken links with file locations]

#### Outdated Critical Documentation ([count])
[List of stale infrastructure/security docs]

### High Priority Issues (This Week)
Total: [count]

#### Stale Documentation ([count])
[List of outdated docs needing review]

#### Invalid References ([count])
[List of broken cross-references]

### Medium Priority Issues (This Month)
Total: [count]

#### Missing Quick Lookup Entries ([count])
[List of important undocumented files]

#### Orphaned Files ([count])
[List of unreferenced documentation]

### Low Priority Issues (Batch Processing)
Total: [count]

#### Duplicate Content ([count])
[List of duplicate sections]

#### Stale TODOs ([count])
[List of old TODO comments]
```

### Files Scanned Template
```markdown
## Files Scanned

**Total Files**: [count]
**Total Size**: [size in KB/MB]
**Scan Duration**: [seconds]

### By Directory
- infrastructure/: [count] files
- workflows/: [count] files
- development/mcp-servers/: [count] files
- .claude/custom-agents/: [count] files
- operations-workspace/: [count] files

### By Type
- Documentation (.md): [count]
- Configuration (.json): [count]
- Scripts (.js/.sh): [count]
```

### Recommendations Template
```markdown
## Recommendations

### Immediate Actions (This Week)
1. **Fix Critical Broken Links** - Estimated time: [X] hours
   - [Specific files or patterns to fix]
   - Impact: Restores navigation for [N] pages

2. **Update Stale Infrastructure Docs** - Estimated time: [X] hours
   - [List of files]
   - Impact: Ensures accuracy for critical systems

### Short-term Actions (This Month)
3. **Archive Orphaned Files** - Estimated time: [X] hour
   - Move [N] files to archive/
   - Clean up workspace structure

4. **Add Missing Quick Lookup Entries** - Estimated time: [X] hour
   - Add [N] entries to WORKSPACE_GUIDE.md
   - Improve discoverability

### Long-term Improvements
5. **Consolidate Duplicate Content** - Estimated time: [X] hours
   - Create single source of truth for [topic]
   - Add cross-references from other locations

6. **Implement Monthly Health Checks** - Ongoing
   - Schedule: 1st of each month
   - Use this agent specification
   - Track trends over time
```

### Next Review Date
```markdown
## Next Review

**Recommended Review Date**: [date 30 days from now]

**Review Triggers**:
- Monthly scheduled check (1st of month)
- After major refactoring
- Before releases
- When >10 new documentation files added

**Success Metrics**:
- Health score improved by [X] points
- Zero critical issues
- All stale docs reviewed
- Quick Lookup Table 100% accurate
```

---

## Best Practices

### Running Health Checks

#### Frequency
- **Monthly**: Scheduled on 1st of month for regular maintenance
- **After Major Changes**: When >5 files moved or restructured
- **Pre-Release**: Before version releases or major updates
- **Quarterly**: Deep dive with manual review of all findings

#### Scope
- **Full Scan**: All documentation files (monthly)
- **Targeted Scan**: Specific directories after changes
- **Quick Check**: Critical documentation only (weekly)

#### Timing
- Run during low-activity periods
- Allow 5-10 minutes for full workspace scan
- Don't block other operations
- Schedule automatic runs via cron if possible

### Issue Prioritization

#### Critical (Fix Immediately)
- Broken links in infrastructure documentation
- Invalid security configuration references
- Stale deployment procedures
- Broken cross-references in critical workflows

#### High (This Week)
- Documentation >90 days old
- Multiple broken links in single file
- Missing Quick Lookup entries for new MCPs
- Invalid folder IDs for active systems

#### Medium (This Month)
- Orphaned files (archive candidates)
- Inconsistent formatting
- Duplicate content
- Stale TODOs >60 days

#### Low (Batch Process)
- Minor formatting issues
- Stale TODOs <60 days
- Duplicate content in reference docs
- Missing descriptions in Quick Lookup

### Fix Workflows

#### Broken Links
1. Verify target file still exists (may be renamed/moved)
2. Search for file with similar name
3. Update link to correct path
4. If file deleted intentionally, update or remove link
5. Test link after fix

#### Outdated Dates
1. Review file content for accuracy
2. If content is current, update date only
3. If content needs revision, update content AND date
4. Check git history for context
5. Consider archiving if no longer relevant

#### Batch Fixes
1. Group similar issues (e.g., all broken links to same file)
2. Fix most impactful issues first
3. Use find/replace for pattern fixes
4. Validate after batch changes
5. Re-run health check to verify

### Tracking Trends

#### Metrics to Track
```yaml
monthly_metrics:
  - overall_health_score
  - total_issues_by_category
  - files_scanned_count
  - critical_issues_count
  - time_to_fix_average

trend_analysis:
  - score_change_month_over_month
  - issue_velocity (new vs. fixed)
  - most_problematic_directories
  - recurring_issues_patterns
```

#### Reporting
- Compare current score to previous month
- Highlight improvements and regressions
- Identify chronic problem areas
- Celebrate wins (zero critical issues)

### Prevention

#### During Development
- Add documentation with code changes
- Include "Last Updated" dates in templates
- Test links before committing
- Reference new files in Quick Lookup Table

#### During Refactoring
- Update all references when moving files
- Use search to find all links to moved files
- Update Quick Lookup Table entries
- Run health check after major changes

#### During Reviews
- Check documentation in code review
- Verify links work
- Ensure dates are current
- Look for duplicate content

### Automation Opportunities

#### Scheduled Checks
```bash
# Cron job for monthly health check
0 9 1 * * /usr/local/bin/claude-code "Run documentation health check and email report"
```

#### Pre-commit Hooks
```bash
# Validate links in changed files
#!/bin/bash
changed_files=$(git diff --cached --name-only --diff-filter=AM | grep '\.md$')
if [ -n "$changed_files" ]; then
  claude-code "Check links in: $changed_files"
fi
```

#### CI/CD Integration
```yaml
# GitHub Actions workflow
name: Documentation Health
on:
  schedule:
    - cron: '0 9 1 * *'  # Monthly
  pull_request:
    paths:
      - '**.md'
jobs:
  health-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Health Check
        run: claude-code "Generate documentation health report"
```

---

## Usage Examples

### Quick Link Check
```bash
claude-code "Check all links in infrastructure/ documentation"
```

### Monthly Full Scan
```bash
claude-code "Run complete documentation health check with full report"
```

### Targeted Validation
```bash
claude-code "Verify all cross-references in MCP documentation"
```

### Pre-Release Check
```bash
claude-code "Validate critical documentation before release:
infrastructure/, workflows/, and all MCP READMEs"
```

### Fix Workflow
```bash
# 1. Run health check
claude-code "Generate documentation health report"

# 2. Review report and prioritize

# 3. Fix critical issues
claude-code "Fix all broken links in infrastructure/SETUP.md"

# 4. Re-validate
claude-code "Re-check infrastructure/SETUP.md for issues"
```

---

## Agent Configuration

### Environment Variables
```bash
# Workspace root (required)
WORKSPACE_ROOT="/Users/mmaruthurnew/Desktop/medical-patient-data"

# Staleness thresholds (days)
CRITICAL_DOC_STALENESS=60
REGULAR_DOC_STALENESS=90
REFERENCE_DOC_STALENESS=180

# TODO staleness (days)
STALE_TODO_THRESHOLD=30

# Health score weights (configurable)
WEIGHT_BROKEN_LINKS=3
WEIGHT_OUTDATED_DATES=2
WEIGHT_INVALID_FOLDER_IDS=2
WEIGHT_BROKEN_XREFS=3
WEIGHT_DUPLICATE_CONTENT=1
WEIGHT_MISSING_QLT=1
WEIGHT_INCONSISTENT_FORMAT=0.5
WEIGHT_ORPHANED_FILES=1
WEIGHT_API_VERSION=2
WEIGHT_STALE_TODOS=0.5
```

### Report Output Locations
```bash
# Default report location
REPORTS_DIR="${WORKSPACE_ROOT}/operations-workspace/documentation-reports/"

# Report naming convention
REPORT_NAME="doc-health-$(date +%Y-%m-%d).md"

# Historical reports (for trend analysis)
HISTORICAL_REPORTS="${REPORTS_DIR}/history/"
```

### Exclusions
```yaml
exclude_paths:
  - node_modules/**
  - .git/**
  - dist/**
  - build/**
  - '*/archive/**'

exclude_files:
  - '*.min.js'
  - '*.bundle.js'
  - CHANGELOG.md  # Generated automatically
  - package-lock.json
```

---

## Maintenance

### Agent Updates
- Review and update validation rules quarterly
- Adjust staleness thresholds based on team velocity
- Add new validation checks as needed
- Update example prompts with real usage patterns

### Health Score Calibration
- Monitor if scores accurately reflect documentation quality
- Adjust weights if certain issues are over/under-prioritized
- Collect team feedback on usefulness
- Compare scores to manual assessments

### Pattern Improvement
- Add new patterns for emerging issues
- Refine regex patterns for better accuracy
- Reduce false positives
- Handle edge cases

---

## Troubleshooting

### Common Issues

#### "Too many files to scan"
- Use targeted scans on specific directories
- Implement pagination for large workspaces
- Increase timeout limits
- Run during off-hours

#### "False positives for orphaned files"
- Update exclusion list
- Check for non-markdown references (code files)
- Verify Quick Lookup Table is up to date
- Consider implicit references (navigation)

#### "Links reported as broken but exist"
- Check path resolution (relative vs absolute)
- Verify symbolic links are handled
- Check for case sensitivity issues
- Validate from correct working directory

#### "Slow performance"
- Cache file existence checks
- Parallelize link validation
- Skip large binary files
- Use incremental scans (only changed files)

### Support
- Agent specification: `/.claude/custom-agents/documentation-health.md`
- Report issues: Operations workspace
- Request features: Planning and roadmap
- Get help: Ask Claude Code

---

**Last Updated**: 2025-11-15
**Version**: 1.0.0
**Maintainer**: Workspace Automation Team

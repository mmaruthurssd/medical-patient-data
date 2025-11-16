# Git Safety Checklist

**Purpose**: Mandatory checklist to run BEFORE any git operation that modifies state

**When to Use**: Before any of these commands:
- `git stash`
- `git reset`
- `git checkout` (branch switching)
- `git rebase`
- `git commit --amend`
- `git clean`
- Any operation that modifies `.git/index`

---

## Pre-Flight Checklist (MANDATORY)

### 1. Check Current State
```bash
git status
```

**Questions to answer**:
- [ ] Are there uncommitted changes?
- [ ] Are there untracked files?
- [ ] Is the working tree clean?
- [ ] What branch am I on?

### 2. Ask User Before Proceeding
**NEVER run git operations without user approval**

Template:
```
I see [X uncommitted changes / Y untracked files / clean working tree].

Before proceeding with [git operation], what would you like to do?

Options:
A. Commit the changes first
B. Create a safety checkpoint (backup branch)
C. Proceed with operation
D. Cancel
```

### 3. Create Safety Checkpoint (if approved)
```bash
# Create backup branch
git branch backup-$(date +%Y%m%d-%H%M%S)

# Create git tag
git tag -a "pre-$(operation)-$(date +%Y%m%d-%H%M%S)" -m "Safety checkpoint"

# Push to GitHub (optional)
git push origin backup-$(date +%Y%m%d-%H%M%S)
```

### 4. Verify Operation is Safe
**Check**:
- [ ] Is this a test repository? (safer)
- [ ] Is this a production repository? (requires extra care)
- [ ] Has user explicitly approved?
- [ ] Is there a recent backup on GitHub?
- [ ] Are GitHub workflows configured for auto-backup?

### 5. Run Operation in Safest Way Possible

**Prefer commits over stashes**:
```bash
# INSTEAD OF: git stash
# DO THIS:
git add -A
git commit -m "WIP: temporary checkpoint before [operation]"
```

**Use dry-run mode when available**:
```bash
git clean -n  # dry-run before actual clean
```

**Run in background for long operations**:
```bash
git operation 2>&1 | tee git-operation.log &
```

### 6. Verify Operation Succeeded
```bash
git status
git log --oneline -5
git diff HEAD
```

**Questions to answer**:
- [ ] Did the operation complete?
- [ ] Is the working tree in expected state?
- [ ] Are there any error messages?
- [ ] Can we proceed, or do we need to rollback?

---

## Emergency Rollback Procedures

### If Git Corruption Detected
```bash
# 1. Check git reflog
git reflog

# 2. Reset to last known good state
git reset --hard HEAD@{1}

# 3. If that fails, restore from backup branch
git reset --hard backup-YYYYMMDD-HHMMSS

# 4. If all else fails, delete and re-clone
cd ~/Desktop
rm -rf [workspace]
git clone [github-url]
```

### If Operation Interrupted
```bash
# 1. Remove lock files
rm -f .git/index.lock .git/*.lock

# 2. Check for stale processes
ps aux | grep git

# 3. Rebuild index if corrupted
rm -f .git/index
git reset

# 4. If still broken, restore from GitHub
git fetch origin
git reset --hard origin/main
```

---

## Banned Operations (NEVER USE)

❌ `git stash` on production workspaces (use commits instead)
❌ `git reset --hard` without backup branch
❌ `git clean -fdx` without dry-run first
❌ `git rebase` without user approval
❌ `git push --force` to main/master
❌ Any git operation while another is running

---

## Allowed Operations (Safe)

✅ `git status` (read-only, always safe)
✅ `git log` (read-only)
✅ `git diff` (read-only)
✅ `git branch -l` (list branches, read-only)
✅ `git remote -v` (read-only)
✅ `git commit` (after user approval)
✅ `git add` (staging only)

---

## Enforcement Mechanisms

### 1. Read This Checklist
Before any git operation, I will:
```
1. Read this file: /Users/mmaruthurnew/Desktop/medical-patient-data/GIT-SAFETY-CHECKLIST.md
2. Follow the Pre-Flight Checklist
3. Get user approval
4. Create safety checkpoint
5. Execute operation
6. Verify success
```

### 2. Git Hooks (Automated)
See: `.git/hooks/pre-commit` for automated validation

### 3. Learning Optimizer Tracking
Log all git issues to Learning Optimizer MCP:
```json
{
  "domain": "git-operations",
  "title": "Git operation attempted without approval",
  "symptom": "Claude attempted [operation] without user consent",
  "solution": "Read GIT-SAFETY-CHECKLIST.md first",
  "prevention": "Always ask user before git operations"
}
```

---

## Success Criteria

A git operation is ONLY successful if:
- [ ] User explicitly approved
- [ ] Safety checkpoint created
- [ ] Operation completed without errors
- [ ] Working tree in expected state
- [ ] No corruption detected
- [ ] Issue logged (if any problems occurred)

---

**Last Updated**: 2025-11-15
**Version**: 1.0.0
**Status**: Active

## Revision History

- 2025-11-15: Initial creation after git corruption incident

---
type: checklist
tags: [git, safety, cross-workspace-communication, prevention]
---

# Git Commit Safety Checklist

**Purpose:** Prevent accidental mass deletions and ensure commit quality

**When to use:**
- ✅ Before ANY git commit (especially cross-workspace notifications)
- ✅ When staging files with `git add`
- ✅ When you see unexpected changes in `git status`
- ✅ After resolving merge conflicts
- ✅ When working with large file sets

**Time estimate:** 30-60 seconds per commit

---

## Pre-Commit Verification (MANDATORY)

### Step 1: Check What's Staged
```bash
git status
```

**Verify:**
- [ ] Only expected files are staged (in "Changes to be committed" section)
- [ ] No unexpected deletions shown
- [ ] No untracked files accidentally staged

**Red flags:**
- ⚠️ Hundreds of files in "Changes to be committed" when you only meant to add one
- ⚠️ Files marked as "deleted:" that you didn't intend to delete
- ⚠️ Files from unrelated directories

---

### Step 2: Review Change Statistics
```bash
git diff --cached --stat
```

**Verify:**
- [ ] File count matches expectations (e.g., 1 file for notification, not 2,143)
- [ ] Line changes make sense (insertions vs deletions)
- [ ] No unexpected file deletions

**Example Good Output:**
```
LUIGI-RECOVERY-COMPLETE.md | 180 +++++++++++++++++++++++++++++++++++++++++++
1 file changed, 180 insertions(+)
```

**Example BAD Output:**
```
2143 files changed, 288 insertions(+), 698489 deletions(-)
```
**→ STOP! Something is wrong!**

---

### Step 3: Review File-Level Changes
```bash
git diff --cached --name-status | head -20
```

**Verify:**
- [ ] No unexpected "D" (deleted) files
- [ ] All "A" (added) files are intentional
- [ ] All "M" (modified) files are expected

**Red flags:**
- ⚠️ Long list of "D" (deletions) when you only meant to add a file
- ⚠️ Critical files showing as deleted (README.md, WORKSPACE_GUIDE.md, etc.)

---

### Step 4: Selective Staging (RECOMMENDED)
```bash
# DO THIS (specific files only)
git add NOTIFICATION-FILE.md

# NOT THIS (unless you're 100% sure)
git add -A    # Stages EVERYTHING including untracked files
git add .     # Stages all changes in current directory
git commit -am "message"  # Stages all tracked files automatically
```

**Best practices:**
- [ ] Use `git add <specific-file>` for single-file commits
- [ ] Use `git add -p` for interactive staging (shows each change)
- [ ] Avoid `git add -A` unless you've verified with `git status` first

---

### Step 5: Commit Message Review
```bash
git commit -m "your message here"
```

**Verify:**
- [ ] Commit message accurately describes what's being committed
- [ ] Message doesn't say "add file" when stats show deletions
- [ ] Follows workspace commit conventions

---

## Common Scenarios

### Scenario 1: Cross-Workspace Notification File

**Task:** Add LUIGI-NOTIFICATION.md to operations-workspace

**Checklist:**
1. [ ] Create notification file
2. [ ] `git status` → Verify only 1 untracked file
3. [ ] `git add LUIGI-NOTIFICATION.md` (specific file only!)
4. [ ] `git diff --cached --stat` → Verify 1 file, X insertions, 0 deletions
5. [ ] `git commit -m "team: notification message"`
6. [ ] `git push origin main`

**Time:** ~2 minutes

---

### Scenario 2: Fixing Sync Issues (Multiple Files)

**Task:** Add 2,146 missing files to git

**Checklist:**
1. [ ] Identify which files need to be added (create list)
2. [ ] `git status` → Verify expected files are untracked
3. [ ] Stage files: `git add workspace-management/ templates-and-patterns/` (by directory)
4. [ ] `git diff --cached --stat` → Verify count matches expectations (~2,146 files)
5. [ ] `git diff --cached --name-status | grep "^D"` → Verify NO deletions
6. [ ] Review commit message matches actual changes
7. [ ] `git commit -m "fix: add missing documentation and source directories"`
8. [ ] `git push origin main`

**Time:** ~5 minutes

---

### Scenario 3: Recovery from Accidental Staging

**Problem:** You ran `git add -A` and staged files you didn't mean to

**Solution:**
```bash
# Unstage everything
git reset HEAD

# Start over with specific files
git add <file-you-actually-want>
git status  # Verify
git commit -m "message"
```

---

## Emergency: Committed Wrong Changes

### If You Haven't Pushed Yet

```bash
# Undo last commit, keep changes
git reset --soft HEAD~1

# Review what was committed
git diff --stat

# Fix and recommit properly
git add <correct-files>
git commit -m "corrected message"
```

### If You Already Pushed

```bash
# DO NOT force push to shared branches!
# Instead, create a recovery commit

# Revert the problematic commit
git revert <commit-hash>

# Or restore specific files
git checkout <commit-before-problem> -- <files-to-restore>
git commit -m "fix: restore accidentally deleted files"
git push origin main
```

---

## Pre-Commit Hook (Automated Safety)

**Location:** `.git/hooks/pre-commit`

**What it does:**
- ✅ Automatically checks deletion counts before commit
- ✅ Warns if >1,000 lines or >10 files being deleted
- ✅ Prompts for confirmation before allowing commit
- ✅ Can be bypassed with `git commit --no-verify` (NOT recommended)

**Install in all workspaces:**
```bash
# Already installed in operations-workspace
# Install in other workspaces:
cp operations-workspace/.git/hooks/pre-commit medical-patient-data/.git/hooks/
cp operations-workspace/.git/hooks/pre-commit mcp-infrastructure/.git/hooks/
chmod +x medical-patient-data/.git/hooks/pre-commit
chmod +x mcp-infrastructure/.git/hooks/pre-commit
```

---

## Lessons from the 2025-11-14 Incident

**What happened:**
- Commit 8146161 intended to add 1 notification file
- Instead deleted 698,489 lines across 2,143 files
- Files were untracked locally, staged for deletion accidentally

**Root causes:**
1. Used `git commit -am` or `git add -A` without verification
2. Didn't check `git diff --cached --stat` before committing
3. No pre-commit hook to catch mass deletions

**How this checklist prevents it:**
- ✅ Step 2 would show: "2143 files changed, 698489 deletions(-)" → RED FLAG
- ✅ Step 3 would show: Long list of "D" files → RED FLAG
- ✅ Step 4 enforces selective staging → Can't happen
- ✅ Pre-commit hook would block with warning

---

## Quick Reference Card

**Before every commit:**
```bash
git status                          # What's staged?
git diff --cached --stat           # How many changes?
git diff --cached --name-status    # Any deletions?
```

**Safe staging:**
```bash
git add <specific-file>            # Best for single files
git add <directory>                # OK for related changes
git add -p                          # Interactive (safest)
```

**Danger zone:**
```bash
git add -A                          # Stages EVERYTHING (verify first!)
git add .                           # Stages all in current dir (verify first!)
git commit -am "msg"               # Auto-stages all (verify first!)
```

---

## Checklist Maintenance

**Review frequency:** Quarterly
**Owner:** Luigi (medical-patient-data workspace)
**Last updated:** 2025-11-14
**Next review:** 2026-02-14

**Updates needed:**
- Add lessons learned from future incidents
- Refine thresholds based on actual usage
- Incorporate feedback from team members

---

**Status:** 🟢 Active - Use before EVERY commit
**Enforcement:** Recommended (manual) + Automated (pre-commit hook)

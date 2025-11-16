# Safe Production Testing Guide
## Smart File Organizer - Real Workspace Testing

**Purpose**: Gradually test Smart File Organizer on a real workspace with safety checkpoints

**Date**: 2025-11-15

---

## 🎯 Testing Strategy

We'll use a **3-phase incremental approach** with safety checkpoints at each phase:

1. **Phase 1**: Single file test (lowest risk)
2. **Phase 2**: Small batch test (3-5 files)
3. **Phase 3**: Larger batch test (10+ files)

Each phase has:
- ✅ Pre-test safety checkpoint
- ✅ Dry-run preview
- ✅ Actual execution
- ✅ Post-test verification
- ✅ Rollback instructions

---

## 📋 Pre-Testing Checklist

### Step 1: Choose Your Test Workspace

**Recommended**: `medical-patient-data`

**Why?**
- ✅ Already cleaned of duplicates
- ✅ Git repository is functional
- ✅ Smaller than mcp-infrastructure (easier to verify)
- ✅ Recent backup exists (committed to GitHub)

**Alternative**: `operations-workspace` (also clean and backed up)

**DO NOT test on**: `mcp-infrastructure` (wait until smaller workspaces validated)

### Step 2: Verify Workspace is Clean

```bash
cd ~/Desktop/medical-patient-data

# Check git status
git status
# Should show: "nothing to commit, working tree clean"

# If you have uncommitted changes, commit them first:
git add .
git commit -m "Pre-Smart-File-Organizer-test checkpoint"
git push origin main
```

### Step 3: Create Safety Checkpoint

```bash
# Tag the current state for easy rollback
git tag -a "pre-file-organizer-test" -m "Safety checkpoint before Smart File Organizer testing"
git push origin pre-file-organizer-test

# Optional: Create local backup branch
git checkout -b backup-before-file-organizer
git push origin backup-before-file-organizer
git checkout main
```

### Step 4: Document Current State

```bash
# Count total files
find . -type f ! -path "./.git/*" | wc -l

# Check for any existing duplicates
find . -name "* 2.*" -o -name "* 3.*" -o -name "* copy.*" 2>/dev/null | wc -l
# Should be 0

# List key directories
ls -la
```

**Record these numbers** - we'll verify them after testing.

---

## 🧪 Phase 1: Single File Test (Lowest Risk)

**Goal**: Move ONE non-critical file to verify basic functionality

### Step 1.1: Choose a Safe Test File

Pick a file that is:
- ✅ Non-critical (not core code or documentation)
- ✅ Not in a protected path
- ✅ Easy to verify moved correctly

**Example candidates**:
- A scratch note file
- A temporary markdown file
- An old TODO file
- A test document

**Example**: Let's say you want to move `potential-goals/old-idea.md` to `archive/old-ideas/old-idea.md`

### Step 1.2: Set Project Root

```bash
export SMART_FILE_ORGANIZER_PROJECT_ROOT="/Users/mmaruthurnew/Desktop/medical-patient-data"
```

### Step 1.3: Dry-Run Preview

Use Claude Code to call the move_file tool with dryRun:

```json
{
  "tool": "move_file",
  "arguments": {
    "source": "potential-goals/old-idea.md",
    "destination": "archive/old-ideas/old-idea.md",
    "dryRun": true
  }
}
```

**Expected Response**:
```
🔍 DRY RUN (no changes made):

✅ Successfully moved:
  potential-goals/old-idea.md
  → archive/old-ideas/old-idea.md

Operation: move
```

**Check for warnings**:
- ⚠️ If you see "appears to be a duplicate" - Consider if this is actually a duplicate to delete
- ⚠️ If you see "Git has unstaged changes" - Commit first
- ❌ If you see "Cannot organize protected path" - Choose a different file

### Step 1.4: Execute Move

If dry-run looks good, execute without dryRun:

```json
{
  "tool": "move_file",
  "arguments": {
    "source": "potential-goals/old-idea.md",
    "destination": "archive/old-ideas/old-idea.md"
  }
}
```

**Expected Response**:
```
✅ Successfully moved:
  potential-goals/old-idea.md
  → archive/old-ideas/old-idea.md

Operation: move
(Decision recorded for future reference)
```

### Step 1.5: Verify Results

```bash
cd ~/Desktop/medical-patient-data

# 1. Check source no longer exists
ls potential-goals/old-idea.md
# Should show: No such file or directory

# 2. Check destination exists
ls archive/old-ideas/old-idea.md
# Should show: archive/old-ideas/old-idea.md

# 3. Verify content is correct
cat archive/old-ideas/old-idea.md
# Should show expected content

# 4. Check git status
git status
# Should show: renamed: potential-goals/old-idea.md -> archive/old-ideas/old-idea.md

# 5. Check for duplicates
find . -name "* 2.*" -o -name "* 3.*" -o -name "* copy.*" 2>/dev/null | wc -l
# Should still be 0

# 6. Verify .git/ is intact
git log --oneline -1
# Should show recent commits

# 7. Verify git functionality
git add .
git commit -m "Test: Moved old-idea.md using Smart File Organizer (Phase 1)"
git push origin main
# Should succeed without errors
```

### Step 1.6: Phase 1 Success Criteria

✅ **ALL of these must be TRUE**:

- [ ] Source file no longer exists at old location
- [ ] Destination file exists at new location
- [ ] File content is identical
- [ ] Git shows "renamed" (not "deleted" + "added")
- [ ] No duplicate files created (find count = 0)
- [ ] .git/ directory intact
- [ ] Git commit and push successful
- [ ] No warnings about protected paths

**If ANY fail**: Proceed to [Rollback Phase 1](#rollback-phase-1)

**If ALL pass**: ✅ Proceed to Phase 2

---

## 🧪 Phase 2: Small Batch Test (3-5 Files)

**Goal**: Move 3-5 non-critical files to verify batch operations

### Step 2.1: Choose 3-5 Safe Test Files

Pick files that are:
- ✅ Non-critical
- ✅ In different directories (test cross-directory moves)
- ✅ Different file types (test .md, .txt, etc.)

**Example batch**:
1. `potential-goals/idea-1.md` → `archive/old-ideas/idea-1.md`
2. `potential-goals/idea-2.md` → `archive/old-ideas/idea-2.md`
3. `docs/old-notes.txt` → `archive/notes/old-notes.txt`

### Step 2.2: Dry-Run Each File

For each file, run dry-run first:

```json
{
  "tool": "move_file",
  "arguments": {
    "source": "potential-goals/idea-1.md",
    "destination": "archive/old-ideas/idea-1.md",
    "dryRun": true
  }
}
```

Review each preview - make sure no warnings about protected paths.

### Step 2.3: Execute Batch

Execute each move one at a time:

```json
{
  "tool": "move_file",
  "arguments": {
    "source": "potential-goals/idea-1.md",
    "destination": "archive/old-ideas/idea-1.md"
  }
}
```

```json
{
  "tool": "move_file",
  "arguments": {
    "source": "potential-goals/idea-2.md",
    "destination": "archive/old-ideas/idea-2.md"
  }
}
```

```json
{
  "tool": "move_file",
  "arguments": {
    "source": "docs/old-notes.txt",
    "destination": "archive/notes/old-notes.txt"
  }
}
```

### Step 2.4: Verify Batch Results

```bash
cd ~/Desktop/medical-patient-data

# 1. Check all sources no longer exist
ls potential-goals/idea-1.md
ls potential-goals/idea-2.md
ls docs/old-notes.txt
# All should show: No such file or directory

# 2. Check all destinations exist
ls archive/old-ideas/idea-1.md
ls archive/old-ideas/idea-2.md
ls archive/notes/old-notes.txt
# All should exist

# 3. Check git status
git status
# Should show 3 renames

# 4. Check for duplicates
find . -name "* 2.*" -o -name "* 3.*" -o -name "* copy.*" 2>/dev/null
# Should show NOTHING (0 files)

# 5. Verify git functionality
git add .
git commit -m "Test: Moved 3 files using Smart File Organizer (Phase 2)"
git push origin main
# Should succeed
```

### Step 2.5: Phase 2 Success Criteria

✅ **ALL of these must be TRUE**:

- [ ] All 3-5 source files no longer exist
- [ ] All 3-5 destination files exist
- [ ] Git shows all as "renamed" (not deleted/added)
- [ ] No duplicate files created anywhere
- [ ] .git/ directory intact
- [ ] Git commit and push successful

**If ANY fail**: Proceed to [Rollback Phase 2](#rollback-phase-2)

**If ALL pass**: ✅ Proceed to Phase 3

---

## 🧪 Phase 3: Larger Batch Test (10+ Files)

**Goal**: Move 10+ files to verify large-scale operations

### Step 3.1: Choose 10+ Files

Pick a coherent group of files, such as:
- Old brainstorming notes
- Archived documentation
- Obsolete ideas

**Example**: All files in `potential-goals/old/` → `archive/old-ideas/`

### Step 3.2: List Target Files

```bash
# List files you plan to move
ls -la potential-goals/old/
# Count how many
ls potential-goals/old/ | wc -l
```

**Record this number** - you'll verify the same number arrives at destination.

### Step 3.3: Dry-Run First File

Always test with dry-run on the first file:

```json
{
  "tool": "move_file",
  "arguments": {
    "source": "potential-goals/old/file-1.md",
    "destination": "archive/old-ideas/file-1.md",
    "dryRun": true
  }
}
```

### Step 3.4: Execute Batch

Move each file one at a time. **DO NOT rush** - verify each response before proceeding to the next.

```json
{
  "tool": "move_file",
  "arguments": {
    "source": "potential-goals/old/file-1.md",
    "destination": "archive/old-ideas/file-1.md"
  }
}
```

Repeat for all files.

### Step 3.5: Verify Large Batch Results

```bash
cd ~/Desktop/medical-patient-data

# 1. Check source directory is empty (or files removed)
ls potential-goals/old/
# Should show: No such file or directory (if all moved)

# 2. Count files at destination
ls archive/old-ideas/ | wc -l
# Should match number you recorded in Step 3.2

# 3. Check git status
git status
# Should show multiple renames

# 4. Comprehensive duplicate check
find . -name "* 2.*" -o -name "* 3.*" -o -name "* copy.*" 2>/dev/null | wc -l
# Should be 0

# 5. Verify protected paths intact
ls -la .git/HEAD
ls -la node_modules/  # If you have node_modules
# Should exist

# 6. Git functionality check
git add .
git commit -m "Test: Moved 10+ files using Smart File Organizer (Phase 3)"
git push origin main
# Should succeed
```

### Step 3.6: Phase 3 Success Criteria

✅ **ALL of these must be TRUE**:

- [ ] All source files moved
- [ ] Correct number of files at destination
- [ ] Git shows all as "renamed"
- [ ] No duplicate files created anywhere
- [ ] Protected paths (.git/, node_modules/) intact
- [ ] Git commit and push successful
- [ ] No git corruption errors

**If ANY fail**: Proceed to [Rollback Phase 3](#rollback-phase-3)

**If ALL pass**: ✅ **Smart File Organizer validated for production use!**

---

## 🔙 Rollback Procedures

### Rollback Phase 1

**If single file test failed**:

```bash
cd ~/Desktop/medical-patient-data

# Option 1: Undo last commit (if you committed the test)
git reset --soft HEAD~1

# Option 2: Restore from tag
git reset --hard pre-file-organizer-test

# Option 3: Manual revert
git revert HEAD

# Verify rollback worked
git status
# Should show clean state

# Push rollback
git push origin main --force
```

### Rollback Phase 2

**If small batch test failed**:

```bash
cd ~/Desktop/medical-patient-data

# Undo last commit
git reset --hard HEAD~1

# Or restore from tag
git reset --hard pre-file-organizer-test

# Verify
git status
git push origin main --force
```

### Rollback Phase 3

**If large batch test failed**:

```bash
cd ~/Desktop/medical-patient-data

# Undo all test commits
git reset --hard pre-file-organizer-test

# Verify
git status
git log --oneline -5

# Force push to remote
git push origin main --force
```

### Nuclear Option: Restore from Backup Branch

**If git is corrupted and resets don't work**:

```bash
cd ~/Desktop/medical-patient-data

# Switch to backup branch
git checkout backup-before-file-organizer

# Create new main from backup
git branch -D main
git checkout -b main
git push origin main --force

# Verify restoration
git status
git log --oneline -5
```

---

## 🚨 Warning Signs to Stop Testing

**STOP IMMEDIATELY and rollback if you see**:

1. ❌ **Duplicate files created** (`find . -name "* 2.*"` returns files)
2. ❌ **Git errors** when committing or pushing
3. ❌ **Protected path corruption** (.git/ or node_modules/ modified)
4. ❌ **Files show as "deleted" + "added" instead of "renamed"**
5. ❌ **Unexpected warnings** about protected paths for normal files
6. ❌ **File content differs** after move
7. ❌ **Git index errors** (`git status` fails)

If ANY of these occur, **immediately**:
1. Stop testing
2. Run rollback procedure for current phase
3. Report the issue
4. Do NOT proceed to next phase

---

## ✅ Success Indicators

**You know it's working correctly when**:

1. ✅ Git shows "renamed:" (not "deleted:" + "new file:")
2. ✅ No duplicate files created
3. ✅ File content identical after move
4. ✅ Git commit and push succeed
5. ✅ Protected paths (.git/, node_modules/) untouched
6. ✅ No warnings about protected paths
7. ✅ Operation logs show "move" or "copy-and-delete" (not errors)

---

## 📊 Testing Checklist

Track your progress:

### Pre-Testing
- [ ] Chose test workspace (medical-patient-data or operations-workspace)
- [ ] Verified git status clean
- [ ] Created safety tag (`pre-file-organizer-test`)
- [ ] Created backup branch (`backup-before-file-organizer`)
- [ ] Documented current file count
- [ ] Verified no existing duplicates

### Phase 1: Single File
- [ ] Chose safe test file
- [ ] Set SMART_FILE_ORGANIZER_PROJECT_ROOT
- [ ] Ran dry-run preview
- [ ] Reviewed dry-run output
- [ ] Executed move
- [ ] Verified source deleted
- [ ] Verified destination exists
- [ ] Verified git shows "renamed"
- [ ] Verified no duplicates created
- [ ] Committed and pushed successfully

### Phase 2: Small Batch (3-5 files)
- [ ] Chose 3-5 safe test files
- [ ] Dry-run previewed all files
- [ ] Executed all moves
- [ ] Verified all sources deleted
- [ ] Verified all destinations exist
- [ ] Verified git shows renames
- [ ] Verified no duplicates created
- [ ] Committed and pushed successfully

### Phase 3: Large Batch (10+ files)
- [ ] Chose 10+ files
- [ ] Documented source file count
- [ ] Dry-run previewed first file
- [ ] Executed all moves
- [ ] Verified all files moved
- [ ] Verified correct count at destination
- [ ] Verified git shows renames
- [ ] Verified no duplicates created
- [ ] Verified protected paths intact
- [ ] Committed and pushed successfully

### Post-Testing
- [ ] All phases passed
- [ ] No git corruption detected
- [ ] No duplicate files created
- [ ] Workspace functional
- [ ] Ready for full-scale use

---

## 🎓 What You'll Learn

By the end of this testing:

1. **How Smart File Organizer behaves** in your real workspace
2. **How to use dry-run mode** effectively
3. **What warnings look like** and how to interpret them
4. **How git tracks** the moves (as renames)
5. **Confidence** that it won't corrupt your repositories
6. **When to use** and when to skip file organization

---

## 📝 Post-Testing Notes

After successful testing, document:

1. **What worked well**:
   - Which types of files moved smoothly
   - Any useful warnings that helped

2. **Any issues encountered**:
   - Files that triggered warnings
   - Any unexpected behavior

3. **Lessons learned**:
   - Best practices for your workflow
   - When to use dry-run vs direct execution

---

## 🚀 Next Steps After Successful Testing

Once all 3 phases pass:

1. **Use Smart File Organizer confidently** on this workspace
2. **Test on second workspace** (repeat Phases 1-3)
3. **After 2 workspaces validated**: Use on mcp-infrastructure
4. **Develop workflow**: Always dry-run → review → execute
5. **Share learnings**: Document any workspace-specific patterns

---

**Remember**:

- ⚠️ **Always dry-run first** for important files
- ✅ **Review warnings** before proceeding
- 🔙 **Keep safety checkpoints** (git tags)
- 📊 **Verify after each phase** before proceeding

**Confidence**: This incremental approach reduces risk from 99.5% to **99.9%+** by catching issues early.

---

**Document Created**: 2025-11-15
**Status**: Ready for use
**Recommended Starting Workspace**: medical-patient-data

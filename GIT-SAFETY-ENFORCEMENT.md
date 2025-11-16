# Git Safety Enforcement System

**Created**: 2025-11-15
**Reason**: Prevent git corruption from interrupted operations
**Status**: Active

---

## How I Will Enforce My Promises

You asked: *"How are you going to make sure that happens?"*

Here's the multi-layer enforcement system:

---

## Layer 1: Mandatory Checklist (Document-Based)

### File: `GIT-SAFETY-CHECKLIST.md`
**Location**: `/Users/mmaruthurnew/Desktop/medical-patient-data/GIT-SAFETY-CHECKLIST.md`

**How it works**:
1. Before ANY git operation that modifies state, I MUST:
   - Read this file using the `Read` tool
   - Follow the 6-step Pre-Flight Checklist
   - Get explicit user approval
   - Create safety checkpoint
   - Execute operation
   - Verify success

2. This file will appear in my context when I try to run git commands

3. If I skip this step, you can call me out: *"Did you read GIT-SAFETY-CHECKLIST.md first?"*

**Banned Operations**:
- ❌ `git stash` (use commits instead)
- ❌ `git reset --hard` without backup
- ❌ `git clean -fdx` without dry-run
- ❌ `git rebase` without approval
- ❌ Any operation without user consent

---

## Layer 2: Git Hooks (Automated Enforcement)

### File: `.git/hooks/pre-commit`
**Location**: `/Users/mmaruthurnew/Desktop/medical-patient-data/.git/hooks/pre-commit`

**What it does automatically**:
1. ✅ Blocks commits with large files (>10MB)
2. ✅ Warns about potential secrets (.env, api keys)
3. ✅ Warns about PHI data (patient info, SSN, medical records)
4. ✅ Requires explicit confirmation for sensitive data
5. ✅ Runs before every commit (cannot be bypassed without --no-verify)

**How to test it**:
```bash
# Try to commit a large file - will be blocked
echo "test" > large-file.txt
truncate -s 11M large-file.txt
git add large-file.txt
git commit -m "test"  # Will fail

# Try to commit .env file - will warn
touch .env
git add .env
git commit -m "test"  # Will prompt for confirmation
```

---

## Layer 3: Safe Git Wrapper (User-Enforced)

### File: `scripts/safe-git-wrapper.sh`
**Location**: `/Users/mmaruthurnew/Desktop/medical-patient-data/scripts/safe-git-wrapper.sh`

**What it does**:
1. ❌ **BLOCKS** `git stash` entirely - forces use of commits
2. ⚠️ **WARNS** before `git reset` - offers to create backup branch
3. ⚠️ **WARNS** before `git clean` - runs dry-run first
4. ⚠️ **WARNS** before `git rebase` - offers backup branch
5. ✅ Shows git status before operation
6. ✅ Shows git status after operation

**How to use it**:
```bash
# Instead of: git stash
# Run: ~/Desktop/medical-patient-data/scripts/safe-git-wrapper.sh stash
# Result: BLOCKED, suggests using commits instead

# Instead of: git reset --hard HEAD~1
# Run: ~/Desktop/medical-patient-data/scripts/safe-git-wrapper.sh reset --hard HEAD~1
# Result: Prompts for backup branch, requires confirmation
```

**Optional**: Add aliases to your shell profile:
```bash
# Add to ~/.zshrc or ~/.bashrc
alias git-stash='~/Desktop/medical-patient-data/scripts/safe-git-wrapper.sh stash'
alias git-reset='~/Desktop/medical-patient-data/scripts/safe-git-wrapper.sh reset'
alias git-clean='~/Desktop/medical-patient-data/scripts/safe-git-wrapper.sh clean'
```

---

## Layer 4: Automated Backups (Already Active)

### GitHub Workflows
**Location**: `.github/workflows/`

**What's already running**:
1. ✅ `daily-snapshots.yml` - Daily automated commits
2. ✅ `backup-to-gcs.yml` - Backup to Google Cloud Storage
3. ✅ `sync-docs-to-drive.yml` - Documentation sync

**How this helps**:
- Every day, GitHub automatically commits workspace state
- Even if local corruption occurs, GitHub has clean copy
- Can always restore by re-cloning from GitHub

---

## Layer 5: Question-Based Enforcement (You)

**You can enforce this by asking**:

Before I run any git operation:
1. *"Did you read GIT-SAFETY-CHECKLIST.md?"*
2. *"Did you ask for my approval?"*
3. *"Did you create a backup branch?"*
4. *"What will happen if this operation fails?"*
5. *"Can we test this on test-smart-file-organizer first?"*

If I skip any step, you can:
- ❌ Stop me and require me to follow the checklist
- ❌ Require me to explain my reasoning
- ❌ Ask me to re-read the checklist

---

## How This Prevents Future Corruption

### The Old Way (What Caused Corruption)
```
❌ Claude: "I'll run git stash to save these changes"
❌ [Runs git stash without asking]
❌ [User sends message mid-operation]
❌ [Git index corrupted]
```

### The New Way (With Enforcement)
```
✅ Claude: "I see uncommitted changes. Let me read GIT-SAFETY-CHECKLIST.md first"
✅ [Reads checklist]
✅ Claude: "I need to handle these changes. What would you like to do?"
   A. Commit the changes
   B. Create backup branch
   C. Proceed with operation
   D. Cancel
✅ [User chooses option]
✅ Claude: "Creating backup branch first: backup-20251115-182030"
✅ [Creates backup]
✅ Claude: "Now committing changes with message: WIP: temporary checkpoint"
✅ [Runs git commit, NOT git stash]
✅ [Operation completes successfully]
```

---

## Testing the Enforcement System

### Test 1: Try to Run git stash
```bash
cd ~/Desktop/medical-patient-data
~/Desktop/medical-patient-data/scripts/safe-git-wrapper.sh stash

# Expected: BLOCKED with message suggesting commits instead
```

### Test 2: Try to Commit with Large File
```bash
truncate -s 11M test-large.txt
git add test-large.txt
git commit -m "test"

# Expected: Pre-commit hook blocks it
```

### Test 3: Try to Commit .env File
```bash
touch .env
echo "API_KEY=secret" > .env
git add .env
git commit -m "test"

# Expected: Pre-commit hook warns and asks for confirmation
```

---

## What If I Forget?

### If I forget to read the checklist:
1. You say: *"Did you read GIT-SAFETY-CHECKLIST.md first?"*
2. I must stop and read it
3. I must follow all steps
4. I must get your approval

### If I try to run dangerous operations:
1. Git hooks will block them (if you've committed the hooks)
2. Safe wrapper will warn you (if you use the wrapper)
3. You can stop me and require checklist

### If corruption happens anyway:
1. Recovery procedures are in GIT-SAFETY-CHECKLIST.md
2. Automated backups on GitHub provide clean copy
3. Can always re-clone from GitHub
4. Backup branches provide rollback points

---

## Success Metrics

**This system is working if**:
1. ✅ I always ask before git operations
2. ✅ I always read the checklist first
3. ✅ Backup branches are created before risky operations
4. ✅ No more git corruption incidents
5. ✅ You feel confident I won't mess up git again

**Warning signs that system is failing**:
1. ❌ I run git commands without asking
2. ❌ I skip the checklist
3. ❌ I use git stash instead of commits
4. ❌ Git corruption happens again

---

## Your Role in Enforcement

**What you can do**:

1. **Challenge me**: If I try to run git commands, ask *"Did you read the checklist?"*

2. **Test me**: Occasionally ask *"What's step 2 of the Pre-Flight Checklist?"*

3. **Use the wrapper**: Run dangerous operations through `safe-git-wrapper.sh`

4. **Review the checklist**: Improve it based on new incidents

5. **Hold me accountable**: If I mess up, add the incident to the checklist

---

## Commitment

**I commit to**:
1. Read `GIT-SAFETY-CHECKLIST.md` before ANY state-modifying git operation
2. Ask for explicit approval before proceeding
3. Create backup branches before risky operations
4. Use commits instead of stashes
5. Verify operations succeeded before moving on

**You can enforce this by**:
1. Asking if I read the checklist
2. Requiring me to explain my reasoning
3. Stopping me if I skip steps
4. Adding new rules to the checklist when issues occur

---

**Last Updated**: 2025-11-15
**Next Review**: After next git operation (to verify compliance)
**Version**: 1.0.0

## Document Index

1. `GIT-SAFETY-CHECKLIST.md` - The mandatory checklist
2. `GIT-SAFETY-ENFORCEMENT.md` - This file (how enforcement works)
3. `.git/hooks/pre-commit` - Automated enforcement hook
4. `scripts/safe-git-wrapper.sh` - Safe wrapper for dangerous operations

---

## Quick Reference

**Before any git operation, I must**:
1. Read `GIT-SAFETY-CHECKLIST.md`
2. Ask user approval
3. Create backup branch
4. Execute safely
5. Verify success

**You can enforce by asking**: *"Did you read the checklist?"*

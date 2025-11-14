# Data Protection & Backup Strategy

## Critical Data Assets

This repository contains critical production data that must NEVER be accidentally deleted:
- **Production Sheets** (588 sheets): `production-sheets/`
- **Staging Sheets**: `staging-sheets/`
- **Configuration**: `config/sheet-registry.json`

## Automated Protections

### 1. Git Pre-Commit Hook

**Location:** `.git/hooks/pre-commit`

**What it does:**
- Automatically runs before every `git commit`
- Blocks commits that would delete more than 10 production sheets
- Blocks commits that would delete more than 10 staging sheets
- Blocks commits that would delete `sheet-registry.json`

**Example output when protection triggers:**
```
❌ COMMIT BLOCKED: Attempting to delete 588 production sheets!

This commit would delete production sheet data.
If you really need to delete sheets, removing this many deletions at once is not allowed.

To bypass this check (DANGEROUS):
  git commit --no-verify
```

**How to bypass (ONLY if intentional):**
```bash
git commit --no-verify -m "your message"
```

### 2. GitHub Automated Backups

**Schedule:** Daily at 9 AM and 5 PM Central Time

**What's backed up:**
- All production sheet Apps Script code
- All staging sheet Apps Script code
- Sheet metadata and configuration
- Commit history with timestamps

**Backup location:** GitHub repository main branch

**Recent backups:**
- You can view all backups in git history: `git log --oneline`
- Each automated snapshot commit contains a full backup
- Example: `chore: automated snapshot 2025-11-11 14:15:59`

### 3. Recovery Procedures

**If files are accidentally deleted locally:**
```bash
# Restore from last commit
git checkout HEAD -- production-sheets/

# Or restore from specific commit
git checkout <commit-hash> -- production-sheets/
```

**If files are accidentally deleted and committed (but not pushed):**
```bash
# Undo the last commit, keep files
git reset --soft HEAD~1

# Unstage everything
git reset HEAD

# Check status
git status
```

**If files are accidentally deleted, committed, AND pushed:**
```bash
# Revert the commit (creates new commit undoing changes)
git revert <bad-commit-hash>
git push
```

## Backup Verification

**Check local file count:**
```bash
ls -d production-sheets/sheet-* | wc -l
ls -d staging-sheets/sheet-* 2>/dev/null | wc -l || echo "0"
```

**Expected counts:**
- Production sheets: 588 (as of Nov 11, 2025)
- Staging sheets: Varies by environment

**Check GitHub backups:**
```bash
# View recent automated backups
git log --oneline --grep="automated snapshot" -10

# View what's in a specific backup
git show <commit-hash>:config/sheet-registry.json
```

## What to Do If You Suspect Data Loss

1. **STOP immediately** - Don't make any more changes
2. **Check local files:**
   ```bash
   ls -la production-sheets/ | wc -l
   ls -la config/sheet-registry.json
   ```
3. **Check git status:**
   ```bash
   git status
   git log -5 --stat
   ```
4. **If files are missing locally but exist in Git:**
   ```bash
   git checkout HEAD -- production-sheets/
   git checkout HEAD -- staging-sheets/
   git checkout HEAD -- config/
   ```
5. **Verify the restore:**
   ```bash
   ls -d production-sheets/sheet-* | wc -l
   ```

## Daily Snapshot Run Log

All automated snapshot runs are logged to Google Sheets:
- **Sheet ID:** `1KpUhrEtW7-uHHS6GIngiXws0v2aM2wBC5ppyDBnRKxc`
- **Sheet Name:** "Daily Snapshot Log - SSD Google Sheets"
- **Location:** "AI Development - No PHI" shared drive

The log tracks:
- Run date and time (Central Time)
- Success/failure status
- Number of sheets processed
- Batch results (135/135/134)
- Duration
- GitHub Actions run link
- Commit SHA

## Security Best Practices

1. **Never use `git add .`** when committing - Always specify exact files
2. **Always check `git status`** before committing
3. **Never force push** to main branch: `git push --force` is FORBIDDEN
4. **Test commands** on a single file first before running on all files
5. **Use git hooks** - Don't bypass with `--no-verify` unless absolutely necessary
6. **Review diffs** before pushing: `git diff --cached`

## Emergency Contacts

If you need to recover data and can't figure it out:
1. Check this document first
2. Review recent commits: `git log -10`
3. Check GitHub Actions logs for automated backups
4. The Google Sheets themselves are the source of truth - repository is a backup

## Protection System Test

To verify the pre-commit hook is working:
```bash
# This should be BLOCKED by the hook
# DO NOT actually run this - it's just an example
# git rm production-sheets/sheet-000*
# git commit -m "test"
# Should output: ❌ COMMIT BLOCKED
```

## Last Updated

- Date: 2025-11-11
- By: Claude Code (AI Assistant)
- Reason: Implemented automated protection after near-miss incident

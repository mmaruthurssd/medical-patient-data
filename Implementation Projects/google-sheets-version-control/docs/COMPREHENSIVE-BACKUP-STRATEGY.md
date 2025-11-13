# Comprehensive Backup & Data Protection Strategy

**Last Updated:** 2025-11-11
**System:** Google Sheets Version Control (588 Production Sheets)
**Repository:** https://github.com/mmaruthurssd/ssd-google-sheets-staging-production

---

## Executive Summary

This document defines a **6-layer defense-in-depth backup strategy** to protect 588 production Apps Script projects. Each layer provides redundancy and different recovery scenarios.

**Risk Assessment:** Near-miss incident where git attempted to delete 3,816 files. Caught by pre-commit hook and reversed, but revealed need for comprehensive protection.

---

## The Six Layers of Protection

### Layer 1: Source of Truth (Google Drive)
**Status:** ✅ Active
**Protection Level:** Primary
**Recovery Time:** Immediate (if only git backup lost)

- **What it protects:** The actual Google Sheets and Apps Script code live in Google Drive
- **How it works:** Apps Script projects are bound to Google Sheets, stored in Google Drive
- **Recovery method:** Use `clasp pull` to re-download any Apps Script code from Google Drive
- **Limitation:** Protects code but NOT data in sheets (that's a separate backup concern)

**Key Insight:** If GitHub is completely lost, we can rebuild by pulling from Google Drive. This is your ultimate fallback.

### Layer 2: Git Version Control (Local Repository)
**Status:** ✅ Active
**Protection Level:** Local
**Recovery Time:** Instant

- **What it protects:** Full commit history, point-in-time snapshots
- **How it works:** Every change is committed with timestamp, creating recovery points
- **Current state:**
  - 588 production sheets tracked
  - Pre-commit hook blocks >10 deletions
  - Files are properly tracked (not in .gitignore)

**Commands:**
```bash
# Ensure directories are force-added and tracked
git add -f production-sheets/
git add -f staging-sheets/
git add -f config/sheet-registry.json

# Create .gitattributes to ensure tracking
echo "production-sheets/** -merge" >> .gitattributes
echo "staging-sheets/** -merge" >> .gitattributes
echo "config/sheet-registry.json -merge" >> .gitattributes
```

### Layer 3: GitHub Remote Repository
**Status:** ✅ Active
**Protection Level:** Cloud redundancy
**Recovery Time:** Minutes (git clone)

- **What it protects:** Full repository backup on GitHub servers
- **How it works:** Every push creates remote backup, GitHub maintains its own redundancy
- **Current state:** Daily automated snapshots at 9 AM and 5 PM Central Time

**Recovery method:**
```bash
# If local repository is corrupted/lost
git clone https://github.com/mmaruthurssd/ssd-google-sheets-staging-production.git
cd ssd-google-sheets-staging-production
ls -d production-sheets/sheet-* | wc -l  # Should show 588
```

### Layer 4: GitHub Branch Protection Rules (NEEDS IMPLEMENTATION)
**Status:** ⚠️ NEEDS SETUP
**Protection Level:** Immutable commits
**Recovery Time:** N/A (prevents deletion)

**Settings to enable on GitHub:**

1. **Branch Protection Rules for `main` branch:**
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass
   - ✅ Require branches to be up to date
   - ✅ Require conversation resolution before merging
   - ✅ Restrict force pushes (CRITICAL)
   - ✅ Restrict deletions (CRITICAL)
   - ✅ Do not allow bypassing the above settings

2. **Repository Settings:**
   - Enable "Automatically delete head branches" = NO
   - Enable "Always suggest updating pull request branches" = YES
   - Default branch = `main` (protected)

**Implementation Steps:**
```
GitHub Repository → Settings → Branches → Add branch protection rule

Branch name pattern: main

Enable:
☑ Require a pull request before merging
  ☑ Require approvals (1)
☑ Require status checks to pass before merging
☑ Require conversation resolution before merging
☑ Require linear history
☑ Do not allow bypassing the above settings
☑ Restrict who can push to matching branches (Only repository admins)
☑ Allow force pushes: DISABLED
☑ Allow deletions: DISABLED
```

### Layer 5: Immutable Cloud Backup (S3/GCS) (RECOMMENDED TO IMPLEMENT)
**Status:** ❌ NOT IMPLEMENTED
**Protection Level:** Off-site, versioned, immutable
**Recovery Time:** 10-30 minutes

**Recommendation:** Implement Google Cloud Storage (GCS) backup with versioning

**Why GCS instead of S3:**
- Already using Google ecosystem (Google Sheets, Apps Script)
- Same Business Associate Agreement (BAA) as Google Drive
- Native integration with Google Cloud Platform
- Simpler authentication (same service account)

**Implementation Plan:**

```yaml
# Add to .github/workflows/gcs-backup.yml
name: Immutable GCS Backup

on:
  schedule:
    - cron: '0 2,14 * * *'  # 2 AM and 2 PM Central (9 AM and 9 PM UTC)
  workflow_dispatch:

jobs:
  backup-to-gcs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0  # Full history

      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v1
        with:
          credentials_json: '${{ secrets.GCS_BACKUP_SERVICE_ACCOUNT }}'

      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v1

      - name: Create timestamped backup
        run: |
          TIMESTAMP=$(date +%Y%m%d-%H%M%S)
          tar -czf backup-${TIMESTAMP}.tar.gz \
            production-sheets/ \
            staging-sheets/ \
            config/sheet-registry.json \
            .git/

          # Upload to GCS with versioning enabled
          gsutil -m cp backup-${TIMESTAMP}.tar.gz \
            gs://ssd-sheets-backup-immutable/daily-backups/

          # Keep monthly archives forever
          if [ $(date +%d) == "01" ]; then
            gsutil -m cp backup-${TIMESTAMP}.tar.gz \
              gs://ssd-sheets-backup-immutable/monthly-archives/
          fi

      - name: Cleanup old daily backups (keep 90 days)
        run: |
          gsutil -m rm gs://ssd-sheets-backup-immutable/daily-backups/backup-$(date -d '90 days ago' +%Y%m%d)*.tar.gz || true
```

**GCS Bucket Configuration:**
- Bucket name: `ssd-sheets-backup-immutable`
- Location: `us-central1` (same region as Google Sheets)
- Storage class: Standard
- **Versioning: ENABLED** (automatic versioning of every file)
- **Object Lifecycle:**
  - Daily backups: Keep 90 days
  - Monthly archives: Keep forever
- **Access control:** Private (service account only)
- **Retention policy:** 30-day minimum (prevents deletion within 30 days)

**Setup Commands:**
```bash
# Create GCS bucket with versioning
gsutil mb -p ssd-practice-management -l us-central1 gs://ssd-sheets-backup-immutable
gsutil versioning set on gs://ssd-sheets-backup-immutable

# Set retention policy (30-day minimum)
gsutil retention set 30d gs://ssd-sheets-backup-immutable

# Lock retention policy (OPTIONAL - makes it permanent)
# gsutil retention lock gs://ssd-sheets-backup-immutable
```

**Recovery from GCS:**
```bash
# List available backups
gsutil ls gs://ssd-sheets-backup-immutable/daily-backups/

# Download specific backup
gsutil cp gs://ssd-sheets-backup-immutable/daily-backups/backup-20251111-140000.tar.gz .

# Extract
tar -xzf backup-20251111-140000.tar.gz

# Restore git history if needed
cd .git && git fsck && git gc
```

### Layer 6: Local Time Machine Backup (RECOMMENDED)
**Status:** ⚠️ VERIFY SETUP
**Protection Level:** Local machine recovery
**Recovery Time:** Hours

**For macOS Time Machine:**

1. **Verify backup is active:**
```bash
tmutil latestbackup
tmutil listbackups | tail -5
```

2. **Ensure repository is NOT excluded:**
```bash
# Check exclusions
tmutil isexcluded "/Users/mmaruthurnew/Desktop/medical-patient-data"

# If excluded, remove exclusion
sudo tmutil removeexclusion "/Users/mmaruthurnew/Desktop/medical-patient-data"
```

3. **Manual backup trigger before risky operations:**
```bash
# Before any major git operations
tmutil startbackup --block
```

**Recovery from Time Machine:**
```bash
# Browse Time Machine for specific date
open /Applications/Utilities/Time\ Machine.app

# Or use terminal
tmutil restore /path/to/backup/destination
```

---

## Git Safety Mechanisms

### 1. Enhanced .gitattributes (IMPLEMENT THIS)

Create `.gitattributes` to mark critical directories as required:

```bash
cat > .gitattributes << 'EOF'
# Critical directories that must ALWAYS be tracked
production-sheets/** -diff
staging-sheets/** -diff
config/sheet-registry.json -diff

# Prevent accidental merge conflicts on critical files
production-sheets/** merge=ours
staging-sheets/** merge=ours
config/sheet-registry.json merge=ours
EOF

git add .gitattributes
git commit -m "feat: add gitattributes to protect critical directories"
```

### 2. Git Aliases for Safe Operations (IMPLEMENT THIS)

Add to `~/.gitconfig`:

```ini
[alias]
    # Safe commit - always shows status first
    safe-commit = "!f() { git status && read -p 'Continue? (y/n) ' -n 1 -r && echo && if [[ $REPLY =~ ^[Yy]$ ]]; then git commit \"$@\"; fi }; f"

    # Check for large deletions before committing
    check-deletions = "!git diff --cached --name-status | grep '^D' | wc -l"

    # Safe push - pulls first, shows diff
    safe-push = "!f() { git pull --rebase && git diff origin/main..HEAD && read -p 'Push these changes? (y/n) ' -n 1 -r && echo && if [[ $REPLY =~ ^[Yy]$ ]]; then git push; fi }; f"

    # Verify backup count before operations
    verify-sheets = "!f() { count=$(ls -d production-sheets/sheet-* 2>/dev/null | wc -l); echo \"Production sheets: $count (expected: 588)\"; if [ $count -ne 588 ]; then echo 'WARNING: Sheet count mismatch!'; exit 1; fi }; f"

    # Never allow force push (overrides force push with error)
    force-push = "!echo 'ERROR: Force push is disabled on this repository!' && exit 1"

[push]
    # Never allow force push by default
    default = simple

[branch]
    # Always set up tracking
    autoSetupMerge = always
```

### 3. Enhanced Pre-Commit Hook (UPGRADE EXISTING)

Replace current `.git/hooks/pre-commit` with enhanced version:

```bash
#!/bin/bash
# Enhanced pre-commit hook with multiple safety checks

# Color codes for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${GREEN}Running pre-commit safety checks...${NC}"

# Check 1: Verify sheet count hasn't decreased
CURRENT_COUNT=$(ls -d production-sheets/sheet-* 2>/dev/null | wc -l)
EXPECTED_COUNT=588

if [ $CURRENT_COUNT -lt $EXPECTED_COUNT ]; then
  echo -e "${RED}❌ COMMIT BLOCKED: Production sheet count decreased!${NC}"
  echo "  Current: $CURRENT_COUNT"
  echo "  Expected: $EXPECTED_COUNT"
  echo "  Missing: $((EXPECTED_COUNT - CURRENT_COUNT)) sheets"
  echo ""
  echo "This suggests sheets were deleted. Verify with: git status"
  exit 1
fi

# Check 2: Detect large deletions
DELETED_PRODUCTION=$(git diff --cached --name-status | grep "^D" | grep "production-sheets/" | wc -l)
DELETED_STAGING=$(git diff --cached --name-status | grep "^D" | grep "staging-sheets/" | wc -l)
DELETED_CONFIG=$(git diff --cached --name-status | grep "^D" | grep "config/sheet-registry.json" | wc -l)

if [ "$DELETED_PRODUCTION" -gt 10 ]; then
  echo -e "${RED}❌ COMMIT BLOCKED: Attempting to delete $DELETED_PRODUCTION production sheets!${NC}"
  echo ""
  echo "Files being deleted:"
  git diff --cached --name-status | grep "^D" | grep "production-sheets/" | head -10
  echo ""
  echo "To bypass (DANGEROUS): git commit --no-verify"
  exit 1
fi

if [ "$DELETED_STAGING" -gt 10 ]; then
  echo -e "${RED}❌ COMMIT BLOCKED: Attempting to delete $DELETED_STAGING staging sheets!${NC}"
  exit 1
fi

if [ "$DELETED_CONFIG" -gt 0 ]; then
  echo -e "${RED}❌ COMMIT BLOCKED: Attempting to delete sheet-registry.json!${NC}"
  exit 1
fi

# Check 3: Verify critical files still exist
if [ ! -f "config/sheet-registry.json" ]; then
  echo -e "${RED}❌ COMMIT BLOCKED: sheet-registry.json is missing!${NC}"
  exit 1
fi

# Check 4: Warn about large file additions (possible mistake)
ADDED_FILES=$(git diff --cached --name-status | grep "^A" | wc -l)
if [ "$ADDED_FILES" -gt 100 ]; then
  echo -e "${YELLOW}⚠️  WARNING: Adding $ADDED_FILES new files${NC}"
  echo "This seems like a lot. Continue? (y/n)"
  read -r response
  if [[ ! "$response" =~ ^[Yy]$ ]]; then
    echo "Commit cancelled"
    exit 1
  fi
fi

# Check 5: Verify no unintentional .gitignore changes
if git diff --cached --name-only | grep -q "^\.gitignore$"; then
  echo -e "${YELLOW}⚠️  WARNING: .gitignore is being modified${NC}"
  echo "Changes:"
  git diff --cached .gitignore
  echo ""
  echo "Continue? (y/n)"
  read -r response
  if [[ ! "$response" =~ ^[Yy]$ ]]; then
    echo "Commit cancelled"
    exit 1
  fi
fi

echo -e "${GREEN}✅ All pre-commit checks passed${NC}"
echo "  Production sheets: $CURRENT_COUNT"
echo "  Deletions: $DELETED_PRODUCTION production, $DELETED_STAGING staging"
echo ""
exit 0
```

### 4. Pre-Push Hook (NEW - IMPLEMENT THIS)

Create `.git/hooks/pre-push`:

```bash
#!/bin/bash
# Pre-push hook - final verification before pushing to GitHub

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${GREEN}Running pre-push verification...${NC}"

# Check 1: Verify we're not force pushing
if git push --dry-run --force 2>&1 | grep -q "force"; then
  echo -e "${RED}❌ PUSH BLOCKED: Force push detected!${NC}"
  echo "Force pushing is not allowed on this repository"
  exit 1
fi

# Check 2: Verify sheet count
SHEET_COUNT=$(ls -d production-sheets/sheet-* 2>/dev/null | wc -l)
if [ $SHEET_COUNT -ne 588 ]; then
  echo -e "${RED}❌ PUSH BLOCKED: Production sheet count is $SHEET_COUNT (expected 588)${NC}"
  exit 1
fi

# Check 3: Verify sheet-registry.json exists
if [ ! -f "config/sheet-registry.json" ]; then
  echo -e "${RED}❌ PUSH BLOCKED: sheet-registry.json is missing!${NC}"
  exit 1
fi

# Check 4: Show what's being pushed
echo "Commits being pushed:"
git log --oneline origin/main..HEAD

echo ""
echo "Files changed in these commits:"
git diff --stat origin/main..HEAD

echo ""
echo -e "${GREEN}✅ Pre-push verification passed${NC}"
exit 0
```

Make it executable:
```bash
chmod +x .git/hooks/pre-push
```

---

## Protection Against Destructive Commands

### 1. Git Clean Protection

Add to `~/.gitconfig`:

```ini
[alias]
    # Safe clean - requires explicit confirmation
    clean-safe = "!f() { echo 'This will remove untracked files:' && git clean -n && read -p 'Continue? (y/n) ' -n 1 -r && echo && if [[ $REPLY =~ ^[Yy]$ ]]; then git clean \"$@\"; fi }; f"

    # Disable dangerous git clean entirely
    clean = "!echo 'ERROR: Use git clean-safe instead (or git clean-force if you know what you are doing)' && exit 1"
    clean-force = clean -fd
```

### 2. Wrapper Script for Dangerous Operations

Create `scripts/git-safety-wrapper.sh`:

```bash
#!/bin/bash
# Git safety wrapper for dangerous operations

REPO_ROOT="/Users/mmaruthurnew/Desktop/medical-patient-data/Implementation Projects/google-sheets-version-control"

# Function to verify backup exists
verify_backup() {
    LATEST_COMMIT=$(cd "$REPO_ROOT" && git rev-parse HEAD)
    echo "Latest commit: $LATEST_COMMIT"
    echo "Backup verification:"
    cd "$REPO_ROOT"
    git show $LATEST_COMMIT:config/sheet-registry.json > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✅ Backup verified in git history"
    else
        echo "❌ WARNING: Cannot verify backup!"
        return 1
    fi
}

# Function to create emergency backup before dangerous operation
create_emergency_backup() {
    echo "Creating emergency backup before operation..."
    cd "$REPO_ROOT"
    TIMESTAMP=$(date +%Y%m%d-%H%M%S)
    BACKUP_DIR="$HOME/.google-sheets-emergency-backups"
    mkdir -p "$BACKUP_DIR"

    tar -czf "$BACKUP_DIR/emergency-backup-${TIMESTAMP}.tar.gz" \
        production-sheets/ \
        staging-sheets/ \
        config/sheet-registry.json

    echo "✅ Emergency backup created: $BACKUP_DIR/emergency-backup-${TIMESTAMP}.tar.gz"
    echo "   Size: $(du -h "$BACKUP_DIR/emergency-backup-${TIMESTAMP}.tar.gz" | cut -f1)"
}

# Main wrapper
case "$1" in
    reset-hard)
        echo "⚠️  WARNING: git reset --hard will lose uncommitted changes!"
        verify_backup || exit 1
        create_emergency_backup
        read -p "Continue with reset --hard? (type 'YES' to confirm) " -r
        if [ "$REPLY" = "YES" ]; then
            cd "$REPO_ROOT" && git reset --hard "$2"
        else
            echo "Cancelled"
            exit 1
        fi
        ;;

    clean)
        echo "⚠️  WARNING: git clean will remove untracked files!"
        create_emergency_backup
        cd "$REPO_ROOT" && git clean -n
        read -p "Remove these files? (type 'YES' to confirm) " -r
        if [ "$REPLY" = "YES" ]; then
            cd "$REPO_ROOT" && git clean -fd
        else
            echo "Cancelled"
            exit 1
        fi
        ;;

    *)
        echo "Usage: git-safety-wrapper.sh {reset-hard|clean}"
        exit 1
        ;;
esac
```

Make it executable:
```bash
chmod +x scripts/git-safety-wrapper.sh
```

---

## Recovery Procedures

### Scenario 1: Local Files Deleted But Not Committed

**Symptoms:**
- `ls production-sheets/` shows missing directories
- `git status` shows deleted files as unstaged changes

**Recovery:**
```bash
# Restore all deleted files
git restore production-sheets/
git restore staging-sheets/
git restore config/sheet-registry.json

# Verify
ls -d production-sheets/sheet-* | wc -l  # Should be 588
```

### Scenario 2: Files Deleted AND Committed (Not Pushed)

**Symptoms:**
- Files deleted and committed locally
- Haven't run `git push` yet
- `git log -1` shows the bad commit

**Recovery:**
```bash
# Option A: Undo the commit, keep changes staged
git reset --soft HEAD~1

# Option B: Undo the commit and unstage everything
git reset HEAD~1

# Option C: Completely discard the commit
git reset --hard HEAD~1

# Verify files are back
ls -d production-sheets/sheet-* | wc -l
```

### Scenario 3: Files Deleted, Committed, AND Pushed

**Symptoms:**
- Bad commit is on GitHub
- `git log origin/main` shows the deletion commit

**Recovery:**
```bash
# Find the bad commit
git log --oneline --stat | grep -B 5 "deletion"

# Option A: Revert the commit (creates new commit undoing changes)
git revert <bad-commit-hash>
git push

# Option B: Reset to before bad commit (requires force push - USE WITH CAUTION)
# Only if branch protection isn't enabled yet
git reset --hard <good-commit-hash>
git push --force-with-lease  # Safer than --force

# Verify
ls -d production-sheets/sheet-* | wc -l
```

### Scenario 4: Complete Local Repository Corruption

**Symptoms:**
- `.git` directory corrupted
- `git status` returns errors
- Files may or may not be present

**Recovery:**
```bash
# Rename corrupted repo
mv "/Users/mmaruthurnew/Desktop/medical-patient-data/Implementation Projects/google-sheets-version-control" \
   "/Users/mmaruthurnew/Desktop/medical-patient-data/Implementation Projects/google-sheets-version-control-CORRUPTED"

# Clone fresh from GitHub
cd "/Users/mmaruthurnew/Desktop/medical-patient-data/Implementation Projects/"
git clone https://github.com/mmaruthurssd/ssd-google-sheets-staging-production.git google-sheets-version-control

# Verify
cd google-sheets-version-control
ls -d production-sheets/sheet-* | wc -l  # Should be 588

# Copy any uncommitted work from corrupted repo if needed
```

### Scenario 5: GitHub Repository Deleted or Compromised

**Symptoms:**
- Cannot push to GitHub
- Repository shows as deleted or empty on GitHub

**Recovery:**
```bash
# Local repository is still source of truth
cd "/Users/mmaruthurnew/Desktop/medical-patient-data/Implementation Projects/google-sheets-version-control"

# Create new GitHub repository (via GitHub UI)
# Then push local repo to new remote

git remote remove origin
git remote add origin https://github.com/mmaruthurssd/new-repo-name.git
git push -u origin main

# Or restore from GCS backup (if implemented)
gsutil cp gs://ssd-sheets-backup-immutable/daily-backups/backup-latest.tar.gz .
tar -xzf backup-latest.tar.gz
```

### Scenario 6: Need to Recover from Specific Date/Time

**Symptoms:**
- Need to go back to specific date
- Recent changes caused issues

**Recovery:**
```bash
# Find commit from specific date
git log --since="2025-11-10" --until="2025-11-11" --oneline

# View files at that commit
git show <commit-hash>:config/sheet-registry.json

# Restore entire repo to that state (creates new branch)
git checkout -b recovery-<date> <commit-hash>

# Or restore specific directory
git checkout <commit-hash> -- production-sheets/

# Verify
ls -d production-sheets/sheet-* | wc -l
```

---

## Monitoring & Verification

### Daily Health Check Script

Create `scripts/daily-health-check.sh`:

```bash
#!/bin/bash
# Daily health check for backup system

REPO_ROOT="/Users/mmaruthurnew/Desktop/medical-patient-data/Implementation Projects/google-sheets-version-control"
cd "$REPO_ROOT"

echo "=== Google Sheets Version Control - Daily Health Check ==="
echo "Date: $(date)"
echo ""

# Check 1: File count
PROD_COUNT=$(ls -d production-sheets/sheet-* 2>/dev/null | wc -l)
echo "✓ Production sheets: $PROD_COUNT (expected: 588)"
if [ $PROD_COUNT -ne 588 ]; then
    echo "  ⚠️  WARNING: Count mismatch!"
fi

# Check 2: Git status
if git status | grep -q "nothing to commit"; then
    echo "✓ Git status: Clean"
else
    echo "⚠️  Git status: Uncommitted changes"
    git status --short | head -10
fi

# Check 3: Remote sync
git fetch
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse @{u})
if [ "$LOCAL" = "$REMOTE" ]; then
    echo "✓ GitHub sync: Up to date"
else
    echo "⚠️  GitHub sync: Out of sync"
fi

# Check 4: Recent backup
LAST_BACKUP=$(git log --oneline --grep="automated snapshot" -1)
echo "✓ Last backup: $LAST_BACKUP"

# Check 5: Critical files exist
if [ -f "config/sheet-registry.json" ]; then
    SIZE=$(du -h config/sheet-registry.json | cut -f1)
    echo "✓ Sheet registry: Exists ($SIZE)"
else
    echo "❌ Sheet registry: MISSING!"
fi

# Check 6: Hooks installed
if [ -x ".git/hooks/pre-commit" ]; then
    echo "✓ Pre-commit hook: Installed"
else
    echo "❌ Pre-commit hook: Missing or not executable!"
fi

if [ -x ".git/hooks/pre-push" ]; then
    echo "✓ Pre-push hook: Installed"
else
    echo "⚠️  Pre-push hook: Not installed (recommended)"
fi

# Check 7: Time Machine backup
if command -v tmutil &> /dev/null; then
    EXCLUDED=$(tmutil isexcluded "$REPO_ROOT" 2>/dev/null | grep -q "Excluded" && echo "YES" || echo "NO")
    if [ "$EXCLUDED" = "NO" ]; then
        echo "✓ Time Machine: Backing up this directory"
    else
        echo "⚠️  Time Machine: This directory is EXCLUDED"
    fi
fi

echo ""
echo "=== Health Check Complete ==="
```

Run daily:
```bash
chmod +x scripts/daily-health-check.sh
# Add to crontab:
# 0 8 * * * cd /Users/mmaruthurnew/Desktop/medical-patient-data/Implementation\ Projects/google-sheets-version-control && ./scripts/daily-health-check.sh | mail -s "Sheets Backup Health Check" your@email.com
```

---

## Implementation Checklist

### Immediate (Critical) - Do These First

- [ ] Enable GitHub branch protection rules on `main` branch
- [ ] Create and install enhanced pre-commit hook
- [ ] Create and install pre-push hook
- [ ] Add `.gitattributes` file to protect critical directories
- [ ] Verify Time Machine is backing up repository directory
- [ ] Test recovery procedure (Scenario 1) in safe environment

### Short Term (This Week)

- [ ] Add git safety aliases to `~/.gitconfig`
- [ ] Create `git-safety-wrapper.sh` script
- [ ] Set up daily health check script
- [ ] Document recovery procedures for team
- [ ] Test recovery procedure (Scenario 2) in safe environment
- [ ] Create emergency backup script

### Medium Term (This Month)

- [ ] Set up Google Cloud Storage bucket for immutable backups
- [ ] Create and test GCS backup workflow
- [ ] Implement 30-day retention policy on GCS bucket
- [ ] Test full recovery from GCS backup
- [ ] Set up monitoring alerts for backup failures
- [ ] Create runbook for all recovery scenarios

### Long Term (Next Quarter)

- [ ] Consider dedicated backup drive for local redundancy
- [ ] Implement backup verification testing (quarterly)
- [ ] Review and update retention policies
- [ ] Audit access controls on GitHub and GCS
- [ ] Disaster recovery drill with full team
- [ ] Document lessons learned and update procedures

---

## Cost Estimates

### GitHub (Current)
- **Cost:** Free (public repository)
- **Storage:** Unlimited for code repositories
- **Retention:** Unlimited

### Google Cloud Storage (Proposed)
- **Bucket:** `ssd-sheets-backup-immutable`
- **Storage:** ~1 GB per backup × 90 daily backups = 90 GB
- **Monthly cost:** ~$1.80/month (Standard storage at $0.02/GB)
- **Network:** Free (same region as Google Sheets)
- **Operations:** ~$0.01/month (minimal operations)
- **Total:** ~$2/month

### Time Machine (Current)
- **Cost:** Cost of external drive (one-time ~$100-200)
- **Storage:** 1-2 TB recommended
- **Retention:** Based on drive space

**Total additional cost:** ~$2/month for GCS + one-time drive purchase

---

## Testing & Validation

### Test Plan

**Test 1: Pre-Commit Hook Blocks Deletions**
```bash
# Create test branch
git checkout -b test-pre-commit-hook

# Try to delete files (should be blocked)
git rm production-sheets/sheet-000*/
git commit -m "test: attempt deletion"
# Expected: ❌ COMMIT BLOCKED

# Clean up
git reset --hard HEAD
git checkout main
git branch -D test-pre-commit-hook
```

**Test 2: Recovery from Local Deletion**
```bash
# Create test branch
git checkout -b test-recovery

# Delete a single file
rm production-sheets/sheet-000_*/README.md

# Verify deletion
git status

# Recover
git restore production-sheets/sheet-000_*/README.md

# Verify recovery
git status

# Clean up
git checkout main
git branch -D test-recovery
```

**Test 3: GitHub Restore**
```bash
# Create test directory outside repo
mkdir ~/backup-test
cd ~/backup-test

# Clone repository
git clone https://github.com/mmaruthurssd/ssd-google-sheets-staging-production.git
cd ssd-google-sheets-staging-production

# Verify sheet count
ls -d production-sheets/sheet-* | wc -l
# Expected: 588

# Clean up
cd ~
rm -rf ~/backup-test
```

**Test 4: GCS Backup (After Implementation)**
```bash
# Upload test backup
gsutil cp test-backup.tar.gz gs://ssd-sheets-backup-immutable/test/

# Download and verify
gsutil cp gs://ssd-sheets-backup-immutable/test/test-backup.tar.gz .
tar -tzf test-backup.tar.gz | head -20

# Clean up
gsutil rm gs://ssd-sheets-backup-immutable/test/test-backup.tar.gz
rm test-backup.tar.gz
```

---

## Security Considerations

1. **Access Control**
   - GitHub: Limit who can push to main branch
   - GCS: Service account with minimal permissions
   - Local: File system permissions on `.git` directory

2. **Secrets Management**
   - Never commit credentials to repository
   - Use GitHub Secrets for GCS service account
   - Rotate service account keys annually

3. **Audit Logging**
   - GitHub Actions logs all backup operations
   - GCS logs all access to backup bucket
   - Monitor for unusual access patterns

4. **Encryption**
   - GitHub: Encrypted at rest and in transit
   - GCS: Customer-managed encryption keys (optional)
   - Local: FileVault enabled on macOS

---

## Support & Escalation

### When Recovery Procedures Fail

1. **Don't panic** - Google Drive has the source code
2. **Stop making changes** - Document current state
3. **Check all backup layers:**
   - Local git: `git log -10`
   - GitHub: `git log origin/main -10`
   - GCS: `gsutil ls gs://ssd-sheets-backup-immutable/daily-backups/ | tail -5`
   - Time Machine: `tmutil listbackups | tail -5`

4. **Escalate if:**
   - All backup layers failed
   - Google Drive sheets also affected
   - Data loss confirmed

### Recovery Priority

1. **Tier 1 (Immediate):** Git restore from local or GitHub
2. **Tier 2 (Hours):** GCS restore
3. **Tier 3 (Days):** Time Machine restore
4. **Tier 4 (Last Resort):** Re-pull all code from Google Drive using `clasp pull`

---

## Conclusion

This comprehensive 6-layer backup strategy provides:

1. ✅ **Multiple recovery points** - Git history, GitHub, GCS, Time Machine
2. ✅ **Immutable backups** - GCS versioning + retention policy
3. ✅ **Automated protection** - Pre-commit and pre-push hooks
4. ✅ **Clear procedures** - Documented recovery for every scenario
5. ✅ **Cost-effective** - ~$2/month for cloud redundancy
6. ✅ **Tested** - Regular drills and verification

**Next Steps:** Follow the Implementation Checklist starting with Critical items.

**Questions?** See `docs/DATA-PROTECTION.md` for day-to-day operations.

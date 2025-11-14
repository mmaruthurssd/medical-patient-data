# Quick Start Implementation Guide

**Purpose:** Get all protection layers set up in 15 minutes

**Status Check:** Run this first to see what's already implemented:
```bash
cd /Users/mmaruthurnew/Desktop/medical-patient-data/Implementation\ Projects/google-sheets-version-control
./scripts/daily-health-check.sh
```

---

## ⚡ Critical Tasks (Do These First - 5 minutes)

### 1. Install Enhanced Git Hooks

```bash
cd /Users/mmaruthurnew/Desktop/medical-patient-data/Implementation\ Projects/google-sheets-version-control

# Install all hooks automatically
./scripts/install-hooks.sh

# Verify installation
ls -lh .git/hooks/pre-commit .git/hooks/pre-push
```

**What this does:** Prevents commits/pushes that would delete production data

### 2. Add .gitattributes (Already Created)

```bash
# Verify it exists
cat .gitattributes

# If not, it should contain:
# production-sheets/** -diff
# staging-sheets/** -diff
# config/sheet-registry.json -diff
```

**What this does:** Marks critical directories as always tracked

### 3. Enable GitHub Branch Protection

**Time:** 3 minutes via GitHub UI

Follow: `docs/GITHUB-BRANCH-PROTECTION-SETUP.md`

Quick version:
1. Go to https://github.com/mmaruthurssd/ssd-google-sheets-staging-production/settings/branches
2. Add rule for `main` branch
3. Check: Require PR, Restrict force pushes, Restrict deletions, Include administrators
4. Save

**What this does:** Prevents force pushes and deletions at GitHub level

---

## 🔧 Important Tasks (Do These Today - 5 minutes)

### 4. Add Git Safety Aliases

Add to `~/.gitconfig`:

```bash
cat >> ~/.gitconfig << 'EOF'

[alias]
    # Safe operations
    verify-sheets = "!f() { count=$(ls -d production-sheets/sheet-* 2>/dev/null | wc -l); echo \"Production sheets: $count (expected: 588)\"; if [ $count -ne 588 ]; then echo 'WARNING: Sheet count mismatch!'; exit 1; fi }; f"

    safe-push = "!f() { git pull --rebase && git verify-sheets && git push; }; f"

    # Disable dangerous commands
    force-push = "!echo 'ERROR: Force push is disabled!' && exit 1"

    # Safe clean
    clean = "!echo 'Use: scripts/git-safety-wrapper.sh clean' && exit 1"

[push]
    default = simple
EOF

# Verify
git verify-sheets
```

**What this does:** Adds safety checks to common git commands

### 5. Verify Time Machine Backup

```bash
# Check if repository is backed up
tmutil isexcluded "/Users/mmaruthurnew/Desktop/medical-patient-data"

# If excluded, remove exclusion:
sudo tmutil removeexclusion "/Users/mmaruthurnew/Desktop/medical-patient-data"

# Trigger immediate backup
tmutil startbackup --block
```

**What this does:** Ensures local backup via Time Machine

### 6. Test All Protections

```bash
cd /Users/mmaruthurnew/Desktop/medical-patient-data/Implementation\ Projects/google-sheets-version-control

# Run health check
./scripts/daily-health-check.sh

# Verify sheet count
ls -d production-sheets/sheet-* | wc -l
# Should output: 588

# Test hooks work
git status
# Should show clean or list untracked files
```

---

## 📊 Recommended Tasks (Do This Week - 20 minutes)

### 7. Set Up Google Cloud Storage Backup

**Time:** 15 minutes + GCS setup time

1. **Create GCS bucket:**
```bash
# Install gcloud CLI if not installed:
# curl https://sdk.cloud.google.com | bash

# Create bucket
gsutil mb -p ssd-practice-management -l us-central1 gs://ssd-sheets-backup-immutable

# Enable versioning
gsutil versioning set on gs://ssd-sheets-backup-immutable

# Set 30-day retention
gsutil retention set 30d gs://ssd-sheets-backup-immutable
```

2. **Create GitHub Actions workflow:**

See: `docs/COMPREHENSIVE-BACKUP-STRATEGY.md` Layer 5 for complete workflow file

3. **Test backup:**
```bash
# Create test backup locally
tar -czf test-backup.tar.gz production-sheets/ config/sheet-registry.json

# Upload
gsutil cp test-backup.tar.gz gs://ssd-sheets-backup-immutable/test/

# Verify
gsutil ls gs://ssd-sheets-backup-immutable/test/

# Clean up
rm test-backup.tar.gz
gsutil rm gs://ssd-sheets-backup-immutable/test/test-backup.tar.gz
```

### 8. Schedule Daily Health Check

Add to crontab:

```bash
# Open crontab editor
crontab -e

# Add this line (runs daily at 8 AM):
0 8 * * * cd /Users/mmaruthurnew/Desktop/medical-patient-data/Implementation\ Projects/google-sheets-version-control && ./scripts/daily-health-check.sh
```

---

## ✅ Verification Checklist

Run this to verify everything is set up:

```bash
cd /Users/mmaruthurnew/Desktop/medical-patient-data/Implementation\ Projects/google-sheets-version-control

echo "=== Protection Layer Verification ==="
echo ""

# Layer 1: Google Drive
echo "✓ Layer 1: Google Drive is source of truth"

# Layer 2: Local git
PROD_COUNT=$(ls -d production-sheets/sheet-* | wc -l)
echo "✓ Layer 2: Local git has $PROD_COUNT sheets"

# Layer 3: GitHub
git fetch
echo "✓ Layer 3: GitHub remote configured"

# Layer 4: Branch protection
echo "⚠ Layer 4: Check branch protection manually at:"
echo "   https://github.com/mmaruthurssd/ssd-google-sheets-staging-production/settings/branches"

# Layer 5: GCS (if implemented)
if gsutil ls gs://ssd-sheets-backup-immutable/ 2>/dev/null; then
    echo "✓ Layer 5: GCS bucket exists"
else
    echo "⚠ Layer 5: GCS not set up yet (optional)"
fi

# Layer 6: Time Machine
if tmutil isexcluded "/Users/mmaruthurnew/Desktop/medical-patient-data" | grep -q "Excluded"; then
    echo "⚠ Layer 6: Time Machine - directory is EXCLUDED"
else
    echo "✓ Layer 6: Time Machine backing up"
fi

echo ""
echo "=== Git Hooks ==="
[ -x .git/hooks/pre-commit ] && echo "✓ Pre-commit hook installed" || echo "❌ Pre-commit hook missing"
[ -x .git/hooks/pre-push ] && echo "✓ Pre-push hook installed" || echo "⚠ Pre-push hook not installed"

echo ""
echo "=== Configuration Files ==="
[ -f .gitattributes ] && echo "✓ .gitattributes exists" || echo "⚠ .gitattributes missing"
[ -f scripts/git-safety-wrapper.sh ] && echo "✓ Safety wrapper exists" || echo "⚠ Safety wrapper missing"

echo ""
echo "=== Verification Complete ==="
```

---

## 🚨 Emergency Recovery

If something goes wrong, see:

- **Local files deleted:** `docs/COMPREHENSIVE-BACKUP-STRATEGY.md` → Scenario 1
- **Files committed:** → Scenario 2
- **Files pushed:** → Scenario 3
- **Repository corrupted:** → Scenario 4

**Quick recovery commands:**
```bash
# Restore from last commit
git restore production-sheets/

# Undo last commit (not pushed)
git reset --soft HEAD~1

# Restore from GitHub
git fetch origin
git reset --hard origin/main
```

---

## 📚 Documentation Index

**Created files:**
- ✅ `docs/COMPREHENSIVE-BACKUP-STRATEGY.md` - Complete 6-layer strategy
- ✅ `docs/GITHUB-BRANCH-PROTECTION-SETUP.md` - GitHub configuration
- ✅ `docs/DATA-PROTECTION.md` - Daily operations guide
- ✅ `docs/QUICK-START-IMPLEMENTATION.md` - This file
- ✅ `.gitattributes` - Git tracking configuration
- ✅ `scripts/enhanced-pre-commit-hook.sh` - Enhanced safety hook
- ✅ `scripts/pre-push-hook.sh` - Pre-push verification
- ✅ `scripts/install-hooks.sh` - Hook installer
- ✅ `scripts/daily-health-check.sh` - Daily verification
- ✅ `scripts/git-safety-wrapper.sh` - Safe dangerous operations

---

## ⏱️ Time Investment Summary

| Task | Time | Priority |
|------|------|----------|
| Install hooks | 2 min | 🔴 Critical |
| GitHub branch protection | 3 min | 🔴 Critical |
| Git safety aliases | 2 min | 🟡 Important |
| Time Machine verification | 2 min | 🟡 Important |
| Test protections | 3 min | 🟡 Important |
| GCS backup setup | 20 min | 🟢 Recommended |
| Daily health check | 3 min | 🟢 Recommended |
| **Total (Critical + Important)** | **12 min** | |
| **Total (All tasks)** | **35 min** | |

---

## Next Steps After Implementation

1. ✅ Commit these new files:
```bash
git add .gitattributes docs/ scripts/
git commit -m "feat: implement comprehensive backup and protection strategy"
git push origin main  # Will require PR if branch protection enabled
```

2. ✅ Test recovery procedures in safe environment

3. ✅ Schedule quarterly review of protection settings

4. ✅ Document any issues encountered

---

**Need help?** See `docs/COMPREHENSIVE-BACKUP-STRATEGY.md` for complete details.

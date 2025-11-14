# GitHub Branch Protection Setup Guide

**Repository:** https://github.com/mmaruthurssd/ssd-google-sheets-staging-production
**Date:** 2025-11-11
**Purpose:** Configure immutable branch protection to prevent accidental deletion of production data

---

## Why This Is Critical

After the near-miss incident where 3,816 files were almost deleted, branch protection rules provide **GitHub-level enforcement** that prevents:

1. Force pushes that could overwrite history
2. Direct pushes to main branch (requires PR review)
3. Branch deletion
4. Bypassing status checks

This is **Layer 4** of our 6-layer backup strategy - **immutable commits** at the GitHub level.

---

## Step-by-Step Setup Instructions

### 1. Navigate to Repository Settings

1. Go to: https://github.com/mmaruthurssd/ssd-google-sheets-staging-production
2. Click **Settings** (top right, requires admin access)
3. In left sidebar, click **Branches** under "Code and automation"

### 2. Add Branch Protection Rule

Click **Add branch protection rule** button

### 3. Configure Protection Settings

**Branch name pattern:**
```
main
```

**Enable the following settings:**

#### Protect matching branches

☑ **Require a pull request before merging**
  - ☑ Require approvals: `1`
  - ☐ Dismiss stale pull request approvals when new commits are pushed
  - ☑ Require review from Code Owners (optional, if you have CODEOWNERS file)
  - ☐ Restrict who can dismiss pull request reviews (leave unchecked for flexibility)
  - ☑ Allow specified actors to bypass required pull requests (add your username for emergencies)

#### Status checks

☑ **Require status checks to pass before merging**
  - ☑ Require branches to be up to date before merging
  - Status checks to require: (leave empty for now, or add if you have CI/CD)

#### Additional restrictions

☑ **Require conversation resolution before merging**
  - Ensures all PR comments are addressed

☑ **Require signed commits** (optional, recommended for security)
  - Requires GPG-signed commits

☑ **Require linear history**
  - Prevents merge commits, forces rebase

☐ **Require deployments to succeed before merging** (optional)

#### Rules applied to everyone including administrators

☑ **Include administrators**
  - Even repository admins must follow these rules
  - **CRITICAL:** This prevents accidental force pushes even by you

☑ **Allow force pushes** = **DISABLED** (do not check this box)
  - **CRITICAL:** This prevents `git push --force`

☑ **Allow deletions** = **DISABLED** (do not check this box)
  - **CRITICAL:** This prevents branch deletion

### 4. Save Changes

Click **Create** button at bottom of page

---

## What This Protects Against

### ✅ Protection Enabled

1. **Force Push Prevention**
   ```bash
   git push --force origin main
   # ❌ GitHub rejects: "protected branch requires pull request"
   ```

2. **Direct Push Prevention**
   ```bash
   git push origin main
   # ❌ GitHub rejects: "protected branch requires pull request"
   ```

3. **Branch Deletion Prevention**
   ```bash
   git push origin --delete main
   # ❌ GitHub rejects: "protected branch cannot be deleted"
   ```

4. **Merge Without Review Prevention**
   - Cannot merge PR without approval
   - Cannot merge with unresolved comments

### 📝 Required Workflow

**Before protection:**
```bash
git add .
git commit -m "changes"
git push origin main  # ✅ Direct push allowed
```

**After protection:**
```bash
# 1. Create feature branch
git checkout -b fix/update-docs

# 2. Make changes and commit
git add docs/
git commit -m "docs: update documentation"

# 3. Push to feature branch (NOT main)
git push origin fix/update-docs

# 4. Create Pull Request on GitHub
# Go to repository → Pull Requests → New Pull Request

# 5. Review and approve PR
# Another person reviews (or you if bypass allowed)

# 6. Merge PR through GitHub UI
# Deletes feature branch automatically
```

---

## Emergency Bypass Procedure

If you absolutely must push directly to main (e.g., critical emergency):

### Option 1: Temporarily Disable Protection (Not Recommended)

1. Go to Settings → Branches → Edit protection rule
2. Temporarily uncheck "Include administrators"
3. Make your push
4. **IMMEDIATELY** re-enable "Include administrators"

### Option 2: Use Pull Request (Recommended)

Even in emergencies, use fast PR workflow:

```bash
# 1. Create emergency branch
git checkout -b emergency-fix

# 2. Make fix and commit
git add .
git commit -m "emergency: fix critical issue"

# 3. Push branch
git push origin emergency-fix

# 4. Create PR and merge immediately (if you have bypass permission)
# GitHub UI: Create PR → Approve → Merge
```

---

## Repository Settings (Additional)

While in Settings, configure these additional protections:

### General Settings

Go to **Settings → General**:

- **Features:**
  - ☐ Allow merge commits (disable to force rebase)
  - ☑ Allow squash merging (recommended)
  - ☑ Allow rebase merging (recommended)
  - ☑ Always suggest updating pull request branches
  - ☑ Automatically delete head branches (cleanup after merge)

- **Pull Requests:**
  - ☑ Allow auto-merge (optional, for automation)
  - ☑ Require approvals before merging

### Webhooks (Optional)

Set up webhook notifications for protection events:

Go to **Settings → Webhooks → Add webhook**:

**Payload URL:** Your notification endpoint (Slack, email, etc.)
**Events:** Select:
- Branch or tag protection
- Pull requests
- Pushes

---

## Verification Testing

### Test 1: Verify Force Push Is Blocked

```bash
cd /Users/mmaruthurnew/Desktop/medical-patient-data/Implementation\ Projects/google-sheets-version-control

# Try to force push (should fail)
git push --force origin main

# Expected output:
# remote: error: GH006: Protected branch update failed
# remote: error: Cannot force-push to this branch
```

### Test 2: Verify Direct Push Is Blocked

```bash
# Try to push directly (should fail)
git push origin main

# Expected output:
# remote: error: GH006: Protected branch update failed
# remote: error: Required status checks failed
```

### Test 3: Verify PR Workflow Works

```bash
# Create test branch
git checkout -b test/branch-protection

# Make trivial change
echo "# Test" >> docs/TEST.md
git add docs/TEST.md
git commit -m "test: verify branch protection"

# Push to feature branch (should succeed)
git push origin test/branch-protection

# Now create PR via GitHub UI
# Verify you can merge after approval

# Clean up
git checkout main
git branch -D test/branch-protection
```

---

## Monitoring & Alerts

### GitHub Insights

Monitor protection rule effectiveness:

1. Go to **Insights → Network** to see branch visualization
2. Check **Settings → Branches** to review protection rules
3. Use **Insights → Pull Requests** to track merge activity

### Audit Log

Review protection rule changes:

1. Go to **Settings → Audit log** (organization-level)
2. Filter by: "protected_branch"
3. Review who changed protection rules and when

---

## Troubleshooting

### Problem: Cannot push to main

**Symptom:**
```
remote: error: GH006: Protected branch update failed
```

**Solution:**
- This is expected! Create a feature branch and PR instead
- See "Required Workflow" section above

### Problem: Cannot merge PR without approval

**Symptom:**
```
Required reviews not satisfied
```

**Solution:**
- Request review from repository admin
- If you're the only admin and set up bypass, approve your own PR
- Or temporarily disable "Require approvals" in protection settings

### Problem: Need to make emergency fix

**Symptom:**
- Critical bug in production
- No time for PR process

**Solution:**
1. Use emergency bypass procedure (Option 2 recommended)
2. Create branch → Push → Fast PR → Merge
3. Total time: ~30 seconds if you have bypass permission

---

## Best Practices

1. **Never bypass protection rules** unless true emergency
2. **Use descriptive branch names:** `fix/`, `feat/`, `docs/`, `chore/`
3. **Keep PRs small** - easier to review
4. **Write clear PR descriptions** - explain what and why
5. **Review your own PRs** - catch mistakes before merging
6. **Delete branches after merge** - keep repository clean
7. **Document protection changes** - note why rules were modified

---

## Integration with Other Protection Layers

Branch protection is **Layer 4** of our 6-layer strategy:

1. ✅ **Layer 1:** Google Drive (source of truth)
2. ✅ **Layer 2:** Local git repository
3. ✅ **Layer 3:** GitHub remote repository
4. ✅ **Layer 4:** Branch protection rules ← YOU ARE HERE
5. ⚠️  **Layer 5:** GCS immutable backup (to be implemented)
6. ✅ **Layer 6:** Time Machine local backup

**Together these layers provide:**
- Multiple recovery points
- Prevention at multiple levels
- Defense-in-depth approach
- Clear escalation path

---

## FAQ

**Q: Can I still make changes to the repository?**
A: Yes! Just use feature branches and PRs instead of pushing directly to main.

**Q: What if I'm the only developer?**
A: Still use PRs - they provide audit trail and enforce pre-push checks.

**Q: Will this slow me down?**
A: Slightly (~30 seconds for PR creation), but protection is worth it. You can set up fast-merge if needed.

**Q: What if I accidentally force push?**
A: GitHub will reject it - you cannot force push with protection enabled.

**Q: Can I disable this later?**
A: Yes, but not recommended. Protection rules prevent the exact incident we just had.

**Q: Does this affect GitHub Actions?**
A: GitHub Actions can still push to main if you configure a token with bypass permissions.

---

## Related Documentation

- **Main strategy:** `docs/COMPREHENSIVE-BACKUP-STRATEGY.md`
- **Daily operations:** `docs/DATA-PROTECTION.md`
- **Recovery procedures:** `docs/COMPREHENSIVE-BACKUP-STRATEGY.md#recovery-procedures`
- **Hook installation:** `scripts/install-hooks.sh`

---

## Support

If you need help configuring branch protection:

1. Check GitHub docs: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches
2. Review this document's troubleshooting section
3. Test in a separate repository first if uncertain

---

**Last Updated:** 2025-11-11
**Next Review:** 2025-12-11 (verify settings still active)

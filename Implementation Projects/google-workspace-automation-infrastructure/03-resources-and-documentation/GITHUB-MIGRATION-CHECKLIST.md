# GitHub System Migration Checklist

**Project:** Google Workspace Automation Infrastructure
**Purpose:** Migrate existing GitHub version control system to automation@ssdsbc.com account
**Repository:** ssd-google-sheets-staging-production
**Estimated Time:** 3 hours
**Risk Level:** Medium (changes authentication for 237 production sheets)

---

## Overview

This checklist guides the migration of the existing GitHub version control system from personal account credentials (mm@ssdsbc.com) to the dedicated automation account (automation@ssdsbc.com).

**Current State:**
- Repository: ~/Desktop/ssd-google-sheets-staging-production
- GitHub: https://github.com/mmaruthurssd/ssd-google-sheets-staging-production
- Authentication: Personal account (mm@ssdsbc.com)
- Sheets tracked: 237 production sheets
- Status: Operational with daily snapshots

**Target State:**
- Same repository and GitHub location
- Authentication: Automation account (automation@ssdsbc.com)
- All 237 sheets accessible with new credentials
- Daily snapshots continue working
- All deployment/rollback scripts functional

---

## Prerequisites

Before starting this migration, ensure:

- [ ] Automation account created (automation@ssdsbc.com) - **BLOCKING**
- [ ] Automation account has 2FA enabled with backup codes saved
- [ ] Automation account added as **Manager** to all Shared Drives (not Content Manager)
- [ ] OAuth 2.0 configured for automation account - **BLOCKING**
- [ ] credentials.json and token.json available for automation account
- [ ] Apps Script API enabled in Google Cloud Project
- [ ] You have access to GitHub repository settings (to update secrets)
- [ ] Backup of current .clasp.json created
- [ ] At least 3 hours available for uninterrupted work

**Dependency Check:**
- Goal 1.1: Create Automation Account ✅ Must be complete
- Goal 1.2: Set Up Google Cloud Project ✅ Must be complete
- Goal 1.3: Configure OAuth 2.0 Credentials ✅ Must be complete
- Goal 1.4: Test API Access ✅ Must be complete

---

## Phase 1: Pre-Migration Safety

### 1.1 Create Full Backup

**Time:** 15 minutes

- [ ] Navigate to repository:
  ```bash
  cd ~/Desktop/ssd-google-sheets-staging-production
  ```

- [ ] Check git status (should be clean):
  ```bash
  git status
  ```

- [ ] Create backup branch:
  ```bash
  git checkout -b backup-before-automation-migration
  git push origin backup-before-automation-migration
  ```

- [ ] Create local backup:
  ```bash
  cd ~/Desktop
  cp -r ssd-google-sheets-staging-production ssd-google-sheets-staging-production-BACKUP-$(date +%Y%m%d)
  ```

- [ ] Verify backup exists:
  ```bash
  ls -la ~/Desktop/ssd-google-sheets-staging-production-BACKUP-*
  ```

**Success Criteria:** Backup branch on GitHub + local backup directory exists

---

### 1.2 Document Current State

**Time:** 10 minutes

- [ ] Save current clasp auth status:
  ```bash
  cd ~/Desktop/ssd-google-sheets-staging-production
  clasp whoami > migration-logs/pre-migration-clasp-status.txt
  ```

- [ ] Save current .clasp.json:
  ```bash
  cp .clasp.json migration-logs/pre-migration-clasp.json.backup
  ```

- [ ] List current GitHub Actions secrets:
  ```bash
  # Document which secrets exist (values are hidden)
  # Go to: https://github.com/mmaruthurssd/ssd-google-sheets-staging-production/settings/secrets/actions
  # Take screenshot or note secret names
  ```

- [ ] Test current deployment (single sheet):
  ```bash
  ./scripts/deploy-to-production.sh "D25-264_Prior_Auth_V3"
  ```

- [ ] Verify test successful:
  ```bash
  # Check output - should show "Deployment successful"
  # Check Google Sheet - should show latest code
  ```

**Success Criteria:** Current state documented, test deployment works

---

### 1.3 Create Migration Log Directory

**Time:** 2 minutes

- [ ] Create migration log directory:
  ```bash
  mkdir -p ~/Desktop/ssd-google-sheets-staging-production/migration-logs
  ```

- [ ] Create migration log file:
  ```bash
  cat > migration-logs/migration-log-$(date +%Y%m%d-%H%M%S).txt << 'EOF'
  GitHub System Migration Log
  ===========================
  Date: $(date)
  Performed by: [Your Name]

  Pre-migration state:
  - Personal account: mm@ssdsbc.com
  - Sheets tracked: 237
  - Daily snapshot: Operational

  Migration steps:
  EOF
  ```

**Success Criteria:** migration-logs/ directory created with initial log file

---

## Phase 2: clasp Re-authentication

### 2.1 Logout from Personal Account

**Time:** 5 minutes

- [ ] Check current clasp login:
  ```bash
  cd ~/Desktop/ssd-google-sheets-staging-production
  clasp whoami
  ```
  **Expected output:** Shows mm@ssdsbc.com

- [ ] Logout from clasp:
  ```bash
  clasp logout
  ```

- [ ] Verify logout:
  ```bash
  clasp whoami
  ```
  **Expected output:** "No credentials found. Please run `clasp login`."

- [ ] Remove old clasp credentials:
  ```bash
  # macOS location
  rm -f ~/.clasprc.json
  ```

- [ ] Log this step:
  ```bash
  echo "[$(date)] Step 2.1: Logged out from mm@ssdsbc.com" >> migration-logs/migration-log-*.txt
  ```

**Success Criteria:** clasp whoami shows "No credentials found"

---

### 2.2 Login with Automation Account

**Time:** 10 minutes

- [ ] Run clasp login:
  ```bash
  clasp login
  ```
  **This will open browser window**

- [ ] In browser:
  - [ ] **IMPORTANT:** Use automation@ssdsbc.com (NOT mm@ssdsbc.com)
  - [ ] Enter automation account password
  - [ ] Complete 2FA verification
  - [ ] Click "Allow" for all permissions
  - [ ] Wait for "Logged in! You may close this page."

- [ ] Verify login:
  ```bash
  clasp whoami
  ```
  **Expected output:** Shows automation@ssdsbc.com

- [ ] Check credential location:
  ```bash
  cat ~/.clasprc.json | grep -o '"login":"[^"]*"'
  ```
  **Expected output:** "login":"automation@ssdsbc.com"

- [ ] Log this step:
  ```bash
  echo "[$(date)] Step 2.2: Logged in as automation@ssdsbc.com" >> migration-logs/migration-log-*.txt
  ```

**Success Criteria:** clasp whoami shows automation@ssdsbc.com

**⚠️ CRITICAL CHECKPOINT:** Do NOT proceed if you see mm@ssdsbc.com. Repeat Step 2.1 and 2.2.

---

### 2.3 Test clasp Access to Single Sheet

**Time:** 15 minutes

- [ ] Choose pilot sheet for testing:
  ```bash
  # Use a non-critical sheet for initial testing
  PILOT_SHEET="D25-264_Prior_Auth_V3"
  ```

- [ ] Get script ID from registry:
  ```bash
  cat config/sheet-registry.json | grep -A 5 "$PILOT_SHEET"
  ```
  **Note the scriptId value**

- [ ] Create temporary test directory:
  ```bash
  mkdir -p ~/Desktop/clasp-migration-test
  cd ~/Desktop/clasp-migration-test
  ```

- [ ] Create .clasp.json with pilot sheet script ID:
  ```bash
  cat > .clasp.json << 'EOF'
  {
    "scriptId": "PASTE_SCRIPT_ID_HERE",
    "rootDir": "./src"
  }
  EOF
  ```

- [ ] Try pulling code:
  ```bash
  mkdir -p src
  clasp pull
  ```

- [ ] Verify pull successful:
  ```bash
  ls -la src/
  # Should see Code.gs and other script files
  ```

- [ ] Try pushing (no changes, just test):
  ```bash
  clasp push
  ```

- [ ] Verify push successful:
  ```bash
  # Should see "Pushed X files."
  ```

- [ ] Clean up test directory:
  ```bash
  cd ~/Desktop
  rm -rf clasp-migration-test
  ```

- [ ] Log this step:
  ```bash
  cd ~/Desktop/ssd-google-sheets-staging-production
  echo "[$(date)] Step 2.3: Successfully tested clasp pull/push on $PILOT_SHEET" >> migration-logs/migration-log-*.txt
  ```

**Success Criteria:** clasp pull and push work with automation account on pilot sheet

**🚨 STOP HERE IF ERRORS:** Do not proceed if you get permission errors. Verify automation account has Manager access to all Shared Drives.

---

## Phase 3: Update GitHub Actions Secrets

### 3.1 Generate New CLASP_TOKEN

**Time:** 10 minutes

- [ ] Ensure you're logged in as automation account:
  ```bash
  clasp whoami
  # Must show automation@ssdsbc.com
  ```

- [ ] Get clasp credentials:
  ```bash
  cat ~/.clasprc.json
  ```

- [ ] Copy the ENTIRE JSON contents (this is your new CLASP_TOKEN)

- [ ] Format for GitHub Secret:
  ```bash
  # The entire contents of ~/.clasprc.json becomes the CLASP_TOKEN
  # It should look like:
  # {"token":{"access_token":"...","refresh_token":"...","scope":"...","token_type":"Bearer","expiry_date":...},"oauth2ClientSettings":{"clientId":"...","clientSecret":"...","redirectUri":"..."},"isLocalCreds":true,"login":"automation@ssdsbc.com"}
  ```

**Success Criteria:** CLASP_TOKEN JSON contains "login":"automation@ssdsbc.com"

---

### 3.2 Update GitHub Repository Secrets

**Time:** 5 minutes

- [ ] Navigate to GitHub repository secrets:
  ```
  https://github.com/mmaruthurssd/ssd-google-sheets-staging-production/settings/secrets/actions
  ```

- [ ] Click on CLASP_TOKEN secret → "Update"

- [ ] Paste the new CLASP_TOKEN (entire ~/.clasprc.json contents)

- [ ] Click "Update secret"

- [ ] Verify updated:
  - [ ] Secret should show "Updated [timestamp]"
  - [ ] Note: You cannot view the value after saving

- [ ] Document in log:
  ```bash
  echo "[$(date)] Step 3.2: Updated CLASP_TOKEN in GitHub Actions secrets" >> migration-logs/migration-log-*.txt
  ```

**Success Criteria:** GitHub Actions CLASP_TOKEN secret updated

---

### 3.3 Update Other Secrets (If Needed)

**Time:** 5 minutes

Check if these secrets exist and need updating:

- [ ] **GOOGLE_CREDENTIALS**
  - Contains OAuth credentials.json
  - Update if using automation account's credentials.json:
    ```bash
    cat /path/to/automation-account-credentials.json
    # Copy entire JSON
    # Update in GitHub: Settings → Secrets → Actions → GOOGLE_CREDENTIALS
    ```

- [ ] **GOOGLE_TOKEN**
  - Contains OAuth token.json
  - Update if using automation account's token.json:
    ```bash
    cat /path/to/automation-account-token.json
    # Copy entire JSON
    # Update in GitHub: Settings → Secrets → Actions → GOOGLE_TOKEN
    ```

- [ ] **NOTIFICATION_EMAIL** (if exists)
  - Update to automation@ or keep as-is (your choice)

- [ ] Log updates:
  ```bash
  echo "[$(date)] Step 3.3: Updated additional GitHub secrets" >> migration-logs/migration-log-*.txt
  ```

**Success Criteria:** All relevant secrets updated

---

## Phase 4: Test Deployment Scripts

### 4.1 Test Single Sheet Deployment

**Time:** 15 minutes

- [ ] Return to repository:
  ```bash
  cd ~/Desktop/ssd-google-sheets-staging-production
  ```

- [ ] Choose pilot sheet (same as before):
  ```bash
  PILOT_SHEET="D25-264_Prior_Auth_V3"
  ```

- [ ] Run deployment script:
  ```bash
  ./scripts/deploy-to-production.sh "$PILOT_SHEET"
  ```

- [ ] Monitor output for errors

- [ ] Verify deployment successful:
  - [ ] Script shows "Deployment successful"
  - [ ] No permission errors
  - [ ] Sheet functions correctly in Google Sheets

- [ ] Check deployment log:
  ```bash
  cat logs/deployment-*.log
  # Should show successful deployment with automation@ssdsbc.com
  ```

- [ ] Log this step:
  ```bash
  echo "[$(date)] Step 4.1: Successfully deployed $PILOT_SHEET with automation account" >> migration-logs/migration-log-*.txt
  ```

**Success Criteria:** Single sheet deployment works with automation account

**🚨 STOP HERE IF ERRORS:** Do not proceed to testing rollback until deployment works.

---

### 4.2 Test Rollback Script

**Time:** 10 minutes

- [ ] Make test change to pilot sheet code:
  ```bash
  # Add a comment to test rollback
  echo "// Test comment for rollback verification" >> production-sheets/$PILOT_SHEET/Code.gs
  ```

- [ ] Commit and deploy test change:
  ```bash
  git add production-sheets/$PILOT_SHEET/Code.gs
  git commit -m "Test: Add comment for rollback verification"
  ./scripts/deploy-to-production.sh "$PILOT_SHEET"
  ```

- [ ] Verify test change deployed:
  - [ ] Open sheet in Google Sheets
  - [ ] Extensions → Apps Script
  - [ ] Should see test comment

- [ ] Run rollback script (to previous version):
  ```bash
  ./scripts/rollback.sh "$PILOT_SHEET"
  ```

- [ ] Verify rollback successful:
  - [ ] Script shows "Rollback successful"
  - [ ] Test comment removed from Apps Script
  - [ ] Sheet returns to previous state

- [ ] Log this step:
  ```bash
  echo "[$(date)] Step 4.2: Successfully tested rollback for $PILOT_SHEET" >> migration-logs/migration-log-*.txt
  ```

**Success Criteria:** Rollback script works with automation account

---

### 4.3 Test Multi-Sheet Deployment (3 sheets)

**Time:** 20 minutes

- [ ] Choose 3 low-risk sheets for testing:
  ```bash
  # Example sheets (choose non-critical ones)
  TEST_SHEETS=(
    "D25-264_Prior_Auth_V3"
    "TestSheet1"
    "TestSheet2"
  )
  ```

- [ ] Deploy each sheet:
  ```bash
  for sheet in "${TEST_SHEETS[@]}"; do
    echo "Deploying $sheet..."
    ./scripts/deploy-to-production.sh "$sheet"
    echo "Waiting 30 seconds before next deployment..."
    sleep 30
  done
  ```

- [ ] Verify all 3 deployments successful:
  - [ ] No permission errors
  - [ ] All sheets accessible in Google Sheets
  - [ ] All Apps Scripts functional

- [ ] Check deployment logs:
  ```bash
  tail -n 100 logs/deployment-*.log
  # Should show 3 successful deployments
  ```

- [ ] Log this step:
  ```bash
  echo "[$(date)] Step 4.3: Successfully deployed 3 test sheets" >> migration-logs/migration-log-*.txt
  ```

**Success Criteria:** Multiple consecutive deployments work without errors

---

## Phase 5: Verify Snapshot System

### 5.1 Test Snapshot Workflow Locally

**Time:** 15 minutes

- [ ] Navigate to snapshot scripts:
  ```bash
  cd ~/Desktop/ssd-google-sheets-staging-production/scripts
  ```

- [ ] Review snapshot script:
  ```bash
  cat snapshot-production-state.sh
  # Verify it uses clasp whoami or environment credentials
  ```

- [ ] Run snapshot script manually:
  ```bash
  ./snapshot-production-state.sh
  ```

- [ ] Verify snapshot created:
  ```bash
  ls -la ~/Desktop/ssd-google-sheets-staging-production/snapshots/
  # Should see new snapshot directory with timestamp
  ```

- [ ] Check snapshot contents:
  ```bash
  LATEST_SNAPSHOT=$(ls -t snapshots/ | head -1)
  ls -la snapshots/$LATEST_SNAPSHOT/
  # Should see Code.gs files for multiple sheets
  ```

- [ ] Verify snapshot git commit:
  ```bash
  git log --oneline -1
  # Should show snapshot commit message
  ```

- [ ] Log this step:
  ```bash
  echo "[$(date)] Step 5.1: Successfully ran snapshot script locally" >> migration-logs/migration-log-*.txt
  ```

**Success Criteria:** Snapshot script runs successfully and creates snapshot

---

### 5.2 Trigger GitHub Actions Snapshot

**Time:** 10 minutes

- [ ] Navigate to GitHub Actions:
  ```
  https://github.com/mmaruthurssd/ssd-google-sheets-staging-production/actions
  ```

- [ ] Find "Daily Production Snapshot" workflow

- [ ] Trigger manual run:
  - [ ] Click "Run workflow" dropdown
  - [ ] Select branch: main
  - [ ] Click "Run workflow" button

- [ ] Monitor workflow execution:
  - [ ] Should show "In progress" status
  - [ ] Click on workflow run to see details

- [ ] Wait for completion (should take 5-15 minutes)

- [ ] Verify workflow successful:
  - [ ] Status shows green checkmark ✅
  - [ ] No errors in logs
  - [ ] New commit in repository with snapshot

- [ ] Pull latest snapshot commit:
  ```bash
  cd ~/Desktop/ssd-google-sheets-staging-production
  git pull origin main
  ```

- [ ] Verify snapshot files:
  ```bash
  ls -la snapshots/
  # Should see new snapshot from GitHub Actions run
  ```

- [ ] Log this step:
  ```bash
  echo "[$(date)] Step 5.2: GitHub Actions snapshot workflow successful" >> migration-logs/migration-log-*.txt
  ```

**Success Criteria:** GitHub Actions snapshot workflow runs successfully with automation account

**🚨 CRITICAL:** If snapshot fails, check GitHub Actions logs for authentication errors. May need to update CLASP_TOKEN again.

---

### 5.3 Verify Daily Schedule

**Time:** 5 minutes

- [ ] Check GitHub Actions workflow file:
  ```bash
  cat .github/workflows/daily-snapshot.yml
  ```

- [ ] Verify cron schedule:
  ```yaml
  # Should see:
  schedule:
    - cron: '0 14 * * *'  # 9 AM ET (14:00 UTC)
  ```

- [ ] Confirm workflow enabled:
  - [ ] Go to: https://github.com/mmaruthurssd/ssd-google-sheets-staging-production/actions
  - [ ] "Daily Production Snapshot" should NOT show "disabled" badge

- [ ] Document next scheduled run:
  ```bash
  echo "[$(date)] Step 5.3: Daily snapshot schedule verified - Next run: 9 AM ET tomorrow" >> migration-logs/migration-log-*.txt
  ```

**Success Criteria:** Daily snapshot workflow scheduled and enabled

---

## Phase 6: Full Validation

### 6.1 Verify Access to All 237 Sheets

**Time:** 20 minutes

- [ ] Run registry validation script:
  ```bash
  cd ~/Desktop/ssd-google-sheets-staging-production
  npm run validate-registry
  ```

- [ ] Check validation results:
  ```bash
  # Should see:
  # ✅ All 237 sheets accessible
  # ✅ All script IDs valid
  # ✅ No permission errors
  ```

- [ ] If errors exist, review them:
  ```bash
  # Look for permission errors
  # May need to grant automation account Manager access to specific Shared Drives
  ```

- [ ] Spot check 10 random sheets manually:
  ```bash
  # Pick 10 random sheets from registry
  cat config/sheet-registry.json | jq -r '.[].name' | shuf | head -10
  ```

- [ ] For each random sheet:
  - [ ] Open in Google Sheets
  - [ ] Verify automation@ssdsbc.com has edit access
  - [ ] Open Apps Script (Extensions → Apps Script)
  - [ ] Verify script loads correctly

- [ ] Log this step:
  ```bash
  echo "[$(date)] Step 6.1: Validated access to all 237 sheets" >> migration-logs/migration-log-*.txt
  ```

**Success Criteria:** Automation account can access all 237 sheets

---

### 6.2 Test Complete Workflow End-to-End

**Time:** 30 minutes

This tests the complete workflow from code change → deployment → snapshot.

- [ ] Choose pilot sheet:
  ```bash
  PILOT_SHEET="D25-264_Prior_Auth_V3"
  ```

- [ ] Make meaningful code change:
  ```bash
  # Example: Add a helper function
  cat >> production-sheets/$PILOT_SHEET/Code.gs << 'EOF'

  /**
   * Migration test function - added during automation account migration
   * Can be removed after migration validation complete
   */
  function migrationTestFunction() {
    Logger.log('Migration successful - automation account working correctly');
    return true;
  }
  EOF
  ```

- [ ] Commit change:
  ```bash
  git add production-sheets/$PILOT_SHEET/Code.gs
  git commit -m "Migration test: Add test function to verify automation account deployment"
  ```

- [ ] Deploy to production:
  ```bash
  ./scripts/deploy-to-production.sh "$PILOT_SHEET"
  ```

- [ ] Verify deployment:
  - [ ] Open sheet in Google Sheets
  - [ ] Extensions → Apps Script
  - [ ] Should see migrationTestFunction()
  - [ ] Run function to test (should log success message)

- [ ] Trigger snapshot:
  ```bash
  ./scripts/snapshot-production-state.sh
  ```

- [ ] Verify snapshot captured change:
  ```bash
  LATEST_SNAPSHOT=$(ls -t snapshots/ | head -1)
  cat snapshots/$LATEST_SNAPSHOT/$PILOT_SHEET/Code.gs | grep "migrationTestFunction"
  # Should see the function in snapshot
  ```

- [ ] Test rollback:
  ```bash
  ./scripts/rollback.sh "$PILOT_SHEET"
  ```

- [ ] Verify rollback removed test function:
  - [ ] Open sheet Apps Script
  - [ ] migrationTestFunction should be gone
  - [ ] Sheet should be at previous state

- [ ] Redeploy to restore test function:
  ```bash
  ./scripts/deploy-to-production.sh "$PILOT_SHEET"
  ```

- [ ] Log this step:
  ```bash
  echo "[$(date)] Step 6.2: End-to-end workflow validated successfully" >> migration-logs/migration-log-*.txt
  ```

**Success Criteria:** Complete workflow (change → deploy → snapshot → rollback → redeploy) works

---

### 6.3 Documentation Update

**Time:** 15 minutes

- [ ] Update repository README:
  ```bash
  cd ~/Desktop/ssd-google-sheets-staging-production
  ```

- [ ] Add migration note to README.md:
  ```markdown
  ## Authentication Update (2025-11-08)

  **Migration Complete:** This repository now uses the dedicated automation account (`automation@ssdsbc.com`) for all Google Workspace operations.

  - **Previous account:** mm@ssdsbc.com (personal account)
  - **Current account:** automation@ssdsbc.com (automation account)
  - **Migration date:** 2025-11-08
  - **Sheets tracked:** 237 production sheets
  - **Status:** All deployments and snapshots operational

  For migration details, see: `migration-logs/migration-log-*.txt`
  ```

- [ ] Update any scripts with hardcoded email references:
  ```bash
  grep -r "mm@ssdsbc.com" scripts/
  # If found, update to automation@ssdsbc.com or make dynamic
  ```

- [ ] Commit documentation updates:
  ```bash
  git add README.md
  git commit -m "docs: Update authentication to automation account"
  git push origin main
  ```

- [ ] Log this step:
  ```bash
  echo "[$(date)] Step 6.3: Documentation updated" >> migration-logs/migration-log-*.txt
  ```

**Success Criteria:** Documentation reflects automation account usage

---

## Phase 7: Production Handoff

### 7.1 Monitor First Scheduled Snapshot

**Time:** Variable (next day at 9 AM ET)

- [ ] Schedule reminder for 9:15 AM ET next day

- [ ] At 9:15 AM ET, check GitHub Actions:
  ```
  https://github.com/mmaruthurssd/ssd-google-sheets-staging-production/actions
  ```

- [ ] Verify "Daily Production Snapshot" ran:
  - [ ] Should show run at 9:00 AM ET
  - [ ] Status should be ✅ Success
  - [ ] New snapshot commit should exist

- [ ] Pull latest snapshot:
  ```bash
  cd ~/Desktop/ssd-google-sheets-staging-production
  git pull origin main
  ```

- [ ] Verify snapshot contents:
  ```bash
  LATEST_SNAPSHOT=$(ls -t snapshots/ | head -1)
  ls -la snapshots/$LATEST_SNAPSHOT/
  # Should have fresh snapshot from all 237 sheets
  ```

- [ ] Check for any errors in workflow logs:
  - [ ] Click on workflow run
  - [ ] Review logs for permission errors
  - [ ] Review logs for authentication failures

- [ ] Log this step:
  ```bash
  echo "[$(date)] Step 7.1: First scheduled snapshot successful" >> migration-logs/migration-log-*.txt
  ```

**Success Criteria:** First scheduled snapshot runs successfully without intervention

---

### 7.2 Finalize Migration Log

**Time:** 10 minutes

- [ ] Add final notes to migration log:
  ```bash
  cat >> migration-logs/migration-log-*.txt << 'EOF'

  Migration Completion Summary
  ============================

  Final Status: ✅ SUCCESSFUL

  Components Migrated:
  - clasp authentication: automation@ssdsbc.com
  - GitHub Actions secrets: Updated
  - Single sheet deployment: ✅ Tested
  - Multi-sheet deployment: ✅ Tested
  - Rollback functionality: ✅ Tested
  - Snapshot system: ✅ Tested
  - Scheduled snapshots: ✅ Verified

  Sheets Validated: 237/237

  Issues Encountered:
  [Document any issues and how they were resolved]

  Recommendations:
  1. Monitor first week of scheduled snapshots
  2. Keep backup branch for 30 days
  3. Update team documentation with new authentication

  Migration completed by: [Your Name]
  Completion date: $(date)
  EOF
  ```

- [ ] Commit migration log:
  ```bash
  git add migration-logs/
  git commit -m "docs: Complete migration to automation account - log and validation"
  git push origin main
  ```

**Success Criteria:** Migration log complete and committed

---

### 7.3 Cleanup and Archive

**Time:** 5 minutes

- [ ] Keep backup for 30 days:
  ```bash
  echo "Backup location: ~/Desktop/ssd-google-sheets-staging-production-BACKUP-$(date +%Y%m%d)"
  echo "Delete after: $(date -v+30d)"
  # Add calendar reminder to delete backup in 30 days
  ```

- [ ] Archive backup branch (do NOT delete yet):
  ```bash
  # Keep backup-before-automation-migration branch on GitHub
  # Can delete after 30 days if no issues
  ```

- [ ] Document in project tracking:
  ```bash
  # Update Goal 1.5 in GOALS.md to "Complete"
  # Update MILESTONES.md if applicable
  # Add note to Implementation Project README
  ```

**Success Criteria:** Backups preserved, cleanup scheduled

---

## Rollback Procedure

**If migration fails at any point, use this emergency rollback:**

### Emergency Rollback Steps

1. **Restore clasp to personal account:**
   ```bash
   clasp logout
   clasp login
   # Login as mm@ssdsbc.com in browser
   ```

2. **Restore GitHub Actions secrets:**
   - Go to GitHub repository settings
   - Restore CLASP_TOKEN from backup (saved in Step 1.2)

3. **Restore from backup branch:**
   ```bash
   cd ~/Desktop/ssd-google-sheets-staging-production
   git checkout main
   git reset --hard backup-before-automation-migration
   git push origin main --force
   ```

4. **Test deployment with personal account:**
   ```bash
   ./scripts/deploy-to-production.sh "D25-264_Prior_Auth_V3"
   ```

5. **Document rollback:**
   ```bash
   echo "[$(date)] ROLLBACK: Migration failed, restored to personal account" >> migration-logs/migration-log-*.txt
   git add migration-logs/
   git commit -m "ROLLBACK: Restore personal account authentication"
   git push origin main
   ```

---

## Troubleshooting

### Issue: "Insufficient Permission" errors

**Symptoms:** clasp commands fail with 403/permission errors

**Solution:**
1. Verify automation account is **Manager** (not Content Manager) on all Shared Drives
2. Check automation account can open sheets manually in Google Sheets
3. Re-run Goal 1.4 (Test API Access) with automation account

---

### Issue: GitHub Actions snapshot fails

**Symptoms:** Workflow runs but fails with authentication errors

**Solutions:**
1. Verify CLASP_TOKEN secret is complete JSON (not truncated)
2. Re-generate CLASP_TOKEN:
   ```bash
   clasp whoami  # Verify automation account
   cat ~/.clasprc.json  # Copy ENTIRE contents
   # Update GitHub secret
   ```
3. Check workflow file uses correct secret name

---

### Issue: Some sheets work, others don't

**Symptoms:** Deployment works for some sheets, fails for others

**Solutions:**
1. Check which Shared Drive the failing sheets are in
2. Verify automation account has Manager access to that specific Shared Drive
3. Run registry validation to identify all problematic sheets:
   ```bash
   npm run validate-registry
   ```

---

### Issue: Rollback script fails

**Symptoms:** Cannot rollback to previous version

**Solutions:**
1. Check git log has previous versions:
   ```bash
   git log production-sheets/SHEET_NAME/
   ```
2. Manual rollback:
   ```bash
   git checkout HEAD~1 -- production-sheets/SHEET_NAME/
   ./scripts/deploy-to-production.sh "SHEET_NAME"
   ```

---

## Success Criteria Checklist

Migration is complete when ALL of these are true:

- [ ] clasp whoami shows automation@ssdsbc.com
- [ ] GitHub Actions CLASP_TOKEN updated
- [ ] Single sheet deployment tested successfully
- [ ] Rollback script tested successfully
- [ ] Multi-sheet deployment tested (3+ sheets)
- [ ] Manual snapshot script works
- [ ] GitHub Actions snapshot workflow successful
- [ ] Scheduled snapshot confirmed working (next day at 9 AM)
- [ ] All 237 sheets accessible with automation account
- [ ] End-to-end workflow validated (change → deploy → snapshot → rollback)
- [ ] Documentation updated
- [ ] Migration log complete
- [ ] Backup created and preserved

---

## Post-Migration Monitoring

**Week 1:**
- [ ] Monitor daily snapshots (should run at 9 AM ET every day)
- [ ] Check for authentication errors in GitHub Actions
- [ ] Review deployment logs for any permission issues
- [ ] Verify no degradation in deployment speed

**Week 2-4:**
- [ ] Conduct 3-5 production deployments to verify stability
- [ ] Test rollback on 2-3 sheets
- [ ] Monitor for any drift detection issues
- [ ] Validate automation account credentials have not expired

**After 30 Days:**
- [ ] Delete backup directory (if no issues encountered)
- [ ] Archive backup branch (or delete if no issues)
- [ ] Update team runbooks to reference automation account
- [ ] Schedule credential rotation (90-day cycle)

---

## Related Documents

- [GITHUB-INTEGRATION-GUIDE.md](GITHUB-INTEGRATION-GUIDE.md) - Complete integration architecture
- [AUTOMATION-ACCOUNT-GUIDE.md](AUTOMATION-ACCOUNT-GUIDE.md) - Automation account setup
- [OAUTH-SETUP-GUIDE.md](OAUTH-SETUP-GUIDE.md) - OAuth configuration
- [GOALS.md](../02-goals-and-milestones/GOALS.md) - Goal 1.5 tracking

---

**Created:** 2025-11-08
**Last Updated:** 2025-11-08
**Owner:** Marvin Maruthur
**Status:** Ready for use
**Estimated Completion Time:** 3 hours
**Risk Level:** Medium (changes authentication for 237 production sheets)

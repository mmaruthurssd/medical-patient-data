# Staging Environment (DEV3) Usage Guide

**Version**: 1.0.0
**Last Updated**: 2025-11-16
**For**: Medical Practice Team, Developers, Practice Manager

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Daily Workflow](#daily-workflow)
3. [Making Changes](#making-changes)
4. [Testing Changes](#testing-changes)
5. [Deploying to Production](#deploying-to-production)
6. [Emergency Rollback](#emergency-rollback)
7. [Safety Checks](#safety-checks)
8. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Prerequisites

Before using the staging environment, ensure you have:

- [x] Access to Google Drive (DEV3 sheets)
- [x] Git installed locally
- [x] Node.js installed (for scripts)
- [x] clasp configured (for Apps Script)
- [x] Repository cloned locally

### Installation

```bash
# Navigate to staging directory
cd "Implementation Projects/google-sheets-version-control/staging"

# Install dependencies
npm install

# Make scripts executable
chmod +x scripts/*.sh

# Verify setup
./scripts/validate-staging.sh
```

### First-Time Setup

1. **Generate test data** (one-time):
   ```bash
   node scripts/generate-test-data.js --preset medium
   ```

2. **Verify PHI detection works**:
   ```bash
   node scripts/check-phi-leakage.js --all
   ```

3. **Check backups directory exists**:
   ```bash
   ls -la ../backups/deployment-backups
   ```

---

## Daily Workflow

### Morning Routine

1. **Pull latest changes**:
   ```bash
   cd "Implementation Projects/google-sheets-version-control"
   git pull origin main
   ```

2. **Review staging snapshots** (automated at 9 AM Central):
   - Check GitHub Actions for snapshot status
   - Review any alerts in Google Sheets log

3. **Check for drift**:
   ```bash
   ./staging/scripts/detect-drift.sh
   ```

### Making Changes

**ALWAYS work in DEV3 (staging), NEVER in production!**

#### Step 1: Open DEV3 Sheet

1. Go to Google Drive
2. Find the **DEV3** version of the sheet (has "[DEV]" prefix)
3. Open the sheet
4. Tools → Script editor

#### Step 2: Make Your Changes

```javascript
// ALWAYS include header comment in staging code
// STAGING ENVIRONMENT - TEST DATA ONLY
// NO PHI - SYNTHETIC DATA
// DEV3 TESTING

function myNewFeature() {
  // Your code here
  // Use TEST- prefixed data only
}
```

#### Step 3: Test Locally

```bash
# Generate fresh test data if needed
node staging/scripts/generate-test-data.js --schema patient --count 50

# Open DEV3 sheet and run your function
# Verify it works with synthetic data
```

#### Step 4: Pull Changes to Local

```bash
cd staging/scripts
./snapshot-staging.js --sheet <sheet-number>
```

#### Step 5: Validate

```bash
# Check for PHI
node check-phi-leakage.js --sheet <sheet-number>

# Review changes
git diff staging-sheets/sheet-XXX_DEV3/
```

#### Step 6: Commit

```bash
git add staging-sheets/sheet-XXX_DEV3/
git commit -m "Add new feature to sheet XXX: [description]"
git push origin main
```

---

## Testing Changes

### Unit Testing

Test individual functions:

```javascript
// In DEV3 Apps Script editor
function testMyFeature() {
  // Use synthetic test data
  const testPatient = {
    mrn: 'TEST-MRN-000001',
    name: 'Test Patient',
    dob: '01/01/1990'
  };

  const result = myNewFeature(testPatient);
  Logger.log(result);
}
```

### Integration Testing

Test complete workflows:

1. Open DEV3 sheet
2. Use test data from `staging/test-data/`
3. Run full workflow
4. Verify outputs match expected results

### Automated Testing

```bash
# Run pre-deployment tests
./staging/scripts/run-staging-tests.js --sheet <sheet-number>
```

### Validation Checklist

Before deploying, verify:

- [ ] Function works with test data
- [ ] No hardcoded production IDs
- [ ] No console.log() statements (or acceptable)
- [ ] No TODO comments
- [ ] Code follows style guidelines
- [ ] PHI check passes
- [ ] Tests pass

---

## Deploying to Production

### Pre-Deployment Checklist

**CRITICAL**: Complete ALL checks before deployment

- [ ] Changes tested thoroughly in DEV3
- [ ] PHI scan passed (no real patient data)
- [ ] Code review completed (if applicable)
- [ ] Production backup exists
- [ ] Approval obtained from Practice Manager

### Deployment Process

#### Option 1: Single Sheet Deployment

```bash
cd staging/scripts

# Deploy sheet 42 from staging to production
./deploy-to-production.sh --sheet 42

# Follow prompts:
# 1. Review PHI scan results
# 2. Review code diff
# 3. Type 'yes' to approve
# 4. Wait for deployment
# 5. Verify success
```

#### Option 2: Batch Deployment

```bash
# Deploy sheets 1-10
./deploy-to-production.sh --batch 1 10

# Each sheet will prompt for approval
```

#### Option 3: Auto-Approve (Use with Caution!)

```bash
# Skip manual approval (trusted changes only)
./deploy-to-production.sh --sheet 42 --auto-approve
```

### Post-Deployment Verification

After deployment:

1. **Check production sheet**:
   - Open PROD sheet in Google Drive
   - Verify code was updated
   - Run quick smoke test

2. **Monitor for errors**:
   - Check execution logs in Apps Script
   - Review error tracking sheet
   - Watch for user reports

3. **Verify git commit**:
   ```bash
   git log -1
   # Should show deployment commit
   ```

---

## Emergency Rollback

### When to Rollback

Rollback immediately if:
- Production errors after deployment
- PHI detected in deployed code
- Critical functionality broken
- Unexpected behavior

### Rollback Procedure

#### Step 1: List Available Backups

```bash
cd staging/scripts
./rollback-staging.sh --list
```

Output shows:
```
sheet-42_prod-backup_20251116-143000
  Sheet: 42
  Time:  2025-11-16T14:30:00Z
```

#### Step 2: Restore from Backup

```bash
./rollback-staging.sh --restore sheet-42_prod-backup_20251116-143000

# Confirm when prompted
```

#### Step 3: Verify Restoration

```bash
# Check production sheet
# Verify old code is restored
# Test functionality
```

#### Step 4: Fix Issue in Staging

```bash
# Don't redeploy until issue is fixed!
# 1. Fix code in DEV3 sheet
# 2. Test thoroughly
# 3. Re-deploy when ready
```

---

## Safety Checks

### PHI Detection

**Automatic scans for**:
- Real patient names
- Medical record numbers
- Social Security Numbers
- Dates of birth
- Phone numbers and addresses
- Email addresses

**Whitelist (allowed in staging)**:
- TEST-MRN-XXXXXX
- test@test.com
- 555-555-5555
- 999-99-XXXX (SSN)

### Manual PHI Check

Before deploying, manually verify:

```bash
# Scan specific sheet
node staging/scripts/check-phi-leakage.js --sheet 42

# Scan all staging
node staging/scripts/check-phi-leakage.js --all

# Scan specific file
node staging/scripts/check-phi-leakage.js --file path/to/Code.js
```

### Production Protection

**Production sheets are READ-ONLY**:
- Changes ONLY via deployment script
- Never edit PROD sheets directly
- All edits go through staging first

**Safety features**:
- Pre-deployment PHI scan (blocks if detected)
- Manual approval required (unless --auto-approve)
- Automatic backup before deploy
- Post-deployment verification
- Auto-rollback on failure

---

## Troubleshooting

### Common Issues

#### Issue: PHI Scan Fails

```
Error: PHI detected - DEPLOYMENT BLOCKED
```

**Solution**:
1. Review scan output for detected patterns
2. Verify data is actually synthetic (TEST- prefix)
3. Add to whitelist if false positive
4. Remove real data if actual PHI

#### Issue: Deployment Verification Fails

```
Error: File count mismatch!
```

**Solution**:
1. Check staging sheet has all files
2. Verify .clasp.json is correct
3. Re-pull staging code
4. Try deployment again

#### Issue: Rollback Needed but No Backup

```
Error: No backups found
```

**Solution**:
1. Check `backups/deployment-backups/` directory
2. If truly no backup, re-pull from Google Drive:
   ```bash
   cd scripts
   ./repull-all-prod-sheets.sh --sheet 42
   ```

#### Issue: Test Data Not Realistic Enough

**Solution**:
```bash
# Generate larger dataset
node staging/scripts/generate-test-data.js --preset large

# Or custom preset
node staging/scripts/generate-test-data.js --schema patient --count 1000
```

### Getting Help

1. **Check logs**:
   ```bash
   tail -100 logs/deployments.log
   tail -100 logs/rollbacks.log
   ```

2. **Review documentation**:
   - `STAGING-ENVIRONMENT-ARCHITECTURE.md` - Architecture
   - `DEPLOYMENT-WORKFLOW.md` - Detailed deployment
   - `../docs/DATA-PROTECTION.md` - Backup strategy

3. **Contact support**:
   - Practice Manager
   - Development Team
   - GitHub Issues

---

## Best Practices

### DO

✅ Always test changes in DEV3 first
✅ Use synthetic test data (TEST- prefix)
✅ Run PHI scan before deployment
✅ Review diff before approving deployment
✅ Keep production as read-only source
✅ Document changes in commit messages
✅ Test rollback procedure periodically

### DON'T

❌ Edit production sheets directly
❌ Use real patient data in staging
❌ Skip PHI validation
❌ Deploy without testing
❌ Use --auto-approve casually
❌ Ignore deployment warnings
❌ Deploy on Fridays (no time to fix if issues!)

---

## Quick Reference

### Essential Commands

```bash
# Generate test data
node staging/scripts/generate-test-data.js --preset medium

# Check for PHI
node staging/scripts/check-phi-leakage.js --sheet 42

# Deploy to production
cd staging/scripts
./deploy-to-production.sh --sheet 42

# List backups
./rollback-staging.sh --list

# Rollback
./rollback-staging.sh --restore <backup-id>

# Validate staging
./validate-staging.sh --sheet 42
```

### Directory Locations

```
staging/                    # Staging configuration
├── config/                 # Configuration files
│   ├── safety-checks-config.json
│   └── test-data-schemas.json
├── scripts/                # Automation scripts
│   ├── generate-test-data.js
│   ├── check-phi-leakage.js
│   ├── deploy-to-production.sh
│   └── rollback-staging.sh
└── test-data/              # Generated synthetic data

staging-sheets/             # 235 DEV3 sheet backups
production-sheets/          # 235 PROD sheet backups
backups/deployment-backups/ # Production backups before deploy
logs/                       # Deployment and rollback logs
```

---

## Support

**Questions or issues?**
- Check documentation in `staging/` directory
- Review logs in `logs/` directory
- Create GitHub issue
- Contact Practice Manager

---

**Last Updated**: 2025-11-16
**Version**: 1.0.0
**Maintained By**: AI Development Team

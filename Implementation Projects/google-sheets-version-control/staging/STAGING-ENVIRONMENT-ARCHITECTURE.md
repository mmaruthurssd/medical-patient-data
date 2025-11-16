# Staging Environment (DEV3) Architecture

**Status**: Production-Ready
**Priority**: P1 - Critical
**Estimated Setup Time**: 6-8 hours
**Last Updated**: 2025-11-16

---

## Executive Summary

This staging environment (DEV3) provides a complete testing infrastructure for the Google Sheets version control system, enabling safe testing of changes before production deployment. The system manages 235 staging sheets mirrored from production, with automated snapshots, synthetic test data, and comprehensive safety checks to prevent PHI leakage.

**Key Features**:
- Isolated testing environment separate from 235 production sheets
- Automated snapshot system (2x daily at 9 AM & 5 PM Central)
- Synthetic test data generation (NO real patient data)
- Safety checks preventing staging data from reaching production
- Complete backup and rollback procedures
- Drift detection between staging and production

---

## Architecture Overview

### Three-Environment Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                   GOOGLE DRIVE (Source)                      │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │ PRODUCTION   │  │   DEV3       │  │   TEST DATA     │   │
│  │ 235 Sheets   │  │ 235 Sheets   │  │   Synthetic     │   │
│  │ (LIVE DATA)  │  │ (TEST DATA)  │  │   Generator     │   │
│  └──────────────┘  └──────────────┘  └─────────────────┘   │
└─────────────────────────────────────────────────────────────┘
         │                    │                    │
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│              LOCAL VERSION CONTROL (Git)                     │
│                                                              │
│  production-sheets/        staging-sheets/                   │
│  ├── sheet-000_PROD/      ├── sheet-000_DEV3/               │
│  ├── sheet-001_PROD/      ├── sheet-001_DEV3/               │
│  └── ... (235 total)      └── ... (235 total)               │
└─────────────────────────────────────────────────────────────┘
         │                                    │
         │                                    │
         ▼                                    ▼
┌──────────────────────┐          ┌────────────────────────┐
│  GITHUB (Backup)     │          │  SAFETY VALIDATION     │
│  - Production branch │          │  - PHI Detection       │
│  - Staging branch    │          │  - Data Sanitization   │
│  - Automated backups │          │  - Deployment Checks   │
└──────────────────────┘          └────────────────────────┘
```

### Workflow Direction

```
STAGING (DEV3) → Testing → Approval → PRODUCTION
      ↓              ↓          ↓            ↑
  Changes      Validation  Review    Never Direct Edit
  Testing       Snapshot   Approve   Always via Deploy
  Iteration     Compare    Deploy    Read-only Source
```

**CRITICAL PRINCIPLE**: Production is READ-ONLY. All changes flow from staging to production via controlled deployment.

---

## Directory Structure

```
google-sheets-version-control/
├── staging/                              # NEW: Staging environment
│   ├── STAGING-ENVIRONMENT-ARCHITECTURE.md  # This file
│   ├── STAGING-USAGE-GUIDE.md            # How to use staging
│   ├── DEPLOYMENT-WORKFLOW.md            # DEV3 → Production
│   ├── config/
│   │   ├── staging-registry.json         # 235 DEV3 sheets
│   │   ├── test-data-schemas.json        # Synthetic data definitions
│   │   └── safety-checks-config.json     # PHI prevention rules
│   ├── scripts/
│   │   ├── snapshot-staging.js           # Automated staging snapshots
│   │   ├── generate-test-data.js         # Create synthetic data
│   │   ├── validate-staging.sh           # Pre-deployment validation
│   │   ├── deploy-to-production.sh       # Controlled deployment
│   │   ├── rollback-staging.sh           # Undo staging changes
│   │   └── check-phi-leakage.js          # Scan for real data
│   └── test-data/
│       ├── synthetic-patients.json       # Fake patient records
│       ├── synthetic-providers.json      # Fake provider data
│       └── README.md                     # Test data documentation
│
├── production-sheets/                    # EXISTING: 235 production
│   └── sheet-*_PROD/
│
└── staging-sheets/                       # EXISTING: 235 staging
    └── sheet-*_DEV3/
```

---

## Key Components

### 1. Staging Registry

**File**: `staging/config/staging-registry.json`

Tracks all 235 DEV3 sheets with metadata:
- Sheet ID and Script ID
- Last modified timestamp
- Deployment status (staged, approved, deployed)
- Test data status (synthetic, real, none)
- PHI check status (clean, needs review)

### 2. Test Data Generator

**File**: `staging/scripts/generate-test-data.js`

Creates realistic but fake data:
- Synthetic patient names (using faker.js)
- Fake MRNs (medical record numbers)
- Synthetic dates and addresses
- Test insurance information
- Mock clinical data

**NEVER uses real PHI - all data is generated**

### 3. Automated Snapshot System

**File**: `staging/scripts/snapshot-staging.js`

Runs 2x daily (9 AM & 5 PM Central):
- Pulls all 235 DEV3 sheet code
- Commits to `staging-sheets/` directory
- Logs to Google Sheets tracking system
- Detects drift from production
- Alerts on unexpected changes

### 4. Safety Validation Layer

**File**: `staging/scripts/check-phi-leakage.js`

Pre-deployment checks:
- Scans for real patient names
- Detects actual MRNs or SSNs
- Checks for real addresses/phone numbers
- Validates against known production data
- **BLOCKS deployment if PHI detected**

### 5. Deployment Pipeline

**File**: `staging/scripts/deploy-to-production.sh`

Controlled deployment process:
1. Validate staging code (no PHI)
2. Show diff (what will change in production)
3. Require approval (manual confirmation)
4. Backup production (create snapshot)
5. Deploy staging → production
6. Verify deployment (automated tests)
7. Log deployment (audit trail)

### 6. Rollback System

**File**: `staging/scripts/rollback-staging.sh`

Emergency recovery:
- Restore staging from last good state
- Undo failed deployments
- Recover from git history
- Re-sync from production if needed

---

## Safety Features

### PHI Compliance Measures

**STAGING ENVIRONMENT - NO REAL PHI**:

1. **Test Data Only**
   - All staging sheets use synthetic data
   - Test data generator creates fake records
   - No real patient information allowed

2. **PHI Detection**
   - Pre-commit hooks scan for real data
   - Deployment validation checks for PHI
   - Automated alerts on suspicious patterns

3. **Data Isolation**
   - Staging completely separate from production
   - No shared databases or APIs
   - Different Google Drive folders

4. **Access Controls**
   - Staging sheets visible only to dev team
   - Production sheets read-only
   - Service account has limited permissions

### Deployment Safety

**PREVENT STAGING DATA → PRODUCTION**:

1. **Pre-Deployment Validation**
   ```bash
   # Runs before every deployment
   ./staging/scripts/validate-staging.sh

   Checks:
   ✓ No PHI in staging code
   ✓ No hardcoded production IDs
   ✓ No references to real patient data
   ✓ All tests passing
   ✓ Code quality metrics met
   ```

2. **Manual Approval Required**
   ```bash
   # Deployment process requires explicit confirmation
   Deploy to production? (yes/NO):
   ```

3. **Production Backup Before Deploy**
   ```bash
   # Automatic snapshot before any changes
   Backing up production state...
   Snapshot: prod-backup-2025-11-16-14-30
   ```

4. **Rollback Capability**
   ```bash
   # Can undo deployment immediately
   ./staging/scripts/rollback-production.sh prod-backup-2025-11-16-14-30
   ```

---

## Workflow Examples

### Making a Change (Correct Way)

```bash
# 1. Edit code in DEV3 spreadsheet (Google Drive)
# Open DEV3 sheet → Tools → Script editor → Make changes

# 2. Test in staging environment
# Run functions, check outputs, verify behavior

# 3. Pull changes to local staging
cd staging/scripts
./snapshot-staging.js --sheet-id <DEV3_SHEET_ID>

# 4. Validate changes
./validate-staging.sh --sheet <sheet-number>

# 5. Review changes
git diff staging-sheets/sheet-XXX_DEV3/

# 6. Deploy to production (if approved)
./deploy-to-production.sh --sheet <sheet-number>
```

### Testing New Features

```bash
# 1. Generate test data for staging sheet
cd staging/scripts
./generate-test-data.js --sheet <sheet-number> --patients 100

# 2. Open DEV3 sheet and test new feature
# Verify behavior with synthetic data

# 3. Run automated tests
./run-staging-tests.sh --sheet <sheet-number>

# 4. If successful, deploy to production
./deploy-to-production.sh --sheet <sheet-number>
```

### Emergency Rollback

```bash
# If production deployment fails:
cd staging/scripts

# 1. Check rollback points
./list-rollback-points.sh

# 2. Rollback production to previous state
./rollback-production.sh <backup-id>

# 3. Fix issue in staging
# (edit code in DEV3 sheet)

# 4. Re-test and re-deploy
./validate-staging.sh && ./deploy-to-production.sh
```

---

## Automated Snapshot Schedule

### Daily Staging Snapshots

**GitHub Actions Workflow**: `.github/workflows/staging-snapshots.yml`

```yaml
Schedule:
  - 9:00 AM Central (after production snapshot)
  - 5:00 PM Central (after production snapshot)

Process:
  1. Pull all 235 DEV3 sheets
  2. Compare with production
  3. Detect drift
  4. Commit to staging-sheets/
  5. Log to Google Sheets
  6. Alert on anomalies
```

### Drift Detection

Compares staging vs production:
- Reports sheets modified in production (unauthorized changes)
- Highlights staging sheets not yet deployed
- Shows deployment candidates (ready to promote)

---

## Monitoring and Logging

### Staging Activity Log

**Google Sheet**: "Staging Environment Log - SSD Google Sheets"

Tracks:
- Snapshot runs (timestamp, status, duration)
- Deployments (staging → production)
- Rollbacks (recovery operations)
- PHI checks (validation results)
- Test data generation (synthetic data created)

### Alerts

Automated notifications for:
- Failed staging snapshots
- PHI detected in staging
- Unauthorized production changes
- Deployment failures
- Drift beyond threshold

---

## Security and Compliance

### HIPAA Compliance

**STAGING = NO PHI ZONE**:

1. All test data is synthetic (generated by scripts)
2. No real patient information allowed
3. Pre-deployment PHI scanning (mandatory)
4. Isolated from production systems
5. Access restricted to dev team only

### Access Control

**Who Can Access What**:

| Role | Production (Read) | Production (Write) | Staging (Read/Write) |
|------|-------------------|--------------------|--------------------|
| Service Account | ✅ Yes | ❌ No (deploy only) | ✅ Yes |
| Developers | ✅ Yes | ❌ No | ✅ Yes |
| Practice Manager | ✅ Yes | ❌ Via deploy script | ✅ Yes |

### Audit Trail

All operations logged:
- Git commits (code changes)
- Google Sheets log (activity tracking)
- Deployment records (who deployed what when)
- Rollback events (recovery operations)

---

## Performance Specifications

### Snapshot Performance

**Target**: 235 DEV3 sheets in < 45 minutes

```
Batch 1: Sheets 0-78   (79 sheets) - ~15 min
Batch 2: Sheets 79-156 (78 sheets) - ~15 min
Batch 3: Sheets 157-234 (78 sheets) - ~15 min
```

### Deployment Time

**Single Sheet Deployment**: < 5 minutes
- Validation: 1 min
- Backup: 1 min
- Deploy: 2 min
- Verify: 1 min

**Batch Deployment**: ~30 minutes for 10 sheets

### Rollback Time

**Emergency Rollback**: < 2 minutes
- Restore from git: 30 sec
- Restore to production: 60 sec
- Verify: 30 sec

---

## Cost Analysis

### Storage

- Local Git Repository: ~500 MB (staging sheets)
- GitHub Repository: Included in existing repo
- Google Drive: No extra cost (existing sheets)

**Total Additional Cost**: $0/month

### Time Investment

| Activity | Initial Setup | Ongoing (per month) |
|----------|--------------|---------------------|
| Environment setup | 6-8 hours | - |
| Automated snapshots | - | 0 hours (automated) |
| Manual testing | - | 2-4 hours |
| Deployments | - | 1-2 hours |
| **Total** | **6-8 hours** | **3-6 hours** |

### ROI Calculation

**Without Staging**:
- Risk: Breaking production sheets (235 sheets × ~30 min recovery = 117 hours)
- Cost: Practice disruption, data loss risk
- Manual testing time: 8+ hours per change

**With Staging**:
- Risk: Isolated to staging (no production impact)
- Cost: $0/month + 3-6 hours/month testing
- Safe testing: Unlimited iterations
- **ROI**: Prevents 117-hour disaster recovery scenario

---

## Disaster Recovery

### Staging Environment Recovery

**Scenario**: Staging repository corrupted

```bash
# 1. Clone fresh from GitHub
git clone <repo-url>

# 2. Verify staging-sheets/ directory
ls -la staging-sheets/

# 3. If missing, re-snapshot from Google Drive
cd staging/scripts
./snapshot-all-staging.sh
```

### Production Rollback from Staging Failure

**Scenario**: Bad deployment to production

```bash
# 1. Immediately rollback
./staging/scripts/rollback-production.sh <last-good-backup>

# 2. Verify production restored
./verify-production.sh

# 3. Fix issue in staging
# (edit DEV3 sheet, test, validate)

# 4. Re-deploy when ready
./deploy-to-production.sh
```

### Complete Environment Rebuild

**Scenario**: Total staging loss

```bash
# 1. Re-fetch all 235 DEV3 sheets from Google Drive
./rebuild-staging-from-production.sh

# 2. Recreate test data
./generate-test-data.js --all-sheets

# 3. Run health check
./staging-health-check.sh
```

---

## Integration with Existing Systems

### GitHub Actions

Staging snapshots integrated with existing workflow:
- Uses same service account
- Same logging infrastructure
- Parallel to production snapshots

### Version Control

Staging uses same git repository:
- Separate `staging-sheets/` directory
- Same backup strategy (6 layers)
- Same pre-commit hooks

### Monitoring

Staging tracked in same Google Sheet log:
- "Staging Snapshots" tab
- Same alert system
- Same reporting dashboard

---

## Next Steps After Setup

1. **Week 1**: Test staging snapshot automation
2. **Week 2**: Generate initial test data for all sheets
3. **Week 3**: Deploy first 10 sheets from staging to production
4. **Week 4**: Full staging → production workflow adoption

### Metrics to Track

- Staging snapshot success rate (target: >99%)
- Deployment frequency (target: weekly)
- PHI detection false positives (target: <5%)
- Rollback frequency (target: <1/month)
- Time saved vs. direct production edits (target: 50%+)

---

## References

### Related Documentation

- `STAGING-USAGE-GUIDE.md` - Day-to-day usage
- `DEPLOYMENT-WORKFLOW.md` - Detailed deployment process
- `../PROJECT-OVERVIEW.md` - Overall system architecture
- `../docs/DATA-PROTECTION.md` - Backup and recovery
- `../SECURITY.md` - Security policies

### Scripts

- `staging/scripts/snapshot-staging.js` - Staging snapshots
- `staging/scripts/deploy-to-production.sh` - Controlled deployment
- `staging/scripts/generate-test-data.js` - Synthetic data
- `staging/scripts/check-phi-leakage.js` - PHI validation

### External Resources

- [Apps Script Best Practices](https://developers.google.com/apps-script/guides/best-practices)
- [HIPAA Compliance for Developers](https://www.hhs.gov/hipaa/for-professionals/security/index.html)
- [Git Workflow Strategies](https://www.atlassian.com/git/tutorials/comparing-workflows)

---

**Document Owner**: Medical Practice Management Team
**Technical Lead**: AI Development Team
**Status**: Production-Ready
**Last Updated**: 2025-11-16
**Review Schedule**: Monthly

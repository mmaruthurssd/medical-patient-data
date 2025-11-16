# Credential Rotation Guide

**HIPAA-Compliant Credential Management System**

## Overview

This guide covers the credential rotation tracking and alerting system for SSD Google Sheets Version Control project. Regular credential rotation is required for HIPAA compliance and security best practices.

## Table of Contents

- [Quick Start](#quick-start)
- [System Architecture](#system-architecture)
- [Tracked Credentials](#tracked-credentials)
- [Rotation Schedules](#rotation-schedules)
- [Using the CLI Tool](#using-the-cli-tool)
- [Rotation Procedures](#rotation-procedures)
- [Alerting System](#alerting-system)
- [Compliance and Audit](#compliance-and-audit)
- [Troubleshooting](#troubleshooting)

## Quick Start

### Check Credential Status

```bash
cd "Implementation Projects/google-sheets-version-control/security/credentials"
node credential-manager.js status
```

### Check Upcoming Rotations

```bash
node credential-manager.js check-rotations
```

### Record a Rotation

```bash
node credential-manager.js rotate <credential-id>
```

### Generate Audit Report

```bash
node credential-manager.js audit-report
```

## System Architecture

### Components

1. **Credential Inventory** (`credential-inventory.json`)
   - Master list of all tracked credentials
   - Rotation schedules and metadata
   - Compliance requirements

2. **Rotation Audit Log** (`rotation-audit-log.json`)
   - HIPAA-compliant audit trail
   - 7-year retention period
   - All rotation activities logged

3. **CLI Management Tool** (`credential-manager.js`)
   - Status checking
   - Rotation recording
   - Alert generation
   - Audit reporting

4. **Health Check Integration** (`check-rotation-status.sh`)
   - Automated monitoring
   - Integration with workspace health checks
   - Alert triggering

### File Structure

```
security/
└── credentials/
    ├── credential-inventory.json      # Master credential list
    ├── rotation-audit-log.json        # HIPAA audit trail
    ├── credential-manager.js          # CLI management tool
    └── check-rotation-status.sh       # Health check script
```

## Tracked Credentials

### 1. GCP Service Account (Primary)

**Credential ID:** `gcp-service-account-001`

- **Email:** `ssd-automation-service-account@workspace-automation-ssdspc.iam.gserviceaccount.com`
- **Type:** Google Cloud Service Account
- **Rotation:** Annual
- **Criticality:** Critical
- **Location:**
  - Local: `~/service-account-keys/google-sheets-vc.json`
  - GitHub Secret: `GCP_SERVICE_ACCOUNT`
- **Used By:**
  - GitHub Actions (daily-snapshots.yml)
  - GitHub Actions (backup-to-gcs.yml)
  - Local development scripts

### 2. GCS Backup Service Account

**Credential ID:** `gcs-service-account-001`

- **Type:** Google Cloud Service Account
- **Rotation:** Annual
- **Criticality:** Critical
- **Location:** GitHub Secret `GCS_SERVICE_ACCOUNT_KEY`
- **Used By:** GitHub Actions (backup-to-gcs.yml)

### 3. GitHub Personal Access Token

**Credential ID:** `github-pat-001`

- **Type:** GitHub PAT
- **Rotation:** Quarterly
- **Criticality:** High
- **Scopes:** repo, workflow, read:org
- **Used By:** Local development, CI/CD workflows

### 4. GitHub Deploy Key

**Credential ID:** `github-deploy-key-001`

- **Type:** SSH Key
- **Rotation:** Annual
- **Criticality:** Medium
- **Location:**
  - Local: `~/.ssh/id_ed25519_github`
  - GitHub: Repository Settings > Deploy Keys

### 5. Google OAuth Client Credentials

**Credential ID:** `google-oauth-client-001`

- **Type:** OAuth 2.0 Client
- **Rotation:** Annual
- **Criticality:** Critical
- **Location:**
  - Local: `credentials.json` (gitignored)
  - Token: `token.json` (gitignored)

## Rotation Schedules

### Annual (365 days)
- GCP Service Accounts
- OAuth Client Credentials
- SSH Deploy Keys
- **Warning:** 30 days before due
- **Critical:** 7 days before due

### Quarterly (90 days)
- GitHub Personal Access Tokens
- API Keys
- **Warning:** 14 days before due
- **Critical:** 3 days before due

### Monthly (30 days)
- High-risk credentials (if any)
- **Warning:** 7 days before due
- **Critical:** 2 days before due

## Using the CLI Tool

### Installation

No installation needed - uses Node.js built into the project.

### Commands

#### Show All Credential Status

```bash
node credential-manager.js status
```

Output includes:
- Current rotation status for all credentials
- Days until next rotation
- Criticality level
- HIPAA compliance status
- Summary statistics

#### Check Upcoming Rotations

```bash
node credential-manager.js check-rotations
```

Shows only credentials that need attention:
- Overdue rotations (🔴)
- Critical (🟠) - within 7 days
- Warning (🟡) - within 30 days

#### Record a Rotation

After rotating a credential:

```bash
node credential-manager.js rotate gcp-service-account-001
```

This will:
- Update the rotation history
- Calculate next rotation date
- Add entry to audit log
- Update credential inventory

#### Generate Audit Report

For HIPAA compliance audits:

```bash
node credential-manager.js audit-report
```

Includes:
- All credential details
- Rotation history
- Recent activity log
- Compliance status

#### Check Alerts

```bash
node credential-manager.js alerts
```

Shows credentials needing attention and their notification recipients.

### Exit Codes

- `0` - Success, all OK
- `1` - Warning state (rotations needed soon)
- `2` - Critical/overdue state

## Rotation Procedures

### Pre-Rotation Checklist

Before rotating any credential:

- [ ] Review who/what uses this credential
- [ ] Identify all locations where credential is stored
- [ ] Plan rotation window (minimize disruption)
- [ ] Have rollback plan ready
- [ ] Notify team members if needed
- [ ] Backup current configuration

### Service Account Rotation Procedure

#### GCP Service Account (`gcp-service-account-001`)

**Preparation:**

1. Create new service account key:
   ```bash
   gcloud iam service-accounts keys create ~/new-key.json \
     --iam-account=ssd-automation-service-account@workspace-automation-ssdspc.iam.gserviceaccount.com
   ```

2. Test new key locally:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS=~/new-key.json
   # Run test script to verify access
   node scripts/test-apps-script-api.js
   ```

**Execution:**

3. Update GitHub Secret:
   - Go to repository Settings > Secrets and variables > Actions
   - Update `GCP_SERVICE_ACCOUNT` with new key content
   - **DO NOT delete old secret yet**

4. Test GitHub Actions:
   - Trigger manual workflow run
   - Verify successful completion
   - Check logs for authentication issues

5. Update local development:
   ```bash
   cp ~/new-key.json ~/service-account-keys/google-sheets-vc.json
   chmod 600 ~/service-account-keys/google-sheets-vc.json
   ```

6. Delete old key:
   ```bash
   gcloud iam service-accounts keys list \
     --iam-account=ssd-automation-service-account@workspace-automation-ssdspc.iam.gserviceaccount.com

   # Find old key ID and delete
   gcloud iam service-accounts keys delete OLD_KEY_ID \
     --iam-account=ssd-automation-service-account@workspace-automation-ssdspc.iam.gserviceaccount.com
   ```

**Post-Rotation:**

7. Record rotation:
   ```bash
   cd security/credentials
   node credential-manager.js rotate gcp-service-account-001
   ```

8. Verify all services:
   - Run manual snapshot
   - Check backup to GCS
   - Verify local scripts work

9. Document any issues encountered

**Rollback (if needed):**

If new key fails:
1. Immediately revert GitHub Secret to old value
2. Restore old local key file
3. Investigate and fix issues
4. Retry rotation after testing

#### GCS Service Account (`gcs-service-account-001`)

**Preparation:**

1. Create new service account key in GCP Console
2. Test access to GCS bucket:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS=~/new-gcs-key.json
   gsutil ls gs://ssd-sheets-backup-immutable/
   ```

**Execution:**

3. Update GitHub Secret `GCS_SERVICE_ACCOUNT_KEY`
4. Test backup workflow manually
5. Delete old key from GCP Console

**Post-Rotation:**

6. Record rotation:
   ```bash
   node credential-manager.js rotate gcs-service-account-001
   ```

### GitHub PAT Rotation Procedure

#### GitHub Personal Access Token (`github-pat-001`)

**Preparation:**

1. Generate new PAT in GitHub:
   - Settings > Developer settings > Personal access tokens > Tokens (classic)
   - Select scopes: repo, workflow, read:org
   - Set expiration: 90 days
   - Generate token and save immediately

**Execution:**

2. Update local environment:
   ```bash
   # Update in ~/.bashrc or ~/.zshrc
   export GITHUB_TOKEN="new_token_here"
   ```

3. Test access:
   ```bash
   gh auth status
   gh repo view
   ```

4. Update any CI/CD configurations

**Post-Rotation:**

5. Record rotation:
   ```bash
   node credential-manager.js rotate github-pat-001
   ```

6. Delete old token from GitHub settings

### SSH Key Rotation Procedure

#### GitHub Deploy Key (`github-deploy-key-001`)

**Preparation:**

1. Generate new SSH key:
   ```bash
   ssh-keygen -t ed25519 -C "github-deploy-key-$(date +%Y%m%d)" \
     -f ~/.ssh/id_ed25519_github_new
   ```

**Execution:**

2. Add new public key to GitHub:
   - Repository Settings > Deploy keys
   - Add new key
   - Enable write access if needed
   - **DO NOT delete old key yet**

3. Test new key:
   ```bash
   ssh -T git@github.com -i ~/.ssh/id_ed25519_github_new
   ```

4. Update SSH config:
   ```bash
   # Edit ~/.ssh/config
   Host github.com
     IdentityFile ~/.ssh/id_ed25519_github_new
   ```

5. Test git operations:
   ```bash
   git fetch
   git pull
   ```

**Post-Rotation:**

6. Record rotation:
   ```bash
   node credential-manager.js rotate github-deploy-key-001
   ```

7. Delete old key from GitHub
8. Remove old local key files

### OAuth Client Rotation Procedure

#### Google OAuth Client (`google-oauth-client-001`)

**Preparation:**

1. Create new OAuth 2.0 Client ID in GCP Console
2. Download new `credentials.json`

**Execution:**

3. Replace old credentials file:
   ```bash
   cp ~/Downloads/credentials.json ./credentials.json
   ```

4. Delete old token:
   ```bash
   rm token.json
   ```

5. Re-authenticate:
   ```bash
   # Run any script that uses OAuth
   # Follow browser authentication flow
   ```

**Post-Rotation:**

6. Record rotation:
   ```bash
   node credential-manager.js rotate google-oauth-client-001
   ```

7. Delete old OAuth client from GCP Console

## Alerting System

### Alert Levels

- 🔴 **OVERDUE** - Rotation is past due (immediate action required)
- 🟠 **CRITICAL** - Rotation needed within 7 days
- 🟡 **WARNING** - Rotation needed within 30 days
- 🟢 **OK** - No action needed

### Notification Recipients

Configured in `credential-inventory.json` for each credential:

```json
"alerting": {
  "warningDays": 30,
  "criticalDays": 7,
  "notificationEmails": ["practice-manager@ssdspc.com"]
}
```

### Manual Alert Check

```bash
node credential-manager.js alerts
```

### Automated Monitoring

The health check script runs as part of workspace monitoring:

```bash
./check-rotation-status.sh
```

Exit codes:
- `0` - All credentials current
- `1` - Warning state
- `2` - Critical/overdue state

### Email Notifications (Future Enhancement)

Email notifications require SMTP configuration. To enable:

1. Install nodemailer: `npm install nodemailer`
2. Configure SMTP settings in environment
3. Update `credential-manager.js` to send emails

Example configuration:

```bash
export SMTP_HOST="smtp.gmail.com"
export SMTP_PORT="587"
export SMTP_USER="alerts@ssdspc.com"
export SMTP_PASS="app-specific-password"
```

## Compliance and Audit

### HIPAA Requirements

1. **Regular Rotation**
   - Service accounts accessing PHI: Annual minimum
   - API keys and tokens: Quarterly recommended
   - Document all rotations

2. **Audit Trail**
   - All rotations logged in `rotation-audit-log.json`
   - 7-year retention period
   - Includes: date, performer, reason, old/new dates

3. **Encryption**
   - All credentials encrypted at rest
   - Transmitted over secure channels only
   - Never stored in code or version control

### Audit Reports

Generate compliance reports:

```bash
node credential-manager.js audit-report > audit-$(date +%Y%m%d).txt
```

Include in annual HIPAA compliance review.

### Audit Log Structure

```json
{
  "timestamp": "2025-11-16T00:00:00.000Z",
  "credentialId": "gcp-service-account-001",
  "credentialName": "GCP Service Account",
  "action": "rotation_completed",
  "performedBy": "admin",
  "details": {
    "previousDueDate": "2025-11-16",
    "newDueDate": "2026-11-16",
    "schedule": "annual",
    "reason": "Scheduled rotation"
  }
}
```

### Retention Policy

- **Audit logs:** 7 years (HIPAA requirement)
- **Rotation history:** Indefinite (part of credential record)
- **Old credentials:** Delete immediately after successful rotation

## Troubleshooting

### Credential Manager Won't Run

**Error:** `Cannot find module`

**Solution:**
```bash
cd "Implementation Projects/google-sheets-version-control"
npm install
```

### Status Shows Incorrect Dates

**Issue:** Dates not updating after rotation

**Solution:**
1. Check `credential-inventory.json` manually
2. Verify last rotation was recorded:
   ```bash
   node credential-manager.js audit-report
   ```
3. Manually update if needed (then record in audit log)

### GitHub Actions Failing After Rotation

**Issue:** Authentication errors in workflows

**Checklist:**
1. Verify GitHub Secret updated correctly
2. Check secret name matches workflow file
3. Ensure new credential has same permissions
4. Review workflow logs for specific error
5. Test credential locally first

### Rotation Command Fails

**Error:** `Credential not found`

**Solution:**
1. List all credential IDs:
   ```bash
   node credential-manager.js status
   ```
2. Use exact ID from inventory
3. Check for typos

### Health Check Returns Exit Code 2

**Meaning:** Critical or overdue rotations exist

**Action:**
1. Run `node credential-manager.js check-rotations`
2. Identify overdue credentials
3. Schedule immediate rotation
4. Document any delays in audit log

## Integration with Workspace Health

### Adding to Health Check Script

If you have a workspace health check script:

```bash
#!/bin/bash
# workspace-health-check.sh

# ... other health checks ...

# Check credential rotation status
echo "Checking credential rotation status..."
if /path/to/check-rotation-status.sh; then
    echo "✅ Credentials: OK"
else
    echo "⚠️  Credentials: Action needed"
fi
```

### Monitoring Dashboard

Create a monitoring dashboard that includes:

```bash
# Daily health check cron job
0 9 * * * /path/to/check-rotation-status.sh | mail -s "Credential Status" admin@ssdspc.com
```

## Best Practices

1. **Plan Ahead**
   - Review rotation calendar monthly
   - Schedule rotations during maintenance windows
   - Coordinate with team

2. **Test First**
   - Always test new credentials locally
   - Verify in staging before production
   - Have rollback plan ready

3. **Document Everything**
   - Record all rotations immediately
   - Document any issues encountered
   - Update procedures if needed

4. **Security**
   - Never commit credentials to git
   - Use secure channels for sharing
   - Delete old credentials promptly

5. **Compliance**
   - Run audit reports quarterly
   - Include in HIPAA compliance reviews
   - Maintain 7-year audit trail

## Quick Reference

### Common Commands

```bash
# Check status
node credential-manager.js status

# Check upcoming rotations
node credential-manager.js check-rotations

# Record rotation
node credential-manager.js rotate <id>

# Generate audit report
node credential-manager.js audit-report

# Run health check
./check-rotation-status.sh
```

### Credential IDs

- `gcp-service-account-001` - Primary GCP service account
- `gcs-service-account-001` - GCS backup service account
- `github-pat-001` - GitHub Personal Access Token
- `github-deploy-key-001` - GitHub SSH deploy key
- `google-oauth-client-001` - Google OAuth 2.0 client

### Important Dates

Check `credential-inventory.json` for current rotation due dates.

## Support

For issues or questions:

1. Check this guide's troubleshooting section
2. Review audit log for recent changes
3. Contact Practice Manager
4. Document issue for future reference

---

**Last Updated:** 2025-11-16
**Version:** 1.0.0
**HIPAA Compliance:** Required
**Audit Retention:** 7 years

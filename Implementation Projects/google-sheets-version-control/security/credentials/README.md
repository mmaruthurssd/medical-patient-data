# Credential Rotation Tracking System

**HIPAA-Compliant Credential Management**

## Overview

This directory contains the automated credential rotation tracking and alerting system for the SSD Google Sheets Version Control project. All credentials with access to PHI or practice systems are tracked here to ensure HIPAA compliance.

## Quick Start

### Check Credential Status

```bash
npm run credentials:status
```

Or directly:

```bash
node credential-manager.js status
```

### Check Upcoming Rotations

```bash
npm run credentials:check
```

### Record a Rotation

After rotating a credential:

```bash
npm run credentials:rotate <credential-id>
```

### Generate Audit Report

```bash
npm run credentials:audit
```

## Files in This Directory

### `credential-inventory.json`

Master inventory of all tracked credentials:
- Credential details and metadata
- Rotation schedules
- Alert settings
- Compliance requirements
- Usage information

**DO NOT commit actual credentials to this file** - only metadata.

### `rotation-audit-log.json`

HIPAA-compliant audit trail:
- All rotation activities
- 7-year retention period
- Performer tracking
- Reason documentation

### `credential-manager.js`

CLI management tool with commands:
- `status` - Show all credential status
- `check-rotations` - Check upcoming rotations
- `rotate <id>` - Record credential rotation
- `audit-report` - Generate compliance report
- `alerts` - Check and display alerts

### `check-rotation-status.sh`

Health check integration script:
- Returns exit code 0 (OK), 1 (warning), or 2 (critical)
- Used by workspace health monitoring
- Automated alerting support

## Tracked Credentials

| ID | Name | Type | Rotation | Criticality |
|----|------|------|----------|-------------|
| `gcp-service-account-001` | GCP Service Account | Service Account | Annual | Critical |
| `gcs-service-account-001` | GCS Backup Service Account | Service Account | Annual | Critical |
| `github-pat-001` | GitHub Personal Access Token | PAT | Quarterly | High |
| `github-deploy-key-001` | GitHub Deploy Key | SSH Key | Annual | Medium |
| `google-oauth-client-001` | Google OAuth Client | OAuth 2.0 | Annual | Critical |

## Rotation Schedules

### Annual (365 days)
- Service accounts
- OAuth credentials
- SSH keys
- Warning: 30 days before due
- Critical: 7 days before due

### Quarterly (90 days)
- GitHub PATs
- API keys
- Warning: 14 days before due
- Critical: 3 days before due

## Using npm Scripts

All credential management commands are available as npm scripts:

```bash
# Check status of all credentials
npm run credentials:status

# Check for upcoming rotations
npm run credentials:check

# Record a rotation (requires credential ID)
npm run credentials:rotate gcp-service-account-001

# Generate HIPAA audit report
npm run credentials:audit

# Check alerts
npm run credentials:alerts
```

## HIPAA Compliance

### Requirements

1. **Regular Rotation**
   - Critical credentials: Annual minimum
   - High-priority credentials: Quarterly
   - All rotations must be documented

2. **Audit Trail**
   - All rotations logged
   - 7-year retention
   - Performer tracking
   - Reason documentation

3. **Alerting**
   - Automated warnings before due date
   - Critical alerts for overdue rotations
   - Email notifications (when configured)

### Compliance Audit

Generate compliance report:

```bash
npm run credentials:audit > compliance-report-$(date +%Y%m%d).txt
```

Include this report in annual HIPAA compliance reviews.

## Integration with Workspace Health Check

The credential rotation status is automatically checked as part of workspace health monitoring:

```bash
npm run health-check
```

This runs comprehensive checks including:
- Git repository status
- Node.js dependencies
- **Credential rotation status** ✓
- GitHub Actions configuration
- Directory structure
- Critical files
- Security configuration

## Alert Indicators

The system uses visual indicators for credential status:

- 🟢 **OK** - No action needed
- 🟡 **WARNING** - Rotation needed within 30 days (14 days for quarterly)
- 🟠 **CRITICAL** - Rotation needed within 7 days (3 days for quarterly)
- 🔴 **OVERDUE** - Rotation is past due (immediate action required)

## Security Best Practices

1. **Never Commit Credentials**
   - This directory contains only metadata
   - Actual credentials stored in `.gitignore`d files
   - GitHub Secrets for CI/CD

2. **Immediate Deletion**
   - Delete old credentials after successful rotation
   - Don't keep inactive credentials

3. **Test First**
   - Always test new credentials before deleting old ones
   - Have rollback plan ready

4. **Document Everything**
   - Record all rotations immediately
   - Document any issues encountered
   - Update procedures if needed

## Detailed Documentation

For complete procedures and troubleshooting, see:

- **[CREDENTIAL-ROTATION-GUIDE.md](../../docs/CREDENTIAL-ROTATION-GUIDE.md)** - Complete rotation procedures
- **[SECURITY.md](../../SECURITY.md)** - Security policy and requirements
- **[SERVICE-ACCOUNT.md](../../docs/SERVICE-ACCOUNT.md)** - Service account setup

## Support

For issues or questions:

1. Check `docs/CREDENTIAL-ROTATION-GUIDE.md` for procedures
2. Review audit log for recent changes
3. Contact Practice Manager
4. Document issue for future reference

---

**HIPAA Compliance:** Required
**Audit Retention:** 7 years
**Last Updated:** 2025-11-16

# SSD Automation Service Account

## Overview

The SSD Automation Service Account is a Google Cloud service account that provides long-lived authentication for automated workflows across multiple SSD workspaces and projects. Unlike OAuth tokens which expire after 1 hour, service accounts provide persistent, reliable authentication ideal for GitHub Actions, scheduled tasks, and cross-workspace automation.

## Service Account Details

**Name:** SSD Automation Service Account
**Email:** `ssd-automation-service-account@workspace-automation-ssdspc.iam.gserviceaccount.com`
**Project ID:** `workspace-automation-ssdspc`
**Google Cloud Project:** Automation at SSD SPC
**Created:** 2025-11-11
**Type:** Service Account (Server-to-Server Authentication)

## Purpose and Scope

This service account is designed for **multi-purpose** use across the SSD workspace ecosystem:

### Current Uses
1. **Google Sheets Logging** - Writes automated snapshot run logs to Daily Snapshot Log sheet
2. **GitHub Actions Authentication** - Provides authentication for automated workflows
3. **Cross-Workspace Operations** - Can be shared across multiple Google Drive folders and workspaces

### Future Uses (Planned)
- VPS server automation
- Cross-workspace file synchronization
- Automated backup and recovery workflows
- Real-time monitoring and alerting
- Multi-project coordination

## Access and Permissions

### Google Sheets Access
The service account has **Editor** permissions on:
- **Daily Snapshot Log - SSD Google Sheets**
  - Sheet ID: `1KpUhrEtW7-uHHS6GIngiXws0v2aM2wBC5ppyDBnRKxc`
  - Location: "AI Development - No PHI" shared drive
  - Purpose: Automated logging of snapshot runs

### Google Cloud API Access
Enabled APIs for this service account:
- Google Sheets API (read/write access)
- Google Drive API (file management)

### GitHub Secrets
The service account JSON key is stored as:
- **Secret Name:** `GCP_SERVICE_ACCOUNT`
- **Repository:** https://github.com/mmaruthurssd/ssd-google-sheets-staging-production
- **Location:** Settings > Secrets and variables > Actions
- **Added:** 2025-11-11T16:16:40Z

## Security

### Credential Storage
**NEVER commit the service account JSON key to git or share it publicly.**

Secure locations:
- ✅ GitHub Secrets (encrypted at rest)
- ✅ Environment variables in secure servers
- ❌ Local files in git repositories
- ❌ Unencrypted configuration files
- ❌ Shared documents or wikis

### Access Control Principle
**Least Privilege:** The service account only has access to resources explicitly shared with it. It has no project-level permissions, reducing security risk.

To grant access to a new Google Sheet:
1. Open the Google Sheet
2. Click **Share**
3. Add: `ssd-automation-service-account@workspace-automation-ssdspc.iam.gserviceaccount.com`
4. Set permission level (Editor, Viewer, etc.)
5. Uncheck "Notify people"
6. Click **Share**

## How It Works

### Authentication Flow (GitHub Actions)

```
GitHub Actions Workflow Starts
    ↓
Environment Variable: GCP_SERVICE_ACCOUNT (from GitHub Secret)
    ↓
scripts/log-snapshot-run.js reads environment variable
    ↓
google.auth.GoogleAuth initializes with service account credentials
    ↓
Google Sheets API authenticates using service account
    ↓
API request executes (write to Daily Snapshot Log)
    ↓
Success - no token expiration issues
```

### Authentication Flow (Local Development)

```
Developer runs script locally
    ↓
scripts/log-snapshot-run.js checks for GCP_SERVICE_ACCOUNT
    ↓
Not found - falls back to OAuth (~/.clasprc.json)
    ↓
google.auth.OAuth2 initializes with user credentials
    ↓
Google Sheets API authenticates using OAuth
    ↓
API request executes (manual testing)
```

## Code Implementation

The service account is implemented in `scripts/log-snapshot-run.js` with dual authentication:

```javascript
async function getAuthClient() {
  // Try service account first (for GitHub Actions)
  if (process.env.GCP_SERVICE_ACCOUNT) {
    try {
      const serviceAccountKey = JSON.parse(process.env.GCP_SERVICE_ACCOUNT);
      const auth = new google.auth.GoogleAuth({
        credentials: serviceAccountKey,
        scopes: [
          'https://www.googleapis.com/auth/spreadsheets',
          'https://www.googleapis.com/auth/drive.file'
        ]
      });
      return auth.getClient();
    } catch (error) {
      throw new Error(`Service account authentication failed: ${error.message}`);
    }
  }

  // Fall back to OAuth (for local development)
  // ... OAuth implementation
}
```

### GitHub Actions Integration

In `.github/workflows/daily-snapshots.yml`:

```yaml
- name: Log snapshot run to Google Sheet
  if: always()
  env:
    GCP_SERVICE_ACCOUNT: ${{ secrets.GCP_SERVICE_ACCOUNT }}
  run: |
    # Logging script with service account authentication
```

## Usage Examples

### Granting Access to New Sheet

When you create a new Google Sheet that needs automation:

```bash
# 1. Share the sheet with the service account
# Email to add: ssd-automation-service-account@workspace-automation-ssdspc.iam.gserviceaccount.com
# Permission: Editor (or Viewer if read-only)

# 2. Update your script to use the sheet ID
# The service account will automatically have access
```

### Using in New Projects

To use the service account in a new workspace or project:

1. **Add to GitHub Secrets** (if different repository):
   ```bash
   gh secret set GCP_SERVICE_ACCOUNT < service-account-key.json
   ```

2. **Share Google Drive resources** with the service account email

3. **Use in code** with the same authentication pattern shown above

### Testing Service Account Access

```bash
# Local test with service account (temporarily set environment variable)
export GCP_SERVICE_ACCOUNT="$(cat path/to/service-account-key.json)"
node scripts/log-snapshot-run.js SUCCESS 404 135 135 134 0 25 12345678 abc123def "Test run"
unset GCP_SERVICE_ACCOUNT
```

## Troubleshooting

### Common Issues

**Issue: "Authentication failed" error**
- Check that `GCP_SERVICE_ACCOUNT` secret exists in GitHub
- Verify the JSON format is valid (must be complete JSON object)
- Ensure Google Sheets API is enabled in Google Cloud Console

**Issue: "Permission denied" error**
- Verify the service account has been shared the target Google Sheet
- Check that permission level is correct (Editor vs Viewer)
- Confirm the sheet ID is correct

**Issue: Service account can't access Google Sheet**
- The sheet must be explicitly shared with the service account email
- Service account has no project-level permissions
- Check that the sharing email is exactly: `ssd-automation-service-account@workspace-automation-ssdspc.iam.gserviceaccount.com`

### Verification Steps

1. **Verify secret exists:**
   ```bash
   gh secret list | grep GCP_SERVICE_ACCOUNT
   ```

2. **Test authentication locally:**
   ```bash
   node scripts/log-snapshot-run.js --test
   ```

3. **Check workflow logs:**
   ```bash
   gh run view [run-id] --log | grep -A 10 "Log snapshot run"
   ```

## Related Documentation

- [Service Account Setup Guide](SERVICE-ACCOUNT-SETUP.md) - How to create the service account
- [System Architecture](SYSTEM-ARCHITECTURE.md) - Overall system design
- [Workspace Management](WORKSPACE-MANAGEMENT.md) - Central workspace documentation hub
- [GitHub Actions Workflows](../.github/workflows/daily-snapshots.yml) - Implementation

## Maintenance

### Rotation Policy
Service account keys should be rotated periodically for security:
- **Recommended:** Every 90 days
- **Process:** Create new key, update GitHub secret, delete old key
- **Next Rotation Due:** 2026-02-11 (90 days from creation)

### Audit Log
Track all service account usage in GitHub Actions logs and Google Cloud audit logs.

### Access Review
Quarterly review of:
- Which Google Sheets the service account can access
- GitHub repositories using the service account
- Active API keys

---

**Last Updated:** 2025-11-11
**Maintained By:** AI Assistant (Claude Code)
**Review Frequency:** Quarterly or when permissions change

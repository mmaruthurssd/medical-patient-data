---
type: guide
workspace: ecosystem-wide
tags: [configuration, security, credentials, environment, infrastructure]
criticality: critical
last_updated: 2025-11-16
---

# Configuration Guide - Workspace Ecosystem

**Audience:** Developers, System Administrators, DevOps
**Scope:** All three workspaces (medical-patient-data, operations-workspace, mcp-infrastructure)
**Purpose:** Central reference for all configuration locations, patterns, and security requirements

**CRITICAL:** This guide covers sensitive credentials and PHI-adjacent configurations. Follow security protocols strictly.

---

## Table of Contents

1. [Configuration Architecture](#configuration-architecture)
2. [Configuration Locations Map](#configuration-locations-map)
3. [Configuration Types & Security Levels](#configuration-types--security-levels)
4. [Service Account Configuration](#service-account-configuration)
5. [MCP Server Configuration](#mcp-server-configuration)
6. [Environment Variables](#environment-variables)
7. [Google Cloud Configuration](#google-cloud-configuration)
8. [GitHub Actions Secrets](#github-actions-secrets)
9. [Configuration Templates](#configuration-templates)
10. [Configuration Validation](#configuration-validation)
11. [Update Procedures](#update-procedures)
12. [Troubleshooting](#troubleshooting)
13. [Security Checklist](#security-checklist)

---

## Configuration Architecture

### Three-Workspace Ecosystem

```
Desktop/
├── medical-patient-data/          # Patient data workspace (PHI-adjacent)
│   ├── configuration/             # Service accounts, credentials
│   ├── .env files                 # MCP and project-specific configs
│   └── .github/workflows/         # GitHub Actions configs
├── operations-workspace/          # Operational workspace
│   └── configuration/             # Shared configs, examples
│       ├── examples/
│       ├── learning-optimizer-configs/
│       ├── security-config.json
│       └── workspace-config/
└── mcp-infrastructure/            # MCP development workspace
    ├── development/               # MCP dev instances
    └── .mcp-data/                 # MCP runtime data
```

### Configuration Flow

```
User/System
    ↓
Environment Variables (.env, shell)
    ↓
Service Account Keys (configuration/)
    ↓
Google Cloud Project (workspace-automation-ssdspc)
    ↓
APIs & Services
    ↓
Google Workspace Resources (Drive, Sheets, Docs)
```

---

## Configuration Locations Map

### Medical-Patient-Data Workspace

| Configuration Type | Location | Git Status | Security Level |
|-------------------|----------|------------|----------------|
| **Service Account Keys** | `configuration/service-accounts/` | .gitignored | CRITICAL |
| **OAuth Tokens** | `google-workspace-oauth-setup/` | .gitignored | HIGH |
| **MCP Environment** | `development/mcp-servers/*/​.env` | .gitignored | MEDIUM |
| **GitHub Secrets** | GitHub repository settings | Not in git | HIGH |
| **Workflow Configs** | `.github/workflows/*.yml` | Committed | PUBLIC |
| **Security Config** | `.gitignore` | Committed | PUBLIC |

**Key Files:**
- `configuration/service-accounts/service-account.json` - Primary service account
- `google-workspace-oauth-setup/service-account.json` - Symlink or copy
- `development/mcp-servers/google-workspace-materials-project/.env` - MCP config

### Operations-Workspace

| Configuration Type | Location | Purpose |
|-------------------|----------|---------|
| **Config Examples** | `configuration/examples/` | Templates for new projects |
| **MCP Configs** | `configuration/workspace-config/` | MCP-specific settings |
| **Security Config** | `configuration/security-config.json` | Security policies |
| **Learning Configs** | `configuration/learning-optimizer-configs/` | Domain-specific patterns |

### MCP-Infrastructure

| Configuration Type | Location | Purpose |
|-------------------|----------|---------|
| **Dev Instances** | `development/*-mcp/` | Active MCP development |
| **MCP Data** | `.mcp-data/` | Runtime state, learning data |
| **Templates** | `templates/` | MCP project templates |

### System-Wide Configuration

| Configuration Type | Location | Purpose |
|-------------------|----------|---------|
| **MCP Registration** | `~/.claude.json` | Claude Code MCP servers |
| **Shell Environment** | `~/.zshrc` or `~/.bashrc` | System-wide env vars |
| **Git Config** | `~/.gitconfig` | Git user settings |

---

## Configuration Types & Security Levels

### Level 1: Public Configuration (Committed to Git)

**Security:** Can be shared publicly, no secrets

**Examples:**
- `.github/workflows/*.yml` (workflow definitions)
- `package.json` (dependencies)
- `.gitignore` (ignore patterns)
- `tsconfig.json` (TypeScript config)
- Documentation files

**Rules:**
- ✅ Commit to git
- ✅ Share on GitHub
- ✅ Include in backups
- ⚠️ Never hardcode secrets

### Level 2: Confidential Configuration (Not Committed)

**Security:** Sensitive but not PHI, never commit

**Examples:**
- Service account keys (`.json`)
- API keys (strings)
- OAuth tokens
- Private keys (`.pem`, `.key`)
- Environment files (`.env`)

**Rules:**
- ❌ Never commit to git (in `.gitignore`)
- ✅ Store in `configuration/` directory
- ✅ Encrypt at rest (use OS keychain)
- ⚠️ Rotate regularly (90 days)

### Level 3: PHI-Adjacent Configuration (Special Handling)

**Security:** May contain PHI references, HIPAA considerations

**Examples:**
- Drive folder IDs (may reference patient folders)
- Sheet IDs (may reference patient records)
- Email addresses in configs
- Audit log configurations

**Rules:**
- ❌ Never commit to git
- ❌ Never process with Claude Code
- ✅ Store in Google Drive (under BAA)
- ✅ Log all access
- ⚠️ See SECURITY_BEST_PRACTICES.md

---

## Service Account Configuration

### Primary Service Account

**Email:** `ssd-automation-service-account@workspace-automation-ssdspc.iam.gserviceaccount.com`
**Project:** `workspace-automation-ssdspc`
**Purpose:** Primary automation identity for all Google API operations

### Key File Locations

**Primary Location:**
```bash
/Users/mmaruthurnew/Desktop/medical-patient-data/configuration/service-accounts/service-account.json
```

**Alternative Location (legacy):**
```bash
/Users/mmaruthurnew/Desktop/medical-patient-data/google-workspace-oauth-setup/service-account.json
```

**Structure:**
```json
{
  "type": "service_account",
  "project_id": "workspace-automation-ssdspc",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "ssd-automation-service-account@workspace-automation-ssdspc.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/...",
  "universe_domain": "googleapis.com"
}
```

### Usage Patterns

**Node.js/TypeScript:**
```typescript
import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH,
  scopes: ['https://www.googleapis.com/auth/drive']
});

const drive = google.drive({ version: 'v3', auth });
```

**GitHub Actions:**
```yaml
- name: Authenticate to Google Cloud
  uses: google-github-actions/auth@v2
  with:
    credentials_json: ${{ secrets.GCS_SERVICE_ACCOUNT_KEY }}
```

### Enabled APIs

| API | Status | Used By |
|-----|--------|---------|
| Google Drive API v3 | ✅ Enabled | All Drive operations |
| Google Apps Script API | ✅ Enabled | Clasp deployments |
| Cloud Storage API | ✅ Enabled | GCS backups |
| Google Docs API v1 | 🟡 Pending | Google Workspace Materials MCP |
| Google Slides API v1 | 🟡 Pending | Google Workspace Materials MCP |

**Enable New API:**
```bash
# Via console
https://console.cloud.google.com/apis/library?project=workspace-automation-ssdspc

# Or via gcloud CLI
gcloud services enable docs.googleapis.com --project=workspace-automation-ssdspc
```

### Key Rotation

**Schedule:** Annually (or immediately if compromised)

**Procedure:**
1. Go to [Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts?project=workspace-automation-ssdspc)
2. Click `ssd-automation-service-account`
3. **Keys** tab → **Add Key** → **Create new key**
4. Select **JSON** → **Create**
5. Save to `configuration/service-accounts/service-account.json`
6. Update GitHub Secrets (see [GitHub Actions Secrets](#github-actions-secrets))
7. Test all integrations
8. Delete old key from console

**Next Rotation:** Check `private_key_id` creation date + 1 year

---

## MCP Server Configuration

### MCP Registration (~/.claude.json)

**Location:** `~/.claude.json`
**Purpose:** Registers MCP servers with Claude Code
**Security:** Contains absolute paths, not secrets

**Partial Example:**
```json
{
  "numStartups": 375,
  "mcpServers": {
    "google-workspace-materials": {
      "command": "node",
      "args": [
        "/Users/mmaruthurnew/Desktop/medical-patient-data/development/mcp-servers/google-workspace-materials-project/build/index.js"
      ],
      "env": {
        "GOOGLE_SERVICE_ACCOUNT_KEY_PATH": "/Users/mmaruthurnew/Desktop/medical-patient-data/configuration/service-accounts/service-account.json"
      }
    }
  }
}
```

**Update MCP Registration:**
```bash
# Edit manually
code ~/.claude.json

# Or use MCP configuration manager
mcp__mcp-config-manager__register_mcp_server({
  serverName: "google-workspace-materials"
})
```

### MCP-Specific .env Files

**Location Pattern:** `development/mcp-servers/{mcp-name}/.env`

**Example:** `development/mcp-servers/google-workspace-materials-project/.env`

**Template Structure:**
```bash
# Google Service Account
GOOGLE_SERVICE_ACCOUNT_KEY_PATH=/Users/mmaruthurnew/Desktop/medical-patient-data/configuration/service-accounts/service-account.json

# Google Drive Folder IDs
DRIVE_ROOT_FOLDER_ID=
DRIVE_TEMPLATES_FOLDER_ID=
DRIVE_GENERATED_FOLDER_ID=
DRIVE_ARCHIVE_FOLDER_ID=

# Local Storage
LOCAL_MATERIALS_PATH=./materials
LOCAL_INDEX_PATH=./materials/print-materials-index.json

# MCP Settings
MCP_SERVER_NAME=google-workspace-materials
MCP_SERVER_VERSION=1.0.0
LOG_LEVEL=info

# Rate Limiting (optional)
# API_RATE_LIMIT_PER_MINUTE=60
```

**Rules:**
- Never commit `.env` files (in `.gitignore`)
- Always provide `.env.example` (template)
- Use absolute paths for service account keys
- Document all variables

---

## Environment Variables

### Hierarchy

**Priority (highest to lowest):**
1. Command-line environment: `VAR=value command`
2. `.env.local` (highest precedence .env)
3. `.env.{environment}` (e.g., `.env.production`)
4. `.env` (default)
5. System environment variables
6. Default values in code

### Common Variables

**Google Cloud:**
```bash
# Service Account
GOOGLE_SERVICE_ACCOUNT_KEY_PATH=/path/to/service-account.json
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json  # Alternative name

# Project
GCP_PROJECT_ID=workspace-automation-ssdspc
GOOGLE_CLOUD_PROJECT=workspace-automation-ssdspc

# Storage
GCS_BUCKET_NAME=ssd-workspace-backups-immutable
```

**Google Drive:**
```bash
# Folder IDs (get from Drive URL: /folders/FOLDER_ID)
DRIVE_ROOT_FOLDER_ID=1234567890abcdefg
DRIVE_MATERIALS_FOLDER_ID=abcdefg1234567890
```

**GitHub Actions (set in repository secrets):**
```bash
GCS_SERVICE_ACCOUNT_KEY=<service-account-json>
GCP_SERVICE_ACCOUNT=<service-account-json>
CLASP_CREDENTIALS=<service-account-json>
```

### Setting Environment Variables

**Temporary (current shell):**
```bash
export GOOGLE_SERVICE_ACCOUNT_KEY_PATH=/path/to/key.json
```

**Persistent (add to ~/.zshrc or ~/.bashrc):**
```bash
echo 'export GOOGLE_SERVICE_ACCOUNT_KEY_PATH=/path/to/key.json' >> ~/.zshrc
source ~/.zshrc
```

**Project-specific (.env file):**
```bash
# Create .env from template
cp .env.example .env

# Edit with your values
nano .env
```

**Verify:**
```bash
echo $GOOGLE_SERVICE_ACCOUNT_KEY_PATH
```

---

## Google Cloud Configuration

### Project Details

**Project ID:** `workspace-automation-ssdspc`
**Project Number:** [Check console]
**Project Name:** Workspace Automation SSDSPC
**Organization:** None (standalone project)

### Console Links

- **Dashboard:** https://console.cloud.google.com/home/dashboard?project=workspace-automation-ssdspc
- **Service Accounts:** https://console.cloud.google.com/iam-admin/serviceaccounts?project=workspace-automation-ssdspc
- **API Library:** https://console.cloud.google.com/apis/library?project=workspace-automation-ssdspc
- **API Dashboard:** https://console.cloud.google.com/apis/dashboard?project=workspace-automation-ssdspc
- **Billing:** https://console.cloud.google.com/billing?project=workspace-automation-ssdspc

### GCS Buckets

**Backup Bucket:**
```
Name: ssd-workspace-backups-immutable
Location: us-central1 (or check console)
Storage Class: Standard
Retention: 90 days (daily), permanent (monthly)
```

**Access:**
```bash
# List buckets
gsutil ls

# List contents
gsutil ls gs://ssd-workspace-backups-immutable/

# Upload file
gsutil cp file.tar.gz gs://ssd-workspace-backups-immutable/path/
```

### API Quotas

**Default Quotas:**
- Drive API: 1B queries/day, 1,000 queries/100s
- Docs API: 300 requests/day, 60 requests/min
- Slides API: 300 requests/day, 60 requests/min

**Check Current Usage:**
```bash
# Via console
https://console.cloud.google.com/apis/dashboard?project=workspace-automation-ssdspc

# Or use MCP
mcp__performance-monitor-mcp__get_metrics({
  mcpServer: "google-workspace-materials",
  startTime: "2025-11-01T00:00:00Z",
  endTime: "2025-11-16T23:59:59Z"
})
```

---

## GitHub Actions Secrets

### Required Secrets

**Medical-Patient-Data Repository:**

| Secret Name | Description | Source | Used By |
|-------------|-------------|--------|---------|
| `GCS_SERVICE_ACCOUNT_KEY` | Service account JSON for GCS uploads | service-account.json | workspace-backup-gcs.yml |
| `GCP_SERVICE_ACCOUNT` | Service account JSON for Clasp | service-account.json | google-sheets-version-control workflows |
| `CLASP_CREDENTIALS` | Service account for Apps Script | service-account.json | deploy workflows |

**All secrets contain the same service account key in JSON format.**

### Setting GitHub Secrets

**Via GitHub UI:**
1. Go to repository on GitHub
2. Settings → Secrets and variables → Actions
3. Click **New repository secret**
4. Name: `GCS_SERVICE_ACCOUNT_KEY`
5. Value: Paste entire JSON content from `service-account.json`
6. Click **Add secret**

**Via GitHub CLI:**
```bash
# Read key file and set as secret
gh secret set GCS_SERVICE_ACCOUNT_KEY < configuration/service-accounts/service-account.json

# Verify
gh secret list
```

### Using Secrets in Workflows

```yaml
jobs:
  backup:
    steps:
      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{ secrets.GCS_SERVICE_ACCOUNT_KEY }}

      - name: Use in script
        env:
          SERVICE_ACCOUNT: ${{ secrets.GCS_SERVICE_ACCOUNT_KEY }}
        run: |
          echo "$SERVICE_ACCOUNT" > /tmp/key.json
          # Use /tmp/key.json
```

### Secret Rotation

**When to rotate:**
- Annually (scheduled)
- If key compromised
- After team member departure

**Procedure:**
1. Generate new service account key (see [Service Account Configuration](#service-account-configuration))
2. Update all GitHub secrets
3. Test workflows with `workflow_dispatch`
4. Delete old key from Google Cloud Console

**Verification:**
```bash
# Trigger test workflow
gh workflow run test-drive-access.yml

# Check run status
gh run list --workflow=test-drive-access.yml
```

---

## Configuration Templates

### .env.example Template

**Location:** Create alongside every `.env` file

```bash
# Google Service Account
# Path to your service account JSON key file
GOOGLE_SERVICE_ACCOUNT_KEY_PATH=./config/google-service-account.json

# Google Cloud Project
GCP_PROJECT_ID=your-project-id

# Google Drive Folder IDs
# Get from Drive URL: /folders/FOLDER_ID
DRIVE_ROOT_FOLDER_ID=
DRIVE_TEMPLATES_FOLDER_ID=
DRIVE_GENERATED_FOLDER_ID=

# Local Paths
LOCAL_DATA_PATH=./data
LOCAL_CACHE_PATH=./cache

# MCP Settings
MCP_SERVER_NAME=your-mcp-name
MCP_SERVER_VERSION=1.0.0
LOG_LEVEL=info

# Optional Features
# Uncomment to enable
# ENABLE_FEATURE_X=true
# API_RATE_LIMIT=60
```

### package.json MCP Scripts

```json
{
  "name": "your-mcp-server",
  "version": "1.0.0",
  "scripts": {
    "build": "tsc",
    "dev": "tsx src/index.ts",
    "start": "node build/index.js",
    "test": "jest",
    "lint": "eslint src/",
    "watch": "tsc --watch"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^0.5.0",
    "googleapis": "^140.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "tsx": "^4.0.0"
  }
}
```

### GitHub Actions Workflow Template

```yaml
name: Your Workflow Name

on:
  workflow_dispatch:  # Manual trigger
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC

jobs:
  your-job:
    runs-on: ubuntu-latest

    permissions:
      contents: read

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{ secrets.GCS_SERVICE_ACCOUNT_KEY }}

      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v2
        with:
          project_id: workspace-automation-ssdspc

      - name: Your task
        run: |
          echo "Run your commands here"
```

### MCP Configuration Snippet

**For ~/.claude.json:**

```json
{
  "mcpServers": {
    "your-mcp-name": {
      "command": "node",
      "args": [
        "/absolute/path/to/your-mcp/build/index.js"
      ],
      "env": {
        "GOOGLE_SERVICE_ACCOUNT_KEY_PATH": "/absolute/path/to/service-account.json",
        "DRIVE_ROOT_FOLDER_ID": "your-folder-id",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

---

## Configuration Validation

### Pre-Commit Checks

**Automatic (via git hooks):**
- Credential scanning (detect leaked keys)
- PHI scanning (detect patient data)
- Large file detection (>10MB)
- Sensitive path check (`configuration/` directory)

**Manual Validation:**
```bash
# Scan for credentials
mcp__security-compliance-mcp__scan_for_credentials({
  target: ".",
  mode: "directory",
  exclude: ["node_modules", ".git"]
})

# Scan for PHI
mcp__security-compliance-mcp__scan_for_phi({
  target: ".",
  mode: "directory",
  sensitivity: "high"
})
```

### Configuration File Validation

**Service Account Key:**
```bash
# Check file exists
ls -la configuration/service-accounts/service-account.json

# Validate JSON syntax
jq . configuration/service-accounts/service-account.json > /dev/null

# Check required fields
jq -r '.client_email, .project_id' configuration/service-accounts/service-account.json
```

**Environment Files:**
```bash
# Check for required variables
grep -E "GOOGLE_SERVICE_ACCOUNT_KEY_PATH|GCP_PROJECT_ID" .env

# Validate no committed secrets
git ls-files | xargs grep -l "private_key"  # Should return nothing
```

**MCP Configuration:**
```bash
# Validate MCP registered
jq '.mcpServers | keys[]' ~/.claude.json

# Check MCP build exists
ls -la /path/to/mcp/build/index.js
```

### Validation Checklist

**Before First Use:**
- [ ] Service account key file exists and is valid JSON
- [ ] Service account email matches project
- [ ] Required APIs enabled in Google Cloud
- [ ] Drive folders shared with service account
- [ ] .env file created from .env.example
- [ ] MCP registered in ~/.claude.json
- [ ] GitHub secrets configured (if using Actions)

**After Configuration Change:**
- [ ] No secrets committed to git
- [ ] All paths are absolute (not relative)
- [ ] Environment variables set correctly
- [ ] Services can authenticate successfully
- [ ] Test workflows pass
- [ ] Documentation updated

---

## Update Procedures

### Updating Service Account Key

**Scenario:** Annual rotation or key compromise

1. **Generate new key:**
   ```bash
   # Via console or gcloud
   gcloud iam service-accounts keys create new-key.json \
     --iam-account=ssd-automation-service-account@workspace-automation-ssdspc.iam.gserviceaccount.com
   ```

2. **Replace local file:**
   ```bash
   mv new-key.json configuration/service-accounts/service-account.json
   ```

3. **Update GitHub secrets:**
   ```bash
   gh secret set GCS_SERVICE_ACCOUNT_KEY < configuration/service-accounts/service-account.json
   gh secret set GCP_SERVICE_ACCOUNT < configuration/service-accounts/service-account.json
   ```

4. **Test integrations:**
   ```bash
   # Test MCP
   # Trigger from Claude Code

   # Test GitHub Actions
   gh workflow run test-drive-access.yml
   ```

5. **Delete old key:**
   - Go to [Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts?project=workspace-automation-ssdspc)
   - Delete old key (after confirming new key works)

### Adding New MCP Server

1. **Create MCP project:**
   ```bash
   cd development/mcp-servers/
   mkdir new-mcp-project
   cd new-mcp-project
   npm init -y
   ```

2. **Create .env.example:**
   ```bash
   cp ../google-workspace-materials-project/.env.example .env.example
   # Edit as needed
   ```

3. **Create .env:**
   ```bash
   cp .env.example .env
   # Fill in actual values
   ```

4. **Build MCP:**
   ```bash
   npm run build
   ```

5. **Register with Claude Code:**
   ```bash
   # Edit ~/.claude.json manually or use MCP tool
   mcp__mcp-config-manager__register_mcp_server({
     serverName: "new-mcp-project"
   })
   ```

6. **Test:**
   - Restart Claude Code
   - Verify MCP loads without errors
   - Test MCP functions

### Enabling New Google API

1. **Via Console:**
   - Go to [API Library](https://console.cloud.google.com/apis/library?project=workspace-automation-ssdspc)
   - Search for API
   - Click **Enable**

2. **Via gcloud CLI:**
   ```bash
   gcloud services enable docs.googleapis.com --project=workspace-automation-ssdspc
   ```

3. **Update documentation:**
   - Add to `infrastructure/google-cloud-service-account.md`
   - Update this configuration guide

4. **Test API access:**
   ```bash
   # Test with service account
   gcloud auth activate-service-account --key-file=configuration/service-accounts/service-account.json
   # Make test API call
   ```

---

## Troubleshooting

### "Service account authentication failed"

**Symptoms:**
- `Error: invalid_grant`
- `Authentication failed`
- `Could not load credentials`

**Diagnosis:**
```bash
# Check file exists
ls -la configuration/service-accounts/service-account.json

# Validate JSON
jq . configuration/service-accounts/service-account.json

# Check permissions
stat -f%A configuration/service-accounts/service-account.json  # Should be 644 or 600
```

**Solutions:**
1. Verify file path is absolute (not relative)
2. Check JSON is valid (no trailing commas, quotes correct)
3. Ensure key not deleted in Google Cloud Console
4. Try regenerating key

### "API not enabled"

**Symptoms:**
- `API [docs.googleapis.com] not enabled`
- `Service usage must be enabled`

**Solution:**
```bash
# Enable missing API
gcloud services enable docs.googleapis.com --project=workspace-automation-ssdspc

# Or via console
https://console.cloud.google.com/apis/library?project=workspace-automation-ssdspc
```

### "Permission denied" or "Insufficient scope"

**Symptoms:**
- `Error 403: Forbidden`
- `Insufficient Permission`
- `Request had insufficient authentication scopes`

**Diagnosis:**
1. Check Drive folder is shared with service account email
2. Verify service account has Editor permission (not just Viewer)
3. Check authentication scopes include required scope

**Solution:**
```bash
# For Drive folder access:
# 1. Open folder in Google Drive
# 2. Share with: ssd-automation-service-account@workspace-automation-ssdspc.iam.gserviceaccount.com
# 3. Permission: Editor
# 4. Uncheck "Notify people"
```

### GitHub Actions secret not working

**Symptoms:**
- Workflow fails with auth error
- `credentials_json` parsing error

**Diagnosis:**
```bash
# Check secret exists
gh secret list | grep GCS_SERVICE_ACCOUNT_KEY

# Check workflow is using correct secret name
grep "secrets\." .github/workflows/your-workflow.yml
```

**Solution:**
```bash
# Re-set secret
gh secret set GCS_SERVICE_ACCOUNT_KEY < configuration/service-accounts/service-account.json

# Test workflow
gh workflow run your-workflow.yml
gh run list --workflow=your-workflow.yml
```

### Environment variable not set

**Symptoms:**
- `undefined` or empty value
- `GOOGLE_SERVICE_ACCOUNT_KEY_PATH not found`

**Diagnosis:**
```bash
# Check if variable is set
echo $GOOGLE_SERVICE_ACCOUNT_KEY_PATH

# Check .env file
cat .env | grep GOOGLE_SERVICE_ACCOUNT_KEY_PATH

# Check MCP configuration
jq '.mcpServers."your-mcp".env' ~/.claude.json
```

**Solution:**
```bash
# Set in current shell
export GOOGLE_SERVICE_ACCOUNT_KEY_PATH=/absolute/path/to/service-account.json

# Or update .env file
echo 'GOOGLE_SERVICE_ACCOUNT_KEY_PATH=/absolute/path/to/service-account.json' >> .env

# Or update ~/.claude.json
# Edit MCP env section
```

### MCP server not loading

**Symptoms:**
- MCP not visible in Claude Code
- `Failed to load MCP server`

**Diagnosis:**
```bash
# Check MCP registered
jq '.mcpServers | keys[]' ~/.claude.json | grep your-mcp

# Check build exists
ls -la /path/to/mcp/build/index.js

# Check logs
# View Claude Code logs for error messages
```

**Solution:**
1. Verify absolute paths in ~/.claude.json
2. Rebuild MCP: `npm run build`
3. Restart Claude Code
4. Check for TypeScript compilation errors

---

## Security Checklist

### Before Committing Code

- [ ] Run `git status` to review files
- [ ] Verify no `.env` files staged
- [ ] Verify no `service-account.json` staged
- [ ] Run credential scan: `mcp__security-compliance-mcp__scan_for_credentials`
- [ ] Run PHI scan: `mcp__security-compliance-mcp__scan_for_phi`
- [ ] Review diff: `git diff --staged`
- [ ] Check .gitignore covers all secrets

### Before Pushing to GitHub

- [ ] All secrets in GitHub Secrets (not in code)
- [ ] No hardcoded paths in committed files
- [ ] Workflow files tested locally
- [ ] No sensitive folder IDs in public code
- [ ] Documentation updated

### Monthly Security Review

- [ ] Check service account key age (rotate if >90 days)
- [ ] Review GitHub secrets (verify all still needed)
- [ ] Audit API usage and quotas
- [ ] Check for unauthorized Drive folder shares
- [ ] Review audit logs
- [ ] Update this configuration guide

### Configuration Security Rules

**NEVER:**
- Commit service account keys to git
- Hardcode credentials in code
- Share keys via email or Slack
- Use personal credentials for automation
- Grant unnecessary API permissions

**ALWAYS:**
- Use environment variables for credentials
- Store keys in gitignored directories
- Use absolute paths for key files
- Rotate keys annually
- Document configuration changes
- Test after configuration changes

---

## Quick Reference

### Essential File Locations

```bash
# Service account key
/Users/mmaruthurnew/Desktop/medical-patient-data/configuration/service-accounts/service-account.json

# MCP configuration
~/.claude.json

# Example .env
development/mcp-servers/google-workspace-materials-project/.env.example

# Security best practices
SECURITY_BEST_PRACTICES.md

# Google Cloud service account docs
infrastructure/google-cloud-service-account.md
```

### Common Commands

```bash
# Validate service account key
jq -r '.client_email, .project_id' configuration/service-accounts/service-account.json

# List enabled APIs
gcloud services list --enabled --project=workspace-automation-ssdspc

# Set GitHub secret
gh secret set GCS_SERVICE_ACCOUNT_KEY < configuration/service-accounts/service-account.json

# Scan for credentials
mcp__security-compliance-mcp__scan_for_credentials({ target: ".", mode: "directory" })

# Test GCS access
gsutil ls gs://ssd-workspace-backups-immutable/
```

### Important Links

- **Google Cloud Console:** https://console.cloud.google.com/?project=workspace-automation-ssdspc
- **API Library:** https://console.cloud.google.com/apis/library?project=workspace-automation-ssdspc
- **Service Accounts:** https://console.cloud.google.com/iam-admin/serviceaccounts?project=workspace-automation-ssdspc
- **GitHub Repository:** https://github.com/your-org/medical-patient-data
- **Security Guide:** SECURITY_BEST_PRACTICES.md

---

## Related Documentation

- **SECURITY_BEST_PRACTICES.md** - Security protocols and HIPAA compliance
- **infrastructure/google-cloud-service-account.md** - Service account details
- **infrastructure/google-drive-automation-workflows.md** - Drive automation patterns
- **WORKSPACE-BACKUP-ARCHITECTURE.md** - Backup configuration
- **GIT-SAFETY-CHECKLIST.md** - Git safety protocols

---

**Last Updated:** 2025-11-16
**Maintained By:** Workspace Infrastructure Team
**Review Schedule:** Monthly (or after major configuration changes)
**Next Review:** 2025-12-16

**Questions or Issues?** Update this guide or contact workspace administrators.

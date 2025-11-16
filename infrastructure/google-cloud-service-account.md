---
type: infrastructure
tags: [google-cloud, service-account, automation, infrastructure, system-component]
---

# Google Cloud Service Account - System Infrastructure

**Component Type:** Infrastructure / Automation Account
**Service Account Email:** `ssd-automation-service-account@workspace-automation-ssdspc.iam.gserviceaccount.com`
**Google Cloud Project:** `workspace-automation-ssdspc`
**Client ID (OAuth):** `101331968393537100233`
**Created:** 2024 (exact date TBD)
**Last Updated:** 2025-11-16

---

## Overview

This service account is the **primary automation identity** for all Google Workspace and Google Cloud integrations across the medical-patient-data workspace. It provides programmatic access to Google APIs without requiring interactive user authentication.

**Think of it as:** The workspace's "robot employee" that handles automated tasks 24/7.

---

## Service Account Details

### Identity
```
Email: ssd-automation-service-account@workspace-automation-ssdspc.iam.gserviceaccount.com
Project ID: workspace-automation-ssdspc
Client ID (OAuth): 101331968393537100233
Project Number: [TBD - check Google Cloud Console]
```

### OAuth Domain-Wide Delegation
```
Client ID: 101331968393537100233
Scopes: https://www.googleapis.com/auth/script.scriptapp,
        https://www.googleapis.com/auth/script.projects,
        https://www.googleapis.com/auth/drive,
        https://www.googleapis.com/auth/spreadsheets

Admin Console: https://admin.google.com/ac/owl/domainwidedelegation
```

**For complete OAuth documentation, see:**
📘 `/Users/mmaruthurnew/Desktop/operations-workspace/workspace-management/shared-docs/OAUTH-DOMAIN-WIDE-DELEGATION.md`

### Credentials Location
```
Primary Key File: /Users/mmaruthurnew/Desktop/medical-patient-data/google-workspace-oauth-setup/service-account.json
```

**Security Note:** This file contains private keys. Never commit to git (already in .gitignore).

### Key Rotation Schedule
- **Current Key Created:** [TBD - check service-account.json file]
- **Rotation Policy:** Annually
- **Next Rotation Due:** [TBD - 1 year from creation]

---

## Enabled APIs

### ✅ Currently Enabled

| API | Enabled Date | Used By | Purpose |
|-----|--------------|---------|---------|
| **Google Drive API v3** | [TBD] | Google Sheets Version Control, Google Workspace Materials MCP | File access, folder management, Drive operations |
| **Google Apps Script API** | [TBD] | Apps Script automation, Clasp workflows | Apps Script deployment and management |
| **Cloud Storage API** | [TBD] | GitHub Actions backup workflows | GCS bucket storage for backups |

### 🟡 Pending Enablement

| API | Needed For | Priority | Enable Link |
|-----|------------|----------|-------------|
| **Google Docs API v1** | Google Workspace Materials MCP | High | [Enable Docs API](https://console.cloud.google.com/apis/library/docs.googleapis.com?project=workspace-automation-ssdspc) |
| **Google Slides API v1** | Google Workspace Materials MCP | High | [Enable Slides API](https://console.cloud.google.com/apis/library/slides.googleapis.com?project=workspace-automation-ssdspc) |

### 📋 May Be Needed (Future)

| API | Potential Use Case | Status |
|-----|-------------------|--------|
| Google Sheets API v4 | Direct sheet manipulation (if needed beyond Apps Script) | Not yet needed |
| Gmail API | Email automation via communications MCP | Evaluate when deploying |
| Google Calendar API | Appointment scheduling automation | Future consideration |

---

## API Scopes & Permissions

### Google Drive API
```
Scopes:
- https://www.googleapis.com/auth/drive
- https://www.googleapis.com/auth/drive.file
- https://www.googleapis.com/auth/drive.readonly (where appropriate)

Permissions:
- Can read, write, and manage files in shared folders
- Can create folders and organize files
- Can export files to PDF
- CANNOT access user's personal Drive (only explicitly shared folders)
```

### Google Docs API (Pending)
```
Scopes (will need):
- https://www.googleapis.com/auth/documents
- https://www.googleapis.com/auth/documents.readonly

Permissions (will have):
- Create and edit Google Docs
- Read document content
- Apply formatting and styles
- Insert elements (text, tables, images)
```

### Google Slides API (Pending)
```
Scopes (will need):
- https://www.googleapis.com/auth/presentations
- https://www.googleapis.com/auth/presentations.readonly

Permissions (will have):
- Create and edit Google Slides presentations
- Read presentation content
- Add/modify slides and elements
- Apply themes and layouts
```

### Apps Script API
```
Scopes:
- https://www.googleapis.com/auth/script.projects
- https://www.googleapis.com/auth/script.deployments

Permissions:
- Deploy Apps Script projects
- Manage script files
- Create and update deployments
```

### Cloud Storage API
```
Scopes:
- https://www.googleapis.com/auth/devstorage.read_write

Permissions:
- Read and write to GCS buckets
- Manage bucket contents
- Used for automated backups
```

---

## Current Usage

### 1. Google Sheets Version Control
**Location:** `Implementation Projects/google-sheets-version-control/`

**Uses service account for:**
- Accessing Apps Script projects via Clasp
- Deploying updated code to production sheets
- Backing up sheet configurations

**Configuration:**
- GitHub Secret: `GCP_SERVICE_ACCOUNT`
- GitHub Secret: `CLASP_CREDENTIALS`
- Uses same service account key

**Reference:** `Implementation Projects/google-sheets-version-control/GITHUB-SECRETS-SETUP.md`

---

### 2. GCS Bucket Backups
**Location:** GitHub Actions workflows

**Uses service account for:**
- Automated backups to Google Cloud Storage
- Storing sheet snapshots
- Disaster recovery

**Configuration:**
- GitHub Secret: `GCS_SERVICE_ACCOUNT_KEY`
- Bucket: `medical-patient-data-backups` (verify bucket name)

**Reference:** `Implementation Projects/google-sheets-version-control/GCS-BUCKET-CREATION-STEPS.md`

---

### 3. Google Workspace Materials MCP (New)
**Location:** `development/mcp-servers/google-workspace-materials-project/`

**Uses service account for:**
- Creating and editing Google Docs
- Creating and editing Google Slides presentations
- Organizing materials in Drive folders
- Exporting to PDF

**Configuration:**
- Environment variable: `GOOGLE_SERVICE_ACCOUNT_KEY_PATH`
- Drive folders: Shared with service account (Editor permission)
- APIs needed: Drive, Docs, Slides

**Reference:** `development/mcp-servers/google-workspace-materials-project/EXISTING-ACCOUNT-SETUP.md`

---

## Security Model

### Access Control Philosophy
**Principle:** Least privilege - service account only has access to explicitly shared resources.

### What Service Account CAN Access
- ✅ Folders explicitly shared with the service account
- ✅ Apps Script projects it created or was granted access to
- ✅ GCS buckets with granted permissions
- ✅ Google Workspace files in shared folders (with Editor permission)

### What Service Account CANNOT Access
- ❌ User's personal Drive files (unless explicitly shared)
- ❌ Other Google Workspace resources without sharing
- ❌ Admin console or Workspace settings
- ❌ User email or calendar (unless specifically configured)

### Shared Drive Folders

| Folder/Resource | Shared With Service Account | Permission Level | Purpose |
|-----------------|----------------------------|------------------|---------|
| AI Print Materials/ | ✅ Yes | Editor | Google Workspace Materials MCP storage |
| [Add other shared folders as they're created] | | | |

---

## Billing & Quotas

### Google Cloud Project Billing
- **Project:** `workspace-automation-ssdspc`
- **Billing Account:** [TBD - check Google Cloud Console]
- **Current Spend:** ~$[X]/month (estimate)

### API Quotas (Default)

| API | Quota Type | Limit | Current Usage |
|-----|------------|-------|---------------|
| Drive API | Queries per day | 1,000,000,000 | Low (<1,000/day) |
| Drive API | Queries per 100 seconds per user | 1,000 | Low |
| Docs API | Requests per day | 300 | N/A (not enabled yet) |
| Docs API | Requests per minute per user | 60 | N/A |
| Slides API | Requests per day | 300 | N/A (not enabled yet) |
| Slides API | Requests per minute per user | 60 | N/A |

**Monitoring:** Check https://console.cloud.google.com/apis/dashboard?project=workspace-automation-ssdspc

---

## Authentication Methods

### Service Account Key (JSON)
**Primary method:** Using downloaded JSON key file

**How it works:**
1. Application loads JSON key file
2. Creates JWT (JSON Web Token) signed with private key
3. Exchanges JWT for access token
4. Uses access token for API requests

**Code pattern:**
```javascript
const { google } = require('googleapis');
const auth = new google.auth.GoogleAuth({
  keyFile: './path/to/service-account.json',
  scopes: ['https://www.googleapis.com/auth/drive']
});
```

**TypeScript pattern:**
```typescript
import { google } from 'googleapis';
const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH,
  scopes: ['https://www.googleapis.com/auth/drive']
});
const drive = google.drive({ version: 'v3', auth });
```

---

## Common Operations

### Enabling a New API

1. Go to Google Cloud Console: https://console.cloud.google.com/
2. Select project: `workspace-automation-ssdspc`
3. Navigate to: **APIs & Services** → **Library**
4. Search for API (e.g., "Google Docs API")
5. Click API name
6. Click **Enable**
7. Wait for confirmation (usually instant)

**Direct Links:**
- [Enable Docs API](https://console.cloud.google.com/apis/library/docs.googleapis.com?project=workspace-automation-ssdspc)
- [Enable Slides API](https://console.cloud.google.com/apis/library/slides.googleapis.com?project=workspace-automation-ssdspc)
- [API Library](https://console.cloud.google.com/apis/library?project=workspace-automation-ssdspc)

### Sharing a Drive Folder

1. Open folder in Google Drive
2. Click **Share**
3. Paste: `ssd-automation-service-account@workspace-automation-ssdspc.iam.gserviceaccount.com`
4. Set permission: **Editor** (or Viewer if read-only)
5. **Uncheck** "Notify people"
6. Click **Share**

### Checking API Usage

1. Go to: https://console.cloud.google.com/apis/dashboard?project=workspace-automation-ssdspc
2. View enabled APIs and usage metrics
3. Click individual API for detailed quota information

---

## Troubleshooting

### "Service account authentication failed"

**Possible causes:**
1. Key file path incorrect
2. Key file corrupted or invalid JSON
3. Service account deleted or disabled
4. Permissions revoked

**Fix:**
```bash
# Verify key file exists
ls -la /Users/mmaruthurnew/Desktop/medical-patient-data/google-workspace-oauth-setup/service-account.json

# Check it's valid JSON
head -n 10 /Users/mmaruthurnew/Desktop/medical-patient-data/google-workspace-oauth-setup/service-account.json

# Should see:
# {
#   "type": "service_account",
#   "project_id": "workspace-automation-ssdspc",
#   "client_email": "ssd-automation-service-account@workspace-automation-ssdspc.iam.gserviceaccount.com",
```

### "API not enabled"

**Error message:** `Google Docs API has not been used in project workspace-automation-ssdspc before or it is disabled`

**Fix:**
1. Go to: https://console.cloud.google.com/apis/library?project=workspace-automation-ssdspc
2. Search for the API mentioned in error
3. Click **Enable**

### "Insufficient Permission" or "Access Denied"

**Possible causes:**
1. Drive folder not shared with service account
2. Wrong permission level (needs Editor, has Viewer)
3. API scope not included in authentication

**Fix for Drive access:**
1. Right-click folder in Google Drive
2. Click **Share**
3. Verify service account email is listed
4. Verify permission is **Editor**

---

## Maintenance

### Annual Key Rotation

**When:** Annually (or if key compromised)

**Process:**
1. Go to: https://console.cloud.google.com/iam-admin/serviceaccounts?project=workspace-automation-ssdspc
2. Click on `ssd-automation-service-account`
3. Go to **Keys** tab
4. Click **Add Key** → **Create new key**
5. Select **JSON**
6. Click **Create** (downloads new key)
7. Replace old key file:
   ```bash
   mv ~/Downloads/workspace-automation-ssdspc-*.json \
      /Users/mmaruthurnew/Desktop/medical-patient-data/google-workspace-oauth-setup/service-account.json
   ```
8. Update GitHub Secrets:
   - `GCS_SERVICE_ACCOUNT_KEY`
   - `GCP_SERVICE_ACCOUNT`
9. Test all integrations
10. Delete old key from Google Cloud Console (after confirming new key works)

### Monitoring Usage

**Quarterly review:**
- Check API quota usage
- Review billing costs
- Audit shared folders
- Verify key expiration date
- Update this document with usage stats

---

## Emergency Procedures

### If Key is Compromised

1. **Immediately disable the key** in Google Cloud Console
2. Create new key (see Annual Key Rotation)
3. Update all services using the key
4. Review audit logs for unauthorized usage
5. Notify team

### If Service Account is Deleted

1. Recreate service account with same name
2. Re-enable all APIs
3. Re-share all Drive folders
4. Generate new key
5. Update all configurations
6. Test all integrations

---

## References

### Documentation
- **Google Service Account Docs:** https://cloud.google.com/iam/docs/service-accounts
- **Drive API Docs:** https://developers.google.com/drive/api
- **Docs API Docs:** https://developers.google.com/docs/api
- **Slides API Docs:** https://developers.google.com/slides/api

### Internal Documentation
- **Google Drive Automation Workflows:** `/infrastructure/google-drive-automation-workflows.md` ⭐ **Comprehensive workflow guide**
- **GitHub Secrets Setup:** `Implementation Projects/google-sheets-version-control/GITHUB-SECRETS-SETUP.md`
- **GCS Bucket Setup:** `Implementation Projects/google-sheets-version-control/GCS-BUCKET-CREATION-STEPS.md`
- **Google Workspace Materials MCP:** `development/mcp-servers/google-workspace-materials-project/EXISTING-ACCOUNT-SETUP.md`

### Console Links
- **Project Dashboard:** https://console.cloud.google.com/home/dashboard?project=workspace-automation-ssdspc
- **Service Accounts:** https://console.cloud.google.com/iam-admin/serviceaccounts?project=workspace-automation-ssdspc
- **API Library:** https://console.cloud.google.com/apis/library?project=workspace-automation-ssdspc
- **API Dashboard:** https://console.cloud.google.com/apis/dashboard?project=workspace-automation-ssdspc
- **Billing:** https://console.cloud.google.com/billing?project=workspace-automation-ssdspc

---

## Quick Reference

**Service Account Email:**
```
ssd-automation-service-account@workspace-automation-ssdspc.iam.gserviceaccount.com
```

**Key File Location:**
```
/Users/mmaruthurnew/Desktop/medical-patient-data/google-workspace-oauth-setup/service-account.json
```

**Enable New APIs:**
1. https://console.cloud.google.com/apis/library?project=workspace-automation-ssdspc
2. Search for API
3. Click Enable

**Share Drive Folder:**
1. Share with: `ssd-automation-service-account@workspace-automation-ssdspc.iam.gserviceaccount.com`
2. Permission: Editor
3. Uncheck "Notify people"

---

**Last Updated:** 2025-11-15
**Next Review:** 2026-01-15 (Quarterly)
**Maintained By:** Workspace automation team

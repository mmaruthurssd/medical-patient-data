# OAuth 2.0 Setup Guide

**Document:** OAuth 2.0 Setup Guide
**Project:** Google Workspace Automation Infrastructure
**Version:** 1.0
**Last Updated:** 2025-11-08
**Status:** Active

---

## Overview

This guide provides step-by-step instructions for setting up OAuth 2.0 authentication to enable programmatic access to Google Workspace APIs (Drive, Sheets, Apps Script).

### What is OAuth 2.0?

OAuth 2.0 is the industry-standard authorization framework that allows applications to securely access Google Workspace APIs on behalf of a user without sharing passwords.

**In this project, OAuth enables:**
- Automated Drive/Sheets operations via `automation@ssdsbc.com`
- Apps Script deployment via clasp CLI
- Programmatic access to 240+ Google Sheets
- HIPAA-compliant audit logging of all API calls

---

## Prerequisites

### Completed Steps
- [x] Automation account created (see [Automation Account Guide](AUTOMATION-ACCOUNT-GUIDE.md))
- [x] Automation account has Manager access to all Shared Drives
- [x] 2FA enabled on automation account

### Required Access
- [ ] Google Cloud Console access
- [ ] Google Workspace Admin Console access
- [ ] `automation@ssdsbc.com` credentials available
- [ ] Node.js installed (v16+ recommended)

---

## Architecture Overview

```
┌─────────────────────┐
│   Your Application  │
│  (Apps Script CLI,  │
│   Node.js scripts)  │
└──────────┬──────────┘
           │
           │ OAuth 2.0 Flow
           │ (credentials.json + token.json)
           │
           ▼
┌─────────────────────┐
│  Google Cloud       │
│  Project            │
│  - OAuth Client ID  │
│  - API Enablement   │
└──────────┬──────────┘
           │
           │ Authorized API Calls
           │
           ▼
┌─────────────────────┐
│  Google Workspace   │
│  - Drive API        │
│  - Sheets API       │
│  - Apps Script API  │
└─────────────────────┘
```

---

## Step 1: Create Google Cloud Project

### 1.1 Access Google Cloud Console

1. Sign in to [Google Cloud Console](https://console.cloud.google.com) as `automation@ssdsbc.com`
2. Accept Terms of Service if prompted

### 1.2 Create New Project

1. Click project dropdown (top left, next to "Google Cloud")
2. Click **New Project**
3. Configure project:
   - **Project name:** `Google Workspace Automation`
   - **Project ID:** `workspace-automation-ssdsbc` (or auto-generated)
   - **Organization:** `ssdsbc.com` (if available)
   - **Location:** No organization (default) or your domain

4. Click **Create**
5. Wait for project creation (15-30 seconds)

### 1.3 Select the Project

1. Click project dropdown
2. Select "Google Workspace Automation"
3. Verify project name appears in top navigation bar

### 1.4 Document Project Details

**Save this information:**
```
Project Name: Google Workspace Automation
Project ID: workspace-automation-ssdsbc
Project Number: [shown in project settings]
Created: 2025-11-08
Owner: automation@ssdsbc.com
Purpose: Google Workspace API access for automation
```

---

## Step 2: Enable Required APIs

### 2.1 Access API Library

1. From Cloud Console home, navigate to:
   - **Navigation Menu** (☰) > **APIs & Services** > **Library**

### 2.2 Enable Google Drive API

1. Search for: `Google Drive API`
2. Click **Google Drive API** from results
3. Click **Enable**
4. Wait for enablement (10-15 seconds)

### 2.3 Enable Google Sheets API

1. Click **Library** (top breadcrumb)
2. Search for: `Google Sheets API`
3. Click **Google Sheets API** from results
4. Click **Enable**

### 2.4 Enable Google Apps Script API

1. Click **Library**
2. Search for: `Apps Script API`
3. Click **Apps Script API** from results
4. Click **Enable**

### 2.5 Verify API Enablement

1. Navigate to: **APIs & Services** > **Dashboard**
2. Under "Enabled APIs & services," verify:
   - ✅ Google Drive API
   - ✅ Google Sheets API
   - ✅ Apps Script API

---

## Step 3: Configure OAuth Consent Screen

### 3.1 Access Consent Screen Configuration

1. Navigate to: **APIs & Services** > **OAuth consent screen**

### 3.2 Choose User Type

**Select:** Internal
- **Why:** This is a Google Workspace-only app, not public
- **Benefit:** No Google verification required
- **Limitation:** Only `ssdsbc.com` users can authorize

Click **Create**

### 3.3 Configure App Information

**OAuth consent screen:**

```
App name: Google Workspace Automation
User support email: automation@ssdsbc.com
App logo: (optional - skip for now)

Application home page: (leave blank)
Application privacy policy link: (leave blank)
Application terms of service link: (leave blank)

Authorized domains:
  ssdsbc.com

Developer contact information:
  automation@ssdsbc.com
```

Click **Save and Continue**

### 3.4 Configure Scopes

Click **Add or Remove Scopes**

**Add the following scopes:**

```
https://www.googleapis.com/auth/drive
  - See, edit, create, and delete all of your Google Drive files

https://www.googleapis.com/auth/spreadsheets
  - See, edit, create, and delete all your Google Sheets spreadsheets

https://www.googleapis.com/auth/script.projects
  - Create and update Google Apps Script projects

https://www.googleapis.com/auth/script.deployments
  - Create and manage deployments for Google Apps Script projects

https://www.googleapis.com/auth/script.scriptapp
  - Run Google Apps Script projects
```

Click **Update** then **Save and Continue**

### 3.5 Test Users (Optional for Internal Apps)

For Internal apps, all `@ssdsbc.com` users are automatically authorized.

Click **Save and Continue**

### 3.6 Review Summary

Verify all information is correct, then click **Back to Dashboard**

---

## Step 4: Create OAuth 2.0 Credentials

### 4.1 Access Credentials Page

Navigate to: **APIs & Services** > **Credentials**

### 4.2 Create OAuth Client ID

1. Click **+ Create Credentials** (top)
2. Select **OAuth client ID**

### 4.3 Configure Application Type

```
Application type: Desktop app

Name: Google Workspace Automation Desktop Client
```

Click **Create**

### 4.4 Download Credentials

1. Modal will appear: "OAuth client created"
2. Click **Download JSON**
3. Save file as: `credentials.json`
4. Store in secure location (you'll move it to your project folder next)

⚠️ **Security Warning:** This file contains sensitive credentials. Never commit to Git.

### 4.5 Secure the Credentials File

```bash
# Navigate to your project directory
cd /path/to/your/automation/project

# Move credentials.json to project root
mv ~/Downloads/credentials.json ./credentials.json

# Set strict permissions (macOS/Linux)
chmod 600 credentials.json

# Add to .gitignore immediately
echo "credentials.json" >> .gitignore
echo "token.json" >> .gitignore
echo ".env" >> .gitignore
```

---

## Step 5: Trust the App in Google Workspace Admin

⚠️ **Critical Step for Internal Apps**

### 5.1 Access Admin Console

1. Sign in to [Admin Console](https://admin.google.com) as `mm@ssdsbc.com` (Workspace Admin)

### 5.2 Navigate to App Access Control

1. Navigate to: **Security** > **API controls** > **App access control**

### 5.3 Configure Trusted Apps

1. Click **Configure new app**
2. Select **OAuth App Name Or Client ID**
3. Search for: `Google Workspace Automation` (the app name you configured)
4. Select your app from search results
5. Click **Select**

### 5.4 Set Trust Level

1. Click **Trusted**
2. Select: **Trusted: Can access all Google services**
3. Click **Configure**

This prevents "unverified app" warnings when authenticating.

---

## Step 6: Test OAuth Authentication

### 6.1 Create Test Script

Create a test file: `test-oauth.js`

```javascript
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

async function testAuth() {
  // Load credentials
  const credentials = JSON.parse(
    fs.readFileSync('credentials.json', 'utf8')
  );

  const { client_id, client_secret, redirect_uris } = credentials.installed;

  // Create OAuth2 client
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  // Check if token exists
  const tokenPath = 'token.json';
  if (fs.existsSync(tokenPath)) {
    const token = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
    oAuth2Client.setCredentials(token);
    console.log('✅ Authenticated using existing token');
  } else {
    // Generate auth URL
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/script.projects',
      ],
    });

    console.log('🔐 Authorize this app by visiting:');
    console.log(authUrl);
    console.log('\nAfter authorization, enter the code here:');

    // In production, you'd use readline or a web server
    // For now, manual code entry
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question('Enter code: ', async (code) => {
      rl.close();

      // Exchange code for token
      const { tokens } = await oAuth2Client.getToken(code);
      oAuth2Client.setCredentials(tokens);

      // Save token
      fs.writeFileSync(tokenPath, JSON.stringify(tokens));
      console.log('✅ Token saved to token.json');
      console.log('✅ Authentication successful!');

      await testAPIs(oAuth2Client);
    });
  }

  if (fs.existsSync(tokenPath)) {
    await testAPIs(oAuth2Client);
  }
}

async function testAPIs(auth) {
  console.log('\n🧪 Testing API access...\n');

  // Test Drive API
  try {
    const drive = google.drive({ version: 'v3', auth });
    const res = await drive.files.list({
      pageSize: 1,
      fields: 'files(id, name)',
    });
    console.log('✅ Drive API access confirmed');
    console.log(`   Sample file: ${res.data.files[0]?.name || 'No files found'}`);
  } catch (err) {
    console.log('❌ Drive API access failed:', err.message);
  }

  // Test Sheets API
  try {
    const sheets = google.sheets({ version: 'v4', auth });
    // Just verify we can create the client
    console.log('✅ Sheets API access confirmed');
  } catch (err) {
    console.log('❌ Sheets API access failed:', err.message);
  }

  // Test Apps Script API
  try {
    const script = google.script({ version: 'v1', auth });
    const res = await script.projects.list();
    console.log('✅ Apps Script API access confirmed');
    console.log(`   Projects found: ${res.data.projects?.length || 0}`);
  } catch (err) {
    console.log('❌ Apps Script API access failed:', err.message);
  }

  console.log('\n✅ Authentication test complete!');
}

// Run test
testAuth().catch(console.error);
```

### 6.2 Install Dependencies

```bash
npm install googleapis readline
```

### 6.3 Run Test

```bash
node test-oauth.js
```

**Expected Output:**

```
🔐 Authorize this app by visiting:
https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&scope=...

After authorization, enter the code here:
Enter code:
```

### 6.4 Complete Authorization Flow

1. Copy the URL from terminal
2. Open in browser
3. Sign in as `automation@ssdsbc.com`
4. Enter 2FA code
5. Review permissions requested
6. Click **Allow**
7. Copy authorization code from browser
8. Paste code into terminal
9. Press Enter

**Expected Output:**

```
✅ Token saved to token.json
✅ Authentication successful!

🧪 Testing API access...

✅ Drive API access confirmed
   Sample file: [some file name]
✅ Sheets API access confirmed
✅ Apps Script API access confirmed
   Projects found: [number]

✅ Authentication test complete!
```

---

## Step 7: Configure Shared Drive Access

### 7.1 Understanding Shared Drive Flags

When accessing Shared Drives (not My Drive), you must include special flags:

```javascript
// ❌ WRONG - Will return 404 errors
drive.files.list({
  pageSize: 10,
});

// ✅ CORRECT - Works with Shared Drives
drive.files.list({
  pageSize: 10,
  supportsAllDrives: true,
  includeItemsFromAllDrives: true,
  corpora: 'allDrives',
});
```

### 7.2 Test Shared Drive Access

Create `test-shared-drives.js`:

```javascript
const { google } = require('googleapis');
const fs = require('fs');

async function testSharedDrives() {
  // Load existing token
  const credentials = JSON.parse(fs.readFileSync('credentials.json', 'utf8'));
  const token = JSON.parse(fs.readFileSync('token.json', 'utf8'));

  const { client_id, client_secret, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );
  oAuth2Client.setCredentials(token);

  const drive = google.drive({ version: 'v3', auth: oAuth2Client });

  console.log('🔍 Listing Shared Drives...\n');

  // List all Shared Drives
  const drivesRes = await drive.drives.list({
    pageSize: 100,
  });

  const sharedDrives = drivesRes.data.drives || [];
  console.log(`Found ${sharedDrives.length} Shared Drives:\n`);

  for (const drive of sharedDrives) {
    console.log(`📁 ${drive.name}`);
    console.log(`   ID: ${drive.id}`);

    // List files in this Shared Drive
    try {
      const filesRes = await drive.files.list({
        driveId: drive.id,
        corpora: 'drive',
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
        pageSize: 5,
        fields: 'files(id, name, mimeType)',
      });

      const files = filesRes.data.files || [];
      console.log(`   Files: ${files.length} (showing first 5)`);
      files.forEach(f => {
        const type = f.mimeType.includes('spreadsheet') ? '📊' : '📄';
        console.log(`   ${type} ${f.name}`);
      });
      console.log('   ✅ Access confirmed\n');
    } catch (err) {
      console.log(`   ❌ Access denied: ${err.message}\n`);
    }
  }

  console.log('✅ Shared Drive test complete!');
}

testSharedDrives().catch(console.error);
```

Run test:

```bash
node test-shared-drives.js
```

**Expected Output:**

```
🔍 Listing Shared Drives...

Found 5 Shared Drives:

📁 Prior Authorization Drive
   ID: 0APX...
   Files: 47 (showing first 5)
   📊 Prior Auth Tracker 2025
   📊 Authorization Templates
   ...
   ✅ Access confirmed

📁 Patient Data Drive
   ID: 0AQY...
   Files: 89 (showing first 5)
   ...
   ✅ Access confirmed

✅ Shared Drive test complete!
```

---

## Step 8: Set Up Environment Variables

### 8.1 Create .env File

Create `.env` in project root:

```bash
# Google Cloud Project
GOOGLE_CLOUD_PROJECT=workspace-automation-ssdsbc
GOOGLE_APPLICATION_CREDENTIALS=./credentials.json

# OAuth Credentials
OAUTH_CLIENT_ID=[from credentials.json]
OAUTH_CLIENT_SECRET=[from credentials.json]
OAUTH_REDIRECT_URI=http://localhost

# Environment
NODE_ENV=development

# Gemini API (will be added in Phase 2)
# GEMINI_API_KEY=your-api-key-here
```

### 8.2 Add to .gitignore

Verify `.gitignore` contains:

```gitignore
# OAuth credentials
credentials.json
token.json

# Environment variables
.env
.env.local
.env.*.local

# Backup codes
backup-codes.txt

# Secrets
secrets/
*.key
*.pem
```

### 8.3 Load Environment Variables

Install dotenv:

```bash
npm install dotenv
```

In your scripts:

```javascript
require('dotenv').config();

const projectId = process.env.GOOGLE_CLOUD_PROJECT;
const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
```

---

## Troubleshooting

### Issue: "Access blocked: This app's request is invalid"

**Cause:** OAuth consent screen not configured correctly
**Solution:**
1. Verify app is set to **Internal** (not External)
2. Verify `ssdsbc.com` in authorized domains
3. Wait 10 minutes for propagation
4. Clear browser cookies and retry

### Issue: "This app isn't verified"

**Cause:** App not trusted in Google Workspace Admin
**Solution:**
1. Complete Step 5: Trust the app in Admin Console
2. Ensure you're using **Internal** app type (no verification needed)

### Issue: "404 Not Found" when accessing Shared Drives

**Cause:** Missing Shared Drive flags in API calls
**Solution:**
Include flags in all Shared Drive operations:
```javascript
supportsAllDrives: true
includeItemsFromAllDrives: true
corpora: 'allDrives' // or 'drive' with driveId
```

### Issue: "Insufficient Permission" errors

**Cause:** Missing OAuth scopes
**Solution:**
1. Verify all required scopes in OAuth consent screen
2. Delete `token.json`
3. Re-authenticate to get new token with all scopes
4. Verify automation account has Manager role on Shared Drives

### Issue: Token expires too quickly

**Cause:** Missing `access_type: 'offline'` in auth request
**Solution:**
Include in `generateAuthUrl()`:
```javascript
const authUrl = oAuth2Client.generateAuthUrl({
  access_type: 'offline', // Get refresh token
  scope: [...],
});
```

---

## Security Best Practices

### ✅ DO:
- Store `credentials.json` and `token.json` securely
- Add both files to `.gitignore`
- Use environment variables for project IDs
- Rotate tokens periodically
- Monitor API usage via Cloud Console
- Use least-privilege scopes
- Enable audit logging

### ❌ DON'T:
- Commit credentials to Git
- Share `credentials.json` or `token.json`
- Use root-level scopes unless necessary
- Hardcode credentials in source code
- Use External app type (use Internal for Workspace)
- Share OAuth tokens between environments

---

## HIPAA Compliance

### Audit Logging Requirements

All API operations must be logged for HIPAA compliance:

```javascript
// Example audit logging wrapper
async function auditedAPICall(operation, params) {
  const auditEntry = {
    timestamp: new Date().toISOString(),
    user: 'automation@ssdsbc.com',
    operation: operation,
    params: params,
    outcome: null,
    error: null,
  };

  try {
    const result = await operation(params);
    auditEntry.outcome = 'success';
    logToAuditTrail(auditEntry);
    return result;
  } catch (err) {
    auditEntry.outcome = 'failure';
    auditEntry.error = err.message;
    logToAuditTrail(auditEntry);
    throw err;
  }
}
```

### PHI Handling

When accessing PHI via APIs:
- Use de-identification before logging
- Restrict API access to BAA-covered services
- Encrypt data in transit (HTTPS - Google handles this)
- Monitor access patterns for anomalies

---

## Next Steps

After completing OAuth setup:

1. ✅ Mark Goal 1.3 as complete in GOALS.md
2. ➡️ Proceed to Goal 1.4: Test API Access
3. ➡️ Move to Phase 2: Gemini API Integration
4. ➡️ Refer to [Gemini Integration Guide](GEMINI-INTEGRATION-GUIDE.md)

---

## Checklist: OAuth Setup Complete

- [ ] Google Cloud Project created
- [ ] Project ID documented
- [ ] Google Drive API enabled
- [ ] Google Sheets API enabled
- [ ] Apps Script API enabled
- [ ] OAuth consent screen configured (Internal)
- [ ] Required scopes added to consent screen
- [ ] OAuth client ID created (Desktop app)
- [ ] credentials.json downloaded and secured
- [ ] credentials.json added to .gitignore
- [ ] App trusted in Google Workspace Admin Console
- [ ] Test authentication successful
- [ ] token.json generated
- [ ] Drive API access tested
- [ ] Sheets API access tested
- [ ] Apps Script API access tested
- [ ] Shared Drive access tested (no 404 errors)
- [ ] Shared Drive flags working correctly
- [ ] Environment variables configured
- [ ] .env file added to .gitignore

**Estimated Time:** 2-3 hours
**Priority:** Critical (BLOCKING)
**Dependencies:**
- Automation account created (Goal 1.1)
- Google Workspace Admin access
- `automation@ssdsbc.com` credentials

---

**Document Owner:** Marvin Maruthur
**Next Review:** After Phase 1 completion
**Related Documents:**
- [Automation Account Guide](AUTOMATION-ACCOUNT-GUIDE.md)
- [Gemini Integration Guide](GEMINI-INTEGRATION-GUIDE.md)
- [Apps Script Deployment Guide](APPS-SCRIPT-DEPLOYMENT-GUIDE.md)

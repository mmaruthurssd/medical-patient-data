# Service Account Setup for GitHub Actions

## Why Service Accounts?

OAuth tokens (from `clasp login`) expire after 1 hour, making them unsuitable for automated workflows. Service accounts provide long-lived credentials designed for server-to-server authentication.

## Setup Steps

### 1. Create a Google Cloud Project (if you don't have one)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your project ID

### 2. Enable Required APIs

1. In Cloud Console, go to **APIs & Services** > **Library**
2. Search for and enable:
   - Google Sheets API
   - Google Drive API

### 3. Create a Service Account

1. Go to **IAM & Admin** > **Service Accounts**
2. Click **Create Service Account**
3. Fill in details:
   - **Name**: `SSD Automation Service Account`
   - **Description**: `Service account for SSD Google Sheets automation and GitHub Actions workflows`
4. Click **Create and Continue**
5. Skip role assignment (click **Continue**)
6. Click **Done**

### 4. Create and Download JSON Key

1. Click on the service account you just created
2. Go to the **Keys** tab
3. Click **Add Key** > **Create new key**
4. Select **JSON** format
5. Click **Create**
6. The JSON file will download automatically
7. **IMPORTANT**: Keep this file secure - it contains credentials!

### 5. Share the Google Sheet with the Service Account

1. Open the JSON file you downloaded
2. Find the `client_email` field (looks like `ssd-automation-service-account@your-project.iam.gserviceaccount.com`)
3. Open your Daily Snapshot Log Google Sheet
4. Click **Share** button
5. Paste the service account email
6. Give it **Editor** permissions
7. **Uncheck** "Notify people"
8. Click **Share**

### 6. Add Service Account to GitHub Secrets

1. Open the JSON file in a text editor
2. Copy the entire contents (it should start with `{` and end with `}`)
3. Go to your GitHub repository
4. Go to **Settings** > **Secrets and variables** > **Actions**
5. Click **New repository secret**
6. Name: `GCP_SERVICE_ACCOUNT`
7. Value: Paste the entire JSON content
8. Click **Add secret**

### 7. Delete or Update CLASP_CREDENTIALS Secret

Since we're switching to service account auth, you can delete the old `CLASP_CREDENTIALS` secret:

1. Go to **Settings** > **Secrets and variables** > **Actions**
2. Find `CLASP_CREDENTIALS`
3. Click **Delete**

## What's Next?

After completing these steps, I'll update:
- `scripts/log-snapshot-run.js` to use service account authentication
- `.github/workflows/daily-snapshots.yml` to use the new secret

The logging will then work reliably without token expiration issues.

## Security Note

The service account JSON key contains sensitive credentials. Never commit it to git or share it publicly. It's safe to store in GitHub Secrets as they are encrypted.

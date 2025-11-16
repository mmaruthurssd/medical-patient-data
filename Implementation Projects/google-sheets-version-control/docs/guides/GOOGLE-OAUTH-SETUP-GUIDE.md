# Google Cloud OAuth Setup Guide

This guide walks you through creating OAuth credentials for full Google Workspace access.

## Step 1: Access Google Cloud Console

Visit: https://console.cloud.google.com/

## Step 2: Create or Select a Project

1. Click the project dropdown at the top of the page
2. Either:
   - **Option A:** Click "New Project"
     - Name: "SSD Google Sheets Automation" (or your preferred name)
     - Organization: Select your organization if applicable
     - Click "Create"
   - **Option B:** Select an existing project

## Step 3: Enable Required APIs

1. Go to: https://console.cloud.google.com/apis/library
2. Enable the following APIs (search for each and click "Enable"):
   - ✅ **Google Drive API**
   - ✅ **Google Sheets API**
   - ✅ **Apps Script API**

## Step 4: Configure OAuth Consent Screen

1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. Select user type:
   - **Internal** (if you have Google Workspace) - Recommended, no verification needed
   - **External** (if using personal account) - Requires verification for production
3. Click "Create"
4. Fill out the form:
   - **App name:** "SSD Sheets Version Control"
   - **User support email:** Your email
   - **Developer contact:** Your email
   - Click "Save and Continue"
5. **Scopes** page:
   - Click "Add or Remove Scopes"
   - Add these scopes:
     - `https://www.googleapis.com/auth/drive` (See, edit, create, and delete all your Google Drive files)
     - `https://www.googleapis.com/auth/spreadsheets` (See, edit, create, and delete all your Google Sheets spreadsheets)
     - `https://www.googleapis.com/auth/script.projects` (Create and update Google Apps Script projects)
   - Click "Update"
   - Click "Save and Continue"
6. **Test users** (if External):
   - Add your email address
   - Click "Save and Continue"
7. **Summary** page:
   - Review and click "Back to Dashboard"

## Step 5: Create OAuth 2.0 Credentials

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click "Create Credentials" → "OAuth client ID"
3. Application type: **Desktop app**
4. Name: "SSD Sheets CLI"
5. Click "Create"
6. **IMPORTANT:** Copy both values:
   - **Client ID:** (starts with numbers, ends with .apps.googleusercontent.com)
   - **Client Secret:** (random string)
7. Click "OK"

## Step 6: Save Credentials

You'll need to provide these two values:
- Client ID
- Client Secret

Keep them secure - they're like a password for your app.

## Next Steps

Once you have the Client ID and Client Secret, I'll update the authentication script and you can complete the OAuth flow.

# Complete OAuth Setup - Final Steps

## Current Status
- OAuth Desktop Client already created: `Google Workspace Automation Desktop Client`
- Client ID: `1009524936829-ueg6f6cnr537v0n560emcrrasj5urfcn.apps.googleusercontent.com`
- Authentication script updated and ready to use

## Step 1: Get Client Secret

You're currently viewing the OAuth client details page. To get the secret:

1. Click the **"+ Add secret"** button on that page
2. Google will generate and display a new client secret (only shown once)
3. Copy the full client secret value

## Step 2: Run Authentication

Once you have the client secret, run these commands in terminal:

```bash
cd "/Users/mmaruthurnew/Desktop/medical-patient-data/Implementation Projects/google-sheets-version-control"

# Set the client secret (replace YOUR_SECRET_HERE with actual secret)
export GOOGLE_CLIENT_SECRET="YOUR_SECRET_HERE"

# Run the authentication setup
node scripts/setup-google-auth.js
```

## Step 3: Complete OAuth Flow

1. Browser will open automatically (or you'll get a URL to visit)
2. Log in with **automation@ssdspc.com** if prompted
3. Grant all requested permissions:
   - Google Drive: Full access
   - Google Sheets: Full access
   - Apps Script: Full access
   - Shared Drives: Full access
4. You'll see "Authentication Successful!" in the browser
5. Return to terminal to see confirmation

## Step 4: Create Snapshot Log

After authentication is complete, run:

```bash
node scripts/create-snapshot-log.js
```

This will create "Daily Snapshot Log - SSD Google Sheets" in the "AI Development - no PHI" shared drive.

## What This Fixes

Previously, we were using clasp's default OAuth client which only had Apps Script API access. This caused "Insufficient Permission" errors when trying to access Drive API.

Now we're using your custom OAuth client with full Google Workspace permissions, which allows the script to:
- Create sheets
- Format and edit them
- Move them to shared drives
- Access all necessary Google Workspace APIs

## Troubleshooting

If you get "This app is blocked" error:
- Make sure you're logged in as **automation@ssdspc.com**
- The OAuth consent screen should be "Internal" (already configured)
- Your Workspace admin account should have access

If authentication fails:
- Double-check the client secret was copied correctly
- Make sure the environment variable is set in the same terminal session
- Try running `echo $GOOGLE_CLIENT_SECRET` to verify it's set

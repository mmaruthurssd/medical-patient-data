---
type: quick-reference
tags: [webhook, deployment, setup]
---

# Webhook Deployment Guide - 5 Minutes

## Prerequisites
- Google Sheets monitoring dashboard open
- Apps Script access enabled

## Step 1: Open Apps Script (1 min)

1. Open: https://docs.google.com/spreadsheets/d/1KpUhrEtW7-uHHS6GIngiXws0v2aM2wBC5ppyDBnRKxc
2. Click: **Extensions → Apps Script**
3. You'll see the Apps Script editor

## Step 2: Create Webhook Script (2 min)

1. In Apps Script editor, click **+** (Add file)
2. Choose **Script**
3. Name it: `WorkstationMonitoring`
4. Delete any default code
5. Paste the entire contents of `scripts/workstation-backup-webhook.js`
6. Click **Save** (💾 icon)

## Step 3: Run Setup Function (1 min)

1. In the function dropdown (top center), select `setupWorkstationMonitoring`
2. Click **Run** (▶️ icon)
3. First time: Click **Review permissions** → Choose your Google account → Click **Advanced** → Click **Go to [project name]** → Click **Allow**
4. You'll see a popup: "Sheet created successfully!"
5. Click **OK**

This creates the "Layer 6 - Workstation Backups" tab in your Google Sheet.

## Step 4: Deploy as Web App (1 min)

1. Click **Deploy** → **New deployment**
2. Click the gear icon ⚙️ → Select **Web app**
3. Configure:
   - **Description**: "Workstation Backup Monitoring Webhook"
   - **Execute as**: Me (your email)
   - **Who has access**: **Anyone**
4. Click **Deploy**
5. First time: Click **Authorize access** → Choose account → **Allow**

## Step 5: Copy Webhook URL (30 sec)

1. After deployment completes, you'll see: "Deployment successfully created"
2. **Copy the Web app URL** - it looks like:
   ```
   https://script.google.com/macros/s/AKfycbz.../exec
   ```
3. Click **Done**

## Step 6: Save Webhook URL for Deployment (30 sec)

Run this command on your Mac:

```bash
cd ~/Desktop/medical-patient-data/Implementation\ Projects/google-sheets-version-control/scripts
echo "YOUR_WEBHOOK_URL_HERE" > .webhook-url
chmod 600 .webhook-url
```

Replace `YOUR_WEBHOOK_URL_HERE` with the URL you copied.

## Step 7: Test the Webhook (Optional, 1 min)

1. In Apps Script editor, select function: `testWorkstationWebhook`
2. Click **Run** (▶️)
3. Check the "Layer 6 - Workstation Backups" tab in Google Sheets
4. You should see a test device entry

## Done! ✅

**You now have:**
- ✅ Webhook deployed and accessible
- ✅ "Layer 6 - Workstation Backups" sheet created
- ✅ Webhook URL saved for autonomous deployment
- ✅ Ready to run: `./deploy-team-member.sh Alvaro`

---

## Troubleshooting

### "Authorization required"
- Click "Review permissions" and grant access
- This is normal for first-time Apps Script deployment

### "Sheet already exists"
- That's fine! It means the sheet was already created
- Continue with deployment steps

### "Cannot find spreadsheet"
- Verify you're using the correct spreadsheet ID
- Check the SPREADSHEET_ID constant in the code

---

## Next Step

Once webhook is deployed and URL is saved:

```bash
./deploy-team-member.sh Alvaro
```

This will trigger the autonomous deployment!

---
type: guide
tags: [setup, google-sheets, logging, audit]
---

# Google Sheets Setup Instructions

**Purpose:** Create the central audit log Google Sheet for all communications
**Time Required:** 10-15 minutes
**Location:** AI Development - No PHI/HIPAA-Audit-Logs/

---

## Step 1: Create New Google Sheet

1. **Navigate to Google Drive:**
   - Go to https://drive.google.com
   - Navigate to Shared Drive: `AI Development - No PHI`
   - Navigate to folder: `HIPAA-Audit-Logs/`

2. **Create New Sheet:**
   - Click "New" → Google Sheets → Blank spreadsheet
   - Name: `Communications-Audit-Log`
   - Wait for sheet to load

---

## Step 2: Create Tab 1 - Communications-Log

### Rename First Tab
1. Right-click on "Sheet1" tab at bottom
2. Select "Rename"
3. Enter: `Communications-Log`

### Add Headers (Row 1)

Copy and paste this entire row into Row 1:

```
timestamp	operation_id	type	direction	status	ai_system	from	to	subject	body_preview	body_location	channel	priority	staged_by	staged_at	approved_by	approved_at	sent_at	delivered_at	error_message	cost	phi_flag	metadata
```

### Format Headers
1. Select Row 1
2. Click "Format" → "Text wrapping" → "Wrap"
3. Click "Format" → "Make bold"
4. Click "Format" → "Fill color" → Light blue
5. Click "View" → "Freeze" → "1 row"

### Set Column Widths
1. Double-click between column headers to auto-fit, or set manually:
   - A (timestamp): 150
   - B (operation_id): 150
   - C-F: 100 each
   - G-H (from/to): 200 each
   - I (subject): 200
   - J (body_preview): 300
   - K-W: 120 each

### Add Data Validation

**Column C (type):**
1. Select C2:C1000
2. Data → Data validation
3. Criteria: "List of items"
4. Items: `email,chat,sms`
5. Show dropdown: ✓
6. Save

**Column D (direction):**
1. Select D2:D1000
2. Data → Data validation
3. Items: `sent,received`

**Column E (status):**
1. Select E2:E1000
2. Data → Data validation
3. Items: `staged,approved,sent,delivered,failed`

**Column F (ai_system):**
1. Select F2:F1000
2. Data → Data validation
3. Items: `claude,gemini`

**Column M (priority):**
1. Select M2:M1000
2. Data → Data validation
3. Items: `urgent,high,normal,low`

**Column V (phi_flag):**
1. Select V2:V1000
2. Data → Data validation
3. Items: `TRUE,FALSE`

### Add Conditional Formatting

**Status Colors:**
1. Select E2:E1000
2. Format → Conditional formatting
3. Format rules:
   - Text is exactly "staged" → Yellow background
   - Text is exactly "approved" → Light green background
   - Text is exactly "sent" → Green background
   - Text is exactly "delivered" → Dark green background
   - Text is exactly "failed" → Red background

**Priority Colors:**
1. Select M2:M1000
2. Format → Conditional formatting
3. Format rules:
   - Text is exactly "urgent" → Red background
   - Text is exactly "high" → Orange background
   - Text is exactly "normal" → White background
   - Text is exactly "low" → Light gray background

---

## Step 3: Create Tab 2 - Staged-Communications

1. **Duplicate Tab:**
   - Right-click on "Communications-Log" tab
   - Select "Duplicate"
   - Rename duplicate to: `Staged-Communications`

2. **Add Additional Columns:**
   - After column W (metadata), add these columns:
   - X: `expires_at`
   - Y: `review_notes`
   - Z: `review_url`

3. **Add Filter View:**
   - Click Data → Create a filter view
   - Name: "Pending Approval"
   - Filter on column E (status): Show only "staged"
   - Save filter view

---

## Step 4: Create Tab 3 - Contacts-Log

1. **Create New Tab:**
   - Click "+" at bottom to add new sheet
   - Rename to: `Contacts-Log`

2. **Add Headers:**
```
timestamp	operation_id	operation	ai_system	contact_id	contact_name	contact_email	contact_phone	changes	user
```

3. **Format Headers:**
   - Bold, light blue background
   - Freeze row 1

4. **Data Validation:**
   - Column C (operation): `create,read,update,delete,search`
   - Column D (ai_system): `claude,gemini,manual`

---

## Step 5: Create Tab 4 - Operations-Log

1. **Create New Tab:**
   - Click "+" at bottom
   - Rename to: `Operations-Log`

2. **Add Headers:**
```
timestamp	operation_id	operation_type	operation	ai_system	status	details	error	user
```

3. **Format Headers:**
   - Bold, light blue background
   - Freeze row 1

4. **Data Validation:**
   - Column E (ai_system): `claude,gemini,manual`
   - Column F (status): `success,failed,pending`

---

## Step 6: Set Permissions

1. **Click "Share" button** (top right)

2. **Add Users:**
   - Add: `automation@ssdspc.com` → Editor
   - Add: Your email → Editor
   - Add: Team members → Viewer (or Editor as needed)

3. **Advanced Settings:**
   - Uncheck: "Viewers and commenters can see the option to download, print, and copy"
   - Click "Done"

---

## Step 7: Get Spreadsheet ID

1. **Copy URL from address bar:**
   - Example: `https://docs.google.com/spreadsheets/d/1ABC123xyz/edit#gid=0`

2. **Extract Spreadsheet ID:**
   - The ID is between `/d/` and `/edit`
   - Example: `1ABC123xyz`

3. **Save this ID** - you'll need it for configuration:
   ```
   GOOGLE_SHEETS_SPREADSHEET_ID=1ABC123xyz
   ```

---

## Step 8: Enable APIs (If Not Already Done)

1. **Go to Google Cloud Console:**
   - https://console.cloud.google.com/
   - Select project: `workspace-automation-ssdsbc`

2. **Enable Google Sheets API:**
   - APIs & Services → Library
   - Search: "Google Sheets API"
   - Click "Enable"

---

## Step 9: Test Access

1. **Verify OAuth credentials work:**
   - Your existing `token.json` should already have Sheets API scope
   - If not, you may need to regenerate token

2. **Test with a simple script:**

Create `test-sheets-access.js`:

```javascript
const { google } = require('googleapis');
const fs = require('fs');

const credentials = JSON.parse(fs.readFileSync('credentials.json'));
const token = JSON.parse(fs.readFileSync('token.json'));

const auth = new google.auth.OAuth2(
  credentials.installed.client_id,
  credentials.installed.client_secret,
  credentials.installed.redirect_uris[0]
);
auth.setCredentials(token);

const sheets = google.sheets({ version: 'v4', auth });

async function testAccess() {
  const spreadsheetId = 'YOUR_SPREADSHEET_ID_HERE';

  try {
    // Read first row
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Communications-Log!A1:W1',
    });

    console.log('✅ Access successful!');
    console.log('Headers:', response.data.values[0]);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAccess();
```

Run: `node test-sheets-access.js`

---

## Verification Checklist

After setup, verify:

- [ ] Sheet created in correct location
- [ ] 4 tabs exist (Communications-Log, Staged-Communications, Contacts-Log, Operations-Log)
- [ ] All headers present and formatted
- [ ] Data validation working (dropdown lists)
- [ ] Conditional formatting applied
- [ ] Permissions set correctly
- [ ] Spreadsheet ID saved
- [ ] Google Sheets API enabled
- [ ] OAuth access tested successfully

---

## Configuration Values to Save

**Add to `.env` or `~/.communications-config.json`:**

```bash
GOOGLE_SHEETS_LOGGING_ENABLED=true
GOOGLE_SHEETS_SPREADSHEET_ID=YOUR_SPREADSHEET_ID_HERE
GOOGLE_SHEETS_COMMUNICATIONS_LOG_SHEET=Communications-Log
GOOGLE_SHEETS_STAGED_SHEET=Staged-Communications
GOOGLE_SHEETS_CONTACTS_LOG_SHEET=Contacts-Log
GOOGLE_SHEETS_OPERATIONS_LOG_SHEET=Operations-Log
```

---

## Troubleshooting

**Can't access sheet:**
- Verify `automation@ssdspc.com` has Editor permissions
- Check OAuth token has Sheets API scope
- Verify Sheets API is enabled in Cloud Console

**Headers don't fit:**
- Adjust column widths manually
- Use "Format" → "Wrap text" for long headers

**Dropdown validation not working:**
- Ensure you selected the correct range (e.g., C2:C1000)
- Verify items are comma-separated with no spaces

---

## Next Steps

Once sheet is set up:
1. ✅ Mark Task 1 complete in workflow
2. ⏳ Proceed to implementing GoogleSheetsLogger class
3. ⏳ Test logging operations

---

**Created:** 2025-11-09
**Status:** Ready for execution
**Estimated Time:** 10-15 minutes

---
name: add-apps-script-to-sheet
description: Add auto-installing Apps Script to an existing Google Sheet
---

# Add Apps Script to Existing Sheet

**What this does:** Adds container-bound Apps Script with auto-installing triggers to an existing Google Sheet.

**Authentication:** automation@ssdspc.com (credentials.json + token.json)

**Prerequisites:**
- Have the spreadsheet ID of the existing sheet
- Sheet must be accessible by automation@ssdspc.com

**Steps:**
1. Get the spreadsheet ID from the sheet URL or FILE-INDEX

2. Create a script file or edit deploy-with-auto-trigger.js with:
   - Set EXISTING_SPREADSHEET_ID variable
   - Customize automation logic in mainFunction()

3. Run the deployment:
   ```bash
   cd ~/Desktop/medical-patient-data/google-workspace-oauth-setup
   node [your-script-name].js
   ```

4. Verify trigger installation at the printed URL

**What gets automated:**
- Container-bound Apps Script creation
- Auto-installing code upload
- onOpen trigger activation
- Time-driven trigger installation

**Reference:** workflows/google-sheets.md (section: "Add Apps Script to Existing Sheet")

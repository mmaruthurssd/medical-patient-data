---
name: create-sheet-with-apps-script
description: Create a new Google Sheet with auto-installing Apps Script and time-driven triggers
---

# Create Sheet with Auto-Installing Apps Script

**What this does:** Creates a new Google Sheet with container-bound Apps Script that auto-installs time-driven triggers via onOpen pattern. Zero manual steps required.

**Authentication:** automation@ssdspc.com (credentials.json + token.json)

**Steps:**
1. Change to OAuth setup directory:
   ```bash
   cd ~/Desktop/medical-patient-data/google-workspace-oauth-setup
   ```

2. Run the auto-installer script:
   ```bash
   node create-new-sheet-with-auto-script.js
   ```

3. Wait for completion (outputs spreadsheet ID, URL, and script ID)

4. Optionally add to FILE-INDEX for tracking

**Output includes:**
- Spreadsheet ID
- Spreadsheet URL
- Script ID
- Script URL
- Triggers URL (for verification)

**What gets automated:**
- Sheet creation
- Move to Shared Drive (AI Development - No PHI)
- Apps Script project creation
- Code deployment
- onOpen trigger activation
- Time-driven trigger installation (Daily at 3:00 AM)

**Reference:** workflows/google-sheets.md

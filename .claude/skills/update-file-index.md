---
name: update-file-index
description: Add a new entry to the FILE-INDEX Google Sheet for tracking important files
---

# Update FILE-INDEX

**What this does:** Adds a new entry to the FILE-INDEX master registry of important Google Sheets.

**FILE-INDEX ID:** 1dZHfeJJsH4MV2-7L-lNZrfNcj9M2NOraqkOWstbCFCY

**Authentication:** Service Account (service-account.json) for data operations

**Steps:**
1. Gather required information:
   - Folder name (e.g., "AI Development - No PHI")
   - Filename
   - Type (e.g., "Spreadsheet")
   - URL
   - File ID
   - Notes about the file

2. Use Sheets API to append row:
   ```javascript
   await sheets.spreadsheets.values.append({
     spreadsheetId: '1dZHfeJJsH4MV2-7L-lNZrfNcj9M2NOraqkOWstbCFCY',
     range: 'File Index!A:G',
     valueInputOption: 'USER_ENTERED',
     requestBody: {
       values: [[folder, filename, type, url, fileId, dateAdded, notes]]
     }
   });
   ```

3. Alternatively, edit and run update-file-index.js script in google-workspace-oauth-setup/

**Reference:** workflows/google-sheets.md (section: "Google Sheets File Tracking System")

# Google Workspace Automation Agent

**Agent Type:** High-Priority Daily-Use Agent
**Purpose:** Execute Google Workspace operations (Drive, Docs, Slides) efficiently from natural language commands
**Last Updated:** 2025-11-15
**Usage Frequency:** Multiple times per day

---

## Overview

### What This Agent Does

This agent translates natural language commands into Google Drive API operations without requiring you to write code each time. It handles:

- **Google Drive Operations:** Create folders, upload files, organize content, manage permissions
- **Document Management:** Export to PDF, create Docs/Slides, copy templates
- **Search & Discovery:** Find files, list drives, filter by type/date
- **Batch Operations:** Process multiple files efficiently

### Why It Exists

**Problem:** Google Drive operations require verbose API calls with specific parameters, authentication setup, and error handling. Writing this code manually for each operation is time-consuming.

**Solution:** This agent knows the Google Drive API, has pre-configured authentication context, and can execute operations from simple natural language requests.

### Time Savings Estimate

- **Manual approach:** 10-20 minutes per operation (code + debug + test)
- **Agent approach:** 30-60 seconds per operation (natural language request)
- **Average savings:** 15 minutes per operation
- **Daily usage:** 5-10 operations = **1.5-2.5 hours saved daily**

---

## When to Use This Agent

### Trigger Phrases

Start your message with these phrases to activate this agent:

**Folder Operations:**
- "Create a folder..."
- "Make a new folder..."
- "Set up a folder structure..."

**File Operations:**
- "Upload files to..."
- "Export to PDF..."
- "Copy the template..."
- "Move files from..."

**Search & Discovery:**
- "Find all files..."
- "Search Drive for..."
- "List files in..."
- "Show me what's in..."

**Permissions:**
- "Share this folder with..."
- "Grant access to..."
- "Give editor permission..."

**Batch Operations:**
- "Upload these 5 PDFs..."
- "Export all Docs in..."
- "Delete files older than..."

### Task Types

**Primary Use Cases:**
1. **Drive Operations** - Folder creation, file organization, batch uploads
2. **Document Creation** - Generate Docs/Slides from templates or markdown
3. **Export Operations** - Convert Docs/Slides to PDF at scale
4. **Permission Management** - Share folders, grant access to service account
5. **File Discovery** - Search, filter, and retrieve file metadata

### When NOT to Use This Agent

**Don't use for:**
- ❌ Reading file contents (use Read tool directly)
- ❌ Running bash commands unrelated to Google Drive
- ❌ Operations on local files only (no Drive upload needed)
- ❌ Simple file system operations (mkdir, cp, mv on local machine)
- ❌ Git operations (use git commands directly)

**Use standard tools instead for:**
- Local file operations → Bash/Read/Write tools
- Code execution → Bash tool
- File content analysis → Read + grep tools

---

## Tools Available

### Core Tools

1. **Bash** - Execute Node.js scripts for Google Drive API calls
   - Run authentication setup
   - Execute Drive operations
   - Handle API responses

2. **Read** - Check configuration files
   - Service account key validation
   - .env file reading
   - Script verification

3. **Write** - Create temporary scripts
   - Generate Node.js automation scripts
   - Create API call templates
   - Write configuration files

4. **Grep/Glob** - Search Drive contents
   - Find files by pattern
   - Filter API responses
   - Locate specific folders

### Supporting Tools

- **Edit** - Modify existing scripts
- **Environment variables** - Access .env configuration
- **Error handling** - Parse API error responses

---

## Pre-configured Context

### Service Account

**Email:**
```
ssd-automation-service-account@workspace-automation-ssdspc.iam.gserviceaccount.com
```

**Key Path:**
```
/Users/mmaruthurnew/Desktop/medical-patient-data/google-workspace-oauth-setup/service-account.json
```

**Authentication Scopes:**
- `https://www.googleapis.com/auth/drive`
- `https://www.googleapis.com/auth/drive.file`

### Shared Drive

**Name:** AI Development - No PHI
**Drive ID:** `0AFSsMrTVhqWuUk9PVA`
**Purpose:** Development resources (no patient data)

### Folder Structure

Located in: `google-workspace-materials-project/.env`

| Folder | ID | Purpose |
|--------|-----|---------|
| Root | `1NJVUyPodt_40GTIgOIk56ZZvlitOF_-j` | Print materials root |
| Templates | `1jw9D5BIhkC2bbewjPo4g_vEE2ZoC1mBl` | Document templates |
| Generated | `1ZrNdBeTiK4Qp-xNG-Hfe6NbrZqLAJgql` | AI-generated content |
| Archive | `106bQbmDqjapqyaDlo74xkO3BUDgsSj2l` | Old/unused files |
| Config | `1I1QdqOLSWe-f-MdrE1GZ4h9fn88hpB9d` | Configuration files |

### Project Location

**MCP Server:**
```
/Users/mmaruthurnew/Desktop/medical-patient-data/development/mcp-servers/google-workspace-materials-project
```

**Documentation:**
```
/Users/mmaruthurnew/Desktop/medical-patient-data/infrastructure/google-drive-automation-workflows.md
```

---

## Common Operations

### The 12 Core Workflows

Referenced from `google-drive-automation-workflows.md`:

| # | Workflow | Description | Typical Time |
|---|----------|-------------|--------------|
| 1 | **Create Folder Structure** | Create folders with hierarchy | 10-15s |
| 2 | **Search for Files** | Find files by name, type, or location | 5-10s |
| 3 | **Upload Files** | Upload local files or create Docs/Slides | 15-30s |
| 4 | **Export to PDF** | Convert Docs/Slides to PDF | 20-40s |
| 5 | **Share Folders** | Grant permissions to users | 10-15s |
| 6 | **List Shared Drives** | Discover accessible drives | 5-10s |
| 7 | **Copy Files** | Duplicate files or templates | 10-15s |
| 8 | **Rename Files** | Update file names | 5-10s |
| 9 | **Move Files** | Relocate files between folders | 10-15s |
| 10 | **Delete Files** | Remove files (or archive) | 5-10s |
| 11 | **List Files** | Get folder contents | 5-10s |
| 12 | **Get Metadata** | Retrieve file details | 5-10s |

### Workflow Details

#### 1. Create Folder Structure
- Creates nested folder hierarchies
- Sets permissions automatically
- Returns folder IDs and web links

#### 2. Search for Files
- Query by name (contains, exact match)
- Filter by mimeType (folders, PDFs, Docs, Slides)
- Filter by parent folder
- Filter by date modified/created

#### 3. Upload Files
- Upload from local path
- Create Google Docs from markdown
- Create Google Slides from templates
- Batch upload multiple files

#### 4. Export to PDF
- Export Docs to PDF
- Export Slides to PDF (presentation format)
- Download PDF locally (optional)
- Save PDF to specific Drive folder

#### 5. Share Folders
- Grant viewer/commenter/editor/owner permissions
- Share with individual users or groups
- Share with service account for automation
- Bulk permission updates

#### 6. List Shared Drives
- Discover all accessible shared drives
- Get drive IDs for operations
- Check service account access

#### 7. Copy Files
- Duplicate templates
- Copy files to different folders
- Rename during copy

#### 8. Rename Files
- Update file names
- Preserve file ID and permissions

#### 9. Move Files
- Move between folders
- Move to/from shared drives
- Batch move operations

#### 10. Delete Files
- Soft delete (move to trash)
- Permanent delete
- Archive pattern (move to archive folder)

#### 11. List Files
- List folder contents
- Recursive folder listing
- Filter by file type

#### 12. Get Metadata
- Retrieve file/folder details
- Get creation/modification dates
- Check permissions and sharing

---

## Example Prompts

### Folder Management

**Example 1: Create Project Folder**
```
Create a folder called 'November Patient Materials' in the Generated folder
```
**Expected:** Creates folder in Generated folder, returns folder ID and web link

**Example 2: Create Nested Structure**
```
Create a folder structure: 'Q4 2025' > 'Cardiology' > 'Patient Handouts'
```
**Expected:** Creates 3 nested folders, returns all IDs

**Example 3: Share Folder**
```
Share the 'AI Print Materials' folder with john@example.com as Editor
```
**Expected:** Grants editor permission, confirms sharing

### File Upload

**Example 4: Upload PDFs**
```
Upload these 5 PDFs to the Templates folder:
- diabetes-handout.pdf
- heart-health-guide.pdf
- medication-instructions.pdf
- discharge-checklist.pdf
- consent-form.pdf
```
**Expected:** Batch uploads all files, returns file IDs and links

**Example 5: Create Google Doc**
```
Create a Google Doc from patient-intake-template.md and save to Templates folder
```
**Expected:** Converts markdown to Google Doc, uploads to Templates

### Export Operations

**Example 6: Export to PDF**
```
Export the 'Patient Intake Form' doc to PDF
```
**Expected:** Exports Doc to PDF, saves to same folder, returns PDF link

**Example 7: Batch Export**
```
Export all Google Docs in the Templates folder to PDF
```
**Expected:** Finds all Docs, exports each to PDF, returns list of PDF links

### Search & Discovery

**Example 8: Search Files**
```
Search Drive for all PDFs with 'diabetes' in the name
```
**Expected:** Returns list of matching files with IDs and links

**Example 9: List Recent Files**
```
List all files in the Archive folder modified in the last 30 days
```
**Expected:** Returns filtered file list with modification dates

**Example 10: Get File Metadata**
```
Get metadata for the most recent presentation in Templates
```
**Expected:** Returns file details, creation date, size, permissions

### File Organization

**Example 11: Copy Template**
```
Copy the template document 'Diabetes Patient Handout' and rename it to 'New Patient Handout - November 2025'
```
**Expected:** Creates copy with new name, returns new file ID

**Example 12: Move Files**
```
Move all files from Generated to Archive
```
**Expected:** Batch moves all files, confirms count

**Example 13: Bulk Delete**
```
Delete files older than 90 days from the Archive folder
```
**Expected:** Filters by date, deletes matching files, reports count

### Advanced Operations

**Example 14: Template + Upload Pattern**
```
Create 10 patient handouts from the diabetes template, one for each patient ID: P001, P002, ..., P010
```
**Expected:** Copies template 10 times, renames each, returns file list

**Example 15: Batch Export + Download**
```
Export all Slides in the Templates folder to PDF and download them locally to ./exported-pdfs/
```
**Expected:** Exports all presentations, downloads PDFs, confirms local paths

---

## Expected Outputs

### Folder Operations
```json
{
  "folderId": "1abc123xyz",
  "folderName": "November Patient Materials",
  "webViewLink": "https://drive.google.com/drive/folders/1abc123xyz",
  "parentId": "1ZrNdBeTiK4Qp-xNG-Hfe6NbrZqLAJgql",
  "success": true
}
```

### File Upload
```json
{
  "fileId": "1def456uvw",
  "fileName": "diabetes-handout.pdf",
  "webViewLink": "https://drive.google.com/file/d/1def456uvw/view",
  "mimeType": "application/pdf",
  "size": "1.2 MB",
  "success": true
}
```

### Export to PDF
```json
{
  "sourceFileId": "1doc123abc",
  "pdfFileId": "1pdf789xyz",
  "pdfFileName": "Patient Intake Form.pdf",
  "pdfWebViewLink": "https://drive.google.com/file/d/1pdf789xyz/view",
  "localPath": "./exported-pdfs/patient-intake-form.pdf",
  "success": true
}
```

### Search Results
```json
{
  "results": [
    {
      "id": "1abc123",
      "name": "Diabetes Management Guide.pdf",
      "mimeType": "application/pdf",
      "modifiedTime": "2025-11-10T14:30:00Z",
      "size": "850 KB",
      "webViewLink": "https://drive.google.com/file/d/1abc123/view"
    }
  ],
  "count": 1,
  "success": true
}
```

### Error Response
```json
{
  "success": false,
  "error": "File not found",
  "details": "The specified file ID does not exist or service account lacks permission",
  "recoveryAction": "Verify file ID and ensure service account has access"
}
```

---

## Best Practices

### 1. Always Verify Folder IDs Before Operations
```typescript
// Good: Verify folder exists
const folder = await drive.files.get({ fileId: folderId });
await uploadFile(filePath, folder.data.id);

// Bad: Assume folder exists
await uploadFile(filePath, 'hardcoded-id');
```

### 2. Use supportsAllDrives for Shared Drive Operations
```typescript
// Required for shared drives
await drive.files.create({
  requestBody: { ... },
  supportsAllDrives: true  // ✅ Always include
});
```

### 3. Handle Rate Limiting with Exponential Backoff
```typescript
async function retryWithBackoff(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.code === 429 && i < maxRetries - 1) {
        await sleep(Math.pow(2, i) * 1000);  // 1s, 2s, 4s
        continue;
      }
      throw error;
    }
  }
}
```

### 4. Verify Service Account Permissions Before Sharing
```typescript
// Check if service account can access folder
async function checkAccess(folderId: string) {
  try {
    await drive.files.get({
      fileId: folderId,
      supportsAllDrives: true,
      fields: 'id,name,permissions'
    });
    return true;
  } catch (error) {
    return false;
  }
}
```

### 5. Use Batch Operations for Multiple Files
```typescript
// Good: Batch export
const files = await listFiles(folderId);
const exports = await Promise.all(
  files.map(file => exportToPdf(file.id))
);

// Bad: Sequential operations
for (const file of files) {
  await exportToPdf(file.id);  // Slow
}
```

### 6. Include Error Context in Responses
```typescript
try {
  await uploadFile(path, folderId);
} catch (error) {
  return {
    success: false,
    error: error.message,
    context: { path, folderId },
    recoveryAction: 'Check file path and folder permissions'
  };
}
```

### 7. Return Useful IDs and Links
```typescript
// Always return:
return {
  success: true,
  fileId: '1abc123',           // For future operations
  webViewLink: 'https://...',  // For user access
  fileName: 'document.pdf',    // For confirmation
  parentId: '1parent123'       // For context
};
```

### 8. Use Descriptive Error Messages
```typescript
// Good: Actionable error
throw new Error('Service account lacks access to folder 1abc123. Share folder with ssd-automation-service-account@... as Editor.');

// Bad: Generic error
throw new Error('Permission denied');
```

---

## Error Handling Patterns

### Common Errors from google-drive-automation-workflows.md

#### 1. Permission Denied (403)
**Error:**
```
Error: The user does not have sufficient permissions for file '1abc123'
```

**Cause:** Service account doesn't have access to the file/folder

**Recovery:**
1. Share the file/folder with service account email
2. Grant at least "Viewer" permission (or "Editor" for modifications)
3. Wait 1-2 minutes for permissions to propagate
4. Retry operation

**Code Pattern:**
```typescript
try {
  await drive.files.get({ fileId });
} catch (error) {
  if (error.code === 403) {
    console.log(`Share folder ${fileId} with ${SERVICE_ACCOUNT_EMAIL}`);
    return { success: false, requiresSharing: true };
  }
}
```

#### 2. File Not Found (404)
**Error:**
```
Error: File not found: '1abc123'
```

**Cause:** File ID doesn't exist or was deleted

**Recovery:**
1. Verify file ID is correct
2. Search for file by name to get correct ID
3. Check if file was moved to trash

**Code Pattern:**
```typescript
try {
  await drive.files.get({ fileId });
} catch (error) {
  if (error.code === 404) {
    // Search for file by name
    const results = await searchFiles(fileName);
    if (results.length > 0) {
      return { success: false, suggestedId: results[0].id };
    }
  }
}
```

#### 3. Rate Limit Exceeded (429)
**Error:**
```
Error: Rate Limit Exceeded
```

**Cause:** Too many API calls in short time

**Recovery:**
1. Implement exponential backoff
2. Reduce batch size
3. Add delays between operations

**Code Pattern:**
```typescript
async function callWithRetry(fn, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.code === 429 && i < retries - 1) {
        await sleep(Math.pow(2, i) * 1000);
      } else {
        throw error;
      }
    }
  }
}
```

#### 4. Invalid MimeType
**Error:**
```
Error: Export only supports Docs Editors files
```

**Cause:** Trying to export non-Google file (e.g., PDF, image) to PDF

**Recovery:**
1. Check file mimeType before export
2. Only export: Docs, Sheets, Slides, Drawings

**Code Pattern:**
```typescript
const exportableMimeTypes = [
  'application/vnd.google-apps.document',
  'application/vnd.google-apps.spreadsheet',
  'application/vnd.google-apps.presentation'
];

if (!exportableMimeTypes.includes(file.mimeType)) {
  return { success: false, error: 'File is already PDF or not exportable' };
}
```

#### 5. Shared Drive Not Found
**Error:**
```
Error: Shared drive not found
```

**Cause:** Service account doesn't have access to shared drive

**Recovery:**
1. List accessible shared drives: `drive.drives.list()`
2. Share drive with service account
3. Use correct drive ID in operations

**Code Pattern:**
```typescript
const drives = await drive.drives.list();
const targetDrive = drives.data.drives.find(d => d.name === 'AI Development - No PHI');

if (!targetDrive) {
  return {
    success: false,
    error: 'Shared drive not accessible',
    availableDrives: drives.data.drives.map(d => d.name)
  };
}
```

#### 6. Invalid Parent Folder
**Error:**
```
Error: The parents field includes at least one invalid item
```

**Cause:** Parent folder ID doesn't exist or isn't accessible

**Recovery:**
1. Verify parent folder ID
2. Check service account has access to parent
3. Use shared drive root if needed

#### 7. Quota Exceeded
**Error:**
```
Error: The user's Drive storage quota has been exceeded
```

**Cause:** Drive storage full

**Recovery:**
1. Delete old files
2. Move large files to archive
3. Request storage increase

---

## Usage Statistics

**To be updated over time:**

### Times Used
- Week 1: [Track this]
- Week 2: [Track this]
- Total: [Track this]

### Average Execution Time
- Folder creation: [Track this]
- File upload: [Track this]
- PDF export: [Track this]
- Search operations: [Track this]

### Common Failure Modes
1. [Track this] - Permission errors (% of failures)
2. [Track this] - Invalid file IDs (% of failures)
3. [Track this] - Rate limiting (% of failures)
4. [Track this] - Network errors (% of failures)

### Most Used Operations
1. [Track this] - Operation name (count)
2. [Track this] - Operation name (count)
3. [Track this] - Operation name (count)

### Success Rate
- Overall: [Track this]%
- By operation type: [Track this]

---

## Quick Reference

### Essential MimeTypes
```typescript
const MIME_TYPES = {
  folder: 'application/vnd.google-apps.folder',
  doc: 'application/vnd.google-apps.document',
  sheet: 'application/vnd.google-apps.spreadsheet',
  slide: 'application/vnd.google-apps.presentation',
  pdf: 'application/pdf',
  markdown: 'text/markdown'
};
```

### Essential API Fields
```typescript
const COMMON_FIELDS = 'id,name,mimeType,parents,webViewLink,modifiedTime,createdTime,size';
```

### Service Account Email
```
ssd-automation-service-account@workspace-automation-ssdspc.iam.gserviceaccount.com
```

### Shared Drive ID
```
0AFSsMrTVhqWuUk9PVA
```

### Key Folder IDs (from .env)
```typescript
const FOLDERS = {
  root: '1NJVUyPodt_40GTIgOIk56ZZvlitOF_-j',
  templates: '1jw9D5BIhkC2bbewjPo4g_vEE2ZoC1mBl',
  generated: '1ZrNdBeTiK4Qp-xNG-Hfe6NbrZqLAJgql',
  archive: '106bQbmDqjapqyaDlo74xkO3BUDgsSj2l',
  config: '1I1QdqOLSWe-f-MdrE1GZ4h9fn88hpB9d'
};
```

---

## Agent Activation Checklist

When this agent is invoked:

- [ ] Parse natural language request
- [ ] Identify which workflow(s) to use (1-12)
- [ ] Load service account credentials
- [ ] Verify folder IDs if specified
- [ ] Check for batch vs single operation
- [ ] Execute operation with error handling
- [ ] Return structured response with IDs and links
- [ ] Log operation for statistics tracking

---

## Response Template

Every agent response should follow this format:

```markdown
## Operation: [Operation Name]

**Status:** ✅ Success / ❌ Failed

**Details:**
- File/Folder ID: `1abc123xyz`
- Web Link: https://drive.google.com/...
- Operation Time: 15 seconds

**Files Processed:** 5

**Results:**
1. diabetes-handout.pdf → ID: 1abc123 → https://...
2. heart-health.pdf → ID: 1def456 → https://...
...

**Next Steps:**
- You can access the files at the links above
- To export these to PDF, run: "Export files 1abc123, 1def456 to PDF"
```

---

## Related Documentation

- **Google Drive Automation Workflows:** `/Users/mmaruthurnew/Desktop/medical-patient-data/infrastructure/google-drive-automation-workflows.md`
- **MCP Server:** `/Users/mmaruthurnew/Desktop/medical-patient-data/development/mcp-servers/google-workspace-materials-project`
- **Service Account Setup:** `/Users/mmaruthurnew/Desktop/medical-patient-data/google-workspace-oauth-setup/`

---

## Version History

- **v1.0** (2025-11-15) - Initial agent specification created
  - Defined 12 core workflows
  - Added 15 example prompts
  - Documented error handling patterns
  - Established best practices

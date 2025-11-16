---
type: reference
tags: [google-workspace, quick-reference, cheat-sheet, operations, capabilities]
---

# Google Workspace Quick Reference Cheat Sheet

**Purpose:** Single-page reference for ALL Google Workspace operations the AI can perform.

**Last Updated:** 2025-11-15

---

## 1. Google Drive Operations

### Core Drive Operations (Available Now)

| Operation | Required Parameters | Use Case | Execution Time | Code Reference |
|-----------|-------------------|----------|----------------|----------------|
| **Create Folder** | `name`, `parentFolderId?` | Organize files in Drive | ~1-2 sec | `DriveClient.createFolder()` |
| **Upload File** | `filePath`, `name`, `folderId?` | Upload local files to Drive | ~2-5 sec | `DriveClient.uploadFile()` |
| **Download File** | `fileId`, `outputPath` | Download Drive files locally | ~2-5 sec | `DriveClient.downloadFile()` |
| **Update File** | `fileId`, `filePath`, `metadata?` | Replace existing file content | ~2-4 sec | `DriveClient.updateFile()` |
| **List Files** | `folderId?`, `query?` | List files in folder or by query | ~1-3 sec | `DriveClient.listFiles()` |
| **Get File Metadata** | `fileId` | Get file name, size, dates, MIME type | ~1 sec | `DriveClient.getFileMetadata()` |
| **Search Files** | `searchQuery` | Full-text search across Drive | ~2-4 sec | `DriveClient.searchFiles()` |
| **Export to PDF** | `fileId`, `filename`, `outputFolderId?` | Export Docs/Slides to PDF | ~3-6 sec | `exportToPdf()` tool |

### Missing Drive Operations (Proposed)

| Operation | Required Parameters | Use Case | Execution Time | Implementation |
|-----------|-------------------|----------|----------------|----------------|
| **Copy File** | `fileId`, `name`, `folderId?` | Duplicate files in Drive | ~2-3 sec | Add `DriveClient.copyFile()` |
| **Rename File/Folder** | `fileId`, `newName` | Rename without moving | ~1-2 sec | Add `DriveClient.rename()` |
| **Move File** | `fileId`, `newParentFolderId` | Move file to different folder | ~2-3 sec | Add `DriveClient.moveFile()` |
| **Delete/Trash File** | `fileId`, `permanent?` | Remove files (trash or permanent) | ~1-2 sec | Add `DriveClient.deleteFile()` |
| **Share Folder** | `folderId`, `email`, `role` | Grant permissions to users | ~2-3 sec | Add `DriveClient.shareFolder()` |
| **List Shared Drives** | None | List all shared/team drives | ~1-2 sec | Add `DriveClient.listSharedDrives()` |
| **Get Folder Hierarchy** | `folderId` | Get parent folder chain | ~1-2 sec | Add `DriveClient.getFolderPath()` |

---

## 2. Google Docs Operations

### Current Docs Operations (Available Now)

| Operation | Required Parameters | Use Case | Execution Time | Code Reference |
|-----------|-------------------|----------|----------------|----------------|
| **Create from Markdown** | `description`, `requirements?`, `tokens?` | Generate print materials from prompts | ~5-10 sec | `create_from_prompt` tool |
| **Update Index** | `action`, `data`, `materialId?` | Track documents in index | ~2-3 sec | `update_index` tool |
| **Query Index** | `filters?`, `sortBy?`, `limit?` | Search indexed materials | ~1-2 sec | `query_index` tool |

### Missing Docs Operations (Proposed)

| Operation | Required Parameters | Use Case | Execution Time | Implementation |
|-----------|-------------------|----------|----------------|----------------|
| **Create Empty Doc** | `title`, `folderId?` | Create blank Google Doc | ~2-3 sec | Use Google Docs API `documents.create()` |
| **Append Content** | `docId`, `text/markdown` | Add content to existing doc | ~2-4 sec | Use Docs API `batchUpdate()` |
| **Replace Text** | `docId`, `findText`, `replaceText` | Find and replace in doc | ~2-3 sec | Use Docs API `batchUpdate()` with replace |
| **Insert Table** | `docId`, `rows`, `cols`, `location?` | Add tables to doc | ~3-5 sec | Use Docs API `batchUpdate()` with table |
| **Format Document** | `docId`, `formatRules` | Apply formatting (headers, bold, lists) | ~2-4 sec | Use Docs API `batchUpdate()` with styles |
| **Get Doc Content** | `docId` | Read document text/structure | ~2-3 sec | Use Docs API `documents.get()` |
| **Export Doc** | `docId`, `format` | Export as PDF/markdown/DOCX | ~2-5 sec | Use Drive API `files.export()` |

---

## 3. Google Slides Operations

### Current Slides Operations (Available Now)

| Operation | Required Parameters | Use Case | Execution Time | Code Reference |
|-----------|-------------------|----------|----------------|----------------|
| **Export to PDF** | `fileId`, `filename` | Convert presentation to PDF | ~3-6 sec | `exportToPdf()` tool |

### Missing Slides Operations (Proposed)

| Operation | Required Parameters | Use Case | Execution Time | Implementation |
|-----------|-------------------|----------|----------------|----------------|
| **Create from Markdown** | `markdown`, `title`, `folderId?` | Generate slides from markdown | ~5-10 sec | Parse markdown → Slides API `presentations.create()` |
| **Create Empty Presentation** | `title`, `folderId?` | Create blank presentation | ~2-3 sec | Use Slides API `presentations.create()` |
| **Add Slide** | `presentationId`, `layout?` | Add new slide to presentation | ~2-3 sec | Use Slides API `batchUpdate()` |
| **Update Slide Text** | `presentationId`, `slideId`, `text` | Replace text on slide | ~2-3 sec | Use Slides API `batchUpdate()` with replace |
| **Insert Image** | `presentationId`, `slideId`, `imageUrl` | Add image to slide | ~3-5 sec | Use Slides API `batchUpdate()` with image |
| **Duplicate Slide** | `presentationId`, `slideId` | Copy slide within presentation | ~2-3 sec | Use Slides API `batchUpdate()` with duplicate |
| **Get Presentation** | `presentationId` | Read presentation structure | ~2-3 sec | Use Slides API `presentations.get()` |

---

## 4. Google Sheets Operations

### Current Sheets Operations (Available Now)

| Operation | Required Parameters | Use Case | Execution Time | Code Reference |
|-----------|-------------------|----------|----------------|----------------|
| **Create Simple Sheet** | `title`, `folderId?` | Create basic spreadsheet | ~2-3 sec | Google Sheets API `spreadsheets.create()` |
| **Create with Apps Script** | `title`, `scriptCode`, `folderId?` | Create sheet with automation | ~5-10 sec | Create sheet → Deploy Apps Script → Auto-install |

### Missing Sheets Operations (Proposed)

| Operation | Required Parameters | Use Case | Execution Time | Implementation |
|-----------|-------------------|----------|----------------|----------------|
| **Read Range** | `spreadsheetId`, `range` | Get cell values from sheet | ~1-2 sec | Use Sheets API `spreadsheets.values.get()` |
| **Write Range** | `spreadsheetId`, `range`, `values` | Update cell values | ~2-3 sec | Use Sheets API `spreadsheets.values.update()` |
| **Append Rows** | `spreadsheetId`, `range`, `values` | Add rows to end of sheet | ~2-3 sec | Use Sheets API `spreadsheets.values.append()` |
| **Clear Range** | `spreadsheetId`, `range` | Clear cell values | ~1-2 sec | Use Sheets API `spreadsheets.values.clear()` |
| **Create Sheet Tab** | `spreadsheetId`, `title` | Add new tab to spreadsheet | ~2-3 sec | Use Sheets API `batchUpdate()` with addSheet |
| **Format Cells** | `spreadsheetId`, `range`, `format` | Apply formatting (colors, borders, number format) | ~2-4 sec | Use Sheets API `batchUpdate()` with formatting |
| **Create Chart** | `spreadsheetId`, `chartSpec` | Add chart to sheet | ~3-5 sec | Use Sheets API `batchUpdate()` with addChart |
| **Protect Range** | `spreadsheetId`, `range`, `editors` | Lock cells/sheet for editing | ~2-3 sec | Use Sheets API `batchUpdate()` with protectedRanges |
| **Get Sheet Metadata** | `spreadsheetId` | Get sheet structure/properties | ~1-2 sec | Use Sheets API `spreadsheets.get()` |

---

## 5. Google Apps Script Operations

### Current Apps Script Operations (Available Now)

| Operation | Required Parameters | Use Case | Execution Time | Code Reference |
|-----------|-------------------|----------|----------------|----------------|
| **Deploy Script** | `scriptCode`, `projectTitle` | Create standalone Apps Script project | ~5-8 sec | Apps Script API `projects.create()` |
| **Auto-install Triggers** | `scriptId`, `functionName`, `triggerType` | Set up time-based or event triggers | ~3-5 sec | Apps Script API `projects.deployments.create()` |

### Missing Apps Script Operations (Proposed)

| Operation | Required Parameters | Use Case | Execution Time | Implementation |
|-----------|-------------------|----------|----------------|----------------|
| **Update Script Content** | `scriptId`, `files` | Modify existing Apps Script | ~3-5 sec | Use Apps Script API `projects.updateContent()` |
| **Create Deployment** | `scriptId`, `versionNumber?` | Deploy as web app/add-on | ~3-5 sec | Use Apps Script API `projects.deployments.create()` |
| **Execute Function** | `scriptId`, `functionName`, `params?` | Run Apps Script function remotely | ~2-10 sec | Use Apps Script API `scripts.run()` |
| **List Script Files** | `scriptId` | Get all files in Apps Script project | ~1-2 sec | Use Apps Script API `projects.get()` |
| **Create Library** | `scriptCode`, `title` | Create reusable Apps Script library | ~5-8 sec | Apps Script API + set as library |
| **Link Script to Sheet** | `scriptId`, `spreadsheetId` | Bind container-bound script | ~2-3 sec | Apps Script API with container info |

---

## 6. Advanced Workflows

### Multi-Service Workflows (Available Now)

| Workflow | Description | Use Case | Execution Time | Code Reference |
|----------|-------------|----------|----------------|----------------|
| **Markdown → Doc → PDF** | Convert markdown to Doc, then export to PDF | Print materials pipeline | ~10-15 sec | `create_from_prompt` + `exportToPdf` |
| **Index + Track Materials** | Add material to index, track usage | Material management | ~3-5 sec | `update_index` tool |
| **Batch PDF Export** | Export multiple docs/slides to PDF | Bulk document conversion | ~5-10 sec per file | Loop `exportToPdf` |

### Missing Advanced Workflows (Proposed)

| Workflow | Description | Use Case | Execution Time | Implementation |
|----------|-------------|----------|----------------|----------------|
| **Sheet → Docs Mail Merge** | Create personalized docs from sheet data | Patient letters, certificates | ~5-10 sec per doc | Read sheet → Create docs with tokens |
| **Automated Folder Setup** | Create standardized folder structure | New patient/project setup | ~10-20 sec | Nested `createFolder()` calls |
| **Bulk File Permissions** | Share multiple files/folders at once | Team access management | ~2-3 sec per file | Loop `shareFolder()` |
| **Template Cloning** | Duplicate template doc/sheet with data | Standardized documents | ~5-8 sec | Copy template → Replace tokens |
| **Cross-Service Sync** | Sync data between Sheets/Docs/Slides | Multi-document automation | ~10-30 sec | Orchestrate API calls |

---

## 7. Quick Search Index

**Search this sheet for operations by keyword:**

- **Folder operations**: Create Folder, List Files, Get Folder Hierarchy, Share Folder
- **File operations**: Upload, Download, Copy, Rename, Move, Delete, Search
- **Document creation**: Create from Markdown, Create Empty Doc, Create Empty Presentation
- **Content editing**: Append Content, Replace Text, Update Slide Text, Write Range
- **PDF operations**: Export to PDF, Export Doc
- **Permissions**: Share Folder, Protect Range
- **Apps Script**: Deploy Script, Auto-install Triggers, Execute Function
- **Batch operations**: Batch PDF Export, Bulk File Permissions, Template Cloning
- **Data operations**: Read Range, Write Range, Append Rows, Clear Range
- **Formatting**: Format Document, Format Cells, Create Chart

---

## 8. Implementation Priority

### Phase 1 (High Priority - Core Operations)
1. Copy File
2. Rename File/Folder
3. Move File
4. Delete/Trash File
5. Read Sheet Range
6. Write Sheet Range
7. Append Rows to Sheet

### Phase 2 (Medium Priority - Enhanced Functionality)
1. Create Empty Doc
2. Append Content to Doc
3. Get Doc Content
4. Create Empty Presentation
5. Add Slide
6. Share Folder
7. Get Sheet Metadata

### Phase 3 (Lower Priority - Advanced Features)
1. Format Document
2. Insert Table/Image
3. Create Chart
4. Protect Range
5. Execute Apps Script Function
6. Bulk File Permissions
7. Template Cloning Workflow

---

## 9. Usage Examples

### Example 1: Create Patient Education Material
```typescript
// Generate markdown template
const result = await create_from_prompt({
  description: "patient handout about diabetes management",
  requirements: ["8th grade reading level", "include diet section"],
  tokens: ["PATIENT_NAME", "DOCTOR_NAME"],
  outputFormat: "doc"
});

// Export to PDF
await exportToPdf({
  sourceId: result.driveFileId,
  filename: "diabetes-management.pdf",
  updateIndex: true
});
```

### Example 2: Organize Files in Drive
```typescript
// Create folder structure
const mainFolder = await createFolder("Patient Materials");
const subFolder = await createFolder("Discharge Instructions", mainFolder);

// Upload files
await uploadFile("./discharge-cardiology.pdf", "Cardiology Discharge", subFolder);

// Search for existing materials
const results = await searchFiles("diabetes education");
```

### Example 3: Sheet Automation (Proposed)
```typescript
// Create sheet with Apps Script
const sheet = await createSheetWithScript({
  title: "Patient Tracking",
  scriptCode: `
    function onEdit(e) {
      // Auto-calculate fields
      const sheet = e.source.getActiveSheet();
      // ... automation logic
    }
  `
});

// Write data
await writeRange(sheet.id, "A1:C1", [["Patient", "Date", "Status"]]);
await appendRows(sheet.id, "A2", [
  ["John Doe", "2025-11-15", "Scheduled"]
]);
```

---

## 10. Authentication & Setup

**Prerequisites:**
- Google Cloud service account with appropriate API scopes
- Service account key JSON file
- Environment variable: `GOOGLE_CREDENTIALS_PATH=/path/to/service-account-key.json`

**Required API Scopes:**
- `https://www.googleapis.com/auth/drive` (Drive operations)
- `https://www.googleapis.com/auth/documents` (Docs operations)
- `https://www.googleapis.com/auth/presentations` (Slides operations)
- `https://www.googleapis.com/auth/spreadsheets` (Sheets operations)
- `https://www.googleapis.com/auth/script.projects` (Apps Script operations)

**Setup Guide:** See `/infrastructure/google-cloud-service-account.md`

---

## 11. Error Handling & Limitations

### Common Errors
- **401 Unauthorized**: Service account not authorized or key expired
- **403 Forbidden**: Missing API scope or insufficient permissions
- **404 Not Found**: Invalid file/folder ID
- **429 Rate Limited**: Too many requests (quota exceeded)
- **500 Server Error**: Google API temporary issue

### Rate Limits (Per User per Project)
- Drive API: 20,000 requests/day (1,000/100 sec burst)
- Docs/Slides API: 300 requests/minute
- Sheets API: 500 requests/100 sec
- Apps Script API: 100 requests/100 sec

### Best Practices
- Batch operations when possible
- Use exponential backoff for retries
- Cache file metadata to reduce API calls
- Handle quotas gracefully with queue system

---

## 12. Related Documentation

- **Google Drive Automation Workflows**: `/infrastructure/google-drive-automation-workflows.md`
- **Google Cloud Service Account**: `/infrastructure/google-cloud-service-account.md`
- **MCP Development Standard**: `/templates-and-patterns/MCP-DEVELOPMENT-STANDARD.md`
- **WORKSPACE_GUIDE.md**: `/WORKSPACE_GUIDE.md` (Part 2 Quick Lookup Table)

---

**Document Version:** 1.0.0
**Last Updated:** 2025-11-15
**Maintainer:** Medical Practice Workspace AI System

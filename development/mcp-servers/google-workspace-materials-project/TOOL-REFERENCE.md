# MCP Tool Quick Reference

## update_index

**Purpose:** Add, update, or remove materials in the index

### Add Material
```json
{
  "action": "add",
  "data": {
    "name": "Patient Discharge Instructions - Cardiology",
    "type": "discharge-instructions",
    "format": "doc",
    "driveFileId": "1abc...xyz",
    "pdfFileId": "1def...uvw",
    "templateId": "tpl-123",
    "tokens": ["{{PRACTICE_NAME}}", "{{DOCTOR_NAME}}"],
    "tags": ["cardiology", "post-op", "heart"],
    "category": "patient-care",
    "status": "active"
  },
  "driveFolderId": "folder-id-123",
  "indexFileId": "index-file-id"
}
```

**Response:**
```json
{
  "success": true,
  "entry": {
    "id": "mat-lx9k2-a3b8f",
    "name": "Patient Discharge Instructions - Cardiology",
    "type": "discharge-instructions",
    "format": "doc",
    "status": "active",
    "created": "2025-11-15T21:30:00.000Z",
    "updated": "2025-11-15T21:30:00.000Z",
    "usage_count": 0,
    "driveFileId": "1abc...xyz",
    "tags": ["cardiology", "post-op", "heart"]
  },
  "message": "Added material: Patient Discharge Instructions - Cardiology (ID: mat-lx9k2-a3b8f)",
  "indexFileId": "index-file-id"
}
```

### Update Material
```json
{
  "action": "update",
  "materialId": "mat-lx9k2-a3b8f",
  "data": {
    "pdfFileId": "1new-pdf-id",
    "tags": ["cardiology", "post-op", "heart", "recovery"]
  },
  "driveFolderId": "folder-id-123"
}
```

### Archive Material
```json
{
  "action": "remove",
  "materialId": "mat-lx9k2-a3b8f"
}
```

---

## query_index

**Purpose:** Search and filter materials

### Basic Query
```json
{
  "filters": {
    "status": "active"
  },
  "sortBy": "updated",
  "limit": 20
}
```

### Advanced Filtering
```json
{
  "filters": {
    "type": "patient-education",
    "format": "doc",
    "tags": ["diabetes", "nutrition"],
    "status": "active",
    "category": "chronic-disease",
    "dateRange": {
      "start": "2025-01-01T00:00:00Z",
      "end": "2025-12-31T23:59:59Z"
    }
  },
  "sortBy": "usage_count",
  "limit": 10,
  "indexFileId": "index-file-id"
}
```

**Response:**
```json
{
  "success": true,
  "materials": [
    {
      "id": "mat-abc123",
      "name": "Managing Type 2 Diabetes",
      "type": "patient-education",
      "format": "doc",
      "status": "active",
      "tags": ["diabetes", "nutrition", "exercise"],
      "category": "chronic-disease",
      "created": "2025-03-15T10:00:00Z",
      "updated": "2025-11-10T14:30:00Z",
      "usage_count": 42,
      "driveFileId": "doc-xyz789",
      "pdfFileId": "pdf-abc456"
    }
  ],
  "count": 1,
  "message": "Found 1 material(s)"
}
```

### Sort Options
- `created` - Creation date (newest first)
- `updated` - Last modified (newest first)
- `usage_count` - Most used first
- `name` - Alphabetical (A-Z)

---

## export_to_pdf

**Purpose:** Export Google Doc/Slides to PDF

### Basic Export
```json
{
  "sourceId": "doc-file-id-123",
  "filename": "patient-education-diabetes.pdf"
}
```

**Response:**
```json
{
  "success": true,
  "pdfFileId": "pdf-generated-456",
  "pdfUrl": "https://drive.google.com/file/d/pdf-generated-456/view",
  "message": "Successfully exported Managing Type 2 Diabetes to PDF"
}
```

### Export with Index Update
```json
{
  "sourceId": "doc-file-id-123",
  "filename": "patient-education-diabetes.pdf",
  "updateIndex": true,
  "indexFileId": "index-file-id"
}
```

**Response includes:**
```json
{
  "success": true,
  "pdfFileId": "pdf-generated-456",
  "pdfUrl": "https://drive.google.com/file/d/pdf-generated-456/view",
  "message": "Successfully exported Managing Type 2 Diabetes to PDF",
  "indexFileId": "updated-index-file-id"
}
```
*Note: Material's pdfFileId updated and usage_count incremented*

### Export to Custom Folder
```json
{
  "sourceId": "slides-file-id-789",
  "filename": "presentation-heart-health.pdf",
  "outputFolderId": "custom-folder-id"
}
```

### Export with Local Copy
```json
{
  "sourceId": "doc-file-id-123",
  "filename": "discharge-instructions.pdf",
  "localOutputPath": "./generated-pdfs",
  "updateIndex": true,
  "indexFileId": "index-file-id"
}
```

**Response includes:**
```json
{
  "success": true,
  "pdfFileId": "pdf-generated-456",
  "pdfUrl": "https://drive.google.com/file/d/pdf-generated-456/view",
  "localPath": "./generated-pdfs/discharge-instructions.pdf",
  "message": "Successfully exported ... to PDF",
  "indexFileId": "updated-index-file-id"
}
```

---

## Material Types

- `discharge-instructions` - Post-procedure/visit instructions
- `patient-education` - Educational materials
- `clinical-handout` - Clinical reference materials
- `consent-form` - Consent forms
- `other` - Other materials

## File Formats

- `doc` - Google Docs
- `slides` - Google Slides
- `pdf` - PDF files
- `markdown` - Markdown files

## Material Status

- `active` - Currently in use
- `draft` - Under development
- `archived` - No longer in use (soft delete)

---

## Common Workflows

### Workflow 1: Create and Export New Material
```javascript
// 1. Add to index
const addResult = await updateIndex({
  action: 'add',
  data: {
    name: 'Diabetes Management Guide',
    type: 'patient-education',
    format: 'doc',
    driveFileId: 'doc-123',
    tags: ['diabetes', 'chronic-disease']
  },
  driveFolderId: 'materials-folder'
});

// 2. Export to PDF
const pdfResult = await exportToPdf({
  sourceId: 'doc-123',
  filename: 'diabetes-guide.pdf',
  updateIndex: true,
  indexFileId: addResult.indexFileId
});
```

### Workflow 2: Find and Update Popular Materials
```javascript
// 1. Query most used materials
const queryResult = await queryIndex({
  filters: { status: 'active' },
  sortBy: 'usage_count',
  limit: 10
});

// 2. Update high-usage material
const updateResult = await updateIndex({
  action: 'update',
  materialId: queryResult.materials[0].id,
  data: {
    tags: [...existingTags, 'popular']
  }
});
```

### Workflow 3: Batch Export by Tag
```javascript
// 1. Find all materials with specific tag
const queryResult = await queryIndex({
  filters: {
    tags: ['cardiology'],
    status: 'active'
  }
});

// 2. Export each to PDF
for (const material of queryResult.materials) {
  await exportToPdf({
    sourceId: material.driveFileId,
    filename: `${material.name}.pdf`,
    updateIndex: true
  });
}
```

---

## Error Handling

All tools return a consistent response structure:

**Success:**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  ...additional data
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description"
}
```

Common errors:
- Missing required fields
- Material not found
- Invalid file type (PDF export)
- Drive API errors
- Network errors

---

## Tips & Best Practices

1. **Always use descriptive names** - Include type and subject
2. **Tag consistently** - Use lowercase, hyphenated tags
3. **Track PDFs** - Use `updateIndex: true` when exporting
4. **Archive, don't delete** - Use `action: "remove"` to archive
5. **Query before bulk operations** - Test filters first
6. **Use date ranges** - Find recent or outdated materials
7. **Monitor usage_count** - Identify popular materials
8. **Organize by category** - Use consistent categorization

---

## Environment Variables

```bash
export GOOGLE_CREDENTIALS_PATH=/path/to/service-account-key.json
```

## Installation

```bash
cd google-workspace-materials-project
npm install
npm run build
npm start
```

---
type: infrastructure-workflow
tags: [google-drive, automation, service-account, workflow, api-operations]
---

# Google Drive Automation Workflows

**Purpose:** Comprehensive guide for performing Google Drive operations using the automation service account
**Service Account:** `ssd-automation-service-account@workspace-automation-ssdspc.iam.gserviceaccount.com`
**Last Updated:** 2025-11-15

---

## Overview

This guide documents all Google Drive operations that can be performed programmatically using the automation service account. These workflows enable AI-driven automation without requiring interactive user authentication.

**Key Capabilities:**
- ✅ Create folders and files
- ✅ Search shared drives
- ✅ Share folders with the service account
- ✅ Organize files hierarchically
- ✅ Export files to PDF
- ✅ Read and update file metadata

---

## Operation Decision Tree

Use this decision tree to quickly identify which operation(s) you need for your task:

```
What do you need to do?
│
├─ 📁 CREATE NEW CONTENT
│  │
│  ├─ Need a folder?
│  │  └─ → Workflow 1: Create Folder Structure
│  │
│  ├─ Need a Google Doc/Sheet/Slide?
│  │  └─ → Workflow 3: Upload Files (createGoogleDoc)
│  │
│  ├─ Upload a local file?
│  │  └─ → Workflow 3: Upload Files (uploadFile)
│  │
│  └─ Create from template?
│     └─ → Pattern: Copy template + customize
│
├─ 🔍 FIND EXISTING CONTENT
│  │
│  ├─ Know the exact name?
│  │  └─ → Workflow 2: Search for Files (name contains 'X')
│  │
│  ├─ Looking for specific type (PDF, folder, etc)?
│  │  └─ → Workflow 2: Search for Files (mimeType filter)
│  │
│  ├─ Files in a specific folder?
│  │  └─ → Workflow 2: Search for Files ('PARENT_ID' in parents)
│  │
│  ├─ Discover shared drives?
│  │  └─ → Workflow 6: List Shared Drives
│  │
│  └─ Check service account access?
│     └─ → Common Operations: checkAccess()
│
├─ 🔄 CONVERT OR EXPORT
│  │
│  ├─ Google Doc/Sheet/Slide → PDF?
│  │  └─ → Workflow 4: Export Files to PDF
│  │
│  ├─ Markdown → Google Doc?
│  │  └─ → Workflow 3: createGoogleDoc()
│  │
│  └─ Multiple files at once?
│     └─ → Pattern: Batch export with filtering
│
├─ 🤝 SHARE OR MANAGE PERMISSIONS
│  │
│  ├─ Grant service account access?
│  │  └─ → Workflow 5: Share Folders (Manual or Programmatic)
│  │
│  ├─ Share with team members?
│  │  └─ → Workflow 5: shareFolder() with user email
│  │
│  └─ Bulk permission changes?
│     └─ → Pattern: List files + batch permission update
│
├─ 📂 ORGANIZE OR MOVE FILES
│  │
│  ├─ Move file to different folder?
│  │  └─ → Common Operations: moveFile()
│  │
│  ├─ Rename file?
│  │  └─ → drive.files.update() with new name
│  │
│  ├─ Archive old files?
│  │  └─ → Pattern: Filter by date + move to archive
│  │
│  └─ Create nested structure?
│     └─ → Workflow 1: Create Folder Structure
│
└─ 🗑️  DELETE OR CLEANUP
   │
   ├─ Delete single file?
   │  └─ → Quick Reference: Delete File
   │
   ├─ Batch delete?
   │  └─ → Pattern: Search + filter + batch delete
   │
   └─ Archive vs delete?
      └─ → Pattern: Move to archive folder (safer)
```

**Quick Tips:**
- Most real tasks require **2-3 operations combined** - check Common Patterns Library
- Always verify service account has access before attempting operations
- Use `supportsAllDrives: true` for shared drive operations
- Test with a single file before batch operations

---

## Prerequisites

### 1. Service Account Authentication

**Service Account Email:**
```
ssd-automation-service-account@workspace-automation-ssdspc.iam.gserviceaccount.com
```

**Key File Location:**
```
/Users/mmaruthurnew/Desktop/medical-patient-data/google-workspace-oauth-setup/service-account.json
```

**Required API:**
- Google Drive API v3 (enabled ✅)

**Authentication Scopes:**
```
https://www.googleapis.com/auth/drive
https://www.googleapis.com/auth/drive.file
```

### 2. Shared Drive Access

The service account can only access resources that have been explicitly shared with it:

**Current Shared Drives:**
| Drive Name | Drive ID | Purpose |
|------------|----------|---------|
| AI Development - No PHI | 0AFSsMrTVhqWuUk9PVA | Development resources, no patient data |

**To share additional drives:**
1. Open the shared drive in Google Drive
2. Click "Manage members"
3. Add: `ssd-automation-service-account@workspace-automation-ssdspc.iam.gserviceaccount.com`
4. Set permission: **Editor** (or Viewer if read-only)
5. Click "Send" (no need to notify)

---

## Common Patterns Library

Real-world tasks typically combine multiple operations. Here are the most frequent patterns with ready-to-use code examples.

### Pattern 1: Create Folder + Set Permissions + Upload File

**What it does:** Creates a new folder, shares it with team members, and uploads initial content.

**When to use:** Starting a new project, creating client folders, setting up team workspaces.

**Code Example:**
```typescript
async function setupProjectFolder(
  projectName: string,
  teamEmails: string[],
  initialFiles: string[]
) {
  const drive = google.drive({ version: 'v3', auth });

  // 1. Create root folder
  const folder = await drive.files.create({
    requestBody: {
      name: projectName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [SHARED_DRIVE_ID]
    },
    supportsAllDrives: true,
    fields: 'id, name, webViewLink'
  });

  // 2. Share with team members
  for (const email of teamEmails) {
    await drive.permissions.create({
      fileId: folder.data.id!,
      supportsAllDrives: true,
      requestBody: {
        type: 'user',
        role: 'writer',
        emailAddress: email
      },
      sendNotificationEmail: true
    });
  }

  // 3. Upload initial files
  for (const filePath of initialFiles) {
    await drive.files.create({
      requestBody: {
        name: path.basename(filePath),
        parents: [folder.data.id!]
      },
      media: {
        body: fs.createReadStream(filePath)
      },
      supportsAllDrives: true
    });
  }

  return folder.data;
}
```

---

### Pattern 2: Search for Doc + Export to PDF + Save Locally

**What it does:** Finds a specific Google Doc, converts it to PDF, and saves to local filesystem.

**When to use:** Generating reports, archiving documents, creating printable versions.

**Code Example:**
```typescript
async function exportDocToPDF(
  docName: string,
  outputPath: string
) {
  const drive = google.drive({ version: 'v3', auth });

  // 1. Search for document
  const searchResult = await drive.files.list({
    q: `name contains '${docName}' and mimeType='application/vnd.google-apps.document'`,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
    fields: 'files(id, name)'
  });

  if (!searchResult.data.files || searchResult.data.files.length === 0) {
    throw new Error(`Document "${docName}" not found`);
  }

  const doc = searchResult.data.files[0];

  // 2. Export to PDF
  const response = await drive.files.export(
    {
      fileId: doc.id!,
      mimeType: 'application/pdf'
    },
    { responseType: 'stream' }
  );

  // 3. Save locally
  const dest = fs.createWriteStream(outputPath);
  await new Promise((resolve, reject) => {
    response.data
      .on('end', resolve)
      .on('error', reject)
      .pipe(dest);
  });

  return { docId: doc.id, docName: doc.name, savedTo: outputPath };
}
```

---

### Pattern 3: Create Presentation from Template + Share with Team

**What it does:** Copies a template presentation, customizes it, and shares with stakeholders.

**When to use:** Creating client presentations, team reports, recurring meeting decks.

**Code Example:**
```typescript
async function createPresentationFromTemplate(
  templateId: string,
  newName: string,
  destinationFolderId: string,
  shareWithEmails: string[]
) {
  const drive = google.drive({ version: 'v3', auth });

  // 1. Copy template
  const presentation = await drive.files.copy({
    fileId: templateId,
    supportsAllDrives: true,
    requestBody: {
      name: newName,
      parents: [destinationFolderId]
    },
    fields: 'id, name, webViewLink'
  });

  // 2. Share with team (optional)
  for (const email of shareWithEmails) {
    await drive.permissions.create({
      fileId: presentation.data.id!,
      supportsAllDrives: true,
      requestBody: {
        type: 'user',
        role: 'writer',
        emailAddress: email
      },
      sendNotificationEmail: true,
      emailMessage: `${newName} is ready for your review`
    });
  }

  // 3. Customize using Slides API (optional)
  const slides = google.slides({ version: 'v1', auth });
  // Add custom content here...

  return presentation.data;
}
```

---

### Pattern 4: List Files in Folder + Filter by Date + Export Matching Ones

**What it does:** Retrieves files from a folder, filters by modification date, and exports to PDF.

**When to use:** Batch exporting recent documents, archiving old files, generating reports.

**Code Example:**
```typescript
async function exportRecentDocsToPDF(
  folderId: string,
  daysAgo: number,
  outputDir: string
) {
  const drive = google.drive({ version: 'v3', auth });
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysAgo);

  // 1. List files in folder
  const listResult = await drive.files.list({
    q: `'${folderId}' in parents and mimeType='application/vnd.google-apps.document'`,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
    fields: 'files(id, name, modifiedTime)',
    orderBy: 'modifiedTime desc'
  });

  // 2. Filter by date
  const recentFiles = listResult.data.files?.filter(file => {
    const modifiedDate = new Date(file.modifiedTime!);
    return modifiedDate >= cutoffDate;
  }) || [];

  console.log(`Found ${recentFiles.length} files modified in last ${daysAgo} days`);

  // 3. Export each to PDF
  const exported = [];
  for (const file of recentFiles) {
    const outputPath = path.join(outputDir, `${file.name}.pdf`);

    const response = await drive.files.export(
      { fileId: file.id!, mimeType: 'application/pdf' },
      { responseType: 'stream' }
    );

    await new Promise((resolve, reject) => {
      response.data
        .on('end', resolve)
        .on('error', reject)
        .pipe(fs.createWriteStream(outputPath));
    });

    exported.push({ name: file.name, path: outputPath });
  }

  return exported;
}
```

---

### Pattern 5: Copy Template + Rename + Move to Working Folder

**What it does:** Duplicates a template file, gives it a new name, and moves it to the active project folder.

**When to use:** Starting new documents from templates, creating consistent file structures.

**Code Example:**
```typescript
async function createFromTemplateAndMove(
  templateId: string,
  newName: string,
  targetFolderId: string
) {
  const drive = google.drive({ version: 'v3', auth });

  // 1. Copy template
  const copy = await drive.files.copy({
    fileId: templateId,
    supportsAllDrives: true,
    requestBody: {
      name: newName
    },
    fields: 'id, name, parents'
  });

  // 2. Move to target folder (if not already there)
  if (!copy.data.parents?.includes(targetFolderId)) {
    await drive.files.update({
      fileId: copy.data.id!,
      addParents: targetFolderId,
      removeParents: copy.data.parents?.join(','),
      supportsAllDrives: true,
      fields: 'id, name, parents'
    });
  }

  return copy.data;
}
```

---

### Pattern 6: Create Doc from Markdown + Share + Add to Index

**What it does:** Converts markdown content to Google Doc, shares with team, and updates a tracking spreadsheet.

**When to use:** Publishing documentation, creating shared knowledge base, automated reporting.

**Code Example:**
```typescript
async function publishMarkdownDoc(
  markdownContent: string,
  docTitle: string,
  folderId: string,
  indexSheetId: string,
  shareWithEmails: string[]
) {
  const drive = google.drive({ version: 'v3', auth });
  const docs = google.docs({ version: 'v1', auth });
  const sheets = google.sheets({ version: 'v4', auth });

  // 1. Create Google Doc
  const doc = await drive.files.create({
    requestBody: {
      name: docTitle,
      mimeType: 'application/vnd.google-apps.document',
      parents: [folderId]
    },
    supportsAllDrives: true,
    fields: 'id, name, webViewLink'
  });

  // 2. Add markdown content (simplified - use markdown-to-docs library for full conversion)
  await docs.documents.batchUpdate({
    documentId: doc.data.id!,
    requestBody: {
      requests: [
        {
          insertText: {
            location: { index: 1 },
            text: markdownContent
          }
        }
      ]
    }
  });

  // 3. Share with team
  for (const email of shareWithEmails) {
    await drive.permissions.create({
      fileId: doc.data.id!,
      supportsAllDrives: true,
      requestBody: {
        type: 'user',
        role: 'reader',
        emailAddress: email
      }
    });
  }

  // 4. Add to index spreadsheet
  await sheets.spreadsheets.values.append({
    spreadsheetId: indexSheetId,
    range: 'A:C',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[
        docTitle,
        doc.data.webViewLink,
        new Date().toISOString().split('T')[0]
      ]]
    }
  });

  return doc.data;
}
```

---

### Pattern 7: Batch Upload Files + Organize into Folders + Set Permissions

**What it does:** Uploads multiple files, organizes them by type/category, and applies permissions.

**When to use:** Bulk importing files, organizing project assets, team content migration.

**Code Example:**
```typescript
async function batchUploadAndOrganize(
  files: { path: string; category: string }[],
  rootFolderId: string,
  defaultPermissions: { email: string; role: string }[]
) {
  const drive = google.drive({ version: 'v3', auth });
  const folderMap = new Map<string, string>();

  // 1. Create category folders
  const categories = [...new Set(files.map(f => f.category))];
  for (const category of categories) {
    const folder = await drive.files.create({
      requestBody: {
        name: category,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [rootFolderId]
      },
      supportsAllDrives: true,
      fields: 'id, name'
    });
    folderMap.set(category, folder.data.id!);
  }

  // 2. Upload files to appropriate folders
  const uploaded = [];
  for (const file of files) {
    const folderId = folderMap.get(file.category)!;

    const uploadedFile = await drive.files.create({
      requestBody: {
        name: path.basename(file.path),
        parents: [folderId]
      },
      media: {
        body: fs.createReadStream(file.path)
      },
      supportsAllDrives: true,
      fields: 'id, name, webViewLink'
    });

    // 3. Set permissions
    for (const perm of defaultPermissions) {
      await drive.permissions.create({
        fileId: uploadedFile.data.id!,
        supportsAllDrives: true,
        requestBody: {
          type: 'user',
          role: perm.role,
          emailAddress: perm.email
        },
        sendNotificationEmail: false
      });
    }

    uploaded.push(uploadedFile.data);
  }

  return { folders: folderMap, files: uploaded };
}
```

---

### Pattern 8: Archive Old Files + Move to Archive Folder + Update Index

**What it does:** Finds files older than threshold, moves them to archive, and logs the action.

**When to use:** Quarterly cleanup, project closure, automated file retention policies.

**Code Example:**
```typescript
async function archiveOldFiles(
  sourceFolderId: string,
  archiveFolderId: string,
  daysOld: number,
  logSheetId: string
) {
  const drive = google.drive({ version: 'v3', auth });
  const sheets = google.sheets({ version: 'v4', auth });
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  // 1. Find old files
  const listResult = await drive.files.list({
    q: `'${sourceFolderId}' in parents and trashed=false`,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
    fields: 'files(id, name, modifiedTime, mimeType)',
    orderBy: 'modifiedTime'
  });

  const oldFiles = listResult.data.files?.filter(file => {
    const modifiedDate = new Date(file.modifiedTime!);
    return modifiedDate < cutoffDate;
  }) || [];

  console.log(`Found ${oldFiles.length} files to archive`);

  // 2. Move to archive folder
  const archived = [];
  for (const file of oldFiles) {
    await drive.files.update({
      fileId: file.id!,
      addParents: archiveFolderId,
      removeParents: sourceFolderId,
      supportsAllDrives: true
    });

    archived.push({
      name: file.name,
      id: file.id,
      archivedDate: new Date().toISOString()
    });
  }

  // 3. Update log spreadsheet
  if (archived.length > 0) {
    const rows = archived.map(item => [
      item.name,
      item.id,
      item.archivedDate,
      'Automated archival'
    ]);

    await sheets.spreadsheets.values.append({
      spreadsheetId: logSheetId,
      range: 'Archive Log!A:D',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: rows }
    });
  }

  return archived;
}
```

---

## Workflow 1: Create Folder Structure

### Use Case
Create a hierarchical folder structure in a shared drive programmatically.

### Requirements
- Service account has Editor access to target shared drive
- `googleapis` npm package installed

### Implementation

#### JavaScript/Node.js Example

```javascript
import { google } from 'googleapis';

async function createFolderStructure() {
  // 1. Authenticate
  const auth = new google.auth.GoogleAuth({
    keyFile: '/Users/mmaruthurnew/Desktop/medical-patient-data/google-workspace-oauth-setup/service-account.json',
    scopes: ['https://www.googleapis.com/auth/drive']
  });

  const drive = google.drive({ version: 'v3', auth });

  // 2. Find target shared drive
  const driveList = await drive.drives.list({ pageSize: 100 });
  const targetDrive = driveList.data.drives?.find(d =>
    d.name.toLowerCase().includes('ai development')
  );

  if (!targetDrive) {
    throw new Error('Target drive not found');
  }

  // 3. Create root folder
  const rootFolder = await drive.files.create({
    requestBody: {
      name: 'My Folder',
      mimeType: 'application/vnd.google-apps.folder',
      parents: [targetDrive.id]
    },
    supportsAllDrives: true,
    fields: 'id, name, webViewLink'
  });

  console.log('Root folder created:', rootFolder.data.id);

  // 4. Create subfolders
  const subfolders = ['Templates', 'Generated', 'Archive'];

  for (const folderName of subfolders) {
    const subfolder = await drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [rootFolder.data.id]
      },
      supportsAllDrives: true,
      fields: 'id, name'
    });

    console.log(`Created: ${subfolder.data.name} (${subfolder.data.id})`);
  }

  return rootFolder.data;
}
```

#### TypeScript Example

```typescript
import { google, drive_v3 } from 'googleapis';

interface FolderStructure {
  rootId: string;
  subfolders: { [name: string]: string };
}

async function createFolderStructure(
  driveName: string,
  rootFolderName: string,
  subfolderNames: string[]
): Promise<FolderStructure> {
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH,
    scopes: ['https://www.googleapis.com/auth/drive']
  });

  const drive = google.drive({ version: 'v3', auth });

  // Find shared drive
  const { data } = await drive.drives.list({ pageSize: 100 });
  const targetDrive = data.drives?.find(d =>
    d.name?.toLowerCase().includes(driveName.toLowerCase())
  );

  if (!targetDrive || !targetDrive.id) {
    throw new Error(`Drive "${driveName}" not found`);
  }

  // Create root folder
  const rootFolder = await drive.files.create({
    requestBody: {
      name: rootFolderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [targetDrive.id]
    },
    supportsAllDrives: true,
    fields: 'id, name, webViewLink'
  });

  const structure: FolderStructure = {
    rootId: rootFolder.data.id!,
    subfolders: {}
  };

  // Create subfolders
  for (const folderName of subfolderNames) {
    const subfolder = await drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [rootFolder.data.id!]
      },
      supportsAllDrives: true,
      fields: 'id, name'
    });

    structure.subfolders[folderName] = subfolder.data.id!;
  }

  return structure;
}
```

### Usage Example

```bash
# Create folder structure script
node create-folders.js

# Output:
# ✅ Found drive: "AI Development - No PHI" (ID: 0AFSsMrTVhqWuUk9PVA)
# ✅ Created: AI Print Materials (1NJVUyPodt_40GTIgOIk56ZZvlitOF_-j)
# ✅ Created: Templates (1jw9D5BIhkC2bbewjPo4g_vEE2ZoC1mBl)
# ✅ Created: Generated (1ZrNdBeTiK4Qp-xNG-Hfe6NbrZqLAJgql)
```

---

## Workflow 2: Search for Files and Folders

### Use Case
Find files or folders in shared drives by name, type, or metadata.

### Implementation

```typescript
async function searchDrive(query: string, driveId: string) {
  const drive = google.drive({ version: 'v3', auth });

  const response = await drive.files.list({
    q: query,
    corpora: 'drive',
    driveId: driveId,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
    fields: 'files(id, name, mimeType, parents, webViewLink)'
  });

  return response.data.files;
}

// Example queries:
// - Find all folders: "mimeType='application/vnd.google-apps.folder'"
// - Find by name: "name contains 'Templates'"
// - Find in parent: "'PARENT_ID' in parents"
// - Find PDFs: "mimeType='application/pdf'"
```

---

## Workflow 3: Upload Files to Drive

### Use Case
Upload local files or create Google Docs/Sheets/Slides programmatically.

### Implementation

```typescript
import fs from 'fs';
import { Readable } from 'stream';

// Upload local file
async function uploadFile(
  filePath: string,
  fileName: string,
  parentFolderId: string
) {
  const drive = google.drive({ version: 'v3', auth });

  const fileMetadata = {
    name: fileName,
    parents: [parentFolderId]
  };

  const media = {
    mimeType: 'application/octet-stream',
    body: fs.createReadStream(filePath)
  };

  const file = await drive.files.create({
    requestBody: fileMetadata,
    media: media,
    supportsAllDrives: true,
    fields: 'id, name, webViewLink'
  });

  return file.data;
}

// Create Google Doc
async function createGoogleDoc(
  title: string,
  content: string,
  parentFolderId: string
) {
  const drive = google.drive({ version: 'v3', auth });

  // Step 1: Create empty Google Doc
  const doc = await drive.files.create({
    requestBody: {
      name: title,
      mimeType: 'application/vnd.google-apps.document',
      parents: [parentFolderId]
    },
    supportsAllDrives: true,
    fields: 'id, name, webViewLink'
  });

  // Step 2: Add content using Google Docs API
  const docs = google.docs({ version: 'v1', auth });
  await docs.documents.batchUpdate({
    documentId: doc.data.id!,
    requestBody: {
      requests: [
        {
          insertText: {
            location: { index: 1 },
            text: content
          }
        }
      ]
    }
  });

  return doc.data;
}
```

---

## Workflow 4: Export Files to PDF

### Use Case
Convert Google Docs, Sheets, or Slides to PDF format.

### Implementation

```typescript
async function exportToPDF(
  fileId: string,
  outputPath: string
) {
  const drive = google.drive({ version: 'v3', auth });

  const response = await drive.files.export(
    {
      fileId: fileId,
      mimeType: 'application/pdf'
    },
    { responseType: 'stream' }
  );

  const dest = fs.createWriteStream(outputPath);

  return new Promise((resolve, reject) => {
    response.data
      .on('end', () => resolve(outputPath))
      .on('error', reject)
      .pipe(dest);
  });
}

// Usage:
// await exportToPDF('1abc...xyz', './output.pdf');
```

---

## Workflow 5: Share Folders with Service Account

### Use Case
Grant the service account access to existing folders or shared drives.

### Manual Process (Recommended)

1. **For Shared Drives:**
   - Open shared drive in Google Drive
   - Click "Manage members"
   - Add: `ssd-automation-service-account@workspace-automation-ssdspc.iam.gserviceaccount.com`
   - Permission: **Editor**
   - Click "Send"

2. **For Individual Folders:**
   - Right-click folder
   - Click "Share"
   - Paste service account email
   - Permission: **Editor** (or Viewer)
   - **Uncheck** "Notify people"
   - Click "Share"

### Programmatic Process (Advanced)

```typescript
async function shareFolder(
  folderId: string,
  email: string,
  role: 'reader' | 'writer' | 'owner'
) {
  const drive = google.drive({ version: 'v3', auth });

  await drive.permissions.create({
    fileId: folderId,
    supportsAllDrives: true,
    requestBody: {
      type: 'user',
      role: role,
      emailAddress: email
    },
    sendNotificationEmail: false
  });
}

// Usage:
// await shareFolder(
//   '1NJVUyPodt_40GTIgOIk56ZZvlitOF_-j',
//   'ssd-automation-service-account@workspace-automation-ssdspc.iam.gserviceaccount.com',
//   'writer'
// );
```

---

## Workflow 6: List Shared Drives

### Use Case
Discover all shared drives the service account has access to.

### Implementation

```typescript
async function listSharedDrives() {
  const drive = google.drive({ version: 'v3', auth });

  const response = await drive.drives.list({
    pageSize: 100
  });

  return response.data.drives?.map(d => ({
    id: d.id,
    name: d.name,
    link: `https://drive.google.com/drive/folders/${d.id}`
  }));
}

// Example output:
// [
//   {
//     id: '0AFSsMrTVhqWuUk9PVA',
//     name: 'AI Development - No PHI',
//     link: 'https://drive.google.com/drive/folders/0AFSsMrTVhqWuUk9PVA'
//   }
// ]
```

---

## Workflow 7: Copy Files

### Use Case
Create a duplicate of an existing file in a new location while preserving the original. Useful for creating templates, backups, or distributing files across different folders.

### Requirements
- Service account has access to source file
- Service account has Editor access to destination folder
- Source file must be copyable (most Drive files are)

### Implementation

#### JavaScript/Node.js Example

```javascript
import { google } from 'googleapis';

async function copyFile(sourceFileId, newName, destinationFolderId) {
  // 1. Authenticate
  const auth = new google.auth.GoogleAuth({
    keyFile: '/Users/mmaruthurnew/Desktop/medical-patient-data/google-workspace-oauth-setup/service-account.json',
    scopes: ['https://www.googleapis.com/auth/drive']
  });

  const drive = google.drive({ version: 'v3', auth });

  // 2. Copy the file
  const copiedFile = await drive.files.copy({
    fileId: sourceFileId,
    requestBody: {
      name: newName,
      parents: [destinationFolderId]
    },
    supportsAllDrives: true,
    fields: 'id, name, webViewLink, mimeType, parents'
  });

  console.log(`File copied: ${copiedFile.data.name}`);
  console.log(`New file ID: ${copiedFile.data.id}`);
  console.log(`Link: ${copiedFile.data.webViewLink}`);

  return copiedFile.data;
}

// Example usage:
// await copyFile(
//   '1abc...xyz',                        // Source file ID
//   'Template Copy - 2025-11-15',       // New name
//   '1NJVUyPodt_40GTIgOIk56ZZvlitOF_-j' // Destination folder
// );
```

#### TypeScript Example

```typescript
import { google, drive_v3 } from 'googleapis';

interface CopyFileOptions {
  sourceFileId: string;
  newName: string;
  destinationFolderId: string;
  copyComments?: boolean;
  copyPermissions?: boolean;
}

interface CopiedFileResult {
  id: string;
  name: string;
  link: string;
  mimeType: string;
  parents: string[];
}

async function copyFile(
  options: CopyFileOptions
): Promise<CopiedFileResult> {
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH,
    scopes: ['https://www.googleapis.com/auth/drive']
  });

  const drive = google.drive({ version: 'v3', auth });

  try {
    // Copy the file
    const response = await drive.files.copy({
      fileId: options.sourceFileId,
      requestBody: {
        name: options.newName,
        parents: [options.destinationFolderId]
      },
      supportsAllDrives: true,
      fields: 'id, name, webViewLink, mimeType, parents'
    });

    // Optionally copy permissions if needed
    if (options.copyPermissions) {
      const sourcePermissions = await drive.permissions.list({
        fileId: options.sourceFileId,
        supportsAllDrives: true,
        fields: 'permissions(id, type, role, emailAddress)'
      });

      for (const permission of sourcePermissions.data.permissions || []) {
        if (permission.type !== 'user' || permission.emailAddress) {
          await drive.permissions.create({
            fileId: response.data.id!,
            supportsAllDrives: true,
            requestBody: {
              type: permission.type!,
              role: permission.role!,
              emailAddress: permission.emailAddress
            },
            sendNotificationEmail: false
          });
        }
      }
    }

    return {
      id: response.data.id!,
      name: response.data.name!,
      link: response.data.webViewLink!,
      mimeType: response.data.mimeType!,
      parents: response.data.parents || []
    };
  } catch (error: any) {
    if (error.code === 403) {
      throw new Error('Permission denied. Check service account access to source file and destination folder.');
    }
    if (error.code === 404) {
      throw new Error('Source file not found. Verify file ID.');
    }
    throw error;
  }
}
```

### Error Handling

```typescript
async function safeCopyFile(sourceFileId: string, newName: string, destinationFolderId: string) {
  const drive = google.drive({ version: 'v3', auth });

  try {
    // 1. Verify source file exists and is accessible
    const sourceFile = await drive.files.get({
      fileId: sourceFileId,
      supportsAllDrives: true,
      fields: 'id, name, mimeType, capabilities(canCopy)'
    });

    if (!sourceFile.data.capabilities?.canCopy) {
      throw new Error(`File "${sourceFile.data.name}" cannot be copied (restricted by owner)`);
    }

    // 2. Verify destination folder exists
    await drive.files.get({
      fileId: destinationFolderId,
      supportsAllDrives: true,
      fields: 'id, mimeType'
    });

    // 3. Perform copy
    return await drive.files.copy({
      fileId: sourceFileId,
      requestBody: {
        name: newName,
        parents: [destinationFolderId]
      },
      supportsAllDrives: true,
      fields: 'id, name, webViewLink'
    });

  } catch (error: any) {
    console.error(`Copy failed: ${error.message}`);
    throw error;
  }
}
```

### Best Practices

1. **Always use `supportsAllDrives: true`** when working with shared drives
2. **Check `canCopy` capability** before attempting to copy restricted files
3. **Provide meaningful names** for copied files (include date/purpose)
4. **Preserve folder structure** by copying parent folder IDs
5. **Handle large files** - Drive API handles this automatically

### Real-World Example

```javascript
// Copy a template to create a new patient handout
async function createHandoutFromTemplate(templateId, patientCondition) {
  const timestamp = new Date().toISOString().split('T')[0];
  const newName = `Patient Handout - ${patientCondition} - ${timestamp}`;

  const generatedFolderId = '1ZrNdBeTiK4Qp-xNG-Hfe6NbrZqLAJgql'; // Generated folder

  const copiedFile = await copyFile(templateId, newName, generatedFolderId);

  console.log(`Created handout: ${copiedFile.webViewLink}`);
  return copiedFile;
}

// Usage:
// await createHandoutFromTemplate('1abc...xyz', 'Diabetes Type 2');
// Output: Created handout: https://docs.google.com/document/d/1def...abc
```

---

## Workflow 8: Rename Files/Folders

### Use Case
Rename files or folders without changing their location or permissions. Useful for updating file naming conventions, adding dates, or fixing typos.

### Requirements
- Service account has Editor access to the file/folder
- File must not be restricted by owner

### Implementation

#### JavaScript/Node.js Example

```javascript
import { google } from 'googleapis';

async function renameFile(fileId, newName) {
  // 1. Authenticate
  const auth = new google.auth.GoogleAuth({
    keyFile: '/Users/mmaruthurnew/Desktop/medical-patient-data/google-workspace-oauth-setup/service-account.json',
    scopes: ['https://www.googleapis.com/auth/drive']
  });

  const drive = google.drive({ version: 'v3', auth });

  // 2. Update the file name
  const updatedFile = await drive.files.update({
    fileId: fileId,
    requestBody: {
      name: newName
    },
    supportsAllDrives: true,
    fields: 'id, name, webViewLink, parents, modifiedTime'
  });

  console.log(`File renamed to: ${updatedFile.data.name}`);
  console.log(`Location unchanged: ${updatedFile.data.parents}`);
  console.log(`Last modified: ${updatedFile.data.modifiedTime}`);

  return updatedFile.data;
}

// Example usage:
// await renameFile('1abc...xyz', 'Updated Template - 2025-11-15');
```

#### TypeScript Example

```typescript
import { google, drive_v3 } from 'googleapis';

interface RenameFileOptions {
  fileId: string;
  newName: string;
  verifyBeforeRename?: boolean;
}

interface RenameResult {
  id: string;
  oldName: string;
  newName: string;
  location: string;
  modifiedTime: string;
}

async function renameFile(
  options: RenameFileOptions
): Promise<RenameResult> {
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH,
    scopes: ['https://www.googleapis.com/auth/drive']
  });

  const drive = google.drive({ version: 'v3', auth });

  try {
    // 1. Get current file info (if verification enabled)
    let oldName = '';
    if (options.verifyBeforeRename) {
      const currentFile = await drive.files.get({
        fileId: options.fileId,
        supportsAllDrives: true,
        fields: 'name, capabilities(canRename)'
      });

      oldName = currentFile.data.name!;

      if (!currentFile.data.capabilities?.canRename) {
        throw new Error(`Cannot rename "${oldName}" (restricted by owner)`);
      }
    }

    // 2. Rename the file
    const response = await drive.files.update({
      fileId: options.fileId,
      requestBody: {
        name: options.newName
      },
      supportsAllDrives: true,
      fields: 'id, name, parents, modifiedTime, webViewLink'
    });

    return {
      id: response.data.id!,
      oldName: oldName,
      newName: response.data.name!,
      location: response.data.parents?.[0] || 'unknown',
      modifiedTime: response.data.modifiedTime!
    };

  } catch (error: any) {
    if (error.code === 403) {
      throw new Error('Permission denied. Check service account has Editor access.');
    }
    if (error.code === 404) {
      throw new Error('File not found. Verify file ID.');
    }
    throw error;
  }
}
```

### Bulk Rename Example

```typescript
async function bulkRenameFiles(
  files: Array<{ id: string; newName: string }>
) {
  const drive = google.drive({ version: 'v3', auth });
  const results: Array<{ id: string; name: string; success: boolean }> = [];

  for (const file of files) {
    try {
      const updated = await drive.files.update({
        fileId: file.id,
        requestBody: { name: file.newName },
        supportsAllDrives: true,
        fields: 'id, name'
      });

      results.push({
        id: updated.data.id!,
        name: updated.data.name!,
        success: true
      });

      console.log(`✓ Renamed: ${updated.data.name}`);

    } catch (error: any) {
      results.push({
        id: file.id,
        name: file.newName,
        success: false
      });
      console.error(`✗ Failed to rename ${file.id}: ${error.message}`);
    }

    // Rate limiting: wait 100ms between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return results;
}
```

### Best Practices

1. **Preserve file extension** for non-Google files (PDFs, images, etc.)
2. **Use consistent naming conventions** (e.g., `Type - Name - YYYY-MM-DD`)
3. **Verify rename capability** before attempting to rename
4. **Location is preserved** - renaming does not move files
5. **Permissions are preserved** - renaming does not change sharing settings

### Real-World Example

```javascript
// Add date prefix to generated patient materials
async function addDatePrefixToFiles(folderId) {
  const drive = google.drive({ version: 'v3', auth });

  // 1. Get all files in folder
  const response = await drive.files.list({
    q: `'${folderId}' in parents and trashed=false`,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
    fields: 'files(id, name)'
  });

  const today = new Date().toISOString().split('T')[0];

  // 2. Rename each file with date prefix
  for (const file of response.data.files || []) {
    if (!file.name?.startsWith(today)) {
      const newName = `${today} - ${file.name}`;
      await renameFile(file.id!, newName);
    }
  }
}

// Usage:
// await addDatePrefixToFiles('1ZrNdBeTiK4Qp-xNG-Hfe6NbrZqLAJgql');
// Before: "Patient Handout.pdf"
// After:  "2025-11-15 - Patient Handout.pdf"
```

---

## Workflow 9: Move Files Between Folders

### Use Case
Move files or folders to different locations by changing parent folders. Essential for organizing files, archiving completed work, or restructuring folder hierarchies.

### Requirements
- Service account has Editor access to the file
- Service account has Editor access to both source and destination folders
- Works across different shared drives

### Implementation

#### JavaScript/Node.js Example

```javascript
import { google } from 'googleapis';

async function moveFile(fileId, newParentId, oldParentId = null) {
  // 1. Authenticate
  const auth = new google.auth.GoogleAuth({
    keyFile: '/Users/mmaruthurnew/Desktop/medical-patient-data/google-workspace-oauth-setup/service-account.json',
    scopes: ['https://www.googleapis.com/auth/drive']
  });

  const drive = google.drive({ version: 'v3', auth });

  // 2. If oldParentId not provided, fetch it
  if (!oldParentId) {
    const file = await drive.files.get({
      fileId: fileId,
      supportsAllDrives: true,
      fields: 'parents'
    });
    oldParentId = file.data.parents?.[0];
  }

  // 3. Move the file
  const movedFile = await drive.files.update({
    fileId: fileId,
    addParents: newParentId,
    removeParents: oldParentId || undefined,
    supportsAllDrives: true,
    fields: 'id, name, parents, webViewLink'
  });

  console.log(`Moved: ${movedFile.data.name}`);
  console.log(`New location: ${movedFile.data.parents}`);
  console.log(`Link: ${movedFile.data.webViewLink}`);

  return movedFile.data;
}

// Example usage:
// await moveFile(
//   '1abc...xyz',                        // File to move
//   '106bQbmDqjapqyaDlo74xkO3BUDgsSj2l', // Archive folder (destination)
//   '1ZrNdBeTiK4Qp-xNG-Hfe6NbrZqLAJgql'  // Generated folder (source)
// );
```

#### TypeScript Example

```typescript
import { google, drive_v3 } from 'googleapis';

interface MoveFileOptions {
  fileId: string;
  newParentId: string;
  oldParentId?: string;
  verifyDestination?: boolean;
}

interface MoveResult {
  id: string;
  name: string;
  oldParent: string;
  newParent: string;
  link: string;
}

async function moveFile(
  options: MoveFileOptions
): Promise<MoveResult> {
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH,
    scopes: ['https://www.googleapis.com/auth/drive']
  });

  const drive = google.drive({ version: 'v3', auth });

  try {
    // 1. Get current file info if oldParentId not provided
    let oldParentId = options.oldParentId;
    let fileName = '';

    if (!oldParentId || options.verifyDestination) {
      const currentFile = await drive.files.get({
        fileId: options.fileId,
        supportsAllDrives: true,
        fields: 'name, parents, capabilities(canMoveItemOutOfDrive)'
      });

      fileName = currentFile.data.name!;
      oldParentId = currentFile.data.parents?.[0];

      if (!oldParentId) {
        throw new Error(`File "${fileName}" has no parent folder`);
      }
    }

    // 2. Verify destination folder exists
    if (options.verifyDestination) {
      const destFolder = await drive.files.get({
        fileId: options.newParentId,
        supportsAllDrives: true,
        fields: 'id, name, mimeType'
      });

      if (destFolder.data.mimeType !== 'application/vnd.google-apps.folder') {
        throw new Error('Destination is not a folder');
      }
    }

    // 3. Move the file
    const response = await drive.files.update({
      fileId: options.fileId,
      addParents: options.newParentId,
      removeParents: oldParentId,
      supportsAllDrives: true,
      fields: 'id, name, parents, webViewLink'
    });

    return {
      id: response.data.id!,
      name: response.data.name!,
      oldParent: oldParentId!,
      newParent: response.data.parents?.[0] || options.newParentId,
      link: response.data.webViewLink!
    };

  } catch (error: any) {
    if (error.code === 403) {
      throw new Error('Permission denied. Check service account has Editor access to file and both folders.');
    }
    if (error.code === 404) {
      throw new Error('File or folder not found. Verify IDs.');
    }
    throw error;
  }
}
```

### Bulk Move Example

```typescript
async function bulkMoveFiles(
  fileIds: string[],
  destinationFolderId: string,
  sourceFolderId?: string
) {
  const drive = google.drive({ version: 'v3', auth });
  const results: Array<{ id: string; name: string; success: boolean }> = [];

  for (const fileId of fileIds) {
    try {
      // Get current parent if not provided
      let removeParent = sourceFolderId;
      if (!removeParent) {
        const file = await drive.files.get({
          fileId: fileId,
          supportsAllDrives: true,
          fields: 'parents'
        });
        removeParent = file.data.parents?.[0];
      }

      const moved = await drive.files.update({
        fileId: fileId,
        addParents: destinationFolderId,
        removeParents: removeParent,
        supportsAllDrives: true,
        fields: 'id, name'
      });

      results.push({
        id: moved.data.id!,
        name: moved.data.name!,
        success: true
      });

      console.log(`✓ Moved: ${moved.data.name}`);

    } catch (error: any) {
      results.push({
        id: fileId,
        name: 'unknown',
        success: false
      });
      console.error(`✗ Failed to move ${fileId}: ${error.message}`);
    }

    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return results;
}
```

### Handle Shared Drives

```typescript
// Move file between different shared drives
async function moveFileBetweenSharedDrives(
  fileId: string,
  sourceDriveId: string,
  destinationDriveId: string,
  destinationFolderId: string
) {
  const drive = google.drive({ version: 'v3', auth });

  // Note: Direct move between drives is not supported
  // Must copy then delete original

  // 1. Copy to destination drive
  const copied = await drive.files.copy({
    fileId: fileId,
    requestBody: {
      parents: [destinationFolderId]
    },
    supportsAllDrives: true,
    fields: 'id, name, webViewLink'
  });

  console.log(`Copied to destination drive: ${copied.data.name}`);

  // 2. Delete original (move to trash)
  await drive.files.update({
    fileId: fileId,
    requestBody: { trashed: true },
    supportsAllDrives: true
  });

  console.log('Original moved to trash');

  return copied.data;
}
```

### Best Practices

1. **Always use `supportsAllDrives: true`** for shared drive operations
2. **Specify both addParents and removeParents** to avoid duplicate parents
3. **Verify destination folder exists** before moving
4. **Cannot move between shared drives** - use copy + delete instead
5. **Preserve file permissions** - they remain unchanged after move

### Real-World Example

```javascript
// Archive old patient materials monthly
async function archiveOldMaterials(generatedFolderId, archiveFolderId) {
  const drive = google.drive({ version: 'v3', auth });

  // 1. Find files older than 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const cutoffDate = thirtyDaysAgo.toISOString();

  const response = await drive.files.list({
    q: `'${generatedFolderId}' in parents and modifiedTime < '${cutoffDate}' and trashed=false`,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
    fields: 'files(id, name, modifiedTime)'
  });

  // 2. Move to archive
  for (const file of response.data.files || []) {
    await moveFile(file.id!, archiveFolderId, generatedFolderId);
    console.log(`Archived: ${file.name} (modified ${file.modifiedTime})`);
  }

  console.log(`Archived ${response.data.files?.length || 0} files`);
}

// Usage:
// await archiveOldMaterials(
//   '1ZrNdBeTiK4Qp-xNG-Hfe6NbrZqLAJgql', // Generated folder
//   '106bQbmDqjapqyaDlo74xkO3BUDgsSj2l'  // Archive folder
// );
```

---

## Workflow 10: Delete/Trash Files

### Use Case
Remove files by moving to trash (recoverable) or permanently deleting them. Essential for cleanup, removing outdated materials, and managing storage.

### Requirements
- Service account has Editor access to the file
- For permanent delete: Understand data cannot be recovered
- For shared drives: Service account needs appropriate permissions

### Implementation

#### JavaScript/Node.js Example

```javascript
import { google } from 'googleapis';

// Option 1: Move to Trash (Recoverable)
async function moveToTrash(fileId) {
  const auth = new google.auth.GoogleAuth({
    keyFile: '/Users/mmaruthurnew/Desktop/medical-patient-data/google-workspace-oauth-setup/service-account.json',
    scopes: ['https://www.googleapis.com/auth/drive']
  });

  const drive = google.drive({ version: 'v3', auth });

  const trashedFile = await drive.files.update({
    fileId: fileId,
    requestBody: {
      trashed: true
    },
    supportsAllDrives: true,
    fields: 'id, name, trashed, trashedTime'
  });

  console.log(`Moved to trash: ${trashedFile.data.name}`);
  console.log(`Trashed at: ${trashedFile.data.trashedTime}`);
  console.log(`Can be recovered for 30 days`);

  return trashedFile.data;
}

// Option 2: Permanent Delete (NOT Recoverable)
async function permanentlyDelete(fileId) {
  const auth = new google.auth.GoogleAuth({
    keyFile: '/Users/mmaruthurnew/Desktop/medical-patient-data/google-workspace-oauth-setup/service-account.json',
    scopes: ['https://www.googleapis.com/auth/drive']
  });

  const drive = google.drive({ version: 'v3', auth });

  // WARNING: This cannot be undone
  await drive.files.delete({
    fileId: fileId,
    supportsAllDrives: true
  });

  console.log(`File permanently deleted: ${fileId}`);
  console.log(`This action cannot be undone`);
}

// Example usage:
// await moveToTrash('1abc...xyz');          // Safe: Can recover
// await permanentlyDelete('1abc...xyz');    // Dangerous: Cannot recover
```

#### TypeScript Example

```typescript
import { google, drive_v3 } from 'googleapis';

interface DeleteOptions {
  fileId: string;
  permanent?: boolean;
  verifyBeforeDelete?: boolean;
  confirmationText?: string;
}

interface DeleteResult {
  id: string;
  name: string;
  deletedAt: string;
  permanent: boolean;
  recoverable: boolean;
}

async function deleteFile(
  options: DeleteOptions
): Promise<DeleteResult> {
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH,
    scopes: ['https://www.googleapis.com/auth/drive']
  });

  const drive = google.drive({ version: 'v3', auth });

  try {
    // 1. Get file info for verification
    let fileName = '';
    if (options.verifyBeforeDelete) {
      const fileInfo = await drive.files.get({
        fileId: options.fileId,
        supportsAllDrives: true,
        fields: 'name, capabilities(canDelete, canTrash)'
      });

      fileName = fileInfo.data.name!;

      if (options.permanent && !fileInfo.data.capabilities?.canDelete) {
        throw new Error(`Cannot delete "${fileName}" (restricted by owner)`);
      }

      if (!options.permanent && !fileInfo.data.capabilities?.canTrash) {
        throw new Error(`Cannot trash "${fileName}" (restricted by owner)`);
      }

      // Confirmation check
      if (options.confirmationText && options.confirmationText !== fileName) {
        throw new Error('Confirmation text does not match file name');
      }
    }

    const deletedAt = new Date().toISOString();

    if (options.permanent) {
      // Permanent delete - cannot be undone
      await drive.files.delete({
        fileId: options.fileId,
        supportsAllDrives: true
      });

      return {
        id: options.fileId,
        name: fileName,
        deletedAt: deletedAt,
        permanent: true,
        recoverable: false
      };

    } else {
      // Move to trash - recoverable for 30 days
      const response = await drive.files.update({
        fileId: options.fileId,
        requestBody: { trashed: true },
        supportsAllDrives: true,
        fields: 'id, name, trashed, trashedTime'
      });

      return {
        id: response.data.id!,
        name: response.data.name!,
        deletedAt: response.data.trashedTime!,
        permanent: false,
        recoverable: true
      };
    }

  } catch (error: any) {
    if (error.code === 403) {
      throw new Error('Permission denied. Check service account has delete access.');
    }
    if (error.code === 404) {
      throw new Error('File not found. It may already be deleted.');
    }
    throw error;
  }
}
```

### Recovery Options

```typescript
// Restore file from trash
async function restoreFromTrash(fileId: string) {
  const drive = google.drive({ version: 'v3', auth });

  const restored = await drive.files.update({
    fileId: fileId,
    requestBody: {
      trashed: false
    },
    supportsAllDrives: true,
    fields: 'id, name, trashed, parents'
  });

  console.log(`Restored: ${restored.data.name}`);
  console.log(`Location: ${restored.data.parents}`);

  return restored.data;
}

// List trashed files
async function listTrashedFiles(folderId?: string) {
  const drive = google.drive({ version: 'v3', auth });

  const query = folderId
    ? `trashed=true and '${folderId}' in parents`
    : 'trashed=true';

  const response = await drive.files.list({
    q: query,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
    fields: 'files(id, name, trashedTime, originalFilename)',
    orderBy: 'trashedTime desc'
  });

  return response.data.files;
}

// Empty entire trash
async function emptyTrash() {
  const drive = google.drive({ version: 'v3', auth });

  await drive.files.emptyTrash({});
  console.log('Trash emptied. All trashed files permanently deleted.');
}
```

### Bulk Delete Example

```typescript
async function bulkDeleteFiles(
  fileIds: string[],
  permanent: boolean = false
) {
  const drive = google.drive({ version: 'v3', auth });
  const results: Array<{ id: string; success: boolean; error?: string }> = [];

  for (const fileId of fileIds) {
    try {
      if (permanent) {
        await drive.files.delete({
          fileId: fileId,
          supportsAllDrives: true
        });
      } else {
        await drive.files.update({
          fileId: fileId,
          requestBody: { trashed: true },
          supportsAllDrives: true
        });
      }

      results.push({ id: fileId, success: true });
      console.log(`✓ ${permanent ? 'Deleted' : 'Trashed'}: ${fileId}`);

    } catch (error: any) {
      results.push({
        id: fileId,
        success: false,
        error: error.message
      });
      console.error(`✗ Failed: ${fileId} - ${error.message}`);
    }

    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return results;
}
```

### Best Practices

1. **Default to trash, not permanent delete** - allows recovery
2. **Verify file name before permanent delete** - prevent accidents
3. **Trashed files auto-delete after 30 days** on shared drives
4. **Log all deletions** for audit trail
5. **Test with non-critical files first** when implementing bulk operations
6. **Use confirmation prompts** for permanent deletes

### Real-World Example

```javascript
// Cleanup old test files safely
async function cleanupTestFiles(folderId) {
  const drive = google.drive({ version: 'v3', auth });

  // 1. Find test files
  const response = await drive.files.list({
    q: `'${folderId}' in parents and name contains 'TEST' and trashed=false`,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
    fields: 'files(id, name, createdTime)'
  });

  console.log(`Found ${response.data.files?.length || 0} test files`);

  // 2. Move to trash (not permanent delete)
  for (const file of response.data.files || []) {
    await moveToTrash(file.id!);
    console.log(`Trashed: ${file.name} (created ${file.createdTime})`);
  }

  console.log('✓ Cleanup complete. Files can be restored from trash if needed.');
}

// Delete files older than retention period
async function enforceRetentionPolicy(folderId: string, retentionDays: number) {
  const drive = google.drive({ version: 'v3', auth });

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
  const cutoff = cutoffDate.toISOString();

  // Find old files
  const response = await drive.files.list({
    q: `'${folderId}' in parents and modifiedTime < '${cutoff}' and trashed=false`,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
    fields: 'files(id, name, modifiedTime)'
  });

  // Move to trash
  for (const file of response.data.files || []) {
    await moveToTrash(file.id!);
    console.log(`Archived (${retentionDays}d retention): ${file.name}`);
  }

  return response.data.files?.length || 0;
}

// Usage:
// await cleanupTestFiles('1ZrNdBeTiK4Qp-xNG-Hfe6NbrZqLAJgql');
// await enforceRetentionPolicy('106bQbmDqjapqyaDlo74xkO3BUDgsSj2l', 90);
```

---

## Workflow 11: List Files in Folder

### Use Case
Retrieve all files and subfolders within a specific folder with pagination support. Essential for inventory, search, cleanup operations, and generating file reports.

### Requirements
- Service account has Viewer or Editor access to the folder
- Handle pagination for folders with >1000 files
- Use query parameters for filtering

### Implementation

#### JavaScript/Node.js Example

```javascript
import { google } from 'googleapis';

async function listFilesInFolder(folderId, options = {}) {
  const auth = new google.auth.GoogleAuth({
    keyFile: '/Users/mmaruthurnew/Desktop/medical-patient-data/google-workspace-oauth-setup/service-account.json',
    scopes: ['https://www.googleapis.com/auth/drive']
  });

  const drive = google.drive({ version: 'v3', auth });

  const allFiles = [];
  let pageToken = null;

  do {
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      pageSize: options.pageSize || 100,
      pageToken: pageToken,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      fields: 'nextPageToken, files(id, name, mimeType, size, modifiedTime, webViewLink)',
      orderBy: options.orderBy || 'modifiedTime desc'
    });

    allFiles.push(...(response.data.files || []));
    pageToken = response.data.nextPageToken;

    console.log(`Fetched ${response.data.files?.length || 0} files (total: ${allFiles.length})`);

  } while (pageToken);

  return allFiles;
}

// Example usage:
// const files = await listFilesInFolder('1NJVUyPodt_40GTIgOIk56ZZvlitOF_-j');
// console.log(`Total files: ${files.length}`);
```

#### TypeScript Example

```typescript
import { google, drive_v3 } from 'googleapis';

interface ListFilesOptions {
  folderId: string;
  pageSize?: number;
  orderBy?: string;
  mimeTypeFilter?: string;
  nameFilter?: string;
  modifiedAfter?: string;
  modifiedBefore?: string;
  includeDetails?: boolean;
}

interface FileInfo {
  id: string;
  name: string;
  mimeType: string;
  size?: number;
  modifiedTime: string;
  createdTime?: string;
  link: string;
  owners?: Array<{ emailAddress: string }>;
  isFolder: boolean;
}

async function listFilesInFolder(
  options: ListFilesOptions
): Promise<FileInfo[]> {
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH,
    scopes: ['https://www.googleapis.com/auth/drive']
  });

  const drive = google.drive({ version: 'v3', auth });

  try {
    // Build query
    const queryParts = [`'${options.folderId}' in parents`, 'trashed=false'];

    if (options.mimeTypeFilter) {
      queryParts.push(`mimeType='${options.mimeTypeFilter}'`);
    }

    if (options.nameFilter) {
      queryParts.push(`name contains '${options.nameFilter}'`);
    }

    if (options.modifiedAfter) {
      queryParts.push(`modifiedTime > '${options.modifiedAfter}'`);
    }

    if (options.modifiedBefore) {
      queryParts.push(`modifiedTime < '${options.modifiedBefore}'`);
    }

    const query = queryParts.join(' and ');

    // Determine fields to fetch
    const basicFields = 'id, name, mimeType, size, modifiedTime, webViewLink';
    const detailFields = 'id, name, mimeType, size, modifiedTime, createdTime, webViewLink, owners(emailAddress)';
    const fields = options.includeDetails ? detailFields : basicFields;

    // Fetch with pagination
    const allFiles: FileInfo[] = [];
    let pageToken: string | null | undefined = null;

    do {
      const response = await drive.files.list({
        q: query,
        pageSize: options.pageSize || 100,
        pageToken: pageToken || undefined,
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
        fields: `nextPageToken, files(${fields})`,
        orderBy: options.orderBy || 'modifiedTime desc'
      });

      const files = response.data.files || [];

      for (const file of files) {
        allFiles.push({
          id: file.id!,
          name: file.name!,
          mimeType: file.mimeType!,
          size: file.size ? parseInt(file.size) : undefined,
          modifiedTime: file.modifiedTime!,
          createdTime: file.createdTime,
          link: file.webViewLink!,
          owners: file.owners,
          isFolder: file.mimeType === 'application/vnd.google-apps.folder'
        });
      }

      pageToken = response.data.nextPageToken;

    } while (pageToken);

    return allFiles;

  } catch (error: any) {
    if (error.code === 403) {
      throw new Error('Permission denied. Check service account has access to folder.');
    }
    if (error.code === 404) {
      throw new Error('Folder not found. Verify folder ID.');
    }
    throw error;
  }
}
```

### Advanced Filtering Examples

```typescript
// List only PDFs
async function listPDFsInFolder(folderId: string) {
  return await listFilesInFolder({
    folderId: folderId,
    mimeTypeFilter: 'application/pdf',
    orderBy: 'name'
  });
}

// List files modified in last 7 days
async function listRecentFiles(folderId: string) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  return await listFilesInFolder({
    folderId: folderId,
    modifiedAfter: sevenDaysAgo.toISOString(),
    orderBy: 'modifiedTime desc'
  });
}

// List only folders (not files)
async function listSubfolders(folderId: string) {
  return await listFilesInFolder({
    folderId: folderId,
    mimeTypeFilter: 'application/vnd.google-apps.folder',
    orderBy: 'name'
  });
}

// List Google Docs only
async function listGoogleDocs(folderId: string) {
  return await listFilesInFolder({
    folderId: folderId,
    mimeTypeFilter: 'application/vnd.google-apps.document',
    orderBy: 'modifiedTime desc'
  });
}
```

### Generate File Report

```typescript
async function generateFileReport(folderId: string) {
  const drive = google.drive({ version: 'v3', auth });

  const files = await listFilesInFolder({
    folderId: folderId,
    includeDetails: true
  });

  // Calculate statistics
  const stats = {
    totalFiles: files.length,
    totalFolders: files.filter(f => f.isFolder).length,
    totalSize: files.reduce((sum, f) => sum + (f.size || 0), 0),
    fileTypes: {} as Record<string, number>,
    oldestFile: files.reduce((oldest, f) =>
      f.modifiedTime < oldest.modifiedTime ? f : oldest
    ),
    newestFile: files.reduce((newest, f) =>
      f.modifiedTime > newest.modifiedTime ? f : newest
    )
  };

  // Count file types
  files.forEach(f => {
    stats.fileTypes[f.mimeType] = (stats.fileTypes[f.mimeType] || 0) + 1;
  });

  console.log('Folder Report:');
  console.log(`  Total items: ${stats.totalFiles}`);
  console.log(`  Folders: ${stats.totalFolders}`);
  console.log(`  Total size: ${(stats.totalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  File types:`);
  Object.entries(stats.fileTypes).forEach(([type, count]) => {
    console.log(`    ${type}: ${count}`);
  });
  console.log(`  Oldest: ${stats.oldestFile.name} (${stats.oldestFile.modifiedTime})`);
  console.log(`  Newest: ${stats.newestFile.name} (${stats.newestFile.modifiedTime})`);

  return stats;
}
```

### Best Practices

1. **Always handle pagination** - folders can exceed 1000 files
2. **Use specific query filters** to reduce API calls and response size
3. **Request only needed fields** for better performance
4. **Cache results** if listing the same folder repeatedly
5. **Use `orderBy`** for predictable results (name, modifiedTime, etc.)
6. **Set reasonable pageSize** (100-1000) based on use case

### Real-World Example

```javascript
// Generate inventory report for patient materials
async function generateMaterialsInventory() {
  const drive = google.drive({ version: 'v3', auth });

  const folders = {
    templates: '1jw9D5BIhkC2bbewjPo4g_vEE2ZoC1mBl',
    generated: '1ZrNdBeTiK4Qp-xNG-Hfe6NbrZqLAJgql',
    archive: '106bQbmDqjapqyaDlo74xkO3BUDgsSj2l'
  };

  const inventory = {};

  for (const [folderName, folderId] of Object.entries(folders)) {
    const files = await listFilesInFolder({
      folderId: folderId,
      includeDetails: true
    });

    inventory[folderName] = {
      count: files.length,
      totalSize: files.reduce((sum, f) => sum + (f.size || 0), 0),
      fileTypes: {}
    };

    // Count by type
    files.forEach(f => {
      const type = f.mimeType.includes('pdf') ? 'PDF' :
                   f.mimeType.includes('document') ? 'Google Doc' : 'Other';
      inventory[folderName].fileTypes[type] =
        (inventory[folderName].fileTypes[type] || 0) + 1;
    });

    console.log(`${folderName}: ${files.length} files, ${(inventory[folderName].totalSize / 1024 / 1024).toFixed(2)} MB`);
  }

  return inventory;
}

// Find and list duplicate files by name
async function findDuplicates(folderId: string) {
  const files = await listFilesInFolder({ folderId: folderId });

  const nameMap = new Map<string, FileInfo[]>();

  files.forEach(file => {
    const existing = nameMap.get(file.name) || [];
    existing.push(file);
    nameMap.set(file.name, existing);
  });

  const duplicates = Array.from(nameMap.entries())
    .filter(([name, files]) => files.length > 1);

  console.log(`Found ${duplicates.length} duplicate file names:`);
  duplicates.forEach(([name, files]) => {
    console.log(`  "${name}" (${files.length} copies):`);
    files.forEach(f => console.log(`    - ${f.id} (${f.modifiedTime})`));
  });

  return duplicates;
}

// Usage:
// await generateMaterialsInventory();
// await findDuplicates('1ZrNdBeTiK4Qp-xNG-Hfe6NbrZqLAJgql');
```

---

## Workflow 12: Get File Metadata

### Use Case
Retrieve detailed information about a specific file including size, permissions, modification dates, and sharing settings. Essential for auditing, compliance, and file management.

### Requirements
- Service account has Viewer access to the file
- Specify desired fields to optimize API response
- Access to shared drives if file is located there

### Implementation

#### JavaScript/Node.js Example

```javascript
import { google } from 'googleapis';

async function getFileMetadata(fileId) {
  const auth = new google.auth.GoogleAuth({
    keyFile: '/Users/mmaruthurnew/Desktop/medical-patient-data/google-workspace-oauth-setup/service-account.json',
    scopes: ['https://www.googleapis.com/auth/drive']
  });

  const drive = google.drive({ version: 'v3', auth });

  const response = await drive.files.get({
    fileId: fileId,
    supportsAllDrives: true,
    fields: 'id, name, mimeType, size, createdTime, modifiedTime, webViewLink, owners, permissions, parents, shared, capabilities'
  });

  const file = response.data;

  console.log('File Metadata:');
  console.log(`  Name: ${file.name}`);
  console.log(`  ID: ${file.id}`);
  console.log(`  Type: ${file.mimeType}`);
  console.log(`  Size: ${file.size ? (parseInt(file.size) / 1024).toFixed(2) + ' KB' : 'N/A'}`);
  console.log(`  Created: ${file.createdTime}`);
  console.log(`  Modified: ${file.modifiedTime}`);
  console.log(`  Link: ${file.webViewLink}`);
  console.log(`  Shared: ${file.shared ? 'Yes' : 'No'}`);
  console.log(`  Owners: ${file.owners?.map(o => o.emailAddress).join(', ')}`);

  return file;
}

// Example usage:
// const metadata = await getFileMetadata('1abc...xyz');
```

#### TypeScript Example

```typescript
import { google, drive_v3 } from 'googleapis';

interface DetailedFileMetadata {
  // Basic info
  id: string;
  name: string;
  mimeType: string;
  size?: number;

  // Timestamps
  createdTime: string;
  modifiedTime: string;
  viewedByMeTime?: string;

  // Links
  webViewLink: string;
  webContentLink?: string;
  thumbnailLink?: string;

  // Ownership and permissions
  owners: Array<{ emailAddress: string; displayName?: string }>;
  permissions?: Array<{
    id: string;
    type: string;
    role: string;
    emailAddress?: string;
  }>;

  // Location
  parents?: string[];
  driveId?: string;

  // Sharing
  shared: boolean;
  sharingUser?: { emailAddress: string };

  // Capabilities
  capabilities: {
    canEdit: boolean;
    canDelete: boolean;
    canShare: boolean;
    canCopy: boolean;
    canDownload: boolean;
    canRename: boolean;
  };

  // Additional
  description?: string;
  starred?: boolean;
  trashed?: boolean;
}

async function getFileMetadata(
  fileId: string,
  includePermissions: boolean = false
): Promise<DetailedFileMetadata> {
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH,
    scopes: ['https://www.googleapis.com/auth/drive']
  });

  const drive = google.drive({ version: 'v3', auth });

  try {
    const fields = [
      'id', 'name', 'mimeType', 'size',
      'createdTime', 'modifiedTime', 'viewedByMeTime',
      'webViewLink', 'webContentLink', 'thumbnailLink',
      'owners(emailAddress, displayName)',
      'parents', 'driveId',
      'shared', 'sharingUser(emailAddress)',
      'capabilities(canEdit, canDelete, canShare, canCopy, canDownload, canRename)',
      'description', 'starred', 'trashed'
    ];

    if (includePermissions) {
      fields.push('permissions(id, type, role, emailAddress, displayName)');
    }

    const response = await drive.files.get({
      fileId: fileId,
      supportsAllDrives: true,
      fields: fields.join(', ')
    });

    const file = response.data;

    return {
      id: file.id!,
      name: file.name!,
      mimeType: file.mimeType!,
      size: file.size ? parseInt(file.size) : undefined,
      createdTime: file.createdTime!,
      modifiedTime: file.modifiedTime!,
      viewedByMeTime: file.viewedByMeTime,
      webViewLink: file.webViewLink!,
      webContentLink: file.webContentLink,
      thumbnailLink: file.thumbnailLink,
      owners: file.owners || [],
      permissions: file.permissions,
      parents: file.parents,
      driveId: file.driveId,
      shared: file.shared || false,
      sharingUser: file.sharingUser,
      capabilities: file.capabilities || {
        canEdit: false,
        canDelete: false,
        canShare: false,
        canCopy: false,
        canDownload: false,
        canRename: false
      },
      description: file.description,
      starred: file.starred,
      trashed: file.trashed
    };

  } catch (error: any) {
    if (error.code === 403) {
      throw new Error('Permission denied. Service account cannot access this file.');
    }
    if (error.code === 404) {
      throw new Error('File not found. Verify file ID or check if file was deleted.');
    }
    throw error;
  }
}
```

### Batch Metadata Retrieval

```typescript
async function getBatchMetadata(fileIds: string[]) {
  const drive = google.drive({ version: 'v3', auth });
  const metadata: DetailedFileMetadata[] = [];

  for (const fileId of fileIds) {
    try {
      const meta = await getFileMetadata(fileId);
      metadata.push(meta);
      console.log(`✓ Fetched: ${meta.name}`);
    } catch (error: any) {
      console.error(`✗ Failed: ${fileId} - ${error.message}`);
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return metadata;
}
```

### Get Permission Details

```typescript
async function getFilePermissions(fileId: string) {
  const drive = google.drive({ version: 'v3', auth });

  const response = await drive.permissions.list({
    fileId: fileId,
    supportsAllDrives: true,
    fields: 'permissions(id, type, role, emailAddress, displayName, domain, expirationTime)'
  });

  return response.data.permissions?.map(p => ({
    id: p.id!,
    type: p.type!, // user, group, domain, anyone
    role: p.role!, // owner, organizer, fileOrganizer, writer, commenter, reader
    emailAddress: p.emailAddress,
    displayName: p.displayName,
    domain: p.domain,
    expirationTime: p.expirationTime
  }));
}
```

### Get File History

```typescript
async function getFileRevisions(fileId: string) {
  const drive = google.drive({ version: 'v3', auth });

  const response = await drive.revisions.list({
    fileId: fileId,
    fields: 'revisions(id, modifiedTime, lastModifyingUser(displayName, emailAddress), size)'
  });

  return response.data.revisions?.map(r => ({
    id: r.id!,
    modifiedTime: r.modifiedTime!,
    modifiedBy: r.lastModifyingUser?.displayName || r.lastModifyingUser?.emailAddress,
    size: r.size
  }));
}
```

### Best Practices

1. **Request only needed fields** - reduces API response size
2. **Use `supportsAllDrives: true`** for shared drive files
3. **Cache metadata** if file information is accessed frequently
4. **Check capabilities** before attempting operations (canEdit, canDelete, etc.)
5. **Include permissions carefully** - increases API response time

### Real-World Example

```javascript
// Audit file access and ownership
async function auditFileAccess(folderId: string) {
  const drive = google.drive({ version: 'v3', auth });

  // 1. List all files in folder
  const files = await listFilesInFolder({ folderId: folderId });

  console.log(`Auditing ${files.length} files...`);

  const auditReport = {
    totalFiles: files.length,
    sharedFiles: 0,
    publicFiles: 0,
    largeFiles: [],
    oldFiles: [],
    externalShares: []
  };

  // 2. Get detailed metadata for each file
  for (const file of files) {
    const metadata = await getFileMetadata(file.id, true);

    // Check if shared
    if (metadata.shared) {
      auditReport.sharedFiles++;
    }

    // Check permissions for public access
    const publicPerm = metadata.permissions?.find(p => p.type === 'anyone');
    if (publicPerm) {
      auditReport.publicFiles++;
    }

    // Check for large files (>10 MB)
    if (metadata.size && metadata.size > 10 * 1024 * 1024) {
      auditReport.largeFiles.push({
        name: metadata.name,
        size: (metadata.size / 1024 / 1024).toFixed(2) + ' MB'
      });
    }

    // Check for old files (>6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    if (new Date(metadata.modifiedTime) < sixMonthsAgo) {
      auditReport.oldFiles.push({
        name: metadata.name,
        modifiedTime: metadata.modifiedTime
      });
    }

    // Check for external domain shares
    const externalPerms = metadata.permissions?.filter(p =>
      p.emailAddress && !p.emailAddress.endsWith('@yourdomain.com')
    );
    if (externalPerms && externalPerms.length > 0) {
      auditReport.externalShares.push({
        file: metadata.name,
        sharedWith: externalPerms.map(p => p.emailAddress)
      });
    }

    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\nAudit Report:');
  console.log(`  Total files: ${auditReport.totalFiles}`);
  console.log(`  Shared files: ${auditReport.sharedFiles}`);
  console.log(`  Publicly accessible: ${auditReport.publicFiles}`);
  console.log(`  Large files (>10 MB): ${auditReport.largeFiles.length}`);
  console.log(`  Old files (>6 months): ${auditReport.oldFiles.length}`);
  console.log(`  External shares: ${auditReport.externalShares.length}`);

  return auditReport;
}

// Check if service account can perform specific action
async function checkFileCapability(fileId: string, capability: string) {
  const metadata = await getFileMetadata(fileId);

  const canPerform = metadata.capabilities[capability as keyof typeof metadata.capabilities];

  console.log(`Can ${capability} "${metadata.name}": ${canPerform ? 'Yes' : 'No'}`);

  return canPerform;
}

// Get complete file context (metadata + location + permissions)
async function getCompleteFileContext(fileId: string) {
  const drive = google.drive({ version: 'v3', auth });

  const metadata = await getFileMetadata(fileId, true);

  // Get parent folder info
  let parentInfo = null;
  if (metadata.parents && metadata.parents.length > 0) {
    const parent = await drive.files.get({
      fileId: metadata.parents[0],
      supportsAllDrives: true,
      fields: 'id, name, webViewLink'
    });
    parentInfo = parent.data;
  }

  // Get revision history
  const revisions = await getFileRevisions(fileId);

  return {
    metadata: metadata,
    parent: parentInfo,
    revisions: revisions,
    summary: {
      name: metadata.name,
      type: metadata.mimeType,
      size: metadata.size,
      created: metadata.createdTime,
      lastModified: metadata.modifiedTime,
      owner: metadata.owners[0]?.emailAddress,
      location: parentInfo?.name,
      sharedCount: metadata.permissions?.length || 0,
      revisionCount: revisions?.length || 0
    }
  };
}

// Usage:
// await auditFileAccess('1NJVUyPodt_40GTIgOIk56ZZvlitOF_-j');
// await checkFileCapability('1abc...xyz', 'canEdit');
// const context = await getCompleteFileContext('1abc...xyz');
```

---

## Common Operations Reference

### Get Folder ID from URL

```typescript
function getFolderIdFromUrl(url: string): string | null {
  const match = url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

// Example:
// getFolderIdFromUrl('https://drive.google.com/drive/folders/1NJVUyPodt_40GTIgOIk56ZZvlitOF_-j')
// Returns: '1NJVUyPodt_40GTIgOIk56ZZvlitOF_-j'
```

### Check if Service Account Has Access

```typescript
async function checkAccess(fileId: string): Promise<boolean> {
  const drive = google.drive({ version: 'v3', auth });

  try {
    await drive.files.get({
      fileId: fileId,
      supportsAllDrives: true,
      fields: 'id, name'
    });
    return true;
  } catch (error) {
    return false;
  }
}
```

### Move File to Different Folder

```typescript
async function moveFile(
  fileId: string,
  newParentId: string,
  oldParentId?: string
) {
  const drive = google.drive({ version: 'v3', auth });

  const params: any = {
    fileId: fileId,
    addParents: newParentId,
    supportsAllDrives: true,
    fields: 'id, name, parents'
  };

  if (oldParentId) {
    params.removeParents = oldParentId;
  }

  return await drive.files.update(params);
}
```

---

## Error Handling

### Common Errors and Solutions

**1. "Service account authentication failed"**
```
Cause: Invalid or missing key file
Solution: Verify key file exists and is valid JSON
```

**2. "Insufficient Permission" (403)**
```
Cause: Service account doesn't have access to resource
Solution: Share folder/drive with service account (Editor permission)
```

**3. "File not found" (404)**
```
Cause: File ID incorrect or file deleted
Solution: Verify file ID, check if file is in Trash
```

**4. "API not enabled" (403)**
```
Cause: Google Drive API not enabled in project
Solution: Enable at https://console.cloud.google.com/apis/library/drive.googleapis.com?project=workspace-automation-ssdspc
```

### Robust Error Handling Pattern

```typescript
async function robustDriveOperation<T>(
  operation: () => Promise<T>,
  retries: number = 3
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      if (error.code === 403) {
        throw new Error('Permission denied. Check service account access.');
      }
      if (error.code === 404) {
        throw new Error('Resource not found. Check file/folder ID.');
      }
      if (error.code === 429 && i < retries - 1) {
        // Rate limited, wait and retry
        await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}
```

---

## Best Practices

### 1. Always Use `supportsAllDrives: true`
Required when working with shared drives (vs "My Drive").

### 2. Request Minimal Fields
Reduces API response size and improves performance:
```typescript
fields: 'id, name, webViewLink'  // Good
fields: '*'                       // Avoid
```

### 3. Batch Operations When Possible
Reduces API calls:
```typescript
// Instead of multiple API calls
for (const file of files) {
  await drive.files.delete({ fileId: file.id });
}

// Use batch delete
await drive.files.delete({ fileId: files.map(f => f.id).join(',') });
```

### 4. Cache Drive and Folder IDs
Avoid repeated searches:
```typescript
// Bad: Search every time
const drive = await findDrive('AI Development');

// Good: Cache and reuse
const DRIVE_ID = '0AFSsMrTVhqWuUk9PVA';
```

### 5. Use Environment Variables
Never hardcode credentials:
```typescript
// Good
const keyPath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH;

// Bad
const keyPath = '/Users/mmaruthurnew/.../service-account.json';
```

---

## Security Considerations

### 1. Service Account Scope
- ✅ Only has access to explicitly shared resources
- ✅ Cannot access user's personal Drive
- ✅ Cannot access Admin console
- ✅ Editor permission (not Owner)

### 2. Key Management
- 🔒 Store key file outside git repository
- 🔒 Set restrictive file permissions: `chmod 600 service-account.json`
- 🔒 Rotate keys annually
- 🔒 Never commit to version control

### 3. Shared Drive Best Practices
- Only share drives/folders that need automation
- Use "AI Development - No PHI" drive for non-sensitive data
- Never share drives containing patient data (PHI)
- Audit shared drives quarterly

---

## Real-World Example: Google Workspace Materials MCP

**Use Case:** Create print materials (patient handouts, consent forms) and store in organized Drive folders.

**Implementation:**
1. Created folder structure in "AI Development - No PHI" drive
2. Shared root folder with service account (Editor)
3. MCP creates Google Docs from markdown
4. MCP exports Docs to PDF
5. All operations use service account authentication

**Folder Structure Created:**
```
AI Print Materials/
├── Templates/        (1jw9D5BIhkC2bbewjPo4g_vEE2ZoC1mBl)
├── Generated/        (1ZrNdBeTiK4Qp-xNG-Hfe6NbrZqLAJgql)
├── Archive/          (106bQbmDqjapqyaDlo74xkO3BUDgsSj2l)
└── config/           (1I1QdqOLSWe-f-MdrE1GZ4h9fn88hpB9d)
```

**Script Location:**
```
/Users/mmaruthurnew/Desktop/medical-patient-data/development/mcp-servers/google-workspace-materials-project/scripts/create-drive-folders.js
```

**Configuration:**
```bash
# .env file
DRIVE_ROOT_FOLDER_ID=1NJVUyPodt_40GTIgOIk56ZZvlitOF_-j
DRIVE_TEMPLATES_FOLDER_ID=1jw9D5BIhkC2bbewjPo4g_vEE2ZoC1mBl
# ... etc
```

---

## Quick Reference Commands

### Create Folder
```typescript
await drive.files.create({
  requestBody: {
    name: 'Folder Name',
    mimeType: 'application/vnd.google-apps.folder',
    parents: [parentId]
  },
  supportsAllDrives: true
});
```

### List Files
```typescript
await drive.files.list({
  q: "name contains 'query'",
  supportsAllDrives: true,
  includeItemsFromAllDrives: true
});
```

### Get File
```typescript
await drive.files.get({
  fileId: fileId,
  supportsAllDrives: true,
  fields: 'id, name, mimeType, webViewLink'
});
```

### Delete File
```typescript
await drive.files.delete({
  fileId: fileId,
  supportsAllDrives: true
});
```

### Export to PDF
```typescript
await drive.files.export({
  fileId: fileId,
  mimeType: 'application/pdf'
});
```

---

## Common Issues & Quick Fixes

### Issue 1: "File not found" (404 Error)

**Symptom:**
```
Error: File not found (404)
Message: "The file with ID 'abc123' was not found"
```

**Common Causes:**
1. File ID is incorrect or malformed
2. File has been deleted or moved to trash
3. Service account doesn't have access to the file
4. Using My Drive ID instead of Shared Drive ID

**Quick Fix:**
```typescript
// Verify file exists and you have access
async function verifyFileAccess(fileId: string) {
  try {
    const file = await drive.files.get({
      fileId: fileId,
      supportsAllDrives: true,
      fields: 'id, name, trashed, parents'
    });

    console.log(`File found: ${file.data.name}`);
    console.log(`In trash: ${file.data.trashed}`);

    return file.data;
  } catch (error: any) {
    if (error.code === 404) {
      console.error('File does not exist or you do not have access');
    }
    throw error;
  }
}
```

**Prevention:**
- Store file IDs in configuration files or database
- Validate file IDs before operations
- Use search/list to find files dynamically rather than hardcoding IDs
- Check if file is in trash before attempting operations

---

### Issue 2: "Insufficient Permission" (403 Error)

**Symptom:**
```
Error: Insufficient Permission (403)
Message: "The user does not have sufficient permissions for this file"
```

**Common Causes:**
1. Service account not shared on the folder/drive
2. Service account has Viewer permission but needs Editor
3. Trying to access user's personal Drive (service accounts can't)
4. Domain-wide delegation not configured (for user impersonation)

**Quick Fix:**
```typescript
// Check current permissions on a file
async function checkPermissions(fileId: string) {
  try {
    const response = await drive.permissions.list({
      fileId: fileId,
      supportsAllDrives: true,
      fields: 'permissions(emailAddress, role, type)'
    });

    console.log('Current permissions:');
    response.data.permissions?.forEach(perm => {
      console.log(`  ${perm.emailAddress}: ${perm.role} (${perm.type})`);
    });

    // Check if service account has access
    const serviceAccountEmail = 'ssd-automation-service-account@workspace-automation-ssdspc.iam.gserviceaccount.com';
    const hasAccess = response.data.permissions?.some(
      p => p.emailAddress === serviceAccountEmail
    );

    if (!hasAccess) {
      console.warn('Service account does not have access to this file!');
    }

    return response.data.permissions;
  } catch (error: any) {
    if (error.code === 403) {
      console.error('Cannot check permissions - you do not have access');
    }
    throw error;
  }
}
```

**Manual Fix:**
1. Open the file/folder in Google Drive
2. Click "Share"
3. Add: `ssd-automation-service-account@workspace-automation-ssdspc.iam.gserviceaccount.com`
4. Set role to **Editor** (or Writer for folders)
5. Uncheck "Notify people"
6. Click "Share"

**Prevention:**
- Always share drives/folders with service account before automation
- Use Editor permission unless read-only is explicitly required
- Document all shared resources in configuration files
- Implement permission checks before critical operations

---

### Issue 3: "API not enabled" (403 Error)

**Symptom:**
```
Error: Google Drive API has not been used in project before or it is disabled (403)
Message: "Google Drive API has not been enabled for project workspace-automation-ssdspc"
```

**Common Causes:**
1. Google Drive API not enabled in GCP project
2. Using wrong project ID
3. API was disabled after being enabled
4. Service account from different project

**Quick Fix:**
1. Go to [Google Cloud Console - API Library](https://console.cloud.google.com/apis/library?project=workspace-automation-ssdspc)
2. Search for "Google Drive API"
3. Click "Enable"
4. Wait 1-2 minutes for propagation

**Verification:**
```bash
# Check enabled APIs (requires gcloud CLI)
gcloud services list --enabled --project=workspace-automation-ssdspc | grep drive

# Should show:
# drive.googleapis.com
```

**Prevention:**
- Document all required APIs in project setup documentation
- Use Infrastructure as Code (Terraform) to manage API enablement
- Set up monitoring alerts for API disablement
- Include API check in deployment scripts

---

### Issue 4: Rate Limiting (429 Error)

**Symptom:**
```
Error: Rate Limit Exceeded (429)
Message: "User Rate Limit Exceeded"
```

**Common Causes:**
1. Too many API requests in short time period
2. Batch operations without throttling
3. Multiple concurrent processes accessing same service account
4. Default quota limits (100 requests/user/100 seconds)

**Quick Fix - Exponential Backoff:**
```typescript
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 5,
  baseDelay: number = 1000
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      if (error.code === 429 && attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
        console.log(`Rate limited. Retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}

// Usage:
await retryWithBackoff(() => drive.files.create({ ... }));
```

**Quick Fix - Throttling:**
```typescript
// Rate limiter utility
class RateLimiter {
  private queue: (() => Promise<any>)[] = [];
  private running = 0;
  private maxConcurrent: number;
  private minInterval: number;

  constructor(maxConcurrent = 10, minInterval = 100) {
    this.maxConcurrent = maxConcurrent;
    this.minInterval = minInterval;
  }

  async schedule<T>(operation: () => Promise<T>): Promise<T> {
    while (this.running >= this.maxConcurrent) {
      await new Promise(resolve => setTimeout(resolve, this.minInterval));
    }

    this.running++;

    try {
      const result = await operation();
      await new Promise(resolve => setTimeout(resolve, this.minInterval));
      return result;
    } finally {
      this.running--;
    }
  }
}

// Usage:
const limiter = new RateLimiter(10, 100); // 10 concurrent, 100ms between calls

for (const file of files) {
  await limiter.schedule(() => drive.files.create({ ... }));
}
```

**Prevention:**
- Implement rate limiting in all batch operations
- Use exponential backoff for retries
- Monitor API quota usage in Google Cloud Console
- Request quota increase if needed: https://console.cloud.google.com/apis/api/drive.googleapis.com/quotas?project=workspace-automation-ssdspc
- Batch operations where possible (combine multiple requests)

---

### Issue 5: Authentication Failures

**Symptom:**
```
Error: invalid_grant
Message: "Invalid JWT: Token must be a short-lived token and in a reasonable timeframe"
```
OR
```
Error: Could not load the default credentials
```

**Common Causes:**
1. Service account key file not found
2. System clock skew (time difference)
3. Key file is corrupted or invalid JSON
4. Environment variable pointing to wrong path
5. Key has been deleted or rotated in GCP

**Quick Fix:**
```typescript
// Verify authentication configuration
async function verifyAuth() {
  console.log('Checking authentication...');

  // 1. Check key file exists
  const keyPath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH ||
    '/Users/mmaruthurnew/Desktop/medical-patient-data/google-workspace-oauth-setup/service-account.json';

  if (!fs.existsSync(keyPath)) {
    throw new Error(`Service account key not found at: ${keyPath}`);
  }

  console.log(`✓ Key file exists: ${keyPath}`);

  // 2. Validate JSON
  try {
    const keyData = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

    if (!keyData.private_key || !keyData.client_email) {
      throw new Error('Invalid key file structure');
    }

    console.log(`✓ Key file valid`);
    console.log(`  Service account: ${keyData.client_email}`);
    console.log(`  Project ID: ${keyData.project_id}`);
  } catch (error) {
    throw new Error('Key file is not valid JSON');
  }

  // 3. Test authentication
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: keyPath,
      scopes: ['https://www.googleapis.com/auth/drive']
    });

    const client = await auth.getClient();
    console.log('✓ Authentication successful');

    return true;
  } catch (error: any) {
    console.error('✗ Authentication failed:', error.message);
    throw error;
  }
}
```

**System Clock Fix (macOS):**
```bash
# Check system time
date

# Sync time with network time server
sudo sntp -sS time.apple.com
```

**System Clock Fix (Linux):**
```bash
# Check system time
date

# Sync time
sudo ntpdate -s time.nist.gov
```

**Prevention:**
- Store key file in consistent location documented in README
- Use environment variables for key path
- Set file permissions: `chmod 600 service-account.json`
- Add key file to `.gitignore`
- Implement health check script that runs on startup
- Document key rotation process
- Keep backup of key file in secure location

---

### Issue 6: "File already exists" When Creating

**Symptom:**
Files are duplicated with same name, or operation fails because file already exists.

**Common Causes:**
1. No uniqueness check before creating files
2. Race condition in concurrent operations
3. Previous operation didn't complete but file was created

**Quick Fix:**
```typescript
// Check if file exists before creating
async function createFileIfNotExists(
  fileName: string,
  parentFolderId: string,
  mimeType: string = 'application/vnd.google-apps.folder'
) {
  const drive = google.drive({ version: 'v3', auth });

  // 1. Search for existing file
  const searchResult = await drive.files.list({
    q: `name='${fileName}' and '${parentFolderId}' in parents and trashed=false`,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
    fields: 'files(id, name)'
  });

  // 2. Return existing file if found
  if (searchResult.data.files && searchResult.data.files.length > 0) {
    console.log(`File "${fileName}" already exists, returning existing file`);
    return searchResult.data.files[0];
  }

  // 3. Create new file
  const newFile = await drive.files.create({
    requestBody: {
      name: fileName,
      mimeType: mimeType,
      parents: [parentFolderId]
    },
    supportsAllDrives: true,
    fields: 'id, name, webViewLink'
  });

  console.log(`Created new file: ${fileName}`);
  return newFile.data;
}
```

**Prevention:**
- Always search before creating
- Use unique identifiers in file names (timestamps, UUIDs)
- Implement idempotent operations
- Use transactions/locking for concurrent access

---

### Issue 7: "Parent not found" When Creating Nested Folders

**Symptom:**
```
Error: The parents field includes a non-existent ID
```

**Common Causes:**
1. Creating child folder before parent folder exists
2. Using wrong parent ID
3. Parent folder was deleted

**Quick Fix:**
```typescript
// Create nested folder structure safely
async function createNestedFolders(
  folderPath: string[], // e.g., ['Parent', 'Child', 'Grandchild']
  rootParentId: string
) {
  const drive = google.drive({ version: 'v3', auth });
  let currentParentId = rootParentId;

  for (const folderName of folderPath) {
    // Check if folder exists
    const existing = await drive.files.list({
      q: `name='${folderName}' and '${currentParentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      fields: 'files(id, name)'
    });

    if (existing.data.files && existing.data.files.length > 0) {
      currentParentId = existing.data.files[0].id!;
      console.log(`Using existing folder: ${folderName}`);
    } else {
      // Create folder
      const folder = await drive.files.create({
        requestBody: {
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [currentParentId]
        },
        supportsAllDrives: true,
        fields: 'id, name'
      });

      currentParentId = folder.data.id!;
      console.log(`Created folder: ${folderName}`);
    }
  }

  return currentParentId; // ID of deepest folder
}

// Usage:
const deepFolderId = await createNestedFolders(
  ['Projects', '2025', 'Q1', 'Client Work'],
  SHARED_DRIVE_ID
);
```

**Prevention:**
- Create folders top-down (parent before children)
- Verify parent ID exists before creating children
- Cache folder IDs after creation
- Implement tree-building functions that handle ordering

---

## Resources

### Documentation
- **Google Drive API Reference:** https://developers.google.com/drive/api/v3/reference
- **Service Account Guide:** `/infrastructure/google-cloud-service-account.md`
- **googleapis npm:** https://www.npmjs.com/package/googleapis

### Console Links
- **Drive API Dashboard:** https://console.cloud.google.com/apis/api/drive.googleapis.com/metrics?project=workspace-automation-ssdspc
- **Service Account Keys:** https://console.cloud.google.com/iam-admin/serviceaccounts?project=workspace-automation-ssdspc
- **API Library:** https://console.cloud.google.com/apis/library?project=workspace-automation-ssdspc

### Example Scripts
- **Create Folders:** `development/mcp-servers/google-workspace-materials-project/scripts/create-drive-folders.js`
- **Script README:** `development/mcp-servers/google-workspace-materials-project/scripts/README.md`

---

**Last Updated:** 2025-11-15
**Maintained By:** Workspace automation team
**Related Documentation:** `/infrastructure/google-cloud-service-account.md`

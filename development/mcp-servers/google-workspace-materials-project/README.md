# Google Workspace Materials MCP Server

AI-first print materials automation with Google Drive sync.

## Features

This MCP server provides three main tools for managing print materials:

### 1. **update_index** - Index Management
Add, update, or remove entries in the print materials index.

**Actions:**
- `add` - Create new material entry
- `update` - Update existing material
- `remove` - Archive material (status = archived)

**Example Usage:**
```json
{
  "action": "add",
  "data": {
    "name": "Patient Discharge Instructions - Cardiology",
    "type": "discharge-instructions",
    "format": "doc",
    "driveFileId": "1abc...xyz",
    "tags": ["cardiology", "post-op"],
    "category": "patient-care"
  },
  "driveFolderId": "folder-id-123"
}
```

### 2. **query_index** - Search & Filter
Search and filter materials with advanced filtering options.

**Filters:**
- `type` - Material type (discharge-instructions, patient-education, etc.)
- `format` - File format (doc, slides, pdf, markdown)
- `tags` - Array of tags (any match)
- `status` - Material status (active, archived, draft)
- `category` - Material category
- `dateRange` - Creation date range (start/end ISO 8601)

**Sorting:**
- `created` - Creation date
- `updated` - Last modified date
- `usage_count` - Usage frequency
- `name` - Alphabetical

**Example Usage:**
```json
{
  "filters": {
    "type": "patient-education",
    "tags": ["diabetes", "nutrition"],
    "status": "active"
  },
  "sortBy": "usage_count",
  "limit": 10
}
```

### 3. **export_to_pdf** - PDF Generation
Export Google Docs or Slides to PDF in Drive.

**Features:**
- Automatic folder organization (Generated/YYYY-MM-DD/)
- Optional index updates with PDF file ID
- Usage tracking
- Local copy support

**Example Usage:**
```json
{
  "sourceId": "doc-file-id-123",
  "filename": "patient-education-diabetes.pdf",
  "updateIndex": true,
  "localOutputPath": "./output"
}
```

## Installation

```bash
npm install
npm run build
```

## Configuration

Set environment variable:
```bash
export GOOGLE_CREDENTIALS_PATH=/path/to/service-account-key.json
```

## Running the Server

```bash
npm start
```

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm test:coverage

# Watch mode
npm test:watch
```

## Architecture

### Core Components

1. **IndexManager** (`src/lib/index-manager.ts`)
   - Manages print-materials-index.json
   - Handles Drive sync and local caching
   - Provides CRUD operations for materials

2. **DriveClient** (`src/lib/drive-client.ts`)
   - Google Drive API wrapper
   - File upload/download
   - PDF export functionality
   - Folder management

3. **Tools** (`src/tools/`)
   - `index-management.ts` - Index CRUD operations
   - `pdf-export.ts` - PDF generation and export

### Data Flow

```
MCP Tool Call
    ↓
Tool Handler
    ↓
IndexManager ←→ Local Cache (.cache/print-materials-index.json)
    ↓
DriveClient ←→ Google Drive API
```

## Test Results

**19 out of 21 tests passing (90.5% pass rate)**

### Passing Tests:
- ✅ Index Management (10/10)
  - Add material
  - Update material
  - Remove/archive material
  - Query with filters (type, tags, status, date range)
  - Sorting (created, updated, usage_count, name)
  - Limit results
  - Find by Drive file ID

- ✅ PDF Export (9/9)
  - Export Google Doc to PDF
  - Export Google Slides to PDF
  - Custom output folder
  - Index update on export
  - Auto .pdf extension
  - Invalid file type rejection

### Known Issues:
- ⚠️ Batch export tests (2/2) - Require additional mocking for nested exportToPdf calls

## Development Notes

### Key Design Decisions

1. **Dual Storage**: Index maintained in both Drive and local cache for resilience
2. **Archive vs Delete**: Materials are archived (status="archived") rather than deleted
3. **Auto-folder Creation**: PDFs organized by date (Generated/YYYY-MM-DD/)
4. **Usage Tracking**: Automatic usage_count increment on PDF export

### Future Enhancements

1. Template management tools
2. Token replacement for personalization
3. Markdown to Doc/Slides conversion
4. Batch operations UI
5. Material versioning

## License

MIT

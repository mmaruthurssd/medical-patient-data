# Learning Optimizer MCP - Quick Reference Guide

## Files Overview

| File | Purpose | Key Info |
|------|---------|----------|
| `server.ts` | Main MCP server entry point | Lines 25-27: Reads env vars for PROJECT_ROOT and CONFIG_DIR |
| `domain-config.ts` | Configuration loader | Scans CONFIG_DIR for *.json files, validates, stores in Map |
| `types.ts` | TypeScript interfaces | DomainConfig, TrackedIssue, OptimizationTrigger definitions |
| Other *.ts files | Components (issue-tracker, categorizer, etc.) | Use config to determine behavior |

**Server Location:**
```
/Users/mmaruthurnew/Desktop/operations-workspace/templates-and-patterns/
  mcp-server-templates/templates/learning-optimizer-mcp-server-template/
```

---

## Configuration Chain (Execution Flow)

```
1. VS Code User Settings (.mcp.json)
   ↓
   Sets environment variables:
   - LEARNING_OPTIMIZER_PROJECT_ROOT
   - LEARNING_OPTIMIZER_CONFIG_DIR
   
2. Server starts (server.ts)
   ↓
   Reads env vars (lines 25-27)
   Creates DomainConfigLoader(CONFIG_DIR)
   
3. DomainConfigLoader.loadAllConfigs()
   ↓
   fs.readdir(CONFIG_DIR)
   Filter for *.json files
   Parse each JSON
   Validate with validateConfig()
   Store in Map: domain → config
   
4. Server ready with all domains loaded
   ↓
   MCP tools access domains via configLoader.getConfig(domain)
```

---

## Environment Variables

### Set in mcp.json:

```json
{
  "mcpServers": {
    "learning-optimizer": {
      "env": {
        "LEARNING_OPTIMIZER_PROJECT_ROOT": "${workspaceFolder}",
        "LEARNING_OPTIMIZER_CONFIG_DIR": "${workspaceFolder}/learning-optimizer-configs"
      }
    }
  }
}
```

### Defaults in server.ts (if not set):

```typescript
const PROJECT_ROOT = process.env.LEARNING_OPTIMIZER_PROJECT_ROOT || process.cwd();
const CONFIG_DIR = process.env.LEARNING_OPTIMIZER_CONFIG_DIR || 
  `${PROJECT_ROOT}/learning-optimizer-configs`;
```

---

## Domain Configuration JSON Structure

### Minimal Valid Config

```json
{
  "domain": "my-domain",
  "displayName": "Display Name",
  "description": "What this domain tracks",
  "knowledgeBaseFile": "path/to/TROUBLESHOOTING.md",
  "optimizationTriggers": {
    "highImpactThreshold": 3,
    "technicalDebtThreshold": 5,
    "enableDuplicateDetection": true
  },
  "categories": [
    {
      "name": "Category Name",
      "description": "What it covers",
      "keywords": ["keyword1", "keyword2"]
    }
  ]
}
```

### Full Config (with optional fields)

```json
{
  "domain": "string",                              // REQUIRED - unique ID
  "displayName": "string",                         // REQUIRED - human-readable
  "description": "string",                         // REQUIRED - what it tracks
  "knowledgeBaseFile": "string",                   // REQUIRED - path to .md file
  "preventiveCheckFile": "string",                 // OPTIONAL - for promoted issues
  "issueNumberPrefix": "string",                   // OPTIONAL - e.g., "AUTO-"
  "optimizationTriggers": {                        // REQUIRED
    "highImpactThreshold": number,                 // REQUIRED - frequency threshold
    "technicalDebtThreshold": number,              // REQUIRED - debt threshold
    "enableDuplicateDetection": boolean,           // REQUIRED - true/false
    "requireHumanReview": boolean,                 // OPTIONAL - default: true
    "optimizationCooldown": number                 // OPTIONAL - minutes (default: 1440)
  },
  "categories": [                                  // REQUIRED - array
    {
      "name": "string",                            // REQUIRED
      "description": "string",                     // REQUIRED
      "keywords": ["string"],                      // REQUIRED - for matching
      "priority": number                           // OPTIONAL - for sorting
    }
  ],
  "qualityStandards": {                            // OPTIONAL
    "requireRootCauseForPromotion": boolean,       // default: true
    "requirePreventionForPromotion": boolean,      // default: true
    "minimumContextFields": number                 // default: 2
  }
}
```

---

## How Configuration Is Used

### By DomainConfigLoader

```typescript
// Loads all *.json from CONFIG_DIR
await configLoader.loadAllConfigs();

// Access specific domain config
const config = configLoader.getConfig("mcp-installation");
// Returns: DomainConfig | undefined

// Get all configs
const allConfigs = configLoader.getAllConfigs();
// Returns: DomainConfig[]
```

### By MCP Tools

All tools follow this pattern:

```typescript
const domain = args.domain;
const config = configLoader.getConfig(domain);

if (!config) {
  throw new Error(`Unknown domain: ${domain}`);
}

// Use config properties:
// - config.knowledgeBaseFile
// - config.optimizationTriggers
// - config.categories
// - config.qualityStandards
// etc.
```

---

## Validation Rules

### Config Validation (in domain-config.ts)

```typescript
// These checks happen during loadAllConfigs()
if (!config.domain) throw new Error('Missing domain field');
if (!config.knowledgeBaseFile) throw new Error('Missing knowledgeBaseFile field');
if (!config.optimizationTriggers) throw new Error('Missing optimizationTriggers field');
if (!Array.isArray(config.categories)) throw new Error('categories must be an array');
```

**Failure Behavior:**
- Logs error to console.error
- Continues loading other config files
- That domain will not be available

---

## Current Configurations in Operations Workspace

**Location:** `/Users/mmaruthurnew/Desktop/operations-workspace/configuration/learning-optimizer-configs/`

| File | Domain | Description |
|------|--------|-------------|
| mcp-installation.json | `mcp-installation` | MCP server template installation issues |
| google-sheets.json | `google-sheets` | Google Sheets automation issues |
| github-actions-setup.json | `github-actions-setup` | GitHub Actions configuration |
| template.json | (example) | Template for creating new domains |

---

## Key Implementation Details

### Path Resolution

All file paths in config are **relative to PROJECT_ROOT**:

```typescript
// In domain-config.ts (lines 99-101)
resolveFilePath(domainConfig: DomainConfig, filePath: string, projectRoot: string): string {
  return path.join(projectRoot, filePath);
}
```

Example:
- PROJECT_ROOT = `/workspace`
- knowledgeBaseFile = `docs/TROUBLESHOOTING.md`
- Full path = `/workspace/docs/TROUBLESHOOTING.md`

### Knowledge Base File Must Exist

- **Format:** Markdown (`.md`)
- **Must be writable:** Issues are appended to this file
- **If missing:** Tool calls will fail when trying to track issues

### Categories Determine Auto-Categorization

Keywords are matched against:
- Issue title
- Symptom
- Solution
- Context

If match found → Issue assigned that category

---

## Common Gotchas

### 1. Environment Variables Not Set
- Symptoms: Server can't find configs
- Fix: Verify `mcp.json` has correct env vars with ABSOLUTE paths

### 2. CONFIG_DIR Doesn't Exist
- Symptoms: `fs.readdir()` fails
- Fix: Create directory: `mkdir -p learning-optimizer-configs`

### 3. Config Files Not in CONFIG_DIR
- Symptoms: `Loaded 0 domain configurations`
- Fix: Put *.json files in CONFIG_DIR

### 4. JSON Syntax Error in Config
- Symptoms: `✗ Failed to load xxx.json: Unexpected token...`
- Fix: Validate JSON syntax with Node: `node -e "console.log(JSON.parse(require('fs').readFileSync(...)))`

### 5. Knowledge Base File Doesn't Exist
- Symptoms: Issues tracked but not persisted
- Fix: Create file referenced in config or fix path

### 6. Categories Array Missing
- Symptoms: Validation error during load
- Fix: Add `"categories": [...]` to config

---

## How to Add a New Domain

1. **Create JSON file** in CONFIG_DIR:
   ```bash
   cat > learning-optimizer-configs/my-domain.json << 'EOL'
   {
     "domain": "my-domain",
     "displayName": "My Domain",
     "description": "Issue tracking for my domain",
     "knowledgeBaseFile": "docs/my-troubleshooting.md",
     "optimizationTriggers": {
       "highImpactThreshold": 3,
       "technicalDebtThreshold": 5,
       "enableDuplicateDetection": true
     },
     "categories": [
       {
         "name": "Category 1",
         "description": "Type of issues",
         "keywords": ["keyword1", "keyword2"]
       }
     ]
   }
   EOL
   ```

2. **Create knowledge base file**:
   ```bash
   mkdir -p docs
   touch docs/my-troubleshooting.md
   ```

3. **Restart server** to load new domain

4. **Verify**:
   ```bash
   # Server output should show:
   # "✓ Loaded domain config: my-domain (My Domain)"
   ```

---

## Testing Configuration

### Validate JSON
```bash
node -e "console.log(JSON.parse(require('fs').readFileSync('config.json', 'utf8')))"
```

### Check File Paths
```bash
# All paths relative to PROJECT_ROOT
test -f "/workspace/docs/TROUBLESHOOTING.md" && echo "Found!"
```

### Test Server Start
```bash
cd /path/to/instance
node dist/server.js
# Look for "Loaded N domain configurations" message
```

### List Available Domains
```bash
# Call the list_domains tool
mcp__learning_optimizer__list_domains
```

---

## Performance Notes

- **Config loading:** Synchronous, blocking (async wrapper)
- **Domain lookup:** O(1) Map access
- **File I/O:** Async, non-blocking (except at startup)
- **In-memory storage:** Configs stay loaded, no re-reads

---

## Source Code References

**Server initialization (lines 25-44):**
- `server.ts` - Lines 25-27 read env vars
- `server.ts` - Line 34 creates DomainConfigLoader
- `server.ts` - Line 44 calls loadAllConfigs()

**Configuration loading (lines 21-46):**
- `domain-config.ts` - loadAllConfigs() method
- `domain-config.ts` - validateConfig() validation logic

**Config usage (example, lines 300-306):**
- `server.ts` - Lines 301-302 show domain config lookup pattern
- All tools follow this pattern


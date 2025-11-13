# Learning Optimizer MCP Server - Implementation Analysis

## Executive Summary

The Learning Optimizer MCP server is a domain-agnostic troubleshooting optimization system that learns from tracked issues and prevents technical debt. It implements a sophisticated configuration-driven architecture where domain-specific behavior is defined entirely through JSON configuration files.

---

## 1. Server Location & Architecture

### Primary Server Implementation
**Path:** `/Users/mmaruthurnew/Desktop/operations-workspace/templates-and-patterns/mcp-server-templates/templates/learning-optimizer-mcp-server-template/`

### Key Files Structure
```
learning-optimizer-mcp-server-template/
├── src/
│   ├── server.ts              # Main MCP server entry point
│   ├── domain-config.ts       # Configuration loader & manager
│   ├── types.ts               # TypeScript interfaces
│   ├── issue-tracker.ts       # Issue tracking & persistence
│   ├── categorizer.ts         # Issue categorization logic
│   ├── duplicate-detector.ts  # Duplicate detection
│   ├── optimizer.ts           # Optimization engine
│   ├── preventive-generator.ts # Prevention check generation
│   ├── quality-scorer.ts      # Quality & confidence scoring
│   ├── review-workflow.ts     # Human review workflow
│   └── validator.ts           # Configuration validation
├── configs/                   # Example domain configurations
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
├── INSTALL-INSTRUCTIONS.md   # AI-friendly installation guide
└── README.md                 # Documentation
```

### Compiled Output
**Location:** `dist/server.js` (after build)
- Built with: `npm run build` (runs TypeScript compiler)
- Runtime: Node.js ES module format
- Entry: `#!/usr/bin/env node` shebang for direct execution

---

## 2. Configuration Loading Mechanism

### Two-Level Configuration System

#### Level 1: MCP Server Registration (VS Code User Settings)
**File:** `~/Library/Application Support/Code/User/mcp.json` (macOS)

```json
{
  "mcpServers": {
    "learning-optimizer": {
      "command": "node",
      "args": [
        "/ABSOLUTE/PATH/TO/dist/server.js"
      ],
      "env": {
        "LEARNING_OPTIMIZER_PROJECT_ROOT": "${workspaceFolder}",
        "LEARNING_OPTIMIZER_CONFIG_DIR": "${workspaceFolder}/learning-optimizer-configs"
      }
    }
  }
}
```

#### Level 2: Domain Configuration (JSON Files)
**Default Location:** `${WORKSPACE_ROOT}/learning-optimizer-configs/`

Each domain is defined as a separate JSON file: `{domain-name}.json`

---

## 3. Environment Variables & CONFIG_DIR

### Environment Variables Used

| Variable | Purpose | Default Value | Example |
|----------|---------|----------------|---------|
| `LEARNING_OPTIMIZER_PROJECT_ROOT` | Workspace root path | Current working directory | `/Users/user/workspace` |
| `LEARNING_OPTIMIZER_CONFIG_DIR` | Location of domain configs | `${PROJECT_ROOT}/learning-optimizer-configs` | `/workspace/learning-optimizer-configs` |

### How They're Used (from server.ts)

```typescript
// Lines 25-27 of server.ts
const PROJECT_ROOT = process.env.LEARNING_OPTIMIZER_PROJECT_ROOT || process.cwd();
const CONFIG_DIR = process.env.LEARNING_OPTIMIZER_CONFIG_DIR || 
  `${PROJECT_ROOT}/learning-optimizer-configs`;
```

### Configuration Loading Process

1. **Server starts** → Reads environment variables
2. **Creates DomainConfigLoader** → Initialized with `CONFIG_DIR`
3. **Calls loadAllConfigs()** → Scans directory for `.json` files
4. **Loads each file** → Parses JSON and validates structure
5. **Stores in memory** → Map structure: `domain-id → DomainConfig`
6. **Reports results** → Logs success/failure for each domain

---

## 4. Domain Configuration Structure (DomainConfig Interface)

### Required Fields

```typescript
interface DomainConfig {
  domain: string;                    // Unique identifier (e.g., "mcp-installation")
  displayName: string;               // Human-readable name
  description: string;               // Domain description
  knowledgeBaseFile: string;         // Path to TROUBLESHOOTING.md
  optimizationTriggers: {
    highImpactThreshold: number;     // Frequency threshold for promotion
    technicalDebtThreshold: number;  // Debt threshold
    enableDuplicateDetection: boolean; // Enable/disable duplicate merging
    requireHumanReview?: boolean;    // Default: true (promoted issues need approval)
    optimizationCooldown?: number;   // Minutes between optimizations (default: 1440)
  };
  categories: Array<{
    name: string;                    // Category name
    description: string;             // What it covers
    keywords: string[];              // Keywords for auto-categorization
    priority?: number;               // Sorting priority
  }>;
}
```

### Optional Fields

```typescript
preventiveCheckFile?: string;        // Path to pre-flight checklist
issueNumberPrefix?: string;          // Issue numbering prefix (e.g., "AUTO-")
qualityStandards?: {
  requireRootCauseForPromotion?: boolean;  // Default: true
  requirePreventionForPromotion?: boolean; // Default: true
  minimumContextFields?: number;           // Default: 2
}
```

---

## 5. Actual Configuration Files in Operations Workspace

### Location
`/Users/mmaruthurnew/Desktop/operations-workspace/configuration/learning-optimizer-configs/`

### Files Present

#### 1. mcp-installation.json
```json
{
  "domain": "mcp-installation",
  "displayName": "MCP Server Installation",
  "description": "Troubleshooting optimization for MCP server template installations",
  "knowledgeBaseFile": "Templates-for-tools-frameworks-mcp-servers/mcp-server-templates/TROUBLESHOOTING.md",
  "preventiveCheckFile": "Templates-for-tools-frameworks-mcp-servers/mcp-server-templates/TROUBLESHOOTING.md",
  "optimizationTriggers": {
    "highImpactThreshold": 3,
    "technicalDebtThreshold": 5,
    "enableDuplicateDetection": true,
    "requireHumanReview": true,
    "optimizationCooldown": 1440
  },
  "categories": [
    {
      "name": "Dependencies & Build",
      "keywords": ["npm", "typescript", "tsc", "build", "install", "module"]
    },
    ...6 more categories
  ]
}
```

#### 2. google-sheets.json
Domain for Google Sheets automation troubleshooting with formula and script error categories.

#### 3. github-actions-setup.json
Recent addition (Nov 13) for GitHub Actions configuration troubleshooting.

#### 4. template.json
Template for creating new domain configurations with placeholder values.

---

## 6. Configuration Loading Code (domain-config.ts)

### Key Implementation Details

```typescript
export class DomainConfigLoader {
  private configs: Map<string, DomainConfig> = new Map();
  private configDir: string;

  constructor(configDir: string) {
    this.configDir = configDir;  // Store the config directory path
  }

  async loadAllConfigs(): Promise<void> {
    try {
      // 1. Read directory contents
      const files = await fs.readdir(this.configDir);
      
      // 2. Filter for JSON files only
      const jsonFiles = files.filter(f => f.endsWith('.json'));

      // 3. Process each file
      for (const file of jsonFiles) {
        try {
          const configPath = path.join(this.configDir, file);
          const content = await fs.readFile(configPath, 'utf-8');
          
          // 4. Parse JSON
          const config: DomainConfig = JSON.parse(content);

          // 5. Validate structure
          this.validateConfig(config);

          // 6. Store in memory map
          this.configs.set(config.domain, config);
          console.error(`✓ Loaded domain config: ${config.domain} (${config.displayName})`);
        } catch (error: any) {
          console.error(`✗ Failed to load ${file}: ${error.message}`);
        }
      }

      console.error(`Loaded ${this.configs.size} domain configurations`);
    } catch (error: any) {
      console.error(`Failed to load domain configs: ${error.message}`);
      throw error;
    }
  }

  private validateConfig(config: DomainConfig): void {
    if (!config.domain) throw new Error('Missing domain field');
    if (!config.knowledgeBaseFile) throw new Error('Missing knowledgeBaseFile field');
    if (!config.optimizationTriggers) throw new Error('Missing optimizationTriggers field');
    if (!Array.isArray(config.categories)) throw new Error('categories must be an array');
  }

  getConfig(domain: string): DomainConfig | undefined {
    return this.configs.get(domain);
  }

  getAllConfigs(): DomainConfig[] {
    return Array.from(this.configs.values());
  }
}
```

---

## 7. Server Initialization Flow (from server.ts Lines 25-44)

```typescript
// 1. Read environment variables
const PROJECT_ROOT = process.env.LEARNING_OPTIMIZER_PROJECT_ROOT || process.cwd();
const CONFIG_DIR = process.env.LEARNING_OPTIMIZER_CONFIG_DIR || 
  `${PROJECT_ROOT}/learning-optimizer-configs`;

// 2. Log configuration
console.error('Learning Optimizer MCP Server starting...');
console.error(`Project root: ${PROJECT_ROOT}`);
console.error(`Config directory: ${CONFIG_DIR}`);

// 3. Initialize DomainConfigLoader with CONFIG_DIR
const configLoader = new DomainConfigLoader(CONFIG_DIR);

// 4. Initialize other components
const issueTracker = new IssueTracker(PROJECT_ROOT);
const categorizer = new Categorizer();
const duplicateDetector = new DuplicateDetector();
const optimizer = new OptimizerEngine(PROJECT_ROOT);
const preventiveGenerator = new PreventiveCheckGenerator(PROJECT_ROOT);
const reviewWorkflow = new ReviewWorkflow();
const validator = new Validator();

// 5. Load all domain configurations from disk
await configLoader.loadAllConfigs();

// 6. Create and connect MCP server
const server = new Server(
  {
    name: 'learning-optimizer-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: { tools: {} },
  }
);
```

---

## 8. How Domains Are Used in Tools

All 13 MCP tools accept a `domain` parameter:

```typescript
case 'track_issue': {
  const domain = args.domain as string;
  const config = configLoader.getConfig(domain);  // Look up domain config
  
  if (!config) {
    throw new Error(`Unknown domain: ${domain}`);
  }
  
  // Use config to determine:
  // - Knowledge base file location
  // - Issue numbering scheme
  // - Category definitions
  // - Quality standards
  // ...
}
```

**Example Call:**
```bash
mcp__learning_optimizer__track_issue \
  --domain "mcp-installation" \
  --title "npm install timeout" \
  --symptom "Error: ETIMEDOUT" \
  --solution "Run npm install with --timeout=120000"
```

---

## 9. Key Configuration Features

### Validation
- **When:** During `loadAllConfigs()`, after each JSON is parsed
- **What's checked:** 
  - `domain` field exists
  - `knowledgeBaseFile` field exists
  - `optimizationTriggers` object exists
  - `categories` is an array
- **Failure handling:** Logs error, continues with other configs

### Dynamic Domain Registration
- **Mechanism:** Any JSON file in CONFIG_DIR is loaded automatically
- **No server restart needed:** Configs loaded at startup only
- **To add domain:** 
  1. Create `{domain}.json` in CONFIG_DIR
  2. Restart server
  3. Domain becomes available

### File Path Resolution
- **Knowledge base files:** Relative to `PROJECT_ROOT`
- **Preventive checks:** Relative to `PROJECT_ROOT`
- **Resolution function (line 99-101):**
  ```typescript
  resolveFilePath(domainConfig: DomainConfig, filePath: string, projectRoot: string): string {
    return path.join(projectRoot, filePath);
  }
  ```

---

## 10. Proper Configuration for Learning Optimizer MCP

### Step-by-Step Setup

#### 1. Identify Your Workspace Root
```bash
cd /your/workspace
git rev-parse --show-toplevel  # Gets workspace root
```

#### 2. Set Environment Variables in .mcp.json
```json
{
  "mcpServers": {
    "learning-optimizer": {
      "command": "node",
      "args": [
        "/ABSOLUTE/PATH/TO/dist/server.js"
      ],
      "env": {
        "LEARNING_OPTIMIZER_PROJECT_ROOT": "/your/workspace",
        "LEARNING_OPTIMIZER_CONFIG_DIR": "/your/workspace/learning-optimizer-configs"
      }
    }
  }
}
```

#### 3. Create Configuration Directory
```bash
mkdir -p /your/workspace/learning-optimizer-configs
```

#### 4. Add Domain Configurations
Create JSON files for each domain. Example for new domain:

```json
{
  "domain": "my-domain",
  "displayName": "My Custom Domain",
  "description": "Issues for my custom domain",
  "knowledgeBaseFile": "docs/TROUBLESHOOTING.md",
  "preventiveCheckFile": "docs/PRE_FLIGHT_CHECKLIST.md",
  "optimizationTriggers": {
    "highImpactThreshold": 3,
    "technicalDebtThreshold": 5,
    "enableDuplicateDetection": true,
    "requireHumanReview": true
  },
  "categories": [
    {
      "name": "Type A Issues",
      "description": "Description of type A",
      "keywords": ["keyword1", "keyword2"],
      "priority": 10
    }
  ]
}
```

#### 5. Verify Startup
```bash
node dist/server.js
# Should print:
# "✓ Loaded domain config: my-domain (My Custom Domain)"
# "Loaded 1 domain configurations"
```

---

## 11. Critical Configuration Details

### Knowledge Base Files Must Exist
- **Format:** Markdown (`.md`)
- **Location:** Relative to `LEARNING_OPTIMIZER_PROJECT_ROOT`
- **Example:** `Templates-for-tools-frameworks-mcp-servers/mcp-server-templates/TROUBLESHOOTING.md`
- **Content:** Markdown with YAML frontmatter for issues
- **Must be writable:** Issues are appended/updated to this file

### Preventive Check Files Optional
- **Field:** `preventiveCheckFile` (optional)
- **Purpose:** Reference location for promoted issues
- **Can be same as knowledge base**

### Categories Drive Auto-Categorization
- **Keywords matched against issue content:** symptom, title, solution
- **Used by:** `Categorizer.categorizeAll()` method
- **Impact:** Issues auto-assigned categories based on keyword matches
- **Priority determines sort order**

### Optimization Triggers Control Automation
- **highImpactThreshold:** How many occurrences before promotion candidate
- **technicalDebtThreshold:** When to run full optimization
- **requireHumanReview:** Force approval before promotion (v1.0.1)
- **optimizationCooldown:** Minutes between auto-optimizations

### Quality Standards Prevent False Positives (v1.0.1)
- **requireRootCauseForPromotion:** Block promotion if no root cause
- **requirePreventionForPromotion:** Block promotion if no prevention strategy
- **minimumContextFields:** Require N context fields for validation

---

## 12. Common Configuration Mistakes

### Mistake 1: Wrong Environment Variable Values
```bash
# WRONG - Uses relative path
LEARNING_OPTIMIZER_CONFIG_DIR="./learning-optimizer-configs"

# CORRECT - Uses absolute path or ${workspaceFolder}
LEARNING_OPTIMIZER_CONFIG_DIR="${workspaceFolder}/learning-optimizer-configs"
```

### Mistake 2: Knowledge Base File Doesn't Exist
```json
{
  "knowledgeBaseFile": "nonexistent/TROUBLESHOOTING.md"
}
```
Result: Issues can't be tracked - file write fails

### Mistake 3: JSON Syntax Errors
```json
{
  "domain": "test"
  "displayName": "Test"  // WRONG - Missing comma
}
```
Result: File won't load - JSON parse error

### Mistake 4: Missing Required Fields
```json
{
  "domain": "test",
  "displayName": "Test"
  // MISSING: knowledgeBaseFile, optimizationTriggers, categories
}
```
Result: Validation fails - "Missing knowledgeBaseFile field"

### Mistake 5: Not Creating Category Keywords
```json
{
  "categories": [
    {
      "name": "My Category"
      // MISSING: keywords array
    }
  ]
}
```
Result: Auto-categorization won't work - no keywords to match

---

## 13. Summary: How to Configure Domains Properly

### Configuration Chain
```
.mcp.json (VS Code Settings)
    ↓
LEARNING_OPTIMIZER_CONFIG_DIR environment variable
    ↓
Domain JSON files (*.json)
    ↓
DomainConfigLoader reads all files
    ↓
Each domain available to all 13 tools
    ↓
Tool uses config to determine behavior
```

### Minimal Configuration Required
```json
{
  "domain": "my-domain",
  "displayName": "My Domain",
  "description": "What this domain tracks",
  "knowledgeBaseFile": "path/to/TROUBLESHOOTING.md",
  "optimizationTriggers": {
    "highImpactThreshold": 3,
    "technicalDebtThreshold": 5,
    "enableDuplicateDetection": true
  },
  "categories": [
    {
      "name": "Category 1",
      "description": "For type 1 issues",
      "keywords": ["keyword1", "keyword2"]
    }
  ]
}
```

### Validate Configuration
```bash
# 1. Check JSON syntax
node -e "console.log(JSON.parse(require('fs').readFileSync('domain.json', 'utf8')))"

# 2. Check file references exist
# Knowledge base file path relative to PROJECT_ROOT
test -f "/workspace/${KNOWLEDGE_BASE_FILE}"

# 3. Test server startup
node dist/server.js
# Check for "✓ Loaded domain config" message
```

---

## Key Takeaways for Proper Configuration

1. **Environment variables are critical** - Wrong paths = no config loading
2. **CONFIG_DIR must be absolute path** - Use `${workspaceFolder}` or full path
3. **All JSON files in CONFIG_DIR are auto-loaded** - No registration needed
4. **Knowledge base files must exist and be writable** - Issues are persisted here
5. **Categories drive auto-categorization** - Keywords must match issue content
6. **Validation catches config errors early** - Check server logs for failures
7. **Multi-domain support is built-in** - Just add more JSON files
8. **Domain config lookup is simple map access** - O(1) performance


---
type: agent-specification
tags: [project-setup, automation, scaffolding, templates]
priority: medium
status: active
created: 2025-11-15
version: 1.0.0
---

# Project Setup Agent

**Purpose**: Automate creation of standardized project structures (8-folder, 4-folder, or MCP server), generate boilerplate files, set up Google Drive folders, configure environments, and bootstrap new projects with zero manual steps.

**Time Savings**: 30-45 minutes per project setup

**Why This Exists**:
- Ensures consistency across all projects in workspace
- Eliminates manual folder creation and boilerplate writing
- Standardizes project structures for better AI collaboration
- Reduces setup errors and missing configuration
- Enables instant project initialization from templates

---

## When to Use This Agent

### Trigger Phrases
- "create new project"
- "set up MCP"
- "initialize project structure"
- "bootstrap project"
- "scaffold new project"
- "generate project structure"
- "create project folders"
- "set up new workspace"

### Common Scenarios

**1. New MCP Server Development**
- Starting development of new MCP server tool
- Need standardized MCP structure with src/, tests/, docs/
- Want template-first development pattern
- Example: "Create a new MCP project for Gmail automation"

**2. New Implementation Project**
- Starting implementation of new feature or system
- Need comprehensive 8-folder structure for full lifecycle
- Want organized planning, implementation, testing, deployment
- Example: "Set up an 8-folder structure for patient portal project"

**3. New Research Project**
- Starting research, exploration, or prototyping
- Need simplified 4-folder structure for quick work
- Want planning, implementation, testing without heavy process
- Example: "Initialize a research project for diabetes study with Drive folders"

**4. New Integration/Feature Workspace**
- Creating workspace for specific feature development
- Need project structure tailored to integration work
- Example: "Bootstrap a TypeScript project for email automation"

---

## Tools Available

This agent uses the following Claude Code tools:

### Core File Operations
- **Bash**: Create directories (`mkdir -p`), initialize git (`git init`), run npm commands (`npm init`, `npm install`)
- **Write**: Create all boilerplate files (README, .gitignore, package.json, .env, etc.)
- **Read**: Read template files and configurations from existing projects
- **Glob**: Find template files and examples
- **Grep**: Check for existing projects with same name, search for patterns

### Google Drive Operations (when needed)
- **google-workspace-materials-project MCP**: Create Drive folders, set permissions, get folder IDs

---

## Pre-configured Context

### Workspace Paths
```bash
# Workspace root
WORKSPACE_ROOT="/Users/mmaruthurnew/Desktop/medical-patient-data"

# Development paths
MCP_DEV_PATH="${WORKSPACE_ROOT}/development/mcp-servers"
TOOLS_DEV_PATH="${WORKSPACE_ROOT}/development/tools"

# Production paths
MCP_PROD_PATH="${WORKSPACE_ROOT}/local-instances/mcp-servers"
TOOLS_PROD_PATH="${WORKSPACE_ROOT}/local-instances/tools"

# Implementation projects
IMPL_PROJECTS_PATH="${WORKSPACE_ROOT}/Implementation Projects"

# In-development projects
PROJECTS_DEV_PATH="${WORKSPACE_ROOT}/projects-in-development"

# Templates location
TEMPLATES_PATH="${WORKSPACE_ROOT}/templates-and-patterns"
MCP_TEMPLATES_PATH="${TEMPLATES_PATH}/mcp-server-templates"
```

### Service Accounts
```bash
# Google Workspace automation
SERVICE_ACCOUNT_KEY="/Users/mmaruthurnew/Desktop/medical-patient-data/google-workspace-oauth-setup/service-account.json"

# OAuth credentials
OAUTH_CREDENTIALS="/Users/mmaruthurnew/Desktop/medical-patient-data/google-workspace-oauth-setup/credentials.json"
OAUTH_TOKEN="/Users/mmaruthurnew/Desktop/medical-patient-data/google-workspace-oauth-setup/token.json"
```

### Default Shared Drives
```bash
# AI Development - No PHI (primary development drive)
AI_DEV_DRIVE_ID="0APOvXw1uUU9DUk9PVA"

# Medical Practice Documents (production/live data)
PRACTICE_DOCS_DRIVE_ID="[drive-id]"
```

---

## Project Structure Types

### 1. 8-Folder Standard Structure

**Use Case**: Comprehensive projects requiring full lifecycle management (planning → deployment → operations)

**Structure**:
```
project-name/
├── 01-project-overview/
│   ├── README.md
│   ├── PROJECT-CHARTER.md
│   ├── STAKEHOLDERS.md
│   └── GLOSSARY.md
├── 02-goals-and-roadmap/
│   ├── GOALS.md
│   ├── ROADMAP.md
│   ├── MILESTONES.md
│   └── SUCCESS-METRICS.md
├── 03-architecture-and-design/
│   ├── ARCHITECTURE.md
│   ├── DATA-MODELS.md
│   ├── API-SPEC.md
│   └── diagrams/
├── 04-implementation/
│   ├── src/
│   ├── tests/
│   ├── scripts/
│   └── IMPLEMENTATION-NOTES.md
├── 05-testing-and-validation/
│   ├── TEST-PLAN.md
│   ├── TEST-CASES.md
│   ├── test-results/
│   └── qa-reports/
├── 06-deployment-and-release/
│   ├── DEPLOYMENT-GUIDE.md
│   ├── RELEASE-NOTES.md
│   ├── deployment-scripts/
│   └── rollback-procedures/
├── 07-operations-and-monitoring/
│   ├── RUNBOOK.md
│   ├── MONITORING.md
│   ├── TROUBLESHOOTING.md
│   └── incident-reports/
├── 08-archive/
│   └── [deprecated files]
├── .gitignore
├── .env
├── .env.example
└── README.md (root level overview)
```

**Best For**:
- Long-term production systems
- Projects with multiple stakeholders
- Projects requiring compliance documentation
- Enterprise-grade implementations

---

### 2. 4-Folder Simplified Structure

**Use Case**: Smaller projects, rapid prototyping, research, quick implementations

**Structure**:
```
project-name/
├── planning-and-design/
│   ├── README.md
│   ├── REQUIREMENTS.md
│   ├── DESIGN-NOTES.md
│   └── diagrams/
├── implementation/
│   ├── src/
│   ├── scripts/
│   └── NOTES.md
├── testing-and-docs/
│   ├── TEST-PLAN.md
│   ├── test-results/
│   ├── USER-GUIDE.md
│   └── API-DOCS.md
├── archive/
│   └── [old files]
├── .gitignore
├── .env
└── README.md
```

**Best For**:
- Research projects
- Proof-of-concept work
- Internal tools
- Quick prototypes
- Time-boxed experiments

---

### 3. MCP Server Structure

**Use Case**: MCP server development following template-first pattern

**Development Structure** (`development/mcp-servers/[name]/`):
```
project-name-mcp/
├── src/
│   ├── index.ts
│   ├── tools/
│   │   ├── tool1.ts
│   │   └── tool2.ts
│   ├── types.ts
│   └── utils.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   └── test-helpers.ts
├── docs/
│   ├── TOOL-REFERENCE.md
│   ├── EXAMPLES.md
│   └── TROUBLESHOOTING.md
├── scripts/
│   ├── build.sh
│   ├── test.sh
│   └── deploy.sh
├── templates/
│   └── [MCP-specific templates]
├── dist/
│   └── [compiled output]
├── .env
├── .env.example
├── package.json
├── tsconfig.json
├── .gitignore
├── README.md
├── PROJECT-SUMMARY.md
├── QUICK-START.md
├── DEPLOYMENT-GUIDE.md
└── MCP-REGISTRATION.md
```

**Production Structure** (`local-instances/mcp-servers/[name]/`):
```
project-name-mcp/
├── dist/              # Compiled code only
├── node_modules/      # Dependencies
├── .env               # Production config
└── package.json       # Dependencies manifest
```

**Template Structure** (`templates-and-patterns/mcp-server-templates/templates/[name]-template/`):
```
project-name-template/
├── {{PROJECT_NAME}}/
│   ├── src/
│   ├── tests/
│   ├── docs/
│   ├── package.json.template
│   ├── tsconfig.json.template
│   └── .env.example.template
├── TEMPLATE-INFO.json
├── INSTALLATION-GUIDE.md
└── README.md
```

**Best For**:
- MCP server development
- Claude Code tool creation
- Workspace automation tools
- Reusable integrations

---

## Setup Wizard Questions

The agent asks these questions before creating project:

### Required Questions
1. **Project name?**
   - Must be kebab-case
   - Must be unique (agent checks for duplicates)
   - Example: `patient-portal-integration`

2. **Project type?**
   - Options: MCP server / Implementation project / Research / Tool / Other
   - Determines which structure to use

3. **Structure type?**
   - Options: 8-folder / 4-folder / MCP
   - Default based on project type

4. **Primary language?**
   - Options: TypeScript / JavaScript / Python / Other
   - Determines boilerplate files

### Optional Questions
5. **Needs Google Drive folders?**
   - yes/no
   - If yes, creates Drive folder structure and adds IDs to .env

6. **Needs Git repository?**
   - yes/no
   - Default: yes
   - Runs `git init` and creates initial commit

7. **Short description (one-line)?**
   - Used in README.md and package.json
   - Example: "Integration between patient portal and Google Sheets"

8. **Target location?**
   - Override default path based on project type
   - Default locations:
     - MCP: `development/mcp-servers/`
     - Implementation: `Implementation Projects/`
     - Research: `projects-in-development/`

---

## Generated Files

### README.md Template

```markdown
---
type: project
tags: [{{TAGS}}]
status: planning
created: {{DATE}}
last-updated: {{DATE}}
---

# {{PROJECT_NAME}}

**Type**: {{PROJECT_TYPE}}
**Status**: Planning
**Created**: {{DATE}}
**Last Updated**: {{DATE}}

## Overview

{{DESCRIPTION}}

## Project Structure

This project uses the {{STRUCTURE_TYPE}} structure:

{{FOLDER_STRUCTURE_DESCRIPTION}}

## Quick Start

### Prerequisites
- {{PREREQUISITES}}

### Setup
```bash
# Clone repository (if applicable)
git clone {{REPO_URL}}

# Install dependencies
{{INSTALL_COMMAND}}

# Configure environment
cp .env.example .env
# Edit .env with your configuration

# Run
{{RUN_COMMAND}}
```

## Documentation

- [Project Overview](./01-project-overview/README.md) - High-level project information
- [Goals & Roadmap](./02-goals-and-roadmap/GOALS.md) - Project objectives and timeline
- [Architecture](./03-architecture-and-design/ARCHITECTURE.md) - System design
- [Implementation Notes](./04-implementation/IMPLEMENTATION-NOTES.md) - Development details

## Google Drive

{{#if DRIVE_ENABLED}}
- **Project Folder**: {{DRIVE_FOLDER_URL}}
- **Documentation**: {{DRIVE_DOCS_URL}}
- **Templates**: {{DRIVE_TEMPLATES_URL}}
{{/if}}

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

## License

{{LICENSE}}
```

---

### .gitignore Template

```gitignore
# Dependencies
node_modules/
venv/
__pycache__/
*.pyc

# Build outputs
dist/
build/
*.js.map
*.d.ts.map

# Environment files
.env
.env.local
.env.*.local
*.env

# Credentials
credentials.json
token.json
service-account.json
*-key.json
*.pem

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db
desktop.ini

# Logs
*.log
logs/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Cache
.cache/
.temp/
.tmp/

# Test coverage
coverage/
.nyc_output/

# Misc
*.bak
*.backup
*.old
```

---

### package.json Template (TypeScript MCP)

```json
{
  "name": "{{PROJECT_NAME}}",
  "version": "0.1.0",
  "description": "{{DESCRIPTION}}",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc && chmod +x dist/index.js",
    "dev": "tsx src/index.ts",
    "watch": "tsc --watch",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "clean": "rm -rf dist"
  },
  "keywords": [
    "mcp",
    "{{PROJECT_KEYWORDS}}"
  ],
  "author": "{{AUTHOR}}",
  "license": "MIT",
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.4"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "typescript": "^5.8.3",
    "tsx": "^4.19.2",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.14",
    "ts-jest": "^29.2.5",
    "eslint": "^9.0.0",
    "@typescript-eslint/parser": "^8.0.0",
    "@typescript-eslint/eslint-plugin": "^8.0.0"
  }
}
```

---

### tsconfig.json Template

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

---

### .env.example Template

```bash
# Environment Configuration
# Generated: {{DATE}}
# Project: {{PROJECT_NAME}}

# Project Information
PROJECT_NAME={{PROJECT_NAME}}
NODE_ENV=development

# Google Workspace Configuration
{{#if DRIVE_ENABLED}}
GOOGLE_SERVICE_ACCOUNT_KEY_PATH=/Users/mmaruthurnew/Desktop/medical-patient-data/google-workspace-oauth-setup/service-account.json
GOOGLE_OAUTH_CREDENTIALS_PATH=/Users/mmaruthurnew/Desktop/medical-patient-data/google-workspace-oauth-setup/credentials.json
GOOGLE_OAUTH_TOKEN_PATH=/Users/mmaruthurnew/Desktop/medical-patient-data/google-workspace-oauth-setup/token.json

# Google Drive Folder IDs (Auto-generated)
DRIVE_PROJECT_FOLDER_ID={{DRIVE_PROJECT_FOLDER_ID}}
DRIVE_DOCS_FOLDER_ID={{DRIVE_DOCS_FOLDER_ID}}
DRIVE_TEMPLATES_FOLDER_ID={{DRIVE_TEMPLATES_FOLDER_ID}}
DRIVE_OUTPUT_FOLDER_ID={{DRIVE_OUTPUT_FOLDER_ID}}
{{/if}}

# Database (if applicable)
# DATABASE_URL=

# API Keys (if applicable)
# API_KEY=
# API_SECRET=

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/{{PROJECT_NAME}}.log

# Feature Flags
# FEATURE_X_ENABLED=false
```

---

### .env Template (actual file)

```bash
# Environment Configuration
# Generated: {{DATE}}
# Project: {{PROJECT_NAME}}
# WARNING: This file contains sensitive information. Never commit to git.

PROJECT_NAME={{PROJECT_NAME}}
NODE_ENV=development

{{#if DRIVE_ENABLED}}
GOOGLE_SERVICE_ACCOUNT_KEY_PATH=/Users/mmaruthurnew/Desktop/medical-patient-data/google-workspace-oauth-setup/service-account.json
GOOGLE_OAUTH_CREDENTIALS_PATH=/Users/mmaruthurnew/Desktop/medical-patient-data/google-workspace-oauth-setup/credentials.json
GOOGLE_OAUTH_TOKEN_PATH=/Users/mmaruthurnew/Desktop/medical-patient-data/google-workspace-oauth-setup/token.json

DRIVE_PROJECT_FOLDER_ID={{DRIVE_PROJECT_FOLDER_ID}}
DRIVE_DOCS_FOLDER_ID={{DRIVE_DOCS_FOLDER_ID}}
DRIVE_TEMPLATES_FOLDER_ID={{DRIVE_TEMPLATES_FOLDER_ID}}
DRIVE_OUTPUT_FOLDER_ID={{DRIVE_OUTPUT_FOLDER_ID}}
{{/if}}

LOG_LEVEL=info
LOG_FILE=./logs/{{PROJECT_NAME}}.log
```

---

## Google Drive Integration

When user requests Google Drive folder setup, the agent:

### Step 1: Create Folder Structure
```
Project Name/
├── docs/
├── templates/
├── output/
└── README.txt
```

### Step 2: Set Permissions
- Share project folder with service account (automation@ssdspc.com)
- Set role: "writer" or "editor"
- Share with user account if specified

### Step 3: Get Folder IDs
- Extract folder IDs from Drive API responses
- Store in variables for .env generation

### Step 4: Add to .env
- Update .env with all folder IDs
- Provide folder URLs in output

### Step 5: Create Drive README
```
Project: {{PROJECT_NAME}}
Created: {{DATE}}

This folder contains materials for {{PROJECT_NAME}}.

Structure:
- docs/ - Project documentation
- templates/ - Reusable templates
- output/ - Generated materials

Access:
- Service account: automation@ssdspc.com
- Owner: {{USER_EMAIL}}

For questions, see: [project README link]
```

### Example Output
```
Google Drive Setup Complete!

Project Folder: https://drive.google.com/drive/folders/1ABC...
├── docs/: https://drive.google.com/drive/folders/1DEF...
├── templates/: https://drive.google.com/drive/folders/1GHI...
└── output/: https://drive.google.com/drive/folders/1JKL...

Folder IDs added to .env:
- DRIVE_PROJECT_FOLDER_ID=1ABC...
- DRIVE_DOCS_FOLDER_ID=1DEF...
- DRIVE_TEMPLATES_FOLDER_ID=1GHI...
- DRIVE_OUTPUT_FOLDER_ID=1JKL...
```

---

## Example Prompts

### Example 1: MCP Server Project
**User**: "Create a new MCP server project for Gmail integration"

**Agent Actions**:
1. Ask clarifying questions:
   - Project name suggestion: `gmail-automation-mcp`
   - Confirm TypeScript
   - Confirm Google Drive folders needed
   - Confirm git initialization
2. Create development structure at `development/mcp-servers/gmail-automation-mcp/`
3. Generate all MCP boilerplate files
4. Create Google Drive folders
5. Initialize git repository
6. Run `npm install`
7. Create initial commit

**Output**:
```
✓ Project created: gmail-automation-mcp
✓ Location: /Users/mmaruthurnew/Desktop/medical-patient-data/development/mcp-servers/gmail-automation-mcp
✓ Structure: MCP Server (template-first pattern)
✓ Google Drive: https://drive.google.com/drive/folders/...
✓ Git initialized with initial commit
✓ Dependencies installed

Next steps:
1. cd development/mcp-servers/gmail-automation-mcp
2. Review README.md for project overview
3. Edit src/index.ts to add tools
4. Run `npm run dev` to test
5. See DEPLOYMENT-GUIDE.md for production deployment
```

---

### Example 2: 8-Folder Implementation Project
**User**: "Set up an 8-folder structure for the patient portal project"

**Agent Actions**:
1. Ask questions:
   - Project name: `patient-portal-integration`
   - Location: `Implementation Projects/`
   - Google Drive: yes
   - Git: yes
2. Create 8-folder structure
3. Generate README.md in each folder
4. Create root README.md
5. Create Google Drive folder structure
6. Initialize git
7. Create .gitignore

**Output**:
```
✓ Project created: patient-portal-integration
✓ Location: /Users/mmaruthurnew/Desktop/medical-patient-data/Implementation Projects/patient-portal-integration
✓ Structure: 8-folder standard
✓ Folders: 8 main folders + 23 subfolders created
✓ Google Drive: https://drive.google.com/drive/folders/...
✓ Git initialized

Folder structure:
01-project-overview/
02-goals-and-roadmap/
03-architecture-and-design/
04-implementation/
05-testing-and-validation/
06-deployment-and-release/
07-operations-and-monitoring/
08-archive/

Next steps:
1. Review README.md for project overview
2. Update 01-project-overview/PROJECT-CHARTER.md
3. Define goals in 02-goals-and-roadmap/GOALS.md
4. Begin planning phase
```

---

### Example 3: Research Project
**User**: "Initialize a research project with Drive folders for the diabetes study"

**Agent Actions**:
1. Ask questions:
   - Project name: `diabetes-data-analysis`
   - Structure: 4-folder (simplified for research)
   - Location: `projects-in-development/`
   - Language: Python
   - Drive folders: yes
2. Create 4-folder structure
3. Generate Python-specific boilerplate
4. Create Google Drive folders
5. Initialize git

**Output**:
```
✓ Project created: diabetes-data-analysis
✓ Location: /Users/mmaruthurnew/Desktop/medical-patient-data/projects-in-development/diabetes-data-analysis
✓ Structure: 4-folder simplified
✓ Language: Python
✓ Google Drive: https://drive.google.com/drive/folders/...
✓ Git initialized

Files created:
- README.md
- requirements.txt
- .gitignore (Python)
- .env
- planning-and-design/README.md
- implementation/main.py
- testing-and-docs/TEST-PLAN.md

Next steps:
1. Set up Python virtual environment: python -m venv venv
2. Activate: source venv/bin/activate
3. Install dependencies: pip install -r requirements.txt
4. Review planning-and-design/REQUIREMENTS.md
5. Begin data analysis in implementation/
```

---

### Example 4: Quick Prototype
**User**: "Bootstrap a TypeScript project for email automation"

**Agent Actions**:
1. Minimal questions (fast setup):
   - Project name: `email-automation`
   - Type: Tool (not full MCP)
   - Structure: 4-folder
   - Drive: no
   - Git: yes
2. Create structure
3. Generate TypeScript boilerplate
4. Initialize git

**Output**:
```
✓ Project created: email-automation
✓ Location: /Users/mmaruthurnew/Desktop/medical-patient-data/projects-in-development/email-automation
✓ Structure: 4-folder simplified
✓ Language: TypeScript
✓ Git initialized

Quick start:
npm install
npm run dev

Project ready for rapid development!
```

---

### Example 5: 4-Folder Quick Project
**User**: "Create a 4-folder project for quick prototyping"

**Agent Actions**:
1. Ask minimal questions:
   - Project name
   - Language (default: TypeScript)
2. Create 4-folder structure
3. Generate minimal boilerplate
4. Initialize git

**Output**:
```
✓ 4-folder structure created
✓ Minimal boilerplate generated
✓ Ready for rapid prototyping
```

---

### Example 6: Implementation with Full Setup
**User**: "Set up a new implementation project with git and Google Drive"

**Agent Actions**:
1. Full setup with all options
2. Create 8-folder or 4-folder based on preference
3. Full Drive integration
4. Git initialization with proper .gitignore

---

### Example 7: MCP Project from Template
**User**: "Generate project structure for email automation MCP"

**Agent Actions**:
1. Use MCP template structure
2. Follow template-first pattern
3. Create development/, production/, and template/ copies
4. Configure for dual-environment deployment

---

### Example 8: Testing Project
**User**: "Create a project for testing the new compliance features"

**Agent Actions**:
1. Suggest 4-folder structure (testing-focused)
2. Create test-specific folders and files
3. Add testing frameworks to package.json
4. Include test data directories

---

## Expected Outputs

After successful project setup, the agent provides:

### 1. Project Path
```
Project created at:
/Users/mmaruthurnew/Desktop/medical-patient-data/[category]/[project-name]
```

### 2. Folder Structure Confirmation
```
Created folder structure:
✓ 01-project-overview/
✓ 02-goals-and-roadmap/
✓ 03-architecture-and-design/
✓ 04-implementation/
  ✓ src/
  ✓ tests/
  ✓ scripts/
✓ 05-testing-and-validation/
✓ 06-deployment-and-release/
✓ 07-operations-and-monitoring/
✓ 08-archive/
```

### 3. Generated Files List
```
Created files:
✓ README.md
✓ .gitignore
✓ .env
✓ .env.example
✓ package.json
✓ tsconfig.json
✓ 01-project-overview/README.md
✓ 01-project-overview/PROJECT-CHARTER.md
✓ 02-goals-and-roadmap/GOALS.md
✓ 04-implementation/src/index.ts
... [full list]
```

### 4. Google Drive Folder Links
```
Google Drive folders created:
✓ Project: https://drive.google.com/drive/folders/1ABC...
  ✓ docs/: https://drive.google.com/drive/folders/1DEF...
  ✓ templates/: https://drive.google.com/drive/folders/1GHI...
  ✓ output/: https://drive.google.com/drive/folders/1JKL...

Folder IDs saved to .env:
  DRIVE_PROJECT_FOLDER_ID=1ABC...
  DRIVE_DOCS_FOLDER_ID=1DEF...
  DRIVE_TEMPLATES_FOLDER_ID=1GHI...
  DRIVE_OUTPUT_FOLDER_ID=1JKL...
```

### 5. Git Repository Status
```
Git repository initialized:
✓ .gitignore created
✓ Initial commit: "Initial project structure"
✓ Branch: main

To add remote:
git remote add origin [repo-url]
git push -u origin main
```

### 6. Next Steps Recommendations
```
Next steps:
1. Review README.md for project overview
2. Update .env with your configuration
3. Install dependencies: npm install
4. Review 01-project-overview/PROJECT-CHARTER.md
5. Define goals in 02-goals-and-roadmap/GOALS.md
6. Begin planning in planning documents
7. (For MCP) See DEPLOYMENT-GUIDE.md for deployment to production

Quick commands:
cd [project-path]
npm install
npm run dev
```

---

## Post-Setup Tasks

After creating project, the agent automatically performs:

### 1. Add to Workspace Manifest (if applicable)
- Update workspace tracking files
- Add to project registry
- Update Quick Lookup Table

### 2. Create Quick Lookup Table Entry
```markdown
| Project | Location | Type | Status | Drive | Repo |
|---------|----------|------|--------|-------|------|
| {{PROJECT_NAME}} | {{PATH}} | {{TYPE}} | Planning | [Link]({{DRIVE_URL}}) | [Repo]({{REPO_URL}}) |
```

### 3. Initialize Git Repository
```bash
cd [project-path]
git init
git add .
git commit -m "Initial project structure for {{PROJECT_NAME}}

Generated by project-setup agent
Structure: {{STRUCTURE_TYPE}}
Language: {{LANGUAGE}}
Created: {{DATE}}"
```

### 4. Install Dependencies
```bash
# For Node.js projects
npm install

# For Python projects
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 5. Run Initial Build
```bash
# For TypeScript projects
npm run build

# Verify compilation successful
```

### 6. Open in VS Code (optional)
```bash
code [project-path]
```

---

## Best Practices

### Before Creating Project

1. **Always ask clarifying questions**
   - Don't assume project type or structure
   - Confirm Google Drive needs
   - Verify git initialization preference
   - Ask about language/framework

2. **Verify project name doesn't already exist**
   ```bash
   # Check all possible locations
   find /Users/mmaruthurnew/Desktop/medical-patient-data \
     -maxdepth 3 -name "{{PROJECT_NAME}}" -type d
   ```

3. **Use consistent naming conventions**
   - Always kebab-case: `my-project-name`
   - No spaces or special characters
   - Descriptive but concise
   - Include context: `gmail-automation-mcp` not `automation`

4. **Validate location**
   - MCP → `development/mcp-servers/`
   - Implementation → `Implementation Projects/`
   - Research → `projects-in-development/`
   - Don't create in wrong location

### During Creation

5. **Create .gitignore before git init**
   - Prevents accidental commits of sensitive files
   - Include .env, credentials, node_modules

6. **Test that all generated files are valid**
   - JSON files parse correctly
   - TypeScript compiles
   - No syntax errors in templates

7. **Create complete .env.example**
   - Document all required variables
   - Provide example values
   - Include comments explaining each variable

8. **Follow template-first pattern for MCPs**
   - Create template version first
   - Then create development instance
   - Keep template and development in sync

### After Creation

9. **Provide clear next steps**
   - Don't just create and walk away
   - Give specific commands to run
   - Link to relevant documentation
   - Suggest first tasks to complete

10. **Verify structure is correct**
    - All folders created
    - All files generated
    - No missing dependencies
    - No broken references

11. **Test basic operations**
    - Git commands work
    - Dependencies install
    - Build succeeds (for compiled languages)
    - No immediate errors

12. **Document what was created**
    - Update workspace index if exists
    - Add to project list
    - Create entry in Quick Lookup Table

### General Guidelines

13. **Be consistent across all projects**
    - Same folder names
    - Same file naming conventions
    - Same documentation structure
    - Same environment variable naming

14. **Make templates workspace-agnostic**
    - No hardcoded paths
    - Use environment variables
    - Include setup instructions
    - Self-contained where possible

15. **Include helpful comments in generated files**
    - Explain configuration options
    - Link to documentation
    - Provide examples
    - Note security considerations

---

## Project Templates Reference

### MCP Template
**Based on**: `google-workspace-materials-project`

**Key Features**:
- Full MCP SDK integration
- TypeScript configuration
- Test framework setup
- Documentation templates
- Deployment scripts
- Template-first pattern compliance

**Location**: `/Users/mmaruthurnew/Desktop/medical-patient-data/development/mcp-servers/google-workspace-materials-project`

### Implementation Template
**Based on**: `google-sheets-version-control` (if exists)

**Key Features**:
- 8-folder structure
- Google Workspace integration
- Version control patterns
- Testing framework
- Deployment pipeline

### Research Template
**Pattern**: Simple structure

**Structure**:
```
research-project/
├── planning/
├── data/
├── analysis/
├── results/
└── README.md
```

**Best For**: Quick research, data analysis, experiments

---

## Error Handling

### Common Issues

**Issue**: Project name already exists
**Solution**: Suggest alternative name with suffix (e.g., `project-name-v2`, `project-name-new`)

**Issue**: Invalid project name (spaces, special chars)
**Solution**: Auto-convert to kebab-case and confirm with user

**Issue**: Google Drive folder creation fails
**Solution**:
1. Check service account credentials
2. Verify Drive API enabled
3. Try manual folder creation
4. Provide folder IDs for manual setup

**Issue**: Git initialization fails
**Solution**:
1. Check if git is installed
2. Verify directory permissions
3. Provide manual git commands

**Issue**: npm install fails
**Solution**:
1. Check Node.js version
2. Clear npm cache
3. Try with --legacy-peer-deps
4. Provide error details for debugging

---

## Version History

**v1.0.0** (2025-11-15)
- Initial agent specification
- Support for 8-folder, 4-folder, and MCP structures
- Google Drive integration
- Comprehensive boilerplate generation
- Post-setup automation

---

**Last Updated**: 2025-11-15
**Maintained By**: Workspace automation team
**Status**: Active

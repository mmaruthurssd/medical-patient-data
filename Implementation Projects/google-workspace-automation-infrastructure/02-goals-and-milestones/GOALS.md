# Project Goals: Google Workspace Automation Infrastructure

**Project:** Google Workspace Automation Infrastructure
**Created:** 2025-11-08
**Last Updated:** 2025-11-08 (Updated: Integration approach with existing GitHub system)
**Status:** Active

---

## Goal Hierarchy

```
Primary Goal: Build Google Workspace Automation Infrastructure
    │
    ├─> Authentication Foundation
    │   ├─ Create automation account
    │   ├─ Configure OAuth 2.0
    │   ├─ Test API access
    │   └─ Migrate GitHub system to automation@ account
    │
    ├─> Gemini API Integration
    │   ├─ Obtain API key
    │   ├─ Test connectivity
    │   └─ Validate HIPAA compliance
    │
    ├─> Google Drive Integration
    │   ├─ Implement Drive API wrapper
    │   ├─ Test read/write operations
    │   ├─ Configure bidirectional sync
    │   └─ Unify sheet registries (GitHub + new)
    │
    ├─> Apps Script Deployment (Integration with existing GitHub system)
    │   ├─ Install clasp CLI
    │   ├─ Use existing GitHub registry (237 sheets)
    │   ├─ Enhance existing deployment scripts with bulk mode
    │   └─ Upgrade snapshot system with Gemini AI
    │
    └─> Combined Workflows
        ├─ Integrate Gemini + Drive/Sheets
        ├─ Build patient workflows
        └─ Deploy to production
```

---

## Phase 1: Authentication Foundation

### Goal 1.1: Create Automation Account
**Status:** 🚧 In Progress
**Priority:** Critical
**Timeline:** Week 1

**Objective:**
Create dedicated `automation@ssdsbc.com` account with proper permissions for all Google Workspace automation.

**Success Criteria:**
- [ ] Account created in Google Workspace
- [ ] Strong password set (stored in password manager)
- [ ] 2FA enabled (backup codes saved)
- [ ] Added as **Manager** to all Shared Drives (not just Content Manager)
- [ ] Account can access all 240+ Google Sheets
- [ ] Credentials documented and secured

**Impact:** BLOCKING - All other phases depend on this
**Effort:** 30 minutes
**Dependencies:** Google Workspace Admin access

---

### Goal 1.2: Set Up Google Cloud Project
**Status:** 🚧 Not Started
**Priority:** Critical
**Timeline:** Week 1

**Objective:**
Create and configure Google Cloud Project with all required APIs enabled.

**Success Criteria:**
- [ ] GCP project created: "Google Sheets Automation"
- [ ] Project ID documented
- [ ] Google Drive API enabled
- [ ] Google Sheets API enabled
- [ ] Google Apps Script API enabled
- [ ] APIs verified in dashboard

**Impact:** BLOCKING - Required for OAuth and all API access
**Effort:** 1 hour
**Dependencies:** Goal 1.1 (automation account must exist)

---

### Goal 1.3: Configure OAuth 2.0 Credentials
**Status:** 🚧 Not Started
**Priority:** Critical
**Timeline:** Week 1

**Objective:**
Configure OAuth 2.0 for authentication to Google Workspace APIs.

**Success Criteria:**
- [ ] OAuth consent screen configured (Internal app)
- [ ] OAuth client ID created (Desktop app type)
- [ ] credentials.json downloaded
- [ ] credentials.json added to .gitignore
- [ ] GCP project trusted in Workspace Admin
- [ ] Test authentication successful

**Impact:** BLOCKING - Required for all API operations
**Effort:** 1-2 hours
**Dependencies:** Goal 1.2 (GCP project must exist)

---

### Goal 1.4: Test API Access
**Status:** 🚧 Not Started
**Priority:** High
**Timeline:** Week 1

**Objective:**
Verify authentication works for all required Google Workspace APIs.

**Success Criteria:**
- [ ] Can authenticate with Drive API
- [ ] Can authenticate with Sheets API
- [ ] Can authenticate with Apps Script API
- [ ] Shared Drive flags working (no 404 errors)
- [ ] Can list files in Shared Drives
- [ ] Can read/write to test spreadsheet

**Impact:** Validation of authentication infrastructure
**Effort:** 2 hours
**Dependencies:** Goal 1.3 (OAuth configured)

---

### Goal 1.5: Migrate GitHub Version Control to automation@ Account
**Status:** 🚧 Not Started
**Priority:** Critical
**Timeline:** Week 2

**Objective:**
Migrate existing GitHub version control system (ssd-google-sheets-staging-production) from personal account to automation@ account.

**Success Criteria:**
- [ ] clasp re-authenticated with automation@ssdsbc.com
- [ ] GitHub Actions secrets updated (CLASP_TOKEN)
- [ ] Existing deployment scripts tested with new account
- [ ] Rollback scripts tested with new account
- [ ] Snapshot system verified working
- [ ] No permission errors on existing 237 sheets
- [ ] Daily snapshot at 9 AM runs successfully

**Impact:** CRITICAL - Unifies all automation under single account
**Effort:** 3 hours
**Dependencies:** Goal 1.4 (API access verified)

**Notes:**
- Existing system: ~/Desktop/ssd-google-sheets-staging-production
- GitHub: https://github.com/mmaruthurssd/ssd-google-sheets-staging-production
- Currently using personal account credentials
- See GITHUB-INTEGRATION-GUIDE.md Section 3 for migration procedure

---

## Phase 2: Gemini API Integration

### Goal 2.1: Obtain Gemini API Key
**Status:** ⏸️ Paused (waiting for user)
**Priority:** Critical
**Timeline:** Week 2

**Objective:**
Obtain Gemini API key from Google AI Studio for HIPAA-compliant AI operations.

**Success Criteria:**
- [ ] Google AI Studio accessed
- [ ] API key created in GCP project with BAA coverage
- [ ] API key copied and secured
- [ ] API key stored in .env file (gitignored)
- [ ] API key never committed to Git
- [ ] Rotation schedule documented (90 days)

**Impact:** BLOCKING - Required for all Gemini operations
**Effort:** 15 minutes
**Dependencies:** Goal 1.2 (GCP project needed)

**Notes:** User needs to provide API key when ready

---

### Goal 2.2: Configure Environment
**Status:** ⏸️ Paused (waiting for API key)
**Priority:** Critical
**Timeline:** Week 2

**Objective:**
Configure .env file and environment for Gemini integration.

**Success Criteria:**
- [ ] .env file created from .env.example
- [ ] GEMINI_API_KEY configured
- [ ] GOOGLE_CLOUD_PROJECT configured
- [ ] NODE_ENV configured
- [ ] Environment variables loaded correctly
- [ ] .env file in .gitignore

**Impact:** Required for Gemini connectivity
**Effort:** 15 minutes
**Dependencies:** Goal 2.1 (API key needed)

---

### Goal 2.3: Test Gemini Connectivity
**Status:** ⏸️ Paused (waiting for API key)
**Priority:** Critical
**Timeline:** Week 2

**Objective:**
Test basic Gemini API connectivity and response.

**Success Criteria:**
- [ ] npm run test executes successfully
- [ ] Gemini API responds with test completion
- [ ] No authentication errors
- [ ] Response time acceptable (< 5 seconds)
- [ ] Error handling works

**Impact:** Validation of Gemini integration
**Effort:** 30 minutes
**Dependencies:** Goal 2.2 (environment configured)

---

### Goal 2.4: Validate Patient Inquiry Classifier
**Status:** ⏸️ Paused (waiting for API key)
**Priority:** High
**Timeline:** Week 2

**Objective:**
Test HIPAA-compliant patient inquiry classification workflow.

**Success Criteria:**
- [ ] npm run classify executes successfully
- [ ] Classifies routine appointment requests
- [ ] Classifies urgent medical concerns
- [ ] Classifies administrative questions
- [ ] Audit logging works for each classification
- [ ] PHI handling validated
- [ ] No PHI leakage detected

**Impact:** Validates core patient workflow
**Effort:** 1 hour
**Dependencies:** Goal 2.3 (Gemini connectivity)

---

### Goal 2.5: Test De-identification Utilities
**Status:** ⏸️ Paused (waiting for API key)
**Priority:** High
**Timeline:** Week 2

**Objective:**
Validate PHI de-identification using Safe Harbor method.

**Success Criteria:**
- [ ] npm run deidentify executes successfully
- [ ] Removes all 18 HIPAA identifiers
- [ ] Mask PHI works (partial redaction)
- [ ] Detect PHI in text works
- [ ] Validate Safe Harbor compliance
- [ ] Test with synthetic PHI data

**Impact:** HIPAA compliance validation
**Effort:** 1 hour
**Dependencies:** Goal 2.3 (Gemini connectivity)

---

## Phase 3: Google Drive Integration

### Goal 3.1: Implement Drive API Wrapper
**Status:** 🚧 Not Started
**Priority:** High
**Timeline:** Week 3

**Objective:**
Create reusable Drive API wrapper with automatic Shared Drive flags.

**Success Criteria:**
- [ ] Drive API client created
- [ ] Shared Drive flags automatically applied
- [ ] List files in Shared Drive working
- [ ] Read file content working
- [ ] Write file content working
- [ ] Create/delete files working
- [ ] Error handling comprehensive

**Impact:** Foundation for all Drive operations
**Effort:** 4 hours
**Dependencies:** Goal 1.4 (API access tested)

---

### Goal 3.2: Test Read/Write Operations
**Status:** 🚧 Not Started
**Priority:** High
**Timeline:** Week 3

**Objective:**
Validate Drive API operations on production Shared Drives.

**Success Criteria:**
- [ ] Can list all files in Prior Auth Drive
- [ ] Can read spreadsheet metadata
- [ ] Can write test file to Shared Drive
- [ ] Can update existing file
- [ ] Can delete test file
- [ ] No permission errors
- [ ] No 404 errors on Shared Drive operations

**Impact:** Validates Drive integration
**Effort:** 2 hours
**Dependencies:** Goal 3.1 (wrapper implemented)

---

### Goal 3.3: Configure Bidirectional Sync
**Status:** 🚧 Not Started
**Priority:** Medium
**Timeline:** Week 4

**Objective:**
Enable bidirectional sync between local files and Google Drive.

**Success Criteria:**
- [ ] Upload local file to Drive working
- [ ] Download Drive file to local working
- [ ] Sync detects file changes
- [ ] Conflict resolution implemented
- [ ] Sync status tracked
- [ ] PHI Guard integration tested

**Impact:** Enables file management workflows
**Effort:** 6 hours
**Dependencies:** Goal 3.2 (read/write tested)

---

### Goal 3.4: Unify Sheet Registries
**Status:** 🚧 Not Started
**Priority:** Critical
**Timeline:** Week 4

**Objective:**
Merge existing GitHub registry (237 sheets) with new sheets discovered, creating single unified registry.

**Success Criteria:**
- [ ] Load existing GitHub registry (~/Desktop/ssd-google-sheets-staging-production/config/sheet-registry.json)
- [ ] Scan all Shared Drives for additional sheets
- [ ] Identify 3 missing sheets (240 - 237 = 3 discrepancy)
- [ ] Merge registries with duplicate detection
- [ ] Resolve conflicts (prefer GitHub registry data for existing sheets)
- [ ] Validate unified registry (spot check 30 sheets)
- [ ] Update all scripts to use unified registry location
- [ ] Commit unified registry to both repositories

**Impact:** BLOCKING - Required for complete deployment coverage
**Effort:** 6 hours
**Dependencies:** Goal 1.5 (GitHub system migrated), Goal 3.1 (Drive API wrapper)

**Notes:**
- GitHub registry: 237 sheets currently tracked
- Expected total: 240+ sheets
- Unification script: scripts/unify-registries.js (to be created in Task #5)
- See GITHUB-INTEGRATION-GUIDE.md Section 4 for registry unification strategy

---

## Phase 4: Apps Script Deployment

### Goal 4.1: Install and Configure clasp CLI
**Status:** 🚧 Not Started
**Priority:** High
**Timeline:** Week 5

**Objective:**
Install clasp CLI and authenticate with automation account.

**Success Criteria:**
- [ ] clasp installed globally (npm install -g @google/clasp)
- [ ] clasp login completed with automation@ssdsbc.com
- [ ] .clasp.json created for test project
- [ ] clasp pull works from test script
- [ ] clasp push works to test script
- [ ] No permission errors

**Impact:** Enables Apps Script deployment
**Effort:** 1 hour
**Dependencies:** Goal 1.3 (OAuth configured)

---

### Goal 4.2: Verify and Validate Unified Registry
**Status:** 🚧 Not Started
**Priority:** Critical
**Timeline:** Week 5

**Objective:**
Use existing unified registry (from Goal 3.4) and validate completeness for deployment.

**Success Criteria:**
- [ ] Unified registry loaded successfully
- [ ] All 240+ sheets accounted for
- [ ] Script IDs verified for each sheet
- [ ] No missing or invalid entries
- [ ] Registry structure validated against schema
- [ ] Spot check 30 random sheets for accuracy
- [ ] All sheets accessible with automation@ account

**Impact:** BLOCKING for bulk deployment
**Effort:** 2 hours (reduced from 8 hours - using existing registry)
**Dependencies:** Goal 3.4 (registries unified)

**Notes:**
- Uses unified registry created in Goal 3.4
- Existing GitHub registry has 237 verified sheets
- No need to rebuild - only verify and validate
- Registry location: config/sheet-registry.json (unified)

---

### Goal 4.3: Test Single Sheet Deployment
**Status:** 🚧 Not Started
**Priority:** High
**Timeline:** Week 5

**Objective:**
Test pull/push workflow on single pilot sheet.

**Success Criteria:**
- [ ] Pull code from pilot sheet
- [ ] All files downloaded correctly
- [ ] Make test change
- [ ] Push code back to sheet
- [ ] Sheet functions correctly after push
- [ ] Backup created before push
- [ ] No data loss

**Impact:** Validates deployment workflow
**Effort:** 2 hours
**Dependencies:** Goal 4.1 (clasp configured)

---

### Goal 4.4: Enhance Deployment Scripts with Bulk Mode
**Status:** 🚧 Not Started
**Priority:** Critical
**Timeline:** Week 6

**Objective:**
Add bulk deployment mode to existing GitHub deployment scripts (deploy-to-production.sh).

**Success Criteria:**
- [ ] Existing deploy-to-production.sh enhanced with --bulk flag
- [ ] Reads from unified registry
- [ ] Parallel processing working (5 concurrent)
- [ ] Progress tracking visible
- [ ] Existing error handling preserved
- [ ] Existing rollback capability preserved
- [ ] Dry-run mode working (--dry-run flag)
- [ ] Backward compatibility maintained (single sheet deployment unchanged)

**Impact:** Core automation capability
**Effort:** 4 hours (reduced from 10 hours - enhancing existing scripts)
**Dependencies:** Goal 4.2 (registry validated), Goal 4.3 (single sheet tested)

**Notes:**
- Existing scripts: ~/Desktop/ssd-google-sheets-staging-production/scripts/
- Keep single-sheet deployment unchanged (proven, stable)
- Add bulk mode as optional enhancement
- See GITHUB-INTEGRATION-GUIDE.md Section 5 for enhancement approach
- Examples:
  - Single sheet (unchanged): ./scripts/deploy-to-production.sh "D25-264_Prior_Auth_V3"
  - Bulk mode (new): ./scripts/deploy-to-production.sh --bulk --all

---

### Goal 4.5: Test Bulk Deployment
**Status:** 🚧 Not Started
**Priority:** Critical
**Timeline:** Week 6

**Objective:**
Validate bulk deployment on all 240+ sheets.

**Success Criteria:**
- [ ] Pilot test with 20 sheets successful
- [ ] All 240+ sheets deployed successfully
- [ ] Deployment completes in < 2 hours
- [ ] Success rate > 95%
- [ ] No permission errors
- [ ] Failed sheets identified and retried
- [ ] All sheets function correctly after deployment

**Impact:** Production readiness validation
**Effort:** 4 hours
**Dependencies:** Goal 4.4 (bulk deployment enhanced)

---

### Goal 4.6: Enhance Snapshot System with Gemini AI
**Status:** 🚧 Not Started
**Priority:** High
**Timeline:** Week 6

**Objective:**
Upgrade existing daily snapshot system with Gemini-powered drift classification and twice-daily schedule.

**Success Criteria:**
- [ ] GitHub Actions workflow updated for twice-daily snapshots (9 AM + 5 PM ET)
- [ ] Gemini API integrated into drift detection
- [ ] AI classifies drift severity (low/medium/high/critical)
- [ ] AI classifies change type (documentation/formula/logic/trigger/permission)
- [ ] AI provides recommendations (accept/review/rollback)
- [ ] PHI risk assessment included in classification
- [ ] Multi-severity alerting implemented (Slack/email based on severity)
- [ ] HIPAA audit logging for all AI classifications
- [ ] Notification system respects severity levels

**Impact:** Intelligent drift detection and automated risk assessment
**Effort:** 6 hours
**Dependencies:** Goal 2.3 (Gemini connectivity), Goal 1.5 (GitHub system migrated)

**Notes:**
- Current snapshot: Once daily at 9 AM ET
- Enhanced: Twice daily (9 AM + 5 PM ET) with AI classification
- Gemini model: gemini-1.5-pro
- See GITHUB-INTEGRATION-GUIDE.md Section 6 for implementation details
- Classification response format:
  ```javascript
  {
    severity: "low|medium|high|critical",
    changeType: "documentation|formula|logic|trigger|permission|other",
    summary: "Brief human-readable summary",
    recommendation: "accept|review|rollback",
    reasoning: "Why this classification was chosen",
    phiRisk: "none|low|medium|high"
  }
  ```

---

## Phase 5: Combined Workflows

### Goal 5.1: Integrate Gemini + Drive/Sheets
**Status:** 🚧 Not Started
**Priority:** High
**Timeline:** Week 7

**Objective:**
Connect Gemini API with Google Drive and Sheets for patient workflows.

**Success Criteria:**
- [ ] Gemini can read from Google Sheets
- [ ] Gemini can write to Google Sheets
- [ ] Gemini can read from Google Drive
- [ ] Gemini can write to Google Drive
- [ ] Audit logging works for all operations
- [ ] PHI handling validated
- [ ] No PHI leakage

**Impact:** Enables AI-powered patient workflows
**Effort:** 6 hours
**Dependencies:** Goal 2.5 (Gemini tested), Goal 3.2 (Drive tested)

---

### Goal 5.2: Build Patient Workflow Automation
**Status:** 🚧 Not Started
**Priority:** High
**Timeline:** Week 7

**Objective:**
Implement end-to-end patient workflow using Gemini + Google Workspace.

**Success Criteria:**
- [ ] Read patient inquiry from Sheets
- [ ] Classify inquiry with Gemini
- [ ] Write classification result to Sheets
- [ ] Log audit trail to Drive
- [ ] De-identify PHI if needed
- [ ] Workflow completes in < 30 seconds
- [ ] HIPAA audit log generated

**Impact:** Production patient workflow
**Effort:** 8 hours
**Dependencies:** Goal 5.1 (integration complete)

---

### Goal 5.3: Production Deployment
**Status:** 🚧 Not Started
**Priority:** Critical
**Timeline:** Week 8

**Objective:**
Deploy combined workflows to production environment.

**Success Criteria:**
- [ ] Production .env configured
- [ ] Production sheets identified
- [ ] Deployment tested in staging
- [ ] Production deployment successful
- [ ] Monitoring configured
- [ ] Alerting configured
- [ ] Rollback plan documented

**Impact:** Go-live milestone
**Effort:** 4 hours
**Dependencies:** Goal 5.2 (workflow tested)

---

### Goal 5.4: Team Training and Handoff
**Status:** 🚧 Not Started
**Priority:** High
**Timeline:** Week 8

**Objective:**
Train team and hand off operational responsibility.

**Success Criteria:**
- [ ] Training presentation delivered
- [ ] Hands-on workshop completed
- [ ] All team members trained
- [ ] Documentation reviewed
- [ ] Runbooks created
- [ ] Support contacts documented
- [ ] Handoff to operations complete

**Impact:** Operational sustainability
**Effort:** 4 hours
**Dependencies:** Goal 5.3 (production deployed)

---

## Overall Success Metrics

### Quantitative Goals

| Metric | Current | Target | Achieved |
|--------|---------|--------|----------|
| **Permission errors per week** | 15-20 | 0 | ___ |
| **Deployment time (single sheet)** | 30+ min | < 5 min | ___ |
| **Deployment time (all 240 sheets)** | N/A | < 2 hours | ___ |
| **Deployment success rate** | ~80% | > 95% | ___ |
| **API authentication failures** | 5-10/week | 0 | ___ |
| **PHI audit log compliance** | Manual | 100% automated | ___ |
| **Team members trained** | 1 | 3+ | ___ |

### Qualitative Goals

**Developer Experience:**
- [ ] "I can deploy to any sheet without permission issues"
- [ ] "OAuth setup was straightforward"
- [ ] "Documentation is clear and helpful"
- [ ] "I can troubleshoot issues independently"

**HIPAA Compliance:**
- [ ] "All PHI operations are logged"
- [ ] "De-identification utilities are validated"
- [ ] "No PHI leakage detected"
- [ ] "Audit trail meets HIPAA requirements"

**Operational Excellence:**
- [ ] "Bulk deployments are reliable"
- [ ] "Rollback procedures work"
- [ ] "Monitoring provides visibility"
- [ ] "Maintenance overhead is minimal"

---

## Integration Approach - Effort Savings

**Strategy Change:** After discovering the existing GitHub version control system (ssd-google-sheets-staging-production) with 237 sheets, deployment scripts, and daily snapshots already operational, we shifted from "build from scratch" to "integrate and enhance" approach.

**Key Integration Points:**
1. **Existing GitHub System** (~/Desktop/ssd-google-sheets-staging-production)
   - 237 production sheets tracked
   - DEV/PROD staging workflow operational
   - Deployment/rollback scripts proven
   - Daily snapshots at 9 AM ET code-complete

2. **Integration Goals Added:**
   - Goal 1.5: Migrate GitHub system to automation@ account
   - Goal 3.4: Unify sheet registries (237 + 3 missing = 240)

3. **Goals Modified:**
   - Goal 4.2: Changed from "Build Sheet Registry" (8 hours) to "Verify Unified Registry" (2 hours)
   - Goal 4.4: Changed from "Implement Bulk Deployment" (10 hours) to "Enhance Existing Scripts" (4 hours)
   - Goal 4.6: Added "Enhance Snapshot System with Gemini AI" (6 hours)

**Total Effort Savings:** ~12 hours (from not rebuilding existing proven systems)

**Effort Reallocation:**
- Registry unification: 6 hours (Goal 3.4)
- Authentication migration: 3 hours (Goal 1.5)
- AI snapshot enhancement: 6 hours (Goal 4.6)
- **Net savings:** Still ~3 hours ahead despite new integration work

**Philosophy:** "Enhance, don't replace" - Keep proven workflows, add intelligence and capabilities.

**Reference:** See GITHUB-INTEGRATION-GUIDE.md for complete integration architecture and migration strategy.

---

## Goal Tracking

**Update Frequency:** Weekly (every Friday)
**Status Indicators:**
- ✅ Complete
- 🚧 In Progress
- ⏸️ Paused
- 🚫 Blocked
- ⏳ Not Started

**Next Review:** 2025-11-15
**Goal Owner:** Marvin Maruthur

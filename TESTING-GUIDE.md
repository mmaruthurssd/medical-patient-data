# Comprehensive Testing Guide
## Three-Workspace Ecosystem Testing Strategy

**Version:** 1.0.0
**Last Updated:** 2025-11-16
**Workspaces:** operations-workspace, mcp-infrastructure, medical-patient-data
**Production MCPs:** 26+
**Compliance:** HIPAA-compliant testing procedures

---

## Table of Contents

1. [Overview](#overview)
2. [Testing Philosophy](#testing-philosophy)
3. [Testing Stack](#testing-stack)
4. [Component Testing Strategies](#component-testing-strategies)
5. [Testing Checklists](#testing-checklists)
6. [Test Data Management](#test-data-management)
7. [Environment Testing](#environment-testing)
8. [Integration with Existing Systems](#integration-with-existing-systems)
9. [Troubleshooting](#troubleshooting)
10. [Appendix](#appendix)

---

## Overview

### Three-Workspace Architecture

This testing guide covers the following workspace structure:

```
Three-Workspace Ecosystem
├── operations-workspace (Primary development workspace)
│   ├── 26+ Production MCPs
│   ├── Development infrastructure
│   └── Testing frameworks
│
├── mcp-infrastructure (MCP development and templates)
│   ├── MCP server development
│   ├── Template repositories
│   └── Build and deployment tools
│
└── medical-patient-data (Production medical data)
    ├── Google Sheets version control
    ├── PHI audit logging
    ├── Staging environment (DEV3)
    └── HIPAA compliance systems
```

### Testing Objectives

1. **Quality Assurance:** Ensure all components meet standards before production
2. **Security Compliance:** Prevent credential/PHI exposure
3. **HIPAA Compliance:** Validate PHI handling and audit logging
4. **Integration Validation:** Verify MCP interactions work correctly
5. **Deployment Safety:** Test staging before production deployment

---

## Testing Philosophy

### Core Principles

1. **Test Early, Test Often**
   - Unit tests during development
   - Integration tests before MCP registration
   - Smoke tests after deployment

2. **Staging-First Deployment**
   - ALL changes go through DEV3 staging environment first
   - Never edit production directly
   - Production is READ-ONLY

3. **Progressive Quality Enforcement**
   - Standards validation at multiple checkpoints:
     - Git commit time (guidance)
     - Workflow completion (warnings)
     - MCP registration (blocking)
     - Production deployment (strict blocking)

4. **PHI Protection in Testing**
   - Use ONLY synthetic test data
   - Automated PHI scanning before commits
   - Test data follows naming conventions (TEST- prefix)

5. **Security-First Testing**
   - Credential scanning in CI/CD
   - Pre-commit hooks for security
   - Secrets management validation

---

## Testing Stack

### Testing Tools and MCPs

#### 1. Testing & Validation MCPs

| MCP | Purpose | Usage |
|-----|---------|-------|
| **testing-validation-mcp** | Execute unit/integration tests, validate implementations, quality gates | Primary testing orchestrator |
| **security-compliance-mcp** | Scan for credentials/PHI, manage secrets, pre-commit hooks | Security testing |
| **standards-enforcement-mcp** | Validate workspace standards, dual-environment, template-first | Standards compliance |
| **code-review-mcp** | Code quality analysis, complexity detection, technical debt | Code quality testing |
| **test-generator-mcp** | Generate unit/integration tests, coverage gap analysis | Test automation |

#### 2. Test Frameworks in Use

**JavaScript/TypeScript:**
- **Jest** - Unit testing framework
- **Supertest** - API integration testing
- **Mocha** - Alternative test framework (some legacy tests)

**Google Apps Script:**
- **Google Apps Script Test Suite** - Built-in testing
- **Manual testing in DEV3 environment** - Staging validation
- **QUnit** (where applicable) - Unit testing

**CI/CD:**
- **GitHub Actions** - Automated testing workflows
- **Gitleaks** - Credential scanning
- **Custom PHI scanner** - Protected Health Information detection

#### 3. Local Testing Tools

```bash
# Node.js testing
npm test                    # Run all tests
npm run test:unit           # Unit tests only
npm run test:integration    # Integration tests only
npm run coverage            # Generate coverage report

# MCP-specific testing
node scripts/test-mcp.js    # Test specific MCP
node scripts/validate.js    # Validate MCP compliance

# Security scanning
node scripts/scan-phi.js    # Scan for PHI
gitleaks detect             # Scan for credentials
```

#### 4. CI/CD Integration

**GitHub Actions Workflows:**

```
.github/workflows/
├── security-scan.yml           # PHI + credential scanning
├── test-drive-access.yml       # Google Drive access validation
├── daily-snapshots.yml         # Automated snapshot testing
├── backup-to-gcs.yml           # Backup testing
└── sync-docs-to-drive.yml      # Documentation sync testing
```

**Automated Testing Triggers:**
- Push to `main` branch
- Pull request creation
- Manual workflow dispatch
- Scheduled daily runs

---

## Component Testing Strategies

### 1. MCP Server Testing

#### Unit Testing

**Purpose:** Test individual MCP tool functions in isolation

**Framework:** Jest + TypeScript

**Example Structure:**
```
my-mcp-server/
├── src/
│   └── tools/
│       └── myTool.ts
└── tests/
    ├── unit/
    │   └── myTool.test.ts
    └── integration/
        └── myTool.integration.test.ts
```

**Unit Test Template:**
```typescript
// tests/unit/myTool.test.ts
import { myTool } from '../../src/tools/myTool';

describe('myTool', () => {
  describe('basic functionality', () => {
    it('should return expected result for valid input', () => {
      const result = myTool({ input: 'test' });
      expect(result).toEqual({ output: 'processed-test' });
    });

    it('should throw error for invalid input', () => {
      expect(() => myTool({ input: null }))
        .toThrow('Invalid input');
    });
  });

  describe('edge cases', () => {
    it('should handle empty input', () => {
      const result = myTool({ input: '' });
      expect(result).toEqual({ output: '' });
    });
  });
});
```

**Running Unit Tests:**
```bash
cd local-instances/mcp-servers/my-mcp/
npm run test:unit
```

#### Integration Testing

**Purpose:** Test MCP tools interacting with external services

**Framework:** Jest + Supertest (for APIs)

**Integration Test Template:**
```typescript
// tests/integration/myTool.integration.test.ts
import { myTool } from '../../src/tools/myTool';
import { mockExternalService } from '../mocks/externalService';

describe('myTool integration', () => {
  beforeAll(async () => {
    // Setup test environment
    await setupTestEnvironment();
  });

  afterAll(async () => {
    // Cleanup
    await cleanupTestEnvironment();
  });

  it('should integrate with external service', async () => {
    mockExternalService.mockReturnValue({ success: true });

    const result = await myTool({
      input: 'test',
      useExternalService: true
    });

    expect(result.success).toBe(true);
    expect(mockExternalService).toHaveBeenCalled();
  });
});
```

**Running Integration Tests:**
```bash
npm run test:integration
```

#### Smoke Testing

**Purpose:** Quick validation that MCP is functional after deployment

**Using testing-validation-mcp:**
```javascript
// Call via MCP tool
mcp__testing-validation__run_smoke_tests({
  mcpPath: '/path/to/mcp-server',
  tools: ['tool1', 'tool2'] // Optional: test specific tools
})
```

**Manual Smoke Test:**
```bash
# Test MCP server starts correctly
cd local-instances/mcp-servers/my-mcp/
npm run build
node dist/index.js

# Test basic tool invocation
# (Use Claude Code to call a simple tool)
```

#### MCP Quality Gates

**Using testing-validation-mcp for comprehensive validation:**

```javascript
// Check all quality gates for MCP
mcp__testing-validation__check_quality_gates({
  mcpPath: '/Users/username/Desktop/operations-workspace/local-instances/mcp-servers/my-mcp',
  phase: 'all' // or specific: 'pre-development', 'testing', 'pre-rollout'
})
```

**Quality Gate Phases:**
1. **Pre-Development:** Template validation, structure checks
2. **Development:** Code quality, test coverage
3. **Testing:** Unit tests, integration tests, smoke tests
4. **Documentation:** README, API docs, examples
5. **Pre-Rollout:** Security scan, standards compliance, deployment readiness

---

### 2. Google Sheets Apps Script Testing

#### Staging Environment Testing (DEV3)

**Purpose:** Test Apps Script changes in safe environment before production

**Workflow:**
```
Development → DEV3 Staging → Manual Testing → Production
```

**Step-by-Step Testing Process:**

1. **Make Changes in DEV3:**
   ```javascript
   // ALWAYS include header in staging code
   // STAGING ENVIRONMENT - TEST DATA ONLY
   // NO PHI - SYNTHETIC DATA
   // DEV3 TESTING

   function myNewFeature() {
     // Your code here
     // Use TEST- prefixed data only
   }
   ```

2. **Generate Test Data:**
   ```bash
   cd "Implementation Projects/google-sheets-version-control/staging"
   node scripts/generate-test-data.js --preset medium
   ```

3. **Manual Testing in DEV3:**
   - Open DEV3 sheet (has "[DEV]" prefix)
   - Tools → Script editor
   - Run function with synthetic data
   - Verify results match expectations

4. **Pull Changes Locally:**
   ```bash
   cd staging/scripts
   ./snapshot-staging.js --sheet <sheet-number>
   ```

5. **Validate (PHI Check):**
   ```bash
   node check-phi-leakage.js --sheet <sheet-number>
   ```

6. **Review Changes:**
   ```bash
   git diff staging-sheets/sheet-XXX_DEV3/
   ```

7. **Commit to Git:**
   ```bash
   git add staging-sheets/sheet-XXX_DEV3/
   git commit -m "Add feature: [description]"
   git push origin main
   ```

#### Apps Script Unit Testing

**QUnit Testing Framework:**
```javascript
// In Apps Script editor
function testMyFunction() {
  // Use synthetic test data
  const testPatient = {
    mrn: 'TEST-MRN-000001',
    name: 'Test Patient',
    dob: '01/01/1990'
  };

  const result = myFunction(testPatient);

  // Assertions
  if (result !== expectedValue) {
    throw new Error(`Expected ${expectedValue}, got ${result}`);
  }

  Logger.log('✅ Test passed');
}
```

#### Integration Testing

**Test Complete Workflow in DEV3:**
```javascript
function testCompleteWorkflow() {
  // Setup: Create test data
  const testData = createTestData();

  // Execute: Run full workflow
  const result = completeWorkflow(testData);

  // Verify: Check outputs
  verifyResults(result);

  // Cleanup: Remove test data
  cleanupTestData(testData);
}
```

---

### 3. Service Account Delegation Testing

#### Purpose

Test that service account delegation works correctly for automated operations without exposing credentials or PHI.

#### Pre-Test Checklist

- [ ] Service account credentials secured (NOT in git)
- [ ] Delegation scopes documented
- [ ] PHI audit logging enabled
- [ ] Test spreadsheet identified (non-production)

#### Testing Procedure

1. **Setup Test Environment:**
   ```bash
   # Ensure credentials are in gitignored location
   ls -la configuration/service-account*.json
   # Should NOT exist in git
   ```

2. **Test Delegation (Local):**
   ```javascript
   const { authorize } = require('./auth');

   // Test delegation
   const auth = await authorize({
     serviceAccount: 'automation@ssdspc.com',
     impersonatedUser: 'test@ssdspc.com',
     scopes: [
       'https://www.googleapis.com/auth/spreadsheets',
       'https://www.googleapis.com/auth/drive'
     ]
   });

   console.log('✅ Delegation successful');
   ```

3. **Verify Audit Logging:**
   ```bash
   # Check PHI audit log
   tail -20 logs/phi-audit-log.jsonl

   # Should show delegation entry:
   # {
   #   "operation": "access",
   #   "service": "service-account",
   #   "resource_type": "delegation",
   #   "user": "automation@ssdspc.com",
   #   "metadata": {
   #     "impersonatedUser": "test@ssdspc.com",
   #     "scopes": ["..."]
   #   }
   # }
   ```

4. **Test Read Operation:**
   ```javascript
   const sheets = google.sheets({ version: 'v4', auth });

   const response = await sheets.spreadsheets.values.get({
     spreadsheetId: 'TEST_SPREADSHEET_ID',
     range: 'Sheet1!A1:B10'
   });

   console.log('✅ Read operation successful');
   ```

5. **Verify PHI Audit Entry:**
   ```bash
   # Should show read operation in audit log
   tail -1 logs/phi-audit-log.jsonl | jq .
   ```

#### Automated Delegation Tests

**Using test script:**
```bash
cd google-workspace-oauth-setup/
node test-delegation.js
```

**Expected Output:**
```
🔐 Testing Service Account Delegation
✅ Credentials loaded
✅ Authorization successful
✅ Test read operation successful
✅ Audit log entry created
```

---

### 4. PHI Compliance Testing

#### Automated PHI Scanning

**Pre-Commit Hook (Automatic):**
```bash
# Runs automatically on git commit
# Scans staged files for PHI patterns
git commit -m "Your changes"
# → Triggers pre-commit hook
# → Scans for PHI
# → Blocks commit if PHI detected
```

**Manual PHI Scan:**
```bash
# Scan specific file
node staging/scripts/check-phi-leakage.js --file path/to/file.js

# Scan specific sheet
node staging/scripts/check-phi-leakage.js --sheet 42

# Scan all staging
node staging/scripts/check-phi-leakage.js --all
```

**CI/CD PHI Scan:**
```yaml
# .github/workflows/security-scan.yml
# Runs on every push and PR
- name: Scan for PHI patterns
  run: |
    node scripts/scan-phi.sh
```

#### PHI Detection Patterns

**Automatically Detected:**
- Social Security Numbers: `[0-9]{3}-[0-9]{2}-[0-9]{4}`
- Medical Record Numbers: `(MRN|Medical Record|Patient ID)[\s:]*[A-Z0-9-]{5,15}`
- Dates of Birth: `(DOB|Date of Birth)[\s:]*[0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{2,4}`
- Phone Numbers: `(\([0-9]{3}\)|[0-9]{3})[\s.-]?[0-9]{3}[\s.-]?[0-9]{4}`
- Patient Emails: `(patient|medical|health).*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}`

**Whitelisted (Allowed in Staging):**
- `TEST-MRN-XXXXXX` (Medical Record Numbers)
- `test@test.com` (Email addresses)
- `555-555-5555` (Phone numbers)
- `999-99-XXXX` (SSN format)

#### PHI Audit Logging Testing

**Verify Audit Logging is Active:**
```bash
# Check audit log exists and is being written to
ls -lah logs/phi-audit-log.jsonl

# View recent entries
tail -20 logs/phi-audit-log.jsonl | jq .
```

**Test Audit Log Entry Creation:**
```javascript
const AuditHooks = require('./lib/audit-hooks');

const hooks = new AuditHooks({
  localLogPath: './logs/phi-audit-log.jsonl'
});

// Test: Log a read operation
await hooks.auditSheetsRead(
  async () => {
    // Simulated read
    return { values: [['TEST-MRN-001', 'Test Patient']] };
  },
  {
    spreadsheetId: 'TEST_SHEET_ID',
    range: 'A1:B10',
    user: 'automation@ssdspc.com',
    purpose: 'testing_audit_logging',
    phi_categories: ['names', 'mrn']
  }
);

await hooks.close();
```

**Verify Entry:**
```bash
tail -1 logs/phi-audit-log.jsonl | jq .
# Should show operation with correct fields
```

**Verify Integrity Chain:**
```bash
node scripts/audit-query.js verify
# Expected: ✅ Log integrity verified successfully
```

---

### 5. Security Scanning Procedures

#### Credential Scanning

**Using Gitleaks (Automated):**
```bash
# Scan for exposed credentials
gitleaks detect \
  --source . \
  --verbose \
  --report-format json \
  --report-path gitleaks-report.json
```

**Using security-compliance-mcp:**
```javascript
// Scan file for credentials
mcp__security-compliance-mcp__scan_for_credentials({
  target: '/path/to/file.js',
  mode: 'file',
  minConfidence: 0.5
})

// Scan directory recursively
mcp__security-compliance-mcp__scan_for_credentials({
  target: '/path/to/directory',
  mode: 'directory',
  exclude: ['node_modules', '.git']
})

// Scan staged git files
mcp__security-compliance-mcp__scan_for_credentials({
  target: '.',
  mode: 'staged'
})

// Scan specific commit
mcp__security-compliance-mcp__scan_for_credentials({
  target: 'abc123',
  mode: 'commit',
  commitHash: 'abc123'
})
```

**Credential Patterns Detected:**
- API keys
- AWS access keys
- Google service account keys
- OAuth tokens
- Database passwords
- Private keys (.pem, .key files)

#### Allow-list Management

**Add False Positive to Allow-list:**
```javascript
mcp__security-compliance-mcp__manage_allowlist({
  action: 'add',
  entry: {
    filePath: 'config/example.js',
    lineNumber: 42,
    matchedText: 'example-api-key-XXXX',
    patternName: 'Generic API Key',
    reason: 'This is an example/placeholder key, not real credentials',
    addedBy: 'developer@example.com'
  }
})
```

**View Allow-list:**
```javascript
mcp__security-compliance-mcp__manage_allowlist({
  action: 'list'
})
```

#### Git Pre-Commit Hooks

**Install Hooks:**
```javascript
mcp__security-compliance-mcp__manage_hooks({
  action: 'install',
  gitDir: '/path/to/repo'
})
```

**Check Hook Status:**
```javascript
mcp__security-compliance-mcp__manage_hooks({
  action: 'status',
  gitDir: '/path/to/repo'
})
```

**What Pre-Commit Hooks Do:**
1. Scan staged files for credentials (Gitleaks)
2. Scan staged files for PHI patterns
3. Block commit if violations detected
4. Show detailed report of findings

---

### 6. Staging Environment Testing Workflow

#### Overview

**Staging Environment:** DEV3 (235 Google Sheets duplicates)
**Production Environment:** PROD (235 production sheets)
**Philosophy:** Staging-first, production is READ-ONLY

#### Complete Staging Test Workflow

**1. Make Changes in DEV3:**
```javascript
// In DEV3 Apps Script editor
// STAGING ENVIRONMENT - TEST DATA ONLY
// NO PHI - SYNTHETIC DATA

function newFeature(patientData) {
  // Implementation using synthetic data
  const mrn = patientData.mrn; // Should be TEST-MRN-XXXXXX
  // ... rest of logic
}
```

**2. Generate Test Data:**
```bash
cd "Implementation Projects/google-sheets-version-control/staging"

# Generate synthetic patient data
node scripts/generate-test-data.js --schema patient --count 50

# Or use preset
node scripts/generate-test-data.js --preset medium
```

**3. Manual Testing in DEV3:**
- Open DEV3 sheet
- Run function with test data
- Verify behavior
- Check for errors

**4. Pull Changes to Local:**
```bash
cd staging/scripts
./snapshot-staging.js --sheet 42
```

**5. PHI Validation:**
```bash
# Critical step: Check for PHI leakage
node check-phi-leakage.js --sheet 42

# Expected output:
# ✅ No PHI detected in sheet 42
```

**6. Review Changes:**
```bash
git diff staging-sheets/sheet-042_DEV3/
```

**7. Commit to Git:**
```bash
git add staging-sheets/sheet-042_DEV3/
git commit -m "Feature: Add patient classification to sheet 42"
git push origin main
```

**8. Deploy to Production:**
```bash
cd staging/scripts

# Deploy with safety checks
./deploy-to-production.sh --sheet 42

# Follow prompts:
# 1. Review PHI scan results
# 2. Review code diff
# 3. Type 'yes' to approve
# 4. Wait for deployment
# 5. Verify success
```

**9. Post-Deployment Verification:**
```bash
# Check production sheet
# Run quick smoke test
# Monitor execution logs

# Verify git commit
git log -1
```

#### Rollback Procedure

**If deployment fails or issues found:**

```bash
cd staging/scripts

# List available backups
./rollback-staging.sh --list

# Restore from backup
./rollback-staging.sh --restore sheet-42_prod-backup_20251116-143000

# Verify restoration
# Check production sheet
# Test functionality
```

---

## Testing Checklists

### Pre-Deployment Testing Checklist

**For MCP Server Deployment:**

- [ ] Unit tests pass (`npm run test:unit`)
- [ ] Integration tests pass (`npm run test:integration`)
- [ ] Smoke tests pass
- [ ] Code quality checks pass (code-review-mcp)
- [ ] Security scan clean (no credentials/PHI)
- [ ] Standards compliance validated
- [ ] Documentation complete
- [ ] Dual-environment pattern followed
- [ ] Template created/updated
- [ ] Build successful (`npm run build`)
- [ ] No console.log statements (or acceptable)
- [ ] Error handling implemented
- [ ] Test coverage ≥ 80%

**For Apps Script Deployment:**

- [ ] Tested in DEV3 staging environment
- [ ] Synthetic test data used (TEST- prefix)
- [ ] PHI scan passed (no real patient data)
- [ ] Manual testing completed
- [ ] Edge cases tested
- [ ] Error handling verified
- [ ] Code reviewed (if applicable)
- [ ] Production backup created
- [ ] Deployment approval obtained
- [ ] Rollback plan ready

**For Infrastructure Changes:**

- [ ] Changes tested in non-production workspace
- [ ] Git operations validated
- [ ] No breaking changes to existing workflows
- [ ] Documentation updated
- [ ] Backup created before changes
- [ ] Rollback procedure documented

---

### Post-Deployment Validation Checklist

**Immediately After Deployment:**

- [ ] Service/MCP starts successfully
- [ ] Basic functionality works (smoke test)
- [ ] No error messages in logs
- [ ] Authentication working (if applicable)
- [ ] API calls successful (if applicable)
- [ ] Audit logging active (for PHI operations)

**Within 24 Hours:**

- [ ] Monitor for errors in production
- [ ] Check user reports (if user-facing)
- [ ] Verify performance metrics acceptable
- [ ] Review audit logs for anomalies
- [ ] Confirm integrations working
- [ ] Validate data integrity

**Within 1 Week:**

- [ ] Review usage metrics
- [ ] Check for edge case issues
- [ ] Gather user feedback
- [ ] Performance optimization if needed
- [ ] Documentation updates based on issues

---

### Security Testing Checklist

**Before Every Commit:**

- [ ] No hardcoded credentials
- [ ] No service account keys in code
- [ ] No API keys exposed
- [ ] .env files gitignored
- [ ] Sensitive config in configuration/ directory
- [ ] Pre-commit hook passes

**Before Production Deployment:**

- [ ] Gitleaks scan clean
- [ ] PHI scan clean
- [ ] Secrets properly managed (keychain/env vars)
- [ ] Authentication/authorization tested
- [ ] Rate limiting implemented (if applicable)
- [ ] Input validation in place
- [ ] Error messages don't leak sensitive info

**Ongoing Security:**

- [ ] Regular dependency updates
- [ ] Security advisories reviewed
- [ ] Audit logs reviewed monthly
- [ ] Access controls validated quarterly
- [ ] Incident response plan tested annually

---

### HIPAA Compliance Testing Checklist

**PHI Handling:**

- [ ] PHI audit logging enabled
- [ ] All PHI access logged
- [ ] Audit logs tamper-proof (hash chain)
- [ ] Synthetic data used in testing
- [ ] No PHI in git commits
- [ ] No PHI in error messages
- [ ] Minimum necessary access enforced

**Audit Logging:**

- [ ] Audit log entries include all required fields
- [ ] Timestamps accurate (ISO 8601)
- [ ] User identification captured
- [ ] Purpose of access documented
- [ ] PHI categories documented
- [ ] Integrity verification passing

**Data Protection:**

- [ ] Encryption at rest (Google Drive)
- [ ] Encryption in transit (HTTPS)
- [ ] Access controls implemented
- [ ] Authentication required
- [ ] Backup procedures tested
- [ ] Retention policies enforced (6 years)

**Testing Validation:**

- [ ] Test data is synthetic only
- [ ] Test data follows naming conventions
- [ ] PHI scanner whitelists test data patterns
- [ ] Test environment isolated from production
- [ ] Production data never copied to test

---

## Test Data Management

### Synthetic Test Data Generation

#### Purpose

Generate realistic but fake patient data for testing without using real PHI.

#### Test Data Schemas

**Patient Data Schema:**
```json
{
  "mrn": "TEST-MRN-000001",
  "firstName": "Test",
  "lastName": "Patient",
  "dob": "01/01/1990",
  "phone": "555-555-0001",
  "email": "test.patient001@test.com",
  "address": "123 Test St, Test City, TS 12345",
  "ssn": "999-99-0001"
}
```

**Key Characteristics:**
- MRN: Always starts with `TEST-MRN-`
- Phone: Always uses `555-555-` prefix
- Email: Always uses `@test.com` domain
- SSN: Always starts with `999-99-`
- Names: "Test Patient", "Sample User", etc.

#### Generating Test Data

**Using generate-test-data.js:**

```bash
cd "Implementation Projects/google-sheets-version-control/staging"

# Generate 50 patient records
node scripts/generate-test-data.js --schema patient --count 50

# Use preset configurations
node scripts/generate-test-data.js --preset small    # 10 records
node scripts/generate-test-data.js --preset medium   # 100 records
node scripts/generate-test-data.js --preset large    # 1000 records

# Custom schema
node scripts/generate-test-data.js \
  --schema appointment \
  --count 200 \
  --output test-data/appointments.json
```

**Output:**
```
✅ Generated 50 test patient records
   Output: staging/test-data/patients-20251116.json

   Sample record:
   {
     "mrn": "TEST-MRN-000001",
     "firstName": "Test",
     "lastName": "Patient",
     ...
   }
```

#### Using Test Data in Apps Script

```javascript
// In DEV3 sheet
function loadTestData() {
  // Paste generated test data into sheet
  const testData = [
    ['TEST-MRN-000001', 'Test', 'Patient', '01/01/1990', '555-555-0001'],
    ['TEST-MRN-000002', 'Sample', 'User', '02/02/1991', '555-555-0002'],
    // ...
  ];

  const sheet = SpreadsheetApp.getActiveSheet();
  sheet.getRange(2, 1, testData.length, testData[0].length)
       .setValues(testData);
}
```

### PHI Protection in Testing

#### Never Use Real Patient Data

**Prohibited in Testing:**
- ❌ Real patient names
- ❌ Real medical record numbers
- ❌ Real SSNs
- ❌ Real phone numbers
- ❌ Real email addresses
- ❌ Real addresses
- ❌ Real dates of birth (if identifiable)

**Always Use Synthetic Data:**
- ✅ TEST-MRN-XXXXXX format
- ✅ 555-555-XXXX phone format
- ✅ test@test.com email format
- ✅ 999-99-XXXX SSN format
- ✅ Generic names: "Test Patient", "Sample User"

#### Test Data Naming Conventions

**Required Prefixes:**
- Medical Record Numbers: `TEST-MRN-`
- API Keys (in examples): `test-api-key-`
- Spreadsheet IDs: `TEST_SHEET_ID`
- Email addresses: `test@test.com`, `example@test.com`

**Automated Detection:**
PHI scanner recognizes these patterns as safe and won't flag them.

### Test Data Cleanup

**After Testing:**
```bash
# Remove test data from staging sheet
# (Manual process in DEV3 sheet)

# Clean local test data (if needed)
rm staging/test-data/patients-*.json
```

**Before Committing:**
```bash
# Ensure no test data files committed
git status

# If test data files present, add to .gitignore
echo "staging/test-data/*.json" >> .gitignore
```

---

## Environment Testing

### Local Development Testing

**Setup Local Test Environment:**

```bash
# Navigate to MCP directory
cd local-instances/mcp-servers/my-mcp/

# Install dependencies
npm install

# Run tests
npm test

# Start MCP in development mode
npm run dev
```

**Testing Local Changes:**

1. Make code changes
2. Run unit tests: `npm run test:unit`
3. Run integration tests: `npm run test:integration`
4. Build: `npm run build`
5. Test manually via Claude Code

### Staging Environment (DEV3)

**Purpose:** Safe environment for testing Google Sheets Apps Script changes

**Key Features:**
- 235 DEV3 sheet duplicates (mirrors production)
- Synthetic test data only
- Isolated from production
- Version controlled via git

**Testing Workflow:**
See [Staging Environment Testing Workflow](#6-staging-environment-testing-workflow)

### Production Environment

**Testing in Production:**

⚠️ **NEVER test directly in production!**

**Production is READ-ONLY:**
- Changes ONLY via deployment script
- All changes go through staging first
- Production sheets never edited directly

**Production Validation (Post-Deployment):**

After deploying from staging to production:

1. **Smoke Test:**
   - Open production sheet
   - Run basic function
   - Verify no errors

2. **Monitor Logs:**
   ```bash
   # Check execution logs in Apps Script
   # Review error tracking sheet
   # Watch for user reports
   ```

3. **Verify Audit Logging:**
   ```bash
   tail -20 logs/phi-audit-log.jsonl
   # Should show production operations
   ```

---

## Integration with Existing Systems

### MCP Deployment Workflow Integration

**Standards Enforcement Integration Points:**

```
Development Lifecycle:

1. Commit Time (git-assistant)
   └─> standards-enforcement-mcp
       └─> Validation: security, documentation
           └─> Behavior: Reduces confidence (guidance)

2. Workflow Completion (task-executor)
   └─> standards-enforcement-mcp
       └─> Validation: security, docs, configuration
           └─> Behavior: Archives with warnings

3. MCP Registration (mcp-config-manager)
   └─> standards-enforcement-mcp
       └─> Validation: security, config, docs
           └─> Behavior: Prevents registration if non-compliant

4. Production Deployment (deployment-release-mcp)
   └─> standards-enforcement-mcp
       └─> Validation: security, dual-env, template, config
           └─> Behavior: BLOCKS production deployment
```

**Testing at Each Integration Point:**

**1. Commit Time Testing:**
```javascript
// git-assistant calls standards-enforcement
mcp__git-assistant__check_commit_readiness({
  context: 'MCP development'
})

// Internally calls:
mcp__standards-enforcement-mcp__validate_mcp_compliance({
  mcpName: 'my-mcp',
  categories: ['security', 'documentation']
})
```

**2. Workflow Completion Testing:**
```javascript
// task-executor validates before archival
mcp__task-executor__archive_workflow({
  projectPath: '/path/to/project',
  workflowName: 'mcp-development-workflow'
})

// Internally validates standards
```

**3. MCP Registration Testing:**
```javascript
// mcp-config-manager validates before registration
mcp__mcp-config-manager__register_mcp_server({
  serverName: 'my-mcp'
})

// Blocks if standards validation fails
```

**4. Production Deployment Testing:**
```javascript
// deployment-release-mcp validates before deployment
mcp__deployment-release-mcp__deploy_application({
  projectPath: '/path/to/mcp',
  environment: 'production'
})

// BLOCKS deployment if standards validation fails
```

### Workspace Health Checks

**Using workspace-health-dashboard:**

```javascript
// Get overall workspace health
mcp__workspace-health-dashboard__get_workspace_health()

// Returns:
// {
//   healthScore: 85,
//   status: 'healthy',
//   issues: [...],
//   breakdown: {
//     mcpHealth: 90,
//     securityHealth: 95,
//     workflowHealth: 75
//   }
// }
```

**Health Check Integration in Testing:**

```javascript
// Before deployment, check workspace health
const health = await mcp__workspace-health-dashboard__get_workspace_health();

if (health.healthScore < 80) {
  console.warn('⚠️  Workspace health below threshold');
  console.warn('Issues:', health.issues);
  // Proceed with caution or fix issues first
}
```

### CI/CD Workflow Integration

**GitHub Actions Testing Workflows:**

**1. Security Scan Workflow:**
```yaml
# .github/workflows/security-scan.yml
name: Security Scan (PHI & Credentials)

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Scan for credentials with Gitleaks
        run: gitleaks detect --source . --verbose

      - name: Scan for PHI patterns
        run: ./scripts/scan-phi.sh

      - name: Fail workflow if violations found
        if: failure()
        run: exit 1
```

**2. Test Drive Access Workflow:**
```yaml
# .github/workflows/test-drive-access.yml
name: Test Drive Access

on:
  schedule:
    - cron: '0 9 * * *'  # Daily at 9 AM
  workflow_dispatch:

jobs:
  test-drive-access:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Test Drive Access
        run: node scripts/test-drive-access.js
        env:
          GOOGLE_SERVICE_ACCOUNT_KEY: ${{ secrets.SERVICE_ACCOUNT_KEY }}
```

**3. Daily Snapshots Workflow:**
```yaml
# .github/workflows/daily-snapshots.yml
name: Daily Snapshots

on:
  schedule:
    - cron: '0 14 * * *'  # Daily at 9 AM Central (2 PM UTC)

jobs:
  snapshot:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Pull all sheet snapshots
        run: ./scripts/snapshot-all-sheets.sh

      - name: Commit snapshots
        run: |
          git config user.name "GitHub Actions Bot"
          git config user.email "actions@github.com"
          git add production-sheets/
          git commit -m "Daily snapshot: $(date +'%Y-%m-%d')"
          git push
```

---

## Troubleshooting

### Common Testing Issues

#### Issue: Tests Fail Locally But Pass in CI

**Possible Causes:**
- Environment variable differences
- Node version mismatch
- Timing/race conditions

**Solutions:**
```bash
# Match Node version with CI
nvm use 18

# Check environment variables
printenv | grep -i test

# Run tests with CI environment
npm run test:ci
```

#### Issue: PHI Scanner False Positives

**Symptoms:**
PHI scanner flags synthetic test data as real PHI

**Solution:**
```javascript
// Add to whitelist
mcp__security-compliance-mcp__manage_allowlist({
  action: 'add',
  entry: {
    filePath: 'staging/test-data/patients.json',
    matchedText: 'TEST-MRN-000001',
    patternName: 'Medical Record Number',
    reason: 'Synthetic test data with TEST- prefix',
    addedBy: 'developer@example.com'
  }
})
```

Or ensure test data follows naming conventions:
- Use `TEST-MRN-` prefix for medical record numbers
- Use `555-555-` for phone numbers
- Use `@test.com` for email addresses

#### Issue: Deployment Fails PHI Validation

**Symptoms:**
```
Error: PHI detected - DEPLOYMENT BLOCKED
```

**Solution:**
1. Review scan output for detected patterns
2. Check if data is actually synthetic
3. If false positive, add to whitelist
4. If real PHI, remove immediately and:
   ```bash
   git reset --soft HEAD~1  # Undo commit
   # Remove PHI from files
   git add .
   git commit -m "Remove PHI"
   ```

#### Issue: Service Account Delegation Fails

**Symptoms:**
```
Error: Unable to authenticate with service account
```

**Solutions:**
```bash
# Check credentials file exists
ls -la configuration/service-account*.json

# Verify credentials format
cat configuration/service-account-key.json | jq .

# Test delegation manually
node google-workspace-oauth-setup/test-delegation.js

# Check scopes are correct
# Ensure domain-wide delegation enabled in Google Workspace
```

#### Issue: Staging Deployment Verification Fails

**Symptoms:**
```
Error: File count mismatch!
Expected: 5 files
Found: 3 files
```

**Solutions:**
```bash
# Check staging sheet has all files
# Verify .clasp.json is correct
cd staging-sheets/sheet-XXX_DEV3/

# Re-pull staging code
cd ../../staging/scripts
./snapshot-staging.js --sheet XXX

# Try deployment again
./deploy-to-production.sh --sheet XXX
```

#### Issue: Test Coverage Below Threshold

**Symptoms:**
```
Error: Test coverage (65%) below minimum threshold (80%)
```

**Solutions:**
```bash
# Generate coverage report
npm run coverage

# View HTML coverage report
open coverage/index.html

# Identify untested code
# Write additional tests for uncovered lines

# Use test-generator-mcp to help
mcp__test-generator-mcp__analyze_coverage_gaps({
  projectPath: '/path/to/project'
})
```

### Getting Help

**Documentation:**
- This guide (TESTING-GUIDE.md)
- SAFE-PRODUCTION-TESTING-GUIDE.md
- STAGING-USAGE-GUIDE.md
- PHI-AUDIT-LOGGING.md
- Individual MCP documentation

**Tools:**
```bash
# Check logs
tail -100 logs/deployments.log
tail -100 logs/phi-audit-log.jsonl

# Verify workspace health
# (Use workspace-health-dashboard MCP)

# Check MCP status
# (Use mcp-config-manager)
```

**Support Channels:**
- GitHub Issues (for bugs)
- Practice Manager (for HIPAA compliance questions)
- Development Team (for technical questions)

---

## Appendix

### A. Test File Naming Conventions

```
Recommended naming:
├── src/
│   └── myModule.ts
└── tests/
    ├── unit/
    │   └── myModule.test.ts          # Unit tests
    ├── integration/
    │   └── myModule.integration.test.ts  # Integration tests
    └── e2e/
        └── myModule.e2e.test.ts      # End-to-end tests
```

### B. Test Coverage Targets

| Component | Minimum Coverage | Recommended |
|-----------|-----------------|-------------|
| MCP Servers | 80% | 90%+ |
| Core Libraries | 90% | 95%+ |
| Utility Functions | 85% | 90%+ |
| Apps Script | 70% | 80%+ |
| Integration Code | 60% | 75%+ |

### C. Testing Tools Quick Reference

```bash
# MCP Testing
npm test                                    # Run all tests
npm run test:unit                           # Unit tests only
npm run test:integration                    # Integration tests
npm run coverage                            # Coverage report

# Security Scanning
gitleaks detect                             # Credential scanning
node scripts/scan-phi.sh                    # PHI scanning
./staging/scripts/check-phi-leakage.js      # Staging PHI check

# Apps Script Testing
./staging/scripts/generate-test-data.js     # Generate test data
./staging/scripts/deploy-to-production.sh   # Deploy to prod
./staging/scripts/rollback-staging.sh       # Rollback

# Validation
node scripts/audit-query.js verify          # Verify audit logs
./scripts/validate-staging.sh               # Validate staging
```

### D. Related Documentation

**Testing-Specific:**
- SAFE-PRODUCTION-TESTING-GUIDE.md (File organizer testing)
- STAGING-USAGE-GUIDE.md (Apps Script staging)
- PHI-AUDIT-LOGGING.md (Audit logging system)

**MCP Documentation:**
- MCP_ECOSYSTEM.md (All MCPs catalog)
- STANDARDS_ENFORCEMENT_SYSTEM.md (Quality enforcement)

**Deployment:**
- DEPLOYMENT-GUIDE.md (General deployment)
- AUTONOMOUS-DEPLOYMENT-SUMMARY.md (Automated deployment)
- PRODUCTION-DEPLOYMENT-TRANSITION.md (Deployment procedures)

**Security:**
- .github/workflows/security-scan.yml (Security workflow)
- Configuration/secrets management docs

### E. Glossary

**DEV3:** Staging environment with 235 duplicate Google Sheets for testing Apps Script changes

**PHI:** Protected Health Information - patient data covered by HIPAA regulations

**Synthetic Data:** Fake but realistic-looking data used for testing, follows TEST- naming conventions

**Smoke Test:** Quick validation that basic functionality works after deployment

**Integration Test:** Testing how different components work together

**Unit Test:** Testing individual functions or modules in isolation

**MCP:** Model Context Protocol - extensible server providing tools to Claude Code

**Staging-First:** Development philosophy where all changes go through staging before production

**Audit Logging:** HIPAA-compliant logging of all PHI access operations

**Service Account Delegation:** Automated access to Google Workspace using service account with domain-wide delegation

---

**Document Version:** 1.0.0
**Last Updated:** 2025-11-16
**Status:** Active - Living Document
**Next Review:** 2025-12-16
**Maintainer:** Update when testing procedures change or new testing tools added


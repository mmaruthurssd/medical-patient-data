---
type: guide
workspace: medical-patient-data
tags: [security, HIPAA, PHI, compliance, credentials]
criticality: high
last_updated: 2025-11-16
---

# Security Best Practices - PHI & HIPAA Compliance

**Critical**: This workspace handles Protected Health Information (PHI) and must maintain HIPAA compliance at all times.

**Google Business Associate Agreement (BAA)**: Active for Gemini API, Google Drive, Google Sheets, Apps Script

---

## 🚨 PHI Handling Rules

### What is PHI?

Protected Health Information includes any individually identifiable health information:

**18 HIPAA Identifiers**:
1. Names (patient, relatives, employers)
2. Geographic subdivisions smaller than state
3. Dates (birth, admission, discharge, death)
4. Telephone numbers
5. Fax numbers
6. Email addresses
7. Social Security numbers
8. Medical record numbers
9. Health plan beneficiary numbers
10. Account numbers
11. Certificate/license numbers
12. Vehicle identifiers and serial numbers
13. Device identifiers and serial numbers
14. Web URLs
15. IP addresses
16. Biometric identifiers (fingerprints, voice prints)
17. Full-face photos
18. Any other unique identifying number, characteristic, or code

**In Practice**: Patient names, dates of birth, appointment times, medical conditions, treatment notes, billing info.

---

## ✅ PHI Allowed Services (Google BAA Coverage)

These services have Business Associate Agreements and CAN process PHI:

| Service | BAA Status | Use Case | Notes |
|---------|------------|----------|-------|
| **Gemini API** | ✅ Covered | Patient data processing | Future integration |
| **Google Drive** | ✅ Covered | PHI file storage | Must use service account |
| **Google Sheets** | ✅ Covered | Patient records | Read-only recommended |
| **Apps Script** | ✅ Covered | Clinical automation | Must deploy via service account |
| **Gmail** (Business) | ✅ Covered | HIPAA-compliant email | Requires encryption |

**Service Account**: `automation@ssdspc.com`

---

## ❌ PHI Prohibited Services (No BAA)

These services do NOT have Business Associate Agreements and CANNOT process PHI:

| Service | BAA Status | Reason | Alternative |
|---------|------------|--------|-------------|
| **Claude Code** | ❌ No BAA | Anthropic has no BAA with user | Use for infrastructure only |
| **GitHub** | ❌ No BAA | Code hosting, not HIPAA-compliant | Never commit PHI |
| **Git** (local) | ❌ No BAA | Version control, not encrypted | Use for code only |
| **npm packages** | ❌ No BAA | Third-party code | Audit before PHI processing |
| **VS Code** (local) | ❌ No BAA | Code editor, not compliant | Don't open PHI files |

**Critical Rule**: PHI must NEVER leave Google BAA-covered services

---

## 🔒 Data Classification & Handling

### Level 1: Public (No PHI)
**Examples**: Code, documentation, configuration templates
- ✅ Can commit to git
- ✅ Can share on GitHub
- ✅ Can process with Claude Code
- ✅ Can store anywhere

### Level 2: Confidential (No PHI, but sensitive)
**Examples**: API keys, service account keys, OAuth tokens
- ❌ Never commit to git
- ✅ Store in `configuration/` (gitignored)
- ✅ Use environment variables
- ⚠️ Encrypt at rest

### Level 3: PHI (HIPAA Protected)
**Examples**: Patient names, medical records, appointment data
- ❌ NEVER commit to git
- ❌ NEVER process with Claude Code
- ❌ NEVER store outside Google BAA services
- ✅ Only process with Gemini API
- ✅ Only store in Google Drive/Sheets
- ✅ Log all access to audit log

---

## 🔐 Credential Management

### Service Account Keys

**Primary Service Account**: `ssd-automation-service-account@workspace-automation-ssdspc.iam.gserviceaccount.com`

**Storage Locations**:
```
Primary:
configuration/
  └── service-accounts/
      └── service-account.json  (gitignored)

Legacy (alternative):
google-workspace-oauth-setup/
  └── service-account.json  (gitignored, may be symlink)
```

**Usage**:
```javascript
// ✅ CORRECT: Use environment variable
const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);

// ✅ CORRECT: Load from path in environment variable
const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH,
  scopes: ['https://www.googleapis.com/auth/drive']
});

// ❌ WRONG: Hardcoded path
const serviceAccount = require('./service-account.json');

// ❌ WRONG: Relative path
const serviceAccount = require('../configuration/service-account.json');
```

**Security**:
- Never commit to git (in `.gitignore`)
- Encrypt at rest (use OS keychain or vault)
- Rotate annually (or every 90 days for high-risk)
- Limit permissions (principle of least privilege)
- Always use absolute paths in configuration
- Store only one active key per service account
- Delete old keys after rotation verified

### OAuth Tokens

**Storage**:
```
configuration/
  └── oauth-tokens/
      └── google-workspace-token.json  (gitignored)
```

**Refresh Tokens**:
- Automatically refresh before expiration
- Store refresh token securely
- Never log refresh token
- Revoke if compromised

### API Keys

**For Google APIs**:
- Use service account instead of API keys when possible
- Restrict API keys to specific APIs
- Restrict by IP address if static IP available
- Rotate every 90 days

**For Third-Party APIs**:
- Store in environment variables
- Never commit to git
- Use MCP: `mcp__configuration-manager-mcp__manage_secrets`

---

## 🛡️ Pre-Commit Security Scanning

### Automated Hooks

Pre-commit hooks automatically scan for:
1. **Credentials**: API keys, tokens, passwords
2. **PHI**: Patient names, SSN, medical record numbers
3. **Large files**: >10MB files that might contain PHI
4. **Sensitive paths**: Files in `configuration/` directory

**Location**: `.git/hooks/pre-commit`

### Manual Scanning

Before committing, always run:

```bash
# Scan for credentials
mcp__security-compliance-mcp__scan_for_credentials \
  --target . \
  --mode directory \
  --exclude node_modules,.git

# Scan for PHI
mcp__security-compliance-mcp__scan_for_phi \
  --target . \
  --mode directory \
  --exclude node_modules,.git
```

### If Scan Detects Issues

**Critical Violations Found**:
1. **STOP** - Do not commit
2. Remove PHI/credentials from files
3. Move to secure location (Google Drive or environment variables)
4. Re-scan before committing
5. If already committed: See [PHI Leak Response](#phi-leak-response-protocol)

---

## 📋 PHI Operation Audit Logging

**CRITICAL**: HIPAA requires comprehensive audit logging of ALL PHI access. This workspace implements enterprise-grade audit logging with tamper-proof integrity verification.

### Audit Logging System

**Implementation**: `Implementation Projects/google-sheets-version-control/lib/phi-audit-logger.js`

**Features**:
- ✅ Tamper-proof logging with cryptographic hash chains
- ✅ Append-only JSONL format (immutable)
- ✅ 6-year retention (HIPAA compliant)
- ✅ Real-time monitoring and alerting
- ✅ Integrity verification
- ✅ Comprehensive query and reporting

**Full Documentation**: See `Implementation Projects/google-sheets-version-control/docs/PHI-AUDIT-LOGGING.md`

### When to Log

Log EVERY operation that touches PHI:
- ✅ Reading patient data from Google Sheets
- ✅ Writing/updating patient records
- ✅ Exporting PHI to external formats
- ✅ Deleting patient data
- ✅ Processing patient records with Gemini
- ✅ Creating/updating patient files in Drive
- ✅ Service account delegation for PHI access
- ✅ Apps Script deployments to production sheets
- ✅ Sharing PHI resources
- ✅ Accessing PHI via API

### Quick Start - Using Audit Hooks

**Recommended**: Use `AuditHooks` wrapper for automatic audit logging:

```javascript
const AuditHooks = require('./lib/audit-hooks');

const hooks = new AuditHooks({
  localLogPath: './logs/phi-audit-log.jsonl',
  driveBackupEnabled: true // Backup to Google Drive
});

// Wrap Google Sheets read operation
const data = await hooks.auditSheetsRead(
  async () => {
    // Your actual read operation
    return await sheets.spreadsheets.values.get({
      spreadsheetId: 'SPREADSHEET_ID',
      range: 'PatientData!A1:Z100'
    });
  },
  {
    spreadsheetId: 'SPREADSHEET_ID',
    range: 'PatientData!A1:Z100',
    user: 'automation@ssdspc.com',
    purpose: 'backup_operation',
    phi_categories: ['names', 'dob', 'mrn', 'phone']
  }
);

// Always close when done
await hooks.close();
```

### Audit Log Format

**Storage**: `logs/phi-audit-log.jsonl` (gitignored, append-only)

**Each entry includes**:
```json
{
  "timestamp": "2025-11-16T10:30:00.000Z",
  "log_id": "1731755400000-a1b2c3d4e5f6g7h8",

  "operation": "read",
  "service": "google-sheets",
  "resource_type": "cell_range",
  "resource_id": "1AbC_spreadsheet_id",

  "phi_categories": ["names", "dob", "mrn"],
  "record_count": 45,

  "purpose": "patient_classification",
  "user": "automation@ssdspc.com",
  "result": "success",

  "metadata": {
    "range": "A1:Z100",
    "duration_ms": 234
  },

  "previous_hash": "e3b0c44298fc...",
  "entry_hash": "2c26b46b68ffc..."
}
```

### Query and Reporting

```bash
# Query logs
node scripts/audit-query.js query --user automation@ssdspc.com --limit 100

# Generate monthly compliance report
node scripts/audit-query.js report --start 2025-11-01 --end 2025-11-30

# Verify log integrity
node scripts/audit-query.js verify

# Security summary
node scripts/audit-query.js summary --days 30

# Real-time monitoring
node scripts/audit-query.js monitor --interval 15
```

### Monitoring and Alerts

**Real-time monitoring** detects:
- 🚨 High-volume access (>1000 records in 15 minutes)
- 🚨 Consecutive failures (5+ in a row)
- 🚨 After-hours access (outside 7 AM - 7 PM)
- 🚨 Unknown users
- 🚨 Export/delete operations

**Setup monitoring**:
```javascript
const AuditMonitor = require('./lib/audit-monitor');

const monitor = new AuditMonitor({
  knownUsers: ['automation@ssdspc.com', 'backup@ssdspc.com']
});

monitor.onAlert(alert => {
  console.log('🚨 ALERT:', alert.message);
  // Send email, Slack notification, etc.
});

monitor.startMonitoring(15); // Check every 15 minutes
```

### Audit Log Retention

- **Period**: 6 years minimum (HIPAA requirement)
- **Storage**: Local JSONL file + Google Drive backup (under BAA)
- **Format**: Append-only, tamper-proof with hash chain
- **Access**: Restricted to authorized personnel only
- **Integrity**: Daily automated verification recommended

### Integration Requirements

**ALL code that accesses PHI MUST use audit hooks**:

✅ **Required**:
```javascript
// Sheets operations
await hooks.auditSheetsRead(operation, context);
await hooks.auditSheetsWrite(operation, context);
await hooks.auditSheetsExport(operation, context);

// Drive operations
await hooks.auditDriveAccess(operation, context);

// Service account delegation
await hooks.auditServiceAccountDelegation(operation, context);

// Apps Script deployment
await hooks.auditAppsScriptDeployment(operation, context);
```

❌ **Prohibited**:
```javascript
// Direct PHI access without audit logging
const data = await sheets.spreadsheets.values.get(...); // NO!
```

### Pre-Commit Verification

Pre-commit hooks check for:
1. PHI operations without audit logging
2. Missing audit hook imports
3. Direct Google Sheets API calls in PHI-handling code

**Fix before committing**:
```bash
# Scan for unaudited PHI operations
grep -r "spreadsheets.values.get" scripts/ --exclude-dir=node_modules

# Ensure all PHI operations use audit hooks
```

---

## 🔧 Configuration Security

### Configuration File Protection

**Configuration Hierarchy** (See CONFIGURATION-GUIDE.md for details):
```
Level 1: Public (committed to git)
  - Workflow files, package.json, documentation

Level 2: Confidential (gitignored, no PHI)
  - Service account keys, API keys, .env files

Level 3: PHI-Adjacent (special handling)
  - Drive folder IDs, Sheet IDs, audit configs
```

### Environment Variables Security

**Safe Patterns:**
```bash
# ✅ CORRECT: Environment variable references
GOOGLE_SERVICE_ACCOUNT_KEY_PATH=/absolute/path/to/key.json

# ✅ CORRECT: Non-sensitive IDs in .env.example
DRIVE_FOLDER_ID=your-folder-id-here

# ❌ WRONG: Actual credentials in .env
GOOGLE_API_KEY=AIzaSyD-actual-key-here

# ❌ WRONG: Relative paths
GOOGLE_SERVICE_ACCOUNT_KEY_PATH=../config/key.json
```

**Rules:**
- Always use absolute paths for credential files
- Never commit `.env` files (use `.env.example` as template)
- Set sensitive environment variables outside git (shell, MCP config, GitHub Secrets)
- Validate environment variables before use
- Document all required variables in README

### MCP Configuration Security

**~/.claude.json Security:**
```json
{
  "mcpServers": {
    "google-workspace-materials": {
      "command": "node",
      "args": ["/absolute/path/to/build/index.js"],
      "env": {
        // ✅ CORRECT: Path to credentials, not credentials themselves
        "GOOGLE_SERVICE_ACCOUNT_KEY_PATH": "/absolute/path/to/key.json",
        // ✅ CORRECT: Non-sensitive folder IDs
        "DRIVE_ROOT_FOLDER_ID": "folder-id",
        // ❌ WRONG: Never put actual key content here
        "GOOGLE_API_KEY": "actual-key-content"
      }
    }
  }
}
```

**Security Checklist:**
- Use absolute paths (not relative)
- Store credential paths (not credentials)
- Restart Claude Code after credential changes
- Verify MCP cannot access files outside intended scope
- Review MCP permissions regularly

### GitHub Actions Secrets Security

**Secret Management:**
```yaml
# ✅ CORRECT: Reference GitHub secret
credentials_json: ${{ secrets.GCS_SERVICE_ACCOUNT_KEY }}

# ✅ CORRECT: Temporary file (deleted after workflow)
run: |
  echo "${{ secrets.SERVICE_ACCOUNT }}" > /tmp/key.json
  # Use /tmp/key.json
  rm /tmp/key.json

# ❌ WRONG: Echo secret to logs
run: |
  echo "Key: ${{ secrets.SERVICE_ACCOUNT }}"

# ❌ WRONG: Commit secret to repository
run: |
  echo "${{ secrets.API_KEY }}" > api-key.txt
  git add api-key.txt
```

**Rules:**
- Never echo secrets to workflow logs
- Use secrets only in workflow steps (not in logs or artifacts)
- Rotate secrets annually or after team changes
- Audit secret access in repository settings
- Document which workflows use which secrets

### Configuration Validation Requirements

**Before Committing:**
```bash
# 1. Scan for credentials
mcp__security-compliance-mcp__scan_for_credentials({
  target: ".",
  mode: "directory",
  minConfidence: 0.7,
  exclude: ["node_modules", ".git"]
})

# 2. Scan for PHI
mcp__security-compliance-mcp__scan_for_phi({
  target: ".",
  mode: "directory",
  sensitivity: "high",
  exclude: ["node_modules", ".git"]
})

# 3. Check .gitignore coverage
git status  # Should NOT show .env or service-account.json

# 4. Review staged files
git diff --staged
```

**Configuration Change Checklist:**
- [ ] New credentials stored in gitignored location
- [ ] Paths updated to absolute (not relative)
- [ ] .env.example updated (without actual values)
- [ ] Documentation updated (CONFIGURATION-GUIDE.md)
- [ ] No secrets in git history
- [ ] GitHub secrets updated if needed
- [ ] Test integration after change

### Common Configuration Vulnerabilities

**1. Committed Credentials:**
```bash
# ❌ DANGER: Service account key in git
git add configuration/service-account.json  # NEVER DO THIS

# ✅ SAFE: Verify gitignore coverage
cat .gitignore | grep "service-account"
git ls-files | grep -i "service-account"  # Should return nothing
```

**2. Relative Paths:**
```javascript
// ❌ WRONG: Breaks when working directory changes
keyFile: './config/key.json'
keyFile: '../service-account.json'

// ✅ CORRECT: Absolute paths always work
keyFile: '/Users/mmaruthurnew/Desktop/medical-patient-data/configuration/service-accounts/service-account.json'
keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH  // Set to absolute path
```

**3. Hardcoded Secrets:**
```javascript
// ❌ WRONG: Hardcoded in code
const apiKey = 'AIzaSyD-actual-key';
const projectId = 'my-project-123';

// ✅ CORRECT: From environment
const apiKey = process.env.GOOGLE_API_KEY;
const projectId = process.env.GCP_PROJECT_ID;
```

**4. Secrets in Logs:**
```javascript
// ❌ WRONG: Logging credentials
console.log('Service account:', serviceAccount);
logger.info('API key:', process.env.API_KEY);

// ✅ CORRECT: Redacted logging
console.log('Service account loaded:', !!serviceAccount);
logger.info('API key configured:', !!process.env.API_KEY);
```

---

## 🔍 Security Scanning Schedule

### Daily (Automated)
- ✅ Pre-commit hooks on every commit
- ✅ Dependency vulnerability scanning (`npm audit`)

### Weekly (Manual)
```bash
# Full workspace scan
mcp__security-compliance-mcp__scan_for_credentials \
  --target ~/Desktop/medical-patient-data \
  --mode directory

mcp__security-compliance-mcp__scan_for_phi \
  --target ~/Desktop/medical-patient-data \
  --mode directory

# Review audit log
cat gemini-audit-log.json | tail -100
```

### Monthly (Compliance Review)
- [ ] Review all PHI access logs
- [ ] Audit service account permissions
- [ ] Rotate credentials (if 90 days elapsed)
- [ ] Review and update `.gitignore`
- [ ] Test backup and recovery procedures
- [ ] Verify BAA agreements are current

---

## 🚑 PHI Leak Response Protocol

### If PHI Accidentally Committed to Git

**Immediate Actions (Within 5 minutes)**:

1. **STOP** - Do not push to GitHub
   ```bash
   # Check if pushed
   git status
   git log --oneline -5
   ```

2. **Remove from git history**:
   ```bash
   # If not pushed yet
   git reset --soft HEAD~1
   git reset HEAD .

   # If pushed to GitHub (CRITICAL)
   # Contact security team IMMEDIATELY
   # Follow HIPAA breach notification protocol
   ```

3. **Secure the data**:
   - Move PHI to Google Drive (under BAA)
   - Delete local copies
   - Clear clipboard/temp files

4. **Document the incident**:
   ```
   Date: YYYY-MM-DD HH:MM
   PHI exposed: [categories]
   Duration: [how long exposed]
   Scope: [who had access]
   Remediation: [actions taken]
   ```

5. **Notify**:
   - Security officer (if breach >72 hours)
   - Affected patients (if required by law)
   - OCR (Office for Civil Rights) if reportable breach

### If Credentials Leaked

1. **Revoke immediately**:
   ```bash
   # For service account
   gcloud iam service-accounts keys delete [KEY-ID] \
     --iam-account=automation@ssdspc.com

   # For OAuth token
   # Revoke via Google Cloud Console
   ```

2. **Generate new credentials**
3. **Audit access logs** for unauthorized use
4. **Update all systems** with new credentials
5. **Document incident**

---

## 🔒 Encryption Standards

### At Rest
- Service account keys: OS keychain or encrypted vault
- OAuth tokens: Encrypted storage
- PHI files: Google Drive (automatic encryption)
- Audit logs: Encrypted before archival

### In Transit
- HTTPS only for all API calls
- TLS 1.2+ for email (Gmail)
- Secure WebSocket for Apps Script
- No plain HTTP

### Code Examples

```javascript
// ✅ CORRECT: Encrypted storage
const keychain = require('keychain');
await keychain.setPassword({
  account: 'google-service-account',
  service: 'medical-practice',
  password: JSON.stringify(serviceAccountKey)
});

// ❌ WRONG: Plain text storage
fs.writeFileSync('key.json', JSON.stringify(serviceAccountKey));
```

---

## 👥 Access Control

### Principle of Least Privilege

**Service Account Permissions**:
- ✅ Read-only access to patient sheets (unless write required)
- ✅ Limited to specific drives/folders
- ❌ No admin privileges
- ❌ No access to unrelated systems

**Developer Access**:
- ✅ Can access code and infrastructure
- ❌ Cannot access PHI directly
- ⚠️ Use service account for PHI operations

### Permission Audit

```bash
# Check service account permissions
gcloud projects get-iam-policy [PROJECT-ID] \
  --flatten="bindings[].members" \
  --filter="bindings.members:automation@ssdspc.com"
```

---

## 🧪 Testing with PHI

### NEVER Use Real PHI for Testing

**Test Data Creation**:
- Generate synthetic patient data
- Use HIPAA-safe test data generators
- Randomize identifiers
- Use obvious fake names (e.g., "Test Patient 123")

**Test Data Examples**:
```javascript
// ✅ CORRECT: Synthetic test data
const testPatient = {
  name: "Test Patient 001",
  mrn: "TEST-00001",
  dob: "2000-01-01",
  ssn: "000-00-0001"  // Obviously fake
};

// ❌ WRONG: Real patient data
const testPatient = {
  name: "John Smith",  // Could be real
  mrn: "MRN-45678",    // Could be real
  dob: "1985-03-15"    // Specific real date
};
```

---

## 📊 Compliance Checklist

### Before Processing PHI

- [ ] Verify service has Google BAA coverage
- [ ] Initialize audit logging
- [ ] Confirm using Gemini (not Claude Code)
- [ ] Check PHI stays within BAA services
- [ ] Review access permissions

### Before Committing Code

- [ ] Run credential scan
- [ ] Run PHI scan
- [ ] Review `.gitignore` coverage
- [ ] No hardcoded secrets
- [ ] No test PHI in code

### Before Deployment

- [ ] All credentials in environment variables
- [ ] Audit logging enabled
- [ ] PHI access restricted to service account
- [ ] Encryption at rest verified
- [ ] TLS/HTTPS enforced

### Monthly Review

- [ ] Review audit logs (past 30 days)
- [ ] Check for credential rotation needs
- [ ] Verify BAA agreements current
- [ ] Test backup/recovery
- [ ] Update this document if needed

---

## 🛠️ Security Tools & MCPs

### Available Security MCPs

| MCP | Purpose | Usage |
|-----|---------|-------|
| **security-compliance-mcp** | Credential/PHI scanning | Pre-commit, manual scans |
| **configuration-manager-mcp** | Secrets management | Store/retrieve credentials |
| **backup-dr** | Backup with PHI scanning | Archive with PHI detection |
| **workspace-brain-mcp** | Audit logging | Track operations |

### Security Scanning Commands

```bash
# Scan for credentials
mcp__security-compliance-mcp__scan_for_credentials({
  target: ".",
  mode: "directory",
  minConfidence: 0.7
})

# Scan for PHI
mcp__security-compliance-mcp__scan_for_phi({
  target: ".",
  mode: "directory",
  sensitivity: "high"
})

# Manage secrets
mcp__configuration-manager-mcp__manage_secrets({
  action: "store",
  key: "google-service-account",
  value: serviceAccountJSON,
  rotationDays: 90
})
```

---

## 📚 Additional Resources

### Internal Documentation
- [HIPAA-COMPLIANCE-BOUNDARIES.md](workspace-management/HIPAA-COMPLIANCE-BOUNDARIES.md)
- [GIT-SAFETY-CHECKLIST.md](GIT-SAFETY-CHECKLIST.md)
- [GIT-SAFETY-ENFORCEMENT.md](GIT-SAFETY-ENFORCEMENT.md)
- [AI-GUIDELINES-BY-WORKSPACE.md](workspace-management/AI-GUIDELINES-BY-WORKSPACE.md)

### External Resources
- [HIPAA Security Rule](https://www.hhs.gov/hipaa/for-professionals/security/index.html)
- [Google Cloud HIPAA Compliance](https://cloud.google.com/security/compliance/hipaa)
- [HHS Breach Notification Rule](https://www.hhs.gov/hipaa/for-professionals/breach-notification/index.html)

### Training
- HIPAA Security Awareness Training (required annually)
- Google Workspace BAA familiarization
- Incident response procedures

---

## 🆘 Security Contacts

**Security Officer**: [To be designated]
**HIPAA Compliance Officer**: [To be designated]
**Google Cloud Support**: https://cloud.google.com/support
**HHS Office for Civil Rights**: (800) 368-1019

---

**Last Updated**: 2025-11-16
**Next Review**: 2025-12-16 (monthly)
**Compliance Status**: ✅ Active (Google BAA in place)
**Critical**: This is a living document. Update as security practices evolve.

**Recent Updates:**
- 2025-11-16: Added comprehensive configuration security section covering environment variables, MCP configuration, GitHub secrets, and common vulnerabilities
- 2025-11-16: Updated service account documentation to reflect actual service account email and file locations
- 2025-11-16: Cross-referenced CONFIGURATION-GUIDE.md for detailed configuration management

---
type: guide
workspace: medical-patient-data
tags: [security, HIPAA, PHI, compliance, credentials]
criticality: high
last_updated: 2025-11-15
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

**Primary Service Account**: `automation@ssdspc.com`

**Storage**:
```
configuration/
  └── service-accounts/
      └── automation-ssdspc-com-key.json  (gitignored)
```

**Usage**:
```javascript
// ✅ CORRECT: Use environment variable
const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);

// ❌ WRONG: Hardcoded path
const serviceAccount = require('./automation-ssdspc-com-key.json');
```

**Security**:
- Never commit to git (in `.gitignore`)
- Encrypt at rest (use OS keychain or vault)
- Rotate every 90 days
- Limit permissions (principle of least privilege)

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

### When to Log

Log EVERY operation that touches PHI:
- Reading patient data from Google Sheets
- Processing patient records with Gemini
- Creating/updating patient files in Drive
- Sending PHI via Gmail
- Generating reports with patient data

### Audit Log Format

**File**: `gemini-audit-log.json` (gitignored)

```json
{
  "timestamp": "2025-11-15T10:30:00Z",
  "operation": "read_patient_records",
  "service": "google-sheets",
  "ai_client": "gemini",
  "phi_categories": ["names", "dates", "medical_record_numbers"],
  "record_count": 45,
  "purpose": "patient_classification",
  "user": "automation@ssdspc.com",
  "result": "success"
}
```

### Logging Implementation

```javascript
// ✅ CORRECT: Log before processing PHI
async function processPatientData(sheetId) {
  await logAuditEntry({
    operation: 'read_patient_records',
    service: 'google-sheets',
    ai_client: 'gemini',
    phi_categories: ['names', 'dates'],
    purpose: 'data_processing'
  });

  // Process with Gemini (has BAA)
  const data = await gemini.processSheet(sheetId);
  return data;
}
```

### Audit Log Retention

- Keep logs for **6 years** (HIPAA requirement)
- Store in Google Drive (under BAA)
- Encrypt logs at rest
- Restrict access to authorized personnel only

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

**Last Updated**: 2025-11-15
**Next Review**: 2025-12-15 (monthly)
**Compliance Status**: ✅ Active (Google BAA in place)
**Critical**: This is a living document. Update as security practices evolve.

# PHI Audit Logging System

**HIPAA-Compliant Audit Logging for Protected Health Information Operations**

## Overview

This comprehensive audit logging system tracks ALL operations that access, modify, or export Protected Health Information (PHI) in compliance with HIPAA requirements. The system implements tamper-proof, append-only logging with integrity verification and retention management.

**Key Features**:
- 🔒 Tamper-proof logging with cryptographic hash chains
- 📝 Append-only JSONL format for immutability
- 🔍 Comprehensive query and reporting tools
- 🚨 Real-time monitoring and alerting
- 📊 Compliance reporting
- ⏰ 6-year retention (HIPAA requirement)
- 🔐 Integrity verification

---

## Architecture

### Components

1. **PHIAuditLogger** (`lib/phi-audit-logger.js`)
   - Core logging engine
   - Cryptographic hash chain for integrity
   - Append-only JSONL storage
   - Query and reporting capabilities

2. **AuditHooks** (`lib/audit-hooks.js`)
   - Wrapper functions for PHI operations
   - Automatic audit logging integration
   - Support for Sheets, Drive, Apps Script

3. **AuditMonitor** (`lib/audit-monitor.js`)
   - Real-time anomaly detection
   - Security alerting
   - Pattern analysis

4. **Query Tool** (`scripts/audit-query.js`)
   - Command-line interface for log analysis
   - Compliance reporting
   - Integrity verification

### Data Flow

```
PHI Operation
    ↓
Audit Hook (wrapper)
    ↓
PHI Audit Logger
    ↓
Append to JSONL file (with hash chain)
    ↓
Optional: Backup to Google Drive
```

---

## Audit Log Format

### Log Entry Schema

Each audit entry is a JSON object with the following fields:

```json
{
  "timestamp": "2025-11-16T10:30:00.000Z",
  "log_id": "1731755400000-a1b2c3d4e5f6g7h8",

  "operation": "read",
  "service": "google-sheets",
  "resource_type": "cell_range",
  "resource_id": "1AbC_spreadsheet_id_XyZ",

  "phi_categories": ["names", "dob", "mrn"],
  "record_count": 45,

  "purpose": "patient_classification",
  "user": "automation@ssdspc.com",
  "result": "success",

  "metadata": {
    "range": "A1:Z100",
    "duration_ms": 234
  },
  "error": null,

  "previous_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "entry_hash": "2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae"
}
```

### Field Definitions

#### Core Fields

- **timestamp**: ISO 8601 timestamp when operation occurred
- **log_id**: Unique identifier for this log entry (timestamp + random)

#### Operation Details

- **operation**: Type of operation
  - `read` - Reading PHI data
  - `write` - Creating or updating PHI data
  - `export` - Exporting PHI to external format
  - `delete` - Deleting PHI data
  - `access` - Accessing resource without reading data
  - `create` - Creating new resource
  - `update` - Updating existing resource
  - `share` - Sharing resource with others

- **service**: Service used for operation
  - `google-sheets` - Google Sheets API
  - `google-drive` - Google Drive API
  - `gemini-api` - Gemini AI processing
  - `apps-script` - Apps Script deployment
  - `gmail` - Email operations
  - `service-account` - Service account delegation

- **resource_type**: Type of resource accessed
  - `cell_range` - Range of cells in spreadsheet
  - `spreadsheet` - Entire spreadsheet
  - `file` - Drive file
  - `folder` - Drive folder
  - `script_project` - Apps Script project
  - `delegation` - Service account delegation

- **resource_id**: Unique identifier for resource (spreadsheet ID, file ID, etc.)

#### PHI Tracking

- **phi_categories**: Array of PHI categories present in accessed data
  - Standard HIPAA identifiers: `names`, `addresses`, `dates`, `phone`, `email`, `ssn`, `mrn`, `account_numbers`, `license_numbers`, etc.

- **record_count**: Number of records/rows accessed

#### Context

- **purpose**: Business purpose for accessing PHI
  - Examples: `patient_classification`, `billing_export`, `backup_operation`, `code_deployment`, `data_validation`

- **user**: Email address of user or service account performing operation

- **result**: Outcome of operation
  - `success` - Operation completed successfully
  - `failure` - Operation failed
  - `partial` - Operation partially completed
  - `denied` - Access denied before operation

#### Optional Fields

- **metadata**: Operation-specific additional context (object)
- **error**: Error message if operation failed (string or null)

#### Integrity Chain

- **previous_hash**: SHA-256 hash of previous log entry
- **entry_hash**: SHA-256 hash of current entry (for verification)

---

## Usage

### 1. Basic Logging

```javascript
const PHIAuditLogger = require('./lib/phi-audit-logger');

const logger = new PHIAuditLogger({
  localLogPath: './logs/phi-audit-log.jsonl',
  driveBackupEnabled: true,
  driveFolderId: 'DRIVE_FOLDER_ID'
});

// Log a PHI access operation
await logger.log({
  operation: 'read',
  service: 'google-sheets',
  resource_type: 'cell_range',
  resource_id: '1AbC_spreadsheet_id',
  phi_categories: ['names', 'dob', 'mrn'],
  record_count: 100,
  purpose: 'patient_report_generation',
  user: 'automation@ssdspc.com',
  result: 'success',
  metadata: {
    range: 'PatientData!A1:Z100',
    duration_ms: 456
  }
});

// Always close logger when done
await logger.close();
```

### 2. Using Audit Hooks (Recommended)

```javascript
const AuditHooks = require('./lib/audit-hooks');

const hooks = new AuditHooks({
  localLogPath: './logs/phi-audit-log.jsonl'
});

// Wrap Google Sheets read operation
const data = await hooks.auditSheetsRead(
  async () => {
    // Your actual read operation
    return await sheets.spreadsheets.values.get({
      spreadsheetId: '1AbC_spreadsheet_id',
      range: 'PatientData!A1:Z100'
    });
  },
  {
    spreadsheetId: '1AbC_spreadsheet_id',
    range: 'PatientData!A1:Z100',
    user: 'automation@ssdspc.com',
    purpose: 'backup_operation',
    phi_categories: ['names', 'dob', 'mrn']
  }
);

// Close when done
await hooks.close();
```

### 3. Integration with Existing Code

**Before** (no audit logging):
```javascript
async function readPatientData(spreadsheetId, range) {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range
  });
  return response.data.values;
}
```

**After** (with audit logging):
```javascript
const hooks = new AuditHooks();

async function readPatientData(spreadsheetId, range) {
  return await hooks.auditSheetsRead(
    async () => {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range
      });
      return response.data.values;
    },
    {
      spreadsheetId,
      range,
      user: 'automation@ssdspc.com',
      purpose: 'patient_data_access',
      phi_categories: ['names', 'dob', 'mrn']
    }
  );
}
```

### 4. Service Account Delegation

```javascript
// Log service account delegation
await hooks.auditServiceAccountDelegation(
  async () => {
    // Your delegation operation
    return await authorize();
  },
  {
    serviceAccount: 'automation@ssdspc.com',
    impersonatedUser: 'user@ssdspc.com',
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive'
    ],
    purpose: 'automated_backup',
    phi_categories: [] // Delegation itself doesn't access PHI
  }
);
```

### 5. Query Examples

**Command Line**:

```bash
# Query all operations by a user
node scripts/audit-query.js query --user automation@ssdspc.com --limit 100

# Query all export operations
node scripts/audit-query.js query --operation export

# Query operations for specific spreadsheet
node scripts/audit-query.js query --resource 1AbC_spreadsheet_id

# Query operations in date range
node scripts/audit-query.js query \
  --start 2025-11-01T00:00:00Z \
  --end 2025-11-30T23:59:59Z

# Generate compliance report
node scripts/audit-query.js report --start 2025-11-01 --end 2025-11-30

# Verify log integrity
node scripts/audit-query.js verify

# Generate security summary
node scripts/audit-query.js summary --days 30
```

**Programmatic**:

```javascript
const logger = new PHIAuditLogger();

// Query logs
const entries = await logger.query({
  operation: 'export',
  startDate: '2025-11-01T00:00:00Z',
  endDate: '2025-11-30T23:59:59Z',
  limit: 100
});

// Verify integrity
const verification = await logger.verifyIntegrity();
console.log(verification.valid ? 'Valid' : 'Invalid');

// Generate compliance report
const report = await logger.generateComplianceReport(
  '2025-11-01T00:00:00Z',
  '2025-11-30T23:59:59Z'
);
```

---

## Monitoring and Alerting

### Real-Time Monitoring

```bash
# Start monitoring (checks every 15 minutes)
node scripts/audit-query.js monitor --interval 15
```

### Programmatic Monitoring

```javascript
const AuditMonitor = require('./lib/audit-monitor');

const monitor = new AuditMonitor({
  // Alert thresholds
  highVolumeAccess: { records: 1000, minutes: 15 },
  consecutiveFailures: 5,
  businessHours: { start: 7, end: 19 },
  knownUsers: [
    'automation@ssdspc.com',
    'backup@ssdspc.com'
  ],
  exportAlert: true,
  deleteAlert: true
});

// Setup alert handler
monitor.onAlert(alert => {
  console.log('🚨 ALERT:', alert.type);
  console.log('   Severity:', alert.severity);
  console.log('   Message:', alert.message);

  // Send email, Slack notification, etc.
});

// Start monitoring
monitor.startMonitoring(15); // Check every 15 minutes

// Later: stop monitoring
monitor.stopMonitoring();
```

### Alert Types

1. **high_volume_access** (Severity: High)
   - Triggered when user accesses more than threshold records in time window
   - Default: 1000 records in 15 minutes

2. **consecutive_failures** (Severity: Medium)
   - Triggered when user has consecutive failed operations
   - Default: 5 consecutive failures

3. **after_hours_access** (Severity: Medium)
   - Triggered when PHI accessed outside business hours
   - Default: Before 7 AM or after 7 PM

4. **unknown_user** (Severity: Critical)
   - Triggered when unknown user accesses PHI
   - Requires `knownUsers` configuration

5. **sensitive_operation** (Severity: High)
   - Triggered on export or delete operations
   - Configurable via `exportAlert` and `deleteAlert`

---

## Compliance Reporting

### Monthly Compliance Report

```bash
node scripts/audit-query.js report \
  --start 2025-11-01 \
  --end 2025-11-30
```

**Report Includes**:
- Total operations
- Unique users
- Success rate
- Operations by type
- Operations by service
- High-volume users
- All failures
- All export operations

### Security Summary

```bash
node scripts/audit-query.js summary --days 30
```

**Summary Includes**:
- Risk score (0-100)
- Top users by activity
- Export operations
- Delete operations
- Failure analysis
- After-hours access count

### Custom Reports

```javascript
const logger = new PHIAuditLogger();

// Get all export operations
const exports = await logger.query({
  operation: 'export',
  startDate: '2025-11-01T00:00:00Z'
});

// Analyze by user
const byUser = {};
exports.forEach(entry => {
  if (!byUser[entry.user]) {
    byUser[entry.user] = [];
  }
  byUser[entry.user].push(entry);
});

// Generate custom report
console.log('Export Operations by User:');
Object.entries(byUser).forEach(([user, operations]) => {
  console.log(`${user}: ${operations.length} exports`);
});
```

---

## Integrity Verification

### How It Works

1. Each log entry contains a hash of the previous entry
2. Genesis hash is generated for first entry
3. Chain of hashes ensures tamper detection
4. Any modification breaks the chain

### Verification

```bash
# Verify entire log
node scripts/audit-query.js verify
```

**Output**:
```
✅ Log integrity verified successfully
   Total entries: 1234
   Status: All entries verified successfully
```

**If Tampered**:
```
❌ Log integrity verification FAILED
   5 invalid entries found

Invalid entries:
  Line 456: Chain break - previous_hash mismatch
  Line 457: Entry hash mismatch - possible tampering
```

### Manual Verification

```javascript
const logger = new PHIAuditLogger();
const result = await logger.verifyIntegrity();

if (!result.valid) {
  console.error('Tampering detected!');
  console.error('Invalid entries:', result.invalidEntries);

  // Alert security team
  // Initiate incident response
}
```

---

## Retention and Archival

### HIPAA Requirements

- **Retention Period**: 6 years minimum
- **Storage**: Must be secure and accessible
- **Integrity**: Must prevent tampering
- **Availability**: Must be retrievable for audits

### Implementation

**Current**: Logs stored in `logs/phi-audit-log.jsonl`

**Future** (when Drive integration ready):
- Automatic backup to Google Drive
- Monthly archival to long-term storage
- Retention policy enforcement

### Manual Archival

```bash
# Archive logs older than 6 years (future implementation)
node scripts/audit-archive.js --before 2019-11-16
```

---

## Security Best Practices

### 1. Protect Log Files

```bash
# Logs directory should be gitignored
echo "logs/" >> .gitignore

# Restrict file permissions (Linux/Mac)
chmod 600 logs/phi-audit-log.jsonl
```

### 2. Regular Integrity Checks

```bash
# Add to cron or GitHub Actions
# Check integrity daily
0 0 * * * cd /path/to/project && node scripts/audit-query.js verify
```

### 3. Monitor for Anomalies

```bash
# Run monitoring as a service
# Check every 15 minutes
nohup node scripts/audit-query.js monitor --interval 15 &
```

### 4. Review Logs Regularly

```bash
# Weekly: Review summary
node scripts/audit-query.js summary --days 7

# Monthly: Generate compliance report
node scripts/audit-query.js report --start YYYY-MM-01 --end YYYY-MM-30
```

### 5. Backup to Google Drive

```javascript
// Enable Drive backup (when integration ready)
const logger = new PHIAuditLogger({
  driveBackupEnabled: true,
  driveFolderId: 'YOUR_DRIVE_FOLDER_ID'
});
```

---

## Troubleshooting

### Log File Doesn't Exist

```bash
# Logger creates file automatically on first write
# Ensure logs/ directory exists
mkdir -p logs/
```

### Integrity Verification Failed

1. Check for file corruption
2. Review recent system changes
3. Check file permissions
4. Contact security team if tampering suspected

### Missing Log Entries

1. Verify operations are using audit hooks
2. Check buffer flush (automatic every 10 entries or 30 seconds)
3. Manually flush: `await logger.flush()`

### High Disk Usage

```bash
# Check log file size
ls -lh logs/phi-audit-log.jsonl

# Archive old logs (manual process)
# Move to long-term storage
```

---

## API Reference

### PHIAuditLogger

```javascript
const logger = new PHIAuditLogger({
  localLogPath: './logs/phi-audit-log.jsonl',
  driveBackupEnabled: true,
  driveFolderId: 'FOLDER_ID',
  retentionYears: 6,
  maxBufferSize: 10,
  flushInterval: 30000
});

// Log entry
await logger.log({ operation, service, ... });

// Query logs
const entries = await logger.query({ filters });

// Verify integrity
const result = await logger.verifyIntegrity();

// Generate report
const report = await logger.generateComplianceReport(start, end);

// Flush buffer
await logger.flush();

// Close logger
await logger.close();
```

### AuditHooks

```javascript
const hooks = new AuditHooks({ config });

// Sheets operations
await hooks.auditSheetsRead(operation, context);
await hooks.auditSheetsWrite(operation, context);
await hooks.auditSheetsExport(operation, context);

// Drive operations
await hooks.auditDriveAccess(operation, context);

// Service account
await hooks.auditServiceAccountDelegation(operation, context);

// Apps Script
await hooks.auditAppsScriptDeployment(operation, context);

// Access denied
await hooks.logAccessDenied(context);

// Close
await hooks.close();

// Get logger
const logger = hooks.getLogger();
```

### AuditMonitor

```javascript
const monitor = new AuditMonitor({ config });

// Setup alert handler
monitor.onAlert(handler);

// Analyze recent activity
const anomalies = await monitor.analyzeRecentActivity(minutes);

// Generate security summary
const summary = await monitor.generateSecuritySummary(start, end);

// Start/stop monitoring
monitor.startMonitoring(intervalMinutes);
monitor.stopMonitoring();
```

---

## Integration Examples

### Snapshot Script

```javascript
const AuditHooks = require('./lib/audit-hooks');

const hooks = new AuditHooks();

async function snapshotSheet(spreadsheetId) {
  // Audit the snapshot operation
  return await hooks.auditSheetsRead(
    async () => {
      // Actual snapshot logic
      const data = await pullSheetData(spreadsheetId);
      await saveSnapshot(data);
      return data;
    },
    {
      spreadsheetId,
      range: 'all',
      user: 'automation@ssdspc.com',
      purpose: 'version_control_snapshot',
      phi_categories: ['names', 'dob', 'mrn', 'phone', 'email']
    }
  );
}
```

### Deployment Script

```javascript
const AuditHooks = require('./lib/audit-hooks');

const hooks = new AuditHooks();

async function deployToProduction(scriptId) {
  return await hooks.auditAppsScriptDeployment(
    async () => {
      // Actual deployment
      await clasp.deploy(scriptId);
    },
    {
      scriptId,
      sheetName: 'Production Sheet',
      version: 'v1.2.3',
      user: 'automation@ssdspc.com',
      purpose: 'code_deployment'
    }
  );
}
```

---

## FAQ

**Q: Do I need to log every operation?**
A: Yes, HIPAA requires logging ALL access to PHI. Use audit hooks for automatic logging.

**Q: How long should I keep logs?**
A: HIPAA requires 6 years minimum. Our system defaults to 6 years.

**Q: What if I forget to use audit hooks?**
A: Pre-commit hooks will scan for PHI operations without audit logging. Fix before committing.

**Q: Can logs be deleted?**
A: No, logs are append-only and must be retained. Only archive after retention period.

**Q: What if integrity verification fails?**
A: Contact security team immediately. Treat as potential security incident.

**Q: How do I know what PHI categories are in my data?**
A: Review spreadsheet columns and identify HIPAA identifiers. Document in code comments.

---

## Support

For questions or issues:
1. Review this documentation
2. Check troubleshooting section
3. Review code comments in `lib/` files
4. Contact security team for compliance questions

---

**Last Updated**: 2025-11-16
**Version**: 1.0.0
**Compliance Status**: ✅ HIPAA-compliant (pending legal review)

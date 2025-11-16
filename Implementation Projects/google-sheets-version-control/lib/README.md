# Library Modules

This directory contains reusable library modules for the Google Sheets Version Control system.

## PHI Audit Logging

**HIPAA-Compliant Audit Logging System**

### Modules

#### `phi-audit-logger.js`
Core audit logging engine with tamper-proof, append-only logging.

**Features**:
- Cryptographic hash chain for integrity verification
- Append-only JSONL storage format
- 6-year retention (HIPAA compliant)
- Query and reporting capabilities
- Automatic integrity verification

**Usage**:
```javascript
const PHIAuditLogger = require('./lib/phi-audit-logger');

const logger = new PHIAuditLogger({
  localLogPath: './logs/phi-audit-log.jsonl',
  driveBackupEnabled: true
});

await logger.log({
  operation: 'read',
  service: 'google-sheets',
  resource_type: 'cell_range',
  resource_id: 'spreadsheet_id',
  phi_categories: ['names', 'dob'],
  record_count: 100,
  purpose: 'backup',
  user: 'automation@ssdspc.com',
  result: 'success'
});

await logger.close();
```

#### `audit-hooks.js`
Wrapper functions that add audit logging to PHI operations.

**Features**:
- Automatic audit logging for common operations
- Exception handling and error logging
- Duration tracking
- Context preservation

**Usage**:
```javascript
const AuditHooks = require('./lib/audit-hooks');

const hooks = new AuditHooks();

// Wrap Sheets read operation
const data = await hooks.auditSheetsRead(
  async () => {
    return await sheets.spreadsheets.values.get({...});
  },
  {
    spreadsheetId: 'id',
    range: 'A1:Z100',
    user: 'automation@ssdspc.com',
    purpose: 'backup',
    phi_categories: ['names', 'dob']
  }
);
```

**Available Hooks**:
- `auditSheetsRead()` - Google Sheets read operations
- `auditSheetsWrite()` - Google Sheets write operations
- `auditSheetsExport()` - Spreadsheet export operations
- `auditDriveAccess()` - Google Drive file access
- `auditServiceAccountDelegation()` - Service account delegation
- `auditAppsScriptDeployment()` - Apps Script deployments
- `logAccessDenied()` - Log denied access attempts

#### `audit-monitor.js`
Real-time monitoring and anomaly detection for audit logs.

**Features**:
- Pattern analysis for suspicious activity
- Configurable alerting thresholds
- Security summary reports
- Risk scoring

**Usage**:
```javascript
const AuditMonitor = require('./lib/audit-monitor');

const monitor = new AuditMonitor({
  highVolumeAccess: { records: 1000, minutes: 15 },
  consecutiveFailures: 5,
  knownUsers: ['automation@ssdspc.com']
});

// Setup alert handler
monitor.onAlert(alert => {
  console.log('ALERT:', alert.message);
  // Send notification
});

// Start monitoring
monitor.startMonitoring(15); // Check every 15 minutes
```

**Alert Types**:
- High-volume access
- Consecutive failures
- After-hours access
- Unknown users
- Sensitive operations (export, delete)

---

## Documentation

**Full Documentation**: See `docs/PHI-AUDIT-LOGGING.md`

**Command-Line Tool**: See `scripts/audit-query.js`

**Security Best Practices**: See `SECURITY_BEST_PRACTICES.md`

---

## Requirements

- Node.js >= 18.0.0
- googleapis package
- Write access to logs directory

---

## Integration

To add audit logging to your scripts:

1. Import audit hooks:
   ```javascript
   const AuditHooks = require('./lib/audit-hooks');
   const hooks = new AuditHooks();
   ```

2. Wrap PHI operations:
   ```javascript
   await hooks.auditSheetsRead(operation, context);
   ```

3. Close when done:
   ```javascript
   await hooks.close();
   ```

---

**Last Updated**: 2025-11-16

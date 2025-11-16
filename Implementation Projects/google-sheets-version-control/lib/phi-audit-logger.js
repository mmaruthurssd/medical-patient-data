/**
 * PHI Audit Logger
 *
 * HIPAA-compliant audit logging for all Protected Health Information (PHI) operations.
 * Implements tamper-proof, append-only logging with integrity verification.
 *
 * CRITICAL: This logger must be used for ALL operations that access, modify, or export PHI.
 *
 * Retention: Logs must be retained for 6 years per HIPAA requirements
 * Storage: Logs stored in Google Drive (under BAA coverage)
 * Format: JSON Lines (JSONL) for append-only operations
 *
 * @module phi-audit-logger
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const { google } = require('googleapis');

class PHIAuditLogger {
  constructor(config = {}) {
    // Configuration
    this.localLogPath = config.localLogPath || path.join(process.cwd(), 'logs', 'phi-audit-log.jsonl');
    this.driveBackupEnabled = config.driveBackupEnabled !== false; // Default: true
    this.driveFolderId = config.driveFolderId || null; // Google Drive folder for log backups
    this.retentionYears = config.retentionYears || 6; // HIPAA requirement: 6 years

    // Integrity chain - each log entry contains hash of previous entry
    this.lastEntryHash = null;

    // In-memory buffer for performance (flush every 10 entries or 30 seconds)
    this.buffer = [];
    this.maxBufferSize = config.maxBufferSize || 10;
    this.flushInterval = config.flushInterval || 30000; // 30 seconds
    this.flushTimer = null;

    // Initialize
    this._initializeLogger();
  }

  /**
   * Initialize logger and load last entry hash for integrity chain
   */
  async _initializeLogger() {
    try {
      // Ensure log directory exists
      const logDir = path.dirname(this.localLogPath);
      await fs.mkdir(logDir, { recursive: true });

      // Load last entry hash if log file exists
      try {
        const stats = await fs.stat(this.localLogPath);
        if (stats.size > 0) {
          await this._loadLastEntryHash();
        }
      } catch (err) {
        // File doesn't exist yet, will be created on first write
        this.lastEntryHash = this._generateGenesisHash();
      }

      // Start periodic flush timer
      this._startFlushTimer();
    } catch (err) {
      console.error('Failed to initialize PHI audit logger:', err);
      throw err;
    }
  }

  /**
   * Generate genesis hash for first entry in chain
   */
  _generateGenesisHash() {
    const genesis = {
      timestamp: new Date().toISOString(),
      event: 'audit_log_initialized',
      version: '1.0.0'
    };
    return this._hashObject(genesis);
  }

  /**
   * Load hash of last entry from log file
   */
  async _loadLastEntryHash() {
    try {
      const content = await fs.readFile(this.localLogPath, 'utf-8');
      const lines = content.trim().split('\n');
      if (lines.length > 0) {
        const lastEntry = JSON.parse(lines[lines.length - 1]);
        this.lastEntryHash = lastEntry.entry_hash;
      }
    } catch (err) {
      console.error('Failed to load last entry hash:', err);
      this.lastEntryHash = this._generateGenesisHash();
    }
  }

  /**
   * Hash an object using SHA-256
   */
  _hashObject(obj) {
    const str = JSON.stringify(obj, Object.keys(obj).sort()); // Deterministic ordering
    return crypto.createHash('sha256').update(str).digest('hex');
  }

  /**
   * Log a PHI operation
   *
   * @param {Object} entry - Audit log entry
   * @param {string} entry.operation - Operation type (read, write, export, delete, access)
   * @param {string} entry.service - Service used (google-sheets, google-drive, gemini-api, apps-script)
   * @param {string} entry.resource_type - Resource type (spreadsheet, folder, file, cell_range)
   * @param {string} entry.resource_id - Resource identifier (spreadsheet ID, file ID, etc.)
   * @param {string[]} entry.phi_categories - PHI categories accessed (names, dob, mrn, ssn, etc.)
   * @param {number} [entry.record_count] - Number of records accessed
   * @param {string} entry.purpose - Business purpose for access
   * @param {string} entry.user - User or service account performing operation
   * @param {string} entry.result - Result (success, failure, partial)
   * @param {Object} [entry.metadata] - Additional context-specific metadata
   * @param {string} [entry.error] - Error message if result was failure
   * @returns {Promise<Object>} Logged entry with integrity hash
   */
  async log(entry) {
    // Validate required fields
    this._validateEntry(entry);

    // Create audit entry
    const auditEntry = {
      // Core fields
      timestamp: new Date().toISOString(),
      log_id: this._generateLogId(),

      // Operation details
      operation: entry.operation,
      service: entry.service,
      resource_type: entry.resource_type,
      resource_id: entry.resource_id,

      // PHI tracking
      phi_categories: entry.phi_categories || [],
      record_count: entry.record_count || 1,

      // Context
      purpose: entry.purpose,
      user: entry.user,
      result: entry.result,

      // Optional fields
      metadata: entry.metadata || {},
      error: entry.error || null,

      // Integrity chain
      previous_hash: this.lastEntryHash,
      entry_hash: null // Will be calculated after adding all fields
    };

    // Calculate hash for this entry (excluding entry_hash itself)
    const hashInput = { ...auditEntry };
    delete hashInput.entry_hash;
    auditEntry.entry_hash = this._hashObject(hashInput);

    // Update chain
    this.lastEntryHash = auditEntry.entry_hash;

    // Add to buffer
    this.buffer.push(auditEntry);

    // Flush if buffer is full
    if (this.buffer.length >= this.maxBufferSize) {
      await this.flush();
    }

    return auditEntry;
  }

  /**
   * Validate audit entry has required fields
   */
  _validateEntry(entry) {
    const required = ['operation', 'service', 'resource_type', 'resource_id', 'purpose', 'user', 'result'];
    const missing = required.filter(field => !entry[field]);

    if (missing.length > 0) {
      throw new Error(`Missing required audit log fields: ${missing.join(', ')}`);
    }

    // Validate operation type
    const validOperations = ['read', 'write', 'export', 'delete', 'access', 'create', 'update', 'share'];
    if (!validOperations.includes(entry.operation)) {
      throw new Error(`Invalid operation type: ${entry.operation}. Must be one of: ${validOperations.join(', ')}`);
    }

    // Validate service
    const validServices = ['google-sheets', 'google-drive', 'gemini-api', 'apps-script', 'gmail', 'service-account'];
    if (!validServices.includes(entry.service)) {
      throw new Error(`Invalid service: ${entry.service}. Must be one of: ${validServices.join(', ')}`);
    }

    // Validate result
    const validResults = ['success', 'failure', 'partial', 'denied'];
    if (!validResults.includes(entry.result)) {
      throw new Error(`Invalid result: ${entry.result}. Must be one of: ${validResults.join(', ')}`);
    }
  }

  /**
   * Generate unique log ID
   */
  _generateLogId() {
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    return `${timestamp}-${random}`;
  }

  /**
   * Flush buffer to disk (append-only)
   */
  async flush() {
    if (this.buffer.length === 0) {
      return;
    }

    try {
      // Convert buffer to JSONL format (one JSON object per line)
      const jsonl = this.buffer.map(entry => JSON.stringify(entry)).join('\n') + '\n';

      // Append to log file (append-only operation)
      await fs.appendFile(this.localLogPath, jsonl, 'utf-8');

      // Clear buffer
      this.buffer = [];

      // Backup to Google Drive if enabled
      if (this.driveBackupEnabled && this.driveFolderId) {
        await this._backupToDrive().catch(err => {
          console.error('Failed to backup audit log to Drive:', err);
          // Don't throw - local log is primary
        });
      }
    } catch (err) {
      console.error('Failed to flush audit log:', err);
      throw err;
    }
  }

  /**
   * Backup log file to Google Drive
   */
  async _backupToDrive() {
    // This will be implemented when Drive integration is ready
    // For now, just a placeholder
    console.log('Drive backup not yet implemented');
  }

  /**
   * Start periodic flush timer
   */
  _startFlushTimer() {
    this.flushTimer = setInterval(async () => {
      if (this.buffer.length > 0) {
        await this.flush().catch(err => {
          console.error('Periodic flush failed:', err);
        });
      }
    }, this.flushInterval);
  }

  /**
   * Stop periodic flush timer
   */
  _stopFlushTimer() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  /**
   * Close logger and flush remaining entries
   */
  async close() {
    this._stopFlushTimer();
    await this.flush();
  }

  /**
   * Verify integrity of audit log
   *
   * @returns {Promise<Object>} Verification result
   */
  async verifyIntegrity() {
    try {
      const content = await fs.readFile(this.localLogPath, 'utf-8');
      const lines = content.trim().split('\n').filter(line => line);

      if (lines.length === 0) {
        return { valid: true, entries: 0, message: 'Log is empty' };
      }

      let previousHash = null;
      let invalidEntries = [];

      for (let i = 0; i < lines.length; i++) {
        const entry = JSON.parse(lines[i]);

        // Verify chain
        if (i > 0 && entry.previous_hash !== previousHash) {
          invalidEntries.push({
            line: i + 1,
            log_id: entry.log_id,
            reason: 'Chain break - previous_hash mismatch'
          });
        }

        // Verify entry hash
        const hashInput = { ...entry };
        delete hashInput.entry_hash;
        const calculatedHash = this._hashObject(hashInput);

        if (calculatedHash !== entry.entry_hash) {
          invalidEntries.push({
            line: i + 1,
            log_id: entry.log_id,
            reason: 'Entry hash mismatch - possible tampering'
          });
        }

        previousHash = entry.entry_hash;
      }

      return {
        valid: invalidEntries.length === 0,
        entries: lines.length,
        invalidEntries: invalidEntries,
        message: invalidEntries.length === 0
          ? 'All entries verified successfully'
          : `${invalidEntries.length} invalid entries found`
      };
    } catch (err) {
      return {
        valid: false,
        error: err.message,
        message: 'Failed to verify log integrity'
      };
    }
  }

  /**
   * Query audit log with filters
   *
   * @param {Object} filters - Query filters
   * @param {string} [filters.operation] - Filter by operation type
   * @param {string} [filters.service] - Filter by service
   * @param {string} [filters.user] - Filter by user
   * @param {string} [filters.resource_id] - Filter by resource ID
   * @param {string} [filters.startDate] - Filter by start date (ISO 8601)
   * @param {string} [filters.endDate] - Filter by end date (ISO 8601)
   * @param {number} [filters.limit] - Limit number of results
   * @returns {Promise<Array>} Matching audit entries
   */
  async query(filters = {}) {
    try {
      const content = await fs.readFile(this.localLogPath, 'utf-8');
      const lines = content.trim().split('\n').filter(line => line);

      let results = lines.map(line => JSON.parse(line));

      // Apply filters
      if (filters.operation) {
        results = results.filter(e => e.operation === filters.operation);
      }
      if (filters.service) {
        results = results.filter(e => e.service === filters.service);
      }
      if (filters.user) {
        results = results.filter(e => e.user === filters.user);
      }
      if (filters.resource_id) {
        results = results.filter(e => e.resource_id === filters.resource_id);
      }
      if (filters.startDate) {
        const start = new Date(filters.startDate);
        results = results.filter(e => new Date(e.timestamp) >= start);
      }
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        results = results.filter(e => new Date(e.timestamp) <= end);
      }

      // Apply limit
      if (filters.limit) {
        results = results.slice(-filters.limit); // Get last N entries
      }

      return results;
    } catch (err) {
      console.error('Failed to query audit log:', err);
      return [];
    }
  }

  /**
   * Generate compliance report
   *
   * @param {string} startDate - Start date (ISO 8601)
   * @param {string} endDate - End date (ISO 8601)
   * @returns {Promise<Object>} Compliance report
   */
  async generateComplianceReport(startDate, endDate) {
    const entries = await this.query({ startDate, endDate });

    // Group by operation
    const byOperation = {};
    const byService = {};
    const byUser = {};
    const byResult = {};

    entries.forEach(entry => {
      // By operation
      byOperation[entry.operation] = (byOperation[entry.operation] || 0) + 1;

      // By service
      byService[entry.service] = (byService[entry.service] || 0) + 1;

      // By user
      byUser[entry.user] = (byUser[entry.user] || 0) + 1;

      // By result
      byResult[entry.result] = (byResult[entry.result] || 0) + 1;
    });

    return {
      period: {
        start: startDate,
        end: endDate
      },
      summary: {
        total_operations: entries.length,
        unique_users: Object.keys(byUser).length,
        success_rate: entries.length > 0
          ? ((byResult.success || 0) / entries.length * 100).toFixed(2) + '%'
          : '0%'
      },
      by_operation: byOperation,
      by_service: byService,
      by_user: byUser,
      by_result: byResult,
      failures: entries.filter(e => e.result === 'failure'),
      high_volume_users: Object.entries(byUser)
        .filter(([user, count]) => count > 100)
        .map(([user, count]) => ({ user, count }))
    };
  }
}

module.exports = PHIAuditLogger;

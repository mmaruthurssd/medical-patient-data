/**
 * Audit Hooks for PHI Operations
 *
 * Wrapper functions that add audit logging to critical PHI operations.
 * These hooks should be used for ALL Google Sheets, Drive, and Apps Script operations
 * that access Protected Health Information.
 *
 * @module audit-hooks
 */

const PHIAuditLogger = require('./phi-audit-logger');

class AuditHooks {
  constructor(config = {}) {
    this.logger = new PHIAuditLogger(config);
    this.enabled = config.enabled !== false; // Default: enabled
  }

  /**
   * Wrap Google Sheets read operation with audit logging
   *
   * @param {Function} operation - Async function that reads from sheet
   * @param {Object} context - Audit context
   * @param {string} context.spreadsheetId - Spreadsheet ID
   * @param {string} context.range - Cell range being read
   * @param {string} context.user - User or service account
   * @param {string} context.purpose - Business purpose
   * @param {string[]} [context.phi_categories] - PHI categories in range
   * @returns {Promise<any>} Result of operation
   */
  async auditSheetsRead(operation, context) {
    const startTime = Date.now();
    let result = null;
    let error = null;
    let auditResult = 'success';

    try {
      // Execute operation
      result = await operation();

      // Count records if result is array
      const recordCount = Array.isArray(result) ? result.length : 1;

      // Log successful read
      if (this.enabled) {
        await this.logger.log({
          operation: 'read',
          service: 'google-sheets',
          resource_type: 'cell_range',
          resource_id: context.spreadsheetId,
          phi_categories: context.phi_categories || ['unknown'],
          record_count: recordCount,
          purpose: context.purpose,
          user: context.user,
          result: 'success',
          metadata: {
            range: context.range,
            duration_ms: Date.now() - startTime
          }
        });
      }

      return result;
    } catch (err) {
      error = err;
      auditResult = 'failure';

      // Log failed read
      if (this.enabled) {
        await this.logger.log({
          operation: 'read',
          service: 'google-sheets',
          resource_type: 'cell_range',
          resource_id: context.spreadsheetId,
          phi_categories: context.phi_categories || ['unknown'],
          record_count: 0,
          purpose: context.purpose,
          user: context.user,
          result: 'failure',
          error: err.message,
          metadata: {
            range: context.range,
            duration_ms: Date.now() - startTime
          }
        });
      }

      throw err;
    }
  }

  /**
   * Wrap Google Sheets write operation with audit logging
   *
   * @param {Function} operation - Async function that writes to sheet
   * @param {Object} context - Audit context
   * @returns {Promise<any>} Result of operation
   */
  async auditSheetsWrite(operation, context) {
    const startTime = Date.now();
    let result = null;
    let error = null;

    try {
      result = await operation();

      const recordCount = Array.isArray(context.data) ? context.data.length : 1;

      if (this.enabled) {
        await this.logger.log({
          operation: 'write',
          service: 'google-sheets',
          resource_type: 'cell_range',
          resource_id: context.spreadsheetId,
          phi_categories: context.phi_categories || ['unknown'],
          record_count: recordCount,
          purpose: context.purpose,
          user: context.user,
          result: 'success',
          metadata: {
            range: context.range,
            duration_ms: Date.now() - startTime
          }
        });
      }

      return result;
    } catch (err) {
      error = err;

      if (this.enabled) {
        await this.logger.log({
          operation: 'write',
          service: 'google-sheets',
          resource_type: 'cell_range',
          resource_id: context.spreadsheetId,
          phi_categories: context.phi_categories || ['unknown'],
          record_count: 0,
          purpose: context.purpose,
          user: context.user,
          result: 'failure',
          error: err.message,
          metadata: {
            range: context.range,
            duration_ms: Date.now() - startTime
          }
        });
      }

      throw err;
    }
  }

  /**
   * Wrap Google Sheets export operation with audit logging
   *
   * @param {Function} operation - Async function that exports sheet
   * @param {Object} context - Audit context
   * @returns {Promise<any>} Result of operation
   */
  async auditSheetsExport(operation, context) {
    const startTime = Date.now();

    try {
      const result = await operation();

      if (this.enabled) {
        await this.logger.log({
          operation: 'export',
          service: 'google-sheets',
          resource_type: 'spreadsheet',
          resource_id: context.spreadsheetId,
          phi_categories: context.phi_categories || ['unknown'],
          record_count: context.recordCount || 1,
          purpose: context.purpose,
          user: context.user,
          result: 'success',
          metadata: {
            export_format: context.format || 'unknown',
            destination: context.destination,
            duration_ms: Date.now() - startTime
          }
        });
      }

      return result;
    } catch (err) {
      if (this.enabled) {
        await this.logger.log({
          operation: 'export',
          service: 'google-sheets',
          resource_type: 'spreadsheet',
          resource_id: context.spreadsheetId,
          phi_categories: context.phi_categories || ['unknown'],
          record_count: 0,
          purpose: context.purpose,
          user: context.user,
          result: 'failure',
          error: err.message,
          metadata: {
            export_format: context.format || 'unknown',
            duration_ms: Date.now() - startTime
          }
        });
      }

      throw err;
    }
  }

  /**
   * Wrap service account delegation with audit logging
   *
   * @param {Function} operation - Async function using service account
   * @param {Object} context - Audit context
   * @returns {Promise<any>} Result of operation
   */
  async auditServiceAccountDelegation(operation, context) {
    const startTime = Date.now();

    try {
      const result = await operation();

      if (this.enabled) {
        await this.logger.log({
          operation: 'access',
          service: 'service-account',
          resource_type: 'delegation',
          resource_id: context.serviceAccount,
          phi_categories: context.phi_categories || [],
          record_count: 0,
          purpose: context.purpose,
          user: context.impersonatedUser || context.serviceAccount,
          result: 'success',
          metadata: {
            scopes: context.scopes || [],
            impersonated_user: context.impersonatedUser,
            duration_ms: Date.now() - startTime
          }
        });
      }

      return result;
    } catch (err) {
      if (this.enabled) {
        await this.logger.log({
          operation: 'access',
          service: 'service-account',
          resource_type: 'delegation',
          resource_id: context.serviceAccount,
          phi_categories: [],
          record_count: 0,
          purpose: context.purpose,
          user: context.impersonatedUser || context.serviceAccount,
          result: 'failure',
          error: err.message,
          metadata: {
            scopes: context.scopes || [],
            duration_ms: Date.now() - startTime
          }
        });
      }

      throw err;
    }
  }

  /**
   * Wrap Drive file access with audit logging
   *
   * @param {Function} operation - Async function accessing Drive file
   * @param {Object} context - Audit context
   * @returns {Promise<any>} Result of operation
   */
  async auditDriveAccess(operation, context) {
    const startTime = Date.now();

    try {
      const result = await operation();

      if (this.enabled) {
        await this.logger.log({
          operation: context.operation || 'read',
          service: 'google-drive',
          resource_type: 'file',
          resource_id: context.fileId,
          phi_categories: context.phi_categories || ['unknown'],
          record_count: 1,
          purpose: context.purpose,
          user: context.user,
          result: 'success',
          metadata: {
            file_name: context.fileName,
            mime_type: context.mimeType,
            duration_ms: Date.now() - startTime
          }
        });
      }

      return result;
    } catch (err) {
      if (this.enabled) {
        await this.logger.log({
          operation: context.operation || 'read',
          service: 'google-drive',
          resource_type: 'file',
          resource_id: context.fileId,
          phi_categories: context.phi_categories || ['unknown'],
          record_count: 0,
          purpose: context.purpose,
          user: context.user,
          result: 'failure',
          error: err.message,
          metadata: {
            file_name: context.fileName,
            duration_ms: Date.now() - startTime
          }
        });
      }

      throw err;
    }
  }

  /**
   * Wrap Apps Script deployment with audit logging
   *
   * @param {Function} operation - Async function deploying Apps Script
   * @param {Object} context - Audit context
   * @returns {Promise<any>} Result of operation
   */
  async auditAppsScriptDeployment(operation, context) {
    const startTime = Date.now();

    try {
      const result = await operation();

      if (this.enabled) {
        await this.logger.log({
          operation: 'update',
          service: 'apps-script',
          resource_type: 'script_project',
          resource_id: context.scriptId,
          phi_categories: [], // Deployment doesn't access PHI directly
          record_count: 0,
          purpose: context.purpose,
          user: context.user,
          result: 'success',
          metadata: {
            sheet_name: context.sheetName,
            script_version: context.version,
            duration_ms: Date.now() - startTime
          }
        });
      }

      return result;
    } catch (err) {
      if (this.enabled) {
        await this.logger.log({
          operation: 'update',
          service: 'apps-script',
          resource_type: 'script_project',
          resource_id: context.scriptId,
          phi_categories: [],
          record_count: 0,
          purpose: context.purpose,
          user: context.user,
          result: 'failure',
          error: err.message,
          metadata: {
            sheet_name: context.sheetName,
            duration_ms: Date.now() - startTime
          }
        });
      }

      throw err;
    }
  }

  /**
   * Log access denial (when operation is rejected before execution)
   */
  async logAccessDenied(context) {
    if (this.enabled) {
      await this.logger.log({
        operation: context.operation || 'access',
        service: context.service,
        resource_type: context.resource_type,
        resource_id: context.resource_id,
        phi_categories: context.phi_categories || [],
        record_count: 0,
        purpose: context.purpose || 'unknown',
        user: context.user,
        result: 'denied',
        error: context.reason,
        metadata: context.metadata || {}
      });
    }
  }

  /**
   * Flush remaining log entries and close logger
   */
  async close() {
    await this.logger.close();
  }

  /**
   * Get logger instance for direct access
   */
  getLogger() {
    return this.logger;
  }
}

module.exports = AuditHooks;

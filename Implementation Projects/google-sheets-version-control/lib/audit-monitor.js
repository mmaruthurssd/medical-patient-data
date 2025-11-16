/**
 * PHI Audit Monitor
 *
 * Monitors audit logs for suspicious patterns, unusual access, and potential security incidents.
 * Implements real-time alerting for HIPAA compliance violations.
 *
 * @module audit-monitor
 */

const PHIAuditLogger = require('./phi-audit-logger');

class AuditMonitor {
  constructor(config = {}) {
    this.logger = new PHIAuditLogger(config);
    this.alertThresholds = {
      // Alert if user accesses more than N records in M minutes
      highVolumeAccess: config.highVolumeAccess || { records: 1000, minutes: 15 },

      // Alert if same user has N consecutive failures
      consecutiveFailures: config.consecutiveFailures || 5,

      // Alert if unusual time access (outside business hours)
      businessHours: config.businessHours || { start: 7, end: 19 }, // 7 AM - 7 PM

      // Alert if access from unusual user
      knownUsers: config.knownUsers || [],

      // Alert if export operation
      exportAlert: config.exportAlert !== false, // Default: true

      // Alert if delete operation
      deleteAlert: config.deleteAlert !== false, // Default: true
    };

    this.alertHandlers = [];
  }

  /**
   * Register alert handler
   *
   * @param {Function} handler - Function called when alert is triggered
   */
  onAlert(handler) {
    this.alertHandlers.push(handler);
  }

  /**
   * Trigger alert
   */
  async _triggerAlert(alert) {
    console.warn('🚨 SECURITY ALERT:', alert.message);

    for (const handler of this.alertHandlers) {
      try {
        await handler(alert);
      } catch (err) {
        console.error('Alert handler failed:', err);
      }
    }
  }

  /**
   * Analyze recent activity for anomalies
   *
   * @param {number} [lookbackMinutes=60] - How far back to analyze
   * @returns {Promise<Array>} List of detected anomalies
   */
  async analyzeRecentActivity(lookbackMinutes = 60) {
    const startDate = new Date(Date.now() - lookbackMinutes * 60 * 1000).toISOString();
    const entries = await this.logger.query({ startDate });

    const anomalies = [];

    // Check for high-volume access
    const highVolumeUsers = this._detectHighVolumeAccess(entries);
    highVolumeUsers.forEach(user => {
      anomalies.push({
        type: 'high_volume_access',
        severity: 'high',
        user: user.user,
        recordCount: user.recordCount,
        message: `User ${user.user} accessed ${user.recordCount} records in ${lookbackMinutes} minutes`,
        timestamp: new Date().toISOString()
      });
    });

    // Check for consecutive failures
    const failureUsers = this._detectConsecutiveFailures(entries);
    failureUsers.forEach(user => {
      anomalies.push({
        type: 'consecutive_failures',
        severity: 'medium',
        user: user.user,
        failureCount: user.failureCount,
        message: `User ${user.user} had ${user.failureCount} consecutive failures`,
        timestamp: new Date().toISOString()
      });
    });

    // Check for after-hours access
    const afterHoursAccess = this._detectAfterHoursAccess(entries);
    afterHoursAccess.forEach(entry => {
      anomalies.push({
        type: 'after_hours_access',
        severity: 'medium',
        user: entry.user,
        time: entry.timestamp,
        message: `User ${entry.user} accessed PHI outside business hours at ${entry.timestamp}`,
        timestamp: new Date().toISOString()
      });
    });

    // Check for unknown users
    const unknownUsers = this._detectUnknownUsers(entries);
    unknownUsers.forEach(user => {
      anomalies.push({
        type: 'unknown_user',
        severity: 'critical',
        user: user.user,
        message: `Unknown user ${user.user} accessed PHI`,
        timestamp: new Date().toISOString()
      });
    });

    // Check for sensitive operations
    const sensitiveOps = this._detectSensitiveOperations(entries);
    sensitiveOps.forEach(op => {
      anomalies.push({
        type: 'sensitive_operation',
        severity: 'high',
        user: op.user,
        operation: op.operation,
        resource: op.resource_id,
        message: `User ${op.user} performed ${op.operation} operation on ${op.resource_id}`,
        timestamp: new Date().toISOString()
      });
    });

    // Trigger alerts
    for (const anomaly of anomalies) {
      await this._triggerAlert(anomaly);
    }

    return anomalies;
  }

  /**
   * Detect high-volume access patterns
   */
  _detectHighVolumeAccess(entries) {
    const userRecords = {};

    entries.forEach(entry => {
      if (!userRecords[entry.user]) {
        userRecords[entry.user] = 0;
      }
      userRecords[entry.user] += entry.record_count || 0;
    });

    return Object.entries(userRecords)
      .filter(([user, count]) => count > this.alertThresholds.highVolumeAccess.records)
      .map(([user, recordCount]) => ({ user, recordCount }));
  }

  /**
   * Detect consecutive failures
   */
  _detectConsecutiveFailures(entries) {
    const userFailures = {};

    entries.forEach(entry => {
      if (!userFailures[entry.user]) {
        userFailures[entry.user] = { consecutive: 0, max: 0 };
      }

      if (entry.result === 'failure') {
        userFailures[entry.user].consecutive++;
        userFailures[entry.user].max = Math.max(
          userFailures[entry.user].max,
          userFailures[entry.user].consecutive
        );
      } else {
        userFailures[entry.user].consecutive = 0;
      }
    });

    return Object.entries(userFailures)
      .filter(([user, failures]) => failures.max >= this.alertThresholds.consecutiveFailures)
      .map(([user, failures]) => ({ user, failureCount: failures.max }));
  }

  /**
   * Detect after-hours access
   */
  _detectAfterHoursAccess(entries) {
    return entries.filter(entry => {
      const hour = new Date(entry.timestamp).getHours();
      return hour < this.alertThresholds.businessHours.start ||
             hour >= this.alertThresholds.businessHours.end;
    });
  }

  /**
   * Detect unknown users
   */
  _detectUnknownUsers(entries) {
    if (this.alertThresholds.knownUsers.length === 0) {
      return []; // No known users configured, skip this check
    }

    const unknownEntries = entries.filter(entry => {
      return !this.alertThresholds.knownUsers.includes(entry.user);
    });

    // Group by user
    const userCounts = {};
    unknownEntries.forEach(entry => {
      userCounts[entry.user] = (userCounts[entry.user] || 0) + 1;
    });

    return Object.entries(userCounts).map(([user, count]) => ({ user, count }));
  }

  /**
   * Detect sensitive operations
   */
  _detectSensitiveOperations(entries) {
    const sensitive = [];

    entries.forEach(entry => {
      // Alert on exports
      if (this.alertThresholds.exportAlert && entry.operation === 'export') {
        sensitive.push(entry);
      }

      // Alert on deletes
      if (this.alertThresholds.deleteAlert && entry.operation === 'delete') {
        sensitive.push(entry);
      }
    });

    return sensitive;
  }

  /**
   * Generate security summary report
   *
   * @param {string} startDate - Start date (ISO 8601)
   * @param {string} endDate - End date (ISO 8601)
   * @returns {Promise<Object>} Security summary
   */
  async generateSecuritySummary(startDate, endDate) {
    const entries = await this.logger.query({ startDate, endDate });

    const summary = {
      period: { start: startDate, end: endDate },
      total_operations: entries.length,

      by_result: this._groupBy(entries, 'result'),
      by_operation: this._groupBy(entries, 'operation'),
      by_service: this._groupBy(entries, 'service'),

      top_users: this._getTopUsers(entries, 10),

      failures: entries.filter(e => e.result === 'failure').map(e => ({
        timestamp: e.timestamp,
        user: e.user,
        operation: e.operation,
        resource: e.resource_id,
        error: e.error
      })),

      exports: entries.filter(e => e.operation === 'export').map(e => ({
        timestamp: e.timestamp,
        user: e.user,
        resource: e.resource_id,
        destination: e.metadata?.destination
      })),

      deletes: entries.filter(e => e.operation === 'delete').map(e => ({
        timestamp: e.timestamp,
        user: e.user,
        resource: e.resource_id
      })),

      after_hours: this._detectAfterHoursAccess(entries).length,

      risk_score: this._calculateRiskScore(entries)
    };

    return summary;
  }

  /**
   * Group entries by field
   */
  _groupBy(entries, field) {
    const groups = {};
    entries.forEach(entry => {
      const value = entry[field];
      groups[value] = (groups[value] || 0) + 1;
    });
    return groups;
  }

  /**
   * Get top users by operation count
   */
  _getTopUsers(entries, limit = 10) {
    const userCounts = {};
    entries.forEach(entry => {
      userCounts[entry.user] = (userCounts[entry.user] || 0) + 1;
    });

    return Object.entries(userCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([user, count]) => ({ user, operations: count }));
  }

  /**
   * Calculate risk score based on activity patterns
   */
  _calculateRiskScore(entries) {
    let score = 0;

    // Failure rate
    const failureRate = entries.filter(e => e.result === 'failure').length / Math.max(entries.length, 1);
    score += failureRate * 30; // Max 30 points

    // Export count
    const exportCount = entries.filter(e => e.operation === 'export').length;
    score += Math.min(exportCount * 5, 20); // Max 20 points

    // Delete count
    const deleteCount = entries.filter(e => e.operation === 'delete').length;
    score += Math.min(deleteCount * 10, 20); // Max 20 points

    // After hours access
    const afterHoursCount = this._detectAfterHoursAccess(entries).length;
    const afterHoursRate = afterHoursCount / Math.max(entries.length, 1);
    score += afterHoursRate * 30; // Max 30 points

    return Math.min(Math.round(score), 100); // Cap at 100
  }

  /**
   * Start continuous monitoring
   *
   * @param {number} [intervalMinutes=15] - How often to check for anomalies
   */
  startMonitoring(intervalMinutes = 15) {
    console.log(`Starting PHI audit monitoring (checking every ${intervalMinutes} minutes)...`);

    this.monitoringInterval = setInterval(async () => {
      try {
        const anomalies = await this.analyzeRecentActivity(intervalMinutes);
        if (anomalies.length > 0) {
          console.log(`Detected ${anomalies.length} anomalies in the last ${intervalMinutes} minutes`);
        }
      } catch (err) {
        console.error('Monitoring check failed:', err);
      }
    }, intervalMinutes * 60 * 1000);
  }

  /**
   * Stop continuous monitoring
   */
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('Stopped PHI audit monitoring');
    }
  }
}

module.exports = AuditMonitor;

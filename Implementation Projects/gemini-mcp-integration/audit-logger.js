/**
 * Audit Logger
 *
 * HIPAA-compliant audit logging for Gemini MCP operations.
 * Logs all PHI-related operations and MCP tool calls.
 */

const fs = require('fs').promises;
const path = require('path');
const PHIGuard = require('../../google-workspace-oauth-setup/phi-guard');

class AuditLogger {
  constructor(options = {}) {
    this.logPath = options.logPath || path.join(process.cwd(), 'gemini-mcp-audit-log.json');
    this.guard = new PHIGuard();
    this.entries = [];
    this.autoSync = options.autoSync !== false; // Default true
    this.syncThreshold = options.syncThreshold || 10; // Sync every 10 entries
  }

  /**
   * Log an audit entry
   */
  async log(entry) {
    const auditEntry = {
      id: this.generateId(),
      timestamp: entry.timestamp || new Date().toISOString(),
      action: entry.action,
      ...entry,
      metadata: {
        userAgent: entry.userAgent || 'gemini-mcp-bridge',
        ip: entry.ip || 'localhost',
        ...entry.metadata
      }
    };

    // Detect PHI in parameters if present
    if (entry.parameters) {
      const paramsStr = JSON.stringify(entry.parameters);
      const detection = this.guard.detectPHI(paramsStr);

      if (detection.hasPHI) {
        auditEntry.phiDetected = true;
        auditEntry.phiTypes = detection.phiTypes;
        auditEntry.phiCount = detection.phiCount;

        console.warn(`⚠️ PHI detected in ${entry.action}: ${detection.phiTypes.join(', ')}`);
      } else {
        auditEntry.phiDetected = false;
      }
    }

    this.entries.push(auditEntry);

    // Auto-sync if threshold reached
    if (this.autoSync && this.entries.length >= this.syncThreshold) {
      await this.sync();
    }

    return auditEntry;
  }

  /**
   * Log Gemini API call
   */
  async logGeminiCall(params) {
    return await this.log({
      action: 'gemini_api_call',
      model: params.model,
      inputTokens: params.inputTokens,
      outputTokens: params.outputTokens,
      hasFunctionCalling: params.hasFunctionCalling || false,
      functionsUsed: params.functionsUsed || [],
      success: params.success,
      error: params.error,
      duration: params.duration
    });
  }

  /**
   * Log MCP tool call
   */
  async logMCPCall(params) {
    return await this.log({
      action: 'mcp_call',
      serverName: params.serverName,
      toolName: params.toolName,
      parameters: params.parameters,
      result: params.result,
      duration: params.duration,
      ip: params.ip
    });
  }

  /**
   * Log PHI detection/de-identification
   */
  async logPHIOperation(params) {
    return await this.log({
      action: 'phi_operation',
      operation: params.operation, // 'detect' or 'deidentify'
      hasPHI: params.hasPHI,
      phiTypes: params.phiTypes,
      phiCount: params.phiCount,
      inputLength: params.inputLength,
      outputLength: params.outputLength
    });
  }

  /**
   * Sync entries to disk
   */
  async sync() {
    if (this.entries.length === 0) {
      return { success: true, entriesSynced: 0 };
    }

    try {
      // Read existing log
      let existingLog = { entries: [] };

      try {
        const data = await fs.readFile(this.logPath, 'utf-8');
        existingLog = JSON.parse(data);
      } catch (error) {
        // File doesn't exist yet, that's OK
      }

      // Append new entries
      existingLog.entries = existingLog.entries.concat(this.entries);

      // Add metadata
      existingLog.metadata = {
        lastUpdated: new Date().toISOString(),
        totalEntries: existingLog.entries.length,
        version: '1.0'
      };

      // Write to file
      await fs.writeFile(
        this.logPath,
        JSON.stringify(existingLog, null, 2),
        'utf-8'
      );

      const count = this.entries.length;
      this.entries = []; // Clear synced entries

      console.log(`📝 Audit log synced (${count} entries)`);

      return {
        success: true,
        entriesSynced: count,
        totalEntries: existingLog.entries.length
      };

    } catch (error) {
      console.error('Failed to sync audit log:', error);
      throw error;
    }
  }

  /**
   * Query audit log
   */
  async query(filters = {}) {
    try {
      const data = await fs.readFile(this.logPath, 'utf-8');
      const log = JSON.parse(data);

      let results = log.entries || [];

      // Filter by action
      if (filters.action) {
        results = results.filter(e => e.action === filters.action);
      }

      // Filter by date range
      if (filters.startDate) {
        results = results.filter(e => new Date(e.timestamp) >= new Date(filters.startDate));
      }
      if (filters.endDate) {
        results = results.filter(e => new Date(e.timestamp) <= new Date(filters.endDate));
      }

      // Filter by PHI detected
      if (filters.phiDetected !== undefined) {
        results = results.filter(e => e.phiDetected === filters.phiDetected);
      }

      // Filter by server
      if (filters.serverName) {
        results = results.filter(e => e.serverName === filters.serverName);
      }

      // Filter by tool
      if (filters.toolName) {
        results = results.filter(e => e.toolName === filters.toolName);
      }

      // Sort by timestamp (newest first)
      results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      // Limit results
      if (filters.limit) {
        results = results.slice(0, filters.limit);
      }

      return {
        success: true,
        count: results.length,
        entries: results
      };

    } catch (error) {
      if (error.code === 'ENOENT') {
        return { success: true, count: 0, entries: [] };
      }
      throw error;
    }
  }

  /**
   * Get statistics from audit log
   */
  async getStats(options = {}) {
    const data = await fs.readFile(this.logPath, 'utf-8');
    const log = JSON.parse(data);

    const entries = log.entries || [];

    // Apply date range filter
    let filtered = entries;
    if (options.startDate) {
      filtered = filtered.filter(e => new Date(e.timestamp) >= new Date(options.startDate));
    }
    if (options.endDate) {
      filtered = filtered.filter(e => new Date(e.timestamp) <= new Date(options.endDate));
    }

    // Count by action
    const actionCounts = {};
    for (const entry of filtered) {
      actionCounts[entry.action] = (actionCounts[entry.action] || 0) + 1;
    }

    // PHI detection stats
    const phiEntries = filtered.filter(e => e.phiDetected === true);
    const phiTypesCounts = {};

    for (const entry of phiEntries) {
      if (entry.phiTypes) {
        for (const type of entry.phiTypes) {
          phiTypesCounts[type] = (phiTypesCounts[type] || 0) + 1;
        }
      }
    }

    // MCP tool usage
    const toolUsage = {};
    const mcpEntries = filtered.filter(e => e.action === 'mcp_call');

    for (const entry of mcpEntries) {
      const key = `${entry.serverName}.${entry.toolName}`;
      toolUsage[key] = (toolUsage[key] || 0) + 1;
    }

    return {
      success: true,
      totalEntries: filtered.length,
      dateRange: {
        start: options.startDate || 'all time',
        end: options.endDate || 'now'
      },
      actionCounts,
      phiDetection: {
        total: phiEntries.length,
        percentage: filtered.length > 0 ? ((phiEntries.length / filtered.length) * 100).toFixed(2) : 0,
        typeBreakdown: phiTypesCounts
      },
      mcpToolUsage: {
        total: mcpEntries.length,
        topTools: Object.entries(toolUsage)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([tool, count]) => ({ tool, count }))
      }
    };
  }

  /**
   * Generate unique ID for entry
   */
  generateId() {
    return `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Force sync before shutdown
   */
  async flush() {
    if (this.entries.length > 0) {
      await this.sync();
    }
  }
}

module.exports = { AuditLogger };

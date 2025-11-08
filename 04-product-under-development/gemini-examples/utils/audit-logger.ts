/**
 * Audit Logger for HIPAA Compliance
 *
 * Logs all PHI access and Gemini API calls for audit trail
 * REQUIRED for HIPAA compliance
 */

import * as fs from 'fs/promises';
import * as path from 'path';

export interface AuditEntry {
  timestamp: string;
  userId: string;
  action: string;
  resource: string;
  status: 'success' | 'failure';
  phiAccessed?: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

/**
 * Log an audit entry
 *
 * All PHI access MUST be logged per HIPAA requirements
 */
export async function auditLog(entry: AuditEntry): Promise<void> {
  const logPath = process.env.AUDIT_LOG_PATH || './logs/audit.log';
  const logDir = path.dirname(logPath);

  try {
    // Ensure log directory exists
    await fs.mkdir(logDir, { recursive: true });

    // Create log entry
    const logEntry = JSON.stringify({
      ...entry,
      timestamp: entry.timestamp || new Date().toISOString(),
      phiAccessed: entry.phiAccessed || false
    }) + '\n';

    // Append to log file
    await fs.appendFile(logPath, logEntry);

    // If this is a failure or PHI access, also log to console
    if (entry.status === 'failure' || entry.phiAccessed) {
      console.log(`[AUDIT] ${entry.action} - ${entry.status}`, {
        userId: entry.userId,
        resource: entry.resource,
        phiAccessed: entry.phiAccessed
      });
    }

  } catch (error) {
    // Critical: If audit logging fails, we must know
    console.error('❌ CRITICAL: Audit logging failed', error);
    throw new Error('Audit logging failure - operation aborted for compliance');
  }
}

/**
 * Query audit logs (for compliance reviews)
 */
export async function queryAuditLogs(
  startDate: Date,
  endDate: Date,
  userId?: string
): Promise<AuditEntry[]> {
  const logPath = process.env.AUDIT_LOG_PATH || './logs/audit.log';

  try {
    const content = await fs.readFile(logPath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());

    const entries = lines.map(line => JSON.parse(line) as AuditEntry);

    // Filter by date range
    const filtered = entries.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= startDate && entryDate <= endDate;
    });

    // Filter by user if specified
    if (userId) {
      return filtered.filter(entry => entry.userId === userId);
    }

    return filtered;

  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // Log file doesn't exist yet
      return [];
    }
    throw error;
  }
}

/**
 * Get audit statistics (for compliance reporting)
 */
export async function getAuditStats(days: number = 30): Promise<{
  totalAccesses: number;
  phiAccesses: number;
  failures: number;
  uniqueUsers: number;
  topActions: Array<{ action: string; count: number }>;
}> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const entries = await queryAuditLogs(startDate, endDate);

  const phiAccesses = entries.filter(e => e.phiAccessed).length;
  const failures = entries.filter(e => e.status === 'failure').length;
  const uniqueUsers = new Set(entries.map(e => e.userId)).size;

  // Count actions
  const actionCounts: Record<string, number> = {};
  entries.forEach(entry => {
    actionCounts[entry.action] = (actionCounts[entry.action] || 0) + 1;
  });

  const topActions = Object.entries(actionCounts)
    .map(([action, count]) => ({ action, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalAccesses: entries.length,
    phiAccesses,
    failures,
    uniqueUsers,
    topActions
  };
}

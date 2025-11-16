#!/usr/bin/env node
/**
 * PHI Audit Log Query Tool
 *
 * Command-line tool for querying and analyzing PHI audit logs.
 *
 * Usage:
 *   node scripts/audit-query.js [command] [options]
 *
 * Commands:
 *   query     - Query audit logs with filters
 *   verify    - Verify log integrity
 *   report    - Generate compliance report
 *   summary   - Generate security summary
 *   monitor   - Start real-time monitoring
 *
 * Examples:
 *   node scripts/audit-query.js query --user automation@ssdspc.com --limit 100
 *   node scripts/audit-query.js verify
 *   node scripts/audit-query.js report --start 2025-11-01 --end 2025-11-30
 *   node scripts/audit-query.js summary --days 7
 *   node scripts/audit-query.js monitor --interval 15
 */

const PHIAuditLogger = require('../lib/phi-audit-logger');
const AuditMonitor = require('../lib/audit-monitor');

// Parse command-line arguments
const args = process.argv.slice(2);
const command = args[0];

// Parse options
function parseOptions(args) {
  const options = {};
  for (let i = 1; i < args.length; i += 2) {
    const key = args[i].replace(/^--/, '');
    const value = args[i + 1];
    options[key] = value;
  }
  return options;
}

const options = parseOptions(args);

// Main execution
async function main() {
  const logger = new PHIAuditLogger();

  try {
    switch (command) {
      case 'query':
        await queryLogs(logger, options);
        break;

      case 'verify':
        await verifyIntegrity(logger);
        break;

      case 'report':
        await generateReport(logger, options);
        break;

      case 'summary':
        await generateSummary(logger, options);
        break;

      case 'monitor':
        await startMonitoring(options);
        break;

      case 'help':
      case '--help':
      case '-h':
        showHelp();
        break;

      default:
        console.error(`Unknown command: ${command}`);
        console.error('Run "node scripts/audit-query.js help" for usage information');
        process.exit(1);
    }
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    await logger.close();
  }
}

/**
 * Query logs with filters
 */
async function queryLogs(logger, options) {
  console.log('Querying audit logs...\n');

  const filters = {};

  if (options.operation) filters.operation = options.operation;
  if (options.service) filters.service = options.service;
  if (options.user) filters.user = options.user;
  if (options.resource) filters.resource_id = options.resource;
  if (options.start) filters.startDate = options.start;
  if (options.end) filters.endDate = options.end;
  if (options.limit) filters.limit = parseInt(options.limit);

  const results = await logger.query(filters);

  console.log(`Found ${results.length} matching entries:\n`);

  // Display results in table format
  if (results.length > 0) {
    console.log('Timestamp                  | User                      | Operation | Service        | Resource ID          | Result  ');
    console.log('---------------------------|---------------------------|-----------|----------------|----------------------|---------');

    results.forEach(entry => {
      const timestamp = entry.timestamp.substring(0, 26);
      const user = entry.user.substring(0, 25).padEnd(25);
      const operation = entry.operation.padEnd(9);
      const service = entry.service.substring(0, 14).padEnd(14);
      const resource = entry.resource_id.substring(0, 20).padEnd(20);
      const result = entry.result;

      console.log(`${timestamp} | ${user} | ${operation} | ${service} | ${resource} | ${result}`);
    });

    // Show summary
    console.log('\n--- Summary ---');
    console.log(`Total entries: ${results.length}`);

    const byOperation = {};
    const byResult = {};
    results.forEach(e => {
      byOperation[e.operation] = (byOperation[e.operation] || 0) + 1;
      byResult[e.result] = (byResult[e.result] || 0) + 1;
    });

    console.log('\nBy Operation:');
    Object.entries(byOperation).forEach(([op, count]) => {
      console.log(`  ${op}: ${count}`);
    });

    console.log('\nBy Result:');
    Object.entries(byResult).forEach(([result, count]) => {
      console.log(`  ${result}: ${count}`);
    });
  }
}

/**
 * Verify log integrity
 */
async function verifyIntegrity(logger) {
  console.log('Verifying audit log integrity...\n');

  const result = await logger.verifyIntegrity();

  if (result.valid) {
    console.log('✅ Log integrity verified successfully');
    console.log(`   Total entries: ${result.entries}`);
    console.log(`   Status: ${result.message}`);
  } else {
    console.error('❌ Log integrity verification FAILED');
    console.error(`   ${result.message}`);

    if (result.invalidEntries && result.invalidEntries.length > 0) {
      console.error('\nInvalid entries:');
      result.invalidEntries.forEach(entry => {
        console.error(`  Line ${entry.line}: ${entry.reason}`);
      });
    }

    if (result.error) {
      console.error(`\nError: ${result.error}`);
    }
  }
}

/**
 * Generate compliance report
 */
async function generateReport(logger, options) {
  console.log('Generating compliance report...\n');

  // Default to last 30 days if not specified
  const endDate = options.end || new Date().toISOString();
  const startDate = options.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const report = await logger.generateComplianceReport(startDate, endDate);

  console.log('=== PHI Access Compliance Report ===');
  console.log(`Period: ${report.period.start.substring(0, 10)} to ${report.period.end.substring(0, 10)}\n`);

  console.log('--- Summary ---');
  console.log(`Total Operations: ${report.summary.total_operations}`);
  console.log(`Unique Users: ${report.summary.unique_users}`);
  console.log(`Success Rate: ${report.summary.success_rate}\n`);

  console.log('--- By Operation ---');
  Object.entries(report.by_operation).forEach(([op, count]) => {
    console.log(`  ${op}: ${count}`);
  });

  console.log('\n--- By Service ---');
  Object.entries(report.by_service).forEach(([service, count]) => {
    console.log(`  ${service}: ${count}`);
  });

  console.log('\n--- By User ---');
  Object.entries(report.by_user).forEach(([user, count]) => {
    console.log(`  ${user}: ${count}`);
  });

  if (report.high_volume_users.length > 0) {
    console.log('\n--- High Volume Users (>100 operations) ---');
    report.high_volume_users.forEach(({ user, count }) => {
      console.log(`  ${user}: ${count} operations`);
    });
  }

  if (report.failures.length > 0) {
    console.log(`\n--- Failures (${report.failures.length}) ---`);
    report.failures.slice(0, 10).forEach(failure => {
      console.log(`  ${failure.timestamp} | ${failure.user} | ${failure.operation} | ${failure.error || 'Unknown error'}`);
    });

    if (report.failures.length > 10) {
      console.log(`  ... and ${report.failures.length - 10} more`);
    }
  }
}

/**
 * Generate security summary
 */
async function generateSummary(logger, options) {
  console.log('Generating security summary...\n');

  const days = parseInt(options.days || '7');
  const endDate = new Date().toISOString();
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const monitor = new AuditMonitor();
  const summary = await monitor.generateSecuritySummary(startDate, endDate);

  console.log('=== Security Summary ===');
  console.log(`Period: Last ${days} days\n`);

  console.log('--- Overview ---');
  console.log(`Total Operations: ${summary.total_operations}`);
  console.log(`Risk Score: ${summary.risk_score}/100`);
  console.log(`After-Hours Access: ${summary.after_hours} events\n`);

  console.log('--- Top Users ---');
  summary.top_users.forEach((user, index) => {
    console.log(`  ${index + 1}. ${user.user}: ${user.operations} operations`);
  });

  if (summary.exports.length > 0) {
    console.log(`\n--- Export Operations (${summary.exports.length}) ---`);
    summary.exports.slice(0, 5).forEach(exp => {
      console.log(`  ${exp.timestamp} | ${exp.user} | ${exp.resource}`);
    });
  }

  if (summary.deletes.length > 0) {
    console.log(`\n--- Delete Operations (${summary.deletes.length}) ---`);
    summary.deletes.forEach(del => {
      console.log(`  ${del.timestamp} | ${del.user} | ${del.resource}`);
    });
  }

  if (summary.failures.length > 0) {
    console.log(`\n--- Recent Failures (${summary.failures.length}) ---`);
    summary.failures.slice(0, 5).forEach(fail => {
      console.log(`  ${fail.timestamp} | ${fail.user} | ${fail.error}`);
    });
  }
}

/**
 * Start real-time monitoring
 */
async function startMonitoring(options) {
  const interval = parseInt(options.interval || '15');

  console.log(`Starting real-time PHI audit monitoring...`);
  console.log(`Checking for anomalies every ${interval} minutes`);
  console.log('Press Ctrl+C to stop\n');

  const monitor = new AuditMonitor();

  // Setup alert handler
  monitor.onAlert(alert => {
    const timestamp = new Date().toISOString();
    console.log(`\n[${timestamp}] 🚨 ALERT: ${alert.type}`);
    console.log(`   Severity: ${alert.severity}`);
    console.log(`   Message: ${alert.message}`);
    console.log(`   User: ${alert.user || 'N/A'}`);
  });

  // Start monitoring
  monitor.startMonitoring(interval);

  // Keep process alive
  process.on('SIGINT', async () => {
    console.log('\n\nStopping monitoring...');
    monitor.stopMonitoring();
    process.exit(0);
  });
}

/**
 * Show help
 */
function showHelp() {
  console.log(`
PHI Audit Log Query Tool

Usage:
  node scripts/audit-query.js [command] [options]

Commands:
  query     Query audit logs with filters
  verify    Verify log integrity
  report    Generate compliance report
  summary   Generate security summary
  monitor   Start real-time monitoring
  help      Show this help message

Query Options:
  --operation [type]    Filter by operation (read, write, export, delete, etc.)
  --service [name]      Filter by service (google-sheets, google-drive, etc.)
  --user [email]        Filter by user email
  --resource [id]       Filter by resource ID
  --start [date]        Start date (ISO 8601 format)
  --end [date]          End date (ISO 8601 format)
  --limit [n]           Limit results to N entries

Report Options:
  --start [date]        Start date (ISO 8601 format)
  --end [date]          End date (ISO 8601 format)

Summary Options:
  --days [n]            Number of days to analyze (default: 7)

Monitor Options:
  --interval [n]        Check interval in minutes (default: 15)

Examples:
  # Query all operations by a specific user
  node scripts/audit-query.js query --user automation@ssdspc.com --limit 100

  # Query all export operations
  node scripts/audit-query.js query --operation export

  # Verify log integrity
  node scripts/audit-query.js verify

  # Generate compliance report for November 2025
  node scripts/audit-query.js report --start 2025-11-01 --end 2025-11-30

  # Generate security summary for last 30 days
  node scripts/audit-query.js summary --days 30

  # Start real-time monitoring (check every 15 minutes)
  node scripts/audit-query.js monitor --interval 15
`);
}

// Run main
main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

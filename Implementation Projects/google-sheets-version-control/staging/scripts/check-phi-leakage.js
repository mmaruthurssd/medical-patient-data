#!/usr/bin/env node

/**
 * PHI Leakage Detection Script
 *
 * Purpose: Scan staging code for potential PHI before deployment to production
 * Security: CRITICAL - Blocks deployment if real patient data detected
 *
 * Usage:
 *   node check-phi-leakage.js --sheet <sheet-number>
 *   node check-phi-leakage.js --all
 *   node check-phi-leakage.js --file <path-to-file>
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG_DIR = path.join(__dirname, '../config');
const SAFETY_CONFIG_FILE = path.join(CONFIG_DIR, 'safety-checks-config.json');
const STAGING_DIR = path.join(__dirname, '../../staging-sheets');

// Load safety configuration
let safetyConfig;
try {
  safetyConfig = JSON.parse(fs.readFileSync(SAFETY_CONFIG_FILE, 'utf8'));
  console.log(`✓ Loaded safety checks configuration v${safetyConfig.version}`);
} catch (error) {
  console.error('✗ Failed to load safety configuration:', error.message);
  process.exit(1);
}

/**
 * Scan text for PHI patterns
 */
function scanForPHI(content, filename) {
  const findings = [];
  const patterns = safetyConfig.phiDetectionRules.patterns;

  for (const [patternName, patternConfig] of Object.entries(patterns)) {
    if (!patternConfig.enabled) continue;

    for (const regex of patternConfig.regex) {
      const re = new RegExp(regex, 'gm');
      let match;

      while ((match = re.exec(content)) !== null) {
        const matchedText = match[0];

        // Check whitelist
        let isWhitelisted = false;
        if (patternConfig.whitelist) {
          for (const whitelistItem of patternConfig.whitelist) {
            if (matchedText.toLowerCase().includes(whitelistItem.toLowerCase())) {
              isWhitelisted = true;
              break;
            }
          }
        }

        if (!isWhitelisted) {
          const lineNumber = content.substring(0, match.index).split('\n').length;
          findings.push({
            type: 'PHI',
            category: patternName,
            severity: patternConfig.severity,
            file: filename,
            line: lineNumber,
            match: matchedText.substring(0, 100), // Limit length for security
            description: patternConfig.description
          });
        }
      }
    }
  }

  return findings;
}

/**
 * Check for production data references
 */
function scanForProductionReferences(content, filename) {
  const findings = [];
  const forbiddenPatterns = safetyConfig.productionDataReferences.forbiddenPatterns;

  for (const patternConfig of forbiddenPatterns) {
    const re = new RegExp(patternConfig.pattern, 'gm');
    let match;

    while ((match = re.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      findings.push({
        type: 'PROD_REFERENCE',
        severity: patternConfig.severity,
        file: filename,
        line: lineNumber,
        match: match[0].substring(0, 100),
        description: patternConfig.description
      });
    }
  }

  return findings;
}

/**
 * Check code quality issues
 */
function scanForCodeQuality(content, filename) {
  const findings = [];
  const checks = safetyConfig.codeQualityChecks.checks;

  for (const check of checks) {
    const re = new RegExp(check.pattern, 'gm');
    let match;

    while ((match = re.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      findings.push({
        type: 'CODE_QUALITY',
        category: check.name,
        severity: check.severity,
        file: filename,
        line: lineNumber,
        match: match[0].substring(0, 100),
        description: check.description
      });
    }
  }

  return findings;
}

/**
 * Scan a single file
 */
function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(process.cwd(), filePath);

    const phiFindings = scanForPHI(content, relativePath);
    const prodFindings = scanForProductionReferences(content, relativePath);
    const qualityFindings = scanForCodeQuality(content, relativePath);

    return [...phiFindings, ...prodFindings, ...qualityFindings];
  } catch (error) {
    console.error(`Error scanning ${filePath}:`, error.message);
    return [];
  }
}

/**
 * Scan all files in a directory
 */
function scanDirectory(dirPath, extensions = ['.js', '.gs']) {
  let allFindings = [];

  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Recursively scan subdirectories
      allFindings = allFindings.concat(scanDirectory(fullPath, extensions));
    } else if (extensions.includes(path.extname(file))) {
      const findings = scanFile(fullPath);
      allFindings = allFindings.concat(findings);
    }
  }

  return allFindings;
}

/**
 * Scan a specific staging sheet
 */
function scanSheet(sheetNumber) {
  const sheetDirs = fs.readdirSync(STAGING_DIR)
    .filter(dir => dir.startsWith(`sheet-${String(sheetNumber).padStart(3, '0')}_DEV3`));

  if (sheetDirs.length === 0) {
    console.error(`✗ No DEV3 sheet found for number ${sheetNumber}`);
    process.exit(1);
  }

  const sheetDir = path.join(STAGING_DIR, sheetDirs[0]);
  const liveDir = path.join(sheetDir, 'live');

  if (!fs.existsSync(liveDir)) {
    console.error(`✗ No live directory found in ${sheetDir}`);
    process.exit(1);
  }

  console.log(`\nScanning sheet ${sheetNumber}: ${sheetDirs[0]}`);
  return scanDirectory(liveDir);
}

/**
 * Scan all staging sheets
 */
function scanAllSheets() {
  console.log('\nScanning all staging sheets...');
  let allFindings = [];

  const sheetDirs = fs.readdirSync(STAGING_DIR)
    .filter(dir => dir.includes('_DEV3'));

  console.log(`Found ${sheetDirs.length} DEV3 sheets to scan`);

  for (const sheetDir of sheetDirs) {
    const liveDir = path.join(STAGING_DIR, sheetDir, 'live');
    if (fs.existsSync(liveDir)) {
      const findings = scanDirectory(liveDir);
      allFindings = allFindings.concat(findings);
    }
  }

  return allFindings;
}

/**
 * Format and display findings
 */
function displayFindings(findings) {
  if (findings.length === 0) {
    console.log('\n✓ No issues found - staging environment is clean!');
    return { passed: true, critical: 0, high: 0, medium: 0, low: 0 };
  }

  // Group by severity
  const bySeverity = {
    critical: [],
    high: [],
    medium: [],
    low: []
  };

  for (const finding of findings) {
    const severity = finding.severity || 'low';
    if (bySeverity[severity]) {
      bySeverity[severity].push(finding);
    }
  }

  // Display results
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  PHI LEAKAGE DETECTION RESULTS');
  console.log('═══════════════════════════════════════════════════════════\n');

  const stats = {
    critical: bySeverity.critical.length,
    high: bySeverity.high.length,
    medium: bySeverity.medium.length,
    low: bySeverity.low.length,
    total: findings.length,
    passed: false
  };

  console.log(`Total Issues: ${stats.total}\n`);
  console.log(`  Critical: ${stats.critical}`);
  console.log(`  High:     ${stats.high}`);
  console.log(`  Medium:   ${stats.medium}`);
  console.log(`  Low:      ${stats.low}\n`);

  // Display critical and high severity issues
  if (stats.critical > 0) {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  CRITICAL ISSUES (DEPLOYMENT BLOCKED)');
    console.log('═══════════════════════════════════════════════════════════\n');

    for (const finding of bySeverity.critical) {
      console.log(`  ${finding.file}:${finding.line}`);
      console.log(`  Type: ${finding.category || finding.type}`);
      console.log(`  Description: ${finding.description}`);
      console.log(`  Match: ${finding.match}`);
      console.log('');
    }
  }

  if (stats.high > 0) {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  HIGH SEVERITY ISSUES (DEPLOYMENT BLOCKED)');
    console.log('═══════════════════════════════════════════════════════════\n');

    for (const finding of bySeverity.high) {
      console.log(`  ${finding.file}:${finding.line}`);
      console.log(`  Type: ${finding.category || finding.type}`);
      console.log(`  Description: ${finding.description}`);
      console.log(`  Match: ${finding.match}`);
      console.log('');
    }
  }

  // Display medium and low as warnings
  if (stats.medium > 0) {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  MEDIUM SEVERITY WARNINGS');
    console.log('═══════════════════════════════════════════════════════════\n');

    for (const finding of bySeverity.medium.slice(0, 10)) { // Limit display
      console.log(`  ${finding.file}:${finding.line} - ${finding.description}`);
    }
    if (bySeverity.medium.length > 10) {
      console.log(`  ... and ${bySeverity.medium.length - 10} more`);
    }
    console.log('');
  }

  if (stats.low > 0) {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  LOW SEVERITY WARNINGS');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log(`  ${stats.low} low severity issues found (not displayed)`);
    console.log('  Review recommended but deployment not blocked\n');
  }

  // Deployment decision
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  DEPLOYMENT DECISION');
  console.log('═══════════════════════════════════════════════════════════\n');

  if (stats.critical > 0 || stats.high > 0) {
    console.log('  ✗ DEPLOYMENT BLOCKED');
    console.log('  Reason: Critical or high severity issues detected');
    console.log('  Action: Fix all critical/high issues before deployment\n');
    stats.passed = false;
  } else {
    console.log('  ✓ DEPLOYMENT ALLOWED');
    console.log('  No critical or high severity issues detected');
    if (stats.medium > 0 || stats.low > 0) {
      console.log('  Note: Medium/low severity warnings should be reviewed\n');
    } else {
      console.log('  Staging environment is clean\n');
    }
    stats.passed = true;
  }

  return stats;
}

/**
 * Save results to file
 */
function saveResults(findings, outputFile) {
  const results = {
    timestamp: new Date().toISOString(),
    totalFindings: findings.length,
    findings: findings,
    summary: {
      critical: findings.filter(f => f.severity === 'critical').length,
      high: findings.filter(f => f.severity === 'high').length,
      medium: findings.filter(f => f.severity === 'medium').length,
      low: findings.filter(f => f.severity === 'low').length
    }
  };

  fs.writeFileSync(outputFile, JSON.stringify(results, null, 2), 'utf8');
  console.log(`Results saved to ${outputFile}`);
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);

  let sheetNumber = null;
  let scanAll = false;
  let filePath = null;
  let outputFile = null;

  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--sheet' && i + 1 < args.length) {
      sheetNumber = args[++i];
    } else if (args[i] === '--all') {
      scanAll = true;
    } else if (args[i] === '--file' && i + 1 < args.length) {
      filePath = args[++i];
    } else if (args[i] === '--output' && i + 1 < args.length) {
      outputFile = args[++i];
    } else if (args[i] === '--help') {
      console.log(`
PHI Leakage Detection Script

Usage:
  node check-phi-leakage.js [options]

Options:
  --sheet <number>    Scan specific staging sheet by number
  --all               Scan all staging sheets
  --file <path>       Scan specific file
  --output <path>     Save results to JSON file
  --help              Show this help message

Examples:
  node check-phi-leakage.js --sheet 42
  node check-phi-leakage.js --all --output results.json
  node check-phi-leakage.js --file staging-sheets/sheet-000_DEV3/live/Code.js

Security:
  This script scans for:
  - Patient names and identifiers
  - Medical record numbers (MRNs)
  - Social Security Numbers
  - Dates of birth
  - Phone numbers and addresses
  - Email addresses
  - Production data references
  - Hardcoded credentials

Deployment is BLOCKED if critical or high severity issues are found.
      `);
      return;
    }
  }

  // Validate input
  if (!sheetNumber && !scanAll && !filePath) {
    console.error('Error: Must specify --sheet, --all, or --file');
    console.log('Use --help for usage information');
    process.exit(1);
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log('  PHI LEAKAGE DETECTION');
  console.log('  Scanning staging environment for real patient data');
  console.log('═══════════════════════════════════════════════════════════');

  // Perform scan
  let findings = [];

  if (filePath) {
    console.log(`\nScanning file: ${filePath}`);
    findings = scanFile(filePath);
  } else if (sheetNumber) {
    findings = scanSheet(sheetNumber);
  } else if (scanAll) {
    findings = scanAllSheets();
  }

  // Display and save results
  const stats = displayFindings(findings);

  if (outputFile) {
    saveResults(findings, outputFile);
  }

  // Exit with appropriate code
  process.exit(stats.passed ? 0 : 1);
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { scanFile, scanDirectory, scanForPHI };

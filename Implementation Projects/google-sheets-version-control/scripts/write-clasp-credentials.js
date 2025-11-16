#!/usr/bin/env node

/**
 * Write clasp credentials from base64-encoded secret
 * This script ensures proper JSON formatting without encoding issues
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Get base64-encoded credentials from environment
const credentialsB64 = process.env.CLASP_CREDENTIALS_B64;

if (!credentialsB64) {
  console.error('ERROR: CLASP_CREDENTIALS_B64 environment variable not set');
  process.exit(1);
}

try {
  // Decode base64
  const credentialsJson = Buffer.from(credentialsB64, 'base64').toString('utf-8');

  // Parse to validate JSON
  const credentials = JSON.parse(credentialsJson);

  // Validate structure
  if (!credentials.tokens || !credentials.tokens.default) {
    console.error('ERROR: Invalid credentials structure - missing tokens.default');
    process.exit(1);
  }

  if (!credentials.tokens.default.access_token) {
    console.error('ERROR: Missing access_token in credentials');
    process.exit(1);
  }

  // Write to home directory
  const homeClasprc = path.join(os.homedir(), '.clasprc.json');
  fs.writeFileSync(homeClasprc, JSON.stringify(credentials, null, 2), { mode: 0o600 });
  console.log(`✅ Wrote credentials to ${homeClasprc}`);

  // Write to repo root
  const repoClasprc = path.join(process.cwd(), '.clasprc.json');
  fs.writeFileSync(repoClasprc, JSON.stringify(credentials, null, 2), { mode: 0o600 });
  console.log(`✅ Wrote credentials to ${repoClasprc}`);

  // Validate what was written
  const written = JSON.parse(fs.readFileSync(homeClasprc, 'utf-8'));
  console.log('✅ Validation: tokens.default keys:', Object.keys(written.tokens.default).join(', '));

} catch (error) {
  console.error('ERROR:', error.message);
  process.exit(1);
}

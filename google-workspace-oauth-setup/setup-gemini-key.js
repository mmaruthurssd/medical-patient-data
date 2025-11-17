#!/usr/bin/env node
/**
 * Gemini API Key Setup
 *
 * Interactive script to set up Gemini API key for AI task extraction.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const ENV_FILE = path.join(__dirname, '.env');

console.log('\n🤖 Gemini API Key Setup\n');
console.log('='.repeat(80));
console.log('\nTo use AI task extraction, you need a Gemini API key from Google AI Studio.\n');
console.log('📝 Steps to get your API key:\n');
console.log('   1. Visit: https://aistudio.google.com/app/apikey');
console.log('   2. Click "Create API Key"');
console.log('   3. Select a Google Cloud project (or create a new one)');
console.log('   4. Copy the generated API key\n');
console.log('='.repeat(80));
console.log();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Paste your Gemini API key here: ', (apiKey) => {
  rl.close();

  if (!apiKey || apiKey.trim().length === 0) {
    console.error('\n❌ No API key provided. Exiting.\n');
    process.exit(1);
  }

  const trimmedKey = apiKey.trim();

  // Basic validation - Gemini API keys typically start with "AIza"
  if (!trimmedKey.startsWith('AIza')) {
    console.warn('\n⚠️  Warning: API key doesn\'t match expected format (should start with "AIza")');
    console.warn('   Proceeding anyway, but double-check if it doesn\'t work.\n');
  }

  // Write to .env file
  const envContent = `# Gemini API Key for AI Task Extraction
# Generated: ${new Date().toISOString()}
GEMINI_API_KEY=${trimmedKey}
`;

  fs.writeFileSync(ENV_FILE, envContent);

  console.log('\n✅ Success! API key saved to .env\n');
  console.log('💡 Next steps:\n');
  console.log('   1. Run: node extract-tasks-with-ai.js');
  console.log('   2. AI will extract tasks from all pending transcripts');
  console.log('   3. Review results in the AI Extraction Results tab\n');
});

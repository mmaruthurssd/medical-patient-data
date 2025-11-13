const { GeminiMCPCLI } = require('./gemini-mcp-cli');

async function testAuditSync() {
  console.log('--- Testing Automated Audit Log Sync ---');

  const cli = new GeminiMCPCLI();

  // Mock the readline interface to prevent it from waiting for user input
  cli.rl = {
    prompt: () => {},
    close: () => {},
    on: () => {}
  };

  try {
    // Initialize the CLI
    await cli.initialize();

    // Process a sample message to generate an audit log
    console.log('\n--- Processing a sample message... ---');
    await cli.processMessage('Hello, this is a test message to generate an audit log.');

    // Shutdown the CLI to trigger the audit log sync
    console.log('\n--- Shutting down CLI to trigger sync... ---');
    await cli.shutdown();

    console.log('\n--- Test Complete ---');
    console.log('Please verify the audit log in the "AI Development - No PHI" Google Drive folder.');

  } catch (error) {
    console.error('--- Test Failed ---');
    console.error(error);
  }
}

testAuditSync();

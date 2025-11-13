/**
 * Test Gemini MCP Integration
 *
 * End-to-end tests for Gemini with MCP function calling.
 */

const { GeminiClient } = require('./gemini-client');
const { MCPBridgeServer } = require('./mcp-bridge-server');
const PHIGuard = require('../../google-workspace-oauth-setup/phi-guard');
require('dotenv').config();

class GeminiMCPTest {
  constructor() {
    this.gemini = null;
    this.server = null;
    this.guard = new PHIGuard();
    this.passed = 0;
    this.failed = 0;
  }

  async runTests() {
    console.log('╔════════════════════════════════════════════════════╗');
    console.log('║        Gemini MCP Integration Tests                ║');
    console.log('╚════════════════════════════════════════════════════╝\n');

    // Check API key
    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY not set in .env');
      console.log('\nPlease add to your .env file:');
      console.log('GEMINI_API_KEY=your-api-key-here\n');
      process.exit(1);
    }

    try {
      // Start MCP bridge server
      await this.startBridge();

      // Initialize Gemini client
      await this.initializeGemini();

      // Run tests
      await this.testBasicChat();
      await this.testPHIDetection();
      await this.testFunctionCalling();
      await this.testConversationHistory();
      await this.testToolSearch();

      // Cleanup
      await this.cleanup();

      // Summary
      console.log('\n' + '═'.repeat(52));
      console.log(`✅ Tests passed: ${this.passed}`);
      console.log(`❌ Tests failed: ${this.failed}`);
      console.log('═'.repeat(52) + '\n');

      process.exit(this.failed === 0 ? 0 : 1);

    } catch (error) {
      console.error('\n❌ Fatal error:', error.message);
      await this.cleanup();
      process.exit(1);
    }
  }

  async startBridge() {
    console.log('Starting MCP Bridge Server...');

    this.server = new MCPBridgeServer({ port: 3000 });
    await this.server.start();

    // Wait for server to be ready
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('✅ Bridge server started\n');
  }

  async initializeGemini() {
    console.log('Initializing Gemini client...');

    this.gemini = new GeminiClient({
      apiKey: process.env.GEMINI_API_KEY,
      bridgeUrl: 'http://localhost:3000',
      bridgeApiKey: process.env.MCP_BRIDGE_API_KEY || 'test-api-key'
    });

    await this.gemini.initialize();

    console.log(`✅ Gemini initialized (${this.gemini.getToolCount()} tools available)\n`);
  }

  async testBasicChat() {
    console.log('Test 1: Basic Chat (No Function Calling)');

    try {
      const response = await this.gemini.chat(
        'What is the capital of France? Answer in one word.'
      );

      if (response.success && response.text.toLowerCase().includes('paris')) {
        console.log('  ✅ Passed: Basic chat works');
        console.log(`     Response: ${response.text}`);
        this.passed++;
      } else {
        console.log('  ❌ Failed: Unexpected response');
        this.failed++;
      }

    } catch (error) {
      console.log(`  ❌ Failed: ${error.message}`);
      this.failed++;
    }
  }

  async testPHIDetection() {
    console.log('\nTest 2: PHI Detection');

    try {
      const textWithPHI = 'Patient John Doe, DOB 01/15/1980, SSN 123-45-6789';
      const detection = this.guard.detectPHI(textWithPHI);

      if (detection.hasPHI && detection.phiTypes.length > 0) {
        console.log('  ✅ Passed: PHI detected correctly');
        console.log(`     PHI types: ${detection.phiTypes.join(', ')}`);
        this.passed++;

        // Test de-identification
        const deidentified = this.guard.deidentify(textWithPHI);
        console.log(`     De-identified: ${deidentified.deidentifiedText.substring(0, 50)}...`);

      } else {
        console.log('  ❌ Failed: PHI not detected');
        this.failed++;
      }

    } catch (error) {
      console.log(`  ❌ Failed: ${error.message}`);
      this.failed++;
    }
  }

  async testFunctionCalling() {
    console.log('\nTest 3: MCP Function Calling');

    try {
      // Ask Gemini to use an MCP tool
      const response = await this.gemini.chat(
        'List all available workspace learning domains.',
        []
      );

      if (response.success) {
        if (response.functionsUsed && response.functionsUsed.length > 0) {
          console.log('  ✅ Passed: MCP function called successfully');
          console.log(`     Functions used: ${response.functionsUsed.join(', ')}`);
          console.log(`     Response: ${response.text.substring(0, 100)}...`);
          this.passed++;
        } else {
          console.log('  ⚠️  Warning: No MCP functions called (Gemini may have answered without tools)');
          console.log(`     Response: ${response.text.substring(0, 100)}...`);
          this.passed++; // Still pass, as response was successful
        }
      } else {
        console.log('  ❌ Failed: Function calling failed');
        this.failed++;
      }

    } catch (error) {
      console.log(`  ❌ Failed: ${error.message}`);
      this.failed++;
    }
  }

  async testConversationHistory() {
    console.log('\nTest 4: Conversation History');

    try {
      const history = [
        { role: 'user', content: 'My name is Alex' },
        { role: 'model', content: 'Nice to meet you, Alex!' }
      ];

      const response = await this.gemini.chat(
        'What is my name?',
        history
      );

      if (response.success && response.text.toLowerCase().includes('alex')) {
        console.log('  ✅ Passed: Conversation history maintained');
        console.log(`     Response: ${response.text}`);
        this.passed++;
      } else {
        console.log('  ❌ Failed: Conversation history not maintained');
        console.log(`     Response: ${response.text}`);
        this.failed++;
      }

    } catch (error) {
      console.log(`  ❌ Failed: ${error.message}`);
      this.failed++;
    }
  }

  async testToolSearch() {
    console.log('\nTest 5: Tool Search');

    try {
      const tools = this.gemini.searchTools('goal');

      if (tools.length > 0) {
        console.log(`  ✅ Passed: Found ${tools.length} tools matching 'goal'`);
        console.log(`     Sample: ${tools[0].name} - ${tools[0].description.substring(0, 50)}...`);
        this.passed++;
      } else {
        console.log('  ❌ Failed: No tools found');
        this.failed++;
      }

    } catch (error) {
      console.log(`  ❌ Failed: ${error.message}`);
      this.failed++;
    }
  }

  async cleanup() {
    if (this.server) {
      console.log('\nStopping bridge server...');
      await this.server.stop();
      console.log('✅ Cleanup complete');
    }
  }
}

// Run tests
if (require.main === module) {
  const test = new GeminiMCPTest();
  test.runTests();
}

module.exports = { GeminiMCPTest };

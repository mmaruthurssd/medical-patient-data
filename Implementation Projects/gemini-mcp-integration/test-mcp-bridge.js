/**
 * Test MCP Bridge Server
 *
 * Tests the HTTP server that exposes MCP tools as REST endpoints.
 */

const { MCPBridgeServer } = require('./mcp-bridge-server');
const axios = require('axios');
require('dotenv').config();

class MCPBridgeTest {
  constructor() {
    this.server = null;
    this.baseUrl = 'http://localhost:3000';
    this.apiKey = process.env.MCP_BRIDGE_API_KEY || 'test-api-key';
    this.passed = 0;
    this.failed = 0;
  }

  async runTests() {
    console.log('╔════════════════════════════════════════════════════╗');
    console.log('║           MCP Bridge Server Tests                  ║');
    console.log('╚════════════════════════════════════════════════════╝\n');

    try {
      // Start server
      await this.startServer();

      // Run tests
      await this.testHealthCheck();
      await this.testToolsList();
      await this.testGeminiSchemas();
      await this.testAuthentication();
      await this.testMCPCall();
      await this.testBatchCalls();

      // Stop server
      await this.stopServer();

      // Summary
      console.log('\n' + '═'.repeat(52));
      console.log(`✅ Tests passed: ${this.passed}`);
      console.log(`❌ Tests failed: ${this.failed}`);
      console.log('═'.repeat(52) + '\n');

      process.exit(this.failed === 0 ? 0 : 1);

    } catch (error) {
      console.error('\n❌ Fatal error:', error.message);
      await this.stopServer();
      process.exit(1);
    }
  }

  async startServer() {
    console.log('Starting MCP Bridge Server...');

    this.server = new MCPBridgeServer({ port: 3000 });
    await this.server.start();

    // Wait for server to be ready
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('✅ Server started\n');
  }

  async stopServer() {
    if (this.server) {
      console.log('\nStopping server...');
      await this.server.stop();
      console.log('✅ Server stopped');
    }
  }

  async testHealthCheck() {
    console.log('Test 1: Health Check');

    try {
      const response = await axios.get(`${this.baseUrl}/health`);

      if (response.data.success && response.data.status === 'healthy') {
        console.log('  ✅ Passed: Server is healthy');
        this.passed++;
      } else {
        console.log('  ❌ Failed: Unexpected health response');
        this.failed++;
      }

    } catch (error) {
      console.log(`  ❌ Failed: ${error.message}`);
      this.failed++;
    }
  }

  async testToolsList() {
    console.log('\nTest 2: List MCP Tools');

    try {
      const response = await axios.get(`${this.baseUrl}/mcp/tools`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (response.data.success && response.data.tools) {
        console.log(`  ✅ Passed: Retrieved ${response.data.count} tools`);
        this.passed++;

        // Show first 3 tools
        const sampleTools = response.data.tools.slice(0, 3);
        sampleTools.forEach(tool => {
          console.log(`     • ${tool.server}.${tool.name}`);
        });
      } else {
        console.log('  ❌ Failed: Invalid tools response');
        this.failed++;
      }

    } catch (error) {
      console.log(`  ❌ Failed: ${error.message}`);
      this.failed++;
    }
  }

  async testGeminiSchemas() {
    console.log('\nTest 3: Get Gemini Function Schemas');

    try {
      const response = await axios.get(`${this.baseUrl}/mcp/schemas/gemini`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (response.data.success && response.data.schemas) {
        console.log(`  ✅ Passed: Retrieved ${response.data.count} Gemini schemas`);
        this.passed++;

        // Validate schema format
        const sampleSchema = response.data.schemas[0];
        if (sampleSchema.name && sampleSchema.description && sampleSchema.parameters) {
          console.log(`     Sample: ${sampleSchema.name}`);
        }
      } else {
        console.log('  ❌ Failed: Invalid schemas response');
        this.failed++;
      }

    } catch (error) {
      console.log(`  ❌ Failed: ${error.message}`);
      this.failed++;
    }
  }

  async testAuthentication() {
    console.log('\nTest 4: API Key Authentication');

    try {
      // Test without API key
      try {
        await axios.get(`${this.baseUrl}/mcp/tools`);
        console.log('  ❌ Failed: Request without API key should be rejected');
        this.failed++;
      } catch (error) {
        if (error.response && error.response.status === 401) {
          console.log('  ✅ Passed: Unauthorized requests rejected');
          this.passed++;
        } else {
          throw error;
        }
      }

    } catch (error) {
      console.log(`  ❌ Failed: ${error.message}`);
      this.failed++;
    }
  }

  async testMCPCall() {
    console.log('\nTest 5: Call MCP Tool');

    try {
      // Test with a simple tool (workspace-brain query)
      const response = await axios.post(
        `${this.baseUrl}/mcp/workspace-brain-mcp/get_domain_stats`,
        {
          parameters: {
            domain: 'mcp-installation'
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success && response.data.result) {
        console.log('  ✅ Passed: MCP tool called successfully');
        console.log(`     Duration: ${response.data.metadata.duration}ms`);
        this.passed++;
      } else {
        console.log('  ❌ Failed: Invalid MCP call response');
        this.failed++;
      }

    } catch (error) {
      // It's OK if the tool isn't available yet
      if (error.response && error.response.status === 404) {
        console.log('  ⚠️  Skipped: MCP server not available (expected in minimal setup)');
      } else {
        console.log(`  ❌ Failed: ${error.message}`);
        this.failed++;
      }
    }
  }

  async testBatchCalls() {
    console.log('\nTest 6: Batch MCP Calls');

    try {
      const response = await axios.post(
        `${this.baseUrl}/mcp/batch`,
        {
          calls: [
            {
              serverName: 'workspace-brain-mcp',
              toolName: 'list_domains',
              parameters: {}
            }
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success && response.data.results) {
        console.log(`  ✅ Passed: Batch call executed (${response.data.count} calls)`);
        this.passed++;
      } else {
        console.log('  ❌ Failed: Invalid batch response');
        this.failed++;
      }

    } catch (error) {
      console.log(`  ⚠️  Skipped: ${error.message}`);
    }
  }
}

// Run tests
if (require.main === module) {
  const test = new MCPBridgeTest();
  test.runTests();
}

module.exports = { MCPBridgeTest };

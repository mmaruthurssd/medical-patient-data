/**
 * MCP Bridge Server
 *
 * HTTP server that exposes MCP tools as REST endpoints for Gemini function calling.
 * Handles authentication, routing, and MCP protocol communication.
 */

const express = require('express');
const { MCPClient } = require('./mcp-client');
const { ToolRegistry } = require('./mcp-tool-registry');
const { AuditLogger } = require('./audit-logger');
require('dotenv').config();

class MCPBridgeServer {
  constructor(options = {}) {
    this.port = options.port || 3000;
    this.apiKey = process.env.MCP_BRIDGE_API_KEY;

    if (!this.apiKey) {
      throw new Error('MCP_BRIDGE_API_KEY environment variable required');
    }

    this.app = express();
    this.mcpClients = new Map();
    this.registry = new ToolRegistry();
    this.auditLogger = new AuditLogger();

    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    // Parse JSON bodies
    this.app.use(express.json());

    // CORS for local development
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
      }

      next();
    });

    // API key authentication
    this.app.use('/mcp', (req, res, next) => {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          error: 'Missing or invalid Authorization header'
        });
      }

      const token = authHeader.substring(7);

      if (token !== this.apiKey) {
        return res.status(403).json({
          success: false,
          error: 'Invalid API key'
        });
      }

      next();
    });

    // Rate limiting (100 requests/minute)
    const rateLimit = require('express-rate-limit');
    const limiter = rateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: 100,
      message: { success: false, error: 'Rate limit exceeded' }
    });
    this.app.use('/mcp', limiter);
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        success: true,
        status: 'healthy',
        uptime: process.uptime(),
        mcpServers: Array.from(this.mcpClients.keys())
      });
    });

    // List available MCP servers and tools
    this.app.get('/mcp/tools', (req, res) => {
      const tools = this.registry.getAllTools();
      res.json({
        success: true,
        count: tools.length,
        tools: tools
      });
    });

    // Get Gemini function schemas
    this.app.get('/mcp/schemas/gemini', (req, res) => {
      const schemas = this.registry.getGeminiFunctionSchemas();
      res.json({
        success: true,
        count: schemas.length,
        schemas: schemas
      });
    });

    // Call MCP tool
    this.app.post('/mcp/:serverName/:toolName', async (req, res) => {
      try {
        const { serverName, toolName } = req.params;
        const parameters = req.body.parameters || req.body;

        // Validate tool exists
        if (!this.registry.hasTool(serverName, toolName)) {
          return res.status(404).json({
            success: false,
            error: `Tool '${toolName}' not found in server '${serverName}'`
          });
        }

        // Get or create MCP client
        let client = this.mcpClients.get(serverName);
        if (!client) {
          client = new MCPClient(serverName);
          await client.connect();
          this.mcpClients.set(serverName, client);
        }

        // Call MCP tool
        const startTime = Date.now();
        const result = await client.callTool(toolName, parameters);
        const duration = Date.now() - startTime;

        // Log to audit
        await this.auditLogger.log({
          timestamp: new Date().toISOString(),
          action: 'mcp_call',
          serverName,
          toolName,
          parameters,
          result: result.success ? 'success' : 'failure',
          duration,
          ip: req.ip
        });

        res.json({
          success: true,
          result: result,
          metadata: {
            server: serverName,
            tool: toolName,
            duration
          }
        });

      } catch (error) {
        console.error('MCP call error:', error);

        res.status(500).json({
          success: false,
          error: error.message,
          details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
      }
    });

    // Batch call multiple MCP tools
    this.app.post('/mcp/batch', async (req, res) => {
      try {
        const { calls } = req.body;

        if (!Array.isArray(calls)) {
          return res.status(400).json({
            success: false,
            error: 'Body must contain "calls" array'
          });
        }

        const results = [];

        for (const call of calls) {
          const { serverName, toolName, parameters } = call;

          try {
            let client = this.mcpClients.get(serverName);
            if (!client) {
              client = new MCPClient(serverName);
              await client.connect();
              this.mcpClients.set(serverName, client);
            }

            const result = await client.callTool(toolName, parameters);

            results.push({
              success: true,
              serverName,
              toolName,
              result
            });

          } catch (error) {
            results.push({
              success: false,
              serverName,
              toolName,
              error: error.message
            });
          }
        }

        res.json({
          success: true,
          count: results.length,
          results
        });

      } catch (error) {
        console.error('Batch call error:', error);

        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });
  }

  async start() {
    // Initialize tool registry with priority MCP servers
    console.log('Initializing MCP Tool Registry...');
    await this.registry.initialize();

    return new Promise((resolve) => {
      this.server = this.app.listen(this.port, () => {
        console.log(`🚀 MCP Bridge Server running on http://localhost:${this.port}`);
        console.log(`📊 API Docs: http://localhost:${this.port}/mcp/tools`);
        console.log(`💚 Health: http://localhost:${this.port}/health`);
        resolve();
      });
    });
  }

  async stop() {
    // Close all MCP clients
    for (const [name, client] of this.mcpClients.entries()) {
      console.log(`Disconnecting from ${name}...`);
      await client.disconnect();
    }

    // Close HTTP server
    if (this.server) {
      return new Promise((resolve) => {
        this.server.close(() => {
          console.log('MCP Bridge Server stopped');
          resolve();
        });
      });
    }
  }
}

// Main execution
if (require.main === module) {
  const server = new MCPBridgeServer();

  server.start().catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\nReceived SIGINT, shutting down gracefully...');
    await server.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\nReceived SIGTERM, shutting down gracefully...');
    await server.stop();
    process.exit(0);
  });
}

module.exports = { MCPBridgeServer };

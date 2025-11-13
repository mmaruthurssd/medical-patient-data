/**
 * MCP Client
 *
 * Communicates with MCP servers using the Model Context Protocol.
 * Handles connection, tool discovery, and tool execution.
 */

const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');
const path = require('path');
const fs = require('fs').promises;

class MCPClient {
  constructor(serverName) {
    this.serverName = serverName;
    this.client = null;
    this.transport = null;
    this.tools = [];
    this.connected = false;
  }

  /**
   * Connect to MCP server
   */
  async connect() {
    try {
      console.log(`Connecting to MCP server: ${this.serverName}...`);

      // Get server configuration from Claude Code's config
      const config = await this.getServerConfig();

      if (!config) {
        throw new Error(`MCP server '${this.serverName}' not found in Claude Code config`);
      }

      // Create stdio transport
      this.transport = new StdioClientTransport({
        command: config.command,
        args: config.args || [],
        env: config.env || {}
      });

      // Create MCP client
      this.client = new Client({
        name: 'gemini-mcp-bridge',
        version: '1.0.0'
      }, {
        capabilities: {
          tools: {}
        }
      });

      // Connect
      await this.client.connect(this.transport);

      // Discover available tools
      const toolsResult = await this.client.listTools();
      this.tools = toolsResult.tools || [];

      this.connected = true;

      console.log(`✅ Connected to ${this.serverName} (${this.tools.length} tools available)`);

      return {
        success: true,
        toolsCount: this.tools.length
      };

    } catch (error) {
      console.error(`Failed to connect to ${this.serverName}:`, error);
      throw error;
    }
  }

  /**
   * Get server configuration from Claude Code's config
   */
  async getServerConfig() {
    try {
      // Try workspace root config first (go up from Implementation Projects/gemini-mcp-integration)
      const workspaceRoot = path.join(__dirname, '..', '..');
      const workspaceConfigPath = path.join(
        workspaceRoot,
        '.claude',
        'mcp_config.json'
      );

      const exists = await fs.access(workspaceConfigPath)
        .then(() => true)
        .catch(() => false);

      if (exists) {
        const configData = await fs.readFile(workspaceConfigPath, 'utf-8');
        const config = JSON.parse(configData);

        if (config.mcpServers && config.mcpServers[this.serverName]) {
          return config.mcpServers[this.serverName];
        }
      }

      // Try global config
      const globalConfigPath = path.join(
        process.env.HOME || process.env.USERPROFILE,
        '.claude',
        'mcp_config.json'
      );

      const globalExists = await fs.access(globalConfigPath)
        .then(() => true)
        .catch(() => false);

      if (globalExists) {
        const configData = await fs.readFile(globalConfigPath, 'utf-8');
        const config = JSON.parse(configData);

        if (config.mcpServers && config.mcpServers[this.serverName]) {
          return config.mcpServers[this.serverName];
        }
      }

      return null;

    } catch (error) {
      console.error('Error reading MCP config:', error);
      return null;
    }
  }

  /**
   * Call an MCP tool
   */
  async callTool(toolName, parameters) {
    if (!this.connected) {
      throw new Error(`Not connected to ${this.serverName}. Call connect() first.`);
    }

    // Validate tool exists
    const tool = this.tools.find(t => t.name === toolName);
    if (!tool) {
      throw new Error(`Tool '${toolName}' not found in ${this.serverName}`);
    }

    try {
      console.log(`Calling ${this.serverName}.${toolName}...`);

      const result = await this.client.callTool({
        name: toolName,
        arguments: parameters
      });

      console.log(`✅ ${toolName} completed successfully`);

      return {
        success: true,
        content: result.content,
        isError: result.isError || false
      };

    } catch (error) {
      console.error(`Tool call failed: ${toolName}`, error);

      return {
        success: false,
        error: error.message,
        isError: true
      };
    }
  }

  /**
   * List available tools
   */
  getTools() {
    return this.tools;
  }

  /**
   * Get tool schema
   */
  getToolSchema(toolName) {
    return this.tools.find(t => t.name === toolName);
  }

  /**
   * Disconnect from server
   */
  async disconnect() {
    if (this.client && this.connected) {
      try {
        await this.client.close();
        console.log(`Disconnected from ${this.serverName}`);
      } catch (error) {
        console.error(`Error disconnecting from ${this.serverName}:`, error);
      }
    }

    this.connected = false;
    this.client = null;
    this.transport = null;
  }
}

module.exports = { MCPClient };

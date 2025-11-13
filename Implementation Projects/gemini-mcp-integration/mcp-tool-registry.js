/**
 * MCP Tool Registry
 *
 * Manages registry of available MCP tools and their Gemini function schemas.
 * Loads tools from connected MCP servers and provides schema lookup.
 */

const { MCPClient } = require('./mcp-client');
const { SchemaConverter } = require('./schema-converter');

class ToolRegistry {
  constructor() {
    this.tools = new Map(); // serverName -> [tools]
    this.geminiSchemas = []; // Flattened array of Gemini schemas
    this.initialized = false;
  }

  /**
   * Initialize registry by connecting to priority MCP servers
   */
  async initialize(priorityServers = []) {
    console.log('Initializing Tool Registry...');

    const defaultPriority = [
      'workspace-brain-mcp'
    ];

    const serversToLoad = priorityServers.length > 0 ? priorityServers : defaultPriority;

    for (const serverName of serversToLoad) {
      try {
        await this.loadServer(serverName);
      } catch (error) {
        console.warn(`Failed to load ${serverName}:`, error.message);
        // Continue loading other servers
      }
    }

    this.initialized = true;

    console.log(`✅ Tool Registry initialized (${this.geminiSchemas.length} tools available)`);

    return {
      success: true,
      serversLoaded: this.tools.size,
      toolsAvailable: this.geminiSchemas.length
    };
  }

  /**
   * Load tools from a specific MCP server
   */
  async loadServer(serverName) {
    console.log(`Loading tools from ${serverName}...`);

    const client = new MCPClient(serverName);

    try {
      await client.connect();

      const tools = client.getTools();

      // Store MCP tools
      this.tools.set(serverName, tools);

      // Convert to Gemini schemas
      for (const tool of tools) {
        const geminiSchema = SchemaConverter.mcpToGemini(tool);

        // Add server metadata
        geminiSchema.metadata = {
          server: serverName,
          originalName: tool.name
        };

        this.geminiSchemas.push(geminiSchema);
      }

      await client.disconnect();

      console.log(`✅ Loaded ${tools.length} tools from ${serverName}`);

      return {
        success: true,
        toolCount: tools.length
      };

    } catch (error) {
      console.error(`Failed to load ${serverName}:`, error);
      throw error;
    }
  }

  /**
   * Get all tools from all servers
   */
  getAllTools() {
    const allTools = [];

    for (const [serverName, tools] of this.tools.entries()) {
      for (const tool of tools) {
        allTools.push({
          server: serverName,
          name: tool.name,
          description: tool.description
        });
      }
    }

    return allTools;
  }

  /**
   * Get tools from specific server
   */
  getServerTools(serverName) {
    return this.tools.get(serverName) || [];
  }

  /**
   * Check if tool exists
   */
  hasTool(serverName, toolName) {
    const tools = this.tools.get(serverName);
    if (!tools) return false;

    return tools.some(t => t.name === toolName);
  }

  /**
   * Get tool schema (MCP format)
   */
  getToolSchema(serverName, toolName) {
    const tools = this.tools.get(serverName);
    if (!tools) return null;

    return tools.find(t => t.name === toolName);
  }

  /**
   * Get all Gemini function schemas
   */
  getGeminiFunctionSchemas() {
    return this.geminiSchemas;
  }

  /**
   * Get Gemini schema for specific tool
   */
  getGeminiSchema(serverName, toolName) {
    return this.geminiSchemas.find(
      s => s.metadata.server === serverName && s.metadata.originalName === toolName
    );
  }

  /**
   * Search tools by keyword
   */
  searchTools(keyword) {
    const lowerKeyword = keyword.toLowerCase();
    const results = [];

    for (const [serverName, tools] of this.tools.entries()) {
      for (const tool of tools) {
        const nameMatch = tool.name.toLowerCase().includes(lowerKeyword);
        const descMatch = tool.description?.toLowerCase().includes(lowerKeyword);

        if (nameMatch || descMatch) {
          results.push({
            server: serverName,
            name: tool.name,
            description: tool.description
          });
        }
      }
    }

    return results;
  }

  /**
   * Get tools by category (based on server name)
   */
  getToolsByCategory() {
    const categories = {};

    for (const [serverName, tools] of this.tools.entries()) {
      // Extract category from server name
      // e.g., "project-management-mcp" -> "Project Management"
      const category = serverName
        .replace('-mcp', '')
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      categories[category] = {
        server: serverName,
        count: tools.length,
        tools: tools.map(t => ({
          name: t.name,
          description: t.description
        }))
      };
    }

    return categories;
  }

  /**
   * Get statistics
   */
  getStats() {
    let totalTools = 0;

    for (const tools of this.tools.values()) {
      totalTools += tools.length;
    }

    return {
      serversLoaded: this.tools.size,
      totalTools,
      geminiSchemasGenerated: this.geminiSchemas.length,
      initialized: this.initialized
    };
  }
}

module.exports = { ToolRegistry };

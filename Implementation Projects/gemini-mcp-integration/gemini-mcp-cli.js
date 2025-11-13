#!/usr/bin/env node

/**
 * Gemini MCP CLI
 *
 * Interactive command-line interface for Gemini with MCP tool access.
 * Provides HIPAA-compliant conversational interface with function calling.
 */

const readline = require('readline');
const { GeminiClient } = require('./gemini-client');
const PHIGuard = require('../../google-workspace-oauth-setup/phi-guard');
const { AuditLogger } = require('./audit-logger');
const DriveSync = require('../../google-workspace-oauth-setup/drive-sync');
const { getAuthenticatedClient } = require('../../google-drive-sync/auth');
require('dotenv').config({ path: '../../.env' });


class GeminiMCPCLI {
  constructor() {
    this.gemini = null;
    this.guard = new PHIGuard();
    this.auditLogger = new AuditLogger();
    this.driveSync = null;
    this.conversationHistory = [];
    this.rl = null;
    this.running = false;

    // CLI configuration
    this.projectPath = process.cwd();
    this.promptPrefix = '🤖 Gemini';
    this.userPrefix = '👤 You';
  }

  /**
   * Initialize CLI
   */
  async initialize() {
    console.log('╔════════════════════════════════════════════════════╗');
    console.log('║      Gemini MCP CLI - HIPAA Compliant Edition      ║');
    console.log('╚════════════════════════════════════════════════════╝\n');

    // Check API key
    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ Error: GEMINI_API_KEY environment variable not set');
      console.log('\nPlease add to your .env file:');
      console.log('GEMINI_API_KEY=your-api-key-here\n');
      process.exit(1);
    }

    // Initialize Gemini client with MCP bridge and file access
    console.log('Initializing Gemini with MCP support and file access...');

    this.gemini = new GeminiClient({
      apiKey: process.env.GEMINI_API_KEY,
      bridgeUrl: process.env.MCP_BRIDGE_URL || 'http://localhost:3000',
      bridgeApiKey: process.env.MCP_BRIDGE_API_KEY,
      workspacePath: this.projectPath
    });

    try {
      await this.gemini.initialize();
      console.log(`✅ Connected to Gemini (${this.gemini.getToolCount()} MCP tools available)`);
    } catch (error) {
      console.error('❌ Failed to initialize Gemini:', error.message);
      console.log('\nMake sure the MCP Bridge Server is running:');
      console.log('  node mcp-bridge-server.js\n');
      process.exit(1);
    }

    // Initialize DriveSync
    try {
      const auth = getAuthenticatedClient();
      this.driveSync = new DriveSync(auth);
      console.log('✅ Google Drive Sync initialized.');
    } catch (error) {
      console.error('❌ Failed to initialize Google Drive Sync:', error.message);
    }


    console.log('\n📋 Available commands:');
    console.log('  /tools    - List available MCP tools');
    console.log('  /history  - Show conversation history');
    console.log('  /clear    - Clear conversation history');
    console.log('  /stats    - Show audit statistics');
    console.log('  /describe_image <path> - Describe an image');
    console.log('  /help     - Show this help message');
    console.log('  /exit     - Exit CLI\n');

    console.log('Type your message or command:\n');

    // Setup readline
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: `${this.userPrefix}: `
    });

    this.running = true;
  }

  /**
   * Start interactive session
   */
  async start() {
    await this.initialize();

    this.rl.prompt();

    this.rl.on('line', async (line) => {
      const input = line.trim();

      if (!input) {
        this.rl.prompt();
        return;
      }

      // Handle commands
      if (input.startsWith('/')) {
        await this.handleCommand(input);
        this.rl.prompt();
        return;
      }

      // Process user message
      await this.processMessage(input);

      this.rl.prompt();
    });

    this.rl.on('close', async () => {
      await this.shutdown();
    });
  }

  /**
   * Process user message
   */
  async processMessage(input) {
    try {
      // Detect PHI
      const detection = this.guard.detectPHI(input);

      if (detection.hasPHI) {
        console.log(`\n⚠️  PHI detected: ${detection.phiTypes.join(', ')}`);

        // De-identify
        const deidentified = this.guard.deidentify(input);
        const processedInput = deidentified.deidentifiedText;

        console.log('✓ PHI removed before processing\n');

        // Log PHI operation
        await this.auditLogger.logPHIOperation({
          operation: 'deidentify',
          hasPHI: true,
          phiTypes: detection.phiTypes,
          phiCount: detection.phiCount,
          inputLength: input.length,
          outputLength: processedInput.length
        });

        // Use de-identified version
        input = processedInput;
      }

      // Add to conversation history
      this.conversationHistory.push({
        role: 'user',
        content: input
      });

      // Get response from Gemini
      console.log(`\n${this.promptPrefix}: Thinking...`);

      const startTime = Date.now();
      const response = await this.gemini.chat(input, this.conversationHistory);
      const duration = Date.now() - startTime;

      // Log Gemini call
      await this.auditLogger.logGeminiCall({
        model: this.gemini.model,
        inputTokens: response.inputTokens || 0,
        outputTokens: response.outputTokens || 0,
        hasFunctionCalling: response.functionsUsed && response.functionsUsed.length > 0,
        functionsUsed: response.functionsUsed || [],
        success: response.success,
        error: response.error,
        duration
      });

      // Display response
      console.log(`\n${this.promptPrefix}: ${response.text}\n`);

      // Show function calls if any
      if (response.functionsUsed && response.functionsUsed.length > 0) {
        console.log(`📞 MCP Tools used: ${response.functionsUsed.join(', ')}\n`);
      }

      // Add to conversation history
      this.conversationHistory.push({
        role: 'model',
        content: response.text
      });

    } catch (error) {
      console.error(`\n❌ Error: ${error.message}\n`);
    }
  }

  /**
   * Handle CLI commands
   */
  async handleCommand(command) {
    const parts = command.substring(1).split(' ');
    const cmd = parts[0];
    const args = parts.slice(1);

    switch (cmd.toLowerCase()) {
      case 'tools':
        await this.showTools(args[0]);
        break;

      case 'history':
        this.showHistory();
        break;

      case 'clear':
        this.conversationHistory = [];
        console.log('✓ Conversation history cleared\n');
        break;

      case 'stats':
        await this.showStats();
        break;

      case 'describe_image':
        if (args.length === 0) {
          console.log('Usage: /describe_image <path_to_image>');
          return;
        }
        const imagePath = args.join(' ');
        await this.describeImage(imagePath);
        break;

      case 'help':
        this.showHelp();
        break;

      case 'exit':
      case 'quit':
        this.rl.close();
        break;

      default:
        console.log(`Unknown command: ${command}`);
        console.log('Type /help for available commands\n');
    }
  }

  /**
   * Describe an image using Gemini Vision
   */
  async describeImage(imagePath) {
    console.log(`\n🖼️  Describing image: ${imagePath}`);
    const response = await this.gemini.chatWithImage('Describe this image in detail.', imagePath);
    console.log(`\n${this.promptPrefix}: ${response.text}\n`);
  }


  /**
   * Show available MCP tools
   */
  async showTools(filter) {
    console.log('\n📦 Available MCP Tools:\n');

    const tools = this.gemini.getTools();

    if (filter) {
      const filtered = tools.filter(t =>
        t.name.toLowerCase().includes(filter.toLowerCase()) ||
        t.description.toLowerCase().includes(filter.toLowerCase())
      );

      if (filtered.length === 0) {
        console.log(`No tools found matching: ${filter}\n`);
        return;
      }

      filtered.forEach(tool => {
        console.log(`  • ${tool.name}`);
        console.log(`    ${tool.description}\n`);
      });

      console.log(`Showing ${filtered.length} of ${tools.length} tools\n`);
    } else {
      // Group by category
      const categories = {};

      tools.forEach(tool => {
        const category = tool.metadata?.server || 'Other';
        if (!categories[category]) {
          categories[category] = [];
        }
        categories[category].push(tool);
      });

      for (const [category, categoryTools] of Object.entries(categories)) {
        console.log(`  ${category} (${categoryTools.length} tools):`);
        categoryTools.forEach(tool => {
          console.log(`    • ${tool.name} - ${tool.description}`);
        });
        console.log('');
      }

      console.log(`Total: ${tools.length} tools available\n`);
    }
  }

  /**
   * Show conversation history
   */
  showHistory() {
    console.log('\n📜 Conversation History:\n');

    if (this.conversationHistory.length === 0) {
      console.log('  (empty)\n');
      return;
    }

    this.conversationHistory.forEach((msg, i) => {
      const prefix = msg.role === 'user' ? this.userPrefix : this.promptPrefix;
      console.log(`${i + 1}. ${prefix}: ${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}`);
    });

    console.log(`\nTotal messages: ${this.conversationHistory.length}\n`);
  }

  /**
   * Show audit statistics
   */
  async showStats() {
    try {
      console.log('\n📊 Audit Statistics:\n');

      // Get stats from last 24 hours
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const stats = await this.auditLogger.getStats({
        startDate: yesterday.toISOString()
      });

      console.log(`  Total entries (last 24h): ${stats.totalEntries}`);
      console.log(`\n  Actions:`);

      for (const [action, count] of Object.entries(stats.actionCounts)) {
        console.log(`    • ${action}: ${count}`);
      }

      console.log(`\n  PHI Detection:`);
      console.log(`    • Total: ${stats.phiDetection.total} (${stats.phiDetection.percentage}%)`);

      if (Object.keys(stats.phiDetection.typeBreakdown).length > 0) {
        console.log(`    • Types detected:`);
        for (const [type, count] of Object.entries(stats.phiDetection.typeBreakdown)) {
          console.log(`      - ${type}: ${count}`);
        }
      }

      if (stats.mcpToolUsage.topTools.length > 0) {
        console.log(`\n  Top MCP Tools:`);
        stats.mcpToolUsage.topTools.forEach(({ tool, count }, i) => {
          console.log(`    ${i + 1}. ${tool}: ${count} calls`);
        });
      }

      console.log('');

    } catch (error) {
      console.log(`  (No audit data available yet)\n`);
    }
  }

  /**
   * Show help message
   */
  showHelp() {
    console.log('\n📖 Gemini MCP CLI Help\n');
    console.log('Commands:');
    console.log('  /tools [filter]  - List available MCP tools (optionally filter by keyword)');
    console.log('  /history         - Show conversation history');
    console.log('  /clear           - Clear conversation history');
    console.log('  /stats           - Show audit statistics');
    console.log('  /describe_image <path> - Describe an image');
    console.log('  /help            - Show this help message');
    console.log('  /exit            - Exit CLI\n');
    console.log('Usage:');
    console.log('  Simply type your message and press Enter');
    console.log('  Gemini will automatically use MCP tools as needed');
    console.log('  PHI is automatically detected and removed\n');
    console.log('Examples:');
    console.log('  "Create a goal to implement patient portal API"');
    console.log('  "Show me what tasks are pending"');
    console.log('  "What have I been working on this week?"\n');
  }

  /**
   * Shutdown CLI
   */
  async shutdown() {
    if (!this.running) return;

    this.running = false;

    console.log('\n\n👋 Goodbye!\n');

    // Flush audit log to file
    await this.auditLogger.flush();

    // Sync audit log to Google Drive
    if (this.driveSync) {
      try {
        console.log('🔄 Syncing audit log to Google Drive...');
        const driveId = await this.driveSync.getSharedDriveId('AI Development - No PHI');
        const result = await this.driveSync.syncAuditLog(this.auditLogger.logPath, driveId);
        console.log(`✅ Audit log synced to Google Drive: ${result.fileName}`);
      } catch (error) {
        console.error('❌ Failed to sync audit log to Google Drive:', error.message);
      }
    }

    console.log('✓ Session ended\n');

    process.exit(0);
  }
}

// Main execution
if (require.main === module) {
  const cli = new GeminiMCPCLI();

  cli.start().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { GeminiMCPCLI };

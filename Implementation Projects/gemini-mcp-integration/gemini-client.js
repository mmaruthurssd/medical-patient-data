/**
 * Gemini Client
 *
 * Google Gemini API client with MCP function calling support.
 * Handles chat, function calling, and integration with MCP Bridge.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const { FileOperations } = require('./file-operations');
const path = require('path');
const fs = require('fs').promises;

class GeminiClient {
  constructor(options = {}) {
    if (!options.apiKey) {
      throw new Error('Gemini API key required');
    }

    this.apiKey = options.apiKey;
    this.model = options.model || process.env.GEMINI_MODEL || 'gemini-pro-latest';
    this.visionModel = 'gemini-2.5-flash-image'; // Corrected vision model
    this.bridgeUrl = options.bridgeUrl || 'http://localhost:3000';
    this.bridgeApiKey = options.bridgeApiKey;

    // Initialize file operations
    const workspacePath = options.workspacePath || path.join(__dirname, '..', '..');
    this.fileOps = new FileOperations(workspacePath);

    // Initialize Gemini
    this.genAI = new GoogleGenerativeAI(this.apiKey);

    // Tools and schemas
    this.tools = [];
    this.functionDeclarations = [];
    this.initialized = false;
  }

  /**
   * Initialize client and load MCP tools
   */
  async initialize() {
    console.log('Loading tools...');

    try {
      // Get file operation schemas
      const fileSchemas = FileOperations.getFunctionSchemas();
      console.log(`Loaded ${fileSchemas.length} file operations`);

      // Get Gemini function schemas from bridge
      const response = await axios.get(`${this.bridgeUrl}/mcp/schemas/gemini`, {
        headers: this.bridgeApiKey ? {
          'Authorization': `Bearer ${this.bridgeApiKey}`
        } : {}
      });

      if (!response.data.success) {
        throw new Error('Failed to load MCP schemas');
      }

      const mcpSchemas = response.data.schemas;
      console.log(`Loaded ${mcpSchemas.length} MCP tools`);

      // Store original schemas with metadata for routing
      this.functionDeclarations = [...fileSchemas, ...mcpSchemas];

      // Clean schemas for Gemini (remove metadata field)
      const cleanedSchemas = this.functionDeclarations.map(schema => {
        const { metadata, ...cleanSchema } = schema;
        return cleanSchema;
      });

      console.log(`Total tools available: ${this.functionDeclarations.length}`);

      // Create generative model with cleaned tools
      this.generativeModel = this.genAI.getGenerativeModel({
        model: this.model,
        tools: [{
          functionDeclarations: cleanedSchemas
        }]
      });

      // Create vision model
      this.visionGenerativeModel = this.genAI.getGenerativeModel({
        model: this.visionModel
      });


      this.initialized = true;

      return {
        success: true,
        toolsLoaded: this.functionDeclarations.length
      };

    } catch (error) {
      console.error('Failed to initialize Gemini client:', error.message);
      throw error;
    }
  }

  /**
   * Chat with Gemini (with function calling support)
   */
  async chat(message, conversationHistory = []) {
    if (!this.initialized) {
      throw new Error('Client not initialized. Call initialize() first.');
    }

    try {
      // Build conversation context
      const history = conversationHistory.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      }));

      // Start chat session
      const chat = this.generativeModel.startChat({
        history: history
      });

      // Send message
      let result = await chat.sendMessage(message);
      let response = result.response;

      // Track function calls
      const functionsUsed = [];
      let iterationCount = 0;
      const maxIterations = 10;

      // Handle function calling loop
      while (response.functionCalls && response.functionCalls.length > 0) {
        iterationCount++;

        if (iterationCount > maxIterations) {
          console.warn('Max function calling iterations reached');
          break;
        }

        const functionCall = response.functionCalls[0];
        const functionName = functionCall.name;

        console.log(`  Calling MCP function: ${functionName}...`);

        functionsUsed.push(functionName);

        // Execute function via MCP Bridge
        const functionResult = await this.executeMCPFunction(
          functionName,
          functionCall.args
        );

        // Send function result back to Gemini
        result = await chat.sendMessage([{
          functionResponse: {
            name: functionName,
            response: functionResult
          }
        }]);

        response = result.response;
      }

      // Get final text response
      const text = response.text();

      // Extract token usage
      const usageMetadata = result.response.usageMetadata || {};

      return {
        success: true,
        text,
        functionsUsed,
        inputTokens: usageMetadata.promptTokenCount || 0,
        outputTokens: usageMetadata.candidatesTokenCount || 0,
        totalTokens: usageMetadata.totalTokenCount || 0
      };

    } catch (error) {
      console.error('Chat error:', error);

      return {
        success: false,
        error: error.message,
        text: `I encountered an error: ${error.message}`
      };
    }
  }

  /**
   * Chat with Gemini with an image
   */
  async chatWithImage(prompt, imagePath) {
    if (!this.initialized) {
      throw new Error('Client not initialized. Call initialize() first.');
    }

    try {
      const imageBuffer = await fs.readFile(imagePath);
      const imageBase64 = imageBuffer.toString('base64');

      const imagePart = {
        inlineData: {
          data: imageBase64,
          mimeType: 'image/jpeg', // Assuming JPEG, might need to make this dynamic
        },
      };

      const result = await this.visionGenerativeModel.generateContent([prompt, imagePart]);
      const response = result.response;
      const text = response.text();

      return {
        success: true,
        text,
      };

    } catch (error) {
      console.error('Image chat error:', error);
      return {
        success: false,
        error: error.message,
        text: `I encountered an error while processing the image: ${error.message}`
      };
    }
  }


  /**
   * Execute function (file operation or MCP tool)
   */
  async executeMCPFunction(functionName, args) {
    try {
      // Check if it's a file operation
      const fileOpNames = ['read_file', 'write_file', 'list_files', 'search_files', 'get_file_info', 'append_to_file', 'delete_file'];

      if (fileOpNames.includes(functionName)) {
        // Execute file operation
        return await this.fileOps.execute(functionName, args);
      }

      // Otherwise, it's an MCP tool
      const funcDecl = this.functionDeclarations.find(f => f.name === functionName);

      if (!funcDecl || !funcDecl.metadata) {
        throw new Error(`Function ${functionName} not found`);
      }

      const serverName = funcDecl.metadata.server;

      // Call MCP bridge
      const response = await axios.post(
        `${this.bridgeUrl}/mcp/${serverName}/${functionName}`,
        {
          parameters: args
        },
        {
          headers: this.bridgeApiKey ? {
            'Authorization': `Bearer ${this.bridgeApiKey}`,
            'Content-Type': 'application/json'
          } : {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.error || 'MCP call failed');
      }

      return response.data.result;

    } catch (error) {
      console.error(`Function execution failed: ${functionName}`, error.message);

      return {
        error: error.message,
        success: false
      };
    }
  }

  /**
   * Generate content without function calling
   */
  async generate(prompt) {
    if (!this.initialized) {
      throw new Error('Client not initialized. Call initialize() first.');
    }

    try {
      const result = await this.generativeModel.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      return {
        success: true,
        text
      };

    } catch (error) {
      console.error('Generation error:', error);

      return {
        success: false,
        error: error.message,
        text: ''
      };
    }
  }

  /**
   * Get available tools
   */
  getTools() {
    return this.functionDeclarations;
  }

  /**
   * Get tool count
   */
  getToolCount() {
    return this.functionDeclarations.length;
  }

  /**
   * Search tools by keyword
   */
  searchTools(keyword) {
    const lowerKeyword = keyword.toLowerCase();

    return this.functionDeclarations.filter(func => {
      const nameMatch = func.name.toLowerCase().includes(lowerKeyword);
      const descMatch = func.description.toLowerCase().includes(lowerKeyword);

      return nameMatch || descMatch;
    });
  }
}

module.exports = { GeminiClient };
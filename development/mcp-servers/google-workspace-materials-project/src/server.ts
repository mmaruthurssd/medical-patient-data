#!/usr/bin/env node

/**
 * Google Workspace Materials MCP Server
 *
 * MCP server for AI-powered Google Workspace print materials generation
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool
} from '@modelcontextprotocol/sdk/types.js';

import {
  createFromPromptTool,
  aiEnhanceTool,
  createFromPrompt,
  aiEnhance,
  type CreateFromPromptParams,
  type AiEnhanceParams
} from './tools/content-generation.js';

/**
 * MCP Server instance
 */
const server = new Server(
  {
    name: 'google-workspace-materials',
    version: '1.0.0'
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

/**
 * Tool definitions
 */
const tools: Tool[] = [
  createFromPromptTool as Tool,
  aiEnhanceTool as Tool
];

/**
 * Handler: List available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools
  };
});

/**
 * Handler: Execute tool
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'create_from_prompt': {
        const params = args as unknown as CreateFromPromptParams;
        const result = await createFromPrompt(params);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }

      case 'ai_enhance': {
        const params = args as unknown as AiEnhanceParams;
        const result = await aiEnhance(params);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : String(error)
          })
        }
      ],
      isError: true
    };
  }
});

/**
 * Start server
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('Google Workspace Materials MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

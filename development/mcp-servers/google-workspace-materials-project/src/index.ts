#!/usr/bin/env node
/**
 * Google Workspace Materials MCP Server
 * AI-first print materials automation with Google Drive sync.
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, Tool } from '@modelcontextprotocol/sdk/types.js';
import { updateIndex, queryIndex } from './tools/index-management.js';
import { exportToPdf } from './tools/pdf-export.js';
import { DriveClient } from './lib/drive-client.js';
import { IndexManager } from './lib/index-manager.js';

const SERVER_NAME = 'google-workspace-materials';
const SERVER_VERSION = '1.0.0';

const TOOLS: Tool[] = [
  {
    name: 'update_index',
    description: 'Add, update, or remove entries in the print materials index',
    inputSchema: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['add', 'update', 'remove'] },
        materialId: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            type: { type: 'string', enum: ['discharge-instructions', 'patient-education', 'clinical-handout', 'consent-form', 'other'] },
            format: { type: 'string', enum: ['doc', 'slides', 'pdf', 'markdown'] },
            driveFileId: { type: 'string' },
            pdfFileId: { type: 'string' },
            templateId: { type: 'string' },
            tokens: { type: 'array', items: { type: 'string' } },
            tags: { type: 'array', items: { type: 'string' } },
            category: { type: 'string' },
            status: { type: 'string', enum: ['active', 'archived', 'draft'] }
          }
        },
        indexFileId: { type: 'string' },
        driveFolderId: { type: 'string' }
      },
      required: ['action']
    }
  },
  {
    name: 'query_index',
    description: 'Search and filter materials in the index',
    inputSchema: {
      type: 'object',
      properties: {
        filters: {
          type: 'object',
          properties: {
            type: { type: 'string' },
            format: { type: 'string' },
            tags: { type: 'array', items: { type: 'string' } },
            status: { type: 'string' },
            category: { type: 'string' },
            dateRange: {
              type: 'object',
              properties: {
                start: { type: 'string' },
                end: { type: 'string' }
              }
            }
          }
        },
        sortBy: { type: 'string', enum: ['created', 'updated', 'usage_count', 'name'] },
        limit: { type: 'number' },
        indexFileId: { type: 'string' }
      }
    }
  },
  {
    name: 'export_to_pdf',
    description: 'Export Google Doc or Slides to PDF in Drive',
    inputSchema: {
      type: 'object',
      properties: {
        sourceId: { type: 'string' },
        outputFolderId: { type: 'string' },
        filename: { type: 'string' },
        updateIndex: { type: 'boolean' },
        indexFileId: { type: 'string' },
        localOutputPath: { type: 'string' }
      },
      required: ['sourceId', 'filename']
    }
  }
];

class GoogleWorkspaceMaterialsServer {
  private server: Server;
  private driveClient!: DriveClient;
  private indexManager!: IndexManager;

  constructor() {
    this.server = new Server({ name: SERVER_NAME, version: SERVER_VERSION }, { capabilities: { tools: {} } });
    this.setupHandlers();
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        if (!this.driveClient) {
          this.driveClient = new DriveClient();
          this.indexManager = new IndexManager(this.driveClient);
        }
        const { name, arguments: args } = request.params;
        switch (name) {
          case 'update_index':
            return { content: [{ type: 'text', text: JSON.stringify(await updateIndex(args as any, this.driveClient, this.indexManager), null, 2) }] };
          case 'query_index':
            return { content: [{ type: 'text', text: JSON.stringify(await queryIndex(args as any, this.driveClient, this.indexManager), null, 2) }] };
          case 'export_to_pdf':
            return { content: [{ type: 'text', text: JSON.stringify(await exportToPdf(args as any, this.driveClient, this.indexManager), null, 2) }] };
          default:
            return { content: [{ type: 'text', text: JSON.stringify({ error: `Unknown tool: ${name}` }) }], isError: true };
        }
      } catch (error) {
        return { content: [{ type: 'text', text: JSON.stringify({ error: error instanceof Error ? error.message : String(error) }) }], isError: true };
      }
    });
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Google Workspace Materials MCP Server running on stdio');
  }
}

const server = new GoogleWorkspaceMaterialsServer();
server.run().catch(console.error);

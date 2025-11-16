/**
 * Index Management Tools
 *
 * MCP tools for managing the print materials index.
 */

import { DriveClient } from '../lib/drive-client.js';
import { IndexManager, MaterialEntry, MaterialIndex } from '../lib/index-manager.js';

export interface UpdateIndexArgs {
  action: 'add' | 'update' | 'remove';
  materialId?: string;
  data?: {
    name?: string;
    type?: 'discharge-instructions' | 'patient-education' | 'clinical-handout' | 'consent-form' | 'other';
    format?: 'doc' | 'slides' | 'pdf' | 'markdown';
    driveFileId?: string;
    pdfFileId?: string;
    templateId?: string;
    tokens?: string[];
    tags?: string[];
    category?: string;
    status?: 'active' | 'archived' | 'draft';
  };
  indexFileId?: string;
  driveFolderId?: string;
}

export interface QueryIndexArgs {
  filters?: {
    type?: string;
    format?: string;
    tags?: string[];
    status?: string;
    category?: string;
    dateRange?: {
      start: string;
      end: string;
    };
  };
  sortBy?: 'created' | 'updated' | 'usage_count' | 'name';
  limit?: number;
  indexFileId?: string;
}

/**
 * Update index tool handler
 */
export async function updateIndex(
  args: UpdateIndexArgs,
  driveClient: DriveClient,
  indexManager: IndexManager
): Promise<{
  success: boolean;
  entry?: MaterialEntry;
  message: string;
  indexFileId?: string;
}> {
  try {
    // Read current index
    const index = await indexManager.readIndex(args.indexFileId);

    let entry: MaterialEntry | null = null;
    let message = '';

    switch (args.action) {
      case 'add':
        if (!args.data || !args.data.name || !args.data.type || !args.data.format) {
          return {
            success: false,
            message: 'Missing required fields: name, type, and format are required for add action',
          };
        }

        // Create new material entry
        entry = await indexManager.addMaterial(index, {
          name: args.data.name,
          type: args.data.type,
          format: args.data.format,
          driveFileId: args.data.driveFileId,
          pdfFileId: args.data.pdfFileId,
          templateId: args.data.templateId,
          tokens: args.data.tokens,
          tags: args.data.tags,
          category: args.data.category,
          status: args.data.status || 'active',
        });

        message = `Added material: ${entry.name} (ID: ${entry.id})`;
        break;

      case 'update':
        if (!args.materialId) {
          return {
            success: false,
            message: 'materialId is required for update action',
          };
        }

        entry = await indexManager.updateMaterial(index, args.materialId, args.data || {});

        if (!entry) {
          return {
            success: false,
            message: `Material not found: ${args.materialId}`,
          };
        }

        message = `Updated material: ${entry.name} (ID: ${entry.id})`;
        break;

      case 'remove':
        if (!args.materialId) {
          return {
            success: false,
            message: 'materialId is required for remove action',
          };
        }

        // Archive the material instead of deleting
        entry = await indexManager.updateMaterial(index, args.materialId, {
          status: 'archived',
        });

        if (!entry) {
          return {
            success: false,
            message: `Material not found: ${args.materialId}`,
          };
        }

        message = `Archived material: ${entry.name} (ID: ${entry.id})`;
        break;

      default:
        return {
          success: false,
          message: `Invalid action: ${args.action}`,
        };
    }

    // Sync to Drive if folder ID provided
    let indexFileId = args.indexFileId;
    if (args.driveFolderId) {
      indexFileId = await indexManager.writeIndex(index, args.driveFolderId);
    } else {
      // Update local cache only
      await indexManager.writeIndex(index);
    }

    return {
      success: true,
      entry: entry || undefined,
      message,
      indexFileId,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `Failed to update index: ${errorMessage}`,
    };
  }
}

/**
 * Query index tool handler
 */
export async function queryIndex(
  args: QueryIndexArgs,
  driveClient: DriveClient,
  indexManager: IndexManager
): Promise<{
  success: boolean;
  materials?: MaterialEntry[];
  count?: number;
  message: string;
}> {
  try {
    // Read current index
    const index = await indexManager.readIndex(args.indexFileId);

    // Apply filters
    let results = await indexManager.queryMaterials(index, {
      type: args.filters?.type,
      format: args.filters?.format,
      status: args.filters?.status,
      tags: args.filters?.tags,
      category: args.filters?.category,
    });

    // Apply date range filter
    if (args.filters?.dateRange) {
      const startDate = new Date(args.filters.dateRange.start);
      const endDate = new Date(args.filters.dateRange.end);

      results = results.filter((m) => {
        const createdDate = new Date(m.created);
        return createdDate >= startDate && createdDate <= endDate;
      });
    }

    // Sort results
    if (args.sortBy) {
      results = sortMaterials(results, args.sortBy);
    }

    // Limit results
    if (args.limit && args.limit > 0) {
      results = results.slice(0, args.limit);
    }

    return {
      success: true,
      materials: results,
      count: results.length,
      message: `Found ${results.length} material(s)`,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `Failed to query index: ${errorMessage}`,
    };
  }
}

/**
 * Sort materials by field
 */
function sortMaterials(
  materials: MaterialEntry[],
  sortBy: 'created' | 'updated' | 'usage_count' | 'name'
): MaterialEntry[] {
  const sorted = [...materials];

  switch (sortBy) {
    case 'created':
      sorted.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
      break;
    case 'updated':
      sorted.sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime());
      break;
    case 'usage_count':
      sorted.sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0));
      break;
    case 'name':
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
  }

  return sorted;
}

/**
 * Helper: Find material by Drive file ID
 */
export async function findByDriveFileId(
  index: MaterialIndex,
  driveFileId: string
): Promise<MaterialEntry | null> {
  return index.materials.find((m) => m.driveFileId === driveFileId) || null;
}

/**
 * Material Index Manager
 *
 * Manages the print-materials-index.json file in Google Drive and local cache.
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { DriveClient } from './drive-client.js';

export interface MaterialEntry {
  id: string;
  name: string;
  type: 'discharge-instructions' | 'patient-education' | 'clinical-handout' | 'consent-form' | 'other';
  format: 'doc' | 'slides' | 'pdf' | 'markdown';
  driveFileId?: string;
  pdfFileId?: string;
  templateId?: string;
  localPath?: string;
  created: string;
  updated: string;
  tokens?: string[];
  status: 'active' | 'archived' | 'draft';
  usage_count?: number;
  tags?: string[];
  category?: string;
}

export interface TemplateEntry {
  id: string;
  name: string;
  type: string;
  driveFileId?: string;
  localPath?: string;
  tokens: string[];
  created: string;
  updated: string;
}

export interface MaterialIndex {
  materials: MaterialEntry[];
  templates: TemplateEntry[];
  last_updated: string;
  version: string;
}

export class IndexManager {
  private driveClient: DriveClient;
  private localCachePath: string;
  private driveIndexFileId?: string;

  constructor(driveClient: DriveClient, localCachePath?: string) {
    this.driveClient = driveClient;
    this.localCachePath = localCachePath || join(process.cwd(), '.cache', 'print-materials-index.json');
  }

  /**
   * Create empty index structure
   */
  createIndex(): MaterialIndex {
    return {
      materials: [],
      templates: [],
      last_updated: new Date().toISOString(),
      version: '1.0.0',
    };
  }

  /**
   * Read index from Drive or local cache
   * Priority: Drive > Local Cache > New
   */
  async readIndex(driveIndexFileId?: string): Promise<MaterialIndex> {
    // Try Drive first
    if (driveIndexFileId || this.driveIndexFileId) {
      try {
        const fileId = driveIndexFileId || this.driveIndexFileId!;
        const tempPath = join(dirname(this.localCachePath), 'temp-index.json');

        await this.driveClient.downloadFile(fileId, tempPath);
        const content = await fs.readFile(tempPath, 'utf-8');
        const index = JSON.parse(content) as MaterialIndex;

        // Cache locally
        await this.writeLocalCache(index);
        await fs.unlink(tempPath);

        return index;
      } catch (error) {
        console.error('Failed to read from Drive, falling back to local cache:', error);
      }
    }

    // Try local cache
    try {
      const content = await fs.readFile(this.localCachePath, 'utf-8');
      return JSON.parse(content) as MaterialIndex;
    } catch (error) {
      // Return new index if nothing exists
      console.log('No existing index found, creating new one');
      return this.createIndex();
    }
  }

  /**
   * Write index to Drive and local cache
   */
  async writeIndex(index: MaterialIndex, driveFolderId?: string): Promise<string> {
    // Update timestamp
    index.last_updated = new Date().toISOString();

    // Write to local cache first
    await this.writeLocalCache(index);

    // Upload to Drive
    if (driveFolderId) {
      const tempPath = join(dirname(this.localCachePath), 'temp-index-upload.json');
      await fs.writeFile(tempPath, JSON.stringify(index, null, 2));

      if (this.driveIndexFileId) {
        // Update existing file
        await this.driveClient.updateFile(this.driveIndexFileId, tempPath);
      } else {
        // Create new file
        const result = await this.driveClient.uploadFile(
          tempPath,
          'print-materials-index.json',
          driveFolderId
        );
        this.driveIndexFileId = result.fileId;
      }

      await fs.unlink(tempPath);
      return this.driveIndexFileId;
    }

    return '';
  }

  /**
   * Write to local cache only
   */
  private async writeLocalCache(index: MaterialIndex): Promise<void> {
    await fs.mkdir(dirname(this.localCachePath), { recursive: true });
    await fs.writeFile(this.localCachePath, JSON.stringify(index, null, 2));
  }

  /**
   * Add material entry to index
   */
  async addMaterial(
    index: MaterialIndex,
    material: Omit<MaterialEntry, 'id' | 'created' | 'updated'>
  ): Promise<MaterialEntry> {
    const entry: MaterialEntry = {
      ...material,
      id: this.generateId('mat'),
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      usage_count: material.usage_count || 0,
      status: material.status || 'active',
    };

    index.materials.push(entry);
    return entry;
  }

  /**
   * Update existing material entry
   */
  async updateMaterial(
    index: MaterialIndex,
    materialId: string,
    updates: Partial<MaterialEntry>
  ): Promise<MaterialEntry | null> {
    const materialIndex = index.materials.findIndex((m) => m.id === materialId);

    if (materialIndex === -1) {
      return null;
    }

    const material = index.materials[materialIndex];
    const updated: MaterialEntry = {
      ...material,
      ...updates,
      id: material.id, // Don't allow ID changes
      created: material.created, // Don't allow created date changes
      updated: new Date().toISOString(),
    };

    index.materials[materialIndex] = updated;
    return updated;
  }

  /**
   * Query materials by filters
   */
  async queryMaterials(
    index: MaterialIndex,
    filters: {
      type?: string;
      format?: string;
      status?: string;
      tags?: string[];
      category?: string;
      search?: string;
    }
  ): Promise<MaterialEntry[]> {
    let results = [...index.materials];

    // Apply filters
    if (filters.type) {
      results = results.filter((m) => m.type === filters.type);
    }

    if (filters.format) {
      results = results.filter((m) => m.format === filters.format);
    }

    if (filters.status) {
      results = results.filter((m) => m.status === filters.status);
    }

    if (filters.category) {
      results = results.filter((m) => m.category === filters.category);
    }

    if (filters.tags && filters.tags.length > 0) {
      results = results.filter((m) =>
        m.tags?.some((tag) => filters.tags!.includes(tag))
      );
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      results = results.filter(
        (m) =>
          m.name.toLowerCase().includes(searchLower) ||
          m.tags?.some((tag) => tag.toLowerCase().includes(searchLower)) ||
          m.category?.toLowerCase().includes(searchLower)
      );
    }

    return results;
  }

  /**
   * Add template entry to index
   */
  async addTemplate(
    index: MaterialIndex,
    template: Omit<TemplateEntry, 'id' | 'created' | 'updated'>
  ): Promise<TemplateEntry> {
    const entry: TemplateEntry = {
      ...template,
      id: this.generateId('tpl'),
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    };

    index.templates.push(entry);
    return entry;
  }

  /**
   * Get material by ID
   */
  async getMaterial(index: MaterialIndex, materialId: string): Promise<MaterialEntry | null> {
    return index.materials.find((m) => m.id === materialId) || null;
  }

  /**
   * Get template by ID
   */
  async getTemplate(index: MaterialIndex, templateId: string): Promise<TemplateEntry | null> {
    return index.templates.find((t) => t.id === templateId) || null;
  }

  /**
   * Increment usage count for a material
   */
  async incrementUsage(index: MaterialIndex, materialId: string): Promise<void> {
    const material = await this.getMaterial(index, materialId);
    if (material) {
      material.usage_count = (material.usage_count || 0) + 1;
      material.updated = new Date().toISOString();
    }
  }

  /**
   * Set Drive index file ID for future operations
   */
  setDriveIndexFileId(fileId: string): void {
    this.driveIndexFileId = fileId;
  }

  /**
   * Generate unique ID
   */
  private generateId(prefix: string): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7);
    return `${prefix}-${timestamp}-${random}`;
  }
}

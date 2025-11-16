/**
 * Index Management Tools Tests
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { updateIndex, queryIndex, findByDriveFileId } from './index-management.js';
import { DriveClient } from '../lib/drive-client.js';
import { IndexManager, MaterialIndex, MaterialEntry } from '../lib/index-manager.js';

// Mock DriveClient
jest.mock('../lib/drive-client.js');

describe('Index Management Tools', () => {
  let mockDriveClient: jest.Mocked<DriveClient>;
  let mockIndexManager: jest.Mocked<IndexManager>;
  let mockIndex: MaterialIndex;

  beforeEach(() => {
    // Create mock DriveClient
    mockDriveClient = {
      uploadFile: jest.fn(),
      updateFile: jest.fn(),
      getFileMetadata: jest.fn(),
    } as any;

    // Create mock IndexManager
    mockIndexManager = {
      readIndex: jest.fn(),
      writeIndex: jest.fn(),
      addMaterial: jest.fn(),
      updateMaterial: jest.fn(),
      queryMaterials: jest.fn(),
      incrementUsage: jest.fn(),
    } as any;

    // Create mock index
    mockIndex = {
      materials: [],
      templates: [],
      last_updated: new Date().toISOString(),
      version: '1.0.0',
    };
  });

  describe('updateIndex', () => {
    it('should add a new material', async () => {
      const newMaterial: MaterialEntry = {
        id: 'mat-123',
        name: 'Patient Discharge Instructions',
        type: 'discharge-instructions',
        format: 'doc',
        status: 'active',
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        usage_count: 0,
      };

      mockIndexManager.readIndex.mockResolvedValue(mockIndex);
      mockIndexManager.addMaterial.mockResolvedValue(newMaterial);
      mockIndexManager.writeIndex.mockResolvedValue('file-id-123');

      const result = await updateIndex(
        {
          action: 'add',
          data: {
            name: 'Patient Discharge Instructions',
            type: 'discharge-instructions',
            format: 'doc',
          },
          driveFolderId: 'folder-123',
        },
        mockDriveClient,
        mockIndexManager
      );

      expect(result.success).toBe(true);
      expect(result.entry).toBeDefined();
      expect(result.entry?.name).toBe('Patient Discharge Instructions');
      expect(mockIndexManager.addMaterial).toHaveBeenCalled();
      expect(mockIndexManager.writeIndex).toHaveBeenCalledWith(mockIndex, 'folder-123');
    });

    it('should update an existing material', async () => {
      const existingMaterial: MaterialEntry = {
        id: 'mat-123',
        name: 'Patient Discharge Instructions',
        type: 'discharge-instructions',
        format: 'doc',
        status: 'active',
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        usage_count: 0,
      };

      const updatedMaterial: MaterialEntry = {
        ...existingMaterial,
        pdfFileId: 'pdf-456',
      };

      mockIndexManager.readIndex.mockResolvedValue(mockIndex);
      mockIndexManager.updateMaterial.mockResolvedValue(updatedMaterial);
      mockIndexManager.writeIndex.mockResolvedValue('file-id-123');

      const result = await updateIndex(
        {
          action: 'update',
          materialId: 'mat-123',
          data: {
            pdfFileId: 'pdf-456',
          },
        },
        mockDriveClient,
        mockIndexManager
      );

      expect(result.success).toBe(true);
      expect(result.entry?.pdfFileId).toBe('pdf-456');
      expect(mockIndexManager.updateMaterial).toHaveBeenCalledWith(mockIndex, 'mat-123', {
        pdfFileId: 'pdf-456',
      });
    });

    it('should archive a material on remove', async () => {
      const material: MaterialEntry = {
        id: 'mat-123',
        name: 'Old Material',
        type: 'other',
        format: 'doc',
        status: 'archived',
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        usage_count: 0,
      };

      mockIndexManager.readIndex.mockResolvedValue(mockIndex);
      mockIndexManager.updateMaterial.mockResolvedValue(material);
      mockIndexManager.writeIndex.mockResolvedValue('file-id-123');

      const result = await updateIndex(
        {
          action: 'remove',
          materialId: 'mat-123',
        },
        mockDriveClient,
        mockIndexManager
      );

      expect(result.success).toBe(true);
      expect(result.entry?.status).toBe('archived');
      expect(mockIndexManager.updateMaterial).toHaveBeenCalledWith(mockIndex, 'mat-123', {
        status: 'archived',
      });
    });

    it('should return error when material not found', async () => {
      mockIndexManager.readIndex.mockResolvedValue(mockIndex);
      mockIndexManager.updateMaterial.mockResolvedValue(null);

      const result = await updateIndex(
        {
          action: 'update',
          materialId: 'nonexistent',
          data: { name: 'Updated Name' },
        },
        mockDriveClient,
        mockIndexManager
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('not found');
    });

    it('should validate required fields for add action', async () => {
      const result = await updateIndex(
        {
          action: 'add',
          data: {
            name: 'Incomplete Material',
            // Missing type and format
          },
        },
        mockDriveClient,
        mockIndexManager
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('required fields');
    });
  });

  describe('queryIndex', () => {
    beforeEach(() => {
      mockIndex.materials = [
        {
          id: 'mat-1',
          name: 'Discharge Instructions A',
          type: 'discharge-instructions',
          format: 'doc',
          status: 'active',
          tags: ['cardiology', 'post-op'],
          created: '2025-01-01T00:00:00Z',
          updated: '2025-01-15T00:00:00Z',
          usage_count: 5,
        },
        {
          id: 'mat-2',
          name: 'Patient Education B',
          type: 'patient-education',
          format: 'slides',
          status: 'active',
          tags: ['diabetes', 'nutrition'],
          created: '2025-01-10T00:00:00Z',
          updated: '2025-01-20T00:00:00Z',
          usage_count: 10,
        },
        {
          id: 'mat-3',
          name: 'Clinical Handout C',
          type: 'clinical-handout',
          format: 'pdf',
          status: 'archived',
          tags: ['cardiology'],
          created: '2024-12-01T00:00:00Z',
          updated: '2024-12-15T00:00:00Z',
          usage_count: 2,
        },
      ];
    });

    it('should query all materials without filters', async () => {
      mockIndexManager.readIndex.mockResolvedValue(mockIndex);
      mockIndexManager.queryMaterials.mockResolvedValue(mockIndex.materials);

      const result = await queryIndex(
        {},
        mockDriveClient,
        mockIndexManager
      );

      expect(result.success).toBe(true);
      expect(result.count).toBe(3);
      expect(result.materials).toHaveLength(3);
    });

    it('should filter by type', async () => {
      const filtered = mockIndex.materials.filter((m) => m.type === 'discharge-instructions');
      mockIndexManager.readIndex.mockResolvedValue(mockIndex);
      mockIndexManager.queryMaterials.mockResolvedValue(filtered);

      const result = await queryIndex(
        {
          filters: {
            type: 'discharge-instructions',
          },
        },
        mockDriveClient,
        mockIndexManager
      );

      expect(result.success).toBe(true);
      expect(result.count).toBe(1);
      expect(result.materials?.[0].type).toBe('discharge-instructions');
    });

    it('should filter by tags', async () => {
      const filtered = mockIndex.materials.filter((m) => m.tags?.includes('cardiology'));
      mockIndexManager.readIndex.mockResolvedValue(mockIndex);
      mockIndexManager.queryMaterials.mockResolvedValue(filtered);

      const result = await queryIndex(
        {
          filters: {
            tags: ['cardiology'],
          },
        },
        mockDriveClient,
        mockIndexManager
      );

      expect(result.success).toBe(true);
      expect(result.count).toBe(2);
    });

    it('should filter by date range', async () => {
      mockIndexManager.readIndex.mockResolvedValue(mockIndex);
      mockIndexManager.queryMaterials.mockResolvedValue(mockIndex.materials);

      const result = await queryIndex(
        {
          filters: {
            dateRange: {
              start: '2025-01-01T00:00:00Z',
              end: '2025-01-31T23:59:59Z',
            },
          },
        },
        mockDriveClient,
        mockIndexManager
      );

      expect(result.success).toBe(true);
      expect(result.count).toBe(2); // Only materials from January 2025
    });

    it('should sort by usage_count', async () => {
      mockIndexManager.readIndex.mockResolvedValue(mockIndex);
      mockIndexManager.queryMaterials.mockResolvedValue(mockIndex.materials);

      const result = await queryIndex(
        {
          sortBy: 'usage_count',
        },
        mockDriveClient,
        mockIndexManager
      );

      expect(result.success).toBe(true);
      expect(result.materials?.[0].usage_count).toBe(10); // Highest first
    });

    it('should limit results', async () => {
      mockIndexManager.readIndex.mockResolvedValue(mockIndex);
      mockIndexManager.queryMaterials.mockResolvedValue(mockIndex.materials);

      const result = await queryIndex(
        {
          limit: 2,
        },
        mockDriveClient,
        mockIndexManager
      );

      expect(result.success).toBe(true);
      expect(result.materials).toHaveLength(2);
    });
  });

  describe('findByDriveFileId', () => {
    it('should find material by Drive file ID', async () => {
      const mockIndex: MaterialIndex = {
        materials: [
          {
            id: 'mat-1',
            name: 'Test Material',
            type: 'other',
            format: 'doc',
            driveFileId: 'drive-123',
            status: 'active',
            created: new Date().toISOString(),
            updated: new Date().toISOString(),
            usage_count: 0,
          },
        ],
        templates: [],
        last_updated: new Date().toISOString(),
        version: '1.0.0',
      };

      const result = await findByDriveFileId(mockIndex, 'drive-123');

      expect(result).toBeDefined();
      expect(result?.id).toBe('mat-1');
      expect(result?.driveFileId).toBe('drive-123');
    });

    it('should return null if not found', async () => {
      const result = await findByDriveFileId(mockIndex, 'nonexistent');

      expect(result).toBeNull();
    });
  });
});

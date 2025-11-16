/**
 * PDF Export Tool Tests
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { exportToPdf, batchExportToPdf } from './pdf-export.js';
import { DriveClient } from '../lib/drive-client.js';
import { IndexManager, MaterialIndex } from '../lib/index-manager.js';
import { drive_v3 } from 'googleapis';

// Mock DriveClient
jest.mock('../lib/drive-client.js');

// Mock fs
jest.mock('fs', () => ({
  promises: {
    mkdir: jest.fn(),
    writeFile: jest.fn(),
    unlink: jest.fn(),
  },
}));

describe('PDF Export Tool', () => {
  let mockDriveClient: jest.Mocked<DriveClient>;
  let mockIndexManager: jest.Mocked<IndexManager>;
  let mockIndex: MaterialIndex;

  beforeEach(() => {
    // Create mock DriveClient
    mockDriveClient = {
      getFileMetadata: jest.fn(),
      exportToPdf: jest.fn(),
      uploadFile: jest.fn(),
      createFolder: jest.fn(),
    } as any;

    // Create mock IndexManager
    mockIndexManager = {
      readIndex: jest.fn(),
      writeIndex: jest.fn(),
      updateMaterial: jest.fn(),
      incrementUsage: jest.fn(),
    } as any;

    // Create mock index
    mockIndex = {
      materials: [
        {
          id: 'mat-1',
          name: 'Patient Education Doc',
          type: 'patient-education',
          format: 'doc',
          driveFileId: 'doc-123',
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
  });

  describe('exportToPdf', () => {
    it('should export Google Doc to PDF', async () => {
      const mockMetadata: drive_v3.Schema$File = {
        id: 'doc-123',
        name: 'Patient Education Doc',
        mimeType: 'application/vnd.google-apps.document',
      };

      const pdfBuffer = Buffer.from('PDF content');

      mockDriveClient.getFileMetadata.mockResolvedValue(mockMetadata);
      mockDriveClient.exportToPdf.mockResolvedValue(pdfBuffer);
      mockDriveClient.createFolder.mockResolvedValueOnce('generated-folder-id');
      mockDriveClient.createFolder.mockResolvedValueOnce('date-folder-id');
      mockDriveClient.uploadFile.mockResolvedValue({
        fileId: 'pdf-456',
        url: 'https://drive.google.com/file/d/pdf-456/view',
      });

      const result = await exportToPdf(
        {
          sourceId: 'doc-123',
          filename: 'patient-education.pdf',
        },
        mockDriveClient,
        mockIndexManager
      );

      expect(result.success).toBe(true);
      expect(result.pdfFileId).toBe('pdf-456');
      expect(result.pdfUrl).toBe('https://drive.google.com/file/d/pdf-456/view');
      expect(mockDriveClient.exportToPdf).toHaveBeenCalledWith('doc-123');
      expect(mockDriveClient.uploadFile).toHaveBeenCalled();
    });

    it('should export Google Slides to PDF', async () => {
      const mockMetadata: drive_v3.Schema$File = {
        id: 'slides-123',
        name: 'Patient Presentation',
        mimeType: 'application/vnd.google-apps.presentation',
      };

      const pdfBuffer = Buffer.from('PDF content');

      mockDriveClient.getFileMetadata.mockResolvedValue(mockMetadata);
      mockDriveClient.exportToPdf.mockResolvedValue(pdfBuffer);
      mockDriveClient.createFolder.mockResolvedValueOnce('generated-folder-id');
      mockDriveClient.createFolder.mockResolvedValueOnce('date-folder-id');
      mockDriveClient.uploadFile.mockResolvedValue({
        fileId: 'pdf-789',
        url: 'https://drive.google.com/file/d/pdf-789/view',
      });

      const result = await exportToPdf(
        {
          sourceId: 'slides-123',
          filename: 'presentation.pdf',
        },
        mockDriveClient,
        mockIndexManager
      );

      expect(result.success).toBe(true);
      expect(result.pdfFileId).toBe('pdf-789');
    });

    it('should use custom output folder if provided', async () => {
      const mockMetadata: drive_v3.Schema$File = {
        id: 'doc-123',
        name: 'Test Doc',
        mimeType: 'application/vnd.google-apps.document',
      };

      const pdfBuffer = Buffer.from('PDF content');

      mockDriveClient.getFileMetadata.mockResolvedValue(mockMetadata);
      mockDriveClient.exportToPdf.mockResolvedValue(pdfBuffer);
      mockDriveClient.uploadFile.mockResolvedValue({
        fileId: 'pdf-custom',
        url: 'https://drive.google.com/file/d/pdf-custom/view',
      });

      const result = await exportToPdf(
        {
          sourceId: 'doc-123',
          filename: 'test.pdf',
          outputFolderId: 'custom-folder-123',
        },
        mockDriveClient,
        mockIndexManager
      );

      expect(result.success).toBe(true);
      expect(mockDriveClient.createFolder).not.toHaveBeenCalled();
      expect(mockDriveClient.uploadFile).toHaveBeenCalledWith(
        expect.any(String),
        'test.pdf',
        'custom-folder-123'
      );
    });

    it('should update index when requested', async () => {
      const mockMetadata: drive_v3.Schema$File = {
        id: 'doc-123',
        name: 'Patient Education Doc',
        mimeType: 'application/vnd.google-apps.document',
      };

      const pdfBuffer = Buffer.from('PDF content');

      mockDriveClient.getFileMetadata.mockResolvedValue(mockMetadata);
      mockDriveClient.exportToPdf.mockResolvedValue(pdfBuffer);
      mockDriveClient.createFolder.mockResolvedValueOnce('generated-folder-id');
      mockDriveClient.createFolder.mockResolvedValueOnce('date-folder-id');
      mockDriveClient.uploadFile.mockResolvedValue({
        fileId: 'pdf-456',
        url: 'https://drive.google.com/file/d/pdf-456/view',
      });

      mockIndexManager.readIndex.mockResolvedValue(mockIndex);
      mockIndexManager.updateMaterial.mockResolvedValue({
        ...mockIndex.materials[0],
        pdfFileId: 'pdf-456',
      });
      mockIndexManager.writeIndex.mockResolvedValue('index-file-id');

      const result = await exportToPdf(
        {
          sourceId: 'doc-123',
          filename: 'patient-education.pdf',
          updateIndex: true,
          indexFileId: 'index-file-id',
        },
        mockDriveClient,
        mockIndexManager
      );

      expect(result.success).toBe(true);
      expect(mockIndexManager.readIndex).toHaveBeenCalled();
      expect(mockIndexManager.updateMaterial).toHaveBeenCalledWith(
        mockIndex,
        'mat-1',
        { pdfFileId: 'pdf-456' }
      );
      expect(mockIndexManager.incrementUsage).toHaveBeenCalledWith(mockIndex, 'mat-1');
      expect(mockIndexManager.writeIndex).toHaveBeenCalled();
    });

    it('should reject invalid source file types', async () => {
      const mockMetadata: drive_v3.Schema$File = {
        id: 'spreadsheet-123',
        name: 'Spreadsheet',
        mimeType: 'application/vnd.google-apps.spreadsheet',
      };

      mockDriveClient.getFileMetadata.mockResolvedValue(mockMetadata);

      const result = await exportToPdf(
        {
          sourceId: 'spreadsheet-123',
          filename: 'test.pdf',
        },
        mockDriveClient,
        mockIndexManager
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid source file type');
    });

    it('should add .pdf extension if not provided', async () => {
      const mockMetadata: drive_v3.Schema$File = {
        id: 'doc-123',
        name: 'Test Doc',
        mimeType: 'application/vnd.google-apps.document',
      };

      const pdfBuffer = Buffer.from('PDF content');

      mockDriveClient.getFileMetadata.mockResolvedValue(mockMetadata);
      mockDriveClient.exportToPdf.mockResolvedValue(pdfBuffer);
      mockDriveClient.createFolder.mockResolvedValueOnce('generated-folder-id');
      mockDriveClient.createFolder.mockResolvedValueOnce('date-folder-id');
      mockDriveClient.uploadFile.mockResolvedValue({
        fileId: 'pdf-123',
        url: 'https://drive.google.com/file/d/pdf-123/view',
      });

      await exportToPdf(
        {
          sourceId: 'doc-123',
          filename: 'test', // No .pdf extension
        },
        mockDriveClient,
        mockIndexManager
      );

      expect(mockDriveClient.uploadFile).toHaveBeenCalledWith(
        expect.any(String),
        'test.pdf', // Should have .pdf added
        expect.any(String)
      );
    });
  });

  describe('batchExportToPdf', () => {
    it('should export multiple files successfully', async () => {
      const mockMetadata1: drive_v3.Schema$File = {
        id: 'doc-1',
        name: 'Doc 1',
        mimeType: 'application/vnd.google-apps.document',
      };

      const mockMetadata2: drive_v3.Schema$File = {
        id: 'doc-2',
        name: 'Doc 2',
        mimeType: 'application/vnd.google-apps.document',
      };

      const pdfBuffer = Buffer.from('PDF content');

      mockDriveClient.getFileMetadata
        .mockResolvedValueOnce(mockMetadata1)
        .mockResolvedValueOnce(mockMetadata2);

      mockDriveClient.exportToPdf.mockResolvedValue(pdfBuffer);
      mockDriveClient.uploadFile
        .mockResolvedValueOnce({
          fileId: 'pdf-1',
          url: 'https://drive.google.com/file/d/pdf-1/view',
        })
        .mockResolvedValueOnce({
          fileId: 'pdf-2',
          url: 'https://drive.google.com/file/d/pdf-2/view',
        });

      const result = await batchExportToPdf(
        ['doc-1', 'doc-2'],
        'output-folder-123',
        mockDriveClient,
        mockIndexManager,
        false
      );

      expect(result.success).toBe(true);
      expect(result.results).toHaveLength(2);
      expect(result.results[0].pdfFileId).toBe('pdf-1');
      expect(result.results[1].pdfFileId).toBe('pdf-2');
      expect(result.message).toContain('2 succeeded, 0 failed');
    });

    it('should handle partial failures', async () => {
      const mockMetadata: drive_v3.Schema$File = {
        id: 'doc-1',
        name: 'Doc 1',
        mimeType: 'application/vnd.google-apps.document',
      };

      const pdfBuffer = Buffer.from('PDF content');

      mockDriveClient.getFileMetadata
        .mockResolvedValueOnce(mockMetadata)
        .mockRejectedValueOnce(new Error('File not found'));

      mockDriveClient.exportToPdf.mockResolvedValue(pdfBuffer);
      mockDriveClient.uploadFile.mockResolvedValue({
        fileId: 'pdf-1',
        url: 'https://drive.google.com/file/d/pdf-1/view',
      });

      const result = await batchExportToPdf(
        ['doc-1', 'doc-invalid'],
        'output-folder-123',
        mockDriveClient,
        mockIndexManager,
        false
      );

      expect(result.success).toBe(false);
      expect(result.results).toHaveLength(2);
      expect(result.results[0].pdfFileId).toBe('pdf-1');
      expect(result.results[1].error).toContain('File not found');
      expect(result.message).toContain('1 succeeded, 1 failed');
    });
  });
});

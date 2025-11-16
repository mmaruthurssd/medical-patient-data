/**
 * PDF Export Tool
 *
 * MCP tool for exporting Google Docs/Slides to PDF in Drive.
 */

import { DriveClient } from '../lib/drive-client.js';
import { IndexManager } from '../lib/index-manager.js';
import { findByDriveFileId } from './index-management.js';
import { promises as fs } from 'fs';
import { join } from 'path';

export interface ExportToPdfArgs {
  sourceId: string;
  outputFolderId?: string;
  filename: string;
  updateIndex?: boolean;
  indexFileId?: string;
  localOutputPath?: string;
}

/**
 * Export to PDF tool handler
 */
export async function exportToPdf(
  args: ExportToPdfArgs,
  driveClient: DriveClient,
  indexManager: IndexManager
): Promise<{
  success: boolean;
  pdfFileId?: string;
  pdfUrl?: string;
  localPath?: string;
  message: string;
  indexFileId?: string;
}> {
  try {
    // Get source file metadata
    const sourceMetadata = await driveClient.getFileMetadata(args.sourceId);

    // Validate source file type
    const validMimeTypes = [
      'application/vnd.google-apps.document',
      'application/vnd.google-apps.presentation',
    ];

    if (!sourceMetadata.mimeType || !validMimeTypes.includes(sourceMetadata.mimeType)) {
      return {
        success: false,
        message: `Invalid source file type: ${sourceMetadata.mimeType}. Must be Google Doc or Slides.`,
      };
    }

    // Determine output folder
    let outputFolderId = args.outputFolderId;

    if (!outputFolderId) {
      // Create Generated/YYYY-MM-DD/ folder structure
      const today = new Date();
      const dateFolder = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

      // Create or get "Generated" folder
      const generatedFolderId = await driveClient.createFolder('Generated');

      // Create or get date-specific folder
      outputFolderId = await driveClient.createFolder(dateFolder, generatedFolderId);
    }

    // Export to PDF buffer
    const pdfBuffer = await driveClient.exportToPdf(args.sourceId);

    // Save PDF locally if local path provided
    let localPath: string | undefined;
    if (args.localOutputPath) {
      const pdfFilename = args.filename.endsWith('.pdf') ? args.filename : `${args.filename}.pdf`;
      localPath = join(args.localOutputPath, pdfFilename);

      await fs.mkdir(args.localOutputPath, { recursive: true });
      await fs.writeFile(localPath, pdfBuffer);
    }

    // Create temporary file for upload
    const tempPath = join(process.cwd(), '.cache', 'temp-pdf-upload.pdf');
    await fs.mkdir(join(process.cwd(), '.cache'), { recursive: true });
    await fs.writeFile(tempPath, pdfBuffer);

    // Upload PDF to Drive
    const uploadResult = await driveClient.uploadFile(
      tempPath,
      args.filename.endsWith('.pdf') ? args.filename : `${args.filename}.pdf`,
      outputFolderId
    );

    // Clean up temp file
    await fs.unlink(tempPath);

    let indexFileId = args.indexFileId;

    // Update index if requested
    if (args.updateIndex) {
      const index = await indexManager.readIndex(args.indexFileId);

      // Find material by source Drive file ID
      const material = await findByDriveFileId(index, args.sourceId);

      if (material) {
        // Update material with PDF file ID
        await indexManager.updateMaterial(index, material.id, {
          pdfFileId: uploadResult.fileId,
        });

        // Increment usage count
        await indexManager.incrementUsage(index, material.id);

        // Sync index to Drive
        indexFileId = await indexManager.writeIndex(index, outputFolderId);
      }
    }

    return {
      success: true,
      pdfFileId: uploadResult.fileId,
      pdfUrl: uploadResult.url,
      localPath,
      message: `Successfully exported ${sourceMetadata.name} to PDF`,
      indexFileId,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `Failed to export to PDF: ${errorMessage}`,
    };
  }
}

/**
 * Helper: Export multiple files to PDF in batch
 */
export async function batchExportToPdf(
  sourceIds: string[],
  outputFolderId: string,
  driveClient: DriveClient,
  indexManager: IndexManager,
  updateIndex: boolean = true,
  indexFileId?: string
): Promise<{
  success: boolean;
  results: Array<{
    sourceId: string;
    pdfFileId?: string;
    pdfUrl?: string;
    error?: string;
  }>;
  message: string;
}> {
  const results: Array<{
    sourceId: string;
    pdfFileId?: string;
    pdfUrl?: string;
    error?: string;
  }> = [];

  let successCount = 0;
  let failCount = 0;

  for (const sourceId of sourceIds) {
    try {
      const metadata = await driveClient.getFileMetadata(sourceId);
      const filename = metadata.name || `export-${sourceId}`;

      const result = await exportToPdf(
        {
          sourceId,
          outputFolderId,
          filename,
          updateIndex,
          indexFileId,
        },
        driveClient,
        indexManager
      );

      if (result.success) {
        results.push({
          sourceId,
          pdfFileId: result.pdfFileId,
          pdfUrl: result.pdfUrl,
        });
        successCount++;
      } else {
        results.push({
          sourceId,
          error: result.message,
        });
        failCount++;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      results.push({
        sourceId,
        error: errorMessage,
      });
      failCount++;
    }
  }

  return {
    success: failCount === 0,
    results,
    message: `Batch export complete: ${successCount} succeeded, ${failCount} failed`,
  };
}

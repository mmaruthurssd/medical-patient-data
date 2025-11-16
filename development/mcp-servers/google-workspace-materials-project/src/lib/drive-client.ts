/**
 * Google Drive API Client Wrapper
 *
 * Handles authentication and common Drive operations.
 */

import { google, drive_v3 } from 'googleapis';
import { createReadStream, createWriteStream, promises as fs } from 'fs';
import { dirname } from 'path';

export class DriveClient {
  private drive: drive_v3.Drive;
  public auth: any; // Make auth public so DocsClient and SlidesClient can use it

  constructor() {
    // Initialize Google API client
    const credentialsPath = process.env.GOOGLE_CREDENTIALS_PATH;
    if (!credentialsPath) {
      throw new Error('GOOGLE_CREDENTIALS_PATH environment variable not set');
    }

    // Create JWT auth client from service account
    this.auth = new google.auth.GoogleAuth({
      keyFile: credentialsPath,
      scopes: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/documents',
        'https://www.googleapis.com/auth/presentations',
      ],
    });

    // Initialize Drive API client
    this.drive = google.drive({ version: 'v3', auth: this.auth });
  }

  /**
   * List files in a folder
   */
  async listFiles(folderId?: string, query?: string): Promise<drive_v3.Schema$File[]> {
    const files: drive_v3.Schema$File[] = [];
    let pageToken: string | undefined;

    // Build query with folder filter
    let q = query || '';
    if (folderId) {
      q = q ? `${q} and '${folderId}' in parents` : `'${folderId}' in parents`;
    }
    if (!q.includes('trashed')) {
      q = q ? `${q} and trashed = false` : 'trashed = false';
    }

    do {
      const response = await this.drive.files.list({
        q,
        pageSize: 100,
        pageToken,
        fields: 'nextPageToken, files(id, name, mimeType, modifiedTime, createdTime, size, webViewLink, parents)',
      });

      if (response.data.files) {
        files.push(...response.data.files);
      }
      pageToken = response.data.nextPageToken || undefined;
    } while (pageToken);

    return files;
  }

  /**
   * Download file content
   */
  async downloadFile(fileId: string, outputPath: string): Promise<void> {
    // Get file metadata to check MIME type
    const metadata = await this.drive.files.get({
      fileId,
      fields: 'mimeType, name',
    });

    const mimeType = metadata.data.mimeType;

    // Ensure output directory exists
    await fs.mkdir(dirname(outputPath), { recursive: true });

    // Handle Google Workspace files (need export)
    if (mimeType?.startsWith('application/vnd.google-apps')) {
      let exportMimeType: string;

      if (mimeType === 'application/vnd.google-apps.document') {
        exportMimeType = 'text/markdown'; // Export Docs as markdown
      } else if (mimeType === 'application/vnd.google-apps.presentation') {
        exportMimeType = 'text/plain'; // Export Slides as plain text (will need custom handling)
      } else {
        exportMimeType = 'application/pdf'; // Default to PDF
      }

      const response = await this.drive.files.export(
        { fileId, mimeType: exportMimeType },
        { responseType: 'stream' }
      );

      const dest = createWriteStream(outputPath);
      await new Promise((resolve, reject) => {
        response.data
          .on('end', resolve)
          .on('error', reject)
          .pipe(dest);
      });
    } else {
      // Regular file download
      const response = await this.drive.files.get(
        { fileId, alt: 'media' },
        { responseType: 'stream' }
      );

      const dest = createWriteStream(outputPath);
      await new Promise((resolve, reject) => {
        response.data
          .on('end', resolve)
          .on('error', reject)
          .pipe(dest);
      });
    }
  }

  /**
   * Upload file to Drive
   */
  async uploadFile(
    filePath: string,
    name: string,
    folderId?: string,
    metadata?: Record<string, any>
  ): Promise<{ fileId: string; url: string }> {
    // Read file from local path
    const fileStream = createReadStream(filePath);

    // Determine MIME type based on extension
    const ext = filePath.split('.').pop()?.toLowerCase();
    let mimeType = 'application/octet-stream';

    if (ext === 'md' || ext === 'markdown') {
      mimeType = 'text/markdown';
    } else if (ext === 'pdf') {
      mimeType = 'application/pdf';
    } else if (ext === 'json') {
      mimeType = 'application/json';
    }

    // Create file metadata
    const fileMetadata: drive_v3.Schema$File = {
      name,
      ...(folderId && { parents: [folderId] }),
      ...(metadata && { properties: metadata }),
    };

    // Upload file
    const response = await this.drive.files.create({
      requestBody: fileMetadata,
      media: {
        mimeType,
        body: fileStream,
      },
      fields: 'id, webViewLink',
    });

    return {
      fileId: response.data.id!,
      url: response.data.webViewLink!,
    };
  }

  /**
   * Update existing file content
   */
  async updateFile(
    fileId: string,
    filePath: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const fileStream = createReadStream(filePath);

    const ext = filePath.split('.').pop()?.toLowerCase();
    let mimeType = 'application/octet-stream';

    if (ext === 'md' || ext === 'markdown') {
      mimeType = 'text/markdown';
    } else if (ext === 'pdf') {
      mimeType = 'application/pdf';
    } else if (ext === 'json') {
      mimeType = 'application/json';
    }

    await this.drive.files.update({
      fileId,
      requestBody: metadata && { properties: metadata },
      media: {
        mimeType,
        body: fileStream,
      },
    });
  }

  /**
   * Create folder in Drive
   */
  async createFolder(name: string, parentFolderId?: string): Promise<string> {
    // Check if folder already exists
    const query = `name = '${name}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false${
      parentFolderId ? ` and '${parentFolderId}' in parents` : ''
    }`;

    const existing = await this.listFiles(undefined, query);

    if (existing.length > 0) {
      return existing[0].id!;
    }

    // Create folder
    const fileMetadata: drive_v3.Schema$File = {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      ...(parentFolderId && { parents: [parentFolderId] }),
    };

    const response = await this.drive.files.create({
      requestBody: fileMetadata,
      fields: 'id',
    });

    return response.data.id!;
  }

  /**
   * Export Google Doc/Slides to PDF
   */
  async exportToPdf(fileId: string): Promise<Buffer> {
    const response = await this.drive.files.export(
      { fileId, mimeType: 'application/pdf' },
      { responseType: 'arraybuffer' }
    );

    return Buffer.from(response.data as ArrayBuffer);
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(fileId: string): Promise<drive_v3.Schema$File> {
    const response = await this.drive.files.get({
      fileId,
      fields: 'id, name, mimeType, modifiedTime, createdTime, size, webViewLink, parents',
    });

    return response.data;
  }

  /**
   * Search files by query
   */
  async searchFiles(searchQuery: string): Promise<drive_v3.Schema$File[]> {
    return this.listFiles(undefined, `fullText contains '${searchQuery}' and trashed = false`);
  }
}

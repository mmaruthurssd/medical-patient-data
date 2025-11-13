const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

class DriveSync {
  constructor(auth) {
    this.drive = google.drive({ version: 'v3', auth });
  }

  /**
   * Find or create a folder in Google Drive
   */
  async findOrCreateFolder(folderName, parentFolderId = null) {
    try {
      // Search for existing folder
      const query = parentFolderId
        ? `name='${folderName}' and '${parentFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`
        : `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;

      const response = await this.drive.files.list({
        q: query,
        fields: 'files(id, name)',
        spaces: 'drive',
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
      });

      if (response.data.files.length > 0) {
        return response.data.files[0].id;
      }

      // Create new folder
      const fileMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
      };

      if (parentFolderId) {
        fileMetadata.parents = [parentFolderId];
      }

      const folder = await this.drive.files.create({
        resource: fileMetadata,
        fields: 'id',
        supportsAllDrives: true,
      });

      return folder.data.id;
    } catch (error) {
      throw new Error(`Failed to find/create folder: ${error.message}`);
    }
  }

  /**
   * Upload a file to Google Drive
   */
  async uploadFile(filePath, destinationFolderId, options = {}) {
    try {
      const fileName = options.fileName || path.basename(filePath);
      const fileContent = fs.readFileSync(filePath);

      const fileMetadata = {
        name: fileName,
        parents: [destinationFolderId],
      };

      const media = {
        mimeType: options.mimeType || 'application/json',
        body: fs.createReadStream(filePath),
      };

      const response = await this.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id, name, webViewLink',
        supportsAllDrives: true,
      });

      return {
        success: true,
        fileId: response.data.id,
        fileName: response.data.name,
        webViewLink: response.data.webViewLink,
      };
    } catch (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  /**
   * Upload or update a file (checks if it exists first)
   */
  async syncFile(filePath, destinationFolderId, options = {}) {
    try {
      const fileName = options.fileName || path.basename(filePath);

      // Check if file already exists
      const query = `name='${fileName}' and '${destinationFolderId}' in parents and trashed=false`;
      const response = await this.drive.files.list({
        q: query,
        fields: 'files(id, name)',
        spaces: 'drive',
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
      });

      if (response.data.files.length > 0) {
        // Update existing file
        const fileId = response.data.files[0].id;
        const media = {
          mimeType: options.mimeType || 'application/json',
          body: fs.createReadStream(filePath),
        };

        await this.drive.files.update({
          fileId: fileId,
          media: media,
          supportsAllDrives: true,
        });

        return {
          success: true,
          action: 'updated',
          fileId: fileId,
          fileName: fileName,
        };
      } else {
        // Upload new file
        const result = await this.uploadFile(filePath, destinationFolderId, options);
        return {
          ...result,
          action: 'created',
        };
      }
    } catch (error) {
      throw new Error(`Failed to sync file: ${error.message}`);
    }
  }

  /**
   * Download a file from Google Drive
   */
  async downloadFile(fileId, localPath) {
    try {
      const dest = fs.createWriteStream(localPath);
      const response = await this.drive.files.get(
        {
          fileId: fileId,
          alt: 'media',
          supportsAllDrives: true,
        },
        { responseType: 'stream' }
      );

      return new Promise((resolve, reject) => {
        response.data
          .on('end', () => {
            resolve({
              success: true,
              localPath: localPath,
            });
          })
          .on('error', err => {
            reject(new Error(`Download error: ${err.message}`));
          })
          .pipe(dest);
      });
    } catch (error) {
      throw new Error(`Failed to download file: ${error.message}`);
    }
  }

  /**
   * List files in a folder
   */
  async listFiles(folderId, options = {}) {
    try {
      const query = `'${folderId}' in parents and trashed=false`;
      const response = await this.drive.files.list({
        q: query,
        fields: 'files(id, name, mimeType, createdTime, modifiedTime, size)',
        orderBy: options.orderBy || 'modifiedTime desc',
        pageSize: options.pageSize || 100,
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
      });

      return {
        success: true,
        files: response.data.files,
        count: response.data.files.length,
      };
    } catch (error) {
      throw new Error(`Failed to list files: ${error.message}`);
    }
  }

  /**
   * Sync audit log to Google Drive
   * Creates HIPAA-Audit-Logs folder structure and syncs the audit log
   */
  async syncAuditLog(auditLogPath, sharedDriveId = null) {
    try {
      // Create folder structure: HIPAA-Audit-Logs/YYYY/MM/
      const now = new Date();
      const year = now.getFullYear().toString();
      const month = (now.getMonth() + 1).toString().padStart(2, '0');

      // Find or create HIPAA-Audit-Logs folder
      let rootFolderId;
      if (sharedDriveId) {
        // Search in specific Shared Drive
        const query = `name='HIPAA-Audit-Logs' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
        const response = await this.drive.files.list({
          q: query,
          fields: 'files(id, name, driveId)',
          corpora: 'drive',
          driveId: sharedDriveId,
          supportsAllDrives: true,
          includeItemsFromAllDrives: true,
        });

        const folder = response.data.files.find(f => f.driveId === sharedDriveId);
        if (folder) {
          rootFolderId = folder.id;
        } else {
          // Create in Shared Drive
          const fileMetadata = {
            name: 'HIPAA-Audit-Logs',
            mimeType: 'application/vnd.google-apps.folder',
            parents: [sharedDriveId],
          };

          const result = await this.drive.files.create({
            resource: fileMetadata,
            fields: 'id',
            supportsAllDrives: true,
          });
          rootFolderId = result.data.id;
        }
      } else {
        rootFolderId = await this.findOrCreateFolder('HIPAA-Audit-Logs');
      }

      // Create year folder
      const yearFolderId = await this.findOrCreateFolder(year, rootFolderId);

      // Create month folder
      const monthFolderId = await this.findOrCreateFolder(month, yearFolderId);

      // Generate timestamped filename
      const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const fileName = `gemini-audit-log-${timestamp}.json`;

      // Sync the file
      const result = await this.syncFile(auditLogPath, monthFolderId, {
        fileName: fileName,
        mimeType: 'application/json',
      });

      return {
        ...result,
        folderPath: `HIPAA-Audit-Logs/${year}/${month}/`,
        folderStructure: {
          root: rootFolderId,
          year: yearFolderId,
          month: monthFolderId,
        },
      };
    } catch (error) {
      throw new Error(`Failed to sync audit log: ${error.message}`);
    }
  }

  /**
   * Get Shared Drive ID by name
   */
  async getSharedDriveId(driveName) {
    try {
      const response = await this.drive.drives.list({
        pageSize: 100,
        fields: 'drives(id, name)',
      });

      const drive = response.data.drives.find(d => d.name === driveName);
      if (!drive) {
        throw new Error(`Shared Drive '${driveName}' not found`);
      }

      return drive.id;
    } catch (error) {
      throw new Error(`Failed to get Shared Drive ID: ${error.message}`);
    }
  }
}

module.exports = DriveSync;

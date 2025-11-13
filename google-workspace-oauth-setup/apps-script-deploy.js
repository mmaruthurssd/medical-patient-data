const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

class AppsScriptDeploy {
  constructor(auth) {
    this.script = google.script({ version: 'v1', auth });
    this.drive = google.drive({ version: 'v3', auth });
  }

  /**
   * Create a new Apps Script project
   */
  async createProject(title, parentFolderId = null) {
    try {
      const request = {
        title: title,
      };

      if (parentFolderId) {
        request.parentId = parentFolderId;
      }

      const response = await this.script.projects.create({
        requestBody: request,
      });

      return {
        success: true,
        scriptId: response.data.scriptId,
        title: response.data.title,
      };
    } catch (error) {
      throw new Error(`Failed to create project: ${error.message}`);
    }
  }

  /**
   * Get Apps Script project bound to a Google Sheet
   */
  async getBoundScript(spreadsheetId) {
    try {
      // List files to find the bound script
      const response = await this.drive.files.list({
        q: `mimeType='application/vnd.google-apps.script' and '${spreadsheetId}' in parents`,
        fields: 'files(id, name)',
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
      });

      if (response.data.files.length === 0) {
        return null;
      }

      return {
        scriptId: response.data.files[0].id,
        name: response.data.files[0].name,
      };
    } catch (error) {
      throw new Error(`Failed to get bound script: ${error.message}`);
    }
  }

  /**
   * Create a bound Apps Script for a Google Sheet
   */
  async createBoundScript(spreadsheetId, title) {
    try {
      // Check if script already exists
      const existing = await this.getBoundScript(spreadsheetId);
      if (existing) {
        return {
          success: true,
          scriptId: existing.scriptId,
          action: 'exists',
          message: 'Script already bound to this sheet',
        };
      }

      // Create new bound script
      const response = await this.script.projects.create({
        requestBody: {
          title: title,
          parentId: spreadsheetId,
        },
      });

      return {
        success: true,
        scriptId: response.data.scriptId,
        action: 'created',
      };
    } catch (error) {
      throw new Error(`Failed to create bound script: ${error.message}`);
    }
  }

  /**
   * Get current content of an Apps Script project
   */
  async getProjectContent(scriptId) {
    try {
      const response = await this.script.projects.getContent({
        scriptId: scriptId,
      });

      return {
        success: true,
        files: response.data.files,
        scriptId: response.data.scriptId,
      };
    } catch (error) {
      throw new Error(`Failed to get project content: ${error.message}`);
    }
  }

  /**
   * Update Apps Script project with new code
   */
  async updateProject(scriptId, files) {
    try {
      const response = await this.script.projects.updateContent({
        scriptId: scriptId,
        requestBody: {
          files: files,
        },
      });

      return {
        success: true,
        scriptId: response.data.scriptId,
        files: response.data.files,
      };
    } catch (error) {
      throw new Error(`Failed to update project: ${error.message}`);
    }
  }

  /**
   * Deploy code to a Google Sheet
   */
  async deployToSheet(spreadsheetId, codeFiles, options = {}) {
    try {
      const sheetTitle = options.sheetTitle || 'Unknown Sheet';
      const scriptTitle = options.scriptTitle || `${sheetTitle} - Automation`;

      // Step 1: Get or create bound script
      let scriptId;
      const existing = await this.getBoundScript(spreadsheetId);

      if (existing) {
        scriptId = existing.scriptId;
      } else {
        const created = await this.createBoundScript(spreadsheetId, scriptTitle);
        scriptId = created.scriptId;
      }

      // Step 2: Backup existing code (if requested)
      let backup = null;
      if (options.createBackup) {
        const currentContent = await this.getProjectContent(scriptId);
        backup = {
          scriptId: scriptId,
          files: currentContent.files,
          timestamp: new Date().toISOString(),
        };
      }

      // Step 3: Deploy new code
      await this.updateProject(scriptId, codeFiles);

      return {
        success: true,
        scriptId: scriptId,
        spreadsheetId: spreadsheetId,
        action: existing ? 'updated' : 'created',
        backup: backup,
      };
    } catch (error) {
      throw new Error(`Failed to deploy to sheet: ${error.message}`);
    }
  }

  /**
   * Rollback to previous version
   */
  async rollback(scriptId, backupFiles) {
    try {
      await this.updateProject(scriptId, backupFiles);

      return {
        success: true,
        scriptId: scriptId,
        action: 'rolled_back',
      };
    } catch (error) {
      throw new Error(`Failed to rollback: ${error.message}`);
    }
  }

  /**
   * Bulk deploy to multiple sheets
   */
  async bulkDeploy(deployments, options = {}) {
    const results = {
      total: deployments.length,
      successful: 0,
      failed: 0,
      deployments: [],
      errors: [],
    };

    const batchSize = options.batchSize || 5;
    const delayMs = options.delayMs || 1000;

    console.log(`Starting bulk deployment to ${deployments.length} sheets...`);
    console.log(`Batch size: ${batchSize}, Delay: ${delayMs}ms\n`);

    for (let i = 0; i < deployments.length; i += batchSize) {
      const batch = deployments.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(deployments.length / batchSize);

      console.log(`Processing batch ${batchNum}/${totalBatches}...`);

      // Process batch in parallel
      const batchPromises = batch.map(async (deployment) => {
        try {
          const result = await this.deployToSheet(
            deployment.spreadsheetId,
            deployment.codeFiles,
            {
              sheetTitle: deployment.sheetTitle,
              scriptTitle: deployment.scriptTitle,
              createBackup: options.createBackup || false,
            }
          );

          results.successful++;
          results.deployments.push({
            spreadsheetId: deployment.spreadsheetId,
            sheetTitle: deployment.sheetTitle,
            status: 'success',
            scriptId: result.scriptId,
            action: result.action,
          });

          return result;
        } catch (error) {
          results.failed++;
          results.errors.push({
            spreadsheetId: deployment.spreadsheetId,
            sheetTitle: deployment.sheetTitle,
            error: error.message,
          });

          return null;
        }
      });

      await Promise.all(batchPromises);

      // Progress report
      const progress = ((i + batch.length) / deployments.length * 100).toFixed(1);
      console.log(`Progress: ${progress}% (${results.successful} successful, ${results.failed} failed)\n`);

      // Delay between batches to avoid rate limits
      if (i + batchSize < deployments.length) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    return results;
  }

  /**
   * Test script execution
   */
  async runScript(scriptId, functionName, parameters = []) {
    try {
      const response = await this.script.scripts.run({
        scriptId: scriptId,
        requestBody: {
          function: functionName,
          parameters: parameters,
          devMode: false,
        },
      });

      if (response.data.error) {
        throw new Error(`Script error: ${JSON.stringify(response.data.error)}`);
      }

      return {
        success: true,
        result: response.data.response.result,
      };
    } catch (error) {
      throw new Error(`Failed to run script: ${error.message}`);
    }
  }

  /**
   * Test API availability by attempting to create a project
   */
  async testApiAvailability() {
    try {
      // Try to create and immediately delete a test project
      const testTitle = `API-Test-${Date.now()}`;
      const response = await this.script.projects.create({
        requestBody: {
          title: testTitle,
        },
      });

      // Delete the test project
      const scriptId = response.data.scriptId;
      await this.drive.files.delete({
        fileId: scriptId,
        supportsAllDrives: true,
      });

      return {
        success: true,
        available: true,
      };
    } catch (error) {
      if (error.message.includes('disabled') || error.message.includes('not enabled')) {
        return {
          success: false,
          available: false,
          reason: 'API not enabled',
        };
      }
      throw error;
    }
  }

  /**
   * Create standard code template for sheets automation
   */
  createStandardTemplate(customFunctions = {}) {
    const files = [
      {
        name: 'Code',
        type: 'SERVER_JS',
        source: `
/**
 * Standard Automation Functions
 * Generated by Google Workspace Automation Infrastructure
 */

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Automation')
    .addItem('Test Connection', 'testConnection')
    .addToUi();
}

function testConnection() {
  const ui = SpreadsheetApp.getUi();
  ui.alert('Success', 'Automation script is connected!', ui.ButtonSet.OK);
  return 'Connected';
}

function getSheetData(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    throw new Error('Sheet not found: ' + sheetName);
  }
  return sheet.getDataRange().getValues();
}

function writeSheetData(sheetName, data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  sheet.clear();
  sheet.getRange(1, 1, data.length, data[0].length).setValues(data);
  return 'Success';
}

${Object.entries(customFunctions).map(([name, code]) => code).join('\n\n')}
        `.trim(),
      },
      {
        name: 'appsscript',
        type: 'JSON',
        source: JSON.stringify({
          timeZone: 'America/Los_Angeles',
          dependencies: {},
          exceptionLogging: 'STACKDRIVER',
          runtimeVersion: 'V8',
        }, null, 2),
      },
    ];

    return files;
  }
}

module.exports = AppsScriptDeploy;

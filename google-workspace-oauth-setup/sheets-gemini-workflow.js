const { google } = require('googleapis');
const PatientInquiryClassifier = require('./gemini-classifier');
const PHIGuard = require('./phi-guard');
const DriveSync = require('./drive-sync');

class SheetsGeminiWorkflow {
  constructor(auth) {
    this.sheets = google.sheets({ version: 'v4', auth });
    this.classifier = new PatientInquiryClassifier();
    this.guard = new PHIGuard();
    this.driveSync = new DriveSync(auth);
  }

  /**
   * Read patient inquiries from a Google Sheet
   */
  async readInquiries(spreadsheetId, sheetName = 'Patient Inquiries', options = {}) {
    try {
      const range = options.range || `${sheetName}!A:E`;

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: range,
      });

      const rows = response.data.values || [];

      if (rows.length === 0) {
        return {
          success: true,
          inquiries: [],
          count: 0,
        };
      }

      // Parse data (assuming header row)
      const headers = rows[0];
      const inquiries = [];

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const inquiry = {
          rowNumber: i + 1,
          timestamp: row[0] || '',
          inquiryText: row[1] || '',
          patientInfo: row[2] || '',
          status: row[3] || 'pending',
          classification: row[4] || '',
        };

        // Skip if already processed
        if (options.skipProcessed && inquiry.status === 'processed') {
          continue;
        }

        inquiries.push(inquiry);
      }

      return {
        success: true,
        inquiries: inquiries,
        count: inquiries.length,
        headers: headers,
      };
    } catch (error) {
      throw new Error(`Failed to read inquiries: ${error.message}`);
    }
  }

  /**
   * Process a single inquiry with PHI detection, de-identification, and classification
   */
  async processInquiry(inquiryText, metadata = {}) {
    try {
      // Step 1: Detect PHI
      const detection = this.guard.detectPHI(inquiryText);

      // Step 2: De-identify if PHI found
      let processedText = inquiryText;
      let deidentificationApplied = false;
      let removedIdentifiers = [];

      if (detection.hasPHI) {
        const deidentified = this.guard.deidentify(inquiryText);
        processedText = deidentified.deidentifiedText;
        deidentificationApplied = true;
        removedIdentifiers = deidentified.removedIdentifiers;
      }

      // Step 3: Classify with Gemini
      const classification = await this.classifier.classify(processedText, {
        originalHadPHI: detection.hasPHI,
        deidentificationApplied: deidentificationApplied,
        ...metadata,
      });

      return {
        success: true,
        originalText: inquiryText,
        processedText: processedText,
        hasPHI: detection.hasPHI,
        riskLevel: detection.riskLevel,
        identifiersRemoved: removedIdentifiers.length,
        classification: classification.classification,
        auditEntry: classification.auditEntry,
      };
    } catch (error) {
      throw new Error(`Failed to process inquiry: ${error.message}`);
    }
  }

  /**
   * Write classification results back to Google Sheet
   */
  async writeResults(spreadsheetId, results, options = {}) {
    try {
      const sheetName = options.sheetName || 'Patient Inquiries';
      const updates = [];

      for (const result of results) {
        const row = result.rowNumber;

        // Update status and classification columns
        updates.push({
          range: `${sheetName}!D${row}:E${row}`,
          values: [[
            'processed',
            `${result.classification.category} (${result.classification.confidence})`
          ]],
        });
      }

      // Batch update
      await this.sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: spreadsheetId,
        requestBody: {
          valueInputOption: 'USER_ENTERED',
          data: updates,
        },
      });

      return {
        success: true,
        updated: results.length,
      };
    } catch (error) {
      throw new Error(`Failed to write results: ${error.message}`);
    }
  }

  /**
   * Create results sheet with detailed output
   */
  async createResultsSheet(spreadsheetId, results, options = {}) {
    try {
      const sheetName = options.sheetName || 'Classification Results';
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const finalSheetName = options.timestamped ? `${sheetName}-${timestamp}` : sheetName;

      // Prepare data
      const headers = [
        'Row #',
        'Original Status',
        'Had PHI',
        'Risk Level',
        'Identifiers Removed',
        'Category',
        'Confidence',
        'Reason',
        'Suggested Action',
        'Processed At',
      ];

      const rows = results.map(result => [
        result.rowNumber,
        result.originalStatus || 'pending',
        result.hasPHI ? 'Yes' : 'No',
        result.riskLevel || 'none',
        result.identifiersRemoved || 0,
        result.classification.category,
        result.classification.confidence,
        result.classification.reason,
        result.classification.suggestedAction,
        new Date().toISOString(),
      ]);

      const data = [headers, ...rows];

      // Check if sheet exists
      const spreadsheet = await this.sheets.spreadsheets.get({
        spreadsheetId: spreadsheetId,
      });

      const existingSheet = spreadsheet.data.sheets.find(
        s => s.properties.title === finalSheetName
      );

      let sheetId;

      if (existingSheet) {
        // Clear existing sheet
        sheetId = existingSheet.properties.sheetId;
        await this.sheets.spreadsheets.values.clear({
          spreadsheetId: spreadsheetId,
          range: `${finalSheetName}!A:Z`,
        });
      } else {
        // Create new sheet
        const response = await this.sheets.spreadsheets.batchUpdate({
          spreadsheetId: spreadsheetId,
          requestBody: {
            requests: [{
              addSheet: {
                properties: {
                  title: finalSheetName,
                },
              },
            }],
          },
        });
        sheetId = response.data.replies[0].addSheet.properties.sheetId;
      }

      // Write data
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: spreadsheetId,
        range: `${finalSheetName}!A1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: data,
        },
      });

      // Format header row
      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: spreadsheetId,
        requestBody: {
          requests: [{
            repeatCell: {
              range: {
                sheetId: sheetId,
                startRowIndex: 0,
                endRowIndex: 1,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.2, green: 0.6, blue: 0.9 },
                  textFormat: {
                    foregroundColor: { red: 1, green: 1, blue: 1 },
                    bold: true,
                  },
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat)',
            },
          }],
        },
      });

      return {
        success: true,
        sheetName: finalSheetName,
        rowsWritten: data.length,
      };
    } catch (error) {
      throw new Error(`Failed to create results sheet: ${error.message}`);
    }
  }

  /**
   * Complete end-to-end workflow
   */
  async runCompleteWorkflow(spreadsheetId, options = {}) {
    try {
      const startTime = Date.now();
      const workflow = {
        steps: [],
        results: [],
        errors: [],
      };

      // Step 1: Read inquiries
      workflow.steps.push({ step: 1, action: 'Reading inquiries from sheet' });
      const readResult = await this.readInquiries(
        spreadsheetId,
        options.sourceSheet || 'Patient Inquiries',
        { skipProcessed: options.skipProcessed !== false }
      );

      workflow.steps.push({
        step: 1,
        status: 'complete',
        count: readResult.count,
      });

      if (readResult.count === 0) {
        return {
          success: true,
          message: 'No unprocessed inquiries found',
          workflow: workflow,
        };
      }

      // Step 2: Process each inquiry
      workflow.steps.push({ step: 2, action: 'Processing inquiries' });

      for (const inquiry of readResult.inquiries) {
        try {
          const result = await this.processInquiry(inquiry.inquiryText, {
            rowNumber: inquiry.rowNumber,
            originalTimestamp: inquiry.timestamp,
          });

          workflow.results.push({
            ...result,
            rowNumber: inquiry.rowNumber,
            originalStatus: inquiry.status,
          });
        } catch (error) {
          workflow.errors.push({
            rowNumber: inquiry.rowNumber,
            error: error.message,
          });
        }
      }

      workflow.steps.push({
        step: 2,
        status: 'complete',
        processed: workflow.results.length,
        failed: workflow.errors.length,
      });

      // Step 3: Write results back to source sheet
      if (options.updateSource !== false && workflow.results.length > 0) {
        workflow.steps.push({ step: 3, action: 'Updating source sheet' });
        await this.writeResults(spreadsheetId, workflow.results, {
          sheetName: options.sourceSheet || 'Patient Inquiries',
        });
        workflow.steps.push({ step: 3, status: 'complete' });
      }

      // Step 4: Create detailed results sheet
      if (options.createResultsSheet !== false && workflow.results.length > 0) {
        workflow.steps.push({ step: 4, action: 'Creating results sheet' });
        const resultsSheet = await this.createResultsSheet(
          spreadsheetId,
          workflow.results,
          { timestamped: options.timestampResults }
        );
        workflow.steps.push({
          step: 4,
          status: 'complete',
          sheetName: resultsSheet.sheetName,
        });
      }

      // Step 5: Sync audit log to Drive
      if (options.syncAuditLog !== false) {
        workflow.steps.push({ step: 5, action: 'Syncing audit log to Drive' });
        try {
          const driveId = await this.driveSync.getSharedDriveId('AI Development - No PHI');
          await this.driveSync.syncAuditLog('./gemini-audit-log.json', driveId);
          workflow.steps.push({ step: 5, status: 'complete' });
        } catch (error) {
          workflow.errors.push({
            step: 5,
            error: `Audit log sync failed: ${error.message}`,
          });
        }
      }

      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);

      return {
        success: true,
        duration: `${duration}s`,
        inquiriesRead: readResult.count,
        inquiriesProcessed: workflow.results.length,
        inquiriesFailed: workflow.errors.length,
        workflow: workflow,
        summary: {
          categories: this.summarizeCategories(workflow.results),
          phiDetected: workflow.results.filter(r => r.hasPHI).length,
          identifiersRemoved: workflow.results.reduce((sum, r) => sum + r.identifiersRemoved, 0),
        },
      };
    } catch (error) {
      throw new Error(`Workflow failed: ${error.message}`);
    }
  }

  /**
   * Summarize classification categories
   */
  summarizeCategories(results) {
    const summary = {
      routine: 0,
      urgent: 0,
      administrative: 0,
    };

    results.forEach(result => {
      const category = result.classification.category;
      if (summary.hasOwnProperty(category)) {
        summary[category]++;
      }
    });

    return summary;
  }
}

module.exports = SheetsGeminiWorkflow;

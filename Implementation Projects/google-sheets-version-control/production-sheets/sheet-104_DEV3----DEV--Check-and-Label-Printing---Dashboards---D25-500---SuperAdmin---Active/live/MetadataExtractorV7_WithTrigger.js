/**
 * Metadata Extractor V7 - Local Storage Version
 *
 * This version saves metadata to the Apps Script project as a JSON file
 * instead of returning it via HTTP. Designed to be pushed to each sheet's
 * bound script project, triggered remotely, and pulled via clasp.
 *
 * Workflow:
 * 1. Push this code to all sheet projects using clasp
 * 2. Trigger extraction via remote webapp call
 * 3. Metadata is saved as "metadata_v7.json" in the script project
 * 4. Pull the file using clasp
 *
 * Storage: Uses DriveApp to save JSON file to script project's folder
 *
 * Entry point: triggerExtraction() - can be called remotely
 */

/**
 * Main entry point - can be called remotely via webapp or manually
 */
function triggerExtraction() {
  try {
    console.log('=== Starting V7 Metadata Extraction (Local Storage) ===');

    const metadata = extractMetadataV7();

    // Save to script project as JSON file
    saveMetadataToProject(metadata);

    console.log('=== Extraction Complete - Metadata saved to project ===');

    return {
      success: true,
      message: 'Metadata extracted and saved successfully',
      timestamp: metadata.timestamp,
      sheetsProcessed: metadata.summary.totalSheets
    };

  } catch (error) {
    console.error('Extraction failed:', error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Save metadata to shared Drive folder
 */
function saveMetadataToProject(metadata) {
  try {
    // SHARED FOLDER ID - All metadata files go here
    const SHARED_FOLDER_ID = '1QYoR0ubEzTl-Y9RMhj0Ly2YU9vMSpRMO';

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const spreadsheetName = ss.getName();
    const spreadsheetId = ss.getId();

    // Extract project ID from sheet name (D25-XXX, S25-XXX, PRS25-XXX)
    const projectIdMatch = spreadsheetName.match(/([DPS](?:RS)?25-\d{3,4})/);
    const projectId = projectIdMatch ? projectIdMatch[0] : spreadsheetId.substring(0, 8);

    // Create filename with project ID for easy identification
    const fileName = `${projectId}_metadata_v7.json`;
    const jsonString = JSON.stringify(metadata, null, 2);

    // Get the shared folder
    const sharedFolder = DriveApp.getFolderById(SHARED_FOLDER_ID);

    // Check if metadata file already exists and delete it
    const existingFiles = sharedFolder.getFilesByName(fileName);
    while (existingFiles.hasNext()) {
      const file = existingFiles.next();
      file.setTrashed(true);
    }

    // Create new metadata file in shared folder
    const blob = Utilities.newBlob(jsonString, 'application/json', fileName);
    const newFile = sharedFolder.createFile(blob);
    newFile.setDescription('V7 Metadata for ' + spreadsheetName);

    console.log(`Metadata saved: ${fileName}`);
    console.log(`File ID: ${newFile.getId()}`);
    console.log(`Size: ${Math.round(jsonString.length / 1024)} KB`);
    console.log(`Location: Shared metadata folder`);

    return newFile.getId();

  } catch (error) {
    console.error('Failed to save metadata:', error.toString());
    throw error;
  }
}

/**
 * Extract all metadata (same as V7 but optimized for local execution)
 */
function extractMetadataV7() {
  const startTime = new Date();
  console.log('Starting Metadata Extraction V7...');

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    const metadata = {
      timestamp: new Date().toISOString(),
      version: '7.0-local-storage',
      spreadsheet: {
        name: ss.getName(),
        id: ss.getId(),
        url: ss.getUrl(),
        timezone: ss.getSpreadsheetTimeZone(),
        locale: ss.getSpreadsheetLocale()
      },
      sheets: extractSheetData(ss),
      appsScript: extractAppsScriptInfo(ss.getId()),
      namedRanges: extractNamedRanges(ss),
      triggers: extractTriggers(),
      summary: {}
    };

    // Add summary statistics
    metadata.summary = {
      totalSheets: metadata.sheets.length,
      sheetsWithRow2Headers: metadata.sheets.filter(s => s.row2HeaderCount > 0).length,
      sheetsWithValidations: metadata.sheets.filter(s => s.validations && s.validations.length > 0).length,
      sheetsWithFormulas: metadata.sheets.filter(s => s.formulas && s.formulas.importRanges && s.formulas.importRanges.length > 0).length,
      sheetsWithConditionalFormats: metadata.sheets.filter(s => s.conditionalFormats && s.conditionalFormats.length > 0).length,
      sheetsWithNotes: metadata.sheets.filter(s => s.notesCount && s.notesCount > 0).length,
      sheetsWithForms: metadata.sheets.filter(s => s.formUrl).length,
      hiddenSheets: metadata.sheets.filter(s => s.visual.isHidden).length,
      totalNamedRanges: metadata.namedRanges.length,
      totalTriggers: metadata.triggers.length,
      extractionTime: `${(new Date() - startTime) / 1000} seconds`
    };

    console.log('Sheets processed: ' + metadata.summary.totalSheets);
    console.log('Time taken: ' + metadata.summary.extractionTime);

    return metadata;
  } catch (error) {
    console.error('Extraction failed:', error.toString());
    throw error;
  }
}

// [Include all helper functions from V7 - extractSheetData, extractValidations, etc.]
// For brevity, I'll include the key ones:

function extractSheetData(spreadsheet) {
  const sheets = spreadsheet.getSheets();
  const sheetData = [];

  sheets.forEach((sheet, index) => {
    try {
      console.log(`Processing sheet ${index + 1}/${sheets.length}: ${sheet.getName()}`);

      const data = {
        name: sheet.getName(),
        id: sheet.getSheetId(),
        index: index,
        visual: {
          tabColor: sheet.getTabColor(),
          isHidden: sheet.isSheetHidden(),
          frozenRows: sheet.getFrozenRows(),
          frozenColumns: sheet.getFrozenColumns()
        },
        formUrl: null,
        row1Headers: {},
        row1HeaderCount: 0,
        row2Headers: {},
        row2HeaderCount: 0,
        dimensions: {
          rows: sheet.getMaxRows(),
          cols: sheet.getMaxColumns(),
          lastRow: sheet.getLastRow(),
          lastCol: sheet.getLastColumn()
        },
        validations: extractValidations(sheet),
        formulas: extractFormulas(sheet),
        notesCount: countCellNotes(sheet, 20),
        conditionalFormats: extractConditionalFormats(sheet),
        protectedRanges: extractProtectedRanges(sheet),
        sampleData: extractSampleData(sheet, 5)
      };

      // Extract form URL if sheet is form-connected
      try {
        const formUrl = sheet.getFormUrl();
        if (formUrl) {
          data.formUrl = formUrl;
        }
      } catch (e) {
        // No form connected
      }

      // Extract Row 1 headers
      if (sheet.getLastRow() >= 1) {
        const row1Range = sheet.getRange(1, 1, 1, sheet.getLastColumn());
        const row1Values = row1Range.getValues()[0];

        row1Values.forEach((header, colIndex) => {
          if (header && header.toString().trim() !== '') {
            const colLetter = columnToLetter(colIndex + 1);
            data.row1Headers[colLetter] = header.toString().trim();
            data.row1HeaderCount++;
          }
        });
      }

      // Extract Row 2 headers
      if (sheet.getLastRow() >= 2) {
        const row2Range = sheet.getRange(2, 1, 1, sheet.getLastColumn());
        const row2Values = row2Range.getValues()[0];

        row2Values.forEach((header, colIndex) => {
          if (header && header.toString().trim() !== '') {
            const colLetter = columnToLetter(colIndex + 1);
            data.row2Headers[colLetter] = header.toString().trim();
            data.row2HeaderCount++;
          }
        });
      }

      sheetData.push(data);

    } catch (error) {
      console.error(`Error processing sheet ${sheet.getName()}:`, error.toString());
      sheetData.push({
        name: sheet.getName(),
        id: sheet.getSheetId(),
        error: error.toString()
      });
    }
  });

  return sheetData;
}

function extractValidations(sheet) {
  const validations = [];
  const seen = new Set();

  try {
    const lastRow = Math.min(sheet.getLastRow(), 100);
    const lastCol = sheet.getLastColumn();

    if (lastRow > 0 && lastCol > 0) {
      const range = sheet.getRange(1, 1, lastRow, lastCol);
      const rules = range.getDataValidations();

      rules.forEach((row, rowIndex) => {
        row.forEach((rule, colIndex) => {
          if (rule) {
            const colLetter = columnToLetter(colIndex + 1);
            const key = `${colLetter}:${rule.getCriteriaType()}`;

            if (!seen.has(key)) {
              seen.add(key);

              const validation = {
                column: colLetter,
                type: getCriteriaType(rule.getCriteriaType()),
                allowInvalid: rule.getAllowInvalid()
              };

              const helpText = rule.getHelpText();
              if (helpText) {
                validation.helpText = helpText.substring(0, 100);
              }

              if (rule.getCriteriaType() === SpreadsheetApp.DataValidationCriteria.VALUE_IN_LIST) {
                try {
                  const values = rule.getCriteriaValues()[0];
                  if (values) {
                    validation.optionsCount = values.length;
                  }
                } catch (e) {
                  // Could not extract
                }
              }

              validations.push(validation);
            }
          }
        });
      });
    }

  } catch (error) {
    console.error(`Error extracting validations from ${sheet.getName()}:`, error.toString());
  }

  return validations;
}

function extractFormulas(sheet) {
  const formulas = {
    importRanges: [],
    otherFormulas: []
  };

  try {
    const lastRow = Math.min(sheet.getLastRow(), 100);
    const lastCol = sheet.getLastColumn();

    if (lastRow > 0 && lastCol > 0) {
      const range = sheet.getRange(1, 1, lastRow, lastCol);
      const formulaValues = range.getFormulas();

      const seenImports = new Set();
      const seenFormulas = new Set();

      formulaValues.forEach((row, rowIndex) => {
        row.forEach((formula, colIndex) => {
          if (formula && formula.trim() !== '') {
            const colLetter = columnToLetter(colIndex + 1);
            const cell = `${colLetter}${rowIndex + 1}`;

            if (formula.toUpperCase().includes('IMPORTRANGE')) {
              const importKey = formula.substring(0, 100);
              if (!seenImports.has(importKey)) {
                seenImports.add(importKey);
                const targetSpreadsheetId = extractSpreadsheetId(formula);
                formulas.importRanges.push({
                  cell: cell,
                  targetSpreadsheetId: targetSpreadsheetId,
                  formulaPreview: formula.substring(0, 100)
                });
              }
            } else {
              const formulaType = getFormulaType(formula);
              if (!seenFormulas.has(formulaType)) {
                seenFormulas.add(formulaType);
                formulas.otherFormulas.push({
                  type: formulaType,
                  exampleCell: cell
                });
              }
            }
          }
        });
      });
    }

  } catch (error) {
    console.error(`Error extracting formulas from ${sheet.getName()}:`, error.toString());
  }

  return formulas;
}

function countCellNotes(sheet, numRows) {
  try {
    const lastRow = Math.min(sheet.getLastRow(), numRows);
    const lastCol = sheet.getLastColumn();

    if (lastRow > 0 && lastCol > 0) {
      const range = sheet.getRange(1, 1, lastRow, lastCol);
      const noteValues = range.getNotes();

      let count = 0;
      noteValues.forEach((row) => {
        row.forEach((note) => {
          if (note && note.trim() !== '') {
            count++;
          }
        });
      });

      return count;
    }

    return 0;

  } catch (error) {
    console.error(`Error counting notes from ${sheet.getName()}:`, error.toString());
    return 0;
  }
}

function extractConditionalFormats(sheet) {
  const formats = [];

  try {
    const rules = sheet.getConditionalFormatRules();

    rules.forEach((rule, index) => {
      const ranges = rule.getRanges();
      const rangeNotation = ranges.map(r => r.getA1Notation()).join(', ');

      formats.push({
        range: rangeNotation,
        type: rule.getBooleanCondition() ? 'BOOLEAN' : 'GRADIENT'
      });
    });

  } catch (error) {
    console.error(`Error extracting conditional formats from ${sheet.getName()}:`, error.toString());
  }

  return formats;
}

function extractProtectedRanges(sheet) {
  const protections = [];

  try {
    const protected = sheet.getProtections(SpreadsheetApp.ProtectionType.RANGE);

    protected.forEach(protection => {
      const range = protection.getRange();
      protections.push({
        range: range.getA1Notation(),
        description: protection.getDescription() || 'No description',
        editors: protection.getEditors().length
      });
    });

  } catch (error) {
    console.error(`Error extracting protected ranges from ${sheet.getName()}:`, error.toString());
  }

  return protections;
}

function extractSampleData(sheet, numRows) {
  const samples = [];

  try {
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();

    if (lastRow >= 3 && lastCol > 0) {
      const startRow = 3;
      const rowsToFetch = Math.min(numRows, lastRow - 2);

      if (rowsToFetch > 0) {
        const range = sheet.getRange(startRow, 1, rowsToFetch, lastCol);
        const values = range.getValues();

        values.forEach((row, rowIndex) => {
          const anonymizedRow = {};
          row.forEach((value, colIndex) => {
            const colLetter = columnToLetter(colIndex + 1);
            anonymizedRow[colLetter] = anonymizeValue(value);
          });
          samples.push(anonymizedRow);
        });
      }
    }

  } catch (error) {
    console.error(`Error extracting sample data from ${sheet.getName()}:`, error.toString());
  }

  return samples;
}

function anonymizeValue(value) {
  if (!value || value === '') return 'EMPTY';

  const str = value.toString();

  if (typeof value === 'number' || str.match(/^-?\d+(\.\d+)?$/)) {
    return 'NUMBER';
  }

  if (str.match(/^\d{1,2}\/\d{1,2}\/\d{2,4}$/) || str.match(/^\d{4}-\d{2}-\d{2}/)) {
    return 'DATE';
  }

  if (str.match(/@/)) {
    return 'EMAIL';
  }

  if (str.toLowerCase() === 'true' || str.toLowerCase() === 'false') {
    return 'BOOLEAN';
  }

  if (str.match(/^https?:\/\//)) {
    return 'URL';
  }

  return 'TEXT';
}

function extractAppsScriptInfo(spreadsheetId) {
  return {
    note: 'Apps Script code must be extracted separately via clasp',
    hasScriptProject: true
  };
}

function extractNamedRanges(spreadsheet) {
  const ranges = [];

  try {
    const namedRanges = spreadsheet.getNamedRanges();

    namedRanges.forEach(namedRange => {
      const range = namedRange.getRange();
      ranges.push({
        name: namedRange.getName(),
        range: range.getA1Notation(),
        sheet: range.getSheet().getName()
      });
    });

  } catch (error) {
    console.error('Error extracting named ranges:', error.toString());
  }

  return ranges;
}

function extractTriggers() {
  const triggers = [];

  try {
    const allTriggers = ScriptApp.getProjectTriggers();

    allTriggers.forEach(trigger => {
      triggers.push({
        handlerFunction: trigger.getHandlerFunction(),
        eventType: trigger.getEventType().toString(),
        triggerSource: trigger.getTriggerSource().toString()
      });
    });

  } catch (error) {
    console.error('Error extracting triggers:', error.toString());
  }

  return triggers;
}

function extractSpreadsheetId(formula) {
  const match = formula.match(/IMPORTRANGE\s*\(\s*"([^"]+)"/i);
  return match ? match[1] : null;
}

function getFormulaType(formula) {
  const upperFormula = formula.toUpperCase();

  if (upperFormula.includes('IF(')) return 'IF';
  if (upperFormula.includes('SUMIF')) return 'SUMIF';
  if (upperFormula.includes('COUNTIF')) return 'COUNTIF';
  if (upperFormula.includes('VLOOKUP')) return 'VLOOKUP';
  if (upperFormula.includes('QUERY')) return 'QUERY';
  if (upperFormula.includes('FILTER')) return 'FILTER';
  if (upperFormula.includes('SUM(')) return 'SUM';
  if (upperFormula.includes('AVERAGE')) return 'AVERAGE';
  if (upperFormula.includes('CONCAT')) return 'CONCATENATE';

  return 'OTHER';
}

function getCriteriaType(criteriaType) {
  const types = {
    [SpreadsheetApp.DataValidationCriteria.VALUE_IN_LIST]: 'LIST',
    [SpreadsheetApp.DataValidationCriteria.VALUE_IN_RANGE]: 'RANGE',
    [SpreadsheetApp.DataValidationCriteria.DATE_IS_VALID]: 'DATE',
    [SpreadsheetApp.DataValidationCriteria.NUMBER_GREATER_THAN]: 'NUMBER_GT',
    [SpreadsheetApp.DataValidationCriteria.NUMBER_LESS_THAN]: 'NUMBER_LT',
    [SpreadsheetApp.DataValidationCriteria.TEXT_CONTAINS]: 'TEXT_CONTAINS',
    [SpreadsheetApp.DataValidationCriteria.CUSTOM_FORMULA]: 'CUSTOM'
  };
  return types[criteriaType] || 'UNKNOWN';
}

function columnToLetter(column) {
  let temp, letter = '';
  while (column > 0) {
    temp = (column - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    column = (column - temp - 1) / 26;
  }
  return letter;
}

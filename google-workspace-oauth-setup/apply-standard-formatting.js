/**
 * Apply standard Google Sheets formatting
 * Based on: infrastructure/GOOGLE-SHEETS-FORMATTING-STANDARDS.md
 *
 * Usage:
 *   const { applyStandardFormatting } = require('./apply-standard-formatting');
 *   await applyStandardFormatting(sheets, spreadsheetId, sheetId, columnConfig);
 */

/**
 * Apply standard Google Sheets formatting
 *
 * @param {object} sheets - Google Sheets API instance
 * @param {string} spreadsheetId - ID of spreadsheet to format
 * @param {number} sheetId - ID of specific sheet/tab to format
 * @param {object} columnConfig - Column configuration
 *
 * Example columnConfig:
 * {
 *   userEditable: [0, 2, 5],      // Column indices for light blue headers
 *   autoPopulated: [1, 3, 4],     // Column indices for light yellow headers
 *   centerText: [0, 2],           // Columns with short text (centered)
 *   centerNumbers: [3, 4],        // Numeric columns (centered)
 * }
 */
async function applyStandardFormatting(sheets, spreadsheetId, sheetId, columnConfig = {}) {
  const requests = [];

  // 1. Freeze and bold header row
  requests.push({
    updateSheetProperties: {
      properties: {
        sheetId: sheetId,
        gridProperties: {
          frozenRowCount: 1
        }
      },
      fields: 'gridProperties.frozenRowCount'
    }
  });

  requests.push({
    repeatCell: {
      range: {
        sheetId: sheetId,
        startRowIndex: 0,
        endRowIndex: 1
      },
      cell: {
        userEnteredFormat: {
          textFormat: { bold: true },
          wrapStrategy: 'WRAP'  // Always wrap header text
        }
      },
      fields: 'userEnteredFormat(textFormat.bold,wrapStrategy)'
    }
  });

  // 2. User-editable columns (light blue headers)
  if (columnConfig.userEditable) {
    for (const colIndex of columnConfig.userEditable) {
      requests.push({
        repeatCell: {
          range: {
            sheetId: sheetId,
            startRowIndex: 0,
            endRowIndex: 1,
            startColumnIndex: colIndex,
            endColumnIndex: colIndex + 1
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: {
                red: 0.81,
                green: 0.886,
                blue: 0.953
              }
            }
          },
          fields: 'userEnteredFormat.backgroundColor'
        }
      });
    }
  }

  // 3. Auto-populated columns (light yellow headers)
  if (columnConfig.autoPopulated) {
    for (const colIndex of columnConfig.autoPopulated) {
      requests.push({
        repeatCell: {
          range: {
            sheetId: sheetId,
            startRowIndex: 0,
            endRowIndex: 1,
            startColumnIndex: colIndex,
            endColumnIndex: colIndex + 1
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: {
                red: 1.0,
                green: 0.949,
                blue: 0.8
              }
            }
          },
          fields: 'userEnteredFormat.backgroundColor'
        }
      });
    }
  }

  // 4. Center-align short text columns
  if (columnConfig.centerText) {
    for (const colIndex of columnConfig.centerText) {
      requests.push({
        repeatCell: {
          range: {
            sheetId: sheetId,
            startRowIndex: 1,  // Skip header
            startColumnIndex: colIndex,
            endColumnIndex: colIndex + 1
          },
          cell: {
            userEnteredFormat: {
              horizontalAlignment: 'CENTER'
            }
          },
          fields: 'userEnteredFormat.horizontalAlignment'
        }
      });
    }
  }

  // 5. Center-align number columns
  if (columnConfig.centerNumbers) {
    for (const colIndex of columnConfig.centerNumbers) {
      requests.push({
        repeatCell: {
          range: {
            sheetId: sheetId,
            startRowIndex: 1,  // Skip header
            startColumnIndex: colIndex,
            endColumnIndex: colIndex + 1
          },
          cell: {
            userEnteredFormat: {
              horizontalAlignment: 'CENTER'
            }
          },
          fields: 'userEnteredFormat.horizontalAlignment'
        }
      });
    }
  }

  // Execute all formatting
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: { requests }
  });

  console.log('✅ Standard formatting applied');
}

module.exports = { applyStandardFormatting };

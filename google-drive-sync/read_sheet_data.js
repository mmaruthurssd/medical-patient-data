const { google } = require('googleapis');
const { getAuthenticatedClient } = require('./auth');
const path = require('path');
const fs = require('fs').promises;

async function readSheetData(spreadsheetId) {
  console.log(`--- Reading data from spreadsheet: ${spreadsheetId} ---`);

  try {
    const auth = getAuthenticatedClient();
    const sheets = google.sheets({ version: 'v4', auth });

    // Read data from the "New Index Dev 4" tab, starting from F3
    const range = 'New Index Dev 4!F3:Z';

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: range,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.log('No data found in the specified range of the spreadsheet.');
      return;
    }

    console.log('Spreadsheet Data from "New Index Dev 4" (starting F3):');
    rows.forEach(row => {
      console.log(row.join('\t')); // Print rows for inspection
    });

    // TODO: Parse dev4 IDs from here

  } catch (error) {
    console.error('❌ Error reading spreadsheet data:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
  }
}

if (require.main === module) {
  const spreadsheetId = '1ZU64Umiv3bHwXq8arr4tJqBLPxUuEG2LeVOvODMuOjw';
  readSheetData(spreadsheetId);
}


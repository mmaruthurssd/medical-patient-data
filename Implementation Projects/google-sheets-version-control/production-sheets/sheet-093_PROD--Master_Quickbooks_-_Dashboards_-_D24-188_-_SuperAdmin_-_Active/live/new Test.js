// --- SPREADSHEET & API CONSTANTS ---
// const FINANCIAL_SS_ID = "YOUR_FINANCIAL_SPREADSHEET_ID"; // <--- !!! REPLACE THIS !!!
// const API_DETAILS_SHEET = "API_Details"; // Sheet name where token is stored
// const QB_PROFIT_LOSS_SHEET_NAME = "QB_P&L_Detail"; // Target sheet for P&L data
 const COMPANY_ID_QB = "9130357785751186"; // Your QuickBooks Company ID
 const COMPANY_NAME_FOR_SHEET = "AVA Lee"; // Company name to write in the sheet

// --- COLUMN HEADERS FOR THE OUTPUT SHEET ---
const OUTPUT_HEADERS = [
  "Report Processed Date", "Company",
  "Top Level Category", "Mid Level Category", "Low Level Category", "Specific Account GL",
  "Transaction Date", "Transaction Type", "Doc Number", "Name/Payee", "Memo/Description", "Amount"
];


// Main function to fetch and process data for a given year
function fetchAndProcessProfitAndLossDetail(year) {
  if (!year) {
    year = new Date().getFullYear(); // Default to current year if not provided
    Logger.log(`Year not provided, defaulting to ${year}`);
  }
  Logger.log(`Processing P&L Detail for year: ${year}`);

  // This date is used for the "Report Processed Date" column in the sheet
  // It's different from the actual transaction dates from QB
  const reportProcessedDate = new Date();

  // Assuming getNewTokenMainAVA_() handles token refresh if necessary
  // getNewTokenMainAVA_(); 

  const apiSS = SpreadsheetApp.openById(FINANCIAL_SS_ID);
  const apiDetailSheet = apiSS.getSheetByName(API_DETAILS_SHEET);
  if (!apiDetailSheet) {
    SpreadsheetApp.getUi().alert(`Error: Sheet "${API_DETAILS_SHEET}" not found in Spreadsheet ID "${FINANCIAL_SS_ID}".`);
    return;
  }
  const token = apiDetailSheet.getRange("B2").getValue();
  //Logger.log(token)
  if (!token) {
    SpreadsheetApp.getUi().alert(`Error: No token found in ${API_DETAILS_SHEET}, cell B2.`);
    return;
  }

  const myHeaders = {
    "Accept": "application/json",
    "Authorization": "Bearer " + token,
    "Content-Type": "application/json" // Good practice to include
  };

  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;
  const url = `https://quickbooks.api.intuit.com/v3/company/${COMPANY_ID_QB}/reports/ProfitAndLossDetail?start_date=${startDate}&end_date=${endDate}&minorversion=69`; // Added minorversion

  const requestOptions = {
    method: 'GET', // Changed from 'Get' to 'GET' (more standard)
    headers: myHeaders,
    muteHttpExceptions: true // Important for parsing error responses
  };

  let response;
  try {
    response = UrlFetchApp.fetch(url, requestOptions);
  } catch (e) {
    Logger.log(`Network error fetching P&L data: ${e.toString()}`);
    SpreadsheetApp.getUi().alert(`Network error: ${e.toString()}`);
    return;
  }

  const responseCode = response.getResponseCode();
  const resultText = response.getContentText();

  if (responseCode !== 200) {
    Logger.log(`Error from QuickBooks API. Code: ${responseCode}. Response: ${resultText}`);
    SpreadsheetApp.getUi().alert(`QuickBooks API Error (Code: ${responseCode}): Check Logs for details.`);
    // Attempt to parse error for more details
    try {
      const errorObj = JSON.parse(resultText);
      if (errorObj && errorObj.Fault && errorObj.Fault.Error && errorObj.Fault.Error.length > 0) {
        Logger.log(`QB Error Detail: ${errorObj.Fault.Error[0].Message} - ${errorObj.Fault.Error[0].Detail}`);
      }
    } catch (e) { /* ignore parse error of error message */ }
    return;
  }

  let resultObj;
  try {
    resultObj = JSON.parse(resultText);
  } catch (e) {
    Logger.log(`Error parsing JSON response: ${e.toString()}. Response Text: ${resultText.substring(0, 500)}`);
    SpreadsheetApp.getUi().alert("Error parsing QuickBooks response. Check Logs.");
    return;
  }

  // Logger.log(JSON.stringify(resultObj, null, 2)); // For debugging the whole structure

  const ss = SpreadsheetApp.getActiveSpreadsheet(); // Or openById if this is a library script
  let sheet = ss.getSheetByName("Test Profit & Loss");
  // if (!sheet) {
  //   sheet = ss.insertSheet(QB_PROFIT_LOSS_SHEET_NAME);
  //   Logger.log(`Sheet "${QB_PROFIT_LOSS_SHEET_NAME}" created.`);
  // }

  // --- Prepare existing data and new data array ---
  let dataToKeep = [];
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();

  if (lastRow > 1 && lastCol > 0) { // Check if there's data beyond a potential header
    // Read all existing data, assuming headers are in row 1
    // Make sure to read enough columns if the sheet structure was different before
    const currentSheetData = sheet.getRange(2, 1, lastRow - 1, Math.max(lastCol, OUTPUT_HEADERS.length)).getValues();
    dataToKeep = currentSheetData.filter(r => {
      const rowYear = (r[0] instanceof Date) ? r[0].getFullYear() : null;
      const rowCompany = r[1]; // Assuming Company is in the second column
      // Keep row if:
      // 1. It has no valid date in first col OR date is not the processing year
      // OR
      // 2. Company name is different from the one we are processing
      return (rowYear !== year || rowCompany !== COMPANY_NAME_FOR_SHEET);
    });
  }

  let processedDataFromQB = [];
  if (resultObj && resultObj.Rows && resultObj.Rows.Row) {
    processReportRowsRecursive(resultObj.Rows.Row, [], processedDataFromQB, reportProcessedDate);
  } else {
    Logger.log("No 'Rows.Row' found in the QuickBooks response. The report might be empty or structured differently.");
  }

  // Combine data to keep with newly processed data
  const allDataForSheet = dataToKeep.concat(processedDataFromQB);

  // Clear the sheet (except headers, if we manage them carefully)
  //sheet.clearContents(); // Clear everything first

  // Write headers
  //sheet.getRange(1, 1, 1, OUTPUT_HEADERS.length).setValues([OUTPUT_HEADERS]).setFontWeight("bold");

  sheet.getRange(2, 1, allDataForSheet.length, allDataForSheet[0].length).setValues(allDataForSheet);

  //SpreadsheetApp.getUi().alert(`P&L data processing complete for year ${year}. Check sheet "${QB_PROFIT_LOSS_SHEET_NAME}".`);


}

/**
 * Recursively processes rows from the QuickBooks report.
 * @param {Array} rows The array of row objects from QB.
 * @param {Array<String>} currentPath An array representing the current account hierarchy.
 * @param {Array} outputArray The array to push formatted data into.
 * @param {Date} reportProcessedDate The date the report script was run.
 */
function processReportRowsRecursive(rows, currentPath, outputArray, reportProcessedDate) {
  if (!rows || !Array.isArray(rows)) {
    return;
  }

  rows.forEach(row => {
    let newPath = [...currentPath]; // Inherit current path

    // If there's a Header, it defines a new level in the hierarchy
    if (row.Header && row.Header.ColData && row.Header.ColData.length > 0 && row.Header.ColData[0].value) {
      newPath.push(row.Header.ColData[0].value.trim());
    }

    // Check if this row is a "Data" row (actual transaction detail)
    // These rows have 'ColData' directly under 'row', not under 'Header' or 'Summary'
    // and usually a 'type' of "Data" or are leaf nodes with values.
    if (row.ColData && Array.isArray(row.ColData) && row.ColData.length >= 8) { // P&L Detail usually has 9 columns (0-8)
      // This is likely a transaction detail line
      const colDataValues = row.ColData.map(cd => cd.value);

      // Expected ColData structure for ProfitAndLossDetail:
      // [0]: Date, [1]: Transaction Type, [2]: Doc Number, [3]: Name, 
      // [4]: Memo/Description, [5]: Class, [6]: Split Account, [7]: Amount, [8]: Balance

      const transactionDateStr = colDataValues[0];
      let transactionDate = null;
      if (transactionDateStr && !isNaN(new Date(transactionDateStr))) {
        transactionDate = new Date(transactionDateStr);
      } else if (transactionDateStr) {
        Logger.log(`Warning: Could not parse transaction date: ${transactionDateStr}`);
      }

      const transactionType = colDataValues[1] || "";
      const docNumber = colDataValues[2] || "";
      const namePayee = colDataValues[3] || "";
      const memoDescription = colDataValues[4] || "";
      // const qbClass = colDataValues[5] || ""; // If you need Class
      const splitAccount = colDataValues[6] || ""; // This is the actual G/L account for this line
      const amountStr = colDataValues[8];
      const amount = parseFloat(amountStr) || 0;

      const outputRow = [
        reportProcessedDate,
        COMPANY_NAME_FOR_SHEET,
        newPath[0] || "", // Top Level Category (e.g., "Ordinary Income/Expense")
        newPath[1] || "", // Mid Level Category (e.g., "Expenses")
        newPath[2] || "", // Low Level Category (e.g., "6000 Office Expenses") - adjust if hierarchy is deeper/shallower
        splitAccount,     // Specific G/L account for the transaction line
        transactionDate,
        transactionType,
        docNumber,
        namePayee,
        memoDescription,
        amount
      ];
      outputArray.push(outputRow);
    }

    // If there are nested rows, recurse
    if (row.Rows && row.Rows.Row && Array.isArray(row.Rows.Row)) {
      processReportRowsRecursive(row.Rows.Row, newPath, outputArray, reportProcessedDate);
    }

    // Your original code also looked at `row.Summary` for certain accounts.
    // If you need to extract specific summary lines in addition to transaction details,
    // that logic would need to be added here, carefully, to avoid double-counting
    // or to format them differently. For "all data formatted", transaction details are usually primary.
    // Example (if you wanted to add summary lines - be Cautious):
    /*
    if (row.Summary && row.Summary.ColData && row.Summary.ColData.length > 0) {
        const summaryAccountName = row.Summary.ColData[0].value;
        // P&L Detail summary lines usually have amount in the last or second to last column
        const summaryAmountStr = row.Summary.ColData[row.Summary.ColData.length -1].value; // Or -2 for some reports
        const summaryAmount = parseFloat(summaryAmountStr) || 0;

        // Example: Only add if it's a specific type of summary you care about
        // if (summaryAccountName.startsWith("Total")) {
        //   const summaryRow = [
        //     reportProcessedDate, COMPANY_NAME_FOR_SHEET,
        //     newPath.join(" : "), // Full path as category
        //     summaryAccountName, // Or use this as sub-category
        //     "", // Specific GL
        //     null, // Txn Date for summary
        //     "SUMMARY", // Txn Type for summary
        //     "", "", "", // Doc, Name, Memo for summary
        //     summaryAmount
        //   ];
        //   outputArray.push(summaryRow);
        // }
    }
    */

  });
}


// Example of how to run it:
function runProfitAndLossForSpecificYear() {
  fetchAndProcessProfitAndLossDetail(2024); // Change year as needed
}

function runProfitAndLossForCurrentYear() {
  fetchAndProcessProfitAndLossDetail(new Date().getFullYear());
}

// You would still need your getNewTokenMainAVA_() function if token expires.
// function getNewTokenMainAVA_() {
//   // Your existing token refresh logic
//   Logger.log("Token refresh function called (stub). Implement if needed.");
// }



const EXPENSE_SS_ID = "1W-SOL_z6tHSj3DVqrzq8DQSd1ECOrlwSCIIY0Ov-ucM";

const ALL_TRX_SHEET = "All Bank & CC Transactions_ (Editable)";

const UNIQUE_PAYEE_SHEET = "Unique Payees"







function getVendorExpenses() {




  const expenseSS = SpreadsheetApp.openById(EXPENSE_SS_ID)
  const uniqueSheet = expenseSS.getSheetByName(UNIQUE_PAYEE_SHEET); // Sheet with vendor list
  const trxSheet = expenseSS.getSheetByName(ALL_TRX_SHEET); // Sheet with transactions


  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet3 = ss.getSheetByName("Master Vendor Payments (from Expenses Dash)"); // Sheet to store vendor expenses

  // Clear Sheet3 content before writing new data
  //sheet3.clearContents();

  // Get all data from uniqueSheet (Vendor List)
  const uniqueSheetData = uniqueSheet.getDataRange().getValues();

  // Find column index for Vendor status (Column I in uniqueSheet)
  const vendorColumnIndex = 13; // Column I is index 8 (0-based)

  // Create a set to store vendor names
  const vendorNames = new Set();

  // Iterate through uniqueSheet data to populate vendor names
  for (let i = 1; i < uniqueSheetData.length; i++) { // Start from row 2 (skip headers)
    if (uniqueSheetData[i][vendorColumnIndex] === "Vendor") { // Assuming "TRUE" indicates a vendor, adjust if needed
      vendorNames.add(uniqueSheetData[i][1]); // Assuming name is in column A (index 0)
    }
  }

  // Get all data from trxSheet (Transaction List)
  const trxSheetData = trxSheet.getDataRange().getValues();

  // Find column indices in trxSheet
  const nameColumnIndex = 6; // Column A (Name)
  const typeColumnIndex = 2; // Column C (Transaction Type)

  // Array to store vendor expenses data
  const vendorExpenses = [];

  // Add headers to vendorExpenses array
  //const headers = ["Name", "Transaction Type"]; // Adjust headers as needed
  //vendorExpenses.push(headers);

  // Iterate through trxSheet data to find vendor expenses
  for (let i = 1; i < trxSheetData.length; i++) { // Start from row 2 (skip headers)
    const name = trxSheetData[i][nameColumnIndex];
    const type = trxSheetData[i][typeColumnIndex];

    // Check if the name is in the vendor list and if the transaction is an expense
    if (vendorNames.has(name) && type.toLowerCase() === "expense") { // Case-insensitive comparison
      vendorExpenses.push(trxSheetData[i]);
    }
  }

  // Write the vendor expenses data to Sheet3
  if (vendorExpenses.length > 1) { // Check if there is any expense data to write
    sheet3.getRange(2, 1, vendorExpenses.length, vendorExpenses[0].length).setValues(vendorExpenses);
    SpreadsheetApp.getActive().toast('Vendor expenses extraction complete!', 'Success');
  } else {
    SpreadsheetApp.getActive().toast('No vendor expenses found.', 'Info');
  }
}

















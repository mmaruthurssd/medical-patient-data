/***** Configuration & helpers *****/

// Get a required Script Property or throw a clear error
function prop_(key) {
  const v = PropertiesService.getScriptProperties().getProperty(key);
  if (!v) throw new Error('Missing Script Property: ' + key);
  return v;
}

// Open the paycheck spreadsheet explicitly (Execution API has no "active" spreadsheet)
function getPaycheckSS_() {
  const ssId = prop_('PAYCHECK_SS_ID');
  return SpreadsheetApp.openById(ssId);
}

// Append rows to a sheet efficiently
function appendRows_(sheet, rows) {
  if (!rows || rows.length === 0) return;
  const startRow = sheet.getLastRow() + 1;
  const startCol = 1;
  sheet.getRange(startRow, startCol, rows.length, rows[0].length).setValues(rows);
}

// Tiny probe you can run from clasp to sanity-check deployments
function ping() { return 'pong'; }

/***** MAIN: fetchPayStubsTest *****/

function fetchPayStubsTest() {
  // --- Read config from Script Properties ---
  const TENANT_ID        = prop_('TENANT_ID');
  const SUBSCRIPTION_KEY = prop_('SUBSCRIPTION_KEY');
  const SHEET_NAME       = 'Paystubs';                          // adjust if needed
  const API_DETAILS_SHEET = prop_('API_DETAILS_SHEET');         // e.g., "API_Details"

  // --- Open spreadsheet & get token from API details sheet (B2) ---
  const paycheckSS    = getPaycheckSS_();
  const apiDetailSheet = paycheckSS.getSheetByName(API_DETAILS_SHEET);
  if (!apiDetailSheet) throw new Error('Sheet not found: ' + API_DETAILS_SHEET);

  const token = apiDetailSheet.getRange('B2').getValue();
  if (!token) throw new Error('No token in ' + API_DETAILS_SHEET + '!B2');

  // --- Build auth headers ---
  const headers = {
    'Authorization': 'Bearer ' + token,
    'Ocp-Apim-Subscription-Key': SUBSCRIPTION_KEY
  };
  const options = { method: 'GET', headers: headers, muteHttpExceptions: true };

  // --- 1) Fetch employees for the tenant ---
  const tenantUrl = 'https://apis.paycor.com/v1/tenants/' + TENANT_ID + '/employees';
  const employeeResp = UrlFetchApp.fetch(tenantUrl, options);
  if (employeeResp.getResponseCode() >= 400) {
    throw new Error('Employees request failed: ' + employeeResp.getResponseCode() + ' — ' + employeeResp.getContentText());
  }
  const empResultObj = JSON.parse(employeeResp.getContentText());
  const employees = (empResultObj && empResultObj.records) ? empResultObj.records : [];
  if (employees.length === 0) {
    return 'No employees returned for tenant ' + TENANT_ID;
  }

  // --- 2) For each day (Mar 16–29, 2024) and employee, collect paystub rows ---
  const out = [];
  for (var day = 16; day < 30; day++) {
    const today = new Date(2024, 2, day); // March is month index 2
    const checkDateParam = '3-' + day + '-2024';

    employees.forEach(function(record) {
      const firstName = record.firstName;
      const lastName  = record.lastName;
      const fullName  = (firstName || '') + ' ' + (lastName || '');
      const employeeId = record && record.employee && record.employee.id;

      if (!employeeId) return; // skip if missing id

      try {
        const payStubsUrl =
          'https://apis.paycor.com/v1/employees/' + employeeId +
          '/paystubs?checkDate=' + encodeURIComponent(checkDateParam) + '&include=All';

        const payResp = UrlFetchApp.fetch(payStubsUrl, options);
        if (payResp.getResponseCode() >= 400) {
          // Log and continue
          Logger.log('Paystubs failed for ' + fullName + ' (' + employeeId + ') ' +
                     checkDateParam + ': ' + payResp.getResponseCode() + ' — ' + payResp.getContentText());
          return;
        }

        const payObj = JSON.parse(payResp.getContentText());
        const stubs = (payObj && payObj.records) ? payObj.records : [];
        if (!stubs.length) return;

        stubs.forEach(function(ps) {
          // gross/net
          out.push([fullName, today, 'grossAmount', '', ps.grossAmount]);
          out.push([fullName, today, 'netAmount',   '', ps.netAmount]);

          // earnings
          if (ps.earnings) {
            out.push([fullName, today, 'earnings', 'totalEarningsAmount', ps.earnings.totalEarningsAmount]);
            if (ps.earnings.earnings && ps.earnings.earnings.length) {
              ps.earnings.earnings.forEach(function(e) {
                out.push([fullName, today, 'earnings', e.earningCode, e.earningAmount]);
              });
            }
          }

          // taxes
          var medPlusSoc = [fullName, today, 'taxes', 'MEDplusSOC', 0];
          if (ps.taxes) {
            out.push([fullName, today, 'taxes', 'totalTaxesAmount', ps.taxes.totalTaxesAmount]);
            if (ps.taxes.taxes && ps.taxes.taxes.length) {
              ps.taxes.taxes.forEach(function(t) {
                out.push([fullName, today, 'taxes', t.taxCode, t.taxAmount]);
                if (t.taxCode === 'MED' || t.taxCode === 'SOC') {
                  medPlusSoc[4] += Number(t.taxAmount || 0);
                }
              });
            }
          }
          out.push(medPlusSoc);

          // deductions
          if (ps.deductions && ps.deductions.totalDeductionsAmount > 0) {
            out.push([fullName, today, 'deductions', 'totalDeductionsAmount', ps.deductions.totalDeductionsAmount]);
            if (ps.deductions.deductions && ps.deductions.deductions.length) {
              ps.deductions.deductions.forEach(function(d) {
                out.push([fullName, today, 'deductions', d.deductionCode, d.deductionAmount]);
              });
            }
          }
        });
      } catch (err) {
        Logger.log('Error for ' + fullName + ' on ' + checkDateParam + ': ' + err);
      }
    });
  }

  // --- 3) Write results ---
  if (out.length) {
    const sheet = paycheckSS.getSheetByName(SHEET_NAME) || paycheckSS.insertSheet(SHEET_NAME);
    appendRows_(sheet, out);
  }

  return 'fetchPayStubsTest: wrote ' + out.length + ' row(s)';
}

/***** Optional: one-time helper to set Script Properties from code
// After setting, you can delete or comment this out.
function setupScriptPropertiesOnce() {
  const p = PropertiesService.getScriptProperties();
  p.setProperties({
    PAYCHECK_SS_ID:     'PASTE_YOUR_SHEET_ID',
    API_DETAILS_SHEET:  'API_Details',
    TENANT_ID:          '194759',
    SUBSCRIPTION_KEY:   'PASTE_YOUR_SUBSCRIPTION_KEY'
  }, true);
  return 'Script properties set.';
}
*****/

/****************************************************
 * QuickBooks ↔ Google Sheets (Apps Script) — PRODUCTION
 * - OAuth2 (Apps Script OAuth2 library)
 * - Redirect: /macros/d/<SCRIPT_ID>/usercallback
 * - Dynamic service name (separate tokens for PROD vs SANDBOX)
 * - Creates EXPENSE CHECKS from sheet rows
 *   Columns: A Vendor | B Amount | C Description | D Memo | E Status
 *            F Expense Account (Name or Id) | G Mailing Address (free-form)
 ****************************************************/

/** ======== CONFIG (YOUR PRODUCTION KEYS) ======== */
const CONFIG = {
  CLIENT_ID: 'AB8q5wqjEj9hlLJr8PTaUWoj6djtlDxocwZHclfx862R8CFn59',
  CLIENT_SECRET: 'Ell4VzXmYqosMNFFkACv8PrBmCyTJrXSizWuWA4k',

  // Use production host
  USE_SANDBOX: false,

  // Scopes and minor version
  SCOPES: 'com.intuit.quickbooks.accounting openid profile email',
  MINOR_VERSION: '65',

  // Bank account (payment account for checks)
  BANK_ACCOUNT_NAME: '',   // exact QB name
  BANK_ACCOUNT_ID: '4004 Refunds',             // (optional) numeric Id if you prefer

  // Default expense account if column F is blank
  DEFAULT_EXPENSE_ACCOUNT_NAME: 'Purchases', // exact QB name
  DEFAULT_EXPENSE_ACCOUNT_ID: '',            // or numeric Id

  PAYMENT_TYPE: 'Check' // we create Purchase with PaymentType="Check"
};

// Keys for UserProperties
const PK = { REALM_ID: 'QB_REALM_ID' };

/** ======== Redirect helper (UI only) ======== */
function getRedirectUri() {
  return 'https://script.google.com/macros/d/' + ScriptApp.getScriptId() + '/usercallback';
}

/** ======== OAuth2 Service (dynamic name keeps PROD/SANDBOX tokens separate) ======== */
function getServiceName_() {
  return 'QuickBooks_' + (CONFIG.USE_SANDBOX ? 'SANDBOX' : 'PROD');
}

// Add library first: Script ID 1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhMFx5E5h-0mDf (identifier: OAuth2)
function getService() {
  return OAuth2.createService(getServiceName_())
    .setAuthorizationBaseUrl('https://appcenter.intuit.com/connect/oauth2')
    .setTokenUrl('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer')
    .setClientId(CONFIG.CLIENT_ID)
    .setClientSecret(CONFIG.CLIENT_SECRET)
    .setCallbackFunction('authCallback') // routes to /usercallback
    .setScope(CONFIG.SCOPES)
    .setPropertyStore(PropertiesService.getUserProperties())
    .setTokenHeaders({ 'Accept': 'application/json' });
}

/** ======== Menu ======== */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('QuickBooks')
    .addItem('Show Redirect URI', 'showRedirectUri')
    .addItem('Authorize QuickBooks', 'authorizeQuickBooks')
    .addItem('Clear Authorization', 'clearAuth')
    .addItem('Full Reset (tokens + realm)', 'fullReset_')
    .addSeparator()
    .addItem('Show Current Realm & Host', 'showEnv')
    .addItem('Company Info (test)', 'showCompanyInfo')
    .addItem('List Accounts', 'listAllAccounts')
    .addSeparator()
    .addItem('Sync Selected Rows', 'syncSelectedRows')
    .addItem('Sync All Pending Rows', 'syncAllPendingRows')
    .addToUi();
}

/** ======== Auth flow ======== */
function showRedirectUri() {
  const html = HtmlService.createHtmlOutput(
    '<div style="font:14px/1.4 Arial, sans-serif;max-width:720px">' +
    '<h3>Your Redirect URI</h3>' +
    '<pre style="white-space:pre-wrap;background:#f6f8fa;padding:12px;border-radius:6px;">' + getRedirectUri() + '</pre>' +
    '<p>(Optional domain-scoped) https://script.google.com/a/ssdspc.com/macros/d/' +
    ScriptApp.getScriptId() + '/usercallback</p>' +
    '</div>'
  ).setWidth(720).setHeight(300);
  SpreadsheetApp.getUi().showModalDialog(html, 'Redirect URI');
}

function authorizeQuickBooks() {
  const service = getService();
  if (service.hasAccess()) {
    SpreadsheetApp.getUi().alert('Already authorized.');
    return;
  }
  const url = service.getAuthorizationUrl();
  const html = HtmlService.createHtmlOutput(
    '<div style="font:14px/1.4 Arial, sans-serif">' +
    '<a href="' + url + '" target="_blank">Authorize with Intuit</a>' +
    '<p>Choose your production company (e.g., Southern Skies Dermatology), then return here.</p>' +
    '</div>'
  ).setWidth(460).setHeight(180);
  SpreadsheetApp.getUi().showModalDialog(html, 'Authorize QuickBooks');
}

function authCallback(request) {
  // Capture realmId returned by Intuit so API calls hit the same company
  const realmId = request && request.parameter && request.parameter.realmId;
  if (realmId) PropertiesService.getUserProperties().setProperty(PK.REALM_ID, realmId);

  const service = getService();
  const ok = service.handleCallback(request);
  const msg = ok
    ? 'Authorization successful for realmId: ' + (getRealmId_() || '(unknown)') + '. You can close this window.'
    : 'Authorization denied or failed. Close this window and try again.';
  return HtmlService.createHtmlOutput('<p>' + msg + '</p>');
}

function clearAuth() {
  getService().reset();
  PropertiesService.getUserProperties().deleteProperty(PK.REALM_ID);
  SpreadsheetApp.getUi().alert('Authorization and stored realm cleared.');
}

// Hard wipe all OAuth2 tokens (both envs) + realmId — use when switching companies/environments
function fullReset_() {
  const store = PropertiesService.getUserProperties();
  store.getKeys().forEach(k => {
    if (/^oauth2\./i.test(k) || k === PK.REALM_ID) store.deleteProperty(k);
  });
  SpreadsheetApp.getUi().alert('Cleared OAuth2 tokens and stored realm. Re-authorize next.');
}

/** ======== Env & host ======== */
function getRealmId_() {
  return PropertiesService.getUserProperties().getProperty(PK.REALM_ID) || '';
}
function ensureRealmId_() {
  const id = getRealmId_();
  if (!id) throw new Error('No realmId stored. Use QuickBooks → Authorize QuickBooks and choose your company.');
  return id;
}
function qbHost_() {
  return CONFIG.USE_SANDBOX
    ? 'https://sandbox-quickbooks.api.intuit.com'
    : 'https://quickbooks.api.intuit.com';
}
function qbBaseUrl_() {
  return qbHost_() + '/v3/company/' + encodeURIComponent(ensureRealmId_()) + '/';
}
function showEnv() {
  SpreadsheetApp.getUi().alert(
    'Realm ID: ' + (getRealmId_() || '(none)') +
    '\nAPI Host: ' + qbHost_() +
    '\nMinor Version: ' + CONFIG.MINOR_VERSION +
    '\nSandbox Mode: ' + CONFIG.USE_SANDBOX
  );
}

/** ======== Fetch wrapper ======== */
function qbFetch_(pathOrUrl, options) {
  const service = getService();
  if (!service.hasAccess()) throw new Error('Not authorized. Use QuickBooks → Authorize QuickBooks first.');
  const url = /^https?:\/\//i.test(pathOrUrl) ? pathOrUrl : qbBaseUrl_() + pathOrUrl;
  const headers = { 'Authorization': 'Bearer ' + service.getAccessToken(), 'Accept': 'application/json' };
  if (options && options.method && options.method.toUpperCase() !== 'GET') headers['Content-Type'] = 'application/json';
  const res = UrlFetchApp.fetch(url, Object.assign({ headers, muteHttpExceptions: true }, options || {}));
  const code = res.getResponseCode();
  const body = res.getContentText();
  if (code < 200 || code >= 300) throw new Error('QuickBooks API error ' + code + ': ' + body);
  return JSON.parse(body);
}

/** ======== Queries / helpers ======== */
function qbQuery_(q) {
  const url = qbBaseUrl_() + 'query?query=' + encodeURIComponent(q) + '&minorversion=' + CONFIG.MINOR_VERSION;
  return qbFetch_(url, { method: 'GET' });
}
function listAllAccounts() {
  const data = qbQuery_("select * from Account");
  const rows = [['Id','Name','AccountType','AccountSubType','Active']];
  (data.QueryResponse && data.QueryResponse.Account || []).forEach(a => {
    rows.push([a.Id, a.Name, a.AccountType, a.AccountSubType, a.Active]);
  });
  const sh = SpreadsheetApp.getActive().insertSheet('QB Accounts ' + new Date().toISOString().slice(0,10));
  sh.getRange(1,1,rows.length,rows[0].length).setValues(rows);
  sh.setFrozenRows(1);
}
function showCompanyInfo() {
  const url = qbBaseUrl_() + 'companyinfo/' + ensureRealmId_() + '?minorversion=' + CONFIG.MINOR_VERSION;
  const data = qbFetch_(url, { method: 'GET' });
  const company = (data && data.CompanyInfo) ? data.CompanyInfo : data;
  SpreadsheetApp.getUi().alert('Company Name: ' + (company.CompanyName || '(unknown)'));
}

function findVendorByName_(name) {
  const q = "select * from Vendor where DisplayName = '" + String(name).replace(/'/g, "\\'") + "'";
  const data = qbQuery_(q);
  const arr = (data.QueryResponse && data.QueryResponse.Vendor) || [];
  return arr.length ? arr[0] : null;
}
function ensureVendorId_(displayName) {
  const v = findVendorByName_(displayName);
  if (!v) throw new Error("Vendor not found in QuickBooks: '" + displayName + "'");
  return String(v.Id);
}
function findAccountByName_(name) {
  const q = "select * from Account where Name = '" + String(name).replace(/'/g, "\\'") + "'";
  const data = qbQuery_(q);
  const arr = (data.QueryResponse && data.QueryResponse.Account) || [];
  return arr.length ? arr[0] : null;
}
function ensureAccountIdFromName_(name, purpose) {
  const a = findAccountByName_(name);
  if (!a) throw new Error(purpose + " account not found by name: '" + name + "'");
  return String(a.Id);
}
// Accepts Id (digits) or Name; if blank, uses fallback Name/Id from CONFIG
function getAccountIdFromCell_(cellValue, fallbackName, fallbackId, purpose) {
  const val = (cellValue || '').toString().trim();
  if (val) {
    if (/^\d+$/.test(val)) return val;               // already an Id
    return ensureAccountIdFromName_(val, purpose);   // look up by Name
  }
  if (fallbackId) return String(fallbackId);
  if (fallbackName) return ensureAccountIdFromName_(fallbackName, purpose);
  throw new Error(purpose + ' account is required but missing');
}

/** ======== Mailing Address support (Column G) ======== */
// Parse "123 Main St, Phoenix, AZ 85001" or multiline addresses
function parseMailingAddress_(raw) {
  if (!raw) return null;
  const s = String(raw).replace(/\s*\n+\s*/g, ', ').replace(/\s{2,}/g, ' ').trim();
  const m = s.match(/^(.*?),\s*([^,]+?),\s*([A-Z]{2})\s+(\d{5}(?:-\d{4})?)$/i);
  let line1, city, state, postal;
  if (m) {
    line1 = m[1].trim(); city = m[2].trim(); state = m[3].toUpperCase(); postal = m[4];
  } else {
    const parts = s.split(',').map(p => p.trim()).filter(Boolean);
    if (parts.length >= 3) {
      const last = parts.pop();
      const prev = parts.pop();
      const m2 = (prev + ' ' + last).match(/^(.*)\s+([A-Z]{2})\s+(\d{5}(?:-\d{4})?)$/i);
      if (m2) { city = m2[1].trim(); state = m2[2].toUpperCase(); postal = m2[3]; line1 = parts.join(', '); }
    }
  }
  if (!line1 || !city || !state || !postal) return null;
  return { Line1: line1, City: city, CountrySubDivisionCode: state, PostalCode: postal };
}

// If mailingText is present, update Vendor.BillAddr via sparse update.
function updateVendorAddressIfProvided_(vendorName, mailingText) {
  const text = (mailingText || '').toString().trim();
  if (!text) return; // nothing to do
  const billAddr = parseMailingAddress_(text);
  if (!billAddr) throw new Error('Could not parse Mailing Address (col G). Use "Street, City, ST ZIP".');

  const v = findVendorByName_(vendorName);
  if (!v) throw new Error("Vendor not found for address update: '" + vendorName + "'");

  const same =
    v.BillAddr &&
    String(v.BillAddr.Line1 || '').trim() === billAddr.Line1 &&
    String(v.BillAddr.City || '').trim() === billAddr.City &&
    String(v.BillAddr.CountrySubDivisionCode || '').trim().toUpperCase() === billAddr.CountrySubDivisionCode &&
    String(v.BillAddr.PostalCode || '').trim() === billAddr.PostalCode;

  if (same) return;

  const payload = { sparse: true, Id: v.Id, SyncToken: v.SyncToken || '0', BillAddr: billAddr };
  const url = qbBaseUrl_() + 'vendor?minorversion=' + CONFIG.MINOR_VERSION;
  qbFetch_(url, { method: 'POST', payload: JSON.stringify(payload) });
}

/** ======== Create EXPENSE CHECK (Purchase with PaymentType=Check) ======== */
function cleanAmount_(val) {
  // Accepts $-formatted strings and trims to 2 decimals
  const n = parseFloat(String(val).replace(/[^\d.-]/g, ''));
  if (!isFinite(n) || n <= 0) throw new Error('Invalid Amount (column B)');
  return +n.toFixed(2);
}

function createExpenseCheck_(row) {
  // Payment (bank) account via AccountRef
  const bankId = getAccountIdFromCell_('', CONFIG.BANK_ACCOUNT_NAME, CONFIG.BANK_ACCOUNT_ID, 'Bank');

  // Expense account (from col F or default)
  const expenseId = getAccountIdFromCell_(row.expense, CONFIG.DEFAULT_EXPENSE_ACCOUNT_NAME, CONFIG.DEFAULT_EXPENSE_ACCOUNT_ID, 'Expense');

  // Vendor Id and amount
  const vendorId = ensureVendorId_(String(row.vendor).trim());
  const amount = cleanAmount_(row.amount);

  // For Purchase with PaymentType=Check, specify payment account with AccountRef
  const body = {
    PaymentType: 'Check',
    AccountRef: { value: bankId },                   // payment (bank) account
    EntityRef: { type: 'Vendor', value: vendorId },
    Line: [{
      DetailType: 'AccountBasedExpenseLineDetail',
      Amount: amount,
      Description: String(row.description || row.memo || ''),
      AccountBasedExpenseLineDetail: { AccountRef: { value: expenseId } }
    }],
    PrivateNote: String(row.memo || '')
  };

  const url = qbBaseUrl_() + 'purchase?minorversion=' + CONFIG.MINOR_VERSION;
  const res = qbFetch_(url, { method: 'POST', payload: JSON.stringify(body) });
  return (res && res.Purchase && res.Purchase.Id) ? String(res.Purchase.Id) : '(no id)';
}

/** ======== Sheet helpers & Sync actions ======== */
// Columns: A Vendor | B Amount | C Description | D Memo | E Status | F Expense (Name/Id) | G Mailing Address
function getSelectedRows_() {
  const sh = SpreadsheetApp.getActiveSheet();
  const rng = sh.getActiveRange();
  const start = Math.max(2, rng.getRow());
  const end = rng.getLastRow();
  const rows = [];
  for (let r = start; r <= end; r++) {
    const vendor = sh.getRange(r, 1).getValue();
    const amount = sh.getRange(r, 2).getValue();
    const description = sh.getRange(r, 3).getValue();
    const memo = sh.getRange(r, 4).getValue();
    const status = sh.getRange(r, 5).getValue();
    const expense = sh.getRange(r, 6).getValue();
    const mailing = sh.getRange(r, 7).getValue(); // NEW
    if (!vendor && !amount && !description && !memo && !mailing) continue;
    rows.push({ row: r, vendor, amount, description, memo, status, expense, mailing });
  }
  return rows;
}
function setRowStatus_(row, text) {
  SpreadsheetApp.getActiveSheet().getRange(row, 5).setValue(text); // E
}

function syncSelectedRows() {
  const rows = getSelectedRows_();
  if (!rows.length) {
    SpreadsheetApp.getUi().alert('Select one or more data rows (A–G).');
    return;
  }
  rows.forEach(r => {
    try {
      if (!r.vendor || !r.amount) throw new Error('Vendor and Amount are required.');
      // Update vendor address first if provided
      updateVendorAddressIfProvided_(String(r.vendor).trim(), r.mailing);
      const id = createExpenseCheck_(r);
      setRowStatus_(r.row, 'SYNCED #' + id);
    } catch (e) {
      setRowStatus_(r.row, 'ERROR: ' + String(e).slice(0, 300));
    }
  });
  SpreadsheetApp.getUi().alert('Selected rows processed.');
}

function syncAllPendingRows() {
  const sh = SpreadsheetApp.getActiveSheet();
  const last = sh.getLastRow();
  if (last < 2) {
    SpreadsheetApp.getUi().alert('No data rows found.');
    return;
  }
  for (let r = 2; r <= last; r++) {
    const status = sh.getRange(r, 5).getValue();
    if (status) continue;
    const row = {
      row: r,
      vendor: sh.getRange(r, 1).getValue(),
      amount: sh.getRange(r, 2).getValue(),
      description: sh.getRange(r, 3).getValue(),
      memo: sh.getRange(r, 4).getValue(),
      expense: sh.getRange(r, 6).getValue(),
      mailing: sh.getRange(r, 7).getValue() // NEW
    };
    try {
      if (!row.vendor || !row.amount) {
        setRowStatus_(r, 'SKIPPED: missing Vendor/Amount');
        continue;
      }
      updateVendorAddressIfProvided_(String(row.vendor).trim(), row.mailing);
      const id = createExpenseCheck_(row);
      setRowStatus_(r, 'SYNCED #' + id);
    } catch (e) {
      setRowStatus_(r, 'ERROR: ' + String(e).slice(0, 300));
    }
  }
  SpreadsheetApp.getUi().alert('All pending rows processed.');
}

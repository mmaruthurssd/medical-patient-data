// /**
//  * Menu
//  */
// function onOpen() {
//   SpreadsheetApp.getUi()
//     .createMenu('Access')
//     .addItem('Populate Access for all Sheets', 'populateAccessFromSheetUrls')
//     .addToUi();
// }


/**
 * Access Lister — Sheets-native approach
 * - Reads Google Sheet URLs from the "URL" column header
 * - Writes comma-separated emails (editors + viewers) to the "Access" column
 * - Resolves Drive shortcuts and supports Shared Drives
 *
 * Sheet assumptions:
 *   - Work on sheet named "Copy of Index"
 *   - Header row has "URL" and "Access" (case-insensitive)
 */

function populateAccessFromSheetUrlsTabs() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName("Tab List");
  if (!sh) throw new Error('Sheet "Copy of Index" not found');

  const lastRow = sh.getLastRow();
  if (lastRow < 2) return;

  const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getDisplayValues()[0]
    .map(h => String(h || '').trim().toLowerCase());

  const ssIdCol = headers.indexOf('ss id') + 1;
  const accessCol = headers.indexOf('access (based on internal access)') + 1;

  if (ssIdCol === 0) throw new Error('Header "URL" not found');
  if (accessCol === 0) return; // follow your original behavior: silently exit if no "Access" column

  const ids = sh.getRange(2, ssIdCol, lastRow - 1, 1).getDisplayValues().map(r => (r[0] || '').trim());
  const newUniqueIds = [...new Set(ids)]
  // Logger.log(ids.length)
  // Logger.log(newUniqueIds.length)
  //return
  const out = new Array(ids.length).fill('').map(_ => ['']);


  for (var i = 0; i < newUniqueIds.length; i++) {
    let results = getSpreadsheetEditorsViewersEmails(newUniqueIds[i]);
    
    for(var j=0; j<ids.length; j++){

      if(ids[j]==newUniqueIds[i]){
        out[j][0]=results.join(", ")+", rkhan@ssdspc.com, mm@ssdspc.com, agonzalez@ssdspc.com"
      }
    }
  }

  sh.getRange(2, accessCol, out.length, 1).setValues(out);
  
}



function testGetAccess() {
  const results = getSpreadsheetEditorsViewersEmails("1ZU64Umiv3bHwXq8arr4tJqBLPxUuEG2LeVOvODMuOjw")
  Logger.log(results)
}

/**
 * Return emails (users & groups) that have Editor (writer) or Viewer (reader) access
 * to the given Spreadsheet fileId. Deduped, lowercase, sorted.
 *
 * @param {string} fileId - Spreadsheet ID
 * @return {string[]} emails
 */
function getSpreadsheetEditorsViewersEmails(fileId) {
  const emails = new Set();

  // Fast pass via DriveApp (may miss groups/domain/anyone)
  try {
    const file = withRetry_(() => DriveApp.getFileById(fileId), 'DriveApp.getFileById');
    withRetry_(() => file.getEditors(), 'file.getEditors').forEach(u => {
      const e = safeEmail_(u); if (e) emails.add(e);
    });
    try {
      withRetry_(() => file.getViewers(), 'file.getViewers').forEach(u => {
        const e = safeEmail_(u); if (e) emails.add(e);
      });
    } catch (_) { /* some shared-drive files don't expose viewers here */ }
  } catch (_) { }

  // Authoritative pass via Advanced Drive API v2 (users & groups only)
  try {
    const resp = withRetry_(
      () => Drive.Permissions.list(fileId, {
        supportsAllDrives: true,
        fields: 'items(emailAddress,role,type)'
      }),
      'Drive.Permissions.list'
    );
    (resp.items || []).forEach(p => {
      const role = String(p.role || '').toLowerCase();    // owner|writer|commenter|reader|...
      const type = String(p.type || '').toLowerCase();    // user|group|domain|anyone
      if (!['writer', 'reader'].includes(role)) return;    // editor/viewer only
      if (type === 'user' || type === 'group') {
        const e = String(p.emailAddress || '').toLowerCase();
        if (e) emails.add(e);
      }
    });
  } catch (_) { }

  return Array.from(emails).sort();
}

/* ---------- helpers ---------- */

function safeEmail_(user) {
  try {
    const e = user && user.getEmail && user.getEmail();
    return e ? String(e).toLowerCase() : '';
  } catch (_) { return ''; }
}

/** Minimal exponential backoff for transient Drive/Sheets errors */
function withRetry_(fn, label = 'op', maxTries = 5) {
  let wait = 400, lastErr;
  for (let i = 1; i <= maxTries; i++) {
    try { return fn(); } catch (e) {
      lastErr = e;
      const msg = String(e && e.message || '').toLowerCase();
      const retryable = msg.includes("we're sorry, a server error occurred")
        || msg.includes('internal error') || msg.includes('service unavailable')
        || msg.includes('backend error') || msg.includes('quota')
        || msg.includes('rate limit') || msg.includes('http 5');
      if (!retryable || i === maxTries) throw e;
      Utilities.sleep(wait + Math.floor(Math.random() * 200));
      wait = Math.min(wait * 2, 8000);
    }
  }
  // Shouldn't reach here
  throw lastErr;
}



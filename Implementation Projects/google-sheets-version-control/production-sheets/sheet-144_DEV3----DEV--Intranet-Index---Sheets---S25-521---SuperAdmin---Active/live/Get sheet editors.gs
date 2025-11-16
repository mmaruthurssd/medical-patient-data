/**
 * Menu
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Access')
    .addItem('Populate Access for all Sheets', 'populateAccessFromSheetUrls')
    .addToUi();
}


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

function populateAccessFromSheetUrls() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName("Index");
  if (!sh) throw new Error('Sheet "Copy of Index" not found');

  const lastRow = sh.getLastRow();
  if (lastRow < 2) return;

  const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getDisplayValues()[0]
    .map(h => String(h || '').trim().toLowerCase());

  const urlCol = headers.indexOf('url') + 1;
  const accessCol = headers.indexOf('access') + 1;

  if (urlCol === 0) throw new Error('Header "URL" not found');
  if (accessCol === 0) return; // follow your original behavior: silently exit if no "Access" column

  const urls = sh.getRange(2, urlCol, lastRow - 1, 1).getDisplayValues().map(r => (r[0] || '').trim());
  const out = new Array(urls.length).fill('').map(_ => ['']);

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    if (!url) { out[i][0] = ''; continue; }

    // Only handle Google Sheets links
    if (!/docs\.google\.com\/spreadsheets/i.test(url)) {
      out[i][0] = '#NOT_A_SHEET_LINK';
      continue;
    }

    const rawId = extractFileIdFromUrl_(url);
    if (!rawId) { out[i][0] = '#INVALID_URL'; continue; }

    // Resolve shortcut → target fileId (supports Shared Drives)
    const fileId = resolveShortcutTargetId_(rawId);

    try {
      const emails = getSheetEditorsViewersEmails_(fileId); // SpreadsheetApp-based
      out[i][0] = emails.length ? emails.join(', ') : '';
    } catch (e) {
      const msg = String(e && e.message || e);
      if (/You do not have permission|No item with the given ID|cannot find/i.test(msg)) {
        out[i][0] = '#NO ACCESS or NOT FOUND';
      } else {
        out[i][0] = `#ERROR: ${msg}`;
      }
    }
  }

  sh.getRange(2, accessCol, out.length, 1).setValues(out);
}

/**
 * Sheets-native: open the spreadsheet and read editors/viewers.
 * (Does NOT use Drive.Permissions.list.)
 */
function getSheetEditorsViewersEmails_(fileId) {
  const spr = SpreadsheetApp.openById(fileId);
  const emails = new Set();

  // Editors
  spr.getEditors().forEach(u => {
    const e = (u && u.getEmail && u.getEmail()) ? u.getEmail().toLowerCase() : '';
    if (e) emails.add(e);
  });

  // Viewers
  spr.getViewers().forEach(u => {
    const e = (u && u.getEmail && u.getEmail()) ? u.getEmail().toLowerCase() : '';
    if (e) emails.add(e);
  });

  return Array.from(emails).sort();
}

/**
 * Resolve Drive shortcuts; if not a shortcut, returns the original id.
 * Uses Advanced Drive *Files.get* only (with supportsAllDrives).
 */
function resolveShortcutTargetId_(fileId) {
  try {
    const meta = Drive.Files.get(fileId, {
      fields: 'id,mimeType,shortcutDetails(targetId)',
      supportsAllDrives: true
    });
    if (meta && meta.mimeType === 'application/vnd.google-apps.shortcut' &&
        meta.shortcutDetails && meta.shortcutDetails.targetId) {
      return meta.shortcutDetails.targetId;
    }
    return fileId;
  } catch (e) {
    // If metadata isn’t readable for some reason, fall back to original id.
    return fileId;
  }
}

/**
 * Extract file ID from common Google Sheets URL formats.
 */
function extractFileIdFromUrl_(url) {
  // https://docs.google.com/spreadsheets/d/FILE_ID/edit#gid=0
  let m = url.match(/spreadsheets\/d\/([a-zA-Z0-9-_]+)/i);
  if (m && m[1]) return m[1];

  // open?id=... or uc?id=...
  m = url.match(/[?&]id=([a-zA-Z0-9-_]{20,})/i);
  if (m && m[1]) return m[1];

  // Fallback: any 25+ char token
  m = url.match(/([a-zA-Z0-9-_]{25,})/);
  return m ? m[1] : '';
}

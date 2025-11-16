/**
 * Sync checked hyperlinks from Source → Destination, deduping by FILE ID.
 * - Column L: checkboxes (TRUE = include)
 * - Column M: rich-text with a Google Sheets hyperlink
 * - Destination gets [Text, URL], skipping rows whose file ID already exists.
 *
 * Configure the sheet names below.
 */
const CONFIG = {
  sourceSheetName: '',             // '' = use active sheet; or put a name e.g. 'Leads'
  destSheetName: 'Collected Links',
  headerRow: 1,
  startRow: 2,                     // first data row
  projectCol: 8,
  checkboxCol: 12,                 // L
  richTextCol: 13,                 // M
  destCols: { text: 1, url: 2 },   // A=Text, B=URL (we dedupe by ID internally)
  // Optional: also store the extracted file ID in column C (set to 3) or null to skip
  destFileIdCol: null              // e.g. 3 to store File ID as well
};

function syncCheckedLinks() {
  const ss = SpreadsheetApp.getActive();
  const src = ss.getActiveSheet();
  if (!src) throw new Error('Source sheet not found.');

  //const headers = CONFIG.destFileIdCol ? ['Text', 'URL', 'File ID'] : ['Text', 'URL'];
  const destSS = SpreadsheetApp.openById("1FiY_BJMVV1vuG1ZVNrGwNjrNZ1VEzsDnFUlRmwaNYIE")
  const dest = destSS.getSheetByName("Index")

  const lastRow = src.getLastRow();
  if (lastRow < CONFIG.startRow) return; // nothing to do


  const numRows = lastRow - CONFIG.startRow + 1;

  // Read data in one go
  const checks = src.getRange(CONFIG.startRow, CONFIG.checkboxCol, numRows, 1).getValues();
  const rich = src.getRange(CONFIG.startRow, CONFIG.richTextCol, numRows, 1).getRichTextValues();
  const project = src.getRange(CONFIG.startRow, CONFIG.projectCol, numRows, 1).getValues();

  // Build a Set of existing FILE IDs in destination (trimmed).
  const existingIds = new Set();
  const destLastRow = dest.getLastRow();
  if (destLastRow >= CONFIG.startRow) {
    const rows = destLastRow - CONFIG.headerRow;
    // Read the URL column, extract IDs, and add to Set
    const urlValues = dest.getRange(CONFIG.startRow, CONFIG.destCols.url, rows, 1).getValues();
    for (const [u] of urlValues) {
      const id = extractDriveId_(String(u || '').trim());
      if (id) existingIds.add(id);
    }
    // If we also store File ID explicitly, merge those too
    // if (CONFIG.destFileIdCol) {
    //   const idValues = dest.getRange(CONFIG.startRow, CONFIG.destFileIdCol, rows, 1).getValues();
    //   for (const [id] of idValues) {
    //     if (id) existingIds.add(String(id).trim());
    //   }
    // }
  }

  const rowsToAppend = [];


  for (let i = 0; i < numRows; i++) {
    // If you use custom checkbox values, replace with:
    // const checked = src.getRange(CONFIG.startRow + i, CONFIG.checkboxCol).isChecked() === true;
    const checked = checks[i][0] === true || checks[i][0]=="TRUE";
    if (!checked) continue;

    const rt = rich[i][0];
    if (!rt) continue;

    //const text = (rt.getText() || '').trim();
    //if (!text) continue;
    const text = project[i][0]

    const url = extractFirstLinkFromRichText_(rt);
    if (!url) continue;

    const fileId = extractDriveId_(url);
    if (!fileId) continue; // not a recognizable Sheets/Drive file link


    if (existingIds.has(fileId)) continue; // already recorded (by ID)

    // Append row; optionally include File ID
    // if (CONFIG.destFileIdCol) {
    //   rowsToAppend.push([text, url, fileId]);
    // } else {
    rowsToAppend.push([text, url]);
    // }
    existingIds.add(fileId);
  }

  if (rowsToAppend.length) {
    const writeRow = Math.max(dest.getLastRow() + 1, CONFIG.startRow);
    const writeCols = CONFIG.destFileIdCol ? 3 : 2;
    dest.getRange(writeRow, 1, rowsToAppend.length, writeCols).setValues(rowsToAppend);
  }
}

/** ========== Helpers ========== */

/**
 * Get or create a sheet by name; if created, seed a header row.
 */
function getOrCreateSheet_(ss, name, header = []) {
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    if (header.length) {
      sh.getRange(CONFIG.headerRow, 1, 1, header.length).setValues([header]);
      sh.setFrozenRows(CONFIG.headerRow);
    }
  } else if (sh.getLastRow() === 0 && header.length) {
    sh.getRange(CONFIG.headerRow, 1, 1, header.length).setValues([header]);
    sh.setFrozenRows(CONFIG.headerRow);
  } else if (header.length && sh.getLastRow() >= CONFIG.headerRow) {
    // Ensure header exists if the sheet was empty or wrongly set
    const existingHeader = sh.getRange(CONFIG.headerRow, 1, 1, header.length).getValues()[0];
    const needsHeader = existingHeader.every(v => !v);
    if (needsHeader) {
      sh.getRange(CONFIG.headerRow, 1, 1, header.length).setValues([header]);
      sh.setFrozenRows(CONFIG.headerRow);
    }
  }
  return sh;
}

/**
 * Extract the first hyperlink URL from a RichTextValue.
 * Handles full-cell link or the first linked run.
 */
function extractFirstLinkFromRichText_(rt) {
  let url = rt.getLinkUrl();
  if (url) return String(url).trim();
  const runs = rt.getRuns();
  for (let r = 0; r < runs.length; r++) {
    const u = runs[r].getLinkUrl();
    if (u) return String(u).trim();
  }
  return null;
}

/**
 * Extract a Google Drive FILE ID from common Sheets/Drive URL shapes.
 * Returns null if not recognized.
 *
 * Supported examples:
 * - https://docs.google.com/spreadsheets/d/<ID>/edit#gid=0
 * - https://drive.google.com/file/d/<ID>/view
 * - https://drive.google.com/open?id=<ID>
 * - https://docs.google.com/spreadsheets/u/0/d/<ID>/copy
 */
function extractDriveId_(url) {
  if (!url) return null;
  const s = String(url).trim();

  // /d/<ID>/ pattern (Docs/Sheets/Drive file links)
  const m1 = s.match(/\/d\/([a-zA-Z0-9_-]{15,})/);
  if (m1 && m1[1]) return m1[1];

  // open?id=<ID> pattern
  const m2 = s.match(/[?&]id=([a-zA-Z0-9_-]{15,})/);
  if (m2 && m2[1]) return m2[1];

  // Fallback: sometimes links come without trailing path; try last path segment
  try {
    const u = new URL(s);
    const parts = u.pathname.split('/').filter(Boolean);
    // e.g., ['spreadsheets', 'd', '<ID>'] or ['file', 'd', '<ID>']
    const dIdx = parts.indexOf('d');
    if (dIdx >= 0 && parts[dIdx + 1]) {
      const candidate = parts[dIdx + 1];
      if (/^[a-zA-Z0-9_-]{15,}$/.test(candidate)) return candidate;
    }
  } catch (e) {
    // ignore parse errors; return null below
  }

  return null;
}

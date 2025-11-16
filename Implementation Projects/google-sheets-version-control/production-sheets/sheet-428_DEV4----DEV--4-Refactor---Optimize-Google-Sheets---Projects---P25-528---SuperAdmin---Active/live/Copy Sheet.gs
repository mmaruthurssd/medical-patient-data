/**
 * Make [DEV] copies from hyperlinked spreadsheet URLs in column B.
 * - If column F has a value, skips the row.
 * - Writes original spreadsheet ID to column D.
 * - Writes copied spreadsheet hyperlink to column F.
 * - Writes copied spreadsheet ID to column H.
 *
 * Assumptions:
 * - Row 1 is headers.
 * - Process current sheet.
 */
function makeDevCopiesFromColB() {
  const ss = SpreadsheetApp.getActive();
  const sh = ss.getActiveSheet();

  const HEADER_ROW = 1;
  const COL_B = 2; // source hyperlink
  const COL_C = 3; // original ID
  const COL_F = 6; // new copy hyperlink
  const COL_I = 7; // new copy ID

  const lastRow = sh.getLastRow();
  if (lastRow <= HEADER_ROW) return;

  // Read needed columns in one shot for speed
  const range = sh.getRange(HEADER_ROW + 1, 1, lastRow - HEADER_ROW, 7); // A:H
  const values = range.getValues();
  const richValues = sh.getRange(HEADER_ROW + 1, COL_B, lastRow - HEADER_ROW, 1).getRichTextValues(); // B only

  for (let i = 0; i < values.length; i++) {
    const rowIndex = HEADER_ROW + 1 + i;
    const fValue = values[i][COL_F - 1]; // 0-based index for column F in values row
    if (fValue) continue; // already has a copy → skip

    // Extract URL from rich text in column B
    const bRich = richValues[i][0];
    const sourceUrl = getFirstUrlFromRichText_(bRich);
    if (!sourceUrl) continue; // no link → skip

    // Extract original spreadsheet ID
    const originalId = extractSpreadsheetIdFromUrl_(sourceUrl);
    if (!originalId) continue;

    // Write original ID to column C
    sh.getRange(rowIndex, COL_C).setValue(originalId);

    // Make a copy named "[DEV] <original name>" in the same parent folder (if any)
    let newFile, newId, newUrl;
    try {
      const file = DriveApp.getFileById(originalId);
      const originalName = file.getName();
      const devName = prefixDev_(originalName);

      // Put copy in the first parent if available; otherwise default to Drive root.
      const parents = file.getParents();
      if (parents.hasNext()) {
        const parent = parents.next();
        newFile = file.makeCopy(devName, parent);
      } else {
        newFile = file.makeCopy(devName);
      }

      newId = newFile.getId();
      newUrl = `https://docs.google.com/spreadsheets/d/${newId}/edit`;

      // Write new copy hyperlink to column F
      const rt = SpreadsheetApp.newRichTextValue()
        .setText(devName)
        .setLinkUrl(newUrl)
        .build();
      sh.getRange(rowIndex, COL_F).setRichTextValue(rt);

      // Write new copy ID to column I
      sh.getRange(rowIndex, COL_I).setValue(newId);

    } catch (err) {
      // Optional: log error to a column or Logger
      Logger.log(`Row ${rowIndex} — Copy failed: ${err}`);
      // You could also write an error note:
      sh.getRange(rowIndex, COL_F).setNote(`Copy failed: ${err && err.message ? err.message : err}`);
    }

    if(i==200){
      break
    }
  }
}

/**
 * Extract first URL from a RichTextValue (whole-cell link or the first run with a link).
 */
function getFirstUrlFromRichText_(richTextValue) {
  if (!richTextValue) return null;

  // Whole-cell link
  const whole = richTextValue.getLinkUrl && richTextValue.getLinkUrl();
  if (whole) return whole;

  // Scan runs
  const runs = richTextValue.getRuns ? richTextValue.getRuns() : [];
  for (let i = 0; i < runs.length; i++) {
    const u = runs[i].getLinkUrl && runs[i].getLinkUrl();
    if (u) return u;
  }
  return null;
}

/**
 * Extract Google Sheets file ID from typical URLs.
 * Supports:
 *  - https://docs.google.com/spreadsheets/d/<ID>/...
 *  - https://docs.google.com/open?id=<ID>
 *  - https://drive.google.com/open?id=<ID>
 *  - https://drive.google.com/file/d/<ID>/view
 */
function extractSpreadsheetIdFromUrl_(url) {
  if (!url) return null;

  // /spreadsheets/d/<ID>
  let m = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (m && m[1]) return m[1];

  // /open?id=<ID>
  m = url.match(/[?&]id=([a-zA-Z0-9-_]+)/);
  if (m && m[1]) return m[1];

  // /file/d/<ID> (sometimes people link Drive file view)
  m = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
  if (m && m[1]) return m[1];

  return null;
}

/**
 * Prefix name with "[DEV] " (avoid double-prefixing).
 */
function prefixDev_(name) {
  const prefix = "[DEV] 4 ";
  return name && name.startsWith(prefix) ? name : `${prefix}${name || ""}`;
}

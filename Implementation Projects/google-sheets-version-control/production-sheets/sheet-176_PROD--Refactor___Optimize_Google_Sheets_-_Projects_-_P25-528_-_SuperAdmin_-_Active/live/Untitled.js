/**
 * Entry point: creates [DEV] copies for spreadsheet URLs in column A
 * and writes a hyperlink to column C (skips rows where C is already filled).
 */
function createDevCopies() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return; // nothing to do

  // Read columns A..C (URL, [unused], Output link)
  const rows = sheet.getRange(2, 1, lastRow - 1, 3).getValues();

  // We’ll write RichText to column C so we can set link + label
  const richOut = [];

  for (let i = 0; i < rows.length; i++) {
    const urlA = (rows[i][0] || "").toString().trim();
    const existingC = (rows[i][2] || "").toString().trim();

    // Skip if column C already has a value or A is empty
    if (!urlA || existingC) {
      // Preserve current C (blank or existing). Build a plain RichText to keep lengths consistent.
      // const keep = SpreadsheetApp.newRichTextValue()
      //   .setText(existingC)
      //   .build();
      // richOut.push([keep]);
      continue;
    }

    try {
      const fileId = extractId_(urlA);
      if (!fileId) throw new Error("Could not parse Spreadsheet ID from URL.");

      const file = DriveApp.getFileById(fileId);
      const originalName = file.getName();
      const devName = buildDevName_(originalName);

      // Copy into the same parent folder (fallback to root if none)
      //const parent = getFirstParentFolder_(file);
      const copy = file.makeCopy(devName)

      const copyUrl = "https://docs.google.com/spreadsheets/d/" + copy.getId() + "/edit";
      const rt = SpreadsheetApp.newRichTextValue()
        .setText(devName)
        .setLinkUrl(copyUrl)
        .build();

      //richOut.push([rt]);
      sheet.getRange(i+2, 3, 1, 1).setRichTextValue(rt);
    } catch (err) {
      Logger.log(err)
      // Write the error text (no link)
      // const rtErr = SpreadsheetApp.newRichTextValue()
      //   .setText("ERROR: " + err.message)
      //   .build();
      // richOut.push([rtErr]);
    }
  }

  // Write results to Column C (row 2 downward)
  // if (richOut.length) {
  //   sheet.getRange(2, 3, richOut.length, 1).setRichTextValues(richOut);
  // }
}

/** ===== Helpers (hidden in GAS "Run" menu by trailing underscore) ===== */

/** Extracts a Google file ID from a URL (handles most Drive/Sheets formats). */
function extractId_(url) {
  // Common patterns:
  // https://docs.google.com/spreadsheets/d/<ID>/edit
  // https://drive.google.com/file/d/<ID>/view
  // https://drive.google.com/open?id=<ID>
  // https://drive.google.com/uc?id=<ID>
  const patterns = [
    /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/,
    /\/file\/d\/([a-zA-Z0-9-_]+)/,
    /[?&]id=([a-zA-Z0-9-_]+)/,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m && m[1]) return m[1];
  }
  return null;
}

/** Builds the copy name: "[DEV] <Original Name>" (avoids double-prefixing). */
function buildDevName_(originalName) {
  const prefix = "[DEV] ";
  if (originalName.startsWith(prefix)) return originalName; // already DEV
  return prefix + originalName;
}

/** Returns the first parent folder of the file, or the user's root folder as a fallback. */
function getFirstParentFolder_(file) {
  const parents = file.getParents();
  if (parents.hasNext()) return parents.next();
  // Fallback (e.g., if no parent is found or in edge cases)
  return DriveApp.getRootFolder();
}

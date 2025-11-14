




/**
 * When a checkbox in column C is checked:
 * - If column E already links to a Google Doc, rename that Doc to "A - B" (or "A B" if one is empty).
 * - Otherwise, create a new Google Doc with that name and put a rich-text link to it in column E.
 */
function onEditInstall(e) {

  onEditSort(e)
  try {
    if (!e || !e.range || e.range.getSheet().isSheetHidden()) return;

    const range = e.range;
    const sheet = range.getSheet();

    if (sheet.getName() != "Google Sheets") return

    // Only react to single-cell edits in Column C (checkboxes) that are set to TRUE
    if (range.getColumn() !== 3 || range.getNumRows() !== 1 || range.getNumColumns() !== 1) return;
    if (e.value !== 'TRUE') return;

    const row = range.getRow();
    if (row === 1) return; // skip header row (adjust if your headers are elsewhere)

    // Read A, B for the name; E for existing link
    const colA = sheet.getRange(row, 1).getDisplayValue().trim().split(" -")[0];
    const colB = sheet.getRange(row, 2).getDisplayValue().trim();
    const name = buildDocName_(colA, colB);
    if (!name) {
      // No usable name; bail safely
      SpreadsheetApp.getActive().toast('Doc name is empty (columns A & B).', 'No Action', 3);
      return;
    }

    const linkCell = sheet.getRange(row, 5); // Column E
    const existingDocId = getGoogleDocIdFromRichTextCell_(linkCell);

    Logger.log(existingDocId)

    if (existingDocId) {
      // Rename existing doc
      DriveApp.getFileById(existingDocId).setName(name);
      // Refresh the rich text link text to reflect the new name
      const docUrl = 'https://docs.google.com/document/d/' + existingDocId + '/edit';
      setRichLink_(linkCell, name, docUrl);
    } else {
      // Create a new doc
      const doc = DocumentApp.create(name);
      const outputFolder = DriveApp.getFolderById("1SpKksDFpmdxmPc6Ou4aAR8qfjdqm2pqs");
      DriveApp.getFileById(doc.getId()).moveTo(outputFolder)
      const docUrl = doc.getUrl();
      setRichLink_(linkCell, name, docUrl);
    }

    // Optional: keep the checkbox checked; do nothing else.
    // If you prefer to uncheck after action, uncomment the next line:
    sheet.getRange(row, 3).setValue(false);

  } catch (err) {
    // Non-blocking notification
    SpreadsheetApp.getActive().toast('Error: ' + err, 'onEdit', 5);
  }
}

/**
 * Build the document name from A and B.
 * Examples:
 *  - A="Alpha", B="Beta"   → "Alpha - Beta"
 *  - A="Alpha", B=""       → "Alpha"
 *  - A="", B="Beta"        → "Beta"
 *  - both empty            → ""
 */
function buildDocName_(a, b) {
  if (a && b) return a + ' - ' + b;
  if (a) return a;
  if (b) return b;
  return '';
}

/**
 * Write a single-run rich text value with a hyperlink to the target URL.
 */
function setRichLink_(cell, text, url) {
  const rich = SpreadsheetApp.newRichTextValue()
    .setText(text)
    .setLinkUrl(url)
    .build();
  cell.setRichTextValue(rich);
}


/**
 * Simple: get a Google Doc ID from a cell.
 * Works if the cell has a rich-text link OR a plain text URL OR a HYPERLINK() formula.
 */
function getGoogleDocIdFromRichTextCell_(cell) {
  // Try rich-text link first
  let url = '';
  const rtv = cell.getRichTextValue();
  if (rtv && rtv.getLinkUrl()) {
    url = rtv.getLinkUrl();
  } else {
    // If it's a HYPERLINK() formula, extract the URL part
    const formula = cell.getFormula();
    const m = formula && formula.match(/HYPERLINK\("([^"]+)"/i);
    if (m) {
      url = m[1];
    } else {
      // Fall back to whatever is visible in the cell (in case it's a pasted URL)
      url = cell.getDisplayValue();
    }
  }

  if (!url) return null;

  // One regex to rule them all: handles .../document/d/<ID> and ...?id=<ID>
  const match = url.match(/(?:\/d\/|[\?&]id=)([a-zA-Z0-9_-]{10,})/);
  return match ? match[1] : null;
}




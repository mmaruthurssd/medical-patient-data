/**
 * Mail-merge many rows into ONE Google Doc by appending a fresh copy
 * of the template body for each row, then replacing placeholders only
 * within that newly appended section.
 *
 * Placeholders look like: <<Header Name>> (must match sheet headers).
 */

const CFG = {
  TEMPLATE_DOC_ID: 'PUT_TEMPLATE_DOC_ID_HERE',
  SHEET_ID: null,                // null = use active spreadsheet
  SHEET_NAME: 'Sheet1',
  OUTPUT_FOLDER_ID: null,        // optional: put the master file into a folder
  MASTER_DOC_NAME: 'Mail Merge - Combined Output',
  PLACEHOLDER_WRAP: ['<<', '>>'],
  INSERT_PAGE_BREAK_BETWEEN: true,
  SKIP_BLANK_ROWS: true
};

function mergeRowsIntoOneDoc_NoTemps() {
  // Open sheet
  const ss = CFG.SHEET_ID ? SpreadsheetApp.openById(CFG.SHEET_ID)
                          : SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CFG.SHEET_NAME);
  if (!sheet) throw new Error(`Sheet "${CFG.SHEET_NAME}" not found.`);
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) throw new Error('Need headers + at least one data row.');

  const headers = values[0].map(String);
  const rows = values.slice(1);

  // Create master doc as a *copy* of template so header/footer & styles carry over.
  const masterDoc = createMasterFromTemplate_(CFG.TEMPLATE_DOC_ID, CFG.MASTER_DOC_NAME, CFG.OUTPUT_FOLDER_ID);
  const masterBody = masterDoc.getBody();

  // We’ll clear the body so we start from a blank document that still keeps header/footer.
  clearBody_(masterBody);

  // Open template once; we’ll clone its body for each row.
  const templateDoc = DocumentApp.openById(CFG.TEMPLATE_DOC_ID);
  const templateBody = templateDoc.getBody();

  let count = 0;

  rows.forEach((row, idx) => {
    if (CFG.SKIP_BLANK_ROWS && row.every(v => String(v).trim() === '')) return;

    // Optionally insert a page break between records (not before the first).
    if (count > 0 && CFG.INSERT_PAGE_BREAK_BETWEEN) {
      masterBody.appendPageBreak();
    }

    // 1) Append a fresh copy of the template's body content
    const { startChildIndex, endChildIndex } = appendTemplateSection_(templateBody, masterBody);

    // 2) Build replacements for this row
    const replaceMap = buildReplaceMap_(headers, row, CFG.PLACEHOLDER_WRAP);

    // 3) Replace placeholders ONLY within the newly appended section
    replaceInChildRange_(masterBody, startChildIndex, endChildIndex, replaceMap);

    count++;
  });

  masterDoc.saveAndClose();
  SpreadsheetApp.getActive().toast(`Done! Merged ${count} record(s).\n${masterDoc.getUrl()}`);
  Logger.log(`Merged ${count} record(s) into: ${masterDoc.getUrl()}`);
}

/* ----------------- Helpers ----------------- */



// Remove all children from a Body (keeps header/footer of doc).
function clearBody_(body) {
  for (let i = body.getNumChildren() - 1; i >= 0; i--) {
    body.removeChild(body.getChild(i));
  }
}



function buildReplaceMap_(headers, row, wrap) {
  const map = {};
  const [pre, post] = wrap;
  headers.forEach((h, i) => {
    const key = pre + h + post;
    map[key] = valueToText_(row[i]);
  });
  return map;
}

function valueToText_(v) {
  if (v === null || v === undefined) return '';
  if (v instanceof Date) {
    return v.toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: 'numeric' });
  }
  return String(v);
}

// Escape regex metachars so replaceText treats placeholder literally
function escapeForRegex_(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Replace placeholders ONLY within [startChildIndex, endChildIndex) in the body
function replaceInChildRange_(body, startChildIndex, endChildIndex, replaceMap) {
  for (let i = startChildIndex; i < endChildIndex; i++) {
    const child = body.getChild(i);
    replaceInElementRecursive_(child, replaceMap);
  }
}

// Deep-walk an element tree and call replace on every Text-holding node
function replaceInElementRecursive_(el, replaceMap) {
  // If element has editable text (Paragraph/ListItem/TableCell often do),
  // we’ll still recurse, but when we hit TEXT nodes we do the actual replacement.
  if (el.getNumChildren && typeof el.getNumChildren === 'function') {
    for (let i = 0; i < el.getNumChildren(); i++) {
      replaceInElementRecursive_(el.getChild(i), replaceMap);
    }
  }

  // TEXT nodes (and many element types exposing editAsText) can be replaced directly.
  try {
    const asText = el.editAsText?.();
    if (asText) {
      Object.entries(replaceMap).forEach(([needle, repl]) => {
        asText.replaceText(escapeForRegex_(needle), repl ?? '');
      });
    }
  } catch (e) {
    // Some elements don’t support editAsText; ignore.
  }
}

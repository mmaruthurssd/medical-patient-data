/**** CONFIG ****/
const SHEETS = {
  SOURCE: 'Source Data',
  RAW: 'Invoices',
  CONFIG: 'Config',
};

const TEXT_PARTIAL_THRESHOLD = 0.8;     // 0..1 (Dice coefficient on tokens)
const MAX_CANDIDATES_TO_SCORE = 50000;  // guard-rail for very large source sheets

/**** MENU ****/
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Match')
    .addItem('Run Matching', 'runMatching')
    .addSeparator()
    .addItem('Build Config Dropdowns (optional)', 'buildConfigDropdowns')
    .addToUi();
}

/**** ENTRYPOINT ****/
function runMatching() {
  const ss = SpreadsheetApp.getActive();
  const src = ss.getSheetByName(SHEETS.SOURCE);
  const raw = ss.getSheetByName(SHEETS.RAW);
  const cfg = ss.getSheetByName(SHEETS.CONFIG);

  if (!src || !raw || !cfg) {
    throw new Error(`Missing required sheets. Ensure "${SHEETS.SOURCE}", "${SHEETS.RAW}", and "${SHEETS.CONFIG}" exist.`);
  }

  const source = readTable(src);
  const rawTbl = readTable(raw);
  const rules = readRules(cfg, rawTbl.headers, source.headers);

  if (rules.length === 0) {
    throw new Error('No valid rules found in Config. Add at least one mapping row.');
  }

  // Prepare output columns on RAW (create headers "Matched: <SourceHeader>")
  const outStartCol = rawTbl.headers.length + 1;
  ensureOutputHeaders_(raw, outStartCol, rules.map(r => `Matched: ${r.sourceHeader}`));

  // Build fast header -> index maps
  const sourceIdx = indexRowsByHeader(source);
  const rawIdx = indexRowsByHeader(rawTbl);

  // Precompute typed source rows for speed
  const typedSourceRows = source.rows.map(row => applyTypesToRow(row, source.headers, rules));

  // Iterate raw rows, find best match, write outputs
  const outValues = Array(rawTbl.rows.length).fill(null).map(() => Array(rules.length).fill(''));

  const limit = Math.min(typedSourceRows.length, MAX_CANDIDATES_TO_SCORE);
  for (let i = 0; i < rawTbl.rows.length; i++) {
    const rawRow = rawTbl.rows[i];
    const typedRaw = applyTypesToRow(rawRow, rawTbl.headers, rules);

    let best = { score: -1, row: null };
    for (let j = 0; j < limit; j++) {
      const srcRow = typedSourceRows[j];

      const res = evaluateRules(typedRaw, srcRow, rules);
      if (!res.passes) continue;

      // Use accumulated similarity for Partial fields as tiebreaker, exact/range yield 1.0
      if (res.score > best.score) best = { score: res.score, row: source.rows[j] };
    }

    if (best.row) {
      // write source values for the configured source columns
      for (let k = 0; k < rules.length; k++) {
        const sCol = rules[k].sourceHeader;
        const val = best.row[sourceIdx.headerToIndex[sCol]];
        outValues[i][k] = val;
      }
    }
  }

  // Commit results
  if (outValues.length) {
    raw.getRange(2, outStartCol, outValues.length, outValues[0].length).setValues(outValues);
  }
}

/**** CORE MATCHING ****/
function evaluateRules(typedRaw, typedSrc, rules) {
  let score = 0;
  for (const r of rules) {
    const a = typedRaw[r.rawHeader];
    const b = typedSrc[r.sourceHeader];

    // Empty handling: if raw cell is blank, treat as non-blocking (skip rule)
    if (a === '' || a === null || typeof a === 'undefined') continue;

    if (r.condition === 'Exactly') {
      const pass = equalsByType(a, b, r.type);
      if (!pass) return { passes: false, score: -1 };
      score += 1.0;
    } else if (r.condition === 'Partial') {
      if (r.type !== 'Text') return { passes: false, score: -1 };
      const sim = textSimilarity(String(a), String(b));
      if (sim < TEXT_PARTIAL_THRESHOLD) return { passes: false, score: -1 };
      score += sim; // reward closer matches
    } else if (r.condition === 'Range') {
      const pass = inRangeByType(a, b, r.type, r.range);
      if (!pass) return { passes: false, score: -1 };
      score += 1.0;
    } else {
      return { passes: false, score: -1 };
    }
  }
  return { passes: true, score };
}

/**** RULES & TYPES ****/
function readRules(cfgSheet, rawHeaders, sourceHeaders) {
  const values = cfgSheet.getDataRange().getDisplayValues();
  if (values.length < 2) return [];

  const rules = [];
  for (let i = 1; i < values.length; i++) {
    const [rawHeader, sourceHeader, type, condition, startRange, endRange] = values[i];

    if (!rawHeader || !sourceHeader || !type || !condition) continue;
    if (!rawHeaders.includes(rawHeader)) continue;
    if (!sourceHeaders.includes(sourceHeader)) continue;

    const t = normalizeType_(type);
    const c = normalizeCondition_(condition);

    let range = { nMinus: null, nPlus: null };
    if (c === 'Range') {
      const n1 = parseFloat(startRange || ''); // can be days or number tolerance
      const n2 = parseFloat(endRange || '');
      const tol = maxDefined_(n1, n2);
      if (!isFinite(tol)) {
        // treat empty as 0 tolerance (exact)
        range = { nMinus: 0, nPlus: 0 };
      } else {
        range = { nMinus: Math.abs(tol), nPlus: Math.abs(tol) };
      }
    }

    rules.push({
      rawHeader,
      sourceHeader,
      type: t,                      // 'Text' | 'Number' | 'Date'
      condition: c,                 // 'Exactly' | 'Partial' | 'Range'
      range,                        // {nMinus, nPlus} interpreted as days for Date, as numeric tolerance for Number
    });
  }
  return rules;
}

function normalizeType_(s) {
  const x = (s || '').toString().trim().toLowerCase();
  if (x === 'text') return 'Text';
  if (x === 'number') return 'Number';
  if (x === 'date') return 'Date';
  throw new Error(`Unknown Data Type: ${s}`);
}

function normalizeCondition_(s) {
  const x = (s || '').toString().trim().toLowerCase();
  if (x === 'exactly' || x === 'exact') return 'Exactly';
  if (x === 'partial') return 'Partial';
  if (x === 'range') return 'Range';
  throw new Error(`Unknown Matching Condition: ${s}`);
}

function applyTypesToRow(rowObj, headers, rules) {
  // Only coerce fields that appear in the rules to avoid extra parsing
  const out = Object.create(null);
  for (const h of headers) out[h] = rowObj[headers.indexOf(h)];

  for (const r of rules) {
    // coerce both raw/source headers if present in this row
    for (const hdr of [r.rawHeader, r.sourceHeader]) {
      if (!(hdr in out)) continue;
      const v = out[hdr];
      if (r.type === 'Number') {
        out[hdr] = coerceNumber(v);
      } else if (r.type === 'Date') {
        out[hdr] = coerceDate(v); // JS Date or null
      } else {
        out[hdr] = v == null ? '' : String(v);
      }
    }
  }
  return out;
}

/**** TYPE HELPERS ****/
function equalsByType(a, b, type) {
  if (type === 'Text') return normalizeText(a) === normalizeText(b);
  if (type === 'Number') {
    const na = coerceNumber(a), nb = coerceNumber(b);
    if (!isFinite(na) || !isFinite(nb)) return false;
    const EPS = 1e-9; // handles tiny float differences (e.g., 10.2 vs 10.2000000001)
    return Math.abs(na - nb) <= EPS;
  }
  if (type === 'Date') return isValidDate(a) && isValidDate(b) && sameYMD(a, b);
  return false;
}

function inRangeByType(a, b, type, range) {
  if (type === 'Number') {
    if (!isFinite(a) || !isFinite(b)) return false;
    const diff = Math.abs(Number(a) - Number(b));
    return diff <= range.nPlus; // symmetric tolerance
  }
  if (type === 'Date') {
    if (!isValidDate(a) || !isValidDate(b)) return false;
    const diffDays = Math.abs(daysBetween(a, b));
    return diffDays <= range.nPlus; // ±days
  }
  // Range doesn't apply to Text
  return false;
}

/**** TEXT SIMILARITY (token Dice coefficient) ****/
function textSimilarity(a, b) {
  const A = tokenSet_(a);
  const B = tokenSet_(b);
  if (A.size === 0 && B.size === 0) return 1;
  let common = 0;
  for (const t of A) if (B.has(t)) common++;
  // Dice coefficient on token sets
  return (2 * common) / (A.size + B.size);
}

function tokenSet_(s) {
  return new Set(
    normalizeText(s)
      .split(/\s+/)
      .filter(Boolean)
  );
}

function normalizeText(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ') // remove punctuation, keep letters/numbers/spaces
    .replace(/\s+/g, ' ')
    .trim();
}

/**** DATE & NUMBER COERCION ****/
function coerceNumber(v) {
  if (v === '' || v == null) return NaN;
  if (typeof v === 'number' && isFinite(v)) return v;

  // Strip currency, spaces, commas; keep digits, minus, dot
  const cleaned = String(v).replace(/[^\d\.\-]/g, '');
  const n = Number(cleaned);
  return isFinite(n) ? n : NaN;
}

function coerceDate(v) {
  if (v == null || v === '') return null;
  if (Object.prototype.toString.call(v) === '[object Date]' && !isNaN(v)) return v;

  // If numeric, treat as serial date (Google Sheets stores as days since Dec 30, 1899)
  if (!isNaN(v) && v !== '') {
    const base = new Date(Date.UTC(1899, 11, 30));
    const ms = Math.round(Number(v) * 24 * 60 * 60 * 1000);
    return new Date(base.getTime() + ms);
  }

  const d = new Date(v);
  return isNaN(d) ? null : d;
}

function isValidDate(d) {
  return d instanceof Date && !isNaN(d);
}

function sameYMD(a, b) {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth() === b.getMonth() &&
         a.getDate() === b.getDate();
}

function daysBetween(a, b) {
  const A = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const B = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  const ms = Math.abs(A - B);
  return Math.round(ms / (24 * 60 * 60 * 1000));
}

/**** I/O HELPERS ****/
function readTable(sh) {
  const rng = sh.getDataRange();
  const headers = rng.getValues()[0].map(h => String(h).trim()); // trim headers
  const values = rng.getValues();
  if (values.length < 2) return { headers, rows: [] };

  const rows = [];
  for (let i = 1; i < values.length; i++) {
    rows.push(values[i]); // raw values: numbers remain numbers, dates remain Dates
  }
  return { headers, rows };
}


function indexRowsByHeader(tbl) {
  const map = Object.create(null);
  for (let i = 0; i < tbl.headers.length; i++) {
    map[tbl.headers[i]] = i;
  }
  return { headerToIndex: map };
}

function ensureOutputHeaders_(rawSheet, startCol, labels) {
  if (labels.length === 0) return;
  const headerRow = rawSheet.getRange(1, 1, 1, rawSheet.getLastColumn()).getDisplayValues()[0];
  const neededCols = startCol + labels.length - 1;
  if (rawSheet.getLastColumn() < neededCols) {
    rawSheet.insertColumnsAfter(rawSheet.getLastColumn(), neededCols - rawSheet.getLastColumn());
  }
  rawSheet.getRange(1, startCol, 1, labels.length).setValues([labels]);
}

/**** CONFIG DROPDOWNS (optional helper) ****/
function buildConfigDropdowns() {
  const ss = SpreadsheetApp.getActive();
  const src = ss.getSheetByName(SHEETS.SOURCE);
  const raw = ss.getSheetByName(SHEETS.RAW);
  const cfg = ss.getSheetByName(SHEETS.CONFIG);

  if (!src || !raw || !cfg) throw new Error('Missing required sheets.');

  const rawHeaders = raw.getRange(1, 1, 1, raw.getLastColumn()).getDisplayValues()[0].filter(Boolean);
  const srcHeaders = src.getRange(1, 1, 1, src.getLastColumn()).getDisplayValues()[0].filter(Boolean);

  // Place headers lists in hidden named ranges for data validation
  const tmp = getOrCreateSheet_('_lists_');
  tmp.clear();

  tmp.getRange(1, 1, 1, rawHeaders.length).setValues([rawHeaders]);
  tmp.getRange(2, 1, 1, srcHeaders.length).setValues([srcHeaders]);
  tmp.hideSheet();

  const rawRule = SpreadsheetApp.newDataValidation()
    .requireValueInRange(tmp.getRange(1, 1, 1, rawHeaders.length), true)
    .setAllowInvalid(false)
    .build();

  const srcRule = SpreadsheetApp.newDataValidation()
    .requireValueInRange(tmp.getRange(2, 1, 1, srcHeaders.length), true)
    .setAllowInvalid(false)
    .build();

  // Apply to Config columns A (Raw Headers) and B (Source Headers)
  const lastRow = Math.max(1000, cfg.getMaxRows()); // generous
  cfg.getRange(2, 1, lastRow - 1, 1).setDataValidation(rawRule);
  cfg.getRange(2, 2, lastRow - 1, 1).setDataValidation(srcRule);

  // Apply fixed dropdowns for Data Type and Matching Condition
  const typeRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Text', 'Number', 'Date'], true)
    .setAllowInvalid(false)
    .build();

  const condRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Exactly', 'Partial', 'Range'], true)
    .setAllowInvalid(false)
    .build();

  cfg.getRange(2, 3, lastRow - 1, 1).setDataValidation(typeRule);
  cfg.getRange(2, 4, lastRow - 1, 1).setDataValidation(condRule);
}

/**** UTILS ****/
function getOrCreateSheet_(name) {
  const ss = SpreadsheetApp.getActive();
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function maxDefined_(a, b) {
  const vals = [a, b].filter(v => typeof v === 'number' && isFinite(v));
  if (vals.length === 0) return NaN;
  return Math.max.apply(null, vals);
}





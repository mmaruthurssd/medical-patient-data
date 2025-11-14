/******************************************************
 * Order Email Detection from Daily Transcript Files
 * Author: SSD AI Development helper
 * Timezone: Asia/Kolkata
 *
 * SHEET TABS (create these names exactly):
 *   - FILES   : Column A = file_id or Drive URL; (optional) date/status columns
 *   - RESULTS : Empty; this script will create headers on first write
 *   - CONFIG  : Key-value and list sections (see "CONFIG TAB FORMAT" below)
 *
 * MAIN MENU:
 *   Orders -> Process all files
 *   Orders -> Process selected rows
 *
 * WHAT COUNTS AS AN "ORDER"?
 *   Config-driven scoring based on subject/body keywords, order-id regex,
 *   known senders, line-item cues, attachment hints, and negative cues.
 *
 * CONFIG TAB FORMAT (put these as simple vertical lists; first cell is label):
 *   Section "Weights" (two columns: Key | Value)
 *     threshold                         0.70       // decision cutoff (0..1)
 *     weight_subject_strong             0.60
 *     weight_body_order_id              0.60
 *     weight_lifecycle_phrase           0.45
 *     weight_known_sender               0.35
 *     weight_lineitem_medium            0.30
 *     weight_attachment_hint            0.25
 *     weight_subject_weak               0.15
 *     weight_negative_strong           -0.70
 *     weight_negative_medium           -0.40
 *
 *   Section "Keywords_Positive_Subject" (one per cell, vertical list)
 *     order confirmation
 *     your order has shipped
 *     order #
 *     purchase order
 *     sales order
 *     order received
 *
 *   Section "Keywords_Positive_Body" (phrases that imply confirmed/placed/shipped)
 *     view or manage your order
 *     track your package
 *     shipped to
 *     your invoice can be accessed
 *     order number
 *     order id
 *
 *   Section "Keywords_Negative" (phrases that should pull score down)
 *     ordering window closing
 *     place an order
 *     newsletter
 *     promotion
 *     unsubscribe
 *     rfq
 *     request a quote
 *     delivery failed
 *     out of office
 *
 *   Section "Regex_OrderIds" (regex strings, case-insensitive implied)
 *     Order #\\d{3}-\\d{7}-\\d{7}                 // Amazon-like
 *     \\b(PO|Order)[- :#]?[A-Z0-9-]{6,}\\b        // generic
 *
 *   Section "LineItem_Terms"
 *     qty
 *     sku
 *     unit price
 *     subtotal
 *     total
 *     ship to
 *     bill to
 *
 *   Section "Known_Senders" (domain or full email; e.g., amazon.com or orders@vendor.com)
 *     amazon.com
 *     marketplace.example.com
 *
 *   Section "Attachment_Hints" (substrings; filename or attachment label text)
 *     order
 *     purchase_order
 *     sales_order
 *     po
 *
 * NOTES:
 * - Case-insensitive matching; word boundaries applied where sensible.
 * - If CONFIG is missing, sensible defaults are used.
 ******************************************************/

const TZ = 'Asia/Kolkata';
const SHEET_FILES = 'Emails';
const SHEET_RESULTS = 'RESULTS';
const SHEET_CONFIG = 'CONFIG';
const DELIMITER = '--- NEW EMAIL ---'; // transcript email block separator

/***********************
 * Menu
 ***********************/
// function onOpen() {
//   SpreadsheetApp.getUi()
//     .createMenu('Orders')
//     .addItem('Process all files', 'processAllFiles')
//     .addItem('Process selected rows', 'processSelectedRows')
//     .addToUi();
// }

/***********************
 * Entrypoints
 ***********************/
function processAllFiles() {
  return;
  const ss = SpreadsheetApp.getActive();
  const filesSh = ss.getSheetByName(SHEET_FILES);
  if (!filesSh) throw new Error(`Missing sheet: ${SHEET_FILES}`);
  const config = loadConfig_();

  const values = getDataRangeValues_(filesSh);
  if (values.length <= 1) {
    Logger.log('No rows in FILES.');
    return;
  }

  let processed = 0, errors = 0, totalOrders = 0;
  for (let r = 2; r <= values.length; r++) {
    const fileRef = (values[r - 1][0] || '').toString().trim();
    if (!fileRef) continue;

    try {
      const fileId = toFileId_(fileRef);
      const result = classifyTranscript(fileId, config);
      writeResults_(result);
      totalOrders += (result.totals.orders || 0);
      setRowStatus_(filesSh, r, `processed ${dateNow_()}`, result.totals.orders);
      processed++;
    } catch (e) {
      Logger.log(`Row ${r} error: ${e}`);
      setRowStatus_(filesSh, r, `error: ${e}`, '');
      errors++;
    }
  }
  SpreadsheetApp.getActive().toast(
    `Done. Rows processed=${processed}, orders=${totalOrders}, errors=${errors}`,
    'Orders'
  );
}

function processSelectedRows() {
  const ss = SpreadsheetApp.getActive();
  const filesSh = ss.getSheetByName(SHEET_FILES);
  if (!filesSh) throw new Error(`Missing sheet: ${SHEET_FILES}`);
  const config = loadConfig_();

  const sel = filesSh.getActiveRange();
  if (!sel) throw new Error('Please select one or more rows in FILES.');
  const r1 = sel.getRow();
  const rN = r1 + sel.getNumRows() - 1;

  let processed = 0, errors = 0, totalOrders = 0;
  for (let r = r1; r <= rN; r++) {
    if (r === 1) continue; // skip header
    const fileRef = (filesSh.getRange(r, 2).getRichTextValue().getLinkUrl() || '').toString().trim();
    if (!fileRef) continue;

    try {
      const fileId = toFileId_(fileRef);
      const result = classifyTranscript(fileId, config);
      console.log(result);
      // writeResults_(result);
      totalOrders += (result.totals.orders || 0);
      // setRowStatus_(filesSh, r, `processed ${dateNow_()}`, result.totals.orders);
      processed++;
    } catch (e) {
      Logger.log(`Row ${r} error: ${e}`);
      setRowStatus_(filesSh, r, `error: ${e}`, '');
      errors++;
    }
  }
  SpreadsheetApp.getActive().toast(
    `Done. Selected processed=${processed}, orders=${totalOrders}, errors=${errors}`,
    'Orders'
  );
}

/***********************
 * Core pipeline helpers
 ***********************/
function classifyTranscript(fileId, config) {
  const raw = getTranscriptText(fileId);
  const emails = splitIntoEmailBlocks(raw);
  const parsed = emails.map((block, idx) => {
    const p = parseEmail(block);
    const scorecard = scoreOrder(p, config);
    return {
      emailIndex: idx + 1,
      dateTime: p.dateTime,
      from: p.from,
      to: p.to,
      cc: p.cc || '',
      subject: p.subject,
      isOrder: scorecard.isOrder,
      score: round2_(scorecard.score),
      matchedRules: scorecard.matchedRules.join('|'),
      orderIds: (scorecard.orderIds || []).join('|'),
      vendor: scorecard.vendor || '',
      attachments: (p.attachments || []).join('|'),
      emailId: makeEmailId_(p)
    };
  });

  const orders = parsed.filter(e => e.isOrder).length;
  return {
    transcriptFileId: fileId,
    transcriptDate: guessTranscriptDate_(raw) || '',
    emails: parsed,
    totals: { emails: parsed.length, orders }
  };
}

function getTranscriptText(fileId) {
  const file = DriveApp.getFileById(fileId);
  const blob = file.getBlob();
  // Attempt UTF-8 first, fallback to default if needed
  try {
    return blob.getDataAsString('UTF-8');
  } catch (_) {
    return blob.getDataAsString();
  }
}

function splitIntoEmailBlocks(transcriptText) {
  if (!transcriptText) return [];
  const parts = transcriptText.split(DELIMITER);
  // Remove leading/trailing empties and trim
  return parts.map(x => x.trim()).filter(x => x);
}

function parseEmail(blockText) {
  // Expected headers (case-insensitive begins-with), body may be multiline.
  // Common labels observed: "Date and time:", "From:", "To:", "Subject :", "Body :", "AttachmentN:"
  const lines = blockText.split(/\r?\n/);
  const hdr = { dateTime: '', from: '', to: '', cc: '', subject: '' };
  let bodyLines = [];
  let inBody = false;
  let attachments = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Header parsing (be permissive: optional spaces before colon)
    if (!inBody) {
      if (/^date\s*and\s*time\s*:/i.test(line)) { hdr.dateTime = extractAfterColon_(line); continue; }
      if (/^from\s*:/i.test(line)) { hdr.from = extractAfterColon_(line); continue; }
      if (/^to\s*:/i.test(line)) { hdr.to = extractAfterColon_(line); continue; }
      if (/^cc\s*:/i.test(line)) { hdr.cc = extractAfterColon_(line); continue; }
      if (/^subject\s*:/.test(line.toLowerCase())) { hdr.subject = extractAfterColon_(line); continue; }

      if (/^body\s*:$/i.test(line.trim()) || /^body\s*:/i.test(line)) {
        // Line starting body; capture remainder of the same line, if any:
        const after = line.split(/:/).slice(1).join(':');
        if (after && after.trim()) bodyLines.push(after.trim());
        inBody = true;
        continue;
      }

      // Attachments can appear before/after body in some dumps
      if (/^attachment\d+\s*:/i.test(line)) {
        const val = extractAfterColon_(line);
        if (val) attachments.push(val);
        continue;
      }
    } else {
      // In body: stop if we encounter a new header/attachment marker (start of a new labeled section)
      if (/^(date\s*and\s*time|from|to|cc|subject|attachment\d+)\s*:/i.test(line)) {
        // We hit another labeled section — treat as not body.
        if (/^attachment\d+\s*:/i.test(line)) {
          const val = extractAfterColon_(line);
          if (val) attachments.push(val);
        }
        inBody = false;
        continue;
      } else {
        bodyLines.push(line);
      }
    }
  }

  const bodyRaw = bodyLines.join('\n');
  const bodyClean = normalizeBody_(bodyRaw);

  return {
    dateTime: hdr.dateTime,
    from: hdr.from,
    to: hdr.to,
    cc: hdr.cc,
    subject: (hdr.subject || '').trim(),
    bodyRaw,
    bodyClean,
    attachments
  };
}

/***********************
 * Scoring
 ***********************/
function scoreOrder(email, config) {
  const weights = config.weights;
  const rulesHit = [];
  let score = 0;

  const subject = (email.subject || '').toLowerCase();
  const body = (email.bodyClean || '').toLowerCase();
  const from = (email.from || '').toLowerCase();

  // 1) Strong subject phrases
  const subjStrongHits = matchAnyPhrase_(subject, config.positiveSubjectStrongSet);
  if (subjStrongHits.length) {
    score += weights.weight_subject_strong * Math.min(1, subjStrongHits.length);
    rulesHit.push(`subject_strong:${subjStrongHits.join(',')}`);
  }

  // 2) Weak subject fallback (generic 'order' with boundaries)
  if (!subjStrongHits.length && /\border\b/.test(subject)) {
    score += weights.weight_subject_weak;
    rulesHit.push('subject_weak:order');
  }

  // 3) Order IDs in body (and subject too)
  const orderIds = extractOrderIds(email, config);
  if (orderIds.length) {
    score += weights.weight_body_order_id * Math.min(1, orderIds.length);
    rulesHit.push(`order_id:${orderIds.slice(0, 3).join(',')}`);
  }

  // 4) Lifecycle phrases in body
  const bodyLifecycleHits = matchAnyPhrase_(body, config.positiveBodySet);
  if (bodyLifecycleHits.length) {
    score += weights.weight_lifecycle_phrase * Math.min(1, bodyLifecycleHits.length);
    rulesHit.push(`body_lifecycle:${bodyLifecycleHits.slice(0, 3).join(',')}`);
  }

  // 5) Known senders (by domain or full email)
  const knownSender = isKnownSender_(from, config.knownSenders);
  if (knownSender) {
    score += weights.weight_known_sender;
    rulesHit.push(`known_sender:${knownSender}`);
  }

  // 6) Line-item terms (count distinct terms present)
  const lineItemCount = countDistinctTerms_(body, config.lineItemTerms);
  if (lineItemCount >= 2) {
    score += weights.weight_lineitem_medium;
    rulesHit.push(`line_items:${lineItemCount}`);
  }

  // 7) Attachment hints
  const attachText = (email.attachments || []).join(' ').toLowerCase();
  if (attachText && containsAny_(attachText, config.attachmentHints)) {
    score += weights.weight_attachment_hint;
    rulesHit.push('attachment_hint');
  }

  // 8) Negative cues
  const negHits = matchAnyPhrase_(subject + ' ' + body, config.negativeSet);
  if (negHits.length) {
    // pick strongest negative weight; if many hits, cap once
    let negWeight = weights.weight_negative_medium;
    if (hasStrongNegative_(negHits)) negWeight = weights.weight_negative_strong;
    score += negWeight;
    rulesHit.push(`negative:${negHits.slice(0, 3).join(',')}`);
  }

  // Clamp to [0,1] for interpretability
  const clamped = Math.max(0, Math.min(1, score));
  const isOrder = clamped >= weights.threshold;

  // Vendor inference from sender domain if present in known list
  const vendor = inferVendorFromSender_(from, config.knownSenders);

  return { score: clamped, isOrder, matchedRules: rulesHit, orderIds, vendor };
}

function extractOrderIds(email, config) {
  const hay = (email.subject + '\n' + email.bodyClean).toString();
  const out = new Set();
  config.orderIdRegexes.forEach(rx => {
    let m;
    while ((m = rx.exec(hay)) !== null) {
      out.add(m[0]);
      if (out.size > 50) break;
    }
  });
  return Array.from(out);
}

/***********************
 * Config loader & utils
 ***********************/
function loadConfig_() {
  const sh = SpreadsheetApp.getActive().getSheetByName(SHEET_CONFIG);
  const defaults = defaultConfig_();

  if (!sh) {
    Logger.log(`CONFIG sheet missing; using defaults.`);
    return defaults;
  }

  const values = getDataRangeValues_(sh);
  // Find section blocks by their label cell values
  const sections = parseConfigSections_(values);

  const weights = Object.assign({}, defaults.weights, sections.Weights || {});
  // normalize numbers
  Object.keys(weights).forEach(k => weights[k] = Number(weights[k]));

  const positiveSubject = sections.Keywords_Positive_Subject || defaults._raw.positiveSubject;
  const positiveBody = sections.Keywords_Positive_Body || defaults._raw.positiveBody;
  const negative = sections.Keywords_Negative || defaults._raw.negative;
  const orderIdRegexStrings = sections.Regex_OrderIds || defaults._raw.orderIdRegexStrings;
  const lineItemTerms = sections.LineItem_Terms || defaults._raw.lineItemTerms;
  const knownSenders = sections.Known_Senders || defaults._raw.knownSenders;
  const attachmentHints = sections.Attachment_Hints || defaults._raw.attachmentHints;

  return {
    weights,
    positiveSubjectStrongSet: new Set(positiveSubject.map(s => s.toLowerCase())),
    positiveBodySet: new Set(positiveBody.map(s => s.toLowerCase())),
    negativeSet: new Set(negative.map(s => s.toLowerCase())),
    orderIdRegexes: compileRegexes_(orderIdRegexStrings),
    lineItemTerms: lineItemTerms.map(s => s.toLowerCase()),
    knownSenders: knownSenders.map(s => s.toLowerCase()),
    attachmentHints: attachmentHints.map(s => s.toLowerCase()),
    _raw: { positiveSubject, positiveBody, negative, orderIdRegexStrings, lineItemTerms, knownSenders, attachmentHints }
  };
}

function defaultConfig_() {
  const weights = {
    threshold: 0.70,
    weight_subject_strong: 0.60,
    weight_subject_weak: 0.15,
    weight_body_order_id: 0.60,
    weight_lifecycle_phrase: 0.45,
    weight_known_sender: 0.35,
    weight_lineitem_medium: 0.30,
    weight_attachment_hint: 0.25,
    weight_negative_strong: -0.70,
    weight_negative_medium: -0.40
  };

  const positiveSubject = [
    'order confirmation', 'your order has shipped', 'order #', 'purchase order', 'sales order', 'order received'
  ];
  const positiveBody = [
    'view or manage your order', 'track your package', 'shipped to', 'your invoice can be accessed', 'order number', 'order id'
  ];
  const negative = [
    'ordering window closing', 'place an order', 'newsletter', 'promotion', 'unsubscribe', 'rfq', 'request a quote', 'delivery failed', 'out of office'
  ];
  const orderIdRegexStrings = [
    'Order #\\d{3}-\\d{7}-\\d{7}',
    '\\b(PO|Order)[- :#]?[A-Z0-9-]{6,}\\b'
  ];
  const lineItemTerms = ['qty', 'sku', 'unit price', 'subtotal', 'total', 'ship to', 'bill to'];
  const knownSenders = ['amazon.com'];
  const attachmentHints = ['order', 'purchase_order', 'sales_order', 'po'];

  return {
    weights,
    positiveSubjectStrongSet: new Set(positiveSubject),
    positiveBodySet: new Set(positiveBody),
    negativeSet: new Set(negative),
    orderIdRegexes: compileRegexes_(orderIdRegexStrings),
    lineItemTerms,
    knownSenders,
    attachmentHints,
    _raw: { positiveSubject, positiveBody, negative, orderIdRegexStrings, lineItemTerms, knownSenders, attachmentHints }
  };
}

function compileRegexes_(patterns) {
  const out = [];
  patterns.forEach(p => {
    const s = (p || '').toString().trim();
    if (!s) return;
    try {
      out.push(new RegExp(s, 'gi'));
    } catch (e) {
      Logger.log(`Bad regex skipped: ${s} (${e})`);
    }
  });
  return out;
}

function parseConfigSections_(values) {
  // Very simple parser: each section starts with a single-cell title row matching known names
  // Then its items follow until a blank row.
  const known = new Set([
    'Weights',
    'Keywords_Positive_Subject',
    'Keywords_Positive_Body',
    'Keywords_Negative',
    'Regex_OrderIds',
    'LineItem_Terms',
    'Known_Senders',
    'Attachment_Hints'
  ]);
  const sections = {};
  let current = null;

  for (let r = 1; r <= values.length; r++) {
    const row = values[r - 1];
    const first = ((row[0] || '') + '').trim();
    const second = ((row[1] || '') + '').trim();

    if (!first && !second) {
      current = null;
      continue;
    }

    if (known.has(first) && !second) {
      current = first;
      if (!sections[current]) {
        sections[current] = (current === 'Weights') ? {} : [];
      }
      continue;
    }

    if (!current) continue;

    if (current === 'Weights') {
      if (first && second) sections[current][first] = second;
    } else {
      // single-column lists; if a second column exists, ignore
      if (first) sections[current].push(first);
    }
  }
  return sections;
}

/***********************
 * Utility functions
 ***********************/
function toFileId_(ref) {
  // Accept bare fileId or a full Drive URL
  const urlMatch = ref.match(/[-\w]{25,}/);
  return urlMatch ? urlMatch[0] : ref;
}

function extractAfterColon_(line) {
  const idx = line.indexOf(':');
  if (idx < 0) return '';
  return line.slice(idx + 1).trim();
}

function normalizeBody_(text) {
  if (!text) return '';
  // Remove HTML tags, decode entities lightly, collapse whitespace
  let t = text.replace(/<[^>]+>/g, ' ');
  t = t.replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
  t = t.replace(/\s+/g, ' ').trim();
  return t;
}

function matchAnyPhrase_(hay, phraseSet) {
  const hits = [];
  for (const p of phraseSet) {
    const q = p.toLowerCase();
    if (!q) continue;
    if (hay.indexOf(q) >= 0) hits.push(q);
  }
  return hits;
}

function containsAny_(hay, list) {
  hay = hay || '';
  for (const s of list) {
    if (!s) continue;
    if (hay.indexOf(s) >= 0) return true;
  }
  return false;
}

function hasStrongNegative_(negHits) {
  // Heuristic: if phrases like 'delivery failed', 'out of office', 'rfq', 'request a quote' are present, treat as strong
  const strongWords = ['delivery failed', 'out of office', 'rfq', 'request a quote'];
  return negHits.some(h => strongWords.includes(h));
}

function isKnownSender_(fromLower, knownList) {
  // Match either full email or domain suffix.
  // E.g., fromLower ends with '@amazon.com' -> 'amazon.com'
  if (!fromLower) return '';
  const emailMatch = fromLower.match(/<?([a-z0-9._%+-]+)@([a-z0-9.-]+\.[a-z]{2,})>?/);
  let domain = '';
  if (emailMatch) domain = emailMatch[2];

  for (const k of knownList) {
    if (!k) continue;
    if (fromLower.indexOf(k) >= 0) return k;           // full email match
    if (domain && domain.endsWith(k)) return k;        // domain suffix match
  }
  return '';
}

function inferVendorFromSender_(fromLower, knownList) {
  const k = isKnownSender_(fromLower, knownList);
  if (!k) return '';
  // Simple vendor inference: strip TLD or use domain as vendor name
  const parts = k.split('.');
  if (parts.length >= 2) return parts[0]; // 'amazon'
  return k;
}

function countDistinctTerms_(bodyLower, terms) {
  let c = 0;
  terms.forEach(t => {
    const needle = t.toLowerCase();
    if (needle && bodyLower.indexOf(needle) >= 0) c++;
  });
  return c;
}

function makeEmailId_(p) {
  const s = [
    (p.dateTime || '').trim(),
    (p.from || '').trim(),
    (p.to || '').trim(),
    (p.subject || '').trim(),
    (p.bodyRaw || '').slice(0, 128)
  ].join('|');
  const bytes = Utilities.newBlob(s).getBytes();
  const hash = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, bytes);
  return hash.map(b => (('0' + (b & 0xFF).toString(16)).slice(-2))).join('');
}

function guessTranscriptDate_(raw) {
  // Optional: try to read first 'Date and time' line as the transcript date
  const m = raw.match(/Date\s*and\s*time\s*:\s*([^\n\r]+)/i);
  if (m) return m[1].trim();
  return '';
}

function dateNow_() {
  return Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd HH:mm:ss');
}

function round2_(x) {
  return Math.round((x + Number.EPSILON) * 100) / 100;
}

function getDataRangeValues_(sh) {
  const rg = sh.getDataRange();
  const v = rg.getValues();
  return v && v.length ? v : [['']];
}

function setRowStatus_(sh, row, status, orders) {
  // Write status to column B, orders_found to column C (create if needed)
  if (sh.getMaxColumns() < 3) sh.insertColumnsAfter(1, 2);
  sh.getRange(row, 2).setValue(status || '');
  sh.getRange(row, 3).setValue(orders || 0);
}

function ensureResultsHeader_() {
  const sh = SpreadsheetApp.getActive().getSheetByName(SHEET_RESULTS) ||
    SpreadsheetApp.getActive().insertSheet(SHEET_RESULTS);
  const header = [
    'transcript_file_id', 'transcript_date', 'email_index', 'email_id',
    'datetime', 'from', 'to', 'cc', 'subject',
    'is_order', 'score', 'matched_rules', 'order_ids', 'vendor', 'attachments',
    'processed_at'
  ];
  const hNow = sh.getRange(1, 1, 1, header.length).getValues()[0];
  const same = header.every((v, i) => (hNow[i] || '') === v);
  if (!same) {
    sh.clear();
    sh.getRange(1, 1, 1, header.length).setValues([header]);
  }
  return sh;
}

function writeResults_(result) {
  const sh = ensureResultsHeader_();
  const rows = result.emails.map(e => ([
    result.transcriptFileId,
    result.transcriptDate,
    e.emailIndex,
    e.emailId,
    e.dateTime,
    e.from,
    e.to,
    e.cc,
    e.subject,
    e.isOrder ? 'TRUE' : 'FALSE',
    e.score,
    e.matchedRules,
    e.orderIds,
    e.vendor,
    e.attachments,
    dateNow_()
  ]));
  if (rows.length) {
    sh.insertRowsAfter(1, rows.length);
    sh.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  }
}

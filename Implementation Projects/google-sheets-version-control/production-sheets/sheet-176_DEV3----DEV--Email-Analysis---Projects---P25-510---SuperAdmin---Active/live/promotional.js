//SELECT message_id, email_address_from, email_address_to, email_subject, email_body, email_received_date FROM `pdf-ocr-extraction-461917.emails_dataset.all_emails` WHERE timestamp_trunc(email_received_date, DAY) BETWEEN '2025-06-20' AND '2025-09-24' ORDER BY email_received_date DESC

function markPromoAndSpamEmails() {

  var query = `SELECT message_id, email_address_from, email_address_to, email_subject, email_body, email_received_date FROM ${PROJECT_ID}.${DATASET_ID}.${TABLE_ID} WHERE timestamp_trunc(email_received_date, DAY) BETWEEN '2025-06-20' AND '2025-09-24' ORDER BY email_received_date DESC`;

  var results = runBigQueryQuery_({ query, projectId: PROJECT_ID });
  //<<

  if (results.length == 0) return;

  var objEmails = {};
  results.forEach(r => {
    if (!objEmails[r["email_address_from"].toString().toLowerCase()]) {
      objEmails[r["email_address_from"].toString().toLowerCase()] = [];
    }
    objEmails[r["email_address_from"].toString().toLowerCase()].push(r);
  });

  SpreadsheetApp.flush();
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Email List");
  var all = sheet.getDataRange().getValues();
  var objHeaders = makeObjHeaderDetails_({ allHeaders: all[0] });

  var COL_SPAM = objHeaders["Spam"].columnNumber;

  var whiteList = ["@southernskiesdermatology.com", "@ssdspc.com", "@sendfax.to", "@google.com", ".google.com"];

  // ---- sampling & decision knobs (you said 10..20) ----
  var MAX_THREADS = 20;
  var MIN_THREADS = 10;

  // Wilson CI tuned for small n (<=20)
  var Z_CONF = 1.645;  // 90% CI (friendlier at low n)
  var PROMO_LB = 0.80;   // sender-level promo lower bound
  var SPAM_LB = 0.88;   // sender-level spam lower bound

  // Rule thresholds (conflict-aware)
  var M_STRONG = 5.0;  // strong marketing
  var M_WEAK_MIN = 3.2;  // "promo-ish"
  var T_STRONG = 2.5;  // strong transactional
  var T_WEAK_MIN = 1.6;  // "tx-ish"

  // AI cost controls
  var MAX_AI_PER_SENDER = 5;  // hard cap per sender

  for (var r = 1; r < all.length; r++) {
    if (isOverTime_(vMiliPerMin * 13)) break;

    var rowIdx = r + 1;
    var sender = String(all[r][objHeaders["Email Addresses"].columnIndex] || "").toLowerCase();
    if (!sender) continue;

    // if (all[r][objHeaders["Spam"].columnIndex] != "") continue;

    if (all[r][objHeaders["Spam"].columnIndex] != "" && all[r][objHeaders["Spam"].columnIndex] != "Need Review By AI") continue;

    if (whiteList.some(function (d) { return sender.endsWith(d); })) {
      sheet.getRange(rowIdx, COL_SPAM).setValue("no");
      continue;
    }

    if (!objEmails[sender]) {
      sheet.getRange(rowIdx, COL_SPAM).setValue("NA");
      continue;
    }

    if (objEmails[sender].length < MIN_THREADS) {
      sheet.getRange(rowIdx, COL_SPAM).setValue("NA");
      continue;
    }

    var promoCount = 0;
    var spamCount = 0; // promo ⇒ spam will fold into this
    var txCount = 0;
    var checked = 0;

    var pendingAI = []; // {id, subject, body, headers, from}

    var isAI = false;

    for (var mm = 0; mm < Math.min(objEmails[sender].length, 20); mm++) {
      var msgs = objEmails[sender];
      if (txCount > 0) break;

      var msg = msgs[mm];
      var message_id = msg["message_id"];
      var subject = msg["email_subject"];
      var body = msg["email_body"];
      var sFrom = msg["email_address_from"];
      var sTo = msg["email_address_to"];

      var meta = getMessageMeta_(message_id); // {labelIds, headers}
      var labels = meta.labelIds || [];
      var headers = meta.headers || {};

      // Gmail-native shortcuts
      if (labels.indexOf("SPAM") !== -1) {
        spamCount++; checked++;
        continue;
      }
      if (labels.indexOf("CATEGORY_PROMOTIONS") !== -1) {
        promoCount++; spamCount++; checked++;
        continue;
      }

      // Rule pass (conflict-aware)
      var rowObj = { from: sFrom, to: sTo, subject: subject, body: body, headers: headers };
      var type = checktypeofemail_(rowObj);
      var m = type.marketing || { isMarketing: false, score: 0 };
      var tscore = type.transactional || { isTransactional: false, score: 0 };

      var updates = (labels.indexOf("CATEGORY_UPDATES") !== -1);
      var promoStrong = (m.score >= M_STRONG) && !tscore.isTransactional && (tscore.score < T_WEAK_MIN);
      var txStrong = (tscore.score >= T_STRONG) && !(m.score >= M_WEAK_MIN);

      if (txStrong) { // clear transactional → no AI
        txCount++; checked++;
        continue;
      }
      if (promoStrong) { // clear promo → promo+spam
        promoCount++; spamCount++; checked++;
        continue;
      }

      // Narrow AI gate:
      // - suspicious UPDATES (not all)
      // - real conflicts (both sides active)
      // - near-threshold cases
      // - obvious phishy signs
      var suspiciousPromo = promoSuspicion_(rowObj); // list-id/unsub/esp/link-heavy/subject promo
      var suspiciousSpam = suspicionSpam_(rowObj);  // auth fails, reply mismatch, shorteners, risky, phishy
      var updatesGate = updates && (suspiciousSpam || (suspiciousPromo && (m.score >= (M_STRONG - 0.5))));

      var nearPromo = (m.score >= (M_STRONG - 0.5) && m.score < M_STRONG);
      var nearTx = (tscore.score >= (T_STRONG - 0.4) && tscore.score < T_STRONG);
      var conflict = (m.score >= M_WEAK_MIN) && (tscore.score >= T_WEAK_MIN);

      var tooShort = (String(rowObj.body || '').replace(/\s+/g, '').length < 120) && !/unsubscribe/i.test(rowObj.body || '');

      var shouldAI = !tooShort && (updatesGate || conflict || nearPromo || nearTx || suspiciousSpam);

      if (shouldAI) {
        isAI = true;
        if (pendingAI.length < MAX_AI_PER_SENDER) {
          pendingAI.push({ id: message_id, subject: subject, body: body, headers: headers, from: sFrom });
          checked++;
          continue;
        }
      } else {
        checked++;
      }
    }

    // if (isAI && txCount === 0) {
    //   sheet.getRange(rowIdx, COL_SPAM).setValue("Need Review By AI");
    //   continue;
    // }

    // One AI call for the uncertain ones (compact payload)
    if (txCount === 0 && pendingAI.length > 0) {
      console.log(`Row: ${rowIdx}`);
      var verdicts = bulkAiConfirmSpam_(pendingAI);
      pendingAI.forEach(function (it) {
        var tx = !!(verdicts._transactional && verdicts._transactional[it.id]);
        var promo = !!(verdicts._promo && verdicts._promo[it.id]);
        var spam = !!verdicts[it.id];

        if (tx) txCount++;
        else if (promo) { promoCount++; spamCount++; } // promo ⇒ spam
        else if (spam) spamCount++;
      });
    }

    // Sender-level decision (small-n tuned)
    var lbPromo = wilsonLowerBound_(promoCount, checked, Z_CONF);
    var lbSpam = wilsonLowerBound_(spamCount, checked, Z_CONF);

    var perfectPromo = (promoCount === checked) && (checked >= 5);
    var perfectSpam = (spamCount === checked) && (checked >= 5);

    var promoYes = (txCount === 0) && (perfectPromo || (lbPromo >= PROMO_LB));
    var spamYes = (txCount === 0) && (perfectSpam || (lbSpam >= SPAM_LB));

    // enforce policy: promo ⇒ spam
    if (promoYes && !spamYes) spamYes = true;

    Logger.log(JSON.stringify({ rowIdx, checked, promoCount, spamCount, txCount, lbPromo, lbSpam, promoYes, spamYes }));

    sheet.getRange(rowIdx, COL_SPAM).setValue(spamYes ? "yes" : "no");
  }
}

var DEFAULT_PROMPT_SPAM_STRUCTURE = [
  "You are an email classifier. Output ONLY valid JSON, no code fences, no prose.",
  "Classes:",
  "- SPAM: phishing, scams, malware, spoofing/impersonation, credential-harvest, extortion, 'too good to be true',",
  "        deceptive links (display vs target mismatch), auth failures, shady attachments (e.g., .html, .exe, .scr),",
  "        obvious mass spam from non-opt-in sources.",
  "- PROMO: legitimate marketing/newsletters/ads/offers, product announcements, sales/discounts.",
  "- TRANSACTIONAL: receipts, invoices, order/shipping updates, 2FA/security alerts, support/case updates.",
  "- OTHER: personal, general, or mixed content.",
  "",
  "Policy: A false positive on SPAM is worse than a false negative.",
  "Prefer PROMO over SPAM for normal newsletters/ads without malicious indicators.",
  "If transactional cues exist, favor TRANSACTIONAL unless SPAM is ≥ 0.98.",
  "",
  "Consider: Subject, Body (plain text), and Headers (List-Id, List-Unsubscribe, Precedence, Auto-Submitted,",
  "Authentication-Results/SPF/DKIM/DMARC, Return-Path, Message-Id domain).",
  "",
  "Return EXACTLY this JSON shape:",
  "{",
  '  "results": [',
  '    { "id": "<string>", "class": "SPAM|PROMO|TRANSACTIONAL|OTHER",',
  '      "prob": { "spam": <0..1>, "promo": <0..1>, "transactional": <0..1>, "other": <0..1> },',
  '      "reasons": ["<short>","<short>"]',
  "    }",
  "  ]",
  "}",
  "",
  "Strict requirements:",
  "- Return one result object for EVERY input item, in the SAME order as provided.",
  "- Copy each item's \"id\" string EXACTLY; do not invent, drop, merge, or reorder items.",
  "- All four probability keys must be present and numeric (0..1).",
  "- No extra text before/after the JSON.",
  "",
  "Items to classify:",
  "{{TEXT}}"
].join("\\n");

function compactForLLM_(subject, body, headersObj, from) {
  subject = String(subject || "");
  body = String(body || "");
  var headersText = _headersToText_(headersObj || {});
  var clean = _stripQuoted_(body).replace(/\s+\n/g, '\n').replace(/[ \t]+/g, ' ').trim();

  var head = clean.slice(0, 900);
  var tail = clean.slice(-500);
  var keyLines = _pickKeywordLines_(
    clean,
    /(unsubscribe|manage (?:preferences|subscription)|view in browser|web ?version|order (?:no\.|number|id)|invoice|receipt|paid|payment|shipped|tracking|delivery|2fa|verification code|case|ticket)/i,
    8, 160
  ).join('\n');

  var h = _minHeadersString_(headersText, from);

  var urlList = clean.match(/\bhttps?:\/\/[^\s)"]+/gi) || [];
  var urlCount = urlList.length;
  var wordCount = (clean.replace(/\bhttps?:\/\/[^\s)"]+/g, '').match(/\b[\w'-]+\b/g) || []).length;
  var linkRatio = wordCount ? (urlCount / Math.max(1, wordCount)) : 0;
  var shorteners = /(bit\.ly|tinyurl\.com|t\.co|goo\.gl|is\.gd|rb\.gy|shorturl\.at|cutt\.ly|ow\.ly|s\.id)/i;
  var shortenerCount = urlList.filter(function (u) { return shorteners.test(u); }).length;

  var features = [
    'F url=' + urlCount,
    'ratio=' + linkRatio.toFixed(3),
    'short=' + shortenerCount,
    'hasUnsub=' + (/unsubscribe/i.test(clean) ? 1 : 0),
    'hasOrderId=' + (/\b(order|invoice|receipt)\s*(no\.|number|id)?\s*[:#]?\s*[A-Z0-9\-]{6,}\b/i.test(clean) ? 1 : 0),
    'hasTracking=' + (/\btracking\s*(number|no\.|id)\b/i.test(clean) ? 1 : 0),
    'hasLineItems=' + (/\b(item|description)\b.*\b(qty|quantity)\b.*\b(price|amount|total)\b/i.test(clean) ? 1 : 0)
  ].join(' ');

  var compactText = [
    '[SUBJ] ' + subject.slice(0, 160),
    '[HDR] ' + h,
    '[FEAT] ' + features,
    '[HEAD]',
    head,
    '[KEY]',
    keyLines,
    '[TAIL]',
    tail
  ].join('\n');

  return {
    subject: subject.slice(0, 160),
    text: compactText,
    headersMin: h
  };
}

function _pickKeywordLines_(text, rx, maxLines, maxLen) {
  var lines = text.split(/\n+/), hits = [];
  for (var i = 0; i < lines.length; i++) {
    if (rx.test(lines[i])) {
      hits.push(lines[i].slice(0, maxLen));
      if (hits.length >= maxLines) break;
    }
  }
  return hits;
}
function _minHeadersString_(headersText, from) {
  headersText = String(headersText || "");
  var fromDom = (_normEmailParts_(from || '').domain || '').toLowerCase();
  function grab(re) { var m = headersText.match(re); return m ? m[1].trim() : ''; }
  var listId = grab(/^\s*List-Id\s*:\s*([^ \r\n].*)$/im);
  var unsub = grab(/^\s*List-Unsubscribe\s*:\s*([^ \r\n].*)$/im);
  var prec = grab(/^\s*Precedence\s*:\s*([^ \r\n].*)$/im);
  var autosub = grab(/^\s*Auto-Submitted\s*:\s*([^ \r\n].*)$/im);
  var authRes = grab(/^\s*Authentication-Results\s*:\s*([^].*)$/im);
  var rpath = grab(/^\s*Return-Path\s*:\s*([^ \r\n].*)$/im);
  var sender = grab(/^\s*Sender\s*:\s*([^ \r\n].*)$/im);
  var replyTo = grab(/^\s*Reply-To\s*:\s*([^ \r\n].*)$/im);
  var msgId = grab(/^\s*Message-Id\s*:\s*([^ \r\n].*)$/im);
  var replyDom = (replyTo.match(/<([^>]+)>/) ? RegExp.$1 : replyTo).split('@')[1] || '';
  replyDom = replyDom.toLowerCase().trim();
  var replyMismatch = replyDom && fromDom && replyDom !== fromDom ? 1 : 0;

  var parts = [];
  if (listId) parts.push('ListId=' + listId.replace(/\s+/g, ' ').slice(0, 80));
  if (unsub) parts.push('Unsub=1');
  if (prec) parts.push('Prec=' + prec.slice(0, 20));
  if (autosub) parts.push('Auto=' + autosub.slice(0, 20));
  if (authRes) parts.push('Auth=' + authRes.replace(/\s+/g, ' ').slice(0, 80));
  if (rpath) parts.push('RP=' + rpath.slice(0, 60));
  if (sender) parts.push('Sender=' + sender.slice(0, 60));
  if (msgId) parts.push('MsgIdDom=' + (msgId.split('@')[1] || '').slice(0, 60));
  if (replyTo) parts.push('ReplyDom=' + replyDom + ' mm=' + replyMismatch);
  if (fromDom) parts.push('FromDom=' + fromDom);
  return parts.join(' | ');
}
function _stripQuoted_(body) {
  var s = String(body || '').replace(/^\s*>.*$/gm, "");      // quoted lines
  s = s.replace(/(^|\n)--\s*\n[\s\S]+$/m, "$1");           // signatures
  return s;
}
function _truncate_(s, max) { s = String(s || ''); return s.length <= max ? s : s.slice(0, max) + " …[truncated]"; }

function bulkAiConfirmSpam_(items, options) {
  options = options || {};
  var maxBatchSize = options.maxBatchSize || 20;

  // thresholds
  var spamHi = options.spamThreshold || 0.98; // SPAM must be ≥ 98%
  var promoHi = options.promoThreshold || 0.90; // PROMO must be ≥ 90%
  var promoSpamMax = options.promoSpamCeil || 0.05; // PROMO spam ≤ 5%
  var promoTxMax = options.promoTxCeil || 0.05; // PROMO tx ≤ 5%
  var txHi = options.txThreshold || 0.70; // TX ≥ 70%

  var promptTmpl = options.promptStructure || DEFAULT_PROMPT_SPAM_STRUCTURE;

  var out = { _transactional: {}, _promo: {}, _raw: [] };
  if (!items || !items.length) return out;

  for (var i = 0; i < items.length; i += maxBatchSize) {
    var batch = items.slice(i, i + maxBatchSize).map(function (it) {
      var c = compactForLLM_(it.subject, it.body, it.headers, it.from);
      return { id: String(it.id || ""), subject: c.subject, body: c.text, headers: c.headersMin };
    });

    var sText = JSON.stringify({ items: batch });
    var prompt = promptTmpl.replace("{{TEXT}}", sText);

    var aiRes, rawText, parsed;
    console.log(prompt.length);
    addCountingForAI_(prompt.length);
    try {
      aiRes = vertexAIconfigLib.callVertexAIWithPrompt({ prompt: prompt });
      rawText = _coerceToString_(aiRes);
      parsed = _safeJsonParseLLM_(rawText);
    } catch (e) {
      continue; // abstain on error
    }
    if (!parsed || !parsed.results || !parsed.results.forEach) continue;

    parsed.results.forEach(function (r) {
      if (!r || !r.id) return;
      var klass = String((r["class"] || r["label"] || "")).toUpperCase();
      if (klass === "PROMOTIONAL") klass = "PROMO";

      var p = r.prob || {};
      var pSpam = _numOrZero_(p.spam);
      var pPromo = _numOrZero_(p.promo);
      var pTx = _numOrZero_(p.transactional);
      var pOther = _numOrZero_(p.other);

      out._transactional[r.id] = (klass === "TRANSACTIONAL") || (pTx >= txHi);
      out[r.id] = (klass === "SPAM" && pSpam >= spamHi);
      out._promo[r.id] = (klass === "PROMO" && pPromo >= promoHi && pSpam <= promoSpamMax && pTx <= promoTxMax);

      out._raw.push({
        id: r.id, class: klass,
        prob: { spam: pSpam, promo: pPromo, transactional: pTx, other: pOther },
        reasons: r.reasons || []
      });
    });
  }
  return out;
}
function promoSuspicion_(row) {
  var subj = row.subject || '';
  var body = (row.body || '').replace(/\r\n?/g, '\n');
  var headersText = _headersToText_(row.headers || {});

  var hasUnsub = /\bunsubscribe\b/i.test(body) || /^\s*List-Unsubscribe\s*:/im.test(headersText);
  var hasListId = /^\s*List-Id\s*:/im.test(headersText);
  var esp = /(mailchimp|mcsv|mandrillapp|sendgrid|sparkpost|mailgun|marketo|hubspot|campaign-?monitor|exacttarget|salesforce)/i.test(headersText);
  var subjPromo = /\b(newsletter|sale|deal|promo|promotion|discount|% off|offer|webinar|announcement|roundup|digest)\b/i.test(subj);

  var urlCount = (body.match(/\bhttps?:\/\/[^\s)]+/gi) || []).length;
  var wordCount = (body.replace(/https?:\/\/[^\s)]+/g, '').match(/\b[\w'-]+\b/g) || []).length;
  var linkHeavy = urlCount >= 5 || (wordCount ? (urlCount / Math.max(1, wordCount)) > 0.08 : false);

  return hasUnsub || hasListId || esp || subjPromo || linkHeavy;
}

function suspicionSpam_(row) {
  var subj = row.subject || '';
  var body = (row.body || '').replace(/\r\n?/g, '\n');
  var headers = _headersToText_(row.headers || {});
  var fromParts = _normEmailParts_(row.from || '');

  var authFail = /dmarc=fail|spf=fail|dkim=fail/i.test(headers) ||
    /^\s*Authentication-Results\s*:\s*.*fail/im.test(headers);

  var mReply = headers.match(/^\s*Reply-To\s*:\s*.*<([^>]+)>/im) || headers.match(/^\s*Reply-To\s*:\s*([^\r\n<>\s]+@[^\r\n<>\s]+)/im);
  var replyDomain = mReply ? (mReply[1] || '').split('@')[1] || '' : '';
  var replyMismatch = replyDomain && fromParts.domain && replyDomain.toLowerCase() !== fromParts.domain;

  var urls = body.match(/\bhttps?:\/\/[^\s)"]+/gi) || [];
  var shorteners = /(bit\.ly|tinyurl\.com|t\.co|goo\.gl|is\.gd|rb\.gy|shorturl\.at|cutt\.ly|ow\.ly|s\.id)/i;
  var manyShort = urls.filter(function (u) { return shorteners.test(u); }).length >= 2;

  var riskyMention = /\b\w+\.(html?|exe|scr|js|jar|bat|cmd|vbs|lnk|iso|img)\b/i.test(body);

  var phishy = /\b(verify your account|update your (?:payment|billing)|unusual (?:sign-in|activity)|password will be disabled|confirm your identity|your account will be closed|urgent action required)\b/i.test(body + " " + subj);

  return authFail || replyMismatch || manyShort || riskyMention || phishy;
}
function getMessageMeta_(messageId) {
  var res = Gmail.Users.Messages.get('me', messageId, {
    format: 'metadata',
    metadataHeaders: [
      'From', 'To', 'Reply-To', 'List-Id', 'List-Unsubscribe', 'Precedence', 'Auto-Submitted',
      'Message-Id', 'Sender', 'Return-Path', 'X-Mailer', 'Authentication-Results',
      'X-SES-Outgoing', 'X-SG-EID', 'X-Campaign', 'X-Transaction-Id', 'X-Order-Id'
    ]
  });
  var headers = {};
  ((res.payload && res.payload.headers) || []).forEach(function (h) { headers[h.name] = h.value; });
  return { labelIds: res.labelIds || [], headers: headers };
}

function wilsonLowerBound_(pos, n, z) {
  z = z || 1.96;
  if (!n) return 0;
  var phat = pos / n, zz = z * z, denom = 1 + zz / n;
  var num = phat + zz / (2 * n) - z * Math.sqrt((phat * (1 - phat) + zz / (4 * n)) / n);
  return num / denom;
}

function _coerceToString_(resp) {
  if (resp == null) return "";
  if (typeof resp === "string") return resp;
  if (typeof resp === "object") {
    if (typeof resp.text === "string") return resp.text;
    if (typeof resp.output === "string") return resp.output;
    if (resp.candidates && resp.candidates[0] && resp.candidates[0].content && resp.candidates[0].content.parts) {
      var parts = resp.candidates[0].content.parts;
      var pieces = [];
      for (var i = 0; i < parts.length; i++) if (typeof parts[i].text === "string") pieces.push(parts[i].text);
      return pieces.join("\n");
    }
    try { return JSON.stringify(resp); } catch (_) { return String(resp); }
  }
  return String(resp);
}
function _safeJsonParseLLM_(text) {
  if (!text) return null;
  text = text.replace(/```(?:json)?/gi, "").replace(/```/g, "");
  var start = text.indexOf("{");
  var end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) text = text.substring(start, end + 1);
  text = text.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
  try { return JSON.parse(text); } catch (e) { return null; }
}
function _numOrZero_(n) { n = Number(n); return isNaN(n) ? 0 : Math.max(0, Math.min(1, n)); }


function addCountingForAI_(textLength, vCount = 1) {
  setProperty_("ai_inputCharcter", textLength + Number(getProperty_("ai_inputCharcter")));
  setProperty_("ai_calls", vCount + Number(getProperty_("ai_calls")));
}


/***********************
 * Normalization helper
 ***********************/
function _normEmailParts_(s) {
  s = s || '';
  var m = s.match(/<([^>]+)>/);
  var email = (m ? m[1] : s).trim().toLowerCase();
  var name = s.replace(/<[^>]*>/g, '').trim();
  var domain = (email.split('@')[1] || '').toLowerCase();
  return { email: email, name: name, domain: domain };
}
function _headersToText_(headers) {
  if (!headers) return '';
  if (typeof headers === 'string') return headers;
  try {
    return Object.keys(headers).map(function (k) { return k + ': ' + headers[k]; }).join('\n');
  } catch (_) {
    return '';
  }
}

/************************************
 * 1) MARKETING / NEWSLETTER SCORER
 ************************************/
/**
 * Score whether an email looks like marketing/newsletter/promo.
 * @param {Object} e {from,to,subject,body,headers?}
 * @param {Object} [opts]
 * @param {string[]} [opts.internalDomains=['ssdspc.com']]
 * @param {number} [opts.threshold=3.5] Score >= threshold => isMarketing
 * @return {{isMarketing:boolean, score:number, reasons:string[]}}
 */
function scoreMarketingEmail_(e, opts) {
  opts = opts || {};
  var internalDomains = opts.internalDomains || ['ssdspc.com'];
  var threshold = typeof opts.threshold === 'number' ? opts.threshold : 3.5;

  var subj = (e.subject || '').trim();
  var body = (e.body || '').replace(/\r\n?/g, '\n');
  var headersText = _headersToText_(e.headers);
  var fromParts = _normEmailParts_(e.from || '');
  var toParts = _normEmailParts_(e.to || '');

  var reasons = [];
  var score = 0;

  function add(pts, why) { score += pts; reasons.push(why + ' (+' + pts + ')'); }
  function sub(pts, why) { score -= pts; reasons.push(why + ' (-' + pts + ')'); }
  function hasHeader(re) { return re.test(headersText); }
  function bHas(re) { return re.test(body); }
  function sHas(re) { return re.test(subj); }

  // Internal whitelist
  if (internalDomains.indexOf(fromParts.domain) !== -1 && internalDomains.indexOf(toParts.domain) !== -1) {
    return { isMarketing: false, score: 0, reasons: ['internal-domain whitelist'] };
  }

  // High-signal list/bulk headers
  if (hasHeader(/^\s*List-Id\s*:/im)) add(2.0, 'List-Id header');
  if (hasHeader(/^\s*List-Unsubscribe\s*:/im)) add(2.0, 'List-Unsubscribe header');
  if (hasHeader(/^\s*Precedence\s*:\s*(bulk|list)/im)) add(1.5, 'Precedence: bulk/list');
  if (hasHeader(/^\s*Auto-Submitted\s*:\s*auto/i)) add(1.0, 'Auto-Submitted');

  // ESP/provider fingerprints
  var providers = /mailchimp|mcsv|mandrillapp|sendgrid|sparkpost|mailgun|marketo|hubspot|hs-|constantcontact|campaign-?monitor|exacttarget|salesforce/i;
  if (providers.test(headersText) || providers.test(fromParts.domain)) add(1.5, 'marketing ESP');

  // Body cues
  if (bHas(/\bunsubscribe\b/i)) add(2.0, 'unsubscribe');
  if (bHas(/\b(update|manage)\s+(?:your\s+)?(preferences|subscription)\b/i)) add(1.0, 'manage preferences');
  if (bHas(/\b(view|read)\s+in\s+(your\s+)?browser\b/i) || bHas(/\bweb\s*version\b/i)) add(1.0, 'view in browser');
  if (bHas(/\butm_(source|medium|campaign|term|content)=/i) || bHas(/\bmc_(eid|cid)=/i)) add(1.0, 'tracking params');

  // URL density
  var urlCount = (body.match(/\bhttps?:\/\/[^\s)]+/gi) || []).length;
  var wordCount = (body.replace(/https?:\/\/[^\s)]+/g, '').match(/\b[\w'-]+\b/g) || []).length;
  var urlRatio = wordCount ? urlCount / Math.max(1, wordCount) : 0;
  if (urlCount >= 5 || urlRatio > 0.08) add(0.8, 'link-heavy');

  // Postal footer style
  if (bHas(/\b(unsubscribe|mailing address|you received this|why did I get this)\b/i) &&
    bHas(/\b(street|ave|road|rd\.|suite|ste\.|blvd|[A-Z]{2}\s*\d{5})\b/)) add(0.8, 'postal footer');

  // From/reply-to quirks
  var mReply = headersText.match(/^\s*Reply-To\s*:\s*.*<([^>]+)>/im) || headersText.match(/^\s*Reply-To\s*:\s*([^\r\n<>\s]+@[^\r\n<>\s]+)/im);
  var replyDomain = mReply ? (mReply[1] || '').split('@')[1] || '' : '';
  if (replyDomain && replyDomain.toLowerCase() !== fromParts.domain) add(0.6, 'reply-to mismatch');
  if (fromParts.name && /\bvia\b/i.test(fromParts.name)) add(0.5, '"via" sender');

  // Subject promo hints
  if (sHas(/\b(newsletter|sale|deal|promo|promotion|update|digest|roundup|webinar|event|announcement)\b/i)) add(0.6, 'promo word in subject');
  if (sHas(/% off|\b(save|discount)\b/i)) add(0.6, 'discount language');

  // Negative: transactional/operational signal (protect system emails)
  if (bHas(/\b(invoice|receipt|paid|payment|statement|order|purchase|ticket|case|request|approval|refill|fax details|you have received a fax)\b/i)) {
    sub(0.8, 'transactional/operational signal');
  }
  if (fromParts.domain === 'ssdspc.com') sub(2.0, 'internal sender');

  // Final classification
  var isMarketing = score >= threshold;
  return { isMarketing: isMarketing, score: Math.round(score * 100) / 100, reasons: reasons };
}

/****************************************
 * 2) TRANSACTIONAL / OPERATIONS SCORER
 ****************************************/
/**
 * Score whether an email is transactional/operational (orders, receipts, shipping, invoices).
 * @param {Object} e {from,to,subject,body,headers?}
 * @param {Object} [opts]
 * @param {string[]} [opts.trustedDomains] soft allow-list for vendors/carriers
 * @param {number} [opts.threshold=1.5] Score >= threshold => isTransactional
 * @return {{isTransactional:boolean, score:number, reasons:string[]}}
 */
function scoreTransactionalEmail_(e, opts) {
  opts = opts || {};
  var trusted = (opts.trustedDomains || [
    'amazon.com', 'amazon.in', 'paypal.com', 'shopifyemail.com', 'squareup.com',
    'stripe.com', 'intuit.com', 'quickbooks.intuit.com', 'apple.com', 'google.com',
    'notifications.google.com', 'microsoft.com', 'service.microsoft.com',
    'ups.com', 'usps.com', 'fedex.com', 'dhl.com', 'royalmail.com',
    'canadapost.postescanada.ca', 'shopify.com', 'woocommerce.com'
  ]).map(function (d) { return d.toLowerCase(); });
  var threshold = typeof opts.threshold === 'number' ? opts.threshold : 1.5;

  var subj = (e.subject || '').trim();
  var body = (e.body || '').replace(/\r\n?/g, '\n');
  var headersText = _headersToText_(e.headers);
  var fromParts = _normEmailParts_(e.from || '');

  var reasons = [];
  var score = 0;
  function add(pts, why) { score += pts; reasons.push(why + ' (+' + pts + ')'); }

  // Strong transactional keywords (subject/body)
  var transactionalRxs = [
    /\border (confirmation|confirmed|received)\b/i,
    /\border\s*(no\.|number|id)\s*[:#]?\s*[A-Z0-9\-]{5,}/i,
    /\binvoice\b|\breceipt\b|\bbill(?:ing)?\b|\bstatement\b/i,
    /\b(shipped|shipping|shipment|tracking|out for delivery|delivered)\b/i,
    /\bestimated delivery\b|\barrival date\b|\bexpected by\b/i,
    /\bitem(?:s)?\b.*\bqty\b/i,
    /\bsku\b|\bpart\s*#\b/i,
    /\border\s*total\b|\bamount\b|\bsubtotal\b/i,
    /\brefund\b|\bcredit\b|\bpayment\b|\bpaid\b/i,
    /\bpurchase\b|\border updates?\b/i,
    /\btracking\s*(number|no\.|id)\b/i
  ];
  if (transactionalRxs.some(function (rx) { return rx.test(subj) || rx.test(body); })) {
    add(2.2, 'transactional keywords');
  }

  // Order number patterns
  if (/\b\d{3}-\d{7}-\d{7}\b/.test(body) || /\b[A-Z0-9]{6,}-[A-Z0-9-]{4,}\b/.test(body)) {
    add(0.8, 'order id pattern');
  }

  // Carriers & payment platforms
  var opsVendors = /\b(ups|usps|fedex|dhl|lasership|ontrac|royal mail|canada post|auspost|evri|yodel|sf express|bluedart|delhivery|ecom express|xpressbees|shiprocket|stripe|paypal|adyen|square|shopify|woocommerce|amazon|apple|google|microsoft|intuit|quickbooks)\b/i;
  if (opsVendors.test(body) || opsVendors.test(subj) || opsVendors.test(fromParts.domain)) {
    add(0.9, 'ops/payment vendor');
  }

  // Structured table-ish cues (items/qty/price rows)
  var hasTableish = /\b(item|description)\b.*\b(qty|quantity)\b.*\b(price|amount|total)\b/i.test(body);
  if (hasTableish) add(0.7, 'line-items table');

  // Headers that often appear on transactional mail
  if (/^\s*X-Transaction-Id\s*:/im.test(headersText) || /^\s*X-Order-Id\s*:/im.test(headersText)) {
    add(0.6, 'transaction id header');
  }

  // Trusted sender domains (soft)
  if (trusted.indexOf(fromParts.domain) !== -1 &&
    !/\b(newsletter|sale|deal|promo|promotion|discount|% off)\b/i.test(subj)) {
    add(1.2, 'trusted transactional sender');
  }

  // If there’s an unsubscribe but also strong transactional cues, still consider transactional
  if (/\bunsubscribe\b/i.test(body) && score >= 2.2) {
    add(0.8, 'unsubscribe present but transactional context');
  }

  var isTransactional = score >= threshold;
  return { isTransactional: isTransactional, score: Math.round(score * 100) / 100, reasons: reasons };
}

function checktypeofemail_(row) {
  // row = {from,to,subject,body,headers?,timestamp?}
  var m = scoreMarketingEmail_(row, { internalDomains: ['ssdspc.com'], threshold: 3.5 });
  var t = scoreTransactionalEmail_(row, { threshold: 1.5 });

  var decision = t.isTransactional ? 'TRANSACTIONAL'
    : m.isMarketing ? 'MARKETING'
      : 'NORMAL';

  return { decision: decision, marketing: m, transactional: t };
}

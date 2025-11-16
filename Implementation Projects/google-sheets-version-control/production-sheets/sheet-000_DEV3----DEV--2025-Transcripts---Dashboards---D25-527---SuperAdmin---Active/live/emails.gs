
const transcriptDestnFolderID_emails = '1poVzIRAQCiOVmffT9F-VkPpedJkYfXjw';
const transcriptDestnFolderID_emails_Spam = '1mu8e_vft5DogXVB1dThPTOMblg3DUxHo';

function schedulePerDay_Emails() {
  var sDate = Utilities.formatDate(new Date(new Date().setDate(new Date().getDate() - 1)), Session.getScriptTimeZone(), "yyyy-MM-dd");
  generateTranscriptForEmails_(sDate);
}

function testaegG44533() {
  var sDate = "2025-09-23";
  generateTranscriptForEmails_(sDate);
}

function generateAllEmailTrnascripts() {
  var bLoop = true;

  while (bLoop) {
    var sDate = getProperty_("EmailExtractionDate");

    if ((new Date(sDate)).getFullYear() != 2025) {
      bLoop = false;
      break;
    }

    console.log(sDate);

    generateTranscriptForEmails_(sDate);

    setProperty_("EmailExtractionDate", fmt_(getNewDay_(sDate, -1)));

    if (isOverTime_(1000 * 60 * 13)) bLoop = false;
  }
}

function generateTranscriptForEmails_(sDate) {
  //>>
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Emails");

  var allHeaderObj = makeObjHeaderDetails_FromSheet_({ sheet, bRich: true });

  var allDataObj_rich = makeObjectData_(sheet.getDataRange().getRichTextValues(), true);
  var allDataObj_dv = makeObjectData_(sheet.getDataRange().getDisplayValues(), false);

  var allData_RowsToDel = [];

  allDataObj_rich.forEach((r, x) => {
    var vRow = x + 2;

    var rowObj_rich = allDataObj_rich[x];
    var rowObj_dv = allDataObj_dv[x];

    if (rowObj_dv["Date"] == sDate) {
      var fileUrl = rowObj_rich["Doc Link"].getLinkUrl();
      if (!fileUrl) return;

      var fileId = getGoogleDriveId_(fileUrl);
      if (!fileId) return;

      // try {
      //   Drive.Files.remove(fileId, { supportsAllDrives: true });
      // } catch (err) {
      //   console.log(err);
      try {
        DriveApp.getFileById(fileId).setTrashed(true);
      } catch (err) {
        console.log(err);
      }
      // }

      allData_RowsToDel.push(vRow);
    }
  });

  allData_RowsToDel.reverse();

  var allData_RowsToDel_range = [];

  allData_RowsToDel.map(function (r, x) {
    if (x == 0) {
      allData_RowsToDel_range.push([r, 1]);
    } else {
      var vLastRow = allData_RowsToDel_range[allData_RowsToDel_range.length - 1][0];
      var vLastNoOfRows = allData_RowsToDel_range[allData_RowsToDel_range.length - 1][1];
      if (vLastRow - r == 1) {
        allData_RowsToDel_range[allData_RowsToDel_range.length - 1][0] = r;
        allData_RowsToDel_range[allData_RowsToDel_range.length - 1][1] = vLastNoOfRows + 1;
      } else if (r != "") {
        allData_RowsToDel_range.push([r, 1]);
      }
    }
  });

  allData_RowsToDel_range.map(function (xx) {
    sheet.deleteRows(xx[0], xx[1]);
  });
  //<<

  //>> SPAM
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Spam Emails");

  var allHeaderObj = makeObjHeaderDetails_FromSheet_({ sheet, bRich: true });

  var allDataObj_rich = makeObjectData_(sheet.getDataRange().getRichTextValues(), true);
  var allDataObj_dv = makeObjectData_(sheet.getDataRange().getDisplayValues(), false);

  var allData_RowsToDel = [];

  allDataObj_rich.forEach((r, x) => {
    var vRow = x + 2;

    var rowObj_rich = allDataObj_rich[x];
    var rowObj_dv = allDataObj_dv[x];

    if (rowObj_dv["Date"] == sDate) {
      var fileUrl = rowObj_rich["Doc Link"].getLinkUrl();
      if (!fileUrl) return;

      var fileId = getGoogleDriveId_(fileUrl);
      if (!fileId) return;

      // try {
      //   Drive.Files.remove(fileId, { supportsAllDrives: true });
      // } catch (err) {
      //   console.log(err);
      try {
        DriveApp.getFileById(fileId).setTrashed(true);
      } catch (err) {
        console.log(err);
      }
      // }

      allData_RowsToDel.push(vRow);
    }
  });

  allData_RowsToDel.reverse();

  var allData_RowsToDel_range = [];

  allData_RowsToDel.map(function (r, x) {
    if (x == 0) {
      allData_RowsToDel_range.push([r, 1]);
    } else {
      var vLastRow = allData_RowsToDel_range[allData_RowsToDel_range.length - 1][0];
      var vLastNoOfRows = allData_RowsToDel_range[allData_RowsToDel_range.length - 1][1];
      if (vLastRow - r == 1) {
        allData_RowsToDel_range[allData_RowsToDel_range.length - 1][0] = r;
        allData_RowsToDel_range[allData_RowsToDel_range.length - 1][1] = vLastNoOfRows + 1;
      } else if (r != "") {
        allData_RowsToDel_range.push([r, 1]);
      }
    }
  });

  allData_RowsToDel_range.map(function (xx) {
    sheet.deleteRows(xx[0], xx[1]);
  });
  //<<

  getEmailsFromBQ_(sDate);

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Emails");
  var allHeaderObj = makeObjHeaderDetails_FromSheet_({ sheet, bRich: true });
  if (sheet.getLastRow() > 2) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).sort([{ column: allHeaderObj["Date"].columnNumber, ascending: false }]);
  }

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Spam Emails");
  var allHeaderObj = makeObjHeaderDetails_FromSheet_({ sheet, bRich: true });
  if (sheet.getLastRow() > 2) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).sort([{ column: allHeaderObj["Date"].columnNumber, ascending: false }]);
  }
}

function getEmailsFromBQ_(sDate) {

  var fields = [
    "message_id"
    , "email_address_from"
    , "email_address_to"
    , "email_address_cc"
    , "email_address_bcc"
    , "email_subject"
    , "email_body"
    , "attachments"
    , "email_received_date"
  ];

  //>>
  var filters = [
    { field: `DATE(email_received_date, "Etc/GMT+6")`, operator: "BETWEEN", value: [sDate, sDate] }
    // , { field: `email_address_from`, operator: "DOES_NOT_CONTAIN", value: '@google.com' }
    , { field: `email_address_from`, operator: "DOES_NOT_CONTAIN", value: 'apps-scripts-notifications@google.com' }
    , { field: `email_address_from`, operator: "NOT_EQUALS", value: 'chat-noreply@google.com' }
    , { field: `email_address_from`, operator: "DOES_NOT_CONTAIN", value: '@sendfax.to' }
    , { field: `email_address_from`, operator: "NOT_EQUALS", value: 'copier@ssdspc.com' }
    , { field: `email_address_to`, operator: "NOT_EQUALS", value: 'documents@ssdspc.com' }
    , { field: `email_address_to`, operator: "NOT_EQUALS", value: 'voicemail@ssdspc.com' }
    , { field: `email_subject`, operator: "DOES_NOT_CONTAIN", value: 'Daily Practice Email for ' }
  ];

  var query = buildBigQueryQuery_({ filters: filters, fields, projectId: PROJECT_ID, datasetId: DATASET_ID_EMAILS, tableId: TABLE_ID_EMAILS, sortField: 'email_received_date' });

  var results = runBigQueryQuery_({ query, projectId: PROJECT_ID });
  //<<

  if (results.length == 0) return;

  var allSpamEmailList = getEmailListOfSpams_();

  var combinedText = "";
  var combinedText_Spam = "";

  var vTotalEmails = 0;
  var vTotalEmails_Spam = 0;

  var allFiles = [];
  var allFiles_Spam = [];

  var allIdMap = [];

  results.forEach(r => {

    if (allIdMap.includes(r["message_id"])) return;
    allIdMap.push(r["message_id"]);

    var bSpamEmail = allSpamEmailList.includes(r["email_address_from"].toString().toLowerCase());

    if (!bSpamEmail) {
      var objRow = {
        "from": r["email_address_from"]
        , "to": r["email_address_to"]
        , "subject": r["email_subject"]
        , "body": r["email_body"]
      };

      var typeofemail = checktypeofemail_(objRow);

      if (typeofemail.marketing.isMarketing == true && typeofemail.transactional.isTransactional == false) {
        bSpamEmail = true;
      }
    }

    var sNewEmailText = `${lineBreakChar}${lineBreakChar}--- NEW EMAIL ---${lineBreakChar}`;

    var ddate = new Date(r["email_received_date"]);
    var sDate = Utilities.formatDate(ddate, "GMT-06:00", "yyyy-MM-dd HH:mm:ss");

    sNewEmailText += `${lineBreakChar}message_id: ${r["message_id"]}`;

    sNewEmailText += `${lineBreakChar}Date and time: ${sDate}`;

    sNewEmailText += `${lineBreakChar}From: ${r["email_address_from"]}`;

    sNewEmailText += `${lineBreakChar}To: ${r["email_address_to"]}`;

    if (r["email_address_cc"] && r["email_address_cc"] != "") {
      sNewEmailText += `${lineBreakChar}CC: ${r["email_address_cc"]}`;
    }

    if (r["email_address_bcc"] && r["email_address_bcc"] != "") {
      sNewEmailText += `${lineBreakChar}BCC: ${r["email_address_bcc"]}`;
    }

    sNewEmailText += `${lineBreakChar}Subject : ${r["email_subject"]}`;

    var cleanedBody = cleanEmailBody_(r["email_body"]).text.toString().trim();
    if (cleanedBody == "") return;

    sNewEmailText += `${lineBreakChar}Body :${lineBreakChar}${cleanedBody}`;

    var sAttchmentText = "";
    var vtotalAtch = 0;
    r["attachments"].filter(atch => atch && !["[PDF OCR required]", "[Image OCR required]", "[NA]", ""].includes(atch.ocr_text.toString().trim())).forEach((atch, x) => {
      vtotalAtch++;
      sAttchmentText += `${lineBreakChar}Attachment${vtotalAtch}:${lineBreakChar}${atch.ocr_text}`;

    });

    if (sAttchmentText != "") {
      sNewEmailText += `${sAttchmentText}`;
    }

    if (bSpamEmail) {
      vTotalEmails_Spam++;
      combinedText_Spam += sNewEmailText;
    } else {
      vTotalEmails++;
      combinedText += sNewEmailText;
    }

    if (combinedText.length >= 5000000) {
      allFiles.push({ combinedText, vTotalEmails });
      vTotalEmails = 0;
      combinedText = "";
    }

    if (combinedText_Spam.length >= 5000000) {
      allFiles_Spam.push({ combinedText_Spam, vTotalEmails_Spam });
      vTotalEmails_Spam = 0;
      combinedText_Spam = "";
    }

  });

  if (combinedText != "") {
    allFiles.push({ combinedText, vTotalEmails });
  }

  if (combinedText_Spam != "") {
    allFiles_Spam.push({ combinedText_Spam, vTotalEmails_Spam });
  }

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Emails");
  var folder = DriveApp.getFolderById(transcriptDestnFolderID_emails);

  allFiles.forEach((obj, x) => {
    var docName = `Email Transcript - ${sDate} (${x + 1})`;
    console.log(docName);

    var blob = Utilities.newBlob(obj.combinedText, 'text/plain', docName);
    var doc = folder.createFile(blob);

    var vRow = sheet.getLastRow() + 1;

    var richText = SpreadsheetApp.newRichTextValue().setText(docName).setLinkUrl(doc.getUrl()).build();
    sheet.getRange(vRow, 2).setRichTextValue(richText);

    sheet.getRange(vRow, 1).setValue(sDate);
    sheet.getRange(vRow, 3).setValue(obj.vTotalEmails);
    sheet.getRange(vRow, 4).setValue(obj.combinedText.length);
  });

  var sheet_Spam = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Spam Emails");
  var folder_Spam = DriveApp.getFolderById(transcriptDestnFolderID_emails_Spam);

  allFiles_Spam.forEach((obj, x) => {
    var docName = `Email Transcript [SPAM] - ${sDate} (${x + 1})`;
    console.log(docName);

    var blob = Utilities.newBlob(obj.combinedText_Spam, 'text/plain', docName);
    var doc = folder_Spam.createFile(blob);

    var vRow = sheet_Spam.getLastRow() + 1;

    var richText = SpreadsheetApp.newRichTextValue().setText(docName).setLinkUrl(doc.getUrl()).build();
    sheet_Spam.getRange(vRow, 2).setRichTextValue(richText);

    sheet_Spam.getRange(vRow, 1).setValue(sDate);
    sheet_Spam.getRange(vRow, 3).setValue(obj.vTotalEmails_Spam);
    sheet_Spam.getRange(vRow, 4).setValue(obj.combinedText_Spam.length);
  });

}

function getEmailListOfSpams_() {
  SpreadsheetApp.flush();
  var sheetEmailList = SpreadsheetApp.openById("1flvHjud5Ppw-QDq1CQr82fXAJXyJsYlqSCY5LNvAotI").getSheetByName("Email List");
  var allData = sheetEmailList.getDataRange().getValues();
  var allHeaders = allData[0];
  var objHeaders = makeObjHeaderDetails_({ allHeaders });

  var allPromoEmails = [];

  for (var rr = 1; rr < allData.length; rr++) {
    var sEmail = String(allData[rr][objHeaders["Email Addresses"].columnIndex] || "").toLowerCase();
    var sSpam = allData[rr][objHeaders["Spam"].columnIndex];

    if (sEmail == "") continue;
    if (sSpam == "yes" && sEmail != "") {
      allPromoEmails.push(sEmail);
    }
  }

  return allPromoEmails;
}

function getMetricsFromBQ() {
  const sheetMetrics = ss.getSheetByName("Metrics");

  var query = `SELECT
  EXTRACT(YEAR FROM email_received_date) AS year,
  EXTRACT(MONTH FROM email_received_date) AS month,
  COUNT(DISTINCT message_id) AS unique_count
FROM
  ${backquote}pdf-ocr-extraction-461917.emails_dataset.all_emails${backquote}
GROUP BY
  year, month
ORDER BY
  year, month`;

  var results = runBigQueryQuery_({ query, projectId: PROJECT_ID });

  var alldata = [];

  results.forEach(r => {
    var dDate = Utilities.formatDate(new Date(`${r.year}-${r.month}-01`), Session.getScriptTimeZone(), "MMMM yyyy");
    alldata.push([dDate, r.unique_count]);
  })

  if (alldata.length > 0) {
    sheetMetrics.getRange(2, 1, alldata.length, alldata[0].length).setValues(alldata);
  }

}

/**
 * Clean an email body for summarization / transcripts.
 * Usage: const cleaned = cleanEmailBody(rawBody).text;
 *
 * @param {string} body - Raw email body (plain text or simple HTML).
 * @param {Object} [opts]
 * @param {boolean} [opts.keepReplyHeader=false] - Keep the first reply header line (e.g., "On Mon, ... wrote:") for context.
 * @param {number}  [opts.maxChars=0] - If >0, truncate the cleaned text to this many characters (adds ellipsis).
 * @param {boolean} [opts.debug=false] - If true, returns which rules fired.
 * @return {{text:string, removed:Object}} text is cleaned body. removed has booleans for which rules applied.
 */
function cleanEmailBody_(body, opts) {
  opts = opts || {};
  var removed = {
    htmlTags: false,
    quotedLines: false,
    quotedTail: false,
    confidentiality: false,
    signatureDash: false,
    contactBlock: false,
    boilerplate: false,
    whitespace: false,
    truncated: false
  };

  if (!body) return { text: '', removed: removed };

  // 1) Normalize line endings & decode a few common HTML entities early.
  var txt = String(body)
    .replace(/\r\n?/g, '\n')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\u00A0/g, ' '); // non-breaking space

  // 2) Strip simple HTML tags if present (keeps inner text).
  if (/<[a-z][\s\S]*>/i.test(txt)) {
    txt = txt.replace(/<\/?(style|script|head|meta|link)[\s\S]*?>/gi, ''); // drop non-content tags wholesale
    txt = txt.replace(/<br\s*\/?>/gi, '\n');
    txt = txt.replace(/<\/p\s*>/gi, '\n\n');
    txt = txt.replace(/<[^>]+>/g, '');
    removed.htmlTags = true;
  }

  // 3) Remove inline image/file placeholders and CID refs.
  txt = txt
    .replace(/\b(cid:|inline image|image\.png|image\.jpg|attachment)\b.*$/gim, '')
    .replace(/\n{3,}/g, '\n\n');

  // 4) Drop fully quoted lines (those beginning with >).
  var before = txt;
  txt = txt.replace(/^>.*$/gm, '');
  if (txt !== before) removed.quotedLines = true;

  // 5) Cut off quoted thread tail starting at common reply headers.
  //    Example: "On Mon, Sep 15, 2025 at 4:23 PM John <x@y.com> wrote:"
  var replyHeaderRegex = /(?:^|\n)On .*?(?:AM|PM).*?wrote:\s*$/im;
  var m = replyHeaderRegex.exec(txt);
  if (m) {
    if (opts.keepReplyHeader) {
      txt = txt.slice(0, m.index + (m[0].startsWith('\n') ? 1 : 0)) + m[0].trim();
    } else {
      txt = txt.slice(0, m.index).trim();
    }
    removed.quotedTail = true;
  }

  // 5b) Remove forwarded/quoted older-message blocks (safer).
  (function stripForwardedBlocks() {
    // Strong separators we trust
    var fwdSeparators = [
      /(?:^|\n)\s*[-]{6,}\s*Forwarded message\s*[-]{6,}\s*$/im,
      /(?:^|\n)\s*Begin forwarded message:\s*$/im
    ];
    for (var i = 0; i < fwdSeparators.length; i++) {
      var m = fwdSeparators[i].exec(txt);
      if (m) { txt = txt.slice(0, m.index).trim(); return; }
    }

    // Fallback: detect a compact header cluster of REAL headers (not "Fax From")
    // We require >=3 distinct exact headers among: From/To/Cc/Bcc/Date/Subject within a 10-line window.
    var lines = txt.split('\n');
    var headerRe = /^(From|To|Cc|Bcc|Date|Subject):\s/i; // exact tokens only
    var headerIdxs = [];
    for (var li = 0; li < lines.length; li++) {
      if (headerRe.test(lines[li])) headerIdxs.push(li);
    }
    if (headerIdxs.length >= 3) {
      // Find the first place where 3 headers fall within a 10-line span
      for (var k = 0; k <= headerIdxs.length - 3; k++) {
        var a = headerIdxs[k], b = headerIdxs[k + 2];
        if (b - a <= 10) {
          // Extra confidence: look for an email-like angle bracket or "wrote:" nearby
          var windowStart = Math.max(0, a - 2), windowEnd = Math.min(lines.length, b + 8);
          var windowText = lines.slice(windowStart, windowEnd).join('\n');
          if (/[<][^>]+@[^>]+[>]/.test(windowText) || /\bwrote:\s*$/im.test(windowText)) {
            txt = lines.slice(0, a).join('\n').trim();
            return;
          }
        }
      }
    }
  })();



  // 7c) Drop short closers like "Thanks," + a name at the end (2-line max).
  txt = txt.replace(/\n(?:Thanks( all)?|Thank you|Regards|Best|Sincerely),?\s*\n[^\n]{0,60}$/i, '');

  // 8b) More boilerplate variants (multilingual + mobile clients).
  var moreBoilerplate = [
    /^Sent from my Mac/i,
    /^Sent from Mail for Windows/i,
    /^Enviado desde mi iPhone/i,
    /^Enviado desde mi iPad/i
  ];
  moreBoilerplate.forEach(function (rx) {
    txt = txt.replace(new RegExp('(?:^|\\n)' + rx.source + '[\\s\\S]*$', 'm'), function () {
      removed.boilerplate = true;
      return '';
    });
  });

  // 11) Optional PHI/PII redaction (enable via opts.redact === true)
  if (opts.redact) {
    // Phones
    txt = txt.replace(/\b(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/g, '[PHONE]');
    // DOB-like dates (MM/DD/YY(YY))
    txt = txt.replace(/\b(0?[1-9]|1[0-2])[\/\-](0?[1-9]|[12][0-9]|3[01])[\/\-](\d{2}|\d{4})\b/g, '[DOB]');
    // Simple ID tokens (5+ digits near clinical keywords)
    txt = txt.replace(/\b(?:(?:MRN|ID|Acct|Account|Case|Chart)\s*#?:?\s*)?\d{5,}\b/g, '[ID]');
    // Light name redaction in scheduling statements (very conservative)
    txt = txt.replace(/\b(?:scheduled|schedule|set|booked)\s+(?:[A-Z][a-z]+(?:\s[A-Z][a-z]+)+)/gi, function (m) {
      return m.replace(/([A-Z][a-z]+(?:\s[A-Z][a-z]+)+)/, '[NAME]');
    });
  }

  // 6) Remove confidentiality / legal disclaimers (v2).
  // Truncate from the first disclaimer marker (heading or body-opener) to the end.
  (function stripDisclaimersV2() {
    // Normalize first; you likely already did this above:
    // txt = txt.replace(/\r\n?/g, '\n');

    // 6a) Headings like "-----Message Disclaimer-----" or "CONFIDENTIALITY NOTICE"
    var headingRxs = [
      // "-----Message Disclaimer-----" (any count/type of dash, optional spaces)
      /(?:^|\n)\s*[-\u2012-\u2015]{2,}\s*message\s+disclaimer\s*[-\u2012-\u2015]{2,}\s*$/im,
      // "Message Disclaimer" as a standalone heading line
      /(?:^|\n)\s*message\s+disclaimer\s*$/im,
      // "WARNING: CONFIDENTIALITY NOTICE" (warning: optional, dashes: optional)
      /(?:^|\n)\s*(?:warning[:\-\s]*)?\s*confidentiality\s+notice\b.*$/im,
      // Other common headings
      /(?:^|\n)\s*notice\s+of\s+confidentiality\b.*$/im,
      /(?:^|\n)\s*privileged\s+and\s+confidential\b.*$/im,
      /(?:^|\n)\s*confidential\s+and\s+privileged\b.*$/im
    ];

    // 6b) Body openers (catch when there isn't a clear heading).
    // We’ll only scan the tail (last ~6000 chars) to avoid false positives.
    var bodyOpeners = [
      /(?:^|\n)\s*If you are not the intended recipient[\s\S]*$/i,
      /(?:^|\n)\s*This (?:message|e-?mail)\b[\s\S]*?(?:confidential|privileged)[\s\S]*$/i,
      /(?:^|\n)\s*The information contained in this (?:message|e-?mail)[\s\S]*$/i,
      /(?:^|\n)\s*.*exempt from disclosure under applicable law[\s\S]*$/i
    ];

    // Try headings first (full text)
    var cutIdx = -1, m;
    for (var i = 0; i < headingRxs.length; i++) {
      m = headingRxs[i].exec(txt);
      if (m) { cutIdx = m.index; break; }
    }

    // If no heading match, check tail for body openers
    if (cutIdx === -1) {
      var tailStart = Math.max(0, txt.length - 6000);
      var tail = txt.slice(tailStart);
      for (var j = 0; j < bodyOpeners.length; j++) {
        var bm = bodyOpeners[j].exec(tail);
        if (bm) { cutIdx = tailStart + bm.index; break; }
      }
    }

    if (cutIdx !== -1) {
      txt = txt.slice(0, cutIdx).trimEnd();
      removed.confidentiality = true;
    }
  })();



  // 7) Remove signature blocks.
  // 7a) Dash signature delimiter: lines after `--` (standard).
  var dashSigIdx = txt.search(/\n--\s*\n/);
  if (dashSigIdx !== -1) {
    txt = txt.slice(0, dashSigIdx).trim();
    removed.signatureDash = true;
  }
  // 7b) Heuristic signature/contact block near the end — SAFER:
  // Only trim if we also see a signature signal: a delimiter `--`, a human name line, or a closer like "Thanks,".
  (function stripSignatureSafely() {
    var lines = txt.split('\n');
    if (lines.length < 4) return;

    // Detect if this looks like a machine/system notice; if so, skip trimming.
    var whole = txt.toLowerCase();
    var isSystemish =
      /you(?:'|’)ve got fax|sendfax\.to|no-?reply|automated|do not reply/i.test(txt) ||
      /^#|\n#|\n##/.test(txt); // markdown headings common in notifications
    if (isSystemish) return;

    // Signature delimiter?
    var delimIdx = txt.search(/\n--\s*\n/);
    if (delimIdx !== -1) { txt = txt.slice(0, delimIdx).trim(); return; }

    // Closing phrase near the end?
    var closingIdx = -1;
    for (var i = Math.max(0, lines.length - 12); i < lines.length; i++) {
      if (/^\s*(Thanks( all)?|Thank you|Regards|Best|Sincerely)[,]?\s*$/i.test(lines[i])) {
        closingIdx = i; break;
      }
    }

    // Human-name signature line? (Firstname Lastname, optional middle/accents)
    var nameIdx = -1;
    var nameRe = /^\s*[A-ZÁÉÍÓÚÑÄÖÜ][a-záéíóúñäöü]+(?:\s+[A-ZÁÉÍÓÚÑÄÖÜ][a-záéíóúñäöü]+){1,3}\s*$/;
    for (var j = Math.max(0, lines.length - 12); j < lines.length; j++) {
      if (nameRe.test(lines[j])) { nameIdx = j; break; }
    }

    // Contact markers as a secondary signal, but only if we have a signature signal
    var contactMarkers = [
      /\bPhone\b/i, /\bMobile\b/i, /\bCell\b/i, /\bFax\b/i, /\bOffice\b/i, /\bDirect\b/i, /\bTel\b/i, /\bEmail\b/i,
      /\bwww\./i, /\bhttps?:\/\//i, /\bext\b/i, /\bCFO\b|\bCEO\b|\bCTO\b|\bManager\b|\bDirector\b/i
    ];
    var hasContact = false, firstContactLine = -1;
    for (var k = Math.max(0, lines.length - 12); k < lines.length; k++) {
      for (var cm = 0; cm < contactMarkers.length; cm++) {
        if (contactMarkers[cm].test(lines[k])) {
          hasContact = true;
          if (firstContactLine === -1) firstContactLine = k;
          break;
        }
      }
    }

    var cutAt = -1;
    if (closingIdx !== -1 && (nameIdx !== -1 || hasContact)) cutAt = closingIdx;
    else if (nameIdx !== -1 && hasContact) cutAt = nameIdx;

    if (cutAt !== -1) {
      txt = lines.slice(0, cutAt).join('\n').trim();
      removed.contactBlock = true;
    }
  })();

  // 8) Remove common boilerplate closers (opt-in).
  var boilerplateClosers = [
    /^Sent from my iPhone/i,
    /^Sent from my iPad/i,
    /^Get Outlook for (?:iOS|Android)/i
  ];
  boilerplateClosers.forEach(function (rx) {
    txt = txt.replace(new RegExp('(?:^|\\n)' + rx.source + '[\\s\\S]*$', 'm'), function (match, offset) {
      removed.boilerplate = true;
      return '';
    });
  });

  // 9) Cleanup whitespace: collapse 3+ blank lines, trim spaces on lines, then trim ends.
  before = txt;
  txt = txt
    .split('\n')
    .map(function (l) { return l.replace(/[ \t]+$/g, ''); })
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  if (txt !== before) removed.whitespace = true;

  // 10) Truncate if requested.
  if (opts.maxChars && opts.maxChars > 0 && txt.length > opts.maxChars) {
    txt = txt.slice(0, opts.maxChars - 1).trimEnd() + '…';
    removed.truncated = true;
  }

  // 12) Remove common system footers (notifications, timestamps, etc.)
  (function stripSystemFooters() {
    var footerMarkers = [
      /^This email was sent by /i,
      /^This message was sent by /i,
      /^This notification was generated by /i,
      /^The UTC Time at generation/i
    ];

    var lines = txt.split('\n');
    for (var i = 0; i < lines.length; i++) {
      for (var j = 0; j < footerMarkers.length; j++) {
        if (footerMarkers[j].test(lines[i])) {
          txt = lines.slice(0, i).join('\n').trim();
          return;
        }
      }
    }
  })();

  // 2b) Remove image placeholders / inline image artifacts (robust).
  (function stripImagePlaceholders() {
    // Normalize weird spaces that can break regexes
    txt = txt.replace(/[\u00A0\u200B\u200C\u200D\uFEFF]/g, ' '); // NBSP & zero-width

    // A) Markdown image syntax: ![alt](url)
    txt = txt.replace(/!\[[^\]]*]\([^)]*\)/g, '');

    // B) Bracketed placeholders anywhere in the text, e.g. "[image: Logo]" or "[Image from iOS]"
    //    - case-insensitive
    //    - colon optional
    //    - trims any trailing whitespace created
    txt = txt.replace(/\s*\[(?:image|img)\s*:?\s*[^\]]*]\s*/gi, ' ');

    // C) Standalone lines like "Inline image 1", "image001.png", "image.png", etc.
    txt = txt.replace(/^\s*(?:inline\s*image(?:\s*\d+)?|image\d{0,3}\.(?:png|jpe?g|gif)|image\.(?:png|jpe?g|gif))\s*$/gim, '');

    // D) CID or attachment tokens on their own line
    txt = txt.replace(/^\s*(?:cid:[^\s]+|attachment(?:\s+\S+)?\.(?:png|jpe?g|gif))\s*$/gim, '');

    // E) If the placeholder remains at end of a real content line, drop just the token
    txt = txt.replace(/\s*\[(?:image|img)\s*:?\s*[^\]]*]\s*$/gim, '');

    // Cleanup: collapse extra blank lines
    txt = txt.replace(/\n{3,}/g, '\n\n');
  })();



  return opts.debug ? { text: txt, removed: removed } : { text: txt, removed: {} };

  // ---- helpers ----
  function escapeRegex(s) {
    return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
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

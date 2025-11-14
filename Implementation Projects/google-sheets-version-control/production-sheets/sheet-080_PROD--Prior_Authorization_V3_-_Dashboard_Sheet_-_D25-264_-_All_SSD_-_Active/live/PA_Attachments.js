/** ========== CONFIG (parser-safe) ========== */
var PA_ATTACH = (this.PA_ATTACH) ? this.PA_ATTACH : {};
PA_ATTACH.CFG = {
  DEST_SPREADSHEET_ID: "1hOVAmQo3M2kIBoMQZ5fYqMflZh8_iAxL66-nA1ZGTR8",
  DEST_SHEET_NAME: "PA_Attachments",
  TARGET_EMAIL: "pa@ssdspc.com",
  TIMEZONE: Session.getScriptTimeZone ? Session.getScriptTimeZone() : "America/El_Salvador",
  ATTACH_SUBFOLDER_NAME: "PA_attachments (attachments)",
  // If your spreadsheet lives in a Shared Drive, set this to the *folder ID* you want files saved into.
  // Leave empty/null to fall back to the spreadsheet's parent or My Drive root.
  DEST_FOLDER_ID: "" // e.g. "0AJxxxxxxxxxxxxxxxxxxxxx" (optional)
};

/** ========== UI ========== */
// function onOpen() {
//   try {
//     SpreadsheetApp.getUi()
//       .createMenu("Utilities")
//       .addItem("Pull PA attachments (now)", "PA_pullPAEmailAttachments")
//       .addToUi();
//   } catch (e) {}
// }

/** Run this to fetch and log attachments */
function PA_pullPAEmailAttachments() {
  var C = PA_ATTACH.CFG;
  var ss = SpreadsheetApp.openById(C.DEST_SPREADSHEET_ID);
  var sh = ss.getSheetByName(C.DEST_SHEET_NAME);
  if (!sh) throw new Error("Sheet '" + C.DEST_SHEET_NAME + "' not found.");

  var H = _getHeaderMap_(sh);

  // De-dup by MessageId (use getValues for exact, not display)
  var last = sh.getLastRow();
  var loggedIds = {};
  if (last >= 2 && H["MessageId"] !== undefined) {
    var idCol = H["MessageId"] + 1;
    var ids = sh.getRange(2, idCol, last - 1, 1).getValues();
    for (var i = 0; i < ids.length; i++) {
      var v = ids[i][0];
      if (v) loggedIds[String(v)] = true;
    }
  }

  // Target folder to store attachments (Shared Drive safe if DEST_FOLDER_ID provided)
  var attFolder = _getOrCreateSubfolderSafe_(C.DEST_SPREADSHEET_ID, C.ATTACH_SUBFOLDER_NAME, C.DEST_FOLDER_ID);

  // Gmail search: be robust to aliases/groups and BCC.
  // - deliveredto: matches the mailbox that actually received the message
  // - keep has:attachment and a 14 day window
  // - in:anywhere so archived mail is included
  var query = '(deliveredto:' + C.TARGET_EMAIL + ' OR to:' + C.TARGET_EMAIL + ') has:attachment newer_than:14d in:anywhere';
  var threads = GmailApp.search(query, 0, 200);
  Logger.log("Query: %s | threads found: %s", query, threads ? threads.length : 0);
  if (!threads || threads.length === 0) return;

  var maxCO = _maxInColumn_(sh, H["CO"]);
  var appended = 0;

  for (var t = 0; t < threads.length; t++) {
    var msgs = threads[t].getMessages();
    for (var m = 0; m < msgs.length; m++) {
      var msg = msgs[m];
      var mid = String(msg.getId());
      if (loggedIds[mid]) continue;

      var atts = msg.getAttachments({ includeInlineImages: false, includeAttachments: true });
      if (!atts || atts.length === 0) continue;

      var dt = msg.getDate();
      var dateStr = Utilities.formatDate(dt, C.TIMEZONE, "M/d/yyyy");
      var timeStr = Utilities.formatDate(dt, C.TIMEZONE, "hh:mm a");
      var toStr   = msg.getTo()   || "";
      var fromStr = msg.getFrom() || "";
      var subj    = msg.getSubject() || "";

      for (var a = 0; a < atts.length; a++) {
        var att = atts[a];
        var blob = att.copyBlob();
        var fileName = att.getName() || ("attachment-" + mid + "-" + a);
        var file = attFolder.createFile(blob).setName(fileName);
        var fileUrl = file.getUrl();

        var row = _blankRow_(H);
        if (H["CO"] !== undefined) row[H["CO"]] = (++maxCO);
        if (H["Date"] !== undefined) row[H["Date"]] = dateStr;
        if (H["Time"] !== undefined) row[H["Time"]] = timeStr;
        if (H["To"] !== undefined) row[H["To"]] = toStr;
        if (H["From"] !== undefined) row[H["From"]] = fromStr;
        if (H["Page Count"] !== undefined) row[H["Page Count"]] = "";
        if (H["LINK"] !== undefined) row[H["LINK"]] = fileUrl;
        if (H["Patient Id"] !== undefined) row[H["Patient Id"]] = "";
        if (H["Patient Name (AI)"] !== undefined) row[H["Patient Name (AI)"]] = "";
        if (H["Subject"] !== undefined) row[H["Subject"]] = subj;
        if (H["MessageId"] !== undefined) row[H["MessageId"]] = mid;
        if (H["RecordId"] !== undefined) row[H["RecordId"]] = "";
        if (H["AttachmentName"] !== undefined) row[H["AttachmentName"]] = fileName;
        if (H["FileUrl"] !== undefined) row[H["FileUrl"]] = fileUrl;

        sh.appendRow(row);
        appended++;
      }
      try { msg.markRead(); } catch (e) {}
    }
  }

  if (appended > 0 && H["CO"] !== undefined) {
    try {
      sh.getDataRange().sort([
        { column: H["CO"] + 1,   ascending: false },
        { column: H["Date"] + 1, ascending: false }
      ]);
    } catch (e) {}
  }
  Logger.log("Appended rows: %s", appended);
}

/** ========== Helpers (parser-safe) ========== */
function _getHeaderMap_(sh) {
  var headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getDisplayValues()[0];
  var map = {};
  for (var i = 0; i < headers.length; i++) {
    map[headers[i]] = i;
  }
  return map;
}

function _blankRow_(H) {
  var width = 0;
  for (var k in H) {
    if (H.hasOwnProperty(k)) {
      width = Math.max(width, H[k] + 1);
    }
  }
  var row = new Array(width);
  for (var i = 0; i < width; i++) row[i] = "";
  return row;
}

function _getOrCreateSubfolderSafe_(spreadsheetId, subfolderName, explicitFolderId) {
  if (explicitFolderId) {
    try {
      var f = DriveApp.getFolderById(explicitFolderId);
      if (f) {
        var it = f.getFoldersByName(subfolderName);
        if (it.hasNext()) return it.next();
        return f.createFolder(subfolderName);
      }
    } catch (e) {
      // fall through to legacy behavior
    }
  }
  var file = DriveApp.getFileById(spreadsheetId);
  var parentFolder = null;
  try {
    var parents = file.getParents(); // not supported on Shared Drives
    parentFolder = parents.hasNext() ? parents.next() : null;
  } catch (e) {
    parentFolder = null;
  }
  if (!parentFolder) {
    // Fallback to root if we can't get the parent (e.g., Shared Drive)
    parentFolder = DriveApp.getRootFolder();
  }
  var it = parentFolder.getFoldersByName(subfolderName);
  if (it.hasNext()) return it.next();
  return parentFolder.createFolder(subfolderName);
}

function _maxInColumn_(sh, idx) {
  if (idx === undefined) return 0;
  var last = sh.getLastRow();
  if (last < 2) return 0;
  var vals = sh.getRange(2, idx + 1, last - 1, 1).getValues();
  var max = 0;
  for (var i = 0; i < vals.length; i++) {
    var v = Number(vals[i][0]);
    if (!isNaN(v) && v > max) max = v;
  }
  return max;
}

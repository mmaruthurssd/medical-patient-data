


/**
 * Main: looks at column B, writes email to column F and timestamp to column G.
 * Assumes headers on row 1. Change START_ROW to 1 if you have no headers.
 */
function fillLastUpdatedFromB() {
  const START_ROW = 2;            // data starts on row 2 (row 1 = headers)
  const ss=SpreadsheetApp.getActiveSpreadsheet()
  const SHEET = ss.getSheetByName("Index");
  const lastRow = SHEET.getLastRow();
  if (lastRow < START_ROW) return;

  // Read column B values (URLs or file IDs)
  const numRows = lastRow - START_ROW + 1;
  const urls = SHEET.getRange(START_ROW, 2, numRows, 1).getValues(); // col B

  // Prepare output arrays for F (email) and G (timestamp)
  const outEmail = Array.from({ length: numRows }, () => ['']);
  const outWhen  = Array.from({ length: numRows }, () => [null]);

  for (let i = 0; i < numRows; i++) {
    const raw = (urls[i][0] || '').toString().trim();
    if (!raw) continue;

    const fileId = extractFileId_(raw);
    if (!fileId) {
      outEmail[i][0] = 'Invalid URL/ID';
      continue;
    }

    try {
      const info = getFileLastUpdateInfo_(fileId);
      outEmail[i][0] = info.email || '';      // may be blank due to privacy settings
      outWhen[i][0]  = info.modifiedAt || null; // Date object (better for formatting)
      // Utilities.sleep(30); // (optional) tiny pause if you’re hitting quotas
    } catch (e) {
      outEmail[i][0] = 'No access / not found';
      outWhen[i][0]  = null;
      console.warn(`Row ${START_ROW + i}: ${e}`);
    }
  }

  // Write results to F and G
  SHEET.getRange(START_ROW, 6, numRows, 1).setValues(outEmail); // col F
  SHEET.getRange(START_ROW, 7, numRows, 1).setValues(outWhen);  // col G

  // Format timestamps nicely
  SHEET.getRange(START_ROW, 7, numRows, 1).setNumberFormat('yyyy-mm-dd hh:mm:ss');
}

/**
 * Extract a Drive file ID from a Google Sheets URL or return the ID if already an ID.
 */
function extractFileId_(input) {
  // Already looks like an ID
  if (/^[A-Za-z0-9_-]{20,}$/.test(input) && input.indexOf('http') !== 0) return input;

  // Common URL patterns
  let m = input.match(/\/spreadsheets\/d\/([A-Za-z0-9_-]+)/);
  if (m) return m[1];
  m = input.match(/[?&]id=([A-Za-z0-9_-]+)/);
  if (m) return m[1];

  // Fallback: grab the longest plausible ID-ish token
  m = input.match(/([A-Za-z0-9_-]{20,})/);
  return m ? m[1] : '';
}

/**
 * Returns { email:string, displayName:string, modifiedAt:Date|null } for a Drive file.
 * Tries Drive v3 (via UrlFetchApp) first, then falls back to Advanced Drive v2.
 */
function getFileLastUpdateInfo_(fileId) {
  // 1) Prefer Drive v3 (gives reliable email + modifiedTime)
  var v3 = tryDriveV3_(fileId);
  if (v3) return v3;

  // 2) Fallback: Advanced Drive (v2) — use ONLY v2 fields to avoid "Invalid field selection name"
  var opt = {
    fields: 'id,title,modifiedDate,lastModifyingUserName,lastModifyingUser(displayName,emailAddress)',
    supportsTeamDrives: true,           // ok on v2
    includeTeamDriveItems: true,        // ok on v2
    supportsAllDrives: true,            // harmless if ignored
    includeItemsFromAllDrives: true     // harmless if ignored
  };

  var f;
  try {
    f = Drive.Files.get(fileId, opt);
  } catch (e) {
    // If fields selection still trips, retry without fields filter.
    f = Drive.Files.get(fileId);
  }

  var modifiedAt = f.modifiedDate ? new Date(f.modifiedDate) : null;

  var email = '';
  var displayName = 'Unknown';
  if (f.lastModifyingUser) {
    email = f.lastModifyingUser.emailAddress || '';
    displayName = f.lastModifyingUser.displayName || displayName;
  }
  if (f.lastModifyingUserName && displayName === 'Unknown') {
    displayName = f.lastModifyingUserName;
  }

  return { email: email, displayName: displayName, modifiedAt: modifiedAt };
}

/**
 * Drive v3 fetch using UrlFetchApp + OAuth token.
 * Needs Drive scope (already granted if you enabled Advanced Drive).
 */
function tryDriveV3_(fileId) {
  try {
    var url = 'https://www.googleapis.com/drive/v3/files/' +
              encodeURIComponent(fileId) +
              '?fields=id,name,modifiedTime,lastModifyingUser(displayName,emailAddress)&supportsAllDrives=true';

    var resp = UrlFetchApp.fetch(url, {
      headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
      muteHttpExceptions: true
    });
    var code = resp.getResponseCode();
    if (code >= 200 && code < 300) {
      var f = JSON.parse(resp.getContentText());
      return {
        email: (f.lastModifyingUser && f.lastModifyingUser.emailAddress) || '',
        displayName: (f.lastModifyingUser && f.lastModifyingUser.displayName) || 'Unknown',
        modifiedAt: f.modifiedTime ? new Date(f.modifiedTime) : null
      };
    } else {
      // Uncomment to debug:
      // Logger.log('Drive v3 error ' + code + ': ' + resp.getContentText());
    }
  } catch (err) {
    // Logger.log('tryDriveV3_ exception: ' + err);
  }
  return null;
}






// const INTRA_SS_ID = "1FiY_BJMVV1vuG1ZVNrGwNjrNZ1VEzsDnFUlRmwaNYIE";
// const INTRA_SHEET_NAME = "Tab List";
// const SOURCE_SHEETS_FOR_INTRA = ["Projects", "Dashboards", "Google Sheets", "Processing Sheets", "Uncategorized"];

// // Simple per-execution caches
// const _CACHE = {
//   accessByFileId: new Map(), // fileId -> "a,b,c"
// };

// /************************************
//  * Main
//  ************************************/
// function listSheetNamesFromLinkedUrls() {
//   const destSS = SpreadsheetApp.openById(INTRA_SS_ID);
//   const destSheet = destSS.getSheetByName(INTRA_SHEET_NAME);
//   const destData = destSheet.getRange(1, 1, destSheet.getLastRow(), 6).getValues();
//   if (!destData.length) return;

//   const headers = destData[0];
//   const destSSIDIndex = headers.indexOf("SS ID");
//   const destTabNameIndex = headers.indexOf("Tab Name");
//   const destAccessIndex = headers.indexOf("Access (based on internal access)");

//   if (destSSIDIndex < 0 || destTabNameIndex < 0) {
//     throw new Error('Required headers missing. Expect "SS ID" and "Tab Name" in row 1.');
//   }

//   // Map existing rows for fast lookups (skip header)
//   const existingAccessById = new Map();
//   const existingPairs = new Set(); // key = `${fileId}||${tabName}`
//   for (let r = 1; r < destData.length; r++) {
//     const id = String(destData[r][destSSIDIndex] || "");
//     const tn = String(destData[r][destTabNameIndex] || "");
//     if (id) {
//       if (destAccessIndex >= 0) existingAccessById.set(id, String(destData[r][destAccessIndex] || ""));
//       existingPairs.add(`${id}||${tn}`);
//     }
//   }

//   const ss = SpreadsheetApp.getActiveSpreadsheet();

//   //for (let s = 0; s < SOURCE_SHEETS_FOR_INTRA.length; s++) {
//   for (let s = 0; s < 2; s++) {
//     const sourceSheet = ss.getSheetByName(SOURCE_SHEETS_FOR_INTRA[s]);
//     if (!sourceSheet) continue;

//     // Columns (as in your code)
//     const sourceRich = sourceSheet.getRange("M1:M").getRichTextValues();
//     const sourceText = sourceSheet.getRange("M1:M").getDisplayValues(); // fallback if partial link/plain url
//     const sourceCheck = sourceSheet.getRange("L1:L").getValues();
//     const sourceDrive = sourceSheet.getRange("G1:G").getValues();

//     const max = Math.max(sourceCheck.length, sourceRich.length);
//     for (let i = 0; i < max; i++) {
//       const checked = String(sourceCheck[i] && sourceCheck[i][0]).toUpperCase() === "TRUE";
//       if (!checked) continue;

//       const url = extractUrlFromCell_(sourceRich[i]?.[0], sourceText[i]?.[0]);
//       if (!url) continue;

//       const ssID = _extractSpreadsheetId(url);
//       if (!ssID) continue;

//       const tempSS = withRetry_(() => SpreadsheetApp.openById(ssID), `openById:${ssID}`);

//       // Access: reuse if already present in Tab List, else compute once per file
//       let accessCsv = existingAccessById.get(ssID) || _CACHE.accessByFileId.get(ssID);
//       if (!accessCsv) {
//         accessCsv = getSheetEditorsViewersEmails_(tempSS); // returns CSV string
//         _CACHE.accessByFileId.set(ssID, accessCsv);
//       }

//       const tempSSName = tempSS.getName();
//       const tabs = withRetry_(() => tempSS.getSheets(), `getSheets:${ssID}`);

//       for (const tab of tabs) {
//         const tabName = tab.getName();
//         const pairKey = `${ssID}||${tabName}`;
//         if (existingPairs.has(pairKey)) continue;

//         const tabUrl = buildSheetTabUrl_(ssID, tab.getSheetId());
//         destData.push([ssID, tabUrl, accessCsv, sourceDrive[i]?.[0] || "", tempSSName, tabName]);
//         existingPairs.add(pairKey);
//         if (!existingAccessById.has(ssID)) existingAccessById.set(ssID, accessCsv);
//       }
//     }
//   }

//   destSheet.getRange(1, 1, destData.length, destData[0].length).setValues(destData);
// }

// /**
//  * Sheets-native: open the spreadsheet and read editors/viewers.
//  * Resilient + fallback to Advanced Drive for domain/anyone/shared-drives.
//  * Returns a CSV string.
//  */
// function getSheetEditorsViewersEmails_(sprOrId) {
//   const spr = (typeof sprOrId === 'string')
//     ? withRetry_(() => SpreadsheetApp.openById(sprOrId), `openById:${sprOrId}`)
//     : sprOrId;

//   const fileId = spr.getId();
//   // Try DriveApp first (fast), with backoff
//   try {
//     const file = withRetry_(() => DriveApp.getFileById(fileId), `DriveApp.getFileById:${fileId}`);
//     const editors = withRetry_(() => file.getEditors().map(u => (u.getEmail() || '').toLowerCase()).filter(Boolean), `getEditors:${fileId}`);
//     let viewers = [];
//     try {
//       viewers = withRetry_(() => file.getViewers().map(u => (u.getEmail() || '').toLowerCase()).filter(Boolean), `getViewers:${fileId}`);
//     } catch (_vErr) {
//       viewers = []; // some shared drive files don't expose viewers here
//     }
//     const set = new Set([...editors, ...viewers]);
//     if (set.size) return Array.from(set).sort().join(", ");
//     // If empty (domain/anyone), fall back
//     return getAccessViaAdvancedDrive_(fileId);
//   } catch (e) {
//     if (isRetryableError_(e)) {
//       return getAccessViaAdvancedDrive_(fileId);
//     }
//     throw e;
//   }
// }

// /************************************************
//  * Advanced Drive fallback (enable in Services):
//  * Services > Advanced Google services… > Drive API = ON
//  * And in Cloud console: Google Drive API = ENABLED
//  ************************************************/
// function getAccessViaAdvancedDrive_(fileId) {
//   const resp = withRetry_(
//     () => Drive.Permissions.list(fileId, { supportsAllDrives: true }),
//     `Drive.Permissions.list:${fileId}`
//   );

//   // v2 usually returns resp.items; be defensive
//   const items = (resp && (resp.items || resp.permissions || [])) || [];
//   const out = new Set();

//   for (const p of items) {
//     const role = String(p.role || '').toLowerCase();
//     const type = String(p.type || '').toLowerCase();
//     const email = String(p.emailAddress || p.email || '').toLowerCase();

//     if (!['owner', 'writer', 'commenter', 'reader', 'organizer', 'fileorganizer'].includes(role)) continue;

//     if (type === 'user' || type === 'group') {
//       if (email) out.add(email);
//     } else if (type === 'domain') {
//       const domain = (p.domain || '').toLowerCase();
//       out.add(domain ? `[Domain: ${domain}]` : '[Domain access]');
//     } else if (type === 'anyone') {
//       const discoverable = (p.allowFileDiscovery === true);
//       out.add(discoverable ? '[Public on the web]' : '[Anyone with link]');
//     }
//   }

//   return Array.from(out).sort().join(", ");
// }

// /****************
//  * URL helpers
//  ****************/
// function buildSheetTabUrl_(fileId, sheetId) {
//   return `https://docs.google.com/spreadsheets/d/${fileId}/edit#gid=${sheetId}`;
// }

// function extractUrlFromCell_(richTextValue, displayText) {
//   // Prefer rich link (full-cell or run-level)
//   try {
//     if (richTextValue) {
//       const link = richTextValue.getLinkUrl && richTextValue.getLinkUrl();
//       if (link) return link;
//       const runs = richTextValue.getRuns ? richTextValue.getRuns() : [];
//       for (const r of runs) {
//         const l = r.getLinkUrl && r.getLinkUrl();
//         if (l) return l;
//       }
//     }
//   } catch (_) { }
//   // Fallback: detect plain URL in cell text or HYPERLINK()
//   const txt = String(displayText || '').trim();
//   const m1 = txt.match(/HYPERLINK\(\s*"([^"]+)"/i);
//   if (m1) return m1[1];
//   const m2 = txt.match(/https?:\/\/[^\s)]+/i);
//   return m2 ? m2[0] : "";
// }

// // Your existing ID extractor (kept as-is)
// function _extractSpreadsheetId(url) {
//   let m = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
//   if (m && m[1]) return m[1];
//   m = url.match(/[?&]id=([a-zA-Z0-9-_]+)/);
//   if (m && m[1]) return m[1];
//   m = url.match(/([a-zA-Z0-9-_]{25,})/);
//   if (m && m[1]) return m[1];
//   return null;
// }

// /*****************************************
//  * Retry wrapper (Exponential Backoff)
//  *****************************************/
// function withRetry_(fn, label = 'op', maxTries = 6) {
//   let wait = 500; // ms
//   let lastErr;
//   for (let attempt = 1; attempt <= maxTries; attempt++) {
//     try {
//       return fn();
//     } catch (e) {
//       lastErr = e;
//       if (!isRetryableError_(e) || attempt === maxTries) break;
//       Utilities.sleep(wait + Math.floor(Math.random() * 250)); // jitter
//       wait = Math.min(wait * 2, 8000);
//     }
//   }
//   throw new Error(`${label} failed after retries: ${lastErr && lastErr.message}`);
// }

// function isRetryableError_(e) {
//   const msg = String(e && e.message || '').toLowerCase();
//   return (
//     msg.includes("we're sorry, a server error occurred") ||
//     msg.includes('internal error') ||
//     msg.includes('service unavailable') ||
//     msg.includes('quota') ||
//     msg.includes('rate limit') ||
//     msg.includes('exceeded') ||
//     msg.includes('backend error') ||
//     msg.includes('try again') ||
//     msg.includes('http 5') // any 5xx
//   );
// }

/**
 * Returns the container-bound Apps Script project info (if any) for a Sheet.
 * Requires Advanced Service: Script (Apps Script API) enabled.
 *
 * @param {string} sheetIdOrUrl  A Google Sheet ID like '1AbC...' OR the full URL.
 * @return {{scriptId:string, url:string, title:string}|null}
 *         Object with scriptId, editor URL, and title — or null if none exists.
 */
// function getBoundScriptForSheet(sheetIdOrUrl) {
//   const sheetId = extractSheetId_(sheetIdOrUrl);
//   if (!sheetId) throw new Error('Invalid Sheet ID/URL provided.');

//   // Page through the user's Apps Script projects and find the one bound to this Sheet.
//   let pageToken = null;
//   do {
//     const resp = Script.Projects.list({ pageSize: 100, pageToken });
//     const projects = (resp && resp.projects) || [];
//     for (const p of projects) {
//       // For container-bound projects, parentId equals the container file's ID (the Sheet ID).
//       if (p.parentId === sheetId) {
//         const scriptId = p.scriptId;
//         return {
//           scriptId,
//           url: `https://script.google.com/d/${scriptId}/edit`,
//           title: p.title || ''
//         };
//       }
//     }
//     pageToken = resp && resp.nextPageToken;
//   } while (pageToken);

//   // No container-bound script found for this Sheet.
//   return null;
// }

/**
 * Helper: Extracts the Sheet ID from either an ID or a full URL.
 * Accepts forms like:
 *  - 1AbCdEfGh... (raw ID)
 *  - https://docs.google.com/spreadsheets/d/1AbCdEfGh.../edit#gid=0
 */
// function extractSheetId_(sheetIdOrUrl) {
//   if (!sheetIdOrUrl) return null;
//   // If it looks like a raw Drive file ID, just return it.
//   if (/^[a-zA-Z0-9_-]{20,}$/.test(sheetIdOrUrl)) return sheetIdOrUrl.trim();

//   // Try to parse from a URL.
//   const m = String(sheetIdOrUrl).match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
//   return m ? m[1] : null;
// }

/**
 * Example runner: logs the result nicely.
 */
// function demo_getBoundScriptForSheet() {
//   const sheetIdOrUrl = '1ZU64Umiv3bHwXq8arr4tJqBLPxUuEG2LeVOvODMuOjw';
//   //const info = getBoundScriptForSheet(sheetIdOrUrl);
//   const info = findBoundScriptViaRest(sheetIdOrUrl);
//   if (info) {
//     console.log('Found container-bound project:');
//     console.log('Title   : ' + info.title);
//     console.log('ScriptId: ' + info.scriptId);
//     console.log('URL     : ' + info.url);
//   } else {
//     console.log('No container-bound script found for that Sheet.');
//   }
// }

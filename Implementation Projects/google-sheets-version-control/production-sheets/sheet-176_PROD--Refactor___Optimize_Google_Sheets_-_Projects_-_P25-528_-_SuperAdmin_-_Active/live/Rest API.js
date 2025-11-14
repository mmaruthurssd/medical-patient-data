/**
 * Returns the container-bound Apps Script project's ID & editor URL for a Sheet
 * WITHOUT using the Advanced Service. Uses the Apps Script REST API via UrlFetch.
 *
 * @param {string} sheetIdOrUrl  A Sheet ID like '1AbC...' OR a full spreadsheet URL.
 * @return {{scriptId:string, url:string, title:string}|null}
 */
function getBoundScriptForSheet(sheetIdOrUrl) {
  const sheetId = extractSheetId_(sheetIdOrUrl);
  if (!sheetId) throw new Error('Invalid Sheet ID/URL');

  const base = 'https://script.googleapis.com/v1/projects';
  const headers = {
    Authorization: 'Bearer ' + ScriptApp.getOAuthToken(),
    Accept: 'application/json'
  };

  let pageToken = null;
  do {
    const url = base + '?pageSize=100' + (pageToken ? '&pageToken=' + encodeURIComponent(pageToken) : '');
    const resp = UrlFetchApp.fetch(url, { method: 'get', headers, muteHttpExceptions: true });
    if (resp.getResponseCode() !== 200) {
      throw new Error('Apps Script API error: ' + resp.getResponseCode() + ' — ' + resp.getContentText());
    }

    const data = JSON.parse(resp.getContentText());
    const projects = data.projects || [];
    for (const p of projects) {
      // For container-bound projects, parentId equals the container file's ID (the Sheet ID).
      if (p.parentId === sheetId) {
        return {
          scriptId: p.scriptId,
          url: `https://script.google.com/d/${p.scriptId}/edit`,
          title: p.title || ''
        };
      }
    }
    pageToken = data.nextPageToken || null;
  } while (pageToken);

  return null; // No container-bound script on that Sheet
}

/** Helper: accept raw ID or URL and return the spreadsheet file ID. */
function extractSheetId_(sheetIdOrUrl) {
  if (!sheetIdOrUrl) return null;
  const s = String(sheetIdOrUrl).trim();
  if (/^[a-zA-Z0-9_-]{20,}$/.test(s)) return s; // looks like a Drive file ID
  const m = s.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  return m ? m[1] : null;
}

/** Small demo */
function demo_getBoundScriptForSheet() {
  const info = getBoundScriptForSheet('1ZU64Umiv3bHwXq8arr4tJqBLPxUuEG2LeVOvODMuOjw');
  Logger.log(info ? info : 'No container-bound script found.');
}

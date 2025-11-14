/**
 * MAIN: For each spreadsheet URL/ID in A2:A, writes Script ID (B), Editor URL (C), Status (D).
 * Uses Apps Script API via UrlFetchApp (no Advanced Service object needed).
 */
function lookupBoundScriptsFromList_viaScriptApi() {
  const sh = SpreadsheetApp.getActiveSheet();
  //const inputs = sh.getRange(2, 1, Math.max(0, sh.getLastRow() - 1), 1).getValues(); // A2:A
  //if (!inputs.length) return;

  // Fetch ALL Apps Script projects accessible to you, once, then index by parentId
  const projects = fetchAllAppsScriptProjects_(); // [{scriptId,title,parentId}, ...]
  const byParent = indexProjectsByParentId_(projects); // { [spreadsheetId]: {scriptId,title} }

  Logger.log(byParent)
  return

  const out = [];
  for (let i = 0; i < inputs.length; i++) {
    const raw = (inputs[i][0] || '').toString().trim();
    if (!raw) { out.push(['', '', 'Empty']); continue; }

    const ssId = extractSheetId_(raw);
    if (!ssId) { out.push(['', '', 'Invalid URL/ID']); continue; }

    const proj = byParent[ssId] || null;
    if (proj) {
      out.push([proj.scriptId, `https://script.google.com/d/${proj.scriptId}/edit`, 'OK']);
    } else {
      out.push(['', '', 'Not found (no bound script or not accessible)']);
    }
  }

  if (out.length) sh.getRange(2, 2, out.length, 3).setValues(out); // B:C:D
}

/**
 * Fetch all Apps Script projects via REST: GET https://script.googleapis.com/v1/projects
 * Paginates through everything you can list; returns simplified array.
 * Requires scope: https://www.googleapis.com/auth/script.projects.readonly
 */
function fetchAllAppsScriptProjects_() {
  const base = 'https://script.googleapis.com/v1/projects';
  const headers = {
    Authorization: 'Bearer ' + ScriptApp.getOAuthToken(),
    Accept: 'application/json'
  };

  const results = [];
  let pageToken = null;

  do {
    const url = base + '?pageSize=100' + (pageToken ? '&pageToken=' + encodeURIComponent(pageToken) : '');
    const resp = UrlFetchApp.fetch(url, { method: 'get', headers, muteHttpExceptions: true });
    const code = resp.getResponseCode();
    if (code !== 200) {
      throw new Error('Apps Script API error ' + code + ': ' + resp.getContentText());
    }
    const data = JSON.parse(resp.getContentText());
    const projects = (data && data.projects) || [];
    for (const p of projects) {
      // p.parentId equals the container file's ID for container-bound scripts (Sheet/Doc/Slide/etc.)
      results.push({
        scriptId: p.scriptId,
        title: p.title || '',
        parentId: p.parentId || null
      });
    }
    pageToken = data.nextPageToken || null;
  } while (pageToken);

  return results;
}

/** Build a lookup: spreadsheetId → {scriptId,title} */
function indexProjectsByParentId_(projects) {
  const map = Object.create(null);
  for (const p of projects) {
    if (p.parentId) map[p.parentId] = { scriptId: p.scriptId, title: p.title };
  }
  return map;
}

/** Accept a raw spreadsheet ID or full URL and return the file ID. */
function extractSheetId_(s) {
  if (!s) return null;
  s = String(s).trim();
  if (/^[a-zA-Z0-9_-]{20,}$/.test(s)) return s; // looks like a Drive file ID
  const m = s.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  return m ? m[1] : null;
}

/** Optional: single lookup helper for one Sheet ID/URL */
function getBoundScriptForSheet_viaScriptApi(sheetIdOrUrl) {
  const ssId = extractSheetId_(sheetIdOrUrl);
  if (!ssId) throw new Error('Invalid Sheet ID/URL.');
  const projects = fetchAllAppsScriptProjects_();
  const byParent = indexProjectsByParentId_(projects);
  const hit = byParent[ssId];
  return hit ? ({ scriptId: hit.scriptId, url: 'https://script.google.com/d/' + hit.scriptId + '/edit', title: hit.title }) : null;
}

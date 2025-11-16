/**
 * Map spreadsheet URLs in column A → container-bound Apps Script IDs.
 * Writes Script ID to column C, Script Editor link to column D.
 */
function mapBoundScriptsForSheetList() {
  const sh = SpreadsheetApp.getActiveSheet();
  const lastRow = sh.getLastRow();
  if (lastRow < 2) return;

  // Read column A (Spreadsheet URLs)
  const urls = sh.getRange(2, 3, lastRow - 1, 1).getRichTextValues().map(r => (r[0].getLinkUrl() || '').toString().trim());
  const idList = urls.map(u => extractId_(u));
  const wantedIds = new Set(idList.filter(Boolean));

  // Early exit if nothing valid
  // if (wantedIds.size === 0) {
  //   sh.getRange(2, 3, lastRow - 1, 2).setValues(Array(lastRow - 1).fill(["", ""]));
  //   return;
  // }

  // Get all script projects visible to the user and collect those with a parentId we care about
  const mapContainerToScript = listAllProjectsAndBuildMap_(wantedIds);

  // Prepare outputs for C (Script ID) and D (Editor URL)
  const out = idList.map(containerId => {
    if (!containerId) return ["", ""];
    const scriptId = mapContainerToScript.get(containerId) || "";
    const editorUrl = scriptId ? `https://script.google.com/home/projects/${scriptId}/edit` : "";
    return [scriptId || "No bound script", editorUrl];
  });

  // Write results
  sh.getRange(2, 4, out.length, 2).setValues(out);

  // Make column D clickable (rich text)
  // const rich = out.map(([id, url]) => {
  //   const text = url ? "Open Script Editor" : (id === "No bound script" ? "" : "");
  //   return [SpreadsheetApp.newRichTextValue().setText(text).setLinkUrl(url || null).build()];
  // });
  // sh.getRange(2, 4, rich.length, 1).setRichTextValues(rich);
}

/* ================= Helpers (hidden by trailing underscore) ================= */

/**
 * List all Apps Script projects for the user and build a map:
 *   container (parentId) -> scriptId
 * Only keeps entries whose parentId is in wantedIds.
 * Requires Advanced Service: Script (Apps Script API).
 */
function listAllProjectsAndBuildMap_(wantedIds) {
  const map = new Map();
  let pageToken = null;

  try {
    do {
      const resp = Script.Projects.list({ pageSize: 250, pageToken });
      const projects = (resp.projects || []);
      for (const p of projects) {
        const parentId = p.parentId; // present only for container-bound projects
        if (parentId && wantedIds.has(parentId)) {
          map.set(parentId, p.scriptId);
        }
      }
      pageToken = resp.nextPageToken || null;
    } while (pageToken);
  } catch (e) {
    throw new Error("Apps Script API not enabled or permission denied. Enable the Apps Script API (Advanced Service 'Script') and authorize this script. Details: " + e.message);
  }

  return map;
}

/**
 * Extract Google file ID from a variety of Drive/Sheets URL formats.
 */
// function extractId_(url) {
//   if (!url) return null;
//   const patterns = [
//     /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/, // Sheets
//     /\/file\/d\/([a-zA-Z0-9-_]+)/,         // Drive file
//     /[?&]id=([a-zA-Z0-9-_]+)/              // open?id=...
//   ];
//   for (const re of patterns) {
//     const m = url.match(re);
//     if (m && m[1]) return m[1];
//   }
//   return null;
// }

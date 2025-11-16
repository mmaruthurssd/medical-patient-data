/** =========================================================
 *  PA_OCR.gs  —  Fill Patient Name (AI) and try Patient Id
 *  Uses config from PA Config.gs (PA.CFG)
 * ========================================================= */

function ocr_fillPatientNameAI() {
  var C = PA.CFG;

  // 1) Open target sheet
  var ss = SpreadsheetApp.openById(C.DEST_SPREADSHEET_ID);
  var sh = ss.getSheetByName(C.DEST_SHEET_NAME); // "PA_Attachments"
  if (!sh) throw new Error("Sheet '" + C.DEST_SHEET_NAME + "' not found.");

  var H = _hdr(sh, [
    "LINK", "Patient Name (AI)", "Patient Id", "MessageId"
  ]);

  var last = sh.getLastRow();
  if (last < 2) { console.log("No data rows."); return; }

  // 2) Build patient directory (for Id lookup via phone/name)
  var dir = _buildPatientDirectory_();

  // 3) Iterate rows, limited by OCR_MAX_PER_RUN
  var updated = 0;
  var toProcess = C.OCR_MAX_PER_RUN || 15;

  for (var r = 2; r <= last; r++) {
    if (updated >= toProcess) break;

    var link  = _v(sh, r, H.LINK);
    var curAI = _v(sh, r, H["Patient Name (AI)"]);
    var curID = _v(sh, r, H["Patient Id"]);

    // Only process rows with a link and missing at least one of AI name / ID
    if (!link || (curAI && curID)) continue;

    try {
      var fileId = _driveFileIdFromUrl_(link);
      var text   = _extractTextFromPDF_(fileId);   // requires Advanced Drive
      if (!text || !text.trim()) {
        console.log("Row " + r + ": OCR produced no text.");
        continue;
      }

      var key = _loadServiceAccountKey_();
      var info = _askGeminiForPatientInfo_(text, key, C.PROJECT_ID, (C.VERTEX_LOCATION || "us-central1"), C.MODEL_ID);
      var aiName = (info && info.patient ? String(info.patient) : "").trim();

      // Try to find a patient ID — prefer phone match, else name match
      var foundId = "";
      if (info && info.phones && info.phones.length) {
        for (var p = 0; p < info.phones.length; p++) {
          var digits = _digitsOnly_(info.phones[p]);
          if (digits && dir.phoneMap[digits]) { foundId = dir.phoneMap[digits].id; break; }
        }
      }
      if (!foundId && aiName) {
        var norm = _normalizeName_(aiName);
        if (dir.nameMap[norm]) foundId = dir.nameMap[norm];
      }

      // Write back only when we have something new
      var wrote = false;
      if (aiName && !curAI)            { sh.getRange(r, H["Patient Name (AI)"] + 1).setValue(aiName); wrote = true; }
      if (foundId && !curID)           { sh.getRange(r, H["Patient Id"] + 1).setValue(foundId);     wrote = true; }

      if (wrote) {
        updated++;
        console.log("Row " + r + ": wrote " + (aiName ? ("AI name='" + aiName + "'") : "") +
                    (aiName && foundId ? " & " : "") +
                    (foundId ? ("ID='" + foundId + "'") : "") + ".");
      } else {
        console.log("Row " + r + ": nothing extracted (name='" + aiName + "', id='" + foundId + "').");
      }

    } catch (e) {
      console.log("Row " + r + " failed: " + e);
    }
  }

  console.log("OCR finished. Updated " + updated + " row(s).");
}

/* ===================== Helpers ===================== */

function _hdr(sh, required) {
  var headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getDisplayValues()[0];
  var map = {};
  for (var i = 0; i < headers.length; i++) map[headers[i]] = i;
  // convenience map with .LINK, .["Patient Name (AI)"], etc.
  var out = {};
  for (var k in map) out[k] = map[k];
  for (var j = 0; j < required.length; j++) {
    if (out[required[j]] === undefined) {
      throw new Error("Missing expected header: '" + required[j] + "'");
    }
  }
  return out;
}

function _v(sh, row, colIdxOrName) {
  var col = (typeof colIdxOrName === "number") ? colIdxOrName : colIdxOrName;
  if (typeof col === "string") throw new Error("Use header map index for _v()");
  return String(sh.getRange(row, col + 1).getValue() || "").trim();
}

function _driveFileIdFromUrl_(url) {
  var m = url && url.match(/[-\w]{25,}/);
  if (!m) throw new Error("Invalid Drive URL: " + url);
  return m[0];
}

function _extractTextFromPDF_(fileId) {
  // Convert PDF → Google Doc using Advanced Drive, then read its text
  var file = DriveApp.getFileById(fileId);
  var resource = { title: file.getName(), mimeType: MimeType.GOOGLE_DOCS };
  var docFile = Drive.Files.insert(resource, file.getBlob()); // Advanced Drive
  var doc = DocumentApp.openById(docFile.id);
  var text = doc.getBody().getText();
  DriveApp.getFileById(docFile.id).setTrashed(true); // cleanup
  return text;
}

function _loadServiceAccountKey_() {
  var C = PA.CFG;
  var f = DriveApp.getFileById(C.SERVICE_ACCOUNT_KEY_FILE_ID);
  return JSON.parse(f.getBlob().getDataAsString());
}

function _jwtAccessToken_(key, scopes) {
  var url = "https://oauth2.googleapis.com/token";
  var now = Math.floor(Date.now() / 1000);
  var header = { alg: "RS256", typ: "JWT" };
  var claim = {
    iss: key.client_email,
    scope: (scopes && scopes.length ? scopes.join(" ") : "https://www.googleapis.com/auth/cloud-platform"),
    aud: url,
    exp: now + 3600,
    iat: now
  };
  var b64 = Utilities.base64EncodeWebSafe(JSON.stringify(header)) + "." +
            Utilities.base64EncodeWebSafe(JSON.stringify(claim));
  var sig = Utilities.computeRsaSha256Signature(b64, key.private_key);
  var jwt = b64 + "." + Utilities.base64EncodeWebSafe(sig);

  var resp = UrlFetchApp.fetch(url, {
    method: "post",
    payload: {
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt
    },
    muteHttpExceptions: true
  });
  var code = resp.getResponseCode();
  if (code !== 200) throw new Error("Token error: " + resp.getContentText());
  return JSON.parse(resp.getContentText()).access_token;
}

function _askGeminiForPatientInfo_(ocrText, saKey, projectId, region, modelId) {
  // Try a small list of models (handles availability/permissions)
  var candidates = [];
  if (modelId) candidates.push(modelId);
  candidates.push("gemini-1.5-pro", "gemini-1.5-flash");
  var token = _jwtAccessToken_(saKey, ["https://www.googleapis.com/auth/cloud-platform"]);

  for (var i = 0; i < candidates.length; i++) {
    var model = candidates[i];
    try {
      var url = "https://" + region +
        "-aiplatform.googleapis.com/v1/projects/" + projectId +
        "/locations/" + region + "/publishers/google/models/" + model + ":generateContent";

      var prompt =
        "Extract from the OCR text:\n" +
        "- patient full name in the form 'First Last' (capitalize initials)\n" +
        "- up to three phone numbers (digits only, no separators)\n\n" +
        "Return JSON exactly like: {\"patient\":\"First Last\",\"phones\":[\"##########\",\"##########\",\"##########\"]}\n" +
        "TEXT:\n\"\"\"" + ocrText + "\"\"\"";

      var payload = {
        contents: [ { role: "user", parts: [ { text: prompt } ] } ]
      };

      var resp = UrlFetchApp.fetch(url, {
        method: "post",
        contentType: "application/json",
        headers: { Authorization: "Bearer " + token },
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      });

      if (resp.getResponseCode() !== 200) {
        console.log("Model " + model + " unavailable (" + resp.getResponseCode() + "). Trying next…");
        continue;
      }

      var data = JSON.parse(resp.getContentText());
      var parts = (((data || {}).candidates || [])[0] || {}).content;
      parts = (parts && parts.parts) ? parts.parts : [];
      for (var p = 0; p < parts.length; p++) {
        var raw = String(parts[p].text || "").replace(/```json|```/g, "").trim();
        try {
          var obj = JSON.parse(raw);
          return {
            patient: (obj.patient || "").toString().trim(),
            phones: Array.isArray(obj.phones) ? obj.phones : []
          };
        } catch (e) {}
      }
      // if we reached here, try next model
    } catch (e) {
      console.log("Gemini call failed for model " + model + ": " + e);
    }
  }
  return { patient: "", phones: [] };
}

function _digitsOnly_(s) {
  if (!s) return "";
  return String(s).replace(/\D/g, "");
}

function _normalizeName_(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function _buildPatientDirectory_() {
  // Looks up patient IDs by phone(s) and by normalized name.
  // Adjust these ranges/sheet names if your patient directory is different.
  var C = PA.CFG;
  var map = { phoneMap: {}, nameMap: {} };

  try {
    // Example directory: Spreadsheet with sheet "Patients" where:
    // Col A = Patient Id, Col B = Name, Col G = DOB, Col O/P = phone(s)
    var ss   = SpreadsheetApp.openById(C.PATIENTS_SS_ID);
    var sh   = ss.getSheetByName(C.PATIENTS_SHEET_NAME || "Patients");
    if (!sh) return map;

    var ids    = sh.getRange("A2:A").getValues().map(function (r) { return r[0]; });
    var names  = sh.getRange("B2:B").getValues().map(function (r) { return (r[0] || "").toString().trim(); });
    var phones = sh.getRange("O2:P").getValues(); // adjust if needed

    for (var i = 0; i < ids.length; i++) {
      var id = ids[i];
      if (!id) continue;

      // phone-based index
      var p1 = _digitsOnly_(phones[i] && phones[i][0]);
      var p2 = _digitsOnly_(phones[i] && phones[i][1]);
      if (p1) map.phoneMap[p1] = { id: id, name: names[i] || "" };
      if (p2) map.phoneMap[p2] = { id: id, name: names[i] || "" };

      // name-based index
      var norm = _normalizeName_(names[i]);
      if (norm) map.nameMap[norm] = id;
    }
  } catch (e) {
    console.log("Patient directory error: " + e);
  }

  return map;
}


// const INTEGRATION_KEY = '3AAABLblqZhDSownXlyRhvBxudXG564Ul3PgV5CWT_dVwqtAttkhf3Thdl7d2rfKpvjNeh_76TvRa2s9DsaiIHeQVbrLfAKmP';
// const USER_EMAIL = 'jsaluja@ssdspc.com';

const INTEGRATION_KEY = "3AAABLblqZhB09n0KvvqFXTYEIZrbMiGvkueXro0dO9koVwrUWfKWuKVqO28aun-cSFpF_2MIdjFEsfQztZsek_ZZJM7BUpmY";
const USER_EMAIL = 'nawanijyoti50@gmail.com';

const baseUri = 'https://api.na1.adobesign.com/';
const accesspoint_baseUris = `${baseUri}api/rest/v6/baseUris`;
const accesspoint_transientDoc = `${baseUri}api/rest/v6/transientDocuments`;
const accesspoint_agreements = `${baseUri}api/rest/v6/agreements`;

/**
 * Main entry - dynamic participants + field mapping
 */
function sendDynamicRoleAgreement() {
  const baseApi = getBaseUri();

  const participantsData = [
    { email: "jiteshsaluja@gmail.com", role: "SIGNER", order: 1, fields: ["Signature1"] },
    { email: "scripts@ssdspc.com", role: "APPROVER", order: 2, fields: ["Signature2"] }
  ];

  const transientDocumentId = uploadPDF(baseApi, "1sr586KPVrJZ8GiHfNEyuX7XdPsTkNQuZ");

  // create in AUTHORING
  const agreementId = createAgreementDraftAuthoring(baseApi, transientDocumentId, participantsData);
  // Logger.log("Agreement created (AUTHORING) id: " + agreementId);

  // // Wait until Adobe finishes processing and form fields are available
  // const fields = waitForFormFields(baseApi, agreementId);
  // Logger.log("Fields found: " + fields.map(f => f.name).join(", "));

  // // Prepare minimal payload for updating
  // const updatedFields = prepareFieldsForUpdate(fields, participantsData);
  // Logger.log("Minimal update payload: " + JSON.stringify({ fields: updatedFields }));

  // updateFormFields(baseApi, agreementId, updatedFields);

  // Finally attempt to send, with retry if Adobe says processing still in progress
  sendAgreementWithRetry(baseApi, agreementId, 8, 2000);
}

/**
 * Assign fields by matching base name to participant mapping.
 * DOES NOT modify field.name (do NOT rewrite to include _es_:signerX)
 * Only sets field.assignee = { email: ... } which Adobe accepts.
 */
function assignFieldsDynamic(fields, participantsData) {
  if (!Array.isArray(fields) || fields.length === 0) return [];

  return fields.map(field => {
    const baseName = (field.name || "").split("_es_")[0].trim(); // match base
    for (let i = 0; i < participantsData.length; i++) {
      const p = participantsData[i];
      if (p.fields && p.fields.some(fn => fn.trim() === baseName)) {
        // Only set assignee — do NOT rewrite the name to include tag syntax
        field.assignee = { email: p.email };
        break;
      }
    }
    return field;
  });
}

function prepareFieldsForUpdate(allFields, participantsData) {
  return allFields
    .filter(f => f.inputType === "SIGNATURE" || f.inputType === "SIGNATURE_BLOCK")
    .map(f => {
      const baseName = (f.name || "").split("_es_")[0];
      const assigneeEmail = participantsData.find(p =>
        p.fields.includes(baseName)
      )?.email;

      return {
        name: f.name,
        inputType: f.inputType,
        locations: f.locations, // KEEP locations
        assignee: assigneeEmail ? { email: assigneeEmail } : undefined
      };
    });
}

function updateFormFields(baseApi, agreementId, updatedFields) {
  const payload = { fields: updatedFields };
  const url = `${baseApi}api/rest/v6/agreements/${agreementId}/formFields`;

  const res = UrlFetchApp.fetch(url, {
    method: "put",
    contentType: "application/json",
    headers: { "Authorization": "Bearer " + INTEGRATION_KEY, "x-api-user": "email:" + USER_EMAIL },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  if (res.getResponseCode() !== 200) {
    throw new Error(`updateFormFields failed: ${res.getResponseCode()} - ${res.getContentText()}`);
  }
}

/**
 * Try to set agreement state to IN_PROCESS; if Adobe returns OPERATION_NOT_ALLOWED due to processing,
 * retry a few times.
 */
function sendAgreementWithRetry(baseApi, agreementId, maxAttempts = 8, delayMs = 1500) {
  const url = `${baseApi}api/rest/v6/agreements/${agreementId}/state`;
  const payload = { state: "IN_PROCESS" };

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const res = UrlFetchApp.fetch(url, {
      method: "put",
      contentType: "application/json",
      headers: {
        "Authorization": "Bearer " + INTEGRATION_KEY,
        "x-api-user": "email:" + USER_EMAIL
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });

    const code = res.getResponseCode();
    const body = res.getContentText();
    Logger.log(`sendAgreement attempt ${attempt} code=${code}`);

    if (code >= 200 && code < 300) {
      Logger.log("Agreement sent response: " + body);
      return JSON.parse(body || "{}");
    }

    // If processing still in progress, wait & retry
    if (code === 403) {
      try {
        const parsed = JSON.parse(body || "{}");
        if (parsed.code === "OPERATION_NOT_ALLOWED" && (parsed.message || "").toLowerCase().indexOf("processing") >= 0) {
          Logger.log(`Document processing in progress (attempt ${attempt}): ${parsed.message}`);
          if (attempt < maxAttempts) {
            Utilities.sleep(delayMs + Math.floor(attempt * 300));
            continue;
          }
        }
      } catch (e) {
        Logger.log("403 and failed to parse body: " + body);
      }
    }

    // For other errors, throw with server message to help debugging
    throw new Error("Failed to send agreement: " + code + " - " + body);
  }

  throw new Error("Failed to send agreement after retries due to ongoing processing.");
}

// create agreement in AUTHORING state (so Adobe will process text-tags)
function createAgreementDraftAuthoring(baseApi, transientDocumentId, participantsData) {
  const participantSetsInfo = participantsData.map(p => ({
    memberInfos: [{ email: p.email }],
    order: p.order,
    role: p.role
  }));

  const payload = {
    name: "Dynamic Role Agreement",
    fileInfos: [{ transientDocumentId }],
    participantSetsInfo,
    signatureType: "ESIGN",
    state: "AUTHORING"
  };

  const url = accesspoint_agreements.replace(baseUri, baseApi);
  const res = UrlFetchApp.fetch(url, {
    method: "post",
    contentType: "application/json",
    headers: {
      "Authorization": "Bearer " + INTEGRATION_KEY,
      "x-api-user": "email:" + USER_EMAIL
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  if (res.getResponseCode() !== 200 && res.getResponseCode() !== 201) {
    throw new Error("Failed to create agreement (AUTHORING): " + res.getResponseCode() + " - " + res.getContentText());
  }

  const js = JSON.parse(res.getContentText());
  if (!js.id) throw new Error("Agreement response missing id: " + JSON.stringify(js));
  return js.id;
}

/**
 * Get baseApi (api endpoint for your account), and validate response
 */
function getBaseUri() {
  const res = UrlFetchApp.fetch(accesspoint_baseUris, {
    method: "get",
    headers: {
      "Authorization": "Bearer " + INTEGRATION_KEY,
      "x-api-user": "email:" + USER_EMAIL
    },
    muteHttpExceptions: true
  });

  if (res.getResponseCode() !== 200) {
    throw new Error("Failed to get baseUris: " + res.getResponseCode() + " - " + res.getContentText());
  }
  const js = JSON.parse(res.getContentText());
  if (!js.apiAccessPoint) throw new Error("baseUris response missing apiAccessPoint: " + JSON.stringify(js));
  return js.apiAccessPoint.replace(/\/$/, "") + "/"; // ensure trailing slash
}
/**
 * Poll GET /agreements/{id}/formFields until Adobe has finished processing the document.
 * Returns normalized array of fields (may be empty).
 */
function waitForFormFields(baseApi, agreementId, maxAttempts = 20, delayMs = 1500) {
  const url = `${baseApi}api/rest/v6/agreements/${agreementId}/formFields`;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const res = UrlFetchApp.fetch(url, {
      method: "get",
      headers: {
        "Authorization": "Bearer " + INTEGRATION_KEY,
        "x-api-user": "email:" + USER_EMAIL
      },
      muteHttpExceptions: true
    });

    const code = res.getResponseCode();
    const body = res.getContentText();

    Logger.log(`waitForFormFields attempt ${attempt} code=${code}`);

    // 200 -> parse and return (may be empty fields array)
    if (code === 200) {
      try {
        const parsed = JSON.parse(body || "{}");
        const arr = normalizeFormFields(parsed);
        if (arr.length) {
          Logger.log(`Fields found on attempt ${attempt}: ${arr.map(f => f.name).join(", ")}`);
        } else {
          Logger.log(`No fields found (API returned 200 with empty fields) on attempt ${attempt}`);
        }
        return arr; // may be [] — caller will handle fallback
      } catch (e) {
        Logger.log("Failed to parse formFields JSON: " + body);
        // fallthrough to sleep & retry
      }
    }

    // 404 and known message -> document not ready yet
    if (code === 404) {
      try {
        const parsed = JSON.parse(body || "{}");
        const msg = (parsed.message || "").toString().toLowerCase();
        if (parsed.code === "DOCUMENT_NOT_AVAILABLE" || msg.indexOf("not yet available") >= 0 || msg.indexOf("processing") >= 0) {
          Logger.log(`Document not available yet (attempt ${attempt}). message: ${parsed.message || body}`);
          // wait and retry
        } else {
          Logger.log(`404 but unknown reason: ${body}`);
          // wait & retry anyway
        }
      } catch (e) {
        Logger.log("404 and failed to parse body: " + body);
      }
    } else if (code === 204) {
      // sometimes API uses 204 (no content) — treat as no fields yet
      Logger.log(`Received 204 (no content) on attempt ${attempt}. waiting...`);
    } else if (code >= 500) {
      // server side transient error
      Logger.log(`Server error ${code} on attempt ${attempt}: ${body}`);
    } else if (code === 401 || code === 403) {
      // auth / operation not allowed — could be transient "processing" for 403
      Logger.log(`Received ${code} (possible processing/auth issue): ${body}`);
    } else {
      Logger.log(`Unexpected response (code ${code}): ${body}`);
    }

    // Wait before next attempt (backoff a bit)
    Utilities.sleep(delayMs + Math.floor(attempt * 200));
  }

  Logger.log(`No form fields after ${maxAttempts} attempts — returning empty array.`);
  return []; // caller will fallback to programmatic creation if needed
}


/**
 * Upload a Drive file by ID to transientDocuments and return transientDocumentId
 */
function uploadPDF(baseApi, fileId) {
  const file = DriveApp.getFileById(fileId);
  const url = accesspoint_transientDoc.replace(baseUri, baseApi);

  const res = UrlFetchApp.fetch(url, {
    method: "post",
    headers: {
      "Authorization": "Bearer " + INTEGRATION_KEY,
      "x-api-user": "email:" + USER_EMAIL
    },
    payload: {
      File: file.getBlob(),
      FileName: file.getName()
    },
    muteHttpExceptions: true
  });

  if (res.getResponseCode() !== 200 && res.getResponseCode() !== 201) {
    throw new Error("Failed to upload transient document: " + res.getResponseCode() + " - " + res.getContentText());
  }

  const js = JSON.parse(res.getContentText());
  if (!js.transientDocumentId) throw new Error("No transientDocumentId returned: " + JSON.stringify(js));
  return js.transientDocumentId;
}

/**
 * Create agreement in DRAFT state (so we can fetch and update formFields)
 */
function createAgreementDraft(baseApi, transientDocumentId, participantsData) {
  const participantSetsInfo = participantsData.map(p => ({
    memberInfos: [{ email: p.email }],
    order: p.order,
    role: p.role
  }));

  const payload = {
    name: "Dynamic Role Agreement",
    fileInfos: [{ transientDocumentId }],
    participantSetsInfo,
    signatureType: "ESIGN",
    state: "DRAFT"
  };

  const url = accesspoint_agreements.replace(baseUri, baseApi);
  const res = UrlFetchApp.fetch(url, {
    method: "post",
    contentType: "application/json",
    headers: {
      "Authorization": "Bearer " + INTEGRATION_KEY,
      "x-api-user": "email:" + USER_EMAIL
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  if (res.getResponseCode() !== 200 && res.getResponseCode() !== 201) {
    throw new Error("Failed to create agreement: " + res.getResponseCode() + " - " + res.getContentText());
  }

  const js = JSON.parse(res.getContentText());
  if (!js.id) throw new Error("Agreement response missing id: " + JSON.stringify(js));
  return js.id;
}

function testARF() {
  const baseApi = getBaseUri();
  var agreementId = "CBJCHBCAABAAdd6YdzkDy8l0hC81Qyz7e2NrDHBeZo5n";
  var fields = getFormFields(baseApi, agreementId);
  console.log(fields);
}

/**
 * GET /agreements/{id}/formFields
 * Return the raw parsed JSON (may be object or array)
 */
function getFormFields(baseApi, agreementId) {
  const url = `${baseApi}api/rest/v6/agreements/${agreementId}/formFields`;
  const res = UrlFetchApp.fetch(url, {
    method: "get",
    contentType: "application/json",
    headers: {
      "Authorization": "Bearer " + INTEGRATION_KEY,
      "x-api-user": "email:" + USER_EMAIL
    },
    muteHttpExceptions: true
  });

  if (res.getResponseCode() !== 200) {
    // If Adobe returns 204 or other, we'll return empty object
    Logger.log("getFormFields returned code: " + res.getResponseCode() + " body: " + res.getContentText());
  }

  try {
    return JSON.parse(res.getContentText() || "{}");
  } catch (e) {
    Logger.log("Failed to parse formFields response: " + res.getContentText());
    return {};
  }
}

/**
 * Normalise formFields API result to an array of field objects.
 * Adobe may return {} or { fields: [...] } or an array depending on context.
 */
function normalizeFormFields(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw.fields)) return raw.fields;
  // Some responses may be an object with properties that contain arrays
  // Fall back to empty array
  return [];
}

/**
 * Move agreement state to IN_PROCESS = send it
 */
function sendAgreement(baseApi, agreementId) {
  const payload = { state: "IN_PROCESS" };
  const url = `${baseApi}api/rest/v6/agreements/${agreementId}/state`;
  const res = UrlFetchApp.fetch(url, {
    method: "put",
    contentType: "application/json",
    headers: {
      "Authorization": "Bearer " + INTEGRATION_KEY,
      "x-api-user": "email:" + USER_EMAIL
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  if (res.getResponseCode() < 200 || res.getResponseCode() >= 300) {
    throw new Error("Failed to send agreement: " + res.getResponseCode() + " - " + res.getContentText());
  }
  Logger.log("Agreement sent response: " + res.getContentText());
}
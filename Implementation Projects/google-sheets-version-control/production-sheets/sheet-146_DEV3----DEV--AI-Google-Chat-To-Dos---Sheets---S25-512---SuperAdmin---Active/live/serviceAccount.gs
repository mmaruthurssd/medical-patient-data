
const SERVICE_ACCOUNT_KEY_FILE_ID = '1PxFgYrjdfJd97_W7BxbptbvDtFlOz6aQ';


var objAllAccessTokens = {};

function getAccessTokenFromKey_({ scope, sub }) {

  if (sub) {
    if (objAllAccessTokens[sub]) {
      if (objAllAccessTokens[sub][scope]) {
        return objAllAccessTokens[sub][scope];
      }
    }
  }

  var key = loadServiceAccountKey_(); // your JSON key { client_email, private_key, ... }

  const url = "https://oauth2.googleapis.com/token";
  const now = Math.floor(Date.now() / 1000);

  const header = { alg: "RS256", typ: "JWT" };
  var claimSet = {
    iss: key.client_email,                       // service account email
    scope: scope,
    aud: url,
    exp: now + 3600,                             // 1 hour
    iat: now
  };

  if (sub) {
    claimSet.sub = sub;
  }

  // Helper: base64url without padding
  function base64urlEncode(str) {
    return Utilities.base64EncodeWebSafe(str).replace(/=+$/, "");
  }

  const jwtHeader = base64urlEncode(JSON.stringify(header));
  const jwtClaim = base64urlEncode(JSON.stringify(claimSet));
  const toSign = jwtHeader + "." + jwtClaim;

  // Sign with service account private key
  const signatureBytes = Utilities.computeRsaSha256Signature(toSign, key.private_key);
  const signature = Utilities.base64EncodeWebSafe(signatureBytes).replace(/=+$/, "");

  const jwt = toSign + "." + signature;

  // Exchange JWT for access token
  const response = UrlFetchApp.fetch(url, {
    method: "post",
    payload: {
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt
    },
    muteHttpExceptions: true
  });

  const tokenResp = JSON.parse(response.getContentText());
  if (!tokenResp.access_token) {
    throw new Error("Failed to get token: " + response.getContentText());
  }

  if (sub) {
    if (!objAllAccessTokens[sub]) {
      objAllAccessTokens[sub] = {};
    }
    if (!objAllAccessTokens[sub][scope]) {
      objAllAccessTokens[sub][scope] = tokenResp.access_token;
    }
  }

  return tokenResp.access_token;
}

function loadServiceAccountKey_() {
  const file = DriveApp.getFileById(SERVICE_ACCOUNT_KEY_FILE_ID);
  return JSON.parse(file.getBlob().getDataAsString());
}

function fetchJsonWithSA_(url, { method = 'get', scope, sub, payload, contentType, headers } = {}) {
  var accessToken = null;
  if (sub) {
    accessToken = getAccessTokenFromKey_({ scope, sub }); // scope = single string
  } else {
    accessToken = ScriptApp.getOAuthToken();
  }

  const res = UrlFetchApp.fetch(url, {
    method,
    headers: { Authorization: 'Bearer ' + accessToken, ...(headers || {}) },
    payload,
    contentType,
    muteHttpExceptions: true
  });
  const code = res.getResponseCode();
  if (code !== 200) throw new Error(`${url} failed: ${code} ${res.getContentText()}`);
  return JSON.parse(res.getContentText());
}

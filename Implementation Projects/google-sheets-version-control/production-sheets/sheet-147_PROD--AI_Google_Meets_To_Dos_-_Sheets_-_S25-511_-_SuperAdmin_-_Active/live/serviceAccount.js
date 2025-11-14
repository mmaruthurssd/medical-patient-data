
const SERVICE_ACCOUNT_KEY_FILE_ID = '1PxFgYrjdfJd97_W7BxbptbvDtFlOz6aQ';
const FOLDER_ID = "1ILNt1ZV0NS85WwqJwAw_8NLeqbBNH3Gh";

var objAccessTokens = {};

function moveMultipleFilesIntoSharedDrive_({ ids, accessEmailAddress }) {
  ids.forEach(fileId => {
    if (!objAccessTokens[accessEmailAddress]) {
      objAccessTokens[accessEmailAddress] = getAccessTokenFromKey_(accessEmailAddress);
    }

    try {
      moveFileToSharedDrive_(fileId, objAccessTokens[accessEmailAddress]);
    } catch (err) { console.log(`${fileId} - ${err}`); }
  });
}

function moveFileToSharedDrive_(fileId, accessToken) {

  // Get current parents
  const fileMeta = UrlFetchApp.fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?fields=parents&supportsAllDrives=true`,
    { headers: { Authorization: 'Bearer ' + accessToken } }
  );
  const jsonContent = JSON.parse(fileMeta.getContentText());
  const parents = jsonContent.parents || [];
  const currentParents = parents.join(',');

  // Move (remove old parent, add new one)
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?supportsAllDrives=true&addParents=${FOLDER_ID}${currentParents ? '&removeParents=' + currentParents : ''}`;

  const resp = UrlFetchApp.fetch(url, {
    method: "patch",
    headers: {
      Authorization: "Bearer " + accessToken,
      "Content-Type": "application/json"
    },
    payload: JSON.stringify({})
  });

  // Logger.log(resp.getContentText());
}

function getAccessTokenFromKey_(subjectEmail) {
  var key = loadServiceAccountKey_(); // your JSON key { client_email, private_key, ... }

  const url = "https://oauth2.googleapis.com/token";
  const now = Math.floor(Date.now() / 1000);

  const header = { alg: "RS256", typ: "JWT" };
  const claimSet = {
    iss: key.client_email,                       // service account email
    scope: "https://www.googleapis.com/auth/drive",
    aud: url,
    exp: now + 3600,                             // 1 hour
    iat: now,
    sub: subjectEmail                            // 👈 user to impersonate
  };

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
  return tokenResp.access_token;
}

function loadServiceAccountKey_() {
  const file = DriveApp.getFileById(SERVICE_ACCOUNT_KEY_FILE_ID);
  return JSON.parse(file.getBlob().getDataAsString());
}



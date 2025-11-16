const BUCKET_NAME = 'phi-ocr-us-central1-bucket';
const SERVICE_ACCOUNT_KEY_FILE_ID = '1G0idfdLuUxrKrfL-oSSW8Gy7RJpQ-BlD';
const PROJECT_ID = 'pdf-ocr-extraction-461917';



function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('PDF Processing')
    .addItem('Run OCR & Extract Data', 'processReadyPDFsFromColumnG')
    .addToUi();
}





function processReadyPDFsFromColumnG() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const key = loadServiceAccountKey();
  const token = getAccessTokenFromKey(key);
  const values = sheet.getDataRange().getValues();

  const headers = ["Provider", "Patient", "Medication", "Date", "Pharmacy", "Status"];
  const startColumn = 24; // Column X
  const statusColumn = 23; // Column W

  // Add header if missing
  const headerCheck = sheet.getRange(1, startColumn, 1, headers.length).getValues()[0];
  const needsHeader = headerCheck.every(cell => cell === "");
  if (needsHeader) {
    sheet.getRange(1, startColumn, 1, headers.length).setValues([headers]);
  }

  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const fileUrl = row[6]; // Column G
    const readyFlag = row[statusColumn - 1]; // Column W
    const alreadyProcessed = row[startColumn - 1]; // Column X

    if (readyFlag.toString().trim().toLowerCase() !== "ready" || alreadyProcessed) continue;

    try {
      const fileId = extractDriveFileId(fileUrl);
      const file = DriveApp.getFileById(fileId);
      const text = extractTextFromPDF(file);

      const aiResult = callVertexAIWithPrompt(text, key);

      const output = [
        aiResult?.provider || "",
        aiResult?.patient || "",
        aiResult?.medication || "",
        aiResult?.date || "",
        aiResult?.pharmacy || "",
        aiResult?.status || ""
      ];

      sheet.getRange(i + 1, startColumn, 1, output.length).setValues([output]);

    } catch (e) {
      Logger.log(`Row ${i + 1} failed: ${e}`);
      sheet.getRange(i + 1, startColumn, 1, headers.length).setValues([["Error", "", "", "", "", ""]]);
    }
  }
}

function extractDriveFileId(url) {
  const match = url.match(/[-\w]{25,}/);
  if (!match) throw new Error("Invalid Google Drive file URL");
  return match[0];
}

function extractTextFromPDF(file) {
  const blob = file.getBlob();
  const resource = {
    title: file.getName(),
    mimeType: MimeType.GOOGLE_DOCS
  };

  const docFile = Drive.Files.insert(resource, blob);
  const doc = DocumentApp.openById(docFile.id);
  const text = doc.getBody().getText();
  DriveApp.getFileById(docFile.id).setTrashed(true); // Clean up temp doc
  return text;
}

function loadServiceAccountKey() {
  const file = DriveApp.getFileById(SERVICE_ACCOUNT_KEY_FILE_ID);
  return JSON.parse(file.getBlob().getDataAsString());
}

function getAccessTokenFromKey(key) {
  const url = "https://oauth2.googleapis.com/token";
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claimSet = {
    iss: key.client_email,
    scope: "https://www.googleapis.com/auth/cloud-platform",
    aud: url,
    exp: now + 3600,
    iat: now
  };

  const jwtHeader = Utilities.base64EncodeWebSafe(JSON.stringify(header));
  const jwtClaim = Utilities.base64EncodeWebSafe(JSON.stringify(claimSet));
  const signature = Utilities.computeRsaSha256Signature(jwtHeader + '.' + jwtClaim, key.private_key);
  const jwt = jwtHeader + '.' + jwtClaim + '.' + Utilities.base64EncodeWebSafe(signature);

  const response = UrlFetchApp.fetch(url, {
    method: 'post',
    payload: {
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    }
  });

  return JSON.parse(response.getContentText()).access_token;
}



function callVertexAIWithPrompt(ocrText, key) {
  const token = getAccessTokenFromKey(key);
  const model = 'gemini-2.5-pro-preview-05-06';
  const url = `https://us-central1-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/us-central1/publishers/google/models/${model}:generateContent`;

  const prompt = `
Extract the following fields from the OCR text below:
- Provider (Dr., Provider, Prescriber, Physician)
- Patient
- Medication
- Date
- Pharmacy
- Status (Approved, Denied, Pending, etc.)

Return a JSON object with these keys: provider, patient, medication, date, pharmacy, status.

TEXT:
"""${ocrText}"""
`;

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }]
      }
    ]
  };

  const response = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    headers: {
      Authorization: `Bearer ${token}`
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  try {
    if (response.getResponseCode() !== 200) {
      Logger.log(`Vertex AI error: ${response.getContentText()}`);
      return null;
    }

    const result = JSON.parse(response.getContentText());
    const parts = result.candidates[0]?.content?.parts || [];

    for (const part of parts) {
      const content = part.text.replace(/```json|```/g, '').trim();
      try {
        return JSON.parse(content);
      } catch (e) {
        Logger.log(`Failed to parse JSON: ${content}`);
      }
    }

    Logger.log("No valid response content from Vertex AI.");
    return null;
  } catch (e) {
    Logger.log(`Error processing Vertex AI response: ${e}`);
    return null;
  }
}

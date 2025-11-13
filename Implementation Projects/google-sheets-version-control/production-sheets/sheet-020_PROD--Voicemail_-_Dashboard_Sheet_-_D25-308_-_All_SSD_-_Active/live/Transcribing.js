const BUCKET_NAME = 'phi-ocr-us-central1-bucket';
const SERVICE_ACCOUNT_KEY_FILE_ID = '1G0idfdLuUxrKrfL-oSSW8Gy7RJpQ-BlD';
const PROJECT_ID = 'pdf-ocr-extraction-461917';





function processReadyPDFsFromColumnG() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Gemini Test");
  const key = loadServiceAccountKey();
  const token = getAccessTokenFromKey(key);
  const values = sheet.getDataRange().getValues();




  for (let i = 1; i < 2; i++) {
    const row = values[i];
    const fileUrl = row[6]; // Column G


    try {
      const fileId = extractDriveFileId(fileUrl);
      const file = DriveApp.getFileById(fileId);
      //const text = extractTextFromPDF(file);

      const text = extractTextFromAudio(file, token);

      Logger.log(text)

      sheet.getRange(i + 1, 8, 1, 1).setValue(text)

      // const aiResult = callVertexAIWithPrompt(text, key);

      // const output = [
      //   aiResult?.patient || "",
      //   aiResult?.dob || "",
      //   aiResult?.sender || "",
      //   aiResult?.category || "",
      //   aiResult?.faxSummary || "",
      //   aiResult?.oneSentenceSummary || "",
      // ];

      //Logger.log(output)

      //sheet.getRange(i + 1, 9, 1, output.length).setValues([output]);

    } catch (e) {
      Logger.log(`Row ${i + 1} failed: ${e}`);
      //sheet.getRange(i + 1, startColumn, 1, headers.length).setValues([["Error", "", "", "", "", ""]]);
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




function extractTextFromAudio(file, token) {
  const blob = file.getBlob();
  const fileBytes = blob.getBytes();
  const content = Utilities.base64Encode(fileBytes);

  const speechApiUrl = "https://speech.googleapis.com/v1/speech:recognize";
  const payload = {
    config: {
      encoding: 'FLAC', // change if you're using LINEAR16 or MP3
      sampleRateHertz: 16000,
      languageCode: 'en-US'
    },
    audio: {
      content: content
    }
  };

  const response = UrlFetchApp.fetch(speechApiUrl, {
    method: 'post',
    contentType: 'application/json',
    headers: {
      Authorization: `Bearer ${token}`
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  const resultText = response.getContentText();
  Logger.log(resultText);

  const result = JSON.parse(resultText);
  const transcript = result.results?.map(r => r.alternatives[0].transcript).join(" ") || "";

  return transcript;
}




function extractTextFromAudioTest(file, token) {
  const blob = file.getBlob();
  const fileName = `voicemail_${Date.now()}.flac`; // or .wav
  const content = Utilities.base64Encode(blob.getBytes());

  const speechApiUrl = `https://speech.googleapis.com/v1/speech:recognize?key=${token}`;
  const payload = {
    config: {
      encoding: 'FLAC', // Use 'LINEAR16' or appropriate format
      sampleRateHertz: 16000,
      languageCode: 'en-US'
    },
    audio: {
      content: content
    }
  };

  const response = UrlFetchApp.fetch(speechApiUrl, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  const result = JSON.parse(response.getContentText());
  Logger.log(result)
  const transcript = result.results?.map(r => r.alternatives[0].transcript).join(" ") || "";

  return transcript;
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
Extract the following fields from the OCR text below and also categorize the file from these types and select one category "Prior Auth Billing, Prior Auth Documents, Medical Record, Incoming Referral- part 2, Incoming Referral, Online Payment (billing), Internal Path Report, Outgoing Referral Notes, External Path Report, External Clinic Notes, Incoming Referral- Patient notes, Lab Report, Wound Culture Result":
- Patient Name (First Name Last Name)
- Patient DOB
- Sender
- Category (Based on the above list)
- Give me the brief Summary of the Fax, Just 2 sentense only.
- Give me the brief Summary of the Fax, Just 1-2 sentense only, maximum 20-28 words.

Return a JSON object with these keys: patient, dob, sender, category, faxSummary, oneSentenceSummary.

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










const promptStructure = `You are given OCR text from a PDF referral document.  
The document contains details about a patient referral to our clinic,  
"Southern Skies Dermatology and Surgery", from another doctor or practice.  

Your task is to extract ONLY the address of the **referring doctor or practice**.  
Ignore our own clinic address and patient addresses.  

Return the result as a JSON object with these fields:

{
  "Street Address": "<street address of referring doctor/practice>",
  "City, State, Zip": "<city, state, and postal code of referring doctor/practice>"
}

If a field cannot be confidently identified, return it as an empty string.

Be precise. Only include addresses of the referring doctor/practice.  
Do not include phone numbers, emails, patient info, or unrelated addresses.  

Here is the OCR text to process:
{{OCT TEXT}}]
`;

function getMissingAddresses_Referrals() {

  var sheetReferringPractice = SpreadsheetApp.openById("1mRNkTi_-DM-8ewxGmvAQpHcRns08Gw6avzPVqtniWCc").getSheetById("1845862191");
  var existingLocationData = sheetReferringPractice.getDataRange().getValues();
  var objDataLocations = makeObjectData_(existingLocationData);
  var objHeaders = makeObjHeaderDetails_FromSheet_({ sheet: sheetReferringPractice });

  var bReturn = false;

  objDataLocations.forEach((r, x) => {
    var vRow = x + 2;

    if (bReturn) return;

    if (r["Street Address"] != "") return;
    if (r["place_id"] != "") return;
    if (r["Street Address by AI"] != "") return;
    if (r["Referral PDF file"] == "") return;

    var fileUrl = r["Referral PDF file"];

    console.log({ vRow });

    const fileId = vertexAIconfigLib.extractDriveFileId(fileUrl);
    const file = DriveApp.getFileById(fileId);

    if (![MimeType.PDF].includes(file.getMimeType())) return;

    const text = vertexAIconfigLib.extractTextFromPDF(file);

    const prompt = promptStructure.replace("{{OCT TEXT}}", text);
    const aiResult = vertexAIconfigLib.callVertexAIWithPrompt({ prompt });

    console.log(aiResult);

    if (aiResult) {
      if (aiResult["Street Address"] != "") {
        sheetReferringPractice.getRange(vRow, objHeaders["Street Address by AI"].columnNumber).setValue(aiResult["Street Address"]);
        sheetReferringPractice.getRange(vRow, objHeaders["City, State, Zip by AI"].columnNumber).setValue(aiResult["City, State, Zip"]);
      } else {
        sheetReferringPractice.getRange(vRow, objHeaders["Street Address by AI"].columnNumber).setValue("NA");
      }
    }

    // bReturn = true;

  });

}

function testARGetrth() {

  var sheetReferringPractice = SpreadsheetApp.openById("1mRNkTi_-DM-8ewxGmvAQpHcRns08Gw6avzPVqtniWCc").getSheetById("1845862191");
  var existingLocationData = sheetReferringPractice.getDataRange().getValues();
  var objDataLocations = makeObjectData_(existingLocationData);
  var objHeaders = makeObjHeaderDetails_FromSheet_({ sheet: sheetReferringPractice });

  var x = 287;

  var fileUrl = "https://drive.google.com/file/d/12sCPmRKp6b-saK9fm98vdsrXZzEuC3ME/view?usp=drivesdk";

  var r = objDataLocations[x];
  var vRow = x + 2;

  if (r["Street Address"] != "") return;
  if (r["place_id"] != "") return;
  // if (r["Street Address by AI"] != "" || ) return;
  if (r["Referral PDF file"] == "") return;

  console.log({ vRow });

  // return;

  const fileId = vertexAIconfigLib.extractDriveFileId(fileUrl);
  const file = DriveApp.getFileById(fileId);

  if (![MimeType.PDF].includes(file.getMimeType())) return;

  const text = vertexAIconfigLib.extractTextFromPDF(file);

  const prompt = promptStructure.replace("{{OCT TEXT}}", text);
  const aiResult = vertexAIconfigLib.callVertexAIWithPrompt({ prompt });

  console.log(aiResult);

  if (aiResult) {
    if (aiResult["Street Address"] != "") {
      sheetReferringPractice.getRange(vRow, objHeaders["Street Address by AI"].columnNumber).setValue(aiResult["Street Address"]);
      sheetReferringPractice.getRange(vRow, objHeaders["City, State, Zip by AI"].columnNumber).setValue(aiResult["City, State, Zip"]);
    } else {
      sheetReferringPractice.getRange(vRow, objHeaders["Street Address by AI"].columnNumber).setValue("NA");
    }
  }

}

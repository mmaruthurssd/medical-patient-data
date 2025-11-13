// Create e-Signatures using Google Sheets v2.1

var apiKey = "NWQwNTU5MTktZGRmNS00YjI4LTgyOTctZGMzODczM2Y0MzNh";

const brandId = "3562d23e-4ec2-45c6-9697-b49da737c5a8";

const SheetName = "Docs to sign";
const FOLDER_ID = "1_n8Xyq5T4-hi6Hliwg-zsdGMYHF8MBCv";

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("PDF Tools")
    .addItem("Send docs to sign", "processDocsToSign")
    .addToUi();
}

function createNewId_() {
  const props = PropertiesService.getScriptProperties();
  const docs_ids = props.getProperty('docs_ids');

  var lastID = 0;
  if (docs_ids) {
    lastID = Number(docs_ids);
  }

  var newID = lastID + 1;

  props.setProperty('docs_ids', newID.toString());

  return `sig 25-${newID}`;
}

function processDocsToSign() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SheetName);

  if (!sheet) {
    SpreadsheetApp.getUi().alert(`sheet [${SheetName}] not found.`);
    return;
  }

  if (sheet.getLastRow() < 2 || sheet.getLastColumn() < 2) return;

  const data = sheet.getDataRange().getRichTextValues();
  const allHeaders = data[0].map(c => c.getText());

  const objHeaders = makeObjHeaderDetails_({ allHeaders });

  for (var rr = 1; rr < data.length; rr++) {
    var rowData = data[rr];
    var vRow = rr + 1;

    var recordId = rowData[objHeaders["ID #"].columnIndex].getText().toString().trim();
    var fileUrl = rowData[objHeaders["PDF file"].columnIndex].getLinkUrl();
    var fileId = getGoogleDriveId_(fileUrl);

    var documentId = rowData[objHeaders["documentId"].columnIndex].getText().toString().trim();

    var names = rowData[objHeaders["Recipient Name"].columnIndex].getText().toString().trim();
    var emails = rowData[objHeaders["Recipient Email"].columnIndex].getText().toString().trim();
    var title = rowData[objHeaders["Agreement Title"].columnIndex].getText().toString().trim();

    if (![emails, title, names].includes("") && documentId == "" && fileId) {

      if (recordId == "") {
        recordId = createNewId_();
        sheet.getRange(vRow, objHeaders["ID #"].columnNumber).setValue(recordId);
      }

      var documentId = sendForSignature_({ fileId, title, emails, names });

      if (documentId) {
        var sFormula = `=if($${objHeaders["Signed Emails"].columnName}${vRow}<>"",COUNTA(SPLIT($${objHeaders["Signed Emails"].columnName}${vRow},",")),0)&" / "&if($${objHeaders["Recipient Email"].columnName}${vRow}<>"",COUNTA(SPLIT($${objHeaders["Recipient Email"].columnName}${vRow},",")),0)`;

        sheet.getRange(vRow, objHeaders["documentId"].columnNumber).setValue(documentId);
        sheet.getRange(vRow, objHeaders["Status"].columnNumber).setFormula(sFormula);
      }
    }

  }

}

function sendForSignature_({ fileId, title, emails, names }) {
  try {

    var allRecipientsNames = replaceWords_(names, [[", ", ","]]).toString().split(",");
    var allRecipientsEmails = replaceWords_(emails, [[", ", ","]]).toString().split(",");

    if (allRecipientsNames.length != allRecipientsEmails.length) return;

    var signers = [];

    allRecipientsEmails.forEach((re, x) => {
      signers.push({
        Name: allRecipientsNames[x],
        EmailAddress: allRecipientsEmails[x],
        SignerType: "Signer",
        SigningOrder: x + 1
      });
    });

    // var signers = [
    //   {
    //     Name: signerName1,
    //     EmailAddress: signerEmail1,
    //     SignerType: "Signer",
    //     SigningOrder: 1
    //   },
    //   {
    //     Name: signerName2,
    //     EmailAddress: signerEmail2,
    //     SignerType: "Signer",
    //     SigningOrder: 2
    //   }
    // ];

    // Load file
    var file = DriveApp.getFileById(fileId);
    var blob = file.getBlob();
    var mimeType = blob.getContentType() || 'application/pdf'; // usually application/pdf

    // Raw base64
    var base64Raw = Utilities.base64Encode(blob.getBytes());
    var base64DataUri = 'data:' + mimeType + ';base64,' + base64Raw;

    // Build body with BoldSign's exact field names (capitalization matters)
    var body = {
      Title: title,
      BrandId: brandId,
      AutoDetectFields: true,
      Signers: signers,
      UseTextTags: true,
      Files: [
        {
          FileName: file.getName(),
          Base64: base64DataUri
        }
      ]
    };

    var url = "https://api.boldsign.com/v1/document/send";
    var options = {
      method: "post",
      contentType: "application/json",
      headers: { "X-API-KEY": apiKey },
      payload: JSON.stringify(body),
      muteHttpExceptions: true
    };

    var response = UrlFetchApp.fetch(url, options);
    Logger.log("HTTP " + response.getResponseCode());
    Logger.log(response.getContentText());

    if (response.getResponseCode() == 201) {
      return JSON.parse(response.getContentText()).documentId;
    }

  } catch (e) {
    Logger.log('Error: ' + e.message);
  }
}

function makeObjHeaderDetails_({ allHeaders, bLowerCase }) {
  if (bLowerCase) {
    allHeaders = allHeaders.map(function (r) { return r.toString().trim().toLowerCase(); });
  }

  var obj = {};
  allHeaders.map(function (h, x) {
    if (h.toString().trim() != -1) {
      obj[h.toString().trim()] = {};
      obj[h.toString().trim()].columnIndex = x;
      obj[h.toString().trim()].columnNumber = x + 1;
      obj[h.toString().trim()].columnName = getColumnName_(x + 1);
      obj[h.toString().trim()].header = h;
    }
  });

  return obj;
}

function makeObjHeaderDetails_FromSheet({ sheet, bLowerCase, headerRowNo }) {
  if (!headerRowNo) headerRowNo = 1;
  var allHeaders = sheet.getRange(headerRowNo, 1, 1, Math.max(sheet.getLastColumn(), 2)).getValues()[0].map(function (r) { return r.toString().trim(); });
  return makeObjHeaderDetails_({ allHeaders, bLowerCase });
}

function getColumnName_(columnNumber) {
  if (columnNumber < 1) return "";

  let columnName = "";
  while (columnNumber > 0) {
    let remainder = (columnNumber - 1) % 26;
    columnName = String.fromCharCode(65 + remainder) + columnName;
    columnNumber = Math.floor((columnNumber - 1) / 26);
  }
  return columnName;
}

function getGoogleDriveId_(url) {
  if (!url) { return null; }

  const regex = /[-\w]{25,}/;
  const match = url.match(regex);

  if (match && match[0]) {
    return match[0];
  } else {
    // console.log("Could not extract a valid Google Drive ID from the URL.");
    return null;
  }
}

function replaceWords_(sString, words) {
  var new_sString = sString.toString();

  for (var rr = 0; rr < words.length; rr++) {
    while (new_sString.indexOf(words[rr][0]) > -1) {
      new_sString = new_sString.replace(words[rr][0], words[rr][1]);
    }
  }

  return new_sString;
}
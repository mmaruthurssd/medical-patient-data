// getDataFrominvoices v2.0

const Key_CustomSearchGoogleAPI = 'AIzaSyB6gy2UC4j65ZJ-8jkY7KpwIB5dGurEEkc';
const CX = '22d7165c2baff494d';

var lineBreakChar = String.fromCharCode(10);

//search_google_custom

function autoRun_ProcessInvoices() {
  getInfoFromInvoices_MultipleInvoices();
}

function getInfoFromInvoices_MultipleInvoices() {
  if (!scriptHandler_(true)) return;

  SpreadsheetApp.flush();

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Documents");
  var sheetUniqueItemsOrdered = ss.getSheetByName("Unique Items Ordered");

  if (!sheet || !sheetUniqueItemsOrdered) return;
  if (sheet.getLastRow() < 3) return;

  const richTextValues = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getRichTextValues();

  const headersObj = vertexAIconfigLib.makeObjHeaderDetails_FromSheet({ sheet, headerRowNo: 2 });

  if ([headersObj["Doc Status"], headersObj["File Name (Hyperlinked)"]].includes(null)) return;

  var allExistingOrders = richTextValues.map(r => r[headersObj["Order #"].columnIndex].getText().toString().toLowerCase());

  const objConfig = vertexAIconfigLib.getConfig();

  const docType = "Multiple Invoices";

  var filesToProcess = {
    rows: [],
    fileTexts: [],
    fileUrls: []
  };

  for (let i = 2; i < richTextValues.length; i++) {
    if (isOverTime_(1000 * 60 * 10) || filesToProcess.fileTexts.length >= 50) break;

    const row = richTextValues[i];
    const fileUrl = row[headersObj["File Name (Hyperlinked)"].columnIndex].getLinkUrl();
    const docStatus = row[headersObj["Doc Status"].columnIndex].getText();

    if (!fileUrl) continue;
    if (!docType) continue;
    if (!objConfig[docType]) continue;

    if (docStatus.toString() != "") continue;

    var fieldNames = Object.entries(objConfig[docType].fields).map(function ([key, value]) { return key; });
    var fieldHeaderObj = fieldNames.map(function (fieldName) { return headersObj[fieldName]; });
    if (fieldHeaderObj.includes(null)) continue;

    try {
      Utilities.sleep(100);
      const fileId = vertexAIconfigLib.extractDriveFileId(fileUrl);
      const file = DriveApp.getFileById(fileId);

      if (![MimeType.PDF].includes(file.getMimeType())) continue;

      const text = vertexAIconfigLib.extractTextFromPDF(file);

      var vRow = i + 1;
      filesToProcess.rows.push(vRow);
      filesToProcess.fileTexts.push(text);
      filesToProcess.fileUrls.push(fileUrl);

      console.log(`Total files so far: ${filesToProcess.rows.length}`);

    } catch (e) {
      Logger.log(`Row ${i + 1} failed: ${e}`);
    }
  }

  var sOCR_PROMPT = "";
  filesToProcess.fileTexts.forEach((tt, x) => {

    sOCR_PROMPT += `${lineBreakChar}${lineBreakChar}
    TEXT_${x + 1}:{{
    """{${tt}}"""
    }}`

  });

  if (filesToProcess.fileTexts.length > 0) {
    const prompt = objConfig[docType]["Prompt"].replace("{OCR_PROMPT}", sOCR_PROMPT);

    const all_aiResult = vertexAIconfigLib.callVertexAIWithPrompt({ prompt });

    for (var rr = 0; rr < all_aiResult.length; rr++) {
      var vRow = filesToProcess.rows[rr];
      var aiResult = all_aiResult[rr];
      var fileUrl = filesToProcess.fileUrls[rr];

      var orderNo = aiResult['orderNo'];
      if (!orderNo) {
        sheet.getRange(vRow, headersObj["Doc Status"].columnNumber).setValue("[Order No] not found");
        continue;
      }
      if (allExistingOrders.includes(orderNo.toString().toLowerCase())) {
        sheet.getRange(vRow, headersObj["Doc Status"].columnNumber).setValue("Duplicate");
        continue;
      }

      Object.entries(objConfig[docType].fields).map(function ([key, value]) {
        let aiValue = aiResult[value] || '-';
        if (typeof (aiValue) == "object") {
          aiValue = aiValue.join(String.fromCharCode(10)).toString();
        }
        sheet.getRange(vRow, headersObj[key].columnNumber).setValue(aiValue);
      });

      //>>
      let invoiceNo = aiResult['orderNo'] || '-';
      let orderDate = aiResult['date'] || '-';
      let supplier = aiResult['supplier'] || '-';
      let website = aiResult['website'] || '-';
      let itemsArray = aiResult['itemsArray'] || [];

      var allDataOutputUniqueItems = [];
      var allDataOutput_links = [];
      itemsArray.forEach(r => {
        let sItem = r[0];
        let sQty = r[1];
        let sPrice = r[2];
        let sWebPage = searchItemLink_(sItem, website);
        allDataOutputUniqueItems.push([invoiceNo, orderDate, supplier, sItem, sQty, sPrice, sWebPage]);

        let fileRichText = SpreadsheetApp.newRichTextValue().setText(invoiceNo).setLinkUrl(fileUrl).build();
        allDataOutput_links.push([fileRichText]);
      });

      if (allDataOutputUniqueItems.length > 0) {
        var vRow2 = sheetUniqueItemsOrdered.getLastRow() + 1;
        sheetUniqueItemsOrdered.getRange(vRow2, 1, allDataOutputUniqueItems.length, allDataOutputUniqueItems[0].length).setValues(allDataOutputUniqueItems);
        sheetUniqueItemsOrdered.getRange(vRow2, 1, allDataOutput_links.length, allDataOutput_links[0].length).setRichTextValues(allDataOutput_links);
      }
      //<<

      allExistingOrders.push(orderNo);
      sheet.getRange(vRow, headersObj["Doc Status"].columnNumber).setValue("Processed");
    }

  }

  //>>
  if (sheet.getLastRow() > 3 && headersObj["Date"]) {
    sheet.getRange(3, 1, sheet.getLastRow() - 2, sheet.getLastColumn()).sort({ column: headersObj["Date"].columnNumber, ascending: false });
  }
  //<<

  //>>
  if (sheetUniqueItemsOrdered.getLastRow() > 3) {
    sheetUniqueItemsOrdered.getRange(3, 1, sheetUniqueItemsOrdered.getLastRow() - 2, sheetUniqueItemsOrdered.getLastColumn()).sort([{ column: 2, ascending: false }, { column: 1, ascending: true }]);
  }
  //<<

  scriptHandler_release_();
}

function getInfoFromInvoices() {
  if (!scriptHandler_(true)) return;

  SpreadsheetApp.flush();

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Documents");
  var sheetUniqueItemsOrdered = ss.getSheetByName("Unique Items Ordered");

  if (!sheet || !sheetUniqueItemsOrdered) return;
  if (sheet.getLastRow() < 3) return;

  const richTextValues = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getRichTextValues();

  const headersObj = vertexAIconfigLib.makeObjHeaderDetails_FromSheet({ sheet, headerRowNo: 2 });

  if ([headersObj["Doc Status"], headersObj["File Name (Hyperlinked)"]].includes(null)) return;

  const objConfig = vertexAIconfigLib.getConfig();

  for (let i = 2; i < richTextValues.length; i++) {
    if (isOverTime_()) break;

    const row = richTextValues[i];
    const fileUrl = row[headersObj["File Name (Hyperlinked)"].columnIndex].getLinkUrl();
    const docStatus = row[headersObj["Doc Status"].columnIndex].getText();
    const docType = "Invoice";

    if (!fileUrl) continue;
    if (!docType) continue;
    if (!objConfig[docType]) continue;

    if (docStatus.toString() != "") continue;

    var fieldNames = Object.entries(objConfig[docType].fields).map(function ([key, value]) { return key; });
    var fieldHeaderObj = fieldNames.map(function (fieldName) { return headersObj[fieldName]; });
    if (fieldHeaderObj.includes(null)) continue;

    try {
      const fileId = vertexAIconfigLib.extractDriveFileId(fileUrl);
      const file = DriveApp.getFileById(fileId);

      if (![MimeType.PDF].includes(file.getMimeType())) continue;

      const text = vertexAIconfigLib.extractTextFromPDF(file);

      const prompt = objConfig[docType]["Prompt"].replace("{ocrText}", text);

      const aiResult = vertexAIconfigLib.callVertexAIWithPrompt({ prompt });
      // console.log({ aiResult, i });

      Object.entries(objConfig[docType].fields).map(function ([key, value]) {
        let aiValue = aiResult[value] || '-';
        if (typeof (aiValue) == "object") {
          aiValue = aiValue.join(String.fromCharCode(10)).toString();
        }
        sheet.getRange(i + 1, headersObj[key].columnNumber).setValue(aiValue);
      });

      //>>
      let invoiceNo = aiResult['orderNo'] || '-';
      let orderDate = aiResult['date'] || '-';
      let supplier = aiResult['supplier'] || '-';
      let website = aiResult['website'] || '-';
      let itemsArray = aiResult['itemsArray'] || [];

      var allDataOutputUniqueItems = [];
      var allDataOutput_links = [];
      itemsArray.forEach(r => {
        let sItem = r[0];
        let sQty = r[1];
        let sPrice = r[2];
        let sWebPage = searchItemLink_(sItem, website);
        allDataOutputUniqueItems.push([invoiceNo, orderDate, supplier, sItem, sQty, sPrice, sWebPage]);

        let fileRichText = SpreadsheetApp.newRichTextValue().setText(invoiceNo).setLinkUrl(fileUrl).build();
        allDataOutput_links.push([fileRichText]);
      });

      if (allDataOutputUniqueItems.length > 0) {
        var vRow = sheetUniqueItemsOrdered.getLastRow() + 1;
        sheetUniqueItemsOrdered.getRange(vRow, 1, allDataOutputUniqueItems.length, allDataOutputUniqueItems[0].length).setValues(allDataOutputUniqueItems);
        sheetUniqueItemsOrdered.getRange(vRow, 1, allDataOutput_links.length, allDataOutput_links[0].length).setRichTextValues(allDataOutput_links);
      }
      //<<

      sheet.getRange(i + 1, headersObj["Doc Status"].columnNumber).setValue("Processed");

    } catch (e) {
      Logger.log(`Row ${i + 1} failed: ${e}`);
    }

  }

  //>>
  if (sheet.getLastRow() > 3 && headersObj["Date"]) {
    sheet.getRange(3, 1, sheet.getLastRow() - 2, sheet.getLastColumn()).sort({ column: headersObj["Date"].columnNumber, ascending: false });
  }
  //<<

  //>>
  if (sheetUniqueItemsOrdered.getLastRow() > 3) {
    sheetUniqueItemsOrdered.getRange(3, 1, sheetUniqueItemsOrdered.getLastRow() - 2, sheetUniqueItemsOrdered.getLastColumn()).sort([{ column: 2, ascending: false }, { column: 1, ascending: true }]);
  }
  //<<

  scriptHandler_release_();
}

function searchItemLink_(itemName, supplierDomain) {
  const query = encodeURIComponent(`${itemName} site:${supplierDomain}`);
  const url = `https://www.googleapis.com/customsearch/v1?key=${Key_CustomSearchGoogleAPI}&cx=${CX}&q=${query}`;

  const response = UrlFetchApp.fetch(url);
  const json = JSON.parse(response.getContentText());

  if (json.items && json.items.length > 0) {
    return json.items[0].link;
  } else {
    return null;
  }
}


const prop_ScriptRunning_docs = "scriptRunning_documents";

function scriptHandler_(instantReject) {
  var sMiliSecs = new Date().getTime().toFixed(0).toString();

  var prop = getProperty_(prop_ScriptRunning_docs);

  var bLoop = true;

  if (prop != null) {
    while (bLoop) {
      if (prop != "") {
        prop = getProperty_(prop_ScriptRunning_docs);
        if ((Number(sMiliSecs) - Number(prop)) > 1000 * 60 * 30) {
          setProperty_(prop_ScriptRunning_docs, sMiliSecs);
          bLoop = false;
        } else if (instantReject == true) {
          console.log("same script is already running, returning to avoid collision.");
          return false;
        }
      } else {
        setProperty_(prop_ScriptRunning_docs, sMiliSecs);
        bLoop = false;
      }

    }
  } else {
    setProperty_(prop_ScriptRunning_docs, sMiliSecs);
  }

  Utilities.sleep(1000);

  var prop = getProperty_(prop_ScriptRunning_docs);

  if (prop != sMiliSecs) {
    return;
  }

  return true;
}

function scriptHandler_release_() {
  setProperty_(prop_ScriptRunning_docs, "");
}

const vScriptStartTime = new Date().getTime();

function isOverTime_(vTimeOutMili = 240000) {
  const vCurTime = new Date().getTime();
  const vRunTime = vCurTime - vScriptStartTime;
  return vRunTime > vTimeOutMili;
}

function getProperty_(propname) {
  return PropertiesService.getScriptProperties().getProperty(propname);
}

function setProperty_(propname, value) {
  PropertiesService.getScriptProperties().setProperty(propname, value);
}
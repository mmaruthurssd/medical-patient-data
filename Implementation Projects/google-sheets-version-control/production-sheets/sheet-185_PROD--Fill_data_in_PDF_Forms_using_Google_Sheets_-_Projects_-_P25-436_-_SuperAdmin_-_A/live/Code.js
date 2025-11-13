// Fill data in PDF forms v3.2.0

// const basicAppURL = "https://script.google.com/a/macros/ssdspc.com/s/AKfycbxdzE8kaJcOdbY9IVlRn45wUGSBfsA4UPCD90SUrfg/dev";
const basicAppURL = "https://script.google.com/a/macros/ssdspc.com/s/AKfycbz2lkcjW6RLcVjn5cmrYM8W6QeJB2gi0XVf_ukWwmJtW5WWsZU6tHrb6uu-JrEWhWCC/exec"

const configSheetName = "Config";
// const col_Generate = "Generate";

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("PDF Tools")
    .addItem("Generate PDF", "launchWebApp_generatePDF")
    .addSeparator()
    .addItem("Add new Template", "launchWebApp_getTemplateInfo")
    .addSeparator()
    .addItem("Create Google Form", "createFormFromUniqueFields")
    .addToUi();
}


function getListsForGeneration() {
  var obj = {};

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = ss.getSheets();
  obj.sheetnames = sheets.map(sn => sn.getName());

  obj.formnames = Object.entries(getConfig()).map(([key, value]) => key);

  return obj;
}

function doGet() {
  return HtmlService.createTemplateFromFile('index').evaluate().setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function savePDFToDrive({ base64Data, filename, folderlink, sourcesheet, vRow, formname }) {
  const blob = Utilities.newBlob(Utilities.base64Decode(base64Data), MimeType.PDF, filename);
  var folder = DriveApp.getFolderById(getGoogleDriveId_(folderlink));
  const savedFile = folder.createFile(blob);
  const url = savedFile.getUrl();

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sourcesheet);
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];

  var sH = `Form link [${formname}]`;

  var vColumn = 0;

  if (headers.includes(sH)) {
    vColumn = headers.indexOf(sH) + 1;
  } else {
    vColumn = sheet.getLastColumn() + 1;
    sheet.insertColumnAfter(vColumn - 1);
    sheet.getRange(1, vColumn).setValue(sH);
  }

  let fileRichText = SpreadsheetApp.newRichTextValue().setText(filename).setLinkUrl(url).build();
  sheet.getRange(vRow, vColumn).setRichTextValue(fileRichText);

  return savedFile.getUrl();
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getTemplatePDF(templatelink) {
  const TEMPLATE_FILE_ID = getGoogleDriveId_(templatelink);
  const file = DriveApp.getFileById(TEMPLATE_FILE_ID);
  const blob = file.getBlob();
  return Utilities.base64Encode(blob.getBytes());
}

function getMappingOfFields_() {
  var obj = {};

  var sheetFields = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Unique Fields");
  var allData = sheetFields.getDataRange().getValues();
  const allHeaders = allData.slice(0, 1)[0];
  const objHeaders = makeObjHeaderDetails_({ allHeaders });
  allData.shift();

  allData.forEach((r, x) => {
    r.forEach((c, y) => {
      var h = allHeaders[y];

      if (!["Question", "Question Type"].includes(h)) {
        if (!obj[h]) obj[h] = {};

        if (c.toString().trim() != "") {
          c.toString().split(", ").forEach(ff => { obj[h][ff] = r[objHeaders["Question"].columnIndex]; });
        }
      }
    });
  });

  return obj;
}

function getConfig() {
  var fieldsMap = getMappingOfFields_();

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(configSheetName);
  var allData = sheet.getDataRange().getValues();

  const allHeaders = allData.slice(0, 1)[0];
  const objHeaders = makeObjHeaderDetails_({ allHeaders });

  allData.shift();

  var obj = {};

  allData.forEach(r => {
    var sheetName = r[objHeaders["Form Name"].columnIndex];
    var type = r[objHeaders["Type"].columnIndex];
    var outputfilename = r[objHeaders["Output File Name"].columnIndex];

    var templateLink = r[objHeaders["Template Link"].columnIndex];
    var templateID = getGoogleDriveId_(templateLink);

    var folderlink = r[objHeaders["Destn Folder Link"].columnIndex];
    var folderID = getGoogleDriveId_(folderlink);

    if (sheetName == "") return;
    if (type == "" || !["Form details", "Sheet details"].includes(type)) return;

    if (type == "Form details" && (!templateID || !folderID || outputfilename.toString().trim() == "")) return;

    if (!obj[sheetName]) obj[sheetName] = {};

    switch (type) {
      case "Form details":
        obj[sheetName].templateLink = templateLink;
        obj[sheetName].folderlink = folderlink;
        obj[sheetName].outputfilename = outputfilename;
        obj[sheetName].formfields = r.filter((f, x) => allHeaders[x] == "Field");
        obj[sheetName].sheetfields = obj[sheetName].formfields.map(ff => {
          var sTemp = "";
          if (fieldsMap[sheetName]) {
            if (fieldsMap[sheetName][ff]) {
              return fieldsMap[sheetName][ff];
            }
          }
          return sTemp;
        });
        break;
    }

  });

  Object.entries(obj).forEach(([key, value]) => {
    if (!value.templateLink) {
      obj[key] = null;
    }
  });

  return obj;
}

function recordNewTemplateConfig(obj) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(configSheetName);
  var allData = sheet.getDataRange().getValues();

  const allHeaders = allData.slice(0, 1)[0];
  const objHeaders = makeObjHeaderDetails_({ allHeaders });

  //>>
  var formname = obj.formname;
  var templatelink = obj.templatelink;
  var folderlink = obj.folderlink;
  var outputfilename = obj.outputfilename;
  var fields = obj.fields;
  //<<

  //>>
  var allDataOutput = emptyRow_(allHeaders.length);

  allDataOutput[objHeaders["Form Name"].columnIndex] = formname;
  allDataOutput[objHeaders["Template Link"].columnIndex] = templatelink;
  allDataOutput[objHeaders["Destn Folder Link"].columnIndex] = folderlink;
  allDataOutput[objHeaders["Output File Name"].columnIndex] = outputfilename;
  allDataOutput[objHeaders["Type"].columnIndex] = "Form details";

  var vRow = sheet.getLastRow() + 1;
  sheet.getRange(vRow, 1, 1, allDataOutput.length).setValues([allDataOutput]);
  sheet.getRange(vRow, allHeaders.indexOf("Field") + 1, 1, fields.length).setValues([fields]);
  sheet.getRange(1, allHeaders.indexOf("Field") + 1, 1, fields.length).setValue("Field");
  //<<

  //>>
  var sheetFormFields = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Form Fields");
  sheetFormFields.insertColumnAfter(sheetFormFields.getLastColumn());

  var allFormFields = [];
  allFormFields.push([formname]);
  fields.forEach(ff => { allFormFields.push([ff]) });
  sheetFormFields.getRange(1, sheetFormFields.getLastColumn() + 1, allFormFields.length, 1).setValues(allFormFields);
  //<<

  //>>
  var range = sheet.getRange(`$${getColumnName_(allHeaders.indexOf("Field") + 1)}$${vRow}:$${vRow}`);
  var rule = SpreadsheetApp.newDataValidation().requireValueInRange(range).build();

  var sheetFields = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Unique Fields");
  sheetFields.insertColumnAfter(sheetFields.getLastColumn());

  var vColumn = sheetFields.getLastColumn() + 1;
  sheetFields.getRange(1, vColumn, sheetFields.getMaxRows(), 1).setDataValidation(null);
  sheetFields.getRange(1, vColumn).setValue(formname);
  sheetFields.getRange(2, vColumn, sheetFields.getMaxRows() - 1, 1).setDataValidation(rule);
  //<<

  return true;
}


function makeObjectData_(data) {
  var dataOutput = [];

  for (var rr = 1; rr < data.length; rr++) {
    var obj = {};

    for (var cc = 0; cc < data[0].length; cc++) {
      if (data[0][cc] != "") {
        obj[data[0][cc]] = data[rr][cc];
      }
    }

    obj.v$Row = rr + 1;

    dataOutput.push(obj)
  }

  return dataOutput;
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

function emptyRow_(vColumns, preText) {
  if (preText == null) { preText = ""; }
  var allData = [];
  for (var cc = 0; cc < vColumns; cc++) {
    allData.push(preText);
  }
  return allData;
}

function getAllDataForGeneration({ sourcesheet, formname }) {
  SpreadsheetApp.flush();

  // console.log(sourcesheet);
  // console.log(formname);
  var obj = {};

  obj.config = getConfig()[formname];
  if (!obj.config) return;

  obj.dataObj = getDataFromSheet_({ sourcesheet, formname });
  // if (!obj.dataObj) return;

  obj.objHeaders = makeObjHeaderDetails_FromSheet({ sheet: SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sourcesheet) });

  obj.template = getTemplatePDF(obj.config.templateLink);
  // console.log(obj);

  return obj;
}

function getDataFromSheet_({ sourcesheet, formname }) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sourcesheet);

  if (!sheet) return null;

  if (sheet.getLastRow() < 2) {
    return false;
  }

  var allData = sheet.getDataRange().getDisplayValues();
  var allHeaders = allData.slice(0, 1)[0];
  var objHeaders = makeObjHeaderDetails_({ allHeaders });

  // if (!allHeaders.includes(col_Generate)) return false;

  if (formname) {
    if (!objHeaders[`Form link [${formname}]`]) {
      let lColumn = sheet.getLastColumn();

      sheet.insertColumnAfter(lColumn);
      sheet.getRange(1, lColumn + 1).setValue(`Form link [${formname}]`);

      allData = sheet.getDataRange().getDisplayValues();
      allHeaders = allData.slice(0, 1)[0];
      objHeaders = makeObjHeaderDetails_({ allHeaders });
    }
  }

  var dataObj = makeObjectData_(allData);
  var filteredObj = dataObj; //dataObj.filter((f, x) => f[col_Generate] == true);

  if (filteredObj.length < 1) {
    return false;
  }

  return filteredObj;
}

function launchWebApp_generatePDF() {
  SpreadsheetApp.flush();

  var activeSheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var sourcesheet = activeSheet.getName();

  if (sourcesheet == configSheetName) {
    SpreadsheetApp.getActiveSpreadsheet().toast(`Please select another sheet, Script can't execute for: [${sourcesheet}]`, "Alert", 10);
    return;
  }

  // var objConfig = getConfig();

  // if (!objConfig[formname]) {
  //   SpreadsheetApp.getActiveSpreadsheet().toast(`Missing configuration for: [${formname}]`, "Alert", 10);
  //   return;
  // }

  dataObj = getDataFromSheet_({ sourcesheet });
  // console.log(dataObj);

  if (!dataObj) {
    SpreadsheetApp.getActiveSpreadsheet().toast(`No data to process: [${sourcesheet}]`, "Alert", 10);
    return;
  }

  var objParas = {
    processtype: "generate",
    sourcesheet
  };

  var sURL = getURL_(objParas);
  openWebApp_(sURL);
}

function launchWebApp_getTemplateInfo() {
  var sourcesheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getName();

  if (sourcesheet == configSheetName) sourcesheet = "";

  var objParas = {
    processtype: "gettemplateinfo",
    sourcesheet
  };

  sURL = getURL_(objParas);
  openWebApp_(sURL);
}

function openWebApp_(sURL) {
  const html = HtmlService.createHtmlOutput(
    `<script>window.open('${sURL}', '_blank');google.script.host.close();</script>`
  ).setWidth(10).setHeight(10);

  SpreadsheetApp.getUi().showModalDialog(html, 'Launching...');
}

function getURL_(objParas) {
  var sURL = basicAppURL;

  Object.entries(objParas).forEach(([key, value]) => {
    value = replaceWords_(value, [[" ", "%20"]]);

    if (sURL == "" || sURL == basicAppURL) {
      sURL = basicAppURL + "?" + key + "=" + value;
    } else {
      sURL += "&" + key + "=" + value;
    }
  });

  return sURL;
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


const prop_ScriptRunning = "scriptRunningStatus";
const vScriptStartTime = new Date().getTime();

function getProperty_(prop) {
  return PropertiesService.getScriptProperties().getProperty(prop);
}

function setProperty_(prop, value) {
  PropertiesService.getScriptProperties().setProperty(prop, value);
}

function isOverTime_(vTimeOutMili = 240000) {
  const vCurTime = new Date().getTime();
  const vRunTime = vCurTime - vScriptStartTime;
  return vRunTime > vTimeOutMili;
}

function scriptHandler_(instantReject) {
  var sMiliSecs = new Date().getTime().toFixed(0).toString();

  var prop = getProperty_(prop_ScriptRunning);

  var bLoop = true;

  if (prop != null) {
    while (bLoop) {
      if (prop != "") {
        prop = getProperty_(prop_ScriptRunning);
        if ((Number(sMiliSecs) - Number(prop)) > (1000 * 60 * 14.5)) {
          setProperty_(prop_ScriptRunning, sMiliSecs);
          bLoop = false;
        } else if (instantReject == true) {
          ss.toast("System is already busy running some script, Please try again after few mins");
          return false;
        }
      } else {
        setProperty_(prop_ScriptRunning, sMiliSecs);
        bLoop = false;
      }

      if (isOverTime_(1000 * 60 * 14.5)) return;

      Utilities.sleep(1000);
    }
  } else {
    setProperty_(prop_ScriptRunning, sMiliSecs);
  }

  Utilities.sleep(1000);

  var prop = getProperty_(prop_ScriptRunning);

  if (prop != sMiliSecs) {
    return;
  }

  return true;
}

function scriptHandler_release_() {
  setProperty_(prop_ScriptRunning, "");
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Script")
    .addItem("Fetch New Meetings", "fetchNewMeetings")
    .addToUi();
}

function fetchNewMeetings() {
  if (!scriptHandler_(true)) return;

  getMeetingsFromBigQuery();
  extractMeetingDetailsFromAI();

  scriptHandler_release_();
}

function myfunction() {

}

function right_(sData, vLen) {
  return sData.substring(sData.length - vLen, sData.length);
}

function left_(sData, vLen) {
  return sData.toString().substring(0, vLen);
}

function getUniques_(allData) {
  var newData = [];

  for (var rr = 0; rr < allData.length; rr++) {
    var data = allData[rr];

    if (newData.indexOf(data) == -1 && data.toString().trim() != "") {
      newData.push(data);
    }
  }

  return newData;
}

function getFileIds_(links) {
  var ids = [];
  links.forEach(link => {
    var id = getGoogleDriveId_(link);
    if (id) {
      ids.push(id);
    }
  });

  return ids;
}

function getGoogleDriveId_(url) {
  if (!url) { return null; }

  const regex = /[-\w]{25,}/;
  const match = url.match(regex);

  if (match && match[0]) {
    return match[0];
  } else {
    console.log("Could not extract a valid Google Drive ID from the URL.");
    return null;
  }
}

function makeObjectData_(data, bRich) {
  var dataOutput = [];

  for (var rr = 1; rr < data.length; rr++) {
    var obj = {};

    for (var cc = 0; cc < data[0].length; cc++) {
      var sHeader = "";
      if (bRich) {
        sHeader = data[0][cc].getText();
      } else {
        sHeader = data[0][cc];
      }
      if (sHeader != "") {
        obj[sHeader] = data[rr][cc];
      }
    }

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

function makeObjHeaderDetails_FromSheet({ sheet, bLowerCase, headerRowNo, bRich }) {
  if (!headerRowNo) headerRowNo = 1;
  var allHeaders = [];

  if (bRich) {
    allHeaders = sheet.getRange(headerRowNo, 1, 1, Math.max(sheet.getLastColumn(), 2)).getRichTextValues()[0].map(function (r) { return r.getText().toString().trim(); });
  } else {
    allHeaders = sheet.getRange(headerRowNo, 1, 1, Math.max(sheet.getLastColumn(), 2)).getValues()[0].map(function (r) { return r.toString().trim(); });
  }

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

// AI Google Chat To Dos v2.0

// "oauthScopes": [
// "https://www.googleapis.com/auth/chat.spaces.readonly",
// "https://www.googleapis.com/auth/chat.messages.readonly",
// "https://www.googleapis.com/auth/script.external_request",
// "https://www.googleapis.com/auth/userinfo.email",
// "https://www.googleapis.com/auth/userinfo.profile",
// "https://www.googleapis.com/auth/directory.readonly",
// "https://www.googleapis.com/auth/spreadsheets",
// "https://www.googleapis.com/auth/drive",
// "https://www.googleapis.com/auth/admin.directory.user.readonly",
// "https://www.googleapis.com/auth/bigquery"
//   ]

const vMiliPerMin = 1000 * 60;
const vMiliPerHour = 1000 * 60 * 60;
const vMiliPerDay = 1000 * 60 * 60 * 24;

var vNow = new Date().getTime();

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

function makeObjHeaderDetails_FromSheet_({ sheet, bLowerCase, headerRowNo, bRich }) {
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

function getProperty_(prop) {
  return PropertiesService.getScriptProperties().getProperty(prop)
}

function setProperty_(prop, value) {
  PropertiesService.getScriptProperties().setProperty(prop, value);
}

function isOverTime_(vTimeOutMili = 240000) {
  const vCurTime = new Date().getTime();
  const vRunTime = vCurTime - vScriptStartTime;
  return vRunTime > vTimeOutMili;
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

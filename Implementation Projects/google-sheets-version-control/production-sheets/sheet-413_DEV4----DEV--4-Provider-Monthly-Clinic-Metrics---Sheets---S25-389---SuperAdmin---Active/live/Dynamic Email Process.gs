
const EMAIL_CONFIG_SHEET_NAME = "Config Email";
const EMAIL_ADDRESS_ADMIN = "khenriquez@ssdspc.com; agonzalez@ssdspc.com; mm@ssdspc.com";
//const EMAIL_ADDRESS_ADMIN = "khenriquez@ssdspc.com"

function createHourlyTrigger() {
  deleteTrigger("sendDynamicEmailTrigger");

  ScriptApp.newTrigger("sendDynamicEmailTrigger")
    .timeBased()
    .everyHours(1)
    .nearMinute(15)
    .create();
}

function deleteTrigger(triggerName) {
  const allTriggers = ScriptApp.getProjectTriggers();
  for (let index = 0; index < allTriggers.length; index++) {
    if (allTriggers[index].getHandlerFunction() === triggerName) {
      ScriptApp.deleteTrigger(allTriggers[index]);
    }
  }
}

function getTodayDetails_() {
  const now = new Date();
  const dateOfToday = now.getDate();
  const dayOfToday = now.toLocaleDateString('en-US', { weekday: 'short' });
  const hourNow = now.getHours();

  return {
    date: dateOfToday,
    day: dayOfToday,
    hour: hourNow
  };
}

function testDynamicEmailTrigger() {
  dynamicEmail_(true)
}

function sendDynamicEmailTrigger() {
  dynamicEmail_(false);
}

function dynamicEmail_(test) {

  const todayDetails = getTodayDetails_();

  var benchmarksData = getBenchmarkData_();
  const allBenchmarksHeaders = benchmarksData.benchmarksHeaders;
  const objBenchmarksStats = benchmarksData.objBenchmarksStats;

  let ss = SpreadsheetApp.getActiveSpreadsheet();

  let configSheet = ss.getSheetByName(EMAIL_CONFIG_SHEET_NAME);
  let allConfigData = configSheet.getRange(1, 1, configSheet.getLastRow(), configSheet.getLastColumn()).getDisplayValues();
  let objHeaders_config = makeObjHeaderDetails_({ allHeaders: allConfigData[0] });

  var objData_Config = makeObjectData_(allConfigData);

  objData_Config.forEach((r, x) => {

    //>>
    if (r["Automatic Email Frequency"] == "Daily") {
      if (r["Automatic Email Schedule Time of Day (Default = 6pm CST)"] > 0) {
        if (r["Automatic Email Schedule Time of Day (Default = 6pm CST)"] == todayDetails.hour) {
          r["send email?"] = "Yes";
        }
      } else if (todayDetails.hour == 18) {
        r["send email?"] = "Yes";
      }

    } else if (r["Automatic Email Frequency"] == "Weekly") {
      if (r["Day of Week (for Weekly emails)"] == todayDetails.day) {
        if (r["Automatic Email Schedule Time of Day (Default = 6pm CST)"] > 0) {
          if (r["Automatic Email Schedule Time of Day (Default = 6pm CST)"] == todayDetails.hour) {
            r["send email?"] = "Yes";
          }
        } else if (todayDetails.hour == 18) {
          r["send email?"] = "Yes";
        }
      }

    } else if (r["Automatic Email Frequency"] == "Specific Monthly Dates") {
      if (r["Specific Monthly Dates"] == todayDetails.date) {
        if (r["Automatic Email Schedule Time of Day (Default = 6pm CST)"] > 0) {
          if (r["Automatic Email Schedule Time of Day (Default = 6pm CST)"] == todayDetails.hour) {
            r["send email?"] = "Yes";
          }
        } else if (todayDetails.hour == 18) {
          r["send email?"] = "Yes";
        }
      }
    }
    //<<

    if (r["Employee"].toString().trim() != "" && r["Email Address"].toString().trim() != "" && r["Months of Data"].toString().trim() != "" && ((test == true && r["Send Test Email (to admin)"] == "Yes") || (!test && r["Email Status"] == "Active" && r["send email?"] == "Yes"))) {



      var vRow = x + 2;

      var providerData = getProviderMonthlyData_(r["Employee"]);
      if (!providerData) return;

      var message = r["Message"];

      var providersList_Benchmarks = r["Providers List"].toString().split(", ");

      if (!["full history", "last 6 months", "last 3 months"].includes(r["Months of Data"].toString().trim().toLowerCase())) return;

      var vDataMonths = 0;

      switch (r["Months of Data"].toString().trim().toLowerCase()) {
        case "full history":
          vDataMonths = providerData.providerStats.length;
          break;
        case "last 6 months":
          vDataMonths = 6;
          break;
        case "last 3 months":
          vDataMonths = 3;
          break;
      }

      var providerHeaders = providerData.providerHeaders;
      var providerStats = providerData.providerStats.slice(0, vDataMonths);
      var providerStatsAvg3 = providerData.providerStatsAvg3;

      const htmlTemplate = HtmlService.createTemplateFromFile('DynamicEmail');

      htmlTemplate.message = message;

      htmlTemplate.providerHeaders = providerHeaders;
      htmlTemplate.providerStats = providerStats;
      htmlTemplate.providerStatsAvg3 = providerStatsAvg3;

      var benchmarksStats = [];

      providersList_Benchmarks.forEach(p => {
        if (p.toString().trim() == "") return;
        if (!objBenchmarksStats[p]) return;

        benchmarksStats.push(objBenchmarksStats[p]);
      });

      htmlTemplate.benchmarksHeaders = allBenchmarksHeaders;
      htmlTemplate.benchmarksStats = benchmarksStats;

      const htmlBody = htmlTemplate.evaluate().getContent();

      var emailTo = r["Email Address"];
      const sSubject = `${r["Employee"]} Monthly Metrics - ${r["Months of Data"].toString()} + Benchmarks`;

      var emailOptions = {};
      emailOptions.htmlBody = htmlBody + "<p>This email is autogenerated.</p>";

      if (test) {
        emailTo = EMAIL_ADDRESS_ADMIN;
      } else {
        emailOptions.bcc = EMAIL_ADDRESS_ADMIN;
      }

      try {
        console.log(`sending email for ${r["Employee"]} to ${emailTo}`);

        GmailApp.sendEmail(emailTo, sSubject, "", emailOptions);

        appendInEmailLog_([new Date(), new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds(), sSubject, 1, emailTo]);

        configSheet.getRange(vRow, objHeaders_config["Last Sent"].columnNumber).setValue(Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "MM/dd/yyyy HH:mm"));

        if (test) {
          configSheet.getRange(vRow, objHeaders_config["Send Test Email (to admin)"].columnNumber).clearContent();
        }
      } catch (err) {
        console.log(err.toString());
        appendInEmailLog_([new Date(), new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds(), sSubject, 1, emailTo, err.toString()]);
      }


    }
  });

}

function appendInEmailLog_(row) {
  let ELSS = SpreadsheetApp.openById("1ERfXs1YB-huftv_rIQJfy2OhaziiQU3rEtM5vmHr0nE");
  let ELSheet = getSheetByID_(ELSS, '9732092');
  ELSheet.appendRow(row);
}

function getSheetByID_(ss, sheetID) {
  let allSheets = ss.getSheets();

  return allSheets.filter(s => s.getSheetId().toString() == sheetID)[0]
}

function testARR() {
  var inputStr = "2025-Sep";
  var bEligible = bEligible_(inputStr);

  console.log(bEligible);
}

// whether 12 days has passed since month end ?
function bEligible_(inputStr) {
  // Parse input string like "2025-July"
  const [yearStr, monthName] = inputStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = new Date(`${monthName} 1, ${year}`).getMonth(); // 0-based month

  // Get the date of 12th of the next month
  let nextMonth = month + 1;
  let nextMonthYear = year;
  if (nextMonth > 11) {
    nextMonth = 0;
    nextMonthYear += 1;
  }

  const targetDate = new Date(nextMonthYear, nextMonth, 12); // 12th of next month
  const today = new Date();

  // Compare only dates (not time)
  targetDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return today >= targetDate;
}

function getProviderMonthlyData_(provider) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetProvider = ss.getSheetByName(provider);

  if (!sheetProvider) return null;


  const vHeaderRow = 29;
  const vAvg3Row = 24;

  if (sheetProvider.getLastRow() <= vHeaderRow) return null;


  var providerHeaders = sheetProvider.getRange(vHeaderRow, 3, 1, 20).getDisplayValues()[0];
  var providerStats = sheetProvider.getRange(vHeaderRow + 1, 3, sheetProvider.getLastRow() - vHeaderRow, 20).getDisplayValues();
  var providerStatsAvg3 = sheetProvider.getRange(vAvg3Row, 3, 1, 20).getDisplayValues();


  providerStats = providerStats.filter(r => bEligible_(r[0]));

  providerStats.forEach(r => {
    r[0] = left_(r[0], 8);
  });

  if (providerStats.length < 1) {
    return null;
  }

  providerStatsAvg3[0][0] = "LAST 3 MONTHS AVG";

  return { providerHeaders, providerStats, providerStatsAvg3 };
}

function getBenchmarkData_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Benchmarks");

  if (!sheet) return null;

  const vHeaderRow = 2;

  if (sheet.getLastRow() <= vHeaderRow) return null;

  var benchmarksHeaders = sheet.getRange(vHeaderRow, 1, 1, 21).getDisplayValues()[0];
  var benchmarksStats = sheet.getRange(vHeaderRow + 1, 1, 5, 21).getDisplayValues();

  var objBenchmarksStats = {};
  benchmarksStats.forEach(r => {
    if (r[0].toString() != "") {
      objBenchmarksStats[r[0]] = r;
    }
  });

  return { benchmarksHeaders, benchmarksStats, objBenchmarksStats };
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

function right_(sData, vLen) {
  return sData.substring(sData.length - vLen, sData.length);
}

function left_(sData, vLen) {
  return sData.toString().substring(0, vLen);
}

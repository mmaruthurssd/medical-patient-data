
function extractRecent() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("External Email List");
  var allData = sheet.getDataRange().getValues();
  allData.shift();

  var allSuppliers = allData.filter(r => r[1] == "Supplier");
  var allSuppliersEmails = allSuppliers.map(r => r[0].toString());

  var maxThreads = 500;
  var vStartIndex = 0;

  while (true) {
    var excludeDomains = ["@sendfax.to", "@ssdspc.com"];

    // Build query string
    var query = "after:2025/08/15 before:2025/08/18 in:inbox " + excludeDomains.map(d => "-from:" + d).join(" ");

    var threads = GmailApp.search(query, vStartIndex, maxThreads); // get up to 500 threads at a time

    threads.forEach(function (thread) {
      var messages = thread.getMessages();
      var sFrom = messages[0].getFrom(); // full sender string: "Name <email@domain.com>"

      // Extract just the email using regex
      var match = sFrom.match(/<([^>]+)>/);
      var email = match ? match[1] : sFrom; // if no <>, take whole string

      if (allDataMap.includes(email) || email.indexOf("@ssdspc.com") != -1) return;
    });
    vStartIndex += threads.length;
  }

}

function extractAllSenders() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("External Email List");
  var allData = sheet.getDataRange().getValues();
  var allDataMap = allData.map(r => r[0].toString());

  var maxThreads = 500;
  var vStartIndex = 0;

  while (true) {
    var excludeDomains = ["@sendfax.to", "@ssdspc.com"];

    // Build query string
    var query = "after:2025/08/15 before:2025/08/18 in:inbox " + excludeDomains.map(d => "-from:" + d).join(" ");

    // var query = "after:2025/08/17 before:2025/08/18";  // 🔎 optional: limit search (e.g. last year)
    var threads = GmailApp.search(query, vStartIndex, maxThreads); // get up to 500 threads at a time

    console.log(threads.length);

    if (threads.length == 0) break;
    var senders = {};

    threads.forEach(function (thread) {
      var messages = thread.getMessages();
      var sFrom = messages[0].getFrom(); // full sender string: "Name <email@domain.com>"

      // Extract just the email using regex
      var match = sFrom.match(/<([^>]+)>/);
      var email = match ? match[1] : sFrom; // if no <>, take whole string

      if (allDataMap.includes(email) || email.indexOf("@ssdspc.com") != -1) return;

      allDataMap.push(email);
      senders[email] = true; // store unique
    });
    vStartIndex += threads.length;
  }

  // Convert to list
  var uniqueSenders = Object.keys(senders).map(r => [r]);

  sheet.getRange(sheet.getLastRow() + 1, 1, uniqueSenders.length, uniqueSenders[0].length).setValues(uniqueSenders);

  Logger.log("Found " + uniqueSenders.length + " unique senders.");
}

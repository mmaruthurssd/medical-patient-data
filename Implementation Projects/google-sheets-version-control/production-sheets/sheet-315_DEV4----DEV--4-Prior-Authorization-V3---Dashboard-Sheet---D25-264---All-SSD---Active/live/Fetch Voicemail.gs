function fetchVoiceMails() {
  SpreadsheetApp.flush();
  Utilities.sleep(1000);

  var sourceSS = SpreadsheetApp.openById("1Ej8wzt6U6C-x5Ex9bv0ZRBZs5RFff0Xpi3Zak4r8u4E");
  var sourceSheet = sourceSS.getSheetByName("VoiceMail");

  var rows = sourceSheet.getLastRow();
  var cols = sourceSheet.getLastColumn();
  if (rows < 2) return; // nothing to copy

  var allSourceData = sourceSheet.getRange(1, 1, rows, cols).getDisplayValues();
  var sourceHeaders = allSourceData.shift();

  var sourceHeadingsObj = {};
  for (var i = 0; i < sourceHeaders.length; i++) {
    sourceHeadingsObj[sourceHeaders[i]] = i;
  }

  var destSS = SpreadsheetApp.getActiveSpreadsheet();
  var destSheet = destSS.getSheetByName("PA Voicemails");
  var destHeaders = destSheet.getRange(1, 1, 1, destSheet.getLastColumn()).getDisplayValues()[0];

  var destHeadingsObj = {};
  for (var j = 0; j < destHeaders.length; j++) {
    destHeadingsObj[destHeaders[j]] = j;
  }

  var destLinks = destSheet
    .getRange(1, destHeadingsObj["Audio Link"] + 1, destSheet.getLastRow(), 1)
    .getDisplayValues()
    .map(function (r) { return r[0]; });

  var newData = [];

  for (var r = 0; r < allSourceData.length; r++) {
    var row = allSourceData[r];

    var linkIdIndex = destLinks.indexOf(row[sourceHeadingsObj["Audio Link"]]);
    var team = row[sourceHeadingsObj["Team Assigned"]];

    if (linkIdIndex === -1 && (team === "Prior Authorization" || team === "Biologic Coordinator")) {
      // build a row in destination order
      var rowData = [];
      for (var k = 0; k < destHeaders.length; k++) rowData.push("");

      for (var key in destHeadingsObj) {
        if (Object.prototype.hasOwnProperty.call(destHeadingsObj, key)) {
          var sIdx = sourceHeadingsObj[key];
          if (sIdx !== undefined) {
            rowData[destHeadingsObj[key]] = row[sIdx];
          }
        }
      }
      newData.push(rowData);
    }
  }

  if (newData.length > 0) {
    var start = destSheet.getLastRow() + 1;
    destSheet.getRange(start, 1, newData.length, newData[0].length).setValues(newData);

    var dataRows = destSheet.getLastRow() - 1;
    if (dataRows > 0) {
      destSheet
        .getRange(2, 1, dataRows, destSheet.getLastColumn())
        .sort([{ column: 1, ascending: false }, { column: 2, ascending: false }]);
    }
  }
}

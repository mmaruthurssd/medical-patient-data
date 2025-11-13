const COL_APPNOTES = {
  MonthYear: 2,
  DATE: 3,
  Note_Auth: 4,
  MRN: 6,
  Add_Ammended: 12
};

function update_Checkboxes_and_grouping() {
  SpreadsheetApp.flush();

  const sheetAppNotes = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('APP Notes');
  const sheetAmmended = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Ammended - APP Notes");

  if (!sheetAppNotes || !sheetAmmended) return;

  var allData = sheetAppNotes.getDataRange().getDisplayValues();

  //>>
  var allDataColumn_Ammended = allData.map(r => [r[COL_APPNOTES.Add_Ammended - 1]]);

  var allDataAmmended = sheetAmmended.getDataRange().getValues();
  var allDataAmmended_map = allDataAmmended.map(r => r[0].toString());

  for (var rr = 1; rr < allData.length; rr++) {
    var rowData = allData[rr];

    var date = rowData[COL_APPNOTES.DATE - 1];
    var note_auth = rowData[COL_APPNOTES.Note_Auth - 1];
    var mrn = rowData[COL_APPNOTES.MRN - 1];

    var sID = `${date}${note_auth}${mrn}`;

    var bAmmended = allDataAmmended_map.includes(sID);
    allDataColumn_Ammended[rr][0] = bAmmended;
  }

  sheetAppNotes.getRange(1, COL_APPNOTES.Add_Ammended, allDataColumn_Ammended.length, 1).setValues(allDataColumn_Ammended);
  //<<

  var allExistingGroup_Rows = [];
  var prop = getProperty_("groupRows");
  if (prop) allExistingGroup_Rows = JSON.parse(prop);

  allExistingGroup_Rows.forEach(rr => {
    try {
      sheetAppNotes.getRowGroup(rr, 1).remove();
    } catch (err) { console.log(err.toString()); }
  });

  var allNewGourp_Rows = [];

  //>>
  var allDataMapForGrouping_MonthYear = allData.map(r => `${r[COL_APPNOTES.MonthYear - 1]}`);
  allDataMapForGrouping_MonthYear.shift();
  var unique_allDataMapForGrouping_MonthYear = getUniques_(allDataMapForGrouping_MonthYear);

  unique_allDataMapForGrouping_MonthYear.forEach(r => {
    var sID = r;
    var vStartRow = allDataMapForGrouping_MonthYear.indexOf(sID) + 2 + 1;
    var vEndRow = allDataMapForGrouping_MonthYear.lastIndexOf(sID) + 2;


    if (vEndRow - vStartRow > 1) {
      sheetAppNotes.getRange(`A${vStartRow}:A${vEndRow}`).shiftRowGroupDepth(1);
      allNewGourp_Rows.push(vStartRow);
    }
  });
  //<<

  //>>
  var vStartRow = null;
  var vEndRow = null;
  var sLastNote_Auth = "";

  for (var rr = 1; rr < allData.length; rr++) {
    var rowData = allData[rr];
    var sNote_Auth = rowData[COL_APPNOTES.Note_Auth - 1];

    if (sLastNote_Auth == sNote_Auth) continue;

    if (!vStartRow) {
      vStartRow = rr + 1 + 1;
      sLastNote_Auth = sNote_Auth;
      continue;
    }

    if (!vEndRow) {
      vEndRow = rr;
    }

    if ([vStartRow, vEndRow].includes(null)) continue;

    if (vEndRow - vStartRow > 1) {
      sheetAppNotes.getRange(`A${vStartRow}:A${vEndRow}`).shiftRowGroupDepth(1);
      allNewGourp_Rows.push(vStartRow);
    }

    sLastNote_Auth = sNote_Auth;
    vStartRow = rr + 1 + 1;
    vEndRow = null;
  }
  //<<

  setProperty_("groupRows", JSON.stringify(allNewGourp_Rows));
}

function removeAllGroupsFromSheet_(sheet) {
  let lastRow = sheet.getDataRange().getLastRow();

  for (let row = 1; row < lastRow; row++) {
    let depth = sheet.getRowGroupDepth(row);
    if (depth < 1) continue;
    sheet.getRowGroup(row, depth).remove();
  }
}

function handleOnEdit_APPNotes_(e) {
  var sourceSheet = e.source.getActiveSheet();
  if (sourceSheet.getName() !== 'APP Notes') return;

  var range = e.range;
  var column = range.getColumn();
  var row = range.getRow();
  var value = range.getValue();

  if (column != COL_APPNOTES.Add_Ammended) return;
  if (value != true) return;

  var rowData = sourceSheet.getRange(row, 1, 1, sourceSheet.getLastColumn()).getDisplayValues()[0];

  var date = rowData[COL_APPNOTES.DATE - 1];
  var note_auth = rowData[COL_APPNOTES.Note_Auth - 1];
  var mrn = rowData[COL_APPNOTES.MRN - 1];

  var sID = `${date}${note_auth}${mrn}`;

  var destnSheet = e.source.getSheetByName("Ammended - APP Notes");
  destnSheet.appendRow([sID, date, note_auth, mrn]);
}

// const COL_BiologicPts = {
//   DATE: 8,
//   APP: 6,
//   MRN: 2,
//   Add_Ammended: 12
// };

// function handleOnEdit_BiologicPts_(e) {
//   var sourceSheet = e.source.getActiveSheet();
//   if (sourceSheet.getName() !== 'Biologic Pts') return;

//   var range = e.range;
//   var column = range.getColumn();
//   var row = range.getRow();
//   var value = range.getValue();

//   if (column != COL_BiologicPts.Add_Ammended) return;
//   if (value != true) return;

//   var rowData = sourceSheet.getRange(row, 1, 1, sourceSheet.getLastColumn()).getDisplayValues()[0];

//   var date = rowData[COL_BiologicPts.DATE - 1];
//   var app = rowData[COL_BiologicPts.APP - 1];
//   var mrn = rowData[COL_BiologicPts.MRN - 1];

//   var sID = `${date}${app}${mrn}`;

//   var destnSheet = e.source.getSheetByName("Ammended - Biologic Pts");
//   destnSheet.appendRow([sID, date, app, mrn]);
// }

function getUniques_(AllData) {
  var newData = [];

  for (var rr = 0; rr < AllData.length; rr++) {
    var data = AllData[rr];

    if (newData.indexOf(data) == -1 && data.toString().trim() != "") {
      newData.push(data);
    }
  }

  return newData;
}

function delProperty_(propname) {
  PropertiesService.getScriptProperties().deleteProperty(propname);
}

function getProperty_(propname) {
  return PropertiesService.getScriptProperties().getProperty(propname);
}

function getAllProperties_() {
  return PropertiesService.getScriptProperties().getProperties();
}

function setProperty_(propname, value) {
  PropertiesService.getScriptProperties().setProperty(propname, value);
}
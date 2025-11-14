//Schedule_Data_MA_TABLE
//Schedule_Data_MA_GROUP



//Schedule_Data_FD_TABLE
//Schedule_Data_FD_GROUP


//Schedule_Data_Admin_TABLE
//Schedule_Data_Admin_GROUP



function onEditInstall(e) {

  //return

  let ss = e.source;
  let sheet = ss.getActiveSheet();

  let range = e.range;
  let row = range.getRow();
  let col = range.getColumn();

  let value = e.value;


  if (sheet.getSheetId() == 1257380749) {
    let group_col = sheet.getRange("Schedule_Data_MA_GROUP").getColumn();

    if (row > 1 && col == group_col && value != "" && value != null) {
      processAndSetRow(ss, sheet, row, col, value, "Schedule_Data_MA_TABLE")
    }

  } else if (sheet.getSheetId() == 1204183481) {
    let group_col = sheet.getRange("Schedule_Data_FD_GROUP").getColumn();

    if (row > 1 && col == group_col && value != "" && value != null) {
      processAndSetRow(ss, sheet, row, col, value, "Schedule_Data_FD_TABLE")
    }

  } else if (sheet.getSheetId() == 1085764997) {
    let group_col = sheet.getRange("Schedule_Data_Admin_GROUP").getColumn();

    if (row > 1 && col == group_col && value != "" && value != null) {
      processAndSetRow(ss, sheet, row, col, value, "Schedule_Data_Admin_TABLE")
    }

  } 
  // else if (sheet.getSheetId() == 932476357) {

  //   if (row >= 3 && row <= 14 && (value == true || value == "TRUE") && (col == 3 || col == 4)) {
  //     syncMACalendar(ss, sheet, row, col)

  //   } else if (row >= 18 && row <= 29 && (value == true || value == "TRUE") && (col == 3 || col == 4)) {
  //     syncFDCalendar(ss, sheet, row, col)

  //   } else if (row >= 33 && row <= 44 && (value == true || value == "TRUE") && (col == 3 || col == 4)) {
  //     syncADMINCalendar(ss, sheet, row, col)

  //   } else if (row >= 48 && row <= 59 && (value == true || value == "TRUE") && (col == 3 || col == 4)) {
  //     syncAllCalendars(ss, sheet, row, col)

  //   }

  // }


}






function processAndSetRow(ss, sheet, row, col, value, tableRange) {
  let tableSheet = ss.getSheetByName("Group_Tables")
  let maTable = tableSheet.getRange(tableRange).getValues();

  let maGroups = maTable.map(row => row[0]);
  let groupIndex = maGroups.indexOf(value);

  if (groupIndex > -1) {
    let valueRow = maTable[groupIndex]
    sheet.getRange(row, col, 1, valueRow.length).setValues([valueRow])
  }
}






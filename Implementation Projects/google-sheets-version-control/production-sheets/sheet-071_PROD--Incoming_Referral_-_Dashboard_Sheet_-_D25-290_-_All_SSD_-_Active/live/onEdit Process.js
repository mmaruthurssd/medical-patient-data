


//SCHE_1_ATTEMPT
//SCHE_2_ATTEMPT
//SCHE_3_ATTEMPT




//ATTEMPT_1_COL
//ATTEMPT_2_COL
//ATTEMPT_3_COL


function onEdit(e) {
  //return
  let ss = e.source;
  let sheet = ss.getActiveSheet()
  let range = e.range;
  let row = range.getRow();
  let col = range.getColumn();

  let value = e.value;

  //Logger.log(value)

  if (sheet.getName() == INCOMING_REFERRAL_SHEET) {
    if (col == 16) {
      if (value != "" && value != null) {
        let plistSheet = ss.getSheetByName("Unique Physicians");
        let itemList = plistSheet.getRange(1, 1, plistSheet.getLastRow(), 2).getValues().filter(row => row[0] == value).map(r => r[1])

        let cell = sheet.getRange(row, col + 1)
        let rule = SpreadsheetApp.newDataValidation()
          .requireValueInList(itemList)
          .setAllowInvalid(true)
          .build();

        // Apply the data validation rule to the cell
        cell.setDataValidation(rule);
      } else {
        let cell = sheet.getRange(row, col + 1)
        cell.setDataValidation(null);
      }
    }
  }


  onEditSort(e)

  return



  if (sheet.getName() == SCHE_ATTEMPTS_SHEET) {

    let attempt1Col = sheet.getRange("ATTEMPT_1_COL").getColumn();
    let attempt2Col = sheet.getRange("ATTEMPT_2_COL").getColumn();
    let attempt3Col = sheet.getRange("ATTEMPT_3_COL").getColumn();


    if (col == attempt1Col && value != "") {

      let rowData = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0]
      sheet.deleteRows(row, 1)


      let attempt1Row = sheet.getRange("SCHE_1_ATTEMPT").getRow();

      sheet.insertRows(attempt1Row + 1, 1);

      sheet.getRange(attempt1Row + 1, 1, 1, rowData.length).setValues([rowData])


    } else if (col == attempt2Col && value != "") {
      let rowData = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0]
      sheet.deleteRows(row, 1)


      let attempt2Row = sheet.getRange("SCHE_2_ATTEMPT").getRow();

      sheet.insertRows(attempt2Row + 1, 1);

      sheet.getRange(attempt2Row + 1, 1, 1, rowData.length).setValues([rowData])

    } else if (col == attempt3Col && value != "") {
      let rowData = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0]
      sheet.deleteRows(row, 1)


      let attempt3Row = sheet.getRange("SCHE_3_ATTEMPT").getRow();

      sheet.insertRows(attempt3Row + 1, 1);

      sheet.getRange(attempt3Row + 1, 1, 1, rowData.length).setValues([rowData])

    }


  }



}





//SCHE_NO_ATTEMPTS
function processAttemptsMain(ss, masterSheet, masterIds) {
  //let ss = SpreadsheetApp.getActiveSpreadsheet()
  let sheet = ss.getSheetByName(SCHE_ATTEMPTS_SHEET)

  // let noAttemptsData = sheet.getRange("SCHE_NO_ATTEMPTS").getValues()
  // let noAttemptsStartRow = sheet.getRange("SCHE_NO_ATTEMPTS").getRow()

  // let attempt1Col = sheet.getRange("ATTEMPT_1_COL").getColumn();
  // let firstAttempt = [];
  // for (var i = noAttemptsData.length - 1; i > 0; i--) {
  //   try {
  //     if (noAttemptsData[i][attempt1Col - 1] != "" && noAttemptsData[i][attempt1Col - 1] != null) {
  //       firstAttempt.push(noAttemptsData[i])
  //       sheet.deleteRow(i + noAttemptsStartRow)
  //     }
  //   } catch (err) { }
  // }

  // let firstAttemptStartRow = sheet.getRange("SCHE_1_ATTEMPT").getRow()

  // if (firstAttempt.length > 0) {
  //   sheet.insertRows(firstAttemptStartRow + 1, firstAttempt.length);
  //   sheet.getRange(firstAttemptStartRow + 1, 1, firstAttempt.length, firstAttempt[0].length).setValues(firstAttempt)
  // }


  processAttempts_(sheet, "SCHE_NO_ATTEMPTS", "SCHE_1_ATTEMPT", "ATTEMPT_1_COL")

  processAttempts_(sheet, "SCHE_1_ATTEMPT", "SCHE_2_ATTEMPT", "ATTEMPT_2_COL")

  processAttempts_(sheet, "SCHE_2_ATTEMPT", "SCHE_3_ATTEMPT", "ATTEMPT_3_COL")



  let attempt1Col = sheet.getRange("ATTEMPT_1_COL").getColumn();
  let attempt2Col = sheet.getRange("ATTEMPT_2_COL").getColumn();
  let attempt3Col = sheet.getRange("ATTEMPT_3_COL").getColumn();

  let attemptsAllData = sheet.getRange(3, 1, sheet.getLastRow() - 2, sheet.getLastColumn()).getValues();
  let dataForMaster = [];
  for (var i = 0; i < attemptsAllData.length; i++) {

    if (attemptsAllData[i][0] == "" || attemptsAllData[i][0] == null) continue

    if (attemptsAllData[i][attempt3Col - 1] != "" && attemptsAllData[i][attempt3Col - 1] != null) {
      dataForMaster.push([attemptsAllData[i][0], "3rd Attempt"])

    } else if (attemptsAllData[i][attempt2Col - 1] != "" && attemptsAllData[i][attempt2Col - 1] != null) {
      dataForMaster.push([attemptsAllData[i][0], "2nd Attempt"])

    } else if (attemptsAllData[i][attempt1Col - 1] != "" && attemptsAllData[i][attempt1Col - 1] != null) {
      dataForMaster.push([attemptsAllData[i][0], "1st Attempt"])

    } else {
      dataForMaster.push([attemptsAllData[i][0], "No Attempt"])

    }
  }

  if (dataForMaster.length > 0) {
    updateDataInMasterIncomming(masterSheet, masterIds, dataForMaster, "From Scheduling Attempts (Unschedule)")
  }

}









function processAttempts_(sheet, sourceAttemptsRange, desstinationAttemptsRange, colRange) {
  let noAttemptsData = sheet.getRange(sourceAttemptsRange).getValues()
  let noAttemptsStartRow = sheet.getRange(sourceAttemptsRange).getRow()

  let attempt1Col = sheet.getRange(colRange).getColumn();
  let firstAttempt = [];
  for (var i = noAttemptsData.length - 1; i > 0; i--) {
    try {
      if (noAttemptsData[i][attempt1Col - 1] != "" && noAttemptsData[i][attempt1Col - 1] != null) {
        firstAttempt.push(noAttemptsData[i])
        sheet.deleteRow(i + noAttemptsStartRow)
      }
    } catch (err) { }
  }

  let firstAttemptStartRow = sheet.getRange(desstinationAttemptsRange).getRow()

  if (firstAttempt.length > 0) {
    sheet.insertRows(firstAttemptStartRow + 1, firstAttempt.length);
    sheet.getRange(firstAttemptStartRow + 1, 1, firstAttempt.length, firstAttempt[0].length).setValues(firstAttempt)
  }

}

















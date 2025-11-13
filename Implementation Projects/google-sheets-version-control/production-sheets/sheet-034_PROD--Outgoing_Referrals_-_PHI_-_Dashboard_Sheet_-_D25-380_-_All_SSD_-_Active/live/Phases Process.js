





const THIS_SHEET = {
  MASTER_REF: "Master Outgoing Referral List (Main)",

  UNSENT: "Unsent Referrals",
  SENT_AW_ACC: "Sent - Awaiting Acceptance",
  SCH_AW_NOTES: "Scheduled - Awaiting Notes",
  COM_NOTES_RECV: "Complete - Notes Received",
  INCOM_CLOSED: "Incomplete - Closed",

  NEEDS_REVIEW: "Needs Review",

  ID_TRACKER: "ID_Tracker",


  NORMA: "Practice / Physician Normalization",

}






function onOpen() {
  const ui = SpreadsheetApp.getUi();
  let menu = ui.createMenu("Custom");
  menu.addItem("Process Phases", "processPhasesMainA").addToUi()
}



function processPhasesMainA() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  //const masterAllSheet = ss.getSheetByName(THIS_SHEET.MASTER_ALL_DATA)
  //const masterAllSheet = ss.getSheetByName(THIS_SHEET.MASTER_ALL_DATA)


  const idTrackerSheet = ss.getSheetByName(THIS_SHEET.ID_TRACKER)
  let lastId = idTrackerSheet.getRange("A2").getValue();

  const masterRefSheet = ss.getSheetByName(THIS_SHEET.MASTER_REF)
  let allMasterRefIDs = masterRefSheet.getRange(1, 3, masterRefSheet.getLastRow(), 1).getDisplayValues();
  let allMasterRefName = masterRefSheet.getRange(1, 5, masterRefSheet.getLastRow(), 1).getDisplayValues();

  for (var i = 0; i < allMasterRefIDs.length; i++) {
    if (allMasterRefIDs[i][0] == "" && allMasterRefName[i][0] != "") {
      lastId++;
      allMasterRefIDs[i][0] = "OR-" + lastId
    }
  };

  // let destSheetTwo = ss.getSheetByName(THIS_SHEET.NORMA);
  // let destHeadings2 = destSheetTwo.getRange(1, 1, 1, destSheet.getLastColumn()).getDisplayValues()[0].map(r => r.toString().toLowerCase().trim());
  // let rowData2 = new Array(destHeadings2.length).fill("")





  idTrackerSheet.getRange("A2").setValue(lastId)
  masterRefSheet.getRange(1, 3, allMasterRefIDs.length, 1).setValues(allMasterRefIDs)




  SpreadsheetApp.flush()





  transferDataBasedOnPhase_(ss, masterRefSheet, masterRefSheet)



  const unsentSheet = ss.getSheetByName(THIS_SHEET.UNSENT);

  //<>//
  const normaSheet = ss.getSheetByName(THIS_SHEET.NORMA);

  let normaIds = normaSheet.getRange(1, 1, normaSheet.getLastRow(), 1).getDisplayValues().map(r => r[0])
  const allUnsentData = masterRefSheet.getRange(1, 1, masterRefSheet.getLastRow(), masterRefSheet.getLastColumn()).getDisplayValues()
  let newNormaData = []
  for (var i = 3; i < allUnsentData.length; i++) {
    let tempIndexInNorma = normaIds.indexOf(allUnsentData[i][2]);
    if (tempIndexInNorma == -1 && allUnsentData[i][2] != "") {
      newNormaData.push([allUnsentData[i][2], allUnsentData[i][3], allUnsentData[i][4], allUnsentData[i][8], allUnsentData[i][15], allUnsentData[i][13], allUnsentData[i][20], allUnsentData[i][16], allUnsentData[i][17]])
    }
  }
  if (newNormaData.length > 0) {
    normaSheet.getRange(normaSheet.getLastRow() + 1, 1, newNormaData.length, newNormaData[0].length).setValues(newNormaData)
    SpreadsheetApp.flush()
    normaSheet.getRange(2, 1, normaSheet.getLastRow() - 1, normaSheet.getLastColumn()).sort({ column: 2, ascending: false })
    SpreadsheetApp.flush()
  }
  //const allNormaData = normaSheet.getRange(1, 1, normaSheet.getLastRow(), normaSheet.getLastColumn()).getDisplayValues()
  //normaIds = allNormaData.map(r => r[0])
  //<>//


  transferDataBasedOnPhase_(ss, unsentSheet, masterRefSheet);

  const sentAwAccSheet = ss.getSheetByName(THIS_SHEET.SENT_AW_ACC);
  transferDataBasedOnPhase_(ss, sentAwAccSheet, masterRefSheet)

  const schAwNotesSheet = ss.getSheetByName(THIS_SHEET.SCH_AW_NOTES);
  transferDataBasedOnPhase_(ss, schAwNotesSheet, masterRefSheet)


  const comNotesRecvSheet = ss.getSheetByName(THIS_SHEET.COM_NOTES_RECV);
  transferDataBasedOnPhase_(ss, comNotesRecvSheet, masterRefSheet)


  const needsReviewSheet = ss.getSheetByName(THIS_SHEET.NEEDS_REVIEW);
  transferDataBasedOnPhase_(ss, needsReviewSheet, masterRefSheet)



  try {
    unsentSheet.getRange(3, 1, unsentSheet.getLastRow() - 2, unsentSheet.getLastColumn()).sort({ column: 2, ascending: false });
  } catch (err) { }

  try {
    sentAwAccSheet.getRange(3, 1, sentAwAccSheet.getLastRow() - 2, sentAwAccSheet.getLastColumn()).sort({ column: 2, ascending: false });
  } catch (err) { }

  try {
    schAwNotesSheet.getRange(3, 1, schAwNotesSheet.getLastRow() - 2, schAwNotesSheet.getLastColumn()).sort({ column: 2, ascending: false });
  } catch (err) { }

  try {
    comNotesRecvSheet.getRange(3, 1, comNotesRecvSheet.getLastRow() - 2, comNotesRecvSheet.getLastColumn()).sort({ column: 2, ascending: false });
  } catch (err) { }

  try {
    needsReviewSheet.getRange(3, 1, needsReviewSheet.getLastRow() - 2, needsReviewSheet.getLastColumn()).sort({ column: 2, ascending: false });
  } catch (err) { }

  masterRefSheet.getRange("A2:A").clearContent()
  masterRefSheet.getRange("G3:H").clearContent()
}





function transferDataBasedOnPhase_(ss, sourceSheet, masterAllSheet) {

  const masterHObj = getHeadersObj_(masterAllSheet)
  const masterData = masterAllSheet.getRange(1, 1, masterAllSheet.getLastRow(), masterAllSheet.getLastColumn()).getDisplayValues()
  let masterAllIds = masterData.map(r => r[masterHObj.headersObj["ID"]])



  const unsentSheet = ss.getSheetByName(THIS_SHEET.UNSENT);
  const unsentHObj = getHeadersObj_(unsentSheet)
  const unsentIds = unsentSheet.getRange(1, unsentHObj.headersObj["ID"] + 1, unsentSheet.getLastRow(), 1).getDisplayValues().map(r => r[0])

  const sentAwNotesSheet = ss.getSheetByName(THIS_SHEET.SENT_AW_ACC);
  const sentAwNotesHObj = getHeadersObj_(sentAwNotesSheet)
  const sentAwNotesIds = sentAwNotesSheet.getRange(1, sentAwNotesHObj.headersObj["ID"] + 1, sentAwNotesSheet.getLastRow(), 1).getDisplayValues().map(r => r[0])

  const schAwNotesSheet = ss.getSheetByName(THIS_SHEET.SCH_AW_NOTES);
  const schAwNotesHObj = getHeadersObj_(schAwNotesSheet)
  const schAwNotesds = schAwNotesSheet.getRange(1, schAwNotesHObj.headersObj["ID"] + 1, schAwNotesSheet.getLastRow(), 1).getDisplayValues().map(r => r[0])


  const comNotesRecvSheet = ss.getSheetByName(THIS_SHEET.COM_NOTES_RECV);
  const comNotesRecvHObj = getHeadersObj_(comNotesRecvSheet)
  const comNotesRecvIds = comNotesRecvSheet.getRange(1, comNotesRecvHObj.headersObj["ID"] + 1, comNotesRecvSheet.getLastRow(), 1).getDisplayValues().map(r => r[0])

  //>>
  const inComClosedSheet = ss.getSheetByName(THIS_SHEET.INCOM_CLOSED);
  const inComClosedHObj = getHeadersObj_(inComClosedSheet)
  const inComClosedIds = inComClosedSheet.getRange(1, inComClosedHObj.headersObj["ID"] + 1, inComClosedSheet.getLastRow(), 1).getDisplayValues().map(r => r[0])
  //<<


  const needsReviewSheet = ss.getSheetByName(THIS_SHEET.NEEDS_REVIEW);
  const needsReviewHObj = getHeadersObj_(needsReviewSheet)
  const needsReviewIds = needsReviewSheet.getRange(1, needsReviewHObj.headersObj["ID"] + 1, needsReviewSheet.getLastRow(), 1).getDisplayValues().map(r => r[0])



  const sourceData = sourceSheet.getRange(2, 1, sourceSheet.getLastRow() - 1, sourceSheet.getLastColumn()).getDisplayValues();
  const sourceHeaders = sourceData.splice(0, 1)[0];
  let sourceHeadersObj = {};
  for (var i = 0; i < sourceHeaders.length; i++) {
    sourceHeadersObj[sourceHeaders[i]] = i
  }

  if (sourceData.length == 0) return
  //const sourceRichData = sourceSheet.getRange(3, sourceHeadersObj["Unique Patient Folder"] + 1, sourceSheet.getLastRow() - 1, 2).getRichTextValues();

  const sourceSheetName = sourceSheet.getName()

  //>>
  if (sourceSheetName == THIS_SHEET.INCOM_CLOSED) return
  //<<


  for (var i = sourceData.length - 1; i >= 0; i--) {

    if (sourceData[i][sourceHeadersObj["ID"]] == "" || sourceData[i][sourceHeadersObj["Phase"]] == "" || sourceData[i][sourceHeadersObj["Status"]] == "Complete") continue


    // if (sourceSheetName != THIS_SHEET.MASTER_REF) {
    //   let normaIdIndex = normaIds.indexOf(sourceData[i][sourceHeadersObj["ID"]]);
    //   if (normaIdIndex > -1) {
    //     if (allNormaData[normaIdIndex][9] != "") {
    //       sourceData[i][sourceHeadersObj["Practice Referring To (Normalized)"]] = allNormaData[normaIdIndex][9]
    //     }
    //     if (allNormaData[normaIdIndex][10] != "") {
    //       sourceData[i][sourceHeadersObj["Physician Referring To (Normalized)"]] = allNormaData[normaIdIndex][10]
    //     }
    //     if (allNormaData[normaIdIndex][11] != "") {
    //       sourceData[i][sourceHeadersObj["SSD Clinic"]] = allNormaData[normaIdIndex][11]
    //     }
    //   }
    // }

    if (sourceData[i][sourceHeadersObj["Phase"]].includes("Unsent") && sourceSheetName != THIS_SHEET.UNSENT) {
      masterAllIds = processCurrentPhaseRow_(sourceSheet, sourceHeadersObj, sourceData[i], unsentSheet, unsentHObj, i, masterAllSheet, masterData, masterAllIds, masterHObj, sourceSheetName, unsentIds, "Unsent")
    }


    if (sourceData[i][sourceHeadersObj["Phase"]].includes("Sent - Awaiting Acceptance") && sourceSheetName != THIS_SHEET.SENT_AW_ACC) {
      masterAllIds = processCurrentPhaseRow_(sourceSheet, sourceHeadersObj, sourceData[i], sentAwNotesSheet, sentAwNotesHObj, i, masterAllSheet, masterData, masterAllIds, masterHObj, sourceSheetName, sentAwNotesIds, "Sent - Awaiting Acceptance")
    }


    if (sourceData[i][sourceHeadersObj["Phase"]].includes("Scheduled - Awaiting Notes") && sourceSheetName != THIS_SHEET.SCH_AW_NOTES) {
      masterAllIds = processCurrentPhaseRow_(sourceSheet, sourceHeadersObj, sourceData[i], schAwNotesSheet, schAwNotesHObj, i, masterAllSheet, masterData, masterAllIds, masterHObj, sourceSheetName, schAwNotesds, "Scheduled - Awaiting Notes")
    }


    if (sourceData[i][sourceHeadersObj["Phase"]].includes("Complete - Notes Received") && sourceSheetName != THIS_SHEET.COM_NOTES_RECV) {
      masterAllIds = processCurrentPhaseRow_(sourceSheet, sourceHeadersObj, sourceData[i], comNotesRecvSheet, comNotesRecvHObj, i, masterAllSheet, masterData, masterAllIds, masterHObj, sourceSheetName, comNotesRecvIds, "Complete - Notes Received")
    }


    //>>
    if (sourceData[i][sourceHeadersObj["Phase"]].includes("Patient Declined Referral") && sourceSheetName != THIS_SHEET.INCOM_CLOSED) {
      masterAllIds = processCurrentPhaseRow_(sourceSheet, sourceHeadersObj, sourceData[i], inComClosedSheet, inComClosedHObj, i, masterAllSheet, masterData, masterAllIds, masterHObj, sourceSheetName, inComClosedIds, "Patient Declined Referral")
    }
    //<<



    if (sourceData[i][sourceHeadersObj["Phase"]].includes("Needs Review") && sourceSheetName != THIS_SHEET.NEEDS_REVIEW) {
      masterAllIds = processCurrentPhaseRow_(sourceSheet, sourceHeadersObj, sourceData[i], needsReviewSheet, needsReviewHObj, i, masterAllSheet, masterData, masterAllIds, masterHObj, sourceSheetName, needsReviewIds, "Needs Review")
    }


  }



}





function processCurrentPhaseRow_(sourceSheet, sourceHeadersObj, sourceDataRow, destSheet, HObj, i, masterAllSheet, masterData, masterAllIds, masterHObj, sourceSheetName, destIds, phase) {


  let indexInMaster = masterAllIds.indexOf(sourceDataRow[sourceHeadersObj["ID"]]);

  if (indexInMaster > -1) {

    for (const key in masterHObj.headersObj) {
      if (sourceHeadersObj[key] || sourceHeadersObj[key] === 0) {
        masterData[indexInMaster][masterHObj.headersObj[key]] = sourceDataRow[sourceHeadersObj[key]]
      }
    }
    masterAllSheet.getRange(indexInMaster + 1, 1, 1, masterData[indexInMaster].length).setValues([masterData[indexInMaster]])


    let indexInDestSheet = destIds.indexOf(masterData[indexInMaster][masterHObj.headersObj["ID"]])
    if (indexInDestSheet == -1) {
      let destRowData = new Array(HObj.headers.length).fill("")
      for (const key in HObj.headersObj) {
        if (masterHObj.headersObj[key] || masterHObj.headersObj[key] === 0) {
          destRowData[HObj.headersObj[key]] = masterData[indexInMaster][masterHObj.headersObj[key]]
        }
      }

      destRowData[HObj.headersObj["Phase"]] = phase

      //Logger.log("Yes")

      if (destSheet.getSheetName() != THIS_SHEET.MASTER_REF && destSheet.getSheetName() != THIS_SHEET.UNSENT) {
        destRowData[HObj.headersObj["Practice Referring To (Normalized)"]] = ""
        destRowData[HObj.headersObj["Physician Referring To (Normalized)"]] = ""
      }

      destSheet.appendRow(destRowData);

    }

    if (sourceSheetName != THIS_SHEET.MASTER_REF) {
      sourceSheet.deleteRows(i + 3, 1)
    }

  }


  return masterAllIds
}





function getHeadersObj_(sheet) {
  const headers = sheet.getRange(2, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
  let headersObj = {};
  for (var i = 0; i < headers.length; i++) {
    headersObj[headers[i]] = i
  }
  return { headersObj: headersObj, headers: headers }
}









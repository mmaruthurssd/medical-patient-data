

const INCOMMING_FAX_SS = "1A7y3cwOAjwzZgtzTcr1q41fOtCpVedQTDHGUZKozBMc";

const INCOMMING_FAX_SHEET = "Incoming_Fax_Log (Main)"



const INCOMING_REFERRAL_SHEET = "Master Incoming Referral List";

const SCHE_ATTEMPTS_SHEET = "Scheduling Attempts";


const LETTER_PENDING_SHEET = "Scheduling Letter To Be Sent";

const LETTER_SENT_SHEET = "Letter Sent"


const VISIT_PENDING_SHEET = "Scheduled - Visit Pending";



const VISIT_COMPLETE_SHEET = "Visit Complete"



const UNSCHEDULED_SHEET = "Unable to Schedule";


const NOTES_SENT_SHEET = "Visit Complete - Post-Visit Notes To Be Sent"


const REFERRAL_COMPLETE_SHEET = "Referral Complete"



const DOC_FOLDER_ID = "1-mHwuPqdpPVg6_i5h79iAJEGA2TUxKL5"

//NOSHOW_CANCELLED


function onOpenInstall() {
  var ui = SpreadsheetApp.getUi();
  var menu = ui.createMenu("⚙️Custom")
  menu.addItem("Process Referral", "fetchAndProcessIncomingReferral").addToUi()
}




function setInitialProperty() {
  const scriptProperties = PropertiesService.getScriptProperties();

  scriptProperties.setProperties({ "executeScript": "Yes" })

  Logger.log(scriptProperties)
  const data = scriptProperties.getProperties();
  Logger.log(data)
}



function testScriptProperties() {
  const scriptProperties = PropertiesService.getScriptProperties();

  const data = scriptProperties.getProperties();

  Logger.log(data.executeScript)

  scriptProperties.setProperties({ "executeScript": "Yes" })
}





function fetchAndProcessIncomingReferral() {

  //return

  // }

  // function fetchIncomingReferral1() {



  const scriptProperties = PropertiesService.getScriptProperties();

  const data = scriptProperties.getProperties();


  try {

    if (data.executeScript === "Yes") {

      scriptProperties.setProperties({ "executeScript": "No" })

      let ss = SpreadsheetApp.getActiveSpreadsheet()



      let FaxSS = SpreadsheetApp.openById(INCOMMING_FAX_SS);
      let FaxSheet = FaxSS.getSheetByName(INCOMMING_FAX_SHEET);

      let incommingFaxes = FaxSheet.getRange(2, 1, FaxSheet.getLastRow() - 1, 14).getValues().filter(row => row[13] == "Incoming Referral")



      let sheet = ss.getSheetByName(INCOMING_REFERRAL_SHEET)

      let ids = sheet.getRange(1, 2, sheet.getLastRow(), 1).getValues().map(r => r[0].toString())
      let filterData = []
      incommingFaxes.forEach(row => {
        let indexOfId = ids.indexOf(row[0].toString())

        if (indexOfId == -1) {
          filterData.push([row[0], row[1], row[6]])
          ids.push(row[0].toString())
        }
      })

      if (filterData.length > 0) {
        sheet.getRange(sheet.getLastRow() + 1, 2, filterData.length, filterData[0].length).setValues(filterData)
        sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).sort([{ column: 3, ascending: false }, { column: 2, ascending: false }])
      }



      incomingToAttempts(ss)

      createFolderAndSheet()

      ids = sheet.getRange(1, 2, sheet.getLastRow(), 1).getValues().map(r => r[0].toString())

      attemptsToLetterPendingAndSchedule(ss, sheet, ids)


      visitPendingToAttempts_(ss, sheet, ids)


      processAttemptsMain(ss, sheet, ids)


      letterPendingToLetterSent(ss, sheet, ids)


      visitPendingToVisitComplete(ss, sheet, ids)


      notesToReferralComplete(ss, sheet, ids)

      scriptProperties.setProperties({ "executeScript": "Yes" })

    }


  } catch (err) {

    scriptProperties.setProperties({ "executeScript": "Yes" })
    Logger.log(err)

    throw err

  }



}








function incomingToAttempts(ss) {

  //let ss = SpreadsheetApp.getActiveSpreadsheet()
  let incommingSheet = ss.getSheetByName(INCOMING_REFERRAL_SHEET);
  let time_ = new Date(2024, 3, 21).getTime()


  let allData = incommingSheet.getRange(2, 1, incommingSheet.getLastRow() - 1, incommingSheet.getLastColumn()).getValues().filter(row => row[0] == 0 && row[1] != "" && row[1] != null && row[2].getTime() > time_);



  let incommingHeadings = incommingSheet.getRange(1, 1, 1, incommingSheet.getLastColumn()).getValues()[0].map(h => h.toString().trim());
  let incommingHeadingsObj = {};
  incommingHeadings.forEach((h, i) => {
    incommingHeadingsObj[h] = i
  })



  //SCHE_NO_ATTEMPTS
  let scheAttemptsSheet = ss.getSheetByName(SCHE_ATTEMPTS_SHEET);
  let scheAttemptsHeadings = scheAttemptsSheet.getRange(1, 1, 1, scheAttemptsSheet.getLastColumn()).getValues()[0].map(h => h.toString().trim());
  let scheAttemptsHeadingsObj = {};
  scheAttemptsHeadings.forEach((h, i) => {
    scheAttemptsHeadingsObj[h] = i
  })




  //return



  let newAttemptsData = []
  allData.forEach(row => {
    if (row[10] != "" && row[10] != null && row[11] != "" && row[11] != null && row[12] != "" && row[12] != null && row[13] != "" && row[13] != null && row[14] != "" && row[14] != null && row[15] != "" && row[15] != null && row[16] != "" && row[16] != null && row[17] != "" && row[17] != null && row[18] != "" && row[18] != null) {

      let rowData = new Array(scheAttemptsHeadings.length).fill("")


      for (const key in scheAttemptsHeadingsObj) {
        if (incommingHeadingsObj[key] || incommingHeadingsObj[key] === 0) {
          rowData[scheAttemptsHeadingsObj[key]] = row[incommingHeadingsObj[key]]
        }
      }

      newAttemptsData.push(rowData)

    }
  })


  if (newAttemptsData.length > 0) {
    let scheAttempRow = scheAttemptsSheet.getRange("SCHE_NO_ATTEMPTS").getRow();
    scheAttemptsSheet.insertRows(scheAttempRow + 1, newAttemptsData.length);
    scheAttemptsSheet.getRange(scheAttempRow + 1, 1, newAttemptsData.length, newAttemptsData[0].length).setValues(newAttemptsData)
  }

}





function createFolderAndSheet() {

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Master Incoming Referral List");

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
  let headersObj = {};
  for (var i = 0; i < headers.length; i++) {
    headersObj[headers[i]] = i
  }


  const allData = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getDisplayValues();
  //let allRichData = sheet.getRange(2, headersObj["Sheet"] + 1, sheet.getLastRow() - 1, 2).getRichTextValues();


  const outputFolder = DriveApp.getFolderById("1LX5UgBmXF7ONns2qpzWDzlqDbhqsbfHa")



  let count = 0

  for (var i = 0; i < allData.length; i++) {
    //for (var i = 1; i < 20; i++) {

    try {

      if (allData[i][headersObj["Sheet"]] == "" && allData[i][headersObj["Patient ID"]] != "" && allData[i][headersObj["Patient Name"]] != "" && (allData[i][headersObj["Referral  Status"]] == "Scheduled" || allData[i][headersObj["Referral  Status"]].includes("Attempt"))) {
        count++
        const folderName = allData[i][headersObj["Patient Name"]] + " - Folder - INC-" + allData[i][headersObj["Patient ID"]]
        let newFolder = outputFolder.createFolder(folderName)
        let folderRichText = SpreadsheetApp.newRichTextValue().setText(folderName).setLinkUrl(newFolder.getUrl()).build()
        sheet.getRange(i + 1, headersObj["Folder"] + 1).setRichTextValue(folderRichText)


        const fileName = allData[i][headersObj["Patient Name"]] + " - Sheet - INC-" + allData[i][headersObj["Patient ID"]]
        let fileOutputFolder = DriveApp.getFolderById(newFolder.getId())
        let newFile = DriveApp.getFileById("1lQhHBun3EN3hXcd6DKgQYfUgZDt42Ws5ArGF4VmfLLc").makeCopy(fileName, fileOutputFolder)
        SpreadsheetApp.openById(newFile.getId()).getSheetByName("Documents").getRange("A1").setRichTextValue(folderRichText)
        let fileRichText = SpreadsheetApp.newRichTextValue().setText(fileName).setLinkUrl(newFile.getUrl()).build()
        sheet.getRange(i + 1, headersObj["Sheet"] + 1).setRichTextValue(fileRichText)

        if (count > 100) {
          break
        }

      }


    } catch (err) {
      Logger.log("Error in : " + i + " ---- " + err)
    }

  }

}






function attemptsToLetterPendingAndSchedule(ss, masterSheet, masterIds) {

  //let ss = SpreadsheetApp.getActiveSpreadsheet()

  let scheAttemptsSheet = ss.getSheetByName(SCHE_ATTEMPTS_SHEET);
  let allData = scheAttemptsSheet.getRange(2, 1, scheAttemptsSheet.getLastRow() - 1, scheAttemptsSheet.getLastColumn()).getDisplayValues()

  let scheAttemptsHeadings = scheAttemptsSheet.getRange(1, 1, 1, scheAttemptsSheet.getLastColumn()).getValues()[0].map(h => h.toString().trim());
  let scheAttemptsHeadingsObj = {};
  scheAttemptsHeadings.forEach((h, i) => {
    scheAttemptsHeadingsObj[h] = i
  })


  let lpSheet = ss.getSheetByName(LETTER_PENDING_SHEET)
  let lpHeadings = lpSheet.getRange(1, 1, 1, lpSheet.getLastColumn()).getValues()[0].map(h => h.toString().trim());
  let lpHeadingsObj = {};
  lpHeadings.forEach((h, i) => {
    lpHeadingsObj[h] = i
  })

  let lpDocUrlColIndex = lpHeadings.indexOf("Scheduling Letter to Referring Provider (Google Doc Link)")
  let lpCoverPageUrlColIndex = lpHeadings.indexOf("Cover Page")




  let vpSheet = ss.getSheetByName(VISIT_PENDING_SHEET)
  let vpHeadings = vpSheet.getRange(1, 1, 1, vpSheet.getLastColumn()).getValues()[0].map(h => h.toString().trim());
  let vpHeadingsObj = {};
  vpHeadings.forEach((h, i) => {
    vpHeadingsObj[h] = i
  })

  let vpDocUrlColIndex = vpHeadings.indexOf("Scheduling Letter to Referring Provider (Google Doc Link)")


  let unscheSheet = ss.getSheetByName(UNSCHEDULED_SHEET)
  let unscheHeadings = unscheSheet.getRange(1, 1, 1, unscheSheet.getLastColumn()).getValues()[0].map(h => h.toString().trim());
  let unscheHeadingsObj = {};
  unscheHeadings.forEach((h, i) => {
    unscheHeadingsObj[h] = i
  })

  let unscheDocUrlColIndex = unscheHeadings.indexOf("Scheduling Letter to Referring Provider (Google Doc Link)")



  let scheduleIndex = scheAttemptsHeadings.indexOf("Schedule Status");
  let apptDateIndex = scheAttemptsHeadings.indexOf("Appointment Date");
  let providerNameIndex = scheAttemptsHeadings.indexOf("SSD Provider Name");
  let officeLocationIndex = scheAttemptsHeadings.indexOf("SSD Office Location");
  let referringPracticeIndex = scheAttemptsHeadings.indexOf("Referring Practice");


  const templateSheet = SpreadsheetApp.getActive().getSheetByName('APPT_Templates');
  const templateData = templateSheet.getDataRange().getValues().filter(row => row[1] !== '');
  let scheduleStatus = templateData.map(row => row[0])

  let newLpData = [];

  let unscheData = []
  let newVPpending = []


  let dataForMaster = []


  let uniquePracticeSheet = ss.getSheetByName(UNIQUE_PRACTICE_SHEET);
  let allPracticesData = uniquePracticeSheet.getRange(2, 1, uniquePracticeSheet.getLastRow() - 1, uniquePracticeSheet.getLastColumn()).getDisplayValues()
  let allPractices = allPracticesData.map(r => r[0].toString().trim())



  for (var i = allData.length - 1; i >= 0; i--) {

    if (allData[i][scheduleIndex] != "" && allData[i][scheduleIndex] != null && allData[i][providerNameIndex] != "" && allData[i][providerNameIndex] != null) {

      let letterDoc = null
      let coverDoc = null

      try {
        let indexOfScheduleStatus = scheduleStatus.indexOf(allData[i][scheduleIndex]);
        let templateId = templateData[indexOfScheduleStatus][1]
        letterDoc = createDocLetter_(ss, templateId, scheAttemptsHeadings, allData[i])
        let practiceIndex = allPractices.indexOf(allData[i][referringPracticeIndex].toString().trim());
        coverDoc = createCoverDoc_(allPracticesData[practiceIndex], letterDoc.getId())
      } catch (letterDocError) {
        Logger.log("letterDocError: " + letterDocError)
        continue
      }


      dataForMaster.push([allData[i][0], allData[i][scheduleIndex], allData[i][apptDateIndex], letterDoc.getUrl(), allData[i][providerNameIndex], allData[i][officeLocationIndex]])

      let newRowData = new Array(lpHeadings.length).fill("")
      for (const key in lpHeadingsObj) {
        if (scheAttemptsHeadingsObj[key] || scheAttemptsHeadingsObj[key] === 0) {
          newRowData[lpHeadingsObj[key]] = allData[i][scheAttemptsHeadingsObj[key]]
        }
      }

      if (letterDoc) {
        newRowData[lpDocUrlColIndex] = letterDoc.getUrl()
        newRowData[lpCoverPageUrlColIndex] = coverDoc.getUrl()
      }
      newLpData.push(newRowData)

      scheAttemptsSheet.deleteRow(i + 2)


      if (allData[i][scheduleIndex] == "Scheduled") {

        let newRowData1 = new Array(vpHeadings.length).fill("")
        for (const key in vpHeadingsObj) {
          if (scheAttemptsHeadingsObj[key] || scheAttemptsHeadingsObj[key] === 0) {
            newRowData1[vpHeadingsObj[key]] = allData[i][scheAttemptsHeadingsObj[key]]
          }
        }

        newRowData1[vpDocUrlColIndex] = letterDoc.getUrl()

        newVPpending.push(newRowData1)

      } else {

        let newRowData1 = new Array(unscheHeadings.length).fill("")
        for (const key in unscheHeadingsObj) {
          if (scheAttemptsHeadingsObj[key] || scheAttemptsHeadingsObj[key] === 0) {
            newRowData1[unscheHeadingsObj[key]] = allData[i][scheAttemptsHeadingsObj[key]]
          }
        }

        if (letterDoc) {
          newRowData1[unscheDocUrlColIndex] = letterDoc.getUrl()
        }

        unscheData.push(newRowData1)

      }

      //Logger.log(i + 2)

    }


  }


  if (newLpData.length > 0) {
    lpSheet.getRange(lpSheet.getLastRow() + 1, 1, newLpData.length, newLpData[0].length).setValues(newLpData)


    updateDataInMasterIncomming(masterSheet, masterIds, dataForMaster, "From Scheduling Attempts")

  }


  if (unscheData.length > 0) {
    unscheSheet.getRange(unscheSheet.getLastRow() + 1, 1, unscheData.length, unscheData[0].length).setValues(unscheData)
  }

  if (newVPpending.length > 0) {
    let lastRow = vpSheet.getLastRow() + 1
    //newRowData1[vpHeadingsObj[key]] = allData[i][scheAttemptsHeadingsObj[key]]
    for (var f = 0; f < newVPpending.length; f++) {
      lastRow = lastRow + f
      newVPpending[f][vpHeadings["Last Visit per EMA"]] = `=IF(IFERROR(VLOOKUP($E${lastRow},Past_Appts!$A:$B,2,false))>$B${lastRow},IFERROR(VLOOKUP($E${lastRow},Past_Appts!$A:$B,2,false)), "")`
      newVPpending[f][vpHeadings["Next Visit Per Ema"]] = `=IF(IFERROR(VLOOKUP($E${lastRow},Future_Appts!$A:$B,2,false))>$B${lastRow},IFERROR(VLOOKUP($E${lastRow},Future_Appts!$A:$B,2,false)), "")`
    }
    vpSheet.getRange(vpSheet.getLastRow() + 1, 1, newVPpending.length, newVPpending[0].length).setValues(newVPpending)
  }


}








function visitPendingToAttempts_(ss, masterSheet, masterIds) {


  let vpSheet = ss.getSheetByName(VISIT_PENDING_SHEET)

  let allData = [];
  if (vpSheet.getLastRow() > 1) {
    allData = vpSheet.getRange(2, 1, vpSheet.getLastRow() - 1, vpSheet.getLastColumn()).getDisplayValues()
  }

  let vpHeadings = vpSheet.getRange(1, 1, 1, vpSheet.getLastColumn()).getValues()[0].map(h => h.toString().trim());
  let vpHeadingsObj = {};
  vpHeadings.forEach((h, i) => {
    vpHeadingsObj[h] = i
  })

  let visitCompleteCol = vpSheet.getRange("VISIT_PENDING_COMPLETE").getColumn() - 1

  //let needNotesIndex = vpHeadings.indexOf("Need to send post-visit notes?  (surgery, etc)")








  //NOSHOW_CANCELLED
  let scheAttemptsSheet = ss.getSheetByName(SCHE_ATTEMPTS_SHEET);
  let scheAttemptsHeadings = scheAttemptsSheet.getRange(1, 1, 1, scheAttemptsSheet.getLastColumn()).getValues()[0].map(h => h.toString().trim());
  let scheAttemptsHeadingsObj = {};
  scheAttemptsHeadings.forEach((h, i) => {
    scheAttemptsHeadingsObj[h] = i
  })


  let dataForMaster = []
  let noShowCancelledData = [];
  for (var i = allData.length - 1; i >= 0; i--) {

    if (allData[i][visitCompleteCol] == "No Show/Cancelled") {

      dataForMaster.push([allData[i][0], "No Show/Cancelled"])

      let newRowData = new Array(scheAttemptsHeadings.length).fill("")
      for (const key in scheAttemptsHeadingsObj) {
        if (vpHeadingsObj[key] || vpHeadingsObj[key] === 0) {
          newRowData[scheAttemptsHeadingsObj[key]] = allData[i][vpHeadingsObj[key]]
        }
      }

      newRowData[scheAttemptsHeadingsObj["Schedule Status"]] = ""
      noShowCancelledData.push(newRowData)
      vpSheet.deleteRow(i + 2)

    }
  }


  if (noShowCancelledData.length == 0) return

  let noShowCancelledIds = noShowCancelledData.map(r => r[scheAttemptsHeadingsObj["ID"]])

  deleteRowsFromSheet_(ss, noShowCancelledIds, LETTER_PENDING_SHEET)

  deleteRowsFromSheet_(ss, noShowCancelledIds, LETTER_SENT_SHEET)




  if (noShowCancelledData.length > 0) {
    let scheAttempRow = scheAttemptsSheet.getRange("NOSHOW_CANCELLED").getRow();
    scheAttemptsSheet.insertRows(scheAttempRow + 1, noShowCancelledData.length);
    scheAttemptsSheet.getRange(scheAttempRow + 1, 1, noShowCancelledData.length, noShowCancelledData[0].length).setValues(noShowCancelledData)
    updateDataInMasterIncomming(masterSheet, masterIds, dataForMaster, "From Visit Complete")
  }


}


function deleteRowsFromSheet_(ss, idsTobeDelete, sheetName) {

  //row to be deleted sheet
  let rTBDSheet = ss.getSheetByName(sheetName)

  let rAllData = []
  if (rTBDSheet.getLastRow() > 1) {
    rAllData = rTBDSheet.getRange(2, 1, rTBDSheet.getLastRow() - 1, rTBDSheet.getLastColumn()).getDisplayValues()
  }

  let rTBDHeadings = rTBDSheet.getRange(1, 1, 1, rTBDSheet.getLastColumn()).getValues()[0].map(h => h.toString().trim());
  let rTBDHeadingsObj = {};
  rTBDHeadings.forEach((h, i) => {
    rTBDHeadingsObj[h] = i
  })

  let rTBDIds = rAllData.map(r => r[rTBDHeadingsObj["ID"]])

  idsTobeDelete.forEach(id => {
    let indexOfId = rTBDIds.indexOf(id)

    if (indexOfId > -1) {

      rTBDSheet.deleteRow(indexOfId + 2)
      rTBDIds.splice(indexOfId, 1)
    }
  })
}






function letterPendingToLetterSent(ss, masterSheet, masterIds) {


  //let ss = SpreadsheetApp.getActiveSpreadsheet()


  let lpSheet = ss.getSheetByName(LETTER_PENDING_SHEET)

  let allData = []
  if (lpSheet.getLastRow() > 1) {
    allData = lpSheet.getRange(2, 1, lpSheet.getLastRow() - 1, lpSheet.getLastColumn()).getDisplayValues()
  }

  let lpHeadings = lpSheet.getRange(1, 1, 1, lpSheet.getLastColumn()).getValues()[0].map(h => h.toString().trim());
  let lpHeadingsObj = {};
  lpHeadings.forEach((h, i) => {
    lpHeadingsObj[h] = i
  })

  //LETTER_PENDING_SENT
  let letterSentCol = lpSheet.getRange("LETTER_PENDING_SENT").getColumn() - 1




  let lsSheet = ss.getSheetByName(LETTER_SENT_SHEET)
  let lsHeadings = lsSheet.getRange(1, 1, 1, lsSheet.getLastColumn()).getValues()[0].map(h => h.toString().trim());
  let lsHeadingsObj = {};
  lsHeadings.forEach((h, i) => {
    lsHeadingsObj[h] = i
  })





  let lsNewData = []
  let dataForMaster = []
  for (var i = allData.length - 1; i >= 0; i--) {

    if (allData[i][letterSentCol] != "Yes") {
      continue
    }


    dataForMaster.push([allData[i][0], "Yes"])
    let newRowData = new Array(lsHeadings.length).fill("")
    for (const key in lsHeadingsObj) {
      if (lpHeadingsObj[key] || lpHeadingsObj[key] === 0) {
        newRowData[lsHeadingsObj[key]] = allData[i][lpHeadingsObj[key]]
      }
    }

    lsNewData.push(newRowData)

    lpSheet.deleteRow(i + 2)

  }



  if (lsNewData.length > 0) {
    lsSheet.getRange(lsSheet.getLastRow() + 1, 1, lsNewData.length, lsNewData[0].length).setValues(lsNewData)

    updateDataInMasterIncomming(masterSheet, masterIds, dataForMaster, "From Letter Pending")
  }



}








function visitPendingToVisitComplete(ss, masterSheet, masterIds) {

  //let ss = SpreadsheetApp.getActiveSpreadsheet()

  let vpSheet = ss.getSheetByName(VISIT_PENDING_SHEET)

  let allData = [];
  if (vpSheet.getLastRow() > 1) {
    allData = vpSheet.getRange(2, 1, vpSheet.getLastRow() - 1, vpSheet.getLastColumn()).getDisplayValues()
  }

  let vpHeadings = vpSheet.getRange(1, 1, 1, vpSheet.getLastColumn()).getValues()[0].map(h => h.toString().trim());
  let vpHeadingsObj = {};
  vpHeadings.forEach((h, i) => {
    vpHeadingsObj[h] = i
  })

  let visitCompleteCol = vpSheet.getRange("VISIT_PENDING_COMPLETE").getColumn() - 1

  let needNotesIndex = vpHeadings.indexOf("Need to send post-visit notes?  (surgery, etc)")


  let vcSheet = ss.getSheetByName(VISIT_COMPLETE_SHEET)
  let vcHeadings = vcSheet.getRange(1, 1, 1, vcSheet.getLastColumn()).getValues()[0].map(h => h.toString().trim());
  let vcHeadingsObj = {};
  vcHeadings.forEach((h, i) => {
    vcHeadingsObj[h] = i
  })


  let notesSentSheet = ss.getSheetByName(NOTES_SENT_SHEET)
  let nsHeadings = notesSentSheet.getRange(1, 1, 1, notesSentSheet.getLastColumn()).getValues()[0].map(h => h.toString().trim());
  let nsHeadingsObj = {};
  nsHeadings.forEach((h, i) => {
    nsHeadingsObj[h] = i
  })


  let refCompSheet = ss.getSheetByName(REFERRAL_COMPLETE_SHEET)
  let refCompHeadings = refCompSheet.getRange(1, 1, 1, refCompSheet.getLastColumn()).getValues()[0].map(h => h.toString().trim());
  let refCompHeadingsObj = {};
  refCompHeadings.forEach((h, i) => {
    refCompHeadingsObj[h] = i
  })






  let newVC = []
  let notesSentData = []
  let referralCompleteData = []

  let dataForMaster = []
  for (var i = allData.length - 1; i >= 0; i--) {

    if (allData[i][visitCompleteCol] != "Complete" && allData[i][vpHeadingsObj["Last Visit per EMA"]] == "") continue


    allData[i][visitCompleteCol] == "Complete"

    let newRowData = new Array(vcHeadings.length).fill("")
    for (const key in vcHeadingsObj) {
      if (vpHeadingsObj[key] || vpHeadingsObj[key] === 0) {
        newRowData[vcHeadingsObj[key]] = allData[i][vpHeadingsObj[key]]
      }
    }
    newVC.push(newRowData)

    vpSheet.deleteRow(i + 2)

    if (allData[i][needNotesIndex] == "Yes") {
      let newRowData1 = new Array(nsHeadings.length).fill("")
      for (const key in nsHeadingsObj) {
        if (vpHeadingsObj[key] || vpHeadingsObj[key] === 0) {
          newRowData1[nsHeadingsObj[key]] = allData[i][vpHeadingsObj[key]]
        }
      }
      notesSentData.push(newRowData1)

    } else {
      dataForMaster.push([allData[i][0], "Yes"])

      let newRowData2 = new Array(refCompHeadings.length).fill("")
      for (const key in refCompHeadingsObj) {
        if (vpHeadingsObj[key] || vpHeadingsObj[key] === 0) {
          newRowData2[refCompHeadingsObj[key]] = allData[i][vpHeadingsObj[key]]
        }
      }

      referralCompleteData.push(newRowData2)
    }




  }


  if (newVC.length > 0) {
    vcSheet.getRange(vcSheet.getLastRow() + 1, 1, newVC.length, newVC[0].length).setValues(newVC)
  }


  if (notesSentData.length > 0) {
    notesSentSheet.getRange(notesSentSheet.getLastRow() + 1, 1, notesSentData.length, notesSentData[0].length).setValues(notesSentData)
  }


  if (referralCompleteData.length > 0) {
    refCompSheet.getRange(refCompSheet.getLastRow() + 1, 1, referralCompleteData.length, referralCompleteData[0].length).setValues(referralCompleteData)
    updateDataInMasterIncomming(masterSheet, masterIds, dataForMaster, "From Visit Complete")
  }

}








//NOTES_REFERRAL_COMPLETE

function notesToReferralComplete(ss, masterSheet, masterIds) {

  //let ss = SpreadsheetApp.getActiveSpreadsheet()


  let notesSentSheet = ss.getSheetByName(NOTES_SENT_SHEET)
  let allData = []
  if (notesSentSheet.getLastRow() > 1) {
    allData = notesSentSheet.getRange(2, 1, notesSentSheet.getLastRow() - 1, notesSentSheet.getLastColumn()).getDisplayValues()
  }

  let nsHeadings = notesSentSheet.getRange(1, 1, 1, notesSentSheet.getLastColumn()).getValues()[0].map(h => h.toString().trim());
  let nsHeadingsObj = {};
  nsHeadings.forEach((h, i) => {
    nsHeadingsObj[h] = i
  })

  let notesSentCol = notesSentSheet.getRange("NOTES_SENT").getColumn() - 1



  let refCompSheet = ss.getSheetByName(REFERRAL_COMPLETE_SHEET)
  let refCompHeadings = refCompSheet.getRange(1, 1, 1, refCompSheet.getLastColumn()).getValues()[0].map(h => h.toString().trim());
  let refCompHeadingsObj = {};
  refCompHeadings.forEach((h, i) => {
    refCompHeadingsObj[h] = i
  })



  let referralCompleteData = []
  let dataForMaster = []
  for (var i = allData.length - 1; i >= 0; i--) {

    if (allData[i][notesSentCol] != "Yes") {
      continue
    }

    dataForMaster.push([allData[i][0], "Yes"])


    let newRowData = new Array(refCompHeadings.length).fill("")
    for (const key in refCompHeadingsObj) {
      if (nsHeadingsObj[key] || nsHeadingsObj[key] === 0) {
        newRowData[refCompHeadingsObj[key]] = allData[i][nsHeadingsObj[key]]
      }
    }

    referralCompleteData.push(newRowData)

    notesSentSheet.deleteRow(i + 2)

  }


  if (referralCompleteData.length > 0) {
    refCompSheet.getRange(refCompSheet.getLastRow() + 1, 1, referralCompleteData.length, referralCompleteData[0].length).setValues(referralCompleteData)
    updateDataInMasterIncomming(masterSheet, masterIds, dataForMaster, "From Notes Sheet")
  }

}




function updateDataInMasterIncomming(masterSheet, masterIds, dataForMaster, colFlage) {


  if (colFlage == "From Scheduling Attempts") {
    dataForMaster.forEach(row => {

      let indexOfId = masterIds.indexOf(row[0].toString())
      if (indexOfId > -1) {
        masterSheet.getRange(indexOfId + 1, 5).setValue(row[1])
        masterSheet.getRange(indexOfId + 1, 9).setValue(row[2])
        masterSheet.getRange(indexOfId + 1, 23).setValue(row[3])

        masterSheet.getRange(indexOfId + 1, 21).setValue(row[4])
        masterSheet.getRange(indexOfId + 1, 22).setValue(row[5])
      }

    })
  }


  if (colFlage == "From Letter Pending") {
    dataForMaster.forEach(row => {

      let indexOfId = masterIds.indexOf(row[0].toString())
      if (indexOfId > -1) {
        masterSheet.getRange(indexOfId + 1, 6).setValue(row[1])

      }

    })
  }



  if (colFlage == "From Visit Complete") {
    dataForMaster.forEach(row => {

      let indexOfId = masterIds.indexOf(row[0].toString())
      if (indexOfId > -1) {
        masterSheet.getRange(indexOfId + 1, 8).setValue(row[1])
        masterSheet.getRange(indexOfId + 1, 5).setValue("Complete")

      }

    })
  }


  if (colFlage == "From Notes Sheet") {
    dataForMaster.forEach(row => {

      let indexOfId = masterIds.indexOf(row[0].toString())
      if (indexOfId > -1) {
        masterSheet.getRange(indexOfId + 1, 8).setValue("Yes")
        masterSheet.getRange(indexOfId + 1, 7).setValue(row[1])

      }

    })
  }


  if (colFlage == "From Scheduling Attempts (Unschedule)") {
    dataForMaster.forEach(row => {
      let indexOfId = masterIds.indexOf(row[0].toString())
      if (indexOfId > -1) {
        masterSheet.getRange(indexOfId + 1, 5).setValue(row[1])
      }
    })
  }

}








function createDocLetter_(ss, templateId, headings, rowData) {

  let docName = 'Referring MD Update Letter_' + rowData[headings.indexOf("Patient Name")] + '_' + new Date().toLocaleDateString();
  let folder = DriveApp.getFolderById(DOC_FOLDER_ID);

  const newDocId = DriveApp.getFileById(templateId).makeCopy(docName, folder).getId();
  const newDoc = DocumentApp.openById(newDocId);
  let body = newDoc.getBody();


  headings.forEach((h, j) => {
    if (h == "SSD Office Location" && rowData[j] == "Pell City") {
      body.replaceText("{{" + h + "}}", "Southern Skies Dermatology")
    } else {
      body.replaceText("{{" + h + "}}", rowData[j])
    }
  })


  let plistSheet = ss.getSheetByName("Unique Practices");
  let allPList = plistSheet.getDataRange().getDisplayValues();





  let refPractice = rowData[headings.indexOf("Referring Practice")].toString().trim()
  //let refPhysician = rowData[headings.indexOf("Referring Physician")]


  let refAddress1 = "";
  let refAddress2 = "";

  for (var j = 0; j < allPList.length; j++) {
    if (allPList[j][0].toString().trim() == refPractice) {
      refAddress1 = allPList[j][1]
      refAddress2 = allPList[j][2]
      break
    }
  }

  body.replaceText("{{Ref Address 1}}", refAddress1)
  body.replaceText("{{Ref Address 2}}", refAddress2)


  let offAddress1 = "";
  let offAddress2 = "";
  let offAddress3 = "";


  let listSheet = ss.getSheetByName("List");
  let allList = listSheet.getDataRange().getDisplayValues();

  let offices = allList.map(r => r[3])

  let offIndex = offices.indexOf(rowData[headings.indexOf("SSD Office Location")])

  if (offIndex > -1) {
    offAddress1 = allList[offIndex][4]
    offAddress2 = allList[offIndex][5]
    offAddress3 = allList[offIndex][6]
  }

  body.replaceText("{{Office Address 1}}", offAddress1)
  body.replaceText("{{Office Address 2}}", offAddress2)
  body.replaceText("{{Office Address 3}}", offAddress3)


  let providerSheet = ss.getSheetByName("Providers List");
  let providersList = providerSheet.getDataRange().getDisplayValues();

  let allProviders = providersList.map(r => r[0]);

  let providerIndex = allProviders.indexOf(rowData[headings.indexOf("SSD Provider Name")])

  let proTitle = "";
  let proEmail = "";
  let proSigId = ""
  if (providerIndex > -1) {
    proTitle = providersList[providerIndex][1];
    proEmail = providersList[providerIndex][2];
    proSigId = providersList[providerIndex][3];

  }

  body.replaceText("{{Title}}", proTitle);
  body.replaceText("{{Provider Email}}", proEmail);


  let oImg = body.findText('<< Signature >>').getElement().getParent().asParagraph();
  oImg.clear();

  if (proSigId != "") {

    const imageBlob = DriveApp.getFileById(proSigId).getBlob();
    oImg = oImg.appendInlineImage(imageBlob);
    oImg.setWidth(150);
    oImg.setHeight(50);

  }

  body.replaceText("{{Today}}", new Date().toLocaleDateString())

  body.replaceText("{{attempted _NoOfCalls}}", 3)

  newDoc.saveAndClose();

  return newDoc

}




















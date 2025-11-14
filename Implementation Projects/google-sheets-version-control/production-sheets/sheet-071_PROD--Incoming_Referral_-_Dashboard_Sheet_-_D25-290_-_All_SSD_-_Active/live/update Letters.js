function updateLetterProcess() {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getActiveSheet();



  let allData = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getDisplayValues();

  let headings = allData.splice(0, 1)[0]

  let letterUpdateIndex = headings.indexOf("Update Letter")
  let scheduleStatusIndex = headings.indexOf("Schedule Status")
  let docUrlIndex = headings.indexOf("Scheduling Letter to Referring Provider (Google Doc Link)")
  let coverPageUrlIndex = headings.indexOf("Cover Page")


  let apptDateIndex = headings.indexOf("Appointment Date");
  let providerNameIndex = headings.indexOf("SSD Provider Name");
  let officeLocationIndex = headings.indexOf("SSD Office Location");
  let referringPracticeIndex = headings.indexOf("Referring Practice");



  const templateSheet = SpreadsheetApp.getActive().getSheetByName('APPT_Templates');
  const templateData = templateSheet.getDataRange().getValues().filter(row => row[1] !== '');
  let templateScheduleStatus = templateData.map(row => row[0])


  let uniquePracticeSheet = ss.getSheetByName(UNIQUE_PRACTICE_SHEET);
  let allPracticesData = uniquePracticeSheet.getRange(2, 1, uniquePracticeSheet.getLastRow() - 1, uniquePracticeSheet.getLastColumn()).getDisplayValues()
  let allPractices = allPracticesData.map(r => r[0].toString().trim())


  let dataForMaster = []

  allData.forEach((row, i) => {

    //Logger.log(row[letterUpdateIndex])
    if (row[letterUpdateIndex] == true || row[letterUpdateIndex] == "TRUE") {


      let indexInTemplate = templateScheduleStatus.indexOf(row[scheduleStatusIndex]);
      let templateId = templateData[indexInTemplate][1]

      //Logger.log(templateId)

      let letterDoc = createDocLetter_(ss, templateId, headings, row)

      let existingDocId = extractIdFromUrl(row[docUrlIndex])
      if (existingDocId != null) {
        DriveApp.getFileById(existingDocId).setTrashed(true)
      }



      let practiceIndex = allPractices.indexOf(allData[i][referringPracticeIndex].toString().trim());

      
      let coverDoc = createCoverDoc_(allPracticesData[practiceIndex], letterDoc.getId())

      let existingCoverDocId = extractIdFromUrl(row[coverPageUrlIndex])
      if (existingCoverDocId != null) {
        DriveApp.getFileById(existingCoverDocId).setTrashed(true)
      }


      sheet.getRange(i + 2, docUrlIndex + 1).setValue(letterDoc.getUrl());
      sheet.getRange(i + 2, coverPageUrlIndex + 1).setValue(coverDoc.getUrl());
      sheet.getRange(i + 2, letterUpdateIndex + 1).setValue(false);


      dataForMaster.push([row[0], row[scheduleStatusIndex], row[apptDateIndex], letterDoc.getUrl(), row[providerNameIndex], row[officeLocationIndex]])



    }
  })


  if (dataForMaster.length == 0) return


  let visitPendingSheet = ss.getSheetByName(VISIT_PENDING_SHEET);
  let visitPendingHeadings = visitPendingSheet.getRange(1, 1, 1, visitPendingSheet.getLastColumn()).getDisplayValues()[0];
  let visitPendingIds = visitPendingSheet.getRange(1, 1, visitPendingSheet.getLastRow(), 1).getDisplayValues().map(r => r[0].toString())

  let visitPendingDocUrlIndex = visitPendingHeadings.indexOf("Scheduling Letter to Referring Provider (Google Doc Link)")



  let unableScheSheet = ss.getSheetByName(UNSCHEDULED_SHEET)
  let unscheduleHeadings = unableScheSheet.getRange(1, 1, 1, unableScheSheet.getLastColumn()).getDisplayValues()[0];
  let unscheduleIds = unableScheSheet.getRange(1, 1, unableScheSheet.getLastRow(), 1).getDisplayValues().map(r => r[0].toString())

  let unscheduleDocUrlIndex = unscheduleHeadings.indexOf("Scheduling Letter to Referring Provider (Google Doc Link)")




  dataForMaster.forEach(row => {
    let indexOfIdVisit = visitPendingIds.indexOf(row[0].toString())

    let indexOfIdUnschedule = unscheduleIds.indexOf(row[0].toString())

    if (indexOfIdVisit > -1) {
      visitPendingSheet.getRange(indexOfIdVisit + 1, visitPendingDocUrlIndex + 1).setValue(row[3])

    } else if (indexOfIdUnschedule > -1) {
      unableScheSheet.getRange(indexOfIdUnschedule + 1, unscheduleDocUrlIndex + 1).setValue(row[3])
    }


  })




  if (dataForMaster.length > 0) {

    let masterSheet = ss.getSheetByName(INCOMING_REFERRAL_SHEET)
    let masterIds = masterSheet.getRange(1, 2, masterSheet.getLastRow(), 1).getValues().map(r => r[0].toString())
    updateDataInMasterIncomming(masterSheet, masterIds, dataForMaster, "From Scheduling Attempts")

  }










}





function extractIdFromUrl(url) {
  // Define the regular expression pattern to match the ID
  let idPattern = /id=([a-zA-Z0-9_-]+)/;

  // Apply the regex to the URL
  let matches = url.match(idPattern);

  // If a match is found, return the first capture group (the ID)
  if (matches && matches.length > 1) {
    return matches[1];
  } else {
    // Return null or an appropriate message if no match is found
    return null;
  }
}









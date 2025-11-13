


const MIPS_VISIT_ARCHIVE_SHEET = "MIPS Visit Data (Archive)"


const UNIQUE_MIPS_SHEET = "Unique MIPS Visit Data (Most recent Dataset)"


const UNIQUE_MIPS_SHEET_ID = '1545557053'



const MIPS_PROCESSING_LOG = "MIPS Processing Log"







const PROVIDERS_VISITS_TO_FIX_SS_ID = "1WdMe_QKAjO25mXKrNIOf75mRUDXdoo7n0KOuyBOJZNw"
const AK_SHEET_ID = '0'
const LM_SHEET_ID = '2083119868'
const MM_SHEET_ID = '836562873'
const KP_SHEET_ID = '1938576176'
const ES_SHEET_ID = '1785541561'
const MD_SHEET_ID = '270451626'
const YD_SHEET_ID = '1154245251'
const MK_SHEET_ID = '1858058676'
const MG_SHEET_ID = '1730006615'







function fetchNewEMAMIPSRawVisits() {


  const mipsRawSS = SpreadsheetApp.openById(EMA_MIPS_VISITS_RAW_DATA_SS_ID);

  let rawSheet = mipsRawSS.getSheetByName("New MIPS Visit Data");

  let facility = rawSheet.getRange("G1:G").getValues();
  facility.forEach(f => {
    if (f[0] == "Southern Skies Dermatology") {
      f[0] = "Trussville"
    }
  })
  rawSheet.getRange(1, 7, facility.length, 1).setValues(facility)


  SpreadsheetApp.flush()
  Utilities.sleep(1000)


  let allVisitsV = rawSheet.getRange(1, 1, rawSheet.getLastRow(), 12).getValues();

  rawSheet.getRange("A2:L").setNumberFormat("@STRING@");

  SpreadsheetApp.flush()
  Utilities.sleep(1000)

  let allVisitsRich = rawSheet.getRange(1, 1, rawSheet.getLastRow(), 12).getRichTextValues();

  rawSheet.getRange("C2:C").setNumberFormat("MM/dd/yyyy");

  allVisitsRich.splice(0, 1)
  allVisitsV.splice(0, 1)





  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const visitArchiveSheet = ss.getSheetByName(MIPS_VISIT_ARCHIVE_SHEET);


  let allvisitArchiveDates = visitArchiveSheet.getRange(1, 2, visitArchiveSheet.getLastRow(), 1).getValues();

  let twoWeekAgo = new Date(new Date().setDate(new Date().getDate() - 14))
  let twoWeeksAgoTime = new Date(twoWeekAgo.getFullYear(), twoWeekAgo.getMonth(), twoWeekAgo.getDate()).getTime();


  for (var i = 0; i < allvisitArchiveDates.length; i++) {
    if (isValidDate_(allvisitArchiveDates[i][0])) {
      if (allvisitArchiveDates[i][0].getTime() < twoWeeksAgoTime) {
        visitArchiveSheet.deleteRows(i + 1, allvisitArchiveDates.length - i)
        break
      }
    }
  }


  let newID = 1

  if (allVisitsRich.length != 0) {
    let lastRow = visitArchiveSheet.getLastRow()

    visitArchiveSheet.getRange(lastRow + 1, 3, allVisitsRich.length, allVisitsRich[0].length).setRichTextValues(allVisitsRich)

    let idTrackerSheet = ss.getSheetByName('ID_Tracker')
    let lastId = idTrackerSheet.getRange("A2").getValue()
    newID = lastId + 1
    idTrackerSheet.getRange("A2").setValue(newID)

    let newDate = new Date().toLocaleDateString();

    let newIdsArray = new Array(allVisitsRich.length).fill([newID, newDate])

    visitArchiveSheet.getRange(lastRow + 1, 1, newIdsArray.length, newIdsArray[0].length).setValues(newIdsArray)

    visitArchiveSheet.getRange(2, 1, visitArchiveSheet.getLastRow() - 1, visitArchiveSheet.getLastColumn()).sort([{ column: 2, ascending: false }])

  }

  SpreadsheetApp.flush();
  Utilities.sleep(1000)



  let rawCountSheet = mipsRawSS.getSheetByName("Count_TMP")
  let countsData = rawCountSheet.getRange(3, 1, 1, rawCountSheet.getLastColumn()).getValues()[0]
  countsData[0] = newID;
  countsData[1] = new Date().toLocaleDateString()
  let rawMetricsSheet = mipsRawSS.getSheetByName("Metrics")
  rawMetricsSheet.getRange(rawMetricsSheet.getLastRow() + 1, 1, 1, countsData.length).setValues([countsData])
  rawMetricsSheet.getRange(3, 1, rawMetricsSheet.getLastRow() - 2, rawMetricsSheet.getLastColumn()).sort([{ column: 1, ascending: false }])


  rawSheet.getRange("A2:M").clearContent()


  SpreadsheetApp.flush();
  Utilities.sleep(1000)

  processMipsProcessingLog(ss, allVisitsV, newID)

  SpreadsheetApp.flush();
  Utilities.sleep(1000)

  processUniqueMipsVisitsData(ss, allVisitsRich, allVisitsV, newID)


  processProvidersMipsToFix_()


  try {
    storeScriptTimestamp_("Fetch Raw Visits")
  } catch (err) { }


  try {
    logToRawData_(ss, allVisitsV[0][2], allVisitsV[allVisitsV.length - 1][2], allVisitsV)
  } catch (err) { }

}







function logToRawData_(ss, startDate, endDate, allData) {
  //ss = SpreadsheetApp.getActiveSpreadsheet()
  //endDate = new Date()
  //startDate = new Date()

  let fileName = "2025 MIPS QM - EMA MIPS Visits - Raw Data (Copy & Pasted From EMA)"
  let dataSet = "MIPS QM Raw Data"
  let updatedName = "MIPS " + startDate.toLocaleDateString() + "-" + endDate.toLocaleDateString() + " Raw_ " + Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY")
  let link = "https://docs.google.com/spreadsheets/d/1ff3FS6TC-2R5CHJXidKg8IdqW_u5G6xvYM6uGCUIs6Q/edit?gid=888266503#gid=888266503";
  let dataSpreadsheetName = ss.getName()
  let timeStamp = Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY HH:mm:ss")

  //let fileName = "2025 MIPS QM - EMA MIPS Visits - Raw Data (Copy & Pasted From EMA)"

  let rawLogRow = [fileName, dataSet, startDate, endDate, updatedName, link, "", dataSpreadsheetName, timeStamp, allData.length]

  //file.setName(updatedName)

  let rawSS = SpreadsheetApp.openById("1K8AnRcR6INmL_gAJMB5S9IAuq8psHX3dSonn3wRFpxw")
  let rawLogSheet = rawSS.getSheetByName("Raw Data Dump Log")
  rawLogSheet.getRange(rawLogSheet.getLastRow() + 1, 1, 1, rawLogRow.length).setValues([rawLogRow])
  rawLogSheet.getRange(2, 1, rawLogSheet.getLastRow() - 1, rawLogSheet.getLastColumn()).sort([{ column: 9, ascending: false }])
}






function storeScriptTimestamp_(functionName) {
  let ss = SpreadsheetApp.openById("1ocFHiT3bCrMcEVZBQqIdUPbL544pgOE8M2KLDoGHub0");
  let sheet = ss.getSheetByName("Mips Script Log")
  let row = [new Date(), functionName, Session.getActiveUser()];

  sheet.getRange(sheet.getLastRow() + 1, 1, 1, row.length).setValues([row])
}










function processProvidersMipsToFix_() {


  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let uniqueMipsSheet = getSheetByID_(ss, UNIQUE_MIPS_SHEET_ID)

  let uniqueMipsData = uniqueMipsSheet.getRange("C1:P").getValues()
  let uniqueHeaders = uniqueMipsData.splice(0, 1)[0]
  let uIdIndex = uniqueHeaders.indexOf('ID');
  let uFixedIndex = uniqueHeaders.indexOf('Provider has fixed? (Provider Amended Note)');
  let uProviderIndex = uniqueHeaders.indexOf('Provider');
  let uIntialStatusIndex = uniqueHeaders.indexOf('Initial Performance Status');
  let uOverrideIndex = uniqueHeaders.indexOf('Override');


  let uAllIds = uniqueMipsData.map(r => r[uIdIndex])
  let uAllFixed = uniqueMipsData.map(r => [r[uFixedIndex]])




  let providersSS = SpreadsheetApp.openById(PROVIDERS_VISITS_TO_FIX_SS_ID);

  let akSheet = getSheetByID_(providersSS, AK_SHEET_ID);
  uAllFixed = processAlreadyFixed_(uAllFixed, uAllIds, akSheet)

  let lmSheet = getSheetByID_(providersSS, LM_SHEET_ID);
  uAllFixed = processAlreadyFixed_(uAllFixed, uAllIds, lmSheet)

  let mmSheet = getSheetByID_(providersSS, MM_SHEET_ID);
  uAllFixed = processAlreadyFixed_(uAllFixed, uAllIds, mmSheet)

  let kpSheet = getSheetByID_(providersSS, KP_SHEET_ID);
  uAllFixed = processAlreadyFixed_(uAllFixed, uAllIds, kpSheet)

  let esSheet = getSheetByID_(providersSS, ES_SHEET_ID);
  uAllFixed = processAlreadyFixed_(uAllFixed, uAllIds, esSheet)


  let mdSheet = getSheetByID_(providersSS, MD_SHEET_ID);
  uAllFixed = processAlreadyFixed_(uAllFixed, uAllIds, mdSheet)


  let ydSheet = getSheetByID_(providersSS, YD_SHEET_ID);
  uAllFixed = processAlreadyFixed_(uAllFixed, uAllIds, ydSheet)

  let mkSheet = getSheetByID_(providersSS, MK_SHEET_ID);
  uAllFixed = processAlreadyFixed_(uAllFixed, uAllIds, mkSheet)

  let mgSheet = getSheetByID_(providersSS, MG_SHEET_ID);
  uAllFixed = processAlreadyFixed_(uAllFixed, uAllIds, mgSheet)



  uniqueMipsSheet.getRange(2, 16, uAllFixed.length, 1).setValues(uAllFixed)

  SpreadsheetApp.flush()
  Utilities.sleep(1000)

  uniqueMipsData = uniqueMipsSheet.getRange("C2:P").getValues()


  uniqueMipsSheet.getRange("C2:P").setNumberFormat("@STRING@");
  SpreadsheetApp.flush()
  Utilities.sleep(1000)

  let uniqueMipsDataRich = uniqueMipsSheet.getRange("C2:P").getRichTextValues();
  uniqueMipsSheet.getRange("F2:F").setNumberFormat("MM/dd/yyyy");



  let akNewData = [];
  let lmNewData = [];
  let mmNewData = [];
  let kpNewData = [];
  let esNewData = [];
  let mdNewData = [];
  let ydNewData = [];
  let mkNewData = [];
  let mgNewData = [];



  uniqueMipsData.forEach((row, i) => {

    //if ((row[uIntialStatusIndex].includes('Unfavorable') || row[uIntialStatusIndex].includes('Exception')) && row[uOverrideIndex] == 'Select Override' && (row[uFixedIndex] == "" || row[uFixedIndex] == null)) {

    if ((row[uIntialStatusIndex].includes('Unfavorable') || row[uIntialStatusIndex].includes('Exception')) && row[uOverrideIndex] == 'Select Override') {

      if (row[uProviderIndex] == "Keely, Adrienne") {
        akNewData.push(uniqueMipsDataRich[i])
      }
      if (row[uProviderIndex] == "Miller, Lauren") {
        lmNewData.push(uniqueMipsDataRich[i])
      }
      if (row[uProviderIndex] == "Maruthur, Mario") {
        mmNewData.push(uniqueMipsDataRich[i])
      }
      if (row[uProviderIndex] == "Parker, Kaitlyn") {
        kpNewData.push(uniqueMipsDataRich[i])
      }
      if (row[uProviderIndex] == "Stephens, Emma") {
        esNewData.push(uniqueMipsDataRich[i])
      }
      if (row[uProviderIndex] == "Downing, Malia") {
        mdNewData.push(uniqueMipsDataRich[i])
      }
      if (row[uProviderIndex] == "Yearwood, Dena") {
        ydNewData.push(uniqueMipsDataRich[i])
      }
      if (row[uProviderIndex] == "Mills, Kimberly") {
        mkNewData.push(uniqueMipsDataRich[i])
      }
      if (row[uProviderIndex] == "McMahan, Grace") {
        mgNewData.push(uniqueMipsDataRich[i])
      }
    }
  })




  akSheet.getRange("A2:N").clearContent();
  lmSheet.getRange("A2:N").clearContent();
  mmSheet.getRange("A2:N").clearContent();
  kpSheet.getRange("A2:N").clearContent();
  esSheet.getRange("A2:N").clearContent();
  mdSheet.getRange("A2:N").clearContent();
  mgSheet.getRange("A2:N").clearContent();


  if (akNewData.length > 0) {
    akSheet.getRange(2, 1, akNewData.length, akNewData[0].length).setRichTextValues(akNewData)
    akSheet.getRange(2, 1, akNewData.length, akNewData[0].length).sort([{ column: 4, ascending: false }, { column: 3, ascending: false }])
  }

  if (lmNewData.length > 0) {
    lmSheet.getRange(2, 1, lmNewData.length, lmNewData[0].length).setRichTextValues(lmNewData)
    lmSheet.getRange(2, 1, lmNewData.length, lmNewData[0].length).sort([{ column: 4, ascending: false }, { column: 3, ascending: false }])
  }

  if (mmNewData.length > 0) {
    mmSheet.getRange(2, 1, mmNewData.length, mmNewData[0].length).setRichTextValues(mmNewData)
    mmSheet.getRange(2, 1, mmNewData.length, mmNewData[0].length).sort([{ column: 4, ascending: false }, { column: 3, ascending: false }])
  }

  if (kpNewData.length > 0) {
    kpSheet.getRange(2, 1, kpNewData.length, kpNewData[0].length).setRichTextValues(kpNewData)
    kpSheet.getRange(2, 1, kpNewData.length, kpNewData[0].length).sort([{ column: 4, ascending: false }, { column: 3, ascending: false }])
  }

  if (esNewData.length > 0) {
    esSheet.getRange(2, 1, esNewData.length, esNewData[0].length).setRichTextValues(esNewData)
    esSheet.getRange(2, 1, esNewData.length, esNewData[0].length).sort([{ column: 4, ascending: false }, { column: 3, ascending: false }])
  }

  if (mdNewData.length > 0) {
    mdSheet.getRange(2, 1, mdNewData.length, mdNewData[0].length).setRichTextValues(mdNewData)
    mdSheet.getRange(2, 1, mdNewData.length, mdNewData[0].length).sort([{ column: 4, ascending: false }, { column: 3, ascending: false }])
  }

  if (ydNewData.length > 0) {
    ydSheet.getRange(2, 1, ydNewData.length, ydNewData[0].length).setRichTextValues(ydNewData)
    ydSheet.getRange(2, 1, ydNewData.length, ydNewData[0].length).sort([{ column: 4, ascending: false }, { column: 3, ascending: false }])
  }

  if (mkNewData.length > 0) {
    mkSheet.getRange(2, 1, mkNewData.length, mkNewData[0].length).setRichTextValues(mkNewData)
    mkSheet.getRange(2, 1, mkNewData.length, mkNewData[0].length).sort([{ column: 4, ascending: false }, { column: 3, ascending: false }])
  }

  if (mgNewData.length > 0) {
    mgSheet.getRange(2, 1, mgNewData.length, mgNewData[0].length).setRichTextValues(mgNewData)
    mgSheet.getRange(2, 1, mgNewData.length, mgNewData[0].length).sort([{ column: 4, ascending: false }, { column: 3, ascending: false }])
  }


}







function processAlreadyFixed_(uAllFixed, uAllIds, sheet) {

  let pData = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getValues();
  let pHeaders = pData.splice(0, 1)[0]
  let pIdIndex = pHeaders.indexOf('ID');
  let pFixedIndex = pHeaders.indexOf('Provider has fixed? (Provider Amended Note)');

  let pFixedIds = pData.filter(r => r[pFixedIndex] == 'Yes').map(r => r[pIdIndex]);


  pFixedIds.forEach(id => {
    let index = uAllIds.indexOf(id);
    if (index > -1) {
      uAllFixed[index][0] = "Yes"
    }
  })

  return uAllFixed
}



















function testProcessLog() {

  const mipsRawSS = SpreadsheetApp.openById(EMA_MIPS_VISITS_RAW_DATA_SS_ID);
  let rawSheet = mipsRawSS.getSheetByName("New MIPS Visit Data");
  let allVisitsV = rawSheet.getRange(1, 1, rawSheet.getLastRow(), 12).getValues();
  allVisitsV.splice(0, 1)


  const ss = SpreadsheetApp.getActiveSpreadsheet();


  processMipsProcessingLog(ss, allVisitsV, "Test ID")
}



//MIPS Processing Log
function processMipsProcessingLog(ss, allVisitsV, newID) {
  let uniqueMipsSheet = ss.getSheetByName(UNIQUE_MIPS_SHEET);
  let uniqueMipsData = uniqueMipsSheet.getRange("D2:O").getValues()

  let noOfRecords = allVisitsV.length

  let allVisitIds = []
  let allVisitsIdsSmall = []
  for (var i = 0; i < allVisitsV.length; i++) {
    let visitDate = allVisitsV[i][2]
    if (isValidDate_(visitDate)) {
      visitDate = Utilities.formatDate(visitDate, Session.getScriptTimeZone(), "MM/dd/yyyy")
    }
    let id = allVisitsV[i][1] + visitDate + allVisitsV[i][5];
    allVisitIds.push(id)
    allVisitsIdsSmall.push(allVisitsV[i][1] + allVisitsV[i][5])
  }


  let uniqueVisitsIds = []
  let uniqueVisitIdsSmall = []
  for (var i = 0; i < uniqueMipsData.length; i++) {
    let visitDate = uniqueMipsData[i][2]
    if (isValidDate_(visitDate)) {
      visitDate = Utilities.formatDate(visitDate, Session.getScriptTimeZone(), "MM/dd/yyyy")
    }
    let id = uniqueMipsData[i][1] + visitDate + uniqueMipsData[i][5];
    uniqueVisitsIds.push(id)

    uniqueVisitIdsSmall.push(uniqueMipsData[i][1] + uniqueMipsData[i][5])
  }


  let mipsVisitReplaced = 0;
  for (var i = 0; i < uniqueVisitIdsSmall.length; i++) {
    let uniqueSmallIdIndex = allVisitsIdsSmall.indexOf(uniqueVisitIdsSmall[i])
    if (uniqueSmallIdIndex > -1) {
      if (uniqueVisitsIds[i] != allVisitIds[uniqueSmallIdIndex]) {
        mipsVisitReplaced++
      }
    }
  }




  let notInPrevious = 0;
  let noOfRecordsAddedToUnique = 0
  let noOfDuplicates = 0;
  let noOfStatusChange = 0;

  for (var i = 0; i < allVisitsIdsSmall.length; i++) {
    let newSmallIdIndex = uniqueVisitIdsSmall.indexOf(allVisitsIdsSmall[i])
    if (newSmallIdIndex == -1) {
      notInPrevious++
      noOfRecordsAddedToUnique++
    }
    //else {
    // noOfDuplicates++

    // if (allVisitsV[i][10] != uniqueMipsData[newSmallIdIndex][11]) {
    //   Logger.log(allVisitsV[i])
    //   Logger.log(uniqueMipsData[newSmallIdIndex])
    //   noOfStatusChange++
    // }
    //}
  }

  //Logger.log(noOfStatusChange)






  for (var i = 0; i < allVisitsV.length; i++) {
    let indexInUnique = uniqueVisitsIds.indexOf(allVisitIds[i])

    if (indexInUnique == -1) {
      //notInPrevious++
      //noOfRecordsAddedToUnique++
    } else {
      noOfDuplicates++

      if (allVisitsV[i][11] != uniqueMipsData[indexInUnique][11]) {
        noOfStatusChange++
      }
    }

  }



  let noOfMissing = 0;
  uniqueVisitIdsSmall.forEach(uId => {
    let uidIOndex = allVisitsIdsSmall.indexOf(uId)
    if (uidIOndex == -1) {
      noOfMissing++
    }
  })




  //let noOfRecordsAddedToUnique = allVisitsV.length - uniqueMipsData.length;

  let removeDuplicatesId = [...new Set(allVisitIds)]

  let newProcessingLog = [newID, new Date().toLocaleDateString(), noOfRecords, notInPrevious, noOfDuplicates, noOfMissing, noOfStatusChange, noOfRecordsAddedToUnique, noOfStatusChange, removeDuplicatesId.length, mipsVisitReplaced]

  // Logger.log(newProcessingLog)
  // return
  let processingLogSheet = ss.getSheetByName(MIPS_PROCESSING_LOG)

  processingLogSheet.getRange(processingLogSheet.getLastRow() + 1, 1, 1, newProcessingLog.length).setValues([newProcessingLog])
  processingLogSheet.getRange(2, 1, processingLogSheet.getLastRow() - 1, processingLogSheet.getLastColumn()).sort([{ column: 1, ascending: false }])

}














//Unique MIPS Visit Data (Most recent Dataset)
function processUniqueMipsVisitsData(ss, allVisitsRich, allVisitsV, newID) {

  let uniqueMipsSheet = getSheetByID_(ss, UNIQUE_MIPS_SHEET_ID)

  let uniqueMipsData = uniqueMipsSheet.getRange("D2:Q").getValues()


  uniqueMipsSheet.getRange("D2:Q").setNumberFormat("@STRING@");
  SpreadsheetApp.flush()
  Utilities.sleep(1000)

  let uniqueMipsDataRich = uniqueMipsSheet.getRange("D2:Q").getRichTextValues();
  uniqueMipsSheet.getRange("F2:F").setNumberFormat("MM/dd/yyyy");


  let newUniqueArray = []
  let newVIds = [];

  let emptyRichText = SpreadsheetApp.newRichTextValue().setText("").setLinkUrl(null).build()

  for (var i = 0; i < allVisitsV.length; i++) {

    let allVDate = allVisitsV[i][2]
    if (isValidDate_(allVDate)) {
      allVDate = Utilities.formatDate(allVDate, Session.getScriptTimeZone(), "MM/dd/yyyy")
    }

    let tempID = allVisitsV[i][1] + allVDate + allVisitsV[i][5];

    let indexInExisting = newVIds.indexOf(tempID);


    if (indexInExisting > -1) break;

    newVIds.push(tempID)
    //if(newVIds)

    let already = false



    for (var j = 0; j < uniqueMipsData.length; j++) {

      let uniqueVDate = uniqueMipsData[j][2]
      if (isValidDate_(uniqueVDate)) {
        uniqueVDate = Utilities.formatDate(uniqueVDate, Session.getScriptTimeZone(), "MM/dd/yyyy")
      }


      if (allVDate == uniqueVDate && allVisitsV[i][1] == uniqueMipsData[j][1] && allVisitsV[i][5].toString() == uniqueMipsData[j][5].toString()) {

        uniqueMipsDataRich[j][13] = uniqueMipsDataRich[j][10]
        uniqueMipsDataRich[j][11] = allVisitsRich[i][11]
        newUniqueArray.push(uniqueMipsDataRich[j])

        uniqueMipsData.splice(j, 1)
        uniqueMipsDataRich.splice(j, 1)
        already = true

        break
      }

    }

    if (already == false) {
      //Logger.log("Yes")
      //allVisitsRich[i].splice(10, 0, allVisitsRich[i][10]);
      allVisitsRich[i].push(emptyRichText)
      newUniqueArray.push(allVisitsRich[i])
      //newProviderFixed.push([""])
    }
  }


  if (newUniqueArray.length > 0) {
    try {
      uniqueMipsSheet.deleteRows(3, uniqueMipsSheet.getLastRow() - 2)
    } catch (err) {

    }
    uniqueMipsSheet.getRange(2, 4, newUniqueArray.length, newUniqueArray[0].length).setRichTextValues(newUniqueArray)

    let newDate = new Date().toLocaleDateString();
    let newIdsArray = new Array(newUniqueArray.length).fill([newID, newDate])

    uniqueMipsSheet.getRange(2, 1, newIdsArray.length, newIdsArray[0].length).setValues(newIdsArray)
    uniqueMipsSheet.getRange(2, 3, newVIds.length, 1).setValues(newVIds.map(r => [r]))


  }

}






//below function will return true if the arg is valid date and false if not.
function isValidDate_(d) {
  if (Object.prototype.toString.call(d) !== "[object Date]")
    return false;
  return !isNaN(d.getTime());
}









function getSheetByID_(ss, sheetID) {
  let allSheets = ss.getSheets();
  return allSheets.filter(s => s.getSheetId().toString() == sheetID)[0]
}










































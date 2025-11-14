


const RAW_FOLDER_ID = "1Xbu6iPrj7K6uZJT-DazkQSwYXyqUroHv"

const RAW_DATA_LOG_SHEET = "Raw Data Dump Log"

const RAW_DATA_HEADINGS_SHEET = "Raw Data Headings"


const DEST_FOLDER_COL = 7
const DEST_SS_COL = 8






function onOpen() {
  let ui = SpreadsheetApp.getUi();
  let menu = ui.createMenu("Custom");
  menu.addItem("Process Raw Data Files", "rawDataProcessMain").addToUi();
}




function rawDataProcessMain() {

  // }
  // function rawDataProcessMain1() {

  let ss = SpreadsheetApp.getActiveSpreadsheet();

  let rawLogSheet = ss.getSheetByName(RAW_DATA_LOG_SHEET)

  let headingsSheet = ss.getSheetByName(RAW_DATA_HEADINGS_SHEET);

  let allHeadings = headingsSheet.getRange(2, 1, headingsSheet.getLastRow() - 1, headingsSheet.getLastColumn()).getValues();

  let sourceHeadings = {
    ["Firstbank Bank Statements - Raw Data"]: allHeadings.map(r => r[0]).filter(r => r != "" && r != null).join("_"),
    ["EMA Pathology - Raw Data"]: allHeadings.map(r => r[1]).filter(r => r != "" && r != null).join("_"),
    ["EMA Collections - Raw Data"]: allHeadings.map(r => r[2]).filter(r => r != "" && r != null).join("_"),
    ["Medisys Collections - Raw Data"]: allHeadings.map(r => r[3]).filter(r => r != "" && r != null).join("_"),
    ["EMA Appointments - Raw Data"]: allHeadings.map(r => r[4]).filter(r => r != "" && r != null).join("_"),
    ["Medisys Skin Subs Billing - Raw Data"]: allHeadings.map(r => r[5]).filter(r => r != "" && r != null).join("_"),
    ["Pre-EMA Biopsies - Raw Data"]: allHeadings.map(r => r[6]).filter(r => r != "" && r != null).join("_"),
    ["EMA Skin Subs Billing - Raw Data"]: allHeadings.map(r => r[7]).filter(r => r != "" && r != null).join("_"),
    ["SkinDx Daily Biopsy - Raw Data"]: allHeadings.map(r => r[8]).filter(r => r != "" && r != null).join("_"),
    ["EMA Billing for PSD - Raw Data"]: allHeadings.map(r => r[9]).filter(r => r != "" && r != null).join("_"),
    ["EMA Billing for IBD - Raw Data"]: allHeadings.map(r => r[10]).filter(r => r != "" && r != null).join("_"),
    ["EMA Billing for Surgery Dashboard - Raw Data"]: allHeadings.map(r => r[11]).filter(r => r != "" && r != null).join("_"),
    ["EMA Cosmetics Billing - Raw Data"]: allHeadings.map(r => r[12]).filter(r => r != "" && r != null).join("_"),
    ["EMA Patient A/R - Raw Data"]: allHeadings.map(r => r[13]).filter(r => r != "" && r != null).join("_"),
    ["EMA Visit Notes for IBD - Raw Data"]: allHeadings.map(r => r[14]).filter(r => r != "" && r != null).join("_"),
    ["Credit Card Statements - Raw Data"]: allHeadings.map(r => r[15]).filter(r => r != "" && r != null).join("_"),
    ["EMA EMR - Raw Data"]: allHeadings.map(r => r[16]).filter(r => r != "" && r != null).join("_"),
    ["401K - Raw Data"]: allHeadings.map(r => r[17]).filter(r => r != "" && r != null).join("_"),
    ["AK W/MM - Raw Data"]: allHeadings.map(r => r[18]).filter(r => r != "" && r != null).join("_"),
    ["AK W/MM Billing - Raw Data"]: allHeadings.map(r => r[19]).filter(r => r != "" && r != null).join("_"),
    ["Paycor 401K - Raw Data"]: allHeadings.map(r => r[20]).filter(r => r != "" && r != null).join("_"),
    ["Henry Schein Items Purchased Raw Data"]: allHeadings.map(r => r[21]).filter(r => r != "" && r != null).join("_"),
    ["Mckesson Order history Raw Data"]: allHeadings.map(r => r[22].toString().trim()).filter(r => r != "" && r != null).join("_"),
    ["Amazon orders Raw Data"]: allHeadings.map(r => r[23].toString().trim()).filter(r => r != "" && r != null).join("_"),
    ["Henry Schein Items Purchased Invoices Raw Data"]: allHeadings.map(r => r[24]).filter(r => r != "" && r != null).join("_"),
    ["New Mckesson Order history Raw Data"]: allHeadings.map(r => r[25].toString().trim()).filter(r => r != "" && r != null).join("_"),
    ["Sams Club Order history Raw Data"]: allHeadings.map(r => r[26].toString().trim()).filter(r => r != "" && r != null).join("_"),
    ["Lauren Miller PA from CMM Raw Data"]: allHeadings.map(r => r[27].toString().trim()).filter(r => r != "" && r != null).join("_"),
    ["EMA Visit Notes - Raw Data"]: allHeadings.map(r => r[28]).filter(r => r != "" && r != null).join("_"),
    ["Meds Test Report - Raw Data"]: allHeadings.map(r => r[29]).filter(r => r != "" && r != null).join("_"),
    ["Medications - Raw Data"]: allHeadings.map(r => r[30]).filter(r => r != "" && r != null).join("_"),
    ["Patients Demographics - Raw Data"]: allHeadings.map(r => r[31].toString().trim()).filter(r => r != "" && r != null).join("_"),
    ["Patient Unallocated Payments - Raw Data"]: allHeadings.map(r => r[32].toString().trim()).filter(r => r != "" && r != null).join("_"),
  };

  //Logger.log(sourceHeadings['Paycor 401K - Raw Data'])

  // Get the source and destination folders
  let sourceFolder = DriveApp.getFolderById(RAW_FOLDER_ID);
  let files = sourceFolder.getFiles()


  while (files.hasNext()) {
    let file = files.next();


    let mimeType = file.getMimeType()

    if (mimeType == "application/vnd.google-apps.spreadsheet") {


      let ss = SpreadsheetApp.openById(file.getId());
      let sheet = ss.getSheets()[0]; // Get the first sheet
      let data = sheet.getDataRange().getValues(); // Get all data
      let dataDisp = sheet.getDataRange().getDisplayValues(); // Get all data
      dataDisp.splice(0, 1)

      let headings = data.splice(0, 1)[0].map(h => h.toString().trim())
      let headingsObj = {}
      headings.forEach((h, i) => {
        headingsObj[h.toString().trim()] = i
      })

      //Logger.log(headings)



      //return
      //Firstbank Bank Statements - Raw Data
      if (headings.join("_") == sourceHeadings["Firstbank Bank Statements - Raw Data"]) {
        Logger.log("Firstbank Bank Statements - Raw Data")
        processFirstBankRawData_(rawLogSheet, file, headings, headingsObj, dataDisp)

        //Credit Card Statements - Raw Data
      } else if (headings.join("_") == sourceHeadings["Credit Card Statements - Raw Data"]) {
        Logger.log("Credit Card Statements - Raw Data")
        processCreditCardRawData_(rawLogSheet, file, headings, headingsObj, dataDisp)

        //EMA Pathology - Raw Data
      } else if (headings.join("_") == sourceHeadings["EMA Pathology - Raw Data"]) {
        Logger.log("EMA Pathology - Raw Data")
        processEmaPathologyRawData_(rawLogSheet, file, headings, headingsObj, dataDisp)

        //EMA Collections - Raw Data
      } else if (headings.join("_") == sourceHeadings["EMA Collections - Raw Data"]) {
        Logger.log("EMA Collections - Raw Data")
        processEmaCollectionRawData_(rawLogSheet, file, headings, headingsObj, data)

        //Medisys Collections - Raw Data
      } else if (headings.join("_") == sourceHeadings["Medisys Collections - Raw Data"]) {
        Logger.log("Medisys Collections - Raw Data")
        processMediCollectionRawData_(rawLogSheet, file, headings, headingsObj, dataDisp, data)

        //EMA Appointments - Raw Data
      } else if (headings.join("_") == sourceHeadings["EMA Appointments - Raw Data"]) {
        Logger.log("EMA Appointments - Raw Data")
        processEmaApptRawData_(rawLogSheet, file, headings, headingsObj, dataDisp)

        //Medisys Skin Subs Billing - Raw Data
      } else if (headings.join("_") == sourceHeadings["Medisys Skin Subs Billing - Raw Data"]) {
        Logger.log("Medisys Skin Subs Billing 05-21-2024")
        processMedisysSkinSubsBillingRawData_(rawLogSheet, file, headings, headingsObj, dataDisp)

        //Pre-EMA Biopsies - Raw Data
      } else if (headings.join("_") == sourceHeadings["Pre-EMA Biopsies - Raw Data"]) {
        Logger.log("Pre-EMA Biopsies - Raw Data")
        processPreEmaBiopsiesRawData_(rawLogSheet, file, headings, headingsObj, dataDisp)

        //EMA Skin Subs Billing - Raw Data
      } else if (headings.join("_") == sourceHeadings["EMA Skin Subs Billing - Raw Data"]) {
        Logger.log("EMA Skin Subs Billing - Raw Data")
        processEmaSkinSubsBillingRawData_(rawLogSheet, file, headings, headingsObj, data)

        //SkinDx Daily Biopsy - Raw Data
      } else if (headings.join("_") == sourceHeadings["SkinDx Daily Biopsy - Raw Data"]) {
        Logger.log("SkinDx Daily Biopsy - Raw Data")
        processSkinDxDailyBiopsyRawData_(rawLogSheet, file, headings, headingsObj, dataDisp)

        //EMA Billing for PSD - Raw Data
      } else if (headings.join("_") == sourceHeadings["EMA Billing for PSD - Raw Data"]) {
        Logger.log("EMA Billing for PSD - Raw Data")
        processEmaBillingPSDRawData_(rawLogSheet, file, headings, headingsObj, dataDisp)

        //EMA Billing for IBD - Raw Data
      } else if (headings.join("_") == sourceHeadings["EMA Billing for IBD - Raw Data"]) {
        Logger.log("EMA Billing for IBD - Raw Data")
        try {
          processEmaBillingIBDRawData_(rawLogSheet, file, headings, headingsObj, dataDisp)
        } catch (ibdErr) { Logger.log("Error: " + ibdErr) }

        //EMA Billing for Surgery Dashboard - Raw Data
      } else if (headings.join("_") == sourceHeadings["EMA Billing for Surgery Dashboard - Raw Data"]) {
        Logger.log("EMA Billing for Surgery Dashboard - Raw Data")
        processEmaBillingSurgeryRawData_(rawLogSheet, file, headings, headingsObj, data)

        //EMA Cosmetics Billing - Raw Data
      } else if (headings.join("_") == sourceHeadings["EMA Cosmetics Billing - Raw Data"]) {
        Logger.log("EMA Cosmetics Billing - Raw Data")
        processEmaCosmeticsBillingRawData_(rawLogSheet, file, headings, headingsObj, data)

        //EMA Patient A/R - Raw Data
      } else if (headings.join("_") == sourceHeadings["EMA Patient A/R - Raw Data"]) {
        Logger.log("EMA Patient A/R - Raw Data")
        processEmaPatientArRawData_(rawLogSheet, file, headings, headingsObj, data)

        //EMA Visit Notes for IBD - Raw Data
      } else if (headings.join("_") == sourceHeadings["EMA Visit Notes for IBD - Raw Data"]) {
        Logger.log("EMA Visit Notes for IBD - Raw Data")
        processEmaVisitNotesIbdRawData_(rawLogSheet, file, headings, headingsObj, data)


      } else if (headings.join("_") == sourceHeadings["EMA Visit Notes - Raw Data"]) {
        Logger.log("EMA Visit Notes - Raw Data")
        processEmaVisitNotesRawData_(rawLogSheet, file, headings, headingsObj, data)

        //EMA EMR - Raw Data
      } else if (headings.join("_") == sourceHeadings["EMA EMR - Raw Data"]) {
        Logger.log("EMA EMR - Raw Data")
        processEmaEMRRawData_(rawLogSheet, file, headings, headingsObj, dataDisp)

      } else if (headings.join("_") == sourceHeadings["AK W/MM - Raw Data"]) {
        Logger.log("AK W/MM - Raw Data")
        processAKWMMRawRawData_(rawLogSheet, file, headings, headingsObj, dataDisp)

      } else if (headings.join("_") == sourceHeadings["AK W/MM Billing - Raw Data"]) {
        Logger.log("AK W/MM Billing - Raw Data")
        processAKWMMBillingRawRawData_(rawLogSheet, file, headings, headingsObj, dataDisp)

      } else if (headings.join("_") == sourceHeadings["Meds Test Report - Raw Data"]) {
        Logger.log("Meds Test Report - Raw Data")
        processMedsTestReports_(rawLogSheet, file, headings, headingsObj, dataDisp)

      } else if (headings.join("_") == sourceHeadings['Paycor 401K - Raw Data']) {
        Logger.log("Paycor 401k - Raw Data")
        processPaycor401KRawData_(rawLogSheet, file, headings, headingsObj, dataDisp)

      } else if (headings.join("_") == sourceHeadings['Medications - Raw Data']) {
        Logger.log("Medications - Raw Data")
        processMedicationsRawData_(rawLogSheet, file, headings, headingsObj, dataDisp)

      } else if (headings.join("_") == sourceHeadings['Patients Demographics - Raw Data']) {
        Logger.log("Patients Demographics - Raw Data")
        processDemographicsRawData_(rawLogSheet, file, headings, headingsObj, dataDisp)

      } else if (headings.join("_") == sourceHeadings['Patient Unallocated Payments - Raw Data']) {
        Logger.log("Patient Unallocated Payments - Raw Data")
        processPatientUnallocatedPaymentsRawData_(rawLogSheet, file, headings, headingsObj, dataDisp)

      } else if (headings[0].includes("Date of Last Contribution Report as of ")) {
        Logger.log("Date of Last Contribution Report as of")
        processLastConstributionRawData_(rawLogSheet, file, headings, headingsObj, dataDisp)

      } else if (dataDisp.length > 6 && dataDisp[6].filter(r => r != "" && r != null).map(r => r.toString().trim()).join("_") == sourceHeadings["401K - Raw Data"]) {
        Logger.log("401k - Raw Data")
        //let dateStr = sourceSheet.getRange('B6').getValue().split("As of: ")[1];
        let dateStrSplit = dataDisp[4][2].split("As of: ")[1].split("/")
        let date401K = new Date(2000 + Number(dateStrSplit[2]), Number(dateStrSplit[0]) - 1, Number(dateStrSplit[1]))

        dataDisp.splice(0, 6)

        let headings = dataDisp.splice(0, 1)[0].map(h => h.toString().trim())
        let headingsObj = {}
        headings.forEach((h, i) => {
          headingsObj[h.toString().trim()] = i
        })


        process401KRawData_(rawLogSheet, file, headings, headingsObj, dataDisp, date401K)


      } else if (dataDisp.length > 9 && dataDisp[9].filter(r => r != "" && r != null).map(r => r.toString().trim()).join("_") == sourceHeadings["Henry Schein Items Purchased Raw Data"]) {

        Logger.log("Henry Schein Items Purchased Raw Data")
        let dateRange = dataDisp[3][0];
        if (dateRange.includes("Date Range: ")) {
          dateRange = dateRange.split("Date Range: ")[1]
        }
        dataDisp.splice(0, 9)

        let headings = dataDisp.splice(0, 1)[0].map(h => h.toString().trim())
        let headingsObj = {}
        headings.forEach((h, i) => {
          headingsObj[h.toString().trim()] = i
        })

        processHenryScheinItemsRawData_(rawLogSheet, file, headings, headingsObj, dataDisp, dateRange)


      } else if (dataDisp.length > 9 && dataDisp[9].filter(r => r != "" && r != null).map(r => r.toString().trim()).join("_") == sourceHeadings["Henry Schein Items Purchased Invoices Raw Data"]) {

        Logger.log("Henry Schein Items Purchased Invoices Raw Data")
        let dateRange = dataDisp[3][0];
        if (dateRange.includes("Date Range: ")) {
          dateRange = dateRange.split("Date Range: ")[1]
        }
        dataDisp.splice(0, 9)

        let headings = dataDisp.splice(0, 1)[0].map(h => h.toString().trim())
        let headingsObj = {}
        headings.forEach((h, i) => {
          headingsObj[h.toString().trim()] = i
        })

        processHenryScheinItemsInvoicesRawData_(rawLogSheet, file, headings, headingsObj, dataDisp, dateRange)


      } else if (dataDisp.length > 3 && dataDisp[3].filter(r => r != "" && r != null).map(r => r.toString().trim()).join("_") == sourceHeadings["Mckesson Order history Raw Data"]) {

        Logger.log("Mckesson Order history Raw Data")
        let dateRange = dataDisp[0][1];

        dataDisp.splice(0, 3)

        let headings = dataDisp.splice(0, 1)[0].map(h => h.toString().trim())
        let headingsObj = {}
        headings.forEach((h, i) => {
          headingsObj[h.toString().trim()] = i
        })

        processMckessonItemsRawData_(rawLogSheet, file, headings, headingsObj, dataDisp, dateRange)


        //New Mckesson Order history Raw Data
      } else if (headings.join("_") == sourceHeadings["New Mckesson Order history Raw Data"]) {
        Logger.log("New Mckesson Order history Raw Data")
        processNewMckessonItemsRawData_(rawLogSheet, file, headings, headingsObj, dataDisp, data)


        //Sams Club Order history Raw Data
      } else if (headings.join("_") == sourceHeadings["Sams Club Order history Raw Data"]) {
        Logger.log("Sams Club Order history Raw Data")
        processSamsClubItemsRawData_(rawLogSheet, file, headings, headingsObj, dataDisp)


      } else if (headings.join("_") == sourceHeadings["Lauren Miller PA from CMM Raw Data"]) {
        Logger.log("Lauren Miller PA from CMM Raw Data")
        processLmPaFromCaaRawData_(rawLogSheet, file, headings, headingsObj, dataDisp)


      } else if (sourceHeadings['Amazon orders Raw Data'] == headings.join("_")) {
        Logger.log("Amazon orders Raw Data")
        processAmazonOrdersRawData_(rawLogSheet, file, headings, headingsObj, dataDisp)

      }

    }
  }


  rawLogSheet.getRange(2, 1, rawLogSheet.getLastRow() - 1, rawLogSheet.getLastColumn()).sort([{ column: 9, ascending: false }])
}


function capitalizeFirstLetter_(val) {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}


const RAW_PatientUnallocatedPayments_FOLDER = "1EPaERRaLT5NmgH3ZtGeI0t_PAVag6Swu"
const RAW_PatientUnallocatedPayments_SS_ID = "1MeUzkKalGwhdqJ3B5usGVrz51kPRoD_6nOxuYzdd4Ew"
function processPatientUnallocatedPaymentsRawData_(rawLogSheet, file, headings, headingsObj, dataDisp) {
  let destSS = SpreadsheetApp.openById(RAW_PatientUnallocatedPayments_SS_ID);
  let destSheet = destSS.getSheetByName("Data");

  // let existingData = destSheet.getRange(1, 1, destSheet.getLastRow(), 6).getDisplayValues()
  //let existingData = destSheet.getRange(1, 1, 1, destSheet.getLastColumn()).getDisplayValues()

  let destHeadings = destSheet.getRange(1, 1, 1, destSheet.getLastColumn()).getDisplayValues()[0]
  let destHeadingsObj = {}
  destHeadings.forEach((h, i) => {
    destHeadingsObj[h.toString().trim()] = i
  })


  let newData = [];
  dataDisp.forEach(d => {

    let rowData = new Array(destHeadings.length).fill("")
    for (const key in destHeadingsObj) {
      if (headingsObj[key] || headingsObj[key] === 0) {
        rowData[destHeadingsObj[key]] = d[headingsObj[key]]
      }
    }

    let newName = d[headingsObj['Patient Name']];
    try {
      let splitName = d[headingsObj['Patient Name']].split(",").map(r => capitalizeFirstLetter_(r.toString().trim())).reverse()
      newName = splitName.join(" ")
    } catch (errr) { }
    rowData[destHeadingsObj['Patient Name']] = newName


    newData.push(rowData)
  })

  if (destSheet.getLastRow() > 1) {
    destSheet.getRange(2, 1, destSheet.getLastRow() - 1, destSheet.getLastColumn()).clearContent()
  }

  if (newData.length > 0) {
    destSheet.getRange(2, 1, newData.length, newData[0].length).setValues(newData);
  }

  let destinationFolder = DriveApp.getFolderById(RAW_PatientUnallocatedPayments_FOLDER);

  let fileName = file.getName()
  let dataSet = "Patient Unallocated Payments Raw Data"

  let startDate = dataDisp[dataDisp.length - 1][headingsObj["Transaction Date"]]
  let endDate = dataDisp[0][headingsObj["Transaction Date"]]

  let updatedName = "Patient Unallocated Payments Raw Data " + startDate + "-" + endDate + " Raw_ " + Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY")
  let link = file.getUrl();
  let dataSpreadsheetName = destSS.getName()
  let timeStamp = Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY HH:mm:ss")
  let rawLogRow = [fileName, dataSet, startDate, endDate, updatedName, link, dataSpreadsheetName, destinationFolder.getName(), timeStamp, newData.length]
  file.setName(updatedName)
  rawLogSheet.getRange(rawLogSheet.getLastRow() + 1, 1, 1, rawLogRow.length).setValues([rawLogRow])

  let destFoldRich = SpreadsheetApp.newRichTextValue().setText(destinationFolder.getName()).setLinkUrl(destinationFolder.getUrl()).build()
  let destSSRich = SpreadsheetApp.newRichTextValue().setText(destSS.getName()).setLinkUrl(destSS.getUrl()).build()
  rawLogSheet.getRange(rawLogSheet.getLastRow(), DEST_FOLDER_COL).setRichTextValue(destFoldRich)
  rawLogSheet.getRange(rawLogSheet.getLastRow(), DEST_SS_COL).setRichTextValue(destSSRich)
  file.moveTo(destinationFolder)


}


const RAW_Demographics_FOLDER = "1u0eHkdQa53nJd51fpzKfl-SsBTfryGx_"
const RAW_Demographics_SS_ID = "1nYzpVskLjQfaSBYbt-y_CZzAJfqLmh37Wqw9FHmvd1c"
function processDemographicsRawData_(rawLogSheet, file, headings, headingsObj, dataDisp) {

  let destSS = SpreadsheetApp.openById(RAW_Demographics_SS_ID);
  let destSheet = destSS.getSheetByName("Patients");

  // let existingData = destSheet.getRange(1, 1, destSheet.getLastRow(), 6).getDisplayValues()
  let existingData = destSheet.getRange(1, 1, 1, destSheet.getLastColumn()).getDisplayValues()

  let destHeadings = existingData.splice(0, 1)[0]
  let destHeadingsObj = {}
  destHeadings.forEach((h, i) => {
    destHeadingsObj[h.toString().trim()] = i
  })


  let newData = [];
  dataDisp.forEach(d => {

    let rowData = new Array(destHeadings.length).fill("")
    for (const key in destHeadingsObj) {
      if (headingsObj[key] || headingsObj[key] === 0) {
        rowData[destHeadingsObj[key]] = d[headingsObj[key]]
      }
    }

    let newName = d[headingsObj['Patient Name']];
    try {
      let splitName = d[headingsObj['Patient Name']].split(",").map(r => r.toString().trim())
      if (splitName.length == 2) {
        newName = splitName[1] + " " + splitName[0]
      }
    } catch (errr) { }
    rowData[destHeadingsObj['Patient Name']] = newName

    let newGuaranterName = d[headingsObj['Guarantor Name']];
    try {
      let splitName = d[headingsObj['Guarantor Name']].split(",").map(r => r.toString().trim())
      if (splitName.length == 2) {
        newGuaranterName = splitName[1] + " " + splitName[0]
      }
    } catch (errr) { }
    rowData[destHeadingsObj['Guarantor Name']] = newGuaranterName


    let providerName = d[headingsObj['Last Primary Provider']];
    try {
      let splitName = d[headingsObj['Last Primary Provider']].split(",").map(r => r.toString().trim())
      if (splitName.length == 2) {
        providerName = splitName[1] + " " + splitName[0]
      }
    } catch (errr) { }
    rowData[destHeadingsObj['Last Primary Provider']] = providerName

    //Southern Skies Dermatology
    if (d[headingsObj['Last Location']] == "Southern Skies Dermatology") {
      rowData[destHeadingsObj['Last Location']] = "Trussville"
    }

    newData.push(rowData)
  })

  if (newData.length > 0) {
    destSheet.getRange(2, 1, newData.length, newData[0].length).setValues(newData);
  }


  let destinationFolder = DriveApp.getFolderById(RAW_Demographics_FOLDER);

  let fileName = file.getName()
  let dataSet = "Patients Demographics Raw Data"


  let startDate = Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY")
  let endDate = Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY")


  let updatedName = "Patients Demographics Raw Data " + startDate + "-" + endDate + " Raw_ " + Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY")
  let link = file.getUrl();
  let dataSpreadsheetName = destSS.getName()
  let timeStamp = Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY HH:mm:ss")
  let rawLogRow = [fileName, dataSet, startDate, endDate, updatedName, link, dataSpreadsheetName, destinationFolder.getName(), timeStamp, newData.length]
  file.setName(updatedName)
  rawLogSheet.getRange(rawLogSheet.getLastRow() + 1, 1, 1, rawLogRow.length).setValues([rawLogRow])

  let destFoldRich = SpreadsheetApp.newRichTextValue().setText(destinationFolder.getName()).setLinkUrl(destinationFolder.getUrl()).build()
  let destSSRich = SpreadsheetApp.newRichTextValue().setText(destSS.getName()).setLinkUrl(destSS.getUrl()).build()

  rawLogSheet.getRange(rawLogSheet.getLastRow(), DEST_FOLDER_COL).setRichTextValue(destFoldRich)
  rawLogSheet.getRange(rawLogSheet.getLastRow(), DEST_SS_COL).setRichTextValue(destSSRich)

  file.moveTo(destinationFolder)


}





const RAW_Medications_FOLDER = "17p74jc2A-56UVwtJNg77so53Q9ZWzyZy"
const RAW_Medications_SS_ID = "10Jv130Ec0qExUvwkL_kR6BuUxBa0-IGtgyAHOQ4fUWM"
function processMedicationsRawData_(rawLogSheet, file, headings, headingsObj, dataDisp) {

  let destSS = SpreadsheetApp.openById(RAW_Medications_SS_ID);
  let destSheet = destSS.getSheetByName("Data");

  // let existingData = destSheet.getRange(1, 1, destSheet.getLastRow(), 6).getDisplayValues()
  let existingData = destSheet.getRange(1, 1, 1, destSheet.getLastColumn()).getDisplayValues()

  let destHeadings = existingData.splice(0, 1)[0]
  let destHeadingsObj = {}
  destHeadings.forEach((h, i) => {
    destHeadingsObj[h.toString().trim()] = i
  })


  let newData = [];
  dataDisp.forEach(d => {

    let rowData = new Array(destHeadings.length).fill("")
    for (const key in destHeadingsObj) {
      if (headingsObj[key] || headingsObj[key] === 0) {
        rowData[destHeadingsObj[key]] = d[headingsObj[key]]
      }
    }
    newData.push(rowData)
  })

  if (newData.length > 0) {
    destSheet.getRange(2, 1, newData.length, newData[0].length).setValues(newData);
  }


  let destinationFolder = DriveApp.getFolderById(RAW_Medications_FOLDER);

  let fileName = file.getName()
  let dataSet = "Medications Raw Data"


  let startDate = dataDisp[dataDisp.length - 1][headingsObj["Written On Date"]]
  let endDate = dataDisp[0][headingsObj["Written On Date"]]


  let updatedName = "Medications Raw Data " + startDate + "-" + endDate + " Raw_ " + Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY")
  let link = file.getUrl();
  let dataSpreadsheetName = destSS.getName()
  let timeStamp = Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY HH:mm:ss")
  let rawLogRow = [fileName, dataSet, startDate, endDate, updatedName, link, dataSpreadsheetName, destinationFolder.getName(), timeStamp, newData.length]
  file.setName(updatedName)
  rawLogSheet.getRange(rawLogSheet.getLastRow() + 1, 1, 1, rawLogRow.length).setValues([rawLogRow])

  let destFoldRich = SpreadsheetApp.newRichTextValue().setText(destinationFolder.getName()).setLinkUrl(destinationFolder.getUrl()).build()
  let destSSRich = SpreadsheetApp.newRichTextValue().setText(destSS.getName()).setLinkUrl(destSS.getUrl()).build()

  rawLogSheet.getRange(rawLogSheet.getLastRow(), DEST_FOLDER_COL).setRichTextValue(destFoldRich)
  rawLogSheet.getRange(rawLogSheet.getLastRow(), DEST_SS_COL).setRichTextValue(destSSRich)

  file.moveTo(destinationFolder)


}



const RAW_LM_PA_CAA_FOLDER = "1SuQkiYrokXXndknDaK_swRghIaj_rFYX"
const RAW_LM_PA_CAA_SS_ID = "1SH-CqnC7z4T9lx-Qc0wh8UI0YWhKZL4M4L0PBPS0Diw"
function processLmPaFromCaaRawData_(rawLogSheet, file, headings, headingsObj, data) {

  let destSS = SpreadsheetApp.openById(RAW_LM_PA_CAA_SS_ID);
  let destSheet = destSS.getSheetByName("Data");

  // let existingData = destSheet.getRange(1, 1, destSheet.getLastRow(), 6).getDisplayValues()
  let existingData = destSheet.getRange(1, 1, destSheet.getLastRow(), destSheet.getLastColumn()).getDisplayValues()

  let destHeadings = existingData.splice(0, 1)[0]
  let destHeadingsObj = {}
  destHeadings.forEach((h, i) => {
    destHeadingsObj[h.toString().trim()] = i
  })


  let newData = [];
  data.forEach(d => {

    let rowData = new Array(destHeadings.length).fill("")
    for (const key in destHeadingsObj) {
      if (headingsObj[key] || headingsObj[key] === 0) {
        rowData[destHeadingsObj[key]] = d[headingsObj[key]]
      }
    }

    newData.push(rowData)

  })

  if (newData.length > 0) {
    destSheet.getRange(2, 1, newData.length, newData[0].length).setValues(newData);
  }


  let destinationFolder = DriveApp.getFolderById(RAW_LM_PA_CAA_FOLDER);

  let fileName = file.getName()
  let dataSet = "Lauren Miller PA from CMM Raw Data"


  let startDate = new Date().toLocaleDateString()
  let endDate = new Date().toLocaleDateString()


  let updatedName = "Lauren Miller PA from CMM Raw Data " + startDate + "-" + endDate + " Raw_ " + Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY")
  let link = file.getUrl();
  let dataSpreadsheetName = destSS.getName()
  let timeStamp = Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY HH:mm:ss")

  let rawLogRow = [fileName, dataSet, startDate, endDate, updatedName, link, dataSpreadsheetName, destinationFolder.getName(), timeStamp, newData.length]

  file.setName(updatedName)

  rawLogSheet.getRange(rawLogSheet.getLastRow() + 1, 1, 1, rawLogRow.length).setValues([rawLogRow])


  let destFoldRich = SpreadsheetApp.newRichTextValue().setText(destinationFolder.getName()).setLinkUrl(destinationFolder.getUrl()).build()
  let destSSRich = SpreadsheetApp.newRichTextValue().setText(destSS.getName()).setLinkUrl(destSS.getUrl()).build()

  rawLogSheet.getRange(rawLogSheet.getLastRow(), DEST_FOLDER_COL).setRichTextValue(destFoldRich)
  rawLogSheet.getRange(rawLogSheet.getLastRow(), DEST_SS_COL).setRichTextValue(destSSRich)

  file.moveTo(destinationFolder)
}





const RAW_AMAZON_ORDOR_FOLDER = "1MKvWZKSOB4lkLJPLtK-mwqGyRKN6Y7ic"
const RAW_AMAZON_ORDOR_SS_ID = "15VtJCJsqjx1i6Q3yPAmXkoHw5-MO348aDlZZOdPKoKU"

function processAmazonOrdersRawData_(rawLogSheet, file, headings, headingsObj, data) {

  let destSS = SpreadsheetApp.openById(RAW_AMAZON_ORDOR_SS_ID);
  let destSheet = destSS.getSheetByName("Data");

  // let existingData = destSheet.getRange(1, 1, destSheet.getLastRow(), 8).getDisplayValues()
  let existingData = destSheet.getRange(1, 1, destSheet.getLastRow(), 10).getDisplayValues()

  let destHeadings = existingData.splice(0, 1)[0].map(h => h.toString().trim())
  let destHeadingsObj = {}
  destHeadings.forEach((h, i) => {
    destHeadingsObj[h.toString().trim()] = i
  })

  let existingIds = existingData.map(r => r[0])

  let newData = [];
  data.forEach(d => {

    // let id = d[headingsObj[destHeadings[1]]] + "_" + d[headingsObj[destHeadings[2]]] + "_" + d[headingsObj[destHeadings[3]]] + "_" + d[headingsObj[destHeadings[4]]] + "_" + d[headingsObj[destHeadings[5]]] + "_" + d[headingsObj[destHeadings[6]]] + "_" + d[headingsObj[destHeadings[7]]];

    let id = d[headingsObj[destHeadings[1]]] + "_" + d[headingsObj[destHeadings[2]]] + "_" + d[headingsObj[destHeadings[3]]] + "_" + d[headingsObj[destHeadings[4]]] + "_" + d[headingsObj[destHeadings[5]]] + "_" + d[headingsObj[destHeadings[6]]] + "_" + d[headingsObj[destHeadings[7]]] + "_" + d[headingsObj[destHeadings[8]]];

    let indexOfId = existingIds.indexOf(id)

    if (indexOfId == -1) {

      let rowData = new Array(destHeadings.length).fill("")
      for (const key in destHeadingsObj) {
        if (headingsObj[key] || headingsObj[key] === 0) {
          rowData[destHeadingsObj[key]] = d[headingsObj[key]]
        }
      }

      let link = "https://www.amazon.com/s?k=" + (rowData[destHeadingsObj["Title"]].replace(/ /g, "+"));

      rowData[destHeadingsObj["ID"]] = id
      rowData[destHeadingsObj["LINK"]] = link
      newData.push(rowData)

      //existingIds.push(id)

    }

  })

  if (newData.length > 0) {
    destSheet.getRange(destSheet.getLastRow() + 1, 1, newData.length, newData[0].length).setValues(newData);
  }


  let destinationFolder = DriveApp.getFolderById(RAW_AMAZON_ORDOR_FOLDER);

  let fileName = file.getName()
  let dataSet = "Amazon orders Raw Data"


  let endDate = data[0][headingsObj["Order Date"]]
  let startDate = data[data.length - 1][headingsObj["Order Date"]]


  let updatedName = "Amazon orders Raw Data " + startDate + " - " + endDate + " Raw_ " + Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY")
  let link = file.getUrl();
  let dataSpreadsheetName = destSS.getName()
  let timeStamp = Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY HH:mm:ss")

  let rawLogRow = [fileName, dataSet, startDate, endDate, updatedName, link, dataSpreadsheetName, destinationFolder.getName(), timeStamp, newData.length]

  file.setName(updatedName)

  rawLogSheet.getRange(rawLogSheet.getLastRow() + 1, 1, 1, rawLogRow.length).setValues([rawLogRow])


  let destFoldRich = SpreadsheetApp.newRichTextValue().setText(destinationFolder.getName()).setLinkUrl(destinationFolder.getUrl()).build()
  let destSSRich = SpreadsheetApp.newRichTextValue().setText(destSS.getName()).setLinkUrl(destSS.getUrl()).build()

  rawLogSheet.getRange(rawLogSheet.getLastRow(), DEST_FOLDER_COL).setRichTextValue(destFoldRich)
  rawLogSheet.getRange(rawLogSheet.getLastRow(), DEST_SS_COL).setRichTextValue(destSSRich)

  file.moveTo(destinationFolder)
}








const RAW_SAMS_CLUB_FOLDER = "1CDtm6PxJWoHlehiY6ZGkvldtUy1mY2OX"
const RAW_SAMS_CLUB_SS_ID = "1ycfBw6dQ-9aQxL0tHnhy-r5SRqWaFYPLfMrAhleJ0sw"

function processSamsClubItemsRawData_(rawLogSheet, file, headings, headingsObj, data) {

  let destSS = SpreadsheetApp.openById(RAW_SAMS_CLUB_SS_ID);
  let destSheet = destSS.getSheetByName("Data");

  // let existingData = destSheet.getRange(1, 1, destSheet.getLastRow(), 6).getDisplayValues()
  let existingData = destSheet.getRange(1, 1, destSheet.getLastRow(), destSheet.getLastColumn()).getDisplayValues()

  let destHeadings = existingData.splice(0, 1)[0]
  let destHeadingsObj = {}
  destHeadings.forEach((h, i) => {
    destHeadingsObj[h.toString().trim()] = i
  })

  let existingIds = existingData.map(r => r[0])

  let newData = [];
  data.forEach(d => {

    let id = d[headingsObj[destHeadings[1]]] + "_" + d[headingsObj[destHeadings[2]]] + "_" + d[headingsObj[destHeadings[3]]] + "_" + d[headingsObj[destHeadings[4]]] + "_" + d[headingsObj[destHeadings[5]]] + "_" + d[headingsObj[destHeadings[6]]]

    let indexOfId = existingIds.indexOf(id)

    if (indexOfId == -1) {

      let rowData = new Array(destHeadings.length).fill("")
      for (const key in destHeadingsObj) {
        if (headingsObj[key] || headingsObj[key] === 0) {
          rowData[destHeadingsObj[key]] = d[headingsObj[key]]
        }
      }

      rowData[destHeadingsObj["ID"]] = id
      newData.push(rowData)

      existingIds.push(id)

    }

  })

  if (newData.length > 0) {
    destSheet.getRange(destSheet.getLastRow() + 1, 1, newData.length, newData[0].length).setValues(newData);
  }


  let destinationFolder = DriveApp.getFolderById(RAW_SAMS_CLUB_FOLDER);

  let fileName = file.getName()
  let dataSet = "Sams Club Order history Raw Data"


  let startDate = data[data.length - 1][headingsObj['Order Date']]
  let endDate = data[0][headingsObj['Order Date']]


  let updatedName = "Sams Club Order history Raw Data " + startDate + "-" + endDate + " Raw_ " + Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY")
  let link = file.getUrl();
  let dataSpreadsheetName = destSS.getName()
  let timeStamp = Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY HH:mm:ss")

  let rawLogRow = [fileName, dataSet, startDate, endDate, updatedName, link, dataSpreadsheetName, destinationFolder.getName(), timeStamp, newData.length]

  file.setName(updatedName)

  rawLogSheet.getRange(rawLogSheet.getLastRow() + 1, 1, 1, rawLogRow.length).setValues([rawLogRow])


  let destFoldRich = SpreadsheetApp.newRichTextValue().setText(destinationFolder.getName()).setLinkUrl(destinationFolder.getUrl()).build()
  let destSSRich = SpreadsheetApp.newRichTextValue().setText(destSS.getName()).setLinkUrl(destSS.getUrl()).build()

  rawLogSheet.getRange(rawLogSheet.getLastRow(), DEST_FOLDER_COL).setRichTextValue(destFoldRich)
  rawLogSheet.getRange(rawLogSheet.getLastRow(), DEST_SS_COL).setRichTextValue(destSSRich)

  file.moveTo(destinationFolder)
}








const RAW_NEW_Mckesson_FOLDER = "1jQCndKox_ZI5aeTWLzUgAhNeJ7vUbrJc"
const RAW_NEW_Mckesson_SS_ID = "1pE_SNiu5HCP0iPuInydBjRy7-h5JKbmTN-N75SKWkYk"

function processNewMckessonItemsRawData_(rawLogSheet, file, headings, headingsObj, data, dataV) {

  let destSS = SpreadsheetApp.openById(RAW_NEW_Mckesson_SS_ID);
  let destSheet = destSS.getSheetByName("Data");

  // let existingData = destSheet.getRange(1, 1, destSheet.getLastRow(), 6).getDisplayValues()
  let existingData = destSheet.getRange(1, 1, destSheet.getLastRow(), destSheet.getLastColumn()).getDisplayValues()

  let destHeadings = existingData.splice(0, 1)[0]
  let destHeadingsObj = {}
  destHeadings.forEach((h, i) => {
    destHeadingsObj[h.toString().trim()] = i
  })

  let existingIds = existingData.map(r => r[0])

  let newData = [];
  data.forEach((d, i) => {

    let id = d[headingsObj[destHeadings[1]]] + "_" + d[headingsObj[destHeadings[2]]] + "_" + d[headingsObj[destHeadings[3]]] + "_" + d[headingsObj[destHeadings[4]]] + "_" + d[headingsObj[destHeadings[5]]] + "_" + d[headingsObj[destHeadings[6]]] + "_" + d[headingsObj[destHeadings[7]]] + "_" + d[headingsObj[destHeadings[8]]] + "_" + d[headingsObj[destHeadings[9]]]

    let indexOfId = existingIds.indexOf(id)

    if (indexOfId == -1 && dataV[i][headingsObj["Subtotal"]] != "" && dataV[i][headingsObj["Subtotal"]] != 0) {

      let rowData = new Array(destHeadings.length).fill("")
      for (const key in destHeadingsObj) {
        if (headingsObj[key] || headingsObj[key] === 0) {
          rowData[destHeadingsObj[key]] = d[headingsObj[key]]
        }
      }

      rowData[destHeadingsObj["ID"]] = id
      newData.push(rowData)

      existingIds.push(id)

    }

  })


  if (newData.length > 0) {
    destSheet.getRange(destSheet.getLastRow() + 1, 1, newData.length, newData[0].length).setValues(newData);
  }



  dataV = dataV.filter(r => r[headingsObj["Order Date"]] != "")
  // dataV.sort(function (a, b) {
  //   return a[headingsObj["Order Date"]] - b[headingsObj["Order Date"]];
  // });




  let destinationFolder = DriveApp.getFolderById(RAW_NEW_Mckesson_FOLDER);

  let fileName = file.getName()
  let dataSet = "New Mckesson Order history Raw Data"


  let startDate = dataV[0][headingsObj["Order Date"]]
  let endDate = dataV[dataV.length - 1][headingsObj["Order Date"]]


  let updatedName = "New Mckesson Order history Raw Data " + startDate + "-" + endDate + " Raw_ " + Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY")
  let link = file.getUrl();
  let dataSpreadsheetName = destSS.getName()
  let timeStamp = Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY HH:mm:ss")

  let rawLogRow = [fileName, dataSet, startDate, endDate, updatedName, link, dataSpreadsheetName, destinationFolder.getName(), timeStamp, newData.length]

  file.setName(updatedName)

  rawLogSheet.getRange(rawLogSheet.getLastRow() + 1, 1, 1, rawLogRow.length).setValues([rawLogRow])


  let destFoldRich = SpreadsheetApp.newRichTextValue().setText(destinationFolder.getName()).setLinkUrl(destinationFolder.getUrl()).build()
  let destSSRich = SpreadsheetApp.newRichTextValue().setText(destSS.getName()).setLinkUrl(destSS.getUrl()).build()

  rawLogSheet.getRange(rawLogSheet.getLastRow(), DEST_FOLDER_COL).setRichTextValue(destFoldRich)
  rawLogSheet.getRange(rawLogSheet.getLastRow(), DEST_SS_COL).setRichTextValue(destSSRich)

  file.moveTo(destinationFolder)
}






const RAW_Mckesson_FOLDER = "1jQCndKox_ZI5aeTWLzUgAhNeJ7vUbrJc"
const RAW_Mckesson_SS_ID = "1Uitdi4ZwWO-RHWThWpnjAT0luzNozpwfyae-2tVMtNI"

function processMckessonItemsRawData_(rawLogSheet, file, headings, headingsObj, data, dateRange) {

  let destSS = SpreadsheetApp.openById(RAW_Mckesson_SS_ID);
  let destSheet = destSS.getSheetByName("Data");

  // let existingData = destSheet.getRange(1, 1, destSheet.getLastRow(), 6).getDisplayValues()
  let existingData = destSheet.getRange(1, 1, destSheet.getLastRow(), 7).getDisplayValues()

  let destHeadings = existingData.splice(0, 1)[0]
  let destHeadingsObj = {}
  destHeadings.forEach((h, i) => {
    destHeadingsObj[h.toString().trim()] = i
  })

  let existingIds = existingData.map(r => r[0])

  let newData = [];
  data.forEach(d => {

    let id = d[headingsObj[destHeadings[1]]] + "_" + d[headingsObj[destHeadings[2]]] + "_" + d[headingsObj[destHeadings[3]]] + "_" + d[headingsObj[destHeadings[4]]] + "_" + d[headingsObj[destHeadings[5]]]

    let indexOfId = existingIds.indexOf(id)

    if (indexOfId == -1) {

      let rowData = new Array(destHeadings.length).fill("")
      for (const key in destHeadingsObj) {
        if (headingsObj[key] || headingsObj[key] === 0) {
          rowData[destHeadingsObj[key]] = d[headingsObj[key]]
        }
      }

      rowData[destHeadingsObj["ID"]] = id
      newData.push(rowData)

      existingIds.push(id)

    }

  })

  if (newData.length > 0) {
    destSheet.getRange(destSheet.getLastRow() + 1, 1, newData.length, newData[0].length).setValues(newData);
  }


  let destinationFolder = DriveApp.getFolderById(RAW_Mckesson_FOLDER);

  let fileName = file.getName()
  let dataSet = "Mckesson Order history Raw Data"


  let startDate = dateRange
  let endDate = dateRange


  let updatedName = "Mckesson Order history Raw Data " + dateRange + " Raw_ " + Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY")
  let link = file.getUrl();
  let dataSpreadsheetName = destSS.getName()
  let timeStamp = Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY HH:mm:ss")

  let rawLogRow = [fileName, dataSet, startDate, endDate, updatedName, link, dataSpreadsheetName, destinationFolder.getName(), timeStamp, newData.length]

  file.setName(updatedName)

  rawLogSheet.getRange(rawLogSheet.getLastRow() + 1, 1, 1, rawLogRow.length).setValues([rawLogRow])


  let destFoldRich = SpreadsheetApp.newRichTextValue().setText(destinationFolder.getName()).setLinkUrl(destinationFolder.getUrl()).build()
  let destSSRich = SpreadsheetApp.newRichTextValue().setText(destSS.getName()).setLinkUrl(destSS.getUrl()).build()

  rawLogSheet.getRange(rawLogSheet.getLastRow(), DEST_FOLDER_COL).setRichTextValue(destFoldRich)
  rawLogSheet.getRange(rawLogSheet.getLastRow(), DEST_SS_COL).setRichTextValue(destSSRich)

  file.moveTo(destinationFolder)
}




function processHenryScheinItemsInvoicesRawData_(rawLogSheet, file, headings, headingsObj, data, dateRange) {

  let destSS = SpreadsheetApp.openById(RAW_HENRY_SCHEIN_SS_ID);
  let destSheet = destSS.getSheetByName("Data Invoices");
  let existingData = destSheet.getRange(1, 1, destSheet.getLastRow(), 5).getDisplayValues()

  let destHeadings = existingData.splice(0, 1)[0]
  let destHeadingsObj = {}
  destHeadings.forEach((h, i) => {
    destHeadingsObj[h.toString().trim()] = i
  })

  let existingIds = existingData.map(r => r[0])

  let newData = [];
  data.forEach(d => {

    let id = d[headingsObj[destHeadings[1]]] + "_" + d[headingsObj[destHeadings[2]]] + "_" + d[headingsObj[destHeadings[3]]] + "_" + d[headingsObj[destHeadings[4]]]

    let indexOfId = existingIds.indexOf(id)

    if (indexOfId == -1) {

      let rowData = new Array(destHeadings.length).fill("")
      for (const key in destHeadingsObj) {
        if (headingsObj[key] || headingsObj[key] === 0) {
          rowData[destHeadingsObj[key]] = d[headingsObj[key]]
        }
      }

      rowData[destHeadingsObj["ID"]] = id
      newData.push(rowData)

      existingIds.push(id)

    }

  })

  if (newData.length > 0) {
    destSheet.getRange(destSheet.getLastRow() + 1, 1, newData.length, newData[0].length).setValues(newData);
  }


  let destinationFolder = DriveApp.getFolderById(RAW_HENRY_SCHEIN_FOLDER);

  let fileName = file.getName()
  let dataSet = "Henry Schein Items Purchased Invoices Raw Data"


  let startDate = ""
  let endDate = ""

  if (dateRange.includes("-")) {
    startDate = dateRange.split("-")[0].toString().trim()
    endDate = dateRange.split("-")[1].toString().trim()
  }
  let updatedName = "Henry Schein Items Purchased Invoices Raw Data " + dateRange + " Raw_ " + Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY")
  let link = file.getUrl();
  let dataSpreadsheetName = destSS.getName()
  let timeStamp = Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY HH:mm:ss")

  let rawLogRow = [fileName, dataSet, startDate, endDate, updatedName, link, dataSpreadsheetName, destinationFolder.getName(), timeStamp, newData.length]

  file.setName(updatedName)

  rawLogSheet.getRange(rawLogSheet.getLastRow() + 1, 1, 1, rawLogRow.length).setValues([rawLogRow])


  let destFoldRich = SpreadsheetApp.newRichTextValue().setText(destinationFolder.getName()).setLinkUrl(destinationFolder.getUrl()).build()
  let destSSRich = SpreadsheetApp.newRichTextValue().setText(destSS.getName()).setLinkUrl(destSS.getUrl()).build()

  rawLogSheet.getRange(rawLogSheet.getLastRow(), DEST_FOLDER_COL).setRichTextValue(destFoldRich)
  rawLogSheet.getRange(rawLogSheet.getLastRow(), DEST_SS_COL).setRichTextValue(destSSRich)

  file.moveTo(destinationFolder)
}




const RAW_HENRY_SCHEIN_FOLDER = "1FJGsoFOLI7xKMF_HVs7hQplf5iARmShC"
const RAW_HENRY_SCHEIN_SS_ID = "13HohuyQ4eOt4GtMXlv34Bu5qkH93E6rS_1EodN8Z-0A"

function processHenryScheinItemsRawData_(rawLogSheet, file, headings, headingsObj, data, dateRange) {

  let destSS = SpreadsheetApp.openById(RAW_HENRY_SCHEIN_SS_ID);
  let destSheet = destSS.getSheetByName("Data");

  // let existingData = destSheet.getRange(1, 1, destSheet.getLastRow(), 7).getDisplayValues()
  let existingData = destSheet.getRange(1, 1, destSheet.getLastRow(), 8).getDisplayValues()

  let destHeadings = existingData.splice(0, 1)[0]
  let destHeadingsObj = {}
  destHeadings.forEach((h, i) => {
    destHeadingsObj[h.toString().trim()] = i
  })

  let existingIds = existingData.map(r => r[0])

  let newData = [];
  data.forEach(d => {

    let id = d[headingsObj[destHeadings[1]]] + "_" + d[headingsObj[destHeadings[2]]] + "_" + d[headingsObj[destHeadings[3]]] + "_" + d[headingsObj[destHeadings[4]]] + "_" + d[headingsObj[destHeadings[5]]] + "_" + d[headingsObj[destHeadings[6]]]

    let indexOfId = existingIds.indexOf(id)

    if (indexOfId == -1) {

      let rowData = new Array(destHeadings.length).fill("")
      for (const key in destHeadingsObj) {
        if (headingsObj[key] || headingsObj[key] === 0) {
          rowData[destHeadingsObj[key]] = d[headingsObj[key]]
        }
      }

      rowData[destHeadingsObj["ID"]] = id
      newData.push(rowData)

      existingIds.push(id)

    }

  })

  if (newData.length > 0) {
    destSheet.getRange(destSheet.getLastRow() + 1, 1, newData.length, newData[0].length).setValues(newData);
  }


  let destinationFolder = DriveApp.getFolderById(RAW_HENRY_SCHEIN_FOLDER);

  let fileName = file.getName()
  let dataSet = "Henry Schein Items Purchased Raw Data"


  let startDate = ""
  let endDate = ""

  if (dateRange.includes("-")) {
    startDate = dateRange.split("-")[0].toString().trim()
    endDate = dateRange.split("-")[1].toString().trim()
  }
  let updatedName = "Henry Schein Items Purchased Raw Data " + dateRange + " Raw_ " + Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY")
  let link = file.getUrl();
  let dataSpreadsheetName = destSS.getName()
  let timeStamp = Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY HH:mm:ss")

  let rawLogRow = [fileName, dataSet, startDate, endDate, updatedName, link, dataSpreadsheetName, destinationFolder.getName(), timeStamp, newData.length]

  file.setName(updatedName)

  rawLogSheet.getRange(rawLogSheet.getLastRow() + 1, 1, 1, rawLogRow.length).setValues([rawLogRow])


  let destFoldRich = SpreadsheetApp.newRichTextValue().setText(destinationFolder.getName()).setLinkUrl(destinationFolder.getUrl()).build()
  let destSSRich = SpreadsheetApp.newRichTextValue().setText(destSS.getName()).setLinkUrl(destSS.getUrl()).build()

  rawLogSheet.getRange(rawLogSheet.getLastRow(), DEST_FOLDER_COL).setRichTextValue(destFoldRich)
  rawLogSheet.getRange(rawLogSheet.getLastRow(), DEST_SS_COL).setRichTextValue(destSSRich)

  file.moveTo(destinationFolder)
}








const RAW_LAST_CONTRIBUTION_FOLDER = "1rHaKio-NMo9oB4_7EjCTyq6xTmplw-q5"
const RAW_LAST_CONTRIBUTION_SS_ID = "1v6IM69sNS7mFsW4-74qn4wvIsmP6QDBT45gNPnNDaS0"
function processLastConstributionRawData_(rawLogSheet, file, headings, headingsObj, data) {

  let destSS = SpreadsheetApp.openById(RAW_LAST_CONTRIBUTION_SS_ID);
  let destSheet = destSS.getSheetByName("Data");
  let allData = destSheet.getRange(1, 1, destSheet.getLastRow(), destSheet.getLastColumn()).getValues()
  let allNames = allData.map(r => r[0])

  data.forEach(rowData => {
    if (rowData[0] != "" && rowData[0] != "Plan Number" && rowData[5] != "") {

      let newName = rowData[1];
      try {
        let splitName = rowData[1].split(",").map(r => r.toString().trim())

        if (splitName.length == 2) {
          newName = splitName[1] + " " + splitName[0]
        }
      } catch (errr) { }

      let nameIndex = allNames.indexOf(rowData[1]);

      if (nameIndex > -1) {
        allData[nameIndex] = [newName, rowData[5], rowData[4], rowData[6]]
      } else {
        allData.push([newName, rowData[5], rowData[4], rowData[6]])

        allNames.push(newName)
      }
    }
  })

  destSheet.getRange(1, 1, allData.length, allData[0].length).setValues(allData);
  if (destSheet.getLastRow() > 1) {
    destSheet.getRange(2, 1, destSheet.getLastRow() - 1, destSheet.getLastColumn()).sort([{ column: 2, ascending: false }])
  }


  let destinationFolder = DriveApp.getFolderById(RAW_LAST_CONTRIBUTION_FOLDER);

  let fileName = file.getName()
  let dataSet = "VOYA 401K Last Contribution Data"


  let endDate = "";
  let startDate = "";
  try {
    endDate = Utilities.formatDate(new Date(headings[0].split("Date of Last Contribution Report as of")[1].trim()), Session.getScriptTimeZone(), "M/d/yyyy")
    let startDateTemp = new Date(headings[0].split("Date of Last Contribution Report as of")[1].trim())
    startDate = Utilities.formatDate(new Date(startDateTemp.setDate(startDateTemp.getDate() - 30)), Session.getScriptTimeZone(), "M/d/yyyy")

  } catch (error) { }

  //let startDate = data[0][headingsObj["Check Date"]]
  //let endDate = data[data.length - 1][headingsObj["Check Date"]]
  let updatedName = "Last Contribution " + startDate + "-" + endDate + " Raw_ " + Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY")
  let link = file.getUrl();
  let dataSpreadsheetName = destSS.getName()
  let timeStamp = Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY HH:mm:ss")

  let rawLogRow = [fileName, dataSet, startDate, endDate, updatedName, link, dataSpreadsheetName, destinationFolder.getName(), timeStamp, allData.length]

  file.setName(updatedName)

  rawLogSheet.getRange(rawLogSheet.getLastRow() + 1, 1, 1, rawLogRow.length).setValues([rawLogRow])


  let destFoldRich = SpreadsheetApp.newRichTextValue().setText(destinationFolder.getName()).setLinkUrl(destinationFolder.getUrl()).build()
  let destSSRich = SpreadsheetApp.newRichTextValue().setText(destSS.getName()).setLinkUrl(destSS.getUrl()).build()


  rawLogSheet.getRange(rawLogSheet.getLastRow(), DEST_FOLDER_COL).setRichTextValue(destFoldRich)
  rawLogSheet.getRange(rawLogSheet.getLastRow(), DEST_SS_COL).setRichTextValue(destSSRich)


  file.moveTo(destinationFolder)



}


const RAW_PAYCOR_401K_FOLDER = "1GYfEZ5CtfK-IW6tkJJzVzQ7j3e0yLCnN"
const RAW_PAYCOR_401K_SS_ID = "1D0ezxqhCJ8Im9tfc7eDPu0owYsydNhKKTBav2wk-wis"
function processPaycor401KRawData_(rawLogSheet, file, headings, headingsObj, data) {
  let destSS = SpreadsheetApp.openById(RAW_PAYCOR_401K_SS_ID);
  let destSheet = destSS.getSheetByName("Data");



  let destHeadings = destSheet.getRange(1, 1, 1, destSheet.getLastColumn()).getDisplayValues()[0]
  let destHeadingsObj = {}
  destHeadings.forEach((h, i) => {
    destHeadingsObj[h.toString().trim()] = i
  })

  let newData = [];

  data.forEach(d => {
    if (d[headingsObj['401k Amount']] != "") {
      let rowData = new Array(destHeadings.length).fill("")
      for (const key in destHeadingsObj) {
        if (headingsObj[key] || headingsObj[key] === 0) {
          rowData[destHeadingsObj[key]] = d[headingsObj[key]]
        }
      }


      let newName = d[headingsObj['Full Name']];
      try {
        let splitName = d[headingsObj['Full Name']].split(",").map(r => r.toString().trim())

        if (splitName.length == 2) {
          newName = splitName[1] + " " + splitName[0]
        }
      } catch (errr) { }

      rowData[destHeadingsObj['Full Name']] = newName

      newData.push(rowData)
    }
  })


  //let targetSheet = ss.getSheetByName(DATA_401K_SHEET)


  // Write the output data to the target sheet starting from A1
  destSheet.getRange(destSheet.getLastRow() + 1, 1, newData.length, newData[0].length).setValues(newData);
  //destSheet.getRange(2, 1, destSheet.getLastRow() - 1, destSheet.getLastColumn()).sort([{ column: 2, ascending: false }])




  let destinationFolder = DriveApp.getFolderById(RAW_PAYCOR_401K_FOLDER);

  let fileName = file.getName()
  let dataSet = "Paycor 401K Data"


  let startDate = data[0][headingsObj["Check Date"]]
  let endDate = data[data.length - 1][headingsObj["Check Date"]]
  let updatedName = "Paycor 401K " + startDate + "-" + endDate + " Raw_ " + Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY")
  let link = file.getUrl();
  let dataSpreadsheetName = destSS.getName()
  let timeStamp = Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY HH:mm:ss")

  let rawLogRow = [fileName, dataSet, startDate, endDate, updatedName, link, dataSpreadsheetName, destinationFolder.getName(), timeStamp, newData.length]

  file.setName(updatedName)

  rawLogSheet.getRange(rawLogSheet.getLastRow() + 1, 1, 1, rawLogRow.length).setValues([rawLogRow])


  let destFoldRich = SpreadsheetApp.newRichTextValue().setText(destinationFolder.getName()).setLinkUrl(destinationFolder.getUrl()).build()
  let destSSRich = SpreadsheetApp.newRichTextValue().setText(destSS.getName()).setLinkUrl(destSS.getUrl()).build()


  rawLogSheet.getRange(rawLogSheet.getLastRow(), DEST_FOLDER_COL).setRichTextValue(destFoldRich)
  rawLogSheet.getRange(rawLogSheet.getLastRow(), DEST_SS_COL).setRichTextValue(destSSRich)


  file.moveTo(destinationFolder)
}






const MEDS_TEST_REPORT_DESTINAION = "1oNrtIj05TiwSjdv5h8sw25ONhjGSD6yh"
const MEDS_TEST_REPORT_SS_ID = "1vhTfIIBBMgzmByEQ_WbMWp-pGRx0H6Ed6O4i3ulunqg"
function processMedsTestReports_(rawLogSheet, file, headings, headingsObj, data) {

  let destSS = SpreadsheetApp.openById(MEDS_TEST_REPORT_SS_ID);
  let destSheet = destSS.getSheetByName("Data");


  let destHeadings = destSheet.getRange(1, 1, 1, destSheet.getLastColumn()).getDisplayValues()[0].map(h => h.toString().trim())
  let destHeadingsObj = {}
  destHeadings.forEach((h, i) => {
    destHeadingsObj[h.toString().trim()] = i
  })

  const allExistIds = destSheet.getRange(1, destHeadingsObj["ID"] + 1, destSheet.getLastRow(), 1).getDisplayValues().map(r => r[0])

  //let existingIds = existingData.map(r => r[0])

  let newData = [];
  data.forEach(d => {

    let id = d[headingsObj[destHeadings[1]]] + "_" + d[headingsObj[destHeadings[2]]] + "_" + d[headingsObj[destHeadings[3]]] + "_" + d[headingsObj[destHeadings[4]]] + "_" + d[headingsObj[destHeadings[5]]] + "_" + d[headingsObj[destHeadings[6]]] + "_" + d[headingsObj[destHeadings[7]]] + "_" + d[headingsObj[destHeadings[8]]];

    let indexOfId = allExistIds.indexOf(id)

    if (indexOfId == -1) {
      let rowData = new Array(destHeadings.length).fill("")
      for (const key in destHeadingsObj) {
        if (headingsObj[key] || headingsObj[key] === 0) {
          rowData[destHeadingsObj[key]] = d[headingsObj[key]]
        }
      }



      rowData[destHeadingsObj["ID"]] = id
      newData.push(rowData)
      allExistIds.push(id)

    }

  })

  if (newData.length > 0) {
    destSheet.getRange(destSheet.getLastRow() + 1, 1, newData.length, newData[0].length).setValues(newData);
  }


  let destinationFolder = DriveApp.getFolderById(MEDS_TEST_REPORT_DESTINAION);

  let fileName = file.getName()
  let dataSet = "Meds Test Report Raw Data"


  let endDate = data[0][headingsObj["Written On Date"]]
  let startDate = data[data.length - 1][headingsObj["Written On Date"]]


  let updatedName = "Meds Test Report Raw Data " + startDate + " - " + endDate + " Raw_ " + Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY")
  let link = file.getUrl();
  let dataSpreadsheetName = destSS.getName()
  let timeStamp = Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY HH:mm:ss")

  let rawLogRow = [fileName, dataSet, startDate, endDate, updatedName, link, dataSpreadsheetName, destinationFolder.getName(), timeStamp, newData.length]

  file.setName(updatedName)

  rawLogSheet.getRange(rawLogSheet.getLastRow() + 1, 1, 1, rawLogRow.length).setValues([rawLogRow])


  let destFoldRich = SpreadsheetApp.newRichTextValue().setText(destinationFolder.getName()).setLinkUrl(destinationFolder.getUrl()).build()
  let destSSRich = SpreadsheetApp.newRichTextValue().setText(destSS.getName()).setLinkUrl(destSS.getUrl()).build()

  rawLogSheet.getRange(rawLogSheet.getLastRow(), DEST_FOLDER_COL).setRichTextValue(destFoldRich)
  rawLogSheet.getRange(rawLogSheet.getLastRow(), DEST_SS_COL).setRichTextValue(destSSRich)

  file.moveTo(destinationFolder)


}







const AK_WMM_BILL_DESTINAION = "19tB_ILMs6pELHZP1mXrvNjlV5lDwgGTf"
const AK_WMM_BILL_SS_ID = "1NdYSJ34ayK5Lk6J0Q-HtYABwqOneRFYydMVwECHYAEQ"

function processAKWMMBillingRawRawData_(rawLogSheet, file, headings, headingsObj, data) {

  let destSS = SpreadsheetApp.openById(AK_WMM_BILL_SS_ID);
  let destSheet = destSS.getSheetByName("Data");


  let destHeadings = destSheet.getRange(1, 1, 1, destSheet.getLastColumn()).getDisplayValues()[0]
  let destHeadingsObj = {}
  destHeadings.forEach((h, i) => {
    destHeadingsObj[h.toString().trim()] = i
  })

  let newData = [];

  data.forEach(d => {

    let rowData = new Array(destHeadings.length).fill("")
    for (const key in destHeadingsObj) {
      if (headingsObj[key] || headingsObj[key] === 0) {
        rowData[destHeadingsObj[key]] = d[headingsObj[key]]
      }
    }

    if (d[headingsObj['Location']] == 'Southern Skies Dermatology') {
      rowData[destHeadingsObj['Location']] = 'Trussville'
    }

    newData.push(rowData)
  })


  if (destSheet.getLastRow() > 1) {
    destSheet.getRange(2, 1, destSheet.getLastRow() - 1, destSheet.getLastColumn()).clearContent()
  }

  if (newData.length > 0) {
    destSheet.getRange(2, 1, newData.length, newData[0].length).setValues(newData);
  }

  let destinationFolder = DriveApp.getFolderById(AK_WMM_BILL_DESTINAION);

  let fileName = file.getName()
  let dataSet = "AK W/MM B"


  let startDate = data[0][headingsObj["Service Date"]]
  let endDate = data[data.length - 1][headingsObj["Service Date"]]
  let updatedName = "AK W/MM Billing" + startDate + "-" + endDate + " Raw_ " + Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY")
  let link = file.getUrl();
  let dataSpreadsheetName = destSS.getName()
  let timeStamp = Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY HH:mm:ss")

  let rawLogRow = [fileName, dataSet, startDate, endDate, updatedName, link, dataSpreadsheetName, destinationFolder.getName(), timeStamp, newData.length]

  file.setName(updatedName)

  rawLogSheet.getRange(rawLogSheet.getLastRow() + 1, 1, 1, rawLogRow.length).setValues([rawLogRow])


  let destFoldRich = SpreadsheetApp.newRichTextValue().setText(destinationFolder.getName()).setLinkUrl(destinationFolder.getUrl()).build()
  let destSSRich = SpreadsheetApp.newRichTextValue().setText(destSS.getName()).setLinkUrl(destSS.getUrl()).build()

  rawLogSheet.getRange(rawLogSheet.getLastRow(), DEST_FOLDER_COL).setRichTextValue(destFoldRich)
  rawLogSheet.getRange(rawLogSheet.getLastRow(), DEST_SS_COL).setRichTextValue(destSSRich)

  file.moveTo(destinationFolder)
}







const AK_WMM_DESTINAION = "1e7VuEHGKvmPEyjRjqsIMo8U1rIzIfwpL"
const AK_WMM_SS_ID = "1MjsCgmypkSimn6ZDRUI_e4h-kw499KMyGVdpjWS70HM"

function processAKWMMRawRawData_(rawLogSheet, file, headings, headingsObj, data) {

  let destSS = SpreadsheetApp.openById(AK_WMM_SS_ID);
  let destSheet = destSS.getSheetByName("Data");


  let destHeadings = destSheet.getRange(1, 1, 1, destSheet.getLastColumn()).getDisplayValues()[0]
  let destHeadingsObj = {}
  destHeadings.forEach((h, i) => {
    destHeadingsObj[h.toString().trim()] = i
  })

  let newData = [];

  data.forEach(d => {

    let rowData = new Array(destHeadings.length).fill("")
    for (const key in destHeadingsObj) {
      if (headingsObj[key] || headingsObj[key] === 0) {
        rowData[destHeadingsObj[key]] = d[headingsObj[key]]
      }
    }

    if (d[headingsObj['Location']] == 'Southern Skies Dermatology') {
      rowData[destHeadingsObj['Location']] = 'Trussville'
    }

    newData.push(rowData)
  })


  if (destSheet.getLastRow() > 1) {
    destSheet.getRange(2, 1, destSheet.getLastRow() - 1, destSheet.getLastColumn()).clearContent()
  }

  if (newData.length > 0) {
    destSheet.getRange(2, 1, newData.length, newData[0].length).setValues(newData);
  }

  let destinationFolder = DriveApp.getFolderById(AK_WMM_DESTINAION);

  let fileName = file.getName()
  let dataSet = "AK W/MM C"


  let startDate = data[0][headingsObj["Transaction Date"]]
  let endDate = data[data.length - 1][headingsObj["Transaction Date"]]
  let updatedName = "AK W/MM Collection" + startDate + "-" + endDate + " Raw_ " + Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY")
  let link = file.getUrl();
  let dataSpreadsheetName = destSS.getName()
  let timeStamp = Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY HH:mm:ss")

  let rawLogRow = [fileName, dataSet, startDate, endDate, updatedName, link, dataSpreadsheetName, destinationFolder.getName(), timeStamp, newData.length]

  file.setName(updatedName)

  rawLogSheet.getRange(rawLogSheet.getLastRow() + 1, 1, 1, rawLogRow.length).setValues([rawLogRow])


  let destFoldRich = SpreadsheetApp.newRichTextValue().setText(destinationFolder.getName()).setLinkUrl(destinationFolder.getUrl()).build()
  let destSSRich = SpreadsheetApp.newRichTextValue().setText(destSS.getName()).setLinkUrl(destSS.getUrl()).build()

  rawLogSheet.getRange(rawLogSheet.getLastRow(), DEST_FOLDER_COL).setRichTextValue(destFoldRich)
  rawLogSheet.getRange(rawLogSheet.getLastRow(), DEST_SS_COL).setRichTextValue(destSSRich)

  file.moveTo(destinationFolder)
}























const RAW_401K_FOLDER = "12IVHiGAqJuX7AZOEebBS1ZYIvcdE8iKh"
const RAW_401K_SS_ID = "16-g7ldD3iXVzNm3uP0DEbIDm-yq3Fm5ObK20jRNOUi8"

function process401KRawData_(rawLogSheet, file, headings, headingsObj, data, date) {
  let destSS = SpreadsheetApp.openById(RAW_401K_SS_ID);
  let destSheet = destSS.getSheetByName("Data");

  let firstNameIndex = headings.indexOf("First Name")
  let lastNameIndex = headings.indexOf("Last Name")
  let totalBalanceIndex = headings.indexOf("Total Balance")

  let statusIndex = headings.indexOf("Participant Status")



  let newData = [];

  // Loop through the data rows
  for (var i = 0; i < data.length; i++) {
    let firstName = data[i][firstNameIndex];
    let lastName = data[i][lastNameIndex];
    let totalBalance = data[i][totalBalanceIndex];
    let status = data[i][statusIndex];

    if (firstName.toString().trim() == "" && lastName.toString().trim() == "") continue

    // Combine first and last name with a space
    let fullName = firstName + ' ' + lastName;

    // Add the processed row to the output array
    newData.push([fullName.toString().trim(), date, totalBalance, status]);
  }



  // Write the output data to the target sheet starting from A1
  destSheet.getRange(destSheet.getLastRow() + 1, 1, newData.length, newData[0].length).setValues(newData);
  destSheet.getRange(2, 1, destSheet.getLastRow() - 1, destSheet.getLastColumn()).sort([{ column: 2, ascending: false }])


  let destinationFolder = DriveApp.getFolderById(RAW_401K_FOLDER);

  let fileName = file.getName()
  let dataSet = "401K Data"


  //let startDate = data[0][headingsObj["WrittenDate"]]
  //let endDate = data[data.length - 1][headingsObj["WrittenDate"]]
  let updatedName = "401K " + date.toLocaleDateString() + " Raw_ " + Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY")
  let link = file.getUrl();
  let dataSpreadsheetName = destSS.getName()
  let timeStamp = Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY HH:mm:ss")

  let rawLogRow = [fileName, dataSet, date, "", updatedName, link, dataSpreadsheetName, destinationFolder.getName(), timeStamp, newData.length]

  file.setName(updatedName)

  rawLogSheet.getRange(rawLogSheet.getLastRow() + 1, 1, 1, rawLogRow.length).setValues([rawLogRow])


  let destFoldRich = SpreadsheetApp.newRichTextValue().setText(destinationFolder.getName()).setLinkUrl(destinationFolder.getUrl()).build()
  let destSSRich = SpreadsheetApp.newRichTextValue().setText(destSS.getName()).setLinkUrl(destSS.getUrl()).build()


  rawLogSheet.getRange(rawLogSheet.getLastRow(), DEST_FOLDER_COL).setRichTextValue(destFoldRich)
  rawLogSheet.getRange(rawLogSheet.getLastRow(), DEST_SS_COL).setRichTextValue(destSSRich)

  file.moveTo(destinationFolder)

}







const EMA_EMR_DESTINAION = "1TpGVYUOQigy6k8JmLJyPhsGURP4FfuFv"
const EMA_EMR_SS_ID = "14Nvom2iwepq4QK8H_TIajDFb2sZcA1k7bPRk9mHgWyA"

function processEmaEMRRawData_(rawLogSheet, file, headings, headingsObj, data) {

  //return

  let destSS = SpreadsheetApp.openById(EMA_EMR_SS_ID);

  let destSheet = destSS.getSheetByName("Data");

  let existingData = destSheet.getRange(1, 1, destSheet.getLastRow(), 7).getDisplayValues()
  existingData.splice(0, 1)[0]

  let destHeadings = destSheet.getRange(1, 1, 1, destSheet.getLastColumn()).getDisplayValues()[0]
  let destHeadingsObj = {}
  destHeadings.forEach((h, i) => {
    destHeadingsObj[h.toString().trim()] = i
  })



  let existingIds = existingData.map(r => r.join("_"))



  let newData = [];

  data.forEach(d => {



    let id = d[0] + "_" + d[1] + "_" + d[2] + "_" + d[3] + "_" + d[4] + "_" + d[5] + "_" + d[6]

    let indexOfId = existingIds.indexOf(id)

    if (indexOfId == -1) {

      //Logger.log(id)
      let rowData = new Array(destHeadings.length).fill("")
      for (const key in destHeadingsObj) {
        if (headingsObj[key] || headingsObj[key] === 0) {
          rowData[destHeadingsObj[key]] = d[headingsObj[key]]
        }
      }


      newData.push(rowData)
    }

  })




  if (newData.length > 0) {
    destSheet.getRange(destSheet.getLastRow() + 1, 1, newData.length, newData[0].length).setValues(newData);
  }

  // if (destSheet.getLastRow() > 2 + newData.length) {
  //   destSheet.getRange(2 + newData.length, 1, destSheet.getLastRow() - (1 + newData.length), destSheet.getLastColumn()).clearContent();
  // }





  let destinationFolder = DriveApp.getFolderById(EMA_EMR_DESTINAION);

  let fileName = file.getName()
  let dataSet = "EMA EMR"


  let startDate = data[0][headingsObj["WrittenDate"]]
  let endDate = data[data.length - 1][headingsObj["WrittenDate"]]
  let updatedName = "EMA EMR " + startDate + "-" + endDate + " Raw_ " + Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY")
  let link = file.getUrl();
  let dataSpreadsheetName = destSS.getName()
  let timeStamp = Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY HH:mm:ss")

  let rawLogRow = [fileName, dataSet, startDate, endDate, updatedName, link, dataSpreadsheetName, destinationFolder.getName(), timeStamp, newData.length]

  file.setName(updatedName)

  rawLogSheet.getRange(rawLogSheet.getLastRow() + 1, 1, 1, rawLogRow.length).setValues([rawLogRow])


  let destFoldRich = SpreadsheetApp.newRichTextValue().setText(destinationFolder.getName()).setLinkUrl(destinationFolder.getUrl()).build()
  let destSSRich = SpreadsheetApp.newRichTextValue().setText(destSS.getName()).setLinkUrl(destSS.getUrl()).build()

  rawLogSheet.getRange(rawLogSheet.getLastRow(), DEST_FOLDER_COL).setRichTextValue(destFoldRich)
  rawLogSheet.getRange(rawLogSheet.getLastRow(), DEST_SS_COL).setRichTextValue(destSSRich)



  file.moveTo(destinationFolder)


}








const EMA_VISIT_NOTES_DESTINAION = "1Pea-COEoJb7YM19fa7IGGDK-wpyZ_hpQ"
const EMA_VISIT_NOTES_SS_ID = "1pAgnjSWGt5aFQwT525FKWScnk3GmKTm7_-ypeJ8g-aE"

function processEmaVisitNotesRawData_(rawLogSheet, file, headings, headingsObj, data) {

  let destSS = SpreadsheetApp.openById(EMA_VISIT_NOTES_SS_ID);

  let destSheet = destSS.getSheetByName("Notes");
  const destData = destSheet.getRange(1, 1, destSheet.getLastRow(), 7).getDisplayValues()
  let destHeadings = destData.splice(0, 1)[0];
  let destHeadingsObj = {}
  destHeadings.forEach((h, i) => {
    destHeadingsObj[h.toString().trim()] = i
  })


  const allIDs = destData.map(r => (r[destHeadingsObj["DATE"]] + r[destHeadingsObj["NOTE AUTHOR"]] + r[destHeadingsObj["MRN"]]))


  let newData = [];

  data.forEach(d => {
    let souceDate = Utilities.formatDate(d[headingsObj["DATE"]], Session.getScriptTimeZone(), "M/d/yyyy")
    let providerNameSplit = d[headingsObj["NOTE AUTHOR"]].toUpperCase().split(", ").map(r => r.trim())
    let providerName = d[headingsObj["NOTE AUTHOR"]]
    try {
      providerName = providerNameSplit[1] + " " + providerNameSplit[0]
    } catch (nameErr) { }

    let patientNameSplit = d[headingsObj["PATIENT NAME"]].toUpperCase().split(", ").map(r => r.trim())
    let patientName = d[headingsObj["PATIENT NAME"]]
    try {
      patientName = patientNameSplit[1] + " " + patientNameSplit[0]
    } catch (nameErr) { }

    let facility = d[headingsObj["FACILITY"]]
    if (facility == "Southern Skies Dermatology") {
      facility = "Trussville"
    }

    let assignedTo = d[headingsObj["ASSIGNED TO"]]
    if (assignedTo.toString().includes(",")) {
      let assignedToSplit = d[headingsObj["ASSIGNED TO"]].toUpperCase().split(", ").map(r => r.trim())
      assignedTo = assignedToSplit[1] + " " + assignedToSplit[0]
    }

    let newId = souceDate + providerName + d[headingsObj["MRN"]]
    //Logger.log(newId)
    let newIdIndex = allIDs.indexOf(newId)
    if (newIdIndex == -1) {
      newData.push([souceDate, providerName, patientName, d[headingsObj["MRN"]], d[headingsObj["STATUS"]], assignedTo, facility])
    } else {
      destSheet.getRange(newIdIndex + 2, 1, 1, destHeadings.length).setValues([[souceDate, providerName, patientName, d[headingsObj["MRN"]], d[headingsObj["STATUS"]], assignedTo, facility]])
    }
  })

  if (newData.length > 0) {
    destSheet.getRange(destSheet.getLastRow() + 1, 1, newData.length, newData[0].length).setValues(newData);
  }


  let destinationFolder = DriveApp.getFolderById(EMA_VISIT_NOTES_DESTINAION);

  let fileName = file.getName()
  let dataSet = "EMA Visit Notes"


  let endDate = data[0][headingsObj["DATE"]]
  let startDate = data[data.length - 1][headingsObj["DATE"]]
  let updatedName = "EMA Visit Notes " + startDate.toLocaleDateString() + "-" + endDate.toLocaleDateString() + " Raw_ " + Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY")
  let link = file.getUrl();
  let dataSpreadsheetName = destSS.getName()
  let timeStamp = Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY HH:mm:ss")

  let rawLogRow = [fileName, dataSet, startDate, endDate, updatedName, link, dataSpreadsheetName, destinationFolder.getName(), timeStamp, newData.length]

  file.setName(updatedName)

  rawLogSheet.getRange(rawLogSheet.getLastRow() + 1, 1, 1, rawLogRow.length).setValues([rawLogRow])


  let destFoldRich = SpreadsheetApp.newRichTextValue().setText(destinationFolder.getName()).setLinkUrl(destinationFolder.getUrl()).build()
  let destSSRich = SpreadsheetApp.newRichTextValue().setText(destSS.getName()).setLinkUrl(destSS.getUrl()).build()

  rawLogSheet.getRange(rawLogSheet.getLastRow(), DEST_FOLDER_COL).setRichTextValue(destFoldRich)
  rawLogSheet.getRange(rawLogSheet.getLastRow(), DEST_SS_COL).setRichTextValue(destSSRich)

  file.moveTo(destinationFolder)

}












const EMA_VISIT_NOTES_IBD_DESTINAION = "1qux9pVvyyu1HaL6erXDtX4IABQyen7AC"
const EMA_VISIT_NOTES_IBD_SS_ID = "1LDzLXOihipT20GB_IX7Qz5fY7HB8dZk0GegXxo3xDFY"

function processEmaVisitNotesIbdRawData_(rawLogSheet, file, headings, headingsObj, data) {

  let destSS = SpreadsheetApp.openById(EMA_VISIT_NOTES_IBD_SS_ID);

  let destSheet = destSS.getSheetByName("Data");
  let destHeadings = destSheet.getRange(1, 1, 1, destSheet.getLastColumn()).getValues()[0]
  //let initialCount = destSheet.getLastRow() - 1
  let destHeadingsObj = {}
  destHeadings.forEach((h, i) => {
    destHeadingsObj[h.toString().trim()] = i
  })

  let newData = [];

  data.forEach(d => {

    let rowData = new Array(destHeadings.length).fill("")
    for (const key in destHeadingsObj) {
      if (headingsObj[key] || headingsObj[key] === 0) {
        rowData[destHeadingsObj[key]] = d[headingsObj[key]]
      }
    }
    newData.push(rowData)

  })

  if (newData.length > 0) {
    destSheet.getRange(2, 1, newData.length, newData[0].length).setValues(newData);
  }

  if (destSheet.getLastRow() > 2 + newData.length) {
    destSheet.getRange(2 + newData.length, 1, destSheet.getLastRow() - (1 + newData.length), destSheet.getLastColumn()).clearContent();
  }

  let destinationFolder = DriveApp.getFolderById(EMA_VISIT_NOTES_IBD_DESTINAION);

  let fileName = file.getName()
  let dataSet = "EMA Visit Notes IBD"


  let endDate = data[0][headingsObj["Appointment Date"]]
  let startDate = data[data.length - 1][headingsObj["Appointment Date"]]
  let updatedName = "EMA Visit Notes IBD " + startDate.toLocaleDateString() + "-" + endDate.toLocaleDateString() + " Raw_ " + Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY")
  let link = file.getUrl();
  let dataSpreadsheetName = destSS.getName()
  let timeStamp = Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY HH:mm:ss")

  let rawLogRow = [fileName, dataSet, startDate, endDate, updatedName, link, dataSpreadsheetName, destinationFolder.getName(), timeStamp, newData.length]

  file.setName(updatedName)

  rawLogSheet.getRange(rawLogSheet.getLastRow() + 1, 1, 1, rawLogRow.length).setValues([rawLogRow])


  let destFoldRich = SpreadsheetApp.newRichTextValue().setText(destinationFolder.getName()).setLinkUrl(destinationFolder.getUrl()).build()
  let destSSRich = SpreadsheetApp.newRichTextValue().setText(destSS.getName()).setLinkUrl(destSS.getUrl()).build()

  rawLogSheet.getRange(rawLogSheet.getLastRow(), DEST_FOLDER_COL).setRichTextValue(destFoldRich)
  rawLogSheet.getRange(rawLogSheet.getLastRow(), DEST_SS_COL).setRichTextValue(destSSRich)

  file.moveTo(destinationFolder)

}






function getHighestAndLowestDate() {
  // Example array of date strings
  const dateArray = [];

  // Convert strings to Date objects
  const dateObjects = dateArray.map(dateStr => new Date(dateStr));
  //dateObjects.push("test Notes")
  // Find the lowest and highest dates
  const lowestDate = new Date(Math.min(...dateObjects));
  const highestDate = new Date(Math.max(...dateObjects));

  // Log the results
  console.log(`Lowest Date: ${lowestDate.toDateString()}`);
  console.log(`Highest Date: ${highestDate.toDateString()}`);

  // Return the results as an object
  return { lowestDate, highestDate };
}





const EMA_PATIENT_AR_DESTINAION = "11uDaB6BCExA9Z0hRvoZwvSPbjVlgWKFr"
const EMA_PATIENT_AR_SS_ID = "1aMliJ8iC5hxkJtMwHteCxlmgsyR8apaLcwh3cRK2Cv0"

const INSURANCE_PATIENT_SS_ID = "1kC5Jemgg3DadkndtxPWjwpR01kLRKaqZFDFGqJgNfjI"

function processEmaPatientArRawData_(rawLogSheet, file, headings, headingsObj, data) {

  let destSS = SpreadsheetApp.openById(EMA_PATIENT_AR_SS_ID);

  let destSheet = destSS.getSheetByName("Data");
  let destHeadings = destSheet.getRange(1, 1, 1, destSheet.getLastColumn()).getValues()[0]
  let destHeadingsObj = {}
  destHeadings.forEach((h, i) => {
    destHeadingsObj[h.toString().trim()] = i
  })


  let creditSheet = destSS.getSheetByName("Credit");
  let creditHeadings = creditSheet.getRange(1, 1, 1, creditSheet.getLastColumn()).getValues()[0]
  let creditHeadingsObj = {}
  creditHeadings.forEach((h, i) => {
    creditHeadingsObj[h.toString().trim()] = i
  })



  //data = data.filter(row => row[headingsObj["A/R Balance Type"]] != "Credit")




  let newData = [];
  let newData2 = []
  let creditData = []
  let datesArray = [];
  let date_ = new Date()

  data.forEach(d => {

    if (d[headingsObj["A/R Balance Type"]] != "Credit") {
      let rowData = new Array(destHeadings.length).fill("")
      let rowData2 = new Array(destHeadings.length).fill("")
      for (const key in destHeadingsObj) {
        if (headingsObj[key] || headingsObj[key] === 0) {
          rowData[destHeadingsObj[key]] = d[headingsObj[key]]
          rowData2[destHeadingsObj[key]] = d[headingsObj[key]]
        }
      }

      //Last Statement Date
      newData.push(rowData)
      rowData2.unshift(date_)
      newData2.push(rowData2)

    } else {
      let rowData = new Array(creditHeadings.length).fill("")
      for (const key in creditHeadingsObj) {
        if (headingsObj[key] || headingsObj[key] === 0) {
          rowData[creditHeadingsObj[key]] = d[headingsObj[key]]
        }
      }

      creditData.push(rowData)

    }

    if (isValidDate_(d[headingsObj['Last Payment Date']])) {
      datesArray.push(d[headingsObj['Last Payment Date']])
    }

  })



  if (datesArray.length == 0) {
    datesArray.push(date_)
  }




  if (newData.length > 0) {
    destSheet.getRange(2, 1, newData.length, newData[0].length).setValues(newData);

    let insuranceSS = SpreadsheetApp.openById(INSURANCE_PATIENT_SS_ID)
    let insuranceSheet = insuranceSS.getSheetByName("RD")

    let columnA = insuranceSheet.getRange(1, 1, insuranceSheet.getLastRow(), 1).getDisplayValues().filter(r => r[0] != "")
    insuranceSheet.getRange(columnA.length + 1, 1, newData2.length, newData2[0].length).setValues(newData2)

  }

  if (destSheet.getLastRow() > 2 + newData.length) {
    destSheet.getRange(2 + newData.length, 1, destSheet.getLastRow() - (1 + newData.length), destSheet.getLastColumn()).clearContent();
  }

  if (creditData.length > 0) {
    creditSheet.getRange(2, 1, creditData.length, creditData[0].length).setValues(creditData);
  }
  if (creditSheet.getLastRow() > 2 + creditData.length) {
    creditSheet.getRange(2 + creditData.length, 1, creditSheet.getLastRow() - (1 + creditData.length), creditSheet.getLastColumn()).clearContent();
  }




  let destinationFolder = DriveApp.getFolderById(EMA_PATIENT_AR_DESTINAION);

  let fileName = file.getName()
  let dataSet = "EMA Patient A/R"





  const startDate = new Date(Math.min(...datesArray));
  const endDate = new Date(Math.max(...datesArray));


  let updatedName = "";

  try {
    updatedName = "EMA Patient A/R " + startDate.toLocaleDateString() + "-" + endDate.toLocaleDateString() + " Raw_ " + Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY")
  } catch (err) {
    updatedName = "EMA Patient A/R " + startDate + "-" + endDate + " Raw_ " + Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY")
  }

  let link = file.getUrl();
  let dataSpreadsheetName = destSS.getName()
  let timeStamp = Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY HH:mm:ss")

  let rawLogRow = [fileName, dataSet, startDate, endDate, updatedName, link, dataSpreadsheetName, destinationFolder.getName(), timeStamp, newData.length]

  file.setName(updatedName)

  rawLogSheet.getRange(rawLogSheet.getLastRow() + 1, 1, 1, rawLogRow.length).setValues([rawLogRow])

  let destFoldRich = SpreadsheetApp.newRichTextValue().setText(destinationFolder.getName()).setLinkUrl(destinationFolder.getUrl()).build()
  let destSSRich = SpreadsheetApp.newRichTextValue().setText(destSS.getName()).setLinkUrl(destSS.getUrl()).build()

  rawLogSheet.getRange(rawLogSheet.getLastRow(), DEST_FOLDER_COL).setRichTextValue(destFoldRich)
  rawLogSheet.getRange(rawLogSheet.getLastRow(), DEST_SS_COL).setRichTextValue(destSSRich)



  file.moveTo(destinationFolder)


}














const EMA_COSMETICS_BILLING_DESTINAION = "1iIKf9PXE6MkTTf8ZsDh6mQfawOuzU9q7"
const EMA_COSMETICS_BILLING_SS_ID = "1S0UzOpPw3Gkg7ds2MCaJ-DCtl-TgpkSqOhCsP8JijWM"

function processEmaCosmeticsBillingRawData_(rawLogSheet, file, headings, headingsObj, data) {

  let destSS = SpreadsheetApp.openById(EMA_COSMETICS_BILLING_SS_ID);

  let destSheet = destSS.getSheetByName("Data");
  //let initialRows = destSheet.getLastRow() - 1
  let destHeadings = destSheet.getRange(1, 1, 1, destSheet.getLastColumn()).getValues()[0]
  let destHeadingsObj = {}
  destHeadings.forEach((h, i) => {
    destHeadingsObj[h.toString().trim()] = i
  })






  let newData = [];

  data.forEach(d => {


    if (d[headingsObj["Location"]] == "Southern Skies Dermatology") {
      d[headingsObj["Location"]] = "Trussville"
    }

    d[headingsObj["CPT/Product Description (Custom)"]] = "BOTOX"




    let rowData = new Array(destHeadings.length).fill("")
    for (const key in destHeadingsObj) {
      if (headingsObj[key] || headingsObj[key] === 0) {
        rowData[destHeadingsObj[key]] = d[headingsObj[key]]
      }
    }


    newData.push(rowData)


  })




  if (newData.length > 0) {
    destSheet.getRange(2, 1, newData.length, newData[0].length).setValues(newData);
  }

  if (destSheet.getLastRow() > 2 + newData.length) {
    destSheet.getRange(2 + newData.length, 1, destSheet.getLastRow() - (1 + newData.length), destSheet.getLastColumn()).clearContent();
  }





  let destinationFolder = DriveApp.getFolderById(EMA_COSMETICS_BILLING_DESTINAION);

  let fileName = file.getName()
  let dataSet = "EMA Cosmetics Billing"

  let startDate = data[0][headingsObj["Service Date"]]
  let endDate = data[data.length - 1][headingsObj["Service Date"]]
  let updatedName = "EMA Cosmetics Billing " + startDate.toLocaleDateString() + "-" + endDate.toLocaleDateString() + " Raw_ " + Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY")
  let link = file.getUrl();
  let dataSpreadsheetName = destSS.getName()
  let timeStamp = Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY HH:mm:ss")

  let rawLogRow = [fileName, dataSet, startDate, endDate, updatedName, link, dataSpreadsheetName, destinationFolder.getName(), timeStamp, newData.length]

  file.setName(updatedName)

  rawLogSheet.getRange(rawLogSheet.getLastRow() + 1, 1, 1, rawLogRow.length).setValues([rawLogRow])

  let destFoldRich = SpreadsheetApp.newRichTextValue().setText(destinationFolder.getName()).setLinkUrl(destinationFolder.getUrl()).build()
  let destSSRich = SpreadsheetApp.newRichTextValue().setText(destSS.getName()).setLinkUrl(destSS.getUrl()).build()

  rawLogSheet.getRange(rawLogSheet.getLastRow(), DEST_FOLDER_COL).setRichTextValue(destFoldRich)
  rawLogSheet.getRange(rawLogSheet.getLastRow(), DEST_SS_COL).setRichTextValue(destSSRich)



  file.moveTo(destinationFolder)


}











const EMA_BILLING_SURGERY_DESTINAION = "1h13sIrYZcxgncx0pryxZLka2HZMbRhZc"
const EMA_BILLING_SURGERY_SS_ID = "1CbXRksX1vBgJEJ_M0w_eo9OreauX_xxjemXwz-oIkvw"

function processEmaBillingSurgeryRawData_(rawLogSheet, file, headings, headingsObj, data) {

  let destSS = SpreadsheetApp.openById(EMA_BILLING_SURGERY_SS_ID);

  let destSheet = destSS.getSheetByName("Data");
  let destHeadings = destSheet.getRange(1, 1, 1, destSheet.getLastColumn()).getValues()[0]
  let destHeadingsObj = {}
  destHeadings.forEach((h, i) => {
    destHeadingsObj[h.toString().trim()] = i
  })



  let filterTime = new Date(2024, 1, 27).getTime()

  let filterData = data.filter(r => r[headingsObj["CPT/Product"]] != "BALANCE FORWARD" && r[headingsObj["CPT/Product"]] != "MEDISYS" && r[headingsObj["CPT/Product"]] != "Professional Services" && isValidDate_(r[headingsObj["Service Date"]]) && new Date(r[headingsObj["Service Date"]]).getTime() >= filterTime)


  filterData.sort(function (a, b) {
    return a[headingsObj["Service Date"]] - b[headingsObj["Service Date"]];
  });


  let newData = [];

  filterData.forEach(d => {

    if (d[headingsObj["Location"]] == "Southern Skies Dermatology") {
      d[headingsObj["Location"]] = "Trussville"
    }


    // let splitProidersName = d[headingsObj["Primary Biller"]].split(" ").map(n => n.toString().trim())
    // d[headingsObj["Primary Biller"]] = (splitProidersName[0] + " " + splitProidersName[splitProidersName.length - 1]).toUpperCase()




    let rowData = new Array(destHeadings.length).fill("")
    for (const key in destHeadingsObj) {
      if (headingsObj[key] || headingsObj[key] === 0) {
        rowData[destHeadingsObj[key]] = d[headingsObj[key]]
      }
    }


    newData.push(rowData)


  })




  if (newData.length > 0) {
    destSheet.getRange(2, 1, newData.length, newData[0].length).setValues(newData);
  }

  if (destSheet.getLastRow() > 2 + newData.length) {
    destSheet.getRange(2 + newData.length, 1, destSheet.getLastRow() - (1 + newData.length), destSheet.getLastColumn()).clearContent();
  }





  let destinationFolder = DriveApp.getFolderById(EMA_BILLING_SURGERY_DESTINAION);

  let fileName = file.getName()
  let dataSet = "EMA Billing Surgery Dashboard"

  let startDate = filterData[0][headingsObj["Service Date"]]
  let endDate = filterData[filterData.length - 1][headingsObj["Service Date"]]

  let updatedName = "EMA Billing Surgery Dashboard " + startDate.toLocaleDateString() + "-" + endDate.toLocaleDateString() + " Raw_ " + Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY")
  let link = file.getUrl();
  let dataSpreadsheetName = destSS.getName()
  let timeStamp = Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY HH:mm:ss")

  let rawLogRow = [fileName, dataSet, startDate, endDate, updatedName, link, dataSpreadsheetName, destinationFolder.getName(), timeStamp, newData.length]

  file.setName(updatedName)

  rawLogSheet.getRange(rawLogSheet.getLastRow() + 1, 1, 1, rawLogRow.length).setValues([rawLogRow])

  let destFoldRich = SpreadsheetApp.newRichTextValue().setText(destinationFolder.getName()).setLinkUrl(destinationFolder.getUrl()).build()
  let destSSRich = SpreadsheetApp.newRichTextValue().setText(destSS.getName()).setLinkUrl(destSS.getUrl()).build()

  rawLogSheet.getRange(rawLogSheet.getLastRow(), DEST_FOLDER_COL).setRichTextValue(destFoldRich)
  rawLogSheet.getRange(rawLogSheet.getLastRow(), DEST_SS_COL).setRichTextValue(destSSRich)



  file.moveTo(destinationFolder)


}

























const EMA_BILLING_IBD_DESTINAION = "1I2Ukg2FLwut6Fk6J6dGYvvRNYSjy39Rz"
const EMA_BILLING_IBD_SS_ID = "10owMF6fjViQ-o101lPOJ81tdvrofJp-vxjUyPoHccK4"

function processEmaBillingIBDRawData_(rawLogSheet, file, headings, headingsObj, data) {

  let destSS = SpreadsheetApp.openById(EMA_BILLING_IBD_SS_ID);

  let destSheet = destSS.getSheetByName("Data");
  let destHeadings = destSheet.getRange(1, 1, 1, destSheet.getLastColumn()).getValues()[0]
  let destHeadingsObj = {}
  destHeadings.forEach((h, i) => {
    destHeadingsObj[h.toString().trim()] = i
  })



  let filterTime = new Date(2024, 1, 27).getTime()

  let filterData = data.filter(r => r[headingsObj["CPT/Product"]] != "BALANCE FORWARD" && r[headingsObj["CPT/Product"]] != "MEDISYS" && r[headingsObj["CPT/Product"]] != "Professional Services" && new Date(r[headingsObj["Service Date"]]).getTime() >= filterTime)


  let newData = [];

  filterData.forEach(d => {




    if (d[headingsObj["Location"]] == "Southern Skies Dermatology") {
      d[headingsObj["Location"]] = "Trussville"
    }




    let rowData = new Array(destHeadings.length).fill("")
    for (const key in destHeadingsObj) {
      if (headingsObj[key] || headingsObj[key] === 0) {
        rowData[destHeadingsObj[key]] = d[headingsObj[key]]
      }
    }


    newData.push(rowData)


  })


  newData.unshift(destHeadings)

  if (newData.length > 0) {
    //destSheet.getRange(2, 1, newData.length, newData[0].length).setValues(newData);
    Sheets.Spreadsheets.Values.batchUpdate({ valueInputOption: "USER_ENTERED", data: [{ range: "Data", values: newData }] }, EMA_BILLING_IBD_SS_ID);
  }

  if (destSheet.getLastRow() > 2 + (newData.length - 1)) {
    destSheet.getRange(2 + newData.length - 1, 1, destSheet.getLastRow() - (1 + newData.length - 1), destSheet.getLastColumn()).clearContent();
  }

  if (newData.length > 0) {
    destSheet.getRange(2, 1, destSheet.getLastRow() - 1, destSheet.getLastColumn()).sort([{ column: 1, ascending: false }])
  }





  let destinationFolder = DriveApp.getFolderById(EMA_BILLING_IBD_DESTINAION);

  let fileName = file.getName()
  let dataSet = "EMA Billing IBD"

  let startDate = filterData[0][headingsObj["Service Date"]]
  let endDate = filterData[filterData.length - 1][headingsObj["Service Date"]]
  let updatedName = "EMA Billing IBD " + startDate + "-" + endDate + " Raw_ " + Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY")
  let link = file.getUrl();
  let dataSpreadsheetName = destSS.getName()
  let timeStamp = Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY HH:mm:ss")

  let rawLogRow = [fileName, dataSet, startDate, endDate, updatedName, link, dataSpreadsheetName, destinationFolder.getName(), timeStamp, newData.length]

  file.setName(updatedName)

  rawLogSheet.getRange(rawLogSheet.getLastRow() + 1, 1, 1, rawLogRow.length).setValues([rawLogRow])

  let destFoldRich = SpreadsheetApp.newRichTextValue().setText(destinationFolder.getName()).setLinkUrl(destinationFolder.getUrl()).build()
  let destSSRich = SpreadsheetApp.newRichTextValue().setText(destSS.getName()).setLinkUrl(destSS.getUrl()).build()

  rawLogSheet.getRange(rawLogSheet.getLastRow(), DEST_FOLDER_COL).setRichTextValue(destFoldRich)
  rawLogSheet.getRange(rawLogSheet.getLastRow(), DEST_SS_COL).setRichTextValue(destSSRich)



  file.moveTo(destinationFolder)


}






















const EMA_BILLING_PSD_DESTINAION = "1y1ZnsMSauY-ecwOU7TH8-LGa7j4c7Sbu"
const EMA_BILLING_PSD_SS_ID = "1P1D7Id_Se-kWh8FMebJ5TlIGJQsr0qOcEuVhTJOdPng"

function processEmaBillingPSDRawData_(rawLogSheet, file, headings, headingsObj, data) {

  let destSS = SpreadsheetApp.openById(EMA_BILLING_PSD_SS_ID);

  let destSheet = destSS.getSheetByName("Data");
  //let destData = destSheet.getRange(1, 1, destSheet.getLastRow(), destSheet.getLastColumn()).getValues();
  let destHeadings = destSheet.getRange(1, 1, 1, destSheet.getLastColumn()).getValues()[0]
  let destHeadingsObj = {}
  destHeadings.forEach((h, i) => {
    destHeadingsObj[h.toString().trim()] = i
  })


  //let destIds = destData.map(r => r[destHeadingsObj["CaseNumber"]] + r[destHeadingsObj["SpecimenOrder"]])

  let filterTime = new Date(2024, 1, 27).getTime()

  let filterData = data.filter(r => r[headingsObj["CPT/Product"]] != "BALANCE FORWARD" && r[headingsObj["CPT/Product"]] != "MEDISYS" && r[headingsObj["CPT/Product"]] != "Professional Services" && new Date(r[headingsObj["Service Date"]]).getTime() >= filterTime)


  let newData = [];

  filterData.forEach(d => {

    if (d[headingsObj["Location"]] == "Southern Skies Dermatology") {
      d[headingsObj["Location"]] = "Trussville"
    }


    let rowData = new Array(destHeadings.length).fill("")
    for (const key in destHeadingsObj) {
      if (headingsObj[key] || headingsObj[key] === 0) {
        rowData[destHeadingsObj[key]] = d[headingsObj[key]]
      }
    }
    newData.push(rowData)
  })






  if (newData.length > 0) {
    destSheet.getRange(2, 1, newData.length, newData[0].length).setValues(newData);
  }

  if (destSheet.getLastRow() > 2 + newData.length) {
    destSheet.getRange(2 + newData.length, 1, destSheet.getLastRow() - (1 + newData.length), destSheet.getLastColumn()).clearContent();
  }





  let destinationFolder = DriveApp.getFolderById(EMA_BILLING_PSD_DESTINAION);

  let fileName = file.getName()
  let dataSet = "EMA Billing PSD"

  let filterAllDates = filterData.map(r => r[headingsObj["Service Date"]])
  filterAllDates = filterAllDates.filter(r => isValidDate_(new Date(r)))
  let minMaxDate = getMinMaxDates(filterAllDates)

  let startDate = minMaxDate.minDate
  let endDate = minMaxDate.maxDate
  let updatedName = "EMA Billing PSD " + startDate + "-" + endDate + " Raw_ " + Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY")
  let link = file.getUrl();
  let dataSpreadsheetName = destSS.getName()
  let timeStamp = Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY HH:mm:ss")

  let rawLogRow = [fileName, dataSet, startDate, endDate, updatedName, link, dataSpreadsheetName, destinationFolder.getName(), timeStamp, newData.length]

  file.setName(updatedName)

  rawLogSheet.getRange(rawLogSheet.getLastRow() + 1, 1, 1, rawLogRow.length).setValues([rawLogRow])

  let destFoldRich = SpreadsheetApp.newRichTextValue().setText(destinationFolder.getName()).setLinkUrl(destinationFolder.getUrl()).build()
  let destSSRich = SpreadsheetApp.newRichTextValue().setText(destSS.getName()).setLinkUrl(destSS.getUrl()).build()

  rawLogSheet.getRange(rawLogSheet.getLastRow(), DEST_FOLDER_COL).setRichTextValue(destFoldRich)
  rawLogSheet.getRange(rawLogSheet.getLastRow(), DEST_SS_COL).setRichTextValue(destSSRich)



  file.moveTo(destinationFolder)


}


function getMinMaxDates(dateArray) {
  if (!dateArray || dateArray.length === 0) {
    return { minDate: null, maxDate: null };
  }

  const timestamps = dateArray.map(date => new Date(date).getTime());

  const minTimestamp = Math.min(...timestamps);
  const maxTimestamp = Math.max(...timestamps);

  const minDate = new Date(minTimestamp);
  const maxDate = new Date(maxTimestamp);

  return { minDate: minDate, maxDate: maxDate };
}




//below function will return true if the arg is valid date and false if not.
function isValidDate_(d) {
  if (Object.prototype.toString.call(d) !== "[object Date]")
    return false;
  return !isNaN(d.getTime());
}




const SKINDX_DAILY_BIOPSY_DESTINAION = "1XRXFeQEf-1xqMHSjbrSBmogctMxJOXcA"
const SKINDX_DAILY_BIOPSY_SS_ID = "12sqJDZdemF7xuiFtj5KPcNGvwFaWkfju01faI3xhVTM"

function processSkinDxDailyBiopsyRawData_(rawLogSheet, file, headings, headingsObj, data) {

  let destSS = SpreadsheetApp.openById(SKINDX_DAILY_BIOPSY_SS_ID);

  let destSheet = destSS.getSheetByName("Data");
  let destData = destSheet.getRange(1, 1, destSheet.getLastRow(), destSheet.getLastColumn()).getValues();
  let destHeadings = destData.splice(0, 1)[0]
  let destHeadingsObj = {}
  destHeadings.forEach((h, i) => {
    destHeadingsObj[h.toString().trim()] = i
  })


  let destIds = destData.map(r => r[destHeadingsObj["CaseNumber"]] + r[destHeadingsObj["SpecimenId"]])


  let newData = [];

  data.forEach(d => {


    if (d[headingsObj["ProviderLocation"]] == "Southern Skies Dermatology - Trussville") {
      d[headingsObj["ProviderLocation"]] = "Trussville"

    } else if (d[headingsObj["ProviderLocation"]] == "Southern Skies Dermatology - Oxford") {
      d[headingsObj["ProviderLocation"]] = "Oxford"

    } else if (d[headingsObj["ProviderLocation"]] == "Southern Skies Dermatology - Gadsden") {
      d[headingsObj["ProviderLocation"]] = "Gadsden"

    } else if (d[headingsObj["ProviderLocation"]] == "Southern Skies Dermatology - Pell City") {
      d[headingsObj["ProviderLocation"]] = "Pell City"
    }


    let splitProidersName = d[headingsObj["ProviderName"]].split(" ").map(n => n.toString().trim())
    d[headingsObj["ProviderName"]] = (splitProidersName[0] + " " + splitProidersName[splitProidersName.length - 1]).toUpperCase()


    let rowData = new Array(destHeadings.length).fill("")
    for (const key in destHeadingsObj) {
      if (headingsObj[key] || headingsObj[key] === 0) {
        rowData[destHeadingsObj[key]] = d[headingsObj[key]]
      }
    }

    let sourceID = d[headingsObj["CaseNumber"]] + d[headingsObj["SpecimenId"]]

    let indexOfId = destIds.indexOf(sourceID);

    if (indexOfId > -1) {
      destData[indexOfId] = rowData
    } else {
      newData.push(rowData)
    }


  })





  if (destData.length > 0) {
    destSheet.getRange(2, 1, destData.length, destData[0].length).setValues(destData);
  }

  if (newData.length > 0) {
    destSheet.getRange(destSheet.getLastRow() + 1, 1, newData.length, newData[0].length).setValues(newData);
  }





  let destinationFolder = DriveApp.getFolderById(SKINDX_DAILY_BIOPSY_DESTINAION);

  let fileName = file.getName()
  let dataSet = "SkinDx Daily Biopsy"

  let startDate = data[0][headingsObj["ReportedOn"]]
  let endDate = data[data.length - 1][headingsObj["ReportedOn"]]
  let updatedName = "SkinDx Daily Biopsy " + startDate + "-" + endDate + " Raw_ " + Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY")
  let link = file.getUrl();
  let dataSpreadsheetName = destSS.getName()
  let timeStamp = Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY HH:mm:ss")

  let rawLogRow = [fileName, dataSet, startDate, endDate, updatedName, link, dataSpreadsheetName, destinationFolder.getName(), timeStamp, newData.length]

  file.setName(updatedName)

  rawLogSheet.getRange(rawLogSheet.getLastRow() + 1, 1, 1, rawLogRow.length).setValues([rawLogRow])

  let destFoldRich = SpreadsheetApp.newRichTextValue().setText(destinationFolder.getName()).setLinkUrl(destinationFolder.getUrl()).build()
  let destSSRich = SpreadsheetApp.newRichTextValue().setText(destSS.getName()).setLinkUrl(destSS.getUrl()).build()

  rawLogSheet.getRange(rawLogSheet.getLastRow(), DEST_FOLDER_COL).setRichTextValue(destFoldRich)
  rawLogSheet.getRange(rawLogSheet.getLastRow(), DEST_SS_COL).setRichTextValue(destSSRich)



  file.moveTo(destinationFolder)


}






const EMA_SKIN_SUBS_BILLING_DESTINAION = "1MrORA3kl63EeVtMoVUdM6EwDXxDfYVX2"
const EMA_SKIN_SUBS_BILLING_SS_ID = "1aWyVwTbNsN3f0l1nwHRLiUj2SicQV6jgejgqZGzuaao"

function processEmaSkinSubsBillingRawData_(rawLogSheet, file, headings, headingsObj, data) {

  let destSS = SpreadsheetApp.openById(EMA_SKIN_SUBS_BILLING_SS_ID);

  let destSheet = destSS.getSheetByName("Data");
  //let pathologies = destSheet.getRange(1, 1, destSheet.getLastRow(), destSheet.getLastColumn()).getValues();
  let destHeadings = destSheet.getRange(1, 1, 1, destSheet.getLastColumn()).getValues()[0];
  let destHeadingsObj = {}
  destHeadings.forEach((h, i) => {
    destHeadingsObj[h.toString().trim()] = i
  })




  let qCodesSheet = destSS.getSheetByName("Q_Code");
  let qCodes = qCodesSheet.getRange(2, 1, qCodesSheet.getLastRow() - 1, 2).getValues()
  let qCodesObj = {};
  qCodes.forEach(q => {
    qCodesObj[q[0]] = q[1]
  })



  let date = new Date(2024, 1, 26, 22, 0, 0)
  let time = date.getTime();

  data = data.filter(row => isValidDate_(row[headingsObj["Service Date"]]) && row[headingsObj["Service Date"]].getTime() > time)

  data.sort(function (a, b) {
    return a[headingsObj["Transaction Date"]] - b[headingsObj["Transaction Date"]];
  });


  let newData = [];

  data.forEach(d => {


    if (d[headingsObj["CPT/Product"]] && d[headingsObj["CPT/Product"]] != "" && d[headingsObj["CPT/Product"]] != null) {
      d[headingsObj["CPT/Product Description (AMA)"]] = qCodesObj[d[headingsObj["CPT/Product"]]]
    }


    if (d[headingsObj["Location"]] == "Southern Skies Dermatology") {
      d[headingsObj["Location"]] = "Trussville"
    }

    let rowData = new Array(destHeadings.length).fill("")
    for (const key in destHeadingsObj) {
      if (headingsObj[key] || headingsObj[key] === 0) {
        rowData[destHeadingsObj[key]] = d[headingsObj[key]]
      }
    }

    newData.push(rowData)

  })



  if (newData.length > 0) {
    destSheet.getRange(2, 1, newData.length, newData[0].length).setValues(newData);
  }


  if (destSheet.getLastRow() > 2 + newData.length) {
    destSheet.getRange(2 + newData.length, 1, destSheet.getLastRow() - (1 + newData.length), destSheet.getLastColumn()).clearContent();
  }




  let destinationFolder = DriveApp.getFolderById(EMA_SKIN_SUBS_BILLING_DESTINAION);

  let fileName = file.getName()
  let dataSet = "EMA Skin Subs Billing"

  let startDate = data[0][headingsObj["Transaction Date"]]
  let endDate = data[data.length - 1][headingsObj["Transaction Date"]]
  let updatedName = "EMA Skin Subs Billing  " + startDate.toLocaleDateString() + "-" + endDate.toLocaleDateString() + " Raw_ " + Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY")
  let link = file.getUrl();
  let dataSpreadsheetName = destSS.getName()
  let timeStamp = Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY HH:mm:ss")

  let rawLogRow = [fileName, dataSet, startDate.toLocaleDateString(), endDate.toLocaleDateString(), updatedName, link, dataSpreadsheetName, destinationFolder.getName(), timeStamp, newData.length]

  file.setName(updatedName)

  rawLogSheet.getRange(rawLogSheet.getLastRow() + 1, 1, 1, rawLogRow.length).setValues([rawLogRow])

  let destFoldRich = SpreadsheetApp.newRichTextValue().setText(destinationFolder.getName()).setLinkUrl(destinationFolder.getUrl()).build()
  let destSSRich = SpreadsheetApp.newRichTextValue().setText(destSS.getName()).setLinkUrl(destSS.getUrl()).build()

  rawLogSheet.getRange(rawLogSheet.getLastRow(), DEST_FOLDER_COL).setRichTextValue(destFoldRich)
  rawLogSheet.getRange(rawLogSheet.getLastRow(), DEST_SS_COL).setRichTextValue(destSSRich)



  file.moveTo(destinationFolder)


}








const PRE_EMA_BIOPSIES_DESTINAION = "1o-ZqzuuVXoLxteMCE40qBx5ppwduqZIR"
const PRE_EMA_BIOPSIES_SS_ID = "1NCjKtqQ9SBxDC5HH2R968c2-DrouJaGguPPULfAM06U"

function processPreEmaBiopsiesRawData_(rawLogSheet, file, headings, headingsObj, data) {

  let destSS = SpreadsheetApp.openById(PRE_EMA_BIOPSIES_SS_ID);

  let destSheet = destSS.getSheetByName("Pre-EMA Results");
  //let pathologies = destSheet.getRange(1, 1, destSheet.getLastRow(), destSheet.getLastColumn()).getValues();
  let destHeadings = destSheet.getRange(1, 1, 1, destSheet.getLastColumn() - 2).getValues()[0];
  let destHeadingsObj = {}
  destHeadings.forEach((h, i) => {
    destHeadingsObj[h.toString().trim()] = i
  })



  let newData = [];

  data.forEach(d => {



    let rowData = new Array(destHeadings.length).fill("")
    for (const key in destHeadingsObj) {
      if (headingsObj[key] || headingsObj[key] === 0) {
        rowData[destHeadingsObj[key]] = d[headingsObj[key]]
      }
    }

    newData.push(rowData)

  })



  if (newData.length > 0) {
    destSheet.getRange(2, 1, newData.length, newData[0].length).setValues(newData);
  }


  if (destSheet.getLastRow() > 2 + newData.length) {
    destSheet.getRange(2 + newData.length, 1, destSheet.getLastRow() - (1 + newData.length), destSheet.getLastColumn() - 2).clearContent();
  }




  let destinationFolder = DriveApp.getFolderById(PRE_EMA_BIOPSIES_DESTINAION);

  let fileName = file.getName()
  let dataSet = "Pre-EMA BIOPSIES"
  let startDate = data[data.length - 1][headingsObj["PATH RESULT RECEIVED DATE"]]
  let endDate = data[0][headingsObj["PATH RESULT RECEIVED DATE"]]
  let updatedName = "Pre-EMA BIOPSIES " + startDate + "-" + endDate + " Raw_ " + Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY")
  let link = file.getUrl();
  let dataSpreadsheetName = destSS.getName()
  let timeStamp = Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY HH:mm:ss")

  let rawLogRow = [fileName, dataSet, startDate, endDate, updatedName, link, dataSpreadsheetName, destinationFolder.getName(), timeStamp, newData.length]

  file.setName(updatedName)

  rawLogSheet.getRange(rawLogSheet.getLastRow() + 1, 1, 1, rawLogRow.length).setValues([rawLogRow])

  let destFoldRich = SpreadsheetApp.newRichTextValue().setText(destinationFolder.getName()).setLinkUrl(destinationFolder.getUrl()).build()
  let destSSRich = SpreadsheetApp.newRichTextValue().setText(destSS.getName()).setLinkUrl(destSS.getUrl()).build()

  rawLogSheet.getRange(rawLogSheet.getLastRow(), DEST_FOLDER_COL).setRichTextValue(destFoldRich)
  rawLogSheet.getRange(rawLogSheet.getLastRow(), DEST_SS_COL).setRichTextValue(destSSRich)




  file.moveTo(destinationFolder)


}








const MEDI_SKIN_SUBS_BILLING_DESTINAION = "1Y43L60vuzSVIgDoFRXA1s8PbSq8g1xPx"
const MEDI_SKIN_SUBS_BILLING_SS_ID = "12GakCSZ4ffkWZIAR4RlrCOI_ju5CJcs8n661GFtkO5M"

function processMedisysSkinSubsBillingRawData_(rawLogSheet, file, headings, headingsObj, data) {

  let destSS = SpreadsheetApp.openById(MEDI_SKIN_SUBS_BILLING_SS_ID);

  let skinSubsBillSheet = destSS.getSheetByName("Data");
  //let pathologies = skinSubsBillSheet.getRange(1, 1, skinSubsBillSheet.getLastRow(), skinSubsBillSheet.getLastColumn()).getValues();
  let skinSBHeadings = skinSubsBillSheet.getRange(1, 1, 1, skinSubsBillSheet.getLastColumn()).getValues()[0];
  let skinSBHeadingsObj = {}
  skinSBHeadings.forEach((h, i) => {
    skinSBHeadingsObj[h.toString().trim()] = i
  })



  let skinSBNew = [];

  data.forEach(d => {

    let splitProidersName = d[headingsObj["select1Desc"]].split(",").map(n => n.toString().trim()).reverse()
    d[headingsObj["select1Desc"]] = splitProidersName.join(" ").toUpperCase()


    let rowData = new Array(skinSBHeadings.length).fill("")
    for (const key in skinSBHeadingsObj) {
      if (headingsObj[key] || headingsObj[key] === 0) {
        rowData[skinSBHeadingsObj[key]] = d[headingsObj[key]]
      }
    }

    skinSBNew.push(rowData)

  })



  if (skinSBNew.length > 0) {
    skinSubsBillSheet.getRange(2, 1, skinSBNew.length, skinSBNew[0].length).setValues(skinSBNew);
  }


  if (skinSubsBillSheet.getLastRow() > 2 + skinSBNew.length) {
    skinSubsBillSheet.getRange(2 + skinSBNew.length, 1, skinSubsBillSheet.getLastRow() - (1 + skinSBNew.length), skinSubsBillSheet.getLastColumn()).clearContent();
  }




  let destinationFolder = DriveApp.getFolderById(MEDI_SKIN_SUBS_BILLING_DESTINAION);

  let fileName = file.getName()
  let dataSet = "Medisys Skin Substitute Billing"
  let startDate = data[0][headingsObj["service_date"]]
  let endDate = data[data.length - 1][headingsObj["service_date"]]
  let updatedName = "Medisys Skin Substitute Billing " + startDate + "-" + endDate + " Raw_ " + Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY")
  let link = file.getUrl();
  let dataSpreadsheetName = destSS.getName()
  let timeStamp = Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY HH:mm:ss")

  let rawLogRow = [fileName, dataSet, startDate, endDate, updatedName, link, dataSpreadsheetName, destinationFolder.getName(), timeStamp, skinSBNew.length]

  file.setName(updatedName)

  rawLogSheet.getRange(rawLogSheet.getLastRow() + 1, 1, 1, rawLogRow.length).setValues([rawLogRow])

  let destFoldRich = SpreadsheetApp.newRichTextValue().setText(destinationFolder.getName()).setLinkUrl(destinationFolder.getUrl()).build()
  let destSSRich = SpreadsheetApp.newRichTextValue().setText(destSS.getName()).setLinkUrl(destSS.getUrl()).build()

  rawLogSheet.getRange(rawLogSheet.getLastRow(), DEST_FOLDER_COL).setRichTextValue(destFoldRich)
  rawLogSheet.getRange(rawLogSheet.getLastRow(), DEST_SS_COL).setRichTextValue(destSSRich)




  file.moveTo(destinationFolder)




}




const EMA_PATHOLOGY_DESTINAION = "1KRiaqgxHkBgO17R7zrbafG1PDCNJ6wLE"
const EMA_PATHOLOGY_SS_ID = "1m2G45sB59kckTYnF2ZOL87MWQB3jVt5NABYk3s385z8"

function processEmaPathologyRawData_(rawLogSheet, file, headings, headingsObj, data) {


  let destSS = SpreadsheetApp.openById(EMA_PATHOLOGY_SS_ID);

  let pathSheet = destSS.getSheetByName("Data");
  //let pathologies = pathSheet.getRange(1, 1, pathSheet.getLastRow(), pathSheet.getLastColumn()).getValues();
  let pHeadings = pathSheet.getRange(1, 1, 1, pathSheet.getLastColumn()).getValues()[0];
  let pHeadingsObj = {}
  pHeadings.forEach((h, i) => {
    pHeadingsObj[h.toString().trim()] = i
  })



  let withLocation = [];
  let withoutLocation = []
  data.forEach(d => {


    let splitProidersName = d[headingsObj["Provider"]].split(",").map(n => n.toString().trim()).reverse()
    d[headingsObj["Provider"]] = splitProidersName.join(" ").toUpperCase()

    let splitPatientName = d[headingsObj["Patient Name"]].split(",").map(n => n.toString().trim()).reverse()
    d[headingsObj["Patient Name"]] = splitPatientName.join(" ").toUpperCase()


    if (d[headingsObj["Result Facility"]] == "Southern Skies Dermatology") {
      d[headingsObj["Result Facility"]] = "Trussville"
    }


    let rowData = new Array(pHeadings.length).fill("")
    for (const key in pHeadingsObj) {
      if (headingsObj[key] || headingsObj[key] === 0) {
        rowData[pHeadingsObj[key]] = d[headingsObj[key]]
      }
    }


    if (d[headingsObj["Result Facility"]] == "None") {
      withoutLocation.push(rowData)

    } else {
      withLocation.push(rowData)

    }

  })


  if (withLocation.length > 0) {
    pathSheet.getRange(2, 1, withLocation.length, withLocation[0].length).setValues(withLocation);
  }

  if (withoutLocation.length > 0) {
    pathSheet.getRange(2 + withLocation.length, 1, withoutLocation.length, withoutLocation[0].length).setValues(withoutLocation);
  }


  if (pathSheet.getLastRow() > 2 + withLocation.length + withoutLocation.length) {
    pathSheet.getRange(2 + withLocation.length + withoutLocation.length, 1, pathSheet.getLastRow() - (1 + withLocation.length + withoutLocation.length), pathSheet.getLastColumn()).clearContent();
  }



  let destinationFolder = DriveApp.getFolderById(EMA_PATHOLOGY_DESTINAION);

  let fileName = file.getName()
  let dataSet = "EMA Pathology"
  let endDate = data[0][headingsObj["Result Created Date"]]
  let startDate = data[data.length - 1][headingsObj["Result Created Date"]]
  let updatedName = "EMA Pathology " + startDate + "-" + endDate + " Raw_ " + Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY")
  let link = file.getUrl();
  let dataSpreadsheetName = destSS.getName()
  let timeStamp = Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY HH:mm:ss")

  let rawLogRow = [fileName, dataSet, startDate, endDate, updatedName, link, dataSpreadsheetName, destinationFolder.getName(), timeStamp, withLocation.length + withoutLocation.length]

  file.setName(updatedName)

  rawLogSheet.getRange(rawLogSheet.getLastRow() + 1, 1, 1, rawLogRow.length).setValues([rawLogRow])

  let destFoldRich = SpreadsheetApp.newRichTextValue().setText(destinationFolder.getName()).setLinkUrl(destinationFolder.getUrl()).build()
  let destSSRich = SpreadsheetApp.newRichTextValue().setText(destSS.getName()).setLinkUrl(destSS.getUrl()).build()

  rawLogSheet.getRange(rawLogSheet.getLastRow(), DEST_FOLDER_COL).setRichTextValue(destFoldRich)
  rawLogSheet.getRange(rawLogSheet.getLastRow(), DEST_SS_COL).setRichTextValue(destSSRich)




  file.moveTo(destinationFolder)



}








const MEDI_COLL_DESTINAION = "1if2uNEYbn6elmv_nICC3sKg78X5sVVGN"
const MEDI_COLL_SS_ID = "1SqBLgBofYZJlOvhiTuIeOTJ8JIGYregpTH18h6JZTFQ"

function processMediCollectionRawData_(rawLogSheet, file, headings, headingsObj, dataDisp, data) {


  data.sort(function (a, b) {
    return a[headingsObj["rpt_date"]] - b[headingsObj["rpt_date"]]
  });

  let startDate = data[0][headingsObj["rpt_date"]]
  let endDate = data[data.length - 1][headingsObj["rpt_date"]]
  let dataStartTime = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()).getTime()
  let dataEndTime = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() + 1).getTime()
  // Logger.log(data[0][headingsObj["Transaction Date"]])
  // return


  let destSS = SpreadsheetApp.openById(MEDI_COLL_SS_ID);

  let destSheet = destSS.getSheetByName("Collections");
  let collections = destSheet.getRange(1, 1, destSheet.getLastRow(), destSheet.getLastColumn()).getValues();
  let cHeadings = collections.splice(0, 1)[0]
  let cHeadingsObj = {}
  cHeadings.forEach((h, i) => {
    cHeadingsObj[h.toString().trim()] = i
  })


  let filterCollections = collections.filter(row => row[cHeadingsObj["rpt_date"]].getTime() < dataStartTime || row[cHeadingsObj["rpt_date"]].getTime() >= dataEndTime)



  dataDisp.forEach(d => {

    // if (d[headingsObj["Location"]] == "Southern Skies Dermatology") {
    //   d[headingsObj["Location"]] = "Trussville"
    // }

    let splitProidersName = d[headingsObj["doctor_name"]].split(",").map(n => n.toString().trim()).reverse()
    d[headingsObj["doctor_name"]] = splitProidersName.join(" ").toUpperCase()


    let rowData = new Array(cHeadings.length).fill("")
    for (const key in cHeadingsObj) {
      if (headingsObj[key] || headingsObj[key] === 0) {
        rowData[cHeadingsObj[key]] = d[headingsObj[key]]
      }
    }

    filterCollections.push(rowData)

  })


  if (destSheet.getLastRow() > 1) {
    destSheet.getRange(2, 1, destSheet.getLastRow() - 1, destSheet.getLastColumn()).clearContent()
  }

  if (filterCollections.length > 0) {
    destSheet.getRange(2, 1, filterCollections.length, filterCollections[0].length).setValues(filterCollections)
  }





  let destinationFolder = DriveApp.getFolderById(MEDI_COLL_DESTINAION);

  let fileName = file.getName()
  let dataSet = "Medisys Collections"
  let startDate1 = dataDisp[0][headingsObj["Transaction Date"]]
  let endDate1 = dataDisp[dataDisp.length - 1][headingsObj["Transaction Date"]]
  let updatedName = "Medisys Collections " + startDate1 + "-" + endDate1 + " Processed " + Utilities.formatDate(new Date(), "GMT-6", "dd/MM/YYYY")
  let link = file.getUrl();
  let dataSpreadsheetName = destSS.getName()
  let timeStamp = Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY HH:mm:ss")

  let rawLogRow = [fileName, dataSet, startDate1, endDate1, updatedName, link, dataSpreadsheetName, destinationFolder.getName(), timeStamp, filterCollections.length]

  file.setName(updatedName)

  rawLogSheet.getRange(rawLogSheet.getLastRow() + 1, 1, 1, rawLogRow.length).setValues([rawLogRow])

  let destFoldRich = SpreadsheetApp.newRichTextValue().setText(destinationFolder.getName()).setLinkUrl(destinationFolder.getUrl()).build()
  let destSSRich = SpreadsheetApp.newRichTextValue().setText(destSS.getName()).setLinkUrl(destSS.getUrl()).build()

  rawLogSheet.getRange(rawLogSheet.getLastRow(), DEST_FOLDER_COL).setRichTextValue(destFoldRich)
  rawLogSheet.getRange(rawLogSheet.getLastRow(), DEST_SS_COL).setRichTextValue(destSSRich)




  file.moveTo(destinationFolder)

}







const EMA_COLL_DESTINAION = "1VjxrgYRsElT2hYrCTScCFEmy2tX3CKgI"
const EMA_COLL_SS_ID = "1LE2fPKKi3adVWbh3izyJIzcBOw_-Gq34As76ztdkRSk"

function processEmaCollectionRawData_(rawLogSheet, file, headings, headingsObj, data) {


  data.sort(function (a, b) {
    return a[headingsObj["Transaction Date"]] - b[headingsObj["Transaction Date"]]
  });

  let startDate = data[0][headingsObj["Transaction Date"]]
  let endDate = data[data.length - 1][headingsObj["Transaction Date"]]
  let dataStartTime = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()).getTime()
  let dataEndTime = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() + 1).getTime()
  // Logger.log(data[0][headingsObj["Transaction Date"]])
  // return


  let destSS = SpreadsheetApp.openById(EMA_COLL_SS_ID);

  let collSheet = destSS.getSheetByName("Collections");
  let collections = collSheet.getRange(1, 1, collSheet.getLastRow(), collSheet.getLastColumn()).getValues();
  let cHeadings = collections.splice(0, 1)[0]
  let cHeadingsObj = {}
  cHeadings.forEach((h, i) => {
    cHeadingsObj[h.toString().trim()] = i
  })


  let filterCollections = collections.filter(row => row[cHeadingsObj["Transaction Date"]].getTime() < dataStartTime || row[cHeadingsObj["Transaction Date"]].getTime() >= dataEndTime)



  data.forEach(d => {

    if (d[headingsObj["Location"]] == "Southern Skies Dermatology") {
      d[headingsObj["Location"]] = "Trussville"
    }

    let splitProidersName = d[headingsObj["Primary Biller"]].split(",").map(n => n.toString().trim()).reverse()
    d[headingsObj["Primary Biller"]] = splitProidersName.join(" ").toUpperCase()


    let rowData = new Array(cHeadings.length).fill("")
    for (const key in cHeadingsObj) {
      if (headingsObj[key] || headingsObj[key] === 0) {
        rowData[cHeadingsObj[key]] = d[headingsObj[key]]
      }
    }

    filterCollections.push(rowData)

  })


  if (collSheet.getLastRow() > 1) {
    collSheet.getRange(2, 1, collSheet.getLastRow() - 1, collSheet.getLastColumn()).clearContent()
  }

  if (filterCollections.length > 0) {
    collSheet.getRange(2, 1, filterCollections.length, filterCollections[0].length).setValues(filterCollections)
  }





  let destinationFolder = DriveApp.getFolderById(EMA_COLL_DESTINAION);

  let fileName = file.getName()
  let dataSet = "EMA Collections"
  //let startDate = data[0][headingsObj["Transaction Date"]]
  //let endDate = data[data.length - 1][headingsObj["Transaction Date"]]
  let updatedName = "EMA Collections " + startDate.toLocaleDateString() + "-" + endDate.toLocaleDateString() + " Raw_ " + Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY")
  let link = file.getUrl();
  let dataSpreadsheetName = destSS.getName()
  let timeStamp = Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY HH:mm:ss")

  let rawLogRow = [fileName, dataSet, startDate, endDate, updatedName, link, dataSpreadsheetName, destinationFolder.getName(), timeStamp, filterCollections.length]

  file.setName(updatedName)

  rawLogSheet.getRange(rawLogSheet.getLastRow() + 1, 1, 1, rawLogRow.length).setValues([rawLogRow])

  let destFoldRich = SpreadsheetApp.newRichTextValue().setText(destinationFolder.getName()).setLinkUrl(destinationFolder.getUrl()).build()
  let destSSRich = SpreadsheetApp.newRichTextValue().setText(destSS.getName()).setLinkUrl(destSS.getUrl()).build()

  rawLogSheet.getRange(rawLogSheet.getLastRow(), DEST_FOLDER_COL).setRichTextValue(destFoldRich)
  rawLogSheet.getRange(rawLogSheet.getLastRow(), DEST_SS_COL).setRichTextValue(destSSRich)




  file.moveTo(destinationFolder)

}




const EMA_APPT_DESTINAION = "1BXzsQ9mLm3OjIi5XS4Xoxe0jwPaB2Wjy"
const EMA_APPT_SS_ID = "10itZumv5xj-LkjfiajY97HMcq-63cXvd4zgZfiQyCxU"


// function processEmaApptRawData_Old(rawLogSheet, file, headings, headingsObj, data) {


//   let destSS = SpreadsheetApp.openById(EMA_APPT_SS_ID);

//   let apptSheet = destSS.getSheetByName("Appointments")
//   let currentAppts = apptSheet.getRange(1, 1, apptSheet.getLastRow(), apptSheet.getLastColumn() - 1).getValues();
//   let caHeadings = currentAppts.splice(0, 1)[0]
//   let caHeadingsObj = {}
//   caHeadings.forEach((h, i) => {
//     caHeadingsObj[h.toString().trim()] = i
//   })


//   let countOfNewRows = data.length - currentAppts.length

//   let apptCodesSheet = destSS.getSheetByName("Appts Codes");
//   let apptCodes = apptCodesSheet.getRange(2, 1, apptCodesSheet.getLastRow() - 1, 2).getValues()
//   let types = apptCodes.map(r => r[0])


//   let currentApptIds = currentAppts.map(row => row[caHeadingsObj["Appointment ID"]])


//   data.forEach(d => {

//     if (d[headingsObj["Location"]] == "Southern Skies Dermatology") {
//       d[headingsObj["Location"]] = "Trussville"
//     }

//     //if (d[headingsObj["Primary Provider"]].includes(",")) {
//     let splitProidersName = d[headingsObj["Primary Provider"]].split(",").map(n => n.toString().trim()).reverse()
//     d[headingsObj["Primary Provider"]] = splitProidersName.join(" ").toUpperCase()
//     //}

//     let splitBillersName = d[headingsObj["Primary Biller"]].split(",").map(n => n.toString().trim()).reverse()
//     d[headingsObj["Primary Biller"]] = splitBillersName.join(" ").toUpperCase()


//     let splitPatientsName = d[headingsObj["Patient Name"]].split(",").map(n => n.toString().trim()).reverse()
//     d[headingsObj["Patient Name"]] = splitPatientsName.join(" ").toUpperCase()


//     let typeIndex = types.indexOf(d[headingsObj["Appointment Type"]]);
//     if (typeIndex > -1) {
//       d[headingsObj["Appointment Type"]] = apptCodes[typeIndex][1]
//     }

//     //"Appointment Status"
//     if (d[headingsObj["Appointment Status"]] == "No Show") {
//       d[headingsObj["Appointment Status"]] = "NSW"
//     } else if (d[headingsObj["Appointment Status"]] == "Cancelled") {
//       d[headingsObj["Appointment Status"]] = "CX"
//     }


//     let indexOfApptId = currentApptIds.indexOf(d[headingsObj["Appointment ID"]])
//     if (indexOfApptId == -1) {

//       let rowData = new Array(caHeadings.length).fill("")
//       for (const key in caHeadingsObj) {
//         if (headingsObj[key] || headingsObj[key] === 0) {
//           rowData[caHeadingsObj[key]] = d[headingsObj[key]]
//         }
//       }
//       currentAppts.push(rowData)
//       currentApptIds.push(d[headingsObj["Appointment ID"]])

//     } else {
//       for (const key in caHeadingsObj) {
//         if (headingsObj[key] || headingsObj[key] === 0) {
//           currentAppts[indexOfApptId][caHeadingsObj[key]] = d[headingsObj[key]]
//         }
//       }
//     }


//   })



//   if (currentAppts.length > 0) {
//     apptSheet.getRange(2, 1, currentAppts.length, currentAppts[0].length).setValues(currentAppts)

//     apptSheet.getRange(2, 1, apptSheet.getLastRow() - 1, apptSheet.getLastColumn()).sort([{ column: 2, ascending: true }, { column: 3, ascending: true }])
//   }


//   let destinationFolder = DriveApp.getFolderById(EMA_APPT_DESTINAION);

//   let fileName = file.getName()
//   let dataSet = "EMA Appointments"
//   let startDate = data[0][headingsObj["Appointment Date"]]
//   let endDate = data[data.length - 2][headingsObj["Appointment Date"]]
//   let updatedName = "EMA Appointments " + startDate + "-" + endDate + " Raw_ " + Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY")
//   let link = file.getUrl();
//   let dataSpreadsheetName = destSS.getName()
//   let timeStamp = Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY HH:mm:ss")

//   let rawLogRow = [fileName, dataSet, startDate, endDate, updatedName, link, dataSpreadsheetName, destinationFolder.getName(), timeStamp, countOfNewRows]

//   file.setName(updatedName)

//   rawLogSheet.getRange(rawLogSheet.getLastRow() + 1, 1, 1, rawLogRow.length).setValues([rawLogRow])


//   let destFoldRich = SpreadsheetApp.newRichTextValue().setText(destinationFolder.getName()).setLinkUrl(destinationFolder.getUrl()).build()
//   let destSSRich = SpreadsheetApp.newRichTextValue().setText(destSS.getName()).setLinkUrl(destSS.getUrl()).build()

//   rawLogSheet.getRange(rawLogSheet.getLastRow(), DEST_FOLDER_COL).setRichTextValue(destFoldRich)
//   rawLogSheet.getRange(rawLogSheet.getLastRow(), DEST_SS_COL).setRichTextValue(destSSRich)

//   file.moveTo(destinationFolder)

// }




function processEmaApptRawData_(rawLogSheet, file, headings, headingsObj, data) {
  const destSS = SpreadsheetApp.openById(EMA_APPT_SS_ID);
  // const apptSheet = destSS.getSheetByName("Appointments");

  // // Get current data from "Appointments"
  // const lastRow = apptSheet.getLastRow();
  // const lastColumn = apptSheet.getLastColumn();
  // const currentAppts = lastRow > 1 ? apptSheet.getRange(2, 1, lastRow - 1, lastColumn).getValues() : [];


  const range = "Appointments!A1:AL";
  const currentAppts = Sheets.Spreadsheets.Values.get(EMA_APPT_SS_ID, range).values;

  // Extract headings
  const caHeadings = currentAppts.splice(0, 1)[0];
  const caHeadingsObj = caHeadings.reduce((obj, h, i) => { obj[h.toString().trim()] = i; return obj; }, {});

  // Convert current Appointment IDs to a Set for faster lookups
  const currentApptIdMap = new Map(currentAppts.map((row, index) => [row[caHeadingsObj["Appointment ID"]], index]));

  // Get Appointment Codes and create a lookup map
  const apptCodesSheet = destSS.getSheetByName("Appts Codes");
  const apptCodes = apptCodesSheet.getRange(2, 1, apptCodesSheet.getLastRow() - 1, 2).getValues();
  const apptCodeMap = Object.fromEntries(apptCodes);

  let newRows = []; // To store new rows to append
  let countOfNewRows = 0;

  // Process Data
  for (let d of data) {
    if (d[headingsObj["Location"]] === "Southern Skies Dermatology") {
      d[headingsObj["Location"]] = "Trussville";
    }

    // Transform names (Primary Provider, Primary Biller, Patient Name)
    ["Primary Provider", "Primary Biller", "Patient Name"].forEach(field => {
      if (d[headingsObj[field]]) {
        d[headingsObj[field]] = d[headingsObj[field]].split(",").map(n => n.trim()).reverse().join(" ").toUpperCase();
      }
    });

    // Replace Appointment Type
    if (apptCodeMap[d[headingsObj["Appointment Type"]]]) {
      d[headingsObj["Appointment Type"]] = apptCodeMap[d[headingsObj["Appointment Type"]]];
    }

    // Standardize Appointment Status
    if (d[headingsObj["Appointment Status"]] === "No Show") {
      d[headingsObj["Appointment Status"]] = "NSW";
    } else if (d[headingsObj["Appointment Status"]] === "Cancelled") {
      d[headingsObj["Appointment Status"]] = "CX";
    }

    let appointmentId = d[headingsObj["Appointment ID"]];
    let rowData = new Array(caHeadings.length).fill("");

    for (const key in caHeadingsObj) {
      if (headingsObj[key] !== undefined) {
        rowData[caHeadingsObj[key]] = d[headingsObj[key]];
      }
    }

    // If new appointment, append to `newRows`
    if (!currentApptIdMap.has(appointmentId)) {
      newRows.push(rowData);
      countOfNewRows++;
      currentApptIdMap.set(appointmentId, currentAppts.length + newRows.length - 1);
    } else { // If existing, update in `currentAppts`
      let existingIndex = currentApptIdMap.get(appointmentId);
      currentAppts[existingIndex] = rowData;
    }
  }

  const batchData = [];
  if (newRows.length > 0) {
    batchData.push({
      range: `Appointments!A2`,
      values: [...currentAppts, ...newRows]
    });

    Sheets.Spreadsheets.Values.batchUpdate(
      { valueInputOption: "USER_ENTERED", data: batchData },
      EMA_APPT_SS_ID
    );
  }



  // Log File Updates
  const destinationFolder = DriveApp.getFolderById(EMA_APPT_DESTINAION);
  const fileName = file.getName();
  const dataSet = "EMA Appointments";
  const startDate = data[0][headingsObj["Appointment Date"]];
  const endDate = data[data.length - 2][headingsObj["Appointment Date"]];
  const updatedName = `EMA Appointments ${startDate}-${endDate} Raw_ ${Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY")}`;
  const link = file.getUrl();
  const timeStamp = Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY HH:mm:ss");

  const rawLogRow = [fileName, dataSet, startDate, endDate, updatedName, link, destSS.getName(), destinationFolder.getName(), timeStamp, countOfNewRows];

  file.setName(updatedName);
  rawLogSheet.appendRow(rawLogRow);

  // Add Rich Text Links
  const destFoldRich = SpreadsheetApp.newRichTextValue().setText(destinationFolder.getName()).setLinkUrl(destinationFolder.getUrl()).build();
  const destSSRich = SpreadsheetApp.newRichTextValue().setText(destSS.getName()).setLinkUrl(destSS.getUrl()).build();

  const lastLogRow = rawLogSheet.getLastRow();
  rawLogSheet.getRange(lastLogRow, DEST_FOLDER_COL).setRichTextValue(destFoldRich);
  rawLogSheet.getRange(lastLogRow, DEST_SS_COL).setRichTextValue(destSSRich);

  file.moveTo(destinationFolder);
}








//1uYQ47fYin5NdnEAAMLao3QMHZ925Xxd9

const CREDIT_CARD_DESTINATION = "1uYQ47fYin5NdnEAAMLao3QMHZ925Xxd9"
const CREDIT_CARD_SS_ID = "1ABS6vkYmACTT-Rx_xiEWVjbI1zEP3SFfxt5UC6H-eUg"

function processCreditCardRawData_(rawLogSheet, file, headings, headingsObj, csvData) {



  let destSS = SpreadsheetApp.openById(CREDIT_CARD_SS_ID);
  let destSheet = destSS.getSheetByName("Data");
  let ccHeadings = destSheet.getRange(1, 1, 1, destSheet.getLastColumn()).getValues()[0]
  let ccHeadingsObj = {}
  ccHeadings.forEach((h, i) => {
    ccHeadingsObj[h.toString().trim()] = i
  })

  //Logger.log(fbHeadingsObj)

  let fbData = [];
  if (destSheet.getLastRow() > 1) {
    fbData = destSheet.getRange(2, 1, destSheet.getLastRow() - 1, destSheet.getLastColumn()).getDisplayValues()
  }



  let newData = [];
  csvData.forEach(row => {
    let rowData = new Array(ccHeadings.length).fill("")



    for (const key in ccHeadingsObj) {
      if (headingsObj[key] || headingsObj[key] === 0) {
        if (key == "Amount") {
          if (row[headingsObj[key]] > 0) {
            rowData[ccHeadingsObj[key]] = row[headingsObj[key]]
          } else {
            rowData[ccHeadingsObj[key]] = -1 * row[headingsObj[key]]
          }
        } else {
          rowData[ccHeadingsObj[key]] = row[headingsObj[key]]
        }
      }
    }

    let foundFlage = false
    for (var i = 0; i < fbData.length; i++) {
      //let formateDate = Utilities.formatDate(fbData[i][fbHeadingsObj["Date"]], "GMT-6", "dd/MM/YYYY")
      //fbData[i][fbHeadingsObj["Date"]] = formateDate

      for (const key in ccHeadingsObj) {
        if (key != "Payee ID" && key != "Card") {
          if (rowData[ccHeadingsObj[key]] == fbData[i][ccHeadingsObj[key]]) {
            foundFlage = true
          } else {
            foundFlage = false
            break
          }
        }
      }

      if (foundFlage == true) {
        break
      }

    }
    if (foundFlage == false) {
      if ((rowData[ccHeadingsObj["Card"]] != "" && rowData[ccHeadingsObj["Card"]] != null) || (rowData[ccHeadingsObj["Transaction Date"]] != "" && rowData[ccHeadingsObj["Transaction Date"]] != null)) {
        newData.push(rowData)
      }
    }

  })







  let payeeSS = SpreadsheetApp.openById(VENDOR_EXPENSES_SS_ID)
  let uniquePayeeSheet = payeeSS.getSheetByName(VENDOR_UNIQUE_PAYEE_SHEET)
  let uniquePayee = uniquePayeeSheet.getRange(4, 1, uniquePayeeSheet.getLastRow() - 3, uniquePayeeSheet.getLastColumn()).getDisplayValues().filter(r => r[1] != "" && r[1] != null)



  newData.forEach(row => {

    for (var i = 0; i < uniquePayee.length; i++) {
      if (row[ccHeadingsObj["Description"]].toString().toLowerCase().includes(uniquePayee[i][1].toString().toLowerCase())) {
        row[ccHeadingsObj["Payee ID"]] = uniquePayee[i][0]
        break

      } else if (uniquePayee[i][16] != "" && uniquePayee[i][16] != "Check #" && row[ccHeadingsObj["Description"]].toString().toLowerCase().includes(uniquePayee[i][16].toString().toLowerCase().replace("check #", "").trim())) {
        row[ccHeadingsObj["Payee ID"]] = uniquePayee[i][0]
        break
      }
    }
  })

  if (newData.length > 0) {
    destSheet.getRange(destSheet.getLastRow() + 1, 1, newData.length, newData[0].length).setValues(newData)
  }



  let destinationFolder = DriveApp.getFolderById(CREDIT_CARD_DESTINATION);

  let fileName = file.getName()
  let dataSet = "Credit Card"
  let startDate = csvData[csvData.length - 2][headingsObj["Transaction Date"]]
  let endDate = csvData[0][headingsObj["Transaction Date"]]

  let updatedName = "Credit Card " + startDate + "-" + endDate + " Raw_ " + Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY")
  let link = file.getUrl();
  let dataSpreadsheetName = destSS.getName()
  let timeStamp = Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY HH:mm:ss")

  let rawLogRow = [fileName, dataSet, startDate, endDate, updatedName, link, dataSpreadsheetName, destinationFolder.getName(), timeStamp, newData.length]

  file.setName(updatedName)


  rawLogSheet.getRange(rawLogSheet.getLastRow() + 1, 1, 1, rawLogRow.length).setValues([rawLogRow])


  let destFoldRich = SpreadsheetApp.newRichTextValue().setText(destinationFolder.getName()).setLinkUrl(destinationFolder.getUrl()).build()
  let destSSRich = SpreadsheetApp.newRichTextValue().setText(destSS.getName()).setLinkUrl(destSS.getUrl()).build()

  rawLogSheet.getRange(rawLogSheet.getLastRow(), DEST_FOLDER_COL).setRichTextValue(destFoldRich)
  rawLogSheet.getRange(rawLogSheet.getLastRow(), DEST_SS_COL).setRichTextValue(destSSRich)





  file.moveTo(destinationFolder)


}




const FIRST_BANK_DESTINATION = "1QK1mhLtx_l63Z2EuwUxWyafvSmgtSUYr"
const FIRST_BANK_SS_ID = "1v8EDTszT520Rixmwxw-wGiPTLfr9JZE2Ahl9hSmjzQ8"
const VENDOR_EXPENSES_SS_ID = "1W-SOL_z6tHSj3DVqrzq8DQSd1ECOrlwSCIIY0Ov-ucM"

const VENDOR_UNIQUE_PAYEE_SHEET = "Unique Payees"
const VENDOR_TRANSACTIONS_SHEET = "All Bank & CC Transactions_ (Editable)"


function processFirstBankRawData_(rawLogSheet, file, headings, headingsObj, csvData) {



  let destSS = SpreadsheetApp.openById(FIRST_BANK_SS_ID);
  let fbankSheet = destSS.getSheetByName("Data");
  let fbHeadings = fbankSheet.getRange(1, 1, 1, fbankSheet.getLastColumn()).getValues()[0]
  let fbHeadingsObj = {}
  fbHeadings.forEach((h, i) => {
    fbHeadingsObj[h.toString().trim()] = i
  })

  let allIds = fbankSheet.getRange(1, 1, fbankSheet.getLastRow(), 1).getDisplayValues().map(r => r[0]);


  //Logger.log(fbHeadingsObj)

  let fbData = [];
  if (fbankSheet.getLastRow() > 1) {
    fbData = fbankSheet.getRange(2, 1, fbankSheet.getLastRow() - 1, fbankSheet.getLastColumn()).getDisplayValues()
  }



  let newData = [];
  csvData.forEach(row => {

    let id = row[0] + "-" + row[1] + "-" + row[2] + "-" + row[3] + "-" + row[4] + "-" + row[5] + "-" + row[6] + "-" + row[7]

    if (allIds.indexOf(id) == -1) {
      let rowData = new Array(fbHeadings.length).fill("")

      for (const key in fbHeadingsObj) {
        if (headingsObj[key] || headingsObj[key] === 0) {
          rowData[fbHeadingsObj[key]] = row[headingsObj[key]]
        }
      }


      rowData[fbHeadingsObj["ID"]] = id



      if ((rowData[fbHeadingsObj["Date"]] != "" && rowData[fbHeadingsObj["Date"]] != null) || (rowData[fbHeadingsObj["Account Number"]] != "" && rowData[fbHeadingsObj["Account Number"]] != null)) {
        if (!rowData[fbHeadingsObj["Description"]].includes("Memo Credit : ")) {
          newData.push(rowData)
        }
      }

      allIds.push(id)

    }



  })







  let payeeSS = SpreadsheetApp.openById(VENDOR_EXPENSES_SS_ID)
  let uniquePayeeSheet = payeeSS.getSheetByName(VENDOR_UNIQUE_PAYEE_SHEET)
  let uniquePayee = uniquePayeeSheet.getRange(4, 1, uniquePayeeSheet.getLastRow() - 3, uniquePayeeSheet.getLastColumn()).getDisplayValues().filter(r => r[1] != "" && r[1] != null)

  let vendorTrxsSheet = payeeSS.getSheetByName(VENDOR_TRANSACTIONS_SHEET)
  let vendorTrxs = vendorTrxsSheet.getRange(2, 1, vendorTrxsSheet.getLastRow() - 1, vendorTrxsSheet.getLastColumn()).getDisplayValues().filter(r => r[3] != "" && r[3] != null)

  let vendorsChecks = vendorTrxs.map(r => r[3])

  newData.forEach(row => {

    if (row[fbHeadingsObj["Description"]].toString().toLowerCase().includes("transfer")) {
      row[fbHeadingsObj["Trx Type"]] = "Transfer"
    } else if (row[fbHeadingsObj["Debit"]] != "" && row[fbHeadingsObj["Debit"]] != null) {
      row[fbHeadingsObj["Trx Type"]] = "Expense"
    } else {
      row[fbHeadingsObj["Trx Type"]] = "Deposit"
    }

    if (row[fbHeadingsObj["Check/Ref #"]] != "") {
      let checkIndex = vendorsChecks.indexOf(row[fbHeadingsObj["Check/Ref #"]])
      if (checkIndex > -1) {
        for (var i = 0; i < uniquePayee.length; i++) {
          if (uniquePayee[i][1].toString().toLowerCase() == vendorTrxs[checkIndex][6].toString().toLowerCase()) {


            row[fbHeadingsObj["Payee ID"]] = uniquePayee[i][0]
            break
          }
        }
      }
    }




    for (var i = 0; i < uniquePayee.length; i++) {

      if (uniquePayee[i][16] != "") {
        if (uniquePayee[i][16] != "Check #" && uniquePayee[i][16] != "Check" && row[fbHeadingsObj["Description"]].toString().toLowerCase().includes(uniquePayee[i][16].toString().toLowerCase().replace("check #", "").trim())) {

          row[fbHeadingsObj["Payee ID"]] = uniquePayee[i][0]
          break
        }
      } else if (uniquePayee[i][16] != "Check #" && row[fbHeadingsObj["Description"]].toString().toLowerCase().includes(uniquePayee[i][1].toString().toLowerCase())) {
        row[fbHeadingsObj["Payee ID"]] = uniquePayee[i][0]
        break

      }

    }
  })

  if (newData.length > 0) {
    fbankSheet.getRange(fbankSheet.getLastRow() + 1, 1, newData.length, newData[0].length).setValues(newData)
  }



  let destinationFolder = DriveApp.getFolderById(FIRST_BANK_DESTINATION);

  let fileName = file.getName()
  let dataSet = "First Bank"
  let startDate = csvData[0][headingsObj["Date"]]
  let endDate = csvData[csvData.length - 2][headingsObj["Date"]]
  let updatedName = "First Bank " + startDate + "-" + endDate + " Raw_ " + Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY")
  let link = file.getUrl();
  let dataSpreadsheetName = destSS.getName()
  let timeStamp = Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY HH:mm:ss")

  let rawLogRow = [fileName, dataSet, startDate, endDate, updatedName, link, dataSpreadsheetName, destinationFolder.getName(), timeStamp, newData.length]

  file.setName(updatedName)


  rawLogSheet.getRange(rawLogSheet.getLastRow() + 1, 1, 1, rawLogRow.length).setValues([rawLogRow])


  let destFoldRich = SpreadsheetApp.newRichTextValue().setText(destinationFolder.getName()).setLinkUrl(destinationFolder.getUrl()).build()
  let destSSRich = SpreadsheetApp.newRichTextValue().setText(destSS.getName()).setLinkUrl(destSS.getUrl()).build()

  rawLogSheet.getRange(rawLogSheet.getLastRow(), DEST_FOLDER_COL).setRichTextValue(destFoldRich)
  rawLogSheet.getRange(rawLogSheet.getLastRow(), DEST_SS_COL).setRichTextValue(destSSRich)


  file.moveTo(destinationFolder)


}













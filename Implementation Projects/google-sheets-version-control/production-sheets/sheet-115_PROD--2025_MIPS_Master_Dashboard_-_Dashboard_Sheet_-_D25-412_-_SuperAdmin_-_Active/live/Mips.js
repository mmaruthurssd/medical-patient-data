


const EMA_MIPS_VISITS_PROCESSING_DATA_SS_ID = "1zp4b4XTpeUzv7VfA3aRKFYo2rV1W09IIHxufEe1Uco0";


const EMA_MIPS_VISITS_RAW_DATA_SHEETS = ["Tobacco", "Melanoma", "Psoriasis: Systemic Medications", "Adolescents", "Dermatitis: Itch Severity", "Psoriasis: Itch Severity"]



const YEAR = 2025


function onOpen() {
  let ui = SpreadsheetApp.getUi();

  let menu = ui.createMenu("Custom");

  menu.addItem("Fetch Processed Visits", "fetchNewEMAMIPSVisits").addToUi()
  menu.addItem("Group MIPS Visits X Week", "processVisitsGroupingData").addToUi()

  // menu.addItem("Group MM", "providersGroupingProcessMM").addToUi()
  // menu.addItem("Group AK", "providersGroupingProcessAK").addToUi()
  // menu.addItem("Group LM", "providersGroupingProcessLM").addToUi()
  // menu.addItem("Group KP", "providersGroupingProcessKP").addToUi()

}




function fetchNewEMAMIPSVisits() {

  //return

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const visitSheet = ss.getSheetByName("All MIPS Visits (Main)");

  visitSheet.getRange("A2:N").clearContent()


  const mipsProcessingSS = SpreadsheetApp.openById(EMA_MIPS_VISITS_PROCESSING_DATA_SS_ID);

  let uniqueProcessingSheet = mipsProcessingSS.getSheetByName("Unique MIPS Visit Data (Most recent Dataset)");
  let allVisitsV = uniqueProcessingSheet.getRange(1, 3, uniqueProcessingSheet.getLastRow(), 14).getValues();
  allVisitsV.splice(0, 1)

  uniqueProcessingSheet.getRange("C2:P").setNumberFormat("@STRING@");

  SpreadsheetApp.flush()
  Utilities.sleep(1000)

  let allVisitsRich = uniqueProcessingSheet.getRange(1, 3, uniqueProcessingSheet.getLastRow(), 14).getRichTextValues();
  allVisitsRich.splice(0, 1)

  // let allVisits2Columns = uniqueProcessingSheet.getRange(1, 14, uniqueProcessingSheet.getLastRow(), 2).getValues();
  // allVisits2Columns.splice(0,1)

  uniqueProcessingSheet.getRange("F2:F").setNumberFormat("MM/dd/yyyy");


  let filteredAllVisitsRich = []
  for (var i = 0; i < allVisitsV.length; i++) {
    if (isValidDate_(allVisitsV[i][3]) && allVisitsV[i][3].getFullYear() == YEAR) {
      filteredAllVisitsRich.push(allVisitsRich[i])
    }
  }


  if (filteredAllVisitsRich.length != 0) {
    visitSheet.getRange(2, 1, filteredAllVisitsRich.length, filteredAllVisitsRich[0].length).setRichTextValues(filteredAllVisitsRich)
    //visitSheet.getRange(2, 11, allVisits2Columns.length, allVisits2Columns[0].length).setValues(allVisits2Columns)
  }


  processAllVisitsToFix()

  try {
    storeScriptTimestamp_("Fetch Processed Visits")
  } catch (err) { }

}


function storeScriptTimestamp_(functionName) {
  let ss = SpreadsheetApp.openById("1zp4b4XTpeUzv7VfA3aRKFYo2rV1W09IIHxufEe1Uco0");
  let sheet = ss.getSheetByName("Mips Script Log")
  let row = [new Date(), functionName, Session.getActiveUser()];

  sheet.getRange(sheet.getLastRow() + 1, 1, 1, row.length).setValues([row])
}










//below function will return true if the arg is valid date and false if not.
function isValidDate_(d) {
  if (Object.prototype.toString.call(d) !== "[object Date]")
    return false;
  return !isNaN(d.getTime());
}




function processAllVisitsToFix() {



  let ss = SpreadsheetApp.getActiveSpreadsheet()
  let sourceSheet = ss.getSheetByName(SOURCE_SHEET_NAME)

  let sourceHeaders = sourceSheet.getRange("A1:N1").getDisplayValues()[0];
  let sourceHeadingObj = {};
  for (var i = 0; i < sourceHeaders.length; i++) {
    sourceHeadingObj[sourceHeaders[i]] = i
  }

  sourceSheet.getRange("A2:R").sort([{ column: 4, ascending: false }])
  sourceSheet.getRange("A2:N").setNumberFormat("@STRING@");
  SpreadsheetApp.flush()
  Utilities.sleep(1000)
  let sourceDataR = sourceSheet.getRange("A2:N").getRichTextValues()
  let sourceData = sourceSheet.getRange("A2:N").getDisplayValues()
  sourceSheet.getRange("D2:D").setNumberFormat("MM/dd/yyyy");




  const sheet = ss.getSheetByName("Visits to Fix");
  let allExistingIds = sheet.getRange("I:I").getDisplayValues().map(r => r[0]);
  let allExistingShortIds = sheet.getRange("T:T").getDisplayValues().map(r => r[0]);
  let allExistingOverride = sheet.getRange("H:H").getDisplayValues()


  const destHeaders = sheet.getRange("C1:T1").getDisplayValues()[0];
  let destHeadersObj = {}
  for (var i = 0; i < destHeaders.length; i++) {
    destHeadersObj[destHeaders[i]] = i
  }



  sourceDataR = sourceDataR.filter(r => (r[11].getText().includes("Unfavorable") || r[11].getText().includes("Exception")))
  sourceData = sourceData.filter(r => (r[11].includes("Unfavorable") || r[11].includes("Exception")))

  //Logger.log(sourceData.length)
  //Logger.log(sourceDataR.length)

  //let overRide = [];
  let newDataR = [];
  let emptyFalseRichText = SpreadsheetApp.newRichTextValue().setText(false).setLinkUrl(null).build()
  let emptyRichText = SpreadsheetApp.newRichTextValue().setText("").setLinkUrl(null).build()

  //let alreadyProcessed = [];
  //let alreadyProcessedReplacing = []
  for (var i = 0; i < sourceData.length; i++) {




    let existingIdIndex = allExistingIds.indexOf(sourceData[i][0])


    let newShortID = sourceData[i][2] + sourceData[i][6]
    // let existingShortIdIndex = allExistingShortIds.indexOf(newShortID)
    // let processedIndex = alreadyProcessed.indexOf(newShortID)
    // let processedReplacingIndex = alreadyProcessedReplacing.indexOf(newShortID)



    if (existingIdIndex > -1) {

      allExistingOverride[existingIdIndex][0] = sourceData[i][12]


      // if (existingIdIndex == -1 && allExistingOverride[existingShortIdIndex] == "Select Override" && processedReplacingIndex == -1) {

      //   sheet.deleteRows(existingShortIdIndex + 1, 1)
      //   allExistingIds.splice(existingShortIdIndex, 1)
      //   allExistingOverride.splice(existingShortIdIndex, 1)

      //   if ((sourceData[i][11].includes("Unfavorable") || sourceData[i][11].includes("Exception"))) {
      //     let rowData = new Array(destHeaders.length).fill("")
      //     for (const key in destHeadersObj) {
      //       if (sourceHeadingObj[key] || sourceHeadingObj[key] === 0) {
      //         rowData[destHeadersObj[key]] = sourceDataR[i][sourceHeadingObj[key]]
      //       }
      //     }
      //     rowData[destHeadersObj["Fixed per the 'Front Desk - Past Visits to Fix' Sheet (Overrided completed)"]] = emptyRichText
      //     rowData[destHeadersObj['Note has been Amended (by someone other than Provider)']] = emptyFalseRichText
      //     rowData[destHeadersObj['Override Completed']] = emptyFalseRichText

      //     rowData[destHeadersObj['Short ID']] = SpreadsheetApp.newRichTextValue().setText(newShortID).setLinkUrl(null).build()
      //     newDataR.push(rowData)

      //   }


      //   alreadyProcessedReplacing.push(newShortID)


      // } else if (processedIndex == -1 && existingIdIndex > -1) {
      //   allExistingOverride[existingIdIndex][0] = sourceData[i][12]
      //   alreadyProcessed.push(newShortID)
      // }










    } else {

      //if (sourceData[i][11].includes("Unfavorable") || sourceData[i][11].includes("Exception")) {

      let rowData = new Array(destHeaders.length).fill("")

      for (const key in destHeadersObj) {
        if (sourceHeadingObj[key] || sourceHeadingObj[key] === 0) {
          rowData[destHeadersObj[key]] = sourceDataR[i][sourceHeadingObj[key]]
        }
      }

      rowData[destHeadersObj["Fixed per the 'Front Desk - Past Visits to Fix' Sheet (Overrided completed)"]] = emptyRichText
      rowData[destHeadersObj['Note has been Amended (by someone other than Provider)']] = emptyFalseRichText
      rowData[destHeadersObj['Override Completed']] = emptyFalseRichText

      rowData[destHeadersObj['Short ID']] = SpreadsheetApp.newRichTextValue().setText(newShortID).setLinkUrl(null).build()

      newDataR.push(rowData)
      //}
    }
  }


  sheet.getRange(1, 8, allExistingOverride.length, 1).setValues(allExistingOverride)


  //Logger.log(newDataR.length)

  if (newDataR.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 3, newDataR.length, newDataR[0].length).setRichTextValues(newDataR);
  }

  sortVisitstoFix(sheet)

}















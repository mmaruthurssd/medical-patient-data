



const Immunizations_SS_ID = "1AI0bD4mTrANkMXKcf68znii77wcpKS9kb3829C_x4EQ"
const Psoriasis_Clinical_SS_ID = "1WaTveWWOEhEhTYGgDrMBqxi9RuJtvP4HG14J4zJS7Ec"
const Melanoma_SS_ID = "12Yxep907Arc3IrIl4pPR5ra13NiXsuwysWc9LbLH6iA"
const Preventive_Care_SS_ID = "1Cb724_lFAbc0tuE6bssi1-yrGex589ucVznqqSdtYQ0"
const Dermatitis_SS_ID = "10r6PinEsRQeIoQELYciu0HWRecga_aVjONH0ymAP9Po"
const Psoriasis_Improvement_SS_ID = "1ZiGOpWsc3uE2ubZFLUywU4xMMRucK1gXUKVNdrVQEnY"



const MIPS_MASTER_DASH_SS_ID = "1sIc9hGS3hHAb37UEFipLBBmvLWe8eYJKPmu23wvsF-Q"

const MIPS_MASTER_VISTIS_FIX_SS_ID = "1WdMe_QKAjO25mXKrNIOf75mRUDXdoo7n0KOuyBOJZNw"



const MIPS_PROCESSING_SHEET_ID = "1zp4b4XTpeUzv7VfA3aRKFYo2rV1W09IIHxufEe1Uco0"


function testMips() {
  let mipsDataObj = getAllMIPSDataMain()
  mipsHTML = processProviderMIPS_(mipsDataObj, "Miller, Lauren", "LAUREN MILLER")
  Logger.log(mipsHTML)

  GmailApp.sendEmail("rashid_khan143@yahoo.com,agonzalez@ssdspc.com", "LAUREN MILLER SSD Daily Email Metrics", "", {
    htmlBody: mipsHTML
  })
}






function getSheetByID_(ss, sheetID) {
  let allSheets = ss.getSheets();

  return allSheets.filter(s => s.getSheetId().toString() == sheetID)[0]
}



function getAllMIPSDataMain() {

  let mondayDate = getMondayDate_().getTime()
  let tomorowDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
  tomorowDate = tomorowDate.setDate(tomorowDate.getDate() + 1)

  let sheetDataObj = { sheet1FilteredData: [], sheet2FilteredData: [], sheet3FilteredData: [], sheet4FilteredData: [], sheet5FilteredData: [], sheet6FilteredData: [] }


  // sheetDataObj = processNewMipsSheet_(MIPS_MASTER_VISTIS_FIX_SS_ID, "0", mondayDate, tomorowDate, sheetDataObj)
  // sheetDataObj = processNewMipsSheet_(MIPS_MASTER_VISTIS_FIX_SS_ID, "2083119868", mondayDate, tomorowDate, sheetDataObj)
  // sheetDataObj = processNewMipsSheet_(MIPS_MASTER_VISTIS_FIX_SS_ID, "836562873", mondayDate, tomorowDate, sheetDataObj)
  // sheetDataObj = processNewMipsSheet_(MIPS_MASTER_VISTIS_FIX_SS_ID, "1938576176", mondayDate, tomorowDate, sheetDataObj)


  sheetDataObj = processNewMipsSheet_(MIPS_PROCESSING_SHEET_ID, "1545557053", mondayDate, tomorowDate, sheetDataObj)

  return sheetDataObj

}



function processNewMipsSheet_(ssID, sheetId, mondayDate, tomorowDate, sheetDataObj) {


  // let sheet1FilteredData = []
  // let sheet2FilteredData = []
  // let sheet3FilteredData = []
  // let sheet4FilteredData = []
  // let sheet5FilteredData = []
  // let sheet6FilteredData = []

  const SS = SpreadsheetApp.openById(ssID);
  //const sheet = SS.getSheetByName(sheetName)
  const sheet = getSheetByID_(SS, sheetId)
  let sheetData = sheet.getRange("E1:O").getValues();


  let range = sheet.getRange("F:F"); // Change to the desired column
  range.setNumberFormat("@STRING@");
  SpreadsheetApp.flush()
  Utilities.sleep(1000)
  let sheetDataR = sheet.getRange("E1:O").getRichTextValues();
  range.setNumberFormat("MM/dd/yyyy");


  sheetData.splice(0, 1)
  sheetDataR.splice(0, 1)
  let sheetFilteredData = [];
  sheetData.forEach((r, i) => {
    //if ((r[9].includes("Unfavorable") || r[9].includes("Exception")) && (r[10] == "" || r[10] == "Select Override") && isValidDate_(r[1]) && r[1].getTime() > mondayDate && r[1].getTime() < tomorowDate) {

    if ((r[9].includes("Unfavorable") || r[9].includes("Exception")) && (r[10] == "" || r[10] == "Select Override")) {


      let patientHtml = r[3]
      if (sheetDataR[i][3].getLinkUrl() != null) {
        patientHtml = '<a href="' + sheetDataR[i][3].getLinkUrl() + '">' + r[3] + '</a>'
      }

      let visitNotesHtml = Utilities.formatDate(r[1], Session.getScriptTimeZone(), "MM/dd/yyyy")
      // if (sheetDataR[i][1].getLinkUrl() != null) {
      //   visitNotesHtml = '<a href="' + sheetDataR[i][1].getLinkUrl() + '">' + visitNotesHtml + '</a>'
      // }


      let title = r[0].replace(/ /g, "%20")
      let name = r[3].replace(/ /g, "%20")
      let provider = r[2].replace(/ /g, "%20")
      let facility = r[5].replace(/ /g, "%20")




      let button = `<a href="https://script.google.com/macros/s/AKfycbxvI8IKjxMy6tKpMNCfdgXN939_4bVcOU4MQ9z7twFq1Aj7ap67SjMeeIj8464lsmcp/exec?title=${title}&name=${name}&date=${visitNotesHtml}&provider=${provider}&mrn=${r[4]}&facility=${facility}" style="background-color: #28a745; color: white; padding: 3.5px 7px; text-decoration: none; border-radius: 2px; font-size: 10px;">Fixed</a>`



      if (r[0] == "Preventive Care and Screening: Tobacco Use: Screening and Cessation Intervention") {
        sheetDataObj.sheet1FilteredData.push([visitNotesHtml, r[2], patientHtml, r[4], r[5], button])
      } 
      // else if (r[0] == "Melanoma: Continuity of Care - Recall System") {
      //   sheetDataObj.sheet2FilteredData.push([visitNotesHtml, r[2], patientHtml, r[4], r[5], button])
      // }
      else if (r[0] == "Clinical Response to Systemic Medications") {
        sheetDataObj.sheet3FilteredData.push([visitNotesHtml, r[2], patientHtml, r[4], r[5], button])
      } else if (r[0] == "Immunizations for Adolescents") {
        sheetDataObj.sheet4FilteredData.push([visitNotesHtml, r[2], patientHtml, r[4], r[5], button])
      } else if (r[0] == "Dermatitis: Improvement in Patient-Reported Itch Severity") {
        sheetDataObj.sheet5FilteredData.push([visitNotesHtml, r[2], patientHtml, r[4], r[5], button])
      } else if (r[0] == "Psoriasis: Improvement in Patient-Reported Itch Severity") {
        sheetDataObj.sheet6FilteredData.push([visitNotesHtml, r[2], patientHtml, r[4], r[5], button])
      }

    }
  })



  // return { sheet1FilteredData: sheet1FilteredData, sheet2FilteredData: sheet2FilteredData, sheet3FilteredData: sheet3FilteredData, sheet4FilteredData: sheet4FilteredData, sheet5FilteredData: sheet5FilteredData, sheet6FilteredData: sheet6FilteredData }

  return sheetDataObj

}





function processMipsSheet_(ssID, sheetName, mondayDate, tomorowDate) {
  const SS = SpreadsheetApp.openById(ssID);
  const sheet = SS.getSheetByName(sheetName)
  let sheetData = sheet.getRange("C1:K").getValues();


  let range = sheet.getRange("C:C"); // Change to the desired column
  range.setNumberFormat("@STRING@");
  let sheetDataR = sheet.getRange("C1:K").getRichTextValues();
  range.setNumberFormat("MM/dd/yyyy");


  sheetData.splice(0, 1)
  sheetDataR.splice(0, 1)
  let sheetFilteredData = [];
  sheetData.forEach((r, i) => {
    if ((r[8].includes("Unfavorable") || r[8].includes("Exception")) && isValidDate_(r[0]) && r[0].getTime() >= mondayDate && r[0].getTime() < tomorowDate) {
      let patientHtml = r[2]
      if (sheetDataR[i][2].getLinkUrl() != null) {
        patientHtml = '<a href="' + sheetDataR[i][2].getLinkUrl() + '">' + r[2] + '</a>'
      }

      let visitNotesHtml = Utilities.formatDate(r[0], Session.getScriptTimeZone(), "MM/d/yyyy")
      if (sheetDataR[i][0].getLinkUrl() != null) {
        visitNotesHtml = '<a href="' + sheetDataR[i][0].getLinkUrl() + '">' + visitNotesHtml + '</a>'
      }
      sheetFilteredData.push([visitNotesHtml, r[1], patientHtml, r[3], r[4]])
    }
  })

  return sheetFilteredData

}




function processProviderMIPS_(mipsDataObj, provider, secProvider) {

  //Logger.log(mipsDataObj.sheet1FilteredData)

  let data1 = mipsDataObj.sheet1FilteredData.filter(r => r[1] == provider || r[1] == secProvider).map(r => [r[0], r[2], r[3], r[4], r[5]])
  let data2 = mipsDataObj.sheet2FilteredData.filter(r => r[1] == provider || r[1] == secProvider).map(r => [r[0], r[2], r[3], r[4], r[5]])
  let data3 = mipsDataObj.sheet3FilteredData.filter(r => r[1] == provider || r[1] == secProvider).map(r => [r[0], r[2], r[3], r[4], r[5]])
  let data4 = mipsDataObj.sheet4FilteredData.filter(r => r[1] == provider || r[1] == secProvider).map(r => [r[0], r[2], r[3], r[4], r[5]])
  let data5 = mipsDataObj.sheet5FilteredData.filter(r => r[1] == provider || r[1] == secProvider).map(r => [r[0], r[2], r[3], r[4], r[5]])
  let data6 = mipsDataObj.sheet6FilteredData.filter(r => r[1] == provider || r[1] == secProvider).map(r => [r[0], r[2], r[3], r[4], r[5]])



  const htmlTemplate = HtmlService.createTemplateFromFile('MIPS');


  htmlTemplate.sheetHeaders = ["Visit", "Patient", "MRN", "Facility", "Fixed?"];


  htmlTemplate.sheet1Data = data1;
  htmlTemplate.sheet1Count = data1.length;


  htmlTemplate.sheet2Data = data2;
  htmlTemplate.sheet2Count = data2.length;


  htmlTemplate.sheet3Data = data3;
  htmlTemplate.sheet3Count = data3.length;


  htmlTemplate.sheet4Data = data4;
  htmlTemplate.sheet4Count = data4.length;


  htmlTemplate.sheet5Data = data5;
  htmlTemplate.sheet5Count = data5.length;


  htmlTemplate.sheet6Data = data6;
  htmlTemplate.sheet6Count = data6.length;


  const htmlBody = htmlTemplate.evaluate().getContent();


  return htmlBody


}













function getMondayDate_() {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  let lastMonday;

  if (dayOfWeek === 6) {
    lastMonday = new Date(today);
    lastMonday.setDate(today.getDate() - 13);

  } else if (dayOfWeek === 5) {
    lastMonday = new Date(today);
    lastMonday.setDate(today.getDate() - 12);

  } else if (dayOfWeek === 4) {
    lastMonday = new Date(today);
    lastMonday.setDate(today.getDate() - 11);

  } else if (dayOfWeek === 3) {
    lastMonday = new Date(today);
    lastMonday.setDate(today.getDate() - 10);

  } else if (dayOfWeek === 2) {
    lastMonday = new Date(today);
    lastMonday.setDate(today.getDate() - 9);

  } else if (dayOfWeek === 1) {
    lastMonday = new Date(today);
    lastMonday.setDate(today.getDate() - 8);

  } else if (dayOfWeek === 0) {
    lastMonday = new Date(today);
    lastMonday.setDate(today.getDate() - 7);
  }


  //Logger.log(lastMonday)

  return (new Date(lastMonday.setHours(20, 0, 0, 0)))
}

function newDateTest() {


  let testDate = new Date();
  testDate.setHours(20, 0, 0, 0)
  Logger.log(testDate)
}


















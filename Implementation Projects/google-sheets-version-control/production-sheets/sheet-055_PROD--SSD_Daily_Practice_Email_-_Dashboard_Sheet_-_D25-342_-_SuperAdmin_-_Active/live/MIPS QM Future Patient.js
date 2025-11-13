

const MIPS_QM_FUTURE_SS_ID = "1SB0MzcN7ybZe6IyvMT3ODyqHqvopA2QVDgdoPQdoHSI"







function processFutureApptProviderMIPS_(mipsFutureApptObj, provider, secProvider) {

  let data1 = mipsFutureApptObj.data1.filter(r => r[6] == provider || r[6] == secProvider).map(r => [r[0], r[1], r[2], r[3], r[4]])
  let data2 = mipsFutureApptObj.data2.filter(r => r[6] == provider || r[6] == secProvider).map(r => [r[0], r[1], r[2], r[3], r[4]])
  let data3 = mipsFutureApptObj.data3.filter(r => r[6] == provider || r[6] == secProvider).map(r => [r[0], r[1], r[2], r[3], r[4]])
  let data4 = mipsFutureApptObj.data4.filter(r => r[6] == provider || r[6] == secProvider).map(r => [r[0], r[1], r[2], r[3], r[4]])
  let data5 = mipsFutureApptObj.data5.filter(r => r[6] == provider || r[6] == secProvider).map(r => [r[0], r[1], r[2], r[3], r[4]])
  let data6 = mipsFutureApptObj.data6.filter(r => r[6] == provider || r[6] == secProvider).map(r => [r[0], r[1], r[2], r[3], r[4]])



  const htmlTemplate = HtmlService.createTemplateFromFile('MIPSFuture');


  htmlTemplate.sheetHeaders = ["MRN", "PATIENT NAME", "LAST VISIT", "NEXT VISIT", "FACILITY"];

  // if (provider=="Maruthur, Mario") {
  //   htmlTemplate.sheetUrl = 'href="https://docs.google.com/spreadsheets/d/1sIc9hGS3hHAb37UEFipLBBmvLWe8eYJKPmu23wvsF-Q/edit?gid=556374886#gid=556374886"'
  // } else if (provider=="Miller, Lauren") {
  //   htmlTemplate.sheetUrl = 'href="https://docs.google.com/spreadsheets/d/1sIc9hGS3hHAb37UEFipLBBmvLWe8eYJKPmu23wvsF-Q/edit?gid=766540949#gid=766540949"'
  // } else if (provider=="Keely, Adrienne") {
  //   htmlTemplate.sheetUrl = 'href="https://docs.google.com/spreadsheets/d/1sIc9hGS3hHAb37UEFipLBBmvLWe8eYJKPmu23wvsF-Q/edit?gid=1598286739#gid=1598286739"'
  // } else if (provider=="Parker, Kaitlyn") {
  //   htmlTemplate.sheetUrl = 'href="https://docs.google.com/spreadsheets/d/1sIc9hGS3hHAb37UEFipLBBmvLWe8eYJKPmu23wvsF-Q/edit?gid=49933827#gid=49933827"'
  // }




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



function processMipsQMFuturePatients() {

  let [startDate, endDate] = getStartEndDate_()

  //Logger.log(new Date(startDate))

  //let sheetDataObj = processNewMipsQMFuturePatientsSheet_(MIPS_MASTER_DASH_SS_ID, "MIPS Visits", startDate, endDate)



  //return sheetDataObj


  let ss = SpreadsheetApp.openById(MIPS_QM_FUTURE_SS_ID);

  // let data1 = processSheet1(ss, startDate, endDate)

  // let data2 = processSheet2(ss, startDate, endDate)

  // let data3 = processSheet3(ss, startDate, endDate)

  // let data4 = processSheet4(ss, startDate, endDate)

  // let data5 = processSheet5(ss, startDate, endDate)

  // let data6 = processSheet6(ss, startDate, endDate)


  // let dataObj = {
  //   data1: data1,
  //   data2: data2,
  //   data3: data3,
  //   data4: data4,
  //   data5: data5,
  //   data6: data6,
  // }



  let dataObj = processFutureMIPSVisitsSheet(ss, startDate, endDate)



  return dataObj

}


//["MRN", "PATIENT NAME", "LAST VISIT", "NEXT VISIT", "FACILITY"];

function processFutureMIPSVisitsSheet(ss, startDate, endDate) {

  let data1FilteredData = []
  let data2FilteredData = []
  let data3FilteredData = []
  let data4FilteredData = []
  let data5FilteredData = []
  let data6FilteredData = []


  let sheet = ss.getSheetByName("Future 2025 MIPS Visits")
  let sheetData = sheet.getRange("B1:L").getValues()

  SpreadsheetApp.flush()
  Utilities.sleep(1000)

  let range = sheet.getRange("F2:F"); // Change to the desired column
  range.setNumberFormat("@STRING@");
  SpreadsheetApp.flush()
  Utilities.sleep(1000)
  let sheetDataR = sheet.getRange("B1:L").getRichTextValues();
  range.setNumberFormat("MM/dd/yyyy");

  sheetData.splice(0, 1)
  sheetDataR.splice(0, 1)
  let sheetFilteredData = [];
  sheetData.forEach((r, i) => {
    if (isValidDate_(r[6]) && r[6].getTime() >= startDate && r[6].getTime() < endDate && (r[8] == 'Pending' || r[8] == 'Confirmed')) {
      //if ((r[8] == 'Pending' || r[8] == 'Confirmed')) {
      let patientHtml = r[3]
      if (sheetDataR[i][3].getLinkUrl() != null) {
        patientHtml = '<a href="' + sheetDataR[i][3].getLinkUrl() + '">' + r[3] + '</a>'
      }

      let visitNotesHtml = Utilities.formatDate(r[4], Session.getScriptTimeZone(), "MM/d/yyyy")
      if (sheetDataR[i][4].getLinkUrl() != null) {
        visitNotesHtml = '<a href="' + sheetDataR[i][4].getLinkUrl() + '">' + visitNotesHtml + '</a>'
      }

      let visitDate = Utilities.formatDate(r[6], Session.getScriptTimeZone(), "MM/d/yyyy")

      if (r[0] == "Preventive Care and Screening: Tobacco Use: Screening and Cessation Intervention") {
        data1FilteredData.push([r[2], patientHtml, visitNotesHtml, visitDate, r[10], r[1], r[9]])
      }
      // else if (r[0] == "Melanoma: Continuity of Care - Recall System") {
      //   data2FilteredData.push([r[2], patientHtml, visitNotesHtml, visitDate, r[10], r[1], r[9]])
      // }
      else if (r[0] == "Clinical Response to Systemic Medications") {
        data3FilteredData.push([r[2], patientHtml, visitNotesHtml, visitDate, r[10], r[1], r[9]])
      } else if (r[0] == "Immunizations for Adolescents") {
        data4FilteredData.push([r[2], patientHtml, visitNotesHtml, visitDate, r[10], r[1], r[9]])
      } else if (r[0] == "Dermatitis: Improvement in Patient-Reported Itch Severity") {
        data5FilteredData.push([r[2], patientHtml, visitNotesHtml, visitDate, r[10], r[1], r[9]])
      } else if (r[0] == "Psoriasis: Improvement in Patient-Reported Itch Severity") {
        data6FilteredData.push([r[2], patientHtml, visitNotesHtml, visitDate, r[10], r[1], r[9]])
      }

      // sheetFilteredData.push([r[2], patientHtml, visitNotesHtml, visitDate, r[10]])

    }
  })

  return {
    data1: data1FilteredData,
    data2: data2FilteredData,
    data3: data3FilteredData,
    data4: data4FilteredData,
    data5: data5FilteredData,
    data6: data6FilteredData,
  }
}








function processNewMipsQMFuturePatientsSheet_(ssID, sheetName, startDate, endDate) {


  let sheet1FilteredData = []
  let sheet2FilteredData = []
  let sheet3FilteredData = []
  let sheet4FilteredData = []
  let sheet5FilteredData = []
  let sheet6FilteredData = []

  const SS = SpreadsheetApp.openById(ssID);
  const sheet = SS.getSheetByName(sheetName)
  let sheetData = sheet.getRange("B1:K").getValues();


  let range = sheet.getRange("C:C"); // Change to the desired column
  range.setNumberFormat("@STRING@");
  let sheetDataR = sheet.getRange("B1:K").getRichTextValues();
  range.setNumberFormat("MM/dd/yyyy");


  sheetData.splice(0, 1)
  sheetDataR.splice(0, 1)
  let sheetFilteredData = [];
  sheetData.forEach((r, i) => {
    if (isValidDate_(r[1]) && r[1].getTime() > startDate && r[1].getTime() < endDate) {
      let patientHtml = r[3]
      if (sheetDataR[i][3].getLinkUrl() != null) {
        patientHtml = '<a href="' + sheetDataR[i][3].getLinkUrl() + '">' + r[3] + '</a>'
      }

      let visitNotesHtml = Utilities.formatDate(r[1], Session.getScriptTimeZone(), "MM/d/yyyy")
      if (sheetDataR[i][1].getLinkUrl() != null) {
        visitNotesHtml = '<a href="' + sheetDataR[i][1].getLinkUrl() + '">' + visitNotesHtml + '</a>'
      }

      if (r[0] == "Preventive Care and Screening: Tobacco Use: Screening and Cessation Intervention") {
        sheet1FilteredData.push([r[4], patientHtml, visitNotesHtml, r[2], r[5]])
      } else if (r[0] == "Melanoma: Continuity of Care - Recall System") {
        sheet2FilteredData.push([r[4], patientHtml, visitNotesHtml, r[2], r[5]])
      } else if (r[0] == "Clinical Response to Systemic Medications") {
        sheet3FilteredData.push([r[4], patientHtml, visitNotesHtml, r[2], r[5]])
      } else if (r[0] == "Immunizations for Adolescents") {
        sheet4FilteredData.push([r[4], patientHtml, visitNotesHtml, r[2], r[5]])
      } else if (r[0] == "Dermatitis: Improvement in Patient-Reported Itch Severity") {
        sheet5FilteredData.push([r[4], patientHtml, visitNotesHtml, r[2], r[5]])
      } else if (r[0] == "Psoriasis: Improvement in Patient-Reported Itch Severity") {
        sheet6FilteredData.push([r[4], patientHtml, visitNotesHtml, r[2], r[5]])
      }
    }
  })


  //["LAST PROVIDER", "MRN", "PATIENT NAME", "LAST VISIT", "NEXT VISIT", "APPT TYPE", "PROVIDER", "FACILITY"];
  return { sheet1FilteredData: sheet1FilteredData, sheet2FilteredData: sheet2FilteredData, sheet3FilteredData: sheet3FilteredData, sheet4FilteredData: sheet4FilteredData, sheet5FilteredData: sheet5FilteredData, sheet6FilteredData: sheet6FilteredData }

  //return sheetFilteredData

}




function processSheet6(ss, startDate, endDate) {
  let sheet = ss.getSheetByName("Psoriasis - Patient Itch Severity Improvement")
  let sheetData = sheet.getRange("B1:J").getValues()

  SpreadsheetApp.flush()
  Utilities.sleep(1000)

  let range = sheet.getRange("E2:E"); // Change to the desired column
  range.setNumberFormat("@STRING@");
  SpreadsheetApp.flush()
  Utilities.sleep(1000)
  let sheetDataR = sheet.getRange("B1:J").getRichTextValues();
  range.setNumberFormat("MM/dd/yyyy");

  sheetData.splice(0, 1)
  sheetDataR.splice(0, 1)
  let sheetFilteredData = [];
  sheetData.forEach((r, i) => {
    if (isValidDate_(r[4]) && r[4].getTime() >= startDate && r[4].getTime() < endDate && (r[6] == 'Pending' || r[6] == 'Confirmed')) {
      let patientHtml = r[2]
      if (sheetDataR[i][2].getLinkUrl() != null) {
        patientHtml = '<a href="' + sheetDataR[i][2].getLinkUrl() + '">' + r[2] + '</a>'
      }

      let visitNotesHtml = Utilities.formatDate(r[3], Session.getScriptTimeZone(), "MM/d/yyyy")
      if (sheetDataR[i][3].getLinkUrl() != null) {
        visitNotesHtml = '<a href="' + sheetDataR[i][3].getLinkUrl() + '">' + visitNotesHtml + '</a>'
      }

      let visitDate = Utilities.formatDate(r[4], Session.getScriptTimeZone(), "MM/d/yyyy")

      sheetFilteredData.push([r[0], r[1], patientHtml, visitNotesHtml, visitDate, r[5], r[7], r[8]])
    }
  })

  return sheetFilteredData
}





function processSheet5(ss, startDate, endDate) {
  let sheet = ss.getSheetByName("Dermatitis - Patient Itch Severity Improvement")
  let sheetData = sheet.getRange("B1:J").getValues()

  SpreadsheetApp.flush()
  Utilities.sleep(1000)

  let range = sheet.getRange("E2:E"); // Change to the desired column
  range.setNumberFormat("@STRING@");
  SpreadsheetApp.flush()
  Utilities.sleep(1000)
  let sheetDataR = sheet.getRange("B1:J").getRichTextValues();
  range.setNumberFormat("MM/dd/yyyy");

  sheetData.splice(0, 1)
  sheetDataR.splice(0, 1)
  let sheetFilteredData = [];
  sheetData.forEach((r, i) => {
    if (isValidDate_(r[4]) && r[4].getTime() >= startDate && r[4].getTime() < endDate && (r[6] == 'Pending' || r[6] == 'Confirmed')) {
      let patientHtml = r[2]
      if (sheetDataR[i][2].getLinkUrl() != null) {
        patientHtml = '<a href="' + sheetDataR[i][2].getLinkUrl() + '">' + r[2] + '</a>'
      }

      let visitNotesHtml = Utilities.formatDate(r[3], Session.getScriptTimeZone(), "MM/d/yyyy")
      if (sheetDataR[i][3].getLinkUrl() != null) {
        visitNotesHtml = '<a href="' + sheetDataR[i][3].getLinkUrl() + '">' + visitNotesHtml + '</a>'
      }

      let visitDate = Utilities.formatDate(r[4], Session.getScriptTimeZone(), "MM/d/yyyy")

      sheetFilteredData.push([r[0], r[1], patientHtml, visitNotesHtml, visitDate, r[5], r[7], r[8]])
    }
  })

  return sheetFilteredData
}







function processSheet4(ss, startDate, endDate) {
  let sheet = ss.getSheetByName("Immunizations for Adolescents")
  let sheetData = sheet.getRange("B1:N").getValues()

  SpreadsheetApp.flush()
  Utilities.sleep(1000)

  let range = sheet.getRange("E2:E"); // Change to the desired column
  range.setNumberFormat("@STRING@");
  SpreadsheetApp.flush()
  Utilities.sleep(1000)
  let sheetDataR = sheet.getRange("B1:N").getRichTextValues();
  range.setNumberFormat("MM/dd/yyyy");

  sheetData.splice(0, 1)
  sheetDataR.splice(0, 1)
  let sheetFilteredData = [];
  sheetData.forEach((r, i) => {
    if (isValidDate_(r[8]) && r[8].getTime() >= startDate && r[8].getTime() < endDate && (r[10] == 'Pending' || r[10] == 'Confirmed')) {
      let patientHtml = r[2]
      if (sheetDataR[i][2].getLinkUrl() != null) {
        patientHtml = '<a href="' + sheetDataR[i][2].getLinkUrl() + '">' + r[2] + '</a>'
      }

      let visitNotesHtml = Utilities.formatDate(r[3], Session.getScriptTimeZone(), "MM/d/yyyy")
      if (sheetDataR[i][3].getLinkUrl() != null) {
        visitNotesHtml = '<a href="' + sheetDataR[i][3].getLinkUrl() + '">' + visitNotesHtml + '</a>'
      }

      let visitDate = Utilities.formatDate(r[8], Session.getScriptTimeZone(), "MM/d/yyyy")

      sheetFilteredData.push([r[0], r[1], patientHtml, visitNotesHtml, visitDate, r[9], r[11], r[12]])
    }
  })

  return sheetFilteredData
}




function processSheet3(ss, startDate, endDate) {
  let sheet = ss.getSheetByName("Clinical Response to Systemic Medications")
  let sheetData = sheet.getRange("B1:K").getValues()

  SpreadsheetApp.flush()
  Utilities.sleep(1000)

  let range = sheet.getRange("E2:E"); // Change to the desired column
  range.setNumberFormat("@STRING@");
  SpreadsheetApp.flush()
  Utilities.sleep(1000)
  let sheetDataR = sheet.getRange("B1:K").getRichTextValues();
  range.setNumberFormat("MM/dd/yyyy");

  sheetData.splice(0, 1)
  sheetDataR.splice(0, 1)
  let sheetFilteredData = [];
  sheetData.forEach((r, i) => {
    if (isValidDate_(r[5]) && r[5].getTime() >= startDate && r[5].getTime() < endDate && (r[7] == 'Pending' || r[7] == 'Confirmed')) {
      let patientHtml = r[2]
      if (sheetDataR[i][2].getLinkUrl() != null) {
        patientHtml = '<a href="' + sheetDataR[i][2].getLinkUrl() + '">' + r[2] + '</a>'
      }

      let visitNotesHtml = Utilities.formatDate(r[3], Session.getScriptTimeZone(), "MM/d/yyyy")
      if (sheetDataR[i][3].getLinkUrl() != null) {
        visitNotesHtml = '<a href="' + sheetDataR[i][3].getLinkUrl() + '">' + visitNotesHtml + '</a>'
      }

      let visitDate = Utilities.formatDate(r[5], Session.getScriptTimeZone(), "MM/d/yyyy")

      sheetFilteredData.push([r[0], r[1], patientHtml, visitNotesHtml, visitDate, r[6], r[8], r[9]])
    }
  })

  return sheetFilteredData
}



function testTesttestFormat() {

  let ss = SpreadsheetApp.openById(MIPS_QM_FUTURE_SS_ID)
  let sheet = ss.getSheetByName("Melanoma Continuity of Care")
  let sheetData = sheet.getRange("B1:L").getValues()

  SpreadsheetApp.flush()
  Utilities.sleep(1000)

  let range = sheet.getRange("F2:F"); // Change to the desired column
  range.setNumberFormat("@STRING@");

  SpreadsheetApp.flush()
  Utilities.sleep(1000)
  let sheetDataR = sheet.getRange("B1:L").getRichTextValues();
  range.setNumberFormat("MM/dd/yyyy");

  Logger.log(sheetData[2][4])
  Logger.log(sheetDataR[2][4].getLinkUrl())
  Logger.log(sheetDataR[2][4].getText())
}



function processSheet2(ss, startDate, endDate) {
  let sheet = ss.getSheetByName("Melanoma Continuity of Care")
  let sheetData = sheet.getRange("B1:K").getValues()

  SpreadsheetApp.flush()
  Utilities.sleep(1000)

  let range = sheet.getRange("E2:E"); // Change to the desired column
  range.setNumberFormat("@STRING@");
  SpreadsheetApp.flush()
  Utilities.sleep(1000)
  let sheetDataR = sheet.getRange("B1:K").getRichTextValues();
  range.setNumberFormat("MM/dd/yyyy");

  sheetData.splice(0, 1)
  sheetDataR.splice(0, 1)
  let sheetFilteredData = [];
  sheetData.forEach((r, i) => {
    if (isValidDate_(r[5]) && r[5].getTime() >= startDate && r[5].getTime() < endDate && (r[7] == 'Pending' || r[7] == 'Confirmed')) {
      let patientHtml = r[2]
      if (sheetDataR[i][2].getLinkUrl() != null) {
        patientHtml = '<a href="' + sheetDataR[i][2].getLinkUrl() + '">' + r[2] + '</a>'
      }

      let visitNotesHtml = Utilities.formatDate(r[3], Session.getScriptTimeZone(), "MM/d/yyyy")
      if (sheetDataR[i][3].getLinkUrl() != null) {
        visitNotesHtml = '<a href="' + sheetDataR[i][3].getLinkUrl() + '">' + visitNotesHtml + '</a>'
      }

      let visitDate = Utilities.formatDate(r[5], Session.getScriptTimeZone(), "MM/d/yyyy")

      sheetFilteredData.push([r[0], r[1], patientHtml, visitNotesHtml, visitDate, r[6], r[8], r[9]])
    }
  })

  return sheetFilteredData
}




function processSheet1(ss, startDate, endDate) {
  let sheet = ss.getSheetByName("Tobacco Screening and Intervention Cessation")
  let sheetData = sheet.getRange("B1:K").getValues()

  SpreadsheetApp.flush()
  Utilities.sleep(1000)

  let range = sheet.getRange("E2:E"); // Change to the desired column
  range.setNumberFormat("@STRING@");
  SpreadsheetApp.flush()
  Utilities.sleep(1000)
  let sheetDataR = sheet.getRange("B1:K").getRichTextValues();
  range.setNumberFormat("MM/dd/yyyy");

  sheetData.splice(0, 1)
  sheetDataR.splice(0, 1)
  let sheetFilteredData = [];
  sheetData.forEach((r, i) => {
    if (isValidDate_(r[4]) && r[4].getTime() >= startDate && r[4].getTime() < endDate && (r[6] == 'Pending' || r[6] == 'Confirmed')) {
      let patientHtml = r[2]
      if (sheetDataR[i][2].getLinkUrl() != null) {
        patientHtml = '<a href="' + sheetDataR[i][2].getLinkUrl() + '">' + r[2] + '</a>'
      }

      let visitNotesHtml = Utilities.formatDate(r[3], Session.getScriptTimeZone(), "MM/d/yyyy")
      if (sheetDataR[i][3].getLinkUrl() != null) {
        visitNotesHtml = '<a href="' + sheetDataR[i][3].getLinkUrl() + '">' + visitNotesHtml + '</a>'
      }

      let visitDate = Utilities.formatDate(r[4], Session.getScriptTimeZone(), "MM/d/yyyy")

      sheetFilteredData.push([r[0], r[1], patientHtml, visitNotesHtml, visitDate, r[5], r[7], r[8]])
    }
  })

  return sheetFilteredData
}















function getStartEndDate_() {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday


  let startDate = new Date()
  let endDate = new Date()

  if (dayOfWeek === 6) {

    endDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
    endDate = endDate.setDate(endDate.getDate() + 2)

    startDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
    startDate = startDate.setDate(startDate.getDate() - 5)


  } else if (dayOfWeek === 5) {
    endDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
    endDate = endDate.setDate(endDate.getDate() + 9)

    startDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
    startDate = startDate.setDate(startDate.getDate() - 4)

  } else if (dayOfWeek === 4) {
    endDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
    endDate = endDate.setDate(endDate.getDate() + 4)

    startDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
    startDate = startDate.setDate(startDate.getDate() - 3)

  } else if (dayOfWeek === 3) {
    endDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
    endDate = endDate.setDate(endDate.getDate() + 5)

    startDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
    startDate = startDate.setDate(startDate.getDate() - 2)

  } else if (dayOfWeek === 2) {
    endDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
    endDate = endDate.setDate(endDate.getDate() + 6)

    startDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
    startDate = startDate.setDate(startDate.getDate() - 1)

  } else if (dayOfWeek === 1) {
    endDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
    endDate = endDate.setDate(endDate.getDate() + 7)

    startDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
    startDate = startDate.setDate(startDate.getDate())

  } else if (dayOfWeek === 0) {
    endDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
    endDate = endDate.setDate(endDate.getDate() + 1)

    startDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
    startDate = startDate.setDate(startDate.getDate() - 6)
  }


  return [startDate, endDate]
}

//TRUSSVILLE_AVAILABLE
//TRUSSVILLE_APPLIED

//GADSDEN_AVAILABLE
//GADSDEN_APPLIED

//OXFORD_AVAILABLE
//OXFORD_APPLIED


function onOpen() {
  const ui = SpreadsheetApp.getUi();
  const menu = ui.createMenu("⌛️Custom");

  menu.addItem("1️⃣Process Trussville", "dailyTrussvilleProcess").addToUi()
  menu.addItem("2️⃣Process Gadsden", "dailyGadsdenProcess").addToUi()
  menu.addItem("3️⃣Process Oxford", "dailyOxfordProcess").addToUi()
  //menu.addItem("Test Process Gadsden", "dailyGadsdenProcessTest").addToUi()
}


function dailyAppliedEmailProcessTrigger() {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  //try {
  dailyTrussvilleProcess()

  dailyGadsdenProcess()

  dailyOxfordProcess()

  dailyPellCityProcess()

  //   let statusRow = [[Session.getActiveUser(), new Date(), "Successful"]]
  //   updateScriptStatus_(ss, "SCR-011", statusRow, true)


  // } catch (err) {
  //   let statusRow = [[Session.getActiveUser(), new Date(), err]]
  //   updateScriptStatus_(ss, "SCR-011", statusRow, false)
  // }
}





function dailyGadsdenProcessTest() {
  let AVAILABLE_RANGE = "GADSDEN_AVAILABLE"
  let APPLIED_RANGE = "GADSDEN_APPLIED"

  let SHEET_NAME = "Copy of Gadsden"

  dailyEmailProcessMain(SHEET_NAME, AVAILABLE_RANGE, APPLIED_RANGE)
}


function dailyTrussvilleProcessTest() {
  let AVAILABLE_RANGE = "TRUSSVILLE_AVAILABLE"
  let APPLIED_RANGE = "TRUSSVILLE_APPLIED"

  let SHEET_NAME = "Copy of TRUSSVILLE"

  dailyEmailProcessMain(SHEET_NAME, AVAILABLE_RANGE, APPLIED_RANGE)
}





function dailyTrussvilleProcess() {
  let AVAILABLE_RANGE = "TRUSSVILLE_AVAILABLE"
  let APPLIED_RANGE = "TRUSSVILLE_APPLIED"

  let SHEET_NAME = "TRUSSVILLE"

  dailyEmailProcessMain(SHEET_NAME, AVAILABLE_RANGE, APPLIED_RANGE)
}

function dailyGadsdenProcess() {
  let AVAILABLE_RANGE = "GADSDEN_AVAILABLE"
  let APPLIED_RANGE = "GADSDEN_APPLIED"

  let SHEET_NAME = "GADSDEN"

  dailyEmailProcessMain(SHEET_NAME, AVAILABLE_RANGE, APPLIED_RANGE)
}

function dailyOxfordProcess() {
  let AVAILABLE_RANGE = "OXFORD_AVAILABLE"
  let APPLIED_RANGE = "OXFORD_APPLIED"

  let SHEET_NAME = "OXFORD"

  dailyEmailProcessMain(SHEET_NAME, AVAILABLE_RANGE, APPLIED_RANGE)
}


function dailyPellCityProcess() {
  let AVAILABLE_RANGE = "PELL_CITY_AVAILABLE"
  let APPLIED_RANGE = "PELL_CITY_APPLIED"

  let SHEET_NAME = "PELL CITY"

  dailyEmailProcessMain(SHEET_NAME, AVAILABLE_RANGE, APPLIED_RANGE)
}




function dailyEmailProcessMain(SHEET_NAME, AVAILABLE_RANGE, APPLIED_RANGE) {

  //try {

  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME)

  const protections = sheet.getProtections(SpreadsheetApp.ProtectionType.RANGE)
  protections.forEach(function (p) {
    p.remove()
  })


  let allData = sheet.getRange(AVAILABLE_RANGE).getValues().filter(r => r[0] != "" && r[0] != null && r[2] != "" && r[2] != null);

  let headers = allData.splice(0, 1)[0].map(h => h.toString().toLowerCase().trim())

  //Logger.log(allData)


  let companyIndex = headers.indexOf("company");
  let statusIndex = headers.indexOf("status");


  let clinicLocationIndex = headers.indexOf("clinic location");
  let productionCodeIndex = headers.indexOf("product code");
  let skinSubIndex = headers.indexOf("skin substitute product");
  let sizeIndex = headers.indexOf("size");
  let serialNumberIndex = headers.indexOf("inventory serial number");
  let applciationDateIndex = headers.indexOf("application date");
  //let patientNameIndex = headers.indexOf("patient name");
  let patientNameIndex = 14;

  let emailSentIndex = headers.indexOf("email sent?");


  let DATE_TIME = new Date().getTime()

  let appliedData = [];
  let availableData = [];


  allData.forEach(row => {
    let rowDate = row[applciationDateIndex]
    if (isValidDate_(rowDate)) {
      //if (rowDate.getDate() == DATE_.date && rowDate.getMonth() == DATE_.month && rowDate.getFullYear() == DATE_.year) {
      if (rowDate.getTime() <= DATE_TIME) {
        appliedData.push(row)
        appliedData[appliedData.length - 1][statusIndex] = "APPLIED"
      } else {
        availableData.push(row)
      }
    } else {
      availableData.push(row)
    }
  })


  if (appliedData.length == 0) {
    protectColumnQ_(sheet)
    return
  }

  appliedData.sort((a, b) => a[applciationDateIndex] - b[applciationDateIndex]);

  let companyAppliedObj = {}
  appliedData.forEach(row => {

    if (row[emailSentIndex] != "YES") {

      let rowDate = row[applciationDateIndex]
      let company = row[companyIndex]

      if (isValidDate_(rowDate)) {

        //if (rowDate.getDate() == DATE_.date && rowDate.getMonth() == DATE_.month && rowDate.getFullYear() == DATE_.year) {
        if (rowDate.getTime() <= DATE_TIME) {


          if (!companyAppliedObj[company]) {
            companyAppliedObj[company] = []
            let newRow = [row[clinicLocationIndex], row[productionCodeIndex], row[skinSubIndex], row[sizeIndex], row[serialNumberIndex], row[applciationDateIndex].toLocaleDateString(), findPatientInitials(row[patientNameIndex])]
            companyAppliedObj[company].push(newRow)
          } else {
            let newRow = [row[clinicLocationIndex], row[productionCodeIndex], row[skinSubIndex], row[sizeIndex], row[serialNumberIndex], row[applciationDateIndex].toLocaleDateString(), findPatientInitials(row[patientNameIndex])]
            companyAppliedObj[company].push(newRow)
          }

          row[emailSentIndex] = "YES"
        }


      }

    }
  })


  let companyAvailableObj = {}
  availableData.forEach(row => {
    let company = row[companyIndex]
    if (!companyAvailableObj[company]) {
      companyAvailableObj[company] = []
      let newRow = [row[2], row[3], row[4], row[5], row[8]]
      companyAvailableObj[company].push(newRow)

    } else {
      let newRow = [row[2], row[3], row[4], row[5], row[8]]
      companyAvailableObj[company].push(newRow)
    }
  })




  let appliedRange = sheet.getRange(APPLIED_RANGE)
  let appliedRow = appliedRange.getRow()
  sheet.insertRows(appliedRow + 1, appliedData.length)
  sheet.getRange(appliedRow + 1, 1, appliedData.length, appliedData[0].length).setValues(appliedData)

  sheet.getRange(appliedRow + 1, 1, sheet.getLastRow() - appliedRow, sheet.getLastColumn()).sort([{ column: 11, ascending: false }])


  sheet.deleteRows(2, appliedData.length);
  sheet.getRange(2, 1, availableData.length, availableData[0].length).setValues(availableData);


  sheet.getRange("E2:E").clearContent()
  sheet.getRange("F2:F").clearContent()
  sheet.getRange("G2:G").clearContent()
  sheet.getRange("H2:H").clearContent()
  sheet.getRange("O2:O").clearContent()


  let compEmailObj = getCompanyEmails_(ss)

  sendingEmailProcess_(companyAppliedObj, companyAvailableObj, compEmailObj, SHEET_NAME)

  protectColumnQ_(sheet)


  //} catch (err) { Logger.log(err) }


}






function getCompanyEmails_(ss) {

  let CmpSheet = ss.getSheetByName("Companies")
  let allInfo = CmpSheet.getRange("A2:B").getValues().filter(r => r[0] != "" && r[0] != null)

  let compEmailObj = {};
  allInfo.forEach(r => {
    compEmailObj[r[0]] = r[1].toString().trim()
  })

  return compEmailObj
}





function sendingEmailProcess_(companyAppliedObj, companyAvailableObj, compEmailObj, SHEET_NAME) {

  //Logger.log(companyAvailableObj)
  for (const key in companyAppliedObj) {
    try {

      let signature = "<div></div>"
      try {
        signature = Gmail.Users.Settings.SendAs.list("me").sendAs.filter(function (account) { if (account.isDefault) { return true } })[0].signature;
      } catch (err) { signature = "<div></div>" }

      let htmlTemp = HtmlService.createTemplateFromFile("email Template");

      htmlTemp.headers = ["CLINIC LOCATION", "PRODUCT CODE", "PRODUCT", "SIZE", "SERIAL NUMBER", "APPLICATION DATE", "PATIENT INITIALS"]
      htmlTemp.tableData = companyAppliedObj[key]

      htmlTemp.availabelHeaders = ["COMPANY", "PRODUCT CODE", "SKIN SUBSTITUTE PRODUCT", "SIZE", "INVENTORY SERIAL NUMBER"]
      if (!companyAvailableObj[key]) {
        htmlTemp.availableTableData = []
      } else {
        htmlTemp.availableTableData = companyAvailableObj[key]
      }
      htmlTemp.signature = signature

      let htmlBody = htmlTemp.evaluate().getContent();


      let subject = key + " - SKIN SUBSTITUTES APPLIED IN " + SHEET_NAME


      try {
        GmailApp.sendEmail(compEmailObj[key].replace(/\s/g, ''), subject, "", {
          htmlBody: htmlBody
        })

        let recipents = compEmailObj[key].replace(/\s/g, '').split(",")

        appendInEmailLog_([new Date(), new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds(), subject, recipents.length, compEmailObj[key].replace(/\s/g, '')])



      } catch (emailError) {
        appendInEmailLog_([new Date(), new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds(), subject, recipents.length, compEmailObj[key].replace(/\s/g, ''), emailError])
      }





    } catch (err) { Logger.log(err) }
  }
}


function appendInEmailLog_(row) {

  let ELSS = SpreadsheetApp.openById("1ERfXs1YB-huftv_rIQJfy2OhaziiQU3rEtM5vmHr0nE");
  let ELSheet = ELSS.getSheetByName("Sent Email Log");
  ELSheet.appendRow(row)

}





function findPatientInitials(name) {


  let splitName = name.toString().trim().split(" ")

  if (splitName.length == 1) {
    return splitName[0].substring(0, 1)

  } else if (splitName.length > 1) {
    return splitName[0].substring(0, 1) + splitName[splitName.length - 1].substring(0, 1)
  }

  return ""
}




function protectColumnQ_(sheet) {
  try {
    let range = sheet.getRange("Q2:Q")
    const me = Session.getEffectiveUser().getEmail().toString().toLowerCase().trim()

    const protection = range.protect()
    protection.getEditors().forEach(user => {
      if (user.getEmail().toString().toLowerCase().trim() != me) {
        try {
          protection.removeEditor(user.getEmail())
        } catch (err) { }
      }
    })
    protection.addEditor(me)

  } catch (err) { }
}




















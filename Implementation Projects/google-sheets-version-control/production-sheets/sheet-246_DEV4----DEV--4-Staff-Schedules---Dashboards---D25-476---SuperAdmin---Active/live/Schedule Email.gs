

const EMAIL_SCHEDULE_SHEET = "Email Schedule"

const ADMIN_HELP_EMAIL = "admin@ssdspc.com"




function sendAllDefaultSchedule() {

  scheduleEmailProcess("All", true, false)

}

function sendAdminSchedule() {

  scheduleEmailProcess("Schedule_Data_Admin", true, false)

}

function sendMASchedule() {

  scheduleEmailProcess("Schedule_Data_MA", true, false)

}

function sendFDSchedule() {

  scheduleEmailProcess("Schedule_Data_FD", true, false)

}

function sendSelectedSchedule() {

  scheduleEmailProcess("All", false, false)

}


function sendSelectedScheduleToAdmin() {


  scheduleEmailProcess("All", false, true)


}




function scheduleEmailProcess(schedule, allEmployee, admin) {


  //let ui = SpreadsheetApp.getUi();

  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(EMAIL_SCHEDULE_SHEET);

  let settings = sheet.getRange("B1:B2").getValues();
  let month = settings[0][0]

  let year = settings[1][0]
  //let allEmployee = settings[2][0]
  //let schedule = settings[3][0]

  if (month == "") {
    //ui.alert("Please select the month in cell B1")
    return
  } else if (year == "") {
    //ui.alert("Please write year in cell B2")
    return
  }

  let monthSelected = new Date(month + '-1-01').getMonth()



  let employee = sheet.getRange(7, 1, sheet.getLastRow() - 6, 5).getValues().filter(r => r[0] != "" && r[0] != null);
  let employeeNames = employee.map(r => r[0].toString().trim())

  let employeeObj = {}

  if (allEmployee == true) {

    employee.forEach(emp => {

      if (emp[0] != "" && emp[0] != null) {
        employeeObj[emp[0].toString().trim()] = {}
      }
    })

  } else if (allEmployee == false) {
    employee.forEach(emp => {

      if (emp[0] != "" && emp[0] != null && emp[4] == true) {
        employeeObj[emp[0].toString().trim()] = {}
      }
    })


  }


  if (schedule == "" || schedule == "All") {

    for (const key in employeeObj) {
      let empIndex = employeeNames.indexOf(key)
      if (empIndex == -1) continue
      if (employee[empIndex][2] == "All") {
        employeeObj[key] = { Schedule_Data_MA: [], Schedule_Data_FD: [], Schedule_Data_Admin: [] }

      } else if (employee[empIndex][2] == "Admin") {
        employeeObj[key] = { Schedule_Data_Admin: [] }

      } else if (employee[empIndex][2] == "FD") {
        employeeObj[key] = { Schedule_Data_FD: [] }

      } else if (employee[empIndex][2] == "MA") {
        employeeObj[key] = { Schedule_Data_MA: [] }

      }

    }


  } else {
    for (const key in employeeObj) {
      let empIndex = employeeNames.indexOf(key)
      if (empIndex == -1) continue

      if (schedule == "Schedule_Data_Admin" && (employee[empIndex][2] == "Admin" || employee[empIndex][2] == "All")) {
        employeeObj[key] = { [schedule]: [] }
      } else if (schedule == "Schedule_Data_FD" && (employee[empIndex][2] == "FD" || employee[empIndex][2] == "All")) {
        employeeObj[key] = { [schedule]: [] }
      } else if (schedule == "Schedule_Data_MA" && (employee[empIndex][2] == "MA" || employee[empIndex][2] == "All")) {
        employeeObj[key] = { [schedule]: [] }
      }
    }
  }



  let MASheet = ss.getSheetByName("Schedule_Data_MA")
  let MAData = MASheet.getRange(1, 1, MASheet.getLastRow(), MASheet.getLastColumn() - 3).getValues()

  let FDSheet = ss.getSheetByName("Schedule_Data_FD")
  let FDData = FDSheet.getRange(1, 1, FDSheet.getLastRow(), FDSheet.getLastColumn() - 3).getValues()

  let AdminSheet = ss.getSheetByName("Schedule_Data_Admin")
  let AdminData = AdminSheet.getRange(1, 1, AdminSheet.getLastRow(), AdminSheet.getLastColumn() - 3).getValues()



  if (schedule == "" || schedule == "All") {

    employeeObj = fetchEmployeeSchedule(employeeObj, MAData, "Schedule_Data_MA", year, monthSelected)
    employeeObj = fetchEmployeeSchedule(employeeObj, FDData, "Schedule_Data_FD", year, monthSelected)
    employeeObj = fetchEmployeeSchedule(employeeObj, AdminData, "Schedule_Data_Admin", year, monthSelected)


  } else {
    if (schedule == "Schedule_Data_MA") {
      employeeObj = fetchEmployeeSchedule(employeeObj, MAData, "Schedule_Data_MA", year, monthSelected)
    } else if (schedule == "Schedule_Data_FD") {
      employeeObj = fetchEmployeeSchedule(employeeObj, FDData, "Schedule_Data_FD", year, monthSelected)
    } else if (schedule == "Schedule_Data_Admin") {
      employeeObj = fetchEmployeeSchedule(employeeObj, AdminData, "Schedule_Data_Admin", year, monthSelected)
    }
  }



   //Logger.log(employeeObj)

  // return








  //let EmployeeSheet = ss.getSheetByName("Employee");
  //let AllEmployeeList = EmployeeSheet.getRange(1, 3, EmployeeSheet.getLastRow(), 3).getValues();
  //let EmployeeArr = AllEmployeeList.map(r => r[0].toString().trim())





  let maCalendarSheet = ss.getSheetByName("Calendar_MA")
  maCalendarSheet.getRange("A2:B2").setValues([[year, month]])
  SpreadsheetApp.flush()

  let fdCalendarSheet = ss.getSheetByName("Calendar_FD")
  fdCalendarSheet.getRange("A5:B5").setValues([[year, month]])
  SpreadsheetApp.flush()

  let adminCalendarSheet = ss.getSheetByName("Calendar_Admin")
  adminCalendarSheet.getRange("A4:B4").setValues([[year, month]])
  SpreadsheetApp.flush()


  let maPdf = null
  let fdPdf = null
  let adminPdf = null
  let ssId = ss.getId();

  try {
    let pdfName = month + " MA Schedule"
    maPdf = generatePDF(ssId, maCalendarSheet, pdfName, 1, 19, 0, 7)
  } catch (err) { maPdf = null }

  try {
    let pdfName = month + " FD Schedule"
    fdPdf = generatePDF(ssId, fdCalendarSheet, pdfName, 4, 19, 0, 7)
  } catch (err) { fdPdf = null }

  try {
    let pdfName = month + " Admin Schedule"
    adminPdf = generatePDF(ssId, adminCalendarSheet, pdfName, 3, 18, 0, 7)
  } catch (err) { adminPdf = null }



  //Logger.log(employeeObj)

  for (const emp in employeeObj) {
    const htmlTemplate = HtmlService.createTemplateFromFile('Email Temp');
    let emailFlage = false

    htmlTemplate["Schedule_Data_MA"] = []
    htmlTemplate["Schedule_Data_MA_Color"] = []
    htmlTemplate["Schedule_Data_FD"] = []
    htmlTemplate["Schedule_Data_FD_Color"] = []
    htmlTemplate["Schedule_Data_Admin"] = []
    htmlTemplate["Schedule_Data_Admin_Color"] = []

    //calendarColorArray[count].push('<td style="text-align:center; background-color: ' + '#cfe2f3" >')

    for (const sche in employeeObj[emp]) {
      if (employeeObj[emp][sche].length > 0) {
        let week = true
        let thisWeek = ""
        let lastWeek = ""
        // employeeObj[emp][sche].forEach(row=> {
        // })
        let calendarColorArray = []
        for (var c = 0; c < employeeObj[emp][sche].length; c++) {
          thisWeek = employeeObj[emp][sche][c][0]
          if (c == 0) {
            //Logger.log("Yes")
            lastWeek = employeeObj[emp][sche][c][0]
            week = true
          }

          if (thisWeek != lastWeek) {
            week = !week
          }

          if (week) {
            calendarColorArray.push([])
            for (var cr = 0; cr < employeeObj[emp][sche][c].length; cr++) {
              if (cr == 3) {
                if (employeeObj[emp][sche][c][cr] == "Gadsden") {
                  calendarColorArray[calendarColorArray.length - 1].push('<td style="text-align:center; background-color: ' + '#D3D3D3; color:#FF0000;" >')

                } else if (employeeObj[emp][sche][c][cr] == "Trussville") {
                  calendarColorArray[calendarColorArray.length - 1].push('<td style="text-align:center; background-color: ' + '#D3D3D3; color:#008000;" >')

                } else if (employeeObj[emp][sche][c][cr] == "Oxford") {
                  calendarColorArray[calendarColorArray.length - 1].push('<td style="text-align:center; background-color: ' + '#D3D3D3; color:#0000FF;" >')

                } else {
                  calendarColorArray[calendarColorArray.length - 1].push('<td style="text-align:center; background-color: ' + '#D3D3D3; color:#000000;" >')
                }
              } else {
                calendarColorArray[calendarColorArray.length - 1].push('<td style="text-align:center; background-color: ' + '#D3D3D3; color:#000000;" >')
              }
            }


          }

          if (!week) {
            calendarColorArray.push([])
            for (var cr = 0; cr < employeeObj[emp][sche][c].length; cr++) {
              //calendarColorArray.push('<td style="text-align:center; background-color: ' + '#FFFFFF" >')
              //calendarColorArray[calendarColorArray.length - 1].push('<td style="text-align:center; background-color: ' + '#FFFFFF; color:#000000;" >')

              if (cr == 3) {
                if (employeeObj[emp][sche][c][cr] == "Gadsden") {
                  calendarColorArray[calendarColorArray.length - 1].push('<td style="text-align:center; background-color: ' + '#FFFFFF; color:#FF0000;" >')

                } else if (employeeObj[emp][sche][c][cr] == "Trussville") {
                  calendarColorArray[calendarColorArray.length - 1].push('<td style="text-align:center; background-color: ' + '#FFFFFF; color:#008000;" >')

                } else if (employeeObj[emp][sche][c][cr] == "Oxford") {
                  calendarColorArray[calendarColorArray.length - 1].push('<td style="text-align:center; background-color: ' + '#FFFFFF; color:#0000FF;" >')

                } else {
                  calendarColorArray[calendarColorArray.length - 1].push('<td style="text-align:center; background-color: ' + '#FFFFFF; color:#000000;" >')
                }
              } else {
                calendarColorArray[calendarColorArray.length - 1].push('<td style="text-align:center; background-color: ' + '#FFFFFF; color:#000000;" >')
              }

            }
          }


          lastWeek = employeeObj[emp][sche][c][0]
        }

        htmlTemplate[sche + "_Color"] = calendarColorArray
        htmlTemplate[sche] = employeeObj[emp][sche]
        emailFlage = true
      }
    }

    //Logger.log("Email Flage: " + emailFlage)
    if (emailFlage == true) {

      let employeeIndex = employeeNames.indexOf(emp.toString())
      let employeeEmail = employee[employeeIndex][3]
      let employeePosition = employee[employeeIndex][2]

      htmlTemplate.empName = emp
      htmlTemplate.scheMonth = month
      htmlTemplate.scheYear = year

      const htmlBody = htmlTemplate.evaluate().getContent();

      // let employeeListIndex = EmployeeArr.indexOf(emp.toString())
      // let employeeEmail = AllEmployeeList[employeeListIndex][2].toString().trim()

      //Logger.log(employeeEmail)

      try {


        let attachments = [];

        for (const sche in employeeObj[emp]) {
          if (sche == "Schedule_Data_MA" && maPdf != null) {
            attachments.push(maPdf)
          }

          if (sche == "Schedule_Data_FD" && fdPdf != null) {
            attachments.push(fdPdf)
          }

          if (sche == "Schedule_Data_Admin" && adminPdf != null) {
            attachments.push(adminPdf)
          }
        }


        //let empIndex = employeeNames.indexOf(emp)


        // GmailApp.sendEmail(['rashid_khan143@yahoo.com'], "Monthly Schedule", "", {
        //   htmlBody: htmlBody,
        //   attachments: attachments
        // })

        let subject = employeePosition + " Schedule for " + month + " " + year

        //Logger.log("Admin: " + admin)
        if (admin == false) {

          try {

            GmailApp.sendEmail(employeeEmail.toString().trim(), subject, "", {
              bcc: "admin@ssdspc.com",
              htmlBody: htmlBody + "<p>This email is autogenerated.</p>",
              attachments: attachments
            })

            sheet.getRange(employeeIndex + 7, 5, 1, 3).setValues([[false, new Date(), month]])

            appendInEmailLog_([new Date(), new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds(), subject, 1, employeeEmail.toString().trim()])
          } catch (emailError) {
            appendInEmailLog_([new Date(), new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds(), subject, 1, employeeEmail.toString().trim(), emailError])
          }

        } else {
          try {
            GmailApp.sendEmail(ADMIN_HELP_EMAIL, subject, "", {
              bcc: "admin@ssdspc.com",
              htmlBody: htmlBody + "<p>This email is autogenerated.</p>",
              attachments: attachments
            })

            sheet.getRange(employeeIndex + 7, 5, 1, 1).setValue(false)

            appendInEmailLog_([new Date(), new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds(), subject, 1, ADMIN_HELP_EMAIL])

          } catch (emailError) {
            appendInEmailLog_([new Date(), new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds(), subject, 1, ADMIN_HELP_EMAIL, emailError])
          }

        }
      } catch (err) { Logger.log(err) }

    }
  }


  if (maPdf != null) {
    maPdf.setTrashed(true)
  }

  if (fdPdf != null) {
    maPdf.setTrashed(true)
  }

  if (adminPdf != null) {
    maPdf.setTrashed(true)
  }

}



function appendInEmailLog_(row) {

  let ELSS = SpreadsheetApp.openById("1ERfXs1YB-huftv_rIQJfy2OhaziiQU3rEtM5vmHr0nE");
  let ELSheet = getSheetByID_(ELSS, '9732092');
  ELSheet.appendRow(row)

}




function getSheetByID_(ss, sheetID) {
  let allSheets = ss.getSheets();

  return allSheets.filter(s => s.getSheetId().toString() == sheetID)[0]
}




function fetchEmployeeSchedule(employeeObj, Data, schedule, year, monthSelected) {

  Data.forEach(row => {
    if (isValidDate_(row[4])) {
      if (row[4].getFullYear() == year && row[4].getMonth() == monthSelected) {
        //Logger.log(row)
        for (var i = 8; i < row.length - 1; i++) {
          if (row[i] != "" && row[i] != null) {
            try {
              let formatName = row[i].toString().trim()
              if (formatName.toString().includes("Dr. K")) {
                formatName = "Dr. K"
              }

              //Logger.log(formatName)
              if (employeeObj.hasOwnProperty(formatName)) {
                if (employeeObj[formatName].hasOwnProperty(schedule)) {
                  let dateStr = Utilities.formatDate(row[4], "GMT-6", "MM/dd/yyyy")
                  employeeObj[formatName][schedule].push(["Week " + row[6], dateStr, row[5], row[9], row[8]])
                }
              }
            } catch (err) { }
          }
        }
      }
    }
  })


  return employeeObj
}




function createPDFTest() {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Calendar_MA");

  let outputFolder = DriveApp.getFolderById("1DuGmsZXByCd0QjK6FHCnJK1_ly2yX4Yt");

  let pdfName = "Test MA"

  generatePDF(ss.getId(), sheet, pdfName, outputFolder)

}



/**
 * Creates a PDF for the customer given sheet.
 * @param1 {string} ssId - Id of the Google Spreadsheet
 * @param2 {object} sheet - Sheet to be converted as PDF
 * @param3 {string} pdfName - File name of the PDF being created
 * @param4 {object} outputFolder - output folder where the pdf are stored
 * @return {file object} PDF file as a blob
 */
function generatePDF(ssId, sheet, pdfName, startRow, endRow, startCol, endCol) {
  //DEBUG && Logger.log("START PDF REPORT PROCESS STARTS");
  const fr = startRow, fc = startCol, lc = endCol, lr = endRow;
  const url = "https://docs.google.com/spreadsheets/d/" + ssId + "/export" +
    "?format=pdf&" +
    "size=Letter&" +
    "fzr=false&" +
    "portrait=true&" +
    "fitw=true&" +
    "gridlines=false&" +
    "printtitle=false&" +
    "top_margin=0.1&" +
    "bottom_margin=0.1&" +
    "left_margin=0.1&" +
    "right_margin=0.1&" +
    "sheetnames=false&" +
    "pagenum=Undefine&" +
    "attachment=true&" +
    "gid=" + sheet.getSheetId() + '&' +
    "r1=" + fr + "&c1=" + fc + "&r2=" + lr + "&c2=" + lc;

  const params = { method: "GET", headers: { "authorization": "Bearer " + ScriptApp.getOAuthToken() } };
  const blob = UrlFetchApp.fetch(url, params).getBlob().setName(pdfName + '.pdf');
  //const pdfFile = outputFolder.createFile(blob);
  const pdfFile = DriveApp.createFile(blob)
  //DEBUG && Logger.log("PDF REPORT CREATED");
  return pdfFile;
}













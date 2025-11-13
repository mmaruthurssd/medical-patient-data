

const ACTIVE_EMPLOYEE_SHEET = "Active_Employees_"

const EMPLOYEE_PAY_PERIOD_DETAILS_SHEET = "Employee Pay Period Details"
const EMPLOYEE_DROPDOWN_RANGE = "C13"


const TRAVEL_DATES_SHEET = "Travel_Dates"

const EMP_TRAVEL_SHEET = "EMP_Travel_Counts"

const PAYPERIOD_LIST = "Pay Period List"


const EMAIL_PAYCHECK_SHEET = "Email Paycheck"

const ADMIN_HELP_EMAIL = "admin@ssdspc.com"



//this is deployed from admin help
const WEBAPP_URL = "https://script.google.com/a/macros/ssdspc.com/s/AKfycbxBB6CN2pCIil4unn8BSQJeNr6sZHXzVtZdjiKVOQ1p0roSfv2pghVXBhfxCLvFFYMr5Q/exec"


// function onOpen() {
//   let ui = SpreadsheetApp.getUi();
//   let menu = ui.createMenu("Custom");
//   menu.addItem("Send Paycheck Email", "invoiceProcessMain").addToUi()
// }










function sendAllPaychecks() {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  //let sheet = ss.getSheetByName(EMPLOYEE_PAY_PERIOD_DETAILS_SHEET);
  let activeSheet = ss.getSheetByName(EMAIL_PAYCHECK_SHEET)

  let currentPayPeriod = activeSheet.getRange("B1").getValue()
  let activeEmployeesData = activeSheet.getRange(7, 1, activeSheet.getLastRow() - 6, 2).getValues()
  let selectedEmployees = activeEmployeesData.filter(r => r[0] != "" && r[0] != null);

  invoiceProcessMain(activeSheet, activeEmployeesData, selectedEmployees, currentPayPeriod, false)

}


function sendSelectedPaychecks() {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  //let sheet = ss.getSheetByName(EMPLOYEE_PAY_PERIOD_DETAILS_SHEET);
  let activeSheet = ss.getSheetByName(EMAIL_PAYCHECK_SHEET)

  let currentPayPeriod = activeSheet.getRange("B1").getValue()
  let activeEmployeesData = activeSheet.getRange(7, 1, activeSheet.getLastRow() - 6, 3).getValues()
  let selectedEmployees = activeEmployeesData.filter(r => r[0] != "" && r[0] != null && (r[2] == true || r[2] == "TRUE"));

  invoiceProcessMain(activeSheet, activeEmployeesData, selectedEmployees, currentPayPeriod, false)

}



function sendSelectedPaychecksToAdmin() {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  //let sheet = ss.getSheetByName(EMPLOYEE_PAY_PERIOD_DETAILS_SHEET);
  let activeSheet = ss.getSheetByName(EMAIL_PAYCHECK_SHEET)

  let currentPayPeriod = activeSheet.getRange("B1").getValue()
  let activeEmployeesData = activeSheet.getRange(7, 1, activeSheet.getLastRow() - 6, 3).getValues()
  let selectedEmployees = activeEmployeesData.filter(r => r[0] != "" && r[0] != null && r[1] != "" && r[1] != null && (r[2] == true || r[2] == "TRUE"));

  invoiceProcessMain(activeSheet, activeEmployeesData, selectedEmployees, currentPayPeriod, true)

}















function invoiceProcessMain(activeSheet, activeEmployeesData, selectedEmployees, currentPayPeriod, admin) {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let EmpPayPeriodSheet = ss.getSheetByName(EMPLOYEE_PAY_PERIOD_DETAILS_SHEET);
  //let currentPayPeriod = findingCurrentPayPeriod(ss)
  EmpPayPeriodSheet.getRange("C11").setValue(currentPayPeriod)


  // let activeEmployee = ss.getSheetByName(ACTIVE_EMPLOYEE_SHEET)
  // let activeEmployeesData = activeEmployee.getRange(2, 1, activeEmployee.getLastRow() - 1, 2).getValues().filter(r => r[0] != "" && r[0] != null);


  //Logger.log(activeEmployeesData)


  let travelDatesSheet = ss.getSheetByName(TRAVEL_DATES_SHEET);
  let travelDatesData = travelDatesSheet.getRange(7, 1, travelDatesSheet.getLastRow() - 6, travelDatesSheet.getLastColumn()).getValues();
  let travelEmpoyeeNames = travelDatesData.map(r => r[2])



  //here I am reading provider names and rates table for providers from sheet "EMP_Travel_Counts"
  let providerTravelSheet = ss.getSheetByName(EMP_TRAVEL_SHEET)
  let providers = providerTravelSheet.getRange("C46:C").getDisplayValues().filter(r => r[0] != "" && r[0] != null).map(r => r[0])
  let providersMilleageTable = providerTravelSheet.getRange("N46:R54").getDisplayValues()
  let milleageObj = {};
  providersMilleageTable.forEach(row => {
    milleageObj[row[0] + row[1]] = row[4]
  })


  SpreadsheetApp.flush()
  Utilities.sleep(5000)

  let arrayActiveEmployees = activeEmployeesData.map(r => r[0])



  selectedEmployees.forEach(emp => {
    EmpPayPeriodSheet.getRange(EMPLOYEE_DROPDOWN_RANGE).setValue(emp[0])
    SpreadsheetApp.flush()
    Utilities.sleep(3000)


    //let emp = "Christina Thomson"
    //let emp = EmpPayPeriodSheet.getRange("C13").getDisplayValue()

    let invoiceHeaders = EmpPayPeriodSheet.getRange("B11:C13").getDisplayValues()
    let payPeriodDetails = EmpPayPeriodSheet.getRange("B16:C").getDisplayValues()
    if (payPeriodDetails.length > 2) {
      if (payPeriodDetails[1][0] != "#N/A") {

        let totalAmount = payPeriodDetails[0][1]
        let allDetails = [];
        let count = 1;
        let rowColor = [];
        let travelDates = []
        let travelColors = []
        let employeeTravelIndex = travelEmpoyeeNames.indexOf(emp[0])
        for (var i = 1; i < payPeriodDetails.length; i++) {
          if (payPeriodDetails[i][0] != "" && payPeriodDetails[i][0] != null) {

            if (payPeriodDetails[i][0] != "Travel Dates" && payPeriodDetails[i][0] != "Trussville Dates" && payPeriodDetails[i][0] != "Gadsden Dates" && payPeriodDetails[i][0] != "Oxford Dates" && payPeriodDetails[i][0] != "Pell City Dates") {

              allDetails.push(payPeriodDetails[i])
              if (count % 2 == 0) {
                rowColor.push('<tr style="background-color:#cfe2f3;">')
              } else {
                rowColor.push('<tr>')
              }
              count++


            } else if (employeeTravelIndex > -1) {
              if (payPeriodDetails[i][0] == "Trussville Dates" && travelDatesData[employeeTravelIndex][4] != "" && travelDatesData[employeeTravelIndex][4] != null) {
                [travelDates, travelColors] = processTrussvileDates(travelDatesData, employeeTravelIndex, travelDates, travelColors, providers, milleageObj)

              } else if (payPeriodDetails[i][0] == "Gadsden Dates" && travelDatesData[employeeTravelIndex][5] != "" && travelDatesData[employeeTravelIndex][5] != null) {
                [travelDates, travelColors] = processGadsenDates(travelDatesData, employeeTravelIndex, travelDates, travelColors, providers, milleageObj)

              } else if (payPeriodDetails[i][0] == "Oxford Dates" && travelDatesData[employeeTravelIndex][6] != "" && travelDatesData[employeeTravelIndex][6] != null) {
                [travelDates, travelColors] = processOxfordDates(travelDatesData, employeeTravelIndex, travelDates, travelColors, providers, milleageObj)

              } else if (payPeriodDetails[i][0] == "Pell City Dates" && travelDatesData[employeeTravelIndex][7] != "" && travelDatesData[employeeTravelIndex][7] != null) {
                [travelDates, travelColors] = processPellDates(travelDatesData, employeeTravelIndex, travelDates, travelColors)

              }

            }
          }
        }





        //formating travel details
        travelDates.sort(function (a, b) {
          return a[0] - b[0]
        })


        let formatedTravelDates = [];
        travelDates.forEach(location => {
          let weekStr = "Week " + parseInt(Utilities.formatDate(location[0], "GMT-6", "w"));
          //let dayName = Utilities.formatDate(location[0], "GMT-6", "dddd")
          let dayName = location[0].toLocaleDateString('en-US', { weekday: 'short' });
          let locationDate = Utilities.formatDate(location[0], "GMT-6", "MM/dd/yyyy")
          formatedTravelDates.push([weekStr, dayName, locationDate, location[1], location[2]])
        })

        travelColors = applyCSStoTravelTable(formatedTravelDates)
        //return

        // Logger.log(travelDatesData)
        // Logger.log(employeeTravelIndex)

        let providerTravelCounts = [];
        let filterAllDetails = []
        if (employeeTravelIndex > -1 && providers.indexOf(travelDatesData[employeeTravelIndex][2]) > -1) {
          //allDetails

          allDetails.forEach(allD => {
            if (allD[0] == "Mileage Reimbursement (To be Paid Separately)") {
              providerTravelCounts.push(allD)

            } else if (allD[0] == "Trussville Count") {
              providerTravelCounts.push(allD)

            } else if (allD[0] == "Gadsden Count") {
              providerTravelCounts.push(allD)

            } else if (allD[0] == "Oxford Count") {
              providerTravelCounts.push(allD)

            } else if (allD[0] == "Pell City Count") {
              providerTravelCounts.push(allD)

            } else if (allD[0] == "Days Worked") {
              providerTravelCounts.push(allD)

            } else {
              filterAllDetails.push(allD)
            }

          })
        } else {
          filterAllDetails = allDetails
        }







        //https://drive.google.com/file/d/1k2fEmlglN-NK4JFkSu4sYH1QgQnKsFeW/view?usp=drive_link
        if (allDetails.length > 0) {

          // let image = DriveApp.getFileById("1k2fEmlglN-NK4JFkSu4sYH1QgQnKsFeW").getAs("image/png");
          // let emailImages = { "logo": image };

          const htmlTemplate = HtmlService.createTemplateFromFile('Invoice Email');

          htmlTemplate.invoiceHeaders = invoiceHeaders;
          htmlTemplate.invoiceTotal = totalAmount;
          htmlTemplate.allDetails = filterAllDetails;
          htmlTemplate.rowColor = rowColor;


          htmlTemplate.providerTravelCounts = providerTravelCounts;

          htmlTemplate.travelDates = formatedTravelDates;
          htmlTemplate.travelColors = travelColors;

          const htmlBody = htmlTemplate.evaluate().getContent();
          try {

            let indexOfActiveEmployee = arrayActiveEmployees.indexOf(emp[0])
            if (admin == false) {
              invoiceEmailProcess(htmlBody, emp[1], currentPayPeriod, emp[0])
              //invoiceEmailProcess(htmlBody, ["agonzalez@ssdspc.com", "mm@ssdspc.com", "mfatima@ssdspc.com", "rashid_khan143@yahoo.com"], currentPayPeriod)
              activeSheet.getRange(indexOfActiveEmployee + 7, 3, 1, 3).setValues([[false, new Date(), currentPayPeriod]])
            } else {
              invoiceEmailProcess(htmlBody, ADMIN_HELP_EMAIL, currentPayPeriod, emp[0])
              activeSheet.getRange(indexOfActiveEmployee + 7, 3, 1, 1).setValue(false)
            }

          } catch (err) { Logger.log(emp[0] + ": " + err) }
        }


      }

    }



  })



}




function applyCSStoTravelTable(formatedTravelDates) {
  let travelColors = []
  let week = true
  let thisWeek = ""
  let lastWeek = ""

  for (var c = 0; c < formatedTravelDates.length; c++) {
    thisWeek = formatedTravelDates[c][0]
    if (c == 0) {
      //Logger.log("Yes")
      lastWeek = formatedTravelDates[c][0]
      week = true
    }

    if (thisWeek != lastWeek) {
      week = !week
    }

    if (week) {
      travelColors.push([])
      for (var cr = 0; cr < formatedTravelDates[c].length; cr++) {
        if (cr == 3) {
          if (formatedTravelDates[c][cr] == "Gadsden") {
            travelColors[travelColors.length - 1].push('<td style="text-align:center; border: 1px solid #96D4D4; background-color: ' + '#D3D3D3; color:#FF0000;" >')

          } else if (formatedTravelDates[c][cr] == "Trussville") {
            travelColors[travelColors.length - 1].push('<td style="text-align:center; border: 1px solid #96D4D4; background-color: ' + '#D3D3D3; color:#008000;" >')

          } else if (formatedTravelDates[c][cr] == "Oxford") {
            travelColors[travelColors.length - 1].push('<td style="text-align:center; border: 1px solid #96D4D4; background-color: ' + '#D3D3D3; color:#0000FF;" >')

            // travelColors.push(['<td style="text-align:center; border: 1px solid #96D4D4; " >', '<td style="text-align:center; color:#0000FF; border: 1px solid #96D4D4; " >', '<td style="text-align:center; border: 1px solid #96D4D4; " >'])

          } else {
            travelColors[travelColors.length - 1].push('<td style="text-align:center; border: 1px solid #96D4D4; background-color: ' + '#D3D3D3; color:#000000;" >')
          }
        } else {
          travelColors[travelColors.length - 1].push('<td style="text-align:center; border: 1px solid #96D4D4; background-color: ' + '#D3D3D3; color:#000000;" >')
        }
      }


    }

    if (!week) {
      travelColors.push([])
      for (var cr = 0; cr < formatedTravelDates[c].length; cr++) {
        //travelColors.push('<td style="text-align:center; background-color: ' + '#FFFFFF" >')
        //travelColors[travelColors.length - 1].push('<td style="text-align:center; background-color: ' + '#FFFFFF; color:#000000;" >')

        if (cr == 3) {
          if (formatedTravelDates[c][cr] == "Gadsden") {
            travelColors[travelColors.length - 1].push('<td style="text-align:center; border: 1px solid #96D4D4; background-color: ' + '#FFFFFF; color:#FF0000;" >')

          } else if (formatedTravelDates[c][cr] == "Trussville") {
            travelColors[travelColors.length - 1].push('<td style="text-align:center; border: 1px solid #96D4D4; background-color: ' + '#FFFFFF; color:#008000;" >')

          } else if (formatedTravelDates[c][cr] == "Oxford") {
            travelColors[travelColors.length - 1].push('<td style="text-align:center; border: 1px solid #96D4D4; background-color: ' + '#FFFFFF; color:#0000FF;" >')

          } else {
            travelColors[travelColors.length - 1].push('<td style="text-align:center; border: 1px solid #96D4D4; background-color: ' + '#FFFFFF; color:#000000;" >')
          }
        } else {
          travelColors[travelColors.length - 1].push('<td style="text-align:center; border: 1px solid #96D4D4; background-color: ' + '#FFFFFF; color:#000000;" >')
        }

      }
    }


    lastWeek = formatedTravelDates[c][0]
  }


  return travelColors
}






function processPellDates(travelDatesData, employeeTravelIndex, travelDates, travelColors) {
  let pellDates = travelDatesData[employeeTravelIndex][7].split(",").map(d => d.toString().trim())

  pellDates.forEach(d => {
    travelDates.push([new Date(d), "Pell City", "-"])
    //travelColors.push('<td style="text-align:center;" >')
    //travelColors.push(['<td style="text-align:center; border: 1px solid #96D4D4; " >', '<td style="text-align:center; border: 1px solid #96D4D4; " >', '<td style="text-align:center; border: 1px solid #96D4D4; " >'])
  })


  return [travelDates, travelColors]

}




function processOxfordDates(travelDatesData, employeeTravelIndex, travelDates, travelColors, providers, milleageObj) {
  let oxfordDates = travelDatesData[employeeTravelIndex][6].split(",").map(d => d.toString().trim())
  if (travelDatesData[employeeTravelIndex][3] == "Oxford") {
    oxfordDates.forEach(d => {
      travelDates.push([new Date(d), "Oxford", "-"])
      //travelColors.push(['<td style="text-align:center; border: 1px solid #96D4D4; " >', '<td style="text-align:center; color:#0000FF; border: 1px solid #96D4D4; " >', '<td style="text-align:center; border: 1px solid #96D4D4; " >'])
    })
  } else {
    oxfordDates.forEach(d => {

      if (providers.indexOf(travelDatesData[employeeTravelIndex][2]) > -1) {
        travelDates.push([new Date(d), "Oxford", milleageObj[travelDatesData[employeeTravelIndex][3] + "Oxford"]])
        //travelColors.push(['<td style="text-align:center; border: 1px solid #96D4D4; " >', '<td style="text-align:center; color:#0000FF; border: 1px solid #96D4D4; " >', '<td style="text-align:center; border: 1px solid #96D4D4; " >'])

      } else {
        travelDates.push([new Date(d), "Oxford", "$45"])
        //travelColors.push(['<td style="text-align:center; border: 1px solid #96D4D4; " >', '<td style="text-align:center; color:#0000FF; border: 1px solid #96D4D4; " >', '<td style="text-align:center; border: 1px solid #96D4D4; " >'])
      }
    })
  }

  return [travelDates, travelColors]

}




function processGadsenDates(travelDatesData, employeeTravelIndex, travelDates, travelColors, providers, milleageObj) {
  let gadsenDates = travelDatesData[employeeTravelIndex][5].split(",").map(d => d.toString().trim())
  if (travelDatesData[employeeTravelIndex][3] == "Gadsden") {
    gadsenDates.forEach(d => {
      travelDates.push([new Date(d), "Gadsden", "-"])
      //travelColors.push('<td style="text-align:center; color:#FF0000;" >')
      //travelColors.push(['<td style="text-align:center; border: 1px solid #96D4D4; " >', '<td style="text-align:center; color:#FF0000; border: 1px solid #96D4D4; " >', '<td style="text-align:center; border: 1px solid #96D4D4; " >'])
    })
  } else {
    gadsenDates.forEach(d => {
      if (providers.indexOf(travelDatesData[employeeTravelIndex][2]) > -1) {
        travelDates.push([new Date(d), "Gadsden", milleageObj[travelDatesData[employeeTravelIndex][3] + "Gadsden"]])
        //travelColors.push(['<td style="text-align:center; border: 1px solid #96D4D4; " >', '<td style="text-align:center; color:#FF0000; border: 1px solid #96D4D4; " >', '<td style="text-align:center; border: 1px solid #96D4D4; " >'])

      } else {
        travelDates.push([new Date(d), "Gadsden", "$45"])
        //travelColors.push(['<td style="text-align:center; border: 1px solid #96D4D4; " >', '<td style="text-align:center; color:#FF0000; border: 1px solid #96D4D4; " >', '<td style="text-align:center; border: 1px solid #96D4D4; " >'])
      }
    })
  }

  return [travelDates, travelColors]

}




function processTrussvileDates(travelDatesData, employeeTravelIndex, travelDates, travelColors, providers, milleageObj) {
  let trussvileDates = travelDatesData[employeeTravelIndex][4].split(",").map(d => d.toString().trim())
  if (travelDatesData[employeeTravelIndex][3] == "Trussville") {
    trussvileDates.forEach(d => {
      travelDates.push([new Date(d), "Trussville", "-"])
      //travelColors.push('<td style="text-align:center; color:#008000;" >')
      //travelColors.push(['<td style="text-align:center; border: 1px solid #96D4D4; " >', '<td style="text-align:center; color:#008000; border: 1px solid #96D4D4; " >', '<td style="text-align:center; border: 1px solid #96D4D4; " >'])
    })
  } else {
    trussvileDates.forEach(d => {
      if (providers.indexOf(travelDatesData[employeeTravelIndex][2]) > -1) {
        travelDates.push([new Date(d), "Trussville", milleageObj[travelDatesData[employeeTravelIndex][3] + "Trussville"]])
        //travelColors.push(['<td style="text-align:center; border: 1px solid #96D4D4; " >', '<td style="text-align:center; color:#008000; border: 1px solid #96D4D4; " >', '<td style="text-align:center; border: 1px solid #96D4D4; " >'])

      } else {
        travelDates.push([new Date(d), "Trussville", "$45"])
        //travelColors.push(['<td style="text-align:center; border: 1px solid #96D4D4; " >', '<td style="text-align:center; color:#008000; border: 1px solid #96D4D4; " >', '<td style="text-align:center; border: 1px solid #96D4D4; " >'])
      }
    })
  }

  return [travelDates, travelColors]

}










function invoiceEmailProcess(htmlBody, emailAddress, currentPayPeriod, name) {

  //let subject = "Paycheck Review " + currentPayPeriod

  let subject = "Paycheck " + currentPayPeriod + " Summary for " + name + " - Please review for accuracy"

  try {
    GmailApp.sendEmail(emailAddress, subject, "", {
      bcc: "admin@ssdspc.com",
      htmlBody: htmlBody + `<p>This email is autogenerated.</p>`,

    })
    appendInEmailLog_([new Date(), new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds(), subject, 1, emailAddress])

  } catch (emailError) {
    appendInEmailLog_([new Date(), new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds(), subject, 1, emailAddress, emailError])
  }
}





function appendInEmailLog_(row) {

  let ELSS = SpreadsheetApp.openById("1ERfXs1YB-huftv_rIQJfy2OhaziiQU3rEtM5vmHr0nE");
  let ELSheet = getSheetByID_(ELSS, '9732092');
  ELSheet.appendRow(row)

}







function findingCurrentPayPeriod(ss) {

  let payperiodListSheet = ss.getSheetByName(PAYPERIOD_LIST);
  let allPayPeriods = payperiodListSheet.getRange(2, 1, payperiodListSheet.getLastRow() - 1, 2).getValues();
  let todayDate = new Date();

  let day = todayDate.getDay();

  if (day == 0) {
    day = 7
  }




  let thisWeekMonday = new Date()
  thisWeekMonday.setDate(thisWeekMonday.getDate() - (day - 1))


  let lastWeekMonday = new Date()
  lastWeekMonday.setDate(lastWeekMonday.getDate() - (day - 1) - 7)


  let thisWeekMondyStr = Utilities.formatDate(thisWeekMonday, "GMT-6", "yyyy-MM-dd")
  let lastWeekMondyStr = Utilities.formatDate(lastWeekMonday, "GMT-6", "yyyy-MM-dd")

  let payPeriod = ""
  for (var i = 0; i < allPayPeriods.length; i++) {
    if (isValidDate_(allPayPeriods[i][0])) {
      let sheetDate = Utilities.formatDate(allPayPeriods[i][0], "GMT-6", "yyyy-MM-dd")
      if (thisWeekMondyStr == sheetDate || lastWeekMondyStr == sheetDate) {
        payPeriod = allPayPeriods[i][1]
        return payPeriod
      }
    }
  }

  return payPeriod

}












function getWeekTest() {
  let todayDate = new Date('1/29/2024');
  //let weekNo = todayDate.getWeekYear();
  Logger.log(todayDate)

  var weekNum = parseInt(Utilities.formatDate(todayDate, "GMT", "w"));

  Logger.log(weekNum)
}














